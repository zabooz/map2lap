# Generator page

The generator page is React and TypeScript in `ui/`, built with Bun into `src/web`. `src/web` is committed: the server hands
it out, users need no Bun. Change `ui/`, never `src/web`, and build before a commit.

```powershell
cd ui; bun install --frozen-lockfile  # once per clone, with the committed dependency versions
bun run dev                   # http://localhost:3000, changes show as files are saved; needs the server on 8800
bun run check                 # types, React's hook rules and the page's tests
bun run build                 # into src/web
bun run e2e                   # builds, then the browser tests in Chrome (Playwright, ui/e2e), ~2 min; `playwright test` alone runs on the src/web as last built
bun run e2e:all               # also in Edge, Firefox and WebKit; once per machine: bunx playwright install
```

Which browser tests when: while working the test file of the change in Chrome (`bun run build`, then `bunx playwright test e2e/editor.e2e.ts --project=chrome`, `-g` for single tests); before a commit `bun run e2e`; before a merge or a release `bun run e2e:all`, and before a commit that changes the camera, mouse or keys, where browsers differ.

The browser tests run against `ui/e2e/server.py`: the real server with an AC folder, settings and small tracks of its own, and
stand-ins for builds, AC, updates, map data and the net. They test that things work, not where they sit; only the 3D view is
tested down to the pixel (`render.e2e.ts`). `--update-snapshots` takes new reference images after a wanted change of its look.

- Function components and hooks; state lives where it is used, what can be worked out from it is worked out while rendering.
- An effect only talks to something outside React (server, Leaflet, three.js) and cleans up after itself (`StrictMode` is on).
- Leaflet through react-leaflet, three.js in `ui/src/editor/view.ts`: camera and mesh data stay outside React; only the hover
  information enters React state.
- A component's look lives in its `<name>.module.css` beside it (`bun run check` compares the two); `ui/src/styles.css` holds only
  colours, base rules and what several components share. No style by element name or id: a global `aside` rule reached into
  everything that used the tag.

Browser tests use twelve workers because software 3D shares the CPU.
Editor data flow and save semantics: [docs/editor.md](../docs/editor.md).
