import styles from "./WallFields.module.css";

/** A wall's top offset and whole-wall colour texture. Its source feet and road/terrain connection stay fixed. */
export function WallFields({rise, textured, busy, error, onHeight, onTexture, onOriginal, onReset}: {
  rise: number; textured: boolean; busy: boolean; error: string | null;
  onHeight: (metres: number) => Promise<boolean>; onTexture: () => void;
  onOriginal: () => Promise<boolean>; onReset: () => Promise<boolean>;
}) {
  return <div className={styles.fields}>
    <button type="button" disabled={busy} onClick={onTexture}>Change texture…</button>
    <form onSubmit={e => {
      e.preventDefault();
      const input = e.currentTarget.elements.namedItem("top") as HTMLInputElement;
      if (input.checkValidity()) void onHeight(input.valueAsNumber / 100);
    }}>
      <label className={styles.field}><span>Top offset</span>
        <input key={rise} name="top" type="number" min={-100000} max={100000} step={10} defaultValue={Math.round(rise * 100)} disabled={busy} />
        <span>cm</span></label>
      <button type="submit" disabled={busy}>Set height</button>
    </form>
    <p className={styles.hint}>Offset from its built top; both feet stay fixed. Lowering stops above either foot.</p>
    {textured && <button type="button" disabled={busy} onClick={() => void onOriginal()}>Original texture</button>}
    {(rise !== 0 || textured) && <button type="button" disabled={busy} onClick={() => void onReset()}>Reset wall</button>}
    {error && <p className={styles.error} role="alert">{error}</p>}
  </div>;
}
