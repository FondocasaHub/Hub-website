// Edge Function "recensioni-google" — recensioni Google con il nome dell'agente → rating (19/11/2026).
// Va deployata con "Verify JWT" DISATTIVATO: la chiama pg_cron ogni 6 ore (job recensioni-google-6h)
// e il pulsante «Leggi ora da Google» dell'Area Agenti. Non riceve dati: legge da sola
// https://www.fondocasahub.com/api/recensioni (le 5 recensioni più recenti della scheda Google,
// già filtrate da collaboratori e soci) e le registra in public.recensioni_agente.
//
// Abbinamento al collaboratore (testo della recensione, senza accenti e maiuscole):
//  - nome e cognome o solo cognome → certo;
//  - solo nome (o diminutivo: Nico, Enzo, Salvo) → certo se nello store c'è un solo collaboratore con quel nome,
//    altrimenti la recensione resta «da assegnare» (user_id null, con i candidati) e la assegna lo Store/Team Manager;
//  - nessun nome → recensione dello store, non entra nel rating di nessuno.
// Ogni recensione Google viene letta una volta sola (tabella recensioni_google_viste).
import { createClient } from "npm:@supabase/supabase-js@2";

const FONTE = "https://www.fondocasahub.com/api/recensioni";
const DIMINUTIVI: Record<string, string[]> = { nicola: ["nico"], vincenzo: ["enzo"], salvatore: ["salvo"] };

const norm = (s: string) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const parola = (testo: string, p: string) => p.length >= 3 && new RegExp(`(^|[^a-z])${p.replace(/[^a-z ]/g, "")}([^a-z]|$)`).test(testo);

async function idDi(r: { nome?: string; ts?: number; testo?: string }) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${r.nome}|${r.ts}|${(r.testo || "").slice(0, 80)}`));
  return [...new Uint8Array(buf)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async () => {
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const risposta = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
  try {
    const r = await fetch(FONTE, { headers: { "User-Agent": "fondocasahub-recensioni" } });
    if (!r.ok) return risposta({ errore: `Recensioni non disponibili (${r.status})` }, 502);
    const { recensioni = [] } = await r.json();

    const { data: profili, error: e1 } = await db.from("profiles").select("id, nome, ruolo").eq("attivo", true).neq("ruolo", "staff");
    if (e1) throw e1;
    const persone = (profili || []).filter((p) => (p.nome || "").trim()).map((p) => {
      const pezzi = norm(p.nome).trim().split(/\s+/);
      return { id: p.id, completo: pezzi.join(" "), nome: pezzi[0], cognome: pezzi.slice(1).join(" ") };
    });
    const conta: Record<string, number> = {};
    persone.forEach((p) => { conta[p.nome] = (conta[p.nome] || 0) + 1; });

    let nuove = 0, assegnate = 0, ambigue = 0;
    for (const rec of recensioni) {
      const gid = await idDi(rec);
      const { data: vista } = await db.from("recensioni_google_viste").select("google_id").eq("google_id", gid).maybeSingle();
      if (vista) continue;
      nuove++;
      const testo = norm(rec.testo || "");
      const certi = new Set<string>();
      const perNome: Record<string, string[]> = {};
      for (const p of persone) {
        if (parola(testo, p.completo) || (p.cognome.length >= 4 && parola(testo, p.cognome))) { certi.add(p.id); continue; }
        const nomi = [p.nome, ...(DIMINUTIVI[p.nome] || [])];
        if (nomi.some((n) => parola(testo, n))) (perNome[p.nome] ||= []).push(p.id);
      }
      for (const [nome, ids] of Object.entries(perNome)) {
        if (ids.some((id) => certi.has(id))) continue;
        if (ids.length === 1 && conta[nome] === 1) certi.add(ids[0]);
        else {
          const { error } = await db.from("recensioni_agente").insert({
            user_id: null, data: new Date(rec.ts || Date.now()).toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" }),
            fonte: "google", stelle: Math.min(5, Math.max(1, Math.round(rec.rating || 5))), cliente: (rec.nome || "").slice(0, 120),
            testo: (rec.testo || "").slice(0, 4000), candidati: ids, google_id: gid, creato_da: null,
          });
          if (error) throw error;
          ambigue++;
        }
      }
      for (const id of certi) {
        const { error } = await db.from("recensioni_agente").insert({
          user_id: id, data: new Date(rec.ts || Date.now()).toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" }),
          fonte: "google", stelle: Math.min(5, Math.max(1, Math.round(rec.rating || 5))), cliente: (rec.nome || "").slice(0, 120),
          testo: (rec.testo || "").slice(0, 4000), google_id: gid, creato_da: null,
        });
        if (error) throw error;
        assegnate++;
      }
      const { error: e2 } = await db.from("recensioni_google_viste").insert({ google_id: gid });
      if (e2) throw e2;
    }
    return risposta({ ok: true, lette: recensioni.length, nuove, assegnate, da_assegnare: ambigue });
  } catch (e) {
    console.error("recensioni-google:", e);
    return risposta({ errore: (e as Error).message || "Errore" }, 500);
  }
});
