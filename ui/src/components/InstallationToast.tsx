import {useState} from "react";
import {useToasts} from "./toastStore";
import type {InstallationNotice, InstallationTarget} from "./installationNotice";

/** One installation issue per folder and session; polling does not bring a dismissed warning back. Shown by the page's ToastHost. */
export function InstallationToast({notice, hidden, onOpen}: {notice: InstallationNotice; hidden: boolean; onOpen: (target: InstallationTarget) => void}) {
  const [dismissed, setDismissed] = useState(false);
  useToasts(dismissed || hidden ? [] : [{id: notice.id, tone: "warning", title: notice.title, message: notice.message,
    action: {label: notice.action, run: () => { setDismissed(true); onOpen(notice.target); }}, onDismiss: () => setDismissed(true)}]);
  return null;
}
