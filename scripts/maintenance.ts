import { readdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { localDir } from "../server/config.js";
import { makePool, tx } from "../server/db.js";
const db = makePool();
try {
  await tx(db, async (c) => {
    await c.query(
      "DELETE FROM reports WHERE created_at<now()-interval '30 days'",
    );
    await c.query("DELETE FROM sessions WHERE expires_at<=now()");
    await c.query("DELETE FROM auth_tokens WHERE expires_at<=now()");
    await c.query(
      "DELETE FROM events WHERE created_at<now()-interval '30 days'",
    );
    await c.query(
      "DELETE FROM audit_log WHERE created_at<now()-interval '90 days'",
    );
  });
  const mailDir = path.join(localDir, "mail");
  for (const file of await readdir(mailDir).catch(() => [])) {
    if (!/^[0-9]+-[a-f0-9-]+\.json$/.test(file)) continue;
    const target = path.join(mailDir, file);
    try {
      const message = JSON.parse(await readFile(target, "utf8"));
      if (new Date(message.created_at).getTime() < Date.now() - 30 * 60000)
        await unlink(target);
    } catch {
      /* Leave unrecognised files for operator inspection. */
    }
  }
  console.log(
    "Expired auth records and retention-limited events/audit removed.",
  );
} finally {
  await db.end();
}
