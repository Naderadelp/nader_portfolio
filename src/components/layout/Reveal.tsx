"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { cn } from "@/components/ui/cn";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger in ms. Use multiples of ~40 for a list. */
  delay?: number;
  className?: string;
  as?: ElementType;
}

/**
 * Fade + 10px translateY when the element scrolls into view.
 *
 * The hidden state is declared in globals.css on `[data-reveal]`, so the very
 * first paint is already correct and there is no flash. `prefers-reduced-motion`
 * and `<noscript>` both force the visible state from CSS.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // `prefers-reduced-motion` needs no special case here: globals.css forces
    // the visible state with !important, so the observer below is inert.
    if (typeof IntersectionObserver === "undefined") {
      // Very old browser: reveal immediately by writing the attribute the CSS
      // keys off, rather than round-tripping through React state.
      node.setAttribute("data-revealed", "true");
      return;
    }

    // Anything already in view on load resolves on the observer's first call.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      data-revealed={revealed ? "true" : "false"}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
