/*
 * LEVELN 0.10 · pages/quests/page.base.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function calRange() { let d = S.calAnchor; if (S.calView === 'week') {
    let s = calendarStart('week', d);
    return { start: s, end: dayAdd(s, 7) };
} if (S.calView === 'month')
    return { start: calendarStart('month', d), end: calendarNext('month', calendarStart('month', d)) }; if (S.calView === 'year') {
    let s = calendarStart('year', d);
    return { start: s, end: calendarNext('year', s) };
} let start = String(Math.floor(+d.slice(0, 4) / 4) * 4) + '-01-01'; return { start, end: String(+start.slice(0, 4) + 4) + '-01-01' }; }

function monthCalendar(anchor, g, mini = false) { let begin = calendarStart('month', anchor), end = calendarNext('month', begin); let offset = (asDate(begin).getDay() + 6) % 7; let cellCount = Math.ceil((offset + dayDiff(begin, end)) / 7) * 7; return `<div class="month-calendar ${mini ? 'mini' : ''}"><div class="cal-weekdays">${['M', 'D', 'M', 'D', 'F', 'S', 'S'].map(x => `<small>${x}</small>`).join('')}</div><div class="cal-days">${Array.from({ length: cellCount }, (_, i) => { let d = dayAdd(begin, i - offset), inside = d >= begin && d < end; return `<button data-act="cal-day" data-day="${d}" class="cal-day ${inside ? '' : 'outside'} ${d === nowDay() ? 'today' : ''}" ${d > nowDay() ? 'disabled' : ''}><b>${Number(d.slice(-2))}</b>${inside ? lv113DailyBadge(g, d) : ''}</button>`; }).join('')}${lv113PeriodFrames(g,dayAdd(begin,-offset),cellCount)}</div></div>`; }

function calendarHTML() {
    if (!S.calendarOpen)
        return `<button class="calendar-collapse" data-act="cal-toggle">${ico('calendar')} Kalender anzeigen ${ico('chevron')}</button>`;
    let { start, end } = calRange(), g = goalByKey(S.selectedGoal), label = S.calView === 'week' ? `${pretty(start, { day: 'numeric', month: 'short' })} – ${pretty(dayAdd(end, -1), { day: 'numeric', month: 'short' })}` : S.calView === 'month' ? pretty(start, { month: 'long', year: 'numeric' }) : S.calView === 'year' ? start.slice(0, 4) : `${start.slice(0, 4)}–${+end.slice(0, 4) - 1}`;
    let content = '';
    if (S.calView === 'week')
        content = `<div class="cal-week">${allDays(start, end).map(d => `<button data-act="cal-day" data-day="${d}" class="week-cell"><small>${dayName(d)}</small><b>${Number(d.slice(-2))}</b>${lv113DailyBadge(g,d)}</button>`).join('')}${lv113PeriodFrames(g,start,7)}</div>`;
    else if (S.calView === 'month')
        content = monthCalendar(start, g);
    else if (S.calView === 'year')
        content = `<div class="year-grid">${Array.from({ length: 12 }, (_, i) => { let d = `${start.slice(0, 4)}-${pad(i + 1)}-01`; return `<button class="year-cell" data-act="cal-jump" data-day="${d}"><b>${pretty(d, { month: 'short' })}</b><span>${g ? allDays(d, calendarNext('month', d)).filter(x => badgeFor(g, x)).length + ' ✦' : 'Kalender'}</span></button>`; }).join('')}</div>`;
    else
        content = `<div class="year-grid">${Array.from({ length: 4 }, (_, i) => { let d = `${Number(start.slice(0, 4)) + i}-01-01`; return `<button class="year-cell" data-act="cal-jump-year" data-day="${d}"><b>${d.slice(0, 4)}</b><span>${g ? periods(g, d.slice(0, 4) + '-12-31').filter(p => p.start.startsWith(d.slice(0, 4)) && outcome(g, p).state === 'success').length + ' Erfolge' : 'Ansehen'}</span></button>`; }).join('')}</div>`;
    return `<div class="calendar-top"><div class="calendar-tools"><button class="icon-button" data-act="cal-prev">‹</button><strong>${safe(label)}</strong><button class="icon-button" data-act="cal-next">›</button><button class="icon-button" data-act="cal-toggle">${ico('chevron')}</button></div><div class="cal-filter">${['week', 'month', 'year', 'multi'].map((x, i) => `<button class="${S.calView === x ? 'sel' : ''}" data-act="cal-view" data-view="${x}">${['Woche', 'Monat', 'Jahr', '4 Jahre'][i]}</button>`).join('')}</div>${content}</div>`;
}

function calMove(step) { let d = asDate(S.calAnchor); if (S.calView === 'week')
    d.setDate(d.getDate() + step * 7); if (S.calView === 'month')
    d.setMonth(d.getMonth() + step); if (S.calView === 'year')
    d.setFullYear(d.getFullYear() + step); if (S.calView === 'multi')
    d.setFullYear(d.getFullYear() + step * 4); S.calAnchor = iso(d); }

async function archiveRule(key) { if (!confirm('Dieses Ziel ab heute archivieren? Vergangene Einträge bleiben erhalten.'))
    return; const g = goalByKey(key); if (!g)
    return; const a = structuredClone(g.a), today = nowDay(); const live = rules(a, today), remaining = live.filter(r => r.id !== g.r.id); if (live.length === 1) {
    a.archivedAt = `${today}T12:00:00`;
}
else {
    a.revisions = a.revisions.filter(x => x.from !== today);
    a.revisions.push({ ...structuredClone(revision(a, today)), from: today, rules: remaining });
    a.revisions.sort((x, y) => x.from.localeCompare(y.from));
} await dbPut('activities', a); await sync(); S.goalExpanded = null; S.swipedGoal = null; render(); toast('Ziel archiviert; Historie bleibt erhalten'); }

function skillOptions(selected = '', allowNew = true) { return `<option value="">Skill wählen</option>${S.skills.map(s => `<option value="${safe(s.id)}" ${selected === s.id ? 'selected' : ''}>${safe(s.name)}</option>`).join('')}${allowNew ? '<option value="__new__">＋ Neuen Skill erstellen …</option>' : ''}`; }

function rateRows(a, rev) { let rows = []; for (const [metric, list] of Object.entries(rev?.skillRates || {}))
    for (const item of list)
        rows.push({ metric, ...item }); if (!rows.length && !a)
    rows = [{ metric: 'minutes', skillId: S.skills[0]?.id || '__new__', rate: 10 }]; return rows; }

function rateRowHTML(row) { return `<div class="binding-row"><select class="binding-metric" aria-label="XP-Art"><option value="minutes" ${row.metric === 'minutes' ? 'selected' : ''}>XP pro Stunde</option><option value="count" ${row.metric === 'count' ? 'selected' : ''}>XP pro Anzahl</option></select><select class="binding-skill" aria-label="Skill">${skillOptions(row.skillId)}</select><input class="binding-rate" type="number" min="0" max="100000" step="0.1" value="${row.rate ?? 0}" aria-label="XP pro Einheit"><button type="button" class="binding-remove" data-act="binding-remove" aria-label="Zuordnung entfernen">×</button></div>`; }

function rewardRowHTML(row) { return `<div class="binding-row reward-row"><select class="reward-skill">${skillOptions(row.skillId)}</select><input class="reward-xp" type="number" min="0" max="100000" step="0.1" value="${row.xp ?? 0}" aria-label="XP bei Abschluss"><button type="button" data-act="binding-remove" class="binding-remove" aria-label="Entfernen">×</button></div>`; }

function parseBindings(form, once, newSkillId) {
    const wrap = form.querySelector(once ? '#onceRewards' : '#recurringRates'), list = [];
    for (const row of wrap.querySelectorAll('.binding-row')) {
        let metric = once ? 'once' : row.querySelector('.binding-metric').value, id = row.querySelector(once ? '.reward-skill' : '.binding-skill').value;
        if (id === '__new__')
            id = newSkillId;
        if (!id || !skillById(id) && id !== newSkillId)
            throw Error('Bitte einen gültigen Skill auswählen.');
        let raw = row.querySelector(once ? '.reward-xp' : '.binding-rate').value.trim(), amount = readNumber(raw, 'Skill-XP');
        if (amount === null || amount <= 0)
            continue;
        list.push(once ? { skillId: id, xp: amount } : { metric, skillId: id, rate: amount });
    }
    return list;
}

async function completeOnce(id) { const original = S.activities.find(a => a.id === id && isOnce(a)); if (!original || onceQuestState(original) !== 'available')
    throw Error('Die Mission ist nicht verfügbar.'); if (!confirm(`„${original.name}“ einmalig abschließen und ${num((original.rewardBindings || []).reduce((s, x) => s + x.xp, 0), 1)} XP sammeln?`))
    return; const before = xpStats().sum, a = structuredClone(original); a.completedAt = new Date().toISOString(); a.rewardSnapshot = structuredClone(a.rewardBindings || []); await dbPut('activities', a); await sync(); S.packet = null; S.card = 0; render(); sound(true); toast('Mission abgeschlossen!'); if (Math.floor(xpStats().sum / 1000) > Math.floor(before / 1000))
    await celebrate(Math.floor(xpStats().sum / 1000) + 1); }

async function archiveOnce(id) { const original = S.activities.find(a => a.id === id && isOnce(a)); if (!original || original.completedAt)
    return; if (!confirm('Einmalige Quest archivieren? Sie bleibt in der Historie.'))
    return; const a = structuredClone(original); a.archivedAt = new Date().toISOString(); await dbPut('activities', a); await sync(); render(); toast('Quest archiviert'); }

function goalGroups() { return ['day', 'week', 'month', 'year'].map(p => ({ p, items: goals().filter(g => !isOnce(g.a) && g.r.period === p) })); }

function onceQuestRow(a) {
    const state = onceQuestState(a), label = { completed: 'Abgeschlossen', archived: 'Archiviert', planned: 'Geplant', expired: 'Abgelaufen', available: 'Verfügbar' }[state], reward = (a.rewardSnapshot || a.rewardBindings || []).reduce((sum, b) => sum + b.xp, 0), id = safe(a.id);
    return `<div class="goal-swipe once-swipe" data-once="${id}"><div class="goal-row-actions">${!a.completedAt && !a.archivedAt ? `<button data-act="once-edit" data-id="${id}" aria-label="Bearbeiten">${ico('edit')}<small>Bearbeiten</small></button><button data-act="once-archive" data-id="${id}" aria-label="Archivieren">${ico('bag')}<small>Archiv</small></button>` : ''}</div><div class="goal-row quest-once-line" style="--goal-color:${hex(a.color, S.colors.level)}"><span class="goal-name once-title"><span class="goal-dot"></span><strong title="${safe(a.name)}">${safe(a.name)}</strong></span><span class="once-label" title="${safe(label)} · ${num(reward, 1)} XP">${num(reward, 1)} XP</span>${state === 'available' ? `<button class="once-finish" data-act="once-complete" data-id="${id}" aria-label="Einmalige Quest abschließen">${ico('check')}<span>Abschließen</span></button>` : `<span class="once-status">${safe(label)}</span>`}</div></div>`;
}
