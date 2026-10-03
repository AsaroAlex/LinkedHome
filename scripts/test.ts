import { spawn } from "node:child_process";
import { startDatabase } from "./database.js";
import { localConfig, databaseUrl } from "../server/config.js";
if (process.env.DATABASE_URL)
  throw new Error(
    "Tests will not use DATABASE_URL. Unset it to use the isolated local soglia_test database.",
  );
localConfig();
const db = await startDatabase();
let resultCode = 1;
try {
  const child = spawn(
    process.execPath,
    ["node_modules/vitest/vitest.mjs", "run", ...process.argv.slice(2)],
    {
      stdio: "inherit",
      env: { ...process.env, TEST_DATABASE_URL: databaseUrl("soglia_test") },
    },
  );
  resultCode = await new Promise<number>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
} finally {
  await db.stop();
}
// Set the result after cleanup and finish explicitly: a failed suite must stop
// npm run check rather than letting shutdown/runtime hooks overwrite its code.
process.exit(resultCode);
