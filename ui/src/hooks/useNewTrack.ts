import L from "leaflet";
import {useEffect, useEffectEvent, useRef, useState} from "react";
import {post, type WithError} from "../api";
import {shortName, slug} from "../format";
import type {Box, CodeContent, LatLon, Mode, Place} from "../types";

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
  | {kind: "route"; km: number; ok: boolean}
  | {kind: "area"; w: number; h: number; tiles: number; ok: boolean};

/** How the map should move once. */
export type MapMove =
  | {kind: "fit"; bounds: L.LatLngBoundsExpression; maxZoom?: number; padding: number}
  | {kind: "pin"; at: LatLon}
  | {kind: "view"; at: LatLon; zoom: number};

interface RouteAnswer {
  key: string;
  coords?: LatLon[];
  km?: number;
  error?: string;
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
function moveTo(points: {lat: number; lon: number}[]): MapMove | null {
  if (points.length > 1) return {kind: "fit", bounds: points.map(p => [p.lat, p.lon] as LatLon), padding: 60};
  return points.length ? {kind: "pin", at: [points[0].lat, points[0].lon]} : null;
}

/** The track being set up on "New track": its route or area, name, corridor and track code. The route, the track code
    and the place names are asked from the server as these change. onTouch: the selection changed. onShowNew: a track code
    was applied. onMove: the map should move. */
export function useNewTrack(onTouch: () => void, onShowNew: () => void, onMove: (move: MapMove) => void) {
  const [mode, setModeState] = useState<Mode>("route");
  const [title, setTitleState] = useState("My Route");
  const [width, setWidthState] = useState(100);
  const [points, setPoints] = useState<Point[]>([]);
  const [addingStop, setAddingStop] = useState(false);
  const [area, setArea] = useState<Box | null>(null);
  const [draft, setDraft] = useState<Box | null>(null);     // the box while drawn or resized
  const [answer, setAnswer] = useState<RouteAnswer | null>(null);
  const [madeCode, setMadeCode] = useState<{key: string; code: string} | null>(null);
  const [message, setMessage] = useState<string | null>(null);     // (a pasted code's fault)
  const nextId = useRef(1);
  const titleAuto = useRef(true);       // the name comes from the places until a name is typed; emptied it does again
  const nameAsk = useRef(0);
  const askedPlace = useRef(new Set<string>());

  const touch = () => { setMessage(null); onTouch(); };

  async function askName(body: {points?: LatLon[]; area?: Box}) {
    if (!titleAuto.current) return;
    const k = ++nameAsk.current;
    const r = await post<{title: string}>("/api/name", body);
    if (k === nameAsk.current && titleAuto.current && r.title) setTitleState(r.title);
  }

  // --- the route through the points ---
  const positions: LatLon[] = points.map(p => [p.lat, p.lon]);
  const routeKey = JSON.stringify(positions);
  const route = mode === "route" && answer?.key === routeKey ? answer : null;

  const routeCame = useEffectEvent((key: string, asked: LatLon[], r: WithError<Partial<{coords: LatLon[]; length_m: number}>>) => {
    onTouch();
    if (r.error) {
      setAnswer({key, error: r.error});
      return;
    }
    setAnswer({key, coords: r.coords, km: (r.length_m ?? 0) / 1000});
    void askName({points: asked});
  });

  useEffect(() => {
    const asked: LatLon[] = JSON.parse(routeKey);
    if (mode !== "route" || asked.length < 2) return;
    let alive = true;
    post<{coords: LatLon[]; length_m: number}>("/api/route", {points: asked}).then(r => {
      if (alive) routeCame(routeKey, asked, r);
    });
    return () => { alive = false; };
  }, [mode, routeKey]);

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
  const makes = mode === "area" ? area && {title: title.trim(), area}
    : route?.coords && positions.length >= 2 ? {title: title.trim(), width, points: positions} : null;
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
  } else if (points.length === 1) selection = {kind: "msg", text: "Now click the finish.", ok: false};
  else if (points.length > 1) {
    if (route?.error) selection = {kind: "msg", text: `Route: ${route.error}`, bad: true, ok: false};
    else if (route?.km !== undefined) selection = {kind: "route", km: route.km, ok: route.km <= MAX_KM};
    else selection = {kind: "msg", text: "Calculating route …", ok: false};
  }

  // --- changes ---
  const newPoint = (lat: number, lon: number, label: string | null): Point => {
    const at = L.latLng(lat, lon).wrap();
    return {id: nextId.current++, lat: at.lat, lon: at.lng, label};
  };

  const addPoint = (lat: number, lon: number) => {
    touch();
    setPoints(ps => [...ps, newPoint(lat, lon, null)]);       // (the last point is the finish)
  };

  const addPlace = (p: Place) => {
    touch();
    setAddingStop(false);
    const next = [...points, newPoint(p.lat, p.lon, shortName(p.name))];
    setPoints(next);
    const move = moveTo(next);
    if (move) onMove(move);
  };

  const movePlace = (id: number, p: Place) => {
    touch();
    const next = points.map(q => (q.id === id ? {...q, lat: p.lat, lon: p.lon, label: shortName(p.name)} : q));
    setPoints(next);
    const move = moveTo(next);
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
    setAddingStop(false);
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
      else if (mode === "route" && positions.length >= 2) void askName({points: positions});
    }
  };

  const setWidth = (value: number) => {
    setWidthState(value);
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
    setModeState(c.area ? "area" : "route");
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
    const move = moveTo(next);
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
    const name = title.trim() || "Route";
    return {name: slug(name), title: name, ...(mode === "area" ? {area} : {points: positions, width})};
  };

  return {mode, title, width, points, addingStop, area, shownBox, routeCoords: route?.coords ?? null, selection,
          code: makes ? code : "", setMode, setTitle, setWidth, addPoint, addPlace, movePlace, dragPoint, removePoint,
          clear, setAddingStop, showBox, pasteCode, buildBody};
}

export type NewTrack = ReturnType<typeof useNewTrack>;
