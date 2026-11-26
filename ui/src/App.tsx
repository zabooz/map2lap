import {lazy, Suspense, useCallback, useLayoutEffect, useRef, useState, type ReactNode} from "react";
import {post} from "./api";
import styles from "./App.module.css";
import {BuildPanel} from "./components/BuildPanel";
import {BuildLog} from "./components/BuildLog";
import {EditorPanel} from "./components/EditorPanel";
import {ErrorBoundary} from "./components/ErrorBoundary";
import {InstallationToast} from "./components/InstallationToast";
import {ToastHost} from "./components/Toasts";
import {useToasts} from "./components/toastStore";
import {loadingToast} from "./editor/editorToasts";
import type {Say} from "./editor/scene/view";
import {installationNotice, type InstallationTarget} from "./components/installationNotice";
import {activeInstallation, settingsAttention} from "./components/settingsAttention";
import {FeedbackDialog} from "./components/FeedbackDialog";
import {useFeedback} from "./hooks/useFeedback";
import {BugIcon, EditorIcon, GearIcon, MyTracksIcon, NewTrackIcon} from "./components/icons";
import {groupOf, MyTracksPane, trackMode, type TrackFilter} from "./components/MyTracksPane";
import {NewTrackPane} from "./components/NewTrackPane";
import {SettingsDialog} from "./components/SettingsDialog";
import {CardCode, PlayButton, StatusCard} from "./components/StatusCard";
import {TrackMap} from "./components/TrackMap";
import {ThemeSwitch} from "./components/ThemeSwitch";
import {useBuild} from "./hooks/useBuild";
import {useControls} from "./hooks/useControls";
import {useCspStatus} from "./hooks/useCspStatus";
import {useNewTrack, type MapMove} from "./hooks/useNewTrack";
import {usePlay} from "./hooks/usePlay";
import {useRelease} from "./hooks/useRelease";
import {useSettings} from "./hooks/useSettings";
import {useStored} from "./hooks/useStored";
import {useTracks} from "./hooks/useTracks";
import type {BuildOptions, EditorLoadStatus, Mode, Tab, TimedMode, Track, TrackGroup} from "./types";

const EditorScene = lazy(() => import("./editor/EditorScene"));

const TABS: readonly Tab[] = ["new", "mine", "edit"];
const GROUPS: readonly TrackGroup[] = ["built", "edited"];

const NO_AC = "Assetto Corsa not found: choose its folder under Settings";
const timedMode = (kind?: Mode, abTiming?: boolean): TimedMode | undefined =>
  kind === "circuit" ? "circuit" : abTiming ? "route" : undefined;
const HINTS: Record<Mode | Exclude<Tab, "new">, string> = {
  route: "Click to set start, finish and waypoints · drag to move · right-click to remove",
  area: "Press and drag to draw the area · drag a corner to resize · \"Clear\" removes it",
  circuit: "Click to set pins in driving order · drag to move · right-click to remove",
  mine: "Pick one of your tracks to see it on the map",
  edit: "",
};

export function App() {
  const [tab, setTab] = useStored<Tab>("map2lap.tab", "new", TABS);
  const panelBody = useRef<HTMLDivElement>(null);
  const previousTab = useRef(tab);
  useLayoutEffect(() => {
    if (tab === previousTab.current) return;
    previousTab.current = tab;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fade = panelBody.current?.animate([{opacity: 0.55}, {opacity: 1}], {duration: 140, easing: "ease-out"});
    return () => fade?.cancel();
  }, [tab]);
  const [editorSeen, setEditorSeen] = useState(tab === "edit");
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");
  const [trackSearch, setTrackSearch] = useState("");
  const [group, setGroup] = useStored<TrackGroup>("map2lap.myTracks", "built", GROUPS);
  const [editTrack, setEditTrack] = useStored<string>("map2lap.editTrack", "");
  const [editStatus, setEditStatus] = useState<EditorLoadStatus>({text: ""});
  const reportEditLoad = useCallback<Say>((text, progress, about) => setEditStatus({text, progress, ...about}), []);
  const [loadDismissed, setLoadDismissed] = useState<EditorLoadStatus | null>(null);   // (a failure ×'d: away until another one)
  const loadToast = loadingToast(editStatus);
  useToasts(tab !== "edit" || !loadToast || loadDismissed === editStatus ? [] : [{...loadToast, onDismiss: () => setLoadDismissed(editStatus)}]);
  const [fileHost, setFileHost] = useState<HTMLDivElement | null>(null);       // (where in the sidebar the 3D view's Save and Play are drawn)
  const [savedHost, setSavedHost] = useState<HTMLSpanElement | null>(null);   // (the save state beside loading progress)
  const [toolsHost, setToolsHost] = useState<HTMLDivElement | null>(null);     // (... and its tools)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTarget, setSettingsTarget] = useState<InstallationTarget | null>(null);
  const [acknowledgedCspVersion, setAcknowledgedCspVersion] = useStored<string>("map2lap.acknowledgedCspVersion", "");
  const [picks, setPicks] = useState<Record<TrackGroup, string | null>>({built: null, edited: null});
  const [showResult, setShowResult] = useState(true);   // false: the selection is newer than the last build's result
  const [move, setMove] = useState<MapMove | null>(null);
  const buildLog = useRef<HTMLPreElement>(null);
  const [rebuildOptions, setRebuildOptions] = useState<Record<string, Partial<BuildOptions & {width: number}>>>({});

  const {tracks, car, reload} = useTracks();
  const settings = useSettings();
  const patch = useCspStatus(settings.settings?.ac_ok ? settings.settings.ac_path : null);
  const installation = activeInstallation(installationNotice(settings.settings?.ac_ok, patch.info, patch.error), acknowledgedCspVersion);
  const version = settings.settings?.version ?? "";
  const release = useRelease(settings.settings?.version);
  const attention = settingsAttention(installation, release.newer);
  const build = useBuild(() => setShowResult(true), () => void reload());
  const {starting, choose, dialog: playDialog} = usePlay();
  const {controls, save: saveControls} = useControls();

  const chooseTab = (t: Tab) => {
    setTab(t);
    if (t === "mine") setShowResult(false);
    if (t === "edit") setEditorSeen(true);
    if (t !== "new") void reload();
  };
  const track = useNewTrack(() => setShowResult(false), () => setTab("new"), setMove);
  const closeSettings = useCallback(() => { setSettingsOpen(false); setSettingsTarget(null); }, []);
  const openInstallation = (target: InstallationTarget) => { setSettingsTarget(target); setSettingsOpen(true); };

  const acOk = settings.settings?.ac_ok ?? true;       // (an AC folder to install into: without it nothing can be built)

  const mine = tab === "mine", {busy, status} = build;
  const groupTracks = tracks.filter(t => groupOf(t) === group);
  const query = trackSearch.trim().toLowerCase();
  const shownTracks = groupTracks.filter(t => (trackFilter === "all" || trackMode(t) === trackFilter)
    && (t.title.toLowerCase().includes(query) || t.name.toLowerCase().includes(query)));
  const picked = mine ? shownTracks.find(t => t.name === picks[group]) ?? shownTracks[0] : undefined;
  const pick = picked?.name ?? null;
  const showBuildOptions = tab === "new" || (mine && group === "built" && !!picked);
  const options: BuildOptions = mine ? {terrain_cell_m: picked?.terrain_cell_m ?? 2, parked_cars: picked?.parked_cars ?? true,
    tree_spacing_m: picked?.tree_spacing_m ?? 0, ground_quality: picked?.ground_quality ?? "sd", ...(picked ? rebuildOptions[picked.name] : {})} : track.options;
  const setOptions = (value: Partial<BuildOptions>) => {
    if (mine && picked) setRebuildOptions(old => ({...old, [picked.name]: {...old[picked.name], ...value}}));
    else track.setOptions(value);
  };
  const width = mine ? (picked && rebuildOptions[picked.name]?.width) ?? picked?.width ?? 100 : track.width;
  const setWidth = (value: number) => {
    if (mine && picked) setRebuildOptions(old => ({...old, [picked.name]: {...old[picked.name], width: value}}));
    else track.setWidth(value);
  };
  const editing = tracks.find(t => t.name === editTrack && t.kn5_bytes);      // (deleted meanwhile: none)
  const shownEditTrack = editing ? editTrack : "";
  const result = ["done", "error", "stopped"].includes(status.state) && showResult;
  const installed = tracks.find(t => t.name === status.result?.name);
  const outdated = tracks.some(t => t.outdated);
  const playTitle = (kind?: Mode) => !acOk ? NO_AC : kind === "circuit" ? "Drive this Circuit in Assetto Corsa"
    : car ? `Practice with ${car}, the car you drove last` : "Practice with the car you drove last";

  const pickTrack = (t: Track) => {
    setPicks(old => ({...old, [groupOf(t)]: t.name}));
    setShowResult(false);
    if (!t.area && t.kind === "circuit") {
      const coords = t.line ?? t.points;
      if (coords.length) setMove({kind: "fitCircuit", coords, padding: 40, maxZoom: 16});
      return;
    }
    const bounds = t.area ? [[t.area[0], t.area[1]], [t.area[2], t.area[3]]] as [number, number][] : t.line ?? t.points;
    setMove({kind: "fit", bounds, padding: 40, maxZoom: 16});
  };

  const start = async (url: string, body: unknown) => {
    const refused = await build.start(url, body);
    if (refused && /Settings/.test(refused)) setSettingsOpen(true);
    if (!refused) buildLog.current?.focus({preventScroll: true});
    return refused;
  };

  const editPickedTrack = () => {
    if (!picked) return;
    setEditTrack(picked.name);
    chooseTab("edit");
  };

  const onGo = () => {
    if (busy) void build.stop();
    else if (picked?.edited) editPickedTrack();
    else if (mine) {
      const warning = picked?.draft ? `This track has ${picked.draft} unsaved ${picked.draft === 1 ? "change" : "changes"} in the Editor.\n\nThey no longer fit a new build and stay out until you give them up. Go on?` : null;
      if (picked && (!warning || confirm(warning))) void start("/api/rebuild", {name: picked.name, ...options,
        ...(picked.area ? {} : {width})});
    }
    else void start("/api/build", track.buildBody());
  };

  /** Saved in the Editor: the list again (a title or a copy new), and a copy shown once it is in it. */
  const onSaved = useCallback(async (name: string) => {
    await reload();
    setEditTrack(name);
  }, [reload, setEditTrack]);

  /** One of our tracks deleted, once asked: the one picked in My tracks or the one open in the Editor. */
  const deleteTrack = async (gone: {name: string; title: string}) => {
    if (!confirm(`Delete “${gone.title}”?\n\nIt is removed from Assetto Corsa. This cannot be undone.`)) return;
    const r = await post("/api/delete", {name: gone.name});
    if (r.error) alert(r.error);
    else {
      if (picked?.name === gone.name) setPicks(old => ({...old, [group]: null}));
      void reload();
    }
  };

  const goDisabled = status.state === "stopping" || (!busy && (!acOk || !(mine ? picked : track.selection?.ok)));
  const goText = busy ? (status.state === "stopping" ? "Stopping …" : "Stop build") : !mine ? "Build track" : group === "edited" ? "Edit" : "Rebuild";
  const goTitle = busy ? undefined : !acOk ? NO_AC : !mine ? undefined : group === "edited" ? "Open it in the Editor" : "Build it again with this version and replace it";

  const startPlay = (name: string, kind?: Mode, abTiming?: boolean) => {
    choose(name, timedMode(kind, abTiming));
  };
  const playButton = (name: string, kind?: Mode, abTiming?: boolean) => (
    <PlayButton title={playTitle(kind)} disabled={!acOk || starting} starting={starting} onClick={() => void startPlay(name, kind, abTiming)} />
  );

  const workspaceButton = (t: Tab, name: string, testId: string, icon: ReactNode, detail?: string) => (
    <button type="button" data-testid={testId} className={styles.destination}
            aria-label={name} aria-description={detail} title={detail ? `${name} · ${detail}` : name}
            aria-current={tab === t ? "page" : undefined} onClick={() => chooseTab(t)}>
      {icon}
    </button>
  );

  const feedback = useFeedback();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const unread = feedback.reports.some(feedback.unread);
  const openFeedback = () => { setFeedbackOpen(true); void feedback.reload(true); };
  const hint = HINTS[tab === "new" ? track.mode : tab];

  return (
    <>
      <nav data-testid="workspace-nav" className={styles.rail} aria-label="Workspaces" inert={settingsOpen}>
        <div data-testid="nav-logo" className={styles.mark} aria-hidden="true" />
        <div className={styles.workspaces} data-active={tab}>
          {workspaceButton("new", "New track", "nav-new-track", <NewTrackIcon />)}
          {workspaceButton("mine", "My tracks", "nav-my-tracks", <>
            <MyTracksIcon />
            {tracks.length > 0 && <span aria-hidden="true" className={`${styles.count}${outdated ? ` ${styles.warn}` : ""}`}>{tracks.length}</span>}
          </>, `${tracks.length} ${tracks.length === 1 ? "track" : "tracks"}${outdated ? " · Some tracks were built with an older version" : ""}`)}
          {workspaceButton("edit", "Editor", "nav-editor", <EditorIcon />)}
          <span className={styles.indicator} data-testid="nav-indicator" aria-hidden="true" />
        </div>
        <button type="button" data-testid="report-bug" className={`${styles.destination} ${styles.reportBug}`}
                title="Report a bug" aria-label={unread ? "Report a bug · Unread updates" : "Report a bug"}
                aria-haspopup="dialog" onClick={openFeedback}>
          <BugIcon />
          {unread && <span aria-hidden="true" className={styles.attention}>!</span>}
        </button>
        <ThemeSwitch className={styles.destination} />
        <button type="button" data-testid="nav-settings" className={`${styles.destination} ${styles.gear}`}
                aria-label="Settings" aria-haspopup="dialog" aria-expanded={settingsOpen}
                title={attention ?? "Settings"} onClick={() => setSettingsOpen(true)}>
          <GearIcon />
          {attention && <span className={styles.attention} aria-hidden="true">!</span>}
        </button>
      </nav>
      <aside className={styles.sidebar} inert={settingsOpen}>
        <div className={styles.head}>
          <div className={styles.brand}>
            <b>Map2Lap</b>
            <span data-testid="app-version">Real roads for Assetto Corsa{version && ` · v${version}`}</span>
          </div>
          {release.newer && (
            <button className={styles.update} title={`Map2Lap ${release.newer} is out (you have ${version}): open Settings`}
                    onClick={() => setSettingsOpen(true)}>v{release.newer} available</button>
          )}
        </div>

        <div ref={panelBody} className={styles.panelBody} data-testid="workspace-panel">
          <EditorPanel tracks={tracks} choice={shownEditTrack} status={editStatus} hidden={tab !== "edit"} fileRef={setFileHost} savedRef={setSavedHost} toolsRef={setToolsHost} onChoose={setEditTrack} />

          <div id="work" className="view" hidden={tab === "edit"}>
            <div className={`${styles.panes}${mine ? ` ${styles.mine}` : ""}`}>
              <NewTrackPane track={track} off={tab !== "new"} busy={busy} onMove={setMove} />
              {mine && <MyTracksPane tracks={shownTracks} group={group} pick={pick} search={trackSearch} filter={trackFilter}
                onFilter={value => { setTrackFilter(value); setShowResult(false); }}
                onSearch={value => { setTrackSearch(value); setShowResult(false); }}
                onGroup={value => { setGroup(value); setShowResult(false); }} onPick={pickTrack} />}
            </div>

            {showBuildOptions && <BuildPanel options={options} onOptions={setOptions}
                        corridor={(mine ? picked && !picked.area : track.mode !== "area") ? {width, onWidth: setWidth} : undefined}
                        disabled={busy} />}

            <div id="actions" className={`${styles.actions}${mine ? ` ${styles.mine}` : ""}`}>
              {mine && group === "built" && (
                <button title={acOk ? "Keep this track and build a new one next to it" : NO_AC}
                        disabled={busy || !picked || !acOk}
                        onClick={() => {      // (the new one is a build: it will stand under Built)
                          if (picked) void start("/api/rebuild", {name: picked.name, copy: true, ...options,
                            ...(picked.area ? {} : {width})}).then(refused => { if (!refused) setGroup("built"); });
                        }}>Build as copy</button>
              )}
              <button data-testid="build-action" id="go" className={busy ? styles.danger : styles.primary} title={goTitle} disabled={goDisabled} onClick={onGo}>{goText}</button>
              {mine && group === "built" && (
                <button type="button" data-testid="my-tracks-edit" title="Open this track in the Editor"
                        disabled={busy || !acOk || !picked?.kn5_bytes} onClick={editPickedTrack}>Edit</button>
              )}
              {mine && (
                <button className={styles.playAct} title={playTitle(picked?.kind)} onClick={() => { if (picked) void startPlay(picked.name, picked.kind, picked.ab_timing); }}
                        disabled={busy || !picked?.kn5_bytes || starting || !acOk}>{starting ? "Starting …" : "▶ Play"}</button>
              )}
            </div>

          </div>
        </div>
      </aside>

      <main className={`${styles.main}${tab !== "edit" ? ` ${styles.withDetails}` : ""}`} inert={settingsOpen}>
        <div className={styles.mapSpace}>
          <TrackMap tab={tab} track={track} picked={picked} move={move} />
          {hint && <div data-testid="map-hint" className={styles.hint}>{hint}</div>}
        </div>
        {tab !== "edit" && <aside data-testid="track-details" className={styles.details} aria-label="Track details">
          <StatusCard status={status} showResult={showResult} tab={tab} mode={track.mode} group={group} picked={picked}
                      installed={installed} title={track.title.trim()} selection={track.selection} width={track.width}
                      options={options} hasTracks={groupTracks.length > 0} version={version}
                      playButton={playButton} footer={!busy && !result && picked && (
            <CardCode code={picked.edited ? null : picked.code ?? ""} onDelete={() => void deleteTrack(picked)} />
          )} />
          {showBuildOptions && <BuildLog box={buildLog} text={build.log} started={status.started} />}
        </aside>}
        {editorSeen && (
          <ErrorBoundary message="The 3D view could not start">
            <Suspense fallback={null}>
              <EditorScene routeTrack={!!editing && editing.kind !== "area"} name={shownEditTrack} title={editing?.title ?? ""} timedMode={timedMode(editing?.kind, editing?.ab_timing)}
                           taken={tracks.filter(t => t !== editing).map(t => t.title)}
                           built={editing?.built ?? null} visible={tab === "edit"} controls={controls} fileHost={fileHost} savedHost={savedHost} toolsHost={toolsHost}
                           onStatus={reportEditLoad} onSaved={onSaved} onDelete={() => { if (editing) void deleteTrack(editing); }} />
            </Suspense>
          </ErrorBoundary>
        )}
      </main>

      {feedbackOpen && <FeedbackDialog feedback={feedback} close={() => setFeedbackOpen(false)} />}
      {settingsOpen && (
        <SettingsDialog settings={settings} release={release} patch={patch} focusTarget={settingsTarget} busy={busy} controls={controls} onControls={saveControls}
                        onCar={() => void reload()} onClose={closeSettings} onReportBug={() => { closeSettings(); openFeedback(); }} />
      )}
      {playDialog}
      {!feedbackOpen && <ToastHost />}
      {installation && <InstallationToast key={`${settings.settings?.ac_path}:${installation.id}`} notice={installation} hidden={settingsOpen}
        onOpen={openInstallation} onDismiss={() => { if (installation.id.startsWith("csp-version-")) setAcknowledgedCspVersion(installation.id); }} />}
    </>
  );
}
