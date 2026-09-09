# Changelog V0.3-B.3

- Suppression du lancement direct d'un fichier PowerShell `.ps1`.
- Le serveur local est désormais stocké dans `SERVEUR_TEST_MOBILE.txt`.
- Le fichier BAT charge ce texte puis crée un ScriptBlock dans la session PowerShell.
- Aucun changement permanent de la stratégie d'exécution Windows.
- La console reste ouverte en cas d'erreur grâce à `pause`.
