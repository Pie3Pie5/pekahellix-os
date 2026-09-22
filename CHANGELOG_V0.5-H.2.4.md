# V0.5-H.2.4 — Campagnes Clients

- Ajout d’un champ métier `stage` (`T0`, `T+3`, `T+6`) indépendant du libellé.
- Migration automatique des campagnes historiques, dont `T0 - Campagne test`.
- Nettoyage sûr des doublons actifs sans réponse ; aucune réponse client n’est supprimée.
- Unicité en base sur `organization_id + stage` pour les campagnes actives.
- Protection identique lors de la réouverture d’une campagne.
- Messages Admin explicites en cas de doublon.
- Conservation de la date de fin et de la suppression des campagnes sans réponse.
- Cache PWA incrémenté en H.2.4.
