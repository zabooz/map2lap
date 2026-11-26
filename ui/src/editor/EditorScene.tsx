// The 3D view over the map. Loaded on the Editor tab's first visit (with three.js: most of the page's bytes).
import {useCallback, useEffect, useRef, useState, type CSSProperties} from "react";
import type {TimedMode} from "../types";
import type {Controls} from "./scene/controls";
import styles from "./EditorScene.module.css";
import {EditTools} from "./EditTools";
import type {Hovered} from "./types";
import {TrackView, type Say} from "./scene/view";
import {PointerInfo} from "./inspector/PointerInfo";
import type {SelectionRectangle} from "./scene/marquee";

const INSPECTOR_WIDTH = 325;   // fixed: room for its tables and texture previews; render.e2e.ts takes its reference views beside it

/** The track name in 3D; built: when it was built, built again it loads again (a Save leaves it: the view shows the track's
    source). title: its title, taken: the other tracks'. visible: its tab is open. controls: how it moves. fileHost, toolsHost: where in the sidebar its buttons are drawn.
    onStatus gets what is loading; onSaved the track saved, by its name (a copy: another one); onDelete: its Delete was pressed. */
export default function EditorScene({name, title, routeTrack, timedMode, taken, built, visible, controls, fileHost, savedHost, toolsHost, onStatus, onSaved, onDelete}: {
  name: string;
  title: string;
  routeTrack: boolean;
  timedMode?: TimedMode;
  taken: string[];
  built: number | null;
  visible: boolean;
  controls: Controls;
  fileHost: HTMLElement | null;
  savedHost: HTMLElement | null;
  toolsHost: HTMLElement | null;
  onStatus: Say;
  onSaved: (name: string) => void;
  onDelete: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<TrackView | null>(null);
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const [rectangle, setRectangle] = useState<SelectionRectangle | null>(null);
  const [inspectorHost, setInspectorHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const v = new TrackView(host.current!);
    v.setHover(setHovered);
    v.setSelectionRectangle(setRectangle);
    setView(v);
    return () => { v.dispose(); setView(null); };
  }, []);

  useEffect(() => { view?.show(visible); }, [view, visible]);

  useEffect(() => { view?.setControls(controls); }, [view, controls]);

  const trackKey = JSON.stringify([name, built]);
  const [loaded, setLoaded] = useState<string | null>(null);
  const report = useCallback<Say>((text, progress, about) => {
    setLoaded(progress === undefined && !about?.failed && name ? trackKey : null);
    onStatus(text, progress, about);
  }, [trackKey, name, onStatus]);
  useEffect(() => { void view?.open(name, report); }, [view, name, report]);

  return (
    <div className={styles.layout} hidden={!visible}
      style={{"--inspector-space": name ? `min(${INSPECTOR_WIDTH}px, 48%)` : "0px"} as CSSProperties}>
      <div id="scene" className={styles.scene}>
        <div className={styles.view} ref={host} />
        {rectangle && <div className={styles.rectangle} aria-label="Selection rectangle"
          style={{left: rectangle.x, top: rectangle.y, width: rectangle.width, height: rectangle.height}} />}
        {view && name && <PointerInfo hovered={hovered} />}
      {view && name && <EditTools loaded={loaded === trackKey} routeTrack={routeTrack} key={`${name} ${built}`} name={name} title={title} timedMode={timedMode} visible={visible} taken={taken} view={view} fileHost={fileHost} savedHost={savedHost} toolsHost={toolsHost} elevationSpeed={controls.elevationSpeed}
                                  inspectorHost={inspectorHost}
                                  reopen={() => void view.open(name, report)} onSaved={onSaved} onDelete={onDelete} />}
      </div>
      <div className={styles.inspectorHost} ref={setInspectorHost} />
    </div>
  );
}
