import type {ReactNode} from "react";
import styles from "./HoverBox.module.css";
import type {Hovered} from "../types";

const fixed = (v: number, digits = 2) => Number(v.toFixed(digits)).toFixed(digits);

function Row({label, children}: {label: string; children: ReactNode}) {
  return <><dt>{label}</dt><dd>{children}</dd></>;
}

const NONE = "—";

/** Pointer details inside the inspector, hovered null: nothing under it. Every row stays, a dash where there is nothing to say, so the panel
    keeps its height as the mouse goes over trees, ground and sky. A single object has an id if it can be told apart: the track file holds
    meshes merged per tile, by material. */
export function HoverBox({hovered: h, id = "hover-box"}: {hovered: Hovered | null; id?: string}) {
  const b = h?.billboard;
  const or = (value: ReactNode | null | undefined | false) => value === null || value === undefined || value === false ? NONE : value;
  return (
    <div id={id} className={styles.box} data-empty={h ? undefined : ""}>
      <h4>{h ? <>{h.kind}{h.sprite && ` · ${h.sprite}`}</> : NONE}</h4>
      <dl>
        <Row label="ID">{or(h?.id)}</Row>
        <Row label="Type">{or(h?.sort)}</Row>
        <Row label="Height">{or(b?.height != null && `${fixed(b.height, 1)} m`)}</Row>
        <Row label="Width">{or(b?.width != null && `${fixed(b.width, 1)} m`)}</Row>
        <Row label="Stands at">{or(b?.foot && `${fixed(b.foot[0], 1)}, ${fixed(b.foot[1], 1)}`)}</Row>
        <Row label="Mesh">{or(h?.object)}</Row>
        <Row label="Physics">{or(h?.physics)}</Row>
        <Row label="Material">{or(h?.material)}</Row>
        <Row label="Shader">{or(h?.shader)}</Row>
        <Row label="Texture">{or(h && <>{h.texture ?? "none"}{h.textureBytes !== null && ` (${Math.ceil(h.textureBytes / 1024)} KB)`}</>)}</Row>
        <Row label="Size">{or(h && `${h.vertices} vertices, ${h.triangles} triangles`)}</Row>
        <Row label="Triangle">{or(h?.triangle)}</Row>
        <Row label="UV">{or(h?.uv && `${fixed(h.uv[0], 3)}, ${fixed(h.uv[1], 3)}`)}</Row>
        <Row label="Shown up to">{or(h && `${Math.round(h.shownTo)} m`)}</Row>
      </dl>
      <h4>Position</h4>
      <dl>
        <Row label="AC x, y, z">{or(h && `${fixed(h.at[0])}, ${fixed(h.at[1])}, ${fixed(h.at[2])}`)}</Row>
        <Row label="Tile">{or(h && `${h.tile[0]}, ${h.tile[1]}`)}</Row>
        <Row label="Route">{or(h?.route && `${Math.round(h.route.metre)} m, ${fixed(h.route.off, 1)} m off`)}</Row>
        <Row label="Lat, lon">{or(h?.latLon && `${fixed(h.latLon[0], 6)}, ${fixed(h.latLon[1], 6)}`)}</Row>
        <Row label="Camera">{or(h && `${fixed(h.distance, 1)} m away`)}</Row>
      </dl>
    </div>
  );
}
