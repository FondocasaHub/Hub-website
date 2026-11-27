// Parco Desirée · la pianta che diventa palazzo, legata allo scroll (three.js r160)
import * as THREE from './vendor/three.module.min.js';
import { MURI, BALCONI, PARAPETTI, SCALE, STANZE, LARGHEZZA, PROFONDITA, SCALA } from './pianta.js';

const sezione = document.getElementById('storia');
const tela = document.getElementById('tela');
const D = window.DATI;
const euro = n => n.toLocaleString('it-IT') + ' €';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const tratto = (p, a, b) => clamp((p - a) / (b - a));
const morbido = t => t * t * (3 - 2 * t);

const ALTEZZA = 2.8, INTERPIANO = 3.15, SOLAIO = 0.3;
const TOTALE = PROFONDITA * 2 + SCALA;
const PIANI = D.palazzi[0].piani;
const DISTANZA_B = 22;                       // segnaposto: posizione del secondo palazzo
const telefono = () => innerWidth / innerHeight < 1;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: false });
} catch (e) {
  document.body.classList.add('senza-3d');
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const ombre = !matchMedia('(max-width: 900px)').matches;
renderer.shadowMap.enabled = ombre;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scena = new THREE.Scene();
const NOTTE = new THREE.Color('#0B1120');
scena.background = NOTTE;
scena.fog = new THREE.Fog(NOTTE, 130, 280);
const camera = new THREE.PerspectiveCamera(35, 1, 0.5, 400);

// luci calde come nei render
scena.add(new THREE.HemisphereLight('#c9d6ff', '#20263a', 0.9));
const sole = new THREE.DirectionalLight('#ffe2b8', 2.2);
sole.position.set(-30, 45, 25);
sole.castShadow = ombre;
sole.shadow.mapSize.set(2048, 2048);
Object.assign(sole.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, far: 140 });
scena.add(sole);

// materiali
const mMuro = new THREE.MeshStandardMaterial({ color: '#EDE7DE', roughness: .85 });
const mSolaio = new THREE.MeshStandardMaterial({ color: '#B9B4AC', roughness: .9 });
const mScale = new THREE.MeshStandardMaterial({ color: '#4A4F5E', roughness: .8 });
const mVetro = new THREE.MeshStandardMaterial({ color: '#9fc4e6', transparent: true, opacity: .28, roughness: .1 });
const mBordo = new THREE.LineBasicMaterial({ color: '#F2D7A2', transparent: true, opacity: .55 });
const mPianta = new THREE.LineBasicMaterial({ color: '#F2D7A2', transparent: true, opacity: 1 });

// da coordinate della pianta (appartamento C o D specchiato) a coordinate della scena
const punto = (x, z, specchio) => [x - LARGHEZZA / 2, (specchio ? TOTALE - z : z) - TOTALE / 2];

// un muro con le aperture diventa pezzi pieni
function pezzi([x1, z1, x2, z2, t, buchi]) {
  const lungo = Math.hypot(x2 - x1, z2 - z1), dx = (x2 - x1) / lungo, dz = (z2 - z1) / lungo;
  const base = x1 === x2 ? z1 : x1;
  const tagli = buchi.map(([a, b]) => [a - base, b - base]).sort((a, b) => a[0] - b[0]);
  const out = []; let da = 0;
  for (const [a, b] of tagli) { if (a > da) out.push([da, a]); da = Math.max(da, b); }
  if (da < lungo) out.push([da, lungo]);
  return out.map(([a, b]) => [x1 + dx * a, z1 + dz * a, x1 + dx * b, z1 + dz * b, t]);
}

function scatola(x1, z1, x2, z2, t, h, mat, specchio) {
  const [ax, az] = punto(x1, z1, specchio), [bx, bz] = punto(x2, z2, specchio);
  const lungo = Math.hypot(bx - ax, bz - az);
  const g = new THREE.BoxGeometry(lungo + (t > .05 ? t : 0), h, t);
  g.translate(0, h / 2, 0);
  const m = new THREE.Mesh(g, mat);
  m.position.set((ax + bx) / 2, 0, (az + bz) / 2);
  m.rotation.y = -Math.atan2(bz - az, bx - ax);
  m.castShadow = m.receiveShadow = ombre;
  return m;
}

// la pianta disegnata: contorni dei muri, nell'ordine in cui si disegnano
const segmenti = [];
for (const specchio of [false, true]) {
  for (const muro of MURI) for (const [x1, z1, x2, z2, t] of pezzi(muro)) {
    const along = x1 === x2 ? [t / 2, 0] : [0, t / 2];
    const a = [x1 - along[0], z1 - along[1]], b = [x2 - along[0], z2 - along[1]];
    const c = [x2 + along[0], z2 + along[1]], d = [x1 + along[0], z1 + along[1]];
    for (const [p, q] of [[a, b], [b, c], [c, d], [d, a]]) {
      const [px, pz] = punto(p[0], p[1], specchio), [qx, qz] = punto(q[0], q[1], specchio);
      segmenti.push(px, .03, pz, qx, .03, qz);
    }
  }
  for (const [x1, z1, x2, z2] of BALCONI) {
    const [ax, az] = punto(x1, z1, specchio), [bx, bz] = punto(x2, z2, specchio);
    segmenti.push(ax, .03, az, bx, .03, az, bx, .03, az, bx, .03, bz, bx, .03, bz, ax, .03, bz, ax, .03, bz, ax, .03, az);
  }
}
{
  const [ax, az] = punto(SCALE[0], SCALE[1]), [bx, bz] = punto(SCALE[2], SCALE[3]);
  segmenti.push(ax, .03, az, bx, .03, az, bx, .03, az, bx, .03, bz, bx, .03, bz, ax, .03, bz, ax, .03, bz, ax, .03, az);
}
const gPianta = new THREE.BufferGeometry();
gPianta.setAttribute('position', new THREE.Float32BufferAttribute(segmenti, 3));
const pianta = new THREE.LineSegments(gPianta, mPianta);
const nVertici = segmenti.length / 3;

// un piano: muri di C e D, vano scala, solaio, balconi e parapetti
function piano() {
  const g = new THREE.Group(), muri = new THREE.Group();
  for (const specchio of [false, true]) {
    for (const muro of MURI) for (const [x1, z1, x2, z2, t] of pezzi(muro)) {
      const m = scatola(x1, z1, x2, z2, t, ALTEZZA, mMuro, specchio);
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), mBordo));
      muri.add(m);
    }
    for (const [x1, z1, x2, z2] of BALCONI) {
      const [ax, az] = punto(x1, z1, specchio), [bx, bz] = punto(x2, z2, specchio);
      const s = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(bx - ax), .22, Math.abs(bz - az)), mSolaio);
      s.position.set((ax + bx) / 2, -.11, (az + bz) / 2);
      s.castShadow = s.receiveShadow = ombre;
      g.add(s);
    }
    for (const [x1, z1, x2, z2] of PARAPETTI) muri.add(scatola(x1, z1, x2, z2, .03, 1.05, mVetro, specchio));
  }
  const [sx1, sz1] = punto(SCALE[0], SCALE[1]), [sx2, sz2] = punto(SCALE[2], SCALE[3]);
  const vano = new THREE.Mesh(new THREE.BoxGeometry(sx2 - sx1, ALTEZZA, sz2 - sz1), mScale);
  vano.geometry.translate(0, ALTEZZA / 2, 0);
  vano.position.set((sx1 + sx2) / 2, 0, (sz1 + sz2) / 2);
  muri.add(vano);
  const solaio = new THREE.Mesh(new THREE.BoxGeometry(LARGHEZZA, SOLAIO, TOTALE), mSolaio);
  solaio.position.y = -SOLAIO / 2;
  solaio.receiveShadow = solaio.castShadow = ombre;
  g.add(solaio, muri);
  g.userData.muri = muri;
  return g;
}

function palazzo() {
  const g = new THREE.Group(), piani = [];
  for (let i = 0; i < PIANI; i++) { const p = piano(); p.position.y = i * INTERPIANO; g.add(p); piani.push(p); }
  const tetto = new THREE.Mesh(new THREE.BoxGeometry(LARGHEZZA + .4, SOLAIO, TOTALE + .4), mSolaio);
  tetto.position.y = PIANI * INTERPIANO - SOLAIO / 2;
  tetto.castShadow = ombre;
  g.add(tetto);
  g.userData = { piani, tetto };
  return g;
}

const A = palazzo(), B = palazzo();
B.position.x = DISTANZA_B;
scena.add(A, B, pianta);

const suolo = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: '#111829', roughness: 1 }));
suolo.rotation.x = -Math.PI / 2; suolo.position.y = -SOLAIO - .01;
suolo.receiveShadow = ombre;
const griglia = new THREE.GridHelper(400, 200, '#26304a', '#1a2236');
griglia.position.y = -SOLAIO;
scena.add(suolo, griglia);

// nomi delle stanze sopra la pianta (HTML)
const strato = document.getElementById('stanze');
const etichette = STANZE.map(([nome, x, z]) => {
  const el = document.createElement('span'); el.textContent = nome; strato.appendChild(el);
  const [px, pz] = punto(x, z); return { el, v: new THREE.Vector3(px, 0, pz) };
});

// inquadrature: [progresso, posizione, punto guardato]
// il tuffo finale: verso la porta-finestra del soggiorno all'ultimo piano del palazzo A, poi dentro
const [PX, PZ] = punto(0.195, 5.3), OCCHI = (PIANI - 1) * INTERPIANO + 1.5;
const TUFFO = [
  [.78, [PX - 8, OCCHI + .6, PZ], [PX + 6, OCCHI, PZ]],
  [.85, [PX + 1.2, OCCHI, PZ], [PX + 9, OCCHI, PZ]],
  [1, [PX + 1.6, OCCHI, PZ], [PX + 9, OCCHI, PZ]]
];
const ORIZZ = [
  [0, [-6, 40, 0], [0, 0, 0]], [.2, [-6, 38, 0], [0, 0, 0]],
  [.38, [-32, 22, 22], [0, 1.4, 0]], [.6, [-42, 27, 36], [0, 6, 0]],
  [.7, [-30, 32, 70], [DISTANZA_B / 2, 5, 0]], ...TUFFO
];
const VERT = [
  [0, [0, 58, 5], [0, 0, 0]], [.2, [0, 58, 5], [0, 0, 0]],
  [.38, [30, 34, 52], [0, 1, 0]], [.6, [40, 40, 78], [0, 5, 0]],
  [.7, [DISTANZA_B / 2, 70, 150], [DISTANZA_B / 2, 4, 0]], ...TUFFO
];
const pos = new THREE.Vector3(), guarda = new THREE.Vector3();
function inquadra(p) {
  const K = telefono() ? VERT : ORIZZ;
  let i = 0; while (i < K.length - 2 && p > K[i + 1][0]) i++;
  const [p0, a0, b0] = K[i], [p1, a1, b1] = K[i + 1];
  const t = morbido(tratto(p, p0, p1));
  pos.set(...a0).lerp(new THREE.Vector3(...a1), t);
  guarda.set(...b0).lerp(new THREE.Vector3(...b1), t);
  camera.position.copy(pos); camera.lookAt(guarda);
  // il modello si sposta per lasciare posto alla didascalia: a destra su schermo largo, in alto sul telefono
  const sposta = morbido(tratto(p, .2, .36)) * (1 - morbido(tratto(p, .66, .72))) * (telefono() ? .17 : .16);
  if (sposta > 0) camera.setViewOffset(innerWidth, innerHeight,
    telefono() ? 0 : -innerWidth * sposta, telefono() ? innerHeight * sposta : 0, innerWidth, innerHeight);
  else camera.clearViewOffset();
}

// testi e render sopra la scena
const didascalie = [...sezione.querySelectorAll('[data-da]')];
const soglia = document.getElementById('soglia');
const pianoTesto = document.getElementById('piano-testo');

function aggiorna(p) {
  // 1. la pianta si disegna, poi sbiadisce
  gPianta.setDrawRange(0, Math.floor(nVertici * morbido(tratto(p, .05, .22)) / 2) * 2);
  mPianta.opacity = 1 - tratto(p, .32, .42);
  // 2. i muri del primo piano si alzano
  const su = morbido(tratto(p, .22, .38));
  A.userData.piani[0].userData.muri.scale.y = Math.max(.001, su);
  A.userData.piani[0].userData.muri.visible = su > 0;
  A.userData.piani[0].children.forEach(c => { if (c !== A.userData.piani[0].userData.muri) c.visible = su > .02; });
  // 3. gli altri piani scendono dall'alto
  let pianoOra = 1;
  A.userData.piani.forEach((pi, i) => {
    if (i === 0) return;
    const t = morbido(tratto(p, .38 + (i - 1) * .065, .38 + i * .065));
    pi.visible = t > 0;
    pi.position.y = i * INTERPIANO + (1 - t) * 14;
    if (t > .5) pianoOra = i + 1;
  });
  A.userData.tetto.visible = tratto(p, .58, .6) > 0;
  pianoTesto.innerHTML = `${D.nomiPiano[pianoOra]} <em>${euro(D.prezzi[pianoOra])}</em>`;
  // 4. il secondo palazzo cresce
  const b = morbido(tratto(p, .6, .68));
  B.visible = b > 0; B.scale.y = Math.max(.001, b);
  // 5. stanze
  const vis = tratto(p, .14, .2) * (1 - tratto(p, .24, .3));
  strato.style.opacity = vis;
  if (vis > 0) etichette.forEach(({ el, v }) => {
    const s = v.clone().project(camera);
    el.style.transform = `translate(-50%, -50%) translate(${(s.x + 1) / 2 * innerWidth}px, ${(1 - s.y) / 2 * innerHeight}px)`;
  });
  // 6. entrando dalla porta-finestra la scena si schiarisce nella casa
  soglia.style.opacity = morbido(tratto(p, .79, .85));
  // didascalie
  didascalie.forEach(el => {
    const da = +el.dataset.da, a = +el.dataset.a;
    const o = Math.min(da <= 0 ? 1 : tratto(p, da, da + .03), 1 - tratto(p, a - .03, a));
    el.style.opacity = o; el.style.visibility = o > 0 ? 'visible' : 'hidden';
    el.style.transform = `translateY(${(1 - o) * 16}px)`;
  });
  inquadra(p);
}

function misura() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', misura);
misura();

let mira = 0, ora = 0, attivo = true;
const progresso = () => clamp((scrollY - sezione.offsetTop) / (sezione.offsetHeight - innerHeight));
new IntersectionObserver(([e]) => { attivo = e.isIntersecting; }).observe(sezione);
(function giro() {
  requestAnimationFrame(giro);
  if (!attivo) return;
  mira = progresso();
  ora += (mira - ora) * .12;
  if (Math.abs(mira - ora) < .0005) ora = mira;
  aggiorna(ora);
  if (+soglia.style.opacity < 1) renderer.render(scena, camera);
})();
document.body.classList.add('con-3d');
