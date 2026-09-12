# CLAUDE.md — CareerMate-FE

Project guidance for Claude Code. Read `RULES.md` and `ARCHITECTURE.md`
before starting work.

## What this is

The frontend for CareerMate AI. React 19 + TypeScript (strict) +
styled-components, on Create React App.

The backend is a separate repository (`CareerMate-BE`). If a change needs a
backend PR merged first, say so at the top of the PR.

## Read first

| Situation | Read |
| --- | --- |
| Building a screen from the design | `DESIGN.md`, which carries the measured values |
| Adding an API call | `ARCHITECTURE.md` §3 and §5 |
| Touching the landing page | **`RULES.md` §7 — a snapshot comparison is required** |
| Writing tests | `RULES.md` §6 |
| Branching, opening a PR | `RULES.md` §8–10 |

## Hard rules

1. **No `fetch()` in a component.** Everything goes through `api/*.ts`. The
   only exception is the direct upload to S3.
2. **Do not merge `colors` and `landingColors`** — the two sets differ
   deliberately.
3. **A prop used only for styling takes a `$` prefix**, or it is forwarded to
   the DOM and warns.
4. **Changing the landing page requires a snapshot comparison**, with a zero
   difference shown in the PR.
5. **`REACT_APP_*` values are bundled**, so no secret may go in one.
6. **Never push directly to `main`.**
7. **Everything written here is in English** — code, comments, docs, commits,
   PRs, UI copy. This is a public portfolio repository.

## Known traps

- **`getComputedStyle` read through a browser extension can return stale
  values.** Judge whether a style applied by taking a **screenshot**; a stale
  read once led to the wrong conclusion that a style had not applied.
- **CRA reads env only at start-up.** Restart after editing `.env.local`.
- **`Resume` arrives from the backend with `_id` and no `id`.**
  `normaliseResume` in `api/resumes.ts` handles it — do not work around it
  again at the page level.
- **Not every 401 means the session expired.** A failed sign-in, a wrong
  current password and a wrong code all return 401. Those calls must pass
  `handlesUnauthorized: true`, or the user is wrongly signed out.
- **`accept` must list both a media type and an extension**
  (`application/pdf,.pdf`). Media type alone is slow on Windows, and some
  systems report an empty `file.type`, which hides valid files.
- **Do not mix `height: 100%` with `max-width` when scaling an image** — it
  distorts. See `DESIGN.md` §5.
- **A test that renders a route needs the `react-router-dom` mapping in
  `package.json` and the `TextEncoder` polyfill in `setupTests.ts`.** Both are
  already there; removing either breaks every routed test at import time.

## Commands

```bash
npm start                    # :3000
npx tsc --noEmit             # types
CI=true npm test             # tests, single run
CI=false npm run build       # build, tolerating warnings locally
```

Against a local backend:
`REACT_APP_API_BASE_URL=http://localhost:3000/v1 npm start`

## Current gaps

See `PRD.md` §7. The most limiting one is that **the assistant cannot see
resume content** — the backend passes only filenames, so the advice is
necessarily generic until PDF text extraction lands.
