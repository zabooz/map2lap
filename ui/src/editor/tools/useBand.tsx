// Smooth road marks a connected network in green; signed masks show where its full correction would lower or raise it.
import {useEffect, useEffectEvent, useState} from "react";
import {post} from "../../api";
import type {TrackEdits} from "../state/edits";
import {INITIAL_SMOOTH_STRENGTH, SmoothSession} from "./smoothing";
import {MAX_PINS, type Pin} from "./pins";
import type {SurfaceSelection} from "../scene/surfaces";
import type {Picked, Place, WheelKeys} from "../types";
import type {TrackView} from "../scene/view";
import {BandOptions} from "./BandOptions";
import {smoothStart} from "./selectActions";
import type {ToolController} from "./toolHost";

// (a wheel's notches come closer than APPLY_AFTER_MS: one request; a digit typed after another may start one, the session then asks only the newest)
const APPLY_AFTER_MS = 80, PREVIEW_AFTER_MS = 120;
const MIN_BLEND = 2, MAX_BLEND = 60, INITIAL_BLEND = 6;
interface Difference {above: SurfaceSelection; below: SurfaceSelection}
interface Way {lines?: Place[][]; region?: SurfaceSelection; difference?: Difference; difference_error?: string; width?: number}
const MIN_STRIP = 2, MAX_STRIP = 40;

interface BandArgs {name: string; view: TrackView; edits: TrackEdits; enabled: boolean; revision: number; onNote: (text: string | null) => void}

/** A road network and one replaceable smoothing operation. All geometry remains on the existing 2 m lattice. */
function useBandTool({name, view, edits, enabled, revision, onNote}: BandArgs) {
  const [points, setPoints] = useState<Pin[]>([]);
  const [good, setGood] = useState<Pin[]>([]);
  const [lines, setLines] = useState<Place[][]>([]);
  const [blend, setBlendValue] = useState(INITIAL_BLEND);
  const [strength, setStrengthValue] = useState(INITIAL_SMOOTH_STRENGTH);
  const [strip, setStripValue] = useState<number | null>(null);   // null: the mapped roads decide the area; a width: a strip around the marked lines
  const [mappedWidth, setMappedWidth] = useState<number | null>(null);
  const stripWidth = (value: number) => Math.min(MAX_STRIP, Math.max(MIN_STRIP, Math.round(value * 10) / 10));
  const url = (what = "") => `/api/editor/${encodeURIComponent(name)}/band${what}`;
  const [smoothing] = useState(() => new SmoothSession(edits, body => post(url(), body)));

  const clear = () => {
    smoothing.reset(); setPoints([]); setGood([]); setLines([]); setMappedWidth(null);
    setBlendValue(INITIAL_BLEND); setStrengthValue(INITIAL_SMOOTH_STRENGTH);
    void view.setRoadRegion(null); void view.setRoadInfluence(null); void view.setRoadDifference(null);
    view.setMarking(null);
  };

  useEffect(() => {
    if (points.length < 2) return;
    let over = false;
    void post<Way>(url("/way"), {base: edits.boundRevision(), network: true, points, preview: true,
      blend, strip: strip ?? undefined}).then(async result => {
      if (over) return;
      if (result.error || !result.lines?.length || !result.region) {
        onNote(result.error ?? "No connected road area found");
        setPoints(previous => good.length ? good : previous.slice(0, 1));
        return;
      }
      try {
        await view.setRoadRegion(result.region);
        if (over) return;
        await view.setRoadDifference(result.difference ?? null);
        if (over) return;
        setGood(points); setLines(result.lines); setMappedWidth(result.width ?? null); onNote(result.difference_error ?? null);
      } catch (error) {
        if (!over) onNote(error instanceof Error ? error.message : "Could not show the road area");
      }
    });
    return () => { over = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- The kept revision names the saved road height; good/onNote/url are recreated.
  }, [points, edits, view, blend, revision, strip]);

  useEffect(() => {
    if (points.length !== 1 || !enabled) { view.setMarking(null); return; }
    let over = false, asking = false;
    let next: Pin | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ask = async (point: Pin) => {
      if (asking) { next = point; return; }
      asking = true;
      const result = await post<Way>(url("/way"), {base: edits.boundRevision(), network: true, points: [points[0], point], strip: strip ?? undefined});
      if (!over && result.region) await view.setRoadRegion(result.region).catch(() => {});
      asking = false;
      if (!over && next) { const latest = next; next = null; void ask(latest); }
    };
    view.setMarking((x, z) => { clearTimeout(timer); timer = setTimeout(() => { void ask([x, z, view.heightOfGround(x, z)]); }, PREVIEW_AFTER_MS); });
    return () => { over = true; clearTimeout(timer); view.setMarking(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- The captured first point names the preview; source and view own its lifetime.
  }, [view, points, enabled, edits, strip]);

  useEffect(() => {
    if (!enabled) return;
    const single: Place[] | null = points.length === 1 ? [[points[0][0], points[0][2] ?? view.heightOfGround(points[0][0], points[0][1]), points[0][1]]] : null;
    view.drawBand(single, 0); // Only the initial point has a cross; road regions use masks, never width lines.
    view.drawPins(enabled ? points.map(([x, z, y]) => [x, y ?? view.heightOfGround(x, z), z]) : []);
    return () => { view.drawBand(null, 0); view.drawPins([]); };
  }, [view, points, enabled]);

  const pinMoved = useEffectEvent((k: number, x: number, z: number) => {
    smoothing.cancel(); void view.setRoadDifference(null);
    setPoints(points.map((p, n): Pin => n === k ? [x, z, view.heightOfGround(x, z)] : p)); onNote(null);
  });
  const pinTaken = useEffectEvent((k: number) => {
    smoothing.cancel();
    const left = points.filter((_, n) => n !== k);
    setPoints(left);
    if (left.length < 2) {
      smoothing.reset(); setGood([]); setLines([]); setStrengthValue(INITIAL_SMOOTH_STRENGTH);
      void view.setRoadRegion(null); void view.setRoadInfluence(null); void view.setRoadDifference(null);
    }
    onNote(null);
  });
  useEffect(() => {
    if (!enabled) return;
    view.setPinned((k, x, z) => pinMoved(k, x, z), k => pinTaken(k));
    return () => view.setPinned(() => {}, () => {});
  }, [view, enabled]);

  useEffect(() => {
    if (!enabled || !lines.length || points !== good) { smoothing.cancel(); return; }
    let over = false;
    const timer = setTimeout(() => {
      if (strength > 0) onNote("Smoothing road…");
      void smoothing.update(good, blend, strength, strip).then(async result => {
        if (over) return;
        if (result.state === "undone") clear();
        else if (result.state === "error") onNote(`Not changed: ${result.message}`);
        else if (result.state === "applied") {
          onNote(result.message ?? null);
          await view.setRoadInfluence(result.influence ?? null).catch(error => { if (!over) onNote(String(error.message ?? error)); });
        // A rejected pin restores good points and reruns this timer at strength zero. That no-op owns no status to clear.
        } else if (result.state === "unchanged" && strength > 0) onNote(null);
      });
    }, APPLY_AFTER_MS);
    return () => { over = true; clearTimeout(timer); smoothing.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Range/settings and saved revision determine the operation; clear/onNote are recreated.
  }, [enabled, lines, points, good, blend, strength, revision, smoothing, view, strip]);

  // Road (the mapped roads' own ground) and Free (a width around the marked road); Shift pressed and let go alone (toolHost).
  const toggleFree = () => {
    smoothing.cancel(); onNote(null);
    setStripValue(previous => previous === null ? stripWidth(mappedWidth ?? 8) : null);
  };

  useEffect(() => () => { smoothing.reset(); void view.setRoadRegion(null); void view.setRoadInfluence(null); void view.setRoadDifference(null); }, [smoothing, view]);
  return {
    points, line: lines[0] ?? null, blend, strength, clear, strip, mappedWidth, toggleFree,
    /** Strip mode on (at the mapped width, else 8 m) or off; a number sets its width. */
    setStrip: (value: number | boolean) => {
      smoothing.cancel(); onNote(null);
      setStripValue(previous => value === false ? null : value === true ? (previous ?? stripWidth(mappedWidth ?? 8)) : stripWidth(value));
    },
    start: (x: number, z: number, y = view.heightOfGround(x, z)) => { clear(); setPoints([[x, z, y]]); onNote(null); },
    click: (x: number, z: number, y = view.heightOfGround(x, z)) => {
      if (points.length >= MAX_PINS) return onNote(`A road network has at most ${MAX_PINS} points`);
      smoothing.cancel(); void view.setRoadDifference(null);
      setPoints([...points, [x, z, y]]); onNote(points.length ? "Finding the connected road area…" : null);
    },
    setStrength: (value: number) => { smoothing.cancel(); onNote(null); setStrengthValue(Math.min(100, Math.max(0, value))); },
    setBlend: (value: number) => { smoothing.cancel(); onNote(null); setBlendValue(Math.min(MAX_BLEND, Math.max(MIN_BLEND, value))); },
    wheel: (keys: WheelKeys, by: number) => {
      smoothing.cancel();
      onNote(null);
      if (keys === "ctrl") setStrengthValue(value => Math.min(100, Math.max(0, value + by * 5)));
      else if (keys === "alt") setStripValue(value => value === null ? null : stripWidth(value + by * 0.5));
      else if (keys === "ctrlAlt") setBlendValue(value => Math.min(MAX_BLEND, Math.max(MIN_BLEND, value + by)));
    },
  };
}

export type BandTool = ReturnType<typeof useBandTool>;

/** Smooth road (R) as a tool: road points by clicks (grass or sky clears the range), Road/Free by Shift, the wheel once a road
    is marked; taken up from Select with a road picked it starts there. */
export function useBand(args: BandArgs) {
  const band = useBandTool(args);
  const controller: ToolController = {
    click: (p: Picked | null) => {
      if (p?.road) band.click(p.road[0], p.road[1], p.position[1]);
      else if (!p?.id) band.clear();
    },
    wheel: band.wheel, takesWheel: band.line !== null, toggleMode: band.toggleFree, clear: band.clear,
    activate: ({tool: from, picked}) => {
      const road = smoothStart(from, "smooth", picked);
      if (road) band.start(road[0], road[1], picked?.position[1]);
    },
    options: <BandOptions band={band} view={args.view} />,
  };
  return {...band, controller};
}
