/*
 * LEVELN 0.10 · src/shared/v010/stat-colors.js
 * Stabile Farbpalette fuer Statistik; nach Farb-Funktionen laden
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

const LV10_STAT_CANDIDATES=Array.from({length:72},(_,i)=>lv10HslColor((i*137.50776)%360,.7,i%3===0?.39:i%3===1?.53:.63));
