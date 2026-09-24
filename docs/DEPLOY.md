# Deploying to Cloudflare Pages

This site is a static export. `npm run build` writes a directory of HTML, CSS, JS and images
to `out/`, and hosting it means nothing more than putting those files on a CDN. Cloudflare
Pages does that for free, forever, with no card on file.

Everything below is done once, in Cloudflare's dashboard. **There is no CI to set up** — no
GitHub Actions workflow, no deploy keys, no build server of our own. Cloudflare watches the
repository directly and builds on every push.

## Why Cloudflare and not Vercel

- **Cairo PoP.** Cloudflare runs an edge location in Cairo, so the first readers of this site —
  Egyptian recruiters and hiring managers — get the page from a machine in their own city
  rather than from Frankfurt. Vercel has no Egyptian presence.
- **Static assets are free and unmetered.** Cloudflare's own wording: "requests to static
  assets are free and unlimited. A request is considered static when it does not invoke
  Functions." This site invokes no Functions, so every request it will ever serve is free.
- **Private repositories are allowed on the free plan**, and a custom domain costs nothing to
  attach.

## Before you start

1. The repository is pushed to GitHub (`Naderadelp/nader_portfolio`). Private is fine.
2. `npm run verify` passes locally. Cloudflare will run `npm run build`; if that fails there,
   the deploy fails and the previously-deployed version stays live.
3. You have a Cloudflare account. Sign up free at <https://dash.cloudflare.com/sign-up>. No
   payment details are required for the free plan.

## Step 1 — Connect the repository

1. Sign in at <https://dash.cloudflare.com>.
2. In the left sidebar, open **Workers & Pages**.
3. Select **Create application** → **Pages** → **Connect to Git**.
4. Sign in with GitHub when prompted, then select **Install & Authorize**. You can grant access
   to all repositories or just `nader_portfolio`; just this one is enough.
5. Pick `nader_portfolio` from the list and select **Begin setup**.

## Step 2 — Project settings

Cloudflare now asks for the project name, the production branch and the build configuration.

| Field | Value |
| --- | --- |
| **Project name** | `nader-portfolio` |
| **Production branch** | `main` |
| **Framework preset** | `Next.js (Static HTML Export)` |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Root directory** | leave empty (the project is at the repository root) |

Notes on each:

- **Project name** becomes the hostname: `nader-portfolio.pages.dev`. Choose it deliberately,
  because renaming later changes the URL. This is the address to send people until a custom
  domain is bought.
- **Framework preset** only pre-fills the two fields below it. Its own defaults are
  `npx next build` and `out`; override the build command to `npm run build` so the deployed
  build is exactly the command documented in the README. If the preset list does not offer the
  static-export variant, choose **None** and type the two values in by hand — the preset is a
  convenience, nothing more.
- **Build output directory** must be `out`, not `.next`. `.next` is Next.js's intermediate
  build cache; `out` is the exported site. Getting this wrong produces a deploy that 404s.

### Environment variables

Add one, under **Environment variables (advanced)**, for the **Production** environment:

| Variable name | Value |
| --- | --- |
| `NODE_VERSION` | `22` |

Cloudflare's current build image (v3) defaults to Node **22.16.0**, so this is belt-and-braces
— but pinning it means a future change to their default cannot silently break the build. The
v3 build system ignores `package.json` → `engines`, so `NODE_VERSION` (or a committed `.nvmrc`
/ `.node-version` file) is the only way to set this.

The site itself needs no environment variables. There are no secrets, no API keys, and no
`NEXT_PUBLIC_*` values — everything it renders is in the repository.

Then select **Save and Deploy**.

## Step 3 — Watch the first build

The build log opens automatically. It clones the repo, runs `npm install`, runs
`npm run build`, and uploads `out/`. A first build takes two to four minutes; most of that is
the install.

When it finishes, the site is live at `https://nader-portfolio.pages.dev`. Open it and check
the page renders, the CV PDFs download, and the `car-tracker` screenshots load.

If the build fails, the log tells you which command exited non-zero. The two common causes:

- **A server-only Next.js feature crept in** — a route handler, `cookies()`, `headers()`,
  middleware, a server action. `output: 'export'` rejects these, and the message names the
  offending file. Fix it in the code; there is no Cloudflare setting for this.
- **Wrong output directory** — the build succeeds but the deployed site 404s. Re-check that
  **Build output directory** is `out`.

Nothing is lost when a build fails: the last successful deployment keeps serving.

## Step 4 — How deployments work from now on

- **Push to `main` → production deploy.** Cloudflare builds automatically; no further action.
- **Push to any other branch → preview deploy**, at its own URL, which does not touch
  production. Useful for checking a rewritten case study before it is public.
- **Rollback** is instant: **Workers & Pages** → the project → **Deployments** → pick an older
  deployment → **Rollback to this deployment**.

## Step 5 — Adding a custom domain, later

Do this whenever the domain is bought. Nothing in the codebase hard-codes a hostname, so this
is a dashboard-only change with no code edit and no rebuild needed.

**If the domain is on Cloudflare** (registered with Cloudflare Registrar, or its nameservers
pointed at Cloudflare):

1. **Workers & Pages** → the project → **Custom domains**.
2. Select **Set up a domain**.
3. Enter the domain (`naderadel.dev`, or whatever it is) and select **Continue**.
4. Cloudflare shows the DNS record it will create. Confirm it — the CNAME is added
   automatically, including for an apex domain, which Cloudflare handles with CNAME flattening.
5. Wait for the certificate. Cloudflare issues it automatically; it usually takes a few minutes
   and can take longer on a brand-new domain.

**If the domain stays at an external registrar**, the same first four steps apply, but you must
add the DNS record yourself at that registrar: a `CNAME` from the hostname you entered to
`nader-portfolio.pages.dev`. An apex domain cannot take a CNAME at most registrars, which is
the practical reason to move the nameservers to Cloudflare — it is free and takes one evening
of DNS propagation.

Always add the domain in the Pages dashboard **first**. A CNAME pointing at `pages.dev`
without the domain being registered on the project will not resolve.

The `*.pages.dev` address keeps working afterwards, which is useful: old links in sent emails
and applications do not break.

## Free-tier limits that actually matter

| Limit | Free plan |
| --- | --- |
| Requests / bandwidth on static assets | **Unlimited and free** |
| Builds | **500 per month** |
| Concurrent builds | **1** |
| Build timeout | 20 minutes |
| Files per deployment | 20,000 |
| Max single file size | 25 MiB |
| Custom domains per project | 100 |

In practice only two of these are ever in reach. **500 builds a month** is roughly 16 pushes a
day, every day — far past how often this site changes. **One concurrent build** means a second
push while a build is running queues behind it, which matters only if you push twice in a
minute; the later build wins in the end either way.

The file count and file size limits are worth remembering if the screenshots directory ever
grows: 20,000 files and 25 MiB per file. A build near either number is a sign something has
gone wrong.

Total cost: **$0**, with no card on the account.

## What this deployment deliberately does not have

- **No CI pipeline.** Cloudflare's Git integration is the whole deployment mechanism. Adding a
  GitHub Actions workflow would duplicate the build with a second place for it to break.
- **No Pages Functions, no Workers, no KV, no D1.** Any of them would make requests billable
  and reintroduce something that can fail at request time. The site is files on a CDN, and that
  is the point.
- **No analytics.** Not in scope; see `docs/SPEC.md`.

## Sources

- [Cloudflare Pages — Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Cloudflare Pages — Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Cloudflare Pages — Build image and Node version](https://developers.cloudflare.com/pages/configuration/build-image/)
- [Cloudflare Pages — Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Cloudflare Pages — Limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Cloudflare Pages — Pricing](https://developers.cloudflare.com/pages/functions/pricing/)
