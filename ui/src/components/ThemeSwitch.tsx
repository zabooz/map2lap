import {useTheme} from "../hooks/useTheme";
import {MoonIcon, SunIcon} from "./icons";
import styles from "./ThemeSwitch.module.css";

/** The sidebar's two appearance choices, initially selected by the system. */
export function ThemeSwitch() {
  const [theme, choose] = useTheme();
  return (
    <div className={styles.row}>
      <span className={styles.label}>Appearance</span>
      <div className={styles.choices} role="group" aria-label="Appearance">
        <button type="button" aria-pressed={theme === "light"} onClick={() => choose("light")}><SunIcon />Light</button>
        <button type="button" aria-pressed={theme === "dark"} onClick={() => choose("dark")}><MoonIcon />Dark</button>
      </div>
    </div>
  );
}
