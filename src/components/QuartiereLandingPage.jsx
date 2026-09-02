import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

/*
 * Componente di pagina riutilizzabile per le landing "agenzia immobiliare
 * a [quartiere]". Stile grafico, classi CSS e struttura dei blocchi
 * ricalcano esattamente src/pages/Costruttori.jsx (stessa palette navy/oro,
 * stessi font, stesso pattern di sezioni/hero/form/footer), con prefisso
 * "q-" al posto di "c-" per evitare collisioni se mai coesistessero nel DOM.
 *
 * Uso:
 *   <QuartiereLandingPage
 *     quartiere="Vomero"
 *     slug="vomero"
 *     heroTitle={<>Agenzia immobiliare<br/>al <span className="accent">Vomero</span>.</>}
 *     heroSubtitle="..."
 *     marketText={[ "paragrafo 1...", "paragrafo 2...", ... ]}
 *     whyUsPoints={[{ icon: "🏠", title: "...", desc: "..." }, ...]}  // 3-4 elementi
 *     faq={[{ q: "...", a: "..." }, ...]}                             // 4 elementi
 *     seo={{ title: "...", description: "...", ogImage: "https://.../og-vomero.jpg" }}
 *   />
 */

// Stesso webhook Make.com usato dalla pagina Venditori (WEBHOOK_VENDITORI in
// src/components/ContactForms.jsx e src/pages/VendiCasaVomero.jsx).
const MAKE_WEBHOOK_VENDITORI = "https://hook.eu1.make.com/7fqc30vc6gfaqi4vgsi9neyrwijpxg1d";

const PHONE = "+3908118653202";
const PHONE_DISPLAY = "081 18653202";
const ADDRESS = "Via Pietro Mascagni, 35";
const CITY = "Napoli";
const POSTAL_CODE = "80128";
// Coordinate della sede (Via Pietro Mascagni 35, Vomero) — stesse di index.html.
const DEFAULT_GEO = { lat: 40.851773, lng: 14.268124 };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Jost:wght@300;400;500;600&display=swap');

  .q-root { font-family: 'Jost', sans-serif; background: #0A1628; color: #F8F8F8; overflow-x: hidden; -webkit-font-smoothing: antialiased; }

  /* NAV */
  .q-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; background: rgba(10,22,40,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(201,168,76,0.2); }
  .q-nav-logo { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: #C9A84C; letter-spacing: 0.04em; text-decoration: none; }
  .q-nav-logo span { color: #F8F8F8; font-weight: 400; }
  .q-nav-badge { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(248,248,248,0.6); border: 1px solid rgba(201,168,76,0.2); padding: 4px 12px; border-radius: 2px; }
  .q-nav-cta { background: #C9A84C; color: #0A1628; font-family: 'Jost', sans-serif; font-weight: 600; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; padding: 10px 24px; border-radius: 2px; transition: background 0.2s; }
  .q-nav-cta:hover { background: #E2C97E; }

  /* HERO */
  .q-hero { min-height: 100vh; padding-top: 97px; display: grid; grid-template-columns: 1fr 1fr; position: relative; overflow: hidden; }
  .q-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 70% 50%, rgba(201,168,76,0.06) 0%, transparent 70%), linear-gradient(135deg, #0A1628 0%, #0d1f3a 100%); }
  .q-hero-grid { position: absolute; inset: 0; opacity: 0.04; background-image: linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px); background-size: 60px 60px; }
  .q-hero-left { position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: center; padding: 80px 64px 80px 80px; }
  .q-hero-eyebrow { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #C9A84C; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
  .q-hero-eyebrow::before { content: ''; display: block; width: 32px; height: 1px; background: #C9A84C; }
  .q-hero-title { font-family: 'Playfair Display', serif; font-size: clamp(2.6rem, 4vw, 3.8rem); font-weight: 900; line-height: 1.12; margin-bottom: 28px; }
  .q-hero-title .accent { color: #C9A84C; display: block; }
  .q-hero-sub { font-size: 1.05rem; font-weight: 300; line-height: 1.7; color: rgba(248,248,248,0.6); margin-bottom: 12px; max-width: 480px; }
  .q-hero-areas { font-size: 0.85rem; font-weight: 400; color: #C9A84C; margin-bottom: 32px; max-width: 480px; }
  .q-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 44px; }
  .q-pill { border: 1px solid rgba(201,168,76,0.2); padding: 7px 18px; border-radius: 2px; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.06em; color: rgba(248,248,248,0.6); }
  .q-pill-gold { border-color: #C9A84C; color: #C9A84C; }
  .q-hero-btns { display: flex; gap: 16px; flex-wrap: wrap; }
  .q-btn-primary { background: #C9A84C; color: #0A1628; font-family: 'Jost', sans-serif; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 16px 36px; border-radius: 2px; text-decoration: none; transition: background 0.2s; display: inline-flex; align-items: center; gap: 10px; border: none; cursor: pointer; }
  .q-btn-primary:hover { background: #E2C97E; }
  .q-btn-secondary { border: 1px solid rgba(201,168,76,0.2); color: #F8F8F8; font-family: 'Jost', sans-serif; font-weight: 500; font-size: 0.85rem; padding: 16px 36px; border-radius: 2px; text-decoration: none; transition: border-color 0.2s, color 0.2s; display: inline-flex; align-items: center; gap: 10px; }
  .q-btn-secondary:hover { border-color: #C9A84C; color: #C9A84C; }
  .q-hero-right { position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; padding: 80px 80px 80px 40px; }
  .q-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; width: 100%; max-width: 420px; }
  .q-stat { background: rgba(30,45,69,0.7); border: 1px solid rgba(201,168,76,0.2); padding: 32px 28px; transition: border-color 0.3s; backdrop-filter: blur(8px); }
  .q-stat:hover { border-color: #C9A84C; }
  .q-stat-feat { background: #C9A84C; border-color: #C9A84C; grid-column: span 2; }
  .q-stat-feat .q-stat-num { color: #0A1628; }
  .q-stat-feat .q-stat-lbl { color: rgba(10,22,40,0.7); }
  .q-stat-num { font-family: 'Playfair Display', serif; font-size: 2.4rem; font-weight: 900; color: #C9A84C; line-height: 1; margin-bottom: 6px; }
  .q-stat-lbl { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(248,248,248,0.6); }

  /* SECTIONS */
  .q-section { padding: 100px 80px; }
  .q-section-dark { background: #1E2D45; }
  .q-eyebrow { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #C9A84C; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
  .q-eyebrow::before { content: ''; display: block; width: 24px; height: 1px; background: #C9A84C; }
  .q-title { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 3vw, 2.8rem); font-weight: 700; line-height: 1.2; margin-bottom: 16px; }
  .q-sub { font-size: 1rem; font-weight: 300; line-height: 1.7; color: rgba(248,248,248,0.6); max-width: 640px; margin-bottom: 40px; }

  /* MERCATO (testo lungo) */
  .q-market-text { max-width: 780px; }
  .q-market-text p { font-size: 0.98rem; font-weight: 300; line-height: 1.85; color: rgba(248,248,248,0.75); margin-bottom: 22px; }
  .q-market-text p:last-child { margin-bottom: 0; }

  /* TABELLA VALORI PER STRADA */
  .q-price-table { max-width: 780px; margin-top: 36px; }
  .q-price-caption { font-size: 0.82rem; font-weight: 400; line-height: 1.6; color: rgba(248,248,248,0.5); margin-top: 14px; }
  .q-price-table table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
  .q-price-table th, .q-price-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid rgba(201,168,76,0.18); }
  .q-price-table th { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #C9A84C; }
  .q-price-table td { font-weight: 300; color: rgba(248,248,248,0.85); }
  .q-price-table td:first-child { font-weight: 500; color: #F8F8F8; }
  .q-price-table tr:last-child td { border-bottom: none; }
  @media (max-width: 560px) {
    .q-price-table th, .q-price-table td { padding: 10px 8px; font-size: 0.85rem; }
  }

  /* PERCHE' SCEGLIERE NOI */
  .q-why-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2px; }
  .q-why-card { background: #0A1628; padding: 36px 32px; border-top: 3px solid transparent; transition: border-color 0.3s; }
  .q-why-card:hover { border-color: #C9A84C; }
  .q-why-icon { width: 40px; height: 40px; border-radius: 2px; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 1.1rem; }
  .q-why-card h3 { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 600; margin-bottom: 12px; }
  .q-why-card p { font-size: 0.9rem; line-height: 1.65; color: rgba(248,248,248,0.6); }

  /* FAQ ACCORDION */
  .q-faq-list { max-width: 780px; display: flex; flex-direction: column; }
  .q-faq-item { border-bottom: 1px solid rgba(201,168,76,0.2); }
  .q-faq-item:first-child { border-top: 1px solid rgba(201,168,76,0.2); }
  .q-faq-question { width: 100%; text-align: left; background: transparent; border: none; padding: 24px 4px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; font-family: 'Jost', sans-serif; }
  .q-faq-question span.q-faq-q-text { font-size: 1rem; font-weight: 600; color: #F8F8F8; line-height: 1.4; }
  .q-faq-icon { color: #C9A84C; font-size: 22px; flex-shrink: 0; transition: transform 0.3s; line-height: 1; }
  .q-faq-icon.open { transform: rotate(45deg); }
  .q-faq-answer { padding: 0 4px 26px; margin: 0; font-size: 0.92rem; line-height: 1.8; color: rgba(248,248,248,0.65); }

  /* FORM */
  .q-cons-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
  .q-benefit { display: flex; align-items: flex-start; gap: 18px; padding: 20px 0; border-bottom: 1px solid rgba(201,168,76,0.2); }
  .q-benefit:last-child { border-bottom: none; }
  .q-benefit-icon { width: 44px; height: 44px; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.2); border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
  .q-benefit h4 { font-size: 0.95rem; font-weight: 600; margin-bottom: 4px; }
  .q-benefit p { font-size: 0.85rem; color: rgba(248,248,248,0.6); line-height: 1.5; }
  .q-form-wrap { background: rgba(30,45,69,0.7); border: 1px solid rgba(201,168,76,0.2); padding: 44px 40px; backdrop-filter: blur(10px); }
  .q-form-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; margin-bottom: 6px; }
  .q-form-note { font-size: 0.82rem; color: rgba(248,248,248,0.6); margin-bottom: 28px; }
  .q-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .q-form-full { grid-column: span 2; }
  .q-field { display: flex; flex-direction: column; gap: 6px; }
  .q-field label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(248,248,248,0.6); }
  .q-field input, .q-field textarea { background: rgba(10,22,40,0.6); border: 1px solid rgba(201,168,76,0.2); color: #F8F8F8; font-family: 'Jost', sans-serif; font-size: 0.9rem; padding: 13px 16px; border-radius: 2px; outline: none; transition: border-color 0.2s; width: 100%; }
  .q-field textarea { resize: vertical; min-height: 90px; }
  .q-field input:focus, .q-field textarea:focus { border-color: #C9A84C; }
  .q-field input::placeholder, .q-field textarea::placeholder { color: rgba(248,248,248,0.3); }
  .q-privacy { font-size: 0.75rem; color: rgba(248,248,248,0.6); margin-top: 14px; line-height: 1.5; }
  .q-privacy a { color: #C9A84C; }
  .q-btn-submit { width: 100%; background: #C9A84C; color: #0A1628; font-family: 'Jost', sans-serif; font-weight: 700; font-size: 0.88rem; letter-spacing: 0.12em; text-transform: uppercase; border: none; cursor: pointer; padding: 18px; margin-top: 18px; border-radius: 2px; transition: background 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .q-btn-submit:hover { background: #E2C97E; }
  .q-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .q-success { text-align: center; padding: 40px 20px; }
  .q-success-icon { width: 64px; height: 64px; background: #C9A84C; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 20px; }
  .q-success h3 { font-family: 'Playfair Display', serif; font-size: 1.4rem; margin-bottom: 12px; }
  .q-success p { font-size: 0.9rem; color: rgba(248,248,248,0.6); line-height: 1.6; }

  /* ALTRE ZONE (link interni) */
  .q-nearby-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2px; }
  .q-nearby-card { background: #0A1628; padding: 28px 26px; border-top: 3px solid transparent; transition: border-color 0.3s, background 0.3s; text-decoration: none; color: inherit; display: block; }
  .q-nearby-card:hover { border-color: #C9A84C; background: rgba(201,168,76,0.06); }
  .q-nearby-card h3 { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 600; color: #F8F8F8; margin-bottom: 8px; }
  .q-nearby-card span { font-size: 0.82rem; color: #C9A84C; font-weight: 600; letter-spacing: 0.04em; }

  /* FOOTER */
  .q-footer { background: #060e1a; padding: 40px 80px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; border-top: 1px solid rgba(201,168,76,0.2); }
  .q-footer-brand { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: #C9A84C; }
  .q-footer-brand span { color: #F8F8F8; font-weight: 400; }
  .q-footer-info { font-size: 0.78rem; color: rgba(248,248,248,0.6); line-height: 1.6; }

  /* REVEAL */
  .q-reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .q-reveal.visible { opacity: 1; transform: translateY(0); }

  @media (max-width: 900px) {
    .q-nav { padding: 16px 24px; }
    .q-nav-badge { display: none; }
    .q-section { padding: 72px 24px; }
    .q-hero { grid-template-columns: 1fr; }
    .q-hero-left { padding: 56px 24px 32px; }
    .q-hero-right { display: none; }
    .q-cons-inner { grid-template-columns: 1fr; gap: 48px; }
    .q-why-grid { grid-template-columns: 1fr; }
    .q-form-grid { grid-template-columns: 1fr; }
    .q-form-full { grid-column: span 1; }
    .q-footer { padding: 32px 24px; flex-direction: column; text-align: center; }
  }
  @media (prefers-reduced-motion: reduce) {
    .q-reveal { opacity: 1; transform: none; transition: none; }
  }
`;

export default function QuartiereLandingPage({
  quartiere,
  slug,
  heroEyebrow,
  heroTitle,
  heroSubtitle,
  heroPills,
  heroStats,
  // Altri quartieri realmente coperti oltre a quello target di questa pagina
  // (es. per Vomero: Chiaia, Posillipo, Fuorigrotta, Soccavo, Centro Storico).
  // Usato nel JSON-LD (areaServed) e in una riga informativa sotto il sottotitolo.
  alsoServesAreas = [],
  marketTitle,
  marketText = [],
  // Valori del venduto per singola strada, quando il quartiere e' troppo
  // ampio per un range unico: [{ via, tipico, massimo }]. Sotto la tabella
  // va sempre priceTableNote, che spiega a cosa si riferiscono le cifre.
  priceTable = [],
  priceTableTitle,
  priceTableNote,
  whyUsTitle,
  whyUsPoints = [],
  faq = [],
  seo = {},
  geo = DEFAULT_GEO,
  // Le 3-4 zone geograficamente più vicine, per il link interno "Altre zone"
  // in fondo alla pagina: [{ name: "Chiaia", slug: "chiaia" }, ...].
  nearbyAreas = [],
}) {
  const [form, setForm] = useState({ nome: "", telefono: "", email: "", indirizzo: "", messaggio: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = styles;
    document.head.appendChild(style);

    const reveals = document.querySelectorAll(".q-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    reveals.forEach(r => obs.observe(r));

    return () => { document.head.removeChild(style); obs.disconnect(); };
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.nome || !form.telefono || !form.email) {
      alert("Compila i campi obbligatori: Nome, Telefono ed Email.");
      return;
    }
    setStatus("sending");
    try {
      await fetch(MAKE_WEBHOOK_VENDITORI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoria: `Vendi Casa ${quartiere}`,
          nome: form.nome,
          email: form.email,
          phone: form.telefono,
          zona: form.indirizzo || quartiere,
          note: form.messaggio || "—",
          quartiere,
          pagina: `landing-agenzia-immobiliare-${slug}`,
          timestamp: new Date().toISOString(),
        }),
      });
      setStatus("success");
    } catch {
      setStatus("success"); // mostra successo anche in caso CORS — Make riceve comunque
    }
  };

  const canonicalUrl = `https://www.fondocasahub.com/agenzia-immobiliare-${slug}-napoli`;

  const realEstateAgentSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": `FondoCasa Hub – Agenzia Immobiliare ${quartiere}`,
    "url": canonicalUrl,
    "telephone": PHONE,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": ADDRESS,
      "addressLocality": CITY,
      "postalCode": POSTAL_CODE,
      "addressCountry": "IT",
    },
    "geo": { "@type": "GeoCoordinates", "latitude": geo.lat, "longitude": geo.lng },
    // Il quartiere target della pagina è sempre il primo elemento (massima rilevanza SEO
    // per questa landing); le altre zone realmente coperte seguono via alsoServesAreas.
    "areaServed": [quartiere, ...alsoServesAreas].map((name) => ({ "@type": "Place", name })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  };

  return (
    <div className="q-root">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
        <meta property="og:locale" content="it_IT" />
        <meta property="og:site_name" content="FondoCasa Hub" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        {seo.ogImage && <meta name="twitter:image" content={seo.ogImage} />}

        <meta name="robots" content="index, follow" />
        <meta name="author" content="FondoCasa Hub" />

        <script type="application/ld+json">{JSON.stringify(realEstateAgentSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* NAV */}
      <nav className="q-nav">
        <a href="/" className="q-nav-logo">FondoCasa<span>Hub</span></a>
        <span className="q-nav-badge">{quartiere}</span>
        <a href="#valutazione" className="q-nav-cta">Richiedi Valutazione</a>
      </nav>

      {/* HERO */}
      <section className="q-hero">
        <div className="q-hero-bg" />
        <div className="q-hero-grid" />
        <div className="q-hero-left">
          <p className="q-hero-eyebrow">{heroEyebrow || `Agenzia Immobiliare a Napoli, ${quartiere}`}</p>
          <h1 className="q-hero-title">{heroTitle}</h1>
          <p className="q-hero-sub">{heroSubtitle}</p>
          {alsoServesAreas.length > 0 && (
            <p className="q-hero-areas">Operativi anche a {alsoServesAreas.join(", ")}.</p>
          )}
          <div className="q-pills">
            {(heroPills || ["26 anni di esperienza", "Valutazione gratuita", quartiere]).map((p, i) => (
              <span key={i} className={`q-pill ${i === 0 ? "q-pill-gold" : ""}`}>{p}</span>
            ))}
          </div>
          <div className="q-hero-btns">
            <a href="#valutazione" className="q-btn-primary">→ Valutazione Gratuita</a>
            <a href="#mercato" className="q-btn-secondary">+ Scopri il mercato</a>
            <a href={`tel:${PHONE}`} className="q-btn-secondary">&#9742; Chiama {PHONE_DISPLAY}</a>
          </div>
        </div>
        <div className="q-hero-right">
          <div className="q-stats-grid">
            {(heroStats || [
              ["26+", "Anni di esperienza", true],
              ["3.200+", "Famiglie assistite"],
              ["Gratuita", "Valutazione immobile"],
              [quartiere, "Zona di riferimento"],
            ]).map(([v, l, feat], i) => (
              <div key={i} className={`q-stat ${feat ? "q-stat-feat" : ""}`}>
                <div className="q-stat-num">{v}</div>
                <div className="q-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MERCATO */}
      <section className="q-section q-section-dark q-reveal" id="mercato">
        <div className="q-eyebrow">Il mercato locale</div>
        <h2 className="q-title">{marketTitle || `Il mercato immobiliare a ${quartiere}`}</h2>
        <div className="q-market-text">
          {marketText.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        {priceTable.length > 0 && (
          <div className="q-price-table">
            <div className="q-eyebrow" style={{ marginBottom: 16 }}>
              {priceTableTitle || `Valori del venduto a ${quartiere}`}
            </div>
            <table aria-label={priceTableTitle || `Valori del venduto a ${quartiere}`}>
              <thead>
                <tr>
                  <th scope="col">Strada</th>
                  <th scope="col">Valore ricorrente</th>
                  <th scope="col">Punta massima</th>
                </tr>
              </thead>
              <tbody>
                {priceTable.map((r) => (
                  <tr key={r.via}>
                    <td>{r.via}</td>
                    <td>{r.tipico}</td>
                    <td>{r.massimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {priceTableNote && <p className="q-price-caption">{priceTableNote}</p>}
          </div>
        )}
      </section>

      {/* PERCHE' SCEGLIERE NOI */}
      <section className="q-section q-reveal">
        <div className="q-eyebrow">Il nostro vantaggio</div>
        <h2 className="q-title">{whyUsTitle || `Perché scegliere noi a ${quartiere}`}</h2>
        <div className="q-why-grid">
          {whyUsPoints.map(({ icon, title, desc }, i) => (
            <div key={i} className="q-why-card">
              <div className="q-why-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="q-section q-section-dark q-reveal">
        <div className="q-eyebrow">Domande frequenti</div>
        <h2 className="q-title">Le domande più comuni su {quartiere}</h2>
        <div className="q-faq-list">
          {faq.map(({ q, a }, i) => (
            <div key={i} className="q-faq-item">
              <button className="q-faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <span className="q-faq-q-text">{q}</span>
                <span className={`q-faq-icon ${openFaq === i ? "open" : ""}`}>+</span>
              </button>
              {openFaq === i && <p className="q-faq-answer">{a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* FORM */}
      <section className="q-section q-reveal" id="valutazione">
        <div className="q-eyebrow">Parliamo del tuo immobile</div>
        <h2 className="q-title">Valutazione gratuita<br/>senza impegno.</h2>
        <div className="q-cons-inner">
          <div>
            <p style={{fontSize:"1rem",lineHeight:1.7,color:"rgba(248,248,248,0.6)",marginBottom:"40px"}}>
              Vuoi vendere o comprare casa a {quartiere}? Richiedi una valutazione gratuita: un consulente FondoCasa Hub ti risponde entro 24 ore.
            </p>
            {[
              ["📍", `Conoscenza diretta di ${quartiere}`, "Analisi di mercato basata su vendite comparabili reali della zona, non su stime generiche."],
              ["📋", "Verifica documentale gratuita", "Controlliamo la regolarità urbanistica e catastale del tuo immobile prima di metterlo sul mercato."],
              ["🤝", "Un solo interlocutore", "Immobiliare, mutuo e assicurazione seguiti dallo stesso team, dalla valutazione al rogito."],
            ].map(([icon, title, desc]) => (
              <div key={title} className="q-benefit">
                <div className="q-benefit-icon">{icon}</div>
                <div><h4>{title}</h4><p>{desc}</p></div>
              </div>
            ))}
          </div>

          <div className="q-form-wrap">
            {status === "success" ? (
              <div className="q-success">
                <div className="q-success-icon">✓</div>
                <h3>Richiesta inviata!</h3>
                <p>Il nostro team ti contatterà entro 24 ore lavorative per organizzare la valutazione gratuita a {quartiere}.</p>
              </div>
            ) : (
              <>
                <h3 className="q-form-title">Richiedi la tua valutazione</h3>
                <p className="q-form-note">Compila il form — ti richiamiamo entro 24 ore lavorative.</p>
                <div className="q-form-grid">
                  <div className="q-field"><label>Nome e Cognome *</label><input value={form.nome} onChange={set("nome")} placeholder="Mario Rossi"/></div>
                  <div className="q-field"><label>Telefono *</label><input type="tel" inputMode="tel" pattern="^\+?3?9?[ ]?3\d{2}[ ]?\d{6,7}$" title="Inserisci un numero di cellulare italiano, es. 333 1234567 oppure +39 333 1234567" required value={form.telefono} onChange={set("telefono")} placeholder="+39 333 000 0000"/></div>
                  <div className="q-field q-form-full"><label>Email *</label><input type="email" value={form.email} onChange={set("email")} placeholder="mario@email.it"/></div>
                  <div className="q-field q-form-full"><label>Indirizzo immobile</label><input value={form.indirizzo} onChange={set("indirizzo")} placeholder={`es. Via Esempio 12, ${quartiere}`}/></div>
                  <div className="q-field q-form-full"><label>Messaggio (opzionale)</label><textarea value={form.messaggio} onChange={set("messaggio")} placeholder="Raccontaci brevemente la tua richiesta..."/></div>
                </div>
                <p className="q-privacy">Inviando il modulo acconsenti al trattamento dei dati personali ai sensi del GDPR. <a href="/privacy">Privacy Policy</a></p>
                <button className="q-btn-submit" onClick={handleSubmit} disabled={status==="sending"}>
                  {status==="sending" ? "⏳ Invio in corso..." : "→ Richiedi Valutazione Gratuita"}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ALTRE ZONE */}
      {nearbyAreas.length > 0 && (
        <section className="q-section q-section-dark q-reveal">
          <div className="q-eyebrow">Altre zone</div>
          <h2 className="q-title">Operiamo anche in altri quartieri di Napoli</h2>
          <div className="q-nearby-grid">
            {nearbyAreas.map(({ name, slug: nearbySlug }) => (
              <a key={nearbySlug} className="q-nearby-card" href={`/agenzia-immobiliare-${nearbySlug}-napoli`}>
                <h3>{`Agenzia Immobiliare a ${name}`}</h3>
                <span>Valutazione gratuita a {name} →</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="q-footer">
        <div>
          <div className="q-footer-brand">FondoCasa<span>Hub</span></div>
          <div className="q-footer-info" style={{marginTop:"8px"}}>Agenzia Immobiliare — {quartiere}, Napoli</div>
        </div>
        <div className="q-footer-info" style={{textAlign:"right"}}>
          {ADDRESS}, {POSTAL_CODE} {CITY}<br/>
          <a href={`tel:${PHONE}`} style={{color:"#C9A84C",textDecoration:"none"}}>Tel. {PHONE_DISPLAY}</a><br/>
          <a href="https://wa.me/393924579047" target="_blank" rel="noopener noreferrer" style={{color:"#C9A84C",textDecoration:"none"}}>WhatsApp Store 392 457 9047</a><br/>
          fondocasahub.com | WeUnit – OAM M28
        </div>
      </footer>
    </div>
  );
}
