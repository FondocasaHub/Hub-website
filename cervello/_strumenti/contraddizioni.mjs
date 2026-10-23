// Contraddizioni nei nostri annunci: prezzo, classe energetica e mq diversi tra portali, parole vietate.
// Uso: node _strumenti/contraddizioni.mjs <fotografia annunci.csv> [--salva]
// Legge solo le righe con agenzia = fondocasa-hub (si può passare --agenzia=codice per un'altra).
import { leggiCSV, leggiParametri, norm, num, euro, tabella, aggiornaBlocco, argomenti } from "./lib.mjs";

const { salva, pos, opz } = argomenti();
if (!pos.length) {
  console.error("Uso: node _strumenti/contraddizioni.mjs <annunci.csv> [--salva]");
  process.exit(1);
}
const agenzia = opz.agenzia || "fondocasa-hub";
const file = pos[0];
const righe = leggiCSV(file).filter((r) => r.agenzia === agenzia);
const { parole_vietate_annunci: vietate } = leggiParametri();
const data = righe[0]?.data || "";

const perAnnuncio = new Map();
for (const r of righe) {
  if (!perAnnuncio.has(r.id_annuncio)) perAnnuncio.set(r.id_annuncio, []);
  perAnnuncio.get(r.id_annuncio).push(r);
}

const problemi = [];
for (const [id, gruppo] of perAnnuncio) {
  const dove = `${gruppo[0].via} ${gruppo[0].civico || ""}`.trim();
  const diversi = (campo, fmt = (x) => x) => {
    const valori = new Map(gruppo.map((r) => [fmt(r[campo]), r.portale]));
    return valori.size > 1 ? gruppo.map((r) => `${r.portale}: ${fmt(r[campo]) || "vuoto"}`).join(" · ") : null;
  };
  const prezzo = diversi("prezzo", (v) => euro(num(v)));
  if (prezzo) problemi.push([id, dove, "Prezzo diverso tra portali", prezzo]);
  const classe = diversi("classe_energetica", (v) => (v || "").toUpperCase());
  if (classe) problemi.push([id, dove, "Classe energetica diversa", classe]);
  const mq = diversi("mq", (v) => String(num(v)));
  if (mq) problemi.push([id, dove, "Superficie diversa", mq]);
  for (const r of gruppo) {
    if (!r.classe_energetica) problemi.push([id, dove, "Classe energetica mancante", r.portale]);
    const testo = " " + norm(`${r.titolo} ${r.descrizione}`) + " ";
    const trovate = vietate.filter((p) => testo.includes(" " + norm(p) + " "));
    if (trovate.length) problemi.push([id, dove, "Parole vietate", `${r.portale}: ${trovate.join(", ")}`]);
  }
}

const report = `Report del ${data} su ${perAnnuncio.size} annunci di \`${agenzia}\` (fonte: \`${file}\`). Problemi: **${problemi.length}**.\n\n` +
  (problemi.length ? tabella(["Rif.", "Immobile", "Problema", "Dettaglio"], problemi) : "Nessuna contraddizione trovata.");
if (salva) console.log("Aggiornato:", aggiornaBlocco("09 Controlli/Contraddizioni.md", "contraddizioni", report));
else console.log(report);
