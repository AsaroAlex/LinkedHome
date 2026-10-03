import { buildApp } from "./app.js";
import { makePool } from "./db.js";
import { readRuntimeConfiguration } from "./config.js";
import { validateMailConfiguration } from "./mail.js";
import { migrate } from "../scripts/migrate.js";
const runtime = readRuntimeConfiguration();
validateMailConfiguration();
// Deployed runtimes contain no embedded database or synthetic seed tooling.
const service = process.env.DATABASE_URL
    ? { stop: async () => {} }
    : await (await import("../scripts/database.js")).startDatabase(),
  db = makePool();
try {
  if (!process.env.DATABASE_URL) await migrate(db);
  else {
    const { checkMigrations } = await import("../scripts/migrate.js");
    await checkMigrations(db);
  }
  const app = await buildApp(db, { runtime });
  await app.listen({
    host: process.env.HOST || "127.0.0.1",
    port: Number(process.env.PORT || 3000),
  });
  console.log(`Soglia HTTP service ready (${runtime.environment}).`);
  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    await app.close();
    await db.end();
    await service.stop();
    process.exit(0);
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
} catch (e) {
  await db.end();
  await service.stop();
  throw e;
}
