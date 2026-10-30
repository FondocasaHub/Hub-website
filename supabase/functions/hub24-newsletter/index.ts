// Edge Function "hub24-newsletter" — newsletter del settimanale HUB 24 (30/10/2026)
// Pubblica: va deployata con "Verify JWT" DISATTIVATO (la chiama la pagina pubblica /hub24).
// Usa gli stessi secrets delle altre funzioni (BREVO_SMTP_USER / BREVO_SMTP_PASS); HUB24_CHIAVE
// è facoltativo e serve solo per il reinvio forzato di un numero. SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono già
// disponibili in ogni Edge Function.
//
// Azioni (POST JSON):
//   { azione: "iscrivi", email, nome, consenso: true }  → crea/aggiorna l'iscritto "in_attesa" e
//                                                         manda l'email di conferma (doppio opt-in)
//   { azione: "conferma", token }                       → attiva l'iscrizione e manda il benvenuto
//                                                         con l'ultimo numero
//   { azione: "disiscrivi", email | token }             → disiscrive
//   { azione: "invia" }                                 → manda l'ultimo numero di index.json a tutti
//                                                         gli iscritti attivi, una sola volta per numero

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const SITO = "https://www.fondocasahub.com";
const PAGINA = `${SITO}/hub24`;
const MITTENTE = "HUB 24 · FondoCasa Hub <info@fondocasahub.com>";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const risposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });
const esc = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const emailValida = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 200;

type Numero = { numero: number; data: string; file: string; pdf?: string; titolo: string; sommario?: string };

async function ultimoNumero(): Promise<Numero | null> {
  const r = await fetch(`${SITO}/hub24/index.json`, { headers: { "cache-control": "no-cache" } });
  if (!r.ok) return null;
  const l: Numero[] = await r.json();
  return [...l].sort((a, b) => (a.data < b.data ? 1 : -1))[0] ?? null;
}

const dataLunga = (iso: string) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

const bottone = (href: string, testo: string, pieno = true) =>
  `<a href="${href}" style="display:inline-block;margin:4px 8px 4px 0;padding:12px 20px;border-radius:4px;font-weight:bold;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;${
    pieno ? "background:#C9A15A;color:#0A1628" : "border:2px solid #0A1628;color:#0A1628"
  }">${testo}</a>`;

function layout(contenuto: string, piede: string) {
  return `<div style="background:#F5E1CF;padding:24px 12px;font-family:Georgia,'Times New Roman',serif;color:#1B1714">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FBF0E6">
<tr><td style="background:#0A1628;padding:22px 24px;text-align:center">
<div style="font-size:42px;color:#ffffff;letter-spacing:1px">HUB <span style="color:#C9A15A">24</span></div>
<div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#F5E1CF;letter-spacing:2px;text-transform:uppercase;margin-top:4px">Il settimanale dell'Hub · Napoli Vomero</div>
</td></tr>
<tr><td style="padding:24px 24px 8px;font-size:16px;line-height:1.55">${contenuto}</td></tr>
<tr><td style="padding:14px 24px 20px;border-top:1px solid #E3C9B3;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#5E5148;line-height:1.5">
FC Punto Hub Srl · Via Pietro Mascagni 35, 80128 Napoli · Tel. 081 18653202 · WhatsApp 392 457 9047<br>${piede}</td></tr>
</table></div>`;
}

function smtp() {
  return new SMTPClient({
    connection: {
      hostname: "smtp-relay.brevo.com", port: 465, tls: true,
      auth: { username: Deno.env.get("BREVO_SMTP_USER")!, password: Deno.env.get("BREVO_SMTP_PASS")! },
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return risposta({ errore: "Metodo non consentito" }, 405);
  try {
    const body = await req.json();
    const azione = String(body.azione ?? "");
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    /* ---------- iscrizione (doppio opt-in) ---------- */
    if (azione === "iscrivi") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const nome = String(body.nome ?? "").trim().slice(0, 80);
      if (!emailValida(email)) return risposta({ errore: "Indirizzo email non valido" }, 400);
      if (body.consenso !== true) return risposta({ errore: "Serve il consenso al trattamento dei dati" }, 400);
      if (body.sito) return risposta({ ok: true }); // campo trappola anti-bot

      const { data: esistente } = await db.from("hub24_iscritti").select("id, stato, token").eq("email", email).maybeSingle();
      if (esistente?.stato === "attivo") return risposta({ ok: true, gia_iscritto: true });
      let token = esistente?.token;
      if (esistente) {
        await db.from("hub24_iscritti").update({ nome: nome || null, stato: "in_attesa", consenso_il: new Date().toISOString(), disiscritto_il: null, origine: body.origine ?? "pagina-hub24" }).eq("id", esistente.id);
      } else {
        const { data, error } = await db.from("hub24_iscritti").insert({ email, nome: nome || null, origine: body.origine ?? "pagina-hub24" }).select("token").single();
        if (error) return risposta({ errore: "Iscrizione non riuscita, riprova tra poco" }, 500);
        token = data.token;
      }
      const link = `${PAGINA}?conferma=${token}`;
      const html = layout(
        `<p style="margin:0 0 12px">Ciao${nome ? " " + esc(nome) : ""},</p>
<p style="margin:0 0 12px">grazie per esserti iscritto a HUB 24. Per ricevere la copia gratuita ogni domenica mattina conferma il tuo indirizzo:</p>
<p style="margin:18px 0">${bottone(link, "Confermo l'iscrizione")}</p>
<p style="margin:0 0 12px;font-size:14px;color:#5E5148">Se non hai chiesto tu l'iscrizione, ignora questa email: senza conferma non riceverai nulla.</p>`,
        "Hai ricevuto questa email perché il tuo indirizzo è stato inserito nel modulo di iscrizione su fondocasahub.com/hub24.",
      );
      const s = smtp();
      await s.send({ from: MITTENTE, to: email, subject: "Conferma la tua iscrizione a HUB 24", content: "auto", html });
      await s.close();
      return risposta({ ok: true });
    }

    /* ---------- conferma ---------- */
    if (azione === "conferma") {
      const token = String(body.token ?? "");
      if (!/^[0-9a-f-]{36}$/i.test(token)) return risposta({ errore: "Link di conferma non valido" }, 400);
      const { data: isc } = await db.from("hub24_iscritti").select("id, email, nome, stato").eq("token", token).maybeSingle();
      if (!isc) return risposta({ errore: "Link di conferma non valido o scaduto" }, 404);
      if (isc.stato === "attivo") return risposta({ ok: true, gia_confermato: true });
      await db.from("hub24_iscritti").update({ stato: "attivo", confermato_il: new Date().toISOString(), disiscritto_il: null }).eq("id", isc.id);
      const n = await ultimoNumero();
      const ultimo = n
        ? `<p style="margin:16px 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#9C2F1C">Intanto leggi l'ultimo numero · ${dataLunga(n.data)}</p>
<p style="margin:0 0 8px;font-size:20px;font-weight:bold;line-height:1.25">${esc(n.titolo)}</p>
${n.sommario ? `<p style="margin:0 0 12px">${esc(n.sommario)}</p>` : ""}
<p style="margin:14px 0">${bottone(`${SITO}/hub24/${n.file}`, "Leggi online")}${n.pdf ? bottone(`${SITO}/hub24/${n.pdf}`, "Scarica il PDF", false) : ""}</p>`
        : "";
      const html = layout(
        `<p style="margin:0 0 12px">Ciao${isc.nome ? " " + esc(isc.nome) : ""}, benvenuto in HUB 24.</p>
<p style="margin:0 0 12px">Da questa domenica riceverai alle 8 il settimanale dell'Hub: tassi e mutui, mercato immobiliare in Italia e a Napoli, fisco sugli affitti, tecnologia e le novità dello store.</p>${ultimo}`,
        `Per non ricevere più HUB 24: <a href="${PAGINA}?disiscrivi=${token}" style="color:#5E5148">disiscriviti</a>.`,
      );
      const s = smtp();
      await s.send({ from: MITTENTE, to: isc.email, subject: "Benvenuto in HUB 24", content: "auto", html });
      await s.close();
      return risposta({ ok: true });
    }

    /* ---------- disiscrizione ---------- */
    if (azione === "disiscrivi") {
      const token = String(body.token ?? "");
      const email = String(body.email ?? "").trim().toLowerCase();
      let q = db.from("hub24_iscritti").update({ stato: "disiscritto", disiscritto_il: new Date().toISOString() });
      if (/^[0-9a-f-]{36}$/i.test(token)) q = q.eq("token", token);
      else if (emailValida(email)) q = q.eq("email", email);
      else return risposta({ errore: "Indica l'indirizzo email da disiscrivere" }, 400);
      await q;
      return risposta({ ok: true }); // risposta uguale anche se l'indirizzo non c'era
    }

    /* ---------- invio settimanale ---------- */
    if (azione === "invia") {
      // Nessuna chiave necessaria: si invia solo l'ultimo numero già pubblicato su index.json e una sola
      // volta per numero. Il reinvio forzato richiede il secret HUB24_CHIAVE (facoltativo).
      if (body.forza && (!Deno.env.get("HUB24_CHIAVE") || body.chiave !== Deno.env.get("HUB24_CHIAVE"))) return risposta({ errore: "Reinvio forzato non autorizzato" }, 403);
      const n = await ultimoNumero();
      if (!n) return risposta({ errore: "index.json non raggiungibile" }, 502);
      const { data: gia } = await db.from("hub24_invii").select("numero").eq("numero", n.numero).maybeSingle();
      if (gia && !body.forza) return risposta({ ok: true, gia_inviato: true, numero: n.numero });

      const { data: iscritti, error } = await db.from("hub24_iscritti").select("email").eq("stato", "attivo");
      if (error) return risposta({ errore: error.message }, 500);
      const indirizzi = [...new Set((iscritti ?? []).map((i) => i.email))];
      if (!indirizzi.length) {
        await db.from("hub24_invii").upsert({ numero: n.numero, data_numero: n.data, destinatari: 0 });
        return risposta({ ok: true, numero: n.numero, inviate: 0 });
      }
      const html = layout(
        `<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#9C2F1C">Numero ${n.numero} · ${dataLunga(n.data)}</p>
<p style="margin:0 0 10px;font-size:24px;font-weight:bold;line-height:1.2">${esc(n.titolo)}</p>
${n.sommario ? `<p style="margin:0 0 14px">${esc(n.sommario)}</p>` : ""}
<p style="margin:16px 0 20px">${bottone(`${SITO}/hub24/${n.file}`, "Leggi il numero")}${n.pdf ? bottone(`${SITO}/hub24/${n.pdf}`, "Scarica il PDF", false) : ""}</p>
<p style="margin:0 0 12px;font-size:15px">Vuoi sapere quanto vale oggi la tua casa o quale mutuo puoi ottenere? Rispondi a questa email o scrivici su WhatsApp al 392 457 9047.</p>`,
        `Ricevi HUB 24 perché ti sei iscritto su fondocasahub.com/hub24. Per non riceverlo più: <a href="${PAGINA}?disiscrivi" style="color:#5E5148">disiscriviti</a>.`,
      );
      const oggetto = `HUB 24 n. ${n.numero} · ${n.titolo}`.slice(0, 150);
      const s = smtp();
      let inviate = 0;
      const falliti: string[] = [];
      for (let i = 0; i < indirizzi.length; i += 50) {
        const blocco = indirizzi.slice(i, i + 50);
        try {
          await s.send({ from: MITTENTE, to: "info@fondocasahub.com", bcc: blocco, subject: oggetto, content: "auto", html });
          inviate += blocco.length;
        } catch (_e) {
          falliti.push(...blocco);
        }
      }
      await s.close();
      if (inviate) await db.from("hub24_invii").upsert({ numero: n.numero, data_numero: n.data, destinatari: inviate, inviato_il: new Date().toISOString() });
      return risposta({ ok: inviate > 0, numero: n.numero, inviate, falliti: falliti.length });
    }

    return risposta({ errore: "Azione non riconosciuta" }, 400);
  } catch (e) {
    return risposta({ errore: String((e as Error)?.message ?? e) }, 500);
  }
});
