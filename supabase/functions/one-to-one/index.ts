// Edge Function "one-to-one" (richiesta di Nicola, preparata da Sensoria il 19/11/2026).
// Il One to One mensile si fa l'ultimo giorno lavorativo del mese, dalle 11:00 (orari in one_to_one_impostazioni).
// La funzione:
//   - calcola il giorno e gli orari liberi, togliendo gli impegni del calendario dei One to One di Nicola,
//     gli orari già presi e quelli chiusi da Nicola;
//   - prenota, sposta e disdice il One to One di chi chiama (o, per il coach, di un collaboratore);
//   - manda l'invito di calendario (file .ics) al collaboratore e all'email dei One to One di Nicola, così
//     l'appuntamento entra nei loro Google Calendar; spostando arriva l'aggiornamento, disdicendo la disdetta.
//
// Secrets in Supabase → Edge Functions → Secrets:
//   BREVO_SMTP_USER, BREVO_SMTP_PASS   (già impostati per le altre notifiche)
//   ONE_TO_ONE_ICS                      «Indirizzo segreto in formato iCal» del calendario dei One to One di Nicola
//                                       (Google Calendar → Impostazioni → il calendario → Integra calendario).
//                                       Serve solo a sapere quando è occupato: titoli e dettagli non escono mai.
//                                       Senza, gli orari tengono conto solo delle prenotazioni del sito.
// La funzione agisce sempre con il token di chi la chiama (regole RLS): non usa la chiave segreta.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import ICAL from "https://esm.sh/ical.js@1.5.0";

const MITTENTE_EMAIL = "info@fondocasahub.com";
const MITTENTE = `FondoCasa Hub - Area Agenti <${MITTENTE_EMAIL}>`;
const LUOGO = "FC Punto Hub, Via Pietro Mascagni 35, Napoli";
const AREA = "https://www.fondocasahub.com/area-agenti/one-to-one";
const TZ = "Europe/Rome";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const risposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });
class Errore extends Error {}

/* ---------------- date (ora di Roma) ---------------- */
const due = (n: number) => String(n).padStart(2, "0");
const isoGiorno = (d: Date) => `${d.getUTCFullYear()}-${due(d.getUTCMonth() + 1)}-${due(d.getUTCDate())}`;
const piuGiorni = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return isoGiorno(d); };

// Scostamento di Roma da UTC (minuti) in un istante: +60 d'inverno, +120 d'estate.
function scostamento(t: Date): number {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit",
    day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(t).map((x) => [x.type, x.value]));
  return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - t.getTime()) / 60000;
}
// Le ore «hh:mm» del giorno iso, a Roma, come istante.
function aRoma(iso: string, hm: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  const [h, mi] = hm.split(":").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, h, mi));
  const t = new Date(guess.getTime() - scostamento(guess) * 60000);
  return new Date(guess.getTime() - scostamento(t) * 60000);
}
const oraRoma = (t: Date) => new Intl.DateTimeFormat("it-IT", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(t);
const giornoBello = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("it-IT", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
const meseDi = (iso: string) => iso.slice(0, 7) + "-01";

// Festività nazionali + San Gennaro (come cancello-regole.js).
function pasqua(y: number) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mese = Math.floor((h + l - 7 * m + 114) / 31), giorno = ((h + l - 7 * m + 114) % 31) + 1;
  return `${y}-${due(mese)}-${due(giorno)}`;
}
const FISSE = ["01-01", "01-06", "04-25", "05-01", "06-02", "08-15", "09-19", "11-01", "12-08", "12-25", "12-26"];
const festivo = (iso: string) => FISSE.includes(iso.slice(5)) || iso === piuGiorni(pasqua(Number(iso.slice(0, 4))), 1);
const lavorativo = (iso: string) => { const g = new Date(`${iso}T12:00:00Z`).getUTCDay(); return g >= 1 && g <= 5 && !festivo(iso); };

// Il giorno dei One to One del mese (primo del mese iso): l'ultimo lavorativo, o quello scelto da Nicola.
function giornoDelMese(mese: string, imp: Impostazioni): string {
  const spostato = (imp.giorni_spostati || {})[mese.slice(0, 7)];
  if (typeof spostato === "string" && /^\d{4}-\d{2}-\d{2}$/.test(spostato) && meseDi(spostato) === mese) return spostato;
  let g = piuGiorni(piuGiorni(mese, 32).slice(0, 8) + "01", -1);   // ultimo giorno del mese
  while (!lavorativo(g)) g = piuGiorni(g, -1);
  return g;
}

/* ---------------- orari ---------------- */
type Impostazioni = {
  email_coach: string; nome_coach: string; dalle: string; alle: string; pausa_dalle: string | null; pausa_alle: string | null;
  durata: number; giorni_spostati: Record<string, string>; chiusi: string[];
};
const hm = (t: string | null) => (t || "").slice(0, 5);
const minuti = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

function orariDelGiorno(iso: string, imp: Impostazioni): Date[] {
  const out: Date[] = [];
  const pd = imp.pausa_dalle && imp.pausa_alle ? [minuti(hm(imp.pausa_dalle)), minuti(hm(imp.pausa_alle))] : null;
  let m = minuti(hm(imp.dalle));
  while (m + imp.durata <= minuti(hm(imp.alle))) {
    if (pd && m < pd[1] && m + imp.durata > pd[0]) { m = pd[1]; continue; }   // la pausa: si riparte dalla sua fine
    out.push(aRoma(iso, `${due(Math.floor(m / 60))}:${due(m % 60)}`));
    m += imp.durata;
  }
  return out;
}

/* ---------------- calendario di Nicola (iCal segreto) ---------------- */
type Periodo = { inizio: Date; fine: Date };
async function impegniCoach(dal: Date, al: Date): Promise<Periodo[] | null> {
  const url = Deno.env.get("ONE_TO_ONE_ICS");
  if (!url) return null;
  let testo: string;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error(String(r.status));
    testo = await r.text();
  } catch {
    throw new Errore("Non riesco a leggere il calendario dei One to One: riprova tra poco.");
  }
  return periodiOccupati(testo, dal, al);
}

export function periodiOccupati(testo: string, dal: Date, al: Date): Periodo[] {
  const cal = new ICAL.Component(ICAL.parse(testo));
  for (const tz of cal.getAllSubcomponents("vtimezone")) ICAL.TimezoneService.register(tz);
  const eventi = cal.getAllSubcomponents("vevent");
  // le singole ricorrenze modificate (RECURRENCE-ID) si legano all'evento ricorrente
  const madri = new Map<string, any>();
  const eccezioni: any[] = [];
  for (const v of eventi) {
    const e = new ICAL.Event(v);
    if (v.hasProperty("recurrence-id")) eccezioni.push(e); else madri.set(e.uid, e);
  }
  for (const x of eccezioni) { const m = madri.get(x.uid); if (m && m.isRecurring()) m.relateException(x); else madri.set(x.uid + "#" + Math.random(), x); }

  const fuori = (v: any) =>
    String(v.getFirstPropertyValue("status") || "").toUpperCase() === "CANCELLED" ||
    String(v.getFirstPropertyValue("transp") || "").toUpperCase() === "TRANSPARENT";
  const istante = (t: any) => t.isDate ? aRoma(`${t.year}-${due(t.month)}-${due(t.day)}`, "00:00") : t.toJSDate();
  const out: Periodo[] = [];
  const aggiungi = (comp: any, s: any, f: any) => {
    if (fuori(comp)) return;
    const inizio = istante(s), fine = f ? istante(f) : new Date(inizio.getTime() + (s.isDate ? 86400000 : 0));
    if (inizio < al && fine > dal) out.push({ inizio, fine });
  };
  for (const e of madri.values()) {
    if (!e.isRecurring()) { aggiungi(e.component, e.startDate, e.endDate); continue; }
    const it = e.iterator();
    for (let n = 0, prossimo = it.next(); prossimo && n < 5000; n++, prossimo = it.next()) {
      const d = e.getOccurrenceDetails(prossimo);
      if (istante(d.startDate) >= al) break;
      aggiungi(d.item.component, d.startDate, d.endDate);
    }
  }
  return out;
}

/* ---------------- invito di calendario ---------------- */
const icsTesto = (s: string) => String(s ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const icsData = (t: Date) => t.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
function piega(riga: string) {
  const out: string[] = [];
  const enc = new TextEncoder();
  let corrente = "";
  for (const ch of riga) {
    if (enc.encode(corrente + ch).length > (out.length ? 74 : 75)) { out.push(corrente); corrente = ""; }
    corrente += ch;
  }
  out.push(corrente);
  return out.join("\r\n ");
}
function invito(o: { uid: string; seq: number; inizio: Date; fine: Date; titolo: string; descrizione: string;
  invitati: { nome: string; email: string }[]; annulla: boolean }) {
  const righe = [
    "BEGIN:VCALENDAR", "PRODID:-//FC Punto Hub//Area Agenti One to One//IT", "VERSION:2.0", "CALSCALE:GREGORIAN",
    `METHOD:${o.annulla ? "CANCEL" : "REQUEST"}`, "BEGIN:VEVENT", `UID:${o.uid}`, `SEQUENCE:${o.seq}`, `DTSTAMP:${icsData(new Date())}`,
    `DTSTART:${icsData(o.inizio)}`, `DTEND:${icsData(o.fine)}`, `SUMMARY:${icsTesto(o.titolo)}`,
    `DESCRIPTION:${icsTesto(o.descrizione)}`, `LOCATION:${icsTesto(LUOGO)}`,
    `ORGANIZER;CN=FC Punto Hub - Area Agenti:mailto:${MITTENTE_EMAIL}`,
    ...o.invitati.map((x) => `ATTENDEE;CN=${icsTesto(x.nome).replace(/[":]/g, "")};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${x.email}`),
    `STATUS:${o.annulla ? "CANCELLED" : "CONFIRMED"}`, "TRANSP:OPAQUE", "END:VEVENT", "END:VCALENDAR",
  ];
  return righe.map(piega).join("\r\n") + "\r\n";
}
const ascii = (v: unknown) =>
  String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "-").replace(/\s+/g, " ").trim();
const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function mandaInvito(riga: Riga, persona: { nome: string; email: string }, imp: Impostazioni,
  cosa: "prenotato" | "spostato" | "disdetto", quando: Periodo) {
  const invitati = [persona, ...(imp.email_coach ? [{ nome: imp.nome_coach, email: imp.email_coach }] : [])]
    .filter((x) => /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/.test(x.email || ""));
  if (!invitati.length) return;
  const giorno = giornoBello(isoGiornoRoma(quando.inizio));
  const ora = oraRoma(quando.inizio), fine = oraRoma(quando.fine);
  const titolo = `One to One · ${persona.nome} con ${imp.nome_coach}`;
  const annulla = cosa === "disdetto";
  const ics = invito({ uid: riga.ics_uid, seq: riga.ics_seq, inizio: quando.inizio, fine: quando.fine, titolo, annulla, invitati,
    descrizione: `One to One mensile di ${persona.nome} con ${imp.nome_coach}.\nPrima dell'incontro compila la Verifica mensile: ${AREA}\nPer spostarlo o disdirlo: Area agenti › One to One, fino a 24 ore prima.` });
  const frase = { prenotato: "è fissato", spostato: "è stato spostato", disdetto: "è stato disdetto" }[cosa];
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#0A1628;line-height:1.5">
<p>Il One to One di <strong>${esc(persona.nome)}</strong> con ${esc(imp.nome_coach)} ${frase}:</p>
<p style="font-size:16px"><strong>${esc(giorno)}</strong>, dalle <strong>${ora}</strong> alle ${fine}<br><span style="color:#5B6577">${esc(LUOGO)}</span></p>
${annulla ? "" : `<p>L'invito per il calendario è allegato a questa email. Prima dell'incontro compila la <a href="${AREA}">Verifica mensile</a> nell'Area agenti.</p>`}
<p style="color:#5B6577;font-size:12px">Area agenti FC Punto Hub · per spostarlo o disdirlo: Area agenti › One to One, fino a 24 ore prima.</p></div>`;
  const smtp = new SMTPClient({ connection: { hostname: "smtp-relay.brevo.com", port: 465, tls: true,
    auth: { username: Deno.env.get("BREVO_SMTP_USER")!, password: Deno.env.get("BREVO_SMTP_PASS")! } } });
  try {
    await smtp.send({
      from: MITTENTE, to: invitati.map((x) => x.email),
      subject: ascii(`One to One ${cosa === "prenotato" ? "" : cosa + " "}- ${persona.nome} - ${giorno} ore ${ora}`).slice(0, 150),
      content: "auto", html,
      attachments: [{ filename: "one-to-one.ics", content: ics, encoding: "text",
        contentType: `text/calendar; charset=UTF-8; method=${annulla ? "CANCEL" : "REQUEST"}` }],
    });
  } finally {
    await smtp.close();
  }
}
const isoGiornoRoma = (t: Date) => isoGiorno(new Date(t.getTime() + scostamento(t) * 60000));

/* ---------------- slot ---------------- */
type Riga = { id: number; user_id: string; mese: string; inizio: string | null; fine: string | null; ics_uid: string; ics_seq: number };

async function calcolaGiorno(db: any, imp: Impostazioni, meseRichiesto: string | null) {
  const ora = new Date();
  let mese = meseRichiesto || meseDi(isoGiornoRoma(ora));
  let giorno = giornoDelMese(mese, imp);
  // se gli orari di questo mese sono passati, si guarda il mese dopo
  if (!meseRichiesto && aRoma(giorno, hm(imp.alle)) <= ora) {
    mese = meseDi(piuGiorni(mese, 32));
    giorno = giornoDelMese(mese, imp);
  }
  const orari = orariDelGiorno(giorno, imp);
  const dal = aRoma(giorno, "00:00"), al = aRoma(piuGiorni(giorno, 1), "00:00");
  const { data: presi, error } = await db.rpc("one_to_one_occupati", { p_dal: dal.toISOString(), p_al: al.toISOString() });
  if (error) throw new Errore("Non riesco a leggere le prenotazioni: riprova tra poco.");
  const coach = await impegniCoach(dal, al);
  const chiusi = new Set((imp.chiusi || []).map((x) => new Date(x).getTime()));
  const fine = (t: Date) => new Date(t.getTime() + imp.durata * 60000);
  const tocca = (a: Date, b: Date, p: Periodo) => a < p.fine && p.inizio < b;
  const mio = (presi || []).find((p: any) => p.mio);
  const lista = orari.map((t) => {
    const f = fine(t);
    const preso = (presi || []).some((p: any) => tocca(t, f, { inizio: new Date(p.inizio), fine: new Date(p.fine) }));
    const occupato = (coach || []).some((p) => tocca(t, f, p));
    const stato = t <= ora ? "passato" : chiusi.has(t.getTime()) ? "chiuso" : preso ? "preso" : occupato ? "occupato" : "libero";
    return { inizio: t.toISOString(), ora: oraRoma(t), stato };
  });
  return { mese, giorno, giorno_bello: giornoBello(giorno), durata: imp.durata, nome_coach: imp.nome_coach, orari: lista,
           calendario_collegato: coach !== null,
           mio_orario: mio ? mio.inizio : null };
}

async function liberoPer(db: any, imp: Impostazioni, inizio: Date, escludi: Riga | null) {
  const g = await calcolaGiorno(db, imp, meseDi(isoGiornoRoma(inizio)));
  if (isoGiornoRoma(inizio) !== g.giorno) throw new Errore("Il One to One si fa solo nel giorno indicato.");
  const o = g.orari.find((x) => new Date(x.inizio).getTime() === inizio.getTime());
  if (!o) throw new Errore("Orario fuori dagli orari dei One to One.");
  if (escludi?.inizio && new Date(escludi.inizio).getTime() === inizio.getTime()) throw new Errore("È già il tuo orario.");
  if (o.stato === "occupato") throw new Errore(`${imp.nome_coach} ha un impegno a quest'ora: scegline un'altra.`);
  if (o.stato !== "libero") throw new Errore("Questo orario non è più libero: scegline un altro.");
}

/* ---------------- richiesta ---------------- */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const corpo = await req.json().catch(() => ({}));
    const url = Deno.env.get("SUPABASE_URL") ?? "https://iymxkvrgkhfaqcyxjsyz.supabase.co";
    const chiavePubblica = Deno.env.get("SUPABASE_ANON_KEY") ?? "sb_publishable_NBu5yxfOtUSRW-ZYFL4JgQ_QBOxIVYT";
    const db = createClient(url, chiavePubblica, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: u } = await db.auth.getUser();
    if (!u?.user) return risposta({ errore: "Sessione scaduta: esci e rientra." }, 401);
    const { data: imp } = await db.from("one_to_one_impostazioni").select("*").eq("id", 1).maybeSingle();
    if (!imp) return risposta({ errore: "One to One non ancora attivo." }, 400);

    const azione = String(corpo.azione || "slot");
    if (azione === "slot") {
      const mese = typeof corpo.mese === "string" && /^\d{4}-\d{2}-01$/.test(corpo.mese) ? corpo.mese : null;
      return risposta(await calcolaGiorno(db, imp, mese));
    }

    // di chi è il One to One: il mio, o (per il coach) quello di un collaboratore
    const uid = typeof corpo.user_id === "string" && corpo.user_id ? corpo.user_id : u.user.id;
    const { data: prof } = await db.from("profiles").select("nome,email").eq("id", uid).maybeSingle();
    if (!prof) throw new Errore("Collaboratore non trovato.");
    const persona = { nome: prof.nome || prof.email, email: prof.email };

    if (azione === "prenota") {
      const inizio = new Date(String(corpo.inizio || ""));
      if (isNaN(inizio.getTime())) throw new Errore("Scegli un orario.");
      const mese = meseDi(isoGiornoRoma(inizio));
      const { data: prima } = await db.from("one_to_one").select("id,user_id,mese,inizio,fine,ics_uid,ics_seq")
        .eq("user_id", uid).eq("mese", mese).maybeSingle();
      await liberoPer(db, imp, inizio, prima);
      let riga: Riga;
      if (prima) {
        const { data, error } = await db.from("one_to_one").update({ inizio: inizio.toISOString(), ics_seq: prima.ics_seq + 1 })
          .eq("id", prima.id).select("id,user_id,mese,inizio,fine,ics_uid,ics_seq").single();
        if (error) throw new Errore(pulito(error.message));
        riga = data;
      } else {
        const { data, error } = await db.from("one_to_one").insert({ user_id: uid, mese, inizio: inizio.toISOString() })
          .select("id,user_id,mese,inizio,fine,ics_uid,ics_seq").single();
        if (error) throw new Errore(pulito(error.message));
        riga = data;
      }
      const quando = { inizio: new Date(riga.inizio!), fine: new Date(riga.fine!) };
      let email = true;
      try { await mandaInvito(riga, persona, imp, prima?.inizio ? "spostato" : "prenotato", quando); } catch { email = false; }
      return risposta({ ok: true, riga, email });
    }

    if (azione === "disdici") {
      const id = Number(corpo.id);
      const { data: prima } = await db.from("one_to_one").select("id,user_id,mese,inizio,fine,ics_uid,ics_seq").eq("id", id).maybeSingle();
      if (!prima || prima.user_id !== uid) throw new Errore("One to One non trovato.");
      if (!prima.inizio) return risposta({ ok: true, riga: prima });
      const { data, error } = await db.from("one_to_one").update({ inizio: null, ics_seq: prima.ics_seq + 1 })
        .eq("id", id).select("id,user_id,mese,inizio,fine,ics_uid,ics_seq").single();
      if (error) throw new Errore(pulito(error.message));
      let email = true;
      try {
        await mandaInvito(data, persona, imp, "disdetto", { inizio: new Date(prima.inizio), fine: new Date(prima.fine!) });
      } catch { email = false; }
      return risposta({ ok: true, riga: data, email });
    }
    return risposta({ errore: "Azione non valida." }, 400);
  } catch (e) {
    if (e instanceof Errore) return risposta({ errore: e.message }, 400);
    return risposta({ errore: "Qualcosa non ha funzionato: riprova tra poco." }, 500);
  }
});

// Messaggi del database già scritti per l'agente (raise exception del trigger); il resto diventa generico.
function pulito(m: string) {
  if (/one_to_one_orario|duplicate key/i.test(m)) return "Questo orario è appena stato preso: scegline un altro.";
  if (/violates row-level security/i.test(m)) return "Non puoi cambiare questo One to One.";
  return m.length < 160 ? m : "Qualcosa non ha funzionato: riprova tra poco.";
}
