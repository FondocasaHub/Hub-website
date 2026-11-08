// Vercel Serverless Function — recensioni Google della scheda "Fc Punto Hub Napoli Vomero".
//
// Restituisce voto medio, numero totale di recensioni e le 5 più recenti, così la
// home e "Chi siamo" restano sempre aggiornate senza toccare il codice.
// Chiave: variabile d'ambiente GOOGLE_PLACES_API_KEY (mai nel client).
// Cache sulla CDN di Vercel: 6 ore, poi aggiornamento in background → poche
// chiamate al giorno a Google, ampiamente dentro la quota gratuita.
//
// Prova prima la Place Details "classica" (permette reviews_sort=newest = le ultime 5);
// se sul progetto Google è attiva solo la Places API (New), usa quella (5 recensioni
// scelte da Google, poi ordinate qui dalla più recente).

const PLACE_ID = process.env.GOOGLE_PLACE_ID || 'ChIJ9QSKiKcJOxMRO3--jorfbQw';
const LINK_TUTTE = `https://search.google.com/local/reviews?placeid=${PLACE_ID}`;
const LINK_SCRIVI = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;

// Recensioni lasciate da collaboratori e soci: non vanno mostrate come recensioni di clienti.
const ESCLUSI = (process.env.RECENSIONI_ESCLUSE || '')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

function iniziali(nome) {
  return (nome || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

async function daApiClassica(key) {
  const url = 'https://maps.googleapis.com/maps/api/place/details/json'
    + `?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews,url`
    + `&reviews_sort=newest&reviews_no_translations=true&language=it&key=${key}`;
  const r = await fetch(url);
  const d = await r.json();
  if (d.status !== 'OK') throw new Error(`Places classica: ${d.status} ${d.error_message || ''}`);
  const p = d.result;
  return {
    rating: p.rating,
    totale: p.user_ratings_total,
    recensioni: (p.reviews || []).map(x => ({
      nome: x.author_name,
      foto: x.profile_photo_url || null,
      rating: x.rating,
      testo: x.text || '',
      quando: x.relative_time_description,
      ts: x.time * 1000,
    })),
  };
}

async function daApiNuova(key) {
  const r = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=it`, {
    headers: {
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'rating,userRatingCount,reviews',
    },
  });
  const p = await r.json();
  if (!r.ok) throw new Error(`Places nuova: ${r.status} ${p.error?.message || ''}`);
  return {
    rating: p.rating,
    totale: p.userRatingCount,
    recensioni: (p.reviews || []).map(x => ({
      nome: x.authorAttribution?.displayName,
      foto: x.authorAttribution?.photoUri || null,
      rating: x.rating,
      testo: x.originalText?.text || x.text?.text || '',
      quando: x.relativePublishTimeDescription,
      ts: Date.parse(x.publishTime) || 0,
    })),
  };
}

export default async function handler(req, res) {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ errore: 'GOOGLE_PLACES_API_KEY non configurata' });
  }
  try {
    let dati;
    try {
      dati = await daApiClassica(key);
    } catch (e) {
      console.warn(e.message, '→ provo la Places API (New)');
      dati = await daApiNuova(key);
    }
    const recensioni = dati.recensioni
      .filter(x => !ESCLUSI.includes((x.nome || '').trim().toLowerCase()))
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 5)
      .map(x => ({ ...x, iniziali: iniziali(x.nome) }));

    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({
      rating: dati.rating,
      totale: dati.totale,
      recensioni,
      linkTutte: LINK_TUTTE,
      linkScrivi: LINK_SCRIVI,
      aggiornato: new Date().toISOString(),
    });
  } catch (e) {
    console.error('recensioni:', e.message);
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(502).json({ errore: 'Recensioni non disponibili' });
  }
}
