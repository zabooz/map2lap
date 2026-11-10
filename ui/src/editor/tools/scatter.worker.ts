import {scatter, type ScatterOptions} from "./scatter";
import type {Sample} from "../types";

self.onmessage = (event: MessageEvent<{id: number; samples: Sample[]; options: ScatterOptions; existing: {x: number; z: number}[]}>) => {
  const {id, samples, options, existing} = event.data;
  try { const result = scatter(samples, options, existing); self.postMessage({id, plants: result, limited: !!result.limited}); }
  catch (error) { self.postMessage({id, error: (error as Error).message}); }
};
