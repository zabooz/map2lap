// One racing kerb follows a selected mapped road stretch and is kept in the Editor draft.
import {useEffect, useState} from "react";
import {post} from "../../api";
import {KERB_MAX_HEIGHT, KERB_MAX_WIDTH, KERB_MIN_WIDTH, type KerbEdit, type TrackEdits} from "../state/edits";
import type {TrackView} from "../scene/view";
import type {WheelKeys} from "../types";

type Side = KerbEdit["side"];
type Profile = KerbEdit["profile"];
const centimetres = (value: number) => Math.round(value * 100) / 100;

/** Two road clicks make one independently editable, undoable racing kerb. */
export function useKerbs({name, view, edits, kerbs, enabled, highlightId, onNote}: {name: string; view: TrackView; edits: TrackEdits;
  kerbs: KerbEdit[]; enabled: boolean; highlightId: string | null; onNote: (text: string | null) => void}) {
  const [start, setStart] = useState<[number, number, number] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>("rounded");
  const [width, setWidth] = useState(0.45);
  const [height, setHeight] = useState(0.06);
  const [busy, setBusy] = useState(false);
  const current = kerbs.find(k => k.id === selected) ?? null;
  const highlighted = enabled ? current : kerbs.find(k => k.id === highlightId) ?? null;
  const clear = () => { setStart(null); setSelected(null); onNote(null); };

  const change = (patch: Partial<Pick<KerbEdit, "profile" | "width" | "height">>) => {
    if (current) edits.updateKerb(current.id, patch);
    if (patch.profile) setProfile(patch.profile);
    if (patch.width !== undefined) setWidth(patch.width);
    if (patch.height !== undefined) setHeight(patch.height);
  };

  const click = async (x: number, z: number, y: number) => {
    if (!enabled || busy) return;
    if (!start) { setStart([x, z, y]); setSelected(null); onNote("Mark the end of the kerb on the same road. The first click chooses its edge."); return; }
    setBusy(true);
    onNote("Following the selected road edge…");
    const result = await post<{line: KerbEdit["line"]; side: Side}>(`/api/editor/${encodeURIComponent(name)}/kerb/way`,
      {base: edits.boundRevision(), points: [start, [x, z, y]], width});
    setBusy(false);
    if (result.error || !result.line || !result.side) { onNote(result.error ?? "No connected road stretch found"); return; }
    const id = crypto.randomUUID();
    edits.addKerb({id, line: result.line, side: result.side, profile, width, height});
    setStart(null); setSelected(id); onNote(`Kerb added on the ${result.side} edge. Change its height or profile, or mark another range.`);
  };

  useEffect(() => {
    if (!enabled && !highlighted) return;
    if (enabled) view.drawBand(start ? [[start[0], start[2], start[1]]] : null, 0);
    view.highlightKerb(highlighted?.id ?? null);
    return () => { view.drawBand(null, 0); view.highlightKerb(null); };
  }, [enabled, view, start, highlighted]);

  return {
    start, busy, current, selected, setSelected, clear, click,
    profile: current?.profile ?? profile, width: current?.width ?? width, height: current?.height ?? height,
    setProfile: (value: Profile) => change({profile: value}),
    setWidth: (value: number) => change({width: Math.min(KERB_MAX_WIDTH, Math.max(KERB_MIN_WIDTH, value))}),
    setHeight: (value: number) => change({height: Math.min(KERB_MAX_HEIGHT, Math.max(0, value))}),
    wheel: (keys: WheelKeys, by: number) => {
      if (keys === "shift") change({width: Math.min(KERB_MAX_WIDTH, Math.max(KERB_MIN_WIDTH, centimetres((current?.width ?? width) + by * 0.05)))});
      else if (keys === "ctrl") change({height: Math.min(KERB_MAX_HEIGHT, Math.max(0, centimetres((current?.height ?? height) + by * 0.01)))});
      else if (keys === "alt") {
        const profiles: Profile[] = ["flat", "rounded", "ribbed"];
        const index = profiles.indexOf(current?.profile ?? profile);
        change({profile: profiles[(index + by + profiles.length) % profiles.length]});
      }
    },
  };
}
