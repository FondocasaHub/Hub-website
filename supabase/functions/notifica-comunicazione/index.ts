// Edge Function "notifica-comunicazione"
// Chiamata dall'Area Agenti (solo Admin) dopo la pubblicazione di una comunicazione:
// invia un'email di avviso a tutti i collaboratori attivi con uno dei ruoli che vedono
// la comunicazione. Dal 25/10/2026: UN solo invio con i destinatari in copia nascosta
// (Ccn, a blocchi di 50) — l'invio uno per uno superava i limiti di risorse della funzione.
// Usa gli stessi secrets di notifica-marketing (BREVO_SMTP_USER / BREVO_SMTP_PASS) e
// agisce con il token di chi la chiama (regole RLS): solo l'Admin legge tutti i profili
// e può segnare la comunicazione come notificata.
// Body: { id: number, forza?: boolean }  — senza "forza" non reinvia se già inviata.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const MITTENTE = "FondoCasa Hub - Area Agenti <info@fondocasahub.com>";
const AREA = "https://www.fondocasahub.com/area-agenti/comunicazioni";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const risposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });
const esc = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

// Oggetto con accenti, "—" o virgolette curve: denomailer 1.6.0 lo codifica male (va a capo dentro
// l'intestazione) e Brevo chiude la connessione ("Error while in datamode"). Qui lo codifichiamo noi
// in base64 (RFC 2047), a pezzi di massimo 45 byte ripiegati su più righe. La parte iniziale resta in
// chiaro e non comincia mai con "=?", così denomailer non lo ricodifica.
const oggettoMime = (testo: string) => {
  testo = testo.replace(/\s+/g, " ").trim();
  const primo = testo.search(/[^\x20-\x7E]/);
  if (primo < 0) return testo;
  const taglio = testo.lastIndexOf(" ", primo) + 1;
  const enc = new TextEncoder();
  const pezzi: string[] = [];
  let pezzo = "";
  for (const ch of Array.from(testo.slice(taglio))) {
    if (enc.encode(pezzo + ch).length > 45) { pezzi.push(pezzo); pezzo = ""; }
    pezzo += ch;
  }
  if (pezzo) pezzi.push(pezzo);
  const b64 = (t: string) => btoa(String.fromCharCode(...enc.encode(t)));
  return (testo.slice(0, taglio) || " ") + pezzi.map((t) => `=?utf-8?B?${b64(t)}?=`).join("\r\n ");
};

// Corpo email in base64 (come in hub24-newsletter): con il quoted-printable di denomailer una riga
// che inizia con "." viene troncata dal server SMTP (es. "www.fondocasahub.com" → "wwwfondocasahub.com").
const b64Corpo = (testo: string) => {
  const bytes = new TextEncoder().encode(testo);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  // Riga vuota iniziale: denomailer non separa l'intestazione della parte MIME dal contenuto.
  // Riga di servizio (56 spazi + a capo = 57 byte = una riga base64 intera): nella consegna la prima
  // riga del corpo si perde (7/11/2026: "#14213D;background…" in cima a comunicazioni e HUB 24). Se si
  // perde questa, il contenuto resta intatto; se arriva, sono solo spazi.
  return "\r\n" + btoa(" ".repeat(56) + "\n" + bin).replace(/.{76}/g, "$&\r\n");
};
// Parte HTML in 7bit, NON in base64 (11/11/2026, come hub24-newsletter v11). Brevo, per contare le
// aperture, inserisce il suo HTML (<html><body> + pixel) nel corpo della parte HTML senza guardarne la
// codifica: con il base64 alcune app di posta mostravano caratteri illeggibili in cima. Qui l'HTML resta
// testo: caratteri non ASCII come entità (&#232;), righe sotto i 998 caratteri, punto iniziale raddoppiato.
const html7bit = (html: string) =>
  html.replace(/[^\x00-\x7F]/gu, (c) => `&#${c.codePointAt(0)};`)
    .split(/\r?\n/)
    .flatMap((riga) => {
      const pezzi: string[] = [];
      while (riga.length > 900) {
        let i = riga.lastIndexOf(" ", 900);
        if (i < 1) i = 900;
        pezzi.push(riga.slice(0, i));
        riga = riga.slice(i);
      }
      pezzi.push(riga);
      return pezzi;
    })
    .map((riga) => (riga.startsWith(".") ? "." + riga : riga))
    .join("\r\n");
const corpoMime = (html: string) => {
  const testo = html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, "$2: $1")
    .replace(/<br\s*\/?>/g, "\n").replace(/<\/(p|div|tr)>/g, "\n").replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\n\s*\n+/g, "\n\n").trim();
  return {
    mimeContent: [
      { mimeType: 'text/plain; charset="utf-8"', content: b64Corpo(testo), transferEncoding: "base64" },
      { mimeType: 'text/html; charset="utf-8"', content: html7bit(html), transferEncoding: "7bit" },
    ],
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { id, forza } = await req.json();
    const db = createClient(
      Deno.env.get("SUPABASE_URL") ?? "https://iymxkvrgkhfaqcyxjsyz.supabase.co",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "sb_publishable_NBu5yxfOtUSRW-ZYFL4JgQ_QBOxIVYT",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );

    const { data: admin } = await db.rpc("sono_admin");
    if (!admin) return risposta({ errore: "Solo l'Admin può inviare le notifiche delle comunicazioni" }, 403);

    const { data: c, error } = await db.from("avvisi").select("*").eq("id", id).maybeSingle();
    if (error || !c) return risposta({ errore: "Comunicazione non trovata" }, 404);
    if (c.email_inviata_il && !forza) return risposta({ ok: true, gia_inviata: true, inviate: c.email_destinatari ?? 0 });

    const { data: profili, error: errP } = await db.from("profiles")
      .select("nome, email, ruolo").eq("attivo", true).in("ruolo", c.ruoli);
    if (errP) return risposta({ errore: errP.message }, 500);
    const destinatari = (profili ?? []).filter((p) => p.email && p.email.includes("@"));
    if (!destinatari.length) return risposta({ errore: "Nessun collaboratore attivo con i ruoli scelti" }, 400);

    const allegati: { nome: string }[] = c.allegati ?? [];
    const elencoAllegati = allegati.length
      ? `<p style="margin:14px 0 4px;font-size:13px;color:#5B6577"><strong>Allegati</strong> (li trovi nella comunicazione)</p>
<ul style="margin:0;padding-left:18px;font-size:13px">${allegati.map((a) => `<li>${esc(a.nome)}</li>`).join("")}</ul>`
      : "";
    const link = `${AREA}/${c.id}`;
    const oggetto = oggettoMime(`Nuova comunicazione: ${String(c.titolo).slice(0, 120)}`);

    const corpo = () => `<div style="font-family:Arial,Helvetica,sans-serif;color:#14213D;background:#F5EFE4;padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FFFDF9;border-radius:10px;overflow:hidden">
<tr><td align="center" style="background:#0A1628;padding:22px 20px 6px"><img src="https://www.fondocasahub.com/images/email/logo-hub-bianco-email.png" width="96" alt="FondoCasa Hub" style="display:block;width:96px;height:auto;border:0"></td></tr>
<tr><td align="center" style="background:#0A1628;padding:8px 20px 18px;color:#FCFDFD;font-size:17px;font-weight:bold">Nuova comunicazione <span style="color:#C9A84C;font-weight:normal">· Area Agenti</span></td></tr>
<tr><td style="padding:18px 20px;font-size:14px;line-height:1.55">
<p style="margin:0 0 10px">Ciao,<br>è stata pubblicata una nuova comunicazione nell'Area Agenti.</p>
<p style="margin:0 0 6px;font-size:16px;font-weight:bold">${esc(c.titolo)}</p>
${c.testo ? `<p style="margin:0">${esc(c.testo)}</p>` : ""}
${elencoAllegati}
<p style="margin:20px 0 4px"><a href="${link}" style="display:inline-block;background:#C9A84C;color:#0A1628;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:6px">Apri nell'Area Agenti</a></p>
</td></tr>
<tr><td align="center" style="background:#0A1628;padding:18px 20px 10px"><img src="https://www.fondocasahub.com/images/email/piedino-email.png" width="440" alt="Fondocasa · wunit.it · Henia" style="display:block;width:100%;max-width:440px;height:auto;border:0"></td></tr>
<tr><td align="center" style="background:#0A1628;padding:4px 20px 16px;font-size:11px;color:#C9CED8">FC Punto Hub Srl · Via Pietro Mascagni 35, Napoli · Email automatica dall'Area Agenti: non rispondere a questo messaggio.</td></tr>
</table></div>`;

    const smtp = new SMTPClient({
      connection: {
        hostname: "smtp-relay.brevo.com", port: 465, tls: true,
        auth: { username: Deno.env.get("BREVO_SMTP_USER")!, password: Deno.env.get("BREVO_SMTP_PASS")! },
      },
    });
    const indirizzi = [...new Set(destinatari.map((p) => p.email.trim().toLowerCase()))];
    const html = corpo();
    let inviate = 0;
    const falliti: string[] = [];
    for (let i = 0; i < indirizzi.length; i += 50) {
      const blocco = indirizzi.slice(i, i + 50);
      try {
        await smtp.send({ from: MITTENTE, to: "info@fondocasahub.com", bcc: blocco, subject: oggetto, ...corpoMime(html) });
        inviate += blocco.length;
      } catch (_e) {
        falliti.push(...blocco);
      }
    }
    await smtp.close();

    if (inviate) {
      await db.from("avvisi").update({ email_inviata_il: new Date().toISOString(), email_destinatari: inviate }).eq("id", c.id);
    }
    return risposta({ ok: inviate > 0, inviate, falliti });
  } catch (e) {
    return risposta({ errore: String((e as Error)?.message ?? e) }, 500);
  }
});
