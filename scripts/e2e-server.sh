#!/usr/bin/env bash
# Script to build once and keep preview server running for faster e2e tests
# Usage: ./scripts/e2e-server.sh

set -e

echo "Building application (this will be cached for subsequent runs)..."
bun run build

echo "Starting preview server on port 4173..."
echo "You can now run 'bun run test:e2e' in another terminal"
echo "The tests will reuse this server instead of rebuilding"
echo ""
bun run preview -- --host
