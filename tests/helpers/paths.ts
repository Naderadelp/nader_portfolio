import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export const OUT_DIR = join(REPO_ROOT, "out");

/**
 * Assert the static export exists before a test reads it.
 *
 * Tests over built output must never quietly pass when there is nothing to
 * check — a confidentiality scan of an empty directory is a false all-clear.
 */
export function requireBuiltOutput(): string {
  if (!existsSync(join(OUT_DIR, "index.html"))) {
    throw new Error(
      "out/index.html is missing. These tests run against the built site: " +
        "run `npm run test:build` (or `npm run build`) first, or use `npm run verify`.",
    );
  }
  return OUT_DIR;
}
