"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/schemas/auth";
import Link from "next/link";
import { EmailInput } from "@/components/auth/email-input";
import { Loader2, Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const parsed = loginSchema.safeParse({ email, password });
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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setServerError("Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/app");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
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
        id="login-email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        placeholder="adventurer@quest.com"
        autoComplete="email"
      />

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="login-password" className="block text-sm font-medium text-brown-dark">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-amber-warm hover:text-amber-dark font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brown-soft/60">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </div>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2.5 bg-cream border border-amber-warm/30 rounded-[10px] text-brown-dark placeholder:text-brown-soft/50 focus:outline-none focus:ring-2 focus:ring-amber-warm/50 transition-all text-sm"
            placeholder="Your password"
            autoComplete="current-password"
            required
          />
        </div>
        {errors.password && (
          <p className="text-ember text-xs mt-1" role="alert">{errors.password}</p>
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
            Logging in...
          </>
        ) : (
          "Log In"
        )}
      </button>
    </form>
  );
}
