import { buildApp } from "./app.js";
import { makePool } from "./db.js";
import { production } from "./config.js";
import { startDatabase } from "../scripts/database.js";
import { migrate } from "../scripts/migrate.js";
if (production)
  throw new Error(
    "Production release is disabled: configure reviewed mail/operations/deployment first (docs/operations/release-checklist.md).",
  );
const service = await startDatabase(),
  db = makePool();
try {
  if (!process.env.DATABASE_URL) await migrate(db);
  else {
    const { checkMigrations } = await import("../scripts/migrate.js");
    await checkMigrations(db);
  }
  const app = await buildApp(db);
  await app.listen({
    host: process.env.HOST || "127.0.0.1",
    port: Number(process.env.PORT || 3000),
  });
  console.log("Soglia HTTP service ready. Local synthetic environment.");
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
