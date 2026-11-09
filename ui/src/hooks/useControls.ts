import {useCallback, useState} from "react";
import {DEFAULT_CONTROLS, parseControls, type Controls} from "../editor/scene/controls";

const KEY = "map2lap.controls";

function read() {
  try {
    return parseControls(localStorage.getItem(KEY));
  } catch {
    return DEFAULT_CONTROLS;
  }
}

/** How the 3D view moves, kept by this browser. */
export function useControls() {
  const [controls, setControls] = useState<Controls>(read);

  const save = useCallback((next: Controls) => {
    setControls(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch { /* (blocked: they hold for this visit) */ }
  }, []);

  return {controls, save};
}
