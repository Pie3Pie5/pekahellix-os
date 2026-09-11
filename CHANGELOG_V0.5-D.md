# Pekahellix OS — V0.5-D

## Mot de passe oublié
- Ajout du lien « Mot de passe oublié ? » sur l'écran de connexion.
- Demande de réinitialisation par e-mail via Supabase Auth + Resend.
- Message neutre afin de ne pas révéler si une adresse possède un compte.
- Détection du retour Supabase `type=recovery` et de l'événement `PASSWORD_RECOVERY`.
- Nouvel écran de création du mot de passe.
- Même politique de mot de passe que l'activation : 8 caractères, majuscule, minuscule, chiffre, caractère spécial.
- Confirmation obligatoire du nouveau mot de passe.
- Déconnexion de la session temporaire puis retour à la connexion après succès.
- Cache PWA incrémenté en `pekahellix-v0.5-d`.
