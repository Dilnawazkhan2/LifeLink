# LifeLink — Blood Donation App (Android frontend)

A frontend-only React Native / Expo recreation of the LifeLink blood donation app, built from the
reference screenshots in `reference/`. All data is mock data held in local state and persisted with
AsyncStorage. There is no backend, database or real authentication.

- **Expo SDK 58**, React Native 0.88, React 19, TypeScript (strict)
- **Expo Router** (file-based routing, JS tabs with a custom tab bar)
- lucide-react-native + react-native-svg icons, expo-linear-gradient, expo-image-picker,
  @react-native-async-storage/async-storage

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

**Demo login:** `umer.abdullah@email.com` / `lifelink123`. You can also tap **Use Demo Account** on the login screen.

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
4. To restart the walkthrough: Settings → **Reset Demo Data**, or clear Expo Go's storage for the app.

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
    (auth)/               login, forgot-password
    (tabs)/               index (Home), donors, requests, hospitals, profile + custom tab bar
    donors/[id].tsx       Donor profile
    requests/new.tsx      Create blood request
    requests/[id].tsx     Request details (respond, donate, fulfil, delete)
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
  data/                   Mock data: user, donors, requests, hospitals, notifications, donations, badges, assistant
  services/               LOCAL SIMULATIONS of backend calls (auth, assistant, storage), the backend seam
  store/AppStore.tsx      Reducer + context + AsyncStorage persistence + selectors
  hooks/                  useRequestActions (shared respond/contact flows)
  types/, utils/          Domain types, date/format/validation helpers
```

## Backend integration later

Screens only talk to the store (`useApp()`), and the store calls `src/services/*`. To connect a real API,
replace the service functions (same async signatures) and load seed data from the API instead of `src/data/*`.
See [`src/services/README.md`](src/services/README.md).

## Notes

- The supplied APK (`com.blooddonation.app`) contains an older build branded "BloodConnect" that does not
  match the screenshots. The screenshots were used as the source of truth, and the APK only supplied copy
  for screens with no screenshot. Details are in `docs/reference-notes.md`.
- Phone calls, SMS and maps open the device's native apps through deep links. Everything else is simulated locally.
- The AI Assistant uses keyword-matched local answers (no LLM calls).
