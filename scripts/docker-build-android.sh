#!/usr/bin/env bash
set -Eeuo pipefail

SOURCE_DIR="${SOURCE_DIR:-/workspace}"
ARTIFACT_DIR="${ARTIFACT_DIR:-/artifacts}"
ANDROID_TARGET="${TAURI_ANDROID_TARGET:-aarch64}"

mkdir -p "$ARTIFACT_DIR"

# docker-compose mounts the host source over /workspace. Reuse the dependencies
# installed while building the image instead of writing node_modules to the host.
if [[ ! -e "$SOURCE_DIR/node_modules" ]]; then
  ln -s /opt/deps/node_modules "$SOURCE_DIR/node_modules"
fi

cd "$SOURCE_DIR"

if [[ ! -d src-tauri/gen/android ]]; then
  npx tauri android init
fi

npx tauri android build --apk --target "$ANDROID_TARGET"

find src-tauri/gen/android -type f -name '*.apk' -print0 \
  | while IFS= read -r -d '' apk; do
      cp -f "$apk" "$ARTIFACT_DIR/"
    done

if ! find "$ARTIFACT_DIR" -maxdepth 1 -type f -name '*.apk' -print -quit | grep -q .; then
  echo "No APK was produced by Tauri" >&2
  exit 1
fi

echo "APK files copied to $ARTIFACT_DIR"
