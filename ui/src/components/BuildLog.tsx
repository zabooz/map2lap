import {useLayoutEffect, useRef, type RefObject} from "react";
import styles from "./BuildLog.module.css";

const BOTTOM_PX = 30;           // this near the bottom counts as reading the newest line

/** The build's log: shows its newest line, until the reader scrolls up (back at the bottom: again). started: when the
    build began. */
export function BuildLog({text, started, box}: {text: string; started: number | null | undefined; box: RefObject<HTMLPreElement | null>}) {
  const follow = useRef(true);

  useLayoutEffect(() => { follow.current = true; }, [started]);

  useLayoutEffect(() => {
    if (!text) follow.current = true;
    if (box.current && follow.current) box.current.scrollTo({top: box.current.scrollHeight});
  }, [text, started, box]);

  return (
    <section className={styles.section} aria-labelledby="build-log-title">
      <h2 id="build-log-title" className={styles.title}>Build log</h2>
      <pre id="log" data-testid="build-log" className={styles.log} ref={box} tabIndex={0} aria-labelledby="build-log-title"
           onScroll={e => {
             const log = e.currentTarget;
             follow.current = log.scrollTop + log.clientHeight >= log.scrollHeight - BOTTOM_PX;
           }}>{text}</pre>
    </section>
  );
}
