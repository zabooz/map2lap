import {longitudeNear} from "../circuitLongitude";
import type {LatLon} from "../types";

const RAD = Math.PI / 180;
const EARTH_RADIUS_M = 6_371_000; // Mean earth radius, as used by Leaflet for distances.

/** Samples coords at everyM metre intervals, up to max arrows. Bearings are clockwise from north. Pure. */
export function arrowsAlong(coords: LatLon[], everyM: number, max: number): {at: LatLon; deg: number}[] {
  const arrows: {at: LatLon; deg: number}[] = [];
  if (!(everyM > 0)) return arrows;
  let startM = 0;
  let nextM = everyM;
  let lon = coords[0]?.[1] ?? 0;
  for (let i = 1; i < coords.length && arrows.length < max; i++) {
    const [lat] = coords[i - 1];
    const [toLat, nextLon] = coords[i];
    const toLon = longitudeNear(nextLon, lon);
    const dLat = (toLat - lat) * RAD, dLon = (toLon - lon) * RAD;
    const from = lat * RAD, to = toLat * RAD;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(from) * Math.cos(to) * Math.sin(dLon / 2) ** 2;
    const endM = startM + 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
    // A sample on a vertex belongs to the outgoing segment, so the lap's end has no arrow.
    const beforeEndM = endM - endM * Number.EPSILON;
    if (nextM < beforeEndM) {
      const east = Math.sin(dLon) * Math.cos(to);
      const north = Math.cos(from) * Math.sin(to) - Math.sin(from) * Math.cos(to) * Math.cos(dLon);
      const deg = (Math.atan2(east, north) / RAD + 360) % 360;
      for (; nextM < beforeEndM && arrows.length < max; nextM += everyM) {
        const t = Math.max(0, nextM - startM) / (endM - startM);
        arrows.push({at: [lat + t * (toLat - lat), lon + t * (toLon - lon)], deg});
      }
    }
    startM = endM;
    lon = toLon;
  }
  return arrows;
}
