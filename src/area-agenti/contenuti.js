// Contenuti statici dell'area agenti (piano di inserimento, agenda, regole).
// Per modificarli basta cambiare questo file: ogni voce è testo semplice.

export const PIANO_INSERIMENTO = [
  {
    fase: "Giorno 1",
    titolo: "Formalizzazione",
    voci: [
      "Firma degli accordi di collaborazione con lo Store Manager",
      "Registrazione presso l'Amministrazione (dati anagrafici e fiscali)",
      "Consegna delle credenziali dell'Area Agenti",
    ],
  },
  {
    fase: "Giorni 1–2",
    titolo: "Strumenti",
    voci: [
      "Attivazione della posta aziendale @fondocasa.it",
      "Credenziali Vendilo CRM: da qui in poi ogni contatto va inserito in Vendilo",
      "Accessi a euromq, AgentPricing, Getrix, RealMaps, DocuDrop e FC Power",
      "Iscrizione alla Community Agente Strategico (coupon COMMUNITY100)",
    ],
  },
  {
    fase: "Prima settimana",
    titolo: "Formazione e regole",
    voci: [
      "Partecipazione alle sessioni di formazione Agente Strategico (lunedì, mercoledì, venerdì)",
      "Lettura di mansionario, organigramma e regole dello store (cartella Documenti → Per tutti)",
      "Affiancamento al proprio Team Manager su chiamate, acquisizioni e sopralluoghi",
      "Inserimento nei turni di presidio del front office",
    ],
  },
  {
    fase: "Entro 10 giorni",
    titolo: "Operatività e immagine",
    voci: [
      "Biglietti da visita richiesti ad Artwork",
      "Foto e scheda sul sito fondocasahub.com (pagina Chi siamo)",
      "Primi obiettivi personali concordati e caricati nel file della riunione del lunedì",
    ],
  },
];

// Agenda settimanale obbligatoria. giorno: 1 = lunedì ... 5 = venerdì, 0 = tutti i giorni.
export const AGENDA = [
  { giorno: 1, ora: "09:00–10:00", cosa: "Formazione Agente Strategico" },
  { giorno: 1, ora: "10:00–11:00", cosa: "Riunione Store" },
  { giorno: 1, ora: "11:00–13:00", cosa: "Riunione di team: dati, immobili e gestioni" },
  { giorno: 3, ora: "12:00–13:00", cosa: "Formazione Agente Strategico" },
  { giorno: 5, ora: "15:00–16:00", cosa: "Formazione Agente Strategico" },
  { giorno: 0, ora: "19:00", cosa: "Inserimento dati in Vendilo CRM" },
];

export const GIORNI = ["", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];

export const ROUTINE_LISTING = [
  { quando: "Mattina — martedì e giovedì", cosa: "Ricerca proprietari in zona" },
  { quando: "Mattina — mercoledì e venerdì", cosa: "Telefonate a centri di influenza, clienti passati, conoscenti, privati; attività social" },
  { quando: "Pomeriggio", cosa: "Sviluppo notizie, sopralluoghi di acquisizione, valutazioni" },
];

export const OBIETTIVI_LISTING = [
  { valore: "50", etichetta: "contatti al giorno" },
  { valore: "3", etichetta: "acquisizioni a settimana" },
  { valore: "2–3", etichetta: "incarichi in esclusiva al mese" },
];
