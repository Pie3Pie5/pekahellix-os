# Pekahellix OS V0.5-E.1 — Correctif désactivation / déconnexion

- Correction du message `[object PointerEvent]` lors d'une déconnexion manuelle.
- Le contrôle périodique ferme maintenant la session lorsqu'un bannissement invalide l'accès Supabase avant la lecture du profil.
- Le code Auth `user_banned` est traduit en : « Votre compte a été désactivé. Contactez votre administrateur Pekahellix. »
- Les erreurs réseau temporaires ne provoquent pas de déconnexion abusive.
- Cache PWA : `pekahellix-v0.5-e.1`.
