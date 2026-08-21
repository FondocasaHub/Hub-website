import QuartiereLandingPage from "../components/QuartiereLandingPage";

/*
 * Landing "agenzia immobiliare a Napoli, Soccavo".
 * I valori al mq della tabella provengono dai dati del venduto forniti
 * dall'agenzia (via dell'Epomeo, via Giustiniano, via Piave): non sono
 * stime da portale e non vanno modificati senza una nuova rilevazione.
 */

export default function AgenziaImmobiliareSoccavoNapoli() {
  return (
    <QuartiereLandingPage
      quartiere="Soccavo"
      slug="soccavo"
      heroEyebrow="Agenzia Immobiliare a Napoli, Soccavo"
      heroTitle={<>Agenzia immobiliare a Napoli,<br/>zona <span className="accent">Soccavo</span>.</>}
      heroSubtitle="Compra o vendi casa a Soccavo con un'agenzia con 26 anni di esperienza sul mercato di Napoli. Valutazione gratuita su dati reali del venduto e servizio integrato immobiliare, mutuo e assicurazione."
      heroPills={["26 anni di esperienza", "Valutazione gratuita", "Via Pietro Mascagni 35"]}
      alsoServesAreas={["Vomero", "Chiaia", "Posillipo", "Arenella", "Fuorigrotta", "Colli Aminei", "Centro Storico"]}
      nearbyAreas={[
        { name: "Fuorigrotta", slug: "fuorigrotta" },
        { name: "Vomero", slug: "vomero" },
        { name: "Arenella", slug: "arenella" },
        { name: "Posillipo", slug: "posillipo" },
      ]}
      whyUsPoints={[
        {
          icon: "🏠",
          title: "26 anni sul mercato di Napoli",
          desc: "Dalla sede di Via Pietro Mascagni 35 seguiamo compravendite anche a Soccavo, con un metodo collaudato in 26 anni di attività.",
        },
        {
          icon: "📊",
          title: "Valutazioni sul venduto reale",
          desc: "A Soccavo il valore cambia sensibilmente da una strada all'altra: confrontiamo il tuo immobile con le vendite effettive della tua via, non con medie di quartiere.",
        },
        {
          icon: "🏦",
          title: "Mutuo seguito internamente",
          desc: "A Soccavo molti acquirenti comprano la prima casa con un mutuo: confrontiamo le offerte di oltre 20 banche e seguiamo la pratica fino all'erogazione.",
        },
        {
          icon: "🤝",
          title: "Un solo interlocutore",
          desc: "Immobiliare, mutuo e assicurazione seguiti dallo stesso team, dalla valutazione fino al rogito.",
        },
      ]}
      marketText={[
        "Soccavo è un quartiere residenziale di Napoli ovest, che insieme a Pianura forma la Municipalità 9. È cresciuto soprattutto tra gli anni Sessanta e Ottanta e il suo patrimonio immobiliare è fatto in larga parte di palazzine e condomini di quel periodo, con tagli regolari, spesso con ascensore, balconi e in molti casi box o posto auto: caratteristiche che a Napoli non sono affatto scontate e che pesano parecchio nella scelta di chi compra.",
        "La domanda arriva soprattutto da chi cerca la prima casa. Il rapporto tra superficie e prezzo qui è tra i più favorevoli della città: con il budget che al Vomero basta per un bilocale, a Soccavo si acquista un appartamento familiare. Per questo il quartiere intercetta molte giovani coppie e famiglie che si spostano dalle zone collinari cercando più metri quadri, restando comunque dentro Napoli e vicino a Fuorigrotta.",
        "I collegamenti sono uno dei punti di forza: la linea Circumflegrea collega Soccavo al centro e alla zona flegrea, e la vicinanza a Fuorigrotta e alla tangenziale rende il quartiere comodo anche per chi si sposta in auto. Il commercio di vicinato è concentrato lungo gli assi principali, a partire da via dell'Epomeo, che resta anche la strada con i valori più alti del quartiere.",
        "Per chi vende a Soccavo la variabile decisiva è quasi sempre lo stato dell'immobile e del condominio: appartamenti ristrutturati, piani alti serviti da ascensore e stabili con parti comuni in ordine si collocano vicino alle punte massime, mentre gli immobili da rimettere a nuovo restano nella fascia bassa. Prima di definire il prezzo verifichiamo sempre conformità catastale e urbanistica, così da non trovarci sorprese quando la trattativa è già avviata.",
      ]}
      priceTableTitle="Valori del venduto per strada"
      priceTableNote="Valori rilevati sul venduto reale seguito e monitorato dalla nostra agenzia, non su stime da portale. Il valore ricorrente è quello a cui si chiude circa il 70% delle compravendite della strada; la punta massima è il valore più alto registrato. Per una stima riferita al tuo immobile serve un sopralluogo."
      priceTable={[
        { via: "Via dell'Epomeo", tipico: "2.365 €/mq", massimo: "2.765 €/mq" },
        { via: "Via Piave", tipico: "2.100 €/mq", massimo: "2.700 €/mq" },
        { via: "Via Giustiniano", tipico: "1.979 €/mq", massimo: "2.379 €/mq" },
      ]}
      faq={[
        {
          q: "Quanto vale un appartamento a Soccavo?",
          a: "Dipende dalla strada e dallo stato dell'immobile. Sul venduto che seguiamo, in via dell'Epomeo circa il 70% delle compravendite si chiude intorno a 2.365 €/mq con punte fino a 2.765, in via Piave intorno a 2.100 €/mq con punte fino a 2.700, in via Giustiniano intorno a 1.979 €/mq con punte fino a 2.379. Per una stima sul tuo immobile serve un sopralluogo: richiedi una valutazione gratuita.",
        },
        {
          q: "Conviene comprare casa a Soccavo?",
          a: "È una delle zone di Napoli con il miglior rapporto tra metri quadri e prezzo: a parità di budget si acquista un appartamento sensibilmente più grande rispetto alle zone collinari, restando ben collegati al centro e a Fuorigrotta. È la ragione per cui il quartiere è molto richiesto da chi compra la prima casa.",
        },
        {
          q: "Perché tra una strada e l'altra il prezzo cambia così tanto?",
          a: "Perché a Soccavo pesano molto la posizione rispetto agli assi principali, l'anno di costruzione dello stabile, la presenza di ascensore e posto auto e lo stato delle parti comuni. Via dell'Epomeo, che è l'asse commerciale del quartiere, esprime valori più alti rispetto alle strade più interne.",
        },
        {
          q: "Quanto tempo serve per vendere casa a Soccavo?",
          a: "Dipende soprattutto dal prezzo di partenza e dallo stato dell'immobile. Con il programma Zero Vincoli 60 i primi 60 giorni seguono un piano di attività definito da contratto: se al termine non sei soddisfatto del servizio, o se non abbiamo svolto tutte le attività previste, puoi recedere dall'incarico senza penali.",
        },
      ]}
      seo={{
        title: "Agenzia Immobiliare a Napoli, Soccavo | FondoCasa Hub",
        description: "Compra o vendi casa a Soccavo, Napoli, con FondoCasa Hub: 26 anni di esperienza e valori del venduto reale per strada. Richiedi una consulenza gratuita.",
      }}
    />
  );
}
