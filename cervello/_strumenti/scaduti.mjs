// Scaduti del lunedì: confronta due fotografie degli annunci dei competitor.
// Uso: node _strumenti/scaduti.mjs <fotografia precedente.csv> <fotografia attuale.csv> [--salva]
import { leggiCSV, normVia, num, euro, giorniTra, tabella, salvaNota, argomenti } from "./lib.mjs";

const { salva, pos } = argomenti();
if (pos.length < 2) {
  console.error("Uso: node _strumenti/scaduti.mjs <precedente.csv> <attuale.csv> [--salva]");
  process.exit(1);
}
const [filePrima, fileOra] = pos;
const NOSTRA = "fondocasa-hub";
const prima = leggiCSV(filePrima).filter((r) => r.agenzia !== NOSTRA);
const ora = leggiCSV(fileOra).filter((r) => r.agenzia !== NOSTRA);
const dataOra = ora[0]?.data || "";

const chiave = (r) => `${r.agenzia}|${r.id_annuncio}`;
// Stesso immobile anche se cambia agenzia: via + civico + mq con tolleranza di 3 mq.
const stessoImmobile = (a, b) =>
  normVia(a.via) === normVia(b.via) && (a.civico || "") === (b.civico || "") && Math.abs(num(a.mq) - num(b.mq)) <= 3;
const venduto = (r) => /vendut|sotto offerta|trattativa|compromesso/i.test(r.stato || "");

// Un annuncio compare su più portali: si tiene una riga per agenzia + id.
const unici = (righe) => [...new Map(righe.map((r) => [chiave(r), r])).values()];
const precedenti = unici(prima).filter((r) => !venduto(r));
const attuali = new Map(unici(ora).map((r) => [chiave(r), r]));

const esiti = { sparito: [], venduto: [], passato: [], ribassato: [] };
for (const p of precedenti) {
  const a = attuali.get(chiave(p));
  if (a && venduto(a)) esiti.venduto.push({ p, a });
  else if (a) {
    if (num(a.prezzo) < num(p.prezzo)) esiti.ribassato.push({ p, a });
  } else {
    const altrove = [...attuali.values()].find((x) => x.agenzia !== p.agenzia && stessoImmobile(x, p));
    if (altrove) esiti.passato.push({ p, a: altrove });
    else esiti.sparito.push({ p });
  }
}

const giorni = (r) => (r.primo_avvistamento ? giorniTra(r.primo_avvistamento, dataOra || r.data) : NaN);
const indirizzo = (r) => [r.via, r.civico].filter(Boolean).join(" ");
const euroMq = (r) => euro(num(r.prezzo) / num(r.mq));
esiti.sparito.sort((x, y) => (giorni(y.p) || 0) - (giorni(x.p) || 0));

const sezioni = [
  `# Scaduti del ${dataOra}`,
  "",
  `Confronto tra \`${filePrima}\` e \`${fileOra}\`. Annunci competitor confrontati: ${precedenti.length}.`,
  "",
  `## Da chiamare: spariti senza "venduto" (${esiti.sparito.length})`,
  "Ordinati per giorni online: chi è rimasto di più è il più frustrato.",
  "",
  tabella(
    ["Agenzia", "Indirizzo", "Zona", "mq", "Ultimo prezzo", "€/mq", "Giorni online", "Link", "Chiamato", "Esito"],
    esiti.sparito.map(({ p }) => [p.agenzia, indirizzo(p), p.zona, p.mq, euro(num(p.prezzo)), euroMq(p), isNaN(giorni(p)) ? "—" : giorni(p), p.link || "", "[ ]", ""])
  ),
  "",
  `## Ribassati (${esiti.ribassato.length})`,
  tabella(["Agenzia", "Indirizzo", "mq", "Prima", "Ora", "Ribasso"],
    esiti.ribassato.map(({ p, a }) => [p.agenzia, indirizzo(p), p.mq, euro(num(p.prezzo)), euro(num(a.prezzo)), ((1 - num(a.prezzo) / num(p.prezzo)) * 100).toFixed(1) + "%"])),
  "",
  `## Passati a un'altra agenzia (${esiti.passato.length})`,
  tabella(["Indirizzo", "mq", "Da", "A", "Prezzo prima", "Prezzo ora"],
    esiti.passato.map(({ p, a }) => [indirizzo(p), p.mq, p.agenzia, a.agenzia, euro(num(p.prezzo)), euro(num(a.prezzo))])),
  "",
  `## Venduti o sotto offerta (${esiti.venduto.length}) – dati di via, non si chiama`,
  tabella(["Agenzia", "Indirizzo", "mq", "Ultimo prezzo", "€/mq", "Stato"],
    esiti.venduto.map(({ p, a }) => [p.agenzia, indirizzo(p), p.mq, euro(num(a.prezzo || p.prezzo)), euroMq(a.prezzo ? a : p), a.stato])),
  "",
  "Copione: [[03 Onboarding/Copioni#1. Proprietario di un annuncio scaduto]]. Prima di chiamare: il proprietario è in Vendilo? Ha chiesto di non essere ricontattato?",
];
const testo = `---\ntipo: scaduti\ndata: ${dataOra}\nfonti: ["${filePrima}", "${fileOra}"]\n---\n` + sezioni.join("\n") + "\n";

if (salva) console.log("Salvato:", salvaNota(`04 Acquisizione/Scaduti/${dataOra} Scaduti.md`, testo));
else console.log(testo);
