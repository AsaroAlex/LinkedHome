import EmbeddedPostgres from "embedded-postgres";
import pg from "pg";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { localConfig, localDir, databaseUrl } from "../server/config.js";
export async function startDatabase() {
  if (process.env.DATABASE_URL) {
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
    });
    await client.connect();
    await client.query("SELECT 1");
    await client.end();
    return { stop: async () => {} };
  }
  const c = localConfig(),
    directory = path.join(localDir, "postgres");
  const probe = new pg.Client({
    connectionString: databaseUrl("postgres"),
    connectionTimeoutMillis: 1000,
  });
  try {
    await probe.connect();
    await probe.query("SELECT 1");
    await probe.end();
    return { stop: async () => {} };
  } catch {
    await probe.end().catch(() => {});
  }
  // A killed cloud task can leave a zombie PID and socket lock. Remove only
  // our generated cluster's locks after proving that its postmaster is dead.
  const pidFile = path.join(directory, "postmaster.pid");
  if (existsSync(pidFile)) {
    const lines = readFileSync(pidFile, "utf8").split("\n"),
      pid = Number(lines[0]);
    if (lines[1] !== directory || !Number.isSafeInteger(pid) || pid < 2)
      throw new Error(
        "Unrecognised local PostgreSQL PID file. Inspect the cluster before restarting.",
      );
    let dead = false;
    try {
      process.kill(pid, 0);
      if (process.platform === "linux") {
        const stat = readFileSync(`/proc/${pid}/stat`, "utf8");
        dead = stat.slice(stat.lastIndexOf(")") + 2).startsWith("Z");
      }
    } catch (e) {
      if (
        (e as NodeJS.ErrnoException).code === "ESRCH" ||
        (e as NodeJS.ErrnoException).code === "ENOENT"
      )
        dead = true;
      else throw e;
    }
    if (!dead)
      throw new Error(
        "Local PostgreSQL process exists but is not ready. Retry after checking its health; no lock files removed.",
      );
    unlinkSync(pidFile);
    const socket = path.join(localDir, `.s.PGSQL.${c.port}`),
      lock = socket + ".lock";
    if (
      existsSync(lock) &&
      Number(readFileSync(lock, "utf8").split("\n")[0]) === pid
    ) {
      unlinkSync(lock);
      if (existsSync(socket)) unlinkSync(socket);
    }
  }
  const startupLog: string[] = [];
  const db = new EmbeddedPostgres({
    databaseDir: directory,
    user: "soglia",
    password: c.password,
    port: c.port,
    persistent: true,
    authMethod: "scram-sha-256",
    postgresFlags: ["-h", "127.0.0.1", "-k", localDir],
    onLog: (message) => {
      startupLog.push(String(message));
      if (startupLog.length > 10) startupLog.shift();
    },
    onError: () => {},
  });
  if (!existsSync(path.join(directory, "PG_VERSION"))) await db.initialise();
  try {
    await db.start();
  } catch {
    throw new Error(`PostgreSQL startup failed: ${startupLog.join(" ")}`);
  }
  const client = db.getPgClient("postgres", "127.0.0.1");
  await client.connect();
  for (const name of ["soglia", "soglia_test"]) {
    const found = await client.query(
      "SELECT 1 FROM pg_database WHERE datname=$1",
      [name],
    );
    if (!found.rowCount) await client.query(`CREATE DATABASE ${name}`);
  }
  await client.end();
  return {
    stop: async () => {
      if (existsSync(pidFile)) await db.stop();
    },
  };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = await startDatabase();
  console.log("PostgreSQL ready (loopback).");
  const keep = setInterval(() => {}, 60000);
  const stop = async () => {
    clearInterval(keep);
    await db.stop();
    process.exit(0);
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}
