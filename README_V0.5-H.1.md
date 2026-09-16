# Pekahellix OS V0.5-H.1

Cette version introduit la première brique du modèle **Communication 360°** sans intégrer encore l'application Client.

## Installation
1. Déployer les fichiers de la V0.5-H.1.
2. Dans Supabase SQL Editor, exécuter `SUPABASE_V0.5-H.1.sql` après les migrations déjà appliquées de la branche G.3.x.
3. Recharger l'application en vidant l'ancien cache PWA si nécessaire ; le cache porte désormais la version `v0.5-h.1`.

## Test conseillé
- Gérant : vérifier 21 questions et trois résultats (externe, interne, maturité).
- Employé : vérifier 13 questions miroir, le curseur eNPS 0–10 et la question libre.
- Envoyer trois questionnaires Employé depuis des comptes rattachés à la même organisation.
- Vérifier qu'avant 3 réponses, aucun résultat agrégé n'est affiché.
- Vérifier qu'à partir de 3 réponses, le gérant autorisé voit les scores agrégés, l'eNPS et les tendances par dimension.
- Vérifier qu'un utilisateur sans `access_communication_report` ne peut pas ouvrir la restitution.
