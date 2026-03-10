#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Building frontend..."
cd "$DIR" && npx vite build

echo "Starting production server (port ${PORT:-3001})..."
cd "$DIR/server" && npm run start
