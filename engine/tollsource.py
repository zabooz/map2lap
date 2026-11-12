"""Small cached OSM extracts for a mapped toll canopy's lane directions; Overture remains the offline fallback."""
import hashlib
import json
import os
from pathlib import Path
import re
import time
import xml.etree.ElementTree as ET

import numpy as np

import mapgeom
import roads
from polygon import contains_points
from buildings.toll import TollRoad
from buildings.sites import road_through, _line_dist


def _number(value):
    match = re.match(r'^\s*(\d+(?:\.\d+)?)', str(value or ''))
    return float(match.group(1)) if match else None


def _merge(items):
    """Join adjacent OSM pieces with identical lane facts, preserving way direction. Pure."""
    out = [TollRoad(r.xy.copy(), r.width, r.lanes, r.forward, r.backward, r.speed) for r in items]
    again = True
    while again:
        again = False
        for i, a in enumerate(out):
            for j, b in enumerate(out):
                if i == j or (a.width, a.lanes, a.forward, a.backward, a.speed) != (b.width, b.lanes, b.forward, b.backward, b.speed):
                    continue
                if np.linalg.norm(a.xy[-1] - b.xy[0]) < .1:
                    # A branching endpoint is kept separate; its several driving corridors must all stay open.
                    joint = a.xy[-1]
                    if any(k not in (i, j) and min(np.linalg.norm(c.xy[0] - joint), np.linalg.norm(c.xy[-1] - joint)) < .1
                           for k, c in enumerate(out)):
                        continue
                    a.xy = np.concatenate([a.xy, b.xy[1:]])
                    out.pop(j); again = True; break
            if again:
                break
    return out


def roads_from_osm(data, frame, ring, fallback):
    """Crossing OSM highway ways, in tile coordinates, with explicit directional lanes and speed. Pure."""
    nodes = {e['id']: e for e in data.get('elements', ()) if e['type'] == 'node'}
    out = []
    for element in sorted(data.get('elements', ()), key=lambda e: (e['type'], e['id'])):
        tags = element.get('tags', {})
        if element['type'] != 'way' or tags.get('highway') not in ('motorway', 'trunk', 'primary', 'secondary', 'tertiary',
                                                                 'residential', 'unclassified', 'service', 'living_street'):
            continue
        if tags.get('tunnel') not in (None, 'no') or tags.get('bridge') not in (None, 'no'):
            continue
        points = [nodes[n] for n in element.get('nodes', ()) if n in nodes]
        if len(points) != len(element.get('nodes', ())) or len(points) < 2:
            continue
        e, n, _ = frame.geodetic_to_enu(np.array([p['lat'] for p in points]), np.array([p['lon'] for p in points]), 0.)
        xy = np.c_[e, n]
        if road_through(ring, [xy]) <= .1:
            continue
        centre = xy.mean(0)
        nearby = min(fallback, key=lambda r: _line_dist(centre, [r.xy]), default=None)
        lanes = _number(tags.get('lanes')) or (nearby.lanes if nearby else 0)
        if not 1 <= lanes <= 64:
            continue
        # Explicit way order is retained, so lanes:forward/backward cannot be flipped by a relation geometry.
        nf, nb = _number(tags.get('lanes:forward')), _number(tags.get('lanes:backward'))
        ow = tags.get('oneway')
        if ow in ('yes', '1', 'true'):
            nf, nb = lanes, 0
        elif ow == '-1':
            nf, nb = 0, lanes
        elif nf is not None and nb is None:
            nb = lanes - nf
        elif nb is not None and nf is None:
            nf = lanes - nb
        # A sidewalk/shoulder is not a driving lane: keep the generator's driving width as the width fallback.
        width = _number(tags.get('width')) or (nearby.width if nearby else lanes * 3.5)
        speed = _number(tags.get('maxspeed'))
        if speed and 'mph' in tags.get('maxspeed', ''):
            speed *= 1.609344
        out.append(TollRoad(xy, width, int(lanes), int(nf) if nf is not None else None,
                            int(nb) if nb is not None else None, speed or (nearby.speed if nearby else None)))
    return _merge(out)


def _extract(md, frame, ring):
    """Optional OSM map response round one toll footprint, cached for a week and usable offline."""
    if not hasattr(md, 'cache_dir') or not hasattr(md, 'fetcher'):
        return None
    lat, lon, _ = frame.enu_to_geodetic(ring[:, 0], ring[:, 1], 0.)
    # 20 m around the footprint includes its connecting road nodes, not an entire route or city.
    pad_y = 20 / 111320.; pad_x = pad_y / max(.1, float(np.cos(np.radians(np.mean(lat)))))
    bounds = [round(float(np.min(lon)) - pad_x, 6), round(float(np.min(lat)) - pad_y, 6),
              round(float(np.max(lon)) + pad_x, 6), round(float(np.max(lat)) + pad_y, 6)]
    if (bounds[2] - bounds[0]) * (bounds[3] - bounds[1]) > .01 or bounds[2] - bounds[0] > .1:
        return None  # exceptionally large/antimeridian footprints use the ordinary cached map pipeline
    key = hashlib.sha256(json.dumps(bounds).encode()).hexdigest()[:24]
    memo = md.__dict__.setdefault('_toll_extracts', {})
    if key in memo:
        return memo[key]
    path = Path(md.cache_dir) / 'mapdata' / 'raw' / 'toll' / (key + '.json')
    data = None
    try:
        data = json.loads(path.read_bytes())
        if time.time() - path.stat().st_mtime < 7 * 86400:
            memo[key] = data; return data
    except (OSError, ValueError):
        pass
    try:
        url = 'https://api.openstreetmap.org/api/0.6/map?bbox=' + ','.join(map(str, bounds))
        reply = md.fetcher.get(url, kind='predownload')
        root = ET.fromstring(reply.body)
        elements = []
        for e in root:
            if e.tag not in ('node', 'way'):
                continue
            record = dict(type=e.tag, id=int(e.attrib['id']), tags={t.attrib['k']: t.attrib['v'] for t in e.findall('tag')})
            if e.tag == 'node':
                record.update(lat=float(e.attrib['lat']), lon=float(e.attrib['lon']))
            else:
                record['nodes'] = [int(n.attrib['ref']) for n in e.findall('nd')]
            elements.append(record)
        fresh = {'elements': elements}
        if not isinstance(fresh.get('elements'), list):
            raise ValueError('OSM map response has no elements')
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(f'.{os.getpid()}.tmp')
        temporary.write_text(json.dumps(fresh), encoding='utf-8'); temporary.replace(path)
        data = fresh
    except Exception:
        pass  # optional enrichment: stale data or Overture still keeps every through road open
    memo[key] = data
    return data


def station_roads(md, frame, ring, road_layers, x0, y0):
    """The station's crossing ground roads, supplemented by OSM lane directions when reachable."""
    ring = ring + [x0, y0]
    fallback, seen = [], set()
    for f in road_layers:
        if f is None:
            continue
        specs = roads.road_specs(f)
        for i, spec in enumerate(specs):
            if spec is None or str(f.ids[i]) in seen:
                continue
            seen.add(str(f.ids[i]))
            for part in roads.ground_parts(f, i):
                xy = np.c_[mapgeom.enu_xy(f, frame, part)]
                if len(xy) < 2 or road_through(ring, [xy]) <= .1:
                    continue
                width, lanes = roads.lane_layout(spec)
                tags = roads.lane_tags(f, i) or {}
                nf, nb = _number(tags.get('lanes:forward')), _number(tags.get('lanes:backward'))
                if spec.dir:
                    nf, nb = (lanes, 0) if spec.dir > 0 else (0, lanes)
                fallback.append(TollRoad(xy, width, lanes, nf, nb, spec.kmh))
    if not fallback:
        return []
    data = _extract(md, frame, ring)
    enriched = roads_from_osm(data, frame, ring, fallback) if data else []
    # Keep a crossing fallback road if the OSM extract does not describe that corridor (partial/offline data).
    result = list(enriched) if enriched else fallback
    if enriched:
        for road in fallback:
            samples = np.concatenate([np.linspace(a, b, max(3, int(np.linalg.norm(b - a) / 2) + 1))
                                      for a, b in zip(road.xy[:-1], road.xy[1:])])
            samples = samples[contains_points(ring, samples)]
            if len(samples) and any(min(_line_dist(p, [r.xy]) for r in enriched) > 1.5 for p in samples):
                result.append(road)
    for road in result:
        road.xy = road.xy - [x0, y0]
    return result


def toll_match(frame, ring, infra_layers, x0, y0, source):
    """Does explicit toll infrastructure identify this building footprint? Pure."""
    for f in infra_layers:
        if f is None or f.attrs.get('class') is None:
            continue
        for i in np.flatnonzero(np.asarray(f.attrs['class']).astype(str) == 'toll_booth'):
            records = f.attrs.get('src_record')
            if source and records is not None and str(records[i]).split('@')[0] == str(source).split('@')[0]:
                return True
            for part in f.parts(i):
                for raw in part:
                    xy = np.c_[mapgeom.enu_xy(f, frame, raw)] - [x0, y0]
                    if len(xy) and contains_points(ring, xy.mean(0)[None])[0]:
                        return True
    return False


def ground_layout(layout, frame, elev, x0, y0):
    """Sample graded ground once for all rooms, supports, booths and gates, including sloped toll plazas."""
    boxes, lanes, gates, rooms = layout['solid_boxes'], layout['lanes'], layout['gates'], layout['rooms']
    points = [b['at'] for b in boxes] + [p['at'] for p in lanes] + list(gates)
    room_start = len(points)
    points += [p for room in rooms for p in room]
    points += list(layout['ring'])
    xy = np.asarray(points, np.float64)
    la, lo, _ = frame.enu_to_geodetic(xy[:, 0] + x0, xy[:, 1] + y0, 0.)
    heights = np.asarray(elev(la, lo), np.float64)
    up = np.asarray(frame.geodetic_to_enu(la, lo, heights)[2], np.float64)
    if not np.isfinite(up).all():
        return
    layout['roof_ground'] = float(up.max())
    for b, h in zip(boxes, up):
        b['base'] = float(h)
    for p, h in zip(lanes, up[len(boxes):]):
        p['base'] = float(h)
    layout['gate_bases'] = up[len(boxes) + len(lanes):room_start].tolist()
    room_ground = []
    for room in rooms:
        room_ground.append(float(up[room_start:room_start + len(room)].min()))
        room_start += len(room)
    layout['room_ground'] = room_ground
