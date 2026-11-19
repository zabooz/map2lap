// The shared selection every tool reads: what is picked, the marked sorts, picked ground surfaces and a connected section. A
// pick is taken under the selection rule of the tool on (toolDefs.SelectionRule); X, Delete and Delete's One click remove it.
import {useCallback, useEffect, useState} from "react";
import type {KerbEdit, TrackEdits} from "../state/edits";
import type {Marked, Picked} from "../types";
import type {TrackView} from "../scene/view";
import {pickedSurfaces, type SurfacePoint, type SurfaceSelection} from "../scene/surfaces";
import {NOT_ALL} from "../scene/inspect";
import {Latest} from "./latest";
import {findSection, sectionKind, SECTION_TEXT, showSection, type Section, type SectionKind} from "./sections";
import type {SelectionRule} from "./toolDefs";

const VERGE_DELETED = "Road verge deleted. Undo brings it back.";

/** The selection on view. name: the track's. editable: the track can be changed now. kerbs: the draft's racing kerbs (a picked
    kerb is a draft range, not an object). onKerbRemoved: a picked kerb was deleted. onNote: what to say. */
export function useSelection({name, view, edits, editable, kerbs, onKerbRemoved, onNote}: {name: string; view: TrackView; edits: TrackEdits;
  editable: boolean; kerbs: KerbEdit[]; onKerbRemoved: () => void; onNote: (text: string | null) => void}) {
  const [picked, setPicked] = useState<Picked | null>(null);
  const [marked, setMarked] = useState<Marked[]>([]);
  const [surfacePicks, setSurfacePicks] = useState<SurfacePoint[]>([]);
  const [surfaceInfo, setSurfaceInfo] = useState<{points: SurfacePoint[]; selection: SurfaceSelection | null} | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [requests] = useState(() => new Latest());     // (a section answered after another pick or a tool change is not shown)
  const onSurface = useCallback((selection: SurfaceSelection | null) => setSurfaceInfo({points: surfacePicks, selection}), [surfacePicks]);
  const surface = surfaceInfo?.points === surfacePicks ? surfaceInfo.selection : null;
  // (a selected stretch of road verge, or all of it loaded with Shift: Delete takes those triangles)
  const vergeCuts = surface?.meshes?.length && !surface.tiles.length ? view.objects.surfaceCuts(surface.meshes) : null;
  const removable = picked?.all ?? [];

  useEffect(() => {
    view.selection.setMarked(marked);
    return () => view.selection.setMarked(null);
  }, [view, marked]);

  /** The connected stretch of road verge at a picked point, as cuts of the draft; null if it is no verge or no longer loaded. */
  const vergeAt = (point: SurfacePoint) => {
    try { return view.objects.surfaceCuts(view.materialSelection(point).meshes ?? []); } catch { return null; }
  };

  /** A picked kerb is a draft range, not an object in the selection index. */
  const removeKerb = (id: string) => {
    if (!editable || !kerbs.some(kerb => kerb.id === id)) return;
    edits.removeKerb(id);
    onKerbRemoved();
    onNote("Kerb deleted. Undo brings it back.");
    view.selection.unpick();
  };

  /** The connected section of kind at p: shown, or deleted at once in turn with Undo and Save (deleteNow: Delete's left click,
      which completes even when picks follow it). */
  const pickSection = (p: Picked, kind: SectionKind, deleteNow: boolean) => {
    const token = requests.next(), text = SECTION_TEXT[kind];
    setSurfacePicks([]); setSection(null); void view.setSurface(null);
    onNote(text.selecting);
    const received = async (found: Awaited<ReturnType<typeof findSection>>) => {
      if (!deleteNow && !requests.current(token)) return;
      if ("error" in found) { onNote(found.error); return; }
      if (deleteNow) {
        onNote(edits.removeSurfaceSection(found.cuts, found.objects) ? text.deleted : text.already);
      } else {
        await showSection(found, {current: () => requests.current(token), select: setSection, highlight: selection => view.setSurface(selection), note: onNote});
      }
    };
    if (deleteNow) void edits.inTurn(async () => received(await findSection(name, edits.boundRevision(), p, kind)));
    else void findSection(name, edits.boundRevision(), p, kind).then(received);
  };

  /** Delete's left click: the kerb, object or stretch of road verge under it goes. */
  const deleteAt = (p: Picked) => {
    if (p.kerbId) removeKerb(p.kerbId);
    else if (p.id) {
      edits.remove([{id: p.id, position: p.position}]);
      view.selection.unpick();
    } else if (p.surface?.face !== undefined) {
      // (the road verge is no object: a click takes the connected stretch of it, by its triangles)
      const cuts = vergeAt(p.surface);
      if (cuts) { edits.removeSurfaces(cuts); onNote(VERGE_DELETED); }
      view.selection.unpick();
    } else onNote("Nothing editable at this point.");
  };

  /** A pick (null: nothing) taken under rule: select and delete take connected sections whole; select keeps ground surfaces
      and Shift's whole sort; delete deletes a left pick at once. */
  const take = (p: Picked | null, rule: SelectionRule) => {
    setPicked(p);
    const kind = rule === "select" || rule === "delete" ? sectionKind(p) : null;
    if (kind && p) return pickSection(p, kind, rule === "delete" && p.left);
    requests.drop();
    if (section) { setSection(null); void view.setSurface(null); }
    if (!p?.adding && !p?.keeping) setMarked([]);
    if (rule === "select") setSurfacePicks(previous => pickedSurfaces(previous, p));
    else if (!p?.adding) setSurfacePicks([]);
    if (rule === "select" && p?.whole && p.id) {
      const group = p.sort && !NOT_ALL.has(p.sort) ? {sort: p.sort} : null;
      if (group) setMarked(previous => [...(p.adding ? previous : []).filter(g => g.sort !== group.sort), group]);
    }
    if (rule === "delete" && p?.left) deleteAt(p);
  };

  /** X, Delete or a Delete button: the section, the kerb (the one a tool shows), the road verge (cuts) or the picked and marked
      objects, each as one Undo step. */
  const remove = (kerb: KerbEdit | null, cuts = vergeCuts) => {
    if (!editable) return;
    if (section) {
      edits.removeSurfaceSection(section.cuts, section.objects);
      setSection(null); void view.setSurface(null);
      onNote(section.kind === "rail" ? "Railway section deleted. Ctrl+Z restores it." : "Selected section deleted. Ctrl+Z restores it.");
      view.selection.unpick();
    } else if (kerb) {
      removeKerb(kerb.id);
    } else if (cuts) {
      edits.removeSurfaces(cuts);
      setSurfacePicks([]);
      onNote(VERGE_DELETED);
      view.selection.unpick();
    } else if (marked.length || removable.length) {
      edits.removeSelected(view.selection.selectedOutside(marked), marked);
      setMarked([]);
      view.selection.unpick();
    }
  };

  return {
    picked, marked, setMarked, surfacePicks, setSurfacePicks, surface, onSurface, section, vergeCuts, vergeAt, removable,
    take, remove,
    /** Whether X has something to delete (else it takes up Delete). kerb: the one the Inspector shows. */
    deletable: (kerb: KerbEdit | null) => !!(marked.length || removable.length || vergeCuts || kerb || section),
    /** A tool taken up: requests on their way are dropped. */
    dropRequests: () => requests.drop(),
    /** A tool taken up by its button or key: the section and ground surfaces let go. */
    release: () => { requests.drop(); setSection(null); void view.setSurface(null); setSurfacePicks([]); },
  };
}
