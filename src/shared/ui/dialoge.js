/*
 * LEVELN 0.10 · src/shared/ui/dialoge.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function renderModal05() {
    if (!S.modal) {
        $('#modalRoot').innerHTML = '';
        return;
    }
    if (S.modal.type === 'edit-goal')
        return editGoalModal();
    if (S.modal.type === 'edit-day')
        return editDayModal();
    if (S.modal.type === 'checkin')
        return checkinModal();
    if (S.modal.type === 'menu')
        return cardMenuModal();
}

function cardMenuModal() { let g = goalByKey(S.modal.key, S.day); if (!g) {
    closeModal();
    return;
} sheet(g.a.name, `<div class="menu-actions"><button data-act="edit-goal" data-key="${safe(g.key)}">${ico('target')} Ziel bearbeiten</button><button data-act="edit-day" data-day="${S.day}">${ico('edit')} Tageswerte ansehen / korrigieren</button><button data-act="show-goal" data-key="${safe(g.key)}">${ico('calendar')} Im Kalender anzeigen</button></div>`); }

async function refuse(g, d) { if (!canEdit(d))
    throw Error('Der Tag ist bereits gesperrt.'); await dbPut('entries', makeEntry(g, d, { ...assumed(g, d), source: 'refused' })); await sync(); }

function packetDefault(g, metric) {
    let base = ruleValue(g.r, metric);
    if (g.a.kind === 'build')
        return g.r[metric === 'minutes' ? 'standardMinutes' : 'standardCount'] ?? (g.r.period === 'day' ? base : null);
    if (base === null)
        return null;
    return g.r.period === 'day' ? base : metric === 'count' ? Math.max(1, Math.ceil(base / limit(g.r))) : Math.ceil(base / limit(g.r) * 100) / 100;
}

async function finishPhase() {
    if (!S.packet || S.packetBusy)
        return;
    clearTimeout(timer);
    let previousXp = xpStats().sum;
    const q = S.packet, g = goalByKey(q.key, q.day);
    if (!g) {
        S.packet = null;
        render();
        return;
    }
    let k = q.phase, e = entry(g, q.day);
    if (!q.fired[k] && !finite(e?.[k])) {
        await dbPut('entries', makeEntry(g, q.day, { [k]: packetDefault(g, k) }));
        await sync();
    }
    if (Math.floor(xpStats().sum / 1000) > Math.floor(previousXp / 1000))
        await celebrate(Math.floor(xpStats().sum / 1000) + 1);
    let idx = q.phases.indexOf(k);
    if (idx + 1 < q.phases.length) {
        q.phase = q.phases[idx + 1];
        render();
    }
    else {
        S.packet = null;
        await advanceCard();
    }
}

async function advanceCard() { let gs = goals(S.day), idx = gs.findIndex(x => x.key === S.packet?.key); if (idx < 0)
    idx = S.card; let next = gs.findIndex((g, i) => i > idx && initialState(g, S.day) === 'open'); if (next < 0)
    next = gs.findIndex(g => initialState(g, S.day) === 'open'); S.card = next >= 0 ? next : Math.min(idx + 1, gs.length - 1); render(); if (gs.length && gs.every(g => initialState(g, S.day) !== 'open'))
    toast('Alle Karten heute erfasst ✨'); }

function armTimer() { clearTimeout(timer); if (!S.packet || S.packetBusy || S.modal)
    return; timer = setTimeout(() => finishPhase().catch(showError), S.timeout * 1000); }

async function sendPacket(n, source) {
    if (!S.packet || S.packetBusy)
        return;
    let q = S.packet, g = goalByKey(q.key, q.day);
    if (!g)
        return;
    S.packetBusy = true;
    clearTimeout(timer);
    try {
        const k = q.phase, e = entry(g, q.day), before = xpStats().sum, next = (finite(e?.[k]) ? e[k] : 0) + n;
        if (k === 'count' && !Number.isInteger(next))
            throw Error('Anzahlen müssen ganze Zahlen sein.');
        if (next > 1000000)
            throw Error('Zu große Menge.');
        await dbPut('entries', makeEntry(g, q.day, { [k]: next, source: 'user' }));
        q.fired[k] = true;
        await sync();
        await flyChip(source);
        render();
        const after = xpStats().sum, gain = after - before;
        if (gain > 0) {
            sound(false);
            xpToast(gain);
            if (Math.floor(after / 1000) > Math.floor(before / 1000))
                await celebrate(Math.floor(after / 1000) + 1);
        }
    }
    finally {
        S.packetBusy = false;
        armTimer();
    }
}

async function storeSetting(k, v) { await saveMeta(k, v); await sync(); render(); }

async function erase() { if (!confirm('Alle persönlichen Daten unwiderruflich löschen? Sichere vorher ein Backup.'))
    return; if (!confirm('Wirklich vollständig löschen?'))
    return; await dbTx(STORES, t => STORES.forEach(n => t.objectStore(n).clear())); S.packet = null; S.modal = null; await setup(); }

function handleAction05(act, el) {
    return (async () => {
        if (act === 'tab') {
            go(el.dataset.page);
            return;
        }
        if (act === 'date') {
            if (canEdit(el.dataset.day)) {
                S.day = el.dataset.day;
                S.card = 0;
                S.packet = null;
                render();
            }
            return;
        }
        if (act === 'date-shift') {
            let d = dayAdd(S.day, Number(el.dataset.shift));
            if (canEdit(d)) {
                S.day = d;
                S.card = 0;
                S.packet = null;
                render();
            }
            return;
        }
        if (act === 'go-goals') {
            go('goals');
            return;
        }
        if (act === 'new') {
            S.modal = { type: 'edit-goal' };
            renderModal();
            return;
        }
        if (act === 'menu') {
            S.modal = { type: 'menu', key: el.dataset.key };
            renderModal();
            return;
        }
        if (act === 'edit-goal') {
            S.modal = { type: 'edit-goal', key: el.dataset.key };
            renderModal();
            return;
        }
        if (act === 'modal-close') {
            if (S.modal?.type === 'checkin')
                return;
            S.modal = null;
            renderModal();
            if (checkinItems().length && S.checkShown && S.page === 'today')
                maybeCheckin(true);
            return;
        }
        if (act === 'edit-day' || act === 'check-edit') {
            S.modal = { type: 'edit-day', day: el.dataset.day, onlyKey: el.dataset.key || null };
            renderModal();
            return;
        }
        if (act === 'show-goal') {
            S.selectedGoal = el.dataset.key;
            S.page = 'goals';
            S.modal = null;
            render();
            return;
        }
        if (act === 'packet') {
            await sendPacket(Number(el.dataset.n), el);
            return;
        }
        if (act === 'packet-skip') {
            await finishPhase();
            return;
        }
        if (act === 'cal-toggle') {
            S.calendarOpen = !S.calendarOpen;
            render();
            return;
        }
        if (act === 'cal-view') {
            S.calView = el.dataset.view;
            render();
            return;
        }
        if (act === 'cal-prev' || act === 'cal-next') {
            calMove(act === 'cal-prev' ? -1 : 1);
            render();
            return;
        }
        if (act === 'cal-day') {
            let d = el.dataset.day;
            if (d <= nowDay()) {
                S.modal = { type: 'edit-day', day: d };
                renderModal();
            }
            return;
        }
        if (act === 'cal-jump') {
            S.calView = 'month';
            S.calAnchor = el.dataset.day;
            render();
            return;
        }
        if (act === 'cal-jump-year') {
            S.calView = 'year';
            S.calAnchor = el.dataset.day;
            render();
            return;
        }
        if (act === 'goal-select') {
            S.selectedGoal = el.dataset.key;
            render();
            return;
        }
        if (act === 'archive-goal') {
            await archiveRule(el.dataset.key);
            return;
        }
        if (act === 'goal-expand') {
            S.goalExpanded = S.goalExpanded === el.dataset.key ? null : el.dataset.key;
            S.selectedGoal = el.dataset.key;
            render();
            return;
        }
        if (act === 'rescue') {
            if (!confirm('Streak jetzt für 5 Glut retten?'))
                return;
            await buyFreeze(el.dataset.key + '|' + el.dataset.start);
            return;
        }
        if (act === 'buy') {
            await buyFreeze(null);
            return;
        }
        if (act === 'refuse') {
            const g = goalByKey(el.dataset.key, el.dataset.day);
            if (g) {
                await refuse(g, el.dataset.day);
                render();
                S.modal = { type: 'checkin' };
                renderModal();
            }
            return;
        }
        if (act === 'refuse-all') {
            if (!confirm('Alle offenen Einträge bewusst verweigern?'))
                return;
            for (let { g, d } of checkinItems())
                await refuse(g, d);
            S.modal = null;
            render();
            toast('Offene Einträge abgeschlossen');
            return;
        }
        if (act === 'checkin') {
            S.modal = null;
            maybeCheckin(true);
            return;
        }
        if (act === 'stat-metric') {
            S.statMetric = el.dataset.metric;
            render();
            return;
        }
        if (act === 'icon-variant') {
            await storeSetting('iconVariant', el.dataset.variant);
            toast('Icon-Auswahl übernommen');
            return;
        }
        if (act === 'background-remove') {
            await dbTx(['meta'], t => { t.objectStore('meta').put({ key: 'backgroundMode', value: 'system' }); t.objectStore('meta').put({ key: 'backgroundImage', value: '' }); });
            await sync();
            render();
            return;
        }
        if (act === 'stat-period') {
            S.statPeriod = el.dataset.period;
            S.statAnchor = nowDay();
            render();
            return;
        }
        if (act === 'stat-prev' || act === 'stat-next') {
            if (S.statPeriod === 'all')
                return;
            let step = act === 'stat-prev' ? -1 : 1;
            let d = asDate(S.statAnchor);
            if (S.statPeriod === 'day')
                d.setDate(d.getDate() + step);
            if (S.statPeriod === 'week')
                d.setDate(d.getDate() + 7 * step);
            if (S.statPeriod === 'month')
                d.setMonth(d.getMonth() + step);
            if (S.statPeriod === 'year')
                d.setFullYear(d.getFullYear() + step);
            S.statAnchor = iso(d);
            render();
            return;
        }
        if (act === 'export') {
            await exportBackup();
            return;
        }
        if (act === 'import') {
            $('#importFile').click();
            return;
        }
        if (act === 'erase') {
            await erase();
            return;
        }
    })().catch(showError);
}

function editDayModal() {
    const d = S.modal.day, editable = canEdit(d), all = goals(d).filter(x => !isOnce(x.a) && (!S.modal.onlyKey || x.key === S.modal.onlyKey)).sort((x, y) => (x.a.kind === 'build' ? 0 : 1) - (y.a.kind === 'build' ? 0 : 1));
    const html = `<div class="edit-day-sub">${pretty(d)} · ${editable ? 'Bearbeitbar' : 'Nur ansehen – gesperrt'}</div><form id="dayForm" data-day="${d}">${all.map((g, i) => { let e = entry(g, d), s = e?.source === 'refused' || e?.source === 'auto' ? 'refused' : e?.mode || '', ck = metricKeys(g.r); return `<div class="day-edit-row" data-goal="${safe(g.key)}"><div class="day-edit-title"><strong>${safe(g.a.name)}</strong><small>${g.a.kind === 'reduce' ? 'Zaubern' : 'Leveln'} · ${NAMES[g.r.period]}</small></div><label>Status<select name="mode_${i}" ${editable ? '' : 'disabled'}><option value="" ${!s ? 'selected' : ''}>Offen</option><option value="up" ${s === 'up' ? 'selected' : ''}>${g.a.kind === 'reduce' ? 'Mana verbraucht' : 'Etwas trainiert'}</option><option value="down" ${s === 'down' ? 'selected' : ''}>${g.a.kind === 'reduce' ? 'Kein Mana verbraucht' : 'Nichts trainiert'}</option><option value="refused" ${s === 'refused' ? 'selected' : ''}>Bewusst nicht eingetragen</option></select></label><div class="field-grid">${ck.includes('minutes') ? `<label>Minuten<input name="minutes_${i}" type="number" min="0" step="0.01" ${editable ? '' : 'disabled'} value="${e?.minutes ?? ''}" placeholder="Nicht angegeben"></label>` : '<div></div>'}${ck.includes('count') ? `<label>Anzahl<input name="count_${i}" type="number" min="0" step="1" ${editable ? '' : 'disabled'} value="${e?.count ?? ''}" placeholder="Nicht angegeben"></label>` : '<div></div>'}</div><label>Kommentar<input name="comment_${i}" maxlength="1000" value="${safe(e?.comment || '')}" ${editable ? '' : 'disabled'} placeholder="Optional"></label></div>`; }).join('') || '<p class="muted">Für diesen Tag gibt es keine aktiven Ziele.</p>'}${editable && all.length ? `<button class="primary save-day" type="submit">Änderungen speichern</button>` : ''}</form>`;
    sheet(S.modal.onlyKey ? (all[0]?.a.name || 'Ziel') : 'Tagesprotokoll', html);
}

async function saveDay(form) {
    const d = S.modal.day;
    if (!canEdit(d))
        throw Error('Dieser Tag ist gesperrt.');
    const gs = goals(d).filter(g => !isOnce(g.a) && (!S.modal.onlyKey || g.key === S.modal.onlyKey)).sort((x, y) => (x.a.kind === 'build' ? 0 : 1) - (y.a.kind === 'build' ? 0 : 1));
    let changes = [];
    for (let i = 0; i < gs.length; i++) {
        const g = gs[i], m = form.elements['mode_' + i]?.value || '';
        if (!m) {
            changes.push({ delete: entryKey(g, d), g });
            continue;
        }
        const fields = m === 'refused' ? unknownFields(g) : { mode: m, status: m === 'up' ? 'yes' : 'no', source: g.a.kind === 'reduce' && m === 'down' && d < nowDay() ? 'zero-confirmed' : 'user', estimated: false };
        if (m !== 'refused')
            for (const k of metricKeys(g.r)) {
                const field = form.elements[`${k}_${i}`], value = readNumber(field?.value, k);
                if (k === 'count' && value !== null && !Number.isInteger(value))
                    throw Error('Anzahl muss ganzzahlig sein.');
                fields[k] = value;
                if (value === null) {
                    if (m === 'down' || g.a.kind === 'build')
                        fields[k] = 0;
                    else
                        throw Error('Bitte den tatsächlichen Mana-Verbrauch angeben oder „Bewusst nicht eingetragen“ wählen.');
                }
            }
        fields.comment = form.elements['comment_' + i]?.value?.slice(0, 1000) || '';
        changes.push({ put: makeEntry(g, d, fields), g });
    }
    await dbTx(['entries'], t => { const store = t.objectStore('entries'); for (const c of changes) {
        if (c.delete) {
            store.delete(c.delete);
            if (c.g.index === 0)
                store.delete(`${c.g.a.id}|${d}`);
        }
        else
            store.put(c.put);
    } });
    S.modal = null;
    S.cardDrafts.clear();
    await sync();
    await reconcileWallet();
    render();
    toast('Tagesdaten gespeichert');
    maybeCheckin(true);
}

function renderModal() { if (!S.modal) {
    $('#modalRoot').innerHTML = '';
    return;
} if (S.modal.type === 'intro') return lv11IntroModal(); if (S.modal.type === 'freeze-shop') return lv11FreezeShop(); if (S.modal.type === 'profile')
    return profileModal(); if (S.modal.type === 'skill')
    return skillModal(); return renderModal05(); }

async function handleRPGAction(act, el) {
    if (act === 'quest-filter') {
        S.questFilter = el.dataset.filter;
        render();
        return true;
    }
    if (act === 'card-toggle') {
        S.cardExpanded = !S.cardExpanded;
        render();
        return true;
    }
    if (act === 'tab') {
        S.moreOpen = false;
        const p = el.dataset.page;
        if (p === 'today' && S.page === 'today') {
            S.day = S.day === nowDay() ? dayAdd(nowDay(), -1) : nowDay();
            S.card = 0;
            S.cardExpanded = false;
            S.cardDrafts.clear();
            render();
            return true;
        }
        S.cardExpanded = false;
        go(p);
        return true;
    }
    if (act === 'settings-toggle') {
        S.moreOpen = false;
        if (S.page === 'settings')
            go(S.previousPage || 'today');
        else {
            S.previousPage = S.page;
            go('settings');
        }
        return true;
    }
    if (act === 'profile-edit') {
        S.modal = { type: 'profile' };
        renderModal();
        return true;
    }
    if (act === 'skill-new') {
        S.modal = { type: 'skill' };
        renderModal();
        return true;
    }
    if (act === 'skill-edit') {
        S.modal = { type: 'skill', id: el.dataset.id };
        renderModal();
        return true;
    }
    if (act === 'skill-delete') {
        await deleteSkill(el.dataset.id);
        return true;
    }
    if (act === 'mana-confirm') {
        await answerManaCheckin('confirmed');
        return true;
    }
    if (act === 'mana-correct') {
        S.modal = { type: 'edit-day', day: dayAdd(nowDay(), -1), onlyKey: S.checkinQueue?.[0]?.key || null };
        renderModal();
        return true;
    }
    if (act === 'mana-unknown') {
        await answerManaCheckin('unknown');
        return true;
    }
    if (act === 'once-complete') {
        await completeOnce(el.dataset.id);
        return true;
    }
    if (act === 'once-edit') {
        S.modal = { type: 'edit-goal', activityId: el.dataset.id };
        renderModal();
        return true;
    }
    if (act === 'once-archive') {
        await archiveOnce(el.dataset.id);
        return true;
    }
    if (act === 'check-later') {
        S.modal = null;
        S.checkShown = true;
        renderModal();
        return true;
    }
    if (act === 'check-now') {
        S.modal = { type: 'edit-day', day: dayAdd(nowDay(), -1) };
        renderModal();
        return true;
    }
    if (act === 'refuse-all') {
        if (!confirm('Alle gestrigen offenen Einträge bewusst nicht erfassen?'))
            return true;
        for (const { g, d } of checkinItems())
            await refuse(g, d);
        S.modal = null;
        await reconcileWallet();
        render();
        toast('Gestrige Einträge abgeschlossen');
        return true;
    }
    if (act === 'binding-add') {
        const form = el.closest('form'), once = form.elements.questType.value === 'once';
        const target = form.querySelector(once ? '#onceRewards' : '#recurringRates');
        target.insertAdjacentHTML('beforeend', once ? rewardRowHTML({ skillId: S.skills[0]?.id || '__new__', xp: 10 }) : rateRowHTML({ metric: 'minutes', skillId: S.skills[0]?.id || '__new__', rate: 0 }));
        return true;
    }
    if (act === 'binding-remove') {
        el.closest('.binding-row')?.remove();
        return true;
    }
    return false;
}
