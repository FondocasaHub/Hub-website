import QuartiereLandingPage from "../components/QuartiereLandingPage";

/*
 * Landing "agenzia immobiliare a Napoli, Fuorigrotta".
 * Vedi nota contenuti in AgenziaImmobiliareVomeroNapoli.jsx: le cifre di
 * mercato non verificate restano tra [PLACEHOLDER: ...].
 */

export default function AgenziaImmobiliareFuorigrottaNapoli() {
  return (
    <QuartiereLandingPage
      quartiere="Fuorigrotta"
      slug="fuorigrotta"
      heroEyebrow="Agenzia Immobiliare a Napoli, Fuorigrotta"
      heroTitle={<>Agenzia immobiliare a Napoli,<br/>zona <span className="accent">Fuorigrotta</span>.</>}
      heroSubtitle="Compra o vendi casa a Fuorigrotta con un'agenzia con 26 anni di esperienza sul mercato immobiliare di Napoli. Valutazione gratuita e servizio integrato immobiliare, mutuo e assicurazione."
      heroPills={["26 anni di esperienza", "Valutazione gratuita", "Via Pietro Mascagni 35"]}
      alsoServesAreas={["Vomero", "Chiaia", "Posillipo", "Arenella", "Colli Aminei"]}
      nearbyAreas={[
        { name: "Posillipo", slug: "posillipo" },
        { name: "Chiaia", slug: "chiaia" },
        { name: "Vomero", slug: "vomero" },
        { name: "Colli Aminei", slug: "colli-aminei" },
      ]}
      whyUsPoints={[
        {
          icon: "🏠",
          title: "26 anni sul mercato di Napoli",
          desc: "Dalla sede di Via Pietro Mascagni 35 seguiamo compravendite anche a Fuorigrotta, con un metodo collaudato in 26 anni di attività.",
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
        "Fuorigrotta è uno dei quartieri più estesi e popolosi di Napoli Ovest, sviluppatosi soprattutto nel secondo dopoguerra dopo l'apertura della galleria che dà il nome al quartiere e che lo collega a Chiaia e Mergellina. È la sede di alcuni dei principali poli cittadini — la Mostra d'Oltremare, lo Stadio Diego Armando Maradona, Città della Scienza e la Città Universitaria — che ne fanno una zona vivace e ben servita, pur restando prevalentemente residenziale. La grande estensione del quartiere fa sì che al suo interno convivano zone molto diverse tra loro per carattere e livello dei servizi, un aspetto da considerare attentamente in fase di ricerca.",
        "Il patrimonio immobiliare è costituito in larga parte da palazzine e condomini costruiti tra gli anni '50 e '80, con tagli generalmente familiari e una buona disponibilità di box auto rispetto ad altre zone della città, complice l'impianto urbanistico più moderno e pianificato rispetto al centro storico. Le zone intorno a via Terracina, via Leopardi e piazzale Tecchio sono tra le più richieste per la vicinanza ai servizi e ai collegamenti. Non mancano interventi più recenti di riqualificazione urbana, che negli ultimi anni hanno interessato alcune aree del quartiere migliorandone la dotazione di spazi verdi e servizi pubblici.",
        "Sul fronte dei prezzi, Fuorigrotta si posiziona in una fascia media per gli standard di Napoli, generalmente più accessibile rispetto a Vomero, Chiaia e Posillipo: [PLACEHOLDER: inserire fascia €/mq aggiornata, distinta per stato dell'immobile e vicinanza ai poli universitari/stadio]. La presenza di collegamenti rapidi verso il centro — Cumana e Metro Linea 6 — è un fattore che incide positivamente sul valore degli immobili più vicini alle stazioni.",
        "La domanda arriva da un pubblico eterogeneo: famiglie che cercano un buon rapporto qualità-prezzo restando ben collegate al centro, studenti e famiglie di studenti fuori sede vista la vicinanza alla Città Universitaria, e chi lavora nella zona ospedaliera e nei poli fieristici della zona. Il mercato degli affitti è storicamente attivo, il che rende Fuorigrotta interessante anche per chi valuta un acquisto a scopo di investimento locativo, in particolare nelle zone più vicine alle stazioni della Cumana e della Metro Linea 6.",
        "Per chi vende casa a Fuorigrotta, la preparazione documentale riguarda soprattutto la conformità catastale degli edifici del dopoguerra, spesso oggetto nel tempo di piccole modifiche interne. Un immobile con carte in ordine e un prezzo allineato al mercato si posiziona meglio rispetto alla concorrenza di annunci nella stessa zona, particolarmente numerosi vista l'estensione del quartiere.",
      ]}
      faq={[
        {
          q: "Quanto vale un appartamento a Fuorigrotta?",
          a: "Fuorigrotta è generalmente più accessibile rispetto a Vomero, Chiaia e Posillipo. [PLACEHOLDER: inserire fascia di prezzo €/mq aggiornata]. Richiedi una valutazione gratuita per una stima precisa basata su vendite comparabili reali.",
        },
        {
          q: "Fuorigrotta è una buona zona per investire in affitto?",
          a: "Sì, per la vicinanza alla Città Universitaria e ai poli fieristici e sportivi il mercato degli affitti è storicamente attivo, ma è opportuno verificare domanda e normativa aggiornata prima di acquistare a scopo di investimento.",
        },
        {
          q: "Quanto tempo serve per vendere casa a Fuorigrotta?",
          a: "Dipende da prezzo richiesto, documentazione e marketing dell'immobile. [PLACEHOLDER: inserire tempo medio di vendita verificato]. Un immobile con carte in regola e prezzo di mercato si vende generalmente più rapidamente.",
        },
        {
          q: "Come si raggiunge Fuorigrotta dal centro di Napoli?",
          a: "Fuorigrotta è collegata al centro dalla ferrovia Cumana e dalla Metro Linea 6, oltre che da diverse linee bus attraverso la galleria che dà il nome al quartiere verso Mergellina e Chiaia.",
        },
      ]}
      seo={{
        title: "Agenzia Immobiliare a Napoli, Fuorigrotta | FondoCasa Hub",
        description: "Compra o vendi casa a Napoli, zona Fuorigrotta, con FondoCasa Hub: 26 anni di esperienza e conoscenza del quartiere. Richiedi una valutazione gratuita.",
      }}
    />
  );
}
