"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { CreateQuestModal } from "@/components/quests/create-quest-modal";

export function GlobalShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ignore if modifier keys are held
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // Q opens quest creator
      if (e.key === "q" || e.key === "Q") {
        e.preventDefault();
        setIsOpen(true);
      }
    }

    function handleCustomOpen() {
      setIsOpen(true);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-create-quest", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-create-quest", handleCustomOpen);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && <CreateQuestModal onClose={() => setIsOpen(false)} />}
    </AnimatePresence>
  );
}
