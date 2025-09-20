#!/usr/bin/env bash
set -euo pipefail

FILE_PATH="${1:-}"

# Ensure we're in a git repo
if ! REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null); then
  exit 0
fi
cd "$REPO_ROOT"

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
  exit 0
fi

# Stage all changes
git add -A >/dev/null 2>&1 || true

# Build commit message
REL="multiple-files"
if [ -n "$FILE_PATH" ]; then
  if RELTMP=$(realpath --relative-to="$REPO_ROOT" "$FILE_PATH" 2>/dev/null); then
    REL="$RELTMP"
  else
    REL="$FILE_PATH"
  fi
fi

TS=$(date '+%Y-%m-%d %H:%M:%S')
MSG="chore(auto): auto-commit on save: $REL @ $TS"

# Commit (post-commit hook handles push)
git commit -m "$MSG" >/dev/null 2>&1 || true

exit 0

