# Pekahellix OS V0.5-G.3.2

Correctif de migration Supabase pour Communication Data & Emails.

## Ordre recommandé
1. Exécuter `SUPABASE_V0.5-G.3.2.sql` dans Supabase SQL Editor.
2. Vérifier que le résultat est `Success. No rows returned`.
3. Ne déployer le front qu’après validation de la base et de la fonction Edge `admin-users`.

Le `DROP FUNCTION public.admin_list_profiles()` ne supprime aucune donnée : il remplace uniquement l’ancienne fonction RPC par sa nouvelle définition.
