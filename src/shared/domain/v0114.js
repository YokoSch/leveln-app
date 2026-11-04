/* Leveln 0.11.4 – quest-bound resources, pause intervals, reversible archive state.
 * Same IndexedDB schema (5); all new fields live on activities / emberWallet meta.
 * No user-supplied SVG or untrusted HTML is evaluated here.
 */
'use strict';
function lv114ActivityFromKey(key){return String(key||'').split('|')[0];}
function lv114NormalizeWallet(input){
 const w={...structuredClone(input||{}),awarded:[...(input?.awarded||[])],frozen:[...(input?.frozen||[])],history:[...(input?.history||[])],byQuest:structuredClone(input?.byQuest||{})};
 // Attribution of old earned Glut is possible from the unique milestone key.
 // Never distribute an unknown global inventory to arbitrary quests.
 if(!input?.byQuest){
   // A single historical quest can be attributed unambiguously. If a shared
   // wallet has been spent across several quests we cannot infer ownership;
   // quarantine the remainder rather than manufacturing resources.
   const credits=new Map();
   for(const row of w.history.filter(h=>h.type==='glut-earned')){
     const id=lv114ActivityFromKey(row.key);if(id)credits.set(id,(credits.get(id)||0)+1);
   }
   const balance=Math.max(0,Number(input?.glut)||0);
   const gross=[...credits.values()].reduce((a,b)=>a+b,0);
   let attributed=0;
   if(balance>=gross){for(const [id,n] of credits)lv114Account(w,id).glut=n;attributed=gross;}
   else if(credits.size===1){const id=credits.keys().next().value;lv114Account(w,id).glut=balance;attributed=balance;}
   w.legacyUnassigned={glut:Math.max(0,balance-attributed),inventory:Math.max(0,input?.inventory||0)};
 }
 w.glut=Object.values(w.byQuest).reduce((s,q)=>s+q.glut,0);
 w.inventory=Object.values(w.byQuest).reduce((s,q)=>s+q.inventory,0);
 return w;
}
function lv114Account(w,id){
 if(!w.byQuest)w.byQuest={};
 if(!w.byQuest[id])w.byQuest[id]={glut:0,inventory:0};
 return w.byQuest[id];
}
function lv114WalletView(id){return lv114Account(lv114NormalizeWallet(S.wallet),id);}
function lv114WalletTotals(w){return Object.values(w.byQuest||{}).reduce((v,q)=>({glut:v.glut+q.glut,inventory:v.inventory+q.inventory}),{glut:0,inventory:0});}
function lv114HasPause(a,d){return (a?.pauseRanges||[]).some(r=>r.start<=d&&(!r.end||d<r.end));}
function lv114PeriodPaused(g,p){return (g.a.pauseRanges||[]).some(r=>r.start<p.end&&(!r.end||r.end>p.start));}
function lv114ArchivedGap(g,p){return (g.a.archiveRanges||[]).some(r=>r.start<p.end&&(!r.end||r.end>p.start));}
function lv114PeriodProtected(g,p){return lv114PeriodPaused(g,p)||lv114ArchivedGap(g,p);}
function lv114IsActive(a){return !a.removedAt&&!a.archivedAt&&!a.completedAt;}
function lv114VisibleGoals(){return goals().filter(g=>!isOnce(g.a)&&!g.a.removedAt);}
function lv114ArchiveList(){
 const active=new Set(goals().map(g=>g.key));
 return allGoals().filter(g=>!g.a.removedAt&&(!active.has(g.key)||!!g.a.archivedAt)&&!isOnce(g.a));
}
function lv114ArchiveStart(a){return a.archivedAt?.slice(0,10)||nowDay();}
function lv114GapDays(a){return allDays(lv114ArchiveStart(a),nowDay());}
function lv114GapEntries(a,rangeDefs=[]){
 const changes=[];const ranges=rangeDefs||[];const updated=nowDay();
 const earliest=lv114ArchiveStart(a),last=dayAdd(updated,-1);
 const goalsForQuest=allGoals().filter(g=>g.a.id===a.id&&!isOnce(g.a));
 const seen=new Set();
 for(const range of ranges){
   if(!/^\d{4}-\d\d-\d\d$/.test(range.start)||!/^\d{4}-\d\d-\d\d$/.test(range.end)||range.start>range.end||range.start<earliest||range.end>last)throw Error('Nachträge müssen innerhalb der Archivzeit liegen.');
   for(const d of allDays(range.start,dayAdd(range.end,1))){
     if(!seen.has(d))seen.add(d);else throw Error('Zeiträume dürfen sich nicht überschneiden.');
     for(const g of goalsForQuest){
       const rs=rules(a,d);const rule=rs.find(x=>x.id===g.r.id)||g.r;
       const fields={mode:'up',status:'yes',source:'user',estimated:false};
       for(const metric of metricKeys(rule)){
         const val=Number(range[metric]);if(!Number.isFinite(val)||val<0||(metric==='count'&&!Number.isInteger(val)))throw Error('Ungültige Nachtragsmenge.');
         fields[metric]=val;
       }
       changes.push(makeEntry(g,d,fields));
     }
   }
 }
 // For ALL unentered archive days, keep unknown Mana unknown and Leveln zero.
 for(const d of allDays(earliest,updated))for(const g of goalsForQuest){
   const id=entryKey(g,d);
   if(changes.some(x=>x.id===id)||S.entries.some(x=>x.id===id))continue;
   const values=g.a.kind==='reduce'?unknownFields(g):{mode:'down',status:'no',source:'zero-auto',estimated:false,...Object.fromEntries(metricKeys(g.r).map(k=>[k,0]))};
   changes.push(makeEntry(g,d,values));
 }
 return changes;
}
