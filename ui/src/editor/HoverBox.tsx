import type {ReactNode} from "react";
import styles from "./HoverBox.module.css";
import type {Hovered} from "./view";

const fixed = (v: number, digits = 2) => Number(v.toFixed(digits)).toFixed(digits);

function Row({label, children}: {label: string; children: ReactNode}) {
  return <><dt>{label}</dt><dd>{children}</dd></>;
}

/** Pointer details inside the inspector. A single object has an id if it can be told apart: the
    track file holds meshes merged per tile, by material. */
export function HoverBox({hovered: h, id = "hover-box"}: {hovered: Hovered | null; id?: string}) {
  if (!h) return null;
  const b = h.billboard;
  return (
    <div id={id} className={styles.box}>
      <h4>{h.kind}{h.sprite && ` · ${h.sprite}`}</h4>
      <dl>
        {h.id && <Row label="ID">{h.id}</Row>}
        {h.sort && <Row label="Type">{h.sort}</Row>}
        {b?.height != null && <Row label="Height">{fixed(b.height, 1)} m</Row>}
        {b?.width != null && <Row label="Width">{fixed(b.width, 1)} m</Row>}
        {b?.foot && <Row label="Stands at">{fixed(b.foot[0], 1)}, {fixed(b.foot[1], 1)}</Row>}
        <Row label="Mesh">{h.object}</Row>
        <Row label="Physics">{h.physics}</Row>
        <Row label="Material">{h.material}</Row>
        <Row label="Shader">{h.shader}</Row>
        <Row label="Texture">{h.texture ?? "none"}{h.textureBytes !== null && ` (${Math.ceil(h.textureBytes / 1024)} KB)`}</Row>
        <Row label="Size">{h.vertices} vertices, {h.triangles} triangles</Row>
        <Row label="Triangle">{h.triangle}</Row>
        {h.uv && <Row label="UV">{fixed(h.uv[0], 3)}, {fixed(h.uv[1], 3)}</Row>}
        <Row label="Shown up to">{Math.round(h.shownTo)} m</Row>
      </dl>
      <h4>Position</h4>
      <dl>
        <Row label="AC x, y, z">{fixed(h.at[0])}, {fixed(h.at[1])}, {fixed(h.at[2])}</Row>
        <Row label="Tile">{h.tile[0]}, {h.tile[1]}</Row>
        {h.route && <Row label="Route">{Math.round(h.route.metre)} m, {fixed(h.route.off, 1)} m off</Row>}
        {h.latLon && <Row label="Lat, lon">{fixed(h.latLon[0], 6)}, {fixed(h.latLon[1], 6)}</Row>}
        <Row label="Camera">{fixed(h.distance, 1)} m away</Row>
      </dl>
      {!h.id && <p>This object has no ID of its own yet: the track file merges it with others per tile.</p>}
    </div>
  );
}
