import {useTheme} from "../hooks/useTheme";
import {MoonIcon, SunIcon} from "./icons";

/** The page's colour mode as one button in the workspace rail: it shows the current mode (sun or moon), pressed in dark mode,
    and a click switches to the other. Until the first click the page is dark. */
export function ThemeSwitch({className}: {className: string}) {
  const [theme, choose] = useTheme();
  const dark = theme === "dark";
  return (
    <button type="button" data-testid="nav-theme" className={className} aria-label="Dark mode" aria-pressed={dark}
            title={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => choose(dark ? "light" : "dark")}>
      {dark ? <MoonIcon size={24} /> : <SunIcon size={24} />}
    </button>
  );
}
