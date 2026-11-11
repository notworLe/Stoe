#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_DIR="${ROOT_DIR}/frontend"
FRONTEND_PORT="${ROOT_PORT:-3000}"

mkdir -p "${ROOT_DIR}/logs"

(
    cd ${BACKEND_DIR}
    export PYTHONUNBUFFERED=1 
    exec uvicorn main:app --reload --port "${BACKEND_PORT}" 2>&1 \
        | tee "${ROOT_DIR}/logs/backend.log" -a\
        | sed -u 's/^/[BACKEND] /'

) &


(
    cd ${FRONTEND_DIR}
    export FORCE_COLOR=1
    exec npm run dev 2>&1 \
        | tee "${ROOT_DIR}/logs/frontend.log" -a\
        | sed -u 's/^/[FRONTEND] /'
)
