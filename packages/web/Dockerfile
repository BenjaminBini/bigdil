FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/db/package.json packages/db/
COPY packages/db/prisma.config.ts packages/db/
COPY packages/db/prisma/ packages/db/prisma/
COPY packages/web/package.json packages/web/

# Install dependencies (postinstall runs prisma generate)
RUN pnpm install --frozen-lockfile

# Copy source
COPY tsconfig.base.json ./
COPY packages/db/ packages/db/
COPY packages/web/ packages/web/

# Build db types first
RUN pnpm --filter @bigdil/db build

# Build web
RUN pnpm --filter web build

# Serve with a simple static server
FROM node:22-slim
RUN npm install -g serve
COPY --from=base /app/packages/web/dist /app/dist
EXPOSE 5173
CMD ["serve", "-s", "/app/dist", "-l", "5173"]
