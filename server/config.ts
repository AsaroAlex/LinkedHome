import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { isIP } from "node:net";
export type AppEnvironment = "local" | "preview" | "staging" | "production";
export interface RuntimeConfiguration {
  environment: AppEnvironment;
  origin: string;
  mailTransport: "local" | "disabled" | "smtp";
  trustedProxies: false | string[];
}
type Environment = Record<string, string | undefined>;

export function readRuntimeConfiguration(
  env: Environment = process.env,
): RuntimeConfiguration {
  const environment = env.APP_ENV || "local";
  if (!["local", "preview", "staging", "production"].includes(environment))
    throw new Error("APP_ENV must be local, preview, staging or production.");
  const deployed = environment !== "local";
  let origin: URL;
  try {
    origin = new URL(env.APP_ORIGIN || "http://127.0.0.1:3000");
  } catch {
    throw new Error("APP_ORIGIN must be a valid HTTP(S) origin.");
  }
  if (
    !["http:", "https:"].includes(origin.protocol) ||
    origin.username ||
    origin.password ||
    origin.search ||
    origin.hash ||
    origin.pathname !== "/"
  )
    throw new Error("APP_ORIGIN must contain only an HTTP(S) origin.");
  if (deployed && (!env.APP_ORIGIN || origin.protocol !== "https:"))
    throw new Error(
      "Preview, staging and production require an explicit HTTPS APP_ORIGIN.",
    );
  const mailTransport = env.MAIL_TRANSPORT || "local";
  if (!["local", "disabled", "smtp"].includes(mailTransport))
    throw new Error("MAIL_TRANSPORT must be local, disabled or smtp.");
  if (environment === "preview" && mailTransport !== "disabled")
    throw new Error("Preview requires MAIL_TRANSPORT=disabled.");
  if (environment !== "preview" && mailTransport === "disabled")
    throw new Error("MAIL_TRANSPORT=disabled is available only in preview.");
  if (deployed) {
    if (environment !== "preview" && mailTransport !== "smtp")
      throw new Error("Staging and production require MAIL_TRANSPORT=smtp.");
    let database: URL;
    try {
      database = new URL(env.DATABASE_URL || "");
    } catch {
      throw new Error(
        "Preview, staging and production require an external DATABASE_URL.",
      );
    }
    if (
      !["postgres:", "postgresql:"].includes(database.protocol) ||
      !database.hostname ||
      !database.pathname ||
      database.pathname === "/" ||
      database.searchParams.get("sslmode") === "no-verify" ||
      (database.searchParams.get("uselibpqcompat") === "true" &&
        database.searchParams.get("sslmode") !== "verify-full")
    )
      throw new Error(
        "DATABASE_URL must identify PostgreSQL without disabling certificate verification.",
      );
  }
  let trustedProxies: false | string[] = false;
  if (env.TRUST_PROXY && env.TRUST_PROXY !== "false") {
    const entries = env.TRUST_PROXY.split(",").map((entry) => entry.trim());
    for (const entry of entries) {
      const [address, mask, extra] = entry.split("/");
      const family = isIP(address);
      if (
        !family ||
        extra !== undefined ||
        (mask !== undefined &&
          (!/^\d+$/.test(mask) ||
            Number(mask) < 1 ||
            Number(mask) > (family === 4 ? 32 : 128)))
      )
        throw new Error(
          "TRUST_PROXY must be false or a list of explicit proxy IPs/CIDRs; all-address ranges are refused.",
        );
    }
    trustedProxies = entries;
  }
  return {
    environment: environment as AppEnvironment,
    origin: origin.origin,
    mailTransport: mailTransport as RuntimeConfiguration["mailTransport"],
    trustedProxies,
  };
}
export const localDir = path.resolve(".local");
export interface LocalConfig {
  password: string;
  port: number;
}
export function localConfig(create = false): LocalConfig {
  const file = path.join(localDir, "database.json");
  if (!existsSync(file) && create) {
    mkdirSync(localDir, { recursive: true, mode: 0o700 });
    writeFileSync(
      file,
      JSON.stringify({
        password: randomBytes(32).toString("hex"),
        port: 55432,
      }),
      { mode: 0o600, flag: "wx" },
    );
  }
  if (!existsSync(file))
    throw new Error("Run npm run bootstrap to create local configuration.");
  return JSON.parse(readFileSync(file, "utf8"));
}
export function databaseUrl(name = "soglia"): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const c = localConfig();
  return `postgresql://soglia:${c.password}@127.0.0.1:${c.port}/${name}`;
}
export const appOrigin = process.env.APP_ORIGIN || "http://127.0.0.1:3000";
export const production = process.env.APP_ENV === "production";
export const deployed = ["preview", "staging", "production"].includes(
  process.env.APP_ENV || "local",
);
