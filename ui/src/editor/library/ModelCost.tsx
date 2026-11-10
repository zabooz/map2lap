import styles from "./ModelCost.module.css";

export interface TrackCost {
  version: number; triangles: number; bytes: {none: number; mesh: number}; warning_bytes: number;
  heavy: {none: boolean; mesh: boolean};
}

const mb = (bytes: number) => `${(bytes / 1_000_000).toFixed(2)} MB`;

/** Show the server's native geometry costs of one copy and advisory budget for the selected collision mode. busy: a new level is measured, the numbers
    are spinners where they stand. budget: the warning above the budget under them (the import dialog shows CostBudget elsewhere). Pure. */
export function ModelCost({cost, collision, busy = false, budget = true}: {cost: TrackCost; collision: "none" | "mesh"; busy?: boolean; budget?: boolean}) {
  const number = (text: string) => busy ? <span className={styles.spinner} role="progressbar" aria-label="Preparing selected geometry" /> : text;
  return <div className={styles.cost} aria-label="Track geometry cost" aria-busy={busy}>
    <strong>{number(cost.triangles.toLocaleString("en-US"))} triangles</strong>
    <span>No collision: <b>{number(mb(cost.bytes.none))}</b> · Mesh collision: <b>{number(mb(cost.bytes.mesh))}</b></span>
    {budget && cost.heavy[collision] && <p className={styles.warning} role="status">Heavy model: {mb(cost.bytes[collision])} per instance.
      {" "}Above the {mb(cost.warning_bytes)} advisory budget; many copies can make the track large.</p>}
  </div>;
}

/** One copy's size against the advisory budget for the selected collision mode, always one line: quiet within it, a warning above it, so what
    stands below never moves. Pure. */
export function CostBudget({cost, collision}: {cost: TrackCost; collision: "none" | "mesh"}) {
  const size = mb(cost.bytes[collision]), budget = mb(cost.warning_bytes);
  return cost.heavy[collision]
    ? <p className={`${styles.budget} ${styles.heavy}`} role="status" title="Many copies can make the track large.">⚠ Heavy model: {size} per copy, above the {budget} budget</p>
    : <p className={styles.budget} role="status">{size} per copy, within the {budget} budget</p>;
}
