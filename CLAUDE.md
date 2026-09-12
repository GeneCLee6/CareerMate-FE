# CLAUDE.md — CareerMate-FE

給 Claude Code 的專案指引。開始動工前請先讀 `RULES.md` 與 `ARCHITECTURE.md`。

## 這是什麼

CareerMate AI 的前端。React 19 + TypeScript(strict) + styled-components，Create React App。

後端是另一個 repo（`CareerMate-BE`）。需要後端先合併的改動，要在 PR 開頭寫明。

## 動工前必讀

| 情境 | 先讀 |
|---|---|
| 照設計稿做畫面 | `DESIGN.md`（含實際量到的數值） |
| 加 API 呼叫 | `ARCHITECTURE.md` §3、§5 |
| 動 Landing page | **`RULES.md` §7（必須做快照比對）** |
| 寫測試 | `RULES.md` §6 |
| 開分支、開 PR | `RULES.md` §8–10 |

## 硬性規則

1. **元件裡不得出現 `fetch()`**，一律經過 `api/*.ts`。唯一例外是直傳 S3。
2. **不要合併 `colors` 與 `landingColors`**，兩套值是刻意不同的。
3. **僅用於樣式的 prop 必須加 `$` 前綴**，否則會被轉發到 DOM 產生警告。
4. **改 Landing page 必須做快照比對並在 PR 中證明差異為 0**。
5. **`REACT_APP_*` 會進 bundle**，不得放機密。
6. **不要直接 push `main`**。

## 常見陷阱

- **`getComputedStyle` 透過瀏覽器擴充讀取時可能回傳過期的值**。判斷樣式是否生效，以**截圖**為準；曾因此誤判樣式沒套用。
- **CRA 只在啟動時讀 env**，改 `.env.local` 要重啟。
- **`Resume` 從後端回來沒有 `id` 只有 `_id`**，已由 `api/resumes.ts` 的 `normaliseResume` 處理，不要在頁面層重複繞過。
- **不是所有 401 都代表 session 過期**。登入失敗、現有密碼錯誤、驗證碼錯誤都會回 401，這些呼叫必須帶 `handlesUnauthorized: true`，否則使用者會被誤登出。
- **`accept` 要同時列 media type 與副檔名**（`application/pdf,.pdf`）。只寫 media type 在 Windows 上會很慢，且部分系統 `file.type` 為空字串導致合法檔案被藏起來。
- **圖片縮放不要混用 `height: 100%` 與 `max-width`**，會被拉變形。見 `DESIGN.md` §5。

## 開發指令

```bash
npm start                    # :3000
npx tsc --noEmit             # 型別
CI=true npm test             # 測試（單次）
CI=false npm run build       # 建置（本機容忍警告）
```

指向本機後端時：`REACT_APP_API_BASE_URL=http://localhost:3000/v1 npm start`

## 目前的已知缺口

見 `PRD.md` §6。最擋路的是**忘記密碼實際不可用**——前端流程完整，但後端從未把驗證碼寄出。
