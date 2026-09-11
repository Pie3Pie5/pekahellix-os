# Pekahellix OS V0.5-E.5

Correctif ciblé du contrôle de désactivation. Le Service Worker V0.5-E.4 interceptait toutes les requêtes GET, y compris celles vers Supabase, et pouvait donc resservir une ancienne réponse `is_active: true`. V0.5-E.5 limite le cache PWA aux ressources du même domaine que l’application.
