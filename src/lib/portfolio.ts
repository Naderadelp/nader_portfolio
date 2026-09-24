/**
 * Adapter between the content layer (`@/content`) and the shape the layout
 * shell expects (`@/components/layout/types`).
 *
 * The two were authored independently against different contracts. Rather than
 * rewrite either, this maps one onto the other in a single place, so the
 * content stays plain data and the shell stays presentational.
 *
 * Code excerpts live here rather than in `@/content` because they are display
 * artefacts, not facts about Nader. Every excerpt from the private employer
 * monorepo is **paraphrased** — renamed, trimmed and rewritten to carry the
 * decision without reproducing the source. Each one says so via `note`.
 */

import {
  caseStudies,
  experience,
  profile,
  projects,
  stack,
} from '@/content';
import type {
  CarTracker,
  CaseStudy,
  CodeExcerpt,
  Contact,
  ExperienceItem,
  Profile,
  RepoCard,
  ScreenShot,
  StackGroup,
} from '@/components/layout/types';

/* -------------------------------------------------------------------------- */
/* Profile                                                                     */
/* -------------------------------------------------------------------------- */

const laravelCv =
  profile.cvs.find((cv) => cv.id === 'laravel') ?? profile.cvs[0];

const emailSocial = profile.socials.find((s) => s.platform === 'email');
const EMAIL = emailSocial?.handle ?? 'naderadelpp@gmail.com';

export const adaptedProfile: Profile = {
  name: profile.name,
  role: profile.role,
  positioning: profile.tagline,
  location: profile.location,
  // The sidebar prints this immediately after `location`, in 12px uppercase
  // mono on one line. `availability.summary` there rendered as "CAIRO, EGYPT
  // · BASED IN CAIRO. FULL OVERLAP WITH..." — three wrapped lines of shouted
  // capitals that opened by repeating the location. One availability point
  // fits; the hours detail is still stated in full, as prose, in Contact.
  timezoneNote:
    profile.availability.points.find((point) => /remote/i.test(point)) ??
    profile.timezone,
  email: EMAIL,
  cvHref: laravelCv.href,
  cvFileName: laravelCv.href.split('/').pop() ?? 'cv.pdf',
  socials: profile.socials.map((s) => ({
    label: s.label,
    href: s.href,
    icon: s.platform,
  })),
};

/** The longer positioning paragraphs, rendered in the About section. */
export const aboutParagraphs: string[] = profile.positioning;

/* -------------------------------------------------------------------------- */
/* Experience                                                                  */
/* -------------------------------------------------------------------------- */

/** Technologies shown per role. Drawn from the stack actually used there. */
const ROLE_TECH: Record<string, string[]> = {
  'address-investments-engineer': [
    'Laravel 12',
    'PostgreSQL',
    'Redis',
    'Laravel Queues',
    'Next.js',
  ],
  'address-investments-intern': ['Laravel 9', 'MySQL', 'Redis'],
};

export const adaptedExperience: ExperienceItem[] = experience.map((role) => ({
  id: role.id,
  period: role.period,
  company: role.company,
  title: role.title,
  summary: role.summary,
  bullets: role.highlights,
  tech: ROLE_TECH[role.id] ?? [],
}));

/* -------------------------------------------------------------------------- */
/* Case studies                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Paraphrased excerpts. None of these is copied source: each was rewritten
 * from memory of the decision, with employer and vendor names removed, so it
 * illustrates the design without republishing private code.
 */
const CODE_EXCERPTS: Record<string, CodeExcerpt> = {
  'property-portal-pipeline': {
    filename: 'ReadinessService.php',
    language: 'php',
    note: 'Paraphrased from a private repository — names changed, logic preserved.',
    code: `/**
 * Collect EVERY blocker, not just the first.
 *
 * Failing fast would make an agent fix one field, retry, and fail on the
 * next. The publish is attempted only against a clean result.
 */
public function check(Listing $listing): ReadinessResult
{
    $problems = [];

    foreach ($this->rules as $rule) {
        if (($reason = $rule->evaluate($listing)) !== null) {
            // The reason knows its form field, so the UI can deep-link
            // the agent to the right tab.
            $problems[] = new ReadinessProblem($reason);
        }
    }

    return new ReadinessResult($problems);
}`,
  },
  'erp-bidirectional-sync': {
    filename: 'RemoteIdWriter.php',
    language: 'php',
    note: 'Paraphrased from a private repository — names changed, logic preserved.',
    code: `/**
 * Write the remote id back WITHOUT re-firing model events.
 *
 * A plain save() here would re-trigger this same listener, enqueue another
 * push, and loop forever. saveQuietly() is the whole trick.
 */
public function pushed(Syncable $model, int $remoteId): void
{
    $model->remote_id = $remoteId;
    $model->synced_at = now();

    $model->saveQuietly();
}`,
  },
  'derived-workflow-state': {
    filename: 'PeriodObjective.php',
    language: 'php',
    note: 'Paraphrased from a private repository — names changed, logic preserved.',
    code: `/**
 * The stage is derived, never stored.
 *
 * There is no status column to drift, no backfill migration, and no way for
 * the displayed stage to disagree with the timestamps that prove it.
 */
public function stage(): Stage
{
    return match (true) {
        $this->senior_reviewed_at !== null => Stage::SeniorReviewed,
        $this->manager_reviewed_at !== null => Stage::ManagerReviewed,
        $this->submitted_at !== null => Stage::Submitted,
        default => Stage::Draft,
    };
}`,
  },
};

export const adaptedCaseStudies: CaseStudy[] = caseStudies.map((study) => {
  // One <p> per paragraph downstream: the content layer writes 1-3 paragraphs
  // per section, and joining them lost every break in prose that already runs
  // 400-600 words per case study.
  const section = (heading: string) =>
    study.sections.find((s) => s.heading === heading)?.paragraphs ?? [];

  const [primaryMetric] = study.metrics;

  return {
    id: study.slug,
    title: study.title,
    subtitle: study.subtitle,
    tech: study.stack,
    narrative: {
      problem: section('Problem'),
      constraint: section('Constraint'),
      approach: section('Approach'),
      tradeoff: section('Trade-off'),
      outcome: section('Outcome'),
    },
    metric: {
      value: primaryMetric?.value ?? '',
      label: primaryMetric?.label ?? '',
      mechanism: primaryMetric?.detail ?? study.role,
    },
    diagramId: study.diagramKey,
    code: CODE_EXCERPTS[study.slug],
  };
});

/** Secondary metrics, rendered as a small mono row beneath the primary one. */
export const secondaryMetrics: Record<
  string,
  { value: string; label: string }[]
> = Object.fromEntries(
  caseStudies.map((study) => [
    study.slug,
    study.metrics.slice(1).map((m) => ({ value: m.value, label: m.label })),
  ]),
);

/** Authorship line, shown under each case study title. */
export const caseStudyRoles: Record<string, string> = Object.fromEntries(
  caseStudies.map((study) => [study.slug, study.role]),
);

/* -------------------------------------------------------------------------- */
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

const carTrackerProject = projects.find((p) => p.hasScreenshots);

export const adaptedRepos: RepoCard[] = projects
  .filter((p) => !p.hasScreenshots)
  .map((p) => ({
    name: p.name,
    description: p.repoUrl ? p.summary : `${p.summary} (${p.note ?? 'no public repository'})`,
    href: p.repoUrl ?? '',
    tech: p.stack,
  }));

const SCREENSHOTS: ScreenShot[] = [
  {
    src: '/screenshots/01-car-tracker-dashboard-fleet-kpis.jpg',
    alt: 'Admin dashboard with six KPI tiles and a dual-axis twelve-month fuel spend and volume chart.',
    caption: 'Dashboard — KPI tiles with month-over-month deltas, and a dual-axis twelve-month chart.',
    width: 1165,
    height: 652,
  },
  {
    src: '/screenshots/04-car-tracker-reminders-notification-workflow.jpg',
    alt: 'Reminders table showing date and odometer thresholds alongside a notified or pending state column.',
    caption: 'Reminders — each row fires on a date or an odometer threshold, with its notification state.',
    width: 1165,
    height: 652,
  },
  {
    src: '/screenshots/05-car-tracker-api-json-paginated-response.jpg',
    alt: 'Raw JSON API response showing a resource envelope and a pagination meta block.',
    caption: 'API response — resource envelope with a pagination meta block.',
    width: 1165,
    height: 652,
  },
  {
    src: '/screenshots/06-car-tracker-roles-rbac-permissions.jpg',
    alt: 'Roles screen listing three roles with their permission counts on the api guard.',
    caption: 'Roles — permission counts per role, all on the api guard.',
    width: 1165,
    height: 652,
  },
  {
    src: '/screenshots/02-car-tracker-cars-fleet-listing.jpg',
    alt: 'Cars table with sortable columns for owner, brand, model, odometer and warranty status.',
    caption: 'Cars — sortable columns, search, and warranty status indicators.',
    width: 1165,
    height: 652,
  },
  {
    src: '/screenshots/07-car-tracker-documents-expiry-tracking.jpg',
    alt: 'Documents register with colour-coded type badges sorted by expiry date.',
    caption: 'Documents — colour-coded types, sorted by expiry.',
    width: 1165,
    height: 652,
  },
];

/**
 * The mobile client for the same project, captured on a real device.
 *
 * These are the better exhibit: they show derived behaviour rather than CRUD
 * screens - a service plan projected against a live odometer, expiry resolved
 * into three states, a warranty tracked against a date and a mileage cap at
 * once. Portrait 590x1280, so they lay out as a scrolling strip rather than
 * stacked full width.
 */
export const mobileScreenshots: ScreenShot[] = [
  {
    src: '/screenshots/mobile/car-tracker-mobile-home-dashboard.jpg',
    alt: 'Car-tracker mobile home screen showing current mileage, a map card with the car\u2019s last parked location, and a progress bar counting down to the next scheduled service.',
    caption: 'Odometer state, last known parking location and the next service interval, resolved in one call.',
    width: 590,
    height: 1280,
  },
  {
    src: '/screenshots/mobile/car-tracker-mobile-services-schedule.jpg',
    alt: 'Services tab listing upcoming maintenance intervals from 40,000 km to 100,000 km, each with kilometres remaining, item count and cost in EGP.',
    caption: 'The service plan projected against the live odometer to compute what is due, when, and at what cost.',
    width: 590,
    height: 1280,
  },
  {
    src: '/screenshots/mobile/car-tracker-mobile-documents-expiry.jpg',
    alt: 'Documents list with each item badged Valid, Expiring soon or Expired, and a days-remaining countdown on the ones about to lapse.',
    caption: 'Expiry dates resolved into three states, with a days-left countdown and a roll-up for anything lapsing soon.',
    width: 590,
    height: 1280,
  },
  {
    src: '/screenshots/mobile/car-tracker-mobile-warranty-more.jpg',
    alt: 'Warranty card showing active status, expiry date and a mileage-limit progress bar with kilometres remaining.',
    caption: 'Warranty tracked against two independent limits at once, surfacing whichever will be hit first.',
    width: 590,
    height: 1280,
  },
  {
    src: '/screenshots/mobile/car-tracker-mobile-monthly-report.jpg',
    alt: 'Monthly report showing spend with month-over-month change, fill-up count, distance and cost per kilometre, plus a weekly bar chart.',
    caption: 'Period aggregation with a month-over-month delta and derived metrics like cost per kilometre.',
    width: 590,
    height: 1280,
  },
  {
    src: '/screenshots/mobile/car-tracker-mobile-costs-breakdown.jpg',
    alt: 'Costs tab showing total lifetime spend with a stacked bar splitting it into fuel and service, above a per-interval cost list.',
    caption: 'Lifetime spend decomposed by category and rolled back up per service interval.',
    width: 590,
    height: 1280,
  },
  {
    src: '/screenshots/mobile/car-tracker-mobile-fuel-add-fillup.jpg',
    alt: 'Fuel tab with efficiency, fill-up count and spend tiles, and an Add Fill-up sheet with litres, odometer, cost and date fields.',
    caption: 'The odometer is pre-filled from the car state, and each fill-up feeds the efficiency figure above.',
    width: 590,
    height: 1280,
  },
  {
    src: '/screenshots/mobile/car-tracker-mobile-service-centers.jpg',
    alt: 'Nearby service centres list, each showing open or closed status, distance away, opening hours and call and directions actions.',
    caption: 'Branches sorted by distance, with opening hours evaluated against the current time to derive open or closed.',
    width: 590,
    height: 1280,
  },
  {
    src: '/screenshots/mobile/car-tracker-mobile-document-type-picker.jpg',
    alt: 'Bottom sheet listing the six supported document types.',
    caption: 'Document types as a constrained enum rather than free text, so expiry rules apply per type.',
    width: 590,
    height: 1280,
  },
];

export const adaptedCarTracker: CarTracker = {
  title: carTrackerProject?.name ?? 'car-tracker',
  description: carTrackerProject?.summary ?? '',
  bullets: carTrackerProject?.highlights ?? [],
  tech: carTrackerProject?.stack ?? [],
  repoUrl: carTrackerProject?.repoUrl ?? 'https://github.com/Naderadelp/car-tracker',
  screenshots: SCREENSHOTS,
};

/* -------------------------------------------------------------------------- */
/* Stack                                                                       */
/* -------------------------------------------------------------------------- */

export const adaptedStack: StackGroup[] = stack.map((group) => ({
  label: group.label,
  items: group.items,
}));

/* -------------------------------------------------------------------------- */
/* Contact                                                                     */
/* -------------------------------------------------------------------------- */

export const adaptedContact: Contact = {
  heading: 'Contact',
  body: `I am open to backend roles and to freelance work. ${profile.availability.summary} The fastest way to reach me is email.`,
  email: EMAIL,
};

/** Both CV variants, offered side by side. */
export const cvLinks = profile.cvs;
