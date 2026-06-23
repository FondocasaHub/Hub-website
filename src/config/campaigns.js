// Google Ads Campaigns Configuration - HUB Napoli
// Questo file contiene la struttura consigliata per le campagne

export const CAMPAIGNS_STRATEGY = {
  overview: {
    businessName: 'FondoCasa HUB',
    currency: 'EUR',
    timezone: 'Europe/Rome',
    country: 'IT',
    region: 'Campania',
    city: 'Napoli',
  },

  campaignTypes: {
    performanceMax: {
      name: 'Performance Max - Mix Audience',
      type: 'Performance Max',
      objective: 'Massimizzare conversioni',
      budget: 9, // EUR/giorno - 60% del budget totale
      bidStrategy: 'Maximize conversions',
      description: 'Campagna multicanale automatizzata per massimizzare i lead',
      audiences: [
        'Visitatori sito (ultimi 30 giorni)',
        'Utenti interessati a real estate Napoli',
        'Utenti 30-65 anni, reddito medio-alto',
      ],
      adFormats: ['Display', 'YouTube', 'Gmail', 'Search'],
      duration: 'Sempre attiva',
      notes: 'Lascia che Google ottimizzi autonomamente',
    },

    searchValutazione: {
      name: 'Search - Valutazione Immobiliare',
      type: 'Search',
      objective: 'Generare lead valutazione',
      budget: 0, // EUR/giorno - DISATTIVATA per ora (budget limitato)
      bidStrategy: 'Target CPA',
      targetCPA: 25, // EUR per contatto
      keywords: [
        'valutazione casa napoli',
        'vendi casa napoli',
        'stima immobile napoli',
        'quotazione casa napoli',
        'valutazione appartamento napoli',
      ],
      landingPage: 'https://fondocasahub.com/comincia',
      adHeadline1: 'Valutazione Casa Napoli Gratuita',
      adHeadline2: 'Risposta in 24 Ore',
      adDescription: 'Ricevi una stima precisa della tua casa. Senza compromessi. HUB Napoli.',
      conversionEvent: 'valutazione_immobiliare',
    },

    searchZeroVincoli: {
      name: 'Search - Zero Vincoli 60',
      type: 'Search',
      objective: 'Generare lead Zero Vincoli',
      budget: 6, // EUR/giorno - 40% del budget totale
      bidStrategy: 'Target CPA',
      targetCPA: 40, // EUR per contatto qualificato
      keywords: [
        'zero vincoli 60 napoli',
        'vendi casa 60 giorni',
        'vendi casa senza rischi',
        'zero rischi casa napoli',
        'mandato esclusivo napoli',
      ],
      landingPage: 'https://fondocasahub.com/zero-vincoli-60',
      adHeadline1: 'Zero Vincoli 60 - Vendi in 60 Giorni',
      adHeadline2: 'Nessun Rischio, Nessuna Penale',
      adDescription: 'Se non vendiamo entro 60 giorni, ti liberiamo gratis. Scopri come funziona.',
      conversionEvent: 'zero_vincoli_60',
    },

    remarketing: {
      name: 'Display - Remarketing',
      type: 'Display',
      objective: 'Retargeting visitatori',
      budget: 0, // EUR/giorno - DISATTIVATA (budget limitato - attivare quando budget > 50/giorno)
      bidStrategy: 'Target impression share',
      audiences: [
        {
          name: 'Visitatori sito (ultimi 30 giorni)',
          size: 'Piccola ma preziosa',
          messageA: 'Ricevi la tua valutazione gratuita',
          messageB: 'Zero Vincoli 60 - Nessun rischio',
        },
        {
          name: 'Visitatori /zero-vincoli-60 (ultimi 7 giorni)',
          size: 'Estremamente qualificata',
          message: 'Completa la richiesta - Ti aiutiamo in 24h',
        },
      ],
      duration: 'Sempre attiva',
      notes: 'Mostra annunci ai visitatori che non hanno convertito',
    },

    branding: {
      name: 'YouTube - Brand Awareness',
      type: 'YouTube',
      objective: 'Aumentare brand awareness',
      budget: 0, // EUR/giorno - DISATTIVATA (attivare quando budget > 50/giorno per brand building)
      bidStrategy: 'CPV (Cost Per View)',
      targetCPV: 0.10, // EUR per view
      videoLength: '15-30 secondi',
      targeting: [
        'Interessati a real estate',
        'Residenti Napoli',
        'Parole chiave: casa napoli, immobiliare, agenzia',
      ],
      conversionEvent: 'brand_engagement',
      notes: 'Obiettivo: riconoscimento brand FondoCasa HUB',
    },
  },

  utmParameters: {
    performanceMax: {
      source: 'google',
      medium: 'pmax',
      campaign: 'pmax-mixed-leads',
      content: 'performance-max',
    },
    searchValutazione: {
      source: 'google',
      medium: 'cpc',
      campaign: 'search-valutazione-immobiliare',
      content: 'lead-valutazione',
    },
    searchZeroVincoli: {
      source: 'google',
      medium: 'cpc',
      campaign: 'search-zero-vincoli-60',
      content: 'lead-zero-vincoli',
    },
    remarketing: {
      source: 'google',
      medium: 'display',
      campaign: 'display-remarketing',
      content: 'retargeting',
    },
    youtube: {
      source: 'google',
      medium: 'youtube',
      campaign: 'youtube-brand-awareness',
      content: 'brand-video',
    },
  },

  budgetAllocation: {
    totalDailyBudget: 15, // EUR/giorno - BUDGET OTTIMIZZATO
    distribution: {
      performanceMax: '60%', // 9 EUR/giorno - Principale
      searchZeroVincoli: '40%', // 6 EUR/giorno - Secondaria
      searchValutazione: '0%', // Non attiva per ora
      remarketing: '0%', // Non attiva per ora
      youtube: '0%', // Non attiva per ora
    },
    notes: 'Budget minimalista. Scalare a 30+ EUR/giorno quando CPA stabilizzato. Concentrato su 2 campagne ad alto rendimento.',
  },

  kpis: {
    primary: {
      conversions: 'Numero totale di lead generati',
      costPerLead: 'Budget / Conversioni',
      conversionRate: 'Conversioni / Clic',
    },
    secondary: {
      ctr: 'CTR (Click Through Rate)',
      impressions: 'Impressioni totali',
      avgCPC: 'Costo medio per clic',
    },
    target: {
      minConversionRate: 0.05, // 5%
      maxCostPerLead: 35, // EUR
      minROAS: 3.0, // 3x ritorno
    },
  },

  timeline: {
    phase1: {
      name: 'Setup & Test',
      duration: '1 settimana',
      actions: [
        'Crea 5 campagne',
        'Configura tracking completo',
        'Test form con GA4',
        'Verifica conversioni in Google Ads',
      ],
    },
    phase2: {
      name: 'Optimization',
      duration: '2-4 settimane',
      actions: [
        'Analizza performance dei dati',
        'Ottimizza bid strategy',
        'Aggiungi nuove parole chiave ad alto rendimento',
        'Refina audience targeting',
      ],
    },
    phase3: {
      name: 'Scale',
      duration: 'Continuo',
      actions: [
        'Aumenta budget campagne performer',
        'Espandi a nuovi audience',
        'Testa nuovi ad copy',
        'Monitora ROAS giornalmente',
      ],
    },
  },
};

export default CAMPAIGNS_STRATEGY;
