// Smooth road marks a connected network of road points. The orange footprint follows the retained paint masks.
import {useEffect, useEffectEvent, useState} from "react";
import {post} from "../api";
import type {TrackEdits} from "./edits";
import {INITIAL_SMOOTH_STRENGTH, SmoothSession} from "./smoothing";
import {MAX_PINS, type Pin} from "./pins";
import type {SurfaceSelection} from "./surfaces";
import type {Place, TrackView, WheelKeys} from "./view";

const APPLY_AFTER_MS = 180, PREVIEW_AFTER_MS = 120;
const MIN_BLEND = 2, MAX_BLEND = 60, INITIAL_BLEND = 6;
interface Way {lines?: Place[][]; region?: SurfaceSelection}

/** A road network and one replaceable smoothing operation. All geometry remains on the existing 2 m lattice. */
export function useBand({name, view, edits, enabled, revision, onNote}: {name: string; view: TrackView; edits: TrackEdits; enabled: boolean; revision: number;
  onNote: (text: string | null) => void}) {
  const [points, setPoints] = useState<Pin[]>([]);
  const [good, setGood] = useState<Pin[]>([]);
  const [lines, setLines] = useState<Place[][]>([]);
  const [blend, setBlendValue] = useState(INITIAL_BLEND);
  const [strength, setStrengthValue] = useState(INITIAL_SMOOTH_STRENGTH);
  const url = (what = "") => `/api/editor/${encodeURIComponent(name)}/band${what}`;
  const [smoothing] = useState(() => new SmoothSession(edits, body => post(url(), body)));

  const clear = () => {
    smoothing.reset(); setPoints([]); setGood([]); setLines([]);
    setBlendValue(INITIAL_BLEND); setStrengthValue(INITIAL_SMOOTH_STRENGTH);
    void view.setRoadRegion(null); void view.setRoadInfluence(null);
    view.setMarking(null);
  };

  useEffect(() => {
    if (points.length < 2 || points === good) return;
    let over = false;
    void post<Way>(url("/way"), {base: edits.boundRevision(), network: true, points}).then(async result => {
      if (over) return;
      if (result.error || !result.lines?.length || !result.region) {
        onNote(result.error ?? "No connected road area found");
        setPoints(previous => good.length ? good : previous.slice(0, 1));
        return;
      }
      try {
        await view.setRoadRegion(result.region);
        if (over) return;
        setGood(points); setLines(result.lines); onNote(null);
      } catch (error) {
        if (!over) onNote(error instanceof Error ? error.message : "Could not show the road area");
      }
    });
    return () => { over = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Points name the immutable source selection; good/onNote/url are recreated.
  }, [points, edits, view]);

  useEffect(() => {
    if (points.length !== 1 || !enabled) { view.setMarking(null); return; }
    let over = false, asking = false;
    let next: Pin | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ask = async (point: Pin) => {
      if (asking) { next = point; return; }
      asking = true;
      const result = await post<Way>(url("/way"), {base: edits.boundRevision(), network: true, points: [points[0], point]});
      if (!over && result.region) await view.setRoadRegion(result.region).catch(() => {});
      asking = false;
      if (!over && next) { const latest = next; next = null; void ask(latest); }
    };
    view.setMarking((x, z) => { clearTimeout(timer); timer = setTimeout(() => { void ask([x, z]); }, PREVIEW_AFTER_MS); });
    return () => { over = true; clearTimeout(timer); view.setMarking(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- The captured first point names the preview; source and view own its lifetime.
  }, [view, points, enabled, edits]);

  useEffect(() => {
    const single: Place[] | null = points.length === 1 ? [[points[0][0], view.heightOfGround(points[0][0], points[0][1]), points[0][1]]] : null;
    view.drawBand(single, 0); // Only the initial point has a cross; road regions use masks, never width lines.
    view.drawPins(enabled ? points.map(([x, z]) => [x, view.heightOfGround(x, z), z]) : []);
    return () => { view.drawBand(null, 0); view.drawPins([]); };
  }, [view, points, enabled]);

  const pinMoved = useEffectEvent((k: number, x: number, z: number) => {
    smoothing.cancel(); setPoints(points.map((p, n): Pin => n === k ? [x, z] : p)); onNote(null);
  });
  const pinTaken = useEffectEvent((k: number) => {
    smoothing.cancel();
    const left = points.filter((_, n) => n !== k);
    setPoints(left);
    if (left.length < 2) {
      smoothing.reset(); setGood([]); setLines([]); setStrengthValue(INITIAL_SMOOTH_STRENGTH);
      void view.setRoadRegion(null); void view.setRoadInfluence(null);
    }
    onNote(null);
  });
  useEffect(() => {
    view.setPinned((k, x, z) => pinMoved(k, x, z), k => pinTaken(k));
    return () => view.setPinned(() => {}, () => {});
  }, [view]);

  useEffect(() => {
    if (!enabled || !lines.length || points !== good) { smoothing.cancel(); return; }
    let over = false;
    const timer = setTimeout(() => {
      if (strength > 0) onNote("Smoothing road…");
      void smoothing.update(good, blend, strength).then(async result => {
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
  }, [enabled, lines, points, good, blend, strength, revision, smoothing, view]);

  useEffect(() => () => { smoothing.reset(); void view.setRoadRegion(null); void view.setRoadInfluence(null); }, [smoothing, view]);
  return {
    points, line: lines[0] ?? null, blend, strength, clear,
    start: (x: number, z: number) => { clear(); setPoints([[x, z]]); onNote(null); },
    click: (x: number, z: number) => {
      if (points.length >= MAX_PINS) return onNote(`A road network has at most ${MAX_PINS} points`);
      smoothing.cancel(); setPoints([...points, [x, z]]); onNote(points.length ? "Finding the connected road area…" : null);
    },
    setStrength: (value: number) => { smoothing.cancel(); onNote(null); setStrengthValue(Math.min(100, Math.max(0, value))); },
    setBlend: (value: number) => { smoothing.cancel(); onNote(null); setBlendValue(Math.min(MAX_BLEND, Math.max(MIN_BLEND, value))); },
    wheel: (keys: WheelKeys, by: number) => {
      smoothing.cancel();
      onNote(null);
      if (keys === "shift") setStrengthValue(value => Math.min(100, Math.max(0, value + by * 5)));
      else if (keys === "ctrl") setBlendValue(value => Math.min(MAX_BLEND, Math.max(MIN_BLEND, value + by)));
    },
  };
}
