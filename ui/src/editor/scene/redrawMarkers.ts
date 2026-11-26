import * as THREE from "three";
import {PREVIEW_LIFT} from "./aiPreviewBand";

/** Fixed screen sizes keep ground clicks pickable as the camera moves along the road. */
export function redrawMarkers(controls: number[][]) {
  const group = new THREE.Group();
  const positions = controls.flatMap(([x,y,z]) => [x,y+PREVIEW_LIFT,z]);
  const colors = controls.flatMap((_,i) => new THREE.Color(
    i === 0 || i === controls.length-1 ? 0xffcb6b : 0xffffff).toArray());
  for (const outline of [true,false]) {
    const geometry = new THREE.BufferGeometry().setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
    geometry.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
    const dots = new THREE.Points(geometry,new THREE.PointsMaterial({size:outline ? 10 : 6,
      sizeAttenuation:false, transparent:true, vertexColors:!outline, color:outline ? 0x243039 : 0xffffff, depthWrite:false, toneMapped:false}));
    dots.renderOrder = outline ? 14 : 15;
    group.add(dots);
  }
  return group;
}

/** Marker samples in driving order. The swept band retains the horizontal position of each click. Pure. */
export function markerSamples(controls: number[][], ink: number[][]) {
  let previous = 0;
  return controls.map(([x,,z]) => {
    let best = Infinity;
    for (let i=previous; i<ink.length; i++) {
      const d = (ink[i][0]-x)**2+(ink[i][2]-z)**2;
      if (d < best) { best=d; previous=i; }
      if (d === 0) break;
    }
    return previous;
  });
}
