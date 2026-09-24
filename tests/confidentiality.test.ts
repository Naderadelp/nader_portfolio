import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  DENYLIST,
  TEXT_EXTENSIONS,
  findViolationsInText,
  formatViolation,
  scanDirectory,
} from "../scripts/denylist.mjs";
import { REPO_ROOT, requireBuiltOutput } from "./helpers/paths";

/**
 * Confidentiality.
 *
 * This is the test that protects Nader from publishing employer data, so it is
 * built to be hard to pass by accident:
 *
 *   1. It imports the same denylist module the CLI gate uses — there is no
 *      second copy of the list that could drift out of date.
 *   2. It proves the scanner works, by planting violations in a fixture string
 *      and in a fixture directory and demanding they be caught. A checker that
 *      silently matched nothing would fail here before it could bless `out/`.
 *   3. It proves the scan was not vacuous — a clean result over zero files is
 *      not a clean result.
 */

describe("confidentiality scanner (self-test)", () => {
  it("catches a planted violation in a string", () => {
    const planted =
      "<p>We integrated with the Bayut portal API for listing sync.</p>";

    const violations = findViolationsInText(planted, "fixture.html");

    expect(violations.map((v) => v.term)).toContain("Bayut");
    expect(formatViolation(violations[0])).toContain("fixture.html");
  });

  it("matches case-insensitively", () => {
    expect(findViolationsInText("...ODOO...").map((v) => v.term)).toContain(
      "Odoo",
    );
    expect(
      findViolationsInText("db_password=hunter2").map((v) => v.term),
    ).toContain("DB_PASSWORD");
  });

  it("reports clean text as clean", () => {
    expect(
      findViolationsInText(
        "Publishing a Cairo real-estate group's CRM inventory to a major property portal.",
      ),
    ).toEqual([]);
  });

  // Every entry must be individually detectable. A term that no longer matches
  // its own planted string is a dead rule, and a dead rule is worse than none.
  it.each(DENYLIST)("detects the denylisted term %s", (term) => {
    const planted = `prefix ${term} suffix`;
    expect(findViolationsInText(planted).map((v) => v.term)).toContain(term);
  });

  describe("over a directory", () => {
    let fixtureDir: string;

    beforeAll(() => {
      fixtureDir = mkdtempSync(join(tmpdir(), "confidentiality-fixture-"));
      mkdirSync(join(fixtureDir, "nested"), { recursive: true });
      writeFileSync(
        join(fixtureDir, "index.html"),
        "<h1>Clean page</h1>\n",
        "utf8",
      );
      // Planted deep in a subdirectory, to exercise the recursive walk.
      writeFileSync(
        join(fixtureDir, "nested", "leaked.js"),
        'const host = "addressinv.com";\n',
        "utf8",
      );
      // A skipped extension, so the filter's blind spot is asserted, not assumed.
      writeFileSync(join(fixtureDir, "image.png"), "Odoo", "utf8");
    });

    afterAll(() => {
      rmSync(fixtureDir, { recursive: true, force: true });
    });

    it("finds a planted violation nested in a subdirectory", () => {
      const { violations } = scanDirectory(fixtureDir);

      expect(violations).toHaveLength(1);
      expect(violations[0].term).toBe("addressinv.com");
      expect(violations[0].file).toContain("leaked.js");
      expect(violations[0].line).toBe('const host = "addressinv.com";');
    });

    it("scans only text extensions (binary assets are a known blind spot)", () => {
      const { scannedFiles } = scanDirectory(fixtureDir);

      expect(scannedFiles.some((f) => f.endsWith("index.html"))).toBe(true);
      expect(scannedFiles.some((f) => f.endsWith(".png"))).toBe(false);
      expect(TEXT_EXTENSIONS.has(".png")).toBe(false);
    });

    it("throws rather than reporting clean when the directory is missing", () => {
      expect(() => scanDirectory(join(fixtureDir, "does-not-exist"))).toThrow();
    });
  });
});

describe("the denylist itself", () => {
  it("still covers every category the spec requires", () => {
    const lower = DENYLIST.map((t) => t.toLowerCase());

    // Employer / group domains
    expect(lower).toContain("addressinv.com");
    expect(lower).toContain("theaddressholding.com");
    // Group company names the copy must not use
    expect(lower).toContain("address alliance");
    // Vendors the copy deliberately genericises
    expect(lower).toContain("bayut");
    expect(lower).toContain("odoo");
    // Credential keys
    expect(lower).toContain("db_password");
    expect(lower).toContain("app_key");
  });
});

describe("built output", () => {
  let outDir: string;

  beforeAll(() => {
    outDir = requireBuiltOutput();
  });

  it("scans a non-trivial number of files (guards against a vacuous pass)", () => {
    const { scannedFiles } = scanDirectory(outDir);

    expect(scannedFiles.length).toBeGreaterThan(5);
    expect(scannedFiles.some((f) => f.endsWith("index.html"))).toBe(true);
    // The page itself, not a stub: the prose is in the HTML.
    expect(scannedFiles.some((f) => f.endsWith(".js"))).toBe(true);
  });

  it("contains no confidentiality violation", () => {
    const { violations, scannedFiles } = scanDirectory(outDir);

    const report = violations
      .map((v) =>
        formatViolation({ ...v, file: relative(REPO_ROOT, v.file) }),
      )
      .join("\n");

    expect(
      violations,
      `Confidentiality violations in the built site — do NOT publish.\n` +
        `${scannedFiles.length} files scanned.\n\n${report}`,
    ).toEqual([]);
  });
});
