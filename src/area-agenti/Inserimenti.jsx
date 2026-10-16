import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Manuale di inserimento nuovi collaboratori (Rev. 05/10/2026) — versione online.
// Il Team Manager compila, lo Store Manager verifica. Il PDF si genera dal modulo originale.

export const MODELLO_PDF = "04-manager/Manuale_Inserimento_FC_Punto_Hub_compilabile.pdf";

export const FASI = [
  { titolo: "Fase 1 — Formalizzazione", quando: "Giorno 1", nota: "Il rapporto parte solo a contratto firmato e registrato.", steps: [
    { n: "01", titolo: "Firma contratto digitale", testo: "Inviare il contratto tramite firma digitale. Verificare che tutte le firme siano apposte e scaricare il PDF firmato." },
    { n: "02", titolo: "Invio contratto in amministrazione", testo: "Inoltrare il PDF firmato all'amministrazione. Allegare i dati del collaboratore (anagrafica, P.IVA, IBAN). Archiviare una copia nella cartella del collaboratore." },
  ] },
  { titolo: "Fase 2 — Strumenti e accessi", quando: "Giorni 1–2", nota: "La mail aziendale si attiva per prima: serve come utenza per tutti gli altri accessi.", steps: [
    { n: "03", titolo: "Richiesta e attivazione mail aziendale", testo: "Richiedere l'indirizzo nel formato aziendale. Consegnare credenziali e verificare il primo accesso." },
    { n: "04", titolo: "Attivazione Vendilo CRM", testo: "Creare l'utente con la mail aziendale e assegnarlo al team. Mostrare inserimento contatti, immobili e attività." },
    { n: "05", titolo: "Attivazione euromq.it", testo: "Creare l'utenza sul portale per le valutazioni in autonomia degli immobili e fare una valutazione di prova insieme al collaboratore." },
    { n: "06", titolo: "Condivisione Drive", testo: "Condividere le cartelle operative con la mail aziendale. Verificare i permessi (lettura o modifica)." },
    { n: "07", titolo: "Attivazione portale utenze FC Power", testo: "Abilitare l'accesso a FC Power per i contratti delle utenze domestiche (luce e gas). Indicare il referente interno per le pratiche." },
  ] },
  { titolo: "Fase 3 — Formazione e regole", quando: "Prima settimana", nota: "Il collaboratore conosce metodo e regole prima del primo appuntamento.", steps: [
    { n: "08", titolo: "Abilitazione community Agente Strategico", testo: "Inviare il link di iscrizione con coupon COMMUNITY100: community.agentestrategico.it. Registrarsi con la mail aziendale e verificare che il coupon azzeri il costo. Comunicare il calendario della formazione settimanale." },
    { n: "09", titolo: "Condivisione metodo operativo", testo: "Consegnare il documento del metodo operativo. Fissare un momento di spiegazione con il team leader." },
    { n: "10", titolo: "Condivisione codice di comportamento", testo: "Consegnare il codice e farlo firmare per presa visione. Archiviare la copia firmata con il contratto." },
  ] },
  { titolo: "Fase 4 — Operatività e immagine", quando: "Entro 10 giorni", nota: "Il collaboratore entra nel monitoraggio e diventa visibile verso i clienti.", steps: [
    { n: "11", titolo: "Inserimento sul link del cruscotto giornaliero", testo: "Aggiungere nome e team al cruscotto. Spiegare cosa registrare ogni giorno: contatti, telefonate, WhatsApp, mail, appuntamenti. I dati alimentano la riunione del lunedì." },
    { n: "12", titolo: "Inserimento presidio", testo: "Inserire il collaboratore nella turnazione giornaliera del presidio al front office. Comunicare giorni e orari dei turni e le attività da svolgere al front office." },
    { n: "13", titolo: "Foto e video di presentazione", testo: "Fissare lo shooting: foto profilo con dress code aziendale e breve video di presentazione. Usare il materiale per sito, social e biglietti da visita." },
    { n: "14", titolo: "Inserimento sul sito FondoCasaHub", testo: "Pubblicare la scheda del collaboratore su fondocasahub.com con foto, ruolo e contatti. Verificare che la scheda sia online e corretta." },
    { n: "15", titolo: "Richiesta biglietti da visita ad Artwork", testo: "Inviare ad Artwork nome, ruolo, mail aziendale, cellulare e foto. Approvare la bozza prima della stampa." },
    { n: "16", titolo: "Apertura utenza Area Agenti riservata", testo: "Chiedere allo Store Manager l'invito su fondocasahub.com/area-agenti con la mail aziendale, con ruolo, team e livello compensi corretti. Verificare il primo accesso e che il collaboratore veda Documenti, CRM, Compensi e Social." },
  ] },
];
const TUTTI = FASI.flatMap((f) => f.steps);
const TOT = TUTTI.length;

const oggi = () => new Date().toISOString().slice(0, 10);
const dataIT = (iso) => (iso ? new Date(iso + (iso.length === 10 ? "T12:00" : "")).toLocaleDateString("it-IT") : "");
const sigla = (nome) => (nome || "").split(/\s+/).filter(Boolean).map((p) => p[0].toUpperCase()).join("").slice(0, 3);
const fatti = (s) => TUTTI.filter((x) => s?.[x.n]?.fatto).length;
const classeStato = (s) => `aa-stato aa-stato-${s.replace(/ /g, "-")}`;

/* ---------------- Elenco ---------------- */
export function ElencoInserimenti({ profilo, vai }) {
  const [lista, setLista] = useState(null);
  const isAdmin = profilo.ruolo === "admin";
  useEffect(() => {
    supabase.from("inserimenti").select("id, creato_il, aggiornato_il, collaboratore, ruolo, team, data_ingresso, steps, stato, creato_da_nome")
      .order("aggiornato_il", { ascending: false }).then(({ data }) => setLista(data || []));
  }, []);
  const nuovo = async () => {
    const { data, error } = await supabase.from("inserimenti").insert({ collaboratore: "Nuovo collaboratore", team: profilo.team || null, data_ingresso: oggi() }).select("id").single();
    if (error) return alert(error.message);
    vai(`inserimenti/${data.id}`);
  };
  const daVerificare = (lista || []).filter((r) => r.stato === "da verificare");
  return (
    <>
      <div className="aa-intestazione aa-intestazione-azione">
        <div>
          <p className="aa-occhiello">Manager · Rev. 05/10/2026</p>
          <h1 className="aa-titolo">Manuale di inserimento</h1>
          <p className="aa-sottotitolo">16 step in 4 fasi per ogni nuovo collaboratore. Il Team Manager compila e invia, lo Store Manager verifica e chiude.</p>
        </div>
        <button className="aa-btn aa-btn-pieno" onClick={nuovo}>+ Nuovo inserimento</button>
      </div>
      {isAdmin && daVerificare.length > 0 && <p className="aa-box-info"><strong>{daVerificare.length} schede da verificare.</strong></p>}
      <section className="aa-card">
        {lista === null ? <p className="aa-nota">Caricamento…</p> : lista.length === 0 ? <p className="aa-nota">Nessun inserimento.</p> : (
          <div className="aa-scorri">
            <table className="aa-tabella aa-tabella-click">
              <thead><tr><th>Collaboratore</th><th>Team</th><th>Ingresso</th><th>Avanzamento</th><th>Stato</th></tr></thead>
              <tbody>
                {lista.map((r) => (
                  <tr key={r.id} onClick={() => vai(`inserimenti/${r.id}`)}>
                    <td><strong>{r.collaboratore}</strong><br /><small className="aa-nota">{r.ruolo || "—"} · compilata da {r.creato_da_nome}</small></td>
                    <td>{r.team || "—"}</td>
                    <td>{dataIT(r.data_ingresso)}</td>
                    <td><div className="aa-barra-avanz"><span style={{ width: `${(fatti(r.steps) / TOT) * 100}%` }} /></div><small className="aa-nota">{fatti(r.steps)}/{TOT}</small></td>
                    <td><span className={classeStato(r.stato)}>{r.stato}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

/* ---------------- Scheda ---------------- */
export function SchedaInserimento({ id, profilo, vai }) {
  const [r, setR] = useState(undefined);
  const [msg, setMsg] = useState({ testo: "", errore: false });
  const [salvando, setSalvando] = useState(false);
  const isAdmin = profilo.ruolo === "admin";
  const mia = sigla(profilo.nome || profilo.email);

  const carica = async () => {
    const { data } = await supabase.from("inserimenti").select("*").eq("id", id).maybeSingle();
    setR(data);
  };
  useEffect(() => { carica(); }, [id]);

  if (r === undefined) return <p className="aa-nota">Caricamento…</p>;
  if (r === null) return <section className="aa-card"><p>Scheda non trovata.</p><button className="aa-btn" onClick={() => vai("inserimenti")}>Torna all'elenco</button></section>;

  const bloccata = r.stato === "verificato" || (!isAdmin && r.stato === "da verificare");
  const set = (k, v) => setR({ ...r, [k]: v });
  const setStep = (n, k, v) => {
    const prima = r.steps?.[n] || {};
    const nuovo = { ...prima, [k]: v };
    if (k === "fatto" && v) { nuovo.data = prima.data || oggi(); nuovo.sigla = prima.sigla || mia; }
    set("steps", { ...r.steps, [n]: nuovo });
  };
  const mostra = (testo, errore = false) => setMsg({ testo, errore });

  const salva = async (extra = {}) => {
    setSalvando(true);
    const campi = { collaboratore: r.collaboratore, ruolo: r.ruolo, data_ingresso: r.data_ingresso || null, cellulare: r.cellulare, mail_aziendale: r.mail_aziendale, steps: r.steps, note: r.note, ...extra };
    if (isAdmin) Object.assign(campi, { team: r.team, nota_sm: r.nota_sm, data_operativita: r.data_operativita || null });
    const { error } = await supabase.from("inserimenti").update(campi).eq("id", r.id);
    setSalvando(false);
    if (error) { mostra(error.message, true); return false; }
    await carica(); return true;
  };
  const invia = async () => {
    if (fatti(r.steps) < TOT && !window.confirm(`Completati ${fatti(r.steps)} step su ${TOT}. Inviare comunque allo Store Manager?`)) return;
    if (await salva({ stato: "da verificare" })) mostra("Scheda inviata allo Store Manager per la verifica.");
  };
  const verifica = async (ok) => {
    if (ok && !r.data_operativita) return mostra("Indica la data da cui il collaboratore è operativo.", true);
    if (!ok && !(r.nota_sm || "").trim()) return mostra("Scrivi nella nota cosa va rivisto.", true);
    const extra = ok ? { stato: "verificato", verificato_da: profilo.nome || profilo.email, verificato_il: new Date().toISOString() } : { stato: "da rivedere" };
    if (await salva(extra)) mostra(ok ? "Inserimento verificato e chiuso." : "Scheda rimandata al Team Manager.");
  };
  const elimina = async () => {
    if (!window.confirm(`Eliminare la scheda di ${r.collaboratore}?`)) return;
    const { error } = await supabase.from("inserimenti").delete().eq("id", r.id);
    if (error) return mostra(error.message, true);
    vai("inserimenti");
  };

  const scaricaPdf = async () => {
    mostra("Preparazione del PDF…");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const { data: link, error } = await supabase.storage.from("documenti").createSignedUrl(MODELLO_PDF, 120);
      if (error) throw new Error("Modello PDF non trovato nella cartella Manager.");
      const byte = await (await fetch(link.signedUrl)).arrayBuffer();
      const pdf = await PDFDocument.load(byte);
      const form = pdf.getForm();
      const testo = (nome, v) => { try { form.getTextField(nome).setText(v || ""); } catch { /* campo assente */ } };
      testo("info_collaboratore", r.collaboratore); testo("info_ruolo", r.ruolo); testo("info_team", r.team);
      testo("info_data_ingresso", dataIT(r.data_ingresso)); testo("info_cellulare", r.cellulare); testo("info_mail_aziendale", r.mail_aziendale);
      TUTTI.forEach((s) => {
        const v = r.steps?.[s.n] || {};
        try { const c = form.getCheckBox(`step${s.n}_fatto`); v.fatto ? c.check() : c.uncheck(); } catch { /* */ }
        testo(`step${s.n}_data`, dataIT(v.data)); testo(`step${s.n}_sigla`, v.sigla);
      });
      const s16 = r.steps?.["16"] || {};
      testo("note", [`16. Apertura utenza Area Agenti: ${s16.fatto ? `fatto il ${dataIT(s16.data)} (${s16.sigla || ""})` : "da fare"}`, r.note, r.nota_sm && `Store Manager: ${r.nota_sm}`].filter(Boolean).join("\n"));
      try { const c = form.getCheckBox("inserimento_completato"); r.stato === "verificato" ? c.check() : c.uncheck(); } catch { /* */ }
      testo("data_operativita", dataIT(r.data_operativita));
      const out = await pdf.save();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([out], { type: "application/pdf" }));
      a.download = `Inserimento ${r.collaboratore}.pdf`; document.body.appendChild(a); a.click(); a.remove();
      mostra("");
    } catch (e) { mostra(e.message || "Impossibile generare il PDF.", true); }
  };

  const n = fatti(r.steps);
  return (
    <>
      <button className="aa-link" onClick={() => vai("inserimenti")}>← Tutti gli inserimenti</button>
      <div className="aa-intestazione aa-intestazione-azione">
        <div>
          <p className="aa-occhiello">Inserimento · {r.team || "senza team"} · compilata da {r.creato_da_nome}</p>
          <h1 className="aa-titolo">{r.collaboratore}</h1>
          <p className="aa-sottotitolo">{n}/{TOT} step completati</p>
        </div>
        <span className={`${classeStato(r.stato)} aa-stato-grande`}>{r.stato}</span>
      </div>

      {r.stato === "da rivedere" && r.nota_sm && <p className="aa-errore"><strong>Da rivedere</strong> — {r.nota_sm}</p>}
      {r.stato === "verificato" && <p className="aa-info">Verificato da {r.verificato_da} il {dataIT(r.verificato_il?.slice(0, 10))} · collaboratore operativo dal {dataIT(r.data_operativita)}.</p>}
      {!isAdmin && r.stato === "da verificare" && <p className="aa-info">Inviata allo Store Manager il {dataIT(r.inviato_il?.slice(0, 10))}: in attesa di verifica.</p>}

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2">Collaboratore</h2>
        <fieldset disabled={bloccata} className="aa-fieldset">
          <div className="aa-griglia-campi">
            <label className="aa-campo"><span>Collaboratore <em>*</em></span><input value={r.collaboratore || ""} onChange={(e) => set("collaboratore", e.target.value)} /></label>
            <label className="aa-campo"><span>Ruolo</span><input value={r.ruolo || ""} onChange={(e) => set("ruolo", e.target.value)} placeholder="es. New Agent" /></label>
            <label className="aa-campo"><span>Team</span><input value={r.team || ""} onChange={(e) => set("team", e.target.value)} disabled={!isAdmin} /></label>
            <label className="aa-campo"><span>Data ingresso</span><input type="date" value={r.data_ingresso || ""} onChange={(e) => set("data_ingresso", e.target.value)} /></label>
            <label className="aa-campo"><span>Cellulare</span><input value={r.cellulare || ""} onChange={(e) => set("cellulare", e.target.value)} /></label>
            <label className="aa-campo"><span>Mail aziendale</span><input type="email" value={r.mail_aziendale || ""} onChange={(e) => set("mail_aziendale", e.target.value)} placeholder="nome.cognome@fondocasa.it" /></label>
          </div>
        </fieldset>
      </section>

      {FASI.map((f) => (
        <section key={f.titolo} className="aa-card aa-sezione">
          <div className="aa-riga"><h2 className="aa-h2">{f.titolo}</h2><span className="aa-stato">{f.quando}</span></div>
          <p className="aa-nota">{f.nota}</p>
          <fieldset disabled={bloccata} className="aa-fieldset">
            <ul className="aa-step-lista">
              {f.steps.map((s) => {
                const v = r.steps?.[s.n] || {};
                return (
                  <li key={s.n} className={v.fatto ? "fatto" : ""}>
                    <label className="aa-step-check"><input type="checkbox" checked={!!v.fatto} onChange={(e) => setStep(s.n, "fatto", e.target.checked)} /><span>{s.n}</span></label>
                    <div className="aa-step-testo"><strong>{s.titolo}</strong><p>{s.testo}</p></div>
                    <div className="aa-step-campi">
                      <label><span>Data</span><input type="date" value={v.data || ""} onChange={(e) => setStep(s.n, "data", e.target.value)} /></label>
                      <label><span>Sigla</span><input value={v.sigla || ""} maxLength={4} onChange={(e) => setStep(s.n, "sigla", e.target.value.toUpperCase())} /></label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        </section>
      ))}

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2">Note sull'inserimento</h2>
        <fieldset disabled={bloccata} className="aa-fieldset">
          <textarea className="aa-textarea" rows={4} value={r.note || ""} onChange={(e) => set("note", e.target.value)} />
        </fieldset>
        {!bloccata && (
          <div className="aa-modulo-azioni">
            <button className="aa-btn" disabled={salvando} onClick={async () => { if (await salva()) mostra("Scheda salvata."); }}>{salvando ? "Salvataggio…" : "Salva"}</button>
            {["in corso", "da rivedere"].includes(r.stato) && <button className="aa-btn aa-btn-pieno" disabled={salvando} onClick={invia}>Invia allo Store Manager · {n}/{TOT}</button>}
          </div>
        )}
      </section>

      {isAdmin && r.stato !== "verificato" && (
        <section className="aa-card aa-gestione-stato">
          <h2 className="aa-h2">Verifica Store Manager</h2>
          <div className="aa-griglia-campi">
            <label className="aa-campo"><span>Collaboratore operativo dal <em>*</em></span><input type="date" value={r.data_operativita || ""} onChange={(e) => set("data_operativita", e.target.value)} /></label>
            <label className="aa-campo aa-campo-largo"><span>Nota (obbligatoria se rimandi)</span><input value={r.nota_sm || ""} onChange={(e) => set("nota_sm", e.target.value)} /></label>
          </div>
          <div className="aa-riga" style={{ marginTop: 12 }}>
            <button className="aa-btn" onClick={() => verifica(false)}>Rimanda al Team Manager</button>
            <button className="aa-btn aa-btn-pieno" onClick={() => verifica(true)}>Verifica e chiudi · tutti i {TOT} step</button>
          </div>
        </section>
      )}

      {msg.testo && <p className={msg.errore ? "aa-errore" : "aa-info"}>{msg.testo}</p>}
      <div className="aa-riga">
        <button className="aa-btn" onClick={scaricaPdf}>Scarica PDF compilato</button>
        {isAdmin && <button className="aa-link aa-link-rosso" onClick={elimina}>Elimina scheda</button>}
      </div>
    </>
  );
}
