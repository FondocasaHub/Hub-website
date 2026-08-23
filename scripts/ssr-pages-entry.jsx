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
import AgenziaImmobiliareSoccavoNapoli from "../src/pages/AgenziaImmobiliareSoccavoNapoli.jsx";

// Pagine di quartiere "storiche": a differenza delle landing
// agenzia-immobiliare-*, non usano Helmet e ricevono props da App.jsx
// (navigate + palette). In prerender le props le passa PAGE_PROPS qui sotto.
import VomeroPage from "../src/pages/VomeroPage.jsx";
import ChiaiaPage from "../src/pages/ChiaiaPage.jsx";
import PosillpoPage from "../src/pages/PosillpoPage.jsx";
import CentroStoricoPage from "../src/pages/CentroStoricoPage.jsx";
import { COLORS } from "../src/config/colors.js";

// La home vive dentro App.jsx (componente HomePage) e riceve le stesse props
// delle pagine quartiere: navigate + palette.
import { HomePage, ChiSiamoPage, CominciaQuiPage, ContactPage, CarrieraPage, Footer } from "../src/App.jsx";
import Costruttori from "../src/pages/Costruttori.jsx";
import ZeroVincoli60Page from "../src/ZeroVincoli60Page.jsx";
import ConsulenteMutuoNapoliPage from "../src/pages/ConsulenteMutuoNapoli.jsx";
import VendiCasaVomeroPage from "../src/pages/VendiCasaVomero.jsx";
import ValutaIlTuoImmobile from "../src/pages/ValutaIlTuoImmobile.jsx";

const PAGES = {
  "agenzia-immobiliare-vomero-napoli": AgenziaImmobiliareVomeroNapoli,
  "agenzia-immobiliare-arenella-napoli": AgenziaImmobiliareArenellaNapoli,
  "agenzia-immobiliare-chiaia-napoli": AgenziaImmobiliareChiaiaNapoli,
  "agenzia-immobiliare-posillipo-napoli": AgenziaImmobiliarePosillipoNapoli,
  "agenzia-immobiliare-fuorigrotta-napoli": AgenziaImmobiliareFuorigrottaNapoli,
  "agenzia-immobiliare-colli-aminei-napoli": AgenziaImmobiliareColliAmineiNapoli,
  "agenzia-immobiliare-centro-storico-napoli": AgenziaImmobiliareCentroStoricoNapoli,
  "agenzia-immobiliare-soccavo-napoli": AgenziaImmobiliareSoccavoNapoli,
  "valuta-il-tuo-immobile": ValutaIlTuoImmobile,
  "vomero": VomeroPage,
  "chiaia": ChiaiaPage,
  "posillipo": PosillpoPage,
  "centro-storico": CentroStoricoPage,
  "index": HomePage,
  "costruttori": Costruttori,
  "zero-vincoli-60": ZeroVincoli60Page,
  "consulente-mutuo-napoli": ConsulenteMutuoNapoliPage,
  "vendi-casa-vomero": VendiCasaVomeroPage,
  "chi-siamo": ChiSiamoPage,
  "comincia": CominciaQuiPage,
  "contatti": ContactPage,
  "lavora-con-noi": CarrieraPage,
};

// navigate() e' gestito da App.jsx lato client: in prerender e' un no-op,
// serve solo a non far esplodere il render degli onClick.
const noop = () => {};

// Le landing di quartiere hanno gia' un footer proprio: qui solo le altre.
const CON_FOOTER = new Set([
  'index', 'comincia', 'chi-siamo', 'contatti', 'lavora-con-noi',
  'vomero', 'chiaia', 'posillipo', 'centro-storico',
  'zero-vincoli-60', 'consulente-mutuo-napoli', 'vendi-casa-vomero',
  'costruttori', 'valuta-il-tuo-immobile',
]);
const PAGE_PROPS = {
  "vomero": { navigate: noop, colors: COLORS },
  "chiaia": { navigate: noop, colors: COLORS },
  "posillipo": { navigate: noop, colors: COLORS },
  "centro-storico": { navigate: noop, colors: COLORS },
  "index": { navigate: noop, colors: COLORS },
  // Costruttori non riceve props.
  "zero-vincoli-60": { navigate: noop, colors: COLORS },
  "consulente-mutuo-napoli": { navigate: noop, colors: COLORS },
  "vendi-casa-vomero": { navigate: noop, colors: COLORS },
  "chi-siamo": { colors: COLORS },
  "comincia": { colors: COLORS },
  "contatti": { navigate: noop, colors: COLORS },
  "lavora-con-noi": { colors: COLORS },
};

export function renderSsrPage(slug) {
  const Component = PAGES[slug];
  if (!Component) throw new Error(`Pagina SSR sconosciuta: ${slug}`);

  const helmetContext = {};
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(
      HelmetProvider,
      { context: helmetContext },
      React.createElement(
        React.Fragment,
        null,
        React.createElement(Component, PAGE_PROPS[slug] || undefined),
        CON_FOOTER.has(slug)
          ? React.createElement(Footer, { navigate: () => {}, colors: COLORS })
          : null,
      )
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
