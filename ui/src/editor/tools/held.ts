// The keys held that reach a tool's options (ToolOptions: each stands for a place of the bar), so the bar can say which is held.
import {useEffect, useState} from "react";

export interface Held {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  ctrlAlt: boolean;
}

interface KeysOfEvent {
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
}

const SHIFT = 1, CTRL = 2, ALT = 4;

const keysOf = (e: KeysOfEvent) => (e.shiftKey ? SHIFT : 0) + (e.ctrlKey ? CTRL : 0) + (e.altKey ? ALT : 0);

/** What the keys of an event mean: Ctrl and Alt together are the one thing, neither of the two alone. Pure. */
export function heldOf(e: KeysOfEvent): Held {
  return {shift: e.shiftKey, ctrl: e.ctrlKey && !e.altKey, alt: e.altKey && !e.ctrlKey, ctrlAlt: e.ctrlKey && e.altKey};
}

/** What is held now. A move of the mouse tells too: a key let go while the browser's menu or another window had the focus sends nothing. */
export function useHeld() {
  const [keys, setKeys] = useState(0);
  useEffect(() => {
    const read = (e: KeyboardEvent | PointerEvent) => setKeys(keysOf(e)), gone = () => setKeys(0);
    const reading = ["keydown", "keyup", "pointermove"] as const;
    for (const type of reading) window.addEventListener(type, read);
    window.addEventListener("blur", gone);
    return () => {
      for (const type of reading) window.removeEventListener(type, read);
      window.removeEventListener("blur", gone);
    };
  }, []);
  return heldOf({shiftKey: (keys & SHIFT) > 0, ctrlKey: (keys & CTRL) > 0, altKey: (keys & ALT) > 0});
}

type KeyOfEvent = Pick<KeyboardEvent, "key" | "ctrlKey" | "shiftKey" | "metaKey" | "repeat">;

/** Alt pressed and let go by itself, as a key of its own (Select's Alt place). Another key, a click or the wheel while it is held make it
    a modifier: other() says so; AltGr (Ctrl and Alt) and a window switch (Alt+Tab) never count. */
export class AltAlone {
  private armed = false;

  down(e: KeyOfEvent) {
    if (e.key === "Alt" && e.repeat) return;
    this.armed = e.key === "Alt" && !e.ctrlKey && !e.shiftKey && !e.metaKey;
  }

  other() { this.armed = false; }

  /** Whether this key's release is Alt let go by itself. */
  up(e: KeyOfEvent) {
    if (e.key !== "Alt") return false;
    const alone = this.armed;
    this.armed = false;
    return alone;
  }
}
