"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordSchema } from "@/schemas/auth";
import { Loader2, CheckCircle2, Lock, ArrowRight, AlertCircle } from "lucide-react";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="p-4 rounded-[12px] bg-ember/10 border border-ember/20 text-ember text-sm flex items-start gap-2 text-left">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Missing Reset Token</p>
            <p className="text-xs mt-1 text-brown-dark">
              No password reset token was provided in the URL. Please request a new recovery link.
            </p>
          </div>
        </div>

        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-amber-warm text-brown-deep font-semibold text-xs hover:bg-amber-dark transition-colors shadow-2xs"
        >
          <span>Request New Reset Link</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const parsed = resetPasswordSchema.safeParse({ token, password, confirmPassword });
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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json?.error?.message || "Failed to reset password. Token may be expired.");
        setLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-5 text-center animate-in fade-in">
        <div className="p-4 rounded-[12px] bg-green-muted/10 border border-green-muted/30 text-green-muted text-center space-y-2">
          <CheckCircle2 className="h-8 w-8 mx-auto text-green-muted" />
          <h3 className="font-heading text-lg font-bold text-brown-deep">
            Password Re-forged! ⚔️
          </h3>
          <p className="text-xs text-brown-soft">
            Your adventurer credentials have been securely updated. You can now log in with your new password.
          </p>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="w-full py-3 bg-amber-warm text-brown-deep font-bold rounded-[10px] hover:bg-amber-dark transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <span>Proceed to Log In</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && (
        <div className="bg-ember/10 text-ember border border-ember/20 rounded-[8px] px-4 py-3 text-sm flex items-start gap-2" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-brown-dark mb-1.5">
          New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brown-soft/60">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </div>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2.5 bg-cream border border-amber-warm/30 rounded-[10px] text-brown-dark placeholder:text-brown-soft/50 focus:outline-none focus:ring-2 focus:ring-amber-warm/50 transition-all text-sm"
            placeholder="Min 8 characters"
            autoComplete="new-password"
            required
            autoFocus
          />
        </div>
        {errors.password && (
          <p className="text-ember text-xs mt-1" role="alert">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirm-new-password" className="block text-sm font-medium text-brown-dark mb-1.5">
          Confirm New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brown-soft/60">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </div>
          <input
            id="confirm-new-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2.5 bg-cream border border-amber-warm/30 rounded-[10px] text-brown-dark placeholder:text-brown-soft/50 focus:outline-none focus:ring-2 focus:ring-amber-warm/50 transition-all text-sm"
            placeholder="Repeat new password"
            autoComplete="new-password"
            required
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-ember text-xs mt-1" role="alert">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-amber-warm text-brown-deep font-bold rounded-[10px] hover:bg-amber-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Re-forging Password...
          </>
        ) : (
          "Save New Password"
        )}
      </button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-xs text-brown-soft hover:text-brown-deep transition-colors font-medium"
        >
          Cancel and return to log in
        </Link>
      </div>
    </form>
  );
}
