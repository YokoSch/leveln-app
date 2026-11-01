/*
 * LEVELN 0.10 · src/shared/ui/icon-galerie.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function enhanceIconSelectors() {
    const root = $('#modalRoot');
    if (!root)
        return;
    for (const sel of root.querySelectorAll('select[name="iconKey"],select[name="icon"],select[name="avatar"]')) {
        if (sel.dataset.galleryReady)
            return;
        sel.dataset.galleryReady = '1';
        sel.classList.add('icon-select-hidden');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'icon-gallery-trigger';
        button.dataset.act = 'icon-open';
        button.innerHTML = `<span class="gallery-preview">${ico(sel.value || 'spark')}</span><span>Symbol auswählen <small>Icon-Galerie öffnen</small></span>${ico('chevron')}`;
        sel.after(button);
    }
}

function openIconGallery(button) {
    pickerSelect = button.previousElementSibling;
    if (!pickerSelect || pickerSelect.tagName !== 'SELECT')
        return;
    S.iconCategory = 'Alle';
    renderIconGallery();
}

function chooseIcon(value) {
    if (!pickerSelect)
        return;
    if (value && !PATH[value])
        return;
    // Select entries absent from legacy dropdown need an option for clean FormData persistence.
    if (![...pickerSelect.options].some(o => o.value === value)) {
        const o = document.createElement('option');
        o.value = value;
        o.textContent = ICON_NAMES[value] || 'Symbol';
        pickerSelect.append(o);
    }
    pickerSelect.value = value;
    pickerSelect.dispatchEvent(new Event('change', { bubbles: true }));
    const trigger = pickerSelect.nextElementSibling;
    if (trigger) {
        trigger.querySelector('.gallery-preview').innerHTML = ico(value || 'spark');
    }
    closeIconGallery();
}

function closeIconGallery() { pickerSelect = null; $('#iconPickerRoot').innerHTML = ''; }

function iconChoices(current) { const listed = [...new Set(Object.values(ICON_GROUPS).flat())].filter(k => PATH[k]); if (current && !listed.includes(current) && PATH[current])
    listed.unshift(current); return listed.map(k => `<option value="${safe(k)}" ${current === k ? 'selected' : ''}>${safe(ICON_NAMES[k] || 'Symbol')}</option>`).join(''); }
