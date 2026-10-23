---
tipo: cruscotto
---
# Cruscotto generale

Una pagina per vedere tutto. Richiede il plugin **Dataview** di Obsidian (Impostazioni → Plugin della
community → Dataview). Gli altri numeri si aggiornano con i comandi del lunedì (`obiettivo`, `scaduti`).

## Numeri
- Obiettivo e ritmo: [[06 Numeri/Obiettivo]]
- Soldi: [[06 Numeri/Cruscotto finanziario]]
- Ricerca: [[06 Numeri/Attività della ricerca]]

## Questa settimana
```dataview
LIST
FROM "04 Acquisizione/Scaduti" OR "09 Controlli/Lint" OR "07 Marketing/Contenuti"
WHERE file.ctime >= date(today) - dur(7 days)
SORT file.ctime DESC
```

## Appuntamenti di valutazione preparati (ultimi 30 giorni)
```dataview
TABLE agente, zona, esito
FROM "04 Acquisizione/Appuntamenti"
WHERE data >= date(today) - dur(30 days)
SORT data DESC
```

## Compiti aperti del team
```dataview
TASK
FROM "05 Team"
WHERE !completed
GROUP BY file.link
```

## Decisioni da prendere
```dataview
TABLE scadenza, responsabile
FROM "08 Decisioni"
WHERE tipo = "decisione" AND stato = "da decidere"
SORT scadenza ASC
```

## Team
```dataview
TABLE ruolo, zona, team
FROM "05 Team/Agenti"
WHERE tipo = "agente" AND attivo = true
SORT team ASC
```

## Competitor e zone
- [[_config/competitor]] · [[01 Agenzia/Zone]] · Vie analizzate:
```dataview
LIST FROM "04 Acquisizione/Vie" SORT file.mtime DESC LIMIT 10
```
