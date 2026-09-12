"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Life RPG Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-parchment rounded-[20px] p-8 border-2 border-ember/30 shadow-lg">
        <div className="w-16 h-16 rounded-full bg-ember/15 text-ember flex items-center justify-center mx-auto mb-4 border border-ember/30">
          <AlertCircle className="h-8 w-8" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-widest text-ember px-3 py-1 bg-ember/10 rounded-full">
          Magical Disruption
        </span>

        <h1 className="font-heading text-2xl font-bold text-brown-deep mt-3 mb-2">
          An Unexpected Event Occurred
        </h1>

        <p className="text-sm text-brown-soft mb-6 leading-relaxed">
          {error.message || "A rift in the realm temporarily interrupted your journey. Your data and progress remain completely safe."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-amber-warm hover:bg-amber-warm/90 text-cream font-medium shadow transition-all text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/app"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-cream hover:bg-parchment text-brown-dark font-medium border border-amber-warm/20 transition-all text-sm"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
