import QuartiereLandingPage from "../components/QuartiereLandingPage";

/*
 * Landing "agenzia immobiliare a Napoli, Posillipo".
 * Vedi nota contenuti in AgenziaImmobiliareVomeroNapoli.jsx: le cifre di
 * mercato non verificate restano tra [PLACEHOLDER: ...].
 */

export default function AgenziaImmobiliarePosillipoNapoli() {
  return (
    <QuartiereLandingPage
      quartiere="Posillipo"
      slug="posillipo"
      heroEyebrow="Agenzia Immobiliare a Napoli, Posillipo"
      heroTitle={<>Agenzia immobiliare a Napoli,<br/>zona <span className="accent">Posillipo</span>.</>}
      heroSubtitle="Compra o vendi casa a Posillipo con un'agenzia con 26 anni di esperienza su Napoli e riservatezza nella gestione degli immobili di pregio. Valutazione gratuita e servizio integrato."
      heroPills={["26 anni di esperienza", "Valutazione gratuita", "Via Pietro Mascagni 35"]}
      alsoServesAreas={["Vomero", "Chiaia", "Fuorigrotta", "Arenella", "Colli Aminei"]}
      nearbyAreas={[
        { name: "Chiaia", slug: "chiaia" },
        { name: "Fuorigrotta", slug: "fuorigrotta" },
        { name: "Vomero", slug: "vomero" },
        { name: "Arenella", slug: "arenella" },
      ]}
      whyUsPoints={[
        {
          icon: "🏠",
          title: "26 anni sul mercato di Napoli",
          desc: "Dalla sede di Via Pietro Mascagni 35 seguiamo anche le compravendite di pregio a Posillipo, con un metodo collaudato in 26 anni.",
        },
        {
          icon: "📊",
          title: "Valutazioni su dati reali",
          desc: "Confrontiamo il tuo immobile con le vendite comparabili effettive della zona, non con stime generiche da portale.",
        },
        {
          icon: "🔒",
          title: "Riservatezza nella trattativa",
          desc: "Gestiamo immobili di fascia alta con discrezione, dalla prima valutazione fino alla chiusura della trattativa.",
        },
        {
          icon: "⭐",
          title: "Recensioni verificate 5/5",
          desc: "Clienti in tutta Napoli ci hanno scelto, con recensioni verificate a 5 stelle su Google.",
        },
      ]}
      marketText={[
        "Posillipo è la collina che si affaccia sul golfo di Napoli tra Mergellina e Capo Posillipo, storicamente uno dei quartieri più prestigiosi della città. La sua conformazione — strade panoramiche, ville immerse nel verde e scorci sul mare — la distingue nettamente dal resto di Napoli, tanto da essere considerata una delle zone residenziali più esclusive del capoluogo campano, insieme a Chiaia mare. Il Parco Virgiliano, con la sua vista sul golfo e sulle isole, e la vicinanza a Capo Posillipo contribuiscono a un'immagine del quartiere che va oltre il semplice valore immobiliare, diventando parte dell'identità stessa di Napoli.",
        "Il patrimonio immobiliare è dominato da ville storiche e palazzine signorili, spesso con giardino privato, terrazza panoramica o accesso diretto o agevolato al mare, in particolare nella zona di Marechiaro. Non mancano complessi residenziali più moderni, generalmente con piscina condominiale o ampi spazi comuni, che offrono un'alternativa alla villa indipendente mantenendo comunque un elevato standard qualitativo. Molte di queste ville risalgono a inizio Novecento e conservano parchi e giardini storici, un elemento che ne fa spesso immobili unici, difficilmente comparabili tra loro con i metodi di valutazione standard.",
        "Sul fronte dei prezzi, Posillipo è tra le zone più costose non solo di Napoli ma dell'intera Campania: mediamente tra 5.000 e 12.000 €/mq, con punte più alte per le ville con vista mare diretta. La presenza di vista mare, il livello di privacy e le dimensioni del giardino o della terrazza sono i fattori che incidono maggiormente sul valore finale, spesso più della semplice metratura interna.",
        "La domanda per questa zona arriva soprattutto da un pubblico di fascia alta, sia napoletano sia proveniente da fuori regione, interessato a una seconda casa o a una residenza di rappresentanza. Il mercato è meno liquido rispetto ad altre zone della città: gli immobili di pregio richiedono spesso tempi di vendita più lunghi e un lavoro di marketing mirato verso un pubblico specifico, non generalista. Anche il canale della locazione di pregio, di breve o medio periodo, è attivo su questa zona, soprattutto per le ville con accesso al mare o vista panoramica.",
        "Per chi vende a Posillipo, la due diligence documentale è particolarmente delicata: molte ville storiche presentano vincoli paesaggistici o architettonici legati alla posizione panoramica, e verificarne la compatibilità con eventuali interventi futuri dell'acquirente è un passaggio che richiede competenza specifica. Un'agenzia con esperienza reale su questo segmento evita ritardi e tutela sia il venditore sia l'acquirente, gestendo con discrezione anche gli aspetti più delicati della trattativa, dalla riservatezza sui dati dell'immobile alla selezione degli acquirenti realmente interessati e qualificati.",
      ]}
      faq={[
        {
          q: "Quanto vale una villa o un appartamento a Posillipo?",
          a: "Posillipo è tra le zone più costose di Napoli, con valori mediamente tra 5.000 e 12.000 €/mq, che variano molto in base a vista mare, giardino e tipologia dell'immobile. Richiedi una valutazione gratuita e riservata.",
        },
        {
          q: "Quanto tempo serve per vendere un immobile a Posillipo?",
          a: "Il mercato degli immobili di pregio è meno liquido rispetto ad altre zone: [PLACEHOLDER: inserire tempo medio di vendita verificato]. Un marketing mirato verso il pubblico giusto riduce sensibilmente i tempi.",
        },
        {
          q: "Cos'è Marechiaro?",
          a: "Marechiaro è la frazione più suggestiva di Posillipo, affacciata direttamente sul mare, storicamente legata alla pesca e oggi tra le zone più fotografate e ricercate del quartiere per chi cerca un accesso diretto alla costa.",
        },
        {
          q: "Come si raggiunge Posillipo dal centro di Napoli?",
          a: "Posillipo è collegata al centro città da diverse linee bus lungo la via panoramica omonima, oltre che dalla zona di Mergellina; la posizione collinare e panoramica comporta tempi di percorrenza maggiori rispetto a zone più centrali.",
        },
      ]}
      seo={{
        title: "Agenzia Immobiliare a Napoli, Posillipo | FondoCasa Hub",
        description: "Compra o vendi casa a Napoli, zona Posillipo, con FondoCasa Hub: 26 anni di esperienza in vendite di pregio. Richiedi una valutazione gratuita e riservata.",
      }}
    />
  );
}
