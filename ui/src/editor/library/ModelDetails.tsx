import type {LibraryModel} from "./ModelLibrary";
import {useEffect, useState} from "react";
import {libraryJson, MODEL_CATEGORIES} from "./library";
import {ModelCost, type TrackCost} from "./ModelCost";
import styles from "./ModelDetails.module.css";

/** Keep publisher credit in the information panel rather than repeating it in every card title. Pure. */
export const modelName = (model: Pick<LibraryModel, "name">) => model.name.replace(/^(Kenney|Quaternius)\s*-\s*/i, "");

function webSource(source?: string) {
  try {
    const url = new URL(source ?? "");
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

/** The selected object's title and retained creator, source and licence; absent credits remain explicit. */
export function ModelDetails({model}: {model: LibraryModel}) {
  const [answer, setAnswer] = useState<{id: string; cost?: TrackCost; error?: string} | null>(null);
  const known = model.geometry?.track_cost;
  const cost = known ?? (answer?.id === model.id ? answer.cost : undefined);
  const error = answer?.id === model.id ? answer.error : undefined;
  useEffect(() => {
    if (known) return;
    const controller = new AbortController();
    void libraryJson<TrackCost>(`/api/library/models/${model.id}/cost`, {signal: controller.signal})
      .then(value => { if (!controller.signal.aborted) setAnswer({id: model.id, cost: value}); })
      .catch((fault: Error) => { if (!controller.signal.aborted) setAnswer({id: model.id, error: fault.message}); });
    return () => controller.abort();
  }, [model.id, known]);
  const source = webSource(model.source_url);
  const creator = model.creator || /^(Kenney|Quaternius)\s*-\s*/i.exec(model.name)?.[1]
    || model.tags?.find(tag => ["Kenney", "Quaternius", "Poly Haven"].includes(tag));
  return <section className={styles.details} aria-label="Object information">
    <strong>{modelName(model)}</strong>
    <span>{MODEL_CATEGORIES.find(([id]) => id === model.category)?.[1] ?? model.category}</span>
    <span>{model.metres_per_unit} m per unit · Collision: {model.collision === "mesh" ? "Model mesh" : "None"}</span>
    {cost ? <ModelCost cost={cost} collision={model.collision} />
      : <span role="status">{error ? `Geometry cost unavailable: ${error}` : "Reading geometry cost…"}</span>}
    <dl className={styles.credits}>
      <dt>Creator</dt><dd>{creator || "Not specified"}</dd>
      <dt>Source</dt><dd>{source ? <a href={source} target="_blank" rel="noopener noreferrer">View source</a> : "Not specified"}</dd>
      <dt>Licence</dt><dd>{model.license || (model.tags?.includes("CC0") ? "CC0" : "Not specified")}</dd>
    </dl>
  </section>;
}
