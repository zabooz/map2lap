import {useEffect, useRef, useState} from "react";
import styles from "./CodeField.module.css";
import {CopyIcon, TickIcon} from "./icons";

const COPY_TITLE = "Copy the track code: pasted here by someone else, it sets the same track";
const COPIED_MS = 1500;

/** A track code's copy button inside its field. */
function CopyButton({text}: {text: string}) {
  const [copied, setCopied] = useState<boolean | null>(null);

  useEffect(() => {
    if (copied === null) return;
    const timer = setTimeout(() => setCopied(null), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => setCopied(await navigator.clipboard.writeText(text).then(() => true, () => false));

  return (
    <button className={styles.copy} disabled={!text} aria-label="Copy track code"
            title={copied === null ? COPY_TITLE : copied ? "Copied" : "Copying failed"} onClick={copy}>
      {copied === null ? <CopyIcon /> : copied ? <TickIcon /> : "!"}
    </button>
  );
}

/** A track code to copy. onPaste: a code typed or pasted into it (none: read only); a half-typed one gives way to code
    when the field is left. */
export function CodeField({code, onPaste}: {code: string; onPaste?: (text: string) => void}) {
  const [typed, setTyped] = useState<string | null>(null);
  const pasting = useRef(false);

  return (
    <div className={styles.wrap}>
      <input type="text" spellCheck={false} autoComplete="off" aria-label="Track code"
             placeholder={onPaste ? "Paste a track code" : undefined} readOnly={!onPaste} value={typed ?? code}
             onPaste={() => { pasting.current = true; }}
             onChange={e => {
               setTyped(e.target.value);
               if (pasting.current) onPaste?.(e.target.value);
               pasting.current = false;
             }}
             onBlur={() => setTyped(null)}
             onKeyDown={e => {
               if (e.key === "Enter" && typed !== null) onPaste?.(typed);
               if (e.key === "Escape") e.currentTarget.blur();
             }} />
      <CopyButton text={typed ?? code} />
    </div>
  );
}
