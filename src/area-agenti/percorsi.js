// Percorsi di inserimento da 90 giorni guidati da Chirone (decisi da Nicola il 7/11/2026).
// Usato da "La mia giornata" e da /api/assistente (Chirone). Nessuna dipendenza da React.
// Il testo completo di ogni percorso è nella base di conoscenza di Chirone (percorso-90-giorni-*).
import { piuGiorni } from "./produttivita.js";

export const TIPI_PERCORSO = {
  agente: "Agente (New e Junior)",
  senior: "Senior Agent",
  buyer: "Buyer Agent",
  credito: "Consulente del credito",
};

// Fase 1: i primi 10 giorni lavorativi, un compito per blocco.
const FASE1 = {
  agente: [
    ["Firma contratto e codice di comportamento. Accesso ad Area Agenti, posta aziendale, Vendilo", "Leggi Codice d'Onore, 4 valori HUB e il documento del metodo operativo", "Scrivi la lista dei tuoi primi 50 contatti personali"],
    ["Vendilo: importa i contatti del telefono. Foto profilo e video di presentazione", "Iscriviti alla Community Agente Strategico e segui la prima lezione", "Carica in Vendilo i 50 contatti della lista"],
    ["euromq: valutazione di prova", "Copione referral + simulazione con Chirone", "10 contatti dalla lista personale"],
    ["AgentPricing: confronta la valutazione con euromq. Leggi \"Acquisto casa – imposte e agevolazioni\"", "Copione prequalifica venditore + simulazione", "10 contatti"],
    ["RealMaps: cerca i numeri di una via della tua zona", "Copione appena acquisito + simulazione", "10 contatti · verifica della settimana con il Team Manager"],
    ["Dashboard Immobili: studia un immobile in vendita dell'Hub", "Copione privati che vendono da soli + simulazione", "20 contatti"],
    ["Getrix e Idealista: guarda i nostri annunci e proponi 1 miglioria", "Copione obiezioni proprietari (prime 11) + simulazione", "20 contatti"],
    ["DocuDrop: simula privacy e antiriciclaggio. Ripasso normativa: L. 39/89, privacy, antiriciclaggio", "Copione obiezioni proprietari (altre 11) + simulazione", "20 contatti"],
    ["Modulo Ingaggio Marketing su un immobile di prova. Leggi la check list documenti mutuo (parte immobile)", "Copione appuntamento di acquisizione + preparazione", "20 contatti · fissa il 1° appuntamento"],
    ["FC Power e servizi HUB (WeUnit, Fondo Consap, assicurazioni, Zero Vincoli 60): sai spiegarli in 1 minuto?", "Simulazione completa di un appuntamento + test con Chirone (minimo 80%)", "20 contatti · passaggio di fase con il Team Manager"],
  ],
  senior: [
    ["Firma contratto e codice di comportamento. Area Agenti, posta, Vendilo", "Codice d'Onore, 4 valori, documento del metodo operativo", "Lista dei clienti e dei proprietari del tuo portafoglio"],
    ["Vendilo: importa i tuoi contatti. Foto profilo e video per il sito", "Iscrizione alla Community Agente Strategico", "30 contatti: clienti passati, copione referral"],
    ["euromq e AgentPricing: valutazione di un immobile del tuo portafoglio", "Copione appuntamento di acquisizione in versione HUB", "30 contatti"],
    ["DocuDrop: trasferisci in digitale i mandati che porti con te", "Zero Vincoli 60 e servizi HUB: come li presenti al proprietario", "30 contatti"],
    ["Dashboard Immobili e Modulo Ingaggio Marketing", "Simulazione con un proprietario esigente", "30 contatti · fissa il 1° appuntamento · verifica della settimana"],
    ["Getrix e Idealista: controlla gli annunci dei tuoi incarichi", "Copione obiezioni proprietari", "30 contatti"],
    ["Incontro con la Buyer Agent del team", "Copione ribasso prezzo", "30 contatti"],
    ["Incontro con la consulente WeUnit. Ripasso: Fondo Consap, imposte, check list documenti", "Copione presentazione offerta", "30 contatti"],
    ["RealMaps: ricerca proprietari nella tua zona", "Copioni scaduti e privati", "30 contatti"],
    ["FC Power e assicurazioni", "Test con Chirone su sistema e metodo HUB (minimo 80%)", "30 contatti · passaggio di fase con il Team Manager"],
  ],
  buyer: [
    ["Area Agenti, posta, Vendilo. Leggi \"Strumenti – accessi e a chi chiedere\"", "Leggi la Procedura Buyer Agent", "Studia gli immobili in vendita del tuo team"],
    ["Vendilo: dove arrivano le richieste. Firma contratto e codice di comportamento", "Iscriviti alla Community Agente Strategico", "Scheda di 3 immobili del team: punti di forza, prezzo, obiezioni"],
    ["Getrix e Idealista: richieste e annunci del team da ottimizzare", "Copione prequalifica acquirente + simulazione", "10 richieste contattate"],
    ["Dashboard Immobili: visite e messaggi. Studia l'Intervista cliente WeUnit", "Copione prequalifica con affermazioni + simulazione", "10 richieste contattate"],
    ["Quando coinvolgere WeUnit. Leggi Fondo Consap e imposte sull'acquisto", "Simulazione: acquirente che deve fare un mutuo", "10 richieste · verifica della settimana con il Team Manager"],
    ["Foglio Visita su una visita di prova", "Copione appena acquisito (telefonata ai vicini)", "20 richieste contattate"],
    ["DocuDrop: come si carica una proposta d'acquisto", "Copione presentazione offerta + simulazione", "20 richieste · fissa la 1ª visita"],
    ["Incarico di ricerca in esclusiva: versione online su un caso di prova", "Simulazione: acquirente indeciso dopo la visita", "20 richieste contattate"],
    ["FC Power e servizi HUB: sai spiegarli in 1 minuto?", "Simulazione: proporre l'incarico di ricerca", "20 richieste · visite"],
    ["Organizzare una Open House (obiettivo 20 persone). Test con Chirone (minimo 80%)", "Simulazione completa: dalla telefonata alla visita", "20 richieste · passaggio di fase con il Team Manager"],
  ],
  credito: [
    ["Firma contratto e codice. Area Agenti, posta, Vendilo. Mansionario del credito e \"WeUnit e il Sistema FC Group\"", "Codice d'Onore e 4 valori HUB", "Lista di 50 contatti personali"],
    ["7HUB: accesso, profilo, minisito e territori (scheda \"7HUB – manuale d'uso\")", "Iscrizione alla Community Agente Strategico", "Lista di 30 professionisti della zona"],
    ["Intervista cliente WeUnit, poi Instant Rating di prova su 7HUB. Scheda banca: BNL", "Copione prequalifica acquirente (parte mutuo) + simulazione", "10 chiamate + 5 personali + 5 professionisti"],
    ["7HUB: Preventivatore, mediazione, Stampa e Salva. Scheda banca: CheBanca / Mediobanca Premier", "Simulazione: prima consulenza mutuo", "10 + 5 + 5"],
    ["7HUB: da Lead a Pratica, stati e date. Scheda banca: Banco BPM", "Simulazione: proporre una partnership a un commercialista", "10 + 5 + 5 · verifica della settimana con il Team Manager"],
    ["Check list documenti mutuo e 7HUB: documenti e Stampa Unione. Scheda banca: ING", "Copione referral", "20 chiamate + 10 personali + 10 professionisti"],
    ["7HUB: antiriciclaggio e dati contratto. Scheda banca: MPS. Prestiti personali", "Simulazione: consulenza prestito personale", "20 + 10 + 10"],
    ["7HUB: Kit Digitale e firma. Scheda banca: Crédit Agricole. Cessione del quinto", "Simulazione: consulenza cessione del quinto", "20 + 10 + 10 · fissa la 1ª consulenza"],
    ["Fondo Consap e imposte. Prospetto Spese e Calcola la rata. Schede banca: BPER e CR Asti", "Simulazione: cliente con reddito difficile", "20 + 10 + 10"],
    ["Schede: Extrabanca e Soglie Sussistenza. Test prodotti e politiche con Chirone (minimo 85%)", "Simulazione completa fino alla pratica su 7HUB", "20 + 10 + 10 · passaggio di fase con il Team Manager"],
  ],
};

// Fasi 2 e 3: compiti per giorno della settimana (1 = lunedì … 5 = venerdì).
const SETTIMANA = {
  agente: {
    2: ["Formazione Community 09:00 + riunione del lunedì · 30 contatti a proprietari della zona", "Copione scaduti + simulazione · 30 contatti a case ferme", "Formazione 12:00 · copione privati · 30 contatti a privati con annuncio", "Copione richiamo venditore, email e WhatsApp · 30 richiami", "Formazione 15:00 · analisi della settimana con Chirone · 30 contatti referral · resoconto al Team Manager"],
    3: ["Piano della settimana con Chirone · 30 contatti · conferma appuntamenti", "Simulazione sull'obiezione più difficile · 30 contatti", "Copioni ribasso prezzo e presentazione offerta · 30 contatti + appuntamento", "Copione richiamo venditore · 30 richiami ai proprietari valutati", "Analisi della settimana · 30 contatti · resoconto al Team Manager"],
  },
  senior: {
    2: ["Riunione del lunedì + piano della settimana con Chirone · 30 contatti", "Simulazione sulla trattativa più difficile · 30 contatti", "Formazione Community · 30 contatti · appuntamento di acquisizione", "Copione richiamo venditore · 30 richiami", "Analisi della settimana · 30 contatti referral · resoconto al Team Manager"],
    3: ["Piano della settimana · 30 contatti · mentorship a un nuovo agente", "Simulazione su una trattativa in corso · 30 contatti", "Formazione · 30 contatti · appuntamento di acquisizione", "Richiami e referral · 30 contatti", "Analisi della settimana · contenuto personale per i canali Hub · resoconto"],
  },
  buyer: {
    2: ["Formazione 09:00 + riunione del lunedì · 20 richieste nuove dai portali", "Copione prequalifica acquirente · 20 richieste + visite", "Formazione 12:00 · copione presentazione offerta · 20 richieste + visite", "Richiami e WhatsApp agli acquirenti già visti · 20 richiami", "Formazione 15:00 · analisi della settimana · 20 richieste · resoconto al Team Manager"],
    3: ["Piano della settimana con Chirone · 20 richieste · conferma visite", "Simulazione sull'obiezione dell'acquirente · 20 richieste + visite", "Copione presentazione offerta · secondo appuntamento con gli acquirenti caldi", "Richiami agli acquirenti caldi · 20 richiami", "Analisi della settimana · 20 richieste · resoconto al Team Manager"],
  },
  credito: {
    2: ["Riunione del lunedì: acquirenti degli agenti che devono fare mutuo · 20 chiamate", "Ripasso di 1 banca sul Comparatore + prodotti speciali · 20 + 10 + 10", "Copione partnership professionisti · 20 + 10 professionisti · 1 incontro", "Prestiti e cessione del quinto ai contatti personali · 20 + 10 personali", "Analisi della settimana con Chirone · 20 + 10 + 10 · resoconto al Team Manager"],
    3: ["Piano della settimana e pratiche aperte con Chirone · 20 + 10 + 10", "Ripasso di 1 banca sul Comparatore · 20 + 10 + 10", "Incontro con un professionista · 20 + 10 + 10", "Prestiti e cessioni del quinto · 20 + 10 + 10", "Analisi della settimana · pratiche caricate su 7HUB · resoconto al Team Manager"],
  },
};

// Contatti attesi per giorno lavorativo (rampa iniziale).
export function contattiAttesi(tipo, gl) {
  if (tipo === "senior") return gl <= 1 ? 0 : 30;
  if (gl <= 2) return 0;
  if (tipo === "agente") return gl <= 5 ? 10 : gl <= 10 ? 20 : 30;
  if (tipo === "buyer") return gl <= 5 ? 10 : 20;
  if (tipo === "credito") return gl <= 5 ? 20 : 40;
  return 0;
}

export const ETICHETTE_NUMERI = {
  credito: { appuntamenti: "consulenze", incarichi: "pratiche" },
};
const etichetta = (tipo, campo) => ETICHETTE_NUMERI[tipo]?.[campo] || campo;

// Traguardi da raggiungere entro il giorno di calendario indicato.
const TRAGUARDI = {
  agente: [[30, "appuntamenti", 2], [60, "incarichi", 1, true], [75, "incarichi", 2], [90, "incarichi", 2, true]],
  senior: [[30, "appuntamenti", 4], [30, "incarichi", 2], [60, "incarichi", 4, true], [75, "incarichi", 6], [90, "incarichi", 7, true], [90, "proposte", 2, true]],
  buyer: [[30, "visite", 6], [60, "proposte", 1, true], [75, "proposte", 2], [90, "proposte", 4, true]],
  credito: [[15, "appuntamenti", 4], [30, "appuntamenti", 8], [60, "appuntamenti", 16, true], [90, "appuntamenti", 24, true]],
};

const giornoSett = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay();

// Giorno di calendario (1 = data di inizio) e giorno lavorativo (lun–ven).
export function giorniPercorso(dataInizio, oggi) {
  if (!dataInizio || oggi < dataInizio) return { cal: 0, lav: 0 };
  const cal = Math.round((new Date(`${oggi}T12:00:00Z`) - new Date(`${dataInizio}T12:00:00Z`)) / 86400000) + 1;
  let lav = 0;
  for (let d = dataInizio; d <= oggi; d = piuGiorni(d, 1)) { const g = giornoSett(d); if (g >= 1 && g <= 5) lav++; }
  return { cal, lav };
}

export function faseDelGiorno(cal, lav) {
  if (lav <= 10) return 1;
  return cal <= 60 ? 2 : 3;
}

// Compiti di una data del percorso: [{chiave, blocco, testo}]
export function compitiDelGiorno(tipo, dataInizio, data) {
  const g = giornoSett(data);
  if (g === 0 || g === 6) return [];
  const { cal, lav } = giorniPercorso(dataInizio, data);
  if (lav < 1 || cal > 90) return [];
  if (lav <= 10) {
    const [s, m, c] = FASE1[tipo]?.[lav - 1] || [];
    return [
      { chiave: `${data}-strumenti`, blocco: "🛠 Strumenti", testo: s },
      { chiave: `${data}-metodo`, blocco: "🧠 Metodo", testo: m },
      { chiave: `${data}-commerciale`, blocco: "📞 Commerciale", testo: c },
    ].filter((x) => x.testo);
  }
  const fase = faseDelGiorno(cal, lav);
  const testo = SETTIMANA[tipo]?.[fase]?.[g - 1];
  return testo ? [{ chiave: `${data}-giorno`, blocco: `Fase ${fase}`, testo }] : [];
}

// Compiti dei giorni passati non ancora spuntati (al massimo gli ultimi 10 giorni).
export function compitiArretrati(percorso, oggi) {
  const out = [];
  for (let k = 10; k >= 1; k--) {
    const d = piuGiorni(oggi, -k);
    if (d < percorso.data_inizio) continue;
    for (const c of compitiDelGiorno(percorso.tipo, percorso.data_inizio, d)) {
      if (!percorso.compiti?.[c.chiave]?.fatto) out.push({ ...c, data: d });
    }
  }
  return out;
}

// Somma dei numeri del diario dalla data di inizio.
export function sommaDiario(righe) {
  const t = { contatti: 0, appuntamenti: 0, incarichi: 0, visite: 0, proposte: 0 };
  for (const r of righe || []) for (const k of Object.keys(t)) t[k] += Number(r[k]) || 0;
  return t;
}

// Allarmi rossi: ritardo sui contatti e traguardi mancati. [{testo, grave}]
export function allarmiPercorso(percorso, righeDiario, oggi) {
  const { tipo, data_inizio: inizio } = percorso;
  const { cal } = giorniPercorso(inizio, oggi);
  const somma = sommaDiario(righeDiario);
  const allarmi = [];

  // Contatti attesi fino a ieri.
  let attesi = 0;
  const ieri = piuGiorni(oggi, -1);
  let lav = 0;
  for (let d = inizio; d <= ieri; d = piuGiorni(d, 1)) {
    const g = giornoSett(d);
    if (g >= 1 && g <= 5) { lav++; attesi += contattiAttesi(tipo, lav); }
  }
  const contattiFatti = (righeDiario || []).filter((r) => r.data <= ieri).reduce((s, r) => s + (Number(r.contatti) || 0), 0);
  if (attesi >= 20 && contattiFatti < attesi * 0.8) {
    allarmi.push({ grave: contattiFatti < attesi * 0.5, testo: `Contatti indietro: ${contattiFatti} fatti su ${attesi} previsti dall'inizio del percorso. Mancano ${attesi - contattiFatti} contatti.` });
  }

  for (const [giorno, campo, minimo, verifica] of TRAGUARDI[tipo] || []) {
    const fatto = somma[campo];
    if (fatto >= minimo) continue;
    if (cal >= giorno) {
      allarmi.push({ grave: true, testo: `${verifica ? "Verifica" : "Traguardo"} del giorno ${giorno} non raggiunto: ${fatto} ${etichetta(tipo, campo)} su ${minimo}.` });
    } else if (giorno - cal <= 10) {
      allarmi.push({ grave: false, testo: `Tra ${giorno - cal} giorni c'è il traguardo del giorno ${giorno}: servono ${minimo} ${etichetta(tipo, campo)}, ne hai ${fatto}.` });
    }
  }
  return allarmi;
}

export function prossimaVerifica(cal) {
  if (cal < 60) return { giorno: 60, mancano: 60 - cal };
  if (cal < 90) return { giorno: 90, mancano: 90 - cal };
  return null;
}

// Riepilogo in testo per Chirone.
export function riepilogoPercorso(percorso, righeDiario, oggi) {
  const { cal, lav } = giorniPercorso(percorso.data_inizio, oggi);
  const fase = faseDelGiorno(cal, lav);
  const righe = [`Percorso ${TIPI_PERCORSO[percorso.tipo]} iniziato il ${percorso.data_inizio}: oggi giorno ${cal} di 90 (giorno lavorativo ${lav}), fase ${fase}; il Team Manager ha approvato fino alla fase ${percorso.fase_approvata}.`];
  const ver = prossimaVerifica(cal);
  if (ver) righe.push(`Prossima verifica con il Team Manager: giorno ${ver.giorno}, tra ${ver.mancano} giorni.`);
  const oggiC = compitiDelGiorno(percorso.tipo, percorso.data_inizio, oggi);
  if (oggiC.length) righe.push(`Compiti di oggi: ${oggiC.map((c) => `${c.blocco} ${c.testo}${percorso.compiti?.[c.chiave]?.fatto ? " (fatto)" : ""}`).join(" | ")}`);
  const arr = compitiArretrati(percorso, oggi);
  if (arr.length) righe.push(`Compiti arretrati non spuntati: ${arr.length} (${arr.slice(0, 5).map((c) => c.testo).join("; ")}).`);
  const s = sommaDiario(righeDiario);
  righe.push(`Numeri dall'inizio: ${s.contatti} contatti, ${s.appuntamenti} ${etichetta(percorso.tipo, "appuntamenti")}, ${s.incarichi} ${etichetta(percorso.tipo, "incarichi")}, ${s.visite} visite, ${s.proposte} proposte.`);
  const all = allarmiPercorso(percorso, righeDiario, oggi);
  righe.push(all.length ? `ALLARMI: ${all.map((a) => `${a.grave ? "[ROSSO] " : ""}${a.testo}`).join(" ")}` : "Nessun allarme: è in linea con il percorso.");
  return righe;
}
