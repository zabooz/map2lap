import {expect, test} from "bun:test";
import {takesWheel} from "./EditTools";
import {TrackView, type WheelKeys} from "./view";

test("Insert takes Shift, Ctrl and Alt wheel input; leaving placement restores camera input", () => {
  const view = Object.create(TrackView.prototype) as Pick<TrackView, "setToolWheel" | "setWheelTaken"> & {zoomWheel: (el: HTMLElement) => void};
  const target = new EventTarget(), received: [WheelKeys, number][] = [];
  let cameraInputs = 0;
  Object.assign(view, {brush: null, stopRide: () => { cameraInputs++; }});
  view.setToolWheel((keys, by) => received.push([keys, by]));
  view.zoomWheel(target as HTMLElement);
  const wheel = (keys: string, deltaY = -100, deltaX = 0) => {
    const event = new Event("wheel", {cancelable: true});
    Object.assign(event, {shiftKey: keys === "shift", ctrlKey: keys === "ctrl", altKey: keys === "alt", deltaY, deltaX});
    target.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  };
  view.setWheelTaken(takesWheel("model", true, false));
  wheel("shift"); wheel("ctrl"); wheel("alt");
  wheel("shift", 0, 100); // Some browsers report Shift + wheel on the horizontal axis.
  expect(received).toEqual([["shift", 1], ["ctrl", 1], ["alt", 1], ["shift", -1]]);
  expect(cameraInputs).toBe(0);
  wheel("");
  expect(cameraInputs).toBe(1);
  view.setWheelTaken(takesWheel("select", true, false));
  wheel("shift"); wheel("ctrl"); wheel("alt");
  expect(received).toHaveLength(4);
  expect(cameraInputs).toBe(4);
});
