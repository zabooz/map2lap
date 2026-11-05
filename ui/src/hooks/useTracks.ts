import {useCallback, useEffect, useRef, useState} from "react";
import {get} from "../api";
import type {Track} from "../types";

/** The tracks built before and the car Play would start with. */
export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [car, setCar] = useState<string | null>(null);
  const asked = useRef(0);

  const reload = useCallback(async () => {
    const k = ++asked.current;
    const r = await get<{tracks?: Track[]; car: string | null}>("/api/tracks");
    if (k !== asked.current || !r?.tracks) return;
    setTracks(r.tracks);
    setCar(r.car);
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  return {tracks, car, reload};
}
