import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { localConfig } from "../server/config.js";
import { makePool } from "../server/db.js";
import { startDatabase } from "./database.js";
import { readDevelopmentConfiguration } from "./dev-config.js";
import { migrate } from "./migrate.js";
import { seed } from "./seed.js";

type Child = { name: string; process: ChildProcess; closed: boolean };
const children: Child[] = [];
let service: Awaited<ReturnType<typeof startDatabase>> | undefined;
let closing = false;
let resultCode = 0;
let finishStartup!: () => void;
let finishShutdown!: () => void;
const startupFinished = new Promise<void>((resolve) => {
  finishStartup = resolve;
});
const shutdownFinished = new Promise<void>((resolve) => {
  finishShutdown = resolve;
});

function signalChild(child: Child, signal: NodeJS.Signals) {
  if (!child.process.pid || child.closed) return;
  try {
    // Each POSIX child has its own group, including the API watcher's child.
    // Terminating that group cannot stop an unrelated service or our database.
    if (process.platform === "win32") child.process.kill(signal);
    else process.kill(-child.process.pid, signal);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
  }
}

async function shutdown() {
  // A signal during bootstrap still waits for owned resources to be registered.
  await startupFinished;
  try {
    await Promise.all(
      children.map(
        (child) =>
          new Promise<void>((resolve) => {
            if (child.closed) return resolve();
            const timeout = setTimeout(() => {
              console.error(`${child.name} did not stop; terminating it.`);
              try {
                signalChild(child, "SIGKILL");
              } catch {
                resultCode = 1;
                console.error(`${child.name} could not be terminated.`);
              }
            }, 8000);
            child.process.once("close", () => {
              clearTimeout(timeout);
              resolve();
            });
            signalChild(child, "SIGTERM");
          }),
      ),
    );
  } catch (error) {
    resultCode = 1;
    console.error(
      "Development process cleanup failed:",
      (error as NodeJS.ErrnoException).code || "process_error",
    );
  } finally {
    try {
      await service?.stop();
    } catch (error) {
      resultCode = 1;
      console.error(
        "Local database cleanup failed:",
        (error as NodeJS.ErrnoException).code || "database_error",
      );
    }
    process.exitCode = resultCode;
    finishShutdown();
  }
}

function stop(code = 0) {
  if (code !== 0) resultCode = code;
  if (closing) return;
  closing = true;
  void shutdown();
}
// The database library's signal hooks would stop PostgreSQL and force exit
// before our child cleanup. Use its public API to let this supervisor own
// signals, while retaining the library's emergency exit hook.
const databaseExitHook = createRequire(
  import.meta.resolve("embedded-postgres"),
)("async-exit-hook") as { unhookEvent(event: string): void };
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
  databaseExitHook.unhookEvent(signal);
  process.on(signal, () => stop());
}

async function checkPort(host: string, port: number) {
  await new Promise<void>((resolve, reject) => {
    const probe = createServer();
    probe.once("error", (error: NodeJS.ErrnoException) => {
      reject(
        new Error(
          `Cannot use development port ${host}:${port} (${error.code || "listen_error"}). Stop the existing service or choose another DEV port.`,
        ),
      );
    });
    probe.listen({ host, port }, () => {
      probe.close((error) => (error ? reject(error) : resolve()));
    });
  });
}

function launch(name: string, args: string[], env: NodeJS.ProcessEnv) {
  const child: Child = {
    name,
    process: spawn(process.execPath, args, {
      stdio: "inherit",
      detached: process.platform !== "win32",
      env,
    }),
    closed: false,
  };
  children.push(child);
  child.process.once("close", () => {
    child.closed = true;
  });
  child.process.once("error", (error: NodeJS.ErrnoException) => {
    console.error(`${name} failed to start (${error.code || "spawn_error"}).`);
    stop(1);
  });
  child.process.once("exit", (code, signal) => {
    if (closing) return;
    console.error(`${name} exited (${code ?? signal ?? "unknown"}).`);
    stop(code && code > 0 ? code : 1);
  });
  return child.process.pid;
}

try {
  const envFile = ".env.development.local";
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  const config = readDevelopmentConfiguration(
    process.env,
    process.argv.includes("--cloud"),
  );
  Object.assign(process.env, {
    DEV_HOST: config.host,
    DEV_PORT: String(config.port),
    DEV_API_PORT: String(config.apiPort),
    APP_ORIGIN: config.origin,
    APP_ENV: "local",
    MAIL_TRANSPORT: "local",
    NODE_ENV: "development",
  });
  await checkPort("127.0.0.1", config.apiPort);
  await checkPort(config.host, config.port);
  if (!closing) {
    const databaseConfig = localConfig(true);
    if (
      config.port === databaseConfig.port ||
      config.apiPort === databaseConfig.port
    )
      throw new Error(
        `Development HTTP ports must differ from the local PostgreSQL port (${databaseConfig.port}).`,
      );
    service = await startDatabase();
    const db = makePool();
    try {
      await migrate(db);
      await seed(db);
    } finally {
      await db.end();
    }
  }
  if (!closing) {
    const apiPid = launch(
      "API watcher",
      [
        fileURLToPath(import.meta.resolve("tsx/cli")),
        "watch",
        "--clear-screen=false",
        "--include",
        "migrations/*.sql",
        "server/main.ts",
      ],
      {
        ...process.env,
        HOST: "127.0.0.1",
        PORT: String(config.apiPort),
      },
    );
    const uiPid = launch(
      "Vite",
      [
        path.join(
          path.dirname(fileURLToPath(import.meta.resolve("vite/package.json"))),
          "bin/vite.js",
        ),
      ],
      process.env,
    );
    console.log(`Development URL: ${config.origin}`);
    console.log(
      `Frontend HMR and API watch started (Vite PID ${uiPid}, API watcher PID ${apiPid}); API remains on loopback:${config.apiPort}.`,
    );
    console.log(
      "Local data is preserved. Ctrl+C stops the development services.",
    );
  }
} catch (error) {
  console.error(
    "Development startup failed:",
    error instanceof Error ? error.message : "Unknown error.",
  );
  stop(1);
} finally {
  finishStartup();
}
await shutdownFinished;
// embedded-postgres registers an async exit hook; finish with our own result
// after cleanup so startup failures cannot be reported as successful commands.
process.exit(resultCode);
