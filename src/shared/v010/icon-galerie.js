/*
 * LEVELN 0.10 · src/shared/v010/icon-galerie.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

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
