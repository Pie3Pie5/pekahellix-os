# Pekahellix OS — V0.5-C

- Ajout du parcours d’activation des comptes invités.
- Détection du retour Supabase `type=invite`.
- Écran dédié de création du premier mot de passe.
- Politique mot de passe : 8 caractères minimum, majuscule, minuscule, chiffre, caractère spécial.
- Confirmation du mot de passe.
- Mise à jour du mot de passe via `supabase.auth.updateUser`.
- Déconnexion automatique après activation puis retour à l’écran de connexion.
- Redirection d’invitation fixée explicitement vers GitHub Pages `/pekahellix-os/`.
- Cache PWA incrémenté en `pekahellix-v0.5-c`.
