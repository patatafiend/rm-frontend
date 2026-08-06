# rm-frontend — OneHR Portals

## 1. Overview

`app/page.tsx` is the portal switcher — once a user is authenticated it
presents three entry points:

| Portal | Route group | Landing route | Backend system key |
|---|---|---|---|
| Requirements Monitoring | `(ermp)` | `/dashboard` | `rm` |
| Analytics Portal | `(ap)` | `/analytics` | `analytics` |
| Performance Appraisal Portal | `(pam)` | `/appraisals` | `appraisals` |

Users can reach a portal two ways:
1. **Direct login** — `/login` against the backend's `/auth/login`.
2. **SSO handoff** — an external host app redirects to the backend's
   `GET /api/v1/auth/authorize`, which 302s to this app's `/external` route
   with a pre-scoped token (see [§5.3](#53-external-sso-handoff)).

---

## 2. Tech stack

| Concern | Library |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| ⚠️ | This Next.js version has **breaking changes** vs. training-data knowledge — see `AGENTS.md` / `node_modules/next/dist/docs/` before assuming API behavior |
| Styling | Tailwind CSS v4, `tailwindcss-animate` / `tw-animate-css` |
| UI components | shadcn/ui on top of Radix primitives (`radix-ui`), `components/ui/*` |
| Icons | `lucide-react`, `@hugeicons/react` |
| Server state | TanStack Query v5 (`@tanstack/react-query`) |
| Client state | Zustand (with `persist` middleware for auth) |
| Forms | TanStack Form + `@tanstack/zod-form-adapter` |
| HTTP client | Axios (`lib/api/client.ts`), custom interceptors |
| Charts | Recharts |
| Misc | `jspdf` + `html2canvas` (PDF export), `xlsx` (spreadsheet export), `date-fns` |
| Package manager | Bun (`bun.lock` present) — `npm`/`package-lock.json` also present, both work |

---

## 3. Project structure

```
app/
├── layout.tsx, page.tsx        # root layout + portal switcher landing page
├── globals.css
├── api/config/route.ts          # GET → { apiUrl } read from process.env.API_URL
├── (auth)/                      # unauthenticated routes, shared centered layout
│   ├── login/                    # login + MFA sub-flow
│   ├── forgot-password/
│   └── external/                 # consumes SSO token from backend /authorize redirect
├── (ermp)/                      # Requirements Monitoring portal, sidebar layout
│   ├── dashboard/                 # employee list (ERMP "Dashboard" workspace)
│   └── admin/                     # user-list (CRUD), user-roles (RBAC) — "Admin" workspace
├── (pam)/                       # Performance Appraisal portal, sidebar layout
│   └── appraisals/                # table + per-employee PDF export route
└── (ap)/                        # Analytics portal, sidebar layout
    └── analytics/                  # funnel/status/time/trend dashboard

systems/                        # portal-specific business logic, mirrors app/ route groups
├── ermp/{components,hooks,lib/api,store}/admin/...
├── pam/{components,hooks,lib/api,store,types}/
└── ap/{components,hooks,lib/api,store}/

lib/
├── api/{client.ts, config.ts, auth.ts}   # shared axios instance, /api/config fetcher, auth calls
├── types.ts                               # shared TS types (User, LoginRequest, etc.)
└── utils/{errors.ts, requirements.ts}

hooks/
├── auth/         # useLogin, useLogout, useRegister, useForgotPassword, useMfa
├── form/
└── use-mobile.ts

store/auth.store.ts             # global Zustand auth store (persisted to localStorage)
components/
├── ui/            # shadcn/radix primitives (button, sidebar, dialog, table, ...)
├── form/
└── sidebar-user-footer.tsx     # shared footer used by all three portal sidebars

providers/query-provider.tsx    # TanStack Query client provider
scripts/deploy.ps1              # build → standalone bundle → scp/ssh → PM2 reload on EC2
```

Each portal under `systems/` is intentionally self-contained: its own
`lib/api/*.ts` (axios calls against one resource), `hooks/*.ts` (TanStack
Query wrappers), `store/*.ts` (Zustand UI/filter state), and `components/*`.
Only truly cross-portal pieces (`components/ui`, the auth store, the base
axios client) live at the top level.

---

## 4. Getting started

### Prerequisites
- Node.js 20+ (or Bun, which the project is set up for)
- A running instance of `rm-backend`

### Install

```bash
bun install
# or: npm install
```

### Configure environment

The app resolves its backend base URL **at runtime** through an internal
API route rather than a build-time `NEXT_PUBLIC_*` var:

```bash
# .env.local
API_URL=http://localhost:8000
```

`app/api/config/route.ts` exposes this as `GET /api/config → { apiUrl }`.
`lib/api/config.ts#getApiUrl()` fetches and caches it client-side, and
`lib/api/client.ts` injects `${apiUrl}/api/v1` as the axios `baseURL` on the
first request. This indirection means `API_URL` can be changed without a
rebuild (only a server restart) since it's read server-side per-request via
`process.env`, not inlined at build time.

### Run the dev server

```bash
bun run dev
# or: npm run dev
```

App runs at `http://localhost:3000`.

### Build / production

```bash
npm run build     # next build (output: "standalone", see next.config.ts)
npm run start      # next start
npm run start:standalone   # bun .next/standalone/server.js — for the standalone bundle
```

### Lint

```bash
npm run lint
```

---

## 5. Authentication

### 5.1 Auth store (`store/auth.store.ts`)

A single Zustand store, persisted to `localStorage` under `auth-storage`:

```ts
{ accessToken, refreshToken, user, setTokens(), setUser(), clear() }
```

This is the single source of truth for auth state across all three portals
— there's no per-portal auth state.

### 5.2 API client (`lib/api/client.ts`)

An Axios instance shared by the top-level `lib/api/auth.ts` and by each
portal's own `lib/api` module (`systems/*/lib/api/client.ts` — check
whether these re-export the shared client or instantiate their own when
extending a portal's API layer):

- **Request interceptor:** lazily resolves `baseURL` via `getApiUrl()`
  (cached after first call) and attaches `Authorization: Bearer <accessToken>`
  from the auth store.
- **Response interceptor:** on a `401` (and not already retried), it
  transparently calls `POST /auth/refresh-token`, updates the store via
  `setTokens`, retries the original request, and **queues** any other
  requests that 401 while a refresh is already in flight (`isRefreshing` /
  `failedQueue`) so only one refresh call happens at a time. If there's no
  refresh token, or the refresh call itself fails, it clears the store and
  hard-redirects to `/login`.
- All other errors are normalized through `lib/utils/errors.ts#getErrorMessage`,
  which unwraps FastAPI's `{detail: "..."}` shape (and a few other common
  shapes) into a plain `Error`.

### 5.3 External SSO handoff

`app/(auth)/external/page.tsx` handles the redirect target of the backend's
`GET /api/v1/auth/authorize` (see backend docs §5.2):

1. Reads `token` and `redirect` from the query string.
2. If `token` is missing, bounces to `/login?error=missing_token`.
3. Otherwise, does a single atomic `useAuthStore.setState({ accessToken:
   token, refreshToken: null, user: null })` — deliberately not going
   through `clear()` first, to avoid a flash of "logged out" state — then
   replaces the route to `redirect` (e.g. `/dashboard`, `/analytics`, or
   `/appraisals`).

Because `refreshToken` is `null` for these sessions, once the external
token expires the user is redirected to `/login` by the response
interceptor rather than silently refreshed — external sessions are
intentionally short-lived and scoped to whatever `allowed_bus` /
`allowed_categories` were baked into the token at mint time.

### 5.4 MFA

`hooks/auth/useLogin.ts`: if `login()` returns `{mfa_required: true,
mfa_token}`, the token is stashed in `sessionStorage` and the user is routed
to an MFA challenge step before tokens are ever written to the auth store.

---

## 6. Portals

### 6.1 Requirements Monitoring (`(ermp)`)

Sidebar (`systems/ermp/components/sidebar.tsx`) toggles between two
workspaces via a dropdown (visible/enabled only for admin account types):

- **Dashboard workspace** → `/dashboard/employee-list` — the employee
  requirements table (missing major/minor document tracking), backed by
  `systems/ermp/hooks/admin/useEmployeeRequirements.ts` and
  `useEmployeeRequirementsFilter.ts`, hitting
  `GET /employee-requirements` on the backend.
- **Admin workspace** → `/admin/user-list` (with `[id]`, `[id]/edit`,
  `create` sub-routes) and `/admin/user-roles` — full user + role/permission
  management UI (`useUsers.ts`, `useRoles.ts`), backed by the backend's
  `/users`, `/roles`, `/permissions` routers.

Key components: `employee-requirements-table.tsx`,
`-filters.tsx`, `-pagination.tsx`, `-drawer.tsx` (detail view),
`company-requirements-pie-chart.tsx` / `-summary.tsx` (completeness
breakdown by company), `role-form-dialog.tsx`, `role-permissions-modal.tsx`,
`users-list-table.tsx` / `-filters.tsx` / `-pagination.tsx` / `-stats.tsx`.

### 6.2 Performance Appraisal Portal (`(pam)`)

Single route, `/appraisals`, listing probationary appraisal records with
tabs (`appraisal-tabs.tsx`) presumably mirroring backend `appraisal_status`
values (Pending / For Regularization / Regularized / Non-Regularized / Needs
Review). Supporting components:

- `appraisal-table.tsx`, `appraisal-badge.tsx` (status pill), `appraisal-drawer.tsx` (record detail)
- `appraisal-decision-form.tsx` — submits 3rd/5th-month or extension decisions
- `appraisal-history.tsx` — renders `extension_records` history
- `upload/appraisal-upload.tsx` + `hooks/useUploadUrl.ts` — requests a
  presigned S3 URL from the backend, then uploads the file directly to S3
- `hooks/useAppraisals.ts`, `useAppraisalDetail.ts`, `useSubmitDecision.ts`
- `components/papdf.tsx` + `app/(pam)/appraisals/[employee_id]/pdf/page.tsx`
  — per-employee PDF export (via `jspdf`/`html2canvas`)

### 6.3 Analytics Portal (`(ap)`)

Single route, `/analytics`, a hiring-pipeline dashboard consuming the
backend's `/analytics/*` endpoints via `systems/ap/lib/api/analytics.ts` and
`hooks/useAnalytics.ts`:

- `hiring-funnel-chart.tsx` ↔ `GET /analytics/funnel`
- `status-bar-chart.tsx` ↔ `GET /analytics/status-counts`
- `time-metrics-chart.tsx` ↔ `GET /analytics/time-metrics`
- `weekly-trend-chart.tsx` ↔ `GET /analytics/weekly-trend`
- `raw-data-table.tsx` ↔ `GET /analytics/raw`
- `data-quality-banner.tsx` — surfaces the `meta.data_quality_flags` block
  every backend analytics response includes

---

## 7. State management conventions

- **Server state** (anything from the API) → TanStack Query, via one hook
  per resource under each portal's `hooks/` directory. Query keys, caching,
  and mutation-driven invalidation live entirely in these hooks — components
  stay presentational.
- **Client/UI state** (filters, pagination, selected tab, etc.) → Zustand
  stores per portal (`employee-requirements.store.ts`, `users.store.ts`,
  `appraisals.store.ts`, `analytics.store.ts`), separate from the global
  `auth.store.ts`.
- **Auth state** → the one global `store/auth.store.ts`, shared by every
  portal.

---

## 8. Deployment

`next.config.ts` sets `output: "standalone"`. `scripts/deploy.ps1`
(PowerShell — Windows-oriented deploy tooling) automates a full release:

1. `bun run build` locally.
2. Verifies `.next/standalone/server.js` exists.
3. Assembles a `release/standalone/` folder containing the standalone
   server, `public/`, and `.next/static/`.
4. `tar`s it to `standalone.tar.gz`.
5. `scp`s it to an EC2 host (`ec2-user@13.212.196.15`,
   `/home/ec2-user/workspace/requirements-monitoring/standalone-build`) —
   set `DEPLOY_SSH_KEY` to your private key path.
6. Extracts remotely and reloads via **PM2**
   (`pm2 startOrReload ecosystem.config.js --env production`).

Run via `npm run deploy` (wraps the PowerShell script — requires `pwsh`/
Windows PowerShell on the machine running the deploy).

> The target host and path are hardcoded in the script; update them if
> deploying to a different environment.
