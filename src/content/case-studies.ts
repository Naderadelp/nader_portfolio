import type { CaseStudy } from '@/content/types';

export const caseStudies = [
  /* ------------------------------------------------------------------ */
  {
    slug: 'property-portal-pipeline',
    title: 'Property-portal publishing pipeline',
    subtitle:
      'Publishing a Cairo real-estate group’s CRM inventory to a major property portal, over an integration where the portal never pushes anything back.',
    role: 'Sole author: 20,665 lines across 96 files, 35 of them test files — plus 10,923 of 10,928 lines of the listing screens’ front end.',
    stack: [
      'Laravel',
      'PHP',
      'Eloquent',
      'Laravel Queues',
      'Task Scheduling',
      'REST API Integration',
      'PHPUnit',
    ],
    metrics: [
      { label: 'Authorship', value: '100%', detail: 'Sole author of the subsystem' },
      { label: 'Lines', value: '20,665', detail: 'Across 96 files' },
      { label: 'Test files', value: '35' },
      { label: 'Readiness reasons', value: '22', detail: 'After deleting 14 unreachable cases' },
      { label: 'Publication states', value: '7' },
      { label: 'Queued jobs', value: '5', detail: 'Publish, unpublish, delete, sync, reconcile' },
    ],
    diagramKey: 'publish-pipeline',
    sections: [
      {
        heading: 'Problem',
        paragraphs: [
          `The group's CRM already held the inventory: every unit, its photographs, its permit paperwork, its price. A major property portal held the same listings a second time, because agents typed them in again by hand. Two copies drift the moment either one is touched, and afterwards nobody can say which one is true.`,
          `I built the pipeline that publishes CRM inventory to the portal, so a listing is written once, in the CRM.`,
        ],
      },
      {
        heading: 'Constraint',
        paragraphs: [
          `The portal sends no webhooks. I can publish, unpublish, delete, and ask for the current state of a listing, but nothing ever arrives unprompted. When a listing expires, when a permit is rejected, when a moderator takes something down, the portal knows and I do not. Local state is a guess about a remote system I cannot observe, and a guess that is never corrected turns into a lie.`,
          `The portal also rate limits, answering 429 with a retry_after, and publishing a whole project's worth of units will reach that limit. The agents are not developers, so a refused publish must tell them what to fix.`,
        ],
      },
      {
        heading: 'Approach',
        paragraphs: [
          `With no push channel available, I added a pull one. An hourly reconcile sweep, written as a scheduled command, reads the portal's state for the listings we track and corrects the local PublicationState to match. The publication enum has seven states: draft, pending permit, active, expired, rejected, unpublished and failed. The sweep is what makes expired and rejected reachable, because only the portal knows about those transitions. Five queued jobs carry the work: publish, unpublish, delete, sync and reconcile. The client is rate-limit-aware and honours retry_after on a 429. The sync path takes a lockForUpdate, because two concurrent publishes of the same listing would otherwise create a duplicate property on the portal and burn the reference.`,
          `Before any of that runs, a readiness service decides whether the listing can be published, and reports every blocker rather than failing on the first one. A 22-case reason enum covers the conditions: missing agent, unmapped property type, unavailable location, size out of range, missing or duplicated permit number, too many images, unavailable amenity, and so on. Each reason also names the form field the agent has to fix, so the interface can jump straight to the right tab.`,
          `That enum used to be larger. Fourteen further reason cases were deleted once it was clear the form-request validation already enforced exactly the same rules on write: purpose, reference, title, description, price, rent frequency, room ranges. A listing could not reach the publish step with any of them wrong, so those codes were unreachable. Rejecting a listing for one of them now surfaces as a validation error on write, not as a readiness problem found later. Deleting unreachable cases kept the enum honest.`,
        ],
      },
      {
        heading: 'Trade-off',
        paragraphs: [
          `The hourly sweep means local state can be up to an hour stale: a listing the portal expired at ten past the hour still reads as active until the next run. I accepted it because the portal offers no push mechanism, and a tighter schedule buys freshness with rate-limit budget better spent on publishing.`,
          `The readiness check also costs an extra pass over the listing before every publish. That is the price of listing everything wrong in one go instead of only the first thing.`,
        ],
      },
      {
        heading: 'Outcome',
        paragraphs: [
          `Agents no longer retype listings into the portal, the CRM is the only place a listing is written, and a refused publish names both the reason and the field to fix. A state we get wrong is wrong for an hour, not indefinitely.`,
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'erp-bidirectional-sync',
    title: 'ERP bidirectional sync',
    subtitle:
      'Keeping a mobile sales-agent backend and the company ERP in sync in both directions, without the two systems talking to each other in circles.',
    role: 'Primary author. About 73% of the integration layer: 2,937 of 4,048 lines across 52 files, 17 of them test files.',
    stack: [
      'Laravel',
      'PHP',
      'Eloquent Observers',
      'Laravel Queues',
      'Task Scheduling',
      'Webhooks',
      'REST API Integration',
      'PHPUnit',
    ],
    metrics: [
      { label: 'Authorship', value: '~73%', detail: 'Primary author of the integration layer' },
      { label: 'Lines', value: '2,937 / 4,048', detail: 'Across 52 files' },
      { label: 'Test files', value: '6' },
      { label: 'Scheduled pulls', value: '8', detail: 'One per inbound entity' },
      { label: 'In production with', value: '~50 field sales agents' },
    ],
    diagramKey: 'erp-sync',
    sections: [
      {
        heading: 'Problem',
        paragraphs: [
          `A mobile backend for field sales agents needed the same products, stock, categories and prices that the company ERP holds. The ERP is the system of record for that data. The app is where the agents work, usually on a phone, often standing in front of a customer, sometimes on a connection that barely holds.`,
          `Calling the ERP on the request path would have put an external system in charge of how fast our screens load, and whether they load at all. So the data had to live in our own database and be kept current in both directions.`,
        ],
      },
      {
        heading: 'Constraint',
        paragraphs: [
          `Bidirectional sync has one failure mode that matters more than the rest, and it is the loop. We push a record to the ERP, the ERP answers with its remote id, we save that id on our model, the save fires model events, the observer enqueues another push, and from then on the two systems talk to each other forever with no human involved.`,
          `The second constraint is that a change is not always a column. A media attachment or a pivot-table row is a change an agent can see on screen, and if only plain row updates sync, the data ends up subtly wrong in ways nobody can reproduce or explain.`,
        ],
      },
      {
        heading: 'Approach',
        paragraphs: [
          `Outbound, model observers enqueue push jobs that go through a typed ERP client, so the shape of every request and response is checked at the boundary instead of somewhere inside the business logic. The observer then writes the returned remote id back without re-triggering model events. That one decision is what prevents the infinite loop: the id is persisted, and the persistence is silent.`,
          `Inbound, there are two channels. Webhook ingestion behind an API-key validator handles what the ERP does push, and eight scheduled pull commands cover the rest: products, stock, categories, units of measure, locations, vendors, visits and salespeople. The pulls are the safety net. A webhook that never arrives is invisible by definition, while a scheduled pull that finds a difference is not.`,
          `An event-type enum covers row changes, media changes and pivot-table changes, so attaching an image or updating a pivot row syncs the same way an ordinary column update does, rather than through a special case bolted on later. A SyncRun table records the outcome of every run. That matters more than it sounds, because a sync that fails silently is worse than one that does not run at all: the silent failure looks exactly like success.`,
        ],
      },
      {
        heading: 'Trade-off',
        paragraphs: [
          `The system is eventually consistent. An agent can act on stock data that is minutes old, which occasionally means a quantity on screen is not the quantity in the ERP.`,
          `I accepted that because the alternative was synchronous ERP calls on the request path, which trades an occasional stale number for a permanent dependency: every screen as slow as the ERP is that morning, and every ERP hiccup an outage in our app. The SyncRun table is the compensation. Staleness you can see and measure is a different thing from staleness a customer discovers for you.`,
        ],
      },
      {
        heading: 'Outcome',
        paragraphs: [
          `It is live with roughly 50 field sales agents. Media and pivot changes propagate like any other write, the loop the design was built to prevent has not happened, and when a run fails it is visible in SyncRun rather than being noticed later by the person whose numbers were wrong.`,
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'derived-workflow-state',
    title: 'Derived workflow state',
    subtitle:
      'An HR appraisal objective-setting workflow whose stages are computed from evidence instead of stored in a status column.',
    role: 'Primary author. About 85% of the subsystem: 2,334 of 2,731 lines across 17 files, plus 2,725 of 5,698 lines of its front end.',
    stack: [
      'Laravel',
      'PHP',
      'Eloquent Global Scopes',
      'Middleware',
      'Domain Modelling',
      'PHPUnit',
    ],
    metrics: [
      { label: 'Authorship', value: '~85%', detail: 'Primary author of the subsystem' },
      { label: 'Lines', value: '2,334 / 2,731', detail: 'Across 17 files' },
      { label: 'Workflow stages', value: '5', detail: 'All derived, none stored' },
      { label: 'Status columns', value: '0', detail: 'Nothing to drift, nothing to backfill' },
    ],
    diagramKey: 'derived-state',
    sections: [
      {
        heading: 'Problem',
        paragraphs: [
          `HR runs an appraisal objective-setting workflow across the group. Employees write objectives and submit them, managers review them, and the whole thing moves through five stages.`,
          `The obvious implementation is a status column, and it is also the one that rots. A status column is a second copy of something the timestamps already prove, and every code path that forgets to update it leaves a record whose displayed stage disagrees with what actually happened. On appraisal data that is not a cosmetic bug, because the stage is what decides who is allowed to edit what.`,
        ],
      },
      {
        heading: 'Constraint',
        paragraphs: [
          `Three things shaped the design. The stage shown to a user has to be defensible from evidence, because people argue about appraisals and someone will eventually ask why a record says what it says. The submission window is a hard deadline, and once it closes nothing may change. And the data is salary-adjacent, so a manager must see their own reporting line and nothing else, on every query, including the one endpoint somebody adds in a hurry six months from now.`,
        ],
      },
      {
        heading: 'Approach',
        paragraphs: [
          `The five stages — draft, submitted, manager-reviewed, senior-reviewed, and read-only once the window closes — are derived from the submission and review timestamps rather than stored. Submission and review are already recorded as facts, each with a time on it. The stage is a function of those facts, computed on read. There is no status column to drift, no migration to backfill when the workflow changes, and no way for the displayed stage to disagree with the evidence, because it is the evidence.`,
          `Middleware closes the submission window. Once the deadline passes, everything becomes read-only. The decision worth naming is that it fails closed: if the check itself errors, it locks rather than letting the write through. Fail-open would mean a bug in a date comparison could quietly reopen an appraisal cycle, with nobody finding out until the numbers had already been used.`,
          `Visibility lives in a hierarchy-aware Eloquent global scope. Every manager sees their own reporting line, and no controller performs a per-query permission check — there is none to forget. Getting this wrong leaks salary-adjacent information about someone's colleagues, and that is the kind of rule that belongs in one place rather than repeated across controllers with slightly different conditions.`,
        ],
      },
      {
        heading: 'Trade-off',
        paragraphs: [
          `Deriving the stage costs a little more computation on every read than reading a column would. For this workload that is a fair trade, because the cost on the other side is a field that is allowed to be wrong.`,
          `The larger trade-off is that the derivation rules live in code rather than in data. Changing how the workflow behaves means a deploy rather than a configuration edit, and HR cannot reshape the stages without an engineer. I would make the same call again: the rules are stable, and correctness mattered more than configurability.`,
        ],
      },
      {
        heading: 'Outcome',
        paragraphs: [
          `It is used by HR across the group. There is no class of bug where the displayed stage disagrees with the record, because that state is not representable, and access to another manager's reporting line is decided in one scope instead of at every call site.`,
        ],
      },
    ],
  },
] satisfies CaseStudy[];

export const caseStudiesBySlug = Object.fromEntries(
  caseStudies.map((study) => [study.slug, study]),
) as Record<(typeof caseStudies)[number]['slug'], (typeof caseStudies)[number]>;

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}
