# services/: backend boundary

Screens never call the network directly. They go through the store (`src/store/AppStore.tsx`), and the store calls these services.

| File | Purpose |
|---|---|
| `backend.ts` | Reads `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`, creates the Supabase client (sessions in AsyncStorage, auto-refresh only in the foreground) and exposes `isLive`. Empty URL or `demo` → demo mode; `local` → LifeLink dev server on the Metro host. |
| `api.ts` | Every live call: auth, `get_my_profile`, `list_requests`, `search_donors`, `list_hospitals`, `respond_to_request`, `record_donation`, notifications, avatar upload… Maps rows to the app's domain types. |
| `auth.ts` | Login, register, password reset, logout. Live → Supabase Auth; demo → local simulation. |
| `storage.ts` | AsyncStorage snapshot of app state (offline cache). Demo and live use separate keys. |
| `assistant.ts` | Keyword-matched local answers (no LLM). |
