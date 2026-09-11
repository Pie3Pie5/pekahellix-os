# Pekahellix OS — V0.5-D

Cette version ajoute le parcours « Mot de passe oublié » à la V0.5-C validée.

## Parcours
Connexion → Mot de passe oublié → e-mail → lien sécurisé → nouveau mot de passe → reconnexion.

## Important lors du déploiement
Conserver le `config.js` déjà configuré en production avec l'URL Supabase et la publishable key.
Ne jamais publier de service role key, clé Resend ou mot de passe SMTP dans le front-end.

## Configuration Supabase attendue
Le Site URL et la Redirect URL doivent autoriser l'URL publique de Pekahellix.
Le template Reset Password doit contenir un lien basé sur `{{ .ConfirmationURL }}`.
