import React from "react";
import { BANDS } from "../lib/model.js";
import { Cite, Correction, EvidenceBadge, Section } from "./ui.jsx";

const T = { fg: "var(--fg)", fg2: "var(--fg-2)", fg3: "var(--fg-3)", line: "var(--line)", strong: "var(--line-strong)", accent: "var(--accent)" };

function sinePath(x0, width, yMid, cycles, amp) {
  const pts = [];
  for (let i = 0; i <= 120; i += 1) {
    const x = x0 + (i / 120) * width;
    const y = yMid - amp * Math.sin((i / 120) * cycles * 2 * Math.PI);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

/** Vier Bänder als „Frequenzleiter“; Klammer markiert den NSDR-Zielbereich. */
function WaveLadder() {
  const rows = [
    { cycles: 10, amp: 3.5 },
    { cycles: 5.5, amp: 6 },
    { cycles: 3, amp: 8 },
    { cycles: 1.4, amp: 9.5 },
  ];
  return (
    <svg viewBox="0 0 320 172" className="h-auto w-full" role="img" aria-label="Frequenzleiter: Beta schnell und flach, Alpha, Theta, Delta langsam und hoch. NSDR zielt auf Alpha und Theta.">
      {BANDS.map((b, i) => {
        const y = 22 + i * 40;
        return (
          <g key={b.id}>
            <text x="0" y={y - 2} style={{ fill: T.fg, font: "600 11px var(--font-display)" }}>
              {b.label}
            </text>
            <text x="0" y={y + 12} style={{ fill: T.fg3, font: "400 10px var(--font-mono)" }}>
              {b.range}
            </text>
            <path d={sinePath(78, 196, y + 3, rows[i].cycles, rows[i].amp)} style={{ stroke: b.color, fill: "none" }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      <path d="M284 50 h6 v68 h-6" style={{ stroke: T.accent, fill: "none" }} strokeWidth="1.5" />
      <text x="295" y="80" style={{ fill: T.accent, font: "500 10px var(--font-mono)" }}>
        NSDR
      </text>
      <text x="295" y="93" style={{ fill: T.fg3, font: "400 9.5px var(--font-mono)" }}>
        Ziel
      </text>
    </svg>
  );
}

function Arrow({ dir, x = 0, y = 0 }) {
  const d = dir === "up" ? "M5 11 V1 M1 5 L5 1 L9 5" : "M5 1 V11 M1 7 L5 11 L9 7";
  return <path transform={`translate(${x} ${y})`} d={d} style={{ stroke: T.fg, fill: "none" }} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />;
}

function Node({ x, y, w, title, sub, children }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="74" rx="10" style={{ fill: "var(--bg)", stroke: T.strong }} strokeWidth="1" />
      <text x={x + 12} y={y + 22} style={{ fill: T.fg, font: "600 12px var(--font-display)" }}>
        {title}
      </text>
      <text x={x + 12} y={y + 38} style={{ fill: T.fg3, font: "400 10px var(--font-mono)" }}>
        {sub}
      </text>
      <g transform={`translate(${x + 12} ${y + 50})`}>{children}</g>
    </g>
  );
}

const label = { fill: "var(--fg-2)", font: "400 10px var(--font-mono)" };

/** Umverteilung statt Abschalten (PET, fMRT). */
function NetworkShift() {
  return (
    <svg viewBox="0 0 320 214" className="h-auto w-full" role="img" aria-label="Schema: frontales Exekutivnetz relativ weniger aktiv, hintere bildhafte Areale relativ mehr aktiv, Default Mode Network bei Geübten weniger, bei Neulingen mehr verbunden.">
      <Node x={0} y={6} w={154} title="Frontal, exekutiv" sub="Planen, Bewerten">
        <Arrow dir="down" />
        <text x="16" y="10" style={label}>relativ (PET)</text>
      </Node>
      <Node x={166} y={6} w={154} title="Hinten, bildhaft" sub="Vorstellung, Bilder">
        <Arrow dir="up" />
        <text x="16" y="10" style={label}>relativ (PET)</text>
      </Node>
      <Node x={0} y={94} w={320} title="Default Mode Network" sub="Selbstbezug, Gedankenwandern">
        <Arrow dir="down" />
        <text x="16" y="10" style={label}>Geübte</text>
        <Arrow dir="up" x={78} />
        <text x="94" y="10" style={label}>Neulinge (fMRT-Konnektivität)</text>
      </Node>
      <text x="0" y="192" style={{ fill: T.fg3, font: "400 10px var(--font-mono)" }}>
        Globaler Blutfluss stabil (gemessen bei n = 2):
      </text>
      <text x="0" y="207" style={{ fill: T.fg3, font: "400 10px var(--font-mono)" }}>
        Umverteilung, kein Abschalten
      </text>
    </svg>
  );
}

/** Aufmerksamkeit wandert nach innen; beide ANS-Äste bleiben aktiv. */
function AttentionShift() {
  const outside = ["Bildschirm", "Geräusche", "To-dos"];
  const inside = ["Atmung", "Herzschlag", "Kontakt zur Unterlage"];
  return (
    <svg viewBox="0 0 320 196" className="h-auto w-full" role="img" aria-label="Schema: Aufmerksamkeit wechselt von äußeren Reizen zu Körpersignalen. Vagale Aktivität steigt, sympathische Aktivität bleibt vorhanden.">
      <text x="0" y="12" style={{ fill: T.fg3, font: "500 10px var(--font-mono)" }}>
        EXTEROZEPTION
      </text>
      <text x="320" y="12" textAnchor="end" style={{ fill: T.fg3, font: "500 10px var(--font-mono)" }}>
        INTEROZEPTION
      </text>
      {outside.map((t, i) => (
        <g key={t}>
          <rect x="0" y={22 + i * 26} width="112" height="20" rx="10" style={{ fill: "var(--bg)", stroke: T.line }} />
          <text x="12" y={36 + i * 26} style={{ fill: T.fg3, font: "400 10px var(--font-display)" }}>
            {t}
          </text>
        </g>
      ))}
      {inside.map((t, i) => (
        <g key={t}>
          <rect x="178" y={22 + i * 26} width="142" height="20" rx="10" style={{ fill: "var(--surface-2)", stroke: T.accent }} />
          <text x="190" y={36 + i * 26} style={{ fill: T.fg, font: "500 10px var(--font-display)" }}>
            {t}
          </text>
        </g>
      ))}
      <path d="M122 58 H166 M158 51 L166 58 L158 65" style={{ stroke: T.accent, fill: "none" }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="0" y="120" style={{ fill: T.fg2, font: "600 10.5px var(--font-display)" }}>
        Autonomes Nervensystem: zwei Regler, kein Schalter
      </text>
      {[
        { label: "Vagal (Parasympathikus)", before: 0.35, after: 0.7, y: 136 },
        { label: "Sympathikus", before: 0.45, after: 0.5, y: 166 },
      ].map((r) => (
        <g key={r.label}>
          <text x="0" y={r.y + 9} style={{ fill: T.fg3, font: "400 10px var(--font-mono)" }}>
            {r.label}
          </text>
          <rect x="150" y={r.y} width="170" height="10" rx="5" style={{ fill: "var(--meter-track)" }} />
          <rect x="150" y={r.y} width={170 * r.after} height="10" rx="5" style={{ fill: T.accent }} />
          <line x1={150 + 170 * r.before} x2={150 + 170 * r.before} y1={r.y - 3} y2={r.y + 13} style={{ stroke: T.fg }} strokeWidth="1.5" />
        </g>
      ))}
      <text x="320" y="192" textAnchor="end" style={{ fill: T.fg3, font: "400 9.5px var(--font-mono)" }}>
        Strich = vorher · Balken = währenddessen (schematisch)
      </text>
    </svg>
  );
}

const MECHANISMS = [
  {
    n: "1",
    title: "Gehirnwellen-Shift",
    sub: "Frequenz-Drosselung",
    level: "prelim",
    badge: "Theta-Anstieg: vorläufig",
    visual: <WaveLadder />,
    body: (
      <>
        <p>
          Mit geschlossenen Augen und entspanntem Körper tritt der Alpha-Rhythmus (8–13 Hz) hervor; Aufmerksamkeit und geistige Anstrengung unterdrücken ihn
          <Cite k="kane2017" />. Mit zunehmender Schläfrigkeit gewinnt Theta (4–&lt;8 Hz) an Gewicht
          <Cite k="ogilvie2001" />.
        </p>
        <p>
          Bei Yoga Nidra ist der Theta-Anstieg der konsistenteste EEG-Befund, vor allem bei Geübten (12 Studien, 326 Teilnehmende)
          <Cite k="kachera2025" />. In der PET-Studie ging er mit der Dopamin-Freisetzung einher
          <Cite k="kjaer2002" />.
        </p>
      </>
    ),
    correction: (
      <>
        Delta bei wachem Bewusstsein ist nicht belegt. Delta-Befunde bei Yoga Nidra sind uneinheitlich
        <Cite k="kachera2025" />; eine unkontrollierte Studie mit 30 Neulingen fand Delta nur regional (zentral mehr, präfrontal weniger) und wertet den Zustand als wach mit „lokalem Schlaf“
        <Cite k="datta2022" />.
      </>
    ),
  },
  {
    n: "2",
    title: "Präfrontaler Kortex & DMN",
    sub: "Exekutiv-Zentrum und Default Mode Network",
    level: "prelim",
    badge: "Vorläufig",
    visual: <NetworkShift />,
    body: (
      <>
        <p>
          Im PET verschob sich die Durchblutung während Yoga Nidra: relativ weniger Aktivität in frontalen, cingulären, striatalen und thalamischen Regionen, die die Autor:innen einem exekutiven Aufmerksamkeitsnetz zuordnen,
          und mehr in hinteren, bildverarbeitenden Arealen
          <Cite k="lou1999" />.
        </p>
        <p>
          Im fMRT sank die Konnektivität des Default Mode Network bei 30 erfahrenen Meditierenden; bei 31 Neulingen stieg sie dagegen
          <Cite k="fialoke2024" />. Für Einsteiger:innen ist ein „ruhigeres DMN“ also nicht gezeigt.
        </p>
      </>
    ),
    correction: (
      <>
        „Drastisch gesenkter Glukose- und Sauerstoffverbrauch“ ist nicht gemessen. Der globale Blutfluss blieb stabil, allerdings nur bei zwei Personen bestimmt
        <Cite k="lou1999" />. Die Daten zeigen eine Umverteilung, kein Herunterfahren.
      </>
    ),
  },
  {
    n: "3",
    title: "Von Exterozeption zu Interozeption",
    sub: "Aufmerksamkeit als Suchscheinwerfer nach innen",
    level: "prelim",
    badge: "Vorläufig",
    visual: <AttentionShift />,
    body: (
      <>
        <p>
          Interozeption ist die Wahrnehmung des inneren Körperzustands
          <Cite k="craig2002" />. Beim Body-Scan stieg die respiratorische Sinusarrhythmie, ein Marker vagaler Aktivität, stärker als bei Muskelentspannung, Warteliste oder Hörbuch (zwei Experimente, n = 32 und 30)
          <Cite k="ditto2006" />.
        </p>
        <p>
          In der größten NSDR-Studie sank die Herzfrequenz während der Session stärker als in der Kontrollgruppe
          <Cite k="boukhris2026a" />; Yoga Nidra verbesserte HRV-Indizes in einer Crossover-Studie mit 20 Personen
          <Cite k="markil2012" />.
        </p>
      </>
    ),
    correction: (
      <>
        Kein Kippschalter von Sympathikus auf Parasympathikus: Beim Body-Scan blieb die Herzfrequenz gleich, offenbar weil beide Äste zugleich aktiver wurden
        <Cite k="ditto2006" />. Auch das LF/HF-Verhältnis misst keine „Balance“
        <Cite k="billman2013" />.
      </>
    ),
  },
];

export default function BrainMechanisms() {
  return (
    <Section
      id="hirnebene"
      number="2"
      eyebrow="Neurologischer Mechanismus"
      title="Was auf Hirnebene passiert"
      intro={<p>Drei Prozesse laufen parallel. Die Markierung zeigt jeweils, wie belastbar die Daten sind, und der Faktencheck korrigiert die gängigsten Übertreibungen.</p>}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {MECHANISMS.map((m) => (
          <article key={m.n} className="flex min-w-0 flex-col gap-5 rounded-2xl border border-line bg-surface p-5">
            <header className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <span className="whitespace-nowrap font-mono text-[0.75rem] text-fg3">Mechanismus {m.n}</span>
                <EvidenceBadge level={m.level}>{m.badge}</EvidenceBadge>
              </div>
              <h3 className="text-[1.3rem] font-semibold leading-tight text-fg">{m.title}</h3>
              <p className="text-[0.85rem] text-fg3">{m.sub}</p>
            </header>
            <div className="rounded-xl border border-line bg-bg p-3">{m.visual}</div>
            <div className="flex flex-col gap-3 font-serif text-[0.98rem] leading-relaxed text-fg2">{m.body}</div>
            <div className="mt-auto">
              <Correction>{m.correction}</Correction>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
