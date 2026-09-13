# Installation V0.5-G.3
1. Exécuter `SUPABASE_V0.5-G.3.sql` dans Supabase SQL Editor.
2. Redéployer l’Edge Function `supabase/functions/admin-users/index.ts`.
3. Dans Supabase Authentication > Email Templates, installer les modèles du dossier `SUPABASE_EMAIL_TEMPLATES_V0.5-G.3`.
4. Déployer les fichiers web sur GitHub Pages en conservant votre `config.js` de production.
5. Dans Administration Pekahellix, créer une entreprise puis rattacher les utilisateurs. Cocher `Résultats équipe` uniquement pour les personnes autorisées.
6. Tester avec au moins 5 réponses Employé pour déclencher la restitution.

Les anciennes réponses G.1 sans `organization_id` restent conservées mais ne sont jamais incluses dans une restitution d’entreprise.
