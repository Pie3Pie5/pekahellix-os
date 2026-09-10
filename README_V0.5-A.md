# Pekahellix OS — V0.5-A

Branche de travail dérivée de la V0.4.6 stable.

## Objectif
Remplacer les identifiants codés en dur par Supabase Auth et piloter l'accès aux modules avec `public.profiles`.

## Configuration avant test
1. Ouvrir `config.js`.
2. Remplacer `A_REMPLACER_PAR_URL_SUPABASE` par l'URL du projet Supabase.
3. Remplacer `A_REMPLACER_PAR_PUBLISHABLE_KEY` par la **Publishable key** du projet.
4. Ne jamais mettre de `service_role`, secret key ou mot de passe de base de données dans ce fichier.

## Comportement
- login = adresse e-mail + mot de passe Supabase ;
- refus des comptes `is_active = false` ;
- `access_temps`, `access_communication`, `access_cyber` contrôlent les trois modules ;
- le rôle `test` peut recevoir les trois modules sans privilèges admin ;
- le rôle `admin` est reconnu mais l'écran d'administration sera ajouté en V0.5-C ;
- les anciens comptes codés en dur ont été supprimés du JavaScript.

## Important
La première authentification exige une connexion Internet. La session Supabase est persistée côté navigateur. Le comportement hors-ligne après authentification sera durci après validation de cette étape.
