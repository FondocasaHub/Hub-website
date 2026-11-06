// Edge Function "notifica-report"
// destinatario = "tm": avvisa il Team Manager che c'è un report da approvare.
// destinatario = "sm": avvisa lo Store Manager che c'è un report approvato da autorizzare.
// destinatario = "amministrazione": invia il report autorizzato a contabilita2@fondocasa.com,
//   in copia na.vomero@fondocasa.it, lo Store Manager e il collaboratore (circolare 01/2026).
// Usa gli stessi secrets di notifica-marketing (BREVO_SMTP_USER / BREVO_SMTP_PASS) e
// agisce con il token di chi la chiama (regole RLS).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const AMMINISTRAZIONE = "contabilita2@fondocasa.com";
const COPIA = ["na.vomero@fondocasa.it", "nicola.nigido@fondocasa.it"];
const MITTENTE = "FondoCasa Hub - Area Agenti <info@fondocasahub.com>";
const AREA = "https://www.fondocasahub.com/area-agenti/compensi";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const risposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });
const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
const euro = (n: unknown) => (Number(n) || 0).toLocaleString("it-IT", { style: "currency", currency: "EUR" });
const data = (s: string) => (s ? new Date(s).toLocaleDateString("it-IT") : "");
const LIVELLI: Record<string, string> = { new: "New Agent", junior: "Junior Agent", senior: "Senior Agent", buyer: "Buyer Agent", team_manager: "Team Manager", store_manager: "Store Manager", marketing: "Marketing", altro: "Altro" };

function periodo(inizio: string, fine: string) {
  const a = new Date(inizio), b = new Date(fine);
  const mese = b.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  return a.getDate() === 1 && b.getDate() >= 28 ? mese : `${a.getDate()}–${b.getDate()} ${mese}`;
}

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
  return "\r\n" + btoa(bin).replace(/.{76}/g, "$&\r\n");
};
const corpoMime = (html: string) => {
  const testo = html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, "$2: $1")
    .replace(/<br\s*\/?>/g, "\n").replace(/<\/(p|div|tr)>/g, "\n").replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\n\s*\n+/g, "\n\n").trim();
  return {
    mimeContent: [
      { mimeType: 'text/plain; charset="utf-8"', content: b64Corpo(testo), transferEncoding: "base64" },
      { mimeType: 'text/html; charset="utf-8"', content: b64Corpo(html), transferEncoding: "base64" },
    ],
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { id, destinatario } = await req.json();
    const db = createClient(
      Deno.env.get("SUPABASE_URL") ?? "https://iymxkvrgkhfaqcyxjsyz.supabase.co",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "sb_publishable_NBu5yxfOtUSRW-ZYFL4JgQ_QBOxIVYT",
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );
    const { data: r, error } = await db.from("report_compensi").select("*").eq("id", id).maybeSingle();
    if (error || !r) return risposta({ errore: "Report non trovato" }, 404);

    const righe = (r.operazioni ?? []).map((o: any) =>
      `<tr><td style="padding:6px 10px;border-bottom:1px solid #E6DFD2">${data(o.data_incasso)}</td>` +
      `<td style="padding:6px 10px;border-bottom:1px solid #E6DFD2">${esc(o.riferimento)}<br><span style="color:#5B6577;font-size:12px">${esc(o.tipo)}</span></td>` +
      `<td style="padding:6px 10px;border-bottom:1px solid #E6DFD2">${esc(o.etichetta)}<br><span style="color:#5B6577;font-size:12px">${o.fisso != null ? euro(o.fisso) + " cad." : o.aliquota + "%"}</span></td>` +
      `<td style="padding:6px 10px;border-bottom:1px solid #E6DFD2;text-align:right">${o.fisso != null ? o.base + " lead" : euro(o.base)}</td>` +
      `<td style="padding:6px 10px;border-bottom:1px solid #E6DFD2;text-align:right;font-weight:bold">${euro(o.compenso)}</td></tr>`
    ).join("");

    const titolo = `${r.nome} · ${LIVELLI[r.livello] ?? ""}${r.team ? " · " + r.team : ""}`;
    const tabella = `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E6DFD2;font-size:13px">
<tr style="background:#0A1628;color:#FCFDFD"><th align="left" style="padding:8px 10px">Incasso</th><th align="left" style="padding:8px 10px">Riferimento</th><th align="left" style="padding:8px 10px">Voce</th><th align="right" style="padding:8px 10px">Base</th><th align="right" style="padding:8px 10px">Compenso</th></tr>
${righe}
<tr><td colspan="3" style="padding:8px 10px;text-align:right;color:#5B6577">Totale fatturato ${euro(r.totale_fatturato)}</td><td colspan="2" style="padding:8px 10px;text-align:right;font-size:16px;font-weight:bold">Totale ${euro(r.totale_compenso)}</td></tr></table>`;

    let to: string[], cc: string[] = [], oggetto: string, intro: string, linkFatture = "";
    if (destinatario === "tm") {
      const { data: email } = await db.rpc("email_approvatori_report", { rid: r.id });
      to = (email ?? []).filter(Boolean);
      if (!to.length) return risposta({ ok: true, nessun_approvatore: true });
      oggetto = `Report compensi da approvare — ${r.nome}, ${periodo(r.periodo_inizio, r.periodo_fine)}`;
      intro = `<strong>${esc(r.nome)}</strong> ha inviato il report del periodo <strong>${periodo(r.periodo_inizio, r.periodo_fine)}</strong>. Verificalo e approvalo nell'Area Agenti: dopo la tua approvazione passa allo Store Manager per l'autorizzazione.`;
    } else if (destinatario === "sm") {
      if (r.stato !== "approvato") return risposta({ errore: "Report non in attesa di autorizzazione" }, 400);
      const { data: email } = await db.rpc("email_store_manager", { rid: r.id });
      to = (email ?? []).filter(Boolean);
      if (!to.length) return risposta({ ok: true, nessun_store_manager: true });
      oggetto = `Report compensi da autorizzare — ${r.nome}, ${periodo(r.periodo_inizio, r.periodo_fine)} — ${euro(r.totale_compenso)}`;
      intro = `Il report di <strong>${esc(r.nome)}</strong> per il periodo <strong>${periodo(r.periodo_inizio, r.periodo_fine)}</strong> è stato approvato da <strong>${esc(r.approvato_da)}</strong>. Autorizzalo nell'Area Agenti: solo dopo la tua autorizzazione arriva all'Amministrazione.` +
        (r.nota_tm ? `<br><em>Nota del Team Manager:</em> ${esc(r.nota_tm)}` : "");
    } else {
      if (!["autorizzato", "verificato", "pagato"].includes(r.stato)) return risposta({ errore: "Report non ancora autorizzato" }, 400);
      to = [AMMINISTRAZIONE];
      cc = [...COPIA, r.email].filter((x, i, a) => x && a.indexOf(x) === i);
      oggetto = `Report compensi n. ${r.id} — ${r.nome}, ${periodo(r.periodo_inizio, r.periodo_fine)} — ${euro(r.totale_compenso)}`;
      intro = `Report provvigioni di <strong>${esc(r.nome)}</strong> per il periodo <strong>${periodo(r.periodo_inizio, r.periodo_fine)}</strong>, approvato da <strong>${esc(r.approvato_da)}</strong> il ${data(r.approvato_il)} e autorizzato da <strong>${esc(r.autorizzato_da)}</strong> il ${data(r.autorizzato_il)}. Dopo la verifica il collaboratore emette la fattura elettronica identica alla pro-forma.` +
        (r.nota_tm ? `<br><em>Nota del Team Manager:</em> ${esc(r.nota_tm)}` : "") +
        (r.nota_sm ? `<br><em>Nota dello Store Manager:</em> ${esc(r.nota_sm)}` : "");
      const link: string[] = [];
      for (const a of r.allegati ?? []) {
        const { data: s } = await db.storage.from("compensi").createSignedUrl(a.percorso, 60 * 60 * 24 * 30);
        if (s) link.push(`<li><a href="${s.signedUrl}">${esc(a.nome)}</a></li>`);
      }
      linkFatture = `<p style="font-size:13px"><strong>Pro-forma</strong></p><ul style="font-size:13px">${link.join("") || "<li>—</li>"}</ul><p style="font-size:12px;color:#5B6577">I link alla pro-forma valgono 30 giorni; il report resta consultabile nell'Area Agenti.</p>`;
    }

    const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#14213D;background:#F5EFE4;padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:660px;margin:0 auto;background:#FFFDF9;border-radius:10px;overflow:hidden">
<tr><td align="center" style="background:#0A1628;padding:22px 20px 6px"><img src="https://www.fondocasahub.com/images/email/logo-hub-bianco-email.png" width="96" alt="FondoCasa Hub" style="display:block;width:96px;height:auto;border:0"></td></tr>
<tr><td align="center" style="background:#0A1628;padding:8px 20px 18px;color:#FCFDFD;font-size:17px;font-weight:bold">Report provvigioni e compensi <span style="color:#C9A84C;font-weight:normal">· n. ${r.id}</span></td></tr>
<tr><td style="padding:16px 20px;font-size:14px;line-height:1.5"><p style="margin:0 0 6px;color:#5B6577">${esc(titolo)}</p>${intro}<br><a href="${AREA}/${r.id}" style="color:#B08A2E;font-weight:bold">Apri il report nell'Area Agenti</a></td></tr>
<tr><td style="padding:0 20px 16px">${tabella}</td></tr>
<tr><td style="padding:0 20px 16px">${linkFatture}${r.note ? `<p style="font-size:13px"><strong>Note del collaboratore:</strong> ${esc(r.note)}</p>` : ""}</td></tr>
<tr><td align="center" style="background:#0A1628;padding:18px 20px 10px"><img src="https://www.fondocasahub.com/images/email/piedino-email.png" width="440" alt="Fondocasa · wunit.it · Henia" style="display:block;width:100%;max-width:440px;height:auto;border:0"></td></tr>
<tr><td align="center" style="background:#0A1628;padding:4px 20px 16px;font-size:11px;color:#C9CED8">FC Punto Hub Srl · Via Pietro Mascagni 35, Napoli · Email automatica dall'Area Agenti.</td></tr>
</table></div>`;

    const smtp = new SMTPClient({
      connection: {
        hostname: "smtp-relay.brevo.com", port: 465, tls: true,
        auth: { username: Deno.env.get("BREVO_SMTP_USER")!, password: Deno.env.get("BREVO_SMTP_PASS")! },
      },
    });
    await smtp.send({ from: MITTENTE, to, cc: cc.length ? cc : undefined, replyTo: r.email, subject: oggettoMime(oggetto), ...corpoMime(html) });
    await smtp.close();

    await db.rpc("segna_email_report", { rid: r.id, destinatario: destinatario === "tm" || destinatario === "sm" ? destinatario : "amministrazione" });
    return risposta({ ok: true });
  } catch (e) {
    return risposta({ errore: String((e as Error)?.message ?? e) }, 500);
  }
});
