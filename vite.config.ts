import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readDevelopmentConfiguration } from "./scripts/dev-config.js";

export default defineConfig(({ command, isPreview }) => {
  const development =
    command === "serve" && !isPreview
      ? readDevelopmentConfiguration()
      : undefined;
  return {
    plugins: [react()],
    clearScreen: development ? false : undefined,
    server: development
      ? {
          host: development.host,
          port: development.port,
          strictPort: true,
          allowedHosts: development.allowedHosts,
          fs: {
            // Retain Vite 8's default denials when extending this array.
            deny: [
              ".env",
              ".env.*",
              "*.{crt,pem,key,p12,pfx,cer,der}",
              ".npmrc",
              ".yarnrc.yml",
              "**/.git/**",
              "**/.local/**",
            ],
          },
          proxy: {
            "/api": `http://127.0.0.1:${development.apiPort}`,
          },
        }
      : undefined,
    build: { sourcemap: false },
  };
});
