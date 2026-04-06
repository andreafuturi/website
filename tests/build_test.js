/**
 * Build test — verifies Vite client build completes successfully 🧪
 */
import { assertEquals, assert } from "https://deno.land/std/assert/mod.ts";

Deno.test("Build: Vite client build succeeds", async () => {
  const cmd = new Deno.Command("npx", {
    args: ["vite", "build", "client", "--outDir", "dist"],
    cwd: Deno.cwd(),
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stdout, stderr } = await cmd.output();
  const out = new TextDecoder().decode(stdout);
  const err = new TextDecoder().decode(stderr);

  assertEquals(code, 0, `Build failed with stderr: ${err}`);
  assert(out.includes("built in") || out.includes("✓"), `Build output should confirm success: ${out}`);
});

Deno.test("Build: output files exist after build", async () => {
  const checkFile = async (path) => {
    try {
      const stat = await Deno.stat(path);
      return stat.isFile;
    } catch {
      return false;
    }
  };

  assert(await checkFile("client/dist/assets/index.js"), "Built JS should exist");
  assert(await checkFile("client/dist/assets/index.css"), "Built CSS should exist");
  assert(await checkFile("client/dist/index.html"), "Built HTML should exist");
});
