import type { NavItem } from "@/components/layout/types";

/**
 * The site nav, shared by the home page and every project page so the two can
 * never disagree. Ordered for a client: what I do, the proof, how working
 * together goes, who I am, how to reach me.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: "services", label: "Services" },
  { id: "work", label: "Work" },
  { id: "process", label: "Process" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];
