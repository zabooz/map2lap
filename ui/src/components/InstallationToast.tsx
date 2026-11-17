import {useState} from "react";
import {useToasts} from "./toastStore";
import type {InstallationNotice, InstallationTarget} from "./installationNotice";

/** One installation issue per folder and session; polling does not bring a dismissed warning back. Shown by the page's ToastHost. */
export function InstallationToast({notice, hidden, onOpen, onDismiss}: {notice: InstallationNotice; hidden: boolean;
  onOpen: (target: InstallationTarget) => void; onDismiss?: () => void}) {
  const [dismissed, setDismissed] = useState(false);
  const dismiss = () => { setDismissed(true); onDismiss?.(); };
  useToasts(dismissed || hidden ? [] : [{id: notice.id, tone: "warning", title: notice.title, message: notice.message,
    action: {label: notice.action, run: () => { dismiss(); onOpen(notice.target); }}, onDismiss: dismiss}]);
  return null;
}
