import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Life RPG character and start your adventure.",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-heading text-3xl font-bold text-brown-deep mb-2">
            <Sparkles className="h-8 w-8 text-amber-warm" aria-hidden="true" />
            Life RPG
          </Link>
          <p className="text-brown-soft">Create your character and begin the quest</p>
        </div>

        <div className="bg-parchment rounded-[16px] p-8 shadow-lg border border-amber-warm/15">
          <h1 className="font-heading text-2xl font-bold text-brown-deep mb-6 text-center">
            Sign Up
          </h1>
          <SignupForm />
        </div>

        <p className="text-center text-brown-soft text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-warm hover:text-amber-dark font-semibold transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
