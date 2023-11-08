#!/bin/bash

while true; do
  if pgrep -x "node" > /dev/null; then
    echo "Node is running."
  else
    echo "Node is not running. Starting node main.js..."
    node main.js &
  fi
  sleep 5
done
