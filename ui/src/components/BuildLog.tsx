import {useEffect, useLayoutEffect, useRef} from "react";
import styles from "./BuildLog.module.css";

const BOTTOM_PX = 30;           // this near the bottom counts as reading the newest line

/** The build's log: shows its newest line, until the reader scrolls up (back at the bottom: again). started: when the
    build began. */
export function BuildLog({text, started}: {text: string; started: number | null | undefined}) {
  const box = useRef<HTMLPreElement>(null);
  const follow = useRef(true);

  useEffect(() => { follow.current = true; }, [started]);

  useLayoutEffect(() => {
    if (!text) follow.current = true;
    if (box.current && follow.current) box.current.scrollTop = box.current.scrollHeight;
  }, [text]);

  return (
    <>
      <div className={styles.head}><span>Build log</span></div>
      <pre id="log" className={styles.log} ref={box} onScroll={e => {
        const l = e.currentTarget;
        follow.current = l.scrollTop + l.clientHeight >= l.scrollHeight - BOTTOM_PX;
      }}>{text}</pre>
    </>
  );
}
