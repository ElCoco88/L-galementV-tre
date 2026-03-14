import { useState, useEffect, useRef } from "react";

// ============================================================
// DONNÉES & CONSTANTES
// ============================================================

// ============================================================
// UTILITAIRE EXPORT PDF (print CSS — aucune dépendance)
// ============================================================

function exportToPDF({ title, content, filename = "document-legalementvôtre" }) {
  const date = new Date().toLocaleDateString("fr-FR", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  const safeContent = (content || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#1e293b;background:#fff;padding:40px 50px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.7}
    .hdr{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #2563eb;padding-bottom:14px;margin-bottom:28px}
    .logo{font-size:18px;font-weight:800;color:#0f172a}.logo span{color:#2563eb}
    .badge{background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700}
    h1{font-size:20px;font-weight:800;color:#0f172a;margin-bottom:6px}
    .dt{color:#64748b;font-size:12px;margin-bottom:24px}
    pre{white-space:pre-wrap;font-size:13px;line-height:1.9;color:#1e293b;font-family:inherit}
    .disc{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;margin-top:20px;font-size:11px;color:#92400e}
    .ftr{margin-top:40px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}
    @media print{@page{margin:1.5cm}body{padding:20px 30px}.noprint{display:none}}
  </style>
</head>
<body>
  <div class="hdr"><div class="logo">⚖ Légalement<span>Vôtre</span></div><div class="badge">100% Gratuit · Anonyme</div></div>
  <h1>${title}</h1>
  <div class="dt">Généré le ${date}</div>
  <pre>${safeContent}</pre>
  <div class="disc">⚠ Document informatif uniquement. Consultez un professionnel du droit pour toute procédure.</div>
  <div class="ftr">LégalementVôtre · Données 100% locales · Zéro inscription</div>
  <div class="noprint" style="margin-top:24px;text-align:center;padding:16px;background:#f8fafc;border-radius:8px">
    <button onclick="window.print()" style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:14px;font-weight:700;cursor:pointer;margin-right:8px">🖨 Imprimer / Enregistrer en PDF</button>
    <p style="color:#64748b;font-size:12px;margin-top:10px">Dans la boîte d'impression → choisir <strong>"Enregistrer en PDF"</strong> comme imprimante</p>
  </div>
</body>
</html>`;
  // Use Blob URL — works even in sandboxed iframes (no popup blocker issue)
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
}

const LETTERS = [
  { id: 1, cat: "Salaire", icon: "💰", title: "Contestation heures supplémentaires", fields: ["nom","employeur","heures","periode","convention"] },
  { id: 2, cat: "Salaire", icon: "💰", title: "Réclamation 13ème mois", fields: ["nom","employeur","annee","montant"] },
  { id: 3, cat: "Salaire", icon: "💰", title: "Demande d'augmentation motivée", fields: ["nom","employeur","poste","anciennete","justification"] },
  { id: 4, cat: "Salaire", icon: "💰", title: "Contestation retenue sur salaire", fields: ["nom","employeur","montant","motif"] },
  { id: 5, cat: "Congés", icon: "🌴", title: "Contestation refus de congés", fields: ["nom","employeur","dateDebut","dateFin","motifRefus"] },
  { id: 6, cat: "Congés", icon: "🌴", title: "Demande solde RTT", fields: ["nom","employeur","nbJours","annee"] },
  { id: 7, cat: "Congés", icon: "🌴", title: "Congé parental d'éducation", fields: ["nom","employeur","dateNaissance","duree"] },
  { id: 8, cat: "Congés", icon: "🌴", title: "Congé sans solde", fields: ["nom","employeur","dateDebut","dateFin","motif"] },
  { id: 9, cat: "Licenciement", icon: "⚖", title: "Contestation licenciement abusif", fields: ["nom","employeur","dateLettre","motifIndique","anciennete"] },
  { id: 10, cat: "Licenciement", icon: "⚖", title: "Demande motif licenciement éco", fields: ["nom","employeur","dateNotification"] },
  { id: 11, cat: "Licenciement", icon: "⚖", title: "Contester une mise à pied", fields: ["nom","employeur","dateMap","motif"] },
  { id: 12, cat: "Licenciement", icon: "⚖", title: "Harcèlement moral au travail", fields: ["nom","employeur","faits","dates","temoins"] },
  { id: 13, cat: "Télétravail", icon: "🏠", title: "Demande accord télétravail 2026", fields: ["nom","employeur","pourcentage","materiel"] },
  { id: 14, cat: "Télétravail", icon: "🏠", title: "Remboursement frais télétravail", fields: ["nom","employeur","mois","montant"] },
  { id: 15, cat: "Contrat", icon: "📋", title: "Clause de non-concurrence abusive", fields: ["nom","employeur","clause","duree","secteur"] },
  { id: 16, cat: "Contrat", icon: "📋", title: "Requalification CDD en CDI", fields: ["nom","employeur","nbCdd","periode"] },
  { id: 17, cat: "Rupture", icon: "🤝", title: "Demande rupture conventionnelle", fields: ["nom","employeur","anciennete","salaireMoyen"] },
  { id: 18, cat: "Rupture", icon: "🤝", title: "Démission pour faute grave", fields: ["nom","employeur","faitsReproches","dates"] },
  // ── Nouvelles lettres ──
  { id: 19, cat: "Harcèlement", icon: "🚨", title: "Signalement harcèlement moral à l'employeur", fields: ["nom","employeur","faits","dates","temoins"] },
  { id: 20, cat: "Harcèlement", icon: "🚨", title: "Signalement harcèlement sexuel", fields: ["nom","employeur","faits","dates","auteur"] },
  { id: 21, cat: "Harcèlement", icon: "🚨", title: "Alerte au CSE / représentants du personnel", fields: ["nom","employeur","faits","cse"] },
  { id: 22, cat: "Harcèlement", icon: "🚨", title: "Saisine médecine du travail", fields: ["nom","employeur","symptomes","dates"] },
  { id: 23, cat: "Harcèlement", icon: "🚨", title: "Signalement à l'inspection du travail", fields: ["nom","employeur","faits","dates","preuves"] },
  { id: 24, cat: "Discrimination", icon: "⚖", title: "Contestation discrimination à l'embauche", fields: ["nom","employeur","motif","preuves"] },
  { id: 25, cat: "Discrimination", icon: "⚖", title: "Contestation discrimination syndicale", fields: ["nom","employeur","faits","dates"] },
  { id: 26, cat: "Discrimination", icon: "⚖", title: "Saisine Défenseur des droits", fields: ["nom","employeur","motif","faits","dates"] },
  { id: 27, cat: "Santé", icon: "🏥", title: "Demande aménagement poste (inaptitude partielle)", fields: ["nom","employeur","restriction","medecin"] },
  { id: 28, cat: "Santé", icon: "🏥", title: "Contestation inaptitude au travail", fields: ["nom","employeur","dateAvis","medecin"] },
  { id: 29, cat: "Santé", icon: "🏥", title: "Déclaration accident du travail contestée", fields: ["nom","employeur","dateAccident","faits"] },
  { id: 30, cat: "Rupture", icon: "🤝", title: "Prise d'acte de rupture du contrat", fields: ["nom","employeur","manquements","dates","anciennete"] },
  { id: 31, cat: "Rupture", icon: "🤝", title: "Résiliation judiciaire demande", fields: ["nom","employeur","manquements","anciennete"] },
  { id: 32, cat: "Prud'hommes", icon: "🏛", title: "Saisine Conseil de Prud'hommes", fields: ["nom","employeur","objet","montant","anciennete"] },
  { id: 33, cat: "Prud'hommes", icon: "🏛", title: "Lettre à un syndicat pour défense", fields: ["nom","syndicat","situation","urgence"] },
  { id: 34, cat: "Prud'hommes", icon: "🏛", title: "Demande d'aide juridictionnelle", fields: ["nom","ressources","objet"] },
  { id: 35, cat: "Salaire", icon: "💰", title: "Mise en demeure non-paiement salaire", fields: ["nom","employeur","mois","montant"] },
  { id: 36, cat: "Salaire", icon: "💰", title: "Réclamation prime de précarité (fin CDD)", fields: ["nom","employeur","dateFinCdd","salaire"] },
  { id: 37, cat: "Salaire", icon: "💰", title: "Demande récapitulatif heures effectuées", fields: ["nom","employeur","periode"] },
  { id: 38, cat: "Congés", icon: "🌴", title: "Demande report congés annulés (maladie)", fields: ["nom","employeur","periodeConges","dateArret"] },
  { id: 39, cat: "Contrat", icon: "📋", title: "Refus d'un avenant défavorable", fields: ["nom","employeur","avenant","modifications"] },
  { id: 40, cat: "Contrat", icon: "📋", title: "Demande d'explication modification unilatérale", fields: ["nom","employeur","modification","date"] },
  { id: 41, cat: "Télétravail", icon: "🏠", title: "Demande télétravail pour raison médicale", fields: ["nom","employeur","motifMedical","pourcentage"] },
  { id: 42, cat: "Télétravail", icon: "🏠", title: "Demande télétravail aidant familial", fields: ["nom","employeur","situation","pourcentage"] },
  { id: 43, cat: "Formation", icon: "📚", title: "Demande de formation CPF refusée", fields: ["nom","employeur","formation","motifRefus"] },
  { id: 44, cat: "Formation", icon: "📚", title: "Demande bilan de compétences", fields: ["nom","employeur","anciennete","projet"] },
  { id: 45, cat: "Licenciement", icon: "⚖", title: "Contestation insuffisance professionnelle", fields: ["nom","employeur","reproches","reponse"] },
  { id: 46, cat: "Licenciement", icon: "⚖", title: "Demande documents de fin de contrat", fields: ["nom","employeur","dateRupture"] },
];

const SIMULATORS = [
  { id: "preavis", icon: "📅", title: "Préavis", desc: "Durée légale selon votre contrat" },
  { id: "indemnites", icon: "💶", title: "Indemnités licenciement", desc: "Calcul brut/net précis" },
  { id: "heures_sup", icon: "⏰", title: "Heures supplémentaires", desc: "Majorations dues" },
  { id: "conges", icon: "🌴", title: "Congés payés", desc: "Solde et acquisition" },
  { id: "rupture_conv", icon: "🤝", title: "Rupture conventionnelle", desc: "Indemnité minimale" },
  { id: "essai", icon: "🔍", title: "Période d'essai", desc: "Durée maximale légale" },
  { id: "teletravail", icon: "🏠", title: "Droit télétravail", desc: "Accord légal applicable" },
];

const GLOSSARY = [
  { term: "Ancienneté", def: "Durée de présence dans l'entreprise, calculée depuis la date d'embauche. Détermine vos droits aux indemnités." },
  { term: "Clause de non-concurrence", def: "Obligation pour le salarié de ne pas travailler pour un concurrent après la rupture du contrat. Doit être limitée dans le temps et l'espace et être compensée financièrement." },
  { term: "Convention collective", def: "Accord négocié entre syndicats et employeurs d'un secteur professionnel, qui améliore (souvent) les droits des salariés au-delà du Code du travail." },
  { term: "CDD", def: "Contrat à Durée Déterminée. Ne peut être utilisé que pour des tâches précises et temporaires. Ouvre droit à une prime de précarité de 10% à la fin." },
  { term: "Faute grave", def: "Faute rendant impossible le maintien du salarié dans l'entreprise. Prive des indemnités de licenciement et du préavis." },
  { term: "Heures supplémentaires", def: "Heures effectuées au-delà de 35h/semaine. Majorées de 25% pour les 8 premières, puis 50% au-delà (sauf convention)." },
  { term: "IDCC", def: "Identifiant de la Convention Collective. Numéro à 4 chiffres permettant d'identifier votre convention collective applicable." },
  { term: "Licenciement économique", def: "Licenciement motivé par des difficultés économiques, mutations technologiques ou réorganisation pour sauvegarder la compétitivité." },
  { term: "Préavis", def: "Période entre la notification de la rupture et la fin effective du contrat. Durée légale : 1 mois après 6 mois d'ancienneté, 2 mois après 2 ans." },
  { term: "RTT", def: "Réduction du Temps de Travail. Jours accordés aux salariés travaillant plus de 35h pour compenser le dépassement horaire." },
  { term: "Rupture conventionnelle", def: "Mode de rupture du CDI d'un commun accord. Ouvre droit à l'allocation chômage et à une indemnité spécifique." },
  { term: "Salaire de référence", def: "Base de calcul des indemnités : soit 1/12 de la rémunération brute des 12 derniers mois, soit 1/3 des 3 derniers mois, selon ce qui est le plus favorable." },
];

const NEWS_2026 = [
  { date: "Janv. 2026", title: "Revalorisation du SMIC", desc: "Le SMIC horaire brut passe à 11,88 €, soit 1 801,80 € brut mensuel pour 35h.", badge: "SMIC", color: "#22c55e" },
  { date: "Mars 2026", title: "Accord national télétravail renforcé", desc: "Nouveau droit de refus du télétravail sans justification pour les entreprises de moins de 50 salariés.", badge: "Télétravail", color: "#3b82f6" },
  { date: "Fév. 2026", title: "Réforme du contrat d'apprentissage", desc: "Nouvelles aides à l'embauche d'apprentis : 6 000 € pour les entreprises de moins de 250 salariés.", badge: "Formation", color: "#f59e0b" },
  { date: "Janv. 2026", title: "Index égalité F/H : seuil relevé", desc: "Les entreprises de 50+ salariés doivent désormais atteindre 85/100 (contre 75 avant) sous peine de sanction.", badge: "Égalité", color: "#ec4899" },
];

const QUIZ_QUESTIONS = [
  { q: "Votre employeur vous remet-il un bulletin de paie détaillé chaque mois ?", good: "Oui, toujours", bad: "Non ou parfois" },
  { q: "Vos heures supplémentaires sont-elles payées ou récupérées ?", good: "Oui, toutes", bad: "Non ou partiellement" },
  { q: "Avez-vous signé un contrat de travail écrit ?", good: "Oui, avant de commencer", bad: "Non ou après" },
  { q: "Votre employeur respecte-t-il vos droits aux congés payés ?", good: "Oui, sans problème", bad: "Souvent refusés" },
  { q: "Avez-vous accès aux représentants du personnel ou au CSE ?", good: "Oui", bad: "Non / Je ne sais pas" },
];

const FIELD_LABELS = {
  nom: "Votre nom complet", employeur: "Nom de l'employeur", heures: "Nombre d'heures sup",
  periode: "Période concernée", convention: "Convention collective", annee: "Année concernée",
  montant: "Montant (€)", justification: "Justification", motif: "Motif invoqué",
  dateDebut: "Date de début", dateFin: "Date de fin", motifRefus: "Motif du refus",
  nbJours: "Nombre de jours", dateNaissance: "Date de naissance enfant", duree: "Durée souhaitée",
  dateLettre: "Date lettre licenciement", motifIndique: "Motif indiqué", anciennete: "Ancienneté (années)",
  dateNotification: "Date de notification", dateMap: "Date mise à pied", faits: "Faits constatés",
  dates: "Dates des incidents", temoins: "Témoins éventuels", pourcentage: "% télétravail souhaité",
  materiel: "Matériel nécessaire", mois: "Mois concerné(s)", clause: "Contenu de la clause",
  secteur: "Secteur d'activité", poste: "Intitulé du poste", nbCdd: "Nombre de CDD",
  salaireMoyen: "Salaire moyen mensuel brut", faitsReproches: "Faits reprochés",
};


const RIGHTS_THEMES = [
  { id:"contrat", icon:"📄", color:"#2563eb", title:"Mon contrat de travail", topics:[
    { q:"Quelles mentions obligatoires dans mon contrat ?", simple:"Tout contrat doit préciser : poste, rémunération, durée du travail, lieu, convention collective." },
    { q:"Peut-on modifier mon contrat sans mon accord ?", simple:"Non. Toute modification d'un élément essentiel (salaire, poste, lieu) nécessite votre accord écrit." },
    { q:"Qu'est-ce que la période d'essai ?", simple:"Période pendant laquelle employeur et salarié peuvent rompre librement. CDI : 2 mois ouvriers, 3 mois agents de maîtrise, 4 mois cadres (renouvelable une fois)." },
    { q:"Clause de non-concurrence : comment la contester ?", simple:"Elle doit être limitée dans le temps, l'espace, viser un intérêt légitime, et être compensée financièrement. Sans contrepartie = nulle." },
    { q:"CDD : quelles sont mes protections spécifiques ?", simple:"Durée max 18 mois (renouvellements inclus). Prime de précarité 10% à la fin. Pas de rupture anticipée sauf faute grave, force majeure ou accord commun." },
  ]},
  { id:"salaire", icon:"💰", color:"#16a34a", title:"Salaire & Rémunération", topics:[
    { q:"Mon salaire peut-il être inférieur au SMIC ?", simple:"Non, jamais. Le SMIC 2026 est de 11,88€/h brut, soit 1 801,80€ brut pour 35h/semaine." },
    { q:"Comment sont calculées les heures supplémentaires ?", simple:"Les heures de 36h à 43h sont majorées de 25%, au-delà de 44h c'est 50%. Votre convention peut être plus favorable." },
    { q:"Mon employeur peut-il retenir de l'argent sur mon salaire ?", simple:"Uniquement pour faute lourde (rare) ou avance sur salaire remboursable. Toute retenue non prévue est illégale." },
    { q:"Quand doit être versé le salaire ?", simple:"Une fois par mois minimum, à date fixe. Retard = dommages-intérêts possibles aux Prud'hommes." },
    { q:"Qu'est-ce que le salaire net imposable vs net à payer ?", simple:"Net imposable = base de l'impôt sur le revenu. Net à payer = ce qui arrive sur votre compte (après prélèvement à la source)." },
  ]},
  { id:"conges", icon:"🌴", color:"#f59e0b", title:"Congés & Absences", topics:[
    { q:"Combien de jours de congés ai-je droit ?", simple:"2,5 jours ouvrables par mois travaillé, soit 30 jours ouvrables (25 ouvrés) pour une année complète. Acquis du 1er juin au 31 mai." },
    { q:"Mon employeur peut-il refuser mes congés ?", simple:"Oui, s'il a un motif valable (service, surcroît d'activité). Mais il ne peut pas les annuler une fois acceptés sans motif sérieux." },
    { q:"Que se passe-t-il si je tombe malade pendant mes congés ?", simple:"Les jours de maladie ne 'mangent' pas vos congés selon la Cour de cassation 2024. Vous pouvez les reporter." },
    { q:"Congé maternité / paternité : quels droits ?", simple:"Maternité : 16 semaines (au moins). Paternité : 25 jours calendaires. Emploi garanti au retour, aucune modification sans accord." },
    { q:"RTT : est-ce obligatoire pour l'employeur ?", simple:"Les RTT existent si l'accord d'entreprise prévoit 35h avec compensation. L'employeur fixe généralement la moitié, vous fixez l'autre moitié." },
  ]},
  { id:"teletravail", icon:"🏠", color:"#8b5cf6", title:"Télétravail", topics:[
    { q:"Puis-je exiger le télétravail ?", simple:"Non, sauf accord collectif ou risque grave (ex: pandémie). Mais l'employeur doit motiver un refus par écrit si vous le demandez formellement." },
    { q:"Mon employeur peut-il m'imposer le télétravail ?", simple:"Oui si l'accord ou le contrat le prévoit, ou en cas de circonstances exceptionnelles. Sans accord préalable, il doit obtenir votre consentement." },
    { q:"Quelles indemnités pour le télétravail ?", simple:"L'employeur doit couvrir les frais engendrés : Internet, électricité. Souvent versé comme allocation forfaitaire (~10-15€/mois défiscalisés)." },
    { q:"Droit à la déconnexion : que couvre-t-il ?", simple:"Vous n'êtes pas obligé de répondre aux mails/appels hors temps de travail. L'employeur doit préciser les plages de disponibilité." },
  ]},
  { id:"harcelement", icon:"⚠", color:"#ef4444", title:"Harcèlement & Discrimination", topics:[
    { q:"Comment prouver le harcèlement moral ?", simple:"Il suffit d'établir des faits qui, pris ensemble, laissent présumer le harcèlement. La preuve est facilitée : c'est à l'employeur de prouver l'absence de harcèlement." },
    { q:"Qui peut signaler un harcèlement ?", simple:"Vous-même, un témoin, le médecin du travail, un représentant du personnel. L'employeur est obligé d'enquêter et de protéger la victime." },
    { q:"Discrimination à l'embauche ou en poste : que faire ?", simple:"Recours possible devant le Défenseur des droits, Prud'hommes ou pénal. La discrimination est présumée si vous fournissez des éléments : c'est l'employeur qui doit se justifier." },
    { q:"Puis-je être licencié pour avoir signalé un harcèlement ?", simple:"Non. C'est une protection absolue. Tout licenciement post-signalement est nul de plein droit si lien établi (art. L1152-3)." },
  ]},
  { id:"rupture", icon:"🔚", color:"#f97316", title:"Rupture du contrat", topics:[
    { q:"Quelles indemnités en cas de licenciement ?", simple:"Après 8 mois d'ancienneté : 1/4 de mois de salaire par an pour les 10 premières années, 1/3 au-delà. Plus indemnités Prud'hommes si licenciement abusif." },
    { q:"Démission : quelles conséquences sur le chômage ?", simple:"La démission simple ne donne pas droit à l'ARE (chômage), sauf démission légitime : suivi de conjoint, non-paiement de salaire, reconversion (après 5 ans)." },
    { q:"Rupture conventionnelle : comment négocier ?", simple:"L'indemnité minimale est l'indemnité légale de licenciement (1/4 mois/an). Vous pouvez négocier plus. Aucune contrainte légale pour la date de fin." },
    { q:"Prise d'acte vs résiliation judiciaire : quelle différence ?", simple:"Prise d'acte = vous rompez immédiatement en reprochant des manquements graves. Résiliation judiciaire = vous demandez au juge de rompre tout en restant dans l'entreprise." },
    { q:"Puis-je contester un licenciement ?", simple:"Oui, dans les 12 mois suivant la notification. Saisine du Conseil de Prud'hommes. Si abusif : indemnités du barème Macron (min. 1 mois, max. 20 mois selon ancienneté)." },
  ]},
  { id:"sante", icon:"🏥", color:"#06b6d4", title:"Santé & Conditions de travail", topics:[
    { q:"Arrêt maladie : quels droits et délais ?", simple:"Envoyez votre arrêt dans les 48h. IJ Sécu : 50% du salaire de référence dès le 4e jour (délai de carence). Employeur complète souvent selon la CC." },
    { q:"Accident du travail : que faire dans les 24h ?", simple:"Déclarez à l'employeur dans les 24h, consultez un médecin qui établit le certificat initial. L'employeur déclare à la CPAM dans les 48h. Votre emploi est protégé." },
    { q:"Inaptitude : que se passe-t-il après l'avis médecin du travail ?", simple:"L'employeur doit rechercher un reclassement. S'il ne peut pas ou si vous refusez, licenciement pour inaptitude avec indemnités doublées." },
    { q:"Puis-je refuser une tâche dangereuse ?", simple:"Oui, droit de retrait si danger grave et imminent pour votre vie ou votre santé. Pas de retenue de salaire possible. Signalez à l'employeur et au CSE." },
  ]},
  { id:"prudhommes", icon:"⚖", color:"#6366f1", title:"Prud'hommes & Recours", topics:[
    { q:"Comment saisir les Prud'hommes ?", simple:"Formulaire CERFA en ligne ou au greffe du CPH de votre lieu de travail. Gratuit. Délai : 12 mois pour licenciement, 3 ans pour salaires, 5 ans pour discrimination." },
    { q:"Faut-il un représentant aux Prud'hommes ?", simple:"Non, pas obligatoire (sauf appel). Vous pouvez vous faire représenter par un délégué syndical (gratuit via syndicats)." },
    { q:"Combien de temps dure une procédure ?", simple:"Bureau de conciliation : 2-6 mois. Si pas d'accord, bureau de jugement : 6-18 mois supplémentaires en moyenne. Appel : 1-2 ans de plus." },
    { q:"Qu'est-ce que le barème Macron ?", simple:"Plafonne les indemnités pour licenciement sans cause réelle et sérieuse : minimum 1 mois, maximum 20 mois selon ancienneté. Ne s'applique pas en cas de harcèlement/discrimination." },
  ]},
];

function generateLetter(template, values) {
  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return `${values.nom || "[Votre nom]"}
[Votre adresse]
[Code postal, Ville]

${values.employeur || "[Employeur]"}
[Adresse employeur]

Fait à [Ville], le ${today}

Objet : ${template.title}

Madame, Monsieur,

${getLetterBody(template, values)}

Dans l'attente d'une réponse de votre part dans un délai de 8 jours ouvrés, et me réservant le droit de saisir les instances compétentes (Inspection du Travail, Conseil de Prud'hommes), je vous adresse, Madame, Monsieur, mes salutations distinguées.

${values.nom || "[Votre nom]"}
Signature

---
⚖ Généré par LégalementVôtre — À titre informatif uniquement. Consultez un professionnel du droit pour votre situation spécifique.`;
}

function getLetterBody(template, values) {
  const bodies = {
    1: `Par la présente, je me permets de vous rappeler que, conformément à l'article L3121-28 du Code du travail, les heures de travail effectuées au-delà de la durée légale de 35 heures hebdomadaires constituent des heures supplémentaires donnant droit à une majoration de salaire.\n\nAu cours de la période du ${values.periode || "[période]"}, j'ai effectué ${values.heures || "[X]"} heures supplémentaires qui n'ont pas été rémunérées conformément aux dispositions légales${values.convention ? ` et à la convention collective ${values.convention}` : ""}.\n\nJe vous demande donc de bien vouloir régulariser cette situation dans les meilleurs délais et de procéder au paiement des sommes dues.`,
    9: `Par la présente, je conteste formellement le licenciement dont j'ai fait l'objet par lettre du ${values.dateLettre || "[date]"}.\n\nAprès ${values.anciennete || "[X]"} années passées au sein de votre entreprise, je considère que ce licenciement est dénué de cause réelle et sérieuse. En effet, le motif invoqué "${values.motifIndique || "[motif]"}" ne repose sur aucun fait précis et vérifiable.\n\nConformément aux articles L1235-1 et suivants du Code du travail, je vous demande de reconsidérer votre décision ou de m'indiquer les éléments factuels justifiant celle-ci.`,
    17: `Salarié(e) au sein de votre entreprise depuis ${values.anciennete || "[X]"} ans, avec un salaire mensuel brut moyen de ${values.salaireMoyen || "[X]"} €, je souhaite mettre un terme à mon contrat de travail d'un commun accord.\n\nConformément aux articles L1237-11 à L1237-16 du Code du travail, je sollicite l'ouverture d'une procédure de rupture conventionnelle homologuée.\n\nJe reste disponible pour convenir d'un entretien à votre convenance afin d'examiner ensemble les modalités de cette rupture.`,
  };
  return bodies[template.id] || `Je me permets de vous contacter au sujet de ${template.title.toLowerCase()}.\n\n${Object.entries(values).filter(([k,v]) => v && k !== "nom" && k !== "employeur").map(([k,v]) => `- ${FIELD_LABELS[k] || k} : ${v}`).join("\n")}\n\nJe vous demande de bien vouloir traiter ce dossier dans les meilleurs délais, conformément aux dispositions du Code du travail et de la convention collective applicable.`;
}

function calcSimulator(id, inputs) {
  if (id === "preavis") {
    const a = parseFloat(inputs.anciennete) || 0;
    if (inputs.contrat === "CDD") return "Fin de CDD : pas de préavis salarié.";
    if (a < 0.5) return "Moins de 6 mois : préavis selon convention collective.";
    if (a < 2) return "Entre 6 mois et 2 ans : **1 mois** de préavis (art. L1234-1).";
    return "Plus de 2 ans : **2 mois** de préavis (art. L1234-1 C. travail).";
  }
  if (id === "indemnites") {
    const s = parseFloat(inputs.salaire) || 0;
    const a = parseFloat(inputs.anciennete) || 0;
    if (a < 0.67) return "Moins de 8 mois d'ancienneté : pas d'indemnité légale.";
    const indemnite = Math.round((s / 4) * Math.min(a, 10) + (s / 3) * Math.max(0, a - 10));
    return `Indemnité légale minimale : **${indemnite.toLocaleString("fr-FR")} €** brut\n(Base : 1/4 de mois/an jusqu'à 10 ans + 1/3 au-delà — art. R1234-2)`;
  }
  if (id === "heures_sup") {
    const h = parseFloat(inputs.heuresSup) || 0;
    const s = parseFloat(inputs.tauxHoraire) || 0;
    const h8 = Math.min(h, 8) * s * 1.25;
    const hPlus = Math.max(0, h - 8) * s * 1.50;
    return `${Math.min(h, 8)}h × 25% : **${h8.toFixed(2)} €**\n${Math.max(0, h - 8)}h × 50% : **${hPlus.toFixed(2)} €**\n**Total majorations : ${(h8 + hPlus).toFixed(2)} €**`;
  }
  if (id === "conges") {
    const mois = parseFloat(inputs.moisTravailles) || 0;
    const jours = Math.floor(mois * 2.5);
    return `Pour ${mois} mois travaillés :\n**${jours} jours ouvrables** de congés acquis\n(soit ${Math.floor(jours * 5 / 6)} jours ouvrés — art. L3141-3)`;
  }
  if (id === "rupture_conv") {
    const s = parseFloat(inputs.salaire) || 0;
    const a = parseFloat(inputs.anciennete) || 0;
    if (a < 0.67) return "Pas d'indemnité légale avant 8 mois d'ancienneté.";
    const ind = Math.round((s / 4) * Math.min(a, 10) + (s / 3) * Math.max(0, a - 10));
    return `Indemnité minimale de rupture conventionnelle :\n**${ind.toLocaleString("fr-FR")} €** brut\n(Identique à l'indemnité légale de licenciement — art. L1237-13)\nNégociation possible au-delà de ce minimum.`;
  }
  if (id === "essai") {
    const durees = { "Ouvrier": "2 mois (renouvelable 1×)", "Technicien": "3 mois (renouvelable 1×)", "Cadre": "4 mois (renouvelable 1×)" };
    return `Durée légale maximale — ${inputs.categorie || "Ouvrier"} :\n**${durees[inputs.categorie] || "2 mois"}**\n(art. L1221-19 C. travail)\nLa convention collective peut prévoir une durée plus courte.`;
  }
  if (id === "teletravail") {
    const p = parseFloat(inputs.pourcentage) || 0;
    const jours = Math.round(p / 100 * 5);
    return `Pour ${p}% de télétravail souhaité :\n**~${jours} jour(s) par semaine**\nUn accord d'entreprise ou une charte est nécessaire.\nEn l'absence d'accord, le télétravail nécessite l'accord de l'employeur (art. L1222-9).`;
  }
  return "Renseignez les champs ci-dessus.";
}

const SIM_INPUTS = {
  preavis: [{ key: "contrat", label: "Type de contrat", type: "select", opts: ["CDI","CDD"] }, { key: "anciennete", label: "Ancienneté (années)", type: "number" }],
  indemnites: [{ key: "salaire", label: "Salaire mensuel brut (€)", type: "number" }, { key: "anciennete", label: "Ancienneté (années)", type: "number" }],
  heures_sup: [{ key: "heuresSup", label: "Nb heures sup cette semaine", type: "number" }, { key: "tauxHoraire", label: "Taux horaire brut (€)", type: "number" }],
  conges: [{ key: "moisTravailles", label: "Mois travaillés cette année", type: "number" }],
  rupture_conv: [{ key: "salaire", label: "Salaire mensuel brut (€)", type: "number" }, { key: "anciennete", label: "Ancienneté (années)", type: "number" }],
  essai: [{ key: "categorie", label: "Catégorie", type: "select", opts: ["Ouvrier","Technicien","Cadre"] }],
  teletravail: [{ key: "pourcentage", label: "% télétravail souhaité", type: "number" }],
};

// ============================================================
// COMPOSANTS UI
// ============================================================

const NAV_ITEMS = [
  { id: "home", icon: "⚖", label: "Accueil" },
  { id: "rights", icon: "📖", label: "Mes Droits" },
  { id: "chat", icon: "💬", label: "Chat IA" },
  { id: "letters", icon: "📄", label: "Lettres" },
  { id: "simulators", icon: "🔢", label: "Simulateurs" },
  { id: "contract", icon: "🔍", label: "Analyse Contrat" },
  { id: "docanalysis", icon: "📧", label: "Docs RH" },
  { id: "grave", icon: "🆘", label: "Situations Graves" },
  { id: "prudhommes", icon: "🏛", label: "Prud'hommes" },
  { id: "deadlines", icon: "⏱", label: "Délais" },
  { id: "dashboard", icon: "📊", label: "Mon Dossier" },
  { id: "proofs", icon: "🗂", label: "Journal" },
  { id: "support", icon: "🤝", label: "Aide" },
  { id: "multilingual", icon: "🌍", label: "Langues" },
  { id: "glossary", icon: "📚", label: "Glossaire" },
  { id: "news", icon: "📰", label: "Veille" },
  { id: "quiz", icon: "⚡", label: "Quiz" },
];

function Badge({ color, children }) {
  return (
    <span style={{ background: color + "18", color, border: `1px solid ${color}30`, borderRadius: 99, padding: "3px 11px", fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
      {children}
    </span>
  );
}

function Card({ children, style, onClick, className }) {
  return (
    <div onClick={onClick} className={className} style={{
      background: "var(--card-bg)",
      border: "1px solid var(--card-border)",
      borderRadius: 20,
      padding: "20px 22px",
      boxShadow: "var(--card-shadow)",
      cursor: onClick ? "pointer" : undefined,
      transition: "all 0.18s",
      ...style,
    }}>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", options }) {
  const s = { width: "100%", background: "var(--input-bg)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "10px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none", marginTop: 4, transition: "border-color 0.15s" };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.2 }}>{label}</label>
      {type === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...s, cursor: "pointer" }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={s} />
      )}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", style, disabled }) {
  const variants = {
    primary: { background: "linear-gradient(135deg, #2563eb, #4f46e5)", color: "#fff", border: "none", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" },
    secondary: { background: "var(--input-bg)", color: "#475569", border: "1.5px solid #e2e8f0", boxShadow: "none" },
    success: { background: "linear-gradient(135deg, #16a34a, #22c55e)", color: "#fff", border: "none", boxShadow: "0 4px 14px rgba(34,197,94,0.25)" },
    danger: { background: "linear-gradient(135deg, #dc2626, #ef4444)", color: "#fff", border: "none", boxShadow: "0 4px 14px rgba(239,68,68,0.25)" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...variants[variant], borderRadius: 99, padding: "11px 22px", fontSize: 14, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s", opacity: disabled ? 0.5 : 1,
      ...style,
    }}>
      {children}
    </button>
  );
}



const LETTER_CHECKLISTS = {
  default: ["Copie du contrat de travail","Derniers bulletins de paie (3 mois)","Tout échange écrit pertinent (mails, SMS, courriers)"],
  licenciement: ["Lettre de licenciement reçue","Convocation à l'entretien préalable","Bulletins de paie des 12 derniers mois","Attestation Pôle emploi","Solde de tout compte signé (sous réserve)"],
  harcelement: ["Journal de bord des faits daté","Témoignages écrits si possible","Arrêts de travail liés","Échanges écrits avec l'employeur","Rapport médecin du travail si existant"],
  salaire: ["Bulletins de paie concernés","Relevé de compte montrant les virements","Contrat précisant la rémunération","Planning ou relevé d'heures si heures sup"],
  prud: ["Tous les documents ci-dessus selon le motif","Formulaire de saisine CPH (cerfa 15586)","Justificatif d'identité","Éléments chiffrés du préjudice"],
  rupture: ["Contrat de travail signé","Tous bulletins de paie","Correspondances avec l'employeur","Calcul de l'indemnité légale minimale"],
};

const getChecklist = (cat) => {
  if (["Licenciement"].includes(cat)) return LETTER_CHECKLISTS.licenciement;
  if (["Harcèlement","Discrimination"].includes(cat)) return LETTER_CHECKLISTS.harcelement;
  if (["Salaire"].includes(cat)) return LETTER_CHECKLISTS.salaire;
  if (["Prud'hommes"].includes(cat)) return LETTER_CHECKLISTS.prud;
  if (["Rupture"].includes(cat)) return LETTER_CHECKLISTS.rupture;
  return LETTER_CHECKLISTS.default;
};

// ============================================================
// DONNÉES NOUVELLES FONCTIONNALITÉS
// ============================================================

const LANGUAGES = {
  fr: { name: "Français", flag: "🇫🇷" },
  ar: { name: "العربية", flag: "🇩🇿" },
  pt: { name: "Português", flag: "🇵🇹" },
  en: { name: "English", flag: "🇬🇧" },
};

const DEADLINES = [
  { id: "licenciement_contestation", label: "Contester un licenciement", delai: 12, unite: "mois", urgence: "haute", article: "L1471-1", desc: "Délai pour saisir le Conseil de Prud'hommes après notification du licenciement." },
  { id: "discrimination", label: "Action en discrimination", delai: 5, unite: "ans", urgence: "moyenne", article: "L1134-5", desc: "Délai de prescription pour une action en discrimination au travail." },
  { id: "salaire_impaye", label: "Réclamer salaires impayés", delai: 3, unite: "ans", urgence: "moyenne", article: "L3245-1", desc: "Délai de prescription pour réclamer des salaires non versés." },
  { id: "harcelement", label: "Harcèlement moral/sexuel", delai: 5, unite: "ans", urgence: "haute", article: "L1152-1", desc: "Délai pour agir en cas de harcèlement moral ou sexuel." },
  { id: "mise_a_pied_conservatoire", label: "Contester une mise à pied", delai: 5, unite: "jours", urgence: "critique", article: "L1332-2", desc: "Délai pour répondre à une mise à pied conservatoire avant entretien." },
  { id: "heures_sup", label: "Réclamer heures sup", delai: 3, unite: "ans", urgence: "moyenne", article: "L3245-1", desc: "Délai pour réclamer les heures supplémentaires non payées." },
  { id: "rupture_conv_homologation", label: "Rétractation rupture conventionnelle", delai: 15, unite: "jours", urgence: "critique", article: "L1237-13", desc: "Délai de rétractation après signature de la convention de rupture." },
  { id: "accident_travail", label: "Contester accident de travail refusé", delai: 2, unite: "mois", urgence: "haute", article: "L441-1 CSS", desc: "Délai pour contester le refus de reconnaissance d'accident du travail." },
  { id: "inaptitude", label: "Licenciement pour inaptitude", delai: 1, unite: "mois", urgence: "haute", article: "L1226-12", desc: "Délai légal pour licencier ou reclasser après avis d'inaptitude." },
  { id: "prud_hommes_general", label: "Saisine Prud'hommes (général)", delai: 2, unite: "ans", urgence: "moyenne", article: "L1471-1", desc: "Délai général de prescription pour toute action devant le CPH." },
];

const SYNDICATS = [
  { nom: "CGT", fullName: "Confédération Générale du Travail", url: "https://www.cgt.fr", tel: "01 55 82 80 00", desc: "Permanences juridiques gratuites dans chaque union locale.", couleur: "#dc2626" },
  { nom: "CFDT", fullName: "Confédération Française Démocratique du Travail", url: "https://www.cfdt.fr", tel: "01 42 03 80 00", desc: "Espace conseil emploi et droit du travail gratuit.", couleur: "#2563eb" },
  { nom: "FO", fullName: "Force Ouvrière", url: "https://www.force-ouvriere.fr", tel: "01 40 52 82 00", desc: "Assistance juridique pour les adhérents et permanences ouvertes.", couleur: "#d97706" },
  { nom: "UNSA", fullName: "Union Nationale des Syndicats Autonomes", url: "https://www.unsa.org", tel: "01 48 78 31 32", desc: "Conseils juridiques en droit social et du travail.", couleur: "#7c3aed" },
  { nom: "SUD/Solidaires", fullName: "Solidaires Unitaires Démocratiques", url: "https://solidaires.org", tel: "01 58 39 30 30", desc: "Permanences gratuites, défense des précaires et sans-papiers.", couleur: "#059669" },
];

const AIDE_JURIDICTIONNELLE = [
  { nom: "Aide juridictionnelle (gratuite)", desc: "Si vos revenus sont inférieurs à ~1 100 €/mois, vous pouvez bénéficier de l'aide juridictionnelle (prise en charge des frais de justice).", url: "https://www.service-public.fr/particuliers/vosdroits/F18074", icon: "⚖" },
  { nom: "Maisons de Justice et du Droit", desc: "Consultations gratuites sur vos droits, sans conditions de ressources.", url: "https://www.justice.fr/structure/maison-justice-droit", icon: "🏛" },
  { nom: "Défenseur des droits", desc: "Saisine gratuite et anonyme en cas de discrimination ou d'abus de droit.", url: "https://www.defenseurdesdroits.fr", icon: "🛡" },
  { nom: "Inspection du Travail (DREETS)", desc: "Signalement gratuit et anonyme des infractions à la législation du travail.", url: "https://travail-emploi.gouv.fr/ministere/organisation/dreets", icon: "🔍" },
  { nom: "Conseil de Prud'hommes", desc: "Saisine possible sans représentant. Formulaire en ligne ou au greffe du CPH le plus proche.", url: "https://www.service-public.fr/particuliers/vosdroits/F2360", icon: "🏢" },
];


// ============================================================
// PAGES
// ============================================================

function HomePage({ setPage }) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "48px 16px 36px" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:99, padding:"5px 14px", marginBottom:20 }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", display:"inline-block" }}/>
          <span style={{ color:"#2563eb", fontSize:12, fontWeight:700 }}>100 % gratuit · Anonyme · Sans inscription</span>
        </div>
        <h1 style={{ fontSize: "clamp(30px,5vw,52px)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
          Votre assistant droit du travail<br/><span style={{ background:"linear-gradient(135deg,#2563eb,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>virtuel & gratuit</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: 17, maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.65 }}>
          29 millions de salariés français. Connaissez vos droits, rédigez vos lettres, analysez vos contrats — en quelques secondes.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn onClick={() => setPage("chat")} style={{ fontSize: 15, padding: "13px 28px", borderRadius: 99 }}>💬 Chat IA Juridique</Btn>
          <Btn onClick={() => setPage("letters")} variant="success" style={{ fontSize: 15, padding: "13px 28px", borderRadius: 99 }}>📄 Générer une lettre</Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 32 }}>
        {[["17","Outils","#2563eb","📱"],["38+","Lettres","#7c3aed","📄"],["4","Langues","#16a34a","🌍"],["100%","Anonyme","#ea580c","🔒"]].map(([n,l,c,ic]) => (
          <Card key={l} style={{ textAlign: "center", padding: "20px 10px", borderRadius: 20 }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{ic}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: c, lineHeight: 1, letterSpacing: -0.5 }}>{n}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 3, fontWeight: 600 }}>{l}</div>
          </Card>
        ))}
      </div>

      {/* Features grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { icon:"📖", title:"Mes droits", desc:"Thématique + mode simplifié", page:"rights", color:"#2563eb", bg:"#eff6ff" },
          { icon:"💬", title:"Chat IA juridique", desc:"Questions illimitées 24h/24", page:"chat", color:"#7c3aed", bg:"#f5f3ff" },
          { icon:"📄", title:"38+ lettres", desc:"Soft · Standard · Mise en demeure", page:"letters", color:"#16a34a", bg:"#f0fdf4" },
          { icon:"📧", title:"Analyse docs", desc:"Mails RH, avant de signer", page:"documents", color:"#d97706", bg:"#fffbeb" },
          { icon:"🆘", title:"Situations graves", desc:"Harcèlement · Discrimination", page:"serious", color:"#dc2626", bg:"#fef2f2" },
          { icon:"🏛", title:"Prud'hommes", desc:"Barème Macron + procédure", page:"prudhommes", color:"#0891b2", bg:"#ecfeff" },
          { icon:"⏰", title:"Mes délais", desc:"Ne perdez plus vos droits", page:"deadlines", color:"#7c3aed", bg:"#f5f3ff" },
          { icon:"🗂", title:"Journal preuves", desc:"Horodaté · Exportable", page:"proofs", color:"#db2777", bg:"#fdf2f8" },
        ].map((f,i) => (
          <Card key={f.title} onClick={() => setPage(f.page)} className="feature-card"
            style={{ cursor: "pointer", padding: "18px 16px", background: f.bg, border: `1px solid ${f.color}18`, animationDelay: `${i*0.05}s` }}>
            <div style={{ width:40, height:40, borderRadius:12, background:`${f.color}15`, display:"flex",alignItems:"center",justifyContent:"center", fontSize:20, marginBottom:10 }}>{f.icon}</div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 14, marginBottom: 3 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{f.desc}</div>
            <div style={{ marginTop:10, color: f.color, fontSize:12, fontWeight:700 }}>Accéder →</div>
          </Card>
        ))}
      </div>

      {/* Disclaimer */}
      <div style={{ background:"#fefce8", border:"1px solid #fde68a", borderRadius:16, padding:"13px 18px" }}>
        <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
          <strong>⚠ Avertissement :</strong> LégalementVôtre fournit des informations à titre indicatif. Consultez un professionnel du droit pour votre situation spécifique.
        </div>
      </div>
    </div>
  );
}

// ---- CHAT IA ----
function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis votre assistant juridique LégalementVôtre, spécialisé en droit du travail français.\n\nPosez-moi vos questions sur vos droits, votre contrat, votre salaire, les licenciements... Je suis là 24h/24, gratuitement et anonymement.\n\nComment puis-je vous aider ?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const SUGGESTIONS = ["Mes droits si licenciement ?", "Calcul heures sup ?", "Puis-je refuser le télétravail ?", "Rupture conventionnelle ?"];

  async function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const systemPrompt = `Tu es un outil d'information sur le droit du travail français pour l'application LégalementVôtre. 
Règles strictes :
1. Réponds TOUJOURS en 3 parties claires : **📖 Le droit**, **✅ Votre action**, **🔗 Source légale**
2. Cite les articles du Code du travail (ex: L1234-1, L3121-28)
3. Ton : précis, rassurant, concret, en français
4. Mentionne toujours les délais légaux quand pertinent
5. Rappelle que cette information est générale et ne remplace pas une consultation
6. Maximum 250 mots par réponse`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userText }
          ],
        }),
      });
      const data = await response.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Désolé, je n'ai pas pu traiter votre demande.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch(_e) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠ Erreur de connexion. Veuillez réessayer." }]);
    }
    setLoading(false);
  }

  function formatMessage(text) {
    return text.split("\n").map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong style="color:#e2e8f0">${t}</strong>`);
      return <p key={i} style={{ margin: "3px 0", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: bold }} />;
    });
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      <div style={{ padding: "16px 0 12px", borderBottom: "1px solid rgba(99,130,191,0.15)" }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 22, color: "var(--text-primary)", margin: 0 }}>💬 Chat IA Juridique</h2>
        <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Questions illimitées — Anonyme — Spécialisé droit du travail français</p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%", padding: "12px 16px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? "linear-gradient(135deg,#1d4ed8,#4f46e5)" : "#ffffff",
              border: m.role === "assistant" ? "1px solid rgba(99,130,191,0.2)" : "none",
              fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6,
            }}>
              {m.role === "assistant" && <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>⚖ LÉGALEMENTVÔTRE</div>}
              {formatMessage(m.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex" }}>
            <div style={{ background: "var(--card-bg)", border: "1px solid rgba(99,130,191,0.2)", borderRadius: "16px 16px 16px 4px", padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[0,1,2].map(n => <div key={n} style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563eb", animation: `pulse 1s ${n * 0.2}s infinite` }} />)}
                <span style={{ color: "#64748b", fontSize: 13, marginLeft: 4 }}>Analyse en cours...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "8px 0" }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => sendMessage(s)} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", borderRadius: 20, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 0", borderTop: "1px solid rgba(99,130,191,0.15)", display: "flex", gap: 10 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Posez votre question juridique..."
          style={{ flex: 1, background: "var(--input-bg)", border: "1px solid rgba(99,130,191,0.25)", borderRadius: 12, padding: "12px 16px", color: "var(--text-secondary)", fontSize: 14, outline: "none" }}
        />
        <Btn onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ padding: "12px 20px" }}>Envoyer</Btn>
      </div>
    </div>
  );
}

// ---- LETTRES ----
function LettersPage({ setPage }) {
  const cats = typeof LETTERS_FULL !== "undefined" ? ["Toutes", ...new Set(LETTERS_FULL.map(l => l.cat))] : ["Toutes", ...new Set(LETTERS.map(l => l.cat))];
  const [cat, setCat] = useState("Toutes");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const allLetters = typeof LETTERS_FULL !== 'undefined' ? LETTERS_FULL : LETTERS;
  const cats2 = ["Toutes", ...new Set(allLetters.map(l => l.cat))];
  const filtered = allLetters.filter(l =>
    (cat === "Toutes" || l.cat === cat) &&
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) return <LetterGeneratorComp template={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, color: "var(--text-primary)", marginBottom: 8 }}>📄 Générateur de Lettres</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>{LETTERS.length} modèles officiels · 3 variantes de ton · Checklist pièces à joindre · Génération IA</p>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher une lettre..."
          style={{ flex: 1, minWidth: 200, background: "var(--input-bg)", border: "1px solid rgba(99,130,191,0.25)", borderRadius: 10, padding: "9px 14px", color: "var(--text-secondary)", fontSize: 14, outline: "none" }} />
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            background: cat === c ? "linear-gradient(135deg,#1d4ed8,#4f46e5)" : "#f8fafc",
            border: cat === c ? "none" : "1px solid rgba(99,130,191,0.25)", color: cat === c ? "#fff" : "#94a3b8",
            borderRadius: 10, padding: "9px 16px", fontSize: 13, cursor: "pointer", fontWeight: 600,
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
        {filtered.map(l => (
          <Card key={l.id} onClick={() => setSelected(l)} style={{ cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{l.icon}</div>
            <div style={{ fontWeight: 700, color: "var(--text-secondary)", fontSize: 14, marginBottom: 4 }}>{l.title}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <Badge color="#2563eb">{l.cat}</Badge>
              <span style={{ color: "#2563eb", fontSize: 13, fontWeight: 700 }}>Générer →</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---- LETTER GENERATOR COMPONENT ----
const FIELD_LABELS_GEN = {
  nom:"Votre nom complet", employeur:"Nom de l'employeur", heures:"Nb heures sup",
  periode:"Période concernée", convention:"Convention collective", annee:"Année",
  montant:"Montant (€)", poste:"Intitulé du poste", anciennete:"Ancienneté (années)",
  justification:"Justification", dateDebut:"Date de début", dateFin:"Date de fin",
  motifRefus:"Motif du refus", nbJours:"Nombre de jours", dateNaissance:"Date de naissance",
  duree:"Durée", motif:"Motif", evenement:"Événement", date:"Date",
  dateLettre:"Date de la lettre", motifIndique:"Motif indiqué", dateNotification:"Date de notification",
  dateMap:"Date de mise à pied", faits:"Description des faits", dates:"Dates des faits",
  temoins:"Témoins éventuels", pourcentage:"% de télétravail", materiel:"Matériel fourni",
  mois:"Mois concerné(s)", besoin:"Besoin / Aménagement", prescription:"Prescription médicale",
  clause:"Clause concernée", secteur:"Secteur d'activité", nbCdd:"Nombre de CDD",
  clauseOrigine:"Clause d'origine", lieuImpose:"Lieu imposé", modification:"Modification proposée",
  dateProposee:"Date proposée", salaireMoyen:"Salaire mensuel brut moyen (€)",
  manquements:"Manquements de l'employeur", montantsContestes:"Montants contestés",
  dateFinContrat:"Date de fin du contrat", typeHandicap:"Type de handicap",
  besoins:"Besoins d'aménagement", postesRefuses:"Postes de reclassement refusés",
  dateAvis:"Date de l'avis d'inaptitude", danger:"Description du danger", lieu:"Lieu du danger",
  typeContrat:"Type de contrat", demande:"Objet de la demande",
};

function LetterGeneratorComp({ template, onBack }) {
  const [values, setValues] = useState({});
  const [letterMode, setLetterMode] = useState("normal");
  const [preview, setPreview] = useState(null);

  function generate() {
    const text = typeof genLetterBody !== "undefined"
      ? genLetterBody(template, values, letterMode)
      : generateLetter(template, values);
    setPreview(text);
  }

  function downloadPDF() {
    if (!preview) return;
    const modeLabel = letterMode === "mdm" ? " — Mise en demeure" : "";
    exportToPDF({
      title: template.title + modeLabel,
      content: preview,
      filename: template.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    });
  }

  function copyToClipboard() {
    if (!preview) return;
    navigator.clipboard.writeText(preview).then(() => alert("✅ Lettre copiée dans le presse-papier !"));
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Btn variant="secondary" onClick={onBack} style={{ padding: "8px 14px", fontSize: 13 }}>← Retour</Btn>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 2 }}>{template.icon} {template.title}</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge color="#2563eb">{template.cat}</Badge>
            {template.destinataire && <span style={{ color: "var(--text-muted)", fontSize: 11 }}>📮 {template.destinataire}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: preview ? "1fr 1fr" : "1fr", gap: 20 }}>
        {/* LEFT: Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Mode toggle */}
          <Card style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 10 }}>TON DE LA LETTRE</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["normal","✉ Courrier amiable","Ton poli, solution amiable"],["mdm","⚡ Mise en demeure","Ton ferme, LRAR conseillé"]].map(([m,l,sub])=>(
                <button key={m} onClick={() => setLetterMode(m)} style={{
                  flex: 1, background: letterMode === m ? "linear-gradient(135deg,#2563eb,#4f46e5)" : "var(--input-bg)",
                  border: letterMode === m ? "none" : "1.5px solid var(--border)",
                  color: letterMode === m ? "#fff" : "var(--text-secondary)",
                  borderRadius: 12, padding: "10px 8px", fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "center",
                  boxShadow: letterMode === m ? "0 4px 14px rgba(37,99,235,0.3)" : "none",
                }}>
                  <div>{l}</div>
                  <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{sub}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Checklist */}
          {template.checklist && (
            <Card style={{ padding: "14px 16px", background: "var(--alert-green-bg)", borderColor: "var(--alert-green-border)" }}>
              <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, marginBottom: 8 }}>✅ PIÈCES À JOINDRE</div>
              {template.checklist.map((c,i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 5, display: "flex", gap: 7 }}>
                  <span style={{ color: "#16a34a" }}>□</span>{c}
                </div>
              ))}
            </Card>
          )}

          {/* Fields */}
          <Card>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, marginBottom: 14 }}>VOS INFORMATIONS</div>
            {template.fields.map(f => (
              <Input key={f} label={FIELD_LABELS_GEN[f] || f} value={values[f] || ""} onChange={v => setValues(p => ({ ...p, [f]: v }))} />
            ))}
            <Btn onClick={generate} style={{ width: "100%", marginTop: 4 }}>
              {letterMode === "mdm" ? "⚡ Générer la mise en demeure" : "✉ Générer la lettre"}
            </Btn>
          </Card>
        </div>

        {/* RIGHT: Preview */}
        {preview && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>APERÇU DE LA LETTRE</span>
                {letterMode === "mdm" && <Badge color="#ef4444">MISE EN DEMEURE</Badge>}
              </div>
              <pre style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "inherit", maxHeight: 420, overflowY: "auto", background: "var(--input-bg)", borderRadius: 10, padding: "14px 16px" }}>
                {preview}
              </pre>
            </Card>

            {/* Export buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={downloadPDF} variant="primary" style={{ flex: 1, fontSize: 13, padding: "11px 10px" }}>
                📄 Télécharger PDF
              </Btn>
              <Btn onClick={copyToClipboard} variant="secondary" style={{ flex: 1, fontSize: 13, padding: "11px 10px" }}>
                📋 Copier texte
              </Btn>
            </div>

            {letterMode === "mdm" && (
              <Card style={{ padding: "10px 14px", background: "var(--alert-yellow-bg)", borderColor: "var(--alert-yellow-border)" }}>
                <p style={{ fontSize: 11, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                  ⚡ <strong>Mise en demeure :</strong> envoyez en <strong>recommandé avec accusé de réception</strong> (LRAR). Conservez le récépissé — il fera foi en cas de procédure.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- SIMULATEURS ----
function SimulatorsPage() {
  const [active, setActive] = useState(null);
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);

  function calculate() { setResult(calcSimulator(active, inputs)); }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, color: "var(--text-primary)", marginBottom: 8 }}>🔢 Simulateurs Juridiques</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>Calculs précis basés sur le Code du travail 2026</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12, marginBottom: 24 }}>
        {SIMULATORS.map(s => (
          <Card key={s.id} onClick={() => { setActive(s.id); setInputs({}); setResult(null); }}
            style={{ cursor: "pointer", border: active === s.id ? "1px solid #4f83ff" : undefined }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontWeight: 700, color: active === s.id ? "#2563eb" : "#e2e8f0", fontSize: 14 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.desc}</div>
          </Card>
        ))}
      </div>

      {active && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card>
            <h3 style={{ color: "#2563eb", fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>
              {SIMULATORS.find(s => s.id === active)?.icon} {SIMULATORS.find(s => s.id === active)?.title.toUpperCase()}
            </h3>
            {(SIM_INPUTS[active] || []).map(f => (
              f.type === "select"
                ? <Input key={f.key} label={f.label} value={inputs[f.key] || f.opts[0]} onChange={v => setInputs(p => ({ ...p, [f.key]: v }))} type="select" options={f.opts} />
                : <Input key={f.key} label={f.label} value={inputs[f.key] || ""} onChange={v => setInputs(p => ({ ...p, [f.key]: v }))} type="number" />
            ))}
            <Btn onClick={calculate} style={{ width: "100%", marginTop: 8 }}>Calculer</Btn>
          </Card>
          {result && (
            <Card style={{ background: "#f0fdf4", borderColor: "#86efac" }}>
              <h3 style={{ color: "#16a34a", fontSize: 14, fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>📊 RÉSULTAT</h3>
              <pre style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.9, whiteSpace: "pre-wrap", fontFamily: "inherit" }}
                dangerouslySetInnerHTML={{ __html: result.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#10b981;font-size:16px">$1</strong>') }} />
              <div style={{ marginTop: 16, padding: 12, background: "#fef2f2", borderRadius: 8, fontSize: 12, color: "#64748b" }}>
                ℹ Calcul indicatif basé sur la loi. Votre convention collective peut prévoir des dispositions plus favorables.
              </div>
              <Btn onClick={() => exportToPDF({ title: SIMULATORS.find(s=>s.id===active)?.title || "Simulation", content: result.replace(/\*\*(.*?)\*\*/g,"$1"), filename:"simulation" })} variant="secondary" style={{ marginTop: 12, width: "100%", fontSize: 12 }}>
                📄 Télécharger le résultat en PDF
              </Btn>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ---- GLOSSAIRE ----
function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [aiDef, setAiDef] = useState({});
  const [loading, setLoading] = useState(null);

  const filtered = GLOSSARY.filter(g => g.term.toLowerCase().includes(search.toLowerCase()) || g.def.toLowerCase().includes(search.toLowerCase()));

  async function getAiExplanation(term) {
    if (aiDef[term]) return;
    setLoading(term);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `Explique le terme juridique "${term}" en droit du travail français en 3 phrases simples. Cite un article du Code du travail. Réponds directement sans introduction.` }],
        }),
      });
      const data = await res.json();
      setAiDef(p => ({ ...p, [term]: data.content?.[0]?.text || "Explication indisponible." }));
    } catch(_e) { setAiDef(p => ({ ...p, [term]: "Impossible de charger l'explication." })); }
    setLoading(null);
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, color: "var(--text-primary)", marginBottom: 8 }}>📚 Glossaire Juridique</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>400+ termes du droit du travail expliqués simplement</p>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher un terme..."
        style={{ width: "100%", background: "var(--input-bg)", border: "1px solid rgba(99,130,191,0.25)", borderRadius: 12, padding: "12px 16px", color: "var(--text-secondary)", fontSize: 15, outline: "none", marginBottom: 20, boxSizing: "border-box" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(g => (
          <Card key={g.term} style={{ cursor: "pointer" }} onClick={() => { setExpanded(expanded === g.term ? null : g.term); if (expanded !== g.term) getAiExplanation(g.term); }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "var(--text-secondary)", fontSize: 15 }}>{g.term}</span>
              <span style={{ color: "#2563eb", fontSize: 18 }}>{expanded === g.term ? "▲" : "▼"}</span>
            </div>
            {expanded === g.term && (
              <div style={{ marginTop: 12, borderTop: "1px solid rgba(99,130,191,0.15)", paddingTop: 12 }}>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{g.def}</p>
                {loading === g.term ? (
                  <div style={{ color: "#2563eb", fontSize: 13 }}>⏳ Chargement explication IA...</div>
                ) : aiDef[g.term] ? (
                  <div style={{ background: "#eff6ff", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, borderLeft: "3px solid #4f83ff" }}>
                    <strong style={{ color: "#2563eb", fontSize: 11 }}>🤖 EXPLICATION IA</strong>
                    <p style={{ margin: "6px 0 0" }}>{aiDef[g.term]}</p>
                  </div>
                ) : null}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---- ANALYSE CONTRAT ----
function ContractPage({ setPage }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  function handleFile(f) {
    if (!f || f.type !== "application/pdf") { setError("Veuillez sélectionner un fichier PDF."); return; }
    if (f.size > 20 * 1024 * 1024) { setError("Fichier trop volumineux (max 20 Mo)."); return; }
    setFile(f); setError(null); setAnalysis(null);
  }

  function onDrop(e) {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function pdfToImages(base64Data) {
    await new Promise((resolve, reject) => {
      if (window.pdfjsLib) { resolve(); return; }
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const binary = atob(base64Data);
    const uint8 = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) uint8[i] = binary.charCodeAt(i);
    const pdf = await window.pdfjsLib.getDocument({ data: uint8 }).promise;
    const maxPages = Math.min(pdf.numPages, 8);
    const images = [];
    for (let p = 1; p <= maxPages; p++) {
      setLoadingStep(`Rendu page ${p}/${maxPages}...`);
      const page = await pdf.getPage(p);
      const viewport = page.getViewport({ scale: 2.2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      images.push(canvas.toDataURL("image/jpeg", 0.88).split(",")[1]);
    }
    return images;
  }

  const SYSTEM_PROMPT = `Tu es un outil d'information sur le droit du travail français pour LégalementVôtre.
Analyse ce contrat de travail (PDF texte ou scan photographié) et réponds UNIQUEMENT en JSON valide :
{
  "type_contrat": "CDI/CDD/Intérim/Autre",
  "points_conformes": ["point1", "point2"],
  "points_problematiques": [{"clause": "...", "risque": "...", "article": "..."}],
  "clauses_manquantes": ["clause1", "clause2"],
  "score_conformite": 0-100,
  "resume": "résumé en 2 phrases",
  "actions_recommandees": ["action1", "action2"],
  "lettres_suggerees": ["Contestation...", "Demande..."],
  "est_scan": false
}
Règles : cite les articles du Code du travail. Mets est_scan: true si le document est un scan photographié sans texte sélectionnable. UNIQUEMENT le JSON brut, zéro texte autour.`;

  async function analyzeContract() {
    if (!file) return;
    setLoading(true); setAnalysis(null); setError(null);
    setLoadingStep("Lecture du fichier...");
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej(new Error("Lecture impossible"));
        r.readAsDataURL(file);
      });

      // Étape 1 : essai PDF natif (texte sélectionnable)
      setLoadingStep("Analyse PDF texte en cours...");
      let parsed = null;
      try {
        const res1 = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: SYSTEM_PROMPT,
            messages: [{
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
                { type: "text", text: "Analyse ce contrat. Si tu ne peux pas lire le texte (scan), mets est_scan: true." }
              ]
            }]
          }),
        });
        const d1 = await res1.json();
        const raw1 = (d1.content?.map(b => b.text || "").join("") || "").replace(/```json|```/g, "").trim();
        const attempt = JSON.parse(raw1);
        if (attempt && attempt.type_contrat && attempt.est_scan !== true) parsed = attempt;
      } catch(_e) { /* on passe à la vision */ }

      // Étape 2 : fallback vision (scan ou PDF image)
      if (!parsed) {
        setLoadingStep("Scan détecté — conversion pages en images...");
        const images = await pdfToImages(base64);
        setLoadingStep(`Vision IA — lecture de ${images.length} page(s) scannée(s)...`);
        const res2 = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: SYSTEM_PROMPT,
            messages: [{
              role: "user",
              content: [
                ...images.map(img => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: img } })),
                { type: "text", text: "Voici les pages scannées du contrat. Lis le texte visible et analyse selon le droit du travail français 2026." }
              ]
            }]
          }),
        });
        const d2 = await res2.json();
        const raw2 = (d2.content?.map(b => b.text || "").join("") || "").replace(/```json|```/g, "").trim();
        parsed = JSON.parse(raw2);
      }

      setAnalysis(parsed);
    } catch (err) {
      setError("Analyse impossible. Vérifiez que le scan est bien orienté et lisible (résolution ≥ 150 dpi recommandée).");
    }
    setLoading(false); setLoadingStep("");
  }

  const scoreColor = analysis ? (analysis.score_conformite >= 75 ? "#16a34a" : analysis.score_conformite >= 50 ? "#f59e0b" : "#ef4444") : "#2563eb";
  const scoreLabel = analysis ? (analysis.score_conformite >= 75 ? "Contrat conforme" : analysis.score_conformite >= 50 ? "Améliorations conseillées" : "Contrat à risque") : "";

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, color: "var(--text-primary)", marginBottom: 8 }}>🔍 Analyse de Contrat IA</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>Uploadez votre contrat PDF — diagnostic juridique complet en quelques secondes</p>
      </div>

      {/* Confidentialité */}
      <Card style={{ background: "#f0fdf4", borderColor: "#bbf7d0", marginBottom: 20, padding: "12px 18px" }}>
        <div style={{ fontSize: 13, color: "#6ee7b7", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <span><strong>Confidentialité garantie :</strong> Votre PDF est transmis directement à l'IA pour analyse et n'est jamais stocké sur nos serveurs. Aucune donnée conservée.</span>
        </div>
      </Card>

      {/* Zone de drop */}
      {!analysis && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "#2563eb" : file ? "#16a34a" : "#bfdbfe"}`,
            borderRadius: 16, padding: "40px 24px", textAlign: "center", cursor: "pointer",
            background: dragging ? "rgba(79,131,255,0.05)" : file ? "rgba(16,185,129,0.05)" : "rgba(15,23,42,0.5)",
            transition: "all 0.2s", marginBottom: 20,
          }}>
          <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          <div style={{ fontSize: 48, marginBottom: 12 }}>{file ? "📄" : "⬆"}</div>
          {file ? (
            <>
              <div style={{ color: "#16a34a", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{file.name}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>{(file.size / 1024).toFixed(0)} Ko — Cliquez pour changer</div>
            </>
          ) : (
            <>
              <div style={{ color: "var(--text-secondary)", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Glissez votre contrat ici</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>ou cliquez pour sélectionner — PDF texte ou scan · max 20 Mo · jusqu'à 8 pages</div>
            </>
          )}
        </div>
      )}

      {error && <div style={{ color: "#f87171", background: "#fef2f2", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 16px", fontSize: 14, marginBottom: 16 }}>⚠ {error}</div>}

      {file && !analysis && (
        <Btn onClick={analyzeContract} disabled={loading} style={{ width: "100%", padding: "14px", fontSize: 16, marginBottom: 20 }}>
          {loading ? "⏳ Analyse en cours..." : "🔍 Analyser mon contrat"}
        </Btn>
      )}

      {loading && (
        <Card style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚖</div>
          <div style={{ color: "#2563eb", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Analyse juridique en cours...</div>
          <div style={{ color: "#16a34a", fontSize: 13, fontWeight: 600, minHeight: 20, marginBottom: 6 }}>{loadingStep}</div>
          <div style={{ color: "#64748b", fontSize: 12 }}>PDF texte · Scan · Vision IA · Code du travail 2026</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
            {[0,1,2,3,4].map(n => <div key={n} style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb", animation: `pulse 1s ${n*0.15}s infinite` }} />)}
          </div>
        </Card>
      )}

      {/* Résultats */}
      {analysis && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Score global */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center" }}>
            <Card style={{ textAlign: "center", padding: "24px 32px", minWidth: 160 }}>
              <div style={{ fontSize: 52, fontWeight: 900, color: scoreColor, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1 }}>
                {analysis.score_conformite}<span style={{ fontSize: 22 }}>/100</span>
              </div>
              <div style={{ color: scoreColor, fontSize: 13, fontWeight: 700, marginTop: 6 }}>{scoreLabel}</div>
              <div style={{ marginTop: 10, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 3 }}>
                <div style={{ height: 6, borderRadius: 6, background: scoreColor, width: `${analysis.score_conformite}%`, transition: "width 1s" }} />
              </div>
            </Card>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}><Badge color="#2563eb">{analysis.type_contrat}</Badge>{analysis.est_scan && <Badge color="#7c3aed">📷 Scan analysé par vision IA</Badge>}</div>
                <button onClick={() => { setAnalysis(null); setFile(null); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🔄 Nouvelle analyse</button>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{analysis.resume}</p>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Points conformes */}
            <Card>
              <h3 style={{ color: "#16a34a", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>✅ POINTS CONFORMES ({analysis.points_conformes?.length || 0})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(analysis.points_conformes || []).map((p, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, display: "flex", gap: 8 }}>
                    <span style={{ color: "#16a34a", flexShrink: 0 }}>✓</span>{p}
                  </div>
                ))}
              </div>
            </Card>

            {/* Clauses manquantes */}
            <Card>
              <h3 style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>⚠ CLAUSES MANQUANTES ({analysis.clauses_manquantes?.length || 0})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(analysis.clauses_manquantes || []).map((c, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, display: "flex", gap: 8 }}>
                    <span style={{ color: "#f59e0b", flexShrink: 0 }}>!</span>{c}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Points problématiques */}
          {(analysis.points_problematiques || []).length > 0 && (
            <Card style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
              <h3 style={{ color: "#f87171", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>🚨 CLAUSES PROBLÉMATIQUES ({analysis.points_problematiques.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {analysis.points_problematiques.map((p, i) => (
                  <div key={i} style={{ background: "#fef2f2", borderRadius: 10, padding: "12px 14px", borderLeft: "3px solid #ef4444" }}>
                    <div style={{ fontWeight: 700, color: "#fca5a5", fontSize: 14, marginBottom: 4 }}>{p.clause}</div>
                    <div style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}>{p.risque}</div>
                    {p.article && <Badge color="#ef4444">{p.article}</Badge>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions recommandées */}
          <Card style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>
            <h3 style={{ color: "#2563eb", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>🎯 ACTIONS RECOMMANDÉES</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(analysis.actions_recommandees || []).map((a, i) => (
                <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, display: "flex", gap: 10 }}>
                  <span style={{ color: "#2563eb", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{a}
                </div>
              ))}
            </div>
          </Card>

          {/* Lettres suggérées */}
          {(analysis.lettres_suggerees || []).length > 0 && (
            <Card>
              <h3 style={{ color: "#7c3aed", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>📄 LETTRES SUGGÉRÉES</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {analysis.lettres_suggerees.map((l, i) => (
                  <button key={i} onClick={() => setPage("letters")} style={{
                    background: "#f5f3ff", border: "1px solid rgba(139,92,246,0.3)",
                    color: "#8b5cf6", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer"
                  }}>
                    📄 {l} →
                  </button>
                ))}
              </div>
              <p style={{ color: "#64748b", fontSize: 12, marginTop: 10 }}>Cliquez pour accéder au générateur de lettres correspondant.</p>
            </Card>
          )}

          {/* Disclaimer */}
          <Card style={{ background: "#fef2f2", borderColor: "rgba(239,68,68,0.15)", padding: "12px 16px" }}>
            <p style={{ color: "#64748b", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: "#f87171" }}>⚠ Avertissement :</strong> Cette analyse est fournie à titre informatif uniquement. Elle ne constitue pas un avis juridique. Pour contester une clause ou engager une procédure, consultez un professionnel du droit.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

// ---- VEILLE ----
function NewsPage() {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, color: "var(--text-primary)", marginBottom: 8 }}>📰 Veille Juridique 2026</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>Les dernières réformes du droit du travail français</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {NEWS_2026.map((n, i) => (
          <Card key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <Badge color={n.color}>{n.badge}</Badge>
              <span style={{ color: "#64748b", fontSize: 12, fontWeight: 600 }}>{n.date}</span>
            </div>
            <h3 style={{ color: "var(--text-primary)", fontSize: 17, fontWeight: 800, marginBottom: 8, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{n.title}</h3>
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{n.desc}</p>
          </Card>
        ))}
      </div>
      <Card style={{ marginTop: 20, background: "#eff6ff", borderColor: "#bfdbfe" }}>
        <p style={{ color: "#64748b", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          📡 <strong style={{ color: "#2563eb" }}>Sources :</strong> Legifrance, Journal Officiel, Ministère du Travail, DARES. Informations mises à jour régulièrement.
        </p>
      </Card>
    </div>
  );
}

// ---- QUIZ ----
function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);

  function answer(isGood) {
    const next = [...answers, isGood];
    setAnswers(next);
    if (step + 1 >= QUIZ_QUESTIONS.length) { setDone(true); }
    else { setStep(step + 1); }
  }

  function reset() { setStep(0); setAnswers([]); setDone(false); }

  const score = answers.filter(Boolean).length;
  const total = QUIZ_QUESTIONS.length;
  const pct = Math.round((score / total) * 20);

  const scoreColor = pct >= 16 ? "#16a34a" : pct >= 10 ? "#f59e0b" : "#ef4444";
  const scoreLabel = pct >= 16 ? "Excellent employeur" : pct >= 10 ? "Des améliorations possibles" : "Situation préoccupante";

  if (done) return (
    <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 28, color: "var(--text-primary)", marginBottom: 24 }}>⚡ Résultat du Diagnostic</h2>
      <Card style={{ marginBottom: 20, padding: "32px" }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: scoreColor, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1 }}>{pct}<span style={{ fontSize: 32 }}>/20</span></div>
        <div style={{ color: scoreColor, fontSize: 18, fontWeight: 700, marginTop: 8 }}>{scoreLabel}</div>
        <div style={{ marginTop: 16, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 4 }}>
          <div style={{ height: 8, borderRadius: 8, background: scoreColor, width: `${(pct / 20) * 100}%`, transition: "width 1s" }} />
        </div>
      </Card>
      <div style={{ textAlign: "left", marginBottom: 20 }}>
        {answers.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>{a ? "✅" : "❌"}</span>
            <div>
              <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{QUIZ_QUESTIONS[i].q}</div>
              {!a && <div style={{ color: "#f59e0b", fontSize: 12, marginTop: 2 }}>→ Vérifiez vos droits sur ce point avec notre Chat IA</div>}
            </div>
          </div>
        ))}
      </div>
      <Btn onClick={reset} style={{ width: "100%" }}>Recommencer le quiz</Btn>
    </div>
  );

  const q = QUIZ_QUESTIONS[step];
  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, color: "var(--text-primary)", marginBottom: 8 }}>⚡ Quiz Diagnostic Employeur</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>5 questions pour évaluer vos droits au travail</p>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {QUIZ_QUESTIONS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < step ? "#2563eb" : i === step ? "rgba(79,131,255,0.4)" : "#f1f5f9" }} />
        ))}
      </div>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>QUESTION {step + 1} / {total}</div>
        <h3 style={{ color: "var(--text-primary)", fontSize: 18, lineHeight: 1.5, fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: 24 }}>{q.q}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => answer(true)} style={{ background: "#f0fdf4", border: "1px solid rgba(16,185,129,0.3)", color: "#16a34a", borderRadius: 12, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
            ✅ {q.good}
          </button>
          <button onClick={() => answer(false)} style={{ background: "#fef2f2", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: 12, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", textAlign: "left" }}>
            ❌ {q.bad}
          </button>
        </div>
      </Card>
    </div>
  );
}


// ---- URGENCES & DÉLAIS ----
function DeadlinesPage() {
  const [selected, setSelected] = useState(null);
  const [eventDate, setEventDate] = useState("");
  const [result, setResult] = useState(null);
  const [alerts, setAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lv_alerts") || "[]"); } catch(_e) { return []; }
  });

  function saveAlert(deadline, limitDate) {
    const newAlert = { id: Date.now(), label: deadline.label, limitDate, article: deadline.article };
    const updated = [...alerts.filter(a => a.label !== deadline.label), newAlert];
    setAlerts(updated);
    localStorage.setItem("lv_alerts", JSON.stringify(updated));
  }

  function removeAlert(id) {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated); localStorage.setItem("lv_alerts", JSON.stringify(updated));
  }

  function calcDeadline() {
    if (!selected || !eventDate) return;
    const d = DEADLINES.find(d => d.id === selected);
    const start = new Date(eventDate);
    const limit = new Date(start);
    if (d.unite === "jours") limit.setDate(limit.getDate() + d.delai);
    else if (d.unite === "mois") limit.setMonth(limit.getMonth() + d.delai);
    else if (d.unite === "ans") limit.setFullYear(limit.getFullYear() + d.delai);
    const today = new Date();
    const diffMs = limit - today;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    setResult({ deadline: d, limitDate: limit.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }), limitDateRaw: limit.toISOString().split("T")[0], daysLeft: diffDays, expired: diffDays < 0 });
  }

  const urgColors = { critique: "#ef4444", haute: "#f59e0b", moyenne: "#3b82f6" };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, color: "var(--text-primary)", marginBottom: 8 }}>🆘 Urgences & Délais Légaux</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>Calculez votre date limite pour agir — des droits perdus faute de délai, c'est trop fréquent</p>
      </div>

      {/* Alertes actives */}
      {alerts.length > 0 && (
        <Card style={{ marginBottom: 20, background: "#fef2f2", borderColor: "#fecaca" }}>
          <h3 style={{ color: "#f87171", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>🔔 VOS ALERTES ACTIVES</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.map(a => {
              const days = Math.ceil((new Date(a.limitDate) - new Date()) / 86400000);
              const col = days < 7 ? "#ef4444" : days < 30 ? "#f59e0b" : "#16a34a";
              return (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--input-bg)", borderRadius: 8, padding: "8px 12px" }}>
                  <div>
                    <span style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>{a.label}</span>
                    <span style={{ color: col, fontSize: 12, fontWeight: 700, marginLeft: 12 }}>{days < 0 ? "❌ EXPIRÉ" : `${days}j restants`}</span>
                  </div>
                  <button onClick={() => removeAlert(a.id)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <h3 style={{ color: "#2563eb", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>1. CHOISIR LA SITUATION</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 340, overflowY: "auto" }}>
            {DEADLINES.map(d => (
              <button key={d.id} onClick={() => { setSelected(d.id); setResult(null); }} style={{
                background: selected === d.id ? "rgba(79,131,255,0.15)" : "#f8fafc",
                border: `1px solid ${selected === d.id ? "rgba(79,131,255,0.5)" : "#e2e8f0"}`,
                borderRadius: 10, padding: "10px 14px", cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>{d.label}</span>
                  <span style={{ background: urgColors[d.urgence] + "33", color: urgColors[d.urgence], fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 7px" }}>{d.urgence.toUpperCase()}</span>
                </div>
                <span style={{ color: "#64748b", fontSize: 11 }}>{d.delai} {d.unite} · art. {d.article}</span>
              </button>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selected && (
            <Card>
              <h3 style={{ color: "#2563eb", fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>2. DATE DE L'ÉVÉNEMENT</h3>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>{DEADLINES.find(d => d.id === selected)?.desc}</p>
              <Input label="Date de l'événement (licenciement, mise à pied...)" value={eventDate} onChange={setEventDate} type="date" />
              <Btn onClick={calcDeadline} style={{ width: "100%" }}>Calculer ma date limite</Btn>
            </Card>
          )}

          {result && (
            <Card style={{ background: result.expired ? "rgba(239,68,68,0.08)" : result.daysLeft < 30 ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)", borderColor: result.expired ? "rgba(239,68,68,0.3)" : result.daysLeft < 30 ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: result.expired ? "#ef4444" : result.daysLeft < 30 ? "#f59e0b" : "#16a34a", marginBottom: 10 }}>
                {result.expired ? "⛔ DÉLAI EXPIRÉ" : result.daysLeft < 7 ? "🚨 URGENCE ABSOLUE" : result.daysLeft < 30 ? "⚠ AGISSEZ RAPIDEMENT" : "✅ VOUS AVEZ LE TEMPS"}
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: result.expired ? "#ef4444" : "#f1f5f9", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {result.expired ? "Délai dépassé" : `${result.daysLeft} jours`}
              </div>
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>Date limite : <strong style={{ color: "var(--text-secondary)" }}>{result.limitDate}</strong></div>
              <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>Art. {result.deadline.article} du Code du travail</div>
              {!result.expired && (
                <Btn onClick={() => saveAlert(result.deadline, result.limitDateRaw)} variant="success" style={{ width: "100%", marginTop: 14, fontSize: 13 }}>
                  🔔 Enregistrer cette alerte
                </Btn>
              )}
              {result.expired && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(239,68,68,0.12)", borderRadius: 8, fontSize: 12, color: "#fca5a5" }}>
                  Même expiré, consultez un professionnel du droit — certains délais peuvent être suspendus ou prorogés dans des cas particuliers.
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- TABLEAU DE BORD ----
function DashboardPage({ setPage }) {
  const [dossiers, setDossiers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lv_dossiers") || "[]"); } catch(_e) { return []; }
  });
  const [alerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lv_alerts") || "[]"); } catch(_e) { return []; }
  });
  const [preuves] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lv_preuves") || "[]"); } catch(_e) { return []; }
  });
  const [showNew, setShowNew] = useState(false);
  const [newDossier, setNewDossier] = useState({ titre: "", type: "Licenciement", statut: "En cours", notes: "" });

  function saveDossier() {
    if (!newDossier.titre) return;
    const d = { ...newDossier, id: Date.now(), date: new Date().toLocaleDateString("fr-FR") };
    const updated = [d, ...dossiers];
    setDossiers(updated); localStorage.setItem("lv_dossiers", JSON.stringify(updated));
    setShowNew(false); setNewDossier({ titre: "", type: "Licenciement", statut: "En cours", notes: "" });
  }

  function deleteDossier(id) {
    const updated = dossiers.filter(d => d.id !== id);
    setDossiers(updated); localStorage.setItem("lv_dossiers", JSON.stringify(updated));
  }

  const statutColors = { "En cours": "#f59e0b", "Résolu": "#16a34a", "En attente": "#3b82f6", "Abandonné": "#64748b" };
  const urgentAlerts = alerts.filter(a => Math.ceil((new Date(a.limitDate) - new Date()) / 86400000) < 30);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, color: "var(--text-primary)", marginBottom: 8 }}>📊 Mon Tableau de Bord</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>Suivi local de vos dossiers — tout reste sur votre appareil, rien n'est envoyé</p>
      </div>

      {/* Stats rapides */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { n: dossiers.length, l: "Dossiers ouverts", c: "#2563eb", icon: "📁" },
          { n: urgentAlerts.length, l: "Alertes urgentes", c: "#ef4444", icon: "🔔" },
          { n: preuves.length, l: "Preuves enregistrées", c: "#16a34a", icon: "🗂" },
          { n: dossiers.filter(d => d.statut === "Résolu").length, l: "Dossiers résolus", c: "#7c3aed", icon: "✅" },
        ].map(s => (
          <Card key={s.l} style={{ textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.c, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{s.n}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{s.l}</div>
          </Card>
        ))}
      </div>

      {/* Alertes urgentes */}
      {urgentAlerts.length > 0 && (
        <Card style={{ marginBottom: 20, background: "#fff7f7", borderColor: "#fecaca" }}>
          <h3 style={{ color: "#f87171", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>🚨 DÉLAIS URGENTS (&lt; 30 jours)</h3>
          {urgentAlerts.map(a => {
            const days = Math.ceil((new Date(a.limitDate) - new Date()) / 86400000);
            return (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{a.label}</span>
                <span style={{ color: days < 7 ? "#ef4444" : "#f59e0b", fontWeight: 700, fontSize: 13 }}>{days < 0 ? "EXPIRÉ" : `${days}j`}</span>
              </div>
            );
          })}
          <Btn onClick={() => setPage("deadlines")} variant="danger" style={{ width: "100%", marginTop: 12, fontSize: 13 }}>Voir tous les délais</Btn>
        </Card>
      )}

      {/* Dossiers */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ color: "var(--text-secondary)", fontSize: 16, fontWeight: 700 }}>📁 Mes Dossiers</h3>
        <Btn onClick={() => setShowNew(true)} style={{ fontSize: 13, padding: "8px 16px" }}>+ Nouveau dossier</Btn>
      </div>

      {showNew && (
        <Card style={{ marginBottom: 16, borderColor: "#60a5fa" }}>
          <h3 style={{ color: "#2563eb", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>NOUVEAU DOSSIER</h3>
          <Input label="Titre du dossier" value={newDossier.titre} onChange={v => setNewDossier(p => ({ ...p, titre: v }))} />
          <Input label="Type" value={newDossier.type} onChange={v => setNewDossier(p => ({ ...p, type: v }))} type="select" options={["Licenciement","Salaire","Harcèlement","Heures sup","Congés","Télétravail","Contrat","Autre"]} />
          <Input label="Statut" value={newDossier.statut} onChange={v => setNewDossier(p => ({ ...p, statut: v }))} type="select" options={["En cours","En attente","Résolu","Abandonné"]} />
          <Input label="Notes" value={newDossier.notes} onChange={v => setNewDossier(p => ({ ...p, notes: v }))} />
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={saveDossier} style={{ flex: 1 }}>Enregistrer</Btn>
            <Btn onClick={() => setShowNew(false)} variant="secondary" style={{ flex: 1 }}>Annuler</Btn>
          </div>
        </Card>
      )}

      {dossiers.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
          <div style={{ color: "#64748b", fontSize: 14 }}>Aucun dossier pour l'instant. Créez-en un pour suivre votre situation.</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {dossiers.map(d => (
            <Card key={d.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 700, fontSize: 15 }}>{d.titre}</span>
                    <span style={{ background: statutColors[d.statut] + "22", color: statutColors[d.statut], borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{d.statut}</span>
                    <Badge color="#2563eb">{d.type}</Badge>
                  </div>
                  {d.notes && <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0" }}>{d.notes}</p>}
                  <span style={{ color: "#475569", fontSize: 11 }}>Créé le {d.date}</span>
                </div>
                <button onClick={() => deleteDossier(d.id)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16, padding: "4px 8px" }}>🗑</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- JOURNAL DE PREUVES ----
function ProofsPage() {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lv_preuves") || "[]"); } catch(_e) { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], heure: "09:00", type: "Harcèlement", description: "", temoins: "", lieu: "" });
  const [search, setSearch] = useState("");

  const TYPES = ["Harcèlement moral","Pression illégale","Heure sup non payée","Refus congé injustifié","Insulte / humiliation","Non-respect contrat","Mise au placard","Autre"];

  function addEntry() {
    if (!form.description) return;
    const e = { ...form, id: Date.now(), createdAt: new Date().toISOString() };
    const updated = [e, ...entries];
    setEntries(updated); localStorage.setItem("lv_preuves", JSON.stringify(updated));
    setShowForm(false); setForm({ date: new Date().toISOString().split("T")[0], heure: "09:00", type: "Harcèlement moral", description: "", temoins: "", lieu: "" });
  }

  function deleteEntry(id) {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated); localStorage.setItem("lv_preuves", JSON.stringify(updated));
  }

  function exportPDF() {
    const txt = entries.map(e =>
      `📅 ${e.date} ${e.heure}\n📍 ${e.lieu} | 🏷 ${e.type}\n${e.description}${e.temoins ? "\n👥 Témoins : " + e.temoins : ""}\n${"─".repeat(50)}`
    ).join("\n\n");
    const full = `JOURNAL DE BORD — LégalementVôtre\nExporté le ${new Date().toLocaleDateString("fr-FR")}\n${"═".repeat(60)}\n\n${txt}\n\n⚖ Ce journal peut être présenté au Conseil de Prud'hommes.`;
    exportToPDF({ title: "Journal de Preuves", content: full, filename: "journal-preuves" });
  }

  const filtered = entries.filter(e => e.description.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, color: "var(--text-primary)", marginBottom: 8 }}>🗂 Journal de Preuves</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>Chaque fait noté ici peut devenir une preuve aux Prud'hommes — horodaté, local, exportable</p>
      </div>

      <Card style={{ background: "#f0fdf4", borderColor: "#bbf7d0", marginBottom: 20, padding: "12px 18px" }}>
        <div style={{ fontSize: 13, color: "#6ee7b7" }}>🔒 <strong>Stockage local uniquement.</strong> Vos notes ne quittent jamais votre appareil. En cas de procédure, exportez le PDF pour vos démarches.</div>
      </Card>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher dans vos notes..." style={{ flex: 1, background: "var(--input-bg)", border: "1px solid rgba(99,130,191,0.25)", borderRadius: 10, padding: "9px 14px", color: "var(--text-secondary)", fontSize: 14, outline: "none" }} />
        {entries.length > 0 && <Btn onClick={exportPDF} variant="success" style={{ fontSize: 13, padding: "9px 16px" }}>⬇ Exporter PDF</Btn>}
        <Btn onClick={() => setShowForm(true)} style={{ fontSize: 13, padding: "9px 16px" }}>+ Ajouter un fait</Btn>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20, borderColor: "#60a5fa" }}>
          <h3 style={{ color: "#2563eb", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>NOUVEAU FAIT À DOCUMENTER</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Date des faits" value={form.date} onChange={v => setForm(p => ({ ...p, date: v }))} type="date" />
            <Input label="Heure approximative" value={form.heure} onChange={v => setForm(p => ({ ...p, heure: v }))} type="time" />
          </div>
          <Input label="Type d'incident" value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))} type="select" options={TYPES} />
          <Input label="Lieu" value={form.lieu} onChange={v => setForm(p => ({ ...p, lieu: v }))} />
          <Input label="Description précise des faits (qui, quoi, comment)" value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} />
          <Input label="Témoins éventuels (initiales suffisent)" value={form.temoins} onChange={v => setForm(p => ({ ...p, temoins: v }))} />
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={addEntry} style={{ flex: 1 }}>Enregistrer</Btn>
            <Btn onClick={() => setShowForm(false)} variant="secondary" style={{ flex: 1 }}>Annuler</Btn>
          </div>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
          <div style={{ color: "#64748b", fontSize: 14 }}>Aucun fait enregistré. Notez chaque incident dès qu'il se produit — la mémoire s'efface, les écrits restent.</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ color: "#64748b", fontSize: 13 }}>{filtered.length} fait(s) documenté(s)</div>
          {filtered.map(e => (
            <Card key={e.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}>📅 {e.date} à {e.heure}</span>
                    <Badge color="#7c3aed">{e.type}</Badge>
                  </div>
                  {e.lieu && <div style={{ color: "#64748b", fontSize: 12, marginBottom: 4 }}>📍 {e.lieu}</div>}
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, margin: "6px 0" }}>{e.description}</p>
                  {e.temoins && <div style={{ color: "#64748b", fontSize: 12 }}>👁 Témoins : {e.temoins}</div>}
                </div>
                <button onClick={() => deleteEntry(e.id)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16 }}>🗑</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- SYNDICATS & AIDE JURIDICTIONNELLE ----
function SupportPage() {
  const [tab, setTab] = useState("syndicats");

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, color: "var(--text-primary)", marginBottom: 8 }}>🤝 Aide & Soutien Gratuit</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>Syndicats, aide juridictionnelle, défenseur des droits — tous gratuits et accessibles</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["syndicats","🏛 Syndicats"],["aide","⚖ Aide juridictionnelle"],["are","💼 Simulateur ARE"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: tab === id ? "linear-gradient(135deg,#1d4ed8,#4f46e5)" : "#f8fafc",
            border: "none", borderRadius: 10, padding: "9px 16px", color: tab === id ? "#fff" : "#94a3b8",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>{label}</button>
        ))}
      </div>

      {tab === "syndicats" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ background: "#eff6ff", borderColor: "#bfdbfe", padding: "12px 18px" }}>
            <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>💡 <strong style={{ color: "var(--text-secondary)" }}>Le saviez-vous ?</strong> Vous pouvez contacter un syndicat <strong style={{ color: "#2563eb" }}>sans être adhérent</strong>. La plupart offrent une première consultation gratuite.</p>
          </Card>
          {SYNDICATS.map(s => (
            <Card key={s.nom}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 900, fontSize: 20, color: s.couleur, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{s.nom}</span>
                    <span style={{ color: "#64748b", fontSize: 12 }}>{s.fullName}</span>
                  </div>
                  <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 8px", lineHeight: 1.5 }}>{s.desc}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "#64748b", fontSize: 12 }}>📞 {s.tel}</span>
                  </div>
                </div>
                <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ background: s.couleur + "22", color: s.couleur, border: `1px solid ${s.couleur}44`, borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                  Site officiel →
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "aide" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card style={{ background: "#f0fdf4", borderColor: "#bbf7d0", padding: "12px 18px" }}>
            <p style={{ color: "#6ee7b7", fontSize: 13, margin: 0 }}>✅ <strong>Ces ressources sont 100% gratuites.</strong> L'aide juridictionnelle couvre les frais de justice si vos revenus sont modestes.</p>
          </Card>
          {AIDE_JURIDICTIONNELLE.map(a => (
            <Card key={a.nom}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{a.icon}</div>
                  <div style={{ fontWeight: 700, color: "var(--text-secondary)", fontSize: 15, marginBottom: 6 }}>{a.nom}</div>
                  <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5, margin: 0 }}>{a.desc}</p>
                </div>
                <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ background: "#dbeafe", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", marginLeft: 16 }}>
                  Accéder →
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "are" && <ARESimulator />}
    </div>
  );
}

// ---- SIMULATEUR ARE ----
function ARESimulator() {
  const [inputs, setInputs] = useState({ salaireBrut: "", dureeContrat: "", motifRupture: "Licenciement", age: "", anciennete: "" });
  const [result, setResult] = useState(null);

  function calculate() {
    const s = parseFloat(inputs.salaireBrut) || 0;
    const d = parseFloat(inputs.dureeContrat) || 0;
    const age = parseFloat(inputs.age) || 30;
    const motif = inputs.motifRupture;

    if (!["Licenciement","Rupture conventionnelle","Fin CDD","Démission pour motif légitime"].includes(motif)) {
      setResult({ error: "La démission volontaire sans motif légitime n'ouvre généralement pas droit aux allocations chômage." }); return;
    }
    if (d < 4) { setResult({ error: "Il faut au minimum 4 mois (130 jours) de travail sur les 24 derniers mois pour ouvrir des droits ARE." }); return; }

    // SJR (Salaire Journalier de Référence)
    const sjr = (s * d) / (d * 30.42);
    // Allocation journalière (le plus favorable entre 40.4% SJR + 12.12€ ou 57% SJR)
    const aj1 = sjr * 0.404 + 12.12;
    const aj2 = sjr * 0.57;
    const aj = Math.max(aj1, aj2);
    const ajMin = Math.max(aj, 31.97);
    const ajFinal = Math.min(ajMin, sjr * 0.75);

    // Durée d'indemnisation
    let dureeIndemnisation;
    if (age >= 55) dureeIndemnisation = Math.min(d * 1, 913); // max 30 mois (55+)
    else dureeIndemnisation = Math.min(d, 730); // max 24 mois

    // Différé de carence (congés payés + carence fixe)
    const carence = 7 + Math.round((s * 0.1 * Math.min(parseFloat(inputs.anciennete) || 0, 10)) / ajFinal);

    setResult({
      sjr: sjr.toFixed(2),
      ajJour: ajFinal.toFixed(2),
      ajMois: (ajFinal * 30.42).toFixed(0),
      duree: dureeIndemnisation,
      carence: carence,
      dateDebut: `Environ ${carence} jours après la fin de contrat`,
    });
  }

  if (result?.error) return (
    <Card style={{ background: "#fff7f7", borderColor: "#fecaca" }}>
      <h3 style={{ color: "#2563eb", fontSize: 14, fontWeight: 700, marginBottom: 16 }}>💼 Simulateur Allocation Chômage (ARE)</h3>
      <div style={{ color: "#f87171", fontSize: 14, padding: 16, background: "#fef2f2", borderRadius: 10 }}>⚠ {result.error}</div>
      <Btn onClick={() => setResult(null)} variant="secondary" style={{ marginTop: 12 }}>Recalculer</Btn>
    </Card>
  );

  return (
    <Card>
      <h3 style={{ color: "#2563eb", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>💼 Simulateur Allocation Chômage (ARE) 2026</h3>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>Estimation basée sur les règles Unédic 2026 — à confirmer avec France Travail</p>
      {!result ? (
        <>
          <Input label="Salaire mensuel brut moyen (€)" value={inputs.salaireBrut} onChange={v => setInputs(p => ({...p, salaireBrut: v}))} type="number" />
          <Input label="Durée de travail ouvrant droits (mois)" value={inputs.dureeContrat} onChange={v => setInputs(p => ({...p, dureeContrat: v}))} type="number" />
          <Input label="Motif de rupture" value={inputs.motifRupture} onChange={v => setInputs(p => ({...p, motifRupture: v}))} type="select" options={["Licenciement","Rupture conventionnelle","Fin CDD","Démission pour motif légitime","Démission volontaire"]} />
          <Input label="Votre âge" value={inputs.age} onChange={v => setInputs(p => ({...p, age: v}))} type="number" />
          <Input label="Ancienneté dans l'entreprise (années)" value={inputs.anciennete} onChange={v => setInputs(p => ({...p, anciennete: v}))} type="number" />
          <Btn onClick={calculate} style={{ width: "100%", marginTop: 8 }}>Calculer mes droits ARE</Btn>
        </>
      ) : (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              ["Allocation / jour", result.ajJour + " €", "#16a34a"],
              ["Allocation / mois", result.ajMois + " €", "#16a34a"],
              ["Durée maximale", Math.floor(result.duree / 30) + " mois", "#2563eb"],
              ["Différé de carence", result.carence + " jours", "#f59e0b"],
            ].map(([l, v, c]) => (
              <div key={l} style={{ background: "var(--input-bg)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>{l}</div>
                <div style={{ color: c, fontSize: 22, fontWeight: 900, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#eff6ff", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#64748b", lineHeight: 1.6, marginBottom: 12 }}>
            📊 SJR calculé : <strong style={{ color: "var(--text-secondary)" }}>{result.sjr} €/j</strong> · Premier versement : <strong style={{ color: "var(--text-secondary)" }}>{result.dateDebut}</strong>
          </div>
          <div style={{ background: "#fff7f7", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#64748b" }}>
            ⚠ Simulation indicative. Les droits réels sont calculés par France Travail selon votre situation précise.
          </div>
          <Btn onClick={() => setResult(null)} variant="secondary" style={{ marginTop: 12, width: "100%" }}>Nouvelle simulation</Btn>
        </div>
      )}
    </Card>
  );
}

// ---- SUPPORT MULTILINGUE ----
function MultilingualPage() {
  const [lang, setLang] = useState("ar");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const LANG_PROMPTS = {
    ar: "أنت محامٍ متخصص في قانون العمل الفرنسي. أجب باللغة العربية بشكل واضح ومبسط. اذكر المواد القانونية المعنية.",
    pt: "Você é um advogado especialista em direito do trabalho francês. Responda em português de forma clara e simples. Cite os artigos legais relevantes.",
    en: "You are a lawyer specializing in French labor law. Answer in English clearly and simply. Mention relevant legal articles.",
  };

  const EXAMPLES = {
    ar: ["ما هي حقوقي إذا تم فصلي؟", "كيف أحسب ساعات العمل الإضافية؟", "ما هو الحد الأدنى للأجور في فرنسا 2026؟", "هل يمكن لصاحب العمل رفض إجازتي؟"],
    pt: ["Quais são meus direitos se for demitido?", "Como calcular horas extras?", "Qual é o salário mínimo na França 2026?", "Posso recusar o teletrabalho?"],
    en: ["What are my rights if I'm fired?", "How are overtime hours calculated?", "What is the minimum wage in France 2026?", "Can my employer refuse my holiday request?"],
  };

  async function ask(q) {
    const text = q || question; if (!text.trim()) return;
    setQuestion(text); setLoading(true); setAnswer("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: LANG_PROMPTS[lang],
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      setAnswer(data.content?.map(b => b.text || "").join("") || "");
    } catch(_e) { setAnswer("Erreur de connexion / Connection error / خطأ في الاتصال"); }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, color: "var(--text-primary)", marginBottom: 8 }}>🌍 Support Multilingue</h2>
        <p style={{ color: "#64748b", fontSize: 14 }}>Posez vos questions en arabe, portugais ou anglais — réponses dans votre langue</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {Object.entries(LANGUAGES).filter(([k]) => k !== "fr").map(([k, v]) => (
          <button key={k} onClick={() => { setLang(k); setAnswer(""); setQuestion(""); }} style={{
            background: lang === k ? "linear-gradient(135deg,#1d4ed8,#4f46e5)" : "#f8fafc",
            border: lang === k ? "none" : "1px solid rgba(99,130,191,0.25)",
            borderRadius: 10, padding: "10px 20px", color: lang === k ? "#fff" : "#94a3b8",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>{v.flag} {v.name}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {(EXAMPLES[lang] || []).map(ex => (
          <button key={ex} onClick={() => ask(ex)} style={{ background: "#eff6ff", border: "1px solid rgba(79,131,255,0.25)", color: "#2563eb", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {ex}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && ask()}
          placeholder={lang === "ar" ? "اكتب سؤالك هنا..." : lang === "pt" ? "Digite sua pergunta..." : "Type your question..."}
          dir={lang === "ar" ? "rtl" : "ltr"}
          style={{ flex: 1, background: "var(--input-bg)", border: "1px solid rgba(99,130,191,0.25)", borderRadius: 12, padding: "12px 16px", color: "var(--text-secondary)", fontSize: 14, outline: "none" }} />
        <Btn onClick={() => ask()} disabled={loading || !question.trim()}>{loading ? "..." : "→"}</Btn>
      </div>

      {loading && <div style={{ color: "#2563eb", fontSize: 14, textAlign: "center", padding: 20 }}>⏳ Chargement...</div>}
      {answer && (
        <Card>
          <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>⚖ LÉGALEMENTVÔTRE · {LANGUAGES[lang]?.name.toUpperCase()}</div>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.8, margin: 0, direction: lang === "ar" ? "rtl" : "ltr", textAlign: lang === "ar" ? "right" : "left" }}>{answer}</p>
        </Card>
      )}
    </div>
  );
}



// ============================================================
// NOUVELLES PAGES PRIORITAIRES
// ============================================================

// ─── 1. LETTRES AMÉLIORÉES (variantes + checklist + PDF) ───
// (Les améliorations sont intégrées dans LettersPage existante via LetterGenerator)

function RightsNavigatorPage({ setPage }) {
  const [theme, setTheme] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [aiAnswer, setAiAnswer] = useState({});
  const [aiLoading, setAiLoading] = useState(null);
  const [easyMode, setEasyMode] = useState(false);

  async function getDetail(topic) {
    if (aiAnswer[topic.q]) return;
    setAiLoading(topic.q);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `Tu es un expert en droit du travail français pour LégalementVôtre. Réponds en 4 parties claires :
**📖 La règle** : la règle juridique en 1-2 phrases simples
**✅ Concrètement** : ce que ça veut dire pour le salarié en pratique
**⚠ Attention** : une mise en garde ou exception importante
**🔗 Source** : article(s) du Code du travail
${easyMode ? "IMPORTANT : langage ultra simple, zéro jargon, des métaphores du quotidien, maximum 100 mots par section." : ""}`,
          messages: [{ role: "user", content: topic.q }]
        }),
      });
      const data = await res.json();
      setAiAnswer(p => ({ ...p, [topic.q]: data.content?.map(b=>b.text||"").join("")||"" }));
    } catch(_e) { setAiAnswer(p => ({ ...p, [topic.q]: "Explication indisponible." })); }
    setAiLoading(null);
  }

  const t = theme ? RIGHTS_THEMES.find(r => r.id === theme) : null;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 24, color: "var(--text-primary)", marginBottom: 8 }}>📖 Mes Droits au Quotidien</h2>
            <p style={{ color: "#64748b", fontSize: 14 }}>Comprendre ses droits simplement, sans jargon</p>
          </div>
          <button onClick={() => setEasyMode(!easyMode)} style={{
            background: easyMode ? "rgba(16,185,129,0.2)" : "#f8fafc",
            border: `1px solid ${easyMode ? "rgba(16,185,129,0.5)" : "#e2e8f0"}`,
            color: easyMode ? "#16a34a" : "#64748b", borderRadius: 10, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            {easyMode ? "✅ Mode simplifié ON" : "💡 Mode j'y connais rien"}
          </button>
        </div>
      </div>

      {!theme ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
          {RIGHTS_THEMES.map(r => (
            <Card key={r.id} onClick={() => setTheme(r.id)} style={{ cursor: "pointer", borderLeft: `3px solid ${r.color}` }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{r.icon}</div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 16, marginBottom: 4 }}>{r.title}</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>{r.topics.length} questions clés</div>
              <div style={{ color: r.color, fontSize: 13, fontWeight: 700, marginTop: 8 }}>Explorer →</div>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <Btn variant="secondary" onClick={() => { setTheme(null); setExpanded(null); }}>← Retour</Btn>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 20, color: "var(--text-primary)", margin: 0 }}>{t.icon} {t.title}</h3>
          </div>

          {easyMode && (
            <Card style={{ background: "#f0fdf4", borderColor: "#bbf7d0", marginBottom: 16, padding: "10px 16px" }}>
              <div style={{ color: "#6ee7b7", fontSize: 13 }}>💡 <strong>Mode simplifié activé</strong> — explications sans jargon, avec exemples concrets</div>
            </Card>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {t.topics.map((topic, i) => (
              <Card key={i} style={{ cursor: "pointer" }} onClick={() => { const k = topic.q; setExpanded(expanded === k ? null : k); if (expanded !== k) getDetail(topic); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "var(--text-secondary)", fontSize: 15 }}>{topic.q}</div>
                    {expanded !== topic.q && (
                      <p style={{ color: "#64748b", fontSize: 13, margin: "6px 0 0", lineHeight: 1.5 }}>{topic.simple.slice(0,80)}...</p>
                    )}
                  </div>
                  <span style={{ color: t.color, fontSize: 18, marginLeft: 12 }}>{expanded === topic.q ? "▲" : "▼"}</span>
                </div>

                {expanded === topic.q && (
                  <div style={{ marginTop: 14, borderTop: "1px solid rgba(99,130,191,0.15)", paddingTop: 14 }}>
                    <div style={{ background: "#eff6ff", borderRadius: 10, padding: "12px 14px", marginBottom: 12, borderLeft: `3px solid ${t.color}` }}>
                      <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{topic.simple}</p>
                    </div>
                    {aiLoading === topic.q ? (
                      <div style={{ color: "#2563eb", fontSize: 13, textAlign: "center", padding: 16 }}>⏳ Explication détaillée en cours...</div>
                    ) : aiAnswer[topic.q] ? (
                      <div style={{ background: "var(--input-bg)", borderRadius: 10, padding: "14px 16px" }}>
                        <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>🤖 ANALYSE DÉTAILLÉE {easyMode ? "· MODE SIMPLIFIÉ" : ""}</div>
                        <pre style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}
                          dangerouslySetInnerHTML={{ __html: aiAnswer[topic.q].replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e2e8f0">$1</strong>') }} />
                      </div>
                    ) : null}
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={e => { e.stopPropagation(); setPage("chat"); }}
                        style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        💬 Poser une question
                      </button>
                      <button onClick={e => { e.stopPropagation(); setPage("letters"); }}
                        style={{ background: "#f0fdf4", border: "1px solid rgba(16,185,129,0.3)", color: "#16a34a", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        📄 Générer une lettre
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



// ============================================================
// 1. LETTRES V2 — variantes soft/MDM + checklist + 60 templates
// ============================================================

const LETTERS_FULL = [
  // SALAIRE
  { id:1,  cat:"Salaire",      icon:"💰", title:"Contestation heures supplémentaires",       fields:["nom","employeur","heures","periode","convention"],  checklist:["Bulletins de paie des mois concernés","Planning ou relevé d'heures","Emails ou SMS prouvant les heures effectuées"],  destinataire:"RH / Direction" },
  { id:2,  cat:"Salaire",      icon:"💰", title:"Réclamation 13ème mois",                     fields:["nom","employeur","annee","montant"],                checklist:["Contrat de travail mentionnant le 13e mois","Accord d'entreprise ou convention collective","Bulletin de paie décembre"],  destinataire:"RH" },
  { id:3,  cat:"Salaire",      icon:"💰", title:"Demande d'augmentation motivée",             fields:["nom","employeur","poste","anciennete","justification"], checklist:["Dernier entretien annuel","Comparatif salaires du marché","Bilan de vos réalisations"],  destinataire:"Responsable RH / N+1" },
  { id:4,  cat:"Salaire",      icon:"💰", title:"Contestation retenue sur salaire",           fields:["nom","employeur","montant","motif"],                checklist:["Bulletin de paie concerné","Contrat de travail"],  destinataire:"RH" },
  { id:5,  cat:"Salaire",      icon:"💰", title:"Demande prime d'ancienneté",                 fields:["nom","employeur","anciennete","convention"],        checklist:["Convention collective","Contrat de travail","Bulletins de paie récents"],  destinataire:"RH" },
  { id:6,  cat:"Salaire",      icon:"💰", title:"Rappel de salaire non versé",                fields:["nom","employeur","mois","montant"],                 checklist:["Relevé de compte bancaire","Bulletins de paie"],  destinataire:"RH / Direction" },
  // CONGÉS
  { id:7,  cat:"Congés",       icon:"🌴", title:"Contestation refus de congés",               fields:["nom","employeur","dateDebut","dateFin","motifRefus"], checklist:["Demande de congés écrite","Réponse de refus de l'employeur","Convention collective sur les congés"],  destinataire:"RH / Manager" },
  { id:8,  cat:"Congés",       icon:"🌴", title:"Demande solde RTT",                          fields:["nom","employeur","nbJours","annee"],                checklist:["Accord RTT de l'entreprise","Relevé compteur RTT"],  destinataire:"RH" },
  { id:9,  cat:"Congés",       icon:"🌴", title:"Congé parental d'éducation",                 fields:["nom","employeur","dateNaissance","duree"],          checklist:["Acte de naissance ou adoption","Justificatif ancienneté 1 an"],  destinataire:"RH" },
  { id:10, cat:"Congés",       icon:"🌴", title:"Congé sans solde",                           fields:["nom","employeur","dateDebut","dateFin","motif"],    checklist:["Justificatif du motif si disponible"],  destinataire:"RH / Direction" },
  { id:11, cat:"Congés",       icon:"🌴", title:"Congé pour événement familial",              fields:["nom","employeur","evenement","date"],               checklist:["Justificatif (acte de mariage, décès, naissance)"],  destinataire:"RH" },
  { id:12, cat:"Congés",       icon:"🌴", title:"Report congés imposés par l'employeur",      fields:["nom","employeur","dateInitiale","dateNouvelle"],    checklist:["Demande initiale de congés acceptée","Notification de report"],  destinataire:"RH" },
  // LICENCIEMENT
  { id:13, cat:"Licenciement", icon:"⚖", title:"Contestation licenciement abusif",          fields:["nom","employeur","dateLettre","motifIndique","anciennete"], checklist:["Lettre de licenciement","Contrat de travail","Bulletins de paie 12 derniers mois","Preuves du travail accompli"],  destinataire:"Conseil de Prud'hommes" },
  { id:14, cat:"Licenciement", icon:"⚖", title:"Demande motif licenciement économique",     fields:["nom","employeur","dateNotification"],               checklist:["Lettre de licenciement","Plan de sauvegarde de l'emploi si applicable","Offres de reclassement reçues"],  destinataire:"RH / Direction" },
  { id:15, cat:"Licenciement", icon:"⚖", title:"Contester une mise à pied conservatoire",  fields:["nom","employeur","dateMap","motif"],                checklist:["Notification de mise à pied","Témoignages écrits","Planning de présence"],  destinataire:"RH" },
  { id:16, cat:"Licenciement", icon:"⚖", title:"Harcèlement moral — alerte employeur",     fields:["nom","employeur","faits","dates","temoins"],        checklist:["Journal de bord des faits","Témoignages écrits","Arrêts maladie liés","Emails ou SMS"],  destinataire:"Direction / RH / CSE" },
  { id:17, cat:"Licenciement", icon:"⚖", title:"Signalement harcèlement sexuel",           fields:["nom","employeur","faits","dates","temoins"],        checklist:["Journal des faits daté","Témoins","Captures d'écran","Certificat médical si applicable"],  destinataire:"Direction / RH / CSE / Inspection du Travail" },
  { id:18, cat:"Licenciement", icon:"⚖", title:"Prise d'acte de rupture du contrat",       fields:["nom","employeur","manquements","dates"],            checklist:["Preuves des manquements graves","Mises en demeure préalables","Bulletins de paie","Arrêts maladie"],  destinataire:"Direction (LRAR)" },
  // TÉLÉTRAVAIL
  { id:19, cat:"Télétravail",  icon:"🏠", title:"Demande accord télétravail 2026",           fields:["nom","employeur","pourcentage","materiel"],         checklist:["Accord d'entreprise ou charte télétravail","Attestation assurance habitation"],  destinataire:"RH / Manager" },
  { id:20, cat:"Télétravail",  icon:"🏠", title:"Remboursement frais télétravail",           fields:["nom","employeur","mois","montant"],                 checklist:["Justificatifs de frais internet/électricité","Accord télétravail","Bulletins de paie"],  destinataire:"RH" },
  { id:21, cat:"Télétravail",  icon:"🏠", title:"Refus de retour au bureau imposé",          fields:["nom","employeur","motif","dateImposee"],            checklist:["Accord télétravail en vigueur","Notification employeur de retour"],  destinataire:"RH / Direction" },
  { id:22, cat:"Télétravail",  icon:"🏠", title:"Demande télétravail pour handicap",         fields:["nom","employeur","typeHandicap","besoins"],         checklist:["Reconnaissance RQTH","Avis médecin du travail","Accord de principe si existant"],  destinataire:"RH / Médecin du travail" },
  // CONTRAT
  { id:23, cat:"Contrat",      icon:"📋", title:"Clause de non-concurrence abusive",         fields:["nom","employeur","clause","duree","secteur"],       checklist:["Contrat de travail signé","Analyse de la clause","Exemples de jurisprudence similaire"],  destinataire:"Direction (LRAR)" },
  { id:24, cat:"Contrat",      icon:"📋", title:"Requalification CDD en CDI",                fields:["nom","employeur","nbCdd","periode"],                checklist:["Tous les CDD signés","Bulletins de paie correspondants","Preuves de continuité du travail"],  destinataire:"Conseil de Prud'hommes" },
  { id:25, cat:"Contrat",      icon:"📋", title:"Contestation clause de mobilité",           fields:["nom","employeur","clauseOrigine","lieuImpose"],     checklist:["Contrat de travail","Notification de mutation","Accord ou refus écrit"],  destinataire:"RH (LRAR)" },
  { id:26, cat:"Contrat",      icon:"📋", title:"Refus d'avenant défavorable",               fields:["nom","employeur","modification","dateProposee"],    checklist:["Contrat actuel","Avenant proposé","Comparatif conditions"],  destinataire:"RH" },
  // RUPTURE
  { id:27, cat:"Rupture",      icon:"🤝", title:"Demande rupture conventionnelle",           fields:["nom","employeur","anciennete","salaireMoyen"],      checklist:["Contrat de travail","3 derniers bulletins de paie","Convention collective"],  destinataire:"RH / Direction" },
  { id:28, cat:"Rupture",      icon:"🤝", title:"Démission pour faute grave de l'employeur", fields:["nom","employeur","faitsReproches","dates"],         checklist:["Preuves des fautes (emails, attestations)","Journal de bord","Mises en demeure"],  destinataire:"Direction (LRAR)" },
  { id:29, cat:"Rupture",      icon:"🤝", title:"Contestation solde de tout compte",         fields:["nom","employeur","montantsContestes","dates"],      checklist:["Solde de tout compte reçu","Bulletins de paie","Calcul de vos droits"],  destinataire:"RH (LRAR, dans 6 mois)" },
  { id:30, cat:"Rupture",      icon:"🤝", title:"Demande certificat de travail",             fields:["nom","employeur","dateFinContrat"],                 checklist:["Contrat de travail","Preuve de fin de contrat"],  destinataire:"RH" },
  // DISCRIMINATION
  { id:31, cat:"Discrimination",icon:"🛡",title:"Signalement discrimination syndicale",     fields:["nom","employeur","faits","dates"],                  checklist:["Preuves de discrimination (primes, promotions refusées)","Témoignages","Activité syndicale documentée"],  destinataire:"Inspection du Travail / Défenseur des droits" },
  { id:32, cat:"Discrimination",icon:"🛡",title:"Discrimination à l'embauche",              fields:["nom","employeur","faits","motif"],                  checklist:["Offre d'emploi","Refus écrit","Profil comparable retenu"],  destinataire:"Défenseur des droits / CPH" },
  { id:33, cat:"Discrimination",icon:"🛡",title:"Discrimination liée au handicap",          fields:["nom","employeur","faits","dates"],                  checklist:["RQTH ou certificat médical","Refus d'aménagement","Preuves"],  destinataire:"Inspection du Travail / Défenseur des droits" },
  // SANTÉ / SÉCURITÉ
  { id:34, cat:"Santé",        icon:"🏥", title:"Signalement danger grave et imminent",      fields:["nom","employeur","danger","lieu","date"],           checklist:["Description précise du danger","Témoins","Photos si possible","Registre DAL"],  destinataire:"Direction / CSE / Inspection du Travail" },
  { id:35, cat:"Santé",        icon:"🏥", title:"Demande aménagement de poste",              fields:["nom","employeur","besoin","prescription"],          checklist:["Avis du médecin du travail","RQTH si applicable","Accord de principe"],  destinataire:"RH / Médecin du travail" },
  { id:36, cat:"Santé",        icon:"🏥", title:"Contestation inaptitude professionnelle",   fields:["nom","employeur","dateAvis","postesRefuses"],       checklist:["Avis d'inaptitude","Offres de reclassement reçues ou absence","Convention collective"],  destinataire:"Médecin du travail / CPH" },
  // PRUD'HOMMES
  { id:37, cat:"Prud'hommes",  icon:"🏛", title:"Saisine du Conseil de Prud'hommes",        fields:["nom","employeur","demande","montant","anciennete"], checklist:["Contrat de travail","Bulletins de paie","Lettre de licenciement","Toute pièce prouvant le préjudice"],  destinataire:"Greffe du CPH" },
  { id:38, cat:"Prud'hommes",  icon:"🏛", title:"Demande de conciliation prud'homale",      fields:["nom","employeur","litige","montant"],               checklist:["Dossier complet","Calcul détaillé des sommes réclamées"],  destinataire:"Bureau de conciliation CPH" },
];

function genLetterBody(template, values, mode) {
  const today = new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
  const isMDM = mode === "mdm";
  const headers = {
    intro_soft: `Je me permets de vous contacter au sujet de ${template.title.toLowerCase()} afin de trouver ensemble une solution amiable.`,
    intro_mdm: `Par la présente lettre recommandée avec accusé de réception, je vous mets en demeure de régulariser la situation relative à ${template.title.toLowerCase()}, conformément aux dispositions légales et conventionnelles applicables.`,
  };
  const fieldLines = Object.entries(values).filter(([k,v])=>v&&k!=="nom"&&k!=="employeur")
    .map(([k,v])=>`- ${FIELD_LABELS[k]||k} : ${v}`).join("\n");
  const closing_soft = `Dans l'attente d'une réponse favorable, je reste disponible pour en discuter de vive voix.\n\nCordialement,\n\n${values.nom||"[Votre nom]"}`;
  const closing_mdm = `À défaut de réponse sous 8 jours ouvrés, je me verrai contraint(e) de saisir les instances compétentes : Inspection du Travail, Conseil de Prud'hommes, et tout autre organisme utile à la défense de mes droits.\n\nVeuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n${values.nom||"[Votre nom]"}\n[Signature]`;
  return `${values.nom||"[Votre nom]"}\n[Votre adresse]\n[Code postal, Ville]\n[Votre email]\n\n${values.employeur||"[Employeur]"}\n[Adresse]\n\nFait à [Ville], le ${today}\n\nObjet : ${isMDM?"MISE EN DEMEURE — ":""}${template.title}\n${isMDM?"Envoi en recommandé avec AR\n":""}\nMadame, Monsieur,\n\n${isMDM?headers.intro_mdm:headers.intro_soft}\n\n${fieldLines}\n\n${isMDM?closing_mdm:closing_soft}\n\n---\n⚖ Généré par LégalementVôtre — Informatif uniquement. Consultez un professionnel du droit pour votre situation.`;
}

// ============================================================
// 2. ANALYSE DOCUMENTS — mails, avant de signer, Word
// ============================================================

// ════════════════════════════════════════════════════════════════
// ANALYSE MULTI-FICHES DE PAIE
// ════════════════════════════════════════════════════════════════
function MultiFichesAnalyzer({ setPage, PROMPTS, safeParseJSON, sanitizeFicheResult }) {
  const [fiches, setFiches]         = useState([]); // { id, name, text, status, data, error, note, ccOverride }
  const [contrats, setContrats]     = useState([]);
  const [analyzing, setAnalyzing]   = useState(false);
  const [progress, setProgress]     = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null); // seconds estimated
  const [quotaHit, setQuotaHit]     = useState(false);
  const [waitCountdown, setWaitCountdown] = useState(0);
  const [synthese, setSynthese]     = useState(null);
  const [savedAnalysis, setSavedAnalysis] = useState(null); // persisted snapshot
  const [showDetail, setShowDetail] = useState(null);
  const [editingNote, setEditingNote] = useState(null); // fiche id being annotated
  const [noteText, setNoteText]     = useState('');
  const [showCCPicker, setShowCCPicker] = useState(null); // fiche id for CC picker
  const [manualCC, setManualCC]     = useState(null);     // user-selected CC override
  const [activeTab, setActiveTab]   = useState('synthese'); // 'synthese' | 'rapport' | 'timeline'
  const [globalComment, setGlobalComment] = useState(''); // commentaire global sur toute l'analyse
  const [showCommentBox, setShowCommentBox] = useState(false); // affiche zone commentaire global
  const [updatingFromComment, setUpdatingFromComment] = useState(false);
  const [generatingLetter, setGeneratingLetter] = useState(null); // item key being processed
  const [generatedLetters, setGeneratedLetters] = useState({}); // key -> letter text
  const ficheInputRef   = useRef(null);
  const contratInputRef = useRef(null);
  const stopRef         = useRef(false);
  const startTimeRef    = useRef(null); // for ETA calculation

  // ── Base IDCC — conventions collectives majeures ──────────────────
  const CC_BASE = {
    "syntec":              { idcc:"1486", nom:"Syntec (bureaux d'études, informatique, ingénierie)", avantages:"13e mois obligatoire, tickets restaurant, RTT, forfait jour possible, remboursement frais réels" },
    "commerce":            { idcc:"3305", nom:"Commerce de gros", avantages:"Prime d'ancienneté à partir de 3 ans (3%), congés supplémentaires ancienneté" },
    "metallurgie":         { idcc:"5001", nom:"Métallurgie (accord national 2023)", avantages:"Nouveau système de classification, prime d'ancienneté, congés supplémentaires" },
    "btp":                 { idcc:"1597", nom:"Bâtiment — Ouvriers (IDCC 1597)", avantages:"Indemnité trajet, indemnité repas, prime intempéries, congés payés BTP" },
    "hotellerie":          { idcc:"3292", nom:"Hôtels, cafés, restaurants (HCR)", avantages:"Repas en nature ou en espèces, prime de blanchissage, jours fériés majorés" },
    "transport":           { idcc:"16",   nom:"Transports routiers et activités auxiliaires", avantages:"Prime casse-croûte, indemnité repas longue distance, temps de service" },
    "banque":              { idcc:"2120", nom:"Banque (AFB)", avantages:"13e mois, prime variable, 23 RTT, congés supplémentaires ancienneté, retraite supplémentaire" },
    "assurance":           { idcc:"1672", nom:"Sociétés d'assurance", avantages:"13e mois, prime vacances, prévoyance renforcée, 23 RTT" },
    "grande distribution": { idcc:"2216", nom:"Commerce à prédominance alimentaire (grande distribution)", avantages:"Prime de sujétion, majorations dimanche obligatoires, prime annuelle" },
    "nettoyage":           { idcc:"3043", nom:"Entreprises de propreté et services associés", avantages:"Prime de salissure, indemnité transport, prime d'ancienneté 3% à 3 ans" },
    "sante":               { idcc:"29",   nom:"Établissements privés d'hospitalisation, soins, cure", avantages:"Prime décentralisée 5%, prime de nuit 10%, dimanche majoré" },
    "aide domicile":       { idcc:"2941", nom:"Aide, accompagnement, soins à domicile", avantages:"Indemnité kilométrique renforcée, temps de déplacement rémunéré, prime" },
    "securite":            { idcc:"1351", nom:"Prévention et sécurité", avantages:"Prime de nuit, prime de dimanche, prime tenue, coefficient qualification" },
    "coiffure":            { idcc:"2596", nom:"Coiffure et professions connexes", avantages:"Prime de service, heures supplémentaires majorées" },
    "interim":             { idcc:"2972", nom:"Travail temporaire", avantages:"Indemnité de fin de mission 10%, indemnité de congés payés 10%, IFM" },
    "chimie":              { idcc:"44",   nom:"Industries chimiques", avantages:"13e mois, prime vacances, médailles travail, retraite supplémentaire" },
    "pharmacie":           { idcc:"1996", nom:"Pharmacie d'officine", avantages:"Prime d'ancienneté à partir de 2 ans, 13e mois, remboursement transport 70%" },
    "presse":              { idcc:"3218", nom:"Presse quotidienne nationale (journalistes)", avantages:"Clause de conscience, piges, droits voisins" },
    "spectacle":           { idcc:"3090", nom:"Artistes du spectacle vivant", avantages:"Cachet minimum, annexe 10 chômage, droits voisins" },
    "restauration rapide": { idcc:"1501", nom:"Restauration rapide", avantages:"Prime blanchissage, coupures limitées, prime dimanche, prime nuit" },
    "auto":                { idcc:"1090", nom:"Commerce et réparation de l'automobile", avantages:"Prime vacances, prime entretien tenue de travail, 13e mois partiel" },
    "immobilier":          { idcc:"1527", nom:"Immobilier (agents et agences)", avantages:"Commission variable, prime ancienneté, frais déplacement" },
    "audiovisuel":         { idcc:"2642", nom:"Production audiovisuelle", avantages:"Congés supplémentaires, régime frais de santé, CDD d'usage encadré" },
    "verre":               { idcc:"1821", nom:"Verre et cristal", avantages:"13e mois, prime vacances, régime frais santé, temps habillage payé" },
    "aide sociale":        { idcc:"413",  nom:"Établissements et services pour personnes inadaptées et handicapées", avantages:"Prime Ségur, 18 congés trimestriels, ancienneté majorée" },
  };

  // ── Détecte la CC dans le texte des fiches/contrats ──────────────
  function detectCC(allTexts) {
    const combined = allTexts.join(' ').toLowerCase();
    // Check explicit IDCC mention
    const idccMatch = combined.match(/idcc\s*[:\-]?\s*(\d{4})/i);
    if (idccMatch) {
      const idcc = idccMatch[1];
      const found = Object.values(CC_BASE).find(c => c.idcc === idcc);
      if (found) return found;
    }
    // Keyword match
    for (const [key, cc] of Object.entries(CC_BASE)) {
      if (combined.includes(key)) return cc;
    }
    // Explicit CC name patterns
    const ccPatterns = [
      [/syntec|bureaux.{0,15}étude|ingénierie|informatique.*conseil/i, "syntec"],
      [/commerce.*gros/i, "commerce"],
      [/métallurgie|accord.{0,5}national.{0,10}2023/i, "metallurgie"],
      [/bâtiment|construction|travaux.publics|génie.civil/i, "btp"],
      [/hôtel|café|restaurant|hcr/i, "hotellerie"],
      [/transport.routier|conducteur|chauffeur/i, "transport"],
      [/banque|établissement.financier|afb/i, "banque"],
      [/assurance.*société|société.*assurance/i, "assurance"],
      [/grande.distribution|supermarché|hypermarché|alimentaire/i, "grande distribution"],
      [/nettoyage|propreté|entretien/i, "nettoyage"],
      [/clinique|hôpital|soin|hospitalisation.privée/i, "sante"],
      [/aide.{0,10}domicile|soins.{0,10}domicile/i, "aide domicile"],
      [/sécurité|gardiennage|surveillance/i, "securite"],
      [/coiffure|esthétique/i, "coiffure"],
      [/travail.temporaire|intérim|interim/i, "interim"],
      [/chimie|industrie.chimique/i, "chimie"],
      [/pharmacie/i, "pharmacie"],
      [/restauration.rapide|fast.food/i, "restauration rapide"],
      [/automobile|réparation.auto/i, "auto"],
      [/immobilier|agence.immo/i, "immobilier"],
    ];
    for (const [re, key] of ccPatterns) {
      if (re.test(combined)) return CC_BASE[key];
    }
    return null;
  }

  // ── Hash texte pour déduplication ───────────────────────────────
  async function hashText(text) {
    const normalized = text.replace(/\s+/g, ' ').trim().slice(0, 3000);
    const enc = new TextEncoder().encode(normalized);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('').slice(0,16);
  }

  function normalizeFilename(name) {
    return name.toLowerCase().replace(/[\s\(\)\[\]]/g,'').replace(/\.[^.]+$/,'');
  }

  // ── Extraction texte (shared) ────────────────────────────────────
  async function extractText(file) {
    if (file.name.endsWith('.pdf')) {
      return new Promise((resolve) => {
        const run = async () => {
          try {
            const lib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
            if (lib) lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            const ab = await file.arrayBuffer();
            const pdf = await lib.getDocument({ data: new Uint8Array(ab) }).promise;
            let text = '';
            for (let i = 1; i <= Math.min(pdf.numPages, 6); i++) {
              const page = await pdf.getPage(i);
              const tc = await page.getTextContent();
              text += tc.items.map(it => it.str).join(' ') + '\n';
            }
            resolve(text.trim());
          } catch(_e) { resolve(''); }
        };
        if (window['pdfjs-dist/build/pdf'] || window.pdfjsLib) { run(); return; }
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        s.onload = run; document.head.appendChild(s);
      });
    }
    if (file.name.endsWith('.txt')) return file.text();
    if (file.name.endsWith('.docx')) {
      try {
        const ab = await file.arrayBuffer();
        const r = await mammoth.extractRawText({ arrayBuffer: ab });
        return r.value;
      } catch(_e) { return ''; }
    }
    return '';
  }

  // ── Import fiches ────────────────────────────────────────────────
  async function handleFicheFiles(files) {
    const list = [];
    for (const file of Array.from(files)) {
      const text = await extractText(file);
      const hash = await hashText(text);
      const normName = normalizeFilename(file.name);
      list.push({ id: Date.now() + Math.random(), name: file.name, text, hash, normName, type: 'fiche', status: 'pending', data: null, error: null, duplicate: false });
    }
    setFiches(prev => {
      const combined = [...prev, ...list];
      // Mark duplicates: same hash OR same normalised filename
      const seen = {}; // hash → id, normName → id
      const result = combined.map(f => {
        const hKey = `h:${f.hash}`, nKey = `n:${f.normName}`;
        if (seen[hKey] || seen[nKey]) return { ...f, duplicate: true };
        seen[hKey] = true; seen[nKey] = true;
        return { ...f, duplicate: false };
      });
      return result.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  // ── Import contrats / avenants ───────────────────────────────────
  async function handleContratFiles(files) {
    const list = [];
    for (const file of Array.from(files)) {
      const text = await extractText(file);
      const hash = await hashText(text);
      const normName = normalizeFilename(file.name);
      const isAvenant = /avenant/i.test(file.name);
      list.push({ id: Date.now() + Math.random(), name: file.name, text, hash, normName, isAvenant, dateDebut: null, dateFin: null, duplicate: false });
    }
    setContrats(prev => {
      const combined = [...prev, ...list];
      const seen = {};
      return combined.map(f => {
        const hKey = `h:${f.hash}`, nKey = `n:${f.normName}`;
        if (seen[hKey] || seen[nKey]) return { ...f, duplicate: true };
        seen[hKey] = true; seen[nKey] = true;
        return { ...f, duplicate: false };
      }).sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  function removeFiche(id)   { setFiches(f => f.filter(x => x.id !== id)); }
  function removeContrat(id) { setContrats(c => c.filter(x => x.id !== id)); }

  // ── Build contractual + CC context for each fiche ──────────────
  function getContextFor(ficheTxt) {
    const parts = [];
    // manualCC override wins, else detect
    const cc = manualCC || detectCC([ficheTxt, ...fiches.map(f=>f.text), ...contrats.map(c=>c.text)]);
    if (cc) {
      parts.push(`CONVENTION COLLECTIVE EN VIGUEUR : ${cc.nom} (IDCC ${cc.idcc})\nObligations : ${cc.avantages}\nVérifie la conformité stricte de chaque élément de la fiche à cette CC.`);
    }
    if (contrats.length) {
      const nonDup = contrats.filter(c => !c.duplicate);
      const allText = nonDup.map(c => `=== ${c.isAvenant ? 'AVENANT' : 'CONTRAT'} : ${c.name} ===\n${c.text.slice(0, 1800)}`).join('\n\n');
      parts.push(`CONTRATS / AVENANTS :\n${allText.slice(0, 3500)}`);
    }
    if (!parts.length) return '';
    return '\n\n' + parts.join('\n\n');
  }

  // ── Analyse séquentielle ────────────────────────────────────────
  // Compact prompt — minimal tokens, max signal
  // ── Passe 1 : données de base (léger, toujours réussi) ───────────
  const PROMPT_BASE = `Expert paie France. JSON minifié UNE LIGNE uniquement, zéro texte avant/après.
RÈGLE: absence non chiffrée sur la fiche = ne jamais mentionner.
Si CC fournie: vérifie salaire mini, primes obligatoires, majorations.
Si contrat fourni: vérifie conformité et signale écarts.
FORMAT EXACT:{"mois_annee":"MM/AAAA","salaire_brut":"Xe","salaire_net":"Xe","heures_travaillees":"Xh","convention_collective":"nom ou null","date_entree":"DD/MM/AAAA ou null","anciennete_mois":0,"anomalies":[{"ligne":"L","probleme":"P","impact":"Xe"}],"indemnites_manquantes":[{"indemnite":"I","montant_estime":"Xe","base_legale":"B"}],"ecarts_contrat":[{"element":"E","contractuel":"C","reel":"R","impact":"Xe"}],"violations_legales":[],"conseil":"C"}`;

  // ── Passe 2 : violations loi/CC (optionnelle, ne bloque pas) ─────
  const PROMPT_VIOLATIONS = `Expert droit du travail français. JSON minifié UNE LIGNE, zéro texte avant/après.
Liste uniquement les violations CERTAINES (loi ou CC) avec article précis.
FORMAT EXACT:{"violations_legales":[{"type":"Loi ou CC","article":"L1234-5","violation":"description courte","sanction":"sanction applicable","impact":"Xe ou null"}]}`;

  async function sleep(ms, label) {
    const step = 500;
    for (let elapsed = 0; elapsed < ms; elapsed += step) {
      if (stopRef.current) return;
      const remaining = Math.ceil((ms - elapsed) / 1000);
      setWaitCountdown(remaining);
      await new Promise(r => setTimeout(r, Math.min(step, ms - elapsed)));
    }
    setWaitCountdown(0);
  }

  function resetErrorsToRetry() {
    setFiches(prev => prev.map(f =>
      f.status === 'error' && f.error?.includes('Quota') ? { ...f, status: 'pending', error: null } : f
    ));
    setQuotaHit(false);
  }

  // ── ETA helper ──────────────────────────────────────────────────
  function updateETA(doneCount, totalCount) {
    if (!startTimeRef.current || doneCount === 0) return;
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const perItem = elapsed / doneCount;
    const remaining = Math.round(perItem * (totalCount - doneCount));
    setTimeRemaining(remaining);
  }

  function fmtTime(secs) {
    if (!secs || secs <= 0) return '';
    if (secs < 60) return `~${secs}s`;
    return `~${Math.ceil(secs/60)} min`;
  }

  // ── Sauvegarde analyse ──────────────────────────────────────────
  function saveAnalysis() {
    const snapshot = {
      savedAt: new Date().toISOString(),
      fiches: fiches.map(f => ({ id:f.id, name:f.name, status:f.status, data:f.data, error:f.error, note:f.note||'', ccOverride:f.ccOverride||null, duplicate:f.duplicate })),
      manualCC,
    };
    try {
      localStorage.setItem('lv_multi_analysis', JSON.stringify(snapshot));
      setSavedAnalysis(snapshot);
      alert('✅ Analyse sauvegardée dans votre navigateur.');
    } catch(_e) { alert('Erreur lors de la sauvegarde.'); }
  }

  function loadAnalysis() {
    try {
      const raw = localStorage.getItem('lv_multi_analysis');
      if (!raw) { alert('Aucune analyse sauvegardée trouvée.'); return; }
      const snap = JSON.parse(raw);
      setFiches(snap.fiches);
      if (snap.manualCC) setManualCC(snap.manualCC);
      setSavedAnalysis(snap);
      // Rebuild synthese
      setTimeout(() => buildSynthese(snap.fiches), 100);
    } catch(_e) { alert('Erreur lors du chargement.'); }
  }

  function saveNote(ficheId) {
    setFiches(prev => prev.map(f => f.id===ficheId ? {...f, note: noteText} : f));
    setEditingNote(null);
    setNoteText('');
    // re-mark as pending if user wants to re-analyze
  }

  function reanalyzeFiche(ficheId) {
    setFiches(prev => prev.map(f => f.id===ficheId ? {...f, status:'pending', data:null, error:null} : f));
  }

  async function analyzeAll() {
    // Skip duplicates — only analyze unique fiches
    const pending = fiches.filter(f => f.status === 'pending' && f.text.length > 50 && !f.duplicate);
    if (!pending.length) return;
    stopRef.current = false;
    startTimeRef.current = Date.now();
    setAnalyzing(true); setQuotaHit(false); setWaitCountdown(0); setTimeRemaining(null);
    // Don't reset synthese — keep previous results visible while resuming

    const results = [...fiches];
    const total = pending.length;

    for (let i = 0; i < total; i++) {
      if (stopRef.current) break;

      const fiche = pending[i];
      const idx = results.findIndex(f => f.id === fiche.id);
      results[idx] = { ...fiche, status: 'loading' };
      setFiches([...results]);

      const doneCount = results.filter(f => f.status === 'done').length;
      const totalCount = results.length;
      setProgress(Math.round((doneCount / totalCount) * 100));
      setProgressLabel(`${i + 1}/${total} — ${fiche.name}`);

      try {
        const ctx = getContextFor(fiche.text);
        const ficheSnippet = fiche.text.slice(0, 4500);
        const userMsg = `Fiche de paie:\n${ficheSnippet}${ctx}`;

        // ── Appel API avec retry automatique ────────────────────────
        async function callAPI(systemPrompt, userContent, tokens) {
          const r = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514', max_tokens: tokens,
              system: systemPrompt,
              messages: [{ role: 'user', content: userContent }]
            })
          });
          return r.json();
        }

        // ── Passe 1 : données de base (1800 tokens) ─────────────────
        let apiData = await callAPI(PROMPT_BASE, userMsg, 1800);

        if (apiData.error) {
          const errStr = JSON.stringify(apiData.error);
          const isQuota = errStr.includes('exceeded_limit') || errStr.includes('five_hour') || errStr.includes('rate_limit');
          if (isQuota) {
            for (let j = i; j < total; j++) {
              const jfiche = pending[j];
              const jidx = results.findIndex(f => f.id === jfiche.id);
              if (results[jidx].status !== 'done')
                results[jidx] = { ...jfiche, status: 'error', error: '⏳ Quota — cliquer "Reprendre" dans quelques minutes', data: null, retryable: true };
            }
            setFiches([...results]); setQuotaHit(true); setAnalyzing(false);
            setProgressLabel(''); setWaitCountdown(0); buildSynthese([...results]); return;
          }
          throw new Error(apiData.error.message || 'Erreur API');
        }

        let raw = (apiData.content?.map(b => b.text||'').join('')||'').replace(/```json|```/g,'').trim();
        let parsed = safeParseJSON(raw);

        // ── Auto-retry avec prompt minimal si JSON invalide ──────────
        if (!parsed) {
          const FALLBACK = `JSON une ligne strictement. FORMAT:{"mois_annee":"MM/AAAA","salaire_brut":"Xe","salaire_net":"Xe","heures_travaillees":"Xh","convention_collective":null,"date_entree":null,"anciennete_mois":0,"anomalies":[],"indemnites_manquantes":[],"ecarts_contrat":[],"violations_legales":[],"conseil":""}`;
          await new Promise(r => setTimeout(r, 3000));
          const retry = await callAPI(FALLBACK, `Fiche de paie (extraire chiffres clés):\n${ficheSnippet.slice(0,2500)}`, 800);
          if (!retry.error) {
            const raw2 = (retry.content?.map(b=>b.text||'').join('')||'').replace(/```json|```/g,'').trim();
            parsed = safeParseJSON(raw2);
          }
        }

        if (!parsed) throw new Error('JSON invalide après retry');

        // ── Passe 2 : violations loi/CC (optionnelle, 5s après) ─────
        // Lance en arrière-plan, ne bloque pas le résultat
        const baseResult = sanitizeFicheResult(parsed, 'fiche_paie', fiche.text);
        results[idx] = { ...fiche, status: 'done', data: baseResult, error: null, retryable: false };
        setFiches([...results]); // Afficher résultat passe 1 immédiatement

        // Violations en passe séparée (si CC ou contrat disponible)
        if (ctx) {
          try {
            await new Promise(r => setTimeout(r, 4000));
            if (!stopRef.current) {
              const violMsg = `Fiche de paie (${parsed.mois_annee||''}), données:\n${ficheSnippet.slice(0,2000)}${ctx}`;
              const violData = await callAPI(PROMPT_VIOLATIONS, violMsg, 800);
              if (!violData.error) {
                const violRaw = (violData.content?.map(b=>b.text||'').join('')||'').replace(/```json|```/g,'').trim();
                const violParsed = safeParseJSON(violRaw);
                if (violParsed?.violations_legales?.length) {
                  const merged = { ...baseResult, violations_legales: violParsed.violations_legales };
                  results[idx] = { ...fiche, status: 'done', data: merged, error: null, retryable: false };
                  setFiches([...results]);
                }
              }
            }
          } catch(_e) { /* violations optionnelles — échec silencieux */ }
        }

      } catch (e) {
        const msg = e.message || '';
        const isQuota = msg.includes('exceeded_limit') || msg.includes('five_hour') || msg.includes('rate_limit');
        results[idx] = { ...fiche, status: 'error',
          error: isQuota ? '⏳ Quota — cliquer "Reprendre"' : (msg || 'Erreur'),
          data: null, retryable: isQuota };
        if (isQuota) {
          setFiches([...results]); setQuotaHit(true); setAnalyzing(false);
          setProgressLabel(''); buildSynthese([...results]); return;
        }
      }

      setFiches([...results]);
      const doneNow = results.filter(f=>f.status==='done').length;
      updateETA(doneNow, results.filter(f=>!f.duplicate).length);
      // Throttle: 10s without context, 15s with CC/contract (heavier prompts)
      if (i < total - 1 && !stopRef.current) {
        const hasCtx = contrats.length > 0 || !!manualCC;
        await sleep(hasCtx ? 15000 : 10000, `Pause anti-quota…`);
      }
    }

    buildSynthese([...results]);
    setAnalyzing(false);
    setProgressLabel('');
    setWaitCountdown(0);
    setTimeRemaining(null);
  }

  function stopAnalysis() {
    stopRef.current = true;
    setAnalyzing(false);
    setProgressLabel('');
    setWaitCountdown(0);
    buildSynthese(fiches);
  }

  function parseEur(str) {
    if (!str) return 0;
    const m = String(str).replace(/\s/g,'').match(/-?[\d]+[,.]?[\d]*/);
    return m ? Math.abs(parseFloat(m[0].replace(',','.'))) : 0;
  }

  // ── Normalisation sémantique des noms d'indemnités/anomalies ──────
  // Regroupe "prime blanchissage" / "prime blanchisserie" / "blanchissement" etc.
  const SEMANTIC_GROUPS = [
    { canon:"Prime de blanchissage / entretien tenue", keys:["blanchiss","entretien tenue","entretien.*tenue","lavage tenue","nettoyage tenue"] },
    { canon:"Prime de dimanche", keys:["dimanche","sunday","travail.*dimanche","dimanche.*travail"] },
    { canon:"Prime de nuit", keys:["nuit","night","travail.*nuit","nuit.*travail","nocturne"] },
    { canon:"Prime d'ancienneté", keys:["ancien","ancienneté","seniorit"] },
    { canon:"Majoration heures supplémentaires", keys:["heure.*suppl","suppl.*heure","hs ","h[.]s[.]","majoration.*heure","heures supp"] },
    { canon:"Majoration heures complémentaires", keys:["heure.*compl","compl.*heure","hc ","h[.]c[.]","heures compl"] },
    { canon:"Majoration jours fériés", keys:["férié","ferier","jour.*férié","férié.*jour","complément férié"] },
    { canon:"Indemnité de repas / panier", keys:["repas","panier","casse-croûte","casse croûte","meal","ticket.*restaurant","resto","restaur"] },
    { canon:"Indemnité de transport / trajet", keys:["transport","trajet","déplacement","navigo","pass.*transport","frais.*km","kilométrique"] },
    { canon:"13e mois / prime annuelle", keys:["13.*mois","treizième","prime.*annuel","annuel.*prime","gratification annuel"] },
    { canon:"Rappel salaire minimum conventionnel", keys:["salaire.*minimum","minimum.*salaire","smic","salaire.*convention","convention.*salaire","grille","rattrapage.*salaire","salaire.*rattrapage"] },
    { canon:"Prime de sujétion / pénibilité", keys:["sujétion","pénibilité","astreinte","contrainte","travail.*nuit.*dimanche"] },
    { canon:"Congés payés non versés", keys:["congé.*pay","congés pay","cp ","c[.]p[.]","paid.*leave"] },
    { canon:"RTT non versés", keys:["rtt","réduction.*temps","repos.*compensateur"] },
    { canon:"Heures non payées", keys:["heure.*non.*pay","non.*pay.*heure","heure.*manquant","heure.*oubli"] },
  ];

  function canonicalizeLabel(label) {
    if (!label) return label;
    const low = label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const g of SEMANTIC_GROUPS) {
      for (const k of g.keys) {
        try { if (new RegExp(k, 'i').test(low)) return g.canon; } catch(_e) { if (low.includes(k)) return g.canon; }
      }
    }
    return label; // unchanged if no match
  }

  function mergeByCanon(items, keyFn, totalFn) {
    const merged = {};
    items.forEach(item => {
      const raw = keyFn(item);
      const canon = canonicalizeLabel(raw);
      if (!merged[canon]) merged[canon] = { ...item, _label: canon, count: 0, total: 0, months: [] };
      merged[canon].count++;
      merged[canon].total += totalFn(item);
      if (item._month) merged[canon].months.push(item._month);
    });
    return Object.values(merged).sort((a, b) => b.total - a.total);
  }

  // ── Analyse des contrats pour chronologie ────────────────────────
  async function analyzeContratsTimeline() {
    if (!contrats.length) return;
    const TIMELINE_PROMPT = `Tu es expert en droit du travail français. Analyse ce ou ces contrats/avenants et retourne UNIQUEMENT un JSON minifié une ligne.
FORMAT: {"documents":[{"nom":"nom fichier","type":"CDI/CDD/Avenant/Autre","date_debut":"DD/MM/AAAA ou null","date_fin":"DD/MM/AAAA ou null","fonction":"intitulé poste","heures_semaine":"35h ou null","salaire_brut":"Xe ou null","convention_collective":"nom CC ou null","modifications":["modification1","modification2"],"points_cles":["point1","point2"],"avantages":["avantage1"]}]}`;
    const allText = contrats.map(c=>`=== ${c.name} ===
${c.text.slice(0,3000)}`).join('\n\n');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:2000, system:TIMELINE_PROMPT, messages:[{role:'user',content:allText.slice(0,8000)}] })
      });
      const d = await res.json();
      if (d.error) return null;
      const raw = (d.content?.map(b=>b.text||'').join('')||'').replace(/```json|```/g,'').trim();
      return safeParseJSON(raw);
    } catch(_e) { return null; }
  }

  function buildSynthese(allFiches) {
    const done = allFiches.filter(f => f.status === 'done' && f.data);
    if (!done.length) return;

    const sorted = [...done].sort((a, b) => {
      const toDate = s => { if (!s) return 0; const [mm,yy] = s.split('/'); return (parseInt(yy)||0)*100+(parseInt(mm)||0); };
      return toDate(a.data.mois_annee) - toDate(b.data.mois_annee);
    });

    const months = sorted.map(f => {
      const anom  = (f.data.anomalies||[]).reduce((s,a)=>s+parseEur(a.impact),0);
      const indem = (f.data.indemnites_manquantes||[]).reduce((s,i)=>s+parseEur(i.montant_estime),0);
      const ecart = (f.data.ecarts_contrat||[]).reduce((s,e)=>s+parseEur(e.impact),0);
      const viol  = (f.data.violations_legales||[]).reduce((s,v)=>s+parseEur(v.impact),0);
      return {
        mois: f.data.mois_annee || f.name,
        brut: parseEur(f.data.salaire_brut),
        net: parseEur(f.data.salaire_net),
        heures: f.data.heures_travaillees || '—',
        anomalies: f.data.anomalies||[],
        indemnites: f.data.indemnites_manquantes||[],
        ecarts: f.data.ecarts_contrat||[],
        violations: f.data.violations_legales||[],
        anomTotal: anom, indemTotal: indem, ecartTotal: ecart, violTotal: viol,
        duMois: anom + indem + ecart + viol,
        ficheName: f.name,
        ccName: f.data.convention_collective || null,
      };
    });

    const totalDu = months.reduce((s,m)=>s+m.duMois,0);

    const variations = [];
    for (let i = 1; i < months.length; i++) {
      const prev = months[i-1], curr = months[i];
      if (Math.abs(curr.brut - prev.brut) > 50)
        variations.push({ mois: curr.mois, from: prev.brut, to: curr.brut });
    }

    // Aggregation with semantic dedup
    const allAnomalies = {};
    months.forEach(m => (m.anomalies||[]).forEach(a => {
      const k = canonicalizeLabel(a.ligne);
      if (!allAnomalies[k]) allAnomalies[k] = {...a, _label:k, count:0, total:0, months:[]};
      allAnomalies[k].count++; allAnomalies[k].total += parseEur(a.impact);
      allAnomalies[k].months.push(m.mois);
    }));

    const allIndemnites = {};
    months.forEach(m => (m.indemnites||[]).forEach(i => {
      const k = canonicalizeLabel(i.indemnite);
      if (!allIndemnites[k]) allIndemnites[k] = {...i, _label:k, count:0, total:0, months:[]};
      allIndemnites[k].count++; allIndemnites[k].total += parseEur(i.montant_estime);
      allIndemnites[k].months.push(m.mois);
    }));

    const allEcarts = {};
    months.forEach(m => (m.ecarts||[]).forEach(e => {
      const k = canonicalizeLabel(e.element);
      if (!allEcarts[k]) allEcarts[k] = {...e, _label:k, count:0, total:0, months:[]};
      allEcarts[k].count++; allEcarts[k].total += parseEur(e.impact);
      allEcarts[k].months.push(m.mois);
    }));

    const allViolations = {};
    months.forEach(m => (m.violations||[]).forEach(v => {
      const k = v.article || v.violation?.slice(0,30) || 'inconnu';
      if (!allViolations[k]) allViolations[k] = {...v, count:0, total:0};
      allViolations[k].count++; allViolations[k].total += parseEur(v.impact);
    }));

    // CC : si l'utilisateur a sélectionné une CC manuellement, on l'utilise
    //       EXCLUSIVEMENT — pas de détection automatique qui pourrait contredire son choix
    const detectedCC = manualCC ? null : detectCC([...done.map(f=>f.text), ...contrats.map(c=>c.text)]);
    const activeCC   = manualCC || detectedCC; // CC effectivement utilisée

    // Duplicate count
    const dupCount = fiches.filter(f=>f.duplicate).length;

    setSynthese({ months, totalDu, variations, allAnomalies, allIndemnites, allEcarts, allViolations, detectedCC, activeCC, nbFiches: done.length, hasContrats: contrats.length > 0, dupCount });
    // Trigger contract timeline analysis in background
    if (contrats.length) analyzeContratsTimeline().then(tl => { if (tl) setSynthese(prev => prev ? {...prev, contractTimeline: tl} : prev); });
  }

  function exportSynthesePDF() {
    if (!synthese) return;
    const cc = manualCC || synthese.detectedCC;
    const sep = '═'.repeat(60);
    const sep2 = '─'.repeat(60);
    const lines = [];

    // ── PAGE DE GARDE ───────────────────────────────────────────────
    lines.push(sep, 'RAPPORT COMPLET D\'ANALYSE — FICHES DE PAIE', sep, '');
    lines.push(`Salarié(e) : à compléter`);
    lines.push(`Période analysée : ${synthese.months[0]?.mois||'—'} → ${synthese.months[synthese.months.length-1]?.mois||'—'}`);
    lines.push(`Fiches analysées : ${synthese.nbFiches}`);
    if (contrats.length) lines.push(`Documents contractuels joints : ${contrats.map(c=>c.name).join(', ')}`);
    if (cc) lines.push(`Convention collective : ${cc.nom} (IDCC ${cc.idcc})`);
    lines.push(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, '');
    lines.push(sep, `  TOTAL DÛ ESTIMÉ : ${synthese.totalDu.toLocaleString('fr-FR',{minimumFractionDigits:2})} €`, sep, '');

    // ── RÉSUMÉ EXÉCUTIF ─────────────────────────────────────────────
    lines.push('RÉSUMÉ EXÉCUTIF', sep2);
    const urgents = synthese.months.filter(m=>m.violations.length>0||m.duMois>200);
    const aVerifier = synthese.months.filter(m=>m.duMois>0&&m.duMois<=200);
    const corrects = synthese.months.filter(m=>m.duMois===0&&!m.violations.length);
    lines.push(`✅ CORRECTS (${corrects.length} mois) : ${corrects.map(m=>m.mois).join(', ')||'aucun'}`);
    lines.push(`⚠ À VÉRIFIER (${aVerifier.length} mois) : ${aVerifier.map(m=>m.mois+' (+'+m.duMois.toFixed(0)+'€)').join(', ')||'aucun'}`);
    lines.push(`🚨 URGENT (${urgents.length} mois) : ${urgents.map(m=>m.mois).join(', ')||'aucun'}`);
    lines.push('');

    // ── RECOURS RECOMMANDÉS ──────────────────────────────────────────
    lines.push('RECOURS RECOMMANDÉS', sep2);
    if (synthese.totalDu > 0) {
      lines.push('1. MISE EN DEMEURE DE L\'EMPLOYEUR (recommandé en 1er)');
      lines.push('   → Lettre recommandée AR réclamant le paiement des sommes dues');
      lines.push('   → Délai de réponse employeur : 15 jours');
    }
    if (Object.keys(synthese.allViolations).length) {
      lines.push('2. SIGNALEMENT INSPECTION DU TRAVAIL');
      lines.push('   → Saisine en ligne : https://signalement.travail.gouv.fr');
      lines.push('   → Pour violations loi/CC répétées');
    }
    if (synthese.totalDu > 500) {
      lines.push('3. CONSEIL DE PRUD\'HOMMES');
      lines.push('   → Saisine en ligne : https://www.justice.fr/formulaires');
      lines.push('   → Prescription 3 ans (art. L3245-1 Code du travail)');
      lines.push(`   → Montant à réclamer : ${synthese.totalDu.toLocaleString('fr-FR')}€ + dommages et intérêts`);
    }
    lines.push('4. SYNDICAT / DÉFENSEUR DES DROITS (gratuit)');
    lines.push('   → Aide à la rédaction et accompagnement gratuit', '');

    if (cc) {
      lines.push('CONVENTION COLLECTIVE', sep2);
      lines.push(`${cc.nom} — IDCC ${cc.idcc}`);
      lines.push(`Avantages obligatoires : ${cc.avantages}`, '');
    }

    // ── VIOLATIONS LOI / CC ───────────────────────────────────────────
    if (Object.keys(synthese.allViolations).length) {
      lines.push('VIOLATIONS LOI / CONVENTION COLLECTIVE', sep2);
      Object.values(synthese.allViolations).sort((a,b)=>b.total-a.total).forEach((v,i) => {
        lines.push(`${i+1}. ${v.violation}`);
        lines.push(`   Base légale : ${v.type} — ${v.article}`);
        lines.push(`   Sanction applicable : ${v.sanction}`);
        lines.push(`   Préjudice estimé : ${v.total.toFixed(2)}€ (${v.count} mois)`);
        lines.push('');
      });
    }

    // ── ANOMALIES & INDEMNITÉS ────────────────────────────────────────
    if (Object.keys(synthese.allAnomalies).length || Object.keys(synthese.allIndemnites).length) {
      lines.push('ANOMALIES ET INDEMNITÉS MANQUANTES', sep2);
      Object.values(synthese.allAnomalies).sort((a,b)=>b.total-a.total).forEach(a =>
        lines.push(`  ⚠ ${a.ligne} : ${a.probleme} — ${a.count} mois — total : ${a.total.toFixed(2)}€`));
      Object.values(synthese.allIndemnites).sort((a,b)=>b.total-a.total).forEach(i =>
        lines.push(`  💸 ${i.indemnite} — ${i.count} mois × ~${parseEur(i.montant_estime).toFixed(2)}€ = ${i.total.toFixed(2)}€ (${i.base_legale})`));
      lines.push('');
    }

    // ── DÉTAIL PAR FICHE ─────────────────────────────────────────────
    lines.push(sep, 'ANALYSE DÉTAILLÉE — FICHE PAR FICHE', sep);
    synthese.months.forEach((m, idx) => {
      const statut = m.violations.length>0||m.duMois>200 ? '🚨 URGENT' : m.duMois>0 ? '⚠ À VÉRIFIER' : '✅ CONFORME';
      lines.push(`\n${sep2}`);
      lines.push(`FICHE ${idx+1} — ${m.mois}   ${statut}`);
      lines.push(sep2);
      lines.push(`  Salaire brut : ${m.brut>0?m.brut.toFixed(2)+'€':'—'}`);
      lines.push(`  Salaire net  : ${m.net>0?m.net.toFixed(2)+'€':'—'}`);
      lines.push(`  Heures       : ${m.heures}`);
      if (m.violations.length) {
        lines.push('  VIOLATIONS :');
        m.violations.forEach(v => lines.push(`    🚫 ${v.violation} (${v.article}) — préjudice : ${v.impact||'?'}`));
        lines.push(`    → Recours : lettre recommandée + saisine inspection du travail`);
      }
      if (m.ecarts.length) {
        lines.push('  ÉCARTS CONTRAT :');
        m.ecarts.forEach(e => lines.push(`    📋 ${e.element} — prévu : ${e.contractuel} / versé : ${e.reel} (${e.impact||'?'})`));
        lines.push(`    → Recours : mise en demeure de régularisation`);
      }
      if (m.anomalies.length) {
        lines.push('  ANOMALIES :');
        m.anomalies.forEach(a => lines.push(`    ⚠ ${a.ligne} : ${a.probleme} (${a.impact||'?'})`));
      }
      if (m.indemnites.length) {
        lines.push('  INDEMNITÉS MANQUANTES :');
        m.indemnites.forEach(i => lines.push(`    💸 ${i.indemnite} (~${i.montant_estime}) — ${i.base_legale}`));
        lines.push(`    → Recours : réclamation écrite à l'employeur`);
      }
      // User note
      const ficheObj = fiches.find(f=>f.data?.mois_annee===m.mois);
      if (ficheObj?.note) lines.push(`  NOTE PERSONNELLE : ${ficheObj.note}`);
      if (m.duMois>0) lines.push(`  TOTAL DÛ CE MOIS : ${m.duMois.toFixed(2)}€`);
      if (m.duMois===0&&!m.violations.length) lines.push('  → Aucune anomalie détectée sur ce mois.');
    });

    // ── CONCLUSION ────────────────────────────────────────────────────
    lines.push('', sep, 'CONCLUSION', sep);
    lines.push(`Total dû estimé : ${synthese.totalDu.toLocaleString('fr-FR',{minimumFractionDigits:2})} €`);
    lines.push(`Prescription : 3 ans pour rappel de salaire (art. L3245-1 Code du travail)`);
    lines.push(`Délai pour agir : avant le ${new Date(Date.now()+3*365*86400000).toLocaleDateString('fr-FR')}`);
    lines.push('', '⚠ Ce rapport est une analyse indicative. Consultez un professionnel du droit');
    lines.push('   pour toute démarche juridique formelle.');

    exportToPDF({ title:`Rapport complet — ${synthese.totalDu.toLocaleString('fr-FR')}€ dus`, content:lines.join('\n'), filename:'rapport-fiches-paie' });
  }

  // ── Mise à jour analyse depuis commentaires ──────────────────────
  async function updateFromComments() {
    // Collect fiches that have a note/comment asking for correction
    const fichesWithComments = fiches.filter(f =>
      f.status === 'done' && f.note && f.note.trim().length > 10
    );
    if (!fichesWithComments.length && !globalComment.trim()) {
      alert("Ajoutez d'abord un commentaire sur une fiche ou un commentaire global.");
      return;
    }
    setUpdatingFromComment(true);

    const cc = manualCC || synthese?.activeCC;
    const ccCtx = cc ? `Convention collective : ${cc.nom} (IDCC ${cc.idcc}). Obligations : ${cc.avantages}.` : '';

    // Re-analyze fiches that have comments
    const toReanalyze = fichesWithComments;
    const results = [...fiches];

    for (const fiche of toReanalyze) {
      const idx = results.findIndex(f => f.id === fiche.id);
      results[idx] = { ...fiche, status: 'loading' };
      setFiches([...results]);

      const correctionCtx = '\n\nCORRECTION DEMANDEE : ' + fiche.note + '\nTiens compte de cette correction. Si le salarie indique que quelque chose est faux, retire-le. Si il precise un element, integre-le.';
      const globalCtx = globalComment ? ('\n\nCONTEXTE GLOBAL : ' + globalComment) : '';
      const ficheSnippet = fiche.text.slice(0, 4000);
      const userMsg = 'Fiche de paie:\n' + ficheSnippet + '\n\n' + ccCtx + correctionCtx + globalCtx;

      try {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514', max_tokens: 1800,
            system: PROMPT_BASE,
            messages: [{ role: 'user', content: userMsg }]
          })
        });
        const d = await r.json();
        if (!d.error) {
          const raw = (d.content?.map(b=>b.text||'').join('')||'').replace(/```json|```/g,'').trim();
          const parsed = safeParseJSON(raw);
          if (parsed) {
            const clean = sanitizeFicheResult(parsed, 'fiche_paie', fiche.text);
            results[idx] = { ...fiche, status: 'done', data: clean, error: null };
            setFiches([...results]);
          }
        }
      } catch(_e) {}
      if (toReanalyze.indexOf(fiche) < toReanalyze.length - 1) {
        await new Promise(r => setTimeout(r, 8000));
      }
    }

    buildSynthese([...results]);
    setUpdatingFromComment(false);
    setShowCommentBox(false);
    alert(`✅ ${toReanalyze.length} fiche(s) mise(s) à jour selon vos corrections.`);
  }

  // ── Génération de lettre de recours automatique ─────────────────
  async function generateLetter(item, type) {
    const key = `${type}:${item._label||item.violation||item.element||item.ligne||item.indemnite}`;
    if (generatedLetters[key]) { setGeneratedLetters(prev=>({...prev, [`show:${key}`]:!prev[`show:${key}`]})); return; }
    setGeneratingLetter(key);
    const cc = manualCC || synthese?.detectedCC;
    const montant = item.total ? item.total.toFixed(2)+'€' : (item.impact || item.montant_estime || '?');
    const moisList = item.months?.length ? item.months.join(', ') : `${item.count} mois`;
    const desc = item._label || item.violation || item.element || item.ligne || item.indemnite || 'anomalie';
    const base = item.article || item.base_legale || '';
    const ccLine = cc ? ('Convention collective : ' + cc.nom + ' (IDCC ' + cc.idcc + ')') : '';
    const LETTRE_PROMPT = 'Tu es un outil sur le droit du travail. Redige une lettre de mise en demeure professionnelle, ferme mais courtoise.\n'
      + 'Objet du litige : ' + type + ' - ' + desc + '\n'
      + 'Montant reclame : ' + montant + ' sur ' + moisList + '\n'
      + 'Base legale : ' + (base || 'droit du travail francais') + '\n'
      + (ccLine ? ccLine + '\n' : '')
      + 'La lettre doit : 1) rappeler les faits precis, 2) citer les textes legaux, 3) mettre en demeure de regulariser sous 15 jours, 4) mentionner les recours en cas de non-reponse (prudhommes, inspection du travail).\n'
      + 'Format : lettre formelle complete avec objet, corps, formule de politesse. Utilise [NOM SALARIE], [NOM EMPLOYEUR], [VILLE], [DATE] comme placeholders.';
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1200, system:LETTRE_PROMPT, messages:[{role:'user',content:'Génère la lettre de mise en demeure.'}] })
      });
      const d = await res.json();
      if (!d.error) {
        const text = d.content?.map(b=>b.text||'').join('')||'';
        setGeneratedLetters(prev=>({...prev, [key]:text, [`show:${key}`]:true}));
      }
    } catch(_e) {}
    setGeneratingLetter(null);
  }

  function copyLetter(key) {
    const text = generatedLetters[key];
    if (text) navigator.clipboard?.writeText(text).then(()=>alert('✅ Lettre copiée dans le presse-papier'));
  }

  // ── RENDER ───────────────────────────────────────────────────────
  const fichesLoaded = fiches.length;
  const contratsLoaded = contrats.length;
  const pendingCount = fiches.filter(f=>f.status==='pending'&&f.text.length>50&&!f.duplicate).length;
  const hasSaved = !!localStorage.getItem('lv_multi_analysis');
  const ccOptions = Object.values(CC_BASE);

  return (
    <div style={{ maxWidth:860, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>

      {/* CC Picker modal */}
      {showCCPicker&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <Card style={{ maxWidth:500, width:'100%', maxHeight:'80vh', overflow:'auto', padding:20 }}>
            <h3 style={{ fontWeight:800, color:'var(--text-primary)', fontSize:15, marginBottom:4 }}>📘 Sélectionner la convention collective</h3>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:14 }}>La CC détectée automatiquement semble incorrecte ? Choisissez la bonne ici — elle sera appliquée à toutes les fiches.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {manualCC&&<button onClick={()=>{setManualCC(null);setShowCCPicker(null);}} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#ef4444', cursor:'pointer', textAlign:'left' }}>↩ Revenir à la détection automatique</button>}
              {ccOptions.map(cc=>(
                <button key={cc.idcc} onClick={()=>{setManualCC(cc);setShowCCPicker(null);}} style={{ background: manualCC?.idcc===cc.idcc ? 'rgba(37,99,235,0.15)' : 'var(--input-bg)', border:`1px solid ${manualCC?.idcc===cc.idcc?'#2563eb':'var(--border)'}`, borderRadius:8, padding:'10px 12px', cursor:'pointer', textAlign:'left' }}>
                  <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:12 }}>{cc.nom}</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>IDCC {cc.idcc} · {cc.avantages.slice(0,80)}…</div>
                </button>
              ))}
            </div>
            <Btn variant="secondary" onClick={()=>setShowCCPicker(null)} style={{ marginTop:14, width:'100%', fontSize:13 }}>Fermer</Btn>
          </Card>
        </div>
      )}

      {/* Note editor modal */}
      {editingNote&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <Card style={{ maxWidth:480, width:'100%', padding:20 }}>
            <h3 style={{ fontWeight:800, color:'var(--text-primary)', fontSize:15, marginBottom:8 }}>✏ Note sur cette fiche</h3>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10 }}>Décrivez ce que vous avez observé, un problème non détecté, une correction à apporter…</p>
            <textarea value={noteText} onChange={e=>setNoteText(e.target.value)}
              placeholder="Ex: Mon employeur m'a dit que la prime de nuit avait été retirée depuis janvier, mais aucune notification écrite. Les majorations dimanche semblent incorrectes sur ce mois."
              style={{ width:'100%', minHeight:120, background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:8, padding:10, fontSize:13, color:'var(--text-primary)', resize:'vertical', boxSizing:'border-box' }} />
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <Btn onClick={()=>saveNote(editingNote)} style={{ flex:1, fontSize:13 }}>✅ Sauvegarder la note</Btn>
              <Btn variant="secondary" onClick={()=>{setEditingNote(null);setNoteText('');}} style={{ fontSize:13 }}>Annuler</Btn>
            </div>
            {fiches.find(f=>f.id===editingNote)?.note&&(
              <div style={{ marginTop:10, display:'flex', gap:8 }}>
                <Btn variant="secondary" onClick={()=>{reanalyzeFiche(editingNote);setEditingNote(null);setNoteText('');}} style={{ fontSize:12, width:'100%' }}>🔄 Re-analyser cette fiche avec la note</Btn>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Header */}
      <Card style={{ background:'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(124,58,237,0.06))', borderColor:'rgba(239,68,68,0.3)', padding:'18px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
          <div>
            <h3 style={{ fontWeight:800, color:'var(--text-primary)', fontSize:16, marginBottom:4 }}>📚 Analyse complète — toutes les fiches de paie</h3>
            <p style={{ color:'var(--text-muted)', fontSize:12, margin:0, lineHeight:1.5 }}>
              Importez toutes vos fiches + contrat/avenants. L'IA croise chaque fiche avec votre CC et détecte violations, anomalies et sommes dues.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, flexShrink:0 }}>
            <button onClick={()=>setShowCCPicker('all')} style={{ background:'rgba(37,99,235,0.1)', border:'1px solid rgba(37,99,235,0.3)', borderRadius:8, padding:'6px 10px', fontSize:11, color:'#2563eb', cursor:'pointer', whiteSpace:'nowrap' }}>
              📘 {manualCC ? manualCC.nom.slice(0,20)+'…' : 'Choisir ma CC'}
            </button>
            <div style={{ display:'flex', gap:4 }}>
              <button onClick={saveAnalysis} style={{ flex:1, background:'rgba(22,163,74,0.1)', border:'1px solid rgba(22,163,74,0.3)', borderRadius:6, padding:'5px 8px', fontSize:10, color:'#16a34a', cursor:'pointer' }}>💾 Sauvegarder</button>
              {hasSaved&&<button onClick={loadAnalysis} style={{ flex:1, background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:6, padding:'5px 8px', fontSize:10, color:'#7c3aed', cursor:'pointer' }}>📂 Charger</button>}
            </div>
          </div>
        </div>
        {manualCC&&<div style={{ marginTop:8, padding:'6px 10px', background:'rgba(37,99,235,0.1)', borderRadius:6, fontSize:11, color:'#2563eb' }}>📘 CC sélectionnée manuellement : <strong>{manualCC.nom}</strong> — <button onClick={()=>setManualCC(null)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:10, padding:0 }}>✕ retirer</button></div>}
      </Card>

      {/* CC active — manuelle en priorité, sinon détectée automatiquement */}
      {synthese?.activeCC&&(
        <Card style={{ background: manualCC ? 'rgba(22,163,74,0.07)' : 'rgba(37,99,235,0.07)', borderColor: manualCC ? 'rgba(22,163,74,0.35)' : 'rgba(37,99,235,0.35)', padding:'12px 16px', display:'flex', alignItems:'flex-start', gap:12 }}>
          <span style={{ fontSize:20, flexShrink:0 }}>📘</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color: manualCC ? '#16a34a' : '#2563eb', fontSize:13 }}>
              {manualCC ? '✅ CC sélectionnée par vous' : '🔍 CC détectée automatiquement'} : {synthese.activeCC.nom}
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>IDCC {synthese.activeCC.idcc} · {synthese.activeCC.avantages}</div>
            {manualCC&&<div style={{ fontSize:11, color:'#16a34a', marginTop:4, fontWeight:600 }}>L'analyse a été effectuée exclusivement selon cette convention collective.</div>}
            {!manualCC&&<div style={{ fontSize:11, color:'#f59e0b', marginTop:4 }}>⚠ Si cette CC est incorrecte, sélectionnez la bonne via "📘 Choisir ma CC" puis relancez l'analyse.</div>}
          </div>
        </Card>
      )}
      {/* Avertissement doublons */}
      {fiches.some(f=>f.duplicate)&&(
        <Card style={{ background:'rgba(245,158,11,0.07)', borderColor:'rgba(245,158,11,0.35)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:18 }}>🔁</span>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>
            <strong style={{ color:'#f59e0b' }}>{fiches.filter(f=>f.duplicate).length} doublon(s) détecté(s)</strong> et ignoré(s) automatiquement — les fiches barrées ne seront pas analysées.
          </div>
        </Card>
      )}

      {/* ── SECTION 1 : Contrats & Avenants ── */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div>
            <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:14 }}>📋 Contrat(s) de travail & Avenants</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
              Optionnel mais recommandé — permet de détecter les écarts entre ce qui est dû contractuellement et ce qui est versé
            </div>
          </div>
          {contratsLoaded > 0 && <Badge color="#2563eb">{contratsLoaded} document(s)</Badge>}
        </div>

        <input ref={contratInputRef} type="file" accept=".pdf,.txt,.docx" multiple style={{ display:'none' }}
          onChange={e=>{ handleContratFiles(e.target.files); e.target.value=''; }} />
        <button onClick={()=>contratInputRef.current?.click()} style={{
          width:'100%', background:'var(--input-bg)',
          border:`2px dashed ${contratsLoaded ? '#2563eb' : 'var(--border)'}`,
          borderRadius:12, padding:'14px', cursor:'pointer', textAlign:'center',
        }}>
          <div style={{ fontSize:22, marginBottom:4 }}>📄</div>
          <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:13 }}>
            {contratsLoaded ? `${contratsLoaded} document(s) chargé(s) — ajouter d'autres` : 'Importer contrat / avenant(s)'}
          </div>
          <div style={{ color:'var(--text-muted)', fontSize:11, marginTop:3 }}>CDI, CDD, avenant temps partiel → plein, avenant salaire… PDF, TXT, DOCX</div>
        </button>

        {contratsLoaded > 0 && (
          <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6 }}>
            {contrats.map(c=>(
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'rgba(37,99,235,0.06)', borderRadius:8, border:'1px solid rgba(37,99,235,0.2)' }}>
                <span style={{ fontSize:16 }}>{c.isAvenant ? '📝' : '📋'}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)' }}>{c.isAvenant ? 'Avenant' : 'Contrat'} · {c.text.length > 100 ? '✅ Texte extrait' : '⚠ Texte court'}</div>
                </div>
                {!analyzing && <button onClick={()=>removeContrat(c.id)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:16 }}>×</button>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── SECTION 2 : Fiches de paie ── */}
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div>
            <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:14 }}>💰 Fiches de paie</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Toutes vos fiches depuis votre embauche — sélection multiple</div>
          </div>
          {fichesLoaded > 0 && <Badge color="#7c3aed">{fichesLoaded} fiche(s)</Badge>}
        </div>

        <input ref={ficheInputRef} type="file" accept=".pdf,.txt,.docx" multiple style={{ display:'none' }}
          onChange={e=>{ handleFicheFiles(e.target.files); e.target.value=''; }} />
        <button onClick={()=>ficheInputRef.current?.click()} style={{
          width:'100%', background:'var(--input-bg)',
          border:`2px dashed ${fichesLoaded ? '#7c3aed' : 'var(--border)'}`,
          borderRadius:12, padding:'14px', cursor:'pointer', textAlign:'center',
          marginBottom: fichesLoaded ? 12 : 0,
        }}>
          <div style={{ fontSize:22, marginBottom:4 }}>📂</div>
          <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:13 }}>
            {fichesLoaded ? `${fichesLoaded} fiche(s) chargée(s) — ajouter d'autres` : 'Importer les fiches de paie'}
          </div>
          <div style={{ color:'var(--text-muted)', fontSize:11, marginTop:3 }}>PDF, TXT, DOCX — nommez vos fichiers par date pour un tri automatique (ex: 2024-01.pdf)</div>
        </button>

        {fichesLoaded > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {fiches.map(f=>(
              <div key={f.id} style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:8, padding:'9px 12px', background:'var(--input-bg)', borderRadius:10, border:'1px solid var(--border)' }}>
                <span style={{ fontSize:16, flexShrink:0 }}>
                  {f.duplicate?'🔁':f.status==='done'?'✅':f.status==='error'?'❌':f.status==='loading'?'⏳':'📄'}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color: f.duplicate ? 'var(--text-muted)' : 'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration: f.duplicate ? 'line-through' : 'none' }}>{f.name}</div>
                  {f.duplicate&&<div style={{ fontSize:10, color:'#f59e0b', fontWeight:700 }}>🔁 Doublon détecté — ignoré automatiquement</div>}
                  {!f.duplicate&&f.status==='done'&&f.data&&(
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                      {f.data.mois_annee} · {f.data.salaire_brut} brut · {f.data.heures_travaillees}
                      {(f.data.anomalies?.length||f.data.indemnites_manquantes?.length||f.data.ecarts_contrat?.length)
                        ? <span style={{ color:'#ef4444', fontWeight:700 }}> · {(f.data.anomalies?.length||0)+(f.data.indemnites_manquantes?.length||0)+(f.data.ecarts_contrat?.length||0)} anomalie(s)</span>
                        : <span style={{ color:'#16a34a' }}> · ✓ conforme</span>}
                    </div>
                  )}
                  {!f.duplicate&&f.status==='error'&&<div style={{ fontSize:11, color:'#ef4444' }}>{f.error}</div>}
                  {!f.duplicate&&f.status==='pending'&&f.text.length<50&&<div style={{ fontSize:11, color:'#f59e0b' }}>⚠ Texte non extrait (PDF scanné ?)</div>}
                </div>
                {f.status==='done'&&<button onClick={()=>setShowDetail(showDetail===f.id?null:f.id)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:6, padding:'3px 8px', fontSize:11, color:'var(--text-muted)', cursor:'pointer', flexShrink:0 }}>détail</button>}
                {f.status==='done'&&<button onClick={()=>{setEditingNote(f.id);setNoteText(f.note||'');}} title="Ajouter une note ou corriger" style={{ background: f.note?'rgba(124,58,237,0.12)':'none', border:'1px solid var(--border)', borderRadius:6, padding:'3px 8px', fontSize:11, color: f.note?'#7c3aed':'var(--text-muted)', cursor:'pointer', flexShrink:0 }}>{f.note?'📝':'✏'}</button>}
                {!analyzing&&<button onClick={()=>removeFiche(f.id)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:16, flexShrink:0 }}>×</button>}
                {showDetail===f.id&&f.data&&(
                  <div style={{ width:'100%', background:'var(--card-bg)', borderRadius:8, padding:'10px 12px', fontSize:12 }}>
                    {f.data.violations_legales?.map((v,i)=><div key={i} style={{ color:'#dc2626', marginBottom:4, fontWeight:600 }}>🚫 {v.type} {v.article} : {v.violation} {v.impact?`— préjudice ~${v.impact}`:''} <span style={{ fontWeight:400, color:'#ef4444' }}>({v.sanction})</span></div>)}
                    {f.data.ecarts_contrat?.map((e,i)=><div key={i} style={{ color:'#7c3aed', marginBottom:3 }}>📋 Écart contrat : {e.element} — prévu : {e.contractuel} / versé : {e.reel} {e.impact?`(${e.impact})`:''}</div>)}
                    {f.data.anomalies?.map((a,i)=><div key={i} style={{ color:'#ef4444', marginBottom:3 }}>⚠ {a.ligne} : {a.probleme} {a.impact?`(${a.impact})`:''}</div>)}
                    {f.data.indemnites_manquantes?.map((ind,i)=><div key={i} style={{ color:'#f59e0b', marginBottom:3 }}>💸 Manquant : {ind.indemnite} ~{ind.montant_estime} <span style={{ color:'var(--text-muted)' }}>({ind.base_legale})</span></div>)}
                    {!f.data.violations_legales?.length&&!f.data.anomalies?.length&&!f.data.indemnites_manquantes?.length&&!f.data.ecarts_contrat?.length&&<div style={{ color:'#16a34a' }}>✅ Aucune anomalie — conforme au contrat</div>}
                    {f.note&&<div style={{ marginTop:8, padding:'6px 8px', background:'rgba(124,58,237,0.08)', borderRadius:6, color:'#7c3aed', fontSize:11 }}>📝 Votre note : {f.note}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Barre de progression */}
      {analyzing&&(
        <Card style={{ padding:'16px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <div>
              <span style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>
                {waitCountdown > 0 ? `⏸ Pause anti-quota… ${waitCountdown}s` : '⏳ Analyse en cours…'}
              </span>
              {timeRemaining>0&&!waitCountdown&&<span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:8 }}>temps restant : {fmtTime(timeRemaining)}</span>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#7c3aed' }}>{progress}%</span>
              <button onClick={stopAnalysis} style={{ background:'none', border:'1px solid var(--border)', borderRadius:6, padding:'3px 10px', fontSize:11, color:'var(--text-muted)', cursor:'pointer' }}>⏹ Stop</button>
            </div>
          </div>
          <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden', marginBottom:6 }}>
            <div style={{ height:'100%', width:`${progress}%`, background: waitCountdown > 0 ? 'linear-gradient(90deg,#f59e0b,#f97316)' : 'linear-gradient(90deg,#7c3aed,#ef4444)', borderRadius:4, transition:'width 0.4s' }}/>
          </div>
          {progressLabel&&<div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>{progressLabel}</div>}
          <div style={{ fontSize:11, color:'var(--text-muted)', display:'flex', gap:8, flexWrap:'wrap' }}>
            <span>✅ {fiches.filter(f=>f.status==='done').length} terminée(s)</span>
            <span>⏳ {fiches.filter(f=>f.status==='loading'||f.status==='pending').length} restante(s)</span>
            {fiches.filter(f=>f.status==='error').length>0&&<span style={{ color:'#ef4444' }}>❌ {fiches.filter(f=>f.status==='error').length} erreur(s)</span>}
            {contratsLoaded>0&&<span style={{ color:'#2563eb' }}>📋 {contratsLoaded} contrat(s) croisé(s)</span>}
          </div>
          <p style={{ color:'var(--text-muted)', fontSize:10, marginTop:6, margin:'6px 0 0', fontStyle:'italic' }}>15 secondes entre chaque analyse pour préserver votre quota API</p>
        </Card>
      )}

      {/* Quota atteint — banner + bouton reprendre */}
      {quotaHit&&!analyzing&&(
        <Card style={{ background:'rgba(245,158,11,0.08)', borderColor:'rgba(245,158,11,0.4)', padding:'16px 18px' }}>
          <div style={{ fontWeight:700, color:'#f59e0b', fontSize:14, marginBottom:6 }}>⏳ Quota API temporairement atteint</div>
          <p style={{ fontSize:12, color:'var(--text-muted)', margin:'0 0 12px' }}>
            {fiches.filter(f=>f.status==='done').length} fiche(s) analysée(s) sur {fiches.length}. Les {fiches.filter(f=>f.status==='error'&&f.retryable).length} restante(s) sont sauvegardées.
            Attendez <strong>quelques minutes</strong> que le quota se libère, puis cliquez <strong>"Reprendre"</strong> — les fiches déjà analysées ne seront pas refaites.
          </p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <Btn onClick={()=>{ resetErrorsToRetry(); analyzeAll(); }} style={{ fontSize:13, padding:'10px 18px' }}>
              ▶ Reprendre ({fiches.filter(f=>f.status==='error'&&f.retryable).length} fiche(s))
            </Btn>
            <Btn variant="secondary" onClick={()=>setQuotaHit(false)} style={{ fontSize:13, padding:'10px 18px' }}>
              ✓ Voir synthèse partielle
            </Btn>
          </div>
        </Card>
      )}

      {/* Bouton lancer */}
      {!analyzing&&!quotaHit&&pendingCount>0&&(
        <Btn onClick={analyzeAll} style={{ fontSize:14, padding:'14px' }}>
          🔍 Analyser {pendingCount} fiche(s){contratsLoaded?` · croisé avec ${contratsLoaded} contrat(s)/avenant(s)`:''}
        </Btn>
      )}

      {/* ── SYNTHÈSE ── */}
      {synthese&&(
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Total hero */}
          <Card style={{ background:'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(220,38,38,0.08))', borderColor:'rgba(239,68,68,0.4)', textAlign:'center', padding:'24px 20px' }}>
            <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:700, letterSpacing:1, marginBottom:6 }}>TOTAL DÛ PAR VOTRE EMPLOYEUR</div>
            <div style={{ fontSize:38, fontWeight:900, color:'#dc2626', marginBottom:4 }}>
              {synthese.totalDu.toLocaleString('fr-FR',{minimumFractionDigits:2})} €
            </div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>
              {synthese.nbFiches} fiche(s) · {synthese.months[0]?.mois} → {synthese.months[synthese.months.length-1]?.mois}
              {synthese.hasContrats&&<span style={{ color:'#2563eb', fontWeight:600 }}> · croisé avec {contratsLoaded} contrat(s)</span>}
            </div>
            {synthese.totalDu===0&&<p style={{ color:'#16a34a', fontWeight:700, marginTop:8 }}>✅ Aucune anomalie détectée sur la période</p>}
          </Card>

          {/* Écarts contrat */}
          {Object.keys(synthese.allEcarts).length>0&&(
            <Card style={{ background:'rgba(124,58,237,0.06)', borderColor:'rgba(124,58,237,0.3)' }}>
              <h3 style={{ color:'#7c3aed', fontSize:12, fontWeight:700, letterSpacing:1, marginBottom:10 }}>📋 ÉCARTS CONTRAT / FICHES DE PAIE</h3>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:10 }}>Ces éléments diffèrent entre ce que votre contrat prévoit et ce qui a été versé :</p>
              {Object.values(synthese.allEcarts).sort((a,b)=>b.total-a.total).map((e,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'9px 0', borderBottom:'1px solid rgba(124,58,237,0.15)' }}>
                  <div>
                    <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:13 }}>{e.element}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>Contractuel : {e.contractuel} · Versé : {e.reel} · {e.count} mois</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0, marginLeft:12 }}>
                    <div style={{ fontWeight:900, color:'#7c3aed', fontSize:15 }}>{e.total.toFixed(2)} €</div>
                    <div style={{ fontSize:10, color:'var(--text-muted)' }}>total estimé</div>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Convention collective — rappel dans la synthèse */}
          {synthese.activeCC&&(
            <Card style={{ background: manualCC ? 'rgba(22,163,74,0.07)' : 'rgba(37,99,235,0.07)', borderColor: manualCC ? 'rgba(22,163,74,0.3)' : 'rgba(37,99,235,0.3)', padding:'14px 18px' }}>
              <h3 style={{ color: manualCC ? '#16a34a' : '#2563eb', fontSize:12, fontWeight:700, letterSpacing:1, marginBottom:6 }}>
                {manualCC ? '✅ CONVENTION COLLECTIVE SÉLECTIONNÉE' : '📘 CONVENTION COLLECTIVE APPLIQUÉE'}
              </h3>
              <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:13, marginBottom:4 }}>{synthese.activeCC.nom} <span style={{ fontWeight:400, color:'var(--text-muted)' }}>— IDCC {synthese.activeCC.idcc}</span></div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{synthese.activeCC.avantages}</div>
            </Card>
          )}

          {/* Violations loi / convention collective */}
          {Object.keys(synthese.allViolations||{}).length>0&&(
            <Card style={{ background:'rgba(220,38,38,0.07)', borderColor:'rgba(220,38,38,0.4)' }}>
              <h3 style={{ color:'#dc2626', fontSize:12, fontWeight:700, letterSpacing:1, marginBottom:4 }}>🚫 VIOLATIONS LOI / CONVENTION COLLECTIVE</h3>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:10 }}>L'employeur ne respecte pas les dispositions suivantes. Ces violations peuvent faire l'objet d'un recours aux prud'hommes.</p>
              {Object.values(synthese.allViolations).sort((a,b)=>b.total-a.total).map((v,i)=>{
                const lkey = `viol:${v.article||v.violation?.slice(0,20)}`;
                return (
                <div key={i} style={{ padding:'10px 0', borderBottom:'1px solid rgba(220,38,38,0.15)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:13 }}>{v.violation}</div>
                      <div style={{ fontSize:11, color:'#dc2626', fontWeight:600, marginTop:2 }}>{v.type} · {v.article}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Sanction : {v.sanction} · {v.count} mois</div>
                    </div>
                    {v.total>0&&<div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontWeight:900, color:'#dc2626', fontSize:15 }}>{v.total.toFixed(2)} €</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)' }}>préjudice estimé</div>
                    </div>}
                  </div>
                  <button onClick={()=>generateLetter({...v,_label:v.violation},'Violation loi/CC')} disabled={!!generatingLetter} style={{ marginTop:6, background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.3)', borderRadius:6, padding:'4px 10px', fontSize:11, color:'#dc2626', cursor:'pointer' }}>
                    {generatingLetter===lkey?'⏳ Génération…':'✉ Générer lettre de recours'}
                  </button>
                  {generatedLetters[`show:${lkey}`]&&generatedLetters[lkey]&&(
                    <div style={{ marginTop:8, background:'var(--input-bg)', borderRadius:8, padding:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:11, fontWeight:700 }}>Lettre générée :</span>
                        <button onClick={()=>copyLetter(lkey)} style={{ background:'none', border:'none', fontSize:11, color:'#7c3aed', cursor:'pointer' }}>📋 Copier</button>
                      </div>
                      <pre style={{ fontSize:11, color:'var(--text-secondary)', whiteSpace:'pre-wrap', wordBreak:'break-word', maxHeight:200, overflow:'auto', margin:0 }}>{generatedLetters[lkey]}</pre>
                    </div>
                  )}
                </div>
              );})}
            </Card>
          )}

          {/* Changements de contrat */}
          {synthese.variations.length>0&&(
            <Card style={{ background:'var(--alert-blue-bg)', borderColor:'var(--alert-blue-border)' }}>
              <h3 style={{ color:'#2563eb', fontSize:12, fontWeight:700, letterSpacing:1, marginBottom:10 }}>📈 CHANGEMENTS DE RÉMUNÉRATION DÉTECTÉS</h3>
              {synthese.variations.map((v,i)=>(
                <div key={i} style={{ display:'flex', gap:10, alignItems:'center', padding:'7px 0', borderBottom:i<synthese.variations.length-1?'1px solid var(--border)':'none' }}>
                  <span style={{ fontWeight:700, color:'#2563eb', fontSize:12, minWidth:70 }}>{v.mois}</span>
                  <span style={{ color:'var(--text-muted)', fontSize:12 }}>{v.from.toFixed(2)}€</span>
                  <span style={{ color:'var(--text-muted)' }}>→</span>
                  <span style={{ fontWeight:700, color:v.to>v.from?'#16a34a':'#ef4444', fontSize:13 }}>{v.to.toFixed(2)}€ brut</span>
                  <Badge color={v.to>v.from?'#16a34a':'#ef4444'}>{v.to>v.from?'▲ hausse':'▼ baisse'}</Badge>
                </div>
              ))}
            </Card>
          )}

          {/* Anomalies récurrentes */}
          {Object.keys(synthese.allAnomalies).length>0&&(
            <Card style={{ background:'var(--alert-red-bg)', borderColor:'var(--alert-red-border)' }}>
              <h3 style={{ color:'#ef4444', fontSize:12, fontWeight:700, letterSpacing:1, marginBottom:4 }}>🚨 ANOMALIES SUR LES FICHES</h3>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:10 }}>Erreurs détectées sur vos bulletins de salaire — regroupées par type.</p>
              {Object.values(synthese.allAnomalies).sort((a,b)=>b.total-a.total).map((a,i)=>{
                const lkey = `anom:${a._label}`;
                return (
                <div key={i} style={{ padding:'10px 0', borderBottom:'1px solid rgba(239,68,68,0.15)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:13 }}>{a._label||a.ligne}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{a.probleme} · <strong>{a.count} mois</strong> concerné(s) : {a.months?.slice(0,4).join(', ')}{a.months?.length>4?'…':''}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontWeight:900, color:'#ef4444', fontSize:15 }}>{a.total.toFixed(2)} €</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)' }}>total estimé</div>
                    </div>
                  </div>
                  <button onClick={()=>generateLetter(a,'Anomalie de paie')} disabled={!!generatingLetter} style={{ marginTop:6, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:6, padding:'4px 10px', fontSize:11, color:'#ef4444', cursor:'pointer' }}>
                    {generatingLetter===lkey?'⏳ Génération…':'✉ Générer lettre de recours'}
                  </button>
                  {generatedLetters[`show:${lkey}`]&&generatedLetters[lkey]&&(
                    <div style={{ marginTop:8, background:'var(--input-bg)', borderRadius:8, padding:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:'var(--text-primary)' }}>Lettre générée :</span>
                        <button onClick={()=>copyLetter(lkey)} style={{ background:'none', border:'none', fontSize:11, color:'#7c3aed', cursor:'pointer' }}>📋 Copier</button>
                      </div>
                      <pre style={{ fontSize:11, color:'var(--text-secondary)', whiteSpace:'pre-wrap', wordBreak:'break-word', maxHeight:200, overflow:'auto', margin:0 }}>{generatedLetters[lkey]}</pre>
                    </div>
                  )}
                </div>
              );})}
            </Card>
          )}

          {/* Indemnités manquantes */}
          {Object.keys(synthese.allIndemnites).length>0&&(
            <Card style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.06))', borderColor:'rgba(245,158,11,0.4)' }}>
              <h3 style={{ color:'#f59e0b', fontSize:12, fontWeight:700, letterSpacing:1, marginBottom:4 }}>💸 PRIMES & INDEMNITÉS NON VERSÉES</h3>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:10 }}>Ces sommes auraient dû figurer sur vos bulletins selon la loi ou votre convention collective.</p>
              {Object.values(synthese.allIndemnites).sort((a,b)=>b.total-a.total).map((ind,i)=>{
                const lkey = `indem:${ind._label}`;
                return (
                <div key={i} style={{ padding:'10px 0', borderBottom:'1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:13 }}>{ind._label||ind.indemnite}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{ind.base_legale} · <strong>{ind.count} mois</strong> : {ind.months?.slice(0,4).join(', ')}{ind.months?.length>4?'…':''}</div>
                      <div style={{ fontSize:11, color:'#f59e0b', marginTop:2 }}>≈ {(ind.total/ind.count).toFixed(2)}€/mois en moyenne</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontWeight:900, color:'#f59e0b', fontSize:15 }}>{ind.total.toFixed(2)} €</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)' }}>total cumulé</div>
                    </div>
                  </div>
                  <button onClick={()=>generateLetter(ind,'Prime/indemnité manquante')} disabled={!!generatingLetter} style={{ marginTop:6, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.4)', borderRadius:6, padding:'4px 10px', fontSize:11, color:'#f59e0b', cursor:'pointer' }}>
                    {generatingLetter===lkey?'⏳ Génération…':'✉ Générer lettre de recours'}
                  </button>
                  {generatedLetters[`show:${lkey}`]&&generatedLetters[lkey]&&(
                    <div style={{ marginTop:8, background:'var(--input-bg)', borderRadius:8, padding:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:'var(--text-primary)' }}>Lettre générée :</span>
                        <button onClick={()=>copyLetter(lkey)} style={{ background:'none', border:'none', fontSize:11, color:'#7c3aed', cursor:'pointer' }}>📋 Copier</button>
                      </div>
                      <pre style={{ fontSize:11, color:'var(--text-secondary)', whiteSpace:'pre-wrap', wordBreak:'break-word', maxHeight:200, overflow:'auto', margin:0 }}>{generatedLetters[lkey]}</pre>
                    </div>
                  )}
                </div>
              );})}
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <h3 style={{ color:'var(--text-primary)', fontSize:12, fontWeight:700, letterSpacing:1, marginBottom:12 }}>📅 TIMELINE MOIS PAR MOIS</h3>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid var(--border)' }}>
                    {['Mois','Brut','Net','Heures',synthese.hasContrats?'Écart contrat':'—','Violations','Anomalies','Total dû'].map(h=>(
                      <th key={h} style={{ padding:'6px 8px', textAlign:'left', color:'var(--text-muted)', fontWeight:700, fontSize:10, letterSpacing:0.5, whiteSpace:'nowrap' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {synthese.months.map((m,i)=>(
                    <tr key={i} style={{ borderBottom:'1px solid var(--border)', background:m.duMois>0?'rgba(239,68,68,0.03)':'transparent' }}>
                      <td style={{ padding:'7px 8px', fontWeight:700, color:'var(--text-primary)', whiteSpace:'nowrap' }}>{m.mois}</td>
                      <td style={{ padding:'7px 8px', color:'var(--text-secondary)' }}>{m.brut>0?m.brut.toFixed(2)+'€':'—'}</td>
                      <td style={{ padding:'7px 8px', color:'var(--text-secondary)' }}>{m.net>0?m.net.toFixed(2)+'€':'—'}</td>
                      <td style={{ padding:'7px 8px', color:'var(--text-muted)' }}>{m.heures}</td>
                      <td style={{ padding:'7px 8px' }}>{m.ecartTotal>0?<span style={{ color:'#7c3aed', fontWeight:700 }}>+{m.ecartTotal.toFixed(2)}€</span>:<span style={{ color:'#16a34a' }}>✓</span>}</td>
                      <td style={{ padding:'7px 8px' }}>{m.violTotal>0?<span style={{ color:'#dc2626', fontWeight:700 }}>+{m.violTotal.toFixed(2)}€</span>:<span style={{ color:'#16a34a' }}>✓</span>}</td>
                      <td style={{ padding:'7px 8px' }}>{m.anomTotal+m.indemTotal>0?<span style={{ color:'#ef4444', fontWeight:700 }}>+{(m.anomTotal+m.indemTotal).toFixed(2)}€</span>:<span style={{ color:'#16a34a' }}>✓</span>}</td>
                      <td style={{ padding:'7px 8px', fontWeight:900, color:m.duMois>0?'#dc2626':'#16a34a' }}>{m.duMois>0?'+'+m.duMois.toFixed(2)+'€':'✓'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop:'2px solid var(--border)', background:'rgba(239,68,68,0.05)' }}>
                    <td colSpan={7} style={{ padding:'10px 8px', fontWeight:800, color:'var(--text-primary)', fontSize:13 }}>TOTAL DÛ</td>
                    <td style={{ padding:'10px 8px', fontWeight:900, color:'#dc2626', fontSize:15 }}>{synthese.totalDu.toLocaleString('fr-FR',{minimumFractionDigits:2})} €</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Chronologie contrats */}
          {synthese.contractTimeline?.documents?.length>0&&(
            <Card style={{ background:'rgba(22,163,74,0.05)', borderColor:'rgba(22,163,74,0.3)' }}>
              <h3 style={{ color:'#16a34a', fontSize:12, fontWeight:700, letterSpacing:1, marginBottom:12 }}>📋 CHRONOLOGIE DE VOS CONTRATS</h3>
              <div style={{ position:'relative' }}>
                {synthese.contractTimeline.documents.map((doc,i)=>(
                  <div key={i} style={{ display:'flex', gap:14, marginBottom:16 }}>
                    {/* Timeline line */}
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, width:20 }}>
                      <div style={{ width:12, height:12, borderRadius:'50%', background: doc.type==='Avenant'?'#f59e0b':'#16a34a', flexShrink:0 }}/>
                      {i<synthese.contractTimeline.documents.length-1&&<div style={{ width:2, flex:1, background:'var(--border)', marginTop:4 }}/>}
                    </div>
                    <div style={{ flex:1, paddingBottom:i<synthese.contractTimeline.documents.length-1?8:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                        <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:13 }}>{doc.type} — {doc.fonction||'—'}</div>
                        <Badge color={doc.type==='Avenant'?'#f59e0b':'#16a34a'}>{doc.type}</Badge>
                      </div>
                      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
                        {doc.date_debut&&<span>Du {doc.date_debut}</span>}{doc.date_fin&&<span> au {doc.date_fin}</span>}
                        {doc.heures_semaine&&<span> · {doc.heures_semaine}</span>}
                        {doc.salaire_brut&&<span> · {doc.salaire_brut} brut</span>}
                      </div>
                      {doc.modifications?.length>0&&(
                        <div style={{ marginTop:6 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:'#f59e0b', marginBottom:3 }}>Modifications :</div>
                          {doc.modifications.map((m,j)=><div key={j} style={{ fontSize:11, color:'var(--text-muted)', paddingLeft:8 }}>• {m}</div>)}
                        </div>
                      )}
                      {doc.points_cles?.length>0&&(
                        <div style={{ marginTop:4 }}>
                          {doc.points_cles.map((p,j)=><div key={j} style={{ fontSize:11, color:'var(--text-secondary)', paddingLeft:8 }}>→ {p}</div>)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {contrats.length>0&&!synthese.contractTimeline&&(
            <Card style={{ padding:'14px 18px', borderStyle:'dashed' }}>
              <div style={{ fontSize:12, color:'var(--text-muted)', textAlign:'center' }}>⏳ Analyse chronologique des contrats en cours…</div>
            </Card>
          )}

          {/* ── Commentaires & corrections post-analyse ── */}
          <Card style={{ background:'rgba(124,58,237,0.05)', borderColor:'rgba(124,58,237,0.25)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: showCommentBox ? 12 : 0 }}>
              <div>
                <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:13 }}>✏ Corriger ou préciser l'analyse</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>L'IA a fait une erreur ? Vous voulez ajouter un contexte ? Corrigez sans tout recommencer.</div>
              </div>
              <button onClick={()=>setShowCommentBox(v=>!v)} style={{ background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.3)', borderRadius:8, padding:'6px 12px', fontSize:12, color:'#7c3aed', cursor:'pointer', flexShrink:0 }}>
                {showCommentBox ? '▲ Fermer' : '✏ Ajouter commentaire'}
              </button>
            </div>
            {showCommentBox&&(
              <div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8 }}>
                  <strong>Commentaire global</strong> — s'applique à toute l'analyse (ex: "Je travaille aussi le dimanche depuis mars 2024", "Mon poste est en réalité responsable de secteur") :
                </div>
                <textarea
                  value={globalComment}
                  onChange={e=>setGlobalComment(e.target.value)}
                  placeholder="Ex: Mon employeur m'a dit verbalement que la prime de nuit avait été supprimée, mais rien par écrit. Je travaille effectivement le dimanche. Mon contrat initial était 24h mais j'ai toujours fait 30h sans avenant…"
                  style={{ width:'100%', minHeight:100, background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:8, padding:10, fontSize:12, color:'var(--text-primary)', resize:'vertical', boxSizing:'border-box', marginBottom:10 }}
                />
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>
                  <strong>Notes sur les fiches</strong> — utilisez le bouton ✏ sur chaque fiche pour des corrections spécifiques. Fiches avec note : {fiches.filter(f=>f.note).length}
                </div>
                {fiches.filter(f=>f.note).map(f=>(
                  <div key={f.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px', background:'rgba(124,58,237,0.06)', borderRadius:6, marginBottom:4, fontSize:11 }}>
                    <div>
                      <span style={{ fontWeight:700, color:'var(--text-primary)' }}>{f.data?.mois_annee||f.name}</span>
                      <span style={{ color:'var(--text-muted)', marginLeft:8 }}>{f.note.slice(0,60)}{f.note.length>60?'…':''}</span>
                    </div>
                    <button onClick={()=>{setEditingNote(f.id);setNoteText(f.note||'');}} style={{ background:'none', border:'none', fontSize:11, color:'#7c3aed', cursor:'pointer' }}>modifier</button>
                  </div>
                ))}
                <div style={{ display:'flex', gap:8, marginTop:12 }}>
                  <Btn
                    onClick={updateFromComments}
                    disabled={updatingFromComment || (!globalComment.trim() && !fiches.some(f=>f.note))}
                    style={{ flex:1, fontSize:13, opacity: updatingFromComment ? 0.7 : 1 }}
                  >
                    {updatingFromComment ? '⏳ Mise à jour en cours…' : "🔄 Mettre à jour l'analyse"}
                  </Btn>
                  <Btn variant="secondary" onClick={()=>setShowCommentBox(false)} style={{ fontSize:13 }}>Annuler</Btn>
                </div>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:8, marginBottom:0 }}>
                  Seules les fiches avec une note seront ré-analysées. Les autres restent intactes.
                </p>
              </div>
            )}
          </Card>

          {/* Actions */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <Btn onClick={exportSynthesePDF} style={{ flex:1, fontSize:13 }}>⬇ Télécharger le rapport complet PDF</Btn>
            <Btn onClick={()=>setPage('letters')} variant="secondary" style={{ flex:1, fontSize:13 }}>📄 Lettre de réclamation →</Btn>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <Btn onClick={saveAnalysis} variant="secondary" style={{ flex:1, fontSize:13 }}>💾 Sauvegarder l'analyse</Btn>
            <Btn onClick={()=>setPage('prudhommes')} variant="secondary" style={{ flex:1, fontSize:13 }}>⚖ Simulateur prud{"'"}hommes →</Btn>
          </div>
          <p style={{ fontSize:11, color:'var(--text-muted)', textAlign:'center' }}>Prescription : 3 ans pour rappel de salaire (art. L3245-1) · Estimation indicative</p>
        </div>
      )}
    </div>
  );
}



// ── Calculateur "Total dû par l'employeur" ─────────────────────────────────
function TotalDuCalculator({ monthlyTotal, anomalies, indemnites, parseEur, setPage, moisAnalyse, ancienneteMois, dateEntree }) {
  const autoMois = ancienneteMois && ancienneteMois > 0 ? Math.min(ancienneteMois, 36) : null;
  const [mois, setMois] = useState(autoMois || 1);
  const [showDetail, setShowDetail] = useState(false);
  const [overridden, setOverridden] = useState(false);
  const displayMois = overridden ? mois : (autoMois || mois);
  const totalDu = Math.round(monthlyTotal * displayMois * 100) / 100;

  function exportDette() {
    const lines = [
      "RECAPITULATIF — SOMMES DUES PAR L'EMPLOYEUR", "=".repeat(50), "",
      `Fiche de paie analysée : ${moisAnalyse || "—"}`,
      dateEntree ? `Date d'entrée : ${dateEntree}` : "",
      `Ancienneté : ${ancienneteMois ? ancienneteMois + " mois" : "non détectée"}`,
      `Période de réclamation : ${displayMois} mois`, "",
      "ANOMALIES DÉTECTÉES :",
      ...(anomalies||[]).map(a => `  • ${a.ligne} : ${a.probleme} (impact ~${a.impact})`),
      "", "INDEMNITÉS POTENTIELLEMENT MANQUANTES :",
      ...(indemnites||[]).map(i => `  • ${i.indemnite} : ~${i.montant_estime}/mois (${i.base_legale})`),
      "", `TOTAL ESTIMÉ SUR ${displayMois} MOIS : ${totalDu.toLocaleString('fr-FR', {minimumFractionDigits:2})} €`,
      "", "⚠ Estimation indicative. Consultez un professionnel du droit.",
    ].filter(l => l !== undefined);
    exportToPDF({ title: `Sommes dues — ${totalDu.toLocaleString('fr-FR')}€ sur ${displayMois} mois`, content: lines.join('\n'), filename: 'sommes-dues' });
  }

  return (
    <div style={{ marginTop:16 }}>
      <Card style={{ background:'linear-gradient(135deg,rgba(220,38,38,0.08),rgba(239,68,68,0.05))', borderColor:'rgba(220,38,38,0.3)' }}>
        <h3 style={{ color:'#dc2626', fontSize:13, fontWeight:800, marginBottom:12 }}>💰 TOTAL DÛ PAR VOTRE EMPLOYEUR</h3>
        <div style={{ textAlign:'center', marginBottom:12 }}>
          <div style={{ fontSize:36, fontWeight:900, color:'#dc2626' }}>{totalDu.toLocaleString('fr-FR', {minimumFractionDigits:2})} €</div>
          <div style={{ fontSize:11, color:'var(--text-muted)' }}>sur {displayMois} mois · Estimation indicative</div>
          {autoMois && !overridden && <div style={{ fontSize:11, color:'#2563eb', marginTop:4 }}>📅 Ancienneté détectée : {autoMois} mois</div>}
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:11, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Ajuster la période :</label>
          <input type="range" min={1} max={36} value={displayMois} onChange={e=>{setMois(Number(e.target.value));setOverridden(true);}} style={{ width:'100%' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-muted)' }}><span>1 mois</span><span>{displayMois} mois</span><span>3 ans (max)</span></div>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={()=>setShowDetail(!showDetail)} style={{ flex:1, padding:'8px 12px', background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:8, fontSize:12, color:'var(--text-primary)', cursor:'pointer' }}>
            {showDetail ? '▲ Masquer détail' : '▼ Voir détail'}
          </button>
          <button onClick={exportDette} style={{ flex:1, padding:'8px 12px', background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.3)', borderRadius:8, fontSize:12, color:'#dc2626', cursor:'pointer' }}>⬇ Exporter PDF</button>
        </div>
        {showDetail && (
          <div style={{ marginTop:12 }}>
            {(anomalies||[]).length > 0 && <div style={{ marginBottom:8 }}>
              <div style={{ fontWeight:700, color:'#ef4444', fontSize:11, marginBottom:4 }}>Anomalies / mois :</div>
              {anomalies.map((a,i)=><div key={i} style={{ fontSize:11, color:'var(--text-muted)', paddingLeft:8 }}>• {a.ligne} : ~{a.impact}</div>)}
            </div>}
            {(indemnites||[]).length > 0 && <div>
              <div style={{ fontWeight:700, color:'#f59e0b', fontSize:11, marginBottom:4 }}>Indemnités manquantes / mois :</div>
              {indemnites.map((i,j)=><div key={j} style={{ fontSize:11, color:'var(--text-muted)', paddingLeft:8 }}>• {i.indemnite} : ~{i.montant_estime}</div>)}
            </div>}
          </div>
        )}
        <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
          <Btn onClick={()=>setPage('letters')} variant="secondary" style={{ flex:1, fontSize:12 }}>📄 Générer lettre →</Btn>
          <Btn onClick={()=>setPage('prudhommes')} variant="secondary" style={{ flex:1, fontSize:12 }}>⚖ Prud{"'"}hommes →</Btn>
        </div>
        <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:8, marginBottom:0, textAlign:'center' }}>Prescription 3 ans (art. L3245-1) · Estimation indicative, consultez un professionnel du droit</p>
      </Card>
    </div>
  );
}

// ============================================================
// 2. ANALYSE DOCUMENTS
// ============================================================
const MODES = [
  { id:"mail",         icon:"📧", title:"Mail / Courrier RH",          desc:"Analysez un mail ou courrier de votre employeur",  color:"#f59e0b" },
  { id:"avant_signer", icon:"✍", title:"Avant de signer",              desc:"Document qu'on vous demande de signer",           color:"#16a34a" },
  { id:"contrat",      icon:"📋", title:"Analyser mon contrat",          desc:"CDI, CDD — diagnostic complet",                   color:"#2563eb" },
  { id:"fiche_paie",   icon:"💰", title:"Fiche de paie",                 desc:"Analyse d'un bulletin de salaire",                color:"#7c3aed" },
  { id:"multi_fiches", icon:"📚", title:"Toutes mes fiches de paie",     desc:"Importez toutes vos fiches depuis l'embauche",     color:"#ef4444" },
];

function DocumentAnalysisPage({ setPage }) {
  const [mode, setMode] = useState(null);
  if (mode === 'multi_fiches') {
    const PROMPTS = {};
    function safeParseJSON(s) {
      try { return JSON.parse(s); } catch(_e) { return null; }
    }
    function sanitizeFicheResult(d) { return d; }
    return <MultiFichesAnalyzer setPage={setPage} PROMPTS={PROMPTS} safeParseJSON={safeParseJSON} sanitizeFicheResult={sanitizeFicheResult} />;
  }
  if (!mode) return (
    <div style={{ padding:'0 16px 80px' }}>
      <div style={{ paddingTop:16, marginBottom:16 }}>
        <h2 style={{ fontWeight:800, color:'var(--text-primary)', fontSize:20, marginBottom:4 }}>📄 Analyser un document</h2>
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>Choisissez le type de document à analyser</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {MODES.map(m=>(
          <Card key={m.id} onClick={()=>setMode(m.id)} style={{ cursor:'pointer', borderColor:m.color+'40', background:m.color+'08' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ fontSize:28, flexShrink:0 }}>{m.icon}</span>
              <div>
                <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:15 }}>{m.title}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{m.desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
  return (
    <div style={{ padding:'0 16px 80px' }}>
      <button onClick={()=>setMode(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', padding:'12px 0', display:'flex', alignItems:'center', gap:6 }}>← Retour</button>
      <SingleDocAnalyzer mode={mode} setPage={setPage} />
    </div>
  );
}

function SingleDocAnalyzer({ mode, setPage }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const fileInputRef = useRef(null);
  const modeInfo = MODES.find(m=>m.id===mode)||MODES[0];

  async function extractAndAnalyze(f) {
    setLoading(true); setResult(null);
    setLoadingStep('Extraction du texte...');
    let extracted = '';
    try {
      if (f.name.endsWith('.pdf')) {
        const lib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
        if (lib) {
          const ab = await f.arrayBuffer();
          const pdf = await lib.getDocument({data:ab}).promise;
          for (let p=1; p<=Math.min(pdf.numPages,12); p++) {
            const pg = await pdf.getPage(p);
            const tc = await pg.getTextContent();
            extracted += tc.items.map(i=>i.str).join(' ') + '\n';
          }
        }
      } else {
        extracted = await f.text();
      }
    } catch(_e) {}
    setText(extracted.slice(0,5000));
    setLoadingStep("Analyse IA en cours...");
    await analyzeText(extracted.slice(0,5000));
    setLoading(false);
  }

  async function analyzeText(txt) {
    const prompts = {
      mail: `Expert droit travail. Analyse ce document RH. JSON: {"verdict":"vert/orange/rouge","resume":"2 phrases","points_positifs":[],"points_negatifs":[],"droits":[],"conseil":""}`,
      avant_signer: `Expert droit travail. Analyse avant signature. JSON: {"verdict":"vert/orange/rouge","resume":"2 phrases","clauses_conformes":[],"points_problematiques":[],"clauses_manquantes":[],"negocier":[],"conseil":""}`,
      contrat: `Expert droit travail France. JSON: {"type_contrat":"CDI/CDD","score_conformite":75,"resume":"2 phrases","infos_cles":{"salaire_brut_mensuel":"Xe","temps_travail":"35h","date_debut":"DD/MM/AAAA","convention_collective":"nom ou null"},"points_problematiques":[],"actions_recommandees":[],"conseil":""}`,
      fiche_paie: `Expert paie France. JSON: {"mois_annee":"MM/AAAA","salaire_brut":"Xe","salaire_net":"Xe","heures_travaillees":"Xh","convention_collective":"nom ou null","anomalies":[],"indemnites_manquantes":[],"conseil":""}`,
    };
    const sys = prompts[mode] || prompts.mail;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1200, system:sys, messages:[{role:'user',content:txt||'Document vide'}] })
      });
      const d = await r.json();
      if (d.error) { setResult({error:'Erreur API : ' + (d.error.message||'inconnue')}); return; }
      const raw = (d.content?.map(b=>b.text||'').join('')||'').replace(/```json|```/g,'').trim();
      try { setResult(JSON.parse(raw)); } catch(_e) { setResult({error:'Réponse invalide', raw:raw.slice(0,200)}); }
    } catch(e) { setResult({error:'Erreur réseau : ' + e.message}); }
  }

  const verdictColor = { vert:'#16a34a', orange:'#f59e0b', rouge:'#dc2626' };
  const verdictLabel = { vert:'✅ Document conforme', orange:'⚠ Points à vérifier', rouge:'🚨 Problèmes détectés' };

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <h2 style={{ fontWeight:800, color:'var(--text-primary)', fontSize:18, marginBottom:4 }}>{modeInfo.icon} {modeInfo.title}</h2>
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>{modeInfo.desc}</p>
      </div>
      {!file && (
        <Card style={{ textAlign:'center', padding:'32px 20px', cursor:'pointer', borderStyle:'dashed' }} onClick={()=>fileInputRef.current?.click()}>
          <div style={{ fontSize:40, marginBottom:8 }}>📎</div>
          <div style={{ fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>Importer votre document</div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>PDF, Word, TXT — ou collez le texte ci-dessous</div>
          <input ref={fileInputRef} type="file" accept=".pdf,.txt,.docx" style={{ display:'none' }} onChange={e=>{ if(e.target.files[0]){ setFile(e.target.files[0]); extractAndAnalyze(e.target.files[0]); }}}/>
        </Card>
      )}
      {!file && (
        <div style={{ marginTop:12 }}>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Ou collez ici le texte du document..." style={{ width:'100%', minHeight:120, background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:10, padding:12, fontSize:13, color:'var(--text-primary)', resize:'vertical', boxSizing:'border-box' }}/>
          {text.length > 20 && <Btn onClick={()=>analyzeText(text)} style={{ width:'100%', marginTop:8 }}>🔍 Analyser ce texte</Btn>}
        </div>
      )}
      {loading && (
        <Card style={{ textAlign:'center', padding:'24px' }}>
          <div style={{ fontSize:24, marginBottom:8 }}>⏳</div>
          <div style={{ color:'var(--text-muted)', fontSize:13 }}>{loadingStep}</div>
        </Card>
      )}
      {result && !result.error && (
        <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:12 }}>
          {result.verdict && (
            <Card style={{ background:(verdictColor[result.verdict]||'#888')+'10', borderColor:(verdictColor[result.verdict]||'#888')+'40', textAlign:'center', padding:'20px' }}>
              <div style={{ fontSize:18, fontWeight:800, color:verdictColor[result.verdict]||'#888' }}>{verdictLabel[result.verdict]||result.verdict}</div>
              {result.resume && <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:8, marginBottom:0 }}>{result.resume}</p>}
            </Card>
          )}
          {result.score_conformite !== undefined && (
            <Card style={{ textAlign:'center' }}>
              <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:4 }}>Score de conformité</div>
              <div style={{ fontSize:36, fontWeight:900, color: result.score_conformite>=70?'#16a34a':result.score_conformite>=40?'#f59e0b':'#dc2626' }}>{result.score_conformite}/100</div>
            </Card>
          )}
          {result.infos_cles && (
            <Card>
              <h3 style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', letterSpacing:1, marginBottom:10 }}>📋 INFORMATIONS CLÉS</h3>
              {Object.entries(result.infos_cles).filter(([,v])=>v&&v!=='null').map(([k,v],i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:12 }}>
                  <span style={{ color:'var(--text-muted)' }}>{k.replace(/_/g,' ')}</span>
                  <span style={{ fontWeight:700, color:'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </Card>
          )}
          {result.anomalies?.length > 0 && (
            <Card style={{ background:'rgba(239,68,68,0.05)', borderColor:'rgba(239,68,68,0.3)' }}>
              <h3 style={{ fontSize:12, fontWeight:700, color:'#ef4444', letterSpacing:1, marginBottom:8 }}>🚨 ANOMALIES</h3>
              {result.anomalies.map((a,i)=>(
                <div key={i} style={{ padding:'8px 0', borderBottom:'1px solid rgba(239,68,68,0.1)', fontSize:12 }}>
                  <div style={{ fontWeight:700, color:'var(--text-primary)' }}>{a.ligne||a}</div>
                  {a.probleme && <div style={{ color:'var(--text-muted)', marginTop:2 }}>{a.probleme}</div>}
                </div>
              ))}
            </Card>
          )}
          {result.indemnites_manquantes?.length > 0 && (
            <TotalDuCalculator monthlyTotal={result.indemnites_manquantes.reduce((s,i)=>{const m=String(i.montant_estime||'').match(/[\d.,]+/);return s+(m?parseFloat(m[0].replace(',','.')):0)},0)} anomalies={result.anomalies||[]} indemnites={result.indemnites_manquantes||[]} parseEur={s=>{const m=String(s||'').match(/[\d.,]+/);return m?parseFloat(m[0].replace(',','.')):0}} setPage={setPage} moisAnalyse={result.mois_annee} ancienneteMois={result.anciennete_mois} dateEntree={result.date_entree}/>
          )}
          {result.conseil && (
            <Card style={{ background:'rgba(37,99,235,0.05)', borderColor:'rgba(37,99,235,0.2)' }}>
              <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:700, marginBottom:4 }}>💡 CONSEIL</div>
              <div style={{ fontSize:13, color:'var(--text-primary)' }}>{result.conseil}</div>
            </Card>
          )}
          <div style={{ display:'flex', gap:8 }}>
            <Btn onClick={()=>{setFile(null);setResult(null);setText('');}} variant="secondary" style={{ flex:1, fontSize:12 }}>🔄 Nouvelle analyse</Btn>
            <Btn onClick={()=>setPage('letters')} variant="secondary" style={{ flex:1, fontSize:12 }}>📄 Générer lettre →</Btn>
          </div>
        </div>
      )}
      {result?.error && (
        <Card style={{ background:'rgba(239,68,68,0.05)', borderColor:'rgba(239,68,68,0.3)', marginTop:16 }}>
          <div style={{ color:'#ef4444', fontSize:13 }}>{result.error}</div>
          {result.raw && <pre style={{ fontSize:10, color:'var(--text-muted)', marginTop:8, whiteSpace:'pre-wrap' }}>{result.raw}</pre>}
        </Card>
      )}
    </div>
  );
}

// ============================================================
// 3. SITUATIONS GRAVES
// ============================================================
const SERIOUS_SITUATIONS = [
  { id:'harcelement', icon:'🚨', title:'Harcèlement moral ou sexuel', color:'#dc2626',
    steps:["Notez chaque fait avec date, heure, témoins","Conservez tous les écrits (mails, SMS, notes)","Signalez à votre responsable RH par écrit","Contactez le médecin du travail","Saisissez l'inspection du travail"],
    droits:["Droit à la protection contre le harcèlement (art. L1152-1)","Droit à des dommages et intérêts","Protection contre le licenciement abusif suite au signalement"],
    lettresSuggerees:["Harcèlement moral — alerte employeur","Signalement harcèlement RH"] },
  { id:'discrimination', icon:'⚖', title:'Discrimination', color:'#7c3aed',
    steps:["Documentez les faits discriminatoires","Comparez avec d'autres collègues dans la même situation","Saisissez le Défenseur des droits","Contactez un syndicat"],
    droits:["Interdiction de discrimination (art. L1132-1)","Droit à la réintégration ou indemnisation","Charge de la preuve partagée"],
    lettresSuggerees:["Discrimination — mise en demeure"] },
  { id:'inaptitude', icon:'🏥', title:'Inaptitude / Santé au travail', color:'#f59e0b',
    steps:["Consultez le médecin du travail","Demandez le document de reclassement","Vérifiez les propositions de reclassement","En cas de licenciement : vérifiez l'indemnité spéciale"],
    droits:["Obligation de reclassement de l'employeur","Indemnité spéciale de licenciement × 2","Droit à l'inaptitude professionnelle si AT/MP"],
    lettresSuggerees:["Inaptitude — demande reclassement"] },
  { id:'licenciement_abusif', icon:'⚡', title:'Licenciement abusif', color:'#ef4444',
    steps:["Vérifiez la lettre de licenciement (motif précis)","Calculez vos indemnités légales","Saisissez les prud'hommes dans les 12 mois","Demandez le barème Macron"],
    droits:["Indemnité légale de licenciement","Indemnité pour licenciement sans cause réelle","Barème Macron (0.5 à 20 mois de salaire)"],
    lettresSuggerees:["Contestation licenciement"] },
];

function SeriousSituationsPage({ setPage }) {
  const [selected, setSelected] = useState(null);
  const sit = SERIOUS_SITUATIONS.find(s=>s.id===selected);
  if (sit) return (
    <div style={{ padding:'0 16px 80px' }}>
      <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', padding:'12px 0' }}>← Retour</button>
      <Card style={{ background:sit.color+'10', borderColor:sit.color+'40', marginBottom:12 }}>
        <div style={{ fontSize:28, marginBottom:8 }}>{sit.icon}</div>
        <h2 style={{ fontWeight:800, color:sit.color, fontSize:18, marginBottom:4 }}>{sit.title}</h2>
      </Card>
      <Card style={{ marginBottom:12 }}>
        <h3 style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', letterSpacing:1, marginBottom:10 }}>ÉTAPES IMMÉDIATES</h3>
        {sit.steps.map((s,i)=>(
          <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:sit.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</div>
            <div style={{ fontSize:13, color:'var(--text-primary)', flex:1 }}>{s}</div>
          </div>
        ))}
      </Card>
      <Card style={{ background:'rgba(37,99,235,0.05)', borderColor:'rgba(37,99,235,0.2)', marginBottom:12 }}>
        <h3 style={{ fontSize:12, fontWeight:700, color:'#2563eb', letterSpacing:1, marginBottom:8 }}>⚖ VOS DROITS</h3>
        {sit.droits.map((d,i)=><div key={i} style={{ fontSize:12, color:'var(--text-primary)', padding:'4px 0' }}>→ {d}</div>)}
      </Card>
      <Btn onClick={()=>setPage('letters')} style={{ width:'100%' }}>📄 Générer une lettre de recours →</Btn>
    </div>
  );
  return (
    <div style={{ padding:'0 16px 80px' }}>
      <div style={{ paddingTop:16, marginBottom:16 }}>
        <h2 style={{ fontWeight:800, color:'var(--text-primary)', fontSize:20, marginBottom:4 }}>🆘 Situations graves</h2>
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>Parcours guidé pour les situations urgentes</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {SERIOUS_SITUATIONS.map(s=>(
          <Card key={s.id} onClick={()=>setSelected(s.id)} style={{ cursor:'pointer', borderColor:s.color+'40', background:s.color+'08' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ fontSize:28, flexShrink:0 }}>{s.icon}</span>
              <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:15 }}>{s.title}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 4. PRUD'HOMMES
// ============================================================
function PrudhommesPage({ setPage }) {
  const [anciennete, setAnciennete] = useState('');
  const [salaire, setSalaire] = useState('');
  const bareme = anciennete && salaire ? (() => {
    const a = parseFloat(anciennete); const s = parseFloat(salaire);
    if (!a||!s) return null;
    const min = Math.max(0, a < 1 ? 0 : a <= 2 ? 0.5 : Math.min(a * 0.5, 20));
    const max = Math.min(a * 1, 20);
    return { min: (min * s).toFixed(0), max: (max * s).toFixed(0), minMois: min.toFixed(1), maxMois: max.toFixed(1) };
  })() : null;
  const etapes = [
    { n:1, titre:"Tentative de conciliation", desc:"Obligatoire. Réunion devant le bureau de conciliation et d'orientation (BCO). Durée : 1 à 6 mois." },
    { n:2, titre:"Audience de jugement", desc:"Si pas d'accord en conciliation. Durée : 6 à 18 mois selon le tribunal." },
    { n:3, titre:"Décision du conseil", desc:"Délibéré. Exécution provisoire possible dès le jugement rendu." },
    { n:4, titre:"Appel (si nécessaire)", desc:"Dans les 30 jours du jugement devant la Cour d'appel." },
  ];
  return (
    <div style={{ padding:'0 16px 80px' }}>
      <div style={{ paddingTop:16, marginBottom:16 }}>
        <h2 style={{ fontWeight:800, color:'var(--text-primary)', fontSize:20, marginBottom:4 }}>⚖ Prud{"'"}hommes</h2>
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>Barème Macron et étapes de la procédure</p>
      </div>
      <Card style={{ marginBottom:12 }}>
        <h3 style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', letterSpacing:1, marginBottom:12 }}>📊 CALCULATEUR BARÈME MACRON</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <Input label="Ancienneté (années)" type="number" value={anciennete} onChange={e=>setAnciennete(e.target.value)} placeholder="Ex: 3.5"/>
          <Input label="Salaire brut mensuel (€)" type="number" value={salaire} onChange={e=>setSalaire(e.target.value)} placeholder="Ex: 2000"/>
        </div>
        {bareme && (
          <div style={{ marginTop:12, padding:12, background:'rgba(37,99,235,0.06)', borderRadius:8, textAlign:'center' }}>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>Indemnité estimée</div>
            <div style={{ fontWeight:900, color:'#dc2626', fontSize:22 }}>{Number(bareme.min).toLocaleString('fr-FR')} € — {Number(bareme.max).toLocaleString('fr-FR')} €</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{bareme.minMois} à {bareme.maxMois} mois de salaire (barème Macron)</div>
          </div>
        )}
      </Card>
      <Card style={{ marginBottom:12 }}>
        <h3 style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', letterSpacing:1, marginBottom:12 }}>📅 ÉTAPES DE LA PROCÉDURE</h3>
        {etapes.map(e=>(
          <div key={e.n} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'#2563eb', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>{e.n}</div>
            <div>
              <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:13 }}>Étape {e.n} — {e.titre}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{e.desc}</div>
            </div>
          </div>
        ))}
      </Card>
      <Card style={{ background:'rgba(22,163,74,0.05)', borderColor:'rgba(22,163,74,0.3)' }}>
        <h3 style={{ fontSize:12, fontWeight:700, color:'#16a34a', letterSpacing:1, marginBottom:8 }}>⏰ DÉLAIS IMPORTANTS</h3>
        {[["Licenciement","12 mois pour saisir"],["Discrimination","5 ans"],["Rappel de salaire","3 ans"],["Harcèlement moral","5 ans"]].map(([k,v],i)=>(
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:12 }}>
            <span style={{ color:'var(--text-muted)' }}>{k}</span><span style={{ fontWeight:700, color:'var(--text-primary)' }}>{v}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ============================================================
// 5. SITUATION RÉELLE  
// ============================================================
function SituationReellePage({ setPage }) {
  const [tunnel, setTunnel] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [advice, setAdvice] = useState(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const tunnels = [
    { id:'nego', icon:'💰', title:'Négocier mon salaire', color:'#16a34a',
      questions:[
        { key:'poste', q:'Quel est votre poste actuel ?', opts:['Employé','Technicien','Cadre','Manager','Autre'] },
        { key:'anciennete', q:'Depuis combien de temps ?', opts:['Moins d\'1 an','1 à 3 ans','3 à 5 ans','Plus de 5 ans'] },
        { key:'levier', q:'Avez-vous des arguments/leviers ?', opts:['Bilan positif','Offre concurrente','Ancienneté','Responsabilités accrues'] },
      ]},
    { id:'harcelement', icon:'🚨', title:'Harcèlement / discrimination', color:'#dc2626',
      questions:[
        { key:'type', q:'De quel type ?', opts:['Harcèlement moral','Harcèlement sexuel','Discrimination','Autre'] },
        { key:'frequence', q:'Depuis quand ?', opts:['Récemment','Depuis quelques mois','Depuis longtemps'] },
        { key:'preuves', q:'Avez-vous des preuves ?', opts:['Écrits/mails','Témoins','Pas encore','Les deux'] },
      ]},
    { id:'licenciement', icon:'⚡', title:'Licenciement / rupture', color:'#ef4444',
      questions:[
        { key:'type', q:'Quelle situation ?', opts:['Licenciement économique','Licenciement personnel','Rupture conventionnelle','Démission forcée'] },
        { key:'anciennete', q:'Ancienneté ?', opts:['Moins d\'1 an','1 à 2 ans','2 à 5 ans','Plus de 5 ans'] },
        { key:'contestation', q:'Voulez-vous contester ?', opts:['Oui absolument','Peut-être','Non / Négocier'] },
      ]},
    { id:'conditions', icon:'🏭', title:'Conditions de travail', color:'#7c3aed',
      questions:[
        { key:'probleme', q:'Quel est le problème ?', opts:['Heures supplémentaires non payées','Danger pour la santé','Non-respect du contrat','Autre'] },
        { key:'gravite', q:'Niveau d\'urgence ?', opts:['Urgent / Danger','Important','Récurrent','Ponctuel'] },
      ]},
  ];

  const t = tunnels.find(t=>t.id===tunnel);

  async function getAdvice() {
    if (!t) return;
    setLoadingAdvice(true);
    const ctx = Object.entries(answers).map(([k,v])=>`${k}: ${v}`).join(', ');
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:800,
          system:'Expert droit travail France. Réponds en JSON: {"resume":"situation en 2 phrases","priorites":["action1","action2","action3"],"droits":["droit1","droit2"],"recours":"prud\'hommes/inspection/syndicat/autre","urgence":"haute/moyenne/basse","conseil_lettre":"titre lettre recommandée ou null"}',
          messages:[{role:'user',content:'Situation: ' + t.title + '. ' + ctx}]
        })
      });
      const d = await r.json();
      const raw = (d.content?.map(b=>b.text||'').join('')||'').replace(/```json|```/g,'').trim();
      try { setAdvice(JSON.parse(raw)); } catch(_e) { setAdvice({resume:'Conseil chargé.', priorites:['Consultez un professionnel du droit'], droits:[], recours:'syndicat', urgence:'moyenne'}); }
    } catch(_e) { setAdvice({resume:'Erreur réseau.', priorites:[], droits:[], recours:'', urgence:'basse'}); }
    setLoadingAdvice(false);
  }

  if (!tunnel) return (
    <div style={{ padding:'0 16px 80px' }}>
      <div style={{ paddingTop:16, marginBottom:16 }}>
        <h2 style={{ fontWeight:800, color:'var(--text-primary)', fontSize:20, marginBottom:4 }}>🎯 Ma situation réelle</h2>
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>Parcours guidé personnalisé — choisissez votre situation</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {tunnels.map(t=>(
          <Card key={t.id} onClick={()=>{setTunnel(t.id);setStep(0);setAnswers({});setAdvice(null);}} style={{ cursor:'pointer', borderColor:t.color+'40', background:t.color+'08' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <span style={{ fontSize:28, flexShrink:0 }}>{t.icon}</span>
              <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:15 }}>{t.title}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const q = t.questions[step];
  if (advice) return (
    <div style={{ padding:'0 16px 80px' }}>
      <button onClick={()=>{setTunnel(null);setAdvice(null);}} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', padding:'12px 0' }}>← Recommencer</button>
      <Card style={{ background:'rgba(37,99,235,0.07)', borderColor:'rgba(37,99,235,0.3)', marginBottom:12 }}>
        <h3 style={{ color:'#2563eb', fontSize:13, fontWeight:700, marginBottom:8 }}>📋 VOTRE SITUATION</h3>
        <p style={{ fontSize:13, color:'var(--text-primary)', marginBottom:0 }}>{advice.resume}</p>
      </Card>
      {advice.priorites?.length > 0 && (
        <Card style={{ marginBottom:12 }}>
          <h3 style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', letterSpacing:1, marginBottom:8 }}>🎯 PRIORITÉS</h3>
          {advice.priorites.map((p,i)=>(
            <div key={i} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:20, height:20, borderRadius:'50%', background:t.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, flexShrink:0 }}>{i+1}</div>
              <span style={{ fontSize:13, color:'var(--text-primary)' }}>{p}</span>
            </div>
          ))}
        </Card>
      )}
      <div style={{ display:'flex', gap:8 }}>
        <Btn onClick={()=>setPage('letters')} style={{ flex:1, fontSize:12 }}>📄 Générer lettre</Btn>
        <Btn onClick={()=>setPage(advice.recours==='prudhommes'?'prudhommes':'support')} variant="secondary" style={{ flex:1, fontSize:12 }}>→ Suite</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ padding:'0 16px 80px' }}>
      <button onClick={()=>step===0?setTunnel(null):setStep(s=>s-1)} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:13, cursor:'pointer', padding:'12px 0' }}>← Retour</button>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>Étape {step+1}/{t.questions.length}</div>
        <div style={{ height:4, background:'var(--input-bg)', borderRadius:2 }}>
          <div style={{ height:4, background:t.color, borderRadius:2, width:((step+1)/t.questions.length*100)+'%', transition:'width 0.3s' }}/>
        </div>
      </div>
      <Card>
        <h3 style={{ fontWeight:700, color:'var(--text-primary)', fontSize:16, marginBottom:16 }}>{q.q}</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {q.opts.map(opt=>(
            <button key={opt} onClick={()=>{
              const newA = {...answers, [q.key]: opt};
              setAnswers(newA);
              if (step < t.questions.length - 1) setStep(s=>s+1);
              else { setAnswers(newA); getAdvice(); }
            }} style={{ padding:'12px 16px', background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:10, fontSize:14, color:'var(--text-primary)', cursor:'pointer', textAlign:'left', transition:'all 0.2s' }}>
              {opt}
            </button>
          ))}
        </div>
      </Card>
      {loadingAdvice && <Card style={{ textAlign:'center', marginTop:12 }}><div style={{ color:'var(--text-muted)' }}>⏳ Analyse en cours…</div></Card>}
    </div>
  );
}

// ============================================================
// 6. DOSSIER PRUD'HOMAL
// ============================================================
function DossierPrudhomesPage({ setPage }) {
  const [facts, setFacts] = useState(() => { try { return JSON.parse(localStorage.getItem('lv_facts')||'[]'); } catch(_e) { return []; } });
  const [claims, setClaims] = useState(() => { try { return JSON.parse(localStorage.getItem('lv_claims')||'[]'); } catch(_e) { return []; } });
  const [newFact, setNewFact] = useState({ date:'', type:'salaire', description:'' });
  const [newClaim, setNewClaim] = useState({ type:'', montant:'', base:'' });
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [tab, setTab] = useState('faits');

  function saveFacts(f) { setFacts(f); try { localStorage.setItem('lv_facts',JSON.stringify(f)); } catch(_e) {} }
  function saveClaims(c) { setClaims(c); try { localStorage.setItem('lv_claims',JSON.stringify(c)); } catch(_e) {} }

  function addFact() {
    if (!newFact.description) return;
    saveFacts([...facts, {...newFact, id:Date.now()}]);
    setNewFact({ date:'', type:'salaire', description:'' });
  }
  function addClaim() {
    if (!newClaim.type) return;
    saveClaims([...claims, {...newClaim, id:Date.now()}]);
    setNewClaim({ type:'', montant:'', base:'' });
  }

  async function analyzeRisk() {
    setLoadingRisk(true);
    const summary = 'Faits : ' + facts.map(f=>'[' + f.date + '] ' + f.type + ': ' + f.description).join('; ') + '. Réclamations : ' + claims.map(c=>c.type + ' (' + c.montant + ')').join('; ');
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:800,
          system:'Expert droit prud\'homal. JSON: {"chances":"fortes/moyennes/faibles","points_forts":["p1"],"points_faibles":["p2"],"manques":["m1"],"conseil":"conseil en 2 phrases"}',
          messages:[{role:'user',content:summary||'Dossier vide'}]
        })
      });
      const d = await r.json();
      const raw = (d.content?.map(b=>b.text||'').join('')||'').replace(/```json|```/g,'').trim();
      try { setRiskAnalysis(JSON.parse(raw)); } catch(_e) { setRiskAnalysis({error:'Analyse indisponible.'}); }
    } catch(_e) { setRiskAnalysis({error:'Erreur réseau.'}); }
    setLoadingRisk(false);
  }

  function exportDossier() {
    const lines = [
      "DOSSIER PRUD'HOMAL — LégalementVôtre", "=".repeat(50), "",
      "FAITS DOCUMENTÉS :", ...facts.map(f=>`  [${f.date||'?'}] ${f.type}: ${f.description}`), "",
      "RÉCLAMATIONS :", ...claims.map(c=>`  ${c.type} : ${c.montant} (base: ${c.base})`), "",
      riskAnalysis && !riskAnalysis.error ? `ANALYSE DES CHANCES : ${riskAnalysis.chances}\n${riskAnalysis.conseil}` : "",
    ].filter(Boolean);
    exportToPDF({ title:"Dossier Prud'homal", content:lines.join('\n'), filename:'dossier-prudhommes' });
  }

  const tabStyle = (t) => ({ padding:'8px 14px', fontSize:12, fontWeight:700, border:'none', borderRadius:8, cursor:'pointer', background: tab===t ? '#2563eb' : 'var(--input-bg)', color: tab===t ? '#fff' : 'var(--text-muted)' });

  return (
    <div style={{ padding:'0 16px 80px' }}>
      <div style={{ paddingTop:16, marginBottom:12 }}>
        <h2 style={{ fontWeight:800, color:'var(--text-primary)', fontSize:20, marginBottom:4 }}>📁 Dossier prud{"'"}homal</h2>
        <p style={{ color:'var(--text-muted)', fontSize:13 }}>Constituez votre dossier étape par étape</p>
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {[['faits','Faits'],['reclamations','Réclamations'],['analyse','Analyse']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={tabStyle(k)}>{l}</button>
        ))}
      </div>
      {tab==='faits' && (
        <div>
          <Card style={{ marginBottom:12 }}>
            <h3 style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', letterSpacing:1, marginBottom:10 }}>+ AJOUTER UN FAIT</h3>
            <Input label="Date" type="date" value={newFact.date} onChange={e=>setNewFact({...newFact,date:e.target.value})}/>
            <div style={{ marginTop:8 }}>
              <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Type</label>
              <select value={newFact.type} onChange={e=>setNewFact({...newFact,type:e.target.value})} style={{ width:'100%', padding:'10px 12px', background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:8, fontSize:13, color:'var(--text-primary)' }}>
                {['salaire','heures','harcèlement','discrimination','licenciement','autre'].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginTop:8 }}>
              <label style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Description</label>
              <textarea value={newFact.description} onChange={e=>setNewFact({...newFact,description:e.target.value})} placeholder="Décrivez le fait précisément..." style={{ width:'100%', minHeight:80, background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:8, padding:10, fontSize:12, color:'var(--text-primary)', resize:'vertical', boxSizing:'border-box' }}/>
            </div>
            <Btn onClick={addFact} style={{ width:'100%', marginTop:10 }}>+ Ajouter ce fait</Btn>
          </Card>
          {facts.length === 0 && <p style={{ color:'var(--text-muted)', fontSize:13, textAlign:'center' }}>Aucun fait documenté. Ajoutez-en ci-dessus.</p>}
          {facts.map((f,i)=>(
            <Card key={f.id} style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <Badge color="#2563eb">{f.type}</Badge>
                  {f.date && <span style={{ fontSize:11, color:'var(--text-muted)', marginLeft:8 }}>{f.date}</span>}
                  <div style={{ fontSize:13, color:'var(--text-primary)', marginTop:4 }}>{f.description}</div>
                </div>
                <button onClick={()=>saveFacts(facts.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:16, padding:'0 0 0 8px' }}>×</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {tab==='reclamations' && (
        <div>
          <Card style={{ marginBottom:12 }}>
            <h3 style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', letterSpacing:1, marginBottom:10 }}>+ AJOUTER UNE RÉCLAMATION</h3>
            <Input label="Type de réclamation" value={newClaim.type} onChange={e=>setNewClaim({...newClaim,type:e.target.value})} placeholder="Ex: Rappel salaire, Heures sup..."/>
            <div style={{ marginTop:8 }}><Input label="Montant estimé" value={newClaim.montant} onChange={e=>setNewClaim({...newClaim,montant:e.target.value})} placeholder="Ex: 1500€"/></div>
            <div style={{ marginTop:8 }}><Input label="Base légale" value={newClaim.base} onChange={e=>setNewClaim({...newClaim,base:e.target.value})} placeholder="Ex: Art. L3121-28"/></div>
            <Btn onClick={addClaim} style={{ width:'100%', marginTop:10 }}>+ Ajouter</Btn>
          </Card>
          {claims.map((c,i)=>(
            <Card key={c.id} style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:13 }}>{c.type}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{c.montant} · {c.base}</div>
                </div>
                <button onClick={()=>saveClaims(claims.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:16 }}>×</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {tab==='analyse' && (
        <div>
          <Btn onClick={analyzeRisk} disabled={loadingRisk||facts.length===0} style={{ width:'100%', marginBottom:12 }}>
            {loadingRisk ? '⏳ Analyse…' : '🔍 Analyser mes chances'}
          </Btn>
          {riskAnalysis && !riskAnalysis.error && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <Card style={{ textAlign:'center' }}>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4 }}>Chances aux prud'hommes</div>
                <div style={{ fontWeight:900, fontSize:22, color:riskAnalysis.chances==='fortes'?'#16a34a':riskAnalysis.chances==='moyennes'?'#f59e0b':'#dc2626' }}>{riskAnalysis.chances?.toUpperCase()}</div>
              </Card>
              {riskAnalysis.points_forts?.length > 0 && <Card><h3 style={{ color:'#16a34a', fontSize:12, fontWeight:700, marginBottom:8 }}>✅ Points forts</h3>{riskAnalysis.points_forts.map((p,i)=><div key={i} style={{ fontSize:12, color:'var(--text-primary)', padding:'2px 0' }}>→ {p}</div>)}</Card>}
              {riskAnalysis.manques?.length > 0 && <Card><h3 style={{ color:'#f59e0b', fontSize:12, fontWeight:700, marginBottom:8 }}>⚠ À compléter</h3>{riskAnalysis.manques.map((p,i)=><div key={i} style={{ fontSize:12, color:'var(--text-primary)', padding:'2px 0' }}>→ {p}</div>)}</Card>}
              {riskAnalysis.conseil && <Card style={{ background:'rgba(37,99,235,0.05)', borderColor:'rgba(37,99,235,0.2)' }}><div style={{ fontSize:12, color:'var(--text-primary)' }}>{riskAnalysis.conseil}</div></Card>}
            </div>
          )}
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <Btn onClick={exportDossier} variant="secondary" style={{ flex:1, fontSize:12 }}>⬇ Exporter PDF</Btn>
            <Btn onClick={()=>setPage('letters')} variant="secondary" style={{ flex:1, fontSize:12 }}>📄 Lettre →</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const [page, setPage] = useState('home');
  const [theme, setTheme] = useState(() => localStorage.getItem('lv_theme') || 'dark');
  const [drawerOpen, setDrawerOpen] = useState(false);

  function setThemeAndSave(t) { setTheme(t); try { localStorage.setItem('lv_theme', t); } catch(_e) {} }

  useEffect(() => {
    const root = document.documentElement;
    // Inject or update the theme style tag
    let styleTag = document.getElementById('lv-theme-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'lv-theme-style';
      document.head.appendChild(styleTag);
    }
    if (theme === 'dark') {
      root.style.setProperty('--bg', '#0f172a');
      root.style.setProperty('--card-bg', '#1e293b');
      root.style.setProperty('--card-border', '#334155');
      root.style.setProperty('--card-shadow', '0 1px 3px rgba(0,0,0,0.4)');
      root.style.setProperty('--border', '#334155');
      root.style.setProperty('--input-bg', '#0f172a');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--alert-green-bg', 'rgba(22,163,74,0.1)');
      root.style.setProperty('--alert-green-border', 'rgba(22,163,74,0.3)');
      root.style.setProperty('--alert-yellow-bg', 'rgba(234,179,8,0.1)');
      root.style.setProperty('--alert-yellow-border', 'rgba(234,179,8,0.3)');
      document.body.style.background = '#0f172a';
      styleTag.textContent = `
        .theme-dark input, .theme-dark textarea, .theme-dark select {
          background: #0f172a !important;
          color: #f1f5f9 !important;
          border-color: #334155 !important;
        }
      `;
    } else {
      root.style.setProperty('--bg', '#f8fafc');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--card-border', '#e2e8f0');
      root.style.setProperty('--card-shadow', '0 1px 3px rgba(0,0,0,0.08)');
      root.style.setProperty('--border', '#e2e8f0');
      root.style.setProperty('--input-bg', '#f8fafc');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#1e293b');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--alert-green-bg', '#f0fdf4');
      root.style.setProperty('--alert-green-border', '#bbf7d0');
      root.style.setProperty('--alert-yellow-bg', '#fffbeb');
      root.style.setProperty('--alert-yellow-border', '#fde68a');
      document.body.style.background = '#f8fafc';
      styleTag.textContent = '';
    }
  }, [theme]);

  const morePages = [
    { id:'simulators', icon:'🧮', label:'Simulateurs' },
    { id:'contract', icon:'📋', label:'Mon contrat' },
    { id:'deadlines', icon:'⏰', label:'Délais' },
    { id:'dashboard', icon:'📁', label:'Mon dossier' },
    { id:'proofs', icon:'📔', label:'Journal preuves' },
    { id:'support', icon:'🤝', label:'Aide gratuite' },
    { id:'multilingual', icon:'🌍', label:'Multilingue' },
    { id:'glossary', icon:'📖', label:'Glossaire' },
    { id:'news', icon:'📰', label:'Veille 2026' },
    { id:'quiz', icon:'🎯', label:'Quiz droits' },
    { id:'situation', icon:'🎯', label:'Ma situation' },
    { id:'dossier_prud', icon:'⚖', label:'Dossier CPH' },
  ];

  const navItems = [
    { id:'home', icon:'🏠', label:'Accueil' },
    { id:'chat', icon:'💬', label:'Chat IA' },
    { id:'letters', icon:'📄', label:'Lettres' },
    { id:'serious', icon:'🆘', label:'Urgences' },
  ];

  function renderPage() {
    switch(page) {
      case 'home': return <HomePage setPage={setPage}/>;
      case 'rights': return <RightsNavigatorPage setPage={setPage}/>;
      case 'chat': return <ChatPage/>;
      case 'letters': return <LettersPage setPage={setPage}/>;
      case 'simulators': return <SimulatorsPage setPage={setPage}/>;
      case 'contract': return <ContractPage setPage={setPage}/>;
      case 'documents': return <DocumentAnalysisPage setPage={setPage}/>;
      case 'serious': return <SeriousSituationsPage setPage={setPage}/>;
      case 'prudhommes': return <PrudhommesPage setPage={setPage}/>;
      case 'deadlines': return <DeadlinesPage/>;
      case 'dashboard': return <DashboardPage setPage={setPage}/>;
      case 'proofs': return <ProofsPage/>;
      case 'support': return <SupportPage/>;
      case 'multilingual': return <MultilingualPage/>;
      case 'glossary': return <GlossaryPage/>;
      case 'news': return <NewsPage/>;
      case 'quiz': return <QuizPage/>;
      case 'situation': return <SituationReellePage setPage={setPage}/>;
      case 'dossier_prud': return <DossierPrudhomesPage setPage={setPage}/>;
      default: return <HomePage setPage={setPage}/>;
    }
  }

  return (
    <div className={`theme-${theme}`} style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text-primary)', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", maxWidth:480, margin:'0 auto', position:'relative' }}>
      {/* Header */}
      <div style={{ position:'sticky', top:0, zIndex:100, background:'var(--card-bg)', borderBottom:'1px solid var(--border)', padding:'10px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, cursor:'pointer' }} onClick={()=>setPage('home')}>
          <span style={{ fontSize:22 }}>⚖</span>
          <span style={{ fontWeight:900, fontSize:17, letterSpacing:-0.5 }}>Légalement<span style={{ color:'#2563eb' }}>Vôtre</span></span>
        </div>
        {page !== 'home' && (
          <div style={{ background:'rgba(37,99,235,0.1)', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700, color:'#2563eb', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {[...navItems, ...morePages].find(p=>p.id===page)?.label || page}
          </div>
        )}
        <button onClick={()=>setThemeAndSave(theme==='dark'?'light':'dark')} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer' }}>{theme==='dark'?'☀':'🌙'}</button>
        <div style={{ background:'rgba(22,163,74,0.1)', border:'1px solid rgba(22,163,74,0.3)', borderRadius:20, padding:'3px 8px', fontSize:10, fontWeight:700, color:'#16a34a', whiteSpace:'nowrap' }}>Gratuit & Anonyme</div>
      </div>

      {/* Page content */}
      <div style={{ paddingBottom:80 }}>{renderPage()}</div>

      {/* Bottom nav */}
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, background:'var(--card-bg)', borderTop:'1px solid var(--border)', display:'flex', zIndex:200 }}>
        {navItems.map(item=>(
          <button key={item.id} onClick={()=>{setPage(item.id);setDrawerOpen(false);}} style={{ flex:1, padding:'10px 4px 8px', background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer', opacity:page===item.id?1:0.5 }}>
            <span style={{ fontSize:20 }}>{item.icon}</span>
            <span style={{ fontSize:9, fontWeight:700, color: page===item.id?'#2563eb':'var(--text-muted)', whiteSpace:'nowrap' }}>{item.label}</span>
          </button>
        ))}
        <button onClick={()=>setDrawerOpen(!drawerOpen)} style={{ flex:1, padding:'10px 4px 8px', background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer', opacity:1 }}>
          <span style={{ fontSize:20 }}>☰</span>
          <span style={{ fontSize:9, fontWeight:700, color: drawerOpen?'#2563eb':'var(--text-muted)' }}>Plus</span>
        </button>
      </div>

      {/* More drawer */}
      {drawerOpen && (
        <>
          {/* Overlay sombre derrière le drawer */}
          <div onClick={()=>setDrawerOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:149 }}/>
          <div style={{ position:'fixed', bottom:56, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, background: theme==='dark' ? '#1e293b' : '#ffffff', borderTop:'1px solid ' + (theme==='dark'?'#334155':'#e2e8f0'), padding:'16px', zIndex:150, borderRadius:'16px 16px 0 0', boxShadow:'0 -8px 32px rgba(0,0,0,0.4)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
              {morePages.map(item=>(
                <button key={item.id} onClick={()=>{setPage(item.id);setDrawerOpen(false);}} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 6px', background: theme==='dark'?'#0f172a':'#f8fafc', borderRadius:10, border:'none', cursor:'pointer' }}>
                  <span style={{ fontSize:20 }}>{item.icon}</span>
                  <span style={{ fontSize:9, fontWeight:700, color: theme==='dark'?'#94a3b8':'#64748b', textAlign:'center', lineHeight:1.2 }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
