/*
 * LEVELN 0.10 · src/shared/v010/bedienung.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

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
