# Leveln 0.10 – iPhone-Web-App (PWA)

**Spiel deine Quests – trainiere Skills – gestalte deinen Charakter.** Version 0.10 baut auf dem **bereinigten Stand von Leveln 0.9** und den freigegebenen Designvorlagen auf. Die App funktioniert als lokale, installierbare Web-App (GitHub Pages) und erfordert keinen Benutzeraccount.

## Sicheres Update von 0.9

1. In der aktuell installierten **Leveln 0.9** über **Mehr → Backup sichern** ein **JSON-Backup** erstellen und außerhalb der App aufbewahren. Das alte ZIP ebenfalls behalten.
2. Dieses 0.10-ZIP entpacken und **alle Dateien und Unterordner aus dem ZIP-Stamm** in das vorhandene GitHub-Repository kopieren. Vorhandene Dateien ersetzen, insbesondere `index.html`, `app.js`, `sw.js`, `styles.css`, Manifestdateien und Bilder. Zusätzlich müssen `v010.js`, `styles-010.css`, `assets/` und `theme/` mit hochgeladen werden.
3. `git add . && git commit -m "Leveln 0.10" && git push` (im lokalen Repository). Die **GitHub-Pages-Adresse nicht ändern**, sonst liegt die bestehende IndexedDB unter einer anderen Website-Quelle.
4. Die bisherige Leveln-App aktualisieren/neu öffnen. Ein installierter Service Worker kann beim ersten Aufruf noch Dateien der vorherigen Version liefern; gegebenenfalls erneut schließen und öffnen oder in Safari die Seite aktualisieren.
5. Quests, Skills, Charakter-XP und zurückliegende Tageswerte prüfen, bevor du weitere Daten einträgst. **Die installierte 0.9-App vor der Überprüfung nicht löschen**.

## Daten und Backups

- **Datenformat 5 / Backupformat 5** in Version 0.10; automatischer Migrationsweg **0.9 (Format 4) → 0.10 (Format 5)**. Import akzeptiert bewusst **nur Backupformat 4 oder 5**. Ältere Formate werden nicht zusätzlich unterstützt.
- Der IndexedDB-Datenbankname und die bestehenden Stores bleiben erhalten. Beim Upgrade kommen neue Eigenschaften für Kartensichtbarkeit, Stapelreihenfolge und Statistikfarben hinzu. Historische Tagesdaten, XP-Quellen und Skillzuordnungen werden bei der Migration **nicht umgebucht oder verdoppelt**.
- Backup-Name: `Leveln-Backup-JJJJ-MM-TT.json` (immer derselbe Vorschlag pro Tag). Über das Teilen-Menü wird ausschließlich die JSON-Datei übergeben. iOS kann beim Speichern trotzdem selbst eine Kopie mit Namenszusatz anlegen; automatisches Überschreiben eines gewählten Ordners ist in einer iPhone-PWA nicht zuverlässig möglich.
- Daten bleiben lokal im Browser des Geräts; das Backup ist **nicht verschlüsselt**. Änderungen an Safari-Website-Daten oder der ursprünglichen Domain können die lokal gespeicherten Daten beeinflussen.

## Neuerungen in Leveln 0.10

**Quests und Skills.** Ein wiederkehrendes Ziel wird bei Bedarf als eigene **Zeit- und/oder Anzahl-Tabelle** angelegt. Jede Tabelle enthält den Zielwert, die tägliche Ausspielmenge und beliebig viele XP-Zeilen für zugehörige Skills – ausdrücklich **XP pro Stunde** oder **XP pro Anzahl**. Bei neuen Quests sind beide Tabellen zunächst deaktiviert. Die Lebensbereich-Zuordnung entfällt. Einmalige Missionen behalten ihre einmalige Abschlussbelohnung. Unklare Checkboxen sind beschriftet.

**Karten.** Zwei getrennte Stapel für **Leveln** und **Zaubern**. Hochwischen bucht die gewählte Menge und lässt dieselbe Karte liegen; seitliches Wischen wechselt zur nächsten. Kurzes Herunterwischen wechselt den Stapel; nach längerem Herunterziehen und Halten öffnet sich die Kartenverwaltung. Plus/Minus neben dem Ausspielwert verändern ihn durch Tippen um **1 Minute bzw. 1 Anzahl**, durch Halten zunehmend schneller (maximal **30 Minuten bzw. 10 Einheiten je wiederholtem Schritt**). Jede Questkarte hat einen direkten Bearbeiten-Button mit drei Punkten. Die Vorderkarte hat eine große Wischfläche, zwei weitere Karten liegen darunter sichtbar; Statuskonturen können flammenartig animiert werden.

**Kartenverwaltung.** Vollbild mit Miniaturkarten, sichtbarem Kartenkürzel, Kartensichtbarkeit und Drag-and-drop-Reihenfolge. Sortierung alphabetisch oder nach Questzeitraum, jeweils auf-/absteigend. Erreichbar aus dem Tagesdeck und dem Questboard. Beim Verlassen gelangst du zur vorherigen Ansicht zurück.

**Statistik.** Statistikfarben für Quests und Skills getrennt von den individuell wählbaren Kartenfarben. Zu ähnliche Statistikfarben werden beim Erstellen einmalig mithilfe von OKLab-Farbabständen unterschieden. Ein neuer Skillfilter ergänzt den Questfilter; Zeit/Anzahl werden bei Skillfilterung proportional zur XP-Zuordnung angezeigt.

**Design.** Drei gemeinsam freigegebene Modi: **Dunkel / Neon-RPG**, **Hell / Pastell** und **Minimalistisch / Weißes Pixel-Retro**. Individuelle Nutzerfarben bleiben erhalten; nur ihre Darstellung wird themenspezifisch abgeleitet. Gemeinsamer Pool aus **63 Original-SVGs**, darunter **44 auswählbare und 19 Systemicons**. Drei neue `lvl+`-App-Logos (mit Fackel und Kartenstapel).

## Steuerung

| Geste/Aktion | Bedeutung |
| --- | --- |
| Karte nach oben | Aktuelle Ausspielmenge buchen; Karte bleibt vorne |
| Karte links/rechts | Vorherige/nächste Karte |
| Kurz nach unten | Leveln-/Zaubern-Stapel wechseln |
| Weiter nach unten ziehen und halten | Kartenverwaltung öffnen |
| `−` / `+` tippen oder halten | Ausspielmenge ändern, Halten beschleunigt |
| Drei Punkte auf Karte | Quest bearbeiten |
| Kartenverwaltung unten | Sortieren, Sichtbarkeit, Schließen |

## Tests und Grenzen

Zentrale Funktions- und Migrationsprüfungen lassen sich ohne weitere Installation mit `node tests/logic.test.cjs` ausführen. Außerdem wurden der JavaScript-Syntaxcheck und die Vollständigkeit der Offline-Ressourcen geprüft.

**Noch offen:** Ein vollständiger Integrationstest auf einem echten iPhone in Safari, inklusive Gesten, Service-Worker-Update und Import eines persönlichen 0.9-Backups. **0.10 zunächst als Testversion verwenden und das 0.9-Backup behalten.**

## Wichtige Projektdateien

- `app.js`: bestehender, aus 0.9 übernommener Daten-/Gameplaykern und Event-Handler.
- `v010.js`: v0.10-spezifische UI- und Datenformat-Erweiterungen, Start erst nach Registrierung aller Overrides.
- `styles.css`: Kompatibilitätsstyles der bisherigen App.
- `styles-010.css`: neue Karten, Formen, Themes, Gesten-Steuerelemente und Vollbild-Kartenverwaltung.
- `theme/palette.js`: dynamische, kontrastabhängige Nutzerfarben.
- `assets/icons/mono/`: ein originaler SVG-Satz für Icons und Systemzeichen.
- `sw.js`: Precache der offline verfügbaren Ressourcen.
- `WARTUNG.md`: Informationen für Weiterentwicklungen.
