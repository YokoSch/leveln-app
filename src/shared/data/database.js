/*
 * LEVELN 0.10 · src/shared/data/database.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function dbAll(name) { return new Promise((resolve, reject) => { const q = db.transaction(name).objectStore(name).getAll(); q.onsuccess = () => resolve(q.result); q.onerror = () => reject(q.error); }); }

function dbTx(names, fn) { return new Promise((resolve, reject) => { let t = db.transaction(names, 'readwrite'); try {
    fn(t);
}
catch (e) {
    t.abort();
    reject(e);
    return;
} t.oncomplete = resolve; t.onerror = () => reject(t.error); t.onabort = () => reject(t.error || Error('Speicherung abgebrochen')); }); }

async function saveMeta(key, value) { await dbPut('meta', { key, value }); S.meta = S.meta.filter(x => x.key !== key); S.meta.push({ key, value }); }

async function sync05() {
    [S.activities, S.entries, S.overrides, S.meta] = await Promise.all(STORES.map(dbAll));
    S.activities.sort((a, b) => (a.order || 0) - (b.order || 0));
    EM = new Map(S.entries.map(e => [e.id, e]));
    periodCache.clear();
    S.started = meta('v04StartedOn', null);
    S.theme = meta('theme', 'system');
    S.colors = { save: hex(meta('colorSave', '#168a70'), '#168a70'), level: hex(meta('colorLevel', '#9be948'), '#9be948') };
    S.timeout = Math.min(10, Math.max(1, Number(meta('packetTimeout', 3)) || 3));
    S.sound = meta('sound', true) !== false;
    S.checkTime = meta('checkTime', '21:00');
    S.wallet = meta('emberWallet', { glut: 0, inventory: 0, awarded: [], frozen: [], history: [] });
    S.bgMode = meta('backgroundMode', 'system');
    S.bgColor = hex(meta('backgroundColor', '#e6f8e9'), '#e6f8e9');
    S.bgImage = meta('backgroundImage', '');
    S.bgShade = Math.min(90, Math.max(0, Number(meta('backgroundShade', 35))));
    S.iconVariant = meta('iconVariant', 'light');
    applyTheme();
}

function dbOpen() { return new Promise((resolve, reject) => { const q = indexedDB.open(DB_NAME, 2); q.onupgradeneeded = () => { for (const n of STORES)
    if (!q.result.objectStoreNames.contains(n))
        q.result.createObjectStore(n, { keyPath: n === 'meta' ? 'key' : 'id' }); }; q.onsuccess = () => resolve(q.result); q.onerror = () => reject(q.error); }); }

async function sync() { await sync05(); S.skills = await dbAll('skills'); }

function validateBackup(data) {
    for (const n of STORES) {
        if (!Array.isArray(data[n]) || data[n].length > 50000)
            throw Error('Ungültige Daten im Bereich ' + n);
        let seen = new Set();
        for (const x of data[n]) {
            const k = n === 'meta' ? 'key' : 'id';
            if (!x || typeof x !== 'object' || typeof x[k] !== 'string' || seen.has(x[k]))
                throw Error(`Ungültige oder doppelte ID in ${n}`);
            seen.add(x[k]);
        }
    }
    const ids = new Set(data.skills.map(s => s.id));
    if (data.activities.some(a => !a.id || !Array.isArray(a.revisions)))
        throw Error('Ungültige Quest');
    for (const a of data.activities)
        for (const r of a.revisions || [])
            for (const k of ['minutes', 'count'])
                for (const b of r.skillRates?.[k] || [])
                    if (!ids.has(b.skillId) && !(data.meta.find(x => x.key === 'skillFates')?.value || {}).hasOwnProperty(b.skillId))
                        throw Error('XP-Verknüpfung ohne Skill');
    return true;
}

function migrateV08toV09(input) {
    const d = structuredClone(input);
    if (!d || !Array.isArray(d.activities) || !Array.isArray(d.entries) || !Array.isArray(d.meta) || !Array.isArray(d.overrides) || !Array.isArray(d.skills))
        throw Error('Kein gültiger Leveln-0.8-Datenstand.');
    const kind = new Map(d.activities.map(a => [a.id, a.kind]));
    for (const e of d.entries) {
        if (e.source === 'auto' || e.source === 'refused') {
            if (kind.get(e.activityId) === 'reduce') {
                e.source = 'unknown';
                e.mode = 'refused';
                e.status = 'no';
                e.estimated = false;
                e.minutes = null;
                e.count = null;
            }
            else {
                e.source = 'zero-auto';
                e.mode = 'down';
                e.status = 'no';
                e.estimated = false;
                e.minutes = e.minutes === null ? null : 0;
                e.count = e.count === null ? null : 0;
            }
        }
    }
    d.meta = d.meta.filter(m => m.key !== 'schemaVersion');
    d.meta.push({ key: 'schemaVersion', value: 4 });
    return d;
}
