import {useEffect, useRef, useState} from "react";
import {LOOK, roughnessLabel, type TextureLook, type TextureMaps} from "./textureLook";
import frame from "./ImportDialog.module.css";
import styles from "./TextureSettings.module.css";

/** One application's texture settings as fields: which maps it uses, how strong its normals are, roughness toward smooth or matte,
    and repetition variation where it works (rectangular repeats). A missing map is named, never switched. onChange gets every
    change; done says the value settled (a switch, a slider let go or set by key), so the Inspector applies only then. */
export function TextureLookFields({maps, rectangular, look, variation, disabled = false, onChange}: {maps: TextureMaps; rectangular: boolean;
  look: TextureLook; variation: boolean; disabled?: boolean; onChange: (look: TextureLook, variation: boolean, done: boolean) => void}) {
  const change = (values: Partial<TextureLook>, done: boolean) => onChange({...look, ...values}, variation, done);
  const roughFlat = !maps.roughness || !look.roughness_map;
  const strength = (event: {currentTarget: HTMLInputElement}, done: boolean) => change({normal_strength: event.currentTarget.valueAsNumber / 100}, done);
  const shift = (event: {currentTarget: HTMLInputElement}, done: boolean) => change({roughness_shift: event.currentTarget.valueAsNumber / 100}, done);
  return <fieldset className={styles.fields} disabled={disabled}>
    <section className={styles.group} aria-label="Normal map">
      <strong className={styles.title}>Normal map</strong>
      {maps.normal ? <>
        <label className={styles.switch}><input type="checkbox" role="switch" checked={look.normal}
          onChange={event => change({normal: event.target.checked}, true)} />Use normal map</label>
        <label className={styles.slider}>Strength
          <input type="range" min={0} max={100} step={1} value={Math.round(look.normal_strength * 100)} disabled={!look.normal}
            aria-label="Normal strength" onChange={event => strength(event, false)} onPointerUp={event => strength(event, true)}
            onKeyUp={event => strength(event, true)} />
          <output>{Math.round(look.normal_strength * 100)} %</output></label>
        <p className={frame.note}>Small bumps in the light; geometry and driving stay the same.</p>
      </> : <p className={frame.note}>No normal map: no bumps in the light.</p>}
    </section>
    <section className={styles.group} aria-label="Roughness">
      <strong className={styles.title}>Roughness <output className={styles.value}>{roughnessLabel(look.roughness_shift)}</output></strong>
      {maps.roughness ? <label className={styles.switch}><input type="checkbox" role="switch" checked={look.roughness_map}
          onChange={event => change({roughness_map: event.target.checked}, true)} />Use roughness map</label>
        : <p className={frame.note}>No roughness map: the surface is rough.</p>}
      <label className={styles.slider}><span>Smoother</span>
        <input type="range" min={-100} max={100} step={1} value={Math.round(look.roughness_shift * 100)} aria-label="Roughness"
          onChange={event => shift(event, false)} onPointerUp={event => shift(event, true)} onKeyUp={event => shift(event, true)}
          onDoubleClick={() => change({roughness_shift: 0}, true)} />
        <span>Matter</span></label>
      <p className={frame.note}>{roughFlat ? "Without a roughness map only Smoother changes it."
        : "Light parts of the map are matte, dark parts shiny; the middle keeps them."}</p>
    </section>
    <section className={styles.group} aria-label="Repetition">
      <strong className={styles.title}>Repetition</strong>
      {rectangular ? <><label className={styles.switch}><input type="checkbox" aria-label="Break up texture repetition" checked={variation}
          onChange={event => onChange(look, event.target.checked, true)} />Break up texture repetition</label>
        <p className={frame.note}>Requires CSP. Leave it off for regular patterns such as tiles or brickwork.</p></>
        : <p className={frame.note}>Breaking up the repetition is not available for square repeats yet.</p>}
    </section>
  </fieldset>;
}

/** The texture settings for the library's next Apply, in a small window over it, in the group settings' look. Cancel, Escape or a
    click beside the window drop the changes; onSave hands them over. scope: what the change reaches, in a sentence. */
export function TextureSettings({name, preview, maps, rectangular, look, variation, scope, confirm, busy = false, error, onSave, onClose}: {
  name: string; preview: string; maps: TextureMaps; rectangular: boolean; look: TextureLook; variation: boolean; scope: string;
  confirm: string; busy?: boolean; error?: string | null; onSave: (look: TextureLook, variation: boolean) => void; onClose: () => void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(look), [varied, setVaried] = useState(variation);
  useEffect(() => { const element = dialog.current!; element.showModal(); return () => element.close(); }, []);
  const close = () => { if (!busy) onClose(); };
  return <dialog ref={dialog} className={`${frame.dialog} ${styles.dialog}`} aria-label="Texture settings"
    onKeyDown={event => event.stopPropagation()} onCancel={event => { event.preventDefault(); close(); }}
    onClick={event => { const r = event.currentTarget.getBoundingClientRect();
      if (event.target === event.currentTarget && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) close(); }}>
    <form className={`${frame.form} ${styles.form}`} onSubmit={event => { event.preventDefault(); if (!busy) onSave(draft, varied); }}>
      <div className={styles.head}>
        {preview && <img className={styles.preview} src={preview} alt="Texture preview" />}
        <div><h2 title={name}>Texture settings: <span className={frame.file}>{name}</span></h2><p className={frame.note}>{scope}</p></div>
      </div>
      <TextureLookFields maps={maps} rectangular={rectangular} look={draft} variation={varied} disabled={busy}
        onChange={(chosen, varies) => { setDraft(chosen); setVaried(varies); }} />
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
