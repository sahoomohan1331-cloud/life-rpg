"use client";

import { useState, useCallback } from "react";
import { useTasks, useDeleteTask } from "@/hooks/use-tasks";
import { useCompleteTask } from "@/hooks/use-complete-task";
import { useSoundContext } from "@/components/providers/sound-provider";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LevelUpModal } from "@/components/shared/level-up-modal";
import { StarterQuestsQuickPack } from "@/components/dashboard/starter-quests";
import { CreateQuestModal } from "@/components/quests/create-quest-modal";
import {
  Plus,
  Check,
  Trash2,
  Scroll,
  Sparkles,
  BookOpen,
  Heart,
  Wrench,
  Filter,
} from "lucide-react";
import type { Task } from "@/types";

const ATTR_ICONS = {
  WISDOM: BookOpen,
  VITALITY: Heart,
  CRAFT: Wrench,
} as const;

const DIFFICULTY_COLORS = {
  EASY: "text-green-muted bg-green-muted/10 border-green-muted/20",
  MEDIUM: "text-amber-warm bg-amber-warm/10 border-amber-warm/20",
  HARD: "text-ember bg-ember/10 border-ember/20",
};

const DIFFICULTY_XP = { EASY: 10, MEDIUM: 25, HARD: 50 };

export default function QuestsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const { data: tasks, isLoading } = useTasks(
    filter !== "all" ? { type: filter as "QUEST" | "DAILY" | "HABIT" } : undefined
  );
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();
  const { playComplete, playLevelUp } = useSoundContext();
  const [floatingXP, setFloatingXP] = useState<{ id: string; xp: number } | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);

  const handleComplete = useCallback(
    async (taskId: string) => {
      try {
        const result = await completeTask.mutateAsync(taskId);
        playComplete();

        setFloatingXP({ id: taskId, xp: result.xpAwarded });
        setTimeout(() => setFloatingXP(null), 1500);

        const announcer = document.getElementById("announcements");
        if (announcer) {
          announcer.textContent = `Quest completed! +${result.xpAwarded} XP, +${result.goldAwarded} Gold`;
        }

        if (result.leveledUp) {
          playLevelUp();
          setLevelUpData({ level: result.newLevel, title: result.newTitle });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to complete quest");
      }
    },
    [completeTask, playComplete, playLevelUp]
  );

  const handleDelete = useCallback(
    async (taskId: string) => {
      if (!confirm("Delete this quest? This cannot be undone.")) return;
      try {
        await deleteTask.mutateAsync(taskId);
        toast.success("Quest deleted");
      } catch {
        toast.error("Failed to delete quest");
      }
    },
    [deleteTask]
  );

  const incompleteTasks = (tasks || []).filter((t) => !t.completedAt);
  const completedTasks = (tasks || []).filter((t) => t.completedAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-brown-deep">Quests</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-warm text-brown-deep font-semibold rounded-[8px] hover:bg-amber-dark transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>New Quest</span>
          <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-brown-deep/15 text-brown-deep font-mono font-normal">
            Q
          </kbd>
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2" role="tablist" aria-label="Filter quests by type">
        {["all", "QUEST", "DAILY", "HABIT"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            role="tab"
            aria-selected={filter === f}
            className={`px-3 py-1.5 text-sm rounded-[6px] font-medium transition-colors ${
              filter === f
                ? "bg-amber-warm/20 text-brown-deep"
                : "text-brown-soft hover:text-brown-dark hover:bg-amber-warm/10"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Quest List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 skeleton-pulse rounded-[12px]" />
          ))}
        </div>
      ) : incompleteTasks.length === 0 && completedTasks.length === 0 ? (
        <div className="text-center py-12 px-6 bg-parchment rounded-[16px] border border-amber-warm/15 max-w-xl mx-auto">
          <Scroll className="h-12 w-12 text-amber-warm/30 mx-auto mb-3" aria-hidden="true" />
          <h3 className="font-heading text-xl font-semibold text-brown-deep mb-1">
            Your Quest Log is Empty
          </h3>
          <p className="text-sm text-brown-soft mb-4">
            Begin your journey by creating a custom quest or picking a starter quest below.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-amber-warm text-cream font-semibold rounded-[8px] hover:bg-amber-warm/90 transition-colors shadow-xs text-sm inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Inscribe Custom Quest
          </button>
          <StarterQuestsQuickPack />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active quests */}
          {incompleteTasks.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-brown-soft uppercase tracking-wider mb-3">
                Active ({incompleteTasks.length})
              </h2>
              <ul className="space-y-2">
                <AnimatePresence>
                  {incompleteTasks.map((task) => (
                    <QuestCard
                      key={task.id}
                      task={task}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                      isPending={completeTask.isPending}
                      floatingXP={floatingXP && floatingXP.id === task.id ? floatingXP.xp : null}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          )}

          {/* Completed quests */}
          {completedTasks.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-brown-soft uppercase tracking-wider mb-3">
                Completed ({completedTasks.length})
              </h2>
              <ul className="space-y-2 opacity-60">
                {completedTasks.slice(0, 10).map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 bg-parchment rounded-[12px] px-4 py-3 border border-amber-warm/10"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-muted/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-green-muted" aria-hidden="true" />
                    </div>
                    <span className="text-sm text-brown-soft line-through flex-1 truncate">
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateQuestModal onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>

      <LevelUpModal
        isOpen={!!levelUpData}
        level={levelUpData?.level ?? 1}
        title={levelUpData?.title ?? ""}
        onClose={() => setLevelUpData(null)}
      />
    </div>
  );
}

// ─── Quest Card ───────────────────────────────────

function QuestCard({
  task,
  onComplete,
  onDelete,
  isPending,
  floatingXP,
}: {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
  floatingXP: number | null;
}) {
  const AttrIcon = ATTR_ICONS[task.attributeName as keyof typeof ATTR_ICONS] || BookOpen;
  const diffKey = (task.difficulty as keyof typeof DIFFICULTY_COLORS) in DIFFICULTY_COLORS
    ? (task.difficulty as keyof typeof DIFFICULTY_COLORS)
    : "MEDIUM";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30, height: 0 }}
      className="relative bg-parchment rounded-[12px] px-4 py-3 border border-amber-warm/10 hover:border-amber-warm/25 transition-all group"
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onComplete(task.id)}
          disabled={isPending}
          className="mt-0.5 w-5 h-5 rounded-full border-2 border-amber-warm/40 hover:border-green-muted hover:bg-green-muted/10 transition-all flex items-center justify-center flex-shrink-0 group"
          aria-label={`Complete quest: ${task.title}`}
        >
          <Check className="h-3.5 w-3.5 text-green-muted opacity-0 group-hover:opacity-60 transition-opacity" aria-hidden="true" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-brown-dark">{task.title}</p>
          {task.description && (
            <p className="text-sm text-brown-soft mt-0.5 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[diffKey]}`}>
              {task.difficulty}
            </span>
            <span className="text-xs text-brown-soft flex items-center gap-1">
              <AttrIcon className="h-3 w-3" aria-hidden="true" />
              {task.attributeName}
            </span>
            <span className="text-xs text-brown-soft">
              {task.type}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-mono text-green-muted font-medium">
            +{DIFFICULTY_XP[diffKey]} XP
          </span>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-brown-soft/40 hover:text-ember transition-colors opacity-0 group-hover:opacity-100"
            aria-label={`Delete quest: ${task.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Floating XP */}
      <AnimatePresence>
        {floatingXP && (
          <motion.div
            className="absolute top-0 right-12 font-heading text-lg font-bold text-green-muted pointer-events-none"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            <Sparkles className="h-4 w-4 inline mr-1" aria-hidden="true" />
            +{floatingXP} XP
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
