import { Difficulty } from "@prisma/client";

// ─── XP & LEVELING ────────────────────────────────

/** XP required to advance FROM level n TO level n+1 */
export function xpForLevel(n: number): number {
  return Math.floor(100 * Math.pow(n, 1.5));
}

/** Total cumulative XP to reach level n from level 1 */
export function totalXpForLevel(n: number): number {
  let total = 0;
  for (let i = 1; i < n; i++) {
    total += xpForLevel(i);
  }
  return total;
}

/** Given current level and xp within that level, compute if there's a level-up */
export function computeLevelUp(
  currentLevel: number,
  currentXp: number
): { newLevel: number; remainingXp: number; didLevelUp: boolean } {
  let level = currentLevel;
  let xp = currentXp;
  let didLevelUp = false;

  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level++;
    didLevelUp = true;
  }

  return { newLevel: level, remainingXp: xp, didLevelUp };
}

// ─── DIFFICULTY REWARDS ───────────────────────────

export const DIFFICULTY_REWARDS: Record<Difficulty, { xp: number; gold: number }> = {
  EASY: { xp: 10, gold: 5 },
  MEDIUM: { xp: 25, gold: 12 },
  HARD: { xp: 50, gold: 25 },
} as const;

// ─── STREAK MULTIPLIER ───────────────────────────

export function getStreakMultiplier(streak: number): number {
  if (streak >= 100) return 1.5;
  if (streak >= 30) return 1.25;
  if (streak >= 7) return 1.1;
  return 1.0;
}

// ─── ANTI-BACKFILL ────────────────────────────────

/** 50% XP if the task was created more than 3 days ago */
export function getBackfillMultiplier(taskCreatedAt: Date, now: Date): number {
  const diffMs = now.getTime() - taskCreatedAt.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > 3 ? 0.5 : 1.0;
}

// ─── CAPS ─────────────────────────────────────────

export const DAILY_XP_CAP = 500;
export const COMPLETIONS_PER_MINUTE = 30;

// ─── TITLES ───────────────────────────────────────

const TITLE_THRESHOLDS = [
  { level: 30, title: "Legendary Hero" },
  { level: 25, title: "Grand Sage" },
  { level: 20, title: "Master of the Realm" },
  { level: 15, title: "Adept Practitioner" },
  { level: 10, title: "Seasoned Explorer" },
  { level: 5, title: "Apprentice Scholar" },
  { level: 1, title: "Novice Adventurer" },
] as const;

export function getTitleForLevel(level: number): string {
  for (const threshold of TITLE_THRESHOLDS) {
    if (level >= threshold.level) {
      return threshold.title;
    }
  }
  return "Novice Adventurer";
}

// ─── ROOM ELEMENTS ────────────────────────────────

export const ROOM_ELEMENTS = [
  { level: 1, id: "desk", label: "Wooden Desk" },
  { level: 1, id: "lamp-off", label: "Dim Lamp" },
  { level: 2, id: "plant-small", label: "Small Plant" },
  { level: 3, id: "book-1", label: "First Book" },
  { level: 5, id: "lamp-on", label: "Warm Lamp" },
  { level: 7, id: "cat", label: "Cozy Cat" },
  { level: 10, id: "bookshelf", label: "Full Bookshelf" },
  { level: 13, id: "rug", label: "Patterned Rug" },
  { level: 15, id: "window-sunset", label: "Sunset Window" },
  { level: 20, id: "ambient-glow", label: "Ambient Glow" },
] as const;

export function getUnlockedRoomElements(level: number) {
  return ROOM_ELEMENTS.filter((el) => level >= el.level);
}
