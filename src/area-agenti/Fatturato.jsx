import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { euro } from "./compensi";
import { ALIQUOTE, TIPOLOGIE, ripartisci, buyerDi, elencoMesi, intervallo, notaPagamento } from "./incassi";

const dataIT = (iso) => (iso ? new Date(iso).toLocaleDateString("it-IT") : "");
const PRODUTTORI = [...Object.keys(ALIQUOTE), "buyer"];

export default function Fatturato({ profilo }) {
  const isAdmin = profilo.ruolo === "admin";
  const isAmm = profilo.ruolo === "staff" && profilo.reparto === "amministrazione";
  const isMkt = profilo.ruolo === "staff" && profilo.reparto === "marketing";
  const isTM = profilo.ruolo === "manager";
  const vedeRiepilogo = isAdmin || isAmm;

  const mesi = useMemo(() => elencoMesi(12), []);
  const [mese, setMese] = useState(0);
  const [parte, setParte] = useState("tutto");
  const [righe, setRighe] = useState(null);
  const [aperta, setAperta] = useState(null);
  const [nuovo, setNuovo] = useState(false);
  const [msg, setMsg] = useState("");

  const [da, a] = intervallo(mesi[mese], parte);
  const carica = async () => {
    setRighe(null);
    const { data, error } = await supabase.from("incassi").select("*")
      .gte("data_incasso", da).lte("data_incasso", a).order("data_incasso", { ascending: false });
    if (error) setMsg(error.message);
    setRighe(data || []);
  };
  useEffect(() => { carica(); }, [da, a]);

  const elimina = async (r) => {
    if (!window.confirm(`Eliminare l'incasso di ${euro(r.importo)} del ${dataIT(r.data_incasso)} (${r.cliente})?`)) return;
    const { error } = await supabase.from("incassi").delete().eq("id", r.id);
    if (error) return setMsg(error.message);
    carica();
  };

  const lista = righe || [];
  const totale = lista.reduce((s, r) => s + Number(r.importo), 0);
  const perTeam = {};
  lista.forEach((r) => { const t = r.team || "Senza team"; perTeam[t] = (perTeam[t] || 0) + Number(r.importo); });
  const mie = (r) => (r.quote || []).filter((q) => q.chi === profilo.id).reduce((s, q) => s + Number(q.importo), 0);
  const mioTotale = lista.reduce((s, r) => s + mie(r), 0);
  const hub = lista.reduce((s, r) => s + Number((r.quote || []).find((q) => q.hub)?.importo || 0), 0);

  const riepilogo = {};
  if (vedeRiepilogo) lista.forEach((r) => (r.quote || []).filter((q) => !q.hub).forEach((q) => {
    const k = q.chi || `__${q.voce}`;
    riepilogo[k] = riepilogo[k] || { nome: q.mancante ? `Non assegnato (${q.voce})` : q.nome, voci: {}, totale: 0 };
    riepilogo[k].voci[q.voce] = (riepilogo[k].voci[q.voce] || 0) + Number(q.importo);
    riepilogo[k].totale += Number(q.importo);
  }));

  return (
    <>
      <div className="aa-intestazione aa-intestazione-azione">
        <div>
          <p className="aa-occhiello">Registro incassi</p>
          <h1 className="aa-titolo">Fatturato</h1>
          <p className="aa-sottotitolo">
            {isAdmin ? "Inserisci ogni operazione incassata: la ripartizione si calcola da sola." :
              isTM ? "Le operazioni incassate del tuo team." :
              isMkt || isAmm ? "Tutte le operazioni incassate dallo store." :
              "Le operazioni incassate su cui maturi un compenso."}
          </p>
        </div>
        {isAdmin && <button className="aa-btn aa-btn-pieno" onClick={() => setNuovo(!nuovo)}>{nuovo ? "Chiudi" : "+ Nuovo incasso"}</button>}
      </div>

      {isAdmin && nuovo && <NuovoIncasso onSalvato={() => { setNuovo(false); carica(); }} />}

      <section className="aa-card">
        <div className="aa-griglia-campi">
          <label className="aa-campo"><span>Mese</span>
            <select value={mese} onChange={(e) => setMese(Number(e.target.value))}>
              {mesi.map((m, i) => <option key={i} value={i}>{m.etichetta}</option>)}
            </select></label>
          <label className="aa-campo"><span>Periodo</span>
            <select value={parte} onChange={(e) => setParte(e.target.value)}>
              <option value="tutto">Mese intero</option>
              <option value="1">Incassi dal 1 al 15</option>
              <option value="2">Incassi dal 16 a fine mese</option>
            </select></label>
          <p className="aa-nota aa-campo-largo">{notaPagamento(mesi[mese], parte)}</p>
        </div>
      </section>

      {msg && <p className="aa-errore">{msg}</p>}

      <div className="aa-kpi">
        <div className="aa-kpi-box aa-kpi-forte"><span>Incassato nel periodo</span><strong>{euro(totale)}</strong><small>{lista.length} operazioni</small></div>
        {Object.keys(perTeam).length > 1 && Object.entries(perTeam).map(([t, v]) => (
          <div key={t} className="aa-kpi-box"><span>{t}</span><strong>{euro(v)}</strong></div>
        ))}
        {vedeRiepilogo && <div className="aa-kpi-box"><span>Quota FC Punto Hub</span><strong>{euro(hub)}</strong><small>filiera {euro(totale - hub)}</small></div>}
        {!isAmm && <div className="aa-kpi-box aa-kpi-oro"><span>{isMkt ? "Il tuo 4% da fatturare" : "I tuoi compensi nel periodo"}</span><strong>{euro(mioTotale)}</strong></div>}
      </div>

      {vedeRiepilogo && (
        <section className="aa-card">
          <h2 className="aa-h2">Riepilogo importi da fatturare</h2>
          {Object.keys(riepilogo).length === 0 ? <p className="aa-nota">Nessun importo nel periodo.</p> : (
            <div className="aa-scorri">
              <table className="aa-tabella">
                <thead><tr><th>Collaboratore</th><th>Voci</th><th>Da fatturare</th></tr></thead>
                <tbody>
                  {Object.values(riepilogo).sort((x, y) => y.totale - x.totale).map((r) => (
                    <tr key={r.nome}>
                      <td><strong className={r.nome.startsWith("Non assegnato") ? "aa-testo-rosso" : ""}>{r.nome}</strong></td>
                      <td><small className="aa-nota">{Object.entries(r.voci).map(([v, i]) => `${v} ${euro(i)}`).join(" · ")}</small></td>
                      <td><strong>{euro(r.totale)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <section className="aa-card">
        <h2 className="aa-h2">Operazioni incassate</h2>
        {righe === null ? <p className="aa-nota">Caricamento…</p> : lista.length === 0 ? <p className="aa-nota">Nessuna operazione nel periodo.</p> : (
          <div className="aa-scorri">
            <table className="aa-tabella aa-tabella-click">
              <thead><tr><th>Incasso</th><th>Collaboratore</th><th>Cliente / immobile</th><th>Lato</th><th>Importo</th>{!isAmm && <th>Tua quota</th>}</tr></thead>
              <tbody>
                {lista.map((r) => (
                  <React.Fragment key={r.id}>
                    <tr onClick={() => setAperta(aperta === r.id ? null : r.id)}>
                      <td>{dataIT(r.data_incasso)}</td>
                      <td>{r.produttore_nome}<br /><small className="aa-nota">{r.team || "—"}{r.tipologia !== "standard" ? ` · ${r.tipologia === "generica" ? "richiesta generica" : "segnalato dalla Buyer"}` : ""}</small></td>
                      <td>{r.cliente}{r.indirizzo && <><br /><small className="aa-nota">{r.indirizzo}</small></>}</td>
                      <td>{r.lato}</td>
                      <td><strong>{euro(r.importo)}</strong></td>
                      {!isAmm && <td>{mie(r) ? euro(mie(r)) : "—"}</td>}
                    </tr>
                    {aperta === r.id && (
                      <tr className="aa-riga-dettaglio"><td colSpan={isAmm ? 5 : 6}>
                        <Quote quote={vedeRiepilogo || isTM ? r.quote : (r.quote || []).filter((q) => q.chi === profilo.id)} />
                        {r.note && <p className="aa-nota">Note: {r.note}</p>}
                        {isAdmin && <button className="aa-link aa-link-rosso" onClick={() => elimina(r)}>Elimina incasso</button>}
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Quote({ quote }) {
  return (
    <table className="aa-tabella aa-tabella-quote">
      <tbody>
        {(quote || []).map((q, i) => (
          <tr key={i} className={q.hub ? "aa-quota-hub" : ""}>
            <td>{q.mancante ? <span className="aa-testo-rosso">Non assegnato</span> : q.nome}</td>
            <td>{q.voce}</td><td>{q.pct}%</td><td><strong>{euro(q.importo)}</strong></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function NuovoIncasso({ onSalvato }) {
  const [profili, setProfili] = useState([]);
  const [f, setF] = useState({ data_incasso: new Date().toISOString().slice(0, 10), produttore: "", cliente: "", indirizzo: "", lato: "Venditore", importo: "", tipologia: "standard", buyer: "", note: "" });
  const [stato, setStato] = useState({ invio: false, errore: "" });
  const set = (k, v) => setF({ ...f, [k]: v });

  useEffect(() => {
    supabase.from("profiles").select("id, nome, email, ruolo, team, livello, attivo").eq("attivo", true).order("nome")
      .then(({ data }) => setProfili(data || []));
  }, []);

  const prod = profili.find((p) => p.id === f.produttore);
  const isBuyer = prod?.livello === "buyer";
  const tipologia = isBuyer ? "generica" : f.tipologia;
  const buyer = profili.find((p) => p.id === f.buyer) || (prod && buyerDi(profili, prod.team));
  const { quote, errori } = ripartisci({ importo: f.importo, produttore: prod, tipologia, buyer }, profili);

  const salva = async (e) => {
    e.preventDefault();
    if (!prod) return setStato({ invio: false, errore: "Scegli il collaboratore." });
    if (!(Number(f.importo) > 0)) return setStato({ invio: false, errore: "Inserisci l'importo incassato." });
    if (errori.length && !window.confirm(`${errori.join("\n")}\n\nSalvare comunque? Le quote non assegnate restano in evidenza nel riepilogo.`)) return;
    setStato({ invio: true, errore: "" });
    const { error } = await supabase.from("incassi").insert({
      data_incasso: f.data_incasso, produttore: prod.id, produttore_nome: prod.nome || prod.email, produttore_livello: prod.livello,
      team: prod.team || null, cliente: f.cliente.trim(), indirizzo: f.indirizzo.trim() || null, lato: isBuyer ? "Acquirente" : f.lato,
      tipologia, importo: Number(f.importo), quote, beneficiari: [...new Set(quote.filter((q) => q.chi).map((q) => q.chi))], note: f.note.trim() || null,
    });
    if (error) return setStato({ invio: false, errore: error.message });
    onSalvato();
  };

  const produttori = profili.filter((p) => PRODUTTORI.includes(p.livello));
  const buyers = profili.filter((p) => p.livello === "buyer");

  return (
    <form className="aa-card aa-sezione" onSubmit={salva}>
      <h2 className="aa-h2">Nuovo incasso</h2>
      <div className="aa-griglia-campi">
        <label className="aa-campo"><span>Data incasso <em>*</em></span>
          <input type="date" value={f.data_incasso} onChange={(e) => set("data_incasso", e.target.value)} required /></label>
        <label className="aa-campo"><span>Collaboratore <em>*</em></span>
          <select value={f.produttore} onChange={(e) => setF({ ...f, produttore: e.target.value, tipologia: "standard", buyer: "" })} required>
            <option value="">Scegli…</option>
            {produttori.map((p) => <option key={p.id} value={p.id}>{p.nome || p.email} — {p.livello === "buyer" ? "Buyer Agent" : ALIQUOTE[p.livello].nome}{p.team ? ` · ${p.team}` : ""}</option>)}
          </select></label>
        <label className="aa-campo"><span>Cliente <em>*</em></span>
          <input value={f.cliente} onChange={(e) => set("cliente", e.target.value)} placeholder="Nome e cognome" required /></label>
        <label className="aa-campo"><span>Indirizzo immobile</span>
          <input value={f.indirizzo} onChange={(e) => set("indirizzo", e.target.value)} /></label>
        <label className="aa-campo"><span>Venditore / Acquirente <em>*</em></span>
          <select value={isBuyer ? "Acquirente" : f.lato} onChange={(e) => set("lato", e.target.value)} disabled={isBuyer}>
            <option>Venditore</option><option>Acquirente</option>
          </select></label>
        <label className="aa-campo"><span>Importo fatturato incassato (€) <em>*</em></span>
          <input type="number" min="0" step="0.01" inputMode="decimal" value={f.importo} onChange={(e) => set("importo", e.target.value)} required /></label>
        {prod && !isBuyer && (
          <label className="aa-campo aa-campo-largo"><span>Tipologia</span>
            <select value={f.tipologia} onChange={(e) => set("tipologia", e.target.value)}>
              <option value="standard">{TIPOLOGIE.standard} (Buyer 5% richiesta specifica)</option>
              <option value="segnalata">{TIPOLOGIE.segnalata} (Buyer 10%, al collaboratore −10% +5%)</option>
            </select></label>
        )}
        {prod && !isBuyer && f.tipologia === "segnalata" && (
          <label className="aa-campo"><span>Buyer che ha segnalato</span>
            <select value={f.buyer || buyer?.id || ""} onChange={(e) => set("buyer", e.target.value)}>
              {buyers.map((p) => <option key={p.id} value={p.id}>{p.nome || p.email}{p.team ? ` · ${p.team}` : ""}</option>)}
            </select></label>
        )}
        {isBuyer && <p className="aa-nota aa-campo-largo">Buyer come produttore: vendita da richiesta generica, 28% sul lato acquirente. Se ha anche segnalato l'incarico, inserisci una seconda riga sul listing con tipologia “segnalato dalla Buyer”.</p>}
        <label className="aa-campo aa-campo-largo"><span>Note</span>
          <input value={f.note} onChange={(e) => set("note", e.target.value)} /></label>
      </div>

      {quote.length > 0 && (
        <div className="aa-anteprima">
          <p className="aa-nota"><strong>Ripartizione</strong></p>
          <Quote quote={quote} />
        </div>
      )}
      {errori.map((e) => <p key={e} className="aa-errore">{e}</p>)}
      {stato.errore && <p className="aa-errore">{stato.errore}</p>}
      <div className="aa-modulo-azioni">
        <button className="aa-btn aa-btn-pieno" disabled={stato.invio}>{stato.invio ? "Salvataggio…" : "Salva incasso"}</button>
      </div>
    </form>
  );
}
