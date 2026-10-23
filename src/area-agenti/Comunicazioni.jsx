import React, { useEffect, useState, useCallback } from "react";
import { supabase, BUCKET, RUOLI } from "./supabase";

// Le comunicazioni sono salvate nella tabella "avvisi"; gli allegati nel bucket
// "documenti" sotto 00-comunicazioni/<id>/ (li vede solo chi vede la comunicazione).
export const CARTELLA_COMUNICAZIONI = "00-comunicazioni";

const oggiISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const dataBreve = (iso) => new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
const dataLunga = (iso) => new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
const isNuova = (iso) => Date.now() - new Date(iso).getTime() < 7 * 24 * 3600 * 1000;
const inEvidenza = (c) => !c.scade_il || c.scade_il >= oggiISO();
const nomeSicuro = (n) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\- ()]/g, "_");

async function apriAllegato(percorso) {
  const w = window.open("", "_blank");
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(percorso, 300);
  if (error || !data) { if (w) w.close(); return alert("Impossibile aprire l'allegato."); }
  if (w) w.location.href = data.signedUrl; else window.location.href = data.signedUrl;
}

function Allegati({ lista }) {
  if (!lista?.length) return null;
  return (
    <div className="aa-com-allegati">
      {lista.map((a) => (
        <button key={a.percorso} className="aa-chip" onClick={() => apriAllegato(a.percorso)}>
          <span aria-hidden="true">📎</span> {a.nome}
        </button>
      ))}
    </div>
  );
}

/* ---------- Riquadro in home (come "Oggi in agenda") ---------- */
export function BoxComunicazioni({ vai }) {
  const [lista, setLista] = useState(null);
  useEffect(() => {
    supabase.from("avvisi").select("*").order("pubblicato_il", { ascending: false }).limit(20)
      .then(({ data }) => setLista(data || []));
  }, []);
  if (lista === null) return null;
  const evidenza = lista.filter(inEvidenza).slice(0, 4);
  const mostra = evidenza.length ? evidenza : lista.slice(0, 3);

  return (
    <section className="aa-card">
      <div className="aa-card-testa">
        <h2 className="aa-h2">Comunicazioni</h2>
        <button className="aa-link" onClick={() => vai("comunicazioni")}>Vedi tutte →</button>
      </div>
      {mostra.length === 0 ? <p className="aa-nota">Nessuna comunicazione.</p> : (
        <ul className="aa-agenda aa-com-lista">
          {mostra.map((c) => (
            <li key={c.id} onClick={() => vai(`comunicazioni/${c.id}`)}>
              <span>{dataBreve(c.pubblicato_il)}</span>
              <div>
                <strong>{c.titolo}</strong>
                {isNuova(c.pubblicato_il) && <em className="aa-nuova">Nuova</em>}
                {c.allegati?.length > 0 && <small className="aa-nota"> · 📎 {c.allegati.length}</small>}
                {c.testo && <p className="aa-com-anteprima">{c.testo}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------- Archivio ---------- */
export function PaginaComunicazioni({ id }) {
  const [lista, setLista] = useState(null);
  useEffect(() => {
    supabase.from("avvisi").select("*").order("pubblicato_il", { ascending: false })
      .then(({ data }) => setLista(data || []));
  }, []);
  useEffect(() => {
    if (id && lista) document.getElementById(`com-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [id, lista]);

  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">Store Napoli Vomero</p>
        <h1 className="aa-titolo">Comunicazioni</h1>
        <p className="aa-sottotitolo">Circolari, avvisi e novità dello store, con i relativi allegati.</p>
      </div>
      {lista === null ? <p className="aa-nota">Caricamento…</p> : lista.length === 0 ? (
        <section className="aa-card"><p className="aa-nota">Nessuna comunicazione pubblicata.</p></section>
      ) : lista.map((c) => (
        <article key={c.id} id={`com-${c.id}`} className={`aa-card aa-com ${String(c.id) === String(id) ? "aa-com-attiva" : ""}`}>
          <p className="aa-occhiello">
            {dataLunga(c.pubblicato_il)}{c.autore ? ` · ${c.autore}` : ""}
            {isNuova(c.pubblicato_il) && <em className="aa-nuova">Nuova</em>}
          </p>
          <h2 className="aa-h2">{c.titolo}</h2>
          {c.testo && <p className="aa-com-testo">{c.testo}</p>}
          <Allegati lista={c.allegati} />
        </article>
      ))}
    </>
  );
}

/* ---------- Gestione (solo Admin) ---------- */
const VUOTA = () => ({ titolo: "", testo: "", scade_il: "", ruoli: RUOLI.map((r) => r.id), email: true });

export function GestioneComunicazioni({ profilo }) {
  const [lista, setLista] = useState([]);
  const [nuova, setNuova] = useState(VUOTA());
  const [file, setFile] = useState([]);
  const [stato, setStato] = useState({ invio: false, msg: "", errore: false });

  const carica = useCallback(() => {
    supabase.from("avvisi").select("*").order("pubblicato_il", { ascending: false })
      .then(({ data }) => setLista(data || []));
  }, []);
  useEffect(carica, [carica]);

  const avvisa = (msg, errore = false) => { setStato({ invio: false, msg, errore }); setTimeout(() => setStato((s) => ({ ...s, msg: "" })), 4000); };

  const pubblica = async (e) => {
    e.preventDefault();
    if (!nuova.ruoli.length) return avvisa("Scegli almeno un ruolo che vede la comunicazione.", true);
    setStato({ invio: true, msg: "Pubblicazione…", errore: false });
    const { data: c, error } = await supabase.from("avvisi")
      .insert({ titolo: nuova.titolo, testo: nuova.testo, scade_il: nuova.scade_il || null, ruoli: nuova.ruoli, autore: profilo.nome || profilo.email })
      .select("id").single();
    if (error) return avvisa(error.message, true);

    const allegati = [];
    for (let i = 0; i < file.length; i++) {
      setStato({ invio: true, msg: `Caricamento allegati ${i + 1} di ${file.length}…`, errore: false });
      const percorso = `${CARTELLA_COMUNICAZIONI}/${c.id}/${nomeSicuro(file[i].name)}`;
      const { error: errUp } = await supabase.storage.from(BUCKET).upload(percorso, file[i], { upsert: true });
      if (errUp) { avvisa(`${file[i].name}: ${errUp.message}`, true); continue; }
      allegati.push({ percorso, nome: file[i].name, dimensione: file[i].size });
    }
    if (allegati.length) await supabase.from("avvisi").update({ allegati }).eq("id", c.id);

    let esito = "Comunicazione pubblicata";
    if (nuova.email) {
      setStato({ invio: true, msg: "Invio email di avviso…", errore: false });
      const r = await inviaEmail(c.id, false);
      esito += r.errore ? ` — email non inviata: ${r.errore}` : ` — email inviata a ${r.inviate} collaboratori`;
      setNuova(VUOTA()); setFile([]);
      avvisa(esito, !!r.errore);
    } else {
      setNuova(VUOTA()); setFile([]);
      avvisa(esito);
    }
    carica();
  };

  const inviaEmail = async (id, forza) => {
    const { data, error } = await supabase.functions.invoke("notifica-comunicazione", { body: { id, forza } });
    if (error) {
      let msg = error.message;
      try { const b = await error.context?.json(); if (b?.errore) msg = b.errore; } catch { /* risposta non JSON */ }
      return { errore: msg };
    }
    if (data?.errore) return { errore: data.errore };
    const falliti = data?.falliti?.length ? ` (non recapitate: ${data.falliti.join(", ")})` : "";
    return { inviate: (data?.inviate ?? 0) + falliti };
  };

  const reinvia = async (c) => {
    const gia = c.email_inviata_il ? ` L'avviso è già stato inviato il ${new Date(c.email_inviata_il).toLocaleDateString("it-IT")}.` : "";
    if (!window.confirm(`Inviare l'email di avviso per "${c.titolo}" a tutti i collaboratori dei ruoli scelti?${gia}`)) return;
    setStato({ invio: true, msg: "Invio email di avviso…", errore: false });
    const r = await inviaEmail(c.id, true);
    avvisa(r.errore ? `Email non inviata: ${r.errore}` : `Email inviata a ${r.inviate} collaboratori`, !!r.errore);
    carica();
  };

  const elimina = async (c) => {
    if (!window.confirm(`Eliminare la comunicazione "${c.titolo}" e i suoi allegati?`)) return;
    if (c.allegati?.length) await supabase.storage.from(BUCKET).remove(c.allegati.map((a) => a.percorso));
    const { error } = await supabase.from("avvisi").delete().eq("id", c.id);
    if (error) return avvisa(error.message, true);
    carica();
  };

  return (
    <section className="aa-card">
      <p className="aa-nota">La comunicazione compare subito nel riquadro Comunicazioni della home di chi ha uno dei ruoli scelti, fino alla data "In evidenza fino al". Dopo resta nell'archivio Comunicazioni. Gli allegati confluiscono nella cartella Comunicazioni.</p>
      {stato.msg && <p className={stato.errore ? "aa-errore" : "aa-info"}>{stato.msg}</p>}
      <form className="aa-form" onSubmit={pubblica}>
        <label>Titolo<input value={nuova.titolo} onChange={(e) => setNuova({ ...nuova, titolo: e.target.value })} required /></label>
        <label>Testo<textarea rows={4} value={nuova.testo} onChange={(e) => setNuova({ ...nuova, testo: e.target.value })} /></label>
        <div className="aa-form aa-form-riga">
          <label>In evidenza in home fino al (facoltativo)<input type="date" value={nuova.scade_il} onChange={(e) => setNuova({ ...nuova, scade_il: e.target.value })} /></label>
          <label className="aa-btn aa-upload">+ Allegati (PDF, immagini, documenti)
            <input type="file" multiple onChange={(e) => { setFile([...file, ...Array.from(e.target.files || [])]); e.target.value = ""; }} />
          </label>
        </div>
        {file.length > 0 && (
          <ul className="aa-lista-avvisi">
            {file.map((x, i) => (
              <li key={i}><span>📎 {x.name} <span className="aa-nota">{(x.size / 1024 / 1024).toFixed(1)} MB</span></span>
                <button type="button" className="aa-link aa-link-rosso" onClick={() => setFile(file.filter((_, j) => j !== i))}>togli</button></li>
            ))}
          </ul>
        )}
        <div className="aa-form-campo">Visibile a
          <div className="aa-ruoli">
            {RUOLI.map((r) => (
              <label key={r.id}>
                <input type="checkbox" checked={nuova.ruoli.includes(r.id)}
                  onChange={(e) => setNuova({ ...nuova, ruoli: e.target.checked ? [...nuova.ruoli, r.id] : nuova.ruoli.filter((x) => x !== r.id) })} />
                {r.nome}
              </label>
            ))}
          </div>
        </div>
        <div className="aa-ruoli">
          <label>
            <input type="checkbox" checked={nuova.email} onChange={(e) => setNuova({ ...nuova, email: e.target.checked })} />
            Avvisa via email i collaboratori dei ruoli scelti
          </label>
        </div>
        <button className="aa-btn aa-btn-pieno" disabled={stato.invio}>{stato.invio ? stato.msg : "Pubblica comunicazione"}</button>
      </form>

      <h2 className="aa-h2">Pubblicate</h2>
      <ul className="aa-lista-avvisi">
        {lista.map((c) => (
          <li key={c.id}>
            <div>
              <strong>{c.titolo}</strong>
              <span className="aa-nota">
                {new Date(c.pubblicato_il).toLocaleDateString("it-IT")}
                {c.scade_il ? ` · in evidenza fino al ${new Date(c.scade_il).toLocaleDateString("it-IT")}` : ""}
                {` · ${c.ruoli.join(", ")}`}
                {c.allegati?.length ? ` · 📎 ${c.allegati.length}` : ""}
                {c.email_inviata_il ? ` · ✉ email inviata il ${new Date(c.email_inviata_il).toLocaleDateString("it-IT")} a ${c.email_destinatari ?? "?"}` : " · ✉ email non inviata"}
              </span>
            </div>
            <div>
              <button className="aa-link" onClick={() => reinvia(c)} disabled={stato.invio}>{c.email_inviata_il ? "Reinvia email" : "Invia email"}</button>
              {" "}
              <button className="aa-link aa-link-rosso" onClick={() => elimina(c)}>Elimina</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
