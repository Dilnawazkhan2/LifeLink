# LifeDrop + LifeLink — Phase 1 Integration Audit

Date: 2026-11-09 · Scope: read-only inspection, no code changed in either project.

| Project | Path | Version control |
|---|---|---|
| LifeDrop website | `C:\Users\Timecomputers\Desktop\LifeLink Website\demo test\` | **None** (no git, no backup) |
| LifeLink Android app | `C:\Users\Timecomputers\Desktop\LifeLink\` | git, branch `feature/lifelink-frontend` @ `ed6d6cc` |

---

## 1. LifeDrop website

### 1.1 Stack
- **Static multi-page site**: 8 plain `.html` files, `style.css`, `script.js`, `db.js`. No build step, no package.json, no server.
- Bootstrap 5.3.2 + Font Awesome 6.4.2 + Google Font "Outfit", all from CDNs.
- **No backend.** `db.js` is a client-side "database" built on `localStorage`.

### 1.2 Pages and what they do

| Page | Purpose | Data behaviour today |
|---|---|---|
| `index.html` | Marketing homepage | Stat counters are **hard-coded** animations (12,480 donors, 38,500 lives, 240 hospitals, 85 cities). Footer has an "Admin Login" link to `admin.html`. |
| `register.html` | Sign-up: first/last name, email, role (donor/recipient), password ×2, terms | `LifeDropDB.users.register`: **plaintext password in localStorage** |
| `login.html` | Email + password, "Remember me", "Forgot password?" | Plaintext compare; session in `localStorage.ld_session`. "Forgot password?" is a dead `#` link. "Remember me" is not wired. |
| `donor_register.html` | Donor application: name, email, phone, age (18–65), gender, blood group, city | Creates a **pending donor application** (`ld_donor_requests`). No login needed. Admin approval copies it into `ld_donors`. |
| `blood_request.html` | Patient name, blood group, contact number, hospital, city, "urgent" checkbox | `LifeDropDB.requests.create`: status `pending`. No login needed. **No units field.** Form fields are read **by position** (`inputs[0..4]`), not by id. |
| `search_donor.html` | Blood group + city search | Renders all **available** donors, **including phone numbers**, plus a `tel:` link. Visible to anonymous visitors. Three static HTML donor cards are overwritten on load. |
| `contact.html` | Contact form | Saved to `ld_messages` |
| `admin.html` | Dark-theme admin: overview, donor applications (approve/decline/delete), donors (toggle availability/delete), blood requests (status: pending/fulfilled/cancelled, delete), users (delete), messages, Export JSON, **Clear DB** | Reads/writes the same localStorage, polls every 4 s |

### 1.3 Data model (localStorage keys)

| Key | Shape |
|---|---|
| `ld_users` | `{id, firstName, lastName, email, password(plain), userType: donor\|recipient\|admin, createdAt}` |
| `ld_session` | `{userId, email, userType, loginAt}` |
| `ld_donor_requests` | `{id, fullName, email, phone, age, gender, bloodGroup, city, status: pending\|approved\|declined, submittedAt, reviewedAt}` |
| `ld_donors` | `{id, fullName, email, phone, age, gender, bloodGroup, city, available, registeredAt}` |
| `ld_seed_approved` | Copy of approved donors that survives "Clear DB" |
| `ld_requests` | `{id, patientName, bloodGroup, contactNumber, hospitalName, city, urgent, status: pending\|fulfilled\|cancelled, createdAt, updatedAt}` |
| `ld_messages` | `{id, firstName, lastName, email, phone, message, read, createdAt}` |

**Demo seed** (`seedDemo`, runs on every page load if there are no donors): 6 donors (mostly US), 1 request ("John Smith, O-, City General Hospital, New York"), and an admin `admin@lifedrop.org / admin123`.

### 1.4 Critical findings

1. **The admin page has no authentication at all.** Anyone can open `admin.html` and see every user, phone number and message, delete records, or "Clear DB". The footer links to it publicly.
2. **Passwords are stored in plaintext** (in each visitor's browser).
3. **Data is not shared.** localStorage is per browser, so an admin only sees submissions made in their own browser. Nothing a visitor submits ever reaches anyone else. The "Live Data" label and the polling are only meaningful on one machine.
4. **Stored XSS risk.** `admin.html` and `script.js` inject user-supplied text with `innerHTML` and no escaping (names, messages, hospital). Today it only affects the same browser. Once data is shared, a malicious form submission would run script in the admin's session. This must be fixed during integration.
5. **Donor phone numbers are public** on `search_donor.html`. That conflicts with the requirement that contact details are not exposed unnecessarily. **Needs your decision** (§6, Q3).
6. **Public blood requests are never displayed** on the public site. Only `admin.html` lists them. So "Android requests appear on the website" can only mean the admin view, unless you want a new public section (that would be a design change).
7. `saveApprovedToDBJS` makes the admin **download a modified `db.js`** to "persist" approvals. This is a workaround that becomes obsolete with a real database.
8. Content is US-oriented (New York placeholders, +1 numbers); the app is Pakistan-focused. The plan leaves public content untouched; city is stored as free text and normalised for search.

### 1.5 Existing data that may need migrating
The only "real" data is whatever sits in **the localStorage of browsers that used the site**. There is no server copy. If you have real submissions, open `admin.html` **in that same browser** and click **Export JSON** (read-only). That file is the migration source. Plaintext passwords will **not** be migrated. Those users get a "set your password" email instead.

---

## 2. LifeLink Android app

### 2.1 Stack
Expo SDK 58, React Native 0.88, React 19, TypeScript strict, Expo Router (`src/app`), React Compiler on, AsyncStorage persistence. No backend.

### 2.2 Data seams (already designed for this step)
- **Store:** `src/store/AppStore.tsx`. One reducer and context, persisted to AsyncStorage. Every write goes through named actions (`createRequest`, `respondToRequest`, `recordDonation`, `setAvailability`, `updateUser`, notification actions, `updateSettings`…).
- **Services:** `src/services/auth.ts` (fake demo login), `assistant.ts` (local answers), `storage.ts`.
- **Mock data still imported directly by screens** (these must move behind services):
  - `donors.tsx`, `donors/[id].tsx` → `data/donors`
  - `hospitals.tsx`, `hospitals/[id].tsx` → `data/hospitals`
  - `profile.tsx`, `profile/badges.tsx`, store → `data/badges`
  - Store seeds: `data/requests`, `data/notifications`, `data/donations`, `data/user`
  - `login.tsx` shows demo credentials.

### 2.3 Field mapping gaps vs. the website

| Concept | Website | App | Resolution |
|---|---|---|---|
| Blood request | patientName, bloodGroup, contactNumber, hospitalName, city, urgent | + units, urgency (critical/urgent/normal), area, description, contactName, status active/fulfilled | Superset table. Website requests default to `units = 1`, `urgency = urgent\|normal`, contact name = patient's. |
| Request status | pending / fulfilled / cancelled | active / fulfilled | Unified lifecycle (§5.3) |
| Account role | donor / recipient (+ admin) | donor / recipient / both | `profiles.account_type` + separate `user_roles` for admin/moderator |
| Donor record | Anonymous application → admin approval | Every signed-in donor is a donor; availability available/resting/busy | `donor_applications` (anonymous) + `donors` (optional link to a user) |
| Donor availability | boolean `available` | available / resting / busy | Enum; website shows "Available" only for `available` |
| Hospitals / inventory / donations / badges / notifications | Not present | Present (mock) | New tables; website unaffected |
| Contact messages | Present | Not present | `contact_messages` table (admin only) |

---

## 3. Backend recommendation

Neither project has a backend to reuse. **Recommended: Supabase** (Postgres + Auth + RLS + Realtime + Storage), as you suggested:
- The website is static, and the Supabase JS client loads from a CDN with **one `<script>` tag**. No build tooling is added and no visual change.
- The app uses `@supabase/supabase-js` + `expo-sqlite` for session storage. This is the Expo-documented setup and both work in Expo Go.
- RLS lets both public clients use the **publishable (anon) key** safely. Privileged logic (approvals, status changes, inventory, roles) runs in **Postgres functions (`security definer`) or Edge Functions** that check `is_admin()` on the server.
- **Local development:** Docker 29.6 is installed, so `npx supabase start` can run the whole stack locally first. A hosted project is only needed for real users and devices.

```
             ┌──────────────── Supabase (one project) ────────────────┐
             │ Postgres + RLS  ·  Auth  ·  Realtime  ·  Storage        │
             │ RPC functions (validation, status transitions, admin)  │
             │ Edge Functions (anonymous submissions, notifications)  │
             └───────▲───────────────────▲────────────────────▲──────┘
          anon key + │         anon key + │        user JWT +   │ (admin role
          user JWT   │         user JWT   │        is_admin()   │  checked in DB)
      ┌──────────────┴──┐   ┌─────────────┴────┐   ┌───────────┴───────────┐
      │ LifeDrop website │   │ LifeLink Android │   │ Admin dashboard       │
      │ static HTML      │   │ Expo app         │   │ separate protected app │
      │ db.js → Supabase │   │ store → services │   │ (React + Vite + TS)   │
      └──────────────────┘   └──────────────────┘   └───────────────────────┘
```

**Website integration approach (no visual change):** keep every HTML file, class and layout. Rewrite only the internals of `db.js` (same `LifeDropDB` method names, now async and backed by Supabase) and the handlers in `script.js`. Add one CDN script and a small `config.js` with the public URL and publishable key. Escape all rendered values. The visible behaviour stays the same, except where you decide otherwise in §6.

---

## 4. Proposed schema (draft for Phase 2)

| Area | Tables |
|---|---|
| Identity | `profiles` (1:1 `auth.users`), `user_roles` (admin, moderator, hospital_staff), `user_addresses` |
| Donors | `donors` (nullable `profile_id`; covers website-approved donors without accounts), `donor_availability` (status + history), `donor_applications` (website form) |
| Requests | `blood_requests`, `request_status_history`, `request_responses` (donor ↔ request) |
| Donations | `donations` (links donor, request, hospital) |
| Hospitals | `hospitals`, `hospital_inventory` (hospital × blood group, units, updated_by) |
| Comms | `notifications`, `notification_preferences`, `contact_messages` |
| Gamification | `badges`, `user_badges` |
| Lookup | `blood_groups` (8 rows + compatibility), `cities` |
| Admin | `audit_logs` (row-level changes via trigger), `admin_activity_logs` (who/what/when) |

Conventions: UUID primary keys, `created_at` / `updated_at` with triggers, Postgres enums for statuses, `CHECK` constraints for units 1–10, age 17–65 and phone format, unique (email), unique (`hospital_id`, `blood_group`), and indexes on `status`, `blood_group`, `city` and `created_at` used by search and filters. Each request has a `source` column (`website` | `android` | `admin`) so the dashboard can show where it came from.

### 4.1 Blood request lifecycle (proposal)

```
pending ──approve──▶ approved ──activate/auto──▶ active ──▶ fulfilled
   │                    │                          │
   └──reject──▶ rejected└──cancel──▶ cancelled ◀───┘ (requester or admin)
```

| Transition | Who |
|---|---|
| create → `pending` | anyone (anonymous on the website via a validated RPC; signed-in in the app) |
| `pending` → `approved` / `rejected` | admin / moderator only |
| `approved` → `active` | admin, or automatically when first published |
| `active` → `fulfilled` | admin, or the requester for their own request |
| any open status → `cancelled` | requester (own request) or admin |

Every transition goes through one `transition_request_status()` function. It enforces the table above, writes `request_status_history` and `audit_logs`, and notifies the requester and responders. The app and the public site only list `approved` / `active` / `fulfilled` requests; requesters also see their own pending ones.

### 4.2 Privacy defaults (proposal)
- Public donor discovery reads from a **view** that exposes name, blood group, city and availability. **No phone or email.**
- Phone numbers are revealed through an RPC to signed-in users, or only after a donor accepts a request (your choice, §6 Q3).
- Request contact numbers are visible to signed-in users only.

---

## 5. Phased plan after approval

| Phase | Output | Touches |
|---|---|---|
| 2 Design | SQL migrations, RLS policies, RPC signatures, API doc, `.env.example` files | new `LifeLink Platform` workspace only |
| 3 Backend | Local Supabase running, schema + seed (dev only), realtime publication, tests for RLS | same |
| 4 Admin | New dashboard (requests/donors/hospitals/inventory/users/audit), realtime | same |
| 5 Website | **Backup first.** Then git init, `db.js`/`script.js` internals, `config.js`, escaping, admin.html → redirect to dashboard | website |
| 6 App | Supabase client, real auth/registration, services replace mock imports, realtime, mock data kept for an explicit `demo` mode | app (new branch) |
| 7 E2E | The 12 scenarios you listed, run against local Supabase; written test report | all |
| 8 Docs | Schema, RLS, deploy, backup/restore, env files | all |

Nothing destructive happens without your explicit approval. Production migrations and deployment wait for a separate go-ahead.

---

## 6. Decisions needed from you

1. **Where the backend and admin live.** Proposal: a new folder `C:\Users\Timecomputers\Desktop\LifeLink Platform\` (git) with `supabase/` (migrations, functions, seed), `admin/` (dashboard) and `shared/` (types + validation used by admin and app). Putting it inside the Expo app would make Metro bundle-watch the admin app.
2. **Supabase environment.** Start fully **local (Docker)**, then create a hosted project when you're ready. For hosted, you'll create a free project at supabase.com and give me only the **Project URL** and **publishable/anon key** (Settings → API). You run anything that needs the database password or secret key yourself; never paste those here.
3. **Donor phone numbers on the website search page** (today public to everyone). Options: (a) visible to signed-in users only, and anonymous visitors see a masked number with the same "Contact Donor" button linking to login. (b) Keep fully public. (c) Never shown; contact only through a blood request. Recommendation: **(a)**.
4. **Request approval policy.** Should every new request (including "critical") wait for admin approval before donors see it? Or should requests from signed-in, verified users go live immediately while anonymous website requests wait? Recommendation: **anonymous → pending; signed-in verified → active immediately**, so emergencies are not delayed.
5. **Anonymous submissions on the website** (blood requests, donor applications, contact messages work without login today). Keep them anonymous (protected by server validation, rate limiting and admin review)? Recommendation: **keep anonymous**.
6. **`admin.html`.** It cannot be secured as-is. Proposal: keep the URL and footer link, but turn the page into a redirect to the new protected dashboard. Alternatively, rebuild the dashboard inside `admin.html` with a login gate, keeping its current dark look.
7. **Existing website data.** Is there real data in some browser that needs migrating? If yes, export it with "Export JSON" from that browser. Otherwise the demo seed (US donors, `admin@lifedrop.org`) is dropped and only used in dev seeds.
8. **Homepage counters** (12,480 donors…). Keep the hard-coded numbers (no public content change), or bind them to live totals?
9. **Website backup.** The website folder has no git or backup. May I create a timestamped copy (`LifeLink Website (backup 2026-11-09)`) and `git init` the website before Phase 5?
