# Pekahellix OS V0.5-E.3

Correctif du garde de compte actif.

## Déploiement
1. Remplacer les fichiers front-end sur GitHub Pages.
2. Conserver le `config.js` déjà configuré.
3. Aucun SQL ni redéploiement Edge Function requis.
4. Vérifier dans la console : `PEKAHELLIX_BUILD` doit afficher `0.5-E.3`.

## Test attendu
Après désactivation d’un utilisateur depuis l’administration, son navigateur doit revenir à l’écran de connexion au prochain contrôle (environ 15 secondes) ou à l’ouverture d’une application, avec le message indiquant que le compte a été désactivé.
