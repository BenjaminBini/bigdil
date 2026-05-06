#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "▶ Starting PostgreSQL container…"
docker compose up -d db
echo "  Waiting for healthy status…"
docker compose exec db sh -c 'until pg_isready -U bigdil; do sleep 1; done' >/dev/null 2>&1

echo "▶ Generating Prisma client & building DB package…"
pnpm --filter @bigdil/db build

echo "▶ Pushing schema to database…"
pnpm --filter @bigdil/db db:push

echo "▶ Seeding database…"
pnpm --filter @bigdil/db db:seed

echo "✔ Database ready — $(docker compose exec db psql -U bigdil -d bigdil -tAc 'SELECT count(*) FROM information_schema.tables WHERE table_schema='\''public'\''') tables created"
