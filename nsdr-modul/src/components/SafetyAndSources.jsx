import React from "react";
import { SOURCES, SOURCE_KEYS_SORTED } from "../data/sources.js";
import { Cite, Section } from "./ui.jsx";

const LIMITS = [
  {
    title: "Kein Ersatz für Schlaf",
    text: (
      <>
        NSDR ergänzt den Nachtschlaf, ersetzt ihn aber nicht. Bei anhaltenden Schlafproblemen ist die kognitive Verhaltenstherapie für Insomnie (KVT-I) die Behandlung der ersten Wahl
        <Cite k="edinger2021" />.
      </>
    ),
  },
  {
    title: "Unerwünschte Effekte gibt es",
    text: (
      <>
        Bei Meditationspraktiken traten gepoolt bei 8,3 % der Teilnehmenden unerwünschte Effekte auf, am häufigsten Angst und depressive Symptome, auch ohne psychische Vorgeschichte (83 Studien, n = 6.703)
        <Cite k="farias2020" />. Wird es unangenehm: Augen öffnen, aufsetzen, Session beenden.
      </>
    ),
  },
  {
    title: "Nach dem Einschlafen: Vorsicht",
    text: (
      <>
        Wer in der Session länger einschläft, kann danach kurz benommen sein
        <Cite k={["brooks2006", "hilditch2016"]} />. Nicht direkt danach Auto fahren oder technisch anspruchsvoll trainieren.
      </>
    ),
  },
  {
    title: "Die Datenlage ist jung",
    text: (
      <>
        Die NSDR-Studien sind klein, kurz und an jungen, gesunden, aktiven Menschen gemacht; die Effekte sind vor allem subjektiv
        <Cite k="boukhris2026a" />. Die Yoga-Nidra-Effekte gelten selbst den Autor:innen der größten Meta-Analyse als vermutlich überschätzt
        <Cite k="ghai2025" />.
      </>
    ),
  },
];

export function SafetyLimits() {
  return (
    <Section id="grenzen" eyebrow="Grenzen & Sicherheit" title="Was NSDR nicht kann">
      <div className="grid gap-5 sm:grid-cols-2">
        {LIMITS.map((l) => (
          <div key={l.title} className="flex min-w-0 flex-col gap-2 rounded-2xl border border-line bg-surface p-5">
            <h3 className="text-[1.1rem] font-semibold text-fg">{l.title}</h3>
            <p className="font-serif text-[0.98rem] leading-relaxed text-fg2">{l.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function SourceList() {
  return (
    <Section
      id="quellen"
      eyebrow="Literatur"
      title="Quellen"
      intro={
        <p>
          {SOURCE_KEYS_SORTED.length} Quellen, alphabetisch. Recherche-Stand: Oktober 2026. Wo Band, Seiten oder DOI nicht sicher verifiziert werden konnten, fehlen sie; der Link führt dann auf PubMed oder PubMed Central.
        </p>
      }
    >
      <ol className="grid gap-x-10 gap-y-5 lg:grid-cols-2">
        {SOURCE_KEYS_SORTED.map((key) => {
          const s = SOURCES[key];
          return (
            <li key={key} id={`ref-${key}`} className="min-w-0 scroll-mt-6 border-t border-line pt-4">
              <p className="font-mono text-[0.75rem] font-medium text-accent">{s.cite}</p>
              <p className="mt-1 font-serif text-[0.95rem] leading-snug text-fg">
                {s.authors} ({s.year ?? "o. J."}). {s.title}. <span className="italic text-fg2">{s.venue}</span>.
              </p>
              <p className="mt-1.5 font-serif text-[0.88rem] leading-snug text-fg3">
                <span className="text-fg2">{s.design}.</span> {s.finding}
              </p>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer" className="mt-1.5 inline-block break-all font-mono text-[0.72rem] text-accent underline decoration-line underline-offset-4 hover:decoration-accent">
                  {s.url.includes("?term=") ? "PubMed-Suche nach dem Titel" : s.url.replace(/^https:\/\//, "")}
                </a>
              ) : (
                <p className="mt-1.5 font-mono text-[0.72rem] text-fg3">Buch, kein Online-Link</p>
              )}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
