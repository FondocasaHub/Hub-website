import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import ReportImmobile from "../immobile/ReportImmobile.jsx";
import {
  STATI_IMMOBILE, FASCE, TIPI_DOCUMENTO, STATI_ACQUIRENTE, ESITI_MUTUO, OBIETTIVI, CAMPI_KPI, CHIAVI_KPI,
  oggiISO, dataIT, permessi, avanzamento, avvisiImmobile, sonoBuyer, haRuolo,
} from "./immobili";

const MAX_MB = 50;
const nomeSicuro = (n) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]/g, "_");
const classeStato = (s) => `aa-stato im-stato-${s.replace(" ", "-")}`;

function useColleghi() {
  const [colleghi, setColleghi] = useState([]);
  useEffect(() => { supabase.rpc("colleghi_immobili").then(({ data }) => setColleghi(data || [])); }, []);
  return colleghi;
}
const nomeDi = (colleghi, id) => colleghi.find((c) => c.id === id)?.nome || "—";

function Avanzamento({ valore }) {
  return (
    <div>
      <div className="aa-barra-avanz"><span style={{ width: `${valore}%` }} /></div>
      <small className="aa-nota">{valore}%</small>
    </div>
  );
}

/* ============ Elenco e monitoraggio ============ */
export function ElencoImmobili({ profilo, vai }) {
  const [dati, setDati] = useState(null);
  const [errore, setErrore] = useState("");
  const [stato, setStato] = useState("attivo");
  const [team, setTeam] = useState("");
  const [soloAvvisi, setSoloAvvisi] = useState(false);
  const colleghi = useColleghi();

  useEffect(() => {
    (async () => {
      const [imm, cat, att, kpi, doc, pub] = await Promise.all([
        supabase.from("immobili").select("*").order("created_at", { ascending: false }),
        supabase.from("attivita_catalogo").select("codice"),
        supabase.from("attivita_immobile").select("immobile_id, codice_attivita, completata"),
        supabase.from("kpi_immobile").select("*"),
        supabase.from("documenti_immobile").select("immobile_id, tipo"),
        supabase.from("pubblicazioni").select("immobile_id, data, fascia"),
      ]);
      if (imm.error) { setErrore(imm.error.message); setDati([]); return; }
      const di = (r, id) => (r.data || []).filter((x) => x.immobile_id === id);
      setDati((imm.data || []).map((i) => {
        const attivita = di(att, i.id);
        return {
          ...i,
          avanzamento: avanzamento(cat.data || [], attivita),
          avvisi: avvisiImmobile({ immobile: i, attivita, kpi: di(kpi, i.id), documenti: di(doc, i.id), pubblicazioni: di(pub, i.id) }),
        };
      }));
    })();
  }, []);

  const gestore = profilo.ruolo === "admin" || profilo.ruolo === "manager";
  const visibili = (dati || []).filter((i) => (!stato || i.stato === stato) && (!team || i.team === team) && (!soloAvvisi || i.avvisi.length));
  const conAvvisi = (dati || []).filter((i) => i.avvisi.some((a) => a.grave)).length;

  return (
    <div className="im-area">
      <div className="aa-intestazione">
        <p className="aa-occhiello">Procedura Buyer Agent</p>
        <h1 className="aa-titolo">Immobili</h1>
        <p className="aa-sottotitolo">Ogni incarico ha la sua scheda: nasce con il Modulo Ingaggio Marketing e la prosegue la Buyer Agent del team.</p>
      </div>

      {gestore && dati && (
        <div className="aa-kpi">
          <div className="aa-kpi-box"><span>Immobili attivi</span><strong>{dati.filter((i) => i.stato === "attivo").length}</strong></div>
          <div className="aa-kpi-box"><span>In trattativa</span><strong>{dati.filter((i) => i.stato === "in trattativa").length}</strong></div>
          <div className="aa-kpi-box aa-kpi-oro"><span>Con avvisi gravi</span><strong>{conAvvisi}</strong></div>
        </div>
      )}

      <div className="aa-schede">
        {["attivo", "in trattativa", "venduto", "ritirato", ""].map((s) => (
          <button key={s} className={stato === s ? "attivo" : ""} onClick={() => setStato(s)}>
            {s ? s[0].toUpperCase() + s.slice(1) : "Tutti"}
            {dati && <span className="aa-conta">{dati.filter((i) => !s || i.stato === s).length}</span>}
          </button>
        ))}
      </div>

      {gestore && (
        <div className="im-filtri">
          {profilo.ruolo === "admin" && (
            <label>Team
              <select value={team} onChange={(e) => setTeam(e.target.value)}>
                <option value="">Tutti</option><option>Team Nigido</option><option>Team Esposito</option>
              </select>
            </label>
          )}
          <label className="im-spunta"><input type="checkbox" checked={soloAvvisi} onChange={(e) => setSoloAvvisi(e.target.checked)} /> Solo con avvisi</label>
        </div>
      )}

      {errore && <p className="aa-errore">{errore}</p>}
      <section className="aa-card">
        {dati === null ? <p className="aa-nota">Caricamento…</p> : visibili.length === 0 ? (
          <p className="aa-nota">Nessun immobile in questa vista. Le schede nascono dal <button className="aa-link" onClick={() => vai("richieste/nuova")}>Modulo Ingaggio Marketing</button>.</p>
        ) : (
          <div className="aa-scorri">
            <table className="aa-tabella aa-tabella-click">
              <thead><tr><th>Immobile</th><th>Team</th><th>Listing / Buyer</th><th>Open House</th><th>Stato</th><th>Avanzamento</th><th>Avvisi</th></tr></thead>
              <tbody>
                {visibili.map((i) => (
                  <tr key={i.id} onClick={() => vai(`immobili/${i.id}`)}>
                    <td><strong>{i.riferimento_vendilo}</strong><br /><small className="aa-nota">{i.indirizzo}</small></td>
                    <td>{i.team}</td>
                    <td>{nomeDi(colleghi, i.listing_id)}<br /><small className="aa-nota">{nomeDi(colleghi, i.buyer_id)}</small></td>
                    <td>{dataIT(i.data_open_house)}</td>
                    <td><span className={classeStato(i.stato)}>{i.stato}</span></td>
                    <td><Avanzamento valore={i.avanzamento} /></td>
                    <td className="im-avvisi-cella">
                      {i.avvisi.length === 0 ? <span className="aa-nota">Nessuno</span> : (
                        <><span className={`im-avviso-conta ${i.avvisi[0].grave ? "grave" : ""}`}>{i.avvisi.length}</span> <small>{i.avvisi[0].testo}</small></>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* ============ Scheda ============ */
export function SchedaImmobile({ id, profilo, vai }) {
  const [d, setD] = useState(undefined);
  const [scheda, setScheda] = useState("");
  const colleghi = useColleghi();

  const carica = useCallback(async () => {
    const riga = await supabase.from("immobili").select("*").eq("id", id).maybeSingle();
    if (!riga.data) { setD(null); return; }
    const per = (t, ordine) => supabase.from(t).select("*").eq("immobile_id", id).order(ordine, { ascending: false });
    const [cat, att, kpi, doc, pub, acq] = await Promise.all([
      supabase.from("attivita_catalogo").select("*").order("fase").order("ordine"),
      supabase.from("attivita_immobile").select("*").eq("immobile_id", id),
      per("kpi_immobile", "data"), per("documenti_immobile", "data"), per("pubblicazioni", "data"), per("acquirenti_immobile", "created_at"),
    ]);
    setD({ immobile: riga.data, catalogo: cat.data || [], attivita: att.data || [], kpi: kpi.data || [], documenti: doc.data || [], pubblicazioni: pub.data || [], acquirenti: acq.data || [] });
  }, [id]);
  useEffect(() => { carica(); }, [carica]);

  if (d === undefined) return <p className="aa-nota">Caricamento…</p>;
  if (d === null) {
    return (
      <div className="aa-card">
        <p>Immobile non trovato, oppure non è assegnato al tuo ruolo.</p>
        <button className="aa-btn" onClick={() => vai("immobili")}>Torna agli immobili</button>
      </div>
    );
  }

  const i = d.immobile;
  const p = permessi(profilo, i);
  const schede = p.lavora
    ? [["checklist", "Check-list"], ["pubblicazioni", "Pubblicazioni"], ["numeri", "Numeri"], ["documenti", "Documenti"], ["acquirenti", "Acquirenti"], ["dati", "Dati e report"], ["storico", "Storico"]]
    : [["acquirenti", "Acquirenti da finanziare"], ["checklist", "Check-list"], ["documenti", "Documenti"]];
  const attiva = scheda || schede[0][0];
  const avvisi = avvisiImmobile(d);

  return (
    <div className="im-area">
      <button className="aa-link" onClick={() => vai("immobili")}>← Tutti gli immobili</button>
      <div className="aa-intestazione aa-intestazione-azione">
        <div>
          <p className="aa-occhiello">Rif. Vendilo {i.riferimento_vendilo} · {i.team}</p>
          <h1 className="aa-titolo">{i.indirizzo}</h1>
          <p className="aa-sottotitolo">
            Listing {nomeDi(colleghi, i.listing_id)} · Buyer {nomeDi(colleghi, i.buyer_id)} · Credito {nomeDi(colleghi, i.consulente_credito_id)}
          </p>
        </div>
        <div className="im-testa-destra">
          <span className={`${classeStato(i.stato)} aa-stato-grande`}>{i.stato}</span>
          <Avanzamento valore={avanzamento(d.catalogo, d.attivita)} />
        </div>
      </div>

      {avvisi.length > 0 && (
        <section className="im-avvisi" aria-label="Avvisi">
          <ul>
            {avvisi.map((a) => <li key={a.testo} className={a.grave ? "grave" : ""}><strong>{a.grave ? "Urgente" : "Da seguire"}</strong> {a.testo}</li>)}
          </ul>
        </section>
      )}

      <div className="aa-schede" role="tablist">
        {schede.map(([k, et]) => <button key={k} role="tab" aria-selected={attiva === k} className={attiva === k ? "attivo" : ""} onClick={() => setScheda(k)}>{et}</button>)}
      </div>

      {attiva === "checklist" && <Checklist d={d} p={p} colleghi={colleghi} ricarica={carica} />}
      {attiva === "pubblicazioni" && <Pubblicazioni d={d} p={p} ricarica={carica} />}
      {attiva === "numeri" && <Numeri d={d} p={p} ricarica={carica} />}
      {attiva === "documenti" && <Documenti d={d} p={p} colleghi={colleghi} ricarica={carica} />}
      {attiva === "acquirenti" && <Acquirenti d={d} p={p} ricarica={carica} />}
      {attiva === "dati" && <DatiReport d={d} p={p} colleghi={colleghi} vai={vai} ricarica={carica} />}
      {attiva === "storico" && <Storico id={id} />}
    </div>
  );
}

/* ---------------- Check-list ---------------- */
function Checklist({ d, p, colleghi, ricarica }) {
  const fasi = useMemo(() => {
    const m = new Map();
    d.catalogo.forEach((c) => { if (!m.has(c.fase)) m.set(c.fase, { ...c, voci: [] }); m.get(c.fase).voci.push(c); });
    return [...m.values()];
  }, [d.catalogo]);
  return fasi.map((f) => (
    <section key={f.fase} className="aa-card">
      <h2 className="aa-h2"><span className="aa-sezione-n">{f.fase}</span>{f.fase_titolo}</h2>
      {f.quando && <p className="aa-nota">{f.quando}</p>}
      <ul className="aa-step-lista">
        {f.voci.map((c) => (
          <RigaAttivita key={c.codice} voce={c} riga={d.attivita.find((a) => a.codice_attivita === c.codice)}
            immobileId={d.immobile.id} modificabile={p.spunta(c.responsabile)} colleghi={colleghi} ricarica={ricarica} />
        ))}
      </ul>
    </section>
  ));
}

const ETICHETTA_RESP = { buyer: "Buyer Agent", listing: "Listing Agent", manager: "Team Manager" };

function RigaAttivita({ voce, riga, immobileId, modificabile, colleghi, ricarica }) {
  const [esito, setEsito] = useState(riga?.esito || "");
  const [data, setData] = useState(riga?.data || "");
  const [errore, setErrore] = useState("");
  useEffect(() => { setEsito(riga?.esito || ""); setData(riga?.data || ""); }, [riga]);

  const salva = async (campi) => {
    const { error } = await supabase.from("attivita_immobile").upsert(
      { immobile_id: immobileId, codice_attivita: voce.codice, completata: !!riga?.completata, data: data || null, esito: esito || null, ...campi },
      { onConflict: "immobile_id,codice_attivita" },
    );
    setErrore(error ? error.message : "");
    if (!error) ricarica();
  };

  return (
    <li className={riga?.completata ? "fatto" : ""}>
      <label className="aa-step-check">
        <input type="checkbox" checked={!!riga?.completata} disabled={!modificabile}
          aria-label={voce.titolo} onChange={(e) => salva({ completata: e.target.checked, data: e.target.checked ? (data || oggiISO()) : null })} />
      </label>
      <div className="aa-step-testo">
        <strong>{voce.titolo}</strong>
        <p>{ETICHETTA_RESP[voce.responsabile]}{riga?.autore_id && riga.completata ? ` · Registrata da ${nomeDi(colleghi, riga.autore_id)}` : ""}</p>
        {errore && <p className="aa-testo-rosso">{errore}</p>}
      </div>
      <div className="im-step-campi">
        <label>Data<input type="date" value={data} disabled={!modificabile} onChange={(e) => setData(e.target.value)} onBlur={() => { if (data !== (riga?.data || "")) salva({}); }} /></label>
        <label>Esito / note<input value={esito} disabled={!modificabile} onChange={(e) => setEsito(e.target.value)} onBlur={() => { if (esito !== (riga?.esito || "")) salva({}); }} /></label>
      </div>
    </li>
  );
}

/* ---------------- Pubblicazioni ---------------- */
function Pubblicazioni({ d, p, ricarica }) {
  const [f, setF] = useState({ data: oggiISO(), fascia: "mattina", canale: "" });
  const [errore, setErrore] = useState("");
  const perGiorno = useMemo(() => {
    const m = {};
    d.pubblicazioni.forEach((r) => { (m[r.data] = m[r.data] || []).push(r); });
    return Object.entries(m).sort(([a], [b]) => b.localeCompare(a));
  }, [d.pubblicazioni]);
  const oggi = (perGiorno.find(([g]) => g === oggiISO()) || [null, []])[1].length;

  const aggiungi = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("pubblicazioni").upsert({ immobile_id: d.immobile.id, ...f }, { onConflict: "immobile_id,data,fascia" });
    setErrore(error ? error.message : "");
    if (!error) { setF({ ...f, canale: "" }); ricarica(); }
  };
  const elimina = async (r) => {
    const { error } = await supabase.from("pubblicazioni").delete().eq("id", r.id);
    if (error) setErrore(error.message); else ricarica();
  };

  return (
    <section className="aa-card">
      <div className="aa-card-testa"><h2 className="aa-h2">Pubblicazione quotidiana</h2><span className="aa-ir-tag">Oggi {oggi} su {OBIETTIVI.pubblicazioniGiorno}</span></div>
      <p className="aa-nota">Mattina, pausa pranzo e sera: gruppi di zona, stato WhatsApp, gruppi dedicati alle case.</p>
      {p.pubblicazioni && (
        <form className="aa-form aa-form-riga" onSubmit={aggiungi}>
          <label>Giorno<input type="date" value={f.data} max={oggiISO()} onChange={(e) => setF({ ...f, data: e.target.value })} required /></label>
          <label>Fascia
            <select value={f.fascia} onChange={(e) => setF({ ...f, fascia: e.target.value })}>{FASCE.map((x) => <option key={x}>{x}</option>)}</select>
          </label>
          <label>Canale e gruppi<input value={f.canale} onChange={(e) => setF({ ...f, canale: e.target.value })} required placeholder="es. Sei del Vomero se, stato WhatsApp" /></label>
          <button className="aa-btn aa-btn-pieno">Registra</button>
        </form>
      )}
      {errore && <p className="aa-errore">{errore}</p>}
      {perGiorno.length === 0 ? <p className="aa-nota">Nessuna pubblicazione registrata.</p> : (
        <div className="aa-scorri">
          <table className="aa-tabella">
            <thead><tr><th>Giorno</th><th>Uscite</th>{FASCE.map((x) => <th key={x}>{x}</th>)}</tr></thead>
            <tbody>
              {perGiorno.map(([g, righe]) => (
                <tr key={g}>
                  <td>{dataIT(g)}</td>
                  <td>{righe.length} / {OBIETTIVI.pubblicazioniGiorno}</td>
                  {FASCE.map((x) => {
                    const r = righe.find((y) => y.fascia === x);
                    return <td key={x}>{r ? <>{r.canale}{p.pubblicazioni && <> <button className="aa-link aa-link-rosso" onClick={() => elimina(r)} aria-label={`Elimina ${x} del ${dataIT(g)}`}>togli</button></>}</> : <span className="aa-nota">—</span>}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ---------------- Numeri ---------------- */
function Numeri({ d, p, ricarica }) {
  const [data, setData] = useState(oggiISO());
  const [valori, setValori] = useState({});
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    const r = d.kpi.find((k) => k.data === data) || {};
    setValori(Object.fromEntries(CHIAVI_KPI.map((k) => [k, r[k] ?? 0])));
  }, [data, d.kpi]);

  const tot = (k) => d.kpi.reduce((t, r) => t + (r[k] || 0), 0);
  const obiettivi = [
    ["Presenze Open House", tot("presenze_open_house"), OBIETTIVI.presenzeOpenHouse],
    ["Volantini", tot("volantini"), OBIETTIVI.volantini],
    ["Chiamate ultimi 7 giorni", d.kpi.filter((k) => k.data >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)).reduce((t, r) => t + r.civici_contattati, 0), OBIETTIVI.chiamateSettimana],
  ];

  const salva = async (e) => {
    e.preventDefault();
    const riga = Object.fromEntries(CHIAVI_KPI.map((k) => [k, Math.max(0, parseInt(valori[k], 10) || 0)]));
    const { error } = await supabase.from("kpi_immobile").upsert({ immobile_id: d.immobile.id, data, ...riga }, { onConflict: "immobile_id,data" });
    setMsg(error ? { errore: error.message } : { ok: `Numeri del ${dataIT(data)} salvati` });
    if (!error) ricarica();
  };

  return (
    <>
      <div className="aa-kpi">
        {obiettivi.map(([et, v, ob]) => (
          <div key={et} className="aa-kpi-box"><span>{et}</span><strong>{v.toLocaleString("it-IT")}</strong><small>Obiettivo minimo {ob}</small></div>
        ))}
      </div>
      <section className="aa-card">
        <h2 className="aa-h2">Numeri del giorno</h2>
        <p className="aa-nota">Inserisci solo i numeri di quella giornata: totali e andamento si calcolano da soli. Vendilo resta il CRM dei contatti.</p>
        <form onSubmit={salva}>
          <label className="aa-campo im-campo-data"><span>Giorno</span><input type="date" value={data} max={oggiISO()} onChange={(e) => setData(e.target.value)} /></label>
          <fieldset className="aa-fieldset" disabled={!p.numeri}>
            {CAMPI_KPI.map(([gruppo, campi]) => (
              <div key={gruppo}>
                <h3 className="aa-vl-h3">{gruppo}</h3>
                <div className="aa-griglia-campi im-griglia-kpi">
                  {campi.map(([k, et]) => (
                    <label key={k} className="aa-campo"><span>{et}</span><input type="number" min="0" inputMode="numeric" value={valori[k] ?? 0} onChange={(e) => setValori({ ...valori, [k]: e.target.value })} /></label>
                  ))}
                </div>
              </div>
            ))}
            {p.numeri && <button className="aa-btn aa-btn-pieno im-salva">Salva i numeri</button>}
          </fieldset>
        </form>
        {msg?.errore && <p className="aa-errore">{msg.errore}</p>}
        {msg?.ok && <p className="aa-info">{msg.ok}</p>}
      </section>
    </>
  );
}

/* ---------------- Documenti ---------------- */
function Documenti({ d, p, colleghi, ricarica }) {
  const [tipo, setTipo] = useState("relazione tecnica");
  const [stato, setStato] = useState({ invio: false, errore: "" });

  const apri = async (doc) => {
    const w = window.open("", "_blank");
    const { data, error } = await supabase.storage.from(doc.bucket).createSignedUrl(doc.file, 300);
    if (error || !data) { if (w) w.close(); return setStato({ invio: false, errore: "Impossibile aprire il documento." }); }
    if (w) w.location.href = data.signedUrl; else window.location.href = data.signedUrl;
  };

  const carica = async (e) => {
    const scelti = Array.from(e.target.files || []);
    e.target.value = "";
    if (!scelti.length) return;
    const troppo = scelti.find((x) => x.size > MAX_MB * 1024 * 1024);
    if (troppo) return setStato({ invio: false, errore: `${troppo.name} supera ${MAX_MB} MB.` });
    setStato({ invio: true, errore: "" });
    for (const x of scelti) {
      const percorso = `${d.immobile.id}/${crypto.randomUUID()}-${nomeSicuro(x.name)}`;
      const su = await supabase.storage.from("immobili").upload(percorso, x, { contentType: x.type || undefined });
      if (su.error) return setStato({ invio: false, errore: `${x.name}: ${su.error.message}` });
      const { error } = await supabase.from("documenti_immobile").insert({ immobile_id: d.immobile.id, tipo, bucket: "immobili", file: percorso, nome: x.name, dimensione: x.size });
      if (error) return setStato({ invio: false, errore: `${x.name}: ${error.message}` });
    }
    setStato({ invio: false, errore: "" });
    ricarica();
  };

  const elimina = async (doc) => {
    if (!window.confirm(`Eliminare ${doc.nome}?`)) return;
    if (doc.bucket === "immobili") await supabase.storage.from("immobili").remove([doc.file]);
    const { error } = await supabase.from("documenti_immobile").delete().eq("id", doc.id);
    if (error) setStato({ invio: false, errore: error.message }); else ricarica();
  };

  const presente = (t) => d.documenti.some((x) => x.tipo === t);
  return (
    <section className="aa-card">
      <h2 className="aa-h2">Documentazione</h2>
      <p className="aa-nota">A cura del Listing Agent, prima del lancio. La relazione tecnica urbanistica e catastale racconta la storia dell'immobile, pregi e difetti: la redige il Listing se la situazione è semplice, altrimenti un geometra.</p>
      <ul className="im-prerequisiti">
        {["planimetria", "relazione tecnica"].map((t) => <li key={t} className={presente(t) ? "ok" : "manca"}>{presente(t) ? "Presente" : "Manca"} · {t}</li>)}
      </ul>
      {p.documenti && (
        <div className="aa-form aa-form-riga">
          <label>Tipo
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>{TIPI_DOCUMENTO.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label className="aa-btn aa-btn-pieno aa-upload">{stato.invio ? "Caricamento…" : "Carica file"}<input type="file" multiple onChange={carica} disabled={stato.invio} /></label>
        </div>
      )}
      {stato.errore && <p className="aa-errore">{stato.errore}</p>}
      {d.documenti.length === 0 ? <p className="aa-nota">Nessun documento.</p> : (
        <div className="aa-scorri">
          <table className="aa-tabella">
            <thead><tr><th>Documento</th><th>Tipo</th><th>Caricato da</th><th>Data</th><th></th></tr></thead>
            <tbody>
              {d.documenti.map((x) => (
                <tr key={x.id}>
                  <td><button className="aa-link" onClick={() => apri(x)}>{x.nome}</button></td>
                  <td>{x.tipo}</td>
                  <td>{nomeDi(colleghi, x.caricato_da)}</td>
                  <td>{dataIT(x.data)}</td>
                  <td>{p.documenti && <button className="aa-link aa-link-rosso" onClick={() => elimina(x)}>Elimina</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ---------------- Acquirenti ---------------- */
function Acquirenti({ d, p, ricarica }) {
  const [nuovo, setNuovo] = useState({ nome: "", stato: "da finanziare", note: "" });
  const [errore, setErrore] = useState("");

  const aggiungi = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("acquirenti_immobile").insert({ immobile_id: d.immobile.id, ...nuovo, note: nuovo.note || null });
    setErrore(error ? error.message : "");
    if (!error) { setNuovo({ nome: "", stato: "da finanziare", note: "" }); ricarica(); }
  };
  const aggiorna = async (a, campi) => {
    const { error } = await supabase.from("acquirenti_immobile").update(campi).eq("id", a.id);
    setErrore(error ? error.message : "");
    ricarica();
  };
  const elimina = async (a) => {
    if (!window.confirm(`Togliere ${a.nome}?`)) return;
    const { error } = await supabase.from("acquirenti_immobile").delete().eq("id", a.id);
    setErrore(error ? error.message : "");
    ricarica();
  };

  return (
    <section className="aa-card">
      <h2 className="aa-h2">Prequalifica acquirenti</h2>
      <p className="aa-nota">Solo nome e classificazione: telefoni, email e dati personali restano su Vendilo. Nulla di questa sezione arriva alla proprietà.</p>
      {p.acquirenti && (
        <form className="aa-form aa-form-riga" onSubmit={aggiungi}>
          <label>Nome<input value={nuovo.nome} onChange={(e) => setNuovo({ ...nuovo, nome: e.target.value })} required /></label>
          <label>Classificazione
            <select value={nuovo.stato} onChange={(e) => setNuovo({ ...nuovo, stato: e.target.value })}>{STATI_ACQUIRENTE.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <label>Note<input value={nuovo.note} onChange={(e) => setNuovo({ ...nuovo, note: e.target.value })} /></label>
          <button className="aa-btn aa-btn-pieno">Aggiungi</button>
        </form>
      )}
      {errore && <p className="aa-errore">{errore}</p>}
      {d.acquirenti.length === 0 ? <p className="aa-nota">Nessun acquirente registrato.</p> : (
        <div className="aa-scorri">
          <table className="aa-tabella aa-tabella-edit">
            <thead><tr><th>Nome</th><th>Classificazione</th><th>Esito mutuo</th><th>Note</th><th></th></tr></thead>
            <tbody>
              {d.acquirenti.map((a) => (
                <tr key={a.id}>
                  <td>{a.nome}</td>
                  <td>
                    <select value={a.stato} disabled={!p.acquirenti} onChange={(e) => aggiorna(a, { stato: e.target.value })} aria-label={`Classificazione di ${a.nome}`}>
                      {STATI_ACQUIRENTE.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={a.esito_mutuo || ""} disabled={!p.esitoMutuo} onChange={(e) => aggiorna(a, { esito_mutuo: e.target.value || null })} aria-label={`Esito mutuo di ${a.nome}`}>
                      <option value="">—</option>
                      {ESITI_MUTUO.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td><input defaultValue={a.note || ""} disabled={!(p.acquirenti || p.esitoMutuo)} aria-label={`Note su ${a.nome}`} onBlur={(e) => { if (e.target.value !== (a.note || "")) aggiorna(a, { note: e.target.value || null }); }} /></td>
                  <td>{p.acquirenti && <button className="aa-link aa-link-rosso" onClick={() => elimina(a)}>Togli</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ---------------- Dati, assegnazioni e report ---------------- */
function DatiReport({ d, p, colleghi, vai, ricarica }) {
  const i = d.immobile;
  const [f, setF] = useState(i);
  const [msg, setMsg] = useState(null);
  const [link, setLink] = useState("");
  useEffect(() => { setF(i); }, [i]);
  useEffect(() => {
    if (!p.minisito) return;
    supabase.rpc("link_minisito", { iid: i.id }).then(({ data }) => setLink(data ? `${window.location.origin}/immobile/${data}` : ""));
  }, [i.id, p.minisito]);

  const dati = p.gestore || p.listing;
  const date = p.gestore || p.buyer;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const conRuolo = (fn) => colleghi.filter((c) => fn(c) && (c.team === i.team || !c.team || c.ruolo === "credito" || haRuolo(c, "credito")));
  const buyers = conRuolo(sonoBuyer);
  const crediti = colleghi.filter((c) => c.ruolo === "credito" || haRuolo(c, "credito"));

  const salva = async (e) => {
    e.preventDefault();
    const campi = {};
    if (dati) ["riferimento_vendilo", "indirizzo", "zona", "contratto", "tipologia", "prezzo", "mq", "locali", "classe_en", "stato"].forEach((k) => { campi[k] = f[k] === "" ? null : f[k]; });
    if (date) ["data_sopralluogo_marketing", "data_open_house"].forEach((k) => { campi[k] = f[k] || null; });
    if (p.gestore) ["buyer_id", "consulente_credito_id"].forEach((k) => { campi[k] = f[k] || null; });
    const { error } = await supabase.from("immobili").update(campi).eq("id", i.id);
    setMsg(error ? { errore: error.message } : { ok: "Dati salvati" });
    if (!error) ricarica();
  };
  const copia = async () => { await navigator.clipboard.writeText(link); setMsg({ ok: "Link copiato" }); };
  const rigenera = async () => {
    if (!window.confirm("Il link attuale smetterà di funzionare. Sostituirlo?")) return;
    const { data, error } = await supabase.rpc("rigenera_minisito", { iid: i.id });
    if (error) return setMsg({ errore: error.message });
    setLink(`${window.location.origin}/immobile/${data}`);
    setMsg({ ok: "Nuovo link creato: invialo alla proprietà" });
  };
  const notifica = async () => {
    const { error } = await supabase.functions.invoke("notifica-immobile", { body: { id: i.id } });
    setMsg(error ? { errore: "L'email non è partita: avvisa l'Admin." } : { ok: "Email inviata a Buyer Agent e Team Manager" });
    if (!error) ricarica();
  };

  return (
    <>
      <section className="aa-card">
        <h2 className="aa-h2">Report per la proprietà</h2>
        <p className="aa-nota">Il Listing Agent invia ogni settimana il report con i numeri raccolti dalla Buyer Agent. Il minisito si aggiorna da solo e non mostra acquirenti, note o collaboratori.</p>
        <div className="im-azioni-riga">
          <button className="aa-btn aa-btn-pieno" onClick={() => vai(`immobili/${i.id}/report`)}>Apri il report / PDF</button>
          {p.minisito && link && <button className="aa-btn" onClick={copia}>Copia il link del minisito</button>}
          {p.minisito && link && <a className="aa-btn" href={link} target="_blank" rel="noreferrer">Apri il minisito</a>}
          {p.minisito && <button className="aa-link aa-link-rosso" onClick={rigenera}>Sostituisci il link</button>}
        </div>
        {p.minisito && link && <p className="aa-nota im-link">{link}</p>}
        {!i.notifica_inviata_il && (
          <div className="aa-errore aa-riga">
            <span>L'email “Nuovo immobile da lavorare” non risulta inviata.</span>
            <button className="aa-btn aa-btn-piccolo" onClick={notifica}>Invia l'email</button>
          </div>
        )}
        {msg?.errore && <p className="aa-errore">{msg.errore}</p>}
        {msg?.ok && <p className="aa-info">{msg.ok}</p>}
      </section>

      <form className="aa-card" onSubmit={salva}>
        <h2 className="aa-h2">Dati immobile</h2>
        <div className="aa-griglia-campi">
          <label className="aa-campo"><span>Riferimento Vendilo</span><input value={f.riferimento_vendilo || ""} onChange={set("riferimento_vendilo")} disabled={!dati} required /></label>
          <label className="aa-campo aa-campo-largo"><span>Indirizzo</span><input value={f.indirizzo || ""} onChange={set("indirizzo")} disabled={!dati} required /></label>
          <label className="aa-campo"><span>Zona</span><input value={f.zona || ""} onChange={set("zona")} disabled={!dati} /></label>
          <label className="aa-campo"><span>Contratto</span><input value={f.contratto || ""} onChange={set("contratto")} disabled={!dati} /></label>
          <label className="aa-campo"><span>Tipologia</span><input value={f.tipologia || ""} onChange={set("tipologia")} disabled={!dati} /></label>
          <label className="aa-campo"><span>Prezzo (€)</span><input type="number" min="0" value={f.prezzo ?? ""} onChange={set("prezzo")} disabled={!dati} /></label>
          <label className="aa-campo"><span>Superficie (mq)</span><input type="number" min="0" value={f.mq ?? ""} onChange={set("mq")} disabled={!dati} /></label>
          <label className="aa-campo"><span>Locali</span><input type="number" min="0" value={f.locali ?? ""} onChange={set("locali")} disabled={!dati} /></label>
          <label className="aa-campo"><span>Classe energetica</span><input value={f.classe_en || ""} onChange={set("classe_en")} disabled={!dati} /></label>
          <label className="aa-campo"><span>Stato</span>
            <select value={f.stato} onChange={set("stato")} disabled={!dati}>{STATI_IMMOBILE.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
        </div>
        <h2 className="aa-h2 im-h2-spazio">Sopralluogo e Open House</h2>
        <div className="aa-griglia-campi">
          <label className="aa-campo"><span>Sopralluogo Marketing</span><input type="date" value={f.data_sopralluogo_marketing || ""} onChange={set("data_sopralluogo_marketing")} disabled={!date} /></label>
          <label className="aa-campo"><span>Open House (entro 15 giorni)</span><input type="date" value={f.data_open_house || ""} onChange={set("data_open_house")} disabled={!date} /></label>
          <div className="aa-campo"><span>Acquisito il</span><p className="im-valore">{dataIT(i.data_acquisizione)}</p></div>
        </div>
        <h2 className="aa-h2 im-h2-spazio">Assegnazioni</h2>
        <div className="aa-griglia-campi">
          <label className="aa-campo"><span>Buyer Agent</span>
            <select value={f.buyer_id || ""} onChange={set("buyer_id")} disabled={!p.gestore}>
              <option value="">Da assegnare</option>
              {buyers.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label className="aa-campo"><span>Consulente del credito</span>
            <select value={f.consulente_credito_id || ""} onChange={set("consulente_credito_id")} disabled={!p.gestore}>
              <option value="">Da assegnare</option>
              {crediti.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
        </div>
        {(dati || date) && <div className="im-salva"><button className="aa-btn aa-btn-pieno">Salva</button></div>}
      </form>
    </>
  );
}

/* ---------------- Storico ---------------- */
const NOMI_TABELLA = { immobili: "Dati immobile", documenti_immobile: "Documenti", attivita_immobile: "Check-list", pubblicazioni: "Pubblicazioni", kpi_immobile: "Numeri", acquirenti_immobile: "Acquirenti" };
const NOMI_OPERAZIONE = { insert: "Aggiunto", update: "Modificato", delete: "Eliminato" };

function Storico({ id }) {
  const [righe, setRighe] = useState(null);
  useEffect(() => {
    supabase.from("storico_immobile").select("*").eq("immobile_id", id).order("quando", { ascending: false }).limit(200)
      .then(({ data }) => setRighe(data || []));
  }, [id]);
  if (righe === null) return <p className="aa-nota">Caricamento…</p>;
  return (
    <section className="aa-card">
      <h2 className="aa-h2">Storico</h2>
      <p className="aa-nota">Ogni modifica con chi, cosa e quando. Le ultime 200.</p>
      {righe.length === 0 ? <p className="aa-nota">Nessuna modifica registrata.</p> : (
        <div className="aa-scorri">
          <table className="aa-tabella">
            <thead><tr><th>Quando</th><th>Chi</th><th>Sezione</th><th>Cosa</th></tr></thead>
            <tbody>
              {righe.map((r) => (
                <tr key={r.id}>
                  <td className="im-nowrap">{new Date(r.quando).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td>{r.autore_nome || "Sistema"}</td>
                  <td>{NOMI_TABELLA[r.tabella] || r.tabella}</td>
                  <td>{NOMI_OPERAZIONE[r.operazione]}{r.riferimento ? ` · ${r.riferimento}` : ""}{r.operazione === "update" && r.modifiche ? `: ${Object.keys(r.modifiche).join(", ")}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ============ Report interno ============ */
export function PaginaReport({ id, vai }) {
  const [dati, setDati] = useState(undefined);
  useEffect(() => {
    supabase.rpc("report_immobile", { iid: Number(id) }).then(({ data }) => setDati(data || null));
  }, [id]);
  return (
    <>
      <button className="aa-link aa-link-indietro" onClick={() => vai(`immobili/${id}`)}>← Torna alla scheda</button>
      {dati === undefined && <p className="aa-nota">Caricamento…</p>}
      {dati === null && <div className="aa-card"><p>Report non disponibile per il tuo ruolo.</p></div>}
      {dati && <div className="im-cornice"><ReportImmobile dati={dati} /></div>}
    </>
  );
}
