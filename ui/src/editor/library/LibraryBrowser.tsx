import {Fragment, type ButtonHTMLAttributes, type ReactNode} from "react";
import styles from "./LibraryBrowser.module.css";

/** The common library layout: heading, filters, asset grid, preview and reserved actions. */
export function LibraryBrowser({title, titleId, subtitle, onImport, disabled, filters, browser, preview, pages, notices, footer, onFiles, importLabel = "Import…"}: {
  title: string; titleId?: string; subtitle: string; onImport: () => void; disabled: boolean;
  filters: ReactNode; browser: ReactNode; preview: ReactNode; pages?: ReactNode; notices?: ReactNode; footer: ReactNode;
  onFiles: (files: FileList) => void;
  importLabel?: string;
}) {
  return <div className={styles.shell}>
    <div className={styles.heading}><div><h2 id={titleId}>{title}</h2><p>{subtitle}</p></div>
      <button type="button" onClick={onImport} disabled={disabled}>{importLabel}</button></div>
    <div className={styles.filters}>{filters}</div>
    <div className={styles.content}>
      <div className={styles.column}>
        <div className={styles.browser} data-library-browser="" onDragOver={e => e.preventDefault()} onDrop={e => {
          e.preventDefault(); if (!disabled) onFiles(e.dataTransfer.files);
        }}>{browser}</div>
        {pages}
      </div>
      <div className={styles.preview}>{preview}</div>
    </div>
    {notices}
    <div className={styles.footer}>{footer}</div>
  </div>;
}

/** A responsive grid of library assets. */
export function LibraryCards({children}: {children: ReactNode}) {
  return <div className={styles.cards}>{children}</div>;
}

/** One asset, with its name and selected state; only the selected model needs a live 3D preview. */
export function LibraryCard({label, selected, thumbnail, disabled, onClick}: {
  label: string; selected: boolean; thumbnail: ReactNode; disabled: boolean; onClick: () => void;
}) {
  return <button type="button" className={styles.card} aria-label={label} aria-pressed={selected} disabled={disabled} onClick={onClick}>
    {thumbnail}<span>{label}</span>
  </button>;
}

/** The selected asset's larger preview and properties. */
export function LibrarySelection({children}: {children: ReactNode}) {
  return <div className={styles.selected}>{children}</div>;
}

/** The selected asset's facts beside their names, the same for textures and objects: Source, Licence, … rows: [name, value]. */
export function LibraryFacts({rows}: {rows: [string, ReactNode][]}) {
  return <dl className={styles.facts}>{rows.map(([name, value]) => <Fragment key={name}><dt>{name}</dt><dd>{value}</dd></Fragment>)}</dl>;
}

/** A web address to link to, http or https only, or null. Pure. */
export function webSource(source?: string) {
  try {
    const url = new URL(source ?? "");
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

/** The common library's primary action. */
export function LibraryPrimary(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} className={styles.primary} />;
}

/** Paging has the same size, position and labels for both asset types. */
export function LibraryPages({page, offset, total, limit, onPage}: {
  page: number; offset: number; total: number; limit: number; onPage: (page: number) => void;
}) {
  if (total <= limit) return null;
  return <div className={styles.pages}>
    <button type="button" disabled={!page} onClick={() => onPage(page - 1)}>Previous</button>
    <span>{offset + 1}–{Math.min(total, offset + limit)} of {total}</span>
    <button type="button" disabled={offset + limit >= total} onClick={() => onPage(page + 1)}>Next</button>
  </div>;
}

/** Feedback stays in the library's reserved content flow. */
export function LibraryNotice({children, error = false}: {children: ReactNode; error?: boolean}) {
  return <p role={error ? "alert" : "status"} className={error ? styles.error : styles.note}>{children}</p>;
}
