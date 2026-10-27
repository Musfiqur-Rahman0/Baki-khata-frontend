# Baki Khata frontend

Baki Khata is a Bengali-first digital ledger frontend for small businesses in
Bangladesh, including grocery shops, pharmacies, tailors, and other merchants.
It helps shop owners manage customer balances and day-to-day credit/payment
transactions through a responsive web app.

## Production URLs

- **Frontend:** <https://baki-khata-frontend-two.vercel.app/>
- **Backend:** <https://baki-khata-backend.onrender.com/>
- **Backend API base:** <https://baki-khata-backend.onrender.com/api/v1>

## Application features

- Merchant registration and PIN-based login.
- Cookie-based session restoration and access-token refresh.
- Customer ledger and transaction management for authenticated merchants.
- Onboarding checklist with customer creation, quick credit/payment entry, and
  WhatsApp reminder links.
- Local-only onboarding and demo-store experiences for trying the UI without
  writing demo records to the production API.
- AI-assisted transaction entry, backed by the backend AI endpoints.
- Bengali-first interface, responsive layouts, account details/logout dialog,
  toast feedback, and a custom not-found page.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/auth` | Merchant registration and login |
| `/onbording` | Onboarding guide and local demo when signed out; live onboarding actions when signed in |
| `/store` | Authenticated merchant ledger |
| `/demo-store` | Local demo ledger experience |

## Technology

- Next.js App Router, React, and TypeScript.
- Redux Toolkit for client-side auth and feature state.
- Tailwind CSS and reusable UI components.
- Backend HTTP-only cookies for authentication; tokens are not stored in
  frontend local storage.

## Run locally

From the `baki-khata-frontend` directory:

```sh
npm ci
```

Copy `.env.example` to `.env.local`, then configure the API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Start the development server:

```sh
npm run dev
```

Visit <http://localhost:3000>. To verify before deploying:

```sh
npm run lint
npx tsc --noEmit
npm run build
```

## Deploy to Vercel

Configure the Vercel project as follows:

- **Root Directory:** `baki-khata-frontend`
- **Framework Preset:** Next.js
- **Install Command:** `npm install` (or leave the Vercel default)
- **Build Command:** `npm run build` (or leave the Vercel default)

Add this variable to the Vercel **Production** environment:

```env
NEXT_PUBLIC_API_URL=/api/v1
```

The Next.js rewrite proxies `/api/v1/*` requests to the Render API through the
frontend's origin. Keep the API URL same-origin so auth cookies are handled as
first-party cookies rather than third-party cookies. Redeploy after changing
environment variables because `NEXT_PUBLIC_*` values are included in the
frontend build. The frontend does not need the database URL, JWT secret, or
Gemini API key; those belong only in backend environment configuration.

## Reuse this frontend for another project

This repository can be used as a starting point for another merchant ledger
or dashboard app. Treat it as a template and update both the UI and the backend
contract rather than only changing the brand name.

1. **Create a separate copy or repository.** Keep the original project and its
   production environment independent.
2. **Update the product identity.** Change app metadata in `app/layout.tsx`,
   logos and brand assets, Bengali/English copy, colors and theme tokens in
   `app/globals.css`, and any project-specific links.
3. **Set up the matching backend.** The frontend expects the API envelope and
   routes implemented by the companion backend. Review `lib/api/client.ts`
   and the async thunks in `features/` before changing endpoints or response
   types.
4. **Configure the API URL per environment.** Use local backend URLs in
   `.env.local` and the new deployed API base URL in the hosting provider's
   environment settings. Keep `/api/v1` in the value.
5. **Keep auth behavior aligned.** Auth relies on credentialed requests and
   backend-issued HTTP-only cookies. The backend must allow the exact frontend
   origin through credentialed CORS and set secure production cookies.
6. **Adapt the data model and features.** Update the typed API models, Redux
   slices, forms, validation, and screens together when the new backend uses
   different customer, transaction, or merchant fields.
7. **Audit demo and AI behavior.** Demo records should remain clearly labeled
   and isolated from live API writes. AI credentials and AI provider calls must
   stay on the backend, never in `NEXT_PUBLIC_*` variables.
8. **Validate the copied application.** Run lint, type-check, and production
   build; then test registration/login, refresh after reload, logout, customer
   and transaction CRUD, demo isolation, and mobile layouts against the new
   backend.

Before reuse, also review third-party assets, copy, legal text, and deployment
configuration for the new product. Do not reuse production secrets or
customer data.

## Authentication and production cookies

API calls use `credentials: "include"`. Access and refresh tokens are
HTTP-only cookies issued by the backend; JavaScript cannot read them. When an
API request receives `401`, the shared API client attempts `/auth/refresh` and
retries the original request once.

The Vercel rewrite sends API requests through the frontend origin, avoiding
cross-site browser requests to Render. The backend still issues secure,
HTTP-only cookies and should allow the frontend origin with credentialed CORS.
See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment settings and the production
authentication checklist.

## Production checks

1. Open <https://baki-khata-frontend-two.vercel.app/>.
2. Register or sign in, then confirm the app returns to the intended route.
3. Reload a protected page and verify the session restores.
4. Check the browser Network panel for `/api/v1/auth/me`; when access expires,
   verify `/api/v1/auth/refresh` succeeds and the original request retries.
5. Sign out and confirm the session is cleared.
6. Verify demo actions remain local and live merchant operations reach the
   backend.
