// Google Analytics 4 Configuration
export const GA4_ID = 'G-KF0WC9R6H0';

// Google Ads Configuration
export const GOOGLE_ADS_CONFIG = {
  customerID: '8316922963', // Senza "AW-"
  conversions: {
    valutazione_immobiliare: {
      label: 'AW-8316922963/lead-da-chiamata',
      value: 50, // Valore in EUR (contatto generico)
      currency: 'EUR',
    },
    zero_vincoli_60: {
      label: 'AW-8316922963/lead-da-chiamata',
      value: 100, // Valore in EUR (lead qualificato)
      currency: 'EUR',
    },
  },
};

// Event Names for GA4
export const GA4_EVENTS = {
  LEAD_GENERATED: 'generate_lead',
  FORM_SUBMIT: 'form_submit',
  PAGE_VIEW: 'page_view',
  VALUTAZIONE_REQUEST: 'valutazione_immobiliare_request',
  ZERO_VINCOLI_REQUEST: 'zero_vincoli_60_request',
};
