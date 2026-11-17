// «I miei copioni» (dal 16/11/2026, richiesta di Jgio di Sensoria): ogni agente legge il testo dei suoi copioni, lascia
// un commento su cosa si può dire e cosa no, approva, prenota l'ora delle riprese e si fa mandare il copione in PDF.
// I copioni stanno sul server di Sensoria (Marketing FC): qui si leggono e si scrivono con le sue API, con la sessione
// dell'agente (il server chiede a Supabase chi è). Niente tabelle nuove nel database del sito. Vedi SENSORIA.md.
import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

const API = import.meta.env.VITE_COPIONI_API || "https://app.sensoriaspace.com/api/agenti";

async function chiama(percorso, corpo) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sessione scaduta: esci e rientra.");
  let r;
  try {
    r = await fetch(API + percorso, {
      method: corpo ? "POST" : "GET",
      headers: { Authorization: `Bearer ${token}`, ...(corpo ? { "Content-Type": "application/json" } : {}) },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new Error("Non riesco a raggiungere i copioni. Controlla la connessione e riprova.");
  }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.errore || "Qualcosa non ha funzionato: riprova tra poco.");
  return d;
}

const quando = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleString("it-IT", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
};

function Stato({ testo, approvato }) {
  return <span className={`aa-stato cp-stato${approvato ? " cp-ok" : ""}`}>{testo}</span>;
}

/* ---------------- ELENCO ---------------- */
export function ElencoCopioni({ vai }) {
  const [dati, setDati] = useState(null);
  const [errore, setErrore] = useState("");

  useEffect(() => {
    chiama("/copioni").then(setDati).catch((e) => setErrore(e.message));
  }, []);

  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">Marketing</p>
        <h1 className="aa-titolo">I miei copioni</h1>
        <p className="aa-sottotitolo">I video che giriamo con te. Leggi cosa dirai, dicci se qualcosa non va e approva.</p>
      </div>
      {errore && <p className="aa-errore">{errore}</p>}
      {!dati && !errore && <div className="aa-centro"><div className="aa-spinner" aria-label="Caricamento" /></div>}
      {dati && dati.copioni.length === 0 && (
        <section className="aa-card"><p className="aa-nota" style={{ margin: 0 }}>Per ora non hai copioni. Quando il Marketing te ne manda uno, lo trovi qui.</p></section>
      )}
      {dati && dati.copioni.length > 0 && (
        <div className="cp-lista">
          {dati.copioni.map((c) => (
            <button key={c.id} className={`aa-card cp-voce${c.da_fare ? " cp-da-fare" : ""}`} onClick={() => vai(`copioni/${c.id}`)}>
              <Stato testo={c.stato_testo} approvato={c.stato === "approvato"} />
              <strong>{c.titolo}</strong>
              {c.scade && <span className="cp-sotto">Leggilo entro {quando(c.scade)}</span>}
              {c.prenotazione && <span className="cp-sotto">Riprese: {c.prenotazione.giorno} alle {c.prenotazione.ora}</span>}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------------- UN COPIONE ---------------- */
export function SchedaCopione({ id, profilo, vai }) {
  const [c, setC] = useState(null);
  const [errore, setErrore] = useState("");
  const [aperto, setAperto] = useState(null);      // id della battuta che si sta commentando
  const [testo, setTesto] = useState("");
  const [generale, setGenerale] = useState("");
  const [occupato, setOccupato] = useState(false);
  const [msg, setMsg] = useState("");

  const carica = useCallback(() => {
    chiama(`/copioni/${encodeURIComponent(id)}`).then(setC).catch((e) => setErrore(e.message));
  }, [id]);
  useEffect(() => { carica(); }, [carica]);

  const fai = async (azione, corpo, poi) => {
    setOccupato(true); setErrore(""); setMsg("");
    try {
      const d = await chiama(`/copioni/${encodeURIComponent(id)}/${azione}`, corpo || {});
      if (d.vista) setC(d.vista);
      if (poi) poi(d);
    } catch (e) { setErrore(e.message); } finally { setOccupato(false); }
  };

  if (errore && !c) return <><Indietro vai={vai} /><p className="aa-errore">{errore}</p></>;
  if (!c) return <div className="aa-centro"><div className="aa-spinner" aria-label="Caricamento" /></div>;

  const commentiDi = (rid) => c.commenti.filter((x) => x.riga === rid);
  const puoCommentare = c.stato !== "approvato";
  const invia = (riga, t, pulisci) => fai("commento", { riga, testo: t }, () => {
    pulisci(); setAperto(null);
    setMsg("Commento inviato. Correggiamo il copione e ti arriva qui la versione nuova da rileggere.");
  });

  // una funzione, non un componente: un componente creato qui farebbe perdere il cursore alla casella a ogni lettera
  const battuta = (b) => (
    <li key={b.id} className={`cp-battuta${b.altro ? " cp-altro" : ""}`}>
      {b.n ? <span className="cp-n">{b.n}</span> : <span className="cp-n" />}
      <div className="cp-corpo">
        {b.segnaposto ? <p className="cp-segnaposto">Qui va l'inizio che registri (sopra).</p> : (
          <p className="cp-testo">
            {b.altro && <span className="cp-chi">{b.altro}: </span>}«{b.testo}»
            {b.solo_voce && <span className="cp-tag">solo voce</span>}
            {b.nuova && <span className="cp-tag cp-nuova">nuova</span>}
          </p>
        )}
        {commentiDi(b.id).map((x) => <Commento key={x.n} x={x} />)}
        {!b.segnaposto && puoCommentare && (aperto === b.id ? (
          <div className="cp-commenta">
            <textarea rows={3} value={testo} onChange={(e) => setTesto(e.target.value)} autoFocus
              placeholder="Cosa non va? Un dato sbagliato, una cosa che non si può dire, una frase che diresti diversamente…" />
            <div className="cp-azioni">
              <button className="aa-btn aa-btn-pieno aa-btn-piccolo" disabled={occupato || !testo.trim()} onClick={() => invia(b.id, testo, () => setTesto(""))}>Invia</button>
              <button className="aa-link" onClick={() => { setAperto(null); setTesto(""); }}>Annulla</button>
            </div>
          </div>
        ) : (
          <button className="aa-link cp-link" onClick={() => { setAperto(b.id); setTesto(""); }}>Commenta questa frase</button>
        ))}
      </div>
    </li>
  );

  return (
    <>
      <Indietro vai={vai} />
      <div className="aa-intestazione">
        <p className="aa-occhiello">Il tuo copione · dura circa {c.secondi} secondi</p>
        <h1 className="aa-titolo">{c.titolo}</h1>
        <Stato testo={c.stato_testo} approvato={c.stato === "approvato"} />
      </div>

      {c.scade && <p className="aa-box-info cp-avviso">Leggilo entro <strong>{quando(c.scade)}</strong>: se non ci rispondi, il video passa a un collega.</p>}
      {c.stato === "da riapprovare" && <p className="aa-box-info cp-avviso">Abbiamo corretto il copione con i tuoi commenti: le frasi cambiate sono segnate <span className="cp-tag cp-nuova">nuova</span>. Rileggilo e, se va bene, approvalo.</p>}
      {c.stato === "commenti" && <p className="aa-box-info cp-avviso">Grazie dei commenti! Stiamo correggendo il copione: la versione nuova ti arriva qui, da rileggere e approvare.</p>}
      {errore && <p className="aa-errore">{errore}</p>}
      {msg && <p className="aa-box-info cp-ok-msg">{msg}</p>}

      <section className="aa-card cp-copione">
        {c.inizio.length > 0 && (
          <>
            <h2 className="aa-h2">{c.inizio.length > 1 ? `L'inizio: registralo in ${c.inizio.length} modi` : "L'inizio"}</h2>
            {c.inizio.map((ap) => (
              <div key={ap.lettera} className="cp-apertura">
                {c.inizio.length > 1 && <p className="cp-lettera">Versione {ap.lettera}</p>}
                <ol className="cp-battute">{ap.righe.map(battuta)}</ol>
              </div>
            ))}
          </>
        )}
        <h2 className="aa-h2">{c.inizio.length ? "Poi, in ordine" : "Cosa dici, in ordine"}</h2>
        <ol className="cp-battute">{c.battute.map(battuta)}</ol>
      </section>

      {c.controlla.length > 0 && (
        <section className="aa-card">
          <h2 className="aa-h2">Da controllare</h2>
          <p className="aa-nota">Sono cose che non sappiamo per certo. Se qualcosa non è vero o non lo diresti così, scrivilo qui sotto.</p>
          <ul className="cp-controlla">{c.controlla.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </section>
      )}

      {puoCommentare && (
        <section className="aa-card">
          <h2 className="aa-h2">Un commento su tutto il copione</h2>
          <p className="aa-nota">Cosa si può dire e cosa no, un dato sbagliato, una frase che non diresti così.</p>
          <textarea className="cp-area" rows={3} value={generale} onChange={(e) => setGenerale(e.target.value)} placeholder="Scrivi qui…" />
          <button className="aa-btn aa-btn-pieno" disabled={occupato || !generale.trim()} onClick={() => invia(null, generale, () => setGenerale(""))}>Invia il commento</button>
          {commentiDi(null).map((x) => <Commento key={x.n} x={x} />)}
        </section>
      )}
      {!puoCommentare && commentiDi(null).length > 0 && (
        <section className="aa-card"><h2 className="aa-h2">I tuoi commenti su tutto il copione</h2>{commentiDi(null).map((x) => <Commento key={x.n} x={x} />)}</section>
      )}

      <section className="aa-card cp-approva">
        {c.stato === "approvato" ? (
          <p style={{ margin: 0 }}><strong>Hai approvato questo copione</strong> {c.approvato?.quando ? `(${quando(c.approvato.quando)})` : ""}. Grazie!</p>
        ) : c.stato === "commenti" ? (
          <p className="aa-nota" style={{ margin: 0 }}>Quando arriva la versione corretta, qui trovi il bottone per approvarla.</p>
        ) : (
          <>
            <p className="aa-nota">Se va tutto bene così, approvalo. Se qualcosa non va, commenta la frase: lo correggiamo noi.</p>
            <button className="aa-btn aa-btn-pieno cp-grande" disabled={occupato} onClick={() => fai("approvo", {}, () => setMsg("Copione approvato. Grazie!"))}>Approvo</button>
          </>
        )}
      </section>

      <Prenota c={c} setC={setC} />
      <PerEmail c={c} profilo={profilo} />
    </>
  );
}

function Indietro({ vai }) {
  return <button className="aa-link cp-indietro" onClick={() => vai("copioni")}>← I miei copioni</button>;
}

function Commento({ x }) {
  return (
    <div className="cp-commento">
      <p><strong>Il tuo commento:</strong> {x.testo}</p>
      {x.esito ? <p className="cp-risposta"><strong>{x.esito === "non si può" ? "Non si può" : x.esito === "in parte" ? "Fatto in parte" : "Fatto"}:</strong> {x.risposta}</p>
        : <p className="cp-risposta cp-attesa">Lo stiamo guardando.</p>}
    </div>
  );
}

/* ---------------- PRENOTAZIONE DELLE RIPRESE ---------------- */
// la durata la decide il marketing (dal 17/11 15 minuti a video): si legge dalla prenotazione, non è scritta qui
const minuti = (p) => Math.max(5, Math.round((new Date(p.fine) - new Date(p.inizio)) / 60000) || 15);
function Prenota({ c, setC }) {
  const [slot, setSlot] = useState(null);
  const [cambia, setCambia] = useState(!c.prenotazione);
  const [errore, setErrore] = useState("");
  const [occupato, setOccupato] = useState(false);

  useEffect(() => {
    if (!cambia) return;
    setSlot(null);
    chiama(`/slot?copione=${encodeURIComponent(c.id)}`).then(setSlot).catch((e) => setErrore(e.message));
  }, [cambia, c.id]);

  const prenota = async (o, giorno) => {
    if (!window.confirm(`Prenoti le riprese ${giorno} alle ${o.ora}?`)) return;
    setOccupato(true); setErrore("");
    try {
      const d = await chiama(`/copioni/${encodeURIComponent(c.id)}/prenota`, { inizio: o.inizio });
      setC(d.vista); setCambia(false);
    } catch (e) {
      setErrore(e.message);
      chiama(`/slot?copione=${encodeURIComponent(c.id)}`).then(setSlot).catch(() => {});
    } finally { setOccupato(false); }
  };
  const disdici = async () => {
    if (!window.confirm("Disdici l'orario delle riprese?")) return;
    setOccupato(true); setErrore("");
    try { const d = await chiama(`/copioni/${encodeURIComponent(c.id)}/disdici`, {}); setC(d.vista); setCambia(true); }
    catch (e) { setErrore(e.message); } finally { setOccupato(false); }
  };

  return (
    <section className="aa-card">
      <h2 className="aa-h2">Quando giriamo</h2>
      {errore && <p className="aa-errore">{errore}</p>}
      {c.prenotazione && !cambia && (
        <>
          <p className="cp-prenotato"><strong>{c.prenotazione.giorno}</strong> alle <strong>{c.prenotazione.ora}</strong> · {minuti(c.prenotazione)} minuti</p>
          <div className="cp-azioni">
            <button className="aa-btn aa-btn-piccolo" disabled={occupato} onClick={() => setCambia(true)}>Cambia orario</button>
            <button className="aa-link aa-link-rosso" disabled={occupato} onClick={disdici}>Disdici</button>
          </div>
        </>
      )}
      {cambia && (
        <>
          <p className="aa-nota">Scegli quando registrare questo video: servono {slot?.durata || 15} minuti.</p>
          {!slot && !errore && <div className="aa-spinner" aria-label="Caricamento" />}
          {slot && slot.giorni.length === 0 && <p className="aa-nota">{slot.messaggio || "Nessun orario libero per ora."}</p>}
          {slot && slot.giorni.map((g) => (
            <div key={g.data} className="cp-giorno">
              <p className="cp-giorno-nome">{g.giorno}</p>
              <div className="cp-orari">
                {g.orari.map((o) => <button key={o.inizio} className="aa-btn aa-btn-piccolo" disabled={occupato} onClick={() => prenota(o, g.giorno)}>{o.ora}</button>)}
              </div>
            </div>
          ))}
          {c.prenotazione && <button className="aa-link" onClick={() => setCambia(false)}>Tieni {c.prenotazione.giorno} alle {c.prenotazione.ora}</button>}
        </>
      )}
    </section>
  );
}

/* ---------------- COPIONE PER EMAIL ---------------- */
function PerEmail({ c, profilo }) {
  const [email, setEmail] = useState(profilo?.email || "");
  const [stato, setStato] = useState("");
  const [errore, setErrore] = useState("");
  const [occupato, setOccupato] = useState(false);

  const manda = async () => {
    setOccupato(true); setErrore(""); setStato("");
    const { data, error } = await supabase.functions.invoke("notifica-copione", { body: { id: c.id, email: email.trim() } });
    setOccupato(false);
    if (error || data?.errore) {
      let m = data?.errore;
      try { m = m || (await error.context.json()).errore; } catch { /* niente */ }
      setErrore(m || "Non sono riuscito a mandarlo: scarica il PDF qui sotto.");
      return;
    }
    setStato(`Fatto: il copione arriva a ${email.trim()} tra qualche minuto (guarda anche nello spam).`);
  };
  const scarica = async () => {
    const [PDFLib, { pdfCopione }] = await Promise.all([import("pdf-lib"), import("../../supabase/functions/_shared/copione-pdf.js")]);
    const byte = await pdfCopione(PDFLib, { ...c, agente: profilo?.nome || "" });
    const url = URL.createObjectURL(new Blob([byte], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url; a.download = `copione-${c.id}.pdf`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  // sempre visibile, così l'agente sa che c'è; si accende quando ha approvato (Jgio 16/11: «quando l'agente è soddisfatto»)
  const pronto = c.puoi_email;
  return (
    <section className="aa-card">
      <h2 className="aa-h2">Il copione da stampare</h2>
      <p className="aa-nota">{pronto ? "Te lo mandiamo in PDF: battute e cose da controllare, da stampare o da tenere sul telefono."
        : "Quando approvi il copione, qui te lo mandiamo per email in PDF o lo scarichi, da stampare o da tenere sul telefono."}</p>
      {errore && <p className="aa-errore">{errore}</p>}
      {stato && <p className="aa-box-info cp-ok-msg">{stato}</p>}
      <label className="aa-campo"><span>La tua email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={!pronto} />
      </label>
      <div className="cp-azioni" style={{ marginTop: 10 }}>
        <button className="aa-btn aa-btn-pieno" disabled={!pronto || occupato || !email.includes("@")} onClick={manda}>Mandami il copione per email</button>
        {pronto && <button className="aa-link" onClick={scarica}>oppure scarica il PDF</button>}
      </div>
    </section>
  );
}

/* ---------------- quanti da leggere (per la home) ---------------- */
export async function quantiCopioniDaFare() {
  try {
    const d = await chiama("/copioni");
    return d.copioni.filter((x) => x.da_fare).length;
  } catch {
    return 0;
  }
}
