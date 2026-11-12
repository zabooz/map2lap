import {TrackEdits, type Removed} from "./edits";

export const tree = (k: number): Removed => ({id: `trees#${k}`, position: [k, 0, 0]});
export const json = (body: object, status = 200) => new Response(JSON.stringify(body), {status});

/** A server by hand: each request waits until answered, with what it asked for at hand. */
export function server(deleted: Removed[] = []) {
  const asked: {method: string; body: {revision: number; deleted: Removed[]}; answer: (r: Response) => void}[] = [];
  const send = (_url: string, options?: RequestInit) => {
    if (!options) return Promise.resolve(json({base: "b", revision: 3, deleted, outdated: 0}));
    return new Promise<Response>(answer => asked.push({method: options.method!, body: JSON.parse(String(options.body)), answer}));
  };
  return {send, asked};
}

export const settle = () => new Promise(ok => setTimeout(ok, 0));

export async function started(deleted: Removed[] = []) {
  const s = server(deleted), edits = new TrackEdits("t", s.send);
  edits.bind("b");
  await edits.start();
  return {s, edits};
}
