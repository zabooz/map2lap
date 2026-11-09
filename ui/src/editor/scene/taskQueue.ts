/** Run at most most jobs; priority jobs take the next free slot before ordinary queued work. */
export function oneByOne(most: number) {
  const waiting: (() => void)[] = [], priorityWaiting: (() => void)[] = [];
  let running = 0;
  return async <T>(job: () => Promise<T>, priority = false) => {
    if (running >= most) await new Promise<void>(ok => (priority ? priorityWaiting : waiting).push(ok));
    else running++;
    try {
      return await job();
    } finally {
      const next = priorityWaiting.shift() ?? waiting.shift();
      // Transfer the occupied slot directly: a new arrival cannot take it before the queued job resumes.
      if (next) next(); else running--;
    }
  };
}
