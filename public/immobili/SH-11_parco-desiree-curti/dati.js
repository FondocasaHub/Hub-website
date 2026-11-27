// Parco Desirée · dati della landing. Ogni dato ha la fonte; verifica: true = segnaposto o da confermare.
window.DATI = {
  nome: 'Parco Desirée',                                   // insegna nei render
  luogo: 'Curti (CE) · via Aurora',                         // capitolato p1 (GRP p7 scrive "Autora": refuso)
  consegna: { testo: 'dicembre 2027', verifica: false },     // GRP p7: 31/12/2027; capitolato p12: 36 mesi dall'inizio delle strutture
  // prezzi per piano (Jgio 29/10, pomeriggio); il 4° piano è l'attico
  prezzi: { 1: 220000, 2: 225000, 3: 230000, 4: 300000 },
  nomiPiano: { 1: '1° piano', 2: '2° piano', 3: '3° piano', 4: 'Attico' },
  inclusi: 'box auto e posto auto inclusi',                 // Jgio 29/10
  // 16 appartamenti + 1 negozio (capitolato art. 1). Divisione in 2 palazzi × 4 piani × 2: segnaposto
  palazzi: [
    { nome: 'Palazzo A', piani: 4, verifica: false },
    { nome: 'Palazzo B', piani: 4, verifica: false }
  ],
  // com'è fatta: dal capitolato opere e finiture (materiali/capitolato-2026-cavasso.pdf)
  voci: [
    ['Cappotto termico', 'Pareti esterne in blocchi Alveolater con cappotto; tra un appartamento e l\'altro parete da 35 cm, isolamento acustico 50 dB.'],
    ['Silenzio tra i piani', 'Taglio acustico sotto i pavimenti e massetto isolante contro i rumori di calpestio.'],
    ['Infissi in PVC', 'Tipo Salamander, ad alte prestazioni termiche, con tapparelle in alluminio motorizzate.'],
    ['Porta blindata classe 3', 'Antieffrazione, isolata termicamente e acusticamente.'],
    ['Riscaldamento autonomo', 'Caldaia a condensazione, cronotermostato con controllo da remoto, termoarredo nei bagni.'],
    ['Pronta per il fotovoltaico', 'Spazio sul tetto per 3 kW per ogni appartamento e predisposizione dei condizionatori in ogni stanza.'],
    ['Ascensore e videocitofono', 'Predisposizione per l\'antifurto, cancello automatico.'],
    ['Pavimenti a scelta', 'Gres porcellanato da almeno 3 campioni; altre finiture, come il parquet, pagando la differenza.']
  ],
  // stato per interno ("A-2-1" = palazzo A, 2° piano, primo appartamento): libero | opzionato | venduto
  stato: {},                                                // Jgio 29/10: tutti liberi
  plus: ['Classe AA', 'Tripla esposizione', 'Box auto e posto auto', 'Parco comune'], // Nico 29/10
  // dentro casa: per ogni stanza la stessa inquadratura nei 3 stili. Stile a = render Blocco A;
  // b e c generati con Nano Banana Pro il 29/10 (cantiere/higgsfield/PROMPT.md), ritagliati da allinea_stili.py
  stili: [
    { id: 'a', nome: 'Gres grigio' },
    { id: 'b', nome: 'Parquet' },
    { id: 'c', nome: 'Pietra chiara' }
  ],
  stanze: [
    { nome: 'Soggiorno', foto: { a: 'casa-soggiorno-a', b: 'casa-soggiorno-b', c: 'casa-soggiorno-c' } },
    { nome: 'Camera', foto: { a: 'casa-camera-a', b: 'casa-camera-b', c: 'casa-camera-c' } },
    { nome: 'Bagno', foto: { a: 'casa-bagno-a', b: 'casa-bagno-b', c: 'casa-bagno-c' } }
  ],
  costruttore: 'PSG Immobiliare srl',                     // capitolato p1; ok di Jgio a mostrarlo (29/10)
  agenzia: {
    nome: 'FCpuntoHUB',
    ragione: 'FC PUNTO HUB SRL',
    indirizzo: 'Via Pietro Mascagni 35, Napoli',
    piva: '01924140096',
    orari: 'lun–ven 9–19 · sab 9:30–13'
  }
};
