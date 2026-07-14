#!/usr/bin/env bash
# Reads PROBE_MNEMONIC from the local (gitignored) .env and pushes it into the
# Railway `worker` service's encrypted variable store over stdin. The secret is
# never printed, never passed as an argument, and never leaves this machine
# except into Railway's encrypted store. Run from the repo root:
#   bash scripts/set-worker-mnemonic.sh
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "error: .env not found in $(pwd)" >&2
  exit 1
fi

value="$(awk -F= '/^PROBE_MNEMONIC=/{sub(/^PROBE_MNEMONIC=/,"");gsub(/^"|"$/,"");print; exit}' .env)"

if [ -z "${value:-}" ]; then
  echo "error: PROBE_MNEMONIC not found in .env" >&2
  exit 1
fi

printf '%s' "$value" | railway variables --service worker --skip-deploys --set-from-stdin PROBE_MNEMONIC

echo "PROBE_MNEMONIC set on Railway worker service."
