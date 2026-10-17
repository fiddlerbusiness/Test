import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import EEGCanvas from "./EEGCanvas.jsx";
import { Cite, EvidenceBadge } from "./ui.jsx";
import {
  BANDS,
  PHASES,
  SESSION_MINUTES,
  bandShares,
  dominantBand,
  effectLevels,
  formatMinutes,
  levelWord,
  phaseAt,
} from "../lib/model.js";

const PLAY_SECONDS = 32; // 20 Session-Minuten in 32 Sekunden
const DEMO_MINUTE = 12; // Startbild: Body-Scan, Theta dominant
const TABLE_MINUTES = [0, 2, 5, 10, 15, 17.5, 19, 20];

const NARRATIVE = [
  {
    to: 1,
    text: <>Hinlegen, Augen schließen. Noch dominiert die schnelle Beta-Aktivität des wachen, arbeitenden Gehirns.</>,
  },
  {
    to: 2,
    text: (
      <>
        Mit geschlossenen Augen und entspanntem Körper tritt der Alpha-Rhythmus hervor; Aufmerksamkeit und geistige Anstrengung würden ihn unterdrücken
        <Cite k="kane2017" />.
      </>
    ),
  },
  {
    to: 5,
    text: (
      <>
        Lange Ausatmung: Bei jedem Ausatmen sinkt die Herzfrequenz (respiratorische Sinusarrhythmie)
        <Cite k="yasuma2004" />. Langsames Atmen erhöht die vagal vermittelte HRV
        <Cite k="laborde2022" />.
      </>
    ),
  },
  {
    to: 10,
    text: (
      <>
        Body-Scan: Die Aufmerksamkeit wandert von außen nach innen, zu Körpersignalen (Interozeption)
        <Cite k="craig2002" />. Der Theta-Anteil wächst – der konsistenteste EEG-Befund bei Yoga Nidra
        <Cite k="kachera2025" />.
      </>
    ),
  },
  {
    to: 15,
    text: (
      <>
        Theta wird dominant. Gedanken werden bildhaft, das Zeitgefühl verschwimmt: der Übergangsbereich zwischen Wachsein und Schlaf
        <Cite k="ogilvie2001" />.
      </>
    ),
  },
  {
    to: 18,
    text: (
      <>
        Tiefster Punkt der Session. Wer hier einschläft, rutscht in Schlafstadium N1 oder N2 – dann ist es faktisch ein Nickerchen
        <Cite k="ogilvie2001" />.
      </>
    ),
  },
  {
    to: 20.01,
    text: <>Re-Orientierung: tiefer einatmen, Finger und Zehen bewegen. Alpha und Beta kehren zurück. Erst dann die Augen öffnen und langsam aufsetzen.</>,
  },
];

const METERS = [
  {
    id: "dopamine",
    title: "Dopamin-Freisetzung",
    sub: "ventrales Striatum",
    level: "prelim",
    badge: "Einzelstudie",
    note: (
      <>
        Einziger Messwert: ≈ +65 % (geschätzt) über die Session, n = 8
        <Cite k="kjaer2002" />. Wie der Verlauf Minute für Minute aussieht, ist unbekannt.
      </>
    ),
  },
  {
    id: "vagal",
    title: "Vagale Aktivierung",
    sub: "Proxy für „ZNS-Erholung“: Herzfrequenz, HRV",
    level: "prelim",
    badge: "Vorläufig",
    note: (
      <>
        Für langsames Atmen gut belegt
        <Cite k="laborde2022" />; bei NSDR sank die Herzfrequenz stärker als in der Kontrollgruppe
        <Cite k="boukhris2026a" />.
      </>
    ),
  },
  {
    id: "consolidation",
    title: "Offline-Konsolidierung",
    sub: "Replay-Fenster für zuvor Gelerntes",
    level: "hypo",
    badge: "Hypothese",
    note: (
      <>
        Replay in kurzen Wach-Pausen ist gezeigt
        <Cite k="buch2021" />. Ob NSDR es verstärkt, wurde nicht untersucht.
      </>
    ),
  },
];

function BandBar({ shares }) {
  const [hover, setHover] = useState(null);
  let acc = 0;
  const centers = {};
  for (const b of BANDS) {
    centers[b.id] = acc + shares[b.id] / 2;
    acc += shares[b.id];
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <div className="flex h-3.5 w-full gap-[2px]" role="img" aria-label={BANDS.map((b) => `${b.label} ${Math.round(shares[b.id] * 100)} %`).join(", ")}>
          {BANDS.map((b, i) => (
            <div
              key={b.id}
              tabIndex={0}
              onPointerEnter={() => setHover(b.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(b.id)}
              onBlur={() => setHover(null)}
              className="h-full outline-none transition-[flex-basis] duration-150 focus-visible:ring-2 focus-visible:ring-accent"
              style={{
                flexBasis: `${shares[b.id] * 100}%`,
                background: b.color,
                borderTopLeftRadius: i === 0 ? 4 : 0,
                borderBottomLeftRadius: i === 0 ? 4 : 0,
                borderTopRightRadius: i === BANDS.length - 1 ? 4 : 0,
                borderBottomRightRadius: i === BANDS.length - 1 ? 4 : 0,
                opacity: hover && hover !== b.id ? 0.55 : 1,
              }}
            />
          ))}
        </div>
        {hover ? (
          <div
            className="pointer-events-none absolute -top-9 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-surface2 px-2 py-1 font-mono text-[0.72rem] text-fg2"
            style={{ left: `${Math.min(88, Math.max(12, centers[hover] * 100))}%` }}
          >
            <strong className="font-semibold text-fg">{Math.round(shares[hover] * 100)} %</strong>{" "}
            {BANDS.find((b) => b.id === hover).label} (Modell)
          </div>
        ) : null}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {BANDS.map((b) => (
          <li key={b.id} className="flex min-w-0 items-baseline gap-2">
            <span className="inline-block h-2.5 w-2.5 shrink-0 translate-y-[1px] rounded-[2px]" style={{ background: b.color }} aria-hidden="true" />
            <span className="min-w-0">
              <span className="block font-mono text-[0.95rem] font-medium tabular-nums text-fg">{Math.round(shares[b.id] * 100)} %</span>
              <span className="block text-[0.75rem] leading-tight text-fg3">
                {b.label} · {b.range}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Meter({ meter, value, minute }) {
  const id = useId();
  const pct = Math.round(value * 100);
  let right = "Modellverlauf";
  if (meter.id === "dopamine") right = minute >= 14 ? "Studien-Endwert ≈ +65 %*" : "Verlauf unbekannt";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p id={`${id}-t`} className="text-[0.98rem] font-semibold leading-tight text-fg">
            {meter.title}
          </p>
          <p className="text-[0.78rem] leading-snug text-fg3">{meter.sub}</p>
        </div>
        <EvidenceBadge level={meter.level}>{meter.badge}</EvidenceBadge>
      </div>
      <div
        role="meter"
        aria-labelledby={`${id}-t`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${levelWord(value)} (Modell)`}
        className="h-2.5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--meter-track)" }}
      >
        <div className="h-full rounded-full bg-accent transition-[width] duration-150" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap justify-between gap-x-3 font-mono text-[0.72rem] text-fg3">
        <span>
          Modell: <span className="text-fg2">{levelWord(value)}</span>
        </span>
        <span>{right}</span>
      </div>
      <p className="font-serif text-[0.86rem] leading-snug text-fg3">{meter.note}</p>
    </div>
  );
}

export default function BrainwaveVisualizer() {
  const [minute, setMinute] = useState(DEMO_MINUTE);
  const [playing, setPlaying] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const minuteRef = useRef(DEMO_MINUTE);
  const touched = useRef(false);
  const sliderId = useId();

  const update = useCallback((m) => {
    const v = Math.min(SESSION_MINUTES, Math.max(0, m));
    minuteRef.current = v;
    setMinute(v);
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const next = minuteRef.current + ((now - last) / 1000) * (SESSION_MINUTES / PLAY_SECONDS);
      last = now;
      if (next >= SESSION_MINUTES) {
        update(SESSION_MINUTES);
        setPlaying(false);
        return;
      }
      update(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, update]);

  const togglePlay = () => {
    // Erstes Abspielen und Abspielen am Ende starten bei 00:00, sonst geht es an der aktuellen Stelle weiter.
    if (!playing && (!touched.current || minuteRef.current >= SESSION_MINUTES)) update(0);
    touched.current = true;
    setPlaying((p) => !p);
  };

  const shares = bandShares(minute);
  const dom = dominantBand(minute);
  const phase = phaseAt(minute);
  const levels = effectLevels(minute);
  const narrative = NARRATIVE.find((n) => minute < n.to) ?? NARRATIVE[NARRATIVE.length - 1];
  const fill = `${(minute / SESSION_MINUTES) * 100}%`;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      {/* Steuerung */}
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex items-center gap-2 rounded-full border border-linestrong bg-surface2 px-4 py-2 text-[0.9rem] font-medium text-fg transition-colors hover:border-accent"
            aria-label={playing ? "Session-Animation pausieren" : "Session im Zeitraffer abspielen"}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              {playing ? (
                <path d="M4 2.5 V11.5 M10 2.5 V11.5" style={{ stroke: "var(--fg)" }} strokeWidth="2.4" strokeLinecap="round" />
              ) : (
                <path d="M4 2 L12 7 L4 12 Z" style={{ fill: "var(--fg)" }} />
              )}
            </svg>
            {playing ? "Pause" : minute >= SESSION_MINUTES ? "Nochmal abspielen" : "Session abspielen"}
          </button>
          <p className="font-mono text-[1.35rem] font-medium tabular-nums text-fg" aria-live="off">
            {formatMinutes(minute)}
            <span className="text-[0.85rem] text-fg3"> / 20:00</span>
          </p>
          <p className="min-w-0 text-[0.9rem] text-fg2">
            <span className="text-fg3">Phase:</span> {phase.title}
          </p>
        </div>

        <div>
          <label htmlFor={sliderId} className="sr-only">
            Session-Minute
          </label>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={SESSION_MINUTES}
            step={0.1}
            value={minute}
            onChange={(e) => {
              touched.current = true;
              setPlaying(false);
              update(parseFloat(e.target.value));
            }}
            aria-valuetext={`Minute ${formatMinutes(minute)}, ${phase.title}, dominant ${dom.label}`}
            className="nsdr-range"
            style={{ "--fill": fill }}
          />
          <div className="mt-1 flex justify-between font-mono text-[0.68rem] tabular-nums text-fg3" aria-hidden="true">
            {[0, 5, 10, 15, 20].map((m) => (
              <span key={m}>{String(m).padStart(2, "0")}:00</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4" role="group" aria-label="Zu Phase springen">
          {PHASES.map((p) => {
            const active = p.id === phase.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  touched.current = true;
                  setPlaying(false);
                  update(p.start + 0.01);
                }}
                aria-pressed={active}
                className={`flex min-w-0 flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors ${
                  active ? "border-accent bg-surface2" : "border-line hover:border-linestrong"
                }`}
              >
                <span className="font-mono text-[0.68rem] tabular-nums text-fg3">
                  {formatMinutes(p.start)}–{formatMinutes(p.end)}
                </span>
                <span className={`text-[0.85rem] leading-tight ${active ? "text-fg" : "text-fg2"}`}>{p.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* EEG */}
      <div className="border-t border-line bg-bg">
        <EEGCanvas minuteRef={minuteRef} initialMinute={DEMO_MINUTE} height={168} />
      </div>

      {/* Bandanteile + Effekte */}
      <div className="grid border-t border-line lg:grid-cols-[1.15fr_1fr]">
        <div className="flex min-w-0 flex-col gap-6 p-4 sm:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-[1rem] font-semibold text-fg">Relative Bandanteile</h3>
              <span className="font-mono text-[0.72rem] text-fg3">Modell, Minute {formatMinutes(minute)}</span>
            </div>
            <BandBar shares={shares} />
            <p className="font-serif text-[0.86rem] leading-snug text-fg3">
              Würde Delta dominieren, wärst du im Tiefschlaf (N3). Das ist bei NSDR nicht das Ziel; bei wachen Übenden fand sich Delta allenfalls lokal
              <Cite k="datta2022" />.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-bg p-4">
            <p className="nsdr-eyebrow mb-1.5">Jetzt passiert · {phase.title}</p>
            <p className="font-serif text-[1rem] leading-relaxed text-fg2">{narrative.text}</p>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-6 border-t border-line p-4 sm:p-6 lg:border-l lg:border-t-0">
          {METERS.map((m) => (
            <Meter key={m.id} meter={m} value={levels[m.id]} minute={minute} />
          ))}
        </div>
      </div>

      {/* Fußnote + Tabelle */}
      <div className="flex flex-col gap-3 border-t border-line p-4 sm:px-6">
        <p className="font-serif text-[0.86rem] leading-snug text-fg3">
          <strong className="font-semibold text-fg2">Modell, keine Messung.</strong> Bandanteile und Balken sind schematisch aus drei Befunden abgeleitet: Alpha bei geschlossenen Augen
          <Cite k="kane2017" />, Theta beim Einschlafübergang
          <Cite k="ogilvie2001" /> und bei geübten Yoga-Nidra-Praktizierenden
          <Cite k="kachera2025" />. Echte EEGs unterscheiden sich stark zwischen Personen. *Schätzwert aus einer einzigen PET-Studie.
        </p>
        <div>
          <button
            type="button"
            onClick={() => setShowTable((s) => !s)}
            aria-expanded={showTable}
            className="font-mono text-[0.78rem] text-accent underline decoration-line underline-offset-4 hover:decoration-accent"
          >
            {showTable ? "Tabelle ausblenden" : "Modellwerte als Tabelle zeigen"}
          </button>
        </div>
        {showTable ? (
          <div className="overflow-x-auto">
            <table className="nsdr-table">
              <caption className="pb-2 text-left font-mono text-[0.72rem] text-fg3">Schematische Modellwerte (keine Messdaten)</caption>
              <thead>
                <tr>
                  <th scope="col">Minute</th>
                  <th scope="col">Phase</th>
                  {BANDS.map((b) => (
                    <th key={b.id} scope="col">
                      {b.label}
                    </th>
                  ))}
                  <th scope="col">Dopamin</th>
                  <th scope="col">Vagal</th>
                  <th scope="col">Konsolidierung</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_MINUTES.map((m) => {
                  const s = bandShares(m);
                  const l = effectLevels(m);
                  return (
                    <tr key={m}>
                      <td>{formatMinutes(m)}</td>
                      <td>{phaseAt(m).short}</td>
                      {BANDS.map((b) => (
                        <td key={b.id}>{Math.round(s[b.id] * 100)} %</td>
                      ))}
                      <td>{levelWord(l.dopamine)}</td>
                      <td>{levelWord(l.vagal)}</td>
                      <td>{levelWord(l.consolidation)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
