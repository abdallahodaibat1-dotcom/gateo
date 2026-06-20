#!/bin/bash
export DISPLAY=:99
PROFILE="/tmp/chrome-vnc-profile-apply"
mkdir -p "$PROFILE"

nohup google-chrome \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --window-size=1280,720 \
  --window-position=0,0 \
  --user-data-dir="$PROFILE" \
  --ozone-platform=x11 \
  --no-first-run \
  --no-default-browser-check \
  http://localhost:3000/business/apply > /tmp/chrome-vnc.log 2>&1 &

echo $! > /tmp/chrome-vnc.pid
echo "started chrome with PID $!"
