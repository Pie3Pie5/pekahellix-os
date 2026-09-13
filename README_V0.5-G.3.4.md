# Pekahellix OS — V0.5-G.3.4

Cette version ajoute le nettoyage complet des états temporaires lors d’une déconnexion explicite.

## Déploiement
1. Remplacer les fichiers du dépôt GitHub Pages par ceux de ce package.
2. Conserver le `config.js` de production actuel.
3. Forcer le rechargement (`Ctrl+F5`).
4. Vérifier `window.PEKAHELLIX_BUILD` : `0.5-G.3.4`.

## Test principal
1. Utilisateur A : commencer un questionnaire Communication et s’arrêter au milieu.
2. Se déconnecter.
3. Se reconnecter (avec A ou avec un utilisateur B).
4. Ouvrir Communication : le module doit repartir sur l’écran de choix Gérant / Employé, sans ancienne réponse ni ancienne question.

La navigation entre modules sans déconnexion continue de conserver le questionnaire en cours.
