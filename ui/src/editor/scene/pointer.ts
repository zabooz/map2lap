import * as THREE from "three";

export const MIDDLE_BUTTON = 1, MIDDLE_HELD = 4, RIGHT_BUTTON = 2, RIGHT_HELD = 2;
export const LEFT_BUTTON = 0, LEFT_HELD = 1;
export const CLICK_PX = 4;

/** Where a mouse event lies on el, each way from -1 to 1. Pure. */
export function screenPoint(e: MouseEvent, el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
}
