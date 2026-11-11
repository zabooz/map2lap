import {expect, test} from "bun:test";
import {LOOK, lookSummary, roughnessLabel} from "./textureLook";

const both = {normal: true, roughness: true};

test("the defaults say the texture is used as imported", () => {
  expect(lookSummary(LOOK, both)).toBe("As imported");
  expect(roughnessLabel(0)).toBe("As imported");
});

test("changed settings are named, and switches of maps the texture lacks are not", () => {
  expect(lookSummary({...LOOK, normal: false, roughness_shift: .3}, both)).toBe("Normal map off · Roughness 30 % matter");
  expect(lookSummary({...LOOK, normal_strength: .5, roughness_map: false}, both)).toBe("Normal map 50 % · Roughness map off");
  expect(lookSummary({...LOOK, normal: false, roughness_map: false}, {normal: false, roughness: false})).toBe("As imported");
  expect(roughnessLabel(-.25)).toBe("25 % smoother");
  expect(roughnessLabel(1)).toBe("100 % matter");
});
