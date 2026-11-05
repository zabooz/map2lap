import {useState} from "react";
import {post} from "../api";

const STARTING_MS = 5000;       // how long Play stays "Starting …": AC's window takes a while, the server answers at once

/** Start AC on a track (Practice, the set car; the server starts Steam if needed). */
export function usePlay() {
  const [starting, setStarting] = useState(false);

  const play = async (name: string) => {
    setStarting(true);
    const r = await post("/api/play", {name});
    if (r.error) alert(r.error);
    setTimeout(() => setStarting(false), r.error ? 0 : STARTING_MS);
  };

  return {starting, play};
}
