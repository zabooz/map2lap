import tzlookup from "@photostructure/tz-lookup";

/** Where a track lies: degrees, and its clock's hours from UTC. */
export interface Place {lat: number; lon: number; utcOffset: number}

/** What the sky gives at one height of the sun. Intensities in three.js' units. */
export interface Light {ambient: number; ambientColour: string; sun: number; sunColour: string; sky: string;
  moon: number; night: number}                  // the moon's light, and how far the stars and the moon are out (0..1)

// With no date set in a session CSP runs the sun along the equinox's path, a day like any other all year (read from CSP on
// Rechberg: 0.2 degrees from it, all day). The clock is 10.5 minutes behind the plain sum; cause unknown, measured at one place.
const CLOCK_SHIFT_H = -10.5 / 60;
const NOWHERE: Place = {lat: 45, lon: 0, utcOffset: 0};     // a track without coordinates (not built by Map2Lap)
const RAD = Math.PI / 180;

/** Angle of the sun past its noon, in radians, at a local clock hour. Pure. */
function hourAngle(place: Place, clock: number) {
  return (clock - place.utcOffset + place.lon / 15 + CLOCK_SHIFT_H - 12) * 15 * RAD;
}

/** Unit vector toward the sun in AC's axes (x east, y up, z south), at a local clock hour; also below the horizon. Pure. */
export function sunDirection(place: Place, clock: number): [number, number, number] {
  const hour = hourAngle(place, clock), lat = place.lat * RAD;
  return [-Math.sin(hour), Math.cos(lat) * Math.cos(hour), Math.sin(lat) * Math.cos(hour)];
}

/** Unit vector toward the moon: a full moon, across the sky from the sun, up all night and highest at midnight. Not AC's moon
    (CSP gives no moon position to copy); it gives the night a light from one side, as a sky without one reads as a dimmed day. Pure. */
export function moonDirection(place: Place, clock: number): [number, number, number] {
  const [x, y, z] = sunDirection(place, clock);
  return [-x, -y, -z];
}

/** The sun's height over the horizon in degrees, negative at night. Pure. */
export function sunHeight(place: Place, clock: number) {
  return Math.asin(sunDirection(place, clock)[1]) / RAD;
}

// The light at heights of the sun, in degrees; between two rows it blends. From 30 degrees up it is the Editor's full day.
// Twilight ends about 18 degrees under the horizon; the screen's gamma lifts dark values, so the night's ambient has to be tiny
// and the moon does the rest.
const SKY: (Light & {height: number})[] = [
  {height: -18, ambient: 0.03, ambientColour: "#7c8fce", sun: 0, sunColour: "#ff9a55", sky: "#060a14", moon: 0.15, night: 1},
  {height: -6, ambient: 0.3, ambientColour: "#8a9ccf", sun: 0, sunColour: "#ff9a55", sky: "#2c3c5e", moon: 0.1, night: 0.35},
  {height: 0, ambient: 1.0, ambientColour: "#d6d6e6", sun: 0, sunColour: "#ff9a55", sky: "#d9a98c", moon: 0, night: 0},
  {height: 3, ambient: 1.2, ambientColour: "#e4e2ea", sun: 0.3, sunColour: "#ffa767", sky: "#e2bb9c", moon: 0, night: 0},
  {height: 10, ambient: 1.7, ambientColour: "#f6f6f8", sun: 1.2, sunColour: "#ffd9ac", sky: "#b4cfe0", moon: 0, night: 0},
  {height: 30, ambient: 2.0, ambientColour: "#ffffff", sun: 1.6, sunColour: "#fff4e0", sky: "#a9cfe9", moon: 0, night: 0},
];

export const MOON_COLOUR = "#aebfe6";           // cold: moonlight is the sun's, but the eye sees it blue in the dark

/** A clock's minutes after midnight as "hh:mm". Pure. */
export function clockText(minutes: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** A hex colour between two others. Pure. */
function blendColour(a: string, b: string, k: number) {
  const channel = (from: number) => {
    const x = parseInt(a.slice(from, from + 2), 16), y = parseInt(b.slice(from, from + 2), 16);
    return Math.round(x + (y - x) * k).toString(16).padStart(2, "0");
  };
  return `#${channel(1)}${channel(3)}${channel(5)}`;
}

/** The light for a height of the sun in degrees. Pure. */
export function lightAt(height: number): Light {
  const next = SKY.findIndex(row => height <= row.height);
  if (next === 0) return SKY[0];
  if (next < 0) return SKY[SKY.length - 1];
  const a = SKY[next - 1], b = SKY[next], k = (height - a.height) / (b.height - a.height);
  return {ambient: a.ambient + (b.ambient - a.ambient) * k, ambientColour: blendColour(a.ambientColour, b.ambientColour, k),
    sun: a.sun + (b.sun - a.sun) * k, sunColour: blendColour(a.sunColour, b.sunColour, k), sky: blendColour(a.sky, b.sky, k),
    moon: a.moon + (b.moon - a.moon) * k, night: a.night + (b.night - a.night) * k};
}

/** Hours from UTC of a time zone at a moment, by the zone's own rules and not the PC's. Pure. */
export function offsetHours(zone: string, when: Date) {
  const text = new Intl.DateTimeFormat("en-US", {timeZone: zone, timeZoneName: "longOffset"}).formatToParts(when)
    .find(part => part.type === "timeZoneName")!.value;
  const found = /GMT([+-])(\d{2}):(\d{2})/.exec(text);       // ("GMT" alone at UTC)
  return found ? (found[1] === "-" ? -1 : 1) * (Number(found[2]) + Number(found[3]) / 60) : 0;
}

/** The place of a track's anchor [lat, lon] at a moment: its time zone comes from the coordinates, offline. */
export function trackPlace(anchor: [number, number] | null, when = new Date()): Place {
  if (!anchor) return NOWHERE;
  return {lat: anchor[0], lon: anchor[1], utcOffset: offsetHours(tzlookup(anchor[0], anchor[1]), when)};
}
