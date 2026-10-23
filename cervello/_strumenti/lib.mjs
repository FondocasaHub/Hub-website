// Funzioni comuni agli script del Cervello. Solo moduli di Node, niente da installare.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const VAULT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function leggiParametri() {
  return JSON.parse(fs.readFileSync(path.join(VAULT, "_config/parametri.json"), "utf8"));
}

// CSV con separatore "," o ";" (scelto dalla prima riga) e campi tra virgolette.
export function leggiCSV(file) {
  let testo = fs.readFileSync(file, "utf8").replace(/^﻿/, "");
  const primaRiga = testo.split(/\r?\n/, 1)[0];
  const sep = (primaRiga.match(/;/g) || []).length > (primaRiga.match(/,/g) || []).length ? ";" : ",";
  const righe = [];
  let campo = "", riga = [], virgolette = false;
  for (let i = 0; i < testo.length; i++) {
    const c = testo[i];
    if (virgolette) {
      if (c === '"' && testo[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') virgolette = false;
      else campo += c;
    } else if (c === '"') virgolette = true;
    else if (c === sep) { riga.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && testo[i + 1] === "\n") i++;
      riga.push(campo); campo = "";
      if (riga.some((v) => v.trim() !== "")) righe.push(riga);
      riga = [];
    } else campo += c;
  }
  riga.push(campo);
  if (riga.some((v) => v.trim() !== "")) righe.push(riga);
  const [intestazioni, ...dati] = righe;
  const chiavi = intestazioni.map((h) => norm(h).replace(/ /g, "_"));
  return dati.map((r) => Object.fromEntries(chiavi.map((k, i) => [k, (r[i] ?? "").trim()])));
}

export function scriviCSV(file, righe, colonne) {
  const esc = (v) => (/[",;\n]/.test(String(v ?? "")) ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ""));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, [colonne.join(","), ...righe.map((r) => colonne.map((c) => esc(r[c])).join(","))].join("\n") + "\n");
}

// Minuscolo, senza accenti e punteggiatura, spazi singoli.
export function norm(s) {
  return String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

// Via confrontabile: "V. A. G. Barrili" e "Via Anton Giulio Barrili" restano diverse, ma
// "via barrili" e "Via Barrili" no. Toglie il prefisso toponomastico.
export function normVia(s) {
  return norm(s).replace(/^(via|viale|v|piazza|p zza|largo|vico|vicolo|salita|corso|calata|rampa|traversa)\s+/, "");
}

export function slug(s) {
  return norm(s).replace(/ /g, "-");
}

// "€ 285.000", "285000", "285.000,50" -> numero
export function num(s) {
  if (s === undefined || s === null || s === "") return NaN;
  let t = String(s).replace(/[€\s]/g, "");
  if (/,\d{1,2}$/.test(t)) t = t.replace(/\./g, "").replace(",", ".");
  else t = t.replace(/[.,](?=\d{3}(\D|$))/g, "");
  return Number(t);
}

// Punto delle migliaia anche a 4 cifre (4.667), come si scrive in agenzia.
export function intero(n) {
  if (!isFinite(n)) return "—";
  const r = Math.round(n);
  return (r < 0 ? "-" : "") + String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function euro(n) {
  return isFinite(n) ? "€ " + intero(n) : "—";
}

export function mediana(v) {
  const a = v.filter((x) => isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return NaN;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

export function oggi() {
  return new Date().toISOString().slice(0, 10);
}

export function giorniTra(da, a) {
  const d1 = new Date(da), d2 = new Date(a);
  return isNaN(d1) || isNaN(d2) ? NaN : Math.round((d2 - d1) / 86400000);
}

export function tabella(colonne, righe) {
  const riga = (v) => "| " + v.map((x) => String(x ?? "").replace(/\|/g, "/")).join(" | ") + " |";
  return [riga(colonne), riga(colonne.map(() => "---")), ...righe.map(riga)].join("\n");
}

export function salvaNota(relativo, contenuto) {
  const file = path.join(VAULT, relativo);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contenuto);
  return file;
}

// Sostituisce il testo tra <!-- nome:inizio --> e <!-- nome:fine --> in una nota esistente.
export function aggiornaBlocco(relativo, nome, contenuto) {
  const file = path.join(VAULT, relativo);
  const testo = fs.readFileSync(file, "utf8");
  const re = new RegExp(`(<!-- ${nome}:inizio -->)[\\s\\S]*?(<!-- ${nome}:fine -->)`);
  if (!re.test(testo)) throw new Error(`Blocco ${nome} non trovato in ${relativo}`);
  fs.writeFileSync(file, testo.replace(re, `$1\n${contenuto}\n$2`));
  return file;
}

export function argomenti() {
  const salva = process.argv.includes("--salva");
  const pos = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  // Opzioni nella forma --nome=valore
  const opz = Object.fromEntries(process.argv.slice(2).filter((a) => /^--\w+=/.test(a)).map((a) => a.slice(2).split(/=(.*)/s).slice(0, 2)));
  return { salva, pos, opz };
}
