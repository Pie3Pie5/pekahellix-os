# Pekahellix OS — v0.2

## Objectif
Nettoyage non destructif et préparation du projet pour la phase mobile.

## Modifications
- Suppression du double chargement de la police Poppins : elle reste chargée depuis `index.html`.
- Ajout de métadonnées mobiles de base (`viewport-fit`, `theme-color`, mode standalone iOS/Android).
- Remplacement du libellé provisoire « Tête en train de parler » par l'icône 💬.
- Transformation des éléments du dock en vrais boutons accessibles au clavier et aux technologies d'assistance.
- Ajout d'un état `:focus-visible` cohérent.
- Ajout de la prise en compte de `prefers-reduced-motion`.
- `CYBER_TOTAL` est maintenant calculé à partir du nombre réel de questions.
- Utilisation de `textContent` pour les réponses de quiz au lieu d'un passage inutile par `innerHTML`/sanitization.

## Important
L'authentification reste volontairement inchangée à cette étape. Les identifiants présents dans `script.js` devront être remplacés par une authentification serveur avant toute publication sur les stores.
