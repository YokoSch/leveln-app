/*
 * LEVELN 0.10 · src/shared/compat/events.js
 * Bestands-Event-Handler aus 0.9; vor v0.10 Capture-Handlern laden
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

document.addEventListener('click', e => { if (Date.now() < suppressClickUntil)
    return; let el = e.target.closest('[data-act]'); if (!el)
    return; if (el.classList.contains('shade') && e.target !== el)
    return; handleAction(el.dataset.act, el); });

document.addEventListener('input', e => { const el = e.target; if (el.classList.contains('card-entry-input')) {
    const key = el.dataset.goal + '|' + S.day;
    let draft = S.cardDrafts.get(key) || {};
    draft[el.dataset.metric] = el.value;
    S.cardDrafts.set(key, draft);
} });

document.addEventListener('change', e => { const el = e.target; if (el.classList.contains('card-entry-input'))
    updatePlayAmount(el.dataset.goal, el.dataset.metric, el.value).catch(showError); });

document.addEventListener('submit', e => { if (e.target.id === 'goalForm') {
    e.preventDefault();
    saveGoal(e.target).catch(showError);
} if (e.target.id === 'dayForm') {
    e.preventDefault();
    saveDay(e.target).catch(showError);
} });

document.addEventListener('change', e => { const el = e.target; if (el.dataset.setting) {
    let k = el.dataset.setting, v = k === 'sound' ? el.checked : k === 'packetTimeout' || k === 'backgroundShade' ? Number(el.value) : el.value;
    storeSetting(k, v).catch(showError);
} if (el.id === 'bgImagePicker' && el.files[0])
    saveBackgroundImage(el.files[0]).catch(showError); if (el.id === 'statGoal') {
    S.statGoal = el.value;
    render();
} if (el.id === 'statStack') {
    S.statStack = el.checked;
    render();
} if (el.id === 'statMetric') {
    S.statMetric = el.value;
    render();
} if (el.id === 'iconPreviewSelect') {
    storeSetting('iconVariant', el.value).catch(showError);
} });

document.addEventListener('submit', e => { if (e.target.id === 'profileForm') {
    e.preventDefault();
    saveProfile(e.target).catch(showError);
} if (e.target.id === 'skillForm') {
    e.preventDefault();
    saveSkill(e.target).catch(showError);
} });

document.addEventListener('change', e => { if (e.target.name === 'kind' || e.target.name === 'questType') {
    const f = e.target.form, banner = f?.querySelector('.quest-type-banner');
    if (banner) {
        const once = f.elements.questType.value === 'once', isSpell = f.elements.kind.value === 'reduce';
        banner.textContent = once ? 'EINMALIGE MISSION' : isSpell ? 'ZAUBER-QUEST' : 'LEVELN-QUEST';
        banner.style.setProperty('--type-color', isSpell ? S.colors.save : S.colors.level);
    }
} if (e.target.name === 'unlimited') {
    const f = e.target.form;
    if (f)
        f.elements.availableUntil.disabled = e.target.checked;
} if (['period', 'mode', 'startDate'].includes(e.target.name)) {
    const f = e.target.form;
    if (!S.modal?.key && !S.modal?.activityId && f) {
        for (const [target, source, metric] of [['stdMinutes', 'minutes', 'minutes'], ['stdCount', 'count', 'count']]) {
            const input = f.elements[target];
            if (input && !input.dataset.edited)
                input.value = suggestStandard(f.elements.period.value, f.elements[source].value, metric, f.elements.startDate.value, f.elements.mode.value);
        }
    }
} });

document.addEventListener('input', e => { if (['stdMinutes', 'stdCount'].includes(e.target.name))
    e.target.dataset.edited = 'true'; const f = e.target.form; if (f && ['minutes', 'count'].includes(e.target.name) && !S.modal?.key && !S.modal?.activityId) {
    const target = f.elements[e.target.name === 'minutes' ? 'stdMinutes' : 'stdCount'];
    if (target && !target.dataset.edited)
        target.value = suggestStandard(f.elements.period.value, e.target.value, e.target.name, f.elements.startDate.value, f.elements.mode.value);
} });

document.addEventListener('change', e => { if (e.target.id === 'questTypeSelect') {
    const f = e.target.closest('form'), once = e.target.value === 'once';
    f.querySelector('#oneTimeFields').hidden = !once;
    f.querySelector('#recurringFields').hidden = once;
    f.querySelector('#onceRewards').hidden = !once;
    f.querySelector('#recurringRates').hidden = once;
} });

$('#bgImageFile').addEventListener('change', e => { if (e.target.files[0])
    saveBackgroundImage(e.target.files[0]).catch(showError); e.target.value = ''; });

$('#importFile').addEventListener('change', e => { if (e.target.files[0])
    importBackup(e.target.files[0]).catch(showError); e.target.value = ''; });

document.addEventListener('pointerdown', e => {
    const goalrow = e.target.closest('.goal-swipe');
    if (goalrow && !e.target.closest('.goal-row-actions,button[data-act=once-complete],button[data-act=goal-expand]'))
        goalSwipe = { id: e.pointerId, el: goalrow, startX: e.clientX, startY: e.clientY, old: goalrow.classList.contains('revealed') };
    const surface = e.target.closest('#activeCard,.deck-gesture-tail');
    const card = surface?.id === 'activeCard' ? surface : surface?.closest('.deck-stack')?.querySelector('#activeCard');
    if (card && !e.target.closest('button,input,select,textarea,label') && !S.packet && !S.busy) {
        gesture = { id: e.pointerId, x: e.clientX, y: e.clientY, time: performance.now(), key: card.dataset.goal, el: card };
        surface.setPointerCapture?.(e.pointerId);
    }
    const wheel = null;
    if (wheel) {
        wheelGesture = { id: e.pointerId, x: e.clientX, last: e.clientX, time: performance.now(), el: wheel, moved: false };
        wheel.setPointerCapture?.(e.pointerId);
    }
    const chip = e.target.closest('.package-chip');
    if (chip) {
        clearTimeout(timer);
        packageGesture = { id: e.pointerId, y: e.clientY, el: chip, n: Number(chip.dataset.n) };
        chip.setPointerCapture?.(e.pointerId);
    }
}, { passive: true });

document.addEventListener('pointermove', e => {
    if (goalSwipe && goalSwipe.id === e.pointerId) {
        const dx = e.clientX - goalSwipe.startX, dy = e.clientY - goalSwipe.startY;
        if (Math.abs(dx) > 18 && Math.abs(dx) > Math.abs(dy) * 1.25) {
            goalSwipe.el.classList.add('dragging');
            goalSwipe.el.style.setProperty('--row-shift', Math.max(-130, Math.min(0, (goalSwipe.old ? -130 : 0) + dx)) + 'px');
        }
    }
    if (gesture && e.pointerId === gesture.id) {
        let dx = e.clientX - gesture.x, dy = e.clientY - gesture.y;
        gesture.el.style.transform = `translate(${dx * .8}px,${dy * .8}px) rotate(${dx * .012}deg)`;
    }
    if (wheelGesture && e.pointerId === wheelGesture.id) {
        let dx = e.clientX - wheelGesture.x;
        let offset = Math.max(-85, Math.min(85, dx));
        wheelGesture.el.style.transform = `translateX(${offset}px)`;
        if (Math.abs(dx) > 8)
            wheelGesture.moved = true;
    }
    if (packageGesture && e.pointerId === packageGesture.id) {
        let dy = e.clientY - packageGesture.y;
        packageGesture.el.style.transform = `translateY(${Math.min(0, dy)}px) scale(${dy < 0 ? 1.08 : 1})`;
    }
});

document.addEventListener('pointerup', e => {
    if (goalSwipe && goalSwipe.id === e.pointerId) {
        const sw = goalSwipe;
        goalSwipe = null;
        const dx = e.clientX - sw.startX, dy = e.clientY - sw.startY;
        sw.el.classList.remove('dragging');
        sw.el.style.removeProperty('--row-shift');
        if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
            suppressClickUntil = Date.now() + 280;
            document.querySelectorAll('.goal-swipe.revealed').forEach(x => { if (x !== sw.el)
                x.classList.remove('revealed'); });
            sw.el.classList.toggle('revealed', dx < 0);
        }
    }
    if (gesture && e.pointerId === gesture.id) {
        let g = gesture;
        gesture = null;
        let dx = e.clientX - g.x, dy = e.clientY - g.y, absX = Math.abs(dx), absY = Math.abs(dy);
        if (Math.max(absX, absY) > 70) {
            suppressClickUntil = Date.now() + 420;
            let goal = goalByKey(g.key, S.day);
            if (absX > absY) {
                animateCard(dx > 0 ? 'right' : 'left', async () => rotate(dx > 0 ? -1 : 1)).catch(showError);
            }
            else if (dy > 0) {
                // 0.10: a short down swipe switches the entire deck.
                animateCard('down', async () => lv10DeckSelect(S.deckKind === 'build' ? 'reduce' : 'build')).catch(showError);
            }
            else if (canEdit(S.day)) {
                // 0.10: up only books; the active card is never auto-rotated.
                animateCard('up', async () => { await startCard(goal, true); }).catch(showError);
            }
            else {
                render();
                toast('Vergangene Tage sind gesperrt');
            }
        }
        else {
            g.el.style.transform = '';
            g.el.style.opacity = '';
        }
    }
    if (wheelGesture && e.pointerId === wheelGesture.id) {
        let w = wheelGesture;
        wheelGesture = null;
        const dx = e.clientX - w.x, dt = performance.now() - w.time;
        w.el.style.transition = 'transform 190ms cubic-bezier(.2,.8,.2,1)';
        w.el.style.transform = 'translateX(0)';
        if (Math.abs(dx) >= 30 || (Math.abs(dx) >= 17 && dt < 170)) {
            suppressClickUntil = Date.now() + 280;
            const target = dx > 0 ? dayAdd(nowDay(), -1) : nowDay();
            S.day = target;
            S.card = 0;
            S.packet = null;
            setTimeout(() => { render(); }, 155);
        }
    }
    if (packageGesture && e.pointerId === packageGesture.id) {
        let q = packageGesture;
        packageGesture = null;
        let dy = e.clientY - q.y;
        q.el.style.transform = '';
        if (dy < -38) {
            suppressClickUntil = Date.now() + 380;
            sendPacket(q.n, q.el).catch(showError);
        }
        else
            armTimer();
    }
});

document.addEventListener('pointercancel', () => { gesture = null; wheelGesture = null; if (packageGesture) {
    packageGesture.el.style.transform = '';
    packageGesture = null;
} clearTimeout(timer); armTimer(); });

document.addEventListener('visibilitychange', () => { if (document.hidden)
    clearTimeout(timer);
else {
    if (S.packet)
        armTimer();
    else if (!S.modal) {
        reconcile().then(() => { render(); maybeCheckin(); }).catch(console.error);
    }
} });

window.addEventListener('focus', () => { if (S.packet)
    armTimer(); });

setInterval(() => { if (!document.hidden && !S.packet && !S.modal) {
    if (S.day !== nowDay() && S.day === dayAdd(nowDay(), -1)) { }
    maybeCheckin();
} }, 60000);

window.addEventListener('error', e => console.error('Leveln 0.9', e.error));
