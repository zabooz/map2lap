import {useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, useSyncExternalStore, type RefObject} from "react";
import {createPortal} from "react-dom";
import {BandOptions} from "./tools/BandOptions";
import {CameraOptions, useCamera} from "./tools/Camera";
import {CopyTool} from "./tools/Copy";
import {TrackEdits, type EditState} from "./state/edits";
import {EditNotes} from "./inspector/EditNotes";
import {ElevationOptions, useElevation} from "./tools/Elevation";
import {DeleteOptions, useDelete} from "./tools/Delete";
import {MoveOptions, useMove} from "./tools/Move";
import {Models} from "./tools/Models";
import {Groups} from "./tools/Groups";
import {GroupLibrary} from "./library/GroupLibrary";
import type {ObjectGroup} from "./tools/scatter";
import type {LibraryModel} from "./library/ModelLibrary";
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
import {TransformFields} from "./inspector/TransformFields";
import {pickedSurfaces, surfaceName, type SurfacePoint, type SurfaceSelection} from "./scene/surfaces";
import {usePaint} from "./tools/usePaint";
import type {TextureLook} from "./library/textureLook";
import {ToolAction, ToolChoice, ToolOptions, thenView} from "./tools/ToolOptions";
import {ACTIONS, altAction, selectActions, smoothStart, type SelectAction} from "./tools/selectActions";
import {AltAlone} from "./tools/held";
import {useToasts} from "../components/toastStore";
import {editorToasts} from "./editorToasts";

const VERGE_DELETED = "Road verge deleted. Undo brings it back.";

/** Whether tool and its editable selection take modified wheel input from the camera. Pure. */
export function takesWheel(tool: Tool, editable: boolean, marked: boolean) {
  return (tool === "smooth" && editable && marked) || (tool === "delete" && editable) || tool === "camera" || tool === "copy" || tool === "model" || tool === "group" || (tool === "move" && editable);
}

/** The track name's editing: which tool is on, what is picked or marked, the keys. Its buttons go into the sidebar (Save and Play in fileHost, ToolPanel in toolsHost), what is
    to be said below them (EditNotes in notesHost), while the state stays here by the view; over the view what the tool on can be set to (ToolOptions) and the right-click menu. Its keys count while the focus is in scene or in
    those hosts: V, X, K, M, H, T, Home, Delete, Esc, Ctrl+Z, Ctrl+Shift+Z (also Ctrl+Y), Ctrl+S. Mounted anew per track and build (a key in EditorScene). title: the track's; taken: the other
    tracks' titles. elevationSpeed: Elevation's while held, cm a second. onSaved: the track is saved as name (a copy: another one). onDelete: Delete was pressed. */
export function EditTools({name, title, visible, taken, view, scene, fileHost, savedHost, toolsHost, notesHost, inspectorHost, hovered,
  inspectorWidth, onInspectorWidth, inspectorCollapsed, onInspectorCollapsed, elevationSpeed, reopen, onSaved, onDelete}: {
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
  onDelete: () => void;
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
  const [groupFailed, setGroupFailed] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const [libraryTab, setLibraryTab] = useState<LibraryTab | null>(null);
  const [group, setGroup] = useState<ObjectGroup | null>(null), [groupModels, setGroupModels] = useState<LibraryModel[]>([]);
  const [groupBusy, setGroupBusy] = useState(false);
  const [replaceTargets, setReplaceTargets] = useState<string[]>([]);
  const replaceable = useMemo(() => (menu || tool === "select") && picked?.id ? view.selection.replacementTargets(marked) : null, [view, menu, tool, picked, marked]);
  // (the right-click menu belongs to the click that opened it: a tool or the library taken up closes it, so the next click in the view acts)
  const openModels = () => { setMenu(null); setReplaceTargets(view.selection.replacementTargets(marked) ?? []); setLibraryTab("objects"); };
  const [textureRevision, setTextureRevision] = useState(0);
  const closeMaterial = useCallback(() => setLibraryTab(null), []);
  // (File's Library opens where it was left, at Textures for a picked ground surface; Insert always at Objects)
  const [lastTab, setLastTab] = useState<LibraryTab>("textures");
  if (libraryTab && libraryTab !== lastTab) setLastTab(libraryTab);
  const openLibrary = () => { if (lastTab === "objects" && !surfacePicks.length && editable) openModels(); else { setMenu(null); setLibraryTab(surfacePicks.length ? "textures" : lastTab); } };
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
    : !materialTarget ? "Select a painted ground surface to apply a material." : null;
  const paintSurface = painting.apply;
  const applyMaterial = useCallback((id: string, variation?: boolean, look?: TextureLook) => materialTarget && !materialReason
    // (the tiles shown go with it: ground loaded since does not change what Apply changes)
    ? paintSurface(id, surfacePicks, variation, selection?.tiles.map(t => t.tile), look) : Promise.resolve(false),
    [materialTarget, materialReason, paintSurface, surfacePicks, selection]);
  const elevation = useElevation({name, view, edits, enabled: elevating, speed: elevationSpeed, onNote: setNote});
  const band = useBand({name, view, edits, enabled: marking, revision: state.keptRevision, onNote: setNote});
  const camera = useCamera({view, enabled: tool === "camera", onNote: setNote});
  const move = useMove({name, view, edits, state, enabled: moving, picked, onNote: setNote});
  const remover = useDelete({view, edits, enabled: deleting, onNote: setNote});

  /** The connected stretch of road verge at a picked point, as cuts of the draft; null if it is no verge or no longer loaded. */
  const vergeAt = (point: SurfacePoint) => {
    try { return view.objects.surfaceCuts(view.materialSelection(point).meshes ?? []); } catch { return null; }
  };

  /** What a click picked; Delete removes it, while Smooth road takes left clicks for its range. */
  const onPicked = useEffectEvent((p: Picked | null) => {
    if (marking && p?.left) return view.selection.unpick();
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
      view.selection.unpick();
    } else if (deleting && p?.left && p.surface?.face !== undefined) {
      // (the road verge is no object: a click takes the connected stretch of it, by its triangles)
      const cuts = vergeAt(p.surface);
      if (cuts) { edits.removeSurfaces(cuts); setNote(VERGE_DELETED); }
      view.selection.unpick();
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

  useEffect(() => { view.setCursorTool(editable ? tool : "select"); }, [view, tool, editable]);
  useEffect(() => { view.selection.setAdding((tool === "select" || tool === "camera" || tool === "move") && editable); }, [view, tool, editable]);
  useEffect(() => {
    view.selection.setSelectMode(tool === "select", selectWhole, selectAdd);
    return () => view.selection.setSelectMode(false);
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
    view.selection.setPick(p => onPicked(p));
    view.setMenu(setMenu);
    view.setIndexed(revision => edits.bind(revision));
    return () => {
      view.selection.setPick(() => {});
      view.setMenu(() => {});
      view.setIndexed(() => {});
    };
  }, [view, edits]);

  useEffect(() => { view.objects.setRemoved(state.removed.map(r => r.id), state.sorts, state.objectSorts); },
            [view, state.removed, state.sorts, state.objectSorts]);
  useEffect(() => { view.objects.setRemovedSurfaces(state.surfaces); }, [view, state.surfaces]);

  useEffect(() => {
    view.selection.setMarked(marked);
    return () => view.selection.setMarked(null);
  }, [view, marked]);

  useEffect(() => {
    edits.setOnMeshes((meshes, _revision, more, trees) => view.refreshMeshes(meshes, more, trees));
    edits.setOnTextures((textures, paints) => view.textures.refreshPaints(textures, paints));
    view.setViewFailed(setViewFailed);
    view.textures.setChanged(() => setTextureRevision(value => value + 1));
    return () => {
      edits.setOnMeshes(() => {});
      edits.setOnTextures(() => {});
      view.setViewFailed(() => {});
      view.textures.setChanged(() => {});
    };
  }, [view, edits]);

  useEffect(() => { if (state.save === "saved" && edits.canEdit()) void view.textures.syncPaints(state.paints); }, [view, edits, state]);

  const toolWheel = useEffectEvent((keys: Parameters<typeof elevation.wheel>[0], by: number) => {
    if (tool === "camera") camera.wheel(keys, by);
    else if (tool === "move") move.wheel(keys, by);
    else if (tool === "copy" || tool === "model" || tool === "group") copyWheel.current(keys, by);
    else if (tool === "smooth") band.wheel(keys, by);
    else if (tool === "delete") remover.wheel(keys, by);
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
  // (a selected stretch of road verge, or all of it loaded with Shift: Delete takes those triangles)
  const vergeCuts = selection?.meshes?.length && !selection.tiles.length ? view.objects.surfaceCuts(selection.meshes) : null;
  const ids = state.removed.map(r => r.id);
  const sort = picked?.id && picked.sort && !NOT_ALL.has(picked.sort) ? picked.sort : null;
  const tree = picked?.id && picked.sprite ? picked.sprite : null;
  const markLabel = !menu ? null : sort ? `Mark all ${sortName(sort)} (${view.objects.countOfListed(sort, ids, state.objectSorts)})`
    : tree ? `Mark all ${tree} (loaded: ${view.objects.countOf(tree)})` : null;

  const remove = (cuts = vergeCuts) => {
    if (!editable) return;
    if (cuts) {
      edits.removeSurfaces(cuts);
      setSurfacePicks([]);
      setNote(VERGE_DELETED);
      view.selection.unpick();
    } else if (marked.length || removable.length) {
      edits.removeSelected(view.selection.selectedOutside(marked), marked);
      setMarked([]);
      view.selection.unpick();
    }
  };
  /** A tool taken up, the one on laid down: Select. Smooth road taken up from Select starts at the road picked there. */
  const takeUp = (t: Tool) => {
    const next = tool === t ? "select" : t, road = editable ? smoothStart(tool, next, picked) : null;
    setMenu(null); band.clear(); setSelectWhole(false); setSelectAdd(false); setSurfacePicks([]); setTool(next);
    if (road) band.start(road[0], road[1]);
  };
  const closeMenu = useCallback(() => setMenu(null), []);
  const startSmooth = (road: [number, number]) => { setMenu(null); setTool("smooth"); band.start(road[0], road[1]); setNote(null); view.focus(); };
  /** Edit… of the menu: Select on, the picked ground selected, its textures open, the inspector shown. */
  const editPicked = () => {
    setTool("select");
    if (picked?.surface) {
      setSurfacePicks(previous => pickedSurfaces(tool === "select" ? previous : [], {surface: picked.surface, left: false}));
      if (picked.surface.face === undefined) setMaterialOpen(true);
    }
    onInspectorCollapsed(false); view.focus();
  };
  const movable = editable && !!picked?.id && view.mover.canMove(picked.id);
  /** What can be done with what is picked, for the right-click menu and the Select bar: null where it can't now. */
  const run: Record<SelectAction, (() => void) | null> = {
    texture: picked?.surface ? editPicked : null,
    move: movable ? () => { setTool("move"); setNote(null); view.focus(); } : null,
    copy: movable ? () => { setCopyTake(n => n + 1); setTool("copy"); setNote(null); view.focus(); } : null,
    replace: editable && replaceable?.length ? openModels : null,
    delete: editable && (removable.length > 0 || !!vergeCuts) ? () => { remove(); view.focus(); } : null,
  };

  const offered = tool === "select" ? selectActions(picked) : [], altOffered = altAction(offered);
  /** The Select bar's button of action, with the key of the tool it takes up. */
  const actionButton = (action: SelectAction) => {
    const {label, tool: keyed, hint} = ACTIONS[action], perform = run[action];
    return <ToolAction key={action} id={`edit-select-${action}`} label={label} shortcut={TOOLS.find(t => t.tool === keyed)?.key} hint={hint}
                       disabled={!perform} onClick={() => perform?.()} />;
  };
  const [altAlone] = useState(() => new AltAlone());
  /** Alt let go by itself under Select: the bar's Alt place, the picked ground's texture or the picked objects' replacement. */
  const altKey = useEffectEvent((e: KeyboardEvent) => {
    if (!altAlone.up(e)) return;
    e.preventDefault();      // (Firefox would open its menu bar)
    if (altOffered) run[altOffered]?.();
  });

  // (an effect event: Delete pressed right after a click reaches what that click picked, not the list of keys before it)
  const keys = useEffectEvent((e: KeyboardEvent) => {
    const control = e.ctrlKey || e.metaKey, key = e.key.toLowerCase();
    if (saving.asking) {        // (the dialog's name field keeps its own keys; Ctrl+S isn't the browser's)
      if (control && key === "s") e.preventDefault();
      return;
    }
    if (["Home", "End", "ArrowLeft", "ArrowRight"].includes(e.key) && (e.target as HTMLElement).closest('[role="tablist"]')) return;
    if (e.key !== "Escape" && e.key !== "Enter" && ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) return; // Fields keep their typing and option keys.
    altAlone.down(e);
    const keyed = control ? undefined : TOOLS.find(t => t.key.toLowerCase() === key);
    if (e.key === "Delete") remove();
    else if (e.key === "Escape") {
      setMenu(null);
      setMarked([]);
      setSelectWhole(false);
      setSelectAdd(false);
      setSurfacePicks([]);
      view.brush.cancelStroke();
      band.clear();
      view.selection.unpick();
      setTool("select");        // (with it go a marking and a ride)
      view.focus();
    }
    else if ((marked.length || removable.length || vergeCuts) && !control && key === "x") remove();      // (what is picked or marked is what X is there to delete; nothing: its tool)
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
    const on = [scene.current!, fileHost, toolsHost, notesHost, inspectorHost], listen = (e: KeyboardEvent) => keys(e), up = (e: KeyboardEvent) => altKey(e);
    const modifier = () => altAlone.other();       // (Alt with a click or the wheel, or the window left: Alt+Tab)
    for (const el of on) { el?.addEventListener("keydown", listen); el?.addEventListener("keyup", up); }
    for (const type of ["pointerdown", "wheel"]) window.addEventListener(type, modifier, true);
    window.addEventListener("blur", modifier);
    return () => {
      for (const el of on) { el?.removeEventListener("keydown", listen); el?.removeEventListener("keyup", up); }
      for (const type of ["pointerdown", "wheel"]) window.removeEventListener(type, modifier, true);
      window.removeEventListener("blur", modifier);
    };
  }, [scene, fileHost, toolsHost, notesHost, inspectorHost, altAlone]);


  // (what goes wrong outside any window, and Saving: a toast at the top centre while the Editor's tab is open, with its way out;
  // ×'d, it stays away until its text changes)
  const problems = editorToasts({viewFailed, copyFailed, groupFailed, saveFailed: saving.failed, save: state.save, error: state.error, outdated: state.outdated,
    saving: saving.busy, waiting: saving.waiting},
    dismissed, {reopen: thenView(view, reopen), readAgain: thenView(view, () => void readAgain()), giveUp: thenView(view, () => edits.discardOutdated())});
  useToasts(!visible ? [] : problems.map(t => ({...t, onDismiss: () => {
    setDismissed(previous => new Set(previous).add(t.key));
    if (t.id === "edit-copy-failed") setCopyFailed(null);
    if (t.id === "edit-group-failed") setGroupFailed(null);
  }})));

  return (
    <>
      {fileHost && createPortal(<FileButtons state={state} edits={edits} view={view} saving={saving} onLibrary={openLibrary} onDelete={onDelete} />, fileHost)}
      {savedHost && createPortal(saving.savedText, savedHost)}
      {toolsHost && createPortal(<ToolPanel state={state} edits={edits} view={view} tool={tool} onTool={t => { takeUp(t); setNote(null); }} onModels={openModels} />, toolsHost)}
      <Models name={name} view={view} edits={edits} replace={replaceTargets} enabled={tool === "model" && editable}
        onWheel={setCopyWheel}
        choosing={libraryTab === "objects"} onClose={closeMaterial} onPlace={() => setTool("model")}
        renderLibrary={(objects, busy) => <AssetLibrary tab={libraryTab} onTab={tab => { if (tab === "objects") openModels(); else setLibraryTab(tab); }} onClose={closeMaterial} busy={busy || painting.busy || groupBusy} objects={objects}
          groups={<GroupLibrary open={libraryTab === "groups"} onBusy={setGroupBusy} onClose={closeMaterial} onChoose={(chosen, models) => {
            setGroup(chosen); setGroupModels(models); setTool("group"); closeMaterial(); view.focus();
          }} />}
          textures={<MaterialLibrary embedded open={libraryTab === "textures"} target={materialTarget} reason={materialReason} limitedTiles={limitedTiles} busy={painting.busy} progress={painting.progress} error={painting.error} onApply={applyMaterial} onClose={closeMaterial} />} />} />
      <Groups name={name} view={view} edits={edits} group={group} models={groupModels} enabled={tool === "group" && editable && !libraryTab} onWheel={setCopyWheel} onFailed={setGroupFailed} />
      {inspectorHost && createPortal(<Inspector name={name} picked={picked} hovered={hovered} surfaces={tool === "select" ? surfacePicks : []}
        notes={<EditNotes state={state} note={note}
          picked={(marking && !picked?.id) || (tool === "select" && picked?.surface) ? null : picked} sort={sort}
          markedName={marked.length ? marked.map(g => g.tree ? g.sort : sortName(g.sort)).join(", ") : null}
        />}
        marked={marked} view={view} state={state} width={inspectorWidth} onWidth={onInspectorWidth}
        collapsed={inspectorCollapsed} onCollapsed={onInspectorCollapsed} onSurface={onSurface}
        onMaterialOpen={() => setMaterialOpen(true)} restyling={editable ? painting : null} textureRevision={textureRevision} transform={editable && <TransformFields move={move} />} />, inspectorHost)}
      {tool === "select" && <ToolOptions id="edit-select-set" title="Select" note="Click a section or object. Shift selects all matching; Ctrl adds to the selection."
        options={[
          <ToolChoice label="Select all" on={selectWhole} hint="Select every matching ground surface, including separate areas, or every object of this sort (Shift + click)" onClick={thenView(view, () => {
            setSelectWhole(!selectWhole);
            if (picked?.surface) setSurfacePicks(previous => previous.map(s => ({...s, whole: !selectWhole})));
            else if (tree || sort) setMarked(selectWhole ? [] : [{sort: tree ?? sort!, tree: !!tree}]);
          })} />,
          <ToolChoice label="Add" on={selectAdd} hint="Add to the selection; click a picked object again to remove it (Ctrl + click)" onClick={thenView(view, () => setSelectAdd(!selectAdd))} />,
          ...(altOffered ? [actionButton(altOffered)] : []),
        ]} actions={offered.filter(action => action !== altOffered).map(actionButton)} />}
      {elevating && <ElevationOptions elevation={elevation} view={view} />}
      {deleting && <DeleteOptions remove={remover} view={view} />}
      {marking && <BandOptions band={band} view={view} />}
      {tool === "camera" && <CameraOptions camera={camera} view={view} />}
      {moving && <MoveOptions move={move} view={view} />}
      {tool === "copy" && editable && <CopyTool key={copyTake} name={name} edits={edits} view={view} picked={picked} onWheel={setCopyWheel} onFailed={setCopyFailed} />}
      {menu && (
        <ViewMenu at={menu} object={!!picked?.id} mark={editable ? markLabel : null} canDelete={removable.length > 0 && editable} onClose={closeMenu}
                  onReplace={run.replace} onEdit={editPicked} onMove={run.move} onDuplicate={run.copy}
                  onSmooth={editable && picked?.road ? () => startSmooth(picked.road!) : null}
                  onMark={() => { setMarked([sort ? {sort, tree: false} : {sort: tree!, tree: true}]); view.focus(); }}
                  onDelete={() => { remove(); view.focus(); }}
                  onDeleteSurface={editable && !picked?.id && picked?.surface?.face !== undefined
                    ? () => { remove(vergeCuts ?? vergeAt(picked.surface!)); view.focus(); } : null} />
      )}
      {saving.asking && <SaveDialog title={title} taken={taken} canOverwrite={saving.canSave} onOverwrite={() => void saving.chosen(null)}
                                    onSaveNew={t => void saving.chosen(t)} onCancel={saving.cancel} />}
    </>
  );
}
