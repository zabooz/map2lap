// Places along a route, for the camera that rides along it: no three.js here.

/** The route's length up to each of its points, [[AC x, AC z], ...]. Pure. */
export function routeMetres(route: number[][]) {
  const metres = [0];
  for (let k = 1; k < route.length; k++) metres.push(metres[k - 1] + Math.hypot(route[k][0] - route[k - 1][0], route[k][1] - route[k - 1][1]));
  return metres;
}

/** The place at metre m along route, metres its routeMetres; its ends where m lies beyond them. Pure. */
export function placeOnRoute(route: number[][], metres: number[], m: number): [number, number] {
  let low = 0, high = metres.length - 1;
  if (m <= 0) return [route[0][0], route[0][1]];
  if (m >= metres[high]) return [route[high][0], route[high][1]];
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (metres[middle] <= m) low = middle;
    else high = middle;
  }
  const share = (m - metres[low]) / (metres[high] - metres[low] || 1);
  return [route[low][0] + (route[high][0] - route[low][0]) * share, route[low][1] + (route[high][1] - route[low][1]) * share];
}
