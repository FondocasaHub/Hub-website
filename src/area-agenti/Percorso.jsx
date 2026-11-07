// Percorso di inserimento da 90 giorni: compiti del giorno e allarme rosso per il collaboratore,
// pannello del team per il Team Manager (avvio percorso, approvazione delle fasi, chiusura).
import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import {
  TIPI_PERCORSO, giorniPercorso, faseDelGiorno, compitiDelGiorno, compitiArretrati,
  allarmiPercorso, prossimaVerifica, sommaDiario,
} from "./percorsi";

const dataIT = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("it-IT", { day: "numeric", month: "short", timeZone: "UTC" });

function Allarme({ allarmi }) {
  if (!allarmi.length) return null;
  const gravi = allarmi.some((a) => a.grave);
  return (
    <div className={`pc-allarme ${gravi ? "pc-allarme-rosso" : ""}`} role="alert">
      <strong>{gravi ? "⚠️ Sei sotto il ritmo del percorso" : "⚠️ Attenzione ai prossimi traguardi"}</strong>
      <ul>{allarmi.map((a, i) => <li key={i}>{a.testo}</li>)}</ul>
      <p>Chiedi a Chirone un piano per recuperare oggi. La decisione sulla permanenza la prende sempre il Team Manager.</p>
    </div>
  );
}

/* ---------- Il mio percorso (in cima a "La mia giornata") ---------- */
export function PercorsoOggi({ profilo, oggi, aggiornato }) {
  const [p, setP] = useState(undefined);
  const [diario, setDiario] = useState([]);
  const [errore, setErrore] = useState("");

  const carica = useCallback(async () => {
    const { data } = await supabase.from("percorsi_inserimento").select("*")
      .eq("user_id", profilo.id).eq("stato", "in corso").maybeSingle();
    setP(data || null);
    if (data) {
      const { data: righe } = await supabase.from("produttivita_giorno")
        .select("data, contatti, appuntamenti, incarichi, visite, proposte")
        .eq("user_id", profilo.id).gte("data", data.data_inizio);
      setDiario(righe || []);
    }
  }, [profilo.id]);
  useEffect(() => { carica(); }, [carica, aggiornato]);

  if (!p) return null;
  const { cal, lav } = giorniPercorso(p.data_inizio, oggi);
  if (cal < 1) return <section className="aa-card pc-percorso"><p>Il tuo percorso di inserimento inizia il {dataIT(p.data_inizio)}.</p></section>;
  const fase = faseDelGiorno(cal, lav);
  const compiti = compitiDelGiorno(p.tipo, p.data_inizio, oggi);
  const arretrati = compitiArretrati(p, oggi);
  const allarmi = allarmiPercorso(p, diario, oggi);
  const ver = prossimaVerifica(cal);
  const inAttesa = fase > p.fase_approvata;

  const spunta = async (chiave, fatto) => {
    const compitiNuovi = { ...(p.compiti || {}), [chiave]: { fatto, data: oggi } };
    setP({ ...p, compiti: compitiNuovi });
    const { error } = await supabase.from("percorsi_inserimento").update({ compiti: compitiNuovi }).eq("id", p.id);
    setErrore(error ? `Non salvato: ${error.message}` : "");
  };
  const Voce = ({ c, data }) => (
    <label className={`pc-compito ${p.compiti?.[c.chiave]?.fatto ? "fatto" : ""}`}>
      <input type="checkbox" checked={!!p.compiti?.[c.chiave]?.fatto} onChange={(e) => spunta(c.chiave, e.target.checked)} />
      <span><small>{c.blocco}{data ? ` · ${dataIT(data)}` : ""}</small>{c.testo}</span>
    </label>
  );

  return (
    <section className="aa-card pc-percorso">
      <div className="mg-testa">
        <div>
          <p className="aa-occhiello">Percorso di inserimento · {TIPI_PERCORSO[p.tipo]}</p>
          <h2 className="aa-h2">Giorno {Math.min(cal, 90)} di 90 · Fase {fase}</h2>
        </div>
        {ver && <span className="aa-stato aa-stato-in-lavorazione">Verifica del giorno {ver.giorno} tra {ver.mancano} giorni</span>}
      </div>
      <div className="mg-barra"><span style={{ width: `${Math.min(100, Math.round((cal / 90) * 100))}%` }} /></div>
      <Allarme allarmi={allarmi} />
      {inAttesa && <p className="aa-box-info">Hai finito la Fase {fase - 1}: il Team Manager deve approvare il passaggio alla Fase {fase}. Intanto prosegui con i compiti.</p>}
      {cal > 90 ? <p>Percorso concluso: fissa la verifica finale con il Team Manager.</p> : compiti.length === 0 ? (
        <p className="aa-nota">Oggi non ci sono compiti del percorso: riposati e riparti lunedì.</p>
      ) : (
        <div className="pc-compiti">{compiti.map((c) => <Voce key={c.chiave} c={c} />)}</div>
      )}
      {arretrati.length > 0 && (
        <details className="pc-arretrati">
          <summary>{arretrati.length} compiti dei giorni scorsi da completare</summary>
          <div className="pc-compiti">{arretrati.map((c) => <Voce key={c.chiave} c={c} data={c.data} />)}</div>
        </details>
      )}
      <p className="aa-nota">I numeri (contatti, appuntamenti, incarichi, visite, proposte) si prendono dal diario qui sotto. Il percorso completo è in Chirone: chiedigli "cosa devo fare oggi?".</p>
      {errore && <p className="aa-errore">{errore}</p>}
    </section>
  );
}

/* ---------- Percorsi del team (Team Manager e admin) ---------- */
export function PercorsiTeam({ profilo, oggi, team }) {
  const [lista, setLista] = useState(null);
  const [diari, setDiari] = useState({});
  const [nuovo, setNuovo] = useState(null);
  const [msg, setMsg] = useState("");
  const nomi = Object.fromEntries((team || []).map((t) => [t.user_id, t.nome || "—"]));

  const carica = useCallback(async () => {
    const { data } = await supabase.from("percorsi_inserimento").select("*").eq("stato", "in corso").order("data_inizio");
    const righe = data || [];
    setLista(righe);
    if (righe.length) {
      const dal = righe.map((r) => r.data_inizio).sort()[0];
      const { data: d } = await supabase.from("produttivita_giorno")
        .select("user_id, data, contatti, appuntamenti, incarichi, visite, proposte")
        .in("user_id", righe.map((r) => r.user_id)).gte("data", dal);
      const per = {};
      for (const r of righe) per[r.user_id] = (d || []).filter((x) => x.user_id === r.user_id && x.data >= r.data_inizio);
      setDiari(per);
    }
  }, []);
  useEffect(() => { carica(); }, [carica]);

  const aggiorna = async (id, campi, conferma) => {
    if (conferma && !window.confirm(conferma)) return;
    const { error } = await supabase.from("percorsi_inserimento").update(campi).eq("id", id);
    setMsg(error ? `Errore: ${error.message}` : "Salvato ✓");
    carica();
  };
  const avvia = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("percorsi_inserimento").insert({ user_id: nuovo.user_id, tipo: nuovo.tipo, data_inizio: nuovo.data_inizio });
    if (error) { setMsg(`Errore: ${error.message}`); return; }
    setNuovo(null); setMsg("Percorso avviato ✓"); carica();
  };

  if (lista === null) return null;
  const senzaPercorso = (team || []).filter((t) => !lista.some((p) => p.user_id === t.user_id));

  return (
    <section className="aa-card">
      <div className="mg-testa">
        <h2 className="aa-h2">Percorsi di inserimento · {profilo.ruolo === "admin" ? "tutti i team" : "il mio team"}</h2>
        {!nuovo && <button className="aa-btn aa-btn-piccolo" onClick={() => setNuovo({ user_id: senzaPercorso[0]?.user_id || "", tipo: "agente", data_inizio: oggi })}>+ Avvia percorso</button>}
      </div>
      {nuovo && (
        <form className="mg-form" onSubmit={avvia}>
          <div className="aa-griglia-campi">
            <label className="aa-campo"><span>Collaboratore</span>
              <select required value={nuovo.user_id} onChange={(e) => setNuovo({ ...nuovo, user_id: e.target.value })}>
                <option value="">Scegli…</option>
                {senzaPercorso.map((t) => <option key={t.user_id} value={t.user_id}>{t.nome || "—"}{t.team ? ` · ${t.team}` : ""}</option>)}
              </select>
            </label>
            <label className="aa-campo"><span>Percorso</span>
              <select value={nuovo.tipo} onChange={(e) => setNuovo({ ...nuovo, tipo: e.target.value })}>
                {Object.entries(TIPI_PERCORSO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="aa-campo"><span>Data di inizio</span>
              <input type="date" required value={nuovo.data_inizio} onChange={(e) => setNuovo({ ...nuovo, data_inizio: e.target.value })} />
            </label>
          </div>
          <button className="aa-btn aa-btn-pieno" type="submit">Avvia</button>{" "}
          <button className="aa-btn" type="button" onClick={() => setNuovo(null)}>Annulla</button>
          <p className="aa-nota">Il collaboratore deve avere l'utenza dell'Area Agenti attiva e compilare ogni giorno "La mia giornata".</p>
        </form>
      )}
      {lista.length === 0 ? <p className="aa-nota">Nessun percorso in corso.</p> : (
        <div className="aa-scorri">
          <table className="aa-tabella">
            <thead><tr><th>Collaboratore</th><th>Percorso</th><th>Giorno</th><th>Compiti</th><th>Numeri dall'inizio</th><th>Allarmi</th><th></th></tr></thead>
            <tbody>
              {lista.map((p) => {
                const { cal, lav } = giorniPercorso(p.data_inizio, oggi);
                const fase = faseDelGiorno(cal, lav);
                const all = allarmiPercorso(p, diari[p.user_id] || [], oggi);
                const s = sommaDiario(diari[p.user_id]);
                let assegnati = 0, fatti = 0;
                for (let k = 0; k <= 90 && cal > 0; k++) {
                  const d = new Date(`${p.data_inizio}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + k);
                  const iso = d.toISOString().slice(0, 10);
                  if (iso > oggi) break;
                  for (const c of compitiDelGiorno(p.tipo, p.data_inizio, iso)) { assegnati++; if (p.compiti?.[c.chiave]?.fatto) fatti++; }
                }
                return (
                  <tr key={p.id} className={all.some((a) => a.grave) ? "pc-riga-rossa" : ""}>
                    <td><strong>{nomi[p.user_id] || "—"}</strong></td>
                    <td>{TIPI_PERCORSO[p.tipo]}<br /><small className="aa-nota">dal {dataIT(p.data_inizio)}</small></td>
                    <td>{Math.max(0, Math.min(cal, 90))}/90<br /><small className="aa-nota">fase {fase} · approvata {p.fase_approvata}</small></td>
                    <td>{fatti}/{assegnati}</td>
                    <td><small>{s.contatti} contatti · {s.appuntamenti} {p.tipo === "credito" ? "consulenze" : "appuntamenti"} · {s.incarichi} {p.tipo === "credito" ? "pratiche" : "incarichi"} · {s.visite} visite · {s.proposte} proposte</small></td>
                    <td>{all.length ? <ul className="pc-lista-allarmi">{all.map((a, i) => <li key={i} className={a.grave ? "grave" : ""}>{a.testo}</li>)}</ul> : <span className="aa-stato aa-stato-completata">in linea</span>}</td>
                    <td className="pc-azioni">
                      {p.fase_approvata < 3 && <button className="aa-btn aa-btn-piccolo" onClick={() => aggiorna(p.id, { fase_approvata: p.fase_approvata + 1 }, `Approvi il passaggio alla Fase ${p.fase_approvata + 1}?`)}>Approva fase {p.fase_approvata + 1}</button>}
                      <button className="aa-btn aa-btn-piccolo" onClick={() => aggiorna(p.id, { stato: "superato" }, "Segni il percorso come superato?")}>Superato</button>
                      <button className="aa-btn aa-btn-piccolo" onClick={() => aggiorna(p.id, { stato: "chiuso" }, "Chiudi il percorso (collaboratore uscito)?")}>Chiudi</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {msg && <p className="aa-nota">{msg}</p>}
    </section>
  );
}
