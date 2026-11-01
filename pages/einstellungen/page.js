/*
 * LEVELN 0.10 · pages/einstellungen/page.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function settingsView(){
  const original=settingsView05();
  let html=original.replace('<h1>Optionen</h1>','<h1>Einstellungen</h1>');
  html=html.replace('<option value="dark"','<option value="mono" '+(S.theme==='mono'?'selected':'')+'>Minimalistisch · Retro</option><option value="dark"');
  html=html.replace(/<label>Paket-Timeout[\s\S]*?<\/label>/,'');
  html=html.replace(/<section class="settings-panel"><h3>Streaks & Glut<\/h3>[\s\S]*?<\/section>/,'');
  // Freezes and Glut are now part of the character's inventory.
  html=html.replaceAll(ico('flame'),ico('ember'));
  return html+`<section class="settings-panel"><h3>Einführung</h3><p class="muted">Die Spielregeln und Kartensteuerung noch einmal ansehen.</p><button class="thin-button" data-act="intro-open">Einführung starten</button></section><details class="settings-panel mini-doc"><summary>So funktioniert Leveln</summary>
  <p>↑ spielt die aktuelle Ausspielmenge; dieselbe Karte kann mehrfach verwendet werden. ←/→ zeigt andere Karten. Kurz ↓ wechselt zwischen Leveln und Zaubern; lang ↓ halten öffnet die Kartenverwaltung. Die +/- Tasten passen die Ausspielmenge an, langes Halten beschleunigt. Leveln vergibt XP für tatsächliche Leistung. Zaubern bucht sofort Mana-Verbrauch; erspartes Mana wird am Ende des Bewertungszeitraums zu XP.</p>
  <p>Flamme = Streak; Schneeflocke = Freeze; Glut = glühende Kohle. 100 XP je Skill-Stufe, 1000 XP je Charakterlevel. <b>Leveln 0.11 · Datenformat 5</b></p></details>`;
}
