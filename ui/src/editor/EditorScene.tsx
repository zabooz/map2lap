// The 3D view over the map. Loaded on the Editor tab's first visit (with three.js: most of the page's bytes).
import {useEffect, useRef, useState} from "react";
import type {Controls} from "./controls";
import styles from "./EditorScene.module.css";
import {HoverBox} from "./HoverBox";
import {TrackView, type Hovered} from "./view";

/** The track name in 3D; built: when it was built, built again it loads again. visible: its tab is open. controls: how it
    moves. onStatus gets what is loading. */
export default function EditorScene({name, built, visible, controls, onStatus}: {
  name: string;
  built: number | null;
  visible: boolean;
  controls: Controls;
  onStatus: (text: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<TrackView | null>(null);
  const [hovered, setHovered] = useState<Hovered | null>(null);

  useEffect(() => {
    const v = new TrackView(host.current!);
    v.setHover(setHovered);
    setView(v);
    return () => { v.dispose(); setView(null); };
  }, []);

  useEffect(() => { view?.show(visible); }, [view, visible]);

  useEffect(() => { view?.setControls(controls); }, [view, controls]);

  useEffect(() => { void view?.open(name, onStatus); }, [view, name, built, onStatus]);

  return (
    <div id="scene" className={styles.scene} hidden={!visible}>
      <div className={styles.view} ref={host} />
      <HoverBox hovered={hovered} />
    </div>
  );
}
