# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is Andrea Futuri's personal website, built with a custom SSR framework ("Singularity") using **Deno** (server) + **Vite** + **Preact** (client). It is a single application (not a monorepo).

### Services

| Service | Port | Command | Purpose |
|---------|------|---------|---------|
| Deno SSR server | 8000 | `npm run dev-server` | Server-side rendering, HTTP server, static file serving |
| Vite dev server | 3456 | `npm run dev-client` | Client-side HMR, JS/CSS bundling during development |
| Both together | 8000+3456 | `npm start` | Runs both in parallel (also runs `npm install` first) |

### Key dev commands

See `package.json` `scripts` section for all commands. Key ones:
- **Dev**: `npm start` (installs deps + starts both servers)
- **Build**: `npm run build` (Vite production build to `client/dist/`)
- **No lint/test config** exists in this project

### Network dependencies (critical for Cloud Agents)

The Deno server imports all dependencies from CDN URLs at runtime:
- `esm.sh` — Preact, preact-render-to-string, lightweight-router, svg-path-commander, mini-svg-data-uri
- `deno.land` — Deno std library (flags, http/file_server), refresh middleware
- `cdn.skypack.dev` — react-spring

These domains **must be in the network egress allowlist** for the Deno SSR server to start. Without them, only the Vite client dev server (port 3456) will function.

### Architecture notes

- In dev mode, the Deno server (port 8000) renders full HTML via SSR and injects a `<script>` tag pointing to `localhost:3456/main.jsx` for Vite HMR
- The Vite dev server (port 3456) alone only serves a minimal HTML shell — the actual page content comes from Deno SSR
- JSX is compiled server-side by Deno's built-in JSX support (configured in `server/deno.json`) and client-side by Vite's `@preact/preset-vite`
- No database, no external API keys, no environment variables required
