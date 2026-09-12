# CareerMate AI 前端架構（ARCHITECTURE）

`PRD.md` 說明「要做什麼」，本文件說明「實際長什麼樣子、資料怎麼流」。`RULES.md` 說明「為什麼這樣拆」。

## 1. 技術選型

| 項目 | 選擇 | 理由 |
|---|---|---|
| 框架 | React 19 + Create React App | 沿用既有設定，未遷移 Vite |
| 語言 | TypeScript（strict） | 型別是這個專案的主要防線，因為沒有元件測試 |
| 樣式 | styled-components v6 | 元件與樣式同檔，符合設計稿逐元件對應的做法 |
| 路由 | react-router-dom v7 | |
| 測試 | Jest + Testing Library（CRA 內建） | |
| 聯絡表單 | EmailJS | 純前端表單，無機密 |

## 2. 目錄結構

```
src/
├── api/                    與後端往來的唯一出入口
│   ├── client.ts           fetch 封裝：token、錯誤正規化、session 過期
│   ├── auth.ts             註冊、登入、忘記密碼
│   ├── users.ts            個人檔案、密碼、頭像
│   ├── resumes.ts          履歷 + S3 兩段式上傳
│   └── chat.ts             對話
│
├── context/AuthContext     session 狀態與持久化
├── styles/tokens.ts        設計 token（兩套調色盤，見 §4）
│
├── components/             跨頁共用元件
│   ├── AuthLayout          auth 畫面的左表單／右插圖版型
│   ├── TextField / PasswordField / SelectField
│   ├── GradientButton / AlertBanner / Modal / Toast
│   ├── OtpInput            六格驗證碼
│   ├── AppHeader / UserMenu / Avatar
│   ├── ProtectedRoute
│   └── Section             Landing page 共用區塊外殼
│
├── pages/
│   ├── Home/               Landing page，每個區塊一個資料夾
│   ├── Login / Register / ForgotPassword
│   ├── Onboarding
│   ├── Chat/               AI 助理（含 ResumeSidebar）
│   └── Settings/           三個分頁各一檔
│
└── utils/                  validators、fileValidation
```

**每個元件資料夾都有 `index.ts` barrel**，因此 import 一律寫 `from "./Hero"` 而非 `from "./Hero/Hero"`。

## 3. 資料流

```
元件
 └─ 呼叫 api/*.ts 的函式（元件不直接 fetch）
      └─ api/client.ts
           ├─ 自動附上 AuthContext 推入的 bearer token
           ├─ 把後端的 { success, error: { message } } 正規化成 ApiError
           ├─ 網路失敗 → ApiError(isNetworkError)
           └─ 401（且有帶 token）→ 通知 AuthContext 清除 session
```

**規則**：元件不得出現 `fetch()`。唯一的例外是 `api/resumes.ts` 裡直傳 S3 的 `PUT`——那是打 AWS 不是打本專案 API，因此不走 client。

## 4. 設計 token：兩套調色盤

`styles/tokens.ts` 刻意匯出**兩組**顏色：

| 匯出 | 用於 | 代表值 |
|---|---|---|
| `colors` | auth／app 畫面（Zeplin 設計稿） | 標題 `#161616`、邊框 `#dfdfdf` |
| `landingColors` | Landing page（早於設計稿） | 標題 `#000`、邊框 `#e5e5e5` |

**不要合併它們**。兩者的值是真的不同，合併會改變 Landing page 的外觀——那是設計決策，不是重構。

字體同理：Zeplin 使用 **Inter**，透過 `fontFamily` token 套用在 auth／app 畫面；Landing page 沿用系統字體堆疊。

## 5. Session 管理

`context/AuthContext.tsx`：

- **還原時機**：在 `useState` 的 lazy initializer 內還原，而非 module scope。module scope 會在 import 當下就執行一次，導致無法測試、也綁死在 bundle 載入時的 storage 狀態。
- **儲存位置**：`Remember Me` → `localStorage`，否則 `sessionStorage`。所有 storage 存取都包 try/catch（瀏覽器可能封鎖 site data）。
- **載入時驗證**：掛載後呼叫一次 `GET /users/me`，同時確認 token 仍有效並更新使用者資料。網路錯誤不登出，只有 401 才登出。
- **過期處理**：`api/client.ts` 在「有帶 token 卻收到 401」時通知 AuthContext 清除 session。

### 為什麼 401 需要例外機制

後端有些端點的 401 是**業務語意**而非 token 失效：登入帳密錯誤、設定頁的現有密碼錯誤、重設碼錯誤。若一律視為 session 過期，使用者在設定頁打錯密碼就會被登出。

因此 `client.ts` 提供 `handlesUnauthorized: true`，由這些呼叫端自行標記。**狀態碼本身分不出兩者**，所以這是明確的逐點標記而非猜測。

## 6. 上傳流程

```
選檔 → utils/fileValidation 本地驗證（型別、大小）
     → POST /upload/presigned-url（拿到 uploadUrl + fileKey）
     → PUT 直傳 S3
     → POST /resumes 或 POST /users/me/avatar（用 fileKey 建立資源）
```

`accept` 屬性同時列出 media type 與副檔名（`application/pdf,.pdf`）：Windows 以副檔名過濾快得多，且部分系統回報的 `file.type` 為空字串，只靠 media type 會把合法檔案藏起來。

## 7. 已知的後端形狀差異

`Resume` 在後端**沒有** `toJSON: { virtuals: true }`，因此回應只有 `_id` 沒有 `id`。`api/resumes.ts` 的 `normaliseResume` 負責補上，並優先採用後端提供的 `id`——之後後端補上 virtual 時不需再改前端。
