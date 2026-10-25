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
    const oggetto = `Nuova comunicazione: ${String(c.titolo).slice(0, 120)}`;

    const corpo = () => `<div style="font-family:Arial,Helvetica,sans-serif;color:#14213D;background:#F5EFE4;padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FFFDF9;border-radius:10px;overflow:hidden">
<tr><td style="background:#14213D;padding:18px 20px;color:#F5EFE4;font-size:17px;font-weight:bold">Nuova comunicazione <span style="color:#C19A5B;font-weight:normal">· Area Agenti</span></td></tr>
<tr><td style="padding:18px 20px;font-size:14px;line-height:1.55">
<p style="margin:0 0 10px">Ciao,<br>è stata pubblicata una nuova comunicazione nell'Area Agenti.</p>
<p style="margin:0 0 6px;font-size:16px;font-weight:bold">${esc(c.titolo)}</p>
${c.testo ? `<p style="margin:0">${esc(c.testo)}</p>` : ""}
${elencoAllegati}
<p style="margin:20px 0 4px"><a href="${link}" style="display:inline-block;background:#C19A5B;color:#14213D;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:6px">Apri nell'Area Agenti</a></p>
</td></tr>
<tr><td style="padding:12px 20px;border-top:1px solid #E6DFD2;font-size:11px;color:#5B6577">FC Punto Hub Srl · Via Pietro Mascagni 35, Napoli · Email automatica dall'Area Agenti: non rispondere a questo messaggio.</td></tr>
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
        await smtp.send({ from: MITTENTE, to: "info@fondocasahub.com", bcc: blocco, subject: oggetto, content: "auto", html });
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
