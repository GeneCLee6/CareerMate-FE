# CareerMate AI — Frontend Product Requirements

## 1. Overview

**CareerMate AI** is an AI-first job-preparation platform that helps students
and junior engineers **improve a resume, practise interviews, and plan a
career**.

This document covers **CareerMate-FE**: the React application users actually
see. The API is provided by
[`CareerMate-BE`](https://github.com/GeneCLee6/CareerMate-BE).

The frontend's goal is to **render the design faithfully and make every
failure understandable**. Most defects in this project are not "the wrong
pixels" — they are "something broke and the user cannot tell what". Error
handling is therefore treated as a feature, not as tidying up afterwards.

## 2. Users

- Students and career changers who are job hunting.
- Desktop is the primary setting (the designs are drawn at 1440 and 1920
  wide), but **the phone must not be unusable** — components such as the
  sidebar need a real mobile behaviour, not just `display: none`.
- Anyone may browse the landing page; every other screen requires a session.

## 3. Screens

Design source: the Zeplin project `CareerMate AI`.

| Screen | Route | Auth | Status |
| --- | --- | --- | --- |
| Landing page | `/` | ❌ | ✅ Done |
| Register | `/register` | ❌ | ✅ Done |
| Email verification code | `/verify-email` | ❌ | ✅ Done |
| Login | `/login` | ❌ | ✅ Done |
| Forgot password (3 steps) | `/forgot-password` | ❌ | ✅ Done |
| Onboarding | `/onboarding` | ✅ | ✅ Done |
| AI assistant | `/app` | ✅ | ✅ Done |
| Personal settings | `/settings` | ✅ | ✅ Done |

### 3.1 Landing page

A marketing page rebuilt from the original static site
(`CareerMateAI-Web/30`): nine sections plus a footer. **It predates the Zeplin
design**, so it keeps its own palette and is deliberately separate from the
auth design system (see `RULES.md` §2).

When signed in, the navbar's "Sign In / Start for Free" is replaced by the
account menu.

### 3.2 Register, verify and sign in

- Form validation **mirrors the backend** (at least 8 characters, containing
  a letter and a digit). The purpose is earlier feedback; the backend remains
  the only source of truth.
- Every state in the design must exist: field-level red borders, the error
  banner, the network-error case, the success panel, the "email already
  registered" modal, and the sign-in success toast.
- "Remember me" decides whether the session is stored in `localStorage`
  (kept across tabs) or `sessionStorage`.
- Registration does not sign the user in — it hands off to `/verify-email`.

### 3.3 Forgot password

Three steps: enter email → enter the six-digit code → set a new password →
success panel.

The code input must support **pasting the whole string** (including stripping
separators), backspacing to the previous box, and arrow-key movement.

### 3.4 Onboarding

A three-step progress rail: Welcome → Basic Information (role / field / goal)
→ Finish. Option values must match the backend enums (`Student`/`Other`,
`FE`/`BE`).

### 3.5 AI assistant

- Left sidebar: upload, list, delete on hover. **Below 840px it becomes a
  drawer** — it must not simply be hidden, which would make resumes
  unmanageable on a phone.
- Centre: a greeting when empty, the thread when not.
- After sending, show "AI is thinking..." until the reply arrives.
- On failure: remove the unanswered message, put the text back in the input,
  and show the real reason the server gave.

### 3.6 Settings

Three tabs: Basic Info, Career & Learning, Account & Security (including
password change). The avatar can be uploaded.

## 4. User stories and acceptance criteria

Written Given / When / Then, so each criterion reads as a test name.

### Epic A — Getting into the product

**A1. As a visitor, I want to understand what the product does before signing
up.**

- Given I open `/`, then the page renders with no session and no request
  requires a token.
- Given I am signed in, when I open `/`, then the navbar shows my account
  menu instead of the sign-up buttons.

**A2. As a new user, I want to create an account.**

- Given a password that fails the rule, when I submit, then I see the reason
  **before** a request is sent.
- Given an email that already exists, then I see the dedicated modal from the
  design, not a generic banner.
- Given registration succeeds, then I am taken to the verification screen —
  not signed in, because the backend issues no token at registration.

**A3. As a new user, I want to enter the code from my email.**

- Given I paste the whole six-digit code, then it distributes across the
  boxes with separators stripped.
- Given the code is wrong, then the boxes clear, are marked invalid, and the
  server's message is shown.
- Given the code is right, then I am signed in and continue to onboarding.
- Given a code was just sent, then "Resend" counts down 60 seconds, matching
  the backend cooldown.
- Given I arrived from a refused sign-in — where no code was sent — then
  "Resend" is available immediately.
- Given I refresh the page, then I am returned to `/register`, because the
  address the code went to is no longer known.

**A4. As an unverified user, I want the sign-in screen to help me.**

- Given the backend answers 403, then I am taken to the verification screen
  carrying its message — not shown "invalid email or password".

### Epic B — Staying signed in

**B1. As a user, I want to stay signed in between visits.**

- Given "Remember me" was ticked, when I return in a new tab, then I am still
  signed in.
- Given it was not ticked, then closing the tab ends the session.
- Given a stored session, then it is read when the provider mounts — not when
  the module is first imported, which made the behaviour untestable and
  dependent on import order.

**B2. As a user, I want to be told when my session ends, rather than hitting
silent failures.**

- Given the API answers 401 to a request that carried a token, then I am
  signed out, shown a toast, and sent to `/login`.
- Given a 401 from signing in or from submitting a wrong code, then it is
  treated as a rejected credential, **not** an expired session — otherwise a
  typo would look like being logged out.

### Epic C — Resumes

**C1. As a user, I want to upload my resume.**

- Given a file that is not a PDF, or is over 10 MB, then it is rejected
  before upload with the reason shown, so an upload attempt is not wasted.
- Given a file whose MIME type is empty — which happens on some systems —
  then the decision falls back to the extension rather than rejecting a valid
  PDF.
- Given the upload to storage is blocked by CORS, then the message says the
  file storage could not be reached and the console carries an actionable
  hint. The raw `TypeError: Failed to fetch` explains nothing.

**C2. As a user on a phone, I want to manage my resumes.**

- Given a viewport under 840px, then the sidebar is reachable as a drawer.

### Epic D — Conversation

**D1. As a user, I want to ask the assistant a question.**

- Given I send a message, then it appears immediately, before the reply
  arrives.
- Given the request fails, then my pending message is removed, its text is
  restored to the input, and the banner names the server's reason.
- Given the server has no AI key, then the screen says so rather than failing
  anonymously.

## 5. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Error legibility | Always show the server's real message; never reduce it to "an error occurred". A toast that disappears must not be the only sign of failure |
| Session expiry | An invalid token signs the user out and returns them to login; they are never stranded in an invalid state |
| Validate before upload | File type and size are checked before sending, with the reason shown |
| Mobile | No feature may be completely unreachable on a narrow screen |
| Accessibility | Errors use `role="alert"`; invalid fields carry `aria-invalid`, so the visual state and the assistive-technology state cannot drift apart |
| Secrets | `REACT_APP_*` values are bundled into the JavaScript. **No real secret may ever go there** |

## 6. Out of scope

- No SSR or Next.js migration; this stays CRA.
- No Redux or similar — `AuthContext` plus component state is sufficient.
- No internationalisation.
- No conversation list sidebar (absent from the design); only the most recent
  conversation is kept.
- No exhaustive UI component test coverage (see `RULES.md` §6).

## 7. Delivery status

| Epic | Status |
| --- | --- |
| A — Getting into the product | ✅ Done |
| B — Staying signed in | ✅ Done |
| C — Resumes | ✅ Done |
| D — Conversation | ✅ Done |

### Remaining tasks, in priority order

| # | Task | Why it matters | Size |
| --- | --- | --- | --- |
| 1 | Surface resume content once the backend can extract it | Today the assistant knows only filenames | M |
| 2 | Resume download | The backend endpoint exists; the sidebar offers only delete | S |
| 3 | Pages for the footer's `Terms` and `Privacy` links | They are dead links on a public page | S |
| 4 | Conversation history sidebar | Only the most recent conversation is reachable | M |
| 5 | Render assistant replies as Markdown | Long answers arrive as one unformatted block | S |

### Accepted as-is

- The CTA keeps the original static site's typo
  `Start Practingcing for Free` (the design says `Practicing`) — confirmed,
  not changing for now.
- The footer year reads 2026 where the design says 2025 — same.

## 8. Definition of Done

- **Every state** in the design is implemented, including error and empty
  states — not only the happy path.
- Failure paths have defined behaviour, and the user can understand the
  cause.
- `npx tsc --noEmit`, `npm test` and `npm run build` all pass with no
  warnings.
- Any change touching the landing page is proven not to alter its appearance
  by snapshot comparison (see `RULES.md` §7).
