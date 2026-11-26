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

/** Shift pressed and let go by itself: a tool's mode switch (Delete One/Brush, Smooth and Kerb Road/Free). Another key
    (Ctrl+Shift+Z), a click or the wheel in between make it a modifier: other() says so. inField: typed in an input, where
    Shift selects text. */
export class ShiftAlone {
  private armed = false;

  down(e: KeyOfEvent & {inField?: boolean}) {
    this.armed = e.key === "Shift" && (this.armed || !e.repeat) && !e.inField;
  }

  other() { this.armed = false; }

  /** Whether this key's release is Shift let go by itself. */
  up(e: Pick<KeyboardEvent, "key">) {
    const alone = this.armed && e.key === "Shift";
    this.armed = false;
    return alone;
  }
}

/** A modifier tap belongs to the tool only until another key, pointer action or focus change. */
class ModifierAlone {
  private armed = false;
  constructor(private key: "Alt" | "Control") {}

  down(e: KeyOfEvent & {altKey?: boolean; inField?: boolean}) {
    if (e.key === this.key && e.repeat) return;
    this.armed = e.key === this.key && !e.metaKey && !e.shiftKey && !e.inField &&
      (this.key === "Control" ? !e.altKey : !e.ctrlKey);
  }
  other() { this.armed = false; }
  up(e: Pick<KeyboardEvent, "key">) {
    if (e.key !== this.key) return false;
    const alone = this.armed;
    this.armed = false;
    return alone;
  }
}

export class AltAlone extends ModifierAlone { constructor() { super("Alt"); } }

/** Text entry and modal dialogs own their keyboard while the Editor remains mounted. */
export function editorInputBlocked(target: EventTarget | null) {
  return !!document.querySelector('dialog[open], [aria-modal="true"]') ||
    target instanceof HTMLElement && (target.isContentEditable || !!target.closest("input, textarea, select"));
}
