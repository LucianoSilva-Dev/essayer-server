#!/usr/bin/env bash
set -euo pipefail

COMPOSE_SERVICES="postgres-test redis-test mailpit-test"
TEST_DB_URL="postgresql://postgres:postgres@localhost:5433/incita_test?schema=public"

cleanup() {
  echo ""
  echo "🧹 Removing test containers..."
  docker compose rm -f -s -v $COMPOSE_SERVICES
}

trap cleanup EXIT

echo "🐳 Starting test containers..."
docker compose up -d --force-recreate $COMPOSE_SERVICES

echo "⏳ Waiting for postgres-test to be ready..."
until docker compose exec -T postgres-test pg_isready > /dev/null 2>&1; do
  sleep 1
done

echo "📦 Applying database migrations..."
DATABASE_URL="$TEST_DB_URL" npx prisma migrate deploy

VITEST_CMD="vitest run --config vitest.e2e.config.ts"
if [[ "${1:-}" == "--watch" ]]; then
  VITEST_CMD="vitest --config vitest.e2e.config.ts"
fi

echo "🧪 Running E2E tests..."
$VITEST_CMD
