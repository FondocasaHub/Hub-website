export function buildQualificationPrompt(lead) {
  return `Sei un agente AI per HUB Napoli.
Ricevi i dati di un potenziale cliente e valuta la qualità del lead.
Rispondi con un JSON valido contenente:
- score: high | medium | low
- category: immobiliare | creditizio | assicurativo | altro
- reason: breve spiegazione
- action: follow_up | schedule_call | no_follow_up

Lead:
Nome: ${lead.name}
Email: ${lead.email}
Telefono: ${lead.phone}
Servizio richiesto: ${lead.service}
Messaggio: ${lead.message}
Consenso marketing: ${lead.consent}
Località: ${lead.location}
Budget/Urgenza: ${lead.budget}

Valuta se il lead è:
- presente in Napoli/Campania
- interessato a immobili o finanziamenti reali
- urgente o programmato
- coerente con i servizi di HUB

Rispondi solo con JSON.
`;
}

export function formatQualificationResult(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (error) {
    return {
      score: 'low',
      category: 'altro',
      reason: 'Risposta non valida dal modello',
      action: 'no_follow_up',
      raw: rawText,
    };
  }
}

export function buildLeadPayload(formData) {
  return {
    name: formData.name || formData.fullName || '',
    email: formData.email || '',
    phone: formData.phone || formData.telefono || '',
    service: formData.service || formData.servizio || 'generale',
    message: formData.message || formData.messaggio || '',
    consent: formData.consent || formData.marketingConsent || 'unknown',
    location: formData.location || formData.area || 'Napoli/Campania',
    budget: formData.budget || formData.budgetRange || 'non specificato',
  };
}
