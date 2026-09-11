# V0.5-B.3 — Correctif cache PWA

- `index.html` charge désormais `script.js?v=0.5-b.3` afin de contourner immédiatement tout ancien cache Service Worker.
- Cache PWA passé à `pekahellix-v0.5-b.3`.
- `script.js`, `style.css` et `config.js` utilisent désormais une stratégie réseau-d'abord dans le Service Worker.
- Objectif : empêcher une ancienne version JavaScript de rester active après une mise à jour GitHub Pages.
