#!/bin/sh
# Map2Lap: starts the local generator page (http://localhost:8800) and opens it in the browser.
# Uses the bundled Python of the release archive, else the development venv, else an installed Python.
# An update the page downloaded (update/Map2Lap, then update/ready: src/app/updater.py) goes in here, while no Python
# holds the files: the server ends with exit code 75 for it, and this starts it again (without a new browser tab).
# Each folder of the new release replaces the old one; settings.json, cache and out aren't in it and stay. This file
# is replaced by a rename: the shell reads a running script as it goes, and keeps reading the old one that way.
cd "$(dirname "$0")" || exit 1
ARGS=
while :; do
  if [ -f update/ready ]; then
    echo "Installing the update ..."
    rm -f update/ready
    for d in update/Map2Lap/*/; do
      n=$(basename "$d")
      rm -rf "$n" && cp -a "$d" "$n"
    done
    for f in update/Map2Lap/*; do
      [ -f "$f" ] && [ "$(basename "$f")" != start.sh ] && cp -a "$f" .
    done
    cp -a update/Map2Lap/start.sh start.sh.new && mv -f start.sh.new start.sh
    rm -rf update
  fi
  if [ -x python/bin/python3 ]; then
    python/bin/python3 src/server.py $ARGS
  elif [ -x .venv/bin/python ]; then
    .venv/bin/python src/server.py $ARGS
  else
    python3 src/server.py $ARGS
  fi
  code=$?
  [ "$code" = 75 ] || break
  ARGS=--no-browser
done
# (started from Map2Lap.desktop the terminal closes with the script: an error stays readable until Enter)
if [ "$code" != 0 ] && [ "$code" != 130 ]; then
  printf "\nMap2Lap ended with exit code %s. Press Enter to close." "$code"
  read -r _
fi
