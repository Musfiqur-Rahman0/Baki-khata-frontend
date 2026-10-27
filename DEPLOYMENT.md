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

For local development, `.env.local` may use
`NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`.

Redeploy the Vercel project after changing `NEXT_PUBLIC_API_URL`; Next.js
inlines `NEXT_PUBLIC_*` values at build time. The rewrite is compatible with
the current Next.js 16 configuration, including `cacheComponents: true` and
`partialPrefetching: true`; rewrites are handled as request routing and do not
change the app's component caching configuration.

The backend must remain available over HTTPS and allow the deployed frontend
origin through its credentialed CORS configuration.

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
