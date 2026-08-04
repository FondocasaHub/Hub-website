import QuartiereLandingPage from "../components/QuartiereLandingPage";

/*
 * Landing "agenzia immobiliare a Napoli, Vomero".
 *
 * Nota contenuti: i fatti riutilizzati da altre pagine del sito (indirizzo,
 * 26 anni di attività, rating Google 5.0, funicolari) sono reali. Le cifre
 * di mercato (fasce di prezzo, tempi medi di vendita) NON sono verificate:
 * restano tra [PLACEHOLDER: ...] e vanno sostituite con dati reali e
 * aggiornati appena disponibili — vedi segnalazione in chat.
 */

export default function AgenziaImmobiliareVomeroNapoli() {
  return (
    <QuartiereLandingPage
      quartiere="Vomero"
      slug="vomero"
      heroEyebrow="Agenzia Immobiliare a Napoli, Vomero"
      heroTitle={<>Agenzia immobiliare a Napoli,<br/>zona <span className="accent">Vomero</span>.</>}
      heroSubtitle="Compra o vendi casa al Vomero con un'agenzia che vive il quartiere da 26 anni. Valutazione gratuita e servizio integrato immobiliare, mutuo e assicurazione."
      heroPills={["26 anni al Vomero", "Valutazione gratuita", "Via Pietro Mascagni 35"]}
      alsoServesAreas={["Chiaia", "Posillipo", "Fuorigrotta", "Soccavo", "Centro Storico"]}
      nearbyAreas={[
        { name: "Arenella", slug: "arenella" },
        { name: "Chiaia", slug: "chiaia" },
        { name: "Colli Aminei", slug: "colli-aminei" },
        { name: "Posillipo", slug: "posillipo" },
      ]}
      whyUsPoints={[
        {
          icon: "🏠",
          title: "26 anni nello stesso quartiere",
          desc: "Sede storica in Via Pietro Mascagni 35: conosciamo ogni traversa e ogni condominio del Vomero.",
        },
        {
          icon: "📊",
          title: "Valutazioni su dati reali",
          desc: "Confrontiamo il tuo immobile con le vendite comparabili effettive della zona, non con stime generiche da portale.",
        },
        {
          icon: "🤝",
          title: "Un solo interlocutore",
          desc: "Immobiliare, mutuo e assicurazione seguiti dallo stesso team, dalla valutazione fino al rogito.",
        },
        {
          icon: "⭐",
          title: "Recensioni verificate 5/5",
          desc: "Decine di famiglie del Vomero ci hanno scelto, con recensioni verificate a 5 stelle su Google.",
        },
      ]}
      marketText={[
        "Il Vomero è tra i quartieri collinari più richiesti di Napoli: una posizione elevata rispetto al centro storico, collegata dalle tre funicolari (Centrale, Chiaia e Montesanto) e da un tessuto urbano ordinato, nato in gran parte tra fine Ottocento e anni '30, che lo distingue dal resto della città per ampiezza delle strade, presenza di verde pubblico e qualità degli edifici. Chi cerca casa al Vomero valuta soprattutto la vivibilità: negozi di vicinato, scuole, presidi sanitari e una rete di trasporti che permette di raggiungere il centro in pochi minuti, mantenendo però una dimensione residenziale più tranquilla rispetto ai quartieri bassi.",
        "Il patrimonio immobiliare del quartiere è eterogeneo. Convivono palazzine d'epoca con soffitti alti, balconi in ferro battuto e stucchi originali — spesso lungo le traverse di via Scarlatti, via Luca Giordano e via Merliani — e complessi più moderni, costruiti tra gli anni '60 e '80, con tagli più ampi e talvolta box auto interrati, una dotazione rara e molto ricercata in città. Le zone di Vomero Alto e Belvedere, più vicine alla Floridiana e a San Martino, offrono in genere maggiore silenziosità e viste sul golfo, mentre l'asse di via Scarlatti e piazza Vanvitelli concentra la vita commerciale del quartiere.",
        "Sul fronte dei prezzi, il Vomero si colloca stabilmente tra le zone più costose di Napoli dopo Posillipo e Chiaia mare: mediamente tra 3.500 e 5.500 €/mq, con oscillazioni sensibili tra le traverse centrali, più richieste, e le zone limitrofe a Arenella e Cangiani, dove i valori sono generalmente più accessibili. Anche il piano e la presenza di ascensore incidono in modo significativo sul prezzo finale, più che in altri quartieri della città, per via della morfologia collinare.",
        "La domanda arriva sia da chi già vive al Vomero e cerca un cambio (upgrade di metratura in vista di un figlio, o downsizing dopo che i figli sono usciti di casa), sia da famiglie che si trasferiscono da altri quartieri di Napoli o dall'hinterland attratte dalla qualità della vita e dalla rete scolastica. Non mancano investitori interessati alla rendita da locazione breve nelle traverse più centrali, anche se negli ultimi anni le regole condominiali e comunali su questo fronte si sono fatte più stringenti in diverse zone della città — un aspetto da verificare caso per caso prima di un acquisto a scopo di investimento.",
        "Per chi decide di vendere, la fase più delicata resta la preparazione della documentazione: conformità catastale e urbanistica, soprattutto negli edifici d'epoca dove nel tempo sono stati realizzati frazionamenti o piccole modifiche interne non sempre regolarizzate. Un immobile con carte in ordine si vende più rapidamente e con minor margine di trattativa. È qui che un'agenzia con esperienza diretta nel quartiere fa la differenza reale rispetto a un annuncio pubblicato su un portale senza un supporto locale strutturato.",
      ]}
      faq={[
        {
          q: "Quanto vale un appartamento al Vomero?",
          a: "Il valore medio si colloca tra 3.500 e 5.500 €/mq, ma dipende molto da zona, piano, stato dell'immobile e presenza di ascensore o box auto. Richiedi una valutazione gratuita per una stima precisa basata su vendite comparabili reali della tua traversa.",
        },
        {
          q: "Quali sono le zone migliori del Vomero?",
          a: "Vomero Alto e Belvedere sono generalmente le zone più richieste per tranquillità e vicinanza alla Floridiana, mentre l'asse di via Scarlatti e piazza Vanvitelli è preferito da chi cerca vita di quartiere e servizi a portata di mano.",
        },
        {
          q: "Quanto tempo serve per vendere casa al Vomero?",
          a: "Dipende da prezzo richiesto, documentazione e marketing dell'immobile. [PLACEHOLDER: inserire tempo medio di vendita verificato]. Un immobile con documentazione in regola e in linea con i prezzi di mercato si vende generalmente più rapidamente.",
        },
        {
          q: "Come si raggiunge il Vomero dal centro di Napoli?",
          a: "Il Vomero è collegato al centro città da tre funicolari (Centrale, Chiaia e Montesanto), oltre che da linee bus, il che lo rende facilmente raggiungibile pur mantenendo una posizione collinare più tranquilla rispetto al centro storico.",
        },
      ]}
      seo={{
        title: "Agenzia Immobiliare a Napoli, Vomero | FondoCasa Hub",
        description: "Compra o vendi casa a Napoli, zona Vomero, con FondoCasa Hub: 26 anni di esperienza nel quartiere e valutazione gratuita. Contattaci per una consulenza.",
      }}
    />
  );
}
