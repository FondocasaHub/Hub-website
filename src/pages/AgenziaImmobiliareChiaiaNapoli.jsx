import QuartiereLandingPage from "../components/QuartiereLandingPage";

/*
 * Landing "agenzia immobiliare a Napoli, Chiaia".
 * Vedi nota contenuti in AgenziaImmobiliareVomeroNapoli.jsx: le cifre di
 * mercato non verificate restano tra [PLACEHOLDER: ...].
 */

export default function AgenziaImmobiliareChiaiaNapoli() {
  return (
    <QuartiereLandingPage
      quartiere="Chiaia"
      slug="chiaia"
      heroEyebrow="Agenzia Immobiliare a Napoli, Chiaia"
      heroTitle={<>Agenzia immobiliare a Napoli,<br/>zona <span className="accent">Chiaia</span>.</>}
      heroSubtitle="Compra o vendi casa a Chiaia con un'agenzia con 26 anni di esperienza sul mercato immobiliare di Napoli. Valutazione gratuita e servizio integrato immobiliare, mutuo e assicurazione."
      heroPills={["26 anni di esperienza", "Valutazione gratuita", "Via Pietro Mascagni 35"]}
      alsoServesAreas={["Vomero", "Posillipo", "Fuorigrotta", "Arenella", "Colli Aminei"]}
      nearbyAreas={[
        { name: "Posillipo", slug: "posillipo" },
        { name: "Vomero", slug: "vomero" },
        { name: "Fuorigrotta", slug: "fuorigrotta" },
        { name: "Arenella", slug: "arenella" },
      ]}
      whyUsPoints={[
        {
          icon: "🏠",
          title: "26 anni sul mercato di Napoli",
          desc: "Dalla sede di Via Pietro Mascagni 35 seguiamo compravendite anche a Chiaia, con un metodo collaudato in 26 anni di attività.",
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
          desc: "Clienti in tutta Napoli ci hanno scelto, con recensioni verificate a 5 stelle su Google.",
        },
      ]}
      marketText={[
        "Chiaia è uno dei quartieri più prestigiosi e centrali di Napoli, affacciato sul lungomare e delimitato dalla Riviera di Chiaia, da via dei Mille e da Piazza dei Martiri. La sua posizione — a ridosso del mare, della Villa Comunale e a pochi passi dal centro storico e dal Vomero, con cui è collegata dalla funicolare di Chiaia — la rende una delle zone più richieste sia per chi cerca la residenza principale sia per chi investe in un immobile da valorizzare. La concentrazione di boutique, gallerie d'arte, ristoranti e uffici professionali ne fa anche uno dei quartieri più vivi durante la giornata, oltre che uno dei più eleganti della città.",
        "Il patrimonio immobiliare è in larga parte composto da palazzi signorili di fine Ottocento e primo Novecento, con soffitti alti, decorazioni d'epoca e affacci prestigiosi lungo strade come via Filangieri, via Carlo Poerio e i vicoli intorno a Piazza dei Martiri. Non mancano edifici più moderni, soprattutto verso Mergellina, mentre le zone di via Bisignano e via Belledonne alle Riviere, cuore della vita serale del quartiere, restano tra le più vivaci e frequentate della città. Molti di questi palazzi sono sottoposti a vincoli architettonici o di tutela, un aspetto che va sempre verificato prima di pianificare ristrutturazioni importanti.",
        "Sul fronte dei prezzi, Chiaia è tradizionalmente una delle zone più costose di Napoli insieme a Posillipo: mediamente tra 4.000 e 7.000 €/mq. Gli immobili con vista mare o affaccio sulla Villa Comunale spuntano generalmente un premio significativo rispetto al resto del quartiere, così come i piani alti con terrazzo.",
        "La domanda arriva sia da acquirenti napoletani di fascia alta sia da chi investe in immobili da destinare alla locazione turistica o residenziale, vista la forte attrattività turistica e commerciale della zona. Prima di procedere con un investimento a scopo locativo è comunque opportuno verificare la normativa comunale e condominiale aggiornata, che negli ultimi anni ha introdotto vincoli più stringenti in diverse aree della città. Non mancano infine acquirenti stranieri, attratti dalla combinazione di centralità, mare e patrimonio storico che rende Chiaia difficilmente paragonabile ad altre zone della città.",
        "Per chi vende un immobile a Chiaia, la documentazione storica dell'edificio richiede spesso un'attenzione particolare, trattandosi in molti casi di palazzi vincolati o con vincoli paesaggistici legati alla vicinanza al lungomare. Un'agenzia con esperienza specifica nella gestione di questi aspetti riduce i tempi di due diligence e protegge sia il venditore sia l'acquirente da sorprese in fase di rogito.",
      ]}
      priceTableTitle="Valori del venduto per strada"
      priceTableNote="Valori rilevati sul venduto reale seguito e monitorato dalla nostra agenzia, non su stime da portale. Il valore ricorrente è quello a cui si chiude circa il 70% delle compravendite della strada; la punta massima è il valore più alto registrato. Per una stima riferita al tuo immobile serve un sopralluogo."
      priceTable={[
        { via: "Via dei Mille", tipico: "4.802 €/mq", massimo: "7.153 €/mq" },
        { via: "Piazza dei Martiri", tipico: "4.500 €/mq", massimo: "6.000 €/mq" },
        { via: "Via Mergellina", tipico: "4.293 €/mq", massimo: "5.862 €/mq" },
      ]}
      faq={[
        {
          q: "Quanto vale un appartamento a Chiaia?",
          a: "Dipende molto dalla strada, dalla vista e dal piano. Sul venduto che seguiamo, in via dei Mille circa il 70% delle compravendite si chiude intorno a 4.802 €/mq con punte fino a 7.153, in piazza dei Martiri intorno a 4.500 €/mq con punte fino a 6.000, in via Mergellina intorno a 4.293 €/mq con punte fino a 5.862. Richiedi una valutazione gratuita per una stima riferita al tuo immobile.",
        },
        {
          q: "Qual è la differenza tra Chiaia e Riviera di Chiaia?",
          a: "Chiaia è il quartiere nel suo complesso, mentre la Riviera di Chiaia è il viale che costeggia la Villa Comunale verso il mare: gli immobili su questo affaccio sono generalmente tra i più richiesti e costosi della zona.",
        },
        {
          q: "Chiaia è adatta per un investimento locativo?",
          a: "Sì, per la forte attrattività turistica, ma è opportuno verificare la normativa comunale e condominiale aggiornata sugli affitti brevi prima di acquistare a scopo di investimento.",
        },
        {
          q: "Come si raggiunge Chiaia dal Vomero?",
          a: "Chiaia è collegata al Vomero dalla funicolare omonima, oltre che da diverse linee bus, ed è raggiungibile a piedi dal centro storico in pochi minuti lungo via Toledo e i quartieri limitrofi.",
        },
      ]}
      seo={{
        title: "Agenzia Immobiliare a Napoli, Chiaia | FondoCasa Hub",
        description: "Compra o vendi casa a Napoli, zona Chiaia, con FondoCasa Hub: 26 anni di esperienza e valutazioni su dati reali di mercato. Richiedi una consulenza gratuita.",
      }}
    />
  );
}
