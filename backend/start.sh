#!/bin/bash
# ============================================================
# LOCAL DEVELOPMENT ONLY — used by `shopify app dev` via shopify.web.toml
# Do NOT use this script in production.
# ============================================================
# Shopify CLI injects: BACKEND_PORT, SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SCOPES, HOST
# This script syncs those values into Backend's .env file, then boots artisan.

BACKEND_DIR="$(cd "$(dirname "$0")/../../order-editing-api" && pwd)"
ENV_FILE="$BACKEND_DIR/.env"

# Create .env from .example if it doesn't exist yet
if [ ! -f "$ENV_FILE" ]; then
  cp "$BACKEND_DIR/.env.example" "$ENV_FILE" 2>/dev/null || touch "$ENV_FILE"
fi

# Upsert a key=value into .env: overwrite if exists, append if not
upsert() {
  local key="$1" value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

upsert "SHOPIFY_API_KEY" "${SHOPIFY_API_KEY}"
upsert "SHOPIFY_API_SECRET" "${SHOPIFY_API_SECRET}"
upsert "SCOPES" "${SCOPES}"
upsert "APP_URL" "${SHOPIFY_APP_URL:-$HOST}"
upsert "APP_PORT" "${BACKEND_PORT:-8000}"

cd "$BACKEND_DIR"
php artisan serve --port="${BACKEND_PORT:-8000}"
