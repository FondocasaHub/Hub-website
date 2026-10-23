---
tipo: registro
aggiornato: 2026-10-23
---
# Registro delle decisioni

Ogni decisione è una nota in questa cartella creata con `_modelli/Decisione.md`.
Le decisioni non si cancellano e non si riscrivono: si superano con una decisione nuova.

## In vigore
```dataview
TABLE data, area, responsabile
FROM "08 Decisioni"
WHERE tipo = "decisione" AND stato = "in vigore"
SORT data DESC
```

## Da prendere
```dataview
TABLE data, area, scadenza
FROM "08 Decisioni"
WHERE tipo = "decisione" AND stato = "da decidere"
SORT scadenza ASC
```

## Superate
```dataview
TABLE data, sostituita_da
FROM "08 Decisioni"
WHERE tipo = "decisione" AND stato = "superata"
SORT data DESC
```
