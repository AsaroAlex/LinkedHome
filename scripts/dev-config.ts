import { isIP } from "node:net";
import { readRuntimeConfiguration } from "../server/config.js";

type Environment = Record<string, string | undefined>;

function port(value: string | undefined, fallback: number, name: string) {
  if (value === undefined || value === "") return fallback;
  if (!/^\d+$/.test(value) || Number(value) < 1024 || Number(value) > 65535)
    throw new Error(`${name} must be an integer between 1024 and 65535.`);
  return Number(value);
}

export function readDevelopmentConfiguration(
  env: Environment = process.env,
  cloud = false,
) {
  if (
    env.DATABASE_URL ||
    (env.APP_ENV && env.APP_ENV !== "local") ||
    (env.MAIL_TRANSPORT && env.MAIL_TRANSPORT !== "local")
  )
    throw new Error(
      "Development uses the generated local database and local mail only. Remove DATABASE_URL, APP_ENV=staging/production or MAIL_TRANSPORT=smtp before running npm run dev.",
    );
  const uiPort = port(env.DEV_PORT, 3000, "DEV_PORT"),
    apiPort = port(env.DEV_API_PORT, 3001, "DEV_API_PORT"),
    codespaces = env.CODESPACES === "true";
  if (uiPort === apiPort)
    throw new Error("DEV_PORT and DEV_API_PORT must be different.");
  const host = env.DEV_HOST || (cloud || codespaces ? "0.0.0.0" : "127.0.0.1");
  if (host !== "localhost" && !isIP(host))
    throw new Error("DEV_HOST must be localhost or an IPv4/IPv6 bind address.");

  let origin = env.APP_ORIGIN;
  if (!origin && codespaces) {
    if (!env.CODESPACE_NAME)
      throw new Error(
        "CODESPACE_NAME is required to derive the preview origin.",
      );
    const domain =
      env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || "app.github.dev";
    origin = `https://${env.CODESPACE_NAME}-${uiPort}.${domain}`;
  }
  if (!origin && cloud)
    throw new Error(
      "Cloud development requires APP_ORIGIN matching the forwarded browser URL. Set it in .env.development.local or use npm run dev for local development.",
    );
  const localHost =
    host === "0.0.0.0" || host === "::"
      ? "localhost"
      : host.includes(":")
        ? `[${host}]`
        : host;
  const runtime = readRuntimeConfiguration({
    ...env,
    APP_ORIGIN: origin || `http://${localHost}:${uiPort}`,
    APP_ENV: "local",
    MAIL_TRANSPORT: "local",
  });
  return {
    host,
    port: uiPort,
    apiPort,
    origin: runtime.origin,
    allowedHosts: [new URL(runtime.origin).hostname],
  };
}
