import { Helmet } from 'react-helmet-async';

const FAQ_MUTUO = [
  { q: "Quanto costa la consulenza WeUnit?", a: "La consulenza e la prequalifica sono gratuite: analizziamo il tuo profilo e confrontiamo le offerte senza costi. Solo a mutuo erogato è previsto un compenso di mediazione dall'1% al 3% dell'importo erogato, in base all'istituto e alla tipologia di pratica, che ti comunichiamo per iscritto prima di procedere. Lavorando sul risultato, abbiamo interesse a chiudere in fretta e bene." },
  { q: "Quante banche confrontate?", a: "Oltre 20 istituti: BPER Banca, tutte le banche del gruppo ICCREA e diverse banche pi\u00f9 piccole del territorio. Queste ultime spesso sfuggono a chi cerca da solo, ma su Napoli sanno essere molto competitive su tasso e flessibilit\u00e0. Non siamo agenti di una singola banca: le mettiamo a confronto e ti spieghiamo perch\u00e9 una proposta conviene rispetto a un'altra." },
  { q: "Quanto tempo serve per la delibera?", a: "La delibera reddituale arriva mediamente in 20 giorni lavorativi. Dopo quella restano la perizia sull'immobile e la delibera finale, i cui tempi dipendono anche dal perito e dal notaio. Ti aggiorniamo a ogni passaggio, senza che debba essere tu a rincorrere la banca." },
  { q: "Che tipi di mutuo trattate?", a: "Acquisto prima casa, mutuo Consap al 100% per under 36, acquisto seconda casa, acquisto più ristrutturazione, mutuo liquidità, consolidamento debiti, sostituzione più acquisto, surroga e sostituzione più liquidità. Trattiamo anche cessione del quinto e prestiti personali. Nel primo incontro capiamo quale forma tecnica è adatta alla tua situazione." },
  { q: "Come funziona il mutuo al 100% per under 36?", a: "Si appoggia al Fondo di garanzia Consap per la prima casa, che permette a chi ha meno di 36 anni di finanziare l'intero valore dell'immobile invece del consueto 80%. Verifichiamo i requisiti prima di presentare la domanda, così non perdi tempo su una pratica che non passerebbe." },
  { q: "Posso trasferire il mutuo che ho già?", a: "Sì, con la surroga: sposti il mutuo a un altro istituto a condizioni migliori senza costi bancari di istruttoria, perizia o notaio, come previsto dalla legge. Se oltre a migliorare il tasso ti serve anche liquidità aggiuntiva, la strada è la sostituzione con liquidità." },
  { q: "Che differenza c'è tra voi e lo sportello della mia banca?", a: "Lo sportello può proporti solo i prodotti del suo istituto. Noi confrontiamo oltre 20 banche in un unico interlocutore, siamo indipendenti e lavoriamo a provvigione sul risultato: la nostra convenienza coincide con la tua, chiudere la pratica alle condizioni migliori." },
  { q: "Cos'è il Voucher Mutuo?", a: "È la pre-delibera reddituale ufficiale della banca: sai già che il mutuo è approvato e per quale importo prima ancora di aver trovato casa. Cerchi con il budget certo, tratti da acquirente pronto e vedi gli immobili in anteprima. È una promo stagionale, disponibile solo in alcuni periodi dell'anno, in genere nei due mesi che precedono Pasqua e Natale: verifica sul sito o in agenzia se è attiva. La prossima edizione parte il 1° novembre e dura fino al 31 dicembre 2026." },
  { q: "WeUnit è autorizzato?", a: "Sì. WeUnit è iscritto all'OAM, l'Organismo Agenti e Mediatori, con numero M28. La mediazione creditizia è un'attività vigilata e l'iscrizione è verificabile pubblicamente." },
];

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
      const res = await fetch('https://hook.eu1.make.com/pqbst79ud4fhpi7b64wcvmsleh1sj9hz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        navigate('grazie');
      }
    } catch (err) {
      console.error('Errore invio form:', err);
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': FAQ_MUTUO.map((f) => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': { '@type': 'Answer', 'text': f.a },
    })),
  };

  const financialServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    'name': 'WeUnit',
    'description': 'Mediazione creditizia per mutui, surroghe, prestiti personali',
    'url': 'https://www.fondocasahub.com/consulente-mutuo-napoli',
    'telephone': '+3908118653202',
    'areaServed': 'Campania',
    'serviceType': ['Mutuo', 'Surroga', 'Mutuo acquisto e ristrutturazione', 'Cessione del quinto', 'Prestito Personale'],
    'founder': { '@type': 'Organization', 'name': 'FondoCasa Hub' }
  };

  return (
    <>
      <Helmet>
        <title>Consulente Mutuo Napoli | FondoCasa Hub</title>
        <meta name="description" content="Confronta il mutuo migliore a Napoli con WeUnit (OAM M28): consulenza gratuita tra oltre 20 istituti per mutuo prima casa o surroga. Richiedi informazioni." />
        <meta property="og:title" content="Consulente Mutuo Napoli | FondoCasa Hub" />
        <meta property="og:description" content="Confronta il mutuo migliore a Napoli con WeUnit (OAM M28): consulenza gratuita tra oltre 20 istituti per mutuo prima casa o surroga. Richiedi informazioni." />
        <meta property="og:url" content="https://www.fondocasahub.com/consulente-mutuo-napoli" />
      </Helmet>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([faqSchema, financialServiceSchema]) }}
      />

      <div style={{ minHeight: '100vh', background: CREAM }}>
        {/* Hero Section */}
        <section style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, color: CREAM, padding: '100px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: 20, fontFamily: 'Jost' }}>Consulente Mutuo a Napoli — WeUnit</h1>
          <p style={{ fontSize: '18px', maxWidth: 600, margin: '0 auto', opacity: 0.9 }}>WeUnit è la mediazione creditizia di FondoCasa Hub. Iscritto OAM M28. Confronta i migliori mutui tra oltre 20 istituti.</p>
        </section>

        {/* Chi è WeUnit */}
        <section style={{ padding: '80px 20px', maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: 30, color: NAVY, fontFamily: 'Jost' }}>Chi è WeUnit</h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginBottom: 20 }}>WeUnit è il brand di mediazione creditizia di FondoCasa Hub. Siamo iscritti all'OAM (Organismo Agenti e Mediatori) con numero M28, il che significa che operiamo con completa trasparenza e sotto supervisione delle autorità competenti.</p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}>La nostra missione è aiutarti a trovare il mutuo migliore per le tue esigenze, confrontando le offerte di oltre 20 istituti selezionate.</p>
        </section>

        {/* Servizi */}
        <section style={{ background: NAVY, color: CREAM, padding: '80px 20px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: 60, fontFamily: 'Jost' }}>I Nostri Servizi</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 40, maxWidth: 1200, margin: '0 auto' }}>
            {[
              { title: 'Acquisto prima casa', desc: 'La forma più richiesta: confrontiamo tasso, spread e durata su più istituti.' },
              { title: 'Under 36 al 100%', desc: 'Con il Fondo di garanzia Consap si finanzia l\'intero valore dell\'immobile.' },
              { title: 'Acquisto seconda casa', desc: 'Condizioni e percentuali di finanziamento diverse dalla prima casa.' },
              { title: 'Acquisto + ristrutturazione', desc: 'Un solo mutuo per comprare casa e rinnovarla: acquisto e lavori in un\'unica pratica e un\'unica rata.' },
              { title: 'Mutuo liquidità', desc: 'Ottieni liquidità dando in garanzia un immobile di cui sei già proprietario.' },
              { title: 'Consolidamento debiti', desc: 'Più rate in una sola, con una rata mensile complessiva più sostenibile.' },
              { title: 'Sostituzione + acquisto', desc: 'Chiudi il mutuo esistente e ne apri uno nuovo per il prossimo immobile.' },
              { title: 'Surroga', desc: 'Sposti il mutuo a un altro istituto a condizioni migliori, senza costi bancari a tuo carico.' },
              { title: 'Sostituzione + liquidità', desc: 'Rinegozi il mutuo e ottieni allo stesso tempo liquidità aggiuntiva.' },
              { title: 'Cessione del quinto', desc: 'Per dipendenti pubblici, statali, privati e pensionati: rata trattenuta in busta paga o sulla pensione.' },
              { title: 'Prestiti personali', desc: 'Liquidità per progetti, ristrutturazioni e imprevisti, confrontando più istituti.' },
            ].map((item, i) => (
              <div key={i} style={{ padding: 30, background: `rgba(255,255,255,0.05)`, borderRadius: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, fontFamily: 'Jost' }}>{item.title}</h3>
                <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Voucher Mutuo */}
        <section style={{ padding: '80px 20px 0', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '40px 36px', boxShadow: '0 4px 20px rgba(13,27,62,0.08)', borderLeft: `4px solid ${GOLD}` }}>
            <div style={{ fontSize: 12, letterSpacing: 2.5, textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: 8 }}>Promo stagionale · Dal 1° novembre al 31 dicembre 2026</div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: NAVY, marginBottom: 16, fontFamily: 'Jost' }}>Voucher Mutuo</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333', marginBottom: 16 }}>La <strong>pre-delibera reddituale ufficiale della banca</strong>: sai già che il mutuo è approvato e per quale importo, prima ancora di aver trovato casa.</p>
            <ul style={{ fontSize: 15, lineHeight: 1.9, color: '#333', paddingLeft: 20, marginBottom: 16 }}>
              <li>Cerchi casa con il budget certo</li>
              <li>Tratti da acquirente pronto</li>
              <li>Vedi gli immobili in anteprima, prima della pubblicità</li>
            </ul>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#555' }}>Disponibile solo in alcuni periodi dell'anno, in genere nei due mesi che precedono Pasqua e Natale. Verifica sul sito o in agenzia se la promo è attiva. <strong>Prossima edizione: dal 1° novembre al 31 dicembre 2026.</strong></p>
          </div>
        </section>

        {/* Perche' un broker indipendente */}
        <section style={{ padding: '80px 20px', maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: 24, color: NAVY, fontFamily: 'Jost' }}>Perché rivolgersi a un broker invece che allo sportello</h2>
          <p style={{ fontSize: 16, lineHeight: 1.9, color: '#333', textAlign: 'center', maxWidth: 760, margin: '0 auto 56px' }}>
            La banca allo sportello può proporti soltanto i prodotti della banca stessa. Noi non siamo dipendenti né
            agenti di un istituto: siamo mediatori creditizi indipendenti, e questo cambia tre cose concrete.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
            {[
              { t: 'Oltre 20 banche, un solo interlocutore', d: 'Da BPER Banca a tutte le banche del gruppo ICCREA, fino agli istituti più piccoli del territorio. Presenti la tua situazione una volta sola: al confronto e ai solleciti pensiamo noi.' },
              { t: 'Tempi rapidi', d: 'La delibera reddituale arriva mediamente in 20 giorni lavorativi. Lavorando a provvigione sul risultato, abbiamo lo stesso interesse tuo a chiudere in fretta.' },
              { t: 'Nessun conflitto di interesse', d: 'Non abbiamo budget di prodotto da rispettare. Se la proposta migliore è quella di un altro istituto, è quella che ti presentiamo.' },
            ].map((b, i) => (
              <div key={i} style={{ background: 'white', padding: 30, borderRadius: 8, boxShadow: '0 4px 20px rgba(13,27,62,0.08)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 12, fontFamily: 'Jost' }}>{b.t}</h3>
                <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7 }}>{b.d}</p>
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
              { num: '2', title: 'Confronto Offerte', desc: 'Contattiamo gli oltre 20 istituti convenzionati e riceviamo le loro migliori offerte.' },
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
            {FAQ_MUTUO.map((item, i) => (
              <div key={i}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 10, fontFamily: 'Jost' }}>{item.q}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <p style={{ fontSize: 12, color: '#777', lineHeight: 1.6, maxWidth: 800, margin: '0 auto', padding: '0 20px 40px', textAlign: 'center' }}>Messaggio pubblicitario con finalità promozionale. Mediazione creditizia WeUnit, iscrizione OAM M28. Consulenza e prequalifica gratuite; a mutuo erogato è previsto un compenso di mediazione dall'1% al 3% dell'importo erogato, in base all'istituto e alla tipologia di pratica. La concessione del finanziamento è subordinata all'approvazione dell'istituto erogante.</p>

        {/* CTA Form */}
        <section style={{ background: NAVY, color: CREAM, padding: '80px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: 40, fontFamily: 'Jost' }}>Richiedi una Consulenza Gratuita</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 500, margin: '0 auto' }}>
            <input type="text" name="nome" placeholder="Nome" required style={{ padding: '14px 18px', border: 'none', borderRadius: 4, fontSize: 15, fontFamily: 'Jost' }} />
            <input type="tel" name="telefono" placeholder="Telefono (es. 333 1234567)" inputMode="tel" pattern="^\+?3?9?[ ]?3\d{2}[ ]?\d{6,7}$" title="Inserisci un numero di cellulare italiano, es. 333 1234567 oppure +39 333 1234567" required style={{ padding: '14px 18px', border: 'none', borderRadius: 4, fontSize: 15, fontFamily: 'Jost' }} />
            <input type="email" name="email" placeholder="Email" required style={{ padding: '14px 18px', border: 'none', borderRadius: 4, fontSize: 15, fontFamily: 'Jost' }} />
            <textarea name="messaggio" placeholder="Il tuo messaggio..." rows="4" style={{ padding: '14px 18px', border: 'none', borderRadius: 4, fontSize: 15, fontFamily: 'Jost', resize: 'vertical' }} />
            <button type="submit" style={{ padding: '16px 32px', background: GOLD, color: NAVY, border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Jost' }}>Richiedi Consulenza Gratuita</button>
          </form>
        </section>
      </div>
    </>
  );
}
