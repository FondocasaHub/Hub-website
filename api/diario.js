// Vercel Serverless Function — Chirone compila il diario giornaliero.
//
// L'agente scrive o detta com'è andata ("oggi 25 chiamate, 2 appuntamenti...").
// Chirone legge il diario attuale e restituisce i NUOVI valori proposti, senza salvarli:
// il salvataggio lo fa l'app solo dopo la conferma dell'agente, con il suo token (regole RLS).
// Ogni richiesta conta nel limite giornaliero di Chirone e resta nel registro delle domande.
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { oggiRoma } from '../src/area-agenti/produttivita.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iymxkvrgkhfaqcyxjsyz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_NBu5yxfOtUSRW-ZYFL4JgQ_QBOxIVYT';
const MODELLO = 'claude-haiku-5-5';
const MAX_CARATTERI = 1500;
const NUMERI = ['contatti', 'appuntamenti', 'incarichi', 'visite', 'proposte', 'ore'];
const LIMITI = { contatti: 1000, appuntamenti: 100, incarichi: 100, visite: 100, proposte: 100, ore: 24 };
const LISTE = ['obiettivi', 'team', 'importanti', 'supporto', 'inderogabili', 'deleghe', 'richiamare'];

const anthropic = new Anthropic();

const STRUMENTO = {
  name: 'compila_diario',
  description: 'Restituisce il diario di oggi aggiornato con quello che ha detto il collaboratore.',
  input_schema: {
    type: 'object',
    properties: {
      contatti: { type: 'integer', description: 'Totale contatti di oggi (telefonate, porta a porta, conversazioni con potenziali clienti)' },
      appuntamenti: { type: 'integer', description: 'Totale appuntamenti di acquisizione di oggi' },
      incarichi: { type: 'integer', description: 'Totale incarichi firmati oggi' },
      visite: { type: 'integer', description: 'Totale visite con acquirenti di oggi' },
      proposte: { type: 'integer', description: 'Totale proposte raccolte oggi' },
      ore: { type: 'number', description: 'Totale ore lavorate oggi, a mezz\'ora' },
      focus: { type: 'string', description: 'Il focus di oggi: invariato se non ne parla' },
      aggiungi_liste: {
        type: 'object',
        description: 'Solo le NUOVE voci da aggiungere alle liste del piano, una frase breve per voce',
        properties: Object.fromEntries(LISTE.map((k) => [k, { type: 'array', items: { type: 'string' } }])),
      },
      riepilogo: { type: 'string', description: 'Una frase breve in italiano che riassume cosa cambia, rivolta al collaboratore (tu)' },
      dubbi: { type: 'string', description: 'Se qualcosa non è chiaro, la domanda da fare al collaboratore; altrimenti stringa vuota' },
    },
    required: [...NUMERI, 'focus', 'aggiungi_liste', 'riepilogo', 'dubbi'],
  },
};

function istruzioni(diario) {
  return `Sei Chirone, l'assistente HUB di FC Punto Hub. Aggiorni il diario giornaliero di un collaboratore
a partire da quello che ti scrive o ti detta. Restituisci SEMPRE il diario completo con lo strumento compila_diario.

DIARIO ATTUALE DI OGGI
${NUMERI.map((k) => `${k}: ${diario[k]}`).join('\n')}
focus: ${diario.focus || '(vuoto)'}

REGOLE
- I numeri che restituisci sono i TOTALI di oggi dopo l'aggiornamento.
- "Oggi ho fatto 25 chiamate" → contatti = 25 (è il totale). "Altre 5 chiamate", "ne ho fatte altre 3", "+5" → somma al valore attuale.
- Telefonate, chiamate, porta a porta e conversazioni con proprietari o potenziali clienti sono contatti.
- "Appuntamento" senza altro = appuntamento di acquisizione. "Ho portato un cliente a vedere casa" = visita.
- "Ho preso/firmato un incarico (in esclusiva)" = incarichi. "Ho raccolto un'offerta/proposta" = proposte.
- I campi di cui non parla restano uguali al diario attuale. Non inventare numeri.
- Nella lista "richiamare" scrivi solo il nome di riferimento, mai telefoni o email: i recapiti restano su Vendilo.
- Nelle liste niente dati sensibili dei clienti (salute, situazione economica, documenti).
- Se una frase è ambigua (per esempio non si capisce se un numero è il totale o un'aggiunta), lascia il valore attuale e scrivi la domanda in "dubbi".
- Se il messaggio non riguarda il diario, lascia tutto invariato e in "dubbi" spiega che qui si compila solo il diario e che per le altre domande c'è "Chiedi a Chirone".`;
}

function rispondi(res, status, corpo) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(corpo));
}

const intero = (v, max) => Math.min(max, Math.max(0, Math.round(Number(v) || 0)));
const mezzore = (v) => Math.min(24, Math.max(0, Math.round((Number(v) || 0) * 2) / 2));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return rispondi(res, 405, { errore: 'Metodo non consentito' });
  }
  const token = (req.headers.authorization || '').match(/^Bearer (.+)$/)?.[1];
  if (!token) return rispondi(res, 401, { errore: 'Accesso richiesto' });

  const testo = typeof req.body?.testo === 'string' ? req.body.testo.trim() : '';
  if (!testo || testo.length > MAX_CARATTERI) return rispondi(res, 400, { errore: 'Scrivi com\'è andata la giornata (massimo 1500 caratteri).' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: utente, error: erroreUtente } = await supabase.auth.getUser(token);
  if (erroreUtente || !utente?.user) return rispondi(res, 401, { errore: 'Accesso non valido' });

  const { data: profilo } = await supabase.from('profiles').select('id, ruolo, attivo').eq('id', utente.user.id).maybeSingle();
  if (!profilo?.attivo) return rispondi(res, 403, { errore: 'Account non attivo' });

  const oggi = oggiRoma();
  const { data: riga } = await supabase.from('produttivita_giorno').select('*').eq('user_id', profilo.id).eq('data', oggi).maybeSingle();
  const attuale = { contatti: 0, appuntamenti: 0, incarichi: 0, visite: 0, proposte: 0, ore: 0, focus: '', piano: {}, ...(riga || {}) };

  const { data: inizio, error: erroreInizio } = await supabase.rpc('assistente_inizia', { p_domanda: `[Diario] ${testo}` }).single();
  if (erroreInizio) {
    console.error('diario: registrazione', erroreInizio.message);
    return rispondi(res, 500, { errore: 'Servizio non disponibile' });
  }
  if (inizio.log_id === null) return rispondi(res, 429, { errore: 'Hai raggiunto il limite di 50 richieste a Chirone di oggi. Compila il diario a mano.' });

  let input;
  try {
    const risposta = await anthropic.messages.create({
      model: MODELLO,
      max_tokens: 1024,
      system: istruzioni(attuale),
      tools: [STRUMENTO],
      tool_choice: { type: 'tool', name: STRUMENTO.name },
      messages: [{ role: 'user', content: testo }],
    });
    input = risposta.content.find((b) => b.type === 'tool_use')?.input;
    if (!input) throw new Error('nessuna compilazione');
  } catch (e) {
    console.error('diario: Anthropic', e.status ?? '', e.message);
    await supabase.rpc('assistente_completa', { p_id: inizio.log_id, p_risposta: `Errore: ${String(e.message).slice(0, 200)}`, p_fonti: [], p_senza_fonte: true });
    return rispondi(res, 502, { errore: 'Chirone non è disponibile in questo momento. Compila il diario a mano o riprova tra poco.' });
  }

  const proposta = {};
  for (const k of NUMERI) proposta[k] = k === 'ore' ? mezzore(input[k] ?? attuale[k]) : intero(input[k] ?? attuale[k], LIMITI[k]);
  proposta.focus = String(input.focus ?? attuale.focus ?? '').slice(0, 300);
  const aggiungi = {};
  for (const k of LISTE) {
    const voci = Array.isArray(input.aggiungi_liste?.[k]) ? input.aggiungi_liste[k] : [];
    const pulite = voci.map((v) => String(v).trim().slice(0, 200)).filter(Boolean).slice(0, 10);
    if (pulite.length) aggiungi[k] = pulite;
  }
  const esito = {
    data: oggi,
    attuale: Object.fromEntries([...NUMERI, 'focus'].map((k) => [k, attuale[k]])),
    proposta,
    aggiungi_liste: aggiungi,
    riepilogo: String(input.riepilogo || '').slice(0, 400),
    dubbi: String(input.dubbi || '').slice(0, 400),
  };
  await supabase.rpc('assistente_completa', { p_id: inizio.log_id, p_risposta: JSON.stringify(esito), p_fonti: [], p_senza_fonte: false });
  return rispondi(res, 200, { ...esito, restanti: inizio.restanti });
}
