import {memo, useEffect, useState, type ReactNode} from "react";
import type {EditState} from "../state/edits";
import {HoverBox} from "./HoverBox";
import {sortName} from "../scene/inspect";
import {SurfaceInfo} from "./SurfaceInfo";
import type {SurfacePoint, SurfaceSelection} from "../scene/surfaces";
import type {Hovered, Marked, Picked} from "../types";
import type {TrackView} from "../scene/view";
import styles from "./Inspector.module.css";
import {SunClock} from "../scene/SunClock";
import {TrackStatistics} from "./TrackStatistics";

function Row({label, children}: {label: string; children: ReactNode}) {
  return <><dt>{label}</dt><dd>{children}</dd></>;
}

interface ObjectInfo {
  id: string;
  kind: string;
  sort: string;
  built_at: number[];
  parent: string | null;
  children: string[];
  companions: string[];
  triangles: number;
  meshes: {name: string; visible: boolean; triangles: number; material: {name: string; shader: string; texture: string | null}}[];
  details: {asset?: string; footprint?: number[][]; parameters?: Record<string, unknown> | unknown[]; source_index?: number};
}

const metres = (values: number[]) => `${values.map(v => v.toFixed(2)).join(" × ")} m`;
const parameterName: Record<string, string> = {cls: "Building type", floors: "Floors", floor_h: "Floor height (m)",
  height: "Built height (m)", roof: "Roof", roof_mat: "Roof material", facade: "Facade", pitch: "Roof pitch", min_h: "Base height (m)", seed: "Variation seed"};

/** Build parameters arrive only for the selected listed id; changing selection cancels both request and stale results. */
const ObjectDetails = memo(function ObjectDetails({name, picked, view, state}: {name: string; picked: Picked; view: TrackView; state: EditState}) {
  const [info, setInfo] = useState<ObjectInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const source = picked.inspection!;
  useEffect(() => {
    if (!source.listed || !picked.id) return;
    const controller = new AbortController();
    const query = new URLSearchParams({id: picked.id, r: source.revision});
    void fetch(`/api/editor/${encodeURIComponent(name)}/inspect?${query}`, {signal: controller.signal}).then(async response => {
      const result = await response.json() as ObjectInfo & {error?: string};
      if (!response.ok) throw new Error(result.error ?? "Could not read object details");
      if (!controller.signal.aborted) setInfo(result);
    }).catch((e: Error) => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [name, picked.id, source.listed, source.revision]);
  const placement = state.placed.find(p => p.id === picked.id);
  const size = picked.id ? view.dimensionsOf(picked.id) : null;
  return <details className={styles.details}>
    <summary>Object details</summary>
    <div id="inspect-object">
      <dl className={styles.rows}>
        {picked.id && <Row label="ID">{picked.id}</Row>}
        {picked.sort && <Row label="Type">{sortName(picked.sort)}</Row>}
        {picked.sprite && <Row label="Tree image">{picked.sprite}</Row>}
        {size && <Row label="Dimensions">{metres(size)} <span className="muted">(loaded geometry; X × height × Z)</span></Row>}
        {placement && <><Row label="Move (X, Y, Z)">{[placement.x, placement.y, placement.z].map(v => v.toFixed(2)).join(", ")} m</Row>
          <Row label="Turn">{placement.turn.toFixed(1)}°</Row><Row label="Scale">{placement.scale.toFixed(2)}×</Row></>}
        {info && <><Row label="Object triangles">{info.triangles.toLocaleString()}</Row>
          <Row label="Parts">{info.meshes.length} ({info.meshes.filter(m => !m.visible).length} hidden)</Row>
          <Row label="Built at">{info.built_at.map(v => v.toFixed(2)).join(", ")}</Row>
          {info.parent && <Row label="Parent">{info.parent}</Row>}
          {!!info.children.length && <Row label="Children">{info.children.join(", ")}</Row>}
          {!!info.companions.length && <Row label="Taken along">{info.companions.join(", ")}</Row>}
          {info.details.asset && <Row label="Built from">{info.details.asset}</Row>}
          {info.details.source_index !== undefined && <Row label="Build item">{info.details.source_index}</Row>}
          {info.details.footprint && <Row label="Footprint">{info.details.footprint.length} corners</Row>}
        </>}
        {!source.listed && source.hovered.billboard && <Row label="Object triangles">8 (crossed billboard)</Row>}
      </dl>
      {info?.meshes.map(mesh => <details className={styles.part} key={mesh.name}><summary>{mesh.name}</summary>
        <dl className={styles.rows}><Row label="Material">{mesh.material.name}</Row><Row label="Shader">{mesh.material.shader}</Row>
          <Row label="Texture">{mesh.material.texture ?? "None"}</Row><Row label="Triangles">{mesh.triangles}</Row>
          <Row label="Visible">{mesh.visible ? "Yes" : "No (hidden part)"}</Row></dl></details>)}
      {info?.details.parameters && <details className={styles.part}><summary>Original build parameters</summary>
        <dl className={styles.rows}>{Object.entries(info.details.parameters).filter(([, v]) => v !== null && v !== undefined && typeof v !== "object")
          .map(([key, value]) => <Row key={key} label={Array.isArray(info.details.parameters) ? `Parameter ${Number(key) + 1}` : parameterName[key] ?? key}>{String(value)}</Row>)}</dl></details>}
      {source.listed && !info && !error && <p className="small muted">Reading object details…</p>}
      {error && <p className="small muted">{error}</p>}
    </div>
  </details>;
});

interface TextureAppearance {
  name: string; preview: string; repeat: [number, number] | null; variation: boolean; original: boolean; mixed: boolean;
}

/** The active colour image, separated from source mesh/material diagnostics. onEdit: opens the textures, null where the paint can't change. */
export function AppearanceCard({info, onEdit}: {info: TextureAppearance; onEdit: (() => void) | null}) {
  const [failed, setFailed] = useState(false);
  return <>
    {info.preview && !failed && (onEdit ? <button type="button" className={styles.appearance} aria-label="Edit texture" onClick={onEdit}>
      <img className={styles.preview} src={info.preview} alt="Selected texture" onError={() => setFailed(true)} />
    </button> : <img className={styles.preview} src={info.preview} alt="Selected texture" onError={() => setFailed(true)} />)}
    <strong>{info.name}</strong>
    {info.repeat && <p className="small muted">{info.repeat.join(" × ")} m per repeat{info.variation && " · Repetition variation"}</p>}
    {info.mixed && <p className="small muted">Blended edge: showing the dominant texture at the selected point.</p>}
    {failed && <p className="small muted">Texture preview unavailable.</p>}
    {onEdit && <button type="button" className={styles.change} onClick={onEdit}>Change texture…</button>}
  </>;
}

const fixed = (v: number, digits = 2) => v.toFixed(digits);

/** The selection's few facts under its name: what sort and size an object is, its mesh and physics, where it is on the route (else
    in AC's x, y, z). The whole list is the Details tab's. Pure. */
export function SelectionFacts({hovered: h}: {hovered: Hovered}) {
  const type = h.sort ? sortName(h.sort) : h.sprite;
  return <dl className={`${styles.rows} ${styles.facts}`}>
    {type && <Row label="Type">{type}</Row>}
    {h.billboard?.height != null && <Row label="Height">{fixed(h.billboard.height, 1)} m</Row>}
    <Row label="Mesh">{h.object}</Row>
    <Row label="Physics">{h.physics}</Row>
    {h.route ? <Row label="Route">{Math.round(h.route.metre)} m, {fixed(h.route.off, 1)} m off</Row>
      : <Row label="At">{h.at.map(v => fixed(v)).join(", ")}</Row>}
  </dl>;
}

function Appearance({name, picked, version, onEdit}: {name: string; picked: Picked; version: string; onEdit: (() => void) | null}) {
  const [answer, setAnswer] = useState<{key: string; info?: TextureAppearance; error?: string} | null>(null);
  const source = picked.inspection!, point = picked.surface;
  const ground = !!point && point.face === undefined;
  const query = new URLSearchParams({mesh: String(point?.mesh), u: String(point?.u), v: String(point?.v), r: source.revision, p: version});
  const key = `/api/editor/${encodeURIComponent(name)}/appearance?${query}`;
  useEffect(() => {
    if (!ground) return;
    const controller = new AbortController();
    void fetch(key, {signal: controller.signal})
      .then(async response => {
        const result = await response.json() as TextureAppearance & {error?: string};
        if (!response.ok) throw new Error(result.error ?? "Could not read the applied texture");
        if (!controller.signal.aborted) setAnswer({key, info: result});
      }).catch((e: Error) => { if (!controller.signal.aborted) setAnswer({key, error: e.message}); });
    return () => controller.abort();
  }, [key, ground]);
  const info: TextureAppearance | undefined = ground ? answer?.key === key ? answer.info : undefined : {
    name: source.hovered.texture ?? "No texture", preview: source.texture !== null && source.texture >= 0
      ? `/api/editor/${encodeURIComponent(name)}/thumbnail?${new URLSearchParams({texture: String(source.texture), r: source.revision})}` : "",
    repeat: null, variation: false, original: false, mixed: false,
  };
  return <section id="inspect-appearance" className={styles.section}>
    <h3>Appearance</h3>
    {info ? <AppearanceCard key={info.preview} info={info} onEdit={onEdit} /> : <p className="small muted">
      {answer?.key === key && answer.error ? answer.error : "Reading applied texture…"}</p>}
  </section>;
}

/** The selection stays pinned while pointer details change. Width belongs to this panel, not to the camera. */
export function Inspector({name, picked, hovered, surfaces, marked, view, state, collapsed, onCollapsed, width, onWidth, onSurface,
  onMaterialOpen, notes, transform}: {
  name: string; picked: Picked | null; hovered: Hovered | null; surfaces: SurfacePoint[]; marked: Marked[]; view: TrackView; state: EditState;
  collapsed: boolean; onCollapsed: (collapsed: boolean) => void; width: number; onWidth: (width: number) => void;
  onSurface: (selection: SurfaceSelection | null) => void; onMaterialOpen: () => void; textureRevision: number;
  notes?: ReactNode;
  transform?: ReactNode;      // (the picked objects' turn, raise and size to type, under the selection)
}) {
  const [tab, setTab] = useState<"properties" | "details">("properties");
  const chosen = picked?.kind && (!picked.surface || surfaces.length) ? picked : null;
  const textureVersion = chosen?.inspection?.texture != null ? view.textureVersion(chosen.inspection.texture) : "";
  const updateWidth = (value: number) => onWidth(Math.max(260, Math.min(520, value)));
  return <>
    {collapsed && <button className={styles.show} onClick={() => onCollapsed(false)} aria-label="Show inspector">Inspector ‹</button>}
    {!collapsed && <div className={styles.divider} role="separator" tabIndex={0} aria-label="Inspector width" aria-orientation="vertical"
      aria-valuenow={width} aria-valuemin={260} aria-valuemax={520}
      onKeyDown={e => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); updateWidth(width + (e.key === "ArrowLeft" ? 20 : -20)); } }}
      onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); e.preventDefault(); }}
      onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) updateWidth(e.currentTarget.getBoundingClientRect().right + width - e.clientX); }} />}
    <aside className={styles.panel} aria-label="Inspector" hidden={collapsed}>
      <div className={styles.head}><h2>Inspector</h2><button type="button" onClick={() => onCollapsed(true)} aria-label="Hide inspector">›</button></div>
      <SunClock key={name} view={view} />
      <div className={styles.tabs} role="tablist" aria-label="Inspector">
        {(["properties", "details"] as const).map(id => <button type="button" role="tab" id={`inspector-tab-${id}`} key={id}
          aria-selected={tab === id} aria-controls={`inspector-${id}`} tabIndex={tab === id ? 0 : -1} onClick={() => setTab(id)}
          onKeyDown={e => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
            e.preventDefault(); e.stopPropagation();
            const next = e.key === "Home" ? "properties" : e.key === "End" ? "details" : id === "properties" ? "details" : "properties";
            setTab(next); document.getElementById(`inspector-tab-${next}`)?.focus();
          } }}>{id === "properties" ? "Properties" : "Details"}</button>)}
      </div>
      <div id="inspector-properties" role="tabpanel" aria-labelledby="inspector-tab-properties" hidden={tab !== "properties"}>
      <section id="inspect-selection" className={styles.section}>
        <h3>Selection</h3>
        {chosen && !chosen.surface && <><strong>{chosen.all.length > 1 ? `${chosen.all.length} objects` : chosen.kind}</strong>
          {chosen.id && <p className={styles.identifier}>{chosen.id}</p>}</>}
        {marked.length > 0 && <p className="small">{marked.map(g => `All ${g.tree ? g.sort : sortName(g.sort)}`).join(", ")}</p>}
        {surfaces.length > 0 && <SurfaceInfo key={JSON.stringify(surfaces)} name={name} surfaces={surfaces} view={view} onSelected={onSurface} />}
        {chosen?.inspection && chosen.all.length <= 1 && <SelectionFacts hovered={chosen.inspection.hovered} />}
        {chosen && !chosen.surface && transform}
        {!chosen && !surfaces.length && !marked.length && <p className="small muted">Nothing selected. Click a surface or object in the view.</p>}
      </section>
      {chosen?.inspection && <Appearance key={`${name} ${chosen.inspection.revision} ${chosen.inspection.texture}`}
        name={name} picked={chosen} version={textureVersion} onEdit={chosen.surface && chosen.surface.face === undefined ? onMaterialOpen : null} />}
      <section id="inspect-pointer" className={styles.section}><h3>Under pointer</h3>
        <HoverBox hovered={hovered} />
      </section>
      </div>
      <div id="inspector-details" role="tabpanel" aria-labelledby="inspector-tab-details" hidden={tab !== "details"}>
      <TrackStatistics name={name} revision={state.keptRevision} active={tab === "details" && state.save === "saved"} />
      <section className={styles.section} aria-label="Editor changes"><h3>Editor changes</h3>{notes}</section>
      {chosen?.id && chosen.inspection && <ObjectDetails key={`${name} ${chosen.id}`} name={name} picked={chosen} view={view} state={state} />}
      {chosen?.inspection && <details className={styles.details}><summary>Selected mesh details</summary>
        <HoverBox id="inspect-mesh" hovered={chosen.inspection.hovered} />
      </details>}
      </div>
    </aside>
  </>;
}
