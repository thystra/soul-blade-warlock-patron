#!/usr/bin/env bash
# SPDX-License-Identifier: GPL-3.0-or-later
# Copyright (C) 2026 Alan Johnson / Thystra

set -euo pipefail

API_URL="https://foundrymods.com/api/public/v1/packages/release_version"
DRY_RUN="true"
MANIFEST_URL=""
PACKAGE_URL=""
NOTES_URL=""
CHANGELOG_FILE=""
SYNC_DESCRIPTION="true"

usage() {
  cat <<'EOF_USAGE'
Usage:
  scripts/publish-foundrymods.sh --manifest-url URL [options]

Options:
  --manifest-url URL       Version-specific or commit-specific module.json URL.
                           Required.
  --package-url URL        Version-specific GitHub release ZIP URL.
  --notes-url URL          GitHub release notes URL.
  --changelog-file PATH    Markdown changelog body to send inline.
  --dry-run true|false     Validate only when true. Default: true.
  --sync-description true|false
                           Sync the FoundryMods description from README.md.
                           Default: true.
  -h, --help               Show this help.

Environment:
  FOUNDRYMODS_TOKEN        Per-module fmp_... release token from FoundryMods.

When release.manifest is supplied, FoundryMods derives the package id, version,
and Foundry compatibility from module.json. This script therefore does not send
duplicate explicit values that could disagree with the manifest.
EOF_USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --manifest-url)
      MANIFEST_URL="${2:-}"
      shift 2
      ;;
    --package-url)
      PACKAGE_URL="${2:-}"
      shift 2
      ;;
    --notes-url)
      NOTES_URL="${2:-}"
      shift 2
      ;;
    --changelog-file)
      CHANGELOG_FILE="${2:-}"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="${2:-}"
      shift 2
      ;;
    --sync-description)
      SYNC_DESCRIPTION="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "ERROR: Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

[[ -n "${FOUNDRYMODS_TOKEN:-}" ]] || {
  echo "ERROR: FOUNDRYMODS_TOKEN is not set." >&2
  exit 2
}

[[ -n "$MANIFEST_URL" ]] || {
  echo "ERROR: --manifest-url is required." >&2
  exit 2
}

[[ "$DRY_RUN" == "true" || "$DRY_RUN" == "false" ]] || {
  echo "ERROR: --dry-run must be true or false." >&2
  exit 2
}

[[ "$SYNC_DESCRIPTION" == "true" || "$SYNC_DESCRIPTION" == "false" ]] || {
  echo "ERROR: --sync-description must be true or false." >&2
  exit 2
}

if [[ -n "$CHANGELOG_FILE" && ! -f "$CHANGELOG_FILE" ]]; then
  echo "ERROR: Changelog file not found: $CHANGELOG_FILE" >&2
  exit 2
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

MANIFEST_FILE="${TMP_DIR}/module.json"
PAYLOAD_FILE="${TMP_DIR}/payload.json"
RESPONSE_FILE="${TMP_DIR}/response.json"

echo "Checking manifest URL..."
MANIFEST_HTTP_CODE="$(curl -L -sS -o "$MANIFEST_FILE" -w '%{http_code}' "$MANIFEST_URL" || true)"
if [[ "$MANIFEST_HTTP_CODE" != "200" ]]; then
  echo "ERROR: Manifest URL returned HTTP $MANIFEST_HTTP_CODE." >&2
  echo "URL: $MANIFEST_URL" >&2
  exit 22
fi

python3 -m json.tool "$MANIFEST_FILE" >/dev/null

MANIFEST_ID="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["id"])' "$MANIFEST_FILE")"
MANIFEST_TITLE="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["title"])' "$MANIFEST_FILE")"
MANIFEST_VERSION="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["version"])' "$MANIFEST_FILE")"

if [[ -n "$PACKAGE_URL" ]]; then
  echo "Checking package URL..."
  PACKAGE_HTTP_CODE="$(curl -L -sS -o /dev/null -w '%{http_code}' "$PACKAGE_URL" || true)"
  if [[ "$PACKAGE_HTTP_CODE" != "200" ]]; then
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "WARNING: Package URL returned HTTP $PACKAGE_HTTP_CODE during dry-run." >&2
    else
      echo "ERROR: Package URL returned HTTP $PACKAGE_HTTP_CODE." >&2
      echo "URL: $PACKAGE_URL" >&2
      exit 22
    fi
  fi
fi

export DRY_RUN MANIFEST_URL PACKAGE_URL NOTES_URL CHANGELOG_FILE SYNC_DESCRIPTION PAYLOAD_FILE

python3 <<'PY'
import json
import os

release = {
    "manifest": os.environ["MANIFEST_URL"],
    "foundrymods": {
        "sync_description_from_github":
            os.environ.get("SYNC_DESCRIPTION", "true") == "true"
    },
}

if os.environ.get("PACKAGE_URL"):
    release["package"] = os.environ["PACKAGE_URL"]

if os.environ.get("NOTES_URL"):
    release["notes"] = os.environ["NOTES_URL"]

if os.environ.get("CHANGELOG_FILE"):
    with open(os.environ["CHANGELOG_FILE"], "r", encoding="utf-8") as handle:
        release["changelog"] = handle.read()

payload = {
    "dry-run": os.environ["DRY_RUN"] == "true",
    "release": release,
}

with open(os.environ["PAYLOAD_FILE"], "w", encoding="utf-8") as handle:
    json.dump(payload, handle, indent=2)
    handle.write("\n")
PY

echo "Publishing to FoundryMods release API"
echo "  manifest id:      $MANIFEST_ID"
echo "  manifest title:   $MANIFEST_TITLE"
echo "  manifest version: $MANIFEST_VERSION"
echo "  dry-run:          $DRY_RUN"
echo "  manifest URL:     $MANIFEST_URL"
echo "  package URL:      ${PACKAGE_URL:-<not supplied>}"
echo "  notes URL:        ${NOTES_URL:-<not supplied>}"

HTTP_CODE="$(
  curl -sS \
    -o "$RESPONSE_FILE" \
    -w '%{http_code}' \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: ${FOUNDRYMODS_TOKEN}" \
    --data-binary "@$PAYLOAD_FILE"
)"

cat "$RESPONSE_FILE"
echo

if [[ ! "$HTTP_CODE" =~ ^2 ]]; then
  echo "ERROR: FoundryMods returned HTTP $HTTP_CODE." >&2
  exit 22
fi

python3 - "$RESPONSE_FILE" <<'PY'
import json
import sys

with open(sys.argv[1], "r", encoding="utf-8") as handle:
    data = json.load(handle)

if data.get("status") != "success":
    raise SystemExit("FoundryMods response did not report success.")
PY
