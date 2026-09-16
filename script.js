window.PEKAHELLIX_BUILD = "0.5-H.2";
/* ============================================================
   PEKAHELLIX OS — Gestionnaire unifié des 3 applications
   Apps : Gestion du Temps · Communication · Cybersécurité
   Architecture : 100% front-end, données embarquées
   ============================================================ */
"use strict";

/* ============================================================
   SUPABASE — AUTHENTIFICATION V0.5-E.2
   ============================================================ */
let supabaseClient = null;

// Capturé avant que Supabase ne nettoie éventuellement l’URL de retour.
const pekahellixAuthReturn = new URLSearchParams(window.location.search);
const pekahellixAuthHash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
const pekahellixInviteFlow =
  pekahellixAuthReturn.get("type") === "invite" ||
  pekahellixAuthHash.get("type") === "invite";
const pekahellixRecoveryFlow =
  pekahellixAuthReturn.get("type") === "recovery" ||
  pekahellixAuthHash.get("type") === "recovery";

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
  { axe:0, text:"En fin de journée, la plupart du temps, quel est votre sentiment sur les tâches accomplies ?", answers:[{text:"J'ai été très occupé mais je n'ai pas avancé sur ce qui compte vraiment.",score:1},{text:"J'ai traité beaucoup d'urgences mais peu de projets stratégiques.",score:2},{text:"J'ai accompli la plupart de mes priorités du jour.",score:3},{text:"J'ai accompli mes 3 tâches prioritaires et j'ai planifié le lendemain.",score:4}]},
  { axe:0, text:"Utilisez-vous une méthode de priorisation formelle (ABCDE, MoSCoW, ICE Score…) ?", answers:[{text:"Non, je fonctionne à l'intuition.",score:1},{text:"J'ai essayé mais je n'ai pas de méthode stable.",score:2},{text:"J'utilise une méthode simple de façon régulière.",score:3},{text:"J'utilise une méthode structurée et je la transmets à mon équipe.",score:4}]},
  { axe:0, text:"Votre agenda reflète-t-il réellement vos priorités stratégiques ?", answers:[{text:"Non, il est rempli de réunions et d'urgences subies.",score:1},{text:"Partiellement — quelques blocs stratégiques mais souvent bousculés.",score:2},{text:"Oui, j'ai des blocs dédiés à mes priorités que je protège.",score:3},{text:"Oui, mon agenda est un reflet fidèle de ma stratégie à 90 jours.",score:4}]},
  { axe:1, text:"Comment gérez-vous votre liste de tâches au quotidien ?", answers:[{text:"Je garde tout en tête — je n'utilise pas de liste.",score:1},{text:"J'ai des notes éparpillées (post-it, cahier, e-mails à moi-même).",score:2},{text:"J'utilise un outil numérique ou un carnet dédié mis à jour régulièrement.",score:3},{text:"J'utilise un système structuré (GTD, Notion, Todoist) avec revue hebdomadaire.",score:4}]},
  { axe:1, text:"Quelle est la taille habituelle de votre to-do list ?", answers:[{text:"Je n’en ai pas — je gère mes tâches au fil de l’eau.",score:1},{text:"Plus de 50 tâches — elle est ingérable.",score:1},{text:"Entre 20 et 50 tâches — je ne sais plus par où commencer.",score:2},{text:"Entre 10 et 20 tâches — c'est gérable mais chargé.",score:3},{text:"Moins de 10 tâches actives — les autres sont classées dans une liste de tâches à traiter plus tard.",score:4}]},
  { axe:1, text:"Faites-vous une revue hebdomadaire de vos tâches et projets en cours ?", answers:[{text:"Non, jamais.",score:1},{text:"Rarement — seulement quand je me sens débordé.",score:2},{text:"Parfois — j'essaie mais ce n'est pas systématique.",score:3},{text:"Oui, chaque semaine à heure fixe — c'est un rituel non négociable.",score:4}]},
  { axe:1, text:"Vos tâches sont-elles formulées avec une action concrète et un résultat attendu ?", answers:[{text:"Non, j'écris des mots vagues comme « budget » ou « RH ».",score:1},{text:"Parfois — certaines tâches sont claires, d'autres non.",score:2},{text:"Souvent — j'essaie de formuler des actions précises.",score:3},{text:"Toujours — chaque tâche commence par un verbe d'action et a un livrable défini.",score:4}]},
  { axe:1, text:"Utilisez-vous des délais (deadlines) pour chacune de vos tâches ?", answers:[{text:"Non — les tâches s'accumulent sans date limite.",score:1},{text:"Seulement pour les tâches imposées par des tiers.",score:2},{text:"Pour la plupart de mes tâches importantes.",score:3},{text:"Pour toutes mes tâches, avec rappels automatiques.",score:4}]},
  { axe:1, text:"Que faites-vous des tâches récurrentes (comptabilité, reporting, suivi clients) ?", answers:[{text:"Je les traite quand j'y pense — elles sont souvent en retard.",score:1},{text:"Je les note à chaque fois dans ma liste.",score:2},{text:"J'ai des rappels ou des routines partiellement automatisées.",score:3},{text:"Elles sont entièrement automatisées ou déléguées avec un système de suivi.",score:4}]},
  { axe:2, text:"Quelle proportion de vos tâches déléguez-vous à votre équipe ?", answers:[{text:"Moins de 10% — je préfère faire moi-même pour être sûr du résultat.",score:1},{text:"Entre 10 et 30% — je délègue les tâches simples uniquement.",score:2},{text:"Entre 30 et 60% — je délègue régulièrement mais je garde beaucoup.",score:3},{text:"Plus de 60% — je me concentre sur ce que seul je peux faire.",score:4}]},
  { axe:2, text:"Lorsque vous déléguez une tâche, comment procédez-vous ?", answers:[{text:"Je donne la tâche oralement sans suivi particulier.",score:1},{text:"J'explique ce que je veux mais je ne fixe pas de délai précis.",score:2},{text:"Je définis la tâche, le délai et je fais un point intermédiaire.",score:3},{text:"Je définis le résultat attendu, les ressources, le délai et j'utilise un outil de suivi.",score:4}]},
  { axe:2, text:"Avez-vous identifié les tâches que vous seul pouvez faire (zone de génie) ?", answers:[{text:"Non — je fais tout sans distinction.",score:1},{text:"Vaguement — j'ai une idée mais ce n'est pas formalisé.",score:2},{text:"Oui — j'ai une liste de mes tâches à haute valeur ajoutée.",score:3},{text:"Oui — tout le reste est délégué, automatisé ou supprimé.",score:4}]},
  { axe:2, text:"Comment réagissez-vous quand un collaborateur revient vers vous avec un problème ?", answers:[{text:"Je résous le problème à sa place immédiatement.",score:1},{text:"Je lui donne la solution et/ou lui explique le raisonnement.",score:2},{text:"Je lui pose des questions pour qu'il trouve lui-même la solution.",score:3},{text:"Mon équipe résout les problèmes de niveau 1 et 2 sans me solliciter.",score:4}]},
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
  { axe:1, nom:"To-Do List", emoji:"✅", niveaux:{ debutant:{ intro:"Votre système de gestion des tâches est insuffisant. Externalisez votre mémoire dans un système fiable.", outils:[{titre:"Méthode GTD",desc:"Capturez tout, clarifiez, organisez, révisez, agissez."},{titre:"Todoist / TickTick",desc:"Applications gratuites pour gérer vos tâches avec délais."},{titre:"Règle des 2 minutes",desc:"Si < 2 minutes : faites-le. Sinon : planifiez-le."}]}, intermediaire:{ intro:"Vous avez un système mais il manque de structure. Travaillez sur la qualité des tâches et la revue hebdomadaire.", outils:[{titre:"Revue hebdomadaire GTD",desc:"Chaque vendredi : videz, révisez, planifiez."},{titre:"Notion / Obsidian",desc:"Outils tout-en-un pour tâches, projets et notes."},{titre:"Formulation SMART",desc:"Chaque tâche : Spécifique, Mesurable, Temporelle."}]}, avance:{ intro:"Votre système est mature. Optimisez l'automatisation et la délégation des récurrences.", outils:[{titre:"Zapier / Make",desc:"Automatisez les tâches récurrentes entre vos outils."},{titre:"Capture universelle",desc:"Un seul endroit pour tout capturer, accessible partout."},{titre:"Liste des tâches à traiter plus tard, priorisée",desc:"Classez les tâches à traiter plus tard selon leur valeur et l’effort nécessaire pour décider rapidement."}]}}},
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
  { id:"EXT-01", kind:"mirror", axe:0, dimension:"Clarté & efficacité", text:"La communication de votre entreprise permet-elle à vos clients de comprendre facilement vos offres, services et informations importantes ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"EXT-02", kind:"mirror", axe:0, dimension:"Image & cohérence", text:"L'image que votre entreprise communique à l'extérieur vous paraît-elle claire, cohérente et professionnelle sur ses différents supports ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"EXT-03", kind:"mirror", axe:0, dimension:"Accueil & relation client", text:"Selon vous, vos clients perçoivent-ils positivement l'accueil et la qualité de la relation avec votre entreprise ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"EXT-04", kind:"mirror", axe:0, dimension:"Écoute & réactivité", text:"Selon vous, votre entreprise écoute-t-elle ses clients et répond-elle efficacement à leurs demandes ou remarques ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"EXT-05", kind:"mirror", axe:0, dimension:"Ancrage local", text:"L'implication de votre entreprise dans la vie locale est-elle suffisamment visible auprès de vos clients ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"EXT-06", kind:"mirror", axe:0, dimension:"Attractivité & fidélisation", text:"Selon vous, l'image et la communication de votre entreprise donnent-elles envie aux clients de venir, de revenir et de la recommander ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-01", kind:"mirror", axe:1, dimension:"Circulation de l'information", text:"Selon vous, vos employés sont-ils informés clairement et suffisamment tôt des actualités et décisions importantes qui les concernent ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-02", kind:"mirror", axe:1, dimension:"Expression & écoute", text:"Selon vous, vos employés peuvent-ils facilement exprimer leurs idées, difficultés ou suggestions et obtenir un retour ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-03", kind:"mirror", axe:1, dimension:"Communication dans l'équipe", text:"Selon vous, la communication entre les membres de votre équipe est-elle fluide, respectueuse et bienveillante ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-04", kind:"mirror", axe:1, dimension:"Feedback", text:"Donnez-vous à vos employés des retours réguliers et constructifs sur leur travail ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-05", kind:"mirror", axe:1, dimension:"Reconnaissance", text:"Selon vous, vos employés se sentent-ils suffisamment reconnus et valorisés pour leur travail ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-06", kind:"mirror", axe:1, dimension:"Vision & objectifs", text:"Selon vous, vos employés comprennent-ils la vision, les objectifs de l'entreprise et leur rôle dans leur réalisation ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-07", kind:"mirror", axe:1, dimension:"Temps d'échange collectifs", text:"Les réunions ou temps d'échange organisés permettent-ils selon vous de partager efficacement les informations et de suivre les décisions prises ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"PR-01", kind:"practice", axe:2, dimension:"Réseaux sociaux", text:"Votre entreprise dispose-t-elle d’une présence active et structurée sur les réseaux sociaux pertinents pour son activité ?", answers:[{text:"Non, aucune présence active.",score:1},{text:"Présence occasionnelle, rarement mise à jour.",score:2},{text:"Publications régulières mais sans stratégie formalisée.",score:3},{text:"Stratégie éditoriale structurée, planifiée et suivie.",score:4}] },
  { id:"PR-02", kind:"practice", axe:2, dimension:"Visibilité locale numérique", text:"Les informations de votre établissement sur Google sont-elles complètes, exactes et régulièrement mises à jour ?", answers:[{text:"Non, aucune fiche ou informations très incomplètes.",score:1},{text:"Fiche présente mais incomplète ou rarement mise à jour.",score:2},{text:"Fiche complète et globalement à jour.",score:3},{text:"Fiche complète, régulièrement actualisée et avis suivis.",score:4}] },
  { id:"PR-03", kind:"practice", axe:2, dimension:"Communication locale", text:"Menez-vous régulièrement des actions de communication ou des partenariats à l’échelle locale ?", answers:[{text:"Non, aucune action spécifique.",score:1},{text:"Quelques actions ponctuelles.",score:2},{text:"Actions régulières mais peu coordonnées.",score:3},{text:"Plan d’actions local structuré avec partenariats et suivi.",score:4}] },
  { id:"PR-04", kind:"practice", axe:2, dimension:"Avis & réclamations", text:"Disposez-vous d’une méthode définie pour traiter et suivre les avis ou réclamations clients ?", answers:[{text:"Non, aucun traitement structuré.",score:1},{text:"Traitement au cas par cas.",score:2},{text:"Réponses régulières mais sans procédure formalisée.",score:3},{text:"Procédure définie avec délai, réponse et suivi.",score:4}] },
  { id:"PR-05", kind:"practice", axe:2, dimension:"Identité visuelle", text:"Disposez-vous d’une identité visuelle définie et appliquée de manière cohérente sur vos supports ?", answers:[{text:"Non, aucune identité définie.",score:1},{text:"Quelques éléments communs mais sans cohérence globale.",score:2},{text:"Identité globalement cohérente sur la plupart des supports.",score:3},{text:"Charte définie et appliquée systématiquement.",score:4}] },
  { id:"PR-06", kind:"practice", axe:2, dimension:"Satisfaction client", text:"Mesurez-vous régulièrement la satisfaction et/ou la recommandation de vos clients ?", answers:[{text:"Non, aucune mesure.",score:1},{text:"Retours uniquement informels.",score:2},{text:"Mesures ponctuelles.",score:3},{text:"Mesure régulière avec indicateurs et suivi des actions.",score:4}] },
  { id:"PR-07", kind:"practice", axe:2, dimension:"Communication des engagements", text:"Communiquez-vous régulièrement sur vos engagements, actions ou partenariats locaux ?", answers:[{text:"Non, jamais.",score:1},{text:"Des engagements existent mais sont peu communiqués.",score:2},{text:"Communication occasionnelle.",score:3},{text:"Communication régulière et intégrée aux différents canaux.",score:4}] },
  { id:"PR-08", kind:"practice", axe:2, dimension:"Fidélisation", text:"Disposez-vous d’actions structurées permettant de maintenir la relation avec vos clients et de favoriser leur fidélisation ?", answers:[{text:"Non, aucune action structurée.",score:1},{text:"Quelques actions ponctuelles.",score:2},{text:"Dispositif régulier mais peu personnalisé.",score:3},{text:"Programme structuré, suivi et adapté aux différents clients.",score:4}] },
];

const COMM_QUESTIONS_SALARIE = [
  { id:"EXT-01", kind:"mirror", axe:0, dimension:"Clarté & efficacité", text:"Selon vous, les clients comprennent-ils facilement les offres, services et informations communiqués par votre entreprise ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"EXT-02", kind:"mirror", axe:0, dimension:"Image & cohérence", text:"L'image que votre entreprise donne à l'extérieur vous paraît-elle claire, cohérente et professionnelle ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"EXT-03", kind:"mirror", axe:0, dimension:"Accueil & relation client", text:"Selon vous, les clients perçoivent-ils positivement l'accueil et la qualité de la relation avec votre entreprise ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"EXT-04", kind:"mirror", axe:0, dimension:"Écoute & réactivité", text:"Selon vous, votre entreprise écoute-t-elle ses clients et répond-elle efficacement à leurs demandes ou remarques ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"EXT-05", kind:"mirror", axe:0, dimension:"Ancrage local", text:"L'implication de votre entreprise dans la vie locale vous paraît-elle suffisamment visible auprès des clients ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"EXT-06", kind:"mirror", axe:0, dimension:"Attractivité & fidélisation", text:"Selon vous, l'image et la communication de votre entreprise donnent-elles envie aux clients de venir, de revenir et de la recommander ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-01", kind:"mirror", axe:1, dimension:"Circulation de l'information", text:"Êtes-vous informé(e) clairement et suffisamment tôt des actualités et décisions importantes qui vous concernent ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-02", kind:"mirror", axe:1, dimension:"Expression & écoute", text:"Pouvez-vous facilement exprimer vos idées, difficultés ou suggestions à votre responsable et obtenir un retour ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-03", kind:"mirror", axe:1, dimension:"Communication dans l'équipe", text:"La communication entre collègues vous paraît-elle fluide, respectueuse et bienveillante ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-04", kind:"mirror", axe:1, dimension:"Feedback", text:"Recevez-vous de votre responsable des retours réguliers et constructifs sur votre travail ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-05", kind:"mirror", axe:1, dimension:"Reconnaissance", text:"Vous sentez-vous suffisamment reconnu(e) et valorisé(e) pour votre travail ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-06", kind:"mirror", axe:1, dimension:"Vision & objectifs", text:"Comprenez-vous la vision, les objectifs de l'entreprise et votre rôle dans leur réalisation ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"INT-07", kind:"mirror", axe:1, dimension:"Temps d'échange collectifs", text:"Les réunions ou temps d'échange organisés vous permettent-ils de recevoir les informations nécessaires et de suivre les décisions prises ?", answers:[{text:"Pas du tout",score:1},{text:"Plutôt non",score:2},{text:"Plutôt oui",score:3},{text:"Tout à fait",score:4}] },
  { id:"ENPS-01", kind:"nps", axe:1, dimension:"Recommandation employeur", text:"Sur une échelle de 0 à 10, quelle est la probabilité que vous recommandiez cette entreprise à un proche comme lieu de travail ?" },
  { id:"QUAL-01", kind:"qualitative", axe:1, dimension:"Amélioration prioritaire", text:"Si vous pouviez améliorer une seule chose dans la communication de votre entreprise, laquelle serait-ce ?" }
];

const COMM_BENCHMARK = {
  superette: [
    { enseigne:"Proximarché La Source — Loivre", emoji:"🛒", tags:["ext"], texte:"Cette supérette de proximité s’est fait remarquer par des vidéos humoristiques publiées chaque semaine sur Facebook, transformant la communication locale en rendez-vous régulier avec sa communauté.", score:"À retenir : ton humain, régularité, équipe visible", source:"Champagne FM, 2024", sourceUrl:"https://www.champagnefm.com/loivre-cette-superette-cartonne-sur-les-reseaux-sociaux" },
    { enseigne:"Super U La Châtaigneraie", emoji:"🤝", tags:["int"], texte:"Exemple intéressant côté communication interne : cet établissement figure parmi les entreprises mises en avant par Great Place To Work France. La certification repose sur l’expérience déclarée par les collaborateurs.", score:"À retenir : écouter les équipes et objectiver l’expérience collaborateur", source:"Great Place To Work France", sourceUrl:"https://www.greatplacetowork.fr/" }
  ],
  boulangerie: [
    { enseigne:"Maison Hector — Saint-Malo", emoji:"🥖", tags:["ext"], texte:"France Num cite cette boulangerie-pâtisserie comme exemple inspirant sur les réseaux sociaux : univers rétro cohérent, visuels soignés et mise en avant du personnel et de son savoir-faire.", score:"À retenir : identité visuelle + visages + savoir-faire", source:"France Num, 2026", sourceUrl:"https://www.francenum.gouv.fr/guides-et-conseils/communication-et-publicite/reseaux-sociaux/les-reseaux-sociaux-pour-les" },
    { enseigne:"Lorette", emoji:"🥐", tags:["ext"], texte:"La boulangerie-pâtisserie Lorette a développé sa notoriété avec une présence active sur les réseaux sociaux, un site web et une attention portée aux avis en ligne.", score:"À retenir : présence locale + avis + régularité", source:"France Num", sourceUrl:"https://www.francenum.gouv.fr/guides-et-conseils/developpement-commercial/outils-de-developpement-des-ventes/lorette-ne-pouvait" }
  ],
  fleuriste: [
    { enseigne:"Bergamotte", emoji:"💐", tags:["ext"], texte:"Bergamotte a construit une identité digitale très visuelle autour des fleurs et plantes, avec une expérience client pensée en ligne. Son développement illustre la force d’un univers de marque cohérent dans un métier très visuel.", score:"À retenir : univers visuel, transparence produit, expérience fluide", source:"Bergamotte / Le Parisien", sourceUrl:"https://www.bergamotte.fr/le-journal-vegetal/notre-engagement/la-source-de-nos-engagements/notre-histoire" }
  ],
  cafe: [
    { enseigne:"Brûlerie des Alpes — Grenoble", emoji:"☕", tags:["ext"], texte:"France Num cite cette artisane torréfactrice parmi les professionnels de proximité qui utilisent le numérique pour gérer et développer leur activité. Pour un café ou bistrot, le principe est transposable : raconter les produits, les coulisses et les personnes.", score:"À retenir : expertise, coulisses et ancrage local", source:"France Num, 2026", sourceUrl:"https://www.francenum.gouv.fr/guides-et-conseils/communication-et-publicite/reseaux-sociaux/les-reseaux-sociaux-pour-les" }
  ],
  restaurant: [
    { enseigne:"Au Gré du Vent — Tour-en-Sologne", emoji:"🍽️", tags:["ext"], texte:"Le restaurant a développé les contenus de son site et des publications régulières sur les réseaux sociaux avec son équipe. France Num rapporte une diversification et un accroissement de la clientèle.", score:"À retenir : contenu régulier produit avec l’équipe", source:"France Num, 2023", sourceUrl:"https://www.francenum.gouv.fr/guides-et-conseils/communication-et-publicite/reseaux-sociaux/dans-le-loir-et-cher-un-restaurateur" },
    { enseigne:"Theory — Paris / Levallois", emoji:"🌱", tags:["ext"], texte:"Ce fast-food végétal récompensé aux Foliweb Awards a renforcé sa présence web pour toucher une clientèle sensible à ses valeurs et développer la fidélisation.", score:"À retenir : valeurs claires + visibilité web + fidélisation", source:"France Num, 2023", sourceUrl:"https://www.francenum.gouv.fr/guides-et-conseils/developpement-commercial/outils-de-developpement-des-ventes/en-ile-de-france-un" }
  ],
  pressing: [
    { enseigne:"Pressing 34 / Premium Pressing", emoji:"👔", tags:["ext"], texte:"Cas référencé par un Activateur France Num : création d’une identité visuelle et gestion de Facebook avec production vidéo pour renforcer la notoriété digitale de deux pressings.", score:"À retenir : identité reconnaissable + démonstration vidéo du service", source:"France Num — Hafficom, 2026", sourceUrl:"https://www.francenum.gouv.fr/activateurs/hafficom" }
  ],
  boucherie: [
    { enseigne:"Boucherie Wiotte — Amiens", emoji:"🥩", tags:["ext"], texte:"La stratégie social media met en avant le commerçant, le geste métier, les recettes et la pédagogie. Le cas publié indique une progression d’environ 3 000 à 9 000 abonnés Instagram entre février 2024 et février 2025.", score:"À retenir : incarnation + pédagogie + formats vidéo", source:"Agence Echoo — cas client", sourceUrl:"https://www.agence-echoo.fr/nos-reseaux-sociaux-en-gestion/wiotte" },
    { enseigne:"Le Bœuf Tricolore", emoji:"📣", tags:["ext"], texte:"Une campagne mêlant contenus Facebook, print et TV digitale a été déployée pour plusieurs boucheries, avec publications promotionnelles, jeux-concours et actualités locales.", score:"À retenir : combiner communication locale et digitale", source:"Sud Ouest Publicité, 2024", sourceUrl:"https://www.sudouest-publicite.com/nos-realisations/le-boeuf-tricolore/" }
  ],
  esthetique: [
    { enseigne:"Bleu Libellule", emoji:"💄", tags:["ext","int"], texte:"Acteur de la coiffure et de l’esthétique professionnelle, Bleu Libellule associe une marque forte à une culture interne documentée. Great Place To Work rapporte notamment 84 % de collaborateurs fiers de leurs réalisations et 90 % estimant que les nouveaux collaborateurs sont bien accueillis.", score:"À retenir : cohérence marque client / marque employeur", source:"Great Place To Work / Bleu Libellule", sourceUrl:"https://www.greatplacetowork.fr/entreprises-certifiees/3205112175" }
  ],
  coiffure: [
    { enseigne:"Epi’Tête — Meuse", emoji:"✂️", tags:["ext","int"], texte:"Cette entreprise de quatre salons a développé Facebook, Instagram, son site et la réservation en ligne. France Num souligne que la réflexion numérique est née d’un échange avec les collaborateurs et que la stratégie a soutenu la croissance.", score:"À retenir : équipe impliquée + réservation + réseaux sociaux", source:"France Num, 2024", sourceUrl:"https://www.francenum.gouv.fr/guides-et-conseils/developpement-commercial/outils-de-developpement-des-ventes/une-entreprise-de" },
    { enseigne:"Bleu Libellule", emoji:"🦋", tags:["int"], texte:"Référence utile pour l’expérience collaborateur dans l’univers coiffure-beauté : management responsabilisant, enquête régulière auprès des équipes et certification Great Place To Work depuis plusieurs années.", score:"À retenir : confiance, autonomie et mesure régulière du ressenti", source:"Bleu Libellule — culture managériale", sourceUrl:"https://carriere.bleulibellule.com/notre-culture/culture-manageriale" }
  ],
  caviste: [
    { enseigne:"Repère métiers de bouche", emoji:"🍷", tags:["ext"], texte:"Pour les cavistes, France Num recommande particulièrement les contenus de conseil, les histoires de producteurs, les dégustations et les collaborations locales. Ce sont de bons marqueurs à comparer chez les acteurs de votre zone de chalandise.", score:"À retenir : conseil expert + producteurs + événements", source:"France Num, 2026", sourceUrl:"https://www.francenum.gouv.fr/guides-et-conseils/communication-et-publicite/reseaux-sociaux/les-reseaux-sociaux-pour-les" }
  ],
  epicerie: [
    { enseigne:"Fama — Marseille", emoji:"🧺", tags:["ext"], texte:"Cette épicerie de quartier est notamment référencée par Le Fooding et s’appuie sur une identité très incarnée et un compte Instagram comme vitrine numérique. Un exemple intéressant de personnalité de marque appliquée à l’alimentation générale.", score:"À retenir : sélection identifiable + personnalité + Instagram", source:"Le Fooding, 2026", sourceUrl:"https://lefooding.com/commerces/fama" }
  ]
};

const COMM_BENCHMARK_LABELS = {
  superette:"Supérette / alimentation générale", boulangerie:"Boulangerie / pâtisserie", fleuriste:"Fleuriste", cafe:"Café / bistrot", restaurant:"Restaurant", pressing:"Pressing", boucherie:"Boucherie / charcuterie", esthetique:"Institut de beauté / esthétique", coiffure:"Coiffeur / salon de coiffure", caviste:"Caviste", epicerie:"Épicerie fine / commerce alimentaire"
};

const COMM_PLANS = {
  "6m":{ faible:[{titre:"Créer et optimiser la fiche Google My Business",desc:"Remplir toutes les informations, ajouter des photos, activer les réponses aux avis.",delai:"Mois 1"},{titre:"Ouvrir une page Facebook Entreprise",desc:"Créer la page, définir une ligne éditoriale simple (3 posts/semaine).",delai:"Mois 1-2"},{titre:"Instaurer une réunion d'équipe mensuelle",desc:"Ordre du jour fixe, compte-rendu affiché en salle de pause.",delai:"Mois 2"},{titre:"Mettre en place une boîte à idées",desc:"Afficher les suggestions reçues et les réponses apportées chaque mois.",delai:"Mois 3"},{titre:"Lancer une première action locale",desc:"Partenariat avec un producteur local, mise en avant en rayon et sur les réseaux.",delai:"Mois 4-5"},{titre:"Premier bilan et ajustements",desc:"Mesurer les résultats (avis Google, engagement Facebook, retours équipe).",delai:"Mois 6"}], intermediaire:[{titre:"Structurer la stratégie réseaux sociaux",desc:"Calendrier éditorial mensuel, stories hebdomadaires, mise en avant des équipes.",delai:"Mois 1"},{titre:"Systématiser les réponses aux avis clients",desc:"Procédure de réponse sous 48h, template de réponse, suivi mensuel.",delai:"Mois 1-2"},{titre:"Lancer une enquête de satisfaction employés",desc:"Questionnaire anonyme, restitution des résultats, plan d'action partagé.",delai:"Mois 2-3"},{titre:"Créer un rituel de reconnaissance d'équipe",desc:"Employé du mois, félicitations en réunion, affichage des réussites.",delai:"Mois 3"},{titre:"Développer la communication RSE locale",desc:"Mettre en avant les producteurs locaux, actions solidaires.",delai:"Mois 4-5"},{titre:"Mesurer le NPS client et employé",desc:"Mettre en place un système de mesure régulier.",delai:"Mois 6"}], fort:[{titre:"Optimiser la stratégie digitale",desc:"Publicités Facebook/Instagram ciblées localement, Google Ads.",delai:"Mois 1-2"},{titre:"Déployer un programme de fidélisation avancé",desc:"Segmentation clients, offres personnalisées, newsletter mensuelle.",delai:"Mois 2-3"},{titre:"Former l'équipe à la communication client",desc:"Atelier accueil, gestion des réclamations, ambassadeurs de marque.",delai:"Mois 3-4"},{titre:"Créer un comité de pilotage communication",desc:"Impliquer 2-3 employés volontaires dans la stratégie.",delai:"Mois 4"},{titre:"Candidater à un label employeur",desc:"Great Place to Work, Happy at Work — valoriser votre engagement RH.",delai:"Mois 5-6"},{titre:"Bilan et projection sur 12 mois",desc:"Analyser les KPIs, définir les objectifs de l'année suivante.",delai:"Mois 6"}]},
  "1an":{ faible:[{titre:"Semestre 1 — Fondations digitales",desc:"Google My Business, réseaux sociaux, charte graphique, réponses aux avis.",delai:"M1 à M6"},{titre:"Rituels de communication interne",desc:"Réunions mensuelles, affichage structuré, boîte à idées active.",delai:"M2 à M4"},{titre:"Première campagne locale",desc:"Événement en entreprise, partenariat producteur, couverture réseaux sociaux.",delai:"M4 à M6"},{titre:"Semestre 2 — Structuration et mesure",desc:"Enquête satisfaction clients et employés, NPS, plan d'action correctif.",delai:"M7 à M9"},{titre:"Développer l'ancrage territorial",desc:"Partenariats associations, sponsoring événements locaux, communication RSE.",delai:"M8 à M11"},{titre:"Bilan annuel et plan N+1",desc:"Revue complète des indicateurs, définition des objectifs de l'année suivante.",delai:"M12"}], intermediaire:[{titre:"Stratégie digitale complète",desc:"Calendrier éditorial annuel, publicités ciblées, gestion de la e-réputation.",delai:"M1 à M3"},{titre:"Communication interne structurée",desc:"Réunions hebdomadaires, canal dédié, rituels de reconnaissance.",delai:"M2 à M4"},{titre:"Programme de fidélisation",desc:"Carte de fidélité activée, newsletter, offres personnalisées.",delai:"M3 à M6"},{titre:"Formation équipe communication client",desc:"Accueil, gestion des réclamations, posture ambassadeur.",delai:"M5 à M7"},{titre:"Communication RSE et ancrage local",desc:"Bilan carbone, producteurs locaux, actions solidaires communiquées.",delai:"M7 à M10"},{titre:"Mesure et optimisation continue",desc:"NPS client et employé trimestriel, ajustements stratégiques.",delai:"M10 à M12"}], fort:[{titre:"Leadership communication sectoriel",desc:"Positionner le entreprise comme référence locale en communication.",delai:"M1 à M3"},{titre:"Programme ambassadeurs employés",desc:"Former et impliquer l'équipe dans la communication externe.",delai:"M2 à M5"},{titre:"Stratégie omnicanale avancée",desc:"Intégration réseaux sociaux, Google, newsletter, affichage en entreprise.",delai:"M3 à M6"},{titre:"Candidature label employeur",desc:"Great Place to Work ou Happy at Work — processus de certification.",delai:"M6 à M9"},{titre:"Déploiement programme RSE complet",desc:"Rapport RSE annuel, communication transparente sur les engagements.",delai:"M7 à M10"},{titre:"Benchmark et veille concurrentielle",desc:"Analyse trimestrielle des pratiques des enseignes concurrentes.",delai:"M10 à M12"}]},
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
let accountGuardInterval = null;
let accountGuardPromise = null;
const ACCOUNT_GUARD_MS = 15000;
let clockInterval = null;

let tempsState = { index:0, scores:[0,0,0], engagements:[null,null,null], pending:null, completed:false };
let commState  = { profil:null, index:0, scores:[0,0,0], npsScore:null, satisfactionScore:null, activePlan:"6m", pending:null, responses:[], engagements:[null,null], completed:false };
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

function renderSelectableAnswersList(containerId, answers, onSelect) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = "";
  shuffleArray(answers).forEach(function(answer) {
    const li = document.createElement("li");
    li.className = "app-answer-item";
    li.setAttribute("role", "button");
    li.setAttribute("tabindex", "0");
    Object.keys(answer).forEach(function(k) { if (k !== "text") li.dataset[k] = answer[k]; });
    const badge = document.createElement("span");
    badge.className = "app-answer-badge";
    badge.textContent = "→";
    const txt = document.createElement("span");
    txt.textContent = answer.text;
    li.appendChild(badge); li.appendChild(txt); el.appendChild(li);
  });
  function selectItem(item) {
    el.querySelectorAll(".app-answer-item").forEach(function(x) { x.classList.remove("selected"); });
    item.classList.add("selected");
    onSelect(item);
  }
  el.onclick = function(e) { const item=e.target.closest(".app-answer-item"); if(item) selectItem(item); };
  el.onkeydown = function(e) { if(e.key!=="Enter" && e.key!==" ") return; const item=e.target.closest(".app-answer-item"); if(item){e.preventDefault(); selectItem(item);} };
}

function scrollToQuestionAction(buttonId) {
  window.setTimeout(function() {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    btn.scrollIntoView({behavior:reduceMotion ? "auto" : "smooth", block:"center"});
  }, 70);
}

function scrollToQuestionTop(questionId) {
  window.setTimeout(function() {
    const el = document.getElementById(questionId);
    if (!el) return;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({behavior:reduceMotion ? "auto" : "smooth", block:"start"});
  }, 70);
}

/* ============================================================
   ACTIVATION DE COMPTE — V0.5-C
   ============================================================ */
function initPasswordVisibilityToggles() {
  document.querySelectorAll("[data-password-toggle]").forEach(function(button) {
    button.addEventListener("click", function() {
      const input = document.getElementById(this.dataset.passwordToggle);
      if (!input) return;
      const reveal = input.type === "password";
      input.type = reveal ? "text" : "password";
      this.setAttribute("aria-pressed", reveal ? "true" : "false");
      this.setAttribute("aria-label", reveal ? "Masquer le mot de passe" : "Afficher le mot de passe");
      this.setAttribute("title", reveal ? "Masquer le mot de passe" : "Afficher le mot de passe");
      const icon = this.querySelector("span");
      if (icon) icon.textContent = reveal ? "🙈" : "👁";
      input.focus({ preventScroll: true });
      try { input.setSelectionRange(input.value.length, input.value.length); } catch (_) {}
    });
  });
}

function passwordChecks(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
}

function passwordIsValid(password) {
  const checks = passwordChecks(password);
  return Object.keys(checks).every(function(key) { return checks[key]; });
}

function updatePasswordRules(password) {
  const checks = passwordChecks(password);
  Object.keys(checks).forEach(function(key) {
    const el = document.querySelector('#os-activation [data-rule="' + key + '"]');
    if (el) el.classList.toggle("valid", checks[key]);
  });
}

function showActivationScreen() {
  const login = document.getElementById("os-login");
  const activation = document.getElementById("os-activation");
  const desktop = document.getElementById("os-desktop");
  if (login) login.classList.add("hidden");
  if (desktop) desktop.classList.add("hidden");
  document.querySelectorAll(".os-app-window").forEach(function(w) { w.classList.add("hidden"); });
  const dock = document.getElementById("os-global-dock");
  if (dock) dock.classList.add("hidden");
  if (activation) activation.classList.remove("hidden");
}

function showLoginAfterActivation(message) {
  const activation = document.getElementById("os-activation");
  const login = document.getElementById("os-login");
  if (activation) activation.classList.add("hidden");
  if (login) login.classList.remove("hidden");
  const err = document.getElementById("login-error");
  if (err) {
    err.textContent = message || "Votre compte est activé. Vous pouvez maintenant vous connecter.";
    err.classList.remove("hidden");
    err.classList.add("success");
  }
  history.replaceState({}, document.title, window.location.pathname);
}

async function activateInvitedAccount() {
  const msg = document.getElementById("activation-message");
  const btn = document.getElementById("activation-btn");
  const password = document.getElementById("activation-password").value;
  const confirm = document.getElementById("activation-password-confirm").value;

  msg.classList.add("hidden");
  msg.classList.remove("success");

  if (!passwordIsValid(password)) {
    msg.textContent = "Le mot de passe ne respecte pas encore toutes les règles.";
    msg.classList.remove("hidden");
    return;
  }
  if (password !== confirm) {
    msg.textContent = "Les deux mots de passe ne sont pas identiques.";
    msg.classList.remove("hidden");
    return;
  }
  if (!supabaseClient) {
    msg.textContent = "Connexion Supabase indisponible.";
    msg.classList.remove("hidden");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Activation…";

  try {
    // detectSessionInUrl peut avoir besoin d’un bref instant pour convertir le lien d’invitation en session.
    let sessionResult = await supabaseClient.auth.getSession();
    let session = sessionResult && sessionResult.data ? sessionResult.data.session : null;
    if (!session) {
      await new Promise(function(resolve) { setTimeout(resolve, 500); });
      sessionResult = await supabaseClient.auth.getSession();
      session = sessionResult && sessionResult.data ? sessionResult.data.session : null;
    }
    if (!session) throw new Error("INVITE_SESSION_MISSING");

    const result = await supabaseClient.auth.updateUser({ password: password });
    if (result.error) throw result.error;

    await supabaseClient.auth.signOut();
    document.getElementById("activation-password").value = "";
    document.getElementById("activation-password-confirm").value = "";
    showLoginAfterActivation("Compte activé avec succès. Connectez-vous avec votre nouveau mot de passe.");
  } catch (e) {
    console.error("Activation Pekahellix", e);
    if (e && e.message === "INVITE_SESSION_MISSING") {
      msg.textContent = "Le lien d’invitation est invalide ou a expiré. Demandez une nouvelle invitation à votre administrateur.";
    } else {
      msg.textContent = "Impossible d’activer le compte. Le lien a peut-être expiré ; demandez une nouvelle invitation.";
    }
    msg.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "Activer mon compte →";
  }
}

/* ============================================================
   MOT DE PASSE OUBLIÉ / RÉCUPÉRATION — V0.5-D
   ============================================================ */
function getPekahellixRedirectUrl() {
  return new URL("./", window.location.href).href.split("#")[0].split("?")[0];
}

function hideAuthScreens() {
  ["os-login", "os-activation", "os-forgot-password", "os-password-recovery"].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
}

function showForgotPasswordScreen() {
  hideAuthScreens();
  const desktop = document.getElementById("os-desktop");
  const dock = document.getElementById("os-global-dock");
  if (desktop) desktop.classList.add("hidden");
  if (dock) dock.classList.add("hidden");
  const email = document.getElementById("input-username");
  const forgotEmail = document.getElementById("forgot-email");
  if (forgotEmail && email && email.value.trim()) forgotEmail.value = email.value.trim();
  const msg = document.getElementById("forgot-message");
  if (msg) { msg.classList.add("hidden"); msg.classList.remove("success"); }
  const panel = document.getElementById("os-forgot-password");
  if (panel) panel.classList.remove("hidden");
  if (forgotEmail) forgotEmail.focus();
}

function showLoginFromForgot() {
  hideAuthScreens();
  const login = document.getElementById("os-login");
  if (login) login.classList.remove("hidden");
  const email = document.getElementById("forgot-email");
  const loginEmail = document.getElementById("input-username");
  if (email && loginEmail && email.value.trim()) loginEmail.value = email.value.trim();
}

async function requestPasswordReset() {
  const emailEl = document.getElementById("forgot-email");
  const msg = document.getElementById("forgot-message");
  const btn = document.getElementById("forgot-submit");
  const email = emailEl ? emailEl.value.trim().toLowerCase() : "";

  msg.classList.add("hidden");
  msg.classList.remove("success");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg.textContent = "Veuillez saisir une adresse e-mail valide.";
    msg.classList.remove("hidden");
    return;
  }
  if (!supabaseClient) {
    msg.textContent = "Connexion Supabase indisponible.";
    msg.classList.remove("hidden");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Envoi…";
  try {
    const result = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: getPekahellixRedirectUrl()
    });
    if (result.error) throw result.error;

    // Message volontairement neutre pour éviter de révéler l'existence d'un compte.
    msg.textContent = "Si cette adresse est associée à un compte Pekahellix, un e-mail de réinitialisation vient d’être envoyé.";
    msg.classList.add("success");
    msg.classList.remove("hidden");
  } catch (e) {
    console.error("Réinitialisation Pekahellix", e);
    // Même message côté utilisateur : pas d'énumération des comptes.
    msg.textContent = "Si cette adresse est associée à un compte Pekahellix, un e-mail de réinitialisation va vous être envoyé. Réessayez dans quelques instants si nécessaire.";
    msg.classList.add("success");
    msg.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "Envoyer le lien →";
  }
}

function updateRecoveryPasswordRules(password) {
  const checks = passwordChecks(password);
  Object.keys(checks).forEach(function(key) {
    const el = document.querySelector('#os-password-recovery [data-recovery-rule="' + key + '"]');
    if (el) el.classList.toggle("valid", checks[key]);
  });
}

function showPasswordRecoveryScreen() {
  hideAuthScreens();
  const desktop = document.getElementById("os-desktop");
  const dock = document.getElementById("os-global-dock");
  if (desktop) desktop.classList.add("hidden");
  if (dock) dock.classList.add("hidden");
  document.querySelectorAll(".os-app-window").forEach(function(w) { w.classList.add("hidden"); });
  const msg = document.getElementById("recovery-message");
  if (msg) { msg.classList.add("hidden"); msg.classList.remove("success"); }
  const panel = document.getElementById("os-password-recovery");
  if (panel) panel.classList.remove("hidden");
}

async function saveRecoveredPassword() {
  const msg = document.getElementById("recovery-message");
  const btn = document.getElementById("recovery-submit");
  const password = document.getElementById("recovery-password").value;
  const confirm = document.getElementById("recovery-password-confirm").value;

  msg.classList.add("hidden");
  msg.classList.remove("success");

  if (!passwordIsValid(password)) {
    msg.textContent = "Le mot de passe ne respecte pas encore toutes les règles.";
    msg.classList.remove("hidden");
    return;
  }
  if (password !== confirm) {
    msg.textContent = "Les deux mots de passe ne sont pas identiques.";
    msg.classList.remove("hidden");
    return;
  }
  if (!supabaseClient) {
    msg.textContent = "Connexion Supabase indisponible.";
    msg.classList.remove("hidden");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Enregistrement…";
  try {
    let sessionResult = await supabaseClient.auth.getSession();
    let session = sessionResult && sessionResult.data ? sessionResult.data.session : null;
    if (!session) {
      await new Promise(function(resolve) { setTimeout(resolve, 500); });
      sessionResult = await supabaseClient.auth.getSession();
      session = sessionResult && sessionResult.data ? sessionResult.data.session : null;
    }
    if (!session) throw new Error("RECOVERY_SESSION_MISSING");

    const result = await supabaseClient.auth.updateUser({ password: password });
    if (result.error) throw result.error;

    await supabaseClient.auth.signOut();
    document.getElementById("recovery-password").value = "";
    document.getElementById("recovery-password-confirm").value = "";
    updateRecoveryPasswordRules("");
    hideAuthScreens();
    const login = document.getElementById("os-login");
    if (login) login.classList.remove("hidden");
    const loginMsg = document.getElementById("login-error");
    if (loginMsg) {
      loginMsg.textContent = "Mot de passe modifié avec succès. Vous pouvez maintenant vous reconnecter.";
      loginMsg.classList.add("success");
      loginMsg.classList.remove("hidden");
    }
    history.replaceState({}, document.title, window.location.pathname);
  } catch (e) {
    console.error("Nouveau mot de passe Pekahellix", e);
    const errMsg = String((e && e.message) || "").toLowerCase();
    const samePassword =
      errMsg.includes("different from the old") ||
      errMsg.includes("different from old") ||
      errMsg.includes("same password") ||
      errMsg.includes("password should be different") ||
      errMsg.includes("new password should be different");

    if (e && e.message === "RECOVERY_SESSION_MISSING") {
      msg.textContent = "Le lien de réinitialisation est invalide ou a expiré. Demandez un nouveau lien depuis l’écran de connexion.";
    } else if (samePassword) {
      msg.textContent = "Le nouveau mot de passe doit être différent de votre mot de passe actuel.";
    } else {
      msg.textContent = "Impossible d’enregistrer le nouveau mot de passe. Vérifiez le mot de passe choisi ou demandez un nouveau lien si celui-ci a expiré.";
    }
    msg.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.textContent = "Enregistrer le nouveau mot de passe →";
  }
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
    .select("id, first_name, last_name, email, role, is_active, access_temps, access_communication, access_cyber, organization_id, access_communication_report, communication_profile")
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
    organizationId: p.organization_id || null,
    communicationReport: !!p.access_communication_report,
    communicationProfile: p.communication_profile || null,
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
  if (!clockEl) return;

  function tick() {
    const now = new Date();
    const days = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
    const months = ["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"];
    clockEl.textContent = days[now.getDay()] + " " + now.getDate() + " " + months[now.getMonth()];
  }

  tick();
  // Une actualisation par minute suffit pour détecter un changement de date.
  clockInterval = setInterval(tick, 60000);
}

function setActiveDockApp(appId) {
  document.querySelectorAll(".os-dock-item").forEach(function(item) {
    const active = item.dataset.app === appId;
    item.classList.toggle("is-active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
}

async function validateCurrentAccount() {
  if (!osUser || !supabaseClient) return false;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;

  const checkedUserId = osUser.id;

  try {
    // Étape 1 : contrôle minimal et prioritaire du statut du compte.
    // Cette requête volontairement courte évite qu'un autre champ du profil
    // ou un rafraîchissement de droits masque une désactivation.
    const statusResult = await supabaseClient
      .from("profiles")
      .select("is_active")
      .eq("id", checkedUserId)
      .maybeSingle();

    if (statusResult.error) {
      console.warn("Contrôle du statut Pekahellix", statusResult.error);

      const status = Number(statusResult.status || 0);
      const code = String(statusResult.error.code || "").toLowerCase();
      const message = String(statusResult.error.message || "").toLowerCase();
      const looksAuthInvalid =
        status === 401 || status === 403 ||
        code === "user_banned" || code === "user_not_found" ||
        code === "session_not_found" || code === "refresh_token_not_found" ||
        message.includes("jwt") || message.includes("token") || message.includes("banned");

      if (looksAuthInvalid) {
        forceLocalLogout("Votre compte a été désactivé ou votre session n’est plus autorisée. Contactez votre administrateur Pekahellix.");
        // Nettoyage Supabase en second plan : l'interface est déjà fermée localement.
        logoutSupabaseLocal();
        return false;
      }

      // En cas de panne réseau réellement transitoire, on conserve la session locale.
      return true;
    }

    const statusProfile = statusResult.data;
    if (!statusProfile || statusProfile.is_active !== true) {
      console.warn("Compte Pekahellix désactivé détecté", {
        id: checkedUserId,
        is_active: statusProfile && statusProfile.is_active
      });
      forceLocalLogout("Votre compte a été désactivé ou supprimé. Contactez votre administrateur Pekahellix.");
      logoutSupabaseLocal();
      return false;
    }

    // Une autre action a pu déconnecter l'utilisateur pendant la requête.
    if (!osUser || osUser.id !== checkedUserId) return false;

    // Étape 2 : le compte est actif. On actualise ensuite les droits et le profil.
    const profileResult = await supabaseClient
      .from("profiles")
      .select("id, first_name, last_name, email, role, is_active, access_temps, access_communication, access_cyber, organization_id, access_communication_report, communication_profile")
      .eq("id", checkedUserId)
      .maybeSingle();

    if (profileResult.error) {
      console.warn("Actualisation du profil Pekahellix", profileResult.error);
      return true;
    }

    const p = profileResult.data;
    if (!p || p.is_active !== true) {
      forceLocalLogout("Votre compte a été désactivé ou supprimé. Contactez votre administrateur Pekahellix.");
      logoutSupabaseLocal();
      return false;
    }

    if (!osUser || osUser.id !== checkedUserId) return false;

    const fullName = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
    osUser = {
      id: p.id,
      email: p.email,
      firstName: p.first_name,
      lastName: p.last_name,
      displayName: fullName || p.email,
      role: p.role,
      isActive: p.is_active,
      organizationId: p.organization_id || null,
      communicationReport: !!p.access_communication_report,
    communicationProfile: p.communication_profile || null,
      access: {
        temps: !!p.access_temps,
        comm: !!p.access_communication,
        cyber: !!p.access_cyber
      }
    };
    applyAccessRights();

    document.querySelectorAll(".os-app-window:not(.hidden)").forEach(function(win) {
      const appId = win.id.replace(/^app-/, "");
      if (!userCanAccess(appId)) {
        win.classList.add("hidden");
        setActiveDockApp(null);
      }
    });
    return true;
  } catch (e) {
    console.warn("Contrôle du compte Pekahellix interrompu", e);
    return true;
  }
}

function startAccountGuard() {
  stopAccountGuard();
  validateCurrentAccount();
  accountGuardInterval = setInterval(function() {
    if (osUser && document.visibilityState !== "hidden") validateCurrentAccount();
  }, ACCOUNT_GUARD_MS);
}

function stopAccountGuard() {
  if (accountGuardInterval) {
    clearInterval(accountGuardInterval);
    accountGuardInterval = null;
  }
}

async function openApp(appId) {
  const stillAllowed = await validateCurrentAccount();
  if (!stillAllowed || !userCanAccess(appId)) return;
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
  // Une fois un questionnaire terminé, sa prochaine ouverture repart automatiquement de zéro.
  if (appId === "temps" && tempsState.completed) tempsInit();
  if (appId === "comm" && commState.completed) commInit();
  if (appId === "cyber" && cyberState.index >= CYBER_TOTAL) { cyberState = {questions:[],index:0,score:0,answered:false,responses:[],pending:null}; showAppScreen("cyber","cyber-screen-intro"); }
}

function forceLocalLogout(message) {
  stopAccountGuard();
  osUser = null;
  if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }

  const desktop = document.getElementById("os-desktop");
  if (desktop) desktop.classList.add("hidden");
  document.querySelectorAll(".os-app-window").forEach(function(w) { w.classList.add("hidden"); });

  const dock = document.getElementById("os-global-dock");
  if (dock) dock.classList.add("hidden");

  const login = document.getElementById("os-login");
  if (login) login.classList.remove("hidden");

  const username = document.getElementById("input-username");
  const password = document.getElementById("input-password");
  if (username) username.value = "";
  if (password) password.value = "";

  const loginMsg = document.getElementById("login-error");
  if (loginMsg && message) {
    loginMsg.textContent = message;
    loginMsg.classList.remove("success", "hidden");
  }

  // Une déconnexion explicite constitue une frontière de confidentialité :
  // aucun état temporaire d'un utilisateur ne doit survivre à la session.
  tempsState = { index:0, scores:[0,0,0], engagements:[null,null,null], pending:null, completed:false };
  commState  = { profil:null, index:0, scores:[0,0,0], npsScore:null, satisfactionScore:null, activePlan:"6m", pending:null, responses:[], engagements:[null,null], completed:false };
  cyberState = { questions:[], index:0, score:0, answered:false, responses:[], pending:null };

  // Réinitialise également les écrans affichés. Réinitialiser uniquement les
  // objets JS ne suffit pas : le DOM pouvait rester sur la dernière question
  // rendue et la montrer au compte suivant lors de la réouverture du module.
  const tempsChips = document.getElementById("temps-chips");
  if (tempsChips) tempsChips.innerHTML = "";
  const tempsNext = document.getElementById("temps-btn-next");
  if (tempsNext) { tempsNext.classList.add("hidden"); tempsNext.disabled = true; }
  showAppScreen("temps", "temps-screen-intro");

  const commChips = document.getElementById("comm-chips");
  if (commChips) commChips.innerHTML = "";
  const commNext = document.getElementById("comm-btn-next");
  if (commNext) { commNext.classList.add("hidden"); commNext.disabled = true; }
  const commReportBtn = document.getElementById("comm-btn-report-gerant");
  if (commReportBtn) commReportBtn.classList.add("hidden");
  showAppScreen("comm", "comm-screen-profil");

  showAppScreen("cyber", "cyber-screen-intro");
}

async function logoutSupabaseLocal() {
  if (!supabaseClient) return;
  try {
    const result = await supabaseClient.auth.signOut({ scope: "local" });
    if (result && result.error) console.warn("Déconnexion Supabase locale incomplète", result.error);
  } catch (e) {
    console.warn("Déconnexion Supabase locale incomplète", e);
  }
}

async function logout(message) {
  // Ferme toujours Pekahellix immédiatement, même si Supabase ne peut plus
  // rafraîchir/révoquer une session déjà bannie.
  forceLocalLogout(message);
  await logoutSupabaseLocal();
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


let adminOrganizations=[];
async function adminLoadOrganizations(){
  if(!userCanAccess("admin")||!supabaseClient)return;
  const r=await supabaseClient.rpc("admin_list_organizations");
  if(r.error){console.error("admin_list_organizations",r.error);return;}
  adminOrganizations=r.data||[];
  const sel=document.getElementById("admin-new-organization");
  if(sel) sel.innerHTML='<option value="">— Aucune entreprise —</option>'+adminOrganizations.map(o=>'<option value="'+adminEscape(o.id)+'">'+adminEscape(o.name)+'</option>').join('');
}
function adminOrganizationOptions(selected){return '<option value="">Aucune entreprise</option>'+adminOrganizations.map(o=>'<option value="'+adminEscape(o.id)+'"'+(o.id===selected?' selected':'')+'>'+adminEscape(o.name)+'</option>').join('');}
async function adminCreateOrganization(){
  const input=document.getElementById("admin-new-org-name"); const name=input.value.trim(); if(!name){adminSetMessage("Saisissez le nom de l’entreprise.",true);return;}
  const r=await supabaseClient.rpc("admin_create_organization",{p_name:name}); if(r.error){adminSetMessage("Création de l’entreprise impossible : "+r.error.message,true);return;}
  input.value=""; adminSetMessage("Entreprise créée."); await adminLoadOrganizations(); await adminLoadUsers();
}

async function adminLoadUsers() {
  if (!userCanAccess("admin") || !supabaseClient) return;
  const loading = document.getElementById("admin-users-loading");
  const list = document.getElementById("admin-users-list");
  if (!list) return;
  loading && loading.classList.remove("hidden");
  adminSetMessage("");
  if(!adminOrganizations.length) await adminLoadOrganizations();

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
  const disabledSelfStatus = (isSelf || lockedRole) ? " disabled" : "";
  const deleteDisabled = (isSelf || lockedRole) ? " disabled" : "";
  const checked = v => v ? " checked" : "";

  return '<article class="admin-user-row" data-user-id="' + adminEscape(u.id) + '" data-was-active="' + (u.is_active ? '1' : '0') + '">' +
    '<div class="admin-user-identity"><strong>' + adminEscape((u.first_name || "") + " " + (u.last_name || "")) + '</strong>' +
      '<span>' + adminEscape(u.email) + '</span><div class="admin-badges">' + roleBadge + inactive + '</div></div>' +
    '<div class="admin-rights">' +
      '<label><input class="admin-right admin-right-temps" type="checkbox"' + checked(u.access_temps) + disabledRights + '> Temps</label>' +
      '<label><input class="admin-right admin-right-comm" type="checkbox"' + checked(u.access_communication) + disabledRights + '> Communication</label>' +
      '<label><input class="admin-right admin-right-cyber" type="checkbox"' + checked(u.access_cyber) + disabledRights + '> Cyber</label>' +
      '<label>Profil Communication<select class="admin-comm-profile"' + disabledRights + '><option value="employee"' + (u.communication_profile==="employee"?" selected":"") + '>Employé</option><option value="manager"' + (u.communication_profile==="manager"?" selected":"") + '>Gérant</option></select></label>' +
      '<label class="admin-org-label">Entreprise<select class="admin-organization"' + disabledRights + '>' + adminOrganizationOptions(u.organization_id) + '</select></label>' +
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
  const isActive = !!row.querySelector(".admin-active").checked;
  const wasActive = row.dataset.wasActive === "1";

  if (wasActive && !isActive) {
    const emailEl = row.querySelector(".admin-user-identity span");
    const email = emailEl ? emailEl.textContent : "cet utilisateur";
    if (!window.confirm("Désactiver le compte " + email + " ? L’utilisateur ne pourra plus se connecter et ses prochaines vérifications de session bloqueront l’accès.")) {
      row.querySelector(".admin-active").checked = true;
      return;
    }
  }

  const params = {
    p_target_id: targetId,
    p_is_active: isActive,
    p_access_temps: !!row.querySelector(".admin-right-temps").checked,
    p_access_communication: !!row.querySelector(".admin-right-comm").checked,
    p_access_cyber: !!row.querySelector(".admin-right-cyber").checked,
    p_organization_id: row.querySelector(".admin-organization").value || null,
    p_communication_profile: row.querySelector(".admin-comm-profile").value
  };

  try {
    // Synchronise le statut avec Supabase Auth : ban à la désactivation, unban à la réactivation.
    await callAdminUsers({ action:"set-active", userId:targetId, isActive:isActive });
    const result = await supabaseClient.rpc("admin_update_user_access", params);
    if (result.error) throw result.error;
    adminSetMessage(isActive ? "Droits utilisateur enregistrés et compte actif." : "Compte désactivé et accès révoqué.");
    await adminLoadUsers();
  } catch (e) {
    console.error("admin_update_user_access", e);
    adminSetMessage("Modification impossible : " + (e.message || "Erreur inconnue"), true);
    await adminLoadUsers();
  }
}

async function callAdminUsers(payload) {
  const cfg = window.PEKAHELLIX_CONFIG || {};
  const sessionResult = await supabaseClient.auth.getSession();
  const session = sessionResult && sessionResult.data ? sessionResult.data.session : null;
  if (!session || !session.access_token) {
    throw new Error("Session expirée. Déconnectez-vous puis reconnectez-vous.");
  }

  const endpoint = String(cfg.supabaseUrl || "").replace(/\/$/, "") + "/functions/v1/admin-users";
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + session.access_token,
        "apikey": cfg.supabasePublishableKey
      },
      body: JSON.stringify(payload)
    });
  } catch (networkError) {
    console.error("admin-users network error", networkError);
    throw new Error("Impossible de joindre admin-users (réseau/CORS). Vérifiez les Invocations Supabase.");
  }

  let data = null;
  const raw = await response.text();
  try { data = raw ? JSON.parse(raw) : null; } catch (_) { data = { error: raw || "Réponse serveur illisible" }; }

  if (!response.ok) {
    throw new Error((data && data.error) ? data.error : ("Erreur HTTP " + response.status));
  }
  if (data && data.error) throw new Error(data.error);
  return data;
}

async function adminCreateUser() {
  if (!userCanAccess("admin")) return;
  const firstName = document.getElementById("admin-new-firstname").value.trim();
  const lastName = document.getElementById("admin-new-lastname").value.trim();
  const email = document.getElementById("admin-new-email").value.trim().toLowerCase();
  const access = {
    temps: document.getElementById("admin-new-temps").checked,
    communication: document.getElementById("admin-new-comm").checked,
    cyber: document.getElementById("admin-new-cyber").checked,
    communicationProfile: document.getElementById("admin-new-comm-profile").value
  };
  const organizationId = document.getElementById("admin-new-organization").value || null;
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
    await callAdminUsers({ action:"invite", firstName:firstName, lastName:lastName, email:email, access:access, organizationId:organizationId, communicationProfile:access.communicationProfile });
    ["admin-new-firstname","admin-new-lastname","admin-new-email"].forEach(id => document.getElementById(id).value = "");
    ["admin-new-temps","admin-new-comm","admin-new-cyber"].forEach(id => document.getElementById(id).checked = false); document.getElementById("admin-new-comm-profile").value="employee";
    adminSetMessage("Invitation envoyée à " + email + ".");
    await adminLoadUsers();
  } catch (e) {
    console.error("admin-users invite", e);
    adminSetMessage("Création impossible : " + (e.message || "Erreur inconnue"), true);
  } finally {
    btn.disabled = false; btn.textContent = "Créer et inviter";
  }
}

async function adminDeleteUser(row) {
  if (!row || !userCanAccess("admin")) return;
  const id = row.dataset.userId;
  const emailEl = row.querySelector(".admin-user-identity span");
  const email = emailEl ? emailEl.textContent : "cet utilisateur";
  if (!window.confirm("Supprimer définitivement le compte " + email + " ? Cette action est irréversible.")) return;
  const typed = window.prompt('Pour confirmer la suppression définitive, saisissez SUPPRIMER');
  if (typed !== "SUPPRIMER") {
    adminSetMessage("Suppression annulée.");
    return;
  }
  adminSetMessage("");
  try {
    await callAdminUsers({ action:"delete", userId:id });
    adminSetMessage("Compte supprimé définitivement.");
    await adminLoadUsers();
  } catch (e) {
    console.error("admin-users delete", e);
    adminSetMessage("Suppression impossible. " + (e.message || ""), true);
  }
}


/* ============================================================
   COMMUNICATION — RESTITUTION AGRÉGÉE EMPLOYÉS V0.5-G.3.2
   ============================================================ */
function commPct(v){ return v == null ? "—" : (Math.round(Number(v)*10)/10).toLocaleString("fr-FR") + " %"; }
async function commLoadEmployeeReport(periodDays){
  const box=document.getElementById("comm-report-content"); if(!box)return;
  box.innerHTML='<p class="app-card-subtitle">Chargement des résultats…</p>';
  const r=await supabaseClient.rpc("communication_employee_report",{p_days:Number(periodDays||90)});
  if(r.error){ console.error("communication_employee_report",r.error); box.innerHTML='<div class="app-message-box"><span>⚠️</span><div><p class="app-message-title">Résultats indisponibles</p><p class="app-message-text">Vérifiez votre rattachement à l’entreprise et votre droit de consultation.</p></div></div>'; return; }
  const d=(r.data&&r.data[0])||{}; const n=Number(d.response_count||0);
  if(n<5){ box.innerHTML='<div class="app-card" style="text-align:center"><div class="app-card-icon">🔒</div><h3>'+n+' réponse'+(n>1?'s':'')+' reçue'+(n>1?'s':'')+'</h3><p class="app-card-subtitle">Les résultats seront affichés à partir de 5 réponses afin de préserver l’anonymat des participants.</p></div>'; return; }
  const dist=[['Détracteurs 0–6',d.enps_detractors],['Passifs 7–8',d.enps_passives],['Promoteurs 9–10',d.enps_promoters]];
  const bars=dist.map(x=>{const pct=Math.round(Number(x[1]||0)*100/n);return '<div class="comm-report-bar"><span>'+x[0]+'</span><div><i style="width:'+pct+'%"></i></div><strong>'+pct+' %</strong></div>'}).join('');
  let q=''; try{const qa=typeof d.question_summary==='string'?JSON.parse(d.question_summary):d.question_summary; if(Array.isArray(qa)&&qa.length){q='<h3 class="app-section-title">Tendances par question</h3><div class="comm-report-questions">'+qa.map(x=>'<div><strong>'+adminEscape(x.question)+'</strong><span>'+commPct(x.avg_pct)+'</span></div>').join('')+'</div>';}}catch(_){ }
  box.innerHTML='<div class="comm-report-kpis"><div><strong>'+n+'</strong><span>réponses</span></div><div><strong>'+Number(d.enps_score).toLocaleString("fr-FR",{maximumFractionDigits:0})+'</strong><span>eNPS</span></div><div><strong>'+commPct(d.avg_external_pct)+'</strong><span>communication externe</span></div><div><strong>'+commPct(d.avg_internal_pct)+'</strong><span>communication interne</span></div></div><div class="app-card"><h3 class="app-section-title">Répartition eNPS employeur</h3>'+bars+'</div>'+q;
}
function commOpenEmployeeReport(){
  if(!osUser || !osUser.communicationReport || (osUser.role==="user" && osUser.communicationProfile!=="manager")){return;}
  showAppScreen("comm","comm-screen-employee-report");
  const sel=document.getElementById("comm-report-period"); commLoadEmployeeReport(sel?sel.value:90);
}

/* ============================================================
   APP TEMPS
   ============================================================ */
function tempsInit() {
  tempsState = { index:0, scores:[0,0,0], engagements:[null,null,null], pending:null, completed:false };
  document.getElementById("temps-chips").innerHTML = "";
  const next=document.getElementById("temps-btn-next"); if(next){next.classList.add("hidden"); next.disabled=true;}
  showAppScreen("temps","temps-screen-intro");
}

function tempsRenderQuestion() {
  const q=TEMPS_QUESTIONS[tempsState.index], axe=q.axe;
  tempsState.pending=null;
  document.getElementById("temps-axe-label").textContent=TEMPS_AXE_EMOJIS[axe]+" "+TEMPS_AXE_NAMES[axe];
  document.getElementById("temps-counter").textContent="Question "+(tempsState.index+1)+" / "+TEMPS_QUESTIONS.length;
  document.getElementById("temps-progress").style.width=Math.round((tempsState.index/TEMPS_QUESTIONS.length)*100)+"%";
  document.getElementById("temps-question").textContent=sanitize(q.text);
  const next=document.getElementById("temps-btn-next"); next.classList.add("hidden"); next.disabled=true;
  next.textContent=(tempsState.index+1>=TEMPS_QUESTIONS.length)?"Voir mon diagnostic →":"Question suivante →";
  renderChips("temps-chips",TEMPS_AXE_NAMES,TEMPS_AXE_EMOJIS,axe);
  renderSelectableAnswersList("temps-answers",q.answers,function(item){
    tempsState.pending={axe:axe,score:parseInt(item.dataset.score,10),answer:item.textContent.replace(/^→/,"").trim()};
    next.disabled=false; next.classList.remove("hidden"); scrollToQuestionAction("temps-btn-next");
  });
}

function tempsCommitAndNext(){
  if(!tempsState.pending) return;
  tempsState.scores[tempsState.pending.axe]+=tempsState.pending.score;
  tempsState.pending=null; tempsState.index++;
  if(tempsState.index>=TEMPS_QUESTIONS.length){document.getElementById("temps-progress").style.width="100%"; tempsShowDiagnostic();}
  else {tempsRenderQuestion(); scrollToQuestionTop("temps-question");}
}

function tempsDiagnosticData(){
  return TEMPS_SOLUTIONS.map(function(sol){
    const pct=Math.round((tempsState.scores[sol.axe]/TEMPS_MAX_SCORES[sol.axe])*100), niveau=getNiveauTemps(pct);
    return {sol:sol,pct:pct,niveau:niveau,data:sol.niveaux[niveau]};
  });
}

function tempsShowDiagnostic(){
  const data=tempsDiagnosticData();
  renderAxeScores("temps-diagnostic-scores",data.map(function(x){return {nom:x.sol.nom,emoji:x.sol.emoji,pct:x.pct,niveau:x.niveau,label:getNiveauLabelTemps(x.niveau)};}));
  const c=document.getElementById("temps-diagnostic-phrases"); c.innerHTML="";
  data.forEach(function(x){const s=document.createElement("div"); s.className="app-solution-section"; s.innerHTML='<div class="app-solution-header app-sol-header-'+x.sol.axe+'"><span>'+x.sol.emoji+'</span><span>'+sanitize(x.sol.nom)+'</span></div><div class="app-solution-body"><span class="app-solution-badge" style="'+getBadgeStyleTemps(x.niveau)+'">'+getNiveauLabelTemps(x.niveau)+'</span><p class="app-solution-intro">'+sanitize(x.data.intro)+'</p></div>'; c.appendChild(s);});
  tempsState.completed=true; showAppScreen("temps","temps-screen-diagnostic");
}

function tempsShowEngagement() {
  const container=document.getElementById("temps-engagement-blocks"); container.innerHTML="";
  const headerClasses=["app-eng-header-0","app-eng-header-1","app-eng-header-2"];
  TEMPS_ENGAGEMENT_QUESTIONS.forEach(function(eq){
    const pct=Math.round((tempsState.scores[eq.axe]/TEMPS_MAX_SCORES[eq.axe])*100), niveau=getNiveauTemps(pct), block=document.createElement("div");
    block.className="app-engagement-block";
    block.innerHTML='<div class="app-engagement-header '+headerClasses[eq.axe]+'"><span>'+TEMPS_AXE_EMOJIS[eq.axe]+'</span><span>'+sanitize(TEMPS_AXE_NAMES[eq.axe])+'</span><span class="app-engagement-score">'+getNiveauLabelTemps(niveau)+' — '+pct+'%</span></div><div class="app-engagement-body"><p class="app-engagement-q">'+sanitize(eq.text)+'</p><ul class="app-engagement-options" data-axe="'+eq.axe+'">'+eq.options.map(function(opt){return '<li class="app-engagement-option" role="button" tabindex="0" data-axe="'+eq.axe+'" data-type="'+sanitize(opt.type)+'"><span class="app-eng-opt-icon">'+opt.icon+'</span><div><div class="app-eng-opt-title">'+sanitize(opt.title)+'</div><div class="app-eng-opt-desc">'+sanitize(opt.desc)+'</div></div></li>';}).join("")+'</ul></div>';
    container.appendChild(block);
  });
  showAppScreen("temps","temps-screen-engagement");
}

function tempsShowResult() {
  const c=document.getElementById("temps-accompagnement-axes"); c.innerHTML="";
  const selected=tempsDiagnosticData().filter(function(x){return tempsState.engagements[x.sol.axe]==="accompagne";});
  if(!selected.length){c.innerHTML='<div class="app-message-box"><span>ℹ️</span><div><p class="app-message-title">Aucun accompagnement sélectionné</p><p class="app-message-text">Vous pouvez tout de même consulter vos pistes en autonomie ou recommencer votre diagnostic.</p></div></div>';}
  selected.forEach(function(x){const d=document.createElement("div"); d.className="app-solution-section"; d.innerHTML='<div class="app-solution-header app-sol-header-'+x.sol.axe+'"><span>'+x.sol.emoji+'</span><span>'+sanitize(x.sol.nom)+'</span></div><div class="app-solution-body"><p class="app-solution-intro">'+sanitize(x.data.intro)+'</p></div>'; c.appendChild(d);});
  const nbAcc=selected.length, recMap={0:"Découverte",1:"Accompagnement",2:"Accompagnement",3:"Transformation"}; renderForfaits("temps-forfaits",TEMPS_FORFAITS,recMap[nbAcc]||"Accompagnement");
  const auto=tempsState.engagements.some(function(e){return e==="autonome";}); document.getElementById("temps-btn-autonomy").classList.toggle("hidden",!auto);
  tempsState.completed=true; showAppScreen("temps","temps-screen-result");
}

function tempsShowAutonomy(){
  const c=document.getElementById("temps-autonomy-content"); c.innerHTML="";
  tempsDiagnosticData().filter(function(x){return tempsState.engagements[x.sol.axe]==="autonome";}).forEach(function(x){const d=document.createElement("section"); d.className="app-solution-section"; d.innerHTML='<div class="app-solution-header app-sol-header-'+x.sol.axe+'"><span>'+x.sol.emoji+'</span><span>'+sanitize(x.sol.nom)+'</span></div><div class="app-solution-body"><p class="app-solution-intro">'+sanitize(x.data.intro)+'</p><div class="app-outils-grid static-tools">'+x.data.outils.map(function(o){return '<div class="app-outil-card static-card"><div class="app-outil-title">🔧 '+sanitize(o.titre)+'</div><div class="app-outil-desc">'+sanitize(o.desc)+'</div></div>';}).join("")+'</div></div>'; c.appendChild(d);});
  showAppScreen("temps","temps-screen-autonomy");
}

/* ============================================================
   APP COMM
   ============================================================ */
function commInit() {
  const gerantBtn=document.getElementById("comm-btn-gerant"), salarieBtn=document.getElementById("comm-btn-salarie");
  const ordinary=osUser&&osUser.role==="user", profile=osUser&&osUser.communicationProfile;
  if(gerantBtn) gerantBtn.classList.toggle("hidden", ordinary && profile!=="manager");
  if(salarieBtn) salarieBtn.classList.toggle("hidden", ordinary && profile!=="employee");
  const subtitle=document.getElementById("comm-profile-subtitle");
  if(subtitle && ordinary) subtitle.textContent=profile==="manager"?"Profil Gérant — réalisez votre diagnostic avant de consulter les résultats anonymisés de votre équipe.":"Profil Employé — partagez votre perception de façon anonyme.";
  commState={profil:null,index:0,scores:[0,0,0],npsScore:null,satisfactionScore:null,activePlan:"6m",pending:null,responses:[],engagements:[null,null],completed:false};
  document.getElementById("comm-chips").innerHTML="";
  const next=document.getElementById("comm-btn-next"); if(next){next.classList.add("hidden"); next.disabled=true;}
  showAppScreen("comm","comm-screen-profil");
}

function commSetupIntro(profil) {
  const iconEl=document.getElementById("comm-intro-icon"), titleEl=document.getElementById("comm-intro-title"), subtitleEl=document.getElementById("comm-intro-subtitle"), rulesEl=document.getElementById("comm-rules");
  if(profil==="gerant"){
    iconEl.textContent="🏪"; titleEl.textContent="Diagnostic — Vision Gérant"; subtitleEl.textContent="Évaluez votre stratégie de communication et découvrez comment vous situez par rapport aux enseignes exemplaires.";
    rulesEl.innerHTML='<li><span>🔄</span><strong>13 questions miroir</strong> : 6 externes et 7 internes</li><li><span>🧭</span><strong>8 questions</strong> sur la maturité de vos pratiques</li><li><span>🏆</span>Benchmark avec les <strong>meilleures enseignes</strong> du secteur</li><li><span>🗓️</span>Plan de communication sur <strong>6 mois, 1 an ou 3 ans</strong></li>';
  } else {
    iconEl.textContent="👥"; titleEl.textContent="Diagnostic — Vision Employé"; subtitleEl.textContent="Partagez votre perception. Vos réponses sont anonymes et contribueront à améliorer votre environnement de travail.";
    rulesEl.innerHTML='<li><span>🔄</span><strong>13 questions miroir</strong> : 6 externes et 7 internes</li><li><span>📈</span><strong>1 eNPS</strong> de recommandation employeur</li><li><span>✍️</span><strong>1 question libre</strong> d’amélioration</li><li><span>🔒</span>Vos réponses sont <strong>anonymes et confidentielles</strong></li>';
  }
}

function commSatisfactionLabel(v){v=Number(v); if(v<=6)return "Détracteur"; if(v<=8)return "Passif"; return "Promoteur";}
function commMirrorPct(sum,count){ return count ? Math.round(((sum-count)/(3*count))*100) : 0; }

function commRenderQuestion() {
  const questions=commState.profil==="gerant"?COMM_QUESTIONS_GERANT:COMM_QUESTIONS_SALARIE, axeNames=["Communication Externe","Communication Interne","Maturité des pratiques"], axeEmojis=["📡","💬","🧭"], q=questions[commState.index], axe=q.axe;
  commState.pending=null;
  document.getElementById("comm-axe-label").textContent=axeEmojis[axe]+" "+axeNames[axe]+(q.dimension?" — "+q.dimension:"");
  document.getElementById("comm-counter").textContent="Question "+(commState.index+1)+" / "+questions.length;
  document.getElementById("comm-progress").style.width=Math.round((commState.index/questions.length)*100)+"%";
  document.getElementById("comm-question").textContent=sanitize(q.text);
  renderChips("comm-chips",axeNames,axeEmojis,axe);
  const next=document.getElementById("comm-btn-next"), answers=document.getElementById("comm-answers"), sliderWrap=document.getElementById("comm-slider-wrap"), textWrap=document.getElementById("comm-text-wrap");
  next.classList.add("hidden"); next.disabled=true; next.textContent=(commState.index+1>=questions.length)?"Voir mes résultats →":"Question suivante →";
  const isNps=q.kind==="nps", isText=q.kind==="qualitative";
  answers.classList.toggle("hidden",isNps||isText); sliderWrap.classList.toggle("hidden",!isNps); if(textWrap)textWrap.classList.toggle("hidden",!isText);
  if(isNps){
    const slider=document.getElementById("comm-satisfaction-slider"), val=document.getElementById("comm-slider-value"), label=document.getElementById("comm-slider-label");
    slider.value="5"; val.textContent="5 / 10"; label.textContent=commSatisfactionLabel(5);
    function update(){const v=Number(slider.value); val.textContent=v+" / 10"; label.textContent=commSatisfactionLabel(v); commState.pending={axe:axe,score:null,answer:v+" / 10 — "+commSatisfactionLabel(v),satisfaction:v,question:q.text,id:q.id,kind:q.kind,dimension:q.dimension}; next.disabled=false; next.classList.remove("hidden");}
    slider.oninput=update; slider.onchange=function(){update(); scrollToQuestionAction("comm-btn-next");}; update();
  } else if(isText){
    const ta=document.getElementById("comm-free-text"); ta.value=""; ta.oninput=function(){const v=ta.value.trim(); commState.pending=v?{axe:axe,score:null,answer:v,question:q.text,id:q.id,kind:q.kind,dimension:q.dimension}:null; next.disabled=!v; next.classList.toggle("hidden",!v);}; ta.focus();
  } else {
    renderSelectableAnswersList("comm-answers",q.answers,function(item){commState.pending={axe:axe,score:parseInt(item.dataset.score,10),answer:item.textContent.replace(/^→/,"").trim(),question:q.text,id:q.id,kind:q.kind,dimension:q.dimension}; next.disabled=false; next.classList.remove("hidden"); scrollToQuestionAction("comm-btn-next");});
  }
}

function commCommitAndNext(){
  if(!commState.pending)return; const p=commState.pending;
  if(p.score!==null && p.score!==undefined) commState.scores[p.axe]+=p.score;
  if(p.satisfaction!==undefined){commState.satisfactionScore=p.satisfaction; commState.npsScore=p.satisfaction;}
  commState.responses.push({id:p.id,kind:p.kind,dimension:p.dimension,question:p.question,answer:p.answer,axe:p.axe,score:p.score}); commState.pending=null; commState.index++;
  const questions=commState.profil==="gerant"?COMM_QUESTIONS_GERANT:COMM_QUESTIONS_SALARIE;
  if(commState.index>=questions.length){document.getElementById("comm-progress").style.width="100%"; if(commState.profil==="gerant")commShowResultGerant(); else commShowResultSalarie();}
  else {commRenderQuestion(); scrollToQuestionTop("comm-question");}
}

function commShowResultSalarie() {
  const pctExt=commMirrorPct(commState.scores[0],6), pctInt=commMirrorPct(commState.scores[1],7);
  document.getElementById("comm-salarie-merci").textContent="Merci "+sanitize(osUser.displayName)+" pour votre participation. Vous pouvez maintenant envoyer vos réponses de façon anonymisée.";
  renderAxeScores("comm-salarie-scores",[{nom:"Perception externe",emoji:"📡",pct:pctExt,niveau:getNiveauComm(pctExt),label:getNiveauLabelComm(getNiveauComm(pctExt))},{nom:"Communication interne",emoji:"💬",pct:pctInt,niveau:getNiveauComm(pctInt),label:getNiveauLabelComm(getNiveauComm(pctInt))}]);
  const npsEl=document.getElementById("comm-nps-recap"); if(commState.satisfactionScore!==null){npsEl.innerHTML="<strong>Recommandation employeur :</strong> "+commState.satisfactionScore+" / 10 — "+commSatisfactionLabel(commState.satisfactionScore); npsEl.classList.remove("hidden");}
  document.getElementById("comm-anon-status").textContent=""; document.getElementById("comm-btn-send-anon").disabled=false; commState.completed=true; showAppScreen("comm","comm-screen-result-salarie");
}

const COMM_GERANT_DIAGNOSTICS={
  externe:{faible:"Votre communication externe manque de structure et de régularité. Commencez par sécuriser les fondamentaux locaux et digitaux.",intermediaire:"Votre communication externe est en développement. Renforcez la cohérence, la fréquence et la mesure des actions.",fort:"Votre communication externe est performante. Consolidez votre différenciation locale et pilotez-la avec des indicateurs."},
  interne:{faible:"Votre communication interne doit être structurée pour mieux informer, écouter et reconnaître les équipes.",intermediaire:"Votre communication interne dispose de bonnes bases. Formalisez les rituels, le feedback et la circulation de l’information.",fort:"Votre communication interne est performante. Faites-en un levier d’engagement et impliquez davantage les employés dans les décisions."}
};

async function commRegisterManagerCompletion(){
  if(!supabaseClient) return false;
  const payload={p_responses:commState.responses,p_external_score:commMirrorPct(commState.scores[0],6),p_internal_score:commMirrorPct(commState.scores[1],7),p_maturity_score:commMirrorPct(commState.scores[2],8)};
  const r=await supabaseClient.rpc("submit_communication_manager_diagnostic",payload);
  if(r.error){console.error("submit_communication_manager_diagnostic",r.error); return false;}
  return true;
}

async function commShowResultGerant() {
  const pExt=commMirrorPct(commState.scores[0],6), pInt=commMirrorPct(commState.scores[1],7), pMat=commMirrorPct(commState.scores[2],8), nExt=getNiveauComm(pExt), nInt=getNiveauComm(pInt), nMat=getNiveauComm(pMat);
  document.getElementById("comm-gerant-title").textContent="📊 Votre Diagnostic Communication 360°"; document.getElementById("comm-gerant-subtitle").textContent="Votre perception sur les deux axes miroir, complétée par la maturité de vos pratiques.";
  renderAxeScores("comm-gerant-scores",[{nom:"Perception externe",emoji:"📡",pct:pExt,niveau:nExt,label:getNiveauLabelComm(nExt)},{nom:"Communication interne",emoji:"💬",pct:pInt,niveau:nInt,label:getNiveauLabelComm(nInt)},{nom:"Maturité des pratiques",emoji:"🧭",pct:pMat,niveau:nMat,label:getNiveauLabelComm(nMat)}]);
  const c=document.getElementById("comm-gerant-diagnostic-phrases"); c.innerHTML='<div class="app-solution-section"><div class="app-solution-header app-sol-header-0"><span>📡</span><span>Communication Externe</span></div><div class="app-solution-body"><p class="app-solution-intro">'+sanitize(COMM_GERANT_DIAGNOSTICS.externe[nExt])+'</p></div></div><div class="app-solution-section"><div class="app-solution-header app-sol-header-1"><span>💬</span><span>Communication Interne</span></div><div class="app-solution-body"><p class="app-solution-intro">'+sanitize(COMM_GERANT_DIAGNOSTICS.interne[nInt])+'</p></div></div><div class="app-solution-section"><div class="app-solution-header"><span>🧭</span><span>Maturité des pratiques</span></div><div class="app-solution-body"><p class="app-solution-intro">Score de maturité : <strong>'+pMat+' %</strong>. Cet indicateur mesure les dispositifs réellement structurés dans votre organisation ; il est volontairement distinct des perceptions miroir.</p></div></div>';
  commState.completed=true; showAppScreen("comm","comm-screen-result-gerant");
  const reportBtn=document.getElementById("comm-btn-report-gerant"), status=document.getElementById("comm-manager-save-status");
  if(reportBtn) reportBtn.classList.add("hidden");
  if(status){status.textContent="Validation sécurisée de votre diagnostic…"; status.classList.remove("hidden");}
  const saved=await commRegisterManagerCompletion();
  if(saved && osUser && osUser.communicationReport){ if(reportBtn) reportBtn.classList.remove("hidden"); if(status) status.classList.add("hidden"); }
  else if(status){status.textContent="Votre diagnostic est affiché, mais l’accès aux résultats de l’équipe ne peut pas être activé pour le moment.";}
}

function commShowGerantEngagement(){
  const c=document.getElementById("comm-gerant-engagement-blocks"); c.innerHTML=""; const axes=[{axe:0,name:"Communication Externe",icon:"📡"},{axe:1,name:"Communication Interne",icon:"💬"}], opts=[{type:"accompagne",icon:"🤝",title:"Je veux un accompagnement Pekahellix",desc:"Je souhaite être accompagné pour structurer et déployer mes actions."},{type:"abandon",icon:"⏸️",title:"Je mets ça de côté",desc:"Je ne souhaite pas agir sur cet axe maintenant."},{type:"autonome",icon:"💪",title:"Je vais le faire en autonomie",desc:"Je vais mettre en œuvre les recommandations avec mes propres moyens."}];
  axes.forEach(function(a){const b=document.createElement("div"); b.className="app-engagement-block"; b.innerHTML='<div class="app-engagement-header app-eng-header-'+a.axe+'"><span>'+a.icon+'</span><span>'+a.name+'</span></div><div class="app-engagement-body"><ul class="app-engagement-options" data-axe="'+a.axe+'">'+opts.map(function(o){return '<li class="app-engagement-option comm-gerant-option" role="button" tabindex="0" data-axe="'+a.axe+'" data-type="'+o.type+'"><span class="app-eng-opt-icon">'+o.icon+'</span><div><div class="app-eng-opt-title">'+o.title+'</div><div class="app-eng-opt-desc">'+o.desc+'</div></div></li>';}).join("")+'</ul></div>'; c.appendChild(b);});
  showAppScreen("comm","comm-screen-engagement-gerant");
}

function commShowGerantPlan(){
  const totalPct=Math.round((commMirrorPct(commState.scores[0],6)+commMirrorPct(commState.scores[1],7)+commMirrorPct(commState.scores[2],8))/3), level=getNiveauComm(totalPct); commRenderBenchmark(); commRenderPlan(level,"6m"); const forfaitMap={faible:"Essentiel 6 mois",intermediaire:"Croissance 1 an",fort:"Transformation 3 ans"}; renderForfaits("comm-forfaits",COMM_FORFAITS,forfaitMap[level]); commState.completed=true; showAppScreen("comm","comm-screen-plan-gerant");
}

async function commSendAnonymousResponses(){
  const btn=document.getElementById("comm-btn-send-anon"), status=document.getElementById("comm-anon-status"); if(!supabaseClient){status.textContent="Connexion au service indisponible.";return;} btn.disabled=true; status.textContent="Envoi en cours…";
  const payload={p_responses:commState.responses,p_external_score:commMirrorPct(commState.scores[0],6),p_internal_score:commMirrorPct(commState.scores[1],7),p_satisfaction_score:commState.satisfactionScore};
  const r=await supabaseClient.rpc("submit_communication_employee_response",payload); if(r.error){console.warn("anonymous communication response",r.error); status.textContent="Envoi impossible. Vérifiez que votre compte est rattaché à une entreprise ou réessayez plus tard."; btn.disabled=false; return;} status.textContent="Merci. Vos réponses anonymisées ont été envoyées à votre entreprise."; btn.textContent="Réponses envoyées ✓";
}

function commRenderBenchmark(selectedType) {
  const el = document.getElementById("comm-benchmark");
  const select = document.getElementById("comm-benchmark-type");
  if (!el) return;

  if (select && !select.dataset.ready) {
    select.innerHTML = Object.keys(COMM_BENCHMARK_LABELS).map(function(key) {
      return '<option value="' + key + '">' + sanitize(COMM_BENCHMARK_LABELS[key]) + '</option>';
    }).join("");
    select.value = selectedType || "superette";
    select.addEventListener("change", function(){ commRenderBenchmark(select.value); });
    select.dataset.ready = "1";
  }

  const type = selectedType || (select && select.value) || "superette";
  if (select && select.value !== type) select.value = type;
  const items = COMM_BENCHMARK[type] || [];
  el.innerHTML = "";

  items.forEach(function(item) {
    const div = document.createElement("div");
    div.classList.add("app-benchmark-item");
    const source = item.sourceUrl
      ? '<a class="app-benchmark-source" href="' + item.sourceUrl + '" target="_blank" rel="noopener noreferrer">Source : ' + sanitize(item.source) + ' ↗</a>'
      : '<span class="app-benchmark-source">Source : ' + sanitize(item.source || "") + '</span>';
    div.innerHTML =
      '<div class="app-benchmark-header benchmark-neutral">' +
        '<span>' + item.emoji + '</span><span>' + sanitize(item.enseigne) + '</span>' +
      '</div>' +
      '<div class="app-benchmark-body">' +
        '<div>' + item.tags.map(function(t) {
          return '<span class="app-benchmark-tag tag-' + t + '">' + (t==="ext" ? "📡 Communication externe" : "💬 Communication interne") + '</span>';
        }).join("") + '</div>' +
        '<p class="app-benchmark-text">' + sanitize(item.texte) + '</p>' +
        '<div class="app-benchmark-score">💡 ' + sanitize(item.score) + '</div>' + source +
      '</div>';
    el.appendChild(div);
  });

  const note = document.createElement("p");
  note.className = "app-benchmark-note";
  note.textContent = "Les exemples sont des sources d’inspiration, pas un classement. Les données de recommandation salarié ou de NPS ne sont affichées que lorsqu’une source publique suffisamment explicite est disponible.";
  el.appendChild(note);
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
   V0.5-F.8 — SPLASH LOGO + AGRANDISSEMENT DU LOGO HEADER
   ============================================================ */
function getVisibleAuthLogo() {
  const screens = Array.from(document.querySelectorAll(".os-login"));
  const activeScreen = screens.find(function(screen) {
    return !screen.classList.contains("hidden") && window.getComputedStyle(screen).display !== "none";
  });
  return activeScreen ? activeScreen.querySelector(".login-logo") : null;
}

function runStartupSplash() {
  const splash = document.getElementById("startup-splash");
  const splashBg = splash && splash.querySelector(".startup-splash-bg");
  const splashLogo = document.getElementById("startup-splash-logo");
  if (!splash || !splashLogo) return;

  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const target = getVisibleAuthLogo();

  // Si une session restaurée affiche directement le bureau, on conserve un
  // court splash de marque puis on le retire sans forcer le retour au login.
  if (!target) {
    if (reduceMotion || !splash.animate) {
      window.setTimeout(function() { splash.classList.add("hidden"); }, 180);
      return;
    }
    splash.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 420,
      delay: 420,
      easing: "ease-out",
      fill: "forwards"
    }).finished.finally(function() { splash.classList.add("hidden"); });
    return;
  }

  target.classList.add("splash-target-hidden");

  // Attendre deux frames garantit que le navigateur a calculé la position
  // réelle du logo dans le formulaire responsive.
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      const from = splashLogo.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
      const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
      const scale = Math.min(to.width / from.width, to.height / from.height);

      if (reduceMotion || !splashLogo.animate) {
        target.classList.remove("splash-target-hidden");
        splash.classList.add("hidden");
        return;
      }

      const logoAnim = splashLogo.animate([
        { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
        { transform: "translate3d(0,0,0) scale(1)", opacity: 1, offset: 0.42 },
        { transform: "translate3d(" + dx + "px," + dy + "px,0) scale(" + scale + ")", opacity: 1 }
      ], {
        duration: 1550,
        easing: "cubic-bezier(.22,.8,.22,1)",
        fill: "forwards"
      });

      if (splashBg && splashBg.animate) {
        splashBg.animate([
          { opacity: 1 },
          { opacity: 1, offset: 0.45 },
          { opacity: 0 }
        ], {
          duration: 1450,
          easing: "ease-out",
          fill: "forwards"
        });
      }

      logoAnim.finished.finally(function() {
        target.classList.remove("splash-target-hidden");
        splash.classList.add("hidden");
      });
    });
  });
}

function openLogoLightbox() {
  const modal = document.getElementById("logo-lightbox");
  const close = document.getElementById("logo-lightbox-close");
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.classList.add("logo-lightbox-open");
  if (close) close.focus();
}

function closeLogoLightbox() {
  const modal = document.getElementById("logo-lightbox");
  const trigger = document.getElementById("topbar-logo-btn");
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.classList.remove("logo-lightbox-open");
  if (trigger && !document.getElementById("os-desktop").classList.contains("hidden")) trigger.focus();
}

/* ============================================================
   INITIALISATION — TOUS LES LISTENERS DANS DOMContentLoaded
   ============================================================ */
document.addEventListener("DOMContentLoaded", function() {
  initPasswordVisibilityToggles();

  initSupabase();

  /* ── ÉTAT INITIAL ── */
  document.getElementById("os-desktop").classList.add("hidden");
  document.querySelectorAll(".os-app-window").forEach(function(w) { w.classList.add("hidden"); });
  if (pekahellixInviteFlow) {
    showActivationScreen();
  } else if (pekahellixRecoveryFlow) {
    showPasswordRecoveryScreen();
  } else {
    hideAuthScreens();
    document.getElementById("os-login").classList.remove("hidden");
  }

  runStartupSplash();

  // Supabase émet PASSWORD_RECOVERY lorsqu'un lien de récupération est consommé.
  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(function(event) {
      if (event === "PASSWORD_RECOVERY") showPasswordRecoveryScreen();
    });
  }

  // Vérifie rapidement les désactivations/suppressions lorsque l’utilisateur revient dans l’app.
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "visible" && osUser) validateCurrentAccount();
  });
  window.addEventListener("online", function() {
    if (osUser) validateCurrentAccount();
  });

  const logoTrigger = document.getElementById("topbar-logo-btn");
  const logoModal = document.getElementById("logo-lightbox");
  const logoClose = document.getElementById("logo-lightbox-close");
  if (logoTrigger) logoTrigger.addEventListener("click", openLogoLightbox);
  if (logoClose) logoClose.addEventListener("click", closeLogoLightbox);
  if (logoModal) {
    logoModal.addEventListener("click", function(e) {
      if (e.target === logoModal) closeLogoLightbox();
    });
  }
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && logoModal && !logoModal.classList.contains("hidden")) {
      closeLogoLightbox();
    }
  });

  /* ── LOGIN — écoute click direct sur le bouton ── */
  async function doLogin() {
    var errEl    = document.getElementById("login-error");
    var email    = document.getElementById("input-username").value;
    var password = document.getElementById("input-password").value;
    var btn      = document.getElementById("login-btn");

    errEl.classList.add("hidden");
    errEl.classList.remove("success");

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
      startAccountGuard();
    } catch (e) {
      console.error("Connexion Pekahellix", e);
      const authCode = e && e.code ? String(e.code).toLowerCase() : "";
      const authMessage = e && e.message ? String(e.message).toLowerCase() : "";
      if (e && (e.code === "ACCOUNT_DISABLED" || e.message === "ACCOUNT_DISABLED" || authCode === "user_banned" || authMessage.includes("user banned"))) {
        errEl.textContent = "Votre compte a été désactivé. Contactez votre administrateur Pekahellix.";
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

  /* Activation d’un compte invité */
  document.getElementById("activation-password").addEventListener("input", function() {
    updatePasswordRules(this.value);
  });
  document.getElementById("activation-password-confirm").addEventListener("keydown", function(e) {
    if (e.key === "Enter") activateInvitedAccount();
  });
  document.getElementById("activation-btn").addEventListener("click", activateInvitedAccount);

  /* Mot de passe oublié / récupération */
  document.getElementById("forgot-password-link").addEventListener("click", showForgotPasswordScreen);
  document.getElementById("forgot-back").addEventListener("click", showLoginFromForgot);
  document.getElementById("forgot-submit").addEventListener("click", requestPasswordReset);
  document.getElementById("forgot-email").addEventListener("keydown", function(e) {
    if (e.key === "Enter") requestPasswordReset();
  });
  document.getElementById("recovery-password").addEventListener("input", function() {
    updateRecoveryPasswordRules(this.value);
  });
  document.getElementById("recovery-password-confirm").addEventListener("keydown", function(e) {
    if (e.key === "Enter") saveRecoveredPassword();
  });
  document.getElementById("recovery-submit").addEventListener("click", saveRecoveredPassword);

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
  document.getElementById("btn-logout-os").addEventListener("click", function() { logout(); });

  document.querySelectorAll(".os-app-icon").forEach(function(btn) {
    btn.addEventListener("click", function() { openApp(this.dataset.app); });
  });

  document.querySelectorAll(".os-dock-item").forEach(function(item) {
    item.addEventListener("click", function() { openApp(this.dataset.app); });
  });

  /* ── ADMINISTRATION ── */
  document.getElementById("admin-refresh").addEventListener("click", async function(){ await adminLoadOrganizations(); await adminLoadUsers(); });
  document.getElementById("admin-create-org").addEventListener("click", adminCreateOrganization);
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
  document.getElementById("temps-btn-start").addEventListener("click", function(){tempsInit(); showAppScreen("temps","temps-screen-diag"); tempsRenderQuestion();});
  document.getElementById("temps-btn-next").addEventListener("click", tempsCommitAndNext);
  document.getElementById("temps-btn-to-engagement").addEventListener("click", tempsShowEngagement);
  document.getElementById("temps-engagement-blocks").addEventListener("click", function(e){const opt=e.target.closest(".app-engagement-option"); if(!opt)return; const axe=parseInt(opt.dataset.axe,10),type=opt.dataset.type; document.querySelectorAll('.app-engagement-option[data-axe="'+axe+'"]').forEach(function(el){el.classList.remove("selected-accompagne","selected-autonome","selected-abandon");}); opt.classList.add("selected-"+type); tempsState.engagements[axe]=type;});
  document.getElementById("temps-btn-validate").addEventListener("click", function(){const missing=tempsState.engagements.findIndex(function(e){return e===null;}); if(missing!==-1){const blocks=document.querySelectorAll("#temps-engagement-blocks .app-engagement-block"); if(blocks[missing]){blocks[missing].scrollIntoView({behavior:"smooth",block:"center"}); blocks[missing].style.outline="2px solid #FF7900"; setTimeout(function(){blocks[missing].style.outline="";},2000);} return;} tempsShowResult();});
  document.getElementById("temps-btn-autonomy").addEventListener("click",tempsShowAutonomy);
  document.getElementById("temps-btn-back-support").addEventListener("click",function(){showAppScreen("temps","temps-screen-result");});
  document.getElementById("temps-btn-restart").addEventListener("click", function(){tempsInit(); showAppScreen("temps","temps-screen-diag"); tempsRenderQuestion();});

  /* ── APP COMM ── */
  document.getElementById("comm-btn-report-gerant").addEventListener("click",commOpenEmployeeReport);
  document.getElementById("comm-report-period").addEventListener("change",function(){commLoadEmployeeReport(this.value);});
  document.getElementById("comm-btn-report-back").addEventListener("click",function(){showAppScreen("comm","comm-screen-result-gerant");});
  document.getElementById("comm-btn-gerant").addEventListener("click",function(){commState.profil="gerant"; commSetupIntro("gerant"); showAppScreen("comm","comm-screen-intro");});
  document.getElementById("comm-btn-salarie").addEventListener("click",function(){commState.profil="salarie"; commSetupIntro("salarie"); showAppScreen("comm","comm-screen-intro");});
  document.getElementById("comm-btn-start").addEventListener("click",function(){const profil=commState.profil; commState={profil:profil,index:0,scores:[0,0,0],npsScore:null,satisfactionScore:null,activePlan:"6m",pending:null,responses:[],engagements:[null,null],completed:false}; document.getElementById("comm-chips").innerHTML=""; showAppScreen("comm","comm-screen-diag"); commRenderQuestion();});
  document.getElementById("comm-btn-next").addEventListener("click",commCommitAndNext);
  document.getElementById("comm-btn-restart-salarie").addEventListener("click",commInit);
  document.getElementById("comm-btn-restart-gerant").addEventListener("click",commInit);
  document.getElementById("comm-btn-send-anon").addEventListener("click",commSendAnonymousResponses);
  document.getElementById("comm-btn-to-engagement-gerant").addEventListener("click",commShowGerantEngagement);
  document.getElementById("comm-gerant-engagement-blocks").addEventListener("click",function(e){const opt=e.target.closest(".comm-gerant-option"); if(!opt)return; const axe=parseInt(opt.dataset.axe,10),type=opt.dataset.type; document.querySelectorAll('.comm-gerant-option[data-axe="'+axe+'"]').forEach(function(x){x.classList.remove("selected-accompagne","selected-autonome","selected-abandon");}); opt.classList.add("selected-"+type); commState.engagements[axe]=type;});
  document.getElementById("comm-btn-show-plan-gerant").addEventListener("click",function(){const missing=commState.engagements.findIndex(function(e){return e===null;}); if(missing!==-1){const blocks=document.querySelectorAll("#comm-gerant-engagement-blocks .app-engagement-block"); if(blocks[missing])blocks[missing].scrollIntoView({behavior:"smooth",block:"center"}); return;} commShowGerantPlan();});
  document.querySelectorAll(".app-plan-tab").forEach(function(tab){tab.addEventListener("click",function(){const max=[8*4,7*4],totalPct=Math.round(((commState.scores[0]+commState.scores[1])/(max[0]+max[1]))*100); commRenderPlan(getNiveauComm(totalPct),this.dataset.plan);});});

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
  document.getElementById("cyber-btn-retry-top").addEventListener("click", cyberInit);

}); /* FIN DOMContentLoaded */
