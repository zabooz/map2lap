import {useEffect, useRef, useState} from "react";
import styles from "./ToolToasts.module.css";

const SHOWN_MS = 3000;      // long enough to read a sentence, short enough not to cover the view while working on
const MOST = 5;             // more at once is a burst of one action's steps: the oldest go first

/** Every tool's notes as short-lived toasts at the bottom right of the view: each note shows for SHOWN_MS, at most MOST
    at once, the oldest leaving first. note: the tool note as EditTools last set it, n counting each one, so the same
    text set again (a refusal repeated) shows again; null: none yet. */
export function ToolToasts({note}: {note: {text: string; n: number} | null}) {
  const [shown, setShown] = useState<{id: number; text: string}[]>([]);
  const next = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    if (!note) return;
    const id = next.current++;
    setShown(list => [...list, {id, text: note.text}].slice(-MOST));
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setShown(list => list.filter(item => item.id !== id));
    }, SHOWN_MS);
    timers.current.add(timer);
  }, [note]);

  useEffect(() => {
    const pending = timers.current;
    return () => { for (const timer of pending) clearTimeout(timer); pending.clear(); };
  }, []);

  if (!shown.length) return null;
  return (
    <div id="edit-tool-toasts" className={styles.stack} role="status" aria-live="polite">
      {shown.map(item => <p key={item.id} className={styles.toast}>{item.text}</p>)}
    </div>
  );
}
