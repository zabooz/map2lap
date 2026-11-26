import type {AiAnchor, AiRedraw} from "../state/edits";

/** Marker zero is A, followed by the stored ground clicks and B. Pure. */
export function movePoint(item: AiRedraw, marker: number, point: number[]): AiRedraw {
  if (marker < 1 || marker > item.points.length) return item;
  return {...item, points:item.points.map((p,i) => i + 1 === marker ? point : p)};
}

export function removePoint(item: AiRedraw, marker: number): AiRedraw {
  if (marker < 1 || marker > item.points.length) return item;
  return {...item, points:item.points.filter((_,i) => i + 1 !== marker)};
}

/** Keep the recipe intact until the new ground clicks and their endpoint pass preview. Pure. */
export function openStroke(item: AiRedraw, after: number) {
  return {item, after, prefix:item.points.slice(0,after)};
}

export function reconnect(opening: ReturnType<typeof openStroke>, clicks: number[][], marker: number): AiRedraw {
  const {item,prefix} = opening;
  return {...item,points:[...prefix,...clicks,...item.points.slice(marker-1)]};
}

export function finishStroke(opening: ReturnType<typeof openStroke>, clicks: number[][], end: AiAnchor, tail?: number[]): AiRedraw {
  const item = {...opening.item,end,points:[...opening.prefix,...clicks]};
  if (tail) item.tail = tail;
  else delete item.tail;
  return item;
}

/** Pop a ground click. At the start marker the entire transient draft is discarded. Pure. */
export function backPoint(clicks: number[][]) {
  return clicks.length ? clicks.slice(0,-1) : null;
}
