# Déploiement V0.5-H.2.1

Base : V0.5-H.2 déjà déployée (SQL + Edge Function).

Cette version est un correctif front uniquement : aucun SQL et aucune Edge Function à redéployer.

1. Déployer les fichiers web H.2.1 en conservant impérativement le `config.js` de production.
2. Faire un rechargement forcé.
3. Vérifier `PEKAHELLIX_BUILD` => `0.5-H.2.1`.
4. Test prioritaire : Employé → déconnexion → Gérant → déconnexion → Employé, sans terminer de questionnaire entre les connexions. Chaque utilisateur ordinaire ne doit voir que son parcours.
