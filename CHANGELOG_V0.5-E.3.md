# V0.5-E.3 — Account Guard

- Supprime la réutilisation de `accountGuardPromise` dans le contrôle d’état du compte.
- Chaque contrôle interroge directement `profiles.is_active`.
- Un compte avec `is_active = false` est immédiatement déconnecté avec un message explicite.
- Ajoute le marqueur `window.PEKAHELLIX_BUILD = "0.5-E.3"` pour faciliter les diagnostics de cache.
- Corrige le paramètre de version du script dans `index.html` en `script.js?v=0.5-e.3`.
- Cache PWA : `pekahellix-v0.5-e.3`.
