# CareerMate AI 前端工程規範（RULES）

核心精神為 **SOLID、DRY、KISS**。本文件說明「為什麼這樣拆」，`ARCHITECTURE.md` 說明「實際資料夾與資料流長什麼樣子」。

第 8～10 節的 **分支、PR、CI 規範與 `CareerMate-BE` 完全一致**，兩個 repo 請同步遵守。

## 1. SOLID 在本專案的具體落地

### 1.1 SRP（單一職責原則）

- **`api/*.ts`**：只負責 HTTP 與型別轉換。不碰 React state。
- **`context/AuthContext`**：只負責 session 狀態與持久化。不發業務請求。
- **`components/`**：只負責呈現與互動。不知道 API 長什麼樣子。
- **`pages/`**：負責編排——呼叫 api、管理 state、決定顯示哪個狀態。
- **`utils/validators` 與 `utils/fileValidation`**：純函式，不依賴 React。

反例（禁止）：在元件裡 `fetch()`；在 `api/` 裡 `setState`。

### 1.2 OCP（開放封閉原則）

- **新增一個 auth 畫面**：組合既有的 `AuthLayout` + `TextField` + `GradientButton`，不需修改它們。
- **新增一個 Landing 區塊**：新增資料夾 + 使用共用的 `Section`／`SectionContainer`，不動既有區塊。
- 已驗證的例子：`UserMenu` 需要第二種樣式時，加 `variant` prop（`"app"` / `"landing"`），未修改既有行為。

### 1.3 LSP（里氏替換原則）

`PasswordField` 是 `TextField` 的特化，兩者的 props 介面相容（`PasswordFieldProps` 由 `TextFieldProps` 推導）。任何接受 `TextField` 的位置都能換成 `PasswordField`。

### 1.4 ISP（介面隔離原則）

元件 props 只暴露該元件真正需要的東西。例如 `ResumeSidebar` 接收 `resumes`／`uploading`／`uploadError` 等具體資料，而不是接收整個 `Chat` 頁的 state 物件。

### 1.5 DIP（依賴反轉原則）

頁面依賴 `api/*.ts` 匯出的函式簽章，不依賴 `fetch` 或後端的回應形狀。後端 `Resume` 少了 `id` 欄位時，只需改 `api/resumes.ts` 的 `normaliseResume`，所有頁面不受影響——這是這條原則實際救到的一次。

## 2. DRY

| 容易重複的邏輯 | 集中管理位置 |
|---|---|
| 顏色、漸層、字體、控制項尺寸 | `styles/tokens.ts` |
| Landing page 的區塊外殼 | `components/Section` |
| 表單驗證規則 | `utils/validators.ts` |
| 檔案型別與大小限制 | `utils/fileValidation.ts` |
| API 錯誤正規化 | `api/client.ts`，頁面只判斷 `ApiError` |
| 帳號選單與登出流程 | `components/UserMenu` |

> **例外**：`colors` 與 `landingColors` 是**刻意**分開的兩套值，不是重複。理由見 `ARCHITECTURE.md` §4。

## 3. KISS

- 不引入狀態管理函式庫；`AuthContext` + 元件 state 已足夠。
- 不做元件庫抽象層；直接用 styled-components。
- 不提前做對話列表側欄（設計稿沒有）。
- 不為了測試而設計 API（例如不把 storage 包成可注入的介面）——但也不寫出無法測試的 module scope 副作用。

## 4. 命名慣例

- 元件檔案與資料夾：PascalCase（`TextField/TextField.tsx`），每個資料夾附 `index.ts` barrel。
- 工具檔案：camelCase（`fileValidation.ts`）。
- styled-components 變數：描述角色而非樣式（`PanelTitle`，不是 `BigBoldText`）。
- **僅用於樣式的 prop 一律加 `$` 前綴**（transient props，如 `$active`、`$invalid`），避免被轉發到 DOM 產生 React 警告。
- 常數：全大寫加底線（`MAX_RESUME_BYTES`、`ONBOARDING_STEPS`）。

## 5. 樣式規範

1. **視覺狀態盡量綁在 DOM 屬性上**。欄位錯誤用 `&[aria-invalid="true"]` 而非 styled prop——這樣視覺狀態與輔助技術看到的狀態不可能脫鉤。
2. **不要硬編碼顏色**，一律取自 `tokens.ts`。
3. 響應式斷點沿用 `landingLayout.mobile`（768px）與各元件既有的 860／900／1100px，不要再自創新斷點。
4. **不得讓任何功能在窄螢幕完全消失**。需要隱藏時改為抽屜或摺疊（`ResumeSidebar` 是範本）。

## 6. 測試哲學

- **一定要測試**：純邏輯——`utils/validators`、`utils/fileValidation`、`api/client` 的錯誤與 session 過期分支、`api/resumes` 的欄位正規化、`AuthContext` 的儲存與過期行為。
- **建議測試**：有複雜互動的元件（`OtpInput` 的貼上、退格、焦點移動）。
- **不強制測試**：純呈現的元件與樣式，以肉眼與瀏覽器驗證為主。
- 測試檔與被測檔**放在一起**（`validators.ts` 旁邊就是 `validators.test.ts`）。
- 外部請求一律 mock `global.fetch`，測試不得打真實後端。

## 7. 改動 Landing page 的特別規範

Landing page 已經完成且不應該再改變外觀。若因重構而必須動它：

1. 改動前，在瀏覽器對所有元素擷取一份 computed style 與幾何快照。
2. 改動後再擷取一次，逐行比對。
3. **差異必須為 0**，並把這件事寫進 PR。

這個做法已經用過兩次（抽 `Section`、把 CTA 連到 `/register`），兩次都證明了外觀未變。

## 8. 分支命名規範

格式：`<type>/<kebab-case-簡述>`

| 前綴 | 用途 | 範例 |
|---|---|---|
| `feat/` | 新功能 | `feat/chat-wiring`、`feat/landing-auth-state` |
| `fix/` | 修 bug | `fix/resume-upload`、`fix/auth-panel-aspect` |
| `refactor/` | 不改行為的重構 | `refactor/landing-shared-styles` |
| `docs/` | 只動文件 | `docs/project-docs-and-ci` |
| `test/` | 只補測試 | `test/otp-input` |
| `chore/` | 相依套件、設定 | `chore/bump-user-event` |

規則：

- 一律從**最新的 `main`** 開分支（先 `git pull --ff-only`）。
- 分支名用英文小寫加連字號，不用底線、不用中文。
- **一個分支一件事**。
- 分支合併後即刪除。
- 禁止直接 push `main`。

## 9. PR 規範

**標題**：`<type>: <說明>`，英文。

**內文必須包含**：

1. **為什麼**——解決什麼問題。
2. **改了什麼**——重點條列。
3. **怎麼驗證的**——實際跑過的指令與結果、瀏覽器實測了哪些情境。
4. **已知缺口**——相關但這次沒做的事。

其他規則：

- 修 bug 時**附上修復前的實際數據**（例如「1920×1080 下算出 688×1032，原圖比例應為 720×836，水平壓縮 22.6%」），證明問題存在而非推測。
- 動到 Landing page 時，附上 §7 的快照比對結果。
- PR 應小而完整，超過約 400 行 diff 考慮拆分。
- 需要後端先合併時，在 PR 開頭寫明。
- 合併前 CI 必須綠燈。

## 10. CI 規範

CI 設定於 `.github/workflows/ci.yml`，在 push 到 `main` 與所有針對 `main` 的 PR 上執行。

| 檢查 | 指令 | 失敗代表 |
|---|---|---|
| 型別 | `npx tsc --noEmit` | 型別錯誤 |
| 測試 | `npm test`（CI 模式） | 邏輯壞了 |
| 建置 | `npm run build` | 無法產出可部署的產物 |

規則：

- **CI 紅燈不得合併。**
- 建置以 `CI=true` 執行，**警告視同錯誤**——這正是要避免累積無人處理的警告。
- CI 不需要任何真實金鑰；測試全部 mock `fetch`。
