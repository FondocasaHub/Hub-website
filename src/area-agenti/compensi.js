// Aliquote dei compensi FC Punto Hub — in vigore dal 9 ottobre 2026.
// La filiera chiude sempre al 60% del fatturato, il 40% resta a FC Punto Hub.
// Per aggiornarle basta modificare questo file: il calcolo nel modulo si adegua.
//
// Ogni voce: id, etichetta, base (cosa si inserisce), pct (percentuale) oppure fisso (€ per unità).

export const AGGIORNATE_AL = "9 ottobre 2026";

export const LIVELLI = [
  { id: "new", nome: "New Agent" },
  { id: "junior", nome: "Junior Agent" },
  { id: "senior", nome: "Senior Agent" },
  { id: "buyer", nome: "Buyer Agent" },
  { id: "team_manager", nome: "Team Manager" },
  { id: "store_manager", nome: "Store Manager" },
  { id: "marketing", nome: "Marketing" },
  { id: "altro", nome: "Altro (importo concordato)" },
];

const FATT = "Fatturato HUB incassato (€)";

export const VOCI = {
  new: [{ id: "prod", etichetta: "Produzione personale", base: FATT, pct: 23 }, { id: "prod_segn", etichetta: "Produzione personale su incarico segnalato dalla Buyer (−10%)", base: "Fatturato lato venditore (€)", pct: 13 }],
  junior: [{ id: "prod", etichetta: "Produzione personale", base: FATT, pct: 33 }, { id: "prod_segn", etichetta: "Produzione personale su incarico segnalato dalla Buyer (−10%)", base: "Fatturato lato venditore (€)", pct: 23 }],
  senior: [{ id: "prod", etichetta: "Produzione personale", base: FATT, pct: 43 }, { id: "prod_segn", etichetta: "Produzione personale su incarico segnalato dalla Buyer (−10%)", base: "Fatturato lato venditore (€)", pct: 33 }],
  team_manager: [
    { id: "prod", etichetta: "Produzione personale", base: FATT, pct: 46 },
    { id: "prod_segn", etichetta: "Produzione personale su incarico segnalato dalla Buyer (−10%)", base: "Fatturato lato venditore (€)", pct: 36 },
    { id: "ov_buyer_b", etichetta: "Override su vendita della Buyer da richiesta generica", base: "Fatturato lato acquirente (€)", pct: 23 },
    { id: "ov_new", etichetta: "Override su operazione di un New del team", base: FATT, pct: 23 },
    { id: "ov_junior", etichetta: "Override su operazione di un Junior del team", base: FATT, pct: 13 },
    { id: "ov_senior", etichetta: "Override su operazione di un Senior del team", base: FATT, pct: 3 },
  ],
  store_manager: [
    { id: "prod", etichetta: "Vendite dirette", base: FATT, pct: 51 },
    { id: "prod_segn", etichetta: "Vendita diretta su incarico segnalato dalla Buyer (−10%)", base: "Fatturato lato venditore (€)", pct: 41 },
    { id: "ov_store", etichetta: "Override sul fatturato dello store", base: FATT, pct: 5 },
    { id: "ov_new", etichetta: "Override Team Manager su operazione di un New del tuo team", base: FATT, pct: 23 },
    { id: "ov_junior", etichetta: "Override Team Manager su operazione di un Junior del tuo team", base: FATT, pct: 13 },
    { id: "ov_senior", etichetta: "Override Team Manager su operazione di un Senior del tuo team", base: FATT, pct: 3 },
    { id: "ov_buyer_b", etichetta: "Override Team Manager su vendita della Buyer da richiesta generica", base: "Fatturato lato acquirente (€)", pct: 23 },
  ],
  buyer: [
    { id: "a_listing", etichetta: "Richiesta specifica su listing del team", base: "Fatturato totale dell'operazione (€)", pct: 5 },
    { id: "b_generica", etichetta: "Vendita da richiesta generica (sito, contatti) — come un New", base: "Fatturato lato acquirente (€)", pct: 28 },
    { id: "c_segnalazione", etichetta: "Segnalazione incarico di vendita", base: "Fatturato lato venditore (€)", pct: 10 },
    { id: "lead_mutuo", etichetta: "Lead WeUnit con mutuo erogato", base: "Numero di lead", fisso: 100 },
    { id: "lead_prestito", etichetta: "Lead WeUnit prestito / cessione del quinto erogati", base: "Numero di lead", fisso: 50 },
  ],
  marketing: [{ id: "mkt", etichetta: "Fatturato mensile HUB incassato", base: "Fatturato HUB incassato nel mese (€)", pct: 4 }],
  altro: [{ id: "manuale", etichetta: "Compenso concordato", base: "Importo (€)", pct: 100 }],
};

export const calcola = (voce, base) => {
  const n = Number(base) || 0;
  if (!voce) return 0;
  return Math.round((voce.fisso != null ? n * voce.fisso : (n * voce.pct) / 100) * 100) / 100;
};

export const euro = (n) => (Number(n) || 0).toLocaleString("it-IT", { style: "currency", currency: "EUR" });

// Periodi di pagamento (circolare 01/2026): quindicine; il marketing usa il mese intero.
export function periodi(livello, quanti = 6) {
  const out = [];
  const oggi = new Date();
  let anno = oggi.getFullYear(), mese = oggi.getMonth();
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const nomeMese = (a, m) => new Date(a, m, 1).toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  while (out.length < quanti + 2) {
    const ultimo = new Date(anno, mese + 1, 0);
    if (livello === "marketing") {
      out.push({ inizio: iso(new Date(anno, mese, 1)), fine: iso(ultimo), etichetta: nomeMese(anno, mese) });
    } else {
      out.push({ inizio: iso(new Date(anno, mese, 16)), fine: iso(ultimo), etichetta: `16–${ultimo.getDate()} ${nomeMese(anno, mese)}` });
      out.push({ inizio: iso(new Date(anno, mese, 1)), fine: iso(new Date(anno, mese, 15)), etichetta: `1–15 ${nomeMese(anno, mese)}` });
    }
    mese -= 1; if (mese < 0) { mese = 11; anno -= 1; }
  }
  const oggiIso = iso(oggi);
  return out.filter((p) => p.inizio <= oggiIso).slice(0, quanti);
}

export const etichettaPeriodo = (inizio, fine) => {
  const a = new Date(inizio), b = new Date(fine);
  const mese = b.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  return a.getDate() === 1 && b.getDate() >= 28 && a.getMonth() === b.getMonth() ? mese : `${a.getDate()}–${b.getDate()} ${mese}`;
};

export const STATI_REPORT = ["da approvare", "da correggere", "approvato", "verificato", "pagato"];
