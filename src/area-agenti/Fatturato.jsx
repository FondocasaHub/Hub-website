import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { euro } from "./compensi";
import { ALIQUOTE, TIPOLOGIE, ripartisci, buyerDi, elencoMesi, intervallo, notaPagamento } from "./incassi";

const dataIT = (iso) => (iso ? new Date(iso).toLocaleDateString("it-IT") : "");
const OBIETTIVO_TEAM = 410000; // piano compensi: 1 TM + 1 Senior + 2 Junior + 2 New
const PRODUTTORI = [...Object.keys(ALIQUOTE), "buyer"];
const MESI = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Rendiconto stampabile (A4) con logo HUB in testa e piedino ufficiale nella fascia navy
function stampaRendiconto(titolo, corpo, orizzontale = false) {
  const base = window.location.origin;
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>${esc(titolo)}</title>
<style>
@page{size:A4 ${orizzontale ? "landscape" : "portrait"};margin:12mm 12mm 26mm}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:Jost,Arial,Helvetica,sans-serif;color:#0A1628;font-size:9.5pt;margin:0}
.top{display:flex;justify-content:space-between;align-items:center;background:#0A1628;color:#FCFDFD;padding:10px 14px;border-radius:6px}
.top img{height:46px}.top .dx{text-align:right;font-size:8.5pt}.top .dx b{display:block;font-size:13pt;color:#C9A84C;letter-spacing:.02em}
h1{font-size:15pt;margin:14px 0 2px}.sotto{color:#5B6577;font-size:8.5pt;margin:0 0 10px}
h2{font-size:9pt;letter-spacing:.08em;text-transform:uppercase;color:#FCFDFD;background:#0A1628;padding:5px 8px;margin:16px 0 6px}
table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #D9DEE7;padding:4px 6px;text-align:left;vertical-align:top}
tr.h th{background:#F3F1EA;font-size:8.5pt}td.n,th.n{text-align:right;white-space:nowrap}td.c,th.c{text-align:center}
tr.t td{background:#0A1628;color:#FCFDFD;font-weight:bold}tr.q td{font-size:7.8pt;color:#5B6577;border-bottom:1px solid #EEE;padding-top:0}
small{color:#5B6577}.kpi{display:flex;gap:8px;margin:6px 0}.kpi div{flex:1;border:1px solid #D9DEE7;border-top:3px solid #C9A84C;padding:7px 9px}
.kpi span{display:block;font-size:7.5pt;text-transform:uppercase;letter-spacing:.06em;color:#5B6577}.kpi b{font-size:13pt;display:block}.kpi small{display:block}
.obj{margin:4px 0;font-size:8.5pt}
.foot{position:fixed;left:0;right:0;bottom:-18mm;background:#0A1628;color:#FCFDFD;display:flex;justify-content:space-between;align-items:center;padding:6px 12px;font-size:7.5pt}
.foot img{height:22px}
</style></head><body>
<div class="top"><img src="${base}/images/logo-hub-bianco.png" alt="HUB"><div class="dx"><b>FC Punto Hub</b>Registro incassi · documento riservato</div></div>
<h1>${esc(titolo)}</h1><p class="sotto">Stampato il ${new Date().toLocaleDateString("it-IT")} alle ${new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</p>
${corpo}
<div class="foot"><span>FC Punto Hub Srl · Via Pietro Mascagni 35, Napoli · P.IVA 01924140096 · na.vomero@fondocasa.it</span><img src="${base}/images/immobile/piedino.png" alt="FondoCasa · weunit.it · Henia"></div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) { alert("Il browser ha bloccato la finestra: consenti i popup per fondocasahub.com per stampare."); return; }
  w.document.open(); w.document.write(html); w.document.close();
}

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

  // Fatturato per team da inizio anno (solo Store Manager e Amministrazione)
  const anno = new Date().getFullYear();
  const [annoRighe, setAnnoRighe] = useState(null);
  useEffect(() => {
    if (!vedeRiepilogo) return;
    supabase.from("incassi").select("team, importo, quote").gte("data_incasso", `${anno}-01-01`).lte("data_incasso", `${anno}-12-31`)
      .then(({ data }) => setAnnoRighe(data || []));
  }, [vedeRiepilogo, anno, righe]);

  // Riepilogo dell'anno mese per mese (Store Manager e Amministrazione)
  const [annoSel, setAnnoSel] = useState(anno);
  const [annuale, setAnnuale] = useState(null);
  useEffect(() => {
    if (!vedeRiepilogo) return;
    setAnnuale(null);
    supabase.from("incassi").select("data_incasso, team, importo, quote").gte("data_incasso", `${annoSel}-01-01`).lte("data_incasso", `${annoSel}-12-31`)
      .then(({ data }) => setAnnuale(data || []));
  }, [vedeRiepilogo, annoSel, righe]);

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

  const quotaHub = (r) => Number((r.quote || []).find((q) => q.hub)?.importo || 0);
  const teamTab = {};
  const aggiungi = (r, campo) => {
    const t = r.team || "Senza team";
    teamTab[t] = teamTab[t] || { op: 0, periodo: 0, hub: 0, anno: 0 };
    if (campo === "periodo") { teamTab[t].op += 1; teamTab[t].periodo += Number(r.importo); teamTab[t].hub += quotaHub(r); }
    else teamTab[t].anno += Number(r.importo);
  };
  if (vedeRiepilogo) { lista.forEach((r) => aggiungi(r, "periodo")); (annoRighe || []).forEach((r) => aggiungi(r, "anno")); }

  // Tabella mensile dell'anno scelto
  const teamAnno = [...new Set((annuale || []).map((r) => r.team || "Senza team"))].sort();
  const mesiAnno = Array.from({ length: 12 }, (_, m) => ({ m, op: 0, tot: 0, hub: 0, team: {} }));
  (annuale || []).forEach((r) => {
    const x = mesiAnno[new Date(r.data_incasso + "T12:00").getMonth()];
    const t = r.team || "Senza team", imp = Number(r.importo);
    x.op += 1; x.tot += imp; x.hub += quotaHub(r); x.team[t] = (x.team[t] || 0) + imp;
  });
  const totAnno = mesiAnno.reduce((acc, x) => ({ op: acc.op + x.op, tot: acc.tot + x.tot, hub: acc.hub + x.hub }), { op: 0, tot: 0, hub: 0 });
  const totTeamAnno = (t) => mesiAnno.reduce((s2, x) => s2 + (x.team[t] || 0), 0);

  const riepilogo = {};
  if (vedeRiepilogo) lista.forEach((r) => (r.quote || []).filter((q) => !q.hub).forEach((q) => {
    const k = q.chi || `__${q.voce}`;
    riepilogo[k] = riepilogo[k] || { nome: q.mancante ? `Non assegnato (${q.voce})` : q.nome, voci: {}, totale: 0 };
    riepilogo[k].voci[q.voce] = (riepilogo[k].voci[q.voce] || 0) + Number(q.importo);
    riepilogo[k].totale += Number(q.importo);
  }));

  const periodoTesto = `${mesi[mese].etichetta}${parte === "1" ? " · incassi dal 1 al 15" : parte === "2" ? " · incassi dal 16 a fine mese" : ""}`;
  const stampaPeriodo = () => {
    const tabTeam = Object.entries(teamTab).sort((x, y) => y[1].periodo - x[1].periodo).map(([t, v]) =>
      `<tr><td>${esc(t)}</td><td class="c">${v.op}</td><td class="n">${euro(v.periodo)}</td><td class="c">${totale ? Math.round(v.periodo / totale * 100) + "%" : "—"}</td><td class="n">${euro(v.hub)}</td><td class="n">${euro(v.anno)}</td></tr>`).join("");
    const tabRiep = Object.values(riepilogo).sort((x, y) => y.totale - x.totale).map((r) =>
      `<tr><td>${esc(r.nome)}</td><td><small>${Object.entries(r.voci).map(([v, i]) => `${esc(v)} ${euro(i)}`).join(" · ")}</small></td><td class="n">${euro(r.totale)}</td></tr>`).join("");
    const tabOp = lista.slice().sort((x, y) => x.data_incasso.localeCompare(y.data_incasso)).map((r) =>
      `<tr><td>${dataIT(r.data_incasso)}</td><td>${esc(r.produttore_nome)}<br><small>${esc(r.team || "—")}</small></td><td>${esc(r.cliente)}${r.indirizzo ? `<br><small>${esc(r.indirizzo)}</small>` : ""}</td><td>${esc(r.lato)}</td><td class="n">${euro(r.importo)}</td></tr>
       <tr class="q"><td></td><td colspan="4">${(r.quote || []).map((q) => `${esc(q.mancante ? "Non assegnato" : q.nome)} · ${esc(q.voce)} ${q.pct}% <b>${euro(q.importo)}</b>`).join(" &nbsp;|&nbsp; ")}</td></tr>`).join("");
    stampaRendiconto(`Rendiconto incassi · ${periodoTesto}`, `
      <div class="kpi"><div><span>Incassato nel periodo</span><b>${euro(totale)}</b><small>${lista.length} operazioni</small></div>
      <div><span>Quota FC Punto Hub</span><b>${euro(hub)}</b></div><div><span>Filiera</span><b>${euro(totale - hub)}</b></div></div>
      <h2>Fatturato per team</h2>
      ${tabTeam ? `<table><tr class="h"><th>Team</th><th class="c">Operazioni</th><th class="n">Fatturato periodo</th><th class="c">%</th><th class="n">Quota Hub</th><th class="n">Da inizio ${anno}</th></tr>${tabTeam}
      <tr class="t"><td>Totale store</td><td class="c">${lista.length}</td><td class="n">${euro(totale)}</td><td class="c">100%</td><td class="n">${euro(hub)}</td><td class="n">${euro(Object.values(teamTab).reduce((x, v) => x + v.anno, 0))}</td></tr></table>` : "<p>Nessun incasso nel periodo.</p>"}
      <h2>Riepilogo importi da fatturare</h2>
      ${tabRiep ? `<table><tr class="h"><th>Collaboratore</th><th>Voci</th><th class="n">Da fatturare</th></tr>${tabRiep}</table>` : "<p>Nessun importo nel periodo.</p>"}
      <h2>Operazioni incassate</h2>
      ${tabOp ? `<table><tr class="h"><th>Incasso</th><th>Collaboratore</th><th>Cliente / immobile</th><th>Lato</th><th class="n">Importo</th></tr>${tabOp}</table>` : "<p>Nessuna operazione nel periodo.</p>"}`);
  };
  const stampaAnno = () => {
    const righeM = mesiAnno.map((x) => `<tr><td>${MESI[x.m]}</td><td class="c">${x.op || "—"}</td>${teamAnno.map((t) => `<td class="n">${x.team[t] ? euro(x.team[t]) : "—"}</td>`).join("")}<td class="n"><b>${x.tot ? euro(x.tot) : "—"}</b></td><td class="n">${x.hub ? euro(x.hub) : "—"}</td><td class="n">${x.tot ? euro(x.tot - x.hub) : "—"}</td></tr>`).join("");
    stampaRendiconto(`Riepilogo annuale incassi ${annoSel}`, `
      <div class="kpi"><div><span>Incassato ${annoSel}</span><b>${euro(totAnno.tot)}</b><small>${totAnno.op} operazioni</small></div>
      <div><span>Quota FC Punto Hub</span><b>${euro(totAnno.hub)}</b></div><div><span>Filiera</span><b>${euro(totAnno.tot - totAnno.hub)}</b></div></div>
      <h2>Incassi mese per mese</h2>
      <table><tr class="h"><th>Mese</th><th class="c">Operazioni</th>${teamAnno.map((t) => `<th class="n">${esc(t)}</th>`).join("")}<th class="n">Totale</th><th class="n">Quota Hub</th><th class="n">Filiera</th></tr>${righeM}
      <tr class="t"><td>Totale ${annoSel}</td><td class="c">${totAnno.op}</td>${teamAnno.map((t) => `<td class="n">${euro(totTeamAnno(t))}</td>`).join("")}<td class="n">${euro(totAnno.tot)}</td><td class="n">${euro(totAnno.hub)}</td><td class="n">${euro(totAnno.tot - totAnno.hub)}</td></tr></table>
      ${teamAnno.filter((t) => t !== "Senza team").map((t) => `<p class="obj">${esc(t)}: ${euro(totTeamAnno(t))} su obiettivo ${euro(OBIETTIVO_TEAM)} · ${(totTeamAnno(t) / OBIETTIVO_TEAM * 100).toFixed(1).replace(".", ",")}%</p>`).join("")}`, true);
  };

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
        <div className="aa-azioni-testata">
          {vedeRiepilogo && <button className="aa-btn" onClick={stampaPeriodo} disabled={righe === null}>Stampa rendiconto</button>}
          {isAdmin && <button className="aa-btn aa-btn-pieno" onClick={() => setNuovo(!nuovo)}>{nuovo ? "Chiudi" : "+ Nuovo incasso"}</button>}
        </div>
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
        {!vedeRiepilogo && Object.keys(perTeam).length > 1 && Object.entries(perTeam).map(([t, v]) => (
          <div key={t} className="aa-kpi-box"><span>{t}</span><strong>{euro(v)}</strong></div>
        ))}
        {vedeRiepilogo && <div className="aa-kpi-box"><span>Quota FC Punto Hub</span><strong>{euro(hub)}</strong><small>filiera {euro(totale - hub)}</small></div>}
        {!isAmm && <div className="aa-kpi-box aa-kpi-oro"><span>{isMkt ? "Il tuo 4% da fatturare" : "I tuoi compensi nel periodo"}</span><strong>{euro(mioTotale)}</strong></div>}
      </div>

      {vedeRiepilogo && (
        <section className="aa-card">
          <h2 className="aa-h2">Fatturato per team</h2>
          <p className="aa-nota">Periodo selezionato e progressivo {anno}. Obiettivo del piano compensi: {euro(OBIETTIVO_TEAM)} l'anno per team.</p>
          {Object.keys(teamTab).length === 0 ? <p className="aa-nota">Nessun incasso nel {anno}.</p> : (
            <div className="aa-scorri">
              <table className="aa-tabella">
                <thead><tr><th>Team</th><th>Operazioni</th><th>Fatturato periodo</th><th>% sul periodo</th><th>Quota FC Punto Hub</th><th>Da inizio {anno}</th><th>Obiettivo annuo</th></tr></thead>
                <tbody>
                  {Object.entries(teamTab).sort((x, y) => y[1].anno - x[1].anno).map(([t, v]) => {
                    const pctObj = t === "Senza team" ? null : Math.min(100, (v.anno / OBIETTIVO_TEAM) * 100);
                    return (
                      <tr key={t}>
                        <td><strong>{t}</strong></td>
                        <td>{v.op}</td>
                        <td><strong>{euro(v.periodo)}</strong></td>
                        <td>{totale ? `${Math.round((v.periodo / totale) * 100)}%` : "—"}</td>
                        <td>{euro(v.hub)}</td>
                        <td><strong>{euro(v.anno)}</strong></td>
                        <td>{pctObj === null ? "—" : <><div className="aa-barra-avanz"><span style={{ width: `${pctObj}%` }} /></div><small className="aa-nota">{pctObj.toFixed(1).replace(".", ",")}%</small></>}</td>
                      </tr>
                    );
                  })}
                  <tr className="aa-riga-totale">
                    <td><strong>Totale store</strong></td>
                    <td>{lista.length}</td>
                    <td><strong>{euro(totale)}</strong></td>
                    <td>{totale ? "100%" : "—"}</td>
                    <td>{euro(hub)}</td>
                    <td><strong>{euro(Object.values(teamTab).reduce((x, v) => x + v.anno, 0))}</strong></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {vedeRiepilogo && (
        <section className="aa-card">
          <div className="aa-riga-titolo">
            <h2 className="aa-h2">Riepilogo annuale per mese</h2>
            <div className="aa-azioni-testata">
              <select value={annoSel} onChange={(e) => setAnnoSel(Number(e.target.value))}>
                {[anno, anno - 1, anno - 2].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <button className="aa-btn" onClick={stampaAnno} disabled={annuale === null}>Stampa riepilogo {annoSel}</button>
            </div>
          </div>
          {annuale === null ? <p className="aa-nota">Caricamento…</p> : (
            <div className="aa-scorri">
              <table className="aa-tabella">
                <thead><tr><th>Mese</th><th>Operazioni</th>{teamAnno.map((t) => <th key={t}>{t}</th>)}<th>Totale</th><th>Quota FC Punto Hub</th><th>Filiera</th></tr></thead>
                <tbody>
                  {mesiAnno.map((x) => (
                    <tr key={x.m}>
                      <td>{MESI[x.m]}</td><td>{x.op || "—"}</td>
                      {teamAnno.map((t) => <td key={t}>{x.team[t] ? euro(x.team[t]) : "—"}</td>)}
                      <td><strong>{x.tot ? euro(x.tot) : "—"}</strong></td><td>{x.hub ? euro(x.hub) : "—"}</td><td>{x.tot ? euro(x.tot - x.hub) : "—"}</td>
                    </tr>
                  ))}
                  <tr className="aa-riga-totale">
                    <td><strong>Totale {annoSel}</strong></td><td>{totAnno.op}</td>
                    {teamAnno.map((t) => <td key={t}><strong>{euro(totTeamAnno(t))}</strong></td>)}
                    <td><strong>{euro(totAnno.tot)}</strong></td><td>{euro(totAnno.hub)}</td><td>{euro(totAnno.tot - totAnno.hub)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

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
