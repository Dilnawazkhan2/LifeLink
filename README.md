# LifeLink — Blood Donation App (Android)

React Native / Expo app for LifeLink, connected to the **shared LifeLink backend** (Supabase). It uses the
same database, accounts and business rules as the LifeLink website and its admin dashboard. A request posted
here appears on the website and the dashboard, admin approvals show up here live, and so on.

The app runs in one of three modes, chosen in `.env` (see [`.env.example`](.env.example)):

| `EXPO_PUBLIC_SUPABASE_URL` | Mode |
|---|---|
| *(empty)* or `demo` | **Demo**: bundled mock data, no network (the original offline prototype) |
| `local` | **Local dev server**: `npm run dev` in `../LifeLink Platform` (no Docker, no cloud) |
| `https://<ref>.supabase.co` (+ `EXPO_PUBLIC_SUPABASE_ANON_KEY`) | **Production**: your Supabase project |

- **Expo SDK 58**, React Native 0.88, React 19, TypeScript (strict)
- **Expo Router** (file-based routing, JS tabs with a custom tab bar)
- **@supabase/supabase-js** (auth, RPC, realtime, storage) with sessions in AsyncStorage
- lucide-react-native + react-native-svg icons, expo-linear-gradient, expo-image-picker

Design notes and the APK inspection results are in [`docs/reference-notes.md`](docs/reference-notes.md).

---

## Quick start

Requirements: Node.js 20+ and npm. For a device, install **Expo Go** from the Play Store, or use an Android emulator.

```bash
npm install
```

```bash
npm start
```

Then press **a** to open on a connected Android device/emulator, or scan the QR code with Expo Go.
To preview in a browser:

```bash
npm run web
```

**Demo mode login:** `umer.abdullah@email.com` / `lifelink123` (or tap **Use Demo Account**).
**Local dev server:** the same email/password works because the dev seed creates that account; new users can sign up with **Create an account**.
**Production:** real accounts only. Sign up in the app or on the website; both use the same account.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Start the Metro dev server |
| `npm run android` | Start and open on Android |
| `npm run web` | Start and open in the browser |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build:apk` | Build an installable APK with EAS (cloud) |

## Testing on Android

1. Run `npm start` on your computer.
2. Put the phone on the **same Wi-Fi** network and open **Expo Go**.
3. Scan the QR code in the terminal. The app loads on the onboarding screen.
4. To restart the walkthrough in demo mode: Settings → **Reset Demo Data**, or clear Expo Go's storage for the app.
   In live mode Settings shows **Sync Now** and which backend the app is connected to.
5. Testing against the local dev server from a phone: run `npm run dev` in `../LifeLink Platform` on the same computer and
   set `EXPO_PUBLIC_SUPABASE_URL=local` in `.env.local`. The app finds the server through the Metro host address
   (allow Node.js through the Windows firewall on private networks if the phone cannot connect).

Suggested test path:

- Onboarding (Continue / Back / Skip / dots) → Login (validation, show/hide password, Forgot password, Use Demo Account)
- Home: availability switch, stat tiles, View All, Post Emergency Request, quick actions, **Help** on a nearby request
- Donors: search, blood-group chips, sort chips, Available toggle, Nearby → donor profile → Contact / Request Blood
- Requests: status/blood filters, list button (My Requests), **+** → create request (validation, submit) → request details
  (Respond → I Donated → appears in donation history and eligibility changes)
- Hospitals: search, city/type filters, Blood Bank toggle → hospital details (inventory, call, directions)
- Profile: photo picker, availability cards, Edit Profile, badges, donation history, notifications, AI assistant,
  settings, About, Sign Out

## Building an APK

This machine has no Java or Android SDK, so APKs are built with **EAS Build** in the cloud (free tier available).

```bash
npx eas-cli@latest login
```

```bash
npm run build:apk
```

Put the production backend values in `.env` first (see `.env.example`); `EXPO_PUBLIC_*` values are baked into the build.
The `preview` profile in `eas.json` produces a directly installable `.apk`. EAS prints a download link and a QR code when the build finishes.
For a Play Store bundle (`.aab`), use:

```bash
npx eas-cli@latest build -p android --profile production
```

*Local alternative:* install Android Studio (JDK 17 + Android SDK), then run
`npx expo prebuild -p android` followed by `cd android && ./gradlew assembleRelease`.

## Project structure

```
src/
  app/                    Expo Router routes (every file is a screen)
    _layout.tsx           Providers (store, feedback), splash gating, root stack
    index.tsx             Redirect → onboarding / login / tabs
    onboarding.tsx
    (auth)/               login, register, forgot-password
    (tabs)/               index (Home), donors, requests, hospitals, profile + custom tab bar
    donors/[id].tsx       Donor profile
    requests/new.tsx      Create blood request
    requests/[id].tsx     Request details (respond, donate, fulfil, cancel)
    hospitals/[id].tsx    Hospital details & inventory
    profile/              edit, donations, badges
    notifications.tsx, assistant.tsx, settings.tsx, about.tsx
  components/
    common/               Screen, Headers, Card, Button, Chip, Avatar, BloodBadge, SearchBar, Feedback (dialogs/toast/contact sheet)...
    cards/                DonorCard, RequestCard, HospitalCard, BadgeCard, list rows
    forms/                TextField, FormBanner
    navigation/TabBar.tsx Elevated centre blood-drop tab
    icons/                Custom SVG blood drop, medical cross, filled home
  constants/              colors, theme (spacing/radius/shadows), blood group tones & compatibility
  data/                   Demo-mode mock data: user, donors, requests, hospitals, notifications, donations, badges, assistant
  services/               backend.ts (Supabase client + mode), api.ts (all server calls → domain types), auth.ts, storage.ts, assistant.ts
  store/AppStore.tsx      Reducer + context; live mode: initial load, server-backed actions, realtime refresh, offline cache
  hooks/                  useRequestActions (shared respond/contact flows)
  types/, utils/          Domain types, date/format/validation helpers
```

## Backend integration

Screens only talk to the store (`useApp()`); the store calls `src/services/api.ts`, which maps database rows to
the same domain types the screens always used. Business rules (validation, approval workflow, permissions) are
enforced in the database. See [`src/services/README.md`](src/services/README.md) and `../LifeLink Platform/docs/api.md`.

- Requests from unverified accounts start as **pending review** (shown as "In review"); verified accounts go live at once.
- Donor phone numbers are revealed only to signed-in users through the server (each reveal is logged).
- Distances are estimated from city centres (the backend stores cities, not GPS positions); hospitals use their coordinates.
- "Delete" on your own request becomes **Cancel** in live mode (requests keep their audit trail).

## Notes

- The supplied APK (`com.blooddonation.app`) contains an older build branded "BloodConnect" that does not
  match the screenshots. The screenshots were used as the source of truth, and the APK only supplied copy
  for screens with no screenshot. Details are in `docs/reference-notes.md`.
- Phone calls, SMS and maps open the device's native apps through deep links.
- The AI Assistant uses keyword-matched local answers (no LLM calls).
