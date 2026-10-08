# Dialer Management Portal

Operations console for managing dialer companies — their servers, charges,
renewal dates, monthly billing and a full attributed audit trail.

- `frontend/` — Next.js 15 (App Router) + React 19 + Tailwind v4 + TanStack Query
- `backend/` — Express 5 + Mongoose (MongoDB) + JWT auth with role/permission checks

---

## Running it

Two processes. **Port 3000 is occupied by another project on this machine**, so
the frontend runs on **3001**.

### 1. Backend (API on :5000)

```powershell
cd backend
npm run dev
```

### 2. Frontend (app on :3001)

```powershell
cd frontend
npm run dev -- -p 3001
```

Open **http://localhost:3001** — you are redirected to `/login`.

---

## Database

`backend/.env` currently holds an Atlas connection string whose credentials are
**rejected by the server** (`bad auth : Authentication failed`). Until that
string is replaced, the API starts normally but every data route returns
**503** — this is deliberate and reported clearly rather than hanging.

### Option A — use your own cluster (recommended for real data)

Put a working connection string in `backend/.env` and restart the backend:

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
```

Grant the connecting IP access in Atlas → Network Access. `ALLOWED_IPS` in
`backend/.env` separately restricts which client addresses may call the API.

### Option B — run a local development database

A self-contained MongoDB (no system install, no Docker) is available at
`F:\Fullstack\.dsh-mongo`:

```powershell
cd F:\Fullstack\.dsh-mongo
node serve-mongo.mjs           # serves mongodb://127.0.0.1:27017/dialer
```

Then start the backend against it **without editing `.env`** (a real environment
variable takes precedence over the file):

```powershell
cd backend
$env:MONGO_URI='mongodb://127.0.0.1:27017/dialer'; npm run dev
```

### Seeding the local database

```powershell
cd backend
$env:MONGO_URI='mongodb://127.0.0.1:27017/dialer'; node _seed-dev.mjs
```

The script **refuses to run against any non-local host**, so it can never touch
production data. It creates 16 permissions, the `admin` and `manager` roles,
two users and five sample companies.

| Account | Email | Password |
| --- | --- | --- |
| Admin | `ahmedarslanarslan9@gmail.com` | `Admin@12345` |
| Manager | `manager@dialer.test` | `Manager@12345` |

---

## UI redesign

The console was rebuilt against a single design system defined in
`frontend/app/globals.css`. The intent was an editorial, Swiss-operational
console — **structure from 1px hairlines and whitespace, never from shadow or
colour**.

**Palette (three colours plus functional status):**
off-white canvas `#FAFAFA`, near-black ink `#09090B`, one accent deep navy
`#1E3A8A` reserved for primary actions and active states. The left navigation
rail is ink in *both* themes so the layout has a fixed anchor.

**Typography:** Inter for UI, JetBrains Mono for identifiers and figures.
Uppercase micro-labels (`.micro-label`) carry section structure; all body copy
and headings are left-aligned; figures use tabular numerals so columns line up.

**Explicitly avoided:** gradients, glows, coloured blur, floating icon-in-a-circle
cards, badge pills, `rounded-2xl`/`3xl`, drop shadows on panels, hover-lift
animations, centred body text, and any hardcoded sample data.

### Key components

| File | Role |
| --- | --- |
| `components/app-shell.tsx` | The single layout wrapper — rail, top bar, page header, optional right column |
| `components/providers.tsx` | Client boundary owning the query cache and theme |
| `components/sidebar.tsx` | Ink rail; links every page, including administration |
| `components/company-table.tsx` | Company register — filters, search, drag-resizable columns, click-to-history cells, inline payment editing |

---

## Functional fixes

Bugs found and fixed while making the app actually work:

**Blocking**

- **Login never redirected.** `onSubmit` read `loginMutation.data` synchronously
  right after `mutate()`, which is always `undefined`. Now driven by the
  mutation result.
- **`QueryClient` created inside the root layout body**, so every render reset
  the cache. Hoisted to `lib/query-client.ts`.
- **`QueryClient` instance passed from a Server Component to a client
  provider** — React refused to serialise it and every page returned 500.
- **The whole app was hidden until mount** (`<div className="invisible">`).
  Replaced with a pre-paint theme script, removing the flash and the blank frame.
- **`npm run dev` could not start on Windows**: `node_modules/.bin` contained
  only Unix shims, no `.cmd`. Regenerated with `npm install` (no dependency
  version changes — the lock diff is bin-link metadata only).
- **Backend never bound its port when MongoDB was unreachable**, so the API
  simply did not exist. It now always listens, exposes `/api/health`, and fails
  data routes fast with an explicit 503.

**API**

- `MutationFactory` called `onSuccess(data.token)` instead of `onSuccess(data)`,
  so every success callback received a string.
- `AuthApis.login` stored `""` as a token when the response had none, producing
  a bogus "authenticated" state.
- No 401 handling: an expired JWT left the UI half-authenticated with no way
  back to sign-in. Added a response interceptor.
- `populate("permissions", "name …")` — `Permission` keys on **`key`**, so every
  role's permission list and every user's `role.permissions` came back null.
- `Mutations.createPermission` invalidated `["admin","roles"]` instead of
  `["admin","permissions"]`.
- `ALLOWED_IPS` were compared without normalising `::ffff:` prefixes or
  stripping quotes.
- Added CORS for `localhost:3001`, a 404 handler, an error handler, and
  `trust proxy`.
- The permission seeder granted `manager`/`viewer` two `comment.*` permissions
  that do not exist, storing `undefined` entries in role documents.

**Frontend**

- `getServerSnapshot` in `hooks/useSidebar.ts` returned a fresh object every
  call, tripping an infinite-loop warning from `useSyncExternalStore`.
- `EditCompanyModal` initialised its status from a not-yet-loaded record, so
  inactive companies always rendered as active and the inactive-date field
  never appeared.
- `useResizableColumns` declared its teardown in terms of itself, which could
  strand a `pointermove` listener and leave the cursor stuck on `col-resize`.
- The companies table captured `new Date()` in the render body, invalidating its
  memoisation on every render.
- Logout pushed to `/login` without clearing the token or query cache.
- The navbar's search box and notification bell were non-functional decoration;
  the bell even showed a hardcoded unread dot. Removed rather than faked.

**Removed as dead or fake**

- `components/comments-modal.tsx` — never imported; rendered hardcoded comments.
- `components/admin-edit-company-modal.tsx` — only used by a duplicate page.
- `/admin/dashboard` and `/admin/logs` were hardcoded mock pages; they now
  redirect to `/dashboard` and `/logs`.
- `/admin/companies` duplicated the register; it now redirects to
  `/dashboard/companies`.
- `/admin/permissions` was a fake matrix of invented users; it now reads and
  writes real roles and permissions.
- `/admin/settings` showed fabricated toggles, a fake "Save Changes" button and
  invented infrastructure details; it is now a read-only System status page
  driven by `/api/health`.

---

## Verification performed

- `npx tsc --noEmit` → clean
- `npx eslint .` → clean
- All routes return HTTP 200
- Login round-trip against a real database; all endpoints return live data
- Every route rendered in headless Chrome, **light and dark, desktop and
  mobile**, with **zero console errors** and no horizontal page scroll at 390px

Screenshots from that run are in `F:\Fullstack\.dsh-shots\out`.

## Known limitations

- The `manager` role can open `/dashboard/companies`, but only an admin may edit
  a joining date (enforced by the API and reflected in the form).
- `GET /companies` ignores `page`/`limit` and returns every record; the register
  filters and sorts client-side. Fine at current volume, worth paginating as the
  register grows.
- Passwords in the company register are shown in plain text. That is the
  existing product behaviour (they are dialer credentials, meant to be copied),
  but it is worth revisiting as a security decision.
