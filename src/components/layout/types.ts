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
  | "about"
  | "experience"
  | "work"
  | "stack"
  | "car-tracker"
  | "contact";

/** Sections that get a nav entry. `car-tracker` is deliberately absent — it
 *  reports as "work" in the active-section indicator. */
export type NavSectionId = Exclude<SectionId, "car-tracker">;

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
