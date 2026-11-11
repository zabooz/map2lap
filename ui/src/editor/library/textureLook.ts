/** One application's texture settings, as the server keeps them in its snapshot (trackpaint.LOOK). normal_strength 0..1 scales
    the normals' tilt; roughness_shift -1..1 moves roughness toward smooth or matte, 0 keeps the roughness map. */
export interface TextureLook {normal: boolean; normal_strength: number; roughness_map: boolean; roughness_shift: number}

/** Which data maps a texture has. */
export interface TextureMaps {normal: boolean; roughness: boolean}

/** The maps as imported. */
export const LOOK: TextureLook = {normal: true, normal_strength: 1, roughness_map: true, roughness_shift: 0};

const percent = (value: number) => `${Math.round(Math.abs(value) * 100)} %`;

/** The roughness slider's value in words. Pure. */
export const roughnessLabel = (shift: number) => shift === 0 ? "As imported" : `${percent(shift)} ${shift > 0 ? "matter" : "smoother"}`;

/** The settings that differ from the defaults, in words; a missing map's switch says nothing. Pure. */
export function lookSummary(look: TextureLook, maps: TextureMaps) {
  const parts = [
    ...maps.normal ? [!look.normal ? "Normal map off" : look.normal_strength !== 1 ? `Normal map ${percent(look.normal_strength)}` : ""] : [],
    ...maps.roughness && !look.roughness_map ? ["Roughness map off"] : [],
    ...look.roughness_shift ? [`Roughness ${roughnessLabel(look.roughness_shift)}`] : [],
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "As imported";
}
