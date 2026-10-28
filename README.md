# Progress 0.4 — Play your day

Private, lokal speichernde iPhone-Web-App (PWA). **Version 0.4, 28. Oktober 2026.**

## Unbedingt vor dem Update

1. In deiner **bisherigen installierten Progress-App** unter **Optionen → JSON-Backup exportieren** eine Sicherung erstellen und in **Dateien → Auf meinem iPhone** (oder an einem anderen selbst gewählten sicheren Ort) ablegen.
2. Die **bestehende Home-Bildschirm-App nicht löschen**. iOS kann getrennte lokale Datenbereiche für verschiedene Installationen verwenden.
3. Das ZIP entpacken und die Dateien in das **gleiche öffentliche GitHub-Repository**, in **das gleiche Verzeichnis** wie bisher hochladen (Ordnerstruktur erhalten):

```
index.html
app.js
styles.css
sw.js
manifest.webmanifest
icons/icon-180.png
icons/icon-192.png
icons/icon-512.png
icons/icon.svg
```

4. Unter GitHub Pages dieselbe HTTPS-Adresse weiterverwenden. Die PWA schließen und erneut öffnen. Wegen Safari-/Service-Worker-Cache kann ein weiterer Online-Neustart nötig sein.
5. Aktivitäten und Einträge kontrollieren. **Erst danach** weiterverwenden. Für einen möglichen Rückweg die alte ZIP-Datei und das ursprüngliche Backup behalten.

**Privat:** Deine persönlichen Tagesdaten/Kommentare bleiben in IndexedDB auf dem iPhone. Über GitHub Pages werden nur die statischen HTML-, CSS-, JavaScript- und Icon-Dateien bereitgestellt. Keine Drittanbieter-CDNs, kein Login und keine externen Analyse-Skripte. **Ein JSON-Backup ist unverschlüsselt**; bitte niemals ins öffentliche GitHub-Repository hochladen.

## Bedienung

### Heute – Tageskarten

- Pro Zielregel gibt es **jeden Tag** eine Karte – auch für Wochen-, Monats- und Jahresziele.
- **Links/rechts wischen** wechselt die Karte; die vordere Karte und zwei angedeutete Folgekarten bilden den Stapel.
- Bereits erfasste Karten **bleiben vorhanden**, werden grau und lassen sich erneut ausspielen oder über das Drei-Punkte-Menü bearbeiten.
- **Leveln:** nach oben = etwas getan → Minuten-/Anzahlpakete für **tatsächliche Mengen**; nach unten = nichts gemacht (0). Bei einem *täglichen* Levelziel ohne Paketangabe bestätigt das Überspringen die Tages-Mindestmenge; bei mehrtägigen Zielen ist ein expliziter Standardwert pro Tag optional.
- **Sparen:** nach oben = vollständig verzichtet (0 Verbrauch); nach unten = etwas verbraucht → Minuten-/Anzahlpakete für den **tatsächlichen Verbrauch**. Ohne weitere Paketangabe wird das Tageslimit bzw. ein anteilig geschätztes Mehrtagesbudget angenommen.
- Paket-Chips antippen oder nach oben schleudern. Paketmenüs gehen automatisch nach **1–10 Sekunden** weiter (Standard: **3 Sekunden**) oder lassen sich mit **×** schließen.
- Die Datums-Drehtrommel unter dem Deck lässt sich nach links und rechts verschieben, Tage können angetippt werden. Nur **heute und gestern** sind bearbeitbar.
- Erfasste Mengen werden gespeichert und korrigiert, statt bei wiederholten Gesten XP zu verdoppeln.

### Ziele – Kalender und Verwaltung

- Ziele sind gruppiert in **Tages-, Wochen-, Monats- und Jahresziele**. Namen und Streaks sind zunächst kompakt; Details aufklappen.
- Oben befindet sich ein **fixierter, aufklappbarer Kalender** mit Wochen-, Monats-, Jahres- und Vierjahresdarstellung.
- Wähle ein Ziel: Die Kalenderflammen markieren erfolgreiche Perioden; Schneeflocken markieren geschützte Unterbrechungen. Jedes Ziel kann eine eigene Akzentfarbe erhalten.
- Ein Kalendertag öffnet das **schlichte Tagesprotokoll** (Status, Minuten, Anzahl, Kommentar). Tage vor gestern lassen sich nur betrachten.
- Ziele können ab heute geändert und archiviert werden; ältere Einträge bleiben erhalten. Beim Ändern des Zeitraums mitten in einer laufenden Periode die neue Periodenberechnung besonders kontrollieren.
- *Kalendergebunden* (Mo–So, Kalendermonat oder Kalenderjahr) und *Neustart-Perioden* (7, 30, 365 Tage) stehen zur Wahl. Ein Neustart-Zeitraum beginnt nach einer vorzeitigen **Überschreitung** am Folgetag neu.

### Streaks, Glut und Freeze

- Ein Zielzeitraum erhöht die Streak, sobald die erforderliche Menge erreicht bzw. das Maximum eingehalten wurde.
- **1 Glut** je **10 tatsächlich erfolgreichen Streak-Schritten**; dieselbe Belohnung wird nicht mehrfach vergeben.
- **5 Glut = 1 Freeze**; maximal **2 im Inventar**.
- Ein vorhandener Freeze wird bei einem nach Ende der Korrekturfrist festgestellten Bruch einer laufenden Streak automatisch verbraucht. Eine bewusste Sofort-Rettung mit 5 Glut ist bei ungeschützten Brüchen in der Zielverwaltung möglich.
- Ein Freeze schützt die Streak, verwandelt einen Fehlschlag aber nicht in einen Erfolg. Er zählt nicht selbst als zusätzlicher Streak-Schritt.

### Check-in und feste Frist

- Die App fordert beim Öffnen das Nachtragen **offener Einträge von gestern** ein; ab deiner einstellbaren Uhrzeit auch die offenen Einträge von heute. Der Check-in wird durch Nachtragen oder bewusstes Verweigern abgeschlossen.
- Ohne Öffnen werden ältere offene Einträge beim nächsten Start automatisch mit **konservativen Ersatzwerten** abgeschlossen. Leveln: 0. Sparen: Tagesbudget bzw. geschätzter Tagesanteil. Ersatzwerte sind in den Daten als geschätzt markiert und zählen nicht zu tatsächlich gemessenen Leistungen.
- **Heute und gestern** sind bearbeitbar. Danach sind die Datensätze gesperrt und der Blick richtet sich nach vorne.
- Die PWA kann **ohne zusätzlichen Server keine verlässlichen Push-Nachrichten senden, wenn sie geschlossen ist**. Für externe Erinnerungen eignet sich optional eine iPhone-Kurzbefehle-Automation.

### Statistik

- Säulendiagramme zu **tatsächlich gesparter/gelevelter Zeit**, **Anzahlen** und **XP**, mit den konfigurierten Farben für Sparen und Leveln.
- Filter: **Alle Ziele oder ein einzelnes Ziel**, und **Kalendertag, Kalenderwoche, Kalendermonat, Kalenderjahr oder Gesamtzeitraum**. Mit den Pfeilen kann man zum nächsten oder vorherigen Kalenderzeitraum wechseln. Laufende Perioden zeigen den *bisherigen* Stand.
- Für Zeit gilt **10 XP pro Stunde**. Zusätzliche Anzahl-XP werden separat berücksichtigt und **nicht als tatsächlich verbrachte Stunden ausgegeben**.

## Technischer Aufbau

- PWA mit Manifest und Service Worker, Offline-Caching statischer Ressourcen.
- IndexedDB `progress-private-v1`, Stores `activities`, `entries`, `overrides`, `meta` – gleiche Speicheradresse und Stores wie 0.3.
- Bestehende 0.3-Einträge können weitergelesen werden, neu erfasste Einträge liegen zusätzlich pro Zielregel getrennt vor.
- Export/Import per `progress-local-backup`, Version 1; inkl. Glut/Freezes in den Metadaten.
- Unbekannte Messwerte bleiben von 0 unterscheidbar. Feste Frist orientiert sich am **lokalen Kalenderdatum des Geräts**, nicht an exakt 48 Stunden.

## Teststatus und Grenzen

JavaScript-Syntax und wesentliche Abläufe wurden geprüft; die Interaktion, Tageskarten, Zielanlage, Teil-XP, Wochenneustart und einmalige Glutvergabe wurden in einer Chromium-Testumgebung mit **simulierter IndexedDB** ausprobiert. Der vollständige Test mit echter IndexedDB, Service Worker und **Safari auf deinem iPhone** ist noch ausstehend. Bitte die Version nach einem Backup erst mit einigen Beispieldaten testen. Vergangene Zieländerungen und manuelle Rettungen nach komplexen Korrekturen möglichst mit kontrollierten Daten prüfen.

Ein Service Worker kann bei einem Update kurzzeitig noch alte Dateien zeigen; dann PWA einmal online schließen und erneut öffnen. Um die Daten nicht zu verlieren, niemals leichtfertig App-/Website-Daten löschen.
