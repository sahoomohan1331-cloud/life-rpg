"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, X, Crown } from "lucide-react";

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  title: string;
  onClose: () => void;
}

export function LevelUpModal({ isOpen, level, title, onClose }: LevelUpModalProps) {
  const triggerConfetti = useCallback(async () => {
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    try {
      const confetti = (await import("canvas-confetti")).default;
      // Multi-stage confetti burst in cozy amber / gold tones
      const colors = ["#D4A574", "#C9A84C", "#7D9B76", "#F5E6D3"];

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors,
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
      }, 250);
    } catch (e) {
      console.error("Confetti trigger failed:", e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      triggerConfetti();

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      // Handle Escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, triggerConfetti, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="levelup-title"
          aria-describedby="levelup-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-deep/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md bg-parchment rounded-[20px] p-8 border-2 border-amber-warm/40 shadow-2xl text-center overflow-hidden"
          >
            {/* Ambient warm glow in background */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-warm/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gold/20 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-brown-soft hover:text-brown-deep rounded-full hover:bg-amber-warm/10 transition-colors focus:ring-2 focus:ring-amber-warm"
              aria-label="Close celebration modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon badge */}
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-amber-warm/20 border-2 border-amber-warm flex items-center justify-center text-amber-warm shadow-inner">
              <Crown className="h-10 w-10 animate-bounce" />
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-amber-warm px-3 py-1 bg-amber-warm/10 rounded-full mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Level Up Achieved!
            </span>

            <h2 id="levelup-title" className="font-heading text-3xl font-bold text-brown-deep mb-2">
              Level {level}
            </h2>

            <p id="levelup-desc" className="text-base font-medium text-brown-dark mb-4">
              Your dedication bears fruit! You have attained the title of{" "}
              <span className="font-semibold text-amber-warm underline decoration-amber-warm/40">
                {title}
              </span>
              .
            </p>

            <div className="bg-cream/60 rounded-[12px] p-4 border border-amber-warm/20 mb-6 text-sm text-brown-soft">
              <div className="flex items-center justify-center gap-2 text-brown-dark font-medium mb-1">
                <Trophy className="h-4 w-4 text-gold" />
                <span>New Study Room elements & Market rewards unlocked!</span>
              </div>
              <p className="text-xs">Your cozy room grows richer with every tier reached.</p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-[10px] bg-amber-warm hover:bg-amber-warm/90 text-cream font-medium shadow-md hover:shadow-lg transition-all focus:ring-2 focus:ring-amber-warm focus:ring-offset-2"
                autoFocus
              >
                Continue Adventure
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
