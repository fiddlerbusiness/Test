// Schematisches Modell einer 20-Minuten-NSDR-Session.
// WICHTIG: Das sind keine Messwerte. Die Verläufe sind aus qualitativen
// Studienbefunden abgeleitet (Alpha bei geschlossenen Augen, Theta-Anstieg
// beim Einschlafübergang bzw. bei geübten Yoga-Nidra-Praktizierenden) und
// dienen nur der Veranschaulichung.

export const SESSION_MINUTES = 20;

export const BANDS = [
  { id: "beta", label: "Beta", range: ">13–30 Hz", color: "var(--beta)", hex: "#e66767" },
  { id: "alpha", label: "Alpha", range: "8–13 Hz", color: "var(--alpha)", hex: "#008300" },
  { id: "theta", label: "Theta", range: "4–<8 Hz", color: "var(--theta)", hex: "#3987e5" },
  { id: "delta", label: "Delta", range: "<4 Hz", color: "var(--delta)", hex: "#d55181" },
];

export const PHASES = [
  { id: "p1", start: 0, end: 2, short: "Immobilisation", title: "Physische Immobilisation" },
  { id: "p2", start: 2, end: 5, short: "Atmen", title: "Parasympathisches Atmen" },
  { id: "p3", start: 5, end: 15, short: "Body-Scan", title: "Rotierender Body-Scan" },
  { id: "p4", start: 15, end: 20, short: "Einsinken", title: "Einsinken & Re-Orientierung" },
];

// Relative Bandanteile [beta, alpha, theta, delta] an Stützstellen (Summe = 1).
const BAND_KEYFRAMES = [
  [0, [0.56, 0.28, 0.12, 0.04]],
  [2, [0.34, 0.48, 0.14, 0.04]],
  [5, [0.22, 0.5, 0.22, 0.06]],
  [10, [0.15, 0.37, 0.39, 0.09]],
  [15, [0.12, 0.28, 0.48, 0.12]],
  [17.5, [0.12, 0.27, 0.49, 0.12]],
  [19, [0.24, 0.42, 0.28, 0.06]],
  [20, [0.36, 0.42, 0.17, 0.05]],
];

export const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Relative Bandanteile zur Minute t, als Objekt {beta, alpha, theta, delta}. */
export function bandShares(t) {
  const m = clamp(t, 0, SESSION_MINUTES);
  let i = 0;
  while (i < BAND_KEYFRAMES.length - 2 && m > BAND_KEYFRAMES[i + 1][0]) i += 1;
  const [t0, a] = BAND_KEYFRAMES[i];
  const [t1, b] = BAND_KEYFRAMES[i + 1];
  const k = smoothstep(0, 1, (m - t0) / (t1 - t0));
  const mixed = a.map((v, j) => v + (b[j] - v) * k);
  const sum = mixed.reduce((s, v) => s + v, 0);
  return Object.fromEntries(BANDS.map((band, j) => [band.id, mixed[j] / sum]));
}

/** Band mit dem größten Anteil. */
export function dominantBand(t) {
  const shares = bandShares(t);
  return BANDS.reduce((best, band) => (shares[band.id] > shares[best.id] ? band : best), BANDS[0]);
}

export function phaseAt(t) {
  const m = clamp(t, 0, SESSION_MINUTES);
  return PHASES.find((p) => m < p.end) ?? PHASES[PHASES.length - 1];
}

/**
 * Modellierte Ausprägung (0–1) der drei Effekt-Balken. Rein illustrativ:
 * - dopamine: Endwert entspricht dem Studienbefund (Kjaer 2002), der Verlauf
 *   dazwischen ist unbekannt.
 * - vagal: steigt mit verlängerter Ausatmung schnell, fällt bei der
 *   Re-Orientierung wieder etwas.
 * - consolidation: Hypothese – steigt in ruhigen Phasen ohne neuen Input.
 */
export function effectLevels(t) {
  const m = clamp(t, 0, SESSION_MINUTES);
  const dopamine = smoothstep(1, 14, m);
  const vagal = clamp(0.15 + 0.6 * smoothstep(1.5, 5, m) + 0.2 * smoothstep(5, 14, m) - 0.25 * smoothstep(18, 20, m));
  const consolidation = clamp(0.9 * smoothstep(4, 17, m) + 0.1 * smoothstep(17, 20, m));
  return { dopamine, vagal, consolidation };
}

export function levelWord(v) {
  if (v < 0.2) return "kaum";
  if (v < 0.45) return "niedrig";
  if (v < 0.75) return "mittel";
  return "hoch";
}

/** 7.5 → "07:30" */
export function formatMinutes(t) {
  const total = Math.round(clamp(t, 0, SESSION_MINUTES) * 60);
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

// Mittenfrequenzen (Hz) und Grundamplituden (µV) je Band für die Wellen-Simulation.
export const WAVE_COMPONENTS = {
  beta: { amp: 9, freqs: [16.5, 21, 25.5] },
  alpha: { amp: 24, freqs: [9.4, 10.6] },
  theta: { amp: 30, freqs: [5.2, 6.6] },
  delta: { amp: 42, freqs: [1.6, 2.7] },
};

/**
 * Farbe der Kurve: Mischung der Bandfarben, stark zum dominanten Band gewichtet
 * (Anteil^8), damit keine trüben Zwischentöne entstehen. Die Hex-Werte in BANDS
 * spiegeln die Tokens in styles.css.
 */
export function traceColor(shares) {
  let w = 0;
  const rgb = [0, 0, 0];
  for (const band of BANDS) {
    const weight = shares[band.id] ** 8;
    const n = parseInt(band.hex.slice(1), 16);
    rgb[0] += ((n >> 16) & 255) * weight;
    rgb[1] += ((n >> 8) & 255) * weight;
    rgb[2] += (n & 255) * weight;
    w += weight;
  }
  return `rgb(${rgb.map((c) => Math.round(c / w)).join(", ")})`;
}
