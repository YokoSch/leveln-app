/*
 * LEVELN 0.10 · pages/statistik/page.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

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
  const filtered=ev.filter(e=>chosen==='all'||(chosen==='past'?!!goalByKey(e.goal)?.a.removedAt:e.goal===chosen));
  const parts=[],individual=S.statStack;
  const grouped=new Map();
  for(const e of filtered){
    const g=goalByKey(e.goal),val=lv10StatValue(e,metric,skill)*fac;if(val<=0)continue;
    if(!g)continue;
    let key,name,color;
    if(g.a.removedAt){key='past';name='Vergangenes';color='#8c91a8';}
    else if(skill!=='all'){
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
  <label>Quest<select id="statGoal"><option value="all">Alle Quests</option><option value="past" ${chosen==='past'?'selected':''}>Vergangenes · erhaltene Erfolge</option>${allGoals().filter(g=>!g.a.removedAt).map(g=>`<option value="${safe(g.key)}" ${chosen===g.key?'selected':''}>${safe(g.a.name)} · ${NAMES[g.r.period]||'Einmalig'}</option>`).join('')}</select></label>
  <label>Skill<select id="statSkill"><option value="all">Alle Skills</option>${S.skills.map(s=>`<option value="${safe(s.id)}" ${skill===s.id?'selected':''}>${safe(s.name)}</option>`).join('')}</select></label></div>
  <div class="stats-metric">${[['minutes','Zeit'],['count','Anzahl'],['xp','XP']].map(([k,t])=>`<button data-act="stat-metric" data-metric="${k}" class="${metric===k?'selected':''}">${t}</button>`).join('')}</div>
  <div class="stats-nav"><button class="icon-button" data-act="stat-prev" ${S.statPeriod==='all'?'disabled':''}>‹</button><span>${S.statPeriod==='all'?'Gesamter Zeitraum':`${pretty(start,{day:'numeric',month:'short',year:'numeric'})} – ${pretty(dayAdd(end,-1),{day:'numeric',month:'short',year:'numeric'})}`}</span><button class="icon-button" data-act="stat-next" ${S.statPeriod==='all'?'disabled':''}>›</button></div></div>
  <div class="stats-single"><div class="stat-head"><small>Beitrag zum Gesamtwert</small><strong>${num(value,1)} / ${num(total,1)} ${unit}</strong><small>${total?num(value/total*100,1):0} %</small></div>
  <div class="single-bar-track"><div class="single-bar-fill" style="height:${scale}%">${parts.map(p=>`<div class="single-bar-segment" style="flex:${p.value};background:${p.color}" title="${safe(p.name)} · ${num(p.value,1)} ${unit}"></div>`).join('')}</div></div>
  <div class="bar-key">${parts.map(p=>`<span><i style="background:${p.color}"></i>${safe(p.name)} · ${num(p.value,1)} ${unit}</span>`).join('')||'<span>Keine Beiträge im Zeitraum</span>'}</div></div>
  <label class="stat-checkbox"><input type="checkbox" id="statStack" ${individual?'checked':''}> Einzelne Quests getrennt darstellen</label></div>`;
}
