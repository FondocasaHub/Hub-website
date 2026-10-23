// Controllo del venerdì: pagine vecchie, dati mancanti, decisioni non prese, link rotti.
// Uso: node _strumenti/lint.mjs [--salva] [--oggi=AAAA-MM-GG]
import fs from "node:fs";
import path from "node:path";
import { VAULT, leggiParametri, giorniTra, oggi, tabella, salvaNota, argomenti } from "./lib.mjs";

const { salva, opz } = argomenti();
const dataOggi = opz.oggi || oggi();
const { lint: soglie } = leggiParametri();
const ESCLUSE = new Set(["_modelli", "_fonti", "_strumenti", ".obsidian", ".trash", "node_modules"]);
const DA_AGGIORNARE = new Set(["agenzia", "procedura", "onboarding", "via", "agente", "numeri", "config"]);

const note = [];
(function cammina(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ESCLUSE.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) cammina(p);
    else if (e.name.endsWith(".md")) note.push(path.relative(VAULT, p));
  }
})(VAULT);

const frontmatter = (testo) => {
  const m = testo.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  return Object.fromEntries(m[1].split("\n").map((l) => l.match(/^([\w_]+):\s*(.*)$/)).filter(Boolean).map(([, k, v]) => [k, v.trim()]));
};
const nomi = new Set(note.flatMap((n) => [n.replace(/\.md$/, ""), path.basename(n, ".md")]));
const problemi = { vecchie: [], mancanti: [], decisioni: [], link: [], schede: [] };

for (const n of note) {
  if (/(^|\/)README\.md$/.test(n) || n === "CLAUDE.md") continue;
  const testo = fs.readFileSync(path.join(VAULT, n), "utf8");
  const fm = frontmatter(testo);
  if (!fm) { problemi.mancanti.push([n, "manca il frontmatter (tipo, aggiornato…)"]); continue; }
  if (DA_AGGIORNARE.has(fm.tipo)) {
    const eta = giorniTra(fm.aggiornato, dataOggi);
    if (!fm.aggiornato) problemi.vecchie.push([n, "manca la data `aggiornato`", fm.responsabile || "—"]);
    else if (eta > soglie.giorni_pagina_vecchia) problemi.vecchie.push([n, `aggiornata ${eta} giorni fa`, fm.responsabile || "—"]);
  }
  const vuoti = (testo.match(/DA COMPILARE|DATO MANCANTE|DA DECIDERE/g) || []).length;
  if (vuoti) problemi.mancanti.push([n, `${vuoti} campi DA COMPILARE / DATO MANCANTE / DA DECIDERE`]);
  if (fm.tipo === "decisione" && fm.stato === "da decidere") {
    const scaduta = fm.scadenza && fm.scadenza < dataOggi;
    const ferma = giorniTra(fm.data, dataOggi) > soglie.giorni_decisione_aperta;
    if (scaduta || ferma) problemi.decisioni.push([n, scaduta ? `scadenza ${fm.scadenza} superata` : `aperta da ${giorniTra(fm.data, dataOggi)} giorni`, fm.responsabile || "—"]);
  }
  if (fm.tipo === "agente" && fm.attivo === "true") {
    const mancano = ["vendilo_id", "zona", "team"].filter((k) => !fm[k]);
    if (mancano.length) problemi.schede.push([n, "mancano: " + mancano.join(", ")]);
  }
  const senzaCodice = testo.replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`/g, "");
  for (const [, link] of senzaCodice.matchAll(/\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]/g)) {
    const bersaglio = link.trim().replace(/\.md$/, "");
    if (!nomi.has(bersaglio) && !nomi.has(path.join(path.dirname(n), bersaglio))) problemi.link.push([n, `[[${bersaglio}]]`]);
  }
}

const totale = Object.values(problemi).reduce((s, v) => s + v.length, 0);
const sez = (titolo, col, righe) => `## ${titolo} (${righe.length})\n` + (righe.length ? tabella(col, righe) : "Niente da segnalare.") + "\n";
const testo = `---\ntipo: lint\ndata: ${dataOggi}\n---\n# Controllo del venerdì – ${dataOggi}\n\nNote controllate: ${note.length}. Voci da sistemare: **${totale}**.\n\n` +
  sez("Decisioni non prese", ["Nota", "Problema", "Responsabile"], problemi.decisioni) + "\n" +
  sez(`Pagine vecchie (oltre ${soglie.giorni_pagina_vecchia} giorni)`, ["Nota", "Problema", "Responsabile"], problemi.vecchie) + "\n" +
  sez("Dati mancanti", ["Nota", "Problema"], problemi.mancanti) + "\n" +
  sez("Schede agente incomplete", ["Nota", "Problema"], problemi.schede) + "\n" +
  sez("Link rotti", ["Nota", "Link"], problemi.link);

if (salva) console.log("Salvato:", salvaNota(`09 Controlli/Lint/${dataOggi} Lint.md`, testo));
else console.log(testo);
