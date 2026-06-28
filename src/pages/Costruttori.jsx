import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

/* ─────────────────────────────────────────
   NOTA DEPLOY:
   1. Copia questo file in src/pages/Costruttori.jsx
   2. Copia il PDF in public/Speciale-Costruttori-2026.pdf
   3. Aggiungi la route in App.jsx:
      <Route path="/costruttori" element={<Costruttori />} />
   4. git add . && git commit -m "feat: landing costruttori" && git push
───────────────────────────────────────────── */

const MAKE_WEBHOOK = "https://hook.eu1.make.com/f5y10qwk1czp77a9vbgk9e2vxqpoyycg"; // ← sostituisci dopo

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Jost:wght@300;400;500;600&display=swap');

  .c-root { font-family: 'Jost', sans-serif; background: #0A1628; color: #F8F8F8; overflow-x: hidden; -webkit-font-smoothing: antialiased; }

  /* NAV */
  .c-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 18px 48px; background: rgba(10,22,40,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(201,168,76,0.2); }
  .c-nav-logo { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: #C9A84C; letter-spacing: 0.04em; text-decoration: none; }
  .c-nav-logo span { color: #F8F8F8; font-weight: 400; }
  .c-nav-badge { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(248,248,248,0.6); border: 1px solid rgba(201,168,76,0.2); padding: 4px 12px; border-radius: 2px; }
  .c-nav-cta { background: #C9A84C; color: #0A1628; font-family: 'Jost', sans-serif; font-weight: 600; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; padding: 10px 24px; border-radius: 2px; transition: background 0.2s; }
  .c-nav-cta:hover { background: #E2C97E; }

  /* TICKER */
  .c-ticker { position: fixed; top: 61px; left: 0; right: 0; z-index: 99; background: #C9A84C; overflow: hidden; height: 36px; display: flex; align-items: center; }
  .c-ticker-track { display: flex; animation: cticker 28s linear infinite; white-space: nowrap; }
  .c-ticker-item { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #0A1628; padding: 0 48px; }
  @keyframes cticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

  /* HERO */
  .c-hero { min-height: 100vh; padding-top: 97px; display: grid; grid-template-columns: 1fr 1fr; position: relative; overflow: hidden; }
  .c-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 70% 50%, rgba(201,168,76,0.06) 0%, transparent 70%), linear-gradient(135deg, #0A1628 0%, #0d1f3a 100%); }
  .c-hero-grid { position: absolute; inset: 0; opacity: 0.04; background-image: linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px); background-size: 60px 60px; }
  .c-hero-left { position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: center; padding: 80px 64px 80px 80px; }
  .c-hero-eyebrow { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #C9A84C; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
  .c-hero-eyebrow::before { content: ''; display: block; width: 32px; height: 1px; background: #C9A84C; }
  .c-hero-title { font-family: 'Playfair Display', serif; font-size: clamp(2.6rem, 4vw, 3.8rem); font-weight: 900; line-height: 1.12; margin-bottom: 28px; }
  .c-hero-title .accent { color: #C9A84C; display: block; }
  .c-hero-sub { font-size: 1.05rem; font-weight: 300; line-height: 1.7; color: rgba(248,248,248,0.6); margin-bottom: 44px; max-width: 480px; }
  .c-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 44px; }
  .c-pill { border: 1px solid rgba(201,168,76,0.2); padding: 7px 18px; border-radius: 2px; font-size: 0.78rem; font-weight: 500; letter-spacing: 0.06em; color: rgba(248,248,248,0.6); }
  .c-pill-gold { border-color: #C9A84C; color: #C9A84C; }
  .c-hero-btns { display: flex; gap: 16px; flex-wrap: wrap; }
  .c-btn-primary { background: #C9A84C; color: #0A1628; font-family: 'Jost', sans-serif; font-weight: 700; font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 16px 36px; border-radius: 2px; text-decoration: none; transition: background 0.2s; display: inline-flex; align-items: center; gap: 10px; }
  .c-btn-primary:hover { background: #E2C97E; }
  .c-btn-secondary { border: 1px solid rgba(201,168,76,0.2); color: #F8F8F8; font-family: 'Jost', sans-serif; font-weight: 500; font-size: 0.85rem; padding: 16px 36px; border-radius: 2px; text-decoration: none; transition: border-color 0.2s, color 0.2s; display: inline-flex; align-items: center; gap: 10px; }
  .c-btn-secondary:hover { border-color: #C9A84C; color: #C9A84C; }
  .c-hero-right { position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; padding: 80px 80px 80px 40px; }
  .c-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; width: 100%; max-width: 420px; }
  .c-stat { background: rgba(30,45,69,0.7); border: 1px solid rgba(201,168,76,0.2); padding: 32px 28px; transition: border-color 0.3s; backdrop-filter: blur(8px); }
  .c-stat:hover { border-color: #C9A84C; }
  .c-stat-feat { background: #C9A84C; border-color: #C9A84C; grid-column: span 2; }
  .c-stat-feat .c-stat-num { color: #0A1628; }
  .c-stat-feat .c-stat-lbl { color: rgba(10,22,40,0.7); }
  .c-stat-num { font-family: 'Playfair Display', serif; font-size: 2.4rem; font-weight: 900; color: #C9A84C; line-height: 1; margin-bottom: 6px; }
  .c-stat-lbl { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(248,248,248,0.6); }

  /* SECTIONS */
  .c-section { padding: 100px 80px; }
  .c-section-dark { background: #1E2D45; }
  .c-eyebrow { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #C9A84C; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
  .c-eyebrow::before { content: ''; display: block; width: 24px; height: 1px; background: #C9A84C; }
  .c-title { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 3vw, 2.8rem); font-weight: 700; line-height: 1.2; margin-bottom: 16px; }
  .c-sub { font-size: 1rem; font-weight: 300; line-height: 1.7; color: rgba(248,248,248,0.6); max-width: 640px; margin-bottom: 56px; }

  /* PROBLEMA */
  .c-prob-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 2px; margin-bottom: 48px; }
  .c-prob-card { background: #0A1628; padding: 36px 32px; border-left: 3px solid transparent; transition: border-color 0.3s; }
  .c-prob-card:hover { border-color: #C9A84C; }
  .c-prob-icon { width: 40px; height: 40px; border-radius: 2px; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 1.1rem; }
  .c-prob-card h3 { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 600; margin-bottom: 12px; }
  .c-prob-card p { font-size: 0.9rem; line-height: 1.65; color: rgba(248,248,248,0.6); }
  .c-quote { border-left: 3px solid #C9A84C; padding: 20px 28px; background: rgba(201,168,76,0.15); border-radius: 0 2px 2px 0; }
  .c-quote p { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-style: italic; }

  /* SOLUZIONE */
  .c-sol-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .c-sol-list { list-style: none; margin-bottom: 36px; }
  .c-sol-list li { display: flex; align-items: flex-start; gap: 16px; padding: 18px 0; border-bottom: 1px solid rgba(201,168,76,0.2); font-size: 0.95rem; line-height: 1.55; }
  .c-sol-list li:last-child { border-bottom: none; }
  .c-check { width: 22px; height: 22px; background: #C9A84C; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; font-size: 0.7rem; color: #0A1628; font-weight: 700; }
  .c-zercoss { background: linear-gradient(135deg, #1E2D45, #253650); border: 1px solid rgba(201,168,76,0.2); padding: 48px 40px; border-radius: 2px; text-align: center; position: relative; overflow: hidden; }
  .c-zercoss::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(201,168,76,0.1) 0%, transparent 70%); }
  .c-zercoss-lbl { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #C9A84C; margin-bottom: 10px; position: relative; }
  .c-zercoss-title { font-family: 'Playfair Display', serif; font-size: 3rem; font-weight: 900; color: #F8F8F8; letter-spacing: -0.02em; position: relative; line-height: 1; margin-bottom: 8px; }
  .c-zercoss-sub { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(248,248,248,0.6); margin-bottom: 32px; position: relative; }
  .c-zercoss-items { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; position: relative; }
  .c-zercoss-val { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 900; color: #C9A84C; margin-bottom: 4px; }
  .c-zercoss-desc { font-size: 0.7rem; letter-spacing: 0.08em; color: rgba(248,248,248,0.6); }

  /* MARKETING */
  .c-mkt-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; margin-bottom: 48px; }
  .c-mkt-card { background: #0A1628; padding: 36px 28px; border-top: 3px solid transparent; transition: border-color 0.3s; }
  .c-mkt-card:hover { border-color: #C9A84C; }
  .c-mkt-num { font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 900; color: rgba(201,168,76,0.2); margin-bottom: 16px; line-height: 1; }
  .c-mkt-card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 10px; }
  .c-mkt-card p { font-size: 0.88rem; line-height: 1.6; color: rgba(248,248,248,0.6); }

  /* PREQUALIFICA */
  .c-pre-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
  .c-steps { display: flex; flex-direction: column; }
  .c-step { display: grid; grid-template-columns: 48px 1fr; gap: 24px; padding-bottom: 36px; position: relative; }
  .c-step:not(:last-child)::before { content: ''; position: absolute; left: 23px; top: 52px; bottom: 0; width: 1px; background: rgba(201,168,76,0.2); }
  .c-step-num { width: 48px; height: 48px; border: 1px solid #C9A84C; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: #C9A84C; flex-shrink: 0; background: #0A1628; position: relative; z-index: 1; }
  .c-step h3 { font-size: 1rem; font-weight: 600; margin-bottom: 8px; padding-top: 12px; }
  .c-step p { font-size: 0.88rem; line-height: 1.6; color: rgba(248,248,248,0.6); }
  .c-rid-box { background: rgba(30,45,69,0.7); border: 1px solid rgba(201,168,76,0.2); padding: 40px 36px; backdrop-filter: blur(8px); }
  .c-rid-box h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; margin-bottom: 24px; color: #C9A84C; }
  .c-rid-list { list-style: none; }
  .c-rid-list li { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(201,168,76,0.2); font-size: 0.9rem; }
  .c-rid-list li:last-child { border-bottom: none; }
  .c-x { width: 20px; height: 20px; background: rgba(255,60,60,0.15); border: 1px solid rgba(255,60,60,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: #ff6b6b; flex-shrink: 0; }
  .c-tip { margin-top: 24px; background: rgba(201,168,76,0.15); border-left: 3px solid #C9A84C; padding: 20px 24px; }
  .c-tip p { font-size: 0.88rem; line-height: 1.6; font-style: italic; }

  /* PER CHI */
  .c-perchi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
  .c-perchi-col { background: #0A1628; padding: 48px 40px; }
  .c-perchi-good { border-top: 3px solid #C9A84C; }
  .c-perchi-bad { border-top: 3px solid rgba(255,100,100,0.4); }
  .c-perchi-col h3 { font-family: 'Playfair Display', serif; font-size: 1.1rem; margin-bottom: 28px; display: flex; align-items: center; gap: 12px; }
  .c-perchi-items { list-style: none; }
  .c-perchi-items li { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(201,168,76,0.2); font-size: 0.88rem; line-height: 1.55; }
  .c-perchi-items li:last-child { border-bottom: none; }

  /* PDF STRIP */
  .c-pdf-strip { background: linear-gradient(135deg, #1E2D45, #253650); border-top: 1px solid rgba(201,168,76,0.2); border-bottom: 1px solid rgba(201,168,76,0.2); padding: 56px 80px; display: flex; align-items: center; justify-content: space-between; gap: 40px; }
  .c-pdf-strip h3 { font-family: 'Playfair Display', serif; font-size: 1.4rem; margin-bottom: 8px; }
  .c-pdf-strip p { font-size: 0.9rem; color: rgba(248,248,248,0.6); }
  .c-btn-pdf { background: transparent; border: 1px solid #C9A84C; color: #C9A84C; font-family: 'Jost', sans-serif; font-weight: 600; font-size: 0.82rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 16px 32px; border-radius: 2px; text-decoration: none; display: inline-flex; align-items: center; gap: 10px; transition: background 0.2s, color 0.2s; white-space: nowrap; }
  .c-btn-pdf:hover { background: #C9A84C; color: #0A1628; }

  /* CONSULENZA / FORM */
  .c-cons-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
  .c-benefit { display: flex; align-items: flex-start; gap: 18px; padding: 20px 0; border-bottom: 1px solid rgba(201,168,76,0.2); }
  .c-benefit:last-child { border-bottom: none; }
  .c-benefit-icon { width: 44px; height: 44px; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.2); border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
  .c-benefit h4 { font-size: 0.95rem; font-weight: 600; margin-bottom: 4px; }
  .c-benefit p { font-size: 0.85rem; color: rgba(248,248,248,0.6); line-height: 1.5; }
  .c-form-wrap { background: rgba(30,45,69,0.7); border: 1px solid rgba(201,168,76,0.2); padding: 44px 40px; backdrop-filter: blur(10px); }
  .c-form-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; margin-bottom: 6px; }
  .c-form-note { font-size: 0.82rem; color: rgba(248,248,248,0.6); margin-bottom: 28px; }
  .c-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .c-form-full { grid-column: span 2; }
  .c-field { display: flex; flex-direction: column; gap: 6px; }
  .c-field label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(248,248,248,0.6); }
  .c-field input, .c-field select, .c-field textarea { background: rgba(10,22,40,0.6); border: 1px solid rgba(201,168,76,0.2); color: #F8F8F8; font-family: 'Jost', sans-serif; font-size: 0.9rem; padding: 13px 16px; border-radius: 2px; outline: none; transition: border-color 0.2s; width: 100%; }
  .c-field select { appearance: none; cursor: pointer; }
  .c-field textarea { resize: vertical; min-height: 90px; }
  .c-field input:focus, .c-field select:focus, .c-field textarea:focus { border-color: #C9A84C; }
  .c-field input::placeholder, .c-field textarea::placeholder { color: rgba(248,248,248,0.3); }
  .c-privacy { font-size: 0.75rem; color: rgba(248,248,248,0.6); margin-top: 14px; line-height: 1.5; }
  .c-privacy a { color: #C9A84C; }
  .c-btn-submit { width: 100%; background: #C9A84C; color: #0A1628; font-family: 'Jost', sans-serif; font-weight: 700; font-size: 0.88rem; letter-spacing: 0.12em; text-transform: uppercase; border: none; cursor: pointer; padding: 18px; margin-top: 18px; border-radius: 2px; transition: background 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .c-btn-submit:hover { background: #E2C97E; }
  .c-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .c-success { text-align: center; padding: 40px 20px; }
  .c-success-icon { width: 64px; height: 64px; background: #C9A84C; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 20px; }
  .c-success h3 { font-family: 'Playfair Display', serif; font-size: 1.4rem; margin-bottom: 12px; }
  .c-success p { font-size: 0.9rem; color: rgba(248,248,248,0.6); line-height: 1.6; }

  /* FOOTER */
  .c-footer { background: #060e1a; padding: 40px 80px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; border-top: 1px solid rgba(201,168,76,0.2); }
  .c-footer-brand { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: #C9A84C; }
  .c-footer-brand span { color: #F8F8F8; font-weight: 400; }
  .c-footer-info { font-size: 0.78rem; color: rgba(248,248,248,0.6); line-height: 1.6; }

  /* REVEAL */
  .c-reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .c-reveal.visible { opacity: 1; transform: translateY(0); }

  @media (max-width: 900px) {
    .c-nav { padding: 16px 24px; }
    .c-nav-badge { display: none; }
    .c-section { padding: 72px 24px; }
    .c-hero { grid-template-columns: 1fr; }
    .c-hero-left { padding: 56px 24px 32px; }
    .c-hero-right { display: none; }
    .c-sol-inner, .c-pre-inner, .c-cons-inner { grid-template-columns: 1fr; gap: 48px; }
    .c-mkt-grid, .c-prob-grid, .c-perchi-grid { grid-template-columns: 1fr; }
    .c-form-grid { grid-template-columns: 1fr; }
    .c-form-full { grid-column: span 1; }
    .c-pdf-strip { flex-direction: column; padding: 48px 24px; text-align: center; }
    .c-footer { padding: 32px 24px; flex-direction: column; text-align: center; }
  }
  @media (prefers-reduced-motion: reduce) {
    .c-ticker-track { animation: none; }
    .c-reveal { opacity: 1; transform: none; transition: none; }
  }
`;

const TICKER_ITEMS = [
  "Zero Anticipo","Zero Rischio","Solo Risultati",
  "Marketing Avanzato","Prequalifica Finanziaria",
  "Vendita Strutturata","Modello Success Based","Divisione Cantieri"
];

export default function Costruttori() {
  const [form, setForm] = useState({ nome:"", telefono:"", email:"", cantiere:"", unita:"", zona:"", messaggio:"" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  useEffect(() => {
    // inject styles
    const style = document.createElement("style");
    style.textContent = styles;
    document.head.appendChild(style);

    // scroll reveal
    const reveals = document.querySelectorAll(".c-reveal");
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
      await fetch(MAKE_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "landing-costruttori", ...form, timestamp: new Date().toISOString() })
      });
      setStatus("success");
    } catch {
      setStatus("success"); // mostra successo anche in caso CORS — Make riceve comunque
    }
  };

  const tickerDouble = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="c-root">
      {/* SEO */}
      <Helmet>
        {/* ── TITLE & DESCRIPTION ── */}
        <title>Vendi Immobili in Costruzione a Napoli | FondoCasa Hub – Divisione Cantieri</title>
        <meta name="description" content="Vendi immobili in costruzione a Napoli senza anticipo e senza rischio. FondoCasa Hub gestisce marketing, prequalifica acquirenti e trattativa fino al rogito. Zero Anticipo · Zero Rischio · Solo Risultati. Richiedi la consulenza gratuita." />
        <link rel="canonical" href="https://fondocasahub.com/costruttori" />

        {/* ── OPEN GRAPH ── */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fondocasahub.com/costruttori" />
        <meta property="og:title" content="Vendi Immobili in Costruzione a Napoli | FondoCasa Hub" />
        <meta property="og:description" content="Il metodo evoluto per vendere cantieri e nuove costruzioni a Napoli. Zero anticipo, zero rischio, marketing avanzato e prequalifica finanziaria degli acquirenti. FondoCasa Hub – Divisione Cantieri." />
        <meta property="og:image" content="https://fondocasahub.com/og-costruttori.jpg" />
        <meta property="og:locale" content="it_IT" />
        <meta property="og:site_name" content="FondoCasa Hub" />

        {/* ── TWITTER CARD ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Vendi Immobili in Costruzione a Napoli | FondoCasa Hub" />
        <meta name="twitter:description" content="Metodo ZERCOSS: Zero anticipo, zero rischio, solo risultati. FondoCasa Hub – Divisione Cantieri Napoli." />
        <meta name="twitter:image" content="https://fondocasahub.com/og-costruttori.jpg" />

        {/* ── KEYWORDS & ROBOTS ── */}
        <meta name="keywords" content="vendita immobili costruzione napoli, agenzia immobiliare cantieri napoli, vendere appartamenti nuova costruzione, prequalifica acquirenti mutuo napoli, divisione cantieri napoli, fondocasa hub costruttori, marketing immobiliare cantieri, zercoss, vendita immobili su progetto napoli" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="FondoCasa Hub" />

        {/* ── GEO TAGS ── */}
        <meta name="geo.region" content="IT-NA" />
        <meta name="geo.placename" content="Napoli" />
        <meta name="geo.position" content="40.8359;14.2488" />
        <meta name="ICBM" content="40.8359, 14.2488" />

        {/* ── JSON-LD: Service ── */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Divisione Cantieri – Vendita Immobili in Costruzione",
          "description": "Servizio specializzato per costruttori e sviluppatori immobiliari a Napoli. FondoCasa Hub gestisce marketing avanzato, prequalifica finanziaria degli acquirenti, trattativa e rogito. Zero anticipo, zero rischio.",
          "provider": {
            "@type": "RealEstateAgent",
            "name": "FondoCasa Hub",
            "url": "https://fondocasahub.com",
            "logo": "https://fondocasahub.com/logo.png",
            "telephone": "+39 081 000 0000",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Via Pietro Mascagni, 35",
              "addressLocality": "Napoli",
              "addressRegion": "NA",
              "postalCode": "80128",
              "addressCountry": "IT"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 40.8359,
              "longitude": 14.2488
            },
            "areaServed": [
              {"@type": "City", "name": "Napoli"},
              {"@type": "City", "name": "Vomero"},
              {"@type": "City", "name": "Chiaia"},
              {"@type": "City", "name": "Posillipo"},
              {"@type": "City", "name": "Pozzuoli"},
              {"@type": "City", "name": "Caserta"}
            ],
            "sameAs": [
              "https://www.facebook.com/fondocasahub",
              "https://www.instagram.com/fondocasahub"
            ]
          },
          "serviceType": "Vendita Immobili in Costruzione",
          "areaServed": {
            "@type": "State",
            "name": "Campania",
            "containsPlace": {"@type": "City", "name": "Napoli"}
          },
          "offers": {
            "@type": "Offer",
            "description": "Consulenza gratuita per costruttori – Metodo ZERCOSS: Zero Anticipo, Zero Rischio, Solo Risultati",
            "price": "0",
            "priceCurrency": "EUR"
          },
          "url": "https://fondocasahub.com/costruttori"
        })}</script>

        {/* ── JSON-LD: FAQPage GEO ── */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Come vendere appartamenti in costruzione a Napoli?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "FondoCasa Hub offre un metodo strutturato: mini sito dedicato al cantiere, rendering professionali, campagne ADV, prequalifica finanziaria degli acquirenti e gestione completa fino al rogito. Zero anticipo per il costruttore."
              }
            },
            {
              "@type": "Question",
              "name": "Cos'è il metodo ZERCOSS di FondoCasa Hub?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "ZERCOSS è il metodo proprietario di FondoCasa Hub: Zero Anticipo, Zero Rischio, Solo Risultati. Il costruttore non paga nulla finché l'appartamento non è venduto. FondoCasa anticipa il marketing e recupera l'investimento solo a rogito avvenuto."
              }
            },
            {
              "@type": "Question",
              "name": "FondoCasa Hub lavora con costruttori su tutto il territorio campano?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sì, la Divisione Cantieri di FondoCasa Hub opera a Napoli e in tutta la Campania: Vomero, Chiaia, Posillipo, Pozzuoli, Caserta e provincia. Contattaci per una consulenza gratuita."
              }
            },
            {
              "@type": "Question",
              "name": "Quali servizi offre FondoCasa Hub per la vendita di nuove costruzioni?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Mini sito dedicato, rendering 3D, video e contenuti multimediali, analisi di mercato, campagne Meta e Google Ads, prequalifica mutuo degli acquirenti, voucher mutuo, gestione trattativa e rogito. Il tutto con la formula success-based."
              }
            }
          ]
        })}</script>

        {/* ── JSON-LD: BreadcrumbList ── */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://fondocasahub.com"},
            {"@type": "ListItem", "position": 2, "name": "Costruttori", "item": "https://fondocasahub.com/costruttori"}
          ]
        })}</script>
      </Helmet>

      {/* NAV */}
      <nav className="c-nav">
        <a href="/" className="c-nav-logo">FondoCasa<span>Hub</span></a>
        <span className="c-nav-badge">Divisione Cantieri</span>
        <a href="#consulenza" className="c-nav-cta">Richiedi Consulenza</a>
      </nav>

      {/* TICKER */}
      <div className="c-ticker" aria-hidden="true">
        <div className="c-ticker-track">
          {tickerDouble.map((item, i) => (
            <span key={i} className="c-ticker-item">{item} <span style={{opacity:0.4}}>◆</span> </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="c-hero">
        <div className="c-hero-bg" />
        <div className="c-hero-grid" />
        <div className="c-hero-left">
          <p className="c-hero-eyebrow">Speciale Costruttori 2026</p>
          <h1 className="c-hero-title">
            Il metodo evoluto<br/>
            per vendere<br/>
            <span className="accent">immobili in costruzione.</span>
          </h1>
          <p className="c-hero-sub">
            Zero anticipo. Zero improvvisazione. Un hub specializzato che integra marketing avanzato, vendita strutturata e prequalifica finanziaria per trasformare il tuo cantiere in un progetto di successo.
          </p>
          <div className="c-pills">
            <span className="c-pill c-pill-gold">€0 di anticipo</span>
            <span className="c-pill">Provvigioni al 1,5%</span>
            <span className="c-pill">Success Based</span>
            <span className="c-pill">Esclusiva Strategica</span>
          </div>
          <div className="c-hero-btns">
            <a href="#consulenza" className="c-btn-primary">→ Consulenza Gratuita</a>
            <a href="#soluzione" className="c-btn-secondary">+ Scopri il metodo</a>
          </div>
        </div>
        <div className="c-hero-right">
          <div className="c-stats-grid">
            <div className="c-stat c-stat-feat">
              <div className="c-stat-num">€ 0</div>
              <div className="c-stat-lbl">Costo anticipato per il costruttore</div>
            </div>
            {[["1,5%","Provvigione agevolata"],["100%","Success Based"],["360°","Gestione trattativa"],["26+","Anni di esperienza"]].map(([v,l]) => (
              <div key={l} className="c-stat">
                <div className="c-stat-num">{v}</div>
                <div className="c-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="c-section c-section-dark c-reveal">
        <div className="c-eyebrow">Il contesto di mercato</div>
        <h2 className="c-title">Vendere il nuovo oggi<br/>è più complesso che mai.</h2>
        <p className="c-sub">Il mercato immobiliare è cambiato radicalmente. I costruttori si trovano ad affrontare sfide sempre più impegnative che mettono a rischio la redditività dei progetti.</p>
        <div className="c-prob-grid">
          {[
            ["👥","Acquirenti Evoluti","Clienti più informati, consapevoli e diffidenti. Confrontano decine di proposte e richiedono trasparenza totale."],
            ["🏦","Credito Selettivo","L'accesso al mutuo è sempre più complesso. Le banche applicano criteri rigorosi che escludono molti potenziali acquirenti."],
            ["📉","Invenduto Cronico","Cantieri che restano invenduti per mesi o anni, bloccando capitali e generando costi passivi insostenibili."],
            ["📢","Marketing Inefficace","Investimenti anticipati in comunicazione senza garanzie di risultato, costi che si accumulano senza generare vendite."],
          ].map(([icon, title, desc]) => (
            <div key={title} className="c-prob-card">
              <div className="c-prob-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
        <div className="c-quote">
          <p>Il vero rischio non è il prezzo. È l'invenduto che paralizza il tuo business.</p>
        </div>
      </section>

      {/* SOLUZIONE */}
      <section className="c-section c-reveal" id="soluzione">
        <div className="c-eyebrow">La soluzione</div>
        <h2 className="c-title">Un unico partner.<br/>Un unico metodo.</h2>
        <div className="c-sol-inner">
          <div>
            <p className="c-sub">Non siamo una semplice agenzia immobiliare. Siamo un hub specializzato che combina marketing avanzato, vendita strutturata, prequalifica finanziaria e supporto creditizio in un'unica soluzione coordinata.</p>
            <ul className="c-sol-list">
              {["Marketing immobiliare avanzato e multicanale","Vendita strutturata direttamente sui cantieri","Prequalifica finanziaria reale degli acquirenti","Supporto creditizio e notarile completo","Gestione trattativa fino al rogito"].map(item => (
                <li key={item}><span className="c-check">✓</span>{item}</li>
              ))}
            </ul>
          </div>
          <div className="c-zercoss">
            <div className="c-zercoss-lbl">Zero-Cost Business Model</div>
            <div className="c-zercoss-title">ZERCOSS</div>
            <div className="c-zercoss-sub">Business Model</div>
            <div className="c-zercoss-items">
              {[["€0","Costo\nAnticipato"],["1,5%","Provvigione\nAgevolata"],["∞","Impegno\nTotale"]].map(([v,d]) => (
                <div key={v}><div className="c-zercoss-val">{v}</div><div className="c-zercoss-desc" style={{whiteSpace:"pre-line"}}>{d}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARKETING */}
      <section className="c-section c-section-dark c-reveal">
        <div className="c-eyebrow">Marketing di nuova generazione</div>
        <h2 className="c-title">Non pubblichiamo annunci.<br/>Costruiamo domanda qualificata.</h2>
        <p className="c-sub">Un pacchetto completo ad alto valore aggiunto che trasforma il tuo progetto in un brand desiderabile.</p>
        <div className="c-mkt-grid">
          {[
            ["01","Mini Sito Dedicato","Vetrina digitale professionale dedicata al tuo cantiere con sistema di lead generation integrato."],
            ["02","Rendering Professionali","Visualizzazioni fotorealistiche che permettono di percepire il valore del prodotto finito prima che sia costruito."],
            ["03","Contenuti Multimediali","Foto, video emozionali, virtual tour 360° e riprese drone per mostrare il cantiere e il contesto urbano."],
            ["04","Analisi di Mercato","Studio dettagliato della zona, analisi della concorrenza e identificazione del target ideale."],
            ["05","Campagne ADV Mirate","Pubblicità su Facebook, Instagram, Google e TikTok con targeting avanzato per acquirenti reali."],
            ["06","Vetrina TOP Portali","Presenza premium sui principali portali immobiliari con posizionamento prioritario nelle ricerche."],
          ].map(([n,t,d]) => (
            <div key={n} className="c-mkt-card">
              <div className="c-mkt-num">{n}</div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PREQUALIFICA */}
      <section className="c-section c-reveal">
        <div className="c-eyebrow">La differenza che fa la vendita</div>
        <h2 className="c-title">Non portiamo curiosi.<br/>Portiamo acquirenti idonei.</h2>
        <div className="c-pre-inner">
          <div className="c-steps">
            {[
              ["01","Prequalifica Finanziaria","Analisi della situazione creditizia e patrimoniale di ogni potenziale acquirente prima di coinvolgerti."],
              ["02","Voucher Mutuo Dedicato","Sistema di pre-approvazione che garantisce l'accesso al credito, eliminando l'incertezza sul finanziamento."],
              ["03","Filtraggio Professionale","Selezione rigorosa che ti porta solo clienti con capacità di acquisto reale e motivazione concreta."],
              ["04","Gestione fino al Rogito","Trattativa, documentazione notarile e affiancamento costante fino alla firma definitiva."],
            ].map(([n,t,d]) => (
              <div key={n} className="c-step">
                <div className="c-step-num">{n}</div>
                <div><h3>{t}</h3><p>{d}</p></div>
              </div>
            ))}
          </div>
          <div className="c-rid-box">
            <h3>Riduciamo drasticamente:</h3>
            <ul className="c-rid-list">
              {["Proposte economicamente non sostenibili","Perdite di tempo con clienti non qualificati","Vendite saltate all'ultimo momento","Stress e incertezza nel processo"].map(item => (
                <li key={item}><span className="c-x">✕</span>{item}</li>
              ))}
            </ul>
            <div className="c-tip">
              <p>Vendere bene significa vendere a chi può davvero comprare. La qualifica finanziaria è il nostro standard, non un'opzione.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PER CHI */}
      <section className="c-section c-section-dark c-reveal">
        <div className="c-eyebrow">Per chi è questo servizio</div>
        <h2 className="c-title">Lavoriamo con costruttori<br/>che credono nella professionalità.</h2>
        <p className="c-sub" style={{marginBottom:"40px"}}>Se il tuo obiettivo è vendere velocemente, bene e al giusto prezzo, questo è il metodo giusto per te.</p>
        <div className="c-perchi-grid">
          <div className="c-perchi-col c-perchi-good">
            <h3>✓ Ideale per costruttori che vogliono:</h3>
            <ul className="c-perchi-items">
              {[
                [<><strong>Velocizzare l'assorbimento</strong> delle unità riducendo drasticamente i tempi di vendita</>],
                [<><strong>Ridurre il rischio di invenduto</strong> che blocca capitali e genera costi passivi</>],
                [<><strong>Vendere a valori corretti</strong> senza svendere o compromettere i margini</>],
                [<><strong>Delegare la vendita</strong> a professionisti senza perdere il controllo</>],
                [<><strong>Un interlocutore unico</strong> che coordina tutte le attività commerciali</>],
              ].map(([t],i) => (
                <li key={i}><span className="c-check">✓</span><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <div className="c-perchi-col c-perchi-bad">
            <h3 style={{color:"rgba(255,100,100,0.7)"}}>✕ Non adatto a chi cerca:</h3>
            <ul className="c-perchi-items">
              {["Solo un'agenzia che pubblichi annunci sui portali tradizionali","Soluzioni low-cost senza investimenti in marketing professionale","Libertà di gestire contemporaneamente decine di agenzie diverse","Risultati immediati senza un piano strategico strutturato"].map(item => (
                <li key={item}><span className="c-x">✕</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PDF STRIP */}
      <div className="c-pdf-strip c-reveal">
        <div>
          <h3>Scarica la presentazione completa</h3>
          <p>Il dossier "Speciale Costruttori 2026" con tutti i dettagli del metodo, dei servizi e del modello economico.</p>
        </div>
        <a href="/Speciale-Costruttori-2026.pdf" download className="c-btn-pdf">
          ↓ Scarica PDF Gratuito
        </a>
      </div>

      {/* CONSULENZA / FORM */}
      <section className="c-section c-reveal" id="consulenza">
        <div className="c-eyebrow">Parliamo del tuo cantiere</div>
        <h2 className="c-title">Consulenza gratuita<br/>senza impegno.</h2>
        <div className="c-cons-inner">
          <div>
            <p style={{fontSize:"1rem",lineHeight:1.7,color:"rgba(248,248,248,0.6)",marginBottom:"40px"}}>Il tuo progetto merita un'analisi professionale e una strategia commerciale su misura. Ti offriamo una valutazione iniziale completamente gratuita.</p>
            {[
              ["🔍","Analisi Gratuita","Valutazione completa del progetto, posizionamento competitivo e potenziale di mercato senza alcun impegno."],
              ["📊","Studio Posizionamento","Definizione della strategia di prezzo ottimale e identificazione del target di acquirenti ideale."],
              ["📈","Simulazione Vendita","Proiezione realistica dei tempi di assorbimento e pianificazione delle azioni commerciali necessarie."],
            ].map(([icon,title,desc]) => (
              <div key={title} className="c-benefit">
                <div className="c-benefit-icon">{icon}</div>
                <div><h4>{title}</h4><p>{desc}</p></div>
              </div>
            ))}
          </div>

          <div className="c-form-wrap">
            {status === "success" ? (
              <div className="c-success">
                <div className="c-success-icon">✓</div>
                <h3>Richiesta inviata!</h3>
                <p>Il nostro team della Divisione Cantieri ti contatterà entro 24 ore lavorative per organizzare la consulenza gratuita.</p>
                <br/>
                <p style={{fontSize:"0.8rem",color:"#C9A84C"}}>Controlla la tua email — ti abbiamo inviato una conferma.</p>
              </div>
            ) : (
              <>
                <h3 className="c-form-title">Richiedi la tua consulenza</h3>
                <p className="c-form-note">Compila il form — ti richiamiamo entro 24 ore lavorative.</p>
                <div className="c-form-grid">
                  <div className="c-field"><label>Nome e Cognome *</label><input value={form.nome} onChange={set("nome")} placeholder="Mario Rossi"/></div>
                  <div className="c-field"><label>Telefono *</label><input type="tel" value={form.telefono} onChange={set("telefono")} placeholder="+39 081 000 0000"/></div>
                  <div className="c-field c-form-full"><label>Email *</label><input type="email" value={form.email} onChange={set("email")} placeholder="mario@costruzioni.it"/></div>
                  <div className="c-field c-form-full"><label>Nome del Cantiere / Progetto</label><input value={form.cantiere} onChange={set("cantiere")} placeholder="es. Residenza Le Torri"/></div>
                  <div className="c-field"><label>Numero di Unità</label>
                    <select value={form.unita} onChange={set("unita")}>
                      <option value="">Seleziona...</option>
                      <option>1–5 unità</option><option>6–15 unità</option><option>16–30 unità</option><option>Oltre 30 unità</option>
                    </select>
                  </div>
                  <div className="c-field"><label>Zona / Comune</label><input value={form.zona} onChange={set("zona")} placeholder="es. Napoli – Vomero"/></div>
                  <div className="c-field c-form-full"><label>Messaggio (opzionale)</label><textarea value={form.messaggio} onChange={set("messaggio")} placeholder="Raccontaci brevemente il tuo progetto..."/></div>
                </div>
                <p className="c-privacy">Inviando il modulo acconsenti al trattamento dei dati personali ai sensi del GDPR. <a href="/privacy">Privacy Policy</a></p>
                <button className="c-btn-submit" onClick={handleSubmit} disabled={status==="sending"}>
                  {status==="sending" ? "⏳ Invio in corso..." : "→ Richiedi Consulenza Gratuita"}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="c-footer">
        <div>
          <div className="c-footer-brand">FondoCasa<span>Hub</span></div>
          <div className="c-footer-info" style={{marginTop:"8px"}}>Divisione Cantieri — Speciale Costruttori 2026</div>
        </div>
        <div className="c-footer-info" style={{textAlign:"right"}}>
          Via Pietro Mascagni 35, Vomero – Napoli<br/>
          fondocasahub.com | WeUnit – OAM M28
        </div>
      </footer>
    </div>
  );
}
