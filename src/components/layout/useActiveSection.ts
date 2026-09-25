"use client";

import { useEffect, useState } from "react";
import type { NavSectionId, SectionId } from "./types";

/** Sections with no nav entry report under the entry they belong to. */
const NAV_ALIAS: Partial<Record<SectionId, NavSectionId>> = {
  pipeline: "about",
  experience: "about",
  stack: "about",
};

function toNavId(id: SectionId): NavSectionId {
  return NAV_ALIAS[id] ?? (id as NavSectionId);
}

/**
 * Scroll-spy. Watches a horizontal band in the upper third of the viewport and
 * reports the first section crossing it, falling back to the last section once
 * the page is scrolled to the bottom (short trailing sections never reach the
 * band otherwise).
 */
export function useActiveSection(ids: readonly SectionId[]): NavSectionId | null {
  const [active, setActive] = useState<NavSectionId | null>(null);

  useEffect(() => {
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    if (nodes.length === 0) return;

    const visible = new Set<string>();
    let atBottom = false;

    const recompute = () => {
      if (atBottom) {
        setActive(toNavId(ids[ids.length - 1]));
        return;
      }
      const first = ids.find((id) => visible.has(id));
      if (first) setActive(toNavId(first));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        recompute();
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 },
    );

    for (const node of nodes) observer.observe(node);

    const onScroll = () => {
      const next =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 24;
      if (next !== atBottom) {
        atBottom = next;
        recompute();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids]);

  return active;
}
