# Pekahellix OS V0.5-F.10

Correctif ciblé avant V0.5-G.1.

## Test activation
1. Créer/inviter un utilisateur.
2. Ouvrir le lien d'invitation.
3. Vérifier que le logo est visible en entier en haut.
4. Faire défiler la page jusqu'au bouton "Activer mon compte".
5. Vérifier la création du mot de passe.

## E-mail d'invitation en français
Le SMTP Resend ne décide pas du contenu de l'e-mail. Le modèle d'invitation est géré par Supabase.
Voir `SUPABASE_INVITATION_EMAIL_V0.5-F.10.txt` et coller le modèle HTML fourni dans Authentication > Email Templates > Invite user.
