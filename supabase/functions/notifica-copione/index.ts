// Edge Function "notifica-copione" («I miei copioni», dal 16/11/2026)
// L'agente ha approvato il suo copione nell'Area agenti e chiede «Mandami il copione per email».
// 1. Con il token dell'agente chiede il copione al server di Sensoria (app.sensoriaspace.com), che controlla che il
//    copione sia suo e approvato, tiene il conto (al massimo 5 email al giorno per copione) e risponde con la vista.
// 2. Fa il PDF (stesso file della pagina: ../_shared/copione-pdf.js) e lo manda all'indirizzo scritto dall'agente,
//    con gli stessi secrets delle altre funzioni (BREVO_SMTP_USER / BREVO_SMTP_PASS), da info@fondocasahub.com.
// Body: { id: string, email: string }. Pubblicazione: supabase functions deploy notifica-copione

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import * as PDFLib from "https://esm.sh/pdf-lib@1.17.1";
import { pdfCopione } from "../_shared/copione-pdf.js";

const MITTENTE = "FondoCasa Hub - Area Agenti <info@fondocasahub.com>";
const API = Deno.env.get("SENSORIA_COPIONI_API") ?? "https://app.sensoriaspace.com/api/agenti";
const AREA = "https://www.fondocasahub.com/area-agenti/copioni";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const risposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });
const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

// Oggetto, corpo e parte HTML come in notifica-report (stessi difetti di denomailer 1.6.0 e di Brevo, stesse cure).
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
const b64Corpo = (testo: string) => {
  const bytes = new TextEncoder().encode(testo);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return "\r\n" + btoa(" ".repeat(56) + "\n" + bin).replace(/.{76}/g, "$&\r\n");
};
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
const nomeFile = (titolo: string) =>
  "copione-" + (titolo.normalize("NFKD").replace(/[^\x00-\x7F]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "fc") + ".pdf";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { id, email } = await req.json();
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return risposta({ errore: "Serve l'accesso all'Area agenti" }, 401);
    if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(String(id ?? ""))) return risposta({ errore: "Copione non trovato" }, 404);

    // il server di Sensoria controlla agente, approvazione e conto delle email; risponde con la vista del copione
    const r = await fetch(`${API}/copioni/${id}/email`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const dati = await r.json().catch(() => ({}));
    if (!r.ok) return risposta({ errore: dati.errore || "Il copione non si può mandare adesso" }, r.status === 403 ? 403 : 400);

    const pdf = await pdfCopione(PDFLib, dati);
    const nome = String(dati.agente || "").split(" ")[0];
    const riprese = dati.prenotazione ? `<p style="margin:10px 0 0"><strong>Riprese:</strong> ${esc(dati.prenotazione.giorno)} alle ${esc(dati.prenotazione.ora)}.</p>` : "";
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#14213D;background:#F5EFE4;padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FFFDF9;border-radius:10px;overflow:hidden">
<tr><td align="center" style="background:#0A1628;padding:22px 20px 6px"><img src="https://www.fondocasahub.com/images/email/logo-hub-bianco-email.png" width="96" alt="FondoCasa Hub" style="display:block;width:96px;height:auto;border:0"></td></tr>
<tr><td align="center" style="background:#0A1628;padding:8px 20px 18px;color:#FCFDFD;font-size:17px;font-weight:bold">Il tuo copione</td></tr>
<tr><td style="padding:18px 20px;font-size:15px;line-height:1.55">
<p style="margin:0 0 10px">Ciao${nome ? " " + esc(nome) : ""},</p>
<p style="margin:0">ecco il copione di <strong>«${esc(dati.titolo)}»</strong> che hai approvato: lo trovi in allegato in PDF, da stampare o da tenere sul telefono per le riprese.</p>${riprese}
<p style="margin:14px 0 0"><a href="${AREA}/${esc(id)}" style="color:#B08A2E;font-weight:bold">Apri il copione nell'Area agenti</a></p></td></tr>
<tr><td align="center" style="background:#0A1628;padding:14px 20px;font-size:11px;color:#C9CED8">FC Punto Hub Srl · Via Pietro Mascagni 35, Napoli · Email automatica dall'Area Agenti.</td></tr>
</table></div>`;

    const smtp = new SMTPClient({
      connection: {
        hostname: "smtp-relay.brevo.com", port: 465, tls: true,
        auth: { username: Deno.env.get("BREVO_SMTP_USER")!, password: Deno.env.get("BREVO_SMTP_PASS")! },
      },
    });
    await smtp.send({
      from: MITTENTE, to: [dati.email], subject: oggettoMime(`Il tuo copione: ${dati.titolo}`), ...corpoMime(html),
      attachments: [{ filename: nomeFile(String(dati.titolo || "")), content: pdf, encoding: "binary", contentType: "application/pdf" }],
    });
    await smtp.close();
    return risposta({ ok: true });
  } catch (e) {
    return risposta({ errore: String((e as Error)?.message ?? e) }, 500);
  }
});
