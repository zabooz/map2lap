import {lazy, Suspense, useCallback, useState, type ReactNode} from "react";
import {post} from "./api";
import styles from "./App.module.css";
import {BuildLog} from "./components/BuildLog";
import {EditorPanel} from "./components/EditorPanel";
import {ErrorBoundary} from "./components/ErrorBoundary";
import {GearIcon} from "./components/icons";
import {groupOf, MyTracksPane} from "./components/MyTracksPane";
import {NewTrackPane} from "./components/NewTrackPane";
import {SettingsDialog} from "./components/SettingsDialog";
import {CardCode, PlayButton, StatusCard} from "./components/StatusCard";
import {TrackMap} from "./components/TrackMap";
import {useBuild} from "./hooks/useBuild";
import {useControls} from "./hooks/useControls";
import {useNewTrack, type MapMove} from "./hooks/useNewTrack";
import {usePlay} from "./hooks/usePlay";
import {useRelease} from "./hooks/useRelease";
import {useSettings} from "./hooks/useSettings";
import {useStored} from "./hooks/useStored";
import {useTracks} from "./hooks/useTracks";
import type {Tab, Track, TrackGroup} from "./types";

const EditorScene = lazy(() => import("./editor/EditorScene"));

const TABS: readonly Tab[] = ["new", "mine", "edit"];
const GROUPS: readonly TrackGroup[] = ["built", "edited"];

const NO_AC = "Assetto Corsa not found: choose its folder under Settings";
const HINTS: Record<string, string> = {
  route: "Click to set start, finish and waypoints · drag to move · right-click to remove",
  area: "Press and drag to draw the area · drag a corner to resize · \"Clear\" removes it",
  mine: "Pick one of your tracks to see it on the map",
  edit: "",
};

export function App() {
  const [tab, setTab] = useStored<Tab>("map2lap.tab", "new", TABS);
  const [editorSeen, setEditorSeen] = useState(tab === "edit");
  const [group, setGroup] = useStored<TrackGroup>("map2lap.myTracks", "built", GROUPS);
  const [editTrack, setEditTrack] = useStored<string>("map2lap.editTrack", "");
  const [editStatus, setEditStatus] = useState("");
  const [fileHost, setFileHost] = useState<HTMLDivElement | null>(null);       // (where in the sidebar the 3D view's Save and Play are drawn)
  const [toolsHost, setToolsHost] = useState<HTMLDivElement | null>(null);     // (... and its tools)
  const [notesHost, setNotesHost] = useState<HTMLDivElement | null>(null);
  const [settingsChoice, setSettingsOpen] = useState<boolean | null>(null);    // null: opened or closed by nobody yet
  const [pick, setPick] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(true);   // false: the selection is newer than the last build's result
  const [move, setMove] = useState<MapMove | null>(null);

  const {tracks, car, reload} = useTracks();
  const settings = useSettings();
  const version = settings.settings?.version ?? "";
  const release = useRelease(settings.settings?.version);
  const build = useBuild(() => setShowResult(true), () => void reload());
  const {starting, play} = usePlay();
  const {controls, save: saveControls} = useControls();

  const chooseTab = (t: Tab) => {
    setTab(t);
    if (t === "edit") setEditorSeen(true);
    if (t !== "new") void reload();
  };
  const track = useNewTrack(() => setShowResult(false), () => setTab("new"), setMove);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const acOk = settings.settings?.ac_ok ?? true;       // (an AC folder to install into: without it nothing can be built)
  const settingsOpen = settingsChoice ?? !acOk;        // (no AC folder: the settings open by themselves)

  const mine = tab === "mine", {busy, status} = build;
  const picked = mine ? tracks.find(t => t.name === pick && groupOf(t) === group) : undefined;
  const editing = tracks.find(t => t.name === editTrack && t.kn5_bytes);      // (deleted meanwhile: none)
  const shownEditTrack = editing ? editTrack : "";
  const result = ["done", "error", "stopped"].includes(status.state) && showResult;
  const outdated = tracks.some(t => t.outdated);
  const playTitle = !acOk ? NO_AC : car ? `Practice with ${car}, the car you drove last` : "Practice with the car you drove last";

  const pickTrack = (t: Track) => {
    setPick(t.name);
    setShowResult(false);
    const bounds = t.area ? [[t.area[0], t.area[1]], [t.area[2], t.area[3]]] as [number, number][] : t.line ?? t.points;
    setMove({kind: "fit", bounds, padding: 40, maxZoom: 16});
  };

  const start = async (url: string, body: unknown) => {
    const refused = await build.start(url, body);
    if (refused && /Settings/.test(refused)) setSettingsOpen(true);
    return refused;
  };

  const onGo = () => {
    if (busy) void build.stop();
    else if (picked?.edited) {
      setEditTrack(picked.name);
      chooseTab("edit");
    }
    else if (mine) {
      const warning = picked?.draft ? `This track has ${picked.draft} unsaved ${picked.draft === 1 ? "change" : "changes"} in the Editor.\n\nThey no longer fit a new build and stay out until you give them up. Go on?` : null;
      if (picked && (!warning || confirm(warning))) void start("/api/rebuild", {name: picked.name});
    }
    else void start("/api/build", track.buildBody());
  };

  /** Saved in the Editor: the list again (a title or a copy new), and a copy shown once it is in it. */
  const onSaved = useCallback(async (name: string) => {
    await reload();
    setEditTrack(name);
  }, [reload, setEditTrack]);

  const deletePicked = async () => {
    if (!picked || !confirm(`Delete “${picked.title}”?\n\nIt is removed from Assetto Corsa. This cannot be undone.`)) return;
    const r = await post("/api/delete", {name: picked.name});
    if (r.error) alert(r.error);
    else {
      setPick(null);
      void reload();
    }
  };

  const goDisabled = status.state === "stopping" || (!busy && (!acOk || !(mine ? picked : track.selection?.ok)));
  const goText = busy ? (status.state === "stopping" ? "Stopping …" : "Stop build") : !mine ? "Build track" : group === "edited" ? "Edit" : "Rebuild";
  const goTitle = busy ? undefined : !acOk ? NO_AC : !mine ? undefined : group === "edited" ? "Open it in the Editor" : "Build it again with this version and replace it";

  const playButton = (name: string) => (
    <PlayButton title={playTitle} disabled={!acOk || starting} starting={starting} onClick={() => void play(name)} />
  );

  const tabButton = (t: Tab, text: string, extra?: ReactNode) => (
    <button id={`t-${t}`} className={tab === t ? "on" : ""} onClick={() => chooseTab(t)}>{text}{extra}</button>
  );

  const hint = HINTS[tab === "new" ? track.mode : tab];

  return (
    <>
      <aside className={styles.sidebar} inert={settingsOpen}>
        <div className={styles.head}>
          <div className={styles.mark} />
          <div className={styles.brand}>
            <b>Map2Lap</b>
            <span>Real roads for Assetto Corsa{version && ` · v${version}`}</span>
          </div>
          {release.newer && (
            <button className={styles.update} title={`Map2Lap ${release.newer} is out (you have ${version}): open Settings`}
                    onClick={() => setSettingsOpen(true)}>v{release.newer} available</button>
          )}
          <button id="t-set" className={`${styles.gear}${settingsOpen ? ` ${styles.on}` : ""}${acOk ? "" : ` ${styles.warn}`}`} title="Settings"
                  aria-label="Settings" onClick={() => setSettingsOpen(true)}><GearIcon /></button>
        </div>

        <nav className="tabs">
          {tabButton("new", "New track")}
          {tabButton("mine", "My tracks ", tracks.length > 0 && (
            <span className={`${styles.count}${outdated ? ` ${styles.warn}` : ""}`}
                  title={outdated ? "Some tracks were built with an older version" : undefined}>{tracks.length}</span>
          ))}
          {tabButton("edit", "Editor")}
        </nav>

        <EditorPanel tracks={tracks} choice={shownEditTrack} status={editStatus} hidden={tab !== "edit"} fileRef={setFileHost} toolsRef={setToolsHost} notesRef={setNotesHost} onChoose={setEditTrack} />

        <div id="work" className="view" hidden={tab === "edit"}>
          <div className={styles.panes}>
            <NewTrackPane track={track} off={tab !== "new"} busy={busy} onMove={setMove} />
            {mine && <MyTracksPane tracks={tracks} group={group} pick={pick} onGroup={setGroup} onPick={pickTrack} />}
          </div>

          <StatusCard status={status} showResult={showResult} tab={tab} mode={track.mode} group={group} picked={picked}
                      selection={track.selection} width={track.width} hasTracks={tracks.some(t => groupOf(t) === group)} version={version}
                      playButton={playButton} footer={!busy && !result && picked && (
            <CardCode code={picked.edited ? null : picked.code ?? ""} onDelete={() => void deletePicked()} />
          )} />

          <div id="actions" className={`${styles.actions}${mine ? ` ${styles.mine}` : ""}`}>
            {mine && (
              <button title={acOk ? "Keep this track and build a new one next to it" : NO_AC}
                      disabled={busy || !picked || !acOk}
                      onClick={() => {      // (the new one is a build: it will stand under Built)
                        if (pick) void start("/api/rebuild", {name: pick, copy: true}).then(refused => { if (!refused) setGroup("built"); });
                      }}>Build as copy</button>
            )}
            <button id="go" className={busy ? styles.danger : styles.primary} title={goTitle} disabled={goDisabled} onClick={onGo}>{goText}</button>
            {mine && (
              <button className={styles.playAct} title={playTitle} onClick={() => { if (pick) void play(pick); }}
                      disabled={busy || !picked?.kn5_bytes || starting || !acOk}>{starting ? "Starting …" : "▶ Play"}</button>
            )}
          </div>

          <BuildLog text={build.log} started={status.started} />
        </div>
      </aside>

      <main className={styles.main} inert={settingsOpen}>
        <TrackMap tab={tab} track={track} picked={picked} move={move} />
        {hint && <div className={styles.hint}>{hint}</div>}
        {editorSeen && (
          <ErrorBoundary message="The 3D view could not start">
            <Suspense fallback={null}>
              <EditorScene name={shownEditTrack} title={editing?.title ?? ""} taken={tracks.filter(t => t !== editing).map(t => t.title)}
                           built={editing?.built ?? null} visible={tab === "edit"} controls={controls} fileHost={fileHost} toolsHost={toolsHost} notesHost={notesHost}
                           onStatus={setEditStatus} onSaved={onSaved} />
            </Suspense>
          </ErrorBoundary>
        )}
      </main>

      {settingsOpen && (
        <SettingsDialog settings={settings} release={release} busy={busy} controls={controls} onControls={saveControls}
                        onCar={() => void reload()} onClose={closeSettings} />
      )}
    </>
  );
}
