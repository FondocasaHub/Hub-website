// Edge Function "notifica-immobile"
// Chiamata dall'Area Agenti dopo il Modulo Ingaggio Marketing, quando nasce la scheda immobile:
// avvisa la Buyer Agent del team e il Team Manager ("Nuovo immobile da lavorare").
// Secrets: BREVO_SMTP_USER e BREVO_SMTP_PASS, gli stessi di notifica-marketing.
// La funzione agisce sempre con il token di chi la chiama (regole RLS): non usa la chiave segreta.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const MITTENTE = "FondoCasa Hub - Area Agenti <info@fondocasahub.com>";
const AREA = "https://www.fondocasahub.com/area-agenti/immobili";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const risposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });

const esc = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const ascii = (v: unknown) =>
  String(v ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\x20-\x7E]/g, "-").replace(/\s+/g, " ").trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { id } = await req.json();
    const url = Deno.env.get("SUPABASE_URL") ?? "https://iymxkvrgkhfaqcyxjsyz.supabase.co";
    const chiavePubblica = Deno.env.get("SUPABASE_ANON_KEY") ?? "sb_publishable_NBu5yxfOtUSRW-ZYFL4JgQ_QBOxIVYT";
    const comeUtente = createClient(url, chiavePubblica, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: i, error } = await comeUtente.from("immobili").select("*").eq("id", id).maybeSingle();
    if (error || !i) return risposta({ errore: "Immobile non trovato" }, 404);
    if (i.notifica_inviata_il) return risposta({ ok: true, gia_inviata: true });

    const { data: destinatari } = await comeUtente.rpc("destinatari_notifica_immobile", { iid: i.id });
    const a: string[] = destinatari ?? [];
    if (a.length === 0) return risposta({ errore: "Nessuna Buyer Agent o Team Manager nel team" }, 422);

    const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#0A1628;background:#F5EFE4;padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FCFDFD;border-radius:10px;overflow:hidden">
<tr><td align="center" style="background:#0A1628;padding:22px 20px 6px"><img src="https://www.fondocasahub.com/images/email/logo-hub-bianco-email.png" width="96" alt="FondoCasa Hub" style="display:block;width:96px;height:auto;border:0"></td></tr>
<tr><td align="center" style="background:#0A1628;padding:8px 20px 18px;color:#FCFDFD;font-size:17px;font-weight:bold">Nuovo immobile da lavorare</td></tr>
<tr><td style="padding:20px;font-size:15px;line-height:1.5">
<strong>${esc(i.indirizzo)}</strong>${i.zona ? ` · ${esc(i.zona)}` : ""}<br>
Riferimento Vendilo <strong>${esc(i.riferimento_vendilo)}</strong> · ${esc(i.team)}<br><br>
La scheda è pronta con la check-list della procedura: il presidio della zona parte subito (giorno 0-2).<br><br>
<a href="${AREA}/${i.id}" style="display:inline-block;background:#0A1628;color:#FCFDFD;padding:11px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Apri la scheda immobile</a>
</td></tr>
<tr><td align="center" style="background:#0A1628;padding:18px 20px 10px"><img src="https://www.fondocasahub.com/images/email/piedino-email.png" width="440" alt="Fondocasa · wunit.it · Henia" style="display:block;width:100%;max-width:440px;height:auto;border:0"></td></tr>
<tr><td align="center" style="background:#0A1628;padding:4px 20px 16px;font-size:11px;color:#C9CED8">FC Punto Hub Srl · Via Pietro Mascagni 35, Napoli</td></tr>
</table></div>`;

    const smtp = new SMTPClient({
      connection: {
        hostname: "smtp-relay.brevo.com", port: 465, tls: true,
        auth: { username: Deno.env.get("BREVO_SMTP_USER")!, password: Deno.env.get("BREVO_SMTP_PASS")! },
      },
    });
    await smtp.send({
      from: MITTENTE,
      to: a,
      // Oggetto solo ASCII e corto: vedi la nota in notifica-marketing ("554 Header parsing error").
      subject: ascii(`Nuovo immobile da lavorare - ${i.riferimento_vendilo} - ${i.indirizzo}`).slice(0, 150),
      content: "auto",
      html,
    });
    await smtp.close();

    await comeUtente.rpc("segna_notifica_immobile", { iid: i.id });
    return risposta({ ok: true });
  } catch (e) {
    return risposta({ errore: String(e?.message ?? e) }, 500);
  }
});
