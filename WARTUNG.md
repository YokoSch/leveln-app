# Leveln 0.9 – Wartung und Entwicklungsnotizen

Diese Datei beschreibt **den vorhandenen Stand von Version 0.9**, nicht neue oder geplante Funktionen. Sie dient dazu, die bestehende App bei späteren Anpassungen ohne unbeabsichtigte Nebeneffekte bearbeiten zu können.

## Umfang der Bereinigung (30.10.2026)

- In `app.js` waren mehrere überarbeitete Versionen derselben `function`-Deklarationen nacheinander enthalten. Da JavaScript jeweils die **letzte Deklaration** verwendet, waren die früheren Funktionskörper wirkungslos. Diese überholten Fassungen wurden entfernt.
- Auch zwölf danach nicht mehr referenzierte Funktionskörper wurden entfernt (insgesamt 69 entfernte Funktionsdeklarationen einschließlich der Überschreibungen). Keine aktive Funktion wurde funktional neu geschrieben.
- Die 146 verbleibenden Funktionen wurden formatiert und an zentralen Stellen kommentiert. Zusätzliche Laufzeittests vergleichen die Originaldatei mit der bereinigten Version.
- `styles.css`, `index.html`, Manifeste und alle Icons bleiben unverändert. **Keine visuellen Änderungen.**
- In `sw.js` wurde ausschließlich die Kennung des Offline-Caches geändert, damit installierte Apps die neue Codefassung abrufen; die Cache-Strategie bleibt identisch.
- **Kein Versionssprung:** App 0.9, IndexedDB-Datenformat 4 und JSON-Backupformat 4 bleiben bestehen.

## Dateien

| Datei | Verantwortung |
| --- | --- |
| `index.html` | Einfache Startseite und DOM-Container. `app.js` wird als klassisches Skript geladen. |
| `app.js` | Spielregeln, Datenhaltung, Rendering, Formulare, Karten, Backup und alle Event-Handler. |
| `styles.css` | Alle Ansichten, Karteneffekte und responsives Layout. |
| `sw.js` | Offline-Caching und Aktualisierung der PWA. |
| `manifest*.webmanifest` | Installierbarkeit und Auswahl der bisherigen App-Icons. |
| `icons/` | Bisherige drei Icon-Stile und Auflösungen. |

`app.js` bleibt bewusst **ein klassisches JavaScript-Skript**. Eine Umstellung auf ES-Module könnte globale Bezüge, Ereignisrouten, Offline-Caching und Versionsupdates beeinflussen. Für eine reine Bereinigung wäre das unnötig riskant.

## Datenhaltung: unbedingt stabil halten

- `DB_NAME = 'progress-private-v1'` muss unverändert bleiben. Daten sind an **Origin/Domain + Datenbanknamen** des iPhones gebunden.
- IndexedDB-Object-Stores: `activities`, `entries`, `overrides`, `meta`, `skills`. Die `meta`-Datensätze sind über `key` indiziert, die übrigen über `id`.
- `S` hält den aktuellen Laufzeitstatus, `EM` dient dem Zugriff auf Tagesdatensätze. `sync()` lädt aus der Datenbank neu; `dbPut()`/`dbTx()` schreiben Daten.
- Die vorhandene Migration darf **ausschließlich Schema 3 → Schema 4** durchführen: `migrateV08toV09()` / `migrateInstalled()`.
- `importBackup()` akzeptiert weiterhin ausschließlich die bereits in 0.9 unterstützten **Backupversionen 3 und 4**; `exportBackup()` schreibt Version 4. Keine zusätzlichen Migrationsstufen ohne Auftrag des Nutzers.
- Vor Datenformatänderungen Backup und unveränderte Originaldatei aufbewahren. Bei Änderungen an Quests stets die historische Zuordnung von Regeln, Skill-XP und Tagesdaten beachten.

## Einstiegspunkte und wichtige Funktionen

| Thema | Hauptfunktionen | Worauf beim Weiterentwickeln achten? |
| --- | --- | --- |
| Start, Datenbank | `setup()`, `dbOpen()`, `sync()`, `dbTx()` | Kein Zurücksetzen bestehender Daten. |
| Migrationsweg | `migrateV08toV09()`, `migrateInstalled()`, `importBackup()`, `validateBackup()` | Nur den ausdrücklich gewünschten Vorversions-Pfad unterstützen. |
| Questregeln und Zeiträume | `revision()`, `rules()`, `goals()`, `periods()`, `assessment()`, `reconcile()` | Echte Buchungen und Periodenabschlüsse auseinanderhalten. |
| XP und Streaks | `xpEvents()`, `xpStats()`, `skillXp()`, `stData()`, `reconcileWallet()` | Keine Doppelverbuchung. Zauber-XP erst zum Periodenabschluss. |
| Karten | `todayView()`, `cardHtml()`, `cardDraft()`, `startCard()`, `updatePlayAmount()` | Karten bleiben Buchungswerkzeuge; Beträge werden addiert. |
| Mana-Check | `recordedConsumption()`, `checkinItems()`, `checkinModal()`, `maybeCheckin()` | Unbekannte Mana-Mengen nicht schätzen. |
| Quests und Kalender | `goalsView()`, `calendarHTML()`, `goalGroups()`, `saveGoal()` | Archiv und historische Daten intakt lassen. |
| Charakter / Skills | `characterView()`, `profileModal()`, `skillModal()`, `deleteSkill()` | Gesamte Charakter-XP bei Skillaktionen bewahren. |
| Statistik | `statsView()`, `xpStats()`, `statEvents()` | Keine doppelt gezählten Skill-XP. |
| Icons | `PATH`, `ICON_GROUPS`, `openIconGallery()`, `renderIconGallery()` | Ein gemeinsamer Icon-Pool. |
| Hauptnavigation | `render()`, `nav()`, `handleAction()` | Klicks werden über `data-act` delegiert. |
| Backup | `exportBackup()`, `importBackup()` | Import validieren und atomar speichern. |

### Warum einige Namen noch „05“ enthalten

`handleAction05()` und weitere ältere Hilfsroutinen sind **nicht automatisch totes Programm**: Die aktuelle Aktionsverarbeitung verwendet einzelne dieser Funktionen weiterhin als Fallback. Deshalb wurden nur sicher überschriebene bzw. nicht referenzierte Definitionen entfernt. Eine spätere vollständige Umbenennung/Neuorganisation muss getrennt und mit umfassenden UI-Regressionstests erfolgen.

### CSS-Kaskade

`styles.css` enthält thematisch gruppierte Abschnitte für die Entwicklung von 0.5 bis 0.9. Spätere Regeln überschreiben teils bewusst frühere Regeln. Die Styles wurden daher nicht zusammengeführt oder neu sortiert: Schon eine scheinbar harmlose Umordnung könnte das Erscheinungsbild auf iPhones verändern. Die vorhandenen Abschnittskommentare markieren die Schichten.

## Prüfungen dieser Bereinigung

1. Die bereinigte Datei besteht `node --check`.
2. AST-Vergleich mit dem Original: **146 aktive Funktionskörper unverändert** und **79 nicht-funktionale Top-Level-Anweisungen unverändert** (Kommentare/Formatierung ausgenommen).
3. Vergleich in getrennten JavaScript-Laufzeitumgebungen: **31 Ergebnisvergleiche** für Leerdaten, eine wiederkehrende Quest, Ansichten und das Schema-3-zu-4-Migrationsbeispiel sind identisch.
4. ZIP-Inhalt, Icon-Dateien und Manifeste auf Vollständigkeit prüfen.

**Grenze:** Keine vollständige Safari-/iPhone-E2E-Simulation. Deshalb empfiehlt sich wie vor jedem GitHub-Pages-Update ein JSON-Backup sowie ein kurzer Test der installierten App.

---

# Ergänzung: Leveln 0.10 · 31.10.2026

Der vorstehende Teil dokumentiert weiterhin den bereinigten **0.9-Kern**. Version 0.10 führt die folgenden Erweiterungen ein.

## Projektstruktur und Start

- `app.js` bleibt als klassisches Skript mit Gameplay, vollständigen Bestandsdaten und Event-Handlern. Ein direkter Start am Ende von `app.js` wurde entfernt, damit `v010.js` anschließend **vor** der Initialisierung geladen wird.
- `v010.js` überschreibt deklarierte UI-Funktionen bewusst in der klassischen JS-Globalumgebung (`ico`, `art`, `render`, `setup`, `editGoalModal`, `saveGoal`, `saveSkill`, `todayView`, `startCard`, `rotate`, `goalsView`, `statsView`, `settingsView`, `exportBackup`, `importBackup`, `handleAction`, `renderIconGallery`). Solange die Erweiterung besteht, **keine eigenständige Umstellung nur eines Skripts auf `type=module`** vornehmen.
- `styles-010.css` folgt auf `styles.css`. `theme/palette.js` und `theme/designkit.js` stehen vor `app.js` und `v010.js`.
- `setup()` wird erst ganz am Ende von `v010.js` aufgerufen. `__LEVELN_UNIT_TEST__` unterdrückt den automatischen Start nur für den isolierten Node-Logiktest.

## Persistenz, Migration und Revisionslogik

- Bestehende IndexedDB-ID/Store-Namen behalten, weiterhin `activities`, `entries`, `overrides`, `meta`, `skills`.
- Datenformat/Backupformat **5**. `migrateV09toV010` ergänzt `cardShown`, `deckOrder`, `statisticColor` bei Aktivitäten und `statisticColor` bei Skills, ohne alte Zeit-/Anzahlwerte oder `skillRates` zu überschreiben.
- Migrationsschritte **nur von Format 4**, keine rückwirkenden Schritte 1–3 anlegen, solange nicht ausdrücklich beauftragt.
- Ein eigener `statisticColor` ist nicht die Kartenfarbe. Kartenfarben bleiben nutzergesteuert. Der Farbabstand wird mit näherungsweisem OKLab-Maximin bei Vergabe der Statistikfarbe berechnet; beim Rendern wird nichts automatisch neu zugewiesen.
- Änderung von Zeit-/Anzahl-Skill-XP erzeugt wie bisher eine neue Questrevision für die Zukunft. XP wird aus den tatsächlichen `entries` und der jeweiligen Revision abgeleitet. Keine zusätzliche XP-Gutschrift beim Wischen führen.
- Die Kartenmenge kann über die Plus-/Minus-Tasten verändert werden. Die bestehende Routine `updatePlayAmount` speichert diesen Standard; `bookingFields` addiert die gewählte Menge zum Tagesdatensatz.

## Wichtige 0.10-Einstiegspunkte

| Bereich | Funktionen |
| --- | --- |
| Erststart und Migration | `setup`, `migrateV09toV010`, `migrateInstalled`, `importBackup` |
| Design und Nutzerfarben | `lv10Skin`, `applyTheme`, `lv10Paint`, `LevelnPalette10` |
| Iconzuordnung | `ICON_MAP10`, `ico`, `art`, `renderIconGallery` |
| Questerstellung | `editGoalModal`, `lv10MetricTable`, `lv10RateRow`, `lv10ReadBindings`, `saveGoal` |
| Statistikfarben | `lv10DistinctColor`, `lv10NewStatColor`, `lv10StatisticColor`, `lv10SkillStatisticColor` |
| Deck und Buchungen | `lv10DeckGoals`, `lv10DeckSelect`, `cardHtml`, `todayView`, `startCard` |
| Kartenverwaltung | `lv10ManagerOpen/Close/Render`, `lv10SaveDeckOrder`, `lv10SortDeck`, `lv10ToggleCard` |
| Statistik | `lv10StatValue`, `statsView` |
| Beschleunigte Steppers | `lv10StepAmount`, `lv10HoldTick`, `lv10HoldStop`, Pointer-Event-Capture in `v010.js` |

## Änderungen an den Event-Handlern des 0.9-Kerns

Die Dokument-Pointer-Listener für das Wischen sind weiterhin in `app.js`, nutzen aber für Version 0.10 folgende Ergebnisse: **hoch = buchen ohne automatische Rotation**, **links/rechts = rotieren**, **kurz runter = anderen Stapel wählen**. Der längere Abwärts-Hold sowie die Mengensteuerung werden in `v010.js` per Capture-Handler implementiert. Bei Gestenänderungen **immer beide Dateien** ansehen, um widersprüchliche Listener zu vermeiden.

## Tests und Veröffentlichung

```bash
node --check app.js
node --check v010.js
node --check theme/palette.js
node tests/logic.test.cjs
```

Außerdem prüfen, dass alle `ASSETS` in `sw.js` tatsächlich vorhanden sind. Bei Updates `CACHE` erhöhen. Ein lokal laufender Node-Test ersetzt ausdrücklich **keinen iPhone-/Safari-Integrationstest**. Vor jedem Deployment aus 0.9 ein Backup anlegen und auf derselben GitHub-Pages-Origin bleiben.
