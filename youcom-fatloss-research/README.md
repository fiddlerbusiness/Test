# You.com Research: Fettabbau + Muskelerhalt (modulare Version)

Der ursprüngliche Frontier-Lauf (Task `97b5a93f-…`) ist nach gut drei Stunden mit einem Timeout gescheitert. Dieser Ordner enthält dieselbe Recherche, aufgeteilt in **6 Evidenz-Module + 1 Synthese-Lauf**, und ein Tool, das die Einzelergebnisse prüft und zu **einem JSON im Original-Schema** zusammenführt.

## 1. Warum der Lauf gescheitert ist

**Fakten aus dem Task-Status**
- Laufzeit 3 h 10 min 27 s (erstellt 20:31:39 UTC, gescheitert 23:42:06 UTC), also ca. 11.427 s.
- Fehler: Ein interner LLM-Aufruf hat sein Timeout von 400 s überschritten (`litellm.Timeout … Timeout passed=400.0`). Auch alle Fallback-Versuche sind gescheitert.

**Fakten aus der You.com-Doku** (Quellen unten)
- Frontier hat eine Latenz von 30 bis 12.000 s (Median 300 s). Der Lauf lag also bei rund 95 % des dokumentierten Maximums.
- Input-Limit: 40.000 Zeichen (genutzt waren 23.538).
- Schema-Limits: Tiefe 5, 100 Properties, 500 Enum-Werte, 25.000 Zeichen Namensbudget. Das Original-Schema liegt darunter (Tiefe 5, 73 Properties, 50 Enum-Werte, 1.685 Zeichen; gemessen mit `tools/build_prompts.py`). Ein Verstoß hätte laut Doku sofort einen 422-Fehler ausgelöst, nicht erst nach drei Stunden.

**Schlussfolgerung** (von You.com nicht bestätigt, die Doku nennt keine Timeout-Ursachen): Der Umfang war das Problem.
- Der Prompt verlangte separate Suchen für 23 Kandidaten, 10 Konflikte und 10 Heuristiken. Dazu kamen die Prüfung von rund 55 Seed-Papern, Zitationsketten in beide Richtungen und Retraction-Checks.
- Am Ende sollte alles in **ein** JSON: 10 Tiefen-Dossiers, mindestens 8 Konflikte, mindestens 6 Synergien und mindestens 40 Referenzen. Grob geschätzt sind das über 20.000 Wörter.
- Der letzte Schreibschritt musste das in einem Aufruf aus dem über Stunden angesammelten Kontext erzeugen und brauchte länger als 400 s.

Ein unveränderter Neustart dürfte deshalb an derselben Stelle scheitern.

## 2. Die Aufteilung

| Lauf | Input-Datei | Inhalt (Dossiers) | Heuristiken | Konflikte | Limitationen | Zeichen |
|---|---|---|---|---|---|---|
| M1 | `M1_protein_macros_INPUT.txt` | Protein inkl. Verteilung, Kreatin, Makro-Muster (Low-Carb vs. Low-Fat), Mahlzeitenersatz | H1, H4 | K5, K6 | L1, L2 | 14.525 |
| M2 | `M2_training_activity_INPUT.txt` | Krafttraining, Ausdauer/HIIT, Aktivitätsvolumen inkl. Sitzzeit | H3, H5 | K4, K7, K10 | L3, L4 | 14.189 |
| M3 | `M3_deficit_metabolic_INPUT.txt` | Defizitgröße/Abnahmetempo, VLED + Erhaltungsprogramm, Reverse Dieting | H2, H8, H10 | K2, K9 | L5, L6 | 13.798 |
| M4 | `M4_intermittent_timing_INPUT.txt` | Diet Breaks, Refeeds, Intervallfasten, Mahlzeiten-Timing | H6 | K1, K3, K8 | L7 | 13.294 |
| M5 | `M5_behavioral_INPUT.txt` | Selbstwiegen, Food-Tracking, Verhaltenstherapie, Nachbetreuung | H9 | – | L8, L9 | 13.087 |
| M6 | `M6_diet_quality_sleep_stress_INPUT.txt` | Energiedichte/UPF, flexible Restriktion, Schlaf, Stress | H7 | – | L10, L11 | 12.498 |
| M7 | `results/M7_synthesis_INPUT.txt` (wird erzeugt) | Ranking aller Kandidaten, Synergie-Matrix, Zielwerte, ausgeschlossene Kandidaten | – | – | – | ≤ 40.000 |

Nichts ist weggefallen:
- Alle 23 Kandidaten sind abgedeckt. „Sitzzeit begrenzen“ steckt im Aktivitätsvolumen-Dossier, daher 22 Dossiers.
- Abgedeckt sind auch alle 10 Heuristiken (H = Abschnitt 5), alle 10 Konflikte (K = Abschnitt 6), alle 11 Limitationen aus Abschnitt 8 und alle Seed-Paper.

## 3. Einstellungen im Playground

| Feld | M1–M6 | M7 |
|---|---|---|
| Input | jeweilige `…_INPUT.txt` komplett | `results/M7_synthesis_INPUT.txt` |
| Research effort | **Frontier** | **Exhaustive** |
| Background | **AN** (bei Frontier Pflicht) | **AN** |
| Output schema | `M1-M6_SCHEMA.json` (gleich für alle sechs) | `M7_synthesis_SCHEMA.json` |
| Include domains | `include_domains.txt` (32 Domains) | `include_domains.txt` |
| Exclude domains | leer (laut Doku nicht mit Include kombinierbar) | leer |
| Freshness / Country | Default | Default |

Falls das Feld nur eine kommagetrennte Liste annimmt:
`pubmed.ncbi.nlm.nih.gov, pmc.ncbi.nlm.nih.gov, ncbi.nlm.nih.gov, europepmc.org, cochranelibrary.com, doi.org, jissn.biomedcentral.com, biomedcentral.com, tandfonline.com, bjsm.bmj.com, bmj.com, journals.humankinetics.com, journals.lww.com, academic.oup.com, ajcn.nutrition.org, sciencedirect.com, cell.com, nature.com, link.springer.com, onlinelibrary.wiley.com, faseb.onlinelibrary.wiley.com, jamanetwork.com, nejm.org, thelancet.com, acpjournals.org, annualreviews.org, ahajournals.org, cmaj.ca, mdpi.com, frontiersin.org, journals.physiology.org, karger.com`

**Kosten** laut You.com-Preisangaben:
- Frontier: 1.200 $ pro 1.000 Anfragen, also 1,20 $ pro Lauf.
- Exhaustive: 450 $ pro 1.000, also 0,45 $ pro Lauf.
- Alle sieben Läufe zusammen kosten etwa 7,65 $, Wiederholungen nicht eingerechnet.

## 4. Ablauf

Alle Befehle im Ordner `youcom-fatloss-research/` ausführen. Nötig ist Python 3.8 oder neuer, ohne zusätzliche Pakete. Unter Windows `py` statt `python3` und `\` statt `/` verwenden.

1. **Pilot: M1 starten.** Nach Abschluss das Ergebnis als `results/M1.json` speichern. Beide Varianten gehen:
   - die komplette Antwort per Download, mit `sources`: Dann prüft das Tool zusätzlich, ob jede Referenz in der Quellenliste von You.com vorkommt.
   - nur den JSON-Inhalt per Kopieren.
2. **Prüfen:** `python3 tools/youcom_pipeline.py check results/M1.json`
3. **M2–M6** genauso starten (parallel möglich), speichern und prüfen.
4. **Synthese-Input bauen:** `python3 tools/youcom_pipeline.py synth-input "results/M[1-6].json"`
   Das ergibt `results/M7_synthesis_INPUT.txt`. Das Tool kürzt automatisch auf unter 40.000 Zeichen und zeigt die Kürzungsstufe an.
5. **M7** mit dieser Datei laufen lassen, als `results/M7.json` speichern, `check` ausführen.
6. **Zusammenführen:** `python3 tools/youcom_pipeline.py merge "results/M*.json"` erzeugt `results/final_merged.json` im Format von `00_original_output_schema.json`. Dabei passiert Folgendes:
   - Die Top 10 kommen in der Reihenfolge des M7-Rankings, mit den vollständigen Modul-Dossiers.
   - Die Heuristik-Tests landen als `evidence_conflicts`-Einträge „Heuristic test Hx: …“, weil das Original-Schema dafür kein eigenes Feld hat.
   - Alle Limitationen werden übernommen.
   - Referenzen werden über DOI dedupliziert und auf `FirstAuthorYear` umbenannt, mit Buchstaben-Suffix nur bei Dubletten. Es bleiben nur zitierte Referenzen.

**Was `check` und `merge` prüfen:**
- Schema-Konformität
- Jede zitierte ID löst auf, und jede Referenz wird zitiert.
- Formel des gewichteten Scores, C3 passend zum Evidenzgrad
- Vollständigkeit: Kandidaten sowie H-, K- und L-Einträge
- Präfixe der Referenz-IDs, URL-Format und Abgleich mit der Quellenliste

Die wissenschaftliche Richtigkeit prüft das Tool **nicht**.

## 5. Wenn ein Modul trotzdem scheitert

1. Den Fehlertext im Feld `error` des Task-Status lesen. Kommt sofort ein 422, ist ein Input- oder Schema-Limit verletzt. Ein Timeout nach langer Laufzeit bedeutet: zu viel Umfang.
2. Dasselbe Modul mit **Exhaustive** wiederholen (laut Doku unter 300 s).
3. **Modul teilen:**
   - Input kopieren und in `SCOPE` Punkte löschen.
   - Per Suchen/Ersetzen `M2-` durch `M2a-` und `MODULE_ID: M2` durch `MODULE_ID: M2a` ersetzen. Der zweite Teil bekommt entsprechend `M2b`.
   - Das Tool erkennt Teil-Läufe an der ID. Gleiche IDs in zwei Dateien lehnt es ab.
4. **Ausgabe weiter verkleinern:** In `OUTPUT RULES` `references: 10-25` auf `8-15` und `below about 7,000 words` auf `5,000` ändern.

## 6. Änderungen gegenüber dem Original-Prompt

Inhaltliche Standards, Definitionen, Populationen, Evidenzhierarchie, Grading und Integritätsregeln sind übernommen. Geändert wurde:

- **Aufteilung** wie oben beschrieben, ohne Streichungen. Jedes Modul bekommt nur seine Seed-Paper und eigene Suchbeispiele.
- **Suchbudget:** Pro Frage die aktuellste umfassende Meta-Analyse, die größten und längsten RCTs und gezielt Null- oder Gegenbefunde. Zitationsketten nur einen Schritt in jede Richtung, Retraction-Checks nur für grade-bestimmende Quellen.
- **Längenlimits:** Wortgrenzen pro Feld, höchstens etwa 7.000 Wörter pro Modul (M7: 4.000) und 10 bis 25 Referenzen pro Modul.
- **Bewertungsanker für C1–C5 (neu):** Die Module bewerten getrennt und brauchen deshalb eine gemeinsame Skala. Die Anker sind eine pragmatische Festlegung, keine Literaturvorgabe. M7 darf jeden Modul-Score um höchstens 1,0 Punkte pro Kriterium kalibrieren und muss jede Änderung begründen.
- **Referenz-IDs mit Modulpräfix** (z. B. `M1-Helms2014a`) plus Feld `retrieved_url`, damit sich Referenzen gegen die Quellenliste prüfen und beim Zusammenführen deduplizieren lassen.
- **Überlappende Paare** (H1/K5, H2/K2, H5/K7, H6/K3, H10/K9) haben eine feste Arbeitsteilung, damit kein Text doppelt erzeugt wird.
- **Include domains:** `karger.com` ist ergänzt, weil die EASO-Leitlinien in Obesity Facts erscheinen. Sonst sind es deine 31 Domains.

Prompts und Schemas werden aus `tools/build_prompts.py` erzeugt. Änderungen am besten dort vornehmen und dann `python3 tools/build_prompts.py` ausführen. Das Skript überschreibt die Input- und Schema-Dateien und prüft die Limits.

## 7. Grenzen dieser Lösung

- Die Fehlerursache ist eine Schlussfolgerung aus Task-Status und Doku. Ein interner Log von You.com lag nicht vor.
- you.com war aus der Arbeitsumgebung, in der diese Dateien entstanden sind, nicht erreichbar. Die Doku-Angaben stammen aus dem Suchindex der offiziellen Seiten (Stand Oktober 2026), nicht aus einem direkten Seitenabruf. Einzelne Latenzangaben unterscheiden sich zwischen den Doku-Seiten.
- Die Prompts sind nicht live auf You.com getestet. Das Tool ist mit synthetischen Testdaten getestet, einschließlich der Fehlerfälle: erfundene ID, falscher Score, abgeschnittenes JSON, doppelte Modul-ID.
- Scores aus getrennten Läufen sind nur bedingt vergleichbar. Anker und M7-Kalibrierung mildern das, beseitigen es aber nicht.
- Der Abgleich mit der Quellenliste ist heuristisch (DOI, PMID, URL). „Nicht gefunden“ heißt „manuell prüfen“, nicht „erfunden“.

## Dateien

| Datei | Zweck |
|---|---|
| `M1…M6_*_INPUT.txt` | Input-Texte der Evidenz-Module |
| `M1-M6_SCHEMA.json` | Output-Schema für alle sechs Module (57 Properties, Tiefe 5) |
| `M7_synthesis_INPUT_TEMPLATE.txt` | Vorlage für M7; `synth-input` füllt `<<<EVIDENCE_PACK>>>` |
| `M7_synthesis_SCHEMA.json` | Output-Schema für M7 (57 Properties, Tiefe 5) |
| `00_original_output_schema.json` | Dein Original-Schema, Zielformat für `merge` |
| `include_domains.txt` | Domain-Liste, eine pro Zeile |
| `tools/build_prompts.py` | Erzeugt Inputs und Schemas und prüft die You.com-Limits |
| `tools/youcom_pipeline.py` | `check`, `synth-input`, `merge` |
| `results/` | Ablage für die You.com-Ergebnisse |

## Quellen (You.com-Doku)

- API-Referenz Research: Input-Limit, Effort-Level, `output_schema`-Regeln und -Limits, Include/Exclude-Regel: <https://you.com/docs/api-reference/research/v1-research>
- Research-Guide: Latenz und Preise pro Effort-Level: <https://you.com/docs/guides/research>
- Changelog 20.07.2026: Background-Modus, Frontier nur im Background: <https://you.com/docs/changelog/2026/7/20>
- Task-Status: `failed` mit Diagnose im Feld `error`: <https://you.com/docs/api-reference/research/v1-research-task>
- Preise: <https://you.com/pricing>
