FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/db/package.json packages/db/
COPY packages/db/prisma.config.ts packages/db/
COPY packages/db/prisma/ packages/db/prisma/
COPY packages/api/package.json packages/api/

# Install dependencies (postinstall runs prisma generate)
RUN pnpm install --frozen-lockfile

# Copy source
COPY tsconfig.base.json ./
COPY packages/db/ packages/db/
COPY packages/api/ packages/api/

# Build
RUN pnpm --filter @bigdil/db build
RUN pnpm --filter @bigdil/api build

COPY packages/api/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
CMD ["/app/entrypoint.sh"]
