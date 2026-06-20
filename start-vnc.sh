#!/bin/bash
# Start window manager
DISPLAY=:99 nohup openbox > /tmp/openbox.log 2>&1 &
echo $! > /tmp/openbox.pid
sleep 1

# Start websockify/noVNC
nohup websockify --web=/usr/share/novnc/ --cert=none 6080 localhost:5999 > /tmp/websockify.log 2>&1 &
echo $! > /tmp/websockify.pid
sleep 2

# Check status
echo "=== Status ==="
lsof -i :6080 2>/dev/null | grep LISTEN && echo "websockify running on 6080" || echo "websockify NOT running"
lsof -i :5999 2>/dev/null | grep LISTEN && echo "vnc running on 5999" || echo "vnc NOT running"
