import React from "react";
import { Cite, EvidenceBadge, Section, VerdictBadge } from "./ui.jsx";

const CARDS = [
  {
    id: "dopamin",
    kicker: "Motivation",
    title: "Dopamin-Reset",
    claim: "„+65 % Dopamin in einer Session, füllt den Dopamin-Pool wieder auf.“",
    figure: "+65 %",
    figureNote: "geschätzt · 1 Studie · n = 8",
    verdicts: [
      ["overstated", "Zahl als Fakt"],
      ["unsupported", "„Pool auffüllen“"],
    ],
    level: "prelim",
    badge: "Einzelstudie",
    measured: (
      <>
        Während Yoga Nidra sank die Bindung des PET-Tracers [¹¹C]Raclopride im ventralen Striatum um 7,9 %. Die Autor:innen rechneten das in rund +65 % Dopamin-Freisetzung um. Design: zwei Scans pro Person, 8 erfahrene Yoga-Lehrer
        <Cite k="kjaer2002" />.
      </>
    ),
    context: (
      <>
        Eine einzelne, nie replizierte Studie mit einem modellbasierten Schätzwert. Die Teilnehmenden berichteten weniger Handlungsdrang; einen Motivationsschub hat niemand gemessen. Auch belohnende Bildschirmaktivität setzt
        im Striatum Dopamin frei, gezeigt beim Videospielen
        <Cite k="koepp1998" />. Für einen „Dopamin-Pool“, den NSDR auffüllt und Social Media leert, gibt es keine Messung.
      </>
    ),
  },
  {
    id: "lernen",
    kicker: "Lernen & Skills",
    title: "Neuroplastizität",
    claim: "„+20–50 % schnellere Neuroplastizität; Replay im Theta-Zustand 10- bis 20-fach beschleunigt.“",
    figure: "g = 0,45",
    figureNote: "wache Ruhe nach dem Lernen · Meta-Analyse",
    verdicts: [
      ["unsupported", "„+20–50 %“"],
      ["partly", "Replay"],
    ],
    level: "prelim",
    measured: (
      <>
        Wache Ruhe nach dem Lernen verbessert das Behalten im Mittel um g = 0,45, nach 7 Tagen noch um g = 0,27 (37 Studien)
        <Cite k="weng2025" />. Das Gehirn spielt eine geübte Fingersequenz in Pausen etwa 20-fach zeitlich komprimiert ab, und die Replay-Rate sagt den Lerngewinn vorher
        <Cite k="buch2021" />.
      </>
    ),
    context: (
      <>
        Bei gesunden jungen Erwachsenen ist der Ruhe-Effekt schwächer
        <Cite k="parra2026" />; zwei neuere Studien fanden keinen Vorteil gegenüber Social Media oder Ablenkungsaufgaben
        <Cite k={["quevedo2025", "psychres2026"]} />. Replay läuft im Tiermodell in Sharp-Wave-Ripples ruhiger Wachheit, nicht im Theta-Rhythmus
        <Cite k={["foster2006", "buzsaki2015"]} />. Für „+20–50 %“ fand sich keine Quelle, und NSDR nach dem Lernen wurde bisher in keiner kontrollierten Studie getestet.
      </>
    ),
  },
  {
    id: "stress",
    kicker: "Stressachse",
    title: "Cortisol & HRV",
    claim: "„Drastische Cortisol-Senkung, sofortiger HRV-Anstieg durch Vagusnerv-Stimulation.“",
    figure: "223",
    figureNote: "Studien: langsames Atmen erhöht vagale HRV",
    verdicts: [
      ["true", "HRV akut (Atmung)"],
      ["overstated", "„drastisch“ Cortisol"],
    ],
    level: "solid",
    badge: "Gesichert für HRV durch Atmung",
    measured: (
      <>
        Langsames Atmen erhöht die vagal vermittelte HRV während, direkt nach und nach mehrwöchigem Üben
        <Cite k="laborde2022" />. Bei NSDR sank die Herzfrequenz stärker als in der Kontrollgruppe
        <Cite k="boukhris2026a" />. Eine einzelne kurze Entspannungsübung senkte Speichel-Cortisol gegenüber ruhigem Sitzen (61 Personen)
        <Cite k="pawlow2002" />.
      </>
    ),
    context: (
      <>
        Meta-analytisch senkt Meditation Blut-Cortisol mit mittlerem Effekt nur bei Risikogruppen; Speichel-Studien zeigten keinen signifikanten Effekt
        <Cite k="koncz2021" />. Regelmäßiges Online-Yoga-Nidra über zwei Monate ging mit niedrigerem Gesamt-Cortisol einher, die psychischen Effekte der 11-Minuten-Version waren aber sehr klein (d = 0,08–0,16)
        <Cite k="moszeik2025" />. Gegenevidenz: 28 Tage tägliche Atemübungen veränderten Ruhepuls und HRV in keiner Gruppe signifikant
        <Cite k="balban2023" />.
      </>
    ),
  },
  {
    id: "schlaf",
    kicker: "Schlafdefizit",
    title: "Der „Schlaf-Ersatz“",
    claim: "„20–30 Min. NSDR kompensieren eine schlechte Nacht und bauen Adenosin ab.“",
    figure: "0",
    figureNote: "kontrollierte NSDR-Studien nach Schlafmangel gefunden (Stand 10/2026)",
    verdicts: [["unsupported", "Kompensation & Adenosin"]],
    level: "none",
    measured: (
      <>
        Bei ausgeschlafenen Sportler:innen senkten 10 Min. NSDR Schläfrigkeit und Müdigkeit; die Reaktionszeit war nur direkt danach besser
        <Cite k="boukhris2026a" />. Im direkten Vergleich senkte ein 25-Min.-Nickerchen die Müdigkeit, NSDR zeigte keinen signifikanten Effekt
        <Cite k="boukhris2026b" />.
      </>
    ),
    context: (
      <>
        Adenosin, der chemische Müdigkeitsdruck, steigt mit der Wachzeit und sinkt im Schlaf (gezeigt bei Katzen)
        <Cite k="porkka1997" />; ein Abbau durch NSDR ohne Schlaf ist nicht gezeigt. Nach verkürzter Nacht war ein 10-Min.-Nickerchen am Nachmittag sofort wirksam
        <Cite k="brooks2006" />. Wer bei NSDR einschläft, bekommt diesen Nickerchen-Effekt.
      </>
    ),
  },
];

export default function EffectCards() {
  return (
    <Section
      id="effekte"
      number="3"
      eyebrow="Messbare Effekte"
      title="Vier Versprechen, vier Prüfungen"
      intro={<p>Jede Karte stellt die Zahl, die über NSDR kursiert, neben das, was Studien tatsächlich gemessen haben, mit Design, Stichprobe und Effektgröße.</p>}
    >
      <div className="grid gap-5 md:grid-cols-2">
        {CARDS.map((c) => (
          <article key={c.id} id={`effekt-${c.id}`} className="flex min-w-0 flex-col gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <header className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="nsdr-eyebrow">{c.kicker}</span>
                <EvidenceBadge level={c.level}>{c.badge}</EvidenceBadge>
              </div>
              <h3 className="text-[1.45rem] font-semibold leading-tight text-fg">{c.title}</h3>
              <p className="font-serif text-[0.98rem] italic leading-snug text-fg3">Behauptung: {c.claim}</p>
            </header>

            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-y border-line py-4">
              <div className="min-w-0">
                <p className="font-display text-[clamp(2.4rem,5vw,3.2rem)] font-semibold leading-none tracking-[-0.02em] text-fg">{c.figure}</p>
                <p className="mt-2 font-mono text-[0.75rem] text-fg3">{c.figureNote}</p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {c.verdicts.map(([v, label]) => (
                  <li key={label} className="flex items-center gap-2">
                    <VerdictBadge verdict={v} />
                    <span className="text-[0.78rem] text-fg3">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="nsdr-eyebrow text-fg2">Was gemessen wurde</p>
              <p className="font-serif text-[0.98rem] leading-relaxed text-fg2">{c.measured}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="nsdr-eyebrow text-fg2">Einordnung & Gegenevidenz</p>
              <p className="font-serif text-[0.98rem] leading-relaxed text-fg2">{c.context}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
