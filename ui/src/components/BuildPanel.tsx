import {useLayoutEffect, useRef, type KeyboardEvent} from "react";
import {WIDTH_RANGE} from "../hooks/useNewTrack";
import type {BuildOptions} from "../types";
import {BuildLog} from "./BuildLog";
import styles from "./BuildPanel.module.css";

export type BuildTab = "options" | "log";
const TABS = [["options", "Build options"], ["log", "Build log"]] as const;

/** Options and log share the same space; progress and build actions stay outside it. */
export function BuildPanel({tab, onTab, options, onOptions, corridor, disabled, busy, text, started, focusLog, compact = false}: {
  tab: BuildTab; onTab: (tab: BuildTab) => void; options: BuildOptions;
  onOptions: (options: Partial<BuildOptions>) => void; disabled: boolean; busy: boolean;
  corridor?: {width: number; onWidth: (width: number) => void};
  text: string; started: number | null | undefined;
  focusLog: number;
  compact?: boolean;
}) {
  const {terrain_cell_m: terrainCell, parked_cars: parkedCars, tree_spacing_m: treeSpacing, ground_quality: groundQuality} = options;
  const logPanel = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { if (focusLog) logPanel.current?.focus(); }, [focusLog]);
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === "Home" ? 0 : event.key === "End" ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowRight" ? 1 - index : null;
    if (next === null) return;
    event.preventDefault();
    onTab(TABS[next][0]);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  return (
    <section className={`${styles.panel}${compact ? ` ${styles.compact}` : ""}`} aria-label="Build details">
      <div className={styles.tabs} role="tablist" aria-label="Build details">
        {TABS.map(([value, title], index) => (
          <button key={value} id={`build-tab-${value}`} role="tab" aria-selected={tab === value}
                  aria-controls={`build-panel-${value}`} tabIndex={tab === value ? 0 : -1}
                  className={tab === value ? styles.selected : ""} onClick={() => onTab(value)} onKeyDown={e => onKey(e, index)}>
            {title}{value === "log" && busy && <span className={styles.running} aria-hidden="true" />}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        <div id="build-panel-options" role="tabpanel" aria-labelledby="build-tab-options" hidden={tab !== "options"}
             className={styles.options} tabIndex={0}>
          <div className={styles.row}>
            <div><b className={styles.label}>Terrain grid</b><span id="terrain-grid-hint" className={styles.detail}>
              {terrainCell === 2 ? "Standard mesh, smaller files" : "Finer mesh, larger files"}</span></div>
            <div className={styles.choice}>
              <span className={terrainCell === 2 ? styles.active : ""}>2 m</span>
              <button type="button" role="switch" aria-label="1 m terrain grid" aria-checked={terrainCell === 1}
                      aria-describedby="terrain-grid-hint" disabled={disabled} className={styles.toggle}
                      onClick={() => onOptions({terrain_cell_m: terrainCell === 1 ? 2 : 1})}><span /></button>
              <span className={terrainCell === 1 ? styles.active : ""}>1 m</span>
            </div>
          </div>
          <div className={`${styles.row} ${styles.quality}`}>
            <div><b className={styles.label}>Ground textures</b><span id="ground-quality-hint" className={styles.detail}>
              {groundQuality === "sd" ? "Standard textures, smaller files" : "Sharper ground, roads, paths and verges; more texture memory"}</span></div>
            <div className={styles.choice}>
              <span className={groundQuality === "sd" ? styles.active : ""}>SD</span>
              <button type="button" role="switch" aria-label="HD ground textures" aria-checked={groundQuality === "hd"}
                      aria-describedby="ground-quality-hint" disabled={disabled} className={styles.toggle}
                      onClick={() => onOptions({ground_quality: groundQuality === "sd" ? "hd" : "sd"})}><span /></button>
              <span className={groundQuality === "hd" ? styles.active : ""}>HD</span>
            </div>
          </div>
          <div className={`${styles.row} ${styles.cars}`}>
            <b className={styles.label}>Parked cars</b>
            <div className={styles.choice}>
              <span className={!parkedCars ? styles.active : ""}>Off</span>
              <button type="button" role="switch" aria-label="Parked cars" aria-checked={parkedCars}
                      disabled={disabled} className={styles.toggle} onClick={() => onOptions({parked_cars: !parkedCars})}><span /></button>
              <span className={parkedCars ? styles.active : ""}>On</span>
            </div>
          </div>
          {corridor && <div className={styles.corridor}>
            <div className="label-row"><span>Corridor each side</span><span className="val">±{corridor.width} m</span></div>
            <input type="range" min={WIDTH_RANGE[0]} max={WIDTH_RANGE[1]} step={WIDTH_RANGE[2]} value={corridor.width}
                   disabled={disabled} aria-label="Corridor each side" onChange={e => corridor.onWidth(+e.target.value)} />
            <p className="small muted">The strip beside the road that is built in full.</p>
          </div>}
          <div className={styles.trees}>
            <div className="label-row"><span>Minimum trunk spacing</span><span className="val">{treeSpacing === 0 ? "Original" : `Min. ${treeSpacing} m`}</span></div>
            <input type="range" min={0} max={20} step={.5} value={treeSpacing} disabled={disabled}
                   aria-label="Build tree minimum spacing" onChange={e => onOptions({tree_spacing_m: +e.target.value})} />
            <p className={styles.note}>Removed trees cannot be restored in the Editor.</p>
          </div>
        </div>
        <div id="build-panel-log" role="tabpanel" aria-labelledby="build-tab-log" hidden={tab !== "log"}
             className={styles.log} tabIndex={0} ref={logPanel}>
          <BuildLog text={text} started={started} visible={tab === "log"} />
        </div>
      </div>
    </section>
  );
}
