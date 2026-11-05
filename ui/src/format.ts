// Numbers and names as the page shows them. Pure.

export function slug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "route";
}

export function fmtTime(seconds: number | null | undefined) {
  const s = Math.max(0, Math.round(seconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function fmtBytes(bytes: number) {
  const mb = bytes / 1e6;
  return mb >= 1000 ? (mb / 1000).toFixed(2) + " GB" : mb.toFixed(0) + " MB";
}

export function fmtDate(unix: number | null) {
  return unix ? new Date(unix * 1000).toLocaleString("en-GB", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}) : "";
}

export function fmtSize(t: {area_m: [number, number] | null; length_m: number}) {
  return t.area_m ? `${(t.area_m[0] / 1000).toFixed(1)} × ${(t.area_m[1] / 1000).toFixed(1)} km`
                  : `${(t.length_m / 1000).toFixed(2)} km`;
}

export const fmtLatLon = (lat: number, lon: number) => `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
export const shortName = (name: string) => name.split(", ").slice(0, 3).join(", ");
