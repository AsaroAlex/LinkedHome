import { spawn } from "node:child_process";
import { startDatabase } from "./database.js";
import { localConfig, databaseUrl } from "../server/config.js";
if (process.env.DATABASE_URL)
  throw new Error(
    "Tests will not use DATABASE_URL. Unset it to use the isolated local soglia_test database.",
  );
localConfig();
const db = await startDatabase();
try {
  const child = spawn(
    process.execPath,
    ["node_modules/vitest/vitest.mjs", "run"],
    {
      stdio: "inherit",
      env: { ...process.env, TEST_DATABASE_URL: databaseUrl("soglia_test") },
    },
  );
  const code = await new Promise<number>((resolve) =>
    child.on("exit", (code) => resolve(code ?? 1)),
  );
  process.exitCode = code;
} finally {
  await db.stop();
}
