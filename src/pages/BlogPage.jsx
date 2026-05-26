import React, { useState, useEffect } from "react";

const ARTICLES = [
  {
    slug: "come-vendere-casa-napoli",
    title: "Come vendere casa a Napoli nel 2025: guida completa",
    excerpt: "Tutto quello che devi sapere per vendere casa a Napoli: documentazione, valutazione, marketing e negoziazione. La guida pratica di HUB.",
    date: "2025-05-15",
    category: "Vendere Casa",
    readTime: "8 min",
    content: `
      <h2>Vendere casa a Napoli: da dove iniziare</h2>
      <p>Vendere un immobile a Napoli nel 2025 richiede preparazione, strategia e — soprattutto — una conoscenza profonda del mercato locale. Il mercato napoletano è eterogeneo: i valori variano moltissimo da quartiere a quartiere e persino da strada a strada.</p>

      <h3>1. Valutazione corretta del prezzo</h3>
      <p>Il primo errore che i venditori commettono è sopravvalutare l'immobile. Un prezzo troppo alto blocca le trattative per mesi e alla fine porta a svendere. Una valutazione professionale basata su dati reali di vendita nella stessa zona è il primo passo obbligatorio.</p>

      <h3>2. Verifica documentale: la due diligence</h3>
      <p>Prima di mettere l'immobile sul mercato, è indispensabile verificare:</p>
      <ul>
        <li>Conformità catastale e urbanistica</li>
        <li>Assenza di ipoteche o pignoramenti</li>
        <li>APE (Attestato di Prestazione Energetica) aggiornato</li>
        <li>Planimetria catastale conforme allo stato dei luoghi</li>
        <li>Documenti condominiali in regola</li>
      </ul>

      <h3>3. Marketing professionale</h3>
      <p>Foto di qualità professionale, virtual tour 3D, pubblicazione sui principali portali immobiliari (Immobiliare.it, Idealista, Casa.it) e sui social media fanno la differenza nella velocità di vendita e nel prezzo finale ottenuto.</p>

      <h3>4. Qualificazione degli acquirenti</h3>
      <p>Non tutti gli interessati sono acquirenti seri. La qualificazione preventiva — verifica della capacità finanziaria e della reale intenzione di acquisto — evita visite inutili e trattative che si bloccano per mancanza di mutuo.</p>

      <h3>5. Negoziazione e rogito</h3>
      <p>La trattativa sul prezzo e le condizioni richiede esperienza e neutralità. Un agente immobiliare professionista tutela gli interessi del venditore senza compromettere la trattativa.</p>

      <h2>Il programma Zero Vincoli 60 di HUB</h2>
      <p>HUB offre una garanzia unica a Napoli: con Zero Vincoli 60, vendiamo la tua casa in 60 giorni o la acquistiamo noi. Nessun vincolo, nessun rischio per il venditore.</p>
    `
  },
  {
    slug: "mutuo-prima-casa-napoli",
    title: "Mutuo prima casa a Napoli 2025: tutto quello che devi sapere",
    excerpt: "Tassi, requisiti, documenti e consigli per ottenere il mutuo prima casa a Napoli. La guida aggiornata di WeUnit (HUB).",
    date: "2025-05-08",
    category: "Mutui",
    readTime: "7 min",
    content: `
      <h2>Mutuo prima casa a Napoli nel 2025</h2>
      <p>Ottenere un mutuo per comprare la prima casa a Napoli è più semplice se si sa da dove partire. I tassi nel 2025 si sono stabilizzati dopo il ciclo di rialzi BCE, rendendo il momento favorevole per chi vuole acquistare.</p>

      <h3>Requisiti per il mutuo prima casa</h3>
      <ul>
        <li>Non essere proprietario di altri immobili (o averne uno inagibile)</li>
        <li>Reddito dimostrabile e stabile</li>
        <li>Rata non superiore al 30-35% del reddito mensile netto</li>
        <li>Immobile da adibire ad abitazione principale</li>
      </ul>

      <h3>Agevolazioni prima casa 2025</h3>
      <p>Per la prima casa esistono importanti agevolazioni fiscali:</p>
      <ul>
        <li><strong>Imposta di registro agevolata:</strong> 2% invece del 9% sul valore catastale</li>
        <li><strong>IVA ridotta:</strong> 4% per acquisti da costruttore</li>
        <li><strong>Garanzia CONSAP:</strong> per under 36 con ISEE fino a 40.000€, garanzia statale all'80% del mutuo</li>
      </ul>

      <h3>Quanto vale il tuo mutuo?</h3>
      <p>Con un reddito netto di 2.000€/mese, una rata sostenibile si aggira sui 600-700€. Questo corrisponde a un mutuo di circa 130.000-150.000€ a 25 anni ai tassi attuali.</p>

      <h3>WeUnit: il mediatore creditizio di HUB</h3>
      <p>WeUnit confronta le offerte di oltre 20 banche per trovare il mutuo più adatto alla tua situazione. La consulenza è gratuita e la pratica viene seguita fino all'erogazione.</p>
    `
  },
  {
    slug: "migliori-quartieri-abitare-napoli",
    title: "Migliori quartieri dove abitare a Napoli nel 2025",
    excerpt: "Vomero, Posillipo, Chiaia, Centro Storico: confronto tra i quartieri di Napoli per qualità della vita, prezzi e servizi. Guida completa di HUB.",
    date: "2025-04-28",
    category: "Mercato Immobiliare",
    readTime: "10 min",
    content: `
      <h2>I migliori quartieri di Napoli per vivere nel 2025</h2>
      <p>Napoli è una città di quartieri, ognuno con la sua identità, i suoi prezzi e la sua qualità della vita. Scegliere dove abitare è una decisione fondamentale che dipende da molti fattori: budget, stile di vita, vicinanza al lavoro e ai servizi.</p>

      <h3>Vomero: il quartiere più richiesto</h3>
      <p>Il Vomero è il quartiere residenziale per eccellenza di Napoli: alto sul mare, con aria fresca, ottimi collegamenti (funicolare e metro) e una vasta offerta di negozi e ristoranti. I prezzi rispecchiano la domanda: 3.500-5.500 €/mq per gli appartamenti ristrutturati.</p>

      <h3>Posillipo: lusso e vista mare</h3>
      <p>Il quartiere più esclusivo di Napoli. Case con vista sul Golfo, ville panoramiche e residenze di pregio. I prezzi partono da 5.000 €/mq e possono superare i 12.000 €/mq per le ville più pregiate.</p>

      <h3>Chiaia: eleganza e vivibilità</h3>
      <p>Chiaia è il quartiere più elegante di Napoli, con la Riviera e i negozi di lusso. Molto richiesto da giovani professionisti e famiglie. Prezzi tra 4.000 e 7.000 €/mq nelle posizioni migliori.</p>

      <h3>Centro Storico: opportunità e cultura</h3>
      <p>Per chi ama la vita urbana intensa e non disdegna la ristrutturazione, il Centro Storico UNESCO offre opportunità interessanti a prezzi più accessibili: 1.200-4.000 €/mq a seconda delle condizioni.</p>

      <h3>Fuorigrotta e Bagnoli: qualità a prezzi contenuti</h3>
      <p>Zone in evoluzione, con prezzi tra 1.800 e 3.200 €/mq, buoni collegamenti (metro linea 6) e progetti di riqualificazione in corso.</p>

      <h3>Come scegliere il quartiere giusto?</h3>
      <p>HUB offre una consulenza gratuita per orientarti nella scelta del quartiere più adatto alle tue esigenze e al tuo budget. Contattaci per parlare con un consulente esperto del mercato napoletano.</p>
    `
  },
  {
    slug: "vendere-casa-senza-agenzia-napoli",
    title: "Vendere casa senza agenzia a Napoli: conviene davvero?",
    excerpt: "Analisi costi-benefici della vendita privata vs agenzia a Napoli. Rischi, opportunità e tutto quello che devi sapere prima di decidere.",
    date: "2025-04-15",
    category: "Consigli Pratici",
    readTime: "9 min",
    content: `
      <h2>Vendere casa da soli a Napoli: è davvero conveniente?</h2>
      <p>Sempre più proprietari si chiedono se ha senso affidarsi a un'agenzia immobiliare o vendere direttamente. La risposta non è semplice e dipende da molti fattori.</p>

      <h3>I rischi della vendita privata</h3>
      <ul>
        <li><strong>Prezzo sbagliato:</strong> senza dati di mercato reali, il rischio di sovrastimare (e bloccare la vendita) o sottostimare (e perdere soldi) è alto</li>
        <li><strong>Problemi documentali:</strong> difformità catastali, ipoteche, mancanza di APE: se vengono fuori dopo il compromesso, possono bloccare o annullare la vendita</li>
        <li><strong>Acquirenti non qualificati:</strong> chi non ha un mutuo approvato può bloccarti per mesi</li>
        <li><strong>Trappole contrattuali:</strong> un compromesso mal redatto può costare molto caro</li>
        <li><strong>Tempo e stress:</strong> gestire visite, trattative e burocrazia richiede tempo e competenze specifiche</li>
      </ul>

      <h3>Quanto costa un'agenzia immobiliare?</h3>
      <p>Le provvigioni tipiche a Napoli variano tra il 2% e il 4% sul prezzo di vendita per parte (venditore e acquirente). Su un immobile da 200.000€, la provvigione è di 4.000-8.000€ per il venditore.</p>

      <h3>Cosa ottieni con un'agenzia professionale?</h3>
      <ul>
        <li>Valutazione precisa basata su dati reali</li>
        <li>Due diligence documentale preventiva</li>
        <li>Marketing professionale (foto, portali, social)</li>
        <li>Qualificazione degli acquirenti</li>
        <li>Negoziazione professionale</li>
        <li>Assistenza legale e notarile</li>
      </ul>

      <h3>La garanzia Zero Vincoli 60 di HUB</h3>
      <p>HUB offre una soluzione unica: Zero Vincoli 60. Vendiamo la tua casa in 60 giorni, al prezzo concordato, senza vincoli. Se non vendiamo, valutiamo l'acquisto diretto. Una garanzia concreta che non esiste nella vendita privata.</p>

      <h3>Conclusione</h3>
      <p>La vendita privata può sembrare conveniente sulla carta, ma i rischi e il tempo richiesto spesso superano il risparmio sulla provvigione. Con HUB hai la certezza del risultato e la tranquillità di un servizio professionale e garantito.</p>
    `
  }
];

export default function BlogPage({ navigate, colors }) {
  const { NAVY, NAVY_DEEP, GOLD, GOLD_BRIGHT, CREAM } = colors;
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    // Blog schema
    const schema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Blog Immobiliare HUB Napoli",
      "description": "Articoli e guide pratiche sul mercato immobiliare di Napoli: vendere casa, mutui, quartieri e molto altro.",
      "url": "https://www.fondocasahub.com/blog",
      "publisher": {
        "@type": "Organization",
        "name": "HUB – FC Punto Hub Srl",
        "url": "https://www.fondocasahub.com"
      },
      "blogPost": ARTICLES.map(a => ({
        "@type": "BlogPosting",
        "headline": a.title,
        "description": a.excerpt,
        "datePublished": a.date,
        "author": { "@type": "Organization", "name": "HUB Napoli" },
        "url": `https://www.fondocasahub.com/blog/${a.slug}`
      }))
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-blog';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { const el = document.getElementById('schema-blog'); if (el) el.remove(); };
  }, []);

  if (selectedArticle) {
    const art = ARTICLES.find(a => a.slug === selectedArticle);
    return (
      <div style={{ background: CREAM, color: NAVY, fontFamily: "'Jost', sans-serif", paddingTop: 80 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 32px" }}>
          <button
            onClick={() => setSelectedArticle(null)}
            style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", fontSize: 14, letterSpacing: 1, fontWeight: 600, marginBottom: 32, display: "flex", alignItems: "center", gap: 8 }}
          >
            ← Torna al blog
          </button>
          <div style={{ fontSize: 12, letterSpacing: 2, color: GOLD, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>{art.category} · {art.readTime} di lettura</div>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 700, color: NAVY, lineHeight: 1.3, marginBottom: 16 }}>{art.title}</h1>
          <div style={{ fontSize: 13, color: "rgba(10,31,61,0.5)", marginBottom: 40 }}>Pubblicato il {new Date(art.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })} · HUB Napoli</div>
          <div
            style={{ fontSize: 16, lineHeight: 1.9, color: NAVY }}
            dangerouslySetInnerHTML={{ __html: art.content
              .replace(/<h2>/g, `<h2 style="font-size:1.5rem;font-weight:700;color:${NAVY};margin:40px 0 16px">`)
              .replace(/<h3>/g, `<h3 style="font-size:1.15rem;font-weight:700;color:${NAVY};margin:32px 0 12px">`)
              .replace(/<ul>/g, `<ul style="padding-left:24px;margin-bottom:20px">`)
              .replace(/<li>/g, `<li style="margin-bottom:8px">`)
              .replace(/<p>/g, `<p style="margin-bottom:20px">`)
            }}
          />
          <div style={{ marginTop: 48, padding: 32, background: NAVY_DEEP, borderRadius: 4, color: CREAM, textAlign: "center" }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: GOLD, textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>Hai bisogno di una consulenza?</div>
            <p style={{ marginBottom: 24, opacity: 0.85 }}>HUB offre consulenze gratuite per vendere, comprare o trovare il mutuo giusto a Napoli.</p>
            <button onClick={() => navigate("comincia")} style={{ background: GOLD, color: NAVY, border: "none", padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>
              Consulenza gratuita
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: CREAM, color: NAVY, fontFamily: "'Jost', sans-serif", paddingTop: 80 }}>
      {/* Hero */}
      <section style={{ background: NAVY_DEEP, color: CREAM, padding: "64px 32px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: GOLD, textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Blog Immobiliare</div>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
            Guide pratiche sul mercato<br />
            <span style={{ color: GOLD }}>immobiliare di Napoli</span>
          </h1>
          <p style={{ fontSize: 17, opacity: 0.8, lineHeight: 1.7 }}>
            Articoli, consigli e analisi di mercato da chi vive il settore immobiliare napoletano ogni giorno.
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 32 }}>
          {ARTICLES.map(art => (
            <article
              key={art.slug}
              onClick={() => setSelectedArticle(art.slug)}
              style={{
                background: "#fff",
                borderRadius: 4,
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 2px 16px rgba(10,31,61,0.08)",
                transition: "transform 0.2s, box-shadow 0.2s",
                border: `1px solid rgba(10,31,61,0.06)`
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(10,31,61,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(10,31,61,0.08)"; }}
            >
              <div style={{ background: NAVY_DEEP, height: 6 }} />
              <div style={{ padding: "28px 28px 32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 11, letterSpacing: 1.5, color: GOLD, textTransform: "uppercase", fontWeight: 600 }}>{art.category}</span>
                  <span style={{ fontSize: 12, color: "rgba(10,31,61,0.45)" }}>{art.readTime}</span>
                </div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: NAVY, lineHeight: 1.4, marginBottom: 12 }}>{art.title}</h2>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(10,31,61,0.7)", marginBottom: 20 }}>{art.excerpt}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "rgba(10,31,61,0.45)" }}>
                    {new Date(art.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>Leggi →</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 64, textAlign: "center", padding: 48, background: NAVY_DEEP, borderRadius: 4, color: CREAM }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: GOLD, textTransform: "uppercase", fontWeight: 600, marginBottom: 16 }}>Hai una domanda?</div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 16, lineHeight: 1.3 }}>Parla con un consulente HUB Napoli</h2>
          <p style={{ opacity: 0.8, marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>Ogni situazione è unica. I nostri consulenti rispondono alle tue domande gratuitamente, senza impegno.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("comincia")} style={{ background: GOLD, color: NAVY, border: "none", padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>Consulenza gratuita</button>
            <button onClick={() => navigate("contatti")} style={{ background: "transparent", color: CREAM, border: `2px solid rgba(255,255,255,0.3)`, padding: "14px 32px", fontWeight: 700, cursor: "pointer", borderRadius: 3, fontSize: 14, letterSpacing: 1, textTransform: "uppercase" }}>Contattaci</button>
          </div>
        </div>
      </section>
    </div>
  );
}
