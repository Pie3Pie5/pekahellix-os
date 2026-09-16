# Pekahellix OS V0.5-H.2 — Profils Communication & sécurisation du parcours

Base de déploiement : production G.3.4. H.2 contient les évolutions H.1 (questions miroir) et la sécurisation décidée ensuite.

## Ordre de mise à jour
1. Dans Supabase SQL Editor, exécuter `SUPABASE_V0.5-H.2.sql` (inutile d'exécuter H.1 séparément).
2. Remplacer le code de l'Edge Function `admin-users` par `supabase/functions/admin-users/index.ts`, puis la redéployer.
3. Déployer les fichiers web H.2 en **conservant votre `config.js` de production**.
4. Recharger/fermer-réouvrir la PWA si nécessaire pour prendre le cache H.2.

## Ce qui change
- Questions Communication 360° de H.1.
- Profil Communication `Employé` / `Gérant` à la création et à la modification des utilisateurs.
- Un user Employé ne peut plus lancer le questionnaire Gérant ; un user Gérant ne peut plus lancer le questionnaire Employé.
- Contrôle identique côté Supabase : masquer un bouton ne constitue pas la sécurité.
- Le questionnaire Gérant terminé est enregistré côté serveur.
- La restitution équipe exige : compte actif, Communication, même entreprise, profil Gérant, droit dérivé Gérant et diagnostic Gérant terminé.
- Le bouton `Voir les résultats de mon équipe` apparaît directement à la fin du diagnostic Gérant après validation serveur.
- Seuil d'anonymat conservé à **5 réponses**.
- Les rôles techniques `admin` / `test` restent distincts du profil métier Communication.

## Migration des utilisateurs existants
Pour éviter de casser les comptes G.3.4 :
- user Communication avec ancien `access_communication_report=true` → `manager` ;
- autre user Communication → `employee`.

## Tests minimaux
1. Employé : seul parcours Employé visible ; appel RPC Gérant refusé.
2. Gérant avant questionnaire : appel direct au rapport refusé.
3. Gérant termine ses 21 questions : bouton résultats équipe visible immédiatement.
4. Moins de 5 réponses Employé : verrou d'anonymat.
5. 5 réponses ou plus : restitution agrégée.
6. Déconnexion/reconnexion : aucun état temporaire d'un autre utilisateur n'est repris.
