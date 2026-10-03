import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
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
