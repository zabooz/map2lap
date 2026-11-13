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
import {WeatherControls} from "../scene/WeatherControls";
import {TrackStatistics} from "./TrackStatistics";
import {TextureLookFields} from "../library/TextureSettings";
import {LOOK, lookSummary, type TextureLook, type TextureMaps} from "../library/textureLook";
import type {Tool} from "../tools/ToolPanel";

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
        {source.hovered.treefx && <Row label="Object triangles">{source.hovered.treefx.triangles} (3D model {source.hovered.treefx.model}, CSP TreeFX)</Row>}
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
  /** The applied texture edit shown here and its settings (trackinspect._application); absent where nothing was applied. */
  paint?: string; look?: TextureLook; maps?: TextureMaps; tiles?: number;
}

/** What the Inspector changes the shown texture's settings with (usePaint). */
export interface Restyling {busy: boolean; error: string | null; restyle: (paint: string, look: TextureLook, variation?: boolean) => Promise<boolean>}

/** The selected colour image and its appearance facts; all editable controls live below it in Options. */
export function AppearanceCard({info}: {info: TextureAppearance}) {
  const [failed, setFailed] = useState(false);
  return <>
    {info.preview && !failed && <img className={styles.preview} src={info.preview} alt="Selected texture" onError={() => setFailed(true)} />}
    <strong>{info.name}</strong>
    {info.repeat && <p className="small muted">{info.repeat.join(" × ")} m per repeat{info.variation && " · Repetition variation"}</p>}
    {info.mixed && <p className="small muted">Blended edge: showing the dominant texture at the selected point.</p>}
    {info.paint && info.look && info.maps && <p className="small muted">{lookSummary(info.look, info.maps)}</p>}
    {failed && <p className="small muted">Texture preview unavailable.</p>}
  </>;
}

/** The applied texture's settings in the panel (info.paint, look, maps), changed in place for this application only: a switch at
    once, a slider when it is let go, each one Undo step (restyling). A refused change goes back to what the track has; a new edit
    at the point (Undo, Revert, another change) brings its settings. stale: info is the point's before the last change, so the
    controls wait for the edit that replaced it. */
function LookControls({info, stale, restyling}: {info: TextureAppearance; stale: boolean; restyling: Restyling}) {
  const now = {look: info.look!, variation: info.variation};
  const [draft, setDraft] = useState(now), [paint, setPaint] = useState(info.paint);
  if (paint !== info.paint) { setPaint(info.paint); setDraft(now); }
  const apply = (look: TextureLook, variation: boolean) => {
    setDraft({look, variation});
    if (JSON.stringify({look, variation}) === JSON.stringify(now)) return;
    void restyling.restyle(info.paint!, look, variation).then(done => { if (!done) setDraft(now); });
  };
  const tiles = info.tiles ? ` (${info.tiles} ${info.tiles === 1 ? "tile" : "tiles"})` : "";
  return <div className={styles.look} role="group" aria-label="Texture settings">
    <h4>Texture settings</h4>
    <TextureLookFields maps={info.maps ?? {normal: false, roughness: false}} look={draft.look}
      variation={draft.variation} disabled={restyling.busy || stale}
      onChange={(look, variation, done) => done ? apply(look, variation) : setDraft({look, variation})} />
    <p className="small muted">This application only{tiles}{info.mixed ? ", the dominant texture at this blended edge" : ""}. Other places
      and the library stay as they are; Undo takes it back.</p>
    {restyling.error && <p role="alert" className={styles.error}>{restyling.error}</p>}
    <div className={styles.actions}>
      <button type="button" className={styles.change} disabled={restyling.busy || stale} onClick={() => apply(LOOK, draft.variation)}>As imported</button>
      {restyling.busy && <span className="small muted" role="status">Applying…</span>}
    </div>
  </div>;
}

const fixed = (v: number, digits = 2) => v.toFixed(digits);

/** The selection's few facts under its name: what sort and size an object is, its mesh and physics, where it is on the route (else
    in AC's x, y, z). The whole list is the Details tab's. Pure. */
export function SelectionFacts({hovered: h}: {hovered: Hovered}) {
  const type = h.sort ? sortName(h.sort) : null;
  return <dl className={`${styles.rows} ${styles.facts}`}>
    {type && <Row label="Type">{type}</Row>}
    {h.treefx && <Row label="Height">{fixed(h.treefx.height, 1)} m</Row>}
    <Row label="Mesh">{h.object}</Row>
    <Row label="Physics">{h.physics}</Row>
    {h.route ? <Row label="Route">{Math.round(h.route.metre)} m, {fixed(h.route.off, 1)} m off</Row>
      : <Row label="At">{h.at.map(v => fixed(v)).join(", ")}</Row>}
  </dl>;
}

/** The selected object's colour image, including TreeFX images kept outside the KN5 texture table. Pure. */
export function objectTexturePreview(name: string, picked: Picked) {
  const source = picked.inspection!;
  if (source.hovered.treefx && source.hovered.texture) {
    return `/api/editor/${encodeURIComponent(name)}/treefx/${encodeURIComponent(source.hovered.treefx.model)}/${encodeURIComponent(source.hovered.texture)}`;
  }
  return source.texture !== null && source.texture >= 0
    ? `/api/editor/${encodeURIComponent(name)}/thumbnail?${new URLSearchParams({texture: String(source.texture), r: source.revision})}` : "";
}

function Appearance({name, picked, version, onEdit, restyling, options}: {name: string; picked: Picked; version: string; onEdit: (() => void) | null;
  restyling: Restyling | null; options?: ReactNode}) {
  const [answer, setAnswer] = useState<{key: string; spot: string; info?: TextureAppearance; error?: string} | null>(null);
  const source = picked.inspection!, point = picked.surface;
  const ground = !!point && point.face === undefined;
  const query = new URLSearchParams({mesh: String(point?.mesh), u: String(point?.u), v: String(point?.v), r: source.revision, p: version});
  const key = `/api/editor/${encodeURIComponent(name)}/appearance?${query}`, spot = `${point?.mesh}|${point?.u}|${point?.v}`;
  useEffect(() => {
    if (!ground) return;
    const controller = new AbortController();
    void fetch(key, {signal: controller.signal})
      .then(async response => {
        const result = await response.json() as TextureAppearance & {error?: string};
        if (!response.ok) throw new Error(result.error ?? "Could not read the applied texture");
        if (!controller.signal.aborted) setAnswer({key, spot, info: result});
      }).catch((e: Error) => { if (!controller.signal.aborted) setAnswer({key, spot, error: e.message}); });
    return () => controller.abort();
  }, [key, spot, ground]);
  // (after an edit the point's last answer stays while the new one comes, so the panel keeps its place and focus)
  const stale = answer?.key !== key;
  const info: TextureAppearance | undefined = ground ? answer?.spot === spot ? answer.info : undefined : {
    name: source.hovered.texture ?? "No texture", preview: objectTexturePreview(name, picked),
    repeat: null, variation: false, original: false, mixed: false,
  };
  return <><section id="inspect-appearance" className={styles.section}>
    <h3>Appearance</h3>
    {info ? <AppearanceCard key={info.preview} info={info} /> : <p className="small muted">
      {answer?.key === key && answer.error ? answer.error : "Reading applied texture…"}</p>}
  </section>
  <section id="inspect-options" className={styles.section}>
    <h3>Options</h3>
    {onEdit && <div className={styles.actions}><button type="button" className={styles.change} onClick={onEdit}>Change texture…</button></div>}
    {options}
    {restyling && onEdit && info?.paint && info.look && <LookControls key={spot} info={info} stale={stale} restyling={restyling} />}
    {!options && !onEdit && !info?.paint && <p className="small muted">No editable options for this selection.</p>}
  </section></>;
}

/** The selection stays pinned while pointer details change. Width belongs to this panel, not to the camera. */
const INSPECTOR_TABS = ["selection", "properties", "details"] as const;

export function Inspector({name, picked, surfaces, marked, view, state, collapsed, onCollapsed, width, onWidth, onSurface,
  onMaterialOpen, restyling = null, notes, transform, activeTool, vegetation}: {
  name: string; picked: Picked | null; surfaces: SurfacePoint[]; marked: Marked[]; view: TrackView; state: EditState;
  collapsed: boolean; onCollapsed: (collapsed: boolean) => void; width: number; onWidth: (width: number) => void;
  onSurface: (selection: SurfaceSelection | null) => void; onMaterialOpen: () => void; textureRevision: number;
  restyling?: Restyling | null;      // (null: the track can't be edited now)
  notes?: ReactNode;
  transform?: ReactNode;      // the picked object's controls, below Appearance in Options
  activeTool?: Tool;
  vegetation?: ReactNode;
}) {
  const [tab, setTab] = useState<(typeof INSPECTOR_TABS)[number]>("selection");
  const [previous, setPrevious] = useState({picked, tool: activeTool});
  if (previous.picked !== picked || previous.tool !== activeTool) {
    setPrevious({picked, tool: activeTool});
    if (previous.picked !== picked && picked?.kind || previous.tool !== activeTool && activeTool === "move") setTab("selection");
  }
  const chosen = picked?.kind && (!picked.surface || surfaces.length) ? picked : null;
  const textureVersion = chosen?.inspection?.texture != null ? view.textures.version(chosen.inspection.texture) : "";
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
      <div className={styles.tabs} role="tablist" aria-label="Inspector">
        {INSPECTOR_TABS.map((id, i) => <button type="button" role="tab" id={`inspector-tab-${id}`} key={id}
          aria-selected={tab === id} aria-controls={`inspector-${id}`} tabIndex={tab === id ? 0 : -1} onClick={() => setTab(id)}
          onKeyDown={e => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
            e.preventDefault(); e.stopPropagation();
            const next = e.key === "Home" ? INSPECTOR_TABS[0] : e.key === "End" ? INSPECTOR_TABS.at(-1)!
              : INSPECTOR_TABS[(i + (e.key === "ArrowLeft" ? -1 : 1) + INSPECTOR_TABS.length) % INSPECTOR_TABS.length];
            setTab(next); document.getElementById(`inspector-tab-${next}`)?.focus();
          } }}>{id[0].toUpperCase() + id.slice(1)}</button>)}
      </div>
      <div id="inspector-selection" role="tabpanel" aria-labelledby="inspector-tab-selection" hidden={tab !== "selection"}>
      <section id="inspect-selection" className={styles.section}>
        <h3>Selection</h3>
        {chosen && !chosen.surface && <><strong>{chosen.all.length > 1 ? `${chosen.all.length} objects` : chosen.kind}</strong>
          {chosen.id && <p className={styles.identifier}>{chosen.id}</p>}</>}
        {marked.length > 0 && <p className="small">{marked.map(g => `All ${sortName(g.sort)}`).join(", ")}</p>}
        {surfaces.length > 0 && <SurfaceInfo key={JSON.stringify(surfaces)} name={name} surfaces={surfaces} view={view} onSelected={onSurface} />}
        {chosen?.inspection && chosen.all.length <= 1 && <SelectionFacts hovered={chosen.inspection.hovered} />}
        {!chosen && !surfaces.length && !marked.length && <p className="small muted">Nothing selected. Click a surface or object in the view.</p>}
      </section>
      {chosen?.inspection && <Appearance key={`${name} ${chosen.inspection.revision} ${chosen.inspection.texture}`}
        name={name} picked={chosen} version={textureVersion} onEdit={chosen.surface && chosen.surface.face === undefined ? onMaterialOpen : null}
        restyling={restyling} options={!chosen.surface ? transform : undefined} />}
      </div>
      <div id="inspector-properties" role="tabpanel" aria-labelledby="inspector-tab-properties" hidden={tab !== "properties"}>
        <SunClock key={name} view={view} />
        <WeatherControls key={`${name}-weather`} view={view} />
        {vegetation}
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
