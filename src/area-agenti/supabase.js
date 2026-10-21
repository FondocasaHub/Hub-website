// Client Supabase dell'area riservata agenti.
// URL e chiave "publishable" sono pubblici per design: la sicurezza è data
// dalle regole RLS sul database (vedi supabase/area-agenti-schema.sql).
// La chiave segreta NON deve mai comparire nel codice del sito.
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://iymxkvrgkhfaqcyxjsyz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NBu5yxfOtUSRW-ZYFL4JgQ_QBOxIVYT";

// Link di invito o di recupero password: Supabase aggiunge "type=invite" o
// "type=recovery" nell'hash dell'URL. Lo leggiamo prima che il client lo
// cancelli, per mostrare la schermata "Scegli la password".
const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
export const LINK_TYPE = hashParams.get("type"); // "invite" | "recovery" | null
export const LINK_ERROR = hashParams.get("error_description");

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const BUCKET = "documenti";

// Cartelle dell'archivio: la visibilità reale è decisa dal database
// (funzione posso_vedere_cartella); qui servono solo nomi ed etichette.
export const CARTELLE = [
  { id: "01-tutti", nome: "Per tutti", descr: "Organigramma, mansionari, regole dello store, brand" },
  { id: "02-agenti", nome: "Agenti", descr: "Modulistica incarichi e proposte, procedure, script" },
  { id: "03-credito", nome: "Credito", descr: "Modulistica mutui, banche convenzionate" },
  { id: "04-manager", nome: "Manager", descr: "Obiettivi, riunione del lunedì, piano compensi, report" },
  { id: "05-amministrazione", nome: "Amministrazione", descr: "Rendiconti provvigionali, fatturazione" },
  { id: "06-marketing", nome: "Marketing", descr: "Loghi, template, materiale campagne" },
];

// Sottocartelle: stessa visibilità della cartella madre (la regola RLS guarda
// solo il primo livello del percorso).
export const SOTTOCARTELLE = {
  "02-agenti": [
    { id: "BUYER AGENT", nome: "BUYER AGENT", descr: "Incarichi di ricerca in esclusiva e modulistica acquirenti" },
  ],
};

export const RUOLI = [
  { id: "admin", nome: "Admin" },
  { id: "manager", nome: "Manager" },
  { id: "agente", nome: "Agente" },
  { id: "credito", nome: "Credito" },
  { id: "staff", nome: "Staff" },
];

export const REPARTI = [
  { id: "", nome: "—" },
  { id: "amministrazione", nome: "Amministrazione" },
  { id: "marketing", nome: "Marketing" },
  { id: "property", nome: "Property" },
];
