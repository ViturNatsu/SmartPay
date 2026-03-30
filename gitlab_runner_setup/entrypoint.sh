#!/bin/bash
set -Eeuo pipefail

source /runner/logging.sh

trap cleanup EXIT
trap 'handle_error' ERR

log "Runner entrypoint starting"
dump_diagnostics

log "Starting MailHog..."
mailhog > /dev/null 2>&1 &
MAILHOG_PID=$!
log "MailHog started with pid=${MAILHOG_PID}"

log "Registering runner..."

export GITLAB_RUNNER_DISABLE_SSL_CERT_CA_VERIFICATION=true
export FF_USE_ADAPTIVE_REQUEST_CONCURRENCY=true

gitlab-runner register \
  --non-interactive \
  --url "$GITLAB_URL" \
  --token "$RUNNER_TOKEN" \
  --executor "shell" \
  --description "cloud-run-runner"

log "Runner registration succeeded"
log "Starting runner with wait-timeout=${TIMEOUT} max-builds=${MAX_BUILDS}"

set +e
gitlab-runner run-single \
  --url "$GITLAB_URL" \
  --token "$RUNNER_TOKEN" \
  --executor "shell" \
  --wait-timeout "$TIMEOUT" \
  --max-builds "$MAX_BUILDS"
RUNNER_EXIT_CODE=$?
set -e

log "Runner finished with exit code ${RUNNER_EXIT_CODE}"

if [[ ${RUNNER_EXIT_CODE} -ne 0 ]]; then
  exit "${RUNNER_EXIT_CODE}"
fi
