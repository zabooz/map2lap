import {useCallback, useEffect, useRef, useState} from "react";
import {get, post} from "../api";

type Status = "new" | "seen" | "done";
type Entry = {id: number; created_at: string} & (
  {type: "message"; author: "admin" | "sender"; text: string; images: number} | {type: "status"; status: Status}
);
export interface Ticket {id: number; kind: "bug" | "idea"; status: Status; messages: Entry[]}
type History = {reports: Ticket[]; seen: Record<number, number>};
export const statusName: Record<Status, string> = {new: "New", seen: "Seen", done: "Done"};

function newestUpdate(ticket: Ticket) {
  return ticket.messages.reduce((id, entry) =>
    entry.type === "status" || entry.author === "admin" ? Math.max(id, entry.id) : id, 0);
}

export function useFeedback() {
  const [reports, setReports] = useState<Ticket[]>([]);
  const [seen, setSeen] = useState<History["seen"]>({});
  const [error, setError] = useState("");
  const generation = useRef(0);
  const reload = useCallback(async (opened = false) => {
    const request = ++generation.current;
    const result = await get<Partial<History> & {error?: string}>(opened ? "/api/feedback?open=1" : "/api/feedback");
    if (generation.current !== request) return;
    if (!result?.reports) {
      if (opened) setError(result?.error ?? "Could not load your tickets.");
      return;
    }
    setError("");
    setReports(result.reports);
    setSeen(old => {
      const next = {...old};
      for (const [id, value] of Object.entries(result.seen ?? {})) next[+id] = Math.max(next[+id] ?? 0, value);
      return next;
    });
  }, []);
  useEffect(() => {
    const initial = window.setTimeout(reload, 0);
    const timer = window.setInterval(reload, 15 * 60_000);
    return () => { clearTimeout(initial); clearInterval(timer); };
  }, [reload]);
  const read = useCallback(async (ticket: Ticket) => {
    const entry = newestUpdate(ticket);
    if (entry <= (seen[ticket.id] ?? 0)) return;
    const result = await post(`/api/feedback/${ticket.id}/seen`, {entry});
    if (result.error) setError(result.error);
    else setSeen(old => ({...old, [ticket.id]: Math.max(old[ticket.id] ?? 0, entry)}));
  }, [seen]);
  return {reports, error, reload, read, unread: (t: Ticket) => newestUpdate(t) > (seen[t.id] ?? 0)};
}
