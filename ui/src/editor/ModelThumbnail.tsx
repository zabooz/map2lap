import {useEffect, useRef, useState} from "react";
import {modelThumbnails} from "./modelThumbnails";
import styles from "./ModelThumbnail.module.css";

/** Cards and the larger static preview share one cached picture and one model download. */
export function ModelThumbnail({id, name, enabled, preview = false}: {id: string; name: string; enabled: boolean; preview?: boolean}) {
  const host = useRef<HTMLDivElement>(null), objectUrl = useRef<string | null>(null);
  const [picture, setPicture] = useState<{id: string; url: string} | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController(), element = host.current!;
    let requested = false;
    const request = () => {
      if (requested) return;
      requested = true;
      void modelThumbnails.get(id, controller.signal, preview).then(blob => {
        if (controller.signal.aborted) return;
        const url = URL.createObjectURL(blob);
        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        objectUrl.current = url; setPicture({id, url}); setFailed(null);
      }).catch(() => { if (!controller.signal.aborted) setFailed(id); });
    };
    if (preview) { request(); return () => controller.abort(); }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { request(); observer.disconnect(); }
    }, {root: element.closest("[data-library-browser]"), rootMargin: "100px"});
    observer.observe(element);
    return () => { observer.disconnect(); controller.abort(); };
  }, [id, enabled, preview]);
  return <div className={preview ? styles.preview : styles.frame} ref={host} aria-label={preview ? "Model preview" : undefined}>
    {picture?.id === id ? <img className={styles.image} src={picture.url} alt={name} />
      : <span className={styles.placeholder} aria-label={failed === id ? "Preview unavailable" : "Loading preview"}>
        {failed === id ? "Preview unavailable" : "…"}
      </span>}
  </div>;
}
