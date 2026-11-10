import {useCallback, useEffect, useLayoutEffect, useState, useSyncExternalStore} from "react";

type Theme = "light" | "dark";
const KEY = "map2lap.theme";
const QUERY = "(prefers-color-scheme: dark)";

/** This browser's explicit appearance choice; unavailable or invalid storage leaves it automatic. */
function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch { return null; }
}

function systemTheme(): Theme {
  return matchMedia(QUERY).matches ? "dark" : "light";
}

function subscribeSystem(changed: () => void) {
  const media = matchMedia(QUERY);
  media.addEventListener("change", changed);
  return () => media.removeEventListener("change", changed);
}

/** Follow the system until Light or Dark is chosen; keep that choice in this browser. */
export function useTheme() {
  const [choice, setChoice] = useState(storedTheme);
  const system = useSyncExternalStore(subscribeSystem, systemTheme);
  const theme = choice ?? system;

  useLayoutEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (event.storageArea === localStorage && (event.key === KEY || event.key === null)) setChoice(storedTheme());
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, []);

  const choose = useCallback((next: Theme) => {
    setChoice(next);
    try { localStorage.setItem(KEY, next); } catch { /* Blocked storage: keep the choice for this visit. */ }
  }, []);

  return [theme, choose] as const;
}
