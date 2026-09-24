import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * The fast suite: content integrity, confidentiality and accessibility.
 *
 * The build test is deliberately NOT here. `next build` takes tens of seconds
 * and has no business running on every `npm test`; it lives in
 * `vitest.build.config.ts` and runs via `npm run test:build`, which `npm run
 * verify` invokes first.
 *
 * Note that the confidentiality and accessibility suites read `out/`, so they
 * are only meaningful after a build. Both fail loudly rather than silently
 * skipping when it is missing.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/build.test.ts", "**/node_modules/**"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
