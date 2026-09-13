"use client";

import { useStreaks } from "@/hooks/use-streaks";
import { getStreakMultiplier } from "@/lib/progression";
import { motion } from "framer-motion";
import { Flame, Sparkles, AlertCircle, Plus, CheckCircle2 } from "lucide-react";

export function MomentumBanner() {
  const { data: streakData, isLoading } = useStreaks();

  if (isLoading) {
    return (
      <div className="bg-parchment rounded-[16px] p-4 border border-amber-warm/15 shadow-sm">
        <div className="h-5 w-48 skeleton-pulse rounded-[4px] mb-2" />
        <div className="h-4 w-72 skeleton-pulse rounded-[4px]" />
      </div>
    );
  }

  const streak = streakData?.globalStreak?.current || 0;
  const longestStreak = streakData?.globalStreak?.longest || 0;
  const multiplier = getStreakMultiplier(streak);

  // Check if completed today (UTC YYYY-MM-DD)
  const todayKey = new Date().toISOString().split("T")[0];
  const completedTodayCount = streakData?.completionsByDay?.[todayKey] || 0;
  const isCompletedToday = completedTodayCount > 0;

  function handleOpenCreateQuest() {
    window.dispatchEvent(new CustomEvent("open-create-quest"));
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-[16px] border p-4 sm:p-5 transition-all shadow-sm ${
        isCompletedToday
          ? "bg-gradient-to-r from-cream via-parchment to-cream border-green-muted/30"
          : "bg-gradient-to-r from-parchment via-cream to-parchment border-ember/35 ring-1 ring-ember/20"
      }`}
      aria-label="Daily momentum flame status"
    >
      {/* Background ambient decorative flame glow */}
      <div
        className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-2xl pointer-events-none opacity-20 ${
          isCompletedToday ? "bg-green-muted" : "bg-ember"
        }`}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Flame Icon + Headline + Subtext */}
        <div className="flex items-start sm:items-center gap-3.5">
          {/* Animated Flame Icon Container */}
          <div
            className={`w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0 shadow-inner ${
              isCompletedToday
                ? "bg-green-muted/15 border border-green-muted/30 text-green-muted"
                : "bg-ember/15 border border-ember/30 text-ember"
            }`}
          >
            {isCompletedToday ? (
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Flame className="h-6 w-6 text-ember fill-ember/40" />
              </motion.div>
            ) : (
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  rotate: [-3, 3, -3],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Flame className="h-6 w-6 text-ember fill-ember" />
              </motion.div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-bold text-base sm:text-lg text-brown-deep">
                {isCompletedToday
                  ? "Daily Flame Secured! 🔥"
                  : streak > 0
                  ? "Daily Streak at Risk! ⏳"
                  : "Ignite Your Daily Flame! ✨"}
              </h3>

              {/* Multiplier Badge */}
              {multiplier > 1 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-warm/25 text-brown-deep border border-amber-warm/40">
                  <Sparkles className="h-3 w-3 text-amber-warm" />
                  {multiplier}x XP Multiplier Active
                </span>
              )}

              {/* Streak Count Badge */}
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-[6px] ${
                  isCompletedToday
                    ? "bg-green-muted/15 text-green-muted"
                    : streak > 0
                    ? "bg-ember/15 text-ember"
                    : "bg-brown-soft/15 text-brown-soft"
                }`}
              >
                {streak} {streak === 1 ? "Day" : "Days"} Streak
                {longestStreak > streak && ` (Record: ${longestStreak})`}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-brown-soft mt-1">
              {isCompletedToday ? (
                <span className="inline-flex items-center gap-1.5 text-brown-dark font-medium">
                  <CheckCircle2 className="h-4 w-4 text-green-muted shrink-0 inline" />
                  <span>
                    Great work! You have completed {completedTodayCount} quest{completedTodayCount > 1 ? "s" : ""} today. Your streak bonus is safeguarded!
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-brown-dark">
                  <AlertCircle className="h-4 w-4 text-ember shrink-0 inline" />
                  <span>
                    Complete at least 1 quest before midnight to {streak > 0 ? "protect your momentum multiplier" : "start your quest streak"}!
                  </span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Call to action */}
        {!isCompletedToday && (
          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button
              onClick={handleOpenCreateQuest}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-warm hover:bg-amber-warm/90 text-brown-deep font-bold text-xs rounded-[10px] shadow-sm transition-all cursor-pointer focus:ring-2 focus:ring-amber-warm"
            >
              <Plus className="h-4 w-4" />
              <span>Inscribe Quest</span>
              <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-brown-deep/15 text-brown-deep font-mono font-normal">
                Q
              </kbd>
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
