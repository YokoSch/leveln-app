# Leveln 0.10 – Architektur und Wartung

> **Stand:** 31. Oktober 2026. Dieser Stand reorganisiert die bestehende Leveln-0.10-App. **Keine neuen Spielfunktionen, keine neue Datenbankschema-Version.**

## 1. Grundprinzip

Leveln ist eine **installierbare Single-Page-Web-App (PWA)**. Die URL und der Startpunkt bleiben **`index.html`**. Ein echter Seitenwechsel mit mehreren vollständigen HTML-Dokumenten wäre für den aktuellen Zustand riskant, da App-Status, Gesten, Event-Handler, IndexedDB und Navigation während der Bedienung erhalten bleiben sollen.

Deshalb gibt es pro Hauptseite einen **eigenen Ordner mit `page.html`, `page.js`, `page.base.js` und – wo sinnvoll – CSS**:

- `page.html` ist die tatsächliche, beim Start geladene **HTML-Seitenvorlage**. Sie besitzt den Marker `{{LEVELN_CONTENT}}`.
- `page.js` implementiert die Ansicht und ihre v0.10-spezifischen Funktionen. Die DOM-Elemente (Karten, Buttons usw.) werden derzeit über JavaScript-HTML-Templates erzeugt, damit ihre bestehenden Interaktionen unverändert bleiben.
- `page.base.js` enthält weiterhin benutzte 0.9-Kompatibilitätsfunktionen, etwa Kalender und Questarchiv. Überholte Funktionen, die 0.10 überschreibt, wurden entfernt.
- Styles liegen in Seitenordnern, damit Karten, Formulare und Statistiken unabhängig gepflegt werden können.

**Wichtig:** Das ist eine *risikoarme modulare Zwischenarchitektur*; noch **kein vollisoliertes ECMAScript-Modulsystem mit `import/export`**. Klassische Skripte teilen sich bewusst den bisherigen globalen Lexikalraum. Die Ladefolge wird in `scripts.json` festgelegt und darf nicht zufällig geändert werden. Eine spätere Umstellung auf explizite ES-Module sollte als eigener, getesteter Refactoring-Schritt erfolgen.

## 2. Verzeichnisstruktur

```text
index.html                    # Einziger PWA-Einstiegspunkt
scripts.json                  # Verbindliche Script-Ladereihenfolge
sw.js                         # Offlinecache; aus Dateistruktur generierbar
styles.css                    # Unverändertes Bestands-CSS als Kompatibilitätsschicht
manifest*.webmanifest         # PWA-Metadaten und Icon-Varianten
pages/
  heute/
    page.html                 # HTML-Seitenvorlage Heute
    page.js                   # V0.10: zwei Decks, Anzeigen, Mana/Karten
    page.base.js              # Bestandsfunktionen, Check-in, Kartenwerte
    deck.css                  # Kartenstapel
    stepper.css               # Plus/Minus
    flammen.css               # Effekt-/Statusrahmen
  quests/
    page.html
    page.js                   # Tabellen für Zeit und Anzahl, Questboard
    page.base.js              # Kalender, historische Quests etc.
    formular.css
  charakter/
    page.html
    page.js                   # Aktuelles Skill-Speichern
    page.base.js              # Charakterbogen, Avatar, weitere Skill-Funktionen
  statistik/
    page.html
    page.js                   # Skillfilter / Statistik
    page.base.js              # Zeitraum und Auswertungs-Helfer
    stats.css
  einstellungen/
    page.html
    page.js                   # Aktuelle v0.10-Ansicht
    page.base.js              # Bestandsoptionen und Upload
  kartenverwaltung/
    page.html                 # Dokumentierte Vollbild-Overlay-Struktur
    page.js                   # Drag & Drop, Sichtbarkeit, Sortierung
    manager.css
src/
  app/
    page-frames.js            # Lädt Seitenvorlagen und setzt dynamische Inhalte ein
    navigation.js             # Aktueller Render-/Aktionsverteiler
    navigation.base.js        # Alte Navigations-Helfer
    start.js                  # EINZIGER App-Start nach allen JS-Modulen
  shared/
    runtime.js                # S, DB_NAME, globale Dienstvariablen
    data/database.js          # IndexedDB + Bestandsmigration
    domain/zeitraum.js        # Kalenderperioden, Ziel-/Tagesdatensuche
    domain/erfahrung.js       # XP, Mana, Glut, Streaks, Outcomes
    ui/elemente.js           # Gemeinsame UI-Helfer, Toasts, Icons
    ui/dialoge.js            # Gemeinsame Dialoge, Aktionen
    ui/icon-galerie.js       # Iconauswahl
    compat/events.js         # Ursprüngliche Ereignislistener
    v010/                    # v0.10-Erweiterungen für DB, UI, Farben, Gesten
  styles/
    v010-base.css             # Gemeinsames Oberflächenthema
    v010-finish.css           # Später zu ladende bereichsübergreifende Regeln
assets/icons/mono/            # 63 monochrome SVG-Assets in Kategorieordnern
assets/flame-tiling.svg       # Flammenmaske
icons/                       # App-Logos (hell/dunkel/mono)
theme/                       # Themepalette, Designkit und CSS-Token
tests/                       # Regressions- und Architekturtests
scripts/                     # Release-/Cache-Helfer
```

## 3. Verantwortlichkeiten: Wo ändere ich was?

| Aufgabe | Einstiegspunkt | Weitere Dateien |
|---|---|---|
| Karte, Betrag/Minuten, Swipe | `pages/heute/page.js` | `page.base.js`, `stepper.css`, `deck.css` |
| Flammen und Kartenrahmen | `pages/heute/flammen.css` | `theme/effects.css`, `theme/palette.js` |
| Quest erstellen, bearbeiten, XP-Tabelle | `pages/quests/page.js` | `formular.css`, `src/shared/v010/database.js` |
| Kalender, Filter und Questarchiv | `pages/quests/page.base.js` | `pages/quests/page.js` |
| Charakter, Skills | `pages/charakter/page.base.js` | `pages/charakter/page.js` |
| Statistik, Skillfilter, Farbabstände | `pages/statistik/page.js` | `src/shared/v010/theme.js` |
| Einstellungen | `pages/einstellungen/page.js` | `page.base.js`, `theme/` |
| Kartenreihenfolge und Sortiermenü | `pages/kartenverwaltung/page.js` | `manager.css` |
| XP-, Mana- und Streakregeln | `src/shared/domain/erfahrung.js` | `src/shared/domain/zeitraum.js` |
| Speicherung und Migration | `src/shared/data/database.js` | `src/shared/v010/database.js` |
| Globale Aktionen, Navigation | `src/app/navigation.js` | `src/shared/ui/dialoge.js` |
| Icons, Bildassets | `assets/icons/mono/` | `src/shared/v010/assets.js`, `theme/assets.css` |
| PWA-Installation und Offlinecache | `index.html`, `sw.js` | `scripts/prepare-release.cjs` |

## 4. Prinzip einer Seite

`pages/quests/page.html` enthält das Seiten-Slot für die Questliste. `pages/quests/page.js` erzeugt die dynamischen HTML-Elemente über `goalsView()` und `editGoalModal()`. `src/app/navigation.js` ruft die entsprechende Ansicht auf. `src/app/page-frames.js` lädt und umschließt die HTML-Ansicht mit dem Slot. Dieser verwendet `display: contents` und verändert dadurch **nicht** die Höhe oder den Scroll-/Sticky-Kontext der Seite.

Die v0.10-Ansichten nutzen derzeit noch bewusst Funktionsdeklarationen mit gemeinsamen Namen wie `goalsView()` und `render()`. Die alte, nicht mehr benutzte Version dieser Deklarationen wurde entfernt. Ändere bitte nicht blind die Reihenfolge im Manifest.

**Warum kein echtes `quests.html` als eigenständige URL?** Weil ein URL-Wechsel die JavaScript-Laufzeit und das aktive Kartendeck neu starten würde und die bisherige IndexedDB-/Serviceworker-Integration anders behandeln müsste. Für eine App mit fünf Reitern ist die SPA-Navigation aktuell robuster.

## 5. Datenvertrag und Migration

- Datenbankname: **`progress-private-v1`**, unverändert.
- IndexedDB: `activities`, `entries`, `overrides`, `meta`, `skills`, unverändert.
- App-Stand: **0.10**, Daten- und Backupformat **5**.
- Explizite Datenmigration: **0.9 / Schema 4 → 0.10 / Schema 5**, keine zusätzliche historische Import-Unterstützung.
- Tagesdaten, XP-Ereignisse, Streaks, Glut, Freeze, Zauber-Mana, Skill-Zuordnungen **nicht stillschweigend neu schreiben**.
- `src/shared/domain/erfahrung.js` und `src/shared/v010/database.js` sind **kritische Teile**. Jede Änderung dort braucht Regressionstests.

Der Umbau auf diese modulare Struktur ist **rein technisch** und erfordert **keine neue Datenbankmigration**.

## 6. CSS und Nutzerthemes

Die Stylesheets werden von `index.html` in einer **festen Reihenfolge** geladen. Das alte `styles.css` wurde nicht in Selektoren zerlegt, weil dabei die CSS-Kaskade leicht geändert werden kann. Die nachträglich eingeführten v0.10-Regeln wurden entlang ihrer ursprünglichen Themenabschnitte getrennt. Das Farbsystem bleibt in `theme/palette.js`; Karten- und Iconfarben leiten sich daraus dynamisch ab. Keine fest eingefärbten SVG-Duplikate nötig.

## 7. Entwicklung und Release

1. Nur den betreffenden Seitenordner und die benötigten Shared-Funktionen bearbeiten.
2. Wenn eine neue JS-Datei hinzukommt, **`scripts.json`** anpassen (vor `src/app/start.js`).
3. Wenn neue CSS-Dateien hinzukommen, **`index.html`** in der korrekten Kaskadenreihenfolge anpassen.
4. Vor jedem GitHub-Pages-Update aus dem Projektordner:

```bash
node scripts/prepare-release.cjs
node tests/architecture.test.cjs
node tests/logic.test.cjs
node tests/css-regression.test.cjs
```

5. `sw.js` erhält dadurch eine aktualisierte Liste aller Offline-Ressourcen; **die Cache-Version in `scripts/refresh-sw.cjs` muss bei weiteren Releases geändert werden**. Die bestehenden Datenbanknamen bleiben erhalten.
6. App auf iPhone testen; besonders Gesten, Serviceworkerwechsel und ältere Backups.

Das Projekt benötigt **keinen Bundler** und keine externen JavaScript-Abhängigkeiten für den Betrieb. Für die Entwicklung nutzt `tests/architecture.test.cjs` das TypeScript-Parserpaket, das im Produktionsbetrieb **nicht** benötigt wird. Wenn es auf deinem Rechner noch fehlt, installiere die Entwicklungswerkzeuge einmalig via `npm install` (`package.json` enthält die Test-Abhängigkeit). Danach genügt `npm test`.

## 8. Bekannte Grenzen

- Alte 0.9-Kompatibilitätsfunktionen, die noch aktiv benutzt werden, liegen in `page.base.js` oder `src/shared/compat/`. Sie sollten erst nach gezielten Tests in moderne, explizit importierte Module umgebaut werden.
- Die `page.html`-Dateien sind reale, geladene HTML-Slots; der überwiegende variable HTML-Inhalt wird noch aus `page.js` erzeugt. Ein vollständiges Umstellen sämtlicher UI-Strukturen auf statische HTML-Templates wäre ein **gesondertes Refactoring**.
- Die interaktiven Browser-/iPhone-Gesten konnten nicht vollständig automatisiert durchgespielt werden; es gibt Logik- und Strukturtests.

## 0.11 – Erweiterungsnotizen

Die v0.10-Dateinamen in `src/shared/v010/` bleiben absichtlich unverändert, damit der globale Ladevertrag stabil ist. Neue visuelle Regeln liegen in `pages/heute/page-011.css`, `pages/kartenverwaltung/manager-011.css` und `src/styles/v011.css`. Die einzige neue Logikdatei ist `src/shared/ui/intro-shop.js`, in `scripts.json` vor `src/app/navigation.js` geladen.

**XP-Single-Source-of-Truth:** `xpEvents()` bleibt die Berechnungsgrundlage. Die neuen Balken greifen nur auf `assessment()`/`ruleValue()` zu; sie buchen kein XP. Die Kalendertruhe `lv11ChestDay()` stellt potentielle oder bereits erhaltene Belohnungen dar, schreibt aber niemals Glut gut. Dies erledigt weiterhin allein `reconcileWallet()`.

**Kartensichtbarkeit:** Ab 0.11 ist `cardShown` das einzige maßgebliche Feld für die Deckmitgliedschaft, auch bei einmaligen Quests. `pinned` wird für Bestandsdaten toleriert, aber nicht mehr für die Auswahl herangezogen. Kein Datenbankschemawechsel erforderlich.

**Einführung:** `introCompleted` ist ein optionales Meta-Flag. Bei Migration oder bestehenden Spielständen erfolgt kein automatisches Tutorial. Neue leere Installationen sehen den Dialog einmal und können ihn später über Einstellungen öffnen.

## Ergänzung Leveln 0.11.2: SVGs und iOS-Safari

Die fertig gestalteten SVGs unter `assets/icons/mono/` sind die einzigen Quellen der Icon-Geometrie. Es gibt **keine vereinfachten Ersatzsymbole**. Beim Release wird mit `scripts/build-icons.cjs` eine `assets/icons/inline-library.js` generiert. Deren `LevelnSvgArtwork.render()` fügt die Original-SVGs direkt in den DOM ein. Die bisherigen externen CSS-Masken (`mask-image: url(...)`) werden nicht mehr zur Icon-Darstellung benötigt.

Die Originaldateien enthalten teilweise `<mask id="...">`-Elemente. Bei mehreren Icon-Instanzen könnten gleichnamige SVG-IDs kollidieren. Deshalb versieht der Renderer alle lokalen IDs und die zugehörigen `url(#...)`-Referenzen mit einem eindeutigen Suffix. Die grafischen Pfade, Silhouetten und Aussparungen bleiben unverändert. Die Färbung erfolgt über das originale `currentColor` und die bisherigen Designtokens.

**Release:** `npm run prepare:release` generiert Icons, `index.html` und den Offline-Cache. `npm test` prüft alle 64 Originaldateien auf unveränderte Geometrie und eindeutige IDs. `scripts.json` lädt die Bibliothek vor `src/shared/v010/assets.js`; diese Reihenfolge ist erforderlich. Die IndexedDB-Datenbank und Schema 5 werden nicht migriert.
