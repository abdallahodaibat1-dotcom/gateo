#!/bin/bash
# Kill old chrome-apply processes
ps aux | grep "chrome-vnc-profile-apply" | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null
sleep 2

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
  --remote-debugging-port=9222 \
  http://localhost:3000/business/apply > /tmp/chrome-vnc.log 2>&1 &

echo $! > /tmp/chrome-vnc.pid
echo "started chrome with CDP on PID $!"
sleep 4
# Verify CDP is listening
curl -s http://localhost:9222/json/version 2>/dev/null | head -c 200 || echo "CDP not ready yet"
