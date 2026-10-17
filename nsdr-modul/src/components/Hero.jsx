import React from "react";
import EEGCanvas from "./EEGCanvas.jsx";
import { Cite, EvidenceBadge, EvidenceLegend } from "./ui.jsx";

// Selbstlaufender Zeitraffer: 20 Session-Minuten in 34 Sekunden.
// Bei reduzierter Bewegung (null) bleibt das Bild im Theta-Zustand stehen.
const heroMinute = (sec) => (sec === null ? 14 : ((sec * 20) / 34) % 20);

const STATS = [
  {
    value: "10 Min.",
    level: "prelim",
    badge: "Vorläufig",
    text: (
      <>
        NSDR senkten in randomisierten Studien Schläfrigkeit, Müdigkeit und Stress stärker als Kontrollbedingungen
        <Cite k={["boukhris2024", "boukhris2026a"]} />.
      </>
    ),
  },
  {
    value: "+65 %*",
    level: "prelim",
    badge: "Einzelstudie",
    text: (
      <>
        Dopamin im Striatum: Schätzwert aus einer einzigen PET-Studie mit 8 erfahrenen Yoga-Lehrern, bis heute nicht repliziert
        <Cite k="kjaer2002" />.
      </>
    ),
  },
  {
    value: "4",
    level: null,
    text: (
      <>
        randomisierte Studien tragen bisher den Namen NSDR, mit je 45 bis 102 Teilnehmenden
        <Cite k={["wrzeciono2024", "boukhris2024", "boukhris2026a", "boukhris2026b"]} />. Recherche-Stand: Oktober 2026.
      </>
    ),
  },
];

export default function Hero() {
  return (
    <header className="nsdr-gutter pb-10 pt-10 sm:pb-14 sm:pt-16">
      <div className="mx-auto flex max-w-panel flex-col gap-8">
        <div className="flex max-w-prose flex-col gap-5">
          <p className="nsdr-eyebrow">Allrounder Life-Optimization Protokoll · Modul Regeneration</p>
          <h1 className="font-display font-semibold leading-[0.98] tracking-[-0.025em] text-fg">
            <span className="mb-3 block font-mono text-[0.95rem] font-medium uppercase tracking-[0.12em] text-accent">NSDR · Non-Sleep Deep Rest</span>
            <span className="block text-[clamp(2.4rem,7vw,4.6rem)]">Der 20-Minuten-Gehirn-Reboot</span>
          </h1>
          <p className="nsdr-prose text-[1.18rem] leading-relaxed text-fg2">
            Aktive Erholung ist kein Rumliegen, sondern ein steuerbarer Zustand: Der Körper fährt herunter, das Bewusstsein bleibt an. Dieses Modul zeigt, was dabei im Gehirn und im autonomen Nervensystem messbar passiert, wann du NSDR
            einsetzt und welche der kursierenden Zahlen die Studien tatsächlich hergeben.
          </p>
        </div>

        <figure className="overflow-hidden rounded-2xl border border-line bg-surface">
          <EEGCanvas autoMinute={heroMinute} height={132} windowSec={3.5} label="EEG O1–M2 · Simulation im Zeitraffer" />
          <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line px-3 py-2.5 font-mono text-[0.72rem] text-fg3 sm:px-4">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <i className="inline-block h-2 w-2 rounded-[2px] bg-beta" aria-hidden="true" />
                Beta
              </span>
              <span aria-hidden="true">→</span>
              <span className="inline-flex items-center gap-1.5">
                <i className="inline-block h-2 w-2 rounded-[2px] bg-alpha" aria-hidden="true" />
                Alpha
              </span>
              <span aria-hidden="true">→</span>
              <span className="inline-flex items-center gap-1.5">
                <i className="inline-block h-2 w-2 rounded-[2px] bg-theta" aria-hidden="true" />
                Theta
              </span>
            </span>
            <span>20 Session-Minuten in 34 Sekunden · schematisch</span>
          </figcaption>
        </figure>

        <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.value} className="flex min-w-0 flex-col gap-3 bg-surface p-5">
              <dt className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-display text-[2.4rem] font-semibold leading-none tracking-[-0.02em] text-fg">{s.value}</span>
                {s.level ? <EvidenceBadge level={s.level}>{s.badge}</EvidenceBadge> : null}
              </dt>
              <dd className="font-serif text-[0.95rem] leading-snug text-fg2">{s.text}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col gap-4 rounded-2xl border border-line p-5">
          <p className="nsdr-eyebrow text-fg2">So liest du die Markierungen</p>
          <EvidenceLegend />
          <p className="font-serif text-[0.92rem] leading-snug text-fg3">
            Jede Aussage trägt einen Kurzbeleg. Ein Klick darauf springt ins Literaturverzeichnis mit Studiendesign, Stichprobe und Effekt.
          </p>
        </div>
      </div>
    </header>
  );
}
