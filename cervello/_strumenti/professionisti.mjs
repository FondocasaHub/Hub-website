// Censimento professionisti: categoria, pulizia e niente doppioni, pronto per l'import in Vendilo.
// Uso: node _strumenti/professionisti.mjs <file.csv> [altri.csv…] [--salva]
import path from "node:path";
import { VAULT, leggiCSV, scriviCSV, norm, tabella, argomenti, oggi } from "./lib.mjs";

const { salva, pos } = argomenti();
if (!pos.length) {
  console.error("Uso: node _strumenti/professionisti.mjs <file.csv> [--salva]");
  process.exit(1);
}
const CATEGORIE = [
  ["notaio", /notai|notarile/],
  ["amministratore di condominio", /amministrat|condomin/],
  ["avvocato", /avvocat|legale|avv\b/],
  ["commercialista", /commercialist|dottore commercialista|fiscal|caf\b/],
  ["tecnico (geometra/architetto/ingegnere)", /geometr|architett|ingegner|tecnico|studio tecnico/],
  ["banca/mediatore creditizio", /banca|credito|mutu/],
];
const categoria = (r) => {
  const testo = norm(`${r.categoria} ${r.nome} ${r.studio}`);
  return (CATEGORIE.find(([, re]) => re.test(testo)) || ["altro"])[0];
};
const telefono = (s) => String(s || "").replace(/\D/g, "").replace(/^0039|^39(?=3\d{8,9}$)/, "");
const pulisciNome = (s) => String(s || "").replace(/\s+/g, " ").trim().replace(/\b(dott|dott\.ssa|avv|notaio|arch|geom|ing)\.?\s+/gi, "").trim();

const tutti = pos.flatMap((f) => leggiCSV(f).map((r) => ({ ...r, fonte: r.fonte || path.basename(f) })));
const visti = new Map();
let doppioni = 0;
for (const r of tutti) {
  const pulito = { categoria: categoria(r), nome: pulisciNome(r.nome), studio: r.studio || "", indirizzo: r.indirizzo || "",
    telefono: telefono(r.telefono), email: (r.email || "").toLowerCase(), sito: r.sito || "", fonte: r.fonte };
  // Doppione se coincide telefono, email o nome + via.
  const chiavi = [pulito.telefono && "t" + pulito.telefono, pulito.email && "e" + pulito.email,
    "n" + norm(pulito.nome) + "|" + norm(pulito.indirizzo).split(" ").slice(0, 3).join(" ")].filter(Boolean);
  const esistente = chiavi.map((k) => visti.get(k)).find(Boolean);
  if (esistente) {
    doppioni++;
    for (const [k, v] of Object.entries(pulito)) if (!esistente[k] && v) esistente[k] = v; // completa i campi vuoti
    if (!esistente.fonte.includes(pulito.fonte)) esistente.fonte += "; " + pulito.fonte;
    chiavi.forEach((k) => visti.set(k, esistente));
  } else chiavi.forEach((k) => visti.set(k, pulito));
}
const elenco = [...new Set(visti.values())].sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nome.localeCompare(b.nome));
const perCategoria = Object.entries(elenco.reduce((m, r) => ({ ...m, [r.categoria]: (m[r.categoria] || 0) + 1 }), {}));

console.log(`Righe lette: ${tutti.length} · doppioni uniti: ${doppioni} · professionisti: ${elenco.length}\n`);
console.log(tabella(["Categoria", "Numero"], perCategoria));
if (salva) {
  const out = path.join(VAULT, "_fonti/professionisti", `${oggi()} per Vendilo.csv`);
  scriviCSV(out, elenco, ["categoria", "nome", "studio", "indirizzo", "telefono", "email", "sito", "fonte"]);
  console.log("\nSalvato:", out, "\nControlla che le colonne corrispondano al modello di import di Vendilo prima di caricarlo.");
}
