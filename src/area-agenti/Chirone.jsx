// Chirone, l'assistente HUB: pulsante fisso e chat su tutte le pagine dell'Area Agenti.
// Parla con /api/assistente, che verifica l'accesso e risponde in streaming.
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import "./chirone.css";

const ICONA = "/images/chirone-icona.svg";
const BENVENUTO = "/images/chirone-centauro.webp";
const LOGO = "/images/logo-hub-bianco.png";
const MAX_CARATTERI = 2000;

const ESEMPI = {
  vendita: [
    "Come importo i contatti in Vendilo?",
    "Mandami il copione per chiamare i vicini di un immobile appena acquisito",
    "Cosa devo controllare prima di inviare l'Ingaggio Marketing?",
    "Quali sono gli orari dello store e come scambio un turno?",
  ],
  credito: [
    "Quali sono i tempi della prequalifica?",
    "Quando un agente deve coinvolgermi su un mutuo?",
    "Come funziona la Dashboard Immobili per il credito?",
    "Quali sono gli orari dello store?",
  ],
  staff: [
    "Dove trovo la brochure e le presentazioni?",
    "Chi è la consulente del credito dello store?",
    "Quali sono i servizi dell'Hub?",
    "Quali sono gli orari dello store?",
  ],
};

function esempiPer(profilo) {
  if (profilo.ruolo === "credito") return ESEMPI.credito;
  if (profilo.ruolo === "staff") return ESEMPI.staff;
  return ESEMPI.vendita;
}

/* ---------- Testo della risposta: un markdown minimo, senza HTML ---------- */
function inline(testo, chiave) {
  const parti = [];
  const regola = /(\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g;
  let ultimo = 0;
  let m;
  while ((m = regola.exec(testo))) {
    if (m.index > ultimo) parti.push(testo.slice(ultimo, m.index));
    const t = m[0];
    if (t.startsWith("**")) parti.push(<strong key={`${chiave}-${m.index}`}>{t.slice(2, -2)}</strong>);
    else {
      const url = t.replace(/[.,;:]+$/, "");
      parti.push(<a key={`${chiave}-${m.index}`} href={url} target="_blank" rel="noopener noreferrer">{url}</a>);
      if (url.length < t.length) parti.push(t.slice(url.length));
    }
    ultimo = m.index + t.length;
  }
  if (ultimo < testo.length) parti.push(testo.slice(ultimo));
  return parti;
}

function Testo({ testo }) {
  const blocchi = [];
  let lista = null;
  const chiudiLista = () => { if (lista) { blocchi.push(lista); lista = null; } };
  testo.split("\n").forEach((riga, i) => {
    const r = riga.trimEnd();
    const numerata = r.match(/^\s*\d+[.)]\s+(.*)$/);
    const puntata = r.match(/^\s*[-*•]\s+(.*)$/);
    if (numerata || puntata) {
      const tipo = numerata ? "ol" : "ul";
      if (!lista || lista.tipo !== tipo) { chiudiLista(); lista = { tipo, voci: [], i }; }
      lista.voci.push((numerata || puntata)[1]);
      return;
    }
    chiudiLista();
    if (!r.trim()) return;
    if (/^\W*font[ei]\W*:/i.test(r.trim())) blocchi.push({ tipo: "fonte", testo: r.replace(/\*\*/g, "").trim(), i });
    else if (/^>\s?/.test(r)) blocchi.push({ tipo: "citazione", testo: r.replace(/^>\s?/, ""), i });
    else if (/^#{1,4}\s/.test(r)) blocchi.push({ tipo: "titolo", testo: r.replace(/^#{1,4}\s/, ""), i });
    else blocchi.push({ tipo: "p", testo: r, i });
  });
  chiudiLista();
  return blocchi.map((b) => {
    if (b.tipo === "ol" || b.tipo === "ul") {
      const Lista = b.tipo;
      return <Lista key={b.i}>{b.voci.map((v, j) => <li key={j}>{inline(v, `${b.i}-${j}`)}</li>)}</Lista>;
    }
    if (b.tipo === "fonte") return <p key={b.i} className="ch-fonte">{b.testo}</p>;
    if (b.tipo === "citazione") return <blockquote key={b.i}>{inline(b.testo, b.i)}</blockquote>;
    if (b.tipo === "titolo") return <p key={b.i}><strong>{inline(b.testo, b.i)}</strong></p>;
    return <p key={b.i}>{inline(b.testo, b.i)}</p>;
  });
}

// Testo da incollare in email o WhatsApp: senza simboli e senza la riga della fonte.
function testoDaCopiare(testo) {
  return testo
    .split("\n")
    .filter((r) => !/^\W*font[ei]\W*:/i.test(r.trim()))
    .map((r) => r.replace(/^>\s?/, "").replace(/\*\*/g, ""))
    .join("\n")
    .trim();
}

// Solo le coppie domanda-risposta concluse, più la nuova domanda: l'API vuole turni alternati.
function cronologia(messaggi, domanda) {
  const storia = [];
  for (let i = 0; i < messaggi.length - 1; i++) {
    const d = messaggi[i];
    const r = messaggi[i + 1];
    if (d.role === "user" && r.role === "assistant" && r.content && !r.errore) {
      storia.push({ role: "user", content: d.content }, { role: "assistant", content: r.content });
      i++;
    }
  }
  storia.push({ role: "user", content: domanda });
  return storia.slice(-10);
}

/* ---------- Componente ---------- */
export default function Chirone({ profilo, vai }) {
  const [aperto, setAperto] = useState(false);
  const [messaggi, setMessaggi] = useState([]);
  const [testo, setTesto] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [restanti, setRestanti] = useState(null);
  const [copiato, setCopiato] = useState(null);
  const fondo = useRef(null);
  const campo = useRef(null);
  const isAdmin = profilo.ruolo === "admin";

  useEffect(() => {
    if (!aperto) return;
    const esc = (e) => { if (e.key === "Escape") setAperto(false); };
    document.addEventListener("keydown", esc);
    document.body.classList.add("ch-aperto");
    setTimeout(() => campo.current?.focus(), 50);
    return () => { document.removeEventListener("keydown", esc); document.body.classList.remove("ch-aperto"); };
  }, [aperto]);

  useEffect(() => { fondo.current?.scrollIntoView({ block: "end" }); }, [messaggi, aperto]);

  const aggiornaUltimo = (modifica) =>
    setMessaggi((m) => [...m.slice(0, -1), { ...m.at(-1), ...modifica(m.at(-1)) }]);

  async function invia(domanda) {
    const q = domanda.trim();
    if (!q || inCorso) return;
    if (q.length > MAX_CARATTERI) return;
    const storia = cronologia(messaggi, q);
    setTesto("");
    setInCorso(true);
    setMessaggi((m) => [...m, { role: "user", content: q }, { role: "assistant", content: "", inAttesa: true }]);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const risposta = await fetch("/api/assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messaggi: storia }),
      });

      if (!(risposta.headers.get("content-type") || "").includes("text/event-stream")) {
        const corpo = await risposta.json().catch(() => ({}));
        if (typeof corpo.restanti === "number") setRestanti(corpo.restanti);
        aggiornaUltimo(() => ({ inAttesa: false, errore: corpo.errore || "Chirone non è disponibile in questo momento." }));
        return;
      }

      const lettore = risposta.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await lettore.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const eventi = buffer.split("\n\n");
        buffer = eventi.pop();
        for (const grezzo of eventi) {
          if (!grezzo.startsWith("data: ")) continue;
          const ev = JSON.parse(grezzo.slice(6));
          if (ev.tipo === "inizio") { setRestanti(ev.restanti); aggiornaUltimo(() => ({ id: ev.id })); }
          else if (ev.tipo === "testo") aggiornaUltimo((u) => ({ inAttesa: false, content: u.content + ev.testo }));
          else if (ev.tipo === "errore") aggiornaUltimo(() => ({ inAttesa: false, errore: ev.messaggio, dettaglio: ev.dettaglio }));
          else if (ev.tipo === "fine") aggiornaUltimo(() => ({ inAttesa: false, fonti: ev.fonti, senzaFonte: ev.senza_fonte }));
        }
      }
    } catch {
      aggiornaUltimo(() => ({ inAttesa: false, errore: "Connessione interrotta. Riprova tra poco." }));
    } finally {
      setInCorso(false);
      setTimeout(() => campo.current?.focus(), 50);
    }
  }

  async function vota(indice, voto) {
    const m = messaggi[indice];
    if (!m?.id) return;
    const nuovo = m.voto === voto ? null : voto;
    setMessaggi((tutti) => tutti.map((x, i) => (i === indice ? { ...x, voto: nuovo } : x)));
    const { error } = await supabase.rpc("assistente_feedback", { p_id: m.id, p_voto: nuovo });
    if (error) setMessaggi((tutti) => tutti.map((x, i) => (i === indice ? { ...x, voto: m.voto } : x)));
  }

  async function copia(indice) {
    try {
      await navigator.clipboard.writeText(testoDaCopiare(messaggi[indice].content));
      setCopiato(indice);
      setTimeout(() => setCopiato(null), 2000);
    } catch { /* il browser può negare gli appunti: nessun errore da mostrare */ }
  }

  if (!aperto) {
    return (
      <button className="ch-pulsante" onClick={() => setAperto(true)} aria-label="Chiedi a Chirone">
        <img src={ICONA} alt="" />
        <span>Chiedi a Chirone</span>
      </button>
    );
  }

  const vuota = messaggi.length === 0;
  return (
    <div className="ch-sfondo" onClick={(e) => { if (e.target === e.currentTarget) setAperto(false); }}>
      <section className="ch-pannello" role="dialog" aria-modal="true" aria-label="Chirone, l'assistente HUB">
        <header className="ch-testa">
          <img className="ch-logo" src={LOGO} alt="HUB" />
          <div className="ch-titolo">
            <strong>Chirone</strong>
            <span>l'assistente HUB</span>
          </div>
          {isAdmin && (
            <button className="ch-link" onClick={() => { setAperto(false); vai("assistente-log"); }}>Log</button>
          )}
          {!vuota && (
            <button className="ch-link" onClick={() => setMessaggi([])} disabled={inCorso}>Nuova</button>
          )}
          <button className="ch-chiudi" onClick={() => setAperto(false)} aria-label="Chiudi">×</button>
        </header>

        <div className="ch-corpo">
          {vuota ? (
            <div className="ch-benvenuto">
              <img src={BENVENUTO} alt="" />
              <h2>Ciao{profilo.nome ? ` ${profilo.nome.split(" ")[0]}` : ""}, sono Chirone</h2>
              <p>Ti rispondo su strumenti, documenti, copioni e procedure dell'Hub, citando sempre il documento da cui prendo l'informazione.</p>
              <div className="ch-esempi">
                {esempiPer(profilo).map((e) => (
                  <button key={e} onClick={() => invia(e)}>{e}</button>
                ))}
              </div>
            </div>
          ) : (
            messaggi.map((m, i) => (
              m.role === "user" ? (
                <div key={i} className="ch-msg ch-utente"><p>{m.content}</p></div>
              ) : (
                <div key={i} className="ch-msg ch-chirone">
                  <img className="ch-avatar" src={ICONA} alt="" />
                  <div className="ch-bolla">
                    {m.inAttesa && <div className="ch-attesa" aria-label="Chirone sta scrivendo"><span /><span /><span /></div>}
                    {m.content && <Testo testo={m.content} />}
                    {m.errore && (
                      <p className="ch-errore">
                        {m.errore}
                        {m.dettaglio && <small>{m.dettaglio}</small>}
                      </p>
                    )}
                    {m.id && !m.inAttesa && m.content && !(inCorso && i === messaggi.length - 1) && (
                      <div className="ch-azioni">
                        <button className={m.voto === 1 ? "attivo" : ""} onClick={() => vota(i, 1)} aria-label="Risposta utile">👍</button>
                        <button className={m.voto === -1 ? "attivo" : ""} onClick={() => vota(i, -1)} aria-label="Risposta non utile">👎</button>
                        <button className="ch-copia" onClick={() => copia(i)}>{copiato === i ? "Copiato ✓" : "Copia"}</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            ))
          )}
          <div ref={fondo} />
        </div>

        <form className="ch-piede" onSubmit={(e) => { e.preventDefault(); invia(testo); }}>
          <div className="ch-campo">
            <textarea
              ref={campo}
              value={testo}
              onChange={(e) => setTesto(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); invia(testo); } }}
              placeholder="Scrivi la tua domanda…"
              rows={1}
              maxLength={MAX_CARATTERI}
              disabled={inCorso || restanti === 0}
            />
            <button type="submit" disabled={inCorso || !testo.trim() || restanti === 0}>Invia</button>
          </div>
          <p className="ch-nota">
            Non scrivere nomi o dati dei clienti. Le domande vengono registrate per migliorare il manuale.
            {restanti !== null && <> Domande rimaste oggi: {restanti}.</>}
          </p>
        </form>
      </section>
    </div>
  );
}
