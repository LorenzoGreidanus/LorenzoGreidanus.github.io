# Hyperframes Composition Brief: meneergreidanus.nl

## Objective
Create a short launch-style brag video for meneergreidanus.nl, the site of a Dutch history teacher with 32 browser games and one shared question bank of 2435 questions, free and without login.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080, 30 fps
- Duration: 24.6 seconds

## Source Material
- Project root: `C:\Users\loren\Documents\GitHub\LorenzoGreidanus.github.io`
- Primary files read: `index.html` (hero, kijkdoos, CSS tokens), `README.md`, `PRODUCT.md`, `leermiddelen/index.html` (SPELLEN, NIVEAUS), `leermiddelen/bank.js`, `leermiddelen/klasquiz.html`, `leermiddelen/lesbrieven.html`, `leermiddelen/avatar.js`, `leermiddelen/beeld/zwaard.jpg`, `fonts.css`
- Product name: meneer Greidanus / meneergreidanus.nl (the person is Lorenzo Greidanus; the site name is used in the learning environment)
- Tagline / strongest claim: "geschiedenis, maar dan" / "Die leeft"; "zonder inloggen, gratis en vrij te gebruiken"; "Gaan ze de klas uit met een vraag."
- Key UI or visual moments to recreate: the cave scene with the red ochre hand (opening tafereel); the hero headline; the level buttons and game cards of the learning environment; the Zwaardvechter HUD + arena with a question card; the Klasquiz host screen with joining avatars; a lesson sheet card; the belofte chips and LG mark.
- Copy that must appear verbatim (Dutch):
  - "geschiedenis, maar dan" / "Die leeft"
  - "Spellen en werkvormen van een docent geschiedenis, voor in de les en voor thuis."
  - "minstens 37.000 jaar geleden" / "El Castillo, Cantabrië"
  - "vmbo-bb" / "vmbo-kgt en tl" / "havo en vwo"
  - "Zwaardvechter" / "Torenverdediging" / "Klasquiz" / "Bronnenlab"
  - "In welk tijdvak hoort dit? De VOC wordt opgericht als eerste bedrijf met aandelen" with answers "regenten en vorsten", "steden en staten", "burgers en stoommachines", "wereldoorlogen" (correct: the first)
  - HUD labels: "LEVEN 100 / 100", "MUNTEN", "RONDE", "NOG TE GAAN", "GEVELD", "Ontwijk" / "spatie of shift"
  - "Goed antwoord is geld" / "en met geld koop je een scherper zwaard"
  - "Doe mee op je telefoon" / "Ga naar meneergreidanus.nl/q en vul de code in." / "code"
  - "Lesbrief" fields: Leerdoel, Tijd, Niveau, Werkvorm, Nabespreking
  - "32 spellen, 2435 vragen" / "zonder inloggen" / "gratis en vrij te gebruiken"
  - "meneergreidanus.nl"
  - "Gaan ze de klas uit met een vraag."

## Creative Direction
- Tone preset: default
- Creative direction: warme lesbrief-energie: een docent laat zien wat hij bouwde, speels maar serieus over leren
- Interpretation: comfortable pacing (6 scenes, 2.6 to 5.3 s), snappy entrances (0.3 to 0.6 s) with generous holds so every line is readable, mixed case, no shouting, humor only from the facts (a history teacher built a sword-fighting game).
- Angle: the site opens on a 37,000-year-old handprint and ends in a classroom; the video does the same. Show the product in use, not its marketing: the student entering without login, the game where a right answer is an attack, the teacher's board filling with nicknames.
- Hook: dark cave, red ochre hand sprays onto the rock over a breathing fire glow, small caption "minstens 37.000 jaar geleden"; hard cut on the beat to cream and the handwritten "geschiedenis, maar dan" then "Die leeft" rising letter by letter.
- Outro / punchline: three belofte chips, the LG mark + "meneergreidanus.nl", then the handwritten "Gaan ze de klas uit met een vraag." while the music fades out.
- Avoid:
  - Generic SaaS language (nothing that isn't already on the site)
  - Abstract filler visuals (no particles, no gradient text, no waveform)
  - Unrelated visual redesign (use the site's tokens, fonts, radii and hard 9px shadow exactly)
  - English copy on screen

## Visual Identity
- Background: `#FBF6F1` (cream); cave `#0c0810` → `#2a1810`
- Panel: `#FFFFFF`, radius 22px (16px inner), border `1px solid rgb(20 34 76 / .10)`, shadow `0 9px 0 rgb(20 34 76 / .10)`
- Text: `#14224C` navy; muted `#5b6480`; text on ocean blue is `#FBF6F1`
- Accent: `#F26749` crab, `#EA9836` amber, `#204ECF` ocean, `#83A5F2` vista, `#FCDED6` sand, handwriting `#D9522F`, success green `#2f7d52`
- Display font: Poppins 700 (local woff2 in `assets/fonts/`, `@font-face` in file), letter-spacing -0.03em on the hero
- Body font: Poppins 400/500/600 (local woff2); handwriting Caveat 600 (local woff2)
- Visual references from the project: hero `rise` motion (y .5em + rotate 2° → 0, ease cubic-bezier(.22,.61,.36,1)), `schuifIn` (x 34px → 0), `.knop` pills (radius 999px, 1.5px border), `.belofte` chips with amber 8px dots, `.lgmark` (navy rounded square, "L" "G", crab dot top-right), `AVATAR.svg(naam, maat)` from `assets/avatar.js` for real avatar blobs, the Zwaardvechter screen in `leermiddelen/beeld/zwaard.jpg`.

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. De hand op de wand — 2.6 s — cave, breathing fire glow, red hand sprays in, caption "minstens 37.000 jaar geleden" / "El Castillo, Cantabrië"
2. Die leeft — 3.7 s — Caveat "geschiedenis, maar dan" writes in; "Die leeft" letters rise at 3.70 s (beat-locked); subline; kijkdoos panel slides in with the cave and year chips
3. Een link is genoeg — 4.75 s — typed address `meneergreidanus.nl/leermiddelen`; three level buttons on beats; cursor taps "havo en vwo"; four game cards fan in; headline "Een link is genoeg." with Caveat "zonder inloggen"
4. Zwaardvechter — 5.3 s — HUD + arena with avatar blob and four red "?" enemies; question card slides up at 11.60 s (beat-locked); four answers; cursor taps the right one (green); card leaves; blob strikes an enemy, it pops; GEVELD 0→1, MUNTEN 0→12; happy face; label "Goed antwoord is geld" / "en met geld koop je een scherper zwaard"
5. Morgen in je les — 4.2 s — Klasquiz host panel ("Doe mee op je telefoon", "Ga naar meneergreidanus.nl/q en vul de code in.", code "MAAN") with six avatars arriving on beats; lesson-sheet card with the five fields; headline "Morgen in je les." with Caveat "voor de docent"
6. Outro — 4.05 s — three belofte chips on beats; LG mark + "meneergreidanus.nl" at 22.12 s with bell; Caveat "Gaan ze de klas uit met een vraag." at 23.17 s (beat-locked); hold

## Audio
- Audio role: warm bed
- Audio arc: bed fades in at 0 s, typed keys and soft drops follow the beat grid through scenes 3 to 6, one physical hit in the arena, one bell on the mark, then the bed fades out over the final 1.6 s so the last handwritten line lands in near silence.
- Music: `assets/music/happy-beats-business-moves-vol-9-by-ende-dot-app.mp3`
- Music treatment: volume 0.32, fade-in 0.3 s, fade-out 23.0 → 24.6 s; music on track 10, SFX on tracks 11+
- Music cue guidance: bundled preset copied to `assets/music/cues/happy-beats-business-moves-vol-9-by-ende-dot-app.music-cues.json` (114.84 BPM, beat ≈ 0.525 s). Strong-cue locks: 3.70 s ("Die leeft"), 6.34 s (cut to scene 3), 11.60 s (question card), 23.17 s (final line). Beat grid for sequential items as listed in the plan.
- Audio-reactive treatment: subtle; per-frame data extracted with the hyperframes-creative helper to `assets/audio-data.json`; bass/RMS drives the fire glow scale/opacity in scenes 1 and 2 (10 to 25 percent swing) and a faint warmth on the arena background; never text.
- Audio-coupled moments:
  - Scene 1 hand landing — soft impact
  - Scene 2 "Die leeft" first letter — soft impact (one, not per letter)
  - Scene 3 typed address — randomized keypress files (index-derived, deterministic)
  - Scene 3 level buttons / game cards — drop / card-slide
  - Scene 3 and 4 cursor taps — click_003
  - Scene 4 question card — card-slide-1; enemy pop — chips-collide-1
  - Scene 5 avatars — drop_002 per avatar, first and last louder
  - Scene 6 chips — drop_001; mark — impactBell_heavy_000
- SFX selection guidance: low/medium HF-risk files only (see `.agents/skills/brag/assets/sfx/sfx-analysis.md`); align SFX to the start of each motion; never two SFX within 0.3 s except keypresses; SFX volumes 0.5 to 0.7.
- SFX analysis guidance: `.agents/skills/brag/assets/sfx/sfx-analysis.md`
- Exact SFX choice: Hyperframes chooses final timestamps and volumes from the implemented animation. Candidate files are already copied into `assets/sfx/`.
- Audio files: `brag-output/composition/assets/music/` and `brag-output/composition/assets/sfx/`

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-cli`. /brag is its own workflow: do not enter the `hyperframes` entry-point intent interview and do not route into its generic promo / launch-video workflow.

Requirements:
- Standalone `index.html`, root `data-composition-id="brag"`, 1920x1080, `data-duration="24.6"`, one paused GSAP timeline registered on `window.__timelines["brag"]` after fonts are ready.
- Six root-level `.clip` scenes with `data-start`/`data-duration` as in the plan; all motion inside a scene is authored relative to the scene start; no CSS transitions on animated nodes; `fromTo` with explicit from-states; no `Math.random`; no `repeat: -1`.
- Show at least one real UI, copy, or visual element from the source project (the plan shows several: hero, level buttons, game cards, Zwaardvechter HUD/arena, Klasquiz host screen, avatars via the site's own `avatar.js`).
- Keep all text readable in the final render; every line holds at least 0.8 s (labels) or 0.3 s per word (sentences); `check` contrast must pass (navy on cream, cream on ocean/navy, navy on crab, muted `#5b6480` only at 20px+).
- Keep the video at 24.6 seconds.
- Include the music bed and SFX layer; every `<audio>` has an id, `data-start`, `data-duration`, `data-track-index` (music 10, SFX 11+ with no overlapping duplicates on one track), `data-volume`.
- Beat-lock the four strong-cue moments within ±0.15 s and mark them `// beat-locked`; snap sequential items to the beat grid within ±0.10 s and mark `// beat-grid`; ignore a cue when it hurts readability.
- Audio-reactive: sample `assets/audio-data.json` per frame with `tl.call` to drive the fire glow only.
- Use local assets only (fonts, music, SFX, avatar.js, GSAP from the bundled CDN reference is acceptable if the runtime allows; prefer a local copy if available).
- Run `npx hyperframes check` before render — it is brag's single gate.
