// Where a new pin of a band goes among the others: by where it lies along the band, whichever order they were clicked in.
import type {Place} from "./view";

export type Pin = [number, number];     // (AC x, AC z)

export const MAX_PINS = 20;             // (trackband.MAX_POINTS)

/** The number of the point of line nearest x, z. Pure. */
function stationOf(line: Place[], x: number, z: number) {
  let best = 0, least = Infinity;
  line.forEach(([px, , pz], k) => {
    const apart = (px - x) ** 2 + (pz - z) ** 2;
    if (apart < least) {
      least = apart;
      best = k;
    }
  });
  return best;
}

/** The pins with one more at x, z. line: the band over them, null: none yet, then it goes before the last, the end stays. One nearest the band's first or last point
    lies beyond that end, or at it: the band grows that way. Pure. */
export function withPin(pins: Pin[], line: Place[] | null, x: number, z: number): Pin[] {
  if (pins.length < 2) return [...pins, [x, z]];
  if (!line?.length) return [...pins.slice(0, -1), [x, z], pins[pins.length - 1]];
  const at = stationOf(line, x, z);
  if (at === 0) return [[x, z], ...pins];
  if (at === line.length - 1) return [...pins, [x, z]];
  const next = pins.findIndex(([px, pz]) => stationOf(line, px, pz) > at);
  return next < 0 ? [...pins, [x, z]] : [...pins.slice(0, next), [x, z], ...pins.slice(next)];
}
