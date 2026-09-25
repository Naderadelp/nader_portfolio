/**
 * Work inside systems owned by other people.
 *
 * This is a separate list from `case-studies.ts` on purpose. Those three are
 * subsystems where the authorship figure is 73-100%, and they are written as
 * full case studies. These are not: they are 12-41% of codebases other
 * engineers own, and presenting them at the same weight would imply a scope
 * that `git blame` does not support.
 *
 * They are here because they are still a large part of the CV, and because
 * landing a feature inside a 37,000-line domain that two other people wrote
 * is a different skill from building something alone — it is the skill the
 * About section actually claims.
 *
 * Every number below was measured with `git blame -w -M -C` on 25 September
 * 2026, counting surviving lines per author.
 *
 * Screenshots are from staging accounts on test data, and each was cropped
 * and blurred before commit: the product name of the service desk, the group
 * company's logo, development project names, the browser bar and every URL.
 * Operator screens that listed real colleagues were left out, not blurred.
 */
import type { Contribution } from '@/content/types';

export const contributions = [
  {
    id: 'service-desk-sla',
    title: 'SLA clocks that stop when the clock should stop',
    context: 'An internal IT service desk used across the group.',
    /* Backend: 1,452 of 11,579 surviving lines across the service.
       Requester pages in the main platform: 1,372 of 2,433 lines. */
    authorship:
      'About 12% of the service backend — 1,452 of 11,579 lines — and 56% of the requester pages in the main platform, 1,372 of 2,433 lines. Sole author of the pause tracking and the recomputation path; the escalation command and the operator console are colleagues’ work, not mine.',
    paragraphs: [
      `An SLA clock that keeps running while a ticket is waiting on the person who raised it measures the wrong thing. Someone asks for a VPN account, the operator asks which system, the requester goes on leave for three days, and the resolution target breaches. The report then says the operator was slow, which is both false and the sort of number people stop trusting.`,
      `I built the pause and resume tracking: the clock stops when a request moves into a waiting state and starts again when it comes back, and the elapsed time is accumulated rather than recomputed from the creation stamp. I added priority-based overrides on top, so a P1 does not inherit a category's ordinary targets.`,
      `The part that turned out to matter most was recomputation. Targets live on the category, and when someone edits a category's first-response or resolution time, the tickets already open under it have to move too. Without that, the matrix on screen and the deadlines in the database quietly disagree, and only the database is enforced. I also made cancel and reopen comments typed, so reopening adjusts the resolution due-date — a reopened ticket that keeps its original deadline is already breached the moment it reopens.`,
      `On the requester's side I wrote most of what people see: cancelling or reopening a request with a required reason, rating a resolved one, attachments, and half of the chat front door, including messages that mix Arabic and Latin script in one line. The client-side breach check follows one rule from the backend: while the clock is paused, an open target cannot show as breached, so the breach highlight never contradicts the "paused" chip next to it.`,
    ],
    tech: ['Laravel', 'PHP', 'PostgreSQL', 'Queued Jobs', 'Next.js', 'TypeScript', 'PHPUnit'],
    screenshots: [
      {
        src: '/screenshots/service-desk/service-desk-sla-matrix.jpg',
        alt: 'Service-desk category table with columns for department, priority, first-response target, resolution target, mode and status. Rows are grouped under Account & Access and Network & Connectivity, with targets ranging from 30 minutes to 24 hours.',
        caption:
          'The category taxonomy and its SLA targets. Editing a row here has to move the deadlines on every ticket already open under it, which is the recomputation path.',
        width: 1400,
        height: 874,
      },
      {
        src: '/screenshots/service-desk/service-desk-chat.jpg',
        alt: 'Chat front door titled "How can we help?", with four suggested requests — VPN or system access, a CRM bug, a new report, shared-drive access — above a message box.',
        caption:
          'Where a request starts: a conversation that gets classified into a ticket. Product name blurred.',
        width: 720,
        height: 905,
      },
      {
        src: '/screenshots/service-desk/service-desk-my-requests.jpg',
        alt: 'My Requests list with status filters and a "Breached only" toggle. Several open tickets carry a red "SLA breached" badge and a red edge; cancelled ones do not.',
        caption:
          'The requester’s list. A cancelled ticket is never marked breached, and one waiting on its requester would not be either — the check follows the paused clock.',
        width: 730,
        height: 915,
      },
    ],
  },
  {
    id: 'tenders',
    title: 'Tenders, imported from spreadsheets and totalled per currency',
    context:
      'A tender-management module in the group’s project platform: construction, design and consultancy packages, from issue to award.',
    /* Backend: 2,963 of 7,184 surviving lines across 57 tender files, 1,742 of
       them in tests. Frontend: 658 of 3,869 lines. */
    authorship:
      'Second-largest contributor to the module — 2,963 of 7,184 backend lines, about 41%, of which 1,742 are tests — plus 658 of 3,869 frontend lines. The dashboard’s layout and most of its analytics are a colleague’s work; the currency totals behind one tile are mine.',
    paragraphs: [
      `Tenders exist in spreadsheets long before anyone types them into a system, so I wrote the import. Each row is validated against the same rules the create and update forms apply, with one deliberate relaxation: operation zones may be left empty and added later from the interface. A status in the sheet is applied as an update rather than written straight to the column, so the status log, the end date and the cancellation bookkeeping run exactly as they do when a person clicks the button. A contract price on anything not yet awarded is refused, because the price lives on an approval form that only an awarded tender has.`,
      `Cancelling a tender takes one of six required reasons, with a free-text note required only for "other", and reverting a cancellation clears the end date it set. I also extended the queued job that pushes each tender to the company ERP, so the cancellation reason and phase travel with it, and wrote the command that pulls tender types back from the ERP.`,
      `Contract prices come in more than one currency, and adding them into one figure produces a number that means nothing. The dashboard total is grouped by currency, largest first, counts only the latest approval form for each tender, and names a single currency only when there is exactly one.`,
    ],
    tech: ['Laravel', 'PHP', 'PostgreSQL', 'Queued Jobs', 'Spreadsheet Import', 'Next.js', 'PHPUnit'],
    screenshots: [
      {
        src: '/screenshots/tenders/tenders-list.jpg',
        alt: 'Tenders table with reference numbers, tender types such as Construction and Design Package, blurred project and phase columns, status badges for Awarded, Offers Received, Issued and Cancelled, and start and end dates.',
        caption:
          'The tender register. References are generated from the project and tender type; project and phase names are blurred.',
        width: 1735,
        height: 780,
      },
      {
        src: '/screenshots/tenders/tenders-dashboard.jpg',
        alt: 'Tender dashboard with tiles for total tenders, active, awarded, total contract price in USD with "+2 more currencies", and win rate, above a pipeline by status and an approval SLA panel.',
        caption:
          'Staging data. The contract-price tile reads the per-currency totals: one figure, and a count of the currencies it did not add in.',
        width: 1730,
        height: 715,
      },
    ],
  },
  {
    id: 'task-management',
    title: 'Workload, measured against the days someone actually works',
    context:
      'A task workspace inside the main platform — a 37,000-line domain with two engineers ahead of me in it.',
    /* 6,786 of 37,327 surviving lines on the staging branch. */
    authorship:
      'Third-largest contributor to the domain — 6,786 of 37,327 lines, about 18%. One feature landed across 59 files and 4,899 lines. On the staging branch, not in production yet.',
    paragraphs: [
      `Assigning work fairly needs an answer to "who is already full", and a count of open tasks is not that answer. Someone working three days a week with four tasks is in more trouble than someone working five days with six.`,
      `I built the workload report to measure assigned work against each member's configured working days, so a lead sees capacity rather than volume before they assign anything. Alongside it: project membership, so a project has its own member list rather than inheriting the whole workspace, and a cancellation guard that stops a task being cancelled out from under work that depends on it.`,
      `Most of the effort here was not the feature. It was landing 59 files inside a domain two other engineers wrote, without breaking what they had built — which meant reading a great deal more code than I changed, and writing feature tests for the notification, status-transition and permission paths that my changes touched.`,
    ],
    tech: ['Laravel', 'PHP', 'PostgreSQL', 'DDD-style layering', 'PHPUnit'],
    screenshots: [
      {
        src: '/screenshots/tasks/tasks-list.jpg',
        alt: 'Task workspace in list view, with tasks grouped by status — Backlog, To Do, In Progress, In Review, Done, Cancelled — and tabs for board, table, calendar, Gantt, workload, docs, sprints and goals.',
        caption:
          'The workspace, on a staging test list. These views are my colleagues’ front end; my work is the API behind the Workload tab, membership and the cancellation guard.',
        width: 1815,
        height: 930,
      },
      {
        src: '/screenshots/tasks/tasks-board.jpg',
        alt: 'The same list as a board, one column per status, with a single test task in Backlog.',
        caption:
          'The same list as a board, one column per status.',
        width: 1815,
        height: 930,
      },
    ],
  },
] satisfies Contribution[];
