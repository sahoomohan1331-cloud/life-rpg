"use client";

import { useCharacter } from "@/hooks/use-character";
import { motion, AnimatePresence } from "framer-motion";
import { getUnlockedRoomElements } from "@/lib/progression";

export function StudyRoom() {
  const { data: character, isLoading } = useCharacter();

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

  return (
    <div className="bg-parchment rounded-[16px] p-6 border border-amber-warm/15 shadow-sm">
      <h2 className="font-heading text-lg font-bold text-brown-deep mb-4">Your Study Room</h2>

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
                    className="absolute -top-2 -left-3 w-14 h-10 bg-amber-warm/20 rounded-full blur-md"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Plant */}
          <AnimatePresence>
            {unlockedIds.has("plant-small") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-5 right-6"
              >
                <div className="text-lg">🪴</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Books on desk */}
          <AnimatePresence>
            {unlockedIds.has("book-1") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-3 left-1/2"
              >
                <div className="text-sm">📖</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bookshelf */}
        <AnimatePresence>
          {unlockedIds.has("bookshelf") && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 left-4 text-2xl"
            >
              📚
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
        <span>{unlocked.length} / 10 elements unlocked</span>
        {unlocked.length < 10 && (
          <span className="text-amber-warm">
            Next unlock at Lv.{
              [2, 3, 5, 7, 10, 13, 15, 20].find((l) => l > level) || "Max"
            }
          </span>
        )}
      </div>
    </div>
  );
}
