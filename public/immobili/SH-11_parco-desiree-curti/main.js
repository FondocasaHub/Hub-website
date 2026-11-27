// Parco Desirée · landing bozza 4 (29/10/2026): dentro casa, cantiere dal vivo, finale, piani, capitolato, modulo.
// La scena 3D è in scena.js.
(() => {
  const D = window.DATI;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const euro = n => n.toLocaleString('it-IT') + ' €';
  const tra = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const largo = matchMedia('(min-width: 901px)');
  const sceltaApp = $('#scelta-app');
  $('#costruttore').textContent = D.costruttore;

  // piani: una facciata con i 4 livelli e il prezzo di ognuno (la divisione in palazzi e interni non è confermata)
  const livelli = Object.keys(D.prezzi).map(Number).sort((x, y) => y - x);
  $('#palazzi').innerHTML = `<div class="palazzo">${livelli.map(p =>
    `<button class="interno libero livello" data-piano="${p}"><span>${D.nomiPiano[p]}</span><b>${euro(D.prezzi[p])}</b></button>`).join('')}</div>`;
  livelli.slice().reverse().forEach(p => sceltaApp.insertAdjacentHTML('beforeend', `<option>${D.nomiPiano[p]} · ${euro(D.prezzi[p])}</option>`));
  const scheda = $('#scheda');
  const mostraPiano = p => {
    $$('.livello').forEach(b => b.classList.toggle('scelto', +b.dataset.piano === p));
    scheda.innerHTML = `
      <span class="etichetta">Parco Desirée · ${D.nomiPiano[p]}</span>
      <p class="titolo-scheda">${D.nomiPiano[p]}</p>
      <p class="prezzo-scheda">${euro(D.prezzi[p])}</p>
      <ul><li>Box auto e posto auto inclusi</li><li>Tripla esposizione</li><li>Classe energetica AA di progetto</li></ul>
      <p class="stato libero">Disponibile</p>
      <a class="bottone" href="#contatto" data-chiedi="${D.nomiPiano[p]} · ${euro(D.prezzi[p])}">Chiedi planimetrie e disponibilità</a>`;
  };
  $('#palazzi').addEventListener('click', e => { const b = e.target.closest('.livello'); if (b) mostraPiano(+b.dataset.piano); });
  scheda.addEventListener('click', e => { const b = e.target.closest('[data-chiedi]'); if (b) sceltaApp.value = b.dataset.chiedi; });
  mostraPiano(1);

  // com'è fatta
  $('#voci').innerHTML = D.voci.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('');

  // dentro casa: stanza (scorrendo sullo schermo largo, con le schede sul telefono), stile, confronto a tendina
  const vista = $('#vista'), destro = $('#lato-destro'), confronto = $('#confronto'), maniglia = $('#maniglia');
  const sezCasa = $('#casa'), sinistro = $('#cartellino-sinistro'), cartDestro = $('#cartellino-destro');
  let stanza = 0, stile = D.stili[0].id, altro = D.stili[1].id, taglio = 50;
  const src = (st, s) => `img/${D.stanze[st].foto[s]}${largo.matches ? '' : '-v'}.webp`;
  const nomeStile = id => D.stili.find(x => x.id === id).nome;
  const prossimo = id => D.stili[(D.stili.findIndex(x => x.id === id) + 1) % D.stili.length].id;

  $('#stili').innerHTML = D.stili.map(s => `<button role="radio" data-stile="${s.id}">${s.nome}</button>`).join('');
  $('#stanze-casa').innerHTML = D.stanze.map((s, i) => `<button role="tab" data-stanza="${i}">${s.nome}</button>`).join('');
  $('#scelta-stile').insertAdjacentHTML('beforeend', D.stili.map(s => `<option>${s.nome}</option>`).join(''));

  // ogni stanza ha le sue foto, una per stile, una sopra l'altra
  const caricaFoto = () => {
    vista.innerHTML = D.stanze.map((s, i) => D.stili.map(t =>
      `<img data-stanza="${i}" data-stile="${t.id}" src="${src(i, t.id)}" alt="${s.nome}, stile ${t.nome.toLowerCase()} (render)" ${i ? 'loading="lazy"' : ''}>`).join('')).join('');
  };
  const disegna = () => {
    $$('img', vista).forEach(img => img.classList.toggle('su', +img.dataset.stanza === stanza && img.dataset.stile === stile));
    $$('[data-stile]', $('#stili')).forEach(b => b.setAttribute('aria-checked', b.dataset.stile === stile));
    $$('[data-stanza]', $('#stanze-casa')).forEach(b => b.setAttribute('aria-selected', +b.dataset.stanza === stanza));
    const c = !confronto.hidden;
    sinistro.hidden = cartDestro.hidden = !c;
    if (c) {
      const s = src(stanza, altro);
      if (destro.dataset.src !== s) {
        destro.innerHTML = `<img src="${s}" alt="${D.stanze[stanza].nome}, stile ${nomeStile(altro).toLowerCase()} (render)">`;
        destro.dataset.src = s;
      }
      sinistro.textContent = nomeStile(stile) + ' ↻';
      cartDestro.textContent = nomeStile(altro) + ' ↻';
      destro.style.clipPath = `inset(0 0 0 ${taglio}%)`;
      maniglia.style.left = taglio + '%';
      maniglia.setAttribute('aria-valuenow', Math.round(taglio));
    }
  };
  caricaFoto();
  largo.addEventListener('change', () => { caricaFoto(); destro.dataset.src = ''; disegna(); });

  $('#stili').addEventListener('click', e => {
    const b = e.target.closest('[data-stile]'); if (!b) return;
    stile = b.dataset.stile; if (altro === stile) altro = prossimo(stile); disegna();
  });
  // aprendo il confronto la tendina si muove da sola una volta, per far capire che si trascina
  let animazione;
  const mostraTendina = () => {
    const t0 = performance.now(), dur = 1800;
    cancelAnimationFrame(animazione);
    const passo = t => {
      const k = Math.min(1, (t - t0) / dur);
      taglio = 50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k * .3);
      if (k === 1) taglio = 50;
      disegna();
      if (k < 1) animazione = requestAnimationFrame(passo);
    };
    animazione = requestAnimationFrame(passo);
  };
  $('#tasto-confronta').addEventListener('click', e => {
    confronto.hidden = !confronto.hidden;
    const aperto = !confronto.hidden;
    e.currentTarget.setAttribute('aria-pressed', aperto);
    e.currentTarget.innerHTML = aperto ? 'Chiudi il confronto' : '<span>⇆</span> Confronta due stili';
    sezCasa.classList.toggle('confrontando', aperto);
    $('#suggerimento').hidden = false;
    disegna();
    if (aperto) mostraTendina();
  });
  sezCasa.addEventListener('click', e => {
    const b = e.target.closest('[data-cambia]'); if (!b) return;
    if (b.dataset.cambia === 'altro') { altro = prossimo(altro); if (altro === stile) altro = prossimo(altro); }
    else { stile = prossimo(stile); if (stile === altro) stile = prossimo(stile); }
    disegna();
  });
  // la tendina si trascina col dito o col mouse in tutto il riquadro, o si sposta con le frecce
  const trascina = e => {
    const r = confronto.getBoundingClientRect();
    taglio = tra((e.clientX - r.left) / r.width * 100, 4, 96); disegna();
  };
  confronto.addEventListener('pointerdown', e => {
    cancelAnimationFrame(animazione);
    $('#suggerimento').hidden = true;
    confronto.setPointerCapture(e.pointerId);
    trascina(e);
    confronto.addEventListener('pointermove', trascina);
    confronto.addEventListener('pointerup', () => confronto.removeEventListener('pointermove', trascina), { once: true });
  });
  maniglia.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { taglio = tra(taglio + (e.key === 'ArrowLeft' ? -5 : 5), 4, 96); disegna(); }
  });
  // sullo schermo largo la stanza segue lo scroll; sul telefono si sceglie con le schede
  const versoStanza = i => {
    if (!largo.matches) { stanza = i; destro.dataset.src = ''; disegna(); return; }
    scrollTo({ top: sezCasa.offsetTop + (i + .5) / D.stanze.length * (sezCasa.offsetHeight - innerHeight), behavior: 'smooth' });
  };
  $('#stanze-casa').addEventListener('click', e => { const b = e.target.closest('[data-stanza]'); if (b) versoStanza(+b.dataset.stanza); });
  const seguiCasa = () => {
    if (!largo.matches) return;
    const p = (scrollY - sezCasa.offsetTop) / (sezCasa.offsetHeight - innerHeight);
    const s = tra(Math.floor(p * D.stanze.length), 0, D.stanze.length - 1);
    if (s !== stanza) { stanza = s; disegna(); }
  };
  addEventListener('scroll', seguiCasa, { passive: true });
  disegna();

  // il cantiere dal vivo: il volo del drone avanza con lo scroll (60 fotogrammi reali)
  const sezOggi = $('#oggi'), volo = $('#volo'), ctx = volo.getContext('2d'), frase = $('#frase-oggi');
  const N = 60, fotogrammi = new Array(N);
  const FRASI = [[0, 'Non è un render. È il cantiere vero.'], [.35, 'La struttura dei palazzi è completa.'], [.7, '16 appartamenti e un negozio. Permesso di costruire n. 7/2023.']];
  let ultimo = -1;
  const carica = i => {
    if (fotogrammi[i]) return;
    const im = new Image();
    im.src = `img/drone/d${String(i).padStart(3, '0')}.webp`;
    im.onload = () => { ultimo = -1; requestAnimationFrame(disegnaVolo); };
    fotogrammi[i] = im;
  };
  const attuale = () => Math.round(tra((scrollY - sezOggi.offsetTop) / (sezOggi.offsetHeight - innerHeight)) * (N - 1));
  const disegnaVolo = () => {
    const i = attuale();
    // il più vicino già caricato
    let k = i; for (let d = 0; d < N; d++) { if (fotogrammi[i - d]?.complete) { k = i - d; break; } if (fotogrammi[i + d]?.complete) { k = i + d; break; } }
    const im = fotogrammi[k];
    if (!im || !im.complete || (k === ultimo && volo.width === volo.clientWidth * devicePixelRatio)) return;
    const w = volo.width = volo.clientWidth * devicePixelRatio, h = volo.height = volo.clientHeight * devicePixelRatio;
    if (w > h) {
      // schermo largo: il video verticale intero a destra, il testo a sinistra
      const s = h / im.naturalHeight, iw = im.naturalWidth * s, x = Math.min(w - iw - w * .06, w * .62 - iw / 2);
      ctx.fillStyle = '#0B1120'; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(im, x, 0, iw, h);
    } else {
      const s = Math.max(w / im.naturalWidth, h / im.naturalHeight);
      ctx.drawImage(im, (w - im.naturalWidth * s) / 2, (h - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
    }
    ultimo = k;
    const p = i / (N - 1);
    const f = FRASI.filter(([da]) => p >= da).pop()[1];
    if (frase.textContent !== f) frase.textContent = f;
  };
  // prima uno ogni 6, poi tutti, quando la sezione si avvicina
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    for (let i = 0; i < N; i += 6) carica(i);
    setTimeout(() => { for (let i = 0; i < N; i++) carica(i); }, 400);
    o.disconnect();
  }, { rootMargin: '150% 0px' }).observe(sezOggi);
  addEventListener('scroll', () => requestAnimationFrame(disegnaVolo), { passive: true });
  addEventListener('resize', () => { ultimo = -1; disegnaVolo(); });

  // fuori: il render di giorno diventa sera scorrendo
  const sezFine = $('#fine'), giorno = $('#render-giorno'), notte = $('#render-notte'), cosi = $('#cosi'), finale = $('#finale');
  const seguiFine = () => {
    const p = tra((scrollY - sezFine.offsetTop + innerHeight * .4) / (sezFine.offsetHeight - innerHeight * .6));
    giorno.style.opacity = tra(p * 4);
    notte.style.opacity = tra((p - .45) * 4);
    cosi.style.opacity = tra(p * 4) * (1 - tra((p - .35) * 6));
    finale.style.opacity = tra((p - .6) * 5);
    finale.style.visibility = cosi.style.visibility = 'visible';
  };
  addEventListener('scroll', seguiFine, { passive: true }); seguiFine();

  // modulo: invio al webhook n8n dei contatti degli immobili (come gli altri siti FC), senza cambiare pagina
  const q = new URLSearchParams(location.search);
  const modulo = $('#modulo'), esito = $('#esito'), f = modulo.elements;
  const metti = () => {
    $('#fonte').value = q.get('utm_source') || 'diretto';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => { f[k].value = (q.get(k) || '').slice(0, 150); });
  };
  metti();
  modulo.addEventListener('submit', async e => {
    e.preventDefault();
    if (!modulo.checkValidity()) { modulo.reportValidity(); return; }
    const v = Object.fromEntries(new FormData(modulo));
    if (v['indirizzo-web']) { esito.textContent = 'Grazie! Ti richiamiamo noi per fissare la visita.'; return; } // trappola per i robot
    delete v['indirizzo-web'];
    // chi chiede la visita di un cantiere è un acquirente: tiepido (non c'è la domanda «quando vuoi comprare»)
    v.categoria = 'ACQUIRENTE 🟠 TIEPIDO';
    v.temperatura = '🟠 TIEPIDO';
    v.oggetto = `${v.categoria} | ${v.nome} · Parco Desirée, via Aurora, Curti`;
    v.pagina = location.origin + location.pathname;
    v.inviato_il = new Date().toISOString();
    const bottone = $('button[type=submit]', modulo);
    bottone.disabled = true; esito.textContent = 'Invio…';
    try {
      const r = await fetch('https://n8n.sensoriaspace.com/webhook/lead-immobili', { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(v).toString() });
      if (!r.ok) throw new Error(r.status);
      modulo.reset(); metti();
      esito.textContent = 'Grazie! Ti richiamiamo noi per fissare la visita.';
      // misurazione (Tag Manager e Google Ads del sito FC): mai nome o telefono; non deve mai bloccare il modulo
      try {
        (window.dataLayer = window.dataLayer || []).push({ event: 'lead_immobile', immobile: 'SH-11', tipo: 'cantiere', categoria: v.categoria, temperatura: v.temperatura, stato: v.stato });
        if (typeof gtag === 'function') gtag('event', 'generate_lead', { lead_source: 'sito_immobile', item_id: 'SH-11' });
      } catch (e2) { /* niente */ }
    } catch {
      esito.textContent = 'Non siamo riusciti a inviare. Riprova o scrivici su WhatsApp al 081 18653202.';
    }
    bottone.disabled = false;
  });

  // barra piena dopo il racconto; "Scorri" sparisce al primo scroll
  const barra = $('.barra'), storia = $('#storia');
  const segna = () => {
    barra.classList.toggle('piena', scrollY > storia.offsetTop + storia.offsetHeight - innerHeight - 10);
    document.body.classList.toggle('scorso', scrollY > 40);
  };
  addEventListener('scroll', segna, { passive: true }); segna();
})();
