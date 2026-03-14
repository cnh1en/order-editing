#!/bin/bash
# ============================================================
# LOCAL DEVELOPMENT ONLY — used by `shopify app dev` via shopify.web.toml
# Do NOT use this script in production.
# ============================================================

BACKEND_DIR="$(cd "$(dirname "$0")/../../order-editing-api" && pwd)"

cd "$BACKEND_DIR"
php artisan serve --port="${BACKEND_PORT:-8000}"
