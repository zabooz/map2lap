import {useRef, useState, type RefObject} from "react";
import {createPortal} from "react-dom";
import {post} from "../api";
import type {Place} from "../types";
import styles from "./SearchField.module.css";

interface Results {
  places: Place[];
  note: string | null;
}

/** The results under the field, fixed on the page (a scrolling list of fields would clip them). */
function Drop({field, results, on, onPick}: {field: RefObject<HTMLInputElement | null>; results: Results; on: number;
                                             onPick: (p: Place) => void}) {
  const r = field.current?.getBoundingClientRect();
  if (!r) return null;
  return createPortal(
    <div className={styles.drop} data-testid="search-drop" style={{left: r.left, top: r.bottom + 4, width: r.width}}>
      {results.note ? <p>{results.note}</p> : results.places.map((p, k) => (
        // (mousedown: before the field's blur closes the list)
        <button key={`${p.lat},${p.lon},${k}`} className={k === on ? styles.on : ""}
                onMouseDown={e => { e.preventDefault(); onPick(p); }}>{p.name}</button>
      ))}
    </div>, document.body);
}

/** A field searching places: typed, Enter asks the server (Nominatim), arrows and Enter pick one of several.
    value: what it shows while not typed in. */
export function SearchField({value, placeholder, onPick, onLeaveEmpty, autoFocus = false, ariaLabel}: {
  value: string;
  placeholder: string;
  onPick: (p: Place) => void;
  onLeaveEmpty?: () => void;
  autoFocus?: boolean;
  ariaLabel?: string;
}) {
  const field = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState<string | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [on, setOn] = useState(0);
  const asked = useRef(0);

  const close = () => { asked.current++; setResults(null); };
  const pick = (p: Place | undefined) => {
    close();
    setTyped(null);
    if (p) onPick(p);
  };

  const search = async (q: string) => {
    const k = ++asked.current;
    setResults({places: [], note: "Searching …"});
    const r = await post<{places: Place[]}>("/api/search", {q});
    if (k !== asked.current) return;
    const places = r.places ?? [];
    setOn(0);
    if (r.error) setResults({places: [], note: `Search failed: ${r.error}`});
    else if (!places.length) setResults({places: [], note: "Nothing found"});
    else if (places.length === 1) pick(places[0]);
    else setResults({places, note: null});
  };

  const found = results?.places ?? [];
  return (
    <>
      <input ref={field} type="text" spellCheck={false} autoComplete="off" placeholder={placeholder} aria-label={ariaLabel}
             autoFocus={autoFocus} value={typed ?? value}
             onChange={e => { setTyped(e.target.value); close(); }}
             onBlur={e => {
               close();
               setTyped(null);
               if (!e.target.value.trim()) onLeaveEmpty?.();
             }}
             onKeyDown={e => {
               if (e.key === "Escape") close();
               else if (found.length && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                 e.preventDefault();
                 setOn(k => (k + (e.key === "ArrowDown" ? 1 : found.length - 1)) % found.length);
               } else if (e.key === "Enter") {
                 if (found.length) pick(found[on]);
                 else if (e.currentTarget.value.trim()) void search(e.currentTarget.value.trim());
               }
             }} />
      {results && <Drop field={field} results={results} on={on} onPick={pick} />}
    </>
  );
}
