import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limiter";
import {
  DIFFICULTY_REWARDS,
  DAILY_XP_CAP,
  getStreakMultiplier,
  getBackfillMultiplier,
  computeLevelUp,
  getTitleForLevel,
  xpForLevel,
} from "@/lib/progression";
import { toDateString } from "@/lib/utils";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id: taskId } = await params;

    // ── Rate limit check ──────────────────────────
    const rateCheck = checkRateLimit(userId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: `Too many completions. Try again in ${Math.ceil((rateCheck.retryAfterMs || 0) / 1000)}s`,
          },
        },
        { status: 429 }
      );
    }

    // ── All reward logic inside a single transaction ──
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch task and verify ownership
      const task = await tx.task.findFirst({
        where: { id: taskId, userId },
      });

      if (!task) {
        throw new Error("NOT_FOUND");
      }

      // For QUEST type, prevent double completion
      if (task.type === "QUEST" && task.completedAt) {
        throw new Error("ALREADY_COMPLETED");
      }

      // 2. Fetch character
      const character = await tx.character.findUnique({
        where: { userId },
      });

      if (!character) {
        throw new Error("NOT_FOUND");
      }

      // 3. Check daily XP cap
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysCompletions = await tx.completion.aggregate({
        where: {
          userId,
          completedAt: { gte: today, lt: tomorrow },
        },
        _sum: { xpAwarded: true },
      });

      const todaysXp = todaysCompletions._sum.xpAwarded || 0;

      if (todaysXp >= DAILY_XP_CAP) {
        throw new Error("DAILY_CAP");
      }

      // 4. Fetch streak
      const globalStreak = await tx.streak.findFirst({
        where: { userId, taskId: null },
      });

      const streakCurrent = globalStreak?.current || 0;

      // 5. Calculate rewards
      const baseReward = DIFFICULTY_REWARDS[task.difficulty];
      const streakMultiplier = getStreakMultiplier(streakCurrent);
      const backfillMultiplier = getBackfillMultiplier(task.createdAt, new Date());

      let xpAwarded = Math.floor(
        baseReward.xp * streakMultiplier * backfillMultiplier
      );
      const goldAwarded = baseReward.gold;

      // Enforce daily cap
      const remainingCap = DAILY_XP_CAP - todaysXp;
      if (xpAwarded > remainingCap) {
        xpAwarded = remainingCap;
      }

      // 6. Mark task as completed
      const now = new Date();
      if (task.type === "QUEST") {
        await tx.task.update({
          where: { id: taskId },
          data: { completedAt: now },
        });
      }

      // 7. Create completion record
      await tx.completion.create({
        data: {
          taskId,
          userId,
          xpAwarded,
          goldAwarded,
          completedAt: now,
        },
      });

      // 8. Update character XP and gold
      const newXp = character.xp + xpAwarded;
      const newTotalXp = character.totalXp + xpAwarded;
      const newGold = character.gold + goldAwarded;

      // 9. Check for level-up
      const levelResult = computeLevelUp(character.level, newXp);
      const newTitle = getTitleForLevel(levelResult.newLevel);

      await tx.character.update({
        where: { userId },
        data: {
          xp: levelResult.remainingXp,
          totalXp: newTotalXp,
          gold: newGold,
          level: levelResult.newLevel,
          title: newTitle,
        },
      });

      // 10. Update attribute XP and level
      const attribute = await tx.attribute.findFirst({
        where: { userId, name: task.attributeName },
      });

      let attributeLeveledUp = false;
      let attributeNewLevel = attribute?.level || 1;

      if (attribute) {
        const attrNewXp = attribute.xp + xpAwarded;
        const attrLevelResult = computeLevelUp(attribute.level, attrNewXp);

        await tx.attribute.update({
          where: { id: attribute.id },
          data: {
            xp: attrLevelResult.remainingXp,
            level: attrLevelResult.newLevel,
          },
        });

        attributeLeveledUp = attrLevelResult.didLevelUp;
        attributeNewLevel = attrLevelResult.newLevel;
      }

      // 11. Update streak
      const todayStr = toDateString(now);
      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = toDateString(yesterdayDate);

      let newStreakCurrent = 1;
      let newStreakLongest = globalStreak?.longest || 0;
      let isNewMilestone = false;
      let milestone: 7 | 30 | 100 | undefined;

      if (globalStreak) {
        const lastDateStr = globalStreak.lastCompletedDate
          ? toDateString(globalStreak.lastCompletedDate)
          : null;

        if (lastDateStr === todayStr) {
          // Already completed today, keep streak
          newStreakCurrent = globalStreak.current;
        } else if (lastDateStr === yesterdayStr) {
          // Consecutive day
          newStreakCurrent = globalStreak.current + 1;
        }
        // else: streak resets to 1

        newStreakLongest = Math.max(newStreakLongest, newStreakCurrent);

        // Check milestones
        const milestones = [100, 30, 7] as const;
        for (const m of milestones) {
          if (newStreakCurrent >= m && globalStreak.current < m) {
            isNewMilestone = true;
            milestone = m;
            break;
          }
        }

        await tx.streak.update({
          where: { id: globalStreak.id },
          data: {
            current: newStreakCurrent,
            longest: newStreakLongest,
            lastCompletedDate: now,
          },
        });
      }

      return {
        xpAwarded,
        goldAwarded,
        leveledUp: levelResult.didLevelUp,
        newLevel: levelResult.newLevel,
        newTitle,
        streakUpdate: {
          current: newStreakCurrent,
          longest: newStreakLongest,
          isNewMilestone,
          milestone,
        },
        attributeLeveledUp,
        attributeNewLevel,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Quest not found" } },
        { status: 404 }
      );
    }
    if (message === "ALREADY_COMPLETED") {
      return NextResponse.json(
        { success: false, error: { code: "ALREADY_COMPLETED", message: "Quest already completed" } },
        { status: 400 }
      );
    }
    if (message === "DAILY_CAP") {
      return NextResponse.json(
        { success: false, error: { code: "DAILY_CAP", message: "Daily XP cap reached (500 XP). Rest and come back tomorrow!" } },
        { status: 400 }
      );
    }

    console.error("POST /api/tasks/:id/complete error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to complete quest" } },
      { status: 500 }
    );
  }
}
