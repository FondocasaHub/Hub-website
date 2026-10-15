// Edge Function "notifica-marketing"
// Chiamata dall'Area Agenti subito dopo l'invio di un modulo Ingaggio Marketing.
// Invia il riepilogo a marketinghub@fondocasa.it con na.vomero@fondocasa.it in copia,
// tramite il server SMTP di Brevo (porta 465: le Edge Function non possono usare 25 e 587).
//
// Secrets da impostare in Supabase → Edge Functions → Secrets:
//   BREVO_SMTP_USER  (es. ab908a001@smtp-brevo.com)
//   BREVO_SMTP_PASS  (chiave SMTP di Brevo — la inserisce solo l'Admin)
// La funzione agisce sempre con il token di chi la chiama (regole RLS): non usa la chiave segreta.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const DESTINATARIO = "marketinghub@fondocasa.it";
const COPIA = "na.vomero@fondocasa.it";
const MITTENTE = "FondoCasa Hub - Area Agenti <info@fondocasahub.com>";
const AREA = "https://www.fondocasahub.com/area-agenti/richieste";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const risposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });

const esc = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

const SEZIONI: [string, [string, string][]][] = [
  ["01 · Dati agente", [["agente_nome", "Nome e cognome"], ["agente_team", "Team"], ["data_richiesta", "Data richiesta"], ["agente_cell", "Cellulare"], ["agente_email", "Email"]]],
  ["02 · Dati immobile", [["codice_annuncio", "Codice annuncio"], ["contratto", "Contratto"], ["prezzo", "Prezzo richiesto (€)"], ["indirizzo", "Indirizzo"], ["zona", "Quartiere / Comune"], ["proprietario_nome", "Proprietario"], ["proprietario_tel", "Telefono proprietario"]]],
  ["03 · Appuntamento proposto", [["data_1", "Data proposta 1"], ["ora_1", "Orario proposta 1"], ["data_2", "Data proposta 2"], ["ora_2", "Orario proposta 2"], ["accesso", "Accesso all'immobile"], ["immobile_stato_foto", "Condizioni per lo shooting"]]],
  ["04 · Servizi richiesti", [["servizi", "Servizi"], ["srv_note", "Note / scadenza pubblicazione"]]],
  ["05 · Descrizione immobile", [["tipologia", "Tipologia"], ["mq", "Superficie (mq)"], ["locali", "N. locali"], ["bagni", "N. bagni"], ["piano", "Piano / piani totali"], ["ascensore", "Ascensore"], ["stato", "Stato immobile"], ["classe_en", "Classe energetica"], ["riscaldamento", "Riscaldamento"], ["esposizione", "Esposizione / vista"], ["pertinenze", "Pertinenze e dotazioni"], ["punti_forza", "Punti di forza"], ["descrizione", "Descrizione (bozza annuncio)"]]],
  ["06 · Verifiche pre-ingaggio", [["euromq", "Valore conforme al range EUROMQ"], ["conformita", "Conforme catastalmente e urbanisticamente"], ["difformita", "Eventuali difformità"]]],
  ["07 · Dichiarazione", [["accetta_clausola", "Clausola rimborso spese"], ["luogo_data", "Luogo e data"], ["firma", "Firma"]]],
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { id } = await req.json();
    const url = Deno.env.get("SUPABASE_URL") ?? "https://iymxkvrgkhfaqcyxjsyz.supabase.co";
    const chiavePubblica = Deno.env.get("SUPABASE_ANON_KEY") ?? "sb_publishable_NBu5yxfOtUSRW-ZYFL4JgQ_QBOxIVYT";
    // Client con il token di chi chiama: legge solo ciò che le regole RLS gli consentono
    const comeUtente = createClient(url, chiavePubblica, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: r, error } = await comeUtente.from("richieste_marketing").select("*").eq("id", id).maybeSingle();
    if (error || !r) return risposta({ errore: "Richiesta non trovata" }, 404);
    if (r.email_inviata_il) return risposta({ ok: true, gia_inviata: true });

    // Link firmati agli allegati, validi 7 giorni
    const allegati: { percorso: string; nome: string; tipo: string }[] = r.allegati ?? [];
    const link: string[] = [];
    for (const a of allegati) {
      const { data } = await comeUtente.storage.from("richieste").createSignedUrl(a.percorso, 60 * 60 * 24 * 7);
      if (data) link.push(`<li><a href="${data.signedUrl}">${esc(a.nome)}</a> <span style="color:#5B6577">(${esc(a.tipo)})</span></li>`);
    }

    const d = r.dati ?? {};
    const righe = SEZIONI.map(([titolo, campi]) =>
      `<tr><td colspan="2" style="background:#14213D;color:#F5EFE4;padding:8px 12px;font-weight:bold;font-size:13px">${titolo}</td></tr>` +
      campi.map(([k, et]) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #E6DFD2;color:#5B6577;font-size:13px;width:38%;vertical-align:top">${et}</td>` +
        `<td style="padding:6px 12px;border-bottom:1px solid #E6DFD2;font-size:13px;vertical-align:top">${esc(Array.isArray(d[k]) ? d[k].join(", ") : d[k]) || "—"}</td></tr>`
      ).join("")
    ).join("");

    const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#14213D;background:#F5EFE4;padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#FFFDF9;border-radius:10px;overflow:hidden">
<tr><td style="background:#14213D;padding:18px 20px;color:#F5EFE4;font-size:17px;font-weight:bold">Modulo Ingaggio Marketing Hub <span style="color:#C19A5B;font-weight:normal">· n. ${r.id}</span></td></tr>
<tr><td style="padding:16px 20px;font-size:14px;line-height:1.5">
<strong>${esc(r.agente_nome)}</strong> (${esc(r.agente_team)}) ha inviato una richiesta per <strong>${esc(r.indirizzo)}</strong>, codice annuncio <strong>${esc(r.codice_annuncio)}</strong>.<br>
<a href="${AREA}/${r.id}" style="color:#C19A5B;font-weight:bold">Apri la richiesta nell'Area Agenti</a>
</td></tr>
<tr><td style="padding:0 20px 16px"><table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E6DFD2">${righe}</table></td></tr>
<tr><td style="padding:0 20px 20px;font-size:13px"><strong>Allegati (${allegati.length})</strong>${link.length ? `<ul style="margin:6px 0 0;padding-left:18px">${link.join("")}</ul><span style="color:#5B6577">I link restano validi 7 giorni; dopo, gli allegati restano disponibili nell'Area Agenti.</span>` : `<br><span style="color:#5B6577">Nessun allegato.</span>`}</td></tr>
<tr><td style="padding:12px 20px;border-top:1px solid #E6DFD2;font-size:11px;color:#5B6577">FC Punto Hub Srl · Via Pietro Mascagni 35, Napoli · Rispondendo a questa email scrivi direttamente all'agente.</td></tr>
</table></div>`;

    const smtp = new SMTPClient({
      connection: {
        hostname: "smtp-relay.brevo.com", port: 465, tls: true,
        auth: { username: Deno.env.get("BREVO_SMTP_USER")!, password: Deno.env.get("BREVO_SMTP_PASS")! },
      },
    });
    await smtp.send({
      from: MITTENTE,
      to: DESTINATARIO,
      cc: COPIA,
      replyTo: r.agente_email,
      subject: `Ingaggio Marketing n. ${r.id} — ${r.codice_annuncio} · ${r.indirizzo} (${r.agente_nome})`,
      content: "auto",
      html,
    });
    await smtp.close();

    await comeUtente.rpc("segna_email_inviata", { rid: r.id });
    return risposta({ ok: true });
  } catch (e) {
    return risposta({ errore: String(e?.message ?? e) }, 500);
  }
});
