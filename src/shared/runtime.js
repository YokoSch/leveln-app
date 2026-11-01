/*
 * LEVELN 0.10 · src/shared/runtime.js
 * Globale Konstanten und gemeinsamer Laufzeitstatus – in der Startreihenfolge initialisieren
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

const DB_NAME = 'progress-private-v1', STORES = ['activities', 'entries', 'overrides', 'meta', 'skills'];

const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));

const safe = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const uid = () => crypto.randomUUID?.() || 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2);

const pad = x => String(x).padStart(2, '0');

const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const nowDay = () => iso(new Date());

const asDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };

const dayAdd = (s, n) => { let d = asDate(s); d.setDate(d.getDate() + n); return iso(d); };

const dayDiff = (a, b) => Math.round((asDate(b) - asDate(a)) / 86400000);

const dayName = s => asDate(s).toLocaleDateString('de-DE', { weekday: 'short' });

const pretty = (s, options = { day: 'numeric', month: 'long', year: 'numeric' }) => asDate(s).toLocaleDateString('de-DE', options);

const finite = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;

const num = (n, d = 1) => Number(n || 0).toLocaleString('de-DE', { maximumFractionDigits: d });

const formatMin = m => m == null ? '—' : m >= 60 ? `${num(m / 60, 1)} h` : `${num(m, 1)} min`;

const NAMES = { day: 'Täglich', week: 'Wöchentlich', month: 'Monatlich', year: 'Jährlich' };

const CAT = { fitness: ['Fitness', 'dumbbell'], health: ['Gesundheit', 'heart'], learning: ['Lernen', 'book'], digital: ['Digitales', 'phone'], creative: ['Kreativität', 'palette'], productive: ['Produktivität', 'target'], finance: ['Finanzen', 'wallet'], leisure: ['Freizeit', 'game'], personal: ['Persönliches', 'star'], sleep: ['Schlaf', 'moon'], outdoors: ['Draußen', 'sun'], other: ['Sonstiges', 'spark'] };

const PATH = { shield: '<path d="M12 2 20 6v6c0 5-3.5 8.4-8 10-4.5-1.6-8-5-8-10V6z"/>', scroll: '<path d="M6 3h12v15c0 4-5 4-5 1V6H4v13c0 3 3 3 5 3h7"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-8 16-8 16 0"/>', dumbbell: '<path d="M3 10v4m3-7v10M2 9h4m0 3h12M18 7v10m3-7v4m-3-2h4"/>', heart: '<path d="M20.8 8.1c0 5-8.8 11.2-8.8 11.2S3.2 13.1 3.2 8.1C3.2 3.9 9 2.5 12 6.7c3-4.2 8.8-2.8 8.8 1.4z"/>', book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1m0-15c3-2 6-2 9-1v15c-3-1-6-1-9 1V5z"/>', phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>', palette: '<path d="M12 2a10 10 0 1 0 0 20h2a2 2 0 0 0 2-2c0-1.5-1-2 0-3 1-1 2 0 3.5-1.5A9 9 0 0 0 12 2z"/><path d="M7 9h.01M12 6h.01M17 9h.01M7 14h.01"/>', target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 9V5a2 2 0 0 1 2-2h13m-1 10h4"/>', game: '<path d="M6 9h12a4 4 0 0 1 4 4l-1 5a3 3 0 0 1-5 2l-3-3h-2l-3 3a3 3 0 0 1-5-2l-1-5a4 4 0 0 1 4-4zM8 12v5m-2.5-2.5h5M16 13h.01M19 15h.01"/>', star: '<path d="m12 2 3.1 6.4 7 1-5 5 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5-5 7-1z"/>', moon: '<path d="M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11z"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>', spark: '<path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7z"/>', flame: '<path d="M12 22c5 0 8-4 8-9 0-3-2-6-5-8 .4 3-1 4-2 5-1-4-3-6-4-8 0 6-5 9-5 13 0 4 3 7 8 7z"/>', snow: '<path d="M12 2v20M4 7l16 10M20 7 4 17M9 5l3 3 3-3M9 19l3-3 3 3"/>', back: '<path d="m15 5-7 7 7 7"/>', plus: '<path d="M12 4v16M4 12h16"/>', dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>', home: '<path d="m3 10 9-7 9 7v10H4V10zM9 20v-7h6v7"/>', goals: '<path d="M6 3h12v18l-6-4-6 4V3zM9 8h6m-6 4h6"/>', chart: '<path d="M4 20V9m6 11V4m6 16v-8m5 8V6"/>', settings: '<path d="M4 6h16M4 12h16M4 18h16M8 4v4M16 10v4M10 16v4"/>', close: '<path d="M5 5l14 14M19 5 5 19"/>', check: '<path d="m4 12 5 5L20 6"/>', lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', arrow: '<path d="M12 20V4m-6 6 6-6 6 6"/>', edit: '<path d="M4 17 16 5l3 3L7 20H4v-3z"/>', chevron: '<path d="m7 10 5 5 5-5"/>', bag: '<path d="M4 8h16l-1 13H5L4 8zM9 9V6a3 3 0 0 1 6 0v3"/>' };

let db;

const S = { skills: [], activities: [], entries: [], overrides: [], meta: [], page: 'today', day: nowDay(), card: 0, packet: null, packetBusy: false, modal: null, editDay: null, editing: null, theme: 'system', colors: { save: '#168a70', level: '#9be948' }, timeout: 3, sound: true, checkTime: '21:00', calendarOpen: false, calView: 'week', calAnchor: nowDay(), selectedGoal: null, goalExpanded: null, statPeriod: 'month', statAnchor: nowDay(), statGoal: 'all', settingsDraft: null, wallet: null, started: null, busy: false, checkShown: false };

let EM = new Map(), timer = 0, gesture = null, wheelGesture = null, packageGesture = null, audioCtx = null, periodCache = new Map();

const dbPut = (name, value) => dbTx([name], t => t.objectStore(name).put(value));

const meta = (key, fallback) => S.meta.find(x => x.key === key)?.value ?? fallback;

S.statMetric = 'minutes';

S.statStack = false;

S.swipedGoal = null;

PATH.settings = '<path d="M10.6 2h2.8l.55 2.22 1.88.78 1.96-1.18 2 2-1.18 1.96.78 1.88L22 10.6v2.8l-2.22.55-.78 1.88 1.18 1.96-2 2-1.96-1.18-1.88.78L13.4 22h-2.8l-.55-2.22-1.88-.78-1.96 1.18-2-2 1.18-1.96-.78-1.88L2 13.4v-2.8l2.22-.55.78-1.88-1.18-1.96 2-2 1.96 1.18 1.88-.78z"/><circle cx="12" cy="12" r="3.2"/>';

const PROFILE_DEFAULT = { name: 'Mein Charakter', description: 'Jeden Tag ein Stück stärker.', color: '#67c65d', avatar: 'shield', image: '' };

const EMBER_SVG = `<svg class="ico ember-icon" viewBox="0 0 24 24" aria-label="Glut" fill="none"><path d="M4.8 10.8 9 5l8-1.7 3.2 6.2-2 8.1-7.6 3.7-6.3-4.1z" fill="#67392d" stroke="#914a30" stroke-width=".7"/><path d="m8.4 9.3 4.2-2 4.2 3.2-1 5.6-5.3 2.1-3.1-4z" fill="#f47f37"/><path d="m12.5 7.3-1.1 5 4.3 3.8m-4.3-3.8-4 1.2" stroke="#ffe9a0" stroke-width="1.7" stroke-linecap="round"/><circle cx="19.7" cy="4" r="1.1" fill="#ffbb5e"/></svg>`;

const profile = () => ({ ...PROFILE_DEFAULT, ...meta('characterProfile', {}) });

const skillById = id => S.skills.find(s => s.id === id);

const skillColor = s => hex(s?.color, profile().color);

const skillIcon = s => ico(PATH[s?.icon] ? s.icon : 'spark');

const isOnce = a => a?.questType === 'once';

const onceKey = a => `${a.id}|once`;

const MANA_CRYSTAL = '<svg class="mana-crystal" viewBox="0 0 44 56" role="img" aria-label="Mana-Kristall"><path d="M21 2 38 19 34 40 21 54 7 40 4 19Z" fill="#071b53" stroke="#7ccfff" stroke-width="1.5"/><path d="M21 2 21 54 4 19Z" fill="#357bd3"/><path d="M21 2 38 19 34 40 21 54Z" fill="#10418f"/><path d="M4 19 21 25 38 19 34 40 21 54 7 40Z" fill="none" stroke="#83d4ff" stroke-width="1.4"/><path d="M21 2V25L13 38 21 54" fill="none" stroke="#d1f4ff" stroke-width="1.5"/><path d="m4 19 17 6 17-6" stroke="#c4f3ff" fill="none" stroke-width="1.2"/></svg>';

const ICON_EXTRA = { person: '<circle cx="12" cy="6" r="3"/><path d="M6 22v-5q0-5 6-5t6 5v5M9 18h6"/>', mage: '<path d="m5 17 7-15 7 15zM5 17l-2 4h18l-2-4M12 8v5m-2-2h4"/>', knight: '<path d="M5 21V9l7-7 7 7v12M8 14h8m-6 7v-5h4v5M5 9h14"/>', robot: '<rect x="4" y="7" width="16" height="14" rx="3"/><path d="M12 7V3m-4 9h1m6 0h1M8 17h8M2 12h2m16 0h2"/>', cat: '<path d="M4 11 3 3l6 4h6l6-4-1 8q3 10-8 10T4 11Z"/><path d="M8 13h.01M16 13h.01m-6 4h4m-2-2v2"/>', wolf: '<path d="M3 3 9 8 12 6l3 2 6-5-1 12-8 7-8-7Z"/><path d="M8 13h.01m8 0h.01M10 17h4"/>', fox: '<path d="M3 5 9 9l3-2 3 2 6-4-2 11-7 6-7-6Z"/><path d="M8 14h.01m8 0h.01m-4 3 2-1-2-1-2 1z"/>', owl: '<path d="M3 4 8 7 12 5l4 2 5-3v12l-9 6-9-6Z"/><circle cx="8.5" cy="12.5" r="2"/><circle cx="15.5" cy="12.5" r="2"/><path d="m12 15-2 2h4z"/>', dragon: '<path d="M6 20 3 12l4-6 4 2 7-6 3 5-6 2 3 6-5 7-3-5Z"/><path d="m12 8-2 6 4 3M17 6h.01"/>', unicorn: '<path d="m11 3 3 6 5 2 1 10H5l2-8-3-4 5 1zM11 3l-2 7m7 4h.01"/>', phoenix: '<path d="M12 22C2 21 3 11 6 7c0 5 3 7 5 8-1-6 4-10 6-13-1 6 5 11 4 14-1 4-4 6-9 6Z"/><path d="M12 21c-4-4 2-7 1-11 5 4 4 8-1 11Z"/>', paw: '<path d="M7 13c-7 6 4 11 5 6 1 5 12 0 5-6-3-4-7-4-10 0z"/><circle cx="5" cy="8" r="1"/><circle cx="10" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="20" cy="8" r="1"/>' };

Object.assign(PATH, ICON_EXTRA);

S.questFilter = 'all';

S.cardExpanded = false;

S.cardDrafts = new Map();

PATH.save = '<path d="M4 3h14l3 3v15H3V3zM7 3v7h10V3M7 21v-8h10v8M9 5v3h6"/>';

const ICON_GROUPS = {
    'Alle': [],
    'Menschen': ['user', 'person', 'mage', 'knight', 'robot', 'wizard', 'archer', 'ranger', 'priest'],
    'Tiere': ['cat', 'wolf', 'fox', 'owl', 'paw', 'bear', 'rabbit', 'horse', 'bird'],
    'Fabelwesen': ['dragon', 'unicorn', 'phoenix', 'griffin', 'slime'],
    'Gegenstände': ['shield', 'scroll', 'book', 'phone', 'dumbbell', 'wallet', 'game', 'sword', 'potion', 'key', 'bag'],
    'Symbole': ['spark', 'star', 'moon', 'sun', 'heart', 'target', 'palette', 'flame', 'snow', 'plus']
};

Object.assign(PATH, {
    wizard: '<path d="M4 20h16M6 16l6-12 6 12M8 12q4 3 8 0M9 16q3 3 6 0M12 4l2-2"/><path d="M4 20q8 4 16 0"/>',
    archer: '<path d="M5 20q9-9 0-18M5 2l8 9-8 9m0-9h16m-4-3 4 3-4 3"/>',
    ranger: '<path d="m3 9 9-7 9 7-4 12H7zM6 10h12m-9 4h6m-4 4h2"/>',
    priest: '<path d="M12 2v20M7 7h10M5 19q7-5 14 0M3 22h18"/>',
    bear: '<path d="M5 8Q1 1 7 3l2 3q3-2 6 0l2-3q6-2 3 5 3 9-5 13H9Q2 17 5 8Z"/><path d="M8 12h.1m8 0h.1M10 16q2 3 4 0m-2-2v1"/>',
    rabbit: '<path d="M8 10Q2 1 6 2q4 0 5 8m3 0q0-9 5-8 4 1-3 9m-8 0q-4 3-3 8 7 7 14 0 1-5-3-8"/><path d="M9 15h.1m6 0h.1M12 17l1 1-1 1-1-1z"/>',
    horse: '<path d="m6 21 1-7-3-5 5-7 6 2 5 9-3 8H6ZM9 7l2 2m5 4h.1M7 15h10"/>',
    bird: '<path d="M3 15Q6 6 18 4q-4 6-2 8l5 1-5 3Q8 22 3 15Zm5-2 7-3M12 17l2 5"/>',
    griffin: '<path d="M3 17q5-6 8-8l1-7 4 5 5 1-5 5-1 8H9l-2-5m-4 1 5 4m6-11h.1"/>',
    slime: '<path d="M4 18q-3-5 3-11 5-7 10 0 6 6 3 11-2 5-8 4-6 1-8-4Z"/><path d="M8 14h.1m8 0h.1m-6 4q2 2 4 0"/>',
    sword: '<path d="m5 20 5-5 10-12 1 4-10 10-5 5M3 13l8 8m-4-8 4-4M4 20l-2 2"/>',
    potion: '<path d="M9 2h6m-5 0v7l-5 5q-3 7 7 8 10-1 7-8l-5-5V2m-7 14q5-4 10 0m-6-3h.1"/>',
    key: '<circle cx="7" cy="8" r="4"/><path d="M10 11l11 11m-6-6 3-3m-1 5 3-3"/>'
});

let pickerSelect = null;

S.moreOpen = false;

S.iconCategory = 'Alle';

PATH.rune = '<path d="M12 2 19 10 15 10 20 21 12 16 4 21 9 10 5 10Z"/><path d="M12 2v14M9 10h6"/><circle cx="12" cy="10" r="1.25"/>';

PATH.pixel = '<path d="M7 3h4v4H7zM13 3h4v4h-4zM3 9h4v4H3zM9 9h6v6H9zM17 9h4v4h-4zM3 15h4v4H3zM17 15h4v4h-4zM7 19h4v3H7zM13 19h4v3h-4z"/>';

PATH.chest = '<path d="M4 10h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M3 10V7a2 2 0 0 1 2-2h5v5H3m11-5h5a2 2 0 0 1 2 2v3h-7V5"/><path d="M12 5v16M4 14h16"/>';

const ICON_NAMES = { user: 'Person', person: 'Mensch', mage: 'Magier', knight: 'Ritter', robot: 'Roboter', wizard: 'Zauberer', archer: 'Bogenschütze', ranger: 'Waldläufer', priest: 'Priesterin', cat: 'Katze', wolf: 'Wolf', fox: 'Fuchs', owl: 'Eule', paw: 'Tierpfote', bear: 'Bär', rabbit: 'Hase', horse: 'Pferd', bird: 'Vogel', dragon: 'Drache', unicorn: 'Einhorn', phoenix: 'Phönix', griffin: 'Greif', slime: 'Schleimwesen', shield: 'Schild', scroll: 'Schriftrolle', book: 'Buch', phone: 'Handy', dumbbell: 'Hantel', wallet: 'Geldbörse', game: 'Spielcontroller', sword: 'Schwert', potion: 'Zaubertrank', key: 'Schlüssel', bag: 'Tasche', spark: 'Funke', star: 'Stern', moon: 'Mond', sun: 'Sonne', heart: 'Herz', target: 'Zielscheibe', palette: 'Farbpalette', flame: 'Flamme', snow: 'Schneeflocke', plus: 'Plus', rune: 'Zauberrune', pixel: 'Pixel-Emblem', home: 'Zuhause', goals: 'Quests', chart: 'Statistik', settings: 'Einstellungen', close: 'Schließen', check: 'Haken', edit: 'Bearbeiten', calendar: 'Kalender', dots: 'Menü', back: 'Zurück', lock: 'Schloss', arrow: 'Pfeil', chevron: 'Aufklappen', save: 'Speichern' };

const ICON_DETAILS = {
    person: '<path d="M9 6q3-3 6 0M7 19l2-2m8 2-2-2"/>', user: '<path d="M9 9q3 2 6 0M9 17h6"/>', mage: '<path d="M8 17l2 2m4-10h2m-8 4h7m-5-8 2 3"/>', knight: '<path d="M8 10h8M10 7l2-2 2 2M8 19h2m4 0h2"/>', robot: '<circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M9 17l2 1 2-1M12 4h.01"/>', wizard: '<path d="M7 17h10m-8 2 2 1m1-11h.01M17 4l1-2"/>', archer: '<path d="M7 4l3-2M7 19l3 2M15 9l3-2M15 13l3 2"/>', ranger: '<path d="M9 7h6M7 17l2 2m8-2-2 2M10 11h4"/>', priest: '<path d="M8 4l4-2 4 2m-8 13 4-3 4 3"/>',
    cat: '<path d="M5 10l3 1m11-1-3 1M3 16l5-1m13 1-5-1M3 19l5-2m13 2-5-2M7 6l2 3m8-3-2 3"/>', wolf: '<path d="m6 6 2 4m10-4-2 4M5 16l5-1m9 1-5-1M11 20l1-1 1 1"/>', fox: '<path d="M5 9l3 3m11-3-3 3M6 17l4-2m8 2-4-2M9 20l3-1 3 1"/>', owl: '<path d="M6 7q2-3 5 0m2 0q3-3 5 0M6 17l4 2m8-2-4 2"/>', paw: '<path d="M8 16q4-3 8 0M10 20h4"/>', bear: '<path d="M5 8l4 2m10-2-4 2M8 19l3 1m5-1-3 1"/>', rabbit: '<path d="M8 5l1 4m7-4-1 4M6 19l3 2m9-2-3 2"/>', horse: '<path d="M7 8l3-4m0 9 2 1M8 18l5 1M14 6l3 4"/>', bird: '<path d="M5 15q6-4 11-5M8 17l3 1m2 0 4-2"/>',
    dragon: '<path d="M6 13l4 1m-3 3 3 2m5-15 2 2M12 12l3 2"/>', unicorn: '<path d="M7 16l4 1M15 11l3 3M7 19l6 1"/>', phoenix: '<path d="M7 10l2 3M17 8l-2 5m-6 5 3 2 3-2"/>', griffin: '<path d="M8 8l3-3M5 15l3 2m9-7 3 2M11 15l3 2"/>', slime: '<path d="M6 11q5-4 10 0m-9 7q2 3 4 3m7-4-2 4"/>',
    shield: '<path d="M12 5v13M8 8l4-2 4 2M8 14l4 3 4-3"/>', scroll: '<path d="M8 9h6m-6 4h6m-6 4h4"/>', book: '<path d="M6 8l3-.5M6 12h3m6-4 3-.5M15 12h3"/>', phone: '<path d="M9 5h6M9 15h6M9 8h6M9 11h4"/>', dumbbell: '<path d="M9 9v6m6-6v6M4 8v8m16-8v8"/>', wallet: '<path d="M7 6h9M6 16h5M15 14h.01"/>', game: '<path d="M5 9l2-3h10l2 3m-8 8h2"/>', sword: '<path d="M14 5l5 2M5 19l2 2m5-9 5-5"/>', potion: '<path d="M8 18q4-2 8 0M10 8h4M13 14l2 2m-7 1 1-1"/>', key: '<path d="M6 6h2M4 10l2 2m7 4 2-2"/>', bag: '<path d="M7 13h10M8 17h8m-3-9 2-2"/>',
    spark: '<path d="m5 4 1 2M19 4l-1 2M5 20l1-2M19 20l-1-2"/>', star: '<path d="m12 7-1 3 3 2m-2 5 3-1"/>', moon: '<path d="M14 5l1 2m-2 11h2M5 10h1"/>', sun: '<circle cx="12" cy="12" r="1.4"/>', heart: '<path d="M6 9q1-3 4-2m4 9 2-2"/>', target: '<path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>', palette: '<path d="M9 5l1 1m7 9 2-1"/>', flame: '<path d="M11 19q-3-4 2-8 0 3 2 4"/>', snow: '<path d="m5 12 3 1m11-1-3 1"/>'
};

Object.entries(ICON_DETAILS).forEach(([key, extra]) => { if (PATH[key])
    PATH[key] += extra; });

const CAT_DRAWING = `<svg class="cat-2d" viewBox="0 0 240 212" role="img" aria-label="Überraschte, schwarze, langhaarige Katze">
 <g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M28 35l6-7m-3 16-10-2M212 32l-6-7m3 17 10-2M121 4v10" opacity=".4"/></g>
 <!-- Flat silhouette: layered tufted fur, fluffy cheeks and long tail. -->
 <path d="M165 154q36-18 55 8 11 24-10 36-16 9-28-2 19 4 23-12 3-17-24-15Z" fill="#0c0c0f"/>
 <path d="M50 146 40 120l-13 5 15-22-9-11 18-4L40 31l31 18q24-13 48-11l49 10 34-19-9 57 17 6-10 11 13 15-16 4-8 26 13 20-19-2-1 21-27-9-18 19-14-13-18 11-12-10-24 13-7-21-20 4 10-25-19 1Z" fill="#0b0b0d" stroke="#202027" stroke-width="2" stroke-linejoin="round"/>
 <path d="M48 85 49 43l22 18-8 12m108-12 23-18-3 43-13-15" fill="#202026"/>
 <path d="M51 84l12-8-8 23 15-6-9 19M187 84l-12-8 8 23-15-6 9 19" fill="none" stroke="#303038" stroke-width="2.5" stroke-linecap="round"/>
 <path d="M54 133q-9 17-4 28m138-28q8 16 3 29M73 165l-9 14m29-5-5 11m58-11 7 11m29-19 8 14" fill="none" stroke="#35353e" stroke-width="2.1" stroke-linecap="round"/>
 <path d="M68 119Q77 98 96 101q17 3 14 23-2 17-21 18-22 1-21-23M132 124q-3-20 14-23 19-3 28 18 1 24-21 23-19-1-21-18" fill="#fff8d6" stroke="#0d0d0f" stroke-width="2.4"/>
 <circle class="cat-pupil" cx="91" cy="121" r="8.3" fill="#17151a"/><circle class="cat-pupil" cx="150" cy="121" r="8.3" fill="#17151a"/>
 <circle cx="88" cy="117" r="3.4" fill="white"/><circle cx="147" cy="117" r="3.4" fill="white"/>
 <path d="M72 102l-6-8M82 100l-3-9M168 101l7-8m-17 7 3-9" stroke="#131316" stroke-width="3.2" stroke-linecap="round"/>
 <path d="m114 144 6 4 7-4z" fill="#c88a9d"/>
 <path class="cat-mouth" d="M120 150q-7 5-1 11 6 4 8-3 1-5-7-8Z" fill="#fff0f1" stroke="#242126" stroke-width="1.7"/>
 <path d="M76 148 46 145m32 8-31 5m116-10 31-3m-31 8 31 5" fill="none" stroke="#55535c" stroke-width="1.7" stroke-linecap="round"/>
 <path d="M89 184q10-9 21-5l9 8 10-8q12-4 22 5l-6 14q-12 5-25-4-13 9-25 4Z" fill="#151519" stroke="#3b3941" stroke-width="2"/>
 <path d="M99 191v5m9-5v4m25-4v4m10-4v5" stroke="#4e4a51" stroke-width="1.4" stroke-linecap="round"/>
 </svg>`;

const CAT_HEADLINES = ['WOW! Noch dein ganzes Mana?!', 'Ich trau meinen Augen nicht!', 'Ein magischer Null-Verbrauch?!', 'Sag bloß, du hast Mana gespart!', 'Kein einziger Mana-Kristall weg?!', 'Na sowas! Alles noch da?'];

const CAT_SUBLINES = ['Hast du gestern wirklich nichts verbraucht?', 'Ist die Anzeige korrekt oder ist dir eine Buchung durchgerutscht?', 'War gestern tatsächlich ein kompletter Mana-Spar-Tag?', 'Bevor ich feiere: Stimmt dein Eintrag für gestern?'];

const CAT_CHOICES = [
    ['Yes! ✨', 'Stimmt genau!', 'Alles noch da!', 'Jap, null verbraucht!', 'So sieht’s aus!'],
    ['Ups, ganz vergessen …', 'Ich trag’s schnell nach', 'Moment, da fehlt was!', 'Ich korrigiere das', 'Erwischt, ich hab’s vergessen'],
    ['Keine Ahnung. 🤷', 'Weiß ich leider nicht', 'Puh, keine Erinnerung', 'Menge unbekannt lassen', 'Kann ich nicht sagen']
];

let goalSwipe = null;

let suppressClickUntil = 0;
