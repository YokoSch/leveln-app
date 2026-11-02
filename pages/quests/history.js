/* Leveln 0.11.3 – Historische Erfolge im Questformular.
 * Historische Einträge sind reguläre Tages-Einträge (source:user) mit einem
 * Herkunftsmerkmal, um sie bei Korrekturen idempotent ersetzen zu können.
 * Die Glut für die Vorgeschichte wird NUR beim ersten Speichern ermittelt.
 */
'use strict';

function lv113HistoryForm(a,once,r){
  const cutoff=[a?.originalCreatedOn || a?.createdAt?.slice(0,10) || nowDay(),nowDay()].sort()[0];
  const ranges=a?.historicalRanges||[];
  return `<details id="lv113-history" class="lv113-history" ${once?'hidden':''}>
    <summary>${ico('calendar')} Bisherige Erfolge <small>optional · rückwirkend</small></summary>
    <p class="muted">Die Menge gilt für <b>jeden Tag</b> des Zeitraums. Nur Tage vor ${pretty(cutoff)}. Die XP werden wie bei regulären Buchungen berechnet. Historische Glut gibt es ausschließlich bei der ersten Questerstellung.</p>
    <div id="lv113-history-rows">${ranges.map(x=>lv113HistoryRow(x)).join('')}</div>
    <button type="button" class="thin-button" data-act="history-add">＋ Zeitraum hinzufügen</button>
  </details>`;
}

function lv113HistoryRow(row={}){
  const activityId=S.modal?.activityId || (S.modal?.key?S.modal.key.split('|')[0]:null);
  const old=S.activities.find(a=>a.id===activityId);
  const cutoff=[old?.originalCreatedOn||old?.createdAt?.slice(0,10)||nowDay(),nowDay()].sort()[0];
  const max=dayAdd(cutoff||nowDay(),-1),start=row.start||max,end=row.end||max;
  return `<div class="lv113-history-range">
    <div class="lv113-history-head"><strong>Historischer Zeitraum</strong><button type="button" data-act="history-remove" aria-label="Zeitraum entfernen">×</button></div>
    <div class="field-grid"><label>Von<input class="lv113-h-start" type="date" max="${max}" value="${safe(start)}" required></label>
      <label>Bis (einschl.)<input class="lv113-h-end" type="date" max="${max}" value="${safe(end)}" required></label></div>
    <div class="field-grid"><label class="lv113-h-time">Minuten pro Tag<input class="lv113-h-minutes" type="number" min="0" max="1000000" step="0.01" value="${safe(row.minutes??0)}"></label>
      <label class="lv113-h-count">Anzahl pro Tag<input class="lv113-h-count-value" type="number" min="0" max="1000000" step="1" value="${safe(row.count??0)}"></label></div>
  </div>`;
}

function lv113SyncHistoryInputs(form){
  if(!form)return;
  const wrapper=form.querySelector('#lv113-history');if(!wrapper)return;
  const time=!!form.querySelector('.lv10-metric-table[data-metric="minutes"]');
  const count=!!form.querySelector('.lv10-metric-table[data-metric="count"]');
  wrapper.querySelectorAll('.lv113-h-time').forEach(el=>{el.hidden=!time;el.querySelector('input').disabled=!time});
  wrapper.querySelectorAll('.lv113-h-count').forEach(el=>{el.hidden=!count;el.querySelector('input').disabled=!count});
}

function lv113AddHistoryRange(form){
  const wrap=form?.querySelector('#lv113-history-rows');if(!wrap)return;
  const row={};
  const min=form.elements.minutes?.value,count=form.elements.count?.value;
  if(min!==undefined)row.minutes=min||0;
  if(count!==undefined)row.count=count||0;
  wrap.insertAdjacentHTML('beforeend',lv113HistoryRow(row));
  lv113SyncHistoryInputs(form);
  form.querySelector('#lv113-history').open=true;
}

function lv113ReadHistory(form,out,old){
  if(isOnce(out))return {ranges:[],writes:[],deletes:[],wallet:null};
  const cutoff=[old?.originalCreatedOn||old?.createdAt?.slice(0,10)||nowDay(),nowDay()].sort()[0];
  const r=out.revisions.at(0)?.rules?.[0];
  const active=revision(out,nowDay()).rules?.[0]||r;
  const metrics=metricKeys(active);
  const seen=new Set(),ranges=[],writes=[];
  const byId=new Map(S.entries.map(e=>[e.id,e]));
  for(const row of form.querySelectorAll('#lv113-history-rows .lv113-history-range')){
    const start=row.querySelector('.lv113-h-start').value,end=row.querySelector('.lv113-h-end').value;
    if(!/^\d{4}-\d\d-\d\d$/.test(start)||!/^\d{4}-\d\d-\d\d$/.test(end)||start>end||end>=cutoff)
      throw Error('Historische Zeiträume müssen vollständig vor der ursprünglichen Questerstellung liegen.');
    const values={};
    for(const metric of metrics){
      const raw=row.querySelector(metric==='minutes'?'.lv113-h-minutes':'.lv113-h-count-value').value;
      const n=readNumber(raw,metric==='minutes'?'Historische Minuten':'Historische Anzahl');
      if(n===null)throw Error('Bitte für jede aktive Zielart eine historische Tagesmenge angeben.');
      if(metric==='count'&&!Number.isInteger(n))throw Error('Historische Anzahlen müssen ganzzahlig sein.');
      values[metric]=n;
    }
    const range={start,end,minutes:values.minutes??null,count:values.count??null};
    ranges.push(range);
    for(let day=start;day<=end;day=dayAdd(day,1)){
      if(seen.has(day))throw Error('Historische Zeiträume dürfen sich nicht überschneiden.');
      seen.add(day);
      if(seen.size>15000)throw Error('Zu viele historische Tageswerte. Bitte kleinere Abschnitte importieren.');
      // The historical rule is the first revision's rule (fixed on first import).
      const ruleId=out.historicalRuleId||r.id;
      const id=`${out.id}|${ruleId}|${day}`;
      const occupied=byId.get(id);
      if(occupied && occupied.historicalOrigin!=='quest-form')throw Error(`Für ${pretty(day)} existiert bereits ein Eintrag. Er darf nicht überschrieben werden.`);
      writes.push({id,activityId:out.id,ruleId,date:day,mode:'up',status:'yes',
        source:out.kind==='reduce'&&metrics.every(m=>values[m]===0)?'zero-confirmed':'user',estimated:false,
        historicalOrigin:'quest-form',minutes:range.minutes,count:range.count,comment:'',updatedAt:new Date().toISOString()});
    }
  }
  ranges.sort((x,y)=>x.start.localeCompare(y.start));
  const deletes=S.entries.filter(e=>e.activityId===out.id&&e.historicalOrigin==='quest-form').map(e=>e.id);
  return {ranges,writes,deletes};
}

function lv113PrepareHistoricalRevision(out,old,plan){
  const cutoff=[old?.originalCreatedOn||old?.createdAt?.slice(0,10)||nowDay(),nowDay()].sort()[0];
  out.originalCreatedOn=cutoff;
  out.historicalGlutLockDate=cutoff;
  out.historicalGlutCredited=true;
  out.historicalRanges=plan.ranges;
  if(!plan.ranges.length){
    // Remove the artificial pre-creation activation when history is cleared.
    if(out.historicalRuleId)out.createdAt=(out.normalStartDate||cutoff)+'T12:00:00';
    return;
  }
  const earliest=plan.ranges[0].start;
  let first=out.revisions[0];
  if(!first)throw Error('Historischer Zeitraum benötigt eine wiederkehrende Quest.');
  out.historicalRuleId=out.historicalRuleId||first.rules[0]?.id;
  if(!out.historicalRuleId)throw Error('Historisches Questziel fehlt.');
  // Freeze the original XP coefficients for the old dates, even when the user
  // edits today's rates. Do not overwrite subsequent rules/revisions.
  if(first.from>earliest){
    const historical=structuredClone(first);
    historical.from=earliest;
    out.revisions.unshift(historical);
  }
  out.createdAt=earliest+'T12:00:00';
}

function lv113PreviewHistoricalWallet(out,plan,old){
  if(old)return null; // no second historical Glut credit after creation
  const w=structuredClone(S.wallet||{glut:0,inventory:0,awarded:[],frozen:[],history:[]});
  w.awarded||=[];w.history||=[];
  if(!plan.writes.length)return w;
  const previousActivities=S.activities,previousEntries=S.entries,previousEM=EM;
  try{
    S.activities=[...previousActivities,out];
    S.entries=[...previousEntries,...plan.writes];
    EM=new Map(S.entries.map(e=>[e.id,e]));
    const g=allGoals().find(x=>x.a.id===out.id&&x.r.id===out.historicalRuleId);
    if(!g)return w;
    let run=0;
    for(const p of periods(g)){
      if(p.end>out.originalCreatedOn)break; // only entirely historical periods
      const o=assessment(g,p);
      if(o.state==='success'){
        run++;
        if(run%10===0){
          const key=`${frozenKey(g,p)}|milestone-${run}`;
          if(!w.awarded.includes(key)){
            w.awarded.push(key);w.glut++;
            w.history.push({type:'glut-earned',source:'historical-once',key,at:new Date().toISOString()});
          }
        }
      }else if(o.state==='fail')run=0;
    }
  }finally{S.activities=previousActivities;S.entries=previousEntries;EM=previousEM;}
  return w;
}

document.addEventListener('click',e=>{
  const button=e.target.closest('[data-act="history-add"],[data-act="history-remove"]');
  if(!button)return;
  e.preventDefault();e.stopPropagation();
  const form=button.closest('form');
  if(button.dataset.act==='history-add')lv113AddHistoryRange(form);
  else button.closest('.lv113-history-range')?.remove();
},true);
