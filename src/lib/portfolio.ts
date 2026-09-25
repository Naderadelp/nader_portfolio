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
  contributions,
  engagement,
  experience,
  profile,
  projectGlance,
  projects,
  services,
  stack,
} from '@/content';
import type {
  CarTracker,
  CaseStudy,
  CodeExcerpt,
  Contact,
  ProcessContent,
  ServiceCard,
  ExperienceItem,
  Profile,
  RepoCard,
  ScreenShot,
  StackGroup,
  WorkCard,
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
];

/**
 * The field-sales client for the bidirectional ERP sync case study.
 *
 * Published under a strict rule: no personal data, and nothing that names the
 * client. Every frame here was checked individually and edited before it was
 * committed — the account name and logo on the dashboard are covered, the one
 * real vendor name in Today's Visits is covered, and the product branding is
 * blurred. Nine further frames from the same set were discarded outright
 * rather than edited, because they were lists of real vendor names and there
 * is no honest way to redact a screen whose entire content is people.
 *
 * What survives is what actually supports the case study: aggregate counts
 * that came from the ERP sync (1,918 vendors, 71 stock lines), and the order
 * flow the ~50 field agents use.
 */
export const erpScreenshots: ScreenShot[] = [
  {
    src: '/screenshots/erp/erp-field-app-dashboard.jpg',
    alt: 'Field agent home screen showing a check-in prompt, counters for orders, invoices, stock lines and vendors, and a list of the day\u2019s visits.',
    caption: 'Counters fed by the ERP sync — 1,918 vendors and 71 stock lines held locally, so the screen renders without an ERP call on the request path.',
    width: 591,
    height: 1280,
  },
  {
    src: '/screenshots/erp/erp-field-app-product.jpg',
    alt: 'Product selected in an order, showing batch number and unit price, with a quantity sheet open over it.',
    caption: 'Batch number and unit price arrive with the product, so the agent is quoting the same figure the ERP holds.',
    width: 591,
    height: 1280,
  },
  {
    src: '/screenshots/erp/erp-field-app-order-summary.jpg',
    alt: 'Order summary listing the line item and price, a notes field, cheque and cash payment options, and a subtotal, tax and total breakdown.',
    caption: 'Order summary with tax resolved before submission — the totals are computed where the price came from.',
    width: 591,
    height: 1280,
  },
];

/**
 * Desktop screens for case studies, where there is something showable.
 *
 * All from staging on seed data, with the portal's name and its property ID
 * blurred. The appraisal module beside the objectives is not included: blame
 * gives me about 1% of its front end, so it is not mine to show. Nor is the
 * employee list, whose rows are real-looking people.
 */
export const caseStudyScreenshots: Record<string, ScreenShot[]> = {
  'property-portal-pipeline': [
    {
      src: '/screenshots/listings/listing-publish-status.jpg',
      alt: 'Listing table with a publish-status column showing Active, Rejected, Failed and Not set badges, and an error column with the portal’s rejection reasons, such as an invalid permit number.',
      caption:
        'Every listing’s publish state, with the portal’s own rejection reason beside it — what an agent reads instead of a stack trace. Portal name blurred.',
      width: 1500,
      height: 670,
    },
    {
      src: '/screenshots/listings/listing-publish-state.jpg',
      alt: 'Publish-state panel for a single listing: status Active, the portal’s property ID (blurred) and the published-at time, under the note "Mirrored from the last sync — sends no webhooks".',
      caption:
        'The state on one listing is a mirror, and says so: the portal sends no webhooks, so this is what the last reconcile sweep found.',
      width: 1716,
      height: 270,
    },
  ],
  'derived-workflow-state': [
    {
      src: '/screenshots/objectives/objectives-approved-locked.jpg',
      alt: 'My Objectives for 2026-H2 marked "Approved & locked": three weighted objectives adding to 100%, and below them an advisory AI quality check flagging objectives that are not SMART.',
      caption:
        'Approved and locked — the stage shown here is derived, not stored. The AI quality check underneath is advisory only: it flags objectives that are not SMART and never blocks a submission.',
      width: 730,
      height: 845,
    },
    {
      src: '/screenshots/objectives/objectives-submission-status.jpg',
      alt: 'Submission status for a manager: 13 of 45 submitted, 32 not submitted, 45 in scope, and a button to remind all 32.',
      caption:
        'Submission progress across one manager’s reporting line, and a single reminder for everyone still outstanding. Staging data.',
      width: 1690,
      height: 180,
    },
  ],
};

export const adaptedCarTracker: CarTracker = {
  title: carTrackerProject?.name ?? 'car-tracker',
  description: carTrackerProject?.summary ?? '',
  bullets: carTrackerProject?.highlights ?? [],
  tech: carTrackerProject?.stack ?? [],
  repoUrl: carTrackerProject?.repoUrl ?? 'https://github.com/Naderadelp/car-tracker',
  screenshots: SCREENSHOTS,
};

/* -------------------------------------------------------------------------- */
/* Work grid                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The size of each claim, cut down to one line for a card. The full
 * authorship statement is on the project's own page; these must never say
 * more than it does.
 */
const CARD_CLAIMS: Record<string, string> = {
  'property-portal-pipeline': 'Sole author · 20,665 lines',
  'erp-bidirectional-sync': 'Primary author · ~73%',
  'derived-workflow-state': 'Primary author · ~85%',
  'service-desk-sla': '12% of backend · 56% of requester UI',
  tenders: '~41% of the module backend',
  'task-management': '~18% of the domain',
  'car-tracker': 'Own project · public repo',
};

/**
 * Covers for the cards. Case studies with no showable UI get one figure from
 * their own metrics list — the same number, never a new one.
 */
const CARD_COVERS: Record<string, WorkCard['cover']> = {
  'property-portal-pipeline': {
    type: 'image',
    shot: {
      src: '/screenshots/listings/listing-publish-status.jpg',
      alt: '',
      width: 1500,
      height: 670,
    },
  },
  'erp-bidirectional-sync': { type: 'image', shot: erpScreenshots[0] },
  'derived-workflow-state': {
    type: 'image',
    shot: {
      src: '/screenshots/objectives/objectives-approved-locked.jpg',
      alt: '',
      width: 730,
      height: 845,
    },
  },
  tenders: {
    type: 'image',
    shot: contributions.find((c) => c.id === 'tenders')!.screenshots[1],
  },
  'car-tracker': { type: 'phones', shots: mobileScreenshots },
};

function claimFor(slug: string): string {
  const claim = CARD_CLAIMS[slug];
  if (!claim) throw new Error(`No card claim for "${slug}" in CARD_CLAIMS.`);
  return claim;
}

/**
 * Every project, in reading order: the three case studies, the three
 * contributions, then car-tracker. The order is the argument — largest
 * ownership first.
 */
export const workCards: WorkCard[] = [
  ...caseStudies.map((study) => ({
    slug: study.slug,
    kind: 'case-study' as const,
    kindLabel: 'Case study',
    title: study.title,
    summary: study.subtitle,
    claim: claimFor(study.slug),
    tech: study.stack.slice(0, 4),
    cover: CARD_COVERS[study.slug],
  })),
  ...contributions.map((item) => ({
    slug: item.id,
    kind: 'contribution' as const,
    kindLabel: 'Shared codebase',
    title: item.title,
    summary: item.context,
    claim: claimFor(item.id),
    tech: item.tech.slice(0, 4),
    cover: CARD_COVERS[item.id] ?? {
      type: 'image' as const,
      shot: item.screenshots.find((s) => s.width > 1200) ?? item.screenshots[0],
    },
  })),
  {
    slug: 'car-tracker',
    kind: 'own-project',
    kindLabel: 'Own project',
    title: adaptedCarTracker.title,
    summary: adaptedCarTracker.description,
    claim: claimFor('car-tracker'),
    tech: adaptedCarTracker.tech.slice(0, 4),
    cover: CARD_COVERS['car-tracker'],
  },
];

export function getWorkCard(slug: string): WorkCard | undefined {
  return workCards.find((card) => card.slug === slug);
}

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
  heading: engagement.contact.heading,
  body: engagement.contact.body,
  email: EMAIL,
};

/** The "start a project" link: the email, with the subject already filled in. */
export const contactHref = `mailto:${EMAIL}?subject=${encodeURIComponent(engagement.contact.subject)}`;

/* -------------------------------------------------------------------------- */
/* Freelance: services and process                                             */
/* -------------------------------------------------------------------------- */

export const serviceCards: ServiceCard[] = services.map((service) => ({
  id: service.id,
  title: service.title,
  summary: service.summary,
  includes: service.includes,
  proof: service.proof.map((slug) => {
    const card = getWorkCard(slug);
    if (!card) throw new Error(`Service "${service.id}" cites unknown project "${slug}".`);
    return { href: `/work/${slug}`, label: card.title };
  }),
}));

export const processContent: ProcessContent = {
  availability: engagement.availability,
  steps: engagement.steps,
  terms: engagement.terms,
  recommendations: engagement.recommendations,
};

/** The ten-second summary for a project page, when there is one. */
export function getGlance(slug: string) {
  return projectGlance[slug];
}

/** Both CV variants, offered side by side. */
export const cvLinks = profile.cvs;
