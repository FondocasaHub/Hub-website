import React from "react";

const PHONE = "+3908118653202";
const PHONE_DISPLAY = "081 18653202";

const FAQ_ITEMS = [
  { q: "Quanto vale il mio appartamento al Vomero?", a: "Il valore dipende da zona, piano, esposizione e condizioni. HUB offre valutazioni gratuite basate su dati di vendita reali nel quartiere. Contattaci per una stima precisa e senza impegno." },
  { q: "Quanto tempo ci vuole per vendere casa al Vomero?", a: "I tempi dipendono da zona, prezzo e condizioni dell'immobile. Con il programma Zero Vincoli 60  i primi 60 giorni seguono un piano di attività definito da contratto: se al termine non sei soddisfatto del servizio, o se non abbiamo svolto tutte le attività previste, puoi recedere dall'incarico senza penali." },
  { q: "Come funziona il mutuo per comprare casa al Vomero?", a: "WeUnit, il ramo creditizio di HUB, confronta le offerte di oltre 20 banche per trovare il mutuo più conveniente. La consulenza è gratuita e la pratica viene seguita fino all'erogazione." },
];

export default function VomeroPage({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;

  // Inject LocalBusiness + FAQPage schema for Vomero page
  const schema = {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    "name": "HUB – Agenzia Immobiliare Vomero Napoli",
    "description": "Agenzia immobiliare di riferimento al Vomero di Napoli. HUB offre compravendita, mutui e assicurazioni casa in Via Pietro Mascagni 35, Vomero.",
    "url": "https://www.fondocasahub.com/vomero",
    "telephone": PHONE,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Via Pietro Mascagni, 35",
      "addressLocality": "Napoli",
      "addressRegion": "NA",
      "postalCode": "80128",
      "addressCountry": "IT"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": 40.8446157, "longitude": 14.2207702 },
    "hasMap": "https://www.google.com/maps/place/?q=place_id:ChIJ9QSKiKcJOxMRO3--jorfbQw",
    "areaServed": [{ "@type": "Place", "name": "Vomero" }, { "@type": "Place", "name": "Vomero Alto" }, { "@type": "Place", "name": "Belvedere" }]
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.fondocasahub.com/" },
      { "@type": "ListItem", "position": 2, "name": "Agenzia Immobiliare Vomero Napoli", "item": "https://www.fondocasahub.com/vomero" }
    ]
  };

  return (
    <div style={{ background: CREAM, color: NAVY, fontFamily: "'Jost', sans-serif", paddingTop: 80 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([schema, breadcrumb, { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": FAQ_ITEMS.map((f) => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) }]) }}
      />
      {/* Hero */}
      <section style={{ background: NAVY_DEEP, color: CREAM, padding: "80px 32px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: GOLD, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Agenzia Immobiliare Vomero · Napoli</div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: 24 }}>
            Il tuo immobile al Vomero<br />
            <span style={{ color: GOLD }}>è in buone mani</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, opacity: 0.85, marginBottom: 40 }}>
            HUB è presente al Vomero di Napoli da oltre 26 anni in Via Pietro Mascagni 35.
            Compravendita immobiliare, mediazione creditizia e consulenza assicurativa sotto lo stesso tetto.
          </p>
          <button
            onClick={() => navigate("comincia")}
            style={{ background: GOLD, color: NAVY, border: "none", padding: "16px 40px", fontSize: 14, letterSpacing: 1.5, fontWeight: 700, cursor: "pointer", borderRadius: 3, textTransform: "uppercase" }}
          >
            Valutazione gratuita
          </button>
          <a
            href={`tel:${PHONE}`}
            style={{ display: "inline-block", marginLeft: 12, marginTop: 12, background: "transparent", color: GOLD, border: `2px solid ${GOLD}`, padding: "14px 38px", fontSize: 14, lineHeight: "16px", letterSpacing: 1.5, fontWeight: 700, cursor: "pointer", borderRadius: 3, textTransform: "uppercase", textDecoration: "none" }}
          >
            Chiama ora
          </a>
        </div>
      </section>

      {/* Contenuto SEO */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "64px 32px" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: NAVY, marginBottom: 24 }}>
          Agenzia immobiliare Vomero Napoli: perché scegliere HUB
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
          Il <strong>Vomero</strong> è uno dei quartieri residenziali più richiesti di Napoli.
          Con valori immobiliari che oscillano tra <strong>3.500 e 5.500 €/mq</strong> per gli appartamenti ristrutturati,
          vendere o comprare casa al Vomero richiede una conoscenza profonda del mercato locale e un metodo professionale.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
          HUB – FC Punto Hub Srl opera al Vomero da oltre 26 anni con sede in <strong>Via Pietro Mascagni 35</strong>.
          Il nostro team di 10 professionisti conosce ogni microzona: da Vomero Alto a Belvedere, da Antignano a Piazza degli Artisti.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 40 }}>
          Grazie al modello integrato Fondocasa (immobiliare) + WeUnit (mutui) + Henia (assicurazioni),
          i nostri clienti trovano la casa giusta <em>e</em> il finanziamento adeguato in un unico punto.
          Un vantaggio competitivo che riduce i tempi di vendita e protegge venditore e acquirente.
        </p>

        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: NAVY, marginBottom: 20 }}>
          Prezzi delle case al Vomero di Napoli
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
          I prezzi al Vomero variano in base a posizione, piano, condizioni e vicinanza ai servizi:
        </p>
        <ul style={{ fontSize: 16, lineHeight: 2, paddingLeft: 24, marginBottom: 40 }}>
          <li><strong>Vomero Alto / Belvedere:</strong> 4.500 – 5.500 €/mq (ristrutturato)</li>
          <li><strong>Piazza Vanvitelli / Via Scarlatti:</strong> 3.800 – 5.000 €/mq</li>
          <li><strong>Antignano / Maronti:</strong> 3.000 – 4.200 €/mq</li>
          <li><strong>Da ristruturare:</strong> sconto medio del 25-35% rispetto ai valori ristrutturati</li>
        </ul>

        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: NAVY, marginBottom: 20 }}>
          Domande frequenti – Immobiliare Vomero
        </h2>
        <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>Quanto vale il mio appartamento al Vomero?</h3>
          <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85 }}>
            Il valore dipende da zona, piano, esposizione e condizioni. HUB offre valutazioni gratuite basate su dati di vendita reali nel quartiere.
            Contattaci per una stima precisa e senza impegno.
          </p>
        </div>
        <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>Quanto tempo ci vuole per vendere casa al Vomero?</h3>
          <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85 }}>
            I tempi dipendono da zona, prezzo e condizioni dell'immobile. Con il programma <strong>Zero Vincoli 60</strong>{" "}
            i primi 60 giorni seguono un piano di attività definito da contratto: se al termine non sei soddisfatto del
            servizio, o se non abbiamo svolto tutte le attività previste, puoi recedere dall'incarico senza penali.
          </p>
        </div>
        <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 24, marginBottom: 40 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>Come funziona il mutuo per comprare casa al Vomero?</h3>
          <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85 }}>
            WeUnit, il ramo creditizio di HUB, confronta le offerte di oltre 20 banche per trovare il mutuo più conveniente.
            La consulenza è gratuita e la pratica viene seguita fino all'erogazione.
          </p>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <button onClick={() => navigate("comincia")} style={{ background: GOLD, color: NAVY, border: "none", padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>
            Richiedi valutazione
          </button>
          <button onClick={() => navigate("contatti")} style={{ background: "transparent", color: NAVY, border: `2px solid ${NAVY}`, padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>
            Contattaci
          </button>
          <a href={`tel:${PHONE}`} style={{ background: "transparent", color: NAVY, border: `2px solid ${NAVY}`, padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, lineHeight: "16px", letterSpacing: 1, textTransform: "uppercase", textDecoration: "none", display: "inline-block" }}>
            Chiama {PHONE_DISPLAY}
          </a>
          <button onClick={() => navigate("zero-vincoli-60")} style={{ background: "transparent", color: GOLD, border: `2px solid ${GOLD}`, padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>
            Zero Vincoli 60
          </button>
        </div>
      </section>
    </div>
  );
}
