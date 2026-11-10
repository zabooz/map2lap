import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import {useEffect, useEffectEvent, useMemo, useRef, useState} from "react";
import {MapContainer, Marker, Polyline, Rectangle, TileLayer, Tooltip, useMap, useMapEvents} from "react-leaflet";
import type {MapMove, NewTrack, Point} from "../hooks/useNewTrack";
import type {Box, LatLon, Tab, Track} from "../types";
import styles from "./TrackMap.module.css";

const VIEW_KEY = "map2lap.view";
const FIRST_VIEW = {center: [48.5, 11] as LatLon, zoom: 5};     // first visit: central Europe; then where the map was left
const ROUTE_COLOR = "var(--map-route)";  // The map stays light in both appearances, so its route keeps a dark petrol.
const PIN_ZOOM = 13;
const EARTH_M = 40075016;
const BOX_STYLE = {color: ROUTE_COLOR, weight: 2, fillOpacity: 0.1};

const pin = L.icon({iconUrl, iconRetinaUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], tooltipAnchor: [16, -28],
                    shadowSize: [41, 41]});
const handle = L.divIcon({className: styles.handle, iconSize: [14, 14]});

function savedView() {
  try {
    const v = JSON.parse(localStorage.getItem(VIEW_KEY) ?? "null");
    if (v?.c && v.z) return {center: L.latLng(v.c).wrap(), zoom: v.z as number};
  } catch { /* (blocked or broken: the first view) */ }
  return FIRST_VIEW;
}

const boxBounds = ([s, w, n, e]: Box): L.LatLngBoundsLiteral => [[s, w], [n, e]];

/** Keeps the view for the next visit, and makes the moves asked for. */
function View({move}: {move: MapMove | null}) {
  const map = useMapEvents({
    moveend() {
      try {
        localStorage.setItem(VIEW_KEY, JSON.stringify({c: map.getCenter(), z: map.getZoom()}));
      } catch { /* (blocked: the view stays for this visit) */ }
    },
  });

  useEffect(() => {
    if (move?.kind === "fit") map.fitBounds(move.bounds, {padding: [move.padding, move.padding], maxZoom: move.maxZoom});
    else if (move?.kind === "pin") map.setView(move.at, Math.max(map.getZoom(), PIN_ZOOM));
    else if (move?.kind === "view") map.setView(move.at, move.zoom);
  }, [map, move]);

  return null;
}

/** The corridor, as a wide line: its pixel width from metres at the map's zoom. */
function Corridor({coords, width}: {coords: LatLon[]; width: number}) {
  const map = useMap();
  const [metresPerPixel, setMetresPerPixel] = useState(0);

  useEffect(() => {
    const measure = () => setMetresPerPixel(
      EARTH_M * Math.cos(map.getCenter().lat * Math.PI / 180) / (256 * 2 ** map.getZoom()));
    measure();
    map.on("zoomend", measure);
    return () => { map.off("zoomend", measure); };
  }, [map]);

  return <Polyline positions={coords} pathOptions={{color: ROUTE_COLOR, opacity: 0.22,
                                                    weight: metresPerPixel ? Math.max(2, 2 * width / metresPerPixel) : 1}} />;
}

/** One pin. Its position stays the same object between renders: a new one puts a pin being dragged back at once. */
function PointMarker({track, point: p, label}: {track: NewTrack; point: Point; label: string}) {
  const position = useMemo<LatLon>(() => [p.lat, p.lon], [p.lat, p.lon]);
  return (
    <Marker position={position} icon={pin} draggable eventHandlers={{
      dragend: e => { const at = (e.target as L.Marker).getLatLng(); track.dragPoint(p.id, at.lat, at.lng); },
      contextmenu: () => track.removePoint(p.id),
    }}>
      <Tooltip key={label}>{label}</Tooltip>
    </Marker>
  );
}

/** The route's pins: click adds, drag moves, right-click removes. The last point is the finish. */
function Route({track}: {track: NewTrack}) {
  useMapEvents({click: e => track.addPoint(e.latlng.lat, e.latlng.lng)});
  const n = track.points.length;
  return (
    <>
      {track.routeCoords && <Corridor coords={track.routeCoords} width={track.width} />}
      {track.routeCoords && <Polyline positions={track.routeCoords} pathOptions={{color: ROUTE_COLOR, weight: 4}} />}
      {track.points.map((p, i) => (
        <PointMarker key={p.id} track={track} point={p} label={i === 0 ? "Start" : i === n - 1 ? "Finish" : String(i)} />
      ))}
    </>
  );
}

const corner = (box: Box, k: number) => L.latLng(k & 1 ? box[2] : box[0], k & 2 ? box[3] : box[1]);

/** The area: while there is none, press and drag draws instead of moving the map; then its corners resize it (the
    opposite one stays). Corner k: bit 0 north, bit 1 east. */
function Area({track}: {track: NewTrack}) {
  const map = useMap();
  const from = useRef<L.LatLng | null>(null), to = useRef<L.LatLng | null>(null);
  const {area, shownBox} = track;

  useEffect(() => {
    if (area) map.dragging.enable(); else map.dragging.disable();
    return () => { map.dragging.enable(); };
  }, [map, area]);

  useMapEvents({
    mousedown(e) {
      if (area) return;
      e.originalEvent.preventDefault();         // (no text selection while drawing)
      from.current = to.current = e.latlng;
    },
    mousemove(e) {
      if (!from.current) return;
      to.current = e.latlng;
      track.showBox(from.current, e.latlng, false);
    },
  });

  const letGo = useEffectEvent(() => {
    if (!from.current || !to.current) return;
    const a = from.current;
    from.current = null;
    track.showBox(a, to.current, true);
  });

  useEffect(() => {
    const up = () => letGo();
    document.addEventListener("mouseup", up);
    return () => document.removeEventListener("mouseup", up);
  }, []);

  // (the same objects between renders: a new position puts a corner being dragged back at once)
  const corners = useMemo(() => (area ? [0, 1, 2, 3].map(k => corner(area, k)) : []), [area]);
  return (
    <>
      {shownBox && <Rectangle bounds={boxBounds(shownBox)} interactive={false} pathOptions={BOX_STYLE} />}
      {area && corners.map((at, k) => (
        <Marker key={k} position={at} icon={handle} draggable eventHandlers={{
          drag: e => track.showBox(corner(area, 3 - k), (e as L.LeafletMouseEvent).latlng, false),
          dragend: e => track.showBox(corner(area, 3 - k), (e.target as L.Marker).getLatLng(), true),
        }} />
      ))}
    </>
  );
}

/** The picked track on the map. */
function Picked({track: t}: {track: Track}) {
  if (t.area) return <Rectangle bounds={boxBounds(t.area)} interactive={false} pathOptions={BOX_STYLE} />;
  return <Polyline positions={t.line ?? t.points} interactive={false} pathOptions={{color: ROUTE_COLOR, weight: 4}} />;
}

/** The map (worldCopyJump: dragged around the earth it stays on the real one, its clicks' longitudes within -180 .. 180). */
export function TrackMap({tab, track, picked, move}: {tab: Tab; track: NewTrack; picked: Track | undefined;
                                                      move: MapMove | null}) {
  const [first] = useState(savedView);
  return (
    <MapContainer className={styles.map} center={first.center} zoom={first.zoom} worldCopyJump>
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19}
                 attribution="&copy; OpenStreetMap contributors" />
      <View move={move} />
      {tab === "new" && track.mode === "route" && <Route track={track} />}
      {tab === "new" && track.mode === "area" && <Area track={track} />}
      {tab === "mine" && picked && <Picked track={picked} />}
    </MapContainer>
  );
}
