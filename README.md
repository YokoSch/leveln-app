# Leveln 0.11.3 – Historische Erfolge, Kalender und Kartenverwaltung

Diese vollständige, modularisierte iPhone-PWA basiert auf **Leveln 0.11.2**. Die **64 detaillierten Original-SVGs** und alle bisherigen Leveln-/Mana-Spielregeln bleiben erhalten. Die größere künstlerische Neugestaltung ist **nicht** Bestandteil dieses Updates.

## Was ist neu?

1. **Bisherige Erfolge:** Ganz unten im Questformular gibt es einen standardmäßig eingeklappten Bereich. Mit `＋ Zeitraum hinzufügen` lassen sich beliebig viele Zeiträume mit Start- und Enddatum erfassen. Die angegebene Minuten- und/oder Anzahlmenge gilt für *jeden* Tag des Zeitraums. Die erste Zeile schlägt die in der Quest definierte Zielmenge vor. Nicht aktivierte Metriken werden ausgeblendet. Nur Tage **vor der ursprünglichen Questerstellung** sind zulässig; überlappende Intervalle werden abgewiesen. Bestehende fremde Tagesbuchungen werden nicht überschrieben.
2. **XP und einmalige Glut:** Historische Tage werden als normale `entries` in IndexedDB gespeichert. Trainings-XP und eingespartes Mana folgen der vorhandenen Berechnungslogik. Der historische Streak und sein Glut-Meilenstein werden beim **ersten Speichern einer neuen Quest einmalig** berechnet. Nachträgliche Mengenänderungen korrigieren die berechneten XP und Streaks, erzeugen **keine zusätzliche historische Glut**. Bereits erhaltene historische Glut wird bei späteren Korrekturen nicht wieder abgezogen. Laufende Glut-Belohnungen nach dem Erstellungsdatum bleiben normal aktiv. Eine **bereits vorher angelegte Quest** erhält bei nachträglicher Ergänzung alter Erfolge keine rückwirkende Glut.
3. **Charakter und Navigation:** Skillsymbole ungefähr 10 % größer; das große Abenteuerprofilbild ungefähr doppelt so groß. Icons in der Hauptnavigation ca. 10 % größer, **nicht** der kleine Charakteravatar in der Navigation.
4. **Kalender:** In der Wochenansicht erscheinen Streak-Flammen für erfolgreiche tägliche Quests auch ohne ausgewählten Questfilter. Eine **ausgewählte mehrtägige Quest** erhält über ihren Bewertungszeitraum einen zusammenhängenden Rahmen: leuchtend bei Erfolg, gestrichelt bei noch nicht erreichtem Ziel. Bei einem erfolgreichen mehrtägigen Zeitraum erscheint eine Flamme mittig auf dem Rahmen. Monatsansichten trennen lange Rahmen an den Wochenumbrüchen. An einem Glut-Meilenstein sind die Schatztruhe **und** die Flamme sichtbar.
5. **Quest-Menü:** `Heute korrigieren`, `Gestern korrigieren` und `Karten verwalten` sind im neuen **Mehr**-Menü untergebracht. `Neue Quest` bleibt direkt sichtbar. Die Filterleiste steht oberhalb der einmaligen Quests.
6. **Kartenverwaltung:** Linke Namensliste und rechte Miniaturkarten-Galerie zeigen dieselbe Reihenfolge. **Beide** lassen sich durch Halten und Ziehen neu sortieren, wobei das jeweils andere Feld unmittelbar mitsortiert wird. Drag-Vorschau und animierte Verschiebung sind ergänzt. Die vier Sortierbuttons wirken auf beide Ansichten. Die Icons auf Leveln-/Zaubern-Filtern sind ca. 10 % größer.
7. **Große Karten:** Kleines redundantes Leveln-/Zaubern-Icon im Kartenkopf entfernt. Die großen, originalen Hintergrund-SVGs sind ungefähr 10 % größer. Der Drei-Punkte-Bearbeiten-Button bleibt erhalten.

## Besondere Regeln für „Bisherige Erfolge“

- Die rückwirkende Mengenerfassung ist für **wiederkehrende, mengenbasierte Quests** vorgesehen. Bei **einmaligen Abschlussmissionen** bleibt sie ausgeblendet, da diese keine fortlaufenden Tagesziele besitzen.
- Werden zwei Zielarten benutzt, gibt es **Minuten pro Tag** und **Anzahl pro Tag**. Bei Zaubern bedeuten diese Werte tatsächlichen Verbrauch. Ein ausdrücklich eingetragener Verbrauch von null wird als bestätigter Nullverbrauch gespeichert, nicht als unbekannter Wert.
- Ein aktiver Zeitraum umfasst beide Datumsgrenzen. Nicht erfasste Tage werden **nicht als erfunden erfolgreich** markiert; bei Leveln zählen sie als null. Fehlende Zaubern-Verbräuche bleiben unbekannt.
- Für eine **neu erstellte** Quest mit historischen Erfolgen muss `Gültig ab` spätestens heute sein. Bei späteren Bearbeitungen bleibt die ursprüngliche Erstellungsgrenze maßgeblich.
- Bei jeder Korrektur werden nur die eigenen historischen Questformular-Einträge ersetzt; andere Buchungen sind geschützt. Neue und geänderte Einträge werden gemeinsam mit der Quest und der Glut-Historie in einer IndexedDB-Transaktion gespeichert.
- Für große Zeiträume können mehrere Tausend Buchungen entstehen; für ungewöhnlich umfangreiche Nachträge zuerst eine JSON-Sicherung erstellen und die App auf dem iPhone überprüfen.

## Installation auf GitHub Pages

**Vor dem Update unbedingt ein JSON-Backup in der bisherigen Leveln 0.11.2 speichern.**

1. ZIP entpacken und **alle darin enthaltenen Dateien und Ordner** in das Wurzelverzeichnis des bisherigen GitHub-Repositories kopieren. Bestehende Dateien überschreiben. Die neue JS-Datei `pages/quests/history.js`, Kalender- und Sortiermodule sowie Stylesheets müssen mitkopiert werden.
2. Im Repository-Ordner in Git Bash:

```bash
git add -A
git commit -m "Leveln 0.11.3 – Historie, Kalender, Kartenverwaltung"
git push
```

3. Auf die Veröffentlichung durch GitHub Pages achten, dann die **bestehende** installierte Leveln-App öffnen und gegebenenfalls neu laden. **Die iPhone-Home-Bildschirm-App nicht löschen**, denn ihre lokale IndexedDB enthält die Spielstände.
4. Auf dem Gerät zuerst vorhandene Quests, Skills, Streaks, Glut und XP prüfen. Anschließend eine Testquest mit historischem Zeitraum erstellen und die Sortiergesten testen.

Der **Datenbankname `progress-private-v1`**, die Stores und das **Daten-/Backupformat 5** bleiben unverändert. Es ist keine Datenmigration erforderlich; neue optionale Felder an Quests und historischen Tagesbuchungen sind rückwärtskompatibel. Vorhandene XP und frühere Einträge werden beim Update nicht umgeschrieben.

## Testen und Entwickeln

```bash
npm install                # nur beim ersten Mal, für die TypeScript-Parser-Tests
npm run prepare:release    # originalgetreue Inline-SVG-Bibliothek + scripts.json + Offline-Cache
npm test                   # Logik-, Migrations-, Browserstruktur-, SVG- und Historientests
```

Die Original-SVG-Quellen liegen weiterhin unter `assets/icons/mono/`. **Keine Ersatz-SVGs erzeugen**; `assets/icons/inline-library.js` wird daraus generiert. `scripts.json` bestimmt die Script-Ladereihenfolge, `scripts/refresh-sw.cjs` die Cache-Version.

**Teststatus:** Die automatisierten Syntax-, Speichertransaktions-, XP-, Glut-, Datumskonflikt-, Kalenderstruktur-, Icon- und Migrationsprüfungen laufen. Ein **vollständiger Test mit iOS-Safari-Touch-Gesten** und ein vollständiger grafischer Browser-Test konnten hier nicht zuverlässig durchgeführt werden; insbesondere die flüssige Bewegung beider Sortieransichten ist noch auf dem iPhone zu prüfen. Dieses Paket daher vorerst als **Testversion** verwenden.

## Code-Wegweiser

- `pages/quests/history.js`: Erfassung, Validierung, Einmal-Glut, historische Revisionen
- `pages/quests/page.js`: Questformular und neues „Mehr“-Menü
- `pages/quests/calendar-0113.js` und `.css`: Rahmen über Zeiträume und tägliche Flammen
- `pages/kartenverwaltung/page.js`, `manager-0113.css`: synchronisierte Miniaturen und Namensliste
- `src/shared/v010/events.js`: Pointer-DnD, animiertes Verschieben
- `src/shared/domain/erfahrung.js`: Glut-Sperre für die Vorgeschichte; XP weiterhin `xpEvents()`
- `src/styles/v0113.css`: größere Icons, Avatar, Quest-Menü, historische Formularfelder
- `tests/v0113.test.cjs`, `tests/v0113-save.test.cjs`: neue Sicherheits-/Regressionsprüfungen
- `ARCHITEKTUR.md`: vollständige Architektur- und Änderungshinweise
