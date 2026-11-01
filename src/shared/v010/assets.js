/*
 * LEVELN 0.10 · src/shared/v010/assets.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

const LV10_INLINE_ICON_REVERSE = Object.freeze(Object.fromEntries(Object.entries(ICON_MAP10).map(([legacy, asset]) => [asset, legacy])));

function lv10InlineIconKey(key) {
  if (PATH[key]) return key;
  const source = ICON_MAP10[key] || key;
  const legacy = LV10_INLINE_ICON_REVERSE[source];
  return legacy && PATH[legacy] ? legacy : '';
}

function ico(key, cl='') {
  const source = ICON_MAP10[key] || key;
  const inlineKey = lv10InlineIconKey(key);
  if (inlineKey) {
    return `<svg class="ico lv-inline-icon ${safe(cl)}" viewBox="0 0 24 24" aria-hidden="true" data-icon="${safe(source)}"><g>${PATH[inlineKey]}</g></svg>`;
  }
  if (!LV10_ICON_KEYS.has(source)) return `<span class="ico lv-inline-icon ${safe(cl)}" aria-hidden="true"></span>`;
  const url = `./assets/icons/mono/${source}.svg`;
  return `<img class="ico lv-icon-image ${safe(cl)}" src="${url}" alt="" aria-hidden="true" loading="lazy">`;
}

function art(a) {
  if(a.iconData && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(a.iconData))
    return `<img class="card-art" src="${a.iconData}" alt="">`;
  return ico(ICON_MAP10[a.iconKey] ? a.iconKey : 'spark', 'card-art');
}
