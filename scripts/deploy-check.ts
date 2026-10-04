import { readRuntimeConfiguration } from "../server/config.js";
import {
  validateMailConfiguration,
  verifyMailTransport,
} from "../server/mail.js";
import { makePool } from "../server/db.js";
import { checkMigrations } from "./migrate.js";

let stage = "configuration";
try {
  const runtime = readRuntimeConfiguration();
  const mail = validateMailConfiguration();
  if (runtime.environment === "local")
    throw new Error(
      "Deployment preflight requires APP_ENV=preview, staging or production.",
    );
  if (process.argv.includes("--config-only")) {
    console.log(
      "Deployment configuration valid; connections and release gates were not checked.",
    );
  } else {
    stage = "database/schema";
    const db = makePool();
    try {
      await db.query("SELECT 1");
      await checkMigrations(db);
    } finally {
      await db.end();
    }
    if (runtime.environment === "preview") {
      console.log(
        "Synthetic preview database/schema ready. Email is disabled; no SMTP connection or message storage is available.",
      );
    } else {
      stage = "SMTP connection/authentication";
      await verifyMailTransport(mail);
      console.log(
        "Deployment database/schema and SMTP authentication ready. No email sent; delivery, proxy trust and release gates require separate verification.",
      );
    }
  }
  if (!runtime.trustedProxies)
    console.log(
      "TRUST_PROXY=false: rate limits use the socket IP. Verify ingress before allowing public signups.",
    );
} catch (error) {
  // Configuration errors are our own messages. Network/DB errors can contain
  // remote details: name only the failed check, never credentials or addresses.
  console.error(
    stage === "configuration"
      ? error instanceof Error
        ? error.message
        : "Invalid deployment configuration."
      : `Deployment preflight failed at ${stage}. Inspect the provider privately.`,
  );
  process.exitCode = 1;
}
