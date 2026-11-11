import {useEffect, useRef, useState} from "react";
import {LOOK, roughnessLabel, type TextureLook, type TextureMaps} from "./textureLook";
import frame from "./ImportDialog.module.css";
import styles from "./TextureSettings.module.css";

/** One application's texture settings over the library or the Inspector, in the group settings' look: which maps it uses,
    how strong its normals are, roughness toward smooth or matte, and repetition variation where it works. A missing map is
    named, never switched. Cancel, Escape or a click beside the window drop the changes; onSave hands them over. scope: what
    the change reaches, in a sentence. */
export function TextureSettings({name, preview, maps, rectangular, look, variation, scope, confirm, busy = false, error, onSave, onClose}: {
  name: string; preview: string; maps: TextureMaps; rectangular: boolean; look: TextureLook; variation: boolean; scope: string;
  confirm: string; busy?: boolean; error?: string | null; onSave: (look: TextureLook, variation: boolean) => void; onClose: () => void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(look), [varied, setVaried] = useState(variation);
  useEffect(() => { const element = dialog.current!; element.showModal(); return () => element.close(); }, []);
  const change = (values: Partial<TextureLook>) => setDraft(old => ({...old, ...values}));
  const close = () => { if (!busy) onClose(); };
  const roughFlat = !maps.roughness || !draft.roughness_map;
  return <dialog ref={dialog} className={`${frame.dialog} ${styles.dialog}`} aria-label="Texture settings"
    onKeyDown={event => event.stopPropagation()} onCancel={event => { event.preventDefault(); close(); }}
    onClick={event => { const r = event.currentTarget.getBoundingClientRect();
      if (event.target === event.currentTarget && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) close(); }}>
    <form className={frame.form} onSubmit={event => { event.preventDefault(); if (!busy) onSave(draft, varied); }}>
      <h2 title={name}>Texture settings: <span className={frame.file}>{name}</span></h2>
      <div className={styles.columns}>
        <div className={styles.look}>
          {preview && <img className={styles.preview} src={preview} alt="Texture preview" />}
          <p className={frame.note}>{scope}</p>
        </div>
        <fieldset className={styles.fields} disabled={busy}>
          <section className={styles.group} aria-label="Normal map">
            <strong>Normal map</strong>
            {maps.normal ? <>
              <label className={styles.switch}><input type="checkbox" role="switch" checked={draft.normal}
                onChange={event => change({normal: event.target.checked})} />Use normal map</label>
              <label className={styles.slider}>Normal strength
                <input type="range" min={0} max={100} step={1} value={Math.round(draft.normal_strength * 100)} disabled={!draft.normal}
                  aria-label="Normal strength" onChange={event => change({normal_strength: event.target.valueAsNumber / 100})} />
                <output>{Math.round(draft.normal_strength * 100)} %</output></label>
              <p className={frame.note}>Small bumps in the light. 0 % adds none, 100 % is as imported. Geometry and driving stay the same.</p>
            </> : <p className={frame.note}>No normal map: the surface adds no bumps in the light.</p>}
          </section>
          <section className={styles.group} aria-label="Roughness">
            <strong>Roughness</strong>
            {maps.roughness ? <label className={styles.switch}><input type="checkbox" role="switch" checked={draft.roughness_map}
                onChange={event => change({roughness_map: event.target.checked})} />Use roughness map</label>
              : <p className={frame.note}>No roughness map: the surface is rough.</p>}
            <label className={styles.slider}><span>Smoother</span>
              <input type="range" min={-100} max={100} step={1} value={Math.round(draft.roughness_shift * 100)} aria-label="Roughness"
                onChange={event => change({roughness_shift: event.target.valueAsNumber / 100})}
                onDoubleClick={() => change({roughness_shift: 0})} />
              <span>Matter</span></label>
            <p className={frame.note}><output>{roughnessLabel(draft.roughness_shift)}</output>. {roughFlat
              ? "Without a roughness map the surface is fully rough, so only Smoother changes it."
              : "Light parts of the map are rough and matte, dark parts smooth and shiny; the middle keeps them."}</p>
          </section>
          <section className={styles.group} aria-label="Repetition">
            <strong>Repetition</strong>
            {rectangular ? <><label className={styles.switch}><input type="checkbox" aria-label="Break up texture repetition" checked={varied}
                onChange={event => setVaried(event.target.checked)} />Break up texture repetition</label>
              <p className={frame.note}>Requires CSP. Leave it off for regular patterns such as tiles or brickwork.</p></>
              : <p className={frame.note}>Breaking up the repetition is not available for square repeats yet.</p>}
          </section>
        </fieldset>
      </div>
      {error && <p role="alert" className={frame.error}>{error}</p>}
      {busy && <div role="status" className={frame.waiting}>Applying settings…<progress aria-label="Applying settings" /></div>}
      <div className={frame.buttons}>
        <button type="button" className={styles.reset} disabled={busy} onClick={() => { setDraft(LOOK); setVaried(variation); }}>As imported</button>
        <button type="button" onClick={close} disabled={busy}>Cancel</button>
        <button type="submit" className={frame.primary} disabled={busy}>{confirm}</button>
      </div>
    </form>
  </dialog>;
}
