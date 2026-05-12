#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "▶ Starting PostgreSQL container…"
docker compose up -d db
docker compose exec db sh -c 'until pg_isready -U bigdil; do sleep 1; done' >/dev/null 2>&1

# Auto-init if schema has never been pushed
TABLE_COUNT=$(docker compose exec db psql -U bigdil -d bigdil -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'" 2>/dev/null || echo "0")
if [ "$TABLE_COUNT" -lt 1 ]; then
  echo "⚠ No tables found — running init-schema.sh first…"
  bash ./init-schema.sh
fi

echo "▶ Ensuring dependencies installed (single pass)…"
pnpm install --silent

echo "▶ Starting API + Web with live reload…"
exec pnpm dev
