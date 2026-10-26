# Modul: Schlaf-Architektur & Zirkadianer Licht-Code

Teil des **Allrounder Life-Optimization Protokolls**. Eine einzelne, eigenständige Datei: `index.html` im Browser öffnen. Ohne Internet fallen nur die Google Fonts weg, alles andere (Grafiken, Simulator) läuft lokal.

| Bereich | Inhalt |
|---|---|
| Hero | 4 Stat-Cards mit Studie, Design, n und Gegenevidenz, Legende der Evidenzgrade |
| Kapitel 01 | Hypnogramm (SVG, 3 Szenarien: normal, später ins Bett, früher Wecker), Tiefschlaf- vs. REM-Karte |
| Kapitel 02 | 24-h-Doppelwelle Cortisol/Melatonin, Netzhaut-Diagramm, Lux-Skala (log), Morgen-/Abend-Protokoll |
| Kapitel 03 | Myth-Buster Night Shift / Blaulichtbrille vs. Raumhelligkeit |
| Kapitel 04 | 3 Co-Faktoren: Thermoregulation, Essensabstand, Aufstehzeit |
| Kapitel 05 | Simulator mit 4 Eingaben, Live-Diagramm und 4 KPIs, offen gelegtes Rechenmodell |
| Quellen | 69 Einträge mit Design und Stichprobengröße |

## Faktencheck: was gegenüber dem Briefing geändert wurde

Jede Zahl im Briefing wurde gegen die Primärliteratur geprüft. Wo sie nicht trägt, steht im Modul die belegte Version, bei Mythen sichtbar als „✕ Nicht bestätigt“ oder „Korrektur“.

| Briefing | Im Modul | Grund |
|---|---|---|
| −55 % Fettverlust / +60 % Muskelabbau, `••• BELEGT` | Fettanteil am Gewichtsverlust −55 %, fettfreie Masse +60 %, `••o HINWEISE` | Nedeltcheva 2010 hat n = 10 und läuft 14 Tage. Gemessen wurde fettfreie Masse, nicht Muskel. Die Richtung bestätigt Wang 2018 (n = 36). |
| −10–15 % Testosteron, `••• BELEGT` | `••o HINWEISE` + `UMSTRITTEN` | Leproult 2011: n = 10, ohne Kontrollgruppe. Smith 2019 (2 RCTs) fand keinen Abfall, die Meta-Analyse Su 2021 sieht einen klaren Effekt nur bei durchwachten Nächten. „10–15 Jahre Alterung“ stammt aus der Pressemitteilung. |
| ~70 % HGH „exklusiv“ im Tiefschlaf | „~70 % bei Männern im frühen Schlaf“, Muskelwirkung `•oo` | Bei Frauen ist der Anteil kleiner. GH-Gabe steigert beim Erwachsenen weder Kraft (Liu 2008) noch myofibrilläre Proteinsynthese (Doessing 2010). |
| 16-Stunden-Countdown durch Morgenlicht | Uhr-Nachstellung, Melatonin-Anstieg ~2 Std. vor dem Einschlafen | Die innere Uhr ist ein Oszillator (~24,2 Std., Czeisler 1999) und keine Stoppuhr. |
| Spät ins Bett = Großteil des Tiefschlafs weg | `✕ NICHT BESTÄTIGT` | Tiefschlaf ist homeostatisch gesteuert und kommt zuerst (Dijk & Czeisler 1995). Bei Schlafrestriktion bleibt er erhalten, es fehlen REM und N2 (Van Dongen 2003). |
| Gehirnzellen schrumpfen um 60 % | Zwischenzellraum +60 %, nur Maus, `UMSTRITTEN` | Xie 2013 misst den Interstitialraum. Miao 2024 findet in der Maus weniger Clearance im Schlaf. |
| Tiefschlaf füllt Muskel-Glykogen | `•oo HYPOTHESE` | Keine Humanstudie gefunden. |
| REM konsolidiert Bewegungsabläufe | `✕` für REM, `UMSTRITTEN` | Walker 2002 fand den Zusammenhang mit N2 in der späten Nacht. Pan & Rickard 2015 bezweifeln einen eigenen Schlafeffekt. |
| Morgenlicht setzt den Cortisol-Peak | `••o` + `UMSTRITTEN` | Die Aufwachreaktion läuft auch im Dunkeln. Lichteffekte auf Cortisol sind uneinheitlich (Robertson-Dixon 2023 vs. Jung 2010). |
| Glas schluckt 50–80 % der Photonen | `✕` für normale Fenster | Isolierglas lässt 70–80 % durch. Der große Verlust entsteht durch den Raum (Tageslichtquotient ~2 %, EN 17037). |
| Abend-Abschaltung ab 2 Std., < 10–30 lx | 2–3 Std., ≤ 10 lx melanopisch (≈ 20–25 lx warmweiß) | Experten-Konsens Brown 2022 setzt 3 Std. an. |
| Night Shift: „Schlaflabor-Studien“, Mouland 2019 als Beleg | Duraccio = Aktigraphie im Feld. Mouland ist eine Mausstudie. Gegenevidenz ergänzt (Chang 2015, Schöllhorn 2023) | Korrekte Zuordnung der Studiendesigns. |
| „Dopamin-Aktivierung“ beim Scrollen | Kognitive Aktivierung + verdrängte Schlafzeit. Dopamin `•oo` | Beim Menschen nicht direkt gemessen. |
| Gooley 2011: Melatonin 90 Min. verzögert, > 50 % gedrückt vor dem Einschlafen | Melatonin-Phase 90 Min. kürzer. > 50 % betrifft Licht während der üblichen Schlafenszeit | So steht es im Abstract. |
| Körperkern muss um ~1 °C sinken | Keine feste −1 °C-Schwelle. Schlafbedingter Abfall ~0,3 °C | Barrett 1993, Kräuchi 1999 |
| 16–18 °C Raumtemperatur | 16–20 °C als Faustregel, belegt ist vor allem: Hitze stört | Okamoto-Mizuno 2012, Minor 2022, Baniassadi 2023 (Ältere: 20–25 °C) |
| Essen: Ruhepuls +5–10, HGH-Bremse | `•oo HYPOTHESE`, Reflux-Schutz als belegter Kern | Keine Humanstudie gefunden. Duan 2021: keine Änderung der Schlafstadien. Fujiwara 2005: OR 7,45 für Reflux. |
| Hero-Subline „der gesamte Muskelaufbau … findet nachts statt“ | Abgeschwächt | Muskelproteinsynthese läuft rund um die Uhr. Training kann Folgen von Schlafmangel teils abfedern (Saner 2020). |

Die Headline „Es ist dein stärkstes Anabolikum“ ist geblieben und auf der Seite als Metapher markiert.

## Simulator-Modell

Das Modell ist ein Lernmodell für eine junge, gesunde Person und keine Vorhersage. Die vollständige Tabelle steht auf der Seite unter „So rechnet der Simulator“. Die wichtigsten Anker:

- Schlafzyklen à 90–95 Min., Tiefschlaf zuerst, REM mit circadianem Gipfel gegen 05:30.
- Fettanteil am Gewichtsverlust: linear zwischen 5,5 Std. (20 %) und 8,5 Std. (48 %), berechnet aus den Absolutwerten von Nedeltcheva 2010. Außerhalb dieses Bereichs gilt der Randwert.
- Helles Deckenlicht: Melatonin-Unterdrückung so kalibriert, dass der Anstieg ~90 Min. später kommt (Gooley 2011). Die Werte für Handy und gedimmtes Licht sowie der Morgenlicht-Effekt (+20 Min.) sind als **Annahme** gekennzeichnet.
- Anaboles Potenzial = Mittelwert aus GH-Proxy (Tiefschlaf), Testosteron (Leproult 2011) und Muskelproteinsynthese (Saner 2020).

## Hinweis zur Quellenprüfung

PubMed, PMC und Europe PMC waren aus der Build-Umgebung nicht direkt erreichbar. Die Angaben wurden deshalb über Websuche gegen Abstracts, Verlagsseiten und Repositorien geprüft. Bei Quellen, deren Datensatz nicht direkt verifiziert werden konnte, verlinkt das Modul auf eine PubMed-Suche statt auf eine geratene DOI.
