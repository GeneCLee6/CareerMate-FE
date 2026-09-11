# CareerMate

The CareerMate AI marketing site, built with **React + TypeScript + styled-components**.

It is a component-based rewrite of the original static `index.html` / `styles.css` /
`script.js` landing page — same layout, copy and assets, now typed and split into
reusable sections.

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
| `npx tsc --noEmit` | Type-check the project without emitting output |

## Environment variables

The contact form posts through EmailJS. Copy `.env.example` to `.env.local` and
fill in your own credentials:

```
REACT_APP_EMAILJS_PUBLIC_KEY=
REACT_APP_EMAILJS_SERVICE_ID=
REACT_APP_EMAILJS_TEMPLATE_ID=
```

Until these are set, submitting the form logs the payload to the console instead
of sending an email, so the form stays usable in local development.

## Project structure

```
src/
├── assets/                 Images used across the site
├── components/             Shared, page-agnostic components
│   ├── ArrowIcon/
│   ├── BackToTop/
│   └── TextInput/
├── hooks/                  useEmail, usePassword
├── pages/
│   ├── Home/               The landing page, one folder per section
│   │   ├── Navbar/
│   │   ├── Hero/
│   │   ├── Features/
│   │   ├── ProblemSolution/
│   │   ├── FeaturesShowcase/
│   │   ├── AIAction/
│   │   ├── AIEngineer/
│   │   ├── Testimonials/
│   │   ├── ContactSection/
│   │   ├── CTA/
│   │   └── Footer/
│   ├── Login/
│   └── Register/
├── utils/                  Form validators
└── types.ts                Shared types
```

Each section folder exports its component through an `index.ts` barrel, so
sections are imported as `import Hero from "./Hero"`.

## Routes

| Path         | Page                    |
| ------------ | ----------------------- |
| `/`          | Landing page            |
| `/login`     | Login                   |
| `/register`  | Register                |
| anything else | Redirects to `/`       |
