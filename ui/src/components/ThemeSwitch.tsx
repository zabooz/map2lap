import {useTheme} from "../hooks/useTheme";
import {MoonIcon, SunIcon} from "./icons";
import styles from "./ThemeSwitch.module.css";

/** The page's two colour modes, initially selected by the system. */
export function ThemeSwitch({top = false}: {top?: boolean}) {
  const [theme, choose] = useTheme();
  return (
    <div className={`${styles.row}${top ? ` ${styles.top}` : ""}`}>
      <span className={styles.label}>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
      <div className={styles.choices} role="group" aria-label="Appearance">
        <button type="button" aria-pressed={theme === "light"} onClick={() => choose("light")}><SunIcon />Light</button>
        <button type="button" aria-pressed={theme === "dark"} onClick={() => choose("dark")}><MoonIcon />Dark</button>
      </div>
    </div>
  );
}
