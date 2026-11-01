# CSS-Ladefolge

- `styles.css` ist das unveränderte CSS des 0.9-Kompatibilitätskerns.
- `theme/` enthält Palette, SVG-Masken und Basisthemes.
- `src/styles/v010-base.css` enthält globale 0.10-Regeln.
- Seiten-CSS liegt bei der jeweiligen Seite; Reihenfolge in `index.html` ist maßgeblich.
- `src/styles/v010-finish.css` enthält übergreifende Regeln mit hoher Priorität.
- Keine Umordnung von Regeln ohne visuellen Regressionstest – CSS-Cascade ist funktional.
