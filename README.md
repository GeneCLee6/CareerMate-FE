# CareerMate-FE

CareerMate AI 的前端，以 **React + TypeScript + styled-components** 建置。

包含行銷首頁、完整的註冊／登入／忘記密碼流程、新手引導、AI 助理與個人設定。
首頁是原始靜態網站（`index.html` / `styles.css` / `script.js`）的元件化重寫，
其餘畫面依 Zeplin 設計稿實作。

## 文件

| 文件 | 內容 |
|---|---|
| [`PRD.md`](./PRD.md) | 產品需求、畫面清單、已知缺口 |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | 目錄結構、資料流、session 設計 |
| [`DESIGN.md`](./DESIGN.md) | 設計系統：字體、顏色、尺寸、狀態 |
| [`RULES.md`](./RULES.md) | 工程規範、測試、分支／PR／CI 規範 |
| [`DEPLOY.md`](./DEPLOY.md) | 部署平台比較與設定 |

後端在 [CareerMate-BE](https://github.com/GeneCLee6/CareerMate-BE)。

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
