import React from "react";
import { PHASES, SESSION_MINUTES } from "../lib/model.js";
import { Cite, EvidenceBadge, Section } from "./ui.jsx";

// Ordinale Rampe (ein Farbton, hell → dunkel = tiefer), validiert gegen die Panel-Fläche.
const PHASE_COLORS = ["var(--phase-1)", "var(--phase-2)", "var(--phase-3)", "var(--phase-4)"];

const STEPS = {
  p1: {
    level: "solid",
    badge: "Alpha bei Augen zu: gesichert",
    how: "Flach auf den Rücken legen, Arme leicht vom Körper weg, Beine locker. Augen schließen, Raum etwas abdunkeln, Handy in den Flugmodus. Ab jetzt keine muskuläre Arbeit mehr.",
    why: (
      <>
        Visueller Input und motorische Anforderungen fallen weg. Mit geschlossenen Augen und körperlicher Entspannung tritt der Alpha-Rhythmus hervor
        <Cite k="kane2017" />. Yoga Nidra wird traditionell in Rückenlage (Shavasana) geübt
        <Cite k="pandi2022" />.
      </>
    ),
  },
  p2: {
    level: "solid",
    badge: "Langsames Atmen: gesichert",
    how: "Durch die Nase einatmen, die Ausatmung bewusst verlängern: etwa 4 Sekunden ein, 6 bis 8 Sekunden aus. Alternative Cyclic Sighing: zweimal durch die Nase einatmen (tief, dann kurz nachfüllen), lang durch den Mund ausatmen.",
    why: (
      <>
        Beim Ausatmen sinkt die Herzfrequenz, beim Einatmen steigt sie: die respiratorische Sinusarrhythmie, eine über den Vagus vermittelte Kopplung von Atmung und Kreislauf
        <Cite k="yasuma2004" />. Das Zwerchfell bremst den Sinusknoten also nicht mechanisch. Langsames Atmen erhöht die vagal vermittelte HRV robust
        <Cite k="laborde2022" />; eine längere Ausatmung steigerte die Entspannung und, bei langsamem Tempo, die HF-HRV
        <Cite k="vandiest2014" />. Cyclic Sighing hob die Stimmung stärker als Achtsamkeitsmeditation
        <Cite k="balban2023" />.
      </>
    ),
  },
  p3: {
    level: "prelim",
    badge: "Vorläufig",
    how: "Die Stimme führt die Aufmerksamkeit in zügiger Folge durch einzelne Körperstellen: Finger, Hände, Arme, Kiefer, Augen, Brustkorb, Bauch, Beine, Zehen. Nur spüren, nichts verändern: Schwere, Wärme, Kontakt zur Unterlage.",
    why: (
      <>
        Die Aufmerksamkeit wechselt zu Körpersignalen (Interozeption)
        <Cite k="craig2002" />. Ein Body-Scan erhöhte die respiratorische Sinusarrhythmie stärker als Vergleichsbedingungen
        <Cite k="ditto2006" />. Die „Rotation des Bewusstseins“ durch Körperteile ist ein Kernelement des Yoga Nidra
        <Cite k="satyananda" />.
      </>
    ),
  },
  p4: {
    level: "hypo",
    badge: "Hypothese / Konvention",
    how: "Ein paar Minuten nur liegen, ohne oder mit sehr sparsamer Anleitung: das Gefühl, mit der Unterlage zu verschmelzen. Dann zurückkommen: zwei, drei tiefe Atemzüge, Finger und Zehen bewegen, strecken, zur Seite rollen, Augen öffnen, langsam aufsetzen.",
    why: (
      <>
        Hier liegt im Modell die größte Theta-Tiefe, der Übergangsbereich zum Schlaf
        <Cite k="ogilvie2001" />. Das schrittweise Zurückkommen ist Praxis-Konvention, nicht eigens untersucht. Wer eingeschlafen war, kann kurz Schlafträgheit spüren
        <Cite k="hilditch2016" />.
      </>
    ),
  },
};

export default function SessionAnatomy() {
  return (
    <Section
      id="session"
      number="4"
      eyebrow="Anatomie einer Session"
      title="20 Minuten in vier Phasen"
      intro={
        <p>
          So ist eine typische audio-geführte Session aufgebaut. Für eine 10-Minuten-Version werden die Phasen proportional verkürzt; die Studien mit Sportler:innen nutzten 10-Minuten-Sessions
          <Cite k={["boukhris2024", "boukhris2026a"]} />.
        </p>
      }
    >
      <div className="mb-8 rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="flex h-4 w-full gap-[2px]" role="img" aria-label="Zeitleiste: Phase 1 Minute 0 bis 2, Phase 2 Minute 2 bis 5, Phase 3 Minute 5 bis 15, Phase 4 Minute 15 bis 20">
          {PHASES.map((p, i) => (
            <div
              key={p.id}
              style={{
                flexBasis: `${((p.end - p.start) / SESSION_MINUTES) * 100}%`,
                background: PHASE_COLORS[i],
                borderRadius: i === 0 ? "4px 0 0 4px" : i === PHASES.length - 1 ? "0 4px 4px 0" : 0,
              }}
            />
          ))}
        </div>
        <div className="relative mt-2 h-4 font-mono text-[0.68rem] tabular-nums text-fg3" aria-hidden="true">
          {[0, 2, 5, 15, 20].map((m) => (
            <span
              key={m}
              className="absolute top-0"
              style={{ left: `${(m / SESSION_MINUTES) * 100}%`, transform: m === 0 ? "none" : m === 20 ? "translateX(-100%)" : "translateX(-50%)" }}
            >
              {m}′
            </span>
          ))}
        </div>
      </div>

      <ol className="grid gap-5 md:grid-cols-2">
        {PHASES.map((p, i) => {
          const step = STEPS[p.id];
          return (
            <li key={p.id} className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 font-mono text-[0.75rem] tabular-nums text-fg2">
                  <i className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: PHASE_COLORS[i] }} aria-hidden="true" />
                  Phase {i + 1} · Min. {p.start}–{p.end}
                </span>
              </div>
              <h3 className="text-[1.2rem] font-semibold leading-tight text-fg">{p.title}</h3>
              <div className="flex flex-col gap-1.5">
                <p className="nsdr-eyebrow text-fg2">So geht’s</p>
                <p className="font-serif text-[0.98rem] leading-relaxed text-fg">{step.how}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="nsdr-eyebrow text-fg2">Warum</p>
                <p className="font-serif text-[0.92rem] leading-relaxed text-fg2">{step.why}</p>
              </div>
              <div className="mt-auto pt-1">
                <EvidenceBadge level={step.level}>{step.badge}</EvidenceBadge>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
