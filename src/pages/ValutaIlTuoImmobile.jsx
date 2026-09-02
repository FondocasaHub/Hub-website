import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

/*
 * Landing "/valuta-il-tuo-immobile" — strumento di valutazione a step.
 * Stile grafico coerente con Costruttori.jsx / QuartiereLandingPage.jsx
 * (palette navy #0A1628 / oro #C9A84C, Playfair Display + Jost), qui con
 * prefisso "v-" per le classi. CSS scritto mobile-first (la maggior parte
 * del traffico è da smartphone): la base è la versione mobile, la media
 * query min-width allarga il layout su schermi più larghi.
 */

// Stesso webhook Make.com della pagina Venditori (WEBHOOK_VENDITORI in
// src/components/ContactForms.jsx), con origine="valutatore" per distinguere
// i lead nel funnel.
const MAKE_WEBHOOK_VENDITORI = "https://hook.eu1.make.com/7fqc30vc6gfaqi4vgsi9neyrwijpxg1d";

const QUARTIERI_OPTIONS = [
  { value: "vomero", label: "Vomero" },
  { value: "arenella", label: "Arenella" },
  { value: "chiaia", label: "Chiaia" },
  { value: "posillipo", label: "Posillipo" },
  { value: "fuorigrotta", label: "Fuorigrotta" },
  { value: "colli-aminei", label: "Colli Aminei" },
  { value: "altro", label: "Altro quartiere di Napoli" },
];

const TIPOLOGIE = [
  { value: "appartamento", label: "Appartamento", icon: "🏢" },
  { value: "attico", label: "Attico", icon: "🏙️" },
  { value: "villa", label: "Villa", icon: "🏡" },
  { value: "locale-commerciale", label: "Locale Commerciale", icon: "🏪" },
];

const PIANI = ["Piano terra", "1° piano", "2° piano", "3° piano", "4° piano", "5° piano o oltre"];

const STATI = [
  { value: "da-ristrutturare", label: "Da ristrutturare", desc: "Necessita di lavori importanti" },
  { value: "buono", label: "Buono stato", desc: "Abitabile, senza lavori urgenti" },
  { value: "ristrutturato", label: "Ristrutturato", desc: "Rifatto negli ultimi anni" },
  { value: "nuovo", label: "Nuovo / mai abitato", desc: "Costruzione recente" },
];

const STEP_LABELS = ["Tipologia", "Indirizzo", "Dettagli", "Stato", "Contatti"];

const EMPTY_FORM = {
  tipologia: "",
  indirizzo: "",
  quartiere: "",
  quartiereAltro: "",
  mq: "",
  piano: "",
  ascensore: null, // null = non ancora scelto, true/false = scelto
  stato: "",
  nome: "",
  telefono: "",
  email: "",
  privacy: false,
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Jost:wght@300;400;500;600&display=swap');

  .v-root { font-family: 'Jost', sans-serif; background: #0A1628; color: #F8F8F8; min-height: 100vh; -webkit-font-smoothing: antialiased; }

  .v-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: rgba(10,22,40,0.94); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(201,168,76,0.2); }
  .v-nav-logo { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: #C9A84C; letter-spacing: 0.04em; text-decoration: none; }
  .v-nav-logo span { color: #F8F8F8; font-weight: 400; }

  .v-wrap { max-width: 640px; margin: 0 auto; padding: 96px 20px 64px; }

  .v-eyebrow { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #C9A84C; margin-bottom: 12px; }
  .v-h1 { font-family: 'Playfair Display', serif; font-size: clamp(1.7rem, 6vw, 2.4rem); font-weight: 900; line-height: 1.15; margin-bottom: 14px; }
  .v-sub { font-size: 0.95rem; font-weight: 300; line-height: 1.6; color: rgba(248,248,248,0.65); margin-bottom: 32px; }

  /* PROGRESS */
  .v-progress-track { height: 6px; background: rgba(201,168,76,0.15); border-radius: 3px; overflow: hidden; margin-bottom: 10px; }
  .v-progress-fill { height: 100%; background: linear-gradient(90deg, #C9A84C, #E2C97E); border-radius: 3px; transition: width 0.35s ease; }
  .v-progress-label { display: flex; justify-content: space-between; font-size: 0.72rem; color: rgba(248,248,248,0.55); margin-bottom: 36px; letter-spacing: 0.03em; }
  .v-progress-label strong { color: #C9A84C; }

  /* CARD */
  .v-card { background: rgba(30,45,69,0.5); border: 1px solid rgba(201,168,76,0.2); border-radius: 8px; padding: 28px 22px; backdrop-filter: blur(8px); }
  .v-step-title { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700; margin-bottom: 6px; }
  .v-step-note { font-size: 0.85rem; color: rgba(248,248,248,0.55); margin-bottom: 24px; }

  /* SELEZIONE A CARD (tipologia / stato) */
  .v-choice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .v-choice { background: rgba(10,22,40,0.6); border: 1px solid rgba(201,168,76,0.25); border-radius: 6px; padding: 18px 14px; cursor: pointer; text-align: left; transition: all 0.2s; font-family: 'Jost', sans-serif; color: #F8F8F8; }
  .v-choice:hover { border-color: #C9A84C; }
  .v-choice.selected { border-color: #C9A84C; background: rgba(201,168,76,0.12); }
  .v-choice-icon { font-size: 1.4rem; margin-bottom: 8px; display: block; }
  .v-choice-label { font-size: 0.92rem; font-weight: 600; display: block; }
  .v-choice-desc { font-size: 0.76rem; color: rgba(248,248,248,0.55); margin-top: 4px; display: block; }

  /* FORM FIELDS */
  .v-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
  .v-field label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(248,248,248,0.6); }
  .v-field input, .v-field select { background: rgba(10,22,40,0.6); border: 1px solid rgba(201,168,76,0.25); color: #F8F8F8; font-family: 'Jost', sans-serif; font-size: 1rem; padding: 14px 14px; border-radius: 6px; outline: none; transition: border-color 0.2s; width: 100%; }
  .v-field select { appearance: none; }
  .v-field input:focus, .v-field select:focus { border-color: #C9A84C; }
  .v-field input::placeholder { color: rgba(248,248,248,0.3); }

  .v-toggle-row { display: flex; gap: 10px; }
  .v-toggle { flex: 1; background: rgba(10,22,40,0.6); border: 1px solid rgba(201,168,76,0.25); border-radius: 6px; padding: 14px; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 0.92rem; font-weight: 600; color: #F8F8F8; transition: all 0.2s; }
  .v-toggle:hover { border-color: #C9A84C; }
  .v-toggle.selected { border-color: #C9A84C; background: rgba(201,168,76,0.12); color: #C9A84C; }

  .v-privacy-row { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 22px; }
  .v-privacy-row input { margin-top: 3px; accent-color: #C9A84C; flex-shrink: 0; }
  .v-privacy-row span { font-size: 0.78rem; color: rgba(248,248,248,0.6); line-height: 1.5; }
  .v-privacy-row a { color: #C9A84C; }

  /* NAV BUTTONS */
  .v-btn-row { display: flex; gap: 12px; margin-top: 26px; }
  .v-btn-primary { flex: 1; background: #C9A84C; color: #0A1628; font-family: 'Jost', sans-serif; font-weight: 700; font-size: 0.9rem; letter-spacing: 0.05em; padding: 16px; border: none; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
  .v-btn-primary:hover { background: #E2C97E; }
  .v-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .v-btn-secondary { background: transparent; color: rgba(248,248,248,0.7); font-family: 'Jost', sans-serif; font-weight: 600; font-size: 0.9rem; padding: 16px 18px; border: 1px solid rgba(201,168,76,0.25); border-radius: 6px; cursor: pointer; transition: all 0.2s; }
  .v-btn-secondary:hover { border-color: #C9A84C; color: #C9A84C; }

  .v-error { font-size: 0.78rem; color: #ff8080; margin-top: -8px; margin-bottom: 16px; }

  /* SUCCESS */
  .v-success { text-align: center; padding: 20px 4px; }
  .v-success-icon { width: 60px; height: 60px; background: #C9A84C; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 20px; color: #0A1628; }
  .v-success h2 { font-family: 'Playfair Display', serif; font-size: 1.4rem; margin-bottom: 12px; }
  .v-success p { font-size: 0.9rem; color: rgba(248,248,248,0.65); line-height: 1.6; }

  .v-trust-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 28px; }
  .v-trust-pill { font-size: 0.72rem; color: rgba(248,248,248,0.55); border: 1px solid rgba(201,168,76,0.2); border-radius: 20px; padding: 6px 14px; }

  .v-footer { text-align: center; padding: 32px 20px; font-size: 0.75rem; color: rgba(248,248,248,0.4); border-top: 1px solid rgba(201,168,76,0.15); }
  .v-footer a { color: rgba(248,248,248,0.55); }

  /* DESKTOP (min-width) — mobile è la base */
  @media (min-width: 640px) {
    .v-wrap { padding: 120px 32px 80px; }
    .v-card { padding: 44px 40px; }
    .v-choice-grid { grid-template-columns: 1fr 1fr; gap: 14px; }
  }
`;

export default function ValutaIlTuoImmobile() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle"); // idle | sending | success
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const phoneValid = /^\+?3?9?[ ]?3\d{2}[ ]?\d{6,7}$/.test(form.telefono.trim());
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  const stepValid = [
    !!form.tipologia,
    form.indirizzo.trim().length > 0 && !!form.quartiere && (form.quartiere !== "altro" || form.quartiereAltro.trim().length > 0),
    !!form.mq && Number(form.mq) > 0 && !!form.piano && form.ascensore !== null,
    !!form.stato,
    form.nome.trim().length > 0 && phoneValid && emailValid && form.privacy === true,
  ];

  const goNext = () => {
    if (!stepValid[step]) { setShowErrors(true); return; }
    setShowErrors(false);
    if (step === STEP_LABELS.length - 1) {
      handleSubmit();
    } else {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    setShowErrors(false);
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setStatus("sending");
    try {
      await fetch(MAKE_WEBHOOK_VENDITORI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origine: "valutatore",
          categoria: "Valutazione Immobile",
          tipologia: form.tipologia,
          indirizzo: form.indirizzo,
          quartiere: form.quartiere === "altro" ? form.quartiereAltro : form.quartiere,
          mq: form.mq,
          piano: form.piano,
          ascensore: form.ascensore ? "Sì" : "No",
          stato: form.stato,
          nome: form.nome,
          telefono: form.telefono,
          email: form.email,
          privacy: form.privacy,
          timestamp: new Date().toISOString(),
        }),
      });
      setStatus("success");
    } catch {
      setStatus("success"); // mostra successo anche in caso CORS — Make riceve comunque
    }
  };

  const canonicalUrl = "https://www.fondocasahub.com/valuta-il-tuo-immobile";

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Valutazione Immobiliare Gratuita Napoli",
    "description": "Strumento gratuito per richiedere la valutazione del proprio immobile a Napoli: tipologia, indirizzo, metratura e stato di conservazione, con stima inviata da un consulente entro 24 ore.",
    "provider": {
      "@type": "RealEstateAgent",
      "name": "FondoCasa Hub",
      "url": "https://www.fondocasahub.com",
      "telephone": "+3908118653202",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Via Pietro Mascagni, 35",
        "addressLocality": "Napoli",
        "addressRegion": "NA",
        "postalCode": "80128",
        "addressCountry": "IT",
      },
      "hasMap": "https://www.google.com/maps/place/?q=place_id:ChIJ9QSKiKcJOxMRO3--jorfbQw",
    },
    "areaServed": { "@type": "City", "name": "Napoli" },
    "offers": {
      "@type": "Offer",
      "description": "Valutazione immobiliare gratuita con risposta entro 24 ore",
      "price": "0",
      "priceCurrency": "EUR",
    },
    "url": canonicalUrl,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.fondocasahub.com" },
      { "@type": "ListItem", "position": 2, "name": "Valuta il Tuo Immobile", "item": canonicalUrl },
    ],
  };

  const progressPct = ((step + (status === "success" ? 1 : 0)) / STEP_LABELS.length) * 100;

  return (
    <div className="v-root">
      <Helmet>
        <title>Valuta il Tuo Immobile Gratis a Napoli | FondoCasa Hub</title>
        <meta name="description" content="Scopri il valore del tuo immobile a Napoli in pochi minuti: rispondi a 5 domande e ricevi una stima reale entro 24 ore. Inizia la valutazione gratuita." />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content="Valuta il Tuo Immobile Gratis a Napoli | FondoCasa Hub" />
        <meta property="og:description" content="Scopri il valore del tuo immobile a Napoli in pochi minuti: rispondi a 5 domande e ricevi una stima reale entro 24 ore. Inizia la valutazione gratuita." />
        <meta property="og:locale" content="it_IT" />
        <meta property="og:site_name" content="FondoCasa Hub" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Valuta il Tuo Immobile Gratis a Napoli | FondoCasa Hub" />
        <meta name="twitter:description" content="Scopri il valore del tuo immobile a Napoli in pochi minuti: rispondi a 5 domande e ricevi una stima reale entro 24 ore. Inizia la valutazione gratuita." />

        <meta name="robots" content="index, follow" />
        <meta name="author" content="FondoCasa Hub" />

        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <nav className="v-nav">
        <a href="/" className="v-nav-logo">FondoCasa<span>Hub</span></a>
      </nav>

      <div className="v-wrap">
        {status === "success" ? (
          <div className="v-card">
            <h1 className="v-h1">Valuta il Tuo Immobile a Napoli</h1>
            <div className="v-success">
              <div className="v-success-icon">✓</div>
              <h2>Richiesta ricevuta!</h2>
              <p>Un nostro valutatore ti invia la stima completa entro 24 ore, basata sui prezzi reali di compravendita della tua zona.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="v-eyebrow">Valutazione Immobiliare Gratuita</div>
            <h1 className="v-h1">Valuta il tuo immobile a Napoli.</h1>
            <p className="v-sub">5 semplici domande, risposta di un consulente entro 24 ore. Nessun prezzo automatico: una stima vera, basata su vendite reali della tua zona.</p>

            <div className="v-progress-track"><div className="v-progress-fill" style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }} /></div>
            <div className="v-progress-label">
              <span>Passo {step + 1} di {STEP_LABELS.length}</span>
              <strong>{STEP_LABELS[step]}</strong>
            </div>

            <div className="v-card">
              {step === 0 && (
                <>
                  <div className="v-step-title">Che tipo di immobile è?</div>
                  <div className="v-step-note">Seleziona la tipologia più adatta.</div>
                  <div className="v-choice-grid">
                    {TIPOLOGIE.map((t) => (
                      <button key={t.value} type="button" className={`v-choice ${form.tipologia === t.value ? "selected" : ""}`} onClick={() => set("tipologia")(t.value)}>
                        <span className="v-choice-icon">{t.icon}</span>
                        <span className="v-choice-label">{t.label}</span>
                      </button>
                    ))}
                  </div>
                  {showErrors && !stepValid[0] && <p className="v-error" style={{ marginTop: 14 }}>Seleziona una tipologia per continuare.</p>}
                </>
              )}

              {step === 1 && (
                <>
                  <div className="v-step-title">Dove si trova?</div>
                  <div className="v-step-note">Indirizzo e quartiere dell'immobile.</div>
                  <div className="v-field">
                    <label>Indirizzo *</label>
                    <input value={form.indirizzo} onChange={(e) => set("indirizzo")(e.target.value)} placeholder="Via, numero civico" />
                  </div>
                  <div className="v-field">
                    <label>Quartiere *</label>
                    <select value={form.quartiere} onChange={(e) => set("quartiere")(e.target.value)}>
                      <option value="">Seleziona...</option>
                      {QUARTIERI_OPTIONS.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
                    </select>
                  </div>
                  {form.quartiere === "altro" && (
                    <div className="v-field">
                      <label>Specifica il quartiere *</label>
                      <input value={form.quartiereAltro} onChange={(e) => set("quartiereAltro")(e.target.value)} placeholder="es. Mergellina" />
                    </div>
                  )}
                  {showErrors && !stepValid[1] && <p className="v-error">Compila indirizzo e quartiere per continuare.</p>}
                </>
              )}

              {step === 2 && (
                <>
                  <div className="v-step-title">Metratura e caratteristiche</div>
                  <div className="v-step-note">Metri quadri, piano e ascensore.</div>
                  <div className="v-field">
                    <label>Metri quadri *</label>
                    <input type="number" min="1" value={form.mq} onChange={(e) => set("mq")(e.target.value)} placeholder="es. 90" />
                  </div>
                  <div className="v-field">
                    <label>Piano *</label>
                    <select value={form.piano} onChange={(e) => set("piano")(e.target.value)}>
                      <option value="">Seleziona...</option>
                      {PIANI.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="v-field">
                    <label>Ascensore *</label>
                    <div className="v-toggle-row">
                      <button type="button" className={`v-toggle ${form.ascensore === true ? "selected" : ""}`} onClick={() => set("ascensore")(true)}>Sì</button>
                      <button type="button" className={`v-toggle ${form.ascensore === false ? "selected" : ""}`} onClick={() => set("ascensore")(false)}>No</button>
                    </div>
                  </div>
                  {showErrors && !stepValid[2] && <p className="v-error">Compila metratura, piano e ascensore per continuare.</p>}
                </>
              )}

              {step === 3 && (
                <>
                  <div className="v-step-title">Stato di conservazione</div>
                  <div className="v-step-note">In che condizioni si trova l'immobile?</div>
                  <div className="v-choice-grid">
                    {STATI.map((s) => (
                      <button key={s.value} type="button" className={`v-choice ${form.stato === s.value ? "selected" : ""}`} onClick={() => set("stato")(s.value)}>
                        <span className="v-choice-label">{s.label}</span>
                        <span className="v-choice-desc">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                  {showErrors && !stepValid[3] && <p className="v-error" style={{ marginTop: 14 }}>Seleziona lo stato di conservazione per continuare.</p>}
                </>
              )}

              {step === 4 && (
                <>
                  <div className="v-step-title">I tuoi contatti</div>
                  <div className="v-step-note">Dove inviamo la stima?</div>
                  <div className="v-field">
                    <label>Nome e Cognome *</label>
                    <input value={form.nome} onChange={(e) => set("nome")(e.target.value)} placeholder="Mario Rossi" />
                  </div>
                  <div className="v-field">
                    <label>Telefono *</label>
                    <input type="tel" inputMode="tel" value={form.telefono} onChange={(e) => set("telefono")(e.target.value)} placeholder="+39 333 000 0000" />
                  </div>
                  <div className="v-field">
                    <label>Email *</label>
                    <input type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder="mario@email.it" />
                  </div>
                  <div className="v-privacy-row">
                    <input type="checkbox" checked={form.privacy} onChange={(e) => set("privacy")(e.target.checked)} />
                    <span>Acconsento al trattamento dei dati personali ai sensi del GDPR per essere ricontattato da FondoCasa Hub. <a href="/privacy">Privacy Policy</a> *</span>
                  </div>
                  {showErrors && !stepValid[4] && <p className="v-error">Compila tutti i campi obbligatori con dati validi e accetta la privacy per inviare.</p>}
                </>
              )}

              <div className="v-btn-row">
                {step > 0 && <button type="button" className="v-btn-secondary" onClick={goBack}>← Indietro</button>}
                <button type="button" className="v-btn-primary" onClick={goNext} disabled={status === "sending"}>
                  {status === "sending" ? "Invio in corso..." : step === STEP_LABELS.length - 1 ? "Invia richiesta →" : "Avanti →"}
                </button>
              </div>
            </div>

            <div className="v-trust-row">
              <span className="v-trust-pill">✓ Nessun costo</span>
              <span className="v-trust-pill">✓ Nessun impegno</span>
              <span className="v-trust-pill">✓ Risposta entro 24 ore</span>
            </div>
          </>
        )}
      </div>

      <div className="v-footer">
        FondoCasa Hub — Via Pietro Mascagni, 35, 80128 Napoli · <a href="/privacy">Privacy</a>
      </div>
    </div>
  );
}
