# CareerMate AI — Frontend Engineering Rules

The guiding principles are **SOLID, DRY, KISS**. This document explains *why*
the code is split the way it is; `ARCHITECTURE.md` describes what the folders
and data flow actually look like.

Sections 8–10 — branches, pull requests and CI — are **identical to
`CareerMate-BE`**. Both repositories follow them.

## 1. SOLID, concretely

### 1.1 Single responsibility

- **`api/*.ts`**: HTTP and type conversion only. Never touches React state.
- **`context/AuthContext`**: session state and persistence only. Makes no
  business requests.
- **`components/`**: presentation and interaction only. Knows nothing about
  the API's shape.
- **`pages/`**: orchestration — call the API, hold state, decide which state
  to render.
- **`utils/validators` and `utils/fileValidation`**: pure functions with no
  React dependency.

Forbidden: `fetch()` inside a component; `setState` inside `api/`.

### 1.2 Open/closed

- **A new auth screen** composes the existing `AuthLayout`, `TextField` and
  `GradientButton` without modifying any of them. `/verify-email` was built
  exactly this way, changing none of its parts.
- **A new landing section** is a new folder using the shared `Section` /
  `SectionContainer`; existing sections stay untouched.
- A proven case: when `UserMenu` needed a second appearance, it gained a
  `variant` prop (`"app"` / `"landing"`) and its existing behaviour did not
  change.

### 1.3 Liskov substitution

`PasswordField` is a specialisation of `TextField`, and their props are
compatible (`PasswordFieldProps` is derived from `TextFieldProps`). Anywhere
that accepts a `TextField` accepts a `PasswordField`.

### 1.4 Interface segregation

Component props expose only what that component genuinely needs.
`ResumeSidebar` receives `resumes`, `uploading` and `uploadError` — not the
whole `Chat` page state object.

### 1.5 Dependency inversion

Pages depend on the signatures `api/*.ts` exports, not on `fetch` or on the
backend's response shape. When the backend's `Resume` turned out to have no
`id` field, the fix was `normaliseResume` in `api/resumes.ts` and no page
changed — this principle earning its keep in practice.

## 2. DRY

| Logic that tends to get duplicated | Where it lives |
| --- | --- |
| Colour, gradient, type, control sizing | `styles/tokens.ts` |
| The landing-section shell | `components/Section` |
| Form validation rules | `utils/validators.ts` |
| File type and size limits | `utils/fileValidation.ts` |
| API error normalisation | `api/client.ts`; pages only check for `ApiError` |
| The account menu and sign-out flow | `components/UserMenu` |

> **Exception**: `colors` and `landingColors` are two **deliberately**
> different sets of values, not duplication. The reason is in
> `ARCHITECTURE.md` §4.

## 3. KISS

- No state management library; `AuthContext` plus component state is enough.
- No abstraction layer over the component library; styled-components
  directly.
- No conversation list sidebar ahead of time — the design has none.
- Do not design the API for testability's sake (storage is not wrapped in an
  injectable interface) — but equally, do not write module-scope side effects
  that cannot be tested.

## 4. Naming

- Component files and folders: PascalCase (`TextField/TextField.tsx`), each
  folder with an `index.ts` barrel.
- Utility files: camelCase (`fileValidation.ts`).
- styled-components variables describe a role, not an appearance
  (`PanelTitle`, not `BigBoldText`).
- **Any prop used only for styling takes a `$` prefix** (transient props such
  as `$active`, `$invalid`), so it is not forwarded to the DOM and does not
  produce a React warning.
- Constants: upper snake case (`MAX_RESUME_BYTES`, `ONBOARDING_STEPS`).

## 5. Styling rules

1. **Bind visual state to a DOM attribute wherever possible.** A field error
   uses `&[aria-invalid="true"]` rather than a styled prop, so the visual
   state and the state assistive technology reports cannot drift apart.
2. **Never hard-code a colour.** Take it from `tokens.ts`.
3. Reuse the existing breakpoints — `landingLayout.mobile` (768px) and the
   860 / 900 / 1100px values components already use. Do not invent new ones.
4. **No feature may vanish entirely on a narrow screen.** When something must
   be hidden, turn it into a drawer or a collapsible section; `ResumeSidebar`
   is the template.

## 6. Testing philosophy

- **Must be tested**: pure logic — `utils/validators`,
  `utils/fileValidation`, `api/client`'s error and session-expiry branches,
  `api/resumes`' field normalisation, `AuthContext`'s storage and expiry
  behaviour.
- **Should be tested**: components with real interaction logic (`OtpInput`'s
  paste, backspace and focus movement) and screens whose flow matters
  (`VerifyEmail`'s resend cooldown and missing-address redirect).
- **Not required**: purely presentational components and styling, which are
  verified by eye in a browser.
- Test files sit **next to** what they test (`validators.test.ts` beside
  `validators.ts`).
- Always mock `global.fetch`. A test must never reach a real backend.

> Known trap: `react-router-dom` v7 declares a `main` that is not in the
> published package, and the jsdom bundled with react-scripts has no
> `TextEncoder`. Both are handled — a `moduleNameMapper` entry in
> `package.json` and a polyfill in `setupTests.ts` — but a test that renders a
> route will fail to load without them.

## 7. Special rules for changing the landing page

The landing page is finished and its appearance must not change. If a
refactor has to touch it:

1. Before the change, capture a computed-style and geometry snapshot of every
   element in the browser.
2. Capture it again afterwards and compare line by line.
3. **The difference must be zero**, and the PR must say so.

This has been done twice — extracting `Section`, and wiring the CTA to
`/register` — and both times proved the appearance was unchanged.

## 8. Branch naming

Format: `<type>/<kebab-case-summary>`

| Prefix | Use | Example |
| --- | --- | --- |
| `feat/` | New capability | `feat/chat-wiring`, `feat/email-verification` |
| `fix/` | Bug fix | `fix/resume-upload`, `fix/auth-panel-aspect` |
| `refactor/` | Behaviour-preserving change | `refactor/landing-shared-styles` |
| `docs/` | Documentation only | `docs/project-docs-and-ci` |
| `test/` | Tests only | `test/otp-input` |
| `chore/` | Dependencies, configuration | `chore/bump-user-event` |

Rules:

- Always branch from the **latest `main`** (`git pull --ff-only` first).
- Lower-case English with hyphens. No underscores.
- **One branch, one concern.**
- Delete a branch once it is merged.
- Never push directly to `main`.

## 9. Pull requests

**Title**: `<type>: <description>`.

**The body must contain:**

1. **Why** — the problem being solved.
2. **What changed** — the points that matter.
3. **How it was verified** — commands actually run and their results, and
   which scenarios were exercised in a browser.
4. **Known gaps** — related things this PR does not do.

Other rules:

- For a bug fix, **include the measurements from before the fix** — for
  example, "at 1920×1080 the panel computed to 688×1032 where the source is
  720×836, a 22.6% horizontal squash" — to show the problem existed rather
  than was assumed.
- When the landing page is touched, attach the §7 snapshot comparison.
- Keep pull requests small and complete; past roughly 400 changed lines,
  consider splitting.
- If a backend PR must merge first, say so at the top.
- CI must be green before merging.

## 10. CI

CI is defined in `.github/workflows/ci.yml` and runs on pushes to `main` and
on every pull request targeting `main`.

| Check | Command | A failure means |
| --- | --- | --- |
| Types | `npx tsc --noEmit` | A type error |
| Tests | `npm test` in CI mode | Logic is broken |
| Build | `npm run build` | No deployable output can be produced |

Rules:

- **A red build is not merged.**
- The build runs with `CI=true`, which **treats warnings as errors** — that
  is the point, so warnings cannot quietly accumulate.
- CI needs no real key; every test mocks `fetch`.

## 11. Language

**Everything written in this repository is in English** — code, comments,
documentation, commit messages, PR descriptions and UI copy. This is a public
portfolio repository read by people who do not read Chinese.
