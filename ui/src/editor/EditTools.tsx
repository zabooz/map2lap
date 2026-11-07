import {useCallback, useEffect, useEffectEvent, useState, useSyncExternalStore, type RefObject} from "react";
import {createPortal} from "react-dom";
import {BandOptions} from "./BandOptions";
import {CameraOptions, useCamera} from "./Camera";
import {TrackEdits, type EditState} from "./edits";
import {EditNotes} from "./EditNotes";
import {ElevationOptions, useElevation} from "./Elevation";
import {MoveOptions, useMove} from "./Move";
import {NOT_ALL, sortName} from "./inspect";
import {onBand} from "./pins";
import {SaveDialog} from "./SaveDialog";
import {FileButtons, TOOLS, ToolPanel, type Tool} from "./ToolPanel";
import {useBand} from "./useBand";
import {useSave} from "./useSave";
import type {Marked, MenuAt, Picked, TrackView} from "./view";
import {ViewMenu} from "./ViewMenu";

/** The track name's editing: which tool is on, what is picked or marked, the keys. Its buttons go into the sidebar (Save and Play in fileHost, ToolPanel in toolsHost), what is
    to be said below them (EditNotes in notesHost), while the state stays here by the view; over the view what the tool on can be set to (ToolOptions) and the right-click menu. Its keys count while the focus is in scene or in
    those hosts: V, R, X, C, M, H, T, Home, Delete, Esc, Enter, Ctrl+Z, Ctrl+Shift+Z (also Ctrl+Y), Ctrl+S. Mounted anew per track and build (a key in EditorScene). title: the track's; taken: the other
    tracks' titles. elevationSpeed: Elevation's while held, cm a second. onSaved: the track is saved as name (a copy: another one). */
export function EditTools({name, title, taken, view, scene, fileHost, savedHost, toolsHost, notesHost, elevationSpeed, reopen, onSaved}: {
  name: string;
  title: string;
  taken: string[];
  view: TrackView;
  scene: RefObject<HTMLDivElement | null>;
  fileHost: HTMLElement | null;
  savedHost: HTMLElement | null;
  toolsHost: HTMLElement | null;
  notesHost: HTMLElement | null;
  elevationSpeed: number;
  reopen: () => void;
  onSaved: (name: string) => void;
}) {
  const [edits] = useState(() => new TrackEdits(name));
  const state = useSyncExternalStore(edits.subscribe, edits.state);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [menu, setMenu] = useState<MenuAt | null>(null);
  const [marked, setMarked] = useState<Marked | null>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [note, setNote] = useState<string | null>(null);
  const [viewFailed, setViewFailed] = useState<string | null>(null);
  const editable = edits.canEdit();
  const elevating = tool === "elevation" && editable;
  const deleting = tool === "delete" && editable;
  const marking = (tool === "road" || tool === "smooth") && editable;
  const smoothing = tool === "smooth" && editable;
  const moving = tool === "move" && editable;
  const saving = useSave({name, edits, state, view, onSaved});
  const elevation = useElevation({name, view, edits, enabled: elevating, speed: elevationSpeed, onNote: setNote});
  const band = useBand({name, view, edits, enabled: marking, previewing: smoothing, revision: state.keptRevision, onNote: setNote});
  const camera = useCamera({view, enabled: tool === "camera", onNote: setNote});
  const move = useMove({view, edits, state, enabled: moving, picked, onNote: setNote});

  /** What a click picked; with Delete on, gone at once; Mark road's left button picks nothing. */
  const onPicked = useEffectEvent((p: Picked | null) => {
    if (marking && p?.left) return view.unpick();
    setPicked(p);
    setMarked(null);
    if (deleting && p?.id && p.left) {
      edits.remove([{id: p.id, position: p.position}]);
      view.unpick();
    }
  });

  /** With Mark road or Smooth on, a click on the road marks a band: A, B, a point in between; on grass or the sky the marking goes. */
  const onClicked = useEffectEvent((p: Picked | null) => {
    if (!marking) return;
    if (p?.road) band.click(p.road[0], p.road[1]);
    else if (!p?.id) band.clear();
  });

  useEffect(() => {
    view.setClicked(p => onClicked(p));
    return () => view.setClicked(() => {});
  }, [view]);

  useEffect(() => { view.setWheelTaken((band.line !== null && smoothing) || tool === "camera" || moving); }, [view, band.line, smoothing, tool, moving]);

  useEffect(() => { view.setAdding((tool === "select" || tool === "camera" || tool === "move") && editable); }, [view, tool, editable]);

  useEffect(() => {
    if (tool !== "road" && tool !== "smooth") band.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- (a tool that doesn't work on it ends the marking; band is new each time)
  }, [tool]);

  useEffect(() => {
    void edits.start();
    const leaving = () => edits.saveNow(true);
    window.addEventListener("pagehide", leaving);
    return () => {
      window.removeEventListener("pagehide", leaving);
      edits.stop();
    };
  }, [edits]);

  useEffect(() => {
    view.setPick(p => onPicked(p));
    view.setMenu(setMenu);
    view.setIndexed(revision => edits.bind(revision));
    return () => {
      view.setPick(() => {});
      view.setMenu(() => {});
      view.setIndexed(() => {});
    };
  }, [view, edits]);

  useEffect(() => { view.setRemoved(state.removed.map(r => r.id), state.sorts, state.objectSorts); },
            [view, state.removed, state.sorts, state.objectSorts]);

  useEffect(() => {
    view.setMarked(marked);
    return () => view.setMarked(null);
  }, [view, marked]);

  useEffect(() => {
    edits.setOnMeshes((meshes, revision) => view.refreshMeshes(meshes, revision));
    view.setViewFailed(setViewFailed);
    return () => {
      edits.setOnMeshes(() => {});
      view.setViewFailed(() => {});
    };
  }, [view, edits]);

  const toolWheel = useEffectEvent((keys: Parameters<typeof elevation.wheel>[0], by: number) => {
    if (tool === "camera") camera.wheel(keys, by);
    else if (tool === "move") move.wheel(keys, by);
    else if (tool === "smooth") band.wheel(keys, by);
    else elevation.wheel(keys, by);
  });

  useEffect(() => {
    view.setToolWheel((keys, by) => toolWheel(keys, by));
    return () => view.setToolWheel(() => {});
  }, [view]);

  /** The list read again, and if it is of another build than the view shows, the track too. */
  const readAgain = async () => {
    const meshesOf = (s: EditState) => JSON.stringify([s.heights.map(h => h.id), s.placed]);
    const shown = meshesOf(state);
    await edits.start();
    if (edits.viewBehind() || meshesOf(edits.state()) !== shown) reopen();     // (the meshes as the list it read says)
  };

  const removable = picked?.all ?? [];
  const ids = state.removed.map(r => r.id);
  const sort = picked?.id && picked.sort && !NOT_ALL.has(picked.sort) ? picked.sort : null;
  const tree = picked?.id && picked.sprite ? picked.sprite : null;
  const markLabel = !menu ? null : sort ? `Mark all ${sortName(sort)} (${view.countOfListed(sort, ids, state.objectSorts)})`
    : tree ? `Mark all ${tree} (loaded: ${view.countOf(tree)})` : null;

  const remove = () => {
    if (!editable) return;
    if (marked) {               // (all of the marked sort, as a rule)
      if (marked.tree) edits.removeSort(marked.sort);
      else edits.removeObjectSort(marked.sort);
      setMarked(null);
      view.unpick();
    } else if (removable.length) {      // (one undo step, however many)
      edits.remove(removable);
      view.unpick();
    }
  };
  /** A tool taken up, the one on laid down: Select. */
  const takeUp = (t: Tool) => setTool(tool === t ? "select" : t);
  const closeMenu = useCallback(() => setMenu(null), []);

  // (an effect event: Delete pressed right after a click reaches what that click picked, not the list of keys before it)
  const keys = useEffectEvent((e: KeyboardEvent) => {
    const control = e.ctrlKey || e.metaKey, key = e.key.toLowerCase();
    if (saving.asking) {        // (the dialog's name field keeps its own keys; Ctrl+S isn't the browser's)
      if (control && key === "s") e.preventDefault();
      return;
    }
    if (e.key !== "Escape" && e.key !== "Enter" && (e.target as HTMLElement).tagName === "INPUT") return;      // (a tool's number keeps its own keys)
    const keyed = control ? undefined : TOOLS.find(t => t.key.toLowerCase() === key);
    if (e.key === "Delete") remove();
    else if (e.key === "Escape") {
      setMenu(null);
      setMarked(null);
      view.cancelStroke();
      view.unpick();
      setTool("select");        // (with it go a marking and a ride)
      view.focus();
    } else if (e.key === "Enter" && smoothing && band.apply()) view.focus();
    else if ((marked || removable.length) && !control && key === "x") remove();      // (what is picked or marked is what X is there to delete; nothing: its tool)
    else if (keyed) takeUp(keyed.tool);
    else if (e.key === "Home") view.home();
    else if (control && key === "z") {
      void edits.inTurn(() => (e.shiftKey ? edits.redo() : edits.undo()));
    } else if (control && key === "y") void edits.inTurn(() => edits.redo());
    else if (control && key === "s") void saving.save();
    else return;
    e.preventDefault();
  });

  useEffect(() => {
    const on = [scene.current!, fileHost, toolsHost, notesHost], listen = (e: KeyboardEvent) => keys(e);
    for (const el of on) el?.addEventListener("keydown", listen);
    return () => { for (const el of on) el?.removeEventListener("keydown", listen); };
  }, [scene, fileHost, toolsHost, notesHost]);

  const clickedOnBand = tool === "road" && !!band.line && !!picked && onBand(band.line, band.width, picked.position[0], picked.position[2]);

  return (
    <>
      {fileHost && createPortal(<FileButtons state={state} edits={edits} view={view} saving={saving} />, fileHost)}
      {savedHost && createPortal(saving.savedText, savedHost)}
      {toolsHost && createPortal(<ToolPanel state={state} edits={edits} view={view} tool={tool} onTool={t => { takeUp(t); setNote(null); }} />, toolsHost)}
      {notesHost && createPortal(
        <EditNotes state={state} edits={edits} view={view} note={note} viewFailed={viewFailed} saveFailed={saving.failed} picked={marking && !picked?.id ? null : picked} sort={sort}
                   markedName={marked && (marked.tree ? marked.sort : sortName(marked.sort))} reopen={reopen} readAgain={() => void readAgain()} />, notesHost)}
      {elevating && <ElevationOptions elevation={elevation} view={view} />}
      {marking && <BandOptions band={band} smoothing={smoothing} />}
      {tool === "camera" && <CameraOptions camera={camera} view={view} />}
      {moving && <MoveOptions move={move} view={view} />}
      {menu && (
        <ViewMenu at={menu} mark={editable ? markLabel : null} canDelete={removable.length > 0 && editable} onClose={closeMenu}
                  onSmooth={clickedOnBand ? () => { setTool("smooth"); setNote(null); view.focus(); } : null}
                  onMark={() => { setMarked(sort ? {sort, tree: false} : {sort: tree!, tree: true}); view.focus(); }}
                  onDelete={() => { remove(); view.focus(); }} />
      )}
      {saving.asking && <SaveDialog title={title} taken={taken} canOverwrite={saving.canSave} onOverwrite={() => void saving.chosen(null)}
                                    onSaveNew={t => void saving.chosen(t)} onCancel={saving.cancel} />}
    </>
  );
}
