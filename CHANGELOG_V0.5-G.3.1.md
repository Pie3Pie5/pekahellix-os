# Pekahellix OS V0.5-G.3.1

- Correction de la migration Supabase lorsque G.1 n’a jamais été exécuté.
- Le script G.3.1 crée désormais `communication_employee_responses` si nécessaire.
- Script idempotent : compatible avec une base sans G.1 ou avec une migration G.1 déjà présente.
- Aucun changement fonctionnel du front par rapport à G.3.
