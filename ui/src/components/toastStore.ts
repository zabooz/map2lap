import {useEffect, useRef} from "react";
import type {Toast} from "./Toasts";

/** A toast and what its × does. */
export interface Posted extends Toast { onDismiss?: () => void; duration?: number }
export const BRIEF_TOAST_MS = 5000;

const same = (a: Posted, b: Posted) => a.tone === b.tone && a.title === b.title && a.message === b.message && a.detail === b.detail
  && a.action?.label === b.action?.label && a.progress?.value === b.progress?.value && a.progress?.label === b.progress?.label
  && a.dismissible === b.dismissible && a.duration === b.duration;

/** The page's one list of toasts: each part posts its own by id, one stack at the top centre (ToastHost) shows them all. */
export class ToastStore {
  private list: Posted[] = [];
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private dismissed = new Set<() => void>();
  onDismissed(listener: () => void) {
    this.dismissed.add(listener);
    return () => { this.dismissed.delete(listener); };
  }
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  toasts = () => this.list;

  /** Show toast, or change it in place. The same text again only swaps its callbacks: nothing renders anew. */
  post(toast: Posted) {
    const k = this.list.findIndex(t => t.id === toast.id);
    if (k >= 0 && same(this.list[k], toast)) { this.list[k] = toast; return; }
    clearTimeout(this.timers.get(toast.id));
    this.timers.delete(toast.id);
    if (toast.duration) this.timers.set(toast.id, setTimeout(() => {
      this.list.find(t => t.id === toast.id)?.onDismiss?.();
      this.remove(toast.id);
    }, toast.duration));
    this.list = k >= 0 ? this.list.map((t, i) => i === k ? toast : t) : [...this.list, toast];
    this.emit();
  }

  remove(id: string) {
    if (!this.list.some(t => t.id === id)) return;
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this.list = this.list.filter(t => t.id !== id);
    this.emit();
  }

  /** The action and × of the toast as last posted. */
  run(id: string) { this.list.find(t => t.id === id)?.action?.run(); }
  dismiss(id: string) { this.list.find(t => t.id === id)?.onDismiss?.(); this.dismissed.forEach(listener => listener()); }

  private emit() { for (const listener of this.listeners) listener(); }
}

export const toasts = new ToastStore();

/** Show list while this component is mounted; a toast left out of the next list goes. Posted after each render, so actions
    always run the newest callbacks. */
export function useToasts(list: readonly Posted[]) {
  const shown = useRef(new Set<string>());
  useEffect(() => {
    const now = new Set(list.map(t => t.id));
    for (const id of shown.current) if (!now.has(id)) toasts.remove(id);
    for (const toast of list) toasts.post(toast);
    shown.current = now;
  });
  useEffect(() => {
    const mine = shown;
    return () => { for (const id of mine.current) toasts.remove(id); };
  }, []);
}
