# Pekahellix OS — V0.5-G.3.4

## Correction — nettoyage de session à la déconnexion

- Une déconnexion explicite efface désormais tous les états temporaires des modules Temps, Communication et Cybersécurité.
- Les écrans des modules sont également replacés sur leur écran initial.
- Corrige le cas où un questionnaire Communication en cours pouvait réapparaître après déconnexion/reconnexion.
- Empêche qu’un utilisateur B retrouve sur le même appareil un écran ou un questionnaire temporaire laissé par l’utilisateur A.
- Les données déjà enregistrées dans Supabase ne sont pas affectées.
