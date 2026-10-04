import pg from "pg";
import { startDatabase } from "./database.js";
import { migrate } from "./migrate.js";
import { makePool } from "../server/db.js";
import { databaseUrl, deployed } from "../server/config.js";
import { buildApp } from "../server/app.js";
if (
  process.env.DATABASE_URL ||
  deployed ||
  (process.env.APP_ENV && process.env.APP_ENV !== "local") ||
  (process.env.MAIL_TRANSPORT && process.env.MAIL_TRANSPORT !== "local")
)
  throw new Error(
    "E2E server only manages the generated local synthetic database.",
  );
const service = await startDatabase();
const admin = new pg.Client({ connectionString: databaseUrl("postgres") });
await admin.connect();
if (
  !(await admin.query("SELECT 1 FROM pg_database WHERE datname='soglia_e2e'"))
    .rowCount
)
  await admin.query("CREATE DATABASE soglia_e2e");
await admin.end();
const db = makePool(databaseUrl("soglia_e2e"));
const target = (
  await db.query(
    "SELECT current_database() AS db,host(inet_server_addr()) AS host",
  )
).rows[0];
if (target.db !== "soglia_e2e" || target.host !== "127.0.0.1")
  throw new Error("Unsafe E2E target");
await migrate(db);
await db.query("TRUNCATE users,events,audit_log RESTART IDENTITY CASCADE");
const app = await buildApp(db, {
  origin: "http://127.0.0.1:3000",
  limits: false,
  ...(process.env.LINKEDHOME_E2E_PREVIEW === "1"
    ? {
        runtime: {
          environment: "preview" as const,
          origin: "https://preview.example.test",
          mailTransport: "disabled" as const,
          trustedProxies: false as const,
        },
      }
    : {}),
});
await app.listen({ host: "127.0.0.1", port: 3000 });
console.log("Isolated E2E service ready.");
let stopping = false;
const stop = async () => {
  if (stopping) return;
  stopping = true;
  await app.close();
  await db.end();
  await service.stop();
  process.exit(0);
};
process.once("SIGTERM", stop);
process.once("SIGINT", stop);
