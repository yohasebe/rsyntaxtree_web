#!/usr/bin/env bash
# Checks every platform of a pushed image index with verify_image.sh.
#
#   check_candidate.sh <repository> <index-digest> <context-dir>
#
# Each platform's own manifest is pulled by digest, so what is checked is the
# very image the index points at, not a rebuild of it. Attestation entries,
# which carry no platform, are skipped. Exit status 0 when every platform
# passes, 1 otherwise.
set -euo pipefail

repo=$1
digest=$2
context=$3
here=$(cd "$(dirname "$0")" && pwd)

index=$(docker buildx imagetools inspect "$repo@$digest" --format '{{json .Manifest}}')
platforms=$(jq -r '.manifests[] | select(.platform.architecture != "unknown")
                   | "\(.platform.os)/\(.platform.architecture) \(.digest)"' <<<"$index")
[ -n "$platforms" ] || { echo "check_candidate: no platforms in $repo@$digest" >&2; exit 1; }

while read -r platform manifest; do
  ref="$repo@$manifest"
  echo "check_candidate: $platform $manifest"
  docker pull -q --platform "$platform" "$ref" >/dev/null
  got=$(docker image inspect --format '{{.Os}}/{{.Architecture}}' "$ref")
  [ "$got" = "$platform" ] || { echo "check_candidate: pulled $got for $platform" >&2; exit 1; }
  "$here/verify_image.sh" "$ref" "$context"
  docker image rm "$ref" >/dev/null
done <<<"$platforms"
