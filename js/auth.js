// ============ AUTH ============
function genCitizenId() {
  let id;
  const existing = DB.citizens.map(c => c.id);
  do {
    const num = Math.floor(1000 + Math.random() * 9000); // 1000-9999
    id = 'SA-' + num;
  } while (existing.includes(id));
  return id;
}

function switchCitizenMode(mode) {
  document.querySelectorAll('.auth-subtab').forEach((t,i) => t.classList.toggle('on', (mode==='login'&&i===0)||(mode==='register'&&i===1)));
  document.getElementById('citizenLogin').style.display = mode==='login' ? 'block' : 'none';
  document.getElementById('citizenRegister').style.display = mode==='register' ? 'block' : 'none';
}

function doLogin() {
  const id = document.getElementById('lId').value.trim().toUpperCase();
  const pass = document.getElementById('lPass').value;
  if (!id || !pass) { err('Entrez votre identifiant et mot de passe.'); return; }
  const citizen = DB.citizens.find(c => c.id === id);
  if (!citizen) { err('Identifiant inconnu. Créez un compte si vous êtes nouveau.'); return; }
  if (citizen.pass !== pass) { err('Mot de passe incorrect.'); return; }
  loginAs(citizen);
}

function doRegister() {
  const name = document.getElementById('rName').value.trim();
  const phone = document.getElementById('rPhone').value.trim();
  const pass = document.getElementById('rPass').value;
  const pass2 = document.getElementById('rPass2').value;
  if (!name) { err('Entrez votre nom.'); return; }
  if (!pass || pass.length < 3) { err('Le mot de passe doit contenir au moins 3 caractères.'); return; }
  if (pass !== pass2) { err('Les mots de passe ne correspondent pas.'); return; }
  // Check duplicate name
  if (DB.citizens.find(c => c.name.toLowerCase() === name.toLowerCase())) { err('Ce nom est déjà pris. Utilisez la connexion si vous avez déjà un compte.'); return; }
  const citizen = { id: genCitizenId(), name, phone: phone || '555-0000', pass, registered: new Date().toLocaleDateString('fr-FR'), job: null, role: null };
  DB.citizens.push(citizen);
  saveDB();
  loginAs(citizen);
  // Show prominent modal with their ID
  setTimeout(() => {
    modal(`<div style="text-align:center;padding:.5rem 0">
      <div style="font-size:2.5rem;margin-bottom:.5rem">🎉</div>
      <div style="font-size:1.1rem;font-weight:700;margin-bottom:.3rem">Compte créé avec succès !</div>
      <div style="font-size:.85rem;color:var(--t2);margin-bottom:1rem">Voici votre identifiant citoyen :</div>
      <div style="font-family:'Rajdhani',monospace;font-size:2.5rem;font-weight:700;color:var(--gold);background:var(--input);border:2px solid var(--gold);border-radius:12px;padding:.5rem 1.5rem;display:inline-block;margin-bottom:.8rem">${citizen.id}</div>
      <div style="font-size:.78rem;color:var(--red);font-weight:600">⚠️ Notez-le ! Il vous servira à chaque connexion.</div>
      <div style="font-size:.72rem;color:var(--t3);margin-top:.3rem">Mot de passe: celui que vous avez choisi</div>
      <div style="margin-top:1rem"><button class="btn btn-gold" onclick="closeModal()">J'ai noté mon ID ✓</button></div>
    </div>`);
  }, 300);
}

function loginAs(citizen) {
  DB.user = { id: citizen.id, name: citizen.name, phone: citizen.phone };
  localStorage.setItem('sa_session', JSON.stringify({type:'citizen', id:citizen.id}));
  _notifCounts = {msg: DB.messages?DB.messages.length:0, ann: DB.announcements?DB.announcements.length:0, dec: DB.decrees?DB.decrees.length:0};
  loadJob();
  document.getElementById('auth').classList.add('hide');
  document.getElementById('app').classList.add('on');
  const ini = citizen.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  document.getElementById('sAv').textContent = ini;
  document.getElementById('sName').textContent = citizen.name;
  document.getElementById('sRole').textContent = citizen.id + (DB.job ? ' — ' + DB.job.icon + ' ' + DB.job.company : '');
  buildNav(); go('home');
}
function doLogout() {
  DB.user = null; DB.cart = []; DB.onDuty = false;
  DB._msgOpen = null; DB._msgView = null; DB._msgReplyTo = null;
  DB._chatView = null; DB._chatReplyTo = undefined; DB._comptaTab = null;
  DB._patientView = null;
  localStorage.removeItem('sa_session');
  document.getElementById('app').classList.remove('on');
  document.getElementById('auth').classList.remove('hide');
}

// ============ NAV ============
function isMyMessage(m) {
  if (!DB.user) return false;
  var myId = DB.user.id;
  if (m.fromId === myId) return true;
  if (m.toId === myId) return true;
  var myCit = DB.citizens.find(function(c){return c.id===myId});
  var myJob = myCit ? myCit.job : '';
  if (myJob && m.toEnterprise === myJob) return true;
  return false;
}
function isMessageForMe(m) {
  // Message addressed TO me (not sent BY me)
  if (!DB.user) return false;
  var myId = DB.user.id;
  if (m.fromId === myId) return false; // I sent it
  if (m.toId === myId) return true;
  var myCit = DB.citizens.find(function(c){return c.id===myId});
  var myJob = myCit ? myCit.job : '';
  if (myJob && m.toEnterprise === myJob) return true;
  return false;
}
function countMyUnread() {
  if (!DB.user || !DB.messages) return 0;
  return DB.messages.filter(function(m) { return !m.read && isMessageForMe(m); }).length;
}
function buildNav() {
  const n = document.getElementById('sNav'); n.innerHTML = '';
  const items = [
    { s:'Espace Citoyen' },
    { id:'home', ico:'🏠', label:'Mon Espace' },
    { id:'salaires', ico:'💰', label:'Mes Salaires' },
    { id:'health', ico:'🏥', label:'Carnet de Santé' },
    { id:'msg', ico:'✉️', label:'Messages', badge: countMyUnread() },
    { id:'jobs', ico:'💼', label:'Offres d\'Emploi' },
    { id:'vote', ico:'🗳️', label:'Voter les Lois' },
  ];
  if (DB.job) {
    items.push({ s:'Espace Travail — ' + DB.job.icon });
    items.push({ id:'wdash', ico:'📊', label:'Mon Poste' });
    const myGrade = DB.job.grades[DB.job.gradeIndex];
    if (myGrade.canPOS) items.push({ id:'wpos', ico:'🧾', label:'Caisse' });
    items.push({ id:'wpay', ico:'💰', label:'Mon Salaire' });
    items.push({ id:'wfrais', ico:'⛽', label:'Mes Frais Pro' });
    items.push({ id:'wchat', ico:'💬', label:'Discussion Interne', badge: DB.job.internalMessages.filter(m => (m.to==='all'||m.to===DB.user.id) && m.from!==DB.user.id).length || null });
    if (myGrade.canStock) items.push({ id:'wstock', ico:'📦', label:'Stock' });
    if (myGrade.canPatients) items.push({ id:'wpatients', ico:'🩺', label:'Dossiers Patients' });
    if (myGrade.canManage) {
      items.push({ s:'Gestion Entreprise' });
      items.push({ id:'wteam', ico:'👥', label:'Équipe' });
      items.push({ id:'wservice', ico:'📋', label:'Relevé de Service' });
      items.push({ id:'whr', ico:'⚖️', label:'Primes & Sanctions' });
      items.push({ id:'wcompta', ico:'📒', label:'Comptabilité' });
      if (myGrade.canArticles) items.push({ id:'warticles', ico:'🏷️', label:'Articles Caisse' });
      items.push({ id:'wgrades', ico:'⚙️', label:'Grades' });
      items.push({ id:'winfo', ico:'🏦', label:'Infos Entreprise' });
      if (myGrade.canHire) items.push({ id:'wapps', ico:'📨', label:'Candidatures', badge: DB.job.pendingApps.length });
    }
  } else {
    items.push({ lock: true });
  }
  items.forEach(i => {
    if (i.s) { const d=document.createElement('div'); d.className='nav-sec'; d.textContent=i.s; n.appendChild(d); }
    else if (i.lock) { const d=document.createElement('div'); d.className='side-lock'; d.innerHTML='🔒 Espace Travail<br><span style="font-size:.68rem">Pas encore embauché</span>'; n.appendChild(d); }
    else { const d=document.createElement('div'); d.className='nav-i'; d.dataset.p=i.id; d.onclick=()=>go(i.id); d.innerHTML=`<span class="ico">${i.ico}</span><span>${i.label}</span>`; if(i.badge)d.innerHTML+=`<span class="nbadge">${i.badge}</span>`; n.appendChild(d); }
  });
}

function go(p) {
  saveDB();
  DB.currentPage = p;
  document.querySelectorAll('.nav-i').forEach(el=>el.classList.toggle('on',el.dataset.p===p));
  const c=document.getElementById('page');
  const T={home:'Mon Espace',salaires:'Mes Salaires',health:'Carnet de Santé',msg:'Messagerie',jobs:'Offres d\'Emploi',vote:'Voter les Lois',wdash:'Mon Poste',wpos:'Caisse Enregistreuse',wpay:'Mon Salaire',wfrais:'Mes Frais Pro',wchat:'Discussion Interne',wstock:'Gestion du Stock',wpatients:'Dossiers Patients',warticles:'Articles de la Caisse',wteam:'Gestion d\'Équipe',wservice:'Relevé de Service',whr:'Primes & Sanctions',wcompta:'Comptabilité',wgrades:'Configuration des Grades',winfo:'Infos Entreprise',wapps:'Candidatures Reçues'};
  // Handle code pages
  if (p.startsWith('code_')) {
    const codeId = p.replace('code_','');
    const code = DB.legalCodes.find(x=>x.id===codeId);
    document.getElementById('topTitle').textContent = code ? code.name : p;
    c.innerHTML = code ? pCodeView(code) : '';
  } else {
    document.getElementById('topTitle').textContent=T[p]||p;
    const R={home:pHome,salaires:pSalaires,health:pHealth,msg:pMsg,jobs:pJobs,vote:pVote,wdash:pWDash,wpos:pWPos,wpay:pWPay,wfrais:pWFrais,wchat:pWChat,wstock:pWStock,wpatients:pWPatients,warticles:pWArticles,wteam:pWTeam,wservice:pWService,whr:pWHR,wcompta:pWCompta,wgrades:pWGrades,winfo:pWInfo,wapps:pWApps};
    c.innerHTML=(R[p]||(()=>''))();
  }
  closeSide();
}
function toggleSide(){document.getElementById('side').classList.toggle('open');document.getElementById('ov').classList.toggle('on')}
function closeSide(){document.getElementById('side').classList.remove('open');document.getElementById('ov').classList.remove('on')}
function toast(m,type){const t=document.createElement('div');t.className='toast toast-'+( type||'ok');const ico=type==='err'?'❌':type==='warn'?'⚠️':'✅';t.innerHTML=ico+' '+m;document.body.appendChild(t);setTimeout(()=>t.remove(),3500)}
function err(m){toast(m,'err')}
function confirmAction(msg, onYes) {
  modal(`<div class="modal-t">⚠️ Confirmation</div>
    <p style="font-size:.88rem;color:var(--t2);margin-bottom:1rem">${msg}</p>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-red" onclick="closeModal();(${onYes})()">Confirmer</button></div>`);
}
function confirmDel(msg, fn) {
  window._pendingDel = fn;
  modal(`<div class="modal-t">🗑️ Suppression</div>
    <p style="font-size:.88rem;color:var(--t2);margin-bottom:1rem">${msg}</p>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-red" onclick="closeModal();window._pendingDel()">Supprimer</button></div>`);
}
function modal(html){const o=document.createElement('div');o.className='modal-bg';o.onclick=e=>{if(e.target===o)o.remove()};o.innerHTML=`<div class="modal">${html}</div>`;document.body.appendChild(o)}
function closeModal(){document.querySelector('.modal-bg')?.remove()}

