// ============ HOME ============
function pHome() {
  const u = DB.user;
  const dc=['','#ef4444','#f97316','#f0b429','#3b82f6','#22c55e'];
  const dl=['','GUERRE TOTALE','MENACE SÉVÈRE','ALERTE ÉLEVÉE','SURVEILLANCE','PAIX'];
  const dcBg=['','rgba(239,68,68,.12)','rgba(249,115,22,.12)','rgba(240,180,41,.12)','rgba(59,130,246,.08)','rgba(34,197,94,.08)'];

  let h = '';

  // DEFCON BANNER
  h += `<div class="card" style="border-color:${dc[DB.defcon]};background:${dcBg[DB.defcon]};display:flex;align-items:center;gap:1rem;margin-bottom:.8rem">
    <div style="font-family:'Rajdhani',sans-serif;font-size:2.5rem;font-weight:700;color:${dc[DB.defcon]};line-height:1">${DB.defcon}</div>
    <div><div style="font-size:.68rem;color:var(--t3);text-transform:uppercase;letter-spacing:1px">Niveau DEFCON</div>
    <div style="font-weight:700;color:${dc[DB.defcon]};font-size:.95rem">${dl[DB.defcon]}</div></div>
  </div>`;

  // HEADER + ID CARD
  h += `<div style="display:flex;gap:.8rem;margin-bottom:.8rem;flex-wrap:wrap">
    <div class="card" style="flex:1;min-width:200px;margin:0;display:flex;align-items:center;gap:.8rem;border-color:rgba(240,180,41,.2)">
      <div style="font-size:1.8rem">🪪</div>
      <div style="flex:1"><div style="font-size:.68rem;color:var(--t3);text-transform:uppercase;letter-spacing:1px">Mon Identifiant</div>
      <div class="mono" style="font-size:1.3rem;font-weight:700;color:var(--gold)">${u.id}</div>
      <div style="font-size:.7rem;color:var(--t2)">${u.name} — ${u.phone}</div></div>
      <button class="btn btn-sm btn-outline" onclick="modalEditProfile()" title="Modifier mon profil" style="padding:.3rem .5rem">✏️</button>
    </div>
    <div class="stat" style="min-width:120px;margin:0">${DB.job?`<div class="stat-l">Mon emploi</div><div class="stat-v" style="font-size:1rem;color:var(--green)">${DB.job.icon} ${DB.job.role}</div><div class="stat-s">${DB.job.company}</div>`:`<div class="stat-l">Emploi</div><div class="stat-v" style="font-size:1rem;color:var(--t3)">Aucun</div><div class="stat-s"><a href="#" onclick="go('jobs');return false" style="color:var(--gold)">Voir les offres →</a></div>`}</div>
  </div>`;

  // STATS
  h += `<div class="stats">
    <div class="stat"><div class="stat-l">Messages</div><div class="stat-v" style="color:var(--blue)">${countMyUnread()}</div><div class="stat-s">Non lus</div></div>
    <div class="stat"><div class="stat-l">Votes ouverts</div><div class="stat-v" style="color:var(--purple)">${DB.laws.filter(l=>l.status==='open'&&!DB.voted[l.id]).length}</div><div class="stat-s">En attente</div></div>
    <div class="stat"><div class="stat-l">Santé</div><div class="stat-v" style="font-size:1rem;color:var(--green)">🟢 Stable</div><div class="stat-s">${(DB.healthRecords[DB.user.id]?.history||[])[0]?.date||'Aucun soin'}</div></div>
  </div>`;

  // LATEST DECREES / ANNOUNCEMENTS
  h += `<div class="card"><div class="card-t">📢 Dernières Annonces de l'État</div>`;
  if (!DB.decrees.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucune annonce pour le moment.</p>';
  DB.decrees.slice(0,4).forEach(d => {
    h += `<div style="padding:.55rem 0;border-bottom:1px solid rgba(30,41,59,.3)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><span class="mono" style="font-size:.75rem;color:var(--gold)">${d.code}</span> <strong style="font-size:.88rem">${d.title}</strong></div>
        <span style="font-size:.68rem;color:var(--t3)">${d.date}</span>
      </div>
      <p style="font-size:.8rem;color:var(--t2);margin-top:.15rem">${d.body}</p>
    </div>`;
  });
  h += '</div>';

  // ANNOUNCEMENTS / EVENTS BOARD
  if (DB.announcements && DB.announcements.length) {
    h += `<div class="card"><div class="card-t">📣 Annonces & Événements</div>`;
    DB.announcements.slice(0,6).forEach(function(a) {
      const isPoll = a.poll && a.poll.length > 0;
      const myVote = a.votes ? a.votes[DB.user.id] : null;
      const totalPollVotes = isPoll ? a.poll.reduce(function(s,p){return s+(p.count||0)},0) : 0;
      h += `<div style="padding:.6rem 0;border-bottom:1px solid rgba(30,41,59,.3)">
        <div style="display:flex;gap:.5rem;align-items:flex-start">
          <span style="font-size:1.1rem">${a.icon||'📣'}</span>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:600;font-size:.9rem">${a.title}</span>
              <span style="font-size:.68rem;color:var(--t3)">${a.date} — ${a.company}</span>
            </div>
            <p style="font-size:.82rem;color:var(--t2);margin-top:.15rem">${a.body}</p>`;
      // Poll
      if (isPoll) {
        a.poll.forEach(function(opt, oi) {
          const pct = totalPollVotes > 0 ? Math.round((opt.count||0)/totalPollVotes*100) : 0;
          const voted = myVote === opt.label;
          h += `<div style="margin-top:.3rem">
            <div style="display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:.1rem">
              <span style="color:${voted?'var(--gold)':'var(--t2)'};font-weight:${voted?'600':'400'}">${voted?'✓ ':''}${opt.label}</span>
              <span style="color:var(--t3)">${opt.count||0} (${pct}%)</span>
            </div>
            <div style="height:5px;background:var(--input);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${voted?'var(--gold)':'var(--blue)'};border-radius:3px"></div></div>
          </div>`;
        });
        if (!myVote) {
          h += `<div style="display:flex;flex-wrap:wrap;gap:.2rem;margin-top:.4rem">`;
          a.poll.forEach(function(opt) {
            h += `<button class="btn btn-sm btn-outline" style="font-size:.72rem;padding:.15rem .4rem" onclick="voteAnnouncement(${a.id},'${opt.label.replace(/'/g,"\\\\'")}')">${opt.label}</button>`;
          });
          h += '</div>';
        }
      }
      h += '</div></div></div>';
    });
    h += '</div>';
  }

  // LEGAL CODES — clickable cards
  h += `<div class="card"><div class="card-t">📚 Codes & Législation</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.6rem">`;
  DB.legalCodes.forEach(code => {
    h += `<div style="background:var(--input);border:1px solid var(--border);border-radius:8px;padding:.8rem;cursor:pointer;transition:all .15s;border-left:3px solid ${code.color}" onclick="go('code_${code.id}')" onmouseover="this.style.borderColor='${code.color}'" onmouseout="this.style.borderColor='var(--border)';this.style.borderLeftColor='${code.color}'">
      <div style="font-size:1.3rem;margin-bottom:.3rem">${code.icon}</div>
      <div style="font-weight:600;font-size:.9rem">${code.name}</div>
      <div style="font-size:.72rem;color:var(--t3);margin-top:.15rem">${code.articles.length} articles</div>
    </div>`;
  });
  h += '</div></div>';

  // QUICK ACTIONS
  h += `<div class="card"><div class="card-t">⚡ Accès rapide</div>
    <div style="display:flex;flex-wrap:wrap;gap:.4rem">
      <button class="btn btn-sm btn-blue" onclick="go('health')">🏥 Carnet de santé</button>
      <button class="btn btn-sm btn-outline" onclick="go('msg')">✉️ Messages</button>
      <button class="btn btn-sm btn-outline" onclick="go('vote')">🗳️ Voter</button>
      <button class="btn btn-sm btn-outline" onclick="go('jobs')">💼 Offres</button>
      ${DB.job?`<button class="btn btn-sm btn-gold" onclick="go('wdash')">${DB.job.icon} Mon poste</button>`:''}
    </div></div>`;

  return h;
}

// ============ MES SALAIRES (citizen — persiste après licenciement) ============
function voteAnnouncement(annId, choice) {
  var a = DB.announcements.find(function(x){return x.id===annId});
  if (!a || !a.poll) return;
  if (!a.votes) a.votes = {};
  if (a.votes[DB.user.id]) { err('Vous avez déjà voté.'); return; }
  a.votes[DB.user.id] = choice;
  var opt = a.poll.find(function(p){return p.label===choice});
  if (opt) opt.count = (opt.count||0) + 1;
  toast('Vote enregistré');
  go('home');
}
function modalPostAnnouncement() {
  if (!DB.job) return;
  modal(`<div class="modal-t">📣 Publier une Annonce</div>
    <div style="padding:.4rem .7rem;background:var(--input);border-radius:6px;margin-bottom:.8rem;font-size:.83rem">${DB.job.icon} ${DB.job.company}</div>
    <div class="fg"><label>Titre</label><input id="anTitle" placeholder="Ex: Soirée d'ouverture, Happy Hour..."></div>
    <div class="fg"><label>Message</label><textarea id="anBody" rows="3" placeholder="Détail de l'annonce..."></textarea></div>
    <div class="fg"><label>Sondage (optionnel — un choix par ligne, laisser vide si pas de sondage)</label><textarea id="anPoll" rows="3" placeholder="Option 1\nOption 2\nOption 3"></textarea></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="publishAnnouncement()">Publier</button></div>`);
}
function publishAnnouncement() {
  var title = document.getElementById('anTitle').value.trim();
  if (!title) { err('Titre requis.'); return; }
  var body = document.getElementById('anBody').value.trim() || '';
  var pollRaw = document.getElementById('anPoll').value.trim();
  var poll = [];
  if (pollRaw) {
    poll = pollRaw.split('\n').map(function(l){return l.trim()}).filter(function(l){return l}).map(function(l){return {label:l,count:0}});
  }
  if (!DB.announcements) DB.announcements = [];
  DB.announcements.unshift({
    id: Date.now(), title: title, body: body, icon: DB.job.icon,
    company: DB.job.company, author: DB.user.name, date: new Date().toLocaleDateString('fr-FR'),
    poll: poll, votes: {}
  });
  // Max 20 announcements
  if (DB.announcements.length > 20) DB.announcements.length = 20;
  closeModal(); toast('Annonce publiée'); go('wdash');
}

function modalEditProfile() {
  const u = DB.user;
  const cit = DB.citizens.find(function(c){return c.id===u.id});
  if (!cit) return;
  modal(`<div class="modal-t">✏️ Modifier mon Profil</div>
    <div style="text-align:center;margin-bottom:.8rem"><span class="mono" style="font-size:1.1rem;font-weight:700;color:var(--gold)">${u.id}</span></div>
    <div class="fg"><label>Nom & Prénom</label><input id="epName" value="${cit.name}"></div>
    <div class="fg"><label>Numéro de téléphone</label><input id="epPhone" value="${cit.phone}" placeholder="555-XXXX"></div>
    <div class="fg"><label>Changer le mot de passe (laisser vide pour ne pas changer)</label><input id="epPass" type="password" placeholder="Nouveau mot de passe"></div>
    <div class="fg"><label>Confirmer le mot de passe</label><input id="epPass2" type="password" placeholder="Confirmer"></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="saveProfile()">Sauvegarder</button></div>`);
}
function saveProfile() {
  const cit = DB.citizens.find(function(c){return c.id===DB.user.id});
  if (!cit) return;
  const name = document.getElementById('epName').value.trim();
  const phone = document.getElementById('epPhone').value.trim();
  const pass = document.getElementById('epPass').value;
  const pass2 = document.getElementById('epPass2').value;
  if (!name) { err('Le nom est obligatoire.'); return; }
  if (pass && pass.length < 3) { err('Le mot de passe doit faire au moins 3 caractères.'); return; }
  if (pass && pass !== pass2) { err('Les mots de passe ne correspondent pas.'); return; }
  // Update citizen record
  const oldName = cit.name;
  cit.name = name;
  cit.phone = phone || cit.phone;
  if (pass) cit.pass = pass;
  // Update user session
  DB.user.name = name;
  DB.user.phone = phone || DB.user.phone;
  // Update employee records if employed
  if (DB.job) {
    var emp = DB.job.employees.find(function(e){return e.id===DB.user.id});
    if (emp) { emp.name = name; emp.phone = phone || emp.phone; }
  }
  // Update enterprise patron name if patron
  if (cit.role === 'Patron') {
    var ent = DB.enterprises.find(function(e){return e.patronId===DB.user.id});
    if (ent) ent.patron = name;
  }
  // Update sidebar
  var ini = name.split(' ').map(function(w){return w[0]}).join('').substring(0,2).toUpperCase();
  document.getElementById('sAv').textContent = ini;
  document.getElementById('sName').textContent = name;
  closeModal();
  toast('Profil mis à jour');
  go('home');
}

function pSalaires() {
  const myId = DB.user.id;
  const records = DB.citizenSalaries[myId] || [];
  const citizen = DB.citizens.find(c => c.id === myId);
  const currentJob = citizen ? citizen.job : null;

  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">💰 Mes Salaires</h1><p style="color:var(--t2);font-size:.82rem">Historique complet — accessible même après un licenciement</p></div>`;

  if (!records.length) {
    h += `<div class="card" style="text-align:center;padding:2rem">
      <div style="font-size:2.5rem;margin-bottom:.5rem">📭</div>
      <div style="font-size:.95rem;color:var(--t2)">Aucun salaire enregistré pour le moment</div>
      <div style="font-size:.82rem;color:var(--t3);margin-top:.3rem">${currentJob ? 'Vos salaires apparaîtront ici à la fin de chaque semaine.' : 'Trouvez un emploi pour commencer à percevoir un salaire.'}</div>
    </div>`;
    return h;
  }

  // Stats
  const totalEarned = records.reduce((s, r) => s + r.total, 0);
  const totalInvoiced = records.reduce((s, r) => s + r.invoiced, 0);
  const companies = [...new Set(records.map(r => r.company))];
  const avgWeek = Math.round(totalEarned / records.length);

  h += `<div class="stats">
    <div class="stat"><div class="stat-l">Total Perçu</div><div class="stat-v" style="color:var(--green)">$${totalEarned.toLocaleString()}</div><div class="stat-s">${records.length} semaines</div></div>
    <div class="stat"><div class="stat-l">Moyenne / Sem.</div><div class="stat-v" style="color:var(--blue)">$${avgWeek.toLocaleString()}</div></div>
    <div class="stat"><div class="stat-l">Total Facturé</div><div class="stat-v" style="color:var(--cyan)">$${totalInvoiced.toLocaleString()}</div></div>
    <div class="stat"><div class="stat-l">Employeur${companies.length>1?'s':''}</div><div class="stat-v" style="font-size:1rem;color:var(--gold)">${companies.length}</div><div class="stat-s">${companies.join(', ')}</div></div>
  </div>`;

  // Group by company
  companies.forEach(comp => {
    const compRecords = records.filter(r => r.company === comp);
    const compIcon = compRecords[0]?.icon || '🏢';
    const compTotal = compRecords.reduce((s, r) => s + r.total, 0);
    const isCurrentJob = currentJob === comp;

    h += `<div class="card"><div class="card-t" style="justify-content:space-between"><span>${compIcon} ${comp} ${isCurrentJob ? '<span class="badge b-green">Emploi actuel</span>' : '<span class="badge b-red">Terminé</span>'}</span><span class="mono" style="color:var(--green)">Total: $${compTotal.toLocaleString()}</span></div>`;
    h += `<table><thead><tr><th>Semaine</th><th>Grade</th><th>Facturé</th><th>Fixe</th><th>Commission</th><th>Prime</th><th style="color:var(--green)">Net</th></tr></thead><tbody>`;
    compRecords.forEach(r => {
      h += `<tr>
        <td style="font-size:.78rem">${r.week}<div style="font-size:.68rem;color:var(--t3)">${r.date}</div></td>
        <td><span class="badge b-gold">${r.grade}</span></td>
        <td class="mono" style="color:var(--cyan)">$${r.invoiced.toLocaleString()}</td>
        <td class="mono">${r.fixe ? '$'+r.fixe.toLocaleString() : '—'}</td>
        <td class="mono">${r.commission ? '$'+r.commission.toLocaleString() : '—'}</td>
        <td class="mono" style="color:var(--purple)">${r.prime ? '+$'+r.prime : '—'}</td>
        <td class="mono" style="color:var(--green);font-weight:600">$${r.total.toLocaleString()}</td>
      </tr>`;
    });
    h += '</tbody></table></div>';
  });

  return h;
}

// ============ CODE VIEWER (citizen) ============
function pCodeView(code) {
  let h = `<div style="margin-bottom:.3rem"><button class="btn btn-sm btn-outline" onclick="go('home')">← Retour</button></div>`;
  h += `<div style="margin-bottom:1rem;display:flex;align-items:center;gap:.8rem">
    <div style="font-size:2.2rem">${code.icon}</div>
    <div><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">${code.name}</h1>
    <p style="color:var(--t2);font-size:.82rem">${code.articles.length} articles en vigueur</p></div>
  </div>`;
  code.articles.forEach(a => {
    h += `<div class="card" style="border-left:3px solid ${code.color}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
        <span class="mono" style="font-size:.8rem;color:${code.color};font-weight:600">${a.ref}</span>
      </div>
      <div style="font-weight:600;font-size:.92rem">${a.title}</div>
      <p style="font-size:.82rem;color:var(--t2);margin-top:.2rem">${a.desc}</p>
      <div style="margin-top:.35rem;padding:.35rem .6rem;background:var(--input);border-radius:5px;font-size:.78rem;display:inline-block">⚖️ ${a.sanction}</div>
    </div>`;
  });
  return h;
}

// ============ HEALTH ============
function pHealth() {
  const hp = DB.healthRecords[DB.user.id];
  if (!hp) {
    return `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">🏥 Carnet de Santé</h1></div>
      <div class="card" style="text-align:center;padding:2rem"><div style="font-size:2.5rem;margin-bottom:.5rem">📋</div>
      <div style="font-size:.95rem;color:var(--t2)">Aucun dossier médical pour le moment</div>
      <div style="font-size:.82rem;color:var(--t3);margin-top:.3rem">Votre dossier sera créé lors de votre première visite aux EMS.</div></div>`;
  }
  let h = `<div style="margin-bottom:1.2rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">🏥 Carnet de Santé</h1><p style="color:var(--t2);font-size:.82rem">${DB.user.name} — ${DB.user.id}</p></div>`;
  h += `<div class="card"><div class="card-t">👤 Profil Médical</div>
    <div class="health-profile">
      <div class="health-row"><span>Groupe sanguin</span><strong style="color:var(--red)">${hp.blood}</strong></div>
      <div class="health-row"><span>Allergies</span><strong style="color:var(--orange)">${hp.allergies}</strong></div>
      <div class="health-row"><span>Taille</span><strong>${hp.height}</strong></div>
      <div class="health-row"><span>Poids</span><strong>${hp.weight}</strong></div>
      <div class="health-row"><span>Contact urgence</span><strong style="font-size:.8rem">${hp.emergency}</strong></div>
      <div class="health-row"><span>Pathologies</span><strong style="color:var(--green);font-size:.8rem">${hp.conditions}</strong></div>
    </div></div>`;
  h += `<div class="card"><div class="card-t">📋 Historique des Soins</div><div style="margin-top:.3rem">`;
  if (!hp.history.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucun soin enregistré.</p>';
  hp.history.forEach(e => {
    h += `<div class="timeline-item">
      <div class="timeline-date">${e.date} — <span class="badge ${e.badge}">${e.type}</span></div>
      <div class="timeline-text"><strong>${e.title}</strong></div>
      <div style="font-size:.78rem;color:var(--t2);margin-top:.15rem">👨‍⚕️ ${e.doctor}</div>
      <div style="font-size:.8rem;color:var(--t2);margin-top:.1rem">${e.notes}</div>
    </div>`;
  });
  h += '</div></div>';
  return h;
}

// ============ MESSAGES ============
function pMsg() {
  if (DB._msgView === 'compose') return pMsgCompose();
  if (DB._msgView === 'reply') return pMsgReply();
  if (DB._msgOpen !== undefined && DB._msgOpen !== null) return pMsgDetail(DB._msgOpen);

  // Filter messages: only show messages I'm involved in
  var myMsgs = DB.messages.filter(function(m) { return isMyMessage(m); });

  let h = `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
    <div><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">✉️ Messagerie</h1><p style="color:var(--t2);font-size:.82rem">${myMsgs.filter(function(m){return !m.read && isMessageForMe(m)}).length} non lus — ${myMsgs.length} messages</p></div>
    <button class="btn btn-sm btn-blue" onclick="DB._msgView='compose';go('msg')">📝 Nouveau Message</button>
  </div>`;

  h += '<div class="card" style="padding:0">';
  if (!myMsgs.length) h += '<div style="padding:1.5rem;text-align:center;color:var(--t3)">Aucun message</div>';
  myMsgs.forEach(function(m) {
    var realIdx = DB.messages.indexOf(m);
    var isSent = m.fromId === DB.user.id;
    var unread = !m.read && !isSent;
    h += `<div style="display:flex;gap:.7rem;padding:.7rem 1rem;cursor:pointer;border-bottom:1px solid rgba(30,41,59,.3);transition:background .1s" onmouseover="this.style.background='var(--bg4)'" onmouseout="this.style.background=''" onclick="DB._msgOpen=${realIdx};go('msg')">
      <span style="font-size:1.2rem;margin-top:.15rem">${isSent?'📤':m.icon||'📧'}</span>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:${m.read||isSent?'400':'600'};font-size:.86rem">${isSent?'→ '+m.to:m.from}</span>
          <span style="font-size:.68rem;color:var(--t3);flex-shrink:0">${m.date}</span>
        </div>
        <div style="font-size:.82rem;color:${m.read||isSent?'var(--t3)':'var(--t1)'};margin-top:.1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.subject}</div>
      </div>
      ${!m.read&&!isSent?'<div style="width:8px;height:8px;border-radius:50%;background:var(--blue);margin-top:.5rem;flex-shrink:0"></div>':''}
    </div>`;
  });
  return h + '</div>';
}

function pMsgDetail(idx) {
  const m = DB.messages[idx]; m.read = true; buildNav();
  const isSent = m.fromId === DB.user.id;
  let h = `<div style="margin-bottom:.8rem"><button class="btn btn-sm btn-outline" onclick="DB._msgOpen=null;go('msg')">← Retour</button></div>`;
  h += `<div class="card">
    <div style="display:flex;gap:.6rem;align-items:flex-start;margin-bottom:1rem;padding-bottom:.8rem;border-bottom:1px solid var(--border)">
      <span style="font-size:1.8rem">${isSent?'📤':m.icon||'📧'}</span>
      <div style="flex:1"><div style="font-weight:700;font-size:1.05rem">${m.subject}</div>
        <div style="font-size:.8rem;color:var(--t2);margin-top:.2rem">${isSent?'À: <strong>'+m.to+'</strong>':'De: <strong>'+m.from+'</strong>'} — ${m.date}</div>
      </div>
    </div>
    <div style="font-size:.88rem;line-height:1.7;white-space:pre-line">${m.body}</div>
    <div style="display:flex;gap:.4rem;margin-top:1.2rem;padding-top:.8rem;border-top:1px solid var(--border)">
      ${!isSent?`<button class="btn btn-sm btn-blue" onclick="DB._msgReplyTo=${idx};DB._msgView='reply';go('msg')">↩ Répondre</button>`:''}
      <button class="btn btn-sm btn-outline" onclick="toast('Archivé')">📁 Archiver</button>
      <button class="btn btn-sm btn-red" onclick="DB.messages.splice(${idx},1);DB._msgOpen=null;toast('Supprimé');go('msg')">🗑️</button>
    </div></div>`;
  return h;
}

function pMsgCompose() {
  // Build enterprise list with data-name for reliable extraction
  var entOpts = '';
  DB.enterprises.filter(function(e){return e.status==='active'}).forEach(function(e) {
    entOpts += '<option value="' + e.name + '" data-icon="' + e.icon + '">' + e.icon + ' ' + e.name + '</option>';
  });

  let h = `<div style="margin-bottom:.8rem"><button class="btn btn-sm btn-outline" onclick="DB._msgView=null;go('msg')">← Retour</button></div>`;
  h += `<div class="card">
    <div class="card-t">📝 Nouveau Message</div>
    <div class="fg"><label>Destinataire</label>
      <select id="compTo">${entOpts}</select>
    </div>
    <div class="fg"><label>Objet</label><input id="compSubj" placeholder="Objet du message"></div>
    <div class="fg"><label>Message</label><textarea id="compBody" rows="6" placeholder="Écrivez votre message..."></textarea></div>
    <div style="display:flex;gap:.4rem;justify-content:flex-end">
      <button class="btn btn-sm btn-outline" onclick="DB._msgView=null;go('msg')">Annuler</button>
      <button class="btn btn-sm btn-green" onclick="sendNewMsg()">📤 Envoyer</button>
    </div>
  </div>`;
  return h;
}

function sendNewMsg() {
  var sel = document.getElementById('compTo');
  var entName = sel.value; // Clean enterprise name (no emoji)
  var entIcon = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].getAttribute('data-icon') || '' : '';
  var subj = document.getElementById('compSubj').value.trim();
  var body = document.getElementById('compBody').value.trim();
  if (!subj) { err('Entrez un objet.'); return; }
  if (!body) { err('Écrivez un message.'); return; }
  DB.messages.unshift({
    id: Date.now(),
    from: DB.user.name,
    fromId: DB.user.id,
    to: entIcon + ' ' + entName,
    toEnterprise: entName,
    icon: entIcon || '📧',
    subject: subj,
    body: body,
    date: new Date().toLocaleDateString('fr-FR'),
    read: false
  });
  DB._msgView = null;
  toast('Message envoyé à ' + entIcon + ' ' + entName);
  go('msg');
}

function pMsgReply() {
  const orig = DB.messages[DB._msgReplyTo];
  let h = `<div style="margin-bottom:.8rem"><button class="btn btn-sm btn-outline" onclick="DB._msgView=null;DB._msgOpen=${DB._msgReplyTo};go('msg')">← Retour</button></div>`;
  h += `<div class="card">
    <div class="card-t">↩ Répondre à ${orig.from}</div>
    <div style="padding:.6rem .8rem;background:var(--input);border-radius:7px;margin-bottom:.8rem;border-left:3px solid var(--gold)">
      <div style="font-size:.75rem;color:var(--t3);margin-bottom:.2rem">Message original — ${orig.date}</div>
      <div style="font-size:.82rem;color:var(--t2);font-style:italic;max-height:80px;overflow:hidden">${orig.body.substring(0,200)}${orig.body.length>200?'...':''}</div>
    </div>
    <div class="fg"><label>Objet</label><input id="reSubj" value="RE: ${orig.subject}"></div>
    <div class="fg"><label>Votre réponse</label><textarea id="reBody" rows="5" placeholder="Écrivez votre réponse..."></textarea></div>
    <div style="display:flex;gap:.4rem;justify-content:flex-end">
      <button class="btn btn-sm btn-outline" onclick="DB._msgView=null;DB._msgOpen=${DB._msgReplyTo};go('msg')">Annuler</button>
      <button class="btn btn-sm btn-green" onclick="sendReply()">📤 Envoyer</button>
    </div>
  </div>`;
  return h;
}

function sendReply() {
  const orig = DB.messages[DB._msgReplyTo];
  const subj = document.getElementById('reSubj').value.trim();
  const body = document.getElementById('reBody').value.trim();
  if (!body) { err('Écrivez une réponse.'); return; }
  DB.messages.unshift({
    id: Date.now(), from: DB.user.name, fromId: DB.user.id, to: orig.from, toId: orig.fromId,
    icon: '📤', subject: subj || 'RE: ' + orig.subject, body: body,
    date: new Date().toLocaleDateString('fr-FR'), read: false
  });
  DB._msgView = null; DB._msgOpen = null;
  toast('Réponse envoyée à ' + orig.from);
  go('msg');
}

// ============ OFFRES D'EMPLOI ============
function pJobs() {
  const isPatron = DB.job && DB.job.grades[DB.job.gradeIndex] && DB.job.grades[DB.job.gradeIndex].canHire;
  let h = `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
    <div><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">💼 Offres d'Emploi</h1><p style="color:var(--t2);font-size:.82rem">${DB.jobs.length} postes ouverts</p></div>
    ${isPatron?'<button class="btn btn-sm btn-blue" onclick="modalPostJob()">+ Publier une Offre</button>':''}
  </div>`;
  if (!DB.jobs.length) h += '<div class="card" style="text-align:center;padding:1.5rem;color:var(--t3)">Aucune offre pour le moment.</div>';
  DB.jobs.forEach(function(j,i) {
    h += `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.5rem">
        <div style="flex:1;min-width:200px">
          <div style="font-weight:600;font-size:.95rem">${j.icon} ${j.company}</div>
          <div style="font-size:.88rem;margin-top:.2rem">${j.role} <span class="badge b-gold">${j.salary}</span></div>
          <p style="font-size:.8rem;color:var(--t2);margin-top:.3rem">${j.desc}</p>
          <div style="font-size:.73rem;color:var(--t3);margin-top:.3rem">👥 ${j.slots} poste${j.slots>1?'s':''} disponible${j.slots>1?'s':''} — Posté par ${j.postedBy||'—'}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:.3rem">
          <button class="btn btn-sm btn-blue" onclick="modalApply(${j.id})">📝 Postuler</button>
          ${(isPatron && j.company === DB.job.company) ? `<button class="btn btn-sm btn-red" onclick="DB.jobs.splice(${i},1);toast('Offre supprimée');go('jobs')" style="font-size:.7rem">🗑️</button>` : ''}
        </div>
      </div></div>`;
  });
  return h;
}
function modalPostJob() {
  if (!DB.job) return;
  const gradeOpts = DB.job.grades.map(function(g){return '<option>' + g.name + ' — ' + getPayLabel(g) + '</option>'}).join('');
  modal(`<div class="modal-t">📢 Publier une Offre d'Emploi</div>
    <div style="padding:.4rem .7rem;background:var(--input);border-radius:6px;margin-bottom:.8rem;font-size:.83rem">${DB.job.icon} ${DB.job.company}</div>
    <div class="fg"><label>Poste proposé</label><select id="pjRole">${gradeOpts}</select></div>
    <div class="fg"><label>Nombre de postes</label><input type="number" id="pjSlots" value="1" min="1"></div>
    <div class="fg"><label>Description de l'offre</label><textarea id="pjDesc" rows="3" placeholder="Décrivez le poste, les horaires, les avantages..."></textarea></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="publishJob()">Publier</button></div>`);
}
function publishJob() {
  const role = document.getElementById('pjRole').value.split(' — ')[0];
  const salary = document.getElementById('pjRole').value.split(' — ')[1] || '';
  DB.jobs.push({
    id: Date.now(), company: DB.job.company, icon: DB.job.icon,
    role: role, salary: salary, slots: parseInt(document.getElementById('pjSlots').value) || 1,
    desc: document.getElementById('pjDesc').value || 'Rejoignez notre équipe !',
    postedBy: DB.user.name
  });
  closeModal(); toast('Offre publiée !'); go('jobs');
}
function modalApply(jobId) {
  const j = DB.jobs.find(function(x){return x.id===jobId});
  modal(`<div class="modal-t">📝 Postuler — ${j.role} chez ${j.company}</div>
    <div class="fg"><label>Votre nom</label><input value="${DB.user.name}" readonly style="opacity:.7"></div>
    <div class="fg"><label>Votre motivation</label><textarea id="apMsg" rows="3" placeholder="Pourquoi ce poste ?"></textarea></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="submitApplication('${j.company}')">Envoyer</button></div>`);
}
function submitApplication(company) {
  const msg = document.getElementById('apMsg').value || 'Motivé pour rejoindre l\'équipe.';
  // Add to the enterprise's pending applications
  const jobData = DB.allJobs[company];
  if (jobData) {
    jobData.pendingApps.push({
      id: DB.user.id, name: DB.user.name, phone: DB.user.phone,
      message: msg, date: new Date().toLocaleDateString('fr-FR')
    });
  }
  closeModal(); toast('Candidature envoyée à ' + company + ' !'); go('jobs');
}

// ============ VOTES ============
function pVote() {
  let h = `<div style="margin-bottom:1.2rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">🗳️ Votes & Élections</h1><p style="color:var(--t2);font-size:.82rem">Exprimez-vous sur les propositions de San Andreas</p></div>`;
  const open = DB.laws.filter(l=>l.status==='open');
  const closed = DB.laws.filter(l=>l.status==='closed');
  if (open.length) {
    h += '<div style="margin-bottom:.3rem;font-size:.75rem;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:1px">En cours</div>';
    open.forEach(l => h += voteCard(l));
  }
  if (!open.length) h += '<div class="card" style="text-align:center;color:var(--t3);padding:1rem">Aucun vote en cours.</div>';
  if (closed.length) {
    h += '<div style="margin-top:1rem;margin-bottom:.3rem;font-size:.75rem;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:1px">Terminés</div>';
    closed.forEach(l => h += voteCard(l));
  }
  return h;
}
function voteCard(l) {
  const voted = DB.voted[l.id];
  const locked = !!voted || l.status === 'closed';
  const isMulti = l.choices && l.choices.length > 0;
  let h = `<div class="card" style="${locked?'opacity:'+(l.status==='closed'?.5:.85):''}">`;

  // Header
  h += `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem">
    <div style="flex:1"><div style="font-weight:600;font-size:.95rem">${isMulti?'🗳️':'📜'} ${l.title}</div>
    <p style="font-size:.8rem;color:var(--t2);margin-top:.15rem">${l.desc}</p></div>
    ${voted?`<span class="badge b-green">✓ Voté</span>`:l.status==='closed'?'<span class="badge b-red">Terminé</span>':'<span class="badge b-blue">Ouvert</span>'}
  </div>`;

  if (isMulti) {
    // Multi-choice mode (elections, sondages)
    const totalVotes = l.choices.reduce(function(s,c){return s+(c.votes||0)},0);
    const colors = ['var(--gold)','var(--blue)','var(--green)','var(--purple)','var(--cyan)','var(--orange)','var(--red)','#ec4899','#14b8a6','#f59e0b'];
    l.choices.forEach(function(c, ci) {
      const pct = totalVotes > 0 ? Math.round((c.votes||0) / totalVotes * 100) : 0;
      const color = colors[ci % colors.length];
      const isMyVote = voted === c.label;
      h += `<div style="margin-bottom:.4rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.15rem">
          <span style="font-size:.85rem;font-weight:${isMyVote?'700':'400'};color:${isMyVote?color:'var(--t1)'}">${isMyVote?'✓ ':''}${c.label}</span>
          <span style="font-size:.75rem;color:var(--t3)">${c.votes||0} vote${(c.votes||0)>1?'s':''} — ${pct}%</span>
        </div>
        <div style="height:8px;background:var(--input);border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:4px;transition:width .5s"></div>
        </div>
      </div>`;
    });
    // Vote buttons
    if (!locked) {
      h += `<div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.6rem">`;
      l.choices.forEach(function(c, ci) {
        h += `<button class="btn btn-sm btn-outline" onclick="castVote(${l.id},'${c.label.replace(/'/g,"\\\'")}')" style="border-color:${colors[ci%colors.length]}40;color:${colors[ci%colors.length]}">${c.label}</button>`;
      });
      h += '</div>';
    }
    h += `<div style="font-size:.72rem;color:var(--t3);margin-top:.4rem">${totalVotes} votes au total${l.status==='open'?' — Limite: '+l.deadline:''}</div>`;
  } else {
    // Classic pour/contre mode
    h += `<div style="display:flex;align-items:center;gap:.6rem;margin:.5rem 0">
      <span style="font-size:.76rem;color:var(--green);min-width:50px">Pour ${l.pour||0}%</span>
      <div style="flex:1;height:8px;background:var(--input);border-radius:4px;overflow:hidden"><div style="height:100%;width:${l.pour||0}%;background:linear-gradient(90deg,var(--green),var(--gold));border-radius:4px;transition:width .5s"></div></div>
      <span style="font-size:.76rem;color:var(--red);min-width:60px;text-align:right">Contre ${l.contre||0}%</span>
    </div>`;
    h += `<div style="display:flex;justify-content:space-between;align-items:center;font-size:.72rem;color:var(--t3)">
      <span>${l.total||0} votes${l.status==='open'?' — Limite: '+l.deadline:''}</span>`;
    if (!locked) {
      h += `<div style="display:flex;gap:.3rem">
        <button class="btn btn-sm btn-green" onclick="castVote(${l.id},'pour')">✓ Pour</button>
        <button class="btn btn-sm btn-red" onclick="castVote(${l.id},'contre')">✗ Contre</button>
      </div>`;
    }
    h += '</div>';
  }
  h += '</div>';
  return h;
}
function castVote(id, choice) {
  DB.voted[id] = choice;
  const l = DB.laws.find(x=>x.id===id);
  if (l.choices && l.choices.length > 0) {
    // Multi-choice: increment the chosen option
    var opt = l.choices.find(function(c){return c.label===choice});
    if (opt) opt.votes = (opt.votes||0) + 1;
  } else {
    // Classic pour/contre
    if (!l._pour) l._pour = 0;
    if (!l._contre) l._contre = 0;
    if (choice === 'pour') l._pour++; else l._contre++;
    l.total = l._pour + l._contre;
    l.pour = l.total > 0 ? Math.round(l._pour / l.total * 100) : 0;
    l.contre = l.total > 0 ? Math.round(l._contre / l.total * 100) : 0;
  }
  toast('Vote enregistré');
  go('vote');
}

