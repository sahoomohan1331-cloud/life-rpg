"use client";

import { useState, useCallback } from "react";
import { useTasks, useCreateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useCompleteTask } from "@/hooks/use-complete-task";
import { useSoundContext } from "@/components/providers/sound-provider";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LevelUpModal } from "@/components/shared/level-up-modal";
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
  X,
  Loader2,
} from "lucide-react";
import { createTaskSchema } from "@/schemas/task";
import type { CreateTaskInput, Task } from "@/types";

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
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-warm text-brown-deep font-semibold rounded-[8px] hover:bg-amber-dark transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Quest
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
        <div className="text-center py-16 bg-parchment rounded-[16px] border border-amber-warm/15">
          <Scroll className="h-16 w-16 text-amber-warm/30 mx-auto mb-4" aria-hidden="true" />
          <h3 className="font-heading text-xl font-semibold text-brown-deep mb-2">
            No quests yet
          </h3>
          <p className="text-brown-soft mb-6">Create your first quest and start earning XP!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-2.5 bg-amber-warm text-brown-deep font-semibold rounded-[8px] hover:bg-amber-dark transition-colors"
          >
            Create Your First Quest
          </button>
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
  const AttrIcon = ATTR_ICONS[task.attributeName as keyof typeof ATTR_ICONS];

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
          className="w-7 h-7 mt-0.5 rounded-full border-2 border-amber-warm/30 flex items-center justify-center hover:border-green-muted hover:bg-green-muted/10 transition-all flex-shrink-0 disabled:opacity-50"
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
            <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[task.difficulty]}`}>
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
            +{DIFFICULTY_XP[task.difficulty]} XP
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

// ─── Create Quest Modal ──────────────────────────

function CreateQuestModal({ onClose }: { onClose: () => void }) {
  const createTask = useCreateTask();
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: "",
    description: "",
    difficulty: "MEDIUM",
    attributeName: "WISDOM",
    type: "QUEST",
    dueAt: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = createTaskSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        fieldErrors[key] = msgs?.[0] || "Invalid";
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await createTask.mutateAsync(parsed.data);
      toast.success("Quest created! 📜");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create quest");
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brown-deep/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        className="relative bg-parchment rounded-[16px] p-6 w-full max-w-lg shadow-xl border border-amber-warm/20"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-quest-title"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="create-quest-title" className="font-heading text-xl font-bold text-brown-deep">
            New Quest
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-brown-soft hover:text-brown-dark transition-colors rounded-[6px]"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="quest-title" className="block text-sm font-medium text-brown-dark mb-1">
              Quest Title
            </label>
            <input
              id="quest-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 bg-cream border border-amber-warm/30 rounded-[8px] text-brown-dark placeholder:text-brown-soft/50 focus:outline-none focus:ring-2 focus:ring-amber-warm/50"
              placeholder="e.g., Read 30 pages of a book"
              autoFocus
            />
            {errors.title && <p className="text-ember text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="quest-desc" className="block text-sm font-medium text-brown-dark mb-1">
              Description <span className="text-brown-soft">(optional)</span>
            </label>
            <textarea
              id="quest-desc"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 bg-cream border border-amber-warm/30 rounded-[8px] text-brown-dark placeholder:text-brown-soft/50 focus:outline-none focus:ring-2 focus:ring-amber-warm/50 h-20 resize-none"
              placeholder="Add details about this quest..."
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-brown-dark mb-1.5">Difficulty</label>
            <div className="flex gap-2">
              {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: d })}
                  className={`flex-1 py-2 text-sm rounded-[8px] border font-medium transition-all ${
                    formData.difficulty === d
                      ? DIFFICULTY_COLORS[d]
                      : "border-amber-warm/20 text-brown-soft hover:bg-cream"
                  }`}
                >
                  {d} ({DIFFICULTY_XP[d]} XP)
                </button>
              ))}
            </div>
          </div>

          {/* Attribute */}
          <div>
            <label className="block text-sm font-medium text-brown-dark mb-1.5">Attribute</label>
            <div className="flex gap-2">
              {(["WISDOM", "VITALITY", "CRAFT"] as const).map((a) => {
                const Icon = ATTR_ICONS[a];
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setFormData({ ...formData, attributeName: a })}
                    className={`flex-1 py-2 text-sm rounded-[8px] border font-medium transition-all flex items-center justify-center gap-1.5 ${
                      formData.attributeName === a
                        ? "bg-amber-warm/15 border-amber-warm/30 text-brown-deep"
                        : "border-amber-warm/20 text-brown-soft hover:bg-cream"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {a.charAt(0) + a.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-brown-dark mb-1.5">Type</label>
            <div className="flex gap-2">
              {(["QUEST", "DAILY", "HABIT"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`flex-1 py-2 text-sm rounded-[8px] border font-medium transition-all ${
                    formData.type === t
                      ? "bg-amber-warm/15 border-amber-warm/30 text-brown-deep"
                      : "border-amber-warm/20 text-brown-soft hover:bg-cream"
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createTask.isPending}
            className="w-full py-3 bg-amber-warm text-brown-deep font-bold rounded-[8px] hover:bg-amber-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createTask.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              "Create Quest"
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
