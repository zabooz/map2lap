import {expect, test} from "bun:test";
import {DEFAULT_WEATHER, weatherAppearance, windVelocity} from "./weather";

test("clear dry weather preserves the existing daylight and visibility", () => {
  expect(weatherAppearance(DEFAULT_WEATHER)).toMatchObject({clouds: 0, sun: 1, ambient: 1, fog: 0});
});

test("cloud cover changes the dry sky while precipitation intensity changes rain and snow", () => {
  expect(weatherAppearance({...DEFAULT_WEATHER, intensity: "heavy"}).clouds).toBe(1);
  expect(weatherAppearance({...DEFAULT_WEATHER, kind: "rain", intensity: "heavy"}).sun).toBeLessThan(0.2);
  const light = weatherAppearance({...DEFAULT_WEATHER, kind: "snow"});
  const heavy = weatherAppearance({...DEFAULT_WEATHER, kind: "snow", intensity: "heavy"});
  expect(heavy.fog).toBeGreaterThan(light.fog);
  expect(heavy.density).toBeGreaterThan(light.density);
});

test("additional fog increases clear-weather haze while heavy snow already has it", () => {
  expect(weatherAppearance({...DEFAULT_WEATHER, fog: true}).fog).toBeGreaterThan(0);
  const heavy = {...DEFAULT_WEATHER, kind: "snow" as const, intensity: "heavy" as const};
  expect(weatherAppearance({...heavy, fog: true}).fog).toBe(weatherAppearance(heavy).fog);
});

test("wind comes from the chosen compass direction, in AC east/up/south axes and metres per second", () => {
  const north = windVelocity({...DEFAULT_WEATHER, windDirection: 0, windSpeed: 36}, 45);
  expect(north[0]).toBeCloseTo(0); expect(north[1]).toBeCloseTo(10);
  const east = windVelocity({...DEFAULT_WEATHER, windDirection: 90, windSpeed: 36}, 45);
  expect(east[0]).toBeCloseTo(-10); expect(east[1]).toBeCloseTo(0);
  expect(windVelocity({...DEFAULT_WEATHER, windDirection: -1, windSpeed: 36}, 90)).toEqual(east);
});
