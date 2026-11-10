import styles from "./Toasts.module.css";

export interface Toast {
  id: string;
  tone: "warning" | "error" | "success" | "info";
  title: string;
  message: string;
  action?: {label: string; run: () => void};
}

const tones = {warning: styles.warning, error: styles.error, success: styles.success, info: styles.info};

/** Reusable notifications above the page, with actions and explicit dismissal; focus stays where the user left it. */
export function Toasts({messages, onDismiss}: {messages: readonly Toast[]; onDismiss: (id: string) => void}) {
  return <div className={styles.stack} aria-label="Notifications">
    {messages.map(toast => <div key={toast.id} className={`${styles.toast} ${tones[toast.tone]}`}
      role={toast.tone === "warning" || toast.tone === "error" ? "alert" : "status"} aria-atomic="true">
      <span className={styles.icon} aria-hidden="true">{toast.tone === "success" ? "✓" : toast.tone === "info" ? "i" : "!"}</span>
      <div className={styles.content}>
        <strong className={styles.title}>{toast.title}</strong>
        <p className={styles.message}>{toast.message}</p>
        {toast.action && <button className={styles.action} type="button" onClick={toast.action.run}>{toast.action.label}</button>}
      </div>
      <button className={styles.close} type="button" aria-label="Dismiss notification" onClick={() => onDismiss(toast.id)}>×</button>
    </div>)}
  </div>;
}
