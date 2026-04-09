
const vitePort = (() => {
  const listener = Deno.listen({ hostname: "0.0.0.0", port: 0 });
  const { port } = listener.addr;
  listener.close();
  return port;
})();

const env = { ...Deno.env.toObject(), VITE_DEV_PORT: String(vitePort) };
const websiteRoot = new URL("..", import.meta.url);
const dev = new Deno.Command("npm", {
  cwd: websiteRoot,
  args: [
    "exec",
    "concurrently",
    "--",
    "--kill-others",
    "--names",
    "client,server",
    `npm run dev-client -- --port ${vitePort} --strictPort`,
    "npm run dev-server",
  ],
  env,
}).spawn();

const { code } = await dev.status;
Deno.exit(code);
