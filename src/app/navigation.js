/*
 * LEVELN 0.10 · src/app/navigation.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function render(){
  clearTimeout(timer);
  const todayMode=S.page==='today';
  const app=$('#app');
  app.className='app lv10-app '+(todayMode?'today-app':S.page==='stats'?'stats-app':'')+(S.page==='character'?' character-app':'');
  const pageHtml=todayMode?todayView():S.page==='goals'?goalsView():S.page==='character'?characterView():S.page==='stats'?statsView():settingsView();
  app.innerHTML=(typeof LevelnPageFrames!=='undefined')?LevelnPageFrames.wrap(S.page,pageHtml):pageHtml;
  if(S.page!=='deck-manager')nav();
  renderModal();lv10Paint();
  if(S.packet)armTimer();
}

function handleAction(act,el){
  if(act==='quest-more'){S.questMoreOpen=!S.questMoreOpen;render();return;}
  if(S.questMoreOpen&&['edit-day','deck-open','quest-filter','new'].includes(act))S.questMoreOpen=false;
  if(act==='freeze-shop'){S.modal={type:'freeze-shop'};renderModal();return;}
  if(['quest-delete','quest-delete-preserve','quest-delete-all','quest-reopen','reopen-empty','reopen-history','reopen-add','reopen-remove','archive-toggle','quest-pause'].includes(act)){lv114HandleQuestAction(act,el).catch(showError);return;}
  if(act==='handbook-open'){
    S.modal=null;S.page='settings';render();
    const manual=document.getElementById('levelnHandbook');
    if(manual){manual.open=true;manual.scrollIntoView?.({behavior:'smooth',block:'start'});}
    return;
  }
  if(act==='handbook-dismiss'){S.modal=null;renderModal();return;}

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
    lv113SyncHistoryInputs(form);
    // The user actively chooses the unit: no automatic XP row is generated.
    return;
  }
  if(act==='metric-remove'){
    if(!confirm('Diese Zielart und ihre Skill-XP-Zeilen aus der Questkonfiguration entfernen?'))return;
    const form=el.closest('form');el.closest('.lv10-metric-table').outerHTML=lv10MetricTable(el.dataset.metric,{},[],false);lv113SyncHistoryInputs(form);return;
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
