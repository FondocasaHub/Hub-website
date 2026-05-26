import React, { useEffect } from "react";

export default function ChiaiaPage({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": ["RealEstateAgent", "LocalBusiness"],
      "name": "HUB – Agenzia Immobiliare Chiaia Napoli",
      "description": "Agenzia immobiliare nel quartiere Chiaia di Napoli. HUB segue compravendite, mutui e assicurazioni per immobili a Chiaia e Mergellina.",
      "url": "https://www.fondocasahub.com/chiaia",
      "telephone": "+39-081-18653202",
      "address": { "@type": "PostalAddress", "streetAddress": "Via Pietro Mascagni, 35", "addressLocality": "Napoli", "postalCode": "80128", "addressCountry": "IT" },
      "areaServed": [{ "@type": "Place", "name": "Chiaia" }, { "@type": "Place", "name": "Riviera di Chiaia" }, { "@type": "Place", "name": "Via dei Mille" }],
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "5" }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-neighborhood';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { const el = document.getElementById('schema-neighborhood'); if (el) el.remove(); };
  }, []);

  return (
    <div style={{ background: CREAM, color: NAVY, fontFamily: "'Jost', sans-serif", paddingTop: 80 }}>
      <section style={{ background: NAVY_DEEP, color: CREAM, padding: "80px 32px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: GOLD, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Agenzia Immobiliare Chiaia · Napoli</div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: 24 }}>
            Casa a Chiaia Napoli:<br />
            <span style={{ color: GOLD }}>il tuo consulente di fiducia</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, opacity: 0.85, marginBottom: 40 }}>
            Chiaia è il cuore elegante di Napoli. HUB ti accompagna nella compravendita di appartamenti
            sulla Riviera di Chiaia, in Via dei Mille e nelle vie più ambite del quartiere.
          </p>
          <button onClick={() => navigate("comincia")} style={{ background: GOLD, color: NAVY, border: "none", padding: "16px 40px", fontSize: 14, letterSpacing: 1.5, fontWeight: 700, cursor: "pointer", borderRadius: 3, textTransform: "uppercase" }}>
            Valutazione gratuita
          </button>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "64px 32px" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: NAVY, marginBottom: 24 }}>
          Il mercato immobiliare a Chiaia Napoli
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
          Il quartiere <strong>Chiaia</strong> è sinonimo di eleganza e qualità della vita a Napoli.
          La Riviera di Chiaia, Via dei Mille e Piazza dei Martiri ospitano alcune delle abitazioni
          più ricercate della città, con valori tra <strong>4.000 e 7.000 €/mq</strong> per le posizioni più pregiate.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
          HUB segue compravendite a Chiaia con la stessa professionalità che porta avanti da 26 anni al Vomero.
          Il modello integrato immobiliare + mutuo + assicurazione garantisce al cliente un percorso completo
          e privo di sorprese, dalla visita al rogito.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 40 }}>
          Che tu voglia vendere il tuo appartamento a Chiaia o acquistare la casa dei tuoi sogni sulla Riviera,
          HUB è il partner giusto: competenza locale, rete di acquirenti qualificati e supporto legale e finanziario.
        </p>

        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: NAVY, marginBottom: 20 }}>
          Prezzi case Chiaia Napoli
        </h2>
        <ul style={{ fontSize: 16, lineHeight: 2, paddingLeft: 24, marginBottom: 40 }}>
          <li><strong>Riviera di Chiaia / fronte mare:</strong> 5.500 – 7.500 €/mq</li>
          <li><strong>Via dei Mille / Via Filangieri:</strong> 4.500 – 6.500 €/mq</li>
          <li><strong>Zone limitrofe Chiaia:</strong> 3.500 – 5.000 €/mq</li>
        </ul>

        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: NAVY, marginBottom: 20 }}>
          Domande frequenti – Immobiliare Chiaia
        </h2>
        <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>Come vendere casa a Chiaia rapidamente?</h3>
          <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85 }}>
            Con il programma Zero Vincoli 60 di HUB, garantiamo la vendita entro 60 giorni o acquistiamo noi.
            Il nostro marketing dedicato e la rete di acquirenti pre-qualificati accelerano ogni trattativa.
          </p>
        </div>
        <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 24, marginBottom: 40 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>Quale documentazione serve per vendere a Chiaia?</h3>
          <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85 }}>
            Servono: atto di provenienza, visura e planimetria catastale, APE, conformità urbanistica e
            documenti condominiali. HUB verifica gratuitamente tutta la documentazione prima di avviare la vendita.
          </p>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <button onClick={() => navigate("comincia")} style={{ background: GOLD, color: NAVY, border: "none", padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>Richiedi valutazione</button>
          <button onClick={() => navigate("contatti")} style={{ background: "transparent", color: NAVY, border: `2px solid ${NAVY}`, padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>Contattaci</button>
          <button onClick={() => navigate("zero-vincoli-60")} style={{ background: "transparent", color: GOLD, border: `2px solid ${GOLD}`, padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>Zero Vincoli 60</button>
        </div>
      </section>
    </div>
  );
}
