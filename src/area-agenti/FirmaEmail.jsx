import React, { useEffect, useMemo, useState } from "react";

// Firma email HUB (deciso da Nicola il 21/11/2026): stessa firma per tutti i collaboratori,
// precompilata con i dati del profilo. Il cellulare resta solo nel browser (localStorage), nulla viene salvato sul server.

const SITO = "https://www.fondocasahub.com";
const LOGO = `${SITO}/images/logo-hub-inline.png`;
const PIEDINO = `${SITO}/images/piedino-firma.png`;
const RUOLI = [
  "Agente immobiliare", "New Agent", "Buyer Agent", "Listing Agent", "Consulente del credito",
  "Agente immobiliare e Consulente del credito", "Property Assistant", "Team Leader",
  "Store Manager", "Responsabile Marketing", "Amministrazione",
];
const RUOLO_DA_PROFILO = { agente: "Agente immobiliare", credito: "Consulente del credito", manager: "Team Leader", admin: "Store Manager" };
const CHIAVE = "aa-firma-email";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function htmlFirma(d) {
  const ruolo = esc(`${d.ruolo}${d.team ? ` · ${d.team}` : ""}`.toUpperCase());
  const cell = d.cell ? `Cell. ${esc(d.cell)} · ` : "";
  const mail = d.email ? `<br><a href="mailto:${esc(d.email)}" style="color:#0A1628;text-decoration:none;">${esc(d.email)}</a>` : "";
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;"><tr>` +
    `<td style="padding-right:16px;vertical-align:middle;"><img src="${LOGO}" width="84" height="82" alt="HUB" style="display:block;border:0;width:84px;height:82px;"></td>` +
    `<td style="border-left:3px solid #C9A84C;padding-left:16px;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;">` +
    `<div style="font-size:17px;font-weight:bold;color:#0A1628;">${esc(d.nome)}</div>` +
    `<div style="font-size:12px;font-weight:bold;letter-spacing:1px;color:#C9A84C;margin:2px 0 6px;">${ruolo}</div>` +
    `<div style="font-size:12px;color:#444444;line-height:1.5;">FC Punto Hub Srl · FondoCasa Hub Napoli Vomero<br>Via Pietro Mascagni 35, Napoli<br>${cell}Tel. 081 18653202${mail}<br><a href="${SITO}" style="color:#0A1628;">fondocasahub.com</a></div>` +
    `</td></tr></table>` +
    `<div style="margin-top:14px;"><img src="${PIEDINO}" width="480" alt="Fondocasa · weunit.it · Henia Insurance Broker" style="display:block;border:0;width:480px;max-width:100%;height:auto;"></div>`;
}

const testoBreve = (d) =>
  `${d.nome}\n${d.ruolo}${d.team ? ` · ${d.team}` : ""} – FondoCasa Hub Napoli Vomero\n${d.cell ? `Cell. ${d.cell} · ` : ""}Tel. 081 18653202\nfondocasahub.com`;

export default function FirmaEmail({ profilo }) {
  const iniziale = useMemo(() => {
    let salvato = {};
    try { salvato = JSON.parse(localStorage.getItem(CHIAVE) || "{}"); } catch { /* storage non disponibile */ }
    return {
      nome: profilo.nome || "",
      ruolo: RUOLO_DA_PROFILO[profilo.ruolo] || RUOLI[0],
      team: profilo.team || "",
      email: profilo.email || "",
      cell: "",
      ...salvato,
    };
  }, [profilo]);
  const [d, setD] = useState(iniziale);
  const [altro, setAltro] = useState(!RUOLI.includes(iniziale.ruolo));
  const [msg, setMsg] = useState("");
  const [codice, setCodice] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(CHIAVE, JSON.stringify(d)); } catch { /* ignora */ }
  }, [d]);

  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const html = htmlFirma(d);

  const copia = async () => {
    try {
      await navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([testoBreve(d)], { type: "text/plain" }),
      })]);
      setMsg("Firma copiata: ora incollala nelle impostazioni della tua email.");
    } catch {
      const el = document.getElementById("aa-firma-anteprima");
      const sel = window.getSelection(); const r = document.createRange();
      r.selectNodeContents(el); sel.removeAllRanges(); sel.addRange(r);
      try { document.execCommand("copy"); setMsg("Firma copiata."); } catch { setMsg("Seleziona l'anteprima e premi Ctrl+C (Cmd+C su Mac)."); }
      sel.removeAllRanges();
    }
  };
  const copiaBreve = async () => {
    try { await navigator.clipboard.writeText(testoBreve(d)); setMsg("Versione breve copiata: incollala nella firma del telefono."); }
    catch { setMsg("Copia non consentita dal browser: tieni premuto sul testo per copiarlo."); }
  };

  return (
    <>
      <div className="aa-intestazione">
        <p className="aa-occhiello">Per tutti</p>
        <h1 className="aa-titolo">La tua firma email HUB</h1>
        <p className="aa-sottotitolo">Controlla i tuoi dati, copia la firma e incollala nella tua casella @fondocasa.it. Logo, colori e dati dell'agenzia sono uguali per tutti.</p>
      </div>

      <div className="aa-due-colonne">
        <section className="aa-card">
          <h2 className="aa-h2">I tuoi dati</h2>
          <div style={{ display: "grid", gap: 14 }}>
            <label className="aa-campo"><span>Nome e cognome</span><input value={d.nome} onChange={set("nome")} autoComplete="name" /></label>
            <label className="aa-campo"><span>Ruolo</span>
              <select value={altro ? "altro" : d.ruolo} onChange={(e) => {
                if (e.target.value === "altro") { setAltro(true); setD({ ...d, ruolo: "" }); }
                else { setAltro(false); setD({ ...d, ruolo: e.target.value }); }
              }}>
                {RUOLI.map((r) => <option key={r}>{r}</option>)}
                <option value="altro">Altro (scrivilo)</option>
              </select>
            </label>
            {altro && <label className="aa-campo"><span>Il tuo ruolo</span><input value={d.ruolo} onChange={set("ruolo")} /></label>}
            <label className="aa-campo"><span>Team</span>
              <select value={d.team} onChange={set("team")}>
                <option value="">Nessuno</option><option>Team Nigido</option><option>Team Esposito</option>
                {d.team && !["Team Nigido", "Team Esposito"].includes(d.team) && <option>{d.team}</option>}
              </select>
            </label>
            <label className="aa-campo"><span>Cellulare</span><input value={d.cell} onChange={set("cell")} inputMode="tel" placeholder="es. 333 123 4567" autoComplete="tel" /></label>
            <label className="aa-campo"><span>Email di lavoro</span><input value={d.email} onChange={set("email")} inputMode="email" placeholder="nome@fondocasa.it" /></label>
          </div>
          <p className="aa-nota">Il cellulare resta solo su questo dispositivo: non viene salvato nell'Area Agenti.</p>
        </section>

        <section className="aa-card">
          <h2 className="aa-h2">Anteprima</h2>
          <div id="aa-firma-anteprima" style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid rgba(10,31,61,.12)", overflowX: "auto" }}
            dangerouslySetInnerHTML={{ __html: html }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
            <button className="aa-btn aa-btn-pieno" onClick={copia} disabled={!d.nome || !d.ruolo}>Copia firma</button>
            <button className="aa-btn" onClick={copiaBreve}>Copia versione breve (telefono)</button>
            <button className="aa-btn" onClick={() => setCodice(!codice)}>{codice ? "Nascondi codice HTML" : "Mostra codice HTML"}</button>
          </div>
          {msg && <p className="aa-nota" style={{ color: "var(--gold)", fontWeight: 600 }}>{msg}</p>}
          {codice && <textarea className="aa-textarea" readOnly value={html} rows={6} style={{ width: "100%", marginTop: 10, fontFamily: "monospace", fontSize: 12 }} onFocus={(e) => e.target.select()} />}
        </section>
      </div>

      <section className="aa-card">
        <h2 className="aa-h2">Dove incollarla</h2>
        <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, lineHeight: 1.5 }}>
          <li><strong>Webmail @fondocasa.it:</strong> Impostazioni › Identità (o Firma) › seleziona il tuo indirizzo › firma in formato HTML › incolla › Salva.</li>
          <li><strong>Outlook web / nuovo Outlook:</strong> Impostazioni › Account › Firme › nuova firma «HUB» › incolla › impostala per nuovi messaggi e risposte.</li>
          <li><strong>Outlook classico:</strong> File › Opzioni › Posta › Firme › Nuova › incolla › firma predefinita per l'account @fondocasa.it.</li>
          <li><strong>Mail su Mac:</strong> Mail › Impostazioni › Firme › account @fondocasa.it › + › incolla › togli «Usa sempre il font predefinito».</li>
          <li><strong>iPhone:</strong> premi «Copia versione breve», poi Impostazioni › App › Mail › Firma › incolla.</li>
        </ul>
        <p className="aa-nota">Poi manda un'email di prova a te stesso e a na.vomero@fondocasa.it. Se le immagini non compaiono, attiva «mostra immagini remote».</p>
      </section>
    </>
  );
}
