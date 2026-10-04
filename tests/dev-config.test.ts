import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { describe, expect, it } from "vitest";
import { readDevelopmentConfiguration as config } from "../scripts/dev-config";

describe("development configuration", () => {
  it("keeps local UI/API ports separate and an exact browser origin", () => {
    expect(config({})).toEqual({
      host: "127.0.0.1",
      port: 3000,
      apiPort: 3001,
      origin: "http://127.0.0.1:3000",
      allowedHosts: ["127.0.0.1"],
    });
    expect(config({ DEV_PORT: "3100", DEV_API_PORT: "3101" }).origin).toBe(
      "http://127.0.0.1:3100",
    );
  });

  it("uses localhost for local container port forwarding", () => {
    expect(config({ DEV_HOST: "0.0.0.0" }).origin).toBe(
      "http://localhost:3000",
    );
    expect(config({ DEV_HOST: "::1" }).origin).toBe("http://[::1]:3000");
  });

  it("requires an explicit browser origin for generic cloud previews", () => {
    expect(() => config({}, true)).toThrow(
      "Cloud development requires APP_ORIGIN",
    );
    expect(
      config({ APP_ORIGIN: "https://preview.example.test/" }, true),
    ).toEqual({
      host: "0.0.0.0",
      port: 3000,
      apiPort: 3001,
      origin: "https://preview.example.test",
      allowedHosts: ["preview.example.test"],
    });
  });

  it("derives the private Codespaces origin and respects an explicit override", () => {
    const env = {
      CODESPACES: "true",
      CODESPACE_NAME: "linkedhome-demo",
      GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: "app.github.dev",
      DEV_PORT: "3100",
    };
    expect(config(env)).toMatchObject({
      host: "0.0.0.0",
      origin: "https://linkedhome-demo-3100.app.github.dev",
      allowedHosts: ["linkedhome-demo-3100.app.github.dev"],
    });
    expect(
      config({ ...env, APP_ORIGIN: "https://custom.example.test" }).origin,
    ).toBe("https://custom.example.test");
    expect(() => config({ CODESPACES: "true" })).toThrow("CODESPACE_NAME");
  });

  it.each([
    { DATABASE_URL: "postgresql://external.example.test/production" },
    { APP_ENV: "production" },
    { APP_ENV: "staging" },
    { MAIL_TRANSPORT: "smtp" },
  ])("refuses external services in the development runner: %j", (env) => {
    expect(() => config(env)).toThrow(
      "generated local database and local mail",
    );
  });

  it.each(["0", "80", "65536", "3000oops", "3e3", "-3000"])(
    "rejects invalid ports: %s",
    (value) => {
      expect(() => config({ DEV_PORT: value })).toThrow("DEV_PORT");
      expect(() => config({ DEV_API_PORT: value })).toThrow("DEV_API_PORT");
    },
  );

  it("rejects overlapping ports, invalid bind hosts and non-origin URLs", () => {
    expect(() => config({ DEV_PORT: "3001" })).toThrow("must be different");
    expect(() => config({ DEV_HOST: "https://preview.example.test" })).toThrow(
      "DEV_HOST",
    );
    expect(() =>
      config({ APP_ORIGIN: "https://preview.example.test/path" }),
    ).toThrow("APP_ORIGIN");
  });
});

describe("development startup failures", () => {
  it("returns a failing exit status for an occupied port and leaves its owner alive", async () => {
    const owner = createServer();
    await new Promise<void>((resolve) => owner.listen(0, "127.0.0.1", resolve));
    const address = owner.address();
    if (!address || typeof address === "string")
      throw new Error("Missing test port");
    try {
      const child = spawn(
        process.execPath,
        ["--import", "tsx", "scripts/dev.ts"],
        {
          env: {
            ...process.env,
            APP_ENV: "local",
            MAIL_TRANSPORT: "local",
            DATABASE_URL: "",
            CODESPACES: "false",
            DEV_HOST: "127.0.0.1",
            DEV_PORT: String(address.port === 3000 ? 3002 : 3000),
            DEV_API_PORT: String(address.port),
            APP_ORIGIN: "http://127.0.0.1:3000",
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      let output = "";
      child.stdout.on("data", (chunk) => {
        output += chunk;
      });
      child.stderr.on("data", (chunk) => {
        output += chunk;
      });
      const code = await new Promise<number | null>((resolve, reject) => {
        const timeout = setTimeout(() => {
          child.kill("SIGKILL");
          reject(
            new Error("Development startup did not exit after a port conflict"),
          );
        }, 5000);
        child.once("error", (error) => {
          clearTimeout(timeout);
          reject(error);
        });
        child.once("close", (result) => {
          clearTimeout(timeout);
          resolve(result);
        });
      });
      expect(code).toBe(1);
      expect(output).toContain("EADDRINUSE");
      expect(owner.listening).toBe(true);
    } finally {
      await new Promise<void>((resolve, reject) =>
        owner.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
});
