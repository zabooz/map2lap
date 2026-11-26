import {useCallback, useEffect, useRef, useState} from "react";
import styles from "./ToolToasts.module.css";

const SHOWN_MS = 3000;      // long enough to read a sentence, short enough not to cover the view while working on
const MOST = 5;             // more at once is a burst of one action's steps: the oldest go first

/** Add each note to the stack, including simultaneous refusals from one tool action. */
export function useToolToasts() {
  const [shown, setShown] = useState<{id: number; text: string}[]>([]);
  const next = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const show = useCallback((text:string) => {
    const id = next.current++;
    setShown(list => [...list, {id, text}].slice(-MOST));
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setShown(list => list.filter(item => item.id !== id));
    }, SHOWN_MS);
    timers.current.add(timer);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => { for (const timer of pending) clearTimeout(timer); pending.clear(); };
  }, []);

  return {shown, show};
}

export function ToolToasts({shown}: {shown: {id:number; text:string}[]}) {
  if (!shown.length) return null;
  return (
    <div id="edit-tool-toasts" className={styles.stack} role="status" aria-live="polite">
      {shown.map(item => <p key={item.id} className={styles.toast}>{item.text}</p>)}
    </div>
  );
}
