import React from "react";
import { Cite, EvidenceBadge, Section } from "./ui.jsx";

const OUTCOMES = {
  nsdr: { label: "Vorteil NSDR", tone: "text-fg" },
  unclear: { label: "Unklar", tone: "text-fg2" },
  none: { label: "Kein sinnvolles Kriterium", tone: "text-fg2" },
};

const ROWS = [
  {
    topic: "Erholung in der Pause",
    scroll: (
      <>
        Nach Handy-Pausen dauerte der Rest der Aufgabe 19 % länger und es wurden 22 % weniger Rätsel gelöst als nach Pausen auf Papier oder am Computer; die Effizienz glich der ganz ohne Pause (n = 414)
        <Cite k="kang2019" />.
      </>
    ),
    nsdr: (
      <>
        Weniger Schläfrigkeit, Müdigkeit und Stress als in der Kontrollgruppe; Reaktionszeit kurzfristig besser (n = 102)
        <Cite k="boukhris2026a" />.
      </>
    ),
    outcome: "nsdr",
    level: "prelim",
  },
  {
    topic: "Gedächtnis fürs gerade Gelernte",
    scroll: (
      <>
        Uneinheitlich: 8 Min. Social Media verschlechterten das Behalten gegenüber Ruhe (n = 67)
        <Cite k="martini2020" />; zwei neuere Studien fanden keinen Unterschied
        <Cite k={["quevedo2025", "psychres2026"]} />.
      </>
    ),
    nsdr: (
      <>
        Nicht direkt untersucht. Wache Ruhe allgemein: kleiner bis mittlerer Vorteil, bei jungen Gesunden schwächer
        <Cite k={["weng2025", "parra2026"]} />.
      </>
    ),
    outcome: "unclear",
    level: "prelim",
  },
  {
    topic: "Augen",
    scroll: (
      <>
        Digitale Augenbelastung betrifft Schätzungen zufolge 50 % oder mehr der Bildschirmnutzer:innen
        <Cite k="sheppard2018" />.
      </>
    ),
    nsdr: <>20 Minuten Augen zu, keine Naharbeit. Plausibel entlastend, aber nicht gemessen.</>,
    outcome: "nsdr",
    level: "hypo",
  },
  {
    topic: "Nervensystem & Schlaf",
    scroll: (
      <>
        Als Kontrollbedingung im RCT: 15 Min. Social Media am Abend über 30 Tage veränderten weder Schlafqualität noch nächtliche vagale Aktivität
        <Cite k="laborde2019" />.
      </>
    ),
    nsdr: (
      <>
        15 Min. langsames Atmen am Abend, wie in Phase 2 einer NSDR-Session, verbesserten im selben RCT die Schlafqualität und erhöhten die nächtliche vagale Aktivität (n = 64)
        <Cite k="laborde2019" />.
      </>
    ),
    outcome: "nsdr",
    level: "prelim",
  },
  {
    topic: "Dopamin",
    scroll: (
      <>
        Eine „Entleerung“ durch Scrollen ist nicht gemessen; belohnende Bildschirmaktivität setzt im Striatum Dopamin frei
        <Cite k="koepp1998" />.
      </>
    ),
    nsdr: (
      <>
        ≈ +65 % geschätzt, eine Studie, n = 8
        <Cite k="kjaer2002" />.
      </>
    ),
    outcome: "none",
    level: "none",
  },
];

export default function ScrollVsNSDR() {
  return (
    <Section
      id="vergleich"
      eyebrow="Schnell-Vergleich"
      title="20 Minuten Scrollen oder 20 Minuten NSDR?"
      intro={
        <p>
          Die populäre Version lautet: Scrollen leert den Dopamin-Speicher, NSDR füllt ihn. Diese Messung existiert nicht. Was es gibt, sind Studien zu Erholung, Gedächtnis, Augen und Schlaf – und dort sieht das Duell
          differenzierter aus.
        </p>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-line">
        <div className="hidden grid-cols-[11rem_1fr_1fr_11rem] border-b border-line bg-surface lg:grid">
          <div className="p-4" />
          <p className="p-4 text-[1rem] font-semibold text-fg">20 Min. Social Media</p>
          <p className="p-4 text-[1rem] font-semibold text-fg">20 Min. NSDR</p>
          <p className="p-4 font-mono text-[0.72rem] uppercase tracking-[0.06em] text-fg3">Fazit</p>
        </div>
        <ul>
          {ROWS.map((r, i) => (
            <li key={r.topic} className={`grid gap-x-0 lg:grid-cols-[11rem_1fr_1fr_11rem] ${i > 0 ? "border-t border-line" : ""}`}>
              <h3 className="px-4 pb-1 pt-4 text-[1rem] font-semibold text-fg lg:pb-4">{r.topic}</h3>
              <div className="min-w-0 px-4 py-2 lg:py-4">
                <p className="mb-1 font-mono text-[0.68rem] uppercase tracking-[0.06em] text-fg3 lg:hidden">Social Media</p>
                <p className="font-serif text-[0.95rem] leading-snug text-fg2">{r.scroll}</p>
              </div>
              <div className="min-w-0 px-4 py-2 lg:bg-surface lg:py-4">
                <p className="mb-1 font-mono text-[0.68rem] uppercase tracking-[0.06em] text-fg3 lg:hidden">NSDR</p>
                <p className="font-serif text-[0.95rem] leading-snug text-fg2">{r.nsdr}</p>
              </div>
              <div className="flex flex-wrap items-start gap-2 px-4 pb-4 pt-2 lg:flex-col lg:py-4">
                <p className={`text-[0.92rem] font-semibold ${OUTCOMES[r.outcome].tone}`}>{OUTCOMES[r.outcome].label}</p>
                <EvidenceBadge level={r.level} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-6 max-w-prose font-serif text-[1.05rem] leading-relaxed text-fg">
        <strong className="font-semibold">Fazit:</strong> Die stärksten Argumente für NSDR in der Pause sind Erholung, Augen und Schlaf. Dopamin ist dafür das falsche Kriterium.
      </p>
    </Section>
  );
}
