import { Helmet } from 'react-helmet-async';

// Layout condiviso per le landing dei servizi (Aste, Ristruttura e rivendi).
// Le FAQ visibili in pagina sono le stesse del markup FAQPage, parola per parola.
// Nessun form: le CTA portano a /comincia, al telefono e a WhatsApp, così
// endpoint e automazioni esistenti restano invariati.
export default function ServizioLanding({ navigate, colors, dati }) {
  const { NAVY, NAVY_DEEP, GOLD, CREAM } = colors;
  const url = `https://www.fondocasahub.com/${dati.slug}`;

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': dati.servizio,
      'serviceType': dati.servizio,
      'description': dati.descrizioneSchema,
      'url': url,
      'areaServed': { '@type': 'City', 'name': 'Napoli' },
      'provider': {
        '@type': 'RealEstateAgent',
        'name': 'FondoCasa Hub Napoli Vomero',
        'telephone': '+3908118653202',
        'url': 'https://www.fondocasahub.com/',
        'address': { '@type': 'PostalAddress', 'streetAddress': 'Via Pietro Mascagni 35', 'postalCode': '80128', 'addressLocality': 'Napoli', 'addressCountry': 'IT' },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': dati.faq.map((f) => ({ '@type': 'Question', 'name': f.q, 'acceptedAnswer': { '@type': 'Answer', 'text': f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.fondocasahub.com/' },
        { '@type': 'ListItem', 'position': 2, 'name': dati.servizio, 'item': url },
      ],
    },
  ];

  const h2 = { fontSize: 28, fontWeight: 700, color: NAVY, marginBottom: 20, fontFamily: 'Jost', lineHeight: 1.25 };
  const testo = { fontSize: 16, lineHeight: 1.8, color: '#333', marginBottom: 16 };
  const btn = { padding: '16px 30px', borderRadius: 4, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Jost', textDecoration: 'none', display: 'inline-block', border: 'none' };

  return (
    <>
      <Helmet>
        <title>{dati.title}</title>
        <meta name="description" content={dati.desc} />
        <meta property="og:title" content={dati.title} />
        <meta property="og:description" content={dati.desc} />
        <meta property="og:url" content={url} />
      </Helmet>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ background: CREAM }}>
        <section style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, color: CREAM, padding: '160px 20px 90px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: GOLD, fontWeight: 600, marginBottom: 16 }}>{dati.occhiello}</p>
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 700, marginBottom: 20, fontFamily: 'Jost', lineHeight: 1.15, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>{dati.h1}</h1>
          <p style={{ fontSize: 18, maxWidth: 720, margin: '0 auto', opacity: 0.9, lineHeight: 1.6 }}>{dati.sottotitolo}</p>
        </section>

        <section style={{ padding: '70px 20px 20px', maxWidth: 900, margin: '0 auto' }}>
          {dati.intro.map((p, i) => <p key={i} style={testo}>{p}</p>)}
        </section>

        <section style={{ padding: '50px 20px', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ ...h2, textAlign: 'center', marginBottom: 40 }}>{dati.titoloPassi}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20 }}>
            {dati.passi.map((s, i) => (
              <div key={i} style={{ background: 'white', padding: 28, borderRadius: 8, boxShadow: '0 4px 20px rgba(13,27,62,0.08)', borderTop: `3px solid ${GOLD}` }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: GOLD, fontFamily: 'Jost', marginBottom: 8 }}>{String(i + 1).padStart(2, '0')}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 10, fontFamily: 'Jost' }}>{s.t}</h3>
                <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: NAVY, color: CREAM, padding: '70px 20px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ ...h2, color: CREAM }}>{dati.titoloPerche}</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {dati.perche.map((p, i) => (
                <li key={i} style={{ fontSize: 16, lineHeight: 1.7, padding: '10px 0 10px 28px', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ position: 'absolute', left: 0, top: 18, width: 10, height: 10, borderRadius: '50%', background: GOLD }} />
                  <strong>{p.t}</strong> {p.d}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section style={{ padding: '70px 20px', maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ ...h2, textAlign: 'center', marginBottom: 40 }}>Domande frequenti</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {dati.faq.map((f, i) => (
              <div key={i}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, marginBottom: 8, fontFamily: 'Jost' }}>{f.q}</h3>
                <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7 }}>{f.a}</p>
              </div>
            ))}
          </div>
          {dati.nota && <p style={{ fontSize: 12, color: '#777', lineHeight: 1.6, marginTop: 40, textAlign: 'center' }}>{dati.nota}</p>}
        </section>

        <section style={{ background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 100%)`, color: CREAM, padding: '70px 20px', textAlign: 'center' }}>
          <h2 style={{ ...h2, color: CREAM, marginBottom: 14 }}>{dati.ctaTitolo}</h2>
          <p style={{ fontSize: 16, opacity: 0.85, maxWidth: 620, margin: '0 auto 30px', lineHeight: 1.6 }}>{dati.ctaTesto}</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/comincia" onClick={(e) => { e.preventDefault(); navigate('comincia'); }} style={{ ...btn, background: GOLD, color: NAVY }}>Richiedi una consulenza</a>
            <a href="tel:+3908118653202" style={{ ...btn, background: 'transparent', color: CREAM, border: `1px solid ${GOLD}` }}>Chiama 081 18653202</a>
            <a href="https://wa.me/393924579047" target="_blank" rel="noopener noreferrer" style={{ ...btn, background: 'transparent', color: CREAM, border: `1px solid ${GOLD}` }}>WhatsApp</a>
          </div>
        </section>
      </div>
    </>
  );
}
