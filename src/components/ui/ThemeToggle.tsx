"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { cn } from "./cn";
import { MoonIcon, SunIcon } from "./icons";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}

function readStored(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function writeStored(theme: Theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private mode / blocked storage: the choice just does not persist.
  }
}

/**
 * The <html> class is the source of truth — it is written before first paint by
 * the inline script in layout.tsx. Subscribing to it rather than mirroring it
 * in React state keeps the two from drifting.
 */
function subscribeToThemeClass(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function readThemeClass(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** No class exists during prerender, so the label stays generic until hydration. */
function readThemeOnServer(): Theme | null {
  return null;
}

/**
 * Theme toggle. Never causes a flash: the pre-paint script has already put the
 * class on <html>, and this component only reads and flips it.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(
    subscribeToThemeClass,
    readThemeClass,
    readThemeOnServer,
  );

  // Follow the OS while the reader has made no explicit choice.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      if (readStored() !== null) return;
      applyTheme(event.matches ? "dark" : "light");
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = readThemeClass() === "dark" ? "light" : "dark";
    applyTheme(next);
    writeStored(next);
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      // Before mount `theme` is null and the label stays generic — no
      // hydration mismatch, and the icons are swapped by CSS regardless.
      aria-label={
        theme === null
          ? "Toggle colour theme"
          : theme === "dark"
            ? "Switch to light theme"
            : "Switch to dark theme"
      }
      title="Toggle colour theme"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md border border-hairline",
        "text-fg-secondary transition-colors duration-150",
        "hover:border-accent/50 hover:text-accent",
        className,
      )}
    >
      {/* CSS decides which icon is visible, so the server and client markup match. */}
      <MoonIcon className="size-[18px] dark:hidden" />
      <SunIcon className="hidden size-[18px] dark:block" />
    </button>
  );
}
