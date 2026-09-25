import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import puppeteer, { type Browser, type Page } from "puppeteer-core";

import { requireBuiltOutput } from "./helpers/paths";
import { serveStatic, type StaticSite } from "./helpers/static-server";

/**
 * Responsive integrity, in a real browser at real phone widths.
 *
 * Reviewers open links on phones. A portfolio that sidescrolls on a 360px
 * screen is read as carelessness about the thing the author is claiming to be
 * careful about, and it is invisible on a desktop monitor — which is where it
 * always gets written.
 *
 * The check is deliberately mechanical rather than visual: a page has a mobile
 * layout bug if the document scrolls horizontally, or if any element sticks
 * out past the right edge of the viewport. Both are measurable, and neither
 * needs anyone to look at a screenshot.
 *
 * Horizontal scroll is legal in exactly two places on this site — the mobile
 * screenshot strip and the code excerpts — and both are opted in explicitly
 * below by being `overflow-x` containers. The rule is about the DOCUMENT
 * scrolling, not about every descendant.
 */

const CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/opt/google/chrome/chrome",
].filter((p): p is string => Boolean(p));

/** iPhone SE, a common Android, iPhone Pro Max, small tablet. */
const WIDTHS = [320, 360, 390, 430, 768] as const;

let site: StaticSite;
let browser: Browser;

beforeAll(async () => {
  site = await serveStatic(requireBuiltOutput());

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
      "No Chrome/Chromium found. Set PUPPETEER_EXECUTABLE_PATH or CHROME_PATH.",
    );
  }

  browser = await puppeteer.launch({
    executablePath,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
});

afterAll(async () => {
  await browser?.close();
  await site?.close();
});

async function openAt(width: number, path = "/"): Promise<Page> {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: 2 });
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem("theme", "dark");
    } catch {}
  });
  await page.goto(`${site.origin}${path}`, { waitUntil: "networkidle0" });
  return page;
}

/**
 * The home page, plus one project page of each kind: a case study with a
 * phone strip, a contribution with wide screenshots, and car-tracker.
 */
const PATHS = [
  "/",
  "/work/erp-bidirectional-sync",
  "/work/tenders",
  "/work/car-tracker",
] as const;

const CASES = PATHS.flatMap((path) => WIDTHS.map((width) => [path, width] as const));

describe.each(CASES)("%s at %ipx", (path, width) => {
  let page: Page;

  beforeAll(async () => {
    page = await openAt(width, path);
  });

  afterAll(async () => {
    await page?.close();
  });

  it("the document does not scroll horizontally", async () => {
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    // One pixel of slack for sub-pixel rounding on fractional layouts.
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  it("no element spills past the right edge of the viewport", async () => {
    const offenders = await page.evaluate((vw) => {
      const bad: { tag: string; cls: string; right: number }[] = [];

      for (const el of Array.from(document.body.querySelectorAll("*"))) {
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        // Elements inside an opted-in horizontal scroller are allowed to be
        // wider than the screen — that is what the scroller is for.
        if (el.closest("[data-allows-x-scroll]")) continue;
        // Likewise inside a frame that clips its content on purpose — the
        // zoomed screenshot covers on the Work cards.
        if (el.closest("[data-clips-overflow]")) continue;

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        if (rect.right > vw + 1) {
          bad.push({
            tag: el.tagName.toLowerCase(),
            cls:
              typeof el.className === "string"
                ? el.className.slice(0, 90)
                : "",
            right: Math.round(rect.right),
          });
        }
      }
      return bad.slice(0, 12);
    }, width);

    expect(
      offenders,
      `elements wider than the ${width}px viewport:\n` +
        offenders.map((o) => `  <${o.tag} class="${o.cls}"> right=${o.right}`).join("\n"),
    ).toEqual([]);
  });

  it("no text renders below 11 actual CSS pixels", async () => {
    /**
     * Guards the failure that shipped once already on this site: a wide SVG
     * viewBox scaled into a narrow column, rendering its labels at about five
     * pixels.
     *
     * Two subtleties, both of which this test originally got wrong.
     *
     * 1. `getComputedStyle(el).fontSize` on an SVG <text> reports the value in
     *    USER UNITS, not rendered pixels — the viewBox transform never enters
     *    into it. A diagram with `font-size="11"` inside a 360-unit viewBox
     *    squeezed into a 246px column reports "11px" while painting 7.5px.
     *    Reading the number straight out of the computed style therefore
     *    measured precisely the wrong thing for the one case this test exists
     *    to catch. The scale from `getScreenCTM()` is what converts it.
     *
     * 2. Walking every text node reaches text inside a `display: none`
     *    ancestor, because the check only looked at the text's own parent.
     *    Both diagram variants are always in the DOM and the container query
     *    hides one, so the hidden variant was being measured and reported.
     *    A zero-area client rect is the reliable test for "not rendered".
     */
    const tooSmall = await page.evaluate(() => {
      const bad: { text: string; px: number; declared: string }[] = [];

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );

      let node: Node | null;
      while ((node = walker.nextNode())) {
        const text = node.textContent?.trim() ?? "";
        if (text.length < 4) continue;

        const el = node.parentElement;
        if (!el) continue;

        // Not rendered at all — covers `display:none` on any ancestor, which
        // is how the unused diagram variant is hidden.
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;

        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.opacity === "0") continue;

        const declared = parseFloat(style.fontSize);
        if (!(declared > 0)) continue;

        // Convert user units to painted pixels for anything inside an SVG.
        let scale = 1;
        const svgEl = el as unknown as SVGGraphicsElement;
        if (typeof svgEl.getScreenCTM === "function") {
          const ctm = svgEl.getScreenCTM();
          if (ctm) {
            // Uniform scaling here, so either axis works; average guards
            // against a non-uniform preserveAspectRatio.
            scale = (Math.hypot(ctm.a, ctm.b) + Math.hypot(ctm.c, ctm.d)) / 2;
          }
        }

        const px = declared * scale;
        if (px < 11) {
          bad.push({
            text: text.slice(0, 40),
            px: Math.round(px * 10) / 10,
            declared: style.fontSize,
          });
        }
      }
      return bad.slice(0, 10);
    });

    expect(
      tooSmall,
      `text painted under 11px:\n` +
        tooSmall
          .map((t) => `  ${t.px}px (declared ${t.declared})  "${t.text}"`)
          .join("\n"),
    ).toEqual([]);
  });
});
