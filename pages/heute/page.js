/*
 * LEVELN 0.10 · pages/heute/page.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function lv10DeckGoals(day=S.day,kind=S.deckKind||'build'){
  return goals(day).filter(g=>g.a.kind===kind&&g.a.cardShown!==false)
    .sort((a,b)=>(a.a.deckOrder??a.a.order??0)-(b.a.deckOrder??b.a.order??0)||a.a.name.localeCompare(b.a.name,'de'));
}

function lv10DeckSelect(kind){
  S.cardByKind||={build:0,reduce:0};
  S.cardByKind[S.deckKind||'build']=S.card;
  S.deckKind=kind;S.card=S.cardByKind[kind]||0;S.cardDrafts.clear();
  render();vibrate();
}

function rotate(step){const g=lv10DeckGoals();S.card=(S.card+step+g.length)%Math.max(1,g.length);S.cardByKind||={build:0,reduce:0};S.cardByKind[S.deckKind||'build']=S.card;render();}

/** Quest-Fortschritt: Leveln füllt sich; Zaubern zeigt Restbudget und leert sich.
 * Der Balken ist ausschließlich Präsentation, nicht Quelle der XP-/Streak-Berechnung. */
function lv11Progress(g){
  if(isOnce(g.a))return '';
  const r=g.r,keys=metricKeys(r),p=currentPeriod(g,S.day);
  if(!p)return '';
  const a=assessment(g,p);
  return `<div class="lv11-progress">${keys.map(k=>{
    const budget=ruleValue(r,k),isMana=g.a.kind==='reduce';
    const raw=isMana?budget-a.totals[k]:a.totals[k];
    const amount=isMana?Math.max(0,raw):raw;
    const unknown=isMana&&a.hasUnknown;
    const pct=budget>0&&!unknown?Math.max(0,Math.min(100,amount/budget*100)):0;
    const unit=k==='minutes'?'min':'×',label=k==='minutes'?'Zeit':'Anzahl';
    const warn=isMana&&raw<0;
    return `<div class="lv11-meter-row"><span class="lv11-metric-icon" aria-label="${label}">${k==='minutes'?'◷':'#'}</span>
       <div class="lv11-meter ${warn?'lv11-meter-over':''}" role="progressbar" aria-label="${isMana?'Restmana':'Zielerreichung'} ${label}" aria-valuemin="0" aria-valuemax="${budget}" aria-valuenow="${amount}">
         <div class="lv11-meter-fill" style="width:${pct}%"></div>
         <span>${unknown?'Verbrauch unbekannt':num(amount,1)+' / '+num(budget,1)+' '+unit}</span>
       </div></div>`;
  }).join('')}</div>`;
}

function lv10PeriodResult(g){const p=currentPeriod(g,S.day);return p?assessment(g,p):null;}

function lv10CardGlow(g){
  if(isOnce(g.a))return '';
  if(g.a.kind==='build')return lv10PeriodResult(g)?.state==='success'?'level-glow':'';
  const x=manaInPeriod(g);
  return x&& !x.unknown && metricKeys(g.r).every(k=>ruleValue(g.r,k)-x.used[k]>0)?'mana-glow':'';
}

function lv10PlayControls(g,behind=false){
  const draft=cardDraft(g);
  return `<div class="lv10-play-amounts" aria-label="Aktuelle Ausspielmenge">
  ${metricKeys(g.r).map(k=>{
    const value=Number(draft[k]||0),unit=k==='minutes'?'Min.':'×',lab=k==='minutes'?'Minuten':'Anzahl';
    return `<div class="lv10-amount-row" data-metric="${k}">
      <small>${lab}</small><div class="lv10-amount-stepper">
      <button type="button" class="lv10-step" data-direction="-1" data-metric="${k}" data-goal="${safe(g.key)}" ${behind?'disabled':''} aria-label="${lab} reduzieren">−</button>
      <strong class="lv10-amount-value" aria-live="polite">${num(value,0)} <em>${unit}</em></strong>
      <button type="button" class="lv10-step" data-direction="1" data-metric="${k}" data-goal="${safe(g.key)}" ${behind?'disabled':''} aria-label="${lab} erhöhen">＋</button>
      </div></div>`;
  }).join('')}</div>`;
}

function cardHtml(g,behind=false){
  const a=g.a,once=isOnce(a),r=g.r,k=safe(g.key),abbr=shortCode(a.shortName||a.name),
    color=lv10CardColor(a),e=once?null:entry(g,S.day),keys=once?[]:metricKeys(r);
  const glow=lv10CardGlow(g),st=once?null:stData(g).current;
  const current=once?'':keys.map(m=>m==='minutes'?num(e?.minutes||0,1)+' min':num(e?.count||0,0)+' ×').join(' · ');
  const subtext=once?'Einmalig':`${a.kind==='reduce'?'Verbraucht':'Trainiert'}: ${current||'0'}`;
  const cardColor=hex(color,a.kind==='reduce'?S.colors.save:S.colors.level);
  return `<div class="play-card lv-card ${behind?'peek':'face lv-card--primary'} ${glow} ${once?'once-card':''}" style="--card-accent:${cardColor}" data-quest-color="${cardColor}" ${behind?'':'id="activeCard"'} data-goal="${k}">
  <div class="lv11-type-watermark" aria-hidden="true">${ico(a.kind==='reduce'?'zaubern':'leveln')}</div>
  <div class="card-header"><span class="card-pill">${once?'EINMALIG':a.kind==='reduce'?'ZAUBERN':'LEVELN'}</span>
    ${`<button class="lv10-card-edit" data-act="${once?'once-edit':'edit-goal'}" ${once?`data-id="${safe(a.id)}"`:`data-key="${k}"`} aria-label="Quest bearbeiten" ${behind?'disabled tabindex="-1"':''}>${ico('dots')}</button>`}</div>
  <div class="card-main">${art(a)}<h2>${safe(a.name)}</h2><p>${once?(a.availableUntil?'Bis '+pretty(a.availableUntil):'Ohne Zeitlimit')+' · einmalige Quest':safe(detailGoal(g))}</p>
    ${!once?lv11Progress(g):''}<small class="card-daily-tally">${safe(subtext)}</small>
    ${!once?lv10PlayControls(g,behind):''}</div>
  <div class="card-foot"><span class="streak">${once?ico('check')+' '+num((a.rewardBindings||[]).reduce((s,b)=>s+b.xp,0),1)+' XP':ico('flame')+' '+st}</span><b class="card-short">${safe(abbr)}</b><span class="played-label">${once?'MISSION':a.kind==='reduce'?'MANA':'XP'}</span></div></div>`;
}

function todayView(){
  if(!canEdit(S.day))S.day=nowDay();
  const gs=lv10DeckGoals(),all=goals(S.day),kind=S.deckKind||'build';
  S.card=Math.min(Math.max(0,S.card),Math.max(0,gs.length-1));
  const g=gs[S.card],type=kind==='reduce'?'ZAUBERN':'LEVELN';
  return `<div class="today-head"><div class="today-topline"><span>${type} · KARTENDECK</span><span>${all.filter(x=>x.a.kind===kind).length} Quests</span></div>${xpBar()}</div>
  <div class="deck-area ${S.day!==nowDay()?'lv11-yesterday':''}">${g?`<div class="deck-stack">${[2,1].map(i=>{
    if(gs.length<=i)return '';const next=gs[(S.card+i)%gs.length];
    return `<div class="peek-wrap peek-${i}">${cardHtml(next,true)}</div>`;
  }).join('')}${cardHtml(g)}<div class="deck-gesture-tail" role="presentation" aria-hidden="true"></div></div>`:
  `<div class="empty-state">${ico(kind==='reduce'?'mana':'leveln')}<h2>Keine Karten auf diesem Stapel</h2><button class="primary" data-act="deck-select" data-kind="${kind==='build'?'reduce':'build'}">Zum anderen Stapel</button></div>`}</div>
  <div class="deck-caption">${S.day!==nowDay()?'GESTERN · ':''}${gs.length?`${S.card+1}/${gs.length} Karten · `:''}${pretty(S.day,{day:'numeric',month:'short'})}</div>`;
}

async function startCard(g,up){
  if(!g||S.busy||!canEdit(S.day))return;
  if(isOnce(g.a)){if(up)await completeOnce(g.a.id);return;}
  if(!up)return; // ↓ now exclusively deck switch / deck manager.
  S.busy=true;
  try{
    const draft=cardDraft(g);
    for(const metric of metricKeys(g.r)){
      const field=metric==='minutes'?'standardMinutes':'standardCount';
      if(Number(draft[metric]||0)!==Number(g.r[field]||0))await updatePlayAmount(g.key,metric,draft[metric]??'');
    }
    const before=xpStats().sum,fields=bookingFields(g,true);
    await dbPut('entries',makeEntry(g,S.day,fields));
    // Note: NOT moving to next card. Same card can be played repeatedly.
    S.cardDrafts.delete(entryKey(g,S.day));await sync();await reconcileWallet();
    const after=xpStats().sum;
    vibrate();if(after>before+1e-8)xpToast(after-before);
    if(Math.floor(after/1000)>Math.floor(before/1000))await celebrate(Math.floor(after/1000)+1);
    sound(false);render();toast('Menge gebucht · Karte bleibt spielbereit');
  }finally{S.busy=false;}
}
