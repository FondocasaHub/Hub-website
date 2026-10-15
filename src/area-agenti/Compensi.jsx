import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { LIVELLI, VOCI, AGGIORNATE_AL, calcola, euro, periodi, etichettaPeriodo, STATI_REPORT } from "./compensi";

const nomeLivello = (id) => LIVELLI.find((l) => l.id === id)?.nome || "Livello non impostato";
const dataIT = (iso) => (iso ? new Date(iso).toLocaleDateString("it-IT") : "");
const nomeSicuro = (n) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.\-]/g, "_");
const classeStato = (s) => `aa-stato aa-stato-${s.replace(/ /g, "-")}`;

async function apriFile(percorso) {
  const w = window.open("", "_blank");
  const { data, error } = await supabase.storage.from("compensi").createSignedUrl(percorso, 300);
  if (error || !data) { if (w) w.close(); return alert("Impossibile aprire il file."); }
  if (w) w.location.href = data.signedUrl; else window.location.href = data.signedUrl;
}

/* ================= Elenco ================= */
export function ElencoReport({ profilo, vai }) {
  const [lista, setLista] = useState(null);
  const [vista, setVista] = useState("miei");
  const isAdmin = profilo.ruolo === "admin";
  const isManager = profilo.ruolo === "manager" || isAdmin;
  const isAmm = profilo.ruolo === "staff" && profilo.reparto === "amministrazione";

  useEffect(() => {
    supabase.from("report_compensi")
      .select("id, creato_il, utente, nome, team, livello, periodo_inizio, periodo_fine, totale_fatturato, totale_compenso, stato")
      .order("creato_il", { ascending: false })
      .then(({ data }) => setLista(data || []));
  }, []);

  useEffect(() => { if (isAmm) setVista("amministrazione"); }, [isAmm]);

  const schede = [];
  if (!isAmm) schede.push({ id: "miei", label: "I miei report", filtro: (r) => r.utente === profilo.id });
  if (isManager) schede.push({ id: "approvare", label: "Da approvare", filtro: (r) => r.utente !== profilo.id && r.stato === "da approvare" });
  if (isAdmin) schede.push({ id: "autorizzare", label: "Da autorizzare", filtro: (r) => r.stato === "approvato" });
  if (isManager) schede.push({ id: "team", label: isAdmin ? "Tutti" : "Il mio team", filtro: (r) => r.utente !== profilo.id });
  if (isAmm || isAdmin) schede.push({ id: "amministrazione", label: "Amministrazione", filtro: (r) => ["autorizzato", "verificato", "pagato"].includes(r.stato) });
  const scheda = schede.find((s) => s.id === vista) || schede[0];
  const visibili = (lista || []).filter(scheda.filtro);

  return (
    <>
      <div className="aa-intestazione aa-intestazione-azione">
        <div>
          <p className="aa-occhiello">Amministrazione</p>
          <h1 className="aa-titolo">Report provvigioni e compensi</h1>
          <p className="aa-sottotitolo">Il report del periodo, con la pro-forma allegata, va approvato dal Team Manager, autorizzato dallo Store Manager e poi arriva all'Amministrazione.</p>
        </div>
        {!isAmm && <button className="aa-btn aa-btn-pieno" onClick={() => vai("compensi/nuovo")}>+ Nuovo report</button>}
      </div>

      {schede.length > 1 && (
        <div className="aa-schede">
          {schede.map((s) => (
            <button key={s.id} className={scheda.id === s.id ? "attivo" : ""} onClick={() => setVista(s.id)}>
              {s.label}{lista && <span className="aa-conta">{lista.filter(s.filtro).length}</span>}
            </button>
          ))}
        </div>
      )}

      <section className="aa-card">
        {lista === null ? <p className="aa-nota">Caricamento…</p> : visibili.length === 0 ? <p className="aa-nota">Nessun report.</p> : (
          <div className="aa-scorri">
            <table className="aa-tabella aa-tabella-click">
              <thead><tr><th>N.</th><th>Periodo</th>{scheda.id !== "miei" && <th>Collaboratore</th>}<th>Fatturato</th><th>Compenso</th><th>Stato</th></tr></thead>
              <tbody>
                {visibili.map((r) => (
                  <tr key={r.id} onClick={() => vai(`compensi/${r.id}`)}>
                    <td>{r.id}</td>
                    <td>{etichettaPeriodo(r.periodo_inizio, r.periodo_fine)}<br /><small className="aa-nota">inviato il {dataIT(r.creato_il)}</small></td>
                    {scheda.id !== "miei" && <td>{r.nome}<br /><small className="aa-nota">{nomeLivello(r.livello)}{r.team ? ` · ${r.team}` : ""}</small></td>}
                    <td>{euro(r.totale_fatturato)}</td>
                    <td><strong>{euro(r.totale_compenso)}</strong></td>
                    <td><span className={classeStato(r.stato)}>{r.stato}</span></td>
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

/* ================= Nuovo report ================= */
const rigaVuota = (voce) => ({ data_incasso: "", riferimento: "", tipo: "Vendita", voce: voce?.id || "", base: "" });

export function NuovoReport({ profilo, vai }) {
  const livello = profilo.livello;
  const voci = VOCI[livello] || [];
  const elencoPeriodi = useMemo(() => periodi(livello), [livello]);
  const [periodo, setPeriodo] = useState(0);
  const [righe, setRighe] = useState([]);
  const [registro, setRegistro] = useState(null);   // quote del collaboratore dal registro incassi
  const [esclusi, setEsclusi] = useState([]);
  const [fatture, setFatture] = useState([]);
  const [note, setNote] = useState("");
  const [dichiaro, setDichiaro] = useState(false);
  const [stato, setStato] = useState({ invio: false, msg: "", errore: "" });

  useEffect(() => {
    const p = elencoPeriodi[periodo];
    if (!p) return;
    setRegistro(null); setEsclusi([]);
    (async () => {
      const [{ data: inc }, { data: miei }] = await Promise.all([
        supabase.from("incassi").select("id, data_incasso, cliente, indirizzo, lato, importo, quote")
          .contains("beneficiari", [profilo.id]).gte("data_incasso", p.inizio).lte("data_incasso", p.fine).order("data_incasso"),
        supabase.from("report_compensi").select("stato, operazioni").eq("utente", profilo.id),
      ]);
      const giaUsati = new Set();
      (miei || []).filter((r) => r.stato !== "da correggere").forEach((r) => (r.operazioni || []).forEach((o) => o.incasso_id && giaUsati.add(`${o.incasso_id}|${o.etichetta}`)));
      const out = [];
      (inc || []).forEach((i) => (i.quote || []).filter((q) => q.chi === profilo.id).forEach((q) => {
        const chiave = `${i.id}|${q.voce}`;
        out.push({ chiave, incasso_id: i.id, data_incasso: i.data_incasso, riferimento: `${i.cliente}${i.indirizzo ? " · " + i.indirizzo : ""}`,
          tipo: `Lato ${String(i.lato).toLowerCase()}`, voce: "registro", etichetta: q.voce, base: Number(i.importo), aliquota: q.pct, fisso: null,
          compenso: Number(q.importo), gia: giaUsati.has(chiave) });
      }));
      setRegistro(out);
      setEsclusi(out.filter((r) => r.gia).map((r) => r.chiave));
    })();
  }, [periodo, elencoPeriodi, profilo.id]);

  if (!livello) {
    return (
      <section className="aa-card">
        <h1 className="aa-titolo">Livello compensi non impostato</h1>
        <p>Per compilare il report serve il tuo livello (New, Junior, Senior, Buyer, Team Manager…). Chiedi all'Admin di impostarlo in Gestione → Utenti.</p>
        <button className="aa-btn" onClick={() => vai("compensi")}>Torna ai report</button>
      </section>
    );
  }

  const voceDi = (id) => voci.find((v) => v.id === id);
  const calcolate = righe.map((r) => ({ ...r, compenso: calcola(voceDi(r.voce), r.base) }));
  const dalRegistro = (registro || []).filter((r) => !esclusi.includes(r.chiave));
  const incassiUnici = new Map(dalRegistro.map((r) => [r.incasso_id, r.base]));
  const totFatt = [...incassiUnici.values()].reduce((s, v) => s + v, 0) + calcolate.filter((r) => !voceDi(r.voce)?.fisso).reduce((s, r) => s + (Number(r.base) || 0), 0);
  const totComp = dalRegistro.reduce((s, r) => s + r.compenso, 0) + calcolate.reduce((s, r) => s + r.compenso, 0);
  const setRiga = (i, k, v) => setRighe(righe.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const invia = async (e) => {
    e.preventDefault();
    if (!fatture.length) return setStato({ ...stato, errore: "Allega la pro-forma (obbligatoria, circolare 01/2026)." });
    if (!dichiaro) return setStato({ ...stato, errore: "Conferma la dichiarazione in fondo al modulo." });
    if (!dalRegistro.length && !calcolate.length) return setStato({ ...stato, errore: "Nessuna operazione nel report." });
    if (calcolate.some((r) => !(Number(r.base) > 0))) return setStato({ ...stato, errore: "Ogni riga deve avere un importo maggiore di zero." });

    setStato({ invio: true, msg: "Caricamento pro-forma…", errore: "" });
    const { data: { user } } = await supabase.auth.getUser();
    const pratica = crypto.randomUUID();
    const allegati = [];
    for (let i = 0; i < fatture.length; i++) {
      const percorso = `${user.id}/${pratica}/${i + 1}-${nomeSicuro(fatture[i].name)}`;
      const { error } = await supabase.storage.from("compensi").upload(percorso, fatture[i]);
      if (error) return setStato({ invio: false, msg: "", errore: `Errore nel caricamento di ${fatture[i].name}: ${error.message}` });
      allegati.push({ percorso, nome: fatture[i].name, dimensione: fatture[i].size });
    }

    setStato({ invio: true, msg: "Invio del report…", errore: "" });
    const p = elencoPeriodi[periodo];
    const operazioni = [
      ...dalRegistro.map(({ chiave, gia, ...r }) => ({ ...r, base_descrizione: "Importo incassato (registro)" })),
      ...calcolate.map((r) => {
        const v = voceDi(r.voce);
        return { ...r, etichetta: v.etichetta, base_descrizione: v.base, aliquota: v.pct ?? null, fisso: v.fisso ?? null, base: Number(r.base) };
      }),
    ];
    const { data: rep, error } = await supabase.from("report_compensi").insert({
      periodo_inizio: p.inizio, periodo_fine: p.fine, operazioni, allegati, note,
      totale_fatturato: Math.round(totFatt * 100) / 100, totale_compenso: Math.round(totComp * 100) / 100,
    }).select("id").single();
    if (error) return setStato({ invio: false, msg: "", errore: `Il report non è stato salvato: ${error.message}` });

    setStato({ invio: true, msg: "Avviso al Team Manager…", errore: "" });
    await supabase.functions.invoke("notifica-report", { body: { id: rep.id, destinatario: "tm" } });
    vai(`compensi/${rep.id}?inviato=1`);
  };

  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">{nomeLivello(livello)}{profilo.team ? ` · ${profilo.team}` : ""}</p>
        <h1 className="aa-titolo">Nuovo report provvigioni</h1>
        <p className="aa-sottotitolo">Inserisci le operazioni incassate nel periodo: il compenso si calcola con le aliquote in vigore dal {AGGIORNATE_AL}.</p>
      </div>

      <form onSubmit={invia} className="aa-modulo">
        <section className="aa-card aa-sezione">
          <h2 className="aa-h2"><span className="aa-sezione-n">01</span>Periodo</h2>
          <div className="aa-griglia-campi">
            <label className="aa-campo">
              <span>Periodo di riferimento <em>*</em></span>
              <select value={periodo} onChange={(e) => setPeriodo(Number(e.target.value))}>
                {elencoPeriodi.map((p, i) => <option key={p.inizio} value={i}>{p.etichetta}</option>)}
              </select>
            </label>
            <p className="aa-nota aa-campo-largo">Incassi dall'1 al 15: pagamento dal 16 al 30. Incassi dal 16 a fine mese: pagamento dall'1 al 15 del mese successivo.</p>
          </div>
        </section>

        <section className="aa-card aa-sezione">
          <h2 className="aa-h2"><span className="aa-sezione-n">02</span>Operazioni incassate</h2>
          <p className="aa-nota">Dal registro incassi dello Store Manager: importi già calcolati, non modificabili. Se manca un'operazione o un importo non torna, avvisa lo Store Manager.</p>
          {registro === null ? <p className="aa-nota">Caricamento del registro…</p> : registro.length === 0 ? (
            <p className="aa-box-info">Nel registro non ci sono operazioni a tuo nome per questo periodo.</p>
          ) : (
            <div className="aa-scorri">
              <table className="aa-tabella">
                <thead><tr><th></th><th>Incasso</th><th>Cliente / immobile</th><th>Voce</th><th>Incassato</th><th>Compenso</th></tr></thead>
                <tbody>
                  {registro.map((r) => {
                    const dentro = !esclusi.includes(r.chiave);
                    return (
                      <tr key={r.chiave} className={dentro ? "" : "aa-riga-esclusa"}>
                        <td><input type="checkbox" checked={dentro} onChange={() => setEsclusi(dentro ? [...esclusi, r.chiave] : esclusi.filter((k) => k !== r.chiave))} /></td>
                        <td>{new Date(r.data_incasso).toLocaleDateString("it-IT")}</td>
                        <td>{r.riferimento}<br /><small className="aa-nota">{r.tipo}{r.gia ? " · già in un altro report" : ""}</small></td>
                        <td>{r.etichetta}<br /><small className="aa-nota">{r.aliquota}%</small></td>
                        <td>{euro(r.base)}</td>
                        <td><strong>{euro(r.compenso)}</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="aa-nota" style={{ marginTop: 16 }}><strong>Altre voci</strong> (solo se non sono nel registro, es. bonus Lead WeUnit):</p>
          <div className="aa-operazioni">
            {calcolate.map((r, i) => {
              const v = voceDi(r.voce);
              return (
                <div key={i} className="aa-operazione">
                  <div className="aa-operazione-n">{i + 1}</div>
                  <div className="aa-griglia-campi">
                    {voci.length > 1 && (
                      <label className="aa-campo aa-campo-largo"><span>Voce <em>*</em></span>
                        <select value={r.voce} onChange={(e) => setRiga(i, "voce", e.target.value)} required>
                          {voci.map((x) => <option key={x.id} value={x.id}>{x.etichetta} — {x.fisso != null ? `${euro(x.fisso)} cad.` : `${x.pct}%`}</option>)}
                        </select>
                      </label>
                    )}
                    <label className="aa-campo"><span>Data incasso <em>*</em></span>
                      <input type="date" value={r.data_incasso} onChange={(e) => setRiga(i, "data_incasso", e.target.value)} required /></label>
                    <label className="aa-campo"><span>Rif. immobile / cliente <em>*</em></span>
                      <input value={r.riferimento} onChange={(e) => setRiga(i, "riferimento", e.target.value)} placeholder="Codice annuncio, indirizzo o cliente" required /></label>
                    <label className="aa-campo"><span>Tipo <em>*</em></span>
                      <select value={r.tipo} onChange={(e) => setRiga(i, "tipo", e.target.value)}>
                        {["Vendita", "Locazione", "Mutuo / credito", "Altro"].map((t) => <option key={t}>{t}</option>)}
                      </select></label>
                    <label className="aa-campo"><span>{v?.base || "Importo"} <em>*</em></span>
                      <input type="number" min="0" step={v?.fisso != null ? 1 : 0.01} inputMode="decimal" value={r.base} onChange={(e) => setRiga(i, "base", e.target.value)} required /></label>
                    <div className="aa-campo"><span>Compenso {v?.fisso != null ? `(${euro(v.fisso)} cad.)` : `(${v?.pct}%)`}</span>
                      <div className="aa-calcolo">{euro(r.compenso)}</div></div>
                  </div>
                  {<button type="button" className="aa-link aa-link-rosso" onClick={() => setRighe(righe.filter((_, j) => j !== i))}>Togli</button>}
                </div>
              );
            })}
          </div>
          <button type="button" className="aa-btn" onClick={() => setRighe([...righe, rigaVuota(voci[0])])}>+ Aggiungi voce manuale</button>
          <div className="aa-totali">
            <div><span>Totale fatturato</span><strong>{euro(totFatt)}</strong></div>
            <div className="aa-totale-compenso"><span>Totale compenso</span><strong>{euro(totComp)}</strong></div>
          </div>
        </section>

        <section className="aa-card aa-sezione">
          <h2 className="aa-h2"><span className="aa-sezione-n">03</span>Pro-forma e note</h2>
          <div className="aa-griglia-campi">
            <div className="aa-allegato">
              <label className="aa-btn aa-upload">+ Pro-forma (PDF) *<input type="file" accept="application/pdf,image/*" multiple onChange={(e) => { setFatture([...fatture, ...Array.from(e.target.files || [])]); e.target.value = ""; }} /></label>
              <ul>{fatture.map((x, i) => <li key={i}>{x.name} <button type="button" className="aa-link aa-link-rosso" onClick={() => setFatture(fatture.filter((_, j) => j !== i))}>togli</button></li>)}</ul>
            </div>
            <label className="aa-campo aa-campo-largo"><span>Note per Team Manager e Amministrazione</span>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></label>
            <label className="aa-spunta-grande">
              <input type="checkbox" checked={dichiaro} onChange={(e) => setDichiaro(e.target.checked)} />
              Dichiaro che gli importi corrispondono a operazioni effettivamente incassate da FC Punto Hub nel periodo <em>*</em>
            </label>
          </div>
        </section>

        {stato.errore && <p className="aa-errore">{stato.errore}</p>}
        <div className="aa-modulo-azioni">
          <button type="button" className="aa-btn" onClick={() => vai("compensi")} disabled={stato.invio}>Annulla</button>
          <button className="aa-btn aa-btn-pieno" disabled={stato.invio}>{stato.invio ? stato.msg : `Invia al Team Manager · ${euro(totComp)}`}</button>
        </div>
      </form>
    </>
  );
}

/* ================= Dettaglio ================= */
export function DettaglioReport({ id, profilo, vai }) {
  const [r, setR] = useState(undefined);
  const [possoApprovare, setPossoApprovare] = useState(false);
  const [nota, setNota] = useState("");
  const [msg, setMsg] = useState({ testo: "", errore: false });
  const isAmm = (profilo.ruolo === "staff" && profilo.reparto === "amministrazione") || profilo.ruolo === "admin";
  const query = useMemo(() => new URLSearchParams(window.location.search), [id]);

  const carica = async () => {
    const { data } = await supabase.from("report_compensi").select("*").eq("id", id).maybeSingle();
    setR(data);
    const { data: ok } = await supabase.rpc("posso_approvare_report", { rid: Number(id) });
    setPossoApprovare(!!ok);
  };
  useEffect(() => { carica(); }, [id]);

  const mostra = (testo, errore = false) => setMsg({ testo, errore });

  const isAdmin = profilo.ruolo === "admin";

  const avvisa = async (destinatario, ok) => {
    const { error } = await supabase.functions.invoke("notifica-report", { body: { id: Number(id), destinatario } });
    const chi = destinatario === "sm" ? "allo Store Manager" : "all'Amministrazione";
    mostra(error ? `${ok}, ma l'email ${chi} non è partita: usa “Invia di nuovo”.` : `${ok} e inviato ${chi}.`, !!error);
  };

  const decidi = async (approvato) => {
    if (!approvato && !nota.trim()) return mostra("Scrivi nella nota cosa va corretto.", true);
    mostra(approvato ? "Approvazione in corso…" : "Invio della richiesta di correzione…");
    const { error } = await supabase.rpc("approva_report", { rid: Number(id), approvato, nota: nota || null });
    if (error) return mostra(error.message, true);
    if (approvato) await avvisa(isAdmin ? "amministrazione" : "sm", isAdmin ? "Approvato e autorizzato" : "Approvato");
    else mostra("Report rimandato al collaboratore per la correzione.");
    setNota(""); carica();
  };

  const autorizza = async (ok) => {
    if (!ok && !nota.trim()) return mostra("Scrivi nella nota cosa va corretto.", true);
    mostra(ok ? "Autorizzazione in corso…" : "Invio della richiesta di correzione…");
    const { error } = await supabase.rpc("autorizza_report", { rid: Number(id), autorizzato: ok, nota: nota || null });
    if (error) return mostra(error.message, true);
    if (ok) await avvisa("amministrazione", "Autorizzato");
    else mostra("Report rimandato al collaboratore per la correzione.");
    setNota(""); carica();
  };

  const lavora = async (nuovo) => {
    const { error } = await supabase.rpc("lavora_report", { rid: Number(id), nuovo_stato: nuovo, nota: nota || null });
    if (error) return mostra(error.message, true);
    mostra(`Report segnato come “${nuovo}”.`); setNota(""); carica();
  };

  const reinvia = async (destinatario) => {
    mostra("Invio in corso…");
    const { error } = await supabase.functions.invoke("notifica-report", { body: { id: Number(id), destinatario } });
    mostra(error ? "L'email non è partita: avvisa l'Admin." : "Email inviata.", !!error);
    carica();
  };

  if (r === undefined) return <p className="aa-nota">Caricamento…</p>;
  if (r === null) return <section className="aa-card"><p>Report non trovato.</p><button className="aa-btn" onClick={() => vai("compensi")}>Torna ai report</button></section>;

  const passi = ["da approvare", "approvato", "autorizzato", "verificato", "pagato"];
  const nomiPassi = { "da approvare": "Inviato", approvato: "Approvato TM", autorizzato: "Autorizzato SM", verificato: "Verificato", pagato: "Pagato" };
  const indice = r.stato === "da correggere" ? 0 : passi.indexOf(r.stato);

  return (
    <>
      <button className="aa-link" onClick={() => vai("compensi")}>← Tutti i report</button>
      <div className="aa-intestazione aa-intestazione-azione">
        <div>
          <p className="aa-occhiello">Report n. {r.id} · inviato il {dataIT(r.creato_il)}</p>
          <h1 className="aa-titolo">{r.nome} · {etichettaPeriodo(r.periodo_inizio, r.periodo_fine)}</h1>
          <p className="aa-sottotitolo">{nomeLivello(r.livello)}{r.team ? ` · ${r.team}` : ""}</p>
        </div>
        <span className={`${classeStato(r.stato)} aa-stato-grande`}>{r.stato}</span>
      </div>

      {query.get("inviato") && <p className="aa-info">Report inviato. Il Team Manager lo vede in “Da approvare” ed è stato avvisato via email.</p>}

      <ol className="aa-passi">
        {passi.map((p, i) => <li key={p} className={i <= indice && r.stato !== "da correggere" ? "fatto" : ""}>{nomiPassi[p]}</li>)}
      </ol>

      {r.stato === "da correggere" && <p className="aa-errore"><strong>Da correggere</strong> — {r.nota_sm || r.nota_tm} ({r.nota_sm ? r.autorizzato_da : r.approvato_da}). Compila un nuovo report con le correzioni.</p>}
      {r.nota_tm && r.stato !== "da correggere" && <p className="aa-box-info"><strong>Nota del Team Manager ({r.approvato_da}):</strong> {r.nota_tm}</p>}
      {r.nota_sm && r.stato !== "da correggere" && <p className="aa-box-info"><strong>Nota dello Store Manager ({r.autorizzato_da}):</strong> {r.nota_sm}</p>}
      {r.nota_amministrazione && <p className="aa-box-info"><strong>Nota dell'Amministrazione:</strong> {r.nota_amministrazione}</p>}

      {possoApprovare && ["da approvare", "da correggere"].includes(r.stato) && (
        <section className="aa-card aa-gestione-stato">
          <h2 className="aa-h2">Approvazione Team Manager</h2>
          <label className="aa-campo"><span>Nota (obbligatoria se rimandi per correzione)</span>
            <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="es. manca l'operazione di via Cilea" /></label>
          <div className="aa-riga" style={{ marginTop: 12 }}>
            <button className="aa-btn" onClick={() => decidi(false)}>Rimanda per correzione</button>
            <button className="aa-btn aa-btn-pieno" onClick={() => decidi(true)}>{isAdmin ? "Approva, autorizza e invia all'Amministrazione" : "Approva e invia allo Store Manager"}</button>
          </div>
        </section>
      )}

      {isAdmin && r.stato === "approvato" && (
        <section className="aa-card aa-gestione-stato">
          <h2 className="aa-h2">Autorizzazione Store Manager</h2>
          <p className="aa-nota">Approvato da {r.approvato_da} il {dataIT(r.approvato_il)}.</p>
          <label className="aa-campo"><span>Nota (obbligatoria se rimandi per correzione)</span>
            <input value={nota} onChange={(e) => setNota(e.target.value)} /></label>
          <div className="aa-riga" style={{ marginTop: 12 }}>
            <button className="aa-btn" onClick={() => autorizza(false)}>Rimanda per correzione</button>
            <button className="aa-btn aa-btn-pieno" onClick={() => autorizza(true)}>Autorizza e invia all'Amministrazione</button>
          </div>
        </section>
      )}

      {isAmm && ["autorizzato", "verificato", "pagato"].includes(r.stato) && (
        <section className="aa-card aa-gestione-stato">
          <h2 className="aa-h2">Amministrazione</h2>
          <label className="aa-campo"><span>Nota per il collaboratore</span>
            <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="es. pagamento con bonifico del 20/10" /></label>
          <div className="aa-riga" style={{ marginTop: 12 }}>
            <button className="aa-btn" onClick={() => lavora("verificato")} disabled={r.stato !== "autorizzato"}>Segna verificato</button>
            <button className="aa-btn aa-btn-pieno" onClick={() => lavora("pagato")} disabled={r.stato !== "verificato"}>Segna pagato</button>
          </div>
        </section>
      )}

      {r.stato === "approvato" && !r.email_sm_il && possoApprovare && (
        <div className="aa-errore aa-riga"><span>L'email allo Store Manager non risulta inviata.</span><button className="aa-btn aa-btn-piccolo" onClick={() => reinvia("sm")}>Invia di nuovo</button></div>
      )}
      {r.stato === "autorizzato" && !r.email_amministrazione_il && (possoApprovare || isAmm) && (
        <div className="aa-errore aa-riga"><span>L'email all'Amministrazione non risulta inviata.</span><button className="aa-btn aa-btn-piccolo" onClick={() => reinvia("amministrazione")}>Invia di nuovo</button></div>
      )}
      {r.stato === "verificato" && (
        <p className="aa-info">Report verificato dall'Amministrazione: ora il collaboratore emette la fattura elettronica a FC Punto Hub Srl, identica alla pro-forma, e ne invia copia a contabilita2@fondocasa.com.</p>
      )}
      {msg.testo && <p className={msg.errore ? "aa-errore" : "aa-info"}>{msg.testo}</p>}

      <section className="aa-card">
        <h2 className="aa-h2">Operazioni</h2>
        <div className="aa-scorri">
          <table className="aa-tabella">
            <thead><tr><th>Data incasso</th><th>Riferimento</th><th>Voce</th><th>Base</th><th>Compenso</th></tr></thead>
            <tbody>
              {(r.operazioni || []).map((o, i) => (
                <tr key={i}>
                  <td>{dataIT(o.data_incasso)}</td>
                  <td>{o.riferimento}<br /><small className="aa-nota">{o.tipo}</small></td>
                  <td>{o.etichetta}<br /><small className="aa-nota">{o.fisso != null ? `${euro(o.fisso)} cad.` : `${o.aliquota}%`}</small></td>
                  <td>{o.fisso != null ? `${o.base} lead` : euro(o.base)}</td>
                  <td><strong>{euro(o.compenso)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="aa-totali">
          <div><span>Totale fatturato</span><strong>{euro(r.totale_fatturato)}</strong></div>
          <div className="aa-totale-compenso"><span>Totale compenso</span><strong>{euro(r.totale_compenso)}</strong></div>
        </div>
      </section>

      <section className="aa-card">
        <h2 className="aa-h2">Pro-forma</h2>
        <ul className="aa-file">
          {(r.allegati || []).map((a) => (
            <li key={a.percorso}><button onClick={() => apriFile(a.percorso)}><span className="aa-file-nome">{a.nome}</span><span className="aa-file-dim">{(a.dimensione / 1024 / 1024).toFixed(1)} MB</span></button></li>
          ))}
        </ul>
        {r.note && <p className="aa-com-testo"><strong>Note:</strong> {r.note}</p>}
      </section>
    </>
  );
}

export { STATI_REPORT };
