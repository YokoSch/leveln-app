/*
 * LEVELN 0.10 · src/shared/domain/erfahrung.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function streakBefore(g, at, w) { let run = 0; for (let previous of periods(g, dayAdd(at.start, -1))) {
    if (previous.end > at.start)
        continue;
    let v = assessment(g, previous);
    if (v.state === 'success')
        run++;
    else if (w.frozen.includes(frozenKey(g, previous))) { }
    else if (v.state === 'fail')
        run = 0;
} return run; }

async function reconcileWallet() {
    let w = structuredClone(S.wallet), changed = false;
    const items = [];
    for (let g of goals().filter(g => !isOnce(g.a)))
        for (let p of periods(g)) {
            if (!finalLocked(p) || p.end <= S.started)
                continue;
            items.push({ g, p });
        }
    items.sort((x, y) => x.p.end.localeCompare(y.p.end) || x.g.key.localeCompare(y.g.key));
    // Keep prior freeze decisions immutable; process each failed period once, even after offline gaps.
    const processed = new Set((w.history || []).filter(x => x.type === 'settled').map(x => x.key));
    for (let { g, p } of items) {
        const key = frozenKey(g, p);
        if (processed.has(key))
            continue;
        const v = assessment(g, p);
        if (v.state === 'pending')
            continue;
        if (v.state === 'fail' && !v.hasUnknown && w.inventory > 0 && streakBefore(g, p, w) > 0) {
            w.inventory--;
            w.frozen.push(key);
            w.history.push({ type: 'freeze-used', key, at: new Date().toISOString() });
        }
        w.history.push({ type: 'settled', key, status: v.state, at: new Date().toISOString() });
        changed = true;
    }
    // Count streaks, including already frozen failed periods, and issue only unique 10th-step milestones.
    for (let g of goals().filter(g => !isOnce(g.a))) {
        let successCount = 0;
        let chain = 0;
        for (let p of periods(g)) {
            if (!finalLocked(p))
                continue;
            const v = assessment(g, p), key = frozenKey(g, p);
            if (v.state === 'success') {
                chain++;
                successCount++;
                if (chain > 0 && chain % 10 === 0 && p.end > S.started) {
                    let milestone = `${key}|milestone-${chain}`;
                    if (!w.awarded.includes(milestone)) {
                        w.awarded.push(milestone);
                        w.glut++;
                        w.history.push({ type: 'glut-earned', key: milestone, at: new Date().toISOString() });
                        changed = true;
                    }
                }
            }
            else if (w.frozen.includes(key)) { /* protected without increment */ }
            else if (v.state === 'fail')
                chain = 0;
        }
    }
    if (changed) {
        await saveMeta('emberWallet', w);
        S.wallet = w;
    }
}

async function buyFreeze(useKey) { let w = structuredClone(S.wallet); if (w.glut < 5)
    throw Error('Du brauchst 5 Glut.'); if (!useKey && w.inventory >= 2)
    throw Error('Dein Inventar ist voll (maximal 2 Freezes).'); if (useKey && w.frozen.includes(useKey))
    throw Error('Dieser Zeitraum ist bereits geschützt.'); w.glut -= 5; if (useKey) {
    w.frozen.push(useKey);
    w.history.push({ type: 'instant-freeze', key: useKey, at: new Date().toISOString() });
}
else {
    w.inventory++;
    w.history.push({ type: 'freeze-bought', at: new Date().toISOString() });
} await saveMeta('emberWallet', w); S.wallet = w; render(); toast(useKey ? 'Streak gerettet!' : 'Freeze gekauft'); }

function rateBundles(a, d) { return revision(a, d).skillRates || { minutes: [], count: [] }; }

function eventFor(g, day, kind, metric, amount, bundles) { const units = metric === 'minutes' ? amount / 60 : amount; const allocations = (bundles?.[metric] || []).filter(x => finite(x.rate)).map(x => ({ skillId: x.skillId, amount: units * x.rate })).filter(x => x.amount > 0); const xp = allocations.reduce((s, x) => s + x.amount, 0); return xp > 0 ? { goal: g.key, day, kind, metric, amount, xp, allocations } : null; }

function xpEvents() {
    const ev = [];
    for (const a of S.activities) {
        if (isOnce(a)) {
            if (a.completedAt) {
                const day = a.completedAt.slice(0, 10), g = { key: onceKey(a) }, bindings = a.rewardSnapshot || a.rewardBindings || [];
                const allocations = bindings.filter(x => finite(x.xp) && x.xp > 0).map(x => ({ skillId: x.skillId, amount: x.xp }));
                if (allocations.length)
                    ev.push({ goal: g.key, day, kind: a.kind === 'reduce' ? 'save' : 'level', metric: 'once', amount: 1, xp: allocations.reduce((s, x) => s + x.amount, 0), allocations });
            }
            continue;
        }
        for (const g of allGoals().filter(g => g.a.id === a.id)) {
            if (a.kind === 'build') {
                for (const e of S.entries) {
                    if (e.date > nowDay() || a.archivedAt?.slice(0, 10) <= e.date || e.ruleId && e.ruleId !== g.r.id || e.activityId !== a.id)
                        continue;
                    if (!e.ruleId && (g.index !== 0 || EM.has(entryKey(g, e.date))))
                        continue;
                    const historical = rules(a, e.date).find(x => x.id === g.r.id);
                    if (!historical)
                        continue;
                    for (const k of metricKeys(historical))
                        if (metricOwner(g, k, e.date) && finite(e[k]) && e.source !== 'auto' && e.source !== 'refused') {
                            const event = eventFor(g, e.date, 'level', k, e[k], rateBundles(a, e.date));
                            if (event)
                                ev.push(event);
                        }
                }
            }
            else {
                for (const p of periods(g)) {
                    if (p.end > nowDay() || a.archivedAt && p.end > a.archivedAt.slice(0, 10))
                        continue;
                    const assess = assessment(g, p), historical = p.rule || g.r;
                    if (!assess.complete || assess.hasEstimated)
                        continue;
                    for (const k of metricKeys(historical))
                        if (metricOwner(g, k, p.start)) {
                            const amount = Math.max(0, ruleValue(historical, k) - assess.totals[k]);
                            const event = eventFor(g, dayAdd(p.end, -1), 'save', k, amount, rateBundles(a, p.start));
                            if (event)
                                ev.push(event);
                        }
                }
            }
        }
    }
    return ev.sort((x, y) => x.day.localeCompare(y.day) || x.goal.localeCompare(y.goal));
}

function skillXp(id) { let total = 0; for (const e of xpEvents())
    for (const a of e.allocations || [])
        if (effectiveFate(a.skillId) === id)
            total += a.amount; return total; }

function xpStats() { const events = xpEvents(); let sum = 0, save = 0, level = 0, barSave = 0, barLevel = 0; for (const e of events) {
    sum += e.xp;
    if (e.kind === 'save')
        save += e.xp;
    else
        level += e.xp;
} const levelN = 1 + Math.floor((sum + 1e-7) / 1000), from = (levelN - 1) * 1000; let cursor = 0; for (const e of events) {
    const amount = Math.max(0, Math.min(sum, cursor + e.xp) - Math.max(from, cursor));
    if (e.kind === 'save')
        barSave += amount;
    else
        barLevel += amount;
    cursor += e.xp;
} return { sum, save, level, barSave, barLevel, progress: Math.max(0, sum - from), levelN, events }; }

function unknownFields(g) { const v = { mode: 'refused', status: 'no', source: 'unknown', estimated: false }; for (const k of metricKeys(g.r))
    v[k] = null; return v; }

function recordedConsumption(g, d) { const e = entry(g, d); return !!e && e.source !== 'unknown' && e.source !== 'auto' && e.source !== 'refused' && metricKeys(g.r).some(k => finite(e[k]) && e[k] > 0); }

function checkinItems() { const d = dayAdd(nowDay(), -1); return goals(d).filter(g => !isOnce(g.a) && g.a.kind === 'reduce' && !recordedConsumption(g, d) && !['zero-confirmed', 'unknown'].includes(entry(g, d)?.source)).map(g => ({ g, d })); }

function assessment(g, p) {
    const a = g.a, r = p.rule || rules(a, p.start).find(x => x.id === g.r.id) || g.r, keys = metricKeys(r);
    const totals = { minutes: 0, count: 0 };
    let complete = true, hasEstimated = false, hasUnknown = false;
    const effectiveStart = (a.createdAt || S.started || p.start).slice(0, 10);
    for (const d of allDays(effectiveStart > p.start ? effectiveStart : p.start, p.end < dayAdd(nowDay(), 1) ? p.end : dayAdd(nowDay(), 1))) {
        const e = entry(g, d);
        if (!e) {
            if (a.kind === 'reduce')
                complete = false;
            continue;
        } // No Leveln booking is always 0; no invented entry is needed.
        if (['auto', 'refused', 'unknown'].includes(e.source)) {
            hasUnknown = true;
            hasEstimated = true;
            complete = false;
            continue;
        }
        for (const k of keys) {
            if (!finite(e[k])) {
                complete = false;
                hasUnknown = true;
            }
            else
                totals[k] += e[k];
        }
    }
    const finished = p.end <= nowDay();
    let state = 'pending';
    if (a.kind === 'reduce') {
        if (hasUnknown || keys.some(k => totals[k] > ruleValue(r, k) + 1e-9))
            state = 'fail';
        else if (finished && complete)
            state = 'success';
    }
    else if (keys.every(k => totals[k] + 1e-9 >= ruleValue(r, k)))
        state = 'success';
    else if (finished && complete)
        state = 'fail';
    if (r.period === 'day') {
        const e = entry(g, p.start);
        if (!e)
            state = a.kind === 'build' && finished ? 'fail' : 'pending';
        else if (e.source === 'legacy' && !finite(e.minutes) && !finite(e.count))
            state = e.status === 'yes' ? 'success' : e.status === 'no' ? 'fail' : 'pending';
        else if (a.kind === 'reduce' && hasUnknown)
            state = 'fail';
        else if (!complete && e.mode === 'up' && !keys.length)
            state = 'success';
    }
    return { state, totals, complete, hasEstimated, hasUnknown, finished };
}

async function reconcile() {
    // Yesterday's missing training is zero. Missing Mana stays open for a next-day check-in;
    // older unknown usage is recorded as unknown, never as an estimated number.
    const cutoff = dayAdd(nowDay(), -1), fresh = [];
    if (S.started) {
        for (let d = S.started, i = 0; d <= cutoff && i < 3650; d = dayAdd(d, 1), i++) {
            for (const g of goals(d).filter(x => !isOnce(x.a))) {
                if (entry(g, d) || g.a.kind === 'reduce' && d === cutoff)
                    continue;
                const fields = g.a.kind === 'reduce' ? unknownFields(g) : { mode: 'down', status: 'no', source: 'zero-auto', estimated: false, ...Object.fromEntries(metricKeys(g.r).map(k => [k, 0])) };
                fresh.push(makeEntry(g, d, fields));
            }
        }
    }
    if (fresh.length) {
        await dbTx(['entries'], t => fresh.forEach(e => t.objectStore('entries').put(e)));
        await sync();
    }
    await reconcileWallet();
}

function manaInPeriod(g) {
    if (g.a.kind !== 'reduce')
        return null;
    const p = currentPeriod(g, S.day);
    if (!p)
        return null;
    const used = { minutes: 0, count: 0 };
    let unknown = false;
    for (const d of allDays(p.start, dayAdd(S.day, 1))) {
        const e = entry(g, d);
        if (e && ['auto', 'refused', 'unknown'].includes(e.source))
            unknown = true;
        else if (e)
            for (const k of metricKeys(g.r)) {
                if (finite(e[k]))
                    used[k] += e[k];
                else
                    unknown = true;
            }
    }
    return { p, used, unknown };
}
