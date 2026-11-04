/*
 * LEVELN 0.10 · pages/quests/page.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function lv10RateRow(metric,b={}){
  return `<div class="binding-row lv10-binding" data-metric="${metric}">
    <label>XP ${metric==='minutes'?'pro Stunde':'pro Anzahl'}<input class="binding-rate" type="number" step="0.1" min="0" max="100000" value="${b.rate??10}" required></label>
    <label>Skill<select class="binding-skill" aria-label="Trainierter Skill">${skillOptions(b.skillId||S.skills[0]?.id||'__new__')}</select></label>
    <button class="binding-remove" type="button" data-act="binding-remove" aria-label="XP-Zeile entfernen">×</button>
  </div>`;
}

function lv10MetricTable(metric,r,rateList=[],existing=false){
  const minutes=metric==='minutes',n=minutes?'Minuten':'Anzahl',value=r?.[metric],standard=r?.[minutes?'standardMinutes':'standardCount'];
  if(!existing)return `<button class="lv10-add-metric" type="button" data-act="metric-enable" data-metric="${metric}"><b>＋</b><span>Ziel – ${minutes?'Zeit':'Anzahl'}</span></button>`;
  return `<section class="lv10-metric-table" data-metric="${metric}">
    <div class="lv10-metric-head"><h3>Ziel – ${minutes?'Zeit':'Anzahl'}</h3><button type="button" data-act="metric-remove" data-metric="${metric}" class="lv10-danger-quiet" aria-label="${n}-Ziel entfernen">×</button></div>
    <div class="lv10-metric-top field-grid"><label>Ziel-${n}<input type="number" name="${metric}" min="0" step="1" required value="${value??''}"></label>
    <label>Tägliche Ausspielmenge · ${n}<input type="number" name="${minutes?'stdMinutes':'stdCount'}" min="0" step="1" value="${standard??suggestStandard(r?.period||'day',value,metric)}"></label></div>
    <p class="lv10-units-help">Belohnung je ${minutes?'60 Minuten':'1 Einheit'} – die Summe aller Skill-XP zählt auch für den Charakter.</p>
    <div class="lv10-binding-head"><b>XP ${minutes?'pro Stunde':'pro Anzahl'}</b><b>Skill</b></div>
    <div class="lv10-rate-rows">${rateList.map(b=>lv10RateRow(metric,b)).join('')}</div>
    <button type="button" class="thin-button lv10-add-skill" data-act="binding-add" data-metric="${metric}">＋ Skill-Zeile</button>
  </section>`;
}

function lv10FormRule(a,g){return g?.r||{id:uid(),period:'day',mode:'calendar',minutes:null,count:null,standardMinutes:null,standardCount:null};}

function editGoalModal(){
  const a=S.activities.find(x=>x.id===S.modal.activityId)||(S.modal.key?goalByKey(S.modal.key)?.a:null),
      g=S.modal.key?goalByKey(S.modal.key):a&&!isOnce(a)?allGoals().find(x=>x.a.id===a.id):null,
      once=isOnce(a)||S.modal.questType==='once',r=lv10FormRule(a,g),rev=a&&!once?revision(a,nowDay()):null,
      kind=a?.kind||'build',clr=hex(isOnce(a)?a.color:g?.r?.color,kind==='reduce'?S.colors.save:S.colors.level);
  // New quests have no target table at all. Editing existing quests shows only
  // already configured metrics, preventing accidental XP in the wrong unit.
  const metricContent=['minutes','count'].map(m=>lv10MetricTable(m,r,rev?.skillRates?.[m]||[],a?ruleValue(r,m)!==null:false)).join('');
  sheet(a?'Quest bearbeiten':'Neue Quest',`<form id="goalForm" class="quest-form lv10-quest-form">
  <div class="quest-type-banner" style="--type-color:${kind==='reduce'?S.colors.save:S.colors.level}">${once?'EINMALIGE MISSION':kind==='reduce'?'ZAUBER-QUEST':'LEVELN-QUEST'}</div>
  <label>Questname<input name="name" maxlength="70" required value="${safe(a?.name||'')}"></label>
  <label>Kürzel · maximal 5 Zeichen<input name="shortName" maxlength="5" value="${safe(a?.shortName||shortCode(a?.name||''))}"></label>
  ${a?`<input name="questType" type="hidden" value="${once?'once':'repeat'}"><input name="kind" type="hidden" value="${kind}">`:
  `<div class="field-grid"><label>Questart<select name="questType" id="questTypeSelect"><option value="repeat" ${once?'':'selected'}>Wiederkehrend</option><option value="once" ${once?'selected':''}>Einmalig</option></select></label><label>Kartentyp<select name="kind"><option value="build">Leveln</option><option value="reduce">Zaubern</option></select></label></div>`}
  <label>Questsymbol<select name="iconKey"><option value="">Standard</option>${iconChoices(a?.iconKey)}</select></label>
  <div id="recurringFields" ${once?'hidden':''}>
    <label>Gültig ab<input name="startDate" type="date" min="${nowDay()}" value="${a?.createdAt?.slice(0,10)>nowDay()?a.createdAt.slice(0,10):nowDay()}"></label>
    <div class="field-grid"><label>Zeitraum<select name="period">${['day','week','month','year'].map(p=>`<option value="${p}" ${p===r.period?'selected':''}>${NAMES[p]}</option>`).join('')}</select></label>
      <label>Auswertung<select name="mode"><option value="calendar" ${r.mode!=='restart'?'selected':''}>Kalender</option><option value="restart" ${r.mode==='restart'?'selected':''}>Neustart</option></select></label></div>
    <div id="recurringRates" class="lv10-metrics">${metricContent}</div>
  </div>
  <div id="oneTimeFields" ${once?'':'hidden'}><div class="field-grid">
      <label>Verfügbar ab<input name="availableFrom" type="date" min="${nowDay()}" value="${a?.availableFrom||nowDay()}"></label>
      <label>Verfügbar bis<input name="availableUntil" type="date" value="${a?.availableUntil||dayAdd(nowDay(),30)}" ${a?.availableUntil===null?'disabled':''}></label></div>
      <label class="check-color"><input type="checkbox" name="unlimited" ${a?.availableUntil===null?'checked':''}> Unbegrenzt verfügbar – kein Ablaufdatum</label>
      </div>
  <div id="onceRewards" ${once?'':'hidden'}><h3>Einmalige Abschlussbelohnungen</h3>${(a?a.rewardBindings||[]:[{skillId:S.skills[0]?.id||'__new__',xp:50}]).map(rewardRowHTML).join('')}
    <button class="thin-button" type="button" data-act="binding-add" data-metric="once">＋ Skill-Belohnung</button></div>
  <label>Neuen Skill gleichzeitig anlegen (optional)<input name="newSkillName" maxlength="60" placeholder="z. B. Organisation"></label>
  <label>Kartenfarbe<input type="color" name="goalColor" value="${clr}"></label>
  ${a?`<label>Statistikfarbe (unabhängig)<input type="color" name="statColor" value="${lv10StatisticColor(a)}"></label>`:''}
  ${lv113HistoryForm(a,once,r)}
  <div class="sheet-actions"><button type="button" class="thin-button" data-act="modal-close">Abbrechen</button><button class="primary" type="submit">Quest speichern</button></div>
  </form>`);
  lv113SyncHistoryInputs(document.querySelector('#goalForm'));
}

function lv10ReadBindings(form,once,newId){
  const rows=[...form.querySelectorAll(once?'#onceRewards .binding-row':'.lv10-metric-table .binding-row')],out=[];
  for(const row of rows){
    const metric=once?'once':row.closest('.lv10-metric-table')?.dataset.metric;
    let skillId=row.querySelector(once?'.reward-skill':'.binding-skill').value;
    if(skillId==='__new__')skillId=newId;
    if(!skillId||(!skillById(skillId)&&skillId!==newId))throw Error('Bitte bei jedem XP-Anteil einen vorhandenen oder neu anzulegenden Skill auswählen.');
    const amount=readNumber(row.querySelector(once?'.reward-xp':'.binding-rate').value,once?'Abschluss-XP':'Skill-XP');
    if(amount===null||amount<=0)continue;
    out.push(once?{skillId,xp:amount}:{metric,skillId,rate:amount});
  }
  return out;
}

async function saveGoal(form){
  const f=form.elements,old=S.activities.find(x=>x.id===S.modal.activityId)||(S.modal.key?goalByKey(S.modal.key)?.a:null),
    once=f.questType.value==='once',name=f.name.value.trim();
  if(!name)throw Error('Bitte einen Questnamen eingeben.');
  if(old&&isOnce(old)!==once)throw Error('Questart kann nachträglich nicht gewechselt werden.');
  if(old?.completedAt)throw Error('Abgeschlossene Missionen bleiben historisch unverändert.');
  const newName=f.newSkillName.value.trim();
  const newSkill=newName?{id:uid(),name:newName.slice(0,60),description:'',color:profile().color,icon:'spark',createdAt:new Date().toISOString()}:null;
  if(newSkill)newSkill.statisticColor=lv10NewStatColor(newSkill.color,null,true);
  const bindings=lv10ReadBindings(form,once,newSkill?.id);
  if(!old&&!bindings.length)throw Error('Bitte mindestens eine Skill-Zeile mit XP definieren.');
  const now=new Date().toISOString(),out=old?structuredClone(old):{id:uid(),kind:f.kind.value,createdAt:now,order:S.activities.length,revisions:[]};
  out.name=name;out.shortName=shortCode(f.shortName.value||name);out.iconKey=f.iconKey.value;out.updatedAt=now;
  out.questType=once?'once':'repeat';out.cardShown=old?.cardShown!==false;
  out.deckOrder=Number.isFinite(old?.deckOrder)?old.deckOrder:S.activities.filter(a=>a.kind===out.kind).length;
  // Keep old category as opaque legacy data only; no new life-area assignment.
  const color=hex(f.goalColor.value,out.kind==='reduce'?S.colors.save:S.colors.level);
  if(!old){out.statisticColor=lv10NewStatColor(color,null,false);}else if(f.statColor)out.statisticColor=lv10NewStatColor(hex(f.statColor.value,out.statisticColor||color),old.id,false);
  if(once){
    const from=f.availableFrom.value,to=f.unlimited.checked?null:f.availableUntil.value;
    if(!/^\d{4}-\d\d-\d\d$/.test(from)||(!old&&from<nowDay())||(to!==null&&to<from))throw Error('Ungültiger Verfügbarkeitszeitraum.');
    out.availableFrom=from;out.availableUntil=to;out.pinned=out.cardShown;
    out.rewardBindings=bindings;out.revisions=[];out.color=color;
  }else{
    const start=f.startDate.value;
    if(!old)out.normalStartDate=start;
    if(!/^\d{4}-\d\d-\d\d$/.test(start)||start<nowDay())throw Error('Startdatum muss heute oder später sein.');
    const t=form.querySelector('.lv10-metric-table[data-metric="minutes"]'),c=form.querySelector('.lv10-metric-table[data-metric="count"]');
    if(!t&&!c)throw Error('Bitte zuerst „Ziel – Zeit“ oder „Ziel – Anzahl“ aktivieren.');
    const minutes=t?readNumber(f.minutes.value,'Ziel-Minuten'):null,
      count=c?readNumber(f.count.value,'Ziel-Anzahl'):null,
      stdMinutes=t?readNumber(f.stdMinutes.value,'Ausspiel-Minuten'):null,
      stdCount=c?readNumber(f.stdCount.value,'Ausspiel-Anzahl'):null;
    if(t&&minutes===null||c&&count===null)throw Error('Bitte für jede aktivierte Tabelle einen Zielwert eintragen.');
    if(count!==null&&!Number.isInteger(count)||stdCount!==null&&!Number.isInteger(stdCount))throw Error('Anzahlen müssen ganzzahlig sein.');
    const current=old?structuredClone(revision(out,start)):{rules:[],countXp:0};
    const selected=S.modal.key?current.rules.find(r=>`${out.id}|${r.id}`===S.modal.key):current.rules[0];
    const r={...(selected||{id:uid()}),period:f.period.value,mode:f.period.value==='day'?'calendar':f.mode.value,
      minutes,count,standardMinutes:stdMinutes,standardCount:stdCount,color,colorEnabled:true};
    current.from=start;
    current.rules=selected?current.rules.map(v=>v.id===r.id?r:v):[r];
    current.skillRates={minutes:bindings.filter(b=>b.metric==='minutes').map(({skillId,rate})=>({skillId,rate})),count:bindings.filter(b=>b.metric==='count').map(({skillId,rate})=>({skillId,rate}))};
    current.countXp=current.skillRates.count.reduce((sum,x)=>sum+x.rate,0);
    out.revisions=out.revisions.filter(x=>x.from!==start);out.revisions.push(current);out.revisions.sort((a,b)=>a.from.localeCompare(b.from));
    if(!old||start<out.createdAt.slice(0,10))out.createdAt=start+'T12:00:00';
  }
  // Version 0.11.3: regular entries and historical one-time Glut credits are
  // persisted in the SAME IndexedDB transaction as the quest and new skill.
  const historyPlan=lv113ReadHistory(form,out,old);
  if(historyPlan.ranges.length && (out.normalStartDate||old?.createdAt?.slice(0,10)||nowDay())>nowDay() && !old?.historicalRanges?.length)throw Error('Für rückwirkende Erfolge muss die Quest spätestens heute beginnen. Bitte „Gültig ab“ auf heute setzen.');
  if(!once)lv113PrepareHistoricalRevision(out,old,historyPlan);
  const historicalWallet=once?null:lv113PreviewHistoricalWallet(out,historyPlan,old);
  const stores=['activities',...(newSkill?['skills']:[]),...(once?[]:['entries']),...(historicalWallet?['meta']:[])];
  await dbTx(stores,t=>{
    t.objectStore('activities').put(out);
    if(newSkill)t.objectStore('skills').put(newSkill);
    if(!once){
      const entries=t.objectStore('entries');
      for(const id of historyPlan.deletes)entries.delete(id);
      for(const row of historyPlan.writes)entries.put(row);
    }
    if(historicalWallet)t.objectStore('meta').put({key:'emberWallet',value:historicalWallet});
  });
  S.modal=null;S.cardDrafts.clear();await sync();if(await lv114TutorialAfterGoal(out))return;S.page='goals';render();toast('Quest gespeichert');
}

function goalsView(){
  const once=S.activities.filter(a=>isOnce(a)&&!a.removedAt);
  const filters=[['all','Alle'],['once','Einmalig'],['day','Täglich'],['week','Wöchentlich'],['month','Monatlich'],['year','Jährlich'],['archive','Archiv']];
  const show=p=>S.questFilter==='all'||S.questFilter===p;
  return `<div class="page-heading"><span class="eyebrow">DEIN ABENTEUER</span><h1>Quests</h1></div>
    <div class="goals-sticky">${calendarHTML()}</div>
    <div class="goals-scroll"><div class="goals-actions lv113-goals-actions">
      <div class="lv113-quest-more-wrap"><button class="thin-button" data-act="quest-more" aria-expanded="${!!S.questMoreOpen}" aria-haspopup="true">${ico('dots')}<span>Mehr</span></button>
      ${S.questMoreOpen?`<div class="lv113-quest-more-menu">
        <button data-act="edit-day" data-day="${nowDay()}">${ico('edit')} Heute korrigieren</button>
        <button data-act="edit-day" data-day="${dayAdd(nowDay(),-1)}">${ico('edit')} Gestern korrigieren</button>
        <button data-act="deck-open">${ico('settings')} Karten verwalten</button>
      </div>`:''}</div>
      <button class="thin-button add-quest-button" data-act="new">${ico('plus')}<span>Neue Quest</span></button></div>
    <div class="quest-filter-bar">${filters.map(([k,v])=>`<button data-act="quest-filter" data-filter="${k}" class="quest-filter ${S.questFilter===k?'selected':''}">${v}</button>`).join('')}</div>
    ${show('once')?`<section class="goal-section"><h3>${ico('scroll')} EINMALIGE QUESTS</h3>${once.filter(a=>!a.archivedAt&&!a.completedAt).map(a=>lv114OnceRow(a)).join('')||'<p class="muted">Keine offenen Missionen</p>'}</section>`:''}
    ${goalGroups().filter(gr=>show(gr.p)).map(gr=>`<section class="goal-section"><h3>${({day:'TÄGLICHE',week:'WÖCHENTLICHE',month:'MONATLICHE',year:'JÄHRLICHE'})[gr.p]} QUESTS</h3>${gr.items.map(g=>lv114Row(g)).join('')||'<p class="muted">Noch keine Quests</p>'}</section>`).join('')}
    ${(S.questFilter==='all'||S.questFilter==='archive')?lv114ArchiveHTML():''}</div>`;
}
