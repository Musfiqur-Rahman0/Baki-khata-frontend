# Production deployment

## Vercel

Configure the frontend Vercel project with:

- **Root Directory:** `baki-khata-frontend`
- **Framework Preset:** Next.js
- **Production environment variable:** `NEXT_PUBLIC_API_URL=/api/v1`

`next.config.ts` proxies requests matching `/api/v1/:path*` to
`https://baki-khata-backend.onrender.com/api/v1/:path*`. Keep the production
API URL relative (`/api/v1`): browser requests then remain on the frontend
origin, and authentication cookies are first-party instead of cross-site.

For local development, keep `.env.local` set to
`NEXT_PUBLIC_API_URL=/api/v1`; the Next.js development rewrite proxies requests
to `http://localhost:5000`. This same-origin URL is required for the service
worker to queue transactions while offline.

If running a local production server with `npm start`, set
`API_ORIGIN=http://localhost:5000` in `.env.local` as well. `next start` runs
with `NODE_ENV=production`, so this override keeps its API rewrite pointed at
the local backend instead of the production backend. Do not set this override
in the Vercel production environment.

Redeploy the Vercel project after changing `NEXT_PUBLIC_API_URL`; Next.js
inlines `NEXT_PUBLIC_*` values at build time. The rewrite is compatible with
the current Next.js 16 configuration, including `cacheComponents: true` and
`partialPrefetching: true`; rewrites are handled as request routing and do not
change the app's component caching configuration.

The backend must remain available over HTTPS and allow the deployed frontend
origin through its credentialed CORS configuration.

## Offline support

The production service worker caches the app shell, Next.js static assets, the
manifest and icons, plus the signed-in user's customer and transaction GET
responses. Private cached data is cleared after successful logout and when a
different account is detected. Cached responses and queued writes are stored
in the browser's Cache Storage and IndexedDB and are available only on devices
where they were previously loaded or entered.

Creating a transaction for an already-synced customer while offline adds it to
the local outbox and marks it as waiting to sync. The outbox retries when the
connection returns; server-side idempotency keys prevent a retry from
duplicating a transaction. New customer creation still requires a connection.
Offline queued transactions do not send SMS or WhatsApp messages before they
are synced.

Before deploying the backend update, apply the transaction idempotency
migration with `npx prisma migrate deploy` from `baki-khata-backend`. Deploy the
backend before deploying the frontend. Keep `NEXT_PUBLIC_API_URL=/api/v1` in
production so authenticated API requests are same-origin and can be handled by
the service worker. Offline support is enabled in production builds; test it
after deployment by loading the store and customer data online, then switching
the browser to offline mode.

## Authentication smoke test

Run these checks against the production deployment after redeploying:

1. Register a test account and verify the authenticated page opens.
2. Log out, log back in, then reload `/store`; verify the user session is
   restored.
3. Let the access token expire, or use a controlled test account/session, and
   verify `/api/v1/auth/refresh` succeeds and the failed API request retries.
4. Log out and verify `/store` no longer remains authenticated after reload.
5. Confirm the browser Network panel shows API requests to the frontend
   `/api/v1/*` origin, not direct requests to the Render hostname.
6. Repeat registration/login, reload, refresh, and logout checks in real
   iPhone Safari and Android Chrome, both in the browser and after adding the
   app to the home screen.

The physical-device and installed-PWA checks must be performed on the release
build; they cannot be established by a local build alone.
