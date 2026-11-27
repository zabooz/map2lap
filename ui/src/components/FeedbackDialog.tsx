import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {post} from "../api";
import {statusName, type Ticket, type useFeedback} from "../hooks/useFeedback";
import {ToastHost} from "./Toasts";
import {BRIEF_TOAST_MS, toasts} from "./toastStore";
import {BugIcon} from "./icons";
import styles from "./FeedbackDialog.module.css";

const SENT = "feedback-sent";
const MB = 1024 ** 2;
const TYPES = ["image/png", "image/jpeg", "image/webp"];
const EMPTY = {message: "", kind: "bug", code: "", files: [] as File[], error: "", codeError: "", sending: false};
type Draft = typeof EMPTY;
type Change = (patch: Partial<Draft>) => void;

function imageError(files: File[]) {
  if (files.length > 5) return "Choose up to 5 images.";
  if (files.some(f => !TYPES.includes(f.type))) return "Choose PNG, JPEG or WebP images.";
  if (files.some(f => f.size > 8 * MB)) return "Each image must be 8 MB or smaller.";
  if (files.reduce((bytes, f) => bytes + f.size, 0) > 24 * MB) return "Images must fit within 24 MB together.";
  return "";
}

function encoded(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.readAsDataURL(file);
  });
}

function Preview({file, remove}: {file: File; remove: () => void}) {
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    image.current!.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <div className={styles.preview}><img ref={image} alt={file.name} />
    <button type="button" aria-label={`Remove ${file.name}`} onClick={remove}>×</button></div>;
}

function Composer({draft, reply, change, add, send}: {
  draft: Draft; reply?: boolean; change: Change; add: (files: FileList) => void; send: () => void;
}) {
  const picker = useRef<HTMLInputElement>(null);
  return <form data-testid={reply ? "reply" : "new-report"} onSubmit={e => { e.preventDefault(); send(); }}>
    <fieldset disabled={draft.sending} className={styles.fields}>
      {!reply && <>
        <label>Type<select value={draft.kind} onChange={e => change({kind: e.target.value})}>
          <option value="bug">Bug</option><option value="idea">Feedback &amp; ideas</option></select></label>
        <label><span>Track code <small>Optional</small></span><input type="text" spellCheck={false} value={draft.code}
          aria-label="Track code" aria-invalid={!!draft.codeError} aria-describedby={draft.codeError ? "feedback-code-error" : undefined}
          onChange={e => change({code: e.target.value, codeError: ""})} /></label>
        {draft.codeError && <p id="feedback-code-error" role="alert" className={styles.error}>{draft.codeError}</p>}
      </>}
      <label>{!reply && "Description"}<textarea rows={reply ? 2 : 5} aria-label={reply ? "Reply" : undefined}
        placeholder={reply ? "Write a reply…" : undefined} required maxLength={5000} value={draft.message}
        onChange={e => change({message: e.target.value})} /></label>
      <div className={styles.images}>
        <input ref={picker} type="file" hidden multiple accept={TYPES.join(",")} data-testid="image-files"
          onChange={e => { if (e.target.files) add(e.target.files); e.target.value = ""; }} />
        <button type="button" className={styles.attach} onClick={() => picker.current?.click()}>Add images</button>
        <span>Drop or paste up to 5 images</span>
        {draft.files.length > 0 && <div className={styles.previews}>{draft.files.map((file, i) =>
          <Preview key={i} file={file} remove={() => change({files: draft.files.filter((_, index) => index !== i), error: ""})} />)}</div>}
      </div>
      {draft.error && <p role="alert" className={styles.error}>{draft.error}</p>}
      <button className={styles.send} data-testid="send" disabled={!draft.message.trim() || draft.sending}>
        {draft.sending ? "Sending…" : reply ? "Send reply" : "Send ticket"}</button>
    </fieldset>
  </form>;
}

function History({ticket}: {ticket: Ticket}) {
  const list = useRef<HTMLOListElement>(null);
  const atEnd = useRef(true);
  const latest = ticket.messages.at(-1);
  const ownMessage = latest?.type === "message" && latest.author === "sender";
  useLayoutEffect(() => {
    const el = list.current!;
    if (atEnd.current || ownMessage) el.scrollTop = el.scrollHeight;
  }, [latest?.id, ownMessage]);
  return <ol ref={list} className={styles.history} data-testid="history"
    onScroll={e => { const el = e.currentTarget; atEnd.current = el.scrollHeight - el.scrollTop - el.clientHeight < 2; }}>{ticket.messages.map(entry => {
    const date = new Date(entry.created_at);
    return <li key={entry.id} data-event={entry.type === "status" ? "status" : entry.author}>
      <div className={styles.byline}><strong>{entry.type === "status" ? `Status changed to ${statusName[entry.status]}`
        : entry.author === "admin" ? "Developer" : "You"}</strong>
        <time dateTime={entry.created_at}>{date.toLocaleString("en", {month: "short", day: "numeric", hour: "numeric", minute: "2-digit"})}</time></div>
      {entry.type === "message" && <><p>{entry.text}</p>{entry.images > 0 && <small>{entry.images} {entry.images === 1 ? "image" : "images"}</small>}</>}
    </li>;
  })}</ol>;
}

export function FeedbackDialog({feedback, close}: {feedback: ReturnType<typeof useFeedback>; close: () => void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, select] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const pressedBackdrop = useRef(false);
  const pending = useRef(new Set<number>());
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);
  const change = (id: number, patch: Partial<Draft>) => setDrafts(old => ({...old, [id]: {...(old[id] ?? EMPTY), ...patch}}));
  const add = (id: number, incoming: FileList) => {
    const added = Array.from(incoming);
    setDrafts(old => {
      const draft = old[id] ?? EMPTY;
      if (draft.sending) return old;
      const files = [...draft.files, ...added], error = imageError(files);
      return {...old, [id]: {...draft, files: error ? draft.files : files, error}};
    });
  };
  const send = async (id: number) => {
    const draft = drafts[id];
    if (!draft?.message.trim() || pending.current.has(id)) return;
    pending.current.add(id);
    change(id, {sending: true, error: "", codeError: ""});
    try {
      const images = await Promise.all(draft.files.map(encoded));
      const answer = await post<{id: number; field: string}>(id ? `/api/feedback/${id}/messages` : "/api/feedback",
        {message: draft.message, images, ...(!id && {kind: draft.kind, track_code: draft.code})});
      if (answer.error) change(id, answer.field === "track_code" ? {codeError: answer.error} : {error: answer.error});
      else {
        change(id, {...EMPTY, sending: true});
        toasts.remove(SENT);
        toasts.post({id: SENT, tone: "success", title: id ? "Reply sent." : `Ticket #${answer.id} sent.`,
          duration: BRIEF_TOAST_MS, dismissible: false});
        await feedback.reload(true);
      }
    } catch {
      change(id, {error: "Could not read the selected images."});
    } finally {
      pending.current.delete(id);
      change(id, {sending: false});
    }
  };
  const composer = (id: number) => <Composer draft={drafts[id] ?? EMPTY} reply={!!id} change={patch => change(id, patch)}
    add={files => add(id, files)} send={() => void send(id)} />;
  const active = feedback.reports.find(ticket => ticket.id === selected);
  const {read} = feedback;
  useEffect(() => {
    if (active) void read(active);
  }, [active, read]);
  return <dialog ref={dialog} aria-labelledby="feedback-title" className={styles.dialog}
    onCancel={e => { e.preventDefault(); close(); }}
    onPointerDown={e => { pressedBackdrop.current = e.target === e.currentTarget; }}
    onClick={e => { if (pressedBackdrop.current && e.target === e.currentTarget) close(); }}
    onPaste={e => { if (e.clipboardData.files.length) { e.preventDefault(); add(active?.id ?? 0, e.clipboardData.files); } }}
    onDragOver={e => { if (e.dataTransfer.types.includes("Files")) e.preventDefault(); }}
    onDrop={e => { if (e.dataTransfer.files.length) { e.preventDefault(); add(active?.id ?? 0, e.dataTransfer.files); } }}>
    <ToastHost only={SENT} />
    <header className={styles.header}><BugIcon /><h2 id="feedback-title">Bug reports &amp; feedback</h2>
      <button aria-label="Close feedback" className={styles.close} onClick={close}>×</button></header>
    <div className={styles.columns}>
      <nav className={styles.tickets} aria-label="Ticket navigation">
        <button className={styles.create} data-testid="feedback-new" aria-current={!active ? "page" : undefined}
          onClick={() => select(null)}><span aria-hidden="true">+</span>New ticket</button>
        <h3>Your tickets</h3>
        {feedback.error && <p role="status" className={styles.error}>{feedback.error}</p>}
        {!feedback.error && !feedback.reports.length && <p className={styles.empty}>No tickets yet.</p>}
        <div className={styles.ticketList}>
          {feedback.reports.map(ticket => <button key={ticket.id} className={styles.summary} data-testid={`ticket-${ticket.id}`}
            aria-current={active?.id === ticket.id ? "page" : undefined}
            onClick={() => select(ticket.id)}>
            <span className={styles.meta}>#{ticket.id} · {ticket.kind === "bug" ? "Bug" : "Feedback & ideas"}
              {feedback.unread(ticket) && <b aria-label="Unread update">!</b>}</span>
            <span className={styles.status} data-status={ticket.status}>{statusName[ticket.status]}</span>
            <span className={styles.subject}>{ticket.messages.find(m => m.type === "message")?.text}</span>
          </button>)}
        </div>
      </nav>
      {active ? <section className={styles.thread} aria-labelledby="feedback-heading">
        <header className={styles.threadHead}><h3 id="feedback-heading">Ticket #{active.id}</h3>
          <span className={styles.status} data-status={active.status}>{statusName[active.status]}</span></header>
        <History key={active.id} ticket={active} />
        <div className={styles.replyBox}>{composer(active.id)}</div>
      </section> : <section className={styles.newTicket} aria-labelledby="feedback-heading">
        <h3 id="feedback-heading">New ticket</h3>{composer(0)}
      </section>}
    </div>
  </dialog>;
}
