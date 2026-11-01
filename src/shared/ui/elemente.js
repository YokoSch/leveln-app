/*
 * LEVELN 0.10 · src/shared/ui/elemente.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function xpBar() { let x = xpStats(); return `<div class="xp-summary"><span class="level-small">lvl. ${x.levelN}</span><div class="xp-box"><div class="xp-track" id="xpTrack"><span style="width:${x.barSave / 10}%;background:var(--save)"></span><span style="width:${x.barLevel / 10}%;background:var(--level)"></span></div><small>${num(x.progress, 1)}/1000 XP</small></div></div>`; }

/** Calendar milestone forecast. Only a VISUAL hint, never issues currency.
 * One chest is shown at a potential 10th successful streak period. */
function lv11ChestDay(g,d){
  if(!g||isOnce(g.a))return false;
  const p=currentPeriod(g,d);
  if(!p||dayAdd(p.end,-1)!==d)return false;
  const id=frozenKey(g,p);
  // Exact historical award is authoritative (including subsequent corrections).
  if((S.wallet?.awarded||[]).some(x=>x.startsWith(id+'|milestone-')))return true;
  let chain=0;
  for(const prior of periods(g,d)){
    if(prior.end>p.start)break;
    const o=outcome(g,prior);
    if(o.state==='success')chain++;
    else if(o.frozen){}
    else if(o.state==='fail')chain=0;
    else if(!finalLocked(prior))break;
  }
  // For upcoming periods, work forward from the latest measured/closed period.
  let ahead=0;
  for(const candidate of periods(g,d)){
    if(candidate.end<=nowDay())continue;
    if(candidate.start>p.start)break;
    if(candidate.end>p.start)break;
    if(candidate.start<=p.start)ahead++;
  }
  return (chain+ahead)>0 && (chain+ahead)%10===0;
}

function badgeFor(g, d) { if (!g)
    return ''; const p = currentPeriod(g, d); if (!p)
    return ''; let o = outcome(g, p); if (g.r.period !== 'day' && dayAdd(p.end, -1) !== d)
    return ''; if (o.frozen)
    return `<span class="cal-icon snow">${ico('snow')}</span>`; if(lv11ChestDay(g,d)) return `<span class="cal-icon lv11-chest" title="Glut-Belohnung bei erfolgreichem Streak">${ico('chest')}</span>`; if (o.state === 'success')
    return `<span class="cal-icon fire" style="color:${goalColor(g)}">${ico('flame')}</span>`; return ''; }

function freezeAction(g) { let ps = periods(g).filter(p => p.closed && outcome(g, p).state === 'fail' && !outcome(g, p).frozen); let p = ps.at(-1); if (!p || !finalLocked(p) || dayDiff(p.end, nowDay()) > 2)
    return ''; return `<button data-act="rescue" data-key="${safe(g.key)}" data-start="${p.start}" class="rescue">${ico('snow')} Streak für ${pretty(dayAdd(p.end, -1))} retten · 5 Glut</button>`; }

function sheet(title, html, lock = false) { $('#modalRoot').innerHTML = `<div class="shade" ${lock ? '' : 'data-act="modal-close"'}><section class="sheet" role="dialog" aria-modal="true" aria-label="${safe(title)}"><div class="sheet-handle"></div><header><h2>${safe(title)}</h2>${lock ? '' : `<button class="icon-button" data-act="modal-close">${ico('close')}</button>`}</header>${html}</section></div>`; enhanceIconSelectors(); }

function closeModal() { S.modal = null; renderModal(); }

function readNumber(raw, label) { raw = String(raw || '').trim(); if (!raw)
    return null; if (!/^\d+(?:\.\d+)?$/.test(raw) || +raw > 1000000)
    throw Error(`Ungültige Angabe: ${label}`); return +raw; }

async function fileArt(file) { if (!file)
    return null; if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 8e6)
    throw Error('Bitte PNG/JPG/WebP bis 8 MB wählen.'); const bmp = await createImageBitmap(file), c = document.createElement('canvas'); c.width = 160; c.height = 160; const ctx = c.getContext('2d'), scale = Math.max(160 / bmp.width, 160 / bmp.height), w = bmp.width * scale, h = bmp.height * scale; ctx.drawImage(bmp, (160 - w) / 2, (160 - h) / 2, w, h); bmp.close?.(); return c.toDataURL('image/png'); }

function flyChip(el) { return new Promise(resolve => { let start = el?.getBoundingClientRect(), end = $('#xpTrack')?.getBoundingClientRect(); if (!start || !end) {
    resolve();
    return;
} let c = el.cloneNode(true); c.className = 'flying-package'; c.style.left = start.left + 'px'; c.style.top = start.top + 'px'; c.style.width = start.width + 'px'; c.style.height = start.height + 'px'; document.body.append(c); requestAnimationFrame(() => { c.style.transform = `translate(${end.left + end.width / 2 - start.left - start.width / 2}px,${end.top + end.height / 2 - start.top - start.height / 2}px) scale(.18)`; c.style.opacity = '0'; }); setTimeout(() => { c.remove(); resolve(); }, 460); }); }

function xpToast(v) { const r = $('#xpTrack')?.getBoundingClientRect(); if (!r)
    return; let el = document.createElement('div'); el.className = 'xp-toast'; el.style.left = Math.max(8, Math.min(innerWidth - 120, r.left + r.width * .6)) + 'px'; el.style.top = Math.max(8, r.top - 38) + 'px'; el.textContent = `+${num(v, 2)} XP`; document.body.append(el); setTimeout(() => el.remove(), 1100); }

function vibrate() { try {
    navigator.vibrate?.([20, 35, 28]);
}
catch { } }

function celebrate(level) { return new Promise(done => { let root = $('#celebrateRoot'); root.innerHTML = `<div class="levelup"><span>LEVEL UP!</span><strong>lvl. ${level}</strong><p>Dein Fortschritt wächst.</p></div>`; sound(true); vibrate(); setTimeout(() => { root.innerHTML = ''; done(); }, 1350); }); }

function toast(text) { let t = document.createElement('div'); t.className = 'progress-toast'; t.textContent = text; document.body.append(t); setTimeout(() => t.remove(), 2100); }

function sound(big = false) { if (!S.sound)
    return; try {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C)
        return;
    audioCtx ??= new C;
    if (audioCtx.state === 'suspended')
        audioCtx.resume();
    (big ? [523, 659, 785, 1047] : [659, 880]).forEach((f, i) => { let o = audioCtx.createOscillator(), v = audioCtx.createGain(), t = audioCtx.currentTime + i * .09; o.type = 'sine'; o.frequency.setValueAtTime(f, t); v.gain.setValueAtTime(.0001, t); v.gain.exponentialRampToValueAtTime(.06, t + .025); v.gain.exponentialRampToValueAtTime(.0001, t + .2); o.connect(v); v.connect(audioCtx.destination); o.start(t); o.stop(t + .22); });
}
catch { } }

function showError(err) { console.error(err); S.busy = false; S.packetBusy = false; alert('Leveln: ' + (err?.message || String(err))); render(); }

async function animateCard(direction, done) { const el = $('#activeCard'); if (!el) {
    await done();
    return;
} S.busy = true; let dx = direction === 'left' ? -innerWidth : direction === 'right' ? innerWidth : 0, dy = direction === 'up' ? -innerHeight : direction === 'down' ? innerHeight : 0; el.style.transition = 'transform 260ms cubic-bezier(.2,.65,.2,1), opacity 260ms'; el.style.transform = `translate(${dx}px,${dy}px) rotate(${dx * .012}deg)`; el.style.opacity = '.15'; await new Promise(resolve => setTimeout(resolve, 275)); try {
    S.busy = false;
    await done();
}
finally {
    S.busy = false;
} }

function goalColor(g) { return g.r.colorEnabled === false || !g.r.color ? (g.a.kind === 'reduce' ? S.colors.save : S.colors.level) : hex(g.r.color, g.a.kind === 'reduce' ? S.colors.save : S.colors.level); }

function goalRow(g, archived = false) {
    const k = safe(g.key), expanded = S.goalExpanded === g.key, selected = S.selectedGoal === g.key;
    return `<div class="goal-swipe" data-goal="${k}"><div class="goal-row-actions"><button data-act="edit-goal" data-key="${k}" aria-label="Bearbeiten">${ico('edit')}<small>Bearbeiten</small></button>${archived ? '' : `<button data-act="archive-goal" data-key="${k}" aria-label="Archivieren">${ico('bag')}<small>Archiv</small></button>`}</div><div class="goal-row ${selected ? 'active' : ''}" style="--goal-color:${goalColor(g)}"><button data-act="goal-select" data-key="${k}" class="goal-name"><span class="goal-dot"></span><strong>${safe(g.a.name)}</strong></button><span class="goal-streak">${ico('flame')} ${stData(g).current}</span><button class="icon-button" data-act="goal-expand" data-key="${k}">${ico('chevron')}</button>${expanded ? `<div class="goal-details"><p>${safe(detailGoal(g))}</p><small>Beste Streak ${stData(g).best} · ${g.a.kind === 'reduce' ? 'Zaubern' : 'Leveln'}</small><div><button data-act="edit-day" data-day="${nowDay()}" data-key="${k}">Heute korrigieren</button><button data-act="edit-day" data-day="${dayAdd(nowDay(), -1)}" data-key="${k}">Gestern korrigieren</button></div>${freezeAction(g)}</div>` : ''}</div></div>`;
}

function cardStatus(g, d) { return isOnce(g.a) ? 'open' : initialState(g, d); }

function shortCode(name) { return String(name || 'QUEST').trim().replace(/[^a-zA-ZäöüÄÖÜß0-9]/g, '').toUpperCase().slice(0, 5) || 'QUEST'; }

function suggestStandard(period, value, metric, startDate = nowDay(), mode = 'calendar') { if (value === null || value === '' || value === undefined)
    return ''; const total = Number(value); if (metric === 'count')
    return period === 'day' ? total : 1; let days = ({ day: 1, week: 7, month: 30, year: 365 }[period] || 1); if (mode !== 'restart' && (period === 'month' || period === 'year')) {
    const anchor = calendarStart(period, startDate);
    days = dayDiff(anchor, calendarNext(period, anchor));
} return Number((total / days).toFixed(2)); }

function nav() {
    const tabs = [['today', 'home', S.day === nowDay() ? 'Heute' : 'Gestern'], ['goals', 'goals', 'Quests'], ['character', 'user', 'Charakter'], ['stats', 'chart', 'Statistik']];
    $('#bottomNav').innerHTML = `<nav class="tabs tabs-five">${tabs.map(([p, i, t]) => `<button class="tab ${S.page === p ? 'on' : ''}" data-act="tab" data-page="${p}">${p === 'character' ? avatarMarkup(profile(), 'nav-avatar') : ico(i)}<small>${t}</small></button>`).join('')}<div class="nav-more-wrap"><button class="tab nav-more ${S.moreOpen ? 'on' : ''}" data-act="more-toggle" aria-label="Mehr Optionen" aria-expanded="${!!S.moreOpen}">${ico('dots')}<small>Mehr</small></button>${S.moreOpen ? `<div class="nav-more-pop"><button data-act="export">${ico('save')} Backup sichern</button><button data-act="settings-toggle">${ico('settings')} ${S.page === 'settings' ? 'Zurück' : 'Einstellungen'}</button></div>` : ''}</div></nav>`;
    if ($('#settingsShortcut'))
        $('#settingsShortcut').innerHTML = '';
    if ($('#backupShortcut'))
        $('#backupShortcut').innerHTML = '';
}

function detailGoal(g) { const parts = metricKeys(g.r).map(k => k === 'minutes' ? formatMin(ruleValue(g.r, k)) : num(ruleValue(g.r, k)) + ' ×'); return `${g.a.kind === 'reduce' ? 'Mana:' : 'Ziel:'} ${parts.join(' + ')} · ${NAMES[g.r.period]}${isRestart(g.r) ? ' · Neustart' : ''}`; }
