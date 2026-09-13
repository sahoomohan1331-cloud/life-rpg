"use client";

import { useCreateTask } from "@/hooks/use-tasks";
import { toast } from "sonner";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Difficulty, AttributeName, TaskType } from "@/types";

export interface StarterQuest {
  title: string;
  description: string;
  difficulty: Difficulty;
  attributeName: AttributeName;
  type: TaskType;
  emoji: string;
  xp: number;
}

export const STARTER_QUEST_LIST: StarterQuest[] = [
  {
    title: "Drink a tall glass of water",
    description: "Hydrate your body to sharpen your reflexes",
    difficulty: "EASY",
    attributeName: "VITALITY",
    type: "HABIT",
    emoji: "💧",
    xp: 10,
  },
  {
    title: "Read for 15 minutes",
    description: "Expand your intellect and focus your mind",
    difficulty: "MEDIUM",
    attributeName: "WISDOM",
    type: "DAILY",
    emoji: "📖",
    xp: 25,
  },
  {
    title: "Tidy up your study workspace",
    description: "An organized desk brings clear thought",
    difficulty: "EASY",
    attributeName: "CRAFT",
    type: "QUEST",
    emoji: "🧹",
    xp: 10,
  },
  {
    title: "Take a 10-minute outdoor walk",
    description: "Step away from the screen for fresh air",
    difficulty: "MEDIUM",
    attributeName: "VITALITY",
    type: "HABIT",
    emoji: "🚶‍♂️",
    xp: 25,
  },
];

export function StarterQuestsQuickPack() {
  const createTask = useCreateTask();
  const [addingTitle, setAddingTitle] = useState<string | null>(null);

  const handleAdd = async (quest: StarterQuest) => {
    if (createTask.isPending) return;
    setAddingTitle(quest.title);
    try {
      await createTask.mutateAsync({
        title: quest.title,
        description: quest.description,
        difficulty: quest.difficulty,
        attributeName: quest.attributeName,
        type: quest.type,
      });
      toast.success(`Inscribed "${quest.title}"! (+${quest.xp} XP reward ready)`);
    } catch {
      toast.error("Failed to inscribe quest");
    } finally {
      setAddingTitle(null);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-amber-warm/15">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-brown-soft uppercase tracking-wider mb-2.5">
        <Sparkles className="h-3.5 w-3.5 text-amber-warm" />
        <span>Quick-Start Starter Quests</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
        {STARTER_QUEST_LIST.map((q) => {
          const isAdding = addingTitle === q.title;
          return (
            <button
              key={q.title}
              onClick={() => handleAdd(q)}
              disabled={createTask.isPending}
              className="flex items-center gap-2.5 p-2.5 rounded-[10px] bg-cream/70 hover:bg-cream border border-amber-warm/20 hover:border-amber-warm/40 transition-all text-left group disabled:opacity-60"
            >
              <span className="text-xl flex-shrink-0" aria-hidden="true">
                {q.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-brown-dark group-hover:text-amber-warm transition-colors truncate">
                  {q.title}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-brown-soft">
                  <span className="font-semibold text-green-muted font-mono">+{q.xp} XP</span>
                  <span>·</span>
                  <span>{q.attributeName}</span>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full bg-amber-warm/15 text-amber-warm flex items-center justify-center flex-shrink-0 group-hover:bg-amber-warm group-hover:text-cream transition-colors">
                {isAdding ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
