export async function sendEmailNotification(lead, qualification) {
  // TODO: implementa con SendGrid, Mailgun o SMTP
  // Esempio:
  // - email di benvenuto al lead
  // - email interna al team
  return {
    status: 'pending',
    channel: 'email',
    recipient: lead.email,
    subject: `Grazie ${lead.name}, la tua richiesta è stata ricevuta`,
  };
}

export async function sendWhatsAppNotification(lead, qualification) {
  // TODO: implementa con Twilio WhatsApp API o Meta Business API
  // Esempio:
  // - messaggio di conferma al cliente
  // - messaggio interno al team sales
  return {
    status: 'pending',
    channel: 'whatsapp',
    recipient: lead.phone,
    message: `Ciao ${lead.name}, grazie per aver contattato HUB. Ti rispondiamo a breve.`,
  };
}

export async function schedulePhoneFollowUp(lead, qualification) {
  // TODO: integra Calendly o un sistema di callback
  return {
    status: 'pending',
    channel: 'phone',
    phone: lead.phone,
    note: 'Invia promemoria di consulenza telefonica o link a calendario',
  };
}
