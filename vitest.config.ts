import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

import { alias } from "./vite.config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    include: ["./src/**/*.{spec,test}.{ts,tsx}"],
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/shared/lib/holders/**/*.{ts,tsx}"],
      exclude: [
        "src/shared/lib/holders/**/index.ts",
        "src/shared/lib/holders/**/*.types.ts",
        "src/shared/lib/holders/**/__tests__/**",
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
