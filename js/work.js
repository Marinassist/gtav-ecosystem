// ============ WORK: DASHBOARD ============
function pWDash() {
  if (!DB.job) return '<p>Non embauché</p>';
  const j = DB.job, g = j.grades[j.gradeIndex];
  const myId = DB.user.id;
  const myInvoicesThisWeek = j.weeklyHistory.length ? (j.weeklyHistory[0].data[myId] || {invoiced:0,count:0}) : {invoiced:0,count:0};
  const myPay = calcWeekPay(j.gradeIndex, myInvoicesThisWeek.invoiced);

  let h = `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.2rem;flex-wrap:wrap;gap:.5rem">
    <div><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">${j.icon} ${j.company}</h1><p style="color:var(--t2);font-size:.82rem">${j.role} — <span class="badge b-gold">${g.name}</span></p></div>
    ${g.canManage?'<button class="btn btn-sm btn-outline" onclick="modalPostAnnouncement()" style="border-color:rgba(240,180,41,.3);color:var(--gold)">📣 Publier une Annonce</button>':''}
  </div>`;

  // Prise de service
  h += `<div class="card" style="border-color:${DB.onDuty?'var(--green)':'var(--border)'}">
    <div class="card-t">${DB.onDuty?'🟢':'⚫'} Prise de Service</div>
    <div style="display:flex;align-items:center;gap:1rem">
      <button class="btn ${DB.onDuty?'btn-red':'btn-green'}" onclick="toggleService()">
        ${DB.onDuty?'⏹ Fin de Service':'▶ Prise de Service'}
      </button>
      <span style="font-size:.85rem;color:var(--t2)">${DB.onDuty?'Depuis '+DB.onDuty:'Hors service'}</span>
    </div></div>`;

  // Pay structure card
  h += `<div class="card"><div class="card-t">💵 Ma Rémunération</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.5rem">
      <div class="health-row"><span>Type</span><strong style="color:var(--gold)">${g.payType==='fixe'?'Salaire Fixe':g.payType==='commission'?'Commission':'Fixe + Commission'}</strong></div>
      ${g.fixe?`<div class="health-row"><span>Fixe / sem.</span><strong style="color:var(--green)">$${g.fixe.toLocaleString()}</strong></div>`:''}
      ${g.commission?`<div class="health-row"><span>Commission</span><strong style="color:var(--blue)">${g.commission}%</strong></div>`:''}
      ${g.prime?`<div class="health-row"><span>Prime hebdo</span><strong style="color:var(--purple)">+$${g.prime}</strong></div>`:'<div class="health-row"><span>Prime</span><strong style="color:var(--t3)">Aucune</strong></div>'}
    </div></div>`;

  // Stats
  h += `<div class="stats">
    <div class="stat"><div class="stat-l">Facturé cette sem.</div><div class="stat-v" style="color:var(--blue)">$${myInvoicesThisWeek.invoiced.toLocaleString()}</div><div class="stat-s">${myInvoicesThisWeek.count} facture${myInvoicesThisWeek.count>1?'s':''}</div></div>
    <div class="stat"><div class="stat-l">Salaire estimé</div><div class="stat-v" style="color:var(--green)">$${myPay.toLocaleString()}</div><div class="stat-s">${getPayLabel(g)}</div></div>
    <div class="stat"><div class="stat-l">Grade</div><div class="stat-v" style="font-size:1rem;color:var(--gold)">${g.name}</div></div>
    <div class="stat"><div class="stat-l">Statut</div><div class="stat-v" style="font-size:1rem;color:${DB.onDuty?'var(--green)':'var(--t3)'}">${DB.onDuty?'En service':'Hors service'}</div></div>
  </div>`;

  // Last invoices by me
  const myInv = j.invoices.filter(inv => inv.employee === myId).slice(0,5);
  if (myInv.length) {
    h += `<div class="card"><div class="card-t">🧾 Mes Dernières Factures</div><table><thead><tr><th>Date</th><th>Heure</th><th>Articles</th><th>Total</th></tr></thead><tbody>`;
    myInv.forEach(inv => h += `<tr><td style="font-size:.8rem">${inv.date}</td><td class="mono" style="font-size:.8rem">${inv.time}</td><td style="font-size:.8rem">${inv.items.join(', ')}</td><td class="mono" style="color:var(--green)">$${inv.total}</td></tr>`);
    h += '</tbody></table></div>';
  }

  // Quick links
  h += `<div class="card"><div class="card-t">⚡ Accès rapide</div><div style="display:flex;flex-wrap:wrap;gap:.4rem">
    ${g.canPOS?'<button class="btn btn-sm btn-blue" onclick="go(\'wpos\')">🧾 Ouvrir la Caisse</button>':''}
    <button class="btn btn-sm btn-outline" onclick="go('wpay')">💰 Mon Salaire</button>
    ${g.canManage?'<button class="btn btn-sm btn-outline" onclick="go(\'wteam\')">👥 Équipe</button>':''}
  </div></div>`;
  return h;
}

// ============ WORK: POS ============
function pWPos() {
  if (!DB.job) return '';
  var j = DB.job, items = j.pos;
  var totalQty = DB.cart.reduce(function(s,c){return s+(c.qty||1)},0);
  var h = '<div style="margin-bottom:1rem"><h1 style="font-family:Rajdhani,sans-serif;font-size:1.5rem;font-weight:700">\u{1F9FE} Caisse Enregistreuse</h1></div>';
  h += '<div class="row" style="align-items:start">';
  h += '<div><div class="card"><div class="card-t">\u{1F4CB} Catalogue</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:.6rem">';
  items.forEach(function(it) {
    var sn = it.name.replace(/'/g, "\\'");
    h += '<div style="background:linear-gradient(135deg,var(--input),rgba(30,41,59,.8));border:1px solid var(--border);border-radius:12px;padding:.8rem .6rem;text-align:center;cursor:pointer;transition:all .2s" onclick="addToCart(\'' + sn + '\',' + it.price + ')">';
    h += '<div style="font-size:2.2rem;margin-bottom:.3rem">' + it.emoji + '</div>';
    h += '<div style="font-size:.78rem;font-weight:600;margin-bottom:.2rem">' + it.name + '</div>';
    h += '<div style="font-family:Rajdhani,sans-serif;font-weight:700;color:var(--green);font-size:1rem">$' + it.price + '</div></div>';
  });
  h += '</div></div>';
  h += '<div class="card"><div class="card-t">\u{270F}\u{FE0F} Saisie Libre</div><div style="display:flex;gap:.4rem"><input id="posN" placeholder="Article" style="flex:1"><input id="posP" type="number" placeholder="Prix" style="width:70px"><input id="posQ" type="number" value="1" min="1" style="width:50px"><button class="btn btn-sm btn-blue" onclick="var n=document.getElementById(\'posN\').value,p=parseInt(document.getElementById(\'posP\').value),q=parseInt(document.getElementById(\'posQ\').value)||1;if(n&&p){addToCart(n,p,q)}">+</button></div></div></div>';
  h += '<div><div class="card" style="border-color:rgba(240,180,41,.15)"><div class="card-t">\u{1F6D2} Panier (' + totalQty + ')</div>';
  if (!DB.cart.length) h += '<div style="text-align:center;padding:1.5rem;color:var(--t3)">Cliquez sur un article pour l\u2019ajouter</div>';
  else {
    DB.cart.forEach(function(c,i) {
      var lt = c.price * (c.qty||1);
      h += '<div style="display:flex;align-items:center;padding:.4rem .5rem;border-radius:6px;margin-bottom:.3rem;background:var(--input)">';
      h += '<span style="flex:1;font-weight:500;font-size:.85rem">' + c.name + '</span>';
      h += '<span onclick="changeQty(' + i + ',-1)" style="cursor:pointer;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border-radius:4px;background:rgba(239,68,68,.12);color:#ef4444;font-weight:700;font-size:.8rem">\u2212</span>';
      h += '<span style="min-width:28px;text-align:center;font-weight:600;font-size:.85rem">' + (c.qty||1) + '</span>';
      h += '<span onclick="changeQty(' + i + ',1)" style="cursor:pointer;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;border-radius:4px;background:rgba(34,197,94,.12);color:#22c55e;font-weight:700;font-size:.8rem">+</span>';
      h += '<span style="color:var(--green);font-weight:600;min-width:55px;text-align:right;margin:0 .4rem;font-size:.85rem">$' + lt + '</span>';
      h += '<span onclick="DB.cart.splice(' + i + ',1);go(\'wpos\')" style="cursor:pointer;color:#ef4444;font-size:.8rem">\u2715</span>';
      h += '</div>';
    });
    var sub = DB.cart.reduce(function(s,c){return s+c.price*(c.qty||1)},0);
    var tva = Math.round(sub*DB.taxConfig.tva/100);
    h += '<div style="margin-top:.6rem;padding-top:.6rem;border-top:2px solid rgba(240,180,41,.2)">';
    h += '<div style="display:flex;justify-content:space-between;font-size:.85rem;color:var(--t2)"><span>Sous-total</span><span>$' + sub.toLocaleString() + '</span></div>';
    h += '<div style="display:flex;justify-content:space-between;font-size:.78rem;color:var(--t3)"><span>TVA (' + DB.taxConfig.tva + '%)</span><span>$' + tva + '</span></div>';
    h += '<div style="display:flex;justify-content:space-between;font-family:Rajdhani,sans-serif;font-weight:700;font-size:1.3rem;color:var(--gold);margin-top:.3rem"><span>TOTAL</span><span>$' + (sub+tva).toLocaleString() + '</span></div></div>';
    h += '<div style="display:flex;gap:.4rem;margin-top:.8rem"><button class="btn btn-green" style="flex:1;padding:.7rem" onclick="doCheckout()">\u{1F4B3} Encaisser $' + (sub+tva).toLocaleString() + '</button><button class="btn btn-outline" onclick="DB.cart=[];go(\'wpos\')">\u{1F5D1}\u{FE0F}</button></div>';
  }
  h += '</div>';
  h += '<div class="card"><div class="card-t">\u{1F4CA} Dernières Factures</div>';
  if (!j.invoices.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucune facture</p>';
  h += '<table><thead><tr><th>Heure</th><th>Employé</th><th>Articles</th><th>Total</th></tr></thead><tbody>';
  j.invoices.slice(0,8).forEach(function(inv) { h += '<tr><td style="font-size:.75rem">' + (inv.date||'') + ' ' + inv.time + '</td><td style="font-size:.82rem">' + inv.employeeName + '</td><td style="font-size:.75rem;color:var(--t2)">' + inv.items.join(', ') + '</td><td style="color:var(--green);font-weight:600">$' + inv.total + '</td></tr>'; });
  h += '</tbody></table></div></div></div>';
  return h;
}
function addToCart(name, price, qty) {
  qty = qty || 1;
  var existing = DB.cart.find(function(c){return c.name===name && c.price===price});
  if (existing) existing.qty = (existing.qty||1) + qty;
  else DB.cart.push({name:name, price:price, qty:qty});
  // Re-render POS without saving to Supabase (cart is local/temporary)
  var c = document.getElementById('page');
  if (c) c.innerHTML = pWPos();
}
function changeQty(idx, delta) {
  var item = DB.cart[idx];
  if (!item) return;
  item.qty = (item.qty||1) + delta;
  if (item.qty <= 0) DB.cart.splice(idx, 1);
  var c = document.getElementById('page');
  if (c) c.innerHTML = pWPos();
}
function doCheckout() {
  var j = DB.job;
  var sub = DB.cart.reduce(function(s,c){return s+c.price*(c.qty||1)},0);
  var tva = Math.round(sub * DB.taxConfig.tva / 100);
  var itemNames = [];
  DB.cart.forEach(function(c) { var q = c.qty||1; itemNames.push(q > 1 ? c.name + ' x' + q : c.name); });
  // Record invoice
  const inv = {
    id: Date.now(), employee: DB.user.id, employeeName: DB.user.name,
    items: itemNames, total: sub, tva: tva,
    date: new Date().toLocaleDateString('fr-FR'),
    time: new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
  };
  j.invoices.unshift(inv);
  j.bankBalance = (j.bankBalance || 0) + sub;

  // Auto-create current week entry if missing
  var weekLabel = 'Sem. ' + getWeekNumber(new Date()) + ' (' + new Date().getFullYear() + ')';
  if (!j.weeklyHistory.length || j.weeklyHistory[0].week !== weekLabel) {
    j.weeklyHistory.unshift({week: weekLabel, data: {}});
    if (j.weeklyHistory.length > 20) j.weeklyHistory.length = 20;
  }

  // Update current week data
  var week = j.weeklyHistory[0];
  if (!week.data[DB.user.id]) week.data[DB.user.id] = {invoiced:0,count:0};
  week.data[DB.user.id].invoiced += sub;
  week.data[DB.user.id].count++;

  DB.cart = [];
  saveDB();
  toast('Facture $'+(sub+tva).toLocaleString()+' émise — enregistrée');
  go('wpos');
}

// ============ WORK: SALARY ============
function pWPay() {
  if (!DB.job) return '';
  const j = DB.job, g = j.grades[j.gradeIndex], myId = DB.user.id;

  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">💰 Mon Salaire</h1><p style="color:var(--t2);font-size:.82rem">${g.name} — ${getPayLabel(g)}</p></div>`;

  // Pay structure
  h += `<div class="card"><div class="card-t">💵 Détail de ma Rémunération</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.5rem">
      <div class="health-row"><span>Type</span><strong style="color:var(--gold)">${g.payType==='fixe'?'Fixe':g.payType==='commission'?'Commission':'Fixe + Commission'}</strong></div>
      ${g.fixe?`<div class="health-row"><span>Salaire fixe</span><strong style="color:var(--green)">$${g.fixe.toLocaleString()} / sem.</strong></div>`:''}
      ${g.commission?`<div class="health-row"><span>Commission</span><strong style="color:var(--blue)">${g.commission}% du facturé</strong></div>`:''}
      <div class="health-row"><span>Prime hebdo</span><strong style="color:${g.prime?'var(--purple)':'var(--t3)'}">${g.prime?'$'+g.prime:'Aucune'}</strong></div>
    </div></div>`;

  // Weekly history table — max 10 weeks
  h += `<div class="card"><div class="card-t">📋 Historique Hebdomadaire <span class="badge b-blue">Max 10 sem.</span></div>`;
  h += '<table><thead><tr><th>Semaine</th><th>Facturé</th><th>Nb Factures</th><th>Fixe</th><th>Commission</th><th>Prime</th><th style="color:var(--green)">Total Net</th></tr></thead><tbody>';

  let totalAll = 0;
  j.weeklyHistory.slice(0,10).forEach(w => {
    const d = w.data[myId] || {invoiced:0, count:0};
    const commAmount = g.commission ? Math.round(d.invoiced * g.commission / 100) : 0;
    const weekTotal = (g.fixe||0) + commAmount + (g.prime||0);
    totalAll += weekTotal;
    h += `<tr>
      <td style="font-size:.78rem">${w.week}</td>
      <td class="mono" style="color:var(--blue)">$${d.invoiced.toLocaleString()}</td>
      <td style="text-align:center">${d.count}</td>
      <td class="mono">${g.fixe?'$'+g.fixe.toLocaleString():'—'}</td>
      <td class="mono">${commAmount?'$'+commAmount.toLocaleString():'—'}</td>
      <td class="mono" style="color:var(--purple)">${g.prime?'+$'+g.prime:'—'}</td>
      <td class="mono" style="color:var(--green);font-weight:600">$${weekTotal.toLocaleString()}</td>
    </tr>`;
  });
  h += '</tbody></table></div>';

  // Summary stats
  const weeks = j.weeklyHistory.slice(0,10);
  const avg = weeks.length ? Math.round(totalAll / weeks.length) : 0;
  h += `<div class="stats">
    <div class="stat"><div class="stat-l">Total perçu</div><div class="stat-v" style="color:var(--gold)">$${totalAll.toLocaleString()}</div><div class="stat-s">${weeks.length} semaines</div></div>
    <div class="stat"><div class="stat-l">Moyenne / sem.</div><div class="stat-v" style="color:var(--blue)">$${avg.toLocaleString()}</div></div>
    <div class="stat"><div class="stat-l">Total facturé</div><div class="stat-v" style="color:var(--cyan)">$${weeks.reduce((s,w)=>{const d=w.data[myId]||{invoiced:0};return s+d.invoiced},0).toLocaleString()}</div></div>
  </div>`;

  return h;
}

// ============ WORK: FRAIS PRO (employé) ============
function pWFrais() {
  if (!DB.job) return '';
  const j = DB.job, myId = DB.user.id;
  const myExpenses = j.employeeExpenses.filter(e => e.empId === myId);
  const totalApproved = myExpenses.filter(e=>e.status==='approved').reduce((s,e)=>s+e.amount,0);
  const totalPending = myExpenses.filter(e=>e.status==='pending').reduce((s,e)=>s+e.amount,0);

  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">⛽ Mes Frais Professionnels</h1><p style="color:var(--t2);font-size:.82rem">Déclarez vos dépenses liées au travail</p></div>`;

  h += `<div class="stats">
    <div class="stat"><div class="stat-l">Remboursé</div><div class="stat-v" style="color:var(--green)">$${totalApproved.toLocaleString()}</div><div class="stat-s">Approuvé</div></div>
    <div class="stat"><div class="stat-l">En attente</div><div class="stat-v" style="color:var(--orange)">$${totalPending.toLocaleString()}</div></div>
    <div class="stat"><div class="stat-l">Total soumis</div><div class="stat-v" style="color:var(--blue)">${myExpenses.length}</div><div class="stat-s">Notes de frais</div></div>
  </div>`;

  // Submit form
  h += `<div class="card"><div class="card-t">➕ Déclarer une Dépense</div>
    <div class="row"><div class="fg"><label>Type de frais</label><select id="efType"><option>Essence</option><option>Péage</option><option>Entretien véhicule</option><option>Stationnement</option><option>Repas professionnel</option><option>Équipement</option><option>Autre</option></select></div><div class="fg"><label>Montant ($)</label><input type="number" id="efAmount" placeholder="0"></div></div>
    <div class="fg"><label>Description / Justificatif</label><input id="efDesc" placeholder="Ex: Plein du véhicule #12 — Station Shell Davis"></div>
    <button class="btn btn-sm btn-green" onclick="submitExpense()">📤 Soumettre</button></div>`;

  // History
  h += `<div class="card"><div class="card-t">📋 Mes Notes de Frais</div>`;
  if (!myExpenses.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucune dépense soumise.</p>';
  else {
    h += '<table><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Montant</th><th>Statut</th></tr></thead><tbody>';
    myExpenses.forEach(e => {
      const bc = e.status==='approved'?'b-green':e.status==='pending'?'b-orange':'b-red';
      const lb = e.status==='approved'?'Remboursé':e.status==='pending'?'En attente':'Refusé';
      h += `<tr><td style="font-size:.8rem">${e.date}</td><td><span class="badge b-blue">${e.type}</span></td><td style="font-size:.82rem">${e.desc}</td><td class="mono" style="color:var(--red)">$${e.amount}</td><td><span class="badge ${bc}">${lb}</span></td></tr>`;
    });
    h += '</tbody></table>';
  }
  h += '</div>';
  return h;
}

function submitExpense() {
  const type = document.getElementById('efType').value;
  const amount = parseInt(document.getElementById('efAmount').value);
  const desc = document.getElementById('efDesc').value.trim();
  if (!amount || amount <= 0) { err('Entrez un montant valide.'); return; }
  if (!desc) { err('Ajoutez une description.'); return; }
  DB.job.employeeExpenses.unshift({
    id: Date.now(), empId: DB.user.id, empName: DB.user.name,
    type, amount, desc, date: new Date().toLocaleDateString('fr-FR'), status: 'pending'
  });
  toast('Note de frais soumise — $' + amount);
  go('wfrais');
}

// ============ WORK: PRIMES & SANCTIONS ============
function pWHR() {
  if (!DB.job) return '';
  const j = DB.job;
  const records = j.hrRecords || [];
  const primes = records.filter(r => r.type === 'prime');
  const sanctions = records.filter(r => r.type !== 'prime');
  const totalPrimes = primes.reduce((s,r) => s + r.amount, 0);

  let h = `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
    <div><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">📋 Primes & Sanctions</h1><p style="color:var(--t2);font-size:.82rem">${records.length} enregistrements — ${primes.length} primes, ${sanctions.length} sanctions</p></div>
    <div style="display:flex;gap:.3rem">
      <button class="btn btn-sm btn-green" onclick="modalAddHR('prime')">🏆 Ajouter une Prime</button>
      <button class="btn btn-sm btn-red" onclick="modalAddHR('blame')">⚠️ Poser un Blâme</button>
    </div>
  </div>`;

  h += `<div class="stats">
    <div class="stat"><div class="stat-l">Primes versées</div><div class="stat-v" style="color:var(--green)">$${totalPrimes.toLocaleString()}</div><div class="stat-s">${primes.length} prime${primes.length>1?'s':''}</div></div>
    <div class="stat"><div class="stat-l">Avertissements</div><div class="stat-v" style="color:var(--orange)">${records.filter(r=>r.type==='warning').length}</div></div>
    <div class="stat"><div class="stat-l">Blâmes</div><div class="stat-v" style="color:var(--red)">${records.filter(r=>r.type==='blame').length}</div></div>
  </div>`;

  // Per employee summary
  h += `<div class="card"><div class="card-t">👥 Résumé par Employé</div>`;
  const empIds = [...new Set(records.map(r => r.empId))];
  empIds.forEach(eid => {
    const emp = j.employees.find(e => e.id === eid);
    const empRecs = records.filter(r => r.empId === eid);
    const empPrimes = empRecs.filter(r => r.type === 'prime');
    const empSanc = empRecs.filter(r => r.type !== 'prime');
    const empPrimeTotal = empPrimes.reduce((s,r) => s + r.amount, 0);
    h += `<div style="display:flex;justify-content:space-between;align-items:center;padding:.5rem .7rem;background:var(--input);border-radius:7px;margin-bottom:.4rem">
      <div><strong style="font-size:.88rem">${emp ? emp.name : eid}</strong> <span class="mono" style="font-size:.72rem;color:var(--t3)">${eid}</span></div>
      <div style="display:flex;gap:.6rem;font-size:.82rem">
        <span style="color:var(--green)">🏆 ${empPrimes.length} prime${empPrimes.length>1?'s':''} ($${empPrimeTotal.toLocaleString()})</span>
        ${empSanc.length ? `<span style="color:var(--red)">⚠️ ${empSanc.length} sanction${empSanc.length>1?'s':''}</span>` : '<span style="color:var(--t3)">✓ Aucune sanction</span>'}
      </div>
    </div>`;
  });
  if (!empIds.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucun enregistrement.</p>';
  h += '</div>';

  // Full log
  h += '<div class="card"><div class="card-t">📜 Historique Complet</div><table><thead><tr><th>Date</th><th>Employé</th><th>Type</th><th>Motif</th><th>Montant</th><th>Par</th><th></th></tr></thead><tbody>';
  records.sort((a,b) => b.id - a.id).forEach((r,i) => {
    const ico = r.type==='prime'?'🏆':r.type==='warning'?'⚠️':'🚫';
    const bc = r.type==='prime'?'b-green':r.type==='warning'?'b-orange':'b-red';
    const lb = r.type==='prime'?'Prime':r.type==='warning'?'Avertissement':'Blâme';
    const realIdx = j.hrRecords.indexOf(r);
    h += `<tr>
      <td style="font-size:.78rem">${r.date}</td>
      <td style="font-weight:500">${r.empName}</td>
      <td>${ico} <span class="badge ${bc}">${lb}</span></td>
      <td style="font-size:.82rem;max-width:250px">${r.reason}</td>
      <td class="mono" style="color:${r.amount?'var(--green)':'var(--t3)'}">${r.amount?'+$'+r.amount.toLocaleString():'—'}</td>
      <td style="font-size:.78rem;color:var(--t2)">${r.by}</td>
      <td><button class="btn btn-sm btn-red" onclick="DB.job.hrRecords.splice(${realIdx},1);toast('Enregistrement supprimé');go('whr')" style="padding:.2rem .4rem">✕</button></td>
    </tr>`;
  });
  h += '</tbody></table></div>';
  return h;
}

function modalAddHR(type) {
  const j = DB.job;
  const empOpts = j.employees.filter(e => e.status === 'active').map(e => `<option value="${e.id}" data-name="${e.name}">${e.name} (${j.grades[e.grade].name})</option>`).join('');
  const isPrime = type === 'prime';

  modal(`<div class="modal-t">${isPrime?'🏆 Ajouter une Prime':'⚠️ Poser une Sanction'}</div>
    <div class="fg"><label>Employé</label><select id="hrEmp">${empOpts}</select></div>
    ${!isPrime ? `<div class="fg"><label>Type de sanction</label><select id="hrSancType"><option value="warning">⚠️ Avertissement (rappel oral)</option><option value="blame">🚫 Blâme (sanction formelle)</option></select></div>` : ''}
    ${isPrime ? `<div class="fg"><label>Montant de la prime ($)</label><input type="number" id="hrAmount" placeholder="Ex: 200"></div>` : ''}
    <div class="fg"><label>Motif détaillé</label><textarea id="hrReason" rows="3" placeholder="${isPrime?'Ex: Meilleur employé du mois, client très satisfait...':'Ex: Retard répété, non-respect du protocole...'}"></textarea></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm ${isPrime?'btn-green':'btn-red'}" onclick="submitHR('${type}')">Enregistrer</button></div>`);
}

function submitHR(type) {
  const empId = document.getElementById('hrEmp').value;
  const emp = DB.job.employees.find(e => e.id === empId);
  const reason = document.getElementById('hrReason').value.trim();
  if (!reason) { err('Motif obligatoire.'); return; }

  const isPrime = type === 'prime';
  const sancType = !isPrime ? document.getElementById('hrSancType').value : 'prime';
  const amount = isPrime ? (parseInt(document.getElementById('hrAmount').value) || 0) : 0;

  if (!DB.job.hrRecords) DB.job.hrRecords = [];
  DB.job.hrRecords.unshift({
    id: Date.now(), empId, empName: emp ? emp.name : empId,
    type: sancType, amount, reason,
    date: new Date().toLocaleDateString('fr-FR'), by: DB.user.name
  });

  closeModal();
  toast(isPrime ? 'Prime de $'+amount+' attribuée à '+emp.name : 'Sanction enregistrée pour '+emp.name);
  go('whr');
}

// ============ WORK: COMPTA (gestion) ============
function pWCompta() {
  if (!DB.job) return '';
  var j = DB.job;
  var tab = DB._comptaTab || 'overview';
  if (!j.bankBalance && j.bankBalance !== 0) j.bankBalance = 0;
  if (!j.comptaHistory) j.comptaHistory = [];
  if (!j.comptaWeeks) j.comptaWeeks = [];

  // Calculate totals
  var totalCA = j.invoices.reduce(function(s,inv){return s+inv.total},0);
  var totalTVA = j.invoices.reduce(function(s,inv){return s+inv.tva},0);
  var totalCompExp = j.companyExpenses.reduce(function(s,e){return s+e.amount},0);
  var totalEmpExp = j.employeeExpenses.filter(function(e){return e.status==='approved'}).reduce(function(s,e){return s+e.amount},0);
  var totalExpenses = totalCompExp + totalEmpExp;
  var net = totalCA - totalExpenses;

  // Auto-check weekly closing (Saturday 23:59)
  checkWeeklyClose(j);

  var h = '<div style="margin-bottom:1rem"><h1 style="font-family:Rajdhani,sans-serif;font-size:1.5rem;font-weight:700">\u{1F4D2} Comptabilité</h1><p style="color:var(--t2);font-size:.82rem">' + j.icon + ' ' + j.company + '</p></div>';

  // BANK BALANCE — big card
  h += '<div class="card" style="border-color:rgba(240,180,41,.3);background:linear-gradient(135deg,rgba(240,180,41,.05),transparent)">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem">';
  h += '<div><div style="font-size:.7rem;color:var(--t3);text-transform:uppercase;letter-spacing:1px">Solde du Compte</div>';
  h += '<div style="font-family:Rajdhani,sans-serif;font-size:2.5rem;font-weight:700;color:' + (j.bankBalance >= 0 ? 'var(--gold)' : 'var(--red)') + '">$' + j.bankBalance.toLocaleString() + '</div></div>';
  h += '<div style="display:flex;gap:.3rem"><button class="btn btn-sm btn-green" onclick="modalBankOp(\'depot\')">+ Dépôt</button><button class="btn btn-sm btn-red" onclick="modalBankOp(\'retrait\')">- Retrait</button><button class="btn btn-sm btn-outline" onclick="modalSetBalance()">Ajuster</button><button class="btn btn-sm btn-outline" style="border-color:rgba(239,68,68,.3);color:var(--red)" onclick="resetCompta()">\u{1F5D1}\u{FE0F} Reset Compta</button></div>';
  h += '</div></div>';

  h += '<div class="stats">';
  h += '<div class="stat"><div class="stat-l">CA Semaine</div><div class="stat-v" style="color:var(--green)">$' + totalCA.toLocaleString() + '</div><div class="stat-s">' + j.invoices.length + ' factures</div></div>';
  h += '<div class="stat"><div class="stat-l">Dépenses</div><div class="stat-v" style="color:var(--red)">$' + totalExpenses.toLocaleString() + '</div></div>';
  h += '<div class="stat"><div class="stat-l">Bénéfice Net</div><div class="stat-v" style="color:' + (net >= 0 ? 'var(--gold)' : 'var(--red)') + '">$' + net.toLocaleString() + '</div></div>';
  h += '<div class="stat"><div class="stat-l">TVA Collectée</div><div class="stat-v" style="color:var(--orange)">$' + totalTVA.toLocaleString() + '</div></div>';
  h += '</div>';

  // Tabs
  var tabs = [['overview','\u{1F4CA} Mouvements'],['expenses','\u{1F4B8} Charges'],['empfrais','\u{26FD} Frais Employés'],['tax','\u{1F3DB}\u{FE0F} Fiscalité'],['history','\u{1F4C5} Clôtures']];
  h += '<div style="display:flex;gap:0;margin-bottom:1rem;border-bottom:1px solid var(--border);overflow-x:auto">';
  tabs.forEach(function(t) {
    h += '<div style="padding:.5rem 1rem;font-size:.8rem;font-weight:500;cursor:pointer;border-bottom:2px solid ' + (tab===t[0]?'var(--gold)':'transparent') + ';color:' + (tab===t[0]?'var(--gold)':'var(--t2)') + ';white-space:nowrap" onclick="DB._comptaTab=\'' + t[0] + '\';go(\'wcompta\')">' + t[1] + '</div>';
  });
  h += '</div>';

  if (tab === 'overview') {
    // Employee weekly performance
    var thisWeek = j.weeklyHistory.length ? j.weeklyHistory[0] : null;
    h += '<div class="card"><div class="card-t" style="justify-content:space-between">\u{1F4CA} Performance Employés — Semaine en cours <button class="btn btn-sm btn-green" onclick="payWeeklySalaries()">\u{1F4B3} Verser les salaires</button></div>';
    var activeEmps = j.employees.filter(function(e){return e.status==='active'});
    if (!activeEmps.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucun employé actif.</p>';
    else {
      h += '<table><thead><tr><th>Employé</th><th>Grade</th><th>Facturé</th><th>Nb Factures</th><th>Fixe</th><th>Commission</th><th>Prime</th><th style="color:var(--gold)">Salaire est.</th></tr></thead><tbody>';
      var totalSalaries = 0;
      activeEmps.forEach(function(emp) {
        var g = j.grades[emp.grade] || j.grades[0];
        var wd = thisWeek && thisWeek.data[emp.id] ? thisWeek.data[emp.id] : {invoiced:0, count:0};
        var comm = g.commission ? Math.round(wd.invoiced * g.commission / 100) : 0;
        var sal = (g.fixe||0) + comm + (g.prime||0);
        totalSalaries += sal;
        h += '<tr>';
        h += '<td style="font-weight:600;font-size:.85rem">' + emp.name + '</td>';
        h += '<td><span class="badge b-gold" style="font-size:.65rem">' + g.name + '</span></td>';
        h += '<td class="mono" style="color:var(--blue)">$' + wd.invoiced.toLocaleString() + '</td>';
        h += '<td class="mono">' + wd.count + '</td>';
        h += '<td class="mono">' + (g.fixe ? '$' + g.fixe.toLocaleString() : '\u2014') + '</td>';
        h += '<td class="mono" style="color:var(--blue)">' + (comm ? '$' + comm.toLocaleString() : '\u2014') + '</td>';
        h += '<td class="mono" style="color:var(--purple)">' + (g.prime ? '$' + g.prime.toLocaleString() : '\u2014') + '</td>';
        h += '<td class="mono" style="font-weight:700;color:var(--gold)">$' + sal.toLocaleString() + '</td>';
        h += '</tr>';
      });
      h += '</tbody></table>';
      h += '<div style="text-align:right;margin-top:.5rem;font-family:Rajdhani,sans-serif;font-size:1.1rem;font-weight:700;color:var(--gold)">Total salaires: $' + totalSalaries.toLocaleString() + '</div>';
    }
    h += '</div>';

    // Income / Expenses side by side
    h += '<div class="row">';
    // Rentrées
    h += '<div class="card"><div class="card-t" style="color:var(--green)">\u{1F4C8} Rentrées d\'Argent</div>';
    h += '<table><thead><tr><th>Date</th><th>Description</th><th>Montant</th></tr></thead><tbody>';
    var allIncome = [];
    j.invoices.slice(0,10).forEach(function(inv) {
      allIncome.push({date: (inv.date||'') + ' ' + inv.time, desc: inv.items.join(', ') + ' (' + inv.employeeName + ')', amount: inv.total, id: inv.id||0});
    });
    (j.comptaHistory||[]).filter(function(e){return e.type==='in'}).forEach(function(e) {
      allIncome.push({date: e.date, desc: e.desc, amount: e.amount, id: e.id||0});
    });
    allIncome.sort(function(a,b){return (b.id||0)-(a.id||0)});
    var totalIncome = allIncome.reduce(function(s,e){return s+e.amount},0);
    allIncome.slice(0,10).forEach(function(e) {
      h += '<tr><td style="font-size:.78rem">' + e.date + '</td><td style="font-size:.82rem">' + e.desc + '</td><td class="mono" style="color:var(--green)">+$' + e.amount.toLocaleString() + '</td></tr>';
    });
    if (!allIncome.length) h += '<tr><td colspan="3" style="color:var(--t3);text-align:center">Aucune rentrée</td></tr>';
    h += '</tbody></table>';
    h += '<div style="margin-top:.5rem;font-size:.82rem;text-align:right;color:var(--green)">Total: <strong>$' + totalIncome.toLocaleString() + '</strong></div></div>';

    // Sorties
    h += '<div class="card"><div class="card-t" style="color:var(--red)">\u{1F4C9} Sorties d\'Argent</div>';
    h += '<table><thead><tr><th>Date</th><th>Description</th><th>Montant</th></tr></thead><tbody>';
    var allExp = [];
    j.companyExpenses.forEach(function(e) { allExp.push({date:e.date, desc:e.desc + ' (' + e.type + ')', amount:e.amount, id:e.id||0}); });
    j.employeeExpenses.filter(function(e){return e.status==='approved'}).forEach(function(e) { allExp.push({date:e.date, desc:'Frais ' + e.empName + ' — ' + e.desc, amount:e.amount, id:e.id||0}); });
    (j.comptaHistory||[]).filter(function(e){return e.type==='out'}).forEach(function(e) { allExp.push({date:e.date, desc:e.desc, amount:e.amount, id:e.id||0}); });
    if (totalTVA > 0) { allExp.push({date:'—', desc:'TVA collectée (' + DB.taxConfig.tva + '%) — à reverser', amount:totalTVA, id:0, isTVA:true}); }
    allExp.sort(function(a,b){return (b.id||0)-(a.id||0)});
    var totalAllExp = allExp.reduce(function(s,e){return s+e.amount},0);
    allExp.slice(0,10).forEach(function(e) {
      var color = e.isTVA ? 'var(--orange)' : 'var(--red)';
      h += '<tr><td style="font-size:.78rem">' + e.date + '</td><td style="font-size:.82rem' + (e.isTVA ? ';color:var(--orange);font-weight:600' : '') + '">' + e.desc + '</td><td class="mono" style="color:' + color + '">-$' + e.amount.toLocaleString() + '</td></tr>';
    });
    if (!allExp.length) h += '<tr><td colspan="3" style="color:var(--t3);text-align:center">Aucune dépense</td></tr>';
    h += '</tbody></table>';
    h += '<div style="margin-top:.5rem;font-size:.82rem;text-align:right;color:var(--red)">Total: <strong>$' + totalAllExp.toLocaleString() + '</strong>' + (totalTVA > 0 ? ' <span style="color:var(--orange)">(dont TVA: $' + totalTVA.toLocaleString() + ')</span>' : '') + '</div></div>';
    h += '</div>';

    // Bank movements
    h += '<div class="card"><div class="card-t">\u{1F4B3} Mouvements Bancaires</div>';
    var bankOps = (j.comptaHistory||[]).slice(0,15);
    if (!bankOps.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucun mouvement bancaire. Utilisez D\u00E9p\u00F4t / Retrait ci-dessus.</p>';
    else {
      h += '<table><thead><tr><th>Date</th><th>Description</th><th>Montant</th></tr></thead><tbody>';
      bankOps.forEach(function(op) {
        var color = op.type === 'in' ? 'var(--green)' : 'var(--red)';
        var sign = op.type === 'in' ? '+' : '-';
        h += '<tr><td style="font-size:.78rem">' + op.date + '</td><td style="font-size:.82rem">' + op.desc + '</td><td class="mono" style="color:' + color + ';font-weight:600">' + sign + '$' + op.amount.toLocaleString() + '</td></tr>';
      });
      h += '</tbody></table>';
    }
    h += '</div>';

  } else if (tab === 'expenses') {
    h += '<div class="card"><div class="card-t" style="justify-content:space-between">\u{1F4B8} Charges de l\'Entreprise <button class="btn btn-sm btn-blue" onclick="modalAddCompanyExpense()">+ Ajouter</button></div>';
    h += '<table><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Montant</th><th>Récurrent</th><th></th></tr></thead><tbody>';
    j.companyExpenses.forEach(function(e,i) {
      h += '<tr><td style="font-size:.8rem">' + e.date + '</td><td><span class="badge b-purple">' + e.type + '</span></td><td style="font-size:.82rem">' + e.desc + '</td><td class="mono" style="color:var(--red)">$' + e.amount.toLocaleString() + '</td><td>' + (e.recurring ? '<span class="badge b-blue">Mensuel</span>' : '<span class="badge b-orange">Ponctuel</span>') + '</td><td><button class="btn btn-sm btn-red" onclick="DB.job.companyExpenses.splice(' + i + ',1);toast(\'Charge supprimée\');go(\'wcompta\')" style="padding:.2rem .4rem">\u2715</button></td></tr>';
    });
    h += '</tbody></table>';
    var recurr = j.companyExpenses.filter(function(e){return e.recurring}).reduce(function(s,e){return s+e.amount},0);
    var ponct = j.companyExpenses.filter(function(e){return !e.recurring}).reduce(function(s,e){return s+e.amount},0);
    h += '<div style="display:flex;gap:1rem;margin-top:.6rem;font-size:.82rem;color:var(--t2)"><span>Fixes: <strong style="color:var(--red)">$' + recurr.toLocaleString() + '/mois</strong></span><span>Ponctuelles: <strong style="color:var(--orange)">$' + ponct.toLocaleString() + '</strong></span></div></div>';

  } else if (tab === 'empfrais') {
    var pending = j.employeeExpenses.filter(function(e){return e.status==='pending'});
    var processed = j.employeeExpenses.filter(function(e){return e.status!=='pending'});
    h += '<div class="card"><div class="card-t">\u{23F3} Notes de Frais en Attente (' + pending.length + ')</div>';
    if (!pending.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucune note en attente.</p>';
    pending.forEach(function(e) {
      var realIdx = j.employeeExpenses.indexOf(e);
      h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:.6rem;background:var(--input);border:1px solid var(--border);border-radius:8px;margin-bottom:.4rem">';
      h += '<div><div style="font-weight:600;font-size:.88rem">' + e.empName + ' <span class="badge b-blue">' + e.type + '</span></div>';
      h += '<div style="font-size:.8rem;color:var(--t2);margin-top:.1rem">' + e.desc + ' \u2014 ' + e.date + '</div></div>';
      h += '<div style="display:flex;align-items:center;gap:.5rem"><span class="mono" style="font-size:.95rem;color:var(--red)">$' + e.amount + '</span>';
      h += '<button class="btn btn-sm btn-green" onclick="DB.job.employeeExpenses[' + realIdx + '].status=\'approved\';toast(\'Approuvé\');go(\'wcompta\')">\u2713</button>';
      h += '<button class="btn btn-sm btn-red" onclick="DB.job.employeeExpenses[' + realIdx + '].status=\'rejected\';toast(\'Refusé\');go(\'wcompta\')">\u2715</button></div></div>';
    });
    h += '</div>';
    h += '<div class="card"><div class="card-t">\u{1F4CB} Historique Traité</div><table><thead><tr><th>Date</th><th>Employé</th><th>Type</th><th>Montant</th><th>Statut</th></tr></thead><tbody>';
    processed.forEach(function(e) {
      h += '<tr><td style="font-size:.8rem">' + e.date + '</td><td style="font-size:.82rem">' + e.empName + '</td><td><span class="badge b-blue">' + e.type + '</span></td><td class="mono" style="color:var(--red)">$' + e.amount + '</td><td><span class="badge ' + (e.status==='approved'?'b-green':'b-red') + '">' + (e.status==='approved'?'Remboursé':'Refusé') + '</span></td></tr>';
    });
    h += '</tbody></table></div>';

  } else if (tab === 'tax') {
    h += '<div class="card"><div class="card-t">\u{1F3DB}\u{FE0F} Déclarer les Impôts</div>';
    h += '<div class="stats" style="margin-bottom:.8rem">';
    h += '<div class="stat"><div class="stat-l">CA</div><div class="stat-v" style="color:var(--green);font-size:1.3rem">$' + totalCA.toLocaleString() + '</div></div>';
    h += '<div class="stat"><div class="stat-l">Dépenses</div><div class="stat-v" style="color:var(--red);font-size:1.3rem">$' + totalExpenses.toLocaleString() + '</div></div>';
    h += '<div class="stat"><div class="stat-l">Bénéfice</div><div class="stat-v" style="color:var(--gold);font-size:1.3rem">$' + net.toLocaleString() + '</div></div>';
    h += '</div><div id="taxCalcResult"></div>';
    h += '<div style="display:flex;gap:.5rem;margin-top:.8rem"><button class="btn btn-sm btn-gold" onclick="previewTax()">\u{1F9EE} Calculer</button><button class="btn btn-sm btn-green" onclick="sendTaxDeclaration()">\u{1F4E4} Envoyer au Gouvernement</button></div></div>';
    h += '<div class="card"><div class="card-t">\u{1F4CB} Déclarations Précédentes</div>';
    if (!j.taxDeclarations.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucune déclaration.</p>';
    else {
      h += '<table><thead><tr><th>Période</th><th>CA</th><th>Dépenses</th><th>Impôt</th><th>Date</th><th>Statut</th></tr></thead><tbody>';
      j.taxDeclarations.forEach(function(d) {
        h += '<tr><td>' + d.period + '</td><td class="mono">$' + d.ca.toLocaleString() + '</td><td class="mono">$' + d.expenses.toLocaleString() + '</td><td class="mono" style="color:var(--gold)">$' + d.taxDue.toLocaleString() + '</td><td style="font-size:.8rem">' + d.date + '</td><td><span class="badge ' + (d.status==='paid'?'b-green':'b-orange') + '">' + (d.status==='paid'?'Payé':'En attente') + '</span></td></tr>';
      });
      h += '</tbody></table>';
    }
    h += '</div>';

  } else if (tab === 'history') {
    // Weekly closings
    h += '<div class="card"><div class="card-t">\u{1F4C5} Clôtures Hebdomadaires</div>';
    h += '<p style="font-size:.82rem;color:var(--t2);margin-bottom:.8rem">La comptabilité se clôture automatiquement chaque samedi à 23h59.</p>';
    if (!j.comptaWeeks || !j.comptaWeeks.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucune clôture enregistrée.</p>';
    else {
      h += '<table><thead><tr><th>Semaine</th><th>CA</th><th>Dépenses</th><th>Bénéfice</th><th>Solde fin</th></tr></thead><tbody>';
      j.comptaWeeks.forEach(function(w) {
        h += '<tr><td style="font-size:.82rem">' + w.label + '</td><td class="mono" style="color:var(--green)">$' + w.ca.toLocaleString() + '</td><td class="mono" style="color:var(--red)">$' + w.expenses.toLocaleString() + '</td><td class="mono" style="color:' + (w.net>=0?'var(--gold)':'var(--red)') + '">$' + w.net.toLocaleString() + '</td><td class="mono" style="font-weight:700">$' + w.balance.toLocaleString() + '</td></tr>';
      });
      h += '</tbody></table>';
    }
    h += '</div>';
  }
  return h;
}
function modalBankOp(type) {
  var isDepot = type === 'depot';
  modal('<div class="modal-t">' + (isDepot ? '\u{1F4B5} Dépôt en Compte' : '\u{1F4B8} Retrait du Compte') + '</div>' +
    '<div class="fg"><label>Montant ($)</label><input type="number" id="bankAmt" placeholder="0"></div>' +
    '<div class="fg"><label>Description</label><input id="bankDesc" placeholder="' + (isDepot ? 'Ex: Dépôt espèces, Virement...' : 'Ex: Paiement fournisseur...') + '"></div>' +
    '<div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm ' + (isDepot?'btn-green':'btn-red') + '" onclick="doBankOp(\'' + type + '\')">Confirmer</button></div>');
}
function doBankOp(type) {
  var amt = parseInt(document.getElementById('bankAmt').value);
  if (!amt || amt <= 0) { err('Montant invalide.'); return; }
  var desc = document.getElementById('bankDesc').value || (type === 'depot' ? 'Dépôt' : 'Retrait');
  if (!DB.job.comptaHistory) DB.job.comptaHistory = [];
  if (type === 'depot') {
    DB.job.bankBalance += amt;
    DB.job.comptaHistory.unshift({id:Date.now(), date:new Date().toLocaleDateString('fr-FR'), desc:desc, amount:amt, type:'in'});
  } else {
    DB.job.bankBalance -= amt;
    DB.job.comptaHistory.unshift({id:Date.now(), date:new Date().toLocaleDateString('fr-FR'), desc:desc, amount:amt, type:'out'});
  }
  if (DB.job.comptaHistory.length > 100) DB.job.comptaHistory.length = 100;
  saveDB();
  closeModal(); toast((type==='depot'?'Dépôt':'Retrait') + ' de $' + amt.toLocaleString() + ' enregistré'); go('wcompta');
}
function modalSetBalance() {
  modal('<div class="modal-t">\u{2699}\u{FE0F} Ajuster le Solde</div>' +
    '<p style="font-size:.82rem;color:var(--t2);margin-bottom:.8rem">Solde actuel: <strong style="color:var(--gold)">$' + DB.job.bankBalance.toLocaleString() + '</strong></p>' +
    '<div class="fg"><label>Nouveau solde ($)</label><input type="number" id="newBal" value="' + DB.job.bankBalance + '"></div>' +
    '<div class="fg"><label>Motif</label><input id="balReason" placeholder="Ex: Correction, inventaire de caisse..."></div>' +
    '<div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="var nb=parseInt(document.getElementById(\'newBal\').value)||0;var diff=nb-DB.job.bankBalance;if(!DB.job.comptaHistory)DB.job.comptaHistory=[];DB.job.comptaHistory.unshift({id:Date.now(),date:new Date().toLocaleDateString(\'fr-FR\'),desc:\'Ajustement: \'+(document.getElementById(\'balReason\').value||\'—\'),amount:Math.abs(diff),type:diff>=0?\'in\':\'out\'});DB.job.bankBalance=nb;saveDB();closeModal();toast(\'Solde ajusté à $\'+nb.toLocaleString());go(\'wcompta\')">Appliquer</button></div>');
}
function checkWeeklyClose(j) {
  if (!j.comptaWeeks) j.comptaWeeks = [];
  var now = new Date();
  // Check if it's past Saturday 23:59 and we haven't closed this week yet
  var day = now.getDay(); // 0=Sun
  var weekLabel = 'Sem. ' + getWeekNumber(now) + ' (' + now.getFullYear() + ')';
  if (j.comptaWeeks.length && j.comptaWeeks[0].label === weekLabel) return; // Already closed
  // If it's Sunday (past Saturday 23:59) or we have no closings yet with data
  if (day === 0 && j.invoices.length > 0 && j.comptaWeeks.length < 52) {
    var totalCA = j.invoices.reduce(function(s,inv){return s+inv.total},0);
    var totalExp = j.companyExpenses.reduce(function(s,e){return s+e.amount},0) + j.employeeExpenses.filter(function(e){return e.status==='approved'}).reduce(function(s,e){return s+e.amount},0);
    j.comptaWeeks.unshift({label:weekLabel, ca:totalCA, expenses:totalExp, net:totalCA-totalExp, balance:j.bankBalance, date:now.toLocaleDateString('fr-FR')});
    if (j.comptaWeeks.length > 20) j.comptaWeeks.length = 20;
  }
}
function getWeekNumber(d) {
  var onejan = new Date(d.getFullYear(),0,1);
  return Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
}

function modalAddCompanyExpense() {
  modal(`<div class="modal-t">💸 Ajouter une Charge</div>
    <div class="row"><div class="fg"><label>Type</label><select id="ceType"><option>Loyer</option><option>Assurance</option><option>Électricité</option><option>Eau</option><option>Réparation</option><option>Fournitures</option><option>Marketing</option><option>Juridique</option><option>Autre</option></select></div><div class="fg"><label>Montant ($)</label><input type="number" id="ceAmt" placeholder="0"></div></div>
    <div class="fg"><label>Description</label><input id="ceDesc" placeholder="Détail de la dépense"></div>
    <div class="fg"><label style="display:flex;align-items:center;gap:.4rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="ceRecur"> Charge récurrente (mensuelle)</label></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="const a=parseInt(document.getElementById('ceAmt').value);if(!a){err('Montant requis');return}DB.job.companyExpenses.unshift({id:Date.now(),type:document.getElementById('ceType').value,amount:a,desc:document.getElementById('ceDesc').value||'—',date:new Date().toLocaleDateString('fr-FR'),recurring:document.getElementById('ceRecur').checked});closeModal();toast('Charge ajoutée');go('wcompta')">Ajouter</button></div>`);
}

function payWeeklySalaries() {
  var j = DB.job;
  var thisWeek = j.weeklyHistory.length ? j.weeklyHistory[0] : null;
  if (!thisWeek) { toast('Aucune donnée pour cette semaine'); return; }

  // Build preview of all salaries
  var rows = [];
  var totalPay = 0;
  var alreadyCount = 0;
  j.employees.filter(function(e){return e.status==='active'}).forEach(function(e) {
    var g = j.grades[e.grade];
    var wd = thisWeek.data[e.id] || {invoiced:0, count:0};
    var commAmount = g.commission ? Math.round(wd.invoiced * g.commission / 100) : 0;
    var weekTotal = (g.fixe||0) + commAmount + (g.prime||0);
    // Check if already paid
    if (!DB.citizenSalaries[e.id]) DB.citizenSalaries[e.id] = [];
    var already = DB.citizenSalaries[e.id].find(function(r){return r.week===thisWeek.week && r.company===j.company});
    rows.push({emp:e, grade:g, invoiced:wd.invoiced, count:wd.count, fixe:g.fixe||0, comm:commAmount, prime:g.prime||0, total:weekTotal, paid:!!already});
    if (!already) totalPay += weekTotal;
    else alreadyCount++;
  });

  if (rows.length === 0) { err('Aucun employé actif.'); return; }
  if (alreadyCount === rows.length) { toast('Tous les salaires de la semaine ont déjà été versés.'); return; }

  // Build modal with recap table
  var html = '<div class="modal-t">\u{1F4B3} Récapitulatif des Salaires — ' + thisWeek.week + '</div>';
  html += '<div style="max-height:400px;overflow-y:auto">';
  html += '<table><thead><tr><th>Employé</th><th>Grade</th><th>Facturé</th><th>Fixe</th><th>Commission</th><th>Prime</th><th>Total</th><th>Statut</th></tr></thead><tbody>';
  rows.forEach(function(r) {
    html += '<tr style="' + (r.paid?'opacity:.4':'') + '">';
    html += '<td style="font-size:.82rem;font-weight:600">' + r.emp.name + '</td>';
    html += '<td><span class="badge b-gold" style="font-size:.65rem">' + r.grade.name + '</span></td>';
    html += '<td class="mono" style="font-size:.8rem">$' + r.invoiced.toLocaleString() + '</td>';
    html += '<td class="mono" style="font-size:.8rem">' + (r.fixe ? '$'+r.fixe.toLocaleString() : '\u2014') + '</td>';
    html += '<td class="mono" style="font-size:.8rem;color:var(--blue)">' + (r.comm ? '$'+r.comm.toLocaleString() : '\u2014') + '</td>';
    html += '<td class="mono" style="font-size:.8rem;color:var(--purple)">' + (r.prime ? '$'+r.prime.toLocaleString() : '\u2014') + '</td>';
    html += '<td class="mono" style="font-weight:700;color:var(--green)">$' + r.total.toLocaleString() + '</td>';
    html += '<td>' + (r.paid ? '<span class="badge b-green">\u2713 Versé</span>' : '<span class="badge b-orange">À verser</span>') + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';

  // Total
  var toPay = rows.filter(function(r){return !r.paid}).length;
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem;padding-top:.8rem;border-top:2px solid var(--gold)">';
  html += '<div><div style="font-size:.78rem;color:var(--t3)">' + toPay + ' employé' + (toPay>1?'s':'') + ' à payer' + (alreadyCount ? ' (' + alreadyCount + ' déjà versé' + (alreadyCount>1?'s':'') + ')' : '') + '</div>';
  html += '<div style="font-family:Rajdhani,sans-serif;font-size:1.8rem;font-weight:700;color:var(--gold)">Total: $' + totalPay.toLocaleString() + '</div></div>';
  html += '<div style="display:flex;gap:.4rem"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="confirmPaySalaries()">\u{1F4B3} Confirmer le versement</button></div>';
  html += '</div>';
  modal(html);
}

function confirmPaySalaries() {
  var j = DB.job;
  var thisWeek = j.weeklyHistory.length ? j.weeklyHistory[0] : null;
  if (!thisWeek) return;
  var totalPaid = 0;
  var count = 0;

  j.employees.filter(function(e){return e.status==='active'}).forEach(function(e) {
    var g = j.grades[e.grade];
    var wd = thisWeek.data[e.id] || {invoiced:0, count:0};
    var commAmount = g.commission ? Math.round(wd.invoiced * g.commission / 100) : 0;
    var weekTotal = (g.fixe||0) + commAmount + (g.prime||0);
    if (!DB.citizenSalaries[e.id]) DB.citizenSalaries[e.id] = [];
    var alreadyPaid = DB.citizenSalaries[e.id].find(function(r){return r.week===thisWeek.week && r.company===j.company});
    if (alreadyPaid) return;

    DB.citizenSalaries[e.id].unshift({
      week: thisWeek.week, company: j.company, icon: j.icon, grade: g.name,
      invoiced: wd.invoiced, fixe: g.fixe||0, commission: commAmount,
      prime: g.prime||0, total: weekTotal, date: new Date().toLocaleDateString('fr-FR')
    });

    var companyRecords = DB.citizenSalaries[e.id].filter(function(r){return r.company===j.company});
    if (companyRecords.length > 10) {
      var oldest = companyRecords[companyRecords.length-1];
      var idx = DB.citizenSalaries[e.id].indexOf(oldest);
      if (idx > -1) DB.citizenSalaries[e.id].splice(idx, 1);
    }
    totalPaid += weekTotal;
    count++;
  });

  // Deduct from bank balance
  if (j.bankBalance !== undefined) {
    j.bankBalance -= totalPaid;
    if (!j.comptaHistory) j.comptaHistory = [];
    j.comptaHistory.unshift({id:Date.now(), date:new Date().toLocaleDateString('fr-FR'), desc:'Versement salaires — ' + thisWeek.week + ' (' + count + ' employés)', amount:totalPaid, type:'out'});
  }

  closeModal();
  if (count === 0) { toast('Salaires déjà versés'); return; }
  saveDB();
  toast(count + ' salaires versés — Total: $' + totalPaid.toLocaleString());
  go('wcompta');
}

function previewTax() {
  const j = DB.job;
  const ca = j.invoices.reduce((s,inv)=>s+inv.total,0);
  const exp = j.companyExpenses.reduce((s,e)=>s+e.amount,0) + j.employeeExpenses.filter(e=>e.status==='approved').reduce((s,e)=>s+e.amount,0);
  const net = Math.max(0, ca - exp);
  let tax = 0;
  DB.taxConfig.tranches.forEach(t => { if(net>t.min){const taxable=Math.min(net,t.max)-t.min;if(taxable>0)tax+=Math.round(taxable*t.rate/100)} });
  const tva = Math.round(ca * DB.taxConfig.tva / 100);
  document.getElementById('taxCalcResult').innerHTML = `<div class="stats"><div class="stat"><div class="stat-l">Impôt Progressif</div><div class="stat-v" style="color:var(--gold);font-size:1.2rem">$${tax.toLocaleString()}</div></div><div class="stat"><div class="stat-l">TVA (${DB.taxConfig.tva}%)</div><div class="stat-v" style="color:var(--orange);font-size:1.2rem">$${tva.toLocaleString()}</div></div><div class="stat"><div class="stat-l">Total à payer</div><div class="stat-v" style="color:var(--red);font-size:1.2rem">$${(tax+tva).toLocaleString()}</div></div></div>`;
}

function sendTaxDeclaration() {
  const j = DB.job;
  const ca = j.invoices.reduce((s,inv)=>s+inv.total,0);
  const exp = j.companyExpenses.reduce((s,e)=>s+e.amount,0) + j.employeeExpenses.filter(e=>e.status==='approved').reduce((s,e)=>s+e.amount,0);
  const net = Math.max(0, ca - exp);
  let tax = 0;
  DB.taxConfig.tranches.forEach(t => { if(net>t.min){const taxable=Math.min(net,t.max)-t.min;if(taxable>0)tax+=Math.round(taxable*t.rate/100)} });
  const tva = Math.round(ca * DB.taxConfig.tva / 100);
  const period = 'Q1 2026';
  const date = new Date().toLocaleDateString('fr-FR');

  // Save in company
  j.taxDeclarations.unshift({ id:Date.now(), period, ca, expenses:exp, taxDue:tax+tva, date, status:'pending' });

  // Send to government
  DB.govTaxDeclarations.unshift({ id:Date.now(), company:j.company, icon:j.icon, period, ca, expenses:exp, net, taxDue:tax, tva, date, status:'pending' });

  toast('Déclaration fiscale envoyée au Gouvernement');
  go('wcompta');
}

// ============ WORK: INTERNAL CHAT ============
function pWChat() {
  if (!DB.job) return '';
  const j = DB.job, myId = DB.user.id;
  const viewing = DB._chatView;

  if (viewing === 'compose') return pWChatCompose();
  if (viewing !== undefined && viewing !== null) return pWChatDetail(viewing);

  // Inbox — messages to me or to all
  const myMsgs = j.internalMessages.filter(m => m.to === 'all' || m.to === myId || m.from === myId).sort((a,b) => b.id - a.id);

  let h = `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
    <div><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">💬 Discussion Interne</h1><p style="color:var(--t2);font-size:.82rem">${j.company} — ${j.employees.filter(e=>e.status==='active').length} collègues</p></div>
    <button class="btn btn-sm btn-blue" onclick="DB._chatView='compose';go('wchat')">📝 Nouveau Message</button>
  </div>`;

  h += '<div class="card" style="padding:0">';
  if (!myMsgs.length) h += '<div style="padding:1.5rem;text-align:center;color:var(--t3)">Aucun message</div>';
  myMsgs.forEach((m,i) => {
    const isMe = m.from === myId;
    const realIdx = j.internalMessages.indexOf(m);
    h += `<div style="display:flex;gap:.7rem;padding:.7rem 1rem;cursor:pointer;border-bottom:1px solid rgba(30,41,59,.3);transition:background .1s" onmouseover="this.style.background='var(--bg4)'" onmouseout="this.style.background=''" onclick="DB._chatView=${realIdx};go('wchat')">
      <span style="font-size:1.1rem;margin-top:.15rem">${m.to==='all'?'📢':isMe?'📤':'💬'}</span>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:600;font-size:.86rem">${isMe?'→ '+(m.to==='all'?'Tout le monde':m.toName):m.fromName} ${m.to==='all'?'<span class="badge b-cyan" style="font-size:.58rem">Tous</span>':''}</span>
          <span style="font-size:.68rem;color:var(--t3)">${m.date} ${m.time}</span>
        </div>
        <div style="font-size:.82rem;color:var(--t2);margin-top:.1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.subject}</div>
      </div>
    </div>`;
  });
  h += '</div>';
  return h;
}

function pWChatDetail(idx) {
  const m = DB.job.internalMessages[idx];
  const isMe = m.from === DB.user.id;
  let h = `<div style="margin-bottom:.8rem"><button class="btn btn-sm btn-outline" onclick="DB._chatView=null;go('wchat')">← Retour</button></div>`;
  h += `<div class="card">
    <div style="display:flex;gap:.5rem;align-items:flex-start;margin-bottom:1rem;padding-bottom:.8rem;border-bottom:1px solid var(--border)">
      <span style="font-size:1.5rem">${m.to==='all'?'📢':'💬'}</span>
      <div style="flex:1"><div style="font-weight:700;font-size:1.05rem">${m.subject}</div>
        <div style="font-size:.8rem;color:var(--t2);margin-top:.2rem">${isMe?'À':'De'}: <strong>${isMe?(m.to==='all'?'Tout le monde':m.toName):m.fromName}</strong> — ${m.date} ${m.time}</div>
      </div>
    </div>
    <div style="font-size:.88rem;line-height:1.7;white-space:pre-line">${m.body}</div>
    ${!isMe?`<div style="display:flex;gap:.4rem;margin-top:1rem;padding-top:.8rem;border-top:1px solid var(--border)">
      <button class="btn btn-sm btn-blue" onclick="DB._chatReplyTo=${idx};DB._chatView='compose';go('wchat')">↩ Répondre</button>
    </div>`:''}
  </div>`;
  return h;
}

function pWChatCompose() {
  const j = DB.job, myId = DB.user.id;
  const replyTo = DB._chatReplyTo !== undefined ? j.internalMessages[DB._chatReplyTo] : null;
  const empOpts = `<option value="all">📢 Tout le monde</option>` + j.employees.filter(e=>e.status==='active'&&e.id!==myId).map(e=>`<option value="${e.id}" ${replyTo&&replyTo.from===e.id?'selected':''}>${e.name} (${j.grades[e.grade].name})</option>`).join('');

  let h = `<div style="margin-bottom:.8rem"><button class="btn btn-sm btn-outline" onclick="DB._chatView=null;DB._chatReplyTo=undefined;go('wchat')">← Retour</button></div>`;
  h += `<div class="card"><div class="card-t">📝 ${replyTo?'Répondre à '+replyTo.fromName:'Nouveau Message'}</div>`;
  if (replyTo) h += `<div style="padding:.5rem .7rem;background:var(--input);border-radius:6px;margin-bottom:.8rem;border-left:3px solid var(--gold);font-size:.82rem;color:var(--t2);font-style:italic">${replyTo.body.substring(0,150)}${replyTo.body.length>150?'...':''}</div>`;
  h += `<div class="fg"><label>Destinataire</label><select id="chatTo">${empOpts}</select></div>
    <div class="fg"><label>Objet</label><input id="chatSubj" value="${replyTo?'RE: '+replyTo.subject:''}"></div>
    <div class="fg"><label>Message</label><textarea id="chatBody" rows="5" placeholder="Votre message..."></textarea></div>
    <div style="display:flex;gap:.4rem;justify-content:flex-end">
      <button class="btn btn-sm btn-outline" onclick="DB._chatView=null;DB._chatReplyTo=undefined;go('wchat')">Annuler</button>
      <button class="btn btn-sm btn-green" onclick="sendInternalMsg()">📤 Envoyer</button>
    </div></div>`;
  return h;
}

function sendInternalMsg() {
  const to = document.getElementById('chatTo').value;
  const subj = document.getElementById('chatSubj').value.trim();
  const body = document.getElementById('chatBody').value.trim();
  if (!subj || !body) { err('Remplissez l\'objet et le message.'); return; }
  const toEmp = to === 'all' ? null : DB.job.employees.find(e=>e.id===to);
  DB.job.internalMessages.unshift({
    id: Date.now(), from: DB.user.id, fromName: DB.user.name,
    to, toName: to==='all' ? 'Tous' : (toEmp?toEmp.name:''),
    subject: subj, body, date: new Date().toLocaleDateString('fr-FR'),
    time: new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
  });
  DB._chatView = null; DB._chatReplyTo = undefined;
  toast('Message envoyé' + (to==='all'?' à tout le monde':''));
  go('wchat');
}

// ============ WORK: DOSSIERS PATIENTS (EMS) ============
function pWPatients() {
  if (!DB.job) return '';
  const v = DB._patientView;
  if (v && v.startsWith('cit:')) return pWPatientDetail(v.replace('cit:',''), false);
  if (v && v.startsWith('tmp:')) return pWPatientDetail(v.replace('tmp:',''), true);

  const citWithRecords = Object.keys(DB.healthRecords);
  let h = `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
    <div><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">🩺 Dossiers Patients</h1><p style="color:var(--t2);font-size:.82rem">${citWithRecords.length} dossiers citoyen + ${DB.tempPatients.length} temporaire${DB.tempPatients.length>1?'s':''}</p></div>
    <button class="btn btn-sm btn-blue" onclick="modalCreateTempPatient()">+ Dossier Temporaire</button>
  </div>`;

  // Search
  h += `<div class="card"><div class="card-t">🔍 Rechercher un Patient</div>
    <div style="display:flex;gap:.4rem"><input id="patSearch" placeholder="ID citoyen (SA-XXXX) ou nom..." style="flex:1"><button class="btn btn-sm btn-blue" onclick="searchPatient()">Rechercher</button></div>
    <div id="patSearchResult" style="margin-top:.6rem"></div>
  </div>`;

  // Citizen records
  h += `<div class="card"><div class="card-t">📋 Dossiers Citoyens</div>`;
  h += '<table><thead><tr><th>ID</th><th>Nom</th><th>Groupe</th><th>Allergies</th><th>Dernière visite</th><th></th></tr></thead><tbody>';
  citWithRecords.forEach(cid => {
    const rec = DB.healthRecords[cid];
    const cit = DB.citizens.find(c=>c.id===cid);
    const name = cit ? cit.name : cid;
    const lastVisit = rec.history.length ? rec.history[0].date : '—';
    h += `<tr><td class="mono" style="font-size:.78rem;color:var(--gold)">${cid}</td><td style="font-weight:600">${name}</td><td style="color:var(--red);font-weight:600">${rec.blood}</td><td style="font-size:.82rem;color:var(--orange)">${rec.allergies}</td><td style="font-size:.8rem">${lastVisit}</td>
      <td><button class="btn btn-sm btn-blue" onclick="DB._patientView='cit:${cid}';go('wpatients')">Ouvrir</button></td></tr>`;
  });
  h += '</tbody></table></div>';

  // Temp patient files
  if (DB.tempPatients.length) {
    h += `<div class="card"><div class="card-t" style="color:var(--orange)">⚠️ Dossiers Temporaires (sans compte citoyen)</div>`;
    DB.tempPatients.forEach((p,i) => {
      h += `<div style="display:flex;justify-content:space-between;align-items:center;padding:.6rem;background:var(--input);border:1px solid rgba(249,115,22,.2);border-radius:8px;margin-bottom:.4rem">
        <div><div style="font-weight:600;font-size:.88rem"><span class="mono" style="color:var(--orange)">${p.id}</span> — ${p.name}</div>
          <div style="font-size:.78rem;color:var(--t3)">Créé le ${p.created} par ${p.createdBy} — ${p.desc}</div></div>
        <div style="display:flex;gap:.3rem">
          <button class="btn btn-sm btn-blue" onclick="DB._patientView='tmp:${i}';go('wpatients')">Ouvrir</button>
          <button class="btn btn-sm btn-outline" onclick="modalLinkTempPatient(${i})" title="Lier à un citoyen">🔗</button>
        </div></div>`;
    });
    h += '</div>';
  }
  return h;
}

function pWPatientDetail(id, isTemp) {
  let rec, name, patId;
  if (isTemp) {
    const p = DB.tempPatients[parseInt(id)];
    if (!p) { DB._patientView=null; return pWPatients(); }
    rec = { blood:'?', allergies:'Non renseigné', height:'?', weight:'?', emergency:'Non renseigné', conditions:'Non renseigné', history: p.history };
    name = p.name; patId = p.id;
  } else {
    rec = DB.healthRecords[id];
    if (!rec) { DB._patientView=null; return pWPatients(); }
    const cit = DB.citizens.find(c=>c.id===id);
    name = cit ? cit.name : id; patId = id;
  }

  let h = `<div style="margin-bottom:.8rem"><button class="btn btn-sm btn-outline" onclick="DB._patientView=null;go('wpatients')">← Retour</button></div>`;
  h += `<div style="margin-bottom:1rem;display:flex;align-items:center;gap:.8rem">
    <div style="font-size:2rem">🏥</div>
    <div><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.4rem;font-weight:700">${name}</h1>
    <p style="color:var(--t2);font-size:.82rem">${patId} ${isTemp?'<span class="badge b-orange">Temporaire</span>':''}</p></div>
  </div>`;

  // Profile
  h += `<div class="card"><div class="card-t" style="justify-content:space-between">👤 Profil Médical ${!isTemp?`<button class="btn btn-sm btn-outline" onclick="modalEditMedProfile('${id}')">✏️ Modifier</button>`:''}</div>
    <div class="health-profile">
      <div class="health-row"><span>Groupe sanguin</span><strong style="color:var(--red)">${rec.blood}</strong></div>
      <div class="health-row"><span>Allergies</span><strong style="color:var(--orange)">${rec.allergies}</strong></div>
      <div class="health-row"><span>Taille</span><strong>${rec.height}</strong></div>
      <div class="health-row"><span>Poids</span><strong>${rec.weight}</strong></div>
      <div class="health-row"><span>Contact urgence</span><strong style="font-size:.8rem">${rec.emergency}</strong></div>
      <div class="health-row"><span>Pathologies</span><strong style="font-size:.8rem">${rec.conditions}</strong></div>
    </div></div>`;

  // Add entry button
  h += `<div class="card"><div class="card-t" style="justify-content:space-between">📋 Historique des Soins <button class="btn btn-sm btn-green" onclick="modalAddSoin('${id}',${isTemp})">+ Ajouter un Soin</button></div><div style="margin-top:.3rem">`;
  if (!rec.history.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucun soin enregistré.</p>';
  rec.history.forEach(e => {
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

function searchPatient() {
  const q = document.getElementById('patSearch').value.trim().toLowerCase();
  const el = document.getElementById('patSearchResult');
  if (!q) { el.innerHTML=''; return; }
  // Search in citizens
  const results = DB.citizens.filter(c => c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  if (!results.length) {
    el.innerHTML = `<div style="padding:.5rem .7rem;background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.2);border-radius:6px;font-size:.83rem;color:var(--orange)">❌ Aucun citoyen trouvé pour "${q}"<br><span style="font-size:.78rem;color:var(--t3)">Vous pouvez créer un dossier temporaire si le patient n'a pas de compte.</span></div>`;
    return;
  }
  let h = '';
  results.forEach(c => {
    const hasRecord = !!DB.healthRecords[c.id];
    h += `<div style="display:flex;justify-content:space-between;align-items:center;padding:.5rem .7rem;background:var(--input);border-radius:6px;margin-bottom:.3rem">
      <div><strong>${c.name}</strong> <span class="mono" style="font-size:.75rem;color:var(--t3)">${c.id}</span> ${hasRecord?'<span class="badge b-green">Dossier existant</span>':'<span class="badge b-orange">Pas de dossier</span>'}</div>
      <div style="display:flex;gap:.3rem">
        ${hasRecord?`<button class="btn btn-sm btn-blue" onclick="DB._patientView='cit:${c.id}';go('wpatients')">Ouvrir</button>`:`<button class="btn btn-sm btn-green" onclick="createNewPatientRecord('${c.id}')">Créer le dossier</button>`}
      </div></div>`;
  });
  el.innerHTML = h;
}

function createNewPatientRecord(citizenId) {
  DB.healthRecords[citizenId] = { blood:'?', allergies:'Non renseigné', height:'?', weight:'?', emergency:'Non renseigné', conditions:'Aucune connue', history:[] };
  toast('Dossier créé pour ' + citizenId);
  DB._patientView = 'cit:' + citizenId;
  go('wpatients');
}

function modalCreateTempPatient() {
  modal(`<div class="modal-t">⚠️ Créer un Dossier Temporaire</div>
    <p style="font-size:.82rem;color:var(--orange);margin-bottom:.8rem">Pour un patient sans compte citoyen. Le dossier pourra être lié à un citoyen plus tard.</p>
    <div class="fg"><label>Nom / Description du patient</label><input id="tpName" placeholder="Ex: Homme ~30 ans, blessé Vinewood"></div>
    <div class="fg"><label>Détails supplémentaires</label><input id="tpDesc" placeholder="Circonstances, lieu trouvé..."></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="const n=document.getElementById('tpName').value||'Patient inconnu';DB.tempPatients.push({id:'TEMP-'+Math.floor(100+Math.random()*900),name:n,desc:document.getElementById('tpDesc').value||'—',created:new Date().toLocaleDateString('fr-FR'),createdBy:DB.user.name,history:[]});closeModal();toast('Dossier temporaire créé');go('wpatients')">Créer</button></div>`);
}

function modalLinkTempPatient(tmpIdx) {
  const p = DB.tempPatients[tmpIdx];
  const citOpts = DB.citizens.map(c=>`<option value="${c.id}">${c.name} (${c.id})</option>`).join('');
  modal(`<div class="modal-t">🔗 Lier à un Citoyen — ${p.name}</div>
    <p style="font-size:.82rem;color:var(--t2);margin-bottom:.8rem">Transférer ce dossier temporaire vers le carnet de santé d'un citoyen inscrit.</p>
    <div class="fg"><label>Citoyen</label><select id="linkCit">${citOpts}</select></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="linkTempToCitizen(${tmpIdx})">Lier</button></div>`);
}

function linkTempToCitizen(tmpIdx) {
  const p = DB.tempPatients[tmpIdx];
  const cid = document.getElementById('linkCit').value;
  if (!DB.healthRecords[cid]) DB.healthRecords[cid] = { blood:'?', allergies:'Non renseigné', height:'?', weight:'?', emergency:'Non renseigné', conditions:'Aucune connue', history:[] };
  // Transfer history
  p.history.forEach(h => DB.healthRecords[cid].history.unshift(h));
  DB.tempPatients.splice(tmpIdx, 1);
  const cit = DB.citizens.find(c=>c.id===cid);
  closeModal(); toast('Dossier transféré vers ' + (cit?cit.name:cid));
  DB._patientView = 'cit:' + cid;
  go('wpatients');
}

function modalAddSoin(id, isTemp) {
  const types = ['Consultation','Soins','Opération','Analyse','Urgence','Vaccination','Rééducation'].map(t=>`<option>${t}</option>`).join('');
  const badges = {'Consultation':'b-green','Soins':'b-red','Opération':'b-purple','Analyse':'b-blue','Urgence':'b-orange','Vaccination':'b-cyan','Rééducation':'b-gold'};
  modal(`<div class="modal-t">💉 Ajouter un Soin</div>
    <div class="row"><div class="fg"><label>Type</label><select id="sType">${types}</select></div><div class="fg"><label>Docteur</label><input id="sDoc" value="${DB.user.name}"></div></div>
    <div class="fg"><label>Titre / Diagnostic</label><input id="sTitle" placeholder="Ex: Fracture du bras droit"></div>
    <div class="fg"><label>Notes / Traitement</label><textarea id="sNotes" placeholder="Détail des soins, prescriptions..."></textarea></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="doAddSoin('${id}',${isTemp})">Enregistrer</button></div>`);
}

function doAddSoin(id, isTemp) {
  const type = document.getElementById('sType').value;
  const title = document.getElementById('sTitle').value || 'Soin';
  const doctor = document.getElementById('sDoc').value || DB.user.name;
  const notes = document.getElementById('sNotes').value || '—';
  const badges = {'Consultation':'b-green','Soins':'b-red','Opération':'b-purple','Analyse':'b-blue','Urgence':'b-orange','Vaccination':'b-cyan','Rééducation':'b-gold'};
  const entry = { date: new Date().toLocaleDateString('fr-FR'), type, title, doctor, notes, badge: badges[type]||'b-blue' };

  if (isTemp) {
    const p = DB.tempPatients[parseInt(id)];
    if (p) p.history.unshift(entry);
  } else {
    if (DB.healthRecords[id]) DB.healthRecords[id].history.unshift(entry);
  }
  closeModal(); toast('Soin enregistré'); go('wpatients');
}

function modalEditMedProfile(citizenId) {
  const rec = DB.healthRecords[citizenId];
  if (!rec) return;
  modal(`<div class="modal-t">✏️ Modifier le Profil Médical</div>
    <div class="row"><div class="fg"><label>Groupe sanguin</label><select id="epBlood"><option ${rec.blood==='O+'?'selected':''}>O+</option><option ${rec.blood==='O-'?'selected':''}>O-</option><option ${rec.blood==='A+'?'selected':''}>A+</option><option ${rec.blood==='A-'?'selected':''}>A-</option><option ${rec.blood==='B+'?'selected':''}>B+</option><option ${rec.blood==='B-'?'selected':''}>B-</option><option ${rec.blood==='AB+'?'selected':''}>AB+</option><option ${rec.blood==='AB-'?'selected':''}>AB-</option><option ${rec.blood==='?'?'selected':''}>?</option></select></div><div class="fg"><label>Allergies</label><input id="epAllerg" value="${rec.allergies}"></div></div>
    <div class="row"><div class="fg"><label>Taille</label><input id="epHeight" value="${rec.height}"></div><div class="fg"><label>Poids</label><input id="epWeight" value="${rec.weight}"></div></div>
    <div class="fg"><label>Contact d'urgence</label><input id="epEmerg" value="${rec.emergency}"></div>
    <div class="fg"><label>Pathologies / Conditions</label><input id="epCond" value="${rec.conditions}"></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="const r=DB.healthRecords['${citizenId}'];r.blood=document.getElementById('epBlood').value;r.allergies=document.getElementById('epAllerg').value;r.height=document.getElementById('epHeight').value;r.weight=document.getElementById('epWeight').value;r.emergency=document.getElementById('epEmerg').value;r.conditions=document.getElementById('epCond').value;closeModal();toast('Profil mis à jour');go('wpatients')">Sauvegarder</button></div>`);
}

// ============ WORK: STOCK ============
function pWStock() {
  if (!DB.job) return '';
  const j = DB.job, items = j.stock;
  const alerts = items.filter(s => s.qty < s.min);
  const cats = [...new Set(items.map(s=>s.cat))];

  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">📦 Gestion du Stock</h1><p style="color:var(--t2);font-size:.82rem">${items.length} articles — ${alerts.length} alerte${alerts.length>1?'s':''}</p></div>`;

  h += `<div class="stats">
    <div class="stat"><div class="stat-l">Articles</div><div class="stat-v" style="color:var(--blue)">${items.length}</div></div>
    <div class="stat"><div class="stat-l">Catégories</div><div class="stat-v" style="color:var(--purple)">${cats.length}</div></div>
    <div class="stat"><div class="stat-l">Alertes</div><div class="stat-v" style="color:${alerts.length?'var(--red)':'var(--green)'}">${alerts.length}</div><div class="stat-s">${alerts.length?'Réappro. requis':'Tout OK'}</div></div>
  </div>`;

  // Alerts
  if (alerts.length) {
    h += `<div class="card" style="border-color:rgba(239,68,68,.3)"><div class="card-t" style="color:var(--red)">⚠️ Alertes de Seuil</div>`;
    alerts.forEach(s => {
      const pct = Math.round(s.qty / s.min * 100);
      h += `<div style="display:flex;align-items:center;gap:.8rem;padding:.5rem 0;border-bottom:1px solid rgba(30,41,59,.3)">
        <span style="font-size:1.2rem">${s.emoji}</span>
        <div style="flex:1"><div style="font-weight:600;font-size:.88rem">${s.name}</div><div style="font-size:.75rem;color:var(--t3)">${s.cat}${s.notes?' — '+s.notes:''}</div></div>
        <div style="text-align:right"><div class="mono" style="color:var(--red);font-weight:600">${s.qty} ${s.unit}</div><div style="font-size:.7rem;color:var(--t3)">Seuil: ${s.min}</div></div>
        <div style="width:60px;height:6px;background:var(--input);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${pct<50?'var(--red)':'var(--orange)'};border-radius:3px"></div></div>
      </div>`;
    });
    h += '</div>';
  }

  // Full table
  h += `<div class="card"><div class="card-t" style="justify-content:space-between">📋 Inventaire Complet
    <button class="btn btn-sm btn-blue" onclick="modalAddStock()">+ Ajouter</button></div>
    <table><thead><tr><th></th><th>Article</th><th>Cat.</th><th>Qté</th><th>Seuil</th><th>État</th><th>Actions</th></tr></thead><tbody>`;
  items.forEach((s,i) => {
    const status = s.qty >= s.min ? 'ok' : s.qty >= s.min * 0.5 ? 'low' : 'critical';
    const bc = status==='ok'?'b-green':status==='low'?'b-orange':'b-red';
    const lb = status==='ok'?'OK':status==='low'?'Bas':'Critique';
    h += `<tr>
      <td>${s.emoji}</td>
      <td style="font-weight:500">${s.name}${s.notes?`<div style="font-size:.72rem;color:var(--t3);margin-top:.1rem;font-style:italic">📝 ${s.notes}</div>`:''}</td>
      <td><span class="badge b-blue">${s.cat}</span></td>
      <td class="mono">${s.qty} ${s.unit}</td>
      <td class="mono" style="color:var(--t3)">${s.min}</td>
      <td><span class="badge ${bc}">${lb}</span></td>
      <td><div style="display:flex;gap:.2rem">
        <button class="btn btn-sm btn-green" onclick="modalRestockItem(${i})" title="Réappro">📦</button>
        <button class="btn btn-sm btn-outline" onclick="modalEditStock(${i})" title="Modifier">✏️</button>
        <button class="btn btn-sm btn-red" onclick="confirmDel('Supprimer '+'${s.name}'+' du stock ?',function(){DB.job.stock.splice(${i},1);toast('Article supprimé');go('wstock')})" style="padding:.2rem .4rem">✕</button>
      </div></td>
    </tr>`;
  });
  h += '</tbody></table></div>';
  return h;
}

function modalAddStock() {
  modal(`<div class="modal-t">📦 Ajouter un Article au Stock</div>
    <div class="row"><div class="fg"><label>Nom</label><input id="asName" placeholder="Ex: Essence Premium"></div><div class="fg"><label>Emoji</label><input id="asEmoji" value="📦" style="width:60px"></div></div>
    <div class="row"><div class="fg"><label>Quantité</label><input type="number" id="asQty" value="0"></div><div class="fg"><label>Unité</label><input id="asUnit" placeholder="pcs, L, kg"></div></div>
    <div class="row"><div class="fg"><label>Seuil d'alerte</label><input type="number" id="asMin" value="10"></div><div class="fg"><label>Catégorie</label><input id="asCat" placeholder="Ex: Mécanique"></div></div>
    <div class="fg"><label>📝 Notes</label><input id="asNotes" placeholder="Fournisseur, remarques, infos..."></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="DB.job.stock.push({id:Date.now(),name:document.getElementById('asName').value||'Nouveau',qty:parseInt(document.getElementById('asQty').value)||0,unit:document.getElementById('asUnit').value||'pcs',min:parseInt(document.getElementById('asMin').value)||10,cat:document.getElementById('asCat').value||'Autre',emoji:document.getElementById('asEmoji').value||'📦',notes:document.getElementById('asNotes').value||''});closeModal();toast('Article ajouté');go('wstock')">Ajouter</button></div>`);
}

function modalEditStock(idx) {
  const s = DB.job.stock[idx];
  modal(`<div class="modal-t">✏️ Modifier — ${s.name}</div>
    <div class="row"><div class="fg"><label>Nom</label><input id="esName" value="${s.name}"></div><div class="fg"><label>Emoji</label><input id="esEmoji" value="${s.emoji}" style="width:60px"></div></div>
    <div class="row"><div class="fg"><label>Quantité</label><input type="number" id="esQty" value="${s.qty}"></div><div class="fg"><label>Unité</label><input id="esUnit" value="${s.unit}"></div></div>
    <div class="row"><div class="fg"><label>Seuil d'alerte</label><input type="number" id="esMin" value="${s.min}"></div><div class="fg"><label>Catégorie</label><input id="esCat" value="${s.cat}"></div></div>
    <div class="fg"><label>📝 Notes</label><input id="esNotes" value="${s.notes||''}"></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="const s=DB.job.stock[${idx}];s.name=document.getElementById('esName').value;s.emoji=document.getElementById('esEmoji').value;s.qty=parseInt(document.getElementById('esQty').value)||0;s.unit=document.getElementById('esUnit').value;s.min=parseInt(document.getElementById('esMin').value)||0;s.cat=document.getElementById('esCat').value;s.notes=document.getElementById('esNotes').value;closeModal();toast('Stock mis à jour');go('wstock')">Sauvegarder</button></div>`);
}

function modalRestockItem(idx) {
  const s = DB.job.stock[idx];
  modal(`<div class="modal-t">📦 Réapprovisionner — ${s.emoji} ${s.name}</div>
    <div style="padding:.5rem .7rem;background:var(--input);border-radius:6px;margin-bottom:.8rem;font-size:.85rem">Stock actuel: <strong class="mono" style="color:${s.qty<s.min?'var(--red)':'var(--green)'}">${s.qty} ${s.unit}</strong> — Seuil: ${s.min}</div>
    <div class="fg"><label>Quantité à ajouter</label><input type="number" id="rsQty" placeholder="0"></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="const q=parseInt(document.getElementById('rsQty').value)||0;DB.job.stock[${idx}].qty+= q;closeModal();toast('+'+q+' ${s.unit} ajouté(s)');go('wstock')">Réapprovisionner</button></div>`);
}

// ============ WORK: ARTICLES CAISSE ============
function pWArticles() {
  if (!DB.job) return '';
  const items = DB.job.pos;

  let h = `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem">
    <div><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">🏷️ Articles de la Caisse</h1><p style="color:var(--t2);font-size:.82rem">${items.length} articles — TVA ${DB.taxConfig.tva}%</p></div>
    <button class="btn btn-sm btn-blue" onclick="modalAddArticle2()">+ Nouvel Article</button>
  </div>`;

  h += '<div class="card"><table><thead><tr><th></th><th>Article</th><th>Prix HT</th><th>Prix TTC</th><th>Actions</th></tr></thead><tbody>';
  items.forEach((it,i) => {
    const ttc = it.price + Math.round(it.price * DB.taxConfig.tva / 100);
    h += `<tr>
      <td style="font-size:1.3rem">${it.emoji}</td>
      <td style="font-weight:600">${it.name}</td>
      <td class="mono" style="color:var(--green)">$${it.price}</td>
      <td class="mono" style="color:var(--gold)">$${ttc}</td>
      <td><div style="display:flex;gap:.2rem">
        <button class="btn btn-sm btn-outline" onclick="modalEditArticle2(${i})">✏️</button>
        <button class="btn btn-sm btn-red" onclick="confirmDel('Supprimer '+'${it.name}'+' ?',function(){DB.job.pos.splice(${i},1);toast('Article supprimé');go('warticles')})" style="padding:.2rem .4rem">✕</button>
      </div></td>
    </tr>`;
  });
  h += '</tbody></table></div>';

  // Preview
  h += `<div class="card"><div class="card-t">👁️ Aperçu Caisse</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:.5rem">`;
  items.forEach(it => h += `<div style="background:var(--input);border:1px solid var(--border);border-radius:8px;padding:.7rem;text-align:center"><div style="font-size:1.4rem">${it.emoji}</div><div style="font-size:.74rem;font-weight:500;margin-top:.1rem">${it.name}</div><div class="mono" style="color:var(--green);font-size:.78rem;margin-top:.1rem">$${it.price}</div></div>`);
  h += '</div></div>';
  return h;
}

function modalAddArticle2() {
  modal(`<div class="modal-t">🏷️ Nouvel Article</div>
    <div class="row"><div class="fg"><label>Nom</label><input id="a2Name" placeholder="Ex: Course Express"></div><div class="fg"><label>Emoji</label><input id="a2Emoji" value="🏷️" style="width:60px"></div></div>
    <div class="fg"><label>Prix ($)</label><input type="number" id="a2Price" placeholder="0"></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="const n=document.getElementById('a2Name').value,p=parseInt(document.getElementById('a2Price').value);if(!n||!p){err('Nom et prix requis');return}DB.job.pos.push({name:n,price:p,emoji:document.getElementById('a2Emoji').value||'🏷️'});closeModal();toast(n+' ajouté à la caisse');go('warticles')">Ajouter</button></div>`);
}

function modalEditArticle2(idx) {
  const it = DB.job.pos[idx];
  modal(`<div class="modal-t">✏️ Modifier — ${it.name}</div>
    <div class="row"><div class="fg"><label>Nom</label><input id="e2Name" value="${it.name}"></div><div class="fg"><label>Emoji</label><input id="e2Emoji" value="${it.emoji}" style="width:60px"></div></div>
    <div class="fg"><label>Prix ($)</label><input type="number" id="e2Price" value="${it.price}"></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="const it=DB.job.pos[${idx}];it.name=document.getElementById('e2Name').value;it.emoji=document.getElementById('e2Emoji').value;it.price=parseInt(document.getElementById('e2Price').value)||0;closeModal();toast('Article mis à jour');go('warticles')">Sauvegarder</button></div>`);
}

// ============ WORK: TEAM ============
// ============ SERVICE LOG ============
function toggleService() {
  if (!DB.job) return;
  if (!DB.job.serviceLog) DB.job.serviceLog = [];
  const now = new Date();
  const time = now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  const date = now.toLocaleDateString('fr-FR');
  if (!DB.onDuty) {
    // Clock in
    DB.onDuty = time;
    DB.job.serviceLog.unshift({id:Date.now(), empId:DB.user.id, empName:DB.user.name, type:'in', date:date, time:time});
    toast('En service !');
  } else {
    // Clock out — calculate duration
    DB.job.serviceLog.unshift({id:Date.now(), empId:DB.user.id, empName:DB.user.name, type:'out', date:date, time:time, startedAt:DB.onDuty});
    DB.onDuty = false;
    toast('Fin de service');
  }
  // Keep max 200 entries
  if (DB.job.serviceLog.length > 200) DB.job.serviceLog.length = 200;
  go('wdash');
}

function pWService() {
  if (!DB.job) return '';
  if (!DB.job.serviceLog) DB.job.serviceLog = [];
  const log = DB.job.serviceLog;
  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">📋 Relevé de Service</h1><p style="color:var(--t2);font-size:.82rem">${log.length} événements enregistrés</p></div>`;

  // Current status of each employee
  h += '<div class="card"><div class="card-t">👥 Statut Actuel des Employés</div>';
  const activeEmps = DB.job.employees.filter(function(e){return e.status==='active'});
  if (!activeEmps.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucun employé actif.</p>';
  activeEmps.forEach(function(emp) {
    // Find last log entry for this employee
    const lastIn = log.find(function(l){return l.empId===emp.id && l.type==='in'});
    const lastOut = log.find(function(l){return l.empId===emp.id && l.type==='out'});
    let status = 'Jamais pointé';
    let statusColor = 'var(--t3)';
    let badge = 'b-orange';
    if (lastIn && (!lastOut || lastIn.id > lastOut.id)) {
      status = '🟢 En service depuis ' + lastIn.time + ' (' + lastIn.date + ')';
      statusColor = 'var(--green)';
      badge = 'b-green';
    } else if (lastOut) {
      status = '⚫ Hors service (dernier: ' + lastOut.startedAt + ' → ' + lastOut.time + ')';
      statusColor = 'var(--t3)';
      badge = 'b-red';
    }
    h += `<div style="display:flex;justify-content:space-between;align-items:center;padding:.5rem .7rem;background:var(--input);border-radius:7px;margin-bottom:.3rem">
      <div><strong style="font-size:.88rem">${emp.name}</strong> <span class="mono" style="font-size:.72rem;color:var(--t3)">${emp.id}</span>
      <div style="font-size:.72rem;color:var(--t3)">${DB.job.grades[emp.grade]?.name||'—'}</div></div>
      <div style="text-align:right"><span class="badge ${badge}" style="font-size:.7rem">${lastIn && (!lastOut || lastIn.id > lastOut.id) ? 'En service' : 'Hors service'}</span>
      <div style="font-size:.7rem;color:${statusColor};margin-top:.15rem">${lastIn ? lastIn.date + ' ' + lastIn.time : 'Aucun pointage'}</div></div>
    </div>`;
  });
  h += '</div>';

  // Log history
  h += '<div class="card"><div class="card-t">📜 Historique des Pointages (50 derniers)</div>';
  if (!log.length) h += '<p style="color:var(--t3);font-size:.83rem">Aucun pointage enregistré.</p>';
  h += '<table><thead><tr><th>Date</th><th>Heure</th><th>Employé</th><th>Action</th><th>Détail</th></tr></thead><tbody>';
  log.slice(0, 50).forEach(function(l) {
    h += `<tr>
      <td style="font-size:.8rem">${l.date}</td>
      <td class="mono" style="font-size:.8rem">${l.time}</td>
      <td style="font-size:.85rem">${l.empName} <span class="mono" style="font-size:.68rem;color:var(--t3)">${l.empId}</span></td>
      <td><span class="badge ${l.type==='in'?'b-green':'b-red'}">${l.type==='in'?'▶ Prise de service':'⏹ Fin de service'}</span></td>
      <td style="font-size:.78rem;color:var(--t3)">${l.type==='out' && l.startedAt ? 'Service: '+l.startedAt+' → '+l.time : ''}</td>
    </tr>`;
  });
  h += '</tbody></table></div>';
  return h;
}

// ============ WORK: TEAM ============
function pWTeam() {
  if (!DB.job) return '';
  const j = DB.job, myGrade = j.grades[j.gradeIndex];
  const thisWeek = j.weeklyHistory.length ? j.weeklyHistory[0].data : {};
  const totalInvoiced = Object.values(thisWeek).reduce((s,d) => s + d.invoiced, 0);

  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">👥 Gestion d'Équipe</h1><p style="color:var(--t2);font-size:.82rem">${j.employees.filter(e=>e.status==='active').length} employés actifs</p></div>`;
  h += `<div class="stats">
    <div class="stat"><div class="stat-l">Effectif</div><div class="stat-v" style="color:var(--blue)">${j.employees.filter(e=>e.status==='active').length}</div></div>
    <div class="stat"><div class="stat-l">Facturé cette sem.</div><div class="stat-v" style="color:var(--green)">$${totalInvoiced.toLocaleString()}</div></div>
    <div class="stat"><div class="stat-l">Grades</div><div class="stat-v" style="color:var(--purple)">${j.grades.length}</div></div>
  </div>`;
  if (myGrade.canHire) h += `<div style="margin-bottom:.8rem"><button class="btn btn-sm btn-blue" onclick="modalHire()">+ Embaucher manuellement</button></div>`;
  h += '<div class="card" style="overflow-x:auto"><table><thead><tr><th>ID</th><th>Nom</th><th>Grade</th><th>Rémunération</th><th>Facturé (sem.)</th><th>Salaire est.</th><th>Depuis</th>';
  if (myGrade.canFire) h += '<th>Action</th>';
  h += '</tr></thead><tbody>';
  j.employees.filter(e=>e.status==='active').forEach(e => {
    const eg = j.grades[e.grade];
    const wd = thisWeek[e.id] || {invoiced:0, count:0};
    const estPay = calcWeekPay(e.grade, wd.invoiced);
    h += `<tr><td class="mono" style="font-size:.74rem">${e.id}</td><td style="font-weight:500">${e.name}<div style="font-size:.7rem;color:var(--t3)">${e.phone}</div></td><td><span class="badge b-gold">${eg.name}</span></td><td style="font-size:.78rem">${getPayLabel(eg)}</td><td class="mono" style="color:var(--blue)">$${wd.invoiced.toLocaleString()} <span style="color:var(--t3);font-size:.7rem">(${wd.count})</span></td><td class="mono" style="color:var(--green);font-weight:600">$${estPay.toLocaleString()}</td><td style="font-size:.78rem">${e.hired}</td>`;
    if (myGrade.canFire) h += `<td><div style="display:flex;gap:.2rem"><button class="btn btn-sm btn-outline" onclick="modalPromote('${e.id}')">⬆</button><button class="btn btn-sm btn-red" onclick="fireEmployee('${e.id}','${e.name}')">🚫</button></div></td>`;
    h += '</tr>';
  });
  h += '</tbody></table></div>';
  return h;
}
function modalHire() {
  const opts = DB.job.grades.map((g,i)=>`<option value="${i}">${g.name} — ${getPayLabel(g)}</option>`).join('');
  modal(`<div class="modal-t">➕ Embaucher un Employé</div>
    <div class="fg"><label>ID Citoyen du joueur</label>
      <div style="display:flex;gap:.4rem"><input id="hId" placeholder="SA-XXXX" style="flex:1"><button class="btn btn-sm btn-blue" onclick="lookupCitizen()">🔍 Rechercher</button></div>
    </div>
    <div id="hLookupResult" style="margin-bottom:.8rem"></div>
    <div class="fg"><label>Grade d'embauche</label><select id="hGrade">${opts}</select></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="doHire()">Embaucher</button></div>`);
}
function lookupCitizen() {
  const id = document.getElementById('hId').value.trim();
  const c = DB.citizens.find(x => x.id === id);
  const el = document.getElementById('hLookupResult');
  if (!c) { el.innerHTML = '<div style="padding:.5rem .7rem;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:6px;font-size:.83rem;color:var(--red)">❌ Aucun citoyen trouvé avec l\'ID: ' + id + '</div>'; return; }
  el.innerHTML = `<div style="padding:.5rem .7rem;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:6px;font-size:.85rem">✅ <strong>${c.name}</strong> <span class="mono" style="font-size:.75rem;color:var(--t3)">${c.id}</span> — 📞 ${c.phone}${c.job ? '<br><span style="font-size:.78rem;color:var(--orange)">⚠️ Déjà employé chez ' + c.job + '</span>' : '<br><span style="font-size:.78rem;color:var(--green)">✓ Disponible</span>'}</div>`;
}
function doHire() {
  const id = document.getElementById('hId').value.trim();
  const c = DB.citizens.find(x => x.id === id);
  if (!c) { err('Entrez un ID citoyen valide et recherchez-le d\'abord.'); return; }
  const grade = parseInt(document.getElementById('hGrade').value);
  DB.job.employees.push({ id: c.id, name: c.name, grade, phone: c.phone, hired: new Date().toLocaleDateString('fr-FR'), status: 'active' });
  // Update citizen registry
  c.job = DB.job.company;
  c.role = DB.job.grades[grade].name;
  // Update gov enterprise employee count
  const ent = DB.enterprises.find(e=>e.name===DB.job.company);
  if (ent) ent.employees = DB.job.employees.filter(e=>e.status==='active').length;
  closeModal(); toast(c.name + ' embauché !'); go('wteam');
}
function fireEmployee(empId, empName) {
  modal(`<div class="modal-t">🚫 Révoquer ${empName} ?</div>
    <p style="font-size:.88rem;color:var(--t2)">Cette action mettra fin à son contrat de travail. Il conservera son historique de salaires.</p>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-red" onclick="doFire('${empId}','${empName}')">Confirmer le licenciement</button></div>`);
}
function doFire(empId, empName) {
  // Update enterprise employee list
  const emp = DB.job.employees.find(x=>x.id===empId);
  if (emp) emp.status = 'inactive';
  // Update citizen registry — remove job
  const cit = DB.citizens.find(c=>c.id===empId);
  if (cit) { cit.job = null; cit.role = null; }
  // Update enterprise employee count in gov
  const ent = DB.enterprises.find(e=>e.name===DB.job.company);
  if (ent) ent.employees = DB.job.employees.filter(e=>e.status==='active').length;
  closeModal();
  toast(empName + ' a été révoqué');
  go('wteam');
}
function modalPromote(empId) {
  const e = DB.job.employees.find(x=>x.id===empId);
  const opts = DB.job.grades.map((g,i)=>`<option value="${i}" ${i===e.grade?'selected':''}>${g.name} (${g.commission}%)</option>`).join('');
  modal(`<div class="modal-t">⬆ Changer le grade de ${e.name}</div>
    <div class="fg"><label>Nouveau grade</label><select id="pGrade">${opts}</select></div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="e=DB.job.employees.find(x=>x.id==='${empId}');e.grade=parseInt(document.getElementById('pGrade').value);closeModal();toast(e.name+' → '+DB.job.grades[e.grade].name);go('wteam')">Appliquer</button></div>`);
}

// ============ WORK: GRADES ============
function pWGrades() {
  if (!DB.job) return '';
  const j = DB.job, myGrade = j.grades[j.gradeIndex];
  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">⚙️ Configuration des Grades</h1><p style="color:var(--t2);font-size:.82rem">${j.grades.length} grades configurés</p></div>`;
  if (myGrade.canEditGrades) h += `<div style="margin-bottom:.8rem"><button class="btn btn-sm btn-blue" onclick="modalNewGrade()">+ Créer un Grade</button></div>`;
  h += '<div class="card" style="overflow-x:auto"><table><thead><tr><th>#</th><th>Nom</th><th>Rémunération</th><th>Prime</th><th>Caisse</th><th>Stock</th><th>Gestion</th>';
  if (myGrade.canEditGrades) h += '<th>Action</th>';
  h += '</tr></thead><tbody>';
  j.grades.forEach((g,i) => {
    h += `<tr><td>${i+1}</td><td style="font-weight:600"><span class="badge b-gold">${g.name}</span></td><td style="font-size:.8rem">${getPayLabel(g)}</td><td class="mono" style="color:${g.prime?'var(--purple)':'var(--t3)'}">${g.prime?'+$'+g.prime:'—'}</td><td>${g.canPOS?'<span class="badge b-green">Oui</span>':'<span class="badge b-red">Non</span>'}</td><td>${g.canStock?'<span class="badge b-green">Oui</span>':'<span class="badge b-red">Non</span>'}</td><td>${g.canManage?'<span class="badge b-green">Oui</span>':'<span class="badge b-red">Non</span>'}</td>`;
    if (myGrade.canEditGrades) h += `<td><button class="btn btn-sm btn-outline" onclick="modalEditGrade(${i})">✏️</button></td>`;
    h += '</tr>';
  });
  h += '</tbody></table></div>';
  h += `<div class="card"><div class="card-t">📊 Répartition des Effectifs par Grade</div>`;
  j.grades.forEach(g => {
    const count = j.employees.filter(e=>e.status==='active'&&j.grades[e.grade]?.name===g.name).length;
    const total = j.employees.filter(e=>e.status==='active').length;
    h += `<div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.4rem">
      <span style="min-width:120px;font-size:.83rem;font-weight:500">${g.name}</span>
      <div style="flex:1;height:20px;background:var(--input);border-radius:4px;overflow:hidden"><div style="height:100%;width:${total?count/total*100:0}%;background:var(--gold);border-radius:4px;transition:width .3s"></div></div>
      <span class="mono" style="font-size:.8rem;min-width:20px;text-align:right">${count}</span>
    </div>`;
  });
  h += '</div>';
  return h;
}
function modalNewGrade() {
  modal(`<div class="modal-t">➕ Créer un Grade</div>
    <div class="fg"><label>Nom du grade</label><input id="ngName" placeholder="Ex: Chef d'équipe"></div>
    <div class="fg"><label>Type de rémunération</label><select id="ngPayType"><option value="commission">Commission uniquement</option><option value="fixe">Salaire fixe uniquement</option><option value="both">Fixe + Commission</option></select></div>
    <div class="row"><div class="fg"><label>Salaire fixe ($/sem)</label><input id="ngFixe" type="number" value="0"></div><div class="fg"><label>Commission (%)</label><input id="ngComm" type="number" value="12"></div><div class="fg"><label>Prime hebdo ($)</label><input id="ngPrime" type="number" value="0"></div></div>
    <div style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:.8rem">
      <label>Permissions</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="ngManage"> Accès gestion (équipe, compta)</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="ngPOS" checked> Accès caisse enregistreuse</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="ngHire"> Peut embaucher</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="ngFire"> Peut licencier</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="ngStock"> Accès stock</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="ngArticles"> Gérer les articles (caisse)</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="ngPatients"> Dossiers patients (EMS)</label>
    </div>
    <div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-green" onclick="const n=document.getElementById('ngName').value||'Nouveau';DB.job.grades.push({name:n,payType:document.getElementById('ngPayType').value,fixe:parseInt(document.getElementById('ngFixe').value)||0,commission:parseInt(document.getElementById('ngComm').value)||0,prime:parseInt(document.getElementById('ngPrime').value)||0,canManage:document.getElementById('ngManage').checked,canHire:document.getElementById('ngHire').checked,canFire:document.getElementById('ngFire').checked,canEditGrades:false,canStock:document.getElementById('ngStock').checked,canArticles:document.getElementById('ngArticles').checked,canPatients:document.getElementById('ngPatients').checked,canPOS:document.getElementById('ngPOS').checked});closeModal();toast('Grade «'+n+'» créé');go('wgrades')">Créer</button></div>`);
}
function modalEditGrade(idx) {
  const g = DB.job.grades[idx];
  modal(`<div class="modal-t">✏️ Modifier — ${g.name}</div>
    <div class="fg"><label>Nom</label><input id="egName" value="${g.name}"></div>
    <div class="fg"><label>Type de rémunération</label><select id="egPayType"><option value="commission" ${g.payType==='commission'?'selected':''}>Commission uniquement</option><option value="fixe" ${g.payType==='fixe'?'selected':''}>Salaire fixe uniquement</option><option value="both" ${g.payType==='both'?'selected':''}>Fixe + Commission</option></select></div>
    <div class="row"><div class="fg"><label>Fixe ($/sem)</label><input id="egFixe" type="number" value="${g.fixe||0}"></div><div class="fg"><label>Commission (%)</label><input id="egComm" type="number" value="${g.commission||0}"></div><div class="fg"><label>Prime ($)</label><input id="egPrime" type="number" value="${g.prime||0}"></div></div>
    <div style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:.8rem">
      <label>Permissions</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="egManage" ${g.canManage?'checked':''}> Accès gestion</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="egPOS" ${g.canPOS?'checked':''}> Accès caisse</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="egHire" ${g.canHire?'checked':''}> Peut embaucher</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="egFire" ${g.canFire?'checked':''}> Peut licencier</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="egEditGrades" ${g.canEditGrades?'checked':''}> Gérer les grades</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="egStock" ${g.canStock?'checked':''}> Accès stock</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="egArticles" ${g.canArticles?'checked':''}> Gérer les articles</label>
      <label style="display:flex;align-items:center;gap:.4rem;font-size:.83rem;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="egPatients" ${g.canPatients?'checked':''}> Dossiers patients (EMS)</label>
    </div>
    <div class="modal-acts">${idx>0?`<button class="btn btn-sm btn-red" onclick="DB.job.grades.splice(${idx},1);DB.job.employees.forEach(e=>{if(e.grade>=${idx})e.grade=Math.max(0,e.grade-1)});closeModal();toast('Grade supprimé');go('wgrades')">Supprimer</button>`:''}<button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="saveGradeEdit(${idx})">Sauvegarder</button></div>`);
}
function saveGradeEdit(idx) {
  var g = DB.job.grades[idx];
  g.name = document.getElementById('egName').value || g.name;
  g.payType = document.getElementById('egPayType').value;
  g.fixe = parseInt(document.getElementById('egFixe').value) || 0;
  g.commission = parseInt(document.getElementById('egComm').value) || 0;
  g.prime = parseInt(document.getElementById('egPrime').value) || 0;
  g.canManage = document.getElementById('egManage').checked;
  g.canHire = document.getElementById('egHire').checked;
  g.canFire = document.getElementById('egFire').checked;
  g.canEditGrades = document.getElementById('egEditGrades').checked;
  g.canStock = document.getElementById('egStock').checked;
  g.canArticles = document.getElementById('egArticles').checked;
  g.canPatients = document.getElementById('egPatients').checked;
  g.canPOS = document.getElementById('egPOS').checked;
  // Update current user's permissions if editing own grade
  if (idx === DB.job.gradeIndex) DB.job.role = g.name;
  closeModal(); toast('Grade «' + g.name + '» mis à jour'); buildNav(); go('wgrades');
}

// ============ WORK: CANDIDATURES ============
// ============ WORK: INFOS ENTREPRISE ============
function pWInfo() {
  if (!DB.job) return '';
  var j = DB.job;
  if (!j.info) j.info = {rib:'', iban:'', bic:'', siret:'', address:'', phone:'', email:'', notes:''};
  var inf = j.info;
  var h = '<div style="margin-bottom:1rem"><h1 style="font-family:Rajdhani,sans-serif;font-size:1.5rem;font-weight:700">\u{1F3E6} Infos Entreprise</h1><p style="color:var(--t2);font-size:.82rem">' + j.icon + ' ' + j.company + '</p></div>';

  // Bank info card
  h += '<div class="card" style="border-color:rgba(240,180,41,.2)">';
  h += '<div class="card-t" style="justify-content:space-between">\u{1F4B3} Coordonnées Bancaires <button class="btn btn-sm btn-outline" onclick="modalEditEntInfo()">✏\uFE0F Modifier</button></div>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:.6rem">';
  h += '<div style="padding:.6rem .8rem;background:var(--input);border-radius:8px"><div style="font-size:.68rem;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:.2rem">RIB</div><div style="font-family:monospace;font-size:.9rem;font-weight:600;color:var(--gold)">' + (inf.rib || '<span style="color:var(--t3);font-weight:400">Non renseigné</span>') + '</div></div>';
  h += '<div style="padding:.6rem .8rem;background:var(--input);border-radius:8px"><div style="font-size:.68rem;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:.2rem">IBAN</div><div style="font-family:monospace;font-size:.9rem;font-weight:600;color:var(--gold)">' + (inf.iban || '<span style="color:var(--t3);font-weight:400">Non renseigné</span>') + '</div></div>';
  h += '<div style="padding:.6rem .8rem;background:var(--input);border-radius:8px"><div style="font-size:.68rem;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:.2rem">BIC / SWIFT</div><div style="font-family:monospace;font-size:.9rem;font-weight:600">' + (inf.bic || '<span style="color:var(--t3);font-weight:400">Non renseigné</span>') + '</div></div>';
  h += '<div style="padding:.6rem .8rem;background:var(--input);border-radius:8px"><div style="font-size:.68rem;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:.2rem">N° SIRET</div><div style="font-family:monospace;font-size:.9rem;font-weight:600">' + (inf.siret || '<span style="color:var(--t3);font-weight:400">Non renseigné</span>') + '</div></div>';
  h += '</div></div>';

  // Contact info card
  h += '<div class="card"><div class="card-t">\u{1F4DE} Coordonnées</div>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:.6rem">';
  h += '<div style="padding:.6rem .8rem;background:var(--input);border-radius:8px"><div style="font-size:.68rem;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:.2rem">Adresse</div><div style="font-size:.88rem">' + (inf.address || '<span style="color:var(--t3)">Non renseignée</span>') + '</div></div>';
  h += '<div style="padding:.6rem .8rem;background:var(--input);border-radius:8px"><div style="font-size:.68rem;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:.2rem">Téléphone</div><div style="font-size:.88rem;font-family:monospace">' + (inf.phone || '<span style="color:var(--t3)">Non renseigné</span>') + '</div></div>';
  h += '<div style="padding:.6rem .8rem;background:var(--input);border-radius:8px"><div style="font-size:.68rem;color:var(--t3);text-transform:uppercase;letter-spacing:1px;margin-bottom:.2rem">Email</div><div style="font-size:.88rem">' + (inf.email || '<span style="color:var(--t3)">Non renseigné</span>') + '</div></div>';
  h += '</div></div>';

  // Notes card
  h += '<div class="card"><div class="card-t">\u{1F4DD} Notes internes</div>';
  if (inf.notes) h += '<div style="font-size:.88rem;line-height:1.7;white-space:pre-wrap;color:var(--t1)">' + inf.notes + '</div>';
  else h += '<p style="color:var(--t3);font-size:.83rem">Aucune note. Cliquez Modifier pour ajouter des informations.</p>';
  h += '</div>';

  return h;
}
function modalEditEntInfo() {
  var inf = DB.job.info || {rib:'',iban:'',bic:'',siret:'',address:'',phone:'',email:'',notes:''};
  modal('<div class="modal-t">\u{1F3E6} Modifier les Infos Entreprise</div>' +
    '<div class="fg"><label>RIB</label><input id="eiRib" value="' + (inf.rib||'') + '" placeholder="Ex: 30001 00001 1234567890A 12"></div>' +
    '<div class="row"><div class="fg"><label>IBAN</label><input id="eiIban" value="' + (inf.iban||'') + '" placeholder="Ex: FR76 3000 1000 0112 3456 7890 A12"></div><div class="fg"><label>BIC / SWIFT</label><input id="eiBic" value="' + (inf.bic||'') + '" placeholder="Ex: BNPAFRPP"></div></div>' +
    '<div class="fg"><label>N° SIRET</label><input id="eiSiret" value="' + (inf.siret||'') + '" placeholder="Ex: 123 456 789 00012"></div>' +
    '<div class="fg"><label>Adresse</label><input id="eiAddr" value="' + (inf.address||'') + '" placeholder="Ex: 42 Vinewood Blvd, Los Santos"></div>' +
    '<div class="row"><div class="fg"><label>Téléphone</label><input id="eiPhone" value="' + (inf.phone||'') + '" placeholder="555-XXXX"></div><div class="fg"><label>Email</label><input id="eiEmail" value="' + (inf.email||'') + '" placeholder="contact@entreprise.sa"></div></div>' +
    '<div class="fg"><label>Notes internes (RIB employés, fournisseurs, codes...)</label><textarea id="eiNotes" rows="5" placeholder="Informations confidentielles...">' + (inf.notes||'') + '</textarea></div>' +
    '<div class="modal-acts"><button class="btn btn-sm btn-outline" onclick="closeModal()">Annuler</button><button class="btn btn-sm btn-blue" onclick="saveEntInfo()">Sauvegarder</button></div>');
}
function saveEntInfo() {
  if (!DB.job.info) DB.job.info = {};
  DB.job.info.rib = document.getElementById('eiRib').value.trim();
  DB.job.info.iban = document.getElementById('eiIban').value.trim();
  DB.job.info.bic = document.getElementById('eiBic').value.trim();
  DB.job.info.siret = document.getElementById('eiSiret').value.trim();
  DB.job.info.address = document.getElementById('eiAddr').value.trim();
  DB.job.info.phone = document.getElementById('eiPhone').value.trim();
  DB.job.info.email = document.getElementById('eiEmail').value.trim();
  DB.job.info.notes = document.getElementById('eiNotes').value;
  closeModal();
  toast('Informations mises à jour');
  go('winfo');
}

// ============ WORK: CANDIDATURES ============
function pWApps() {
  if (!DB.job) return '';
  let h = `<div style="margin-bottom:1rem"><h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:700">📨 Candidatures Reçues</h1><p style="color:var(--t2);font-size:.82rem">${DB.job.pendingApps.length} en attente</p></div>`;
  if (!DB.job.pendingApps.length) h += '<div class="card"><p style="color:var(--t3);text-align:center;padding:1rem">Aucune candidature en attente</p></div>';
  DB.job.pendingApps.forEach((a,i) => {
    const gradeOpts = DB.job.grades.map((g,gi)=>`<option value="${gi}">${g.name}</option>`).join('');
    h += `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:.5rem">
        <div><div style="font-weight:600;font-size:.95rem">${a.name} <span class="mono" style="font-size:.72rem;color:var(--t3)">${a.id}</span></div>
          <div style="font-size:.8rem;color:var(--t2);margin-top:.15rem">📞 ${a.phone} — Reçue le ${a.date}</div>
          <p style="font-size:.83rem;margin-top:.3rem;padding:.5rem .7rem;background:var(--input);border-radius:6px;font-style:italic">&laquo; ${a.message} &raquo;</p></div>
        <div style="display:flex;flex-direction:column;gap:.3rem;align-items:flex-end">
          <select id="appGrade${i}" style="width:auto;font-size:.8rem;padding:.3rem .5rem">${gradeOpts}</select>
          <div style="display:flex;gap:.3rem">
            <button class="btn btn-sm btn-green" onclick="acceptApp(${i})">✓ Accepter</button>
            <button class="btn btn-sm btn-red" onclick="DB.job.pendingApps.splice(${i},1);toast('Candidature refusée');go('wapps')">✕ Refuser</button>
          </div>
        </div>
      </div></div>`;
  });
  return h;
}
function acceptApp(idx) {
  const a = DB.job.pendingApps[idx];
  const g = parseInt(document.getElementById('appGrade'+idx).value);
  DB.job.employees.push({id:a.id, name:a.name, grade:g, phone:a.phone, hired:new Date().toLocaleDateString('fr-FR'), status:'active'});
  // Update citizen registry
  const cit = DB.citizens.find(c => c.id === a.id);
  if (cit) { cit.job = DB.job.company; cit.role = DB.job.grades[g].name; }
  // Update gov enterprise employee count
  const ent = DB.enterprises.find(e=>e.name===DB.job.company);
  if (ent) ent.employees = DB.job.employees.filter(e=>e.status==='active').length;
  DB.job.pendingApps.splice(idx, 1);
  toast(a.name + ' embauché !'); buildNav(); go('wapps');
}

function resetCompta() {
  confirmDel('Remettre toute la comptabilité à zéro ? (solde, factures, historique, semaines)', function(){
    var j = DB.job;
    j.bankBalance = 0;
    j.invoices = [];
    j.comptaHistory = [];
    j.comptaWeeks = [];
    j.weeklyHistory = [];
    j.companyExpenses = [];
    j.employeeExpenses = [];
    j.taxDeclarations = [];
    saveDB();
    toast('Comptabilité remise à zéro');
    go('wcompta');
  });
}
