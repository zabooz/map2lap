import * as THREE from "three";
import {DEFAULT_WEATHER, weatherAppearance, windVelocity, type WeatherOptions} from "./weather";

const COUNT = 600, BOX = new THREE.Vector3(36, 24, 36);

/** One small GPU particle field giving the editor a rain/snow indication; geometry stays unchanged while animating. */
export class WeatherPreview {
  private options = {...DEFAULT_WEATHER};
  private time = 0;
  private randomBearing = Math.random() * 360;
  private drift = new THREE.Vector3();
  private inverse = new THREE.Quaternion();
  private apparent = new THREE.Vector3();
  private geometry = new THREE.BufferGeometry();
  private material = new THREE.ShaderMaterial({transparent: true, depthWrite: false,
    uniforms: {cameraAt: {value: new THREE.Vector3()}, drift: {value: this.drift}, elapsed: {value: 0},
      snow: {value: 0}, opacity: {value: 1}, streak: {value: new THREE.Vector2(0, 1)}, boxSize: {value: BOX}},
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      uniform vec3 cameraAt, drift, boxSize;
      uniform float elapsed, snow;
      varying float alpha;
      void main() {
        float seed = fract(sin(dot(position, vec3(12.9,78.2,35.1))) * 43758.5);
        float speed = mix(7.0 + seed * 3.0, 0.6 + seed * 0.7, snow);
        vec3 at = position + drift - vec3(0.0, elapsed * speed, 0.0);
        at.xz += snow * vec2(sin(elapsed + seed * 6.28), cos(elapsed * .7 + seed * 6.28)) * .3;
        vec3 offset = mod(at - cameraAt + boxSize * .5, boxSize) - boxSize * .5;
        vec4 viewed = modelViewMatrix * vec4(cameraAt + offset, 1.0);
        gl_Position = projectionMatrix * viewed;
        // TrackView uses logarithmic depth for long tracks; particles must use the same depth as terrain.
        #include <logdepthbuf_vertex>
        gl_PointSize = mix(13.0, 3.0 + seed * 3.0, snow);
        alpha = smoothstep(1.2, 3.0, length(offset)) * (1.0 - smoothstep(12.0, 18.0, length(offset)));
      }`,
    fragmentShader: `
      #include <logdepthbuf_pars_fragment>
      uniform float snow, opacity;
      uniform vec2 streak;
      varying float alpha;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float across = dot(p, vec2(streak.y, -streak.x)), along = dot(p, streak);
        float rain = exp(-across * across * 65.0) * (1.0 - smoothstep(.6, 1.0, abs(along)));
        float flake = exp(-dot(p,p) * 3.0) * (1.0 - smoothstep(.4, 1.0, length(p)));
        gl_FragColor = vec4(vec3(.8,.86,.92), mix(rain, flake, snow) * alpha * opacity * .65);
        #include <logdepthbuf_fragment>
      }`});
  private points = new THREE.Points(this.geometry, this.material);

  constructor(scene: THREE.Scene) {
    const positions = new Float32Array(COUNT * 3);
    let seed = 173;
    for (let i = 0; i < positions.length; i++) { seed = seed * 16807 % 2147483647; positions[i] = seed / 2147483647 * BOX.getComponent(i % 3); }
    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.points.frustumCulled = false; this.points.visible = false;
    scene.add(this.points);
  }

  set(options: WeatherOptions) {
    this.options = {...options};
    this.points.visible = options.kind !== "dry";
    this.geometry.setDrawRange(0, Math.floor(COUNT * weatherAppearance(options).density));
    this.material.uniforms.snow.value = options.kind === "snow" ? 1 : 0;
  }

  /** Advance visible particles; true asks TrackView for another frame. */
  update(dt: number, camera: THREE.Camera, brightness: number) {
    if (!this.points.visible) return false;
    this.time += dt;
    const [wx, wz] = windVelocity(this.options, this.randomBearing);
    this.drift.x += wx * dt; this.drift.z += wz * dt;
    this.material.uniforms.elapsed.value = this.time;
    this.material.uniforms.cameraAt.value.copy(camera.position);
    this.material.uniforms.opacity.value = Math.max(.08, Math.min(1, brightness / 2));
    this.inverse.copy(camera.quaternion).invert();
    this.apparent.set(wx, -8, wz).applyQuaternion(this.inverse);
    this.material.uniforms.streak.value.set(this.apparent.x, -this.apparent.y).normalize();
    if (this.material.uniforms.streak.value.lengthSq() < 1e-8) this.material.uniforms.streak.value.set(0, 1);
    return true;
  }

  dispose() { this.points.removeFromParent(); this.geometry.dispose(); this.material.dispose(); }
}
