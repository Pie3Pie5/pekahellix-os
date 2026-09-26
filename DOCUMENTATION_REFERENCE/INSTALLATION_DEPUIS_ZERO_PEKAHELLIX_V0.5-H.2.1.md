# Pekahellix V0.5-H.2.1 --- Guide d'installation depuis zéro

Ce guide décrit l'ordre recommandé pour reconstruire l'environnement de
production de Pekahellix depuis un projet vierge. Il complète la
spécification maître.

> Important : les interfaces IONOS, Resend, Supabase et GitHub peuvent
> évoluer. Utiliser les libellés courants affichés dans leurs consoles.
> Ne jamais inventer une valeur DNS ou un secret.

## 0. Préparer les éléments

Préparer : - le code source web/PWA correspondant à la spécification
maître ; - les logos/icônes Pekahellix ; - un compte GitHub ; - un
compte Supabase ; - un compte Resend ; - un compte IONOS ; - une adresse
email de récupération/administration ; - le domaine souhaité :
`pekahellix.fr`.

Ne placer aucun secret dans les fichiers publics.

------------------------------------------------------------------------

# 1. IONOS --- domaine et DNS

## 1.1 Acquérir le domaine

1.  Se connecter à IONOS.
2.  Rechercher `pekahellix.fr`.
3.  Vérifier sa disponibilité et les conditions tarifaires affichées.
4.  Acheter/enregistrer le domaine.
5.  Vérifier que le domaine apparaît dans l'espace Domaines & SSL /
    gestion des domaines.
6.  Ouvrir la gestion DNS du domaine.

## 1.2 Règle pour les DNS

Ne créer aucune valeur SPF/DKIM/MX de mémoire.

Lorsque Resend fournit des enregistrements DNS : 1. conserver Resend
ouvert ; 2. ouvrir la zone DNS IONOS ; 3. recopier exactement le
**type**, le **nom/host**, la **valeur/target** et, lorsqu'elle existe,
la priorité ; 4. enregistrer ; 5. attendre la propagation ; 6. relancer
la vérification dans Resend.

Éviter de supprimer un enregistrement existant sans comprendre son rôle,
notamment si le domaine sert aussi à une messagerie IONOS.

------------------------------------------------------------------------

# 2. Resend --- email transactionnel

## 2.1 Ajouter le domaine

1.  Créer/se connecter au compte Resend.
2.  Ajouter le domaine `pekahellix.fr`.
3.  Relever les enregistrements DNS fournis par Resend.
4.  Les ajouter dans IONOS conformément à la section précédente.
5.  Attendre que Resend indique le domaine comme vérifié.

## 2.2 Expéditeur

Utiliser : - Nom : `Pekahellix` - Adresse : `no-reply@pekahellix.fr`

## 2.3 SMTP

Préparer les informations SMTP Resend pour Supabase : - Host :
`smtp.resend.com` - Username : `resend` - Password : secret/API SMTP
fourni par Resend - Port : utiliser le port sécurisé accepté et
recommandé par l'interface Supabase/Resend au moment de la
configuration.

Le secret SMTP ne doit jamais être placé dans le front ou GitHub.

------------------------------------------------------------------------

# 3. Supabase --- projet, base et sécurité

## 3.1 Créer le projet

1.  Créer un nouveau projet Supabase.
2.  Choisir un mot de passe de base de données robuste.
3.  Attendre l'initialisation.
4.  Relever pour le front :
    -   Project URL ;
    -   clé publique/publishable.
5.  Ne jamais copier la Service Role Key dans le front.

## 3.2 Installer le schéma final

Dans **SQL Editor**, exécuter un script d'installation final unique
correspondant à V0.5-H.2.1.

Il doit créer directement : - `profiles` ; - `organizations` ; - les
structures de réponses Communication ; - le suivi de réalisation du
diagnostic Gérant ; - les clés étrangères et index ; - le trigger de
création/synchronisation du profil depuis `auth.users` ; - les droits
modules ; - le profil Communication `employee` / `manager` ; - RLS et
policies ; - grants/revokes ; - fonctions/RPC administratives ; - RPC de
soumission anonyme Employé ; - RPC de restitution Gérant ; - contrôles
d'organisation, de profil, de statut et de diagnostic terminé ; - seuil
d'anonymat de cinq réponses.

Pour une reconstruction depuis zéro, préférer **un script INSTALL
final** aux anciennes migrations G/H.

## 3.3 Vérifier la sécurité

Avant le front : - RLS active sur les tables sensibles ; - aucun INSERT
direct autorisé vers les réponses anonymes depuis le client ; - aucune
lecture brute des réponses Employés par un Gérant ; - restitution
uniquement via RPC agrégée ; - aucun champ d'identité du répondant dans
la table de réponses anonymes ; - contrôle `organization_id` côté
serveur.

------------------------------------------------------------------------

# 4. Supabase --- Edge Function `admin-users`

## 4.1 Déployer

Créer/déployer une Edge Function nommée :

`admin-users`

Elle doit : - recevoir et valider le JWT de l'appelant ; - retrouver son
profil ; - exiger `is_active = true` et le rôle admin ; - utiliser les
privilèges serveur uniquement dans la fonction ; - inviter/créer les
utilisateurs ; - activer/désactiver ; - supprimer ; - gérer prénom/nom
; - gérer accès Temps/Communication/Cybersécurité ; - gérer
`organization_id` ; - gérer le profil Communication Employé/Gérant ; -
répondre correctement aux requêtes CORS du front.

## 4.2 Secrets

Configurer les secrets nécessaires dans l'environnement sécurisé
Supabase/Edge Functions.

La Service Role Key : - reste côté serveur ; - n'est jamais écrite dans
`config.js` ; - n'est jamais committée dans GitHub ; - n'est jamais
affichée dans le navigateur.

## 4.3 Test

Depuis un compte non-admin, vérifier qu'une opération administrative
directe est refusée. Depuis un compte admin actif, vérifier
création/invitation puis désactivation/réactivation.

------------------------------------------------------------------------

# 5. Supabase Auth --- URLs et emails

## 5.1 URLs

Configurer le **Site URL** et les **Redirect URLs** avec l'URL
réellement utilisée par Pekahellix.

Pour une publication GitHub Pages initiale, utiliser l'URL de production
de type :

`https://<utilisateur>.github.io/pekahellix-os/`

Ajouter les URL nécessaires aux parcours invitation et reset password.

Lors d'un changement ultérieur de domaine/hébergement, mettre cette
liste à jour.

## 5.2 Custom SMTP

Dans Supabase Auth / SMTP : - activer Custom SMTP ; - Host :
`smtp.resend.com` ; - Username : `resend` ; - Password : secret SMTP
Resend ; - sender : `no-reply@pekahellix.fr` ; - sender name :
`Pekahellix` ; - port sécurisé selon les options actuellement
supportées.

Tester l'envoi avant de considérer la configuration terminée.

## 5.3 Templates Auth

Appliquer l'identité Pekahellix : - fond `#f4f6f8` ; - carte blanche max
600 px ; - radius 16 px ; - en-tête `#2E86C1` ; - Pekahellix ; - « 3
piliers pour accompagner votre proximité » ; - CTA bleu ; - mention
email automatique.

Configurer : 1. Invite user --- `{{ .ConfirmationURL }}` 2. Reset
password --- `{{ .ConfirmationURL }}` 3. Confirm signup ---
`{{ .ConfirmationURL }}` 4. Change email address ---
`{{ .ConfirmationURL }}` 5. Magic Link --- `{{ .ConfirmationURL }}` 6.
Reauthentication --- `{{ .Token }}`

## 5.4 Security Notifications

Au minimum : - Password changed ; - Email address changed.

Pour chaque notification souhaitée : 1. personnaliser le template ; 2.
activer le toggle ; 3. cliquer sur **Save changes**.

Le toggle seul ne suffit pas.

Tester réellement le parcours Password changed : demande de reset →
email → nouveau mot de passe → notification de modification.

------------------------------------------------------------------------

# 6. Front HTML/CSS/JavaScript/PWA

## 6.1 Configuration publique

Créer un `config.js` séparé contenant uniquement : - Supabase Project
URL ; - clé publique/publishable ; - autres paramètres réellement
publics si nécessaires.

Ne jamais y placer : - Service Role Key ; - secret Resend ; - mot de
passe SMTP ; - secret d'administration.

## 6.2 Fonctionnel

Implémenter : - authentification ; - administration ; - trois modules
; - droits par module ; - profils Communication Employé/Gérant ; -
questionnaires ; - diagnostic ; - soumission anonyme par RPC ; -
restitution Gérant par RPC ; - nettoyage complet des états temporaires
au logout.

## 6.3 PWA

Ajouter : - manifest ; - icônes ; - Service Worker ; - stratégie de
cache versionnée.

Le Service Worker doit ignorer les URL dont l'origine diffère de celle
de l'application, par exemple en appliquant le principe :

`if (url.origin !== self.location.origin) return;`

Ne pas mettre en cache les appels Supabase.

## 6.4 Version

Exposer un marqueur :

`PEKAHELLIX_BUILD`

Versionner également : - références CSS ; - références JS ; - nom du
cache Service Worker.

Cela permet de vérifier immédiatement après déploiement que le
navigateur charge la bonne version.

------------------------------------------------------------------------

# 7. GitHub et GitHub Pages

## 7.1 Dépôt

1.  Créer le dépôt, par exemple `pekahellix-os`.
2.  Ajouter les fichiers web/PWA.
3.  Vérifier qu'aucun secret n'est présent.
4.  Ajouter un `.gitignore` si des fichiers locaux/secrets existent.
5.  Commit/push.

## 7.2 GitHub Pages

1.  Ouvrir les paramètres du dépôt.
2.  Ouvrir Pages.
3.  Choisir la source de publication correspondant à la structure du
    dépôt.
4.  Enregistrer.
5.  Attendre la publication.
6.  Ouvrir l'URL fournie par GitHub.

Exemple de structure d'URL :

`https://<utilisateur>.github.io/pekahellix-os/`

## 7.3 Mise à jour

À chaque nouvelle version : 1. sauvegarder/conserver le `config.js` de
production ; 2. déployer le nouveau package ; 3. ne pas écraser la
configuration publique de production par un fichier d'exemple ; 4.
attendre GitHub Pages ; 5. faire un rechargement forcé ; 6. vérifier
`PEKAHELLIX_BUILD` ; 7. tester la PWA et le Service Worker.

------------------------------------------------------------------------

# 8. Recette finale V0.5-H.2.1

Effectuer les tests dans cet ordre.

### Authentification

-   invitation ;
-   activation ;
-   connexion ;
-   mot de passe oublié ;
-   reset ;
-   notification Password changed ;
-   compte désactivé/refusé ;
-   réactivation.

### Administration

-   création d'une organisation ;
-   création Employé ;
-   création Gérant ;
-   attribution des modules ;
-   modification ;
-   désactivation ;
-   suppression.

### Communication Employé

-   seul le questionnaire Employé est visible ;
-   13 questions de perception ;
-   indice de recommandation employeur ;
-   libellés 0--6 / 7--8 / 9--10 corrects ;
-   aucune « Maturité des pratiques » ;
-   soumission réussie ;
-   aucune identité stockée avec la réponse.

### Communication Gérant

-   seul le questionnaire Gérant est visible ;
-   questions miroir + maturité ;
-   bandeau Maturité bleu→vert et texte blanc ;
-   texte explicatif validé ;
-   accès « Voir les résultats de mon équipe » directement après le
    questionnaire ;
-   « Refaire mon diagnostic » secondaire.

### Sécurité/anonymat

-   INSERT direct vers les réponses refusé ;
-   Employé incapable d'appeler la restitution Gérant ;
-   Gérant incapable de lire une autre organisation ;
-   moins de cinq réponses : aucune statistique détaillée ;
-   cinq réponses ou plus : restitution agrégée ;
-   périodes 30/90/180/365.

### Sessions

Tester sans terminer les questionnaires :

**Employé → déconnexion → Gérant → déconnexion → Employé**

À chaque connexion, le bon questionnaire doit apparaître immédiatement.
Aucun état du compte précédent ne doit être repris.

### Admin/Test

Les profils techniques Admin/Test doivent pouvoir tester les deux
questionnaires sans modifier le comportement des utilisateurs
ordinaires.

### PWA

-   installation possible ;
-   responsive smartphone ;
-   responsive ordinateur ;
-   aucune requête Supabase mise en cache par le Service Worker ;
-   nouvelle version correctement chargée après déploiement.

------------------------------------------------------------------------

# 9. Sauvegarde et documentation

Conserver ensemble : - le package web stable ; - le script SQL final
d'installation ; - l'Edge Function finale ; - les templates email ; -
cette spécification maître ; - ce guide d'installation ; - les
logos/icônes ; - un README de déploiement.

Ne jamais archiver les secrets dans ce package.

------------------------------------------------------------------------

# 10. Point de départ V0.6

Une fois cette recette validée, figer V0.5-H.2.1 comme référence web/PWA
et démarrer une branche d'appisation séparée.

Paramètres déjà décidés : - **Application ID : `fr.pekahellix`** - **Nom
visible : `Pekahellix`**

La V0.6 doit envelopper la version stable avec Capacitor sans réécrire
inutilement le cœur HTML/CSS/JavaScript.
