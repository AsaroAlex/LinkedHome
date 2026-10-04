import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Only the isolated local E2E database is used, with the deployed preview
// runtime injected into buildApp so Chromium exercises the Secure cookies.
export default defineConfig({
  ...base,
  testDir: "tests/preview-browser",
  timeout: 60000,
  outputDir: "test-results/preview",
  reporter: [["list"]],
  webServer: {
    ...base.webServer,
    command: "LINKEDHOME_E2E_PREVIEW=1 node --import tsx scripts/e2e-server.ts",
  },
});
