/*
 * LEVELN 0.10 · src/shared/domain/zeitraum.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function revision(a, d) { const arr = [...(a.revisions || [])].sort((x, y) => x.from.localeCompare(y.from)); return [...arr].reverse().find(x => x.from <= d) || { rules: [], countXp: 0 }; }

function rules(a, d) { return revision(a, d).rules || []; }

function goalByKey(key, d = nowDay()) { return goals(d).find(g => g.key === key) || allGoals().find(g => g.key === key); }

function entryKey(g, d) { return `${g.key}|${d}`; }

function entry(g, d) {
    const current = EM.get(entryKey(g, d));
    if (current)
        return current;
    // 0.3 used one entry per activity, not per goal. Map it only onto the first rule.
    if (g.index === 0) {
        const old = EM.get(`${g.a.id}|${d}`);
        if (old)
            return { ...old, source: old.source || 'legacy', mode: old.status === 'yes' ? 'up' : old.status === 'no' ? 'down' : null };
    }
    return null;
}

function ruleValue(r, k) { return finite(Number(r[k])) && r[k] !== null && r[k] !== '' ? Number(r[k]) : null; }

function metricKeys(r) { return ['minutes', 'count'].filter(k => ruleValue(r, k) !== null); }

function rate(g, d) { return Math.max(0, Number(revision(g.a, d).countXp) || 0); }

function limit(r) { return r.period === 'day' ? 1 : r.period === 'week' ? 7 : r.period === 'month' ? 30 : 365; }

function isRestart(r) { return r.period !== 'day' && r.mode === 'restart'; }

function calendarStart(p, d) { let t = asDate(d); if (p === 'week')
    t.setDate(t.getDate() - (t.getDay() + 6) % 7); if (p === 'month')
    t.setDate(1); if (p === 'year')
    t.setMonth(0, 1); return iso(t); }

function calendarNext(p, start) { let d = asDate(start); if (p === 'day')
    d.setDate(d.getDate() + 1); if (p === 'week')
    d.setDate(d.getDate() + 7); if (p === 'month')
    d.setMonth(d.getMonth() + 1); if (p === 'year')
    d.setFullYear(d.getFullYear() + 1); return iso(d); }

function allDays(start, end, cap = 4000) { const a = []; for (let x = start; x < end && a.length < cap; x = dayAdd(x, 1))
    a.push(x); return a; }

function periods(g, end = nowDay()) {
    const { a, r } = g;
    let start = (a.createdAt || S.started || end).slice(0, 10), out = [];
    if (a.archivedAt && end >= a.archivedAt.slice(0, 10))
        end = dayAdd(a.archivedAt.slice(0, 10), -1);
    if (start > end)
        return out;
    // Each rule's first day is the activity creation date; prevent updating pre-creation dates.
    if (!isRestart(r)) {
        let cursor = calendarStart(r.period, start);
        for (let i = 0; cursor <= end && i < 2300; i++) {
            const next = calendarNext(r.period, cursor);
            out.push({ start: cursor, end: next, closed: next <= nowDay(), rule: rules(a, cursor).find(x => x.id === r.id) || r });
            cursor = next;
        }
    }
    else {
        let cursor = start;
        const span = limit(r);
        for (let i = 0; cursor <= end && i < 2300; i++) {
            let upper = dayAdd(cursor, span), cut = upper;
            // An excessive saving budget ends a restart window on the overspend day.
            if (a.kind === 'reduce') {
                let sums = { minutes: 0, count: 0 };
                for (let d = cursor; d < upper && d <= end; d = dayAdd(d, 1)) {
                    let e = entry(g, d);
                    for (let k of metricKeys(r))
                        if (finite(e?.[k]))
                            sums[k] += e[k];
                    if (metricKeys(r).some(k => sums[k] > ruleValue(r, k) + 1e-9)) {
                        cut = dayAdd(d, 1);
                        break;
                    }
                }
            }
            out.push({ start: cursor, end: cut, closed: cut <= nowDay(), rule: rules(a, cursor).find(x => x.id === r.id) || r });
            cursor = cut;
        }
    }
    return out;
}

function currentPeriod(g, d) { return periods(g, d).find(p => p.start <= d && p.end > d) || null; }

function finalLocked(p) { return dayAdd(p.end, 1) <= nowDay(); }

function frozenKey(g, p) { return `${g.key}|${p.start}`; }

function outcome(g, p) { const a = assessment(g, p); return { ...a, frozen: S.wallet?.frozen?.includes(frozenKey(g, p)) || false }; }

function stData(g) {
    let ps = periods(g), run = 0, best = 0;
    for (let p of ps) {
        const o = outcome(g, p);
        if (o.state === 'success') {
            run++;
            best = Math.max(best, run);
        }
        else if (o.frozen) {
            best = Math.max(best, run);
        }
        else if (o.state === 'fail' && (p.closed || g.a.kind === 'reduce')) {
            run = 0;
        }
    }
    // pending current period should not shorten the visible streak
    return { current: run, best };
}

function assumed(g, d) {
    let r = g.r, minutes = ruleValue(r, 'minutes'), count = ruleValue(r, 'count');
    let span = limit(r);
    return { mode: g.a.kind === 'build' ? 'down' : 'down', status: 'no', minutes: minutes === null ? null : g.a.kind === 'reduce' ? Math.ceil(minutes / span * 100) / 100 : 0, count: count === null ? null : g.a.kind === 'reduce' ? Math.max(1, Math.ceil(count / span)) : 0, source: 'auto', estimated: true };
}

function makeEntry(g, d, fields) { const old = entry(g, d) || {}; return { ...old, id: entryKey(g, d), activityId: g.a.id, ruleId: g.r.id, date: d, comment: old.comment || '', ...fields, updatedAt: new Date().toISOString() }; }

function hex(x, def) { return /^#[\da-f]{6}$/i.test(String(x)) ? x : def; }

function metricOwner(g, k, d) { let rs = rules(g.a, d).filter(r => ruleValue(r, k) !== null).sort((a, b) => ({ day: 0, week: 1, month: 2, year: 3 }[a.period] - { day: 0, week: 1, month: 2, year: 3 }[b.period])); return rs[0]?.id === g.r.id; }

function initialState(g, d) { const e = entry(g, d); return !e ? 'open' : e.mode === 'up' ? 'up' : 'down'; }

function canEdit(d) { return d >= dayAdd(nowDay(), -1) && d <= nowDay(); }

function goals(d = nowDay()) {
    return S.activities.flatMap(a => { if (isOnce(a))
        return []; const started = (a.createdAt || S.started || d).slice(0, 10); if (started > d || a.archivedAt?.slice(0, 10) <= d)
        return []; return rules(a, d).map((r, i) => ({ a, r, index: i, key: `${a.id}|${r.id}` })); })
        .concat(oneTimeGoals(d)).sort((g, h) => (g.a.order ?? 0) - (h.a.order ?? 0) || g.index - h.index);
}

function allGoals() { const result = []; for (const a of S.activities) {
    if (isOnce(a)) {
        result.push({ a, r: { id: 'once', period: 'day', minutes: null, count: null }, index: 0, key: onceKey(a) });
        continue;
    }
    let ids = new Map();
    for (const rev of a.revisions || [])
        for (let i = 0; i < (rev.rules || []).length; i++)
            ids.set(rev.rules[i].id, { r: rev.rules[i], index: i });
    for (const [ruleId, x] of ids)
        result.push({ a, r: x.r, index: x.index, key: `${a.id}|${ruleId}` });
} return result; }

function effectiveFate(id) { const f = meta('skillFates', {}); const seen = new Set(); while (f[id] !== undefined && !seen.has(id)) {
    seen.add(id);
    id = f[id];
    if (id === null)
        return null;
} return id; }

function onceQuestState(a) { return a.completedAt ? 'completed' : a.archivedAt ? 'archived' : nowDay() < a.availableFrom ? 'planned' : a.availableUntil && nowDay() > a.availableUntil ? 'expired' : 'available'; }

function oneTimeGoals(d) { return S.activities.filter(a => d === nowDay() && isOnce(a) && a.cardShown !== false && a.availableFrom <= d && (!a.availableUntil || a.availableUntil >= d) && !a.completedAt && !a.archivedAt).map(a => ({ a, r: { id: 'once', period: 'day', minutes: null, count: null }, index: 0, key: onceKey(a) })); }
