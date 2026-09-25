import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Colour contrast, computed from globals.css itself.
 *
 * tests/accessibility.test.ts already runs axe against the built page in a real
 * browser, which is the authority on what actually shipped. This suite is the
 * cheap complement: it parses the token declarations straight out of the
 * stylesheet and recomputes every ratio, so a palette edit that breaks AA fails
 * in milliseconds without a build.
 *
 * It exists because the failure it guards is one this project has already
 * shipped once: --fg-muted was #6b7280, which looks muted-but-fine and measured
 * 4.07:1. Eyes are not instruments.
 */

const CSS = readFileSync(
  fileURLToPath(new URL("../src/app/globals.css", import.meta.url)),
  "utf8",
);

/* -------------------------------------------------------------------------- */
/* WCAG 2.1 relative luminance                                                 */
/* -------------------------------------------------------------------------- */

function channels(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}

function linearise(c: number): number {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map(linearise);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/* -------------------------------------------------------------------------- */
/* Token extraction                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Pulls one `:root` / `:root.light` block out of the stylesheet and reads its
 * plain hex custom properties. Anything expressed as rgb()/color-mix() is
 * skipped on purpose: those are all translucent decoration, and a contrast
 * number for a colour that composites against an unknown backdrop would be
 * fiction.
 */
function tokensFor(selector: string): Record<string, string> {
  const start = CSS.indexOf(selector + " {");
  if (start === -1) throw new Error(`No "${selector}" block in globals.css`);

  const open = CSS.indexOf("{", start);
  const close = CSS.indexOf("\n}", open);
  const block = CSS.slice(open, close);

  const found: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(
    /--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g,
  )) {
    found[name] = value;
  }
  return found;
}

const THEMES = [
  {
    name: "dark",
    selector: ":root",
    /** Every background a foreground token is allowed to land on. */
    backgrounds: ["bg", "bg-sunken", "surface", "surface-raised"],
  },
  {
    name: "light",
    selector: ":root.light",
    backgrounds: ["bg", "bg-sunken", "surface", "surface-raised"],
  },
] as const;

/** Foreground tokens that render as small text and owe the full 4.5:1. */
const TEXT_TOKENS = [
  "fg",
  "fg-secondary",
  "fg-muted",
  "accent",
  "accent-hover",
  "ok",
  "waiting",
  "refused",
] as const;

const AA_SMALL_TEXT = 4.5;

describe.each(THEMES)("$name theme", ({ name, selector, backgrounds }) => {
  const tokens = tokensFor(selector);

  it("declares every token the tests below reference", () => {
    for (const token of [...TEXT_TOKENS, ...backgrounds]) {
      expect(tokens[token], `--${token} missing from ${selector}`).toBeDefined();
    }
  });

  it.each(TEXT_TOKENS)(
    `--%s clears ${AA_SMALL_TEXT}:1 on every background in the ${name} theme`,
    (token) => {
      for (const bg of backgrounds) {
        const ratio = contrast(tokens[token], tokens[bg]);
        expect(
          Number(ratio.toFixed(2)),
          `--${token} (${tokens[token]}) on --${bg} (${tokens[bg]})`,
        ).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
      }
    },
  );

  it("--accent-ink is readable on a filled --accent block", () => {
    const ratio = contrast(tokens["accent-ink"], tokens["accent"]);
    expect(Number(ratio.toFixed(2))).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });

  /**
   * The outline hero line is drawn with -webkit-text-stroke. It is text, so it
   * owes the text bar — and the obvious choice of --hairline-strong measures
   * about 1.6:1, which is why this assertion exists at all.
   */
  it("the outline display stroke is a text-grade colour, not a hairline", () => {
    const strokeRule = CSS.match(
      /-webkit-text-stroke:\s*1px\s*var\(--([a-z0-9-]+)\)/,
    );
    expect(strokeRule, "no -webkit-text-stroke rule found").not.toBeNull();

    const strokeToken = strokeRule![1];
    expect(
      tokens[strokeToken],
      `--${strokeToken} is not a hex token in ${selector}`,
    ).toBeDefined();

    const ratio = contrast(tokens[strokeToken], tokens["bg"]);
    expect(
      Number(ratio.toFixed(2)),
      `outline stroke --${strokeToken} on --bg`,
    ).toBeGreaterThanOrEqual(AA_SMALL_TEXT);
  });
});

describe("stylesheet hygiene", () => {
  it("every hex token is valid 3- or 6-digit hex", () => {
    for (const { selector } of THEMES) {
      for (const [token, value] of Object.entries(tokensFor(selector))) {
        expect(
          value,
          `--${token} in ${selector} is not a clean hex value`,
        ).toMatch(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
      }
    }
  });

  it("finds a non-trivial number of tokens, so a parser break cannot pass silently", () => {
    for (const { selector } of THEMES) {
      expect(Object.keys(tokensFor(selector)).length).toBeGreaterThan(10);
    }
  });
});
