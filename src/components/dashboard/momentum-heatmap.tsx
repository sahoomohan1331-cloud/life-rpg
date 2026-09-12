"use client";

import { useStreaks } from "@/hooks/use-streaks";
import { Flame } from "lucide-react";
import { useMemo } from "react";

export function MomentumHeatmap() {
  const { data: streakData, isLoading } = useStreaks();

  const weeks = useMemo(() => {
    const grid: { date: string; count: number; dayOfWeek: number }[][] = [];
    const today = new Date();

    // Go back 12 weeks (84 days)
    for (let w = 11; w >= 0; w--) {
      const week: { date: string; count: number; dayOfWeek: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const dateStr = date.toISOString().split("T")[0];
        week.push({
          date: dateStr,
          count: streakData?.completionsByDay[dateStr] || 0,
          dayOfWeek: date.getDay(),
        });
      }
      grid.push(week);
    }

    return grid;
  }, [streakData]);

  function getColor(count: number): string {
    if (count === 0) return "bg-amber-warm/10";
    if (count === 1) return "bg-amber-warm/30";
    if (count <= 3) return "bg-amber-warm/50";
    if (count <= 5) return "bg-amber-warm/70";
    return "bg-amber-warm";
  }

  if (isLoading) {
    return (
      <div className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm">
        <div className="h-6 w-40 skeleton-pulse rounded-[4px] mb-4" />
        <div className="h-24 skeleton-pulse rounded-[8px]" />
      </div>
    );
  }

  return (
    <div className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-bold text-brown-deep">Momentum</h2>
        {streakData && (
          <div className="flex items-center gap-1.5 text-sm">
            <Flame className="h-4 w-4 text-ember" aria-hidden="true" />
            <span className="font-semibold text-brown-dark">{streakData.globalStreak.current}</span>
            <span className="text-brown-soft">day streak</span>
          </div>
        )}
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-1 overflow-x-auto pb-2" role="img" aria-label="Activity heatmap showing quest completions over the last 12 weeks">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-3 h-3 rounded-[2px] ${getColor(day.count)} transition-colors`}
                title={`${day.date}: ${day.count} quest${day.count !== 1 ? "s" : ""} completed`}
                aria-hidden="true"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-brown-soft">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-[2px] bg-amber-warm/10" />
          <div className="w-3 h-3 rounded-[2px] bg-amber-warm/30" />
          <div className="w-3 h-3 rounded-[2px] bg-amber-warm/50" />
          <div className="w-3 h-3 rounded-[2px] bg-amber-warm/70" />
          <div className="w-3 h-3 rounded-[2px] bg-amber-warm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
