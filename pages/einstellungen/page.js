/*
 * LEVELN 0.10 · pages/einstellungen/page.js
 * Gemeinsam genutzte Funktionen bzw. Seitenansicht; absichtlich global gebunden.
 * Modul ohne Build-Tool: klassische Scripts teilen den globalen Lexikalraum.
 * Lade-Reihenfolge: scripts.json. Bestehende Funktionen wurden unveraendert umgezogen.
 */
'use strict';

function settingsView(){
  const original=settingsView05();
  let html=original.replace('<h1>Optionen</h1>','<h1>Einstellungen</h1>');
  html=html.replace('<option value="dark"','<option value="mono" '+(S.theme==='mono'?'selected':'')+'>Minimalistisch · Retro</option><option value="dark"');
  html=html.replace(/<label>Paket-Timeout[\s\S]*?<\/label>/,'');
  html=html.replace(/<section class="settings-panel"><h3>Streaks & Glut<\/h3>[\s\S]*?<\/section>/,'');
  // Freezes and Glut are now part of the character's inventory.
  html=html.replaceAll(ico('flame'),ico('ember'));
  return html+`<section class="settings-panel lv114-handbook-section">
   <h3>Leveln-Handbuch</h3>
   <p class="muted">Was hinter Leveln steckt, wie du deine Quests spielst und was alle Werte bedeuten. Du kannst dieses Handbuch jederzeit öffnen.</p>
   <details class="lv114-handbook" id="levelnHandbook">
     <summary>${ico('book')} Vollständiges Handbuch öffnen</summary>
     <div class="lv114-doc-content">
       <h4>1. Die Idee: Belohnen statt bestrafen</h4>
       <p>Leveln ist kein Richter über deinen Alltag. Du sammelst Erfahrung für Fortschritte, nicht Strafpunkte für etwas, das du nicht geschafft hast. Manchmal ist ein guter Tag eine Stunde Training; manchmal sind es zehn Minuten Lesen. Beides darf zählen.</p>
       <p>Wir unterscheiden bewusst zwischen <b>Leveln</b> und <b>Zaubern</b>. Leveln sind Tätigkeiten, in die du investieren möchtest: Lernen, Sport, Kreativität. Zaubern sind angenehme Dinge wie Serien, Spiele oder Süßigkeiten. Sie sind nicht böse. Wie ein guter Zauberer nutzt du sie bewusst, weil dein Mana endlich ist. Maßvoller Genuss ist ein Erfolg, kein Verzicht auf Freude.</p>
       <h4>2. Beispiel: Zwei Quests anlegen</h4>
       <p><b>Quest A – „Jeden Tag lesen“:</b> Wähle Leveln, Ziel „20 Minuten täglich“, einen passenden Skill (z. B. Wissen) und einen XP-Wert pro Stunde. Liest du heute 10 Minuten, spielst du 10 Minuten aus und erhältst die entsprechenden XP sofort. Erreichst du 20 Minuten, gilt der Tag für die Streak als erfolgreich.</p>
       <p><b>Quest B – „Serienabend“:</b> Wähle Zaubern, z. B. ein Tagesbudget von 60 Minuten. Wenn du eine Folge für 25 Minuten ansiehst, buchst du 25 Minuten Mana-Verbrauch. Die restlichen 35 Minuten bleiben als potenziell eingespartes Mana übrig. Die XP dafür entstehen erst nach dem abgeschlossenen Bewertungszeitraum und bestätigten Werten.</p>
       <h4>3. Karten ausspielen</h4>
       <p>Auf der Startseite zeigt die oberste Karte deine aktuelle Quest. Stelle mit <b>− und +</b> die Zeit bzw. Anzahl ein. <b>Nach oben wischen</b> bucht genau diese Menge. Du darfst dieselbe Karte mehrfach ausspielen – etwa zuerst zehn und später weitere fünf Minuten.</p>
       <p><b>Seitlich wischen</b> blättert durch die Karten. <b>Kurz nach unten wischen</b> wechselt zwischen Leveln und Zaubern. <b>Nach unten ziehen und zwei Sekunden halten</b> öffnet die Kartenverwaltung. Dort kannst du Karten sortieren und ein- oder ausblenden.</p>
       <h4>4. Fortschrittsbalken und XP</h4>
       <p>Der Balken zeigt deine bisherige Menge im Verhältnis zum Ziel bzw. das noch verfügbare Mana. <b>Leveln-XP</b> werden bei tatsächlichen Buchungen berechnet; das Erreichen des gesamten Ziels ist dafür nicht notwendig. <b>Zaubern-XP</b> ergeben sich aus tatsächlich eingespartem Mana am Ende des Zeitraums. 100 Skill-XP entsprechen einer Skillstufe, 1.000 Charakter-XP einem Charakterlevel.</p>
       <h4>5. Streak, Glut und Freezes</h4>
       <p>Eine Streak zählt aufeinanderfolgende erfolgreiche Bewertungszeiträume. Bei <b>zehn erfolgreichen Streak-Schritten</b> erhält genau diese Quest eine Glut. <b>Fünf Glut</b> kaufen einen Freeze für dieselbe Quest, maximal <b>zwei Freezes</b> im Inventar. Die Bestände findest du ausschließlich im <b>Charaktermenü → Quest-Shop</b>. Ein gekaufter Freeze kann einen einzelnen Fehlzeitraum schützen.</p>
       <p>Wenn du krank oder verhindert bist, kannst du über einen <b>Wisch nach rechts</b> auf der Questzeile einen <b>kostenlosen Dauer-Freeze</b> aktivieren. Die Streak bleibt auf ihrem Stand, wächst aber nicht; während der Pause gibt es weder XP noch Glut. Im Kalender erscheint eine Schneeflocke.</p>
       <h4>6. Questzeilen, Archiv und Löschen</h4>
       <p>Im Questmenü <b>nach links</b> über eine Questzeile wischen: <b>Bearb.</b>, <b>Archiv</b> und <b>Löschen</b> erscheinen hinter der Zeile. <b>Nach rechts</b> wischen öffnet den Dauer-Freeze. Das Archiv ist in „Alle“ zunächst eingeklappt. Archivierte Quests behalten ihre Geschichte und lassen sich wiederherstellen; Datenlücken kannst du beim De-Archivieren einmalig nachtragen.</p>
       <p>Bei <b>Löschen</b> hast du zwei Möglichkeiten: Nur die Quest entfernen, während die bisherigen Erfolge und XP unter <b>„Vergangenes“</b> in der Statistik erhalten bleiben; oder alles endgültig löschen – inklusive der zugehörigen Buchungen, XP und Questressourcen. Diese Entscheidung lässt sich nicht rückgängig machen.</p>
       <h4>7. Vergangene Erfolge nachtragen</h4>
       <p>Ganz unten im Questformular findest du <b>„Bisherige Erfolge“</b>. Dort kannst du Zeiträume vor der ursprünglichen Erstellung angeben und für alle Tage eines Zeitraums dieselben Minuten und Anzahlen eintragen. Diese Leistungen zählen als echte Buchungen und geben normale XP. Die historische Glut wird bei der erstmaligen Questerstellung nur einmalig vergeben; spätere Änderungen erzeugen keine neue rückwirkende Glut.</p>
       <h4>8. Kalender, Korrekturen und Statistiken</h4>
       <p>Der Kalender zeigt Erfolge mit Flammen, geschützte Tage mit Schneeflocken und mehrtägige Bewertungszeiträume mit Rahmen. Ein gestrichelter Rahmen kennzeichnet einen noch offenen Zeitraum. Im Questmenü unter <b>Mehr → Heute korrigieren / Gestern korrigieren</b> kannst du Buchungen kontrollieren und bearbeiten. Statistiken zeigen den Verlauf deiner Tätigkeiten und Skills; entfernte Quests mit erhaltenen Daten erscheinen gesammelt unter „Vergangenes“.</p>
       <h4>9. Backups und deine Daten</h4>
       <p>Leveln speichert deine Daten lokal auf deinem Gerät. Exportiere deshalb in den Einstellungen regelmäßig ein <b>JSON-Backup</b>, vor allem vor Updates. Ein Backup enthält die Quest- und Skilldaten, Tagesbuchungen und gespeicherten Ressourcen. Diese Datei ist <b>nicht verschlüsselt</b> – bewahre sie entsprechend sicher auf. Die installierte App nicht einfach löschen, bevor du eine funktionierende Sicherung hast.</p>
       <p class="lv114-doc-note">Die App arbeitet bewusst mit deinen Angaben: Sie kontrolliert nicht, ob eine Leistung wirklich stattgefunden hat. Du entscheidest selbst, was für dich ein Fortschritt ist.</p>
     </div>
   </details>
  </section>`;
}
