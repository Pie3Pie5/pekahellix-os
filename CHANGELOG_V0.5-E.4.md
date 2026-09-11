# V0.5-E.4 — Account Guard déterministe

- Contrôle prioritaire minimal de `profiles.is_active`.
- Déconnexion locale immédiate avant toute tentative de `signOut` Supabase.
- `signOut({ scope: "local" })` exécuté ensuite pour nettoyer la session navigateur.
- Actualisation des droits séparée du contrôle de statut.
- Build `0.5-E.4` et cache PWA `pekahellix-v0.5-e.4`.
