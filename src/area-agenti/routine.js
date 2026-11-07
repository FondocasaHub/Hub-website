// Compiti giornalieri dei veterani (deciso da Nicola il 7/11/2026): chi non è in un percorso di inserimento
// ha comunque una routine quotidiana a pieno regime, controllata dal cancello giornaliero.
// Le spunte stanno in produttivita_giorno.routine ({ chiave: true }). Nessuna dipendenza da React.

export const TIPI_ROUTINE = {
  agente: "Agente",
  senior: "Senior Agent",
  buyer: "Buyer Agent",
  credito: "Consulente del credito",
};

export function tipoRoutine(profilo) {
  if (!profilo) return "agente";
  if (profilo.ruolo === "credito") return "credito";
  if ((profilo.ruoli_extra || []).includes("buyer") || profilo.livello === "buyer") return "buyer";
  if (profilo.livello === "senior") return "senior";
  return "agente";
}

// Compito del giorno della settimana (1 = lunedì … 5 = venerdì).
const SETTIMANA = {
  agente: [
    "Riunione del lunedì + piano della settimana con Chirone · conferma gli appuntamenti della settimana",
    "Richiama i proprietari valutati e non ancora acquisiti · 1 simulazione con Chirone sull'obiezione più difficile",
    "Controlla gli annunci dei tuoi incarichi su Getrix e Idealista (qualità 100) · aggiorna i venditori su visite e richieste",
    "Contatti referral a clienti passati e vicini degli immobili acquisiti (copione appena acquisito)",
    "Analisi della settimana con Chirone · resoconto settimanale ai tuoi venditori · resoconto al Team Manager",
  ],
  senior: [
    "Riunione del lunedì + piano della settimana con Chirone · conferma gli appuntamenti di acquisizione",
    "Simulazione con Chirone sulla trattativa più difficile · richiami ai proprietari valutati",
    "Controlla gli annunci dei tuoi incarichi (qualità 100) · valuta un ribasso dove l'immobile è fermo",
    "Referral a clienti passati · mentorship di 30 minuti a un nuovo agente",
    "Analisi della settimana · resoconto ai venditori · contenuto personale per i canali Hub · resoconto al Team Manager",
  ],
  buyer: [
    "Riunione del lunedì + piano della settimana con Chirone · prequalifica le richieste nuove dai portali",
    "Richiami e WhatsApp agli acquirenti già visti · proponi l'incarico di ricerca a chi è caldo",
    "Secondo appuntamento con gli acquirenti caldi · acquirenti con mutuo segnalati a WeUnit",
    "Feedback delle visite ai listing agent del team · prepara la prossima Open House",
    "Analisi della settimana con Chirone · resoconto al Team Manager",
  ],
  credito: [
    "Riunione del lunedì: raccogli dagli agenti gli acquirenti che devono fare mutuo · piano della settimana con Chirone",
    "Ripasso di 1 banca sul Comparatore Policy Mutui · aggiorna lo stato delle pratiche aperte su 7HUB",
    "Incontro o chiamata con un professionista per la partnership (commercialista, notaio, consulente del lavoro)",
    "Prestiti personali e cessioni del quinto: proposta ai contatti personali e ai clienti già finanziati",
    "Analisi della settimana con Chirone · pratiche caricate su 7HUB · resoconto al Team Manager",
  ],
};

// Compito di fine giornata, uguale tutti i giorni.
const CHIUSURA = {
  agente: "Prima di chiudere: Vendilo aggiornato (contatti, note, prossimi passi) e diario compilato",
  senior: "Prima di chiudere: Vendilo aggiornato (contatti, note, prossimi passi) e diario compilato",
  buyer: "Prima di chiudere: richieste e visite aggiornate su Vendilo e diario compilato",
  credito: "Prima di chiudere: 7HUB e Vendilo aggiornati (lead, consulenze, pratiche) e diario compilato",
};

// Contatti del giorno detti a parole (il numero preciso lo dà il calcolatore).
const CONTATTI = {
  agente: "Fai i contatti del tuo obiettivo giornaliero (proprietari, privati, case ferme, referral) e segnali nel diario",
  senior: "Fai i contatti del tuo obiettivo giornaliero e almeno 1 tentativo di appuntamento di acquisizione",
  buyer: "Contatta 20 richieste che rispondono e segnale nel diario",
  credito: "20 chiamate alle richieste di acquisto con mutuo + 10 contatti personali + 10 professionisti",
};

const giornoSett = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay();

// Compiti di una data: [{ chiave, blocco, testo }]. Weekend vuoto.
export function compitiRoutine(tipo, data) {
  const g = giornoSett(data);
  if (g === 0 || g === 6) return [];
  const t = SETTIMANA[tipo] ? tipo : "agente";
  return [
    { chiave: "contatti", blocco: "📞 Contatti", testo: CONTATTI[t] },
    { chiave: "giorno", blocco: "📅 Compito del giorno", testo: SETTIMANA[t][g - 1] },
    { chiave: "chiusura", blocco: "✅ Fine giornata", testo: CHIUSURA[t] },
  ];
}

export const routineFatta = (diario, chiave) => Boolean(diario?.routine?.[chiave]);
