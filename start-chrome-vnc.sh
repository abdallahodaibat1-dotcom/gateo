#!/bin/bash
export DISPLAY=:99
# Use a completely isolated profile
PROFILE="/tmp/chrome-vnc-profile-$$"
mkdir -p "$PROFILE"

# Launch Chrome with explicit X11 and isolated profile
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
  http://localhost:3000/create-post > /tmp/chrome-vnc.log 2>&1 &

echo $! > /tmp/chrome-vnc.pid
sleep 4

# Check if Chrome window opened on VNC
xwininfo -root -tree -display :99 2>/dev/null | grep -i chrome | head -5 || echo "no chrome window found via xwininfo"
ps aux | grep "chrome.*$PROFILE" | grep -v grep | head -3 || echo "chrome process not found"
