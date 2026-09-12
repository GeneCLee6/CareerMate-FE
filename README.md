# CareerMate-FE

The frontend for CareerMate AI, built with **React + TypeScript +
styled-components**.

It contains the marketing landing page, the full register / verify / sign-in /
password-recovery flow, first-run onboarding, the AI assistant, and personal
settings. The landing page is a component-by-component rewrite of the original
static site (`index.html` / `styles.css` / `script.js`); every other screen is
built from the Zeplin design.

## Documentation

| Document | Contents |
| --- | --- |
| [`PRD.md`](./PRD.md) | Product requirements, user stories, acceptance criteria, known gaps |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Directory structure, data flow, session design |
| [`DESIGN.md`](./DESIGN.md) | Design system: type, colour, sizing, states |
| [`RULES.md`](./RULES.md) | Engineering conventions, testing, branch/PR/CI rules |
| [`DEPLOY.md`](./DEPLOY.md) | Hosting comparison and configuration |

The backend lives in
[CareerMate-BE](https://github.com/GeneCLee6/CareerMate-BE).

## Tech stack

- React 19 (Create React App)
- TypeScript (strict mode)
- styled-components v6
- react-router-dom v7
- EmailJS for the contact form

## Getting started

```bash
npm install
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Available scripts

| Script          | Description                                       |
| --------------- | ------------------------------------------------- |
| `npm start`     | Run the dev server with hot reload                 |
| `npm run build` | Build the production bundle into `build/`          |
| `npm test`      | Run the test runner in watch mode                  |
| `CI=true npm test` | Run the suite once, as CI does                  |
| `npx tsc --noEmit` | Type-check the project without emitting output |

## Environment variables

`REACT_APP_API_BASE_URL` points at the CareerMate-BE API (note the `/v1`
prefix). The contact form posts through EmailJS. Copy `.env.example` to
`.env.local` and fill in your own credentials:

```
REACT_APP_API_BASE_URL=http://localhost:3000/v1
REACT_APP_EMAILJS_PUBLIC_KEY=
REACT_APP_EMAILJS_SERVICE_ID=
REACT_APP_EMAILJS_TEMPLATE_ID=
```

Until these are set, submitting the form logs the payload to the console instead
of sending an email, so the form stays usable in local development.

## Project structure

```
src/
├── api/                    Typed API client (auth, users, resumes, uploads)
├── assets/                 Images used across the site
├── components/             Shared, page-agnostic components
│   ├── AppHeader/          Signed-in top bar
│   ├── Avatar/
│   ├── Section/            Shared landing section shell
│   ├── UserMenu/           Account dropdown, logout modal + toast
│   └── ...                 Form fields, buttons, modal, toast
├── context/                AuthContext (session + token)
├── styles/tokens.ts        Design tokens (Zeplin + landing palettes)
├── pages/
│   ├── Home/               The landing page, one folder per section
│   │   ├── Navbar/
│   │   ├── Hero/
│   │   ├── ProductPreview/
│   │   ├── ProblemSolution/
│   │   ├── FeaturesShowcase/
│   │   ├── AIAction/
│   │   ├── AIEngineer/
│   │   ├── Testimonials/
│   │   ├── ContactSection/
│   │   ├── CTA/
│   │   └── Footer/
│   ├── Login/
│   ├── Register/
│   ├── ForgotPassword/
│   ├── Onboarding/
│   ├── Chat/               The signed-in assistant screen
│   └── Settings/
└── utils/                  Form validators
```

Each section folder exports its component through an `index.ts` barrel, so
sections are imported as `import Hero from "./Hero"`.

## Routes

| Path               | Page                          | Auth     |
| ------------------ | ----------------------------- | -------- |
| `/`                | Landing page                  | public   |
| `/login`           | Login                         | public   |
| `/register`        | Register                      | public   |
| `/verify-email`    | Email verification code       | public   |
| `/forgot-password` | Reset password (3 steps)      | public   |
| `/onboarding`      | First-run setup               | required |
| `/app`             | Assistant (resume + chat)     | required |
| `/settings`        | Personal settings             | required |
| anything else      | Redirects to `/`              | —        |

Protected routes redirect to `/login` and send the user back afterwards.

`/verify-email` needs an address in the router state, so it is only
reachable from `/register` or from a login the backend refused as
unverified; opening it directly sends the user to `/register`.
