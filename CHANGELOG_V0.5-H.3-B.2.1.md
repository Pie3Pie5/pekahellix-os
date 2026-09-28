# V0.5-H.3-B.2.1

Correctif du chargement du dashboard Communication 360°.

- Correction d'une référence JavaScript erronée : `COMM_QUESTIONS_EMPLOYE` remplacé par la constante existante `COMM_QUESTIONS_SALARIE`.
- Cette erreur survenait pendant le rendu des rappels de questions après le retour HTTP 200 des vues Supabase et laissait l'interface sur « Chargement du diagnostic 360°… ».
- Mise à jour du cache Service Worker afin de forcer la prise en compte des fichiers corrigés après déploiement.
- `DEMARRER_TEST_MOBILE.bat` exclu du ZIP.
