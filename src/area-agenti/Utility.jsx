import React, { useState } from "react";

// Utility per agenti e manager: modulistica operativa compilabile (con PDF) e calcolatori.
// Tutto avviene nel browser: nessun dato viene salvato.

const AZIENDA = {
  nome: "FC Punto Hub Srl",
  sede: "Via Pietro Mascagni 35, 80128 Napoli",
  dati: "P.IVA 01924140096 · na.vomero@fondocasa.it · 081 18653202",
};

/* ---------------- numeri ---------------- */
// Accetta "250.000", "250000", "250.000,50", "3,5"
export const num = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  let s = String(v).trim().replace(/[€\s]/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};
const eur = (n, dec = 2) => "€ " + (Math.round(n * 10 ** dec) / 10 ** dec).toLocaleString("it-IT", { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: "always" });
const eur0 = (n) => eur(n, 0);
const pct = (n) => `${(Math.round(n * 100) / 100).toLocaleString("it-IT")}%`;
const oggi = () => new Date().toISOString().slice(0, 10);
const dataIT = (iso) => (iso ? new Date(iso + "T12:00").toLocaleDateString("it-IT") : "____/____/______");
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const vuoto = (s, n = 30) => (s && String(s).trim() ? esc(s) : "_".repeat(n));

/* ---------------- pagina ---------------- */
const SEZIONI = [
  { id: "chiavi", gruppo: "Modulistica", nome: "Consegna / restituzione chiavi" },
  { id: "assegno", gruppo: "Modulistica", nome: "Restituzione assegno" },
  { id: "proroga", gruppo: "Modulistica", nome: "Proroga termini proposta / preliminare" },
  { id: "imposte", gruppo: "Calcolatori", nome: "Imposte di acquisto" },
  { id: "mutuo", gruppo: "Calcolatori", nome: "Rata del mutuo" },
  { id: "provvigione", gruppo: "Calcolatori", nome: "Provvigione" },
  { id: "superficie", gruppo: "Calcolatori", nome: "Superficie commerciale" },
  { id: "usufrutto", gruppo: "Calcolatori", nome: "Usufrutto e nuda proprietà" },
];

export default function Utility({ profilo }) {
  const [sez, setSez] = useState(null);
  const attiva = SEZIONI.find((s) => s.id === sez);
  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">Strumenti di lavoro</p>
        <h1 className="aa-titolo">Utility</h1>
        <p className="aa-sottotitolo">Modulistica operativa da compilare online e scaricare in PDF, e calcolatori per imposte, mutuo, provvigioni, superfici e usufrutto.</p>
      </div>
      {!attiva ? (
        ["Modulistica", "Calcolatori"].map((g) => (
          <section key={g} className="aa-card">
            <h2 className="aa-h2">{g}</h2>
            <div className="aa-ut-griglia">
              {SEZIONI.filter((s) => s.gruppo === g).map((s) => (
                <button key={s.id} className="aa-ut-voce" onClick={() => setSez(s.id)}>
                  <strong>{s.nome}</strong>
                  <span className="aa-link">Apri →</span>
                </button>
              ))}
            </div>
          </section>
        ))
      ) : (
        <>
          <button className="aa-link" onClick={() => setSez(null)}>← Tutte le utility</button>
          <section className="aa-card aa-sezione">
            <p className="aa-occhiello">{attiva.gruppo}</p>
            <h2 className="aa-h2 aa-ut-titolo">{attiva.nome}</h2>
            {sez === "chiavi" && <ModuloChiavi profilo={profilo} />}
            {sez === "assegno" && <ModuloAssegno profilo={profilo} />}
            {sez === "proroga" && <ModuloProroga profilo={profilo} />}
            {sez === "imposte" && <CalcImposte />}
            {sez === "mutuo" && <CalcMutuo />}
            {sez === "provvigione" && <CalcProvvigione />}
            {sez === "superficie" && <CalcSuperficie />}
            {sez === "usufrutto" && <CalcUsufrutto />}
          </section>
        </>
      )}
    </>
  );
}

/* ---------------- componenti campo ---------------- */
const Campo = ({ label, value, onChange, tipo = "text", ph, largo, righe }) => (
  <label className={`aa-campo${largo ? " aa-campo-largo" : ""}`}>
    <span>{label}</span>
    {righe ? <textarea rows={righe} value={value || ""} placeholder={ph} onChange={(e) => onChange(e.target.value)} />
      : <input type={tipo} inputMode={tipo === "num" ? "decimal" : undefined} value={value || ""} placeholder={ph} onChange={(e) => onChange(e.target.value)} />}
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
const useModulo = (iniziale) => {
  const [f, setF] = useState(iniziale);
  return [f, (k) => (v) => setF((x) => ({ ...x, [k]: v })), setF];
};

/* ---------------- stampa PDF ---------------- */
function stampa(titolo, corpo) {
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>${esc(titolo)}</title>
<style>
@page{size:A4;margin:16mm 16mm 14mm}
*{box-sizing:border-box}body{font-family:Georgia,'Times New Roman',serif;color:#0A1628;font-size:11pt;line-height:1.55;margin:0}
.top{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #0A1628;padding-bottom:8px;margin-bottom:18px}
.top b{font-family:Arial,Helvetica,sans-serif;font-size:10pt;letter-spacing:.06em}.top small{display:block;font-family:Arial,Helvetica,sans-serif;font-size:8pt;color:#5B6577}
.top .oro{color:#C19A5B;font-family:Arial,Helvetica,sans-serif;font-size:8pt;font-weight:bold;letter-spacing:.1em;text-align:right}
h1{font-size:17pt;margin:0 0 4px;text-align:center}.sotto{text-align:center;color:#5B6577;font-family:Arial,Helvetica,sans-serif;font-size:9pt;margin:0 0 18px}
p{margin:0 0 10px;text-align:justify}table{width:100%;border-collapse:collapse;margin:6px 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:9.5pt}
td,th{border:1px solid #CBD2DD;padding:5px 7px;text-align:left;vertical-align:top}th{background:#F5EFE4;width:34%;font-weight:600}
.firme{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:34px;font-family:Arial,Helvetica,sans-serif;font-size:9pt}
.firme div{border-top:1px solid #0A1628;padding-top:5px;margin-top:38px}
.nota{font-family:Arial,Helvetica,sans-serif;font-size:8pt;color:#5B6577;margin-top:22px;border-top:1px solid #CBD2DD;padding-top:6px}
</style></head><body>
<div class="top"><div><b>FC PUNTO HUB · FONDOCASA HUB</b><small>${AZIENDA.nome} · ${AZIENDA.sede}</small><small>${AZIENDA.dati}</small></div><div class="oro">MODULISTICA<br>OPERATIVA</div></div>
${corpo}
<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
</body></html>`;
  const w = window.open("", "_blank");
  if (!w) { alert("Il browser ha bloccato la finestra: consenti i popup per fondocasahub.com per scaricare il PDF."); return; }
  w.document.open(); w.document.write(html); w.document.close();
}
const firme = (sx, dx, extra = "") => `<div class="firme"><div>${sx}</div><div>${dx}</div>${extra}</div>`;
const AzioniModulo = ({ onPdf, onReset }) => (
  <div className="aa-modulo-azioni aa-ut-azioni">
    <button className="aa-btn aa-btn-pieno" onClick={onPdf}>Scarica PDF</button>
    <button className="aa-btn aa-btn-piccolo" onClick={onReset}>Svuota modulo</button>
    <p className="aa-nota">Il PDF si apre in una nuova finestra: scegli “Salva come PDF” o stampalo e fallo firmare. I dati non vengono salvati.</p>
  </div>
);

/* ---------------- Modulo chiavi ---------------- */
const CHIAVI0 = (p) => ({ tipo: "consegna", data: oggi(), luogo: "Napoli", immobile: "", consegnante: "", ricevente: "", qualita_c: "Proprietario", qualita_r: "FC Punto Hub Srl, nella persona dell'agente " + (p.nome || ""), chiavi: "", motivo: "visite", note: "" });
function ModuloChiavi({ profilo }) {
  const [f, set, setTutto] = useModulo(CHIAVI0(profilo));
  const motivi = { visite: "consentire le visite all'immobile da parte di potenziali acquirenti o conduttori", incarico: "lo svolgimento dell'incarico di mediazione conferito", rogito: "la consegna dell'immobile a seguito di atto di compravendita", lavori: "l'esecuzione di sopralluoghi, perizie o lavori", altro: "altro (vedi note)" };
  const pdf = () => {
    const consegna = f.tipo === "consegna";
    const titolo = consegna ? "Verbale di consegna chiavi" : "Verbale di restituzione chiavi";
    stampa(titolo, `<h1>${titolo}</h1><p class="sotto">${esc(f.luogo)}, ${dataIT(f.data)}</p>
<table>
<tr><th>Immobile</th><td>${vuoto(f.immobile, 50)}</td></tr>
<tr><th>Consegna le chiavi</th><td>${vuoto(f.consegnante)}<br><small>in qualità di ${vuoto(f.qualita_c, 20)}</small></td></tr>
<tr><th>Riceve le chiavi</th><td>${vuoto(f.ricevente)}<br><small>in qualità di ${vuoto(f.qualita_r, 20)}</small></td></tr>
<tr><th>Chiavi consegnate (n. e descrizione)</th><td>${esc(f.chiavi).replace(/\n/g, "<br>") || "<br><br>"}</td></tr>
${consegna ? `<tr><th>Finalità</th><td>${esc(motivi[f.motivo])}</td></tr>` : ""}
${f.note ? `<tr><th>Note</th><td>${esc(f.note).replace(/\n/g, "<br>")}</td></tr>` : ""}
</table>
${consegna
  ? `<p>Il ricevente dichiara di aver ricevuto le chiavi sopra descritte, si impegna a custodirle con la dovuta diligenza, a utilizzarle esclusivamente per la finalità indicata, a non duplicarle e a restituirle a semplice richiesta del consegnante o al venir meno della finalità.</p>`
  : `<p>Il consegnante restituisce le chiavi sopra descritte, ricevute in precedenza. Il ricevente dichiara di averle ritirate complete e in buono stato, e le parti si danno reciprocamente atto che con la restituzione cessa ogni obbligo di custodia relativo alle stesse.</p>`}
${firme("Firma di chi consegna", "Firma di chi riceve")}
<p class="nota">Documento redatto da ${esc(profilo.nome || profilo.email)} per ${AZIENDA.nome}. Conservare l'originale nel fascicolo dell'immobile.</p>`);
  };
  return (
    <>
      <div className="aa-griglia-campi">
        <Scelta label="Tipo di verbale" value={f.tipo} onChange={set("tipo")} opzioni={[["consegna", "Consegna chiavi"], ["restituzione", "Restituzione chiavi"]]} />
        <Campo label="Data" tipo="date" value={f.data} onChange={set("data")} />
        <Campo label="Luogo" value={f.luogo} onChange={set("luogo")} />
        <Campo label="Immobile (indirizzo, piano, interno)" value={f.immobile} onChange={set("immobile")} largo />
        <Campo label="Chi consegna (nome e cognome)" value={f.consegnante} onChange={set("consegnante")} />
        <Campo label="In qualità di" value={f.qualita_c} onChange={set("qualita_c")} ph="Proprietario / Agenzia / Acquirente" />
        <Campo label="Chi riceve (nome e cognome)" value={f.ricevente} onChange={set("ricevente")} />
        <Campo label="In qualità di" value={f.qualita_r} onChange={set("qualita_r")} />
        {f.tipo === "consegna" && <Scelta label="Finalità della consegna" value={f.motivo} onChange={set("motivo")} opzioni={[["visite", "Visite all'immobile"], ["incarico", "Svolgimento dell'incarico"], ["rogito", "Consegna dopo il rogito"], ["lavori", "Sopralluoghi / lavori"], ["altro", "Altro (nelle note)"]]} />}
        <Campo label="Chiavi (numero e descrizione)" righe={3} value={f.chiavi} onChange={set("chiavi")} ph="Es. 2 chiavi portone, 1 chiave appartamento, 1 telecomando box" largo />
        <Campo label="Note" righe={2} value={f.note} onChange={set("note")} largo />
      </div>
      <AzioniModulo onPdf={pdf} onReset={() => setTutto(CHIAVI0(profilo))} />
    </>
  );
}

/* ---------------- Modulo restituzione assegno ---------------- */
const ASSEGNO0 = () => ({ data: oggi(), luogo: "Napoli", restituito_a: "", cf: "", immobile: "", data_proposta: "", motivo: "non_accettata", tipo_assegno: "Assegno bancario", numero: "", banca: "", importo: "", intestato: "", note: "" });
function ModuloAssegno({ profilo }) {
  const [f, set, setTutto] = useModulo(ASSEGNO0());
  const motivi = { non_accettata: "la proposta di acquisto non è stata accettata dalla parte venditrice", scaduta: "è decorso il termine di validità della proposta senza accettazione", revocata: "la proposta è stata revocata dal proponente prima dell'accettazione, nei termini consentiti", condizione: "non si è verificata la condizione sospensiva prevista nella proposta", altro: "altro (vedi note)" };
  const pdf = () => stampa("Ricevuta di restituzione assegno", `<h1>Ricevuta di restituzione assegno</h1><p class="sotto">${esc(f.luogo)}, ${dataIT(f.data)}</p>
<p>Il/La sottoscritto/a <b>${vuoto(f.restituito_a)}</b>${f.cf ? `, codice fiscale ${esc(f.cf)}` : ""}, dichiara di ricevere in restituzione da ${AZIENDA.nome} il titolo di seguito descritto, consegnato in deposito fiduciario a corredo della proposta di acquisto del ${dataIT(f.data_proposta)} relativa all'immobile sito in ${vuoto(f.immobile, 40)}.</p>
<table>
<tr><th>Tipo di titolo</th><td>${esc(f.tipo_assegno)}</td></tr>
<tr><th>Numero</th><td>${vuoto(f.numero, 20)}</td></tr>
<tr><th>Banca / istituto emittente</th><td>${vuoto(f.banca)}</td></tr>
<tr><th>Importo</th><td>${num(f.importo) ? eur(num(f.importo)) : "€ ____________"}</td></tr>
<tr><th>Intestato a (beneficiario)</th><td>${vuoto(f.intestato)}</td></tr>
<tr><th>Motivo della restituzione</th><td>${esc(motivi[f.motivo])}</td></tr>
${f.note ? `<tr><th>Note</th><td>${esc(f.note).replace(/\n/g, "<br>")}</td></tr>` : ""}
</table>
<p>Il/La sottoscritto/a dichiara di aver ricevuto il titolo integro e non incassato e di non avere più nulla a pretendere da ${AZIENDA.nome} in relazione al titolo restituito.</p>
${firme("Firma di chi riceve il titolo", `Per ${AZIENDA.nome}<br><small>${esc(profilo.nome || "")}</small>`)}
<p class="nota">Allegare copia fotostatica del titolo restituito e conservare la ricevuta nel fascicolo della proposta.</p>`);
  return (
    <>
      <div className="aa-griglia-campi">
        <Campo label="Data" tipo="date" value={f.data} onChange={set("data")} />
        <Campo label="Luogo" value={f.luogo} onChange={set("luogo")} />
        <Campo label="Restituito a (nome e cognome)" value={f.restituito_a} onChange={set("restituito_a")} />
        <Campo label="Codice fiscale" value={f.cf} onChange={set("cf")} />
        <Campo label="Immobile" value={f.immobile} onChange={set("immobile")} largo />
        <Campo label="Data della proposta" tipo="date" value={f.data_proposta} onChange={set("data_proposta")} />
        <Scelta label="Motivo" value={f.motivo} onChange={set("motivo")} opzioni={[["non_accettata", "Proposta non accettata"], ["scaduta", "Proposta scaduta"], ["revocata", "Proposta revocata"], ["condizione", "Condizione non verificata"], ["altro", "Altro (nelle note)"]]} />
        <Scelta label="Tipo di titolo" value={f.tipo_assegno} onChange={set("tipo_assegno")} opzioni={[["Assegno bancario", "Assegno bancario"], ["Assegno circolare", "Assegno circolare"]]} />
        <Campo label="Numero assegno" value={f.numero} onChange={set("numero")} />
        <Campo label="Banca" value={f.banca} onChange={set("banca")} />
        <Campo label="Importo €" tipo="num" value={f.importo} onChange={set("importo")} />
        <Campo label="Intestato a" value={f.intestato} onChange={set("intestato")} ph="Beneficiario indicato sul titolo" />
        <Campo label="Note" righe={2} value={f.note} onChange={set("note")} largo />
      </div>
      <AzioniModulo onPdf={pdf} onReset={() => setTutto(ASSEGNO0())} />
    </>
  );
}

/* ---------------- Modulo proroga termini ---------------- */
const PROROGA0 = () => ({ data: oggi(), luogo: "Napoli", atto: "proposta", data_atto: "", venditori: "", acquirenti: "", immobile: "", termine: "stipula_preliminare", vecchio: "", nuovo: "", motivo: "", note: "" });
const TERMINI = {
  accettazione: "termine per l'accettazione della proposta",
  stipula_preliminare: "termine per la stipula del contratto preliminare",
  rogito: "termine per la stipula dell'atto notarile di compravendita",
  mutuo: "termine per l'avveramento della condizione relativa alla concessione del mutuo",
  altro: "termine indicato nelle note",
};
function ModuloProroga({ profilo }) {
  const [f, set, setTutto] = useModulo(PROROGA0());
  const atto = f.atto === "proposta" ? "proposta di acquisto" : "contratto preliminare di compravendita";
  const pdf = () => stampa("Accordo di proroga dei termini", `<h1>Accordo di proroga dei termini</h1><p class="sotto">${esc(atto)} del ${dataIT(f.data_atto)}</p>
<p>Tra <b>${vuoto(f.venditori, 40)}</b> (parte venditrice) e <b>${vuoto(f.acquirenti, 40)}</b> (parte acquirente), con l'assistenza di ${AZIENDA.nome} in qualità di mediatore,</p>
<p><b>premesso che</b> in data ${dataIT(f.data_atto)} le parti hanno sottoscritto ${f.atto === "proposta" ? "la proposta di acquisto" : "il contratto preliminare di compravendita"} relativo all'immobile sito in ${vuoto(f.immobile, 40)}, che prevede quale ${TERMINI[f.termine]} la data del <b>${dataIT(f.vecchio)}</b>;</p>
${f.motivo ? `<p><b>considerato che</b> ${esc(f.motivo)};</p>` : ""}
<p><b>le parti convengono</b> di prorogare il suddetto termine al <b>${dataIT(f.nuovo)}</b>.</p>
<p>Restano ferme e invariate tutte le altre condizioni, clausole e pattuizioni ${f.atto === "proposta" ? "della proposta" : "del contratto preliminare"}, che le parti confermano integralmente. Il presente accordo costituisce parte integrante ${f.atto === "proposta" ? "della proposta" : "del contratto preliminare"} sopra richiamato${f.atto === "preliminare" ? " e, ove questo sia stato registrato, ne seguirà la sorte ai fini della registrazione" : ""}.</p>
${f.note ? `<p><b>Note:</b> ${esc(f.note).replace(/\n/g, "<br>")}</p>` : ""}
<p>${esc(f.luogo)}, ${dataIT(f.data)}</p>
${firme("Parte venditrice", "Parte acquirente", `<div>Per presa visione · ${AZIENDA.nome}<br><small>${esc(profilo.nome || "")}</small></div>`)}
<p class="nota">Redigere in tanti originali quante sono le parti, più uno per l'agenzia. Se il preliminare è registrato, verificare con il notaio o il legale l'eventuale registrazione della proroga.</p>`);
  return (
    <>
      <div className="aa-griglia-campi">
        <Scelta label="Atto da prorogare" value={f.atto} onChange={set("atto")} opzioni={[["proposta", "Proposta di acquisto"], ["preliminare", "Contratto preliminare (compromesso)"]]} />
        <Campo label="Data dell'atto" tipo="date" value={f.data_atto} onChange={set("data_atto")} />
        <Scelta label="Termine da prorogare" value={f.termine} onChange={set("termine")} opzioni={[["accettazione", "Accettazione della proposta"], ["stipula_preliminare", "Stipula del preliminare"], ["rogito", "Stipula del rogito"], ["mutuo", "Condizione mutuo"], ["altro", "Altro (nelle note)"]]} />
        <Campo label="Parte venditrice" value={f.venditori} onChange={set("venditori")} ph="Nome e cognome (tutti i venditori)" />
        <Campo label="Parte acquirente" value={f.acquirenti} onChange={set("acquirenti")} ph="Nome e cognome (tutti gli acquirenti)" />
        <Campo label="Immobile" value={f.immobile} onChange={set("immobile")} />
        <Campo label="Termine attuale" tipo="date" value={f.vecchio} onChange={set("vecchio")} />
        <Campo label="Nuovo termine" tipo="date" value={f.nuovo} onChange={set("nuovo")} />
        <Campo label="Data dell'accordo" tipo="date" value={f.data} onChange={set("data")} />
        <Campo label="Motivo della proroga (facoltativo)" value={f.motivo} onChange={set("motivo")} ph="es. la banca non ha ancora deliberato il mutuo" largo />
        <Campo label="Note" righe={2} value={f.note} onChange={set("note")} largo />
      </div>
      <AzioniModulo onPdf={pdf} onReset={() => setTutto(PROROGA0())} />
    </>
  );
}

/* ---------------- Calcolatori ---------------- */
const Risultati = ({ righe, totale, nota }) => (
  <div className="aa-ut-risultati">
    <table className="aa-tabella">
      <tbody>
        {righe.map(([a, b, c], i) => <tr key={i}><td>{a}{c && <><br /><small className="aa-nota">{c}</small></>}</td><td className="aa-ut-num">{b}</td></tr>)}
        {totale && <tr className="aa-riga-totale"><td><strong>{totale[0]}</strong></td><td className="aa-ut-num"><strong>{totale[1]}</strong></td></tr>}
      </tbody>
    </table>
    {nota && <p className="aa-nota">{nota}</p>}
  </div>
);

// Imposte di acquisto (norme in vigore nel 2026)
const ACQUISTI = [
  ["prima_privato", "Prima casa da privato"],
  ["seconda_privato", "Seconda casa da privato"],
  ["prima_impresa", "Prima casa da impresa (nuova costruzione, IVA)"],
  ["seconda_impresa", "Seconda casa da impresa (nuova costruzione, IVA)"],
  ["c1_privato", "Locale commerciale da privato"],
  ["c1_impresa", "Locale commerciale da impresa (con IVA)"],
];
function CalcImposte() {
  const [f, set] = useModulo({ tipo: "prima_privato", prezzo: "", rendita: "", rendita_pert: "", persona: "si", lusso: "no" });
  const prezzo = num(f.prezzo), rendita = num(f.rendita), rPert = num(f.rendita_pert);
  const daPrivato = f.tipo.endsWith("privato");
  const abitazione = !f.tipo.startsWith("c1");
  const prima = f.tipo.startsWith("prima");
  let righe = [], tot = 0, nota = "";
  if (prezzo) {
    if (abitazione && daPrivato) {
      const coeff = prima ? 110 : 120;
      const valCat = (rendita + rPert) * 1.05 * coeff;
      const usaPV = f.persona === "si" && rendita > 0;
      const base = usaPV ? valCat : prezzo;
      const aliq = prima ? 0.02 : 0.09;
      const registro = Math.max(1000, base * aliq);
      righe = [
        ["Base imponibile", eur0(base), usaPV ? `Prezzo-valore: rendita ${eur(rendita + rPert)} × 1,05 × ${coeff}` : "Prezzo dichiarato in atto"],
        [`Imposta di registro ${prima ? "2%" : "9%"}`, eur0(registro), registro === 1000 ? "Minimo di legge € 1.000" : ""],
        ["Imposta ipotecaria", eur0(50)], ["Imposta catastale", eur0(50)],
      ];
      tot = registro + 100;
      nota = usaPV ? "Prezzo-valore: con acquirente persona fisica (non in attività d'impresa) le imposte si calcolano sul valore catastale, anche se il prezzo in atto è più alto. In atto va comunque indicato il prezzo reale." : !rendita ? "Inserisci la rendita catastale per applicare il prezzo-valore." : "";
      if (usaPV && prezzo) righe.push(["Confronto: registro calcolato sul prezzo", eur0(Math.max(1000, prezzo * aliq)), "Solo per mostrare il risparmio del prezzo-valore"]);
    } else if (abitazione && !daPrivato) {
      const aliqIva = prima ? 0.04 : f.lusso === "si" ? 0.22 : 0.10;
      const iva = prezzo * aliqIva;
      righe = [[`IVA ${Math.round(aliqIva * 100)}%`, eur0(iva), prima ? "Prima casa" : f.lusso === "si" ? "Abitazione di lusso (A/1, A/8, A/9)" : "Seconda casa"], ["Imposta di registro", eur0(200)], ["Imposta ipotecaria", eur0(200)], ["Imposta catastale", eur0(200)]];
      tot = iva + 600;
      nota = "Vale per l'acquisto dall'impresa costruttrice (o ristrutturatrice) che vende con IVA. L'IVA si paga al costruttore, le imposte fisse in atto.";
    } else if (!daPrivato) {
      const iva = prezzo * 0.22, ipo = prezzo * 0.03, cat = prezzo * 0.01;
      righe = [["IVA 22%", eur0(iva), "Se l'acquirente è un'impresa o un professionista si applica il reverse charge"], ["Imposta di registro", eur0(200)], ["Imposta ipotecaria 3%", eur0(ipo)], ["Imposta catastale 1%", eur0(cat)]];
      tot = iva + 200 + ipo + cat;
      nota = "Immobile strumentale venduto da impresa con opzione IVA. Se l'impresa vende in esenzione IVA: registro € 200, ipotecaria 3%, catastale 1%, senza IVA.";
    } else {
      const valCat = rendita * 1.05 * 40.8;
      const registro = Math.max(1000, prezzo * 0.09);
      righe = [["Imposta di registro 9%", eur0(registro), "Sul prezzo dichiarato"], ["Imposta ipotecaria", eur0(50)], ["Imposta catastale", eur0(50)]];
      if (rendita) righe.push(["Valore catastale di riferimento (C/1)", eur0(valCat), "Rendita × 1,05 × 40,8: un prezzo inferiore espone ad accertamento"]);
      tot = registro + 100;
      nota = "Per i locali commerciali il prezzo-valore non si applica: le imposte si calcolano sul prezzo.";
    }
  }
  return (
    <>
      <div className="aa-griglia-campi">
        <Scelta label="Tipo di acquisto" value={f.tipo} onChange={set("tipo")} opzioni={ACQUISTI} largo />
        <Campo label="Prezzo di acquisto €" tipo="num" value={f.prezzo} onChange={set("prezzo")} ph="es. 250.000" />
        {(daPrivato) && <Campo label="Rendita catastale € (immobile)" tipo="num" value={f.rendita} onChange={set("rendita")} ph="es. 1.032,91" />}
        {abitazione && daPrivato && <Campo label="Rendita pertinenze € (box, cantina)" tipo="num" value={f.rendita_pert} onChange={set("rendita_pert")} />}
        {abitazione && daPrivato && <Scelta label="Acquirente persona fisica?" value={f.persona} onChange={set("persona")} opzioni={[["si", "Sì (si applica il prezzo-valore)"], ["no", "No (società / impresa)"]]} />}
        {f.tipo === "seconda_impresa" && <Scelta label="Abitazione di lusso (A/1, A/8, A/9)?" value={f.lusso} onChange={set("lusso")} opzioni={[["no", "No · IVA 10%"], ["si", "Sì · IVA 22%"]]} />}
      </div>
      {prezzo ? <Risultati righe={righe} totale={["Totale imposte", eur0(tot)]} nota={nota} /> : <p className="aa-nota">Inserisci il prezzo per vedere il calcolo.</p>}
      <p className="aa-nota aa-ut-avviso">Stima indicativa delle sole imposte, secondo le norme in vigore nel 2026. Non comprende onorario e spese del notaio né la provvigione. Per la prima casa servono i requisiti di legge (residenza nel Comune entro 18 mesi, nessun'altra casa nello stesso Comune, nessun'altra casa acquistata con le agevolazioni, salvo vendita entro 24 mesi). Il conteggio definitivo lo fa il notaio.</p>
    </>
  );
}

function CalcMutuo() {
  const [f, set] = useModulo({ importo: "", tasso: "", anni: "25" });
  const C = num(f.importo), t = num(f.tasso) / 100 / 12, n = Math.round(num(f.anni) * 12);
  const rata = C && n ? (t ? (C * t) / (1 - Math.pow(1 + t, -n)) : C / n) : 0;
  const totale = rata * n;
  return (
    <>
      <div className="aa-griglia-campi">
        <Campo label="Importo del mutuo €" tipo="num" value={f.importo} onChange={set("importo")} ph="es. 200.000" />
        <Campo label="Tasso annuo (TAN) %" tipo="num" value={f.tasso} onChange={set("tasso")} ph="es. 3,2" />
        <Scelta label="Durata" value={f.anni} onChange={set("anni")} opzioni={[5, 10, 15, 20, 25, 30, 35, 40].map((a) => [String(a), `${a} anni`])} />
      </div>
      {rata ? <Risultati righe={[["Rata mensile", eur(rata)], ["Numero rate", String(n)], ["Totale interessi", eur0(totale - C)]]} totale={["Totale da rimborsare", eur0(totale)]}
        nota={`Reddito netto mensile indicativo per la sostenibilità (rata non oltre un terzo del reddito): ${eur0(rata * 3)}.`} /> : <p className="aa-nota">Inserisci importo e tasso.</p>}
      <p className="aa-nota aa-ut-avviso">Ammortamento alla francese a rata costante. Non comprende spese di istruttoria, perizia, assicurazioni e imposta sostitutiva. Per una proposta reale: consulenza gratuita con il consulente del credito WeUnit.</p>
    </>
  );
}

function CalcProvvigione() {
  const [f, set] = useModulo({ prezzo: "", pv: "3", pa: "3", iva: "22", minimo: "" });
  const prezzo = num(f.prezzo), iva = num(f.iva) / 100, minimo = num(f.minimo);
  const lato = (p) => { const imp = Math.max(prezzo * num(p) / 100, minimo); return [imp, imp * iva, imp * (1 + iva)]; };
  const [v, vI, vT] = lato(f.pv), [a, aI, aT] = lato(f.pa);
  return (
    <>
      <div className="aa-griglia-campi">
        <Campo label="Prezzo di vendita €" tipo="num" value={f.prezzo} onChange={set("prezzo")} ph="es. 300.000" />
        <Campo label="% lato venditore" tipo="num" value={f.pv} onChange={set("pv")} />
        <Campo label="% lato acquirente" tipo="num" value={f.pa} onChange={set("pa")} />
        <Campo label="Minimo per lato € (facoltativo)" tipo="num" value={f.minimo} onChange={set("minimo")} />
        <Campo label="IVA %" tipo="num" value={f.iva} onChange={set("iva")} />
      </div>
      {prezzo ? <Risultati righe={[
        ["Venditore · imponibile", eur(v)], ["Venditore · IVA", eur(vI)], ["Venditore · totale", eur(vT)],
        ["Acquirente · imponibile", eur(a)], ["Acquirente · IVA", eur(aI)], ["Acquirente · totale", eur(aT)],
      ]} totale={["Fatturato agenzia (imponibile)", eur(v + a)]} nota={`Totale con IVA incassato dall'agenzia: ${eur(vT + aT)}.`} /> : <p className="aa-nota">Inserisci il prezzo.</p>}
    </>
  );
}

const ACC = [["balconi", "Balconi e terrazzi", 0.5], ["giardino", "Giardino / cortile", 0.5], ["cantina", "Cantina / soffitta / taverna", 0.5]];
function CalcSuperficie() {
  const [f, set] = useModulo({ netta: "", balconi: "", giardino: "", cantina: "" });
  const netta = num(f.netta), imm = netta * 1.1;
  const acc = ACC.reduce((s, [k, , c]) => s + num(f[k]) * c, 0);
  const mq = (n) => `${(Math.round(n * 100) / 100).toLocaleString("it-IT")} mq`;
  return (
    <>
      <div className="aa-griglia-campi">
        <Campo label="Superficie netta calpestabile (mq)" tipo="num" value={f.netta} onChange={set("netta")} />
        {ACC.map(([k, l]) => <Campo key={k} label={`${l} (mq)`} tipo="num" value={f[k]} onChange={set(k)} />)}
      </div>
      {netta ? <Risultati righe={[["Superficie immobile (netta + 10%)", mq(imm)], ["Superficie accessori (× 0,50)", mq(acc)]]} totale={["Superficie commerciale", mq(imm + acc)]} /> : <p className="aa-nota">Inserisci la superficie netta.</p>}
      <p className="aa-nota aa-ut-avviso">Stesso criterio della scheda valutazione immobile. Box e posti auto non entrano nella superficie commerciale: si valutano a parte. Per il calcolo locale per locale usa la scheda valutazione.</p>
    </>
  );
}

// Coefficienti usufrutto vitalizio in vigore nel 2026 (saggio fiscale 2,5%, d.lgs. 139/2024)
const USUFRUTTO = [[20, 95], [30, 90], [40, 85], [45, 80], [50, 75], [53, 70], [56, 65], [60, 60], [63, 55], [66, 50], [69, 45], [72, 40], [75, 35], [78, 30], [82, 25], [86, 20], [92, 15], [99, 10]];
const SAGGIO = 0.025;
function CalcUsufrutto() {
  const [f, set] = useModulo({ valore: "", tipo: "vitalizio", eta: "", anni: "" });
  const V = num(f.valore);
  let usu = 0, dettaglio = "";
  if (f.tipo === "vitalizio") {
    const eta = Math.floor(num(f.eta));
    const r = USUFRUTTO.find(([max]) => eta <= max);
    if (f.eta !== "" && r) { usu = V * r[1] / 100; dettaglio = `Età ${eta} anni: usufrutto ${r[1]}%, nuda proprietà ${100 - r[1]}%`; }
  } else {
    const n = num(f.anni);
    if (n > 0) {
      const p = 1 - Math.pow(1 + SAGGIO, -n);
      usu = V * p; dettaglio = `Usufrutto per ${n} anni al saggio del 2,5%: ${pct(p * 100)} del valore`;
    }
  }
  return (
    <>
      <div className="aa-griglia-campi">
        <Campo label="Valore della piena proprietà €" tipo="num" value={f.valore} onChange={set("valore")} />
        <Scelta label="Tipo di usufrutto" value={f.tipo} onChange={set("tipo")} opzioni={[["vitalizio", "Vitalizio"], ["termine", "A tempo determinato"]]} />
        {f.tipo === "vitalizio" ? <Campo label="Età dell'usufruttuario" tipo="num" value={f.eta} onChange={set("eta")} ph="anni compiuti" />
          : <Campo label="Durata (anni)" tipo="num" value={f.anni} onChange={set("anni")} />}
      </div>
      {V && usu ? <Risultati righe={[["Valore dell'usufrutto", eur0(usu), dettaglio], ["Valore della nuda proprietà", eur0(V - usu)]]} totale={["Piena proprietà", eur0(V)]} /> : <p className="aa-nota">Inserisci valore ed età (o durata).</p>}
      <details className="aa-ut-tabella">
        <summary>Tabella dei coefficienti 2026</summary>
        <table className="aa-tabella"><thead><tr><th>Età usufruttuario</th><th>Usufrutto</th><th>Nuda proprietà</th></tr></thead>
          <tbody>{USUFRUTTO.map(([max, p], i) => <tr key={max}><td>{i ? USUFRUTTO[i - 1][0] + 1 : 0} – {max} anni</td><td>{p}%</td><td>{100 - p}%</td></tr>)}</tbody></table>
      </details>
      <p className="aa-nota aa-ut-avviso">Coefficienti fiscali in vigore nel 2026: il saggio legale è all'1,6%, ma ai fini fiscali si applica il minimo del 2,5% (d.lgs. 139/2024), quindi la tabella resta invariata. Con più usufruttuari si considera il più giovane. L'usufrutto a termine non può valere più di quello vitalizio.</p>
    </>
  );
}
