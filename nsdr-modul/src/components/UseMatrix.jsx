import React from "react";
import { Cite, EvidenceBadge, Section } from "./ui.jsx";

const SCENARIOS = [
  {
    id: "slump",
    name: "Der Afternoon-Slump-Killer",
    when: "13–16 Uhr",
    dose: "10–20 Min.",
    level: "prelim",
    how: "Statt des dritten Espressos: Kopfhörer auf, hinlegen (notfalls zurückgelehnt sitzen), NSDR-Audio starten, Wecker auf 20 Minuten.",
    data: (
      <>
        Das Nachmittagstief ist zirkadian und tritt auch ohne Mittagessen auf; ein kohlenhydratreiches Essen verstärkt es
        <Cite k="monk2005" />. Koffein verkürzt den Nachtschlaf im Mittel um 45 Minuten; Kaffee (≈ 107 mg) sollte mindestens 8,8 Stunden vor dem Zubettgehen getrunken werden
        <Cite k="gardiner2023" />. 10 Minuten NSDR senkten Schläfrigkeit und Müdigkeit
        <Cite k="boukhris2026a" />.
      </>
    ),
    caveat: (
      <>
        Ein echtes 10-Minuten-Nickerchen ist besser belegt
        <Cite k={["brooks2006", "dutheil2021"]} />. Wenn Einschlafen möglich ist, darf es passieren. Einen „Dopamin-Reset“ für die zweite Tageshälfte zeigt keine Studie.
      </>
    ),
  },
  {
    id: "post",
    name: "Der Post-Workout- & Post-Study-Verstärker",
    when: "Direkt danach",
    dose: "10–20 Min.",
    level: "prelim",
    how: "Nach einer harten Einheit: duschen, hinlegen, Session. Nach einem langen Fokusblock (z. B. 90 Min. Deep Work): sofort NSDR, ohne vorher Mails, Feeds oder Podcasts zu öffnen.",
    data: (
      <>
        Bei sportlich Aktiven verbesserten sich nach 10 Min. NSDR subjektive Erholung, Griffkraft und Reaktionszeit
        <Cite k="boukhris2024" />; in der größeren Folgestudie blieben Effekte auf Kraft und Sprung aus
        <Cite k="boukhris2026a" />. Yoga Nidra verbesserte HRV-Indizes auch nach einer Yoga-Einheit
        <Cite k="markil2012" />. Wache Ruhe nach dem Lernen hilft dem Behalten im Mittel
        <Cite k="weng2025" />.
      </>
    ),
    caveat: (
      <>
        Bei gesunden Jüngeren ist der Lern-Effekt klein und nicht immer reproduzierbar
        <Cite k={["parra2026", "psychres2026"]} />. „ZNS-Regeneration“ wurde für NSDR nicht direkt gemessen. Kein Ersatz für Cool-down, Ernährung und Nachtschlaf.
      </>
    ),
  },
  {
    id: "night",
    name: "Der 3-Uhr-nachts-Rettungsanker",
    when: "Nächtliches Wachliegen",
    dose: "bis zu 20 Min.",
    level: "prelim",
    how: "Im Bett bleiben, Licht aus, Bildschirm aus: Audio vorher laden oder eine Session auswendig kennen. Die Re-Orientierung am Ende weglassen und einfach liegen bleiben.",
    data: (
      <>
        Entspannungsverfahren werden bei chronischer Insomnie als Einzelmaßnahme bedingt empfohlen
        <Cite k="edinger2021" />. Für Yoga Nidra waren die gepoolten RCT-Effekte auf Schlafqualität und Insomnie-Schwere nicht signifikant, bei sehr niedriger Evidenzqualität
        <Cite k="singh2026" />.
      </>
    ),
    caveat: (
      <>
        Kommt der Schlaf nicht zurück: aufstehen, bei gedimmtem Licht etwas Ruhiges tun, erst schläfrig zurück ins Bett. Das ist Stimuluskontrolle, ebenfalls bedingt empfohlen. Bei wiederkehrender Schlaflosigkeit ist die
        kognitive Verhaltenstherapie (KVT-I) die einzige stark empfohlene Behandlung
        <Cite k="edinger2021" />.
      </>
    ),
  },
];

export default function UseMatrix() {
  return (
    <Section
      id="einsatz"
      number="5"
      eyebrow="Einsatz-Protokoll"
      title="Wann und wie du NSDR im Alltag nutzt"
      intro={<p>Drei Situationen, in denen NSDR am meisten Sinn ergibt. Jede Karte trennt die Anleitung von dem, was die Daten tatsächlich zeigen.</p>}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {SCENARIOS.map((s) => (
          <article key={s.id} className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <header className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2 font-mono text-[0.72rem]">
                <span className="rounded-full border border-linestrong px-2.5 py-1 text-fg">{s.when}</span>
                <span className="rounded-full border border-line px-2.5 py-1 text-fg2">{s.dose}</span>
              </div>
              <h3 className="text-[1.25rem] font-semibold leading-tight text-fg">{s.name}</h3>
            </header>
            <div className="flex flex-col gap-1.5">
              <p className="nsdr-eyebrow text-fg2">So geht’s</p>
              <p className="font-serif text-[0.98rem] leading-relaxed text-fg">{s.how}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="nsdr-eyebrow text-fg2">Was die Daten sagen</p>
              <p className="font-serif text-[0.94rem] leading-relaxed text-fg2">{s.data}</p>
            </div>
            <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-bg p-4">
              <p className="nsdr-eyebrow text-fg2">Achtung</p>
              <p className="font-serif text-[0.92rem] leading-relaxed text-fg2">{s.caveat}</p>
            </div>
            <div className="mt-auto">
              <EvidenceBadge level={s.level} />
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
