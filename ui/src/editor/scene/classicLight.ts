import * as THREE from "three";
import {flatRoughness, type LayerProperties} from "./colourBlend";

/** A material's gloss in AC (trackview._material: ksSpecular and ksSpecularEXP). */
export interface ClassicLight {specular?: number; specular_exp?: number}

/** The specular colour with which three.js's Blinn-Phong shines as AC's classic shaders (ksMultilayer_objsp_nm4): AC adds
 * ksSpecular · gloss · pow(N·H, ksSpecularEXP) of the sun, three.js dotNL · F · 1/4 · (shininess / 2 + 1) / pi · pow(N·H,
 * shininess); taken at dotNL 1, where the highlight shows most. Pure. */
export function classicSpecular(specular: number, exponent: number) {
  return specular * 4 * Math.PI / (exponent / 2 + 1);
}

/** A ground material drawn as AC's classic shader: its colour tinted (trackTextures.groundTint), its gloss its ksSpecular at
 * its ksSpecularEXP, the photos' share of it by their gloss (layerGloss). Pure. */
export function classicGround(light: ClassicLight, tint: number) {
  const exponent = Math.max(1, light.specular_exp ?? 1), specular = classicSpecular(light.specular ?? 0, exponent);
  return new THREE.MeshPhongMaterial({color: new THREE.Color(tint, tint, tint), specular: new THREE.Color(specular, specular, specular),
    shininess: exponent});
}

/** A layer's share of its material's gloss without a roughness map: one less its roughness, as a Save writes it into the
 * photo's alpha (tracknative._photo_colour). The ground's own tile image shines with all of it, so a photo shines at most as
 * the ground. Pure. */
export function layerGloss(properties?: Partial<LayerProperties>) {
  return Math.min(1, Math.max(0, 1 - flatRoughness(properties)));
}
