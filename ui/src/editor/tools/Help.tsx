import styles from "./Help.module.css";
import {toolDef, toolTitle, type Tool} from "./toolDefs";

/** How the Editor is worked, then the keys of `tool`, the one on: short, and what is said holds now. */
export function Help({tool}: {tool: Tool}) {
  const on = toolDef(tool);
  return (
    <details id="edit-help" className={styles.help}>
      <summary className={styles.helpTitle}>Help</summary>
      <p className="small muted">Choose a tool with its button or the shortcut shown. Shift, Ctrl and Alt change what a click or the wheel does.
        Esc ends a tool · Ctrl+Z undo · Ctrl+S save</p>
      <p className="small muted">Right-click: the menu of what is under it.</p>
      <p className="small muted">View: W A S D · right drag · wheel zooms, held it turns. All keys: Settings → Editor.</p>
      <h4 className={styles.helpTool}>{toolTitle(on)}{!on.group && " (Library)"}</h4>
      <dl className={styles.keys}>
        {on.help.map(([keys, does]) => <div key={keys}><dt>{keys}</dt><dd>{does}</dd></div>)}
      </dl>
    </details>
  );
}
