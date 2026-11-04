/* Leveln 0.11.4 – optional interactive introduction.
 * No fake activities, bookings or XP: all progress is user-initiated.
 * The old 2D cat illustration is reused unchanged; the new SVG mascot is deferred.
 */
'use strict';
const LV114_TUTORIAL_STAGES=['quest','play','correct'];
function lv114TutorialNote(text,action='',label=''){
 return `<aside class="lv114-tutorial-note" role="status"><div class="lv114-tutorial-cat">${CAT_DRAWING}</div>
 <div class="lv114-tutorial-copy"><b>Deine Katze erklärt</b><span>${safe(text)}</span>
 ${action?`<button type="button" data-act="${safe(action)}">${safe(label)}</button>`:''}
 <button type="button" data-act="tutorial-stop" class="lv114-tutorial-exit">Einführung beenden</button></div></aside>`;
}
function lv114TutorialRender(){
 let root=$('#tutorialCoach');if(!root)return;
 const stage=S.tutorialStage;
 root.innerHTML='';
 if(!LV114_TUTORIAL_STAGES.includes(stage))return;
 let msg,act,label;
 if(stage==='quest'){
   msg='Erfinde deine erste echte Quest! Zum Beispiel: „10 Minuten Lesen“. Trage mindestens eine Zielmenge und einen Skill mit XP ein. Gespeichert wird nur, was du selbst bestätigst.';
   act='tutorial-create';label='Neue Quest öffnen';
 }else if(stage==='play'){
   msg='Hier liegt deine eigene Questkarte! Die Menge kannst du mit + und − ändern. Wische dann die Karte nach OBEN und sammle deine ersten echten XP.';
   act='tutorial-show-card';label='Meine Karte anzeigen';
 }else{
   msg='Glückwunsch! Du kannst jeden Eintrag prüfen. Öffne jetzt das Tagesprotokoll und sieh dir deine Buchung an. Korrigieren ist ausdrücklich erlaubt!';
   act='tutorial-correct';label='Eintrag korrigieren';
 }
 const note=lv114TutorialNote(msg,act,label);
 const sheetEl=$('#modalRoot .sheet');
 if(sheetEl&&(stage==='quest'&&S.modal?.type==='edit-goal'||stage==='correct'&&S.modal?.type==='edit-day')){
   sheetEl.insertAdjacentHTML('afterbegin',note);
   if(stage==='correct')sheetEl.querySelector('.lv114-tutorial-note .lv114-tutorial-copy')?.insertAdjacentHTML('beforeend','<button type="button" data-act="tutorial-finish" class="lv114-tutorial-complete">Alles verstanden · Einführung abschließen</button>');
 }else root.innerHTML=note;
}
async function lv114TutorialStage(stage,id){
 S.tutorialStage=stage;S.tutorialQuestId=id||S.tutorialQuestId||null;
 await saveMeta('intro114Stage',stage);
 if(id)await saveMeta('intro114QuestId',id);
}
async function lv114TutorialBegin(){
 await lv114TutorialStage('quest');
 S.page='goals';S.modal={type:'edit-goal'};render();
}
async function lv114TutorialAfterGoal(a){
 if(S.tutorialStage!=='quest')return false;
 await lv114TutorialStage('play',a.id);
 S.modal=null;S.page='today';S.day=nowDay();S.deckKind=a.kind;
 const target=lv10DeckGoals().findIndex(g=>g.a.id===a.id);S.card=Math.max(0,target);
 render();toast('Erste Quest bereit! Jetzt nach oben ausspielen.');return true;
}
async function lv114TutorialAfterPlay(g){
 if(S.tutorialStage==='play'&&g.a.id===S.tutorialQuestId){
   await lv114TutorialStage('correct');
 }
}
async function lv114TutorialFinish(){
 await saveMeta('introCompleted',true);
 await saveMeta('intro114Stage',null);
 S.tutorialStage=null;S.modal=null;render();toast('Abenteuer gestartet! ✨');
}
async function lv114TutorialStop(){
 await lv114TutorialFinish();
}
async function lv114TutorialAction(act){
 if(act==='tutorial-stop'){await lv114TutorialStop();return;}
 if(act==='tutorial-finish'){await lv114TutorialFinish();return;}
 if(act==='tutorial-create'){
   S.page='goals';S.modal={type:'edit-goal'};render();return;
 }
 if(act==='tutorial-show-card'){
   S.modal=null;S.page='today';S.day=nowDay();
   const a=S.activities.find(a=>a.id===S.tutorialQuestId);
   if(a){S.deckKind=a.kind;S.card=Math.max(0,lv10DeckGoals().findIndex(g=>g.a.id===a.id));}
   render();return;
 }
 if(act==='tutorial-correct'){
   const a=S.activities.find(a=>a.id===S.tutorialQuestId);
   const g=allGoals().find(g=>g.a.id===a?.id);
   if(!g){toast('Die ursprüngliche Quest wurde entfernt.');return;}
   S.page='goals';S.selectedGoal=g.key;S.modal={type:'edit-day',day:nowDay(),onlyKey:g.key};render();return;
 }
}
function lv114TutorialResume(){
 S.tutorialStage=meta('intro114Stage',null);
 S.tutorialQuestId=meta('intro114QuestId',null);
 if(S.tutorialStage==='quest'&&!S.modal){S.page='goals';S.modal={type:'edit-goal'};}
 if(S.tutorialStage==='play'){
   const a=S.activities.find(a=>a.id===S.tutorialQuestId);
   if(a){S.page='today';S.deckKind=a.kind;S.card=Math.max(0,lv10DeckGoals().findIndex(g=>g.a.id===a.id));}
 }
 if(S.tutorialStage==='correct')S.page='goals';
}
