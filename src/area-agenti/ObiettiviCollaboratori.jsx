import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Obiettivi per collaboratore (budget dei One to One) contro il reale, trimestre per trimestre.
// Store Manager e Amministrazione vedono tutti, il Team Manager il suo team, l'agente solo sé stesso.
const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const euro = (v) => `${Math.round(Number(v) || 0).toLocaleString("it-IT")} €`;
const pctTxt = (x) => `${x >= 0 ? "+" : "−"}${Math.abs(x).toFixed(1).replace(".", ",")}%`;

// Quota di obiettivo maturata a oggi: trimestri chiusi interi + trimestre in corso pro quota (mesi trascorsi su 3)
function quotaAOggi(trimestri, anno) {
  const oggi = new Date();
  if (anno < oggi.getFullYear()) return trimestri.reduce((s, v) => s + Number(v || 0), 0);
  if (anno > oggi.getFullYear()) return 0;
  const m = oggi.getMonth(); const qc = Math.floor(m / 3); const fraz = ((m % 3) + 1) / 3;
  return trimestri.reduce((s, v, i) => s + (i < qc ? Number(v || 0) : i === qc ? Number(v || 0) * fraz : 0), 0);
}
function realeAOggi(reale, anno) {
  const oggi = new Date();
  if (anno !== oggi.getFullYear()) return reale.reduce((s, v) => s + Number(v), 0);
  const qc = Math.floor(oggi.getMonth() / 3);
  return reale.reduce((s, v, i) => s + (i <= qc ? Number(v) : 0), 0);
}

export default function ObiettiviCollaboratori({ profilo, stampa }) {
  const annoCorr = new Date().getFullYear();
  const [anno, setAnno] = useState(new Date().getMonth() >= 9 ? annoCorr + 1 : annoCorr);
  const [righe, setRighe] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setRighe(null); setErr("");
    supabase.rpc("obiettivi_collaboratori", { p_anno: anno }).then(({ data, error }) => {
      if (error) setErr(error.message);
      setRighe(data || []);
    });
  }, [anno]);

  if (righe !== null && righe.length === 0 && !err && profilo.ruolo !== "admin") return null;

  // Una riga per collaboratore con fatturato e incarichi affiancati
  const coll = {};
  (righe || []).forEach((r) => {
    const c = (coll[r.profilo] = coll[r.profilo] || { nome: r.nome, team: r.team || "Senza team", livello: r.livello });
    c[r.voce] = { ob: Number(r.obiettivo), tr: (r.trimestri || [0, 0, 0, 0]).map(Number), re: (r.reale || [0, 0, 0, 0]).map(Number),
      qd: r.quota_diretta === null || r.quota_diretta === undefined ? null : Number(r.quota_diretta), rd: (r.reale_diretto || [0, 0, 0, 0]).map(Number) };
    if (c[r.voce].qd !== null) c.nota = `diretta ${euro(c[r.voce].qd)} (nel totale team)`;
  });
  const lista = Object.values(coll).sort((a, b) => b.team.localeCompare(a.team) || a.nome.localeCompare(b.nome));
  const teams = [...new Set(lista.map((c) => c.team))];
  const somma = (arr, voce) => {
    const out = { ob: 0, tr: [0, 0, 0, 0], re: [0, 0, 0, 0] };
    // Per il Buyer entra nel totale solo l'attività diretta: quella sul team è già nel fatturato dei colleghi
    arr.forEach((c) => {
      const v = c[voce]; if (!v) return;
      const k = v.qd !== null && v.ob ? v.qd / v.ob : 1;
      out.ob += v.ob * k; v.tr.forEach((x, i) => { out.tr[i] += x * k; out.re[i] += v.qd !== null ? v.rd[i] : v.re[i]; });
    });
    return out;
  };
  const scost = (v) => {
    if (!v || !v.ob) return null;
    const ob = quotaAOggi(v.tr, anno), re = realeAOggi(v.re, anno);
    return { ob, re, d: re - ob, pct: ob ? ((re - ob) / ob) * 100 : null, av: (v.re.reduce((s, x) => s + x, 0) / v.ob) * 100 };
  };
  const fmtN = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ","));

  const Cella = ({ v, i, eur }) => {
    if (!v) return <td className="aa-ob-cella">—</td>;
    const ob = v.tr[i], re = v.re[i];
    const oggi = new Date(); const passato = anno < oggi.getFullYear() || (anno === oggi.getFullYear() && i < Math.floor(oggi.getMonth() / 3));
    const cls = passato && ob ? (re >= ob ? "aa-testo-verde" : "aa-testo-rosso") : "";
    return <td className="aa-ob-cella"><strong className={cls}>{eur ? euro(re) : fmtN(re)}</strong><small> / {eur ? euro(ob) : fmtN(ob)}</small></td>;
  };
  const Scost = ({ v, eur }) => {
    const s = scost(v);
    if (!s) return <td>—</td>;
    if (anno > annoCorr) return <td><small>da gennaio {anno}</small></td>;
    return <td className={s.d >= 0 ? "aa-testo-verde" : "aa-testo-rosso"}>{s.d >= 0 ? "+" : "−"}{eur ? euro(Math.abs(s.d)) : fmtN(Math.abs(s.d))}{s.pct !== null && <small> ({pctTxt(s.pct)})</small>}</td>;
  };
  const Righe = ({ c, titolo, totale }) => (
    <>
      <tr className={totale ? "aa-riga-totale" : ""}>
        <td rowSpan={2}><strong>{titolo}</strong>{!totale && <small className="aa-ob-liv"><br />{(c.livello || "").replace("_", " ")}</small>}{!totale && c.nota && <small><br />{c.nota}</small>}</td>
        <td><small>Fatturato</small></td>
        {[0, 1, 2, 3].map((i) => <Cella key={i} v={c.fatturato} i={i} eur />)}
        <td className="aa-ob-cella"><strong>{c.fatturato ? euro(c.fatturato.re.reduce((s, x) => s + x, 0)) : "—"}</strong>{c.fatturato && <small> / {euro(c.fatturato.ob)}</small>}</td>
        <Scost v={c.fatturato} eur />
        <td>{c.fatturato ? `${scost(c.fatturato).av.toFixed(1).replace(".", ",")}%` : "—"}</td>
      </tr>
      <tr className={totale ? "aa-riga-totale" : "aa-ob-riga2"}>
        <td><small>Incarichi</small></td>
        {[0, 1, 2, 3].map((i) => <Cella key={i} v={c.incarichi} i={i} />)}
        <td className="aa-ob-cella"><strong>{c.incarichi ? fmtN(c.incarichi.re.reduce((s, x) => s + x, 0)) : "—"}</strong>{c.incarichi && <small> / {fmtN(c.incarichi.ob)}</small>}</td>
        <Scost v={c.incarichi} />
        <td>{c.incarichi ? `${scost(c.incarichi).av.toFixed(1).replace(".", ",")}%` : "—"}</td>
      </tr>
    </>
  );

  const stampaObiettivi = () => {
    const cellaH = (v, i, eur) => (v ? `${eur ? euro(v.re[i]) : fmtN(v.re[i])} <small>/ ${eur ? euro(v.tr[i]) : fmtN(v.tr[i])}</small>` : "—");
    const scH = (v, eur) => { const s = scost(v); if (!s || anno > annoCorr) return "—"; return `${s.d >= 0 ? "+" : "−"}${eur ? euro(Math.abs(s.d)) : fmtN(Math.abs(s.d))}${s.pct !== null ? ` (${pctTxt(s.pct)})` : ""}`; };
    const totH = (v, eur) => (v ? `${eur ? euro(v.re.reduce((s, x) => s + x, 0)) : fmtN(v.re.reduce((s, x) => s + x, 0))} <small>/ ${eur ? euro(v.ob) : fmtN(v.ob)}</small>` : "—");
    const blocco = (c, titolo, cls = "") => ["fatturato", "incarichi"].map((voce, k) => `<tr class="${cls}">${k === 0 ? `<td rowspan="2"><b>${esc(titolo)}</b></td>` : ""}<td>${voce === "fatturato" ? "Fatturato" : "Incarichi"}</td>${[0, 1, 2, 3].map((i) => `<td class="n">${cellaH(c[voce], i, voce === "fatturato")}</td>`).join("")}<td class="n">${totH(c[voce], voce === "fatturato")}</td><td class="n">${scH(c[voce], voce === "fatturato")}</td></tr>`).join("");
    const corpo = teams.map((t) => {
      const membri = lista.filter((c) => c.team === t);
      return `<h2>${esc(t)}</h2><table><tr class="h"><th>Collaboratore</th><th></th><th class="n">1° trim.</th><th class="n">2° trim.</th><th class="n">3° trim.</th><th class="n">4° trim.</th><th class="n">Anno</th><th class="n">Scostamento a oggi</th></tr>
        ${membri.map((c) => blocco(c, c.nome)).join("")}${membri.length > 1 ? blocco({ fatturato: somma(membri, "fatturato"), incarichi: somma(membri, "incarichi") }, `Totale ${t}`, "t") : ""}</table>`;
    }).join("") + (teams.length > 1 ? `<h2>Totale store</h2><table>${blocco({ fatturato: somma(lista, "fatturato"), incarichi: somma(lista, "incarichi") }, "Totale store", "t")}</table>` : "");
    stampa(`Obiettivi ${anno} per collaboratore`, `<p class="obj">Valori: <b>reale</b> / obiettivo. Scostamento a oggi sul pro quota dell'obiettivo (trimestri chiusi + trimestre in corso).</p>${corpo}`, true);
  };

  return (
    <section className="aa-card">
      <div className="aa-riga-titolo">
        <h2 className="aa-h2">Obiettivi per collaboratore</h2>
        <div className="aa-azioni-testata">
          <select value={anno} onChange={(e) => setAnno(Number(e.target.value))}>
            {[annoCorr + 1, annoCorr, annoCorr - 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="aa-btn" onClick={stampaObiettivi} disabled={!lista.length}>Stampa obiettivi {anno}</button>
        </div>
      </div>
      <p className="aa-nota">Budget dei One to One: in grassetto il reale, accanto l'obiettivo. Il fatturato conta gli incassi registrati qui (per il Buyer anche quelli in cui ha la quota Buyer); gli incarichi contano gli immobili acquisiti in Area Agenti. Lo scostamento confronta il reale con l'obiettivo maturato a oggi.</p>
      {err && <p className="aa-errore">{err}</p>}
      {righe === null ? <p className="aa-nota">Caricamento…</p> : lista.length === 0 ? <p className="aa-nota">Nessun obiettivo {anno} caricato.</p> : (
        teams.map((t) => {
          const membri = lista.filter((c) => c.team === t);
          return (
            <div key={t}>
              <h3 className="aa-h3">{t}</h3>
              <div className="aa-scorri">
                <table className="aa-tabella aa-tabella-obiettivi">
                  <thead><tr><th>Collaboratore</th><th></th><th>1° trim.</th><th>2° trim.</th><th>3° trim.</th><th>4° trim.</th><th>Anno</th><th>Scostamento a oggi</th><th>Avanzamento</th></tr></thead>
                  <tbody>
                    {membri.map((c) => <Righe key={c.nome} c={c} titolo={c.nome} />)}
                    {membri.length > 1 && <Righe c={{ fatturato: somma(membri, "fatturato"), incarichi: somma(membri, "incarichi") }} titolo={`Totale ${t}`} totale />}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
      {teams.length > 1 && (
        <div className="aa-scorri">
          <table className="aa-tabella aa-tabella-obiettivi">
            <thead><tr><th>Store</th><th></th><th>1° trim.</th><th>2° trim.</th><th>3° trim.</th><th>4° trim.</th><th>Anno</th><th>Scostamento a oggi</th><th>Avanzamento</th></tr></thead>
            <tbody><Righe c={{ fatturato: somma(lista, "fatturato"), incarichi: somma(lista, "incarichi") }} titolo="Totale store" totale /></tbody>
          </table>
        </div>
      )}
    </section>
  );
}
