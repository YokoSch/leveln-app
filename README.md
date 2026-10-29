# Leveln 0.8 – Laufende Mana-Buchungen & Icon-Galerie

**29. Oktober 2026 · Testversion für iPhone-Safari · rein lokale PWA**

## Installation / Update von Leveln 0.7

1. **Unbedingt vorher unter „Mehr → Backup sichern“ ein JSON-Backup exportieren.** Speichere es privat in der Dateien-App; **niemals** ins öffentliche GitHub-Repository hochladen.
2. Entpacke `Leveln-v0.8-iPhone-App.zip` und lade **alle enthaltenen App-Dateien** (inklusive `icons/`, `sw.js`, `app.js`, `styles.css`) in **denselben GitHub-Pages-Ordner** wie die bisherige App hoch. Vorhandene Dateien ersetzen.
3. Öffne die bisherige App-Adresse in Safari. Falls noch die alte Oberfläche erscheint, starte die Web-App erneut, sobald GitHub Pages die neue Version ausliefert. **Lösche die alte Home-Bildschirm-App nicht**, bevor du deine Daten geprüft hast.
4. Prüfe nach dem Update die Tageswerte, Mana-Budgets, Skills, Streaks und XP. Bewahre das Backup auf.

## Änderungen in 0.8

- **Laufende Tageserfassung statt „Karte erledigt“:** Hochwischen bucht die auf der Karte eingetragenen Minuten und/oder Anzahlen **zusätzlich** zum Tageswert. Mehrfaches Buchen am selben Tag ist möglich; die Karte wird nicht ausgegraut. Herunterwischen bestätigt null, ohne bereits gebuchte Mengen zu löschen. Die bestehenden täglichen Standardwerte gelten bei nicht geänderten Eingabefeldern.
- **XP und Streaks getrennt:** Level-Quests erhalten XP für erfasste Leistungen schon am laufenden Tag. Ein erreichtes Trainingsziel kann direkt als Erfolg erkennbar werden. Zauber-Quests ziehen **sofort** Mana für den gebuchten Verbrauch ab. Übrig gebliebenes Mana wird dagegen **erst nach dem Ende des Zielzeitraums** als XP berücksichtigt (beim Tagesziel ab dem Folgetag, bei Wochen-/Monats-/Jahreszielen entsprechend später). Ein überschrittenes Budget kann schon davor als Fehlstand erkannt werden.
- **Leuchtende Kartenränder:** Trainingserfolg und noch vorhandenes Mana bekommen einen dezenten Lichtsaum; kein grauer „abgespielt“-Status mehr.
- **Neue Reihenfolge im Questboard:** Der ausklappbare und beim Scrollen fixierte Kalender bleibt oben; **darunter** erscheinen die Filter „Alle“, „Einmalig“, „Täglich“, „Wöchentlich“, „Monatlich“, „Jährlich“ und „Archiv“. „Alle“ zeigt weiterhin sämtliche Gruppen.
- **Zentrale Icon-Galerie:** Statt eines reinen Namen-Dropdowns wählst du eine sichtbare Icon-Kachel. Kategorien: **Menschen, Tiere, Fabelwesen, Gegenstände und Symbole**, einschließlich detaillierterer einfarbiger Vektorzeichnungen. Gilt für Quests, Skills und Charakter.
- **Mehr-Menü unten:** Der fünfte Navigationsplatz `••• Mehr` klappt **„Backup sichern“** und **„Einstellungen“** auf. Die beiden schlecht erreichbaren Tasten oben sind entfernt.
- **Layout-Korrekturen:** Kein weichgezeichneter Navigationsrand; der Kalender hat eine deckende Hintergrundabgrenzung, sodass die darunterlaufende Liste nicht störend durchscheint. Formulare enthalten beschriftete Checkboxen.
- **Check-in:** Nur unvollständige Einträge von **gestern** werden nachgefordert, nicht der noch laufende heutige Tag.

## Datenspeicherung und Kompatibilität

- Speicherung bleibt in derselben **IndexedDB** (`progress-private-v1`, Datenbankversion 2) an derselben GitHub-Pages-Adresse. Private Daten werden **nicht an GitHub übertragen**.
- **Keine Änderung am Backupdatenformat:** Version 0.8 schreibt `progress-local-backup`, **Formatversion 3**, und kann weiterhin Backups aus Format 1, 2 und 3 importieren. Die historischen Mengen bleiben erhalten.
- Der Eingabewert auf der Karte ist eine **neue Buchung**, nicht automatisch der gesamte Tageswert. **Korrigieren oder Zurücksetzen** kannst du weiterhin über „Quests → Heute/Gestern korrigieren“.
- Das Diskettensymbol ist in das Menü „Mehr → Backup sichern“ gewandert; normale Dateneingaben speichern automatisch. Auf dem iPhone öffnet das Backup nach Möglichkeit das Teilen-Menü, sonst einen Download. Ein dauerhaft festgelegter Speicherordner ist in iPhone-Safari nicht zuverlässig verfügbar.
- Das Backup ist **unverschlüsselt**. Bewahre es entsprechend sicher auf.

## Grenzen / Teststand

- **Erfolgreich geprüft:** JavaScript-Syntax; Logiktests für additiven Mana-Verbrauch, vorläufige vs. abgeschlossene Mana-XP, Level-XP und Questfilter-Reihenfolge. Ein mobiler Layout-Test mit simulierten Beispieldaten prüfte Icon-Galerie, Mehr-Menü, Questboard und Tageskarte ohne JavaScript-Seitenfehler.
- **Nicht vollständig geprüft:** Safari-Gesten, echte IndexedDB-Integration und Datei-/Teilen-Dialoge auf deinem konkreten iPhone. Der vollständige browserbasierte Integrationstest ist in dieser Umgebung blockiert. Bitte zunächst als **Testversion** betrachten und die Sicherung behalten.
- Eine Server-Push-Benachrichtigung außerhalb der App ist in der rein lokalen GitHub-Pages-Version nicht enthalten; der Check-in wird beim Öffnen angezeigt.

## Projektdateien

`index.html`, `app.js`, `styles.css`, `sw.js`, `manifest*.webmanifest`, `icons/` (drei lvl+-Icon-Farben), `README.md`.
