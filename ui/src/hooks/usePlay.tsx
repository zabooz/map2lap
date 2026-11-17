import {useState} from "react";
import {post} from "../api";
import {PlayDialog} from "../components/PlayDialog";
import {DEFAULT_WEATHER} from "../editor/scene/weather";
import type {WeatherOptions} from "../editor/scene/weather";

const STARTING_MS = 5000;       // how long Play stays "Starting …": AC's window takes a while, the server answers at once
export type PlaySession = {car: string; clock?: number; weather: WeatherOptions};

/** Start AC on a track (Practice, the set car; the server starts Steam if needed); clock: the local hour to start at, else the last one. */
export function usePlay() {
  const [starting, setStarting] = useState(false);
  const [asking, setAsking] = useState<{clock?: number; weather: WeatherOptions; saving: boolean; saveFailed: boolean;
    resolve: (session: PlaySession | null) => void} | null>(null);

  const play = async (name: string, session: PlaySession) => {
    setStarting(true);
    const r = await post("/api/play", {name, ...session});
    if (r.error) alert(r.error);
    setTimeout(() => setStarting(false), r.error ? 0 : STARTING_MS);
  };

  /** Ask for this drive's options while an optional Editor Save runs. Null means the user cancelled. */
  const choose = (clock?: number, weather: WeatherOptions = DEFAULT_WEATHER, saving?: Promise<string | null>): Promise<PlaySession | null> =>
    new Promise(resolve => {
      const request = {clock, weather: {...weather}, saving: !!saving, saveFailed: false, resolve};
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
    dialog: asking && <PlayDialog initialClock={asking.clock} initialWeather={asking.weather} saving={asking.saving}
      saveFailed={asking.saveFailed} onStart={finish} onCancel={() => finish(null)} />};
}
