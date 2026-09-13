"use client";

import { useState, useId, useEffect } from "react";
import { validateRealEmail, type EmailValidationResult } from "@/lib/email-validator";
import { Mail, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  autoFocus?: boolean;
  showLiveFeedback?: boolean;
}

export function EmailInput({
  value,
  onChange,
  error,
  id: propId,
  label = "Email",
  placeholder = "adventurer@quest.com",
  autoComplete = "email",
  required = true,
  autoFocus = false,
  showLiveFeedback = true,
}: EmailInputProps) {
  const generatedId = useId();
  const inputId = propId || generatedId;
  const [liveCheck, setLiveCheck] = useState<EmailValidationResult | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    if (!value || !showLiveFeedback) {
      setLiveCheck(null);
      return;
    }

    // Live validation
    if (value.includes("@")) {
      const result = validateRealEmail(value);
      setLiveCheck(result);
    } else {
      setLiveCheck(null);
    }
  }, [value, showLiveFeedback]);

  function applySuggestion(suggestion: string) {
    onChange(suggestion);
  }

  const activeError = error || (isTouched && liveCheck && !liveCheck.isValid ? liveCheck.error : undefined);
  const isValidState = liveCheck?.isValid && !error;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="block text-sm font-medium text-brown-dark">
          {label}
        </label>
        {isValidState && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-muted">
            <CheckCircle2 className="h-3 w-3" />
            <span>Valid Domain</span>
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brown-soft/60">
          <Mail className="h-4 w-4" aria-hidden="true" />
        </div>
        <input
          id={inputId}
          type="email"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isTouched) setIsTouched(true);
          }}
          onBlur={() => setIsTouched(true)}
          className={`w-full pl-9.5 pr-4 py-2.5 bg-cream border rounded-[10px] text-brown-dark placeholder:text-brown-soft/50 focus:outline-none focus:ring-2 transition-all text-sm ${
            activeError
              ? "border-ember/60 focus:ring-ember/40 focus:border-ember"
              : isValidState
              ? "border-green-muted/50 focus:ring-green-muted/30 focus:border-green-muted"
              : "border-amber-warm/30 focus:ring-amber-warm/50 focus:border-amber-warm"
          }`}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          autoFocus={autoFocus}
          aria-invalid={!!activeError}
          aria-describedby={activeError ? `${inputId}-error` : undefined}
        />
      </div>

      {/* Typo Suggestion pill */}
      {liveCheck?.suggestion && (
        <div className="flex items-center gap-1.5 p-2 rounded-[8px] bg-amber-warm/15 border border-amber-warm/30 text-xs text-brown-dark animate-in fade-in">
          <Sparkles className="h-3.5 w-3.5 text-amber-warm shrink-0" />
          <span>Did you mean</span>
          <button
            type="button"
            onClick={() => applySuggestion(liveCheck.suggestion!)}
            className="font-bold underline text-amber-dark hover:text-brown-deep cursor-pointer"
          >
            {liveCheck.suggestion}
          </button>
          <span>?</span>
        </div>
      )}

      {/* Error message */}
      {activeError && (
        <div id={`${inputId}-error`} className="flex items-center gap-1 text-ember text-xs mt-1" role="alert">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
}
