"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "./cn";
import { CheckIcon, CopyIcon } from "./icons";

interface CopyEmailButtonProps {
  email: string;
  className?: string;
  /** How long the "Copied" state stays up. */
  resetAfterMs?: number;
}

type CopyState = "idle" | "copied" | "failed";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path below.
  }

  // Legacy fallback for non-secure contexts.
  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(field);
    return ok;
  } catch {
    return false;
  }
}

/** Copies the address and shows a "Copied" state for ~2s. */
export function CopyEmailButton({
  email,
  className,
  resetAfterMs = 2000,
}: CopyEmailButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onClick = useCallback(async () => {
    const ok = await copyToClipboard(email);
    setState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), resetAfterMs);
  }, [email, resetAfterMs]);

  const label =
    state === "copied"
      ? "Copied"
      : state === "failed"
        ? "Press Ctrl+C"
        : "Copy email";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group/copy inline-flex items-center gap-2 rounded-md border border-hairline",
        "bg-surface px-3 py-2 font-mono text-label text-fg-secondary",
        "transition-colors duration-150",
        "hover:border-accent/50 hover:text-accent",
        className,
      )}
    >
      {state === "copied" ? (
        <CheckIcon className="size-4 shrink-0 text-accent" />
      ) : (
        <CopyIcon className="size-4 shrink-0" />
      )}
      <span className="tracking-normal">{email}</span>
      <span className="sr-only"> — {label}</span>
      <span
        aria-hidden
        className={cn(
          "ml-1 uppercase tracking-[0.08em]",
          state === "copied" ? "text-accent" : "text-fg-muted",
        )}
      >
        {state === "copied" ? "copied" : state === "failed" ? "ctrl+c" : "copy"}
      </span>
      {/* Announced separately so screen readers hear the result, not the label swap. */}
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied"
          ? "Email address copied to clipboard"
          : state === "failed"
            ? "Could not copy automatically"
            : ""}
      </span>
    </button>
  );
}
