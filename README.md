# Social Media Post Creator

A hosted web app wrapper around the existing HTML/CSS/JS post creator UI.
Adds:

- **Password gate** — single shared password, HMAC-signed cookie session, HTTP-only.
- **Server-side proxy** for Google Sheets and the three n8n webhooks, so the upstream URLs and any credentials never reach the browser.
- **Vercel-ready** deploy.

## Stack

- Next.js 15 (App Router) + TypeScript
- Edge middleware for the auth gate
- Node runtime for API routes (so they can talk to your n8n host)

## Project layout

```
app/
  layout.tsx                 root HTML, loads /styles.css
  page.tsx                   server-rendered post-creator UI; loads /script.js
  logout-button.tsx          client component, posts to /api/auth/logout
  login/page.tsx             password entry form
  api/
    auth/login/route.ts      validates password, sets session cookie
    auth/logout/route.ts     clears session cookie
    sheets/route.ts          GET proxy → SHEETS_WEBAPP_URL
    n8n/text/route.ts        POST proxy → N8N_TEXT_WEBHOOK
    n8n/image/route.ts       POST proxy → N8N_IMAGE_WEBHOOK
    n8n/publish/route.ts     POST proxy → N8N_PUBLISH_WEBHOOK
lib/
  auth.ts                    HMAC session helpers (Web Crypto)
  proxy.ts                   shared upstream-forwarding helper
middleware.ts                redirects unauth'd traffic to /login
public/
  styles.css                 original stylesheet
  script.js                  original client logic with URLs rewired to /api/*
```

## Environment variables

Copy `.env.example` → `.env.local` for local dev. On Vercel, set the same vars in **Project Settings → Environment Variables**.

| Var | What it is |
| --- | --- |
| `APP_PASSWORD` | Shared password the user types on `/login`. |
| `AUTH_SECRET` | Random secret used to sign session cookies. Generate with `openssl rand -hex 32`. |
| `SHEETS_WEBAPP_URL` | The Google Apps Script `/exec` URL that returns spreadsheet rows. |
| `N8N_TEXT_WEBHOOK` | n8n webhook for text generation. |
| `N8N_IMAGE_WEBHOOK` | n8n webhook for media generation. |
| `N8N_PUBLISH_WEBHOOK` | n8n webhook for publishing posts. |

## Local development

```
npm install
npm run dev
# open http://localhost:3000  → redirects to /login
# sign in with APP_PASSWORD from .env.local
```

## Deploy to Render

The repo includes a `render.yaml` blueprint that pre-configures everything except the secret env var values.

1. Push this directory to a Git repo (already done if you're following the setup).
2. Go to **https://dashboard.render.com/blueprints** and click **New Blueprint Instance**.
3. Connect your GitHub account (if not already connected) and select the `social-media-post-creator` repo.
4. Render reads `render.yaml` and shows the service it will create. Click **Apply**.
5. On the next screen, fill in the **secret** environment variables:
   - `APP_PASSWORD` — what users type on `/login`
   - `AUTH_SECRET` — `openssl rand -hex 32`
   - `SHEETS_WEBAPP_URL` — your Google Apps Script `/exec` URL
   - `N8N_TEXT_WEBHOOK`, `N8N_IMAGE_WEBHOOK`, `N8N_PUBLISH_WEBHOOK` — your three n8n webhook URLs
6. Click **Create New Resources**. First build takes ~3–5 minutes.
7. Once deployed, Render gives you a `*.onrender.com` URL. Visit it; you should see `/login`.

To rotate the password, change `APP_PASSWORD` in **Environment → Edit** and the service auto-redeploys. Existing sessions stay valid until they expire (7 days). Change `AUTH_SECRET` instead if you want to invalidate them all immediately.

### Plan notes

`render.yaml` sets `plan: starter` ($7/mo). This keeps the instance always-on. If you want the free tier instead, change `plan: starter` → `plan: free` and redeploy — but be aware the free tier spins down after 15 min of inactivity, causing a ~30s cold start on the next request. Free tier is fine for occasional testing, painful for daily use.

### Long-running requests

The n8n image-generation request can take 60–100s. Render's web services have no fixed request timeout, so this works, but the connection stays open the whole time. If you ever see truncated responses or `504` errors from Render's proxy, the right fix is to switch to async polling (n8n returns immediately with a job id; UI polls a status endpoint).

## How the auth flow works

1. Unauthenticated request to any non-public path → middleware redirects to `/login?next=<original>`.
2. `/login` POSTs the password to `/api/auth/login`.
3. `/api/auth/login` compares the password (timing-safe) and, if it matches, returns a `Set-Cookie: smpc_session=…; HttpOnly; SameSite=Lax; Secure` with an HMAC-signed `v1.<expiresAt>.<sig>` token.
4. Subsequent requests carry the cookie. Middleware verifies the HMAC and expiry. API routes inherit the same gate.

The session token is signed, not encrypted — it contains only a version tag and expiry timestamp, no user info.

## How the proxy works

The browser only ever talks to `/api/sheets`, `/api/n8n/text`, `/api/n8n/image`, `/api/n8n/publish`. Each of those calls `fetch()` server-side to the upstream URL stored in env vars, then streams the response back. Result: the actual Google Apps Script URL and your n8n endpoints are not visible in the browser's network tab and not embeddable from another origin (the middleware password gate still applies).

## Customising

- **Change the password gate to per-user auth later:** swap `lib/auth.ts` for NextAuth.js. The middleware contract (`verifySessionToken`) is the only thing the rest of the app cares about.
- **Tweak the UI:** edit `public/script.js` and `public/styles.css` directly — they're the same files you started with.
- **Session lifetime:** change `SESSION_TTL_MS` in `lib/auth.ts` (default 7 days).
