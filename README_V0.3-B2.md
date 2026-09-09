# Pekahellix OS — V0.3-B.2

## Objectif

Cette version corrige le test sur smartphone lorsque `index.html` est ouvert directement comme fichier.

Le projet est maintenant livré avec un petit serveur HTTP de test basé uniquement sur **PowerShell**, déjà présent sur Windows. **Python n'est pas nécessaire.**

## Tester sur smartphone

1. Décompressez le ZIP sur votre PC Windows.
2. Ouvrez le dossier `Pekahellix_OS_v0.3-B.2`.
3. Double-cliquez sur `DEMARRER_TEST_MOBILE.bat`.
4. Une fenêtre noire doit rester ouverte et afficher une adresse du type :
   `http://192.168.1.25:8000`
5. Connectez le smartphone au **même Wi-Fi** que le PC.
6. Ouvrez Chrome/Safari sur le smartphone et saisissez l'adresse affichée.
7. Testez : connexion, ouverture des 3 applications, boutons et retour accueil.

### Important

- **Ne lancez pas `index.html` directement sur le smartphone.**
- La fenêtre noire doit rester ouverte pendant tout le test.
- Pour arrêter le serveur : `Ctrl+C` dans la fenêtre noire.
- Si Windows demande une autorisation de pare-feu, autorisez le serveur sur le réseau **privé** uniquement, si cette option est proposée.

## Si l'adresse n'est pas accessible

Vérifiez que le PC et le smartphone sont sur le même Wi-Fi et que le réseau Windows est configuré comme réseau privé.

Si nécessaire, communiquez-moi exactement ce qui est affiché dans la fenêtre noire : je vous guiderai sans installer Python.
