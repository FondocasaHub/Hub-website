// App Chirone (deciso da Nicola il 15/11/2026): la pagina /area-agenti/app, pensata per il telefono e
// installabile sulla schermata Home (manifest /chirone-app.webmanifest). Due cose sole: il diario di oggi
// e "Chiedi a Chirone". Il diario è lo stesso di "La mia giornata" (tabella produttivita_giorno):
// compilarlo da qui vale anche per il cancello del giorno dopo.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { OBIETTIVI_PREDEFINITI, LISTE_PIANO, calcolaObiettivi, oggiRoma } from "./produttivita";
import { supportoVoce, creaRiconoscimento } from "./voce";

const ICONA = "/images/chirone-app-192.png";
const RUOLI_DIARIO = ["agente", "manager", "admin", "credito"];
const NUMERI = [
  ["appuntamenti", "Appuntamenti", "di acquisizione"],
  ["incarichi", "Incarichi", "firmati"],
  ["visite", "Visite", "con acquirenti"],
  ["proposte", "Proposte", "raccolte"],
  ["ore", "Ore", "lavorate"],
];
const ETICHETTE = { contatti: "Contatti", appuntamenti: "Appuntamenti", incarichi: "Incarichi", visite: "Visite", proposte: "Proposte", ore: "Ore", focus: "Focus" };
const VUOTO = { contatti: 0, appuntamenti: 0, incarichi: 0, visite: 0, proposte: 0, ore: 0, focus: "", piano: {} };
const NOMI_LISTE = Object.fromEntries(LISTE_PIANO);

// Il prompt di installazione di Android arriva al caricamento della pagina: lo teniamo da parte.
let promptInstallazione = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); promptInstallazione = e; });
}
const installata = () =>
  typeof window !== "undefined" && (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true);

const apriChirone = () => window.dispatchEvent(new Event("chirone:apri"));

export default function AppChirone({ profilo, vai }) {
  const nome = (profilo.nome || "").split(" ")[0];
  const oggi = oggiRoma();
  const giornoTesto = new Date(`${oggi}T12:00:00Z`).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  const dataLunga = giornoTesto.charAt(0).toUpperCase() + giornoTesto.slice(1);

  return (
    <div className="ac">
      <section className="ac-testa">
        <img src={ICONA} alt="" className="ac-icona" />
        <div>
          <p className="ac-data">{dataLunga}</p>
          <h1>{nome ? `Ciao ${nome}` : "Ciao"}</h1>
        </div>
      </section>

      <Installa />

      <button className="ac-chiedi" onClick={apriChirone}>
        <span aria-hidden="true">🏹</span>
        <strong>Chiedi a Chirone</strong>
        <small>Procedure, copioni, Vendilo, mutui, documenti. Anche a voce.</small>
      </button>

      {RUOLI_DIARIO.includes(profilo.ruolo) ? <DiarioRapido profilo={profilo} oggi={oggi} /> : null}

      <div className="ac-link">
        {RUOLI_DIARIO.includes(profilo.ruolo) && <button onClick={() => vai("giornata")}>Diario completo e obiettivi →</button>}
        <button onClick={() => vai("")}>Area Agenti completa →</button>
      </div>
    </div>
  );
}

/* ---------- Diario di oggi ---------- */
function DiarioRapido({ profilo, oggi }) {
  const [giorno, setGiorno] = useState(null);
  const [obiettivo, setObiettivo] = useState(null);
  const [stato, setStato] = useState("");
  const timer = useRef(null);
  const ultimo = useRef(null);

  useEffect(() => {
    (async () => {
      const [{ data: g }, { data: o }] = await Promise.all([
        supabase.from("produttivita_giorno").select("*").eq("user_id", profilo.id).eq("data", oggi).maybeSingle(),
        supabase.from("produttivita_obiettivi").select("*").eq("user_id", profilo.id).maybeSingle(),
      ]);
      setGiorno(g ? { ...VUOTO, ...g, piano: g.piano || {} } : { ...VUOTO });
      setObiettivo(calcolaObiettivi(o || { ...OBIETTIVI_PREDEFINITI }).giorno.contatti);
    })();
  }, [profilo.id, oggi]);

  const scrivi = useCallback(async (nuovo) => {
    const riga = {
      user_id: profilo.id, data: oggi,
      contatti: nuovo.contatti, appuntamenti: nuovo.appuntamenti, incarichi: nuovo.incarichi,
      visite: nuovo.visite, proposte: nuovo.proposte, ore: nuovo.ore,
      focus: nuovo.focus, piano: nuovo.piano, aggiornato_il: new Date().toISOString(),
    };
    const { error } = await supabase.from("produttivita_giorno").upsert(riga, { onConflict: "user_id,data" });
    setStato(error ? `Non salvato: ${error.message}` : "Salvato ✓");
  }, [profilo.id, oggi]);

  const salva = useCallback((nuovo, subito = false) => {
    clearTimeout(timer.current);
    ultimo.current = nuovo;
    setStato("Salvataggio…");
    if (subito) scrivi(nuovo);
    else timer.current = setTimeout(() => scrivi(ultimo.current), 700);
  }, [scrivi]);

  const modifica = (campi, subito) => setGiorno((g) => { const n = { ...g, ...campi }; salva(n, subito); return n; });
  const passo = (k, d) => modifica({ [k]: Math.max(0, Math.round(((Number(giorno[k]) || 0) + d) * 2) / 2) });

  if (!giorno || obiettivo === null) return <section className="ac-card"><p className="aa-nota">Caricamento del diario…</p></section>;
  const pct = Math.min(100, Math.round((giorno.contatti / (obiettivo || 1)) * 100));

  return (
    <>
      <section className="ac-card">
        <div className="ac-card-testa">
          <h2>📒 Diario di oggi</h2>
          <span className="aa-nota">{stato}</span>
        </div>

        <div className="ac-contatti">
          <span className="ac-etichetta">Contatti</span>
          <strong>{giorno.contatti}<small> / {obiettivo}</small></strong>
          <div className="ac-barra"><span style={{ width: `${pct}%` }} className={pct >= 100 ? "ok" : ""} /></div>
          <div className="ac-tasti">
            <button onClick={() => passo("contatti", -1)} aria-label="Togli un contatto">−1</button>
            <button className="pieno" onClick={() => passo("contatti", 1)} aria-label="Aggiungi un contatto">+1</button>
            <button onClick={() => passo("contatti", 5)} aria-label="Aggiungi cinque contatti">+5</button>
          </div>
        </div>

        <div className="ac-numeri">
          {NUMERI.map(([k, titolo, sotto]) => (
            <div key={k} className="ac-numero">
              <div><strong>{titolo}</strong><small>{sotto}</small></div>
              <div className="ac-stepper">
                <button onClick={() => passo(k, k === "ore" ? -0.5 : -1)} aria-label={`Togli ${titolo}`}>−</button>
                <span>{String(giorno[k]).replace(".", ",")}</span>
                <button onClick={() => passo(k, k === "ore" ? 0.5 : 1)} aria-label={`Aggiungi ${titolo}`}>+</button>
              </div>
            </div>
          ))}
        </div>

        <label className="ac-focus">
          <span>Il focus di oggi</span>
          <input type="text" maxLength={300} value={giorno.focus} placeholder="La cosa più importante da ottenere oggi"
            onChange={(e) => modifica({ focus: e.target.value })} />
        </label>
      </section>

      <DettaAChirone giorno={giorno} onConferma={(n) => modifica(n, true)} />
    </>
  );
}

/* ---------- Compila a voce o per iscritto con Chirone ---------- */
function DettaAChirone({ giorno, onConferma }) {
  const [testo, setTesto] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");
  const [proposta, setProposta] = useState(null);
  const [ascolto, setAscolto] = useState(false);
  const [supporto] = useState(() => supportoVoce());
  // Su iPhone e iPad la dettatura del browser è poco affidabile: lì si usa il microfono della tastiera.
  const [ios] = useState(() => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
  const riconoscimento = useRef(null);

  useEffect(() => () => { try { riconoscimento.current?.abort(); } catch { /* già fermo */ } }, []);

  function ascolta() {
    if (ascolto) { try { riconoscimento.current?.stop(); } catch { /* già fermo */ } return; }
    const r = creaRiconoscimento();
    if (!r) return;
    const base = testo ? `${testo.trim()} ` : "";
    r.onresult = (e) => setTesto(base + Array.from(e.results).map((x) => x[0].transcript).join(""));
    r.onend = () => setAscolto(false);
    r.onerror = (e) => {
      setAscolto(false);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setErrore("Il microfono non è autorizzato: consentilo nelle impostazioni del browser, oppure usa il microfono della tastiera.");
      else if (e.error !== "aborted" && e.error !== "no-speech") setErrore("La dettatura non è riuscita: riprova, oppure usa il microfono della tastiera.");
    };
    riconoscimento.current = r;
    setErrore("");
    setAscolto(true);
    try { r.start(); } catch { setAscolto(false); setErrore("La dettatura non è disponibile: usa il microfono della tastiera."); }
  }

  async function compila() {
    if (!testo.trim() || inCorso) return;
    setInCorso(true); setErrore(""); setProposta(null);
    try {
      const { data } = await supabase.auth.getSession();
      const r = await fetch("/api/diario", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` },
        body: JSON.stringify({ testo: testo.trim() }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.errore || "Chirone non è disponibile in questo momento.");
      setProposta(j);
    } catch (e) {
      setErrore(e.message);
    } finally {
      setInCorso(false);
    }
  }

  function conferma() {
    const p = proposta.proposta;
    const piano = { ...giorno.piano };
    for (const [k, voci] of Object.entries(proposta.aggiungi_liste || {})) piano[k] = [...(piano[k] || []), ...voci].slice(0, 15);
    onConferma({ ...p, piano });
    setProposta(null); setTesto("");
  }

  const cambi = proposta ? Object.keys(ETICHETTE).filter((k) => String(proposta.proposta[k]) !== String(giorno[k])) : [];
  const liste = proposta ? Object.entries(proposta.aggiungi_liste || {}) : [];

  return (
    <section className="ac-card">
      <h2>🏹 Compila con Chirone</h2>
      <p className="aa-nota">Scrivi o detta com'è andata, per esempio: "oggi 25 chiamate, 2 appuntamenti e un incarico in esclusiva; richiamare Esposito".</p>
      <div className="ac-detta">
        <textarea rows={3} maxLength={1500} value={testo} placeholder="Com'è andata oggi?" onChange={(e) => setTesto(e.target.value)} />
        {supporto.ascolto && !ios && (
          <button className={`ac-mic ${ascolto ? "attivo" : ""}`} onClick={ascolta} aria-label={ascolto ? "Ferma la dettatura" : "Detta"}>
            {ascolto ? "■" : "🎙"}
          </button>
        )}
      </div>
      {ios && <p className="aa-nota">🎙 Per dettare tocca la casella e usa il microfono della tastiera dell'iPhone.</p>}
      <button className="ac-btn" onClick={compila} disabled={inCorso || !testo.trim()}>{inCorso ? "Chirone sta compilando…" : "Compila il diario"}</button>
      {errore && <p className="ac-errore">{errore}</p>}

      {proposta && (
        <div className="ac-proposta">
          {proposta.riepilogo && <p><strong>{proposta.riepilogo}</strong></p>}
          {cambi.length === 0 && liste.length === 0 ? <p className="aa-nota">Nessuna modifica al diario.</p> : (
            <ul>
              {cambi.map((k) => (
                <li key={k}><span>{ETICHETTE[k]}</span> {k === "focus" ? `"${proposta.proposta.focus}"` : <>{String(giorno[k]).replace(".", ",")} → <strong>{String(proposta.proposta[k]).replace(".", ",")}</strong></>}</li>
              ))}
              {liste.map(([k, voci]) => <li key={k}><span>{NOMI_LISTE[k] || k}</span> + {voci.join("; ")}</li>)}
            </ul>
          )}
          {proposta.dubbi && <p className="ac-dubbio">❓ {proposta.dubbi}</p>}
          <div className="ac-tasti-proposta">
            {(cambi.length > 0 || liste.length > 0) && <button className="ac-btn" onClick={conferma}>Conferma e salva</button>}
            <button className="ac-btn ac-btn-chiaro" onClick={() => setProposta(null)}>Annulla</button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- Come installare l'app sul telefono ---------- */
function Installa() {
  const [fatto, setFatto] = useState(installata());
  const [android, setAndroid] = useState(Boolean(promptInstallazione));
  useEffect(() => {
    const prendi = () => setAndroid(true);
    const ok = () => setFatto(true);
    window.addEventListener("beforeinstallprompt", prendi);
    window.addEventListener("appinstalled", ok);
    return () => { window.removeEventListener("beforeinstallprompt", prendi); window.removeEventListener("appinstalled", ok); };
  }, []);
  if (fatto) return null;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

  async function installa() {
    if (!promptInstallazione) return;
    promptInstallazione.prompt();
    const { outcome } = await promptInstallazione.userChoice;
    promptInstallazione = null;
    setAndroid(false);
    if (outcome === "accepted") setFatto(true);
  }

  return (
    <section className="ac-card ac-installa">
      <h2>📲 Metti Chirone sul telefono</h2>
      {android ? (
        <button className="ac-btn" onClick={installa}>Installa l'app Chirone</button>
      ) : ios ? (
        <ol>
          <li>Apri questa pagina con <strong>Safari</strong>.</li>
          <li>Tocca il tasto <strong>Condividi</strong> (il quadrato con la freccia in su).</li>
          <li>Scegli <strong>Aggiungi alla schermata Home</strong> e poi <strong>Aggiungi</strong>.</li>
        </ol>
      ) : (
        <ol>
          <li>Apri questa pagina con <strong>Chrome</strong> dal telefono.</li>
          <li>Tocca i <strong>tre puntini</strong> in alto a destra.</li>
          <li>Scegli <strong>Installa app</strong> oppure <strong>Aggiungi a schermata Home</strong>.</li>
        </ol>
      )}
      <p className="aa-nota">Troverai l'icona d'oro di Chirone: si apre già nel tuo diario, senza rifare il login ogni volta.</p>
    </section>
  );
}
