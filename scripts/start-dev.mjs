/**
 * Runs dev-client and dev-server together (replaces shell `npm run dev-client & npm run dev-server`).
 * Keeps both attached to stdio and forwards SIGINT/SIGTERM; exits when either process exits.
 */
import { spawn } from "node:child_process";
import process from "node:process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(scriptName) {
  const child = spawn(npm, ["run", scriptName], {
    stdio: "inherit",
    env: process.env,
  });
  child.on("error", (err) => {
    console.error(`[start-dev] failed to spawn ${scriptName}:`, err.message);
    shutdown(1);
  });
  return child;
}

const client = run("dev-client");
const server = run("dev-server");

let shuttingDown = false;

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of [client, server]) {
    if (c && !c.killed) {
      c.kill("SIGTERM");
    }
  }
  setTimeout(() => process.exit(code ?? 0), 150).unref();
}

for (const [label, child] of [
  ["dev-client", client],
  ["dev-server", server],
]) {
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const exitCode = code ?? (signal ? 1 : 0);
    if (exitCode !== 0) {
      console.error(`[start-dev] ${label} exited with ${exitCode}`);
    }
    shutdown(exitCode);
  });
}

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => shutdown(0));
}
