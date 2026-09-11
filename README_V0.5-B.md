# Pekahellix OS — V0.5-B Administration

## Fonctions ajoutées
- 4e application « Administration », visible uniquement si `role = admin`.
- Liste des profils utilisateurs.
- Modification des accès Temps / Communication / Cyber pour les comptes `user`.
- Activation / désactivation des comptes `user`.
- Invitation d'un nouvel utilisateur avec prénom, nom, e-mail et applications autorisées.
- Suppression d'un compte utilisateur.
- Comptes `admin` et `test` protégés contre les modifications/suppressions depuis l'interface.

## Installation Supabase nécessaire
1. Exécuter `SUPABASE_V0.5-B.sql` dans **SQL Editor**.
2. Créer/déployer l'Edge Function `admin-users` avec le contenu de `supabase/functions/admin-users/index.ts`.
3. Ne jamais mettre `SUPABASE_SERVICE_ROLE_KEY` dans `config.js` ou GitHub. Elle reste côté Supabase.

## Déploiement GitHub Pages
Remplacer au minimum :
- `index.html`
- `style.css`
- `script.js`
- `sw.js`

Conserver votre `config.js` déjà configuré sur GitHub.

## Test recommandé
1. Connexion compte `test` : pas de bouton Administration.
2. Connexion compte `user` : pas de bouton Administration.
3. Connexion compte `admin` : bouton Administration visible.
4. Modifier les accès d'un compte user, se reconnecter avec lui et vérifier les modules visibles.
5. Inviter un nouvel utilisateur.
