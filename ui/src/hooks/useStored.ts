import {useCallback, useState} from "react";

/** The stored value at key if it is one of allowed (none given: any). Blocked storage: first. */
function read<T extends string>(key: string, first: T, allowed?: readonly T[]) {
  try {
    const v = localStorage.getItem(key) as T | null;
    return v !== null && (!allowed || allowed.includes(v)) ? v : first;
  } catch {
    return first;
  }
}

/** useState whose value this browser keeps over a reload (the page's conveniences: nothing that must not get lost). */
export function useStored<T extends string>(key: string, first: T, allowed?: readonly T[]) {
  const [value, setValue] = useState<T>(() => read(key, first, allowed));

  const set = useCallback((next: T) => {
    setValue(next);
    try {
      localStorage.setItem(key, next);
    } catch { /* (blocked: it holds for this visit) */ }
  }, [key]);

  return [value, set] as const;
}
