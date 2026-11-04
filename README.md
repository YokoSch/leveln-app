# Leveln 0.11.4 – korrigierte Ausgabe

**Ausgangspunkt für das Update: Leveln 0.11.3.** Vollständige, modularisierte iPhone-PWA für GitHub Pages. Die bestehende App muss **nicht** neu installiert werden. Die lokale Datenbank `progress-private-v1` sowie das Daten- und Backupformat **5** bleiben unverändert. Die 64 gestalteten Original-SVGs sind weiterhin enthalten.

## Korrekturen gegenüber der ersten 0.11.4-Ausgabe

1. **Questzeilen wieder als beidseitige Slider:** Im Normalzustand sind keine Verwaltungsbuttons sichtbar. **Nach links schieben:** Bearb., Archiv, Löschen hinter der Questzeile. **Nach rechts schieben:** kostenloser Dauer-Freeze hinter der anderen Seite. Das Archiv hat ebenfalls verschiebbare Zeilen mit De-Archivieren und Löschen. Auch die einmaligen Quests haben verdeckte Verwaltungsbuttons.
2. **Echte physische Karten:** Die beiden darunterliegenden Karten werden in identischer Größe mit derselben Schrift, denselben Bildern, Farben und Details wie die oberste Karte gezeichnet. Nur der gesamte Kartenkörper ist nach unten versetzt. Die darunterliegenden Karten sind sichtbar, aber bis zum Aufdecken nicht anklickbar; ihre Kürzel bleiben sichtbar.
3. **Keine interaktive Einführung mehr:** Stattdessen befindet sich in **Einstellungen → Leveln-Handbuch** eine umfangreiche, aufklappbare Erklärung der Philosophie, Spielregeln und Bedienung mit zwei konkreten Beispielen. Bei einem **wirklichen Erststart** erscheint nur ein kurzer Hinweis auf diese Dokumentation. Eine unterbrochene Einführung aus der ersten 0.11.4-Ausgabe wird ohne Veränderung der Spielstände beendet.

## Andere Funktionen von 0.11.4 bleiben erhalten

- Questgebundene Glut und Freezes (1 Glut je 10 erfolgreiche Streak-Schritte; 5 Glut je Freeze; maximal 2 Freezes pro Quest). Bestände nur im Charakter-Shop.
- Kostenloser Dauer-Freeze: Die Streak-Zahl bleibt stehen, wächst während der Pause nicht, und es gibt keine neuen XP oder Glut während eingefrorener Bewertungszeiträume.
- Quests archivieren, de-archivieren mit Nachträgen oder in zwei Varianten endgültig löschen: entweder Erfolge unter „Vergangenes“ behalten oder alle zugehörigen Daten entfernen.
- Aufgeräumte große Karten mit mittiger Mengensteuerung, x/y-Balken, breiterem Leuchten und 2 Sekunden Haltezeit für das Kartensortiermenü.
- Rückwirkende Leistungen aus 0.11.3, Kalenderrahmen, Flammen, Schatztruhen, synchronisierte Kartensortierung und Original-SVGs.

## Installation als Update von 0.11.3

1. In der **bestehenden 0.11.3-App** ein **JSON-Backup erstellen** und außerhalb der App sichern.
2. ZIP entpacken. **Alle enthaltenen Dateien und Unterordner** direkt in die Wurzel deines bisherigen GitHub-Repositories kopieren und gleichnamige Dateien überschreiben. Nicht als zusätzlichen Unterordner hochladen. Alte, in 0.11.4 entfernte Dateien (z. B. `src/shared/ui/tutorial-0114.js`) sind nicht erforderlich und können im Repository gelöscht werden.
3. Im Repository in Git Bash ausführen:

   ```bash
   git add -A
   git commit -m "Leveln 0.11.4 – Slider, Karten und Handbuch korrigiert"
   git push
   ```
4. Nach der Veröffentlichung auf GitHub Pages die **bereits installierte iPhone-App** neu öffnen bzw. aktualisieren. **Nicht deinstallieren oder löschen** – die bisherigen Daten werden lokal im Browser gespeichert.
5. Quests, Skills, XP, Glut und Freezes überprüfen. Anschließend mit einer Testquest die beiden Wischrichtungen und das Stapeln ausprobieren.

Die Korrektur führt **kein neues Datenbankschema und keine neue XP-/Glut-Migration** ein. Sie übernimmt den Datenbestand von 0.11.3 über die bereits vorhandene, version-5-kompatible Datenstruktur. Die bisherige automatische historische Migration wird nicht erneut ausgeführt. Für ein vollständiges Zurücksetzen ist **nicht** das Löschen der installierten PWA vorgesehen.

## Tests und Entwicklung

```bash
npm install
npm run prepare:release
npm test
```

Die automatisierten Tests prüfen die bisherige Daten- und XP-Logik, Questverwaltung, questgebundene Ressourcen, Dauer-Freeze, Original-SVGs, historische Tagesbuchungen, sowie neu die beidseitigen Slider, Kartenstapel und Handbuchintegration. Die Darstellung wurde zusätzlich in einer statischen Chromium-Vorschau auf iPhone-Größe überprüft. Ein vollständiger realer iPhone-Touch-Test bleibt offen.

- `src/shared/ui/elemente.js`, `pages/quests/management-0114.js`, `src/shared/compat/events.js`: Quest-Slider
- `pages/heute/page.js`, `src/styles/v0114.css`: physische Karten
- `pages/einstellungen/page.js`, `src/shared/ui/intro-shop.js`, `src/shared/v010/database.js`: Handbuch und Erststart-Hinweis
- `tests/v0114-fix.test.cjs`: zusätzliche Regressionstests
- `RELEASE-0.11.4.md`: genaue Hinweise zur Korrektur
