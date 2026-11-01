/*
 * LEVELN 0.10 · src/app/navigation.base.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function go(page) { if (S.packet)
    return; S.page = page; S.modal = null; render(); $('#app').scrollTop = 0; }
