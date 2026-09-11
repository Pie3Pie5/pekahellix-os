# Pekahellix OS V0.5-E — Cycle de vie des comptes

- Désactivation/réactivation sécurisée des comptes `user`.
- Synchronisation du statut avec Supabase Auth via l’Edge Function `admin-users` (ban/unban).
- Recontrôle du profil toutes les 15 secondes lorsque l’application est visible, à chaque retour dans l’application et avant ouverture d’un module.
- Un compte désactivé ou supprimé est déconnecté dès qu’un contrôle en ligne constate le changement.
- Mise à jour dynamique des droits de modules pour les sessions déjà ouvertes.
- Comptes `admin` et `test` protégés contre la désactivation et la suppression.
- Suppression définitive renforcée par double confirmation et saisie de `SUPPRIMER`.
- `APP_URL` peut désormais être défini comme secret/variable de l’Edge Function ; repli actuel vers GitHub Pages.
- Cache PWA : `pekahellix-v0.5-e`.

## Limite importante
Un appareil totalement hors ligne ne peut pas apprendre qu’un administrateur vient de désactiver le compte. Dès le retour en ligne, Pekahellix effectue le contrôle et bloque l’accès.
