#!/usr/bin/env bash
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2026 Alan Johnson

set -euo pipefail

MODULE_ID="soul-blade-warlock-patron"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${1:-${ROOT}/dist/${MODULE_ID}.zip}"

command -v zip >/dev/null 2>&1 || {
  echo "ERROR: zip is required to package ${MODULE_ID}." >&2
  exit 1
}

command -v unzip >/dev/null 2>&1 || {
  echo "ERROR: unzip is required to validate ${MODULE_ID}." >&2
  exit 1
}

[[ -f "${ROOT}/module.json" ]] || {
  echo "ERROR: ${ROOT}/module.json was not found." >&2
  exit 1
}

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

PACKAGE_ROOT="${STAGE}/${MODULE_ID}"
mkdir -p "$PACKAGE_ROOT" "$(dirname "$OUT")"

copy_if_present() {
  local path="$1"
  if [[ -e "${ROOT}/${path}" ]]; then
    cp -a "${ROOT}/${path}" "$PACKAGE_ROOT/"
  fi
}

# Runtime and distributable content only.
copy_if_present module.json
copy_if_present packs
copy_if_present source
copy_if_present scripts
copy_if_present README.md
copy_if_present CHANGELOG.md
copy_if_present CLEANCOPY.md
copy_if_present LICENSE
copy_if_present CONTENT-LICENSE.md
copy_if_present NOTICE.md

# Shell scripts are release/build tooling, not Foundry runtime files.
if [[ -d "${PACKAGE_ROOT}/scripts" ]]; then
  find "${PACKAGE_ROOT}/scripts" -type f -name '*.sh' -delete
fi

# Defensive cleanup in case a development artifact was copied.
find "$PACKAGE_ROOT" \
  \( -name '.git' -o -name '.github' -o -name 'dist' -o -name 'node_modules' \) \
  -type d -prune -exec rm -rf {} +

find "$PACKAGE_ROOT" \
  \( -name '*.bak.*' -o -name '*.zip' -o -name 'apply_*.sh' -o -name '.DS_Store' \) \
  -type f -delete

rm -f "$OUT"

(
  cd "$STAGE"
  zip -q -r "$OUT" "$MODULE_ID"
)

unzip -t "$OUT" >/dev/null

if ! unzip -Z1 "$OUT" | grep -qx "${MODULE_ID}/module.json"; then
  echo "ERROR: Packaged archive does not contain ${MODULE_ID}/module.json." >&2
  exit 1
fi

if unzip -Z1 "$OUT" | grep -E '(^|/)(\.git|\.github|dist|node_modules)(/|$)|\.bak\.|apply_.*\.sh$' >/dev/null; then
  echo "ERROR: Development-only files were found in the release archive." >&2
  unzip -Z1 "$OUT" | grep -E '(^|/)(\.git|\.github|dist|node_modules)(/|$)|\.bak\.|apply_.*\.sh$' >&2 || true
  exit 1
fi

echo "Created $OUT"
