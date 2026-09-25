/**
 * Shape contract between the layout/UI shell and `@/content/*`.
 *
 * The content modules are authored by a different agent. These types are what
 * the shell expects to be handed; they exist so `src/app/page.tsx` can render
 * placeholder data with the same shape and keep the build green until the real
 * content lands.
 */

/** Sections that the scroll-spy observes, in document order. */
export type SectionId =
  | "services"
  | "work"
  | "process"
  | "about"
  | "pipeline"
  | "experience"
  | "stack"
  | "contact";

/**
 * Sections that get a nav entry.
 *
 * The nav is ordered for a client: what I do, the proof, how working together
 * goes, who I am, how to reach me. `pipeline`, `experience` and `stack` have no
 * entry of their own — they are the evidence behind About — and report under
 * it through NAV_ALIAS rather than growing the nav past five items.
 */
export type NavSectionId = Exclude<
  SectionId,
  "pipeline" | "experience" | "stack"
>;

export interface NavItem {
  id: NavSectionId;
  label: string;
}

export interface SocialLink {
  label: string;
  href: string;
  /** Which built-in icon to draw. */
  icon: "github" | "linkedin" | "email";
}

export interface Profile {
  name: string;
  /** One-line role, e.g. "Backend Engineer · Laravel / PHP". */
  role: string;
  /** Short positioning sentence under the role. */
  positioning: string;
  location: string;
  /** Stated up front so remote hiring managers never have to ask. */
  timezoneNote: string;
  email: string;
  /** Path to the PDF inside `public/`. */
  cvHref: string;
  cvFileName: string;
  socials: SocialLink[];
}

export interface ExperienceItem {
  id: string;
  /** Mono-set date range, e.g. "2024 — Present". */
  period: string;
  company: string;
  title: string;
  summary: string;
  bullets: string[];
  tech: string[];
  href?: string;
}

export interface Metric {
  /** The countable number itself, mono-set. Pre-formatted, e.g. "20,665". */
  value: string;
  /** What the number counts, e.g. "lines of production code". */
  label: string;
  /** One line on how it was produced or verified. */
  mechanism: string;
}

export interface CodeExcerpt {
  filename: string;
  /** Language hint, used for the label only — no runtime highlighter. */
  language?: string;
  /** Plain source. Rendered with mono styling when `html` is absent. */
  code: string;
  /** Optional pre-highlighted HTML, generated at build time. */
  html?: string;
  githubUrl?: string;
  /** Set when the excerpt is paraphrased out of a private repo. */
  note?: string;
}

/**
 * Problem → Constraint → Approach → Trade-off → Outcome.
 *
 * One entry per paragraph. The content layer already breaks each section into
 * paragraphs; flattening them into a single string produced 40-line blocks of
 * uninterrupted prose, so the paragraph breaks are carried through to the DOM.
 */
export interface CaseStudyNarrative {
  problem: string[];
  constraint: string[];
  approach: string[];
  tradeoff: string[];
  outcome: string[];
}

export interface CaseStudy {
  id: string;
  title: string;
  subtitle?: string;
  tech: string[];
  narrative: CaseStudyNarrative;
  metric: Metric;
  /** Key of a diagram component owned by `src/components/diagrams/`. */
  diagramId?: string;
  code?: CodeExcerpt;
  links?: { label: string; href: string }[];
}

export interface RepoCard {
  name: string;
  description: string;
  href: string;
  tech: string[];
}

export interface StackGroup {
  label: string;
  items: string[];
}

export interface ScreenShot {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

export interface CarTracker {
  title: string;
  description: string;
  bullets: string[];
  tech: string[];
  repoUrl: string;
  screenshots: ScreenShot[];
}

/**
 * One card in the Work grid. Every project — case study, contribution or own
 * project — is a card on the home page and a page of its own at
 * `/work/<slug>`.
 */
export type WorkKind = "case-study" | "contribution" | "own-project";

export interface WorkCard {
  slug: string;
  kind: WorkKind;
  /** Mono label on the card, e.g. "Case study". */
  kindLabel: string;
  title: string;
  /** One or two sentences. */
  summary: string;
  /** The size of the claim, short enough for one mono line. */
  claim: string;
  tech: string[];
  /**
   * A photo when one can be shown. Otherwise one measured figure from the
   * project, set large — a diagram shrunk to card size is unreadable.
   */
  cover:
    | { type: "image"; shot: ScreenShot }
    | { type: "phones"; shots: ScreenShot[] }
    | { type: "figure"; value: string; label: string };
}

/** A service card: something a client can hire me for, with its proof. */
export interface ServiceCard {
  id: string;
  title: string;
  summary: string;
  includes: string[];
  /** Links to the project pages that back the claim. */
  proof: { href: string; label: string }[];
}

export interface ProcessContent {
  availability: string;
  steps: { title: string; body: string }[];
  terms: string[];
  recommendations: { label: string; href: string };
}

export interface Contact {
  heading: string;
  body: string;
  email: string;
}

export interface PortfolioContent {
  profile: Profile;
  experience: ExperienceItem[];
  caseStudies: CaseStudy[];
  stack: StackGroup[];
  repos: RepoCard[];
  carTracker: CarTracker;
  contact: Contact;
}
