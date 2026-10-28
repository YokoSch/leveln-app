# Progress 0.3 — Play your day

**Lokale iPhone-PWA**, ohne Cloud-Account oder Backend-Datenbank. Zur erstmaligen Bereitstellung und für Aktualisierungen werden ausschließlich die statischen App-Dateien über GitHub Pages geladen. Persönliche Einträge werden über IndexedDB auf dem jeweiligen Gerät gespeichert. Keine Tracker, externen Skripte oder Schrift-CDNs.

## Vor dem Update von 0.1 oder 0.2

1. **Unbedingt zuerst in der alten App unter Einstellungen/Optionen → Backup exportieren eine JSON-Sicherung erstellen.** Datei sicher in der Dateien-App aufbewahren.
2. **Dasselbe Repository und dieselbe GitHub-Pages-Adresse** wie bisher behalten. Progress 0.3 verwendet die bereits existierende Datenbank `progress-private-v1` und dieselben vier Objektspeicher (`activities`, `entries`, `overrides`, `meta`). Vorhandene Einträge werden nicht bei der Installation gelöscht.
3. **Die installierte Home-Bildschirm-App zunächst nicht löschen**, bis die Daten in 0.3 und ein Backup kontrolliert wurden. Neue Home-Bildschirm-Installationen können unter iOS getrennte lokale Speicherbereiche verwenden.
4. Backups aus 0.1/0.2 mit `format: progress-local-backup` und `version: 1` werden unterstützt. 0.3 exportiert weiterhin dieses Format, erweitert aber Einträge/Aktivitäten um optionale Eigenschaften.

## GitHub Pages aktualisieren

Das ZIP entpacken. Die folgenden Dateien **in die Wurzel des bereits existierenden GitHub-Repositories** hochladen und gleichnamige Dateien ersetzen:

```
index.html
app.js
styles.css
sw.js
manifest.webmanifest
icons/icon.svg
icons/icon-180.png
icons/icon-192.png
icons/icon-512.png
```

Bei GitHub Pages weiterhin `Settings → Pages → Deploy from a branch → main → /(root)` nutzen. Wenn das Repository schon veröffentlicht ist, muss Pages nicht erneut eingerichtet werden. Die HTTPS-Adresse bleibt unverändert. Bei altem Cache die PWA schließen, in Safari neu laden und erneut öffnen. Service Worker aktualisiert sich online netzwerkbevorzugt und stellt die bekannten Dateien auch offline bereit.

**Wichtig zum neuen Icon:** Bereits installierte iPhone-Web-Apps übernehmen neue Icons möglicherweise nicht automatisch. Vor dem Entfernen der alten Home-Bildschirm-App unbedingt ein Backup exportieren und die Datensätze in der neuen Installation verifizieren.

## Bedienung

### Heute
- Nur eine große Aktivitätskarte vorn. Bis zu zwei nachfolgende Karten zeigen ihre Titel als sichtbare Stapelstreifen. `x/y` zeigt die Position innerhalb der **noch offenen** Karten.
- **Links/rechts wischen:** offene Karten wechseln. Über die kleinen Pfeile am Datum kann man wochenweise zurück/vor navigieren; die sieben Tagesfelder wechseln den ausgewählten Tag.
- **Nach oben wischen:** Ziel erreicht. Die Karte wird für den Tag ausgespielt. Für *Leveln* werden eindeutig erreichte tägliche Mindestmengen bereits gutgeschrieben. Bei rein wöchentlichen Anzahlzielen gilt ein erfolgreicher Tag als **eine Einheit**.
- **Nach unten wischen:** nicht erreicht. Keine Paketphase und keine unmittelbare XP-Gutschrift.
- Bei einem erfolgreichen Swipe werden passende **Minutenpakete** (`1, 5, 10, 30, 60`) und dann **Anzahlpakete** (`1, 5, 10, 50, 100, 500, 1000`) angeboten. Chips antippen oder mit dem Finger nach oben schleudern. Es gibt ein **×** zum Überspringen jeder Phase.
- Auto-Weiter nach **1–10 Sekunden** Inaktivität, voreingestellt 3 Sekunden; nach jedem erfolgreichen Paket beginnt die Frist nach dessen Animation neu. Während einer Berührung pausiert sie.
- Bereits ausgespielte Karten sind **nur noch in der Zeitleiste** bearbeitbar. Neuanlage direkt über das Plus in Heute; Karte über das `⋯`-Menü bearbeiten.

### Zeitleiste
Tag/Woche/Monat/Jahr/Gesamt. Im Tag-Modus können tatsächliche Minuten/Anzahlen, Status und Kommentare nachgetragen bzw. geändert werden. Aktivitäten lassen sich dort auch bearbeiten und mit ↑/↓ neu sortieren. Nicht vollständig messbare abgeschlossene Wochen-/Monats-/Jahresziele können manuell bestätigt werden. Das Tagesdatum im Verlauf lässt sich rückwirkend bearbeiten.

### Statistik
Erfolgsquote, Zeit- und Anzahl-XP pro Aktivität, laufende und Rekord-Streaks. Die Gesamtübersicht mit Level und Gesamtdaten befindet sich unter **Zeitleiste → Gesamt**.

### Einstellungen
Hell/Dunkel/System, zwei frei einstellbare Akzentfarben (Sparen/Leveln), Countdown 1–10 Sekunden, Sound, Export/Import und Daten löschen.

## XP-Regeln

- **Zeit:** `10 XP` pro Stunde = `Minuten / 6` XP, ohne Rundung bei der Speicherung.
- **1 Level:** `1000 XP`. Start bei `lvl. 1`.
- **Leveln:** Gemessene oder eindeutig bestätigte Minuten zählen als XP. Bei täglichem Mindestziel bringt bereits das erfolgreiche Abhaken die Mindestzeit. Danach verschossene Minuten sind **zusätzliche** Zeit. Bei rein wöchentlichem Zeitziel wird die gesamte Wochenmindestdauer **nicht** automatisch an jedem Tag gutgeschrieben.
- **Anzahl:** Individuell einstellbare `XP je Einheit`, standardmäßig **0**. Immer **zusätzlich** zu Zeit-XP. Bei täglichen Minima wird die Mindestanzahl beim erfolgreichen Abhaken vorgefüllt; Pakete erfassen weitere Einheiten. Bei rein wöchentlichem Anzahlziel zählt das Tageshäkchen eine Einheit.
- **Sparen:** Nur nachgewiesene Ersparnis gegenüber Variante **A**, also dem konfigurierten Maximum. Bei einem Tagesmaximum von 60 min und 30 eingesparten Minuten werden 5 XP vergeben. Ohne exakte Minuten oder explizite Sparpakete keine Spar-Zeit-XP. Das Gleiche gilt für Anzahlen, multipliziert mit den eingestellten XP je Einheit.
- Für **Sparziele ohne tägliches Maximum** (nur Woche/Monat/Jahr) werden die entsprechenden Pakete *nicht* täglich angeboten: Sonst ließe sich das Periodenmaximum versehentlich mehrfach anrechnen. Ein langer Zeitraum kann nachträglich über tatsächliche Tagesmengen vollständig ausgewertet werden. Alternativ zusätzlich ein Tageslimit hinterlegen.
- Tages-Pakete für Sparen sind auf die noch verfügbare Ersparnis begrenzt. Null-Limits vergeben keine positive Ersparnis. Bei zeitlich überlappenden Grenzwerten wird je Messgröße nur der **engste Referenzzeitraum** gewertet (Tag vor Woche vor Monat vor Jahr), innerhalb desselben Zeitraums der strengste Grenzwert.
- Alle XP werden **aus den gespeicherten Werten und Zielversionen berechnet**, nicht bei jeder Geste auf einen Zähler addiert. Änderungen in der Zeitleiste korrigieren auch frühere XP. Die Fortschrittsleiste zeigt **exakt die XP-Quellen des aktuellen Levels** in den beiden ausgewählten Farben.

## Datenschutz und technische Grenzen

- Persönliche Daten werden auf dem Gerät in IndexedDB aufbewahrt. Ein **Backup ist unverschlüsseltes JSON**; es sollte ausschließlich privat und geschützt aufbewahrt werden. **Niemals** die Backupdatei in das öffentliche GitHub-Repository hochladen.
- iOS kann lokale Web-App-Daten entfernen. Backups regelmäßig erstellen und nach Import prüfen. Keine Geräte-Synchronisation.
- Sound und animierte Flugbewegungen funktionieren in der Web-App. **Frei programmierbare Haptik/Vibrationen sind in Safari auf dem iPhone nicht zuverlässig verfügbar**; die App nutzt die Vibrations-API nur, wenn der Browser sie bereitstellt.
- Browseroberflächen, Schriftgrößen und Gerätetypen können sich unterscheiden; vor produktiver Nutzung bitte auf dem eigenen iPhone testen.

## Entwicklungs- und Teststatus

JavaScript-Syntax, mehrere wichtige Abläufe in einem mobilen Chromium-Testharness (Swipe nach oben, Spar-Minutenpaket, kombinierte Leveln-Minuten-/Anzahlziele, XP-Werte, Aktivität erstellen, Zeitleistenänderung, Einstellungen) und die Darstellung in 393×852 sowie 375×667 wurden überprüft. Die Tests verwenden eine simulierte IndexedDB; **ein vollständiger End-to-End-Test auf einem echten iPhone/Safari ist hier noch nicht erfolgt**. Bitte daher zunächst mit Beispieldaten und einem Export testen.
