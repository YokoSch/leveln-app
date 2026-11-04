# Leveln 0.11.4 – Release-Hinweise

**Basis:** Leveln 0.11.3. Die 64 originalen SVG-Illustrationen sind unverändert. Die lokale Datenbank heißt weiterhin `progress-private-v1`; Stores und Backup-Datenformat bleiben bei **Version 5**.

## Änderungen

1. **Questverwaltung:** Unter jeder aktiven Questzeile stehen **Bearb.**, **Archiv** und **Löschen**. Das Archiv steht in „Alle“ standardmäßig eingeklappt. Archivierte Quests lassen sich löschen oder wieder aktivieren.
2. **Zwei Löscharten:** „Quest entfernen, Erfolge behalten“ blendet die Quest dauerhaft aus. Historische Buchungen, Skill-XP und Charakter-XP erscheinen in der Statistik gesammelt unter **Vergangenes**. „Alles endgültig löschen“ entfernt Quest, Tageswerte, daraus entstandene XP und ihr Ressourcenkonto. Für Letzteres ist eine zusätzliche Sicherheitsabfrage erforderlich.
3. **De-Archivieren:** Vor dem Wiederherstellen können Lücken im Archivzeitraum anhand beliebig vieler Start-/Endzeitspannen mit Tagesmengen nachgetragen werden. Alternativen sind ohne Nachträge fortsetzen oder abbrechen. Unbekannter Zaubern-Verbrauch wird nicht als Nullverbrauch erfunden. Nachträge zählen als echte Leistungen, erzeugen aber nicht nachträglich neue Glut.
4. **Kartenergomomie:** Plus-/Minus-Steuerung oberhalb der Fortschrittsbalken, mittiger auf der Karte. Überflüssige Texte, Icons und doppelte Einheiten entfallen.
5. **Kartenstapel:** Die Kürzel von zwei darunterliegenden Karten bleiben in eigenen sichtbaren Bereichen erkennbar; die aktive Kartenhitbox reicht weiter zum unteren Rand. Die redundante Kartenanzahl/Datumszeile entfällt.
6. **Kartensortierung:** Das nach unten gezogene Kartenmenü öffnet nach **2 Sekunden** Halten (visuelle Halteanzeige).
7. **Glow:** Deutlich breiterer, questfarbener äußerer Leuchteffekt im jeweiligen Kartenzustand.
8. **Glut und Freezes je Quest:** 1 Glut je 10 erfolgreiche Streak-Schritte einer Quest; 5 Glut je Freeze; maximal zwei Freezes **pro Quest**. Keine Nutzung in anderen Quests. Die Bestände stehen ausschließlich im Freeze-Shop im Charaktermenü, nicht in den Questzeilen.
9. **Kostenloser Dauer-Freeze:** Questzeile nach rechts schieben, um den Pausenknopf zu erreichen. Während der Pause bleibt der Streak auf seinem bisherigen Stand; er wächst nicht. Keine XP/Glut, kein gekaufter Freeze-Verbrauch. Schneeflocken kennzeichnen Pausen im Kalender; erneutes Betätigen beendet die Pause.
10. **Neue Einführung:** Zuerst eine freundliche, humorvolle Erklärung der Spielidee: Nicht bestrafen, sondern belohnen; Zaubern ist bewusst genutzter Spaß, kein moralischer Makel. Anschließend führt die **bisherige Katze** durch die echte Questerstellung, eine eigene Buchung und die Korrektur. Die Tour lässt sich überspringen, später erneut aufrufen und bei Unterbrechung fortsetzen; es gibt keine versteckten Beispiel-Einträge oder Gratis-XP.
11. **Korrektur der Archivnachtragung:** Der Beginn ist auf das Archivierungsdatum begrenzt, und die Einträge werden korrekt in die wiederhergestellte Quest geschrieben.
12. **Weiterbestehende Funktionen:** Historische Erfolgsformulare, Kalenderrahmen, tägliche Streak-Flammen, synchronisierte Kartenverwaltung und Original-SVGs aus Version 0.11.3 bleiben erhalten.

## Installation auf dem iPhone / GitHub Pages

1. **In der vorhandenen App ein JSON-Backup anlegen und außerhalb der App speichern.** Die bestehende Homescreen-PWA nicht deinstallieren, sonst gehen ihre lokal gespeicherten Daten möglicherweise verloren.
2. Das ZIP entpacken. Den Inhalt (u. a. `index.html`, `assets/`, `src/`, `pages/`, `theme/`, `sw.js`) vollständig in die Wurzel des bisherigen GitHub-Repositories kopieren und Dateien überschreiben. Es ist **kein** zusätzlicher Unterordner `Leveln-v0.11.4` auf GitHub nötig.
3. In Git Bash innerhalb des Repositories:

```bash
git add -A
git commit -m "Leveln 0.11.4 – Questverwaltung, Dauer-Freeze und Einführung"
git push
```

4. Nach dem GitHub-Pages-Deployment die **bestehende** Web-App neu laden. Der Offline-Cache verwendet eine neue Kennung.
5. Zuerst vorhandene Quests, XP und Glut prüfen. Danach Archivieren → Nachtragen → Wiederherstellen, beide Löschoptionen und den kostenlosen Dauer-Freeze an einer Testquest ausprobieren.

## Wichtige Hinweise

- **Backup-Schema bleibt 5.** Das bisherige globale Glut-/Freeze-Konto wird bei Version 0.11.4 konservativ in Questkonten überführt. Historisch eindeutig zuordenbare Glut wird ihrer Quest gutgeschrieben. Falls alte globale Bestände nicht eindeutig zuordenbar sind, werden sie intern als `legacyUnassigned` gekennzeichnet und **nicht** willkürlich einer Quest zugesprochen. Laut Projektplanung gab es bislang keine real erworbenen Glutbestände.
- **Archivierte oder vollständig verborgene Quests** sind im Freeze-Shop nicht kaufbar. XP aus entfernten, aber behaltenen Leistungen fließen weiterhin in den Gesamtfortschritt ein.
- **Dauer-Freeze und mehrtägige Perioden:** Ein Bewertungszeitraum, der die Pause schneidet, zählt nicht als neuer Erfolg und bringt keine XP/Glut. Frühere Leistungen werden nicht nachträglich belastet.
- **Echte iOS-Gesten sind noch nicht auf einem physischen Gerät geprüft.** Die automatisierten Logik-, Datenmodell-, SVG- und HTML/Chromium-Prüfungen waren erfolgreich. Bitte die Touch-Gesten und das Verhalten installierter PWAs zunächst mit einem gesicherten Testspielstand erproben.

## Entwicklung und Tests

```bash
npm install
npm run prepare:release
npm test
```

Die wichtigsten neuen Dateien sind `src/shared/domain/v0114.js`, `pages/quests/management-0114.js`, `src/shared/ui/tutorial-0114.js` und `src/styles/v0114.css`. Die bestehende Datenbank- und Backupstruktur wurde beibehalten; der Offline-Service-Worker lädt auch die neuen Ressourcen.
