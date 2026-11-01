/*
 * LEVELN 0.10 · pages/charakter/page.base.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function characterView() { const p = profile(), x = xpStats(); return `<div class="character-page rpg-screen"><div class="page-heading"><span class="eyebrow">DEIN HELDENBOGEN</span><h1>Charakter</h1></div><section class="hero-panel" style="--hero-accent:${hex(p.color, '#67c65d')}"><button class="hero-edit icon-button" data-act="profile-edit" aria-label="Charakter bearbeiten">${ico('edit')}</button><div class="hero-intro">${avatarMarkup(p, 'avatar-hero')}<div><small>ABENTEURERPROFIL</small><h2>${safe(p.name)}</h2><p>${safe(p.description)}</p></div></div><div class="hero-lvl"><strong>lvl. ${x.levelN}</strong><small>${num(x.sum, 1)} Gesamt-XP</small></div><div class="hero-meter"><div style="width:${Math.min(100, x.progress / 10)}%;background:${hex(p.color, '#67c65d')}"></div></div><small>${num(x.progress, 1)} / 1.000 XP bis zum nächsten Level</small></section><section class="lv11-inventory" aria-label="Ressourcen und Inventar"><div class="lv11-resource"><span>${ico('ember')}</span><strong>${num(S.wallet?.glut||0,0)}</strong><small>Glut</small></div><div class="lv11-resource"><span>${ico('snow')}</span><strong>${num(S.wallet?.inventory||0,0)} / 2</strong><small>Freezes</small></div><div class="lv11-resource lv11-resource-streak"><span>${ico('flame')}</span><strong>${goals().filter(g=>!isOnce(g.a)&&stData(g).current>0).length}</strong><small>aktive Streaks</small></div><button class="lv11-shop-button" data-act="freeze-shop" aria-label="Freeze-Shop öffnen">${ico('bag')} Shop</button></section><div class="skills-heading"><h2>Skills <span>${S.skills.length}</span></h2><button class="circle-action" data-act="skill-new" aria-label="Skill hinzufügen">${ico('plus')}</button></div>${S.skills.length ? S.skills.map(s => { const xp = skillXp(s.id), st = 1 + Math.floor((xp + 1e-8) / 100), progress = xp % 100; return `<button class="skill-card" data-act="skill-edit" data-id="${safe(s.id)}" style="--skill-accent:${skillColor(s)}"><span class="skill-glyph">${skillIcon(s)}</span><span class="skill-info"><strong>${safe(s.name)}</strong><small>St. ${st} · ${num(xp, 1)} XP</small><span class="skill-meter"><i style="width:${progress}%;background:${skillColor(s)}"></i></span><small>${num(progress, 1)}/100 XP</small></span><span class="skill-arrow">›</span></button>`; }).join('') : '<div class="empty-skill">Noch keine Skills. Erstelle einen Skill oder lege eine Quest an.</div>'}</div>`; }

async function saveProfile(form) { const p = profile(); p.name = form.elements.name.value.trim() || PROFILE_DEFAULT.name; p.description = form.elements.description.value.slice(0, 350); p.color = hex(form.elements.color.value, PROFILE_DEFAULT.color); p.avatar = form.elements.avatar.value; if (form.elements.removeImage.checked)
    p.image = ''; if (form.elements.image.files[0])
    p.image = await fileArt(form.elements.image.files[0]); await saveMeta('characterProfile', p); S.modal = null; render(); toast('Charakter aktualisiert'); }

async function deleteSkill(id) {
    const skill = skillById(id);
    if (!skill)
        return;
    const total = skillXp(id);
    const other = S.skills.filter(s => s.id !== id);
    const response = prompt(`Skill „${skill.name}“ löschen? (${num(total, 1)} historische XP)\n\nA = XP nur beim Charakter lassen\nB = XP einem anderen Skill übertragen\n\nBitte A oder B eingeben.`, 'A');
    if (!response)
        return;
    const pick = response.trim().toUpperCase();
    if (!['A', 'B'].includes(pick))
        return;
    let target = null;
    if (pick === 'B') {
        if (!other.length)
            throw Error('Kein anderer Skill für die Übertragung vorhanden.');
        const names = other.map((s, i) => `${i + 1}: ${s.name}`).join('\n');
        const index = Number(prompt(`Wähle die Nummer des Zielskills:\n${names}`));
        if (!Number.isInteger(index) || index < 1 || index > other.length)
            return;
        target = other[index - 1].id;
    }
    if (!confirm(`Dieser Schritt ist unwiderruflich innerhalb der App. Historische Charakter-XP bleiben erhalten. Skill „${skill.name}“ endgültig entfernen?`))
        return;
    const fate = { ...meta('skillFates', {}) };
    fate[id] = target;
    const nextActivities = S.activities.map(a => {
        const x = structuredClone(a);
        if (isOnce(x)) {
            if (!x.completedAt)
                x.rewardBindings = (x.rewardBindings || []).filter(b => b.skillId !== id);
        }
        else {
            // Preserve historical revisions, but create a new future version with deleted allocations omitted.
            const today = dayAdd(nowDay(), 1), base = structuredClone(revision(x, today));
            base.from = today;
            base.skillRates = { minutes: (base.skillRates?.minutes || []).filter(b => b.skillId !== id), count: (base.skillRates?.count || []).filter(b => b.skillId !== id) };
            x.revisions = (x.revisions || []).filter(r => r.from < today);
            x.revisions.push(base);
            x.revisions.sort((a, b) => a.from.localeCompare(b.from));
        }
        return x;
    });
    await dbTx(['activities', 'skills', 'meta'], tx => { tx.objectStore('skills').delete(id); for (const a of nextActivities)
        tx.objectStore('activities').put(a); tx.objectStore('meta').put({ key: 'skillFates', value: fate }); });
    S.modal = null;
    await sync();
    render();
    toast('Skill entfernt · vergangene XP bleiben erhalten');
}

function skillModal() { const s = skillById(S.modal.id); sheet(s ? 'Skill bearbeiten' : 'Neuen Skill erstellen', `<form id="skillForm" class="rpg-form"><label>Skillname<input name="name" maxlength="60" required value="${safe(s?.name || '')}"></label><label>Beschreibung<textarea name="description" maxlength="350" rows="3">${safe(s?.description || '')}</textarea></label><div class="field-grid"><label>Farbe<input type="color" name="color" value="${skillColor(s)}"></label><label>Symbol<select name="icon">${iconChoices(s?.icon)}</select></label></div><div class="sheet-actions"><button type="button" data-act="modal-close" class="thin-button">Abbrechen</button><button type="submit" class="primary">Skill speichern</button></div></form>${s ? `<button class="danger-button" data-act="skill-delete" data-id="${safe(s.id)}">Skill unwiderruflich entfernen</button>` : ''}`); }

function profileModal() { const p = profile(); sheet('Charakter gestalten', `<form id="profileForm" class="rpg-form"><label>Name<input name="name" maxlength="60" required value="${safe(p.name)}"></label><label>Beschreibung<textarea name="description" maxlength="350" rows="3">${safe(p.description)}</textarea></label><label>Themenfarbe<input type="color" name="color" value="${hex(p.color, '#67c65d')}"></label><label>Standard-Avatar<select name="avatar">${iconChoices(p.avatar)}</select></label><label>Eigenes Charakterbild<input name="image" type="file" accept="image/jpeg,image/png,image/webp"></label><label class="check-color"><input type="checkbox" name="removeImage"> Eigenes Bild entfernen</label><div class="sheet-actions"><button class="thin-button" type="button" data-act="modal-close">Abbrechen</button><button type="submit" class="primary">Charakter speichern</button></div></form>`); }

function avatarMarkup(p = profile(), cls = 'avatar-circle') { if (p.image && /^data:image\/(png|jpeg|webp);base64,/.test(p.image))
    return `<img class="${cls}" src="${p.image}" alt="Charakterbild">`; return `<span class="${cls} avatar-sigil" style="--avatar-color:${hex(p.color, '#67c65d')}">${ico(PATH[p.avatar] ? p.avatar : 'shield')}</span>`; }
