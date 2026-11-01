# Leveln 0.10 – Wartung

Der vorherige Wartungsleitfaden für die beiden Monolith-Dateien `app.js` und `v010.js` ist nach dem Umbau überholt.

**Verbindlicher Leitfaden:** [ARCHITEKTUR.md](ARCHITEKTUR.md). Dort sind alle Modulordner, Seiten, Funktionen, Datenverträge, Tests und Release-Schritte dokumentiert.

Die historischen Funktionskörper sind – mit Ausnahme des Renderers, der nun die HTML-Seitenvorlagen nutzt – unverändert in die entsprechenden Dateien überführt. Datenformat 5 und Migration 0.9 → 0.10 bleiben gleich.


**Icon-Hinweis (0.11.2):** Ausschließlich die Originaldateien unter `assets/icons/mono/` bearbeiten. `npm run prepare:release` regeneriert daraus die Inline-SVG-Bibliothek und aktualisiert den PWA-Cache. Es gibt keine vereinfachten Ersatzgrafiken. Weitere Details in `ARCHITEKTUR.md`.
