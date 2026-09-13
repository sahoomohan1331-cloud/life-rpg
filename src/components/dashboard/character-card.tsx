"use client";

import { useCharacter } from "@/hooks/use-character";
import { motion } from "framer-motion";
import { Crown, Coins, Zap } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { getTitleForLevel } from "@/lib/progression";

export function CharacterCard() {
  const { data: character, isLoading } = useCharacter();

  if (isLoading) {
    return (
      <div className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full skeleton-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-40 skeleton-pulse rounded-[6px]" />
            <div className="h-4 w-28 skeleton-pulse rounded-[6px]" />
            <div className="h-4 w-32 skeleton-pulse rounded-[6px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!character) return null;

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference * (1 - character.xpProgress);
  const xpRemaining = Math.max(0, character.xpToNextLevel - character.xp);
  const nextLevel = character.level + 1;
  const nextTitle = getTitleForLevel(nextLevel);

  return (
    <div className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm">
      <div className="flex items-start gap-5">
        {/* XP Ring */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="rgba(212, 165, 116, 0.2)"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <motion.circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#7D9B76"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
            />
          </svg>
          {/* Level number in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-xl font-bold text-brown-deep">
              {character.level}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-4 w-4 text-gold" aria-hidden="true" />
            <h2 className="font-heading text-lg font-bold text-brown-deep truncate">
              {character.title}
            </h2>
          </div>
          <p className="text-sm text-brown-soft mb-2">
            Level {character.level} · {character.xp} / {character.xpToNextLevel} XP ({Math.round(character.xpProgress * 100)}%)
          </p>

          {/* XP Bar */}
          <div className="h-2.5 bg-amber-warm/15 rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full bg-green-muted rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${character.xpProgress * 100}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
            />
          </div>

          {/* Bottom row: XP Countdown Badge + Gold Counter */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cream/90 border border-amber-warm/25 text-xs text-brown-dark font-medium shadow-2xs">
              <Zap className="h-3 w-3 text-amber-warm fill-amber-warm" aria-hidden="true" />
              <span>
                <strong className="font-mono text-green-muted font-bold">{xpRemaining} XP</strong> to Lv.{nextLevel}
                {nextTitle !== character.title && (
                  <span className="text-brown-soft ml-1 hidden sm:inline">({nextTitle})</span>
                )}
              </span>
            </div>

            {/* Gold */}
            <div className="flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-gold" aria-hidden="true" />
              <span className="text-sm font-semibold text-brown-dark font-mono">
                {formatNumber(character.gold)}
              </span>
              <span className="text-sm text-brown-soft">Gold</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
