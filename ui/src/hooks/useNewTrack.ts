import L from "leaflet";
import {useEffect, useEffectEvent, useRef, useState} from "react";
import {post} from "../api";
import {shortName, slug} from "../format";
import type {Box, BuildOptions, CodeContent, LatLon, Mode, Place} from "../types";

export const MAX_KM = 500;
const TILE_M = 256;
const CODE_WAIT_MS = 300;       // (a code is made after typing in the name or moving the slider stops)
export const WIDTH_RANGE = [30, 400, 10] as const;

export interface Point {
  id: number;
  lat: number;
  lon: number;
  label: string | null;         // the place picked in its field, or found for a pin; null: its coordinates
}

export type Selection =
  | {kind: "msg"; text: string; bad?: boolean; ok: false}
  | {kind: "route"; km: number; ok: boolean; openCircuit?: boolean}
  | {kind: "area"; w: number; h: number; tiles: number; ok: boolean};

/** How the map should move once. */
export type MapMove =
  | {kind: "fit"; bounds: L.LatLngBoundsExpression; maxZoom?: number; padding: number}
  | {kind: "fitCircuit"; coords: LatLon[]; pins?: LatLon[]; padding: number; maxZoom?: number}
  | {kind: "pin"; at: LatLon}
  | {kind: "view"; at: LatLon; zoom: number};

interface RouteResult {
  coords?: LatLon[];
  length_m?: number;
  error?: string;
}

interface CircuitClosure {
  key: string;
  fit?: boolean;
  result?: RouteResult;
}

/** The box two corners span, on the real earth though drawn on a copy of it. Pure. */
export function boxOf(a: L.LatLng, b: L.LatLng): Box {
  const turns = 360 * Math.round((a.lng + b.lng) / 720);
  return [Math.min(a.lat, b.lat), Math.min(a.lng, b.lng) - turns, Math.max(a.lat, b.lat), Math.max(a.lng, b.lng) - turns];
}

/** A box's size in m and its tiles, counted from the middle. Pure. */
export function boxSize([s, w, n, e]: Box) {
  const wm = L.latLng((s + n) / 2, w).distanceTo([(s + n) / 2, e]);
  const hm = L.latLng(s, (w + e) / 2).distanceTo([n, (w + e) / 2]);
  return {w: wm, h: hm, tiles: 4 * Math.ceil(wm / (2 * TILE_M)) * Math.ceil(hm / (2 * TILE_M))};
}

/** A move showing the points (none: no move). Pure. */
function moveTo(points: Point[], circuit: boolean): MapMove | null {
  if (points.length > 1) {
    const coords: LatLon[] = points.map(p => [p.lat, p.lon]);
    return circuit ? {kind: "fitCircuit", coords, padding: 60} : {kind: "fit", bounds: coords, padding: 60};
  }
  return points.length ? {kind: "pin", at: [points[0].lat, points[0].lon]} : null;
}

/** The track being set up on "New track": its route, circuit or area, name, corridor and track code. The line, the track code
    and the place names are asked from the server as these change. onTouch: the selection changed. onShowNew: a track code
    was applied. onMove: the map should move. */
export function useNewTrack(onTouch: () => void, onShowNew: () => void, onMove: (move: MapMove) => void) {
  const [mode, setModeState] = useState<Mode>("route");
  const [title, setTitleState] = useState("My Route");
  const [width, setWidthState] = useState(100);
  const [options, setOptionsState] = useState<BuildOptions>({terrain_cell_m: 2, parked_cars: true, tree_spacing_m: 2, ground_quality: "sd"});
  const [points, setPoints] = useState<Point[]>([]);
  const [area, setArea] = useState<Box | null>(null);
  const [draft, setDraft] = useState<Box | null>(null);     // the box while drawn or resized
  const [answer, setAnswer] = useState<{key: string; result: RouteResult} | null>(null);
  const [closure, setClosure] = useState<CircuitClosure | null>(null);
  const [madeCode, setMadeCode] = useState<{key: string; code: string} | null>(null);
  const [message, setMessage] = useState<string | null>(null);     // (a pasted code's fault)
  const nextId = useRef(1);
  const titleAuto = useRef(true);       // the name comes from the places until a name is typed; emptied it does again
  const nameAsk = useRef(0);
  const askedPlace = useRef(new Set<string>());
  const touch = () => { setClosure(null); setMessage(null); onTouch(); };

  async function askName(body: {points?: LatLon[]; area?: Box}) {
    if (!titleAuto.current) return;
    const k = ++nameAsk.current;
    const r = await post<{title: string}>("/api/name", body);
    if (k === nameAsk.current && titleAuto.current && r.title) setTitleState(r.title);
  }

  // --- the route or lap through the points ---
  const circuit = mode === "circuit";
  const positions: LatLon[] = points.map(p => [p.lat, p.lon]);
  const pinBody = {points: positions, ...(circuit ? {kind: mode} : {})};
  const routeKey = JSON.stringify({points: positions});
  const openRoute = mode !== "area" && answer?.key === routeKey ? answer.result : null;
  const activeClosure = circuit && closure?.key === routeKey ? closure : null;
  const lap = activeClosure?.result?.coords?.length ? activeClosure.result : null;
  const route = lap ?? openRoute;
  const routeKm = route?.length_m !== undefined ? route.length_m / 1000 : undefined;
  const openReady = Boolean(openRoute?.coords?.length);
  const closing = activeClosure !== null && !activeClosure.result && !openRoute?.error;

  const routeCame = useEffectEvent((key: string, asked: LatLon[], result: RouteResult) => {
    onTouch();
    setAnswer({key, result});
    if (!result.error) void askName({points: asked});
  });

  useEffect(() => {
    const asked: {points: LatLon[]} = JSON.parse(routeKey);
    if (mode === "area" || asked.points.length < 2) return;
    let alive = true;
    post<RouteResult>("/api/route", mode === "circuit" ? {...asked, circuit_draft: true} : asked).then(r => {
      if (alive) routeCame(routeKey, asked.points, r);
    });
    return () => { alive = false; };
  }, [mode, routeKey]);

  const closedCourseCame = useEffectEvent((request: CircuitClosure, pins: LatLon[], result: RouteResult) => {
    if (closure !== request) return;
    setClosure({...request, result});
    if (request.fit && result.coords?.length) onMove({kind: "fitCircuit", coords: result.coords, pins, padding: 60});
  });

  useEffect(() => {
    if (!openReady || !activeClosure || activeClosure.result) return;
    const {points}: {points: LatLon[]} = JSON.parse(activeClosure.key);
    let alive = true;
    post<RouteResult>("/api/route", {points, kind: "circuit"}).then(result => {
      if (alive) closedCourseCame(activeClosure, points, result);
    });
    return () => { alive = false; };
  }, [activeClosure, openReady]);

  const closeCircuit = () => {
    setMessage(null);
    onTouch();
    setClosure({key: routeKey});
  };

  // --- a pin set on the map: its place instead of the coordinates, once known ---
  useEffect(() => {
    for (const p of points) {
      const asking = `${p.id}:${p.lat},${p.lon}`;
      if (p.label || askedPlace.current.has(asking)) continue;
      askedPlace.current.add(asking);
      post<{name: string | null}>("/api/place", {lat: p.lat, lon: p.lon}).then(r => {
        const name = r.name;
        if (!name) return;
        setPoints(ps => ps.map(q => (q.id === p.id && q.lat === p.lat && q.lon === p.lon ? {...q, label: name} : q)));
      });
    }
  }, [points]);

  // --- its track code (made by the server: trackcode.py) ---
  const makes = mode === "area" ? area && {title: title.trim(), area, ...options}
    : (circuit ? lap : openRoute)?.coords && positions.length >= 2 ? {title: title.trim(), width, ...pinBody, ...options} : null;
  const makesKey = makes ? JSON.stringify(makes) : "";
  const code = madeCode?.key === makesKey ? madeCode.code : "";

  useEffect(() => {
    if (!makesKey) return;
    let alive = true;
    const timer = setTimeout(() => {
      post<{code: string}>("/api/code", {make: JSON.parse(makesKey)}).then(r => {
        if (alive) setMadeCode({key: makesKey, code: r.code ?? ""});
      });
    }, CODE_WAIT_MS);
    return () => { alive = false; clearTimeout(timer); };
  }, [makesKey]);

  // --- what is selected, for the status card and the Build button ---
  const shownBox = draft ?? area;
  let selection: Selection | null = null;
  if (message) selection = {kind: "msg", text: message, bad: true, ok: false};
  else if (mode === "area") {
    if (shownBox) selection = {kind: "area", ...boxSize(shownBox), ok: !draft && Boolean(area)};
  } else if (points.length === 1) selection = {kind: "msg", text: circuit ? "Now click the next pin." : "Now click the finish.", ok: false};
  else if (points.length > 1) {
    const error = activeClosure?.result?.error ?? (closing ? undefined : route?.error);
    if (error) selection = {kind: "msg", text: `${circuit ? "Circuit" : "Route"}: ${error}`, bad: true, ok: false};
    else if (closing) selection = {kind: "msg", text: "Closing circuit …", ok: false};
    else if (routeKm !== undefined) {
      const openCircuit = circuit && !lap;
      selection = {kind: "route", km: routeKm, ok: !openCircuit && routeKm <= MAX_KM, openCircuit};
    } else selection = {kind: "msg", text: "Calculating route …", ok: false};
  }

  // --- changes ---
  const newPoint = (lat: number, lon: number, label: string | null): Point => {
    const at = L.latLng(lat, lon).wrap();
    return {id: nextId.current++, lat: at.lat, lon: at.lng, label};
  };

  const addPoint = (lat: number, lon: number) => {
    touch();
    setPoints(ps => [...ps, newPoint(lat, lon, null)]);
  };

  const addPlace = (p: Place) => {
    touch();
    const next = [...points, newPoint(p.lat, p.lon, shortName(p.name))];
    setPoints(next);
    const move = moveTo(next, circuit);
    if (move) onMove(move);
  };

  const movePlace = (id: number, p: Place) => {
    touch();
    const next = points.map(q => (q.id === id ? {...q, lat: p.lat, lon: p.lon, label: shortName(p.name)} : q));
    setPoints(next);
    const move = moveTo(next, circuit);
    if (move) onMove(move);
  };

  const dragPoint = (id: number, lat: number, lon: number) => {
    touch();
    const at = L.latLng(lat, lon).wrap();
    setPoints(ps => ps.map(q => (q.id === id ? {...q, lat: at.lat, lon: at.lng, label: null} : q)));
  };

  const removePoint = (id: number) => {
    touch();
    setPoints(ps => ps.filter(q => q.id !== id));
  };

  const clear = () => {
    touch();
    setPoints([]);
    setArea(null);
    setDraft(null);
    setMadeCode(null);
    nameAsk.current++;       // (a name still arriving for the cleared selection is no longer wanted)
  };

  const setMode = (m: Mode) => {
    setModeState(m);
    clear();
  };

  const setTitle = (value: string) => {
    titleAuto.current = !value.trim();
    setTitleState(value);
    if (titleAuto.current) {
      if (mode === "area" && area) void askName({area});
      else if (mode !== "area" && positions.length >= 2) void askName({points: positions});
    }
  };

  const setWidth = (value: number) => {
    setWidthState(value);
    onTouch();
  };

  const setOptions = (value: Partial<BuildOptions>) => {
    setOptionsState(old => ({...old, ...value}));
    onTouch();
  };

  /** The box goes from a to b; done: it is let go (a click without dragging draws none). */
  const showBox = (a: L.LatLng, b: L.LatLng, done: boolean) => {
    onTouch();
    const box = boxOf(a, b), size = boxSize(box);
    if (!done) {
      setDraft(box);
      return;
    }
    setDraft(null);
    if (size.w < 1 || size.h < 1) {
      setArea(null);
      return;
    }
    setArea(box);
    void askName({area: box});
  };

  /** A pasted track code: its pins and corridor or its area, and its name. */
  const applyCode = (c: CodeContent) => {
    onShowNew();
    clear();
    setModeState(c.area ? "area" : c.kind === "circuit" ? "circuit" : "route");
    setOptionsState({terrain_cell_m: c.terrain_cell_m ?? 2, parked_cars: c.parked_cars ?? true, tree_spacing_m: c.tree_spacing_m ?? 0, ground_quality: c.ground_quality ?? "sd"});
    if (c.title) {
      setTitleState(c.title);
      titleAuto.current = false;
    }
    if (c.area) {
      setArea(c.area);
      const [s, w, n, e] = c.area;
      onMove({kind: "fit", bounds: [[s, w], [n, e]], padding: 60});
      return;
    }
    const [low, high, step] = WIDTH_RANGE;
    setWidthState(Math.min(high, Math.max(low, Math.round((c.width ?? 100) / step) * step)));
    const next = (c.points ?? []).map(([lat, lon]) => newPoint(lat, lon, null));
    setPoints(next);
    const isCircuit = c.kind === "circuit";
    if (isCircuit && next.length > 1) {
      const pins = next.map((p): LatLon => [p.lat, p.lon]);
      setClosure({key: JSON.stringify({points: pins}), fit: true});
    }
    const move = moveTo(next, isCircuit);
    if (move) onMove(move);
  };

  const pasteCode = async (text: string) => {
    const value = text.trim();
    if (!value || value === code) return;
    const got = await post<CodeContent>("/api/code", {code: value});
    if (got.error) {
      setMessage(`Track code: ${got.error}.`);
      onTouch();
      return;
    }
    applyCode(got);
  };

  /** The request that builds it. */
  const buildBody = () => {
    const name = title.trim() || (circuit ? "Circuit" : "Route");
    return {name: slug(name), title: name, ...options,
            ...(mode === "area" ? {area} : {...pinBody, width})};
  };

  return {mode, title, width, options, setOptions, points, area, shownBox, routeCoords: route?.coords ?? null, routeKm, selection,
          closing, circuitClosed: lap !== null, canCloseCircuit: openReady && !closing && !lap, closeCircuit,
          code: makes ? code : "", setMode, setTitle, setWidth, addPoint, addPlace, movePlace, dragPoint, removePoint,
          clear, showBox, pasteCode, buildBody};
}

export type NewTrack = ReturnType<typeof useNewTrack>;
