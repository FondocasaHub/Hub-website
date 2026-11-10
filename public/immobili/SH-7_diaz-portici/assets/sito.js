// Modello unico dei siti degli immobili FCpuntoHUB · comportamenti comuni (barra, galleria, confronti, mappa, modulo).
// La configurazione della pagina sta in dati.js (window.DATI), scritto da costruisci.py. Nessuna risorsa esterna.
(() => {
  const D = window.DATI || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const tra = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  /* ---------- barra, WhatsApp fisso, «Scorri» ---------- */
  // l'ultimo tratto legato allo scroll (la villa che si rifà, o il racconto del volo); se non c'è, la prima schermata
  const eroe = [$('#storia'), $('#lavori')].filter(Boolean).pop() || $('.apertura');
  const barra = $('.barra');
  const segna = () => {
    if (!eroe) return;
    // racconto legato allo scroll: barra piena e WhatsApp fisso dopo il racconto; apertura con foto: dopo il primo schermo
    const scorr = !!eroe.id, fine = eroe.offsetTop + eroe.offsetHeight;
    barra.classList.toggle('piena', scrollY > (scorr ? fine - innerHeight - 10 : fine - 80));
    document.body.classList.toggle('oltre', scrollY > (scorr ? fine - innerHeight * .5 : fine * .5));
    document.body.classList.toggle('scorso', scrollY > 40);
    segnale(scorr);
  };
  // barra di avanzamento e pillola «Scorri»: negli ultimi schermi del racconto la pillola passa a «ecco le specifiche»
  const avanza = $('.avanza i'), continua = $('.continua');
  const segnale = scorr => {
    const tot = document.documentElement.scrollHeight - innerHeight;
    if (avanza) avanza.style.transform = `scaleX(${tot > 0 ? tra(scrollY / tot) : 0})`;
    if (continua && scorr) continua.classList.toggle('quasi', scrollY > eroe.offsetTop + eroe.offsetHeight - innerHeight * 2.4);
  };
  if (continua) continua.addEventListener('click', () => scrollBy({ top: innerHeight * .8, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
  addEventListener('scroll', segna, { passive: true }); addEventListener('resize', segna); segna();

  /* ---------- apertura sul telefono: il volo parte solo se si vede ---------- */
  const volo = $('.apertura-volo');
  if (volo && getComputedStyle(volo).display !== 'none' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    volo.preload = 'auto';
    volo.play().catch(() => {});
  }

  /* ---------- comparsa delle sezioni ---------- */
  $$('main .sezione > *').forEach(el => el.classList.add('compare'));
  if ('IntersectionObserver' in window) {
    const osserva = new IntersectionObserver(voci => voci.forEach(v => {
      if (v.isIntersecting) { v.target.classList.add('visto'); osserva.unobserve(v.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    $$('.compare').forEach(el => osserva.observe(el));
  } else $$('.compare').forEach(el => el.classList.add('visto'));

  /* ---------- galleria con filtri e ingrandimento ---------- */
  const griglia = $('#griglia'), filtri = $('#filtri'), lente = $('#lente');
  if (griglia) {
    if (filtri) filtri.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', filtri).forEach(x => x.setAttribute('aria-selected', x === b));
      $$('figure', griglia).forEach(f => { f.hidden = b.dataset.gruppo !== '' && f.dataset.gruppo !== b.dataset.gruppo; });
    });
    griglia.addEventListener('click', e => {
      const f = e.target.closest('figure'); if (!f || !lente.showModal) return;
      const img = $('img', lente);
      img.src = f.dataset.xl || $('img', f).src; img.alt = $('img', f).alt;
      lente.showModal();
    });
    if (lente) lente.addEventListener('click', () => lente.close());
  }

  /* ---------- prima e dopo (cursore) ---------- */
  const pd = $('#prima-dopo-cornice');
  if (pd && D.prima_dopo) {
    const cursore = $('input', pd), prima = $('.prima', pd), dopo = $('.dopo', pd);
    cursore.addEventListener('input', () => pd.style.setProperty('--x', cursore.value + '%'));
    $$('#prima-dopo-scelte button').forEach((b, i) => b.addEventListener('click', () => {
      $$('#prima-dopo-scelte button').forEach(x => x.setAttribute('aria-selected', x === b));
      const c = D.prima_dopo[i];
      prima.src = c.prima; prima.alt = c.alt_prima; dopo.src = c.dopo; dopo.alt = c.alt_dopo;
    }));
  }

  /* ---------- varianti (tendina tra la simulazione e l'idea) ---------- */
  const varSez = $('#varianti');
  if (varSez && D.varianti && D.varianti.length) {
    const scelte = $('#varianti-scelte'), sx = $('#varianti-sinistra'), dx = $('#varianti-destra'), conf = $('#varianti-confronto'), man = $('#maniglia');
    let taglio = 50;
    const metti = i => {
      const u = D.varianti[i];
      sx.innerHTML = `<img src="${u.prima}" alt="${u.alt_prima}">`;
      dx.innerHTML = `<img src="${u.dopo}" alt="${u.alt_dopo}">`;
      $$('button', scelte).forEach((b, k) => b.setAttribute('aria-selected', k === i));
    };
    const taglia = () => { dx.style.clipPath = `inset(0 0 0 ${taglio}%)`; man.style.left = taglio + '%'; man.setAttribute('aria-valuenow', Math.round(taglio)); };
    scelte.addEventListener('click', e => { const b = e.target.closest('button'); if (b) metti($$('button', scelte).indexOf(b)); });
    const trascina = e => { const r = conf.getBoundingClientRect(); taglio = tra((e.clientX - r.left) / r.width * 100, 3, 97); taglia(); };
    conf.addEventListener('pointerdown', e => {
      conf.setPointerCapture(e.pointerId); trascina(e);
      conf.addEventListener('pointermove', trascina);
      conf.addEventListener('pointerup', () => conf.removeEventListener('pointermove', trascina), { once: true });
    });
    man.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { taglio = tra(taglio + (e.key === 'ArrowLeft' ? -5 : 5), 3, 97); taglia(); }
    });
    metti(0); taglia();
  }

  /* ---------- mappa e collegamenti ---------- */
  const lista = $('#luoghi');
  if (window.L && $('#mappa') && D.posizione) {
    const C = D.collegamenti || {}, luoghi = C.luoghi || [];
    const mappa = L.map('mappa', { scrollWheelZoom: false, attributionControl: C.mappa !== 'schema' });
    if (C.mappa !== 'schema') {
      // l'unica richiesta di rete della pagina oltre al modulo: le immagini della mappa (OpenStreetMap)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mappa);
    }
    const icona = cls => L.divIcon({ className: '', html: `<div class="pin ${cls}"></div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
    const casa = [D.posizione.lat, D.posizione.lon];
    L.marker(casa, { icon: icona('casa'), zIndexOffset: 1000 })
      .bindTooltip(D.posizione.etichetta || 'L\'immobile', { permanent: true, direction: 'top', offset: [0, -16] }).addTo(mappa);
    const segni = luoghi.map(l => {
      if (C.mappa === 'schema') L.polyline([casa, [l.lat, l.lon]], { color: '#F2D7A2', weight: 1.5, opacity: .45, dashArray: '4 6' }).addTo(mappa);
      return L.marker([l.lat, l.lon], { icon: icona('') }).bindTooltip(l.nome, { direction: 'top', offset: [0, -10] }).addTo(mappa);
    });
    mappa.fitBounds(L.latLngBounds([casa, ...luoghi.map(l => [l.lat, l.lon])]).pad(.08));
    if (lista) lista.addEventListener('click', e => {
      const li = e.target.closest('li'); if (!li) return;
      $$('li', lista).forEach(x => x.classList.toggle('attivo', x === li));
      const s = segni[+li.dataset.i]; if (!s) return;
      mappa.flyTo(s.getLatLng(), C.mappa === 'schema' ? mappa.getZoom() : 16, { duration: .8 });
      s.openTooltip();
    });
  }

  /* ---------- WhatsApp: bottone, numero nel piè di pagina, bottone fisso ---------- */
  if (D.contatto) {
    const wa = `https://wa.me/${D.contatto.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(D.contatto.messaggio || '')}`;
    $$('[data-wa]').forEach(a => { a.href = wa; });
  }

  /* ---------- modulo ---------- */
  const modulo = $('#modulo');
  if (modulo && D.modulo) {
    const M = D.modulo, f = modulo.elements, esito = $('.esito', modulo);
    const ICONA = { caldo: '🔴 CALDO', tiepido: '🟠 TIEPIDO', freddo: '🔵 FREDDO' }, GRADO = { caldo: 3, tiepido: 2, freddo: 1 };
    // UTM nascosti: li legge dall'indirizzo con cui si è arrivati (reel, storia, annuncio)
    const q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => { if (f[k]) f[k].value = (q.get(k) || '').slice(0, 150); });
    // «Entro quanto devi vendere?» compare (ed è obbligatoria) solo se deve anche vendere
    const entro = $('#entro');
    modulo.addEventListener('change', e => {
      if (e.target.name !== 'vendere') return;
      entro.hidden = e.target.value !== 'si';
      $('input', entro).required = !entro.hidden;
      if (entro.hidden) $$('input', entro).forEach(i => { i.checked = false; });
    });
    modulo.addEventListener('submit', async e => {
      e.preventDefault();
      if (!modulo.checkValidity()) { modulo.reportValidity(); return; }
      const v = Object.fromEntries(new FormData(modulo));
      delete v['indirizzo-web'];
      // categoria e temperatura (regole di via Redi/de Matha, in dati.json → modulo.regole): chi deve anche vendere è una COMPRAVENDITA
      const cat = [];
      if (v.vendere === 'si') cat.push(['COMPRAVENDITA', M.regole.vendita[v.entro_vendita] || 'freddo']);
      let base = M.categoria;
      const qual = (M.extra || []).find(c => c.categoria);
      if (qual) {
        const o = (qual.opzioni || []).find(x => x[0] === v[qual.nome]);
        if (o) base = `${o[2] || M.categoria} (${o[1].toLowerCase()})`;
      }
      cat.push([base, M.regole.quando[v.quando] || 'freddo']);
      const top = cat.reduce((m, [, t]) => (GRADO[t] > GRADO[m] ? t : m), 'freddo');
      v.categoria = cat.map(([k, t]) => `${k} ${ICONA[t]}`).join(' · ');
      v.temperatura = ICONA[top];
      v.compravendita = v.vendere === 'si' ? ICONA[cat[0][1]] : '';
      v.oggetto = `${v.vendere === 'si' ? '⭐ ' : ''}${v.categoria} | ${v.nome} · ${M.oggetto}`;
      v.fonte = v.utm_source || 'diretto';
      v.pagina = location.origin + location.pathname;
      v.inviato_il = new Date().toISOString();
      const bottone = $('button[type=submit]', modulo);
      bottone.disabled = true;
      esito.textContent = 'Invio in corso…';
      // indirizzo segnaposto (.invalid) o vuoto: modalità prova, non parte niente
      if (!M.webhook || /\.invalid(\/|:|$)/.test(M.webhook)) {
        console.info('[modulo in prova: non inviato]', v);
        esito.textContent = 'Modulo in prova: l\'indirizzo del webhook non è ancora collegato, non è stato inviato niente.';
        bottone.disabled = false;
        return;
      }
      try {
        const r = await fetch(M.webhook, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(v).toString() });
        if (!r.ok) throw new Error(r.status);
        modulo.classList.add('inviato');
        esito.textContent = M.messaggio_ok;
        // misurazione sul sito FC (dove ci sono Tag Manager e Google Ads): evento «lead_immobile» sul dataLayer, generate_lead e, se Jgio ha creato
        // la conversione «lead immobili» in Google Ads, la conversione (D.tracciamento.ads_conversione). Mai nome o telefono. Altrove sono no-op.
        try {
          (window.dataLayer = window.dataLayer || []).push({ event: 'lead_immobile', immobile: D.codice, tipo: D.tipo, categoria: v.categoria, temperatura: v.temperatura, stato: v.stato });
          if (typeof gtag === 'function') {
            gtag('event', 'generate_lead', { lead_source: 'sito_immobile', item_id: D.codice });
            if (D.tracciamento && D.tracciamento.ads_conversione) gtag('event', 'conversion', { send_to: D.tracciamento.ads_conversione });
          }
        } catch (e) { /* la misurazione non deve mai bloccare il modulo */ }
      } catch {
        bottone.disabled = false;
        esito.textContent = 'Non siamo riusciti a inviare il modulo. Riprova tra poco o scrivici su WhatsApp.';
      }
    });
  }
})();
