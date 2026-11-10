import {useState} from "react";
import {Toasts} from "./Toasts";
import type {InstallationNotice, InstallationTarget} from "./installationNotice";

/** One installation issue per folder and session; polling does not bring a dismissed warning back. */
export function InstallationToast({notice, hidden, onOpen}: {notice: InstallationNotice; hidden: boolean; onOpen: (target: InstallationTarget) => void}) {
  const [dismissed, setDismissed] = useState(false);
  return <Toasts messages={dismissed || hidden ? [] : [{...notice, tone: "warning", action: {label: notice.action, run: () => {
    setDismissed(true);
    onOpen(notice.target);
  }}}]} onDismiss={() => setDismissed(true)} />;
}
