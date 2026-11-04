#!/usr/bin/env bash
# Refuses an image whose application directory holds anything the build
# context did not send, lacks anything it did, or carries a secret.
#
#   verify_image.sh <image> <context-dir>
#
# <context-dir> is the build context as Docker itself sees it, after
# .dockerignore: the `build-context` stage of the Dockerfile written out with
# `docker buildx build --target build-context --output type=local,dest=<dir> .`.
# Asking Docker for that list, rather than reading .dockerignore here, keeps
# one copy of the rules.
#
# Exit status 0 when the image passes, 1 when it does not.
set -euo pipefail

image=$1
context=$2
app=rsyntaxtree # WORKSPACE in the Dockerfile, without the leading slash

# Files the build itself writes into the application directory, by name.
# bundle install creates the lockfile before the context is added, and the
# lockfile is kept out of the context.
built=("Gemfile.lock")

work=$(mktemp -d)
container=""
cleanup() {
  [ -n "$container" ] && docker rm -f "$container" >/dev/null 2>&1 || true
  rm -rf "$work"
}
trap cleanup EXIT

failed=0
fail() {
  echo "verify_image: $*" >&2
  failed=1
}

# The application directory as the image holds it.
container=$(docker create "$image")
mkdir -p "$work/image"
docker export "$container" | tar -x -C "$work/image" "$app"

list() { (cd "$1" && find . \( -type f -o -type l \) | sed 's|^\./||' | LC_ALL=C sort); }

list "$work/image/$app" >"$work/in_image"
{ list "$context"; printf '%s\n' "${built[@]}"; } | LC_ALL=C sort -u >"$work/expected"

# Both ways: nothing extra, nothing missing.
extra=$(LC_ALL=C comm -23 "$work/in_image" "$work/expected")
missing=$(LC_ALL=C comm -13 "$work/in_image" "$work/expected")
[ -z "$extra" ] || fail "in the image but not in the build context:"$'\n'"$extra"
[ -z "$missing" ] || fail "in the build context but not in the image:"$'\n'"$missing"

# Names that never belong in a public image.
private_names='(^|/)(\.env(\..*)?|\.claude|CLAUDE\.md|AGENTS\.md|GEMINI\.md|\.git|\.ssh|id_rsa[^/]*|id_ed25519[^/]*|\.npmrc|\.netrc|google_analytics_id|google_analytics_tracking_code)(/|$)'
named=$(grep -E "$private_names" "$work/in_image" || true)
[ -z "$named" ] || fail "private file names in the image:"$'\n'"$named"

# Contents: secret shapes and paths of someone's machine. Counted, never
# printed, so a match does not end up in the CI log.
secret_shapes='-----BEGIN [A-Z ]*PRIVATE KEY-----|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{40,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,}|sk-[A-Za-z0-9]{32,}|AIza[0-9A-Za-z_-]{35}'
local_paths='/Users/[A-Za-z]|/home/[a-z]'
for kind in secret_shapes local_paths; do
  hits=$(grep -rlIE -- "${!kind}" "$work/image/$app" | sed "s|^$work/image/$app/||" || true)
  [ -z "$hits" ] || fail "$kind found in:"$'\n'"$hits"
done

# The image configuration: environment, labels and the build history.
config=$(docker image inspect --format '{{json .Config.Env}} {{json .Config.Labels}}' "$image")
history=$(docker history --no-trunc --format '{{.CreatedBy}}' "$image")
if printf '%s\n%s\n' "$config" "$history" | grep -qE -- "$secret_shapes"; then
  fail "secret shapes in the image configuration or history"
fi

if [ "$failed" -ne 0 ]; then
  exit 1
fi
echo "verify_image: PASS — $(wc -l <"$work/in_image" | tr -d ' ') files in /$app match the build context; no private names, secrets or local paths"
