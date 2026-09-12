# CareerMate AI 前端部署指南（DEPLOY）

後端另有一份 `DEPLOY.md`，兩者結論一致。本文件聚焦前端。

## 1. 推薦：Cloudflare Pages

| 設定 | 值 |
|---|---|
| Build command | `npm ci --legacy-peer-deps && npm run build` |
| Build output | `build` |
| Node version | 20 |

**必須設定 SPA fallback**：把所有路徑導向 `index.html`，否則直接輸入 `/login`、`/app` 會 404。在 `public/` 放一個 `_redirects` 檔：

```
/*  /index.html  200
```

## 2. 平台比較

| 平台 | 優點 | 缺點 | 適合？ |
|---|---|---|---|
| **Cloudflare Pages** | 流量不計費；全球 CDN；免費額度最寬鬆 | 每月建置次數有限 | ✅ **推薦** |
| **Vercel** | DX 最佳；預覽部署好用 | 免費方案對商業用途有限制；流量超額要付費 | ✅ 可用 |
| **Netlify** | 功能完整 | 免費頻寬 100GB/月，相對緊 | 🟡 可用 |
| **GitHub Pages** | 完全免費 | SPA 路由需 hack；無環境變數機制 | ❌ 不建議 |

三者對 CRA 靜態產物都沒問題。選 Cloudflare Pages 的唯一理由是流量不計費。

> **後端不要放 Vercel／Cloudflare Workers 的 serverless function**：AI 回覆可能耗時 10–60 秒，會超過免費方案的執行時間上限。理由詳見後端的 `DEPLOY.md` §3。

## 3. 環境變數

`REACT_APP_*` 會被**編譯進 JS bundle**，使用者可在 DevTools 看到。**絕不放任何真正的機密。**

| 變數 | 必填 | 說明 |
|---|---|---|
| `REACT_APP_API_BASE_URL` | ✅ | 後端網址，**含 `/v1`**。未設定時預設 `http://localhost:3000/v1` |
| `REACT_APP_EMAILJS_PUBLIC_KEY` | ❌ | 聯絡表單。EmailJS 的 public key 本就設計為公開 |
| `REACT_APP_EMAILJS_SERVICE_ID` | ❌ | |
| `REACT_APP_EMAILJS_TEMPLATE_ID` | ❌ | |

EmailJS 未設定時，聯絡表單會把內容印到 console 而不報錯，本機開發不受影響。

**CRA 只在啟動時讀取環境變數**，改 `.env.local` 後必須重啟 dev server。

## 4. 上線前檢查清單

- [ ] `REACT_APP_API_BASE_URL` 指向正式後端（含 `/v1`）
- [ ] SPA fallback 已設定，直接輸入 `/login` 不會 404
- [ ] 後端的 `cors()` 已允許前端正式網域
- [ ] S3／R2 的 CORS `AllowedOrigins` 已加入前端正式網域，否則上傳會失敗
- [ ] EmailJS 後台已設定 allowed domains，避免額度被盜用
