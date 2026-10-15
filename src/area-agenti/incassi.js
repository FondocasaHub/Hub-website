// Ripartizione di un incasso — stesse regole del Report di produzione del 09/10/2026
// e delle precisazioni Buyer del 15/10/2026. La filiera chiude sempre al 60%, il 40% resta a FC Punto Hub.

export const ALIQUOTE = {
  new: { nome: "New Agent", prod: 23, tm: 23 },
  junior: { nome: "Junior Agent", prod: 33, tm: 13 },
  senior: { nome: "Senior Agent", prod: 43, tm: 3 },
  team_manager: { nome: "Team Manager", prod: 46, tm: 0 },
  store_manager: { nome: "Store Manager", prod: 51, tm: 0 },
};
export const BUYER = { specifica: 5, generica: 28, segnalazione: 10, generica_tm: 23 };
export const MARKETING = 4;
export const STORE = 5;

export const TIPOLOGIE = {
  standard: "Operazione del collaboratore",
  segnalata: "Incarico segnalato dalla Buyer (lato venditore)",
  generica: "Buyer · vendita da richiesta generica (lato acquirente)",
};

const trova = (profili, f) => profili.find((p) => p.attivo !== false && f(p));
export const teamManagerDi = (profili, team) =>
  team ? trova(profili, (p) => p.team === team && p.livello === "team_manager") || trova(profili, (p) => p.team === team && p.livello === "store_manager") : null;
export const buyerDi = (profili, team) => (team ? trova(profili, (p) => p.team === team && p.livello === "buyer") : null);
export const storeManager = (profili) => trova(profili, (p) => p.livello === "store_manager") || trova(profili, (p) => p.ruolo === "admin");
export const marketingDi = (profili) => trova(profili, (p) => p.livello === "marketing");
const nomeDi = (p) => p ? (p.nome || p.email) : "Non assegnato";

const tondo = (n) => Math.round(n * 100) / 100;

/**
 * produttore: profilo del collaboratore che ha prodotto l'operazione
 * tipologia: standard | segnalata | generica
 * buyer: profilo della Buyer (per "segnalata"; se manca si usa la Buyer del team)
 */
export function ripartisci({ importo, produttore, tipologia, buyer }, profili) {
  const imp = Number(importo) || 0;
  if (!produttore || !imp) return { quote: [], errori: [] };
  const team = produttore.team || null;
  const tm = teamManagerDi(profili, team);
  const sm = storeManager(profili);
  const mkt = marketingDi(profili);
  const buy = buyer || buyerDi(profili, team);
  const quote = [];
  const add = (p, voce, pct) => { if (pct > 0) quote.push({ chi: p?.id || null, nome: nomeDi(p), voce, pct, importo: tondo((imp * pct) / 100), mancante: !p }); };

  if (tipologia === "generica") {
    add(produttore, "Buyer · richiesta generica", BUYER.generica);
    add(tm, "Override Team Manager", BUYER.generica_tm);
    add(mkt, "Marketing", MARKETING);
    add(sm, "Store Manager", STORE);
  } else {
    const a = ALIQUOTE[produttore.livello];
    if (!a) return { quote: [], errori: [`${nomeDi(produttore)} non ha un livello valido (New, Junior, Senior, Team Manager o Store Manager).`] };
    const segnalata = tipologia === "segnalata";
    add(produttore, segnalata ? "Produzione su incarico segnalato" : "Produzione", segnalata ? a.prod + BUYER.specifica - BUYER.segnalazione : a.prod);
    if (tm && tm.id !== produttore.id) add(tm, "Override Team Manager", a.tm);
    else if (!tm && a.tm) add(null, "Override Team Manager", a.tm);
    add(buy, segnalata ? "Buyer · segnalazione incarico" : "Buyer · richiesta specifica", segnalata ? BUYER.segnalazione : BUYER.specifica);
    add(mkt, "Marketing", MARKETING);
    if (produttore.livello !== "store_manager") add(sm, "Store Manager", STORE);
  }
  const filiera = tondo(quote.reduce((s, q) => s + q.importo, 0));
  quote.push({ chi: null, nome: "FC Punto Hub", voce: "Quota Hub", pct: tondo(100 - quote.reduce((s, q) => s + q.pct, 0)), importo: tondo(imp - filiera), hub: true });
  const errori = quote.filter((q) => q.mancante).map((q) => `${q.voce}: nessun collaboratore assegnato per ${team || "questo team"}.`);
  return { quote, errori };
}

// Periodi: mese intero o quindicina di incasso. Pagamento: 1–15 → dal 16 a fine mese; 16–fine → dal 1 al 15 del mese dopo.
export function elencoMesi(quanti = 12) {
  const out = []; const d = new Date(); d.setDate(1);
  for (let i = 0; i < quanti; i++) {
    out.push({ anno: d.getFullYear(), mese: d.getMonth(), etichetta: d.toLocaleDateString("it-IT", { month: "long", year: "numeric" }) });
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function intervallo({ anno, mese }, parte) {
  const fine = new Date(anno, mese + 1, 0);
  if (parte === "1") return [iso(new Date(anno, mese, 1)), iso(new Date(anno, mese, 15))];
  if (parte === "2") return [iso(new Date(anno, mese, 16)), iso(fine)];
  return [iso(new Date(anno, mese, 1)), iso(fine)];
}
export function notaPagamento({ anno, mese }, parte) {
  const nm = (a, m) => new Date(a, m, 1).toLocaleDateString("it-IT", { month: "long" });
  if (parte === "1") return `Incassi 1–15 ${nm(anno, mese)}: compensi pagati dal 16 a fine ${nm(anno, mese)}.`;
  if (parte === "2") return `Incassi dal 16 ${nm(anno, mese)}: compensi pagati dal 1 al 15 ${nm(anno, mese + 1)}.`;
  return "Mese intero: somma delle due quindicine. Il Marketing fattura sul mese intero.";
}
