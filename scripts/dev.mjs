const websiteRoot = new URL("..", import.meta.url);

function isFreePort(port) {
  try {
    const listener = Deno.listen({ hostname: "0.0.0.0", port });
    listener.close();
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.AddrInUse) return false;
    throw error;
  }
}

function firstFreePort(start, maxAttempts = 200) {
  for (let port = start; port <= start + maxAttempts; port += 1) {
    if (isFreePort(port)) return port;
  }
  throw new Error(`No free port in range ${start}-${start + maxAttempts}`);
}

const vitePort = firstFreePort(5173);

const baseEnv = Deno.env.toObject();
const io = { stdin: "inherit", stdout: "inherit", stderr: "inherit" };

const vite = new Deno.Command("npm", {
  cwd: websiteRoot,
  args: ["run", "dev-client", "--", "--port", String(vitePort), "--strictPort"],
  env: baseEnv,
  ...io,
}).spawn();

const app = new Deno.Command("deno", {
  cwd: websiteRoot,
  args: [
    "run",
    "--unstable",
    "--allow-env",
    "--watch",
    "--no-check",
    "--allow-read",
    "--allow-ffi",
    "--allow-run",
    "--allow-write",
    "--allow-net",
    "--allow-sys=networkInterfaces",
    "server/main.jsx",
    "--dev",
  ],
  env: { ...baseEnv, VITE_DEV_PORT: String(vitePort) },
  ...io,
}).spawn();

const safeKill = (proc, signal = "SIGTERM") => {
  try { proc.kill(signal); } catch { /* process already exited */ }
};
const stop = (signal = "SIGTERM") => (safeKill(vite, signal), safeKill(app, signal));

Deno.addSignalListener("SIGINT", () => stop("SIGINT"));
Deno.addSignalListener("SIGTERM", () => stop("SIGTERM"));

const [{ code: viteCode }, { code: appCode }] = await Promise.all([
  vite.status,
  app.status,
]);
stop();
Deno.exit(appCode || viteCode);
