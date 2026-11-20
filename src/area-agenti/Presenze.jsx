// Presenze e Rating agente (richiesta di Nicola del 19/11/2026) — scheda dentro «One to One e presenze».
// Il rating (0–100) è la media pesata di fatturato, recensioni Google con il nome dell'agente e presenze a:
// riunioni settimanali, One to One, riunioni di fine mese, formazione FondoCasa, convention, bootcamp e
// eventi nazionali Agente Strategico. Calcolo: funzione rating_agenti (supabase/area-agenti-presenze-rating.sql);
// recensioni Google lette ogni 6 ore dalla funzione supabase/functions/recensioni-google.
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

export const TIPI = [
  { id: "settimanale", nome: "Riunione settimanale", breve: "Settimanali" },
  { id: "one_to_one", nome: "One to One mensile", breve: "One to One" },
  { id: "fine_mese", nome: "Riunione di fine mese", breve: "Fine mese" },
  { id: "formazione_fc", nome: "Evento formativo FondoCasa", breve: "Formazione FC" },
  { id: "convention", nome: "Convention aziendale", breve: "Convention" },
  { id: "bootcamp_as", nome: "Bootcamp Agente Strategico (in città)", breve: "Bootcamp AS" },
  { id: "nazionale_as", nome: "Evento nazionale Agente Strategico", breve: "Nazionale AS" },
];
const NOME_TIPO = Object.fromEntries(TIPI.map((t) => [t.id, t.nome]));
const STATI = [
  { id: "presente", nome: "Presente" },
  { id: "ritardo", nome: "In ritardo" },
  { id: "assente", nome: "Assente" },
  { id: "giustificato", nome: "Giustificato" },
];
const VOCI_PESO = [{ id: "fatturato", nome: "Fatturato" }, { id: "recensioni", nome: "Recensioni Google" }, ...TIPI.map((t) => ({ id: t.id, nome: t.nome }))];

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const euro = (n) => (Number(n) || 0).toLocaleString("it-IT", { maximumFractionDigits: 0 }) + " €";
const dataBella = (s) => new Date(s + "T12:00:00").toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const p = (v) => (v === null || v === undefined ? "—" : Number(v).toLocaleString("it-IT", { maximumFractionDigits: 1 }));

function periodo(tipo, anno, n) {
  if (tipo === "mese") return [iso(new Date(anno, n, 1)), iso(new Date(anno, n + 1, 0))];
  if (tipo === "trimestre") return [iso(new Date(anno, n * 3, 1)), iso(new Date(anno, n * 3 + 3, 0))];
  return [`${anno}-01-01`, `${anno}-12-31`];
}
function fascia(r) {
  if (r === null || r === undefined) return { nome: "Senza dati", cls: "" };
  if (r >= 85) return { nome: "Eccellente", cls: "pr-verde" };
  if (r >= 70) return { nome: "Buono", cls: "pr-verde" };
  if (r >= 50) return { nome: "Da migliorare", cls: "pr-giallo" };
  return { nome: "Critico", cls: "pr-rosso" };
}
function Stelle({ rating }) {
  if (rating === null || rating === undefined) return <span className="aa-nota oo-inline">—</span>;
  const n = Math.round((Number(rating) / 20) * 2) / 2;
  return <span className="pr-stelle" title={`${n} su 5`}>{"★".repeat(Math.floor(n))}{n % 1 ? "½" : ""}<span>{"★".repeat(5 - Math.ceil(n))}</span></span>;
}
function Rating({ valore }) {
  const f = fascia(valore);
  return <span className={`pr-rating ${f.cls}`}>{p(valore)}<small> · {f.nome}</small></span>;
}

/* ================================================================ pagina */
// sezione="presenze": foglio presenze di riunioni ed eventi (Store Manager e Team Manager).
// sezione="rating": classifica, recensioni e pesi (coach) oppure «Il mio rating» (collaboratore).
export default function PresenzeRating({ profilo, sezione = "rating" }) {
  const coach = ["admin", "manager"].includes(profilo.ruolo);
  const isAdmin = profilo.ruolo === "admin";
  const schede = coach
    ? [{ id: "classifica", nome: "Classifica" }, { id: "recensioni", nome: "Recensioni" }, isAdmin && { id: "pesi", nome: "Pesi del rating" }].filter(Boolean)
    : [{ id: "mio", nome: "Il mio rating" }];
  const [modo, setModo] = useState(schede[0].id);
  if (sezione === "presenze") return coach ? <Eventi profilo={profilo} /> : <Classifica profilo={profilo} solo />;
  return (
    <>
      {schede.length > 1 && (
        <div className="aa-schede pr-sottoschede">
          {schede.map((s) => <button key={s.id} className={modo === s.id ? "attivo" : ""} onClick={() => setModo(s.id)}>{s.nome}</button>)}
        </div>
      )}
      {modo === "mio" && <Classifica profilo={profilo} solo />}
      {modo === "classifica" && <Classifica profilo={profilo} />}
      {modo === "recensioni" && <Recensioni profilo={profilo} />}
      {modo === "pesi" && <Pesi />}
    </>
  );
}

/* ================================================================ periodo */
function usePeriodo() {
  const oggi = new Date();
  const [tipo, setTipo] = useState("trimestre");
  const [anno, setAnno] = useState(oggi.getFullYear());
  const [n, setN] = useState(Math.floor(oggi.getMonth() / 3));
  const cambiaTipo = (t) => { setTipo(t); setN(t === "mese" ? oggi.getMonth() : Math.floor(oggi.getMonth() / 3)); };
  const [dal, al] = periodo(tipo, anno, n);
  const MESI = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  const selettore = (
    <div className="pr-periodo">
      <select value={tipo} onChange={(e) => cambiaTipo(e.target.value)} aria-label="Periodo">
        <option value="mese">Mese</option><option value="trimestre">Trimestre</option><option value="anno">Anno</option>
      </select>
      {tipo === "mese" && <select value={n} onChange={(e) => setN(Number(e.target.value))} aria-label="Mese">{MESI.map((m, i) => <option key={m} value={i}>{m}</option>)}</select>}
      {tipo === "trimestre" && <select value={n} onChange={(e) => setN(Number(e.target.value))} aria-label="Trimestre">{[0, 1, 2, 3].map((i) => <option key={i} value={i}>{i + 1}° trimestre</option>)}</select>}
      <select value={anno} onChange={(e) => setAnno(Number(e.target.value))} aria-label="Anno">
        {[oggi.getFullYear() + 1, oggi.getFullYear(), oggi.getFullYear() - 1].map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
    </div>
  );
  return { dal, al, selettore };
}

/* ================================================================ classifica / il mio rating */
function Classifica({ profilo, solo = false }) {
  const { dal, al, selettore } = usePeriodo();
  const [righe, setRighe] = useState(null);
  const [errore, setErrore] = useState("");
  const [aperto, setAperto] = useState(null);
  const [team, setTeam] = useState("");

  useEffect(() => {
    setRighe(null); setErrore("");
    supabase.rpc("rating_agenti", { p_dal: dal, p_al: al }).then(({ data, error }) => {
      if (error) setErrore(error.message);
      setRighe(data || []);
    });
  }, [dal, al]);

  if (righe === null) return <div className="aa-spinner" aria-label="Caricamento" />;
  const mie = solo ? righe.filter((r) => r.user_id === profilo.id) : righe;
  const teams = [...new Set(righe.map((r) => r.team).filter(Boolean))];
  const elenco = team ? mie.filter((r) => r.team === team) : mie;

  if (solo || aperto) {
    const r = solo ? mie[0] : righe.find((x) => x.user_id === aperto);
    return (
      <>
        {!solo && <button className="aa-link oo-indietro" onClick={() => setAperto(null)}>← Tutta la classifica</button>}
        <section className="aa-card">
          <div className="aa-card-testa"><h2 className="aa-h2">{solo ? "Il mio rating" : r?.nome}</h2>{selettore}</div>
          {errore && <p className="aa-errore">{errore}</p>}
          {!r ? <p>Nessun dato per questo periodo.</p> : <Dettaglio r={r} dal={dal} al={al} />}
        </section>
      </>
    );
  }

  const migliore = elenco.find((r) => r.rating !== null);
  return (
    <section className="aa-card">
      <div className="aa-card-testa">
        <h2 className="aa-h2">Rating agenti</h2>
        <div className="pr-periodo">
          {teams.length > 1 && (
            <select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Team">
              <option value="">Tutti i team</option>{teams.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          {selettore}
        </div>
      </div>
      {errore && <p className="aa-errore">{errore}</p>}
      <p className="aa-nota">
        Dal {dataBella(dal)} al {dataBella(al)}. Media pesata di fatturato, recensioni Google e presenze: le voci senza dati nel periodo non pesano.
        {migliore && <> Primo in classifica: <strong>{migliore.nome}</strong>.</>} Apri una riga per il dettaglio.
      </p>
      <div className="oo-scorri">
        <table className="aa-tabella aa-tabella-click pr-tabella">
          <thead><tr>
            <th>#</th><th>Collaboratore</th><th>Rating</th><th>Stelle</th><th>Fatturato</th><th>Recensioni</th>
            {TIPI.map((t) => <th key={t.id}>{t.breve}</th>)}
          </tr></thead>
          <tbody>
            {elenco.map((r, i) => (
              <tr key={r.user_id} onClick={() => setAperto(r.user_id)}>
                <td>{r.rating !== null ? i + 1 : ""}</td>
                <td><strong>{r.nome}</strong>{r.team && <small className="oo-team"> · {r.team}</small>}</td>
                <td><Rating valore={r.rating} /></td>
                <td><Stelle rating={r.rating} /></td>
                <td title={`${euro(r.fatturato)} su obiettivo annuo ${r.obiettivo ? euro(r.obiettivo) : "non impostato"}`}>{p(r.p_fatturato)}</td>
                <td title={`${r.recensioni} recensioni, media ${r.stelle ?? "—"}`}>{p(r.p_recensioni)} <small>({r.recensioni})</small></td>
                {TIPI.map((t) => <td key={t.id}>{p(r.presenze?.[t.id]?.punti)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="aa-nota">Ogni voce è in centesimi (100 = obiettivo pieno). Presenze: presente 100%, in ritardo 50%, assente 0, giustificato non conta.</p>
    </section>
  );
}

function Dettaglio({ r, dal, al }) {
  const [presenze, setPresenze] = useState([]);
  const [recensioni, setRecensioni] = useState([]);
  useEffect(() => {
    supabase.from("presenze").select("stato, note, presenze_eventi!inner(tipo, titolo, data)").eq("user_id", r.user_id)
      .gte("presenze_eventi.data", dal).lte("presenze_eventi.data", al)
      .then(({ data }) => setPresenze((data || []).sort((a, b) => b.presenze_eventi.data.localeCompare(a.presenze_eventi.data))));
    supabase.from("recensioni_agente").select("*").eq("user_id", r.user_id).gte("data", dal).lte("data", al).order("data", { ascending: false })
      .then(({ data }) => setRecensioni(data || []));
  }, [r.user_id, dal, al]);

  return (
    <>
      <div className="aa-kpi">
        <div className="aa-kpi-box aa-kpi-forte"><span>Rating</span><strong>{p(r.rating)}</strong><small>{fascia(r.rating).nome} · <Stelle rating={r.rating} /></small></div>
        <div className="aa-kpi-box"><span>Fatturato</span><strong>{p(r.p_fatturato)}</strong><small>{euro(r.fatturato)}{r.obiettivo ? ` · obiettivo annuo ${euro(r.obiettivo)}` : " · obiettivo non impostato"}</small></div>
        <div className="aa-kpi-box"><span>Recensioni Google</span><strong>{p(r.p_recensioni)}</strong><small>{r.recensioni} nel periodo{r.stelle ? ` · media ${String(r.stelle).replace(".", ",")} ★` : ""}</small></div>
      </div>
      <h3 className="oo-h3">Presenze per tipo</h3>
      <table className="aa-tabella">
        <thead><tr><th>Tipo</th><th>Presente</th><th>Ritardo</th><th>Assente</th><th>Giustif.</th><th>Punti</th></tr></thead>
        <tbody>
          {TIPI.map((t) => { const x = r.presenze?.[t.id]; return (
            <tr key={t.id}><td>{t.nome}</td><td>{x?.presenti ?? 0}</td><td>{x?.ritardi ?? 0}</td><td>{x?.assenti ?? 0}</td><td>{x?.giustificati ?? 0}</td><td><strong>{p(x?.punti)}</strong></td></tr>
          ); })}
        </tbody>
      </table>
      {presenze.length > 0 && (
        <>
          <h3 className="oo-h3">Registro presenze</h3>
          <table className="aa-tabella">
            <thead><tr><th>Data</th><th>Evento</th><th>Esito</th></tr></thead>
            <tbody>{presenze.map((x, i) => (
              <tr key={i}><td>{dataBella(x.presenze_eventi.data)}</td><td>{x.presenze_eventi.titolo || NOME_TIPO[x.presenze_eventi.tipo]}</td>
                <td className={x.stato === "assente" ? "aa-testo-rosso" : ""}>{STATI.find((s) => s.id === x.stato)?.nome}{x.note ? ` · ${x.note}` : ""}</td></tr>
            ))}</tbody>
          </table>
        </>
      )}
      {recensioni.length > 0 && (
        <>
          <h3 className="oo-h3">Recensioni</h3>
          {recensioni.map((x) => <RecensioneCard key={x.id} x={x} />)}
        </>
      )}
    </>
  );
}

function RecensioneCard({ x, children }) {
  return (
    <div className="pr-recensione">
      <div><strong>{x.cliente || "Cliente"}</strong> · <span className="pr-stelle">{"★".repeat(x.stelle)}</span> · <small>{dataBella(x.data)} · {x.fonte === "google" ? "Google" : x.fonte}</small></div>
      {x.testo && <p>{x.testo}</p>}
      {children}
    </div>
  );
}

/* ================================================================ eventi e presenze */
function Eventi({ profilo }) {
  const isAdmin = profilo.ruolo === "admin";
  const [eventi, setEventi] = useState(null);
  const [persone, setPersone] = useState([]);
  const [aperto, setAperto] = useState(null);
  const [nuovo, setNuovo] = useState(false);
  const [ricarica, setRicarica] = useState(0);
  const [errore, setErrore] = useState("");
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    supabase.rpc("one_to_one_collaboratori").then(({ data }) => setPersone(data || []));
  }, []);
  useEffect(() => {
    const dal = iso(new Date(new Date().getFullYear() - 1, 0, 1));
    supabase.from("presenze_eventi").select("*, presenze(user_id, stato)").gte("data", dal).order("data", { ascending: false })
      .then(({ data, error }) => { if (error) setErrore(error.message); setEventi(data || []); });
  }, [ricarica]);

  if (eventi === null) return <div className="aa-spinner" aria-label="Caricamento" />;
  if (aperto) return <FoglioPresenze evento={eventi.find((e) => e.id === aperto)} persone={persone} profilo={profilo}
    indietro={() => { setAperto(null); setRicarica((n) => n + 1); }} />;

  const elenco = filtro ? eventi.filter((e) => e.tipo === filtro) : eventi;
  return (
    <>
      {nuovo ? <NuovoEvento profilo={profilo} onFatto={(id) => { setNuovo(false); setRicarica((n) => n + 1); if (id) setAperto(id); }} />
        : <div className="cp-azioni pr-azioni-sx"><button className="aa-btn aa-btn-pieno" onClick={() => setNuovo(true)}>+ Nuovo evento / riunione</button></div>}
      <section className="aa-card">
        <div className="aa-card-testa">
          <h2 className="aa-h2">Eventi e riunioni</h2>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Tipo">
            <option value="">Tutti i tipi</option>{TIPI.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>
        {errore && <p className="aa-errore">{errore}</p>}
        {!elenco.length ? <p>Nessun evento: crea la prima riunione con «Nuovo evento».</p> : (
          <div className="oo-scorri">
            <table className="aa-tabella aa-tabella-click">
              <thead><tr><th>Data</th><th>Evento</th><th>Per</th><th>Presenti</th><th>Assenti</th></tr></thead>
              <tbody>{elenco.map((e) => {
                const pr = e.presenze || [];
                return (
                  <tr key={e.id} onClick={() => setAperto(e.id)}>
                    <td>{dataBella(e.data)}</td>
                    <td><strong>{e.titolo || NOME_TIPO[e.tipo]}</strong>{e.titolo && <small className="oo-team"> · {NOME_TIPO[e.tipo]}</small>}</td>
                    <td>{e.team || "Tutto lo store"}</td>
                    <td>{pr.length ? pr.filter((x) => x.stato === "presente" || x.stato === "ritardo").length : <span className="oo-meno">da segnare</span>}</td>
                    <td>{pr.filter((x) => x.stato === "assente").length || ""}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
        {!isAdmin && <p className="aa-nota">Vedi tutti gli eventi; segni le presenze solo del tuo team.</p>}
      </section>
    </>
  );
}

function NuovoEvento({ profilo, onFatto }) {
  const isAdmin = profilo.ruolo === "admin";
  const oggi = iso(new Date());
  const [f, setF] = useState({ tipo: "settimanale", titolo: "", data: oggi, luogo: "", team: isAdmin ? "" : profilo.team || "", lunedi: false });
  const [salvo, setSalvo] = useState(false);
  const [errore, setErrore] = useState("");
  const metti = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const lunediDelMese = useMemo(() => {
    const d = new Date(f.data + "T12:00:00"); const out = [];
    for (let g = 1; g <= new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); g++) {
      const x = new Date(d.getFullYear(), d.getMonth(), g);
      if (x.getDay() === 1) out.push(iso(x));
    }
    return out;
  }, [f.data]);

  const salva = async () => {
    setSalvo(true); setErrore("");
    const date = f.tipo === "settimanale" && f.lunedi ? lunediDelMese : [f.data];
    const righe = date.map((d) => ({ tipo: f.tipo, titolo: f.titolo.trim(), data: d, luogo: f.luogo.trim(), team: f.team || null }));
    const { data, error } = await supabase.from("presenze_eventi").insert(righe).select("id");
    setSalvo(false);
    if (error) return setErrore(error.message);
    onFatto(righe.length === 1 ? data?.[0]?.id : null);
  };

  return (
    <section className="aa-card">
      <h2 className="aa-h2">Nuovo evento</h2>
      <div className="aa-griglia-campi">
        <label className="aa-campo"><span>Tipo</span>
          <select value={f.tipo} onChange={(e) => metti("tipo", e.target.value)}>{TIPI.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}</select></label>
        <label className="aa-campo"><span>Data</span><input type="date" value={f.data} onChange={(e) => metti("data", e.target.value)} /></label>
        <label className="aa-campo"><span>Titolo (facoltativo)</span><input value={f.titolo} maxLength={120} onChange={(e) => metti("titolo", e.target.value)} placeholder="es. Bootcamp Napoli novembre" /></label>
        <label className="aa-campo"><span>Luogo (facoltativo)</span><input value={f.luogo} maxLength={120} onChange={(e) => metti("luogo", e.target.value)} /></label>
        <label className="aa-campo"><span>Per chi</span>
          <select value={f.team} disabled={!isAdmin} onChange={(e) => metti("team", e.target.value)}>
            {isAdmin && <option value="">Tutto lo store</option>}
            {["Team Nigido", "Team Esposito"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select></label>
      </div>
      {f.tipo === "settimanale" && (
        <div className="aa-radio pr-lunedi"><label><input type="checkbox" checked={f.lunedi} onChange={(e) => metti("lunedi", e.target.checked)} />
          Crea tutti i lunedì del mese ({lunediDelMese.length}: {lunediDelMese.map((d) => Number(d.slice(8))).join(", ")})</label></div>
      )}
      {errore && <p className="aa-errore">{errore}</p>}
      <div className="cp-azioni">
        <button className="aa-btn" onClick={() => onFatto(null)}>Annulla</button>
        <button className="aa-btn aa-btn-pieno" disabled={salvo} onClick={salva}>Crea{f.tipo === "settimanale" && f.lunedi ? ` ${lunediDelMese.length} riunioni` : " e segna le presenze"}</button>
      </div>
    </section>
  );
}

function FoglioPresenze({ evento, persone, profilo, indietro }) {
  const isAdmin = profilo.ruolo === "admin";
  const convocabili = persone.filter((x) => !evento.team || x.team === evento.team);
  const [stati, setStati] = useState(null);       // { user_id: { stato, note } }; assente dalla mappa = non convocato
  const [salvo, setSalvo] = useState(false);
  const [esito, setEsito] = useState("");
  const [errore, setErrore] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("presenze").select("*").eq("evento_id", evento.id);
      const m = Object.fromEntries((data || []).map((r) => [r.user_id, { stato: r.stato, note: r.note }]));
      if (!data?.length) {
        // Prima volta: tutti presenti; per il One to One propongo l'esito dalla scheda del mese (chiusa dal coach = presente).
        let oo = {};
        if (evento.tipo === "one_to_one") {
          const { data: righe } = await supabase.from("one_to_one").select("user_id, inizio, coach_confermato_il").eq("mese", evento.data.slice(0, 8) + "01");
          oo = Object.fromEntries((righe || []).map((r) => [r.user_id, r.coach_confermato_il ? "presente" : "assente"]));
        }
        convocabili.forEach((x) => { m[x.user_id] = { stato: evento.tipo === "one_to_one" ? oo[x.user_id] || "assente" : "presente", note: "" }; });
      }
      setStati(m);
    })();
  }, [evento.id]);

  if (!stati) return <div className="aa-spinner" aria-label="Caricamento" />;
  const metti = (uid, k, v) => setStati((s) => ({ ...s, [uid]: { ...(s[uid] || { stato: "presente", note: "" }), [k]: v } }));
  const togli = (uid) => setStati((s) => { const c = { ...s }; delete c[uid]; return c; });
  const tutti = (stato) => setStati((s) => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, { ...v, stato }])));

  const salva = async () => {
    setSalvo(true); setErrore(""); setEsito("");
    const righe = Object.entries(stati).map(([user_id, v]) => ({ evento_id: evento.id, user_id, stato: v.stato, note: (v.note || "").trim().slice(0, 300) }));
    const { error } = righe.length ? await supabase.from("presenze").upsert(righe, { onConflict: "evento_id,user_id" }) : { error: null };
    const nonConv = convocabili.map((x) => x.user_id).filter((id) => !stati[id]);
    if (!error && nonConv.length) await supabase.from("presenze").delete().eq("evento_id", evento.id).in("user_id", nonConv);
    setSalvo(false);
    if (error) return setErrore(error.message);
    setEsito("Presenze salvate: il rating è già aggiornato.");
  };
  const elimina = async () => {
    if (!window.confirm("Eliminare l'evento e tutte le sue presenze?")) return;
    const { error } = await supabase.from("presenze_eventi").delete().eq("id", evento.id);
    if (error) return setErrore(error.message);
    indietro();
  };

  return (
    <>
      <button className="aa-link oo-indietro" onClick={indietro}>← Tutti gli eventi</button>
      <section className="aa-card">
        <div className="aa-card-testa">
          <h2 className="aa-h2">{evento.titolo || NOME_TIPO[evento.tipo]}</h2>
          <span className="aa-nota">{dataBella(evento.data)}{evento.luogo ? ` · ${evento.luogo}` : ""} · {evento.team || "Tutto lo store"}</span>
        </div>
        {evento.tipo === "one_to_one" && <p className="aa-nota">Proposta dalle schede One to One del mese: presente chi ha la scheda chiusa dal coach. Correggi se serve.</p>}
        <div className="pr-tutti">
          Segna tutti: {STATI.map((s) => <button key={s.id} className="aa-btn aa-btn-piccolo" onClick={() => tutti(s.id)}>{s.nome}</button>)}
        </div>
        <div className="oo-scorri">
          <table className="aa-tabella pr-foglio">
            <thead><tr><th>Collaboratore</th><th>Esito</th><th>Note</th><th /></tr></thead>
            <tbody>{convocabili.map((x) => {
              const v = stati[x.user_id];
              return (
                <tr key={x.user_id} className={v ? "" : "aa-riga-esclusa"}>
                  <td><strong>{x.nome}</strong>{x.team && <small className="oo-team"> · {x.team}</small>}</td>
                  <td>{v ? (
                    <div className="pr-stati">{STATI.map((s) => (
                      <button key={s.id} type="button" className={`pr-stato pr-stato-${s.id} ${v.stato === s.id ? "attivo" : ""}`} onClick={() => metti(x.user_id, "stato", s.id)}>{s.nome}</button>
                    ))}</div>) : <span className="oo-meno">non convocato</span>}</td>
                  <td>{v && <input value={v.note || ""} maxLength={300} placeholder="es. malattia" onChange={(e) => metti(x.user_id, "note", e.target.value)} />}</td>
                  <td>{v ? <button className="aa-link" onClick={() => togli(x.user_id)} title="Non era convocato">non convocato</button>
                    : <button className="aa-link" onClick={() => metti(x.user_id, "stato", "presente")}>convoca</button>}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
        {!isAdmin && evento.team !== profilo.team && <p className="aa-nota">Puoi segnare solo i collaboratori del tuo team.</p>}
        {errore && <p className="aa-errore">{errore}</p>}
        {esito && <p className="aa-nota oo-ok">{esito}</p>}
        <div className="cp-azioni">
          {(isAdmin || evento.creato_da === profilo.id) && <button className="aa-link aa-link-rosso" onClick={elimina}>Elimina evento</button>}
          <button className="aa-btn aa-btn-pieno" disabled={salvo} onClick={salva}>Salva presenze</button>
        </div>
      </section>
    </>
  );
}

/* ================================================================ recensioni */
function Recensioni({ profilo }) {
  const [lista, setLista] = useState(null);
  const [persone, setPersone] = useState([]);
  const [ricarica, setRicarica] = useState(0);
  const [msg, setMsg] = useState("");
  const [errore, setErrore] = useState("");
  const [leggo, setLeggo] = useState(false);
  const [f, setF] = useState({ user_id: "", data: iso(new Date()), fonte: "google", stelle: 5, cliente: "", testo: "" });

  useEffect(() => { supabase.rpc("one_to_one_collaboratori").then(({ data }) => setPersone(data || [])); }, []);
  useEffect(() => {
    supabase.from("recensioni_agente").select("*").order("data", { ascending: false }).limit(200)
      .then(({ data, error }) => { if (error) setErrore(error.message); setLista(data || []); });
  }, [ricarica]);

  const nomeDi = (id) => persone.find((x) => x.user_id === id)?.nome || (id === profilo.id ? profilo.nome : "—");
  const leggiOra = async () => {
    setLeggo(true); setMsg(""); setErrore("");
    const { data, error } = await supabase.functions.invoke("recensioni-google", { body: {} });
    setLeggo(false);
    if (error || data?.errore) return setErrore(data?.errore || "Google non risponde: riprova tra poco.");
    setMsg(data.nuove ? `${data.nuove} nuove recensioni lette: ${data.assegnate} assegnate, ${data.da_assegnare} da assegnare.` : "Nessuna recensione nuova su Google.");
    setRicarica((n) => n + 1);
  };
  const assegna = async (r, uid) => {
    if (!uid) return;
    const { error } = await supabase.from("recensioni_agente").update({ user_id: uid, candidati: [] }).eq("id", r.id);
    if (error) return setErrore(error.message);
    setRicarica((n) => n + 1);
  };
  const elimina = async (r) => {
    if (!window.confirm("Eliminare questa recensione dal rating?")) return;
    const { error } = await supabase.from("recensioni_agente").delete().eq("id", r.id);
    if (error) return setErrore(error.message);
    setRicarica((n) => n + 1);
  };
  const aggiungi = async () => {
    setErrore("");
    if (!f.user_id) return setErrore("Scegli il collaboratore.");
    const { error } = await supabase.from("recensioni_agente").insert({ ...f, stelle: Number(f.stelle), cliente: f.cliente.trim(), testo: f.testo.trim() });
    if (error) return setErrore(error.message);
    setF((x) => ({ ...x, cliente: "", testo: "" })); setMsg("Recensione aggiunta."); setRicarica((n) => n + 1);
  };

  if (lista === null) return <div className="aa-spinner" aria-label="Caricamento" />;
  const ambigue = lista.filter((r) => !r.user_id);
  const assegnate = lista.filter((r) => r.user_id);
  return (
    <>
      <section className="aa-card">
        <div className="aa-card-testa">
          <h2 className="aa-h2">Recensioni Google</h2>
          <button className="aa-btn aa-btn-piccolo" disabled={leggo} onClick={leggiOra}>{leggo ? "Leggo…" : "Leggi ora da Google"}</button>
        </div>
        <p className="aa-nota">Ogni recensione Google che cita un collaboratore per nome entra da sola nel suo rating (controllo ogni 6 ore).
          Se il nome è di più persone (es. due «Angela»), la recensione resta qui sotto da assegnare.</p>
        {msg && <p className="aa-nota oo-ok">{msg}</p>}
        {errore && <p className="aa-errore">{errore}</p>}
        {ambigue.length > 0 && (
          <>
            <h3 className="oo-h3">Da assegnare ({ambigue.length})</h3>
            {ambigue.map((r) => (
              <RecensioneCard key={r.id} x={r}>
                <div className="pr-assegna">
                  <select defaultValue="" onChange={(e) => assegna(r, e.target.value)} aria-label="Assegna a">
                    <option value="">Assegna a…</option>
                    {(r.candidati?.length ? persone.filter((x) => r.candidati.includes(x.user_id)) : persone).map((x) => <option key={x.user_id} value={x.user_id}>{x.nome}</option>)}
                    {r.candidati?.length > 0 && <option disabled>──────</option>}
                    {r.candidati?.length > 0 && persone.filter((x) => !r.candidati.includes(x.user_id)).map((x) => <option key={x.user_id} value={x.user_id}>{x.nome}</option>)}
                  </select>
                  <button className="aa-link aa-link-rosso" onClick={() => elimina(r)}>Non è di un agente</button>
                </div>
              </RecensioneCard>
            ))}
          </>
        )}
        <h3 className="oo-h3">Assegnate</h3>
        {!assegnate.length ? <p>Ancora nessuna recensione assegnata.</p> : assegnate.map((r) => (
          <RecensioneCard key={r.id} x={r}>
            <div className="pr-assegna"><span>→ <strong>{nomeDi(r.user_id)}</strong></span>
              <button className="aa-link aa-link-rosso" onClick={() => elimina(r)}>Elimina</button></div>
          </RecensioneCard>
        ))}
      </section>

      <section className="aa-card">
        <h2 className="aa-h2">Aggiungi una recensione a mano</h2>
        <p className="aa-nota">Per recensioni Google più vecchie o arrivate da altri portali.</p>
        <div className="aa-griglia-campi">
          <label className="aa-campo"><span>Collaboratore</span>
            <select value={f.user_id} onChange={(e) => setF({ ...f, user_id: e.target.value })}>
              <option value="">Scegli…</option>{persone.map((x) => <option key={x.user_id} value={x.user_id}>{x.nome}</option>)}
            </select></label>
          <label className="aa-campo"><span>Data</span><input type="date" value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} /></label>
          <label className="aa-campo"><span>Fonte</span>
            <select value={f.fonte} onChange={(e) => setF({ ...f, fonte: e.target.value })}>
              <option value="google">Google</option><option value="immobiliare">Immobiliare.it</option><option value="idealista">Idealista</option><option value="altro">Altro</option>
            </select></label>
          <label className="aa-campo"><span>Stelle</span>
            <select value={f.stelle} onChange={(e) => setF({ ...f, stelle: e.target.value })}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}</select></label>
          <label className="aa-campo"><span>Cliente</span><input value={f.cliente} maxLength={120} onChange={(e) => setF({ ...f, cliente: e.target.value })} /></label>
        </div>
        <label className="aa-campo aa-campo-largo"><span>Testo (facoltativo)</span>
          <textarea className="aa-textarea" rows={3} value={f.testo} maxLength={4000} onChange={(e) => setF({ ...f, testo: e.target.value })} /></label>
        <div className="cp-azioni"><button className="aa-btn aa-btn-pieno" onClick={aggiungi}>Aggiungi</button></div>
      </section>
    </>
  );
}

/* ================================================================ pesi (admin) */
function Pesi() {
  const [imp, setImp] = useState(null);
  const [esito, setEsito] = useState("");
  const [errore, setErrore] = useState("");
  useEffect(() => {
    supabase.from("rating_impostazioni").select("*").eq("id", 1).maybeSingle().then(({ data, error }) => { if (error) setErrore(error.message); setImp(data); });
  }, []);
  if (!imp) return errore ? <p className="aa-errore">{errore}</p> : <div className="aa-spinner" aria-label="Caricamento" />;
  const totale = VOCI_PESO.reduce((s, v) => s + (Number(imp.pesi[v.id]) || 0), 0);
  const salva = async () => {
    setErrore(""); setEsito("");
    const pesi = Object.fromEntries(VOCI_PESO.map((v) => [v.id, Math.max(0, Number(imp.pesi[v.id]) || 0)]));
    const { error } = await supabase.from("rating_impostazioni").update({ pesi, recensioni_mese: Math.max(0, Number(imp.recensioni_mese) || 0) }).eq("id", 1);
    if (error) return setErrore(error.message);
    setEsito("Pesi salvati: la classifica è già ricalcolata.");
  };
  return (
    <section className="aa-card">
      <h2 className="aa-h2">Pesi del rating</h2>
      <p className="aa-nota">Quanto conta ogni voce. Non serve che il totale faccia 100: il rating è sempre in centesimi. Peso 0 = la voce non conta.</p>
      <table className="aa-tabella aa-tabella-edit pr-pesi">
        <thead><tr><th>Voce</th><th>Peso</th><th>Quota</th></tr></thead>
        <tbody>{VOCI_PESO.map((v) => (
          <tr key={v.id}><td>{v.nome}</td>
            <td><input type="number" min="0" max="100" value={imp.pesi[v.id] ?? 0} onChange={(e) => setImp({ ...imp, pesi: { ...imp.pesi, [v.id]: e.target.value } })} /></td>
            <td>{totale ? Math.round(((Number(imp.pesi[v.id]) || 0) / totale) * 100) : 0}%</td></tr>
        ))}</tbody>
      </table>
      <label className="aa-campo pr-obiettivo"><span>Obiettivo recensioni al mese per agente</span>
        <input type="number" min="0" step="0.5" value={imp.recensioni_mese} onChange={(e) => setImp({ ...imp, recensioni_mese: e.target.value })} /></label>
      <p className="aa-nota">Punti recensioni: metà per il numero rispetto all'obiettivo, metà per la media delle stelle. Fatturato: incassato come produttore nel periodo rispetto all'obiettivo annuo (dalla «Mia giornata») in proporzione ai giorni, massimo 100.</p>
      {errore && <p className="aa-errore">{errore}</p>}
      {esito && <p className="aa-nota oo-ok">{esito}</p>}
      <div className="cp-azioni"><button className="aa-btn aa-btn-pieno" onClick={salva}>Salva</button></div>
    </section>
  );
}
