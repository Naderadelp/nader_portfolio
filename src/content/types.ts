/**
 * Shared types for the portfolio content layer.
 *
 * Everything under `src/content` is plain data. No React, no side effects.
 */

/* -------------------------------------------------------------------------- */
/* Profile                                                                     */
/* -------------------------------------------------------------------------- */

export type SocialPlatform = 'email' | 'github' | 'linkedin';

export interface SocialLink {
  /** Stable key, useful for picking an icon. */
  platform: SocialPlatform;
  /** Human label, e.g. "GitHub". */
  label: string;
  /** What to show on screen, e.g. "github.com/Naderadelp". */
  handle: string;
  /** Where the link points, e.g. "https://github.com/Naderadelp". */
  href: string;
}

export type CvVariantId = 'laravel' | 'node';

export interface CvLink {
  id: CvVariantId;
  label: string;
  /** Path under `public/`. */
  href: string;
  /** One line explaining which version this is. */
  description: string;
}

export interface Availability {
  /** e.g. "Cairo (UTC+3)". */
  base: string;
  /** Short one-line summary of overlap and remote preference. */
  summary: string;
  /** Individual overlap facts, for rendering as a list. */
  points: string[];
}

export interface Profile {
  name: string;
  role: string;
  location: string;
  timezone: string;
  /** Short line that sits under the name. */
  tagline: string;
  /** Longer positioning statement, one entry per paragraph. */
  positioning: string[];
  availability: Availability;
  socials: SocialLink[];
  cvs: CvLink[];
}

/* -------------------------------------------------------------------------- */
/* Experience                                                                  */
/* -------------------------------------------------------------------------- */

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  /** e.g. "Aug 2025". */
  start: string;
  /** e.g. "Aug 2025", or "Present" for the current role. */
  end: string;
  /** e.g. "Aug 2025 — Present", precomputed for display. */
  period: string;
  current: boolean;
  /** One or two sentences framing the role. */
  summary: string;
  /** What I actually did, one entry per bullet. */
  highlights: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  location: string;
  year: string;
}

export interface LanguageEntry {
  language: string;
  level: string;
}

/* -------------------------------------------------------------------------- */
/* Case studies                                                                */
/* -------------------------------------------------------------------------- */

export type DiagramKey = 'publish-pipeline' | 'erp-sync' | 'derived-state';

export type CaseStudySectionHeading =
  | 'Problem'
  | 'Constraint'
  | 'Approach'
  | 'Trade-off'
  | 'Outcome';

export interface CaseStudySection {
  heading: CaseStudySectionHeading;
  paragraphs: string[];
}

export interface CaseStudyMetric {
  label: string;
  value: string;
  /** Optional extra context, e.g. how the figure was counted. */
  detail?: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  subtitle: string;
  /** Plain statement of authorship and scope. */
  role: string;
  stack: string[];
  metrics: CaseStudyMetric[];
  diagramKey: DiagramKey;
  sections: CaseStudySection[];
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

export interface Project {
  slug: string;
  name: string;
  /** One line describing what it is. */
  summary: string;
  stack: string[];
  /** Short factual bullets. Empty for one-line cards. */
  highlights: string[];
  /** `null` when the repository is not public. */
  repoUrl: string | null;
  /** Explains a missing repo link, or any other caveat. */
  note?: string;
  hasScreenshots?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Stack                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * `experience` means used in production or on a shipped project.
 * `learning` means exactly that, and is never presented as experience.
 */
export type StackGroupKind = 'experience' | 'learning';

export interface StackGroup {
  id: string;
  label: string;
  kind: StackGroupKind;
  /** Flat tag list. Deliberately no ratings, levels or percentages. */
  items: string[];
}
