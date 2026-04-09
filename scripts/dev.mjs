const websiteRoot = new URL("..", import.meta.url);
const vitePort = (() => {
  const listener = Deno.listen({ hostname: "0.0.0.0", port: 0 });
  const { port } = listener.addr;
  listener.close();
  return port;
})();

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

const stop = (signal = "SIGTERM") => {
  for (const proc of [vite, app]) {
    try { proc.kill(signal); } catch { /* process already exited */ }
  }
};

Deno.addSignalListener("SIGINT", () => stop("SIGINT"));
Deno.addSignalListener("SIGTERM", () => stop("SIGTERM"));

const [{ code: viteCode }, { code: appCode }] = await Promise.all([
  vite.status,
  app.status,
]);
stop();
Deno.exit(appCode || viteCode);
