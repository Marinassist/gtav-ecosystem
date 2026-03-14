// ============ DATA ============// ============ DATA ============
const DB = {
  user: null,
  voted: {},
  onDuty: false,
  cart: [],
  _msgOpen: null,
  _msgView: null,
  _msgReplyTo: null,
  _chatView: null,
  _chatReplyTo: undefined,
  _comptaTab: null,
  _patientView: null,
  _vaultView: null,
  _vaultRead: undefined,

  healthRecords: {},
  tempPatients: [],
  citizens: [],
  citizenSalaries: {},
  messages: [],
  laws: [],
  jobs: [],
  job: null,
  govUser: null,
  govAccounts: [],
  announcements: [],
  defcon: 5,
  govTaxDeclarations: [],
  govBudget: { balance: 0, income: [], expenses: [], investments: [] },
  taxConfig: { tva: 5, tranches: [{min:0,max:10000,rate:0},{min:10001,max:50000,rate:10},{min:50001,max:150000,rate:20},{min:150001,max:999999,rate:30}] },
  enterprises: [],
  allJobs: {},
  defconProtos: {},
  decrees: [],
  vault: [],
  defconLog: [],

  // LEGAL CODES
legalCodes: [
    { id:'contravention', name:'Contraventions', icon:'📋', color:'var(--orange)', articles:[
      { ref:'I-01', title:'Appel abusif / canular', desc:'Sollicitation mensongère des services publics.', sanction:'Amende 100$' },
      { ref:'I-02', title:'Dissimulation du visage (civil)', desc:'Visage couvert en espace public sans motif médical.', sanction:'Amende 100$ — Forces de l\'ordre : 250$ + sanction disciplinaire' },
      { ref:'I-03', title:'Atteinte à la pudeur', desc:'Comportement indécent en public.', sanction:'Amende 200$ — Requalification possible' },
      { ref:'I-04', title:'Possession stupéfiants (faible quantité)', desc:'Moins de 5 pochons sans intention de trafic.', sanction:'100$/pochon — Confiscation — Requalification possible' },
      { ref:'I-05', title:'Consommation stupéfiants (voie publique)', desc:'Usage visible en public.', sanction:'Amende 75$ — Suivi médical possible' },
      { ref:'I-06', title:'Entrave simple à intervention', desc:'Obstacle sans violence aux forces de l\'ordre.', sanction:'Amende 250$ — Requalification possible' },
      { ref:'I-07', title:'Ivresse publique manifeste', desc:'État d\'ivresse troublant l\'ordre public.', sanction:'Amende 100$ — Cellule de dégrisement possible' },
    ]},
    { id:'routier', name:'Infractions Routières', icon:'🚗', color:'var(--blue)', articles:[
      { ref:'R-II-01.2', title:'Excès de vitesse simple', desc:'Dépassement jusqu\'à +20 km/h au-dessus de la limite autorisée.', sanction:'Amende 100$' },
      { ref:'R-II-01.3', title:'Excès de vitesse caractérisé', desc:'Dépassement de +20 à +40 km/h au-dessus de la limite autorisée.', sanction:'Amende 250$' },
      { ref:'R-II-01.4', title:'Excès de vitesse dangereux', desc:'Dépassement > +40 km/h ou vitesse mettant directement en danger autrui.', sanction:'Amende 350$ — Requalification automatique en délit' },
      { ref:'R-II-01.5', title:'Excès de vitesse – Indépendance de l\'accident', desc:'Infraction constituée même en l\'absence d\'accident ou de dommage.', sanction:'Applicable dans tous les cas' },
      { ref:'R-II-01.6', title:'Excès de vitesse – Véhicules spéciaux', desc:'Application aux véhicules non prioritaires ; prudence obligatoire pour véhicules prioritaires en mission.', sanction:'Obligations du Livre I maintenues' },
      { ref:'R-II-02', title:'Refus de priorité', desc:'Non-respect d\'une priorité légale de passage.', sanction:'Amende 100$ — Requalification si danger ou accident' },
      { ref:'R-II-03', title:'Usage abusif de dispositifs lumineux', desc:'Utilisation non autorisée de signaux lumineux ou sonores réservés.', sanction:'Amende 250$ — Requalification possible en cas de cumul' },
      { ref:'R-II-04', title:'Stationnement gênant', desc:'Stationnement entravant la circulation sans danger immédiat.', sanction:'Amende 100$ — Mise en fourrière possible' },
      { ref:'R-II-05', title:'Stationnement dangereux', desc:'Stationnement créant un danger immédiat ou manifeste.', sanction:'Amende 100$ — Fourrière immédiate — Requalification possible' },
      { ref:'R-II-06', title:'Défaut de plaque d\'immatriculation', desc:'Absence, falsification, altération ou dissimulation de plaque.', sanction:'Amende 100$ — Immobilisation immédiate du véhicule' },
      { ref:'R-II-07', title:'Plaque non visible ou obstruée', desc:'Plaque rendue partiellement ou totalement illisible.', sanction:'Amende 100$' },
      { ref:'R-II-08', title:'Défaut d\'éclairage réglementaire', desc:'Circulation avec éclairage obligatoire absent ou défectueux.', sanction:'Amende 100$' },
      { ref:'R-II-09', title:'Dispositifs non autorisés sur véhicule', desc:'Équipement susceptible de prêter à confusion avec véhicule officiel.', sanction:'Amende 300$ — Mise en conformité immédiate' },
      { ref:'R-II-10', title:'Véhicule en mauvais état', desc:'Véhicule présentant un défaut compromettant la sécurité.', sanction:'Amende 200$ — Immobilisation possible' },
      { ref:'R-II-11', title:'Défaut de port du casque', desc:'Conduite ou transport sans casque homologué.', sanction:'Amende 250$' },
      { ref:'R-II-12', title:'Usage du téléphone au volant', desc:'Utilisation d\'un dispositif électronique tenu en main en conduisant.', sanction:'Amende 200$ — Requalification possible en cas d\'accident' },
      { ref:'R-II-13', title:'Défaut de port de la ceinture', desc:'Absence de port de ceinture obligatoire.', sanction:'Amende 200$' },
    ]},
    { id:'delit-routier', name:'Délits Routiers', icon:'🚨', color:'var(--red)', articles:[
      { ref:'R-III-01', title:'Conduite dangereuse', desc:'Comportement imprudent ou agressif créant un danger réel ou immédiat.', sanction:'Amende 1 500$ — Fourrière — Retrait permis — Requalification possible' },
      { ref:'R-III-02', title:'Conduite sous stupéfiants', desc:'Conduite après consommation altérant les capacités.', sanction:'Amende 1 500$ + TIG — Immobilisation — Obligation visite EMS' },
      { ref:'R-III-03', title:'Conduite sous alcool', desc:'Conduite ≥ 0,8 g/L ou ivresse manifeste.', sanction:'Amende 1 500$ + TIG — Immobilisation — Obligation visite EMS' },
      { ref:'R-III-04', title:'Usage de fausses plaques', desc:'Plaque falsifiée, usurpée ou ne correspondant pas au véhicule.', sanction:'Amende 1 500$ + TIG — Fourrière immédiate' },
      { ref:'R-III-05', title:'Accident corporel', desc:'Cause des blessures par imprudence ou violation des règles.', sanction:'Amende 3 500$ — Immobilisation — Dédommagement victime — Requalification si blessures graves' },
      { ref:'R-III-06', title:'Conduite sans permis', desc:'Conduite sans permis valide ou malgré suspension.', sanction:'Amende 2 500$ — Fourrière possible — Obligation de passer le permis' },
    ]},
    { id:'delit-mineur', name:'Délits Mineurs', icon:'⚠️', color:'var(--gold)', articles:[
      { ref:'M-01', title:'Dégradation biens publics/privés', desc:'Détérioration volontaire sans destruction totale.', sanction:'Amende 750$ — Confiscation matériel' },
      { ref:'M-02', title:'Entrave aggravée', desc:'Obstacle avec menace, contrainte ou violence légère.', sanction:'Amende 1 500$ + 15mn — Requalification possible' },
      { ref:'M-03', title:'Refus d\'obéir à un ordre légal', desc:'Refus volontaire d\'un ordre légal clair.', sanction:'Amende 1 500$ + TIG — Requalification possible' },
      { ref:'M-04', title:'Refus de se soumettre à mesure légale', desc:'Refus identité, test alcool/stupéfiants, contrôle.', sanction:'Amende 1 500$ + 15mn — TIG — Requalification possible' },
      { ref:'M-05', title:'Exhibition d\'arme', desc:'Montrer une arme sans usage effectif.', sanction:'Amende 2 500$ + 15mn — TIG + confiscation + retrait PPA' },
      { ref:'M-06', title:'Braquage simple (ATM)', desc:'Braquage sans violence ni blessure.', sanction:'Amende 2 500$ + 20mn — TIG' },
      { ref:'M-06B', title:'Braquage simple (commerce)', desc:'Braquage supérette sans blessure.', sanction:'Amende 3 500$ + 25mn — TIG' },
      { ref:'M-07', title:'Agression simple', desc:'Violence légère sans arme ni blessure grave.', sanction:'Amende 2 500$ + 15mn — TIG' },
      { ref:'M-08', title:'Menaces', desc:'Annonce d\'atteinte sans exécution immédiate.', sanction:'Amende 3 000$ — TIG + interdiction de contact' },
      { ref:'M-09', title:'Harcèlement / Intimidation', desc:'Agissements répétés créant oppression.', sanction:'Amende 3 000$ + 15mn — Interdiction de contact' },
      { ref:'M-10', title:'Possession stupéfiants (quantité moyenne)', desc:'Entre 5 et 15 pochons sans trafic.', sanction:'Amende 2 500$ + 100$/pochon + 15mn — TIG + confiscation' },
      { ref:'M-11', title:'Refus d\'obtempérer', desc:'Refus de se conformer à sommation légale.', sanction:'Amende 2 000$ + 10mn — Confiscation véhicule possible' },
      { ref:'M-12', title:'Vol de véhicule', desc:'Soustraction frauduleuse d\'un véhicule sans violence.', sanction:'Amende 1 500$ + 15mn — Restitution + indemnisation + TIG' },
      { ref:'M-13', title:'Violation de propriété', desc:'Pénétrer ou se maintenir sans autorisation dans un lieu.', sanction:'Amende 2 500$ + 15mn — TIG — Requalification possible' },
      { ref:'M-14', title:'Atteinte légère à la liberté individuelle', desc:'Restriction brève et non violente de la liberté d\'aller et venir.', sanction:'Amende 2 000$ — TIG — Requalification possible' },
      { ref:'M-15', title:'Abus d\'autorité sans contrainte', desc:'Imposer une décision sans base légale sans violence.', sanction:'Amende 2 500$ — Requalification possible si atteinte grave aux libertés' },
    ]},
    { id:'delit-majeur', name:'Délits Majeurs', icon:'🔴', color:'var(--red)', articles:[
      { ref:'D-01', title:'Destruction volontaire de biens', desc:'Destruction totale d\'un bien public ou privé.', sanction:'Amende 3 000$ + 15mn — Indemnisation jusqu\'à 25 000$ — Requalification possible en crime' },
      { ref:'D-02', title:'Entrave grave services médicaux', desc:'Obstacle aggravant ou compromettant une prise en charge.', sanction:'Amende 10 000$ + 15mn — Indemnisation jusqu\'à 25 000$ — Cumul possible' },
      { ref:'D-03', title:'Résistance à une arrestation', desc:'Opposition active à une arrestation légale.', sanction:'Amende 3 000$ — Requalification possible si violences graves' },
      { ref:'D-04', title:'Mise en danger de la vie d\'autrui', desc:'Exposition directe à un risque grave et immédiat.', sanction:'Amende 5 500$ — Indemnisation jusqu\'à 25 000$ — Cumul possible' },
      { ref:'D-05', title:'Usage d\'arme sans faire feu', desc:'Utilisation d\'une arme sans tir pour contraindre/intimider.', sanction:'Amende 3 500$ + 10mn — Confiscation + retrait PPA' },
      { ref:'D-06', title:'Braquage aggravé', desc:'Braquage avec arme, violence, réunion ou prise d\'otage.', sanction:'Amende 10 000$ + 30mn — Interdiction port d\'arme — Requalification possible en crime' },
      { ref:'D-07', title:'Agression aggravée', desc:'Violences avec arme, ITT ou circonstances aggravantes.', sanction:'Amende 6 000$ + 30mn — Interdiction port d\'arme / soins possibles' },
      { ref:'D-08', title:'Homicide involontaire', desc:'Causer la mort sans intention par imprudence.', sanction:'Amende 9 000$ + 40mn — Interdiction activité à risque — Requalification possible' },
      { ref:'D-09', title:'Menaces aggravées', desc:'Menaces crédibles avec circonstances aggravantes.', sanction:'Amende 6 000$ + 20mn — Interdiction contact / port d\'arme' },
      { ref:'D-10', title:'Harcèlement aggravé', desc:'Harcèlement grave avec danger ou contrainte.', sanction:'Amende 6 000$ + 20mn — Interdiction contact — Cumul possible' },
      { ref:'D-11', title:'Commission en groupe organisé', desc:'Infraction commise avec concertation et organisation.', sanction:'Aggravation des peines de l\'infraction principale' },
      { ref:'D-12', title:'Blanchiment de capitaux', desc:'Dissimulation ou réintégration de fonds illicites.', sanction:'Amende 10 000$ + 15mn — Confiscation intégrale — Requalification possible en crime' },
      { ref:'D-13', title:'Tentative de corruption', desc:'Proposition d\'avantage indu à une autorité publique.', sanction:'Amende 5 000$ — Interdiction contact administration' },
      { ref:'D-14', title:'Trafic de stupéfiants', desc:'Production, vente ou distribution de stupéfiants.', sanction:'Amende 5 000$ + 100$/pochon + 20mn — Confiscation fonds et moyens — Requalification possible en crime' },
      { ref:'D-15', title:'Possession stupéfiants (grande quantité)', desc:'Entre 15 et 25 pochons sans trafic établi.', sanction:'Amende 5 000$ + 100$/pochon + 10mn — TIG + confiscation — Requalification possible' },
      { ref:'D-16', title:'Recel de biens volés', desc:'Détention ou usage d\'un bien d\'origine frauduleuse.', sanction:'Amende 4 000$ + 15mn — Confiscation — Aggravation possible' },
      { ref:'D-17', title:'Non-assistance à personne en danger', desc:'Abstention volontaire d\'aider une personne en péril.', sanction:'Amende 5 000$ + 20mn — Formation secours possible — Cumul possible' },
      { ref:'D-18', title:'Port d\'arme illégal', desc:'Port ou transport d\'arme sans autorisation valable.', sanction:'Amende 8 000$ + 15mn — Confiscation obligatoire + retrait PPA' },
      { ref:'D-19', title:'Parjure', desc:'Déclaration mensongère devant autorité judiciaire.', sanction:'Amende 5 000$ — Poursuites complémentaires possibles' },
      { ref:'D-20', title:'Usurpation d\'identité', desc:'Se faire passer pour autrui dans un but frauduleux.', sanction:'Amende 10 000$ + 10mn — Requalification possible si autorité publique visée' },
      { ref:'D-21', title:'Entrée par effraction', desc:'Pénétration par forçage d\'un dispositif de sécurité.', sanction:'Amende 10 000$ + 10mn — Requalification possible en crime' },
      { ref:'D-22', title:'Faux et usage de faux', desc:'Altération frauduleuse d\'un document officiel.', sanction:'Amende 8 500$ + 10mn — Requalification possible si procédure judiciaire' },
      { ref:'D-23', title:'Non-respect décision judiciaire', desc:'Refus volontaire d\'exécuter un jugement.', sanction:'Amende 12 000$ + 25mn — Mesures coercitives possibles' },
      { ref:'D-24', title:'Travail dissimulé', desc:'Emploi ou activité non déclarée volontairement.', sanction:'Amende 25 500$ + 10mn — Fermeture administrative possible' },
      { ref:'D-25', title:'Fraude', desc:'Obtention d\'un avantage par tromperie.', sanction:'Amende 7 500$ + 10mn — Cumul possible avec faux/escroquerie' },
      { ref:'D-26', title:'Entrave à l\'exécution de la justice', desc:'Obstacle volontaire à l\'application d\'une décision.', sanction:'Amende 8 000$ + 25mn — Cumul possible' },
      { ref:'D-27', title:'Abus de faiblesse', desc:'Exploitation d\'une personne vulnérable.', sanction:'Amende 10 000$ + 10mn — Cumul possible' },
      { ref:'D-28', title:'Exploitation économique', desc:'Profit abusif tiré d\'une situation de dépendance.', sanction:'Amende 15 000$ + 10mn — Cumul possible' },
      { ref:'D-29', title:'Atteinte grave à la liberté individuelle', desc:'Restriction prolongée ou abusive de liberté.', sanction:'Amende 8 000$ + 10mn — Requalification possible' },
      { ref:'D-30', title:'Privation arbitraire de liberté', desc:'Détention sans base légale.', sanction:'Amende 12 000$ + 30mn — Requalification possible en crime' },
    ]},
    { id:'crime-routier', name:'Crimes Routiers', icon:'💀', color:'#dc2626', articles:[
      { ref:'R-IV-01', title:'Accident mortel', desc:'Cause la mort par imprudence, négligence grave ou violation des règles.', sanction:'Amende 5 500$ — Immobilisation/confiscation véhicule — Peines maximales si circonstances aggravantes' },
      { ref:'R-IV-02', title:'Délit de fuite', desc:'Quitte volontairement les lieux d\'un accident sans obligations légales.', sanction:'Amende 5 000$ — Retrait permis — Confiscation possible — Peines maximales si accident corporel ou mortel' },
    ]},
    { id:'crime', name:'Crimes', icon:'⛔', color:'#991b1b', articles:[
      { ref:'C-01', title:'Prise d\'otage (civil)', desc:'Capture ou détention d\'un civil contre sa volonté.', sanction:'Amende 9 000$ + 30mn — Cumul possible — Requalification si décès' },
      { ref:'C-01A', title:'Prise d\'otage (agent public)', desc:'Prise d\'otage sur personne investie d\'une mission de service public.', sanction:'Amende 18 000$ + Perpétuité — Crime aggravé' },
      { ref:'C-02', title:'Agression sur agent public', desc:'Violence sur personne investie d\'une mission de service public.', sanction:'Amende 20 000$ + 1H30 — Cumul possible' },
      { ref:'C-03', title:'Homicide volontaire', desc:'Donner volontairement la mort.', sanction:'Amende 12 000$ + Perpétuité — Requalification automatique si agent' },
      { ref:'C-04A', title:'Assassinat (civil)', desc:'Homicide volontaire avec préméditation.', sanction:'Amende 25 000$ + Perpétuité — Cumul possible' },
      { ref:'C-04B', title:'Assassinat (agent public)', desc:'Homicide volontaire sur agent public.', sanction:'Amende 50 000$ + Perpétuité — Crime aggravé' },
      { ref:'C-05A', title:'Tentative d\'homicide', desc:'Actes visant à donner la mort sans résultat.', sanction:'Amende 8 000$ + 60mn — Requalification possible' },
      { ref:'C-05B', title:'Tentative d\'assassinat', desc:'Tentative avec préméditation ou sur agent.', sanction:'Amende 10 000$ (15 000$ si agent) + Perpétuité — Cumul possible' },
      { ref:'C-06', title:'Torture', desc:'Souffrances graves infligées intentionnellement.', sanction:'Amende 15 000$ + Perpétuité — Cumul possible' },
      { ref:'C-07', title:'Organisation criminelle', desc:'Infraction commise en groupe structuré.', sanction:'Aggravation maximale de l\'infraction principale' },
      { ref:'C-08', title:'Corruption', desc:'Avantage indu en échange d\'un acte public.', sanction:'Amende 10 000$ + 60mn — Interdiction fonction publique + confiscation' },
      { ref:'C-09', title:'Trafic d\'armes', desc:'Mise en circulation illégale d\'armes.', sanction:'Amende 15 000$ + 1H30 — Confiscation obligatoire' },
      { ref:'C-10', title:'Trafic d\'organes', desc:'Commerce illégal d\'organes humains.', sanction:'Amende 17 000$ + 1H30 — Crime aggravé — Confiscation intégrale' },
      { ref:'C-11', title:'Stupéfiants (très grande quantité)', desc:'+25 pochons sans autorisation.', sanction:'Amende 8 000$ + 100$/pochon + 1H30 — Confiscation — Cumul possible' },
      { ref:'C-12', title:'Séquestration', desc:'Privation de liberté sans exigence.', sanction:'Amende 12 000$ + 1H30 — Aggravation possible' },
      { ref:'C-13', title:'Usurpation de fonction', desc:'Se faire passer pour autorité publique.', sanction:'Amende 25 000$ + 60mn — Cumul possible' },
      { ref:'C-14', title:'Agression sexuelle', desc:'Acte sexuel imposé sans pénétration.', sanction:'Amende 20 000$ + Perpétuité — Aggravation si vulnérable' },
      { ref:'C-15', title:'Association de malfaiteurs', desc:'Participation à un groupement criminel.', sanction:'Amende 4 000$ + 60mn — Cumul possible' },
    ]},
    { id:'travail', name:'Code du Travail', icon:'💼', color:'var(--blue)', articles:[
      { ref:'CT-101', title:'Contrat obligatoire', desc:'Tout employeur doit fournir un contrat écrit dans les 48h suivant l\'embauche.', sanction:'Amende entreprise $10,000' },
      { ref:'CT-102', title:'Salaire minimum', desc:'Aucun employé ne peut être rémunéré en dessous de $500/semaine ou 8% de commission.', sanction:'Amende $5,000 + rappel de salaire' },
      { ref:'CT-103', title:'Durée maximale de service', desc:'Un employé ne peut travailler plus de 12h consécutives sans pause de 30min.', sanction:'Amende $3,000' },
      { ref:'CT-201', title:'Licenciement abusif', desc:'Tout licenciement doit être motivé et notifié. Licenciement sans motif = abusif.', sanction:'Indemnités x3 + amende État $5,000' },
      { ref:'CT-202', title:'Discrimination à l\'embauche', desc:'Interdiction de refuser un candidat sur critères non professionnels.', sanction:'Amende $10,000 + suspension entreprise' },
      { ref:'CT-301', title:'Cotisations obligatoires', desc:'L\'employeur doit verser les cotisations sociales (mutuelle, retraite) chaque mois.', sanction:'Amende $8,000 + rattrapage' },
      { ref:'CT-302', title:'Fiche de paie', desc:'Une fiche de paie détaillée doit être remise à chaque période de paiement.', sanction:'Amende $2,000' },
      { ref:'CT-401', title:'Droit de grève', desc:'Les employés ont le droit de faire grève sans sanction, sous préavis de 24h.', sanction:'Licenciement = abusif (CT-201)' },
    ]},
    { id:'civil', name:'Code Civil', icon:'📜', color:'var(--gold)', articles:[
      { ref:'CC-101', title:'Propriété privée', desc:'Toute propriété acquise légalement est protégée par l\'État.', sanction:'Expulsion + dommages-intérêts' },
      { ref:'CC-102', title:'Droit au logement', desc:'Tout citoyen a droit à un logement décent.', sanction:'Obligation de relogement par l\'État' },
      { ref:'CC-201', title:'Contrats commerciaux', desc:'Tout contrat signé entre deux parties a force de loi. Rupture unilatérale = indemnités.', sanction:'Dommages-intérêts + frais de justice' },
      { ref:'CC-202', title:'Dettes et créances', desc:'Toute dette contractée doit être honorée dans les délais convenus.', sanction:'Saisie sur revenus + intérêts de retard' },
      { ref:'CC-301', title:'Liberté d\'entreprendre', desc:'Tout citoyen peut créer une entreprise sous réserve d\'obtenir une licence d\'État.', sanction:'Fermeture administrative si non conforme' },
      { ref:'CC-302', title:'Responsabilité civile', desc:'Toute personne causant un dommage à autrui est tenue de le réparer.', sanction:'Dommages-intérêts selon préjudice' },
      { ref:'CC-401', title:'Droit à un procès équitable', desc:'Tout citoyen a droit à un avocat et à être jugé par un tribunal impartial.', sanction:'Annulation de procédure' },
      { ref:'CC-402', title:'Présomption d\'innocence', desc:'Toute personne est présumée innocente jusqu\'à preuve du contraire.', sanction:'Protection constitutionnelle' },
    ]},
  ],
};

// ==================== SHARED ENTERPRISE DATA ====================
function initAllJobs() {
  DB.allJobs = {};
  // Ensure all registered enterprises have job data
  DB.enterprises.forEach(function(ent) {
    if (!DB.allJobs[ent.name]) createEnterpriseData(ent.name, ent.icon);
  });
}

// Dynamic job loader — looks up citizen's job and finds their enterprise data
function loadJob() {
  const uid = DB.user.id;
  const citizen = DB.citizens.find(c => c.id === uid);
  if (!citizen || !citizen.job) { DB.job = null; return; }
  // Auto-create allJobs entry if enterprise exists but has no job data
  if (!DB.allJobs[citizen.job]) {
    const ent = DB.enterprises.find(e => e.name === citizen.job);
    if (ent) createEnterpriseData(citizen.job, ent.icon);
    else { DB.job = null; return; }
  }
  const jobData = DB.allJobs[citizen.job];
  const emp = jobData.employees.find(e => e.id === uid && e.status === 'active');
  if (!emp) {
    // Citizen has job set but not in employees — add them (likely patron assigned by gov)
    if (citizen.role === 'Patron') {
      jobData.employees.push({id:uid, name:citizen.name, grade:0, phone:citizen.phone||'', hired:new Date().toLocaleDateString('fr-FR'), status:'active'});
      DB.job = jobData;
      DB.job.role = 'Patron';
      DB.job.gradeIndex = 0;
      return;
    }
    DB.job = null; return;
  }
  DB.job = jobData;
  DB.job.role = citizen.role || jobData.grades[emp.grade]?.name || 'Employé';
  DB.job.gradeIndex = emp.grade;
}

// Create new enterprise data structure (called by gov createEnt)
function createEnterpriseData(name, icon) {
  DB.allJobs[name] = {
    company: name, icon: icon || '🏢',
    grades: [
      {name:'Patron',payType:'both',fixe:2000,commission:15,prime:300,canManage:true,canHire:true,canFire:true,canEditGrades:true,canStock:true,canArticles:true,canPOS:true,canPatients:false},
      {name:'Employé',payType:'fixe',fixe:1000,commission:0,prime:0,canManage:false,canHire:false,canFire:false,canEditGrades:false,canStock:false,canArticles:false,canPOS:true,canPatients:false},
    ],
    employees:[], pos:[], invoices:[], weeklyHistory:[],
    pendingApps:[], employeeExpenses:[], companyExpenses:[],
    taxDeclarations:[], stock:[], internalMessages:[], hrRecords:[], serviceLog:[],
  };
}

function getPayLabel(g) {
  if (g.payType==='fixe') return 'Fixe $'+g.fixe.toLocaleString()+'/sem';
  if (g.payType==='commission') return 'Commission '+g.commission+'%';
  return 'Fixe $'+g.fixe.toLocaleString()+' + '+g.commission+'%';
}
function calcWeekPay(grade, invoiced) {
  const g = DB.job.grades[grade];
  let pay = 0;
  if (g.fixe) pay += g.fixe;
  if (g.commission && invoiced) pay += Math.round(invoiced * g.commission / 100);
  pay += g.prime || 0;
  return pay;
}

