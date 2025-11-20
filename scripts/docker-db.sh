#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${POSTGRES_ENV_FILE:-${ROOT_DIR}/env.local}"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck source=/dev/null
  set -a
  source "${ENV_FILE}"
  set +a
fi

COMMAND="${1:-help}"
CONTAINER_NAME="${POSTGRES_CONTAINER:-postgres-local}"
IMAGE="${POSTGRES_IMAGE:-postgres:15}"
PORT="${POSTGRES_PORT:-5432}"
DATA_VOLUME="${POSTGRES_DATA_VOLUME:-pgdata}"
DB_USER="${POSTGRES_USER:-admin}"
DB_PASSWORD="${POSTGRES_PASSWORD:-changeme}"
DB_NAME="${POSTGRES_DB:-grodt}"

print_help() {
  cat <<-EOT
Usage: scripts/docker-db.sh <command>

Commands:
  start    Create (if needed) and start the Postgres container
  stop     Stop the running Postgres container
  status   Show the container's current status
  logs     Tail the container logs

Environment overrides:
  POSTGRES_CONTAINER  (default: postgres-local)
  POSTGRES_IMAGE      (default: postgres:15)
  POSTGRES_PORT       (default: 5432)
  POSTGRES_DATA_VOLUME(default: pgdata)
  POSTGRES_USER       (default: admin)
  POSTGRES_PASSWORD   (default: changeme)
  POSTGRES_DB         (default: grodt)
  POSTGRES_ENV_FILE   (default: ./env.local)
EOT
}

container_exists() {
  docker ps -a --format '{{.Names}}' | grep -w "${CONTAINER_NAME}" >/dev/null 2>&1
}

container_running() {
  docker ps --format '{{.Names}}' | grep -w "${CONTAINER_NAME}" >/dev/null 2>&1
}

start_container() {
  if container_running; then
    echo "Container ${CONTAINER_NAME} is already running."
    return
  fi

  if container_exists; then
    echo "Starting existing container ${CONTAINER_NAME}..."
    docker start "${CONTAINER_NAME}"
  else
    echo "Creating and starting container ${CONTAINER_NAME}..."
    if [[ "${DB_PASSWORD}" == "changeme" ]]; then
      echo "Warning: POSTGRES_PASSWORD is using the default placeholder. Override it before starting in production." >&2
    fi

    docker run -d \
      --name "${CONTAINER_NAME}" \
      -e POSTGRES_USER="${DB_USER}" \
      -e POSTGRES_PASSWORD="${DB_PASSWORD}" \
      -e POSTGRES_DB="${DB_NAME}" \
      -p "${PORT}:5432" \
      -v "${DATA_VOLUME}:/var/lib/postgresql/data" \
      "${IMAGE}"
  fi
}

stop_container() {
  if container_running; then
    echo "Stopping container ${CONTAINER_NAME}..."
    docker stop "${CONTAINER_NAME}"
  else
    echo "Container ${CONTAINER_NAME} is not running."
  fi
}

status_container() {
  docker ps -a --filter "name=${CONTAINER_NAME}"
}

logs_container() {
  if container_exists; then
    docker logs -f "${CONTAINER_NAME}"
  else
    echo "Container ${CONTAINER_NAME} does not exist yet."
  fi
}

case "${COMMAND}" in
  start)
    start_container
    ;;
  stop)
    stop_container
    ;;
  status)
    status_container
    ;;
  logs)
    logs_container
    ;;
  help|*)
    print_help
    ;;
esac
