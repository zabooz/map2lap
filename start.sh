#!/bin/sh
# Map2Lap: starts the local generator page (http://localhost:8800) and opens it in the browser.
# Uses the bundled Python of the release archive, else the development venv, else an installed Python.
# An update the page downloaded (update/Map2Lap, then update/ready: src/app/updater.py) goes in here, while no Python
# holds the files: the server ends with exit code 75 for it, and this starts it again (without a new browser tab).
# Each folder of the new release replaces the old one; settings.json, cache and out aren't in it and stay. This file
# is replaced by a rename: the shell reads a running script as it goes, and keeps reading the old one that way.
cd "$(dirname "$0")" || exit 1
# Double-clicked in a file manager, this runs without a terminal: the server would go on hidden, with no window to
# close it by. It opens itself in the first terminal found instead (else it goes on without one).
if [ ! -t 0 ] && [ -z "$MAP2LAP_TERMINAL" ]; then
  export MAP2LAP_TERMINAL=1
  for t in xdg-terminal-exec konsole gnome-terminal kgx xfce4-terminal kitty alacritty foot xterm; do
    command -v "$t" >/dev/null || continue
    case $t in
      xdg-terminal-exec|kitty|foot) exec "$t" "$PWD/start.sh" ;;
      gnome-terminal|kgx) exec "$t" -- "$PWD/start.sh" ;;
      xfce4-terminal) exec "$t" -x "$PWD/start.sh" ;;
      *) exec "$t" -e "$PWD/start.sh" ;;
    esac
  done
fi
ARGS=
update_failed() {
  printf '\nUpdate failed. Close programs using Map2Lap files, check disk space and permissions, then start Map2Lap again to retry.\n'
  printf 'The downloaded update has been kept. Press Enter to close.'
  read -r _
  exit 1
}
while :; do
  if [ -f update/ready ]; then
    echo "Installing the update ..."
    for d in update/Map2Lap/*/; do
      [ -d "$d" ] || continue
      n=$(basename "$d")
      rm -rf "$n" && cp -a "$d" "$n" || update_failed
    done
    for f in update/Map2Lap/*; do
      [ -f "$f" ] && [ "$(basename "$f")" != start.sh ] || continue
      cp -a "$f" . || update_failed
    done
    cp -a update/Map2Lap/start.sh start.sh.new && mv -f start.sh.new start.sh || update_failed
    rm -f update/ready || update_failed
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
# (the terminal closes with the script: an error stays readable until Enter)
if [ "$code" != 0 ] && [ "$code" != 130 ]; then
  printf "\nMap2Lap ended with exit code %s. Press Enter to close." "$code"
  read -r _
fi
