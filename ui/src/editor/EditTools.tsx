import {useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, useSyncExternalStore, type RefObject} from "react";
import {createPortal} from "react-dom";
import type {TimedMode} from "../types";
import {useKerbs} from "./tools/useKerbs";
import {useStitch} from "./tools/useStitch";
import {ToolToasts} from "./tools/ToolToasts";
import {useCamera} from "./tools/Camera";
import {CopyTool} from "./tools/Copy";
import {hasUnsavedChanges, TrackEdits, type EditState} from "./state/edits";
import {EditNotes} from "./inspector/EditNotes";
import {useElevation} from "./tools/Elevation";
import {useDelete} from "./tools/Delete";
import {useMove} from "./tools/Move";
import {Models} from "./tools/Models";
import {Groups} from "./tools/Groups";
import {GroupLibrary} from "./library/GroupLibrary";
import type {ObjectGroup} from "./tools/scatter";
import type {LibraryModel} from "./library/ModelLibrary";
import {AssetLibrary, type LibraryTab} from "./library/AssetLibrary";
import {MaterialLibrary} from "./library/MaterialLibrary";
import {NOT_ALL, sortName} from "./scene/inspect";
import {SaveDialog} from "./state/SaveDialog";
import {FileButtons, ToolPanel} from "./tools/ToolPanel";
import type {GlobalKey, Tool} from "./tools/toolDefs";
import {useToolHost, type ToolControllers} from "./tools/toolHost";
import {useBand} from "./tools/useBand";
import {useSeparation} from "./tools/useSeparation";
import {useBank} from "./tools/useBank";
import {useAiLine} from "./tools/useAiLine";
import {useSave} from "./state/useSave";
import type {MenuAt, WheelKeys} from "./types";
import type {TrackView} from "./scene/view";
import {ViewMenu} from "./tools/ViewMenu";
import {Inspector} from "./inspector/Inspector";
import {SceneryControls} from "./inspector/SceneryControls";
import {TransformFields} from "./inspector/TransformFields";
import {KerbFields} from "./inspector/KerbFields";
import {WallFields} from "./inspector/WallFields";
import {useWalls} from "./tools/useWalls";
import {pickedSurfaces, surfaceName} from "./scene/surfaces";
import {usePaint} from "./tools/usePaint";
import type {TextureLook} from "./library/textureLook";
import {thenView} from "./tools/ToolOptions";
import type {SelectAction} from "./tools/selectActions";
import {useSelection} from "./tools/useSelection";
import {useSelect} from "./tools/useSelect";
import {useToasts} from "../components/toastStore";
import {editorToasts} from "./editorToasts";

/** The track name's editing: which tool is on, what is picked or marked, the Library and dialogs. Its buttons go into the sidebar (Save and Play in fileHost, ToolPanel in toolsHost), what is
    to be said below them (EditNotes in notesHost), while the state stays here by the view; over the view the bar of the tool on (its controller's options) and the right-click menu.
    Each tool hook hands its controller to useToolHost, which routes the view's input and the keys (toolDefs.globalKey; they count while the focus is in scene or in
    those hosts). A new tool: its definition (toolDefs), its hook called here and its controller in `controllers`. Mounted anew per track and build (a key in EditorScene). title: the track's; taken: the other
    tracks' titles. elevationSpeed: Elevation's while held, cm a second. onSaved: the track is saved as name (a copy: another one). onDelete: Delete was pressed. */
export function EditTools({name, title, timedMode, visible, taken, view, scene, fileHost, savedHost, toolsHost, notesHost, inspectorHost,
  inspectorWidth, onInspectorWidth, inspectorCollapsed, onInspectorCollapsed, elevationSpeed, reopen, onSaved, onDelete}: {
  name: string;
  title: string;
  timedMode?: TimedMode;
  visible: boolean;
  taken: string[];
  view: TrackView;
  scene: RefObject<HTMLDivElement | null>;
  fileHost: HTMLElement | null;
  savedHost: HTMLElement | null;
  toolsHost: HTMLElement | null;
  notesHost: HTMLElement | null;
  inspectorHost: HTMLElement | null;
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
  const [menu, setMenu] = useState<MenuAt | null>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [copyTake, setCopyTake] = useState(0);
  const [note, setNoteState] = useState<string | null>(null);
  const [toolToast, setToolToast] = useState<{text: string; n: number} | null>(null);
  /** A tool's note: kept for the Inspector's notes, and each one shown as a toast at the view's bottom right (ToolToasts). */
  const setNote = useCallback((text: string | null) => {
    setNoteState(text);
    if (text) setToolToast(previous => ({text, n: (previous?.n ?? 0) + 1}));
  }, []);
  const [viewFailed, setViewFailed] = useState<string | null>(null);
  const [copyFailed, setCopyFailed] = useState<string | null>(null);
  const [groupFailed, setGroupFailed] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const [libraryTab, setLibraryTab] = useState<LibraryTab | null>(null);
  const [group, setGroup] = useState<ObjectGroup | null>(null), [groupModels, setGroupModels] = useState<LibraryModel[]>([]);
  const [groupBusy, setGroupBusy] = useState(false);
  const [replaceTargets, setReplaceTargets] = useState<string[]>([]);
  const editable = edits.canEdit();
  const unsavedAiDraft = useMemo(() => tool === "ai-line" && (!!state.inTurn || hasUnsavedChanges(state)), [tool, state]);
  /** Whether t is the tool on and the track can be changed now. */
  const working = (t: Tool) => tool === t && editable;
  const selection = useSelection({name, view, edits, editable, kerbs: state.kerbs, onKerbRemoved: () => kerbs.setSelected(null), onNote: setNote});
  const {picked, marked, surfacePicks} = selection;
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
  // (Copy, Insert and Groups register their wheel from their own components, which stay mounted with the Library)
  const placingWheel = useRef<(keys: WheelKeys, by: number) => void>(() => {});
  const setPlacingWheel = useCallback((wheel: (keys: WheelKeys, by: number) => void) => { placingWheel.current = wheel; }, []);
  const [aiLineWrites, setAiLineWrites] = useState(0);
  const saving = useSave({name, timedMode, edits, state, view, onSaved: savedName => {
    if (savedName === name) setAiLineWrites(writes => writes + 1);
    onSaved(savedName);
  }});
  const painting = usePaint(name, edits, view);
  const walls = useWalls(name, edits);
  const wallIds = (tool === "select" || tool === "move") && editable ? view.objects.wallIds((picked?.all ?? []).map(p => p.id)) : [];
  const wallSettings = state.walls.find(w => w.id === (picked?.id ?? wallIds[0]));
  const surface = selection.surface;
  const materials = surface?.materials ?? (surface ? [surface.material] : []);
  const materialTarget = wallIds.length ? `${wallIds.length === 1 ? picked?.kind : `${wallIds.length} walls`} (whole wall)`
    : tool === "select" && editable && surface?.tiles.length && !surface.meshes?.length
    && materials.length
    ? materials.map(surfaceName).join(", ") : null;
  const limitedTiles = surface?.truncated && surfacePicks.some(point => point.whole)
    ? new Set(surface.tiles.map(t => t.tile.join(","))).size : undefined;
  const materialReason = !editable ? "This track cannot be edited right now."
    : wallIds.length ? null : surfacePicks.length && !surface ? "Preparing the selected surface…"
    : surface?.meshes?.length ? "This surface uses a separate mesh. Its material cannot be changed yet."
    : !materialTarget ? "Select a painted ground surface to apply a material." : null;
  const paintSurface = painting.apply;
  const applyMaterial = (id: string, variation?: boolean, look?: TextureLook) => wallIds.length ? walls.change(wallIds, {material: id})
    : materialTarget && !materialReason
    // (the tiles shown go with it: ground loaded since does not change what Apply changes)
    ? paintSurface(id, surfacePicks, variation, surface?.tiles.map(t => t.tile), look) : Promise.resolve(false);

  const elevation = useElevation({name, view, edits, enabled: working("elevation"), speed: elevationSpeed, onNote: setNote});
  const band = useBand({name, view, edits, enabled: working("smooth"), revision: state.keptRevision, onNote: setNote});
  const separation = useSeparation({name, view, edits, enabled: working("separate"), revision: state.keptRevision, onNote: setNote});
  const banking = useBank({name, view, edits, enabled: working("bank"), revision: state.keptRevision, heights: state.heights, onNote: setNote});
  const aiLine = useAiLine({name, view, enabled: tool === "ai-line", writes: aiLineWrites,
    unsaved: unsavedAiDraft});
  const kerbs = useKerbs({name, view, edits, kerbs: state.kerbs, enabled: working("kerb"),
    highlightId: tool === "select" ? picked?.kerbId ?? null : null, onNote: setNote, onDelete: () => remove()});
  const stitch = useStitch({name, view, edits, stitches: state.stitches, enabled: working("stitch"), onNote: setNote});
  const inspectorKerb = state.kerbs.find(k => k.id === (tool === "kerb" ? kerbs.selected : picked?.kerbId)) ?? null;
  const camera = useCamera({view, enabled: tool === "camera", onNote: setNote});
  const move = useMove({name, view, edits, state, enabled: working("move"), picked, onNote: setNote, walls: wallIds.length > 0});
  const remover = useDelete({view, edits, enabled: working("delete"), onNote: setNote});
  /** X, Delete or a Delete button: what is picked or marked, the kerb shown, or the road verge (cuts). */
  const remove = (cuts = selection.vergeCuts) => selection.remove(inspectorKerb, cuts);

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
    view.setMenu(setMenu);
    view.setIndexed(revision => edits.bind(revision));
    return () => {
      view.setMenu(() => {});
      view.setIndexed(() => {});
    };
  }, [view, edits]);

  useEffect(() => { view.objects.setRemoved([...state.removed.map(r => r.id), ...(state.treeSpacing?.hidden ?? []), ...(state.carDensity?.hidden ?? [])], state.objectSorts); },
            [view, state.removed, state.objectSorts, state.treeSpacing, state.carDensity]);
  useEffect(() => { view.objects.setRemovedSurfaces(state.surfaces); }, [view, state.surfaces]);

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

  /** The list read again, and if it is of another build than the view shows, the track too. */
  const readAgain = async () => {
    const meshesOf = (s: EditState) => JSON.stringify([s.heights.map(h => h.id), s.placed, s.copies]);
    const shown = meshesOf(state);
    await edits.start();
    if (edits.viewBehind() || meshesOf(edits.state()) !== shown) reopen();     // (the meshes as the list it read says)
  };

  // A conflict (another tab, a build) reads the changes again by itself; at most every few seconds, so a refusal that
  // repeats cannot loop.
  const lastRead = useRef(0);
  const readAgainEvent = useEffectEvent(() => { lastRead.current = Date.now(); void readAgain(); });
  useEffect(() => {
    if (state.save === "stuck" && Date.now() - lastRead.current > 5000) readAgainEvent();
  }, [state.save]);

  const removable = selection.removable;
  const ids = [...state.removed.map(r => r.id), ...(state.treeSpacing?.hidden ?? []), ...(state.carDensity?.hidden ?? [])];
  const sort = picked?.id && picked.sort && !NOT_ALL.has(picked.sort) ? picked.sort : null;
  const markLabel = !menu ? null : sort ? `Mark all ${sortName(sort)} (${view.objects.countOfListed(sort, ids, state.objectSorts)})` : null;

  /** Take up next (useToolHost.switchTool): the selection's requests on their way are dropped, the tool on is cleared. */
  const switchTo = (next: Tool) => { selection.dropRequests(); switchTool(next); };
  /** A tool's button or key: taken up, or laid down for Select when it is on. A picked kerb or road becomes its selected range or start. */
  const takeUp = (t: Tool) => {
    const next = tool === t ? "select" : t;
    if (next === "move" && wallIds.length) onInspectorCollapsed(false);
    setMenu(null); selection.release();
    switchTo(next);
  };
  const closeMenu = useCallback(() => setMenu(null), []);
  const startSmooth = (road: [number, number]) => { setMenu(null); switchTo("smooth"); band.start(road[0], road[1], picked?.position[1]); setNote(null); view.focus(); };
  /** Edit… of the menu: Select on, the picked ground selected, its textures open, the inspector shown. */
  const editPicked = () => {
    if (tool !== "select") switchTo("select");
    if (picked?.surface) {
      selection.setSurfacePicks(previous => pickedSurfaces(tool === "select" ? previous : [], {surface: picked.surface, left: false}));
      if (picked.surface.face === undefined) setMaterialOpen(true);
    }
    onInspectorCollapsed(false); view.focus();
  };
  const movable = editable && !!picked?.id && view.mover.canMove(picked.id);
  /** What can be done with what is picked, for the right-click menu and the Select bar: null where it can't now. */
  const run: Record<SelectAction, (() => void) | null> = {
    texture: picked?.surface ? editPicked : null,
    move: movable || wallIds.length ? () => { switchTo("move"); setNote(null); onInspectorCollapsed(false); view.focus(); } : null,
    copy: movable ? () => { setCopyTake(n => n + 1); switchTo("copy"); setNote(null); view.focus(); } : null,
    replace: editable && replaceable?.length ? openModels : null,
    delete: editable && (removable.length > 0 || !!selection.vergeCuts || !!selection.section || (tool === "select" && !!inspectorKerb)) ? () => { remove(); view.focus(); } : null,
    kerb: editable && picked?.kerbId && state.kerbs.some(k => k.id === picked.kerbId)
      ? () => { takeUp("kerb"); setNote(null); view.focus(); } : null,
  };
  const select = useSelect({view, on: tool === "select", selection, sort, run});

  const placing = {wheel: (keys: WheelKeys, by: number) => placingWheel.current(keys, by), takesWheel: true};
  const controllers: ToolControllers = {
    select: select.controller, camera: camera.controller, smooth: band.controller, separate: separation.controller, bank: banking.controller, kerb: kerbs.controller,
    stitch: stitch.controller, "ai-line": aiLine, elevation: elevation.controller, move: move.controller, delete: remover.controller,
    copy: {...placing, options: <CopyTool key={copyTake} name={name} edits={edits} view={view} picked={picked} onWheel={setPlacingWheel} onFailed={setCopyFailed} />},
    // (Insert and Groups draw their bars themselves: they stay mounted with the Library)
    model: placing, group: placing,
  };
  /** An Editor shortcut (toolDefs.globalKey), before any tool's own keys. */
  const onGlobal = (action: GlobalKey) => {
    if (action === "escape") {
      setMenu(null); selection.setMarked([]); selection.setSurfacePicks([]);
      view.brush.cancelStroke();
      view.selection.unpick();
      switchTo("select");        // (with it go a marking and a ride)
      view.focus();
    } else if (action === "delete") remove();
    else if (action === "library") { if (editable) openModels(); }
    else if (action === "home") view.home();
    else if (action === "undo") void edits.inTurn(() => edits.undo());
    else if (action === "redo") void edits.inTurn(() => edits.redo());
    else if (action === "save") void saving.save();
    else takeUp(action.tool);
  };
  const {switchTool, options} = useToolHost({view, tool, setTool, editable, picked, deletable: selection.deletable(inspectorKerb), controllers,
    onPick: selection.take, onGlobal, keyHosts: [scene, fileHost, toolsHost, notesHost, inspectorHost], paused: saving.asking});

  // (what goes wrong outside any window, and Saving: a toast at the top centre while the Editor's tab is open, with its way out;
  // ×'d, it stays away until its text changes)
  const problems = editorToasts({viewFailed, copyFailed, groupFailed, saveFailed: saving.failed, save: state.save, error: state.error, outdated: state.outdated,
    saving: saving.busy, waiting: saving.waiting, refused: state.refused},
    dismissed, {reopen: thenView(view, reopen), readAgain: thenView(view, () => void readAgain()), giveUp: thenView(view, () => edits.discardOutdated())});
  useToasts(!visible ? [] : problems.map(t => ({...t, onDismiss: () => {
    setDismissed(previous => new Set(previous).add(t.key));
    if (t.id === "edit-copy-failed") setCopyFailed(null);
    if (t.id === "edit-group-failed") setGroupFailed(null);
  }})));

  return (
    <>
      {fileHost && createPortal(<FileButtons edits={edits} view={view} saving={saving} onLibrary={openLibrary} />, fileHost)}
      {savedHost && createPortal(saving.savedText, savedHost)}
      {toolsHost && createPortal(<ToolPanel state={state} edits={edits} view={view} tool={tool} onTool={t => { takeUp(t); setNote(null); }} onModels={openModels} />, toolsHost)}
      <Models name={name} view={view} edits={edits} replace={replaceTargets} enabled={working("model")}
        onWheel={setPlacingWheel}
        choosing={libraryTab === "objects"} onClose={closeMaterial} onPlace={() => switchTo("model")}
        renderLibrary={(objects, busy) => <AssetLibrary tab={libraryTab} onTab={tab => { if (tab === "objects") openModels(); else setLibraryTab(tab); }} onClose={closeMaterial} busy={busy || painting.busy || walls.busy || groupBusy} objects={objects}
          groups={<GroupLibrary open={libraryTab === "groups"} onBusy={setGroupBusy} onClose={closeMaterial} onChoose={(chosen, models) => {
            setGroup(chosen); setGroupModels(models); switchTo("group"); closeMaterial(); view.focus();
          }} />}
          textures={<MaterialLibrary embedded open={libraryTab === "textures"} target={materialTarget} reason={materialReason} limitedTiles={wallIds.length ? undefined : limitedTiles} colourOnly={!!wallIds.length}
            busy={painting.busy || walls.busy} progress={wallIds.length ? null : painting.progress} error={wallIds.length ? walls.error : painting.error} onApply={applyMaterial} onClose={closeMaterial} />} />} />
      <Groups name={name} view={view} edits={edits} group={group} models={groupModels} enabled={working("group") && !libraryTab} onWheel={setPlacingWheel} onFailed={setGroupFailed} />
      {inspectorHost && createPortal(<Inspector name={name} picked={tool === "kerb" && inspectorKerb && picked?.kerbId !== inspectorKerb.id ? null : picked}
        surfaces={tool === "select" ? surfacePicks : []} activeTool={tool}
        standaloneAppearance={inspectorKerb ? view.kerbAppearance(inspectorKerb.id) : null}
        kerbControls={editable && inspectorKerb ? <KerbFields edit={inspectorKerb} onChange={patch => edits.updateKerb(inspectorKerb.id, patch)} /> : null}
        scenery={<>
          <SceneryControls key={`${name}-trees`} kind="trees" name={name} edits={edits} state={state} objects={view.objects} visible={visible}
            selection={() => view.selection.treeSpacingTargets(marked, state.treeSpacing?.hidden)} />
          <SceneryControls key={`${name}-cars`} kind="cars" name={name} edits={edits} state={state} objects={view.objects} visible={visible}
            selection={() => view.selection.carDensityTargets(marked, state.carDensity?.hidden)} />
        </>}
        notes={<EditNotes state={state} note={note}
          picked={(working("smooth") && !picked?.id) || (tool === "select" && picked?.surface) ? null : picked} sort={sort}
          markedName={marked.length ? marked.map(g => sortName(g.sort)).join(", ") : null}
        />}
        marked={marked} view={view} state={state} width={inspectorWidth} onWidth={onInspectorWidth}
        collapsed={inspectorCollapsed} onCollapsed={onInspectorCollapsed} onSurface={selection.onSurface}
        onMaterialOpen={() => setMaterialOpen(true)} restyling={editable ? painting : null} textureRevision={textureRevision}
        transform={editable && (wallIds.length ? <WallFields rise={wallSettings?.rise ?? 0} textured={!!wallSettings?.material} busy={walls.busy} error={walls.error}
          onHeight={rise => walls.change(wallIds, {rise})} onTexture={() => { setMenu(null); setLibraryTab("textures"); }}
          onOriginal={() => walls.change(wallIds, {material: null})} onReset={() => walls.change(wallIds, {reset: true})} /> : <TransformFields move={move} />)} />, inspectorHost)}
      {options}
      <ToolToasts note={toolToast} />
      {menu && (
        <ViewMenu at={menu} object={!!picked?.id} mark={editable ? markLabel : null} canDelete={removable.length > 0 && editable} onClose={closeMenu}
                  onReplace={run.replace} onEdit={editPicked} onMove={run.move} onDuplicate={run.copy}
                  onSmooth={editable && picked?.road ? () => startSmooth(picked.road!) : null}
                  onMark={() => { if (sort) selection.setMarked([{sort}]); view.focus(); }}
                  onDelete={() => { remove(); view.focus(); }}
                  onDeleteSurface={editable && !picked?.id && picked?.surface?.face !== undefined
                    ? () => { remove(selection.vergeCuts ?? selection.vergeAt(picked.surface!)); view.focus(); } : null} />
      )}
      {saving.asking && <SaveDialog title={title} taken={taken} canOverwrite={saving.canSave} onOverwrite={() => void saving.chosen(null)}
                                    onSaveNew={t => void saving.chosen(t)} onCancel={saving.cancel} onDelete={onDelete} />}
      {saving.dialog}
    </>
  );
}
