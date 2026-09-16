# Pekahellix OS V0.5-H.1 — Communication 360°

## Communication
- Refonte des questionnaires en architecture miroir.
- Gérant : 13 questions de perception miroir (6 externes + 7 internes) + 8 questions de maturité des pratiques.
- Employé : les mêmes 13 dimensions miroir + eNPS 0–10 + une question qualitative libre.
- Nouveau scoring miroir : 1=0 %, 2=33 %, 3=67 %, 4=100 %.
- La maturité des pratiques est affichée séparément de la perception.
- eNPS sorti du score de communication et calculé selon Détracteurs 0–6 / Passifs 7–8 / Promoteurs 9–10.
- Seuil d'affichage des résultats employés : 3 réponses anonymisées minimum.
- Les réponses envoyées portent désormais un identifiant de question, une dimension et un type (`mirror`, `nps`, `qualitative`).

## Base Supabase
- Migration `SUPABASE_V0.5-H.1.sql`.
- Ajout de `scoring_version` afin de ne pas mélanger les anciennes réponses avec le nouveau modèle 360°.
- Les nouvelles réponses utilisent `360-v1`.
- Le rapport employé ne retourne que des agrégats et reste soumis au droit `access_communication_report`.
- Aucune lecture directe de `communication_employee_responses` n'est accordée aux rôles client.

## Périmètre
- Aucun résultat Client n'est ajouté à Pekahellix OS dans cette version.
- Le futur résultat Client reste réservé à l'administrateur et sera intégré dans une application distincte / couche 360° dédiée.
