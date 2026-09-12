import Link from "next/link";
import { Compass, Sparkles, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center bg-parchment rounded-[20px] p-8 border-2 border-amber-warm/30 shadow-lg">
        <div className="w-16 h-16 rounded-full bg-amber-warm/15 text-amber-warm flex items-center justify-center mx-auto mb-4 border border-amber-warm/30">
          <Compass className="h-8 w-8 animate-spin-slow" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-widest text-amber-warm px-3 py-1 bg-amber-warm/10 rounded-full">
          404 · Uncharted Territory
        </span>

        <h1 className="font-heading text-3xl font-bold text-brown-deep mt-3 mb-2">
          Lost in the Archives?
        </h1>

        <p className="text-sm text-brown-soft mb-6 leading-relaxed">
          The scroll or corridor you seek has not been inscribed into this realm. Let us guide you back to familiar grounds.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/app"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-amber-warm hover:bg-amber-warm/90 text-cream font-medium shadow transition-all text-sm"
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-cream hover:bg-parchment text-brown-dark font-medium border border-amber-warm/20 transition-all text-sm"
          >
            <Sparkles className="h-4 w-4 text-amber-warm" />
            Main Gates
          </Link>
        </div>
      </div>
    </div>
  );
}
