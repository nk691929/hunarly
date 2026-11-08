import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      // Business logic only. UI is covered by component, E2E and visual tests.
      include: [
        "src/lib/**/*.ts",
        "src/server/**/*.ts",
        "src/config/**/*.ts",
        "src/features/**/*.ts",
      ],
      exclude: [
        "src/config/env.ts",
        // Thin glue to external systems (Auth.js, Prisma, server actions). Covered by E2E in M11.
        "src/server/auth.ts",
        "src/server/auth-status.ts",
        "src/server/db.ts",
        "src/server/resumes/index.ts",
        "src/server/resumes/prisma-repository.ts",
        "src/features/**/actions.ts",
      ],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
  },
});
