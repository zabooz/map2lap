import {useEffect, useState} from "react";
import {DEFAULT_WEATHER, MAX_WIND_KMH, effectiveSeason, type WeatherOptions} from "./weather";
import type {TrackView} from "./view";
import styles from "./WeatherControls.module.css";

/** Weather below the clock: preview-only settings, sent to AC by Play without changing the track draft. */
export function WeatherControls({view}: {view: TrackView}) {
  const [options, setOptions] = useState<WeatherOptions>({...DEFAULT_WEATHER});
  useEffect(() => { view.setWeather(options); }, [view, options]);
  const update = <K extends keyof WeatherOptions>(key: K, value: WeatherOptions[K]) => setOptions(old => ({...old, [key]: value}));
  const dry = options.kind === "dry";
  return <section className={styles.weather} aria-label="Weather settings">
    <label className={styles.field}>Season
      <select aria-label="Season" value={effectiveSeason(options)} disabled={options.kind === "snow"}
              onChange={e => update("season", e.target.value as WeatherOptions["season"])}>
        <option value="spring">Spring</option><option value="summer">Summer</option>
        <option value="autumn">Autumn</option><option value="winter">Winter</option>
      </select>
    </label>
    {options.kind === "snow" && <p className={styles.hint}>Snow uses winter scenery.</p>}
    <div className={styles.choices}>
      <label className={styles.field}>Weather
        <select aria-label="Weather" value={options.kind} onChange={e => update("kind", e.target.value as WeatherOptions["kind"])}>
          <option value="dry">Dry</option><option value="rain">Rain</option><option value="snow">Snow</option>
        </select>
      </label>
      <label className={styles.field}>{dry ? "Cloud cover" : "Intensity"}
        <select aria-label={dry ? "Cloud cover" : "Intensity"} value={options.intensity}
                onChange={e => update("intensity", e.target.value as WeatherOptions["intensity"])}>
          <option value="light">{dry ? "Clear" : "Light"}</option>
          <option value="medium">{dry ? "Partly cloudy" : "Moderate"}</option>
          <option value="heavy">{dry ? "Overcast" : "Heavy"}</option>
        </select>
      </label>
    </div>
    {options.kind === "snow" && <label className={styles.toggle}>
      <input type="checkbox" checked={options.windscreenSnow} onChange={e => update("windscreenSnow", e.target.checked)} />Snow on windscreen
    </label>}
    <label className={styles.field}>Wind direction: <span className={styles.value}>{options.windDirection < 0 ? "Random" : `${options.windDirection}°`}</span>
      <input aria-label="Wind direction" type="range" min={-1} max={360} step={1} value={options.windDirection}
             title="Where the wind comes from: 0°/360° north, 90° east, 180° south, 270° west. Far left: random."
             onChange={e => update("windDirection", Number(e.target.value))} />
    </label>
    <label className={styles.field}>Wind speed: <span className={styles.value}>{options.windSpeed} km/h</span>
      <input aria-label="Wind speed" type="range" min={0} max={MAX_WIND_KMH} step={1} value={options.windSpeed}
             onChange={e => update("windSpeed", Number(e.target.value))} />
    </label>
    <label className={styles.toggle}><input type="checkbox" checked={options.fog} onChange={e => update("fog", e.target.checked)} />Additional fog</label>
    {options.kind === "snow" && options.intensity === "heavy" && <p className={styles.hint}>Heavy snow already reduces visibility.</p>}
  </section>;
}
