import { HelmetProvider, Helmet } from 'react-helmet-async';

export default function VendiCasaVomeroPage({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nome: formData.get('nome'),
      telefono: formData.get('telefono'),
      indirizzo: formData.get('indirizzo'),
      messaggio: formData.get('messaggio'),
    };
    try {
      const res = await fetch('https://hook.eu1.make.com/vxi6kpwrhgfruxdf9bddsy7gjf5apxy8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        // Email di conferma
        fetch('https://hook.eu1.make.com/vxi6kpwrhgfruxdf9bddsy7gjf5apxy8', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.nome, email: data.email, categoria: 'Vendi Casa Vomero' }),
        }).catch(() => {});
        navigate('grazie');
      }
    } catch (err) {
      console.error('Errore invio form:', err);
    }
  };

  return (
    <>
      <Helmet>
        <title>Vendi Casa al Vomero Napoli | Valutazione Gratuita | FondoCasa Hub</title>
        <meta name="description" content="Vuoi vendere casa al Vomero a Napoli? FondoCasa Hub offre valutazione gratuita, piano marketing dedicato e oltre 26 anni di esperienza. Contattaci ora." />
        <meta property="og:title" content="Vendi Casa al Vomero Napoli | Valutazione Gratuita | FondoCasa Hub" />
        <meta property="og:description" content="Vuoi vendere casa al Vomero a Napoli? FondoCasa Hub offre valutazione gratuita, piano marketing dedicato e oltre 26 anni di esperienza. Contattaci ora." />
        <meta property="og:url" content="https://www.fondocasahub.com/vendi-casa-vomero" />
      </Helmet>

      <div style={{ minHeight: '100vh', background: CREAM }}>
        {/* Hero Section */}
        <section style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, color: CREAM, padding: '100px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: 20, fontFamily: 'Jost' }}>Vendi Casa al Vomero con FondoCasa Hub</h1>
          <p style={{ fontSize: '18px', maxWidth: 600, margin: '0 auto', opacity: 0.9 }}>Valutazione gratuita, piano marketing dedicato e la sicurezza di 26 anni di esperienza nel quartiere.</p>
        </section>

        {/* Perché scegliere FondoCasa Hub */}
        <section style={{ padding: '80px 20px', maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, textAlign: 'center', marginBottom: 60, color: NAVY, fontFamily: 'Jost' }}>Perché scegliere FondoCasa Hub</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
            {[
              { icon: '📅', title: '26 Anni di Esperienza', desc: 'Dal 1998 aiutiamo i venditori al Vomero. Conosciamo il mercato, i prezzi e le migliori strategie di vendita.' },
              { icon: '💳', title: 'Mutui Integrati con WeUnit', desc: 'Se l\'acquirente ha bisogno di un mutuo, WeUnit lo supporta. Tutto in un unico ecosistema integrato.' },
              { icon: '⚡', title: 'Zero Vincoli 60', desc: 'Programma speciale: se non vendiamo la tua casa in 60 giorni, siamo noi a offrirvi una soluzione.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', padding: 40, borderRadius: 8, boxShadow: '0 4px 20px rgba(13,27,62,0.08)', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>{item.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: NAVY, marginBottom: 16, fontFamily: 'Jost' }}>{item.title}</h3>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Come funziona */}
        <section style={{ background: NAVY, color: CREAM, padding: '80px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: 60, fontFamily: 'Jost' }}>Come Funziona la Vendita</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, maxWidth: 1200, margin: '0 auto' }}>
            {[
              { num: '1', title: 'Valutazione Gratuita', desc: 'Ti contatteremo entro 24h per una valutazione precisa, senza impegni.' },
              { num: '2', title: 'Piano Marketing Dedicato', desc: 'Fotografhe professionali, descrizione SEO-optimizzata, annunci multicanale.' },
              { num: '3', title: 'Vendita', desc: 'Negoziazione, documenti, visure catastali, rogito notarile — ce ne occupiamo noi.' },
            ].map((item, i) => (
              <div key={i} style={{ padding: 40 }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: GOLD, marginBottom: 16 }}>{item.num}</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, fontFamily: 'Jost' }}>{item.title}</h3>
                <p style={{ fontSize: 15, opacity: 0.95, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Form Contatto */}
        <section style={{ padding: '80px 20px', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: 40, color: NAVY, fontFamily: 'Jost' }}>Richiedi una Valutazione Gratuita</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <input type="text" name="nome" placeholder="Nome" required style={{ padding: '14px 18px', border: `1px solid ${NAVY}20`, borderRadius: 4, fontSize: 15, fontFamily: 'Jost' }} />
            <input type="tel" name="telefono" placeholder="Telefono" required style={{ padding: '14px 18px', border: `1px solid ${NAVY}20`, borderRadius: 4, fontSize: 15, fontFamily: 'Jost' }} />
            <input type="text" name="indirizzo" placeholder="Indirizzo Immobile" required style={{ padding: '14px 18px', border: `1px solid ${NAVY}20`, borderRadius: 4, fontSize: 15, fontFamily: 'Jost' }} />
            <textarea name="messaggio" placeholder="Messaggio (opzionale)" rows="4" style={{ padding: '14px 18px', border: `1px solid ${NAVY}20`, borderRadius: 4, fontSize: 15, fontFamily: 'Jost', resize: 'vertical' }} />
            <button type="submit" style={{ padding: '16px 32px', background: GOLD, color: NAVY, border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Jost' }}>Richiedi Valutazione Gratuita</button>
          </form>
        </section>
      </div>
    </>
  );
}
