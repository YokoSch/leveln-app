/*
 * LEVELN 0.10 · src/shared/v010/runtime.js
 * Versionierte v0.10-Konstanten; keine Datenmigration beim Import ausfuehren
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

const LV10 = Object.freeze({version:'0.10', schema:5, backup:5});

const ICON_MAP10 = Object.freeze({
  home:'navigation/heute', goals:'navigation/quests', chart:'navigation/statistik', dots:'navigation/mehr',
  user:'menschen/person', person:'menschen/mensch', mage:'menschen/magier', knight:'menschen/ritter',
  robot:'menschen/roboter', wizard:'menschen/zauberer', archer:'menschen/bogenschutze',
  ranger:'menschen/waldlaufer', priest:'menschen/priesterin', cat:'tiere/katze', wolf:'tiere/wolf',
  fox:'tiere/fuchs', owl:'tiere/eule', paw:'tiere/tierpfote',bear:'tiere/bar',rabbit:'tiere/hase',
  horse:'tiere/pferd',bird:'tiere/vogel',dragon:'fabelwesen/drache',unicorn:'fabelwesen/einhorn',
  phoenix:'fabelwesen/phonix',griffin:'fabelwesen/greif',slime:'fabelwesen/schleimwesen',
  shield:'gegenstaende/schild',scroll:'gegenstaende/schriftrolle',book:'gegenstaende/buch',
  phone:'gegenstaende/handy',dumbbell:'gegenstaende/hantel',wallet:'gegenstaende/geldborse',
  game:'gegenstaende/spielcontroller',sword:'gegenstaende/schwert',potion:'gegenstaende/zaubertrank',
  key:'gegenstaende/schlussel',bag:'gegenstaende/tasche',spark:'symbole/funke',
  star:'symbole/stern',moon:'symbole/mond',sun:'symbole/sonne',heart:'symbole/herz',
  target:'symbole/zielscheibe',palette:'symbole/farbpalette',flame:'symbole/flamme',
  snow:'symbole/schneeflocke',chest:'symbole/schatztruhe',plus:'symbole/plus',rune:'spielmechanik/zaubern',
  pixel:'spielmechanik/leveln',mana:'spielmechanik/mana',ember:'spielmechanik/glut',
  leveln:'spielmechanik/leveln',zaubern:'spielmechanik/zaubern',
  settings:'einstellungen/einstellungen',save:'einstellungen/backup-speichern',
  back:'bedienung/zuruck',check:'bedienung/bestatigen',close:'bedienung/schliessen',
  lock:'bedienung/sperren',calendar:'bedienung/kalender',arrow:'bedienung/pfeil-nach-oben',
  chevron:'bedienung/aufklappen',edit:'bedienung/bearbeiten'
});

const LV10_ICON_KEYS = new Set(Object.values(ICON_MAP10));

let lv10Hold=null,lv10GestureTimer=null,lv10Dragging=null;
