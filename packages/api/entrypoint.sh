#!/bin/sh
set -e

# Push schema to database (idempotent — safe to run on every boot)
echo "Pushing database schema..."
pnpm --filter @bigdil/db db:push -- --accept-data-loss

# Seed only if the database is empty
if pnpm --filter @bigdil/db exec tsx src/check-empty.ts; then
  echo "Database is empty, seeding..."
  pnpm --filter @bigdil/db db:seed
  echo "Seeding complete."
else
  echo "Database already has data, skipping seed."
fi

# Start the API server
echo "Starting API server..."
exec node packages/api/dist/index.js
