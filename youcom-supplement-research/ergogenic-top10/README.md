# You.com Research Playground – Top 10 ergogene Supplements (Energiesysteme)

| Feld im Playground | Inhalt |
|---|---|
| **Input** | `01_INPUT_prompt.txt` komplett einfügen (24.676 Zeichen, nur ASCII, Limit 40.000) |
| **Research effort** | `Frontier` |
| **Background** | **AN** (Pflicht bei Frontier, sonst HTTP 422) |
| **Output schema** | `02_OUTPUT_SCHEMA.json` komplett einfügen |
| **Freshness** | `Default: No limits` (nicht ändern) |
| **Country** | `Default: All countries` (nicht ändern) |
| **Include domains** | **leer lassen** (darf laut API nicht mit Exclude/Boost kombiniert werden) |
| **Exclude domains** | `03_EXCLUDE_domains.txt` (57 Domains, je eine Zeile pro `+`) |
| **Boost domains** | `04_BOOST_domains.txt` (21 Domains, je eine Zeile pro `+`) |

`05_API_request_body.json` enthält alles zusammen als Request-Body für `POST /v1/research`,
falls du die Domains nicht einzeln anklicken willst.

## Schema-Prüfung (durchgeführt)
- Valide nach JSON Schema Draft 2020-12 und Draft 7.
- `additionalProperties: false` und vollständiges `required` auf jeder Objektebene.
- You.com-Limits: Tiefe 5/5, 46/100 Properties, 12/500 Enum-Werte, ca. 1.000/25.000 Zeichen String-Budget.
- Nur die Keywords `type`, `properties`, `required`, `additionalProperties`, `items`, `enum`.
  `minItems`/`maxItems`/`minimum`/`maximum` sind bewusst weggelassen, weil die unterstützte
  Teilmenge nicht vollständig dokumentiert ist. „Genau 10, Rang 1–10“ steht deshalb im Prompt.
- Einzige Ergänzung gegenüber der Vorgabe: `anti_doping_status_and_contraindications` pro Supplement
  (sonst gäbe es für WADA-Status und Kontraindikationen kein Feld).

## Falls Frontier + Output schema mit 422 abgelehnt wird
Die API-Referenz nennt `frontier` als unterstützt, die README des Python-SDK (youdotcom 3.6.0)
nennt nur `standard`, `deep` und `exhaustive`. Dann `Research effort` auf `Exhaustive` stellen,
Background AN lassen, sonst nichts ändern.

## Antwort prüfen
```
python3 -m json.tool antwort.json > /dev/null && echo "valide"
```
