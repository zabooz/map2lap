import {useState} from "react";
import {post} from "../api";
import {PlayDialog} from "../components/PlayDialog";
import {DEFAULT_WEATHER} from "../editor/scene/weather";
import type {WeatherOptions} from "../editor/scene/weather";
import type {TimedMode} from "../types";

const STARTING_MS = 5000;       // how long Play stays "Starting …": AC's window takes a while, the server answers at once
export type SessionMode = "practice" | "hotlap" | "race";
export type GripEdits = {preset?: string; start?: number; variation?: number};
export type PlaySession = {car: string; clock?: number; grip?: string | GripEdits; weather: WeatherOptions; session: SessionMode; laps?: number;
  ai?: {opponents: number; strength: number; aggression: number; car: string}};

/** Start AC with the chosen session, car and conditions. */
export function usePlay() {
  const [starting, setStarting] = useState(false);
  const [asking, setAsking] = useState<{name: string; timedMode?: TimedMode; clock?: number; weather: WeatherOptions; saving: boolean; saveFailed: boolean;
    resolve: (session: PlaySession | null) => void} | null>(null);

  const play = async (name: string, session: PlaySession) => {
    setStarting(true);
    const r = await post("/api/play", {name, ...session});
    if (r.error) alert(r.error);
    setTimeout(() => setStarting(false), r.error ? 0 : STARTING_MS);
  };

  /** Ask for this drive's options while an optional Editor Save runs. Null means the user cancelled. */
  const choose = (name: string, timedMode?: TimedMode, clock?: number, weather: WeatherOptions = DEFAULT_WEATHER,
    saving?: Promise<string | null>): Promise<PlaySession | null> =>
    new Promise(resolve => {
      const request = {name, timedMode, clock, weather: {...weather}, saving: !!saving, saveFailed: false, resolve};
      setAsking(request);
      if (saving) void saving.then(saved => setAsking(current => current === request
        ? {...current, saving: false, saveFailed: saved === null} : current),
      () => setAsking(current => current === request ? {...current, saving: false, saveFailed: true} : current));
    });
  const finish = (session: PlaySession | null) => {
    asking?.resolve(session);
    setAsking(null);
  };

  return {starting, play, choose, choosing: !!asking,
    dialog: asking && <PlayDialog name={asking.name} timedMode={asking.timedMode} initialClock={asking.clock} initialWeather={asking.weather} saving={asking.saving}
      saveFailed={asking.saveFailed} onStart={finish} onCancel={() => finish(null)} />};
}
