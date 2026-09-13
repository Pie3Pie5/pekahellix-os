# Pekahellix OS — V0.5-G.3.3

## Correction

- Corrige la reconstruction périodique de `osUser` dans `validateCurrentAccount()`.
- Conserve désormais `organizationId` et `communicationReport` après le contrôle/rafraîchissement du profil.
- Le bouton **« 📊 Résultats de mon équipe »** reste donc disponible pour les utilisateurs autorisés.
- Aucun changement SQL requis par rapport à G.3.2.
- Aucun changement de l’Edge Function `admin-users` requis.
