import React, { useState, useEffect } from 'react';

export default function ZeroVincoli60Page({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, CREAM } = colors;

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    indirizzo: '',
    privacy: false,
  });
  const [formStatus, setFormStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Change favicon for Zero Vincoli 60 page
    const faviconLink = document.querySelector("link[rel='icon']");
    if (faviconLink) {
      faviconLink.href = "/favicon-zv60-32x32.png";
    }

    // Restore original favicon on unmount
    return () => {
      if (faviconLink) {
        faviconLink.href = "/favicon-32x32.png";
      }
    };
  }, []);

  useEffect(() => {
    // Inject Service + BreadcrumbList + FAQPage schema
    const schemas = [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Zero Vincoli 60 – Vendita Casa Napoli in 60 Giorni Garantiti",
        "description": "Servizio garantito di vendita immobiliare a Napoli entro 60 giorni senza vincoli. Se non sei soddisfatto entro 60 giorni, ti liberiamo dal mandato senza penali.",
        "url": "https://www.fondocasahub.com/zero-vincoli-60",
        "provider": {
          "@type": "RealEstateAgent",
          "name": "HUB – FC Punto Hub Srl",
          "url": "https://www.fondocasahub.com",
          "telephone": "+39-081-18653202",
          "address": { "@type": "PostalAddress", "streetAddress": "Via Pietro Mascagni, 35", "addressLocality": "Napoli", "postalCode": "80128", "addressCountry": "IT" }
        },
        "areaServed": [{ "@type": "City", "name": "Napoli" }, { "@type": "Place", "name": "Vomero" }, { "@type": "Place", "name": "Chiaia" }, { "@type": "Place", "name": "Posillipo" }]
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.fondocasahub.com/" },
          { "@type": "ListItem", "position": 2, "name": "Zero Vincoli 60", "item": "https://www.fondocasahub.com/zero-vincoli-60" }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Cos'è Zero Vincoli 60?", "acceptedAnswer": { "@type": "Answer", "text": "Zero Vincoli 60 è una promozione esclusiva di FondoCasa Hub per vendere casa a Napoli con mandato in esclusiva di 6 mesi. Se entro 60 giorni non sei soddisfatto, ti liberiamo dal contratto senza penali e senza costi." } },
          { "@type": "Question", "name": "Quanto costa il servizio Zero Vincoli 60?", "acceptedAnswer": { "@type": "Answer", "text": "Nulla fino al rogito. Non ci sono spese anticipate, costi di attivazione né penali in caso di recesso nei termini previsti. La provvigione si paga esclusivamente a vendita conclusa." } },
          { "@type": "Question", "name": "Cosa succede dopo i 60 giorni?", "acceptedAnswer": { "@type": "Answer", "text": "Se sei soddisfatto del nostro lavoro, continuiamo insieme fino alla vendita. Se non sei soddisfatto per qualsiasi motivo, ti liberiamo dal mandato senza penali, senza discussioni e senza costi." } },
          { "@type": "Question", "name": "Zero Vincoli 60 funziona anche fuori Napoli?", "acceptedAnswer": { "@type": "Answer", "text": "Gestiamo tutta la fase iniziale completamente da remoto. Il servizio è operativo nell'area di Napoli e provincia." } }
        ]
      }
    ];
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-zv60-react';
    script.textContent = JSON.stringify(schemas);
    document.head.appendChild(script);
    return () => { const el = document.getElementById('schema-zv60-react'); if (el) el.remove(); };
  }, []);

  const scrollToForm = () => {
    document.getElementById('form-zv60')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHow = () => {
    document.getElementById('come-funziona')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const isFormValid =
    formData.nome.trim() &&
    formData.cognome.trim() &&
    formData.email.trim() &&
    formData.telefono.trim() &&
    formData.privacy;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setFormStatus('loading');
    setErrorMsg('');
    try {
      const payload = {
        nome: formData.nome.trim(),
        cognome: formData.cognome.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        indirizzo: formData.indirizzo.trim(),
        categoria: 'Zero-Vincoli-60',
      };
      const res = await fetch('https://hook.eu1.make.com/b6m4govnf6kvwdigs3kqdffpjm3asoxv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Errore server (${res.status}). Riprova.`);
      setFormStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'Errore di rete. Controlla la connessione e riprova.');
      setFormStatus('error');
    }
  };

  const faqs = [
    {
      q: 'Cos\'è Zero Vincoli 60?',
      a: 'Zero Vincoli 60 è una promozione esclusiva di FondoCasa Hub disponibile solo online. Puoi affidarci la vendita della tua casa con un mandato in esclusiva di 6 mesi, ma con una garanzia concreta: se entro 60 giorni dal lancio del tuo annuncio non sei soddisfatto del nostro lavoro, ti liberiamo dal contratto senza penali e senza costi di alcun tipo.',
    },
    {
      q: 'Cosa significa mandato in esclusiva?',
      a: 'Con il mandato in esclusiva siamo noi l\'unica agenzia autorizzata a promuovere il tuo immobile. Questo ci permette di investire davvero: fotografie professionali, piano marketing dedicato, pubblicazione su tutti i principali portali immobiliari e una strategia commerciale seria. Senza esclusiva, nessuna agenzia può permettersi di investire sulla tua casa.',
    },
    {
      q: 'Cosa succede dopo i 60 giorni?',
      a: 'Se sei soddisfatto del nostro lavoro — e contiamo di esserlo — continuiamo insieme fino alla vendita. Se invece non sei soddisfatto per qualsiasi motivo, ti liberiamo dal mandato senza penali, senza discussioni e senza costi. La scelta è totalmente tua.',
    },
    {
      q: 'Quanto costa?',
      a: 'Nulla fino al rogito. Non ci sono spese anticipate, costi di attivazione, né penali in caso di recesso nei termini previsti. La nostra provvigione si paga esclusivamente a vendita conclusa e rogito avvenuto.',
    },
    {
      q: 'Posso farlo se abito fuori Napoli?',
      a: 'Sì. Gestiamo tutta la fase iniziale — dalla compilazione del form alla valutazione, fino alla firma del mandato — completamente da remoto. Vieni in agenzia solo se e quando vuoi. Siamo operativi nell\'area di Napoli e provincia.',
    },
  ];

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '1.5px solid #d0c8bb',
    borderRadius: 6,
    fontFamily: "'Jost', sans-serif",
    fontSize: 15,
    color: NAVY_DEEP,
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontFamily: "'Jost', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: NAVY,
    marginBottom: 6,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ fontFamily: "'Jost', sans-serif", color: NAVY, overflowX: 'hidden' }}>

      {/* ── MINI NAV ── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: NAVY_DEEP,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
      }}>
        <button
          onClick={() => navigate('home')}
          style={{
            background: 'none',
            border: 'none',
            color: '#aab4c4',
            fontFamily: "'Jost', sans-serif",
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: 0,
            letterSpacing: '0.02em',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#aab4c4'}
        >
          ← Torna al sito
        </button>

        <div style={{ textAlign: 'center', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <img src="/logo-zv60.png" alt="ZV60" style={{ width: 32, height: 32 }} />
          <div>
            <div style={{ color: GOLD, fontWeight: 700, fontSize: 13, letterSpacing: '0.12em' }}>HUB</div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 12, letterSpacing: '0.06em' }}>FondoCasa Hub</div>
            <div style={{ color: '#aab4c4', fontSize: 11, letterSpacing: '0.04em' }}>Napoli</div>
          </div>
        </div>

        <button
          onClick={scrollToForm}
          style={{
            background: GOLD,
            color: NAVY_DEEP,
            border: 'none',
            borderRadius: 3,
            padding: '10px 20px',
            fontFamily: "'Jost', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.06em',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Aderisco ora
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #06152A, #0A1F3D)',
        position: 'relative',
        paddingTop: 160,
        paddingBottom: 100,
        paddingLeft: 24,
        paddingRight: 24,
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Gold pattern overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(45deg, rgba(193,154,91,0.03) 0px, rgba(193,154,91,0.03) 1px, transparent 1px, transparent 60px)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 780, margin: '0 auto' }}>
          {/* Logo Zero Vincoli 60 */}
          <div style={{
            marginBottom: 40,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <img
              src="/logo-zv60.png"
              alt="Zero Vincoli 60 - Vendi casa in 60 giorni"
              style={{
                width: '180px',
                height: '180px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 8px 24px rgba(212, 175, 55, 0.25))',
              }}
            />
          </div>

          {/* Badge */}
          <div style={{
            display: 'inline-block',
            border: `1px solid ${GOLD}`,
            color: GOLD,
            background: 'rgba(193,154,91,0.12)',
            borderRadius: 3,
            padding: '8px 20px',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.1em',
            marginBottom: 40,
          }}>
            ◆ Promo esclusiva · Online only · Valida fino al 30 settembre 2026 ◆
          </div>

          {/* H1 */}
          <h1 className="serif" style={{
            fontSize: 'clamp(52px, 8vw, 96px)',
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 28px 0',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}>
            Zero{' '}
            <em style={{ color: GOLD, fontStyle: 'italic' }}>Vincoli</em>
            {' '}60
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 'clamp(17px, 2.2vw, 21px)',
            color: '#c5d0de',
            lineHeight: 1.65,
            margin: '0 0 48px 0',
            maxWidth: 620,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Affidaci la vendita della tua casa in <strong style={{ color: '#fff' }}>esclusiva</strong>.
            Dopo 60 giorni dal lancio annuncio decidi tu — senza penali, senza costi nascosti.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            <button
              onClick={scrollToForm}
              style={{
                background: GOLD,
                color: NAVY_DEEP,
                border: 'none',
                borderRadius: 3,
                padding: '18px 40px',
                fontFamily: "'Jost', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'opacity 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Aderisco ora →
            </button>
            <button
              onClick={scrollToHow}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.45)',
                borderRadius: 3,
                padding: '18px 40px',
                fontFamily: "'Jost', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'; }}
            >
              Come funziona ↓
            </button>
          </div>

          {/* Trust pills */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['✓ Nessuna penale', '✓ Solo online', '✓ Risultati garantiti'].map((pill) => (
              <span key={pill} style={{
                color: '#a8b8c8',
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.04em',
              }}>
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{
        background: GOLD,
        padding: '32px 24px',
      }}>
        <div style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 24,
        }}>
          {[
            { value: '26 anni', label: 'di esperienza' },
            { value: '3.898', label: 'famiglie servite' },
            { value: '60 giorni', label: 'per decidere' },
            { value: '0 €', label: 'di penale' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 800,
                color: NAVY_DEEP,
                lineHeight: 1,
                fontFamily: "'Jost', sans-serif",
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 13,
                color: NAVY,
                fontWeight: 500,
                marginTop: 6,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COME FUNZIONA ── */}
      <section id="come-funziona" style={{ background: CREAM, padding: '100px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{
              display: 'inline-block',
              border: `1px solid ${GOLD}`,
              color: GOLD,
              background: 'rgba(193,154,91,0.10)',
              borderRadius: 3,
              padding: '6px 18px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              marginBottom: 20,
            }}>
              IL PROCESSO
            </div>
            <h2 className="serif" style={{
              fontSize: 'clamp(34px, 5vw, 52px)',
              color: NAVY,
              margin: 0,
              fontWeight: 700,
            }}>
              Come funziona
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              {
                n: '01',
                title: 'Aderisci online',
                text: 'Compili questo form in 2 minuti. Solo online, nessuna visita necessaria per iniziare.',
              },
              {
                n: '02',
                title: 'Lanciamo la tua casa',
                text: 'Valutiamo, fotografiamo, pubblichiamo su tutti i portali con un piano marketing dedicato.',
              },
              {
                n: '03',
                title: 'Decidi tu a 60 giorni',
                text: 'Se entro 60 giorni dal lancio non sei soddisfatto del percorso, ti liberiamo dal mandato senza costi.',
              },
            ].map((step) => (
              <div key={step.n} style={{
                flex: '1 1 240px',
                maxWidth: 280,
                textAlign: 'center',
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: GOLD,
                  color: NAVY_DEEP,
                  fontWeight: 800,
                  fontSize: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px auto',
                  fontFamily: "'Jost', sans-serif",
                }}>
                  {step.n}
                </div>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: NAVY,
                  margin: '0 0 12px 0',
                  fontFamily: "'Jost', sans-serif",
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 15,
                  color: '#5a6a7a',
                  lineHeight: 1.65,
                  margin: 0,
                }}>
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERCHÉ ZERO VINCOLI 60 ── */}
      <section style={{ background: NAVY, padding: '100px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{
              display: 'inline-block',
              border: `1px solid ${GOLD}`,
              color: GOLD,
              background: 'rgba(193,154,91,0.10)',
              borderRadius: 3,
              padding: '6px 18px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              marginBottom: 20,
            }}>
              I VANTAGGI
            </div>
            <h2 className="serif" style={{
              fontSize: 'clamp(34px, 5vw, 52px)',
              color: '#fff',
              margin: 0,
              fontWeight: 700,
            }}>
              Perché Zero Vincoli 60
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              {
                icon: '🎯',
                title: 'Mandato esclusivo 6 mesi',
                text: 'Investiamo davvero sulla tua casa con marketing professionale completo.',
              },
              {
                icon: '⏱',
                title: '60 giorni per decidere',
                text: 'Se dopo 60 giorni dal lancio dell\'annuncio non sei soddisfatto, esci senza penali.',
              },
              {
                icon: '💰',
                title: 'Zero costi nascosti',
                text: 'Paghi solo a rogito avvenuto. Nessuna spesa anticipata, mai.',
              },
              {
                icon: '📱',
                title: 'Tutto online',
                text: 'Prenota, firma, segui l\'avanzamento dal tuo telefono. Vieni in agenzia solo se vuoi.',
              },
            ].map((item) => (
              <div key={item.title} style={{
                flex: '1 1 200px',
                maxWidth: 220,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(193,154,91,0.18)',
                borderRadius: 8,
                padding: '32px 24px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: GOLD,
                  margin: '0 0 12px 0',
                  fontFamily: "'Jost', sans-serif",
                  lineHeight: 1.3,
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: 14,
                  color: '#a8b8c8',
                  lineHeight: 1.65,
                  margin: 0,
                }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM ── */}
      <section id="form-zv60" style={{ background: CREAM, padding: '100px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-block',
              border: `1px solid ${GOLD}`,
              color: GOLD,
              background: 'rgba(193,154,91,0.10)',
              borderRadius: 3,
              padding: '6px 18px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              marginBottom: 20,
            }}>
              ADERISCI ORA · SOLO ONLINE
            </div>
            <h2 className="serif" style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              color: NAVY,
              margin: '0 0 16px 0',
              fontWeight: 700,
            }}>
              Inizia subito. È gratuito.
            </h2>
            <p style={{
              fontSize: 16,
              color: '#5a6a7a',
              lineHeight: 1.65,
              margin: 0,
            }}>
              Compila il form. Ti richiamiamo entro 24 ore per fissare la valutazione gratuita del tuo immobile.
            </p>
          </div>

          {formStatus === 'success' ? (
            <div style={{
              background: '#e8f5e9',
              border: '1.5px solid #66bb6a',
              borderRadius: 8,
              padding: '32px 28px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#2e7d32', marginBottom: 8 }}>
                Ottimo!
              </div>
              <div style={{ fontSize: 15, color: '#388e3c', lineHeight: 1.6 }}>
                Ti ricontatteremo entro 24 ore. Controlla anche la tua email.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>Nome *</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Mario"
                    required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = GOLD}
                    onBlur={e => e.target.style.borderColor = '#d0c8bb'}
                  />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={labelStyle}>Cognome *</label>
                  <input
                    type="text"
                    name="cognome"
                    value={formData.cognome}
                    onChange={handleChange}
                    placeholder="Rossi"
                    required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = GOLD}
                    onBlur={e => e.target.style.borderColor = '#d0c8bb'}
                  />
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="mario.rossi@email.com"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = '#d0c8bb'}
                />
              </div>

              <div style={{ marginTop: 20 }}>
                <label style={labelStyle}>Telefono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+39 333 000 0000"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = '#d0c8bb'}
                />
              </div>

              <div style={{ marginTop: 20 }}>
                <label style={labelStyle}>Indirizzo immobile <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(facoltativo)</span></label>
                <input
                  type="text"
                  name="indirizzo"
                  value={formData.indirizzo}
                  onChange={handleChange}
                  placeholder="Es: Via Roma 10, Napoli"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = '#d0c8bb'}
                />
              </div>

              <div style={{ marginTop: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <input
                  type="checkbox"
                  name="privacy"
                  id="privacy"
                  checked={formData.privacy}
                  onChange={handleChange}
                  style={{ marginTop: 2, accentColor: GOLD, width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }}
                />
                <label htmlFor="privacy" style={{
                  fontSize: 13,
                  color: '#5a6a7a',
                  lineHeight: 1.55,
                  cursor: 'pointer',
                }}>
                  Acconsento al trattamento dei miei dati personali ai sensi del GDPR.{' '}
                  <span onClick={() => navigate("privacy")} style={{ color: GOLD, textDecoration: 'underline', cursor: 'pointer' }}>
                    Leggi la privacy policy.
                  </span>
                </label>
              </div>

              {formStatus === 'error' && (
                <div style={{
                  marginTop: 20,
                  background: '#ffebee',
                  border: '1.5px solid #ef9a9a',
                  borderRadius: 6,
                  padding: '14px 18px',
                  fontSize: 14,
                  color: '#c62828',
                  lineHeight: 1.5,
                }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={!isFormValid || formStatus === 'loading'}
                style={{
                  marginTop: 28,
                  width: '100%',
                  background: isFormValid && formStatus !== 'loading' ? GOLD : '#c8b990',
                  color: NAVY_DEEP,
                  border: 'none',
                  borderRadius: 3,
                  padding: '18px 24px',
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  cursor: isFormValid && formStatus !== 'loading' ? 'pointer' : 'not-allowed',
                  transition: 'opacity 0.2s, transform 0.2s',
                  opacity: isFormValid && formStatus !== 'loading' ? 1 : 0.6,
                }}
                onMouseEnter={e => {
                  if (isFormValid && formStatus !== 'loading') {
                    e.currentTarget.style.opacity = '0.88';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = isFormValid && formStatus !== 'loading' ? '1' : '0.6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {formStatus === 'loading' ? 'Invio in corso...' : 'ADERISCO A ZERO VINCOLI 60 →'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── GARANZIA ── */}
      <section style={{ background: NAVY_DEEP, padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            fontSize: 56,
            marginBottom: 24,
            filter: 'drop-shadow(0 0 12px rgba(193,154,91,0.4))',
          }}>
            ⚑
          </div>
          <h2 className="serif" style={{
            fontSize: 'clamp(30px, 4.5vw, 46px)',
            color: '#fff',
            margin: '0 0 24px 0',
            fontWeight: 700,
          }}>
            La nostra garanzia scritta
          </h2>
          <p style={{
            fontSize: 18,
            color: '#a8b8c8',
            lineHeight: 1.75,
            margin: 0,
          }}>
            Se entro 60 giorni dal lancio dell'annuncio non sei soddisfatto del nostro lavoro —
            per qualsiasi motivo — ti liberiamo dal mandato.{' '}
            <strong style={{ color: '#fff' }}>Nessuna penale, nessuna discussione. Solo risultati.</strong>
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: CREAM, padding: '100px 24px' }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              display: 'inline-block',
              border: `1px solid ${GOLD}`,
              color: GOLD,
              background: 'rgba(193,154,91,0.10)',
              borderRadius: 3,
              padding: '6px 18px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              marginBottom: 20,
            }}>
              DOMANDE FREQUENTI
            </div>
            <h2 className="serif" style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              color: NAVY,
              margin: 0,
              fontWeight: 700,
            }}>
              Hai dubbi? Le risposte.
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    borderTop: idx === 0 ? `1px solid #d8cebc` : 'none',
                    borderBottom: `1px solid #d8cebc`,
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '24px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      textAlign: 'left',
                      gap: 16,
                    }}
                  >
                    <span style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 17,
                      fontWeight: 700,
                      color: isOpen ? GOLD : NAVY,
                      lineHeight: 1.4,
                      transition: 'color 0.2s',
                    }}>
                      {faq.q}
                    </span>
                    <span style={{
                      color: GOLD,
                      fontSize: 22,
                      fontWeight: 300,
                      flexShrink: 0,
                      transition: 'transform 0.25s',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                      display: 'inline-block',
                    }}>
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{
                      paddingBottom: 24,
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: 15,
                        color: '#5a6a7a',
                        lineHeight: 1.75,
                      }}>
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINALE ── */}
      <section style={{
        background: 'linear-gradient(135deg, #06152A, #0A1F3D)',
        padding: '100px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(45deg, rgba(193,154,91,0.03) 0px, rgba(193,154,91,0.03) 1px, transparent 1px, transparent 60px)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            border: `1px solid ${GOLD}`,
            color: GOLD,
            background: 'rgba(193,154,91,0.10)',
            borderRadius: 3,
            padding: '6px 18px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            marginBottom: 24,
          }}>
            ZERO VINCOLI 60 · VALIDA FINO AL 30 SETTEMBRE 2026
          </div>
          <h2 className="serif" style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            color: '#fff',
            margin: '0 0 20px 0',
            fontWeight: 700,
            lineHeight: 1.15,
          }}>
            Inizia oggi. Decidi tra 60 giorni.
          </h2>
          <p style={{
            fontSize: 17,
            color: '#a8b8c8',
            lineHeight: 1.65,
            margin: '0 0 48px 0',
          }}>
            Nessun impegno immediato. Solo la possibilità di vendere la tua casa con i migliori professionisti di Napoli.
          </p>
          <button
            onClick={scrollToForm}
            style={{
              background: GOLD,
              color: NAVY_DEEP,
              border: 'none',
              borderRadius: 3,
              padding: '20px 52px',
              fontFamily: "'Jost', sans-serif",
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            ADERISCO ORA →
          </button>
          <div style={{ marginTop: 24, fontSize: 13, color: '#5a7090' }}>
            Gratuito · Online · Senza impegno immediato
          </div>
        </div>
      </section>

      {/* ── FOOTER MINI ── */}
      <footer style={{
        background: NAVY_DEEP,
        padding: '32px 24px',
        textAlign: 'center',
        borderTop: '1px solid rgba(193,154,91,0.15)',
      }}>
        <div style={{ fontSize: 13, color: GOLD, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>
          FondoCasa Hub
        </div>
        <div style={{ fontSize: 12, color: '#4a5a6a', lineHeight: 1.6 }}>
          © {new Date().getFullYear()} FondoCasa Hub · Napoli · P.IVA e dati legali sull'agenzia principale
        </div>
        <button
          onClick={() => navigate('home')}
          style={{
            marginTop: 16,
            background: 'none',
            border: 'none',
            color: '#4a5a6a',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: "'Jost', sans-serif",
            textDecoration: 'underline',
          }}
        >
          ← Torna al sito principale
        </button>
      </footer>

    </div>
  );
}
