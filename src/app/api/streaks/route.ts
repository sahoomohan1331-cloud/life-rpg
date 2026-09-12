import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toDateString } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    // Fetch global streak
    const globalStreak = await prisma.streak.findFirst({
      where: { userId: session.user.id, taskId: null },
    });

    // Fetch completions for the last 12 weeks (84 days)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const completions = await prisma.completion.findMany({
      where: {
        userId: session.user.id,
        completedAt: { gte: twelveWeeksAgo },
      },
      select: { completedAt: true },
    });

    // Group by date
    const completionsByDay: Record<string, number> = {};
    for (const c of completions) {
      const dateStr = toDateString(c.completedAt);
      completionsByDay[dateStr] = (completionsByDay[dateStr] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        globalStreak: {
          current: globalStreak?.current || 0,
          longest: globalStreak?.longest || 0,
        },
        completionsByDay,
      },
    });
  } catch (error) {
    console.error("GET /api/streaks error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch streaks" } },
      { status: 500 }
    );
  }
}
