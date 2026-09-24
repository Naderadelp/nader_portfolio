#!/usr/bin/env node
/**
 * Confidentiality guard.
 *
 * The portfolio describes work done inside a private employer monorepo. The rule
 * is that no company is named but "The Address Investments", and no employer data,
 * vendor name, internal host or credential ever reaches the published site.
 *
 * This scans the built static output for a denylist and exits non-zero on a hit,
 * so the constraint is enforced by the build rather than by memory.
 *
 * The denylist and the scanning logic live in `scripts/denylist.mjs`, which
 * `tests/confidentiality.test.ts` imports too — the CLI and the test suite apply
 * exactly the same rules, and there is only one list to keep up to date.
 *
 * Usage: node scripts/check-confidential.mjs [outDir]
 */

import { formatViolation, scanDirectory } from './denylist.mjs';

const OUT_DIR = process.argv[2] ?? 'out';

let result;
try {
  result = scanDirectory(OUT_DIR);
} catch {
  console.error(
    `✗ Output directory "${OUT_DIR}" not found. Run \`npm run build\` first.`,
  );
  process.exit(1);
}

const { scannedFiles, violations } = result;

if (scannedFiles.length === 0) {
  console.error(
    `✗ No scannable files under "${OUT_DIR}/". A clean result over zero files proves nothing.`,
  );
  process.exit(1);
}

for (const violation of violations) {
  console.error(formatViolation(violation));
}

if (violations.length > 0) {
  console.error(
    `\n${violations.length} confidentiality violation(s). The site was NOT cleared for publishing.`,
  );
  process.exit(1);
}

console.log(
  `✓ No confidentiality violations in ${OUT_DIR}/ (${scannedFiles.length} files scanned)`,
);
