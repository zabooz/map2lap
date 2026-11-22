import {useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {get} from "../api";
import {MAX_WIND_KMH, effectiveSeason, type WeatherOptions} from "../editor/scene/weather";
import type {PlaySession, SessionMode} from "../hooks/usePlay";
import type {TimedMode} from "../types";
import styles from "./PlayDialog.module.css";

type Cars = {cars: {id: string; name: string}[]; last: string | null};
const LAP_OPTIONS = [2, 4, 8, 16, 32, 64, 128];
const TABS = [{id: "session", label: "Session"}, {id: "air", label: "Air and road"}] as const;
const MODES: Record<SessionMode, string> = {practice: "Practice", hotlap: "Hotlap", race: "Race"};

/** Configure one drive while the Editor may be saving its track. */
export function PlayDialog({name, timedMode, initialClock, initialWeather, saving, saveFailed, onStart, onCancel}: {
  name: string; timedMode?: TimedMode; initialClock?: number; initialWeather: WeatherOptions; saving: boolean; saveFailed: boolean;
  onStart: (session: PlaySession) => void; onCancel: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [cars, setCars] = useState<Cars | null>(null);
  const [car, setCar] = useState("");
  const [sessionMode, setSessionMode] = useState<SessionMode>("practice");
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("session");
  const [laps, setLaps] = useState(LAP_OPTIONS[0]);
  const [maxOpponents, setMaxOpponents] = useState<number | null>(null);
  const [gridError, setGridError] = useState(false);
  const [ai, setAi] = useState({opponents: 0, strength: 95, aggression: 0, car: ""});
  const [minutes, setMinutes] = useState<number | null>(initialClock === undefined ? null : Math.round(initialClock * 60));
  const [weather, setWeather] = useState<WeatherOptions>({...initialWeather});
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);
  useEffect(() => {
    if (!timedMode || saving) return;
    let alive = true;
    void get<{max_opponents: number}>(`/api/play/options?name=${encodeURIComponent(name)}`).then(result => {
      if (!alive) return;
      const limit = result?.max_opponents;
      setGridError(typeof limit !== "number");
      setMaxOpponents(limit ?? null);
      setAi(value => ({...value, opponents: Math.min(value.opponents, limit ?? 0)}));
    });
    return () => { alive = false; };
  }, [name, timedMode, saving]);
  useEffect(() => {
    let alive = true;
    Promise.all([get<Cars>("/api/cars"), get<{car: string | null}>("/api/settings")]).then(([available, settings]) => {
      if (!alive) return;
      if (!available || !Array.isArray(available.cars) || !settings) { setLoadError(true); return; }
      setCars(available);
      setCar(available.cars.some(c => c.id === settings.car) ? settings.car! : "");
    });
    return () => { alive = false; };
  }, []);

  const update = <K extends keyof WeatherOptions>(key: K, value: WeatherOptions[K]) =>
    setWeather(old => ({...old, [key]: value}));
  const mode = timedMode ? sessionMode : "practice";
  const race = mode === "race";
  const start = () => onStart({car, ...(minutes === null ? {} : {clock: minutes / 60}), weather, session: mode,
    ...(race ? {laps: timedMode === "route" ? 1 : laps, ai} : {})});
  const dry = weather.kind === "dry";
  const time = minutes === null ? "Last session time" : `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

  return createPortal(
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="play-title"
            onCancel={e => { e.preventDefault(); onCancel(); }}>
      <form onSubmit={e => { e.preventDefault(); start(); }}>
        <header className={styles.header}>
          <div><span className={styles.eyebrow}>Assetto Corsa · {MODES[mode]}</span><h2 id="play-title">Play</h2></div>
          <button type="button" className={styles.close} aria-label="Close Play" onClick={onCancel}>×</button>
        </header>
        <div className={styles.tabs} role="tablist" aria-label="Play settings" onKeyDown={e => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
          e.preventDefault();
          const next = e.key === "Home" ? 0 : e.key === "End" ? 1 : tab === "session" ? 1 : 0;
          setTab(TABS[next].id);
          (e.currentTarget.children[next] as HTMLButtonElement).focus();
        }}>
          {TABS.map(({id, label}) => <button type="button" key={id} id={`play-tab-${id}`} role="tab"
            aria-selected={tab === id} aria-controls={`play-panel-${id}`} tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}>{label}</button>)}
        </div>
        <div className={styles.body} role="tabpanel" id="play-panel-session" aria-labelledby="play-tab-session" hidden={tab !== "session"}>
          <section className={styles.section} aria-label="Drive">
            <h3>Drive</h3>
            {timedMode && <label className={styles.field}>Session
              <select aria-label="Session" value={mode} onChange={e => setSessionMode(e.target.value as SessionMode)}>
                {Object.entries(MODES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>}
            {race && timedMode === "circuit" && <label className={styles.field}>Laps
              <select aria-label="Laps" value={laps} onChange={e => setLaps(Number(e.target.value))}>
                {LAP_OPTIONS.map(count => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>}
            <label className={styles.field}>Car
              <select aria-label="Car" value={car} disabled={!cars} onChange={e => setCar(e.target.value)}>
                <option value="">{cars?.last ? `Last driven (${cars.last})` : "Last driven"}</option>
                {cars?.cars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            {loadError && <p className={styles.error}>Cars could not be loaded. Close and try again.</p>}
            <label className={styles.field}>Time of day <span className={styles.value}>{time}</span>
              <input aria-label="Time of day" type="range" min={0} max={1439} value={minutes ?? 600}
                     onChange={e => setMinutes(Number(e.target.value))} />
            </label>
            <label className={styles.check}><input type="checkbox" checked={minutes === null}
              onChange={e => setMinutes(e.target.checked ? null : 600)} />Use last session time</label>
          </section>
          <section className={styles.section} aria-label="Conditions">
            <h3>Conditions</h3>
            <div className={styles.pair}>
              <label className={styles.field}>Weather
                <select aria-label="Weather" value={weather.kind} onChange={e => update("kind", e.target.value as WeatherOptions["kind"])}>
                  <option value="dry">Dry</option><option value="rain">Rain</option><option value="snow">Snow</option>
                </select>
              </label>
              <label className={styles.field}>{dry ? "Cloud cover" : "Intensity"}
                <select aria-label={dry ? "Cloud cover" : "Intensity"} value={weather.intensity}
                        onChange={e => update("intensity", e.target.value as WeatherOptions["intensity"])}>
                  <option value="light">{dry ? "Clear" : "Light"}</option>
                  <option value="medium">{dry ? "Partly cloudy" : "Moderate"}</option>
                  <option value="heavy">{dry ? "Overcast" : "Heavy"}</option>
                </select>
              </label>
            </div>
            <label className={styles.field}>Season
              <select aria-label="Season" value={effectiveSeason(weather)} disabled={weather.kind === "snow"}
                      onChange={e => update("season", e.target.value as WeatherOptions["season"])}>
                <option value="spring">Spring</option><option value="summer">Summer</option>
                <option value="autumn">Autumn</option><option value="winter">Winter</option>
              </select>
            </label>
            {weather.kind === "snow" && <label className={styles.check}><input type="checkbox" checked={weather.windscreenSnow}
              onChange={e => update("windscreenSnow", e.target.checked)} />Snow on windscreen</label>}
            <label className={styles.check}><input type="checkbox" checked={weather.fog}
              onChange={e => update("fog", e.target.checked)} />Additional fog</label>
          </section>
          {race && <section className={`${styles.section} ${styles.full}`} aria-label="AI opponents">
            <h3>AI opponents</h3>
            <div className={styles.pair}>
              <label className={styles.field}>Opponents
                <select aria-label="Opponents" value={ai.opponents} disabled={!maxOpponents}
                  onChange={e => setAi({...ai, opponents: Number(e.target.value)})}>
                  {Array.from({length: (maxOpponents ?? 0) + 1}, (_, n) =>
                    <option key={n} value={n}>{n === 0 ? "0 · Solo" : n}</option>)}
                </select>
              </label>
              <label className={styles.field}>Opponent car
                <select aria-label="Opponent car" value={ai.car} disabled={!ai.opponents} onChange={e => setAi({...ai, car: e.target.value})}>
                  <option value="">Same as mine</option>
                  {cars?.cars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className={styles.field}>Strength <span className={styles.value}>{ai.strength}%</span>
                <input aria-label="Strength" type="range" min={70} max={100} value={ai.strength} disabled={!ai.opponents}
                  onChange={e => setAi({...ai, strength: Number(e.target.value)})} />
              </label>
              <label className={styles.field}>Aggression <span className={styles.value}>{ai.aggression}%</span>
                <input aria-label="Aggression" type="range" min={0} max={100} value={ai.aggression} disabled={!ai.opponents}
                  onChange={e => setAi({...ai, aggression: Number(e.target.value)})} />
              </label>
            </div>
            {gridError && <p className={styles.note}>Could not check the starting grid.</p>}
            {maxOpponents === 0 && <p className={styles.note}>AI opponents need a starting grid and an AI line.</p>}
          </section>}
        </div>
        <div className={styles.body} role="tabpanel" id="play-panel-air" aria-labelledby="play-tab-air" hidden={tab !== "air"}>
          <section className={`${styles.section} ${styles.air}`}>
            <div className={styles.pair}>
              <label className={styles.field}>Air temperature <span className={styles.value}>{weather.airTemperature} °C</span>
                <input aria-label="Air temperature" type="range" min={-30} max={50} value={weather.airTemperature}
                       onChange={e => update("airTemperature", Number(e.target.value))} />
              </label>
              <label className={styles.field}>Road temperature <span className={styles.value}>{weather.roadTemperature} °C</span>
                <input aria-label="Road temperature" type="range" min={-30} max={80} value={weather.roadTemperature}
                       onChange={e => update("roadTemperature", Number(e.target.value))} />
              </label>
              <label className={styles.field}>Wind direction <span className={styles.value}>{weather.windDirection < 0 ? "Random" : `${weather.windDirection}°`}</span>
                <input aria-label="Wind direction" type="range" min={-1} max={360} value={weather.windDirection}
                       onChange={e => update("windDirection", Number(e.target.value))} />
              </label>
              <label className={styles.field}>Wind speed <span className={styles.value}>{weather.windSpeed < 0 ? "Random" : `${weather.windSpeed} km/h`}</span>
                <input aria-label="Wind speed" type="range" min={-1} max={MAX_WIND_KMH} value={weather.windSpeed}
                       onChange={e => update("windSpeed", Number(e.target.value))} />
              </label>
            </div>
          </section>
        </div>
        <footer className={styles.footer}>
          <span>{saveFailed ? "Track could not be saved. Close to see why." : saving ? "Saving track before driving …" : "The choices apply to this drive."}</span>
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" className={styles.start} disabled={!cars || saving || saveFailed}>
            {saving ? "Saving …" : "Start driving"}
          </button>
        </footer>
      </form>
    </dialog>, document.body);
}
