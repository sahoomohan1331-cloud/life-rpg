import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import Link from "next/link";
import { Sparkles, KeyRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Recover access to your Life RPG adventurer account.",
};

export default function ForgotPasswordPage() {
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
          <p className="text-brown-soft text-sm">Account Recovery & Credential Restoration</p>
        </div>

        <div className="bg-parchment rounded-[20px] p-7 shadow-lg border border-amber-warm/20">
          <div className="flex items-center gap-2.5 mb-2 justify-center">
            <div className="w-9 h-9 rounded-full bg-amber-warm/20 border border-amber-warm/30 flex items-center justify-center text-brown-deep">
              <KeyRound className="h-5 w-5 text-amber-warm" />
            </div>
            <h1 className="font-heading text-xl font-bold text-brown-deep">
              Forgot Password?
            </h1>
          </div>

          <p className="text-xs text-brown-soft text-center mb-6">
            Enter the email address tied to your character to receive a recovery scroll.
          </p>

          <ForgotPasswordForm />
        </div>

        <p className="text-center text-brown-soft text-xs mt-6">
          Need an adventurer account?{" "}
          <Link
            href="/signup"
            className="text-amber-warm hover:text-amber-dark font-semibold transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
