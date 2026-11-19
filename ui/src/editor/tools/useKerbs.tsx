// One racing kerb follows a selected mapped road stretch and is kept in the Editor draft.
import {useEffect, useState} from "react";
import {post} from "../../api";
import {KERB_MAX_HEIGHT, KERB_MAX_WIDTH, KERB_MIN_WIDTH, type KerbEdit, type TrackEdits} from "../state/edits";
import type {TrackView} from "../scene/view";
import type {Picked, WheelKeys} from "../types";
import {KerbOptions} from "./KerbOptions";
import {Latest} from "./latest";
import type {ToolController} from "./toolHost";

type Side = KerbEdit["side"];
type Profile = KerbEdit["profile"];
const centimetres = (value: number) => Math.round(value * 100) / 100;

interface KerbArgs {name: string; view: TrackView; edits: TrackEdits; kerbs: KerbEdit[]; enabled: boolean; highlightId: string | null;
  onNote: (text: string | null) => void}

/** Two road clicks make one independently editable, undoable racing kerb. */
function useKerbTool({name, view, edits, kerbs, enabled, highlightId, onNote}: KerbArgs) {
  const [start, setStart] = useState<[number, number, number] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>("rounded");
  const [width, setWidth] = useState(0.45);
  const [height, setHeight] = useState(0.06);
  const [busy, setBusy] = useState(false);
  const [mode, setModeState] = useState<"road" | "free">("road");     // road: follows a mapped road's edge; free: a line clicked by hand
  const [freePoints, setFreePoints] = useState<[number, number, number][]>([]);   // [x, z, y] clicks of the free kerb being drawn
  const [free, setFree] = useState<string | null>(null);       // the id of the free kerb those clicks make
  const [requests] = useState(() => new Latest());     // (a road or free kerb answered after Esc, a mode switch or a newer click adds nothing)
  const current = kerbs.find(k => k.id === selected) ?? null;
  const highlighted = enabled ? current : kerbs.find(k => k.id === highlightId) ?? null;
  const endFree = () => { setFreePoints([]); setFree(null); };
  const clear = () => { requests.drop(); setBusy(false); setStart(null); setSelected(null); endFree(); onNote(null); };
  const switchMode = (value: "road" | "free") => { requests.drop(); setBusy(false); setModeState(value); setStart(null); endFree(); onNote(null); };

  /** The free kerb centred on points, shown at once and replaced as the line grows. */
  const place = async (points: [number, number, number][]) => {
    const mine = requests.next();
    if (points.length < 2) {
      if (free && kerbs.some(k => k.id === free)) edits.removeKerb(free);
      setFree(null); setSelected(null);
      return;
    }
    const result = await post<{line: KerbEdit["line"]; side: Side}>(`/api/editor/${encodeURIComponent(name)}/kerb/way`,
      {base: edits.boundRevision(), mode: "free", points, width: current?.width ?? width});
    if (!requests.current(mine)) return;           // (a newer click asked again, or the kerb was ended)
    if (result.error || !result.line || !result.side) { onNote(result.error ?? "No kerb could be placed along these points"); return; }
    const kerb: KerbEdit = {id: free ?? crypto.randomUUID(), line: result.line, road_ids: [], side: result.side, centred: true,
      profile: current?.profile ?? profile, width: current?.width ?? width, height: current?.height ?? height};
    if (free && edits.state().kerbs.some(k => k.id === free)) edits.replaceKerb(free, kerb);
    else edits.addKerb(kerb);
    setFree(kerb.id); setSelected(kerb.id);
  };

  const freeClick = (x: number, z: number, y: number) => {
    const points: [number, number, number][] = [...freePoints, [x, z, y]];
    setFreePoints(points);
    void place(points);
  };

  const change = (patch: Partial<Pick<KerbEdit, "profile" | "width" | "height">>) => {
    if (current) edits.updateKerb(current.id, patch);
    if (patch.profile) setProfile(patch.profile);
    if (patch.width !== undefined) setWidth(patch.width);
    if (patch.height !== undefined) setHeight(patch.height);
  };

  const click = async (x: number, z: number, y: number) => {
    if (!enabled || (busy && mode === "road")) return;
    if (mode === "free") return freeClick(x, z, y);
    if (!start) { setStart([x, z, y]); setSelected(null); onNote("Mark the end of the kerb on the same road. The first click chooses its edge."); return; }
    const mine = requests.next();
    setBusy(true);
    onNote("Following the selected road edge…");
    const result = await post<{line: KerbEdit["line"]; side: Side; road_ids: string[]}>(`/api/editor/${encodeURIComponent(name)}/kerb/way`,
      {base: edits.boundRevision(), points: [start, [x, z, y]], width});
    if (!requests.current(mine)) return;
    setBusy(false);
    if (result.error || !result.line || !result.side) { onNote(result.error ?? "No connected road stretch found"); return; }
    const id = crypto.randomUUID();
    edits.addKerb({id, line: result.line, road_ids: result.road_ids, side: result.side, profile, width, height});
    setStart(null); setSelected(id); onNote(`Kerb added on the ${result.side} edge. Change its height or profile, or mark another range.`);
  };

  useEffect(() => {
    if (!enabled && !highlighted) return;
    if (enabled && mode === "free") {
      const line = freePoints.map(([x, z, y]): [number, number, number] => [x, y, z]);
      view.drawBand(line.length ? line : null, 0);
      view.drawPins(line);
    } else if (enabled) view.drawBand(start ? [[start[0], start[2], start[1]]] : null, 0);
    view.highlightKerb(highlighted?.id ?? null);
    return () => { view.drawBand(null, 0); view.drawPins([]); view.highlightKerb(null); };
  }, [enabled, view, start, highlighted, mode, freePoints]);

  const wheel = (keys: WheelKeys, by: number) => {
      if (keys === "ctrl") change({width: Math.min(KERB_MAX_WIDTH, Math.max(KERB_MIN_WIDTH, centimetres((current?.width ?? width) + by * 0.05)))});
      else if (keys === "alt") change({height: Math.min(KERB_MAX_HEIGHT, Math.max(0, centimetres((current?.height ?? height) + by * 0.01)))});
      else if (keys === "ctrlAlt") {
        const profiles: Profile[] = ["flat", "rounded", "ribbed"];
        const index = profiles.indexOf(current?.profile ?? profile);
        change({profile: profiles[(index + by + profiles.length) % profiles.length]});
      }
  };

  /** A left click: a free kerb's next point (before picking a kerb: the free kerb being drawn lies under it), an existing kerb
      selected, else a Road kerb's start or end on the road or its edge. */
  const clicked = (p: Picked | null) => {
    if (mode === "free" && p) void click(p.position[0], p.position[2], p.position[1]);
    else if (p?.kerbId && !start && kerbs.some(kerb => kerb.id === p.kerbId)) { setSelected(p.kerbId); onNote(null); }
    else if (p?.road || p?.inspection?.hovered.object.startsWith("1KERB_") || p?.inspection?.hovered.object.startsWith("nocol_road_edge_")) {
      void click(p!.position[0], p!.position[2], p!.position[1]);
    }
  };

  const dropPoint = () => { const points = freePoints.slice(0, -1); setFreePoints(points); void place(points); };
  return {
    start, busy, current, selected, setSelected, clear, click, clicked, mode, freePoints,
    setMode: switchMode,
    dropPoint,
    profile: current?.profile ?? profile, width: current?.width ?? width, height: current?.height ?? height,
    setProfile: (value: Profile) => change({profile: value}),
    setWidth: (value: number) => change({width: Math.min(KERB_MAX_WIDTH, Math.max(KERB_MIN_WIDTH, value))}),
    setHeight: (value: number) => change({height: Math.min(KERB_MAX_HEIGHT, Math.max(0, value))}),
    wheel,
  };
}

export type KerbTool = ReturnType<typeof useKerbTool>;

/** Racing kerb (B) as a tool: Road/Free by Shift, clicks, Backspace for a free kerb's last point, the wheel. onDelete: the
    selected kerb's Delete (the shared selection's, as X). */
export function useKerbs({onDelete, ...args}: KerbArgs & {onDelete: () => void}) {
  const kerb = useKerbTool(args);
  const controller: ToolController = {
    click: kerb.clicked, wheel: kerb.wheel, takesWheel: true, clear: kerb.clear,
    toggleMode: () => kerb.setMode(kerb.mode === "road" ? "free" : "road"),
    key: e => {
      if (e.key !== "Backspace" || kerb.mode !== "free" || !kerb.freePoints.length) return false;
      kerb.dropPoint();
      return true;
    },
    // (a kerb picked under Select becomes the selected range)
    activate: ({tool: from, picked}) => { if (from === "select" && picked?.kerbId) kerb.setSelected(picked.kerbId); },
    options: <KerbOptions kerb={kerb} view={args.view} onDelete={onDelete} />,
  };
  return {...kerb, controller};
}
