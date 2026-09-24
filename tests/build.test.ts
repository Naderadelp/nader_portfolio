import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

import { REPO_ROOT, OUT_DIR } from "./helpers/paths";

/**
 * The build test.
 *
 * This is the one test that matters. The site is a static export; the single
 * realistic way it breaks is that someone adds a feature that needs a server at
 * request time — a route handler, `cookies()`, `headers()`, middleware, a
 * server action, or a `next/image` that still uses the default optimising
 * loader — and `output: 'export'` can no longer produce a page.
 *
 * So the build *is* the test seam. Nothing here inspects Next internals; it
 * runs the real command a deploy runs and asserts the artefacts a visitor
 * would be served actually exist.
 */

let build: { status: number | null; stdout: string; stderr: string };

beforeAll(() => {
  // Remove the previous export so "emits out/index.html" means this build
  // emitted it, not a stale run from last week.
  rmSync(OUT_DIR, { recursive: true, force: true });

  build = spawnSync("npm", ["run", "build"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    env: { ...process.env, CI: "1" },
    maxBuffer: 32 * 1024 * 1024,
  }) as typeof build;
});

/** Last few lines of build output, for a failure message worth reading. */
function buildTail(): string {
  return [build.stdout ?? "", build.stderr ?? ""]
    .join("\n")
    .split("\n")
    .filter((l) => l.trim() !== "")
    .slice(-40)
    .join("\n");
}

describe("static export build", () => {
  it("`next build` succeeds", () => {
    expect(
      build.status,
      `\`npm run build\` exited ${build.status}.\n\n${buildTail()}`,
    ).toBe(0);
  });

  it("emits out/index.html", () => {
    const index = join(OUT_DIR, "index.html");
    expect(
      existsSync(index),
      `No out/index.html after a successful build. Either \`output: 'export'\` ` +
        `was dropped from next.config.ts, or the export produced nothing.\n\n${buildTail()}`,
    ).toBe(true);

    // A shell with no content would still be an .html file. Prerendering means
    // the markup carries the page, so it is not a few hundred bytes.
    expect(statSync(index).size).toBeGreaterThan(10_000);
  });

  it("prerenders the page content into the HTML, not just a client shell", () => {
    const html = readFileSync(join(OUT_DIR, "index.html"), "utf8");

    // A visitor with JS disabled, and every crawler, sees only this markup.
    expect(html).toContain("Nader Adel");
    expect(html).toMatch(/<main[\s>]/);
    expect(html).toMatch(/<h1[\s>]/);

    // The three hand-authored architecture diagrams are server-rendered SVG.
    const diagrams = html.match(/<svg[^>]*role="img"/g) ?? [];
    expect(
      diagrams.length,
      "Expected the case-study diagrams to be present in the static HTML.",
    ).toBeGreaterThanOrEqual(3);
  });

  it("emits the 404 page and copies the public assets a visitor can click", () => {
    expect(existsSync(join(OUT_DIR, "404.html"))).toBe(true);

    // Both CV downloads are a user story; a 404 on them is a silent failure.
    expect(
      existsSync(join(OUT_DIR, "cv", "NaderAdel-BackendEngineer-Laravel.pdf")),
    ).toBe(true);
    expect(
      existsSync(join(OUT_DIR, "cv", "NaderAdel-BackendEngineer-Node.pdf")),
    ).toBe(true);
    expect(existsSync(join(OUT_DIR, "screenshots"))).toBe(true);
  });

  it("produces no server-only build artefacts in the export", () => {
    // `output: 'export'` never emits these. If one appears, something asked
    // for a server at request time and the deploy target cannot honour it.
    for (const forbidden of ["_middleware.js", "middleware.js", "server"]) {
      expect(
        existsSync(join(OUT_DIR, forbidden)),
        `out/${forbidden} exists — the export is not purely static.`,
      ).toBe(false);
    }
  });
});
