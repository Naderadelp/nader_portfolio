/**
 * What a freelance client needs from this site, as plain data.
 *
 * The rest of `src/content` is written for an engineer reading carefully. This
 * file is for a client with a problem and five minutes: what can I hire him
 * for, how does it work, and what did each project actually change.
 *
 * The same discipline applies as everywhere else. Every service is backed by
 * projects on this site, every deliverable is something already shown, and no
 * number appears here that is not countable somewhere else on the page.
 */
import type {
  Engagement,
  ProjectGlance,
  Service,
} from '@/content/types';

export const services = [
  {
    id: 'integrations',
    title: 'Third-party integrations and data sync',
    summary:
      'Connect your app to the systems it depends on — an ERP, a CRM, a listing portal — and keep both sides agreeing, including when the other side never tells you something changed.',
    includes: [
      'Typed API clients with rate-limit and retry handling',
      'Webhooks in, queued jobs out',
      'Scheduled reconciliation for systems that send nothing back',
      'A record of every sync run, so failures are visible',
    ],
    proof: ['property-portal-pipeline', 'erp-bidirectional-sync', 'tenders'],
  },
  {
    id: 'laravel-backend',
    title: 'Laravel backends, APIs and admin panels',
    summary:
      'A new backend or new features on yours: schema, domain logic, queued jobs, a REST API, roles and permissions, and a Filament admin panel — with tests.',
    includes: [
      'REST APIs with Sanctum or Passport authentication',
      'Role-based permissions',
      'Filament admin panels',
      'PHPUnit and Pest feature tests',
    ],
    proof: ['car-tracker', 'service-desk-sla'],
  },
  {
    id: 'existing-codebase',
    title: 'Features and fixes in an existing Laravel codebase',
    summary:
      'Changes inside code someone else wrote, landed without breaking what is already there. Most of my production work has been exactly this, in a codebase shared by around 40 engineers.',
    includes: [
      'Tests around the paths I touch, before I change them',
      'Queue, scheduling and workflow bugs',
      'State that has drifted out of sync with reality',
      'Access rules kept in one place, not repeated per endpoint',
    ],
    proof: ['task-management', 'derived-workflow-state'],
  },
  {
    id: 'dashboards',
    title: 'Next.js screens on your backend',
    summary:
      'Internal tools and dashboards in Next.js and TypeScript, built against the API they read from — lists, filters, status views and forms.',
    includes: [
      'Next.js and React with Tailwind CSS',
      'Status views that show what the backend actually knows',
      'Tables and filters over large lists',
    ],
    proof: ['property-portal-pipeline', 'service-desk-sla', 'derived-workflow-state'],
  },
] satisfies Service[];

export const engagement = {
  availability: 'Taking freelance work · ~20h/week',
  steps: [
    {
      title: 'Tell me what you need',
      body: 'Email the problem, your stack and any deadline. I reply with the questions I need answered before I can scope it.',
    },
    {
      title: 'A written scope',
      body: 'What I will build, what I will not, and how we will both know it is done. Fixed-price or hourly, quoted once we have talked it through.',
    },
    {
      title: 'Start small',
      body: 'For a new client I suggest a small paid first task, so you can see how I work before committing to more.',
    },
    {
      title: 'Visible progress',
      body: 'Work lands in your repository as pull requests with tests, with a short written update each week: what shipped, what is next, what is blocked.',
    },
  ],
  terms: [
    'About 20 hours a week',
    'Full overlap with EU business hours; US East until roughly 1pm ET',
    'Fixed-price or hourly, quoted after a short conversation',
    'Remote, in your repository and your tools',
  ],
  recommendations: {
    label: 'Recommendations on LinkedIn',
    href: 'https://www.linkedin.com/in/nader-adel-7a3546196/details/recommendations/',
  },
  contact: {
    heading: 'Tell me what you’re building.',
    body: 'I take on freelance backend work — integrations, Laravel features and APIs, fixes in existing codebases — at about 20 hours a week, and I am open to full-time backend roles too. Email is the fastest way to reach me: include the stack, what is going wrong or what you need built, and any deadline.',
    subject: 'Project enquiry',
  },
} satisfies Engagement;

/**
 * The ten-second summary at the top of each project page. Keyed by work slug.
 * Every clause is a compression of the full write-up below it, never an
 * addition to it.
 */
export const projectGlance: Record<string, ProjectGlance> = {
  'property-portal-pipeline': {
    problem:
      'Agents typed every listing twice — once in the CRM, again on a property portal that never reports anything back.',
    built:
      'A publishing pipeline: a readiness check that lists every blocker at once, queued publish jobs, rate-limit handling, and an hourly sweep that reads the portal’s state back.',
    result:
      'Listings are written once, in the CRM. A refused publish names the reason and the field to fix.',
  },
  'erp-bidirectional-sync': {
    problem:
      'Field sales agents needed the ERP’s products, stock and prices on their phones — without the ERP on every request.',
    built:
      'Two-way sync: changes pushed out through queued jobs, pulled in through webhooks and eight scheduled pulls, with no write-back loop.',
    result:
      'Live with about 50 field agents, and every sync run is recorded, so a failure is visible instead of silent.',
  },
  'derived-workflow-state': {
    problem:
      'An HR objectives workflow where a stored status column would drift away from what actually happened.',
    built:
      'Five stages derived from timestamps, a submission window that fails closed, and visibility scoped to each manager’s reporting line.',
    result:
      'Used by HR across the group. The stage on screen cannot disagree with the record, because it is computed from it.',
  },
  'service-desk-sla': {
    problem:
      'SLA clocks kept running while tickets waited on the person who raised them, so reports blamed operators for delays they did not cause.',
    built:
      'Pause-aware SLA tracking, recomputation when a category’s targets change, and most of the screens requesters use.',
    result:
      'A breach flag means an actual breach — on the backend and on the screen.',
  },
  tenders: {
    problem:
      'Tenders arrived in spreadsheets, and contract totals in several currencies added up to a number that meant nothing.',
    built:
      'A validated spreadsheet import, cancellation with required reasons, fields synced to the ERP, and contract totals per currency.',
    result:
      'An imported tender goes through the same rules as a typed one, and totals are reported per currency.',
  },
  'task-management': {
    problem:
      'Leads assigned work by counting open tasks, which ignores that some people work fewer days than others.',
    built:
      'A workload report measured against each member’s working days, project membership, and a guard against cancelling tasks other work depends on.',
    result:
      'Landed across 59 files in a domain two other engineers own. On the staging branch, not in production yet.',
  },
  'car-tracker': {
    problem:
      'Keeping track of a car’s services, documents, fuel and costs by hand.',
    built:
      'A Laravel API and Filament admin panel with reminders by date or odometer, push notifications, and a mobile client.',
    result:
      'A public repository with 100 routes and 32 test files, on a seeded database.',
  },
};
