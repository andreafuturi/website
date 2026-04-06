import { spawn } from "node:child_process";
import readline from "node:readline";

const startedAt = Date.now();
const processes = [];

let clientReady = false;
let serverReady = false;
let addressShown = false;
let shuttingDown = false;

const serverUrl = "http://localhost:8000";

const isViteAddressLine = line =>
  /^\s*(Local|Network):\s+http:\/\//.test(line) || /^\s*➜\s+/.test(line);

const isClientReadyLine = line =>
  /\bready in\b/i.test(line) || /\b(vite)\b/i.test(line) && /\b(dev server running|server running)\b/i.test(line);

const isServerReadyLine = line =>
  /\bListening on\b/i.test(line) || /http:\/\/[^ ]*:8000\b/i.test(line);

const logLine = (prefix, line) => {
  console.log(`${prefix} ${line}`);
};

const maybeShowAddress = () => {
  if (!addressShown && clientReady && serverReady) {
    addressShown = true;
    const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(`✅ App ready at ${serverUrl} (${seconds}s)`);
  }
};

const watchProcessOutput = (child, prefix, onLine) => {
  const stdout = readline.createInterface({ input: child.stdout });
  const stderr = readline.createInterface({ input: child.stderr });

  stdout.on("line", line => onLine(line, false));
  stderr.on("line", line => onLine(line, true));
  return { stdout, stderr };
};

const spawnNamedProcess = (name, args, onLine) => {
  const child = spawn("npm", args, {
    stdio: ["inherit", "pipe", "pipe"],
    shell: process.platform === "win32",
  });

  processes.push({ name, child });
  watchProcessOutput(child, name, onLine);

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const exitDetails = signal ? `signal ${signal}` : `code ${code}`;
    console.error(`❌ [${name}] exited with ${exitDetails}`);
    shutdown(code ?? 1);
  });

  return child;
};

const shutdown = exitCode => {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const { child } of processes) {
    if (!child.killed) child.kill("SIGTERM");
  }

  setTimeout(() => {
    for (const { child } of processes) {
      if (!child.killed) child.kill("SIGKILL");
    }
    process.exit(exitCode);
  }, 1500).unref();
};

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

spawnNamedProcess("client", ["run", "dev-client"], line => {
  if (!isViteAddressLine(line)) {
    logLine("[client]", line);
  }

  if (!clientReady && isClientReadyLine(line)) {
    clientReady = true;
    maybeShowAddress();
  }
});

spawnNamedProcess("server", ["run", "dev-server"], line => {
  logLine("[server]", line);

  if (!serverReady && isServerReadyLine(line)) {
    serverReady = true;
    maybeShowAddress();
  }
});
