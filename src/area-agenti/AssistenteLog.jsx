// Log di Chirone: domande recenti, risposte senza fonte e feedback negativi.
// Solo per l'admin: la tabella è leggibile solo da lui (regola RLS).
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

const FILTRI = [
  { id: "tutte", nome: "Tutte" },
  { id: "senza", nome: "Senza fonte" },
  { id: "negative", nome: "Feedback negativo" },
];

const data = (iso) =>
  new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function AssistenteLog() {
  const [righe, setRighe] = useState(null);
  const [nomi, setNomi] = useState({});
  const [errore, setErrore] = useState(null);
  const [filtro, setFiltro] = useState("tutte");
  const [aperta, setAperta] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: log, error } = await supabase
        .from("assistente_log")
        .select("id, created_at, user_id, ruolo, domanda, risposta, fonti_citate, senza_fonte, feedback")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) { setErrore(error.message); return; }
      setRighe(log);
      const { data: profili } = await supabase.from("profiles").select("id, nome, email");
      setNomi(Object.fromEntries((profili || []).map((p) => [p.id, p.nome || p.email])));
    })();
  }, []);

  const visibili = useMemo(() => (righe || []).filter((r) => {
    if (filtro === "senza") return r.senza_fonte;
    if (filtro === "negative") return r.feedback === -1;
    return true;
  }), [righe, filtro]);

  const conta = (f) => (righe || []).filter((r) => (f === "senza" ? r.senza_fonte : f === "negative" ? r.feedback === -1 : true)).length;

  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">Chirone</p>
        <h1 className="aa-titolo">Log dell'assistente</h1>
        <p className="aa-sottotitolo">
          Le domande senza fonte e quelle con feedback negativo indicano cosa manca nel manuale.
          Ultime 300 domande.
        </p>
      </div>

      <div className="aa-card">
        <div className="chl-filtri" role="tablist">
          {FILTRI.map((f) => (
            <button key={f.id} role="tab" aria-selected={filtro === f.id}
              className={`chl-filtro ${filtro === f.id ? "attivo" : ""}`} onClick={() => setFiltro(f.id)}>
              {f.nome} <span>{righe ? conta(f.id) : "…"}</span>
            </button>
          ))}
        </div>

        {errore && <p className="aa-nota">Impossibile leggere il log: {errore}</p>}
        {!errore && righe === null && <p className="aa-nota">Caricamento…</p>}
        {righe && visibili.length === 0 && <p className="aa-nota">Nessuna domanda in questo elenco.</p>}

        <ul className="chl-elenco">
          {visibili.map((r) => (
            <li key={r.id} className="chl-riga">
              <button className="chl-testa" onClick={() => setAperta(aperta === r.id ? null : r.id)} aria-expanded={aperta === r.id}>
                <span className="chl-data">{data(r.created_at)}</span>
                <span className="chl-chi">{nomi[r.user_id] || "—"} · {r.ruolo}</span>
                <span className="chl-domanda">{r.domanda}</span>
                <span className="chl-segni">
                  {r.senza_fonte && <em className="chl-segno chl-senza">senza fonte</em>}
                  {r.feedback === -1 && <em className="chl-segno chl-neg">👎</em>}
                  {r.feedback === 1 && <em className="chl-segno">👍</em>}
                  {!r.risposta && <em className="chl-segno chl-senza">nessuna risposta</em>}
                </span>
              </button>
              {aperta === r.id && (
                <div className="chl-dettaglio">
                  <p className="chl-etichetta">Risposta</p>
                  <p className="chl-risposta">{r.risposta || "Nessuna risposta: errore o richiesta interrotta."}</p>
                  {r.fonti_citate?.length > 0 && (
                    <p className="aa-nota">Fonti: {r.fonti_citate.join(" · ")}</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
