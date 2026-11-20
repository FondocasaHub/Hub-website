// One to One mensile (richiesta di Nicola, preparata da Sensoria il 19/11/2026).
// Il collaboratore prenota il suo One to One dell'ultimo giorno lavorativo del mese (dalle 11:00, 30 minuti, tra gli
// orari liberi nel calendario dei One to One di Nicola), compila prima la «Verifica mensile» (pagina 4 della Scheda
// One to One · Obiettivi 2027) e la conferma; il coach la completa (semaforo, note) e la chiude con il suo «Confermo».
// Le schede restano in archivio mese per mese e si stampano in PDF. Dati: supabase/area-agenti-one-to-one.sql;
// orari e inviti: funzione supabase/functions/one-to-one.
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import PresenzeRating from "./Presenze.jsx";

const INDICATORI = [
  ["contatti", "Contatti fatti"],
  ["appuntamenti", "Appuntamenti di acquisizione"],
  ["incarichi", "Incarichi presi"],
  ["proposte", "Proposte accettate"],
  ["fatturato", "Fatturato incassato (€)"],
  ["mutui", "Mutui segnalati a WeUnit"],
];
const DOMANDE = [
  ["d1", "Da 1 a 10 com'è andato il mese? Cosa manca per il 10?"],
  ["d2", "Cosa ha funzionato e cosa no? Cosa dipendeva da te?"],
  ["d3", "Impegni del mese scorso: rispettati? Se no, cosa è successo?"],
];
const SEMAFORI = { verde: "Verde · in linea", giallo: "Giallo · da recuperare", rosso: "Rosso · fuori obiettivo" };
const MESI = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

const nomeMese = (m) => (m ? `${MESI[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}` : "");
const ora = (iso) => new Date(iso).toLocaleTimeString("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" });
const giornoLungo = (iso) => new Date(iso).toLocaleDateString("it-IT", { timeZone: "Europe/Rome", weekday: "long", day: "numeric", month: "long" });
const num = (v) => { const n = parseFloat(String(v ?? "").replace(/\./g, "").replace(",", ".")); return Number.isFinite(n) ? n : 0; };
const vuoto = (v) => v === undefined || v === null || String(v).trim() === "";
const formatta = (n, k) => (k === "fatturato" ? n.toLocaleString("it-IT", { maximumFractionDigits: 0 }) + " €" : n.toLocaleString("it-IT"));
const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const entro24 = (iso) => new Date(iso).getTime() - Date.now() < 24 * 3600 * 1000;

// Finché Nicola non ha eseguito lo SQL e pubblicato la funzione, la pagina lo dice con calma invece dell'errore tecnico.
const IN_ARRIVO = "Il One to One si sta attivando: tra poco trovi qui gli orari da prenotare e la verifica mensile.";
const nonAttivo = (e) => e?.message === IN_ARRIVO
  || /PGRST20[0-9]|42P01|42883|schema cache|does not exist|Could not find|non ancora attivo/i.test(`${e?.code || ""} ${e?.message || ""}`);
const testoErrore = (e) => (nonAttivo(e) ? IN_ARRIVO : e?.message || "Qualcosa non ha funzionato: riprova tra poco.");
function Errore({ testo }) {
  if (!testo) return null;
  return testo === IN_ARRIVO ? <div className="aa-avviso oo-in-arrivo"><strong>In arrivo</strong><p>{testo}</p></div>
    : <p className="aa-errore">{testo}</p>;
}

async function chiama(body) {
  const { data, error } = await supabase.functions.invoke("one-to-one", { body });
  if (error) {
    if (error.context?.status === 404) throw new Error(IN_ARRIVO);   // funzione non ancora pubblicata
    let msg = "";
    try { msg = (await error.context.json()).errore; } catch { /* risposta senza testo */ }
    throw new Error(msg || "Non riesco a raggiungere il calendario dei One to One: riprova tra poco.");
  }
  if (data?.errore) throw new Error(data.errore);
  return data;
}

// Progressivo dal 1° gennaio (righe dello stesso anno fino a questo mese) e scostamento sugli obiettivi del periodo.
function progressivi(storico, mese, scheda) {
  const righe = storico.filter((r) => r.mese.slice(0, 4) === mese.slice(0, 4) && r.mese < mese).map((r) => r.scheda || {});
  righe.push(scheda);
  const out = {};
  for (const [k] of INDICATORI) {
    const fatto = righe.reduce((s, x) => s + num(x.numeri?.[k]?.fatto), 0);
    const obiettivo = righe.reduce((s, x) => s + num(x.numeri?.[k]?.obiettivo), 0);
    out[k] = { fatto, obiettivo, scostamento: obiettivo > 0 ? Math.round(((fatto - obiettivo) / obiettivo) * 100) : null };
  }
  return out;
}
// Proposta di semaforo sul fatturato (o sugli incarichi): fino a -15% in linea, fino a -30% da recuperare (regole 2027).
function semaforoProposto(prog) {
  const s = prog.fatturato.scostamento ?? prog.incarichi.scostamento;
  if (s === null || s === undefined) return "";
  return s >= -15 ? "verde" : s >= -30 ? "giallo" : "rosso";
}
const statoScheda = (r) => (!r ? "da compilare" : r.coach_confermato_il ? "chiusa" : r.confermato_il ? "confermata dal collaboratore" : Object.keys(r.scheda || {}).length ? "in compilazione" : "da compilare");

/* ================================================================ pagina */
export default function OneToOne({ profilo }) {
  const prenota = profilo.ruolo !== "admin";   // tutti tranne Nicola, che li fa (anche lo staff dello store)
  const coach = ["admin", "manager"].includes(profilo.ruolo);
  const schede = [
    prenota && { id: "mio", nome: "Il mio One to One" },
    coach && { id: "team", nome: profilo.ruolo === "admin" ? "Tutti" : "Il mio team" },
    profilo.ruolo === "admin" && { id: "impostazioni", nome: "Orari e calendario" },
    coach && { id: "presenze", nome: "Presenze" },
    { id: "rating", nome: coach ? "Rating agenti" : "Il mio rating" },
  ].filter(Boolean);
  const [modo, setModo] = useState(schede[0]?.id);

  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">Coaching</p>
        <h1 className="aa-titolo">One to One e presenze</h1>
        <p className="aa-sottotitolo">{modo === "presenze"
          ? "Segna le presenze a riunioni settimanali, One to One, fine mese, formazione FondoCasa, convention ed eventi Agente Strategico."
          : modo === "rating" ? "Fatturato, recensioni Google e presenze: il rating di ogni agente."
          : "L'ultimo giorno lavorativo del mese, dalle 11:00. Prenota il tuo orario e compila la verifica mensile prima dell'incontro."}</p>
      </div>
      {schede.length > 1 && (
        <div className="aa-schede">
          {schede.map((s) => <button key={s.id} className={modo === s.id ? "attivo" : ""} onClick={() => setModo(s.id)}>{s.nome}</button>)}
        </div>
      )}
      {modo === "mio" && <MioOneToOne profilo={profilo} />}
      {modo === "team" && <Team profilo={profilo} />}
      {modo === "impostazioni" && <Impostazioni />}
      {modo === "presenze" && <PresenzeRating key="presenze" profilo={profilo} sezione="presenze" />}
      {modo === "rating" && <PresenzeRating key="rating" profilo={profilo} sezione="rating" />}
    </>
  );
}

/* ================================================================ il mio */
function MioOneToOne({ profilo }) {
  const [giorno, setGiorno] = useState(null);
  const [righe, setRighe] = useState(null);
  const [errore, setErrore] = useState("");
  const [aperta, setAperta] = useState(null);
  const [ricarica, setRicarica] = useState(0);

  useEffect(() => {
    setErrore("");
    chiama({ azione: "slot" }).then(setGiorno).catch((e) => setErrore((x) => (x === IN_ARRIVO ? x : testoErrore(e))));
    supabase.from("one_to_one").select("*").eq("user_id", profilo.id).order("mese", { ascending: false })
      .then(({ data, error }) => { if (error) setErrore((x) => (x === IN_ARRIVO ? x : testoErrore(error))); setRighe(data || []); });
  }, [profilo.id, ricarica]);

  if (righe === null) return <div className="aa-spinner" aria-label="Caricamento" />;
  if (errore === IN_ARRIVO) return <Errore testo={errore} />;
  const mese = giorno?.mese;
  const riga = righe.find((r) => r.mese === mese) || null;
  const archivio = righe.filter((r) => r.mese !== mese);
  const persona = { id: profilo.id, nome: profilo.nome || profilo.email };

  return (
    <>
      <Errore testo={errore} />
      {giorno && <Prenotazione giorno={giorno} riga={riga} persona={persona} onFatto={() => setRicarica((n) => n + 1)} />}
      {mese && (
        <Scheda key={mese + (riga?.id || "")} mese={mese} riga={riga} storico={righe} persona={persona} comeCoach={false}
          onSalvata={() => setRicarica((n) => n + 1)} />
      )}
      <section className="aa-card">
        <h2 className="aa-h2">Archivio</h2>
        {!archivio.length ? <p className="aa-nota">Qui troverai le verifiche dei mesi passati.</p> : (
          <table className="aa-tabella">
            <thead><tr><th>Mese</th><th>Incontro</th><th>Scheda</th><th>Semaforo</th><th /></tr></thead>
            <tbody>
              {archivio.map((r) => (
                <React.Fragment key={r.id}>
                  <tr>
                    <td>{nomeMese(r.mese)}</td>
                    <td>{r.inizio ? `${giornoLungo(r.inizio)}, ${ora(r.inizio)}` : "—"}</td>
                    <td>{statoScheda(r)}</td>
                    <td><Semaforo valore={r.semaforo} /></td>
                    <td className="oo-azioni-riga">
                      <button className="aa-link" onClick={() => setAperta(aperta === r.id ? null : r.id)}>{aperta === r.id ? "Chiudi" : "Apri"}</button>
                      <button className="aa-link" onClick={() => stampa(r, righe, persona.nome)}>Stampa</button>
                    </td>
                  </tr>
                  {aperta === r.id && (
                    <tr><td colSpan={5} className="oo-dentro">
                      <Scheda mese={r.mese} riga={r} storico={righe} persona={persona} comeCoach={false} dentro
                        onSalvata={() => setRicarica((n) => n + 1)} />
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

/* ---------------- prenotazione ---------------- */
function Prenotazione({ giorno, riga, persona, onFatto, perCoach = false }) {
  const [sposta, setSposta] = useState(false);
  const [occupato, setOccupato] = useState(false);
  const [errore, setErrore] = useState("");
  const [esito, setEsito] = useState("");
  const prenotato = riga?.inizio;
  const nomeCoach = giorno.nome_coach || "Nicola";

  const scegli = async (o) => {
    const frase = `${prenotato ? "Sposti" : "Prenoti"} il One to One a ${giorno.giorno_bello} alle ${o.ora}?`;
    if (!window.confirm(frase)) return;
    setOccupato(true); setErrore(""); setEsito("");
    try {
      const r = await chiama({ azione: "prenota", inizio: o.inizio, ...(perCoach ? { user_id: persona.id } : {}) });
      setEsito(r.email ? "Fatto: l'invito per il calendario arriva per email." : "Fatto. L'email con l'invito non è partita: l'orario resta comunque prenotato.");
      setSposta(false); onFatto();
    } catch (e) { setErrore((x) => (x === IN_ARRIVO ? x : testoErrore(e))); } finally { setOccupato(false); }
  };
  const disdici = async () => {
    if (!window.confirm("Disdici il One to One? L'appuntamento viene tolto dai calendari.")) return;
    setOccupato(true); setErrore(""); setEsito("");
    try {
      await chiama({ azione: "disdici", id: riga.id, ...(perCoach ? { user_id: persona.id } : {}) });
      onFatto();
    } catch (e) { setErrore((x) => (x === IN_ARRIVO ? x : testoErrore(e))); } finally { setOccupato(false); }
  };

  const griglia = (
    <div className="cp-giorno">
      <p className="cp-giorno-nome">{giorno.giorno_bello}</p>
      <div className="cp-orari">
        {giorno.orari.map((o) => (
          <button type="button" key={o.inizio} className={`aa-btn aa-btn-piccolo oo-orario oo-${o.stato}`}
            disabled={o.stato !== "libero" || occupato} title={o.stato === "libero" ? "" : `Orario ${o.stato}`}
            onClick={() => scegli(o)}>
            {o.ora}
          </button>
        ))}
      </div>
      <p className="aa-nota">Ogni incontro dura {giorno.durata} minuti. Gli orari grigi sono già presi o non disponibili.</p>
    </div>
  );

  return (
    <section className="aa-card">
      <h2 className="aa-h2">{perCoach ? "Orario" : `One to One di ${nomeMese(giorno.mese).toLowerCase()}`}</h2>
      <Errore testo={errore} />
      {esito && <p className="aa-nota oo-ok">{esito}</p>}
      {prenotato ? (
        <>
          <p className="cp-prenotato"><strong>{giornoLungo(riga.inizio)}</strong>, dalle <strong>{ora(riga.inizio)}</strong> alle {ora(riga.fine)}{!perCoach && ` · con ${nomeCoach}`}</p>
          {perCoach || !entro24(riga.inizio) ? (
            <div className="cp-azioni">
              {!sposta && <button className="aa-btn aa-btn-piccolo" disabled={occupato} onClick={() => setSposta(true)}>Sposta</button>}
              {sposta && <button className="aa-link" onClick={() => setSposta(false)}>Lascia com'è</button>}
              <button className="aa-link aa-link-rosso" disabled={occupato} onClick={disdici}>Disdici</button>
            </div>
          ) : <p className="aa-nota">Mancano meno di 24 ore: per spostarlo o disdirlo chiama {nomeCoach}.</p>}
          {sposta && griglia}
        </>
      ) : (
        <>
          <p className="aa-nota">{perCoach ? "Non ha ancora prenotato." : "Scegli l'orario: ricevi l'invito per il calendario via email."}</p>
          {griglia}
        </>
      )}
    </section>
  );
}

/* ---------------- verifica mensile ---------------- */
function Scheda({ mese, riga, storico, persona, comeCoach, onSalvata, dentro = false }) {
  const precedente = useMemo(() => storico.filter((r) => r.mese < mese).sort((a, b) => (a.mese < b.mese ? 1 : -1))[0], [storico, mese]);
  const iniziale = () => {
    if (riga && Object.keys(riga.scheda || {}).length) return riga.scheda;
    const p = precedente?.scheda || {};   // obiettivi ripresi dal mese prima
    return {
      obiettivo_annuo: mese.slice(0, 4) === precedente?.mese.slice(0, 4) ? p.obiettivo_annuo || "" : "",
      numeri: Object.fromEntries(INDICATORI.map(([k]) => [k, { obiettivo: p.numeri?.[k]?.obiettivo || "", fatto: "" }])),
      voto: "", d1: "", d2: "", d3: "", impegni: [{}, {}, {}],
    };
  };
  const [s, setS] = useState(iniziale);
  const [semaforo, setSemaforo] = useState(riga?.semaforo || "");
  const [note, setNote] = useState(riga?.note_coach || "");
  const [salvo, setSalvo] = useState(false);
  const [errore, setErrore] = useState("");
  const [esito, setEsito] = useState("");

  const chiusa = !!riga?.coach_confermato_il;
  const modifica = comeCoach || !chiusa;
  const prog = progressivi(storico.filter((r) => r.id !== riga?.id), mese, s);
  const proposto = semaforoProposto(prog);

  const metti = (campo, valore) => setS((x) => ({ ...x, [campo]: valore }));
  const numero = (k, campo, valore) => setS((x) => ({ ...x, numeri: { ...x.numeri, [k]: { ...(x.numeri?.[k] || {}), [campo]: valore } } }));
  const impegno = (i, campo, valore) => setS((x) => {
    const imp = [...(x.impegni || [{}, {}, {}])]; imp[i] = { ...(imp[i] || {}), [campo]: valore };
    return { ...x, impegni: imp };
  });

  const salva = async (conferma) => {
    setSalvo(true); setErrore(""); setEsito("");
    const dati = { scheda: s };
    if (comeCoach) {
      Object.assign(dati, { semaforo: semaforo || null, note_coach: note });
      if (conferma === "coach") dati.coach_confermato_il = new Date().toISOString();
      if (conferma === "riapri") dati.coach_confermato_il = null;
    } else if (conferma === "agente") {
      dati.confermato_il = new Date().toISOString();
    }
    try {
      const q = riga
        ? supabase.from("one_to_one").update(dati).eq("id", riga.id)
        : supabase.from("one_to_one").insert({ ...dati, user_id: persona.id, mese });
      const { error } = await q;
      if (error) throw error;
      setEsito(conferma === "coach" ? "Scheda chiusa." : conferma === "agente" ? "Confermata: il coach la vede pronta." : "Salvata.");
      onSalvata?.();
    } catch (e) { setErrore(e.message || "Non sono riuscito a salvare: riprova."); } finally { setSalvo(false); }
  };

  const campo = (valore, onChange, attr = {}) =>
    modifica ? <input value={valore ?? ""} onChange={(e) => onChange(e.target.value)} {...attr} /> : <span>{vuoto(valore) ? "—" : valore}</span>;
  const testo = (valore, onChange) =>
    modifica ? <textarea rows={3} value={valore ?? ""} onChange={(e) => onChange(e.target.value)} maxLength={1500} />
      : <p className="oo-testo">{vuoto(valore) ? "—" : valore}</p>;

  const Contenitore = dentro ? "div" : "section";
  return (
    <Contenitore className={dentro ? "oo-scheda-dentro" : "aa-card"}>
      <div className="aa-card-testa">
        <h2 className="aa-h2">Verifica mensile · {nomeMese(mese)}</h2>
        {riga && <button className="aa-link" onClick={() => stampa({ ...riga, scheda: s, semaforo, note_coach: note }, storico, persona.nome)}>Stampa PDF</button>}
      </div>
      {chiusa && <p className="aa-nota">Chiusa dal coach il {new Date(riga.coach_confermato_il).toLocaleDateString("it-IT")}{comeCoach ? ": puoi ancora correggerla." : "."}</p>}
      <Errore testo={errore} />

      <h3 className="oo-h3"><span className="aa-sezione-n">1</span>Dati</h3>
      <div className="aa-griglia-campi oo-dati">
        <div className="aa-campo"><span>Collaboratore</span><strong>{persona.nome}</strong></div>
        <div className="aa-campo"><span>Mese</span><strong>{nomeMese(mese)}</strong></div>
        <label className="aa-campo"><span>Obiettivo annuo (€)</span>{campo(s.obiettivo_annuo, (v) => metti("obiettivo_annuo", v), { inputMode: "decimal" })}</label>
      </div>

      <h3 className="oo-h3"><span className="aa-sezione-n">2</span>Numeri del mese e progressivo dal 1° gennaio</h3>
      <div className="oo-scorri">
        <table className={`aa-tabella ${modifica ? "aa-tabella-edit" : ""} oo-numeri`}>
          <thead><tr><th>Indicatore</th><th>Obiettivo mese</th><th>Fatto mese</th><th>Progressivo anno</th><th>Scostamento</th></tr></thead>
          <tbody>
            {INDICATORI.map(([k, nome]) => (
              <tr key={k}>
                <td>{nome}</td>
                <td>{campo(s.numeri?.[k]?.obiettivo, (v) => numero(k, "obiettivo", v), { inputMode: "decimal" })}</td>
                <td>{campo(s.numeri?.[k]?.fatto, (v) => numero(k, "fatto", v), { inputMode: "decimal" })}</td>
                <td className="oo-n">{formatta(prog[k].fatto, k)}{prog[k].obiettivo > 0 && <small> su {formatta(prog[k].obiettivo, k)}</small>}</td>
                <td className={`oo-n ${prog[k].scostamento < 0 ? "oo-meno" : ""}`}>{prog[k].scostamento === null ? "—" : `${prog[k].scostamento > 0 ? "+" : ""}${prog[k].scostamento}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="oo-semaforo-riga">
        <span className="oo-etichetta">Semaforo</span>
        {comeCoach ? (
          <select value={semaforo} onChange={(e) => setSemaforo(e.target.value)}>
            <option value="">Da decidere</option>
            {Object.entries(SEMAFORI).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        ) : <Semaforo valore={riga?.semaforo} vuoto="lo decide il coach all'incontro" />}
        {comeCoach && proposto && proposto !== semaforo && (
          <button className="aa-link" onClick={() => setSemaforo(proposto)}>Proposta dai numeri: {SEMAFORI[proposto]}</button>
        )}
      </div>

      <h3 className="oo-h3"><span className="aa-sezione-n">3</span>Domande del coach</h3>
      {precedente?.scheda?.impegni?.some((x) => !vuoto(x?.azione)) && (
        <div className="oo-precedenti">
          <strong>Impegni presi a {nomeMese(precedente.mese).toLowerCase()}</strong>
          <ul>{precedente.scheda.impegni.filter((x) => !vuoto(x?.azione)).map((x, i) => (
            <li key={i}>{x.azione}{x.atteso ? ` · ${x.atteso}` : ""}{x.entro ? ` · entro il ${new Date(x.entro).toLocaleDateString("it-IT")}` : ""}</li>
          ))}</ul>
        </div>
      )}
      <div className="aa-griglia-campi oo-domande">
        {DOMANDE.map(([k, d]) => (
          <label key={k} className="aa-campo aa-campo-largo">
            <span>{d}</span>
            {k === "d1" && (modifica ? (
              <select className="oo-voto" value={s.voto || ""} onChange={(e) => metti("voto", e.target.value)}>
                <option value="">Voto</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            ) : s.voto ? <strong>Voto: {s.voto}/10</strong> : null)}
            {testo(s[k], (v) => metti(k, v))}
          </label>
        ))}
      </div>

      <h3 className="oo-h3"><span className="aa-sezione-n">4</span>Impegni per il prossimo mese</h3>
      <div className="oo-scorri">
        <table className={`aa-tabella ${modifica ? "aa-tabella-edit" : ""}`}>
          <thead><tr><th>Azione</th><th>Numero / risultato atteso</th><th>Entro il</th></tr></thead>
          <tbody>
            {[0, 1, 2].map((i) => {
              const x = (s.impegni || [])[i] || {};
              return (
                <tr key={i}>
                  <td>{campo(x.azione, (v) => impegno(i, "azione", v), { maxLength: 300 })}</td>
                  <td>{campo(x.atteso, (v) => impegno(i, "atteso", v), { maxLength: 120 })}</td>
                  <td>{modifica ? <input type="date" value={x.entro || ""} onChange={(e) => impegno(i, "entro", e.target.value)} />
                    : x.entro ? new Date(x.entro).toLocaleDateString("it-IT") : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(comeCoach || riga?.note_coach) && (
        <label className="aa-campo aa-campo-largo oo-note">
          <span>Note del coach</span>
          {comeCoach ? <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} />
            : <p className="oo-testo">{riga.note_coach}</p>}
        </label>
      )}

      <div className="oo-conferme">
        <p className={riga?.confermato_il ? "oo-fatta" : ""}>
          {riga?.confermato_il ? `✓ Confermata da ${persona.nome} il ${new Date(riga.confermato_il).toLocaleDateString("it-IT")}` : "Il collaboratore non ha ancora confermato."}
        </p>
        <p className={chiusa ? "oo-fatta" : ""}>
          {chiusa ? `✓ Confermata dal coach il ${new Date(riga.coach_confermato_il).toLocaleDateString("it-IT")}` : "Il coach conferma all'incontro."}
        </p>
      </div>
      {esito && <p className="aa-nota oo-ok">{esito}</p>}
      {modifica && (
        <div className="cp-azioni">
          <button className="aa-btn" disabled={salvo} onClick={() => salva()}>Salva</button>
          {!comeCoach && !riga?.confermato_il && (
            <button className="aa-btn aa-btn-pieno" disabled={salvo} onClick={() => window.confirm("Confermi la verifica? Potrai ancora correggerla finché il coach non la chiude.") && salva("agente")}>Confermo</button>
          )}
          {comeCoach && !chiusa && (
            <button className="aa-btn aa-btn-pieno" disabled={salvo} onClick={() => window.confirm("Confermi e chiudi la scheda? Il collaboratore non potrà più modificarla.") && salva("coach")}>Confermo e chiudo</button>
          )}
          {comeCoach && chiusa && <button className="aa-link" disabled={salvo} onClick={() => salva("riapri")}>Riapri per il collaboratore</button>}
        </div>
      )}
    </Contenitore>
  );
}

function Semaforo({ valore, vuoto: testoVuoto = "—" }) {
  if (!valore) return <span className="aa-nota oo-inline">{testoVuoto}</span>;
  return <span className={`oo-semaforo oo-semaforo-${valore}`}>{SEMAFORI[valore]}</span>;
}

/* ================================================================ coach */
function Team({ profilo }) {
  const [giorno, setGiorno] = useState(null);
  const [mese, setMese] = useState("");
  const [persone, setPersone] = useState(null);
  const [righe, setRighe] = useState([]);
  const [aperto, setAperto] = useState(null);
  const [storico, setStorico] = useState([]);
  const [errore, setErrore] = useState("");
  const [ricarica, setRicarica] = useState(0);
  const [copiato, setCopiato] = useState(false);

  useEffect(() => {
    chiama({ azione: "slot", ...(mese ? { mese } : {}) }).then((g) => { setGiorno(g); setMese((m) => m || g.mese); })
      .catch((e) => setErrore((x) => (x === IN_ARRIVO ? x : testoErrore(e))));
  }, [mese, ricarica]);
  useEffect(() => {
    supabase.rpc("one_to_one_collaboratori").then(({ data, error }) => { if (error) setErrore((x) => (x === IN_ARRIVO ? x : testoErrore(error))); setPersone(data || []); });
  }, []);
  useEffect(() => {
    if (!mese) return;
    supabase.from("one_to_one").select("*").eq("mese", mese).then(({ data }) => setRighe(data || []));
  }, [mese, ricarica]);
  useEffect(() => {
    if (!aperto) return;
    supabase.from("one_to_one").select("*").eq("user_id", aperto.user_id).order("mese", { ascending: false })
      .then(({ data }) => setStorico(data || []));
  }, [aperto, ricarica]);

  const mesi = useMemo(() => {
    const out = []; const base = mese || giorno?.mese;
    if (!base) return out;
    for (let i = -12; i <= 1; i++) {
      const d = new Date(Date.UTC(Number(base.slice(0, 4)), Number(base.slice(5, 7)) - 1 + i, 1));
      out.push(d.toISOString().slice(0, 10));
    }
    return out.reverse();
  }, [giorno?.mese]);

  if (persone === null || !giorno) return errore ? <Errore testo={errore} /> : <div className="aa-spinner" aria-label="Caricamento" />;
  const perUtente = Object.fromEntries(righe.map((r) => [r.user_id, r]));
  const elenco = persone.map((p) => ({ ...p, riga: perUtente[p.user_id] }))
    .sort((a, b) => (a.riga?.inizio || "z").localeCompare(b.riga?.inizio || "z") || (a.nome || "").localeCompare(b.nome || ""));
  const prenotati = elenco.filter((p) => p.riga?.inizio).length;
  const messaggio = `Ciao a tutti! ${giorno.giorno_bello[0].toUpperCase() + giorno.giorno_bello.slice(1)} facciamo i One to One del mese, dalle 11:00. `
    + `Prenotate il vostro orario e compilate la verifica mensile prima dell'incontro: https://www.fondocasahub.com/area-agenti/one-to-one`;

  if (aperto) {
    const r = perUtente[aperto.user_id] || null;
    const persona = { id: aperto.user_id, nome: aperto.nome };
    return (
      <>
        <button className="aa-link oo-indietro" onClick={() => setAperto(null)}>← Tutti i One to One di {nomeMese(mese).toLowerCase()}</button>
        {mese === giorno.mese && <Prenotazione giorno={giorno} riga={r} persona={persona} perCoach onFatto={() => setRicarica((n) => n + 1)} />}
        <Scheda key={`${r?.id || "nuova"}-${ricarica}-${storico.length}`} mese={mese} riga={r} storico={storico} persona={persona} comeCoach
          onSalvata={() => setRicarica((n) => n + 1)} />
      </>
    );
  }

  return (
    <>
      <Errore testo={errore} />
      <section className="aa-card">
        <div className="aa-card-testa">
          <h2 className="aa-h2">{nomeMese(mese)}</h2>
          <select value={mese} onChange={(e) => setMese(e.target.value)} aria-label="Mese">
            {mesi.map((m) => <option key={m} value={m}>{nomeMese(m)}</option>)}
          </select>
        </div>
        <p className="aa-nota">
          {mese === giorno.mese ? `Giorno dei One to One: ${giorno.giorno_bello}. ` : ""}
          {prenotati} su {elenco.length} hanno prenotato. Apri una riga per vedere e completare la verifica.
        </p>
        {!elenco.length ? <p>Nessun collaboratore da seguire.</p> : (
          <div className="oo-scorri">
            <table className="aa-tabella aa-tabella-click">
              <thead><tr><th>Collaboratore</th><th>Orario</th><th>Verifica</th><th>Semaforo</th></tr></thead>
              <tbody>
                {elenco.map((p) => (
                  <tr key={p.user_id} onClick={() => setAperto(p)}>
                    <td><strong>{p.nome}</strong>{p.team && <small className="oo-team"> · {p.team}</small>}</td>
                    <td>{p.riga?.inizio ? ora(p.riga.inizio) : <span className="oo-meno">da prenotare</span>}</td>
                    <td>{statoScheda(p.riga)}</td>
                    <td><Semaforo valore={p.riga?.semaforo} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {mese === giorno.mese && (
        <section className="aa-card">
          <h2 className="aa-h2">Messaggio per il gruppo WhatsApp</h2>
          <p className="oo-messaggio">{messaggio}</p>
          <button className="aa-btn aa-btn-piccolo" onClick={() => navigator.clipboard?.writeText(messaggio).then(() => setCopiato(true))}>
            {copiato ? "Copiato ✓" : "Copia il messaggio"}
          </button>
        </section>
      )}
    </>
  );
}

/* ================================================================ impostazioni (admin) */
function Impostazioni() {
  const [imp, setImp] = useState(null);
  const [giorno, setGiorno] = useState(null);
  const [errore, setErrore] = useState("");
  const [esito, setEsito] = useState("");
  const [salvo, setSalvo] = useState(false);

  const carica = () => {
    supabase.from("one_to_one_impostazioni").select("*").eq("id", 1).maybeSingle()
      .then(({ data, error }) => { if (error) setErrore((x) => (x === IN_ARRIVO ? x : testoErrore(error))); setImp(data); });
    chiama({ azione: "slot" }).then(setGiorno).catch((e) => setErrore((x) => (x === IN_ARRIVO ? x : testoErrore(e))));
  };
  useEffect(carica, []);
  if (!imp) return errore ? <Errore testo={errore} /> : <div className="aa-spinner" aria-label="Caricamento" />;

  const metti = (k, v) => setImp((x) => ({ ...x, [k]: v }));
  const chiave = giorno?.mese.slice(0, 7);
  const spostato = (imp.giorni_spostati || {})[chiave] || "";
  const chiusi = new Set(imp.chiusi || []);
  const chiudi = (iso) => {
    const lista = [...(imp.chiusi || [])].filter((x) => new Date(x).getTime() !== new Date(iso).getTime());
    if (lista.length === (imp.chiusi || []).length) lista.push(iso);
    metti("chiusi", lista);
  };
  const salva = async () => {
    setSalvo(true); setErrore(""); setEsito("");
    const ora_ = Date.now();
    const { error } = await supabase.from("one_to_one_impostazioni").update({
      email_coach: imp.email_coach.trim(), nome_coach: imp.nome_coach.trim() || "Nicola", dalle: imp.dalle, alle: imp.alle,
      pausa_dalle: imp.pausa_dalle || null, pausa_alle: imp.pausa_alle || null, durata: Number(imp.durata) || 30,
      giorni_spostati: imp.giorni_spostati || {}, chiusi: (imp.chiusi || []).filter((x) => new Date(x).getTime() > ora_),
    }).eq("id", 1);
    setSalvo(false);
    if (error) return setErrore((x) => (x === IN_ARRIVO ? x : testoErrore(error)));
    setEsito("Salvato."); carica();
  };

  return (
    <section className="aa-card">
      <h2 className="aa-h2">Orari e calendario</h2>
      <Errore testo={errore} />
      <div className="aa-griglia-campi">
        <label className="aa-campo"><span>Email del calendario dei One to One</span>
          <input type="email" value={imp.email_coach} onChange={(e) => metti("email_coach", e.target.value)} placeholder="riceve gli inviti" /></label>
        <label className="aa-campo"><span>Nome del coach negli inviti</span>
          <input value={imp.nome_coach} onChange={(e) => metti("nome_coach", e.target.value)} /></label>
        <label className="aa-campo"><span>Durata (minuti)</span>
          <select value={imp.durata} onChange={(e) => metti("durata", Number(e.target.value))}>
            {[20, 30, 45, 60].map((n) => <option key={n} value={n}>{n}</option>)}
          </select></label>
        <label className="aa-campo"><span>Dalle</span><input type="time" value={(imp.dalle || "").slice(0, 5)} onChange={(e) => metti("dalle", e.target.value)} /></label>
        <label className="aa-campo"><span>Alle</span><input type="time" value={(imp.alle || "").slice(0, 5)} onChange={(e) => metti("alle", e.target.value)} /></label>
        <label className="aa-campo"><span>Pausa (dalle – alle)</span>
          <span className="oo-pausa">
            <input type="time" value={(imp.pausa_dalle || "").slice(0, 5)} onChange={(e) => metti("pausa_dalle", e.target.value)} />
            <input type="time" value={(imp.pausa_alle || "").slice(0, 5)} onChange={(e) => metti("pausa_alle", e.target.value)} />
          </span></label>
      </div>
      <p className="aa-nota">
        Calendario di {imp.nome_coach || "Nicola"}: {giorno ? (giorno.calendario_collegato
          ? "collegato. Gli orari in cui hai un impegno non si possono prenotare."
          : "non ancora collegato. Gli orari tengono conto solo delle prenotazioni del sito (vedi le istruzioni nella funzione one-to-one).") : "…"}
      </p>

      {giorno && (
        <>
          <h3 className="oo-h3">{nomeMese(giorno.mese)}</h3>
          <label className="aa-campo oo-giorno-spostato"><span>Giorno dei One to One (vuoto = ultimo giorno lavorativo)</span>
            <input type="date" value={spostato} min={giorno.mese} max={giorno.mese.slice(0, 8) + "31"}
              onChange={(e) => metti("giorni_spostati", { ...(imp.giorni_spostati || {}), [chiave]: e.target.value || undefined })} /></label>
          <p className="aa-nota">Tocca un orario per chiuderlo o riaprirlo (salva per renderlo valido).</p>
          <div className="cp-orari">
            {giorno.orari.map((o) => (
              <button key={o.inizio} type="button" className={`aa-btn aa-btn-piccolo oo-orario ${chiusi.has(o.inizio) || [...chiusi].some((x) => new Date(x).getTime() === new Date(o.inizio).getTime()) ? "oo-chiuso" : `oo-${o.stato}`}`}
                disabled={o.stato === "preso" || o.stato === "passato"} onClick={() => chiudi(o.inizio)}>
                {o.ora}{o.stato === "preso" ? " · preso" : o.stato === "occupato" ? " · impegno" : ""}
              </button>
            ))}
          </div>
        </>
      )}
      {esito && <p className="aa-nota oo-ok">{esito}</p>}
      <div className="cp-azioni"><button className="aa-btn aa-btn-pieno" disabled={salvo} onClick={salva}>Salva</button></div>
    </section>
  );
}

/* ================================================================ stampa (A4, come la pagina 4 della scheda) */
function stampa(riga, storico, nome) {
  const s = riga.scheda || {};
  const prog = progressivi(storico.filter((r) => r.id !== riga.id), riga.mese, s);
  const base = window.location.origin;
  const cella = (v) => (vuoto(v) ? "&nbsp;" : esc(v));
  const box = (titolo, v) => `<p class="q">${esc(titolo)}</p><div class="box">${vuoto(v) ? "&nbsp;" : esc(v).replace(/\n/g, "<br>")}</div>`;
  const data = (iso) => (iso ? new Date(iso).toLocaleDateString("it-IT") : "");
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>One to One ${esc(nome)} ${esc(nomeMese(riga.mese))}</title>
<style>
@page{size:A4 portrait;margin:12mm 12mm 26mm}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{background:#fff;color-scheme:light}
body{font-family:Jost,Arial,Helvetica,sans-serif;color:#0A1628;font-size:9.5pt;margin:0}
.top{display:flex;justify-content:space-between;align-items:center;background:#0A1628;color:#FCFDFD;padding:10px 14px;border-radius:6px}
.top img{height:46px}.top .dx{text-align:right;font-size:8.5pt}.top .dx b{display:block;font-size:13pt;color:#C9A84C}
h2{font-size:11pt;margin:14px 0 6px}h2 span{display:inline-block;background:#C9A84C;color:#0A1628;border-radius:4px;padding:1px 7px;margin-right:6px}
table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #D9DEE7;padding:5px 6px;text-align:left;vertical-align:top}
th{background:#0A1628;color:#FCFDFD;font-size:8.5pt}td.n{text-align:right;white-space:nowrap}
.dati td{border:0;padding:3px 6px}.dati b{display:inline-block;min-width:120px;color:#5B6577;font-weight:normal}
.q{font-weight:bold;margin:8px 0 3px}.box{border:1px solid #BFD3DC;background:#EEF4F6;border-radius:3px;padding:6px 8px;min-height:32px}
.firme{display:flex;gap:24px;margin-top:18px}.firme div{flex:1;border-top:1px solid #0A1628;padding-top:4px;font-size:8.5pt;color:#5B6577}
.firme b{display:block;color:#0A1628}
.foot{position:fixed;left:0;right:0;bottom:-18mm;background:#0A1628;color:#FCFDFD;display:flex;justify-content:space-between;align-items:center;padding:6px 12px;font-size:7.5pt}
.foot img{height:22px}
</style></head><body>
<div class="top"><img src="${base}/images/logo-hub-bianco.png" alt="HUB"><div class="dx"><b>Verifica mensile One to One</b>Ultimo giorno lavorativo del mese · documento riservato</div></div>
<h2><span>1</span>Dati</h2>
<table class="dati"><tr><td><b>Collaboratore</b>${esc(nome)}</td><td><b>Mese</b>${esc(nomeMese(riga.mese))}</td></tr>
<tr><td><b>Obiettivo annuo (€)</b>${cella(s.obiettivo_annuo)}</td><td><b>Data</b>${riga.inizio ? esc(giornoLungo(riga.inizio)) + ", " + ora(riga.inizio) : ""}</td></tr></table>
<h2><span>2</span>Numeri del mese e progressivo dal 1° gennaio</h2>
<table><tr><th>Indicatore</th><th>Obiettivo mese</th><th>Fatto mese</th><th>Progressivo anno</th><th>Scostamento %</th></tr>
${INDICATORI.map(([k, n]) => `<tr><td>${n}</td><td class="n">${cella(s.numeri?.[k]?.obiettivo)}</td><td class="n">${cella(s.numeri?.[k]?.fatto)}</td><td class="n">${formatta(prog[k].fatto, k)}</td><td class="n">${prog[k].scostamento === null ? "—" : prog[k].scostamento + "%"}</td></tr>`).join("")}
</table>
<p class="q">Semaforo: <span style="font-weight:normal">${riga.semaforo ? esc(SEMAFORI[riga.semaforo]) : "—"}</span></p>
<h2><span>3</span>Domande del coach</h2>
${box(DOMANDE[0][1] + (s.voto ? ` (voto ${s.voto}/10)` : ""), s.d1)}${box(DOMANDE[1][1], s.d2)}${box(DOMANDE[2][1], s.d3)}
<h2><span>4</span>Impegni per il prossimo mese</h2>
<table><tr><th>Azione</th><th>Numero / risultato atteso</th><th>Entro il</th></tr>
${[0, 1, 2].map((i) => { const x = (s.impegni || [])[i] || {}; return `<tr><td>${cella(x.azione)}</td><td>${cella(x.atteso)}</td><td>${data(x.entro) || "&nbsp;"}</td></tr>`; }).join("")}
</table>
${riga.note_coach ? box("Note del coach", riga.note_coach) : ""}
<div class="firme"><div><b>${riga.confermato_il ? "Confermato il " + data(riga.confermato_il) : "&nbsp;"}</b>Collaboratore</div>
<div><b>${riga.coach_confermato_il ? "Confermato il " + data(riga.coach_confermato_il) : "&nbsp;"}</b>Coach</div></div>
<div class="foot"><span>FC Punto Hub Srl · Via Pietro Mascagni 35, Napoli · P.IVA 01924140096 · na.vomero@fondocasa.it</span><img src="${base}/images/immobile/piedino.png" alt="FondoCasa · weunit.it · Henia"></div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) { alert("Il browser ha bloccato la finestra: consenti i popup per fondocasahub.com per stampare."); return; }
  w.document.open(); w.document.write(html); w.document.close();
}
