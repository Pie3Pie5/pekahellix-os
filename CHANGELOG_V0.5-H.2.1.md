# Pekahellix OS — V0.5-H.2.1

Correctif consolidé de H.2.

- Applique le profil Communication avant le premier affichage après connexion.
- Garde le questionnaire en cours lors de la navigation dans une même session.
- Ajoute un garde-fou UI : un utilisateur Employé ne peut pas lancer le parcours Gérant et inversement. Les RPC Supabase H.2 restent l'autorité de sécurité.
- Le parcours Employé n'affiche plus l'axe « Maturité des pratiques ».
- Introduction Gérant/Employé : « 13 questions sur votre perception de la communication de votre entreprise ».
- « eNPS » devient « indice de recommandation employeur » dans l'introduction.
- Libellés eNPS : « Je déconseillerais d’y travailler », « Je n’ai pas d’avis tranché », « Je recommanderais d’y travailler ».
- Bloc Gérant « Maturité des pratiques » : bandeau bleu → vert, texte blanc, formulation explicative validée.
- Aucun changement SQL ni Edge Function par rapport à H.2.
