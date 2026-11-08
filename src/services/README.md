# services/ — backend boundary

Every function here is a **local simulation** of what a real backend would do.
Screens never import mock data for writes directly — they go through the store
(`src/store/AppStore.tsx`), and the store calls these services.

To integrate a real backend later:

| File | Today (local) | Future |
|---|---|---|
| `auth.ts` | Compares against `DEMO_CREDENTIALS`, fake latency | `POST /auth/login`, `POST /auth/forgot-password` |
| `assistant.ts` | Keyword match against `data/assistant.ts` | LLM endpoint |
| `storage.ts` | AsyncStorage snapshot of the whole app state | Server sync / cache layer |

The function signatures (async, typed results) are already shaped like network calls.
