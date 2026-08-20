import React, { useEffect } from "react";

export default function PosillpoPage({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": ["RealEstateAgent", "LocalBusiness"],
      "name": "HUB – Agenzia Immobiliare Posillipo Napoli",
      "description": "Agenzia immobiliare per il quartiere Posillipo di Napoli. HUB offre compravendita ville e appartamenti con vista mare, mutui e assicurazioni.",
      "url": "https://www.fondocasahub.com/posillipo",
      "telephone": "+3908118653202",
      "address": { "@type": "PostalAddress", "streetAddress": "Via Pietro Mascagni, 35", "addressLocality": "Napoli", "postalCode": "80128", "addressCountry": "IT" },
      "areaServed": [{ "@type": "Place", "name": "Posillipo" }, { "@type": "Place", "name": "Mergellina" }, { "@type": "Place", "name": "Capo Posillipo" }],
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "5" }
    };
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.fondocasahub.com/" },
        { "@type": "ListItem", "position": 2, "name": "Agenzia Immobiliare Posillipo Napoli", "item": "https://www.fondocasahub.com/posillipo" }
      ]
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-neighborhood';
    script.textContent = JSON.stringify([schema, breadcrumb]);
    document.head.appendChild(script);
    return () => { const el = document.getElementById('schema-neighborhood'); if (el) el.remove(); };
  }, []);

  return (
    <div style={{ background: CREAM, color: NAVY, fontFamily: "'Jost', sans-serif", paddingTop: 80 }}>
      <section style={{ background: NAVY_DEEP, color: CREAM, padding: "80px 32px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: GOLD, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Agenzia Immobiliare Posillipo · Napoli</div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: 24 }}>
            Compra e vendi casa a Posillipo<br />
            <span style={{ color: GOLD }}>con chi conosce il mercato</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, opacity: 0.85, marginBottom: 40 }}>
            Posillipo è il quartiere più esclusivo di Napoli. HUB ti accompagna nell'acquisto o nella vendita
            di ville con vista mare, appartamenti di pregio e residenze esclusive sul mare di Napoli.
          </p>
          <button onClick={() => navigate("comincia")} style={{ background: GOLD, color: NAVY, border: "none", padding: "16px 40px", fontSize: 14, letterSpacing: 1.5, fontWeight: 700, cursor: "pointer", borderRadius: 3, textTransform: "uppercase" }}>
            Valutazione gratuita
          </button>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "64px 32px" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: NAVY, marginBottom: 24 }}>
          Il mercato immobiliare a Posillipo Napoli
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
          <strong>Posillipo</strong> rappresenta il segmento premium del mercato immobiliare napoletano.
          Le proprietà con vista sul Golfo di Napoli e sul Vesuvio raggiungono valori tra <strong>5.000 e 12.000 €/mq</strong>
          per gli immobili di pregio, con punte significative per le ville storiche e le ville al mare.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
          HUB opera in questo segmento esclusivo con discrezione, competenza e una rete di acquirenti qualificati.
          Il nostro approccio integrato include la gestione del finanziamento tramite WeUnit e la copertura assicurativa tramite Henia,
          per garantire transazioni sicure e complete.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 40 }}>
          Dalla villetta a schiera a Mergellina all'appartamento panoramico a Capo Posillipo,
          HUB gestisce ogni trattativa con riservatezza professionale e massima tutela per venditore e acquirente.
        </p>

        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: NAVY, marginBottom: 20 }}>
          Prezzi case Posillipo Napoli
        </h2>
        <ul style={{ fontSize: 16, lineHeight: 2, paddingLeft: 24, marginBottom: 40 }}>
          <li><strong>Ville panoramiche / Capo Posillipo:</strong> 7.000 – 12.000 €/mq</li>
          <li><strong>Appartamenti con vista mare:</strong> 5.000 – 8.000 €/mq</li>
          <li><strong>Mergellina / Bassa Posillipo:</strong> 3.500 – 5.500 €/mq</li>
        </ul>

        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: NAVY, marginBottom: 20 }}>
          Domande frequenti – Immobiliare Posillipo
        </h2>
        <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>È possibile comprare casa a Posillipo con mutuo?</h3>
          <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85 }}>
            Sì, anche per immobili di pregio è possibile ottenere un mutuo. WeUnit valuta le migliori soluzioni
            tra oltre 20 istituti bancari, anche per importi elevati e per seconde case.
          </p>
        </div>
        <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 24, marginBottom: 40 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>HUB gestisce anche compravendite di lusso?</h3>
          <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85 }}>
            Sì. HUB ha esperienza nella gestione di trattative immobiliari nel segmento premium con
            assoluta riservatezza e un approccio su misura per ogni cliente.
          </p>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <button onClick={() => navigate("comincia")} style={{ background: GOLD, color: NAVY, border: "none", padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>Richiedi valutazione</button>
          <button onClick={() => navigate("contatti")} style={{ background: "transparent", color: NAVY, border: `2px solid ${NAVY}`, padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>Contattaci</button>
        </div>
      </section>
    </div>
  );
}
