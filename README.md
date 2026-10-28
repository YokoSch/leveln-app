# Leveln 0.5 — Play your day

**iPhone-optimierte lokale PWA, 28. Oktober 2026.** Neuer Name der bisherigen App **Progress**. Die App speichert Tageswerte weiterhin lokal in IndexedDB und kann auf der **gleichen GitHub-Pages-Adresse** aktualisiert werden.

## Vor dem Update (unbedingt!)

1. In der **bisherigen installierten Progress-App** unter **Optionen → JSON-Backup exportieren** ein vollständiges Backup erstellen und sicher in Dateien ablegen. **Die JSON-Datei niemals in das öffentliche GitHub-Repository hochladen.**
2. Die vorhandene Home-Bildschirm-App **nicht löschen**. Das könnte den lokalen Datenspeicher unzugänglich machen.
3. Die ZIP entpacken. Den **Inhalt**, nicht den umschließenden Ordner, in das **gleiche Repository und Verzeichnis** wie die bisherige App hochladen. Gleichnamige Dateien ersetzen und die neuen Dateien (`manifest-light.webmanifest`, `manifest-dark.webmanifest`, `manifest-mono.webmanifest`, `icons/icon-*`) hinzufügen.
4. GitHub Pages publizieren lassen, App online öffnen und komplett schließen/neustarten; falls nötig in Safari online die gleiche GitHub-Pages-URL erneut öffnen. Der Service Worker wurde für Version 0.5 aktualisiert.
5. Prüfen, ob alte Ziele und Tageswerte noch da sind. Vorher keine produktiven Daten ausschließlich in 0.5 speichern. Altes Backup und alte ZIP aufheben.

## Neue Funktionen

- **Heute:** Kartenmodus für **heute und gestern**, ohne Zielbearbeitungsmenü; bereits erfasste Karten bleiben grau. Wenn ein Tageswert auf **Offen** gesetzt und gespeichert wird, ist die Karte wieder aktiv.
- **Datumsleiste:** Nur Gestern/Heute, horizontal ziehbar oder antippbar, mit vorhersehbarem Einrasten; keine historischen Karten, die man versehentlich ändern könnte.
- **Ziele:** Einzige Stelle für neue oder geänderte Ziele. **Startdatum frühestens heute**; spätere Startdaten sind erlaubt und erzeugen vorher keine Tageskarten. Zielzeilen nach links wischen für **Bearbeiten / Archivieren**. Archivierte Ziele erzeugen ab dem Archivdatum keine neuen Karten; ältere Daten bleiben erhalten.
- **Korrekturen:** Oben in Ziele dauerhaft die Aktionen **Heute korrigieren** und **Gestern korrigieren** für alle Ziele. Ein einzelnes aufgeklapptes Ziel hat eigene Korrekturen nur für dieses Ziel. **Offen** entfernt den aktuellen Datensatz, statt ihn zu überspringen. Nur heute/gestern können geändert werden.
- **Farben:** Individuelle Zielfarbe kann per Checkbox komplett deaktiviert werden; dann übernimmt das Ziel automatisch die aktuelle Sparen-/Leveln-Farbe.
- **Statistik:** Eine einzige **gestapelte Säule**, ihre volle Referenz entspricht der Gesamtmenge aller Ziele im gewählten Kalenderzeitraum. Filter: **Tag / Woche / Monat / Jahr / Gesamt**, **Alle Ziele oder ein Ziel**, **Zeit (Stunden) / Anzahl / XP**. Bei Alle Ziele kann man per Checkbox alle Ziele einzeln farbig stapeln, sonst sind Sparen und Leveln die beiden Segmente. Bei einem einzelnen Ziel wird dessen Beitrag am **unveränderten Gesamtwert** dargestellt. Zahlen aus unterschiedlichen Tätigkeiten sind bei Anzahl nicht automatisch inhaltlich vergleichbar.
- **Hintergründe:** Hell, Dunkel, System sowie frei wählbare Farbe oder eigenes Foto (lokal verkleinert und gespeichert); auf Bildern einstellbarer Abdunklungsgrad. Ein vollständig exportiertes Backup enthält auch Bilddaten.
- **Neue App-Identität:** Name **Leveln**, drei gewählte `lvl+`-Icons: weiß/grün, schwarz/grün und monochrom. In **Optionen → Homescreen-Icon** wählen. Die Wahl aktualisiert die Web-App-Metadaten, aber **iOS aktualisiert ein bereits installiertes Homescreen-Icon unter Umständen nicht automatisch**. Zum Neu-Hinzufügen vorher Daten sichern und die bisherige Installation nicht löschen.

## Bekannte Spiel- und Zielregeln, die erhalten bleiben

- Sparen/Leveln, Karten-Swipes, Minuten- und Anzahlpakete, Paket-Timeout 1–10 Sekunden.
- Kombinierte Zeit-/Anzahlziele, Tages- und mehrtägige Ziele, kalendergebundene und Neustart-Zeiträume.
- XP nach tatsächlich gesparten oder investierten Mengen; Streaks getrennt. Glut und Streak-Freezes bleiben getrennt von XP.
- Lokaler Check-in, konservative Ersatzwerte nach versäumten Tagen, Kalender und JSON-Backup.

## Technische Datenhaltung

Die **bestehende** IndexedDB heißt bewusst weiterhin `progress-private-v1` mit den Stores `activities`, `entries`, `overrides`, `meta`. Dies ist **keine neue Datenbank**: Das Beibehalten der Kennung ist für die Datenmigration wichtig.

Für jede Tagesregel gilt der Schlüssel `Aktivitäts-ID|Zielregel-ID|YYYY-MM-DD`. Tageskorrekturen erfolgen atomar per IndexedDB-Transaktion (PUT oder DELETE). Nach dem Speichern werden Tageskarten, Kalender, XP, Streaks und Statistiken aus den aktuellen Daten neu berechnet. Alte Einträge aus Version 0.3 können zusätzlich gelesen werden.

Backups bleiben kompatibel mit `progress-local-backup` Version 1. Der Exportdateiname lautet künftig `Leveln-Backup-YYYY-MM-DD.json`. **Backups sind unverschlüsselt**; sichere sie entsprechend.

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

## Tests und Grenzen

- JavaScript-Syntax kontrolliert.
- In einem mobilen Chromium-UI-Test mit **simulierter IndexedDB** kontrolliert: Laden, Ziele, Tageswerte speichern → erneut laden → auf Offen setzen → ursprüngliche Karte reaktivieren, einzelne Zielkorrektur, Archivieren und historisches Ziel erhalten, geplante zukünftige Ziele, Zeitraum-/Metrikfilter, Icon-Auswahl, individuelles Hintergrundfarbschema.
- **Nicht vollständig verifiziert:** echte Safari-/iOS-PWA, Service Worker und Persistenz unter echter IndexedDB. Bitte nach dem Backup zuerst mit Beispieldaten testen.
- **Erinnerungen:** Ohne eigenen Server kann die Web-App beim vollständigen Schließen keine verlässlichen Push-Benachrichtigungen an iOS senden. Der Check-in wird beim Öffnen gezeigt; externe Erinnerungen können über iPhone-Kurzbefehle erfolgen.
- **Haptik:** Safari unterstützt kein beliebig frei programmierbares haptisches Feedback für Web-App-Gesten. Animationen und Sounds sind umgesetzt, aber haptische Gesten-Effekte nicht garantiert.
