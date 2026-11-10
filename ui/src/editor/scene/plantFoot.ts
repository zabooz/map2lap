import * as THREE from "three";

// A plant meets the ground with its lowest tenth: a tree's trunk below its crown, a bush's or rock's whole underside.
// Where it fails: a spruce whose branches sweep down to the ground gets their reach, so on a slope it sits a little deeper.
const FOOT_SHARE = .1;

/** Each vertex of root's meshes in root's own frame. Pure but for root's world matrices. */
function eachVertex(root: THREE.Object3D, visit: (point: THREE.Vector3) => void) {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert(), local = new THREE.Matrix4(), point = new THREE.Vector3();
  root.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return;
    const position = node.geometry.getAttribute("position");
    if (!position) return;
    local.multiplyMatrices(inverse, node.matrixWorld);
    for (let i = 0; i < position.count; i++) visit(point.fromBufferAttribute(position, i).applyMatrix4(local));
  });
}

/** How far a model's foot reaches from its anchor across the ground, in the model's own units: root its loaded scene, anchor its
    foot point (modeldata: the middle of its lowest vertices). A tree's is its trunk's radius, a rock's the corner of its underside. Pure. */
export function footReach(root: THREE.Object3D, anchor: number[]) {
  let low = Infinity, high = -Infinity;
  eachVertex(root, p => { low = Math.min(low, p.y); high = Math.max(high, p.y); });
  if (!Number.isFinite(low)) return 0;
  const top = low + (high - low) * FOOT_SHARE;
  let reach = 0;
  eachVertex(root, p => { if (p.y <= top) reach = Math.max(reach, Math.hypot(p.x - anchor[0], p.z - anchor[2])); });
  return reach;
}
