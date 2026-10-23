// Analisi di una via: prezzi richiesti dai portali (fotografia annunci) e compravenduti euromq.
// Uso: node _strumenti/via.mjs <fotografia annunci.csv> "<via>" [--salva]
import fs from "node:fs";
import path from "node:path";
import { VAULT, leggiCSV, normVia, slug, num, euro, mediana, giorniTra, tabella, salvaNota, argomenti } from "./lib.mjs";

const { salva, pos, opz } = argomenti();
if (pos.length < 2) {
  console.error('Uso: node _strumenti/via.mjs <annunci.csv> "<via>" [--salva]');
  process.exit(1);
}
const [fileAnnunci, viaRichiesta] = pos;
const tutte = leggiCSV(fileAnnunci);
// Il nome della via si prende come è scritto nei dati, se c'è.
const via = tutte.find((r) => normVia(r.via) === normVia(viaRichiesta))?.via || viaRichiesta;
const data = tutte[0]?.data || "";
// Un annuncio su più portali conta una volta.
const annunci = [...new Map(tutte.filter((r) => normVia(r.via) === normVia(via)).map((r) => [`${r.agenzia}|${r.id_annuncio}`, r])).values()];
const online = annunci.filter((r) => !/vendut/i.test(r.stato || ""));
const mqPrezzo = (r) => num(r.prezzo) / num(r.mq);
const ribassati = online.filter((r) => num(r.prezzo_iniziale) > num(r.prezzo));

// --euromq=cartella per usare un'altra cartella (es. _fonti/esempio)
const fileEuromq = path.join(opz.euromq ? path.resolve(opz.euromq) : path.join(VAULT, "_fonti/euromq"), slug(via) + ".csv");
const atti = fs.existsSync(fileEuromq) ? leggiCSV(fileEuromq) : null;
const fonteEuromq = path.relative(VAULT, fileEuromq);

const righe = [
  `# ${via}`,
  "",
  `Dati al ${data}. Fonti: \`${fileAnnunci}\`${atti ? `, \`${fonteEuromq}\`` : ""}.`,
  "",
  "## In sintesi",
  `- Annunci online: **${online.length}**${ribassati.length ? `, di cui **${ribassati.length} ${ribassati.length === 1 ? "ribassato" : "ribassati"}**` : ""}`,
  `- Prezzo richiesto mediano: **${euro(mediana(online.map(mqPrezzo)))}/mq**` + (online.length ? ` (da ${euro(Math.min(...online.map(mqPrezzo)))} a ${euro(Math.max(...online.map(mqPrezzo)))})` : ""),
  atti
    ? `- Compravenduti euromq: **${atti.length}**, prezzo pagato mediano **${euro(mediana(atti.map(mqPrezzo)))}/mq**`
    : `- Compravenduti: DATO MANCANTE – scarica l'export euromq della via in \`_fonti/euromq/${slug(via)}.csv\``,
];
if (atti && online.length) {
  const scarto = (mediana(online.map(mqPrezzo)) / mediana(atti.map(mqPrezzo)) - 1) * 100;
  righe.push(`- Il richiesto è il **${scarto.toFixed(0)}%** ${scarto >= 0 ? "sopra" : "sotto"} il pagato`);
}
if (online.length < 5 && (!atti || atti.length < 3)) righe.push("- ⚠️ Campione piccolo: non basta per indicare un prezzo. Allargare alla microzona.");

righe.push("", "## Annunci nella via",
  tabella(["Agenzia", "Civico", "mq", "Prezzo", "€/mq", "Classe", "Giorni online", "Ribasso", "Stato"],
    annunci.map((r) => [r.agenzia, r.civico, r.mq, euro(num(r.prezzo)), euro(mqPrezzo(r)), r.classe_energetica || "—",
      r.primo_avvistamento ? giorniTra(r.primo_avvistamento, data) : "—",
      num(r.prezzo_iniziale) > num(r.prezzo) ? ((1 - num(r.prezzo) / num(r.prezzo_iniziale)) * 100).toFixed(1) + "%" : "",
      r.stato])));
if (atti) {
  righe.push("", "## Compravenduti (euromq)",
    tabella(["Data atto", "Civico", "mq", "Prezzo", "€/mq"], atti.map((r) => [r.data_atto, r.civico, r.mq, euro(num(r.prezzo)), euro(mqPrezzo(r))])));
}
righe.push("", "## Cosa si vende e cosa resta fermo", "_(commento dell'agente di zona)_", "", "## Palazzi, portinerie, amministratori", "");

const testo = `---\ntipo: via\nvia: ${via}\naggiornato: ${data}\nfonti: ["${fileAnnunci}"${atti ? `, "${fonteEuromq}"` : ""}]\n---\n` + righe.join("\n") + "\n";
if (salva) console.log("Salvato:", salvaNota(`04 Acquisizione/Vie/${via}.md`, testo));
else console.log(testo);
