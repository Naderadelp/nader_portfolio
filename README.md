# nader_portfolio

The personal portfolio of Nader Adel, a backend engineer in Cairo — a single page carrying an
experience history, three engineering case studies, a stack list and a public Laravel project
with captured UI. It is a statically exported Next.js site whose content lives in the
repository as typed TypeScript data, so publishing an update is a commit.

## Stack

- **Next.js 16** (App Router) with `output: 'export'`
- **React 19**
- **Tailwind CSS v4** (CSS-first config; design tokens in `src/app/globals.css`)
- **TypeScript** throughout, including the content layer
- **Vitest** for the test suite
- Deployed to **Cloudflare Pages**, free tier — see [`docs/DEPLOY.md`](docs/DEPLOY.md)

### Why it is static

This is the most visible link Nader hands to a recruiter, and a portfolio that can return a
502 is worse than no portfolio at all: a dead link reads as incompetence, and he will not be
standing by to restart anything. A static export has no origin server to fall over, no
database to exhaust connections on, and no bill.

The content also changes about monthly, which is not enough movement to buy anything with a
database or a CMS. Holding it as typed data in the repo means every change is reviewable in a
diff, versioned in git, and type-checked at build time — none of which a CMS gives you.

## Local development

```bash
npm install          # Node 22.x — see docs/DEPLOY.md for the version Cloudflare builds with
npm run dev          # dev server on http://localhost:3000
npm run build        # static export; writes out/
npm test             # Vitest — content integrity, confidentiality, accessibility
npm run lint         # ESLint
npm run verify       # the full gate: build, test suite, confidentiality scan
```

`npm run verify` is the one to run before pushing. It does what Cloudflare will do to the
repo, plus the checks Cloudflare will not do for you. `npm run build` writes `out/`, which is
git-ignored and is the directory Cloudflare Pages serves.

`next start` is not worth running: it boots a server, and this site has none. To preview the
real artefact, build and serve `out/` with any static file server.

## Editing content

All copy, facts, numbers and links live under `src/content/` as plain TypeScript data — no
React, no imports from components, no side effects. The type contract is in
[`src/content/types.ts`](src/content/types.ts), and `tsc` rejects a malformed entry before the
site builds.

| File | Holds |
| --- | --- |
| `profile.ts` | Name, role, location, timezone, tagline, positioning paragraphs, availability, social links, CV downloads |
| `experience.ts` | `experience[]`, plus `education[]` and `languages[]` |
| `case-studies.ts` | The three long-form case studies |
| `projects.ts` | `car-tracker`, `gym-app`, the Node/Express service |
| `stack.ts` | Tag groups, each marked `experience` or `learning` |
| `types.ts` | The types for all of the above |
| `index.ts` | The single entry point — import from `@/content`, not from an individual file |

### Adding a case study

A case study is one object in the `caseStudies` array in `src/content/case-studies.ts`:

```ts
{
  slug: 'erp-bidirectional-sync',         // unique, kebab-case, used as the anchor
  title: 'ERP bidirectional sync',
  subtitle: 'One sentence framing the problem, for the section header.',
  role: 'Plain statement of what you wrote and how much of it.',
  stack: ['Laravel', 'PHP', 'Laravel Queues'],
  metrics: [
    { label: 'Sync commands', value: '8', detail: 'How the figure was counted' },
  ],
  diagramKey: 'erp-sync',                 // must be a member of the DiagramKey union
  sections: [
    { heading: 'Problem',    paragraphs: ['…'] },
    { heading: 'Constraint', paragraphs: ['…'] },
    { heading: 'Approach',   paragraphs: ['…', '…'] },
    { heading: 'Trade-off',  paragraphs: ['…'] },
    { heading: 'Outcome',    paragraphs: ['…'] },
  ],
}
```

Rules the tests enforce, and the reasons behind them:

- **All five sections, in order.** `Problem → Constraint → Approach → Trade-off → Outcome` is
  the shape that lets a reader judge reasoning rather than vocabulary. The `Trade-off` section
  is the one doing the work — a case study with nothing traded away reads as marketing.
- **400–600 words.** Long enough to be real, short enough to be read.
- **Every metric must be countable against a repo.** File counts, line counts, test counts,
  route counts, table counts, user counts. Never invent a latency figure, a percentage
  improvement, or a "cut response time by 40%". If you cannot name the command that produced
  the number, it does not go on the site.
- **`diagramKey` must already exist.** Each key is a member of the `DiagramKey` union in
  `types.ts` and maps to a hand-authored, theme-aware inline SVG component in
  `src/components/diagrams/`, exported from that directory's `index.ts`. A new diagram is
  therefore three edits: the union member, the component, the export.

Code excerpts are *not* in `src/content/`. They live in `src/lib/portfolio.ts`, the adapter
between the content data and the shapes the layout shell expects, because an excerpt is a
display artefact rather than a fact about Nader. Every excerpt taken from the private employer
monorepo is paraphrased — renamed, trimmed, rewritten — and carries a `note` saying so.
Excerpts from public repos deep-link to the real file on GitHub so a reader can verify the
claim.

Everything else follows the same loop: edit the data file, let TypeScript check the shape, run
`npm run verify`, commit.

## The confidentiality guard

**Read this before adding any content.**

The strongest work described on this site was done inside a private employer monorepo. It
cannot be shown, and most of what surrounds it cannot even be named. The rules are absolute:

- **The Address Investments is the only company that may be named anywhere on the site.** Not
  the group's other companies, not their products, not their domains.
- **No third-party vendor or portal may be named.** The property portal, the ERP vendor, the
  CRM — all described generically ("a major property portal"), never identified.
- **No employer data ever ships.** No screenshots of internal systems, no client names, no
  employee names, no internal hostnames, no credentials, no `.env` keys, no real source from
  the monorepo.

[`scripts/check-confidential.mjs`](scripts/check-confidential.mjs) enforces this. It walks the
built output in `out/`, scans every text file — HTML, JS, CSS, JSON, SVG, source maps — for a
denylist of forbidden strings, prints the offending file and line, and exits non-zero on any
hit. It runs as part of `npm run verify`, so a violation fails the build instead of reaching
the internet.

The guard exists because memory is not a control. Six months from now, writing a new case study
at midnight, the vendor's real name is the obvious word to type; the scan is what catches it.
**Anyone adding content keeps the scan passing.** If it fires, the fix is to rewrite the copy —
never to delete the term from the denylist. The denylist only grows.

One deliberate exception: `car-tracker` is Nader's own public repository, running on a seeded
database. Its captures in `public/screenshots/` are the only UI screenshots on the site and
contain no employer data of any kind.

## Project layout

```
.
├── docs/
│   ├── SPEC.md               # what this site is for, and every decision behind it
│   └── DEPLOY.md             # Cloudflare Pages, step by step
├── public/
│   ├── cv/                   # the two CV PDFs (Laravel track, Node track)
│   └── screenshots/          # car-tracker UI — the only screenshots on the site
├── scripts/
│   └── check-confidential.mjs  # denylist scan over out/; fails the build on a hit
├── src/
│   ├── app/
│   │   ├── layout.tsx        # fonts, metadata, pre-paint theme script
│   │   ├── page.tsx          # the single page; composes every section
│   │   └── globals.css       # Tailwind v4 theme — design tokens live here
│   ├── components/
│   │   ├── diagrams/         # hand-authored, theme-aware inline SVG architecture diagrams
│   │   ├── layout/           # sidebar, main column, sections, scroll-spy, reveal-on-scroll
│   │   └── ui/               # headings, tech tags, metric callouts, code block, theme toggle
│   ├── content/              # ← all copy and facts; edit here
│   └── lib/
│       └── portfolio.ts      # adapter: content data → shell props; holds the code excerpts
├── next.config.ts            # output: 'export', images.unoptimized
└── package.json
```

`docs/SPEC.md` is the source of truth for intent. If a change appears to contradict something
here, read the spec before assuming the docs are stale.

## Constraints worth knowing before changing anything

- **The static export forbids server features.** No route handlers, no `cookies()` or
  `headers()`, no middleware, no server actions, no ISR, no `next/image` optimisation
  (`images.unoptimized` is set). A failed build is the usual way you find out.
- **Nothing hard-codes a hostname.** A custom domain gets bought later and must drop in with no
  code change, so URLs stay relative.
- **No analytics, no contact form, no third-party scripts.** Contact is a copyable email.
- **The design has an explicit banned list.** Skills bars, percentage ratings, tech-logo grids,
  gradient headings, glassmorphism, particle backgrounds, custom cursors, animated counters and
  contact forms are excluded on purpose, as junior or dated signals.
  [`AGENTS.md`](AGENTS.md) has the full set of working rules.
# nader_portfolio
