const websiteRoot = new URL("..", import.meta.url);
const vitePort = (() => {
  const listener = Deno.listen({ hostname: "0.0.0.0", port: 0 });
  const { port } = listener.addr;
  listener.close();
  return port;
})();

const baseEnv = Deno.env.toObject();
const stdio = { stdin: "inherit", stdout: "inherit", stderr: "inherit" };

const runNpm = (args, env = baseEnv) =>
  new Deno.Command("npm", { cwd: websiteRoot, args, env, ...stdio }).spawn();

const children = [
  runNpm(["run", "dev-client", "--", "--port", String(vitePort), "--strictPort"]),
  runNpm(["run", "dev-server"], { ...baseEnv, VITE_DEV_PORT: String(vitePort) }),
];

const stop = (signal = "SIGTERM") => {
  for (const child of children) {
    try { child.kill(signal); } catch { /* already exited */ }
  }
};

for (const sig of ["SIGINT", "SIGTERM"]) {
  Deno.addSignalListener(sig, () => stop(sig));
}

const [viteStatus, appStatus] = await Promise.all(children.map((c) => c.status));
stop();
Deno.exit(appStatus.code || viteStatus.code);
