# Leveln 0.9 – iPhone-Web-App (PWA)

Die neue Version baut auf **Leveln 0.8** auf. Daten liegen lokal auf deinem Gerät in IndexedDB, nicht auf einem Server. Der Datenbankname und der Speicherort bleiben gleich.

## Installation / Update auf dem iPhone

1. **Unbedingt vorher** in Leveln 0.8 unter **Mehr → Backup sichern** ein JSON-Backup anlegen und außerhalb der App aufbewahren.
2. ZIP entpacken und alle Dateien aus `Leveln-v0.9-iPhone-App/` inklusive `icons/` auf denselben GitHub-Pages-Webpfad hochladen, auf dem v0.8 lief. Die URL bzw. die Domain nicht ändern, sonst ist der lokale Datenstand nicht zugänglich.
3. Die Seite in Safari neu laden; eine ggf. installierte Home-Bildschirm-Verknüpfung weiterverwenden. Bei Bedarf die Seite nach dem Update zweimal laden, damit der neue Service Worker alle Dateien aktualisiert.
4. Der Start migriert vorhandene Daten im selben Browser automatisch von **Schema 3 (v0.8)** auf **Schema 4 (v0.9)**. Alternativ lässt sich das Backup aus v0.8 importieren. Ältere Backups/Versionen werden nicht mehr unterstützt.

**Wichtig:** Das Löschen der Website-Daten, der Wechsel zu einer anderen Domain oder das Entfernen der Safari-Daten kann die lokal gespeicherten Einträge beseitigen. Regelmäßig Backups erstellen.

## Änderungen in v0.9

- Karten glühen passend zur Questfarbe. Leveln hat ein Pixel-Emblem, Zaubern ein Runenzeichen statt eines doppelten Manasymbols.
- Einmalige Quests erscheinen einzeilig im Questboard. Mit einem horizontalen Swipe werden „Bearbeiten“ und „Archiv“ sichtbar; „Abschließen“ bleibt direkt in der Zeile.
- „Neue Quest“ ist im Questboard rechts neben „Gestern bearb.“ verfügbar.
- Drei Kartenebenen sind angedeutet; die Ziehfläche der vordersten Karte wurde bis in den sichtbaren unteren Stapelbereich erweitert.
- Die einfarbige Icon-Galerie enthält zusätzliche Konturdetails und deutsche Beschriftungen.
- Mana-Check am nächsten Tag: die erstaunte, flächige schwarze 2D-Katze fragt, wenn für eine Zauber-Quest kein positiver Verbrauch eingetragen wurde. Bestätigen, korrigieren und unbekannt lassen sind drei eigenständige Aktionen; die Formulierungen wechseln.
- **Keine geschätzte Standard-Abbuchung mehr.** Bei Leveln gilt eine fehlende Buchung als 0. Bei Zaubern bleibt nicht erfasster Mana-Verbrauch unbekannt und zählt als gescheiterter Streak; es wird kein fiktiver Verbrauch gebucht.
- **Eine gemeinsame Ausspielmenge pro Quest und Metrik:** auf der Karte und im Quest-Editor ist derselbe Wert hinterlegt. Änderungen sind synchron. Nur bei erstmaliger Erstellung gibt es den Vorschlag: tägliche Quest = Zielmenge; mehrtägig Anzahl = 1; mehrtägig Minuten = Zielmenge geteilt durch Anzahl der Tage (für Kalender-Monat/Jahr nach den tatsächlichen Tagen des Zeitraums).
- Migration wandelt alte automatische Zauber-Buchungen aus v0.8 in „unbekannt“ um und setzt automatisch ergänzte Leveln-Einträge auf 0. Vom Nutzer selbst erfasste Buchungen bleiben bestehen.

## Technik

Statische HTML/CSS/JavaScript-PWA, keine zusätzlichen Libraries oder Cloud-Dienste erforderlich. Alle App-Dateien müssen auf einem HTTPS-Webhost unter demselben Verzeichnis erreichbar sein. Datei `index.html` ist die Startseite. Backupformat: `progress-local-backup` Version 4.
