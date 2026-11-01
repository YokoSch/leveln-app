/*
 * LEVELN 0.10 · pages/kartenverwaltung/page.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function lv10ManagerActivities(kind=S.deckManagerKind||'build'){
  return S.activities.filter(a=>a.kind===kind&&!a.archivedAt&&!a.completedAt)
    .sort((a,b)=>(a.deckOrder??a.order??0)-(b.deckOrder??b.order??0)||a.name.localeCompare(b.name,'de'));
}

function lv10ManagerMini(a){
  return `<div class="lv10-mini-card ${a.cardShown===false?'hidden-card':''}" data-id="${safe(a.id)}" data-quest-color="${lv10CardColor(a)}">
   <span class="lv10-mini-art">${art(a)}</span><strong>${safe(shortCode(a.shortName||a.name))}</strong><label class="lv11-mini-visible" title="Karte im Stapel anzeigen"><input type="checkbox" class="lv10-card-visible" data-id="${safe(a.id)}" ${a.cardShown!==false?'checked':''} aria-label="${safe(a.name)} anzeigen"></label></div>`;
}

function lv10ManagerRender(){
  if(!S.deckManagerOpen){$('#deckManagerRoot').innerHTML='';document.body.classList.remove('deck-menu-open');return;}
  document.body.classList.add('deck-menu-open');
  const kind=S.deckManagerKind||'build',items=lv10ManagerActivities(kind);
  $('#deckManagerRoot').innerHTML=`<section class="lv10-manager" role="dialog" aria-modal="true" aria-label="Karten verwalten">
   <header class="lv10-manager-header"><strong>Kartendeck</strong><small>Miniaturkarten halten und verschieben</small></header>
   <div class="lv10-manager-content">
     <div class="lv10-manager-minis" aria-label="Kartenreihenfolge per Drag-and-drop">${items.map(lv10ManagerMini).join('')||'<p>Noch keine Quests.</p>'}</div>
   </div>
   <footer class="lv10-manager-footer"><button data-act="manager-kind" data-kind="build" class="lv11-kind ${kind==='build'?'on':''}">${ico('leveln')} Leveln</button><button data-act="manager-kind" data-kind="reduce" class="lv11-kind ${kind==='reduce'?'on':''}">${ico('zaubern')} Zaubern</button><button data-act="manager-sort" data-sort="alpha" data-dir="1">A → Z</button><button data-act="manager-sort" data-sort="alpha" data-dir="-1">Z → A</button><button data-act="manager-sort" data-sort="period" data-dir="1">Tag → Jahr</button><button data-act="manager-sort" data-sort="period" data-dir="-1">Jahr → Tag</button><button class="lv10-manager-exit" data-act="deck-close" aria-label="Kartenmenü schließen">✕</button></footer>
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

function lv10DragSave(){
  if(!lv10Dragging)return;
  lv10Dragging=null;
  const ids=[...$('#deckManagerRoot').querySelectorAll('.lv10-mini-card')].map(el=>el.dataset.id);
  lv10SaveDeckOrder(ids).then(()=>{lv10ManagerRender();render();}).catch(showError);
}
