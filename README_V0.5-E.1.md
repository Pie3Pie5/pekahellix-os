# Pekahellix OS V0.5-E.1

Correctif de V0.5-E après test réel de désactivation d'un utilisateur déjà connecté.

## Déploiement
1. Remplacer les fichiers front-end sur GitHub Pages.
2. Conserver le `config.js` déjà configuré.
3. Aucun nouveau SQL n'est requis.
4. Aucun redéploiement de l'Edge Function n'est requis par ce correctif.

## Test attendu
- Désactiver un utilisateur standard depuis l'administration.
- Dans l'autre navigateur, la session doit être fermée automatiquement lors du prochain contrôle ou retour sur l'onglet.
- Une tentative de connexion d'un compte banni affiche un message de compte désactivé lorsque Supabase renvoie le code `user_banned`.
