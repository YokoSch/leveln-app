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
