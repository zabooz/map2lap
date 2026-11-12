/** Session-only weather: the editor gives a lightweight indication; CSP renders the actual sky in AC. */
export type WeatherOptions = {kind: "dry" | "rain" | "snow"; intensity: "light" | "medium" | "heavy";
  windDirection: number; windSpeed: number; fog: boolean};
export const DEFAULT_WEATHER: WeatherOptions = {kind: "dry", intensity: "light", windDirection: -1, windSpeed: 0, fog: false};
export const MAX_WIND_KMH = 35; // CSP's normal conditions limit, without changing its global experimental settings.

/** Approximate cloud cover, light and visibility for the editor, following CSP's base preset ordering. Pure. */
export function weatherAppearance(options: WeatherOptions) {
  const i = ["light", "medium", "heavy"].indexOf(options.intensity);
  const clouds = ({dry: [0, .5, 1], rain: [.5, .7, 1], snow: [.4, .6, .8]})[options.kind][i];
  const nativeFog = ({dry: [0, 0, 0], rain: [.1, .25, .9], snow: [.2, .4, 1]})[options.kind][i];
  return {clouds, sun: 1 - clouds * .95, ambient: 1 - clouds * .3,
    fog: nativeFog + (options.fog ? (1 - nativeFog) * .65 : 0), density: [.3, .65, 1][i],
    sky: options.kind === "snow" ? "#9eafbd" : options.kind === "rain" ? "#929ca6" : "#b5bbc0"};
}

/** Wind from a compass bearing, in AC east/south axes and m/s; randomBearing is chosen once by the preview. Pure. */
export function windVelocity(options: WeatherOptions, randomBearing: number): [number, number] {
  const angle = (options.windDirection < 0 ? randomBearing : options.windDirection) * Math.PI / 180, speed = options.windSpeed / 3.6;
  return [-Math.sin(angle) * speed, Math.cos(angle) * speed];
}
