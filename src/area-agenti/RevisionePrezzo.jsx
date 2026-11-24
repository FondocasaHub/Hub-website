import React, { useState } from "react";

// Modulo "Revisione prezzo di vendita e rinnovo incarico" (Listing Agent, 24/11/2026).
// Si compila nel browser e si stampa / salva in PDF nello stile dei documenti HUB:
// fascia navy con logo, sezioni numerate, footer navy con dati societari e piedino.
// Nessun dato viene salvato.

const AZIENDA = {
  nome: "FC Punto Hub S.r.l.",
  piva: "01924140096",
  sede: "Via Pietro Mascagni 35, Napoli (Vomero)",
  contatti: "PEC fcpuntohub@pec.it · na.vomero@fondocasa.it · Tel. +39 081 18653202",
};

const num = (v) => {
  if (v === null || v === undefined || v === "") return NaN;
  let s = String(v).trim().replace(/[€\s]/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
};
const eur = (n) => (Number.isFinite(n) ? "€ " + Math.round(n).toLocaleString("it-IT", { useGrouping: "always" }) : "");
const oggi = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const dataIT = (iso) => (iso ? new Date(iso + "T12:00").toLocaleDateString("it-IT") : "");
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const TIPI = [["esclusiva", "In esclusiva"], ["non_esclusiva", "Non in esclusiva"], ["zv60", "Zero Vincoli 60"]];
const MOTIVI = [["mercato", "Andamento del mercato"], ["feedback", "Feedback visite / proposte"], ["report", "Report di performance"], ["venditore", "Esigenze del Venditore"]];

const VUOTO = (p) => ({
  prot: "", data_doc: oggi(),
  v1_nome: "", v1_cf: "", v1_res: "", v1_cont: "", v2_nome: "", v2_cf: "",
  agente: p?.nome || "", team: p?.team || "",
  indirizzo: "", comune: "Napoli", piano: "", foglio: "", part: "", sub: "", tipologia: "",
  inc_num: "", data_incarico: "", scadenza_orig: "", prezzo_iniziale: "", tipo: "esclusiva",
  data_revisione: oggi(), prezzo_attuale: "", nuovo_prezzo: "", motivi: [], motivo_altro: "",
  scadenza: "invariata", nuova_scadenza: "", mesi: "", tacito: "no", tacito_mesi: "",
  note: "", luogo: "Napoli", data_firma: oggi(),
});

export default function RevisionePrezzo({ profilo, vai }) {
  const [f, setF] = useState(() => VUOTO(profilo));
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const toggleMotivo = (m) => setF((x) => ({ ...x, motivi: x.motivi.includes(m) ? x.motivi.filter((y) => y !== m) : [...x.motivi, m] }));

  const att = num(f.prezzo_attuale), nuovo = num(f.nuovo_prezzo);
  const riduzione = Number.isFinite(att) && Number.isFinite(nuovo) ? att - nuovo : NaN;
  const perc = Number.isFinite(riduzione) && att > 0 ? (riduzione / att) * 100 : NaN;

  const avvisi = [];
  if (Number.isFinite(riduzione) && riduzione <= 0) avvisi.push("Il nuovo prezzo non è inferiore al prezzo attuale.");
  if (f.scadenza === "proroga" && f.nuova_scadenza && f.scadenza_orig && f.nuova_scadenza <= f.scadenza_orig)
    avvisi.push("La nuova scadenza è precedente o uguale alla scadenza originaria.");
  if (f.scadenza === "proroga" && !f.nuova_scadenza) avvisi.push("Hai scelto la proroga: indica la nuova scadenza dell'incarico.");

  return (
    <>
      <button className="aa-link" onClick={() => vai("documenti")}>← Documenti</button>
      <div className="aa-intestazione">
        <p className="aa-occhiello">Listing Agent · modulistica online</p>
        <h1 className="aa-titolo">Revisione prezzo di vendita</h1>
        <p className="aa-sottotitolo">Riduzione del prezzo dell'incarico ed eventuale rinnovo della scadenza. Compilalo con il proprietario, poi stampalo o salvalo in PDF e fallo firmare.</p>
      </div>

      <Sezione n="01" titolo="Parti">
        <Campo label="N. protocollo" value={f.prot} onChange={set("prot")} />
        <Campo label="Data documento" tipo="date" value={f.data_doc} onChange={set("data_doc")} />
        <span />
        <Campo label="Venditore 1 · cognome e nome" value={f.v1_nome} onChange={set("v1_nome")} />
        <Campo label="Venditore 1 · codice fiscale" value={f.v1_cf} onChange={set("v1_cf")} />
        <Campo label="Venditore 1 · telefono / e-mail" value={f.v1_cont} onChange={set("v1_cont")} />
        <Campo label="Venditore 1 · residente in (indirizzo, comune)" value={f.v1_res} onChange={set("v1_res")} largo />
        <Campo label="Venditore 2 (eventuale) · cognome e nome" value={f.v2_nome} onChange={set("v2_nome")} />
        <Campo label="Venditore 2 · codice fiscale" value={f.v2_cf} onChange={set("v2_cf")} />
        <span />
        <Campo label="Agente incaricato" value={f.agente} onChange={set("agente")} />
        <Campo label="Team" value={f.team} onChange={set("team")} />
      </Sezione>

      <Sezione n="02" titolo="Immobile">
        <Campo label="Indirizzo" value={f.indirizzo} onChange={set("indirizzo")} />
        <Campo label="Comune" value={f.comune} onChange={set("comune")} />
        <Campo label="Piano / interno" value={f.piano} onChange={set("piano")} />
        <Campo label="Foglio" value={f.foglio} onChange={set("foglio")} />
        <Campo label="Particella" value={f.part} onChange={set("part")} />
        <Campo label="Sub." value={f.sub} onChange={set("sub")} />
        <Campo label="Tipologia / mq" value={f.tipologia} onChange={set("tipologia")} largo />
      </Sezione>

      <Sezione n="03" titolo="Incarico originario">
        <Campo label="Rif. incarico n." value={f.inc_num} onChange={set("inc_num")} />
        <Campo label="Data incarico" tipo="date" value={f.data_incarico} onChange={set("data_incarico")} />
        <Campo label="Scadenza originaria" tipo="date" value={f.scadenza_orig} onChange={set("scadenza_orig")} />
        <Campo label="Prezzo di vendita iniziale (€)" tipo="num" value={f.prezzo_iniziale} onChange={set("prezzo_iniziale")} />
        <Scelta label="Tipologia incarico" value={f.tipo} onChange={set("tipo")} opzioni={TIPI} />
      </Sezione>

      <Sezione n="04" titolo="Revisione del prezzo">
        <Campo label="Data revisione prezzo" tipo="date" value={f.data_revisione} onChange={set("data_revisione")} />
        <Campo label="Prezzo attuale in vigore (€)" tipo="num" value={f.prezzo_attuale} onChange={set("prezzo_attuale")} />
        <Campo label="Nuovo prezzo di vendita (€)" tipo="num" value={f.nuovo_prezzo} onChange={set("nuovo_prezzo")} />
        <div className="aa-campo aa-campo-largo">
          <span>Riduzione (calcolo automatico)</span>
          <strong style={{ fontSize: 18 }}>
            {Number.isFinite(riduzione) ? `${eur(riduzione)} · ${perc.toFixed(1).replace(".", ",")} %` : "—"}
          </strong>
        </div>
        <div className="aa-campo aa-campo-largo">
          <span>Motivazione della revisione</span>
          <div className="aa-ruoli">
            {MOTIVI.map(([id, t]) => (
              <label key={id}><input type="checkbox" checked={f.motivi.includes(id)} onChange={() => toggleMotivo(id)} /> {t}</label>
            ))}
          </div>
        </div>
        <Campo label="Altro motivo (facoltativo)" value={f.motivo_altro} onChange={set("motivo_altro")} largo />
      </Sezione>

      <Sezione n="05" titolo="Scadenza dell'incarico">
        <Scelta label="Scadenza" value={f.scadenza} onChange={set("scadenza")} largo
          opzioni={[["invariata", "Nessuna modifica: resta la scadenza originaria"], ["proroga", "Rinnovo / proroga dell'incarico alle medesime condizioni"]]} />
        {f.scadenza === "proroga" && (
          <>
            <Campo label="Nuova scadenza incarico" tipo="date" value={f.nuova_scadenza} onChange={set("nuova_scadenza")} />
            <Campo label="Durata della proroga (mesi)" tipo="num" value={f.mesi} onChange={set("mesi")} />
            <Scelta label="Rinnovo tacito alla nuova scadenza" value={f.tacito} onChange={set("tacito")} opzioni={[["no", "No"], ["si", "Sì"]]} />
            {f.tacito === "si" && <Campo label="Rinnovo tacito per ulteriori mesi" tipo="num" value={f.tacito_mesi} onChange={set("tacito_mesi")} />}
          </>
        )}
      </Sezione>

      <Sezione n="06" titolo="Note e firma">
        <Campo label="Note e accordi particolari" righe={3} value={f.note} onChange={set("note")} largo />
        <Campo label="Luogo" value={f.luogo} onChange={set("luogo")} />
        <Campo label="Data di sottoscrizione" tipo="date" value={f.data_firma} onChange={set("data_firma")} />
      </Sezione>

      <section className="aa-card">
        {avvisi.map((a) => <p key={a} className="aa-nota" style={{ color: "#B42318", fontWeight: 600 }}>⚠ {a}</p>)}
        <div className="aa-modulo-azioni aa-ut-azioni">
          <button className="aa-btn aa-btn-pieno" onClick={() => stampa(f, riduzione, perc)}>Stampa / salva PDF</button>
          <button className="aa-btn aa-btn-piccolo" onClick={() => stampa(VUOTO(null), NaN, NaN, true)}>Stampa modulo in bianco</button>
          <button className="aa-btn aa-btn-piccolo" onClick={() => { if (window.confirm("Svuotare tutti i campi?")) setF(VUOTO(profilo)); }}>Svuota modulo</button>
        </div>
        <p className="aa-nota">Il PDF si apre in una nuova finestra: scegli “Salva come PDF” oppure stampalo e fallo firmare. I dati non vengono salvati: conserva il PDF firmato nel fascicolo dell'immobile e allegalo in Vendilo.</p>
      </section>
    </>
  );
}

const Sezione = ({ n, titolo, children }) => (
  <section className="aa-card">
    <h2 className="aa-h2"><span style={{ color: "#C9A84C", marginRight: 8 }}>{n}</span>{titolo}</h2>
    <div className="aa-griglia-campi">{children}</div>
  </section>
);
const Campo = ({ label, value, onChange, tipo = "text", ph, largo, righe }) => (
  <label className={`aa-campo${largo ? " aa-campo-largo" : ""}`}>
    <span>{label}</span>
    {righe ? <textarea rows={righe} value={value || ""} placeholder={ph} onChange={(e) => onChange(e.target.value)} />
      : <input type={tipo === "num" ? "text" : tipo} inputMode={tipo === "num" ? "decimal" : undefined} value={value || ""} placeholder={ph} onChange={(e) => onChange(e.target.value)} />}
  </label>
);
const Scelta = ({ label, value, onChange, opzioni, largo }) => (
  <label className={`aa-campo${largo ? " aa-campo-largo" : ""}`}>
    <span>{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {opzioni.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
    </select>
  </label>
);

/* ---------------- stampa ---------------- */
function stampa(f, riduzione, perc, bianco = false) {
  const O = window.location.origin;
  const v = (s) => (s && String(s).trim() ? esc(s) : "");
  const d = (iso) => (bianco ? "" : dataIT(iso));
  const e = (s) => { const n = num(s); return Number.isFinite(n) ? eur(n) : ""; };
  const box = (on) => `<span class="box">${on ? "✓" : ""}</span>`;
  const cella = (lab, val, cls = "") => `<div class="c ${cls}"><label>${lab}</label><div class="f">${val || "&nbsp;"}</div></div>`;
  const rid = Number.isFinite(riduzione) ? eur(riduzione) : "";
  const pc = Number.isFinite(perc) ? perc.toFixed(1).replace(".", ",") + " %" : "";
  const proroga = !bianco && f.scadenza === "proroga";
  const invariata = !bianco && f.scadenza === "invariata";

  const corpo = `
<h3><b>01</b> Parti</h3>
<p class="sub">Venditore / Proprietario 1</p>
<div class="r">${cella("Cognome e nome", v(f.v1_nome), "w6")}${cella("Codice fiscale", v(f.v1_cf), "w4")}</div>
<div class="r">${cella("Residente in (indirizzo, comune)", v(f.v1_res), "w6")}${cella("Telefono / e-mail", v(f.v1_cont), "w4")}</div>
<p class="sub">Venditore / Proprietario 2 (eventuale)</p>
<div class="r">${cella("Cognome e nome", v(f.v2_nome), "w6")}${cella("Codice fiscale", v(f.v2_cf), "w4")}</div>
<p>di seguito <b>«Venditore»</b>, e <b>${AZIENDA.nome}</b> (P.IVA ${AZIENDA.piva}), in persona dell'agente incaricato indicato di seguito, di seguito <b>«Agenzia»</b>.</p>
<div class="r">${cella("Agente incaricato", v(f.agente), "w6")}${cella("Team", v(f.team), "w4")}</div>

<h3><b>02</b> Immobile</h3>
<div class="r">${cella("Indirizzo", v(f.indirizzo), "w6")}${cella("Comune", v(f.comune), "w4")}</div>
<div class="r">${cella("Piano / interno", v(f.piano))}${cella("Foglio", v(f.foglio))}${cella("Particella", v(f.part))}${cella("Sub.", v(f.sub))}${cella("Tipologia / mq", v(f.tipologia), "w3")}</div>

<h3><b>03</b> Incarico originario</h3>
<div class="r">${cella("Rif. incarico n.", v(f.inc_num))}${cella("Data incarico", d(f.data_incarico))}${cella("Scadenza originaria", d(f.scadenza_orig))}${cella("Prezzo di vendita iniziale", e(f.prezzo_iniziale), "w2")}</div>
<p class="chk">Tipologia incarico: ${TIPI.map(([id, t]) => `${box(!bianco && f.tipo === id)} ${t}`).join("&nbsp;&nbsp;&nbsp;")}</p>

<h3><b>04</b> Revisione del prezzo</h3>
<div class="r">${cella("Data revisione prezzo", d(f.data_revisione))}${cella("Prezzo attuale in vigore", e(f.prezzo_attuale))}${cella("NUOVO PREZZO DI VENDITA", e(f.nuovo_prezzo), "w2 oro")}</div>
<div class="r">${cella("Riduzione (€)", rid)}${cella("Riduzione (%)", pc)}<div class="c w2"></div></div>
<p class="chk">Motivazione della revisione:<br>${MOTIVI.map(([id, t]) => `${box(!bianco && f.motivi.includes(id))} ${t}`).join("&nbsp;&nbsp;&nbsp;")}<br>${box(!bianco && !!f.motivo_altro)} Altro: ${v(f.motivo_altro) || "______________________________________________"}</p>
<p>Il Venditore, preso atto dell'andamento delle attività promozionali e del riscontro del mercato, <b>conferisce mandato all'Agenzia di proporre l'immobile al nuovo prezzo di vendita sopra indicato</b>, che a decorrere dalla data di revisione sostituisce a ogni effetto il prezzo precedentemente pattuito, anche ai fini della pubblicità sui portali, sui canali dell'Agenzia e nelle trattative in corso.</p>

<div class="nobreak">
<h3><b>05</b> Scadenza dell'incarico</h3>
<p class="chk">${box(invariata)} <b>Nessuna modifica della scadenza</b>: l'incarico resta valido fino alla scadenza originaria indicata al punto 03.</p>
<p class="chk">${box(proroga)} <b>Rinnovo / proroga dell'incarico</b>: il Venditore proroga l'incarico, alle medesime condizioni, con nuova scadenza al <span class="ins">${proroga ? d(f.nuova_scadenza) : ""}</span>, per una durata di <span class="ins">${proroga ? v(f.mesi) : ""}</span> mesi.</p>
<p class="chk">Rinnovo tacito alla nuova scadenza: ${box(proroga && f.tacito === "no")} No &nbsp;&nbsp; ${box(proroga && f.tacito === "si")} Sì, per ulteriori <span class="ins">${proroga && f.tacito === "si" ? v(f.tacito_mesi) : ""}</span> mesi</p>
</div>

<div class="nobreak">
<h3><b>06</b> Condizioni</h3>
<ol>
<li>Restano ferme e invariate tutte le altre condizioni dell'incarico originario, ivi compresi la provvigione pattuita, l'eventuale esclusiva e gli obblighi reciproci, salvo quanto espressamente modificato dal presente modulo.</li>
<li>L'Agenzia aggiornerà gli annunci pubblicati e comunicherà il nuovo prezzo ai clienti interessati entro 2 giorni lavorativi dalla sottoscrizione.</li>
<li>Il presente modulo costituisce parte integrante dell'incarico originario richiamato al punto 03 e ne integra il contenuto. Il Venditore ne riceve copia al momento della sottoscrizione.</li>
<li>I dati personali sono trattati da ${AZIENDA.nome} ai sensi del Reg. UE 2016/679 esclusivamente per la gestione dell'incarico, secondo l'informativa già consegnata.</li>
</ol>
${cella("Note e accordi particolari", v(f.note).replace(/\n/g, "<br>"), "note")}
</div>

<div class="nobreak">
<h3><b>07</b> Sottoscrizione</h3>
<div class="r">${cella("Luogo", v(f.luogo), "w3")}${cella("Data", d(f.data_firma))}<div class="c w2"></div></div>
<div class="firme"><div>Il Venditore 1</div><div>Il Venditore 2</div><div>Per ${AZIENDA.nome} – l'Agente</div></div>
<p class="small">Ai sensi degli artt. 1341 e 1342 c.c. il Venditore dichiara di aver letto e di approvare specificamente il punto 05 (scadenza e rinnovo dell'incarico) e il punto 06.1 (conferma delle condizioni dell'incarico originario).</p>
<div class="firme due"><div>Il Venditore 1</div><div>Il Venditore 2</div></div>
</div>`;

  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8">
<title>Revisione prezzo${f.indirizzo ? " – " + esc(f.indirizzo) : ""}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Jost:wght@400;500;700&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:0}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font-family:Jost,Arial,sans-serif;color:#1B2333;font-size:9.5pt;line-height:1.4}
table.pg{width:100%;border-collapse:collapse}
thead td,tfoot td{padding:0}
tbody td{padding:4mm 14mm 2mm}
.hd{background:#0A1628;color:#fff;display:flex;align-items:center;gap:14px;padding:5mm 14mm 4.5mm;border-bottom:1mm solid #C9A84C}
.hd img{width:24mm;height:24mm;object-fit:contain}
.hd .t{flex:1}.hd h1{font-family:'Playfair Display',Georgia,serif;font-size:20pt;margin:0;font-weight:700}
.hd p{margin:2px 0 0;color:#C9A84C;font-weight:500;font-size:9pt}
.hd .pr{font-size:8pt;font-weight:500;line-height:2}.hd .pr span{display:inline-block;min-width:28mm;border-bottom:1px solid #C9A84C;margin-left:6px;color:#fff}
.ft{height:20mm}
.ftfix{position:fixed;bottom:0;left:0;right:0;height:18mm;background:#0A1628;border-top:.5mm solid #C9A84C;color:#C8CEDA;font-size:7.4pt;display:flex;justify-content:space-between;align-items:center;padding:0 14mm}
.ftfix b{color:#fff;font-size:8.2pt}.ftfix img{height:5mm}
h3{font-size:10.5pt;text-transform:uppercase;color:#0A1628;border-bottom:.7pt solid #C9A84C;padding-bottom:2px;margin:9px 0 6px;letter-spacing:.02em}
h3 b{color:#C9A84C;margin-right:6px}
.sub{font-weight:500;color:#0A1628;font-size:8.5pt;margin:4px 0 2px;text-transform:uppercase}
.r{display:flex;gap:8px;margin-bottom:5px}
.c{flex:1}.c.w2{flex:2}.c.w3{flex:3}.c.w4{flex:4}.c.w6{flex:6}
.c label{display:block;font-size:7.6pt;color:#6B7280;font-weight:500}
.c .f{background:#F4F1E8;min-height:6.2mm;padding:1.3mm 2mm;font-size:9.5pt}
.c.oro .f{outline:1.2pt solid #C9A84C;font-weight:700;font-size:11pt}
.c.note .f{min-height:16mm}
p{margin:4px 0 6px;text-align:justify}.chk{text-align:left;line-height:1.9}
.box{display:inline-block;width:3.4mm;height:3.4mm;border:.8pt solid #0A1628;vertical-align:-0.6mm;text-align:center;line-height:3.2mm;font-size:8pt;font-weight:700}
.ins{display:inline-block;min-width:26mm;border-bottom:.6pt solid #0A1628;text-align:center;font-weight:500}
ol{margin:4px 0 8px;padding-left:16px}ol li{margin-bottom:3px;text-align:justify}ol li::marker{color:#C9A84C;font-weight:700}
.firme{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10mm;margin:12mm 0 4mm;font-size:8.2pt;color:#0A1628;font-weight:500}
.firme.due{grid-template-columns:1fr 1fr 1fr;margin-top:10mm}
.firme div{border-top:.6pt solid #0A1628;padding-top:3px}
.small{font-size:8pt;color:#6B7280}
.nobreak{break-inside:avoid}
</style></head><body>
<table class="pg">
<thead><tr><td><div class="hd"><img src="${O}/images/logo-hub-bianco.png" alt="HUB">
<div class="t"><h1>Revisione Prezzo di Vendita</h1><p>Modifica dell'incarico di mediazione · riduzione prezzo e rinnovo della scadenza</p></div>
<div class="pr">PROT. N. <span>${v(f.prot)}</span><br>DATA <span>${d(f.data_doc)}</span></div></div></td></tr></thead>
<tfoot><tr><td><div class="ft"></div></td></tr></tfoot>
<tbody><tr><td>${corpo}</td></tr></tbody>
</table>
<div class="ftfix"><div><b>FC PUNTO HUB S.R.L.</b><br>Sede operativa: ${AZIENDA.sede} · P.IVA ${AZIENDA.piva}<br>${AZIENDA.contatti}</div><img src="${O}/images/loghi-partner-bianco.png" alt="Fondocasa · weunit.it · Henia"></div>
<script>
Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), ...Array.from(document.images).map(function(i){return i.complete?0:new Promise(function(r){i.onload=i.onerror=r})})])
  .then(function(){setTimeout(function(){window.print()},250)});
</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) { alert("Il browser ha bloccato la finestra: consenti i popup per fondocasahub.com per stampare il modulo."); return; }
  w.document.open(); w.document.write(html); w.document.close();
}
