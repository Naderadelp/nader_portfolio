import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import puppeteer, { type Browser, type Page } from "puppeteer-core";

import { OUT_DIR, requireBuiltOutput } from "./helpers/paths";
import { contrastRatio, serveStatic, type StaticSite } from "./helpers/static-server";

/**
 * Accessibility.
 *
 * axe-core runs against the *built* page in a real Chrome, served over HTTP.
 * That matters: jsdom has no layout engine, so `getBoundingClientRect` returns
 * zeroes, axe treats every element as invisible, and rules like `color-contrast`
 * return "incomplete" instead of a result. A jsdom run here would pass
 * vacuously. A real browser gives axe real geometry and real computed styles.
 *
 * REGRESSION GUARDS. Two serious violations were found here and fixed:
 *
 *   1. Dark-theme `--fg-muted` was #6b7280 on #0b0b0d — 4.07:1, below the
 *      4.5:1 WCAG 2.1 AA minimum for small text. axe flagged seven elements
 *      (the sidebar nav labels, two captions, the footer). Now #8b8b94.
 *   2. `scrollable-region-focusable` on all three code excerpts: the
 *      `div.overflow-x-auto` in `src/components/ui/CodeBlock.tsx` scrolled
 *      horizontally but took no focus, so a keyboard-only user could not
 *      reach the end of a line. It now has tabIndex/role/aria-label.
 *
 * Nothing is excepted or silenced. The contrast test below reads the tokens
 * the page ACTUALLY SHIPS rather than comparing hard-coded hex values, so it
 * cannot go stale the way a pinned constant would.
 *
 * ON ANIMATION. Animations are deliberately left RUNNING during the axe pass,
 * and the page is written so that none of them paints behind text. If
 * `color-contrast` ever fails intermittently here, do not re-run it until it
 * passes: an intermittent contrast failure means some animation is moving a
 * surface underneath a letterform, which makes the real ratio a function of
 * time. That is the bug, and this is the test that finds it. It has already
 * caught one — the pipeline figure's row highlight, which animated
 * `background-color` behind live text and now animates an inset left bar
 * beside it instead.
 */

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/opt/google/chrome/chrome",
].filter((p): p is string => Boolean(p));

const DARK_BG = "#0b0b0d";

interface AxeNode {
  html: string;
  target: string[];
  failureSummary?: string;
  any: { id: string; data?: Record<string, unknown> }[];
}

interface AxeViolation {
  id: string;
  impact: string | null;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
}

let site: StaticSite;
let browser: Browser;

beforeAll(async () => {
  const outDir = requireBuiltOutput();
  site = await serveStatic(outDir);

  const executablePath = CHROME_CANDIDATES.find((p) => {
    try {
      readFileSync(p, { flag: "r" });
      return true;
    } catch {
      return false;
    }
  });

  if (!executablePath) {
    throw new Error(
      "No Chrome binary found. Set PUPPETEER_EXECUTABLE_PATH to run the " +
        "accessibility suite; it needs a real browser, because jsdom has no " +
        "layout engine and axe's colour-contrast rule would pass vacuously.",
    );
  }

  browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--force-color-profile=srgb"],
  });
});

afterAll(async () => {
  await browser?.close();
  await site?.close();
});

async function openPage(
  theme: "light" | "dark",
  path = "/",
): Promise<Page> {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  /**
   * The theme is selected through localStorage, not `prefers-color-scheme`.
   *
   * This used to emulate the media feature, which worked while the site
   * mirrored the OS. It no longer does: dark is the default and light is an
   * explicit opt-out, so emulating a light OS now produces a dark page and
   * the "light" run silently became a second dark run — the exact vacuous
   * pass the assertion below exists to catch. It did catch it.
   *
   * `evaluateOnNewDocument` writes the key before any page script executes,
   * so the pre-paint script in layout.tsx reads it on the first paint.
   */
  await page.evaluateOnNewDocument((value) => {
    try {
      localStorage.setItem("theme", value);
    } catch {
      // Blocked storage: the assertion below will fail loudly, as it should.
    }
  }, theme);

  await page.emulateMediaFeatures([
    // Reduced motion off, so nothing is mid-animation when axe samples colours.
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);
  await page.goto(`${site.origin}${path}`, { waitUntil: "networkidle0" });
  return page;
}

async function runAxe(page: Page): Promise<AxeViolation[]> {
  await page.evaluate(AXE_SOURCE);
  const result = (await page.evaluate(async () => {
    // @ts-expect-error axe is injected into the page at runtime
    return await window.axe.run(document, {
      resultTypes: ["violations"],
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
    });
  })) as { violations: AxeViolation[] };

  return result.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
}

function describeViolations(violations: AxeViolation[]): string {
  return violations
    .map((v) => {
      const nodes = v.nodes
        .slice(0, 5)
        .map((n) => `      ${n.target.join(" ")}\n        ${n.html.slice(0, 140)}`)
        .join("\n");
      return `  [${v.impact}] ${v.id}: ${v.help}\n    ${v.helpUrl}\n${nodes}`;
    })
    .join("\n\n");
}

/** Colour-contrast nodes axe blamed on the known `--fg-muted` token. */
function contrastData(
  node: AxeNode,
): { fgColor?: string; bgColor?: string; contrastRatio?: number } | undefined {
  return node.any.find((c) => c.id === "color-contrast")?.data as
    | { fgColor?: string; bgColor?: string; contrastRatio?: number }
    | undefined;
}

describe.each(["light", "dark"] as const)("axe-core — %s theme", (theme) => {
  let page: Page;
  let violations: AxeViolation[];

  beforeAll(async () => {
    page = await openPage(theme);
    violations = await runAxe(page);
  });

  afterAll(async () => {
    await page?.close();
  });

  it("actually rendered the requested theme (guards a vacuous run)", async () => {
    /**
     * Asserts the invariant, not a literal colour.
     *
     * This previously hardcoded `rgb(11, 11, 13)`, and a palette change broke
     * it — which is the wrong kind of failure: the theme was applying
     * perfectly, the test just knew an out-of-date hex. What actually matters
     * is that <body> painted the theme's own --bg token, and that a theme
     * called "dark" is in fact dark.
     */
    const { bodyBg, tokenBg, luminance } = await page.evaluate(() => {
      const body = getComputedStyle(document.body).backgroundColor;
      const token = getComputedStyle(document.documentElement)
        .getPropertyValue("--bg")
        .trim();

      // Resolve the token through the browser so both sides are rgb() strings.
      const probe = document.createElement("div");
      probe.style.backgroundColor = token;
      document.body.append(probe);
      const resolved = getComputedStyle(probe).backgroundColor;
      probe.remove();

      const [r, g, b] = body.match(/\d+(\.\d+)?/g)!.map(Number);
      const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };

      return {
        bodyBg: body,
        tokenBg: resolved,
        luminance: 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b),
      };
    });

    // The theme's own token is what got painted.
    expect(bodyBg).toBe(tokenBg);

    // And the theme is the kind of theme it claims to be.
    if (theme === "dark") {
      expect(luminance).toBeLessThan(0.05);
    } else {
      expect(luminance).toBeGreaterThan(0.7);
    }
  });

  it("axe found a page worth testing (guards a vacuous run)", async () => {
    const counts = await page.evaluate(() => ({
      text: document.body.innerText.trim().length,
      headings: document.querySelectorAll("h1,h2,h3").length,
      links: document.querySelectorAll("a[href]").length,
    }));

    expect(counts.text).toBeGreaterThan(2000);
    expect(counts.headings).toBeGreaterThan(5);
    expect(counts.links).toBeGreaterThan(5);
  });

  it("has no serious or critical violations", () => {
    // No exceptions. Both previously-known violations are fixed, so any
    // serious or critical finding here is a real regression.
    const unexpected = violations.filter((v) => v.nodes.length > 0);

    // Compared as text so the failure reads as a report rather than as a
    // hundred-line object diff.
    const report = describeViolations(unexpected);

    expect(
      report,
      `axe-core found ${unexpected.length} serious/critical violation(s) in ` +
        `the ${theme} theme:\n\n${report}`,
    ).toBe("");
  });
});

/**
 * Every project page, not a sample: each kind renders a different body
 * (case study, contribution, own project), and each has its own screenshots.
 * One theme is enough here — the theme itself is covered above.
 */
const WORK_PATHS = readdirSync(join(OUT_DIR, "work"))
  .filter((f) => f.endsWith(".html"))
  .map((f) => `/work/${f.replace(/\.html$/, "")}`);

describe("project pages", () => {
  it("were all exported (guards a vacuous run)", () => {
    expect(WORK_PATHS.length).toBeGreaterThanOrEqual(7);
  });

  it.each(WORK_PATHS)("%s has no serious or critical violations", async (path) => {
    const page = await openPage("dark", path);
    try {
      const unexpected = (await runAxe(page)).filter((v) => v.nodes.length > 0);
      const report = describeViolations(unexpected);
      expect(report, `axe-core found violations on ${path}:\n\n${report}`).toBe("");

      const h1s = await page.evaluate(() => document.querySelectorAll("h1").length);
      expect(h1s, `${path} should have exactly one <h1>`).toBe(1);
    } finally {
      await page.close();
    }
  });
});

describe("design tokens meet WCAG AA", () => {
  /**
   * Reads the tokens the page actually ships, rather than comparing two
   * hard-coded hex strings. A pinned constant silently stops testing the
   * product the moment someone edits globals.css — which is exactly what
   * happened to the previous version of this test.
   */
  it.each(["dark", "light"] as const)(
    "%s theme: --fg-muted on --bg clears 4.5:1 for small text",
    async (theme) => {
      const page = await openPage(theme);
      const tokens = await page.evaluate(() => {
        const style = getComputedStyle(document.documentElement);
        const read = (name: string) => style.getPropertyValue(name).trim();
        return { muted: read("--fg-muted"), bg: read("--bg") };
      });
      await page.close();

      expect(
        tokens.muted,
        `Could not read --fg-muted from the ${theme} theme. If the token was ` +
          `renamed, update this test rather than deleting it.`,
      ).toBeTruthy();

      const ratio = contrastRatio(tokens.muted, tokens.bg);

      expect(
        ratio,
        `${theme} theme: --fg-muted ${tokens.muted} on --bg ${tokens.bg} ` +
          `measures ${ratio.toFixed(3)}:1, below the 4.5:1 WCAG 2.1 AA ` +
          `minimum for small text. This token is used on the sidebar nav ` +
          `labels, captions and the footer. Lighten it in ` +
          `src/app/globals.css.`,
      ).toBeGreaterThanOrEqual(4.5);
    },
  );
});
