# V0.5-C — Activation de compte

## Parcours
1. Un administrateur crée un utilisateur.
2. Supabase/Resend envoie l’invitation.
3. Le lien revient vers `https://pie3pie5.github.io/pekahellix-os/`.
4. Pekahellix détecte `type=invite` et affiche l’écran de création du mot de passe.
5. Après validation, le mot de passe est enregistré dans Supabase Auth.
6. L’utilisateur est déconnecté puis invité à se connecter avec son nouveau mot de passe.

## Déploiement
Conserver votre `config.js` déjà configuré sur GitHub. Ne remplacez pas votre URL/clé publiable Supabase par les valeurs d’exemple du ZIP si votre dépôt possède déjà les bonnes valeurs.
