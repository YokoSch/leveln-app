/*
 * LEVELN 0.10 · pages/statistik/page.base.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function statsRange() { let d = S.statAnchor; if (S.statPeriod === 'all') {
    let first = S.started || nowDay();
    for (let a of S.activities)
        first = (a.createdAt || '').slice(0, 10) && a.createdAt.slice(0, 10) < first ? a.createdAt.slice(0, 10) : first;
    return { start: first, end: dayAdd(nowDay(), 1) };
} const p = S.statPeriod; let start = calendarStart(p, d); return { start, end: calendarNext(p, start) }; }

function statEvents() { const { start, end } = statsRange(); return xpEvents().filter(x => x.day >= start && x.day < end); }
