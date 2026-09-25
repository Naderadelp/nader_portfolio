/**
 * Work inside systems owned by other people.
 *
 * This is a separate list from `case-studies.ts` on purpose. Those three are
 * subsystems where the authorship figure is 73-100%, and they are written as
 * full case studies. These two are not: they are 12% and 18% of codebases
 * other engineers own, and presenting them at the same weight would imply a
 * scope that `git blame` does not support.
 *
 * They are here because they are still the second-largest thing on the CV, and
 * because landing a feature inside a 37,000-line domain that two other people
 * wrote is a different skill from building something alone — it is the skill
 * the About section actually claims.
 *
 * Every number below was measured with `git blame -w -M -C` on 25 September
 * 2026, counting surviving lines per author.
 */
import type { Contribution } from '@/content/types';

export const contributions = [
  {
    id: 'service-desk-sla',
    title: 'SLA clocks that stop when the clock should stop',
    context: 'An internal IT service desk used across the group.',
    /* 1,452 of 11,579 surviving lines across the service. */
    authorship:
      'About 12% of the service — 1,452 of 11,579 lines. Sole author of the pause tracking and the recomputation path; the escalation command is a colleague’s work, not mine.',
    paragraphs: [
      `An SLA clock that keeps running while a ticket is waiting on the person who raised it measures the wrong thing. Someone asks for a VPN account, the operator asks which system, the requester goes on leave for three days, and the resolution target breaches. The report then says the operator was slow, which is both false and the sort of number people stop trusting.`,
      `I built the pause and resume tracking: the clock stops when a request moves into a waiting state and starts again when it comes back, and the elapsed time is accumulated rather than recomputed from the creation stamp. I added priority-based overrides on top, so a P1 does not inherit a category's ordinary targets.`,
      `The part that turned out to matter most was recomputation. Targets live on the category, and when someone edits a category's first-response or resolution time, the tickets already open under it have to move too. Without that, the matrix on screen and the deadlines in the database quietly disagree, and only the database is enforced. I also made cancel and reopen comments typed, so reopening adjusts the resolution due-date — a reopened ticket that keeps its original deadline is already breached the moment it reopens.`,
    ],
    tech: ['Laravel', 'PHP', 'PostgreSQL', 'Queued Jobs', 'PHPUnit'],
    screenshot: {
      src: '/screenshots/service-desk/service-desk-sla-matrix.jpg',
      alt: 'Service-desk category table with columns for department, priority, first-response target, resolution target, mode and status. Rows are grouped under Account & Access and Network & Connectivity, with targets ranging from 30 minutes to 24 hours.',
      caption:
        'The category taxonomy and its SLA targets. Editing a row here has to move the deadlines on every ticket already open under it, which is the recomputation path.',
      width: 1400,
      height: 874,
    },
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
    screenshot: null,
  },
] satisfies Contribution[];
