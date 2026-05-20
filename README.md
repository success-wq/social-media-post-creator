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

## Deploy to Vercel

1. Push this directory to a Git repo (GitHub/GitLab/Bitbucket).
2. In Vercel, click **Add New → Project**, import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Add the six environment variables listed above under **Environment Variables**.
5. Click **Deploy**. First deploy takes ~1 minute.
6. Visit your deployment URL, sign in with `APP_PASSWORD`.

To rotate the password, change `APP_PASSWORD` in Vercel and redeploy (or trigger a redeploy from the dashboard). Existing sessions stay valid until they expire (7 days); change `AUTH_SECRET` instead if you want to invalidate them all immediately.

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
