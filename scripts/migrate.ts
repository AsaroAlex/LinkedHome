import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { makePool, type DB } from "../server/db.js";
export async function migrate(db: DB) {
  const c = await db.connect();
  let failed = false,
    broken = false;
  try {
    await c.query("SELECT pg_advisory_lock(7849321)");
    await c.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY,checksum text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())",
    );
    const names = (await readdir("migrations"))
      .filter((x) => x.endsWith(".sql"))
      .sort();
    const applied = await c.query("SELECT name FROM schema_migrations");
    if (applied.rows.some((row) => !names.includes(row.name)))
      throw new Error("Applied migration file is missing.");
    for (const name of names) {
      const sql = await readFile(`migrations/${name}`, "utf8"),
        checksum = createHash("sha256").update(sql).digest("hex");
      const found = await c.query(
        "SELECT checksum FROM schema_migrations WHERE name=$1",
        [name],
      );
      if (found.rowCount) {
        if (found.rows[0].checksum !== checksum)
          throw new Error(`Migration checksum mismatch: ${name}`);
        continue;
      }
      await c.query("BEGIN");
      try {
        await c.query(sql);
        await c.query(
          "INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)",
          [name, checksum],
        );
        await c.query("COMMIT");
      } catch (e) {
        try {
          await c.query("ROLLBACK");
        } catch {
          broken = true;
        }
        throw e;
      }
    }
  } catch (error) {
    failed = true;
    throw error;
  } finally {
    try {
      await c.query("SELECT pg_advisory_unlock(7849321)");
    } catch (error) {
      broken = true;
      if (!failed) throw error;
    } finally {
      c.release(broken);
    }
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = makePool();
  try {
    await migrate(db);
    console.log("Migrations applied.");
  } finally {
    await db.end();
  }
}

export async function checkMigrations(db: DB) {
  const names = (await readdir("migrations"))
    .filter((x) => x.endsWith(".sql"))
    .sort();
  try {
    const ledger = await db.query(
      "SELECT name,checksum FROM schema_migrations",
    );
    if (
      ledger.rows.length !== names.length ||
      ledger.rows.some((row) => !names.includes(row.name))
    )
      throw new Error("missing");
    for (const name of names) {
      const checksum = createHash("sha256")
        .update(await readFile(`migrations/${name}`, "utf8"))
        .digest("hex");
      if (ledger.rows.find((row) => row.name === name)?.checksum !== checksum)
        throw new Error("changed");
    }
  } catch {
    throw new Error(
      "Database migrations are missing or changed. Review and run npm run db:migrate explicitly.",
    );
  }
}
