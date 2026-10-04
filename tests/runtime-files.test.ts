import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

it("loads the deployed API from files copied into the runtime image", async () => {
  const project = fileURLToPath(new URL("..", import.meta.url));
  const runtime = await mkdtemp(
    path.join(tmpdir(), "linkedhome-runtime-files-"),
  );
  try {
    const dockerfile = (
      await readFile(path.join(project, "Dockerfile"), "utf8")
    ).replace(/\\\r?\n/g, " ");
    const runtimeStage = dockerfile.split(/^FROM .+ AS runtime\s*$/im)[1];
    expect(
      runtimeStage,
      "Dockerfile must define its final runtime stage",
    ).toBeTruthy();
    for (const line of runtimeStage.split("\n")) {
      const tokens = line.trim().split(/\s+/);
      if (tokens.shift() !== "COPY") continue;
      const stage = tokens.find((token) => token.startsWith("--from="));
      const files = tokens.filter((token) => !token.startsWith("--"));
      const destination = files.pop()!;
      if (stage === "--from=build") {
        for (const source of files) {
          // Frontend assets are checked by the build. This regression checks
          // backend imports and must also run before dist has been generated.
          if (source === "/app/dist") continue;
          expect(source).toMatch(/^\/app\//);
          const target = path.resolve(
            runtime,
            destination,
            files.length > 1 || destination.endsWith("/")
              ? path.basename(source)
              : "",
          );
          await mkdir(path.dirname(target), { recursive: true });
          await cp(path.join(project, source.slice("/app/".length)), target, {
            recursive: true,
          });
        }
      } else if (stage === "--from=runtime-dependencies") {
        expect(files).toEqual(["/app/node_modules"]);
        const target = path.resolve(runtime, destination);
        await mkdir(path.dirname(target), { recursive: true });
        // Reuse installed dependencies; copying the source files still exposes
        // omissions in the final image without installing or starting services.
        await symlink(path.join(project, "node_modules"), target, "dir");
      }
    }
    const imported = spawnSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "--input-type=module",
        "--eval",
        "const app = await import('./server/app.ts'); if (typeof app.buildApp !== 'function') throw new Error('Missing API factory'); console.log('Runtime imports loaded.');",
      ],
      {
        cwd: runtime,
        encoding: "utf8",
        timeout: 20_000,
        killSignal: "SIGKILL",
        maxBuffer: 1024 * 1024,
        env: {
          PATH: process.env.PATH,
          NODE_ENV: "production",
          APP_ENV: "preview",
          APP_ORIGIN: "https://runtime.example.test",
          DATABASE_URL:
            "postgresql://synthetic:placeholder@127.0.0.1:1/runtime_test",
          MAIL_TRANSPORT: "disabled",
        },
      },
    );
    expect(imported.error, imported.stderr).toBeUndefined();
    expect(imported.status, imported.stderr || imported.stdout).toBe(0);
    expect(imported.stdout.trim()).toBe("Runtime imports loaded.");
  } finally {
    await rm(runtime, { recursive: true, force: true });
  }
}, 30_000);
