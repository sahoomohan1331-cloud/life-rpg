"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

interface SoundContextType {
  enabled: boolean;
  toggle: () => void;
  playComplete: () => void;
  playLevelUp: () => void;
  playCoin: () => void;
}

const SoundContext = createContext<SoundContextType>({
  enabled: false,
  toggle: () => {},
  playComplete: () => {},
  playLevelUp: () => {},
  playCoin: () => {},
});

export function useSoundContext() {
  return useContext(SoundContext);
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }
    return audioContext.current;
  }, []);

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine") => {
      if (!enabled) return;
      try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      } catch {
        // Audio not available
      }
    },
    [enabled, getAudioContext]
  );

  const playComplete = useCallback(() => {
    playTone(800, 0.15, "sine");
    setTimeout(() => playTone(1000, 0.1, "sine"), 100);
  }, [playTone]);

  const playLevelUp = useCallback(() => {
    playTone(523, 0.2, "sine");
    setTimeout(() => playTone(659, 0.2, "sine"), 150);
    setTimeout(() => playTone(784, 0.3, "sine"), 300);
    setTimeout(() => playTone(1047, 0.4, "sine"), 500);
  }, [playTone]);

  const playCoin = useCallback(() => {
    playTone(1200, 0.1, "square");
    setTimeout(() => playTone(1600, 0.15, "square"), 80);
  }, [playTone]);

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  return (
    <SoundContext.Provider value={{ enabled, toggle, playComplete, playLevelUp, playCoin }}>
      {children}
    </SoundContext.Provider>
  );
}
