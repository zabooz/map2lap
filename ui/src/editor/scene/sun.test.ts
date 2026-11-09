import {expect, test} from "bun:test";
import {clockText, lightAt, moonDirection, offsetHours, sunDirection, sunHeight, trackPlace, type Place} from "./sun";

const RECHBERG: Place = {lat: 46.518829, lon: 14.57707, utcOffset: 1};

/** Degrees between two directions (the rows read from AC are rounded, not of length one). Pure. */
function apart(a: number[], b: number[]) {
  const dot = (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.hypot(...a) * Math.hypot(...b));
  return Math.acos(Math.min(1, Math.max(-1, dot))) * 180 / Math.PI;
}

// Read from CSP in AC, no date set: rows of -ac.getSim().lightDirection on Rechberg.
test.each([
  [8.15, [0.873, 0.334, 0.356]],
  [10.15, [0.511, 0.59, 0.625]],
  [12.15, [0.013, 0.687, 0.726]],
  [14.15, [-0.489, 0.6, 0.633]],
  [16.16, [-0.86, 0.352, 0.371]],
])("the sun at %f h stands where CSP has it", (clock, inAc) => {
  expect(apart(sunDirection(RECHBERG, clock), inAc as number[])).toBeLessThan(0.5);
});

test("the sun is a unit vector at every hour", () => {
  for (let clock = 0; clock < 24; clock += 0.25) expect(Math.hypot(...sunDirection(RECHBERG, clock))).toBeCloseTo(1, 9);
});

test("the sun's height over the night matches CSP's sun angle from the zenith", () => {
  expect(sunHeight(RECHBERG, 0.0001)).toBeCloseTo(90 - 133.661, 0);
  expect(sunHeight(RECHBERG, 19.0491)).toBeCloseTo(90 - 98.662, 0);
});

test("south of the equator the noon sun stands in the north", () => {
  const auckland: Place = {lat: -36.85, lon: 174.76, utcOffset: 13};
  let high = 0;
  for (let clock = 0; clock < 24; clock += 0.25) if (sunHeight(auckland, clock) > sunHeight(auckland, high)) high = clock;
  expect(sunDirection(auckland, high)[2]).toBeLessThan(0);        // (AC's +z is south)
});

test("at the poles the numbers stay finite", () => {
  for (const lat of [90, -90]) for (const value of sunDirection({lat, lon: 0, utcOffset: 0}, 10)) expect(Number.isFinite(value)).toBe(true);
});

test("the day's light is the light the Editor has always had", () => {
  const day = lightAt(40);
  expect(day.ambient).toBeCloseTo(2, 5);
  expect(day.sun).toBeCloseTo(1.6, 5);
  expect(day.sky).toBe("#a9cfe9");
});

test("with the sun down there is no sunlight and only a little ambient", () => {
  const night = lightAt(-40);
  expect(night.sun).toBe(0);
  expect(night.ambient).toBeGreaterThan(0);
  expect(night.ambient).toBeLessThan(0.08);
});

test("no sunlight comes from below the horizon", () => {
  for (let height = -30; height <= 0; height++) expect(lightAt(height).sun).toBe(0);
});

test("the light has no jump from night to day", () => {
  for (let height = -30; height < 60; height += 0.25) {
    const a = lightAt(height), b = lightAt(height + 0.25);
    expect(Math.abs(a.ambient - b.ambient)).toBeLessThan(0.1);
    expect(Math.abs(a.sun - b.sun)).toBeLessThan(0.1);
    expect(a.ambient).toBeLessThanOrEqual(b.ambient);
    expect(a.sun).toBeLessThanOrEqual(b.sun);
  }
});

test("a low sun is warmer than a high one", () => {
  const blue = (colour: string) => parseInt(colour.slice(5), 16);
  expect(blue(lightAt(4).sunColour)).toBeLessThan(blue(lightAt(40).sunColour));
});

test("a clock offset follows the place's own rules, whatever the PC's zone", () => {
  const winter = new Date("2026-01-15T12:00:00Z"), summer = new Date("2026-07-15T12:00:00Z");
  expect(offsetHours("Europe/Vienna", winter)).toBe(1);
  expect(offsetHours("Europe/Vienna", summer)).toBe(2);
  expect(offsetHours("Pacific/Auckland", winter)).toBe(13);
  expect(offsetHours("Asia/Kolkata", winter)).toBe(5.5);
  expect(offsetHours("Asia/Kathmandu", winter)).toBe(5.75);
  expect(offsetHours("America/St_Johns", winter)).toBe(-3.5);
  expect(offsetHours("UTC", winter)).toBe(0);
});

test("a track's place comes from its coordinates", () => {
  const place = trackPlace([46.518829, 14.57707], new Date("2026-11-09T12:00:00Z"));
  expect(place).toEqual({lat: 46.518829, lon: 14.57707, utcOffset: 1});     // (as CM gave AC for Rechberg that day)
});

test("the moon stands across the sky from the sun, highest at midnight", () => {
  expect(moonDirection(RECHBERG, 3)).toEqual(sunDirection(RECHBERG, 3).map(v => -v) as [number, number, number]);
  const height = (clock: number) => moonDirection(RECHBERG, clock)[1];
  expect(height(0.2)).toBeGreaterThan(height(21));
  expect(height(21)).toBeGreaterThan(0);
  expect(height(12)).toBeLessThan(0);
});

test("the moon lights the night and only the night", () => {
  expect(lightAt(40).moon).toBe(0);
  expect(lightAt(0).moon).toBe(0);
  expect(lightAt(-30).moon).toBeGreaterThan(0);
  expect(lightAt(-30).moon).toBeLessThan(0.3);
});

test("the moon comes up without a jump, and the night's sky is a night's only at night", () => {
  for (let height = -30; height < 10; height += 0.25) expect(Math.abs(lightAt(height).moon - lightAt(height + 0.25).moon)).toBeLessThan(0.02);
  expect(lightAt(40).night).toBe(0);
  expect(lightAt(-30).night).toBe(1);
  expect(lightAt(-8).night).toBeGreaterThan(0);
  expect(lightAt(-8).night).toBeLessThan(1);
});

test("the clock reads like a clock", () => {
  expect(clockText(0)).toBe("00:00");
  expect(clockText(605)).toBe("10:05");
  expect(clockText(1439)).toBe("23:59");
});

test("a track without coordinates still has a sun", () => {
  const place = trackPlace(null);
  expect(sunHeight(place, 12)).toBeGreaterThan(20);
});
