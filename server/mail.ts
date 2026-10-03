import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { localDir, appOrigin, production } from "./config.js";
export async function localMail(
  to: string,
  purpose: "verify" | "reset",
  secret: string,
) {
  if (production)
    throw new Error("Production mail transport is not configured.");
  const folder = path.join(localDir, "mail");
  await mkdir(folder, { recursive: true, mode: 0o700 });
  await writeFile(
    path.join(folder, `${Date.now()}-${randomUUID()}.json`),
    JSON.stringify(
      {
        to,
        purpose,
        url: `${appOrigin}/account/${purpose}#${secret}`,
        created_at: new Date().toISOString(),
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
}
