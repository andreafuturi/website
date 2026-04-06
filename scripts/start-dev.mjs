/**
 * Dev orchestration: start dev-server first, wait until it accepts TCP on the HTTP port,
 * then start dev-client. Replaces shell `npm run dev-client & npm run dev-server`, which
 * interleaves logs unpredictably and never waits for readiness.
 *
 * Override port/host if your Deno app does not listen on PORT (default 8000):
 *   START_DEV_HTTP_PORT=9000 npm start
 */
import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import process from "node:process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const httpHost = process.env.START_DEV_HTTP_HOST ?? "127.0.0.1";
const httpPort = Number(
  process.env.START_DEV_HTTP_PORT ?? process.env.PORT ?? 8000
);
const waitMs = Number(process.env.START_DEV_WAIT_MS ?? 60_000);

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

/** Resolves when something accepts TCP on host:port (Deno has called listen). */
function waitForAcceptance(host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    function attempt() {
      const socket = createConnection({ host, port }, () => {
        socket.end();
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        if (Date.now() >= deadline) {
          reject(
            new Error(
              `timed out after ${timeoutMs}ms waiting for ${host}:${port}`
            )
          );
        } else {
          setTimeout(attempt, 100);
        }
      });
    }

    attempt();
  });
}

let client;
let server;
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

function attachExit(label, child) {
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const exitCode = code ?? (signal ? 1 : 0);
    if (exitCode !== 0) {
      console.error(`[start-dev] ${label} exited with ${exitCode}`);
    }
    shutdown(exitCode);
  });
}

async function main() {
  console.error(
    `[start-dev] Starting dev-server; will wait for TCP ${httpHost}:${httpPort} before dev-client…`
  );

  server = run("dev-server");
  attachExit("dev-server", server);

  try {
    await waitForAcceptance(httpHost, httpPort, waitMs);
  } catch (e) {
    console.error(`[start-dev] ${e.message}`);
    shutdown(1);
    return;
  }

  console.error(
    `[start-dev] ${httpHost}:${httpPort} is up — starting dev-client (Vite)…`
  );
  client = run("dev-client");
  attachExit("dev-client", client);
}

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => shutdown(0));
}

main().catch((err) => {
  console.error("[start-dev]", err);
  shutdown(1);
});
