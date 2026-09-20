# Brag Plan: meneergreidanus.nl

## What is this app?
Een docent geschiedenis (en ex-game developer) bouwde 32 browserspellen met één gedeelde vragenbank van 2435 vragen, gratis en zonder inloggen, voor leerlingen op hun telefoon en voor collega's die het morgen in hun les willen gebruiken.

## The angle
Dit is geen quiz met een jasje: het is een geschiedenisleraar die zijn game-developerverleden de klas in sleept. De video opent waar de site opent, bij de rode hand op de grotwand van El Castillo, en laat dan de eigen kopregel van de site vallen: *geschiedenis, maar dan* **Die leeft**. Daarna drie beats uit het echte gebruik: de leerling die zonder inloggen binnenkomt en een niveau kiest, het spel Zwaardvechter waarin een goed antwoord letterlijk een klap is, en de docent die een Klasquiz op het bord opent terwijl bijnamen binnenstromen. Alles in de eigen taal en vormtaal van de site: cream, navy, kreeftrood, de handgeschreven Caveat-regel boven elke kop, panelen met een harde 9px-schaduw. Nederlands, want het publiek is Nederlands.

## Hook (first 2-3 seconds)
Donker. Een rode okerhand verschijnt op de rots, als een spuitafdruk (wazig naar scherp), met het vuur dat onderin ademt. Onderin klein: "minstens 37.000 jaar geleden". Dan een harde cut naar cream en de handgeschreven regel "geschiedenis, maar dan" gevolgd door "Die leeft" dat als op de site letter voor letter omhoog komt.

## Key moments (the middle)
- **Een link is genoeg.** Een browserpaneel typt `meneergreidanus.nl/leermiddelen`. De drie niveauknoppen van de leeromgeving komen een voor een binnen (vmbo-bb · vmbo-kgt en tl · havo en vwo), een cursor tikt "havo en vwo" aan, en vier spelkaarten waaieren in: Zwaardvechter, Torenverdediging, Klasquiz, Bronnenlab.
- **Zwaardvechter.** De echte HUD (LEVEN 100/100, MUNTEN, RONDE, NOG TE GAAN, GEVELD, de blauwe knop Ontwijk) boven de zandkleurige arena met de blauwe blob-avatar en vier rode "?"-fouten. Een vraagkaart uit de vragenbank schuift op: "In welk tijdvak hoort dit? De VOC wordt opgericht als eerste bedrijf met aandelen", vier antwoorden. Cursor tikt "regenten en vorsten": groen. De kaart schuift weg, de blob stormt op een fout af, die klapt weg, GEVELD tikt naar 1, MUNTEN telt op, het gezichtje wordt blij. Onderschrift uit het spel zelf: "Goed antwoord is geld" / *en met geld koop je een scherper zwaard*.
- **Morgen in je les.** Links het digibord van de Klasquiz: "Doe mee op je telefoon", "Ga naar meneergreidanus.nl/q en vul de code in", de code van vier letters, en zes bijnamen met hun echte avatar-blob (gegenereerd met `avatar.js` van de site) die een voor een binnenkomen. Rechts de lesbrief van Zwaardvechter met de vijf vaste velden: leerdoel, tijd, niveau, werkvorm, nabespreking.

## Outro / punchline
De beloftenregel van de site, met de amberkleurige stippen, in drie stukjes: "32 spellen, 2435 vragen" · "zonder inloggen" · "gratis en vrij te gebruiken". Dan het LG-merkje met de kreeftrode stip en `meneergreidanus.nl`. Als laatste, handgeschreven: *Gaan ze de klas uit met een vraag.*

## User flow worth showing
1. **Entry:** leerling opent de link van het bord, kiest niveau (geen account, geen instelwerk).
2. **Key action:** speelt Zwaardvechter; een vraag goed beantwoorden is de aanval.
3. **Result:** de docent ziet de klas binnenkomen op het digibord (Klasquiz) en heeft per spel een lesbrief.

## Tone
- Preset: default
- Creative direction: warme lesbrief-energie: een docent laat zien wat hij bouwde, speels maar serieus over leren
- Interpretation: comfortabel tempo (5 tot 6 scènes van 2,5 tot 5 s), snelle entrees maar elke regel blijft lang genoeg staan om te lezen, geen caps, geen grappen die de site zelf niet maakt. Humor komt uit de feiten (een geschiedenisleraar die een vechtspel bouwde), niet uit de toon.

## Format: landscape — 1920x1080
## Duration: 24.6 s (30 fps)

## Visual identity (from the project)
- Background: `#FBF6F1` (--room, cream); donkere grot `#120c10` → `#2a1810` voor de hook
- Panel: `#FFFFFF` (--paper), radius 22px, lijn `rgb(20 34 76 / .10)`, harde schaduw `0 9px 0 rgb(20 34 76 / .10)`
- Text: `#14224C` (--ink, navy); gedempt `#5b6480`
- Accent: `#F26749` (--crab), `#EA9836` (--amber), `#204ECF` (--ocean), `#83A5F2` (--vista), `#FCDED6` (--sand)
- Handschrift: `#D9522F` (--hand) in Caveat 600
- Display font: Poppins 700 (koppen), letter-spacing -0.03em, line-height .92
- Body font: Poppins 400/500
- Strongest visual element: de kijkdoos met de grot (rode hand, vuurgloed) en de kopregel *geschiedenis, maar dan* / **Die leeft**; daarna de arena van Zwaardvechter en de avatar-blobs.
- Eigen bewegingstaal van de site: `rise` (van y .5em + rotate 2° naar 0, ease cubic-bezier(.22,.61,.36,1)), `schuifIn` (van x 34px), letters van de kop met 45 ms stagger.

## Share copy (draft)
Geschiedenis, maar dan die leeft: 32 spellen en 2435 vragen van een docent geschiedenis, zonder inloggen en gratis voor in je les. meneergreidanus.nl

## Audio direction
- Role: warm bed
- Music: `happy-beats-business-moves-vol-9-by-ende-dot-app.mp3` (mid-energy, laid-back, 114.84 BPM)
- Music treatment: start op 0 s, volume 0.32, korte fade-in 0.3 s, fade-out over de laatste 1.6 s (23.0 → 24.6 s) zodat de laatste handgeschreven regel in stilte landt
- Music cue guidance: preset gelezen (`assets/music/cues/happy-beats-business-moves-vol-9-by-ende-dot-app.music-cues.json`). Beatraster ~0.525 s: 1.07, 1.59, 2.12, 2.65, 3.18, 3.70, 4.23, 4.75, 5.28, 5.80, 6.34, 6.86, 7.40, 7.92, 8.44, 8.96, 9.50, 10.01, 10.54, 11.06, 11.60, 12.12, 12.65, 13.18, 13.70, 14.22, 14.76, 15.28, 15.81, 16.34, 16.86, 17.38, 17.91, 18.44, 18.96, 19.48, 20.02, 20.54, 21.06, 21.59, 22.12, 22.64, 23.17, 23.70, 24.22. Strong cues om op te landen: **3.70 s** ("Die leeft" komt binnen), **6.34 s** (cut naar de leeromgeving), **11.60 s** (vraagkaart schuift op), **23.17 s** (laatste handgeschreven regel). Beat-grid-vensters: niveauknoppen 7.92/8.44/8.96; spelkaarten 10.01/10.28/10.54/10.80 (korte labels, blijven daarna staan); antwoorden 12.12/12.38/12.65/12.91 (blijven staan tot de tik); avatars 17.38/17.91/18.44/18.96/19.48/20.02; beloftechips 20.54/21.06/21.59.
- Audio-reactive treatment: subtle; bas/RMS laat de vuurgloed in de grot ademen (scène 1 en in de kijkdoos van scène 2) en geeft de arena-achtergrond een zachte warmte; geen waveforms, geen pulserende tekst.
- SFX posture: moderate, motion-matched, lage HF-risico's: zachte impactSoft voor de harde cuts en de landing van "Die leeft", toetsaanslagen bij het typen van het adres, click_003 bij de cursor-tikken, drop_001/002 bij binnenkomende chips en avatars (eerste en laatste geaccentueerd, tussenliggende zachter), chips-collide bij de klap op de fout, impactBell_heavy_000 bij het merkje.
- Audio-coupled moments: getypt adres (toetsen), niveauknoppen op beats, cursor-tik, vraagkaart op strong cue, klap op de fout, avatars op beats, beloftechips op beats, merkje met bel.
- Restraint rule: geen SFX op elke letter van "Die leeft"; geen geluid stapelen op de laatste regel (de muziek is dan al bijna weg); nooit meer dan twee SFX binnen 0.3 s.

## Storyboard

### Scene 1 — De hand op de wand — 2.6 s (0.00 → 2.60)
Volledig donker paneel: grotgradiënt `#0c0810` → `#2a1810`, onderin midden een amberkleurige vuurgloed (radial gradient) die ademt op de bas. Op 0.40 s spuit een rode okerhand (`#F26749`, de handvorm-symbool van de site: afgeronde rechthoeken) op de rots: van blur 16px en opacity 0 naar scherp, iets gedraaid. Op 1.07 s onderin links, klein in cream Poppins 500: "minstens 37.000 jaar geleden" en eronder in muted "El Castillo, Cantabrië". Beide blijven staan tot de cut.
Sequential/interaction: geen
Audio intent: warm en verwachtingsvol; de muziek komt net op
Audio-coupled idea: impactSoft_medium_001 zacht bij het landen van de hand (0.45 s)
Music: vol-9 vanaf 0 s, fade-in 0.3 s
Transition mood: hard (cut op beat 2.65) → Scene 2

### Scene 2 — Die leeft — 3.7 s (2.60 → 6.30)
Cream. Links de kop: Caveat "geschiedenis, maar dan" in `#D9522F` schrijft van links naar rechts (2.65 → 3.35). Op **3.70 s (beat-locked)** komt "Die leeft" (Poppins 700, ~230px, navy) letter voor letter omhoog (y +.5em, rotate 2° → 0, stagger 45 ms, de `rise`-beweging van de site). Op 4.75 s de subregel (Poppins 400, ~34px, muted): "Spellen en werkvormen van een docent geschiedenis, voor in de les en voor thuis." Rechts schuift op 4.23 s de kijkdoos in (paper-paneel, radius 22, de `schuifIn`-beweging vanaf x +34px): binnenin dezelfde grot met de hand en de ademende gloed, eronder de jaartalchips "37.000 jaar geleden" (navy, actief) "3300 v.Chr." "430 v.Chr." "1454" "1602" "1941" "1969" "nu".
Sequential/interaction: ja, de letters van "Die leeft" één voor één; de kijkdoos schuift in als tweede laag
Audio intent: de kopregel is het eerste grote moment; het bed draagt, één zachte klap
Audio-coupled idea: impactSoft_medium_004 op 3.70 s samen met de eerste letter; geen geluid per letter
Transition mood: clean (paneel-slide + korte crossfade 0.4 s, landt op beat 6.34) → Scene 3

### Scene 3 — Een link is genoeg — 4.75 s (6.30 → 11.05)
Cream. Links de kop: Caveat "zonder inloggen" op 6.86 s, daaronder Poppins 700 (~110px) "Een link is genoeg." op 7.10 s. Rechts een browserpaneel (paper, radius 22, harde schaduw, een adresbalk): op 6.40 → 7.30 s typt de adresbalk `meneergreidanus.nl/leermiddelen` teken voor teken. Daaronder de niveaubalk: drie knoppen komen binnen op **7.92 / 8.44 / 8.96 s**: "vmbo-bb", "vmbo-kgt en tl", "havo en vwo" (de echte NIVEAUS-labels). Een ronde cursor beweegt naar "havo en vwo" en tikt op **9.50 s**: de knop kleurt oceaanblauw met cream tekst. Daarna waaieren vier spelkaarten in op **10.01 / 10.28 / 10.54 / 10.80 s**: "Zwaardvechter" (navy bolletje), "Torenverdediging" (kreeftrood), "Klasquiz" (oceaanblauw), "Bronnenlab" (oceaanblauw). Alles blijft staan tot 11.05 s (labels zijn kort; de set houdt minstens 0.25 s na de laatste, en de eerste drie langer).
Sequential/interaction: ja, getypt adres; drie knoppen één voor één; gesimuleerde cursor-tik; vier kaarten één voor één
Audio intent: speels, licht, ritmisch op het beatraster
Audio-coupled idea: keypress-*.wav (gerandomiseerd uit acht bestanden, index-gestuurd) per teken op 0.55–0.65; drop_001 bij elke niveauknop (0.55); click_003 bij de tik (0.7); card-slide-1 bij de eerste kaart, drop_002 zachter bij de andere
Transition mood: hard (cut op beat 11.06) → Scene 4

### Scene 4 — Zwaardvechter — 5.3 s (11.05 → 16.35)
De Zwaardvechter-schermopbouw (naar `leermiddelen/beeld/zwaard.jpg`): bovenbalk met LG-merkje en "Zwaardvechter", de HUD-panelen (LEVEN 100 / 100 met groene balk, MUNTEN 0, RONDE 1, NOG TE GAAN 8, GEVELD 0, blauwe knop "Ontwijk · spatie of shift"), daaronder de zandkleurige arena (`#EFE3CE`-achtig raster, oranje afgeronde rand) met de blauwe blob-avatar (echte `AVATAR.svg`, navy `#204ECF` met gezichtje en een dunne zwaardstreep) in het midden en vier rode "?"-fouten rondom. Op **11.60 s (beat-locked)** schuift een vraagkaart (paper, radius 16) van onderen over de arena: "GESCHIEDENIS · tijdvakken" klein, dan de vraag "In welk tijdvak hoort dit? De VOC wordt opgericht als eerste bedrijf met aandelen" (Poppins 600, ~40px). Vier antwoordknoppen komen binnen op **12.12 / 12.38 / 12.65 / 12.91 s**: "regenten en vorsten", "steden en staten", "burgers en stoommachines", "wereldoorlogen"; ze blijven staan. Cursor beweegt vanaf 13.4 s en tikt op **14.22 s** "regenten en vorsten": knop wordt groen (`#2f7d52`) met cream tekst. Kaart schuift weg op 14.76 s; de blob schiet naar de dichtstbijzijnde fout, die op **15.28 s** wegklapt (scale → 0, korte rode flits); GEVELD telt 0 → 1, MUNTEN 0 → 12 (tellen in 0.4 s), het gezichtje wordt blij (mond omhoog). Onderin links verschijnt op 15.35 s een label: Poppins 600 "Goed antwoord is geld" met daaronder Caveat "en met geld koop je een scherper zwaard" (beide uit de uitleg van het spel). Houdt tot 16.35 s.
Sequential/interaction: ja, vraagkaart schuift op; vier antwoorden één voor één; cursor-tik; klap op een fout; tellers lopen op
Audio intent: dit is het spel; iets meer energie, maar warm
Audio-coupled idea: card-slide-1 bij de kaart (11.60); drop_001 bij het eerste en laatste antwoord; click_003 bij de tik (14.22); chips-collide-1 bij de klap (15.28); geen geluid op de tellers
Transition mood: clean (slide 0.4 s, landt op beat 16.34) → Scene 5

### Scene 5 — Morgen in je les — 4.2 s (16.35 → 20.55)
Cream. Boven de kop: Caveat "voor de docent" op 16.50 s, Poppins 700 (~96px) "Morgen in je les." op 16.86 s. Links (60%) het digibordpaneel van de Klasquiz: eyebrow "KLASQUIZ", kop "Doe mee op je telefoon", regel "Ga naar **meneergreidanus.nl/q** en vul de code in.", rechts in het paneel een codevak met "code" en vier letters "MAAN" in navy. Onder de regel de spelerslijst: zes chips met bijnaam en echte avatar-blob komen binnen op **17.38 / 17.91 / 18.44 / 18.96 / 19.48 / 20.02 s**: Noor, Sem, Yara, Daan, Lina, Milan. Rechts (40%) de lesbriefkaart die op 17.10 s inschuift: eyebrow "LESBRIEF", kop "Zwaardvechter", vijf rijen met label en waarde: Leerdoel "Dezelfde vragenbank als Torenverdediging, in een actiespel", Tijd "10 tot 15 minuten", Niveau "vmbo-bb tot vwo", Werkvorm "Individueel of samen", Nabespreking "Welke vraag ging steeds mis?" (de waarden zijn ingekort uit `lesbrieven.html`; de vijf labels zijn de vaste velden van elke lesbrief).
Sequential/interaction: ja, zes avatars één voor één op het beatraster (korte namen; de volle set staat 0.5 s stil aan het eind)
Audio intent: gezellig, een klas die binnenkomt
Audio-coupled idea: drop_002 bij elke avatar (0.5), eerste en laatste op 0.65; niets bij de lesbrief
Transition mood: soft (crossfade 0.5 s, landt op beat 20.54) → Scene 6

### Scene 6 — Outro — 4.05 s (20.55 → 24.60)
Cream, gecentreerd, veel lucht. De beloftenregel van de hero komt binnen als drie chips met een amberkleurige stip, op **20.54 / 21.06 / 21.59 s**: "32 spellen, 2435 vragen", "zonder inloggen", "gratis en vrij te gebruiken" (Poppins 500, ~34px, navy). Op **22.12 s** het LG-merkje (navy afgerond blokje, "LG" in cream, kreeftrode stip rechtsboven die inschaalt) en daarnaast "meneergreidanus.nl" (Poppins 700, ~96px, navy). Op **23.17 s (beat-locked)** onderin de handgeschreven regel (Caveat, `#D9522F`, ~64px): "Gaan ze de klas uit met een vraag." Alles houdt tot het einde; de muziek is dan uitgefade.
Sequential/interaction: ja, drie chips één voor één, dan merkje + naam, dan de laatste regel
Audio intent: warm afronden; de bel bij het merkje, dan stilte voor de laatste regel
Audio-coupled idea: drop_001 bij elke chip (0.55); impactBell_heavy_000 bij het merkje op 22.12 (0.7); geen SFX op de laatste regel
Transition mood: einde, laatste frame houdt

**Music mood for this video:** upbeat, warm, laid-back (vol-9)
**Audio summary:** een warm bed dat op 0 s inkomt, getypte toetsen en zachte drops die het beatraster volgen, één klap in de arena, één bel bij het merkje, en een fade-out zodat de laatste handgeschreven regel in stilte landt.

## Feitencheck
- De hero op de site zegt "31 spellen, 1684 vragen"; de catalogus `SPELLEN` in `leermiddelen/index.html` telt 32 spellen en `node server/maak-bank.js` telt 2435 vragen. De video gebruikt de geverifieerde cijfers.
- Alle andere regels zijn letterlijk van de site: de kopregel, de subregel, de niveaulabels, de vraag met antwoorden uit `bank.js`, de Klasquiz-teksten, de lesbriefvelden en de slotregel.
