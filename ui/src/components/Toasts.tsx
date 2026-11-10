import {useSyncExternalStore} from "react";
import styles from "./Toasts.module.css";
import {toasts} from "./toastStore";

export interface Toast {
  id: string;
  tone: "warning" | "error" | "success" | "info";
  title: string;
  message?: string;
  detail?: string;                                      // (a second, quieter line: why it is so)
  action?: {label: string; run: () => void};
  progress?: {value: number | null; label: string};     // (value null: running, how far not known)
  dismissible?: boolean;                                // (false: no ×, it goes when its work ends)
}

const tones = {warning: styles.warning, error: styles.error, success: styles.success, info: styles.info};

/** Reusable notifications above the page, with actions and explicit dismissal; focus stays where the user left it. */
export function Toasts({messages, onDismiss}: {messages: readonly Toast[]; onDismiss: (id: string) => void}) {
  return <div className={styles.stack} aria-label="Notifications">
    {messages.map(toast => <div key={toast.id} id={toast.id} className={`${styles.toast} ${tones[toast.tone]}`}
      role={toast.tone === "warning" || toast.tone === "error" ? "alert" : "status"} aria-atomic="true">
      <span className={styles.icon} aria-hidden="true">{toast.tone === "success" ? "✓" : toast.tone === "info" ? "i" : "!"}</span>
      <div className={styles.content}>
        <strong className={styles.title}>{toast.title}</strong>
        {toast.message && <p className={styles.message}>{toast.message}</p>}
        {toast.detail && <p className={styles.detail}>{toast.detail}</p>}
        {toast.progress && <progress className={styles.bar} aria-label={toast.progress.label} max={1} value={toast.progress.value ?? undefined} />}
        {toast.action && <button className={styles.action} type="button" onClick={toast.action.run}>{toast.action.label}</button>}
      </div>
      {toast.dismissible !== false && <button className={styles.close} type="button" aria-label="Dismiss notification" onClick={() => onDismiss(toast.id)}>×</button>}
    </div>)}
  </div>;
}

/** The page's one stack of toasts, whatever part posted them (toastStore). */
export function ToastHost() {
  const list = useSyncExternalStore(toasts.subscribe, toasts.toasts);
  return <Toasts messages={list.map(t => t.action ? {...t, action: {label: t.action.label, run: () => toasts.run(t.id)}} : t)}
    onDismiss={id => toasts.dismiss(id)} />;
}
