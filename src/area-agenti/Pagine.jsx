import React, { useEffect, useState } from "react";
import { supabase, BUCKET, CARTELLE } from "./supabase";
import { BoxComunicazioni } from "./Comunicazioni.jsx";
import { PIANO_INSERIMENTO, AGENDA, GIORNI, ROUTINE_LISTING, OBIETTIVI_LISTING } from "./contenuti";

const NOMI_RUOLO = { admin: "Admin", manager: "Manager", agente: "Agente", credito: "Consulente del credito", staff: "Staff" };

function Intestazione({ occhiello, titolo, testo }) {
  return (
    <div className="aa-intestazione">
      {occhiello && <p className="aa-occhiello">{occhiello}</p>}
      <h1 className="aa-titolo">{titolo}</h1>
      {testo && <p className="aa-sottotitolo">{testo}</p>}
    </div>
  );
}


const ICONE = {
  openhouse: "M3 11l9-7 9 7 M5 10v10h14V10 M10 20v-6h4v6",
  documenti: "M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6 M10 17h6",
  istruzioni: "M9 11l2 2 4-4 M5 4h14v16H5z",
  crm: "M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1 M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M20 19v-1a4 4 0 0 0-3-3.9 M15 4.1a3 3 0 0 1 0 5.8",
  produttivita: "M4 6h16 M4 12h16 M4 18h10 M18 16l2 2-2 2",
  richieste: "M4 4h16v12H8l-4 4z M8 9h8 M8 12h5",
  compensi: "M4 7h16v10H4z M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z M7 10v4 M17 10v4",
  manager: "M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.4 6.7 19.1l1-5.8L3.5 9.2l5.9-.9z",
};
function Icona({ nome }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONE[nome].split(" M").map((d, i) => <path key={i} d={(i ? "M" : "") + d} />)}
    </svg>
  );
}

/* ---------------- HOME ---------------- */
export function Home({ profilo, vai, isManager }) {
  const oggi = new Date().getDay(); // 0 domenica ... 6 sabato
  const agendaOggi = AGENDA.filter((a) => a.giorno === oggi || (a.giorno === 0 && oggi >= 1 && oggi <= 5));
  const nome = (profilo.nome || "").split(" ")[0];

  const riquadri = [
    { id: "documenti", titolo: "Documenti", testo: "Modulistica, procedure e materiali del tuo ruolo", icona: "documenti" },
    { id: "istruzioni", titolo: "Istruzioni e inserimento", testo: "Piano di inserimento, agenda e regole dello store", icona: "istruzioni" },
    { id: "crm", titolo: "CRM", testo: "Accesso a Vendilo: contatti e immobili", icona: "crm" },
    { id: "richieste", titolo: "Ingaggio Marketing", testo: "Richiedi foto, video e descrizione immobile al Marketing Hub", icona: "richieste" },
    { id: "compensi", titolo: "Report compensi", testo: "Invia il report provvigioni con la pro-forma all'Amministrazione", icona: "compensi" },
    { id: "social", titolo: "Social", testo: "Immobili (acquisito, open house, ribassato, venduto) e auguri delle festività: immagini e testi pronti", icona: "openhouse" },
    { id: "produttivita", titolo: "Produttività", testo: "Valutazioni, portali, firma digitale, posta", icona: "produttivita" },
  ];
  if (isManager) riquadri.push({ id: "manager", titolo: "Area Manager", testo: "Obiettivi, riunione del lunedì, compensi", icona: "manager" });

  return (
    <>
      <Intestazione
        occhiello={NOMI_RUOLO[profilo.ruolo] + (profilo.team ? ` · ${profilo.team}` : "")}
        titolo={nome ? `Ciao ${nome}` : "Benvenuto"}
        testo="Tutto quello che ti serve per lavorare, in un unico posto."
      />


      <div className="aa-griglia">
        {riquadri.map((r) => (
          <button key={r.id} className="aa-riquadro" onClick={() => vai(r.id)}>
            <span className="aa-riquadro-icona"><Icona nome={r.icona} /></span>
            <strong>{r.titolo}</strong>
            <span>{r.testo}</span>
          </button>
        ))}
      </div>

      <div className="aa-due-colonne">
      <BoxComunicazioni vai={vai} />
      <section className="aa-card">
        <h2 className="aa-h2">Oggi in agenda</h2>
        {agendaOggi.length === 0 ? (
          <p className="aa-nota">Nessun appuntamento fisso oggi.</p>
        ) : (
          <ul className="aa-agenda">
            {agendaOggi.map((a, i) => (
              <li key={i}><span>{a.ora}</span>{a.cosa}</li>
            ))}
          </ul>
        )}
      </section>
      </div>
    </>
  );
}

/* ---------------- DOCUMENTI ---------------- */
async function apriDocumento(percorso) {
  const finestra = window.open("", "_blank");
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(percorso, 300);
  if (error || !data) {
    if (finestra) finestra.close();
    alert("Impossibile aprire il documento: " + (error?.message || "errore sconosciuto"));
    return;
  }
  if (finestra) finestra.location.href = data.signedUrl;
  else window.location.href = data.signedUrl;
}

function formatoDimensione(byte) {
  if (!byte) return "";
  if (byte < 1024 * 1024) return `${Math.max(1, Math.round(byte / 1024))} KB`;
  return `${(byte / 1024 / 1024).toFixed(1)} MB`;
}

export function Cartella({ cartella }) {
  const [file, setFile] = useState(null);
  const [cerca, setCerca] = useState("");
  useEffect(() => {
    supabase.storage.from(BUCKET).list(cartella.id, { limit: 500, sortBy: { column: "name", order: "asc" } })
      .then(({ data }) => setFile((data || []).filter((f) => f.id && !f.name.startsWith("."))));
  }, [cartella.id]);

  const visibili = (file || []).filter((f) => f.name.toLowerCase().includes(cerca.toLowerCase()));

  return (
    <section className="aa-card aa-cartella">
      <div className="aa-cartella-testa">
        <div>
          <h2 className="aa-h2">{cartella.nome}</h2>
          <p className="aa-nota">{cartella.descr}</p>
        </div>
        {file && file.length > 6 && (
          <input className="aa-cerca" placeholder="Cerca…" value={cerca} onChange={(e) => setCerca(e.target.value)} />
        )}
      </div>
      {file === null ? (
        <p className="aa-nota">Caricamento…</p>
      ) : visibili.length === 0 ? (
        <p className="aa-nota">{file.length === 0 ? "Nessun documento caricato in questa cartella." : "Nessun risultato."}</p>
      ) : (
        <ul className="aa-file">
          {visibili.map((f) => (
            <li key={f.id}>
              <button onClick={() => apriDocumento(`${cartella.id}/${f.name}`)}>
                <span className="aa-file-nome">{f.name}</span>
                <span className="aa-file-dim">{formatoDimensione(f.metadata?.size)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const LinkInserimento = ({ vai }) => (
  <button className="aa-card aa-cartella-link" onClick={() => vai("inserimenti")}>
    <div>
      <h2 className="aa-h2">Manuale di inserimento · online</h2>
      <p className="aa-nota">Scheda dei 16 step per ogni nuovo collaboratore: la compila il Team Manager, la verifica lo Store Manager</p>
    </div>
    <span className="aa-link">Apri →</span>
  </button>
);

export function Documenti({ vai, isManager }) {
  const [cartelle, setCartelle] = useState(null);
  useEffect(() => {
    Promise.all(CARTELLE.map((c) =>
      supabase.rpc("posso_vedere_cartella", { cartella: c.id }).then(({ data }) => (data ? c : null))
    )).then((r) => setCartelle(r.filter(Boolean)));
  }, []);

  return (
    <>
      <Intestazione occhiello="Archivio" titolo="Documenti" testo="Vedi solo le cartelle abilitate per il tuo ruolo. I link ai file scadono dopo 5 minuti: non inoltrarli." />
      <button className="aa-card aa-cartella-link" onClick={() => vai("comunicazioni")}>
        <div>
          <h2 className="aa-h2">Comunicazioni</h2>
          <p className="aa-nota">Circolari e avvisi dello store con i loro allegati</p>
        </div>
        <span className="aa-link">Apri →</span>
      </button>
      {cartelle === null ? <p className="aa-nota">Caricamento…</p> : cartelle.map((c) => (
        <React.Fragment key={c.id}>
          <Cartella cartella={c} />
          {c.id === "04-manager" && isManager && <LinkInserimento vai={vai} />}
        </React.Fragment>
      ))}
    </>
  );
}

/* ---------------- ISTRUZIONI ---------------- */
export function Istruzioni({ strumenti }) {
  const community = strumenti.find((s) => s.url.includes("community.agentestrategico"));
  return (
    <>
      <Intestazione occhiello="Inserimento" titolo="Istruzioni e piano di inserimento" testo="I passi per diventare operativo nei primi 10 giorni e le regole che valgono per tutti." />

      <section className="aa-card">
        <h2 className="aa-h2">Piano di inserimento</h2>
        <ol className="aa-piano">
          {PIANO_INSERIMENTO.map((f) => (
            <li key={f.fase}>
              <div className="aa-piano-fase">{f.fase}</div>
              <div>
                <strong>{f.titolo}</strong>
                <ul>{f.voci.map((v) => <li key={v}>{v}</li>)}</ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="aa-card">
        <h2 className="aa-h2">Agenda settimanale obbligatoria</h2>
        <table className="aa-tabella">
          <thead><tr><th>Giorno</th><th>Orario</th><th>Attività</th></tr></thead>
          <tbody>
            {AGENDA.map((a, i) => (
              <tr key={i}><td>{a.giorno === 0 ? "Ogni giorno" : GIORNI[a.giorno]}</td><td>{a.ora}</td><td>{a.cosa}</td></tr>
            ))}
          </tbody>
        </table>
        {community && (
          <a className="aa-btn" href={community.url} target="_blank" rel="noopener noreferrer">Vai alla Community Agente Strategico ↗</a>
        )}
      </section>

      <section className="aa-card">
        <h2 className="aa-h2">Routine e obiettivi dei listing agent</h2>
        <div className="aa-numeri">
          {OBIETTIVI_LISTING.map((o) => (
            <div key={o.etichetta}><strong>{o.valore}</strong><span>{o.etichetta}</span></div>
          ))}
        </div>
        <ul className="aa-agenda aa-agenda-larga">
          {ROUTINE_LISTING.map((r) => <li key={r.quando}><span>{r.quando}</span>{r.cosa}</li>)}
        </ul>
      </section>
    </>
  );
}

/* ---------------- CRM ---------------- */
export function Crm({ strumenti }) {
  return (
    <>
      <Intestazione occhiello="CRM" titolo="Vendilo CRM" testo="Ogni contatto, notizia e immobile va inserito in Vendilo. Ogni giorno alle 19:00 aggiorna i dati della giornata." />
      {strumenti.map((s) => (
        <section key={s.id} className="aa-card aa-crm">
          <div>
            <h2 className="aa-h2">{s.nome}</h2>
            {s.descrizione && <p className="aa-nota">{s.descrizione}</p>}
            <p className="aa-nota">Si apre la pagina di accesso di Vendilo: entra con le tue credenziali Vendilo. Consiglio: salvale nel browser per entrare più velocemente.</p>
          </div>
          <a className="aa-btn aa-btn-pieno" href={s.url} target="_blank" rel="noopener noreferrer">Accedi a {s.nome} ↗</a>
        </section>
      ))}
    </>
  );
}

/* ---------------- PRODUTTIVITÀ ---------------- */
export function Produttivita({ strumenti }) {
  return (
    <>
      <Intestazione occhiello="Strumenti" titolo="Produttività" testo="Ogni strumento si apre in una nuova scheda sulla sua pagina di accesso." />
      <div className="aa-griglia">
        {strumenti.map((s) => (
          <a key={s.id} className="aa-riquadro aa-strumento" href={s.url} target="_blank" rel="noopener noreferrer">
            <strong>{s.nome} <span aria-hidden="true">↗</span></strong>
            <span>{s.descrizione}</span>
            <small>{new URL(s.url).hostname.replace(/^www\./, "")}</small>
          </a>
        ))}
      </div>
    </>
  );
}

/* ---------------- AREA MANAGER ---------------- */
export function AreaManager({ vai }) {
  return (
    <>
      <Intestazione occhiello="Riservato" titolo="Area Manager" testo="Obiettivi, file della riunione del lunedì, piano compensi e report di team." />
      <Cartella cartella={CARTELLE.find((c) => c.id === "04-manager")} />
      <LinkInserimento vai={vai} />
    </>
  );
}
