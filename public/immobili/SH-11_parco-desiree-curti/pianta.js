// Pianta dell'appartamento C ricalcata dalla planimetria (WhatsApp 26/10/2026), in metri.
// x = larghezza (0 = faccia esterna sinistra, 9,80 = destra), z = profondità (0 = fronte del balcone
// lungo, 11,43 = muro verso le scale). L'appartamento D è lo specchio di C oltre il vano scala (4,00 m).
// Muri: [x1, z1, x2, z2, spessore, [aperture come [da, a] lungo il muro]]. Nessuna misura è mostrata nel sito.
export const LARGHEZZA = 9.80, PROFONDITA = 11.43, SCALA = 4.00;

export const MURI = [
  // esterni
  [0, 0.195, 9.80, 0.195, 0.39, [[4.35, 5.15]]],                       // fronte, finestra del bagno
  [0.195, 0, 0.195, 11.43, 0.39, [[1.45, 2.75], [4.65, 5.95], [8.1, 9.4]]],  // lato sinistro, porte-finestre
  [9.605, 0, 9.605, 11.43, 0.39, [[1.75, 3.05], [5.1, 5.9], [8.1, 9.4]]],    // lato destro
  [0, 11.185, 9.80, 11.185, 0.49, [[4.15, 5.05]]],                      // verso le scale, porta d'ingresso
  // interni
  [3.715, 0.39, 3.715, 6.79, 0.15, [[2.95, 3.7], [4.05, 4.8]]],        // camere a sinistra / disimpegno
  [0.39, 3.89, 3.64, 3.89, 0.10, []],                                  // tra le due camere
  [0.39, 6.74, 4.2, 6.74, 0.10, []],                                   // camera / soggiorno
  [3.79, 2.71, 5.59, 2.71, 0.10, [[4.55, 5.3]]],                       // bagno piccolo
  [5.64, 0.39, 5.64, 6.51, 0.10, [[3.55, 4.3], [4.9, 5.65]]],          // camera e bagno a destra
  [5.69, 4.46, 9.41, 4.46, 0.10, []],                                  // camera / bagno
  [5.64, 6.585, 9.41, 6.585, 0.15, []]                                 // bagno / soggiorno
];

// balconi: [x1, z1, x2, z2] (lastra) e parapetti in vetro sui lati esterni
export const BALCONI = [
  [-1.40, 0.39, 0, 10.94],
  [9.80, -1.50, 11.30, 10.94],
  [3.64, -1.50, 9.80, 0]
];
export const PARAPETTI = [
  [-1.40, 0.39, -1.40, 10.94], [-1.40, 0.39, 0, 0.39], [-1.40, 10.94, 0, 10.94],
  [11.30, -1.50, 11.30, 10.94], [9.80, 10.94, 11.30, 10.94],
  [3.64, -1.50, 11.30, -1.50], [3.64, -1.50, 3.64, 0]
];

// vano scala tra C e D
export const SCALE = [3.64, 11.43, 6.90, 15.43];

// nomi delle stanze (centro) per la pianta
export const STANZE = [
  ['Cucina e soggiorno', 4.9, 8.8],
  ['Camera', 1.95, 2.1], ['Camera', 1.95, 5.3], ['Camera', 7.5, 2.4],
  ['Bagno', 4.7, 1.5], ['Bagno', 7.5, 5.5], ['Balcone', 10.55, 6.0]
];
