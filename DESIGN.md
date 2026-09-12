# CareerMate AI 設計系統（DESIGN）

設計稿來源：Zeplin 專案 **CareerMate AI**。本文件記錄從設計稿量到的實際數值，讓實作不必每次回去查。

## 0. 一個重要前提：這個專案有兩套視覺語言

| | Landing page | Auth / App 畫面 |
|---|---|---|
| 來源 | 原始靜態網站（早於 Zeplin） | Zeplin 設計稿 |
| 字體 | 系統字體堆疊 | **Inter** |
| 標題色 | `#000` | `#161616` |
| 邊框色 | `#e5e5e5` | `#dfdfdf` |
| token 匯出 | `landingColors` | `colors` |

**這不是不一致的疏漏，是刻意保留的現狀。** 合併兩套會改變 Landing page 外觀，屬於設計決策而非重構。

## 1. 字體

**Inter**，由 `public/index.html` 的 Google Fonts 載入，權重 400／500／600／700／900。

透過 `tokens.ts` 的 `fontFamily` 套用，**僅用於 auth／app 畫面**，Landing page 不套。

| 用途 | 大小 | 權重 | 色 |
|---|---|---|---|
| Register 主標題 | 40px | 900 | `#161616` |
| Login 主標題 | 40px | 400 | `#161616` |
| Landing hero 標題 | 60px | 900 | `#161616` |
| Landing 區塊標題 | 32px | 700 | `#060606` |
| 內文 | 15–20px | 400 | `#161616` / `#898989` |
| 按鈕文字 | 16px | 500–700 | |

> Register 用 900、Login 用 400 是設計稿本來就不同，不是筆誤。

## 2. 顏色

### Auth／App（`colors`）

| Token | 值 | 用途 |
|---|---|---|
| `text` | `#161616` | 主要文字 |
| `textMuted` | `#898989` | 副標題 |
| `label` | `#595959` | 欄位標籤 |
| `placeholder` | `#b5b5b5` | 提示文字 |
| `border` | `#dfdfdf` | 欄位邊框 |
| `borderFocus` | `#504ffd` | 聚焦 |
| `link` | `#2f6bff` | 連結 |
| `danger` | `#ff3232` | 錯誤 |
| `dangerSurface` | `#ffeaea` | 錯誤橫幅底色 |
| `warning` | `#ffa726` | 警告圖示 |
| `toast` | `#3e3e3e` | toast 底色 |

### Landing（`landingColors`）

`heading` `#000`、`body` `#333`、`muted` `#666`、`surfaceSubtle` `#f5f5f5`、`surfaceCard` `#f5f5f7`、`surfaceContact` `#f9fafc`、`surfaceFooter` `#fafafa`、`border` `#e5e5e5`。

### 漸層

```
primary  linear-gradient(110deg, #504ffd 11%, #40c3fb 92%)   主要按鈕、結尾 CTA
card     linear-gradient(137deg, #504ffd 6%, #40c3fb 96%)    解決方案卡片
hero     linear-gradient(180deg, #fafafa 0%, #ffffff 100%)   hero 背景
```

## 3. 控制項尺寸（Zeplin 量測）

| 元件 | 尺寸 | 圓角 |
|---|---|---|
| 表單欄位 | 440 × 48 | 24px（膠囊） |
| 主要按鈕 | 440 × 48 | 24px |
| Hero 按鈕 | 183 × 52 | 26px |
| 設定頁欄位 | 寬度自適應 × 48 | **10px**（比 auth 柔和） |
| 驗證碼格 | 48 × 56 | 12px |
| Landing 問題卡 | 540 × 120 | 32px |

auth 表單欄寬 440px，在 1440 寬的設計稿中置中於左半部（x=144）。

## 4. 版面

| 畫面 | 結構 |
|---|---|
| Auth | 左表單（440px 置中）／右插圖（712px 欄） |
| Onboarding | 左進度軌（320px）／右內容置中 |
| App（首屏） | 左履歷欄（268px）／右對話區 |
| Settings | 頂部 header ＋ 內容置中（1000px）＋ 左分頁（235px） |
| Landing | 區塊滿版，內容 1400px 或 1200px 置中 |

### 響應式斷點

| 斷點 | 行為 |
|---|---|
| 1100px | Auth 右側插圖隱藏 |
| 900px | Onboarding 改單欄 |
| 860px | **履歷側欄改為抽屜**（不是隱藏） |
| 800px | Settings 分頁改單欄 |
| 768px | Landing 雙欄區塊改單欄 |

## 5. 右側插圖

`src/assets/auth-panel.png`（720 × 836，1x）——設計師匯出的整塊面板，含波浪背景、SUBSCRIBE 標籤、使用者評價卡與兩張玻璃卡。

**縮放方式必須維持比例**：

```css
width: auto;  height: auto;
max-width: 100%;  max-height: calc(100vh - 48px);
```

> **不要**寫成 `height: 100%` + `width: auto` + `max-width: 100%`。`max-width` 會夾住寬度但不回頭調整高度，導致圖片被垂直拉長——1920×1080 下曾水平壓縮 22.6%。

## 6. 元件狀態

每個表單畫面都需實作設計稿的全部狀態，不只 happy path：

| 狀態 | 呈現 |
|---|---|
| 預設 | |
| 聚焦 | 邊框轉 `borderFocus` ＋ 淡光暈 |
| 錯誤 | 邊框轉 `danger`，由 `aria-invalid="true"` 驅動 |
| 錯誤橫幅 | `dangerSurface` 底、`danger` 字、圓角 8px |
| 網路錯誤 | 橫幅前加 🔌 |
| 載入中 | 按鈕文字改為進行式並 disable |
| 成功 | 藍色勾圈 ＋ 訊息 |
| Toast | 深色膠囊，頁面上方置中 |

## 7. 已知與設計稿的差異

| 項目 | 設計稿 | 目前實作 | 原因 |
|---|---|---|---|
| 結尾 CTA 文案 | `Start Practicing for Free` | `Start Practingcing for Free` | 沿用原始靜態網站錯字，經確認暫不改 |
| 頁尾年份 | 2025 | 2026 | 同上 |
| Landing 整體 | Inter、`#f9fafc` 卡片、32px 圓角 | 系統字體、`#f5f5f5`、12px 圓角 | Landing page 早於設計稿，經確認維持現狀 |
