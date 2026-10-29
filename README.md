# Leveln 0.7 – Mana & Questkarten

**Stand:** 29. Oktober 2026 · iPhone-PWA · Testversion

Eine lokale, offline-fähige Progressive Web App (PWA) mit vier Bereichen: **Heute/Gestern, Quests, Charakter und Statistik**. Die Einstellungen öffnen sich über das Zahnrad oben rechts. Über die Diskette oben links lässt sich auf allen Hauptseiten ein JSON-Backup erzeugen.

## Vor dem Update von 0.6

1. **Unbedingt in Leveln 0.6 ein JSON-Backup erstellen** und privat in der iPhone-Dateien-App sichern. Niemals persönliche JSON-Dateien auf GitHub hochladen.
2. **Die vorhandene Home-Bildschirm-App vorerst nicht löschen.** Eine neue Installation kann getrennten lokalen Speicher verwenden.
3. Die ZIP entpacken. Den **Inhalt des Ordners**, also `index.html`, `app.js`, `styles.css`, `sw.js`, die `manifest*.webmanifest` und `icons/`, in dasselbe bereits verwendete GitHub-Pages-Repository und denselben Pfad hochladen; alte Dateien ersetzen.
4. Die bestehende URL in Safari öffnen und nach erfolgtem Laden die App schließen und erneut öffnen. Der Service-Worker-Cache verwendet Version `progress-pwa-v0.7-20261029-2`.
5. Unter Einstellungen die Version überprüfen und anschließend Quests, Skills, XP, Streaks und die Einträge von heute und gestern kontrollieren. Das alte Backup unbedingt behalten, bis du sicher bist.

## Neu in Version 0.7

- **Zaubern statt Sparen:** Zeit- und Anzahlobergrenzen werden als **Mana-Budget** angezeigt. Ein eigens gestalteter **dunkelblauer, länglicher Kristall** stellt Mana dar. Die bestehende mathematische Spar-/XP-Logik bleibt erhalten.
- **Einheitliche Kartengesten:** **Nach oben** erfasst bei Level-Quests eine Leistung und bei Zauber-Quests einen Verbrauch. **Nach unten** bedeutet in beiden Fällen `0` (nichts trainiert bzw. kein Mana verbraucht).
- **Direkte Eingabe auf der Karte:** Über **„Werte eintragen“** lassen sich Minuten und Anzahl ausklappen. Wenn du keine Werte änderst, verwendet der obere Swipe den bei der Quest gespeicherten **täglichen Standard**; der untere Swipe schreibt `0`. Die Zeit-/Anzahlpaket-Modi sind entfernt.
- **Tagesstandards:** Beim **erstmaligen Erstellen** schlägt das Formular für tägliche Zeitziele den Zielwert, für mehrtägige Zeitziele `Ziel ÷ 7/30/365` und für Anzahlen `1` vor. Danach werden die vom Nutzer gespeicherten Standardwerte **nicht mehr automatisch neu berechnet**. Bestehende Quests erhalten beim Datenformat-Upgrade einmalig einen eingefrorenen Vorschlagswert, sofern vorher keiner gespeichert war.
- **Kartendeck:** Echt überlagerte, seitlich verschiebbare Karten mit **maximal fünfstelligem Kürzel** am unteren Rand. Darunterliegende Karten werden sichtbar, sobald die Vorderkarte zur Seite gezogen wird. Erfasste Karten bleiben als ausgegraute Karten erreichbar.
- **Tag wechseln:** Die untere Datumstrommel ist entfernt. Ein erneuter Tap auf den **bereits aktiven** unteren Reiter Heute/Gestern wechselt zwischen den beiden Tagen. Von einem anderen Reiter aus kehrt man zum zuletzt gewählten Tag zurück.
- **Quests filtern:** **Alle**, Einmalig, Täglich, Wöchentlich, Monatlich, Jährlich und Archiv. In **Alle** bleiben die Gruppen gemeinsam sichtbar.
- **Einmalige Quests:** Optional **ohne Ablaufdatum**. Ein Abschluss ist weiterhin nur einmal möglich.
- **Mehr Symbole:** Zusätzliche Vektor-Icons für Menschen, Magier, Ritter, Tiere und Fabelwesen, gemeinsam für Quests, Skills und Charakter verfügbar.
- **Mana-zu-XP-Effekt:** Beim tatsächlichen XP-Gewinn aus Zaubern fliegen animierte blaue Kristalle in Richtung XP-Leiste. Bei mehrtägigen Zauberquests erfolgt die endgültige Abrechnung weiterhin **nur einmal je vollständig erfasstem Zeitraum**, nicht täglich.
- **Backup-Diskette:** Oben links; unter iOS wird bevorzugt das native Teilen-Menü („In Dateien sichern“) geöffnet. Falls dies nicht unterstützt wird, erfolgt ein Browser-Download. **Ein dauerhaft voreingestellter Speicherordner ist auf iPhone-Safari nicht verfügbar.** Normale Eingaben werden weiterhin automatisch in IndexedDB gespeichert.
- **Hilfe aufgeräumt:** Flammen-/Freeze-Erklärung bleibt in den aufklappbaren Einstellungen, nicht als dauerhafte Kalenderbeschriftung. Der Paket-Timer entfällt aus den Einstellungen.

## Datenmigration

- **Datenbank:** weiterhin `progress-private-v1`, IndexedDB-Version `2`; deine bestehenden Daten werden dadurch auf derselben Origin weiterverwendet.
- **Backupformat:** `progress-local-backup`, **Version 3**. Der Import unterstützt die älteren **Versionen 1 (0.5) und 2 (0.6)** sowie Version 3.
- Beim Upgrade werden bisherige Quests und Skills behalten, ihre gespeicherten Tageswerte unverändert übernommen, tägliche Standardwerte bei Bedarf einmalig festgelegt und die frühere Spar-Karten-Gestenanzeige auf die neue Bedienlogik umgestellt. Es erfolgt **keine erneute XP-Gutschrift**, sondern die XP werden aus den zugrunde liegenden Datensätzen berechnet.
- Der Backup-Import validiert die Daten und ersetzt die lokalen Stores erst nach expliziter Bestätigung in einer gemeinsamen IndexedDB-Transaktion.
- **„Alle Daten löschen“** entfernt vollständig sämtliche Quests, Skills, Tagebucheinträge, Einstellungen, Glut, Freezes und das Charakterprofil. Es werden **keine Demo-Daten** automatisch angelegt.

## Technische Hinweise und Grenzen

- Gespeicherte persönliche Daten werden nicht an GitHub übertragen. Der Code ist über GitHub Pages öffentlich, deine Daten liegen lokal in IndexedDB. Backups enthalten persönliche Daten **unverschlüsselt**.
- Eine PWA kann nicht zuverlässig selbst einen festen Ordner in iOS wählen und dort ohne Nutzeraktion speichern. Regelmäßige manuelle JSON-Sicherungen werden ausdrücklich empfohlen.
- Für Push-Benachrichtigungen bei geschlossener App wäre ein separater Push-Dienst nötig. Die aktuelle rein lokale App zeigt Erinnerungen **beim Öffnen**, nur für gestern.
- Die Web-Vibrations-API wird von iOS-Safari nicht allgemein unterstützt; Sound und visuelle Effekte können funktionieren, echtes haptisches Feedback bei freien Gesten ist nicht garantiert.
- **Geprüft:** JavaScript-Syntax, Logiktests für Mana-/Level-XP, mehrfach zugeordnete Skills, Questkürzel und Backups von Datenformat 1→2→3.
- **Noch nicht geprüft:** vollständige Gesten-/Bildschirmdarstellung und Freigabe-/Dateien-Dialog auf einem echten iPhone; in der Laufzeitumgebung war ein vollständiger Browser-Test blockiert. Darum dies zunächst als **Testversion** verwenden.

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
