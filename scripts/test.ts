import { spawn } from "node:child_process";
import { startDatabase } from "./database.js";
import { localConfig, databaseUrl, deployed } from "../server/config.js";
if (
  process.env.DATABASE_URL ||
  (process.env.PHOTO_STORAGE && process.env.PHOTO_STORAGE !== "local") ||
  deployed ||
  (process.env.APP_ENV && process.env.APP_ENV !== "local") ||
  (process.env.MAIL_TRANSPORT && process.env.MAIL_TRANSPORT !== "local")
)
  throw new Error(
    "Tests require local mail/photo storage, APP_ENV=local and no DATABASE_URL; use the isolated generated soglia_test database.",
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
