// ============ SUPABASE CLIENT ============
const SUPABASE_URL = 'https://xodqbotgcglsbepglthd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZHFib3RnY2dsc2JlcGdsdGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTI1MjgsImV4cCI6MjA4ODcyODUyOH0.aLbZ_sOtSz5Ki8M4QrDg3Fz_aGYuMQf_BODRNL1SgbI';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============ PERSISTENCE — 100% SUPABASE ============
// localStorage = UNIQUEMENT sa_session (identifiant/mdp)
// Toutes les données vivent dans Supabase, point final.
let _saving = false;
let _saveQueued = false;
let _saveFails = 0;
let _supabaseOK = false;

function getPayload() {
  return {
    citizens: DB.citizens, allJobs: DB.allJobs, enterprises: DB.enterprises,
    laws: DB.laws, decrees: DB.decrees, defcon: DB.defcon, defconLog: DB.defconLog,
    legalCodes: DB.legalCodes, healthRecords: DB.healthRecords,
    citizenSalaries: DB.citizenSalaries, tempPatients: DB.tempPatients,
    taxConfig: DB.taxConfig, govBudget: DB.govBudget,
    govTaxDeclarations: DB.govTaxDeclarations, vault: DB.vault, defconProtos: DB.defconProtos,
    govAccounts: DB.govAccounts, announcements: DB.announcements, messages: DB.messages, jobs: DB.jobs, voted: DB.voted,
  };
}

// Nettoyer l'ancien cache localStorage (migration one-shot)
try { localStorage.removeItem('sa_data'); localStorage.removeItem('sa_lastLogin'); } catch(e) {}

// ============ SAUVEGARDE : DIRECTE VERS SUPABASE ============
function saveDB() {
  var payload = getPayload();
  payload._ts = Date.now();
  if (_saving) { _saveQueued = true; return; }
  _saving = true;
  var who = DB.user ? DB.user.id : (DB.govUser ? DB.govUser.id : 'anon');
  sb.rpc('set_shared_state', { new_data: payload, who: who })
    .then(function(res) {
      _saving = false;
      if (!res.error) { _saveFails = 0; _supabaseOK = true; updateSyncBadge('ok'); }
      else { _saveFails++; updateSyncBadge('err'); }
      if (_saveQueued) { _saveQueued = false; setTimeout(saveDB, 300); }
    })
    .catch(function() {
      _saving = false; _saveFails++;
      updateSyncBadge('err');
      // Retry automatique
      setTimeout(function() { _saveQueued = false; saveDB(); }, 3000);
    });
}

// ============ CHARGEMENT : UNIQUEMENT DEPUIS SUPABASE ============
async function loadFromSupabase() {
  try {
    var res = await sb.rpc('get_shared_state');
    if (!res.error && res.data && typeof res.data === 'object' && res.data.citizens) {
      var d = res.data;
      Object.keys(d).forEach(function(k) { if (d[k] !== undefined) DB[k] = d[k]; });
      // Garantir que tous les champs critiques existent
      if (!DB.allJobs) DB.allJobs = {};
      if (!DB.citizens) DB.citizens = [];
      if (!DB.enterprises) DB.enterprises = [];
      if (!DB.messages) DB.messages = [];
      if (!DB.announcements) DB.announcements = [];
      if (!DB.decrees) DB.decrees = [];
      if (!DB.jobs) DB.jobs = [];
      if (!DB.laws) DB.laws = [];
      if (!DB.legalCodes) DB.legalCodes = [];
      if (!DB.govAccounts) DB.govAccounts = [];
      if (!DB.healthRecords) DB.healthRecords = {};
      if (!DB.citizenSalaries) DB.citizenSalaries = {};
      if (!DB.tempPatients) DB.tempPatients = [];
      if (!DB.voted) DB.voted = {};
      if (!DB.vault) DB.vault = [];
      if (!DB.defconLog) DB.defconLog = [];
      if (!DB.defconProtos) DB.defconProtos = {};
      if (!DB.govBudget) DB.govBudget = {balance:0,income:[],expenses:[],investments:[]};
      if (!DB.taxConfig) DB.taxConfig = {tva:5,tranches:[{min:0,max:10000,rate:0},{min:10001,max:50000,rate:10},{min:50001,max:150000,rate:20},{min:150001,max:999999,rate:30}]};
      if (!DB.govTaxDeclarations) DB.govTaxDeclarations = [];
      _supabaseOK = true;
      return true;
    }
    if (!res.error) _supabaseOK = true;
    return false;
  } catch(e) {
    return false;
  }
}

function resetAllData() {
  localStorage.removeItem('sa_session');
  sb.rpc('set_shared_state', { new_data: {} }).then(function() { location.reload(); }).catch(function() { location.reload(); });
}

function updateSyncBadge(state) {
  var el = document.getElementById('syncBadge');
  if (!el) {
    el = document.createElement('div');
    el.id = 'syncBadge';
    el.style.cssText = 'position:fixed;bottom:.5rem;left:.5rem;font-size:.65rem;padding:.3rem .6rem;border-radius:6px;z-index:9999;cursor:pointer;transition:all .3s';
    el.onclick = function() { _saveFails=0; saveDB(); toast('Synchronisation forcée...'); };
    el.title = 'Cliquez pour forcer la synchronisation';
    document.body.appendChild(el);
  }
  if (state === 'ok') {
    el.style.background='rgba(34,197,94,.15)'; el.style.color='#22c55e';
    el.textContent='\u{1F7E2} Sync OK';
    clearTimeout(el._t); el._t = setTimeout(function() { el.style.opacity='.4'; }, 3000);
    el.style.opacity='1';
  } else if (state === 'saving') {
    el.style.background='rgba(59,130,246,.15)'; el.style.color='#3b82f6'; el.style.opacity='1';
    el.textContent='\u{1F504} Envoi...';
  } else {
    el.style.background='rgba(239,68,68,.2)'; el.style.color='#ef4444'; el.style.opacity='1';
    el.textContent='\u{1F534} Erreur sync (' + _saveFails + ') — Cliquez ici';
  }
}

// ============ POLLING : LIRE SUPABASE → METTRE À JOUR DB EN MÉMOIRE ============
var _lastSync = 0;
var _notifCounts = {msg:0, ann:0, dec:0};

function setupRealtime() {
  _notifCounts = {msg: DB.messages ? DB.messages.length : 0, ann: DB.announcements ? DB.announcements.length : 0, dec: DB.decrees ? DB.decrees.length : 0};
  // Polling toutes les 10s — lit Supabase et met à jour DB
  setInterval(function() { pollForChanges(); }, 10000);
  // Supabase Realtime en bonus
  try {
    sb.channel('sync').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'shared_state' }, function(payload) {
      if (DB.user && payload.new.updated_by === DB.user.id) return;
      if (DB.govUser && payload.new.updated_by === DB.govUser.id) return;
      if (Date.now() - _lastSync < 5000) return;
      applyRemoteSync(payload.new.data);
    }).subscribe();
  } catch(e) {}
}

async function pollForChanges() {
  try {
    var res = await sb.rpc('get_shared_state');
    if (res.error || !res.data) return;
    var d = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    if (!d || !d.citizens) return;
    _supabaseOK = true;

    // Notifications
    var myId = DB.user ? DB.user.id : (DB.govUser ? DB.govUser.id : null);
    var myEnt = '';
    if (myId && d.citizens) {
      var myCit = d.citizens.find(function(c){return c.id===myId});
      if (myCit) myEnt = myCit.job || '';
    }
    var remoteMyMsgs = 0;
    if (d.messages && myId) {
      d.messages.forEach(function(m) {
        if (m.fromId !== myId && (m.toId === myId || (myEnt && m.toEnterprise === myEnt))) remoteMyMsgs++;
      });
    }
    var localMyMsgs = 0;
    if (DB.messages && myId) {
      DB.messages.forEach(function(m) {
        if (m.fromId !== myId && (m.toId === myId || (myEnt && m.toEnterprise === myEnt))) localMyMsgs++;
      });
    }
    var newMsgsForMe = remoteMyMsgs - localMyMsgs;
    var newAnns = (d.announcements ? d.announcements.length : 0) - _notifCounts.ann;
    var newDecs = (d.decrees ? d.decrees.length : 0) - _notifCounts.dec;

    if (newMsgsForMe > 0) { playNotifSound('message'); showNotifBanner('\u{2709}\u{FE0F} ' + newMsgsForMe + ' nouveau' + (newMsgsForMe>1?'x':'') + ' message' + (newMsgsForMe>1?'s':'')); }
    else if (newAnns > 0) { playNotifSound('announce'); showNotifBanner('\u{1F4E3} Nouvelle annonce'); }
    else if (newDecs > 0) { playNotifSound('announce'); showNotifBanner('\u{1F4DC} Nouveau décret'); }

    _notifCounts.ann = d.announcements ? d.announcements.length : 0;
    _notifCounts.dec = d.decrees ? d.decrees.length : 0;

    applyRemoteSync(d);
  } catch(e) {}
}

// ============ APPLIQUER LES DONNÉES DE SUPABASE ============
// Supabase est la vérité. On remplace DB sauf si on est en train de sauvegarder.
function applyRemoteSync(d) {
  if (!d || !d.citizens) return;
  if (_saving) return; // Ne pas écraser pendant qu'on sauvegarde
  _lastSync = Date.now();

  // Remplacer toutes les données partagées par ce qui vient de Supabase
  if (d.citizens) DB.citizens = d.citizens;
  if (d.enterprises) DB.enterprises = d.enterprises;
  if (d.messages) DB.messages = d.messages;
  if (d.announcements) DB.announcements = d.announcements;
  if (d.decrees) DB.decrees = d.decrees;
  if (d.jobs) DB.jobs = d.jobs;
  if (d.legalCodes) DB.legalCodes = d.legalCodes;
  if (d.laws) DB.laws = d.laws;
  if (d.voted) DB.voted = d.voted;
  if (d.defcon !== undefined) DB.defcon = d.defcon;
  if (d.defconLog) DB.defconLog = d.defconLog;
  if (d.defconProtos) DB.defconProtos = d.defconProtos;
  if (d.vault) DB.vault = d.vault;
  if (d.govBudget) DB.govBudget = d.govBudget;
  if (d.govTaxDeclarations) DB.govTaxDeclarations = d.govTaxDeclarations;
  if (d.taxConfig) DB.taxConfig = d.taxConfig;
  if (d.govAccounts) DB.govAccounts = d.govAccounts;
  if (d.healthRecords) DB.healthRecords = d.healthRecords;
  if (d.citizenSalaries) DB.citizenSalaries = d.citizenSalaries;
  if (d.tempPatients) DB.tempPatients = d.tempPatients;

  // allJobs : Supabase est la vérité → prendre TOUT
  if (d.allJobs) {
    if (!DB.allJobs) DB.allJobs = {};
    Object.keys(d.allJobs).forEach(function(entName) {
      DB.allJobs[entName] = d.allJobs[entName];
    });
  }

  // Recharger le job et re-rendre la page pour que le patron voie les ventes en temps réel
  if (DB.user) {
    try { loadJob(); buildNav(); } catch(e) {}
    try {
      var pg = document.getElementById('page');
      if (pg && DB.currentPage) {
        var content = getPageContent(DB.currentPage);
        if (content) pg.innerHTML = content;
      }
    } catch(e) {}
  }
}
// Helper to get page content without navigation side effects
function getPageContent(p) {
  if (p.startsWith('code_')) { var code = DB.legalCodes.find(function(x){return x.id===p.replace('code_','')}); return code ? pCodeView(code) : ''; }
  var R = {home:pHome,salaires:pSalaires,health:pHealth,msg:pMsg,jobs:pJobs,vote:pVote,wdash:pWDash,wpos:pWPos,wpay:pWPay,wfrais:pWFrais,wchat:pWChat,wstock:pWStock,wpatients:pWPatients,warticles:pWArticles,wteam:pWTeam,wservice:pWService,whr:pWHR,wcompta:pWCompta,wgrades:pWGrades,winfo:pWInfo,wapps:pWApps};
  return R[p] ? R[p]() : '';
}
function getGovPageContent(p) {
  var R = {gdash:gDash,gcit:gCitizens,gent:gEnt,gjobs:gJobs,gtax:gTax,gbudget:gBudget,gdecree:gDecree,gcodes:gCodes,gdefcon:gDefcon,gvault:gVault,gvotes:gVotes};
  return R[p] ? R[p]() : '';
}
