# Spec — nader_portfolio

**Status:** ready to build
**Date:** 2026-09-24
**Repo:** github.com/Naderadelp/nader_portfolio

## Problem Statement

Nader Adel is a backend engineer in Cairo with a year and a half of production Laravel experience,
hunting for mid-level roles (Egypt + remote for foreign companies) and freelance work. His evidence
is trapped: the strongest work lives in a private employer monorepo he cannot show, his CV is a PDF
nobody can verify, and his best public repo is a GitHub URL with no framing around it. A recruiter
or prospective client has no way to reach, in under two minutes, the conclusion "this person has
built something hard."

## Solution

A single-page portfolio at a public URL that carries one job: **a reader lands, spends 90 seconds,
and leaves able to describe one hard thing Nader built.**

Backend work has no screenshots, so the site substitutes the devices that research shows actually
land: a countable metric callout, a hand-drawn architecture diagram, a short code excerpt linking
to the real file, and a Problem → Constraint → Approach → Trade-off → Outcome case study of
400–600 words. Three of those, plus an experience section above the fold-line, plus the Filament
screenshots from his own `car-tracker` repo as the one place real UI can be shown.

## User Stories

1. As a foreign remote hiring manager, I want to see Nader's timezone overlap stated up front, so that I do not have to raise it as an objection.
2. As a recruiter, I want a one-click PDF CV download, so that I can forward it into an ATS.
3. As a recruiter, I want role, stack and location visible without scrolling, so that I can screen in five seconds.
4. As a hiring manager, I want experience listed above projects, so that I can judge seniority before novelty.
5. As an engineer evaluating a candidate, I want one case study that explains a real distributed-systems problem, so that I can judge depth rather than breadth.
6. As an engineer, I want to see why a design decision was made and what it traded away, so that I can tell whether Nader reasons about systems or just ships tickets.
7. As an engineer, I want code excerpts to link to the real file on GitHub, so that I can verify the claim.
8. As a skeptical reader, I want every number on the site to be countable and checkable, so that I trust the rest of the page.
9. As a freelance client, I want an obvious way to start a conversation, so that I do not have to hunt for an email address.
10. As a visitor, I want the email copyable in one click with visible feedback, so that I do not have to select text.
11. As a mobile visitor, I want the whole site readable in one column, so that I can read it on a phone from LinkedIn.
12. As a visitor on a slow Egyptian connection, I want the page to load fast, so that I do not bounce.
13. As a visitor who prefers light mode, I want a theme toggle defaulting to my system setting, so that the site is comfortable to read.
14. As a visitor with reduced-motion set, I want animation suppressed, so that the site does not make me unwell.
15. As a screen-reader user, I want semantic landmarks and real headings, so that I can navigate the page.
16. As a Laravel hiring manager, I want to see a live API reference, so that I can judge API design without cloning a repo.
17. As a Node-track hiring manager, I want to see TypeScript and Node work represented, so that I do not screen Nader out as PHP-only.
18. As Nader, I want work case studies to name no company but The Address Investments, so that I do not breach confidentiality.
19. As Nader, I want no employer data on the site, so that publishing carries no risk.
20. As Nader, I want to edit content by committing a file, so that updating the site costs nothing and needs no CMS.
21. As Nader, I want the site to cost $0 to run, so that it survives indefinitely without a card on file.
22. As Nader, I want the site to never go down, so that a link I sent a recruiter always works.
23. As Nader, I want a custom domain to drop in later with no rework, so that buying one is a five-minute change.
24. As a visitor, I want to reach the deeper detail of a case study without leaving the page, so that the site stays a single coherent document.

## Implementation Decisions

**Stack.** Next.js with `output: 'export'` — fully static. All content is MDX/TS data files in the
repo; editing is a commit. No database, no API at request time, nothing that can 502. Deployed to
Cloudflare Pages on the free tier (unmetered bandwidth, Cairo PoP, private repo allowed, free
custom domain later).

**Why no Laravel backend.** A read-only API serving Nader's own bio demonstrates nothing a hiring
manager does not already assume, and puts an availability liability on the most-visible link he
owns. The Laravel evidence is carried instead by `car-tracker`'s repo, its captured Filament UI,
and a statically-rendered OpenAPI reference. Revisit only if a live demo app is funded.

**Layout.** Sticky left column (name, role, nav with scroll-spy active indicator, socials, CV
download) beside a scrolling right column at ≥1024px; single column below. Section order:
Hero → Experience → Selected Work → Stack → `car-tracker` → Contact.

**Design tokens.** Geist Sans (body/UI) and Geist Mono (labels, dates, metrics, tech tags — never
body copy). Background `#0b0b0d`, three text tiers, one hairline border, a single violet accent
used only for links, hover and the active nav marker, kept under 5% of pixels. Theme toggle
defaulting to system preference.

**Explicitly excluded** as junior/dated signals: skills bars and percentage ratings, tech-logo
grids, gradient headings, glassmorphism, particle backgrounds, custom cursors, scroll-jacking,
testimonials, stat counters, contact forms.

**Motion.** Fade + 8–12px translateY on scroll-into-view, 150–250ms ease-out, ~40ms stagger.
Experience rows dim their siblings on hover. All of it behind `prefers-reduced-motion`.

**Case studies.** Three, each Problem → Constraint → Approach → Trade-off → Outcome at 400–600
words, carrying one mono metric callout, one theme-aware inline SVG architecture diagram authored
by hand, and one 8–15 line code excerpt deep-linked to GitHub where the repo is public:

1. **Property-portal publishing pipeline** (Bayut) — verified 100% sole authorship, 20,665 lines
   across 96 files, 35 test files. Readiness service reporting every blocker before publish,
   22-case reason enum, 7-state publication enum, rate-limit-aware client, five queued jobs,
   hourly reconcile sweep because the portal has no webhooks, `lockForUpdate` against duplicate
   property creation.
2. **ERP bidirectional sync** (Hush/Odoo) — typed API client, observer-driven queued push,
   webhook ingestion, event enum over row/media/pivot changes, eight inbound sync commands.
3. **Appraisal objective workflow** — five stages derived from submission and review stamps rather
   than stored, fail-closed locking at window close, hierarchy-aware Eloquent global scope.

Address Alliance drops to a one-line card. `gym-app` and the Node/Express service appear in a
compact repo strip.

**Confidentiality.** No company name but The Address Investments appears anywhere. No employer
data, screenshots, client names, employee names, internal hostnames or credentials. Code excerpts
from the private monorepo are paraphrased or renamed and marked as such. The only captured UI is
`car-tracker`, Nader's own repo on a seeded database.

**Metrics discipline.** Every number is countable and checkable against a repo — file counts, line
counts, test counts, route counts, table counts, user counts. No invented latency or percentage
figures. One measured before/after query benchmark may be added if it can be reproduced locally
and reported honestly.

## Testing Decisions

A good test here asserts external behaviour a visitor could observe, not implementation detail.

- **Build test (the highest seam, and the one that matters):** `next build` with
  `output: 'export'` must succeed. This catches every accidental use of a server-only feature —
  SSR, route handlers, `cookies()`, `headers()`, middleware, image optimisation — which is the
  single realistic way this project breaks.
- **Content integrity:** a test over the content data files asserting every case study has all
  five narrative sections, a metric, a diagram and at least one link; and that every outbound link
  is well-formed.
- **Confidentiality test:** a test scanning built output for a denylist of forbidden strings
  (company domains, the other group company names, `.env` keys, internal hostnames). This encodes
  the constraint that matters most and fails the build if it is ever violated.
- **Accessibility:** axe-core against the built page, asserting no serious or critical violations.

Prior art: none in this repo; it is greenfield. Keep the suite small and behavioural.

## Out of Scope

- Any paid service. Total running cost must be $0.
- A live Laravel API, a database, a CMS, or an admin panel.
- A custom domain (bought later; the build must not assume the hostname).
- A blog or writing section. The research rates it highly, but it is a content commitment, not a
  build task, and shipping an empty "Writing" section is worse than omitting it.
- Internationalisation. The site is English-only.
- Analytics.

## Further Notes

- `gh` authentication is currently broken (`token in keyring is invalid`); Nader must run
  `gh auth login -h github.com` before anything can be pushed.
- The master CV states the Bayut work lives at `src/Domain/Bayut`. It does not — it is distributed
  through `src/Domain/Unit/`. Worth correcting in `MASTER-CV.md`.
- The Node/Express repo is currently private. A Node-track portfolio linking nothing in Node is the
  weakest part of the story; making it public with a README is a cheap, high-value follow-up.
- `car-tracker`'s seed data renders a visible `[seed]` prefix on most rows. Dropping it from
  `database/seed-testdata.php` and re-seeding would make the screenshots read as a polished demo.
