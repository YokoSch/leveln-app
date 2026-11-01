/*
 * LEVELN 0.10 · pages/heute/page.base.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function cardDraft(g) {
    const key = entryKey(g, S.day), old = S.cardDrafts.get(key);
    if (old)
        return old;
    const values = {};
    for (const k of metricKeys(g.r)) {
        const standard = g.r[k === 'minutes' ? 'standardMinutes' : 'standardCount'];
        values[k] = standard === null || standard === undefined ? '' : String(standard);
    }
    S.cardDrafts.set(key, values);
    return values;
}

function bookingFields(g, up) {
    const existing = entry(g, S.day), draft = cardDraft(g), out = { mode: up ? 'up' : 'down', status: up ? 'yes' : 'no', source: 'user', estimated: false };
    for (const k of metricKeys(g.r)) {
        const raw = up ? draft[k] : 0;
        if (raw === '' || raw === null || raw === undefined) {
            out[k] = finite(existing?.[k]) ? existing[k] : 0;
            continue;
        }
        const v = Number(raw);
        if (!Number.isFinite(v) || v < 0 || v > 1e6 || (k === 'count' && !Number.isInteger(v)))
            throw Error(`Ungültige Buchung: ${k}`);
        const total = (finite(existing?.[k]) ? existing[k] : 0) + (up ? v : 0);
        if (total > 1e7)
            throw Error('Zu viele Einheiten');
        out[k] = total;
    }
    // An empty swipe confirms zero; a later zero swipe does not erase earlier values.
    if (!up && existing) {
        out.mode = existing.mode || 'up';
        out.status = existing.status || 'yes';
    }
    out.comment = existing?.comment || '';
    return out;
}

async function updatePlayAmount(key, metric, raw) {
    const g = goalByKey(key, S.day);
    if (!g || isOnce(g.a) || !metricKeys(g.r).includes(metric))
        return;
    const value = readNumber(raw, metric === 'minutes' ? 'Ausspielminuten' : 'Ausspielanzahl');
    if (metric === 'count' && value !== null && !Number.isInteger(value))
        throw Error('Ausspielanzahl muss ganzzahlig sein.');
    const field = metric === 'minutes' ? 'standardMinutes' : 'standardCount';
    if (g.r[field] === value)
        return;
    const a = structuredClone(g.a), today = nowDay();
    let current = a.revisions.find(r => r.from === today);
    if (!current) {
        const rev = structuredClone(revision(a, today));
        rev.from = today;
        rev.rules = structuredClone(rev.rules);
        a.revisions.push(rev);
        current = rev;
    }
    for (const rev of a.revisions.filter(r => r.from >= today)) {
        for (const r of rev.rules || [])
            if (r.id === g.r.id)
                r[field] = value;
    }
    a.revisions.sort((x, y) => x.from.localeCompare(y.from));
    a.updatedAt = new Date().toISOString();
    await dbPut('activities', a);
    await sync();
    // The card draft is intentionally retained: the user may still be typing.
}

function checkinModal() {
    const items = checkinItems();
    if (!items.length) {
        S.modal = null;
        renderModal();
        return;
    }
    const { g, d } = items[0];
    S.checkinQueue = items.map(i => ({ key: i.g.key, day: i.d }));
    const v = S.checkinVariant || 0;
    S.checkinVariant = v + 1;
    const button = (i, action, cl) => `<button class="mana-answer ${cl}" data-act="${action}">${safe(CAT_CHOICES[i][v % CAT_CHOICES[i].length])}</button>`;
    sheet('Mana-Check', `<div class="mana-check-dialog"><div class="cat-scene">${CAT_DRAWING}<span class="cat-spark s1">✦</span><span class="cat-spark s2">✧</span></div><span class="eyebrow">GESTERN · ${safe(g.a.name)}${items.length > 1 ? ' · ' + items.length + ' Quests offen' : ''}</span><h3>${safe(CAT_HEADLINES[v % CAT_HEADLINES.length])}</h3><p>${safe(CAT_SUBLINES[v % CAT_SUBLINES.length])}</p><div class="mana-confirm-actions">${button(0, 'mana-confirm', 'is-confirm')}${button(1, 'mana-correct', 'is-correct')}${button(2, 'mana-unknown', 'is-unknown')}</div><small class="mana-note">„Weiß ich nicht“ lässt den Verbrauch unbekannt und beendet den Streak. Es wird nichts geschätzt.</small></div>`, true);
}

async function answerManaCheckin(answer) {
    const first = checkinItems()[0];
    if (!first)
        return;
    const { g, d } = first;
    const base = entry(g, d) || {};
    const fields = answer === 'confirmed' ? { mode: 'down', status: 'no', source: 'zero-confirmed', estimated: false, ...Object.fromEntries(metricKeys(g.r).map(k => [k, 0])) } : unknownFields(g);
    await dbPut('entries', makeEntry(g, d, { ...fields, comment: base.comment || '' }));
    await sync();
    await reconcileWallet();
    S.modal = null;
    render();
    const rest = checkinItems();
    if (rest.length) {
        S.modal = { type: 'checkin' };
        renderModal();
    }
    else {
        toast(answer === 'confirmed' ? 'Mega! Mana gespart ✨' : 'Mana unbekannt · Streak nicht erfüllt');
    }
}

function maybeCheckin(force = false) { if (S.modal || S.packet)
    return; const items = checkinItems(); if (items.length && (force || !S.checkShown)) {
    S.checkShown = true;
    S.modal = { type: 'checkin' };
    renderModal();
} }
