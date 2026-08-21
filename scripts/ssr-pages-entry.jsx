// Entry point bundlato con esbuild da scripts/prerender-ssr-pages.mjs (Node,
// non passa da Vite). Renderizza a stringa ciascuna pagina standalone SEO
// (landing di quartiere, strumento di valutazione, ecc.) e restituisce sia
// l'HTML del contenuto sia i tag <head> gestiti da Helmet, così
// scripts/prerender-ssr-pages.mjs può iniettarli nel template statico.
import React from "react";
import ReactDOMServer from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";

import AgenziaImmobiliareVomeroNapoli from "../src/pages/AgenziaImmobiliareVomeroNapoli.jsx";
import AgenziaImmobiliareArenellaNapoli from "../src/pages/AgenziaImmobiliareArenellaNapoli.jsx";
import AgenziaImmobiliareChiaiaNapoli from "../src/pages/AgenziaImmobiliareChiaiaNapoli.jsx";
import AgenziaImmobiliarePosillipoNapoli from "../src/pages/AgenziaImmobiliarePosillipoNapoli.jsx";
import AgenziaImmobiliareFuorigrottaNapoli from "../src/pages/AgenziaImmobiliareFuorigrottaNapoli.jsx";
import AgenziaImmobiliareColliAmineiNapoli from "../src/pages/AgenziaImmobiliareColliAmineiNapoli.jsx";
import AgenziaImmobiliareCentroStoricoNapoli from "../src/pages/AgenziaImmobiliareCentroStoricoNapoli.jsx";
import ValutaIlTuoImmobile from "../src/pages/ValutaIlTuoImmobile.jsx";

const PAGES = {
  "agenzia-immobiliare-vomero-napoli": AgenziaImmobiliareVomeroNapoli,
  "agenzia-immobiliare-arenella-napoli": AgenziaImmobiliareArenellaNapoli,
  "agenzia-immobiliare-chiaia-napoli": AgenziaImmobiliareChiaiaNapoli,
  "agenzia-immobiliare-posillipo-napoli": AgenziaImmobiliarePosillipoNapoli,
  "agenzia-immobiliare-fuorigrotta-napoli": AgenziaImmobiliareFuorigrottaNapoli,
  "agenzia-immobiliare-colli-aminei-napoli": AgenziaImmobiliareColliAmineiNapoli,
  "agenzia-immobiliare-centro-storico-napoli": AgenziaImmobiliareCentroStoricoNapoli,
  "valuta-il-tuo-immobile": ValutaIlTuoImmobile,
};

export function renderSsrPage(slug) {
  const Component = PAGES[slug];
  if (!Component) throw new Error(`Pagina SSR sconosciuta: ${slug}`);

  const helmetContext = {};
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(
      HelmetProvider,
      { context: helmetContext },
      React.createElement(Component)
    )
  );
  const { helmet } = helmetContext;

  return {
    contentHtml: html,
    title: helmet.title.toString(),
    meta: helmet.meta.toString(),
    link: helmet.link.toString(),
    script: helmet.script.toString(),
  };
}

export const SSR_PAGE_SLUGS = Object.keys(PAGES);
