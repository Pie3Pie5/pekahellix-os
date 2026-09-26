# Pekahellix --- Spécification maître

## Version de référence : V0.5-H.2.1

**Statut : version web/PWA stable validée avant appisation Capacitor**\
**Nom du produit : Pekahellix**\
**Identifiant prévu pour l'application mobile : `fr.pekahellix`**\
**Domaine : `pekahellix.fr`**\
**Signature : « 3 piliers pour accompagner votre proximité »**

## 1. Objet du document

Ce document décrit directement le résultat fonctionnel et technique
attendu de Pekahellix V0.5-H.2.1. Il ne retrace pas l'historique des
versions ni les corrections successives.

Il doit permettre : - de reconstruire le projet depuis zéro ; - de
transmettre le projet à un nouveau chat ou à un intervenant technique
; - de servir de cahier des charges avant la phase V0.6
Capacitor/Android ; - de distinguer clairement le front web, Supabase,
GitHub, le domaine et l'email transactionnel.

## 2. Prompt maître à utiliser pour reconstruire le projet

> Je souhaite développer de zéro une application web/PWA appelée
> **Pekahellix**, destinée à l'accompagnement organisationnel des
> entreprises. Je réalise le projet moi-même avec ton aide et je veux
> recevoir des **packages complets, cohérents et versionnés**, plutôt
> qu'une succession de correctifs ponctuels.
>
> L'application doit être conçue dès le départ pour pouvoir ensuite être
> transformée en application Android/iOS avec Capacitor. Pour cette
> phase, réalise uniquement la version web/PWA stable.
>
> ### Architecture générale
>
> L'application comporte trois modules indépendants :
>
> -   **Gestion du Temps** : identité visuelle orange ;
> -   **Communication** : identité visuelle bleue, avec vert
>     complémentaire pour la communication interne ;
> -   **Cybersécurité** : identité visuelle verte.
>
> L'interface doit être responsive, pensée en priorité pour smartphone
> et confortable sur ordinateur. Elle doit fonctionner comme une PWA
> installable avec manifest, icônes et Service Worker. Le Service Worker
> ne doit pas intercepter ni mettre en cache les requêtes cross-origin,
> notamment Supabase.
>
> L'écran d'authentification utilise le logo Pekahellix gris ; l'en-tête
> connecté utilise le logo blanc. Sur mobile, la date doit être
> physiquement centrée indépendamment des éléments situés à droite.
>
> Sépare strictement le code public et les secrets. Le navigateur ne
> doit connaître que l'URL Supabase et la clé publique/publishable. La
> Service Role Key Supabase ne doit jamais apparaître dans le HTML,
> JavaScript, GitHub ou le navigateur.
>
> ### Authentification et administration
>
> Utilise Supabase Auth avec email + mot de passe. Les utilisateurs
> normaux ne s'inscrivent pas librement : ils sont créés/invités par un
> administrateur depuis Pekahellix.
>
> Prévois les rôles techniques `admin`, `user` et `test`, un statut
> actif/inactif et trois autorisations de modules indépendantes : Temps,
> Communication et Cybersécurité.
>
> Depuis l'administration Pekahellix, un administrateur doit pouvoir
> créer/inviter un utilisateur, saisir prénom, nom et email, choisir ses
> modules, l'affecter à une entreprise, choisir son profil Communication
> lorsqu'il est concerné, activer/désactiver son compte et le supprimer.
>
> Les opérations sensibles doivent être sécurisées côté serveur. Un
> utilisateur normal ne peut modifier que ses propres informations
> autorisées.
>
> Ajoute « Mot de passe oublié », la réception de l'email de
> réinitialisation et le choix du nouveau mot de passe.
>
> Lors d'une déconnexion explicite, supprime tous les états temporaires
> des questionnaires et résultats. Un utilisateur connecté ensuite sur
> le même appareil ne doit jamais hériter de l'état du précédent. En
> revanche, une navigation entre modules sans déconnexion peut conserver
> l'état du questionnaire en cours.
>
> ### Multi-entreprises
>
> L'application doit être multi-tenant. Crée une table `organizations`
> avec au minimum UUID, nom unique et date de création. Chaque
> utilisateur concerné possède une `organization_id`.
>
> Toutes les données Communication sont cloisonnées par organisation.
> Aucun gérant ne doit pouvoir obtenir les données d'une autre
> organisation. Cette règle doit être appliquée côté Supabase/RPC/RLS,
> pas uniquement dans le JavaScript.
>
> ### Profils Communication
>
> Distingue le rôle technique du profil fonctionnel Communication :
>
> -   `employee` = Employé ;
> -   `manager` = Gérant.
>
> Pour un utilisateur normal ayant accès à Communication,
> l'administrateur choisit Employé ou Gérant.
>
> Un Employé accède uniquement au questionnaire Employé. Un Gérant
> accède uniquement au questionnaire Gérant. Les comptes Admin/Test
> peuvent accéder aux deux parcours pour les tests.
>
> Les restrictions doivent exister dans l'interface **et** côté Supabase
> afin qu'une manipulation du JavaScript ou un appel direct à une RPC ne
> permette pas de contourner les droits.
>
> ### Questionnaire Communication Employé
>
> Prévois **13 questions sur la perception de la communication de
> l'entreprise**, réparties entre Communication externe et Communication
> interne. Les questions miroir doivent disposer d'identifiants stables,
> par exemple `EXT-xx` et `INT-xx`, afin de permettre les comparaisons
> question par question.
>
> Ajoute un **indice de recommandation employeur** sur 0--10 et une
> question libre.
>
> Conserve le calcul eNPS en interne mais n'affiche pas le jargon
> eNPS/détracteur/passif/promoteur. Affiche :
>
> -   0--6 : **« Je déconseillerais d'y travailler »** ;
> -   7--8 : **« Je n'ai pas d'avis tranché »** ;
> -   9--10 : **« Je recommanderais d'y travailler »**.
>
> Le bloc « Maturité des pratiques » ne doit jamais apparaître dans le
> parcours Employé.
>
> ### Questionnaire Communication Gérant
>
> Reprends les **13 questions miroir sur la perception de la
> communication de l'entreprise** et ajoute **8 questions de maturité
> organisationnelle**, distinctes des perceptions, destinées à mesurer
> les dispositifs réellement structurés.
>
> À la restitution, affiche :
>
> **« Score de maturité : XX %. Cet indicateur mesure les dispositifs
> réellement structurés dans votre organisation. Il complète votre
> perception de la communication et sera analysé séparément de celle de
> vos employés et de vos clients. »**
>
> Le bandeau « Maturité des pratiques » utilise une police blanche et un
> fond harmonieux bleu → vert reprenant les couleurs de Communication
> externe et Communication interne.
>
> ### Anonymat Employé
>
> Les réponses Employés doivent être réellement anonymes.
>
> Le navigateur ne doit pas effectuer d'INSERT direct dans la table des
> réponses. Crée une RPC Supabase `SECURITY DEFINER` dédiée à la
> soumission.
>
> Elle utilise `auth.uid()` uniquement pour vérifier que le compte est
> actif, autorisé à Communication, rattaché à une organisation et de
> profil `employee`. Elle stocke ensuite l'organisation, les réponses
> JSON et les scores nécessaires, mais **jamais l'ID utilisateur, le
> nom, le prénom ou l'email du répondant**.
>
> Révoque les accès directs inutiles à la table et active la RLS.
>
> ### Restitution Gérant
>
> Le gérant ne peut consulter les résultats de son équipe qu'après avoir
> terminé son propre questionnaire Gérant. Enregistre cette réalisation
> côté Supabase : elle ne doit pas dépendre d'une simple variable
> JavaScript.
>
> À la fin du questionnaire Gérant, affiche directement **« Voir les
> résultats de mon équipe »**. Il ne doit pas être nécessaire de cliquer
> sur « Recommencer ». « Refaire mon diagnostic » reste une action
> secondaire.
>
> La RPC de restitution vérifie côté serveur : compte actif,
> organisation, accès Communication, profil `manager` et diagnostic
> Gérant terminé.
>
> Les statistiques Employés ne deviennent visibles qu'à partir de **5
> réponses anonymes**. Sous ce seuil, retourne uniquement le nombre de
> réponses et un message expliquant que cinq réponses sont nécessaires
> pour préserver l'anonymat.
>
> Propose les périodes 30, 90, 180 et 365 jours.
>
> Au-dessus du seuil, retourne au minimum : nombre de réponses, moyenne
> Communication externe, moyenne Communication interne, moyenne de
> l'indice de recommandation employeur, distribution 0--6 / 7--8 / 9--10
> et moyennes question par question.
>
> ### Gestion du Temps et Cybersécurité
>
> Conserve ces modules comme questionnaires/diagnostics autonomes avec
> leurs identités visuelles. Ils disposent d'une navigation question par
> question, d'un diagnostic final et d'une fonction permettant de
> recommencer.
>
> Dans Gestion du Temps, les cartes d'exemples/pistes d'autonomie sont
> purement informatives : aucun hover, déplacement, changement de
> bordure, ombre ou réaction tactile ne doit les faire paraître
> cliquables.
>
> ### Supabase depuis un projet vierge
>
> Fournis **un script SQL d'installation initiale complet et
> idempotent**, représentant directement l'état final du projet et non
> l'historique des migrations.
>
> Il doit créer toutes les tables, clés étrangères, contraintes, index,
> triggers, RLS, policies, grants/revokes et RPC nécessaires : profils,
> organisations, réponses Communication, suivi du diagnostic Gérant,
> administration, soumission anonyme Employé et restitution Gérant.
>
> Fournis une Edge Function **`admin-users`** complète. Elle vérifie le
> JWT de l'appelant, son statut actif et son rôle admin, puis utilise la
> Service Role Key uniquement côté serveur pour inviter/créer,
> activer/désactiver et supprimer des utilisateurs. Elle gère
> organisation, accès aux modules et profil Communication. Configure
> CORS pour le front.
>
> Indique précisément les secrets à enregistrer dans Supabase. Ne place
> jamais la Service Role Key dans le dépôt ou le front.
>
> ### Emails Supabase
>
> Fournis les templates HTML d'authentification Pekahellix avec :
>
> -   fond `#f4f6f8` ;
> -   carte blanche centrée, max 600 px, coins arrondis ;
> -   en-tête bleu `#2E86C1` ;
> -   nom **Pekahellix** ;
> -   slogan **« 3 piliers pour accompagner votre proximité »** ;
> -   boutons bleus ;
> -   pied de page indiquant qu'il s'agit d'un email automatique.
>
> Prépare : invitation/activation, reset password, confirmation
> d'inscription, changement d'adresse email, Magic Link et
> réauthentification. Utilise `{{ .ConfirmationURL }}` pour les liens et
> `{{ .Token }}` pour le code de réauthentification.
>
> Prépare également les Security Notifications, notamment Password
> changed et Email address changed. Rappelle qu'il faut **activer le
> toggle puis cliquer sur Save changes**.
>
> ### Domaine et Resend
>
> Je veux utiliser **`pekahellix.fr`**, acheté chez **IONOS**, et
> **Resend** pour l'envoi transactionnel.
>
> Guide-moi depuis l'acquisition du domaine jusqu'à la zone DNS IONOS.
> Pour la vérification/authentification Resend, ne fabrique aucune
> valeur DNS : demande-moi d'utiliser exactement les enregistrements
> fournis par Resend.
>
> L'expéditeur est **Pekahellix <no-reply@pekahellix.fr>**.
>
> Configure ensuite Supabase Custom SMTP avec Resend : serveur
> `smtp.resend.com`, utilisateur `resend`, secret SMTP/API conservé hors
> du code, et port sécurisé compatible avec la configuration courante.
>
> ### GitHub
>
> Structure le projet pour GitHub et GitHub Pages. Explique la création
> du dépôt, le dépôt des fichiers, l'activation de Pages et la
> vérification de la publication.
>
> Prévois un `config.js` séparé ne contenant que les paramètres publics
> Supabase. Lors des mises à jour, le `config.js` de production doit
> être conservé.
>
> Ajoute `PEKAHELLIX_BUILD` dans le front et versionne les références
> CSS/JS ainsi que le nom du cache Service Worker afin d'éviter les
> anciennes versions en cache.
>
> ### Méthode de livraison
>
> À chaque jalon, fournis un ZIP complet, cohérent et versionné avec
> README, changelog et tous les fichiers nécessaires. Si SQL ou Edge
> Function changent, inclus-les dans le package.
>
> Fais-moi avancer **une étape à la fois** : SQL → vérification → Edge
> Function → vérification → front → vérification → recette.
>
> ### Recette obligatoire
>
> Fais tester : invitation/authentification ; mot de passe oublié ;
> notification de changement de mot de passe ; activation/désactivation
> ; isolation des organisations ; droits modules ; Employé uniquement ;
> Gérant uniquement ; Admin/Test sur les deux parcours ; Employé →
> déconnexion → Gérant → déconnexion → Employé ; soumission anonyme ;
> absence d'identité dans les réponses ; impossibilité d'INSERT direct ;
> impossibilité pour un Employé d'obtenir la restitution ; accès Gérant
> aux résultats immédiatement après son diagnostic ; seuil de cinq
> réponses ; restitution complète à cinq réponses ou plus ; périodes
> 30/90/180/365 ; responsive ; nettoyage de session ; fonctionnement PWA
> et absence d'interception cross-origin par le Service Worker.
>
> Le résultat final doit constituer la **version web/PWA stable
> précédant Capacitor**. Ne commence pas encore Android/iOS.

## 3. Architecture de référence

  -----------------------------------------------------------------------
  Couche                              Responsabilité
  ----------------------------------- -----------------------------------
  Front HTML/CSS/JS                   Interface, navigation,
                                      questionnaires, diagnostics,
                                      affichage des droits et résultats

  PWA                                 Manifest, icônes, Service Worker,
                                      cache versionné

  Supabase Auth                       Sessions, invitations, reset
                                      password, redirections

  Supabase Database                   Profils, organisations, réponses,
                                      droits, état des diagnostics

  Supabase RLS/RPC                    Cloisonnement, anonymat, contrôles
                                      serveur, agrégations

  Edge Function `admin-users`         Opérations administratives
                                      nécessitant les privilèges serveur

  Resend                              Transport SMTP transactionnel

  IONOS                               Domaine `pekahellix.fr` et DNS

  GitHub                              Source, historique et GitHub Pages

  `config.js`                         URL Supabase + clé publique
                                      uniquement
  -----------------------------------------------------------------------

## 4. Principes de sécurité non négociables

1.  Ne jamais exposer la Supabase Service Role Key dans le front.
2.  Ne jamais mettre de secret SMTP/API dans GitHub.
3.  Ne jamais considérer un bouton masqué comme une protection d'accès.
4.  Contrôler les autorisations sensibles côté Supabase.
5.  Cloisonner toutes les données d'entreprise par `organization_id`.
6.  Ne stocker aucune identité dans les réponses anonymes Employés.
7.  Interdire l'accès direct client aux données qui doivent passer par
    RPC.
8.  Conserver un seuil de restitution de cinq réponses Employés.
9.  Réinitialiser les états temporaires à la déconnexion.
10. Préserver `config.js` lors des mises à jour du front.

## 5. État fonctionnel de référence avant V0.6

La V0.5-H.2.1 est considérée comme stable lorsque : - les profils
Employé/Gérant sont correctement isolés dès la connexion ; - Admin/Test
peuvent tester les deux questionnaires ; - aucun état Communication ne
fuit entre deux comptes ; - le questionnaire Employé n'affiche aucune
maturité ; - le questionnaire Gérant affiche la maturité avec le bandeau
bleu-vert ; - le gérant accède aux résultats équipe immédiatement après
son questionnaire ; - la restitution respecte le seuil de cinq réponses
; - les réponses Employés restent anonymes et cloisonnées par
organisation ; - la PWA, Supabase Auth et les emails transactionnels
fonctionnent.

La phase suivante est **V0.6 --- Capacitor / Android**, avec : -
Application ID : `fr.pekahellix` - Nom visible : `Pekahellix`
