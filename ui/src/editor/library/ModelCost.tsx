import styles from "./ModelCost.module.css";

export interface TrackCost {
  version: number; triangles: number; bytes: {none: number; mesh: number}; warning_bytes: number;
  heavy: {none: boolean; mesh: boolean};
}

const mb = (bytes: number) => `${(bytes / 1_000_000).toFixed(2)} MB`;

/** Show the server's native geometry costs and advisory budget for the selected collision mode. Pure. */
export function ModelCost({cost, collision}: {cost: TrackCost; collision: "none" | "mesh"}) {
  return <div className={styles.cost} aria-label="Track geometry cost">
    <strong>{cost.triangles.toLocaleString("en-US")} triangles</strong>
    <span>Geometry per instance in the track:</span>
    <span>No collision: <b>{mb(cost.bytes.none)}</b> · Mesh collision: <b>{mb(cost.bytes.mesh)}</b></span>
    <small>Textures are shared. Mesh headers are additional.</small>
    {cost.heavy[collision] && <p className={styles.warning} role="status">Heavy model: {mb(cost.bytes[collision])} per instance.
      {" "}Above the {mb(cost.warning_bytes)} advisory budget; many copies can make the track large.</p>}
  </div>;
}
