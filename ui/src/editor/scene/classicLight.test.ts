import {expect, test} from "bun:test";
import * as THREE from "three";
import {classicGround, classicSpecular, layerGloss} from "./classicLight";

test("the ground shines as AC's classic shader: ksSpecular over three.js's Blinn-Phong normalisation, its exponent as is", () => {
  // three.js: dotNL · F · 1/4 · (shininess / 2 + 1) / pi · pow(N·H, shininess); AC: ksSpecular · pow(N·H, ksSpecularEXP).
  expect(classicSpecular(.02, 10)).toBeCloseTo(.02 * 4 * Math.PI / 6);
  expect(classicSpecular(0, 10)).toBe(0);
  const material = classicGround({specular: .02, specular_exp: 10}, .68);
  expect(material).toBeInstanceOf(THREE.MeshPhongMaterial);
  expect(material.color.toArray()).toEqual([.68, .68, .68]);
  expect(material.shininess).toBe(10);
  expect(material.specular.r).toBeCloseTo(classicSpecular(.02, 10));
  expect(classicGround({}, 1).specular.r).toBe(0);        // (a material without ksSpecular does not shine)
});

test("a layer's gloss is one less its roughness, as a Save packs it into the photo's alpha (tracknative._photo_colour)", () => {
  expect(layerGloss()).toBe(0);                                         // (as imported: roughness 1)
  expect(layerGloss({roughness: .25, normal_scale: 1})).toBeCloseTo(.75);
  expect(layerGloss({roughness: .5, normal_scale: 1, roughness_offset: .5})).toBe(0);
  expect(layerGloss({roughness: -1, normal_scale: 1})).toBe(1);         // (clamped: at most the ground's own ksSpecular)
});
