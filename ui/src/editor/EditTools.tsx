import {useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, useSyncExternalStore, type RefObject} from "react";
import {createPortal} from "react-dom";
import {BandOptions} from "./tools/BandOptions";
import {CameraOptions, useCamera} from "./tools/Camera";
import {CopyTool} from "./tools/Copy";
import {TrackEdits, type EditState} from "./state/edits";
import {EditNotes} from "./inspector/EditNotes";
import {ElevationOptions, useElevation} from "./tools/Elevation";
import {MoveOptions, useMove} from "./tools/Move";
import {Models} from "./tools/Models";
import {AssetLibrary, type LibraryTab} from "./library/AssetLibrary";
import {MaterialLibrary} from "./library/MaterialLibrary";
import {NOT_ALL, sortName} from "./scene/inspect";
import {SaveDialog} from "./state/SaveDialog";
import {FileButtons, TOOLS, ToolPanel, type Tool} from "./tools/ToolPanel";
import {useBand} from "./tools/useBand";
import {useSave} from "./state/useSave";
import type {Hovered, Marked, MenuAt, Picked, WheelKeys} from "./types";
import type {TrackView} from "./scene/view";
import {ViewMenu} from "./tools/ViewMenu";
import {Inspector} from "./inspector/Inspector";
import {pickedSurfaces, surfaceName, type SurfacePoint, type SurfaceSelection} from "./scene/surfaces";
import {usePaint} from "./tools/usePaint";
import {ToolChoice, ToolOptions, thenView} from "./tools/ToolOptions";
import {useToasts} from "../components/toastStore";
import {editorToasts} from "./editorToasts";

/** Whether tool and its editable selection take modified wheel input from the camera. Pure. */
export function takesWheel(tool: Tool, editable: boolean, marked: boolean) {
  return (tool === "smooth" && editable && marked) || tool === "camera" || tool === "copy" || tool === "model" || (tool === "move" && editable);
}

/** The track name's editing: which tool is on, what is picked or marked, the keys. Its buttons go into the sidebar (Save and Play in fileHost, ToolPanel in toolsHost), what is
    to be said below them (EditNotes in notesHost), while the state stays here by the view; over the view what the tool on can be set to (ToolOptions) and the right-click menu. Its keys count while the focus is in scene or in
    those hosts: V, X, K, M, H, T, Home, Delete, Esc, Ctrl+Z, Ctrl+Shift+Z (also Ctrl+Y), Ctrl+S. Mounted anew per track and build (a key in EditorScene). title: the track's; taken: the other
    tracks' titles. elevationSpeed: Elevation's while held, cm a second. onSaved: the track is saved as name (a copy: another one). */
export function EditTools({name, title, visible, taken, view, scene, fileHost, savedHost, toolsHost, notesHost, inspectorHost, hovered,
  inspectorWidth, onInspectorWidth, inspectorCollapsed, onInspectorCollapsed, elevationSpeed, reopen, onSaved}: {
  name: string;
  title: string;
  visible: boolean;
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
  const [copyFailed, setCopyFailed] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const [libraryTab, setLibraryTab] = useState<LibraryTab | null>(null);
  const [replaceTargets, setReplaceTargets] = useState<string[]>([]);
  const replaceable = useMemo(() => menu && picked?.id ? view.replacementTargets(marked) : null, [view, menu, picked, marked]);
  // (the right-click menu belongs to the click that opened it: a tool or the library taken up closes it, so the next click in the view acts)
  const openModels = () => { setMenu(null); setReplaceTargets(view.replacementTargets(marked) ?? []); setLibraryTab("objects"); };
  const [textureRevision, setTextureRevision] = useState(0);
  const closeMaterial = useCallback(() => setLibraryTab(null), []);
  // (File's Library opens where it was left, at Textures for a picked ground surface; Insert always at Objects)
  const [lastTab, setLastTab] = useState<LibraryTab>("textures");
  if (libraryTab && libraryTab !== lastTab) setLastTab(libraryTab);
  const openLibrary = () => { if (lastTab === "objects" && !surfacePicks.length && editable) openModels(); else { setMenu(null); setLibraryTab("textures"); } };
  const setMaterialOpen = useCallback((open: boolean) => setLibraryTab(open ? "textures" : null), []);
  const copyWheel = useRef<(keys: WheelKeys, by: number) => void>(() => {});
  const setCopyWheel = useCallback((wheel: (keys: WheelKeys, by: number) => void) => { copyWheel.current = wheel; }, []);
  const editable = edits.canEdit();
  const elevating = tool === "elevation" && editable;
  const deleting = tool === "delete" && editable;
  const marking = tool === "smooth" && editable;
  const moving = tool === "move" && editable;
  const saving = useSave({name, edits, state, view, onSaved});
  const painting = usePaint(name, edits, view);
  const selection = surfaceInfo?.points === surfacePicks ? surfaceInfo.selection : null;
  const materials = selection?.materials ?? (selection ? [selection.material] : []);
  const materialTarget = tool === "select" && editable && selection?.tiles.length && !selection.meshes?.length
    && materials.length
    ? materials.map(surfaceName).join(", ") : null;
  const limitedTiles = selection?.truncated && surfacePicks.some(point => point.whole)
    ? new Set(selection.tiles.map(t => t.tile.join(","))).size : undefined;
  const materialReason = !editable ? "This track cannot be edited right now."
    : surfacePicks.length && !selection ? "Preparing the selected surface…"
    : selection?.meshes?.length ? "This surface uses a separate mesh. Its material cannot be changed yet."
    : selection && new Set(selection.tiles.map(t => t.tile.join(","))).size > 64 ? "Select at most 64 ground tiles to apply a material."
    : !materialTarget ? "Select a painted ground surface to apply a material." : null;
  const paintSurface = painting.apply;
  const applyMaterial = useCallback((id: string, variation?: boolean) => materialTarget && !materialReason
    ? paintSurface(id, surfacePicks, variation, limitedTiles ? selection?.tiles.map(t => t.tile) : undefined) : Promise.resolve(false),
    [materialTarget, materialReason, paintSurface, surfacePicks, limitedTiles, selection]);
  const elevation = useElevation({name, view, edits, enabled: elevating, speed: elevationSpeed, onNote: setNote});
  const band = useBand({name, view, edits, enabled: marking, revision: state.keptRevision, onNote: setNote});
  const camera = useCamera({view, enabled: tool === "camera", onNote: setNote});
  const move = useMove({name, view, edits, state, enabled: moving, picked, onNote: setNote});

  /** What a click picked; Delete removes it, while Smooth road takes left clicks for its range. */
  const onPicked = useEffectEvent((p: Picked | null) => {
    if (marking && p?.left) return view.unpick();
    setPicked(p);
    if (!p?.adding && !p?.keeping) setMarked([]);
    if (tool === "select") setSurfacePicks(previous => pickedSurfaces(previous, p));
    else if (!p?.adding) setSurfacePicks([]);
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

  useEffect(() => { view.setWheelTaken(takesWheel(tool, editable, band.line !== null)); }, [view, band.line, editable, tool]);

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
  const takeUp = (t: Tool) => { setMenu(null); band.clear(); setSelectWhole(false); setSelectAdd(false); setSurfacePicks([]); setTool(tool === t ? "select" : t); };
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
    else if (keyed?.tool === "model") { if (editable) openModels(); }
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


  // (what goes wrong outside any window, and Saving: a toast at the top centre while the Editor's tab is open, with its way out;
  // ×'d, it stays away until its text changes)
  const problems = editorToasts({viewFailed, copyFailed, saveFailed: saving.failed, save: state.save, error: state.error, outdated: state.outdated,
    saving: saving.busy},
    dismissed, {reopen: thenView(view, reopen), readAgain: thenView(view, () => void readAgain()), giveUp: thenView(view, () => edits.discardOutdated())});
  useToasts(!visible ? [] : problems.map(t => ({...t, onDismiss: () => {
    setDismissed(previous => new Set(previous).add(t.key));
    if (t.id === "edit-copy-failed") setCopyFailed(null);
  }})));

  return (
    <>
      {fileHost && createPortal(<FileButtons state={state} edits={edits} view={view} saving={saving} onLibrary={openLibrary} />, fileHost)}
      {savedHost && createPortal(saving.savedText, savedHost)}
      {toolsHost && createPortal(<ToolPanel state={state} edits={edits} view={view} tool={tool} onTool={t => { takeUp(t); setNote(null); }} onModels={openModels} />, toolsHost)}
      <Models name={name} view={view} edits={edits} replace={replaceTargets} enabled={tool === "model" && editable}
        onWheel={setCopyWheel}
        choosing={libraryTab === "objects"} onClose={closeMaterial} onPlace={() => setTool("model")}
        renderLibrary={(objects, busy) => <AssetLibrary tab={libraryTab} onTab={tab => { if (tab === "objects") openModels(); else setLibraryTab(tab); }} onClose={closeMaterial} busy={busy || painting.busy} objects={objects}
          textures={<MaterialLibrary embedded open={libraryTab === "textures"} target={materialTarget} reason={materialReason} limitedTiles={limitedTiles} busy={painting.busy} error={painting.error} onApply={applyMaterial} onClose={closeMaterial} />} />} />
      {inspectorHost && createPortal(<Inspector name={name} picked={picked} hovered={hovered} surfaces={tool === "select" ? surfacePicks : []}
        notes={<EditNotes state={state} note={note}
          picked={(marking && !picked?.id) || (tool === "select" && picked?.surface) ? null : picked} sort={sort}
          markedName={marked.length ? marked.map(g => g.tree ? g.sort : sortName(g.sort)).join(", ") : null}
        />}
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
      {tool === "copy" && editable && <CopyTool key={copyTake} name={name} edits={edits} view={view} picked={picked} onWheel={setCopyWheel} onFailed={setCopyFailed} />}
      {menu && (
        <ViewMenu at={menu} object={!!picked?.id} mark={editable ? markLabel : null} canDelete={removable.length > 0 && editable} onClose={closeMenu}
                  onReplace={editable && replaceable?.length ? openModels : null}
                  onEdit={() => { setTool("select"); if (picked?.surface) {
                    setSurfacePicks(previous => pickedSurfaces(tool === "select" ? previous : [], {surface: picked.surface, left: false}));
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
