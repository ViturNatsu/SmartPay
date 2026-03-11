#!/bin/bash
set -e

echo "Starting Mailhog..."
mailhog > /dev/null 2>&1 &

echo "Registering runner..."

export GITLAB_RUNNER_DISABLE_SSL_CERT_CA_VERIFICATION=true
export FF_USE_ADAPTIVE_REQUEST_CONCURRENCY=true

gitlab-runner register \
  --non-interactive \
  --url "$GITLAB_URL" \
  --token "$RUNNER_TOKEN" \
  --executor "shell" \
  --description "cloud-run-runner"

echo "Starting runner..."

gitlab-runner run-single \
  --url "$GITLAB_URL" \
  --token "$RUNNER_TOKEN" \
  --executor "shell" \
  --wait-timeout 20 \
  --max-builds 5

echo "Runner finished."

echo "Unregistering runner..."
gitlab-runner unregister --all-runners

kill -9 $(jobs -p) 2>/dev/null || true