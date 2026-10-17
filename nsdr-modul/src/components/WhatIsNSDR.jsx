import React from "react";
import { Cite, Correction, Section } from "./ui.jsx";

const TIMELINE = [
  {
    when: "Alte Wurzeln",
    text: (
      <>
        Der Begriff <em>yoga nidrā</em> („yogischer Schlaf“) und einzelne Elemente der Praxis sind alt
        <Cite k="pandi2022" />.
      </>
    ),
  },
  {
    when: "1929 · 1932",
    text: (
      <>
        Im Westen entstehen verwandte Verfahren der Tiefenentspannung: die Progressive Relaxation
        <Cite k="jacobson1929" /> und das Autogene Training
        <Cite k="schultz1932" />.
      </>
    ),
  },
  {
    when: "1960er",
    text: (
      <>
        Swami Satyananda Saraswati (Bihar School of Yoga) systematisiert die geführte Technik und macht sie bekannt
        <Cite k="pandi2022" />, unter anderem mit der „Rotation des Bewusstseins“ durch die Körperteile
        <Cite k="satyananda" />. Die heute übliche Form ist damit eine Technik des 20. Jahrhunderts mit alten Wurzeln, kein jahrtausendealtes Ritual.
      </>
    ),
  },
  {
    when: "1999 · 2002",
    text: (
      <>
        Kopenhagener Forschende messen Yoga Nidra erstmals im PET-Scanner: die Hirndurchblutung
        <Cite k="lou1999" /> und die Dopamin-Freisetzung
        <Cite k="kjaer2002" />.
      </>
    ),
  },
  {
    when: "2020er",
    text: (
      <>
        Andrew Huberman, Neurobiologe an der Stanford School of Medicine, prägt den Begriff NSDR, um die Technik ohne spirituelles Vokabular zugänglich zu machen
        <Cite k="sleepfoundation" />.
      </>
    ),
  },
  {
    when: "2024–2026",
    text: (
      <>
        Erste randomisierte Studien unter dem Namen NSDR: an Herzpatient:innen in der Reha
        <Cite k="wrzeciono2024" /> und an sportlich aktiven jungen Erwachsenen
        <Cite k={["boukhris2024", "boukhris2026a", "boukhris2026b"]} />.
      </>
    ),
  },
];

const METHODS = [
  {
    name: "Klassische Meditation",
    sub: "fokussierte Aufmerksamkeit",
    ziel: "Aufmerksamkeit trainieren und halten",
    zustand: "Wach und aktiv steuernd, meist im Sitzen",
    gehirn: (
      <>
        Stilabhängig: Verschiedene Meditationsformen zeigen klar unterscheidbare Aktivierungsmuster
        <Cite k="fox2016" />
      </>
    ),
    haken: "Ziel ist wache Präsenz; Einschlafen gilt als Abschweifen",
    evidenz: (
      <>
        Umfangreich, je nach Stil sehr unterschiedlich
        <Cite k="fox2016" />
      </>
    ),
  },
  {
    name: "Power-Nap",
    sub: "kurzer Tagschlaf",
    ziel: "Schlafdruck abbauen",
    zustand: "Schlaf, meist Stadium N1–N2",
    gehirn: (
      <>
        Einschlaf-Sequenz bis zu Schlafspindeln, bei längerer Dauer Tiefschlaf
        <Cite k="ogilvie2001" />
      </>
    ),
    haken: (
      <>
        Nach 30 Min. Schlaf zunächst Schlafträgheit, nach 10 Min. kaum
        <Cite k={["brooks2006", "hilditch2016"]} />
      </>
    ),
    evidenz: (
      <>
        Meta-Analyse: kognitive Leistung ES = 0,18, Wachheit ES = 0,29
        <Cite k="dutheil2021" />
      </>
    ),
  },
  {
    name: "NSDR",
    sub: "geführte Tiefenruhe",
    highlight: true,
    ziel: "Tief entspannen, ohne Schlafabsicht",
    zustand: "Wach bis hypnagog, liegend, per Audio geführt",
    gehirn: (
      <>
        Theta-Anstieg bei Geübten; Alpha- und Delta-Befunde uneinheitlich
        <Cite k="kachera2025" />
      </>
    ),
    haken: (
      <>
        Wer einschläft, macht ein Nickerchen. Im direkten Vergleich wirkte ein 25-Min.-Nickerchen stärker
        <Cite k="boukhris2026b" />
      </>
    ),
    evidenz: (
      <>
        Vier kleine RCTs seit 2024, Effekte vor allem subjektiv
        <Cite k="boukhris2026a" />
      </>
    ),
  },
];

const ROWS = [
  ["ziel", "Ziel"],
  ["zustand", "Zustand"],
  ["gehirn", "Gehirn"],
  ["haken", "Haken"],
  ["evidenz", "Evidenz"],
];

export default function WhatIsNSDR() {
  return (
    <Section
      id="was-ist-nsdr"
      number="1"
      eyebrow="Definition & Herkunft"
      title="Was ist NSDR – und woher kommt es?"
      intro={
        <p>
          NSDR bezeichnet einen selbst herbeigeführten Zustand tiefer körperlicher Ruhe, in dem ein sanftes, waches Bewusstsein erhalten bleibt, meist angeleitet durch eine Stimme. Physiologisch liegt er im Grenzbereich
          zwischen entspannter Wachheit und Einschlafen. Die Schlafforschung beschreibt diesen Übergang nicht als Schalter, sondern als fließende Abfolge: erst Alpha-Rhythmus, dann zunehmend Theta-Aktivität, dann erste
          Schlafspindeln
          <Cite k="ogilvie2001" />.
        </p>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
        <div className="min-w-0">
          <h3 className="mb-5 text-[1.15rem] font-semibold text-fg">Vom Yoga Nidra nach Stanford</h3>
          <ol className="relative flex flex-col gap-6 border-l border-linestrong pl-6">
            {TIMELINE.map((item) => (
              <li key={item.when} className="relative">
                <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent" aria-hidden="true" />
                <p className="font-mono text-[0.75rem] font-medium uppercase tracking-[0.06em] text-accent">{item.when}</p>
                <p className="mt-1 max-w-prose font-serif text-[1rem] leading-relaxed text-fg2">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <p className="nsdr-eyebrow mb-2 text-fg2">Kurzdefinition</p>
            <p className="font-display text-[1.25rem] font-medium leading-snug text-fg">
              Geführte Tiefenentspannung im Liegen: maximale körperliche Ruhe bei erhaltenem, passivem Bewusstsein.
            </p>
          </div>
          <Correction title="Klinisch erforscht?">
            Teilweise. Unter dem Namen NSDR gibt es bisher vier kleine RCTs mit Messungen über Minuten bis Wochen. Der Großteil der Daten stammt aus Yoga-Nidra-Studien: Die größte Meta-Analyse (73 Studien, 5.201
            Teilnehmende) fand mittlere bis große Effekte auf Stress und Angst, hält sie wegen niedriger Studienqualität aber selbst für vermutlich überschätzt
            <Cite k="ghai2025" />. Eine große Einzelstudie (771 Teilnehmende, 11 Minuten täglich über 30 Tage) fand sehr kleine bis kleine Effekte
            <Cite k="moszeik2022" />.
          </Correction>
          <p className="font-serif text-[0.98rem] leading-relaxed text-fg3">
            Die Body-Scan-Phase gehört zur selben Familie wie die Body-Scan-Übung des MBSR-Programms
            <Cite k="kabatzinn1990" />. Die Grenze zur Meditation ist also fließend; der Unterschied liegt vor allem im Ziel.
          </p>
        </div>
      </div>

      <div className="mt-14">
        <h3 className="mb-5 text-[1.15rem] font-semibold text-fg">Abgrenzung: Meditation, Power-Nap, NSDR</h3>

        {/* Tabelle ab md */}
        <div className="hidden overflow-x-auto rounded-2xl border border-line md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface">
                <th scope="col" className="w-[9rem] border-b border-line p-4" />
                {METHODS.map((m) => (
                  <th key={m.name} scope="col" className={`border-b border-line p-4 align-bottom ${m.highlight ? "bg-surface2" : ""}`}>
                    <span className="block text-[1.05rem] font-semibold text-fg">{m.name}</span>
                    <span className="block font-mono text-[0.72rem] font-normal text-fg3">{m.sub}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([key, label]) => (
                <tr key={key}>
                  <th scope="row" className="border-b border-line p-4 align-top font-mono text-[0.72rem] font-medium uppercase tracking-[0.06em] text-fg3">
                    {label}
                  </th>
                  {METHODS.map((m) => (
                    <td key={m.name} className={`border-b border-line p-4 align-top font-serif text-[0.95rem] leading-snug text-fg2 ${m.highlight ? "bg-surface2" : ""}`}>
                      {m[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Karten auf schmalen Bildschirmen */}
        <div className="flex flex-col gap-4 md:hidden">
          {METHODS.map((m) => (
            <div key={m.name} className={`rounded-2xl border p-4 ${m.highlight ? "border-accent bg-surface2" : "border-line bg-surface"}`}>
              <p className="text-[1.05rem] font-semibold text-fg">{m.name}</p>
              <p className="mb-3 font-mono text-[0.72rem] text-fg3">{m.sub}</p>
              <dl className="flex flex-col gap-2.5">
                {ROWS.map(([key, label]) => (
                  <div key={key}>
                    <dt className="font-mono text-[0.68rem] uppercase tracking-[0.06em] text-fg3">{label}</dt>
                    <dd className="font-serif text-[0.95rem] leading-snug text-fg2">{m[key]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
