/* Leveln 0.11 – ausschließlich Präsentation: Einleitung & Charakter-Inventar.
 * Bestands-Datenformat 5 bleibt unverändert; Meta speichert nur das Tutorial-Flag. */
'use strict';
const LV11_INTRO=[
 {title:'Willkommen bei Leveln!',text:'Jeden Tag wächst dein Charakter mit deinen Entscheidungen. Deine Geschichte beginnt hier.',icon:'user'},
 {title:'Deine Skills',text:'Jede Quest trainiert einen oder mehrere Skills. 100 XP bedeuten eine neue Skill-Stufe; dein Charakter steigt alle 1.000 XP auf.',icon:'leveln'},
 {title:'Leveln und Zaubern',text:'Leveln belohnt Training sofort mit XP. Zaubern verbraucht Mana; ungenutztes Mana wird nach Ende der Questperiode zu XP.',icon:'mana'},
 {title:'Deine Questkarten',text:'Nach oben wischen: Menge buchen. Seitlich wischen: nächste Karte. Kurz nach unten: Stapel wechseln. Nach unten ziehen und halten: Karten sortieren.',icon:'scroll'},
 {title:'Streaks und Glut',text:'Bleib dran und erhalte für jeweils zehn erfolgreiche Streak-Schritte eine Glut. Im Charaktermenü kannst du damit Freezes kaufen.',icon:'ember'}
];
function lv11IntroOpen(){S.introIndex=0;S.modal={type:'intro'};renderModal();}
async function lv11IntroFinish(){await saveMeta('introCompleted',true);S.modal=null;renderModal();}
function lv11IntroModal(){
 const i=Math.max(0,Math.min(LV11_INTRO.length-1,S.introIndex||0)),v=LV11_INTRO[i];
 sheet('Dein Abenteuer beginnt',`<div class="lv11-intro" role="group" aria-label="Einleitung ${i+1} von ${LV11_INTRO.length}">
 <div class="lv11-intro-icon">${ico(v.icon)}</div><small class="eyebrow">KAPITEL ${i+1} / ${LV11_INTRO.length}</small>
 <h3>${safe(v.title)}</h3><p>${safe(v.text)}</p>
 <div class="lv11-intro-dots">${LV11_INTRO.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('')}</div>
 <div class="lv11-intro-actions"><button type="button" data-act="intro-skip" class="thin-button">Überspringen</button>
 ${i>0?'<button type="button" data-act="intro-back" class="thin-button">Zurück</button>':''}
 <button type="button" data-act="intro-next" class="primary">${i===LV11_INTRO.length-1?'Los geht’s':'Weiter'}</button></div></div>`,true);
}
function lv11FreezeShop(){
 const w=S.wallet||{glut:0,inventory:0};
 sheet('Streak-Freeze-Shop',`<div class="lv11-freeze-shop"><div class="lv11-inventory">
 <div class="lv11-resource"><span>${ico('ember')}</span><strong>${num(w.glut,0)}</strong><small>Glut</small></div>
 <div class="lv11-resource"><span>${ico('snow')}</span><strong>${num(w.inventory,0)} / 2</strong><small>Freezes</small></div></div>
 <p>Ein Streak-Freeze schützt eine bestehende Serie vor einem Fehlschlag. Maximal zwei Freezes im Inventar.</p>
 <button class="primary" data-act="buy" ${w.glut<5||w.inventory>=2?'disabled':''}>${ico('snow')} Einen Freeze kaufen · 5 Glut</button>
 <button class="thin-button" data-act="modal-close">Zurück zum Charakter</button></div>`);
}
