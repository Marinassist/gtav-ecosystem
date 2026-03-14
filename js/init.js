// ============ INIT ============
(async function() {
  var statusEl = document.getElementById('connStatus');
  if (statusEl) statusEl.innerHTML = '⏳ Connexion à Supabase...';

  // 1. CHARGER DEPUIS SUPABASE — SEULE SOURCE DE DONNÉES
  var loaded = false;
  var retries = 0;
  while (!loaded && retries < 5) {
    try {
      loaded = await Promise.race([
        loadFromSupabase(),
        new Promise(function(r) { setTimeout(function() { r(false); }, 10000); })
      ]);
    } catch(e) {}
    if (!loaded) {
      retries++;
      if (statusEl) statusEl.innerHTML = '⏳ Tentative ' + (retries+1) + '/5...';
      await new Promise(function(r) { setTimeout(r, 1500); });
    }
  }

  if (loaded) {
    console.log('☁️ Données chargées depuis Supabase');
    updateSyncBadge('ok');
  }

  // 2. Si Supabase inaccessible après 3 tentatives → écran d'erreur
  if (!loaded && !_supabaseOK) {
    if (statusEl) statusEl.innerHTML = '🔴 Impossible de se connecter à Supabase';
    document.getElementById('auth').innerHTML = '<div style="text-align:center;padding:3rem 1.5rem;max-width:400px;margin:0 auto"><div style="font-size:3rem;margin-bottom:1rem">🔴</div><h2 style="color:var(--red);margin-bottom:.5rem">Serveur indisponible</h2><p style="color:var(--t3);margin-bottom:1.5rem;font-size:.9rem">Impossible de se connecter à la base de données.<br>Vérifiez votre connexion internet et réessayez.</p><button onclick="location.reload()" style="background:var(--accent);color:#fff;border:none;padding:.7rem 2rem;border-radius:8px;font-size:.9rem;font-weight:600;cursor:pointer">🔄 RÉESSAYER</button></div>';
    return;
  }

  // 3. Si Supabase est vide → première initialisation
  if (!loaded) {
    initAllJobs();
    saveDB();
    console.log('🆕 Première initialisation');
  }

  // 4. Démarrer le polling temps réel
  try { setupRealtime(); } catch(e) {}

  // 5. Auto-restore session (sa_session dans localStorage = identifiant seulement)
  var session = null;
  try { session = JSON.parse(localStorage.getItem('sa_session')); } catch(e) {}
  if (session) {
    if (session.type === 'citizen') {
      var cit = DB.citizens.find(function(c){return c.id===session.id});
      if (cit) {
        DB.user = {id:cit.id, name:cit.name, phone:cit.phone};
        _notifCounts = {msg: DB.messages?DB.messages.length:0, ann: DB.announcements?DB.announcements.length:0, dec: DB.decrees?DB.decrees.length:0};
        loadJob();
        document.getElementById('auth').classList.add('hide');
        document.getElementById('app').classList.add('on');
        var ini = cit.name.split(' ').map(function(w){return w[0]}).join('').substring(0,2).toUpperCase();
        document.getElementById('sAv').textContent = ini;
        document.getElementById('sName').textContent = cit.name;
        document.getElementById('sRole').textContent = cit.id + (DB.job ? ' \u2014 ' + DB.job.icon + ' ' + DB.job.company : '');
        buildNav(); go('home');
      }
    } else if (session.type === 'gov') {
      var govAcc = DB.govAccounts ? DB.govAccounts.find(function(a){return a.id===session.id}) : null;
      if (govAcc) {
        DB.govUser = {id:govAcc.id, name:session.name||govAcc.name};
        _notifCounts = {msg: DB.messages?DB.messages.length:0, ann: DB.announcements?DB.announcements.length:0, dec: DB.decrees?DB.decrees.length:0};
        document.getElementById('auth').classList.add('hide');
        document.getElementById('govApp').classList.add('on');
        var gini = (session.name||govAcc.name).split(' ').map(function(w){return w[0]}).join('').substring(0,2).toUpperCase();
        document.getElementById('gAv').textContent = gini;
        document.getElementById('gSName').textContent = session.name||govAcc.name;
        buildGovNav(); goGov('gdash');
      }
    }
  }

  // 6. Ready
  if (statusEl) statusEl.innerHTML = '\u{1F7E2} ' + DB.citizens.length + ' citoyens \u2014 ' + DB.enterprises.length + ' entreprises';
  console.log('\u{1F3DB}\u{FE0F} San Andreas pr\u00EAt \u2014 ' + DB.citizens.length + ' citoyens');
})();
