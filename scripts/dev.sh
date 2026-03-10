#!/usr/bin/env bash
set -e

cleanup() {
  echo ""
  echo "Shutting down..."
  kill 0 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting Hono server (port 3001)..."
cd "$DIR/server" && npm run dev &

echo "Starting Vite dev server (port 3000)..."
cd "$DIR" && npx vite &

wait
