# Working rules for nader_portfolio

Nader Adel's personal portfolio: one statically exported page, Next.js 16 + React 19 +
Tailwind v4, content held as typed TypeScript data. `docs/SPEC.md` is the source of truth for
intent and carries the reasoning behind everything below; `README.md` covers setup and how to
edit content.

Read this file before changing anything. Most of the rules here look like preferences and are
not — they are the constraints the project exists under.

## 1. The static export constraint

`next.config.ts` sets `output: 'export'`. `next build` emits `out/`, a directory of files, and
there is no server anywhere in production. The reason is in the spec: this is the most visible
link Nader owns, and a portfolio that can 502 is worse than no portfolio.

**Forbidden, because they need a running server:**

- Route handlers (`app/**/route.ts`) and any API route
- `cookies()`, `headers()`, `draftMode()`, and anything else from `next/headers`
- `middleware.ts`
- Server actions (`'use server'`)
- `dynamic = 'force-dynamic'`, `revalidate`, ISR, on-demand revalidation
- `next/image` with the default loader — `images.unoptimized: true` is set and stays set
- `rewrites`, `redirects` and `headers` in `next.config.ts` (they need a server; use
  Cloudflare's `_redirects` / `_headers` files if it ever becomes necessary)
- Reading the filesystem, environment or network at request time

Server Components are fine — they run at build time. Anything that must run in the browser is a
Client Component, and anything that needs a server does not belong in this project at all.

**Never hard-code a hostname.** A custom domain is bought later and must drop in with no code
change. Keep URLs relative. Nothing should assume `pages.dev` either.

The build is the real test here. If you are unsure whether something is allowed, `npm run
build` will tell you, and the answer is usually no.

## 2. Confidentiality — the rule that overrides everything

The work described on this site was done inside a **private employer monorepo**. Publishing it
carries real risk, and the site is written so that it carries none.

- **The Address Investments is the only company name permitted anywhere on the site.** Not the
  group's other companies, not their products, not their domains.
- **No third-party vendor, portal or SaaS is ever named.** The property portal, the ERP, the
  CRM — described generically, never identified. "A major property portal", not its name.
- **No employer data.** No internal screenshots, client names, employee names, internal
  hostnames, credentials, `.env` keys, database names, or real source from the monorepo.
- **Code excerpts from the monorepo are paraphrased**: renamed, trimmed, rewritten to carry the
  decision without reproducing the source, and each one carries a `note` saying so. Excerpts
  from public repos link to the real file on GitHub.

`scripts/check-confidential.mjs` walks `out/`, scans every text file against a denylist, and
exits non-zero on a hit. It runs in `npm run verify`.

**If the scan fires, rewrite the copy. Never remove a term from the denylist to make it pass.**
The denylist only grows; adding a term when you notice a new risk is correct and welcome.

The single exception is `car-tracker`, Nader's own public repo on a seeded database. Its
screenshots in `public/screenshots/` are the only captured UI on the site.

## 3. Content vs shell, and the two type contracts

The data and the presentation are separated on purpose, and there are **two** type contracts,
not one. Know which you are in before you edit.

| Layer | Path | Contract |
| --- | --- | --- |
| Content | `src/content/` | `src/content/types.ts` |
| Adapter | `src/lib/portfolio.ts` | — (maps one to the other) |
| Shell | `src/components/` | `src/components/layout/types.ts` |

- `src/content/` is **plain data about Nader**: facts, copy, numbers, links. No React, no
  imports from components, no side effects. Export through `src/content/index.ts`; import as
  `@/content`.
- `src/content/freelance.ts` is the client-facing layer: services, how an engagement works, and
  the three-line summary at the top of each project page. The site is aimed at freelance clients
  first, so this copy leads the page. It is held to the same rules as everything else: every
  service cites projects on the site, every summary compresses its write-up and never adds to
  it, and availability or terms change only when Nader says so.
- `src/components/` is **presentation**, and knows nothing about Nader. It takes the shapes in
  `layout/types.ts` and renders them.
- The two were authored independently and their shapes differ (`CaseStudy` exists in both, with
  different fields). `src/lib/portfolio.ts` is the one place that maps content → shell. When a
  field does not line up, **fix the mapping in the adapter**; do not reshape either contract to
  suit the other unless there is a real reason.
- **Code excerpts live in the adapter, not in the content layer** — an excerpt is a display
  artefact, not a fact about Nader.
- Diagrams are hand-authored inline SVG in `src/components/diagrams/`, theme-aware, keyed by
  the `DiagramKey` union in `src/content/types.ts` and exported from the diagrams `index.ts`.
  A new diagram is three edits: union member, component, export.

Adding content is a data edit plus a commit. There is no CMS and there will not be one.

## 4. Metrics discipline

**Every number on this site must be countable against a repository.** File counts, line counts,
test counts, route counts, table counts, user counts, enum case counts — things a reader could
in principle verify, and that Nader could reproduce with a command.

**Never invent** a latency figure, a throughput number, a percentage improvement, a "reduced by
40%", a "3× faster", or an uptime claim. Not as a placeholder, not as an example, not as
lorem-ipsum to be replaced later — placeholders get committed.

If a claim needs a number you do not have, either find the command that produces it or rewrite
the claim without it. A measured before/after benchmark is allowed only if it is reproducible
locally and reported honestly, caveats included.

This applies to prose too: "used by about 5,000 people across eight departments" is a fact with
a source. "Dramatically improved performance" is not a claim, it is decoration.

## 5. Design constraints — deliberate, not accidental

These come from research into what reads as senior rather than junior. They are decisions, not
oversights, and they are not to be "improved".

**The system:**

- Geist Sans for body and UI. **Geist Mono for labels, dates, metrics and tech tags only** —
  never for body copy.
- **One accent** (violet), used only for links, hover states and the active nav marker, kept
  **under 5% of pixels**. Tokens are in `src/app/globals.css`; do not introduce a second accent
  or hard-code a colour in a component.
- Three text tiers, one hairline border. Theme toggle defaulting to system preference, with the
  choice applied before first paint.
- Motion: fade plus 8–12px translateY on scroll-into-view, 150–250ms ease-out, ~40ms stagger,
  all of it behind `prefers-reduced-motion`.
- Accessibility is a requirement, not a polish pass: semantic landmarks, real heading order, AA
  contrast. The test suite runs axe-core against the built page.

**Banned outright:**

- Skills bars, proficiency percentages, star ratings, "advanced/intermediate" labels
- Tech-logo grids
- Gradient headings
- Glassmorphism
- Particle backgrounds
- Custom cursors
- Animated / counting-up stat counters
- Contact forms (contact is a copyable email — a form needs a server)

Also excluded: scroll-jacking, testimonials, analytics, a blog section, internationalisation.

## 6. Deployment

Cloudflare Pages, free tier, via their Git integration — build command `npm run build`, output
directory `out`. **Do not add GitHub Actions or any other CI.** Deployment configuration lives
in Cloudflare's dashboard, documented in `docs/DEPLOY.md`. Total running cost must stay $0, so
no Pages Functions, no Workers, no KV, no paid service of any kind.

## 7. Before you claim to be done

Run `npm run verify` — build, tests, confidentiality scan — and read the output. The build
catches accidental server features; the tests catch malformed content and accessibility
regressions; the scan catches the thing that actually matters.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
