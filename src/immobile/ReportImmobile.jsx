import React from "react";
import "./immobile.css";

// Report per la proprietà: è la stessa pagina nel minisito e nell'Area Agenti.
// I dati arrivano dalla funzione report_immobile_dati, che non espone acquirenti, note e collaboratori.
const dataIT = (iso) => (iso ? new Date(`${iso}T12:00`).toLocaleDateString("it-IT") : "—");
const euro = (v) => Number(v).toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const NUMERI = [
  ["visite_portali", "Visite all'annuncio"],
  ["nuovi_contatti", "Nuovi contatti"],
  ["prequalificati", "Acquirenti prequalificati"],
  ["presenze_open_house", "Presenze Open House"],
  ["visite", "Visite"],
  ["proposte", "Proposte"],
  ["civici_contattati", "Chiamate in zona"],
  ["volantini", "Volantini distribuiti"],
  ["email_inviate", "Email inviate"],
];
const CANALI = [["messaggi_portali", "Portali"], ["messaggi_whatsapp", "WhatsApp"], ["messaggi_instagram", "Instagram"], ["messaggi_facebook", "Facebook"], ["messaggi_tiktok", "TikTok"]];
const ANDAMENTO = [["visite_portali", "Visite all'annuncio"], ["messaggi", "Messaggi ricevuti"], ["nuovi_contatti", "Nuovi contatti"], ["visite", "Visite"]];

// Una misura per grafico: le visite ai portali hanno una scala diversa dalle altre e non stanno sullo stesso asse.
function Barre({ titolo, chiave, settimane }) {
  const valori = settimane.map((s) => Number(s[chiave]) || 0);
  const massimo = Math.max(...valori, 1);
  const ultimo = valori.length - 1;
  const picco = valori.indexOf(Math.max(...valori));
  return (
    <figure className="im-barre">
      <figcaption>{titolo}</figcaption>
      <div className="im-barre-area">
        {settimane.map((s, i) => (
          <div key={s.settimana} className="im-barra" tabIndex={0} aria-label={`Settimana del ${dataIT(s.settimana)}: ${valori[i]}`}>
            <span className="im-tip">Sett. {dataIT(s.settimana)}: <strong>{valori[i]}</strong></span>
            {(i === ultimo || i === picco) && <span className="im-barra-val">{valori[i]}</span>}
            <span className="im-barra-piena" style={{ height: `${Math.max((valori[i] / massimo) * 100, valori[i] ? 3 : 0)}%` }} />
          </div>
        ))}
      </div>
      <div className="im-barre-asse"><span>{dataIT(settimane[0].settimana).slice(0, 5)}</span>{settimane.length > 1 && <span>{dataIT(settimane[ultimo].settimana).slice(0, 5)}</span>}</div>
    </figure>
  );
}

export default function ReportImmobile({ dati }) {
  const { immobile: i, totali, fasi, settimane, pubblicazioni, report_data } = dati;
  const messaggi = CANALI.reduce((t, [k]) => t + (totali[k] || 0), 0);
  const scheda = [
    ["Tipologia", i.tipologia], ["Contratto", i.contratto],
    ["Superficie", i.mq ? `${i.mq} mq` : null], ["Locali", i.locali],
    ["Prezzo", i.prezzo ? `${euro(i.prezzo)}${i.classe_en ? ` · Classe energetica ${i.classe_en}` : ""}` : null],
    ["Acquisito il", dataIT(i.data_acquisizione)],
    ["Open House", i.data_open_house ? dataIT(i.data_open_house) : "Data in definizione"],
    ["Stato", i.stato],
  ].filter(([, v]) => v);

  return (
    <div className="im-report">
      <header className="im-testa">
        <img src="/images/immobile/logo-hub-bianco.png" alt="FondoCasa Hub" className="im-logo" />
        <div>
          <p className="im-occhiello">Report per la proprietà · Rif. {i.riferimento}</p>
          <h1>{i.indirizzo}</h1>
          <p className="im-sotto">{i.zona ? `${i.zona} · ` : ""}Aggiornato al {dataIT(report_data)}</p>
        </div>
      </header>

      <div className="im-corpo">
        <div className="im-azioni im-noprint">
          <button className="im-btn" onClick={() => window.print()}>Scarica PDF / Stampa</button>
          <span>Nella finestra di stampa scegli “Salva come PDF”.</span>
        </div>

        <section>
          <h2>L'immobile</h2>
          <dl className="im-scheda">
            {scheda.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </section>

        <section>
          <h2>I numeri</h2>
          <div className="im-numeri">
            {NUMERI.map(([k, et]) => <div key={k}><strong>{(totali[k] || 0).toLocaleString("it-IT")}</strong><span>{et}</span></div>)}
            <div><strong>{pubblicazioni.toLocaleString("it-IT")}</strong><span>Pubblicazioni nei gruppi</span></div>
            <div><strong>{messaggi.toLocaleString("it-IT")}</strong><span>Messaggi ricevuti</span></div>
          </div>
          <h3>Messaggi per canale</h3>
          <ul className="im-canali">
            {CANALI.map(([k, et]) => <li key={k}>{et} <strong>{totali[k] || 0}</strong></li>)}
          </ul>
        </section>

        <section>
          <h2>Andamento settimanale</h2>
          {settimane.length === 0 ? <p className="im-vuoto">I primi numeri compariranno con la prima settimana di lavoro.</p> : (
            <>
              <div className="im-andamento">
                {ANDAMENTO.map(([k, et]) => <Barre key={k} titolo={et} chiave={k} settimane={settimane} />)}
              </div>
              <div className="im-scorri">
                <table className="im-tabella">
                  <thead><tr><th>Settimana del</th>{ANDAMENTO.map(([k, et]) => <th key={k}>{et}</th>)}</tr></thead>
                  <tbody>
                    {settimane.map((s) => (
                      <tr key={s.settimana}><td>{dataIT(s.settimana)}</td>{ANDAMENTO.map(([k]) => <td key={k}>{Number(s[k]) || 0}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section>
          <h2>Attività svolte</h2>
          <div className="im-fasi">
            {fasi.map((f) => {
              const fatte = f.attivita.filter((a) => a.completata);
              return (
                <div key={f.fase} className="im-fase">
                  <h3>Fase {f.fase} · {f.titolo} <small>{fatte.length} di {f.attivita.length}</small></h3>
                  {fatte.length === 0 ? <p className="im-vuoto">In programma.</p> : (
                    <ul>
                      {fatte.map((a) => <li key={a.titolo}><span>{a.titolo}</span><time>{dataIT(a.data)}</time></li>)}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="im-piede">
        <img src="/images/immobile/piedino.png" alt="FondoCasa · wunit.it · Henia" />
        <p>FC Punto Hub Srl · Via Pietro Mascagni 35, Napoli Vomero</p>
      </footer>
    </div>
  );
}
