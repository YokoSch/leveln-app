/*
 * Leveln 0.11.2: original asset renderer.
 * Detailed, original SVG paths from assets/icons/mono/ are inserted INLINE.
 * This avoids the fragile external CSS -webkit-mask-image rendering on iOS.
 * No simplified substitute symbols, no network requests, no new icon shapes.
 */
'use strict';

function ico(key, cl='') {
  const source=ICON_MAP10[key] || key;
  if (!LV10_ICON_KEYS.has(source) || !LevelnSvgArtwork.has(source)) {
    console.warn('Unbekanntes Leveln-Icon:',key);
    return `<span class="ico icon-missing" aria-hidden="true"></span>`;
  }
  return LevelnSvgArtwork.render(source,cl);
}

function art(a) {
  if(a.iconData && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(a.iconData))
    return `<img class="card-art" src="${a.iconData}" alt="">`;
  const key=ICON_MAP10[a.iconKey] || a.iconKey;
  return ico(LV10_ICON_KEYS.has(key)?key:'spark','card-art');
}
