#!/usr/bin/env python3
"""Generate the You.com Research inputs and output schemas for the modular review.

    python3 tools/build_prompts.py

Writes the six module inputs (M1-M6), the shared module schema, the M7
synthesis template and schema and the include-domain list into the parent
folder, then prints input sizes and the You.com output_schema limit check.
Only the Python standard library is used.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# You.com Research API (v1 research reference): input <= 40,000 characters;
# output_schema: depth <= 5, <= 100 properties, <= 500 enum values,
# <= 25,000 characters of property names + enum values.
INPUT_LIMIT = 40_000
SCHEMA_LIMITS = {"depth": 5, "properties": 100, "enum_values": 500, "string_budget": 25_000}

MODULE_SCHEMA_FILE = "M1-M6_SCHEMA.json"
SYNTHESIS_SCHEMA_FILE = "M7_synthesis_SCHEMA.json"
SYNTHESIS_TEMPLATE_FILE = "M7_synthesis_INPUT_TEMPLATE.txt"
EVIDENCE_PACK_PLACEHOLDER = "<<<EVIDENCE_PACK>>>"

INCLUDE_DOMAINS = [
    "pubmed.ncbi.nlm.nih.gov", "pmc.ncbi.nlm.nih.gov", "ncbi.nlm.nih.gov", "europepmc.org",
    "cochranelibrary.com", "doi.org", "jissn.biomedcentral.com", "biomedcentral.com",
    "tandfonline.com", "bjsm.bmj.com", "bmj.com", "journals.humankinetics.com",
    "journals.lww.com", "academic.oup.com", "ajcn.nutrition.org", "sciencedirect.com",
    "cell.com", "nature.com", "link.springer.com", "onlinelibrary.wiley.com",
    "faseb.onlinelibrary.wiley.com", "jamanetwork.com", "nejm.org", "thelancet.com",
    "acpjournals.org", "annualreviews.org", "ahajournals.org", "cmaj.ca", "mdpi.com",
    "frontiersin.org", "journals.physiology.org", "karger.com",
]

# --------------------------------------------------------------------------
# Shared prompt text
# --------------------------------------------------------------------------

SCORING = """Score each candidate 0-5 in steps of 0.5. Every module uses the same scale and the synthesis compares scores across modules, so score in absolute terms, never relative to the other candidates of one module.
- C1 effect on the long-term weight/fat outcome >=12 months (weight 0.30): 5 = clinically relevant effect replicated in RCTs/meta-analyses at >=24 months; 4 = replicated at 12 months; 3 = small but consistent, or strong before 12 months with plausible persistence; 2 = inconsistent or short-term only; 1 = associational only; 0 = null, harmful or not targeted.
- C2 lean-mass / skeletal-muscle preservation (0.25): 5 = clinically meaningful sparing replicated in RCTs/meta-analyses; 4 = replicated but modest, or DXA-only with glycogen/water caveats; 3 = small or inconsistent; 2 = short trials or indirect evidence only; 1 = acute MPS or mechanistic data only; 0 = none, negative or not targeted.
- C3 certainty of evidence = the overall evidence_grade (0.25): high = 4.5-5; moderate = 3-4; low = 1-2.5; 0 if both outcomes are insufficient.
- C4 generalisability across P1, P2 and P3 (0.10): 5 = direct evidence in all three; 3 = in two; 1.5 = in one; 0 = in none; adjust by up to 0.5 for transfer plausibility.
- C5 feasibility, adherence and safety (0.10): 5 = easy, good long-term adherence, safe; 0 = impractical or unsafe.
weighted = 0.30*C1 + 0.25*C2 + 0.25*C3 + 0.10*C4 + 0.10*C5, rounded to 2 decimals (maximum 5.00)."""

CORE_HEAD = """MODULE_ID: {MID}

CONTEXT
This run is module {MID} of a modular evidence review: six evidence modules (M1-M6) and one synthesis run (M7) that ranks all candidates of all modules. Cover ONLY the scope of this module; the other strategies are reviewed in other runs. Depth within scope beats breadth.

OVERALL RESEARCH QUESTION (context for scoring)
Which strategies (nutrition, training, behavioral/psychological, recovery/lifestyle incl. sleep, metabolic management) are best supported by the evidence for (A) losing body fat and keeping it off long term (weight-loss maintenance, WLM: >=12 months, ideally >=24 months after the end of active weight loss), while (B) preserving as much fat-free mass as possible, specifically skeletal muscle, during the energy deficit and afterwards?

ROLE AND STANDARD
You are a senior research scientist working at the intersection of obesity medicine, exercise physiology and sports nutrition. Work to the standard of a Cochrane-style rapid review combined with an ISSN/ACSM position stand: every claim traceable to a source you actually retrieved in this run, quantified with effect sizes and absolute numbers, and graded for certainty. Accuracy beats completeness: an honest "insufficient evidence" is better than a confident guess. Literature up to 2026 is in scope; say whether newer evidence confirms, modifies or overturns older conclusions.
"""

CORE_RULES = """DEFINITIONS
- Outcome A (long-term weight/fat): weight or fat-mass change and regain at 12, 24 and >=36 months. Report regain in kg and as % of the weight lost where possible. Reference definition of successful WLM: intentional loss of >=10% of initial body weight maintained for >=1 year (Wing & Hill 2001).
- Outcome B (muscle): change in lean mass, fat-free mass (FFM), appendicular lean mass or directly measured skeletal muscle (MRI, CT, D3-creatine dilution), and the proportion of weight lost as FFM (delta FFM / delta body weight). Always state the method and keep apart: DXA lean soft tissue (includes water and glycogen), FFM from BIA, air-displacement or hydrostatic weighing, and direct muscle imaging.
- Secondary outcomes: fat mass, strength and physical function, resting energy expenditure, appetite, adherence, attrition.
- Populations (stratify; never transfer findings silently): P1 adults with overweight or obesity (BMI >=25); P2 lean, resistance-trained individuals and physique athletes; P3 adults >=60 years incl. sarcopenic obesity. For every number state the source population and whether, and why, it applies to the others.
- Anti-obesity medication and bariatric surgery are never candidates; cite them only where this module asks for context.

SOURCES AND EVIDENCE HIERARCHY
Use peer-reviewed literature, systematic reviews and guidelines (PubMed/MEDLINE, PMC, Europe PMC, Cochrane Library, journal pages). Do not use magazines, blogs, commercial sites, forums, videos, Wikipedia or summary sites as evidence; if such a page points to a study, retrieve and cite the primary study. Strongest first:
1. Umbrella reviews and meta-analyses of RCTs (prefer recent, PRISMA-compliant, with risk-of-bias or GRADE assessment). Use the most recent and most comprehensive one and check whether later RCTs changed the conclusion.
2. Position stands and guidelines: expert synthesis. Name the data under each recommendation and mark recommendations that rest mainly on expert opinion.
3. Large and/or long RCTs (>=12 months).
4. Prospective cohorts and registries (e.g. NWCR): associational only; self-selection and survivorship bias apply.
5. Short RCTs and acute MPS/mechanistic studies: mechanism only, never the sole basis for a "high" grade.

SEARCH PLAN AND BUDGET (stay focused: a single-run version of this whole review timed out)
For each scope item, heuristic and conflict: (1) find the most recent comprehensive meta-analysis or systematic review; (2) find the largest and longest RCTs; (3) search explicitly for null and contradicting results ("no difference", "did not differ", "no effect", "weight regain"); (4) verify the seed papers. Follow citation trails at most one step backward and one step forward from the key meta-analyses. Check retractions, errata and expressions of concern for the sources that determine a grade. Then stop searching and write the answer.

GRADING (GRADE-inspired; grade both outcomes separately in evidence_grade_by_outcome)
- high: >=1 high-quality meta-analysis of RCTs, or several concordant RCTs with low risk of bias; replicated, consistent and directly applicable to the outcome and population.
- moderate: meta-analyses with substantial heterogeneity or indirectness (short follow-up, surrogate outcome, other population), only a few RCTs, or consistent prospective cohorts/registries.
- low: single or small trials, acute/mechanistic studies, cross-sectional or registry associations alone, expert opinion.
- insufficient (outcome level only): no adequate data for that outcome. not_applicable (outcome level only): the strategy does not target that outcome.
The overall evidence_grade is the certainty for the outcome that justifies the score; name that outcome in evidence_grade_rationale. If both outcomes are insufficient, use "low" and C3 = 0.
Label key claims in text fields: [ESTABLISHED] = replicated across multiple RCTs or meta-analyses; [PRELIMINARY] = single study, small samples or short duration; [HYPOTHESIS] = mechanistic extrapolation or theory without outcome data.

SCORING
{SCORING}

CITATION AND INTEGRITY RULES (mandatory)
1. Cite only sources you actually retrieved in this run. Never construct a DOI, PMID, author list, title, page range or number from memory. If you cannot verify a detail, leave the reference out.
2. Reference ids = MODULE_ID + "-" + first author's surname (no spaces, no diacritics) + year + letter suffix, e.g. "{MID}-Helms2014a", "{MID}-Helms2014b". In text fields cite as [{MID}-Helms2014a].
3. Every citation_id and every id cited in a text field must resolve to exactly one references[].id in this answer; references contain all and only the cited ids.
4. url: https://doi.org/<DOI> preferred, otherwise https://pubmed.ncbi.nlm.nih.gov/<PMID>/ or the PMC URL. retrieved_url: the page you actually read.
5. For every reference give the design, population, n (or k studies and total n), duration and the key quantitative finding.
6. Effect sizes and absolute numbers beat relative risks and p-values. Never write "significant" without the size of the effect; write "not reported" when no effect size exists.
7. Every number needs a unit and a basis (g/kg BW vs g/kg FFM, % TDEE vs kcal/day, % BW/week vs kg/week). Write "null" with the reason where no defensible evidence supports a number.
8. Give the strongest counter-evidence for every candidate, even if it weakens the recommendation; no false balance where the evidence is clear-cut.
9. Present position-stand recommendations as expert consensus and name the data behind them, never as experimental findings.

OUTPUT RULES (keep the answer short enough to be generated in one pass)
- Return only JSON that conforms to the output schema. Language: English.
- candidates: exactly one entry per SCOPE item, in SCOPE order, strategy_name exactly as quoted in SCOPE.
- Respect the word limits in the schema descriptions; the whole answer must stay below about 7,000 words.
- references: 10-25 entries, all cited.
- quantitative_targets: one target per line, format "Parameter: low-high unit | basis | population | [IDs]".
- additional_candidates: other strategies of this domain found in the literature, format "Strategy - estimated weighted score - one-line verdict - [IDs]" (at most 3; empty array if none).
- If time or budget runs short, finish every scope item with fewer references instead of finishing one item in full detail.

FINAL SELF-AUDIT before answering: (1) every citation_id resolves to a reference; (2) every number has a unit, a basis, a population and a source; (3) no finding is transferred between populations without a flag; (4) every candidate has counter-evidence; (5) no reference is unverified or reconstructed from memory; (6) every weighted score matches the formula.
"""

# --------------------------------------------------------------------------
# Modules: scope, assigned heuristics (H), conflicts (K) and limitations (L)
# --------------------------------------------------------------------------

MODULES = [
    {
        "id": "M1",
        "slug": "protein_macros",
        "title": "PROTEIN, CREATINE, MACRONUTRIENT PATTERN AND MEAL REPLACEMENTS",
        "scope": [
            ("Elevated protein intake and per-meal protein distribution",
             "merge total intake, per-meal dose and distribution, and protein supplements; split only if the evidence clearly supports it"),
            ("Creatine monohydrate",
             "body-composition evidence during energy restriction and with resistance training; evaluate, do not presume benefit"),
            ("Dietary pattern chosen by preference and adherence (low-carbohydrate vs low-fat)",
             "incl. ketogenic diets; compare at matched protein and energy where possible"),
            ("Meal replacements and structured meal plans",
             "during weight loss and as a maintenance tool"),
        ],
        "heuristics": [
            ("H1", "Protein of 2.3-3.1 g/kg FFM for lean resistance-trained athletes in a deficit (Helms et al. 2014, IJSNEM) vs the ~1.6 g/kg/day breakpoint of Morton et al. 2018 (not specific to energy deficit) vs recommendations for adults with obesity and older adults. Is there evidence of benefit above 2.2 g/kg BW in a deficit?"),
            ("H4", "Minimum dietary fat (often stated as 15-30% of energy or in g/kg BW): what evidence exists for a threshold, including the hormonal effects of very-low-fat diets (e.g. Whittaker & Wu 2021)?"),
        ],
        "conflicts": [
            ("K5", "Protein ceiling: is there benefit above ~2.2 g/kg BW in a deficit, and for whom?"),
            ("K6", "Low-carbohydrate/ketogenic vs higher-carbohydrate diets: fat-mass loss vs DXA lean-mass artefacts from glycogen and water shifts."),
        ],
        "overlap_note": "H1 and K5 overlap: give the numeric thresholds in H1 and the opposing trials and who benefits in K5; do not repeat text.",
        "target_items": [1, 3],
        "limitations": [
            ("L1", "DXA lean-mass error from glycogen and water shifts in a deficit or with carbohydrate changes (incl. creatine-related water retention)."),
            ("L2", "BIA unreliability for tracking FFM change during weight loss."),
        ],
        "protocol": [
            "Protein: g/kg BW AND g/kg FFM; in obesity, which body weight the trials used (actual vs reference or adjusted) and which one to use; per-meal dose (g and g/kg); protein meals per day; leucine per meal; anabolic resistance in P3; kidney-disease caveat.",
            "Creatine: g/day (and g/kg), loading vs no loading, combination with resistance training, water-weight artefact on scale, DXA and BIA.",
            "Macronutrient pattern: minimum fat in g/kg BW and % energy; carbohydrate needed to sustain training; decision rule for choosing a pattern by preference.",
            "Meal replacements: servings per day, energy and protein per serving, use in the loss vs maintenance phase.",
        ],
        "searches": [
            '("energy restriction" OR hypocaloric OR "weight loss") AND ("high protein" OR "protein intake" OR "protein supplementation") AND ("lean mass" OR "fat-free mass") AND (meta-analysis OR "systematic review")',
            'creatine AND ("energy restriction" OR "weight loss" OR "fat mass") AND ("lean mass" OR "fat-free mass")',
            '("low-carbohydrate" OR ketogenic) AND ("fat-free mass" OR "lean mass") AND (DXA OR glycogen OR "body water")',
            '("meal replacement" OR "total diet replacement") AND ("weight loss maintenance" OR "weight regain") AND (meta-analysis OR "systematic review")',
        ],
        "seeds": [
            "Helms, Zinn, Rowlands & Brown 2014 (Int J Sport Nutr Exerc Metab)",
            "Helms, Aragon & Fitschen 2014 (J Int Soc Sports Nutr)",
            "Morton et al. 2018 (Br J Sports Med)",
            "Jaeger (Jager) et al. 2017 (J Int Soc Sports Nutr; ISSN position stand protein and exercise)",
            "Aragon et al. 2017 (J Int Soc Sports Nutr; ISSN position stand diets and body composition)",
            "Wycherley et al. 2012 (Am J Clin Nutr)",
            "Pasiakos et al. 2013 (FASEB J)",
            "Mettler, Mitchell & Tipton 2010 (Med Sci Sports Exerc)",
            "Longland et al. 2016 (Am J Clin Nutr)",
            "Schoenfeld & Aragon 2018 (J Int Soc Sports Nutr; protein distribution)",
            "Nunes et al. 2022 (J Cachexia Sarcopenia Muscle)",
            "Roberts, Helms, Trexler & Fitschen 2020 (J Hum Kinet)",
            "Cava, Yeat & Mittendorfer 2017 (Adv Nutr)",
            "Gardner et al. 2018 (JAMA; DIETFITS)",
            "Whittaker & Wu 2021 (J Steroid Biochem Mol Biol)",
            "Nana et al. 2015 (Int J Sport Nutr Exerc Metab; DXA methodology)",
            "Look AHEAD Research Group 2014 (Obesity; meal replacements were part of the intervention)",
        ],
    },
    {
        "id": "M2",
        "slug": "training_activity",
        "title": "RESISTANCE TRAINING, AEROBIC TRAINING AND PHYSICAL-ACTIVITY VOLUME",
        "scope": [
            ("Progressive resistance training during and after the deficit",
             "minimum dose to preserve muscle in a deficit and dose to regain or add muscle afterwards"),
            ("Aerobic training and HIIT, managed to limit concurrent-training interference",
             "modality, intensity, volume and scheduling relative to resistance training"),
            ("High physical-activity volume for maintenance (structured exercise, steps, NEAT, limiting sedentary time)",
             "'limiting sedentary time' is merged here; report separately what sedentary-time interventions show"),
        ],
        "heuristics": [
            ("H3", "A deficit of more than ~500 kcal/day prevents lean-mass gains with resistance training (Murphy & Koehler 2022, meta-regression). How robust is this threshold, and how does it scale with body size and body fat?"),
            ("H5", "Physical activity of more than ~250 min/week (ACSM position stand, Donnelly et al. 2009) or ~60 min/day (NWCR) to prevent regain: is the evidence causal or associational?"),
        ],
        "conflicts": [
            ("K4", "Concurrent-training interference effect: magnitude in a deficit and dependence on modality (running vs cycling), intensity, scheduling and training status."),
            ("K7", "Exercise for weight loss vs for weight maintenance: energy compensation and constrained total energy expenditure."),
            ("K10", "Context only, not a candidate: lean-mass loss under GLP-1/GIP pharmacotherapy (e.g. STEP 1 DXA substudy) and the role of resistance training and protein in mitigating it."),
        ],
        "overlap_note": "H5 and K7 overlap: give the dose-response verdict in H5 and the compensation / constrained-energy-expenditure debate in K7; do not repeat text.",
        "target_items": [1],
        "limitations": [
            ("L3", "Short trial durations relative to the >=12-month WLM horizon (most training and body-composition trials last 8-24 weeks)."),
            ("L4", "Over-representation of young men in sports-nutrition and training trials and of women in obesity trials."),
        ],
        "protocol": [
            "Resistance training: sessions/week, hard sets per muscle group per week, intensity (%1RM or reps in reserve), exercise selection, progression; minimum dose to maintain muscle in a deficit vs dose to gain; adaptations for P3; what to change when strength drops.",
            "Aerobic training/HIIT: min/week, intensity, modality (cycling vs running), order of sessions and hours between aerobic and strength sessions.",
            "Activity volume: min/week of moderate-to-vigorous activity for loss vs maintenance, daily steps, NEAT, sedentary-time targets.",
        ],
        "searches": [
            '("resistance training" OR "resistance exercise") AND ("energy restriction" OR "weight loss") AND ("lean mass" OR "fat-free mass") AND (meta-analysis OR "systematic review")',
            '("concurrent training" OR "interference effect") AND (hypertrophy OR "lean mass" OR strength) AND (meta-analysis OR "systematic review")',
            '("physical activity" OR exercise OR steps) AND ("weight loss maintenance" OR "weight regain") AND (randomized OR meta-analysis)',
            '("sedentary behavior" OR "sitting time") AND (weight OR adiposity) AND (intervention OR randomized)',
            '(semaglutide OR tirzepatide OR "GLP-1") AND ("lean mass" OR "fat-free mass") AND ("resistance training" OR protein)',
        ],
        "seeds": [
            "Weinheimer, Sands & Campbell 2010 (Nutr Rev)",
            "Villareal et al. 2017 (N Engl J Med)",
            "Schoenfeld, Ogborn & Krieger 2017 (J Sports Sci; volume dose-response)",
            "Wilson et al. 2012 (J Strength Cond Res; concurrent training)",
            "Schumann et al. 2022 (Sports Med; concurrent training update)",
            "Murphy & Koehler 2022 (Scand J Med Sci Sports; energy deficit and resistance-training gains)",
            "Donnelly et al. 2009 (Med Sci Sports Exerc; ACSM position stand)",
            "Thomas et al. 2014 (Am J Prev Med; NWCR 10-year data)",
            "Wilding et al. 2021 (N Engl J Med; STEP 1, DXA substudy; context only)",
        ],
    },
    {
        "id": "M3",
        "slug": "deficit_metabolic",
        "title": "DEFICIT SIZE, RATE OF LOSS, VLED AND THE TRANSITION TO MAINTENANCE",
        "scope": [
            ("Moderate deficit size and controlled rate of weight loss",
             "deficit as % TDEE and kcal/day, rate as % BW/week, by body-fat level"),
            ("Very-low-energy diet followed by structured maintenance",
             "VLED/LED phase plus a defined maintenance programme, compared with gradual loss"),
            ("Reverse dieting and structured transition to maintenance energy intake",
             "if no controlled trials exist, say so and grade accordingly"),
        ],
        "heuristics": [
            ("H2", "A weight-loss rate of ~0.5-1.0% BW/week for lean-mass retention in lean athletes (Helms, Aragon & Fitschen 2014; Garthe et al. 2011) vs evidence in obesity that rapid initial loss does not worsen long-term regain (Purcell et al. 2014). Does the optimal rate depend on body-fat level?"),
            ("H8", "The 'one quarter of weight lost is FFM' rule (Heymsfield et al. 2014): how does it depend on initial body fat, sex, exercise and protein?"),
            ("H10", "Size and persistence of metabolic adaptation (adaptive thermogenesis): Fothergill et al. 2016 vs Martins et al. 2020. Is it clinically relevant for regain?"),
        ],
        "conflicts": [
            ("K2", "Rapid vs slow weight loss: lean-mass fraction vs long-term regain."),
            ("K9", "Metabolic adaptation: persistent and relevant vs transient and small."),
        ],
        "overlap_note": "H2/K2 and H10/K9 overlap: give the numeric verdict in the heuristic entry and the opposing studies in the conflict entry; do not repeat text.",
        "target_items": [1],
        "limitations": [
            ("L5", "Metabolic-ward vs free-living conditions: adherence, intake control and measurement of energy expenditure."),
            ("L6", "Inconsistent definitions of weight-loss maintenance and of lean mass across studies."),
        ],
        "protocol": [
            "Deficit as % of TDEE and kcal/day; rate as % BW/week and kg/week, separately for P1, P2 and P3; expected time course and plateau from dynamic energy-balance models (Hall et al. 2011) instead of the 3,500 kcal rule.",
            "VLED: energy (kcal/day), protein (g/day and g/kg), duration, supervision, content and length of the structured maintenance phase.",
            "Transition to maintenance: how to estimate maintenance intake (e.g. from the measured weight trend), size and speed of energy increases, expected scale rebound from glycogen and water, decision rules for regain.",
            "Also check energy flux (energy balance at high intake and high expenditure) and report it under additional_candidates.",
        ],
        "searches": [
            '("rate of weight loss" OR "rapid weight loss" OR "gradual weight loss") AND ("fat-free mass" OR "lean mass" OR "weight regain")',
            '("very low energy diet" OR "very-low-calorie diet" OR "total diet replacement") AND (maintenance OR regain) AND (randomized OR meta-analysis)',
            '("adaptive thermogenesis" OR "metabolic adaptation") AND ("weight regain" OR "weight maintenance")',
            '("reverse dieting" OR "post-diet" OR "energy flux") AND ("body composition" OR regain OR "energy intake")',
        ],
        "seeds": [
            "Purcell et al. 2014 (Lancet Diabetes Endocrinol)",
            "Helms, Aragon & Fitschen 2014 (J Int Soc Sports Nutr)",
            "Garthe et al. 2011 (Int J Sport Nutr Exerc Metab)",
            "Heymsfield et al. 2014 (Obes Rev; quarter-FFM rule)",
            "Hall et al. 2011 (Lancet; dynamic energy balance)",
            "Rosenbaum & Leibel 2010 (Int J Obes)",
            "Fothergill et al. 2016 (Obesity)",
            "Martins et al. 2020 (Am J Clin Nutr)",
            "Trexler, Smith-Ryan & Norton 2014 (J Int Soc Sports Nutr)",
            "Hall & Kahan 2018 (Med Clin North Am)",
        ],
    },
    {
        "id": "M4",
        "slug": "intermittent_timing",
        "title": "DIET BREAKS, REFEEDS, INTERMITTENT FASTING AND MEAL TIMING",
        "scope": [
            ("Diet breaks and intermittent energy restriction",
             "planned blocks at estimated maintenance energy, e.g. MATADOR-type 2 weeks on / 2 weeks off or ICECAP-type breaks"),
            ("Refeeds",
             "1-3 day high-carbohydrate periods within a deficit"),
            ("Intermittent fasting (time-restricted eating, alternate-day fasting, 5:2)",
             "vs continuous energy restriction at matched energy and protein where possible"),
            ("Consistent eating pattern, breakfast and meal frequency",
             "incl. weekday-weekend consistency"),
        ],
        "heuristics": [
            ("H6", "Diet breaks and refeeds: MATADOR (men with obesity) vs ICECAP (resistance-trained adults) vs refeed trials. Do effects on fat-loss efficiency and FFM transfer between populations?"),
        ],
        "conflicts": [
            ("K1", "Intermittent fasting / time-restricted eating vs continuous energy restriction for lean-mass retention (with and without resistance training; matched vs unmatched protein)."),
            ("K3", "Diet breaks / refeeds / intermittent energy restriction vs a continuous deficit."),
            ("K8", "Breakfast and meal frequency: registry associations vs RCT results."),
        ],
        "overlap_note": "H6 and K3 overlap: give the population-transfer verdict in H6 and the head-to-head comparison with a continuous deficit in K3; do not repeat text.",
        "target_items": [1, 2],
        "limitations": [
            ("L7", "Publication bias and small-study effects (frequent in the intermittent-fasting and meal-timing literature)."),
        ],
        "protocol": [
            "Diet breaks: length (days), frequency (after how many weeks of deficit), energy level, expected scale rebound from glycogen and water.",
            "Refeeds: length (days), frequency, carbohydrate (g/kg BW) and energy level.",
            "Intermittent fasting: eating window (h/day), fasting-day energy (kcal), protein per meal within short eating windows, combination with resistance training.",
            "Meal pattern: meals/day, breakfast, weekday-weekend consistency, and how to keep protein distribution under each pattern.",
        ],
        "searches": [
            '("intermittent energy restriction" OR "intermittent fasting" OR "alternate-day fasting" OR "time-restricted eating") AND ("fat-free mass" OR "lean mass") AND (meta-analysis OR randomized)',
            '("diet break" OR refeed OR "intermittent energy restriction") AND ("resistance-trained" OR athletes) AND ("fat-free mass" OR "lean mass")',
            '(breakfast OR "meal frequency" OR "eating frequency") AND ("weight loss" OR "body weight") AND (randomized OR meta-analysis)',
        ],
        "seeds": [
            "Byrne et al. 2018 (Int J Obes; MATADOR)",
            "Peos et al. 2021 (Med Sci Sports Exerc; ICECAP)",
            "Campbell et al. 2020 (J Funct Morphol Kinesiol; refeeds)",
            "Trepanowski et al. 2017 (JAMA Intern Med; alternate-day fasting)",
            "Lowe et al. 2020 (JAMA Intern Med; TREAT)",
            "Moro et al. 2016 (J Transl Med; TRE in resistance-trained men)",
            "Dhurandhar et al. 2014 (Am J Clin Nutr; breakfast)",
            "Sievert et al. 2019 (BMJ; breakfast)",
        ],
    },
    {
        "id": "M5",
        "slug": "behavioral",
        "title": "SELF-MONITORING, BEHAVIORAL TREATMENT AND CONTINUED CARE",
        "scope": [
            ("Frequent self-weighing",
             "frequency, interpretation and action thresholds"),
            ("Dietary self-monitoring (food tracking)",
             "method, frequency and duration"),
            ("Structured behavioral treatment (goal setting, stimulus control, problem solving, relapse prevention, CBT)",
             "components with evidence, dose and duration"),
            ("Extended care and continued contact after weight loss",
             "contact frequency, format and duration"),
        ],
        "heuristics": [
            ("H9", "Daily self-weighing and its effect on long-term regain."),
        ],
        "conflicts": [],
        "optional_conflict_hint": "e.g. frequent self-weighing: benefit for regain vs possible adverse psychological effects",
        "limitations": [
            ("L8", "NWCR and other weight-control registries: self-selection, self-report and survivorship bias."),
            ("L9", "Attrition in long-term trials and how it was handled (intention-to-treat vs completers, imputation)."),
        ],
        "protocol": [
            "Self-weighing: times per week, time of day, use of trends or weekly averages, regain threshold that triggers action (kg or % BW).",
            "Self-monitoring: method, days per week, level of detail, duration; when lighter monitoring is enough.",
            "Behavioral treatment: number, frequency and length of sessions, programme duration, components with evidence.",
            "Extended care: contact frequency and duration after loss; in person, phone or digital.",
            "These strategies do not target lean mass directly: grade lean_mass_preservation not_applicable unless data exist, and say how they can support protein and training adherence.",
        ],
        "searches": [
            '("self-weighing" OR "self-weigh") AND ("weight regain" OR "weight loss maintenance") AND (randomized OR meta-analysis)',
            '("self-monitoring" OR "food diary" OR "dietary tracking") AND ("weight loss" OR "weight maintenance") AND "systematic review"',
            '("extended care" OR "continued contact" OR "maintenance intervention") AND ("weight regain" OR "weight loss maintenance") AND meta-analysis',
            '("behavioral weight loss" OR "cognitive behavioural therapy" OR "lifestyle intervention") AND ("long-term" OR "weight regain") AND meta-analysis',
        ],
        "seeds": [
            "Wing & Hill 2001 (Annu Rev Nutr)",
            "Wing & Phelan 2005 (Am J Clin Nutr)",
            "Thomas et al. 2014 (Am J Prev Med; NWCR 10-year data)",
            "Paixao et al. 2020 (Obes Rev; weight-control registries)",
            "Varkevisser et al. 2019 (Obes Rev; determinants of WLM)",
            "Dombrowski et al. 2014 (BMJ; WLM interventions)",
            "Burke, Wang & Sevick 2011 (J Am Diet Assoc; self-monitoring)",
            "Madigan et al. 2015 (Int J Behav Nutr Phys Act; self-weighing)",
            "Look AHEAD Research Group 2014 (Obesity; 8-year results)",
            "Jensen et al. 2014 (AHA/ACC/TOS guideline)",
            "Wharton et al. 2020 (CMAJ; Canadian guideline)",
        ],
    },
    {
        "id": "M6",
        "slug": "diet_quality_sleep_stress",
        "title": "DIET QUALITY, DIETARY RESTRAINT, SLEEP AND STRESS",
        "scope": [
            ("Low-energy-density, high-fiber, minimally processed diet (limiting ultra-processed foods)",
             "energy density, fiber and degree of processing"),
            ("Flexible rather than rigid dietary restraint",
             "effects on regain, disinhibition and adherence"),
            ("Sleep duration and quality",
             "incl. the fat vs lean fraction of weight lost"),
            ("Stress management and mindfulness-based approaches",
             "effects on regain and eating behavior"),
        ],
        "heuristics": [
            ("H7", "Sleep: Nedeltcheva et al. 2010 (very small crossover study). Has the effect of short sleep on the composition of weight loss been replicated?"),
        ],
        "conflicts": [],
        "optional_conflict_hint": "e.g. ultra-processed foods: controlled-feeding trial results vs residual confounding in cohort data",
        "target_items": [3],
        "limitations": [
            ("L10", "Under-reporting in self-reported dietary intake."),
            ("L11", "Funding and conflicts of interest (food industry, meal-replacement and supplement manufacturers)."),
        ],
        "protocol": [
            "Diet quality: energy density (kcal/g), fiber (g/day), share of ultra-processed foods (% energy), practical substitution rules.",
            "Restraint: how to implement flexible restraint and when rigid rules backfire.",
            "Sleep: hours per night, regularity, practical measures; whether sleep extension has been tested in trials.",
            "Stress/mindfulness: programme type, number of sessions and weeks, effect on regain.",
        ],
        "searches": [
            '("energy density" OR "ultra-processed" OR "dietary fiber") AND ("weight loss maintenance" OR "weight regain" OR "ad libitum energy intake")',
            '("flexible restraint" OR "rigid restraint" OR "dietary restraint") AND ("weight regain" OR "weight maintenance")',
            'sleep AND ("energy restriction" OR "weight loss") AND ("fat-free mass" OR "lean mass"); "sleep extension" AND randomized',
            '(mindfulness OR "stress management") AND ("weight regain" OR "weight loss maintenance") AND (randomized OR meta-analysis)',
        ],
        "seeds": [
            "Hall et al. 2019 (Cell Metab; ultra-processed foods)",
            "Nedeltcheva et al. 2010 (Ann Intern Med)",
            "Wang et al. 2018 (Sleep)",
            "Varkevisser et al. 2019 (Obes Rev; determinants of WLM)",
        ],
    },
]


# Scope items whose quantitative targets feed physiological_targets_summary in M7
TARGET_STRATEGIES = {m["scope"][i - 1][0] for m in MODULES for i in m.get("target_items", [])}


def module_input(m):
    """Assemble the full You.com input text for one module."""
    mid = m["id"]
    out = [CORE_HEAD.replace("{MID}", mid), f"MODULE {mid}: {m['title']}", ""]

    out.append('SCOPE (one entry in "candidates" per item, in this order; strategy_name = the quoted name)')
    for i, (name, note) in enumerate(m["scope"], 1):
        out.append(f'{i}. "{name}" - {note}.')
    out.append("")

    out.append('HEURISTIC TESTS (one entry each in "heuristic_tests"; test, do not confirm: do the data support or refute the claim, or are they insufficient, in which population and with what effect size?)')
    out += [f"{hid}. {text}" for hid, text in m["heuristics"]]
    out.append("")

    if m["conflicts"]:
        out.append('CONFLICTS TO ADJUDICATE (one entry each in "evidence_conflicts": both sides with designs, populations, sample sizes and effect sizes, then the current best interpretation and your confidence in it)')
        out += [f"{kid}. {text}" for kid, text in m["conflicts"]]
    else:
        out.append(f'CONFLICTS: none assigned. Optionally add at most one important conflict of this scope with conflict_id "X1" ({m["optional_conflict_hint"]}); otherwise return an empty array.')
    if m.get("overlap_note"):
        out.append("NOTE: " + m["overlap_note"])
    out.append("")

    out.append('LIMITATIONS (one entry each in "key_limitations": the limitation, how it affects the evidence of this module, and its practical consequence for interpretation)')
    out += [f"{lid}. {text}" for lid, text in m["limitations"]]
    out.append("")

    out.append("PROTOCOL REQUIREMENTS (numbers go into actionable_protocol.quantitative_targets)")
    out += [f"- {line}" for line in m["protocol"]]
    out.append("")

    out.append("SEARCH HINTS (examples; combine controlled vocabulary and free text)")
    out += [f"- {q}" for q in m["searches"]]
    out.append("")

    out.append("SEED LITERATURE (non-exhaustive; verify each item before citing it: confirm authors, year, journal and DOI on the retrieved page; do not cite what you cannot retrieve; look actively for newer and contradicting work)")
    out += [f"- {s}" for s in m["seeds"]]
    out.append("")

    out.append(CORE_RULES.replace("{SCORING}", SCORING).replace("{MID}", mid))
    return "\n".join(out)


SYNTHESIS_TEMPLATE = """MODULE_ID: M7

CONTEXT
This is the synthesis run (M7) of a modular evidence review on which strategies best support (A) losing body fat and keeping it off long term (weight-loss maintenance, WLM: >=12 months, ideally >=24 months after the end of active weight loss) while (B) preserving as much fat-free mass as possible, specifically skeletal muscle, during the energy deficit and afterwards. Six evidence modules (M1-M6) each reviewed and scored a group of candidate strategies; their condensed results are in the EVIDENCE PACK at the end. Populations: P1 adults with overweight or obesity (BMI >=25); P2 lean, resistance-trained individuals and physique athletes; P3 adults >=60 years incl. sarcopenic obesity. Anti-obesity medication and bariatric surgery are not candidates.

ROLE AND STANDARD
You are a senior research scientist (obesity medicine, exercise physiology, sports nutrition) working to the standard of a Cochrane-style rapid review combined with an ISSN/ACSM position stand. Accuracy beats completeness. Do not redo the module reviews: search only to verify synergy links, to resolve contradictions between modules, or to close a gap that blocks a target value.

TASKS
1. Calibrate and rank. The modules scored independently on the scale below. Re-check every candidate's scores against the anchors and the evidence in the pack. You may change a module score by at most 1.0 per criterion; report every change and its reason in ranking_methodology. Recompute the weighted scores, rank all candidates (ties: higher C3, then higher C1) and return the top 10 in final_ranking. Only candidates with a candidate_key (full module dossier) can enter the top 10. Do not force balance across categories: if, for example, three nutrition strategies rank above every behavioral one, say so.
2. Synergy matrix: 6-8 links between behavioral adherence factors and physiological muscle-protection factors, e.g. higher protein -> satiety/adherence and MPS; resistance training -> FFM -> energy expenditure and appetite regulation; moderate deficit -> adherence and lower lean-mass loss; self-monitoring -> timely adjustment of intake; sleep -> appetite regulation and composition of weight lost; diet breaks -> adherence and possibly hormonal recovery. Grade each link high, moderate, low or theoretical and never present a theoretical link as established.
3. Physiological targets for the active fat-loss phase: ranges with units and basis, derived from the module targets in the pack; state the population of every number and flag where a P2-derived number is applied to P1 or P3. Use null only when no defensible evidence exists and explain why in basis. Protein: give g/kg BW and g/kg FFM and how to handle obesity (actual vs reference or adjusted body weight).
4. considered_but_excluded: every candidate not in the top 10, incl. the modules' additional candidates, format "Strategy - weighted score - reason for exclusion - [IDs]".

SCORING (same scale as in the modules)
{SCORING}

CITATION RULES
- Cite module evidence with the ids exactly as they appear in the pack, e.g. [M1-Morton2018a]; do not repeat these in references.
- Sources you retrieve in this run get ids "M7-" + first author's surname (no spaces, no diacritics) + year + letter suffix, e.g. M7-Hall2019a, and must be listed in references; references contain only these M7 ids.
- Never construct a DOI, PMID, author list, title or number from memory. Effect sizes and absolute numbers beat p-values. Every number needs a unit, a basis and a population.

OUTPUT RULES
- Return only JSON that conforms to the output schema. Language: English. The whole answer must stay below about 4,000 words.
- final_ranking: exactly 10 items, ranks 1-10 each used once, ascending; candidate_key and strategy_name exactly as in the pack.
- FINAL SELF-AUDIT: ranks match the recomputed weighted scores; every cited id is in the pack or in references; every number has a unit, a basis, a population and a source; no theoretical synergy is presented as established.

EVIDENCE PACK
{PLACEHOLDER}
""".replace("{SCORING}", SCORING).replace("{PLACEHOLDER}", EVIDENCE_PACK_PLACEHOLDER)

# --------------------------------------------------------------------------
# Output schemas (You.com rules: every property required, additionalProperties
# false, optional values via ["type", "null"])
# --------------------------------------------------------------------------

CATEGORIES = ["nutrition", "training", "behavioral_adherence", "recovery_lifestyle", "metabolic_management"]
PHASES = ["active_fat_loss_phase", "weight_maintenance_phase", "both_phases"]
GRADES = ["high", "moderate", "low"]
OUTCOME_GRADES = ["high", "moderate", "low", "insufficient", "not_applicable"]
VERDICTS = ["supported", "partially_supported", "refuted", "insufficient_evidence"]
STUDY_TYPES = [
    "umbrella_review", "meta_analysis", "systematic_review", "position_stand_or_guideline", "rct",
    "randomized_crossover", "non_randomized_trial", "prospective_cohort", "registry_observational",
    "cross_sectional", "narrative_review", "mechanistic_or_acute_study",
]


def _with_description(node, description):
    if description:
        node["description"] = description
    return node


def obj(props, description=None):
    node = _with_description({"type": "object"}, description)
    node.update(properties=props, required=list(props), additionalProperties=False)
    return node


def arr(items, description=None):
    return {**_with_description({"type": "array"}, description), "items": items}


def text(description=None):
    return _with_description({"type": "string"}, description)


def number(description=None, nullable=False):
    return _with_description({"type": ["number", "null"] if nullable else "number"}, description)


def enum(values, description=None, type_="string"):
    return {**_with_description({"type": type_}, description), "enum": values}


def scores(description):
    return obj({
        "c1_long_term_weight": number("C1, 0-5."),
        "c2_lean_mass": number("C2, 0-5."),
        "c3_certainty": number("C3, 0-5; consistent with evidence_grade."),
        "c4_generalisability": number("C4, 0-5."),
        "c5_feasibility_safety": number("C5, 0-5."),
        "weighted": number("0.30*C1 + 0.25*C2 + 0.25*C3 + 0.10*C4 + 0.10*C5, 2 decimals."),
    }, description)


def reference(id_example):
    return obj({
        "id": text(f"Module prefix + surname + year + suffix, e.g. {id_example}."),
        "citation": text("Authors (first three, et al.), year, title, journal, volume(issue), pages."),
        "study_type": enum(STUDY_TYPES),
        "design_population_n": text("<=30 words: design, population, n (or k studies / total n), duration and follow-up."),
        "key_quantitative_finding": text("<=30 words, effect size with units."),
        "url": text("https://doi.org/<DOI> preferred; otherwise https://pubmed.ncbi.nlm.nih.gov/<PMID>/ or the PMC URL."),
        "retrieved_url": text("URL of the page actually read in this run (PubMed, PMC, Europe PMC or publisher)."),
    })


def module_schema():
    candidate = obj({
        "strategy_name": text("Exactly the quoted name from SCOPE."),
        "category": enum(CATEGORIES),
        "phase_relevance": enum(PHASES),
        "scores": scores("Per the SCORING anchors, 0-5 in steps of 0.5."),
        "score_rationale": text("<=60 words: the decisive evidence and effect sizes behind each score."),
        "evidence_grade": enum(GRADES, "Certainty for the outcome that justifies the score."),
        "evidence_grade_by_outcome": obj({
            "long_term_weight_maintenance": enum(OUTCOME_GRADES),
            "lean_mass_preservation": enum(OUTCOME_GRADES),
        }),
        "evidence_grade_rationale": text("<=90 words: designs, k studies, n, follow-up, consistency, risk of bias, indirectness; name the outcome behind the overall grade; label claims [ESTABLISHED], [PRELIMINARY] or [HYPOTHESIS]."),
        "effect_size_summary": text("<=130 words: pooled estimate with 95% CI, I2, k, n and follow-up; absolute terms (kg lean mass preserved, kg less regain at 12/24 months, percentage points of weight lost as FFM); 'not reported' where none exists; no p-value-only statements."),
        "long_term_weight_loss_mechanism": text("<=80 words: adherence, satiety, energy density, NEAT compensation, adaptive thermogenesis, self-regulation; separate demonstrated mechanisms from hypotheses."),
        "muscle_preservation_mechanism": text("<=80 words: MPS, mechanical tension, protein breakdown, energy availability, anabolic resistance, hormones, glycogen; flag support that comes only from acute MPS or mechanistic studies."),
        "actionable_protocol": obj({
            "protocol_summary": text("<=50 words."),
            "quantitative_targets": text("<=7 lines, one target per line: 'Parameter: low-high unit | basis (g/kg BW, g/kg FFM, % TDEE, % BW/week ...) | population | [IDs]'."),
            "frequency_and_timing": text("<=50 words."),
            "progression_and_adjustment_rules": text("<=70 words: decision rules for a stall, strength loss, lean-mass decline and the transition to maintenance."),
            "monitoring_metrics": text("<=50 words: what to measure, how often, with which method, target values."),
            "population_applicability": text("<=60 words: populations the numbers come from (P1/P2/P3) and limits of transfer."),
        }),
        "counter_evidence_and_uncertainties": text("<=100 words: strongest contradicting studies and objections, with ids."),
        "common_pitfalls": arr(text(), "3-4 real-world implementation pitfalls, <=20 words each."),
        "citation_ids": arr(text(), "All ids cited for this candidate; each must exist in references[].id."),
    })
    heuristic = obj({
        "heuristic_id": text("H-number from the input, e.g. H1."),
        "claim": text("The heuristic as stated in the input, <=40 words."),
        "evidence_for_and_against": text("<=130 words: designs, populations, n and effect sizes on both sides."),
        "verdict": enum(VERDICTS),
        "verdict_explanation": text("<=80 words: in which population the verdict holds, with effect size and conditions."),
        "confidence_in_verdict": enum(GRADES),
        "citation_ids": arr(text()),
    })
    conflict = obj({
        "conflict_id": text("K-number from the input, e.g. K5; X1 for an optional extra conflict."),
        "topic": text(),
        "conflicting_findings": text("<=140 words: both sides with designs, populations, sample sizes and effect sizes."),
        "current_best_interpretation": text("<=80 words."),
        "confidence_in_interpretation": enum(GRADES),
        "citation_ids": arr(text()),
    })
    return obj({
        "module_id": text("Copy MODULE_ID from the first line of the input, e.g. M1."),
        "search_summary": text("<=60 words: main searches, key meta-analyses found, retraction/erratum checks, important gaps."),
        "candidates": arr(candidate, "One entry per SCOPE item, in SCOPE order."),
        "heuristic_tests": arr(heuristic, "One entry per heuristic listed in the input."),
        "evidence_conflicts": arr(conflict, "One entry per conflict listed in the input (plus at most one optional extra); empty if none."),
        "key_limitations": arr(text(), "One entry per limitation listed in the input, <=60 words each: limitation, effect on this module's evidence, practical consequence."),
        "additional_candidates": arr(text(), "At most 3: 'Strategy - estimated weighted score - one-line verdict - [IDs]'."),
        "references": arr(reference("M1-Helms2014a"), "10-25 entries: every id cited in this answer and only those; only sources retrieved in this run."),
    }, "Result of one evidence module of a modular review on long-term fat loss with skeletal-muscle preservation.")


def synthesis_schema():
    def value_range(description=None, basis=None):
        return obj({
            "low": number(nullable=True),
            "high": number(nullable=True),
            "basis": text(basis),
        }, description)

    ranked = obj({
        "rank": enum(list(range(1, 11)), type_="integer"),
        "candidate_key": text("Exactly as in the evidence pack, e.g. M1.1."),
        "strategy_name": text("Exactly as in the evidence pack."),
        "scores": scores("Calibrated scores, 0-5 in steps of 0.5."),
        "rank_rationale": text("<=50 words: why this rank; decisive evidence with ids."),
    })
    targets = obj({
        "population_context": text("<=120 words: which population the targets apply to and how they differ for overweight/obesity, lean resistance-trained and older adults."),
        "recommended_deficit_percent_tdee": value_range(basis="<=60 words: evidence, population, kcal/day equivalent."),
        "weekly_weight_loss_percent_bw": value_range("Rate range compatible with optimal lean-mass retention.", "<=60 words."),
        "protein_target_g_per_kg_bw": value_range(basis="<=60 words, incl. how to handle obesity (actual vs reference/adjusted body weight)."),
        "protein_target_g_per_kg_ffm": value_range(basis="<=60 words."),
        "minimum_fat_g_per_kg_bw": number(nullable=True),
        "resistance_training_minimum_dose": text("<=80 words: sessions/week, hard sets per muscle group per week, intensity (%1RM or RIR), progression."),
        "sleep_target_hours_per_night": value_range(basis="<=50 words."),
        "diet_break_or_refeed_protocol": text("<=80 words: evidence-based protocol or an explicit statement that evidence is insufficient."),
        "notes_and_basis": text("<=150 words: evidence basis for minimum fat intake and other caveats for these targets."),
        "citation_ids": arr(text()),
    }, "Numeric targets for the active fat-loss phase. Use null only when no defensible evidence exists and explain why in basis.")
    synergy = obj({
        "behavioral_component": text(),
        "physiological_component": text(),
        "interaction_mechanism": text("<=70 words."),
        "practical_implication": text("<=50 words."),
        "strength_of_evidence": enum(["high", "moderate", "low", "theoretical"]),
        "citation_ids": arr(text()),
    })
    return obj({
        "module_id": text("Always M7."),
        "ranking_methodology": text("<=350 words: number of candidates evaluated and their modules, criteria C1-C5 with weights, every calibration change to module scores with its reason, tie-breaks, weighted scores of the final top 10."),
        "final_ranking": arr(ranked, "Exactly 10 items, ranks 1-10 each used once, ascending; only candidates with a candidate_key."),
        "physiological_targets_summary": targets,
        "synergy_matrix": arr(synergy, "6-8 links between behavioral adherence factors and physiological muscle-protection factors."),
        "considered_but_excluded": arr(text(), "Every candidate not in the top 10: 'Strategy - weighted score - reason for exclusion - [IDs]'."),
        "references": arr(reference("M7-Hall2019a"), "Only sources retrieved in this run (ids M7-...); module ids from the pack are not repeated here."),
    }, "Synthesis of a modular review on long-term fat loss with skeletal-muscle preservation: ranking, synergies and targets.")


def lint_schema(schema):
    """Measure a schema against the You.com output_schema rules and limits."""
    stats = {"depth": 0, "properties": 0, "enum_values": 0, "string_budget": 0}
    problems = []

    def walk(node, depth, path):
        stats["depth"] = max(stats["depth"], depth)
        if "enum" in node:
            stats["enum_values"] += len(node["enum"])
            stats["string_budget"] += sum(len(str(v)) for v in node["enum"])
        if node.get("type") == "object":
            props = node.get("properties") or {}
            if not props:
                problems.append(f"{path}: object without properties")
            if node.get("additionalProperties") is not False:
                problems.append(f"{path}: additionalProperties must be false")
            if set(node.get("required", [])) != set(props):
                problems.append(f"{path}: every property must be in required")
            for name, sub in props.items():
                stats["properties"] += 1
                stats["string_budget"] += len(name)
                walk(sub, depth + 1, f"{path}.{name}")
        elif node.get("type") == "array":
            walk(node["items"], depth + 1, f"{path}[]")

    if schema.get("type") != "object":
        problems.append("root must be an object")
    walk(schema, 1, "$")
    for key, limit in SCHEMA_LIMITS.items():
        if stats[key] > limit:
            problems.append(f"{key} {stats[key]} > limit {limit}")
    return stats, problems


def main():
    written = []

    def write(name, content):
        path = ROOT / name
        path.write_text(content, encoding="utf-8")
        written.append(path)
        return path

    print("Inputs (limit 40,000 characters):")
    for m in MODULES:
        content = module_input(m)
        write(f"{m['id']}_{m['slug']}_INPUT.txt", content + "\n")
        non_ascii = sum(1 for ch in content if ord(ch) > 127)
        print(f"  {m['id']}: {len(content):6,} characters, {len(m['scope'])} candidates, non-ASCII: {non_ascii}")
    write(SYNTHESIS_TEMPLATE_FILE, SYNTHESIS_TEMPLATE)
    print(f"  M7 template without evidence pack: {len(SYNTHESIS_TEMPLATE):,} characters")

    print("Schemas (limits: depth 5, properties 100, enum values 500, string budget 25,000):")
    original = json.loads((ROOT / "00_original_output_schema.json").read_text(encoding="utf-8"))
    for name, schema in [(MODULE_SCHEMA_FILE, module_schema()), (SYNTHESIS_SCHEMA_FILE, synthesis_schema()),
                         ("00_original_output_schema.json", original)]:
        stats, problems = lint_schema(schema)
        if name != "00_original_output_schema.json":
            write(name, json.dumps(schema, indent=2) + "\n")
        print(f"  {name}: {stats} {'OK' if not problems else problems}")

    write("include_domains.txt", "\n".join(INCLUDE_DOMAINS) + "\n")
    print(f"Wrote {len(written)} files to {ROOT}")


if __name__ == "__main__":
    main()
