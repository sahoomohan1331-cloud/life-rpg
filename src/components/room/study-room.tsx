"use client";

import { useState, useEffect } from "react";
import { useCharacter } from "@/hooks/use-character";
import { motion, AnimatePresence } from "framer-motion";
import { getUnlockedRoomElements, ROOM_ELEMENTS } from "@/lib/progression";
import { Eye, Check, Lock, X, Sparkles } from "lucide-react";

const ELEMENT_DETAILS: Record<string, { icon: string; desc: string }> = {
  desk: { icon: "🪵", desc: "Solid timber study workspace" },
  "lamp-off": { icon: "🕯️", desc: "Faint starter candle & desk lamp" },
  "plant-small": { icon: "🌱", desc: "A lively green desk succulent" },
  "book-1": { icon: "📖", desc: "Chronicles of your first completed deeds" },
  "lamp-on": { icon: "💡", desc: "Warm golden study light radiates focus" },
  cat: { icon: "🐈", desc: "A cozy feline companion resting on your desk" },
  bookshelf: { icon: "📚", desc: "Towering shelves stocked with hard-earned wisdom" },
  rug: { icon: "🧶", desc: "Hand-loomed cozy ember carpet underfoot" },
  "window-sunset": { icon: "🌅", desc: "Scenic window overlooking twilight mountains" },
  "ambient-glow": { icon: "✨", desc: "Magical mastery particles shimmering through room" },
};

export function StudyRoom() {
  const { data: character, isLoading } = useCharacter();
  const [showMilestones, setShowMilestones] = useState(false);

  useEffect(() => {
    if (!showMilestones) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMilestones(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMilestones]);

  if (isLoading) {
    return (
      <div className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm">
        <div className="h-6 w-36 skeleton-pulse rounded-[4px] mb-4" />
        <div className="h-48 skeleton-pulse rounded-[12px]" />
      </div>
    );
  }

  const level = character?.level || 1;
  const unlocked = getUnlockedRoomElements(level);
  const unlockedIds = new Set(unlocked.map((el) => el.id));
  const nextUnlock = ROOM_ELEMENTS.find((el) => el.level > level);

  return (
    <div className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h2 className="font-heading text-lg font-bold text-brown-deep">Your Study Room</h2>
          {nextUnlock ? (
            <p className="text-xs text-brown-soft flex items-center gap-1">
              <span>Next unlock at Lv.{nextUnlock.level}:</span>
              <span className="font-semibold text-amber-warm">{nextUnlock.label}</span>
            </p>
          ) : (
            <p className="text-xs text-green-muted font-medium">All room elements unlocked! ✨</p>
          )}
        </div>
        <button
          onClick={() => setShowMilestones(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-[8px] bg-cream hover:bg-parchment text-brown-dark border border-amber-warm/25 transition-all shadow-2xs inline-flex items-center gap-1.5 focus:ring-2 focus:ring-amber-warm cursor-pointer"
          aria-label="View room milestones"
        >
          <Eye className="h-3.5 w-3.5 text-amber-warm" />
          <span>Milestones ({unlocked.length}/{ROOM_ELEMENTS.length})</span>
        </button>
      </div>

      {/* Room Scene */}
      <div
        className="relative bg-gradient-to-b from-cream to-parchment rounded-[12px] overflow-hidden border border-amber-warm/10 h-52 md:h-64"
        role="img"
        aria-label={`Your cozy study room at level ${level} with ${unlocked.length} elements unlocked`}
      >
        {/* Window */}
        <div className="absolute top-3 right-6 w-16 h-20 rounded-t-[8px] border-2 border-brown-soft/30 bg-gradient-to-b from-blue-200/30 to-blue-300/20 overflow-hidden">
          <AnimatePresence>
            {unlockedIds.has("window-sunset") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-b from-orange-300/50 via-pink-300/30 to-purple-300/20"
              />
            )}
          </AnimatePresence>
          <div className="absolute inset-y-0 left-1/2 w-[2px] bg-brown-soft/20" />
          <div className="absolute inset-x-0 top-1/2 h-[2px] bg-brown-soft/20" />
        </div>

        {/* Rug */}
        <AnimatePresence>
          {unlockedIds.has("rug") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-ember/20 rounded-[50%] border border-ember/10"
            />
          )}
        </AnimatePresence>

        {/* Desk */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 md:w-56 h-16 bg-brown-soft/80 rounded-t-[4px] border-t-2 border-x-2 border-brown-dark/20">
          {/* Desk legs */}
          <div className="absolute -bottom-8 left-2 w-2 h-8 bg-brown-soft/60" />
          <div className="absolute -bottom-8 right-2 w-2 h-8 bg-brown-soft/60" />

          {/* Items on desk */}
          <div className="absolute -top-4 left-4 flex items-end gap-2">
            {/* Lamp */}
            <div className="relative">
              <div className="w-3 h-6 bg-brown-dark/40 rounded-[2px]" />
              <div className="w-8 h-3 bg-amber-warm/40 rounded-t-full -ml-2.5 -mt-0.5" />
              <AnimatePresence>
                {unlockedIds.has("lamp-on") && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -inset-4 bg-amber-warm/30 rounded-full blur-sm pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Plant */}
            <AnimatePresence>
              {unlockedIds.has("plant-small") && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-4 h-6 flex flex-col items-center"
                >
                  <div className="w-3 h-3 bg-green-muted rounded-full" />
                  <div className="w-2.5 h-3 bg-ember/60 rounded-b-[2px]" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Books on desk */}
            <AnimatePresence>
              {unlockedIds.has("book-1") && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-6 h-2 bg-ember/70 rounded-[1px]"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bookshelf */}
        <AnimatePresence>
          {unlockedIds.has("bookshelf") && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute bottom-8 left-4 w-12 h-32 border-2 border-brown-dark/30 rounded-[4px] flex flex-col justify-around p-1 bg-brown-soft/20"
            >
              <div className="h-1 bg-brown-dark/20 rounded-full" />
              <div className="flex gap-0.5 h-6 items-end">
                <div className="w-2 h-5 bg-ember/60 rounded-t-[1px]" />
                <div className="w-2 h-6 bg-amber-warm/60 rounded-t-[1px]" />
                <div className="w-1.5 h-4 bg-green-muted/60 rounded-t-[1px]" />
              </div>
              <div className="h-1 bg-brown-dark/20 rounded-full" />
              <div className="flex gap-0.5 h-6 items-end">
                <div className="w-2 h-6 bg-purple-400/50 rounded-t-[1px]" />
                <div className="w-2 h-4 bg-blue-400/50 rounded-t-[1px]" />
              </div>
              <div className="h-1 bg-brown-dark/20 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cat */}
        <AnimatePresence>
          {unlockedIds.has("cat") && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="absolute top-6 right-24 text-xl"
            >
              🐱
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient glow */}
        <AnimatePresence>
          {unlockedIds.has("ambient-glow") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-radial from-amber-warm/10 via-transparent to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Level badge */}
        <div className="absolute top-3 left-3 bg-brown-deep/80 text-cream text-xs font-mono px-2 py-1 rounded-[6px]">
          Lv.{level}
        </div>
      </div>

      {/* Unlock progress */}
      <div className="mt-3 flex items-center justify-between text-xs text-brown-soft">
        <span>{unlocked.length} / {ROOM_ELEMENTS.length} elements unlocked</span>
        {unlocked.length < ROOM_ELEMENTS.length && (
          <span className="text-amber-warm font-medium">
            Next unlock at Lv.{
              ROOM_ELEMENTS.find((el) => el.level > level)?.level || "Max"
            }
          </span>
        )}
      </div>

      {/* Milestones Peek Modal */}
      <AnimatePresence>
        {showMilestones && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-deep/60 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="milestones-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-parchment rounded-[20px] border border-amber-warm/30 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-amber-warm/15">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-warm" />
                    <h3 id="milestones-modal-title" className="font-heading text-lg font-bold text-brown-deep">
                      Study Room Milestones
                    </h3>
                  </div>
                  <p className="text-xs text-brown-soft mt-1">
                    Your sanctuary evolves alongside your deeds. Reach higher levels to unlock room artifacts.
                  </p>
                </div>
                <button
                  onClick={() => setShowMilestones(false)}
                  className="p-1 rounded-[8px] text-brown-soft hover:text-brown-deep hover:bg-cream/60 transition-colors cursor-pointer"
                  aria-label="Close milestones modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Progress summary banner */}
              <div className="my-4 p-3 rounded-[12px] bg-cream/80 border border-amber-warm/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold px-2 py-0.5 rounded-[4px] bg-brown-deep text-cream">
                    Lv. {level}
                  </span>
                  <span className="text-brown-dark font-medium">
                    {unlocked.length} of {ROOM_ELEMENTS.length} unlocked
                  </span>
                </div>
                <div className="text-xs font-semibold text-amber-warm">
                  {Math.round((unlocked.length / ROOM_ELEMENTS.length) * 100)}% Complete
                </div>
              </div>

              {/* Milestones scrollable list */}
              <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 py-1">
                {ROOM_ELEMENTS.map((element) => {
                  const isUnlocked = unlockedIds.has(element.id);
                  const isNext = nextUnlock?.id === element.id;
                  const details = ELEMENT_DETAILS[element.id] || { icon: "✨", desc: "A cozy study upgrade" };

                  return (
                    <div
                      key={element.id}
                      className={`p-3 rounded-[12px] border transition-all flex items-center justify-between gap-3 ${
                        isUnlocked
                          ? "bg-cream/90 border-green-muted/30 text-brown-deep shadow-2xs"
                          : isNext
                          ? "bg-amber-warm/10 border-amber-warm/40 text-brown-dark shadow-xs ring-1 ring-amber-warm/30"
                          : "bg-parchment/40 border-brown-soft/15 text-brown-soft opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0 ${
                            isUnlocked
                              ? "bg-green-muted/15 border border-green-muted/20"
                              : isNext
                              ? "bg-amber-warm/20 border border-amber-warm/30"
                              : "bg-brown-soft/10 border border-brown-soft/20 grayscale"
                          }`}
                        >
                          {details.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-semibold text-sm text-brown-deep">
                              {element.label}
                            </span>
                            {isNext && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-amber-warm text-brown-deep uppercase tracking-wider">
                                Next Up
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-brown-soft truncate">{details.desc}</p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-muted px-2 py-1 rounded-[6px] bg-green-muted/10">
                            <Check className="h-3.5 w-3.5" />
                            <span>Unlocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-brown-soft px-2 py-1 rounded-[6px] bg-brown-soft/10">
                            <Lock className="h-3.5 w-3.5" />
                            <span>Lv. {element.level}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal footer */}
              <div className="pt-4 mt-2 border-t border-amber-warm/15 flex items-center justify-end">
                <button
                  onClick={() => setShowMilestones(false)}
                  className="px-4 py-2 rounded-[10px] text-xs font-semibold bg-amber-warm hover:bg-amber-warm/90 text-brown-deep transition-all shadow-sm cursor-pointer"
                >
                  Back to Study Room
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
