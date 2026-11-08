// Camera: along the track's route, by the wheel or riding by itself, to look it over and find what to correct; back to the first view. The view moves it, here is only what it goes by.
import {useEffect, useState} from "react";
import {thenView, ToolAction, ToolNumber, ToolOptions, ToolValue} from "./ToolOptions";
import {stepped} from "./useBrush";
import type {TrackView, WheelKeys} from "./view";

const FIRST_SPEED = 50, MIN_SPEED = 10, MAX_SPEED = 300, SPEED_STEP = 10;       // (km/h: from a close look to a fast look over a long track)
const FIRST_HEIGHT = 3, MIN_HEIGHT = 1.5, MAX_HEIGHT = 100, HEIGHT_STEP = 0.5;  // (m above the ground: from a driver's eye, view.ts's nearest, to over the trees)
const NOTCH_M = 20;                 // a notch of the wheel along the route: a car's few lengths, a bend's part
const KMH_TO_M_S = 1 / 3.6;
const NO_ROUTE = "This track has no route to go along";

/** Camera on view. enabled: the tool is on. onNote: what to say, null for nothing. */
export function useCamera({view, enabled, onNote}: {view: TrackView; enabled: boolean; onNote: (text: string | null) => void}) {
  const [moving, setMoving] = useState(false);
  const [metre, setMetre] = useState<number | null>(null);
  const [speed, setSpeed] = useState(FIRST_SPEED);
  const [height, setHeight] = useState(FIRST_HEIGHT);

  useEffect(() => { view.setRide(speed * KMH_TO_M_S, height); }, [view, speed, height]);

  useEffect(() => {
    view.setRideWatch(setMoving, setMetre);
    return () => {
      view.stopRide();
      view.setRideWatch(() => {}, () => {});
    };
  }, [view]);

  useEffect(() => {
    if (enabled) view.tellRideMetre();
    else view.stopRide();
  }, [view, enabled]);

  return {
    moving, metre, speed, height, setSpeed, setHeight,
    toggle: () => onNote(view.toggleRide() ? null : NO_ROUTE),
    /** A notch of the wheel over the view, with those keys held: its options as they stand in the bar. */
    wheel: (keys: WheelKeys, by: number) => {
      if (keys === "shift") onNote(view.rideBy(by * NOTCH_M) ? null : NO_ROUTE);
      else if (keys === "ctrl") setHeight(h => stepped(h, by, HEIGHT_STEP, MIN_HEIGHT, MAX_HEIGHT));
      else if (keys === "alt") setSpeed(s => stepped(s, by, SPEED_STEP, MIN_SPEED, MAX_SPEED));
    },
  };
}

/** What it can be set to. */
export function CameraOptions({camera, view}: {camera: ReturnType<typeof useCamera>; view: TrackView}) {
  return (
    <ToolOptions id="edit-camera-set" title="Road camera" note="Shift + wheel goes along the track from the place nearest the camera. W A S D or the mouse leave it, Esc ends it."
                 options={[
                   <ToolValue label="Along the track" hint="How far along the track it is (Shift + wheel: forwards, backwards)" value={camera.metre === null ? "no route" : `${Math.round(camera.metre)} m`} />,
                   <ToolNumber label="Height" unit="m" hint="How far above the ground it goes along the track (Ctrl + wheel)" min={MIN_HEIGHT} max={MAX_HEIGHT} step={HEIGHT_STEP} value={camera.height}
                               onChange={height => camera.setHeight(Math.max(MIN_HEIGHT, height))} />,
                   <ToolNumber label="Speed" unit="km/h" hint="How fast Ride goes (Alt + wheel)" min={MIN_SPEED} max={MAX_SPEED} step={SPEED_STEP} value={camera.speed}
                               onChange={speed => camera.setSpeed(Math.max(MIN_SPEED, speed))} />,
                 ]}
                 actions={(
                   <>
                     <ToolAction id="edit-ride" label={camera.moving ? "Pause" : "Ride"} hint="It rides along the track by itself from where it is" onClick={thenView(view, camera.toggle)} />
                     <ToolAction id="edit-home" label="Reset" hint="Back to the first view, behind the start (Home)" onClick={thenView(view, () => view.home())} />
                   </>
                 )} />
  );
}
