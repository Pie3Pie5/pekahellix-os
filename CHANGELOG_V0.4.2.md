# Pekahellix OS — V0.4.2

## Correction principale
- La barre Temps / Communication / Cyber est sortie du conteneur du bureau.
- Elle devient une navigation globale au niveau racine de la page.
- Son z-index est supérieur à celui des fenêtres d’applications.
- Elle est visible uniquement après connexion et reste affichée quand un module est ouvert.
- Le module actif reste mis en évidence.

## PWA
- Cache renommé en `pekahellix-v0.4.2.0`.
- Les navigations HTML utilisent désormais une stratégie réseau d’abord, puis cache hors connexion, afin de faciliter les mises à jour via GitHub Pages.
