"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { signupSchema } from "@/schemas/auth";
import { EmailInput } from "@/components/auth/email-input";
import { Loader2 } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    // Client-side validation
    const parsed = signupSchema.safeParse({ email, password, confirmPassword });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        fieldErrors[key] = msgs?.[0] || "Invalid";
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      // Create account
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setServerError(data?.error?.message || "Failed to create character. Please try again.");
        setLoading(false);
        return;
      }

      // Auto-login
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setServerError("Account created! Please log in.");
        setLoading(false);
        router.push("/login");
        return;
      }

      router.push("/app");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && (
        <div className="bg-ember/10 text-ember border border-ember/20 rounded-[8px] px-4 py-3 text-sm" role="alert">
          {serverError}
        </div>
      )}

      {/* Real Email Input with Live Typo Suggestions */}
      <EmailInput
        id="signup-email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        placeholder="adventurer@quest.com"
        autoComplete="email"
      />

      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-brown-dark mb-1.5">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 bg-cream border border-amber-warm/30 rounded-[8px] text-brown-dark placeholder:text-brown-soft/50 focus:outline-none focus:ring-2 focus:ring-amber-warm/50 transition-all"
          placeholder="Min 8 characters"
          autoComplete="new-password"
          required
        />
        {errors.password && (
          <p className="text-ember text-xs mt-1" role="alert">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="signup-confirm" className="block text-sm font-medium text-brown-dark mb-1.5">
          Confirm Password
        </label>
        <input
          id="signup-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2.5 bg-cream border border-amber-warm/30 rounded-[8px] text-brown-dark placeholder:text-brown-soft/50 focus:outline-none focus:ring-2 focus:ring-amber-warm/50 transition-all"
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
        />
        {errors.confirmPassword && (
          <p className="text-ember text-xs mt-1" role="alert">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-amber-warm text-brown-deep font-bold rounded-[8px] hover:bg-amber-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Creating Character...
          </>
        ) : (
          "Create Character"
        )}
      </button>
    </form>
  );
}
