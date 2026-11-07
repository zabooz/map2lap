// Marking a stretch of road in the Editor: a click on the road, A, another, B, and a band follows the road between them (src/app/trackband.py). Further clicks are pins on
// the way: seen, dragged, taken away by a right click. A module of its own: what is done with a marked band is a tool on it, smoothing the first, shown at once. All is
// reckoned on the server, the view only shows it.
import {useEffect, useEffectEvent, useState} from "react";
import {post} from "../api";
import type {HeightChange, TrackEdits} from "./edits";
import {MAX_PINS, withPin, type Pin} from "./pins";
import type {Place, TrackView, WheelKeys} from "./view";

const PREVIEW_AFTER_MS = 60;        // a slider's quick moves go in one request
const WIDTH_STEP = 1, MIN_WIDTH = 3, MAX_WIDTH = 60;       // (trackband: a band's)
const STRENGTH_STEP = 5;

interface Way {
  line?: Place[];
  width?: number;
}

/** The band on the track name. enabled: no other tool has the left button. previewing: Smooth is on, what it would do is shown. revision: the draft's on the server: what is
    shown is reckoned from it, a new one and it is reckoned again. onNote: what to say, null for nothing. */
export function useBand({name, view, edits, enabled, previewing, revision, onNote}: {name: string; view: TrackView; edits: TrackEdits; enabled: boolean; previewing: boolean; revision: number;
                                                                                     onNote: (text: string | null) => void}) {
  const [points, setPoints] = useState<Pin[]>([]);
  const [good, setGood] = useState<Pin[]>([]);                        // (the points of the band shown: back to these when a click fails)
  const [line, setLine] = useState<Place[] | null>(null);
  const [toMouse, setToMouse] = useState<Place[] | null>(null);       // (A set: the band as far as the mouse)
  const [roadWidth, setRoadWidth] = useState(0);
  const [width, setWidth] = useState<number | null>(null);            // (null: the road's own)
  const [strength, setStrength] = useState(50);
  const shownWidth = width ?? roadWidth;
  const url = (what = "") => `/api/editor/${encodeURIComponent(name)}/band${what}`;

  const clear = () => {
    setPoints([]);
    setGood([]);
    setLine(null);
    setToMouse(null);
    setWidth(null);
  };

  useEffect(() => {
    if (points.length < 2 || points === good) return;       // (back to what is shown: nothing to ask, and what it says of the failed click stays)
    let over = false;
    void post<Way>(url("/way"), {base: edits.boundRevision(), points}).then(r => {
      if (over) return;
      if (r.error || !r.line) {
        onNote(r.error ?? "No road found");
        setPoints(p => (good.length ? good : p.slice(0, 1)));      // (back to before that click, whichever it was)
        return;
      }
      setGood(points);
      setLine(r.line);
      setRoadWidth(r.width ?? 0);
      setToMouse(null);
      onNote(null);
    });
    return () => { over = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- (url, good and onNote are made anew each time; the points are what counts)
  }, [points, edits]);

  useEffect(() => {
    if (points.length !== 1 || !enabled) {
      view.setMarking(null);
      return;
    }
    let asking = false, over = false, next: Pin | null = null;      // (one at a time; where the mouse came to meanwhile goes next, even if it stays there)
    const ask = (x: number, z: number) => {
      asking = true;
      void post<Way>(url("/way"), {base: edits.boundRevision(), points: [points[0], [x, z]]}).then(r => {
        asking = false;
        if (over) return;
        setToMouse(r.line ?? null);
        if (next) {
          const [nx, nz] = next;
          next = null;
          ask(nx, nz);
        }
      });
    };
    view.setMarking((x, z) => {
      if (asking) next = [x, z];
      else ask(x, z);
    });
    return () => {
      over = true;
      view.setMarking(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- (as above)
  }, [view, points, enabled, edits]);

  useEffect(() => {
    const single: Place[] | null = points.length ? [[points[0][0], view.heightOfGround(points[0][0], points[0][1]), points[0][1]]] : null;
    view.drawBand(line ?? toMouse ?? single, line || toMouse ? shownWidth || MIN_WIDTH : 0);
    return () => view.drawBand(null, 0);
  }, [view, points, line, toMouse, shownWidth]);

  useEffect(() => {
    view.drawPins(enabled ? points.map(([x, z]) => [x, view.heightOfGround(x, z), z]) : []);
    return () => view.drawPins([]);
  }, [view, points, enabled]);

  /** A pin dragged to x, z: the band goes by it, and back if there is no road that way. */
  const pinMoved = useEffectEvent((k: number, x: number, z: number) => {
    setPoints(points.map((p, n): Pin => (n === k ? [x, z] : p)));
    onNote(null);
  });

  /** A pin taken away: of two, what is left is A again, of one, nothing is left. */
  const pinTaken = useEffectEvent((k: number) => {
    const left = points.filter((_, n) => n !== k);
    setPoints(left);
    if (left.length < 2) {
      setGood([]);
      setLine(null);
      setToMouse(null);
    }
    onNote(null);
  });

  useEffect(() => {
    view.setPinned((k, x, z) => pinMoved(k, x, z), k => pinTaken(k));
    return () => view.setPinned(() => {}, () => {});
  }, [view]);

  useEffect(() => {
    if (!line || !previewing) {
      view.takeBackPreview();
      return;
    }
    let over = false;
    const failed = (why: string) => {
      if (over) return;
      view.takeBackPreview();       // (nothing shown is better than what the fields no longer say)
      onNote(why);
    };
    const timer = setTimeout(() => {
      void fetch(url("/preview"), {method: "POST", headers: {"Content-Type": "application/json"},
                                   body: JSON.stringify({base: edits.boundRevision(), points: good, width: shownWidth, strength: strength / 100})})
        .then(async r => {
          if (over) return;
          if (r.ok) {
            const buf = await r.arrayBuffer();
            if (!over) view.showPreview(buf);
          } else failed(String((await r.json().catch(() => null))?.error ?? r.status));
        }).catch(() => failed("No preview: the server does not answer"));
    }, PREVIEW_AFTER_MS);
    return () => {
      over = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- (as above)
  }, [view, line, previewing, shownWidth, strength, revision, edits]);

  /** The change as it is shown goes into the draft, one undo step; the band is done. It goes from the draft with all before it in it, on the server: an undo on its way
      is to be reckoned with. While the way to a new pin is still asked for, what is shown is not what is marked: not yet. */
  const apply = () => {
    if (!line) return false;
    if (points !== good) {
      onNote("The way is still being found: press Enter again in a moment");
      return true;
    }
    const body = {base: edits.boundRevision(), points: good, width: shownWidth, strength: strength / 100};
    view.keepPreview();
    clear();
    void edits.inTurn(async () => {
      const kept = await edits.saved();
      const r = kept === null ? {error: "the changes before it could not be kept"} : await post<{height: HeightChange; standing: number}>(url(), body);
      if (r.error || !("height" in r) || !r.height || !edits.canEdit()) {
        view.dropPreview();
        return onNote(`Not changed: ${r.error ?? "this track can't be changed now"}`);
      }
      edits.addHeight(r.height);
      onNote(r.standing ? `${r.standing} objects at the edge of it stayed where they are: their places lie outside.` : null);
    });
    return true;
  };

  return {
    points, line, width: shownWidth, strength, clear, apply,
    /** A click on the road: A, B, then a pin on the way that says which way it goes. */
    click: (x: number, z: number) => {
      if (points.length >= MAX_PINS) return onNote(`A band has at most ${MAX_PINS} points`);
      setPoints(withPin(points, line, x, z));
      onNote(null);
    },
    setWidth,
    setStrength,
    /** A notch of the wheel over the view, with those keys held: its numbers as they stand in the bar. */
    wheel: (keys: WheelKeys, by: number) => {
      if (keys === "shift") setStrength(s => Math.min(100, Math.max(0, s + by * STRENGTH_STEP)));
      else if (keys === "ctrl") setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(shownWidth) + by * WIDTH_STEP)));
    },
  };
}
