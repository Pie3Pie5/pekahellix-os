# Pekahellix OS V0.5-E.4

Correctif ciblé du contrôle de compte désactivé. Le statut `is_active` est vérifié par une requête minimale. Lorsqu'il vaut `false`, l'interface est fermée localement immédiatement, puis la session Supabase locale est nettoyée.

Aucun SQL ni redéploiement de l'Edge Function n'est requis. Conserver le `config.js` configuré lors du déploiement.
