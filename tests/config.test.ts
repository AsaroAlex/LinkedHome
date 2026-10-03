import { describe, expect, it } from "vitest";
import { readRuntimeConfiguration } from "../server/config";

const deployment = {
  APP_ENV: "staging",
  APP_ORIGIN: "https://staging.example.test",
  DATABASE_URL: "postgresql://app:placeholder@db.internal:5432/linkedhome",
  MAIL_TRANSPORT: "smtp",
};

describe("deployment configuration boundary", () => {
  it("preserves the explicit local default without trusting headers", () => {
    expect(readRuntimeConfiguration({})).toEqual({
      environment: "local",
      origin: "http://127.0.0.1:3000",
      mailTransport: "local",
      trustedProxies: false,
    });
  });
  it.each(["staging", "production"])(
    "requires an external database, HTTPS and real transport for %s",
    (APP_ENV) => {
      expect(
        readRuntimeConfiguration({ ...deployment, APP_ENV }).environment,
      ).toBe(APP_ENV);
      for (const key of [
        "APP_ORIGIN",
        "DATABASE_URL",
        "MAIL_TRANSPORT",
      ] as const) {
        const env: Record<string, string | undefined> = {
          ...deployment,
          APP_ENV,
        };
        delete env[key];
        expect(() => readRuntimeConfiguration(env)).toThrow();
      }
    },
  );
  it.each([
    { APP_ENV: "prod" },
    { APP_ORIGIN: "http://public.example.test" },
    { APP_ORIGIN: "https://user:secret@example.test" },
    { APP_ORIGIN: "https://example.test/path" },
    { APP_ORIGIN: "https://example.test?token=secret" },
    { APP_ORIGIN: "https://example.test#secret" },
    { DATABASE_URL: "file:///tmp/db" },
    { DATABASE_URL: "postgresql://db.internal/" },
    { DATABASE_URL: "postgresql://db.internal" },
    { DATABASE_URL: "postgresql://db.internal/app?sslmode=no-verify" },
    {
      DATABASE_URL:
        "postgresql://db.internal/app?uselibpqcompat=true&sslmode=require",
    },
    { MAIL_TRANSPORT: "unknown" },
    { MAIL_TRANSPORT: "local" },
  ])(
    "rejects unsafe or mistyped deployment settings %j without echoing secrets",
    (patch) => {
      expect(() =>
        readRuntimeConfiguration({ ...deployment, ...patch }),
      ).toThrow();
      try {
        readRuntimeConfiguration({ ...deployment, ...patch });
      } catch (error) {
        expect(String(error)).not.toContain("secret");
      }
    },
  );
  it("accepts specific trusted upstreams and canonicalises the browser origin", () => {
    expect(
      readRuntimeConfiguration({
        ...deployment,
        APP_ORIGIN: "https://staging.example.test/",
        TRUST_PROXY: "172.30.0.2, 10.10.2.0/24, fd01::2/128",
      }),
    ).toEqual({
      environment: "staging",
      origin: "https://staging.example.test",
      mailTransport: "smtp",
      trustedProxies: ["172.30.0.2", "10.10.2.0/24", "fd01::2/128"],
    });
  });
  it.each([
    "true",
    "1",
    "*",
    "0.0.0.0/0",
    "::/0",
    "10.0.0.1/33",
    "10.0.0.1,",
    "fd00::/129",
    "10.0.0.1/24/1",
  ])("rejects unsafe proxy trust %s", (TRUST_PROXY) => {
    expect(() =>
      readRuntimeConfiguration({ ...deployment, TRUST_PROXY }),
    ).toThrow();
  });
});
