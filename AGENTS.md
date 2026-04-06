# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
Andrea Futuri's portfolio site — a Deno SSR + Preact framework ("Singularity") with Vite for client-side dev tooling. See `README.md` and `docs/` for framework details.

### Services

| Service | Command | Port | Notes |
|---|---|---|---|
| Deno SSR Server | `npm run dev-server` | 8000 | Requires Deno 2.x on PATH |
| Vite Dev Server | `npm run dev-client` | 3456 | HMR for client JSX |
| Both (dev) | `npm start` | 8000 + 3456 | Runs `npm install` then starts both via `scripts/start-dev.mjs` |

### Non-obvious caveats

- **Deno must be installed separately** — it is not an npm dependency. Install via `curl -fsSL https://deno.land/install.sh | sh` and ensure `~/.deno/bin` is on PATH.
- **No lockfile committed** — `npm install` generates `package-lock.json` locally but it is not tracked. `npm install` is idempotent and safe to re-run.
- **`--unstable` flag warning** — Deno 2.x prints a warning about `--unstable` being removed; this is cosmetic and does not affect operation.
- **No lint/test tooling configured** — the project has no ESLint, Prettier, or test runner set up. `npm run build` (Vite build) is the closest check for client code correctness.
- **Build output** — `npm run build` outputs to `client/dist/`. This directory is not committed.
- **Deno dependencies are URL imports** — pulled from `esm.sh` and `deno.land/std` at runtime, not from npm. See `server/importMap.json`.
