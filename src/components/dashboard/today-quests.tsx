"use client";

import { useTasks } from "@/hooks/use-tasks";
import { useCompleteTask } from "@/hooks/use-complete-task";
import { useSoundContext } from "@/components/providers/sound-provider";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Scroll, Sparkles } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { LevelUpModal } from "@/components/shared/level-up-modal";

export function TodayQuests() {
  const { data: tasks, isLoading } = useTasks({ completed: false });
  const completeTask = useCompleteTask();
  const { playComplete, playLevelUp } = useSoundContext();
  const [floatingXP, setFloatingXP] = useState<{ id: string; xp: number; x: number; y: number } | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);

  const handleComplete = useCallback(
    async (taskId: string, e: React.MouseEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();

      try {
        const result = await completeTask.mutateAsync(taskId);
        playComplete();

        // Show floating XP
        setFloatingXP({
          id: taskId,
          xp: result.xpAwarded,
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
        setTimeout(() => setFloatingXP(null), 1500);

        // Announce to screen readers
        const announcer = document.getElementById("announcements");
        if (announcer) {
          announcer.textContent = `Quest completed! Earned ${result.xpAwarded} XP and ${result.goldAwarded} Gold.`;
        }

        if (result.leveledUp) {
          playLevelUp();
          setLevelUpData({ level: result.newLevel, title: result.newTitle });
        }

        if (result.streakUpdate.isNewMilestone) {
          toast.success(`🔥 ${result.streakUpdate.milestone}-day Momentum! XP multiplier active!`);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to complete quest");
      }
    },
    [completeTask, playComplete, playLevelUp]
  );

  if (isLoading) {
    return (
      <div className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm">
        <div className="h-6 w-36 skeleton-pulse rounded-[4px] mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 skeleton-pulse rounded-[8px]" />
          ))}
        </div>
      </div>
    );
  }

  const todayQuests = (tasks || []).slice(0, 5);

  return (
    <div className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-bold text-brown-deep">Today&apos;s Quests</h2>
        <Link
          href="/app/quests"
          className="text-sm text-amber-warm hover:text-amber-dark font-medium transition-colors"
        >
          View All →
        </Link>
      </div>

      {todayQuests.length === 0 ? (
        <div className="text-center py-8">
          <Scroll className="h-12 w-12 text-amber-warm/40 mx-auto mb-3" aria-hidden="true" />
          <p className="text-brown-soft text-sm mb-3">No quests yet — start your adventure!</p>
          <Link
            href="/app/quests"
            className="inline-block px-4 py-2 bg-amber-warm text-brown-deep text-sm font-semibold rounded-[8px] hover:bg-amber-dark transition-colors"
          >
            Create Your First Quest
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence>
            {todayQuests.map((task) => (
              <motion.li
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="flex items-center gap-3 bg-cream/80 rounded-[8px] px-4 py-3 border border-amber-warm/10"
              >
                <button
                  onClick={(e) => handleComplete(task.id, e)}
                  disabled={completeTask.isPending}
                  className="w-6 h-6 rounded-full border-2 border-amber-warm/40 flex items-center justify-center hover:border-green-muted hover:bg-green-muted/10 transition-all flex-shrink-0 disabled:opacity-50"
                  aria-label={`Complete quest: ${task.title}`}
                >
                  <Check className="h-3 w-3 text-green-muted opacity-0 hover:opacity-100 transition-opacity" aria-hidden="true" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brown-dark truncate">{task.title}</p>
                  <p className="text-xs text-brown-soft">
                    {task.difficulty} · {task.attributeName}
                  </p>
                </div>
                <span className="text-xs font-mono text-green-muted font-medium flex-shrink-0">
                  +{task.difficulty === "EASY" ? 10 : task.difficulty === "MEDIUM" ? 25 : 50} XP
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Floating XP */}
      <AnimatePresence>
        {floatingXP && (
          <motion.div
            key={floatingXP.id}
            className="fixed pointer-events-none z-50 font-heading text-lg font-bold text-green-muted"
            style={{ left: floatingXP.x, top: floatingXP.y }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <Sparkles className="h-4 w-4 inline mr-1" aria-hidden="true" />
            +{floatingXP.xp} XP
          </motion.div>
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
