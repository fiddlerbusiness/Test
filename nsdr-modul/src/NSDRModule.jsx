import React from "react";
import Hero from "./components/Hero.jsx";
import WhatIsNSDR from "./components/WhatIsNSDR.jsx";
import BrainMechanisms from "./components/BrainMechanisms.jsx";
import BrainwaveVisualizer from "./components/BrainwaveVisualizer.jsx";
import EffectCards from "./components/EffectCards.jsx";
import SessionAnatomy from "./components/SessionAnatomy.jsx";
import UseMatrix from "./components/UseMatrix.jsx";
import ScrollVsNSDR from "./components/ScrollVsNSDR.jsx";
import HypeCheck from "./components/HypeCheck.jsx";
import { SafetyLimits, SourceList } from "./components/SafetyAndSources.jsx";
import { Section } from "./components/ui.jsx";

const TOC = [
  ["was-ist-nsdr", "1 · Was ist NSDR"],
  ["hirnebene", "2 · Hirnebene"],
  ["visualizer", "Visualizer"],
  ["effekte", "3 · Effekte"],
  ["session", "4 · Session"],
  ["einsatz", "5 · Einsatz"],
  ["vergleich", "Scrollen vs. NSDR"],
  ["faktencheck", "Faktencheck"],
  ["quellen", "Quellen"],
];

/**
 * NSDR-Modul des „Allrounder Life-Optimization Protokolls“.
 * Erwartet die Tokens und Tailwind-Layer aus styles.css (Dark Mode).
 */
export default function NSDRModule() {
  return (
    <div className="min-h-full bg-bg font-display text-fg antialiased">
      <Hero />

      <nav aria-label="Inhalt" className="nsdr-gutter pb-6">
        <ul className="mx-auto flex max-w-panel flex-wrap gap-2">
          {TOC.map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="inline-block rounded-full border border-line px-3 py-1.5 font-mono text-[0.75rem] text-fg2 no-underline transition-colors hover:border-accent hover:text-fg"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="divide-y divide-line border-t border-line">
        <WhatIsNSDR />
        <BrainMechanisms />
        <Section
          id="visualizer"
          eyebrow="Interaktiv"
          title="Gehirnwellen- & Effekt-Visualizer"
          intro={
            <p>
              Zieh den Regler durch eine typische 20-Minuten-Session oder spiel sie im Zeitraffer ab. Die Welle wird langsamer und wechselt von Rot (Beta) zu Blau (Theta), parallel steigen die drei Effekt-Balken. Die
              Kurven sind ein schematisches Modell aus den Befunden oben, keine Messwerte einer echten Person.
            </p>
          }
        >
          <BrainwaveVisualizer />
        </Section>
        <EffectCards />
        <SessionAnatomy />
        <UseMatrix />
        <ScrollVsNSDR />
        <HypeCheck />
        <SafetyLimits />
        <SourceList />
      </main>

      <footer className="nsdr-gutter border-t border-line py-10">
        <div className="mx-auto flex max-w-panel flex-col gap-2 font-mono text-[0.75rem] text-fg3 sm:flex-row sm:justify-between">
          <p>Allrounder Life-Optimization Protokoll · Modul NSDR · Recherche-Stand Oktober 2026</p>
          <p>Bildung, keine medizinische Beratung.</p>
        </div>
      </footer>
    </div>
  );
}
