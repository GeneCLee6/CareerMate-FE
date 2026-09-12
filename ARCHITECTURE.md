# CareerMate AI — Frontend Architecture

`PRD.md` says what the app must do. This document says what it actually looks
like and how data moves through it. `RULES.md` says why it is split the way it
is.

## 1. Technology choices

| Area | Choice | Reason |
| --- | --- | --- |
| Framework | React 19 + Create React App | Continues the existing setup; no migration to Vite |
| Language | TypeScript (strict) | Types are this project's main safety net, because there are no component tests |
| Styling | styled-components v6 | Styles live beside the component, which suits building screen-by-screen from a design |
| Routing | react-router-dom v7 | |
| Tests | Jest + Testing Library (bundled with CRA) | |
| Contact form | EmailJS | A frontend-only form with no secret involved |

## 2. Directory structure

```
src/
├── api/                    The only door to the backend
│   ├── client.ts           fetch wrapper: token, error normalisation, session expiry
│   ├── auth.ts             Register, verify, sign in, password recovery
│   ├── users.ts            Profile, password, avatar
│   ├── resumes.ts          Resumes and the two-step S3 upload
│   └── chat.ts             Conversation
│
├── context/AuthContext     Session state and persistence
├── styles/tokens.ts        Design tokens (two palettes — see §4)
│
├── components/             Shared, page-agnostic components
│   ├── AuthLayout          The form-left / illustration-right auth shell
│   ├── TextField / PasswordField / SelectField
│   ├── GradientButton / AlertBanner / Modal / Toast
│   ├── OtpInput            The six-box code input
│   ├── AppHeader / UserMenu / Avatar
│   ├── ProtectedRoute
│   └── Section             Shared landing-section shell
│
├── pages/
│   ├── Home/               Landing page, one folder per section
│   ├── Login / Register / VerifyEmail / ForgotPassword
│   ├── Onboarding
│   ├── Chat/               The assistant, including ResumeSidebar
│   └── Settings/           One file per tab
│
└── utils/                  validators, fileValidation
```

**Every component folder has an `index.ts` barrel**, so imports read
`from "./Hero"` rather than `from "./Hero/Hero"`.

## 3. Data flow

```
component
 └─ calls a function in api/*.ts (components never fetch directly)
      └─ api/client.ts
           ├─ attaches the bearer token AuthContext pushed in
           ├─ normalises { success, error: { message } } into an ApiError
           ├─ turns a network failure into ApiError(isNetworkError)
           └─ on a 401 to a request that carried a token, tells AuthContext to clear the session
```

**Rule**: no `fetch()` in a component. The single exception is the direct
`PUT` to S3 in `api/resumes.ts` — that call goes to AWS, not to this
project's API, so it does not belong to the client.

## 4. Design tokens: two palettes

`styles/tokens.ts` deliberately exports **two** sets of colours:

| Export | Used by | Representative values |
| --- | --- | --- |
| `colors` | Auth and app screens (the Zeplin design) | Heading `#161616`, border `#dfdfdf` |
| `landingColors` | The landing page (which predates the design) | Heading `#000`, border `#e5e5e5` |

**Do not merge them.** The values genuinely differ, and merging would change
how the landing page looks — that is a design decision, not a refactor.

Type is the same story: Zeplin specifies **Inter**, applied to the auth and
app screens through the `fontFamily` token, while the landing page keeps the
system font stack.

## 5. Session handling

In `context/AuthContext.tsx`:

- **When the session is restored**: inside the `useState` lazy initializer,
  not at module scope. Module scope runs once at import, which made the
  behaviour untestable and tied it to whatever storage held when the bundle
  loaded.
- **Where it is stored**: `localStorage` when "Remember me" is ticked, and
  `sessionStorage` otherwise. Every storage access is wrapped in try/catch,
  because a browser may block site data.
- **Validation on load**: one `GET /users/me` after mounting, which both
  confirms the token still works and refreshes the user. A network error does
  not sign the user out — only a 401 does.
- **Expiry**: `api/client.ts` notifies AuthContext when a request that
  carried a token comes back 401.

### Why 401 needs an opt-out

Some backend 401s are **about the request, not the session**: wrong
credentials at sign-in, the wrong current password in settings, a wrong reset
or verification code. Treating all of them as an expired session would log a
user out for mistyping their password on the settings page.

`client.ts` therefore offers `handlesUnauthorized: true`, which those call
sites set for themselves. **The status code alone cannot distinguish the two
cases**, so this is explicit marking rather than guesswork.

## 6. Upload flow

```
pick a file → utils/fileValidation checks type and size locally
            → POST /upload/presigned-url  (returns uploadUrl + fileKey)
            → PUT the bytes straight to S3
            → POST /resumes or POST /users/me/avatar with the fileKey
```

The `accept` attribute lists both a media type and an extension
(`application/pdf,.pdf`): Windows filters far faster by extension, and some
systems report an empty `file.type`, so relying on the media type alone hides
valid files from the picker.

## 7. Known shape differences from the backend

The backend's `Resume` model does **not** set `toJSON: { virtuals: true }`,
so responses carry `_id` and no `id`. `normaliseResume` in `api/resumes.ts`
fills it in, preferring an `id` if the backend sends one — so when the backend
adds the virtual, the frontend needs no change.
