"use client";

import { useState, useEffect, useRef } from "react";
import { useCreateTask } from "@/hooks/use-tasks";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { X, Loader2, BookOpen, Heart, Wrench, Sparkles } from "lucide-react";
import { createTaskSchema } from "@/schemas/task";
import type { CreateTaskInput } from "@/types";

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

interface CreateQuestModalProps {
  onClose: () => void;
  initialData?: Partial<CreateTaskInput>;
}

export function CreateQuestModal({ onClose, initialData }: CreateQuestModalProps) {
  const createTask = useCreateTask();
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    difficulty: initialData?.difficulty || "MEDIUM",
    attributeName: initialData?.attributeName || "WISDOM",
    type: initialData?.type || "QUEST",
    dueAt: initialData?.dueAt || null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Escape key to dismiss & Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
      toast.success("Quest inscribed into chronicles! 📜");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create quest");
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-deep/50 backdrop-blur-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-quest-title"
    >
      {/* Modal Card */}
      <motion.div
        className="relative bg-parchment rounded-[20px] p-6 w-full max-w-lg shadow-2xl border border-amber-warm/30 overflow-hidden"
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-warm" />
            <h2 id="create-quest-title" className="font-heading text-xl font-bold text-brown-deep">
              Inscribe New Quest
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-brown-soft hover:text-brown-dark transition-colors rounded-[8px] hover:bg-cream cursor-pointer"
            aria-label="Close dialog (Escape)"
            title="Press Esc to close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-3.5 py-2.5 bg-cream border border-amber-warm/30 rounded-[10px] text-brown-dark placeholder:text-brown-soft/50 focus:outline-none focus:ring-2 focus:ring-amber-warm/50 text-sm font-medium"
              placeholder="e.g., Read 30 pages of a book"
              autoFocus
            />
            {errors.title && <p className="text-ember text-xs mt-1 font-medium">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="quest-desc" className="block text-sm font-medium text-brown-dark mb-1">
              Description <span className="text-brown-soft text-xs">(optional)</span>
            </label>
            <textarea
              id="quest-desc"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-cream border border-amber-warm/30 rounded-[10px] text-brown-dark placeholder:text-brown-soft/50 focus:outline-none focus:ring-2 focus:ring-amber-warm/50 h-20 resize-none text-sm"
              placeholder="Add details or acceptance criteria..."
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brown-soft mb-1.5">
              Difficulty & Reward
            </label>
            <div className="flex gap-2">
              {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: d })}
                  className={`flex-1 py-2 text-xs rounded-[10px] border font-bold transition-all cursor-pointer ${
                    formData.difficulty === d
                      ? DIFFICULTY_COLORS[d] + " ring-1 ring-amber-warm/40 shadow-xs"
                      : "border-amber-warm/20 text-brown-soft hover:bg-cream"
                  }`}
                >
                  {d} (+{DIFFICULTY_XP[d]} XP)
                </button>
              ))}
            </div>
          </div>

          {/* Attribute */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brown-soft mb-1.5">
              Attribute Track
            </label>
            <div className="flex gap-2">
              {(["WISDOM", "VITALITY", "CRAFT"] as const).map((a) => {
                const Icon = ATTR_ICONS[a];
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setFormData({ ...formData, attributeName: a })}
                    className={`flex-1 py-2 text-xs rounded-[10px] border font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      formData.attributeName === a
                        ? "bg-amber-warm/20 border-amber-warm/40 text-brown-deep ring-1 ring-amber-warm/40 shadow-xs"
                        : "border-amber-warm/20 text-brown-soft hover:bg-cream"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 text-amber-warm" aria-hidden="true" />
                    <span>{a.charAt(0) + a.slice(1).toLowerCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brown-soft mb-1.5">
              Quest Rhythm
            </label>
            <div className="flex gap-2">
              {(["QUEST", "DAILY", "HABIT"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`flex-1 py-2 text-xs rounded-[10px] border font-semibold transition-all cursor-pointer ${
                    formData.type === t
                      ? "bg-amber-warm/20 border-amber-warm/40 text-brown-deep ring-1 ring-amber-warm/40 shadow-xs"
                      : "border-amber-warm/20 text-brown-soft hover:bg-cream"
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={createTask.isPending}
              className="w-full py-3 bg-amber-warm text-brown-deep font-bold text-sm rounded-[10px] hover:bg-amber-warm/90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {createTask.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Inscribing Quest...</span>
                </>
              ) : (
                <>
                  <span>Inscribe Quest</span>
                  <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-brown-deep/15 text-brown-deep font-mono font-normal">
                    Ctrl + Enter
                  </kbd>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
