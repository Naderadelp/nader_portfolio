/**
 * Generates the Open Graph / social card at public/og.jpg.
 *
 * Why a script and not a route: `output: 'export'` rules out `next/og`, which
 * needs a runtime. Why a browser and not ImageMagick: the card has to be set
 * in Geist, which is delivered as woff2 and is not installed system-wide, and
 * matching the site's type and colour by hand in a raster tool is how social
 * cards end up looking like a different product.
 *
 * This is a one-off, run by hand when the headline or the portrait changes:
 *
 *     node scripts/make-og.mjs
 *
 * It is deliberately NOT wired into `npm run build`. The card changes about
 * once a year, and making every build depend on launching Chrome and reaching
 * Google Fonts would trade a large amount of reliability for nothing.
 *
 * The card matters more than its size suggests: this site's main job is to be
 * a link pasted into an email, a LinkedIn message or a WhatsApp thread, and
 * without a card those all render as a bare grey rectangle.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORTRAIT = join(REPO_ROOT, "public", "portrait.jpg");
const OUT = join(REPO_ROOT, "public", "og.jpg");

const CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/opt/google/chrome/chrome",
].filter(Boolean);

const executablePath = CHROME_CANDIDATES.find((p) => {
  try {
    readFileSync(p, { flag: "r" });
    return true;
  } catch {
    return false;
  }
});

if (!executablePath) {
  console.error("No Chrome found. Set PUPPETEER_EXECUTABLE_PATH or CHROME_PATH.");
  process.exit(1);
}

const portraitDataUri =
  "data:image/jpeg;base64," + readFileSync(PORTRAIT).toString("base64");

/* The tokens below are copied from src/app/globals.css rather than imported,
   because this page is standalone. If the palette moves, move them too. */
const HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=block" rel="stylesheet">
<style>
  :root {
    --bg: #08080a;
    --fg: #f4f4f5;
    --fg-muted: #8e8e9b;
    --accent: #f5a524;
    --hairline: #24242c;
    --ok: #5ee0a8;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px;
    background: var(--bg);
    font-family: Geist, sans-serif;
    color: var(--fg);
    overflow: hidden;
    position: relative;
    display: flex; align-items: center;
    padding: 0 72px;
    gap: 56px;
  }
  /* Same hairline grid and amber bloom as the page. */
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(to right, rgb(255 255 255 / .03) 1px, transparent 1px),
      linear-gradient(to bottom, rgb(255 255 255 / .03) 1px, transparent 1px);
    background-size: 72px 72px;
  }
  .bloom {
    position: absolute; width: 780px; height: 780px;
    top: -260px; left: -200px; border-radius: 9999px;
    background: rgb(245 165 36 / .16); filter: blur(110px);
  }
  .copy { position: relative; flex: 1 1 auto; }
  .pill {
    display: inline-flex; align-items: center; gap: 9px;
    border: 1px solid var(--hairline);
    padding: 8px 14px;
    font-family: "Geist Mono", monospace;
    font-size: 15px; letter-spacing: .12em; text-transform: uppercase;
    color: var(--fg-muted);
  }
  .dot { width: 7px; height: 7px; border-radius: 9999px; background: var(--ok); }
  h1 {
    margin-top: 26px;
    font-size: 78px; font-weight: 600;
    line-height: .98; letter-spacing: -.04em;
  }
  h1 .outline {
    color: transparent;
    -webkit-text-stroke: 1.4px var(--fg-muted);
    display: block;
  }
  .rule { width: 72px; height: 3px; background: var(--accent); margin: 32px 0 22px; }
  .who {
    font-family: "Geist Mono", monospace;
    font-size: 19px; letter-spacing: .04em; color: var(--fg-muted);
  }
  .who b { color: var(--fg); font-weight: 500; }
  figure {
    position: relative; flex: 0 0 340px;
    border: 1px solid #35353f;
  }
  figure img { display: block; width: 340px; height: 425px; object-fit: cover; object-position: top; }
  .cap {
    border-top: 1px solid var(--hairline);
    padding: 9px 12px;
    display: flex; justify-content: space-between; align-items: center;
    font-family: "Geist Mono", monospace; font-size: 13px;
    letter-spacing: .1em; text-transform: uppercase; color: var(--fg-muted);
  }
  .cap .st { color: var(--ok); display: flex; align-items: center; gap: 7px; }
  /* Corner brackets, as on the site. */
  figure::before, figure::after {
    content: ""; position: absolute; width: 18px; height: 18px;
    border-color: var(--accent); border-style: solid;
  }
  figure::before { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
  figure::after { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="bloom"></div>

  <div class="copy">
    <span class="pill"><span class="dot"></span>Open to remote work · Cairo</span>
    <h1>The request ends.<span class="outline">The work doesn't.</span></h1>
    <div class="rule"></div>
    <p class="who"><b>Nader Adel</b> — Backend Engineer · Laravel &amp; TypeScript</p>
  </div>

  <figure>
    <img src="${portraitDataUri}" alt="">
    <div class="cap"><span>Nader Adel</span><span class="st"><span class="dot"></span>Open to work</span></div>
  </figure>
</body>
</html>`;

const browser = await puppeteer.launch({
  executablePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.setContent(HTML, { waitUntil: "networkidle0" });
// `display=block` on the font request means no fallback is ever painted, but
// wait for the face to actually resolve before capturing.
await page.evaluateHandle("document.fonts.ready");

const buffer = await page.screenshot({ type: "jpeg", quality: 90 });
writeFileSync(OUT, buffer);

await browser.close();
console.log(`Wrote ${OUT} (${(buffer.length / 1024).toFixed(0)}KB)`);
