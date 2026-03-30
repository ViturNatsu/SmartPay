#!/bin/bash

# Logs runner lifecycle events plus memory, process, and disk diagnostics so
# Cloud Run job logs show why the ephemeral runner started, stalled, or exited.

MAILHOG_PID=""
RUNNER_EXIT_CODE=0

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() {
  echo "[$(timestamp)] $*"
}

dump_memory_stats() {
  log "Memory diagnostics begin"

  if [[ -r /sys/fs/cgroup/memory.current ]]; then
    log "cgroup memory.current=$(cat /sys/fs/cgroup/memory.current)"
  fi

  if [[ -r /sys/fs/cgroup/memory.max ]]; then
    log "cgroup memory.max=$(cat /sys/fs/cgroup/memory.max)"
  fi

  if command -v free >/dev/null 2>&1; then
    free -h
  elif [[ -r /proc/meminfo ]]; then
    grep -E "MemTotal|MemFree|MemAvailable|SwapTotal|SwapFree" /proc/meminfo || true
  fi

  log "Memory diagnostics end"
}

dump_process_stats() {
  log "Top processes by memory usage"
  ps aux --sort=-%mem | head -n 15 || true
}

dump_disk_stats() {
  log "Disk diagnostics"
  df -h || true
}

dump_diagnostics() {
  dump_memory_stats
  dump_process_stats
  dump_disk_stats
}

cleanup() {
  local exit_code=$?

  if [[ ${RUNNER_EXIT_CODE:-0} -ne 0 ]]; then
    log "Runner exited with non-zero status: ${RUNNER_EXIT_CODE}"
  fi

  log "Entrypoint exiting with code: ${exit_code}"
  dump_diagnostics

  log "Unregistering runner..."
  gitlab-runner unregister --all-runners || true

  if [[ -n "${MAILHOG_PID}" ]]; then
    log "Stopping MailHog (pid=${MAILHOG_PID})"
    kill "${MAILHOG_PID}" 2>/dev/null || true
  fi

  local background_pids
  background_pids=$(jobs -p) || true
  if [[ -n "${background_pids}" ]]; then
    log "Stopping background jobs: ${background_pids}"
    kill -9 ${background_pids} 2>/dev/null || true
  fi
}

handle_error() {
  local exit_code=$?
  log "Command failed with exit code ${exit_code} at line ${BASH_LINENO[0]}"
  dump_diagnostics
  return "${exit_code}"
}
