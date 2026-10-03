import pg, { type PoolClient } from "pg";
import { databaseUrl } from "./config.js";
pg.types.setTypeParser(1082, (value) => value);
export const makePool = (connectionString = databaseUrl()) => {
  const pool = new pg.Pool({
    connectionString,
    max: 8,
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
  });
  // Idle connections can be terminated when an owned local server receives a
  // process-group shutdown. Handle this without Node dumping the client object.
  pool.on("error", (raw) => {
    const error = raw as Error & { code?: string };
    if (error.code !== "57P01")
      console.error(
        "Idle database connection failed:",
        error.code || "connection_error",
      );
  });
  return pool;
};
export type DB = ReturnType<typeof makePool>;
export async function tx<T>(
  db: DB,
  fn: (c: PoolClient) => Promise<T>,
): Promise<T> {
  const c = await db.connect();
  try {
    await c.query("BEGIN");
    const result = await fn(c);
    await c.query("COMMIT");
    return result;
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
export async function lockUsers(c: PoolClient, ids: string[]) {
  // The same sorted parent-row lock protocol covers absent blocks and new invitations.
  for (const id of [...new Set(ids)].sort())
    await c.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [id]);
}
