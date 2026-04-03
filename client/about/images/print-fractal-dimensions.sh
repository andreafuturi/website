#!/usr/bin/env bash
# Prints pixel width/height of fractal.webp for pasting into about.jsx (macOS sips) 📐
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
F="$DIR/fractal.webp"
if [[ ! -f "$F" ]]; then
  echo "Missing $F — add the asset, then re-run." >&2
  exit 1
fi
W=$(sips -g pixelWidth "$F" 2>/dev/null | awk '/pixelWidth/ {print $2}')
H=$(sips -g pixelHeight "$F" 2>/dev/null | awk '/pixelHeight/ {print $2}')
if [[ -z "$W" || -z "$H" ]]; then
  echo "Could not read dimensions (sips). Try: identify -format '%w %h' \"$F\"" >&2
  exit 1
fi
echo "File: $W $H"
WH=$((W / 2))
HH=$((H / 2))
echo ""
echo "Paste into client/about/about.jsx (½ file px — matches about.jsx convention):"
echo "const ABOUT_FRACTAL_WIDTH = $WH;"
echo "const ABOUT_FRACTAL_HEIGHT = $HH;"
