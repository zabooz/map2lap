import {useCallback, useEffect, useEffectEvent, useRef, useState, useSyncExternalStore, type RefObject} from "react";
import {createPortal} from "react-dom";
import {BandOptions} from "./BandOptions";
import {CameraOptions, useCamera} from "./Camera";
import {CopyTool} from "./Copy";
import {TrackEdits, type EditState} from "./edits";
import {EditNotes} from "./EditNotes";
import {ElevationOptions, useElevation} from "./Elevation";
import {MoveOptions, useMove} from "./Move";
import {Models} from "./Models";
import {AssetLibrary, type LibraryTab} from "./AssetLibrary";
import {MaterialLibrary} from "./MaterialLibrary";
import {NOT_ALL, sortName} from "./inspect";
import {SaveDialog} from "./SaveDialog";
import {FileButtons, TOOLS, ToolPanel, type Tool} from "./ToolPanel";
import {useBand} from "./useBand";
import {useSave} from "./useSave";
import type {Hovered, Marked, MenuAt, Picked, TrackView, WheelKeys} from "./view";
import {ViewMenu} from "./ViewMenu";
import {Inspector} from "./Inspector";
import {surfaceName, type SurfacePoint, type SurfaceSelection} from "./surfaces";
import {usePaint} from "./usePaint";
import {ToolChoice, ToolOptions, thenView} from "./ToolOptions";

/** The track name's editing: which tool is on, what is picked or marked, the keys. Its buttons go into the sidebar (Save and Play in fileHost, ToolPanel in toolsHost), what is
    to be said below them (EditNotes in notesHost), while the state stays here by the view; over the view what the tool on can be set to (ToolOptions) and the right-click menu. Its keys count while the focus is in scene or in
    those hosts: V, X, K, M, H, T, Home, Delete, Esc, Ctrl+Z, Ctrl+Shift+Z (also Ctrl+Y), Ctrl+S. Mounted anew per track and build (a key in EditorScene). title: the track's; taken: the other
    tracks' titles. elevationSpeed: Elevation's while held, cm a second. onSaved: the track is saved as name (a copy: another one). */
export function EditTools({name, title, taken, view, scene, fileHost, savedHost, toolsHost, notesHost, inspectorHost, hovered,
  inspectorWidth, onInspectorWidth, inspectorCollapsed, onInspectorCollapsed, elevationSpeed, reopen, onSaved}: {
  name: string;
  title: string;
  taken: string[];
  view: TrackView;
  scene: RefObject<HTMLDivElement | null>;
  fileHost: HTMLElement | null;
  savedHost: HTMLElement | null;
  toolsHost: HTMLElement | null;
  notesHost: HTMLElement | null;
  inspectorHost: HTMLElement | null;
  hovered: Hovered | null;
  inspectorWidth: number;
  onInspectorWidth: (width: number) => void;
  inspectorCollapsed: boolean;
  onInspectorCollapsed: (collapsed: boolean) => void;
  elevationSpeed: number;
  reopen: () => void;
  onSaved: (name: string) => void;
}) {
  const [edits] = useState(() => new TrackEdits(name));
  const state = useSyncExternalStore(edits.subscribe, edits.state);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [menu, setMenu] = useState<MenuAt | null>(null);
  const [marked, setMarked] = useState<Marked[]>([]);
  const [surfacePicks, setSurfacePicks] = useState<SurfacePoint[]>([]);
  const [surfaceInfo, setSurfaceInfo] = useState<{points: SurfacePoint[]; selection: SurfaceSelection | null} | null>(null);
  const onSurface = useCallback((selection: SurfaceSelection | null) => setSurfaceInfo({points: surfacePicks, selection}), [surfacePicks]);
  const [selectWhole, setSelectWhole] = useState(false);
  const [selectAdd, setSelectAdd] = useState(false);
  const [tool, setTool] = useState<Tool>("select");
  const [copyTake, setCopyTake] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [viewFailed, setViewFailed] = useState<string | null>(null);
  const [libraryTab, setLibraryTab] = useState<LibraryTab | null>(null);
  const [textureRevision, setTextureRevision] = useState(0);
  const closeMaterial = useCallback(() => setLibraryTab(null), []);
  const setMaterialOpen = useCallback((open: boolean) => setLibraryTab(open ? "textures" : null), []);
  const copyWheel = useRef<(keys: WheelKeys, by: number) => void>(() => {});
  const setCopyWheel = useCallback((wheel: (keys: WheelKeys, by: number) => void) => { copyWheel.current = wheel; }, []);
  const editable = edits.canEdit();
  const elevating = tool === "elevation" && editable;
  const deleting = tool === "delete" && editable;
  const marking = tool === "smooth" && editable;
  const smoothing = tool === "smooth" && editable;
  const moving = tool === "move" && editable;
  const saving = useSave({name, edits, state, view, onSaved});
  const painting = usePaint(name, edits, view);
  const selection = surfaceInfo?.points === surfacePicks ? surfaceInfo.selection : null;
  const materials = selection?.materials ?? (selection ? [selection.material] : []);
  const materialTarget = tool === "select" && editable && selection?.tiles.length && !selection.meshes?.length
    && materials.length
    ? materials.map(surfaceName).join(", ") : null;
  const materialReason = !editable ? "This track cannot be edited right now."
    : surfacePicks.length && !selection ? "Preparing the selected surface…"
    : selection?.meshes?.length ? "This surface uses a separate mesh. Its material cannot be changed yet."
    : selection && new Set(selection.tiles.map(t => t.tile.join(","))).size > 64 ? "Select at most 64 ground tiles to apply a material."
    : selection?.truncated && surfacePicks.some(point => point.whole) ? "Select all is incomplete. Finish loading or select a smaller area (at most 64 ground tiles)."
    : !materialTarget ? "Select a painted ground surface to apply a material." : null;
  const paintSurface = painting.apply;
  const applyMaterial = useCallback((id: string, variation?: boolean) => materialTarget && !materialReason ? paintSurface(id, surfacePicks, variation) : Promise.resolve(false), [materialTarget, materialReason, paintSurface, surfacePicks]);
  const elevation = useElevation({name, view, edits, enabled: elevating, speed: elevationSpeed, onNote: setNote});
  const band = useBand({name, view, edits, enabled: marking, revision: state.keptRevision, onNote: setNote});
  const camera = useCamera({view, enabled: tool === "camera", onNote: setNote});
  const move = useMove({name, view, edits, state, enabled: moving, picked, onNote: setNote});

  /** What a click picked; Delete removes it, while Smooth road takes left clicks for its range. */
  const onPicked = useEffectEvent((p: Picked | null) => {
    if (marking && p?.left) return view.unpick();
    setPicked(p);
    if (!p?.adding) { setMarked([]); setSurfacePicks([]); }
    if (tool === "select" && p?.surface) {
      setSurfacePicks(previous => [...(p.adding ? previous : []).filter(s => JSON.stringify(s) !== JSON.stringify(p.surface)), p.surface!].slice(-64));
    }
    if (tool === "select" && p?.whole && p.id) {
      const group = p.sprite ? {sort: p.sprite, tree: true} : p.sort && !NOT_ALL.has(p.sort) ? {sort: p.sort, tree: false} : null;
      if (group) setMarked(previous => [...(p.adding ? previous : []).filter(g => g.sort !== group.sort || g.tree !== group.tree), group]);
    }
    if (deleting && p?.id && p.left) {
      edits.remove([{id: p.id, position: p.position}]);
      view.unpick();
    }
  });

  /** Smooth road marks A, B and intermediate pins; grass or sky clears the active range. */
  const onClicked = useEffectEvent((p: Picked | null) => {
    if (!marking) return;
    if (p?.road) band.click(p.road[0], p.road[1]);
    else if (!p?.id) band.clear();
  });

  useEffect(() => {
    view.setClicked(p => onClicked(p));
    return () => view.setClicked(() => {});
  }, [view]);

  useEffect(() => { view.setWheelTaken((band.line !== null && smoothing) || tool === "camera" || tool === "copy" || moving); }, [view, band.line, smoothing, tool, moving]);

  useEffect(() => { view.setAdding((tool === "select" || tool === "camera" || tool === "move") && editable); }, [view, tool, editable]);
  useEffect(() => {
    view.setSelectMode(tool === "select", selectWhole, selectAdd);
    return () => view.setSelectMode(false);
  }, [view, tool, selectWhole, selectAdd]);

  useEffect(() => {
    if (tool !== "smooth") band.clear();
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
    edits.setOnMeshes(meshes => view.refreshMeshes(meshes));
    edits.setOnTextures((textures, paints) => view.refreshPaints(textures, paints));
    view.setViewFailed(setViewFailed);
    view.setTexturesChanged(() => setTextureRevision(value => value + 1));
    return () => {
      edits.setOnMeshes(() => {});
      edits.setOnTextures(() => {});
      view.setViewFailed(() => {});
      view.setTexturesChanged(() => {});
    };
  }, [view, edits]);

  useEffect(() => { if (state.save === "saved" && edits.canEdit()) void view.syncPaints(state.paints); }, [view, edits, state]);

  const toolWheel = useEffectEvent((keys: Parameters<typeof elevation.wheel>[0], by: number) => {
    if (tool === "camera") camera.wheel(keys, by);
    else if (tool === "move") move.wheel(keys, by);
    else if (tool === "copy" || tool === "model") copyWheel.current(keys, by);
    else if (tool === "smooth") band.wheel(keys, by);
    else elevation.wheel(keys, by);
  });

  useEffect(() => {
    view.setToolWheel((keys, by) => toolWheel(keys, by));
    return () => view.setToolWheel(() => {});
  }, [view]);

  /** The list read again, and if it is of another build than the view shows, the track too. */
  const readAgain = async () => {
    const meshesOf = (s: EditState) => JSON.stringify([s.heights.map(h => h.id), s.placed, s.copies]);
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
    if (marked.length || removable.length) {
      edits.removeSelected(view.selectedOutside(marked), marked);
      setMarked([]);
      view.unpick();
    }
  };
  /** A tool taken up, the one on laid down: Select. */
  const takeUp = (t: Tool) => { band.clear(); setSelectWhole(false); setSelectAdd(false); setSurfacePicks([]); setTool(tool === t ? "select" : t); };
  const closeMenu = useCallback(() => setMenu(null), []);

  // (an effect event: Delete pressed right after a click reaches what that click picked, not the list of keys before it)
  const keys = useEffectEvent((e: KeyboardEvent) => {
    const control = e.ctrlKey || e.metaKey, key = e.key.toLowerCase();
    if (saving.asking) {        // (the dialog's name field keeps its own keys; Ctrl+S isn't the browser's)
      if (control && key === "s") e.preventDefault();
      return;
    }
    if (["Home", "End", "ArrowLeft", "ArrowRight"].includes(e.key) && (e.target as HTMLElement).closest('[role="tablist"]')) return;
    if (e.key !== "Escape" && e.key !== "Enter" && ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) return; // Fields keep their typing and option keys.
    const keyed = control ? undefined : TOOLS.find(t => t.key.toLowerCase() === key);
    if (e.key === "Delete") remove();
    else if (e.key === "Escape") {
      setMenu(null);
      setMarked([]);
      setSelectWhole(false);
      setSelectAdd(false);
      setSurfacePicks([]);
      view.cancelStroke();
      band.clear();
      view.unpick();
      setTool("select");        // (with it go a marking and a ride)
      view.focus();
    }
    else if ((marked.length || removable.length) && !control && key === "x") remove();      // (what is picked or marked is what X is there to delete; nothing: its tool)
    else if (keyed?.tool === "model") { if (editable) setLibraryTab("objects"); }
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
    const on = [scene.current!, fileHost, toolsHost, notesHost, inspectorHost], listen = (e: KeyboardEvent) => keys(e);
    for (const el of on) el?.addEventListener("keydown", listen);
    return () => { for (const el of on) el?.removeEventListener("keydown", listen); };
  }, [scene, fileHost, toolsHost, notesHost, inspectorHost]);


  return (
    <>
      {fileHost && createPortal(<FileButtons state={state} edits={edits} view={view} saving={saving} />, fileHost)}
      {savedHost && createPortal(saving.savedText, savedHost)}
      {toolsHost && createPortal(<ToolPanel state={state} edits={edits} view={view} tool={tool} onTool={t => { takeUp(t); setNote(null); }} onModels={() => setLibraryTab("objects")} />, toolsHost)}
      <Models name={name} view={view} edits={edits} picked={picked} enabled={tool === "model" && editable}
        onWheel={setCopyWheel}
        choosing={libraryTab === "objects"} onClose={closeMaterial} onPlace={() => setTool("model")}
        renderLibrary={(objects, busy) => <AssetLibrary tab={libraryTab} onTab={setLibraryTab} onClose={closeMaterial} busy={busy || painting.busy} objects={objects}
          textures={<MaterialLibrary embedded open={libraryTab === "textures"} target={materialTarget} reason={materialReason} busy={painting.busy} error={painting.error} onApply={applyMaterial} onClose={closeMaterial} />} />} />
      {inspectorHost && createPortal(<Inspector name={name} picked={picked} hovered={hovered} surfaces={tool === "select" ? surfacePicks : []}
        notes={<EditNotes state={state} edits={edits} view={view} note={note} viewFailed={viewFailed} saveFailed={saving.failed}
          picked={(marking && !picked?.id) || (tool === "select" && picked?.surface) ? null : picked} sort={sort}
          markedName={marked.length ? marked.map(g => g.tree ? g.sort : sortName(g.sort)).join(", ") : null}
          reopen={reopen} readAgain={() => void readAgain()} />}
        attention={!!(viewFailed || saving.failed || state.error || state.outdated || state.save === "failed")}
        marked={marked} view={view} state={state} width={inspectorWidth} onWidth={onInspectorWidth}
        collapsed={inspectorCollapsed} onCollapsed={onInspectorCollapsed} onSurface={onSurface}
        onMaterialOpen={() => setMaterialOpen(true)} textureRevision={textureRevision} />, inspectorHost)}
      {tool === "select" && <ToolOptions id="edit-select-set" title="Select" note="Click a section or object. Shift selects all matching; Ctrl adds to the selection."
        options={[
          <ToolChoice label="Select all" on={selectWhole} hint="Select every matching ground surface, including separate areas, or every object of this sort (Shift + click)" onClick={thenView(view, () => {
            setSelectWhole(!selectWhole);
            if (picked?.surface) setSurfacePicks(previous => previous.map(s => ({...s, whole: !selectWhole})));
            else if (tree || sort) setMarked(selectWhole ? [] : [{sort: tree ?? sort!, tree: !!tree}]);
          })} />,
          <ToolChoice label="Add" on={selectAdd} hint="Add to the selection; click a picked object again to remove it (Ctrl + click)" onClick={thenView(view, () => setSelectAdd(!selectAdd))} />,
        ]} />}
      {elevating && <ElevationOptions elevation={elevation} view={view} />}
      {marking && <BandOptions band={band} view={view} />}
      {tool === "camera" && <CameraOptions camera={camera} view={view} />}
      {moving && <MoveOptions move={move} view={view} />}
      {tool === "copy" && editable && <CopyTool key={copyTake} name={name} edits={edits} view={view} picked={picked} onWheel={setCopyWheel} />}
      {menu && (
        <ViewMenu at={menu} object={!!picked?.id} mark={editable ? markLabel : null} canDelete={removable.length > 0 && editable} onClose={closeMenu}
                  onEdit={() => { setTool("select"); if (picked?.surface) {
                    setSurfacePicks([picked.surface]);
                    if (picked.surface.face === undefined) setMaterialOpen(true);
                  } onInspectorCollapsed(false); view.focus(); }}
                  onMove={editable && picked?.id && view.canMove(picked.id) ? () => { setTool("move"); setNote(null); view.focus(); } : null}
                  onDuplicate={editable && picked?.id && view.canMove(picked.id) ? () => { setCopyTake(n => n + 1); setTool("copy"); setNote(null); view.focus(); } : null}
                  onSmooth={editable && picked?.road ? () => { setTool("smooth"); band.start(picked.road![0], picked.road![1]); setNote(null); view.focus(); } : null}
                  onMark={() => { setMarked([sort ? {sort, tree: false} : {sort: tree!, tree: true}]); view.focus(); }}
                  onDelete={() => { remove(); view.focus(); }} />
      )}
      {saving.asking && <SaveDialog title={title} taken={taken} canOverwrite={saving.canSave} onOverwrite={() => void saving.chosen(null)}
                                    onSaveNew={t => void saving.chosen(t)} onCancel={saving.cancel} />}
    </>
  );
}
