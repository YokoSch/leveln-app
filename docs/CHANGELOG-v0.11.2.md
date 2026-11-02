# Leveln 0.11.2 – Original-SVG-Fix auf modularer Grundlage

Diese Version baut auf **Leveln 0.10 modular** auf. Der Code bleibt in eigenständigen Seitenmodulen, gemeinsamen Spielfunktionen und einer gemeinsamen Icon-Bibliothek organisiert. Die größere künstlerische Überarbeitung der Questkarten folgt später.

## Korrektur 0.11.2: Original-Icons, keine Ersatzsymbole

Die detaillierten SVGs aus der freigegebenen Leveln-Designbibliothek werden **unverändert** weiterverwendet. Die bisherige Darstellung als externe `mask-image`-Grafik war auf bestimmten Browsern, insbesondere im Safari-Umfeld, problematisch. Stattdessen baut das Projekt aus genau diesen 64 vorhandenen SVG-Dateien (`assets/icons/mono/...`) die Datei `assets/icons/inline-library.js`. Diese bettet die Originalgeometrie direkt in die Oberfläche ein.

- **Keine Vereinfachung oder neu gezeichneten Ersatz-Icons**: Originalpfade und Aussparungen bleiben 1:1 erhalten.
- Farbgebung via `currentColor`: individuelle Quest-, Skill- und Designfarben bleiben möglich; Streak-Flammen leuchten unabhängig vom Modus intensiv orange.
- SVG-interne Masken-IDs werden pro Instanz eindeutig umbenannt, damit mehrfach dargestellte Icons sich nicht beeinflussen.
- Das Kartenleuchten für erreichte Leveln-Ziele und verbleibendes Zauber-Mana wurde nochmals verstärkt.
- Version des Offline-Caches erhöht, damit iPhones nicht versehentlich die alte Icon-Logik weiterladen.
- Die Datenbank **`progress-private-v1`**, Schema **5**, und die Quest-/XP-/Glut-Daten bleiben unverändert.

### Künftige Icon-Änderungen

Die SVG-Dateien unter `assets/icons/mono/` bleiben die **bearbeitbaren Originalquellen**. Nach einer Änderung bitte die Bibliothek neu generieren:

```bash
npm run build:icons
npm run prepare:release
npm test
```

Die generierte Datei `assets/icons/inline-library.js` nicht von Hand verändern. Die App funktioniert ohne Online-Nachladen der Icons.

## Änderungen in dieser Version

- **Karten:** Die provisorischen Randflammen sind entfernt. Ein kräftiges, nutzerfarbenabhängiges Leuchten ersetzt sie; die Streak-Flammen sind in allen Themes leuchtend orange.
- **Fortschritt:** Leveln füllt einen Zielbalken, Zaubern leert den Restmana-Balken. Werte, Einheiten und Kennwertsymbole erscheinen direkt im Balken. Bei unbekanntem Verbrauch erscheint kein irreführender voller Mana-Balken.
- **Icons & Kartenstapel:** Icons und die großen Leveln-/Zaubern-Sigilien sind besser sichtbar. Die beiden hinteren Karten werden als vollständige (nicht vereinfachte) Questkarten gerendert, einschließlich ihrer Kürzel, und ausreichend versetzt. Die gestrige Ansicht ist optisch gedämpft und gekennzeichnet.
- **Kartenverwaltung:** Keine obere X-Schaltfläche; Leveln-/Zaubern-Filter sind unten. Miniaturkarten können direkt verschoben werden; die Sichtbarkeit wird mit einem beschrifteten Kontrollfeld an der Miniatur umgeschaltet. Die bisherige zusätzliche Sortierliste entfällt.
- **Einmalige Quests:** Aktive, nicht ausgeblendete Missionen erscheinen im Leveln-Stapel; das bisherige unabhängige `pinned`-Kennzeichen ist für die Deckauswahl nicht mehr erforderlich. Einmalige Abschlüsse geben die vorhandenen einmaligen XP unverändert genau einmal.
- **Heute:** Doppelte Stapel-Schaltflächen und dauerhafte Wischanweisungen entfernt. Gesten bleiben: ↑ buchen, ←/→ blättern, kurz ↓ Stapelwechsel, lang ↓ Kartenverwaltung.
- **XP & Glut:** Leveln-XP werden weiterhin unmittelbar aus tatsächlichen Buchungen berechnet. Zauber-XP bleiben bis zur abgeschlossenen Bewertung gesperrt. **Keine zusätzlichen Streak-XP.** Eine Schatztruhe im Kalender weist auf eine mögliche oder bereits erhaltene Glut-Belohnung hin.
- **Kalender:** Standardmäßig eingeklappter Wochenkalender; per Knopfdruck wie bisher aufklappbar und frei umschaltbar.
- **Einführung:** Fünfteilige, überspringbare Einführung beim ersten Start einer neuen leeren Installation. Später unter Einstellungen erneut aufrufbar.
- **Charakter:** Glut, Freezes und Anzahl aktiver Quest-Streaks unter dem Charakterprofil. Der Streak-Freeze-Shop befindet sich dort, nicht mehr unter Einstellungen. **Preis bleibt 5 Glut, Maximum 2 Freezes.**

## Datenerhalt und Update

**Datenbankschlüssel und Datenformat bleiben unverändert:** `progress-private-v1`, Schema 5, Backupversion 5. Lediglich ein neuer Metadaten-Eintrag `introCompleted` merkt sich die Einführung. Historische XP, Glut, Streaks, Tagesdaten, Skills und Quests werden nicht konvertiert.

1. Zunächst in der bisherigen App unter Mehr → Backup sichern eine **JSON-Sicherung** erstellen und sicher aufbewahren.
2. Alle Dateien und Unterordner dieses ZIP in das bestehende GitHub-Pages-Repository kopieren. Insbesondere die neuen Dateien in `pages/`, `src/styles/`, `assets/icons/` und `src/shared/ui/` übernehmen.
3. Im lokalen Repository:

```bash
git add -A
git commit -m "Leveln 0.11.2 – Original-SVGs und stärkere Glows"
git push
```

4. Bestehende Home-Bildschirm-App beibehalten, nach dem GitHub-Pages-Deployment neu öffnen. Bei altem Cache Safari aktualisieren und App erneut starten.
5. Questdaten, XP, Mana, Glut, Navigation und Backups prüfen, bevor die Version produktiv verwendet wird.

### Tests

```bash
node scripts/prepare-release.cjs
npm test
```

Diese Tests decken JavaScript-Syntax, Migrations-/XP-Logik, Mana-Sperre, neue Ansichten und Offline-Ressourcen ab. **Ein vollständiger iPhone-Safari- und Drag-and-drop-Test ist weiterhin offen.** Die eingebetteten Original-SVGs wurden zusätzlich in Chromium ohne Netzwerk gerendert und als Bild kontrolliert; die vollständige PWA auf dem iPhone bleibt separat zu prüfen.

### Code-Wegweiser

- `pages/heute/`: Karten, Statusbalken, Stapel und Wischgesten
- `pages/kartenverwaltung/`: Miniaturgalerie, Sortierung, Sichtbarkeit
- `pages/charakter/`: Charakterbogen, Glut-/Freeze-Inventar
- `pages/quests/`: Kalender und Kalendertruhen
- `pages/einstellungen/`: Einführung erneut starten
- `src/shared/domain/`: bestehende XP-, Mana-, Glut- und Streak-Regeln
- `src/shared/ui/intro-shop.js`: neue Einleitung und Freeze-Shop-Dialoge
- `src/styles/v011.css`: neue Ressourcen- und Dialogdarstellung
- `scripts.json`: korrekte Script-Ladefolge; nicht willkürlich verschieben

Siehe außerdem `ARCHITEKTUR.md` für die vollständige Projektstruktur.
