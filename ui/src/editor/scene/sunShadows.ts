import * as THREE from "three";
import {SunLight} from "three/addons/lights/SunLight.js";

const THROWS = /_bld(?!col)/;       // houses, as the build names them (make_obj: bld, bld2 ...; bldcol is the invisible collision copy)
// Layers of their own, none of them the view's 0: casters are read from one, the pass that draws the map sees only the sun in the other.
const CAST_LAYER = 30, PASS_LAYER = 31;
// The two maps cover the view from the camera out to this depth. Near the ground CSP's own distance (smart_shadows.ini, 200 m); from
// above the ground lies further off, so it grows: at 45 degrees down and at the picture's edge the ground is about 3 heights away.
const RANGE_M = 200, RANGE_PER_HEIGHT = 3;
const RANGE_MOST_M = 3000;          // (3 km over 1,024 texels of the far map: a house still covers a few of them; beyond, none would)
// How far a point steps off its surface before it looks up the map: over a near texel of 13 cm and a far one of 44 cm, so a wall
// doesn't shade itself in stripes. A larger step lifts the shadow off the foot of the house.
const NORMAL_BIAS_M = 0.3;
// A spot beside a house sees less of the sky, so in a shadow the sky's light falls to this share too. By eye, against AC.
const SHADOW_SKY = 0.7;
const SUN_SHADOW_LINE = "directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;";

// In three.js's own light code, so that plain, painted and PBR ground and all objects are the same in a shadow. Only where the sun
// would shine: a wall turned away has no shadow to darken, and with the sun down (its colour 0) the map is old.
THREE.ShaderChunk.lights_fragment_begin = "float m2lSunSeen = 1.0, m2lShade = 1.0;\n" + THREE.ShaderChunk.lights_fragment_begin.replace(SUN_SHADOW_LINE, `
  m2lSunSeen = ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
  directLight.color *= m2lSunSeen;
  m2lShade = 1.0 - ( 1.0 - m2lSunSeen ) * ${(1 - SHADOW_SKY).toFixed(2)} * smoothstep( 0.0, 0.15, dot( geometryNormal, directLight.direction ) ) * clamp( length( sunLight.color ), 0.0, 1.0 );
`);
THREE.ShaderChunk.lights_fragment_end = "#if defined( RE_IndirectDiffuse )\n  irradiance *= m2lShade;\n#endif\n" + THREE.ShaderChunk.lights_fragment_end;

/** Whether a mesh, by its name, throws a shadow in the view. Plants never do, as in AC; the rest of the track is left out on purpose. Pure. */
export function castsShadow(name: string) { return THROWS.test(name); }

/** How deep into the view the shadows reach, at a height over the ground in m. Pure. */
export function shadowRange(height: number) { return Math.min(RANGE_MOST_M, RANGE_M + height * RANGE_PER_HEIGHT); }

/** Set a track's mesh to take shadows, and by its name to throw them. */
export function takeShadows(mesh: THREE.Mesh) {
  mesh.receiveShadow = true;
  if (castsShadow(mesh.name)) { mesh.castShadow = true; mesh.layers.enable(CAST_LAYER); }
}

/** The view's sun. It stays set to throw at night too: a change would rebuild every shader. */
export function sunLight() {
  const sun = new SunLight();
  sun.castShadow = true;
  sun.layers.enable(PASS_LAYER);
  sun.shadow.camera.layers.set(CAST_LAYER);
  sun.shadow.normalBias = NORMAL_BIAS_M;
  return sun;
}

/** Draws the sun's shadow map of a frame once, ahead of the scenes that read it: edited ground comes first and has no houses of its own. */
export class SunShadows {
  constructor(private renderer: THREE.WebGLRenderer, private scene: THREE.Scene, private sun: SunLight) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = false;
  }

  /** The map for this camera, at a height over the ground in m. A plain render: three.js draws the map only inside one; on the
   * pass's layer the camera sees the sun and no mesh, so no colour is drawn. */
  draw(camera: THREE.Camera, height: number) {
    if (!this.sun.intensity) return;
    this.sun.shadow.camera.far = shadowRange(height);
    const seen = camera.layers.mask;
    camera.layers.set(PASS_LAYER);
    this.renderer.shadowMap.needsUpdate = true;
    try { this.renderer.render(this.scene, camera); } finally { camera.layers.mask = seen; }
  }
}
