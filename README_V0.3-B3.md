# Pekahellix OS — V0.3-B.3

Cette version contourne les politiques Windows qui interdisent l'exécution de scripts PowerShell `.ps1` non signés.

## Test mobile

1. Décompresser entièrement le ZIP sur le PC.
2. Garder `DEMARRER_TEST_MOBILE.bat` et `SERVEUR_TEST_MOBILE.txt` dans le même dossier que `index.html`.
3. Double-cliquer sur `DEMARRER_TEST_MOBILE.bat`.
4. La fenêtre doit rester ouverte.
5. Relever l'adresse affichée sous la forme `http://192.168.x.x:8000`.
6. Connecter le smartphone au même réseau Wi-Fi que le PC et ouvrir cette adresse dans Chrome/Safari.
7. Si Windows demande une autorisation de pare-feu, autoriser le réseau privé uniquement si cela correspond au réseau utilisé.

## Pourquoi cette version ?

Le serveur PowerShell n'est plus lancé comme fichier `.ps1`. Le fichier `SERVEUR_TEST_MOBILE.txt` est lu comme du texte puis exécuté dans la session PowerShell démarrée par le fichier BAT. Cela évite le blocage `PSSecurityException` lié à la signature des fichiers `.ps1` dans les environnements d'entreprise.

Si l'entreprise applique également AppLocker, WDAC ou le mode PowerShell contraint, un nouveau message d'erreur peut apparaître. Dans ce cas, recopier ce message pour déterminer la prochaine méthode de test.
