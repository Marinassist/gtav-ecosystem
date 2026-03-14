// ============ AUTH SWITCH ============
function switchAuth(mode) {
  document.querySelectorAll('.auth-tab').forEach((t,i) => t.classList.toggle('on', (mode==='citizen'&&i===0)||(mode==='gov'&&i===1)));
  document.getElementById('authCitizen').style.display = mode==='citizen'?'block':'none';
  document.getElementById('authGov').style.display = mode==='gov'?'block':'none';
}

// ============ GOV AUTH ============
function doGovLogin() {
  const id = document.getElementById('gId').value.trim();
  const name = document.getElementById('gName').value.trim();
  const code = document.getElementById('gCode').value.trim();
  if (!id || !code) { err('Identifiant et code requis.'); return; }
  // Bootstrap: if no accounts exist, first login creates the account
  if (!DB.govAccounts || !DB.govAccounts.length) {
    if (!name) { err('Nom requis pour créer le premier compte.'); return; }
    DB.govAccounts = [{id: id, name: name, code: code}];
    saveDB();
    toast('Compte gouvernement créé : ' + id);
  }
  // Check against stored gov accounts
  const account = DB.govAccounts.find(function(a) { return a.id === id && a.code === code; });
  if (!account) { err('Code d\'accès incorrect.'); return; }
  DB.govUser = { id: account.id, name: name || account.name };
  localStorage.setItem('sa_session', JSON.stringify({type:'gov', id:account.id, name:name||account.name}));
  _notifCounts = {msg: DB.messages?DB.messages.length:0, ann: DB.announcements?DB.announcements.length:0, dec: DB.decrees?DB.decrees.length:0};
  document.getElementById('auth').classList.add('hide');
  document.getElementById('govApp').classList.add('on');
  document.getElementById('gAv').textContent = (name||account.name).split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  document.getElementById('gSName').textContent = name || account.name;
  buildGovNav(); goGov('gdash');
}
function doGovLogout() {
  DB.govUser = null;
  localStorage.removeItem('sa_session');
  document.getElementById('govApp').classList.remove('on');
  document.getElementById('auth').classList.remove('hide');
}
function modalChangeGovPass() {
  modal(`<div class="modal-t">🔑 Changer le Code d'Accès Gouvernement</div>
    <div class="fg"><label>Code actuel</label><input id="gpOld" type="password" placeholder="Entrez le code actuel"></div>
    <div class="fg"><label>Nouveau code</label><input id="gpNew" type="password" placeholder="Nouveau code d'accès"></div>
    <div class="fg"><label>Confirmer le nouveau code</label><input id="gpNew2" type="password" placeholder="Confirmer"></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-red" onclick="doChangeGovPass()">Changer</button></div>`);
}
function doChangeGovPass() {
  var oldCode = document.getElementById('gpOld').value.trim();
  var newCode = document.getElementById('gpNew').value.trim();
  var newCode2 = document.getElementById('gpNew2').value.trim();
  if (!oldCode || !newCode) { err('Remplissez tous les champs.'); return; }
  if (newCode.length < 4) { err('Le nouveau code doit faire au moins 4 caractères.'); return; }
  if (newCode !== newCode2) { err('Les nouveaux codes ne correspondent pas.'); return; }
  var account = DB.govAccounts.find(function(a) { return a.id === DB.govUser.id; });
  if (!account || account.code !== oldCode) { err('Code actuel incorrect.'); return; }
  account.code = newCode;
  closeModal();
  toast('Code d\'accès modifié avec succès');
  saveDB();
}
function modalGovAnnouncement() {
  modal(`<div class="modal-t">📣 Annonce Gouvernementale</div>
    <div class="fg"><label>Titre</label><input id="gaTitle" placeholder="Ex: Nouvelles mesures, Événement public..."></div>
    <div class="fg"><label>Message</label><textarea id="gaBody" rows="3" placeholder="Détail de l'annonce..."></textarea></div>
    <div class="fg"><label>Sondage (optionnel — un choix par ligne)</label><textarea id="gaPoll" rows="3" placeholder="Option 1\nOption 2\n..."></textarea></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="publishGovAnnouncement()">Publier</button></div>`);
}
function publishGovAnnouncement() {
  var title = document.getElementById('gaTitle').value.trim();
  if (!title) { err('Titre requis.'); return; }
  var body = document.getElementById('gaBody').value.trim() || '';
  var pollRaw = document.getElementById('gaPoll').value.trim();
  var poll = [];
  if (pollRaw) {
    poll = pollRaw.split('\n').map(function(l){return l.trim()}).filter(function(l){return l}).map(function(l){return {label:l,count:0}});
  }
  if (!DB.announcements) DB.announcements = [];
  DB.announcements.unshift({
    id: Date.now(), title: title, body: body, icon: '🏛️',
    company: 'État de San Andreas', author: DB.govUser.name, date: new Date().toLocaleDateString('fr-FR'),
    poll: poll, votes: {}
  });
  if (DB.announcements.length > 20) DB.announcements.length = 20;
  closeModal(); toast('Annonce publiée'); goGov('gdash');
}
function buildGovNav() {
  const n = document.getElementById('gNav'); n.innerHTML = '';
  [{ s:'Administration' },
   { id:'gdash', ico:'📊', label:'Tableau de Bord' },
   { id:'gcit', ico:'👥', label:'Citoyens ('+DB.citizens.length+')' },
   { id:'gent', ico:'🏢', label:'Entreprises' },
   { id:'gjobs', ico:'💼', label:'Offres d\'Emploi' },
   { id:'gtax', ico:'💰', label:'Fiscalité' },
   { id:'gbudget', ico:'🏦', label:'Budget de l\'État' },
   { id:'gdecree', ico:'📜', label:'Décrets' },
   { id:'gcodes', ico:'📚', label:'Codes & Lois' },
   { id:'gdefcon', ico:'🚨', label:'DEFCON' },
   { id:'gvault', ico:'🔒', label:'Coffre-Fort' },
   { id:'gvotes', ico:'🗳️', label:'Lois & Votes' },
  ].forEach(i => {
    if (i.s) { const d=document.createElement('div'); d.className='nav-sec'; d.textContent=i.s; n.appendChild(d); }
    else { const d=document.createElement('div'); d.className='nav-i'; d.dataset.p=i.id; d.onclick=()=>goGov(i.id); d.innerHTML=`<span class="ico">${i.ico}</span><span>${i.label}</span>`; n.appendChild(d); }
  });
}
function goGov(p) {
  saveDB();
  document.querySelectorAll('#gNav .nav-i').forEach(el=>el.classList.toggle('on',el.dataset.p===p));
  const c=document.getElementById('gPage');
  const T={gdash:'Panneau de Contrôle',gcit:'Registre des Citoyens',gent:'Gestion des Entreprises',gjobs:'Offres d\'Emploi',gtax:'Configuration Fiscale',gbudget:'Budget de l\'État',gdecree:'Décrets & Annonces',gcodes:'Gestion des Codes & Lois',gdefcon:'Sécurité — DEFCON',gvault:'Coffre-Fort Sécurisé',gvotes:'Lois & Votes Citoyens'};
  document.getElementById('gTopTitle').textContent=T[p]||p;
  const R={gdash:gDash,gcit:gCitizens,gent:gEnt,gjobs:gJobs,gtax:gTax,gbudget:gBudget,gdecree:gDecree,gcodes:gCodes,gdefcon:gDefcon,gvault:gVault,gvotes:gVotes};
  c.innerHTML=(R[p]||(()=>''))();
  document.getElementById('gSide').classList.remove('open');
}
function toggleGSide(){document.getElementById('gSide').classList.toggle('open')}

// ============ GOV: DASHBOARD ============
function gDash() {
  const u = DB.govUser;
  let h = `<div class="gov-warn">🔒 Session sécurisée — ${u.name} (${u.id}) — ${new Date().toLocaleString('fr-FR')}</div>`;
  h += `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">📊 Panneau de Contrôle</h1></div>`;
  h += `<div class="stats">
    <div class="stat"><div class="stat-l">Citoyens</div><div class="stat-v" style="color:var(--cyan)">${DB.citizens.length}</div><div class="stat-s">Inscrits</div></div>
    <div class="stat"><div class="stat-l">Entreprises</div><div class="stat-v" style="color:var(--blue)">${DB.enterprises.filter(e=>e.status==='active').length}</div><div class="stat-s">Actives</div></div>
    <div class="stat"><div class="stat-l">DEFCON</div><div class="stat-v" style="color:${['','var(--red)','var(--orange)','var(--gold)','var(--blue)','var(--green)'][DB.defcon]}">${DB.defcon}</div><div class="stat-s">${['','Guerre','Sévère','Élevé','Gardé','Normal'][DB.defcon]}</div></div>
    <div class="stat" style="border-color:rgba(240,180,41,.3)"><div class="stat-l">Budget État</div><div class="stat-v" style="color:var(--gold)">$${DB.govBudget.balance.toLocaleString()}</div><div class="stat-s">Solde disponible</div></div>
    <div class="stat"><div class="stat-l">TVA</div><div class="stat-v" style="color:var(--orange)">${DB.taxConfig.tva}%</div></div>
    <div class="stat"><div class="stat-l">Décrets</div><div class="stat-v" style="color:var(--purple)">${DB.decrees.length}</div></div>
  </div>`;
  h += `<div class="card"><div class="card-t">⚡ Accès rapide</div><div style="display:flex;flex-wrap:wrap;gap:.4rem">
    <button class="btn btn-sm btn-blue" onclick="goGov('gcit')">👥 Citoyens</button>
    <button class="btn btn-sm btn-outline" onclick="goGov('gent')">🏢 Entreprises</button>
    <button class="btn btn-sm btn-outline" onclick="goGov('gbudget')">🏦 Budget</button>
    <button class="btn btn-sm btn-outline" onclick="goGov('gtax')">💰 Fiscalité</button>
    <button class="btn btn-sm btn-outline" onclick="goGov('gdecree')">📜 Décrets</button>
    <button class="btn btn-sm btn-outline" onclick="goGov('gdefcon')">🚨 DEFCON</button>
    <button class="btn btn-sm btn-outline" onclick="goGov('gvault')">🔒 Coffre-Fort</button>
    <button class="btn btn-sm btn-outline" onclick="modalGovAnnouncement()" style="border-color:rgba(240,180,41,.3);color:var(--gold)">📣 Annonce</button>
    <button class="btn btn-sm btn-red" onclick="modalChangeGovPass()" style="margin-left:auto">🔑 Changer le Code</button>
  </div></div>`;
  h += `<div class="card"><div class="card-t">📋 Derniers Décrets</div>`;
  DB.decrees.slice(0,3).forEach(d => h += `<div style="padding:.5rem 0;border-bottom:1px solid rgba(30,41,59,.3);font-size:.84rem"><strong class="mono" style="color:var(--gold)">${d.code}</strong> — ${d.title} <span style="font-size:.7rem;color:var(--t3)">${d.date}</span></div>`);
  h += '</div>';
  return h;
}

// ============ GOV: CITOYENS ============
function gCitizens() {
  const employed = DB.citizens.filter(c => c.job);
  const unemployed = DB.citizens.filter(c => !c.job);
  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">👥 Registre des Citoyens</h1><p style="color:var(--t2);font-size:.82rem">${DB.citizens.length} citoyens enregistrés — ${employed.length} employés, ${unemployed.length} sans emploi</p></div>`;
  h += `<div class="stats">
    <div class="stat"><div class="stat-l">Total Inscrits</div><div class="stat-v" style="color:var(--cyan)">${DB.citizens.length}</div></div>
    <div class="stat"><div class="stat-l">Employés</div><div class="stat-v" style="color:var(--green)">${employed.length}</div></div>
    <div class="stat"><div class="stat-l">Sans Emploi</div><div class="stat-v" style="color:var(--orange)">${unemployed.length}</div></div>
  </div>`;
  h += '<div class="card" style="padding:0;overflow-x:auto"><table><thead><tr><th>ID Citoyen</th><th>Nom</th><th>Téléphone</th><th>Inscrit le</th><th>Emploi</th><th>Actions</th></tr></thead><tbody>';
  DB.citizens.forEach((c,i) => {
    h += `<tr>
      <td class="mono" style="font-size:.78rem;color:var(--gold)">${c.id}</td>
      <td style="font-weight:600">${c.name}</td>
      <td class="mono" style="font-size:.8rem">${c.phone}</td>
      <td style="font-size:.8rem">${c.registered}</td>
      <td>${c.job ? `<span class="badge b-green">${c.job}</span><div style="font-size:.68rem;color:var(--t3)">${c.role||''}</div>` : '<span class="badge b-orange">Sans emploi</span>'}</td>
      <td><div style="display:flex;gap:.2rem;flex-wrap:wrap">
        <button class="btn btn-sm btn-outline" onclick="modalAssignPatron('${c.id}')" title="Nommer Patron">👔</button>
        ${c.job ? `<button class="btn btn-sm btn-red" onclick="removeFromJob('${c.id}')" title="Retirer de l'emploi" style="padding:.2rem .4rem">🚫</button>` : ''}
        <button class="btn btn-sm btn-outline" onclick="modalResetPass('${c.id}')" title="Réinitialiser MDP">🔑</button>
        <button class="btn btn-sm btn-red" onclick="deleteCitizen('${c.id}','${c.name}')" title="Supprimer" style="padding:.2rem .4rem">🗑️</button>
      </div></td>
    </tr>`;
  });
  h += '</tbody></table></div>';
  return h;
}
function modalAssignPatron(citizenId) {
  const c = DB.citizens.find(x=>x.id===citizenId);
  const entOpts = DB.enterprises.map((e,i)=>`<option value="${i}">${e.icon} ${e.name}</option>`).join('');
  modal(`<div class="modal-t">👔 Nommer ${c.name} comme Patron</div>
    <div style="padding:.5rem .7rem;background:var(--input);border-radius:6px;margin-bottom:.8rem;font-size:.83rem">Citoyen: <strong>${c.name}</strong> <span class="mono" style="color:var(--t3)">${c.id}</span></div>
    <div class="fg"><label>Entreprise</label><select id="apEnt">${entOpts}</select></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="doAssignPatron('${c.id}','${c.name}','${c.phone||''}')">Confirmer</button></div>`);
}
function removeFromJob(citizenId) {
  const c = DB.citizens.find(x=>x.id===citizenId);
  if (!c || !c.job) return;
  confirmDel('Retirer ' + c.name + ' de ' + c.job + ' ? ('+c.role+')', function(){
    const jobData = DB.allJobs[c.job];
    if (jobData) {
      const emp = jobData.employees.find(function(e){return e.id===citizenId});
      if (emp) emp.status = 'inactive';
    }
    if (c.role === 'Patron') {
      const ent = DB.enterprises.find(function(e){return e.name===c.job});
      if (ent) { ent.patron = '—'; ent.patronId = ''; }
    }
    const ent2 = DB.enterprises.find(function(e){return e.name===c.job});
    if (ent2 && DB.allJobs[c.job]) ent2.employees = DB.allJobs[c.job].employees.filter(function(e){return e.status==='active'}).length;
    c.job = null; c.role = null;
    toast(c.name + ' retiré de son emploi');
    goGov('gcit');
  });
}
function deleteCitizen(citizenId, citizenName) {
  confirmDel('Supprimer définitivement ' + citizenName + ' (' + citizenId + ') ? Cette action est irréversible.', function(){
    const c = DB.citizens.find(function(x){return x.id===citizenId});
    if (c && c.job) {
      // Remove from enterprise
      var jobData = DB.allJobs[c.job];
      if (jobData) {
        var emp = jobData.employees.find(function(e){return e.id===citizenId});
        if (emp) emp.status = 'inactive';
      }
      // If patron, clear
      if (c.role === 'Patron') {
        var ent = DB.enterprises.find(function(e){return e.name===c.job});
        if (ent) { ent.patron = '—'; ent.patronId = ''; }
      }
    }
    // Remove health records
    delete DB.healthRecords[citizenId];
    delete DB.citizenSalaries[citizenId];
    // Remove votes
    delete DB.voted[citizenId];
    // Remove messages
    DB.messages = DB.messages.filter(function(m){return m.from_citizen_id !== citizenId});
    // Remove citizen
    var idx = DB.citizens.findIndex(function(x){return x.id===citizenId});
    if (idx > -1) DB.citizens.splice(idx, 1);
    toast(citizenName + ' supprimé définitivement');
    goGov('gcit');
  });
}
function doAssignPatron(citizenId, citizenName, citizenPhone) {
  const ei = parseInt(document.getElementById('apEnt').value);
  const ent = DB.enterprises[ei];
  // Remove old patron
  const oldCit = DB.citizens.find(x=>x.id===ent.patronId);
  if (oldCit && oldCit.role==='Patron' && oldCit.id !== citizenId) { oldCit.job = null; oldCit.role = null; }
  // Set enterprise patron
  ent.patron = citizenName;
  ent.patronId = citizenId;
  // Update citizen
  const ct = DB.citizens.find(x=>x.id===citizenId);
  ct.job = ent.name; ct.role = 'Patron';
  // Ensure allJobs data exists for this enterprise
  if (!DB.allJobs) DB.allJobs = {};
  if (!DB.allJobs[ent.name]) {
    createEnterpriseData(ent.name, ent.icon);
  }
  // Add patron as grade 0 employee if not already there
  const jobData = DB.allJobs[ent.name];
  const existing = jobData.employees.find(e=>e.id===citizenId);
  if (existing) { existing.grade = 0; existing.status = 'active'; }
  else { jobData.employees.push({id:citizenId, name:citizenName, grade:0, phone:citizenPhone, hired:new Date().toLocaleDateString('fr-FR'), status:'active'}); }
  closeModal();
  toast(citizenName + ' nommé Patron de ' + ent.name);
  goGov('gcit');
}
function modalResetPass(citizenId) {
  const c = DB.citizens.find(x=>x.id===citizenId);
  modal(`<div class="modal-t">🔑 Réinitialiser le Mot de Passe</div>
    <div style="padding:.5rem .7rem;background:var(--input);border-radius:6px;margin-bottom:.8rem;font-size:.83rem">Citoyen: <strong>${c.name}</strong> <span class="mono" style="color:var(--t3)">${c.id}</span></div>
    <div class="fg"><label>Nouveau mot de passe</label><input id="rpPass" type="text" placeholder="Nouveau MDP"></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="const p=document.getElementById('rpPass').value;if(!p||p.length<3){err('Min 3 caractères');return}DB.citizens.find(x=>x.id==='${c.id}').pass=p;closeModal();toast('MDP de ${c.name} réinitialisé')">Réinitialiser</button></div>`);
}

// ============ GOV: ENTREPRISES ============
function gEnt() {
  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">🏢 Gestion des Entreprises</h1><p style="color:var(--t2);font-size:.82rem">${DB.enterprises.length} entreprises enregistrées</p></div>`;
  h += `<div style="margin-bottom:.8rem"><button class="btn btn-sm btn-blue" onclick="modalCreateEnt()">+ Créer une Entreprise</button></div>`;
  h += '<div class="card" style="padding:0;overflow-x:auto"><table><thead><tr><th>ID</th><th>Entreprise</th><th>Type</th><th>Patron</th><th>Emp.</th><th>Statut</th><th>Actions</th></tr></thead><tbody>';
  DB.enterprises.forEach((e,i) => {
    h += `<tr>
      <td class="mono" style="font-size:.72rem">${e.id}</td>
      <td style="font-weight:600">${e.icon} ${e.name}</td>
      <td><span class="badge b-blue">${e.type}</span></td>
      <td style="font-size:.82rem">${e.patron||'—'}<div class="mono" style="font-size:.68rem;color:var(--t3)">${e.patronId||''}</div></td>
      <td>${(DB.allJobs&&DB.allJobs[e.name])?DB.allJobs[e.name].employees.filter(x=>x.status==='active').length:0}</td>
      <td><span class="badge ${e.status==='active'?'b-green':e.status==='suspended'?'b-orange':'b-red'}">${e.status==='active'?'Active':e.status==='suspended'?'Suspendue':'Fermée'}</span></td>
      <td><div style="display:flex;gap:.2rem;flex-wrap:wrap">
        <button class="btn btn-sm btn-outline" onclick="modalEditEnt(${i})" title="Modifier">✏️</button>
        <button class="btn btn-sm btn-outline" onclick="modalChangePatron(${i})" title="Changer le patron">👔</button>
        <button class="btn btn-sm btn-outline" style="border-color:rgba(59,130,246,.3);color:var(--blue)" onclick="modalGovPostJob(${i})" title="Publier une offre">📢</button>
        ${e.status==='active'?`<button class="btn btn-sm btn-outline" style="border-color:rgba(249,115,22,.3);color:var(--orange)" onclick="DB.enterprises[${i}].status='suspended';toast('${e.name} suspendue');goGov('gent')" title="Suspendre">⏸️</button>`:`<button class="btn btn-sm btn-outline" style="border-color:rgba(34,197,94,.3);color:var(--green)" onclick="DB.enterprises[${i}].status='active';toast('${e.name} réactivée');goGov('gent')" title="Réactiver">▶</button>`}
        <button class="btn btn-sm btn-red" onclick="delEnterprise(${i})" title="Supprimer">🗑️</button>
      </div></td></tr>`;
  });
  h += '</tbody></table></div>';
  return h;
}
function modalCreateEnt() {
  const citOpts = '<option value="">— Aucun patron pour le moment —</option>' + DB.citizens.map(c => `<option value="${c.id}">${c.name} (${c.id})${c.job?' — '+c.job:''}</option>`).join('');
  modal(`<div class="modal-t">🏢 Créer une Entreprise</div>
    <div class="row"><div class="fg"><label>Nom</label><input id="ceNom" placeholder="Nom de l'entreprise"></div><div class="fg"><label>Icône</label><input id="ceIco" placeholder="🏢" value="🏢" style="width:60px"></div></div>
    <div class="fg"><label>Type d'activité</label><select id="ceType"><option>Transport</option><option>Santé</option><option>Restauration</option><option>Mécanique</option><option>Divertissement</option><option>Immobilier</option><option>Sécurité</option><option>Autre</option></select></div>
    <div class="fg"><label>👔 Patron (optionnel)</label><select id="cePatronId">${citOpts}</select></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="createEnt()">Créer</button></div>`);
}
function createEnt() {
  const n = document.getElementById('ceNom').value.trim();
  if (!n) { err('Nom de l\'entreprise requis.'); return; }
  const pid = document.getElementById('cePatronId').value;
  const ico = document.getElementById('ceIco').value||'🏢';
  const cit = pid ? DB.citizens.find(c=>c.id===pid) : null;
  DB.enterprises.push({id:'ENT-'+String(DB.enterprises.length+1).padStart(3,'0'), name:n, icon:ico, type:document.getElementById('ceType').value, patron:cit?cit.name:'', patronId:pid||'', status:'active', created:new Date().toLocaleDateString('fr-FR'), employees:cit?1:0});
  createEnterpriseData(n, ico);
  if (cit) {
    cit.job = n; cit.role = 'Patron';
    DB.allJobs[n].employees.push({id:cit.id, name:cit.name, grade:0, phone:cit.phone, hired:new Date().toLocaleDateString('fr-FR'), status:'active'});
  }
  closeModal(); toast(n + ' créée' + (cit?' — Patron: '+cit.name:'')); goGov('gent');
}
function modalEditEnt(idx) {
  const e = DB.enterprises[idx];
  const types = ['Transport','Santé','Restauration','Mécanique','Divertissement','Immobilier','Sécurité','Autre'];
  const typeOpts = types.map(function(t){return '<option '+(t===e.type?'selected':'')+'>'+t+'</option>'}).join('');
  modal(`<div class="modal-t">✏️ Modifier — ${e.icon} ${e.name}</div>
    <div class="row"><div class="fg"><label>Nom</label><input id="eeNom" value="${e.name}"></div><div class="fg"><label>Icône</label><input id="eeIco" value="${e.icon}" style="width:60px"></div></div>
    <div class="fg"><label>Type d'activité</label><select id="eeType">${typeOpts}</select></div>
    <div class="fg"><label>Statut</label><select id="eeStatus"><option value="active" ${e.status==='active'?'selected':''}>Active</option><option value="suspended" ${e.status==='suspended'?'selected':''}>Suspendue</option><option value="closed" ${e.status==='closed'?'selected':''}>Fermée</option></select></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="saveEditEnt(${idx})">Sauvegarder</button></div>`);
}
function saveEditEnt(idx) {
  const e = DB.enterprises[idx];
  const oldName = e.name;
  const newName = document.getElementById('eeNom').value.trim();
  if (!newName) { err('Nom requis.'); return; }
  const newIco = document.getElementById('eeIco').value || '🏢';
  e.name = newName;
  e.icon = newIco;
  e.type = document.getElementById('eeType').value;
  e.status = document.getElementById('eeStatus').value;
  // If name changed, update allJobs reference + citizens
  if (oldName !== newName && DB.allJobs[oldName]) {
    DB.allJobs[newName] = DB.allJobs[oldName];
    DB.allJobs[newName].company = newName;
    DB.allJobs[newName].icon = newIco;
    delete DB.allJobs[oldName];
    // Update citizens who work there
    DB.citizens.forEach(function(c) { if (c.job === oldName) c.job = newName; });
    // Update job offers
    DB.jobs.forEach(function(j) { if (j.company === oldName) { j.company = newName; j.icon = newIco; } });
  }
  if (DB.allJobs[newName]) DB.allJobs[newName].icon = newIco;
  closeModal(); toast(newName + ' mis à jour'); goGov('gent');
}
function delEnterprise(idx) {
  const e = DB.enterprises[idx];
  confirmDel('Supprimer définitivement ' + e.name + ' ? Cette action est irréversible.', function(){
    // Remove all employees from citizen registry
    if (DB.allJobs[e.name]) {
      DB.allJobs[e.name].employees.forEach(emp => {
        const cit = DB.citizens.find(c => c.id === emp.id);
        if (cit) { cit.job = null; cit.role = null; }
      });
      delete DB.allJobs[e.name];
    }
    DB.enterprises.splice(idx, 1);
    toast('Entreprise supprimée');
    goGov('gent');
  });
}
function modalChangePatron(idx) {
  var e = DB.enterprises[idx];
  var hasPatron = e.patron && e.patronId;
  modal('<div class="modal-t">\u{1F454} Gérer le Patron — ' + e.name + '</div>' +
    (hasPatron ? '<div style="padding:.6rem;background:var(--input);border-radius:6px;margin-bottom:1rem;font-size:.85rem;display:flex;justify-content:space-between;align-items:center"><span>Patron actuel: <strong>' + e.patron + '</strong> <span class="mono" style="font-size:.75rem;color:var(--t3)">' + e.patronId + '</span></span><button class="btn btn-sm btn-red" onclick="removePatron(' + idx + ')">Retirer le patron</button></div>' : '<div style="padding:.6rem;background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.2);border-radius:6px;margin-bottom:1rem;font-size:.85rem;color:var(--orange)">Aucun patron assigné</div>') +
    '<div class="fg"><label>Rechercher un citoyen par nom</label><input id="cpSearch" placeholder="Tapez un nom..." oninput="searchPatronResults(' + idx + ')"></div>' +
    '<div id="cpResults" style="max-height:200px;overflow-y:auto"></div>' +
    '<div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Fermer</button></div>');
}
function searchPatronResults(entIdx) {
  var q = document.getElementById('cpSearch').value.trim().toLowerCase();
  var box = document.getElementById('cpResults');
  if (q.length < 2) { box.innerHTML = '<p style="font-size:.8rem;color:var(--t3)">Tapez au moins 2 caractères...</p>'; return; }
  var results = DB.citizens.filter(function(c) { return c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q); });
  if (!results.length) { box.innerHTML = '<p style="font-size:.8rem;color:var(--t3)">Aucun citoyen trouvé.</p>'; return; }
  var h = '';
  results.slice(0, 10).forEach(function(c) {
    h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:.5rem .7rem;background:var(--input);border-radius:6px;margin-bottom:.3rem">';
    h += '<div><strong style="font-size:.88rem">' + c.name + '</strong> <span class="mono" style="font-size:.72rem;color:var(--t3)">' + c.id + '</span>';
    h += (c.job ? '<div style="font-size:.72rem;color:var(--orange)">' + c.job + ' — ' + (c.role||'') + '</div>' : '<div style="font-size:.72rem;color:var(--green)">Disponible</div>') + '</div>';
    h += '<button class="btn btn-sm btn-blue" onclick="assignPatronFromSearch(' + entIdx + ',\'' + c.id + '\')">Nommer</button>';
    h += '</div>';
  });
  box.innerHTML = h;
}
function assignPatronFromSearch(idx, citizenId) {
  var ent = DB.enterprises[idx];
  var newCit = DB.citizens.find(function(c){return c.id===citizenId});
  if (!newCit) return;
  // Remove old patron
  var oldCit = DB.citizens.find(function(c){return c.id===ent.patronId});
  if (oldCit && oldCit.role==='Patron' && oldCit.id !== citizenId) { oldCit.job = null; oldCit.role = null; }
  // Set new patron
  ent.patron = newCit.name;
  ent.patronId = newCit.id;
  newCit.job = ent.name; newCit.role = 'Patron';
  // Update allJobs
  if (!DB.allJobs[ent.name]) createEnterpriseData(ent.name, ent.icon);
  var jobData = DB.allJobs[ent.name];
  var existing = jobData.employees.find(function(e){return e.id===citizenId});
  if (existing) { existing.grade = 0; existing.status = 'active'; }
  else { jobData.employees.push({id:citizenId, name:newCit.name, grade:0, phone:newCit.phone||'', hired:new Date().toLocaleDateString('fr-FR'), status:'active'}); }
  closeModal(); toast(newCit.name + ' nommé Patron de ' + ent.name); goGov('gent');
}
function removePatron(idx) {
  var ent = DB.enterprises[idx];
  if (!ent.patronId) return;
  var oldCit = DB.citizens.find(function(c){return c.id===ent.patronId});
  if (oldCit) {
    // Remove from employee list
    var jobData = DB.allJobs[ent.name];
    if (jobData) {
      var emp = jobData.employees.find(function(e){return e.id===ent.patronId});
      if (emp) emp.status = 'inactive';
    }
    if (oldCit.role === 'Patron') { oldCit.job = null; oldCit.role = null; }
  }
  ent.patron = ''; ent.patronId = '';
  closeModal(); toast('Patron retiré de ' + ent.name); goGov('gent');
}
function modalGovPostJob(entIdx) {
  const ent = DB.enterprises[entIdx];
  modal(`<div class="modal-t">📢 Publier une Offre — ${ent.icon} ${ent.name}</div>
    <div class="fg"><label>Poste</label><input id="gjRole" placeholder="Ex: Chauffeur, Médecin..."></div>
    <div class="fg"><label>Rémunération</label><input id="gjSalary" placeholder="Ex: $1500/sem, Commission 12%..."></div>
    <div class="fg"><label>Nombre de postes</label><input type="number" id="gjSlots" value="1" min="1"></div>
    <div class="fg"><label>Description</label><textarea id="gjDesc" rows="3" placeholder="Décrivez le poste..."></textarea></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="govPostJob(${entIdx})">Publier</button></div>`);
}
function govPostJob(entIdx) {
  const ent = DB.enterprises[entIdx];
  DB.jobs.push({id:Date.now(), company:ent.name, icon:ent.icon, role:document.getElementById('gjRole').value||'Employé', salary:document.getElementById('gjSalary').value||'À définir', slots:parseInt(document.getElementById('gjSlots').value)||1, desc:document.getElementById('gjDesc').value||'Poste ouvert.', postedBy:'Gouvernement'});
  closeModal(); toast('Offre publiée pour ' + ent.name); goGov('gent');
}

// ============ GOV: OFFRES D'EMPLOI ============
function gJobs() {
  let h = `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
    <div><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">💼 Offres d'Emploi</h1><p style="color:var(--t2);font-size:.82rem">${DB.jobs.length} offre${DB.jobs.length>1?'s':''} publiée${DB.jobs.length>1?'s':''}</p></div>
    <button class="btn btn-sm btn-blue" onclick="modalGovPostJob()">+ Publier une Offre (État)</button>
  </div>`;

  if (!DB.jobs.length) h += '<div class="card" style="text-align:center;padding:1.5rem;color:var(--t3)">Aucune offre publiée.</div>';
  DB.jobs.forEach(function(j,i) {
    h += `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.5rem">
        <div style="flex:1;min-width:200px">
          <div style="font-weight:600;font-size:.95rem">${j.icon} ${j.company}</div>
          <div style="font-size:.88rem;margin-top:.2rem">${j.role} <span class="badge b-gold">${j.salary}</span></div>
          <p style="font-size:.8rem;color:var(--t2);margin-top:.3rem">${j.desc}</p>
          <div style="font-size:.73rem;color:var(--t3);margin-top:.3rem">👥 ${j.slots} poste${j.slots>1?'s':''} — Posté par ${j.postedBy||'—'}</div>
        </div>
        <button class="btn btn-sm btn-red" onclick="DB.jobs.splice(${i},1);toast('Offre supprimée');goGov('gjobs')" style="padding:.25rem .5rem">🗑️</button>
      </div></div>`;
  });
  return h;
}
function modalGovPostJob() {
  const entOpts = DB.enterprises.filter(function(e){return e.status==='active'}).map(function(e,i){return '<option value="'+i+'">'+e.icon+' '+e.name+'</option>'}).join('');
  modal(`<div class="modal-t">💼 Publier une Offre d'Emploi</div>
    <div class="fg"><label>Entreprise</label><select id="gjEnt">${entOpts}<option value="gov">🏛️ État de San Andreas</option></select></div>
    <div class="fg"><label>Poste proposé</label><input id="gjRole" placeholder="Ex: Secrétaire, Agent..."></div>
    <div class="fg"><label>Salaire / Rémunération</label><input id="gjSal" placeholder="Ex: $1500/sem"></div>
    <div class="fg"><label>Nombre de postes</label><input type="number" id="gjSlots" value="1" min="1"></div>
    <div class="fg"><label>Description</label><textarea id="gjDesc" rows="3" placeholder="Décrivez le poste..."></textarea></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="govPublishJob()">Publier</button></div>`);
}
function govPublishJob() {
  const entIdx = document.getElementById('gjEnt').value;
  var company, icon;
  if (entIdx === 'gov') { company = 'État de San Andreas'; icon = '🏛️'; }
  else { const e = DB.enterprises[parseInt(entIdx)]; company = e.name; icon = e.icon; }
  DB.jobs.push({
    id: Date.now(), company: company, icon: icon,
    role: document.getElementById('gjRole').value || 'Agent',
    salary: document.getElementById('gjSal').value || 'À définir',
    slots: parseInt(document.getElementById('gjSlots').value) || 1,
    desc: document.getElementById('gjDesc').value || 'Poste à pourvoir.',
    postedBy: DB.govUser ? DB.govUser.name : 'Gouvernement'
  });
  closeModal(); toast('Offre publiée !'); goGov('gjobs');
}

// ============ GOV: FISCALITE ============
function gTax() {
  const tc = DB.taxConfig;
  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">💰 Configuration Fiscale</h1><p style="color:var(--t2);font-size:.82rem">Modifier les taux d'imposition en vigueur</p></div>`;
  h += `<div class="card"><div class="card-t">📊 TVA — Taux actuel: <strong style="color:var(--gold)">${tc.tva}%</strong></div>
    <div class="row" style="align-items:flex-end"><div class="fg" style="margin:0"><label>Nouveau taux TVA (%)</label><input type="number" id="newTva" value="${tc.tva}" min="0" max="30"></div><div><button class="btn btn-sm btn-blue" onclick="DB.taxConfig.tva=parseInt(document.getElementById('newTva').value)||5;toast('TVA mise à jour: '+DB.taxConfig.tva+'%');goGov('gtax')">Appliquer</button></div></div></div>`;
  h += `<div class="card"><div class="card-t">📊 Barème Progressif de l'Impôt</div>
    <table><thead><tr><th>Tranche</th><th>Bénéfice Net</th><th>Taux</th><th>Action</th></tr></thead><tbody>`;
  tc.tranches.forEach((t,i) => {
    h += `<tr><td><span class="badge b-gold">${i+1}</span></td><td class="mono">$${t.min.toLocaleString()} — $${t.max.toLocaleString()}</td><td><input type="number" value="${t.rate}" min="0" max="100" style="width:70px;padding:.3rem .5rem;font-size:.85rem" onchange="DB.taxConfig.tranches[${i}].rate=parseInt(this.value)||0;toast('Tranche ${i+1} → '+this.value+'%')"> %</td><td>${i>0?`<button class="btn btn-sm btn-red" onclick="DB.taxConfig.tranches.splice(${i},1);toast('Tranche supprimée');goGov('gtax')">✕</button>`:''}</td></tr>`;
  });
  h += `</tbody></table>
    <button class="btn btn-sm btn-outline" style="margin-top:.6rem" onclick="modalAddTranche()">+ Ajouter une tranche</button></div>`;
  h += `<div class="card"><div class="card-t">🧮 Simulateur d'Impôt</div>
    <div class="row" style="align-items:flex-end"><div class="fg" style="margin:0"><label>CA ($)</label><input type="number" id="simCA" value="125000"></div><div class="fg" style="margin:0"><label>Dépenses ($)</label><input type="number" id="simDep" value="43200"></div><div><button class="btn btn-sm btn-gold" onclick="simTax()">Calculer</button></div></div>
    <div id="simResult"></div></div>`;
  // Received declarations from enterprises
  h += `<div class="card"><div class="card-t">📨 Déclarations Fiscales Reçues</div>`;
  if (!DB.govTaxDeclarations.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucune déclaration reçue.</p>';
  else {
    h += '<table><thead><tr><th>Entreprise</th><th>Période</th><th>CA</th><th>Dépenses</th><th>Bénéfice</th><th>Impôt</th><th>TVA</th><th>Date</th><th>Statut</th><th></th></tr></thead><tbody>';
    DB.govTaxDeclarations.forEach((d,i) => {
      h += `<tr><td style="font-weight:500">${d.icon} ${d.company}</td><td>${d.period}</td><td class="mono">$${d.ca.toLocaleString()}</td><td class="mono">$${d.expenses.toLocaleString()}</td><td class="mono">$${d.net.toLocaleString()}</td><td class="mono" style="color:var(--gold)">$${d.taxDue.toLocaleString()}</td><td class="mono" style="color:var(--orange)">$${d.tva.toLocaleString()}</td><td style="font-size:.78rem">${d.date}</td><td><span class="badge ${d.status==='paid'?'b-green':d.status==='pending'?'b-orange':'b-red'}">${d.status==='paid'?'Payé':d.status==='pending'?'En attente':'Rejeté'}</span></td>
        <td>${d.status==='pending'?`<div style="display:flex;gap:.2rem"><button class="btn btn-sm btn-green" onclick="DB.govTaxDeclarations[${i}].status='paid';toast('Déclaration validée');goGov('gtax')">✓</button><button class="btn btn-sm btn-red" onclick="DB.govTaxDeclarations[${i}].status='rejected';toast('Déclaration rejetée');goGov('gtax')">✕</button></div>`:''}</td></tr>`;
    });
    h += '</tbody></table>';
    const totalDue = DB.govTaxDeclarations.filter(d=>d.status==='pending').reduce((s,d)=>s+d.taxDue+d.tva,0);
    if (totalDue) h += `<div style="margin-top:.5rem;font-size:.85rem;color:var(--gold)">💰 Total en attente de paiement: <strong class="mono">$${totalDue.toLocaleString()}</strong></div>`;
  }
  h += '</div>';
  return h;
}
function modalAddTranche() {
  const last = DB.taxConfig.tranches[DB.taxConfig.tranches.length-1];
  modal(`<div class="modal-t">➕ Nouvelle Tranche</div>
    <div class="row"><div class="fg"><label>À partir de ($)</label><input id="atMin" type="number" value="${last.max+1}"></div><div class="fg"><label>Jusqu'à ($)</label><input id="atMax" type="number" value="${last.max+100000}"></div></div>
    <div class="fg"><label>Taux (%)</label><input id="atRate" type="number" value="${last.rate+5}"></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="DB.taxConfig.tranches.push({min:parseInt(document.getElementById('atMin').value),max:parseInt(document.getElementById('atMax').value),rate:parseInt(document.getElementById('atRate').value)});closeModal();toast('Tranche ajoutée');goGov('gtax')">Ajouter</button></div>`);
}
function simTax() {
  const ca=parseInt(document.getElementById('simCA').value)||0, dep=parseInt(document.getElementById('simDep').value)||0;
  const net=Math.max(0,ca-dep); let tax=0;
  DB.taxConfig.tranches.forEach(t => { if(net>t.min){const taxable=Math.min(net,t.max)-t.min;if(taxable>0)tax+=Math.round(taxable*t.rate/100)} });
  const tva=Math.round(ca*DB.taxConfig.tva/100);
  document.getElementById('simResult').innerHTML=`<div class="stats" style="margin-top:.8rem"><div class="stat"><div class="stat-l">Bénéfice</div><div class="stat-v" style="color:var(--blue);font-size:1.3rem">$${net.toLocaleString()}</div></div><div class="stat"><div class="stat-l">Impôt</div><div class="stat-v" style="color:var(--gold);font-size:1.3rem">$${tax.toLocaleString()}</div></div><div class="stat"><div class="stat-l">TVA (${DB.taxConfig.tva}%)</div><div class="stat-v" style="color:var(--orange);font-size:1.3rem">$${tva.toLocaleString()}</div></div><div class="stat"><div class="stat-l">Total</div><div class="stat-v" style="color:var(--red);font-size:1.3rem">$${(tax+tva).toLocaleString()}</div></div></div>`;
}

// ============ GOV: BUDGET DE L'ÉTAT ============
function gBudget() {
  const b = DB.govBudget;
  const totalIncome = b.income.reduce((s,i) => s + i.amount, 0);
  const totalExpenses = b.expenses.reduce((s,e) => s + e.amount, 0);
  const totalInvested = b.investments.reduce((s,i) => s + i.spent, 0);
  const totalPlanned = b.investments.reduce((s,i) => s + i.budget, 0);

  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">🏦 Budget de l'État</h1><p style="color:var(--t2);font-size:.82rem">Finances publiques de San Andreas</p></div>`;

  // Key stats
  h += `<div class="stats">
    <div class="stat" style="border-color:rgba(34,197,94,.2)"><div class="stat-l">Recettes Totales</div><div class="stat-v" style="color:var(--green)">$${totalIncome.toLocaleString()}</div></div>
    <div class="stat" style="border-color:rgba(239,68,68,.2)"><div class="stat-l">Dépenses</div><div class="stat-v" style="color:var(--red)">$${totalExpenses.toLocaleString()}</div></div>
    <div class="stat" style="border-color:rgba(59,130,246,.2)"><div class="stat-l">Investissements</div><div class="stat-v" style="color:var(--blue)">$${totalInvested.toLocaleString()}</div><div class="stat-s">sur $${totalPlanned.toLocaleString()} prévus</div></div>
    <div class="stat" style="border-color:rgba(240,180,41,.3)"><div class="stat-l">Solde Disponible</div><div class="stat-v" style="color:var(--gold)">$${b.balance.toLocaleString()}</div></div>
  </div>`;

  // Income breakdown
  h += `<div class="row">`;
  h += `<div class="card"><div class="card-t" style="color:var(--green);justify-content:space-between">📈 Recettes <button class="btn btn-sm btn-green" onclick="modalAddBudgetItem('income')">+ Recette</button></div>
    <table><thead><tr><th>Source</th><th>Période</th><th>Montant</th><th>Détail</th><th></th></tr></thead><tbody>`;
  b.income.forEach((i,idx) => {
    h += `<tr><td style="font-weight:500">${i.type}</td><td style="font-size:.8rem">${i.date}</td><td class="mono" style="color:var(--green)">$${i.amount.toLocaleString()}</td><td style="font-size:.8rem;color:var(--t2)">${i.desc}</td>
      <td><button class="btn btn-sm btn-red" onclick="DB.govBudget.income.splice(${idx},1);toast('Supprimé');goGov('gbudget')" style="padding:.2rem .4rem">✕</button></td></tr>`;
  });
  h += `</tbody></table><div style="margin-top:.5rem;text-align:right;font-size:.85rem;color:var(--green)">Total: <strong class="mono">$${totalIncome.toLocaleString()}</strong></div></div>`;

  // Expenses breakdown
  h += `<div class="card"><div class="card-t" style="color:var(--red);justify-content:space-between">📉 Dépenses <button class="btn btn-sm btn-red" onclick="modalAddBudgetItem('expense')">+ Dépense</button></div>
    <table><thead><tr><th>Poste</th><th>Date</th><th>Montant</th><th>Détail</th><th></th></tr></thead><tbody>`;
  b.expenses.forEach((e,idx) => {
    h += `<tr><td style="font-weight:500">${e.type}</td><td style="font-size:.8rem">${e.date}</td><td class="mono" style="color:var(--red)">$${e.amount.toLocaleString()}</td><td style="font-size:.8rem;color:var(--t2)">${e.desc}${e.beneficiary?' → '+e.beneficiary:''}</td>
      <td><button class="btn btn-sm btn-red" onclick="DB.govBudget.expenses.splice(${idx},1);toast('Supprimé');goGov('gbudget')" style="padding:.2rem .4rem">✕</button></td></tr>`;
  });
  h += `</tbody></table><div style="margin-top:.5rem;text-align:right;font-size:.85rem;color:var(--red)">Total: <strong class="mono">$${totalExpenses.toLocaleString()}</strong></div></div>`;
  h += '</div>';

  // Investments / Projects
  h += `<div class="card"><div class="card-t" style="justify-content:space-between">🏗️ Projets & Investissements <button class="btn btn-sm btn-blue" onclick="modalAddInvestment()">+ Projet</button></div>`;
  b.investments.forEach((inv, idx) => {
    const pct = inv.budget > 0 ? Math.round(inv.spent / inv.budget * 100) : 0;
    const statusBc = inv.status==='done'?'b-green':inv.status==='active'?'b-blue':'b-orange';
    const statusLb = inv.status==='done'?'Terminé':inv.status==='active'?'En cours':'Planifié';
    h += `<div style="padding:.7rem;background:var(--input);border:1px solid var(--border);border-radius:8px;margin-bottom:.5rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
        <div><strong style="font-size:.9rem">${inv.name}</strong> <span class="badge ${statusBc}">${statusLb}</span></div>
        <div style="display:flex;gap:.3rem;align-items:center">
          <span class="mono" style="font-size:.85rem;color:var(--gold)">$${inv.spent.toLocaleString()} / $${inv.budget.toLocaleString()}</span>
          ${inv.status!=='done'?`<button class="btn btn-sm btn-outline" onclick="modalFundProject(${idx})" title="Débloquer des fonds">💰</button>`:''}
          <button class="btn btn-sm btn-red" onclick="confirmDel('Supprimer ce projet ?',function(){DB.govBudget.investments.splice(${idx},1);toast('Projet supprimé');goGov('gbudget')})" style="padding:.2rem .4rem">✕</button>
        </div>
      </div>
      <p style="font-size:.8rem;color:var(--t2)">${inv.desc}</p>
      <div style="margin-top:.4rem;display:flex;align-items:center;gap:.5rem">
        <div style="flex:1;height:8px;background:var(--bg);border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${inv.status==='done'?'var(--green)':'var(--blue)'};border-radius:4px;transition:width .4s"></div></div>
        <span class="mono" style="font-size:.75rem;color:var(--t2)">${pct}%</span>
      </div>
    </div>`;
  });
  h += '</div>';

  // Adjust balance
  h += `<div class="card"><div class="card-t">💰 Ajuster le Solde Manuellement</div>
    <div class="row" style="align-items:flex-end"><div class="fg" style="margin:0"><label>Solde actuel ($)</label><input type="number" id="budBal" value="${b.balance}"></div><div><button class="btn btn-sm btn-blue" onclick="DB.govBudget.balance=parseInt(document.getElementById('budBal').value)||0;toast('Solde mis à jour');goGov('gbudget')">Appliquer</button></div></div></div>`;
  return h;
}

function modalAddBudgetItem(type) {
  const isIncome = type === 'income';
  const typeOpts = isIncome
    ? '<option>Impôts entreprises</option><option>TVA collectée</option><option>Amendes</option><option>Licences</option><option>Autre</option>'
    : '<option>Subvention</option><option>Salaires fonctionnaires</option><option>Infrastructure</option><option>Sécurité</option><option>Santé</option><option>Éducation</option><option>Autre</option>';
  modal(`<div class="modal-t">${isIncome?'📈 Ajouter une Recette':'📉 Ajouter une Dépense'}</div>
    <div class="row"><div class="fg"><label>Type</label><select id="biType">${typeOpts}</select></div><div class="fg"><label>Montant ($)</label><input type="number" id="biAmt" placeholder="0"></div></div>
    <div class="fg"><label>Description</label><input id="biDesc" placeholder="Détail..."></div>
    ${!isIncome?'<div class="fg"><label>Bénéficiaire (optionnel)</label><input id="biBenef" placeholder="Ex: EMS Los Santos"></div>':''}
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm ${isIncome?'btn-green':'btn-red'}" onclick="const a=parseInt(document.getElementById('biAmt').value);if(!a){err('Montant requis');return}const item={id:Date.now(),type:document.getElementById('biType').value,amount:a,desc:document.getElementById('biDesc').value||'—',date:new Date().toLocaleDateString('fr-FR')};${isIncome?'DB.govBudget.income.push(item);DB.govBudget.balance+=a':'item.beneficiary=document.getElementById(\"biBenef\")?.value||\"\";DB.govBudget.expenses.push(item);DB.govBudget.balance-=a'};closeModal();toast('${isIncome?'Recette':'Dépense'} enregistrée');goGov('gbudget')">Enregistrer</button></div>`);
}

function modalAddInvestment() {
  modal(`<div class="modal-t">🏗️ Nouveau Projet d'Investissement</div>
    <div class="fg"><label>Nom du projet</label><input id="invName" placeholder="Ex: Construction hôpital"></div>
    <div class="row"><div class="fg"><label>Budget total ($)</label><input type="number" id="invBudget" placeholder="0"></div><div class="fg"><label>Statut initial</label><select id="invStatus"><option value="planned">Planifié</option><option value="active">En cours</option></select></div></div>
    <div class="fg"><label>Description</label><textarea id="invDesc" placeholder="Détail du projet..."></textarea></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="const n=document.getElementById('invName').value;if(!n){err('Nom requis');return}DB.govBudget.investments.push({id:Date.now(),name:n,budget:parseInt(document.getElementById('invBudget').value)||0,spent:0,status:document.getElementById('invStatus').value,desc:document.getElementById('invDesc').value||'—'});closeModal();toast('Projet créé');goGov('gbudget')">Créer</button></div>`);
}

function modalFundProject(idx) {
  const inv = DB.govBudget.investments[idx];
  const remaining = inv.budget - inv.spent;
  modal(`<div class="modal-t">💰 Débloquer des Fonds — ${inv.name}</div>
    <div style="padding:.5rem .7rem;background:var(--input);border-radius:6px;margin-bottom:.8rem;font-size:.85rem">Budget: <strong class="mono">$${inv.budget.toLocaleString()}</strong> — Dépensé: <strong class="mono" style="color:var(--blue)">$${inv.spent.toLocaleString()}</strong> — Restant: <strong class="mono" style="color:var(--green)">$${remaining.toLocaleString()}</strong></div>
    <div class="fg"><label>Montant à débloquer ($)</label><input type="number" id="fundAmt" value="${remaining}" max="${remaining}"></div>
    <div class="fg"><label style="display:flex;align-items:center;gap:.4rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="fundDone"> Marquer comme terminé</label></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="const a=parseInt(document.getElementById('fundAmt').value)||0;const inv=DB.govBudget.investments[${idx}];inv.spent+=a;DB.govBudget.balance-=a;if(document.getElementById('fundDone').checked)inv.status='done';closeModal();toast('$'+a.toLocaleString()+' débloqués');goGov('gbudget')">Débloquer</button></div>`);
}

// ============ GOV: DECRETS ============
function gDecree() {
  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">📜 Décrets & Annonces</h1></div>`;
  h += `<div class="card"><div class="card-t">📝 Publier un Décret</div>
    <div class="row"><div class="fg"><label>Code</label><input id="dcCode" placeholder="DEC-2026-XX"></div><div class="fg"><label>Titre</label><input id="dcTitle" placeholder="Intitulé du décret"></div></div>
    <div class="fg"><label>Contenu</label><textarea id="dcBody" rows="4" placeholder="Texte complet du décret..."></textarea></div>
    <button class="btn btn-gold" onclick="const c=document.getElementById('dcCode').value||'DEC-2026-'+(DB.decrees.length+1),t=document.getElementById('dcTitle').value||'Nouveau Décret';DB.decrees.unshift({id:DB.decrees.length+1,code:c,title:t,body:document.getElementById('dcBody').value||'—',date:new Date().toLocaleDateString('fr-FR'),author:DB.govUser.name});document.getElementById('dcCode').value='';document.getElementById('dcTitle').value='';document.getElementById('dcBody').value='';toast('Décret «'+t+'» publié');goGov('gdecree')">📤 Publier le Décret</button></div>`;
  h += `<div class="card"><div class="card-t">📋 Décrets Publiés</div>`;
  DB.decrees.forEach((d,i) => {
    h += `<div style="padding:.7rem 0;border-bottom:1px solid rgba(30,41,59,.3)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><span class="mono" style="color:var(--gold);font-size:.82rem">${d.code}</span> <strong style="font-size:.9rem">${d.title}</strong></div>
        <div style="display:flex;gap:.3rem;align-items:center"><span style="font-size:.7rem;color:var(--t3)">${d.date}</span><button class="btn btn-sm btn-red" onclick="DB.decrees.splice(${i},1);toast('Décret supprimé');goGov('gdecree')" style="padding:.2rem .4rem">✕</button></div>
      </div>
      <p style="font-size:.82rem;color:var(--t2);margin-top:.2rem">${d.body}</p>
      <div style="font-size:.7rem;color:var(--t3);margin-top:.15rem">Par: ${d.author}</div></div>`;
  });
  h += '</div>';
  return h;
}

// ============ GOV: CODES & LOIS ============
function gCodes() {
  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">📚 Gestion des Codes & Lois</h1><p style="color:var(--t2);font-size:.82rem">Modifier les articles visibles par tous les citoyens</p></div>`;

  DB.legalCodes.forEach((code, ci) => {
    h += `<div class="card" style="border-left:3px solid ${code.color}">
      <div class="card-t" style="justify-content:space-between">
        <span>${code.icon} ${code.name} <span class="badge b-blue">${code.articles.length} articles</span></span>
        <button class="btn btn-sm btn-blue" onclick="modalAddArticle('${code.id}')">+ Article</button>
      </div>
      <table><thead><tr><th>Réf.</th><th>Titre</th><th>Description</th><th>Sanction</th><th>Actions</th></tr></thead><tbody>`;
    code.articles.forEach((a, ai) => {
      h += `<tr>
        <td class="mono" style="font-size:.75rem;color:${code.color}">${a.ref}</td>
        <td style="font-weight:600;font-size:.84rem">${a.title}</td>
        <td style="font-size:.8rem;color:var(--t2);max-width:250px">${a.desc.substring(0,80)}${a.desc.length>80?'...':''}</td>
        <td style="font-size:.78rem">${a.sanction.substring(0,40)}${a.sanction.length>40?'...':''}</td>
        <td><div style="display:flex;gap:.2rem">
          <button class="btn btn-sm btn-outline" onclick="modalEditArticle('${code.id}',${ai})">✏️</button>
          <button class="btn btn-sm btn-red" onclick="confirmDel('Supprimer '+'${a.ref}'+' ?',function(){DB.legalCodes[${ci}].articles.splice(${ai},1);toast('Article supprimé');goGov('gcodes')})" style="padding:.2rem .4rem">✕</button>
        </div></td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  });

  h += `<div class="card"><div class="card-t">➕ Créer un Nouveau Code</div>
    <div class="row"><div class="fg"><label>Nom du code</label><input id="ncName" placeholder="Ex: Code Maritime"></div><div class="fg"><label>Icône</label><input id="ncIcon" placeholder="⚓" style="width:60px"></div><div class="fg"><label>Couleur</label><select id="ncColor"><option value="var(--red)">Rouge</option><option value="var(--blue)">Bleu</option><option value="var(--gold)">Or</option><option value="var(--green)">Vert</option><option value="var(--purple)">Violet</option><option value="var(--orange)">Orange</option><option value="var(--cyan)">Cyan</option></select></div></div>
    <button class="btn btn-sm btn-green" onclick="const n=document.getElementById('ncName').value;if(!n){err('Nom requis');return}DB.legalCodes.push({id:n.toLowerCase().replace(/\\s+/g,'_'),name:n,icon:document.getElementById('ncIcon').value||'📋',color:document.getElementById('ncColor').value,articles:[]});toast(n+' créé');goGov('gcodes')">Créer le Code</button>
  </div>`;
  return h;
}

function modalAddArticle(codeId) {
  const code = DB.legalCodes.find(c=>c.id===codeId);
  const lastRef = code.articles.length ? code.articles[code.articles.length-1].ref : '';
  modal(`<div class="modal-t">${code.icon} Ajouter un Article — ${code.name}</div>
    <div class="fg"><label>Référence</label><input id="aaRef" placeholder="Ex: CP-701" value="${lastRef ? lastRef.split('-')[0]+'-'+(parseInt(lastRef.split('-')[1]||0)+1) : ''}"></div>
    <div class="fg"><label>Titre</label><input id="aaTitle" placeholder="Titre de l'article"></div>
    <div class="fg"><label>Description</label><textarea id="aaDesc" placeholder="Détail de l'article..."></textarea></div>
    <div class="fg"><label>Sanction applicable</label><input id="aaSanc" placeholder="Ex: Amende $5,000 + prison"></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="const c=DB.legalCodes.find(x=>x.id==='${codeId}');c.articles.push({ref:document.getElementById('aaRef').value||'ART-?',title:document.getElementById('aaTitle').value||'Nouvel article',desc:document.getElementById('aaDesc').value||'—',sanction:document.getElementById('aaSanc').value||'—'});closeModal();toast('Article ajouté');goGov('gcodes')">Ajouter</button></div>`);
}

function modalEditArticle(codeId, artIdx) {
  const code = DB.legalCodes.find(c=>c.id===codeId);
  const a = code.articles[artIdx];
  modal(`<div class="modal-t">${code.icon} Modifier — ${a.ref}</div>
    <div class="fg"><label>Référence</label><input id="eaRef" value="${a.ref}"></div>
    <div class="fg"><label>Titre</label><input id="eaTitle" value="${a.title}"></div>
    <div class="fg"><label>Description</label><textarea id="eaDesc">${a.desc}</textarea></div>
    <div class="fg"><label>Sanction</label><input id="eaSanc" value="${a.sanction}"></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="const c=DB.legalCodes.find(x=>x.id==='${codeId}');const art=c.articles[${artIdx}];art.ref=document.getElementById('eaRef').value;art.title=document.getElementById('eaTitle').value;art.desc=document.getElementById('eaDesc').value;art.sanction=document.getElementById('eaSanc').value;closeModal();toast('Article mis à jour');goGov('gcodes')">Sauvegarder</button></div>`);
}

// ============ GOV: DEFCON ============
function gDefcon() {
  const dc=['','var(--red)','var(--orange)','var(--gold)','var(--blue)','var(--green)'];
  const dl=['','MAXIMUM — Guerre Totale','SÉVÈRE — Menace Imminente','ÉLEVÉ — Alerte','GARDÉ — Surveillance','NORMAL — Paix'];
  // Editable protocols stored in DB
  if (!DB.defconProtos) DB.defconProtos = {5:['✅ Activités civiles normales','✅ Patrouilles de routine'],4:['⚠️ Patrouilles renforcées','⚠️ Contrôles ponctuels'],3:['🔶 Points de contrôle','🔶 Couvre-feu 23h-6h optionnel','⚠️ Rassemblements limités'],2:['🔴 Forces spéciales déployées','🔴 Couvre-feu 21h-7h','🔴 Rassemblements interdits'],1:['🚫 LOI MARTIALE','🚫 Circulation interdite','🔴 Armée déployée','🔴 Communications surveillées']};
  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">🚨 Niveau DEFCON</h1></div>`;
  h += `<div class="card" style="text-align:center">
    <div style="font-family:'Rajdhani',sans-serif;font-size:5rem;font-weight:700;color:${dc[DB.defcon]}">${DB.defcon}</div>
    <div style="color:${dc[DB.defcon]};font-size:1.1rem;font-weight:600">${dl[DB.defcon]}</div>
    <div class="defcon-grid">${[5,4,3,2,1].map(n=>`<div class="defcon-btn dc${n} ${DB.defcon===n?'sel':''}" onclick="changeDefcon(${n})">${n}</div>`).join('')}</div></div>`;

  // Current protocols with edit
  h += `<div class="card"><div class="card-t" style="justify-content:space-between">📋 Protocoles — Niveau ${DB.defcon} <button class="btn btn-sm btn-outline" onclick="modalEditProtos(${DB.defcon})">✏️ Modifier</button></div>`;
  (DB.defconProtos[DB.defcon]||[]).forEach(p => h += `<div style="padding:.4rem .7rem;background:var(--input);border-radius:6px;margin-bottom:.4rem;font-size:.84rem">${p}</div>`);
  h += '</div>';

  // All levels overview
  h += '<div class="card"><div class="card-t">📊 Vue des Protocoles par Niveau</div>';
  [5,4,3,2,1].forEach(n => {
    h += `<div style="margin-bottom:.6rem"><div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem"><span class="badge ${n>=4?'b-green':n>=3?'b-gold':'b-red'}">Niveau ${n}</span><span style="font-size:.78rem;color:var(--t2)">${dl[n]}</span><button class="btn btn-sm btn-outline" onclick="modalEditProtos(${n})" style="padding:.1rem .3rem;font-size:.65rem">✏️</button></div>`;
    (DB.defconProtos[n]||[]).forEach(p => h += `<div style="padding:.2rem .5rem;font-size:.78rem;color:var(--t2)">${p}</div>`);
    h += '</div>';
  });
  h += '</div>';

  // History — max 10
  h += `<div class="card"><div class="card-t">📜 Historique (10 derniers)</div><table><thead><tr><th>Date</th><th>De</th><th>À</th><th>Motif</th><th>Auteur</th></tr></thead><tbody>`;
  DB.defconLog.slice(0, 10).forEach(l => h += `<tr><td style="font-size:.8rem">${l.date}</td><td><span class="badge ${l.from>=4?'b-green':l.from>=3?'b-gold':'b-red'}">${l.from}</span></td><td><span class="badge ${l.to>=4?'b-green':l.to>=3?'b-gold':'b-red'}">${l.to}</span></td><td style="font-size:.82rem">${l.reason}</td><td style="font-size:.8rem">${l.author}</td></tr>`);
  h += '</tbody></table></div>';
  return h;
}
function modalEditProtos(level) {
  const protos = DB.defconProtos[level] || [];
  modal(`<div class="modal-t">✏️ Protocoles — Niveau ${level}</div>
    <div class="fg"><label>Protocoles (un par ligne)</label><textarea id="protoEdit" rows="8" style="font-size:.85rem">${protos.join('\n')}</textarea></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="DB.defconProtos[${level}]=document.getElementById('protoEdit').value.split('\\n').filter(function(l){return l.trim()});closeModal();toast('Protocoles niveau ${level} mis à jour');goGov('gdefcon')">Sauvegarder</button></div>`);
}
function changeDefcon(n) {
  if (n === DB.defcon) return;
  modal(`<div class="modal-t">🚨 Changement DEFCON → Niveau ${n}</div>
    <div style="text-align:center;font-size:3rem;font-weight:700;color:${['','var(--red)','var(--orange)','var(--gold)','var(--blue)','var(--green)'][n]};margin:.5rem 0">${n}</div>
    <div class="fg"><label>Motif du changement</label><textarea id="dcReason" rows="3" placeholder="Raison du changement de niveau DEFCON..."></textarea></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-red" onclick="doChangeDefcon(${n})">Confirmer</button></div>`);
}
function doChangeDefcon(n) {
  const reason = document.getElementById('dcReason').value.trim();
  if (!reason) { err('Motif obligatoire.'); return; }
  DB.defconLog.unshift({ date: new Date().toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}), from: DB.defcon, to: n, reason: reason, author: DB.govUser.name });
  if (DB.defconLog.length > 10) DB.defconLog.length = 10; // Max 10
  DB.defcon = n;
  closeModal();
  toast('DEFCON passé au niveau ' + n);
  goGov('gdefcon');
}

// ============ GOV: COFFRE-FORT ============
function gVault() {
  if (DB._vaultView) return gVaultDetail(DB._vaultView);
  // Upgrade old vault format
  DB.vault.forEach(function(d) { if (!d.notes) d.notes = ''; if (!d.pages) d.pages = []; });

  let h = `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
    <div><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">🔒 Coffre-Fort Sécurisé</h1><p style="color:var(--t2);font-size:.82rem">${DB.vault.length} dossiers classifiés</p></div>
    <button class="btn btn-sm btn-blue" onclick="modalAddDossier()">+ Nouveau Dossier</button>
  </div>`;
  h += `<div class="gov-warn">⚠️ Accès restreint — Tout accès est enregistré et audité</div>`;

  DB.vault.forEach(function(d,i) {
    const classColor = d.classification==='Secret Défense'?'b-red':d.classification==='Confidentiel'?'b-orange':'b-blue';
    const pageCount = d.pages ? d.pages.length : 0;
    h += `<div class="card" style="cursor:pointer;transition:border-color .15s" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='var(--border)'" onclick="DB._vaultView=${i};goGov('gvault')">
      <div style="display:flex;align-items:center;gap:.8rem">
        <div style="font-size:2rem">📂</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:.95rem">${d.name}</div>
          <div style="font-size:.78rem;color:var(--t2);margin-top:.1rem">${d.notes ? d.notes.substring(0,80) + (d.notes.length>80?'...':'') : 'Aucune description'}</div>
          <div style="font-size:.7rem;color:var(--t3);margin-top:.2rem">Créé le ${d.date} — ${pageCount} page${pageCount>1?'s':''}</div>
        </div>
        <span class="badge ${classColor}">${d.classification}</span>
        <button class="btn btn-sm btn-red" onclick="event.stopPropagation();DB.vault.splice(${i},1);toast('Dossier supprimé');goGov('gvault')" style="padding:.25rem .4rem">🗑️</button>
      </div>
    </div>`;
  });
  if (!DB.vault.length) h += '<div class="card" style="text-align:center;color:var(--t3);padding:2rem">Aucun dossier dans le coffre-fort.</div>';
  return h;
}

function gVaultDetail(idx) {
  const d = DB.vault[idx];
  if (!d) { DB._vaultView = null; return gVault(); }
  if (!d.pages) d.pages = [];
  const classColor = d.classification==='Secret Défense'?'b-red':d.classification==='Confidentiel'?'b-orange':'b-blue';

  // Read mode?
  if (DB._vaultRead !== undefined) {
    const page = d.pages[DB._vaultRead];
    if (!page) { DB._vaultRead = undefined; return gVaultDetail(idx); }
    let h = `<div style="margin-bottom:.8rem"><button class="btn btn-sm btn-outline" onclick="DB._vaultRead=undefined;goGov('gvault')">← Retour au dossier</button></div>`;
    h += `<div class="card" style="min-height:300px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:.8rem;border-bottom:1px solid var(--border)">
        <div><div style="font-weight:700;font-size:1.1rem">${page.title}</div><div style="font-size:.75rem;color:var(--t3)">Écrit par ${page.author} — ${page.date}</div></div>
        <span class="badge ${classColor}">${d.classification}</span>
      </div>
      <div style="font-size:.88rem;line-height:1.8;white-space:pre-wrap;color:var(--t1)">${page.content}</div>
    </div>`;
    return h;
  }

  let h = `<div style="margin-bottom:.8rem"><button class="btn btn-sm btn-outline" onclick="DB._vaultView=null;goGov('gvault')">← Retour</button></div>`;
  h += `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem">
    <div><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.4rem;font-weight:700">📂 ${d.name}</h1>
    <p style="color:var(--t2);font-size:.82rem"><span class="badge ${classColor}">${d.classification}</span> — Créé le ${d.date}</p></div>
    <button class="btn btn-sm btn-outline" onclick="modalEditDossier(${idx})">✏️ Modifier</button>
  </div>`;

  // Description
  if (d.notes) h += `<div class="card"><div class="card-t">📝 Description</div><p style="font-size:.88rem;line-height:1.6;white-space:pre-wrap">${d.notes}</p></div>`;

  // Pages
  h += `<div class="card"><div class="card-t" style="justify-content:space-between">📄 Pages du Dossier (${d.pages.length}) <button class="btn btn-sm btn-green" onclick="modalAddPage(${idx})">+ Ajouter une Page</button></div>`;
  if (!d.pages.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucune page. Ajoutez du contenu.</p>';
  d.pages.forEach(function(p, pi) {
    h += `<div style="display:flex;justify-content:space-between;align-items:center;padding:.5rem .7rem;background:var(--input);border-radius:7px;margin-bottom:.3rem">
      <div style="cursor:pointer;flex:1" onclick="DB._vaultRead=${pi};goGov('gvault')">
        <div style="font-weight:600;font-size:.88rem">📄 ${p.title}</div>
        <div style="font-size:.72rem;color:var(--t3)">${p.author} — ${p.date} — ${p.content.length} car.</div>
      </div>
      <div style="display:flex;gap:.2rem">
        <button class="btn btn-sm btn-blue" onclick="DB._vaultRead=${pi};goGov('gvault')" title="Lire">👁️</button>
        <button class="btn btn-sm btn-outline" onclick="modalEditPage(${idx},${pi})" title="Modifier">✏️</button>
        <button class="btn btn-sm btn-red" onclick="DB.vault[${idx}].pages.splice(${pi},1);toast('Page supprimée');goGov('gvault')" style="padding:.2rem .4rem">✕</button>
      </div>
    </div>`;
  });
  h += '</div>';
  return h;
}

function modalAddDossier() {
  modal(`<div class="modal-t">📂 Nouveau Dossier Classifié</div>
    <div class="fg"><label>Nom du dossier</label><input id="vdName" placeholder="Ex: Opération Tempête"></div>
    <div class="fg"><label>Description / Notes</label><textarea id="vdNotes" rows="3" placeholder="Description du contenu..."></textarea></div>
    <div class="fg"><label>Classification</label><select id="vdClass"><option>Restreint</option><option>Confidentiel</option><option>Secret Défense</option></select></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="const n=document.getElementById('vdName').value||'Nouveau Dossier';DB.vault.push({name:n,notes:document.getElementById('vdNotes').value||'',classification:document.getElementById('vdClass').value,date:new Date().toLocaleDateString('fr-FR'),pages:[]});closeModal();toast(n+' créé');goGov('gvault')">Créer</button></div>`);
}

function modalEditDossier(idx) {
  const d = DB.vault[idx];
  modal(`<div class="modal-t">✏️ Modifier — ${d.name}</div>
    <div class="fg"><label>Nom</label><input id="edName" value="${d.name}"></div>
    <div class="fg"><label>Description</label><textarea id="edNotes" rows="3">${d.notes||''}</textarea></div>
    <div class="fg"><label>Classification</label><select id="edClass"><option ${d.classification==='Restreint'?'selected':''}>Restreint</option><option ${d.classification==='Confidentiel'?'selected':''}>Confidentiel</option><option ${d.classification==='Secret Défense'?'selected':''}>Secret Défense</option></select></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="var dd=DB.vault[${idx}];dd.name=document.getElementById('edName').value;dd.notes=document.getElementById('edNotes').value;dd.classification=document.getElementById('edClass').value;closeModal();toast('Dossier mis à jour');goGov('gvault')">Sauvegarder</button></div>`);
}

function modalAddPage(dossierIdx) {
  modal(`<div class="modal-t">📄 Nouvelle Page</div>
    <div class="fg"><label>Titre</label><input id="vpTitle" placeholder="Ex: Rapport d'enquête #1"></div>
    <div class="fg"><label>Auteur</label><input id="vpAuthor" value="${DB.govUser?DB.govUser.name:''}"></div>
    <div class="fg"><label>Contenu</label><textarea id="vpContent" rows="10" placeholder="Rédigez le contenu du document..."></textarea></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="DB.vault[${dossierIdx}].pages.push({title:document.getElementById('vpTitle').value||'Page',author:document.getElementById('vpAuthor').value||'—',content:document.getElementById('vpContent').value||'',date:new Date().toLocaleDateString('fr-FR')});closeModal();toast('Page ajoutée');goGov('gvault')">Ajouter</button></div>`);
}

function modalEditPage(dossierIdx, pageIdx) {
  const p = DB.vault[dossierIdx].pages[pageIdx];
  modal(`<div class="modal-t">✏️ Modifier — ${p.title}</div>
    <div class="fg"><label>Titre</label><input id="epTitle" value="${p.title}"></div>
    <div class="fg"><label>Contenu</label><textarea id="epContent" rows="10">${p.content}</textarea></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="var pp=DB.vault[${dossierIdx}].pages[${pageIdx}];pp.title=document.getElementById('epTitle').value;pp.content=document.getElementById('epContent').value;closeModal();toast('Page mise à jour');goGov('gvault')">Sauvegarder</button></div>`);
}

// ============ GOV: VOTES / LOIS ============
function gVotes() {
  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">🗳️ Gestion des Votes & Élections</h1></div>`;

  // Create vote form
  h += `<div class="card"><div class="card-t">📝 Créer un Vote</div>
    <div class="fg"><label>Type de scrutin</label><select id="lvType" onchange="document.getElementById('lvChoicesBox').style.display=this.value==='multi'?'block':'none'">
      <option value="law">📜 Loi — Pour / Contre</option>
      <option value="multi">🗳️ Élection / Sondage — Choix multiples</option>
    </select></div>
    <div class="fg"><label>Titre</label><input id="lvTitle" placeholder="Ex: Élection du Gouverneur, Légalisation du..."></div>
    <div class="fg"><label>Description</label><textarea id="lvDesc" rows="3" placeholder="Détail de la proposition ou du scrutin..."></textarea></div>
    <div id="lvChoicesBox" style="display:none">
      <div class="fg"><label>Choix / Candidats (un par ligne)</label><textarea id="lvChoices" rows="5" placeholder="Jean Dupont\nMarie Martin\nAbstention\n..."></textarea></div>
    </div>
    <div class="fg"><label>Date limite</label><input id="lvDead" type="date"></div>
    <button class="btn btn-gold" onclick="createVote()">📤 Soumettre au Vote Citoyen</button></div>`;

  // List existing votes
  h += '<div class="card"><div class="card-t">📋 Votes en Cours & Passés</div>';
  if (!DB.laws.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucun vote créé.</p>';
  DB.laws.forEach(function(l,i) {
    const isMulti = l.choices && l.choices.length > 0;
    const totalVotes = isMulti ? l.choices.reduce(function(s,c){return s+(c.votes||0)},0) : (l.total||0);

    h += `<div style="padding:.7rem 0;border-bottom:1px solid rgba(30,41,59,.3)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="flex:1"><strong style="font-size:.9rem">${isMulti?'🗳️':'📜'} ${l.title}</strong> <span class="badge ${l.status==='open'?'b-green':'b-red'}">${l.status==='open'?'Ouvert':'Terminé'}</span>
        <span style="font-size:.72rem;color:var(--t3);margin-left:.5rem">${totalVotes} votes</span></div>
        <div style="display:flex;gap:.3rem">
          ${l.status==='open'?`<button class="btn btn-sm btn-outline" onclick="DB.laws[${i}].status='closed';toast('Vote fermé');goGov('gvotes')">Fermer</button>`:`<button class="btn btn-sm btn-outline" onclick="DB.laws[${i}].status='open';toast('Vote réouvert');goGov('gvotes')">Réouvrir</button>`}
          <button class="btn btn-sm btn-red" onclick="DB.laws.splice(${i},1);toast('Vote supprimé');goGov('gvotes')" style="padding:.25rem .4rem">✕</button>
        </div>
      </div>`;

    if (isMulti) {
      // Multi-choice results
      const colors = ['var(--gold)','var(--blue)','var(--green)','var(--purple)','var(--cyan)','var(--orange)','var(--red)'];
      l.choices.forEach(function(c, ci) {
        const pct = totalVotes > 0 ? Math.round((c.votes||0) / totalVotes * 100) : 0;
        h += `<div style="display:flex;align-items:center;gap:.5rem;margin:.2rem 0;font-size:.82rem">
          <span style="min-width:120px;color:${colors[ci%colors.length]}">${c.label}</span>
          <div style="flex:1;height:6px;background:var(--input);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${colors[ci%colors.length]};border-radius:3px"></div></div>
          <span style="font-size:.72rem;color:var(--t3);min-width:60px;text-align:right">${c.votes||0} (${pct}%)</span>
        </div>`;
      });
    } else {
      // Classic pour/contre
      h += `<div style="display:flex;align-items:center;gap:.5rem;margin:.4rem 0;font-size:.82rem">
        <span style="color:var(--green)">Pour ${l.pour||0}%</span>
        <div style="flex:1;height:6px;background:var(--input);border-radius:3px;overflow:hidden"><div style="height:100%;width:${l.pour||0}%;background:var(--green);border-radius:3px"></div></div>
        <span style="color:var(--red)">Contre ${l.contre||0}%</span>
      </div>`;
    }
    h += '</div>';
  });
  h += '</div>';
  return h;
}
function createVote() {
  var title = document.getElementById('lvTitle').value.trim();
  if (!title) { err('Titre requis.'); return; }
  var type = document.getElementById('lvType').value;
  var desc = document.getElementById('lvDesc').value.trim() || '—';
  var deadline = document.getElementById('lvDead').value || '—';

  if (type === 'multi') {
    // Multi-choice
    var choicesRaw = document.getElementById('lvChoices').value.trim();
    if (!choicesRaw) { err('Ajoutez au moins 2 choix.'); return; }
    var choicesList = choicesRaw.split('\n').map(function(c){return c.trim()}).filter(function(c){return c});
    if (choicesList.length < 2) { err('Il faut au moins 2 choix.'); return; }
    DB.laws.unshift({
      id: Date.now(), title: title, desc: desc, status: 'open', deadline: deadline,
      choices: choicesList.map(function(c){return {label:c, votes:0}}),
      pour:0, contre:0, total:0
    });
  } else {
    // Classic pour/contre
    DB.laws.unshift({
      id: Date.now(), title: title, desc: desc, status: 'open', deadline: deadline,
      pour: 0, contre: 0, total: 0, _pour: 0, _contre: 0
    });
  }
  document.getElementById('lvTitle').value = '';
  document.getElementById('lvDesc').value = '';
  document.getElementById('lvChoices').value = '';
  toast('Vote soumis aux citoyens');
  goGov('gvotes');
}

