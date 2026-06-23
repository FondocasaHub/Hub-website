import { GA4_EVENTS, GOOGLE_ADS_CONFIG } from '../config/tracking';

// Track GA4 Event
export const trackGA4Event = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// Track Google Ads Conversion
export const trackGoogleAdsConversion = (conversionType, value = null, currency = 'EUR') => {
  if (typeof window === 'undefined') return;

  const conversion = GOOGLE_ADS_CONFIG.conversions[conversionType];
  if (!conversion) {
    console.warn(`Conversion type "${conversionType}" not found in config`);
    return;
  }

  const gtag = window.gtag;
  if (!gtag) {
    console.warn('Google Ads gtag not loaded');
    return;
  }

  gtag('event', 'conversion', {
    allow_custom_scripts: true,
    send_to: conversion.label,
    value: value || conversion.value,
    currency: currency || conversion.currency,
  });
};

// Track Form Submit
export const trackFormSubmit = (formType) => {
  trackGA4Event(GA4_EVENTS.FORM_SUBMIT, {
    form_type: formType,
    timestamp: new Date().toISOString(),
  });

  // Track specific form type
  if (formType === 'valutazione_immobiliare') {
    trackGA4Event(GA4_EVENTS.VALUTAZIONE_REQUEST, {
      form_type: 'valutazione_immobiliare',
    });
    trackGoogleAdsConversion('valutazione_immobiliare');
  } else if (formType === 'zero_vincoli_60') {
    trackGA4Event(GA4_EVENTS.ZERO_VINCOLI_REQUEST, {
      form_type: 'zero_vincoli_60',
    });
    trackGoogleAdsConversion('zero_vincoli_60');
  }
};

// Track Page View
export const trackPageView = (pageName, pageTitle) => {
  trackGA4Event(GA4_EVENTS.PAGE_VIEW, {
    page_title: pageTitle,
    page_name: pageName,
    page_location: window.location.href,
    timestamp: new Date().toISOString(),
  });
};

// Track Lead Generation (for thank you page)
export const trackLeadGenerated = (leadType) => {
  trackGA4Event(GA4_EVENTS.LEAD_GENERATED, {
    lead_type: leadType,
    timestamp: new Date().toISOString(),
  });
};
