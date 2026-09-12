import type {
  AttributeName,
  Difficulty,
  TaskType,
  ItemCategory,
  Character,
  Attribute,
  Task,
  Completion,
  Streak,
  Item,
  InventoryItem,
} from "@prisma/client";

// Re-export Prisma types
export type {
  AttributeName,
  Difficulty,
  TaskType,
  ItemCategory,
  Character,
  Attribute,
  Task,
  Completion,
  Streak,
  Item,
  InventoryItem,
};

export type { CreateTaskInput, UpdateTaskInput } from "@/schemas/task";

// ─── API Response Types ───────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ─── Character with computed fields ───────────────

export interface CharacterWithProgress extends Character {
  xpToNextLevel: number;
  xpProgress: number; // 0-1 percentage
}

// ─── Attribute with computed fields ───────────────

export interface AttributeWithProgress extends Attribute {
  xpToNextLevel: number;
  xpProgress: number;
}

// ─── Task Completion Response ─────────────────────

export interface CompleteTaskResponse {
  xpAwarded: number;
  goldAwarded: number;
  leveledUp: boolean;
  newLevel: number;
  newTitle: string;
  streakUpdate: {
    current: number;
    longest: number;
    isNewMilestone: boolean;
    milestone?: 7 | 30 | 100;
  };
  attributeLeveledUp: boolean;
  attributeNewLevel: number;
}

// ─── Market Item with ownership ───────────────────

export interface MarketItem extends Item {
  owned: boolean;
  equipped: boolean;
}

// ─── Streak Data ──────────────────────────────────

export interface StreakData {
  globalStreak: {
    current: number;
    longest: number;
  };
  completionsByDay: Record<string, number>;
}

// ─── Task Filters ─────────────────────────────────

export interface TaskFilters {
  type?: TaskType;
  attributeName?: AttributeName;
  completed?: boolean;
}

// ─── Sound Settings ───────────────────────────────

export interface SoundSettings {
  enabled: boolean;
}
