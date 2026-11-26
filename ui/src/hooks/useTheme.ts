import {useCallback, useEffect, useLayoutEffect, useState} from "react";

type Theme = "light" | "dark";
const KEY = "map2lap.theme";

/** This browser's explicit appearance choice; unavailable or invalid storage leaves it at the dark default. */
function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch { return null; }
}

/** Dark until Light is chosen; keep the choice in this browser and share it with its other tabs. */
export function useTheme() {
  const [choice, setChoice] = useState(storedTheme);
  const theme = choice ?? "dark";

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
