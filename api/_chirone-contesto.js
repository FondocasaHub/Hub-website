// Contesto personale di Chirone: agenda, obiettivi, diario, immobili e (per i manager) il team.
// Legge con il token dell'utente: vede solo quello che le regole RLS gli permettono.
// Il file inizia con "_" perché Vercel non lo pubblichi come funzione a sé.
import { calcolaObiettivi, totali, oggiRoma, lunedi, piuGiorni, LISTE_PIANO } from '../src/area-agenti/produttivita.js';
import { avvisiImmobile, sonoBuyer } from '../src/area-agenti/immobili.js';
import { riepilogoPercorso, TIPI_PERCORSO, giorniPercorso, allarmiPercorso } from '../src/area-agenti/percorsi.js';
import { soggettoCancello, caricaStati, riepilogoCancello } from '../src/area-agenti/cancello-regole.js';

const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const uno = (v) => Math.round((Number(v) || 0) * 10) / 10;

function giorniLavorati(dal, al) {
  let c = 0;
  for (let d = dal; d <= al; d = piuGiorni(d, 1)) {
    const g = new Date(`${d}T12:00:00Z`).getUTCDay();
    if (g >= 1 && g <= 5) c++;
  }
  return c;
}

async function sezioneProduttivita(supabase, profilo, oggi) {
  const inizioMese = `${oggi.slice(0, 8)}01`;
  const dal = [inizioMese, lunedi(oggi)].sort()[0];
  const [{ data: ob }, { data: giorni }] = await Promise.all([
    supabase.from('produttivita_obiettivi').select('*').eq('user_id', profilo.id).maybeSingle(),
    supabase.from('produttivita_giorno').select('*').eq('user_id', profilo.id).gte('data', dal).order('data'),
  ]);
  const calc = calcolaObiettivi(ob || {});
  const g = calc.giorno;
  const righe = [];
  righe.push(ob
    ? `Obiettivi personali: ${Math.round(calc.anno.fatturato)} € di provvigioni l'anno → ${g.contatti} contatti al giorno, ${uno(calc.settimana.appuntamenti)} appuntamenti di acquisizione a settimana, ${uno(calc.mese.incarichi)} incarichi al mese, ${uno(calc.anno.vendite)} vendite l'anno.`
    : `Obiettivi personali non ancora impostati in "La mia giornata": valgono i minimi dell'Hub (${g.contatti} contatti al giorno).`);

  const diario = (giorni || []).find((x) => x.data === oggi);
  if (diario) {
    righe.push(`Diario di oggi: ${diario.contatti}/${g.contatti} contatti, ${diario.appuntamenti} appuntamenti, ${diario.incarichi} incarichi, ${diario.visite} visite, ${diario.proposte} proposte, ${uno(diario.ore)} ore.`);
    if (diario.focus) righe.push(`Focus di oggi: ${diario.focus}`);
    for (const [k, etichetta] of LISTE_PIANO) {
      const voci = (diario.piano?.[k] || []).map((v) => String(v).trim()).filter(Boolean);
      if (voci.length) righe.push(`${etichetta}: ${voci.join('; ')}`);
    }
  } else {
    righe.push('Diario di oggi non ancora compilato.');
  }

  const sett = totali((giorni || []).filter((x) => x.data >= lunedi(oggi)));
  const mese = totali((giorni || []).filter((x) => x.data >= inizioMese));
  const gs = giorniLavorati(lunedi(oggi), oggi);
  const gm = giorniLavorati(inizioMese, oggi);
  righe.push(`Settimana (da lunedì, ${gs} giorni lavorativi, ${sett.giorni} compilati): ${sett.contatti}/${g.contatti * gs} contatti, ${sett.appuntamenti}/${uno(g.appuntamenti * gs)} appuntamenti, ${sett.incarichi} incarichi, ${sett.proposte} proposte.`);
  righe.push(`Mese (${gm} giorni lavorativi, ${mese.giorni} compilati): ${mese.contatti}/${g.contatti * gm} contatti, ${mese.appuntamenti}/${uno(g.appuntamenti * gm)} appuntamenti, ${mese.incarichi}/${uno(calc.mese.incarichi)} incarichi.`);
  return righe;
}

async function sezioneImmobili(supabase, profilo, oggi, gestore) {
  const { data: immobili } = await supabase.from('immobili')
    .select('id, riferimento_vendilo, indirizzo, zona, tipologia, stato, team, listing_id, buyer_id, consulente_credito_id, data_acquisizione, data_sopralluogo_marketing, data_open_house')
    .in('stato', ['attivo', 'in trattativa']).order('data_acquisizione', { ascending: false }).limit(40);
  const buyer = sonoBuyer(profilo);
  const miei = (immobili || []).filter((i) => gestore || i.listing_id === profilo.id || i.consulente_credito_id === profilo.id
    || (buyer && i.team === profilo.team));
  if (!miei.length) return ['Nessun immobile attivo assegnato.'];

  const ids = miei.map((i) => i.id);
  const [att, kpi, doc, pub] = await Promise.all([
    supabase.from('attivita_immobile').select('immobile_id, codice_attivita, completata').in('immobile_id', ids),
    supabase.from('kpi_immobile').select('*').in('immobile_id', ids),
    supabase.from('documenti_immobile').select('immobile_id, tipo').in('immobile_id', ids),
    supabase.from('pubblicazioni').select('immobile_id, data').in('immobile_id', ids).gte('data', piuGiorni(oggi, -2)),
  ]);
  const per = (r, id) => (r.data || []).filter((x) => x.immobile_id === id);
  const righe = [];
  for (const i of miei) {
    const ruolo = [i.listing_id === profilo.id && 'Listing', buyer && i.team === profilo.team && 'Buyer', i.consulente_credito_id === profilo.id && 'Credito']
      .filter(Boolean).join('/') || (gestore ? 'supervisione' : '');
    const avvisi = avvisiImmobile({ immobile: i, attivita: per(att, i.id), kpi: per(kpi, i.id), documenti: per(doc, i.id), pubblicazioni: per(pub, i.id) }, oggi);
    const testoAvvisi = avvisi.length ? avvisi.map((a) => `${a.grave ? '[GRAVE] ' : ''}${a.testo}`).join('; ') : 'nessun avviso';
    righe.push(`- ${i.riferimento_vendilo} · ${i.indirizzo}${i.zona ? ` (${i.zona})` : ''} · ${i.team} · ${i.stato} · ruolo: ${ruolo} · acquisito ${i.data_acquisizione}${i.data_open_house ? ` · Open House ${i.data_open_house}` : ''} · avvisi: ${testoAvvisi}`);
  }
  return righe;
}

async function sezionePercorso(supabase, profilo, oggi) {
  const { data: p } = await supabase.from('percorsi_inserimento').select('*')
    .eq('user_id', profilo.id).eq('stato', 'in corso').maybeSingle();
  if (!p) return null;
  const { data: diario } = await supabase.from('produttivita_giorno')
    .select('data, contatti, appuntamenti, incarichi, visite, proposte').eq('user_id', profilo.id).gte('data', p.data_inizio);
  return riepilogoPercorso(p, diario || [], oggi);
}

async function sezionePercorsiTeam(supabase, oggi) {
  const { data: lista } = await supabase.from('percorsi_inserimento').select('*').eq('stato', 'in corso');
  if (!lista?.length) return null;
  const { data: nomi } = await supabase.rpc('produttivita_team', { p_dal: oggi });
  const nome = Object.fromEntries((nomi || []).map((t) => [t.user_id, t.nome]));
  const dal = lista.map((p) => p.data_inizio).sort()[0];
  const { data: diari } = await supabase.from('produttivita_giorno')
    .select('user_id, data, contatti, appuntamenti, incarichi, visite, proposte').in('user_id', lista.map((p) => p.user_id)).gte('data', dal);
  return lista.map((p) => {
    const { cal } = giorniPercorso(p.data_inizio, oggi);
    const all = allarmiPercorso(p, (diari || []).filter((d) => d.user_id === p.user_id && d.data >= p.data_inizio), oggi);
    return `- ${nome[p.user_id] || 'collaboratore'}: ${TIPI_PERCORSO[p.tipo]}, giorno ${cal} di 90, fase approvata ${p.fase_approvata}. ${all.length ? `Allarmi: ${all.map((a) => a.testo).join(' ')}` : 'In linea.'}`;
  });
}

async function sezioneCancelloTeam(supabase, oggi) {
  const { data: persone, error } = await supabase.rpc('cancello_team');
  if (error) throw new Error(error.message);
  if (!persone?.length) return ['Nessun collaboratore soggetto al cancello.'];
  const stati = await caricaStati(supabase, persone, oggi);
  return persone.map((p) => {
    const s = stati[p.id];
    const briefing = !s.lavorativoOggi ? 'giorno non lavorativo' : s.briefing ? 'briefing confermato' : 'briefing NON confermato';
    const st = s.bloccato ? `BLOCCATO (${s.mancanze.length} mancanze: ${s.mancanze.map((m) => m.testo).join('; ')})`
      : s.sbloccato ? `sbloccato oggi dal Team Manager (${s.sbloccoMotivo})` : s.mancanze.length ? `${s.mancanze.length} da completare` : 'in regola';
    return `- ${p.nome || 'collaboratore'}: ${briefing}, ${st}, ${s.compiti.length} compiti assegnati aperti`;
  });
}

async function sezioneTeam(supabase, oggi) {
  const { data: team } = await supabase.rpc('produttivita_team', { p_dal: lunedi(oggi) });
  if (!team?.length) return ['Nessun dato del team.'];
  const gs = giorniLavorati(lunedi(oggi), oggi);
  return team.map((t) => {
    const ob = calcolaObiettivi(t.obiettivo_annuo ? t : {}).giorno.contatti * gs;
    return `- ${t.nome || 'senza nome'} (${t.team || '—'}): ${t.giorni}/${gs} giorni compilati, ${t.contatti}/${ob} contatti, ${t.appuntamenti} appuntamenti, ${t.incarichi} incarichi, ${t.proposte} proposte, ${uno(t.ore)} ore`;
  });
}

export async function contestoPersonale(supabase, profilo) {
  const oggi = oggiRoma();
  const giorno = GIORNI[new Date(`${oggi}T12:00:00Z`).getUTCDay()];
  const blocchi = [
    `Oggi è ${giorno} ${oggi}.`,
    `Utente: ${profilo.nome || 'senza nome'} · ruolo ${profilo.ruolo}${profilo.livello ? ` · livello ${profilo.livello}` : ''}${profilo.team ? ` · ${profilo.team}` : ''}${(profilo.ruoli_extra || []).length ? ` · anche ${profilo.ruoli_extra.join(', ')}` : ''}.`,
  ];
  const gestore = profilo.ruolo === 'manager' || profilo.ruolo === 'admin';
  const prova = async (titolo, fn) => {
    try { blocchi.push(`\n${titolo}\n${(await fn()).join('\n')}`); }
    catch (e) { console.error('assistente: contesto', titolo, e.message); blocchi.push(`\n${titolo}\nDati non disponibili in questo momento.`); }
  };
  if (['agente', 'manager', 'admin', 'credito'].includes(profilo.ruolo)) await prova('PRODUTTIVITÀ', () => sezioneProduttivita(supabase, profilo, oggi));
  try {
    const mio = await sezionePercorso(supabase, profilo, oggi);
    if (mio) blocchi.push(`\nIL MIO PERCORSO DI INSERIMENTO (90 giorni)\n${mio.join('\n')}`);
  } catch (e) { console.error('assistente: percorso', e.message); }
  if (soggettoCancello(profilo)) await prova('CANCELLO GIORNALIERO (briefing e compiti obbligatori)', async () => riepilogoCancello((await caricaStati(supabase, [profilo], oggi))[profilo.id]));
  if (gestore) await prova('CANCELLO GIORNALIERO DEL TEAM', () => sezioneCancelloTeam(supabase, oggi));
  if (profilo.ruolo === 'manager' || profilo.ruolo === 'admin') {
    try {
      const team = await sezionePercorsiTeam(supabase, oggi);
      if (team) blocchi.push(`\nPERCORSI DI INSERIMENTO DEL TEAM\n${team.join('\n')}`);
    } catch (e) { console.error('assistente: percorsi team', e.message); }
  }
  if (profilo.ruolo !== 'staff') await prova(gestore ? 'IMMOBILI DEL TEAM' : 'I MIEI IMMOBILI', () => sezioneImmobili(supabase, profilo, oggi, gestore));
  if (gestore) await prova(profilo.ruolo === 'admin' ? 'TEAM (tutti, questa settimana)' : 'IL MIO TEAM (questa settimana)', () => sezioneTeam(supabase, oggi));
  return blocchi.join('\n');
}
