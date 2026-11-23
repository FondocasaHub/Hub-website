import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Accordi di collaborazione con firma online (firma elettronica semplice).
// Lo Store Manager carica il PDF per ogni collaboratore; il collaboratore lo legge e lo firma con un clic.
// La firma la registra il database (funzione firma_accordo): nome digitato, data e ora, IP, browser e impronta SHA-256 del PDF.

const BUCKET = "accordi";
const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const dataOra = (iso) => (iso ? new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const nomeSicuro = (n) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.-]/g, "_");
const STATI = { da_firmare: "da firmare", firmato: "firmato", annullato: "annullato" };
const classeStato = (s) => `aa-stato ${s === "firmato" ? "aa-stato-completata" : s === "annullato" ? "aa-stato-respinta" : "aa-stato-in-lavorazione"}`;

const eur = (v) => `${Math.round(Number(v) || 0).toLocaleString("it-IT")} €`;
const VOCI = { mutui: "Mutui erogati", prestiti: "Prestiti personali", cessioni_quinto: "Cessioni del quinto", recensioni: "Recensioni" };
// Righe del budget in forma leggibile: fatturato e incarichi per trimestre, poi le altre voci
function leggiBudget(righe) {
  const r = righe || [];
  const fatt = r.find((x) => x.voce === "fatturato" && x.ambito === "personale");
  const inc = r.find((x) => x.voce === "incarichi" && x.ambito === "personale");
  const altre = r.filter((x) => !["fatturato", "incarichi"].includes(x.voce)).map((x) => ({
    etichetta: `${VOCI[x.voce] || x.voce}${x.ambito === "store" ? " (obiettivo store coordinato)" : ""}`,
    valore: x.voce === "recensioni" ? `almeno ${Number(x.importo)}` : eur(x.importo),
  }));
  return { fatt, inc, altre };
}
function budgetHtml(righe, anno) {
  const { fatt, inc, altre } = leggiBudget(righe);
  if (!fatt && !inc) return "";
  const q = (x, i, e) => (x?.trimestri ? (e ? eur(x.trimestri[i]) : String(x.trimestri[i])) : "—");
  return `<h2>Budget ${anno} sottoscritto</h2><table class="bud"><tr><th></th><th>1° trim.</th><th>2° trim.</th><th>3° trim.</th><th>4° trim.</th><th>Anno</th></tr>
${fatt ? `<tr><td>Fatturato</td>${[0, 1, 2, 3].map((i) => `<td>${q(fatt, i, true)}</td>`).join("")}<td><b>${eur(fatt.importo)}</b></td></tr>` : ""}
${inc ? `<tr><td>Incarichi</td>${[0, 1, 2, 3].map((i) => `<td>${q(inc, i)}</td>`).join("")}<td><b>${Number(inc.importo)}</b></td></tr>` : ""}
</table>
${fatt?.quota_diretta ? `<p>Di cui attività diretta ${eur(fatt.quota_diretta)} e attività sul team ${eur(fatt.importo - fatt.quota_diretta)}.</p>` : ""}
${altre.length ? `<p>${altre.map((x) => `${esc(x.etichetta)}: <b>${esc(x.valore)}</b>`).join(" · ")}</p>` : ""}
${fatt?.premio_pct ? `<p>Premio di risultato: ${Number(fatt.premio_pct)}% del fatturato ${anno} al raggiungimento dell'obiettivo (${eur(fatt.importo * fatt.premio_pct / 100)}), pagato entro il 31/12/${anno}.</p>` : ""}`;
}

function TabellaBudget({ righe, anno }) {
  const { fatt, inc, altre } = leggiBudget(righe);
  if (!fatt && !inc) return <p className="aa-nota">Budget {anno} non ancora caricato: chiedi allo Store Manager prima di firmare.</p>;
  const q = (x, i, e) => (x?.trimestri ? (e ? eur(x.trimestri[i]) : x.trimestri[i]) : "—");
  return (
    <div className="aa-accordo-budget">
      <h3 className="aa-h3">Il tuo budget {anno}, come concordato nel One to One</h3>
      <div className="aa-scorri"><table className="aa-tabella">
        <thead><tr><th></th><th>1° trim.</th><th>2° trim.</th><th>3° trim.</th><th>4° trim.</th><th>Anno</th></tr></thead>
        <tbody>
          {fatt && <tr><td><strong>Fatturato</strong></td>{[0, 1, 2, 3].map((i) => <td key={i}>{q(fatt, i, true)}</td>)}<td><strong>{eur(fatt.importo)}</strong></td></tr>}
          {inc && <tr><td><strong>Incarichi</strong></td>{[0, 1, 2, 3].map((i) => <td key={i}>{q(inc, i)}</td>)}<td><strong>{Number(inc.importo)}</strong></td></tr>}
        </tbody>
      </table></div>
      {fatt?.quota_diretta ? <p className="aa-nota">Di cui attività diretta {eur(fatt.quota_diretta)} e attività sul team {eur(fatt.importo - fatt.quota_diretta)}.</p> : null}
      {altre.length > 0 && <p className="aa-nota">{altre.map((x) => `${x.etichetta}: ${x.valore}`).join(" · ")}</p>}
      {fatt?.premio_pct ? <p className="aa-nota">Premio di risultato: {Number(fatt.premio_pct)}% del fatturato {anno} al raggiungimento dell'obiettivo ({eur(fatt.importo * fatt.premio_pct / 100)}), pagato entro il 31/12/{anno}.</p> : null}
    </div>
  );
}

async function apriPdf(percorso) {
  const finestra = window.open("", "_blank");
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(percorso, 600);
  if (error || !data) { finestra?.close(); alert("Non riesco ad aprire il PDF: " + (error?.message || "riprova")); return; }
  if (finestra) finestra.location = data.signedUrl; else window.location.href = data.signedUrl;
}

async function sha256(file) {
  const buf = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Scarica il PDF dell'accordo sul dispositivo
async function scaricaPdf(a, nome) {
  const file = `Accordo_${a.anno}_${nomeSicuro(nome || "collaboratore")}.pdf`;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(a.file_path, 600, { download: file });
  if (error || !data) { alert("Non riesco a scaricare il PDF: " + (error?.message || "riprova")); return; }
  const link = document.createElement("a"); link.href = data.signedUrl; link.download = file;
  document.body.appendChild(link); link.click(); link.remove();
}

// Stampa (o salva in PDF) budget e accordo: con i dati della firma se firmato, altrimenti come riepilogo da firmare
function stampaAttestato(a, nomeCollaboratore, budgetCorrente) {
  const firmato = a.stato === "firmato";
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!doctype html><html lang="it"><head><meta charset="utf-8"><title>${firmato ? "Attestato di firma" : "Budget da firmare"} — ${esc(nomeCollaboratore || "")} — ${esc(a.titolo)}</title>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>@page{size:A4;margin:0}body{margin:0;font-family:Jost,Arial,sans-serif;color:#0A1628}
.testa{background:#0A1628;padding:22px 36px;display:flex;justify-content:space-between;align-items:center}.testa img{height:44px}
.testa span{color:#C9A84C;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
main{padding:34px 40px}h1{font-size:24px;margin:0 0 6px}h2{color:#C9A84C;font-size:14px;letter-spacing:.08em;text-transform:uppercase;margin:26px 0 8px}
p{line-height:1.55;font-size:14px}table{width:100%;border-collapse:collapse;font-size:13px}td{padding:8px 10px;border-bottom:1px solid #E3E6EC;vertical-align:top}
td:first-child{color:#5B6577;width:34%}.bud td,.bud th{text-align:right;width:auto}.bud td:first-child,.bud th:first-child{text-align:left;width:auto}.bud th{background:#0A1628;color:#FCFDFD;font-weight:500;padding:6px 8px;font-size:12px}.hash{font-family:monospace;font-size:11px;word-break:break-all}
.piede{position:fixed;bottom:0;left:0;right:0;background:#0A1628;color:#FCFDFD;padding:14px 36px;font-size:10px;display:flex;justify-content:space-between;align-items:center}
.piede img{height:22px}</style></head><body>
<div class="testa"><img src="${location.origin}/images/logo-hub-bianco.png" alt="FC Punto Hub"><span>${firmato ? "Attestato di firma elettronica" : "Budget e accordo da firmare"}</span></div>
<main><h1>${esc(a.titolo)}</h1>
<p style="margin-top:0"><strong>${esc(nomeCollaboratore || "")}</strong></p>
${firmato ? `<p>Si attesta che l'accordo indicato è stato letto e accettato integralmente con firma elettronica semplice nell'Area Agenti di FC Punto Hub (fondocasahub.com), con accesso personale del collaboratore.</p>
<h2>Dati della firma</h2><table>
<tr><td>Collaboratore</td><td><strong>${esc(nomeCollaboratore || a.firma_nome)}</strong></td></tr>
<tr><td>Nome e cognome digitato</td><td>${esc(a.firma_nome)}</td></tr>
<tr><td>Data e ora della firma</td><td>${esc(dataOra(a.firmato_il))}</td></tr>
<tr><td>Indirizzo IP</td><td>${esc(a.firma_ip || "—")}</td></tr>
<tr><td>Browser</td><td>${esc(a.firma_browser || "—")}</td></tr>
<tr><td>Documento</td><td>${esc(a.file_path.split("/").pop())}</td></tr>
<tr><td>Impronta SHA-256 del PDF</td><td class="hash">${esc(a.file_sha256)}</td></tr>
<tr><td>Caricato da / il</td><td>${esc(a.creato_da || "FC Punto Hub")} · ${esc(dataOra(a.creato_il))}</td></tr>
</table>` : `<p>Riepilogo del budget concordato. L'accordo si firma online nell'Area Agenti › Accordi.</p>`}
${budgetHtml(a.budget_firmato || budgetCorrente, a.anno)}
${firmato ? `<h2>Dichiarazione</h2><p>"Dichiaro di aver letto l'accordo e di accettarlo integralmente, articolo per articolo (Artt. 1–8), e di sottoscrivere il budget ${a.anno} indicato, con fatturato e incarichi per trimestre e le condizioni del premio di risultato."</p>
<p>L'impronta SHA-256 identifica in modo univoco il PDF firmato: qualsiasi modifica al file ne cambierebbe il valore.</p>` : `<h2>Firma</h2><p>Stato: da firmare.</p>`}</main>
<div class="piede"><span>FC PUNTO HUB S.R.L. · Via Pietro Mascagni 35, 80128 Napoli · P.IVA 01924140096</span><img src="${location.origin}/images/immobile/piedino.png" alt=""></div>
<script>window.onload=()=>setTimeout(()=>window.print(),400)</script></body></html>`);
  w.document.close();
}

/* ---------- Riquadro in home ---------- */
export function BoxAccordo({ profilo, vai }) {
  const [righe, setRighe] = useState(null);
  const isAdmin = profilo.ruolo === "admin";
  useEffect(() => {
    let q = supabase.from("accordi").select("id, anno, titolo, stato, profilo").neq("stato", "annullato");
    if (!isAdmin) q = q.eq("profilo", profilo.id);
    q.then(({ data }) => setRighe(data || []));
  }, [isAdmin, profilo.id]);
  if (!righe || !righe.length) return null;

  if (isAdmin) {
    const anno = Math.max(...righe.map((r) => r.anno));
    const dell = righe.filter((r) => r.anno === anno);
    const firmati = dell.filter((r) => r.stato === "firmato").length;
    return (
      <div className="aa-avviso aa-accordo-box">
        <strong>Accordi di collaborazione {anno}: {firmati} firmati su {dell.length}</strong>
        <p>{dell.length - firmati ? `${dell.length - firmati} ancora da firmare.` : "Tutti firmati."} <button className="aa-link aa-link-oro" onClick={() => vai("accordi")}>Vedi gli accordi →</button></p>
      </div>
    );
  }
  const daFirmare = righe.filter((r) => r.stato === "da_firmare");
  if (!daFirmare.length) return null;
  return (
    <div className="aa-avviso aa-accordo-box">
      <strong>Hai {daFirmare.length === 1 ? `l'${daFirmare[0].titolo}` : `${daFirmare.length} accordi`} da firmare</strong>
      <p>Leggilo con attenzione e firmalo online. <button className="aa-link aa-link-oro" onClick={() => vai("accordo")}>Leggi e firma →</button></p>
    </div>
  );
}

/* ---------- Pagina del collaboratore: leggi e firma ---------- */
export function PaginaAccordo({ profilo }) {
  const [righe, setRighe] = useState(null);
  const carica = () => supabase.from("accordi").select("*").eq("profilo", profilo.id).neq("stato", "annullato")
    .order("anno", { ascending: false }).then(({ data }) => setRighe(data || []));
  useEffect(() => { carica(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">Il mio accordo</p>
        <h1 className="aa-titolo">Accordo e budget 2027</h1>
        <p className="aa-sottotitolo">Controlla il tuo budget 2027 e leggi il PDF dell'accordo, poi firma qui con nome e cognome. La firma vale come accettazione integrale dell'accordo e del budget.</p>
      </div>
      {righe === null ? <p className="aa-nota">Caricamento…</p> : righe.length === 0 ? (
        <section className="aa-card"><p className="aa-nota">Non hai accordi da firmare.</p></section>
      ) : righe.map((a) => <SchedaFirma key={a.id} a={a} profilo={profilo} onFirmato={carica} />)}
    </>
  );
}

function SchedaFirma({ a, profilo, onFirmato }) {
  const [url, setUrl] = useState(null);
  const [budget, setBudget] = useState(null);
  const [letto, setLetto] = useState(false);
  const [nome, setNome] = useState("");
  const [stato, setStato] = useState({ invio: false, errore: "" });
  const atteso = profilo.nome || profilo.email;

  useEffect(() => {
    supabase.storage.from(BUCKET).createSignedUrl(a.file_path, 3600).then(({ data }) => setUrl(data?.signedUrl || null));
    if (a.budget_firmato) setBudget(a.budget_firmato);
    else supabase.from("budget_collaboratori").select("voce, ambito, importo, trimestri, quota_diretta, premio_pct")
      .eq("anno", a.anno).eq("profilo", a.profilo).then(({ data }) => setBudget(data || []));
  }, [a.file_path, a.anno, a.profilo, a.budget_firmato]);

  const firma = async (e) => {
    e.preventDefault();
    setStato({ invio: true, errore: "" });
    const { error } = await supabase.rpc("firma_accordo", { p_id: a.id, p_nome: nome, p_browser: navigator.userAgent });
    if (error) { setStato({ invio: false, errore: error.message }); return; }
    setStato({ invio: false, errore: "" });
    onFirmato();
  };

  return (
    <section className="aa-card">
      <div className="aa-riga-titolo">
        <h2 className="aa-h2">{a.titolo}</h2>
        <span className={classeStato(a.stato)}>{STATI[a.stato]}</span>
      </div>
      <div className="aa-azioni-testata">
        <button className="aa-btn" onClick={() => apriPdf(a.file_path)}>Apri il PDF</button>
        <button className="aa-btn" onClick={() => scaricaPdf(a, atteso)}>Salva il PDF</button>
        <button className="aa-btn" onClick={() => stampaAttestato(a, atteso, budget)}>{a.stato === "firmato" ? "Stampa budget e attestato di firma" : "Stampa il budget"}</button>
      </div>
      {budget && <TabellaBudget righe={budget} anno={a.anno} />}
      {url && <iframe className="aa-accordo-pdf" src={url} title={a.titolo} />}

      {a.stato === "firmato" ? (
        <p className="aa-testo-verde"><strong>Firmato da {a.firma_nome} il {dataOra(a.firmato_il)}.</strong></p>
      ) : (
        <form className="aa-accordo-firma" onSubmit={firma}>
          <label className="aa-check">
            <input type="checkbox" checked={letto} onChange={(e) => setLetto(e.target.checked)} />
            <span>Dichiaro di aver letto l'accordo e di accettarlo integralmente, articolo per articolo (Artt. 1–8), e di sottoscrivere il budget {a.anno} qui sopra, con fatturato e incarichi per trimestre e le condizioni del premio di risultato.</span>
          </label>
          <label>Firma: scrivi nome e cognome ({atteso})
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder={atteso} autoComplete="name" />
          </label>
          {stato.errore && <p className="aa-errore">{stato.errore}</p>}
          <button className="aa-btn aa-btn-pieno" disabled={!letto || !nome.trim() || stato.invio}>{stato.invio ? "Firma in corso…" : "Firmo l'accordo"}</button>
          <p className="aa-nota">Verranno registrati data e ora, il tuo nome, l'indirizzo IP e l'impronta del PDF. Dopo la firma l'accordo non si può più modificare.</p>
        </form>
      )}
    </section>
  );
}

/* ---------- Store Manager e Amministrazione: carica e controlla ---------- */
export function GestioneAccordi({ profilo }) {
  const isAdmin = profilo.ruolo === "admin";
  const annoBase = new Date().getMonth() >= 9 ? new Date().getFullYear() + 1 : new Date().getFullYear();
  const [righe, setRighe] = useState(null);
  const [persone, setPersone] = useState([]);
  const [anno, setAnno] = useState(annoBase);
  const [scelti, setScelti] = useState([]); // {file, profilo}
  const [msg, setMsg] = useState({ testo: "", errore: false });
  const [invio, setInvio] = useState(false);

  const carica = () => supabase.from("accordi").select("*").order("anno", { ascending: false }).order("creato_il", { ascending: false })
    .then(({ data }) => setRighe(data || []));
  useEffect(() => {
    carica();
    supabase.from("profiles").select("id, nome, email, team, ruolo, attivo").order("nome").then(({ data }) => setPersone((data || []).filter((p) => p.attivo !== false)));
  }, []);
  const nomeDi = (id) => { const p = persone.find((x) => x.id === id); return p ? (p.nome || p.email) : "—"; };

  // Abbina ogni file al collaboratore dal nome del file (es. Accordo_..._Mario_Rossi.pdf)
  const scegli = (files) => {
    setScelti([...files].map((file) => {
      const n = norm(file.name.replace(/\.pdf$/i, ""));
      const p = persone.filter((x) => x.nome && n.includes(norm(x.nome))).sort((a, b) => norm(b.nome).length - norm(a.nome).length)[0];
      return { file, profilo: p?.id || "" };
    }));
  };

  const carichi = async () => {
    if (scelti.some((s) => !s.profilo)) { setMsg({ testo: "Scegli il collaboratore per ogni file.", errore: true }); return; }
    setInvio(true); setMsg({ testo: "Caricamento…", errore: false });
    let ok = 0;
    for (const s of scelti) {
      const percorso = `${anno}/${s.profilo}/${Date.now()}-${nomeSicuro(s.file.name)}`;
      const hash = await sha256(s.file);
      const { error: e1 } = await supabase.storage.from(BUCKET).upload(percorso, s.file, { contentType: "application/pdf" });
      if (e1) { setMsg({ testo: `${s.file.name}: ${e1.message}`, errore: true }); setInvio(false); carica(); return; }
      const { error: e2 } = await supabase.from("accordi").insert({ anno, profilo: s.profilo, titolo: `Accordo di Collaborazione ${anno}`, file_path: percorso, file_sha256: hash, creato_da: profilo.nome || profilo.email });
      if (e2) { setMsg({ testo: `${s.file.name}: ${e2.message}`, errore: true }); setInvio(false); carica(); return; }
      ok++;
    }
    setInvio(false); setScelti([]);
    setMsg({ testo: `${ok} accordi caricati: ogni collaboratore li trova in home da firmare.`, errore: false });
    carica();
  };

  const annulla = async (a) => {
    if (!window.confirm(`Annullare l'accordo di ${nomeDi(a.profilo)}? Non sarà più visibile al collaboratore.`)) return;
    await supabase.from("accordi").update({ stato: "annullato" }).eq("id", a.id);
    carica();
  };

  const anni = righe ? [...new Set(righe.map((r) => r.anno))] : [];
  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">Firma online</p>
        <h1 className="aa-titolo">Accordi di collaborazione</h1>
        <p className="aa-sottotitolo">Carichi il PDF di ogni collaboratore: lo trova in home, lo legge e lo firma con un clic.</p>
      </div>

      {isAdmin && (
        <section className="aa-card">
          <h2 className="aa-h2">Carica accordi</h2>
          <div className="aa-griglia-campi">
            <label>Anno<select value={anno} onChange={(e) => setAnno(Number(e.target.value))}>{[annoBase + 1, annoBase, annoBase - 1].map((y) => <option key={y} value={y}>{y}</option>)}</select></label>
            <label>PDF degli accordi (anche più file insieme)<input type="file" accept="application/pdf" multiple onChange={(e) => scegli(e.target.files)} /></label>
          </div>
          {scelti.length > 0 && (
            <table className="aa-tabella">
              <thead><tr><th>File</th><th>Collaboratore</th></tr></thead>
              <tbody>{scelti.map((s, i) => (
                <tr key={i}><td>{s.file.name}</td><td>
                  <select value={s.profilo} onChange={(e) => setScelti(scelti.map((x, k) => (k === i ? { ...x, profilo: e.target.value } : x)))}>
                    <option value="">— scegli —</option>
                    {persone.map((p) => <option key={p.id} value={p.id}>{p.nome || p.email}{p.team ? ` · ${p.team}` : ""}</option>)}
                  </select>
                </td></tr>
              ))}</tbody>
            </table>
          )}
          {msg.testo && <p className={msg.errore ? "aa-errore" : "aa-nota"}>{msg.testo}</p>}
          <div className="aa-modulo-azioni"><button className="aa-btn aa-btn-pieno" onClick={carichi} disabled={!scelti.length || invio}>Carica {scelti.length || ""} accordi</button></div>
        </section>
      )}

      {righe === null ? <p className="aa-nota">Caricamento…</p> : anni.map((y) => {
        const dell = righe.filter((r) => r.anno === y);
        const firmati = dell.filter((r) => r.stato === "firmato").length;
        const validi = dell.filter((r) => r.stato !== "annullato").length;
        return (
          <section className="aa-card" key={y}>
            <h2 className="aa-h2">Accordi {y} · {firmati} firmati su {validi}</h2>
            <div className="aa-scorri"><table className="aa-tabella">
              <thead><tr><th>Collaboratore</th><th>Stato</th><th>Firmato il</th><th></th></tr></thead>
              <tbody>{[...dell].sort((a, b) => nomeDi(a.profilo).localeCompare(nomeDi(b.profilo))).map((a) => (
                <tr key={a.id}>
                  <td>{nomeDi(a.profilo)}</td>
                  <td><span className={classeStato(a.stato)}>{STATI[a.stato]}</span></td>
                  <td>{a.stato === "firmato" ? dataOra(a.firmato_il) : "—"}</td>
                  <td>
                    <button className="aa-link" onClick={() => apriPdf(a.file_path)}>PDF</button>
                    {a.stato === "firmato" && <>{" · "}<button className="aa-link" onClick={() => stampaAttestato(a, nomeDi(a.profilo))}>Attestato</button></>}
                    {isAdmin && a.stato === "da_firmare" && <>{" · "}<button className="aa-link aa-link-rosso" onClick={() => annulla(a)}>Annulla</button></>}
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
          </section>
        );
      })}
    </>
  );
}
