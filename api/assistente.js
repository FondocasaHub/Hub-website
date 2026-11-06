// Vercel Serverless Function — Chirone, l'assistente HUB dell'Area Agenti.
//
// Riceve la conversazione, verifica chi la invia, legge i documenti del suo ruolo
// e risponde in streaming (eventi "data: {...}").
// Sul database agisce sempre con il token dell'utente: sono le regole RLS a
// decidere quali documenti può leggere, e la chiave segreta di Supabase non serve.
// Chiave Anthropic: variabile d'ambiente ANTHROPIC_API_KEY, mai nel client.
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iymxkvrgkhfaqcyxjsyz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_NBu5yxfOtUSRW-ZYFL4JgQ_QBOxIVYT';
const MODELLO = 'claude-sonnet-5-5';
const MAX_MESSAGGI = 10;
const MAX_CARATTERI_DOMANDA = 2000;
const MAX_CARATTERI_MESSAGGIO = 12000;

const NOMI_RUOLO = {
  admin: 'Admin',
  manager: 'Manager',
  agente: 'Agente',
  credito: 'Consulente del credito',
  staff: 'Staff',
  'staff-marketing': 'Staff marketing',
  'staff-amministrazione': 'Staff amministrazione',
  'staff-property': 'Staff property',
};

const anthropic = new Anthropic();

function istruzioni(ruolo, documenti) {
  return `Sei Chirone, l'assistente HUB: il supporto interno per i collaboratori di FC Punto Hub
(FondoCasa Hub, Napoli Vomero). Rispondi in italiano, in modo breve e pratico:
passi numerati quando spieghi come usare uno strumento, testo pronto da copiare
quando fornisci un copione.

REGOLE
1. Rispondi SOLO in base ai documenti qui sotto. Alla fine di ogni risposta
   indica la fonte: "Fonte: <titolo documento>".
2. Se l'informazione non c'è, dillo chiaramente e suggerisci di chiedere
   al proprio team leader o allo store manager. Non inventare mai procedure,
   link, prezzi o percentuali.
3. Non dare consulenza su mutui, tassi o fattibilità di finanziamenti per
   clienti specifici: indirizza alla consulente del credito WeUnit.
4. Non fornire dati personali di clienti o colleghi.
5. Se la domanda riguarda un documento, indica in quale cartella dell'Area
   Agenti si trova.

Ruolo dell'utente: ${NOMI_RUOLO[ruolo]}

DOCUMENTI
${documenti}`;
}

// Il ruolo viene dal profilo sul database, mai dalla richiesta.
function chiaveRuolo(profilo) {
  if (profilo.ruolo !== 'staff') return profilo.ruolo;
  return profilo.reparto ? `staff-${profilo.reparto}` : 'staff';
}

// L'ordine fisso mantiene il testo identico tra una richiesta e l'altra: serve alla cache.
function formattaDocumenti(documenti) {
  return documenti
    .map((d) => `<documento>\nTitolo: ${d.titolo}\nAggiornato: ${d.aggiornato}\n\n${d.corpo}\n</documento>`)
    .join('\n\n');
}

// Tiene le ultime conversazioni valide: alternate, dalla domanda dell'utente in poi.
function leggiMessaggi(corpo) {
  const elenco = corpo?.messaggi;
  if (!Array.isArray(elenco) || elenco.length === 0) return null;
  for (const m of elenco) {
    if (!m || !['user', 'assistant'].includes(m.role)) return null;
    if (typeof m.content !== 'string' || !m.content.trim() || m.content.length > MAX_CARATTERI_MESSAGGIO) return null;
  }
  const ultimi = elenco.slice(-MAX_MESSAGGI);
  while (ultimi.length && ultimi[0].role !== 'user') ultimi.shift();
  if (!ultimi.length || ultimi.at(-1).role !== 'user') return null;
  if (ultimi.some((m, i) => i > 0 && m.role === ultimi[i - 1].role)) return null;
  if (ultimi.at(-1).content.length > MAX_CARATTERI_DOMANDA) return null;
  return ultimi.map((m) => ({ role: m.role, content: m.content }));
}

// Riconosce le fonti solo se corrispondono a un documento del ruolo.
function leggiFonti(risposta, titoli) {
  const pulisci = (t) => t.toLowerCase().replace(/["'“”«»*_]/g, '').replace(/[–—]/g, '-');
  const righe = risposta.split('\n').filter((r) => /^\W*font[ei]\W*:/i.test(r.trim())).map(pulisci);
  return titoli.filter((t) => righe.some((r) => r.includes(pulisci(t))));
}

function rispondi(res, status, corpo) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(corpo));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return rispondi(res, 405, { errore: 'Metodo non consentito' });
  }

  const token = (req.headers.authorization || '').match(/^Bearer (.+)$/)?.[1];
  if (!token) return rispondi(res, 401, { errore: 'Accesso richiesto' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: utente, error: erroreUtente } = await supabase.auth.getUser(token);
  if (erroreUtente || !utente?.user) return rispondi(res, 401, { errore: 'Accesso non valido' });

  const { data: profilo, error: erroreProfilo } = await supabase
    .from('profiles').select('ruolo, reparto, attivo').eq('id', utente.user.id).maybeSingle();
  if (erroreProfilo) {
    console.error('assistente: profilo', erroreProfilo.message);
    return rispondi(res, 500, { errore: 'Servizio non disponibile' });
  }
  if (!profilo?.attivo) return rispondi(res, 403, { errore: 'Account non attivo' });

  const messaggi = leggiMessaggi(req.body);
  if (!messaggi) return rispondi(res, 400, { errore: 'Richiesta non valida' });

  const chiave = chiaveRuolo(profilo);
  if (!Object.hasOwn(NOMI_RUOLO, chiave)) {
    console.error('assistente: ruolo sconosciuto', chiave);
    return rispondi(res, 500, { errore: 'Servizio non disponibile' });
  }

  const { data: documenti, error: erroreDocumenti } = await supabase
    .from('assistente_documenti').select('titolo, aggiornato, corpo').order('id');
  if (erroreDocumenti || !documenti?.length) {
    console.error('assistente: documenti', erroreDocumenti?.message ?? 'nessun documento');
    return rispondi(res, 500, { errore: 'Servizio non disponibile' });
  }
  const titoli = documenti.map((d) => d.titolo);

  const { data: inizio, error: erroreInizio } = await supabase
    .rpc('assistente_inizia', { p_domanda: messaggi.at(-1).content }).single();
  if (erroreInizio) {
    console.error('assistente: registrazione', erroreInizio.message);
    return rispondi(res, 500, { errore: 'Servizio non disponibile' });
  }
  if (inizio.log_id === null) {
    return rispondi(res, 429, { errore: 'Hai raggiunto il limite di 50 domande di oggi. Riprova domani.', restanti: 0 });
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Accel-Buffering', 'no');
  const invia = (evento) => res.write(`data: ${JSON.stringify(evento)}\n\n`);
  invia({ tipo: 'inizio', id: inizio.log_id, restanti: inizio.restanti });

  let risposta = '';
  let chiuso = false;
  const stream = anthropic.beta.messages.stream({
    model: MODELLO,
    max_tokens: 4096,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [{ type: 'text', text: istruzioni(chiave, formattaDocumenti(documenti)), cache_control: { type: 'ephemeral' } }],
    messages: messaggi,
  });
  res.on('close', () => {
    if (!res.writableEnded) {
      chiuso = true;
      stream.abort();
    }
  });

  let messaggioErrore = null;
  let dettaglioAdmin = null; // causa tecnica, mostrata solo all'admin per la diagnosi
  try {
    for await (const evento of stream) {
      if (evento.type === 'content_block_delta' && evento.delta.type === 'text_delta') {
        risposta += evento.delta.text;
        invia({ tipo: 'testo', testo: evento.delta.text });
      }
    }
    const finale = await stream.finalMessage();
    console.log('assistente: uso', JSON.stringify({
      ruolo: chiave,
      modello: finale.model,
      input: finale.usage.input_tokens,
      cache_lettura: finale.usage.cache_read_input_tokens,
      cache_scrittura: finale.usage.cache_creation_input_tokens,
      output: finale.usage.output_tokens,
    }));
    if (finale.stop_reason === 'refusal') {
      messaggioErrore = 'Non posso rispondere a questa domanda. Chiedi al tuo team leader o allo store manager.';
    } else if (finale.stop_reason === 'max_tokens') {
      messaggioErrore = 'La risposta è stata interrotta perché troppo lunga. Prova a fare una domanda più specifica.';
    }
  } catch (e) {
    if (!chiuso) {
      if (e instanceof Anthropic.RateLimitError) {
        messaggioErrore = 'Chirone è molto richiesto in questo momento. Riprova tra qualche minuto.';
      } else {
        messaggioErrore = 'Chirone non è disponibile in questo momento. Riprova tra poco.';
      }
      console.error('assistente: Anthropic', e.status ?? '', e.message);
      dettaglioAdmin = `${e.status ?? ''} ${e.error?.error?.type ?? e.name ?? ''} ${String(e.message ?? '').slice(0, 300)}`.trim();
    }
  }

  const fonti = leggiFonti(risposta, titoli);
  const senzaFonte = fonti.length === 0;
  const { error: erroreFine } = await supabase.rpc('assistente_completa', {
    p_id: inizio.log_id,
    p_risposta: risposta,
    p_fonti: fonti,
    p_senza_fonte: senzaFonte,
  });
  if (erroreFine) console.error('assistente: salvataggio', erroreFine.message);

  if (!chiuso) {
    if (messaggioErrore) {
      invia({ tipo: 'errore', messaggio: messaggioErrore, ...(profilo.ruolo === 'admin' && dettaglioAdmin ? { dettaglio: dettaglioAdmin } : {}) });
    }
    invia({ tipo: 'fine', id: inizio.log_id, fonti, senza_fonte: senzaFonte });
    res.end();
  }
}
