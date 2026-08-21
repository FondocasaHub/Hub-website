import QuartiereLandingPage from "../components/QuartiereLandingPage";

/*
 * Landing "agenzia immobiliare a Napoli, Centro Storico".
 * I valori al mq della tabella provengono dai dati del venduto forniti
 * dall'agenzia (Piazza San Domenico Maggiore, via San Gregorio Armeno,
 * via Duomo): non sono stime da portale e non vanno modificati senza una
 * nuova rilevazione. Il Centro Storico e' troppo ampio per un range unico,
 * per questo i valori sono esposti per singola strada.
 */

export default function AgenziaImmobiliareCentroStoricoNapoli() {
  return (
    <QuartiereLandingPage
      quartiere="Centro Storico"
      slug="centro-storico"
      heroEyebrow="Agenzia Immobiliare a Napoli, Centro Storico"
      heroTitle={<>Agenzia immobiliare a Napoli,<br/>zona <span className="accent">Centro Storico</span>.</>}
      heroSubtitle="Compra o vendi casa nel Centro Storico di Napoli con un'agenzia con 26 anni di esperienza sul mercato cittadino. Valutazione gratuita su dati reali del venduto e servizio integrato immobiliare, mutuo e assicurazione."
      heroPills={["26 anni di esperienza", "Valutazione gratuita", "Via Pietro Mascagni 35"]}
      alsoServesAreas={["Vomero", "Chiaia", "Posillipo", "Arenella", "Fuorigrotta", "Colli Aminei"]}
      nearbyAreas={[
        { name: "Chiaia", slug: "chiaia" },
        { name: "Vomero", slug: "vomero" },
        { name: "Arenella", slug: "arenella" },
        { name: "Posillipo", slug: "posillipo" },
      ]}
      whyUsPoints={[
        {
          icon: "🏠",
          title: "26 anni sul mercato di Napoli",
          desc: "Dalla sede di Via Pietro Mascagni 35 seguiamo compravendite anche nel Centro Storico, con un metodo collaudato in 26 anni di attività.",
        },
        {
          icon: "📊",
          title: "Valutazioni sul venduto reale",
          desc: "Nel Centro Storico il valore cambia da una strada all'altra: confrontiamo il tuo immobile con le vendite effettive della tua via, non con medie di quartiere.",
        },
        {
          icon: "📁",
          title: "Attenzione ai vincoli",
          desc: "Nel tessuto storico la regolarità urbanistica e catastale e i vincoli di tutela vanno verificati prima di mettere in vendita, non al rogito.",
        },
        {
          icon: "🤝",
          title: "Un solo interlocutore",
          desc: "Immobiliare, mutuo e assicurazione seguiti dallo stesso team, dalla valutazione fino al rogito.",
        },
      ]}
      marketText={[
        "Il Centro Storico di Napoli, riconosciuto patrimonio UNESCO, è l'area più estesa e più eterogenea della città: comprende i Decumani, la zona intorno a Piazza San Domenico Maggiore e San Gregorio Armeno, l'asse di via Duomo, Forcella e i quartieri che si allungano verso Port'Alba e via Toledo. Proprio per questo parlare di un unico prezzo al metro quadro per il Centro Storico non ha molto senso: due immobili distanti trecento metri possono valere cifre sensibilmente diverse.",
        "Il patrimonio è in larghissima parte storico, spesso con parti comuni e facciate sottoposte a tutela. Accanto a palazzi nobiliari con corti monumentali, scale in piperno e affacci su chiese e chiostri, convivono edifici molto più modesti e bassi ristrutturati. Stato di conservazione, presenza di ascensore, luminosità e affaccio pesano qui più che altrove: sono il motivo per cui, nella stessa strada, la forbice tra il valore ricorrente e le punte massime resta ampia.",
        "La domanda arriva da tre fronti distinti. C'è chi cerca la prima casa in una zona centrale e ben servita dalla Linea 1 della metropolitana, chi acquista per ricavarne un immobile da mettere a reddito e chi compra per valorizzare un immobile d'epoca. Prima di procedere con un investimento a scopo locativo è opportuno verificare la normativa comunale e condominiale aggiornata, che negli ultimi anni ha introdotto vincoli più stringenti in diverse aree della città.",
        "Per chi vende nel Centro Storico, la parte più delicata è quasi sempre documentale: provenienze successorie non aggiornate, difformità catastali accumulate nel tempo, sanatorie mai completate. Sono situazioni frequenti nel tessuto storico e non necessariamente bloccanti, ma vanno affrontate all'inizio dell'incarico: scoprirle a trattativa avviata è ciò che fa saltare i rogiti o costringe a rinegoziare il prezzo.",
      ]}
      priceTableTitle="Valori del venduto per strada"
      priceTableNote="Valori rilevati sul venduto reale seguito e monitorato dalla nostra agenzia, non su stime da portale. Il valore ricorrente è quello a cui si chiude circa il 70% delle compravendite della strada; la punta massima è il valore più alto registrato. Per una stima riferita al tuo immobile serve un sopralluogo."
      priceTable={[
        { via: "Piazza San Domenico Maggiore", tipico: "2.610 €/mq", massimo: "2.954 €/mq" },
        { via: "Via San Gregorio Armeno", tipico: "2.335 €/mq", massimo: "2.791 €/mq" },
        { via: "Via Duomo", tipico: "1.734 €/mq", massimo: "3.070 €/mq" },
      ]}
      faq={[
        {
          q: "Quanto vale un appartamento nel Centro Storico di Napoli?",
          a: "Dipende molto dalla strada. Sul venduto che seguiamo, a Piazza San Domenico Maggiore circa il 70% delle compravendite si chiude intorno a 2.610 €/mq con punte fino a 2.954, in via San Gregorio Armeno intorno a 2.335 €/mq con punte fino a 2.791, in via Duomo intorno a 1.734 €/mq con punte fino a 3.070. Per una stima sul tuo immobile serve un sopralluogo: richiedi una valutazione gratuita.",
        },
        {
          q: "Perché in via Duomo la differenza tra valore ricorrente e massimo è così ampia?",
          a: "Perché via Duomo è un asse lungo che attraversa contesti molto diversi, e perché nel tessuto storico lo stato dell'immobile pesa moltissimo: un piano alto ristrutturato in un palazzo d'epoca ben tenuto e un immobile da rimettere completamente a nuovo sulla stessa strada si collocano agli estremi opposti della forbice.",
        },
        {
          q: "Quali documenti servono per vendere casa nel Centro Storico?",
          a: "Oltre alla documentazione ordinaria (atto di provenienza, visure e planimetria catastale, APE), nel Centro Storico va verificata con particolare attenzione la conformità urbanistica e catastale, oltre all'eventuale presenza di vincoli di tutela sull'edificio. Ce ne occupiamo noi all'inizio dell'incarico, prima di mettere l'immobile sul mercato.",
        },
        {
          q: "Il Centro Storico è adatto per un investimento locativo?",
          a: "È una delle zone più richieste della città per centralità e attrattività turistica, ma è opportuno verificare la normativa comunale e condominiale aggiornata sugli affitti brevi prima di acquistare a scopo di investimento.",
        },
      ]}
      seo={{
        title: "Agenzia Immobiliare a Napoli, Centro Storico | FondoCasa Hub",
        description: "Compra o vendi casa nel Centro Storico di Napoli con FondoCasa Hub: 26 anni di esperienza e valori del venduto reale per strada. Richiedi una consulenza gratuita.",
      }}
    />
  );
}
