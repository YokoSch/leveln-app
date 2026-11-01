/*
 * LEVELN 0.10 · src/shared/v010/assets.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

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
