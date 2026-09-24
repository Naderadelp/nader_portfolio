import { defineConfig } from "vitest/config";

/**
 * The build suite, split out because it is slow.
 *
 * `next build` with `output: 'export'` is the highest-value seam in this
 * project: it is the thing that breaks when anyone reaches for an SSR-only
 * feature. It is also far too slow to sit in the inner loop, so it runs on its
 * own (`npm run test:build`) and as the first step of `npm run verify`.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/build.test.ts"],
    testTimeout: 600_000,
    hookTimeout: 600_000,
  },
});
