/*
 * LEVELN 0.10 · src/app/start.js
 * Einziger automatischer Programmstart; nach allen Overrides ausfuehren
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

if (!globalThis.__LEVELN_UNIT_TEST__) LevelnPageFrames.load().then(()=>setup()).catch(e=>{
  $('#app').innerHTML=`<div class="fatal"><h2>Leveln konnte nicht starten</h2><p>${safe(e?.message||String(e))}</p><p>Erstelle gegebenenfalls ein Backup in Leveln 0.9 und lade die App neu.</p></div>`;
  console.error('Leveln 0.11 startup',e);
});
