/* ============================================================
   PEKAHELLIX OS — Gestionnaire unifié des 3 applications
   Apps : Gestion du Temps · Communication · Cybersécurité
   Architecture : 100% front-end, données embarquées
   ============================================================ */
"use strict";

/* ============================================================
   SUPABASE — AUTHENTIFICATION V0.5-A
   ============================================================ */
let supabaseClient = null;

function initSupabase() {
  const cfg = window.PEKAHELLIX_CONFIG || {};
  if (!window.supabase || !cfg.supabaseUrl || !cfg.supabasePublishableKey ||
      cfg.supabaseUrl.includes("A_REMPLACER") || cfg.supabasePublishableKey.includes("A_REMPLACER")) {
    return false;
  }
  supabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  return true;
}

/* ============================================================
   ██  APP : GESTION DU TEMPS — DONNÉES  ██
   ============================================================ */
const TEMPS_QUESTIONS = [
  { axe:0, text:"Lorsque vous commencez votre journée, comment choisissez-vous la première tâche à traiter ?", answers:[{text:"Je traite ce qui arrive en premier (e-mails, appels, demandes urgentes).",score:1},{text:"Je choisis instinctivement ce qui me semble important.",score:2},{text:"Je consulte ma liste de tâches et je priorise selon l'urgence et l'importance.",score:3},{text:"J'ai planifié la veille ma tâche la plus importante (MIT) et je commence par elle.",score:4}]},
  { axe:0, text:"Utilisez-vous la Matrice d'Eisenhower (Urgent/Important) pour classer vos tâches ?", answers:[{text:"Je ne connais pas cet outil.",score:1},{text:"J'en ai entendu parler mais je ne l'utilise pas.",score:2},{text:"Je l'utilise occasionnellement pour les décisions importantes.",score:3},{text:"Je l'applique systématiquement chaque semaine pour planifier mon activité.",score:4}]},
  { axe:0, text:"Combien de fois par jour êtes-vous interrompu par des tâches non planifiées ?", answers:[{text:"Constamment — je ne contrôle pas mon agenda.",score:1},{text:"Souvent — plusieurs fois par heure.",score:2},{text:"Parfois — j'essaie de protéger des plages de travail concentré.",score:3},{text:"Rarement — j'ai des plages de « deep work » bloquées et respectées.",score:4}]},
  { axe:0, text:"En fin de journée, quel est votre sentiment sur les tâches accomplies ?", answers:[{text:"J'ai été très occupé mais je n'ai pas avancé sur ce qui compte vraiment.",score:1},{text:"J'ai traité beaucoup d'urgences mais peu de projets stratégiques.",score:2},{text:"J'ai accompli la plupart de mes priorités du jour.",score:3},{text:"J'ai accompli mes 3 tâches prioritaires et j'ai planifié le lendemain.",score:4}]},
  { axe:0, text:"Utilisez-vous une méthode de priorisation formelle (ABCDE, MoSCoW, ICE Score…) ?", answers:[{text:"Non, je fonctionne à l'intuition.",score:1},{text:"J'ai essayé mais je n'ai pas de méthode stable.",score:2},{text:"J'utilise une méthode simple de façon régulière.",score:3},{text:"J'utilise une méthode structurée et je la transmets à mon équipe.",score:4}]},
  { axe:0, text:"Votre agenda reflète-t-il réellement vos priorités stratégiques ?", answers:[{text:"Non, il est rempli de réunions et d'urgences subies.",score:1},{text:"Partiellement — quelques blocs stratégiques mais souvent bousculés.",score:2},{text:"Oui, j'ai des blocs dédiés à mes priorités que je protège.",score:3},{text:"Oui, mon agenda est un reflet fidèle de ma stratégie à 90 jours.",score:4}]},
  { axe:1, text:"Comment gérez-vous votre liste de tâches au quotidien ?", answers:[{text:"Je garde tout en tête — je n'utilise pas de liste.",score:1},{text:"J'ai des notes éparpillées (post-it, cahier, e-mails à moi-même).",score:2},{text:"J'utilise un outil numérique ou un carnet dédié mis à jour régulièrement.",score:3},{text:"J'utilise un système structuré (GTD, Notion, Todoist) avec revue hebdomadaire.",score:4}]},
  { axe:1, text:"Quelle est la taille habituelle de votre to-do list ?", answers:[{text:"Plus de 50 tâches — elle est ingérable.",score:1},{text:"Entre 20 et 50 tâches — je ne sais plus par où commencer.",score:2},{text:"Entre 10 et 20 tâches — c'est gérable mais chargé.",score:3},{text:"Moins de 10 tâches actives — le reste est en backlog organisé.",score:4}]},
  { axe:1, text:"Faites-vous une revue hebdomadaire de vos tâches et projets en cours ?", answers:[{text:"Non, jamais.",score:1},{text:"Rarement — seulement quand je me sens débordé.",score:2},{text:"Parfois — j'essaie mais ce n'est pas systématique.",score:3},{text:"Oui, chaque semaine à heure fixe — c'est un rituel non négociable.",score:4}]},
  { axe:1, text:"Vos tâches sont-elles formulées avec une action concrète et un résultat attendu ?", answers:[{text:"Non, j'écris des mots vagues comme « budget » ou « RH ».",score:1},{text:"Parfois — certaines tâches sont claires, d'autres non.",score:2},{text:"Souvent — j'essaie de formuler des actions précises.",score:3},{text:"Toujours — chaque tâche commence par un verbe d'action et a un livrable défini.",score:4}]},
  { axe:1, text:"Utilisez-vous des délais (deadlines) pour chacune de vos tâches ?", answers:[{text:"Non — les tâches s'accumulent sans date limite.",score:1},{text:"Seulement pour les tâches imposées par des tiers.",score:2},{text:"Pour la plupart de mes tâches importantes.",score:3},{text:"Pour toutes mes tâches, avec rappels automatiques.",score:4}]},
  { axe:1, text:"Que faites-vous des tâches récurrentes (comptabilité, reporting, suivi clients) ?", answers:[{text:"Je les traite quand j'y pense — elles sont souvent en retard.",score:1},{text:"Je les note à chaque fois dans ma liste.",score:2},{text:"J'ai des rappels ou des routines partiellement automatisées.",score:3},{text:"Elles sont entièrement automatisées ou déléguées avec un système de suivi.",score:4}]},
  { axe:2, text:"Quelle proportion de vos tâches déléguez-vous à votre équipe ?", answers:[{text:"Moins de 10% — je préfère faire moi-même pour être sûr du résultat.",score:1},{text:"Entre 10 et 30% — je délègue les tâches simples uniquement.",score:2},{text:"Entre 30 et 60% — je délègue régulièrement mais je garde beaucoup.",score:3},{text:"Plus de 60% — je me concentre sur ce que seul je peux faire.",score:4}]},
  { axe:2, text:"Lorsque vous déléguez une tâche, comment procédez-vous ?", answers:[{text:"Je donne la tâche oralement sans suivi particulier.",score:1},{text:"J'explique ce que je veux mais je ne fixe pas de délai précis.",score:2},{text:"Je définis la tâche, le délai et je fais un point intermédiaire.",score:3},{text:"Je définis le résultat attendu, les ressources, le délai et j'utilise un outil de suivi.",score:4}]},
  { axe:2, text:"Avez-vous identifié les tâches que vous seul pouvez faire (zone de génie) ?", answers:[{text:"Non — je fais tout sans distinction.",score:1},{text:"Vaguement — j'ai une idée mais ce n'est pas formalisé.",score:2},{text:"Oui — j'ai une liste de mes tâches à haute valeur ajoutée.",score:3},{text:"Oui — tout le reste est délégué, automatisé ou supprimé.",score:4}]},
  { axe:2, text:"Comment réagissez-vous quand un collaborateur revient vers vous avec un problème ?", answers:[{text:"Je résous le problème à sa place immédiatement.",score:1},{text:"Je lui donne la solution sans lui expliquer le raisonnement.",score:2},{text:"Je lui pose des questions pour qu'il trouve lui-même la solution.",score:3},{text:"Mon équipe résout les problèmes de niveau 1 et 2 sans me solliciter.",score:4}]},
  { axe:2, text:"Utilisez-vous un outil de gestion de projet ou de suivi des délégations ?", answers:[{text:"Non — le suivi se fait oralement ou par e-mail.",score:1},{text:"J'utilise des e-mails et des tableaux Excel basiques.",score:2},{text:"J'utilise un outil dédié (Trello, Asana, Monday) de façon régulière.",score:3},{text:"J'ai un système complet avec tableaux de bord, KPIs et revues hebdomadaires.",score:4}]}
];

const TEMPS_AXE_NAMES  = ["Gestion des Priorités","To-Do List","Délégation"];
const TEMPS_AXE_EMOJIS = ["🎯","✅","🤝"];
const TEMPS_MAX_SCORES = [24, 24, 24];

const TEMPS_ENGAGEMENT_QUESTIONS = [
  { axe:0, text:"Sur la gestion de vos priorités, quelle est votre intention après ce diagnostic ?", options:[{type:"accompagne",icon:"🤝",title:"Je veux être accompagné par Pekahellix",desc:"Un accompagnement expert pour structurer ma gestion des priorités."},{type:"autonome",icon:"💪",title:"Je vais travailler en autonomie",desc:"Je vais m'appuyer sur les recommandations proposées."},{type:"abandon",icon:"⏸️",title:"Je mets ce point de côté",desc:"Ce n'est pas ma priorité du moment."}]},
  { axe:1, text:"Sur l'organisation de vos to-do lists, quelle est votre intention après ce diagnostic ?", options:[{type:"accompagne",icon:"🤝",title:"Je veux être accompagné par Pekahellix",desc:"Un consultant pour mettre en place un système de tâches adapté."},{type:"autonome",icon:"💪",title:"Je vais travailler en autonomie",desc:"Je vais utiliser les outils recommandés par moi-même."},{type:"abandon",icon:"⏸️",title:"Je mets ce point de côté",desc:"Je ne me sens pas prêt à travailler sur ce point maintenant."}]},
  { axe:2, text:"Sur votre capacité à déléguer, quelle est votre intention après ce diagnostic ?", options:[{type:"accompagne",icon:"🤝",title:"Je veux être accompagné par Pekahellix",desc:"Un expert pour construire un système de délégation efficace."},{type:"autonome",icon:"💪",title:"Je vais travailler en autonomie",desc:"Je vais m'appuyer sur les recommandations proposées."},{type:"abandon",icon:"⏸️",title:"Je mets ce point de côté",desc:"La délégation n'est pas mon urgence du moment."}]}
];

const TEMPS_SOLUTIONS = [
  { axe:0, nom:"Gestion des Priorités", emoji:"🎯", niveaux:{ debutant:{ intro:"Vous gérez vos priorités de façon réactive. La Matrice d'Eisenhower et la règle des 3 MIT vont transformer votre quotidien.", outils:[{titre:"Matrice d'Eisenhower",desc:"Classez chaque tâche selon Urgent vs Important."},{titre:"Règle des 3 MIT",desc:"Identifiez vos 3 Most Important Tasks chaque matin."},{titre:"Méthode ABCDE",desc:"Notez A (critique) à E (à éliminer) devant chaque tâche."}]}, intermediaire:{ intro:"Vous avez de bonnes bases. Alignez votre agenda sur vos objectifs à 90 jours et protégez vos plages de travail profond.", outils:[{titre:"Time Blocking",desc:"Bloquez des créneaux dédiés à vos priorités dans votre agenda."},{titre:"Objectifs OKR",desc:"Définissez 3 Objectifs et leurs Résultats Clés."},{titre:"Deep Work",desc:"Protégez 2 à 4h de travail concentré chaque jour."}]}, avance:{ intro:"Vous maîtrisez la gestion des priorités. Systématisez et transmettez ces méthodes à votre équipe.", outils:[{titre:"Revue 90 jours",desc:"Planifiez par cycles de 90 jours avec jalons hebdomadaires."},{titre:"Agenda idéal",desc:"Concevez votre semaine idéale type chaque vendredi."},{titre:"Délégation des priorités",desc:"Formez votre équipe à filtrer ce qui vous remonte."}]}}},
  { axe:1, nom:"To-Do List", emoji:"✅", niveaux:{ debutant:{ intro:"Votre système de gestion des tâches est insuffisant. Externalisez votre mémoire dans un système fiable.", outils:[{titre:"Méthode GTD",desc:"Capturez tout, clarifiez, organisez, révisez, agissez."},{titre:"Todoist / TickTick",desc:"Applications gratuites pour gérer vos tâches avec délais."},{titre:"Règle des 2 minutes",desc:"Si < 2 minutes : faites-le. Sinon : planifiez-le."}]}, intermediaire:{ intro:"Vous avez un système mais il manque de structure. Travaillez sur la qualité des tâches et la revue hebdomadaire.", outils:[{titre:"Revue hebdomadaire GTD",desc:"Chaque vendredi : videz, révisez, planifiez."},{titre:"Notion / Obsidian",desc:"Outils tout-en-un pour tâches, projets et notes."},{titre:"Formulation SMART",desc:"Chaque tâche : Spécifique, Mesurable, Temporelle."}]}, avance:{ intro:"Votre système est mature. Optimisez l'automatisation et la délégation des récurrences.", outils:[{titre:"Zapier / Make",desc:"Automatisez les tâches récurrentes entre vos outils."},{titre:"Capture universelle",desc:"Un seul endroit pour tout capturer, accessible partout."},{titre:"Backlog priorisé",desc:"Organisez par valeur/effort pour décider rapidement."}]}}},
  { axe:2, nom:"Délégation", emoji:"🤝", niveaux:{ debutant:{ intro:"Vous déléguez peu ou pas. C'est le frein principal à votre croissance. Commencez par identifier votre zone de génie.", outils:[{titre:"Zone de génie",desc:"Identifiez ce que seul vous pouvez faire. Déléguez le reste."},{titre:"Matrice de délégation",desc:"Qui peut faire quoi ? Avec quelle formation ?"},{titre:"Délégation situationnelle",desc:"Adaptez votre style au niveau de maturité de chacun."}]}, intermediaire:{ intro:"Vous déléguez mais sans système structuré. Clarifiez les briefs et mettez en place un outil de suivi.", outils:[{titre:"Brief RACI",desc:"Responsable, Approbateur, Consulté, Informé."},{titre:"Trello / Asana",desc:"Suivez les délégations sans micro-management."},{titre:"Check-in hebdomadaire",desc:"15 minutes par semaine avec chaque collaborateur clé."}]}, avance:{ intro:"Vous déléguez efficacement. Créez une organisation apprenante où l'équipe résout les problèmes sans vous.", outils:[{titre:"Management OKR",desc:"Donnez des objectifs, pas des tâches."},{titre:"Niveaux d'autonomie",desc:"Formalisez les décisions que chacun peut prendre seul."},{titre:"Documentation SOP",desc:"Documentez chaque processus clé pour l'autonomie totale."}]}}}
];

const TEMPS_FORFAITS = [
  { nom:"Découverte", emoji:"🌱", prix:"Sur devis", desc:"Démarrer avec les bons outils et une feuille de route claire.", recommande:false, features:["Séance de debriefing (2h)","Plan d'action personnalisé","Sélection d'outils adaptés","1 mois de suivi e-mail"]},
  { nom:"Accompagnement", emoji:"🚀", prix:"Forfait mensuel", desc:"Un consultant dédié pour transformer votre organisation sur 3 mois.", recommande:true, features:["4 séances / mois (1h)","Mise en place des méthodes","Suivi hebdomadaire","Support illimité"]},
  { nom:"Transformation", emoji:"🏆", prix:"Forfait trimestriel", desc:"Programme intensif pour une refonte complète.", recommande:false, features:["Audit complet","8 séances / mois (1h)","Formation équipe incluse","Garantie de résultats"]}
];

/* ============================================================
   ██  APP : COMMUNICATION — DONNÉES  ██
   ============================================================ */
const COMM_QUESTIONS_GERANT = [
  { axe:0, text:"Avez-vous une présence active sur les réseaux sociaux pour votre magasin ?", answers:[{text:"Non, aucune présence sur les réseaux sociaux.",score:1},{text:"Un compte rarement mis à jour.",score:2},{text:"Publications régulières mais sans stratégie définie.",score:3},{text:"Stratégie éditoriale avec publications planifiées et interactions régulières.",score:4}]},
  { axe:0, text:"Votre magasin dispose-t-il d'une fiche Google My Business complète et à jour ?", answers:[{text:"Non, pas de fiche Google.",score:1},{text:"Fiche incomplète.",score:2},{text:"Fiche complète mais sans réponse aux avis.",score:3},{text:"Fiche complète, mise à jour régulièrement, réponse à tous les avis.",score:4}]},
  { axe:0, text:"Organisez-vous des actions de communication locale (prospectus, événements, partenariats) ?", answers:[{text:"Non, aucune communication locale spécifique.",score:1},{text:"Prospectus occasionnels.",score:2},{text:"Actions régulières mais non coordonnées.",score:3},{text:"Plan de communication locale annuel avec événements et partenariats.",score:4}]},
  { axe:0, text:"Comment gérez-vous les avis clients négatifs en ligne ?", answers:[{text:"Nous ne les traitons pas.",score:1},{text:"Nous les lisons mais ne répondons pas systématiquement.",score:2},{text:"Nous répondons à la plupart sans procédure définie.",score:3},{text:"Procédure de réponse sous 48h avec suivi de satisfaction.",score:4}]},
  { axe:0, text:"Votre identité visuelle est-elle cohérente sur tous vos supports ?", answers:[{text:"Non, aucune cohérence visuelle.",score:1},{text:"Partiellement cohérente.",score:2},{text:"La plupart des supports sont cohérents.",score:3},{text:"Tous les supports respectent une charte graphique définie.",score:4}]},
  { axe:0, text:"Mesurez-vous la satisfaction de vos clients (enquêtes, NPS) ?", answers:[{text:"Non, pas de mesure de satisfaction.",score:1},{text:"Retours informels en caisse.",score:2},{text:"Enquêtes ponctuelles.",score:3},{text:"Système de mesure régulier avec indicateurs de suivi.",score:4}]},
  { axe:0, text:"Communiquez-vous sur vos engagements locaux (producteurs locaux, actions solidaires) ?", answers:[{text:"Non, pas d'engagements communiqués.",score:1},{text:"Des engagements existent mais ne sont pas communiqués.",score:2},{text:"Communication occasionnelle en magasin.",score:3},{text:"Engagements au cœur de la communication sur tous les canaux.",score:4}]},
  { axe:0, text:"Avez-vous une stratégie de fidélisation client (carte de fidélité, newsletter) ?", answers:[{text:"Non, pas de programme de fidélisation.",score:1},{text:"Carte de fidélité peu exploitée.",score:2},{text:"Fidélisation sans personnalisation.",score:3},{text:"Programme complet avec segmentation et offres personnalisées.",score:4}]},
  { axe:1, text:"Comment informez-vous vos équipes des actualités et décisions importantes ?", answers:[{text:"À l'oral, au fil de l'eau, sans structure.",score:1},{text:"Affichage en salle de pause, de façon irrégulière.",score:2},{text:"Réunions régulières et affichage structuré.",score:3},{text:"Système multicanal avec compte-rendu systématique.",score:4}]},
  { axe:1, text:"Organisez-vous des réunions d'équipe régulières avec un ordre du jour défini ?", answers:[{text:"Non, pas de réunions formelles.",score:1},{text:"Rarement — seulement en cas de problème urgent.",score:2},{text:"Mensuellement, sans ordre du jour systématique.",score:3},{text:"Hebdomadairement avec ordre du jour, compte-rendu et suivi.",score:4}]},
  { axe:1, text:"Vos employés ont-ils un canal pour remonter leurs idées ou problèmes ?", answers:[{text:"Non, pas de canal formel.",score:1},{text:"Ils peuvent me parler directement mais c'est rare.",score:2},{text:"Boîte à idées ou canal dédié peu utilisé.",score:3},{text:"Système actif avec retour systématique sur chaque suggestion.",score:4}]},
  { axe:1, text:"Comment évaluez-vous la satisfaction et le bien-être de vos employés ?", answers:[{text:"Je ne mesure pas formellement.",score:1},{text:"Je perçois l'ambiance de façon informelle.",score:2},{text:"Entretiens individuels annuels.",score:3},{text:"Enquêtes régulières + entretiens + indicateurs RH.",score:4}]},
  { axe:1, text:"Vos employés connaissent-ils les objectifs et la stratégie de votre magasin ?", answers:[{text:"Non, les objectifs ne sont pas partagés.",score:1},{text:"Ils connaissent les objectifs de vente mais pas la vision.",score:2},{text:"Les objectifs principaux sont partagés en réunion.",score:3},{text:"Chaque employé connaît la vision, les objectifs et son rôle.",score:4}]},
  { axe:1, text:"Valorisez-vous publiquement les réussites de vos employés ?", answers:[{text:"Non, les réussites ne sont pas soulignées.",score:1},{text:"Occasionnellement, à l'oral en privé.",score:2},{text:"Lors des réunions d'équipe, de façon informelle.",score:3},{text:"Systématiquement, avec des rituels de reconnaissance formels.",score:4}]},
  { axe:1, text:"Si vous deviez évaluer la qualité globale de votre communication interne, quelle note donneriez-vous ?", answers:[{text:"1 à 3 / 10 — très insuffisante.",score:1},{text:"4 à 5 / 10 — largement perfectible.",score:2},{text:"6 à 7 / 10 — correcte mais peut progresser.",score:3},{text:"8 à 10 / 10 — un vrai point fort de mon management.",score:4}]}
];

const COMM_QUESTIONS_SALARIE = [
  { axe:0, text:"Êtes-vous fier(e) de l'image que votre magasin donne à l'extérieur ?", answers:[{text:"Non, l'image externe est mauvaise ou inexistante.",score:1},{text:"L'image est neutre, sans personnalité.",score:2},{text:"L'image est correcte mais pourrait être meilleure.",score:3},{text:"Oui, je suis fier(e) et j'en parle positivement.",score:4}]},
  { axe:0, text:"Pensez-vous que votre magasin communique efficacement avec ses clients ?", answers:[{text:"Non, la communication client est quasi inexistante.",score:1},{text:"Quelques actions mais sans cohérence.",score:2},{text:"Des actions régulières mais perfectibles.",score:3},{text:"Communication active, cohérente et efficace.",score:4}]},
  { axe:0, text:"Les clients vous font-ils des retours positifs sur l'accueil et l'ambiance ?", answers:[{text:"Rarement ou jamais — les retours sont plutôt négatifs.",score:1},{text:"Parfois, mais ce n'est pas la norme.",score:2},{text:"Souvent — la plupart des clients semblent satisfaits.",score:3},{text:"Très souvent — l'accueil est reconnu comme un point fort.",score:4}]},
  { axe:0, text:"Recommanderiez-vous votre magasin à vos proches comme lieu de courses ?", answers:[{text:"Non, je ne le recommanderais pas.",score:1},{text:"Peut-être, sans conviction particulière.",score:2},{text:"Oui, je le recommanderais.",score:3},{text:"Oui, absolument et je le fais déjà spontanément.",score:4}]},
  { axe:0, text:"Votre magasin est-il impliqué dans la vie locale ?", answers:[{text:"Non, aucune implication locale visible.",score:1},{text:"Quelques actions ponctuelles.",score:2},{text:"Des actions régulières.",score:3},{text:"L'ancrage local est une vraie valeur du magasin.",score:4}]},
  { axe:0, text:"Pensez-vous que l'image de votre magasin attire et fidélise les clients ?", answers:[{text:"Non, nous perdons des clients régulièrement.",score:1},{text:"La clientèle est stable mais sans croissance.",score:2},{text:"L'image contribue à fidéliser une partie des clients.",score:3},{text:"L'image est un vrai moteur d'attraction et de fidélisation.",score:4}]},
  { axe:1, text:"Vous sentez-vous bien informé(e) des actualités et décisions importantes ?", answers:[{text:"Non, je suis souvent le dernier à apprendre les informations.",score:1},{text:"L'information circule mal et de façon aléatoire.",score:2},{text:"Je suis informé(e) de l'essentiel.",score:3},{text:"Je suis toujours informé(e) en temps et en heure.",score:4}]},
  { axe:1, text:"Pouvez-vous facilement exprimer vos idées ou suggestions à votre responsable ?", answers:[{text:"Non, il n'y a pas de canal pour s'exprimer.",score:1},{text:"Théoriquement oui, mais en pratique c'est difficile.",score:2},{text:"Je peux m'exprimer mais les suites données sont rares.",score:3},{text:"Mes idées sont écoutées et prises en compte régulièrement.",score:4}]},
  { axe:1, text:"La communication entre collègues est-elle fluide et bienveillante ?", answers:[{text:"Non, il y a des tensions et des non-dits fréquents.",score:1},{text:"La communication est fonctionnelle mais froide.",score:2},{text:"L'ambiance est correcte.",score:3},{text:"L'équipe communique bien et l'ambiance est vraiment positive.",score:4}]},
  { axe:1, text:"Votre responsable vous donne-t-il/elle des retours réguliers sur votre travail ?", answers:[{text:"Non, je ne reçois jamais de feedback.",score:1},{text:"Rarement — seulement en cas de problème.",score:2},{text:"Parfois — lors des entretiens annuels.",score:3},{text:"Régulièrement — les retours sont constructifs et fréquents.",score:4}]},
  { axe:1, text:"Vous sentez-vous reconnu(e) et valorisé(e) pour votre travail ?", answers:[{text:"Non, les efforts ne sont jamais reconnus.",score:1},{text:"La reconnaissance est rare.",score:2},{text:"Certaines réussites sont soulignées.",score:3},{text:"Je me sens régulièrement reconnu(e) et valorisé(e).",score:4}]},
  { axe:1, text:"Connaissez-vous les objectifs et la vision de votre magasin ?", answers:[{text:"Non, aucune visibilité sur les objectifs.",score:1},{text:"Je connais les objectifs de vente mais pas la vision.",score:2},{text:"Les objectifs principaux me sont communiqués.",score:3},{text:"Je connais la vision, les objectifs et mon rôle dans leur atteinte.",score:4}]},
  { axe:1, text:"Des réunions d'équipe sont-elles organisées régulièrement ?", answers:[{text:"Non, jamais de réunions d'équipe.",score:1},{text:"Rarement — seulement en cas de crise.",score:2},{text:"Parfois — de façon irrégulière.",score:3},{text:"Oui, régulièrement avec ordre du jour et suivi des décisions.",score:4}]},
  { axe:1, text:"NPS Employé — Recommanderiez-vous votre magasin à un proche comme lieu de travail ?", answers:[{text:"Non, certainement pas (0 à 3 / 10).",score:1},{text:"Probablement pas (4 à 6 / 10).",score:2},{text:"Probablement oui (7 à 8 / 10).",score:3},{text:"Oui, absolument (9 à 10 / 10).",score:4}]},
  { axe:1, text:"Si vous pouviez changer une seule chose dans la communication de votre magasin, ce serait :", answers:[{text:"Que le gérant nous informe mieux des décisions qui nous concernent.",score:1},{text:"Que nos idées et suggestions soient vraiment prises en compte.",score:2},{text:"Que l'ambiance entre collègues soit plus soudée et bienveillante.",score:3},{text:"Rien — la communication est déjà très satisfaisante.",score:4}]}
];

const COMM_BENCHMARK = [
  { enseigne:"Intermarché Contact", classe:"enseigne-intermarche", emoji:"🔴", tags:["ext","int"], texte:"Intermarché Contact se distingue par sa communication de proximité très forte. La campagne « Les producteurs sont nos voisins » a généré un taux de mémorisation de 78% (Kantar 2023). En interne, le réseau ITM mise sur des réunions d'équipe hebdomadaires et un intranet dédié. L'eNPS atteint +32 dans les magasins les mieux notés sur Glassdoor.", score:"eNPS : +32 | Notoriété locale : ★★★★★"},
  { enseigne:"Carrefour Market", classe:"enseigne-carrefour", emoji:"🔵", tags:["ext"], texte:"Carrefour Market excelle dans la communication digitale locale avec son application qui personnalise les offres par magasin. 94% des magasins ont une fiche Google My Business complète avec réponse aux avis sous 24h. La communication RSE (Act for Food) est reconnue comme référence sectorielle par Nielsen (2023).", score:"Satisfaction client : 7,8/10 | Présence digitale : ★★★★★"},
  { enseigne:"Super U", classe:"enseigne-superu", emoji:"🟢", tags:["ext","int"], texte:"Super U est l'enseigne la mieux notée du secteur en communication interne selon Great Place to Work 2023. Le programme « U Ensemble » favorise la participation des employés aux décisions. La communication sur les produits locaux est reconnue comme la plus authentique du secteur (Linéaires 2023). eNPS moyen : +41.", score:"eNPS : +41 | Great Place to Work : ★★★★★"},
  { enseigne:"Marché U", classe:"enseigne-marcheu", emoji:"🟡", tags:["ext"], texte:"Marché U se distingue par une communication événementielle locale très efficace : marchés de producteurs, animations culinaires, partenariats associatifs. 87% des clients interrogés par LSA (2023) associent Marché U à une enseigne « proche de chez moi et engagée localement ».", score:"Ancrage local : ★★★★★ | Engagement RSE : ★★★★"}
];

const COMM_PLANS = {
  "6m":{ faible:[{titre:"Créer et optimiser la fiche Google My Business",desc:"Remplir toutes les informations, ajouter des photos, activer les réponses aux avis.",delai:"Mois 1"},{titre:"Ouvrir une page Facebook Magasin",desc:"Créer la page, définir une ligne éditoriale simple (3 posts/semaine).",delai:"Mois 1-2"},{titre:"Instaurer une réunion d'équipe mensuelle",desc:"Ordre du jour fixe, compte-rendu affiché en salle de pause.",delai:"Mois 2"},{titre:"Mettre en place une boîte à idées",desc:"Afficher les suggestions reçues et les réponses apportées chaque mois.",delai:"Mois 3"},{titre:"Lancer une première action locale",desc:"Partenariat avec un producteur local, mise en avant en rayon et sur les réseaux.",delai:"Mois 4-5"},{titre:"Premier bilan et ajustements",desc:"Mesurer les résultats (avis Google, engagement Facebook, retours équipe).",delai:"Mois 6"}], intermediaire:[{titre:"Structurer la stratégie réseaux sociaux",desc:"Calendrier éditorial mensuel, stories hebdomadaires, mise en avant des équipes.",delai:"Mois 1"},{titre:"Systématiser les réponses aux avis clients",desc:"Procédure de réponse sous 48h, template de réponse, suivi mensuel.",delai:"Mois 1-2"},{titre:"Lancer une enquête de satisfaction employés",desc:"Questionnaire anonyme, restitution des résultats, plan d'action partagé.",delai:"Mois 2-3"},{titre:"Créer un rituel de reconnaissance d'équipe",desc:"Employé du mois, félicitations en réunion, affichage des réussites.",delai:"Mois 3"},{titre:"Développer la communication RSE locale",desc:"Mettre en avant les producteurs locaux, actions solidaires.",delai:"Mois 4-5"},{titre:"Mesurer le NPS client et employé",desc:"Mettre en place un système de mesure régulier.",delai:"Mois 6"}], fort:[{titre:"Optimiser la stratégie digitale",desc:"Publicités Facebook/Instagram ciblées localement, Google Ads.",delai:"Mois 1-2"},{titre:"Déployer un programme de fidélisation avancé",desc:"Segmentation clients, offres personnalisées, newsletter mensuelle.",delai:"Mois 2-3"},{titre:"Former l'équipe à la communication client",desc:"Atelier accueil, gestion des réclamations, ambassadeurs de marque.",delai:"Mois 3-4"},{titre:"Créer un comité de pilotage communication",desc:"Impliquer 2-3 employés volontaires dans la stratégie.",delai:"Mois 4"},{titre:"Candidater à un label employeur",desc:"Great Place to Work, Happy at Work — valoriser votre engagement RH.",delai:"Mois 5-6"},{titre:"Bilan et projection sur 12 mois",desc:"Analyser les KPIs, définir les objectifs de l'année suivante.",delai:"Mois 6"}]},
  "1an":{ faible:[{titre:"Semestre 1 — Fondations digitales",desc:"Google My Business, réseaux sociaux, charte graphique, réponses aux avis.",delai:"M1 à M6"},{titre:"Rituels de communication interne",desc:"Réunions mensuelles, affichage structuré, boîte à idées active.",delai:"M2 à M4"},{titre:"Première campagne locale",desc:"Événement en magasin, partenariat producteur, couverture réseaux sociaux.",delai:"M4 à M6"},{titre:"Semestre 2 — Structuration et mesure",desc:"Enquête satisfaction clients et employés, NPS, plan d'action correctif.",delai:"M7 à M9"},{titre:"Développer l'ancrage territorial",desc:"Partenariats associations, sponsoring événements locaux, communication RSE.",delai:"M8 à M11"},{titre:"Bilan annuel et plan N+1",desc:"Revue complète des indicateurs, définition des objectifs de l'année suivante.",delai:"M12"}], intermediaire:[{titre:"Stratégie digitale complète",desc:"Calendrier éditorial annuel, publicités ciblées, gestion de la e-réputation.",delai:"M1 à M3"},{titre:"Communication interne structurée",desc:"Réunions hebdomadaires, canal dédié, rituels de reconnaissance.",delai:"M2 à M4"},{titre:"Programme de fidélisation",desc:"Carte de fidélité activée, newsletter, offres personnalisées.",delai:"M3 à M6"},{titre:"Formation équipe communication client",desc:"Accueil, gestion des réclamations, posture ambassadeur.",delai:"M5 à M7"},{titre:"Communication RSE et ancrage local",desc:"Bilan carbone, producteurs locaux, actions solidaires communiquées.",delai:"M7 à M10"},{titre:"Mesure et optimisation continue",desc:"NPS client et employé trimestriel, ajustements stratégiques.",delai:"M10 à M12"}], fort:[{titre:"Leadership communication sectoriel",desc:"Positionner le magasin comme référence locale en communication.",delai:"M1 à M3"},{titre:"Programme ambassadeurs employés",desc:"Former et impliquer l'équipe dans la communication externe.",delai:"M2 à M5"},{titre:"Stratégie omnicanale avancée",desc:"Intégration réseaux sociaux, Google, newsletter, affichage en magasin.",delai:"M3 à M6"},{titre:"Candidature label employeur",desc:"Great Place to Work ou Happy at Work — processus de certification.",delai:"M6 à M9"},{titre:"Déploiement programme RSE complet",desc:"Rapport RSE annuel, communication transparente sur les engagements.",delai:"M7 à M10"},{titre:"Benchmark et veille concurrentielle",desc:"Analyse trimestrielle des pratiques des enseignes concurrentes.",delai:"M10 à M12"}]},
  "3ans":{ faible:[{titre:"Année 1 — Construction des fondations",desc:"Présence digitale, communication interne structurée, premières actions locales.",delai:"An 1"},{titre:"Année 2 — Développement et cohérence",desc:"Stratégie omnicanale, programme de fidélisation, culture de communication.",delai:"An 2"},{titre:"Année 3 — Leadership et reconnaissance",desc:"Positionnement comme référence locale, label employeur, NPS client > 50.",delai:"An 3"},{titre:"Objectif 3 ans — eNPS positif",desc:"Passer d'un eNPS négatif à un eNPS > +20.",delai:"An 1-3"},{titre:"Objectif 3 ans — Notoriété locale +40%",desc:"Augmenter la notoriété spontanée dans la zone de chalandise.",delai:"An 2-3"},{titre:"Accompagnement Pekahellix sur 3 ans",desc:"Un consultant dédié pour piloter et ajuster la stratégie à chaque étape.",delai:"An 1-3"}], intermediaire:[{titre:"Année 1 — Structuration et mesure",desc:"Indicateurs de performance, NPS, stratégie digitale complète.",delai:"An 1"},{titre:"Année 2 — Différenciation concurrentielle",desc:"Communication RSE, ancrage local fort, programme ambassadeurs.",delai:"An 2"},{titre:"Année 3 — Excellence et reconnaissance",desc:"Label employeur, référence sectorielle, NPS client > 60.",delai:"An 3"},{titre:"Objectif 3 ans — eNPS > +35",desc:"Devenir un employeur de référence dans votre zone géographique.",delai:"An 2-3"},{titre:"Objectif 3 ans — Croissance CA +15%",desc:"Lier la stratégie de communication à des objectifs de croissance mesurables.",delai:"An 2-3"},{titre:"Accompagnement Pekahellix sur 3 ans",desc:"Revues trimestrielles, ajustements stratégiques, formation continue.",delai:"An 1-3"}], fort:[{titre:"Année 1 — Optimisation et leadership",desc:"Consolider les acquis, former l'équipe, candidater aux labels.",delai:"An 1"},{titre:"Année 2 — Rayonnement territorial",desc:"Devenir la référence communication de votre secteur géographique.",delai:"An 2"},{titre:"Année 3 — Modèle et transmission",desc:"Partager vos pratiques, mentorer d'autres gérants, NPS client > 70.",delai:"An 3"},{titre:"Objectif 3 ans — eNPS > +50",desc:"Atteindre le niveau des meilleures enseignes du secteur.",delai:"An 2-3"},{titre:"Objectif 3 ans — Croissance CA +25%",desc:"La communication comme levier de croissance documenté.",delai:"An 2-3"},{titre:"Accompagnement Pekahellix Premium",desc:"Partenariat stratégique long terme avec revues mensuelles.",delai:"An 1-3"}]}
};

const COMM_FORFAITS = [
  { nom:"Essentiel 6 mois", emoji:"🌱", prix:"Forfait 6 mois", desc:"Poser les fondations de votre communication.", recommande:false, features:["Audit communication complet","6 séances mensuelles (1h30)","Plan de communication 6 mois","Suivi des indicateurs clés"]},
  { nom:"Croissance 1 an", emoji:"🚀", prix:"Forfait 12 mois", desc:"Structurer et déployer une stratégie complète.", recommande:true, features:["Audit + benchmark sectoriel","Séances bimensuelles (1h30)","Stratégie digitale + interne","Formation équipe incluse","Tableau de bord mensuel"]},
  { nom:"Transformation 3 ans", emoji:"🏆", prix:"Forfait 36 mois", desc:"Devenir la référence communication de votre secteur.", recommande:false, features:["Partenariat stratégique complet","Séances hebdomadaires","Candidature labels employeur","Rapport RSE annuel","Garantie de résultats"]}
];

/* ============================================================
   ██  APP : CYBERSÉCURITÉ — DONNÉES  ██
   ============================================================ */
const CYBER_QUESTIONS = [
  { category:"Mots de passe", question:"Quelle est la longueur minimale recommandée par l'ANSSI pour un mot de passe sécurisé ?", answers:[{text:"Au moins 12 caractères, avec majuscules, minuscules, chiffres et caractères spéciaux.",correct:true},{text:"Au moins 6 caractères, car les systèmes modernes bloquent les attaques après 3 tentatives.",correct:false},{text:"Au moins 4 caractères, comme un code PIN bancaire.",correct:false},{text:"Au moins 12 caractères, mais uniquement des chiffres.",correct:false}], explanation:"L'ANSSI recommande un mot de passe d'au moins 12 caractères combinant majuscules, minuscules, chiffres et caractères spéciaux."},
  { category:"Mots de passe", question:"Vous devez gérer une dizaine de mots de passe différents. Quelle est la meilleure pratique ?", answers:[{text:"Utiliser un gestionnaire de mots de passe reconnu (Bitwarden, KeePass, etc.).",correct:true},{text:"Utiliser le même mot de passe partout, mais très complexe.",correct:false},{text:"Les noter dans un fichier texte nommé « passwords.txt » sur le bureau.",correct:false},{text:"Utiliser un gestionnaire synchronisé via un email non chiffré.",correct:false}], explanation:"Un gestionnaire de mots de passe chiffré permet de stocker des mots de passe uniques et complexes pour chaque service."},
  { category:"Phishing", question:"Vous recevez un e-mail urgent de votre banque vous demandant de cliquer sur un lien. Que faites-vous ?", answers:[{text:"Vous ignorez le lien et vous connectez directement au site officiel de votre banque.",correct:true},{text:"Vous cliquez car l'e-mail affiche le logo officiel de votre banque.",correct:false},{text:"Vous répondez à l'e-mail en demandant confirmation.",correct:false},{text:"Vous cliquez uniquement depuis votre smartphone.",correct:false}], explanation:"Le phishing imite des organismes de confiance. Ne cliquez jamais sur un lien dans un e-mail urgent."},
  { category:"Mises à jour", question:"Pourquoi est-il important de mettre à jour régulièrement son système d'exploitation ?", answers:[{text:"Les mises à jour corrigent des failles de sécurité qui pourraient être exploitées par des pirates.",correct:true},{text:"Les mises à jour servent uniquement à ajouter de nouvelles fonctionnalités.",correct:false},{text:"Les mises à jour ralentissent le système et doivent être évitées.",correct:false},{text:"Les mises à jour corrigent des failles, mais uniquement le premier lundi du mois.",correct:false}], explanation:"Les cybercriminels exploitent activement les failles connues des logiciels non mis à jour."},
  { category:"Wi-Fi & Réseau", question:"Vous êtes dans un café et souhaitez consulter votre compte bancaire. Que faites-vous ?", answers:[{text:"Vous utilisez votre connexion mobile (4G/5G) ou un VPN de confiance.",correct:true},{text:"Vous vous connectez au Wi-Fi public car il est gratuit et sans risque.",correct:false},{text:"Vous utilisez le Wi-Fi public en mode navigation privée.",correct:false},{text:"Vous utilisez le Wi-Fi si le réseau s'appelle « CaféSecure ».",correct:false}], explanation:"Les réseaux Wi-Fi publics sont non sécurisés. La navigation privée ne chiffre pas vos données réseau."},
  { category:"Authentification", question:"Qu'est-ce que l'authentification à deux facteurs (2FA) et pourquoi l'utiliser ?", answers:[{text:"Une méthode qui ajoute une seconde vérification (code SMS, application) en plus du mot de passe.",correct:true},{text:"Un système qui nécessite deux mots de passe différents saisis simultanément.",correct:false},{text:"Une technologie réservée aux entreprises.",correct:false},{text:"Une méthode qui ajoute un second mot de passe valable 24 heures.",correct:false}], explanation:"Le 2FA protège votre compte même si votre mot de passe est volé. Activez-le sur tous vos comptes importants."},
  { category:"Phishing", question:"Comment reconnaître un e-mail de phishing ?", answers:[{text:"Il crée une urgence, contient des fautes, affiche une adresse suspecte et demande des informations personnelles.",correct:true},{text:"Il provient toujours d'une adresse en .ru ou .cn.",correct:false},{text:"Il est toujours envoyé la nuit entre 2h et 4h du matin.",correct:false},{text:"Il crée une urgence uniquement si l'objet est en majuscules.",correct:false}], explanation:"Les e-mails de phishing jouent sur l'urgence et la peur. Vérifiez toujours l'adresse exacte de l'expéditeur."},
  { category:"Données personnelles", question:"Que signifie le principe de « minimisation des données » selon le RGPD ?", answers:[{text:"Ne collecter et partager que les données strictement nécessaires à l'usage prévu.",correct:true},{text:"Supprimer toutes ses données personnelles d'internet une fois par an.",correct:false},{text:"Utiliser des pseudonymes sur tous les sites.",correct:false},{text:"Ne collecter que les données nécessaires, mais les conserver indéfiniment.",correct:false}], explanation:"Le RGPD impose de ne traiter que les données réellement nécessaires."},
  { category:"Logiciels malveillants", question:"Qu'est-ce qu'un ransomware ?", answers:[{text:"Un logiciel malveillant qui chiffre vos fichiers et exige une rançon pour les déchiffrer.",correct:true},{text:"Un logiciel espion qui enregistre vos frappes clavier.",correct:false},{text:"Un virus qui efface définitivement tous les fichiers du disque dur en 60 secondes.",correct:false},{text:"Un logiciel qui chiffre uniquement les fichiers créés un vendredi.",correct:false}], explanation:"Le ransomware chiffre vos données et réclame un paiement. La meilleure protection : sauvegardes régulières et vigilance."},
  { category:"Sauvegardes", question:"Quelle est la règle de sauvegarde recommandée par les experts en cybersécurité ?", answers:[{text:"La règle 3-2-1 : 3 copies des données, sur 2 supports différents, dont 1 hors site.",correct:true},{text:"Sauvegarder uniquement dans le cloud.",correct:false},{text:"Sauvegarder une fois par an sur un disque dur externe.",correct:false},{text:"La règle 3-2-1 avec 1 copie envoyée par e-mail à soi-même.",correct:false}], explanation:"La règle 3-2-1 garantit la résilience de vos données : 3 copies, 2 supports différents, 1 hors site."},
  { category:"Réseaux sociaux", question:"Quels risques présentent les informations personnelles publiées sur les réseaux sociaux ?", answers:[{text:"Elles peuvent être utilisées pour des attaques ciblées, l'usurpation d'identité ou la manipulation sociale.",correct:true},{text:"Aucun risque si le compte est en mode privé.",correct:false},{text:"Les réseaux sociaux chiffrent automatiquement toutes les publications.",correct:false},{text:"Elles peuvent être utilisées uniquement si vous avez plus de 500 abonnés.",correct:false}], explanation:"Même un compte « privé » peut être compromis. Les informations publiques permettent des attaques très personnalisées."},
  { category:"Navigation web", question:"Que signifie le cadenas HTTPS dans la barre d'adresse ?", answers:[{text:"La connexion entre votre navigateur et le site est chiffrée, protégeant vos données en transit.",correct:true},{text:"Le site est certifié sûr et ne contient aucun logiciel malveillant.",correct:false},{text:"Le site appartient à une entreprise vérifiée par le gouvernement.",correct:false},{text:"La connexion est chiffrée et le site a été audité par l'ANSSI.",correct:false}], explanation:"HTTPS chiffre uniquement la communication. Cela ne garantit pas que le site est légitime ou sans malware."},
  { category:"Logiciels malveillants", question:"Vous recevez une pièce jointe inattendue d'un collègue. Que faites-vous ?", answers:[{text:"Vous contactez votre collègue par un autre canal pour vérifier qu'il a bien envoyé ce fichier.",correct:true},{text:"Vous ouvrez la pièce jointe car elle vient d'une adresse connue.",correct:false},{text:"Vous l'ouvrez en mode hors ligne.",correct:false},{text:"Vous la transférez à votre responsable avant de l'ouvrir.",correct:false}], explanation:"Le compte d'un collègue peut être compromis. Vérifiez toujours par un autre canal avant d'ouvrir une pièce jointe inattendue."},
  { category:"Mots de passe", question:"Lequel de ces mots de passe est le plus sécurisé ?", answers:[{text:"Tr0ub4dor&3#Lune!",correct:true},{text:"password123",correct:false},{text:"Jean1985",correct:false},{text:"Azerty@2024!",correct:false}], explanation:"« Tr0ub4dor&3#Lune! » combine longueur, majuscules, minuscules, chiffres et caractères spéciaux sans mot du dictionnaire évident."},
  { category:"Ingénierie sociale", question:"Un inconnu vous appelle en se présentant comme le support informatique et demande votre mot de passe. Que faites-vous ?", answers:[{text:"Vous refusez catégoriquement : aucun service informatique légitime ne demande jamais un mot de passe.",correct:true},{text:"Vous donnez votre mot de passe car le support en a besoin.",correct:false},{text:"Vous donnez un faux mot de passe pour tester.",correct:false},{text:"Vous refusez le mot de passe mais communiquez votre identifiant.",correct:false}], explanation:"C'est une attaque par ingénierie sociale. Aucun service informatique légitime ne demande jamais votre mot de passe."},
  { category:"Vie privée", question:"Que faire avant d'installer une nouvelle application sur votre smartphone ?", answers:[{text:"Vérifier les autorisations demandées et s'assurer qu'elles sont cohérentes avec la fonction de l'application.",correct:true},{text:"Accepter toutes les autorisations car elles sont nécessaires.",correct:false},{text:"Vérifier uniquement si l'application est gratuite.",correct:false},{text:"Vérifier les autorisations uniquement pour les apps hors stores officiels.",correct:false}], explanation:"Des autorisations excessives sont un signal d'alarme. Lisez toujours les permissions avant d'installer."},
  { category:"Wi-Fi & Réseau", question:"Comment sécuriser votre réseau Wi-Fi domestique ?", answers:[{text:"Utiliser le chiffrement WPA3 (ou WPA2), changer le mot de passe par défaut et désactiver le WPS.",correct:true},{text:"Masquer le nom du réseau (SSID) suffit à le rendre invisible.",correct:false},{text:"Laisser le réseau ouvert pour faciliter la connexion des invités.",correct:false},{text:"Utiliser WPA2 et activer le WPS pour simplifier les connexions.",correct:false}], explanation:"WPA3/WPA2 chiffre les communications. Le WPS est une faille connue à désactiver."},
  { category:"Données personnelles", question:"Qu'est-ce que l'usurpation d'identité numérique et comment s'en protéger ?", answers:[{text:"C'est l'utilisation frauduleuse de vos informations personnelles. Protection : mots de passe forts, 2FA et surveillance de vos comptes.",correct:true},{text:"C'est uniquement possible si quelqu'un vole physiquement votre carte d'identité.",correct:false},{text:"C'est un risque inexistant en France grâce au RGPD.",correct:false},{text:"C'est possible uniquement si vous avez accepté les cookies sur plus de 10 sites.",correct:false}], explanation:"L'usurpation d'identité numérique peut se produire via des fuites de données, du phishing ou des réseaux sociaux."},
  { category:"Logiciels malveillants", question:"Qu'est-ce qu'un antivirus et suffit-il à vous protéger complètement ?", answers:[{text:"Un antivirus détecte et bloque de nombreuses menaces, mais ne suffit pas seul : il faut aussi des mises à jour, de la vigilance et des sauvegardes.",correct:true},{text:"Un antivirus à jour protège à 100% contre toutes les cybermenaces.",correct:false},{text:"Les antivirus sont devenus inutiles car les navigateurs modernes bloquent tous les virus.",correct:false},{text:"Un antivirus suffit à condition de le mettre à jour manuellement chaque semaine.",correct:false}], explanation:"L'antivirus est une couche de protection parmi d'autres. La cybersécurité repose sur une combinaison de mesures."},
  { category:"Navigation web", question:"Qu'est-ce qu'un cookie et pourquoi faut-il y prêter attention ?", answers:[{text:"Un cookie est un fichier stocké par votre navigateur qui peut tracer votre navigation. Certains cookies publicitaires collectent des données personnelles.",correct:true},{text:"Un cookie est un virus qui s'installe automatiquement.",correct:false},{text:"Les cookies sont totalement inoffensifs.",correct:false},{text:"Un cookie trace votre navigation uniquement si vous êtes connecté à un compte.",correct:false}], explanation:"Les cookies peuvent être utiles ou intrusifs. Le RGPD vous donne le droit de les refuser."},
  { category:"Mots de passe", question:"À quelle fréquence devez-vous changer vos mots de passe selon les recommandations actuelles ?", answers:[{text:"Uniquement en cas de suspicion de compromission ou de fuite de données.",correct:true},{text:"Tous les 30 jours sans exception.",correct:false},{text:"Jamais, car changer de mot de passe augmente le risque de l'oublier.",correct:false},{text:"Tous les 3 mois, mais uniquement pour les comptes professionnels.",correct:false}], explanation:"Les recommandations récentes du NIST et de l'ANSSI indiquent que changer trop souvent pousse à choisir des mots de passe faibles."},
  { category:"Ingénierie sociale", question:"Qu'est-ce que le « pretexting » en cybersécurité ?", answers:[{text:"Une technique où l'attaquant crée un scénario fictif crédible pour obtenir des informations confidentielles.",correct:true},{text:"Un logiciel qui génère automatiquement de faux textos.",correct:false},{text:"Une méthode de chiffrement des messages texte.",correct:false},{text:"Une technique d'attaque via des numéros étrangers uniquement.",correct:false}], explanation:"Le pretexting est une forme d'ingénierie sociale : l'attaquant se fait passer pour un collègue ou une autorité."},
  { category:"Sauvegardes", question:"Votre ordinateur est infecté par un ransomware. Quelle est la meilleure réaction ?", answers:[{text:"Déconnecter immédiatement l'ordinateur du réseau, ne pas payer la rançon et restaurer depuis une sauvegarde saine.",correct:true},{text:"Payer la rançon rapidement pour récupérer vos fichiers.",correct:false},{text:"Redémarrer l'ordinateur plusieurs fois pour que l'antivirus élimine le virus.",correct:false},{text:"Déconnecter l'ordinateur et payer la rançon en cryptomonnaie.",correct:false}], explanation:"Payer la rançon ne garantit pas la récupération des données. Isolez la machine et restaurez depuis une sauvegarde propre."},
  { category:"Vie privée", question:"Que faire si vous recevez un SMS vous informant d'un colis en attente avec un lien pour payer des frais de douane ?", answers:[{text:"Ne pas cliquer sur le lien. Vérifier directement sur le site officiel du transporteur.",correct:true},{text:"Cliquer sur le lien car les transporteurs officiels utilisent ce système.",correct:false},{text:"Appeler le numéro indiqué dans le SMS.",correct:false},{text:"Cliquer uniquement si le SMS provient d'un numéro à 5 chiffres.",correct:false}], explanation:"C'est une arnaque au faux colis (smishing). Accédez toujours au site officiel en tapant l'adresse vous-même."},
  { category:"Navigation web", question:"Qu'est-ce qu'un VPN et dans quel cas est-il utile ?", answers:[{text:"Un VPN chiffre votre connexion internet et masque votre adresse IP, utile sur les réseaux publics.",correct:true},{text:"Un VPN est un antivirus avancé.",correct:false},{text:"Un VPN rend votre ordinateur totalement anonyme et intraçable.",correct:false},{text:"Un VPN chiffre uniquement pour les sites en HTTP.",correct:false}], explanation:"Un VPN chiffre le tunnel entre vous et internet. Il ne rend pas totalement anonyme et ne remplace pas un antivirus."},
  { category:"Données personnelles", question:"Vous souhaitez supprimer votre compte sur un réseau social. Que devez-vous faire avant la suppression ?", answers:[{text:"Télécharger une copie de vos données, révoquer les accès des applications tierces, puis supprimer le compte.",correct:true},{text:"Supprimer directement le compte car toutes les données sont automatiquement effacées.",correct:false},{text:"Changer simplement votre photo de profil et votre nom.",correct:false},{text:"Télécharger vos données puis envoyer une demande par courrier recommandé.",correct:false}], explanation:"Avant de supprimer un compte, récupérez vos données, révoquez les accès des applications connectées."},
  { category:"Bonnes pratiques", question:"Que signifie « faire preuve d'hygiène numérique » au quotidien ?", answers:[{text:"Adopter un ensemble de bonnes pratiques régulières : mises à jour, mots de passe forts, sauvegardes, vigilance.",correct:true},{text:"Nettoyer son disque dur avec un logiciel de nettoyage chaque semaine.",correct:false},{text:"Utiliser uniquement des appareils Apple car ils sont immunisés.",correct:false},{text:"Adopter les bonnes pratiques uniquement sur les appareils professionnels.",correct:false}], explanation:"L'hygiène numérique est un ensemble de réflexes quotidiens recommandés par l'ANSSI et Cybermalveillance.gouv.fr."}
];

const CYBER_TOTAL     = CYBER_QUESTIONS.length;
const CYBER_THRESHOLD = 0.80;
const CYBER_LETTERS   = ["a","b","c","d"];

/* ============================================================
   ÉTAT GLOBAL
   ============================================================ */
let osUser        = null;
let clockInterval = null;

let tempsState = { index:0, scores:[0,0,0], engagements:[null,null,null] };
let commState  = { profil:null, index:0, scores:[0,0], npsScore:null, activePlan:"6m" };
let cyberState = { questions:[], index:0, score:0, answered:false, responses:[], pending:null };

/* ============================================================
   UTILITAIRES
   ============================================================ */
function sanitize(str) {
  if (typeof str !== "string") return "";
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getNiveauTemps(pct) {
  if (pct < 50) return "debutant";
  if (pct < 75) return "intermediaire";
  return "avance";
}

function getNiveauComm(pct) {
  if (pct < 40) return "faible";
  if (pct < 70) return "intermediaire";
  return "fort";
}

function getNiveauLabelTemps(n) {
  return { debutant:"🔴 Débutant", intermediaire:"🟡 Intermédiaire", avance:"🟢 Avancé" }[n] || "";
}

function getNiveauLabelComm(n) {
  return { faible:"🔴 À renforcer", intermediaire:"🟡 En développement", fort:"🟢 Performant" }[n] || "";
}

function getBadgeStyleTemps(n) {
  return { debutant:"background:#FFEBEE;color:#C62828;border:1.5px solid #E74C3C;", intermediaire:"background:#FEF9E7;color:#D68910;border:1.5px solid #F39C12;", avance:"background:#EAFAF1;color:#1A7A42;border:1.5px solid #28B463;" }[n] || "";
}

function getBadgeStyleComm(n) {
  return { faible:"background:#FFEBEE;color:#C62828;border:1.5px solid #E74C3C;", intermediaire:"background:#FEF9E7;color:#D68910;border:1.5px solid #F39C12;", fort:"background:#EAFAF1;color:#1A7A42;border:1.5px solid #28B463;" }[n] || "";
}

function showAppScreen(appPrefix, screenId) {
  const content = document.getElementById("content-" + appPrefix);
  if (!content) return;
  content.querySelectorAll(".app-screen").forEach(function(s) {
    s.classList.toggle("hidden", s.id !== screenId);
    s.classList.toggle("active", s.id === screenId);
  });
  const win = document.getElementById("app-" + appPrefix);
  if (win) {
    const wc = win.querySelector(".app-window-content");
    if (wc) wc.scrollTo({ top:0, behavior:"smooth" });
  }
}

function renderAxeScores(containerId, axeData) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";
  axeData.forEach(function(axe) {
    const block = document.createElement("div");
    block.classList.add("app-axe-score-block", "niveau-" + axe.niveau);
    block.innerHTML =
      '<div class="app-axe-score-emoji">' + axe.emoji + '</div>' +
      '<div class="app-axe-score-name">' + sanitize(axe.nom) + '</div>' +
      '<div class="app-axe-score-bar-wrap"><div class="app-axe-score-bar" style="width:0%" data-target="' + axe.pct + '"></div></div>' +
      '<div class="app-axe-score-pct">' + axe.pct + '%</div>' +
      '<div class="app-axe-score-niveau">' + axe.label + '</div>';
    el.appendChild(block);
  });
  requestAnimationFrame(function() {
    el.querySelectorAll(".app-axe-score-bar[data-target]").forEach(function(bar) {
      bar.style.width = bar.dataset.target + "%";
    });
  });
}

function renderForfaits(containerId, forfaits, recommandedNom) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";
  forfaits.forEach(function(f) {
    const isRec = f.nom === recommandedNom;
    const card  = document.createElement("div");
    card.classList.add("app-forfait-card");
    if (isRec) card.classList.add("recommande");
    card.innerHTML =
      (isRec ? '<div class="app-forfait-badge">⭐ Recommandé</div>' : "") +
      '<div class="app-forfait-emoji">' + f.emoji + '</div>' +
      '<div class="app-forfait-nom">'  + sanitize(f.nom)  + '</div>' +
      '<div class="app-forfait-prix">' + sanitize(f.prix) + '</div>' +
      '<div class="app-forfait-desc">' + sanitize(f.desc) + '</div>' +
      '<ul class="app-forfait-features">' +
        f.features.map(function(feat) { return '<li>' + sanitize(feat) + '</li>'; }).join("") +
      '</ul>';
    el.appendChild(card);
  });
}

function renderChips(containerId, names, emojis, activeAxe) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (el.children.length === 0) {
    names.forEach(function(name, i) {
      const chip = document.createElement("div");
      chip.classList.add("app-chip");
      chip.dataset.idx = i;
      chip.textContent = emojis[i] + " " + name;
      el.appendChild(chip);
    });
  }
  el.querySelectorAll(".app-chip").forEach(function(chip, i) {
    chip.classList.remove("active","done");
    if (i < activeAxe)        chip.classList.add("done");
    else if (i === activeAxe) chip.classList.add("active");
  });
}

function renderAnswersList(containerId, answers, onSelect) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";

  shuffleArray(answers).forEach(function(answer) {
    const li = document.createElement("li");
    li.classList.add("app-answer-item");
    li.setAttribute("role","button");
    li.setAttribute("tabindex","0");
    Object.keys(answer).forEach(function(k) {
      if (k !== "text") li.dataset[k] = answer[k];
    });

    const badge = document.createElement("span");
    badge.classList.add("app-answer-badge");
    badge.textContent = "→";

    const txt = document.createElement("span");
    txt.textContent = answer.text;

    li.appendChild(badge);
    li.appendChild(txt);
    el.appendChild(li);
  });

  function clickHandler(e) {
    const item = e.target.closest(".app-answer-item");
    if (!item) return;
    el.removeEventListener("click", clickHandler);
    el.removeEventListener("keydown", keyHandler);
    onSelect(item);
  }

  function keyHandler(e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    const item = e.target.closest(".app-answer-item");
    if (!item) return;
    e.preventDefault();
    el.removeEventListener("click", clickHandler);
    el.removeEventListener("keydown", keyHandler);
    onSelect(item);
  }

  el.addEventListener("click", clickHandler);
  el.addEventListener("keydown", keyHandler);
}

/* ============================================================
   OS — FONCTIONS PRINCIPALES
   ============================================================ */
async function authenticate(email, password) {
  if (!supabaseClient) throw new Error("SUPABASE_NOT_CONFIGURED");

  const authResult = await supabaseClient.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: password
  });
  if (authResult.error) throw authResult.error;

  const user = authResult.data && authResult.data.user;
  if (!user) throw new Error("AUTH_NO_USER");

  const profileResult = await supabaseClient
    .from("profiles")
    .select("id, first_name, last_name, email, role, is_active, access_temps, access_communication, access_cyber")
    .eq("id", user.id)
    .single();

  if (profileResult.error || !profileResult.data) {
    await supabaseClient.auth.signOut();
    throw profileResult.error || new Error("PROFILE_NOT_FOUND");
  }

  const p = profileResult.data;
  if (!p.is_active) {
    await supabaseClient.auth.signOut();
    const err = new Error("ACCOUNT_DISABLED");
    err.code = "ACCOUNT_DISABLED";
    throw err;
  }

  const fullName = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return {
    id: p.id,
    email: p.email,
    firstName: p.first_name,
    lastName: p.last_name,
    displayName: fullName || p.email,
    role: p.role,
    isActive: p.is_active,
    access: {
      temps: !!p.access_temps,
      comm: !!p.access_communication,
      cyber: !!p.access_cyber
    }
  };
}

function applyAccessRights() {
  const access = (osUser && osUser.access) || {};
  ["temps", "comm", "cyber"].forEach(function(appId) {
    const allowed = !!access[appId];
    document.querySelectorAll('[data-app="' + appId + '"]').forEach(function(el) {
      el.classList.toggle("hidden", !allowed);
      el.setAttribute("aria-hidden", allowed ? "false" : "true");
    });
  });

  const isAdmin = !!(osUser && osUser.role === "admin");
  [document.getElementById("admin-app-icon"), document.getElementById("admin-dock-item")].forEach(function(el) {
    if (!el) return;
    el.classList.toggle("hidden", !isAdmin);
    el.setAttribute("aria-hidden", isAdmin ? "false" : "true");
  });

  const hasAny = !!(access.temps || access.comm || access.cyber || isAdmin);
  const empty = document.getElementById("os-no-access");
  if (empty) empty.classList.toggle("hidden", hasAny);
}

function userCanAccess(appId) {
  if (appId === "admin") return !!(osUser && osUser.isActive && osUser.role === "admin");
  return !!(osUser && osUser.isActive && osUser.access && osUser.access[appId]);
}

function startClock() {
  const clockEl = document.getElementById("os-clock");
  function tick() {
    const now    = new Date();
    const h      = String(now.getHours()).padStart(2,"0");
    const m      = String(now.getMinutes()).padStart(2,"0");
    const s      = String(now.getSeconds()).padStart(2,"0");
    const days   = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
    const months = ["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"];
    clockEl.textContent = days[now.getDay()] + " " + now.getDate() + " " + months[now.getMonth()] + " — " + h + ":" + m + ":" + s;
  }
  tick();
  clockInterval = setInterval(tick, 1000);
}

function setActiveDockApp(appId) {
  document.querySelectorAll(".os-dock-item").forEach(function(item) {
    const active = item.dataset.app === appId;
    item.classList.toggle("is-active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
}

function openApp(appId) {
  if (!userCanAccess(appId)) return;
  document.querySelectorAll(".os-app-window").forEach(function(w) { w.classList.add("hidden"); });
  const win = document.getElementById("app-" + appId);
  if (win) {
    win.classList.remove("hidden");
    setActiveDockApp(appId);
    if (appId === "admin") adminLoadUsers();
  }
}

function closeApp(appId) {
  const win = document.getElementById("app-" + appId);
  if (win) win.classList.add("hidden");
  setActiveDockApp(null);
}

async function logout() {
  if (supabaseClient) {
    try { await supabaseClient.auth.signOut(); } catch (e) { console.warn("Déconnexion Supabase incomplète", e); }
  }
  osUser = null;
  if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
  document.getElementById("os-desktop").classList.add("hidden");
  document.querySelectorAll(".os-app-window").forEach(function(w) { w.classList.add("hidden"); });
  document.getElementById("os-global-dock").classList.add("hidden");
  document.getElementById("os-login").classList.remove("hidden");
  document.getElementById("input-username").value = "";
  document.getElementById("input-password").value = "";
  tempsState = { index:0, scores:[0,0,0], engagements:[null,null,null] };
  commState  = { profil:null, index:0, scores:[0,0], npsScore:null, activePlan:"6m" };
  cyberState = { questions:[], index:0, score:0, answered:false, responses:[] };
}

/* ============================================================
   ADMINISTRATION — V0.5-B
   Les actions sensibles passent par RPC / Edge Function Supabase.
   Aucune clé service_role n'est utilisée dans le navigateur.
   ============================================================ */
function adminSetMessage(message, isError) {
  const el = document.getElementById("admin-message");
  if (!el) return;
  el.textContent = message || "";
  el.classList.toggle("hidden", !message);
  el.classList.toggle("is-error", !!isError);
}

function adminEscape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
}

async function adminLoadUsers() {
  if (!userCanAccess("admin") || !supabaseClient) return;
  const loading = document.getElementById("admin-users-loading");
  const list = document.getElementById("admin-users-list");
  if (!list) return;
  loading && loading.classList.remove("hidden");
  adminSetMessage("");

  const result = await supabaseClient.rpc("admin_list_profiles");
  loading && loading.classList.add("hidden");
  if (result.error) {
    console.error("admin_list_profiles", result.error);
    list.innerHTML = "";
    adminSetMessage("Impossible de charger les utilisateurs. Vérifiez que le script SQL V0.5-B a bien été exécuté dans Supabase.", true);
    return;
  }

  const users = result.data || [];
  const count = document.getElementById("admin-user-count");
  if (count) count.textContent = users.length + " compte" + (users.length > 1 ? "s" : "");
  list.innerHTML = users.map(adminRenderUser).join("") || '<p class="admin-help">Aucun utilisateur.</p>';
}

function adminRenderUser(u) {
  const role = u.role || "user";
  const lockedRole = role === "admin" || role === "test";
  const isSelf = !!(osUser && u.id === osUser.id);
  const roleBadge = '<span class="admin-badge ' + adminEscape(role) + '">' + adminEscape(role) + '</span>';
  const inactive = u.is_active ? "" : '<span class="admin-badge inactive">désactivé</span>';
  const disabledRights = lockedRole ? " disabled" : "";
  const disabledSelfStatus = isSelf ? " disabled" : "";
  const deleteDisabled = isSelf || role === "admin" ? " disabled" : "";
  const checked = v => v ? " checked" : "";

  return '<article class="admin-user-row" data-user-id="' + adminEscape(u.id) + '">' +
    '<div class="admin-user-identity"><strong>' + adminEscape((u.first_name || "") + " " + (u.last_name || "")) + '</strong>' +
      '<span>' + adminEscape(u.email) + '</span><div class="admin-badges">' + roleBadge + inactive + '</div></div>' +
    '<div class="admin-rights">' +
      '<label><input class="admin-right admin-right-temps" type="checkbox"' + checked(u.access_temps) + disabledRights + '> Temps</label>' +
      '<label><input class="admin-right admin-right-comm" type="checkbox"' + checked(u.access_communication) + disabledRights + '> Communication</label>' +
      '<label><input class="admin-right admin-right-cyber" type="checkbox"' + checked(u.access_cyber) + disabledRights + '> Cyber</label>' +
      '<label class="admin-status-toggle"><input class="admin-active" type="checkbox"' + checked(u.is_active) + disabledSelfStatus + '> Actif</label>' +
    '</div>' +
    '<div class="admin-user-actions">' +
      '<button type="button" class="admin-mini-btn admin-save"' + (lockedRole ? " disabled" : "") + '>Enregistrer</button>' +
      '<button type="button" class="admin-mini-btn danger admin-delete"' + deleteDisabled + '>Supprimer</button>' +
    '</div></article>';
}

async function adminSaveRow(row) {
  if (!row || !userCanAccess("admin")) return;
  const targetId = row.dataset.userId;
  const params = {
    p_target_id: targetId,
    p_is_active: !!row.querySelector(".admin-active").checked,
    p_access_temps: !!row.querySelector(".admin-right-temps").checked,
    p_access_communication: !!row.querySelector(".admin-right-comm").checked,
    p_access_cyber: !!row.querySelector(".admin-right-cyber").checked
  };
  const result = await supabaseClient.rpc("admin_update_user_access", params);
  if (result.error) {
    console.error("admin_update_user_access", result.error);
    adminSetMessage("Modification impossible : " + result.error.message, true);
    return;
  }
  adminSetMessage("Droits utilisateur enregistrés.");
  await adminLoadUsers();
}

async function adminCreateUser() {
  if (!userCanAccess("admin")) return;
  const firstName = document.getElementById("admin-new-firstname").value.trim();
  const lastName = document.getElementById("admin-new-lastname").value.trim();
  const email = document.getElementById("admin-new-email").value.trim().toLowerCase();
  const access = {
    temps: document.getElementById("admin-new-temps").checked,
    communication: document.getElementById("admin-new-comm").checked,
    cyber: document.getElementById("admin-new-cyber").checked
  };
  if (!firstName || !lastName || !email) {
    adminSetMessage("Prénom, nom et adresse e-mail sont obligatoires.", true);
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    adminSetMessage("L’adresse e-mail n’est pas valide.", true);
    return;
  }
  const btn = document.getElementById("admin-create-user");
  btn.disabled = true; btn.textContent = "Création…";
  adminSetMessage("");
  try {
    const result = await supabaseClient.functions.invoke("admin-users", {
      body: { action:"invite", firstName:firstName, lastName:lastName, email:email, access:access }
    });
    if (result.error) throw result.error;
    if (result.data && result.data.error) throw new Error(result.data.error);
    ["admin-new-firstname","admin-new-lastname","admin-new-email"].forEach(id => document.getElementById(id).value = "");
    ["admin-new-temps","admin-new-comm","admin-new-cyber"].forEach(id => document.getElementById(id).checked = false);
    adminSetMessage("Invitation envoyée à " + email + ".");
    await adminLoadUsers();
  } catch (e) {
    console.error("admin-users invite", e);
    adminSetMessage("Création impossible. Vérifiez que l’Edge Function « admin-users » est déployée. " + (e.message || ""), true);
  } finally {
    btn.disabled = false; btn.textContent = "Créer et inviter";
  }
}

async function adminDeleteUser(row) {
  if (!row || !userCanAccess("admin")) return;
  const id = row.dataset.userId;
  const emailEl = row.querySelector(".admin-user-identity span");
  const email = emailEl ? emailEl.textContent : "cet utilisateur";
  if (!window.confirm("Supprimer définitivement le compte " + email + " ?")) return;
  adminSetMessage("");
  try {
    const result = await supabaseClient.functions.invoke("admin-users", { body:{ action:"delete", userId:id } });
    if (result.error) throw result.error;
    if (result.data && result.data.error) throw new Error(result.data.error);
    adminSetMessage("Compte supprimé.");
    await adminLoadUsers();
  } catch (e) {
    console.error("admin-users delete", e);
    adminSetMessage("Suppression impossible. " + (e.message || ""), true);
  }
}

/* ============================================================
   APP TEMPS
   ============================================================ */
function tempsInit() {
  tempsState = { index:0, scores:[0,0,0], engagements:[null,null,null] };
  document.getElementById("temps-chips").innerHTML = "";
  showAppScreen("temps","temps-screen-intro");
}

function tempsRenderQuestion() {
  const q   = TEMPS_QUESTIONS[tempsState.index];
  const axe = q.axe;

  document.getElementById("temps-axe-label").textContent = TEMPS_AXE_EMOJIS[axe] + " " + TEMPS_AXE_NAMES[axe];
  document.getElementById("temps-counter").textContent   = "Question " + (tempsState.index + 1) + " / " + TEMPS_QUESTIONS.length;
  document.getElementById("temps-progress").style.width  = Math.round((tempsState.index / TEMPS_QUESTIONS.length) * 100) + "%";
  document.getElementById("temps-question").textContent  = sanitize(q.text);

  renderChips("temps-chips", TEMPS_AXE_NAMES, TEMPS_AXE_EMOJIS, axe);
  renderAnswersList("temps-answers", q.answers, function(item) {
    tempsState.scores[axe] += parseInt(item.dataset.score, 10);
    tempsState.index++;
    if (tempsState.index >= TEMPS_QUESTIONS.length) {
      document.getElementById("temps-progress").style.width = "100%";
      tempsShowEngagement();
    } else {
      tempsRenderQuestion();
    }
  });
}

function tempsShowEngagement() {
  const container = document.getElementById("temps-engagement-blocks");
  container.innerHTML = "";
  const headerClasses = ["app-eng-header-0","app-eng-header-1","app-eng-header-2"];

  TEMPS_ENGAGEMENT_QUESTIONS.forEach(function(eq) {
    const pct    = Math.round((tempsState.scores[eq.axe] / TEMPS_MAX_SCORES[eq.axe]) * 100);
    const niveau = getNiveauTemps(pct);
    const block  = document.createElement("div");
    block.classList.add("app-engagement-block");
    block.innerHTML =
      '<div class="app-engagement-header ' + headerClasses[eq.axe] + '">' +
        '<span>' + TEMPS_AXE_EMOJIS[eq.axe] + '</span>' +
        '<span>' + sanitize(TEMPS_AXE_NAMES[eq.axe]) + '</span>' +
        '<span class="app-engagement-score">' + getNiveauLabelTemps(niveau) + ' — ' + pct + '%</span>' +
      '</div>' +
      '<div class="app-engagement-body">' +
        '<p class="app-engagement-q">' + sanitize(eq.text) + '</p>' +
        '<ul class="app-engagement-options" data-axe="' + eq.axe + '">' +
          eq.options.map(function(opt) {
            return '<li class="app-engagement-option" role="button" tabindex="0" data-axe="' + eq.axe + '" data-type="' + sanitize(opt.type) + '">' +
              '<span class="app-eng-opt-icon">' + opt.icon + '</span>' +
              '<div><div class="app-eng-opt-title">' + sanitize(opt.title) + '</div>' +
              '<div class="app-eng-opt-desc">' + sanitize(opt.desc) + '</div></div>' +
            '</li>';
          }).join("") +
        '</ul>' +
      '</div>';
    container.appendChild(block);
  });

  showAppScreen("temps","temps-screen-engagement");
}

function tempsShowResult() {
  document.getElementById("temps-result-subtitle").textContent = "Voici votre profil de maturité sur les 3 axes analysés.";

  const axeData = TEMPS_AXE_NAMES.map(function(nom, i) {
    const pct    = Math.round((tempsState.scores[i] / TEMPS_MAX_SCORES[i]) * 100);
    const niveau = getNiveauTemps(pct);
    return { nom:nom, emoji:TEMPS_AXE_EMOJIS[i], pct:pct, niveau:niveau, label:getNiveauLabelTemps(niveau) };
  });
  renderAxeScores("temps-axes-scores", axeData);

  const solContainer = document.getElementById("temps-solutions");
  solContainer.innerHTML = "";
  const headerClasses = ["app-sol-header-0","app-sol-header-1","app-sol-header-2"];
  const engLabelMap   = { accompagne:"🤝 Accompagnement Pekahellix souhaité", autonome:"💪 Travail en autonomie", abandon:"⏸️ Point mis de côté" };

  TEMPS_SOLUTIONS.forEach(function(sol) {
    const pct    = Math.round((tempsState.scores[sol.axe] / TEMPS_MAX_SCORES[sol.axe]) * 100);
    const niveau = getNiveauTemps(pct);
    const data   = sol.niveaux[niveau];
    const eng    = tempsState.engagements[sol.axe];
    const section = document.createElement("div");
    section.classList.add("app-solution-section");
    section.innerHTML =
      '<div class="app-solution-header ' + headerClasses[sol.axe] + '">' +
        '<span>' + sol.emoji + '</span><span>' + sanitize(sol.nom) + '</span>' +
      '</div>' +
      '<div class="app-solution-body">' +
        '<span class="app-solution-badge" style="' + getBadgeStyleTemps(niveau) + '">' + getNiveauLabelTemps(niveau) + '</span>' +
        (eng ? '<div class="app-solution-eng-recap">' + engLabelMap[eng] + '</div>' : '') +
        '<p class="app-solution-intro">' + sanitize(data.intro) + '</p>' +
        '<div class="app-outils-grid">' +
          data.outils.map(function(o) {
            return '<div class="app-outil-card"><div class="app-outil-title">🔧 ' + sanitize(o.titre) + '</div><div class="app-outil-desc">' + sanitize(o.desc) + '</div></div>';
          }).join("") +
        '</div>' +
      '</div>';
    solContainer.appendChild(section);
  });

  const nbAcc  = tempsState.engagements.filter(function(e) { return e === "accompagne"; }).length;
  const recMap = { 0:"Découverte", 1:"Accompagnement", 2:"Accompagnement", 3:"Transformation" };
  renderForfaits("temps-forfaits", TEMPS_FORFAITS, recMap[nbAcc] || "Accompagnement");

  showAppScreen("temps","temps-screen-result");
}

/* ============================================================
   APP COMM
   ============================================================ */
function commInit() {
  commState = { profil:null, index:0, scores:[0,0], npsScore:null, activePlan:"6m" };
  document.getElementById("comm-chips").innerHTML = "";
  showAppScreen("comm","comm-screen-profil");
}

function commSetupIntro(profil) {
  const iconEl     = document.getElementById("comm-intro-icon");
  const titleEl    = document.getElementById("comm-intro-title");
  const subtitleEl = document.getElementById("comm-intro-subtitle");
  const rulesEl    = document.getElementById("comm-rules");

  if (profil === "gerant") {
    iconEl.textContent     = "🏪";
    titleEl.textContent    = "Diagnostic — Vision Gérant";
    subtitleEl.textContent = "Évaluez votre stratégie de communication et découvrez comment vous situez par rapport aux enseignes exemplaires.";
    rulesEl.innerHTML =
      '<li><span>📡</span><strong>8 questions</strong> sur votre communication externe</li>' +
      '<li><span>💬</span><strong>7 questions</strong> sur votre communication interne</li>' +
      '<li><span>🏆</span>Benchmark avec les <strong>meilleures enseignes</strong> du secteur</li>' +
      '<li><span>🗓️</span>Plan de communication sur <strong>6 mois, 1 an ou 3 ans</strong></li>';
  } else {
    iconEl.textContent     = "👥";
    titleEl.textContent    = "Diagnostic — Vision Salarié";
    subtitleEl.textContent = "Partagez votre perception. Vos réponses sont anonymes et contribueront à améliorer votre environnement de travail.";
    rulesEl.innerHTML =
      '<li><span>📡</span><strong>6 questions</strong> sur l\'image externe de votre magasin</li>' +
      '<li><span>💬</span><strong>9 questions</strong> sur la communication interne</li>' +
      '<li><span>🔒</span>Vos réponses sont <strong>anonymes et confidentielles</strong></li>' +
      '<li><span>✅</span>Elles seront <strong>prises en compte</strong> pour améliorer votre quotidien</li>';
  }
}

function commRenderQuestion() {
  const questions = commState.profil === "gerant" ? COMM_QUESTIONS_GERANT : COMM_QUESTIONS_SALARIE;
  const axeNames  = ["Communication Externe","Communication Interne"];
  const axeEmojis = ["📡","💬"];
  const q   = questions[commState.index];
  const axe = q.axe;

  document.getElementById("comm-axe-label").textContent = axeEmojis[axe] + " " + axeNames[axe];
  document.getElementById("comm-counter").textContent   = "Question " + (commState.index + 1) + " / " + questions.length;
  document.getElementById("comm-progress").style.width  = Math.round((commState.index / questions.length) * 100) + "%";
  document.getElementById("comm-question").textContent  = sanitize(q.text);

  renderChips("comm-chips", axeNames, axeEmojis, axe);
  renderAnswersList("comm-answers", q.answers, function(item) {
    const score = parseInt(item.dataset.score, 10);
    commState.scores[axe] += score;
    if (q.text.includes("NPS") || q.text.includes("recommanderiez")) commState.npsScore = score;
    commState.index++;
    if (commState.index >= questions.length) {
      document.getElementById("comm-progress").style.width = "100%";
      if (commState.profil === "gerant") commShowResultGerant();
      else commShowResultSalarie();
    } else {
      commRenderQuestion();
    }
  });
}

function commShowResultSalarie() {
  const maxScores = [6*4, 9*4];
  const pctExt = Math.round((commState.scores[0] / maxScores[0]) * 100);
  const pctInt = Math.round((commState.scores[1] / maxScores[1]) * 100);

  document.getElementById("comm-salarie-merci").textContent =
    "Merci " + sanitize(osUser.displayName) + " pour votre participation. Votre avis compte et sera pris en compte.";

  renderAxeScores("comm-salarie-scores", [
    { nom:"Image Externe",         emoji:"📡", pct:pctExt, niveau:getNiveauComm(pctExt), label:getNiveauLabelComm(getNiveauComm(pctExt)) },
    { nom:"Communication Interne", emoji:"💬", pct:pctInt, niveau:getNiveauComm(pctInt), label:getNiveauLabelComm(getNiveauComm(pctInt)) }
  ]);

  const npsLabels = {
    1:"Vous ne recommanderiez pas votre magasin comme lieu de travail (0-3/10). Ce signal est important.",
    2:"Vous hésiteriez à recommander votre magasin (4-6/10). Des axes d'amélioration existent.",
    3:"Vous recommanderiez probablement votre magasin (7-8/10). C'est encourageant !",
    4:"Vous recommanderiez absolument votre magasin (9-10/10). Vous êtes un vrai ambassadeur !"
  };
  const npsEl = document.getElementById("comm-nps-recap");
  if (commState.npsScore) {
    npsEl.innerHTML = "<strong>Votre NPS Employé :</strong> " + npsLabels[commState.npsScore];
    npsEl.classList.remove("hidden");
  }
  showAppScreen("comm","comm-screen-result-salarie");
}

function commShowResultGerant() {
  const maxScores    = [8*4, 7*4];
  const pctExt       = Math.round((commState.scores[0] / maxScores[0]) * 100);
  const pctInt       = Math.round((commState.scores[1] / maxScores[1]) * 100);
  const niveauExt    = getNiveauComm(pctExt);
  const niveauInt    = getNiveauComm(pctInt);
  const totalPct     = Math.round(((commState.scores[0] + commState.scores[1]) / (maxScores[0] + maxScores[1])) * 100);
  const niveauGlobal = getNiveauComm(totalPct);

  document.getElementById("comm-gerant-title").textContent    = "📊 Diagnostic de " + sanitize(osUser.displayName);
  document.getElementById("comm-gerant-subtitle").textContent = "Voici votre profil de communication, mis en perspective avec les meilleures pratiques du secteur.";

  renderAxeScores("comm-gerant-scores", [
    { nom:"Communication Externe", emoji:"📡", pct:pctExt, niveau:niveauExt, label:getNiveauLabelComm(niveauExt) },
    { nom:"Communication Interne", emoji:"💬", pct:pctInt, niveau:niveauInt, label:getNiveauLabelComm(niveauInt) }
  ]);

  commRenderBenchmark();
  commRenderPlan(niveauGlobal, "6m");

  const forfaitMap = { faible:"Essentiel 6 mois", intermediaire:"Croissance 1 an", fort:"Transformation 3 ans" };
  renderForfaits("comm-forfaits", COMM_FORFAITS, forfaitMap[niveauGlobal]);

  showAppScreen("comm","comm-screen-result-gerant");
}

function commRenderBenchmark() {
  const el = document.getElementById("comm-benchmark");
  if (!el) return;
  el.innerHTML = "";
  COMM_BENCHMARK.forEach(function(item) {
    const div = document.createElement("div");
    div.classList.add("app-benchmark-item");
    div.innerHTML =
      '<div class="app-benchmark-header ' + item.classe + '">' +
        '<span>' + item.emoji + '</span><span>' + sanitize(item.enseigne) + '</span>' +
      '</div>' +
      '<div class="app-benchmark-body">' +
        '<div>' + item.tags.map(function(t) {
          return '<span class="app-benchmark-tag tag-' + t + '">' + (t==="ext" ? "📡 Externe" : "💬 Interne") + '</span>';
        }).join("") + '</div>' +
        '<p class="app-benchmark-text">' + sanitize(item.texte) + '</p>' +
        '<div class="app-benchmark-score">📊 ' + sanitize(item.score) + '</div>' +
      '</div>';
    el.appendChild(div);
  });
}

function commRenderPlan(niveauGlobal, duree) {
  commState.activePlan = duree;
  const etapes = (COMM_PLANS[duree] && COMM_PLANS[duree][niveauGlobal]) || COMM_PLANS[duree]["intermediaire"];
  const el     = document.getElementById("comm-plan-content");
  const introEl = document.getElementById("comm-plan-intro");
  if (!el || !introEl) return;

  introEl.textContent = "Sur la base de votre diagnostic (niveau " + getNiveauLabelComm(niveauGlobal) + "), voici votre plan personnalisé.";
  el.innerHTML = "";

  etapes.forEach(function(etape, i) {
    const div = document.createElement("div");
    div.classList.add("app-plan-etape");
    div.innerHTML =
      '<div class="app-plan-num">' + (i+1) + '</div>' +
      '<div style="flex:1;">' +
        '<div class="app-plan-titre">' + sanitize(etape.titre) + '</div>' +
        '<div class="app-plan-desc">'  + sanitize(etape.desc)  + '</div>' +
      '</div>' +
      '<div class="app-plan-delai">' + sanitize(etape.delai) + '</div>';
    el.appendChild(div);
  });

  document.querySelectorAll(".app-plan-tab").forEach(function(tab) {
    tab.classList.toggle("active", tab.dataset.plan === duree);
  });
}

/* ============================================================
   APP CYBER
   ============================================================ */
function cyberInit() {
  cyberState = {
    questions: shuffleArray(CYBER_QUESTIONS).slice(0, CYBER_TOTAL),
    index: 0,
    score: 0,
    answered: false,
    responses: [],
    pending: null
  };
  showAppScreen("cyber","cyber-screen-quiz");
  cyberRenderQuestion();
}

function cyberRenderQuestion() {
  cyberState.answered = false;
  cyberState.pending = null;
  const q = cyberState.questions[cyberState.index];

  document.getElementById("cyber-category").textContent = sanitize(q.category);
  document.getElementById("cyber-counter").textContent = "Question " + (cyberState.index + 1) + " / " + CYBER_TOTAL;
  document.getElementById("cyber-score-live").textContent = "Choisissez une réponse";
  document.getElementById("cyber-progress").style.width = Math.round((cyberState.index / CYBER_TOTAL) * 100) + "%";
  document.getElementById("cyber-question").textContent = sanitize(q.question);

  const nextBtn = document.getElementById("cyber-btn-next");
  nextBtn.classList.add("hidden");
  nextBtn.disabled = true;

  const answersEl = document.getElementById("cyber-answers");
  answersEl.innerHTML = "";

  shuffleArray(q.answers).forEach(function(answer, idx) {
    const li = document.createElement("li");
    li.classList.add("app-answer-item");
    li.setAttribute("role","button");
    li.setAttribute("tabindex","0");
    li.dataset.correct = answer.correct ? "true" : "false";
    li.dataset.answerText = answer.text;

    const badge = document.createElement("span");
    badge.classList.add("app-answer-badge");
    badge.textContent = CYBER_LETTERS[idx] + ".";

    const txt = document.createElement("span");
    txt.textContent = answer.text;

    li.appendChild(badge);
    li.appendChild(txt);
    answersEl.appendChild(li);
  });
}

function cyberHandleAnswer(item) {
  const q = cyberState.questions[cyberState.index];
  const isCorrect = item.dataset.correct === "true";
  const selectedText = item.dataset.answerText || item.textContent.trim();
  const correctAnswer = q.answers.find(function(answer) { return answer.correct; });

  // Une seule réponse visuellement sélectionnée à la fois.
  document.querySelectorAll("#cyber-answers .app-answer-item").forEach(function(el) {
    el.classList.remove("selected");
    el.setAttribute("aria-pressed", "false");
  });
  item.classList.add("selected");
  item.setAttribute("aria-pressed", "true");

  // La réponse reste modifiable tant que l'utilisateur n'a pas cliqué sur « Question suivante ».
  cyberState.answered = true;
  cyberState.pending = {
    question: q.question,
    category: q.category,
    selected: selectedText,
    correct: correctAnswer ? correctAnswer.text : "",
    isCorrect: isCorrect,
    explanation: q.explanation
  };

  document.getElementById("cyber-score-live").textContent = "Réponse sélectionnée ✓";
  const nextBtn = document.getElementById("cyber-btn-next");
  nextBtn.textContent = (cyberState.index + 1 >= CYBER_TOTAL) ? "Voir mes résultats →" : "Question suivante →";
  nextBtn.disabled = false;
  nextBtn.classList.remove("hidden");

  // Sur mobile, amener automatiquement le bouton d'action dans la zone visible
  // après la sélection afin d'éviter un scroll manuel.
  window.setTimeout(function() {
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nextBtn.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }, 120);
}

function cyberCommitCurrentAnswer() {
  if (!cyberState.pending) return false;
  if (cyberState.pending.isCorrect) cyberState.score++;
  cyberState.responses.push(cyberState.pending);
  cyberState.pending = null;
  return true;
}

function cyberRenderReview() {
  const review = document.getElementById("cyber-review");
  review.innerHTML = "";

  const heading = document.createElement("div");
  heading.className = "cyber-review-heading";
  const wrongCount = CYBER_TOTAL - cyberState.score;
  heading.innerHTML = "<h3>Corrigé du questionnaire</h3><p>" + cyberState.score + " bonne" + (cyberState.score > 1 ? "s" : "") + " réponse" + (cyberState.score > 1 ? "s" : "") + " · " + wrongCount + " mauvaise" + (wrongCount > 1 ? "s" : "") + " réponse" + (wrongCount > 1 ? "s" : "") + "</p>";
  review.appendChild(heading);

  cyberState.responses.forEach(function(response, idx) {
    const item = document.createElement("article");
    item.className = "cyber-review-item " + (response.isCorrect ? "review-correct" : "review-wrong");

    const top = document.createElement("div");
    top.className = "cyber-review-top";

    const status = document.createElement("span");
    status.className = "cyber-review-status";
    status.textContent = response.isCorrect ? "✅ Bonne réponse" : "❌ Mauvaise réponse";

    const number = document.createElement("span");
    number.className = "cyber-review-number";
    number.textContent = "Question " + (idx + 1);

    top.appendChild(status);
    top.appendChild(number);

    const category = document.createElement("div");
    category.className = "cyber-review-category";
    category.textContent = sanitize(response.category);

    const question = document.createElement("p");
    question.className = "cyber-review-question";
    question.textContent = sanitize(response.question);

    const chosen = document.createElement("p");
    chosen.className = "cyber-review-answer";
    chosen.innerHTML = "<strong>Votre réponse :</strong> ";
    chosen.appendChild(document.createTextNode(response.selected));

    const correct = document.createElement("p");
    correct.className = "cyber-review-correction";
    correct.innerHTML = "<strong>Bonne réponse :</strong> ";
    correct.appendChild(document.createTextNode(response.correct));

    const explanation = document.createElement("p");
    explanation.className = "cyber-review-explanation";
    explanation.innerHTML = "<strong>Explication :</strong> ";
    explanation.appendChild(document.createTextNode(response.explanation));

    item.appendChild(top);
    item.appendChild(category);
    item.appendChild(question);
    item.appendChild(chosen);
    item.appendChild(correct);
    item.appendChild(explanation);
    review.appendChild(item);
  });
}

function cyberShowResult() {
  const pct = Math.round((cyberState.score / CYBER_TOTAL) * 100);
  const success = pct >= CYBER_THRESHOLD * 100;

  document.getElementById("cyber-result-icon").textContent = success ? "🏆" : "📚";
  document.getElementById("cyber-result-title").textContent = success ? "Félicitations !" : "Quiz non validé";
  document.getElementById("cyber-result-subtitle").textContent = success
    ? "Bravo " + sanitize(osUser.displayName) + ", vous avez réussi le quiz !"
    : "Dommage " + sanitize(osUser.displayName) + ", le score minimum de 80% n'est pas atteint.";

  document.getElementById("cyber-score-pct").textContent = pct + "%";
  const circle = document.getElementById("cyber-score-circle");
  circle.classList.remove("success","failure");
  circle.classList.add(success ? "success" : "failure");

  document.getElementById("cyber-score-detail").textContent = "Bonnes réponses : " + cyberState.score + " / " + CYBER_TOTAL;

  const badge = document.getElementById("cyber-badge");
  badge.textContent = success ? "✅ Certification Cybersécurité obtenue" : "❌ Score insuffisant — 80% requis";
  badge.className = "app-cyber-badge " + (success ? "badge-success" : "badge-failure");
  badge.classList.remove("hidden");

  const mailShare = document.getElementById("cyber-mail-share");
  const managerEmail = document.getElementById("cyber-manager-email");
  const mailStatus = document.getElementById("cyber-mail-status");
  if (mailShare) mailShare.classList.toggle("hidden", !success);
  if (mailStatus) mailStatus.textContent = "";
  if (success && managerEmail) {
    try { managerEmail.value = localStorage.getItem("pekahellix_manager_email") || ""; } catch (e) {}
  }

  cyberRenderReview();
  showAppScreen("cyber","cyber-screen-result");
}

/* ============================================================
   INITIALISATION — TOUS LES LISTENERS DANS DOMContentLoaded
   ============================================================ */
document.addEventListener("DOMContentLoaded", function() {

  initSupabase();

  /* ── ÉTAT INITIAL ── */
  document.getElementById("os-login").classList.remove("hidden");
  document.getElementById("os-desktop").classList.add("hidden");
  document.querySelectorAll(".os-app-window").forEach(function(w) { w.classList.add("hidden"); });

  /* ── LOGIN — écoute click direct sur le bouton ── */
  async function doLogin() {
    var errEl    = document.getElementById("login-error");
    var email    = document.getElementById("input-username").value;
    var password = document.getElementById("input-password").value;
    var btn      = document.getElementById("login-btn");

    errEl.classList.add("hidden");

    if (!email.trim() || !password.trim()) {
      errEl.textContent = "Veuillez renseigner votre adresse e-mail et votre mot de passe.";
      errEl.classList.remove("hidden");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Connexion…";

    try {
      var user = await authenticate(email, password);
      osUser = user;
      document.getElementById("os-login").classList.add("hidden");
      document.getElementById("os-desktop").classList.remove("hidden");
      document.getElementById("os-global-dock").classList.remove("hidden");
      applyAccessRights();
      document.getElementById("os-username").textContent = osUser.displayName;
      document.getElementById("os-welcome-name").textContent = "Bonjour, " + osUser.displayName + " 👋";
      document.getElementById("temps-welcome").textContent = "Bonjour, " + osUser.displayName + " !";
      document.getElementById("comm-welcome").textContent = "Bonjour, " + osUser.displayName + " !";
      document.getElementById("cyber-welcome").textContent = "Bonjour, " + osUser.displayName + " !";
      document.getElementById("input-username").value = "";
      document.getElementById("input-password").value = "";
      startClock();
    } catch (e) {
      console.error("Connexion Pekahellix", e);
      if (e && (e.code === "ACCOUNT_DISABLED" || e.message === "ACCOUNT_DISABLED")) {
        errEl.textContent = "Ce compte est désactivé. Contactez votre administrateur Pekahellix.";
      } else if (e && e.message === "SUPABASE_NOT_CONFIGURED") {
        errEl.textContent = "Connexion Supabase non configurée. Complétez le fichier config.js.";
      } else {
        errEl.textContent = "Adresse e-mail ou mot de passe incorrect.";
      }
      errEl.classList.remove("hidden");
      document.getElementById("input-password").value = "";
      document.getElementById("input-password").focus();
    } finally {
      btn.disabled = false;
      btn.textContent = "Connexion →";
    }
  }

  /* Clic sur le bouton */
  document.getElementById("login-btn").addEventListener("click", doLogin);

  /* Touche Entrée dans les champs */
  document.getElementById("input-username").addEventListener("keydown", function(e) {
    if (e.key === "Enter") doLogin();
  });
  document.getElementById("input-password").addEventListener("keydown", function(e) {
    if (e.key === "Enter") doLogin();
  });


  /* ── BUREAU ── */
  document.getElementById("btn-logout-os").addEventListener("click", logout);

  document.querySelectorAll(".os-app-icon").forEach(function(btn) {
    btn.addEventListener("click", function() { openApp(this.dataset.app); });
  });

  document.querySelectorAll(".os-dock-item").forEach(function(item) {
    item.addEventListener("click", function() { openApp(this.dataset.app); });
  });

  /* ── ADMINISTRATION ── */
  document.getElementById("admin-refresh").addEventListener("click", adminLoadUsers);
  document.getElementById("admin-create-user").addEventListener("click", adminCreateUser);
  document.getElementById("admin-users-list").addEventListener("click", function(e) {
    const row = e.target.closest(".admin-user-row");
    if (!row) return;
    if (e.target.closest(".admin-save")) adminSaveRow(row);
    if (e.target.closest(".admin-delete")) adminDeleteUser(row);
  });

  document.querySelectorAll(".app-window-close").forEach(function(btn) {
    btn.addEventListener("click", function() { closeApp(this.dataset.close); });
  });

  /* ── APP TEMPS ── */
  document.getElementById("temps-btn-start").addEventListener("click", function() {
    tempsInit();
    showAppScreen("temps","temps-screen-diag");
    tempsRenderQuestion();
  });

  document.getElementById("temps-engagement-blocks").addEventListener("click", function(e) {
    const opt = e.target.closest(".app-engagement-option");
    if (!opt) return;
    const axe  = parseInt(opt.dataset.axe, 10);
    const type = opt.dataset.type;
    document.querySelectorAll('.app-engagement-option[data-axe="' + axe + '"]').forEach(function(el) {
      el.classList.remove("selected-accompagne","selected-autonome","selected-abandon");
    });
    opt.classList.add("selected-" + type);
    tempsState.engagements[axe] = type;
  });

  document.getElementById("temps-btn-validate").addEventListener("click", function() {
    const missing = tempsState.engagements.findIndex(function(e) { return e === null; });
    if (missing !== -1) {
      const blocks = document.querySelectorAll(".app-engagement-block");
      if (blocks[missing]) {
        blocks[missing].scrollIntoView({ behavior:"smooth", block:"center" });
        blocks[missing].style.outline = "2px solid #FF7900";
        setTimeout(function() { blocks[missing].style.outline = ""; }, 2000);
      }
      return;
    }
    tempsShowResult();
  });

  document.getElementById("temps-btn-restart").addEventListener("click", function() {
    tempsInit();
    showAppScreen("temps","temps-screen-diag");
    tempsRenderQuestion();
  });

  /* ── APP COMM ── */
  document.getElementById("comm-btn-gerant").addEventListener("click", function() {
    commState.profil = "gerant";
    commSetupIntro("gerant");
    showAppScreen("comm","comm-screen-intro");
  });

  document.getElementById("comm-btn-salarie").addEventListener("click", function() {
    commState.profil = "salarie";
    commSetupIntro("salarie");
    showAppScreen("comm","comm-screen-intro");
  });

  document.getElementById("comm-btn-start").addEventListener("click", function() {
    commState.index    = 0;
    commState.scores   = [0,0];
    commState.npsScore = null;
    document.getElementById("comm-chips").innerHTML = "";
    showAppScreen("comm","comm-screen-diag");
    commRenderQuestion();
  });

  document.getElementById("comm-btn-restart-salarie").addEventListener("click", commInit);
  document.getElementById("comm-btn-restart-gerant").addEventListener("click", commInit);

  document.querySelectorAll(".app-plan-tab").forEach(function(tab) {
    tab.addEventListener("click", function() {
      const maxScores    = [8*4, 7*4];
      const totalPct     = Math.round(((commState.scores[0] + commState.scores[1]) / (maxScores[0] + maxScores[1])) * 100);
      commRenderPlan(getNiveauComm(totalPct), this.dataset.plan);
    });
  });

  /* ── APP CYBER ── */
  document.getElementById("cyber-btn-start").addEventListener("click", cyberInit);

  document.getElementById("cyber-answers").addEventListener("click", function(e) {
    const item = e.target.closest(".app-answer-item");
    if (item && !item.classList.contains("disabled")) cyberHandleAnswer(item);
  });

  document.getElementById("cyber-answers").addEventListener("keydown", function(e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    const item = e.target.closest(".app-answer-item");
    if (item && !item.classList.contains("disabled")) { e.preventDefault(); cyberHandleAnswer(item); }
  });

  document.getElementById("cyber-btn-next").addEventListener("click", function() {
    if (!cyberCommitCurrentAnswer()) return;
    cyberState.index++;
    if (cyberState.index >= CYBER_TOTAL) {
      cyberShowResult();
    } else {
      cyberRenderQuestion();

      // Après le passage à la question suivante, revenir automatiquement
      // en haut de la nouvelle question. Cela complète le scroll vers le
      // bouton « Question suivante » effectué lors de la sélection.
      window.setTimeout(function() {
        const questionEl = document.getElementById("cyber-question");
        if (!questionEl) return;
        const reduceMotion = window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        questionEl.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });
      }, 80);
    }
  });

  document.getElementById("cyber-btn-email-score").addEventListener("click", function() {
    const emailInput = document.getElementById("cyber-manager-email");
    const status = document.getElementById("cyber-mail-status");
    const email = (emailInput.value || "").trim();
    const pct = Math.round((cyberState.score / CYBER_TOTAL) * 100);

    if (pct < CYBER_THRESHOLD * 100) return;
    if (!email || !emailInput.checkValidity()) {
      status.textContent = "Saisissez une adresse e-mail valide pour votre manager.";
      emailInput.focus();
      return;
    }

    try { localStorage.setItem("pekahellix_manager_email", email); } catch (e) {}

    const userName = osUser && osUser.displayName ? osUser.displayName : "Collaborateur";
    const subject = "Pekahellix OS – Résultat questionnaire Cybersécurité";
    const body = [
      "Bonjour,",
      "",
      "Je vous transmets mon résultat au questionnaire Cybersécurité Pekahellix OS.",
      "",
      "Collaborateur : " + userName,
      "Score : " + pct + "%",
      "Bonnes réponses : " + cyberState.score + " / " + CYBER_TOTAL,
      "Seuil de validation : 80%",
      "Résultat : questionnaire validé",
      "",
      "Cordialement"
    ].join("\n");

    status.textContent = "Ouverture de votre application e-mail…";
    window.location.href = "mailto:" + encodeURIComponent(email) +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  });

  document.getElementById("cyber-btn-retry").addEventListener("click", cyberInit);

}); /* FIN DOMContentLoaded */
