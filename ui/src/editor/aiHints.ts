import type {ScalarHint} from "./state/edits";

export type HintKind = "danger" | ScalarHint;
export const HINT_COLOURS: Record<HintKind, string> = {
  danger: "#ffc843", corner: "#32dcb4", braking: "#ff794e", speedLimit: "#79aaff",
};

/** Steps used by both the tool bar and wheel gestures. Pure. */
export function hintSteps(kind: ScalarHint) {
  return kind === "speedLimit" ? {shift:1, ctrl:10, unit:" km/h"} : {shift:.01, ctrl:.1, unit:""};
}
