/* Leveln 0.11.4 – Archiv, De-Archivierung und Löschentscheidungen.
 * "Vergangenes" ist kein aktives Ziel und erzeugt keine neue Belohnung.
 */
'use strict';

function lv114Row(g,archived=false){
 return `<div class="lv114-quest-entry ${archived?'lv114-archived':''}">${goalRow(g,archived)}</div>`;
}
function lv114OnceRow(a,archived=false){
 // Keep the exact same sliding surface as recurring quests. The actions are
 // underneath the row, never below it or floating outside.
 const id=safe(a.id);
 const actions=archived?(a.archivedAt?
   `<button data-act="quest-reopen" data-id="${id}" aria-label="De-Archivieren">${ico('check')}<small>De-Archiv</small></button>`:''):
   `<button data-act="once-edit" data-id="${id}" aria-label="Bearbeiten">${ico('edit')}<small>Bearb.</small></button>
    <button data-act="once-archive" data-id="${id}" aria-label="Archivieren">${ico('bag')}<small>Archiv</small></button>`;
 const row=onceQuestRow(a).replace(/<div class="goal-row-actions">[\s\S]*?<\/div>/,
   `<div class="goal-row-actions">${actions}<button class="lv114-delete" data-act="quest-delete" data-id="${id}" aria-label="Löschen">${ico('close')}<small>Löschen</small></button></div>`);
 return `<div class="lv114-quest-entry ${archived?'lv114-archived':''}">${row}</div>`;
}
function lv114ArchiveHTML(){
 const archived=lv114ArchiveList();
 const once=S.activities.filter(a=>isOnce(a)&&(a.archivedAt||a.completedAt)&&!a.removedAt);
 return `<section class="goal-section archived-list lv114-archive">
   <button class="lv114-archive-toggle" data-act="archive-toggle" aria-expanded="${!!S.archiveOpen}">
   ${ico('bag')} Archiv <span>${archived.length+once.length}</span>${ico(S.archiveOpen?'arrow':'chevron')}</button>
   ${S.archiveOpen?`<div class="lv114-archive-contents">${archived.map(g=>lv114Row(g,true)).join('')}${once.map(a=>lv114OnceRow(a,true)).join('')||'<p class="muted">Das Archiv ist leer.</p>'}</div>`:''}
 </section>`;
}

function lv114DeletionSheet(id){
 const a=S.activities.find(a=>a.id===id);if(!a)return;
 S.modal={type:'delete-quest',activityId:id};
 sheet('Quest löschen?',`<div class="lv114-delete-options">
 <p>Was soll mit <b>${safe(a.name)}</b> passieren?</p>
 <button data-act="quest-delete-preserve" data-id="${safe(id)}"><strong>Quest entfernen, Erfolge behalten</strong><small>Quest dauerhaft ausblenden; Tageswerte, Skill-XP und Charakter-XP werden in der Statistik unter „Vergangenes“ berücksichtigt.</small></button>
 <button data-act="quest-delete-all" data-id="${safe(id)}" class="danger-button"><strong>Alles endgültig löschen</strong><small>Quest, Einträge, zugehörige XP, Glut und Freezes unwiderruflich löschen.</small></button>
 <button data-act="modal-close" class="thin-button">Abbrechen</button></div>`);
}
async function lv114DeleteQuest(id,mode){
 const a=S.activities.find(a=>a.id===id);if(!a)return;
 if(mode==='all'&&!confirm(`Wirklich ALLE Daten von „${a.name}“ endgültig löschen? Das lässt sich nicht rückgängig machen.`))return;
 if(mode==='keep'){
   const changed={...a,removedAt:dayAdd(nowDay(),1)+'T00:00:00',cardShown:false};
   await dbPut('activities',changed);
 }else{
   const w=lv114NormalizeWallet(S.wallet);
   delete w.byQuest[id];
   w.frozen=w.frozen.filter(k=>lv114ActivityFromKey(k)!==id);
   w.awarded=w.awarded.filter(k=>lv114ActivityFromKey(k)!==id);
   w.history=w.history.filter(h=>h.questId!==id && lv114ActivityFromKey(h.key)!==id);
   Object.assign(w,lv114WalletTotals(w));
   await dbTx(['activities','entries','overrides','meta'],t=>{
     t.objectStore('activities').delete(id);
     const entries=t.objectStore('entries');for(const e of S.entries)if(e.activityId===id||e.id.startsWith(id+'|'))entries.delete(e.id);
     const overrides=t.objectStore('overrides');for(const v of S.overrides)if(v.activityId===id||v.goalId===id||v.id.startsWith(id+'|'))overrides.delete(v.id);
     t.objectStore('meta').put({key:'emberWallet',value:w});
   });
 }
 S.modal=null;S.selectedGoal=null;S.goalExpanded=null;S.card=0;S.archiveOpen=mode==='keep'?S.archiveOpen:false;
 await sync();render();toast(mode==='all'?'Quest und alle Daten gelöscht':'Quest entfernt · Erfolge unter „Vergangenes“');
}
function lv114ReopenSheet(id){
 const a=S.activities.find(a=>a.id===id&&a.archivedAt&&!a.removedAt);if(!a)return;
 const begin=a.archivedAt.slice(0,10),end=dayAdd(nowDay(),-1);
 S.modal={type:'reopen-quest',activityId:id};
 sheet('Quest wieder aktivieren',`<div class="lv114-reopen">
 <p><b>${safe(a.name)}</b> wieder aktivieren? ${begin<=end?`Für den Zeitraum ${pretty(begin)} bis ${pretty(end)} fehlen möglicherweise Leistungen.`:'Es gibt noch keine abgeschlossenen Tage im Archiv.'}</p>
 ${begin<=end?`<button class="thin-button" data-act="reopen-history">${ico('edit')} Bisherige Erfolge nachtragen</button>`:''}
 <button class="thin-button" data-act="reopen-empty" data-id="${safe(id)}">${ico('check')} Ohne Leistungen fortsetzen</button>
 <button class="thin-button" data-act="modal-close">De-Archivieren abbrechen</button></div>`);
}
function lv114ReopenRange(a,row={}){
 const min=a.archivedAt.slice(0,10),max=dayAdd(nowDay(),-1),r=revision(a,min).rules||[];
 const metrics=new Set(r.flatMap(metricKeys));
 return `<div class="lv114-gap-range"><div class="lv114-gap-head"><b>Zeitraum</b><button type="button" data-act="reopen-remove">×</button></div>
 <div class="field-grid"><label>Von<input class="lv114-gap-start" type="date" min="${min}" max="${max}" value="${safe(row.start||min)}" required></label>
 <label>Bis einschließlich<input class="lv114-gap-end" type="date" min="${min}" max="${max}" value="${safe(row.end||max)}" required></label></div>
 <div class="field-grid">${metrics.has('minutes')?`<label>Minuten pro Tag<input type="number" class="lv114-gap-minutes" step=".01" min="0" value="${safe(row.minutes??r.find(x=>metricKeys(x).includes('minutes'))?.minutes??0)}" required></label>`:''}
 ${metrics.has('count')?`<label>Anzahl pro Tag<input type="number" class="lv114-gap-count" step="1" min="0" value="${safe(row.count??r.find(x=>metricKeys(x).includes('count'))?.count??0)}" required></label>`:''}</div></div>`;
}
function lv114ReopenForm(){
 const a=S.activities.find(x=>x.id===S.modal?.activityId);if(!a)return;
 sheet('Archivzeit nachtragen',`<form id="reopenForm" class="lv114-reopen" data-id="${safe(a.id)}"><p>Die angegebenen Mengen gelten für <b>jeden Tag</b> im Zeitraum. Nicht nachgetragene Tage werden ohne erfundene Leistungen übernommen.</p>
 <div id="lv114-gap-rows">${lv114ReopenRange(a)}</div>
 <button type="button" class="thin-button" data-act="reopen-add">＋ Weiteren Zeitraum hinzufügen</button>
 <button class="primary" type="submit">Einträge übernehmen und aktivieren</button>
 <button type="button" class="thin-button" data-act="modal-close">Abbrechen</button></form>`);
}
async function lv114ReopenQuest(id,ranges=[]){
 const old=S.activities.find(a=>a.id===id&&a.archivedAt);if(!old)return;
 // Backfill against the ORIGINAL archive date. Clearing archivedAt first
 // would silently shift the permitted catch-up interval to today.
 const entries=isOnce(old)?[]:lv114GapEntries(old,ranges);
 const a=structuredClone(old),date=nowDay();
 a.archivedAt=null;a.archivedAtEnd=date;a.reactivatedAt=new Date().toISOString();
 // Historical catch-up is real XP, but never awards NEW retrospective Glut.
 // Later milestones can be earned from the next active period onward.
 a.reopenedGlutLockUntil=date;
 // Backfilled dates are genuine regular entries. Once reactivated, the period
 // engine sees the entire history again and can recalculate earned XP.
 await dbTx(['activities','entries'],t=>{
   t.objectStore('activities').put(a);
   for(const e of entries)t.objectStore('entries').put(e);
 });
 S.modal=null;S.archiveOpen=false;S.goalExpanded=null;
 await sync();await reconcileWallet();render();toast('Quest wieder aktiv');
}
function lv114ReadGapForm(form){
 const a=S.activities.find(x=>x.id===form.dataset.id),ranges=[];
 if(!a)throw Error('Quest nicht gefunden.');
 for(const row of form.querySelectorAll('.lv114-gap-range')){
   ranges.push({start:row.querySelector('.lv114-gap-start').value,end:row.querySelector('.lv114-gap-end').value,
     minutes:row.querySelector('.lv114-gap-minutes')?.value??null,count:row.querySelector('.lv114-gap-count')?.value??null});
 }
 // Validate complete plan before any write.
 let seen=new Set();for(const r of ranges)for(const d of allDays(r.start,dayAdd(r.end,1))){
   if(seen.has(d))throw Error('Nachtragszeiträume dürfen sich nicht überschneiden.');seen.add(d);
 }
 return ranges;
}

async function lv114HandleQuestAction(act,el){
 const id=el.dataset.id;
 if(act==='archive-toggle'){S.archiveOpen=!S.archiveOpen;render();return;}
 if(act==='quest-delete'){lv114DeletionSheet(id);return;}
 if(act==='quest-delete-preserve'){await lv114DeleteQuest(id,'keep');return;}
 if(act==='quest-delete-all'){await lv114DeleteQuest(id,'all');return;}
 if(act==='quest-reopen'){lv114ReopenSheet(id);return;}
 if(act==='reopen-empty'){await lv114ReopenQuest(id);return;}
 if(act==='reopen-history'){lv114ReopenForm();return;}
 if(act==='reopen-add'){
   const a=S.activities.find(x=>x.id===S.modal?.activityId),box=el.closest('form').querySelector('#lv114-gap-rows');
   if(a&&box)box.insertAdjacentHTML('beforeend',lv114ReopenRange(a));return;
 }
 if(act==='reopen-remove'){el.closest('.lv114-gap-range')?.remove();return;}
 if(act==='quest-pause'){
   const old=S.activities.find(a=>a.id===id);
   if(!old||old.archivedAt||old.removedAt)return;
   const active=lv114HasPause(old,nowDay());
   if(!confirm(active?`Dauer-Freeze für „${old.name}“ beenden?`:`„${old.name}“ ab heute ohne XP/Glut auf Dauer-Freeze setzen?`))return;
   const a=structuredClone(old);a.pauseRanges||=[];
   if(active){const last=[...a.pauseRanges].reverse().find(r=>r.start<=nowDay()&&!r.end);if(last)last.end=nowDay();}
   else a.pauseRanges.push({start:nowDay(),end:null});
   await dbPut('activities',a);await sync();await reconcileWallet();render();toast(active?'Quest fortgesetzt':'Dauer-Freeze aktiv');return;
 }
}
// The historical gap editor is an explicit form; no silent backdating.
document.addEventListener('submit',e=>{
 if(e.target.id!=='reopenForm')return;
 e.preventDefault();const form=e.target;
 try{const ranges=lv114ReadGapForm(form);lv114ReopenQuest(form.dataset.id,ranges).catch(showError);}
 catch(error){showError(error);}
});
document.addEventListener('change',e=>{
 if(e.target.id==='lv114-shop-select'){S.shopQuestId=e.target.value;renderModal();}
});
