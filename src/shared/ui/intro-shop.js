/* Leveln 0.11.4 – Erststart-Hinweis & questgebundener Freeze-Shop.
 * Bestands-Datenformat 5 bleibt unverändert; Metadaten bleiben abwärtskompatibel. */
'use strict';
/** Ein einmaliger, nicht-interaktiver Hinweis beim ALLERERSTEN Start.
 * Die Dokumentation ist dauerhaft über Einstellungen erreichbar. */
function lv114HandbookHint(){
  sheet('Willkommen bei Leveln!',`<div class="lv114-first-hint">
   <p><b>Hier wirst du für Fortschritte belohnt, nicht für Pausen bestraft.</b> Leveln sammelt XP für das, was du geschafft hast. Zaubern hilft dir, Genuss bewusst einzuteilen – ohne schlechtes Gewissen.</p>
   <p>Die ausführliche Erklärung mit Beispielen findest du jederzeit in <b>Einstellungen → Leveln-Handbuch</b>.</p>
   <button class="primary" data-act="handbook-open">Handbuch jetzt ansehen</button>
   <button class="thin-button" data-act="handbook-dismiss">Später selbst entdecken</button>
  </div>`);
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
