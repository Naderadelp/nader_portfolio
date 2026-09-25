/**
 * The confidentiality denylist, and the scanning logic that applies it.
 *
 * This module is the single source of truth. Two callers import it:
 *
 *   - `scripts/check-confidential.mjs` — the CLI gate, run in `npm run verify`.
 *   - `tests/confidentiality.test.ts`  — the same rules as a failing test.
 *
 * Neither owns a copy of the list, so the two can never disagree.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

/**
 * Terms that must never reach the published site.
 *
 * Matching is a case-insensitive substring test. That is deliberately blunt:
 * a false positive costs a minute of triage, a false negative publishes
 * employer data.
 */
export const DENYLIST = [
  // Employer / group domains
  'addressinv.com',
  'theaddressholding.com',
  'theaddressinvestments.com',
  'themarq.com.eg',

  // Group company and product names that must not appear (The Address
  // Investments is the single permitted employer name).
  'Marq',
  'Address Alliance',

  // Third-party vendors referred to generically in the copy. If one of these
  // appears, a generic phrase has been replaced by a real vendor name.
  'Bayut',
  'Odoo',
  'Hush',

  // Internal product names. The site describes these systems generically —
  // "an internal IT service desk", "a task workspace inside the main
  // platform" — because naming an employer's internal tooling identifies it
  // and undoes that. Added alongside the contributions section, which is the
  // moment the risk of one slipping into a caption first existed.
  'Keystone',

  // Internal hosts and credentials
  'DB_PASSWORD',
  'APP_KEY',
  'localhost:8000',
  '127.0.0.1',
  'crm_DB',
  'dump-crm',
  'pieck.app',
  'mymarq.app',
  'mytai',
];

/** Extensions worth scanning. Binary assets are skipped. */
export const TEXT_EXTENSIONS = new Set([
  '.html',
  '.js',
  '.mjs',
  '.css',
  '.json',
  '.txt',
  '.xml',
  '.svg',
  '.map',
]);

/**
 * @typedef {object} Violation
 * @property {string} term   The denylist entry that matched.
 * @property {string} file   Where it matched ('<string>' for a raw text scan).
 * @property {string} line   The offending line, trimmed, for triage.
 */

/**
 * Scan one blob of text.
 *
 * @param {string} contents
 * @param {string} [file] Label used in the report.
 * @returns {Violation[]}
 */
export function findViolationsInText(contents, file = '<string>') {
  const haystack = contents.toLowerCase();
  /** @type {Violation[]} */
  const violations = [];

  for (const term of DENYLIST) {
    const needle = term.toLowerCase();
    if (!haystack.includes(needle)) continue;

    const line =
      contents.split('\n').find((l) => l.toLowerCase().includes(needle)) ?? '';

    violations.push({ term, file, line: line.trim().slice(0, 160) });
  }

  return violations;
}

/** Recursively yield every file under `dir`. */
export function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

/**
 * Scan a built output directory.
 *
 * `scannedFiles` is returned so a caller can assert the scan was not vacuous:
 * a scan of zero files reports zero violations and means nothing.
 *
 * @param {string} outDir
 * @returns {{ scannedFiles: string[], violations: Violation[] }}
 * @throws if `outDir` does not exist.
 */
export function scanDirectory(outDir) {
  statSync(outDir); // throws ENOENT with a useful message if unbuilt

  /** @type {string[]} */
  const scannedFiles = [];
  /** @type {Violation[]} */
  const violations = [];

  for (const file of walk(outDir)) {
    if (!TEXT_EXTENSIONS.has(extname(file))) continue;
    scannedFiles.push(file);
    violations.push(...findViolationsInText(readFileSync(file, 'utf8'), file));
  }

  return { scannedFiles, violations };
}

/** One-line human rendering of a violation, shared by the CLI and the test. */
export function formatViolation(v) {
  return `✗ "${v.term}" found in ${v.file}${v.line ? `\n    ${v.line}` : ''}`;
}
