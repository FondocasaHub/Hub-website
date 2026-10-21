import React, { useEffect, useState, useCallback } from "react";
import { supabase, LINK_TYPE, LINK_ERROR } from "./supabase";
import { Accesso, NuovaPassword } from "./Accesso.jsx";
import { Home, Documenti, Istruzioni, Crm, Produttivita, AreaManager } from "./Pagine.jsx";
import Gestione from "./Gestione.jsx";
import { PaginaComunicazioni } from "./Comunicazioni.jsx";
import { ElencoReport, NuovoReport, DettaglioReport } from "./Compensi.jsx";
import { ElencoRichieste, NuovaRichiesta, DettaglioRichiesta } from "./Richieste.jsx";
import Fatturato from "./Fatturato.jsx";
import Social from "./Social.jsx";
import { ElencoInserimenti, SchedaInserimento } from "./Inserimenti.jsx";
import { ElencoValutazioni, SchedaValutazione } from "./Valutazioni.jsx";
import { ElencoIncarichiRicerca, SchedaIncaricoRicerca } from "./IncarichiRicerca.jsx";

const BASE = "/area-agenti";
const LOGO = "/images/logo-hub-inline.png";

function percorsoCorrente() {
  const p = window.location.pathname.replace(/\/+$/, "");
  return p.startsWith(BASE) ? p.slice(BASE.length).replace(/^\//, "") : "";
}

export default function AreaApp() {
  const [sessione, setSessione] = useState(undefined); // undefined = in caricamento
  const [profilo, setProfilo] = useState(null);
  const [erroreProfilo, setErroreProfilo] = useState(null);
  const [strumenti, setStrumenti] = useState([]);
  const [pagina, setPagina] = useState(percorsoCorrente());
  const [devePassword, setDevePassword] = useState(
    LINK_TYPE === "invite" || LINK_TYPE === "recovery" || percorsoCorrente() === "nuova-password"
  );

  // Sessione
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessione(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((evento, s) => {
      if (evento === "PASSWORD_RECOVERY") setDevePassword(true);
      setSessione(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Profilo e strumenti dopo il login
  const caricaDati = useCallback(async () => {
    if (!sessione) { setProfilo(null); return; }
    const { data, error } = await supabase
      .from("profiles").select("*").eq("id", sessione.user.id).maybeSingle();
    if (error) { setErroreProfilo(error.message); return; }
    setProfilo(data);
    const { data: st } = await supabase
      .from("strumenti").select("*").eq("attivo", true).order("categoria").order("ordine");
    setStrumenti(st || []);
  }, [sessione]);

  useEffect(() => { caricaDati(); }, [caricaDati]);

  // Routing interno (indietro/avanti del browser)
  useEffect(() => {
    const onPop = () => setPagina(percorsoCorrente());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const vai = (p) => {
    window.history.pushState({}, "", p ? `${BASE}/${p}` : BASE);
    setPagina(p.split("?")[0]);
    window.scrollTo({ top: 0 });
  };

  const esci = async () => {
    await supabase.auth.signOut();
    setProfilo(null);
    vai("");
  };

  if (sessione === undefined) return <Caricamento />;

  if (!sessione) {
    return <Accesso erroreLink={LINK_ERROR} />;
  }

  if (devePassword) {
    return (
      <NuovaPassword
        email={sessione.user.email}
        primoAccesso={LINK_TYPE === "invite"}
        onFatto={() => { setDevePassword(false); vai(""); }}
      />
    );
  }

  if (erroreProfilo) {
    return <Messaggio titolo="Errore di caricamento" testo={erroreProfilo} onEsci={esci} />;
  }
  if (!profilo) return <Caricamento />;
  if (!profilo.attivo) {
    return (
      <Messaggio
        titolo="Account non attivo"
        testo="Il tuo accesso all'Area Agenti è stato disattivato. Per informazioni rivolgiti allo Store Manager."
        onEsci={esci}
      />
    );
  }

  const isAdmin = profilo.ruolo === "admin";
  const isManager = isAdmin || profilo.ruolo === "manager";
  const gestoreMarketing = isManager || (profilo.ruolo === "staff" && profilo.reparto === "marketing");
  const crm = strumenti.filter((s) => s.categoria === "crm");
  const produttivita = strumenti.filter((s) => s.categoria === "produttivita");

  let contenuto;
  switch (pagina) {
    case "documenti": contenuto = <Documenti vai={vai} isManager={isManager} />; break;
    case "comunicazioni": contenuto = <PaginaComunicazioni />; break;
    case "istruzioni": contenuto = <Istruzioni strumenti={strumenti} />; break;
    case "crm": contenuto = <Crm strumenti={crm} />; break;
    case "produttivita": contenuto = <Produttivita strumenti={produttivita} />; break;
    case "manager": contenuto = isManager ? <AreaManager vai={vai} /> : <NonAutorizzato vai={vai} />; break;
    case "inserimenti": contenuto = isManager ? <ElencoInserimenti profilo={profilo} vai={vai} /> : <NonAutorizzato vai={vai} />; break;
    case "gestione": contenuto = isAdmin ? <Gestione profilo={profilo} onAggiorna={caricaDati} /> : <NonAutorizzato vai={vai} />; break;
    case "richieste": contenuto = <ElencoRichieste vai={vai} gestore={gestoreMarketing} />; break;
    case "social": case "open-house": contenuto = <Social />; break;
    case "fatturato": contenuto = <Fatturato profilo={profilo} />; break;
    case "valutazioni": contenuto = <ElencoValutazioni profilo={profilo} vai={vai} />; break;
    case "incarichi-ricerca": contenuto = <ElencoIncarichiRicerca profilo={profilo} vai={vai} />; break;
    case "compensi": contenuto = <ElencoReport profilo={profilo} vai={vai} />; break;
    case "compensi/nuovo": contenuto = <NuovoReport profilo={profilo} vai={vai} />; break;
    case "richieste/nuova": contenuto = <NuovaRichiesta profilo={profilo} vai={vai} />; break;
    default:
      if (/^inserimenti\/\d+$/.test(pagina)) { contenuto = isManager ? <SchedaInserimento id={pagina.split("/")[1]} profilo={profilo} vai={vai} /> : <NonAutorizzato vai={vai} />; break; }
      if (/^valutazioni\/\d+$/.test(pagina)) { contenuto = <SchedaValutazione id={pagina.split("/")[1]} profilo={profilo} vai={vai} />; break; }
      if (/^incarichi-ricerca\/\d+$/.test(pagina)) { contenuto = <SchedaIncaricoRicerca id={pagina.split("/")[1]} profilo={profilo} vai={vai} />; break; }
      if (/^compensi\/\d+$/.test(pagina)) { contenuto = <DettaglioReport id={pagina.split("/")[1]} profilo={profilo} vai={vai} />; break; }
      if (/^comunicazioni\/\d+$/.test(pagina)) { contenuto = <PaginaComunicazioni id={pagina.split("/")[1]} />; break; }
      if (/^richieste\/\d+$/.test(pagina)) { contenuto = <DettaglioRichiesta id={pagina.split("/")[1]} vai={vai} gestore={gestoreMarketing} />; break; }
      contenuto = <Home profilo={profilo} vai={vai} isManager={isManager} />;
  }

  return (
    <div className="aa">
      <Barra profilo={profilo} pagina={pagina} vai={vai} esci={esci}
        produttivita={produttivita} isManager={isManager} isAdmin={isAdmin} />
      <main className="aa-main">{contenuto}</main>
      <footer className="aa-footer">
        FC Punto Hub Srl · Area riservata ai collaboratori · Via Pietro Mascagni 35, Napoli
      </footer>
    </div>
  );
}

function Barra({ profilo, pagina, vai, esci, produttivita, isManager, isAdmin }) {
  const [menuMobile, setMenuMobile] = useState(false);
  const [tendina, setTendina] = useState(false);

  useEffect(() => {
    if (!tendina) return;
    const chiudi = (e) => { if (!e.target.closest(".aa-tendina-wrap")) setTendina(false); };
    document.addEventListener("click", chiudi);
    return () => document.removeEventListener("click", chiudi);
  }, [tendina]);

  const voci = [
    { id: "", label: "Home" },
    { id: "documenti", label: "Documenti" },
    { id: "istruzioni", label: "Istruzioni" },
    { id: "crm", label: "CRM" },
    { id: "richieste", label: "Richieste" },
    { id: "compensi", label: "Compensi" },
  ];
  voci.push({ id: "fatturato", label: "Fatturato" });
  if (isManager) voci.push({ id: "manager", label: "Area Manager" });
  if (isAdmin) voci.push({ id: "gestione", label: "Gestione" });

  const clic = (id) => { setMenuMobile(false); setTendina(false); vai(id); };

  return (
    <header className="aa-barra">
      <div className="aa-barra-in">
        <button className="aa-logo" onClick={() => clic("")} aria-label="Home Area Agenti">
          <img src={LOGO} alt="" />
          <span>Area Agenti</span>
        </button>

        <button className="aa-hamburger" onClick={() => setMenuMobile(!menuMobile)} aria-label="Apri menu">
          <span /><span /><span />
        </button>

        <nav className={`aa-nav ${menuMobile ? "aperto" : ""}`}>
          {voci.slice(0, 6).map((v) => (
            <button key={v.id} className={pagina === v.id || (v.id && pagina.startsWith(v.id + "/")) ? "attivo" : ""} onClick={() => clic(v.id)}>{v.label}</button>
          ))}

          <div className="aa-tendina-wrap">
            <button className={pagina === "produttivita" ? "attivo" : ""}
              onClick={() => setTendina(!tendina)} aria-expanded={tendina}>
              Produttività <span className="aa-freccia">▾</span>
            </button>
            {tendina && (
              <div className="aa-tendina">
                {produttivita.map((s) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" onClick={() => setTendina(false)}>
                    <strong>{s.nome}</strong>
                    {s.descrizione && <small>{s.descrizione}</small>}
                  </a>
                ))}
                <button className="aa-tendina-tutti" onClick={() => clic("produttivita")}>Vedi tutti gli strumenti →</button>
              </div>
            )}
          </div>

          {voci.slice(6).map((v) => (
            <button key={v.id} className={pagina === v.id ? "attivo" : ""} onClick={() => clic(v.id)}>{v.label}</button>
          ))}

          <div className="aa-utente">
            <span>{profilo.nome || profilo.email}</span>
            <button className="aa-esci" onClick={esci}>Esci</button>
          </div>
        </nav>
      </div>
    </header>
  );
}

function Caricamento() {
  return <div className="aa-centro"><div className="aa-spinner" aria-label="Caricamento" /></div>;
}

function Messaggio({ titolo, testo, onEsci }) {
  return (
    <div className="aa-centro">
      <div className="aa-card aa-card-stretta">
        <h1 className="aa-titolo">{titolo}</h1>
        <p>{testo}</p>
        <button className="aa-btn" onClick={onEsci}>Esci</button>
      </div>
    </div>
  );
}

function NonAutorizzato({ vai }) {
  return (
    <div className="aa-card">
      <h1 className="aa-titolo">Sezione non disponibile</h1>
      <p>Questa sezione non è abilitata per il tuo ruolo.</p>
      <button className="aa-btn" onClick={() => vai("")}>Torna alla home</button>
    </div>
  );
}
