"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/schemas/auth";
import { Loader2 } from "lucide-react";

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

      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-brown-dark mb-1.5">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 bg-cream border border-amber-warm/30 rounded-[8px] text-brown-dark placeholder:text-brown-soft/50 focus:outline-none focus:ring-2 focus:ring-amber-warm/50 transition-all"
          placeholder="adventurer@quest.com"
          autoComplete="email"
          required
        />
        {errors.email && (
          <p className="text-ember text-xs mt-1" role="alert">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-brown-dark mb-1.5">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 bg-cream border border-amber-warm/30 rounded-[8px] text-brown-dark placeholder:text-brown-soft/50 focus:outline-none focus:ring-2 focus:ring-amber-warm/50 transition-all"
          placeholder="Your password"
          autoComplete="current-password"
          required
        />
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
