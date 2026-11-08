import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

// Scenario Make "HUB - Partner WeUnit" (8447388): notifica a info@fondocasahub.com
// in cc na.vomero@fondocasa.it + email di conferma al candidato.
const MAKE_WEBHOOK = "https://hook.eu1.make.com/507vkzxdwhzarldhimpglnqj8jqnoax5";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600;700;800&display=swap');

  .pw-root { font-family: 'Jost', sans-serif; background: #0A1628; color: #FCFDFD; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  .pw-root * { box-sizing: border-box; }

  .pw-nav { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 14px 48px; background: rgba(10,22,40,0.94); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(201,168,76,0.2); }
  .pw-nav img { height: 44px; width: auto; display: block; }
  .pw-nav-cta { background: #C9A84C; color: #0A1628; font-weight: 700; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; padding: 10px 22px; border-radius: 2px; }

  .pw-hero { position: relative; padding: 96px 48px 88px; text-align: center; background: radial-gradient(ellipse 70% 80% at 50% 0%, rgba(201,168,76,0.10) 0%, transparent 70%), linear-gradient(180deg, #0A1628 0%, #0d1f3a 100%); }
  .pw-eyebrow { display: inline-block; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #C9A84C; border: 1px solid rgba(201,168,76,0.35); padding: 6px 16px; border-radius: 2px; margin-bottom: 28px; }
  .pw-hero h1 { font-weight: 800; font-size: clamp(2.1rem, 5vw, 3.6rem); line-height: 1.1; max-width: 900px; margin: 0 auto 24px; }
  .pw-hero h1 span { color: #C9A84C; }
  .pw-hero p { font-size: 1.1rem; font-weight: 300; line-height: 1.7; color: rgba(252,253,253,0.72); max-width: 640px; margin: 0 auto 40px; }
  .pw-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .pw-btn { font-family: 'Jost', sans-serif; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 16px 32px; border-radius: 2px; text-decoration: none; cursor: pointer; border: none; }
  .pw-btn-gold { background: #C9A84C; color: #0A1628; }
  .pw-btn-gold:hover { background: #E2C97E; }
  .pw-btn-line { background: transparent; color: #FCFDFD; border: 1px solid rgba(201,168,76,0.4); }
  .pw-btn-line:hover { border-color: #C9A84C; color: #C9A84C; }

  .pw-section { padding: 88px 48px; max-width: 1180px; margin: 0 auto; }
  .pw-band { background: #12223b; }
  .pw-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #C9A84C; margin-bottom: 14px; }
  .pw-title { font-weight: 700; font-size: clamp(1.7rem, 3.2vw, 2.5rem); line-height: 1.2; margin: 0 0 16px; }
  .pw-sub { font-size: 1rem; font-weight: 300; line-height: 1.7; color: rgba(252,253,253,0.68); max-width: 680px; margin: 0 0 48px; }

  .pw-why { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
  .pw-why div { background: #0A1628; padding: 32px 28px; border-top: 3px solid #C9A84C; }
  .pw-why h3 { font-weight: 700; font-size: 1.1rem; margin: 0 0 10px; }
  .pw-why p { font-size: 0.92rem; line-height: 1.65; color: rgba(252,253,253,0.68); margin: 0; }

  .pw-formule { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .pw-card { background: #0A1628; border: 1px solid rgba(201,168,76,0.25); padding: 40px 36px; display: flex; flex-direction: column; }
  .pw-card-feat { border-color: #C9A84C; box-shadow: 0 0 0 1px #C9A84C inset; }
  .pw-card-tag { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #C9A84C; margin-bottom: 10px; }
  .pw-card h3 { font-weight: 800; font-size: 1.6rem; margin: 0 0 6px; }
  .pw-card-claim { font-size: 0.95rem; color: rgba(252,253,253,0.7); margin: 0 0 24px; }
  .pw-big { font-weight: 800; font-size: 3.4rem; color: #C9A84C; line-height: 1; }
  .pw-big-lbl { font-size: 0.85rem; color: rgba(252,253,253,0.7); margin: 6px 0 24px; line-height: 1.5; }
  .pw-list { list-style: none; padding: 0; margin: 0 0 28px; flex: 1; }
  .pw-list li { display: flex; gap: 12px; padding: 11px 0; border-bottom: 1px solid rgba(201,168,76,0.15); font-size: 0.93rem; line-height: 1.5; }
  .pw-list li:last-child { border-bottom: none; }
  .pw-check { width: 20px; height: 20px; flex-shrink: 0; border-radius: 50%; background: #C9A84C; color: #0A1628; font-size: 0.65rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
  .pw-levels { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 0 0 24px; }
  .pw-levels span { text-align: center; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 10px 4px; border: 1px solid rgba(201,168,76,0.3); color: rgba(252,253,253,0.8); }
  .pw-levels span:last-child { background: #C9A84C; color: #0A1628; border-color: #C9A84C; }

  .pw-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; counter-reset: s; }
  .pw-step { position: relative; padding-top: 64px; }
  .pw-step::before { counter-increment: s; content: counter(s, decimal-leading-zero); position: absolute; top: 0; left: 0; font-weight: 800; font-size: 2.6rem; color: rgba(201,168,76,0.35); line-height: 1; }
  .pw-step h3 { font-weight: 700; font-size: 1.05rem; margin: 0 0 8px; }
  .pw-step p { font-size: 0.9rem; line-height: 1.6; color: rgba(252,253,253,0.68); margin: 0; }

  .pw-hub { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
  .pw-hub div { background: #0A1628; padding: 26px 24px; }
  .pw-hub h4 { font-weight: 700; font-size: 1rem; margin: 0 0 6px; color: #C9A84C; }
  .pw-hub p { font-size: 0.88rem; line-height: 1.55; color: rgba(252,253,253,0.68); margin: 0; }

  .pw-faq details { border-bottom: 1px solid rgba(201,168,76,0.2); padding: 20px 0; }
  .pw-faq summary { cursor: pointer; font-weight: 600; font-size: 1.02rem; list-style: none; display: flex; justify-content: space-between; gap: 16px; }
  .pw-faq summary::after { content: '+'; color: #C9A84C; font-size: 1.4rem; line-height: 1; }
  .pw-faq details[open] summary::after { content: '–'; }
  .pw-faq p { font-size: 0.93rem; line-height: 1.7; color: rgba(252,253,253,0.7); margin: 12px 0 0; }

  .pw-form-wrap { display: grid; grid-template-columns: 1fr 1.2fr; gap: 64px; align-items: start; }
  .pw-form { background: #12223b; border: 1px solid rgba(201,168,76,0.25); padding: 40px 36px; }
  .pw-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .pw-full { grid-column: span 2; }
  .pw-field { display: flex; flex-direction: column; gap: 6px; }
  .pw-field label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(252,253,253,0.65); }
  .pw-field input, .pw-field select, .pw-field textarea { background: rgba(10,22,40,0.7); border: 1px solid rgba(201,168,76,0.25); color: #FCFDFD; font-family: 'Jost', sans-serif; font-size: 0.95rem; padding: 13px 14px; border-radius: 2px; outline: none; width: 100%; }
  .pw-field select { appearance: none; cursor: pointer; }
  .pw-field textarea { resize: vertical; min-height: 90px; }
  .pw-field input:focus, .pw-field select:focus, .pw-field textarea:focus { border-color: #C9A84C; }
  .pw-radio { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .pw-radio label { display: block; cursor: pointer; text-align: center; padding: 12px 6px; border: 1px solid rgba(201,168,76,0.3); font-size: 0.82rem; font-weight: 600; letter-spacing: 0.02em; text-transform: none; color: #FCFDFD; border-radius: 2px; }
  .pw-radio input { display: none; }
  .pw-radio input:checked + span { color: #0A1628; }
  .pw-radio label.on { background: #C9A84C; border-color: #C9A84C; color: #0A1628; }
  .pw-consent { display: flex; gap: 10px; align-items: flex-start; font-size: 0.8rem; line-height: 1.5; color: rgba(252,253,253,0.7); margin-top: 16px; }
  .pw-consent input { margin-top: 3px; accent-color: #C9A84C; }
  .pw-consent a { color: #C9A84C; }
  .pw-submit { width: 100%; margin-top: 18px; }
  .pw-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .pw-err { color: #ff8a8a; font-size: 0.85rem; margin-top: 12px; }
  .pw-ok { text-align: center; padding: 32px 8px; }
  .pw-ok-icon { width: 64px; height: 64px; border-radius: 50%; background: #C9A84C; color: #0A1628; font-size: 1.8rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .pw-ok h3 { font-weight: 700; font-size: 1.4rem; margin: 0 0 10px; }
  .pw-ok p { color: rgba(252,253,253,0.7); line-height: 1.6; margin: 0; }

  .pw-footer { background: #060e1a; border-top: 1px solid rgba(201,168,76,0.2); padding: 36px 48px; text-align: center; }
  .pw-footer img.pw-piedino { max-width: 340px; width: 100%; height: auto; display: block; margin: 0 auto 18px; }
  .pw-footer p { font-size: 0.78rem; color: rgba(252,253,253,0.55); line-height: 1.7; margin: 0; }
  .pw-footer a { color: #C9A84C; text-decoration: none; }

  @media (max-width: 900px) {
    .pw-nav { padding: 12px 20px; }
    .pw-nav img { height: 36px; }
    .pw-hero { padding: 64px 20px 56px; }
    .pw-section { padding: 64px 20px; }
    .pw-why, .pw-formule, .pw-hub, .pw-form-wrap { grid-template-columns: 1fr; }
    .pw-form-wrap { gap: 36px; }
    .pw-steps { grid-template-columns: 1fr 1fr; }
    .pw-card, .pw-form { padding: 30px 22px; }
    .pw-grid { grid-template-columns: 1fr; }
    .pw-full { grid-column: span 1; }
    .pw-footer { padding: 32px 20px; }
  }
  @media (max-width: 480px) {
    .pw-steps { grid-template-columns: 1fr; }
    .pw-radio { grid-template-columns: 1fr; }
  }
`;

const FORMULE = [
  { value: "Partner (segnalazione)", label: "Partner" },
  { value: "Collaboratore Hub", label: "Collaboratore" },
  { value: "Da valutare al colloquio", label: "Non so ancora" },
];

const FAQ = [
  {
    q: "Devo lasciare WeUnit per entrare nell'Hub?",
    a: "No. WeUnit è il ramo creditizio dell'Hub: continui a seguire i mutui dei tuoi clienti esattamente come fai oggi. Con FondoCasa Hub aggiungi la parte immobiliare, nello stesso store di Via Mascagni.",
  },
  {
    q: "Come funziona il compenso del Partner?",
    a: "Per ogni incarico di vendita che ci segnali e che si conclude, ricevi il 20% della provvigione che FC Punto Hub incassa dal venditore. Valutazione, marketing, visite e trattativa li gestisce il nostro team.",
  },
  {
    q: "E chi sceglie di diventare collaboratore?",
    a: "Entra nel piano compensi di FC Punto Hub: provvigioni crescenti per livello (New, Junior, Senior, Team Manager), formazione settimanale, CRM e marketing interno. I dettagli del piano te li illustriamo al colloquio.",
  },
  {
    q: "Posso iniziare come Partner e poi diventare collaboratore?",
    a: "Sì. Molti iniziano segnalando gli immobili dei propri clienti e, quando vedono come lavoriamo, scelgono di entrare nel team. Il passaggio si concorda in qualsiasi momento.",
  },
  {
    q: "Che tipo di incarichi trattate?",
    a: "Lavoriamo solo con incarichi in esclusiva, a Napoli e provincia: è così che possiamo investire in marketing su ogni immobile e dare tempi certi al venditore.",
  },
];

export default function PartnerWeUnit() {
  const [form, setForm] = useState({
    nome: "", cognome: "", email: "", telefono: "", citta: "",
    formula: "", ruolo_weunit: "", esperienza: "", messaggio: "", consenso: false,
  });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = styles;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const goForm = (formula) => (e) => {
    e.preventDefault();
    if (formula) setForm((f) => ({ ...f, formula }));
    document.getElementById("candidati")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    if (!form.nome.trim() || !form.email.trim() || !form.telefono.trim()) {
      setErrMsg("Compila nome, email e telefono."); return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) { setErrMsg("Controlla l'indirizzo email."); return; }
    if (!form.formula) { setErrMsg("Scegli la formula che ti interessa."); return; }
    if (!form.consenso) { setErrMsg("Serve il consenso al trattamento dei dati."); return; }

    setStatus("sending");
    try {
      const payload = {
        categoria: "Partner WeUnit",
        nome: form.nome.trim(),
        cognome: form.cognome.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        citta: form.citta.trim() || "—",
        formula: form.formula,
        ruolo_weunit: form.ruolo_weunit || "—",
        esperienza: form.esperienza || "—",
        messaggio: form.messaggio.trim() || "—",
        consenso_privacy: "sì",
        data_invio: new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" }),
        pagina: "/partner-weunit",
      };
      const res = await fetch(MAKE_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      if (window.gtag) window.gtag("event", "generate_lead", { form_name: "partner_weunit", formula: form.formula });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrMsg("Invio non riuscito. Riprova o scrivi a info@fondocasahub.com.");
    }
  };

  return (
    <div className="pw-root">
      <Helmet>
        <title>Diventa Partner FondoCasa Hub | Riservato ai collaboratori WeUnit</title>
        <meta name="description" content="Sei un collaboratore WeUnit? Diventa partner di FondoCasa Hub: 20% sulla provvigione lato venditore per ogni incarico segnalato, oppure entra nel team con il piano compensi FC Punto Hub." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://www.fondocasahub.com/partner-weunit" />
        <meta property="og:title" content="Diventa Partner FondoCasa Hub — per i collaboratori WeUnit" />
        <meta property="og:description" content="Guadagna anche sull'immobiliare: segnala gli immobili dei tuoi clienti o entra nel team FC Punto Hub." />
        <meta property="og:url" content="https://www.fondocasahub.com/partner-weunit" />
        <meta property="og:image" content="https://www.fondocasahub.com/og-image.jpg" />
      </Helmet>

      <nav className="pw-nav">
        <a href="/"><img src="/images/logo-hub-bianco.png" alt="FondoCasa Hub — Immobiliare Creditizio Assicurativo" /></a>
        <a href="#candidati" className="pw-nav-cta" onClick={goForm()}>Candidati</a>
      </nav>

      <header className="pw-hero">
        <div className="pw-eyebrow">Riservato ai collaboratori WeUnit</div>
        <h1>I tuoi clienti comprano e vendono casa.<br /><span>Ora guadagni anche tu.</span></h1>
        <p>Segui già i loro mutui. Con FondoCasa Hub trasformi quella fiducia in un secondo reddito, sull'immobiliare: segnalando gli incarichi di vendita o entrando nel team.</p>
        <div className="pw-btns">
          <a href="#formule" className="pw-btn pw-btn-gold">Scopri le due formule</a>
          <a href="#candidati" className="pw-btn pw-btn-line" onClick={goForm()}>Candidati ora</a>
        </div>
      </header>

      <div className="pw-band">
        <section className="pw-section">
          <div className="pw-label">Perché tu</div>
          <h2 className="pw-title">Hai già la cosa più difficile da costruire: la fiducia del cliente</h2>
          <p className="pw-sub">Chi chiede un mutuo spesso ha anche una casa da vendere, una da comprare o un familiare che ci sta pensando. Oggi quelle opportunità le lasci andare. Nell'Hub diventano compensi.</p>
          <div className="pw-why">
            <div><h3>Un solo interlocutore</h3><p>Immobiliare, credito e assicurazione nello stesso store: il cliente resta con te e con noi dall'inizio al rogito.</p></div>
            <div><h3>Il mutuo resta in WeUnit</h3><p>Nessuna sovrapposizione: la parte creditizia la continui a seguire tu, l'Hub si occupa della vendita.</p></div>
            <div><h3>Un metodo già rodato</h3><p>Incarichi in esclusiva, marketing dedicato a ogni immobile e un team con oltre 26 anni di esperienza a Napoli.</p></div>
          </div>
        </section>
      </div>

      <section className="pw-section" id="formule">
        <div className="pw-label">Le formule</div>
        <h2 className="pw-title">Scegli quanto vuoi entrare nell'immobiliare</h2>
        <p className="pw-sub">Puoi limitarti a segnalare, oppure fare il salto e lavorare nel team. E puoi sempre passare dalla prima alla seconda.</p>
        <div className="pw-formule">
          <div className="pw-card">
            <div className="pw-card-tag">Formula 1</div>
            <h3>Partner</h3>
            <p className="pw-card-claim">Tu segnali, noi vendiamo.</p>
            <div className="pw-big">20%</div>
            <div className="pw-big-lbl">della provvigione incassata da FC Punto Hub lato venditore, per ogni incarico segnalato che va a buon fine</div>
            <ul className="pw-list">
              <li><span className="pw-check">✓</span>Continui il tuo lavoro in WeUnit, senza cambiare nulla</li>
              <li><span className="pw-check">✓</span>Valutazione, marketing, visite e trattativa li gestisce il nostro team</li>
              <li><span className="pw-check">✓</span>Ti aggiorniamo su ogni fase della vendita</li>
              <li><span className="pw-check">✓</span>Nessun costo e nessun obbligo di volumi</li>
            </ul>
            <a href="#candidati" className="pw-btn pw-btn-line" onClick={goForm("Partner (segnalazione)")}>Voglio diventare Partner</a>
          </div>

          <div className="pw-card pw-card-feat">
            <div className="pw-card-tag">Formula 2</div>
            <h3>Collaboratore Hub</h3>
            <p className="pw-card-claim">Entri nel team e lavori anche sull'immobiliare.</p>
            <div className="pw-levels"><span>New</span><span>Junior</span><span>Senior</span><span>Team Manager</span></div>
            <div className="pw-big-lbl">Provvigioni crescenti per livello secondo il piano compensi FC Punto Hub, con un percorso di crescita fino a Team Manager</div>
            <ul className="pw-list">
              <li><span className="pw-check">✓</span>Formazione ogni settimana con Agente Strategico</li>
              <li><span className="pw-check">✓</span>CRM, marketing interno e materiali pronti per ogni immobile</li>
              <li><span className="pw-check">✓</span>Team legale e Buyer Agent a supporto delle trattative</li>
              <li><span className="pw-check">✓</span>I mutui dei tuoi clienti continuano a passare da WeUnit</li>
            </ul>
            <a href="#candidati" className="pw-btn pw-btn-gold" onClick={goForm("Collaboratore Hub")}>Voglio entrare nel team</a>
          </div>
        </div>
      </section>

      <div className="pw-band">
        <section className="pw-section">
          <div className="pw-label">Come si parte</div>
          <h2 className="pw-title">Quattro passi, nessuna complicazione</h2>
          <p className="pw-sub">Dalla candidatura al primo incarico può passare meno di una settimana.</p>
          <div className="pw-steps">
            <div className="pw-step"><h3>Candidati</h3><p>Compili il modulo qui sotto: due minuti.</p></div>
            <div className="pw-step"><h3>Colloquio</h3><p>Ti chiamiamo entro 48 ore e ci incontriamo in Via Mascagni 35.</p></div>
            <div className="pw-step"><h3>Accordo</h3><p>Scegli la formula e firmi l'accordo con FC Punto Hub.</p></div>
            <div className="pw-step"><h3>Si parte</h3><p>Accedi all'Area Agenti e inizi a lavorare con il team.</p></div>
          </div>
        </section>
      </div>

      <section className="pw-section">
        <div className="pw-label">Cosa trovi nell'Hub</div>
        <h2 className="pw-title">Una struttura completa alle tue spalle</h2>
        <p className="pw-sub">Lo store di FondoCasa Hub al Vomero coordina oltre 20 collaboratori tra immobiliare, credito e assicurazioni.</p>
        <div className="pw-hub">
          <div><h4>Solo esclusive</h4><p>Ogni immobile ha un piano marketing dedicato e tempi chiari per il venditore.</p></div>
          <div><h4>Marketing interno</h4><p>Social, campagne, video e portali gestiti da un reparto dedicato.</p></div>
          <div><h4>Formazione continua</h4><p>Ogni settimana con Agente Strategico, per agenti esperti e nuovi.</p></div>
          <div><h4>Team legale</h4><p>Verifiche, proposte e contratti seguiti da professionisti.</p></div>
          <div><h4>Credito e assicurazioni</h4><p>WeUnit per i mutui, Henia Broker per le polizze: tutto in casa.</p></div>
          <div><h4>Area Agenti</h4><p>CRM, documenti e report di produzione in un unico portale.</p></div>
        </div>
      </section>

      <div className="pw-band">
        <section className="pw-section pw-faq">
          <div className="pw-label">Domande frequenti</div>
          <h2 className="pw-title" style={{ marginBottom: 24 }}>Le risposte alle domande più comuni</h2>
          {FAQ.map((f) => (
            <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </section>
      </div>

      <section className="pw-section" id="candidati">
        <div className="pw-form-wrap">
          <div>
            <div className="pw-label">Candidati</div>
            <h2 className="pw-title">Parliamone di persona</h2>
            <p className="pw-sub" style={{ marginBottom: 24 }}>Lascia i tuoi dati: ti ricontattiamo entro 48 ore per un colloquio conoscitivo, senza impegno.</p>
            <ul className="pw-list">
              <li><span className="pw-check">✓</span>FC Punto Hub — Via Pietro Mascagni 35, Vomero, Napoli</li>
              <li><span className="pw-check">✓</span><a href="tel:+3908118653202" style={{ color: "#FCFDFD" }}>081 18653202</a></li>
              <li><span className="pw-check">✓</span><a href="mailto:info@fondocasahub.com" style={{ color: "#FCFDFD" }}>info@fondocasahub.com</a></li>
            </ul>
          </div>

          <div className="pw-form">
            {status === "success" ? (
              <div className="pw-ok">
                <div className="pw-ok-icon">✓</div>
                <h3>Candidatura ricevuta</h3>
                <p>Grazie {form.nome}! Ti abbiamo inviato una email di conferma e ti chiameremo entro 48 ore.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="pw-grid">
                  <div className="pw-field pw-full">
                    <label>Formula che ti interessa *</label>
                    <div className="pw-radio">
                      {FORMULE.map((o) => (
                        <label key={o.value} className={form.formula === o.value ? "on" : ""}>
                          <input type="radio" name="formula" value={o.value} checked={form.formula === o.value} onChange={set("formula")} />
                          {o.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="pw-field"><label htmlFor="pw-nome">Nome *</label><input id="pw-nome" value={form.nome} onChange={set("nome")} autoComplete="given-name" /></div>
                  <div className="pw-field"><label htmlFor="pw-cognome">Cognome</label><input id="pw-cognome" value={form.cognome} onChange={set("cognome")} autoComplete="family-name" /></div>
                  <div className="pw-field"><label htmlFor="pw-tel">Telefono *</label><input id="pw-tel" type="tel" value={form.telefono} onChange={set("telefono")} autoComplete="tel" /></div>
                  <div className="pw-field"><label htmlFor="pw-email">Email *</label><input id="pw-email" type="email" value={form.email} onChange={set("email")} autoComplete="email" /></div>
                  <div className="pw-field"><label htmlFor="pw-citta">Città / zona</label><input id="pw-citta" value={form.citta} onChange={set("citta")} placeholder="Es. Napoli, Vomero" /></div>
                  <div className="pw-field">
                    <label htmlFor="pw-ruolo">Ruolo in WeUnit</label>
                    <select id="pw-ruolo" value={form.ruolo_weunit} onChange={set("ruolo_weunit")}>
                      <option value="">Seleziona…</option>
                      <option>Consulente del credito</option>
                      <option>Collaboratore / segnalatore</option>
                      <option>Back office</option>
                      <option>Altro</option>
                    </select>
                  </div>
                  <div className="pw-field pw-full">
                    <label htmlFor="pw-esp">Esperienza nell'immobiliare</label>
                    <select id="pw-esp" value={form.esperienza} onChange={set("esperienza")}>
                      <option value="">Seleziona…</option>
                      <option>Nessuna</option>
                      <option>Meno di 2 anni</option>
                      <option>Più di 2 anni</option>
                      <option>Agente con patentino</option>
                    </select>
                  </div>
                  <div className="pw-field pw-full"><label htmlFor="pw-msg">Messaggio</label><textarea id="pw-msg" value={form.messaggio} onChange={set("messaggio")} placeholder="Raccontaci qualcosa di te o fai una domanda" /></div>
                </div>
                <label className="pw-consent">
                  <input type="checkbox" checked={form.consenso} onChange={set("consenso")} />
                  <span>Acconsento al trattamento dei dati personali per essere ricontattato, ai sensi del GDPR. <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a> *</span>
                </label>
                {errMsg && <div className="pw-err">{errMsg}</div>}
                <button type="submit" className="pw-btn pw-btn-gold pw-submit" disabled={status === "sending"}>
                  {status === "sending" ? "Invio in corso…" : "Invia la candidatura"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="pw-footer">
        <img className="pw-piedino" src="/images/immobile/piedino.png" alt="FondoCasa · weunit.it · Henia" />
        <p>FC PUNTO HUB S.R.L. · Via Pietro Mascagni 35, 80129 Napoli · P.IVA 01924140096<br />
          <a href="tel:+3908118653202">081 18653202</a> · <a href="mailto:info@fondocasahub.com">info@fondocasahub.com</a> · <a href="/privacy">Privacy</a> · <a href="/">fondocasahub.com</a></p>
      </footer>
    </div>
  );
}
