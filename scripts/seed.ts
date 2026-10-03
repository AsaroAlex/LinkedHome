import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makePool, type DB, tx } from "../server/db.js";
import { hashPassword, token } from "../server/auth.js";
import { localDir } from "../server/config.js";
export async function seed(db: DB) {
  if (
    (process.env.APP_ENV && process.env.APP_ENV !== "local") ||
    process.env.DATABASE_URL
  )
    throw new Error("Demo seed is restricted to the generated local database.");
  const credentialsPath = path.join(localDir, "demo-accounts.json");
  if (existsSync(credentialsPath)) return;
  const credentials: Record<
    string,
    { email: string; password: string; id: string }
  > = {};
  const when = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  await tx(db, async (c) => {
    await c.query("SELECT pg_advisory_xact_lock(7849322)");
    if (
      (
        await c.query(
          "SELECT 1 FROM users WHERE email LIKE '%@example.test' LIMIT 1",
        )
      ).rowCount
    )
      throw new Error(
        "Seed accounts already exist but credential file is missing; no passwords changed.",
      );
    for (const [key, role, staff, name] of [
      ["tenant", "tenant", null, "Ada Demo"],
      ["landlord", "landlord", null, "Luca Demo"],
      ["both", "both", null, "Marta Demo"],
      ["admin", "both", "admin", "Operatore Demo"],
      ["moderator", "both", "moderator", "Moderazione Demo"],
    ] as const) {
      const email = `${key}@example.test`,
        password = token(),
        hash = await hashPassword(password);
      const result = await c.query(
        "INSERT INTO users(email,password_hash,display_name,role,staff_role,email_verified) VALUES($1,$2,$3,$4,$5,true) RETURNING id",
        [email, hash, name, role, staff],
      );
      const id = result.rows[0].id;
      credentials[key] = { email, password, id };
    }
    for (const [key, budget, occupants] of [
      ["tenant", 1100, 2],
      ["both", 950, 1],
    ] as const)
      await c.query(
        "INSERT INTO profiles(user_id,city,budget,move_in,duration,occupants,status,published_at) VALUES($1,'Bologna',$2,$3,12,$4,'published',now())",
        [credentials[key].id, budget, when, occupants],
      );
    await c.query(
      "INSERT INTO properties(owner_id,title,city,area,description,rent,available_from,min_months,max_months,capacity,sqm,rooms,furnished,authority_attested,status,published_at) VALUES($1,'Una casa luminosa in città','Bologna','Saragozza','Immobile sintetico per esplorare il percorso. Due stanze, una zona giorno luminosa e spazio per le tue abitudini.',850,$2,6,36,2,68,3,true,true,'published',now())",
      [credentials.landlord.id, new Date().toISOString().slice(0, 10)],
    );
  });
  await writeFile(credentialsPath, JSON.stringify(credentials, null, 2), {
    mode: 0o600,
    flag: "wx",
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = makePool();
  try {
    await seed(db);
    console.log(
      "Synthetic seed ready. Credentials are in .local/demo-accounts.json (not printed).",
    );
  } finally {
    await db.end();
  }
}
