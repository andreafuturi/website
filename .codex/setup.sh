#!/usr/bin/env bash
# Codex environment setup
# Pre-fetches all remote Deno URL imports so the agent session works without
# outbound access to esm.sh / deno.land / cdn.skypack.dev — mirrors the same
# strategy used in .github/workflows/copilot-setup-steps.yml for Copilot.

set -euo pipefail

# ── Deno ─────────────────────────────────────────────────────────────────────
if ! command -v deno &>/dev/null; then
  curl -fsSL https://deno.land/install.sh | sh
  export DENO_INSTALL="$HOME/.deno"
  export PATH="$DENO_INSTALL/bin:$PATH"
fi

echo "Deno $(deno --version | head -1)"

# ── npm dependencies ──────────────────────────────────────────────────────────
npm install

# ── Pre-fetch all remote Deno URL imports ─────────────────────────────────────
# This populates ~/.cache/deno so subsequent deno run / deno test calls never
# need to reach esm.sh, deno.land, or cdn.skypack.dev.
deno cache --config server/deno.json server/main.jsx
deno cache --config server/deno.json lib/server-handler.js
deno cache --config server/deno.json tests/build_test.js tests/routing_test.js tests/ssr_test.js

echo "Codex environment ready."
