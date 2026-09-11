# Pekahellix OS V0.5-E

Cette version termine le cycle de vie principal des comptes : création/invitation, activation, connexion, récupération du mot de passe, droits par module, désactivation/réactivation et suppression définitive.

## Déploiement
1. Conserver le `config.js` déjà configuré en production.
2. Remplacer les fichiers front-end sur GitHub Pages.
3. Redéployer `supabase/functions/admin-users/index.ts` dans Supabase.
4. Aucun nouveau script SQL n’est requis : V0.5-E réutilise les RPC installées en V0.5-B.

## Option recommandée
Créer dans les secrets/variables de l’Edge Function :
`APP_URL=https://pie3pie5.github.io/pekahellix-os/`
La fonction possède aussi cette URL comme valeur de repli, donc l’ajout du secret n’est pas bloquant pour le test.

## Tests
- Désactiver un compte utilisateur et vérifier qu’il ne peut plus se reconnecter.
- Sur une session déjà ouverte, attendre au maximum ~15 s (ou revenir dans l’onglet) et vérifier la déconnexion.
- Réactiver le compte et vérifier qu’il peut se reconnecter.
- Modifier les droits d’un utilisateur déjà connecté et vérifier leur actualisation.
- Supprimer un compte utilisateur puis vérifier qu’il disparaît de la liste et ne peut plus se connecter.
- Vérifier que les comptes admin/test ne proposent pas de modification/suppression exploitable.
