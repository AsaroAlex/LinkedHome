import { spawn } from "node:child_process";
const api = spawn(process.execPath, ["--import", "tsx", "server/main.ts"], {
  stdio: "inherit",
  env: { ...process.env, PORT: "3001" },
});
const ui = spawn(process.execPath, ["node_modules/vite/bin/vite.js"], {
  stdio: "inherit",
});
let closing = false;
const stop = () => {
  if (closing) return;
  closing = true;
  api.kill("SIGTERM");
  ui.kill("SIGTERM");
};
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
api.on("exit", stop);
ui.on("exit", stop);
