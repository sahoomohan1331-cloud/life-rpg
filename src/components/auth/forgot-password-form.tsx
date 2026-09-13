"use client";

import { useState } from "react";
import Link from "next/link";
import { EmailInput } from "@/components/auth/email-input";
import { forgotPasswordSchema } from "@/schemas/auth";
import { Loader2, ArrowLeft, MailCheck, ExternalLink, Sparkles } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const parsed = forgotPasswordSchema.safeParse({ email });
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
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json?.error?.message || "Failed to request password reset.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      if (json.data?.previewUrl) {
        setPreviewUrl(json.data.previewUrl);
      }
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-5 animate-in fade-in">
        <div className="p-4 rounded-[12px] bg-green-muted/10 border border-green-muted/30 text-brown-deep">
          <div className="flex items-center gap-2.5 mb-2 text-green-muted font-bold">
            <MailCheck className="h-5 w-5" />
            <span>Recovery Scroll Dispatched!</span>
          </div>
          <p className="text-xs text-brown-soft leading-relaxed">
            If an account is associated with <span className="font-semibold text-brown-deep">{email}</span>, a secure password recovery link has been created and will expire in 1 hour.
          </p>
        </div>

        {/* Developer / Local Testing Helper */}
        {previewUrl && (
          <div className="p-3.5 rounded-[10px] bg-cream border border-amber-warm/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-dark">
              <Sparkles className="h-3.5 w-3.5 text-amber-warm" />
              <span>Developer Direct Reset Link:</span>
            </div>
            <p className="text-[11px] text-brown-soft">
              Since Life RPG is operating in local development mode, you can immediately test your password reset link here:
            </p>
            <Link
              href={previewUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[6px] bg-amber-warm hover:bg-amber-warm/90 text-brown-deep transition-all shadow-2xs"
            >
              <span>Open Reset Password Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <div className="pt-2">
          <Link
            href="/login"
            className="w-full py-2.5 px-4 rounded-[10px] border border-amber-warm/30 text-brown-deep hover:bg-cream font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Log In</span>
          </Link>
        </div>
      </div>
    );
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
        id="forgot-email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        placeholder="adventurer@quest.com"
        autoComplete="email"
        autoFocus
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-amber-warm text-brown-deep font-bold rounded-[10px] hover:bg-amber-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Dispatching Recovery Scroll...
          </>
        ) : (
          "Send Reset Link"
        )}
      </button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-brown-soft hover:text-brown-deep transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Remember your password? Log in</span>
        </Link>
      </div>
    </form>
  );
}
