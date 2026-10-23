// Ritmo rispetto all'obiettivo annuo e attività per agente, dall'export attività di Vendilo.
// Uso: node _strumenti/obiettivo.mjs <attivita.csv> [--salva] [--oggi=AAAA-MM-GG]
import { leggiCSV, leggiParametri, norm, num, euro, intero, giorniTra, oggi, tabella, aggiornaBlocco, argomenti } from "./lib.mjs";

const { salva, pos, opz } = argomenti();
const file = pos[0];
if (!file) {
  console.error("Uso: node _strumenti/obiettivo.mjs <attivita.csv> [--salva]");
  process.exit(1);
}
// Nomi usati nell'export di Vendilo → tipo del Cervello. Da adeguare al primo export reale.
const TIPI = {
  telefonata: "telefonata", chiamata: "telefonata",
  appuntamento: "appuntamento",
  valutazione: "valutazione",
  incarico: "incarico", "incarico esclusiva": "incarico", acquisizione: "incarico",
  vendita: "vendita", rogito: "vendita",
};
const p = leggiParametri();
const dataOggi = opz.oggi || oggi();
const inizio = `${p.anno}-01-01`;
const attivita = leggiCSV(file)
  .map((r) => ({ ...r, tipo: TIPI[norm(r.tipo)] }))
  .filter((r) => r.tipo && r.data >= inizio && r.data <= dataOggi);
const sconosciuti = leggiCSV(file).filter((r) => !TIPI[norm(r.tipo)]).map((r) => r.tipo);

const conta = (righe, tipo) => righe.filter((r) => r.tipo === tipo).length;
const quotaAnno = Math.min(1, (giorniTra(inizio, dataOggi) + 1) / 365);
const settimaneRimaste = Math.max(1, p.settimane_lavorative * (1 - quotaAnno));
const t = p.tassi_conversione;

const fatto = {
  incarichi: conta(attivita, "incarico"),
  vendite: conta(attivita, "vendita"),
  provvigioni: attivita.filter((r) => r.tipo === "vendita").reduce((s, r) => s + (num(r.provvigione) || 0), 0),
  valutazioni: conta(attivita, "valutazione"),
  appuntamenti: conta(attivita, "appuntamento"),
  telefonate: conta(attivita, "telefonata"),
};
const ob = p.obiettivi_annui;
const riga = (nome, obiettivo, fatti, fmt = intero) => {
  const ritmo = obiettivo * quotaAnno;
  const scarto = fatti - ritmo;
  return [nome, fmt(obiettivo), fmt(fatti), fmt(ritmo), (scarto >= 0 ? "+" : "−") + fmt(Math.abs(scarto)), fmt(Math.max(0, obiettivo - fatti) / settimaneRimaste), scarto >= 0 ? "✅" : "🔴"];
};
// A monte degli incarichi: quante valutazioni/appuntamenti/telefonate servono con i tassi.
const incarichiMancanti = Math.max(0, ob.incarichi - fatto.incarichi);
const servono = {
  valutazioni: incarichiMancanti * t.valutazioni_per_incarico,
  appuntamenti: incarichiMancanti * t.valutazioni_per_incarico * t.appuntamenti_per_valutazione,
};
servono.telefonate = servono.appuntamenti * t.telefonate_per_appuntamento;
const reale = (a, b) => (fatto[b] ? (fatto[a] / fatto[b]).toFixed(2) : "—");

const report = [
  `Calcolato il ${dataOggi} da \`${file}\`. Anno trascorso: ${(quotaAnno * 100).toFixed(0)}%, settimane lavorative rimaste: ${settimaneRimaste.toFixed(0)}.`,
  "",
  tabella(["", "Obiettivo", "Fatto", "Ritmo a oggi", "Scarto", "Serve a settimana", ""], [
    riga("Incarichi", ob.incarichi, fatto.incarichi),
    riga("Vendite", ob.vendite, fatto.vendite),
    riga("Provvigioni", ob.provvigioni_euro, fatto.provvigioni, euro),
  ]),
  "",
  "### Attività necessaria per gli incarichi mancanti",
  tabella(["", "Serve a settimana", "Tasso usato", "Tasso reale"], [
    ["Valutazioni", intero(servono.valutazioni / settimaneRimaste), `${t.valutazioni_per_incarico} per incarico`, reale("valutazioni", "incarichi")],
    ["Appuntamenti", intero(servono.appuntamenti / settimaneRimaste), `${t.appuntamenti_per_valutazione} per valutazione`, reale("appuntamenti", "valutazioni")],
    ["Telefonate", intero(servono.telefonate / settimaneRimaste), `${t.telefonate_per_appuntamento} per appuntamento`, reale("telefonate", "appuntamenti")],
  ]),
  sconosciuti.length ? `\n⚠️ Tipi di attività non riconosciuti (aggiungerli a TIPI in obiettivo.mjs): ${[...new Set(sconosciuti)].join(", ")}` : "",
].join("\n");

// Attività della ricerca: ultime 4 settimane per agente.
const da = new Date(new Date(dataOggi) - 27 * 86400000).toISOString().slice(0, 10);
const recenti = attivita.filter((r) => r.data >= da);
const agenti = [...new Set(recenti.map((r) => r.agente))].sort();
const pct = (a, b) => (b ? Math.round((a / b) * 100) + "%" : "—");
const ricerca = [
  `Ultime 4 settimane (dal ${da} al ${dataOggi}), fonte \`${file}\`.`,
  "",
  tabella(["Agente", "Telefonate", "Appuntamenti", "Tel→App", "Valutazioni", "Incarichi", "Val→Inc", "Vendite"],
    agenti.map((a) => {
      const r = recenti.filter((x) => x.agente === a);
      const [tel, app, val, inc] = ["telefonata", "appuntamento", "valutazione", "incarico"].map((k) => conta(r, k));
      return [a, tel, app, pct(app, tel), val, inc, pct(inc, val), conta(r, "vendita")];
    })),
].join("\n");

if (salva) {
  console.log("Aggiornato:", aggiornaBlocco("06 Numeri/Obiettivo.md", "obiettivo", report));
  console.log("Aggiornato:", aggiornaBlocco("06 Numeri/Attività della ricerca.md", "ricerca", ricerca));
} else console.log(report + "\n\n## Attività della ricerca\n" + ricerca);
