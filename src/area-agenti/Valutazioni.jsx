import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Scheda valutazione immobile — versione online del modulo cartaceo FondoCasa.
// L'agente la compila e la salva; la vedono lui, il Manager del suo team e lo Store Manager.

const MAGG_NETTA = 0.10; // superficie netta + 10% (deciso da Nico, 20/10/2026)

export const LOCALI = [
  ["ingresso", "Ingresso", 1], ["salone", "Salone", 1], ["soggiorno", "Soggiorno", 1], ["pranzo", "Sala da pranzo", 1],
  ["camera1", "Camera", 1], ["camera2", "Camera", 1], ["camera3", "Camera", 1], ["studio", "Studio", 1],
  ["cucina", "Cucina", 1], ["bagno1", "Bagno", 1], ["bagno2", "Bagno", 1], ["corridoio", "Corridoio", 1],
  ["disimpegno", "Disimpegno", 1], ["dispensa", "Dispensa", 1], ["veranda", "Veranda", 0.95],
];
export const ACCESSORI = [
  ["balcone", "Balcone"], ["terrazzo", "Terrazzo"], ["terrazzi_sovr", "Terrazzi sovr."], ["giardino", "Giardino"],
  ["cortile", "Cortile"], ["taverna", "Taverna"], ["cantina", "Cantina/Solaio"], ["lavanderia", "Lavanderia"],
];
const COEFF_ACC = 0.5;
export const ALTRI_ACC = [["box", "Box"], ["pa_coperto", "Posto auto coperto"], ["pa_scoperto", "Posto auto scoperto"], ["terreno", "Terreno adiacente"]];

const INFO_GENERALI = [
  [["anno", "Anno di costruzione"], ["tipo_edificio", "Tipo di edificio"], ["piani", "Piani edificio"], ["n_app", "N° appartamenti"],
    ["ascensore", "Ascensore"], ["riscaldamento", "Riscaldamento"], ["acqua_calda", "Acqua calda"], ["portineria", "Portineria"], ["note1", "Note", true]],
  [["amministratore", "Amministratore"], ["spese_ord", "Spese amministr. ordinarie"], ["str_da_del", "Spese straord. da deliberare"],
    ["str_del", "Spese straord. deliberate"], ["preventivi", "Già preventivi", "sino"], ["costi_lavori", "Costi lavori"], ["tipo_pag", "Tipo pagamento"],
    ["come_trattarli", "Come trattarli"], ["note2", "Note", true]],
  [["sit_catastale", "Situazione catastale"], ["agg_catastale", "Aggiornamento catastale"], ["condono", "Condono"], ["sanatoria", "Concessione in sanatoria"],
    ["ristrutturazione", "Lavori di ristrutturazione"], ["quando", "Quando"], ["art26", "Fatto art. 26 Comune"], ["conf_impianti", "Conformità impianti"], ["note3", "Note", true]],
];
export const DOMANDE = [
  ["pregi_immobile", "Mi indica alcuni pregi dell'immobile?"], ["pregi_zona", "Mi indica alcuni pregi della zona?"],
  ["intestato", "A chi è intestato l'immobile?"], ["acquistato", "Quando lo ha acquistato?"], ["motivo", "Per quale motivo vende?"],
  ["alternative", "Cerca delle soluzioni alternative?"], ["da_quanto", "Quanto tempo è che prova a vendere?"],
  ["azioni", "Quali azioni ha intrapreso per promuovere la vendita?"], ["offerte", "Ha ricevuto offerte/controfferte?"],
  ["somma", "Quale somma ha pensato di realizzare?"],
];
const ALTRE_INFO = [
  [["occupazione", "Vuoto o abitato da"], ["libero_entro", "Libero entro"], ["orario_visite", "Orario visite"], ["chiavi", "Chiavi"],
    ["inquilino", "Inquilino"], ["tel_inquilino", "Telefono inquilino"], ["canone", "Canone €"], ["tipo_contratto", "Tipo contratto"],
    ["scad_contratto", "Scadenza contratto"], ["note_occ", "Note", true]],
  [["mutuo_importo", "Importo mutuo €"], ["mutuo_residuo", "Mutuo residuo €"], ["rate_pagate", "N° rate pagate"], ["rata_da", "Rata da €"],
    ["banca", "Banca"], ["agenzia", "Agenzia"], ["tipo_mutuo", "Tipo di mutuo"], ["durata", "Durata"], ["ipoteca", "Grado d'ipoteca"],
    ["pertinenze", "Eventuali pertinenze", true]],
];
export const PREZZI_VOCI = [["p_app", "Prezzo appartamento €"], ["p_box", "Prezzo box €"], ["p_pa", "Prezzo posto auto €"], ["p_terreno", "Prezzo terreno €"]];
export const MATERIALI = ["Giornalino", "Pocket", "Porta chiavi", "Penna", "Calendario", "Calendario scrivania", "Blocco appunti", "Agenda", "Copia esclusiva"];
export const DOCUMENTI = ["Atto notarile", "Successione", "Planimetria cat.", "Planimetria prog.", "Certificato cat.", "Riparto sp. amminist.", "Sp. amm. straordin.", "Regolamento cond.", "Certificazioni impianti"];

/* ---------------- calcoli ---------------- */
export const num = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  const n = parseFloat(String(v).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
const numMq = (v) => { // per i mq la virgola è decimale, il punto anche
  if (v === null || v === undefined || v === "") return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
export const mqRiga = (r) => {
  if (!r) return 0;
  const a = numMq(r.a), b = numMq(r.b);
  return a && b ? a * b : numMq(r.mq);
};
export function calcola(d) {
  const loc = d.locali || {};
  const extra = d.locali_extra || [];
  const netta = LOCALI.reduce((s, [k, , c]) => s + mqRiga(loc[k]) * c, 0) + extra.reduce((s, r) => s + mqRiga(r) * (numMq(r.coeff) || 1), 0);
  const immobile = netta * (1 + MAGG_NETTA);
  const acc = d.accessori || {};
  const accessori = ACCESSORI.reduce((s, [k]) => s + mqRiga(acc[k]) * COEFF_ACC, 0);
  const commerciale = immobile + accessori;
  const p = d.prezzi || {};
  const totale = PREZZI_VOCI.reduce((s, [k]) => s + num(p[k]), 0);
  const valutato = num(p.valutato);
  return { netta, immobile, accessori, commerciale, totale, euroMq: commerciale && valutato ? valutato / commerciale : 0 };
}
export const fmtMq = (n) => (n ? n.toLocaleString("it-IT", { maximumFractionDigits: 2 }) : "0");
export const fmtEur = (n) => (n ? "€ " + Math.round(n).toLocaleString("it-IT") : "—");

const oggi = () => new Date().toISOString().slice(0, 10);
export const dataIT = (iso) => (iso ? new Date(iso + (iso.length === 10 ? "T12:00" : "")).toLocaleDateString("it-IT") : "");

/* ---------------- Elenco ---------------- */
export function ElencoValutazioni({ profilo, vai }) {
  const [lista, setLista] = useState(null);
  const [cerca, setCerca] = useState("");
  useEffect(() => {
    supabase.from("valutazioni").select("id, aggiornato_il, indirizzo, proprietario, data_valutazione, team, creato_da, creato_da_nome, dati")
      .order("aggiornato_il", { ascending: false }).then(({ data }) => setLista(data || []));
  }, []);
  const nuova = async () => {
    const { data, error } = await supabase.from("valutazioni").insert({ indirizzo: "", data_valutazione: oggi() }).select("id").single();
    if (error) return alert(error.message);
    vai(`valutazioni/${data.id}`);
  };
  const q = cerca.toLowerCase();
  const visibili = (lista || []).filter((r) => !q || `${r.indirizzo} ${r.proprietario} ${r.creato_da_nome}`.toLowerCase().includes(q));
  return (
    <>
      <div className="aa-intestazione aa-intestazione-azione">
        <div>
          <p className="aa-occhiello">Strumenti · Acquisizione</p>
          <h1 className="aa-titolo">Schede valutazione immobile</h1>
          <p className="aa-sottotitolo">Compila la scheda durante il sopralluogo: superfici, informazioni, domande al proprietario e prezzi. Resta salvata qui e la scarichi in PDF.</p>
        </div>
        <button className="aa-btn aa-btn-pieno" onClick={nuova}>+ Nuova valutazione</button>
      </div>
      <section className="aa-card">
        {lista && lista.length > 6 && <input className="aa-cerca" style={{ marginBottom: 12 }} placeholder="Cerca per indirizzo, proprietario o agente…" value={cerca} onChange={(e) => setCerca(e.target.value)} />}
        {lista === null ? <p className="aa-nota">Caricamento…</p> : visibili.length === 0 ? <p className="aa-nota">{lista.length ? "Nessun risultato." : "Nessuna scheda di valutazione: crea la prima."}</p> : (
          <div className="aa-scorri">
            <table className="aa-tabella aa-tabella-click">
              <thead><tr><th>Immobile</th><th>Data</th><th>Sup. commerciale</th><th>Prezzo valutato</th><th>Agente</th></tr></thead>
              <tbody>
                {visibili.map((r) => {
                  const c = calcola(r.dati || {});
                  return (
                    <tr key={r.id} onClick={() => vai(`valutazioni/${r.id}`)}>
                      <td><strong>{r.indirizzo || "Senza indirizzo"}</strong><br /><small className="aa-nota">{r.proprietario || "—"}</small></td>
                      <td>{dataIT(r.data_valutazione)}</td>
                      <td>{c.commerciale ? `${fmtMq(c.commerciale)} mq` : "—"}</td>
                      <td>{fmtEur(num(r.dati?.prezzi?.valutato))}</td>
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

/* ---------------- Scheda ---------------- */
const Campo = ({ label, value, onChange, largo, tipo = "text", ph }) => (
  <label className={`aa-campo${largo ? " aa-campo-largo" : ""}`}>
    <span>{label}</span>
    {largo ? <textarea rows={2} value={value || ""} onChange={(e) => onChange(e.target.value)} />
      : <input type={tipo} inputMode={tipo === "num" ? "decimal" : undefined} value={value || ""} placeholder={ph} onChange={(e) => onChange(e.target.value)} />}
  </label>
);

function RigaMq({ nome, coeff, v = {}, set, onNome, rimuovi }) {
  const mq = mqRiga(v);
  const auto = numMq(v.a) && numMq(v.b);
  return (
    <tr>
      <td>{onNome ? <input className="aa-vl-in" value={nome} placeholder="Locale" onChange={(e) => onNome(e.target.value)} /> : nome}</td>
      <td className="aa-vl-misure">
        <input className="aa-vl-in aa-vl-num" inputMode="decimal" value={v.a || ""} placeholder="m" onChange={(e) => set({ ...v, a: e.target.value })} />
        <span>×</span>
        <input className="aa-vl-in aa-vl-num" inputMode="decimal" value={v.b || ""} placeholder="m" onChange={(e) => set({ ...v, b: e.target.value })} />
      </td>
      <td className="aa-vl-coeff">{coeff}</td>
      <td>
        {auto ? <strong>{fmtMq(mq)}</strong>
          : <input className="aa-vl-in aa-vl-num" inputMode="decimal" value={v.mq || ""} placeholder="mq" onChange={(e) => set({ ...v, mq: e.target.value })} />}
        {rimuovi && <button className="aa-vl-x" onClick={rimuovi} aria-label="Rimuovi riga">×</button>}
      </td>
    </tr>
  );
}

export function SchedaValutazione({ id, profilo, vai }) {
  const [r, setR] = useState(undefined);
  const [msg, setMsg] = useState({ testo: "", errore: false });
  const [salvando, setSalvando] = useState(false);
  const [modificata, setModificata] = useState(false);

  const carica = async () => {
    const { data } = await supabase.from("valutazioni").select("*").eq("id", id).maybeSingle();
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
  if (r === null) return <section className="aa-card"><p>Scheda non trovata.</p><button className="aa-btn" onClick={() => vai("valutazioni")}>Torna all'elenco</button></section>;

  const d = r.dati || {};
  const c = calcola(d);
  const set = (k, v) => { setR({ ...r, [k]: v }); setModificata(true); };
  const setD = (gruppo, k, v) => set("dati", { ...d, [gruppo]: { ...(d[gruppo] || {}), [k]: v } });
  const setDiretto = (k, v) => set("dati", { ...d, [k]: v });
  const extra = d.locali_extra || [];
  const trattativa = d.trattativa && d.trattativa.length ? d.trattativa : Array.from({ length: 7 }, () => ({ data: "", testo: "" }));
  const mostra = (testo, errore = false) => setMsg({ testo, errore });

  const salva = async () => {
    if (!r.indirizzo.trim()) { mostra("Inserisci l'indirizzo dell'immobile.", true); return false; }
    setSalvando(true);
    const { error } = await supabase.from("valutazioni").update({
      indirizzo: r.indirizzo.trim(), proprietario: r.proprietario, telefono: r.telefono, data_valutazione: r.data_valutazione || null, dati: d,
    }).eq("id", r.id);
    setSalvando(false);
    if (error) { mostra(error.message, true); return false; }
    await carica(); mostra("Scheda salvata."); return true;
  };
  const elimina = async () => {
    if (!window.confirm(`Eliminare la scheda di ${r.indirizzo || "questo immobile"}?`)) return;
    const { error } = await supabase.from("valutazioni").delete().eq("id", r.id);
    if (error) return mostra(error.message, true);
    vai("valutazioni");
  };
  const puoEliminare = profilo.ruolo === "admin" || r.creato_da === profilo.id;
  const lista = (gruppo, voce) => {
    const sel = d[gruppo] || [];
    return sel.includes(voce) ? sel.filter((x) => x !== voce) : [...sel, voce];
  };

  return (
    <>
      <button className="aa-link" onClick={() => vai("valutazioni")}>← Tutte le valutazioni</button>
      <div className="aa-intestazione aa-intestazione-azione">
        <div>
          <p className="aa-occhiello">Valutazione · {r.team || "senza team"} · {r.creato_da === profilo.id ? "compilata da te" : `compilata da ${r.creato_da_nome}`}</p>
          <h1 className="aa-titolo">{r.indirizzo || "Nuova valutazione"}</h1>
          <p className="aa-sottotitolo">Superficie commerciale {fmtMq(c.commerciale)} mq{num(d.prezzi?.valutato) ? ` · valutato ${fmtEur(num(d.prezzi.valutato))}` : ""}{c.euroMq ? ` · ${fmtEur(c.euroMq)}/mq` : ""}</p>
        </div>
        <button className="aa-btn" onClick={() => stampaValutazione(r)}>Scarica PDF</button>
      </div>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2">Immobile e proprietario</h2>
        <div className="aa-griglia-campi">
          <Campo label="Indirizzo immobile *" value={r.indirizzo} onChange={(v) => set("indirizzo", v)} ph="Via, civico, piano, interno" />
          <Campo label="Nome proprietario" value={r.proprietario} onChange={(v) => set("proprietario", v)} />
          <Campo label="Telefono" tipo="tel" value={r.telefono} onChange={(v) => set("telefono", v)} />
          <Campo label="Data valutazione" tipo="date" value={r.data_valutazione} onChange={(v) => set("data_valutazione", v)} />
        </div>
      </section>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2">Calcolo della superficie</h2>
        <p className="aa-nota">Inserisci le misure (es. 4,20 × 3,50) e i mq si calcolano da soli, oppure scrivi direttamente i mq.</p>
        <div className="aa-vl-due">
          <div className="aa-scorri">
            <table className="aa-tabella aa-vl-tab">
              <thead><tr><th>Locali</th><th>Misure</th><th>×</th><th>Mq</th></tr></thead>
              <tbody>
                {LOCALI.map(([k, nome, coeff]) => <RigaMq key={k} nome={nome} coeff={coeff} v={d.locali?.[k]} set={(v) => setD("locali", k, v)} />)}
                {extra.map((x, i) => (
                  <RigaMq key={`x${i}`} nome={x.nome || ""} coeff={1} v={x}
                    onNome={(nome) => setDiretto("locali_extra", extra.map((y, j) => (j === i ? { ...y, nome } : y)))}
                    set={(v) => setDiretto("locali_extra", extra.map((y, j) => (j === i ? { ...v, nome: y.nome } : y)))}
                    rimuovi={() => setDiretto("locali_extra", extra.filter((_, j) => j !== i))} />
                ))}
              </tbody>
            </table>
            <button className="aa-btn aa-btn-piccolo" onClick={() => setDiretto("locali_extra", [...extra, { nome: "", a: "", b: "", mq: "" }])}>+ Aggiungi locale</button>
          </div>
          <div className="aa-scorri">
            <table className="aa-tabella aa-vl-tab">
              <thead><tr><th>Accessori</th><th>Misure</th><th>×</th><th>Mq</th></tr></thead>
              <tbody>
                {ACCESSORI.map(([k, nome]) => <RigaMq key={k} nome={nome} coeff={COEFF_ACC.toFixed(2)} v={d.accessori?.[k]} set={(v) => setD("accessori", k, v)} />)}
              </tbody>
            </table>
            <h3 className="aa-vl-h3">Altri accessori</h3>
            <table className="aa-tabella aa-vl-tab">
              <thead><tr><th></th><th>Mq</th><th>€</th></tr></thead>
              <tbody>
                {ALTRI_ACC.map(([k, nome]) => (
                  <tr key={k}><td>{nome}</td>
                    <td><input className="aa-vl-in aa-vl-num" inputMode="decimal" value={d.altri?.[k]?.mq || ""} onChange={(e) => setD("altri", k, { ...(d.altri?.[k] || {}), mq: e.target.value })} /></td>
                    <td><input className="aa-vl-in" inputMode="decimal" value={d.altri?.[k]?.euro || ""} onChange={(e) => setD("altri", k, { ...(d.altri?.[k] || {}), euro: e.target.value })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="aa-kpi-riga aa-vl-tot">
          <div><span>Superficie netta</span><strong>{fmtMq(c.netta)} mq</strong></div>
          <div><span>Superficie immobile (netta + 10%)</span><strong>{fmtMq(c.immobile)} mq</strong></div>
          <div><span>Superficie accessori (× 0,50)</span><strong>{fmtMq(c.accessori)} mq</strong></div>
          <div className="aa-vl-evid"><span>Superficie commerciale</span><strong>{fmtMq(c.commerciale)} mq</strong></div>
        </div>
      </section>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2">Informazioni generali</h2>
        <div className="aa-griglia-campi">
          {INFO_GENERALI.map((colonna, i) => (
            <div key={i} className="aa-vl-colonna">
              {colonna.map(([k, label, tipo]) => tipo === "sino" ? (
                <div key={k} className="aa-campo"><span>{label}</span>
                  <div className="aa-radio aa-vl-sino">
                    {["SI", "NO"].map((x) => <label key={x}><input type="radio" name={`${k}-${r.id}`} checked={d.info?.[k] === x} onChange={() => setD("info", k, x)} />{x}</label>)}
                  </div>
                </div>
              ) : <Campo key={k} label={label} largo={tipo === true} value={d.info?.[k]} onChange={(v) => setD("info", k, v)} />)}
            </div>
          ))}
        </div>
      </section>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2">Domande da porre al proprietario</h2>
        <div className="aa-vl-domande">
          {DOMANDE.map(([k, q]) => <Campo key={k} label={q} largo value={d.domande?.[k]} onChange={(v) => setD("domande", k, v)} />)}
        </div>
      </section>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2">Altre informazioni</h2>
        <div className="aa-griglia-campi">
          {ALTRE_INFO.map((colonna, i) => (
            <div key={i} className="aa-vl-colonna">
              {colonna.map(([k, label, largo]) => <Campo key={k} label={label} largo={largo} value={d.altre?.[k]} onChange={(v) => setD("altre", k, v)} />)}
            </div>
          ))}
          <div className="aa-vl-colonna">
            <Campo label="Prezzo richiesto €" value={d.prezzi?.richiesto} onChange={(v) => setD("prezzi", "richiesto", v)} />
            <Campo label="Prezzo valutato €" value={d.prezzi?.valutato} onChange={(v) => setD("prezzi", "valutato", v)} />
            {PREZZI_VOCI.map(([k, label]) => <Campo key={k} label={label} value={d.prezzi?.[k]} onChange={(v) => setD("prezzi", k, v)} />)}
            <div className="aa-campo"><span>Prezzo totale €</span><div className="aa-vl-calc">{fmtEur(c.totale)}</div></div>
            <Campo label="Prezzo concordato €" value={d.prezzi?.concordato} onChange={(v) => setD("prezzi", "concordato", v)} />
            <div className="aa-vl-due-campi">
              <Campo label="Esclusiva dal" tipo="date" value={d.prezzi?.escl_dal} onChange={(v) => setD("prezzi", "escl_dal", v)} />
              <Campo label="al" tipo="date" value={d.prezzi?.escl_al} onChange={(v) => setD("prezzi", "escl_al", v)} />
            </div>
            <Campo label="Note" largo value={d.prezzi?.note} onChange={(v) => setD("prezzi", "note", v)} />
          </div>
        </div>
      </section>

      <section className="aa-card aa-sezione">
        <div className="aa-vl-due">
          <div>
            <h2 className="aa-h2">Materiali lasciati al cliente</h2>
            <div className="aa-spunte">
              {MATERIALI.map((m) => <label key={m}><input type="checkbox" checked={(d.materiali || []).includes(m)} onChange={() => setDiretto("materiali", lista("materiali", m))} />{m}</label>)}
            </div>
            <Campo label="Altro" value={d.materiali_altro} onChange={(v) => setDiretto("materiali_altro", v)} />
          </div>
          <div>
            <h2 className="aa-h2">Documenti ricevuti dal cliente</h2>
            <div className="aa-spunte">
              {DOCUMENTI.map((m) => <label key={m}><input type="checkbox" checked={(d.documenti || []).includes(m)} onChange={() => setDiretto("documenti", lista("documenti", m))} />{m}</label>)}
            </div>
            <Campo label="Altro" value={d.documenti_altro} onChange={(v) => setDiretto("documenti_altro", v)} />
          </div>
        </div>
      </section>

      <section className="aa-card aa-sezione">
        <h2 className="aa-h2">Gestione trattativa</h2>
        <div className="aa-scorri">
          <table className="aa-tabella aa-vl-tab">
            <thead><tr><th>N°</th><th>Data</th><th>Attività / esito</th></tr></thead>
            <tbody>
              {trattativa.map((t, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><input className="aa-vl-in" type="date" value={t.data || ""} onChange={(e) => setDiretto("trattativa", trattativa.map((y, j) => (j === i ? { ...y, data: e.target.value } : y)))} /></td>
                  <td><input className="aa-vl-in aa-vl-largo" value={t.testo || ""} onChange={(e) => setDiretto("trattativa", trattativa.map((y, j) => (j === i ? { ...y, testo: e.target.value } : y)))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="aa-btn aa-btn-piccolo" onClick={() => setDiretto("trattativa", [...trattativa, { data: "", testo: "" }])}>+ Aggiungi riga</button>
      </section>

      {msg.testo && <p className={msg.errore ? "aa-errore" : "aa-info"}>{msg.testo}</p>}
      <div className="aa-modulo-azioni aa-vl-azioni">
        <button className="aa-btn aa-btn-pieno" disabled={salvando} onClick={salva}>{salvando ? "Salvataggio…" : modificata ? "Salva modifiche" : "Salva"}</button>
        <button className="aa-btn" onClick={() => stampaValutazione(r)}>Scarica PDF</button>
        {puoEliminare && <button className="aa-btn aa-btn-piccolo" onClick={elimina}>Elimina scheda</button>}
      </div>
    </>
  );
}

/* ---------------- PDF (stampa del browser) ---------------- */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

export function stampaValutazione(r) {
  const d = r.dati || {};
  const c = calcola(d);
  const riga = (label, v) => `<tr><th>${esc(label)}</th><td>${esc(v) || "&nbsp;"}</td></tr>`;
  const tabMq = (titolo, voci, gruppo, coeffF) => `<table class="t"><tr class="h"><td>${titolo}</td><td>Misure</td><td>×</td><td>Mq</td></tr>${voci.map(([k, nome, cf]) => {
    const v = d[gruppo]?.[k] || {}; const mq = mqRiga(v);
    return `<tr><td>${esc(nome)}</td><td>${v.a && v.b ? `${esc(v.a)} × ${esc(v.b)}` : ""}</td><td>${coeffF(cf)}</td><td class="n">${mq ? fmtMq(mq) : ""}</td></tr>`;
  }).join("")}</table>`;
  const extraRows = (d.locali_extra || []).map((x) => { const mq = mqRiga(x); return `<tr><td>${esc(x.nome || "Altro")}</td><td>${x.a && x.b ? `${esc(x.a)} × ${esc(x.b)}` : ""}</td><td>1</td><td class="n">${mq ? fmtMq(mq) : ""}</td></tr>`; }).join("");
  const localiFinal = tabMq("Locali", LOCALI, "locali", (cf) => cf).replace("</table>", extraRows + "</table>");
  const accessori = tabMq("Accessori", ACCESSORI, "accessori", () => "0,50");
  const altri = `<table class="t"><tr class="h"><td>Altri accessori</td><td>Mq</td><td>€</td></tr>${ALTRI_ACC.map(([k, n]) => `<tr><td>${n}</td><td class="n">${esc(d.altri?.[k]?.mq)}</td><td class="n">${esc(d.altri?.[k]?.euro)}</td></tr>`).join("")}</table>`;
  const col = (voci, gruppo) => `<table class="kv">${voci.map(([k, l, t]) => riga(l, t === "sino" ? d[gruppo]?.[k] : d[gruppo]?.[k])).join("")}</table>`;
  const p = d.prezzi || {};
  const prezzi = `<table class="kv">${riga("Prezzo richiesto €", p.richiesto)}${riga("Prezzo valutato €", p.valutato)}${PREZZI_VOCI.map(([k, l]) => riga(l, p[k])).join("")}${riga("Prezzo totale €", c.totale ? Math.round(c.totale).toLocaleString("it-IT") : "")}${riga("Prezzo concordato €", p.concordato)}${riga("Esclusiva", p.escl_dal || p.escl_al ? `dal ${dataIT(p.escl_dal)} al ${dataIT(p.escl_al)}` : "")}${riga("Note", p.note)}</table>`;
  const spunte = (voci, sel, altro) => `<div class="sp">${voci.map((v) => `<span>${(sel || []).includes(v) ? "☑" : "☐"} ${v}</span>`).join("")}${altro ? `<span>Altro: ${esc(altro)}</span>` : ""}</div>`;
  const tratt = (d.trattativa || []).filter((t) => t.data || t.testo);
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Valutazione ${esc(r.indirizzo)}</title>
<style>
@page{size:A4;margin:12mm}
*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#1E2A3F;font-size:9.5pt;margin:0}
.top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #14213D;padding-bottom:6px;margin-bottom:10px}
.top h1{font-family:Georgia,serif;color:#14213D;font-size:17pt;margin:0}.top small{color:#C19A5B;font-weight:bold;letter-spacing:.08em;font-size:7.5pt}
.top .dx{text-align:right;font-size:8.5pt;color:#5B6577}
h2{background:#14213D;color:#fff;font-size:9pt;letter-spacing:.06em;text-transform:uppercase;padding:4px 8px;margin:12px 0 6px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
table{width:100%;border-collapse:collapse}td,th{border:1px solid #D9DEE7;padding:3px 5px;vertical-align:top;text-align:left}
.t .h td{background:#F5EFE4;font-weight:bold;color:#14213D}.n{text-align:right;white-space:nowrap}
.kv th{width:46%;font-weight:normal;color:#5B6577;background:#FAFAFA}
.tot{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}.tot div{border:1px solid #D9DEE7;padding:5px 7px}
.tot span{display:block;font-size:7.5pt;color:#5B6577}.tot b{font-size:11pt;color:#14213D}.tot .ev{background:#14213D}.tot .ev span,.tot .ev b{color:#fff}
.q th{width:50%}.sp{display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px 10px}
.foot{margin-top:14px;border-top:1px solid #D9DEE7;padding-top:5px;font-size:7.5pt;color:#5B6577;display:flex;justify-content:space-between}
.pb{break-before:page}
</style></head><body>
<div class="top"><div><small>FC PUNTO HUB · FONDOCASA HUB NAPOLI</small><h1>Scheda valutazione immobile</h1></div>
<div class="dx">Data: <b>${dataIT(r.data_valutazione)}</b><br>Agente: ${esc(r.creato_da_nome)}${r.team ? ` · ${esc(r.team)}` : ""}</div></div>
<table class="kv">${riga("Indirizzo immobile", r.indirizzo)}${riga("Nome proprietario", r.proprietario)}${riga("Telefono", r.telefono)}</table>
<h2>Calcolo della superficie</h2>
<div class="g2"><div>${localiFinal}</div><div>${accessori}<div style="height:6px"></div>${altri}</div></div>
<div class="tot"><div><span>Superficie netta</span><b>${fmtMq(c.netta)} mq</b></div><div><span>Superficie immobile (netta + 10%)</span><b>${fmtMq(c.immobile)} mq</b></div>
<div><span>Superficie accessori (× 0,50)</span><b>${fmtMq(c.accessori)} mq</b></div><div class="ev"><span>Superficie commerciale</span><b>${fmtMq(c.commerciale)} mq</b></div></div>
<h2>Informazioni generali</h2>
<div class="g3">${INFO_GENERALI.map((v) => col(v, "info")).join("")}</div>
<h2 class="pb">Domande da porre al proprietario</h2>
<table class="kv q">${DOMANDE.map(([k, q]) => riga(q, d.domande?.[k])).join("")}</table>
<h2>Altre informazioni e prezzi</h2>
<div class="g3">${ALTRE_INFO.map((v) => col(v, "altre")).join("")}${prezzi}</div>
${c.euroMq ? `<p style="margin:6px 0 0;color:#5B6577">Prezzo valutato al mq commerciale: <b style="color:#14213D">${fmtEur(c.euroMq)}/mq</b></p>` : ""}
<div class="g2"><div><h2>Materiali lasciati al cliente</h2>${spunte(MATERIALI, d.materiali, d.materiali_altro)}</div>
<div><h2>Documenti ricevuti dal cliente</h2>${spunte(DOCUMENTI, d.documenti, d.documenti_altro)}</div></div>
<h2>Gestione trattativa</h2>
<table class="t"><tr class="h"><td style="width:6%">N°</td><td style="width:16%">Data</td><td>Attività / esito</td></tr>
${(tratt.length ? tratt : Array.from({ length: 5 }, () => ({}))).map((t, i) => `<tr><td>${i + 1}</td><td>${dataIT(t.data)}</td><td>${esc(t.testo) || "&nbsp;"}</td></tr>`).join("")}</table>
<div class="foot"><span>FC Punto Hub Srl · Via Pietro Mascagni 35, Napoli · 081 18653202 · na.vomero@fondocasa.it</span><span>Documento interno · fondocasahub.com</span></div>
<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) { alert("Il browser ha bloccato la finestra: consenti i popup per scaricare il PDF."); return; }
  w.document.open(); w.document.write(html); w.document.close();
}
