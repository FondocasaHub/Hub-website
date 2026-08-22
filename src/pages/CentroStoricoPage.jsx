import React from "react";

const PHONE = "+3908118653202";
const PHONE_DISPLAY = "081 18653202";

const FAQ_ITEMS = [
  { q: "Ci sono vincoli per ristrutturare nel Centro Storico?", a: "Sì. Gli immobili nel Centro Storico UNESCO possono essere soggetti a vincoli della Soprintendenza. HUB verifica la presenza di vincoli prima di qualsiasi trattativa e ti orienta sulle agevolazioni fiscali disponibili." },
  { q: "È un buon momento per investire nel Centro Storico di Napoli?", a: "Sì. Il Centro Storico napoletano ha registrato un forte interesse da parte di acquirenti nazionali e internazionali per uso residenziale, B&B e affitti brevi. I prezzi sono ancora competitivi rispetto ad altre città d'arte italiane, con prospettive di rivalutazione." },
  { q: "Come ottenere un mutuo per un immobile storico?", a: "WeUnit, il ramo creditizio di HUB, ha esperienza nel finanziamento di immobili storici. Esistono soluzioni specifiche e agevolazioni regionali che WeUnit conosce e gestisce." },
];

export default function CentroStoricoPage({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;

  const schema = {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    "name": "HUB – Agenzia Immobiliare Centro Storico Napoli",
    "description": "Agenzia immobiliare per il Centro Storico di Napoli. HUB segue compravendite di palazzi storici, appartamenti e beni culturali a Napoli antica.",
    "url": "https://www.fondocasahub.com/centro-storico",
    "telephone": PHONE,
    "address": { "@type": "PostalAddress", "streetAddress": "Via Pietro Mascagni, 35", "addressLocality": "Napoli", "postalCode": "80128", "addressCountry": "IT" },
    "areaServed": [{ "@type": "Place", "name": "Centro Storico Napoli" }, { "@type": "Place", "name": "Toledo" }, { "@type": "Place", "name": "Spaccanapoli" }, { "@type": "Place", "name": "Decumani" }]
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.fondocasahub.com/" },
      { "@type": "ListItem", "position": 2, "name": "Agenzia Immobiliare Centro Storico Napoli", "item": "https://www.fondocasahub.com/centro-storico" }
    ]
  };

  return (
    <div style={{ background: CREAM, color: NAVY, fontFamily: "'Jost', sans-serif", paddingTop: 80 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([schema, breadcrumb, { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": FAQ_ITEMS.map((f) => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })) }]) }}
      />
      <section style={{ background: NAVY_DEEP, color: CREAM, padding: "80px 32px 64px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: GOLD, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Agenzia Immobiliare Centro Storico · Napoli</div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: 24 }}>
            Immobili nel Centro Storico di Napoli:<br />
            <span style={{ color: GOLD }}>storia, valore e opportunità</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, opacity: 0.85, marginBottom: 40 }}>
            Il Centro Storico di Napoli è Patrimonio UNESCO. HUB ti guida nell'acquisto o nella vendita
            di immobili storici, dai bassi ai palazzi nobiliari, con competenza e rispetto per la storia.
          </p>
          <button onClick={() => navigate("comincia")} style={{ background: GOLD, color: NAVY, border: "none", padding: "16px 40px", fontSize: 14, letterSpacing: 1.5, fontWeight: 700, cursor: "pointer", borderRadius: 3, textTransform: "uppercase" }}>
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

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "64px 32px" }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: NAVY, marginBottom: 24 }}>
          Il mercato immobiliare nel Centro Storico di Napoli
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
          Il <strong>Centro Storico di Napoli</strong>, riconosciuto Patrimonio dell'Umanità UNESCO dal 1995,
          è uno dei contesti urbani più affascinanti e complessi d'Italia.
          Il mercato immobiliare qui offre opportunità uniche: dai palazzi nobiliari ai cortili storici,
          dagli appartamenti sui Decumani agli spazi commerciali in Via Toledo.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 20 }}>
          HUB opera nel Centro Storico con una conoscenza approfondita delle peculiarità giuridiche
          degli immobili storici: vincoli della Soprintendenza, agevolazioni fiscali per la ristrutturazione,
          gestione delle pratiche catastali in immobili storicamente complessi.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.9, marginBottom: 40 }}>
          Il mercato del Centro Storico ha registrato una forte ripresa negli ultimi anni,
          spinta da acquirenti internazionali, B&B e affitti brevi. I valori variano moltissimo
          in base allo stato dell'immobile e alla posizione specifica.
        </p>

        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: NAVY, marginBottom: 20 }}>
          Prezzi case Centro Storico Napoli
        </h2>
        <ul style={{ fontSize: 16, lineHeight: 2, paddingLeft: 24, marginBottom: 40 }}>
          <li><strong>Palazzi nobiliari ristrutturati (Decumani, San Gregorio):</strong> 3.500 – 6.000 €/mq</li>
          <li><strong>Appartamenti ristrutturati (Spaccanapoli, Toledo):</strong> 2.500 – 4.000 €/mq</li>
          <li><strong>Da ristrutturare:</strong> 1.200 – 2.500 €/mq (alta variabilità)</li>
          <li><strong>Spazi commerciali / B&B:</strong> 2.000 – 5.000 €/mq</li>
        </ul>

        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: NAVY, marginBottom: 20 }}>
          Domande frequenti – Immobiliare Centro Storico
        </h2>
        <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>Ci sono vincoli per ristrutturare nel Centro Storico?</h3>
          <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85 }}>
            Sì. Gli immobili nel Centro Storico UNESCO possono essere soggetti a vincoli della Soprintendenza.
            HUB verifica la presenza di vincoli prima di qualsiasi trattativa e ti orienta sulle agevolazioni fiscali disponibili.
          </p>
        </div>
        <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>È un buon momento per investire nel Centro Storico di Napoli?</h3>
          <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85 }}>
            Sì. Il Centro Storico napoletano ha registrato un forte interesse da parte di acquirenti
            nazionali e internazionali per uso residenziale, B&B e affitti brevi. I prezzi sono ancora
            competitivi rispetto ad altre città d'arte italiane, con prospettive di rivalutazione.
          </p>
        </div>
        <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 24, marginBottom: 40 }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>Come ottenere un mutuo per un immobile storico?</h3>
          <p style={{ fontSize: 15, lineHeight: 1.8, opacity: 0.85 }}>
            WeUnit, il ramo creditizio di HUB, ha esperienza nel finanziamento di immobili storici.
            Esistono soluzioni specifiche e agevolazioni regionali che WeUnit conosce e gestisce.
          </p>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <button onClick={() => navigate("comincia")} style={{ background: GOLD, color: NAVY, border: "none", padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>Richiedi valutazione</button>
          <button onClick={() => navigate("contatti")} style={{ background: "transparent", color: NAVY, border: `2px solid ${NAVY}`, padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>Contattaci</button>
          <a href={`tel:${PHONE}`} style={{ background: "transparent", color: NAVY, border: `2px solid ${NAVY}`, padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, lineHeight: "16px", letterSpacing: 1, textTransform: "uppercase", textDecoration: "none", display: "inline-block" }}>
            Chiama {PHONE_DISPLAY}
          </a>
          <button onClick={() => navigate("zero-vincoli-60")} style={{ background: "transparent", color: GOLD, border: `2px solid ${GOLD}`, padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>Zero Vincoli 60</button>
        </div>
      </section>
    </div>
  );
}
