import { localConfig } from "../server/config.js";
import { makePool } from "../server/db.js";
import { startDatabase } from "./database.js";
import { migrate } from "./migrate.js";
import { seed } from "./seed.js";
if (process.env.DATABASE_URL)
  throw new Error(
    "For an external database run npm run db:migrate explicitly; bootstrap only manages a local synthetic environment.",
  );
localConfig(true);
const service = await startDatabase(),
  db = makePool();
try {
  await migrate(db);
  await seed(db);
  await db.query("SELECT 1");
  console.log(
    "Local database, migrations and synthetic accounts ready. Credentials: .local/demo-accounts.json.",
  );
} finally {
  await db.end();
  await service.stop();
}
