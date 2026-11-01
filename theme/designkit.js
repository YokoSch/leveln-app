/* Leveln 0.10 – Design-Master: presentation only, no app state / storage. */
(function(global){
  'use strict';
  const SKINS=Object.freeze(['dark','light','retro']);
  const LEGACY=Object.freeze({"home":"navigation/heute","quest":"navigation/quests","user":"menschen/person","stat":"navigation/statistik","more":"navigation/mehr","leaf":"symbole/zielscheibe","book":"gegenstaende/buch","dumbbell":"gegenstaende/hantel","star":"symbole/stern","flame":"symbole/flamme","crystal":"spielmechanik/mana","sort":"bedienung/pfeil-nach-oben","edit":"bedienung/bearbeiten","close":"bedienung/schliessen","check":"bedienung/bestatigen","magic":"spielmechanik/zaubern","gear":"einstellungen/einstellungen","save":"einstellungen/backup-speichern","calendar":"bedienung/kalender","hourglass":"bedienung/kalender"});
  // Identifiers are whitelisted. NEVER interpolate arbitrary paths from user data.
  const KEYS=new Set(["bedienung/aufklappen","bedienung/bearbeiten","bedienung/bestatigen","bedienung/kalender","bedienung/pfeil-nach-oben","bedienung/schliessen","bedienung/sperren","bedienung/zuruck","einstellungen/backup-speichern","einstellungen/einstellungen","fabelwesen/drache","fabelwesen/einhorn","fabelwesen/greif","fabelwesen/phonix","fabelwesen/schleimwesen","gegenstaende/buch","gegenstaende/geldborse","gegenstaende/handy","gegenstaende/hantel","gegenstaende/schild","gegenstaende/schlussel","gegenstaende/schriftrolle","gegenstaende/schwert","gegenstaende/spielcontroller","gegenstaende/tasche","gegenstaende/zaubertrank","maskottchen/maskottchen","menschen/bogenschutze","menschen/magier","menschen/mensch","menschen/person","menschen/priesterin","menschen/ritter","menschen/roboter","menschen/waldlaufer","menschen/zauberer","navigation/heute","navigation/mehr","navigation/quests","navigation/statistik","spielmechanik/glut","spielmechanik/leveln","spielmechanik/mana","spielmechanik/zaubern","symbole/farbpalette","symbole/flamme","symbole/funke","symbole/herz","symbole/mond","symbole/plus","symbole/schneeflocke","symbole/sonne","symbole/stern","symbole/zielscheibe","tiere/bar","tiere/eule","tiere/fuchs","tiere/hase","tiere/katze","tiere/pferd","tiere/tierpfote","tiere/vogel","tiere/wolf"]);
  function setSkin(root, skin){
    if (!root || !SKINS.includes(skin)) throw new Error('Unbekannter Leveln-Skin: '+skin);
    root.setAttribute('data-leveln-skin',skin);
    if(global.LevelnPalette10)global.LevelnPalette10.refresh(root);
    return skin;
  }
  function resolve(name){
    const key=LEGACY[name]||name;
    if (!KEYS.has(key)) throw new Error('Icon nicht im gemeinsamen Pool: '+name);
    return key;
  }
  function path(name, variant='mono', skin='dark'){
    const key=resolve(name);
    if (variant==='mono') return './assets/icons/mono/'+key+'.svg';
    if (variant==='original') {
      const it=(global.LevelnIconCatalog?.items||[]).find(x=>x.key===key);
      if(!it)throw new Error('Für Originalpfad bitte manifest.json laden');
      return './'+it.original;
    }
    // Avoid fixed-palette SVG files: <img> cannot inherit CSS currentColor.
    // Dynamic tinting must use icon() / CSS mask.
    if(variant==='themed'&&SKINS.includes(skin))return './assets/icons/mono/'+key+'.svg';
    throw new Error('Unbekannte Icon-Ausgabe');
  }
  // The exact original paths are rendered inline (same source as ico()).
  // This preserves complex cut-outs, original silhouettes and user colors.
  function icon(name, cssClass=''){
    const key=resolve(name);
    return global.LevelnSvgArtwork.render(key,cssClass);
  }
  function img(name, skin='dark', cssClass='', alt=''){
    // Kept as a compatibility alias: we intentionally do NOT use <img>,
    // because an external SVG cannot inherit user-selected currentColor.
    return icon(name,cssClass);
  }
  global.LevelnDesign10=Object.freeze({SKINS,setSkin,resolve,path,icon,img,LEGACY});
})(typeof window!=='undefined'?window:globalThis);
