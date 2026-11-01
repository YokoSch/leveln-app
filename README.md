# Leveln 0.11 – Funktionsupdate auf modularer Grundlage

Diese Version baut auf **Leveln 0.10 modular** auf. Der Code bleibt in eigenständigen Seitenmodulen, gemeinsamen Spielfunktionen und einer gemeinsamen Icon-Bibliothek organisiert. Die größere künstlerische Überarbeitung der Questkarten folgt später.

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
git commit -m "Leveln 0.11 – Karten und Inventar"
git push
```

4. Bestehende Home-Bildschirm-App beibehalten, nach dem GitHub-Pages-Deployment neu öffnen. Bei altem Cache Safari aktualisieren und App erneut starten.
5. Questdaten, XP, Mana, Glut, Navigation und Backups prüfen, bevor die Version produktiv verwendet wird.

### Tests

```bash
node scripts/prepare-release.cjs
npm test
```

Diese Tests decken JavaScript-Syntax, Migrations-/XP-Logik, Mana-Sperre, neue Ansichten und Offline-Ressourcen ab. **Ein vollständiger iPhone-Safari- und Drag-and-drop-Test ist weiterhin offen.** Chromium in der Laufzeitumgebung blockiert das Laden lokaler Webseiten; der erfolgreiche Logiktest ersetzt diesen Gerätetest nicht.

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
