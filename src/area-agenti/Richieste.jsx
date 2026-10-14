import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

/* ============ Definizione del Modulo Ingaggio Marketing Hub ============ */
const OPZ = {
  agente_team: ["Team Nigido", "Team Esposito"],
  contratto: ["Vendita", "Affitto"],
  accesso: ["Presente il proprietario", "Presente l'agente", "Chiavi in agenzia"],
  immobile_stato_foto: ["Arredato e in ordine", "Arredato da sistemare", "Vuoto", "In ristrutturazione"],
  tipologia: ["Appartamento", "Attico", "Villa / Villino", "Loft / Open space", "Monolocale", "Locale commerciale", "Ufficio", "Box / Posto auto", "Altro"],
  ascensore: ["Sì", "No"],
  stato: ["Nuovo / Ristrutturato", "Ottimo", "Buono", "Da ristrutturare"],
  classe_en: ["A4", "A3", "A2", "A1", "B", "C", "D", "E", "F", "G", "In attesa APE"],
  euromq: ["Sì", "No", "Fuori prezzo max 10%"],
  conformita: ["Sì", "No"],
};
const SERVIZI = ["Servizio fotografico", "Video tour", "Reel / contenuto social", "Virtual tour 360° / Matterport", "Riprese con drone", "Planimetria grafica", "Home staging virtuale", "Testo annuncio a cura del marketing"];
const PERTINENZE = ["Balcone", "Terrazzo", "Giardino", "Box auto", "Posto auto", "Cantina", "Portineria", "Arredato"];
const CLAUSOLA = "L'agente dichiara che tutte le informazioni riportate nel presente modulo sono veritiere e verificate prima dell'ingaggio del Marketing Hub. FC Punto Hub Srl potrà richiedere all'agente il rimborso delle spese sostenute per il servizio qualora le informazioni fornite risultino fasulle o non verificate (a titolo esemplificativo: valore fuori range EUROMQ non dichiarato, difformità catastali o urbanistiche non segnalate, appuntamento non confermato con il proprietario).";

// Etichette per riepilogo e dettaglio (stesso ordine del PDF)
export const SEZIONI = [
  ["01", "Dati agente richiedente", [["agente_nome", "Nome e cognome"], ["agente_team", "Team"], ["data_richiesta", "Data richiesta"], ["agente_cell", "Cellulare"], ["agente_email", "Email"]]],
  ["02", "Dati immobile", [["codice_annuncio", "Codice annuncio"], ["contratto", "Contratto"], ["prezzo", "Prezzo richiesto (€)"], ["indirizzo", "Indirizzo completo"], ["zona", "Quartiere / Comune"], ["proprietario_nome", "Proprietario"], ["proprietario_tel", "Telefono proprietario"]]],
  ["03", "Appuntamento proposto", [["data_1", "Data proposta 1"], ["ora_1", "Orario proposta 1"], ["data_2", "Data proposta 2"], ["ora_2", "Orario proposta 2"], ["accesso", "Accesso all'immobile"], ["immobile_stato_foto", "Condizioni per lo shooting"]]],
  ["04", "Servizi richiesti", [["servizi", "Servizi"], ["srv_note", "Note sui servizi / scadenza pubblicazione"]]],
  ["05", "Descrizione immobile", [["tipologia", "Tipologia"], ["mq", "Superficie (mq)"], ["locali", "N. locali"], ["bagni", "N. bagni"], ["piano", "Piano / piani totali"], ["ascensore", "Ascensore"], ["stato", "Stato immobile"], ["classe_en", "Classe energetica"], ["riscaldamento", "Riscaldamento"], ["esposizione", "Esposizione / vista"], ["pertinenze", "Pertinenze e dotazioni"], ["punti_forza", "Punti di forza da valorizzare"], ["descrizione", "Descrizione (bozza per l'annuncio)"]]],
  ["06", "Verifiche pre-ingaggio", [["euromq", "Valore conforme al range EUROMQ"], ["conformita", "Conforme catastalmente e urbanisticamente"], ["difformita", "Eventuali difformità"]]],
  ["07", "Dichiarazione e firma", [["accetta_clausola", "Clausola rimborso spese"], ["luogo_data", "Luogo e data"], ["firma", "Firma"]]],
];

const STATI = ["ricevuta", "in lavorazione", "completata", "respinta"];
const MAX_MB = 50;
const oggiISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const dataIT = (iso) => (iso ? new Date(iso).toLocaleDateString("it-IT") : "");
const nomeSicuro = (n) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]/g, "_");

/* ============ Elenco ============ */
export function ElencoRichieste({ vai, gestore }) {
  const [lista, setLista] = useState(null);
  const [filtro, setFiltro] = useState("");
  useEffect(() => {
    supabase.from("richieste_marketing")
      .select("id, creato_il, agente_nome, agente_team, codice_annuncio, indirizzo, stato, dati")
      .order("creato_il", { ascending: false })
      .then(({ data }) => setLista(data || []));
  }, []);
  const visibili = (lista || []).filter((r) => !filtro || r.stato === filtro);

  return (
    <>
      <div className="aa-intestazione aa-intestazione-azione">
        <div>
          <p className="aa-occhiello">Marketing Hub</p>
          <h1 className="aa-titolo">Richieste</h1>
          <p className="aa-sottotitolo">{gestore ? "Tutte le richieste di ingaggio marketing dello store." : "Le tue richieste di ingaggio marketing e il loro stato."}</p>
        </div>
        <button className="aa-btn aa-btn-pieno" onClick={() => vai("richieste/nuova")}>+ Nuovo Ingaggio Marketing</button>
      </div>

      {gestore && (
        <div className="aa-schede">
          {["", ...STATI].map((s) => (
            <button key={s} className={filtro === s ? "attivo" : ""} onClick={() => setFiltro(s)}>
              {s ? s[0].toUpperCase() + s.slice(1) : "Tutte"}
              {lista && <span className="aa-conta">{lista.filter((r) => !s || r.stato === s).length}</span>}
            </button>
          ))}
        </div>
      )}

      <section className="aa-card">
        {lista === null ? <p className="aa-nota">Caricamento…</p> : visibili.length === 0 ? (
          <p className="aa-nota">Nessuna richiesta{filtro ? ` con stato “${filtro}”` : ""}.</p>
        ) : (
          <div className="aa-scorri">
            <table className="aa-tabella aa-tabella-click">
              <thead><tr><th>N.</th><th>Data</th>{gestore && <th>Agente</th>}<th>Immobile</th><th>Servizi</th><th>Stato</th></tr></thead>
              <tbody>
                {visibili.map((r) => (
                  <tr key={r.id} onClick={() => vai(`richieste/${r.id}`)}>
                    <td>{r.id}</td>
                    <td>{dataIT(r.creato_il)}</td>
                    {gestore && <td>{r.agente_nome}<br /><small className="aa-nota">{r.agente_team}</small></td>}
                    <td><strong>{r.codice_annuncio}</strong><br /><small className="aa-nota">{r.indirizzo}</small></td>
                    <td className="aa-nota">{(r.dati?.servizi || []).join(", ")}</td>
                    <td><span className={`aa-stato aa-stato-${r.stato.replace(" ", "-")}`}>{r.stato}</span></td>
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

/* ============ Nuova richiesta ============ */
function Campo({ label, children, largo }) {
  return <label className={`aa-campo ${largo ? "aa-campo-largo" : ""}`}><span>{label} <em>*</em></span>{children}</label>;
}

export function NuovaRichiesta({ profilo, vai }) {
  const [f, setF] = useState({
    agente_nome: profilo.nome || "",
    agente_team: OPZ.agente_team.includes(profilo.team) ? profilo.team : "",
    data_richiesta: oggiISO(),
    agente_cell: "",
    agente_email: profilo.email,
    servizi: [],
    pertinenze: [],
    luogo: "Napoli",
  });
  const [file, setFile] = useState({ foto: [], video: [], planimetria: [] });
  const [stato, setStato] = useState({ invio: false, msg: "", errore: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const toggle = (k, v) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });

  const testo = (k, props = {}) => <input value={f[k] || ""} onChange={set(k)} required {...props} />;
  const scelta = (k) => (
    <select value={f[k] || ""} onChange={set(k)} required>
      <option value="" disabled>Seleziona…</option>
      {OPZ[k].map((o) => <option key={o}>{o}</option>)}
    </select>
  );
  const area = (k, rows = 3) => <textarea rows={rows} value={f[k] || ""} onChange={set(k)} required />;
  const radio = (k) => (
    <div className="aa-radio">
      {OPZ[k].map((o) => (
        <label key={o}><input type="radio" name={k} value={o} checked={f[k] === o} onChange={set(k)} required /> {o}</label>
      ))}
    </div>
  );

  const aggiungiFile = (cat) => (e) => {
    const nuovi = Array.from(e.target.files || []);
    const troppo = nuovi.filter((x) => x.size > MAX_MB * 1024 * 1024);
    if (troppo.length) setStato({ ...stato, errore: `Questi file superano ${MAX_MB} MB e non sono stati aggiunti: ${troppo.map((x) => x.name).join(", ")}. Per i video più pesanti usa un link (WeTransfer, Drive) nelle note.` });
    setFile({ ...file, [cat]: [...file[cat], ...nuovi.filter((x) => x.size <= MAX_MB * 1024 * 1024)] });
    e.target.value = "";
  };
  const togliFile = (cat, i) => setFile({ ...file, [cat]: file[cat].filter((_, j) => j !== i) });

  const invia = async (e) => {
    e.preventDefault();
    if (f.servizi.length === 0) return setStato({ ...stato, errore: "Seleziona almeno un servizio richiesto (sezione 04)." });
    if (f.conformita === "No" && !(f.difformita || "").trim()) return setStato({ ...stato, errore: "Indica le difformità (sezione 06)." });
    if (!f.accetta_clausola) return setStato({ ...stato, errore: "Devi accettare la clausola di rimborso spese (sezione 07)." });

    setStato({ invio: true, msg: "Caricamento allegati…", errore: "" });
    const { data: { user } } = await supabase.auth.getUser();
    const pratica = crypto.randomUUID();
    const tutti = Object.entries(file).flatMap(([cat, lista]) => lista.map((x) => ({ cat, x })));
    const allegati = [];
    for (let i = 0; i < tutti.length; i++) {
      const { cat, x } = tutti[i];
      setStato({ invio: true, msg: `Caricamento allegati ${i + 1} di ${tutti.length}…`, errore: "" });
      const percorso = `${user.id}/${pratica}/${cat}-${i + 1}-${nomeSicuro(x.name)}`;
      const { error } = await supabase.storage.from("richieste").upload(percorso, x, { contentType: x.type || undefined });
      if (error) return setStato({ invio: false, msg: "", errore: `Errore nel caricamento di ${x.name}: ${error.message}` });
      allegati.push({ percorso, nome: x.name, tipo: cat, dimensione: x.size });
    }

    setStato({ invio: true, msg: "Invio della richiesta…", errore: "" });
    const adesso = new Date();
    const dati = {
      ...f,
      prezzo: f.prezzo,
      data_richiesta: dataIT(f.data_richiesta),
      data_1: dataIT(f.data_1), data_2: dataIT(f.data_2),
      accetta_clausola: "Letta e accettata",
      luogo_data: `${f.luogo}, ${adesso.toLocaleDateString("it-IT")}`,
      firma: `Firmato elettronicamente da ${f.agente_nome} (${profilo.email}) il ${adesso.toLocaleString("it-IT")}`,
      difformita: f.difformita || "Nessuna",
    };
    delete dati.luogo;
    const { data: r, error } = await supabase.from("richieste_marketing").insert({
      agente_nome: f.agente_nome, agente_team: f.agente_team, agente_email: f.agente_email,
      codice_annuncio: f.codice_annuncio, indirizzo: f.indirizzo, dati, allegati,
    }).select("id").single();
    if (error) return setStato({ invio: false, msg: "", errore: `La richiesta non è stata salvata: ${error.message}` });

    setStato({ invio: true, msg: "Invio dell'email al marketing…", errore: "" });
    const { error: errEmail } = await supabase.functions.invoke("notifica-marketing", { body: { id: r.id } });
    vai(`richieste/${r.id}${errEmail ? "?email=ko" : "?inviata=1"}`);
  };

  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">FC Punto Hub · Store Napoli Vomero</p>
        <h1 className="aa-titolo">Modulo Ingaggio Marketing Hub</h1>
        <p className="aa-sottotitolo">Richiesta servizio foto, video e descrizione immobile. Tutti i campi con * sono obbligatori. All'invio la richiesta arriva a marketinghub@fondocasa.it.</p>
      </div>

      <form onSubmit={invia} className="aa-modulo">
        <Sezione n="01" titolo="Dati agente richiedente">
          <Campo label="Nome e cognome agente">{testo("agente_nome")}</Campo>
          <Campo label="Team">{scelta("agente_team")}</Campo>
          <Campo label="Data richiesta"><input type="date" value={f.data_richiesta} onChange={set("data_richiesta")} required /></Campo>
          <Campo label="Cellulare agente">{testo("agente_cell", { type: "tel", inputMode: "tel" })}</Campo>
          <Campo label="Email agente">{testo("agente_email", { type: "email" })}</Campo>
        </Sezione>

        <Sezione n="02" titolo="Dati immobile">
          <Campo label="Codice annuncio">{testo("codice_annuncio")}</Campo>
          <Campo label="Contratto">{scelta("contratto")}</Campo>
          <Campo label="Prezzo richiesto (€)">{testo("prezzo", { type: "number", min: 0, step: 1000, inputMode: "numeric" })}</Campo>
          <Campo label="Indirizzo completo (via, civico, scala, interno)" largo>{testo("indirizzo")}</Campo>
          <Campo label="Quartiere / Comune">{testo("zona")}</Campo>
          <Campo label="Nome e cognome proprietario">{testo("proprietario_nome")}</Campo>
          <Campo label="Telefono proprietario">{testo("proprietario_tel", { type: "tel", inputMode: "tel" })}</Campo>
        </Sezione>

        <Sezione n="03" titolo="Appuntamento proposto">
          <Campo label="Data proposta 1">{testo("data_1", { type: "date", min: oggiISO() })}</Campo>
          <Campo label="Orario proposta 1">{testo("ora_1", { type: "time" })}</Campo>
          <Campo label="Data proposta 2">{testo("data_2", { type: "date", min: oggiISO() })}</Campo>
          <Campo label="Orario proposta 2">{testo("ora_2", { type: "time" })}</Campo>
          <Campo label="Accesso all'immobile">{scelta("accesso")}</Campo>
          <Campo label="Condizioni per lo shooting">{scelta("immobile_stato_foto")}</Campo>
        </Sezione>

        <Sezione n="04" titolo="Servizi richiesti">
          <div className="aa-spunte aa-campo-largo">
            {SERVIZI.map((s) => (
              <label key={s}><input type="checkbox" checked={f.servizi.includes(s)} onChange={() => toggle("servizi", s)} /> {s}</label>
            ))}
          </div>
          <p className="aa-nota aa-campo-largo">Seleziona almeno un servizio.</p>
          <Campo label="Note sui servizi / scadenza pubblicazione" largo>{area("srv_note")}</Campo>
        </Sezione>

        <Sezione n="05" titolo="Descrizione immobile">
          <Campo label="Tipologia">{scelta("tipologia")}</Campo>
          <Campo label="Superficie (mq)">{testo("mq", { type: "number", min: 1, inputMode: "numeric" })}</Campo>
          <Campo label="N. locali">{testo("locali", { type: "number", min: 1, inputMode: "numeric" })}</Campo>
          <Campo label="N. bagni">{testo("bagni", { type: "number", min: 0, inputMode: "numeric" })}</Campo>
          <Campo label="Piano / piani totali">{testo("piano", { placeholder: "es. 3 / 6" })}</Campo>
          <Campo label="Ascensore">{scelta("ascensore")}</Campo>
          <Campo label="Stato immobile">{scelta("stato")}</Campo>
          <Campo label="Classe energetica">{scelta("classe_en")}</Campo>
          <Campo label="Riscaldamento">{testo("riscaldamento", { placeholder: "es. autonomo a metano" })}</Campo>
          <Campo label="Esposizione / vista">{testo("esposizione")}</Campo>
          <div className="aa-campo aa-campo-largo">
            <span>Pertinenze e dotazioni</span>
            <div className="aa-spunte">
              {PERTINENZE.map((p) => (
                <label key={p}><input type="checkbox" checked={f.pertinenze.includes(p)} onChange={() => toggle("pertinenze", p)} /> {p}</label>
              ))}
            </div>
          </div>
          <Campo label="Punti di forza da valorizzare in foto/video" largo>{area("punti_forza")}</Campo>
          <Campo label="Descrizione dell'immobile (bozza per l'annuncio)" largo>{area("descrizione", 5)}</Campo>
        </Sezione>

        <Sezione n="06" titolo="Verifiche pre-ingaggio (obbligatorie)">
          <Campo label="Valore conforme al range di valutazione EUROMQ" largo>{radio("euromq")}</Campo>
          <Campo label="Immobile conforme catastalmente e urbanisticamente" largo>{radio("conformita")}</Campo>
          <label className="aa-campo aa-campo-largo">
            <span>Note: indicare eventuali difformità {f.conformita === "No" && <em>*</em>}</span>
            <textarea rows={2} value={f.difformita || ""} onChange={set("difformita")} required={f.conformita === "No"} placeholder={f.conformita === "No" ? "Descrivi le difformità" : "Nessuna"} />
          </label>
        </Sezione>

        <Sezione n="+" titolo="Allegati (facoltativi)">
          <p className="aa-nota aa-campo-largo">Foto, video e planimetria dell'immobile. Massimo {MAX_MB} MB per file.</p>
          {[["foto", "Foto", "image/*"], ["video", "Video", "video/*"], ["planimetria", "Planimetria", "image/*,application/pdf"]].map(([cat, et, acc]) => (
            <div key={cat} className="aa-allegato">
              <label className="aa-btn aa-upload">+ {et}<input type="file" accept={acc} multiple onChange={aggiungiFile(cat)} /></label>
              <ul>
                {file[cat].map((x, i) => (
                  <li key={i}>{x.name} <span className="aa-nota">{(x.size / 1024 / 1024).toFixed(1)} MB</span>
                    <button type="button" className="aa-link aa-link-rosso" onClick={() => togliFile(cat, i)}>togli</button></li>
                ))}
              </ul>
            </div>
          ))}
        </Sezione>

        <Sezione n="07" titolo="Dichiarazione e firma agente">
          <p className="aa-clausola aa-campo-largo">{CLAUSOLA}</p>
          <label className="aa-spunta-grande aa-campo-largo">
            <input type="checkbox" checked={!!f.accetta_clausola} onChange={(e) => setF({ ...f, accetta_clausola: e.target.checked })} required />
            Ho letto e accetto la clausola di rimborso spese <em>*</em>
          </label>
          <Campo label="Luogo">{testo("luogo")}</Campo>
          <div className="aa-campo">
            <span>Firma agente</span>
            <p className="aa-firma">All'invio la richiesta viene firmata elettronicamente a nome di <strong>{f.agente_nome || "…"}</strong> ({profilo.email}), con data e ora.</p>
          </div>
        </Sezione>

        {stato.errore && <p className="aa-errore">{stato.errore}</p>}
        <div className="aa-modulo-azioni">
          <button type="button" className="aa-btn" onClick={() => vai("richieste")} disabled={stato.invio}>Annulla</button>
          <button className="aa-btn aa-btn-pieno" disabled={stato.invio}>{stato.invio ? stato.msg : "Firma e invia al Marketing"}</button>
        </div>
      </form>
    </>
  );
}

function Sezione({ n, titolo, children }) {
  return (
    <section className="aa-card aa-sezione">
      <h2 className="aa-h2"><span className="aa-sezione-n">{n}</span>{titolo}</h2>
      <div className="aa-griglia-campi">{children}</div>
    </section>
  );
}

/* ============ Dettaglio ============ */
export function DettaglioRichiesta({ id, vai, gestore }) {
  const [r, setR] = useState(undefined);
  const [modifica, setModifica] = useState({});
  const [msg, setMsg] = useState("");
  const query = useMemo(() => new URLSearchParams(window.location.search), [id]);

  const carica = () =>
    supabase.from("richieste_marketing").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => { setR(data); if (data) setModifica({ stato: data.stato, nota_marketing: data.nota_marketing || "" }); });
  useEffect(() => { carica(); }, [id]);

  const apri = async (percorso) => {
    const w = window.open("", "_blank");
    const { data, error } = await supabase.storage.from("richieste").createSignedUrl(percorso, 300);
    if (error || !data) { if (w) w.close(); return alert("Impossibile aprire l'allegato."); }
    if (w) w.location.href = data.signedUrl; else window.location.href = data.signedUrl;
  };

  const salva = async () => {
    const { error } = await supabase.from("richieste_marketing").update(modifica).eq("id", id);
    setMsg(error ? error.message : "Stato aggiornato");
    if (!error) carica();
    setTimeout(() => setMsg(""), 3000);
  };

  const reinvia = async () => {
    setMsg("Invio in corso…");
    const { error } = await supabase.functions.invoke("notifica-marketing", { body: { id: Number(id) } });
    setMsg(error ? "L'email non è partita: avvisa l'Admin." : "Email inviata al marketing.");
    carica();
  };

  if (r === undefined) return <p className="aa-nota">Caricamento…</p>;
  if (r === null) return <div className="aa-card"><p>Richiesta non trovata.</p><button className="aa-btn" onClick={() => vai("richieste")}>Torna alle richieste</button></div>;

  const d = r.dati || {};
  return (
    <>
      <button className="aa-link" onClick={() => vai("richieste")}>← Tutte le richieste</button>
      <div className="aa-intestazione aa-intestazione-azione">
        <div>
          <p className="aa-occhiello">Ingaggio Marketing n. {r.id} · {dataIT(r.creato_il)}</p>
          <h1 className="aa-titolo">{r.codice_annuncio} · {r.indirizzo}</h1>
          <p className="aa-sottotitolo">{r.agente_nome} · {r.agente_team}</p>
        </div>
        <span className={`aa-stato aa-stato-grande aa-stato-${r.stato.replace(" ", "-")}`}>{r.stato}</span>
      </div>

      {query.get("inviata") && <p className="aa-info">Richiesta inviata. Il marketing l'ha ricevuta via email (na.vomero in copia).</p>}
      {!r.email_inviata_il && (
        <div className="aa-errore aa-riga">
          <span>La richiesta è salvata, ma l'email al marketing non risulta inviata.</span>
          <button className="aa-btn aa-btn-piccolo" onClick={reinvia}>Invia di nuovo l'email</button>
        </div>
      )}

      {gestore && (
        <section className="aa-card aa-gestione-stato">
          <h2 className="aa-h2">Gestione marketing</h2>
          <div className="aa-form aa-form-riga">
            <label>Stato
              <select value={modifica.stato} onChange={(e) => setModifica({ ...modifica, stato: e.target.value })}>
                {STATI.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>Nota per l'agente
              <input value={modifica.nota_marketing} onChange={(e) => setModifica({ ...modifica, nota_marketing: e.target.value })} placeholder="es. shooting confermato giovedì alle 10" />
            </label>
            <button className="aa-btn aa-btn-pieno" onClick={salva}>Salva</button>
          </div>
          {msg && <p className="aa-info">{msg}</p>}
        </section>
      )}
      {!gestore && r.nota_marketing && <p className="aa-box-info"><strong>Nota del marketing:</strong> {r.nota_marketing}</p>}

      <section className="aa-card">
        <h2 className="aa-h2">Allegati ({(r.allegati || []).length})</h2>
        {(r.allegati || []).length === 0 ? <p className="aa-nota">Nessun allegato.</p> : (
          <ul className="aa-file">
            {r.allegati.map((a) => (
              <li key={a.percorso}><button onClick={() => apri(a.percorso)}>
                <span className="aa-file-nome">{a.nome}</span>
                <span className="aa-file-dim">{a.tipo} · {(a.dimensione / 1024 / 1024).toFixed(1)} MB</span>
              </button></li>
            ))}
          </ul>
        )}
      </section>

      {SEZIONI.map(([n, titolo, campi]) => (
        <section key={n} className="aa-card">
          <h2 className="aa-h2"><span className="aa-sezione-n">{n}</span>{titolo}</h2>
          <dl className="aa-dati">
            {campi.map(([k, et]) => (
              <React.Fragment key={k}>
                <dt>{et}</dt>
                <dd>{Array.isArray(d[k]) ? (d[k].length ? d[k].join(", ") : "—") : (d[k] || "—")}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>
      ))}
    </>
  );
}
