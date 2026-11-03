// Dashboard Immobili: permessi visibili in pagina, avanzamento e avvisi.
// La sicurezza vera è nel database (supabase/area-agenti-immobili.sql): qui si decide solo cosa mostrare.

export const STATI_IMMOBILE = ["attivo", "in trattativa", "venduto", "ritirato"];
export const FASCE = ["mattina", "pranzo", "sera"];
export const TIPI_DOCUMENTO = ["planimetria", "pratica edilizia", "relazione tecnica", "foto", "video", "altro"];
export const STATI_ACQUIRENTE = ["pronto", "da finanziare", "non qualificato"];
export const ESITI_MUTUO = ["in corso", "positivo", "negativo"];

// Obiettivi minimi della Procedura Buyer Agent v1.0, sezione 2.
// contattiDueSettimane: la procedura dice solo "contatti bassi", il valore l'ha fissato Nicola il 03/11/2026.
export const OBIETTIVI = {
  giorniOpenHouse: 15,
  presenzeOpenHouse: 25,
  chiamateSettimana: 150,
  volantini: 500,
  pubblicazioniGiorno: 3,
  contattiDueSettimane: 150,
};

export const CAMPI_KPI = [
  ["Presidio e richieste", [["civici_contattati", "Civici e professionisti chiamati"], ["volantini", "Volantini distribuiti"], ["vecchie_richieste", "Vecchie richieste richiamate"]]],
  ["Acquirenti", [["nuovi_contatti", "Nuovi contatti"], ["prequalificati", "Prequalificati"], ["presenze_open_house", "Presenze Open House"], ["visite", "Visite"], ["proposte", "Proposte"]]],
  ["Portali e canali", [["visite_portali", "Visite all'annuncio sui portali"], ["messaggi_portali", "Messaggi dai portali"], ["messaggi_instagram", "Messaggi Instagram"], ["messaggi_facebook", "Messaggi Facebook"], ["messaggi_tiktok", "Messaggi TikTok"], ["messaggi_whatsapp", "Messaggi WhatsApp"], ["email_inviate", "Email inviate"]]],
];
export const CHIAVI_KPI = CAMPI_KPI.flatMap(([, campi]) => campi.map(([k]) => k));

export const oggiISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
export const dataIT = (iso) => (iso ? new Date(iso.length === 10 ? `${iso}T12:00` : iso).toLocaleDateString("it-IT") : "—");
export const giorniTra = (da, a) => Math.round((Date.parse(`${a.slice(0, 10)}T12:00Z`) - Date.parse(`${da.slice(0, 10)}T12:00Z`)) / 86400000);
const piuGiorni = (iso, n) => new Date(Date.parse(`${iso}T12:00Z`) + n * 86400000).toISOString().slice(0, 10);

export const haRuolo = (p, extra) => (p.ruoli_extra || []).includes(extra);
export const sonoBuyer = (p) => p.livello === "buyer" || haRuolo(p, "buyer");

export function permessi(profilo, immobile) {
  const gestore = profilo.ruolo === "admin" || (profilo.ruolo === "manager" && profilo.team === immobile.team);
  const listing = immobile.listing_id === profilo.id;
  const buyer = sonoBuyer(profilo) && profilo.team === immobile.team;
  const credito = immobile.consulente_credito_id === profilo.id;
  return {
    gestore, listing, buyer, credito,
    lavora: gestore || listing || buyer,
    numeri: gestore || listing || buyer,
    pubblicazioni: gestore || buyer,
    documenti: gestore || listing,
    acquirenti: gestore || buyer,
    esitoMutuo: gestore || credito,
    minisito: gestore || listing,
    spunta: (responsabile) => gestore || (buyer && responsabile !== "manager") || (listing && responsabile === "listing"),
  };
}

export function avanzamento(catalogo, attivita) {
  if (!catalogo.length) return 0;
  const fatte = attivita.filter((a) => a.completata).length;
  return Math.round((fatte / catalogo.length) * 100);
}

const somma = (righe, k) => righe.reduce((t, r) => t + (r[k] || 0), 0);

// Avvisi della sezione "Obiettivi minimi e avvisi" della specifica: solo per gli immobili attivi.
export function avvisiImmobile({ immobile: i, attivita, kpi, documenti, pubblicazioni }, oggi = oggiISO()) {
  if (i.stato !== "attivo") return [];
  const avvisi = [];
  const aggiungi = (grave, testo) => avvisi.push({ grave, testo });
  const fatta = (c) => attivita.some((a) => a.codice_attivita === c && a.completata);
  const eta = giorniTra(i.data_acquisizione, oggi);

  if (i.data_sopralluogo_marketing) {
    if (!i.data_open_house) {
      const resta = OBIETTIVI.giorniOpenHouse - giorniTra(i.data_sopralluogo_marketing, oggi);
      aggiungi(resta < 0, resta < 0 ? "Open House non fissata: 15 giorni dal sopralluogo superati" : `Open House non fissata: ${resta} giorni al limite`);
    } else if (giorniTra(i.data_sopralluogo_marketing, i.data_open_house) > OBIETTIVI.giorniOpenHouse) {
      aggiungi(true, "Open House oltre i 15 giorni dal sopralluogo Marketing");
    }
  } else if (eta > 2) {
    aggiungi(false, "Sopralluogo Marketing non ancora fissato");
  }

  if (i.data_open_house && giorniTra(i.data_open_house, oggi) > 0) {
    const presenze = somma(kpi, "presenze_open_house");
    if (presenze < OBIETTIVI.presenzeOpenHouse) aggiungi(false, `Open House con ${presenze} presenze su ${OBIETTIVI.presenzeOpenHouse}`);
  }

  if (eta >= 7) {
    const dal = piuGiorni(oggi, -7);
    const chiamate = somma(kpi.filter((k) => k.data >= dal), "civici_contattati");
    if (chiamate < OBIETTIVI.chiamateSettimana) aggiungi(false, `${chiamate} chiamate negli ultimi 7 giorni su ${OBIETTIVI.chiamateSettimana}`);
  }

  // I volantini escono con la data dell'Open House già fissata (procedura, Fase 1).
  if (i.data_open_house && eta > 2) {
    const volantini = somma(kpi, "volantini");
    if (volantini < OBIETTIVI.volantini) aggiungi(false, `${volantini} volantini su ${OBIETTIVI.volantini}`);
  }

  if (eta >= 1) {
    const ieri = piuGiorni(oggi, -1);
    const uscite = pubblicazioni.filter((p) => p.data === ieri).length;
    if (uscite < OBIETTIVI.pubblicazioniGiorno) aggiungi(false, `Ieri ${uscite} pubblicazioni su ${OBIETTIVI.pubblicazioniGiorno}`);
  }

  if (fatta("f4_anteprima") || fatta("f4_annuncio")) {
    const mancano = ["planimetria", "relazione tecnica"].filter((t) => !documenti.some((d) => d.tipo === t));
    if (mancano.length) aggiungi(true, `Lancio con documentazione incompleta: manca ${mancano.join(" e ")}`);
  }

  if (eta >= 14) {
    const contatti = somma(kpi, "nuovi_contatti");
    if (contatti < OBIETTIVI.contattiDueSettimane) aggiungi(true, `Dopo 2 settimane solo ${contatti} contatti: rivedere prezzo, materiali o canali`);
    if (!fatta("f5_revisione")) aggiungi(false, "Revisione delle 2 settimane con il Team Manager da fare");
  }

  return avvisi.sort((a, b) => Number(b.grave) - Number(a.grave));
}
