import { Helmet } from 'react-helmet-async';

export default function ConsulenteMutuoNapoliPage({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nome: formData.get('nome'),
      telefono: formData.get('telefono'),
      email: formData.get('email'),
      messaggio: formData.get('messaggio'),
    };
    try {
      const res = await fetch('https://hook.eu1.make.com/h4ao1l1gmh9v3yhx8kb4mdoj3gve87t9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        // Email di conferma
        fetch('https://hook.eu1.make.com/h4ao1l1gmh9v3yhx8kb4mdoj3gve87t9', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.nome, email: data.email, categoria: 'Consulente Mutuo' }),
        }).catch(() => {});
        navigate('grazie');
      }
    } catch (err) {
      console.error('Errore invio form:', err);
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'Quanto costa la consulenza WeUnit?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'La consulenza WeUnit è completamente gratuita. Non paghi nulla per il nostro supporto.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Quante banche confrontate?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Confrontiamo 6 partner bancari tra i migliori: Agos, Conte.it, Compass, Credito Veloce, Younited, PerMicro.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Quanto tempo per ottenere un mutuo?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Mediamente 30-60 giorni dalla richiesta alla firma del contratto.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Posso richiedere anche la surroga?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Sì, WeUnit supporta anche surroghe e portabilità di mutui esistenti.'
        }
      },
      {
        '@type': 'Question',
        'name': 'WeUnit è autorizzato?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Sì, WeUnit è iscritto all\'OAM (Organismo Agenti e Mediatori) con numero M28. Completa garanzia.'
        }
      }
    ]
  };

  const financialServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    'name': 'WeUnit',
    'description': 'Mediazione creditizia per mutui, surroghe, prestiti personali',
    'url': 'https://www.fondocasahub.com/consulente-mutuo-napoli',
    'telephone': '+39-081-18653202',
    'areaServed': 'Campania',
    'serviceType': ['Mutuo', 'Surroga', 'Prestito Personale'],
    'founder': { '@type': 'Organization', 'name': 'FondoCasa Hub' }
  };

  return (
    <>
      <Helmet>
        <title>Consulente Mutuo Napoli | WeUnit - Mediazione Creditizia OAM M28</title>
        <meta name="description" content="Cerchi un consulente mutuo a Napoli? WeUnit (OAM M28) ti affianca nella scelta del mutuo migliore tra 6 banche partner. Consulenza gratuita. Contattaci." />
        <meta property="og:title" content="Consulente Mutuo Napoli | WeUnit - Mediazione Creditizia OAM M28" />
        <meta property="og:description" content="Cerchi un consulente mutuo a Napoli? WeUnit (OAM M28) ti affianca nella scelta del mutuo migliore tra 6 banche partner. Consulenza gratuita. Contattaci." />
        <meta property="og:url" content="https://www.fondocasahub.com/consulente-mutuo-napoli" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(financialServiceSchema)}</script>
      </Helmet>

      <div style={{ minHeight: '100vh', background: CREAM }}>
        {/* Hero Section */}
        <section style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, color: CREAM, padding: '100px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: 20, fontFamily: 'Jost' }}>Consulente Mutuo a Napoli — WeUnit</h1>
          <p style={{ fontSize: '18px', maxWidth: 600, margin: '0 auto', opacity: 0.9 }}>WeUnit è la mediazione creditizia di FondoCasa Hub. Iscritto OAM M28. Confronta i migliori mutui tra 6 banche partner.</p>
        </section>

        {/* Chi è WeUnit */}
        <section style={{ padding: '80px 20px', maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: 30, color: NAVY, fontFamily: 'Jost' }}>Chi è WeUnit</h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginBottom: 20 }}>WeUnit è il brand di mediazione creditizia di FondoCasa Hub. Siamo iscritti all'OAM (Organismo Agenti e Mediatori) con numero M28, il che significa che operiamo con completa trasparenza e sotto supervisione delle autorità competenti.</p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>La nostra missione è aiutarti a trovare il mutuo migliore per le tue esigenze, confrontando le offerte di 6 banche partner selezionate.</p>
        </section>

        {/* Servizi */}
        <section style={{ background: NAVY, color: CREAM, padding: '80px 20px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: 60, fontFamily: 'Jost' }}>I Nostri Servizi</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 40, maxWidth: 1200, margin: '0 auto' }}>
            {[
              { title: 'Mutuo Prima Casa', desc: 'Le migliori condizioni per l\'acquisto della tua prima abitazione.' },
              { title: 'Surroga', desc: 'Trasferisci il tuo mutuo a un\'altra banca con tassi più vantaggiosi.' },
              { title: 'Prestito Personale', desc: 'Finanziamenti per emergenze, ristrutturazioni, investimenti.' },
              { title: 'Mutuo Under 36', desc: 'Tassi agevolati per i giovani under 36 — scopri gli incentivi.' },
            ].map((item, i) => (
              <div key={i} style={{ padding: 30, background: `rgba(255,255,255,0.05)`, borderRadius: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, fontFamily: 'Jost' }}>{item.title}</h3>
                <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6 Partner Bancari */}
        <section style={{ padding: '80px 20px', maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: 60, color: NAVY, fontFamily: 'Jost' }}>6 Partner Bancari Selezionati</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
            {[
              { name: 'Agos', desc: 'Prestiti e mutui flessibili con tassi competitivi.' },
              { name: 'Conte.it', desc: 'Soluzioni digitali e veloci per mutui e prestiti.' },
              { name: 'Compass', desc: 'Finanziamenti con massima trasparenza e zero spese nascoste.' },
              { name: 'Credito Veloce', desc: 'Approvazione veloce e documentazione semplificata.' },
              { name: 'Younited', desc: 'Prestiti flessibili adatti ai giovani professionisti.' },
              { name: 'PerMicro', desc: 'Soluzioni per microimprese e professionisti.' },
            ].map((bank, i) => (
              <div key={i} style={{ background: 'white', padding: 30, borderRadius: 8, boxShadow: '0 4px 20px rgba(13,27,62,0.08)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 12, fontFamily: 'Jost' }}>{bank.name}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{bank.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Come Funziona */}
        <section style={{ background: `linear-gradient(135deg, ${GOLD}15 0%, ${GOLD}08 100%)`, padding: '80px 20px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: 60, color: NAVY, fontFamily: 'Jost' }}>Come Funziona il Processo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, maxWidth: 1200, margin: '0 auto' }}>
            {[
              { num: '1', title: 'Analisi del Tuo Profilo', desc: 'Ti raccogliamo i dati essenziali: reddito, situazione creditizia, importo richiesto.' },
              { num: '2', title: 'Confronto Offerte', desc: 'Contattiamo le 6 banche partner e riceviamo le loro migliori offerte.' },
              { num: '3', title: 'Firma', desc: 'Procediamo con la documentazione e la firma presso la banca scelta.' },
            ].map((item, i) => (
              <div key={i} style={{ padding: 40, background: 'white', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 42, fontWeight: 700, color: GOLD, marginBottom: 16 }}>{item.num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 12, fontFamily: 'Jost' }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 20px', maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: 60, color: NAVY, fontFamily: 'Jost' }}>Domande Frequenti</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            {[
              { q: 'Quanto costa la consulenza WeUnit?', a: 'Gratuita. Non paghi nulla per il nostro supporto nel confrontare le migliori offerte.' },
              { q: 'Quante banche confrontate?', a: '6 partner bancari: Agos, Conte.it, Compass, Credito Veloce, Younited, PerMicro.' },
              { q: 'Quanto tempo per ottenere un mutuo?', a: 'Mediamente 30-60 giorni dalla richiesta alla firma del contratto.' },
              { q: 'Posso richiedere anche la surroga?', a: 'Sì, supportiamo surroghe e portabilità di mutui esistenti con condizioni vantaggiose.' },
              { q: 'WeUnit è autorizzato?', a: 'Sì, iscritti all\'OAM (Organismo Agenti e Mediatori) con numero M28. Garanzia completa.' },
            ].map((item, i) => (
              <div key={i}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 10, fontFamily: 'Jost' }}>{item.q}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Form */}
        <section style={{ background: NAVY, color: CREAM, padding: '80px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: 40, fontFamily: 'Jost' }}>Richiedi una Consulenza Gratuita</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 500, margin: '0 auto' }}>
            <input type="text" name="nome" placeholder="Nome" required style={{ padding: '14px 18px', border: 'none', borderRadius: 4, fontSize: 15, fontFamily: 'Jost' }} />
            <input type="tel" name="telefono" placeholder="Telefono" required style={{ padding: '14px 18px', border: 'none', borderRadius: 4, fontSize: 15, fontFamily: 'Jost' }} />
            <input type="email" name="email" placeholder="Email" required style={{ padding: '14px 18px', border: 'none', borderRadius: 4, fontSize: 15, fontFamily: 'Jost' }} />
            <textarea name="messaggio" placeholder="Il tuo messaggio..." rows="4" style={{ padding: '14px 18px', border: 'none', borderRadius: 4, fontSize: 15, fontFamily: 'Jost', resize: 'vertical' }} />
            <button type="submit" style={{ padding: '16px 32px', background: GOLD, color: NAVY, border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Jost' }}>Richiedi Consulenza Gratuita</button>
          </form>
        </section>
      </div>
    </>
  );
}
