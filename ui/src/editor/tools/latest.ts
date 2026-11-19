// Which of a tool's requests may still act: an answer that arrives after a newer request, Esc or the tool's end is dropped.

/** A generation count for one tool's requests: next() before asking, current(token) before acting on the answer, drop() in the
    tool's clear() so nothing asked before acts afterwards (a kerb end answered after Esc adds no kerb). */
export class Latest {
  private n = 0;

  next() { return ++this.n; }

  current(token: number) { return token === this.n; }

  drop() { this.n++; }
}
