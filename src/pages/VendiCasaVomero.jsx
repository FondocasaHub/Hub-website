import { HelmetProvider, Helmet } from 'react-helmet-async';

const FAQ_VENDI = [
  { q: "Quanto vale il mio appartamento al Vomero?", a: "Dipende soprattutto dalla strada, dal piano e dallo stato dell'immobile. Sul venduto che seguiamo, in via Luca Giordano circa il 70% delle compravendite si chiude intorno a 4.724 €/mq, in piazza Vanvitelli intorno a 4.450, in via Cilea intorno a 3.800. Per una stima riferita al tuo immobile serve un sopralluogo: la valutazione è gratuita." },
  { q: "Quanto costa la valutazione?", a: "Niente. La valutazione è gratuita e non ti vincola a darci l'incarico. Facciamo un sopralluogo, confrontiamo il tuo immobile con le vendite reali della tua zona e ti consegniamo un prezzo motivato, con i dati su cui è costruito. Poi decidi tu se procedere." },
  { q: "Quali documenti servono per vendere casa al Vomero?", a: "Servono l'atto di provenienza, la visura e la planimetria catastale, l'attestato di prestazione energetica e la verifica di conformità urbanistica e catastale. Se l'immobile arriva da una successione o da una donazione, va sistemata anche quella parte. Ce ne occupiamo noi all'inizio dell'incarico, prima di mettere l'immobile sul mercato." },
  { q: "Posso cambiare idea se non sono soddisfatto?", a: "Sì. Con il programma Zero Vincoli 60 i primi 60 giorni seguono un piano di attività definito da contratto: se al termine non sei soddisfatto del servizio, o se non abbiamo svolto tutte le attività previste, puoi recedere dall'incarico senza penali e senza costi." },
  { q: "In quanto tempo si vende un appartamento al Vomero?", a: "I tempi dipendono dal prezzo di partenza, dallo stato dell'immobile e dalla documentazione. Un immobile con le carte in regola e un prezzo in linea con le vendite reali della zona si colloca generalmente più in fretta. Non promettiamo una data: lavoriamo su un piano di attività verificabile." },
  { q: "Chi segue il mutuo di chi compra?", a: "Lo seguiamo noi. WeUnit è il ramo creditizio di HUB: confronta le offerte di oltre 20 banche e accompagna l'acquirente fino all'erogazione. Avere il mutuo gestito internamente riduce i tempi morti tra proposta e rogito e il rischio che la trattativa si blocchi per un finanziamento non concesso." },
];

export default function VendiCasaVomeroPage({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      phone: formData.get('telefono'),
      zona: formData.get('indirizzo'),
      note: formData.get('messaggio') || '—',
      categoria: 'Vendi Casa Vomero',
    };
    try {
      const res = await fetch('https://hook.eu1.make.com/7fqc30vc6gfaqi4vgsi9neyrwijpxg1d', {
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

  return (
    <>
      <Helmet>
        <title>Vendi Casa al Vomero Napoli | FondoCasa Hub</title>
        <meta name="description" content="Vuoi vendere casa al Vomero? FondoCasa Hub offre valutazione gratuita e un piano di marketing dedicato, con 26 anni di esperienza nel quartiere. Contattaci." />
        <meta property="og:title" content="Vendi Casa al Vomero Napoli | FondoCasa Hub" />
        <meta property="og:description" content="Vuoi vendere casa al Vomero? FondoCasa Hub offre valutazione gratuita e un piano di marketing dedicato, con 26 anni di esperienza nel quartiere. Contattaci." />
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
              { num: '2', title: 'Piano Marketing Dedicato', desc: 'Fotografie professionali, annuncio scritto per farsi trovare sui motori, pubblicazione multicanale.' },
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


        {/* Valori di mercato e documenti — contenuto utile a chi valuta se vendere */}
        <section style={{ padding: '80px 20px', maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: 24, color: NAVY, fontFamily: 'Jost' }}>Quanto vale casa tua al Vomero</h2>
          <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
            Al Vomero il prezzo al metro quadro cambia sensibilmente da una strada all'altra, e all'interno della stessa
            strada pesano il piano, la presenza di ascensore, l'esposizione e lo stato di conservazione. Per questo una
            stima costruita su una media di quartiere serve a poco: quello che conta è il confronto con le vendite
            realmente concluse nella tua via.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 24 }}>
            Questi sono i valori che rileviamo sul venduto che seguiamo direttamente, non stime da portale. Il valore
            ricorrente è quello a cui si chiude circa il 70% delle compravendite della strada.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ textAlign: 'left', padding: '12px 14px', borderBottom: `2px solid ${GOLD}`, color: NAVY, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Strada</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '12px 14px', borderBottom: `2px solid ${GOLD}`, color: NAVY, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Valore ricorrente</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '12px 14px', borderBottom: `2px solid ${GOLD}`, color: NAVY, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Punta massima</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Piazza Vanvitelli', '4.450 €/mq', '5.400 €/mq'],
                  ['Via Luca Giordano', '4.724 €/mq', '5.384 €/mq'],
                  ['Via Cilea', '3.800 €/mq', '4.300 €/mq'],
                ].map((r) => (
                  <tr key={r[0]}>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #e2e2e2', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #e2e2e2' }}>{r[1]}</td>
                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #e2e2e2' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: '#6b6b6b', marginBottom: 48 }}>
            Valori rilevati sul venduto reale seguito e monitorato dalla nostra agenzia. Per una stima riferita al tuo
            immobile serve un sopralluogo.
          </p>

          <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: 24, color: NAVY, fontFamily: 'Jost' }}>I documenti da sistemare prima di vendere</h2>
          <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
            La parte che fa saltare più compravendite non è il prezzo: è la documentazione. Difformità catastali,
            provenienze successorie non aggiornate, sanatorie mai chiuse vengono quasi sempre a galla quando la
            trattativa è già avviata, e a quel punto o si rinegozia o si perde l'acquirente.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
            Per questo la verifica la facciamo all'inizio dell'incarico, non al rogito: atto di provenienza, visura e
            planimetria catastale, attestato di prestazione energetica, conformità urbanistica e catastale, e — se
            l'immobile arriva da una successione o da una donazione — la regolarità di quel passaggio. Se emerge
            qualcosa da sistemare, lo sai prima di pubblicare l'annuncio e hai il tempo di intervenire con calma.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.9 }}>
            La sede è in Via Pietro Mascagni 35, al Vomero: se preferisci parlarne di persona prima di affidare
            l'incarico, puoi passare in agenzia o chiamarci al 081 18653202.
          </p>
        </section>

        {/* FAQ visibili — le stesse marcate in FAQPage */}
        <section style={{ background: '#f7f4ee', padding: '80px 20px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: 40, color: NAVY, fontFamily: 'Jost' }}>Domande frequenti su come vendere casa al Vomero</h2>
            {FAQ_VENDI.map((f) => (
              <div key={f.q} style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: NAVY, marginBottom: 10, fontFamily: 'Jost' }}>{f.q}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.9 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": FAQ_VENDI.map((f) => ({
              "@type": "Question",
              "name": f.q,
              "acceptedAnswer": { "@type": "Answer", "text": f.a },
            })),
          }) }}
        />

        {/* Form Contatto */}
        <section style={{ padding: '80px 20px', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center', marginBottom: 40, color: NAVY, fontFamily: 'Jost' }}>Richiedi una Valutazione Gratuita</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <input type="text" name="nome" placeholder="Nome" required style={{ padding: '14px 18px', border: `1px solid ${NAVY}20`, borderRadius: 4, fontSize: 15, fontFamily: 'Jost' }} />
            <input type="email" name="email" placeholder="Email" required style={{ padding: '14px 18px', border: `1px solid ${NAVY}20`, borderRadius: 4, fontSize: 15, fontFamily: 'Jost' }} />
            <input type="tel" name="telefono" placeholder="Telefono (es. 333 1234567)" inputMode="tel" pattern="^\+?3?9?[ ]?3\d{2}[ ]?\d{6,7}$" title="Inserisci un numero di cellulare italiano, es. 333 1234567 oppure +39 333 1234567" required style={{ padding: '14px 18px', border: `1px solid ${NAVY}20`, borderRadius: 4, fontSize: 15, fontFamily: 'Jost' }} />
            <input type="text" name="indirizzo" placeholder="Indirizzo Immobile" required style={{ padding: '14px 18px', border: `1px solid ${NAVY}20`, borderRadius: 4, fontSize: 15, fontFamily: 'Jost' }} />
            <textarea name="messaggio" placeholder="Messaggio (opzionale)" rows="4" style={{ padding: '14px 18px', border: `1px solid ${NAVY}20`, borderRadius: 4, fontSize: 15, fontFamily: 'Jost', resize: 'vertical' }} />
            <button type="submit" style={{ padding: '16px 32px', background: GOLD, color: NAVY, border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'Jost' }}>Richiedi Valutazione Gratuita</button>
          </form>
        </section>
      </div>
    </>
  );
}
