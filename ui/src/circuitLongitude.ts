import type {LatLon} from "./types";

/** The copy of lon closest to the reference longitude. Pure. */
export function longitudeNear(lon: number, reference: number) {
  return lon + 360 * Math.round((reference - lon) / 360);
}

/** Keep the lap in one continuous line, starting in the world copy nearest reference. Pure. */
export function circuitLine(coords: LatLon[], reference: number): LatLon[] {
  let previous = reference;
  return coords.map(([lat, lon]) => {
    previous = longitudeNear(lon, previous);
    return [lat, previous];
  });
}
