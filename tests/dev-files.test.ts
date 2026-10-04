import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, normalizePath, type ViteDevServer } from "vite";
import { describe, expect, it } from "vitest";

describe("development file privacy", () => {
  it("denies private files through static and module URLs while serving the frontend", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "linkedhome-vite-files-"));
    const privateContent = "linkedhome-private-file-fixture";
    let server: ViteDevServer | undefined;
    try {
      for (const directory of [".local/mail", ".git", "src"])
        await mkdir(path.join(root, directory), { recursive: true });
      const privateFiles = [
        ".local/private.json",
        ".local/mail/private.txt",
        ".env",
        ".env.development.local",
        ".git/config",
        "private.pem",
      ];
      for (const file of privateFiles)
        await writeFile(
          path.join(root, file),
          file.endsWith(".json")
            ? JSON.stringify({ fixture: privateContent })
            : `INTERNAL_FIXTURE=${privateContent}\n`,
        );
      await writeFile(
        path.join(root, "index.html"),
        '<!doctype html><html><body>LinkedHome public fixture<script type="module" src="/src/main.ts"></script></body></html>',
      );
      await writeFile(
        path.join(root, "src/main.ts"),
        'console.log("LinkedHome public module");',
      );
      server = await createServer({
        root,
        configFile: fileURLToPath(
          new URL("../vite.config.ts", import.meta.url),
        ),
        logLevel: "silent",
        server: { host: "127.0.0.1", port: 0, strictPort: true },
      });
      await server.listen();
      const address = server.httpServer?.address();
      if (!address || typeof address === "string")
        throw new Error("Missing development fixture listener");
      const origin = `http://127.0.0.1:${address.port}`;

      for (const file of privateFiles) {
        const direct = `/${file}`;
        const absolute = `/@fs/${normalizePath(path.join(root, file))}`;
        for (const url of [
          direct,
          absolute,
          `${direct}?raw&import`,
          `${absolute}?raw&import`,
        ]) {
          const response = await fetch(origin + url);
          expect(response.status, url).toBe(403);
          expect(await response.text(), url).not.toContain(privateContent);
        }
      }

      for (const [url, content] of [
        ["/", "LinkedHome public fixture"],
        ["/src/main.ts", "LinkedHome public module"],
      ]) {
        const response = await fetch(origin + url);
        expect(response.status, url).toBe(200);
        expect(await response.text(), url).toContain(content);
      }
    } finally {
      try {
        await server?.close();
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    }
  });
});
