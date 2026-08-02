# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM deps AS build

ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/essayer_build

COPY nest-cli.json prisma.config.ts tsconfig.build.json tsconfig.json ./
COPY src ./src

RUN pnpm prisma generate
RUN pnpm build
RUN pnpm prune --prod

FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates tini \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --create-home appuser

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER appuser

EXPOSE 3001

ENTRYPOINT ["tini", "--"]

CMD ["node", "dist/src/main.js"]
