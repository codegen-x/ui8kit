#!/usr/bin/env bash
# The magazine reuses Discovery's snapshots only while the two apps ship the same document CSS (the snapshot cache key hashes it).
# Build both and compare the main stylesheet byte for byte: `bun run css-parity` (from apps/magazine).
set -euo pipefail
cd "$(dirname "$0")/.."
bun run build >/dev/null
bun run --cwd ../discovery build >/dev/null
a=$(sha256sum dist/assets/index-*.css | cut -d' ' -f1)
b=$(sha256sum ../discovery/dist/assets/index-*.css | cut -d' ' -f1)
if [ "$a" = "$b" ]; then echo "css parity ok ($a)"; else echo "css parity FAILED: magazine $a, discovery $b" >&2; exit 1; fi
