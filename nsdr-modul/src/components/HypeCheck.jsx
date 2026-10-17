import React, { useState } from "react";
import { Cite, Section, VERDICTS, VerdictBadge } from "./ui.jsx";

const CLAIMS = [
  {
    claim: "Eine Session erhöht Dopamin um 65 %.",
    verdict: "overstated",
    finding: (
      <>
        Schätzwert aus 7,9 % geringerer Tracer-Bindung, eine PET-Studie, 8 erfahrene Yoga-Lehrer, nie repliziert
        <Cite k="kjaer2002" />.
      </>
    ),
  },
  {
    claim: "NSDR füllt den Dopamin-Pool auf, Social Media leert ihn.",
    verdict: "unsupported",
    finding: (
      <>
        Weder das eine noch das andere wurde gemessen; auch Videospielen setzt striatal Dopamin frei
        <Cite k="koepp1998" />.
      </>
    ),
  },
  {
    claim: "+20–50 % schnellere Neuroplastizität.",
    verdict: "unsupported",
    finding: (
      <>
        Keine Quelle gefunden. Wache Ruhe nach dem Lernen: g = 0,45 im Mittel, bei jungen Gesunden schwächer
        <Cite k={["weng2025", "parra2026"]} />.
      </>
    ),
  },
  {
    claim: "Im Theta-Zustand spielt das Gehirn Gelerntes 10- bis 20-fach beschleunigt ab.",
    verdict: "partly",
    finding: (
      <>
        Rund 20-fach komprimiertes Replay in Wach-Pausen ist gezeigt
        <Cite k="buch2021" />, im Tiermodell aber an Sharp-Wave-Ripples gekoppelt, nicht an Theta
        <Cite k={["foster2006", "buzsaki2015"]} />. Für NSDR nicht gemessen.
      </>
    ),
  },
  {
    claim: "Präfrontaler Kortex und DMN senken ihren Glukose- und Sauerstoffverbrauch drastisch.",
    verdict: "overstated",
    finding: (
      <>
        PET zeigt eine Umverteilung bei stabilem globalem Blutfluss
        <Cite k="lou1999" />; die DMN-Konnektivität sank nur bei Geübten
        <Cite k="fialoke2024" />.
      </>
    ),
  },
  {
    claim: "Das Gehirn erreicht Delta-Wellen, während man das Audio noch wahrnimmt.",
    verdict: "unsupported",
    finding: (
      <>
        Delta-Befunde sind uneinheitlich, allenfalls regional („lokaler Schlaf“)
        <Cite k={["kachera2025", "datta2022"]} />.
      </>
    ),
  },
  {
    claim: "Mit geschlossenen Augen und Entspannung verschiebt sich das EEG Richtung Alpha und Theta.",
    verdict: "true",
    finding: (
      <>
        Alpha tritt bei geschlossenen Augen und Entspannung hervor
        <Cite k="kane2017" />; Theta-Anstieg ist der konsistenteste Yoga-Nidra-Befund
        <Cite k="kachera2025" />.
      </>
    ),
  },
  {
    claim: "Langsames Ausatmen erhöht sofort die HRV.",
    verdict: "true",
    finding: (
      <>
        Für langsames Atmen meta-analytisch belegt (223 Studien)
        <Cite k="laborde2022" />; der Zusatznutzen einer längeren Ausatmung ist weniger klar
        <Cite k={["vandiest2014", "balban2023"]} />.
      </>
    ),
  },
  {
    claim: "Die lange Ausatmung bremst über das Zwerchfell den Sinusknoten.",
    verdict: "partly",
    finding: (
      <>
        Die Herzfrequenz sinkt beim Ausatmen tatsächlich, vermittelt über den Vagus (respiratorische Sinusarrhythmie), nicht mechanisch über das Zwerchfell
        <Cite k="yasuma2004" />.
      </>
    ),
  },
  {
    claim: "Innerhalb von Minuten schaltet das Nervensystem von Sympathikus auf Parasympathikus.",
    verdict: "overstated",
    finding: (
      <>
        Beide Äste bleiben aktiv; beim Body-Scan stieg die vagale Aktivität, die Herzfrequenz blieb gleich
        <Cite k="ditto2006" />.
      </>
    ),
  },
  {
    claim: "NSDR senkt Cortisol drastisch.",
    verdict: "overstated",
    finding: (
      <>
        Kleine bzw. inkonsistente Effekte; deutlich nur bei Risikogruppen und regelmäßiger Praxis
        <Cite k={["koncz2021", "moszeik2025"]} />.
      </>
    ),
  },
  {
    claim: "20–30 Min. NSDR kompensieren eine schlechte Nacht und bauen Adenosin ab.",
    verdict: "unsupported",
    finding: (
      <>
        Nicht untersucht; ein Nickerchen wirkte im direkten Vergleich besser
        <Cite k="boukhris2026b" />, Adenosin sinkt im Schlaf
        <Cite k="porkka1997" />.
      </>
    ),
  },
  {
    claim: "Anders als ein Power-Nap verursacht NSDR keine Aufwachträgheit.",
    verdict: "partly",
    finding: (
      <>
        Plausibel, solange man wach bleibt; auch 10-Minuten-Nickerchen zeigen kaum Schlafträgheit
        <Cite k={["brooks2006", "hilditch2016"]} />.
      </>
    ),
  },
  {
    claim: "Yoga Nidra ist eine jahrtausendealte Praxis.",
    verdict: "partly",
    finding: (
      <>
        Elemente sind alt, die heutige geführte Technik wurde in den 1960ern systematisiert
        <Cite k="pandi2022" />.
      </>
    ),
  },
  {
    claim: "NSDR ist ein klinisch erforschtes Protokoll.",
    verdict: "partly",
    finding: (
      <>
        Vier kleine RCTs unter diesem Namen
        <Cite k={["wrzeciono2024", "boukhris2026a"]} />; die Yoga-Nidra-Literatur ist groß, aber methodisch schwach
        <Cite k="ghai2025" />.
      </>
    ),
  },
];

const FILTERS = [["all", "Alle"], ...Object.entries(VERDICTS).map(([k, v]) => [k, v.label])];

export default function HypeCheck() {
  const [filter, setFilter] = useState("all");
  const visible = CLAIMS.filter((c) => filter === "all" || c.verdict === filter);
  const count = (k) => (k === "all" ? CLAIMS.length : CLAIMS.filter((c) => c.verdict === k).length);

  return (
    <Section
      id="faktencheck"
      eyebrow="Hype-Check"
      title={`${CLAIMS.length} Behauptungen über NSDR im Faktencheck`}
      intro={<p>Verbreitete Aussagen über NSDR, jeweils mit Befund und Quelle. So lässt sich jede Zahl selbst nachprüfen.</p>}
    >
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Nach Urteil filtern">
        {FILTERS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            aria-pressed={filter === k}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[0.78rem] transition-colors ${
              filter === k ? "border-accent bg-surface2 text-fg" : "border-line text-fg2 hover:border-linestrong"
            }`}
          >
            {label} <span className="text-fg3">{count(k)}</span>
          </button>
        ))}
      </div>
      <ul className="overflow-hidden rounded-2xl border border-line">
        {visible.map((c, i) => (
          <li key={c.claim} className={`grid gap-2 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_8.5rem_minmax(0,1.3fr)] md:gap-6 ${i > 0 ? "border-t border-line" : ""}`}>
            <p className="font-display text-[1rem] font-medium leading-snug text-fg">„{c.claim}“</p>
            <div className="md:pt-0.5">
              <VerdictBadge verdict={c.verdict} />
            </div>
            <p className="font-serif text-[0.95rem] leading-snug text-fg2">{c.finding}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
