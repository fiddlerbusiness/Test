# You.com Research Playground – Konfiguration für die Supplement-Tiefenrecherche

| Feld im Playground | Inhalt |
|---|---|
| **Input** | `01_INPUT_prompt.txt` vollständig einfügen (38.199 Zeichen, nur ASCII, Limit 40.000) |
| **Research effort** | `Frontier` (Alternative: `Exhaustive`) |
| **Background** | **AN** (bei Frontier ohnehin Pflicht) |
| **Output schema** | **leer lassen** (Variante 1). Fallback: `02_OUTPUT_SCHEMA_fallback.json` (Variante 2) |
| **Freshness** | `Default: No limits` |
| **Country** | `Default: All countries` |
| **Include domains** | **leer lassen** |
| **Exclude domains** | `03_EXCLUDE_domains.txt` (90 Domains) |
| **Boost domains** | `04_BOOST_domains.txt` (20 Domains) |

## Pillar-Läufe statt eines Gesamtlaufs (optional)
Erste Zeile im Input: `RUN_SCOPE: ALL_PILLARS`. Wenn der Gesamtlauf abgeschnitten wird (`omitted_due_to_length` ist nicht leer oder das JSON ist ungültig), drei Läufe mit
`STRENGTH_ONLY`, `ENDURANCE_ONLY` und `TESTOSTERONE_ONLY` starten. Die JSON-Struktur bleibt identisch, die Ergebnisse lassen sich zusammenführen.

## Variante 2 (Output-schema-Feld nutzen)
1. `02_OUTPUT_SCHEMA_fallback.json` in das Feld **Output schema** einfügen.
2. Im Input den gesamten Abschnitt `### 10. OUTPUT INSTRUCTION (strict)` bis zum Ende löschen und ersetzen durch:

```
### 10. OUTPUT INSTRUCTION
Return the result in the JSON format defined by the output schema. Apply all evidence rules above. Reference evidence only via source_ids that point to entries in "sources". Use null where a value is not reported. For testosterone, create separate rows for "deficient or low baseline" and "replete or eugonadal".
```

So widersprechen sich die Text-Spezifikation und das Schema nicht.

## JSON prüfen
```
python3 -m json.tool antwort.json > /dev/null && echo "valide"
```
