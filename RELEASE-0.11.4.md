# Leveln 0.11.4 – Korrektur der ersten Ausgabe

**Upgrade-Pfad: Leveln 0.11.3 → Leveln 0.11.4 (korrigiert).** Die aus 0.11.3 bereits vorhandenen Aktivitäten, Einträge, XP, Skills, Statistiken und individuellen Questfarben bleiben erhalten. Datenbankname: `progress-private-v1`; Schema und Backupformat: **5**.

## Fehlerbehebungen

### 1. Verdeckte Aktionen in beiden Wischrichtungen

Im Ruhezustand ist ausschließlich die Questzeile sichtbar. Mit einem **Wisch nach links** verschiebt sie sich um 190 px und zeigt die unter ihr liegenden Aktionen **Bearb., Archiv, Löschen**. Ein Wisch **nach rechts** zeigt auf der anderen Seite den kostenlosen **Dauer-Freeze** (130 px). Die Aktionen sind in demselben Swipe-Container und können nicht ständig als Leiste außerhalb der Zeile erscheinen. Archivierte Quests bieten **De-Archivieren** und **Löschen**. Einmalige Quests bieten ebenfalls verdeckte Verwaltungsaktionen; ein Dauer-Freeze wird für sie nicht angeboten, da sie keine laufende Streak haben.

### 2. Karten darunter sehen aus wie die echten oberen Karten

Die beiden unteren Karten verwenden dieselbe HTML-Komponente, dieselben SVG-Illustrationen, dieselbe Schrift und dieselbe Kartengeometrie wie die oberste Karte. Sie besitzen keine gesonderte Verkleinerung der Überschrift, der Grafik oder des Kürzels. Die zwei Kartenhüllen sind lediglich nach unten verschoben und dienen als physischer Stapel. Solange eine Karte darunter liegt, ist sie nicht interaktiv.

### 3. Einführung entfernt, Handbuch eingeführt

Die dreiteilige Einführung und die interaktiv angeleitete Questerstellung werden nicht mehr gestartet. In **Einstellungen → Leveln-Handbuch** steht jetzt eine ausführliche und jederzeit abrufbare Anleitung. Sie beginnt mit der Grundidee **„Fortschritte belohnen, nicht bestrafen“**, erläutert **Leveln**, **Zaubern** und den bewussten Umgang mit Mana und zeigt echte Beispiele mit Minutenbuchung und Mana-Verbrauch. Weitere Kapitel behandeln Karten, Fortschritt, XP, Streaks, Dauer-Freeze, Glut, Questverwaltung, historische Erfolge, Kalender, Korrekturen und lokale Backups. Bei einer brandneuen Installation wird **einmalig ein kurzer Hinweis** auf das Handbuch angezeigt. Alte, unterbrochene Tutorial-Zustände werden deaktiviert, ohne Benutzerbuchungen zu löschen oder zu verändern.

## Unveränderte Funktionen

Questgebundene Glut/Freezes, beide Löschvarianten, Archivierung und Nachträge, Dauer-Freeze, historische XP-Berechnung, Kalenderrahmen, 2 Sekunden Haltegeste, stärkeres Glow, Kartensortierung, alle 64 Original-SVGs, statische PWA-Dateien und Offlinespeicherung bleiben bestehen.

## Sichere Installation

Vor dem Update ein JSON-Backup in **0.11.3** erstellen. ZIP vollständig in das bestehende Repository kopieren, dann `git add -A`, `git commit -m "Leveln 0.11.4 korrigiert"`, `git push` ausführen. Die installierte Home-Bildschirm-App **nicht löschen**. Die aktualisierte Service-Worker-Cache-Kennung lädt die korrigierten Dateien.

Automatisierte Funktions- und Strukturtests erfolgreich. Die statische Darstellung mit sichtbaren Kürzeln und verdeckten Slider-Buttons wurde in Chromium überprüft. Echte Touch-Gesten auf einem iPhone sind noch nicht durchgetestet; bitte nach dem Update zuerst mit einer Testquest ausprobieren.
