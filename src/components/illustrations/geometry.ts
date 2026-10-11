/**
 * Reine Geometrie der Motive (keine React-Abhängigkeit). Wird von den
 * SVG-Komponenten und von den Bild-Routen (Favicon, Link-Vorschau) genutzt,
 * damit alle Darstellungen dieselbe Zeichnung verwenden.
 *
 * Alle Werte werden einmalig beim Laden des Moduls berechnet (deterministisch).
 */

export type Pt = readonly [number, number];

const DEG = Math.PI / 180;

/** Auf 2 Nachkommastellen runden (kompakte Pfade, stabile SSR-Ausgabe). */
export function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function fmt(p: Pt): string {
  return `${r2(p[0])} ${r2(p[1])}`;
}

export function add(a: Pt, b: Pt): Pt {
  return [a[0] + b[0], a[1] + b[1]];
}

export function sub(a: Pt, b: Pt): Pt {
  return [a[0] - b[0], a[1] - b[1]];
}

export function mul(a: Pt, k: number): Pt {
  return [a[0] * k, a[1] * k];
}

export function len(a: Pt): number {
  return Math.hypot(a[0], a[1]);
}

export function norm(a: Pt): Pt {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
}

/** Dreht einen Vektor um `deg` Grad (im SVG-Koordinatensystem: positiv = im Uhrzeigersinn). */
export function rot(a: Pt, deg: number): Pt {
  const c = Math.cos(deg * DEG);
  const s = Math.sin(deg * DEG);
  return [a[0] * c - a[1] * s, a[0] * s + a[1] * c];
}

export function angleOf(a: Pt): number {
  return Math.atan2(a[1], a[0]) / DEG;
}

export function quadPoint(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
}

export function quadTangent(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  return [2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]), 2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1])];
}

export function cubicPoint(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

/** Wendet eine 2D-Transformation (a b c d e f wie SVG matrix()) auf einen Punkt an. */
export type Matrix = readonly [number, number, number, number, number, number];

export function apply(m: Matrix, p: Pt): Pt {
  return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
}

/* ==========================================================================
   E1 Eukalyptus-Zweig „Silberdollar“, viewBox 0 0 120 240
   ========================================================================== */

export const EUCA_STEM = 'M60 238 C58 196 64 160 60 124 C57 96 60 62 68 8';
export const EUCA_FOOT: Pt = [60, 238];

const EUCA_SEGMENTS: [Pt, Pt, Pt, Pt][] = [
  [
    [60, 238],
    [58, 196],
    [64, 160],
    [60, 124],
  ],
  [
    [60, 124],
    [57, 96],
    [60, 62],
    [68, 8],
  ],
];

/** Fein abgetastete Punkte des Stiels (von unten nach oben). */
const EUCA_SAMPLES: Pt[] = (() => {
  const pts: Pt[] = [];
  for (const seg of EUCA_SEGMENTS) {
    for (let i = 0; i <= 120; i++) pts.push(cubicPoint(seg[0], seg[1], seg[2], seg[3], i / 120));
  }
  return pts;
})();

/** Punkt auf dem Stiel auf Höhe y. */
export function eucaStemAt(y: number): Pt {
  let best = EUCA_SAMPLES[0];
  for (const p of EUCA_SAMPLES) if (Math.abs(p[1] - y) < Math.abs(best[1] - y)) best = p;
  return best;
}

export interface EucaLeaf {
  /** Index 0–8 (Blatt 1–9 der Tabelle) */
  i: number;
  cx: number;
  cy: number;
  r: number;
  side: 'L' | 'R';
  opacity: number;
  /** Blattform (leicht eiförmig, Grund zum Stiel, Spitze nach außen) */
  shape: string;
  /** Blattstiel-Ansatz am Stiel (Ursprung für Animation) */
  origin: Pt;
  /** Blattgrund (stielseitiger Blattrand) */
  base: Pt;
  petiole: string;
  midrib: string;
}

const EUCA_TABLE: [number, number, number, 'L' | 'R', number][] = [
  [37, 206, 17, 'L', 0.9],
  [83, 184, 16, 'R', 0.6],
  [39, 160, 15, 'L', 0.9],
  [81, 138, 14, 'R', 0.6],
  [40, 112, 13, 'L', 0.9],
  [77, 90, 12, 'R', 0.6],
  [44, 68, 10.5, 'L', 0.9],
  [75, 48, 9, 'R', 0.6],
  [55, 24, 7, 'L', 0.9],
];

/** Kleine, feste Abweichungen der Blattwinkel – wirkt handgezeichnet statt gestempelt. */
const EUCA_JITTER = [-3, 4, 2, -4, 4, -2, -5, 3, 2];

/**
 * Blattform in lokalen Koordinaten (Einheit r): Grund bei u = −1, Spitze bei u = +1,
 * Breite ±0.88 (ry = 0.88 r). Zum Grund hin minimal schlanker, die obere Hälfte
 * eine Spur voller – ein Silberdollar-Blatt statt einer exakten Ellipse.
 */
const LEAF_SHAPE: [number, number][][] = [
  [[-1, 0]],
  [
    [-1, -0.47],
    [-0.58, -0.9],
    [0.04, -0.9],
  ],
  [
    [0.64, -0.9],
    [1, -0.52],
    [1, 0],
  ],
  [
    [1, 0.5],
    [0.62, 0.86],
    [0.04, 0.86],
  ],
  [
    [-0.56, 0.86],
    [-1, 0.45],
    [-1, 0],
  ],
];

export function leafPath(c: Pt, r: number, angle: number): string {
  const to = ([u, v]: [number, number]) => fmt(add(c, rot([u * r, v * r], angle)));
  const [m, ...curves] = LEAF_SHAPE;
  return `M${to(m[0])}${curves.map((seg) => `C${seg.map(to).join(' ')}`).join('')}Z`;
}

export const EUCA_LEAVES: EucaLeaf[] = EUCA_TABLE.map(([lx, ly, r, side, opacity], i) => {
  const c: Pt = [lx, ly];
  // Längsachse vom Stiel weg: links 30° (+180°), rechts −30° (laut Bauanleitung ±30°)
  const angle = (side === 'L' ? 210 : -30) + EUCA_JITTER[i];
  const away = rot([1, 0], angle);
  const base = add(c, mul(away, -r * 0.94));
  // Ansatz am Stiel etwas unterhalb des Blattgrunds → Blattstiel zeigt schräg nach oben.
  const origin = eucaStemAt(base[1] + 1.5 + r * 0.16);
  const mid = mul(add(origin, base), 0.5);
  const petiole = `M${fmt(origin)}Q${fmt(add(mid, [0, 1]))} ${fmt(base)}`;
  // Mittelrippe: vom Blattgrund durch den Mittelpunkt bis 70 % des Durchmessers, leicht gebogen.
  const local = (u: number, v: number) => add(c, rot([u * r, v * r], angle));
  const bend = side === 'L' ? 0.07 : -0.07;
  const midrib = `M${fmt(local(-0.8, 0))}Q${fmt(local(-0.15, bend))} ${fmt(local(0.4, bend * 0.6))}`;
  return { i, cx: lx, cy: ly, r, side, opacity, shape: leafPath(c, r, angle), origin, base, petiole, midrib };
});

/** Knospe an der Stielspitze (68, 8) als schmaler Tropfen in Stielrichtung. */
export const EUCA_BUD = (() => {
  const dir = norm([8, -54]);
  const b = sub([68, 8], mul(dir, 0.6));
  const at = (u: number, v: number) => fmt(add(b, add(mul(dir, u), mul(rot(dir, 90), v))));
  return `M${at(0, 0)}C${at(0.6, -2.7)} ${at(4.6, -2.5)} ${at(8.4, 0)}C${at(4.6, 2.5)} ${at(0.6, 2.7)} ${at(0, 0)}Z`;
})();

/* ==========================================================================
   E2 Eck-Bouquet, viewBox 0 0 300 300 – drei E1-Instanzen + Pampas
   ========================================================================== */

export interface BouquetBranch {
  key: string;
  scale: number;
  rotate: number;
  /** Blätter (Index), die entfallen: der Fuß bleibt kahl, damit sich nichts stapelt. */
  skip: number[];
  /** Phasenversatz des Wiegens in s */
  swayDelay: number;
}

/**
 * Ursprung und Zweig C weichen leicht von der Bauanleitung ab (20, 290 / −10°):
 * so bleibt die ganze Komposition innerhalb der viewBox, statt am linken Rand
 * hart abgeschnitten zu werden. Überlappende Blätter entfallen (`skip`).
 */
export const BOUQUET_ORIGIN: Pt = [32, 288];

export const BOUQUET_BRANCHES: BouquetBranch[] = [
  { key: 'B', scale: 0.8, rotate: 55, skip: [0, 2], swayDelay: -3 },
  { key: 'C', scale: 0.65, rotate: -4, skip: [0, 1, 2, 3, 5], swayDelay: -6 },
  { key: 'A', scale: 1, rotate: 20, skip: [], swayDelay: 0 },
];

/** Kurze Stielenden unterhalb der Bindung (Richtung Ecke) und die Kordel. */
export const BOUQUET_TIE = (() => {
  const o = BOUQUET_ORIGIN;
  const tails = [
    { rotate: 20, length: 9 },
    { rotate: 55, length: 7 },
    { rotate: -4, length: 8 },
  ]
    .map(({ rotate, length }) => {
      const d = rot([0, 1], rotate);
      return `M${fmt(o)}L${fmt(add(o, mul(d, length)))}`;
    })
    .join('');
  // Kordel quer zur mittleren Bündelachse (≈ 24°), zwei Windungen und eine kleine Schlaufe
  const axis = rot([0, -1], 24);
  const across = rot(axis, 90);
  const at = (a: number, b: number) => fmt(add(o, add(mul(axis, a), mul(across, b))));
  const wraps = `M${at(1.2, -4.2)}L${at(2.4, 4.2)}M${at(3.6, -4)}L${at(4.8, 4)}`;
  const bow = `M${at(3, 4.1)}C${at(7, 9)} ${at(1, 12)} ${at(2.6, 6.4)}M${at(3, 4.1)}C${at(-1, 8)} ${at(-4.5, 6.5)} ${at(-6.5, 8.5)}`;
  return { tails, wraps, bow };
})();

export function bouquetTransform(scale: number, rotate: number, foot: Pt = EUCA_FOOT): string {
  return `translate(${BOUQUET_ORIGIN[0]} ${BOUQUET_ORIGIN[1]}) rotate(${rotate}) scale(${scale}) translate(${-foot[0]} ${-foot[1]})`;
}

export const BOUQUET_PAMPAS = { scale: 0.9, rotate: 38, opacity: 0.5 } as const;

/* ==========================================================================
   E3 Pampasgras, viewBox 0 0 80 300
   ========================================================================== */

export const PAMPAS_P0: Pt = [42, 298];
export const PAMPAS_P1: Pt = [46, 190];
export const PAMPAS_P2: Pt = [34, 30];
export const PAMPAS_STEM = 'M42 298 Q46 190 34 30';
export const PAMPAS_FOOT: Pt = PAMPAS_P0;

/** Feste Pseudo-Zufallsfolge (deterministisch, für handgemachte Unregelmäßigkeit). */
function wobble(i: number, seed: number): number {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
}

/**
 * Eine Fieder als Q-Kurve: Punkt auf dem Halm bei t = 0.5 p (von der Spitze aus),
 * Richtung = Halmtangente (zur Spitze) gedreht um ±(winkel + (i mod 3 − 1)·4°),
 * Länge L = 6 + 20 sin(π p). Die Fieder steigt steil an und neigt sich am Ende
 * nach außen (wie eine Fontäne) – so wirkt die Rispe fedrig statt wie eine Gräte.
 */
function frond(i: number, count: number, opts: { length: number; spread: number; jitter: number; seed: number }): string {
  const p = i / (count - 1);
  const tTip = 0.5 * p;
  const t = 1 - tTip;
  const P = quadPoint(PAMPAS_P0, PAMPAS_P1, PAMPAS_P2, t);
  const growth = norm(quadTangent(PAMPAS_P0, PAMPAS_P1, PAMPAS_P2, t));
  const side = i % 2 === 0 ? -1 : 1;
  const deg = side * (opts.spread + ((i % 3) - 1) * 4 + wobble(i, opts.seed) * opts.jitter);
  const dir = rot(growth, deg);
  const L = (6 + 20 * Math.sin(Math.PI * p)) * opts.length * (1 + wobble(i, opts.seed + 1) * 0.25);
  // Wölbung zur Halmseite hin → Ende neigt sich nach außen
  const inward = rot(dir, -side * 90);
  const ctrl = add(add(P, mul(dir, L * 0.5)), mul(inward, L * 0.16));
  const end = add(add(P, mul(dir, L)), mul(inward, -L * 0.04));
  return `M${fmt(P)}Q${fmt(ctrl)} ${fmt(end)}`;
}

/** 30 Fiedern laut Bauanleitung (ein Pfad). */
export const PAMPAS_FRONDS = Array.from({ length: 30 }, (_, i) =>
  frond(i, 30, { length: 1, spread: 25, jitter: 4, seed: 1 }),
).join('');
/** Feinere, weiter abstehende Zwischen-Fiedern für mehr Fülle (ein Pfad). */
export const PAMPAS_FRONDS_FINE = Array.from({ length: 44 }, (_, i) =>
  frond(i, 44, { length: 0.82, spread: 38, jitter: 10, seed: 7 }),
).join('');

/**
 * Feine, weiche Härchen über der ganzen Rispe – unregelmäßig verteilt, mit
 * leicht überhängender Spitze. Sie brechen das Fischgrät-Muster der Fiedern auf
 * und machen die Rispe flauschig und luftig (wie echtes Pampasgras).
 */
function wisp(k: number, count: number): string {
  const p = Math.min(1, Math.max(0, (k + 0.5 + wobble(k, 11) * 0.9) / count));
  const tTip = 0.02 + 0.48 * p;
  const t = 1 - tTip;
  const P = quadPoint(PAMPAS_P0, PAMPAS_P1, PAMPAS_P2, t);
  const growth = norm(quadTangent(PAMPAS_P0, PAMPAS_P1, PAMPAS_P2, t));
  const side = (k + (wobble(k, 5) > 0.3 ? 1 : 0)) % 2 === 0 ? -1 : 1;
  const deg = side * (34 + wobble(k, 13) * 26);
  const dir = rot(growth, deg);
  const L = (5 + 21 * Math.sin(Math.PI * Math.pow(p, 0.85))) * (0.95 + wobble(k, 17) * 0.45);
  const outward = rot(dir, side * 90);
  // Spitze hängt leicht über: zum Halmfuß hin und nach außen
  const droop = mul(growth, -L * (0.1 + 0.12 * p));
  const c1 = add(P, mul(dir, L * 0.42));
  const c2 = add(add(P, mul(dir, L * 0.82)), mul(outward, L * 0.06));
  const end = add(add(add(P, mul(dir, L)), mul(outward, L * 0.1)), droop);
  return `M${fmt(P)}C${fmt(c1)} ${fmt(c2)} ${fmt(end)}`;
}

/** 56 Härchen (ein Pfad), sehr fein und hell. */
export const PAMPAS_WISPS = Array.from({ length: 56 }, (_, k) => wisp(k, 56)).join('');

/* ==========================================================================
   E3 Bündel – drei Rispen aus einem Fußpunkt
   ========================================================================== */

export const PAMPAS_BUNDLE = {
  viewBox: '0 0 160 300',
  foot: [82, 298] as Pt,
  stems: [
    { rotate: -14, scale: 0.85, swayDelay: -2 },
    { rotate: 11, scale: 0.9, swayDelay: -4 },
    { rotate: 0, scale: 1, swayDelay: 0 },
  ],
} as const;

export function bundleTransform(rotate: number, scale: number): string {
  const [fx, fy] = PAMPAS_BUNDLE.foot;
  return `translate(${fx} ${fy}) rotate(${rotate}) scale(${scale}) translate(${-PAMPAS_FOOT[0]} ${-PAMPAS_FOOT[1]})`;
}

/* ==========================================================================
   E4 Olivenzweig
   ========================================================================== */

const OLIVE_P0: Pt = [6, 36];
const OLIVE_P1: Pt = [100, 20];
const OLIVE_P2: Pt = [194, 28];
export const OLIVE_STEM = 'M6 36 Q100 20 194 28';
/**
 * Lanzettliches Blatt (Länge 24, zeigt nach +x). Gegenüber der Bauanleitung
 * (Q12 ±3.2) minimal asymmetrisch: die Außenseite wölbt sich etwas mehr – das
 * Blatt wirkt leicht gebogen statt gestanzt.
 */
export const OLIVE_LEAF = 'M0 0C3.6 -2.5 11 -3.5 24 0C12.5 2.3 4.5 2.1 0 0Z';
const OLIVE_JITTER = [3, -4, 2, -2, 4, -3, 1, -4, 3, -1];

/** x(t) ist linear: x = 6 + 188 t */
function oliveAtX(x: number): { p: Pt; angle: number } {
  const t = (x - OLIVE_P0[0]) / (OLIVE_P2[0] - OLIVE_P0[0]);
  return {
    p: quadPoint(OLIVE_P0, OLIVE_P1, OLIVE_P2, t),
    angle: angleOf(quadTangent(OLIVE_P0, OLIVE_P1, OLIVE_P2, t)),
  };
}

export interface OliveLeaf {
  transform: string;
  fill: 'leaf' | 'stem';
  opacity: number;
}

export const OLIVE_LEAVES: OliveLeaf[] = (() => {
  const leaves: OliveLeaf[] = [];
  for (let k = 0; k < 10; k++) {
    const x = 20 + 18 * k;
    const { p, angle } = oliveAtX(x);
    const up = k % 2 === 0;
    const a = angle + (up ? -35 : 35) + OLIVE_JITTER[k];
    const s = 1 - (0.3 * k) / 9;
    const stem = k % 3 === 2;
    leaves.push({
      // untere Blätter gespiegelt, damit die Wölbung immer nach außen zeigt
      transform: `translate(${fmt(p)}) rotate(${r2(a)}) scale(${r2(s)} ${r2(up ? s : -s)})`,
      fill: stem ? 'stem' : 'leaf',
      opacity: stem ? 0.55 : 0.85,
    });
  }
  // Endblatt in Stielrichtung
  const end = oliveAtX(190);
  leaves.push({ transform: `translate(${fmt(end.p)}) rotate(${r2(end.angle - 4)}) scale(0.62)`, fill: 'leaf', opacity: 0.85 });
  return leaves;
})();

export const OLIVE_FRUITS = (() => {
  const make = (x: number, below: boolean) => {
    const { p } = oliveAtX(x);
    const c: Pt = below ? [x + 2.6, p[1] + 6.6] : [x + 2.4, p[1] - 6.4];
    const tip: Pt = below ? [c[0] - 0.5, c[1] - 2.5] : [c[0] - 0.5, c[1] + 2.5];
    const ctrl: Pt = below ? [p[0] + 0.4, p[1] + 3] : [p[0] + 0.4, p[1] - 3];
    return { cx: c[0], cy: c[1], stalk: `M${fmt(p)}Q${fmt(ctrl)} ${fmt(tip)}`, angle: below ? 18 : -14 };
  };
  return [make(66.5, true), make(119, false)];
})();

/* ==========================================================================
   E9 Halbkranz, viewBox 0 0 160 100
   ========================================================================== */

export const WREATH_CENTER: Pt = [80, 22];
export const WREATH_R = 70;
export const WREATH_BRANCH = 'M78 92A70 70 0 0 1 12 34';

export interface WreathLeaf {
  shape: string;
  petiole: string;
  opacity: number;
  outside: boolean;
  /** Ursprung (auf dem Ast) für die Animation */
  origin: Pt;
  i: number;
}

const WREATH_RADII = [6, 5.6, 5.2, 4.8, 4.4, 4, 3.8, 3.5];

function wreathLeaf(i: number, r: number, phiDeg: number, side: 1 | -1 | 0, opacity: number): WreathLeaf {
  const phi = phiDeg * DEG;
  const onArc: Pt = [WREATH_CENTER[0] + WREATH_R * Math.cos(phi), WREATH_CENTER[1] + WREATH_R * Math.sin(phi)];
  const tangent: Pt = [-Math.sin(phi), Math.cos(phi)]; // Wuchsrichtung (zur Spitze)
  const outward: Pt = [Math.cos(phi), Math.sin(phi)];
  // Längsachse 30° zur Bogentangente, nach außen bzw. innen geneigt (Endblatt: in Wuchsrichtung)
  const axis = norm(add(mul(tangent, Math.cos(36 * DEG * Math.abs(side))), mul(outward, side * Math.sin(36 * DEG))));
  // Kurzer Blattstiel vom Ast, dann das Blatt (Grund am Stiel); Mitte liegt ca. r+1 neben dem Ast
  const base = add(onArc, mul(axis, side === 0 ? 1.2 : 2.6));
  const c = add(base, mul(axis, r * 0.94));
  return {
    i,
    shape: leafPath(c, r, angleOf(axis)),
    petiole: `M${fmt(onArc)}L${fmt(add(base, mul(axis, 0.6)))}`,
    opacity,
    outside: side >= 0,
    origin: onArc,
  };
}

export const WREATH_LEAVES: WreathLeaf[] = [
  ...WREATH_RADII.map((r, i) => {
    const outside = i % 2 === 0;
    // Winkel auf dem Kreis (Bildschirm-Koordinaten): 91.6° = unten, 170° = Spitze links oben
    return wreathLeaf(i, r, 100 + i * 9.2, outside ? 1 : -1, outside ? 0.9 : 0.6);
  }),
  // Endblatt an der Spitze
  wreathLeaf(8, 3, 170, 0, 0.9),
];

export const WREATH_CHECK = 'M62 52 L74 64 L98 38';

/* ==========================================================================
   E11 Scheune – Lichterkette
   ========================================================================== */

export const BARN_LIGHTS_PATH = 'M30 60 Q55 70 80 62 Q105 70 130 60';

export const BARN_BULBS: Pt[] = (() => {
  const segs: [Pt, Pt, Pt][] = [
    [
      [30, 60],
      [55, 70],
      [80, 62],
    ],
    [
      [80, 62],
      [105, 70],
      [130, 60],
    ],
  ];
  const samples: Pt[] = [];
  for (const [a, b, c] of segs) for (let i = 0; i <= 200; i++) samples.push(quadPoint(a, b, c, i / 200));
  const acc: number[] = [0];
  for (let i = 1; i < samples.length; i++) acc.push(acc[i - 1] + len(sub(samples[i], samples[i - 1])));
  const total = acc[acc.length - 1];
  const start = (total - 90) / 2;
  const pts: Pt[] = [];
  for (let k = 0; k < 10; k++) {
    const target = start + k * 10;
    let j = 0;
    while (j < acc.length - 1 && acc[j] < target) j++;
    pts.push([r2(samples[j][0]), r2(samples[j][1] + 1.6)]);
  }
  return pts;
})();

/* ==========================================================================
   E14 Sonnenlauf, viewBox 0 0 720 200
   ========================================================================== */

export interface SunPathPosition {
  x: number;
  y: number;
  /** Minuten seit Mitternacht des Hochzeitstags (nach Mitternacht +24 h) */
  minutes: number;
  tone: 'day' | 'evening' | 'night';
}

function parseTime(value: string): number {
  const m = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Berechnet die Punkte auf dem Bogen: f = (t − t_start)/(t_end − t_start), φ = π(1 − f). */
export function sunPathPositions(times: string[]): SunPathPosition[] {
  let offset = 0;
  let prev = -1;
  const minutes = times.map((t) => {
    let m = parseTime(t) + offset;
    if (prev >= 0 && m < prev) {
      offset += 24 * 60;
      m += 24 * 60;
    }
    prev = m;
    return m;
  });
  const start = minutes[0] ?? 0;
  const end = minutes[minutes.length - 1] ?? 0;
  return minutes.map((m) => {
    const f = end > start ? (m - start) / (end - start) : 0.5;
    const phi = Math.PI * (1 - f);
    const hour = m / 60;
    return {
      x: r2(360 + 320 * Math.cos(phi)),
      y: r2(190 - 170 * Math.sin(phi)),
      minutes: m,
      tone: hour < 18 ? 'day' : hour < 22 ? 'evening' : 'night',
    };
  });
}

/* ==========================================================================
   E6 Mondsichel (Kreis r 10 minus Kreis (4, −3) r 9) als Pfad
   ========================================================================== */

export const MOON_PATH = 'M-1.87 -9.82A10 10 0 1 0 8.91 4.54A9 9 0 0 1 -1.87 -9.82Z';

/* ==========================================================================
   E14 Sonnenlauf – Platzierung der Uhrzeiten
   ========================================================================== */

export interface SunPathLabel {
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
}

type Box = [number, number, number, number];

function overlaps(a: Box, b: Box): boolean {
  return a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
}

/**
 * Standard laut Bauanleitung: Label bei (x, y − 14), mittig. Kollidiert es mit
 * einem anderen Punkt, dem Mond oder einem bereits gesetzten Label (z. B. 13:30
 * und 14:00 direkt nacheinander am Bogenanfang), weicht es nach rechts, links
 * oder schräg oben aus. Am oberen Rand wird es nicht abgeschnitten.
 */
export function sunPathLabels(
  positions: SunPathPosition[],
  texts: string[],
  activeIndex: number | undefined,
  fontSize: number,
  moon: Pt,
): SunPathLabel[] {
  const cap = fontSize * 0.72;
  const width = (t: string) => fontSize * (0.6 * t.replace(/[^0-9]/g, '').length + 0.32 * t.replace(/[0-9]/g, '').length);
  const dots: Box[] = positions.map((p, i) => {
    const r = (i === activeIndex ? 11 : 4) + 1.5;
    return [p.x - r, p.y - r, p.x + r, p.y + r];
  });
  const moonBox: Box = [moon[0] - 12, moon[1] - 12, moon[0] + 12, moon[1] + 12];
  const placed: Box[] = [];
  return positions.map((p, i) => {
    const w = width(texts[i] ?? '');
    const boxOf = (l: SunPathLabel): Box => {
      const x0 = l.anchor === 'middle' ? l.x - w / 2 : l.anchor === 'start' ? l.x : l.x - w;
      return [x0 - 2, l.y - cap - 2, x0 + w + 2, l.y + 1];
    };
    const candidates: SunPathLabel[] = [
      { x: p.x, y: Math.max(p.y - 14, cap + 2.5), anchor: 'middle' },
      { x: p.x + 11, y: p.y + cap / 2, anchor: 'start' },
      { x: p.x - 11, y: p.y + cap / 2, anchor: 'end' },
      { x: p.x + 9, y: p.y - 10, anchor: 'start' },
      { x: p.x - 9, y: p.y - 10, anchor: 'end' },
    ];
    const fits = (l: SunPathLabel) => {
      const b = boxOf(l);
      if (b[0] < 0 || b[2] > 720 || b[1] < 0 || b[3] > 200) return false;
      if (overlaps(b, moonBox)) return false;
      if (dots.some((d, j) => j !== i && overlaps(b, d))) return false;
      if (overlaps(b, dots[i])) return false;
      return !placed.some((o) => overlaps(b, o));
    };
    const chosen = candidates.find(fits) ?? candidates[0];
    placed.push(boxOf(chosen));
    return { x: r2(chosen.x), y: r2(chosen.y), anchor: chosen.anchor };
  });
}
