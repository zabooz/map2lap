// The server's answers: a failed connection comes back as a value, for the caller to show.

export type WithError<T> = T & {error?: string};

/** The JSON at url, or null when the server cannot be reached. */
export async function get<T>(url: string): Promise<T | null> {
  try {
    return (await (await fetch(url)).json()) as T;
  } catch {
    return null;
  }
}

/** The answer to a POST of body; a failed connection as {error}. */
export async function post<T = object>(url: string, body?: unknown): Promise<WithError<Partial<T>>> {
  try {
    const r = await fetch(url, {method: "POST", headers: {"Content-Type": "application/json"}, body: body === undefined ? undefined : JSON.stringify(body)});
    return (await r.json()) as WithError<Partial<T>>;
  } catch (e) {
    return {error: String(e)} as WithError<Partial<T>>;
  }
}
