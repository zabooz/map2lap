// The round brush on the ground, for a tool that works with one: its ring, how far it reaches, how soft its edge is, its strokes as a click or held and moved. What a stroke does
// is the tool's: Elevation the first. The server makes a stroke into a height change, the view only shows it.
import {useEffect, useEffectEvent, useState} from "react";
import {post} from "../api";
import type {HeightChange, TrackEdits} from "./edits";
import type {Sample, TrackView} from "./view";

export const MIN_RADIUS = 2, MAX_RADIUS = 500, RADIUS_STEP = 0.5;       // (trackheights: a brush's)
export const MIN_SOFT = 10, MAX_SOFT = 100;         // (% of the radius)
const FIRST_RADIUS = 5, FIRST_SOFT = 25;            // (m, %)
const WHEEL_SHARE = 0.1;            // a notch of the wheel changes a brush's number by this share, at least a step: the same feel at 5 m and at 200 m

/** value a notch of the wheel up or down (by: 1 or -1), in whole steps, within those limits. Pure. */
export const stepped = (value: number, by: number, step: number, least: number, most: number) =>
  Math.min(most, Math.max(least, Math.round((value + by * Math.max(step, value * WHEEL_SHARE)) / step) * step));

const standingText = (n: number) => `${n} ${n === 1 ? "object stands" : "objects stand"} at the edge of it and stayed where ${n === 1 ? "it is" : "they are"}: its place lies outside.`;

/** The brush of a tool. url: where the server makes this tool's strokes into a height change, url/preview what one under way changes. enabled: the tool is on. colour, turnedColour:
    of the ring, as it is and with Shift held. body: what else a stroke goes by, turned: Shift was held when it began. onNote: what to say, null for nothing. */
export function useBrush({view, edits, url, enabled, colour, turnedColour, body, onNote}: {
  view: TrackView;
  edits: TrackEdits;
  url: string;
  enabled: boolean;
  colour: string;
  turnedColour: string;
  body: (turned: boolean) => object;
  onNote: (text: string | null) => void;
}) {
  const [radius, setRadius] = useState(FIRST_RADIUS);
  const [soft, setSoft] = useState(FIRST_SOFT);

  useEffect(() => { view.setBrush(enabled ? {radius, colour, turnedColour} : null); }, [view, enabled, radius, colour, turnedColour]);

  useEffect(() => () => view.setBrush(null), [view]);

  /** What the server makes a stroke of goes by these, with where the ring was and for how long. */
  const strokeBody = (samples: Sample[], turned: boolean) => ({samples, base: edits.boundRevision(), radius, soft: soft / 100, ...body(turned)});

  /** A stroke made, as the server makes it into a height change with all of it looked at, loaded in the view or not. */
  const stroked = useEffectEvent((samples: Sample[], turned: boolean) => {
    const sent = strokeBody(samples, turned);
    void edits.inTurn(async () => {
      const r = await post<{height: HeightChange; standing: number}>(url, sent);
      const failed = r.error || !r.height ? r.error ?? "no answer" : edits.canEdit() ? null : "this track can't be changed now";
      if (failed) {
        view.dropPreview();
        return onNote(`Not changed: ${failed}`);
      }
      edits.addHeight(r.height!);
      onNote(r.standing ? standingText(r.standing) : null);
    });
  });

  /** A stroke under way, as far as it has come: what it changes, or why it can't be; null: no answer this time. */
  const askPreview = useEffectEvent(async (samples: Sample[], turned: boolean) => {
    const r = await fetch(`${url}/preview`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(strokeBody(samples, turned))}).catch(() => null);
    if (!r) return null;
    if (r.ok) return r.arrayBuffer().catch(() => null);
    return String((await r.json().catch(() => null))?.error ?? r.status);
  });

  const refused = useEffectEvent((why: string) => onNote(`Not changed: ${why}`));

  useEffect(() => {
    view.setStroke((samples, turned) => stroked(samples, turned), (samples, turned) => askPreview(samples, turned), why => refused(why));
    return () => view.setStroke(() => {}, () => Promise.resolve(null), () => {});
  }, [view]);

  return {radius, soft, setRadius, setSoft};
}
