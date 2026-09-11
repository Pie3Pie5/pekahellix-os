# V0.5-B.2 — Edge Function / CORS

- CORS explicite dans `admin-users` (POST, OPTIONS, headers Supabase).
- Remplacement de `supabase.functions.invoke()` par un appel `fetch()` explicite avec le JWT utilisateur et la publishable key.
- Messages d’erreur réseau/HTTP plus précis.
- Cache PWA : `pekahellix-v0.5-b.2`.
