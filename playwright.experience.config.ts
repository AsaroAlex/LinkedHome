import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// UI fixtures use a separate preview listener and make no database connection.
export default defineConfig({
  ...base,
  projects: [
    {
      name: "experience",
      testDir: "tests/experience",
      testMatch: [
        "experience.spec.ts",
        "move-in.spec.ts",
        "contracts.spec.ts",
        "profile-photo.spec.ts",
        "profile-details.spec.ts",
        "household-photos.spec.ts",
        "publication.spec.ts",
        "locations.spec.ts",
        "housing-needs.spec.ts",
      ],
    },
    {
      name: "mail-runtime",
      testDir: "tests/browser",
      testMatch: "mail-runtime.spec.ts",
    },
  ],
  outputDir: "test-results/experience",
  reporter: [["list"]],
  use: { ...base.use, baseURL: "http://127.0.0.1:3017" },
  webServer: {
    command:
      'node --input-type=module -e \'import { preview } from "vite"; await preview({ configFile: false, preview: { host: "127.0.0.1", port: 3017, strictPort: true } });\'',
    url: "http://127.0.0.1:3017",
    reuseExistingServer: false,
    timeout: 30000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5000 },
  },
});
