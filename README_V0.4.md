# Pekahellix OS — V0.4 PWA

## Objectif
Transformer la V0.3 mobile validée en Progressive Web App installable.

## Ajouts
- manifest.webmanifest (nom, couleurs, mode standalone, icônes)
- icônes 192×192 et 512×512
- service worker `sw.js`
- cache de l'interface principale pour un premier fonctionnement hors ligne
- enregistrement automatique du service worker
- balise Apple Touch Icon

## Important pour le test
Une PWA et son service worker ne fonctionnent pas correctement en ouvrant simplement `index.html` en `file://`.
Il faut publier ce dossier sur une adresse HTTPS (ou utiliser localhost pendant le développement).

Compte tenu des restrictions du PC professionnel, la prochaine étape recommandée est donc de publier cette V0.4 sur un hébergement HTTPS de test, puis de l'ouvrir sur le smartphone.

## Critères de validation V0.4
1. L'application s'ouvre via HTTPS sur smartphone.
2. La connexion et les 3 modules fonctionnent comme en V0.3.
3. Le navigateur propose l'installation / ajout à l'écran d'accueil selon la plateforme.
4. Une fois installée, l'application s'ouvre sans barre d'adresse en mode standalone.
5. Après une première ouverture en ligne, l'interface principale peut être rechargée hors connexion.

## Limite connue
L'authentification reste une authentification de démonstration côté navigateur. Elle sera sécurisée lors de l'étape backend prévue dans la roadmap.
