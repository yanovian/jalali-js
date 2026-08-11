#!/usr/bin/env bash
# Trigger pages.yml on master and wait until that run finishes.
# Used by pr-playground.yml after it updates the pages-previews branch.
set -euo pipefail

if [ -z "${GH_TOKEN:-}${GITHUB_TOKEN:-}" ]; then
  echo "GH_TOKEN or GITHUB_TOKEN is required." >&2
  exit 1
fi
export GH_TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"

START_EPOCH=$(date -u +%s)

gh workflow run pages.yml --ref master

for _ in $(seq 1 60); do
  RUN_ID=$(
    gh run list --workflow=pages.yml --event=workflow_dispatch --limit 10 \
      --json databaseId,createdAt,status \
      --jq --argjson start "$START_EPOCH" '
        [.[] | select((.createdAt | fromdateiso8601) >= $start)] |
        sort_by(.createdAt) | reverse | .[0].databaseId // empty
      '
  )
  if [ -n "$RUN_ID" ]; then
    echo "Watching pages.yml run $RUN_ID"
    gh run watch "$RUN_ID" --exit-status
    exit 0
  fi
  sleep 2
done

echo "Timed out waiting for pages.yml to start." >&2
exit 1
