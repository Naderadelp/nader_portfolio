"use client";

import { useEffect, useRef } from "react";

/**
 * A 2px amber bar across the top of the viewport showing how far down the
 * document the reader is.
 *
 * Written straight to the DOM through a ref rather than through React state.
 * A scroll handler that calls setState runs a render on every frame of every
 * scroll; this one only writes a transform, which the compositor handles
 * without touching layout. The listener is passive so it can never delay a
 * scroll.
 *
 * Hidden from assistive technology: it is a decorative echo of the scrollbar,
 * and announcing a percentage that changes continuously would be noise.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      // How far the document can actually travel. Zero on a page shorter than
      // the viewport, which would otherwise divide by zero.
      const travel = doc.scrollHeight - doc.clientHeight;
      const progress = travel > 0 ? doc.scrollTop / travel : 0;
      bar.style.transform = `scaleX(${progress})`;
    };

    // Coalesce bursts of scroll events into one write per frame.
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
    >
      <div
        ref={barRef}
        style={{ transform: "scaleX(0)" }}
        className="h-full origin-left bg-gradient-to-r from-accent to-accent-hover"
      />
    </div>
  );
}
