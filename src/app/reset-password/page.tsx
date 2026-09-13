import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Life RPG adventurer account.",
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-heading text-3xl font-bold text-brown-deep mb-2"
          >
            <Sparkles className="h-8 w-8 text-amber-warm" aria-hidden="true" />
            <span>Life RPG</span>
          </Link>
          <p className="text-brown-soft text-sm">Sanctuary Gate & Secret Passkey</p>
        </div>

        <div className="bg-parchment rounded-[20px] p-7 shadow-lg border border-amber-warm/20">
          <div className="flex items-center gap-2.5 mb-2 justify-center">
            <div className="w-9 h-9 rounded-full bg-amber-warm/20 border border-amber-warm/30 flex items-center justify-center text-brown-deep">
              <ShieldCheck className="h-5 w-5 text-amber-warm" />
            </div>
            <h1 className="font-heading text-xl font-bold text-brown-deep">
              Set New Password
            </h1>
          </div>

          <p className="text-xs text-brown-soft text-center mb-6">
            Inscribe a strong new passkey for your character credentials.
          </p>

          <Suspense
            fallback={
              <div className="space-y-4">
                <div className="h-10 skeleton-pulse rounded-[10px]" />
                <div className="h-10 skeleton-pulse rounded-[10px]" />
                <div className="h-12 skeleton-pulse rounded-[10px]" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center text-brown-soft text-xs mt-6">
          Remembered your passkey?{" "}
          <Link
            href="/login"
            className="text-amber-warm hover:text-amber-dark font-semibold transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
