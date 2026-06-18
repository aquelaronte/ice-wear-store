#!/usr/bin/env bash
#
# Build and run all three services in production mode:
#   - main-server  → compiled Go binary
#   - frost-ai     → uvicorn (no reload)
#   - web-client   → static build served by `vite preview`
#
# All services read the centralized root .env. Press Ctrl+C to stop everything.
#
set -eo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env ]; then
  echo "Error: root .env not found. Run 'cp .env.example .env' and configure it." >&2
  exit 1
fi

WEB_CLIENT_PORT="${WEB_CLIENT_PORT:-4173}"

# ── Build ────────────────────────────────────────────────────────────────────
echo "==> [build] main-server (Go binary)..."
( cd main-server && go build -o bin/api ./cmd/api )

echo "==> [build] frost-ai (sync dependencies)..."
( cd frost-ai && uv sync --no-dev )

echo "==> [build] web-client (vite build)..."
( cd web-client && bun install --frozen-lockfile && bun run build )

# ── Run ──────────────────────────────────────────────────────────────────────
pids=""

cleanup() {
  echo ""
  echo "==> Stopping services..."
  for pid in $pids; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo "==> [run] main-server..."
( cd main-server && exec ./bin/api ) &
pids="$pids $!"

echo "==> [run] frost-ai..."
( cd frost-ai && exec uv run main.py ) &
pids="$pids $!"

echo "==> [run] web-client (http://localhost:${WEB_CLIENT_PORT})..."
( cd web-client && exec bun run preview --host --port "${WEB_CLIENT_PORT}" ) &
pids="$pids $!"

echo "==> All services running. Press Ctrl+C to stop."
wait
