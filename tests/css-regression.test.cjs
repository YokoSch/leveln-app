const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const css=['src/styles/v010-base.css','pages/heute/deck.css','pages/heute/stepper.css','pages/heute/flammen.css','pages/quests/formular.css','pages/kartenverwaltung/manager.css','pages/statistik/stats.css','src/styles/v010-finish.css'];
const normalized=css.map(f=>fs.readFileSync(f,'utf8')).join('').replace('\n/* Layoutneutrale HTML-Slots: der sticky Kalender bleibt relativ zum bisherigen Scrollcontainer. */\n.leveln-page-slot{display:contents}\n','').replaceAll('../../assets/flame-tiling.svg','./assets/flame-tiling.svg');
const hash=crypto.createHash('sha256').update(normalized).digest('hex');
assert.equal(hash,fs.readFileSync('tests/legacy-css-sha256.txt','utf8').trim(),'Die v0.10-Stylingregeln dürfen bei der Modularisierung nicht unbemerkt geändert werden.');
console.log('OK: v0.10 CSS entspricht exakt dem Original (modulo URL und layoutneutralem Seitenslot)');
