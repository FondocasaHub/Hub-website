// Shooting degli immobili (dal 19/11/2026, richiesta di Jgio di Sensoria): nel «Nuovo Ingaggio Marketing» l'agente
// sceglie lo slot in cui registrare sull'immobile, al posto delle due date proposte a mano. Gli slot li calcola il server
// di Sensoria incrociando il calendario di Gio e gli impegni di Manu (il videomaker): ogni orario dice chi viene. Lo
// shooting si sposta o si disdice dalla richiesta, fino a 24 ore prima. Stesse API e stessa sessione di «I miei copioni».
import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

const API = import.meta.env.VITE_COPIONI_API || "https://app.sensoriaspace.com/api/agenti";

export async function chiamaShooting(percorso, corpo) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sessione scaduta: esci e rientra.");
  let r;
  try {
    r = await fetch(API + "/shooting" + percorso, {
      method: corpo ? "POST" : "GET",
      headers: { Authorization: `Bearer ${token}`, ...(corpo ? { "Content-Type": "application/json" } : {}) },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new Error("Non riesco a raggiungere il calendario degli shooting. Controlla la connessione e riprova.");
  }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.errore || "Qualcosa non ha funzionato: riprova tra poco.");
  return d;
}

const durata = (min) => (min % 60 ? `${min} minuti` : min === 60 ? "1 ora" : `${min / 60} ore`);

/* ---------------- scelta dello slot (modulo e «Sposta») ---------------- */
export function SceltaSlot({ scelto, onScegli, sposta, ricarica }) {
  const [slot, setSlot] = useState(null);
  const [errore, setErrore] = useState("");
  const [giorno, setGiorno] = useState("");

  useEffect(() => {
    setSlot(null); setErrore("");
    chiamaShooting("/slot" + (sposta ? `?sposta=${encodeURIComponent(sposta)}` : ""))
      .then((d) => { setSlot(d); setGiorno((g) => g || d.giorni[0]?.data || ""); })
      .catch((e) => setErrore(e.message));
  }, [sposta, ricarica]);

  if (errore) return <p className="aa-errore">{errore}</p>;
  if (!slot) return <div className="aa-spinner" aria-label="Caricamento" />;
  if (!slot.giorni.length) return <p className="aa-nota">{slot.messaggio || "Nessuno slot libero per ora."}</p>;
  const g = slot.giorni.find((x) => x.data === giorno) || slot.giorni[0];
  return (
    <div className="sh-scelta">
      <p className="aa-nota">Ogni shooting dura {durata(slot.durata)}. Scegli il giorno e poi l'ora; accanto c'è chi viene a registrare.</p>
      <div className="sh-giorni">
        {slot.giorni.map((x) => (
          <button type="button" key={x.data} className={`aa-btn aa-btn-piccolo${x.data === g.data ? " aa-btn-pieno" : ""}`} onClick={() => setGiorno(x.data)}>
            {x.giorno}
          </button>
        ))}
      </div>
      <div className="cp-giorno">
        <p className="cp-giorno-nome">{g.giorno}</p>
        <div className="cp-orari">
          {g.orari.map((o) => (
            <button type="button" key={o.inizio} className={`aa-btn aa-btn-piccolo${scelto?.inizio === o.inizio ? " aa-btn-pieno" : ""}`}
              onClick={() => onScegli({ ...o, giorno: g.giorno, data: g.data, durata: slot.durata })}>
              {o.ora} · {o.con}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const testoSlot = (s) => `${s.giorno} alle ${s.ora} con ${s.con}`;

/* ---------------- lo shooting nella richiesta ---------------- */
export function ShootingRichiesta({ id, dati }) {
  const [p, setP] = useState(undefined);
  const [sposta, setSposta] = useState(false);
  const [nuovo, setNuovo] = useState(null);
  const [errore, setErrore] = useState("");
  const [occupato, setOccupato] = useState(false);

  const carica = () => chiamaShooting(`?richiesta=${encodeURIComponent(id)}`)
    .then((d) => setP(d.prenotazioni[0] || null)).catch((e) => { setP(null); setErrore(e.message); });
  useEffect(() => { carica(); }, [id]);

  if (p === undefined) return null;
  if (!p && !dati?.shooting) return null;
  const azione = async (cosa) => {
    setOccupato(true); setErrore("");
    try {
      if (cosa === "disdici") {
        if (!window.confirm("Disdici lo shooting? Manu e Gio ricevono la disdetta.")) return;
        await chiamaShooting(`/${p.id}/disdici`, {});
      } else {
        if (!window.confirm(`Sposti lo shooting a ${testoSlot(nuovo)}?`)) return;
        await chiamaShooting(`/${p.id}/sposta`, { inizio: nuovo.inizio });
        setSposta(false); setNuovo(null);
      }
      await carica();
    } catch (e) { setErrore(e.message); } finally { setOccupato(false); }
  };

  return (
    <section className="aa-card">
      <h2 className="aa-h2">Shooting</h2>
      {errore && <p className="aa-errore">{errore}</p>}
      {!p ? <p className="aa-nota">Lo shooting è stato disdetto.</p> : (
        <>
          <p className="cp-prenotato"><strong>{p.giorno}</strong>, dalle <strong>{p.ora}</strong> alle {p.ora_fine} · viene {p.con === "Manu e Gio" ? "Manu con Gio" : p.con}</p>
          {!p.mia ? <p className="aa-nota">Prenotato da {p.agente}.</p> : p.si_cambia ? (
            <div className="cp-azioni">
              {!sposta && <button className="aa-btn aa-btn-piccolo" disabled={occupato} onClick={() => setSposta(true)}>Sposta</button>}
              <button className="aa-link aa-link-rosso" disabled={occupato} onClick={() => azione("disdici")}>Disdici</button>
            </div>
          ) : <p className="aa-nota">Mancano meno di 24 ore: per spostare o disdire chiama Manu o Gio.</p>}
          {sposta && (
            <>
              <SceltaSlot scelto={nuovo} onScegli={setNuovo} sposta={p.id} />
              <div className="cp-azioni">
                <button className="aa-btn aa-btn-pieno aa-btn-piccolo" disabled={!nuovo || occupato} onClick={() => azione("sposta")}>
                  {nuovo ? `Sposta a ${testoSlot(nuovo)}` : "Scegli il nuovo orario"}
                </button>
                <button className="aa-link" onClick={() => { setSposta(false); setNuovo(null); }}>Lascia com'è</button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
