import {useEffect, useState} from "react";
import styles from "./Inspector.module.css";

interface Sizes {current_bytes: number; draft_bytes: number | null; estimated: boolean; error?: string}
const size = (bytes: number) => `${(bytes / 1024 / 1024).toLocaleString(undefined, {maximumFractionDigits: 2})} MiB (${bytes.toLocaleString()} bytes)`;

/** KN5 bytes measured on disk and the current draft estimate, fetched only while Details is open. */
export function TrackStatistics({name, revision, active}: {name: string; revision: number; active: boolean}) {
  const [answer, setAnswer] = useState<{revision: number; sizes?: Sizes; error?: string} | null>(null);
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    void fetch(`/api/editor/${encodeURIComponent(name)}/statistics`, {signal: controller.signal}).then(async response => {
      const value = await response.json() as Sizes & {error?: string};
      if (!response.ok) throw new Error(value.error ?? "Could not read track size");
      if (!controller.signal.aborted) setAnswer({revision, sizes: value});
    }).catch((error: Error) => { if (!controller.signal.aborted) setAnswer({revision, error: error.message}); });
    return () => controller.abort();
  }, [name, revision, active]);
  const current = answer?.revision === revision ? answer : null;
  return <section className={styles.section} aria-label="Track statistics">
    <h3>Track statistics</h3>
    {current?.sizes ? <dl className={styles.rows}>
      <dt>Current KN5</dt><dd>{size(current.sizes.current_bytes)}</dd>
      <dt>{current.sizes.estimated ? "With draft (estimate)" : "Without draft (measured)"}</dt><dd>{current.sizes.draft_bytes === null ? "Unavailable" : size(current.sizes.draft_bytes)}</dd>
    </dl> : <p className="small muted">{current?.error ?? "Reading track size…"}</p>}
    {current?.sizes?.error && <p role="alert" className="small">{current.sizes.error}</p>}
  </section>;
}
