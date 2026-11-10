import {useEffect, useEffectEvent, useState} from "react";
import {post} from "../../api";
import type {TrackEdits, ModelInstance} from "../state/edits";
import type {LibraryModel} from "../library/ModelLibrary";
import type {TrackView} from "../scene/view";
import type {GroupPlant} from "../scene/groupDraw";
import type {Sample, WheelKeys} from "../types";
import type {Placement} from "./placing";
import type {ObjectGroup} from "./scatter";
import {ScatterWorker} from "./scatterWorker";
import {stepped} from "./useBrush";
import {ToolNumber, ToolOptions} from "./ToolOptions";

const HOVER = "hover";       // (the group the ring shows before a click)

/** A browser-only mixture preview becomes one ordinary batch of model bindings and poses per completed stroke. */
export function Groups({name, view, edits, group, models, enabled, onWheel, onFailed}: {name: string; view: TrackView; edits: TrackEdits;
  group: ObjectGroup | null; models: LibraryModel[]; enabled: boolean; onWheel: (wheel: (keys: WheelKeys, by: number) => void) => void;
  onFailed: (message: string) => void}) {
  const [radius, setRadius] = useState(10), [density, setDensity] = useState(10), [spacing, setSpacing] = useState(2);
  const [note, setNote] = useState<string | null>(null);
  const occupied = useEffectEvent(() => {
    const state = edits.state(), placed = new Map(state.placed.map(p => [p.id, p])), removed = new Set(state.removed.map(p => p.id));
    return state.models.filter(m => !removed.has(m.id + "#0")).map(m => ({x: m.at[0] + (placed.get(m.id + "#0")?.x ?? 0), z: m.at[2] + (placed.get(m.id + "#0")?.z ?? 0)}));
  });
  useEffect(() => {
    if (!enabled) return;
    onWheel((keys, by) => {
      if (keys === "shift") setRadius(r => stepped(r, by, .5, .5, 500));
      else if (keys === "ctrl") setDensity(d => stepped(d, by, 1, 1, 1000));
      else if (keys === "alt") setSpacing(s => stepped(s, by, .1, .1, 100));
    });
    return () => onWheel(() => {});
  }, [enabled, onWheel]);
  useEffect(() => {
    if (!enabled || !group) return;
    const worker = new ScatterWorker(), queued = new Map<string, GroupPlant[]>();
    let closing = false, finishing = 0;
    let calculations = Promise.resolve();
    interface Stroke {key: string; seed: number; version: number}
    let current: Stroke | null = null;
    // The next stroke's seed is drawn before it: the ring shows what a click with it would plant, and the click plants just that.
    const newSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];
    let nextSeed = newSeed();
    const stroke = () => {
      if (!current) { current = {key: crypto.randomUUID(), seed: nextSeed, version: 0}; nextSeed = newSeed(); ringAt = null; void view.dropGroup(HOVER); }
      return current;
    };
    // While the ring moves without a stroke, what a click there would plant, cheaply: the brush's own scatter, every plant at the ring's
    // ground height (no ground looked up under each; a slope shows them floating or sunk until the click sets each on its ground).
    let ringAt: [number, number, number] | null = null, hovering = false;
    const hover = async () => {
      if (hovering) return;
      hovering = true;
      try {
        for (let at = ringAt; at && !closing && !current; at = ringAt === at ? null : ringAt) {
          const result = await worker.run([[at[0], at[2], 0]], {entries: group.entries, radius, density, spacing, seed: nextSeed, regular: group.randomPosition === false},
            [...occupied(), ...[...queued.values()].flat().map(p => ({x: p.at[0], z: p.at[2]}))]);
          if (closing || current || ringAt !== at) continue;
          await view.showGroup(HOVER, result.plants.map(p => ({model: p.model, at: [p.x, at[1], p.z] as [number, number, number], turn: p.turn, scale: p.scale})), models);
        }
      } catch { /* (a hover that fails shows nothing; the click says why) */ }
      finally { hovering = false; }
      if (!ringAt && !current) void view.dropGroup(HOVER);
    };
    view.setRingMoved(at => { ringAt = at; if (at) void hover(); else void view.dropGroup(HOVER); });
    const calculate = async (samples: Sample[], s: Stroke) => {
      const result = await worker.run(samples, {entries: group.entries, radius, density, spacing, seed: s.seed, regular: group.randomPosition === false},
        [...occupied(), ...[...queued.values()].flat().map(p => ({x: p.at[0], z: p.at[2]}))]);
      const plants: GroupPlant[] = [], feet = await view.groupFeet(models);
      for (let i = 0; i < result.plants.length; i++) {
        const p = result.plants[i], at = view.plantGround(p.x, p.z, feet[p.model] * p.scale);
        if (at) plants.push({model: p.model, at, turn: p.turn, scale: p.scale});
        if (i % 100 === 99) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      }
      return {...result, plants};
    };
    view.setBrush({radius, colour: "#72b96a", turnedColour: "#72b96a"});
    view.setStroke(samples => {
      const s = stroke(); current = null; s.version++; finishing++;
      // Local calculation starts immediately, while the queue reserves the click's place before a later Undo or Save.
      const ready = calculations.then(async () => {
        const result = await calculate(samples, s); queued.set(s.key, result.plants); return result;
      });
      calculations = ready.then(() => {}, () => {});
      const shown = ready.then(async ({plants, limited}) => {
        if (plants.length) await view.showGroup(s.key, plants, models);
        if (!closing) setNote(!plants.length ? "No loaded ground fits this mixture. Try a larger brush or higher density."
          : `${plants.length} plants${limited ? " (stroke limit reached; use another stroke for more)" : ""}.`);
        return plants;
      });
      // Attach a handler now: an earlier queued stroke may still be saving when this preview fails.
      void shown.catch(() => {});
      void edits.inTurn(async () => {
        let confirmed = false;
        let created: string[] = [];
        try {
          const plants = await shown;
          if (!plants.length) return;
          edits.saveNow(); const revision = await edits.saved();
          if (revision === null || !edits.canEdit()) throw new Error("This track cannot be edited right now.");
          const answer = await post<{models?: ModelInstance[]; placed?: Placement[]}>(`/api/editor/${encodeURIComponent(name)}/model`,
            {base: edits.boundRevision(), revision, instances: plants});
          if (answer.error || answer.models?.length !== plants.length || !answer.placed) throw new Error(answer.error ?? "Could not place this group.");
          view.confirmGroup(s.key, answer.models.map(m => m.id), revision);
          created = answer.models.map(m => m.id);
          edits.addModels(answer.models, answer.placed); edits.saveNow();
          if (await edits.saved() === null) throw new Error(edits.state().error ?? "Could not keep this group.");
          confirmed = true;
        } catch (error) { if (created.length) edits.rejectModels(created); setNote((error as Error).message); onFailed((error as Error).message); }
        finally { queued.delete(s.key); if (!confirmed) await view.dropGroup(s.key); }
      })
        .finally(() => { finishing--; if (closing && !finishing) worker.dispose(); });
    }, async samples => {
      const s = stroke(), version = ++s.version;
      try {
        const {plants} = await calculate(samples, s);
        if (!closing && current === s && s.version === version) await view.showGroup(s.key, plants, models);
      } catch (error) { if (!closing && current === s) return (error as Error).message; }
      return null;
    }, why => setNote(why), () => { if (current) { void view.dropGroup(current.key); current = null; } });
    return () => {
      closing = true; view.setRingMoved(null); void view.dropGroup(HOVER); view.cancelStroke(); view.setBrush(null);
      view.setStroke(() => {}, () => Promise.resolve(null), () => {});
      if (current) void view.dropGroup(current.key);
      if (!finishing) worker.dispose();
    };
  }, [enabled, group, models, radius, density, spacing, view, edits, name, onFailed]);
  if (!enabled || !group) return null;
  return <ToolOptions id="edit-group-set" title={group.name} note={note ?? "Click to stamp, or drag to paint. Esc ends the brush; Undo removes one whole stroke."}
    options={[
      <ToolNumber label="Radius" unit="m" hint="Brush radius (Shift + wheel)" value={radius} min={.5} max={500} step={.5} onChange={setRadius} />,
      <ToolNumber label="Density" unit="/100 m²" hint="Requested plants per 100 square metres (Ctrl + wheel)" value={density} min={1} max={1000} step={1} onChange={setDensity} />,
      <ToolNumber label="Spacing" unit="m" hint="Minimum foot-to-foot distance (Alt + wheel)" value={spacing} min={.1} max={100} step={.1} onChange={setSpacing} />,
    ]} />;
}
