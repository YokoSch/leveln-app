/* Leveln 0.11 – ausschließlich Präsentation: Einleitung & Charakter-Inventar.
 * Bestands-Datenformat 5 bleibt unverändert; Meta speichert nur das Tutorial-Flag. */
'use strict';
const LV11_INTRO=[
 {title:'Du bist kein Quest-Versager!',text:'In Leveln wird nicht bestraft, was du nicht geschafft hast. Stattdessen feiern wir das, was dir gelingt. Auch fünf Minuten zählen. Die Katze urteilt nicht – sie schnurrt.',icon:'heart'},
 {title:'Leveln: echte Fortschritte',text:'Du liest zehn Minuten oder trainierst eine halbe Stunde? Super! Trage ein, was du wirklich geschafft hast. Dein Charakter erhält dafür Skill-XP. Keine Strafpunkte für Pausentage.',icon:'leveln'},
 {title:'Zaubern: Spaß kostet Mana',text:'Netflix, Zocken oder Naschen sind keine bösen Zauber! Ein guter Zauberer genießt sie – und lernt, sein Mana bewusst einzusetzen. Nicht verbrauchtes Mana kann zu XP werden. Dein Abenteuer beginnt mit deiner eigenen Quest.',icon:'mana'}
];
function lv11IntroOpen(){S.introIndex=0;S.modal={type:'intro'};renderModal();}
async function lv11IntroFinish(){await saveMeta('introCompleted',true);await saveMeta('intro114Stage',null);S.tutorialStage=null;S.modal=null;renderModal();}
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
 const activities=S.activities.filter(a=>!isOnce(a)&&!a.archivedAt&&!a.removedAt);
 const id=activities.some(a=>a.id===S.shopQuestId)?S.shopQuestId:activities[0]?.id;
 S.shopQuestId=id;
 const q=id?lv114WalletView(id):{glut:0,inventory:0};
 sheet('Questgebundener Freeze-Shop',`<div class="lv11-freeze-shop">
 <p>Jede Quest besitzt eigene Glut und eigene Freezes. Wähle die Quest für deinen Kauf aus.</p>
 <label>Quest<select id="lv114-shop-select" ${activities.length?'':'disabled'}>${activities.map(a=>`<option value="${safe(a.id)}" ${a.id===id?'selected':''}>${safe(a.name)}</option>`).join('')}</select></label>
 <div class="lv11-inventory">
 <div class="lv11-resource"><span>${ico('ember')}</span><strong>${num(q.glut,0)}</strong><small>Glut</small></div>
 <div class="lv11-resource"><span>${ico('snow')}</span><strong>${num(q.inventory,0)} / 2</strong><small>Freezes</small></div></div>
 <p>1 Glut je 10 erfolgreiche Streak-Schritte. 5 Glut für einen Freeze, maximal zwei pro Quest.</p>
 <button class="primary" data-act="buy" ${q.glut<5||q.inventory>=2?'disabled':''}>${ico('snow')} Freeze für diese Quest kaufen · 5 Glut</button>
 <button class="thin-button" data-act="modal-close">Zurück zum Charakter</button></div>`);
}
