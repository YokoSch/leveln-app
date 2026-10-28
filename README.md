# Leveln 0.6 — Charakter-RPG

**Stand: 29. Oktober 2026.** Offline-fähige iPhone-Web-App für GitHub Pages. Die persönlichen Daten bleiben lokal auf dem iPhone in IndexedDB. Die bestehenden drei `lvl+`-Icons wurden beibehalten.

## Unbedingt vor dem Update

1. **In Leveln 0.5 erst ein JSON-Backup erstellen**, in der iPhone-Dateien-App sicher aufbewahren (nicht auf GitHub hochladen).
2. Die aktuelle Home-Bildschirm-App **nicht löschen**. Die Installation kann einen eigenen Datenspeicher besitzen.
3. Die ZIP entpacken und **ihren Inhalt** im **gleichen GitHub-Pages-Repository und demselben Unterverzeichnis** wie zuvor hochladen. Dabei `index.html`, `app.js`, `styles.css` und `sw.js` ersetzen; Manifest-Dateien und `icons` behalten/aktualisieren.
4. Die bislang genutzte URL öffnen; nach dem Laden die App schließen und wieder öffnen. Der Service-Worker-Cache ist auf `progress-pwa-v0.6-20261029-1` angehoben.
5. Die übernommenen Quests, Tageswerte, XP, Streaks und Freezes zunächst kontrollieren. Das alte Backup sicher aufbewahren, bis du die neue Version getestet hast.

## RPG-System

### Charakter
- Vier Hauptseiten: **Heute · Quests · Charakter · Statistik**. Das **Zahnrad** führt von allen Seiten zu **Einstellungen**.
- Charakter: Name, Beschreibung, Themenfarbe, eines von acht Standard-Emblemen oder eigenes lokales Bild.
- Gesamtcharakter: **1.000 XP pro Level**, beginnt bei lvl. 1.
- Jeder Skill: **100 XP pro Stufe**, beginnt bei **St. 1**.
- Dieselben verdienten Quest-XP zählen für die Skills und den Charakter **nicht doppelt**.

### Quests
- Eine wiederkehrende Quest kann **beliebig viele Skills** trainieren. Für jeden Skill lässt sich separat festlegen, wie viele XP eine Stunde bzw. eine Anzahl erzeugt.
- Die **Summe der Skillbelohnungen ist die gesamte Questbelohnung**. Ohne aktive Skillzuordnung entstehen künftig keine XP.
- Ein Skill kann von mehreren Quests trainiert werden. Beim Anlegen einer Quest kannst du bestehende Skills auswählen oder per `Neuen Skill erstellen` einen Skill hinzufügen.
- Wiederkehrende Quests behalten Zeit-/Anzahlbudgets, tägliche Karten, Kalender-/Neustart-Zeiträume, Streaks, Glut und Freezes.
- **Einmalige Quests** besitzen Anfangs- und Enddatum und frei festgelegte XP je Skill. Ein Abschluss zahlt **einmalig** XP, die Quest bleibt anschließend als abgeschlossen in der Historie. Keine Streaks oder Freezes für einmalige Quests. Optional lassen sie sich in der Tageskartenansicht anheften.
- Archivierte Quests bleiben in der Historie. Im Questboard gibt es für wiederkehrende Quests weiterhin die Links-Wisch-Aktion **Archivieren**.

### Skill entfernen
Beim Entfernen eines Skills wählst du **einmalig**: historische XP auf einen anderen Skill übertragen oder nur im Charakterlevel behalten. Für spätere Questbelohnungen wird der entfernte Anteil gelöscht; keine automatische Neuzuweisung an den Charakter. **Aus Konsistenzgründen greifen Änderungen an wiederkehrenden Tagesquests ab dem nächsten Kalendertag**, damit heute bereits verbuchte Tages-XP nicht nachträglich verschwinden. Einmalige noch offene Questbelohnungen werden sofort angepasst. Diese Entscheidung ist innerhalb der App endgültig. Ein älteres Backup kann prinzipiell einen älteren Datenstand wiederherstellen.

### Check-in
Nur offene **gestrige** wiederkehrende Quests werden ab der eingestellten Check-in-Uhrzeit angemahnt. Es gibt genau drei Optionen: **Jetzt nachtragen** (Protokoll), **Später** (unverändert, das Kartendeck bleibt verwendbar) und **Verzichten** (Ersatzwerte für gestern). Nach Ablauf des Folgetags werden noch offene Tage automatisch konservativ geschlossen, wenn Leveln wieder gestartet wird. Externe echte Push-Benachrichtigungen bei geschlossener App erfordern weiterhin einen Push-Dienst und sind nicht Bestandteil dieser rein lokalen Version.

### Glut
Die Ressource Glut erhält ein eigenes **glühendes Kohle-Symbol**, sichtbar anders als die Streakflamme. Vergabe: 1 Glut je 10 Streak-Schritte; ein Freeze kostet 5 Glut und maximal 2 Freezes werden bevorratet. Historische Charakter-XP werden durch Glutkäufe nicht verändert.

## Datenmigration und Backups

- Der **Datenbankname bleibt `progress-private-v1`**, damit die alte Installation ihre Daten erkennt. Die IndexedDB-Schemaversion wird **2**, mit neuem Store `skills`; die alten Stores `activities`, `entries`, `overrides` und `meta` bleiben bestehen.
- Beim ersten Start mit bestehender Leveln-0.5-Datenbank werden die bisherigen Zielaktivitäten automatisch zu wiederkehrenden Quests. Für jede bisherige Aktivität wird ein eigener Start-Skill erzeugt, die historischen XP-Sätze aus den vorhandenen Zielversionen übernommen.
- Die Migration erfolgt in einer **atomaren IndexedDB-Transaktion**; die alten Tagesdatensätze werden **nicht umgeschrieben**. Vorhandene Aktivitäten, Streaks, Glut und Freezes werden beibehalten.
- Neue Backups benutzen Format `progress-local-backup`, **Version 2**, einschließlich des Skill-Stores, des Charakters und sämtlicher historischen Daten.
- Der Import erkennt **Version 1 (Leveln 0.5)** und **Version 2**. Version 1 wird zunächst **im Speicher** konvertiert und validiert. Erst nach expliziter Bestätigung werden alle Stores **in einer einzigen Transaktion** ersetzt. Ein fehlgeschlagener Schritt soll die bisherige Datenbank unangetastet lassen.
- Beim **Alle Daten löschen** werden alle Stores, Quests, Skills, Historien und Einstellungen entfernt. Die App legt danach keine automatischen Demo-Quests an.
- JSON-Backups sind **unverschlüsselt**. Bitte privat aufbewahren und niemals in ein öffentliches GitHub-Repository hochladen.

## Bekannte Grenzen / Teststatus

- **Geprüft:** JavaScript-Syntax (`node --check`), Logiktests für Migration v1→v2, XP auf zwei Skills, einmalige Questbelohnung, historischen XP-Erhalt bei Skilllöschung, Darstellung der vier Seiten und der Editor-HTML-Vorlagen.
- **Noch nicht auf einem echten iPhone getestet:** Safari-Gesten, tatsächliche IndexedDB-Persistenz/Migration, Dateiauswahl/Charakterbild, Offline-Installation, Service-Worker-Update. In dieser Arbeitsumgebung wurde der grafische Browser-Test beim Öffnen einer lokalen Seite blockiert. Daher ist dies eine **Testversion**; vor produktiver Verwendung bitte Backup erstellen und die Datenübernahme kontrollieren.
- Eine Quest, deren einziger Skill gelöscht wurde, kann bei Bedarf ohne XP-Zuordnung bestehen bleiben; neue Quests benötigen mindestens eine positive Skillzuordnung.
- Ein einmaliger Questabschluss ist absichtlich nicht rückgängig zu machen, um unbegrenzte XP-Gutschriften zu verhindern.
- Für eine spätere Version wären weitere UI-Tests auf einem echten iPhone und ein automatisiertes Testset mit echter IndexedDB sinnvoll.

## Dateien

```text
index.html
app.js
styles.css
sw.js
manifest.webmanifest
manifest-light.webmanifest
manifest-dark.webmanifest
manifest-mono.webmanifest
icons/icon-{light,dark,mono}-{180,192,512}.png
README.md
```
