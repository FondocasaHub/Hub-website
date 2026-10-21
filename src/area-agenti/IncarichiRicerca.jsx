import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Incarico di ricerca immobiliare in esclusiva (Buyer Agent) — versione online
// del modulo FC Punto Hub: scheda Cercacasa, condizioni, firme e registro delle
// lavorazioni con data ed esito. Lo vedono l'autore, il Manager del team e lo Store Manager.

const PROVVIGIONE = "4% (quattro per cento) + IVA";
const PENALE = "50% (cinquanta per cento)";

const TIPOLOGIE = ["Appartamento", "Attico", "Villa / Villino", "Casa indipendente", "Loft"];
const DESTINAZIONI = ["Prima casa", "Seconda casa", "Investimento / reddito", "Uso professionale"];
const PIANI = ["Terra / Rialzato", "Intermedio", "Alto", "Ultimo / Attico", "Escludere piano terra"];
const NECESSITA = ["Indispensabile", "Preferibile", "Non necessario"];
const ASCENSORE = ["Indispensabile", "Preferibile", "Indifferente"];
const ESTERNI = ["Balcone", "Terrazzo", "Giardino", "Cantina", "Portineria", "Vista / Panorama"];
const STATI_IMM = ["Nuovo / Ristrutturato", "Buono", "Da ristrutturare"];
const TEMPISTICHE = ["Entro 3 mesi", "Da 3 a 6 mesi", "Oltre 6 mesi"];
const SINO = ["Sì", "No"];
const CONSENSO = ["Acconsento", "Non acconsento"];

export const STATI = [
  ["attivo", "Attivo"], ["concluso", "Concluso con acquisto"], ["scaduto", "Scaduto"], ["revocato", "Revocato / receduto"],
];
const nomeStato = (s) => (STATI.find(([k]) => k === s) || [s, s])[1];

export const ATTIVITA = [
  "Firma incarico", "Ricerca e selezione", "Invio proposte immobili", "Contatto telefonico", "Visita", "Seconda visita",
  "Verifica documentale", "Consulenza mutuo WeUnit", "Proposta d'acquisto", "Accettazione proposta", "Preliminare", "Rogito", "Altro",
];
export const ESITI = ["Positivo", "Negativo", "In attesa", "Da ricontattare"];

export const CLAUSOLE = [
  ["Oggetto", "Il Committente conferisce al Mediatore, che accetta, l'incarico di ricercare e proporre un immobile corrispondente alle caratteristiche indicate nella Scheda Cercacasa, che costituisce parte integrante del presente incarico. Le caratteristiche sono indicative: il Mediatore potrà proporre anche immobili che se ne discostino in misura ragionevole, che il Committente resta libero di non visitare."],
  ["Esclusiva e durata", "L'incarico è conferito in esclusiva per 6 (sei) mesi dalla data di sottoscrizione e cessa alla scadenza senza tacito rinnovo. Per tutta la durata il Committente si impegna a non conferire incarichi di ricerca analoghi ad altri mediatori e a indirizzare al Mediatore ogni immobile rispondente alla Scheda di cui venga a conoscenza (annunci, portali, privati), affinché il Mediatore ne curi verifiche e trattativa."],
  ["Provvigione", `Il Committente riconosce al Mediatore una provvigione pari al ${PROVVIGIONE} del prezzo di acquisto, che matura ed è esigibile all'accettazione della proposta d'acquisto, momento in cui l'affare si intende concluso (art. 1755 c.c.), e va corrisposta al momento in cui il Committente ha conoscenza di tale accettazione. La provvigione è dovuta anche se l'acquisto di un immobile presentato o segnalato dal Mediatore durante l'incarico avviene entro 12 mesi dalla scadenza, o è effettuato dal coniuge, da parenti entro il secondo grado o da società riconducibili al Committente.`],
  ["Impegni del Mediatore", "Ricerca attiva su banca dati FondoCasa, rete di agenzie, portali e contatti diretti con proprietari; selezione e invio di proposte coerenti con la Scheda; organizzazione e accompagnamento alle visite; verifiche preliminari di provenienza, ipotecarie, catastali e di conformità di massima; assistenza nella trattativa, nella redazione della proposta d'acquisto e fino al rogito; comunicazione delle circostanze note relative alla valutazione e alla sicurezza dell'affare (art. 1759 c.c.)."],
  ["Impegni del Committente", "Fornire informazioni veritiere, in particolare su capacità di spesa e finanziamento; comunicare tempestivamente ogni variazione delle esigenze; non contattare direttamente i proprietari degli immobili proposti dal Mediatore e non concludere l'acquisto senza il suo tramite."],
  ["Penale", `In caso di violazione dell'esclusiva (art. 2) o di acquisto, durante l'incarico, di un immobile rispondente alla Scheda senza il tramite del Mediatore, il Committente corrisponderà a titolo di penale una somma pari al ${PENALE} della provvigione pattuita all'art. 3, calcolata sul prezzo di acquisto dell'immobile o, in mancanza, sul budget massimo indicato nella Scheda Cercacasa.`],
  ["Riservatezza", "La ricerca è condotta in forma riservata: il Mediatore non rivela a proprietari o terzi l'identità del Committente, la sua capacità di spesa e le condizioni di finanziamento, se non nella misura strettamente necessaria alla trattativa e, per l'identità, solo al momento della presentazione della proposta d'acquisto."],
  ["Recesso del consumatore", "Se l'incarico è sottoscritto fuori dai locali commerciali del Mediatore o a distanza, il Committente consumatore può recedere senza penali entro 14 giorni dalla sottoscrizione (artt. 52 e ss. D.Lgs. 206/2005), con comunicazione via PEC o raccomandata A.R."],
  ["Trattamento dei dati personali", "Il Committente dichiara di aver ricevuto l'informativa ex art. 13 Reg. UE 2016/679 (GDPR). Titolare del trattamento è FC Punto Hub S.r.l. I dati sono trattati per l'esecuzione dell'incarico e per obblighi di legge (inclusa la normativa antiriciclaggio, D.Lgs. 231/2007), conservati per il tempo necessario a tali finalità e non diffusi. I diritti di cui agli artt. 15–22 GDPR sono esercitabili scrivendo a na.vomero@fondocasa.it o fcpuntohub@pec.it."],
  ["Comunicazioni e foro", "Le comunicazioni sono validamente effettuate agli indirizzi email/PEC indicati nel presente incarico. Per ogni controversia è competente il foro di residenza del Committente, se consumatore; negli altri casi il Foro di Napoli."],
];
const APPROVAZIONE = "Ai sensi e per gli effetti degli artt. 1341 e 1342 c.c. il Committente dichiara di aver letto e di approvare specificamente le clausole: 2 (esclusiva e durata), 3 (provvigione anche dopo la scadenza e per acquisti di familiari o società collegate), 5 (divieto di trattativa diretta), 6 (penale), 10 (foro competente).";

const oggi = () => new Date().toISOString().slice(0, 10);
export const dataIT = (iso) => (iso ? new Date(iso + (iso.length === 10 ? "T12:00" : "")).toLocaleDateString("it-IT") : "");
const piuSeiMesi = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T12:00"); d.setMonth(d.getMonth() + 6);
  return d.toISOString().slice(0, 10);
};
const giorniA = (iso) => (iso ? Math.round((new Date(iso + "T12:00") - new Date(oggi() + "T12:00")) / 86400000) : null);

function Scadenza({ r }) {
  if (r.stato !== "attivo" || !r.scadenza) return <span className="aa-nota">{r.scadenza ? dataIT(r.scadenza) : "—"}</span>;
  const g = giorniA(r.scadenza);
  const cls = g < 0 ? "aa-ir-tag aa-ir-rosso" : g <= 30 ? "aa-ir-tag aa-ir-ambra" : "aa-ir-tag";
  return <span className={cls}>{dataIT(r.scadenza)}{g < 0 ? " · scaduto" : g <= 30 ? ` · ${g} gg` : ""}</span>;
}

/* ---------------- Elenco ---------------- */
export function ElencoIncarichiRicerca({ profilo, vai }) {
  const [lista, setLista] = useState(null);
  const [cerca, setCerca] = useState("");
  const [filtro, setFiltro] = useState("attivo");
  useEffect(() => {
    supabase.from("incarichi_ricerca").select("id, aggiornato_il, committente, telefono, data_firma, scadenza, stato, team, creato_da, creato_da_nome, dati")
      .order("aggiornato_il", { ascending: false }).then(({ data }) => setLista(data || []));
  }, []);
  const nuovo = async () => {
    const { data, error } = await supabase.from("incarichi_ricerca").insert({ committente: "", data_firma: oggi() }).select("id").single();
    if (error) return alert(error.message);
    vai(`incarichi-ricerca/${data.id}`);
  };
  const q = cerca.toLowerCase();
  const visibili = (lista || []).filter((r) => (!filtro || r.stato === filtro)
    && (!q || `${r.committente} ${r.creato_da_nome} ${(r.dati?.zone || []).map((z) => `${z.zona} ${z.via}`).join(" ")}`.toLowerCase().includes(q)));
  return (
    <>
      <button className="aa-link" onClick={() => vai("documenti")}>← Documenti › Agenti › BUYER AGENT</button>
      <div className="aa-intestazione aa-intestazione-azione">
        <div>
          <p className="aa-occhiello">Buyer Agent · Acquirenti</p>
          <h1 className="aa-titolo">Incarichi di ricerca immobiliare</h1>
          <p className="aa-sottotitolo">Incarico in esclusiva per 6 mesi, provvigione 4% + IVA. Compila la scheda Cercacasa con il cliente, registra ogni lavorazione con data ed esito, stampalo o salvalo in PDF.</p>
        </div>
        <button className="aa-btn aa-btn-pieno" onClick={nuovo}>+ Nuovo incarico</button>
      </div>
      <section className="aa-card">
        <div className="aa-form aa-form-riga" style={{ marginBottom: 12 }}>
          <label>Stato
            <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="">Tutti</option>
              {STATI.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
            </select>
          </label>
          <input className="aa-cerca" placeholder="Cerca per cliente, zona, via o agente…" value={cerca} onChange={(e) => setCerca(e.target.value)} />
        </div>
        {lista === null ? <p className="aa-nota">Caricamento…</p> : visibili.length === 0 ? <p className="aa-nota">{lista.length ? "Nessun incarico con questi filtri." : "Nessun incarico di ricerca: crea il primo."}</p> : (
          <div className="aa-scorri">
            <table className="aa-tabella aa-tabella-click">
              <thead><tr><th>Committente</th><th>Zone</th><th>Budget max</th><th>Firma</th><th>Scadenza</th><th>Ultima lavorazione</th><th>Agente</th></tr></thead>
              <tbody>
                {visibili.map((r) => {
                  const lav = ultimaLavorazione(r.dati);
                  return (
                    <tr key={r.id} onClick={() => vai(`incarichi-ricerca/${r.id}`)}>
                      <td><strong>{r.committente || "Senza nome"}</strong><br /><small className="aa-nota">{nomeStato(r.stato)}</small></td>
                      <td>{(r.dati?.zone || []).map((z) => z.zona).filter(Boolean).join(", ") || "—"}</td>
                      <td>{r.dati?.budget?.max ? `€ ${r.dati.budget.max}` : "—"}</td>
                      <td>{dataIT(r.data_firma)}</td>
                      <td><Scadenza r={r} /></td>
                      <td>{lav ? <>{dataIT(lav.data)} · {lav.attivita}<br /><small className="aa-nota">{lav.esito || ""}</small></> : "—"}</td>
                      <td>{r.creato_da === profilo.id ? "Tu" : r.creato_da_nome}<br /><small className="aa-nota">{r.team || ""}</small></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

const ultimaLavorazione = (d) => {
  const l = (d?.lavorazioni || []).filter((x) => x.data || x.attivita);
  if (!l.length) return null;
  return [...l].sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")))[0];
};

/* ---------------- Scheda ---------------- */
const Campo = ({ label, value, onChange, largo, tipo = "text", ph }) => (
  <label className={`aa-campo${largo ? " aa-campo-largo" : ""}`}>
    <span>{label}</span>
    {largo ? <textarea rows={2} value={value || ""} onChange={(e) => onChange(e.target.value)} />
      : <input type={tipo} value={value || ""} placeholder={ph} onChange={(e) => onChange(e.target.value)} />}
  </label>
);

const Spunte = ({ label, voci, sel = [], onChange }) => (
  <div className="aa-campo aa-campo-largo"><span>{label}</span>
    <div className="aa-radio">
      {voci.map((v) => (
        <label key={v}><input type="checkbox" checked={sel.includes(v)}
          onChange={() => onChange(sel.includes(v) ? sel.filter((x) => x !== v) : [...sel, v])} />{v}</label>
      ))}
    </div>
  </div>
);

const Scelta = ({ label, voci, valore, onChange, nome, largo = true }) => (
  <div className={`aa-campo${largo ? " aa-campo-largo" : ""}`}><span>{label}</span>
    <div className="aa-radio">
      {voci.map((v) => (
        <label key={v}><input type="radio" name={nome} checked={valore === v}
          onChange={() => onChange(valore === v ? "" : v)} onClick={() => valore === v && onChange("")} />{v}</label>
      ))}
    </div>
  </div>
);

const Spunta = ({ label, valore, onChange }) => (
  <label className="aa-spunta-grande aa-campo-largo" style={{ display: "flex", gap: 10, alignItems: "center" }}>
    <input type="checkbox" checked={!!valore} onChange={(e) => onChange(e.target.checked)} />
    <span>{label}</span>
  </label>
);

const RIGA_ZONA = () => ({ zona: "", via: "", note: "" });
const RIGA_LAV = () => ({ data: oggi(), attivita: "", immobile: "", esito: "", note: "" });

export function SchedaIncaricoRicerca({ id, profilo, vai }) {
  const [r, setR] = useState(undefined);
  const [msg, setMsg] = useState({ testo: "", errore: false });
  const [salvando, setSalvando] = useState(false);
  const [modificata, setModificata] = useState(false);
  const [condizioni, setCondizioni] = useState(false);

  const carica = async () => {
    const { data } = await supabase.from("incarichi_ricerca").select("*").eq("id", id).maybeSingle();
    setR(data); setModificata(false);
  };
  useEffect(() => { carica(); }, [id]);
  useEffect(() => {
    if (!modificata) return;
    const avvisa = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", avvisa);
    return () => window.removeEventListener("beforeunload", avvisa);
  }, [modificata]);

  if (r === undefined) return <p className="aa-nota">Caricamento…</p>;
  if (r === null) return <section className="aa-card"><p>Incarico non trovato.</p><button className="aa-btn" onClick={() => vai("incarichi-ricerca")}>Torna all'elenco</button></section>;

  const d = r.dati || {};
  const set = (k, v) => { setR({ ...r, [k]: v }); setModificata(true); };
  const setD = (gruppo, k, v) => set("dati", { ...d, [gruppo]: { ...(d[gruppo] || {}), [k]: v } });
  const setDiretto = (k, v) => set("dati", { ...d, [k]: v });
  const c = d.committente || {};
  const m = d.mediatore || {};
  const im = d.immobile || {};
  const b = d.budget || {};
  const cn = d.condizioni || {};
  const zone = d.zone && d.zone.length ? d.zone : [RIGA_ZONA(), RIGA_ZONA(), RIGA_ZONA()];
  const lav = d.lavorazioni || [];
  const setZona = (i, k, v) => setDiretto("zone", zone.map((z, j) => (j === i ? { ...z, [k]: v } : z)));
  const setLav = (i, k, v) => setDiretto("lavorazioni", lav.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const mostra = (testo, errore = false) => setMsg({ testo, errore });
  const nomeComm = (c.nome || "").trim();

  const salva = async () => {
    if (!nomeComm) { mostra("Inserisci cognome e nome del committente.", true); return false; }
    setSalvando(true);
    const { error } = await supabase.from("incarichi_ricerca").update({
      committente: nomeComm, telefono: c.telefono || null, data_firma: r.data_firma || null, stato: r.stato, dati: d,
    }).eq("id", r.id);
    setSalvando(false);
    if (error) { mostra(error.message, true); return false; }
    await carica(); mostra("Incarico salvato."); return true;
  };
  const stampa = async () => {
    const w = window.open("", "_blank"); // aperta subito, sul clic, così il browser non la blocca
    if (modificata && !(await salva())) { if (w) w.close(); return; }
    stampaIncarico({ ...r, committente: nomeComm || r.committente }, w);
  };
  const elimina = async () => {
    if (!window.confirm(`Eliminare l'incarico di ${r.committente || "questo cliente"}?`)) return;
    const { error } = await supabase.from("incarichi_ricerca").delete().eq("id", r.id);
    if (error) return mostra(error.message, true);
    vai("incarichi-ricerca");
  };
  const puoEliminare = profilo.ruolo === "admin" || r.creato_da === profilo.id;

  return (
    <>
      <button className="aa-link" onClick={() => vai("incarichi-ricerca")}>← Tutti gli incarichi di ricerca</button>
      <div className="aa-intestazione aa-intestazione-azione">
        <div>
          <p className="aa-occhiello">Incarico di ricerca · {r.team || "senza team"} · {r.creato_da === profilo.id ? "compilato da te" : `compilato da ${r.creato_da_nome}`}</p>
          <h1 className="aa-titolo">{nomeComm || "Nuovo incarico di ricerca"}</h1>
          <p className="aa-sottotitolo">Esclusiva 6 mesi · firma {dataIT(r.data_firma) || "—"} · scadenza {dataIT(piuSeiMesi(r.data_firma)) || "—"} · {nomeStato(r.stato)}</p>
        </div>
        <button className="aa-btn" onClick={stampa}>Stampa / Salva PDF</button>
      </div>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2">Incarico</h2>
        <div className="aa-griglia-campi">
          <Campo label="Protocollo n." value={d.prot} onChange={(v) => setDiretto("prot", v)} />
          <Campo label="Data di sottoscrizione" tipo="date" value={r.data_firma} onChange={(v) => set("data_firma", v)} />
          <div className="aa-campo"><span>Scadenza esclusiva (6 mesi)</span><div className="aa-vl-calc">{dataIT(piuSeiMesi(r.data_firma)) || "—"}</div></div>
          <label className="aa-campo"><span>Stato</span>
            <select value={r.stato} onChange={(e) => set("stato", e.target.value)}>
              {STATI.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2"><span className="aa-sezione-n">1</span>Il Committente</h2>
        <div className="aa-griglia-campi">
          <Campo label="Cognome e Nome *" value={c.nome} onChange={(v) => setD("committente", "nome", v)} />
          <Campo label="Codice Fiscale" value={c.cf} onChange={(v) => setD("committente", "cf", v.toUpperCase())} />
          <Campo label="Documento n." value={c.documento} onChange={(v) => setD("committente", "documento", v)} />
          <Campo label="Nato/a a" value={c.nato_a} onChange={(v) => setD("committente", "nato_a", v)} />
          <Campo label="il" tipo="date" value={c.nato_il} onChange={(v) => setD("committente", "nato_il", v)} />
          <Campo label="Telefono" tipo="tel" value={c.telefono} onChange={(v) => setD("committente", "telefono", v)} />
          <Campo label="Residente in (via, n., città)" largo value={c.residenza} onChange={(v) => setD("committente", "residenza", v)} />
          <Campo label="Email / PEC" tipo="email" value={c.email} onChange={(v) => setD("committente", "email", v)} />
          <Campo label="Eventuale cointestatario" value={c.coint_nome} onChange={(v) => setD("committente", "coint_nome", v)} />
          <Campo label="Codice Fiscale cointestatario" value={c.coint_cf} onChange={(v) => setD("committente", "coint_cf", v.toUpperCase())} />
        </div>
      </section>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2"><span className="aa-sezione-n">2</span>Il Mediatore</h2>
        <p className="aa-nota">FC PUNTO HUB S.R.L. – brand FondoCasa Hub – sede operativa Via Pietro Mascagni 35, Napoli – P.IVA 01924140096 – PEC fcpuntohub@pec.it</p>
        <div className="aa-griglia-campi">
          <Campo label="Agente incaricato" value={m.agente ?? profilo.nome} onChange={(v) => setD("mediatore", "agente", v)} />
          <Campo label="Iscritto REA n." value={m.rea} onChange={(v) => setD("mediatore", "rea", v)} />
          <Campo label="CCIAA di" value={m.cciaa} onChange={(v) => setD("mediatore", "cciaa", v)} />
          <Campo label="Polizza RC professionale n." value={m.polizza} onChange={(v) => setD("mediatore", "polizza", v)} />
          <Campo label="Compagnia" value={m.compagnia} onChange={(v) => setD("mediatore", "compagnia", v)} />
        </div>
      </section>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2"><span className="aa-sezione-n">3</span>Scheda Cercacasa – l'immobile ricercato</h2>
        <div className="aa-griglia-campi">
          <Spunte label="Tipologia" voci={TIPOLOGIE} sel={im.tipologia} onChange={(v) => setD("immobile", "tipologia", v)} />
          <Campo label="Altra tipologia" value={im.tipologia_altro} onChange={(v) => setD("immobile", "tipologia_altro", v)} />
          <Spunte label="Destinazione" voci={DESTINAZIONI} sel={im.destinazione} onChange={(v) => setD("immobile", "destinazione", v)} />
          <Campo label="Vani n." value={im.vani} onChange={(v) => setD("immobile", "vani", v)} />
          <Campo label="Camere" value={im.camere} onChange={(v) => setD("immobile", "camere", v)} />
          <Campo label="Bagni" value={im.bagni} onChange={(v) => setD("immobile", "bagni", v)} />
          <Campo label="Superficie mq da" value={im.mq_da} onChange={(v) => setD("immobile", "mq_da", v)} />
          <Campo label="Superficie mq a" value={im.mq_a} onChange={(v) => setD("immobile", "mq_a", v)} />
          <Spunte label="Piano" voci={PIANI} sel={im.piano} onChange={(v) => setD("immobile", "piano", v)} />
          <Scelta label="Ascensore" nome={`asc-${r.id}`} voci={ASCENSORE} valore={im.ascensore} onChange={(v) => setD("immobile", "ascensore", v)} />
          <Scelta label="Posto auto" nome={`pa-${r.id}`} voci={NECESSITA} valore={im.posto_auto} onChange={(v) => setD("immobile", "posto_auto", v)} />
          <Campo label="Posto auto: coperto / scoperto" value={im.posto_auto_tipo} onChange={(v) => setD("immobile", "posto_auto_tipo", v)} />
          <Scelta label="Box auto" nome={`box-${r.id}`} voci={NECESSITA} valore={im.box} onChange={(v) => setD("immobile", "box", v)} />
          <Campo label="Box: mq min." value={im.box_mq} onChange={(v) => setD("immobile", "box_mq", v)} />
          <Campo label="Box: n." value={im.box_n} onChange={(v) => setD("immobile", "box_n", v)} />
          <Spunte label="Spazi esterni" voci={ESTERNI} sel={im.esterni} onChange={(v) => setD("immobile", "esterni", v)} />
          <Spunte label="Stato" voci={STATI_IMM} sel={im.stato} onChange={(v) => setD("immobile", "stato", v)} />
          <Campo label="Classe energetica min." value={im.classe} onChange={(v) => setD("immobile", "classe", v)} />
          <Campo label="Altre esigenze (esposizione, riscaldamento, accessibilità…)" largo value={im.altre} onChange={(v) => setD("immobile", "altre", v)} />
        </div>
      </section>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2"><span className="aa-sezione-n">4</span>Zone e vie preferite</h2>
        <div className="aa-scorri">
          <table className="aa-tabella aa-vl-tab">
            <thead><tr><th>Priorità</th><th>Zona / Quartiere</th><th>Via / Strada preferita</th><th>Note (tratto, palazzi, vicinanze)</th></tr></thead>
            <tbody>
              {zone.map((z, i) => (
                <tr key={i}>
                  <td>{i + 1}ª scelta</td>
                  <td><input className="aa-vl-in" value={z.zona || ""} onChange={(e) => setZona(i, "zona", e.target.value)} /></td>
                  <td><input className="aa-vl-in" value={z.via || ""} onChange={(e) => setZona(i, "via", e.target.value)} /></td>
                  <td><input className="aa-vl-in aa-vl-largo" value={z.note || ""} onChange={(e) => setZona(i, "note", e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="aa-btn aa-btn-piccolo" onClick={() => setDiretto("zone", [...zone, RIGA_ZONA()])}>+ Aggiungi zona</button>
        <div className="aa-griglia-campi" style={{ marginTop: 14 }}>
          <Campo label="Zone / vie da escludere" largo value={d.zone_escluse} onChange={(v) => setDiretto("zone_escluse", v)} />
        </div>
      </section>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2"><span className="aa-sezione-n">5</span>Budget, mutuo e vendita dell'attuale abitazione</h2>
        <div className="aa-griglia-campi">
          <Campo label="Budget massimo €" value={b.max} onChange={(v) => setD("budget", "max", v)} />
          <Campo label="Budget ideale €" value={b.ideale} onChange={(v) => setD("budget", "ideale", v)} />
          <Campo label="Di cui liquidità propria €" value={b.liquidita} onChange={(v) => setD("budget", "liquidita", v)} />
          <Scelta label="Mutuo" nome={`mut-${r.id}`} voci={SINO} valore={b.mutuo} onChange={(v) => setD("budget", "mutuo", v)} />
          {b.mutuo === "Sì" && <>
            <Campo label="Importo mutuo €" value={b.mutuo_importo} onChange={(v) => setD("budget", "mutuo_importo", v)} />
            <Campo label="Durata anni" value={b.mutuo_durata} onChange={(v) => setD("budget", "mutuo_durata", v)} />
            <Campo label="Banca / Note" value={b.banca} onChange={(v) => setD("budget", "banca", v)} />
            <Spunta label="Pre-delibera già ottenuta" valore={b.predelibera} onChange={(v) => setD("budget", "predelibera", v)} />
            <Spunta label="Richiede consulenza creditizia WeUnit (OAM M28)" valore={b.weunit} onChange={(v) => setD("budget", "weunit", v)} />
          </>}
          <Scelta label="Vendita dell'attuale abitazione" nome={`ven-${r.id}`} voci={SINO} valore={b.vendita} onChange={(v) => setD("budget", "vendita", v)} />
          {b.vendita === "Sì" && <>
            <Campo label="Indirizzo immobile da vendere" value={b.vendita_indirizzo} onChange={(v) => setD("budget", "vendita_indirizzo", v)} />
            <Campo label="Valore stimato €" value={b.vendita_valore} onChange={(v) => setD("budget", "vendita_valore", v)} />
            <Spunta label="Incarico di vendita conferito a FC Punto Hub" valore={b.incarico_vendita} onChange={(v) => setD("budget", "incarico_vendita", v)} />
          </>}
          <Scelta label="Tempistica" nome={`tem-${r.id}`} voci={TEMPISTICHE} valore={b.tempistica} onChange={(v) => setD("budget", "tempistica", v)} />
          <Campo label="Rogito desiderato entro" value={b.rogito_entro} onChange={(v) => setD("budget", "rogito_entro", v)} />
        </div>
      </section>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2">Condizioni, recesso e privacy</h2>
        <p className="aa-nota">Provvigione {PROVVIGIONE} sul prezzo d'acquisto, dovuta all'accettazione della proposta · penale {PENALE} della provvigione · approvazione specifica artt. 1341-1342 c.c. sulla stampa.</p>
        <button className="aa-link" onClick={() => setCondizioni(!condizioni)}>{condizioni ? "Nascondi" : "Leggi"} le condizioni dell'incarico</button>
        {condizioni && <ol className="aa-ir-clausole">{CLAUSOLE.map(([t, x]) => <li key={t}><strong>{t}.</strong> {x}</li>)}</ol>}
        <div className="aa-griglia-campi" style={{ marginTop: 14 }}>
          <Spunta label="Il Committente chiede espressamente che la ricerca inizi prima della scadenza del termine di recesso" valore={cn.recesso_anticipato} onChange={(v) => setD("condizioni", "recesso_anticipato", v)} />
          <Scelta label="Consenso a) comunicazione dei dati a WeUnit per la valutazione di un finanziamento" nome={`cw-${r.id}`} voci={CONSENSO} valore={cn.consenso_weunit} onChange={(v) => setD("condizioni", "consenso_weunit", v)} />
          <Scelta label="Consenso b) invio di proposte immobiliari e comunicazioni commerciali (email, WhatsApp, tel.)" nome={`cm-${r.id}`} voci={CONSENSO} valore={cn.consenso_marketing} onChange={(v) => setD("condizioni", "consenso_marketing", v)} />
          <Campo label="Luogo di sottoscrizione" value={cn.luogo} onChange={(v) => setD("condizioni", "luogo", v)} ph="Napoli" />
        </div>
      </section>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2">Lavorazioni ed esiti</h2>
        <p className="aa-nota">Registra ogni passaggio: proposte inviate, visite, proposte d'acquisto. Con l'esito "Accettazione proposta" ricordati di aggiornare lo stato dell'incarico.</p>
        <div className="aa-scorri">
          <table className="aa-tabella aa-vl-tab">
            <thead><tr><th>N°</th><th>Data</th><th>Attività</th><th>Immobile proposto / visitato</th><th>Esito</th><th>Note</th><th></th></tr></thead>
            <tbody>
              {lav.length === 0 && <tr><td colSpan={7} className="aa-nota">Nessuna lavorazione registrata.</td></tr>}
              {lav.map((x, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><input className="aa-vl-in" type="date" value={x.data || ""} onChange={(e) => setLav(i, "data", e.target.value)} /></td>
                  <td>
                    <select className="aa-vl-in" value={x.attivita || ""} onChange={(e) => setLav(i, "attivita", e.target.value)}>
                      <option value="">—</option>{ATTIVITA.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </td>
                  <td><input className="aa-vl-in" value={x.immobile || ""} placeholder="Via, rif. annuncio" onChange={(e) => setLav(i, "immobile", e.target.value)} /></td>
                  <td>
                    <select className={`aa-vl-in aa-ir-esito aa-ir-${(x.esito || "").replace(/\s+/g, "-").toLowerCase()}`} value={x.esito || ""} onChange={(e) => setLav(i, "esito", e.target.value)}>
                      <option value="">—</option>{ESITI.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </td>
                  <td><input className="aa-vl-in aa-vl-largo" value={x.note || ""} onChange={(e) => setLav(i, "note", e.target.value)} /></td>
                  <td><button className="aa-vl-x" onClick={() => setDiretto("lavorazioni", lav.filter((_, j) => j !== i))} aria-label="Rimuovi riga">×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="aa-btn aa-btn-piccolo" onClick={() => setDiretto("lavorazioni", [...lav, RIGA_LAV()])}>+ Aggiungi lavorazione</button>
      </section>

      {msg.testo && <p className={msg.errore ? "aa-errore" : "aa-info"}>{msg.testo}</p>}
      <div className="aa-modulo-azioni aa-vl-azioni">
        <button className="aa-btn aa-btn-pieno" disabled={salvando} onClick={salva}>{salvando ? "Salvataggio…" : modificata ? "Salva modifiche" : "Salva"}</button>
        <button className="aa-btn" onClick={stampa}>Stampa / Salva PDF</button>
        {puoEliminare && <button className="aa-btn aa-btn-piccolo" onClick={elimina}>Elimina incarico</button>}
      </div>
    </>
  );
}

/* ---------------- Stampa (stampa del browser → anche "Salva come PDF") ---------------- */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

export function stampaIncarico(r, finestra) {
  const d = r.dati || {};
  const c = d.committente || {}, m = d.mediatore || {}, im = d.immobile || {}, b = d.budget || {}, cn = d.condizioni || {};
  const v = (x) => (x ? esc(x) : "&nbsp;");
  const box = (on) => (on ? "☑" : "☐");
  const spunte = (voci, sel = []) => voci.map((x) => `<span>${box(sel.includes(x))} ${esc(x)}</span>`).join("");
  const scelta = (voci, val) => voci.map((x) => `<span>${box(val === x)} ${esc(x)}</span>`).join("");
  const kv = (pairs) => `<div class="kv">${pairs.map(([l, x, w]) => `<div style="flex:${w || 1}"><small>${esc(l)}</small><b>${v(x)}</b></div>`).join("")}</div>`;
  const opz = (l, html) => `<div class="op"><em>${esc(l)}</em>${html}</div>`;
  const zone = (d.zone || []).length ? d.zone : [{}, {}, {}];
  const lav = (d.lavorazioni || []).filter((x) => x.data || x.attivita || x.esito);
  const logo = `${window.location.origin}/logo-hub.png`;
  const testa = (sotto, dx) => `<div class="band"><img src="${logo}" alt=""><div class="tt"><h1>Incarico di Ricerca Immobiliare</h1><p>${sotto}</p></div><div class="dx">${dx}</div></div>`;
  const piede = (p) => `<div class="foot"><div><b>FC PUNTO HUB S.R.L.</b> · Via Pietro Mascagni 35, Napoli (Vomero) · P.IVA 01924140096<br>PEC fcpuntohub@pec.it · na.vomero@fondocasa.it · Tel. +39 081 18653202</div><div class="pg">${p}<br><span>Incarico di Ricerca in Esclusiva</span></div></div>`;
  const dx1 = `Prot. n. <b>${v(d.prot)}</b><br>Data <b>${v(dataIT(r.data_firma))}</b><br>Scadenza <b>${v(dataIT(piuSeiMesi(r.data_firma)))}</b>`;
  const tot = lav.length ? 3 : 2;

  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Incarico di ricerca - ${esc(r.committente)}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:0}
*{box-sizing:border-box}body{margin:0;font-family:Poppins,Arial,sans-serif;color:#0A1628;font-size:8.6pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pag{width:210mm;min-height:297mm;position:relative;padding:0 10mm 18mm;page-break-after:always}
.pag:last-child{page-break-after:auto}
.band{margin:0 -10mm;background:#0A1628;color:#fff;display:flex;align-items:center;gap:12px;padding:8px 10mm;border-bottom:3px solid #C9A84C}
.band img{width:62px;height:62px}.tt{flex:1}.tt h1{font-family:'Playfair Display',Georgia,serif;font-size:19pt;margin:0}
.tt p{margin:2px 0 0;color:#C9A84C;font-size:7.6pt;letter-spacing:.12em;font-weight:500}.dx{font-size:7.6pt;text-align:right;line-height:1.6}
h2{font-family:'Playfair Display',Georgia,serif;font-size:10.5pt;margin:9px 0 4px;padding-bottom:2px;border-bottom:1px solid #C9A84C}
h2 i{color:#C9A84C;font-style:normal;margin-right:6px}
.kv{display:flex;gap:8px;margin:3px 0}.kv div{border-bottom:1px solid #C9CDD6;padding:1px 0;min-width:0}
.kv small{display:block;color:#5A6170;font-size:6.6pt}.kv b{font-weight:500;display:block;min-height:11pt;word-break:break-word}
.op{display:flex;flex-wrap:wrap;gap:2px 12px;margin:3px 0;align-items:baseline}.op em{font-style:normal;font-weight:600;width:28mm}
table{width:100%;border-collapse:collapse}td,th{border:1px solid #C9CDD6;padding:3px 5px;text-align:left;vertical-align:top}
th{background:#F6F0DF;font-weight:600;font-size:7.6pt}
.cl{margin:2px 0 4px;text-align:justify;line-height:1.38}.cl b.n{font-family:'Playfair Display',Georgia,serif;color:#C9A84C}
.firme{background:#F6F0DF;border-radius:4px;padding:8px 10px;margin-top:6px}.firme .r{display:flex;gap:18px;margin-top:22px}
.firme .r div{flex:1;border-top:1px solid #0A1628;padding-top:2px;font-size:7.4pt;color:#5A6170}
.foot{position:absolute;left:0;right:0;bottom:0;background:#0A1628;color:#fff;border-top:1.2px solid #C9A84C;padding:5px 10mm;display:flex;justify-content:space-between;font-size:6.6pt;line-height:1.5}
.foot .pg{text-align:right;color:#C9A84C;font-weight:500}.foot .pg span{color:#fff;font-weight:400}
.mediatore{margin:2px 0;line-height:1.4}
.esito{font-weight:600}
@media screen{body{background:#e9ecf1}.pag{background:#fff;margin:10px auto;box-shadow:0 2px 12px rgba(0,0,0,.15)}}
</style></head><body>

<div class="pag">${testa("IN ESCLUSIVA · DURATA 6 MESI · SCHEDA CERCACASA", dx1)}
<h2><i>1</i>Il Committente</h2>
${kv([["Cognome e Nome", c.nome || r.committente, 2], ["Codice Fiscale", c.cf]])}
${kv([["Nato/a a", c.nato_a], ["il", dataIT(c.nato_il)], ["Documento n.", c.documento]])}
${kv([["Residente in", c.residenza, 2], ["Telefono", c.telefono], ["Email / PEC", c.email]])}
${kv([["Eventuale cointestatario", c.coint_nome, 2], ["Codice Fiscale", c.coint_cf]])}
<h2><i>2</i>Il Mediatore</h2>
<p class="mediatore"><b>FC PUNTO HUB S.R.L.</b> – brand FondoCasa Hub – sede legale Via del Commercio 11/13, Villanova d'Albenga (SV), sede operativa Via Pietro Mascagni 35, Napoli – P.IVA 01924140096 – PEC fcpuntohub@pec.it, in persona del legale rappresentante pro tempore (di seguito "il Mediatore").</p>
${kv([["Agente incaricato", m.agente ?? r.creato_da_nome, 2], ["Iscritto REA n.", m.rea], ["CCIAA di", m.cciaa]])}
${kv([["Polizza RC professionale n.", m.polizza], ["Compagnia", m.compagnia, 2]])}
<h2><i>3</i>Scheda Cercacasa – l'immobile ricercato</h2>
${opz("Tipologia", spunte(TIPOLOGIE, im.tipologia) + `<span>${box(!!im.tipologia_altro)} Altro ${esc(im.tipologia_altro || "")}</span>`)}
${opz("Destinazione", spunte(DESTINAZIONI, im.destinazione))}
${kv([["Vani n.", im.vani], ["Camere", im.camere], ["Bagni", im.bagni], ["Superficie mq da", im.mq_da], ["a", im.mq_a]])}
${opz("Piano", spunte(PIANI, im.piano))}
${opz("Ascensore", scelta(ASCENSORE, im.ascensore))}
${opz("Posto auto", scelta(NECESSITA, im.posto_auto) + (im.posto_auto_tipo ? `<span>Tipo: ${esc(im.posto_auto_tipo)}</span>` : ""))}
${opz("Box auto", scelta(NECESSITA, im.box) + (im.box_mq ? `<span>mq min. ${esc(im.box_mq)}</span>` : "") + (im.box_n ? `<span>n. ${esc(im.box_n)}</span>` : ""))}
${opz("Spazi esterni", spunte(ESTERNI, im.esterni))}
${opz("Stato", spunte(STATI_IMM, im.stato) + `<span>Classe energ. min. <b>${esc(im.classe || "____")}</b></span>`)}
${kv([["Altre esigenze", im.altre]])}
<h2><i>4</i>Zone e vie preferite</h2>
<table><tr><th style="width:14%">Priorità</th><th>Zona / Quartiere</th><th>Via / Strada preferita</th><th>Note</th></tr>
${zone.map((z, i) => `<tr><td>${i + 1}ª scelta</td><td>${v(z.zona)}</td><td>${v(z.via)}</td><td>${v(z.note)}</td></tr>`).join("")}</table>
${kv([["Zone / vie da escludere", d.zone_escluse]])}
<h2><i>5</i>Budget, mutuo e vendita dell'attuale abitazione</h2>
${kv([["Budget massimo €", b.max], ["Budget ideale €", b.ideale], ["Di cui liquidità propria €", b.liquidita]])}
${opz("Mutuo", scelta(SINO, b.mutuo) + `<span>Importo € <b>${esc(b.mutuo_importo || "______")}</b></span><span>Durata anni <b>${esc(b.mutuo_durata || "___")}</b></span><span>${box(b.predelibera)} Pre-delibera già ottenuta</span><span>${box(b.weunit)} Consulenza creditizia WeUnit (OAM M28)</span>${b.banca ? `<span>Banca: ${esc(b.banca)}</span>` : ""}`)}
${opz("Vendita casa", scelta(SINO, b.vendita) + `<span>${box(b.incarico_vendita)} Incarico di vendita a FC Punto Hub</span>`)}
${kv([["Indirizzo immobile da vendere", b.vendita_indirizzo, 2], ["Valore stimato €", b.vendita_valore]])}
${opz("Tempistica", scelta(TEMPISTICHE, b.tempistica) + `<span>Rogito desiderato entro <b>${esc(b.rogito_entro || "______")}</b></span>`)}
${piede(`Pag. 1/${tot}`)}</div>

<div class="pag">${testa("CONDIZIONI GENERALI DELL'INCARICO", `Committente<br><b>${v(c.nome || r.committente)}</b>`)}
<div style="height:6px"></div>
${CLAUSOLE.map(([t, x], i) => {
    let extra = "";
    if (i === 7) extra = `<div class="op" style="margin-left:4mm"><span>${box(cn.recesso_anticipato)} <i>Il Committente chiede espressamente che il Mediatore avvii la ricerca prima della scadenza del termine di recesso.</i></span></div>`;
    if (i === 8) extra = `<table style="margin:2px 0 4px"><tr><td>a) comunicazione dei dati a WeUnit per la valutazione di un finanziamento</td><td style="width:42%">${scelta(CONSENSO, cn.consenso_weunit).replace(/<\/span><span>/, "</span> &nbsp; <span>")}</td></tr><tr><td>b) invio di proposte immobiliari e comunicazioni commerciali (email, WhatsApp, tel.)</td><td>${scelta(CONSENSO, cn.consenso_marketing).replace(/<\/span><span>/, "</span> &nbsp; <span>")}</td></tr></table>`;
    return `<p class="cl"><b class="n">${i + 1}.</b> <b>${esc(t)}.</b> ${esc(x)}${i === 8 ? " Consensi facoltativi:" : ""}</p>${extra}`;
  }).join("")}
<div class="firme">Luogo e data: <b>${esc(cn.luogo || "")}${cn.luogo && r.data_firma ? ", " : ""}${dataIT(r.data_firma)}</b>
<div class="r"><div>Il Committente</div><div>Il Mediatore – FC Punto Hub S.r.l.</div><div>L'Agente incaricato</div></div></div>
<p class="cl" style="margin-top:8px"><b>Approvazione specifica.</b> ${esc(APPROVAZIONE)}</p>
<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:22px"><i style="color:#5A6170;font-size:7.4pt">Allegati: copia documento d'identità e codice fiscale del Committente.</i>
<div style="width:70mm;border-top:1px solid #0A1628;font-size:7.4pt;color:#5A6170;padding-top:2px">Il Committente</div></div>
${piede(`Pag. 2/${tot}`)}</div>

${lav.length ? `<div class="pag">${testa("REGISTRO LAVORAZIONI ED ESITI · USO INTERNO", `Committente<br><b>${v(c.nome || r.committente)}</b><br>Stato: <b>${esc(nomeStato(r.stato))}</b>`)}
<h2>Lavorazioni ed esiti</h2>
<table><tr><th style="width:5%">N°</th><th style="width:11%">Data</th><th style="width:18%">Attività</th><th>Immobile</th><th style="width:12%">Esito</th><th>Note</th></tr>
${lav.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(dataIT(x.data))}</td><td>${v(x.attivita)}</td><td>${v(x.immobile)}</td><td class="esito">${v(x.esito)}</td><td>${v(x.note)}</td></tr>`).join("")}</table>
<p style="color:#5A6170;font-size:7.4pt;margin-top:8px">Agente: ${esc(r.creato_da_nome || "")}${r.team ? ` · ${esc(r.team)}` : ""} · Incarico dal ${esc(dataIT(r.data_firma))} al ${esc(dataIT(piuSeiMesi(r.data_firma)))} · Documento interno, non consegnare al cliente.</p>
${piede(`Pag. 3/${tot}`)}</div>` : ""}

<script>window.onload=function(){(document.fonts?document.fonts.ready:Promise.resolve()).then(function(){setTimeout(function(){window.print()},300)})}</script>
</body></html>`;
  const w = finestra || window.open("", "_blank");
  if (!w) { alert("Il browser ha bloccato la finestra: consenti i popup per stampare o salvare il PDF."); return; }
  w.document.open(); w.document.write(html); w.document.close();
}
