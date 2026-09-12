import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your Life RPG account and continue your adventure.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-heading text-3xl font-bold text-brown-deep mb-2">
            <Sparkles className="h-8 w-8 text-amber-warm" aria-hidden="true" />
            Life RPG
          </Link>
          <p className="text-brown-soft">Welcome back, adventurer</p>
        </div>

        <div className="bg-parchment rounded-[16px] p-8 shadow-lg border border-amber-warm/15">
          <h1 className="font-heading text-2xl font-bold text-brown-deep mb-6 text-center">
            Log In
          </h1>
          <LoginForm />
        </div>

        <p className="text-center text-brown-soft text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-amber-warm hover:text-amber-dark font-semibold transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
