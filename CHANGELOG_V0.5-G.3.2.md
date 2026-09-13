# V0.5-G.3.2

- Correction de la migration Supabase G.3.1.
- Suppression explicite de l’ancienne fonction `public.admin_list_profiles()` avant recréation, car son type de retour évolue avec `organization_id` et `access_communication_report`.
- Script SQL autonome et relançable après une exécution partielle/échouée.
- Aucun utilisateur, profil, entreprise ou réponse n’est supprimé.
