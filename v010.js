/*
 * LEVELN 0.10 · Gameplay & UI integration · 2026-10-31
 * ===================================================
 * Depends on app.js (v0.9 compatibility core), theme/palette.js and
 * theme/designkit.js. Global function overrides are intentional: this script
 * loads AFTER app.js, before the asynchronous IndexedDB startup resolves.
 * The original DB_NAME and object stores DO NOT CHANGE.
 *
 * Data schema 5: activity.cardShown, deckOrder, statisticColor;
 *               skill.statisticColor. 0.9 (schema 4 / backup 4) => 0.10 (5).
 * Legacy event/entry/skillRates values remain untouched: XP must not be reissued.
 * Future maintenance: keep gameplay calculations in app.js, change presentation
 * here. Only add new data shape with a versioned migrateVxxToVyy function.
 */
'use strict';
const LV10 = Object.freeze({version:'0.10', schema:5, backup:5});
const ICON_MAP10 = Object.freeze({
  home:'navigation/heute', goals:'navigation/quests', chart:'navigation/statistik', dots:'navigation/mehr',
  user:'menschen/person', person:'menschen/mensch', mage:'menschen/magier', knight:'menschen/ritter',
  robot:'menschen/roboter', wizard:'menschen/zauberer', archer:'menschen/bogenschutze',
  ranger:'menschen/waldlaufer', priest:'menschen/priesterin', cat:'tiere/katze', wolf:'tiere/wolf',
  fox:'tiere/fuchs', owl:'tiere/eule', paw:'tiere/tierpfote',bear:'tiere/bar',rabbit:'tiere/hase',
  horse:'tiere/pferd',bird:'tiere/vogel',dragon:'fabelwesen/drache',unicorn:'fabelwesen/einhorn',
  phoenix:'fabelwesen/phonix',griffin:'fabelwesen/greif',slime:'fabelwesen/schleimwesen',
  shield:'gegenstaende/schild',scroll:'gegenstaende/schriftrolle',book:'gegenstaende/buch',
  phone:'gegenstaende/handy',dumbbell:'gegenstaende/hantel',wallet:'gegenstaende/geldborse',
  game:'gegenstaende/spielcontroller',sword:'gegenstaende/schwert',potion:'gegenstaende/zaubertrank',
  key:'gegenstaende/schlussel',bag:'gegenstaende/tasche',spark:'symbole/funke',
  star:'symbole/stern',moon:'symbole/mond',sun:'symbole/sonne',heart:'symbole/herz',
  target:'symbole/zielscheibe',palette:'symbole/farbpalette',flame:'symbole/flamme',
  snow:'symbole/schneeflocke',plus:'symbole/plus',rune:'spielmechanik/zaubern',
  pixel:'spielmechanik/leveln',mana:'spielmechanik/mana',ember:'spielmechanik/glut',
  leveln:'spielmechanik/leveln',zaubern:'spielmechanik/zaubern',
  settings:'einstellungen/einstellungen',save:'einstellungen/backup-speichern',
  back:'bedienung/zuruck',check:'bedienung/bestatigen',close:'bedienung/schliessen',
  lock:'bedienung/sperren',calendar:'bedienung/kalender',arrow:'bedienung/pfeil-nach-oben',
  chevron:'bedienung/aufklappen',edit:'bedienung/bearbeiten'
});
const LV10_ICON_KEYS = new Set(Object.values(ICON_MAP10));

// One SVG mask; `currentColor` is derived from the user's chosen color.
function ico(key, cl='') {
  const source = ICON_MAP10[key] || key;
  if (!LV10_ICON_KEYS.has(source)) return `<span class="ico lv-asset-icon ${safe(cl)}" aria-hidden="true"></span>`;
  const url = `./assets/icons/mono/${source}.svg`;
  return `<span class="ico lv-asset-icon ${safe(cl)}" data-icon="${safe(source)}" aria-hidden="true" style="--lv-asset-url:url('${url}')"></span>`;
}
function art(a) {
  if(a.iconData && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(a.iconData))
    return `<img class="card-art" src="${a.iconData}" alt="">`;
  return ico(ICON_MAP10[a.iconKey] ? a.iconKey : 'spark', 'card-art');
}
function lv10Skin(){return S.theme==='dark'?'dark':S.theme==='mono'?'retro':S.theme==='light'?'light':(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');}
function applyTheme() {
  const skin=lv10Skin(), root=document.documentElement;
  root.dataset.theme=skin==='dark'?'dark':'light';root.dataset.levelnSkin=skin;
  root.classList.add('lv10-root');
  root.style.setProperty('--save',S.colors.save);
  root.style.setProperty('--level',S.colors.level);
  root.style.setProperty('--background-layer', S.bgMode==='image' && S.bgImage?`url("${S.bgImage}")`:'none');
  root.style.setProperty('--background-opacity',S.bgMode==='image'?String((S.bgShade||0)/100):'0');
  root.style.setProperty('--custom-bg',S.bgMode==='color'?S.bgColor:(skin==='dark'?'#071310':'#fffdf8'));
  LevelnPalette10.applyGlobal(root,{leveln:S.colors.level,zaubern:S.colors.save,character:profile().color});
  document.querySelector('#themeMeta').content=skin==='dark'?'#071310':'#fffdf8';
  const variant=['light','dark','mono'].includes(S.iconVariant)?S.iconVariant:(skin==='dark'?'dark':skin==='retro'?'mono':'light');
  const apple=document.querySelector('link[rel="apple-touch-icon"]'),fav=document.querySelector('link[rel="icon"]'),manifest=document.querySelector('link[rel="manifest"]');
  if(apple)apple.href=`./icons/icon-${variant}-180.png`;
  if(fav){fav.href=`./icons/icon-${variant}-192.png`;fav.type='image/png';}
  if(manifest)manifest.href=`./manifest-${variant}.webmanifest`;
}
function lv10Paint(){
  const root=document.documentElement;
  LevelnPalette10.refresh(root);
  for(const el of document.querySelectorAll('[data-quest-color]')){
    const c=el.dataset.questColor;
    if(c)LevelnPalette10.applyQuest(el,c);
  }
}
function render(){
  clearTimeout(timer);
  const todayMode=S.page==='today';
  const app=$('#app');
  app.className='app lv10-app '+(todayMode?'today-app':S.page==='stats'?'stats-app':'')+(S.page==='character'?' character-app':'');
  app.innerHTML=todayMode?todayView():S.page==='goals'?goalsView():S.page==='character'?characterView():S.page==='stats'?statsView():settingsView();
  if(S.page!=='deck-manager')nav();
  renderModal();lv10Paint();
  if(S.packet)armTimer();
}

// --------------------------------------------------------------------
// Single color per quest *for charts*, separate from player-controlled card
// tint. Stable assignments persist: rendering never reassigns chart colors.
// --------------------------------------------------------------------
function lv10CardColor(a){
  if(isOnce(a))return hex(a.color,a.kind==='reduce'?S.colors.save:S.colors.level);
  const g=allGoals().find(g=>g.a.id===a.id);
  return g?goalColor(g):a.kind==='reduce'?S.colors.save:S.colors.level;
}
function lv10Lab(hexValue){
  const m=hexValue?.match(/^#([\da-f]{6})$/i);if(!m)return [0,0,0];
  const rgb=[0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16)/255);
  const lin=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
  const [r,g,b]=rgb.map(lin),l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),
    mm=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),
    s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return [.2104542553*l+.793617785*mm-.0040720468*s,
    1.9779984951*l-2.4285922050*mm+.4505937099*s,
    .0259040371*l+.7827717662*mm-.8086757660*s];
}
function lv10Distance(a,b){const x=lv10Lab(a),y=lv10Lab(b);return Math.hypot((x[0]-y[0])*1.4,x[1]-y[1],x[2]-y[2]);}
function lv10HslColor(h,s=.72,l=.48){const f=n=>{const k=(n+h/30)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))));};return '#'+[0,8,4].map(n=>f(n).toString(16).padStart(2,'0')).join('');}
const LV10_STAT_CANDIDATES=Array.from({length:72},(_,i)=>lv10HslColor((i*137.50776)%360,.7,i%3===0?.39:i%3===1?.53:.63));
function lv10DistinctColor(desired,used){
  desired=hex(desired,'#2caa78');
  if(!used.length||Math.min(...used.map(c=>lv10Distance(desired,c)))>=.115)return desired;
  return LV10_STAT_CANDIDATES.reduce((best,c)=>{
    const score=Math.min(...used.map(u=>lv10Distance(c,u)));
    return score>best.score?{color:c,score}:best;
  },{color:desired,score:-1}).color;
}
function lv10StatisticColor(a){return hex(a.statisticColor,lv10CardColor(a));}
function lv10SkillStatisticColor(skill){return hex(skill.statisticColor,skillColor(skill));}
function lv10NewStatColor(raw,excludeId,forSkills=false){
  const source=forSkills?S.skills:S.activities;
  const used=source.filter(o=>o.id!==excludeId).map(o=>forSkills?lv10SkillStatisticColor(o):lv10StatisticColor(o));
  return lv10DistinctColor(raw,used);
}

// v0.9 -> v0.10: migrate only previous schema. Preserve all original rules,
// recorded quantities, skillRate snapshots and frozen wallet transactions.
function migrateV09toV010(input){
  const d=structuredClone(input);
  validateBackup(d);
  const used=[];
  for(const a of d.activities){
    a.cardShown=a.cardShown!==false;
    a.deckOrder=Number.isFinite(a.deckOrder)?a.deckOrder:(Number.isFinite(a.order)?a.order:0);
    const rev=[...(a.revisions||[])].sort((x,y)=>x.from.localeCompare(y.from)).at(-1);
    const c=hex(a.color,hex(rev?.rules?.[0]?.color,a.kind==='reduce'?'#168a70':'#9be948'));
    a.statisticColor=lv10DistinctColor(a.statisticColor||c,used);
    used.push(a.statisticColor);
  }
  const skillUsed=[];
  for(const skill of d.skills){
    skill.statisticColor=lv10DistinctColor(skill.statisticColor||hex(skill.color,'#65be62'),skillUsed);
    skillUsed.push(skill.statisticColor);
  }
  d.meta=d.meta.filter(x=>x.key!=='schemaVersion');
  d.meta.push({key:'schemaVersion',value:LV10.schema});
  return d;
}
async function migrateInstalled(){
  const version=meta('schemaVersion',1);
  if(version!==4)return;
  const data=migrateV09toV010({activities:S.activities,entries:S.entries,overrides:S.overrides,meta:S.meta,skills:S.skills});
  validateBackup(data);
  await dbTx(STORES,t=>{
    for(const name of STORES)for(const row of data[name])t.objectStore(name).put(row);
  });
  await sync();
}
async function setup(){
  db=await dbOpen();await sync();
  const version=meta('schemaVersion',null);
  if(version===4)await migrateInstalled();
  else if(version!==null && version!==5)throw Error('Leveln 0.10 übernimmt installierte Daten aus Leveln 0.9. Bitte zunächst 0.9 verwenden.');
  else if(version===null)await saveMeta('schemaVersion',5);
  if(!meta('initialized',false))await saveMeta('initialized',true);
  if(!S.started){await saveMeta('v04StartedOn',nowDay());S.started=nowDay();}
  S.skills=await dbAll('skills');
  S.deckKind='build';S.deckManagerKind='build';S.deckManagerOpen=false;S.statSkill='all';
  await reconcile();applyTheme();render();maybeCheckin();
  if('serviceWorker' in navigator && location.protocol==='https:')navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(console.warn);
}
async function importBackup(file){
  if(file.size>60*1024*1024)throw Error('Backup größer als 60 MB');
  const json=JSON.parse(await file.text());
  if(json.format!=='progress-local-backup'||![4,5].includes(json.version))throw Error('Nur Backups aus Leveln 0.9 oder 0.10 sind kompatibel.');
  let data=json.version===4?migrateV09toV010(json.data):structuredClone(json.data);
  validateBackup(data);
  if(meta('schemaVersion',null)!==5)throw Error('App-Datenformat noch nicht initialisiert.');
  if(!confirm(`${data.activities.length} Quests, ${data.entries.length} Tageswerte und ${data.skills.length} Skills importieren? Der derzeitige Datenstand wird ersetzt.`))return;
  await dbTx(STORES,t=>{
    for(const name of STORES){const store=t.objectStore(name);store.clear();for(const item of data[name])store.put(item);}
  });
  S.cardDrafts.clear();S.modal=null;S.packet=null;S.page='today';S.day=nowDay();S.card=0;S.deckKind='build';
  await sync();await reconcile();render();toast('Backup importiert · Datenformat 5');
}
async function exportBackup(){
  const fileName=`Leveln-Backup-${nowDay()}.json`;
  const data={activities:S.activities,entries:S.entries,overrides:S.overrides,meta:S.meta,skills:S.skills};
  const blob=new Blob([JSON.stringify({format:'progress-local-backup',version:5,exportedAt:new Date().toISOString(),appVersion:'0.10',data},null,2)],{type:'application/json'});
  const file=new File([blob],fileName,{type:'application/json'});
  if(navigator.share&&navigator.canShare?.({files:[file]})){
    try{await navigator.share({files:[file]});return;}catch(error){if(error?.name==='AbortError')return;}
  }
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fileName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}

// --------------------------------------------------------------------
// Quest editor: explicit time and count subtables. There is deliberately NO
// "metric" switch in any XP row: the container owns the XP unit.
// --------------------------------------------------------------------
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
      <label class="check-color"><input type="checkbox" name="pinned" ${a?.pinned?'checked':''}> Einmalige Quest im Kartendeck anzeigen</label></div>
  <div id="onceRewards" ${once?'':'hidden'}><h3>Einmalige Abschlussbelohnungen</h3>${(a?a.rewardBindings||[]:[{skillId:S.skills[0]?.id||'__new__',xp:50}]).map(rewardRowHTML).join('')}
    <button class="thin-button" type="button" data-act="binding-add" data-metric="once">＋ Skill-Belohnung</button></div>
  <label>Neuen Skill gleichzeitig anlegen (optional)<input name="newSkillName" maxlength="60" placeholder="z. B. Organisation"></label>
  <label>Kartenfarbe<input type="color" name="goalColor" value="${clr}"></label>
  ${a?`<label>Statistikfarbe (unabhängig)<input type="color" name="statColor" value="${lv10StatisticColor(a)}"></label>`:''}
  <div class="sheet-actions"><button type="button" class="thin-button" data-act="modal-close">Abbrechen</button><button class="primary" type="submit">Quest speichern</button></div>
  </form>`);
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
    out.availableFrom=from;out.availableUntil=to;out.pinned=f.pinned.checked;
    out.rewardBindings=bindings;out.revisions=[];out.color=color;
  }else{
    const start=f.startDate.value;
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
  await dbTx(newSkill?['activities','skills']:['activities'],t=>{t.objectStore('activities').put(out);if(newSkill)t.objectStore('skills').put(newSkill);});
  S.modal=null;S.cardDrafts.clear();await sync();S.page='goals';render();toast('Quest gespeichert');
}
async function saveSkill(form){
  const original=skillById(S.modal.id),skill=original?structuredClone(original):{id:uid(),createdAt:new Date().toISOString()};
  skill.name=form.elements.name.value.trim();if(!skill.name)throw Error('Bitte Skillnamen angeben.');
  skill.description=form.elements.description.value.slice(0,350);
  skill.color=hex(form.elements.color.value,profile().color);
  skill.icon=form.elements.icon.value;skill.updatedAt=new Date().toISOString();
  if(!original)skill.statisticColor=lv10NewStatColor(skill.color,null,true);
  await dbPut('skills',skill);S.modal=null;await sync();render();toast('Skill gespeichert');
}

// --------------------------------------------------------------------
// Two decks / persistent player ordering / compact direct-play controls.
// --------------------------------------------------------------------
function lv10DeckGoals(day=S.day,kind=S.deckKind||'build'){
  return goals(day).filter(g=>g.a.kind===kind&&g.a.cardShown!==false&&(!isOnce(g.a)||g.a.pinned))
    .sort((a,b)=>(a.a.deckOrder??a.a.order??0)-(b.a.deckOrder??b.a.order??0)||a.a.name.localeCompare(b.a.name,'de'));
}
function lv10DeckSelect(kind){
  S.cardByKind||={build:0,reduce:0};
  S.cardByKind[S.deckKind||'build']=S.card;
  S.deckKind=kind;S.card=S.cardByKind[kind]||0;S.cardDrafts.clear();
  render();vibrate();
}
function rotate(step){const g=lv10DeckGoals();S.card=(S.card+step+g.length)%Math.max(1,g.length);S.cardByKind||={build:0,reduce:0};S.cardByKind[S.deckKind||'build']=S.card;render();}
function manaPanel(g){
  const data=manaInPeriod(g);if(!data)return '';
  return `<div class="mana-budget">${metricKeys(g.r).map(k=>{
    const total=ruleValue(g.r,k),used=data.used[k],remaining=Math.max(0,total-used);
    return `<div class="mana-row">${ico('mana','resource-gem')}<span><b>${data.unknown?'?':num(remaining,1)} / ${num(total,1)} ${k==='minutes'?'min':'×'}</b><small>${data.unknown?'Verbrauch noch unklar':'Mana übrig'} · ${k==='minutes'?'Zeit':'Anzahl'}</small></span></div>`;
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
  return `<div class="play-card lv-card ${behind?'peek':'face lv-card--primary'} ${glow} ${once?'once-card':''}" style="--card-accent:${cardColor}" data-quest-color="${cardColor}" ${behind?'':'id="activeCard"'} data-goal="${k}">${!behind&&glow?'<div class="lv10-flame-trim" aria-hidden="true"><i class="top"></i><i class="bottom"></i><i class="left"></i><i class="right"></i></div>':''}
  <div class="card-header"><span class="card-pill">${once?'EINMALIG':a.kind==='reduce'?'ZAUBERN':'LEVELN'}</span>
    <span class="card-head-icon">${ico(once?'scroll':a.kind==='reduce'?'zaubern':'leveln')}</span>
    ${behind?'':`<button class="lv10-card-edit" data-act="${once?'once-edit':'edit-goal'}" ${once?`data-id="${safe(a.id)}"`:`data-key="${k}"`} aria-label="Quest bearbeiten">${ico('dots')}</button>`}</div>
  <div class="card-main">${art(a)}<h2>${safe(a.name)}</h2><p>${once?(a.availableUntil?'Bis '+pretty(a.availableUntil):'Ohne Zeitlimit')+' · einmalige Quest':safe(detailGoal(g))}</p>
    ${!once&&a.kind==='reduce'?manaPanel(g):''}<small class="card-daily-tally">${safe(subtext)}</small>
    ${!behind&&!once?lv10PlayControls(g):''}</div>
  <div class="card-foot"><span class="streak">${once?ico('check')+' '+num((a.rewardBindings||[]).reduce((s,b)=>s+b.xp,0),1)+' XP':ico('flame')+' '+st}</span><b class="card-short">${safe(abbr)}</b><span class="played-label">${once?'MISSION':a.kind==='reduce'?'MANA':'XP'}</span></div></div>`;
}
function todayView(){
  if(!canEdit(S.day))S.day=nowDay();
  const gs=lv10DeckGoals(),all=goals(S.day),kind=S.deckKind||'build';
  S.card=Math.min(Math.max(0,S.card),Math.max(0,gs.length-1));
  const g=gs[S.card],type=kind==='reduce'?'ZAUBERN':'LEVELN';
  return `<div class="today-head"><div class="today-topline"><span>${type} · KARTENDECK</span><span>${all.filter(x=>x.a.kind===kind).length} Quests</span></div>${xpBar()}</div>
  <div class="lv10-deck-toggle"><button data-act="deck-select" data-kind="build" class="${kind==='build'?'on':''}">${ico('leveln')} Leveln</button><button data-act="deck-select" data-kind="reduce" class="${kind==='reduce'?'on':''}">${ico('zaubern')} Zaubern</button><button data-act="deck-open" class="lv10-deck-settings" aria-label="Karten verwalten">${ico('settings')}</button></div>
  <div class="deck-area">${g?`<div class="deck-stack">${[2,1].map(i=>{
    if(gs.length<=i)return '';const next=gs[(S.card+i)%gs.length];
    return `<div class="peek-wrap peek-${i}">${cardHtml(next,true)}</div>`;
  }).join('')}${cardHtml(g)}<div class="deck-gesture-tail" role="presentation" aria-hidden="true"></div></div>`:
  `<div class="empty-state">${ico(kind==='reduce'?'mana':'leveln')}<h2>Keine Karten auf diesem Stapel</h2><p>Wechsle den Stapel oder wähle im Kartenmenü Quests aus.</p><button class="primary" data-act="deck-open">Karten verwalten</button></div>`}</div>
  <div class="deck-caption">${gs.length?`${S.card+1}/${gs.length} Karten · `:''}${pretty(S.day,{day:'numeric',month:'short'})} · Wischen: seitlich / ↑ spielen / ↓ wechseln</div>`;
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

// Compact quest board retains the sticky calendar and the all-quests view.
function goalsView(){
  const archived=allGoals().filter(g=>!isOnce(g.a)&&!goals().some(x=>x.key===g.key)),once=S.activities.filter(isOnce);
  const filters=[['all','Alle'],['once','Einmalig'],['day','Täglich'],['week','Wöchentlich'],['month','Monatlich'],['year','Jährlich'],['archive','Archiv']];
  const show=p=>S.questFilter==='all'||S.questFilter===p;
  return `<div class="page-heading"><span class="eyebrow">DEIN ABENTEUER</span><h1>Quests</h1></div>
    <div class="goals-sticky">${calendarHTML()}</div>
    <div class="quest-filter-bar">${filters.map(([k,v])=>`<button data-act="quest-filter" data-filter="${k}" class="quest-filter ${S.questFilter===k?'selected':''}">${v}</button>`).join('')}</div>
    <div class="goals-scroll"><div class="goals-actions lv10-goals-actions">
      <button class="thin-button" data-act="edit-day" data-day="${nowDay()}">${ico('edit')}<span>Heute korrig.</span></button>
      <button class="thin-button" data-act="edit-day" data-day="${dayAdd(nowDay(),-1)}">${ico('edit')}<span>Gestern korrig.</span></button>
      <button class="thin-button" data-act="deck-open">${ico('settings')}<span>Karten</span></button>
      <button class="thin-button add-quest-button" data-act="new">${ico('plus')}<span>Neue Quest</span></button></div>
    ${show('once')?`<section class="goal-section"><h3>${ico('scroll')} EINMALIGE QUESTS</h3>${once.filter(a=>!a.archivedAt&&!a.completedAt).map(onceQuestRow).join('')||'<p class="muted">Keine offenen Missionen</p>'}</section>`:''}
    ${goalGroups().filter(gr=>show(gr.p)).map(gr=>`<section class="goal-section"><h3>${({day:'TÄGLICHE',week:'WÖCHENTLICHE',month:'MONATLICHE',year:'JÄHRLICHE'})[gr.p]} QUESTS</h3>${gr.items.map(g=>goalRow(g)).join('')||'<p class="muted">Noch keine Quests</p>'}</section>`).join('')}
    ${show('archive')?`<section class="goal-section archived-list"><h3>ARCHIV & ABGESCHLOSSEN</h3>${archived.map(g=>goalRow(g,true)).join('')}${once.filter(a=>a.archivedAt||a.completedAt).map(onceQuestRow).join('')||'<p class="muted">Keine archivierten Quests</p>'}</section>`:''}</div>`;
}

// --------------------------------------------------------------------
// Statistics with persistent, distinguishable quest/skill colors.
// For skill-filtered time/count: an event's amount is allocated pro rata by
// the event's *XP* allocations. Hence split contributions never double count.
// --------------------------------------------------------------------
function lv10StatValue(e,metric,skill='all'){
  const original=metric==='xp'?e.xp:metric===e.metric?e.amount:0;
  if(skill==='all')return original;
  const xpForSkill=(e.allocations||[]).filter(a=>effectiveFate(a.skillId)===skill).reduce((sum,a)=>sum+a.amount,0);
  if(!e.xp||!xpForSkill)return 0;
  return metric==='xp'?xpForSkill:original*xpForSkill/e.xp;
}
function statsView(){
  const ev=statEvents(),metric=S.statMetric||'minutes',unit=metric==='minutes'?'h':metric==='count'?'×':'XP',fac=metric==='minutes'?1/60:1;
  const chosen=S.statGoal||'all',skill=S.statSkill||'all';
  // Denominator deliberately unfiltered (same overall baseline as 0.9).
  const total=ev.reduce((sum,e)=>sum+lv10StatValue(e,metric),0)*fac;
  const filtered=ev.filter(e=>chosen==='all'||e.goal===chosen);
  const parts=[],individual=S.statStack;
  const grouped=new Map();
  for(const e of filtered){
    const g=goalByKey(e.goal),val=lv10StatValue(e,metric,skill)*fac;if(val<=0)continue;
    if(!g)continue;
    let key,name,color;
    if(skill!=='all'){
      if(individual && chosen==='all'){
        key=e.goal;name=g.a.name;color=lv10StatisticColor(g.a);
      }else{
        key=skill;name=skillById(skill)?.name||'Skill';color=lv10SkillStatisticColor(skillById(skill)||{color:profile().color});
      }
    }else if(chosen!=='all'||individual){
      key=e.goal;name=g.a.name;color=lv10StatisticColor(g.a);
    }else{
      key=e.kind;name=e.kind==='save'?'Zaubern':'Leveln';color=e.kind==='save'?S.colors.save:S.colors.level;
    }
    const o=grouped.get(key)||{name,color,value:0};o.value+=val;grouped.set(key,o);
  }
  parts.push(...grouped.values());
  const value=parts.reduce((s,p)=>s+p.value,0),scale=total>0?Math.min(100,value/total*100):0,{start,end}=statsRange();
  return `<div class="stats-compact lv10-statistics"><div class="page-heading"><span class="eyebrow">DEINE BILANZ</span><h1>Statistik</h1></div>
  <div class="stats-controls"><div class="stats-two-filter"><label>Zeitraum<div class="stats-period">${['day','week','month','year','all'].map((p,i)=>`<button data-act="stat-period" data-period="${p}" class="${S.statPeriod===p?'selected':''}">${['Tag','Woche','Monat','Jahr','Gesamt'][i]}</button>`).join('')}</div></label>
  <label>Quest<select id="statGoal"><option value="all">Alle Quests</option>${allGoals().map(g=>`<option value="${safe(g.key)}" ${chosen===g.key?'selected':''}>${safe(g.a.name)} · ${NAMES[g.r.period]||'Einmalig'}</option>`).join('')}</select></label>
  <label>Skill<select id="statSkill"><option value="all">Alle Skills</option>${S.skills.map(s=>`<option value="${safe(s.id)}" ${skill===s.id?'selected':''}>${safe(s.name)}</option>`).join('')}</select></label></div>
  <div class="stats-metric">${[['minutes','Zeit'],['count','Anzahl'],['xp','XP']].map(([k,t])=>`<button data-act="stat-metric" data-metric="${k}" class="${metric===k?'selected':''}">${t}</button>`).join('')}</div>
  <div class="stats-nav"><button class="icon-button" data-act="stat-prev" ${S.statPeriod==='all'?'disabled':''}>‹</button><span>${S.statPeriod==='all'?'Gesamter Zeitraum':`${pretty(start,{day:'numeric',month:'short',year:'numeric'})} – ${pretty(dayAdd(end,-1),{day:'numeric',month:'short',year:'numeric'})}`}</span><button class="icon-button" data-act="stat-next" ${S.statPeriod==='all'?'disabled':''}>›</button></div></div>
  <div class="stats-single"><div class="stat-head"><small>Beitrag zum Gesamtwert</small><strong>${num(value,1)} / ${num(total,1)} ${unit}</strong><small>${total?num(value/total*100,1):0} %</small></div>
  <div class="single-bar-track"><div class="single-bar-fill" style="height:${scale}%">${parts.map(p=>`<div class="single-bar-segment" style="flex:${p.value};background:${p.color}" title="${safe(p.name)} · ${num(p.value,1)} ${unit}"></div>`).join('')}</div></div>
  <div class="bar-key">${parts.map(p=>`<span><i style="background:${p.color}"></i>${safe(p.name)} · ${num(p.value,1)} ${unit}</span>`).join('')||'<span>Keine Beiträge im Zeitraum</span>'}</div></div>
  <label class="stat-checkbox"><input type="checkbox" id="statStack" ${individual?'checked':''}> Einzelne Quests getrennt darstellen</label></div>`;
}

// --------------------------------------------------------------------
// Full-screen card manager with miniature preview, visibility & drag sorting.
// Independent deck order per kind; no historical activity.order changes.
// --------------------------------------------------------------------
function lv10ManagerActivities(kind=S.deckManagerKind||'build'){
  return S.activities.filter(a=>a.kind===kind&&!a.archivedAt&&!a.completedAt)
    .sort((a,b)=>(a.deckOrder??a.order??0)-(b.deckOrder??b.order??0)||a.name.localeCompare(b.name,'de'));
}
function lv10ManagerMini(a){
  return `<div class="lv10-mini-card ${a.cardShown===false?'hidden-card':''}" data-id="${safe(a.id)}" data-quest-color="${lv10CardColor(a)}">
   <span class="lv10-mini-art">${art(a)}</span><strong>${safe(shortCode(a.shortName||a.name))}</strong></div>`;
}
function lv10ManagerRender(){
  if(!S.deckManagerOpen){$('#deckManagerRoot').innerHTML='';document.body.classList.remove('deck-menu-open');return;}
  document.body.classList.add('deck-menu-open');
  const kind=S.deckManagerKind||'build',items=lv10ManagerActivities(kind);
  $('#deckManagerRoot').innerHTML=`<section class="lv10-manager" role="dialog" aria-modal="true" aria-label="Karten verwalten">
   <header class="lv10-manager-header"><strong>Kartendeck</strong><small>Sichtbarkeit & Reihenfolge</small><button data-act="deck-close" aria-label="Schließen">${ico('close')}</button></header>
   <div class="lv10-manager-kind"><button data-act="manager-kind" data-kind="build" class="${kind==='build'?'on':''}">${ico('leveln')} Leveln</button><button data-act="manager-kind" data-kind="reduce" class="${kind==='reduce'?'on':''}">${ico('zaubern')} Zaubern</button></div>
   <div class="lv10-manager-content">
     <div class="lv10-manager-list" aria-label="Reihenfolge">
       ${items.map(a=>`<div class="lv10-manager-list-row" data-id="${safe(a.id)}"><button type="button" class="lv10-drag-handle" aria-label="${safe(a.name)} verschieben">☷</button>
         <span>${safe(shortCode(a.shortName||a.name))}</span><label class="lv10-switch" title="Auf Stapel anzeigen"><input type="checkbox" data-id="${safe(a.id)}" class="lv10-card-visible" ${a.cardShown!==false?'checked':''}><i></i></label></div>`).join('')||'<p>Noch keine Quests</p>'}
     </div>
     <div class="lv10-manager-minis">${items.map(lv10ManagerMini).join('')||'<p>Erstelle zuerst eine Quest.</p>'}</div>
   </div>
   <footer class="lv10-manager-footer"><button data-act="manager-sort" data-sort="alpha" data-dir="1">A → Z</button><button data-act="manager-sort" data-sort="alpha" data-dir="-1">Z → A</button><button data-act="manager-sort" data-sort="period" data-dir="1">Tag → Jahr</button><button data-act="manager-sort" data-sort="period" data-dir="-1">Jahr → Tag</button><button class="lv10-manager-exit" data-act="deck-close" aria-label="Kartenmenü schließen">✕</button></footer>
  </section>`;
  for(const mini of $('#deckManagerRoot').querySelectorAll('[data-quest-color]'))LevelnPalette10.applyQuest(mini,mini.dataset.questColor);
}
function lv10ManagerOpen(origin=S.page){
  S.deckManagerOrigin=origin;S.deckManagerOpen=true;S.deckManagerKind=S.deckKind||'build';
  S.moreOpen=false;lv10ManagerRender();
}
function lv10ManagerClose(){
  S.deckManagerOpen=false;lv10ManagerRender();
  // Overlay only: we never navigated away from the source page.
  render();
}
async function lv10SaveDeckOrder(ids){
  const positions=new Map(ids.map((id,index)=>[id,index]));
  const changed=S.activities.filter(a=>positions.has(a.id)&&a.deckOrder!==positions.get(a.id));
  if(!changed.length)return;
  await dbTx(['activities'],t=>{
    const store=t.objectStore('activities');for(const old of changed)store.put({...old,deckOrder:positions.get(old.id)});
  });
  await sync();
}
async function lv10SortDeck(sort,dir){
  const order={day:0,week:1,month:2,year:3};
  const items=lv10ManagerActivities().sort((a,b)=>{
    const p=a.revisions?.at(-1)?.rules?.[0]?.period||'once',q=b.revisions?.at(-1)?.rules?.[0]?.period||'once';
    const cmp=sort==='alpha'?a.name.localeCompare(b.name,'de'):(order[p]??4)-(order[q]??4)||a.name.localeCompare(b.name,'de');
    return cmp*dir;
  });
  await lv10SaveDeckOrder(items.map(a=>a.id));lv10ManagerRender();render();
}
async function lv10ToggleCard(id,on){
  const a=S.activities.find(x=>x.id===id);if(!a)return;
  const out=structuredClone(a);out.cardShown=on;
  if(isOnce(out))out.pinned=on;
  await dbPut('activities',out);await sync();
  lv10ManagerRender();render();
}

// --------------------------------------------------------------------
// Contextual actions; keep existing 0.9 routes for unchanged features.
// --------------------------------------------------------------------
function handleAction(act,el){
  if(act==='export'){S.moreOpen=false;nav();exportBackup().catch(showError);return;}
  if(act==='more-toggle'){S.moreOpen=!S.moreOpen;nav();return;}
  if(act==='icon-open'){openIconGallery(el);return;}
  if(act==='icon-choice'){chooseIcon(el.dataset.value);return;}
  if(act==='icon-category'){S.iconCategory=el.dataset.category;renderIconGallery();return;}
  if(act==='icon-close'){closeIconGallery();return;}
  if(act==='deck-open'){lv10ManagerOpen();return;}
  if(act==='deck-close'){lv10ManagerClose();return;}
  if(act==='deck-select'){if(S.deckKind!==el.dataset.kind)lv10DeckSelect(el.dataset.kind);return;}
  if(act==='manager-kind'){S.deckManagerKind=el.dataset.kind;lv10ManagerRender();return;}
  if(act==='manager-sort'){lv10SortDeck(el.dataset.sort,Number(el.dataset.dir)).catch(showError);return;}
  if(act==='metric-enable'){
    const wrapper=el.closest('#recurringRates'),metric=el.dataset.metric;
    if(!wrapper)return;
    const form=el.closest('form'),period=form.elements.period.value;
    el.outerHTML=lv10MetricTable(metric,{period,minutes:null,count:null},[],true);
    // The user actively chooses the unit: no automatic XP row is generated.
    return;
  }
  if(act==='metric-remove'){
    if(!confirm('Diese Zielart und ihre Skill-XP-Zeilen aus der Questkonfiguration entfernen?'))return;
    el.closest('.lv10-metric-table').outerHTML=lv10MetricTable(el.dataset.metric,{},[],false);return;
  }
  if(act==='binding-add'){
    const form=el.closest('form'),metric=el.dataset.metric||'minutes';
    if(metric==='once')form.querySelector('#onceRewards').insertAdjacentHTML('beforeend',rewardRowHTML({skillId:S.skills[0]?.id||'__new__',xp:10}));
    else el.closest('.lv10-metric-table')?.querySelector('.lv10-rate-rows').insertAdjacentHTML('beforeend',lv10RateRow(metric,{skillId:S.skills[0]?.id||'__new__',rate:10}));
    return;
  }
  if(act==='binding-remove'){el.closest('.binding-row')?.remove();return;}
  (async()=>{if(await handleRPGAction(act,el))return;await handleAction05(act,el);})().catch(showError);
}
function renderIconGallery(){
  const root=$('#iconPickerRoot');if(!root||!pickerSelect)return;
  const listed=Object.entries(ICON_GROUPS).filter(([k])=>k!=='Alle');
  const icons=S.iconCategory==='Alle'?[...new Set(listed.flatMap(([,keys])=>keys))]:(ICON_GROUPS[S.iconCategory]||[]);
  root.innerHTML=`<div class="gallery-backdrop" data-act="icon-close"><section class="icon-gallery lv10-gallery" role="dialog" aria-modal="true" aria-label="Symbol wählen">
    <header><h2>Symbol wählen</h2><button data-act="icon-close" class="icon-gallery-x">${ico('close')}</button></header>
    <div class="icon-categories">${Object.keys(ICON_GROUPS).map(cat=>`<button class="${S.iconCategory===cat?'on':''}" data-act="icon-category" data-category="${safe(cat)}">${safe(cat)}</button>`).join('')}</div>
    <div class="icon-gallery-grid">${pickerSelect.name==='iconKey'?`<button class="icon-tile ${pickerSelect.value===''?'picked':''}" data-act="icon-choice" data-value="">${ico('spark')}<small>Standard</small></button>`:''}
      ${icons.filter(k=>ICON_MAP10[k]).map(k=>`<button class="icon-tile ${pickerSelect.value===k?'picked':''}" data-act="icon-choice" data-value="${safe(k)}">${ico(k)}<small>${safe(ICON_NAMES[k]||'Symbol')}</small></button>`).join('')}</div></section></div>`;
}
function settingsView(){
  const original=settingsView05();
  let html=original.replace('<h1>Optionen</h1>','<h1>Einstellungen</h1>');
  html=html.replace('<option value="dark"','<option value="mono" '+(S.theme==='mono'?'selected':'')+'>Minimalistisch · Retro</option><option value="dark"');
  html=html.replace(/<label>Paket-Timeout[\s\S]*?<\/label>/,'');
  html=html.replaceAll(ico('flame'),ico('ember'));
  return html+`<details class="settings-panel mini-doc"><summary>So funktioniert Leveln</summary>
  <p>↑ spielt die aktuelle Ausspielmenge; dieselbe Karte kann mehrfach verwendet werden. ←/→ zeigt andere Karten. Kurz ↓ wechselt zwischen Leveln und Zaubern; lang ↓ halten öffnet die Kartenverwaltung. Die +/- Tasten passen die Ausspielmenge an, langes Halten beschleunigt. Leveln vergibt XP für tatsächliche Leistung. Zaubern bucht sofort Mana-Verbrauch; erspartes Mana wird am Ende des Bewertungszeitraums zu XP.</p>
  <p>Flamme = Streak; Schneeflocke = Freeze; Glut = glühende Kohle. 100 XP je Skill-Stufe, 1000 XP je Charakterlevel. <b>Leveln 0.10 · Datenformat 5</b></p></details>`;
}

// --------------------------------------------------------------------
// iPhone interactions. Long-hold acceleration is capped at +30 minutes or
// +10 count *per repeat*; never cap the total quantity. No gesture competes
// with a stepper or the drag handle. Previous booking entries are additive.
// --------------------------------------------------------------------
let lv10Hold=null,lv10GestureTimer=null,lv10Dragging=null;
function lv10StepAmount(h,step){
  const g=goalByKey(h.key,S.day);if(!g||!metricKeys(g.r).includes(h.metric))return;
  const draft=cardDraft(g);
  const current=Number(draft[h.metric]||0),v=Math.max(0,Math.min(10000000,current+h.direction*step));
  draft[h.metric]=String(Math.round(v*100)/100);
  const value=h.button.closest('.lv10-amount-stepper')?.querySelector('.lv10-amount-value');
  if(value)value.innerHTML=`${num(v,1)} <em>${h.metric==='minutes'?'Min.':'×'}</em>`;
}
function lv10HoldTick(){
  const h=lv10Hold;if(!h)return;
  const ms=performance.now()-h.start,max=h.metric==='minutes'?30:10;
  const step=Math.min(max,ms<800?1:ms<1500?2:ms<2500?5:ms<3500?10:max);
  lv10StepAmount(h,step);
  h.timer=setTimeout(lv10HoldTick,Math.max(60,200-ms/45));
}
function lv10HoldStop(){
  const h=lv10Hold;if(!h)return;
  lv10Hold=null;clearTimeout(h.timer);
  const g=goalByKey(h.key,S.day);
  if(g){
    const value=cardDraft(g)[h.metric];
    updatePlayAmount(h.key,h.metric,value).then(()=>{
      if(S.page==='today'&&!S.deckManagerOpen)render();
    }).catch(showError);
  }
}
function lv10DragSave(){
  if(!lv10Dragging)return;
  lv10Dragging=null;
  const ids=[...$('#deckManagerRoot').querySelectorAll('.lv10-manager-list-row')].map(el=>el.dataset.id);
  lv10SaveDeckOrder(ids).then(()=>{lv10ManagerRender();render();}).catch(showError);
}
// Runs at capture before the legacy document gesture listeners in app.js.
document.addEventListener('pointerdown',e=>{
  const step=e.target.closest('.lv10-step');
  if(step){
    if(step.disabled)return;
    e.preventDefault();e.stopPropagation();
    const h={button:step,key:step.dataset.goal,metric:step.dataset.metric,direction:Number(step.dataset.direction),start:performance.now(),timer:0};
    if(lv10Hold)lv10HoldStop();
    lv10Hold=h;lv10StepAmount(h,1);
    h.timer=setTimeout(lv10HoldTick,440);
    step.setPointerCapture?.(e.pointerId);
    return;
  }
  const drag=e.target.closest('.lv10-drag-handle');
  if(drag){
    e.preventDefault();e.stopPropagation();
    lv10Dragging={id:e.pointerId,row:drag.closest('.lv10-manager-list-row')};
    drag.setPointerCapture?.(e.pointerId);
    lv10Dragging.row?.classList.add('lv10-dragging');
  }
},{capture:true});
document.addEventListener('pointermove',e=>{
  if(lv10Dragging&&e.pointerId===lv10Dragging.id){
    e.preventDefault();
    const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.lv10-manager-list-row');
    const row=lv10Dragging.row;
    if(target&&row&&target!==row){
      const list=target.parentElement;
      const before=e.clientY<target.getBoundingClientRect().top+target.offsetHeight/2;
      list.insertBefore(row,before?target:target.nextSibling);
    }
    e.stopPropagation();return;
  }
  if(gesture&&gesture.id===e.pointerId){
    const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
    if(dy>83&&Math.abs(dx)<75&&!lv10GestureTimer){
      lv10GestureTimer=setTimeout(()=>{
        if(gesture){gesture.el.style.transform='';gesture=null;lv10ManagerOpen();vibrate();}
        lv10GestureTimer=null;
      },540);
    }else if((dy<68||Math.abs(dx)>88)&&lv10GestureTimer){clearTimeout(lv10GestureTimer);lv10GestureTimer=null;}
  }
},{capture:true,passive:false});
document.addEventListener('pointerup',e=>{
  if(lv10GestureTimer){clearTimeout(lv10GestureTimer);lv10GestureTimer=null;}
  if(lv10Hold){e.stopPropagation();lv10HoldStop();}
  if(lv10Dragging&&e.pointerId===lv10Dragging.id){
    e.preventDefault();e.stopPropagation();lv10DragSave();
  }
},{capture:true});
document.addEventListener('pointercancel',()=>{
  clearTimeout(lv10GestureTimer);lv10GestureTimer=null;
  if(lv10Hold)lv10HoldStop();
  if(lv10Dragging)lv10DragSave();
},{capture:true});
document.addEventListener('change',e=>{
  const el=e.target;
  if(el.id==='statSkill'){S.statSkill=el.value;render();}
  if(el.classList.contains('lv10-card-visible'))lv10ToggleCard(el.dataset.id,el.checked).catch(showError);
});

// Theme colors and masks are re-applied to dynamically inserted content.
window.addEventListener('pageshow',()=>{if(S.meta?.length)applyTheme();});

// Startup only after ALL Leveln 0.10 overrides have been registered.
if (!globalThis.__LEVELN_UNIT_TEST__) setup().catch(e=>{
  $('#app').innerHTML=`<div class="fatal"><h2>Leveln konnte nicht starten</h2><p>${safe(e?.message||String(e))}</p><p>Erstelle gegebenenfalls ein Backup in Leveln 0.9 und lade die App neu.</p></div>`;
  console.error('Leveln 0.10 startup',e);
});
