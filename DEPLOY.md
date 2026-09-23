# CareerMate AI — Frontend Deployment Guide

The backend repository carries its own `DEPLOY.md`; the two reach the same
conclusions. This one covers the frontend.

## 1. Recommended: Cloudflare Pages

| Setting | Value |
| --- | --- |
| Build command | `npm ci --legacy-peer-deps && npm run build` |
| Build output | `build` |
| Node version | 20 |

**An SPA fallback is required**: every path must serve `index.html`, or
entering `/login` or `/app` directly returns 404. Cloudflare Pages does this
automatically: when the build has no top-level `404.html` (a CRA build has
none), it treats the site as a single-page application and serves the root
for every path. Nothing needs adding — just do not add a `404.html`.

On Netlify, which does not do this, add `public/_redirects` containing:

```
/*  /index.html  200
```

## 2. Platforms compared

| Platform | Strengths | Weaknesses | Fit |
| --- | --- | --- | --- |
| **Cloudflare Pages** | Unmetered bandwidth; global CDN; the most generous free tier | Monthly build cap | ✅ **Recommended** |
| **Vercel** | Best developer experience; useful preview deployments | Free tier restricts commercial use; bandwidth overage is billed | ✅ Workable |
| **Netlify** | Feature-complete | 100 GB/month bandwidth is comparatively tight | 🟡 Workable |
| **GitHub Pages** | Entirely free | SPA routing needs a hack; no environment variables | ❌ Not advised |

All three serve a CRA build without trouble. The only reason to prefer
Cloudflare Pages is that bandwidth is not metered.

> **Do not put the backend on a Vercel or Cloudflare Workers serverless
> function.** An AI reply can take tens of seconds, beyond the free tiers'
> execution limits. The reasoning is in the backend's `DEPLOY.md` §3.

## 3. Environment variables

`REACT_APP_*` values are **compiled into the JavaScript bundle** and are
visible to anyone with DevTools open. **Never put a real secret there.**

| Variable | Required | Notes |
| --- | --- | --- |
| `REACT_APP_API_BASE_URL` | ✅ | The backend URL, **including `/v1`**. Defaults to `http://localhost:3000/v1` |
| `REACT_APP_EMAILJS_PUBLIC_KEY` | ❌ | Contact form. An EmailJS public key is designed to be public |
| `REACT_APP_EMAILJS_SERVICE_ID` | ❌ | |
| `REACT_APP_EMAILJS_TEMPLATE_ID` | ❌ | |

With EmailJS unconfigured, the contact form logs its payload to the console
instead of failing, so local development is unaffected.

**CRA reads environment variables only at start-up**, so restart the dev
server after editing `.env.local`.

## 4. Pre-launch checklist

- [ ] `REACT_APP_API_BASE_URL` points at the production backend, including
      `/v1`
- [ ] SPA fallback configured — entering `/login` directly does not 404
- [ ] The backend's `cors()` allows the production frontend domain
- [ ] S3/R2 CORS `AllowedOrigins` includes the production frontend domain, or
      uploads fail
- [ ] EmailJS has allowed domains configured, so the quota cannot be used by
      someone else
