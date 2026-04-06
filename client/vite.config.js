import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

/** Keeps Vite’s default “Local:” lines from looking like the app URL (Deno serves the app on :8000). */
const clarifyViteRole = () => ({
  name: "clarify-vite-role",
  configureServer(server) {
    return () => {
      server.httpServer?.once("listening", () => {
        console.log(
          "  [Vite] HMR on :3456 — browse the app at http://localhost:8000/",
        );
      });
    };
  },
});

export default defineConfig({
  logLevel: "warn",
  plugins: [preact(), clarifyViteRole()],
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  server: {
    port: 3456,
  },
});
