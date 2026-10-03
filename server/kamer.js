/* Een spelkamer: een Durable Object met een code van vier letters.

   De kamer is de baas over de spelstand. Spelers en het digibord hangen er
   met een WebSocket aan; wat zij sturen zijn wensen (start, antwoord), wat de
   kamer terugstuurt is de waarheid (welke vraag, wie wat scoorde).

   Twee spellen:
   - de Klasquiz: de docent opent een kamer met een stapel vragen, leerlingen
     doen mee op hun telefoon, per vraag telt goed en snel, na elke vraag een
     tussenstand. De kamer rekent de scores uit, dus die zijn niet te vervalsen.
   - de Klasstrijd: iedereen speelt Torenverdediging of Zwaardvechter op zijn
     eigen scherm, de kamer verbindt de spelers. De docent start iedereen
     tegelijk, de spelers melden hun stand (ronde, levens, punten), goede
     reeksen sturen extra fouten naar de anderen, en wie het langst overleeft
     wint. De stand komt hier van de spelers zelf; de kamer houdt hem bij en
     zet hem op het bord.

   De stand staat in this.stand en wordt na elke wijziging weggeschreven,
   want een Durable Object dat even niets te doen heeft gaat slapen en begint
   daarna weer bij de constructor. De WebSockets overleven dat slapen wel (de
   hibernation API); wie erbij hoort staat in de bijlage van elke socket. */
import { DurableObject } from "cloudflare:workers";
import { nette, verboden } from "./naamfilter.js";
/* de motor van Zwaardvechter: hetzelfde bestand dat de browser laadt */
import ZWAARDMOTOR from "../leermiddelen/zwaard-motor.js";
import TORENMOTOR from "../leermiddelen/toren-motor.js";
/* de regels van Poortrace: welke vraag, welke antwoorden op de banen, hoe snel, hoeveel punten */
import POORTREGELS from "../leermiddelen/poortrace-regels.js";
import { laadVragen } from "./stadvragen.js";
const TORENSTAP = 60, TOREN_STAND_OM = 2;   /* Torenverdediging: een tik van zestig milliseconden, de stand om de andere tik */
const TOREN_WACHT_KEUZE = 1500;             /* zolang wacht de kamer op de keuze van de tweede speler */
const RANGEN = { bb: 1, kgt: 2, havo: 3, vwo: 4 };
const MOTORSTAP = 1 / 60, MOTOR_STAND_OM = 2, MOTOR_STIL_OM = 12;   /* per hoeveel tikken de stand gaat: in de ronde, en daarbuiten */
const MOTOR_ZONDER_SPELERS = 60 * 1000;                            /* zonder een enkele speler stopt de motor na een minuut */

const MAX_SPELERS = 60, MAX_VRAGEN = 60;
const AFTELLEN = 3000;                       /* een duel begint drie seconden nadat de tweede speler er is */
const SAMEN_MAX = 4;                         /* Zwaardvechter samen: tot vier in een arena; de maker start, of het begint vanzelf als hij vol is */
const OPRUIMEN_NA = 3 * 60 * 60 * 1000;     /* een kamer leeft hoogstens drie uur */
const NA_EINDE = 30 * 60 * 1000;             /* na de eindstand nog een half uur te bekijken */
/* wat een leerling hoort die de docent uit de klas haalde; klas.js herkent "uit de klas gehaald" */
const WEG_FOUT = "je docent heeft je uit deze klas gehaald";
const SPELLEN_STRIJD = { toren: "Torenverdediging", zwaard: "Zwaardvechter", poortrace: "Poortrace" };
/* Poortrace als race: met vrienden tot acht in een kamer, of met de hele klas.
   Wie het eerst over de finish komt wint. De kamer is de baas over de race,
   zoals bij de Klasquiz: hij kiest de vraag van ieders volgende poort (uit
   stad-vragen/<vak>.json, met de regels van poortrace-regels.js), stuurt hem
   zonder het antwoord, kijkt de baan na die terugkomt, en zet alleen dan de
   speler een poort verder. Goed, punten, reeks en tempo telt hij zelf, en de
   finish klokt hij zelf. De browser meldt alleen nog waar zijn karretje tussen
   twee poorten rijdt, voor het beeld van de anderen.
   Sneller dan kan: de pagina rijdt in doelTijd seconden naar de poort (die
   stuurt de kamer mee) en na een goede poort gaat de volgende vraag er na een
   kleine halve seconde op; na een fout na de slip (POORTREGELS.SLIP; tot
   september 2026 ook nog de uitleg, tot de speler op Volgende tikte). Gemeten met
   de speelbot in de race op vwo, alles goed, drie browsers (september 2026):
   van vraag tot poort 0,95 tot 0,99 maal doelTijd na die halve seconde, de
   eerste poort 1,11 maal doelTijd na de start, de finish 1,6 tot 2,3 seconden
   na de laatste poort, de hele race 83 tot 87 seconden. Een antwoord dat
   eerder komt dan raceMinMs na de vraag, kijkt de kamer pas na als die tijd om
   is (niet weggooien: een eerlijke speler die net iets vlotter was merkt er zo
   hooguit een tiende van); de finish telt op zijn vroegst
   RACE_FINISH_MS na de laatste poort. Een bot die alles meteen goed zegt, is
   zo op vwo op zijn snelst na 80,3 seconden binnen (gemeten 81,6 met wat
   langere vragen). Met vrienden is de race drie minuten na de eerste finish
   vanzelf klaar, ook als er een is afgehaakt. */
const RACE_MAX = 8, RACE_POORTEN = POORTREGELS.POORTEN, RACE_UITLOOP = 3 * 60 * 1000;
const RACE_RIJ = 0.95, RACE_EERSTE = 1.05, RACE_NA_POORT = 450, RACE_FINISH_MS = 1450;
/* Na een fout komt de volgende vraag er pas op als de slip voorbij is, en dan
   trekt het voertuig op vanaf een kwart van zijn snelheid. RACE_NA_FOUT: de
   slip plus het grootste deel van dat optrekken. Nagemeten (september 2026,
   vwo rekenen, 9 van 15 goed): de speelbot in de pagina had na een fout 8,2
   tot 8,3 seconden tot de volgende poort, een bot met een kale verbinding die
   meteen antwoordt 8,07; na een goede poort 6,6 tegen 6,4. Tot september 2026
   (slip 0,9 s en de uitleg wegtikken, RACE_NA_FOUT 1100) was dat 8,3 tegen
   7,3. RACE_FINISH_FOUT: zoveel later mag de finish na een foute laatste poort
   (de slip en weer optrekken op het laatste stuk, eerlijk ruim 2,3 s later). */
const RACE_NA_FOUT = POORTREGELS.SLIP * 1000 + 700, RACE_FINISH_FOUT = POORTREGELS.SLIP * 1000 + 800;
/* Oneindig als race (september 2026): geen finish, iedereen rijdt tot zijn tank
   leeg is, wie de meeste kilometers reed wint (bij evenveel: wie er het eerst
   was). De kilometers komen uit sp.plek, zoals de kamer die bijhoudt: de
   poorten die hij had en daarbinnen wat de pagina meldt, nooit voorbij zijn
   volgende poort (POORTREGELS.km, een poort is 0,1 km). De tank houdt de kamer bij, niet de browser: hij rekent hem uit met de
   regels uit poortrace-regels.js (verbruik, tanken) en zijn eigen klok. Het
   verbruik loopt vanaf het startschot (met de klas plus het aftellen op de
   telefoon, RACE_AFTEL_MS) en loopt gewoon door, ook in de slip na een fout
   (tot september 2026 was de uitleg na een fout gratis, hoogstens acht
   seconden, tot de pagina verder meldde). Een pauze is er in een race niet. Leeg is leeg
   op de klok van de kamer; een antwoord dat binnen RACE_LEEG_MARGE daarna nog
   binnenkomt telt nog (het was onderweg). */
const RACE_AFTEL_MS = 2520, RACE_LEEG_MARGE = 800;
/* de plekken tussen twee standen door (stuurPos): om de zoveel ms, voor wie binnen zoveel duizendsten van een poort rijdt */
const RACE_POS_MS = 500, RACE_POS_BUURT = 3000;
/* spellen met rollen op telefoons: het bord draait het spel, de kamer deelt kaarten uit en geeft acties door */
const SPELLEN_ROLLEN = { polis: "De vergadering van de klas", meetlat: "Langs de meetlat", staten: "De vergadering", berlijn: "De Conferentie van Berlijn", standen: "Stem per stand", crisis: "De crisis", teken: "Tekenslag",
  markt: "De markt", ecosysteem: "Het ecosysteem", rivier: "Langs de rivier", gemeenteraad: "De gemeenteraad" };
const KAART_MAX = 12000, BORD_MAX = 40000, ACTIE_MAX = 4000;
const KLAS_SLAAPT = 400 * 24 * 60 * 60 * 1000; /* een klascode blijft tot de docent hem opheft, of tot hij ruim een jaar niet gebruikt is */
const KLAS_MAX = 3000, KLAS_BYTES = 700000;   /* uitslagen: hoogstens zoveel, en samen hoogstens zoveel tekens */
/* hoeveel tweede apparaten (verwijzingen op bijnaam) een klas onthoudt */
const KLAS_ALIAS = 2000;
/* hoeveel verschillende leerlingen er in een klas passen: ruim boven alle klassen
   van een docent bij elkaar, maar wel een grens tegen volduwen */
const KLAS_LEERLINGEN = 400;
/* spellen die een opdracht kunnen zijn: bij een onderdeel telt het aantal goed in dat onderdeel, anders de ronde (of het aantal goed bij de Vragenrace).
   Bij Mijnwerker is de ronde het diepste punt in meters, bij Poortrace het aantal goede poorten en bij Kaarttoren het aantal verdiepingen. */
const OPDRACHT_SPELLEN = { race: true, toren: true, zwaard: true, dictee: true, mijnwerker: true, poortrace: true, kaarttoren: true };
/* Het dictee als opdracht. Drie bronnen: de tekst van deze week (per niveau,
   uit de tekstbank van dictee.html), een vaste tekst uit die bank (dt: t-bb-01),
   of een eigen dictee van de docent (dt: eigen-K7M2QX, uit materiaal.js).
   "Elke week automatisch" bewaart niets per week: bij elk lezen rekent de kamer
   uit welke week het is (opdrachtNu), en de opdracht loopt van maandag 0:00 tot
   zondag 23:59, Nederlandse tijd. De uitslagen blijven per week bewaard, want
   elke melding draagt de week waarin hij gemaakt is.
   Gedaan is een melding van spel dictee met dezelfde tekst (dt), of bij de
   tekst van de week met dezelfde week (wk). */
const DICTEE_BRONNEN = { week: 1, tekst: 1, eigen: 1 };
const DICTEE_NIVEAUS = { bb: 1, kgt: 1, hv: 1 };
const DAG_MS = 86400000;
/* hoe laat het in Nederland is: de datum, en hoeveel de klok daar voorloopt op UTC */
function amsKlok(nu){
  const p = {};
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date(nu)).forEach(x => { p[x.type] = x.value; });
  return { y: +p.year, m: +p.month, d: +p.day, voor: Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(nu / 1000) * 1000 };
}
/* een Nederlandse kloktijd als tijdstip; met de voorsprong van dat moment zelf, want de zomertijd wisselt op een zondag */
function amsTijd(y, m, d, u, min){
  const muur = Date.UTC(y, m - 1, d, u || 0, min || 0);
  return muur - amsKlok(muur - amsKlok(muur).voor).voor;
}
/* De week zoals op de kalender (ISO: week 1 heeft de eerste donderdag van het
   jaar), in Nederlandse tijd: de sleutel 2026-W39, maandag 0:00 en zondag 23:59. */
export function dicteeWeek(nu){
  const a = amsKlok(nu);
  const dag = Date.UTC(a.y, a.m - 1, a.d), wd = (new Date(dag).getUTCDay() + 6) % 7;
  const don = new Date(dag + (3 - wd) * DAG_MS), jaar = don.getUTCFullYear();
  const nr = 1 + Math.floor((don.getTime() - Date.UTC(jaar, 0, 1)) / (7 * DAG_MS));
  const ma = new Date(dag - wd * DAG_MS), zo = new Date(dag + (6 - wd) * DAG_MS);
  return { sleutel: jaar + "-W" + String(nr).padStart(2, "0"), nr,
    van: amsTijd(ma.getUTCFullYear(), ma.getUTCMonth() + 1, ma.getUTCDate(), 0, 0),
    tot: amsTijd(zo.getUTCFullYear(), zo.getUTCMonth() + 1, zo.getUTCDate(), 23, 59) };
}
/* een tekst uit de bank (t-bb-01) of een eigen dictee (eigen-K7M2QX); een voorvoegsel dictee- mag */
function dicteeTekst(x){
  let s = String(x || "").trim().replace(/^dictee-/i, "");
  if (/^eigen-[A-Za-z0-9]{6}$/i.test(s)) return "eigen-" + s.slice(6).toUpperCase();
  s = s.toLowerCase();
  return /^[a-z0-9][a-z0-9-]{1,30}$/.test(s) && !/^eigen-/.test(s) ? s : "";
}
/* een week als 2026-W39 (ook 2026-39 of 2026W39) */
function dicteeWeekSleutel(x){
  const m = /^(\d{4})-?W?(\d{1,2})$/i.exec(String(x || "").trim());
  if (!m || +m[2] < 1 || +m[2] > 53) return "";
  return m[1] + "-W" + m[2].padStart(2, "0");
}
/* de woorden die fout gingen: hoogstens veertig, alleen woorden, en door het naamfilter */
function dicteeFout(x){
  if (!Array.isArray(x)) return undefined;
  const uit = [];
  for (const w0 of x.slice(0, 80)){
    const w = schoon(w0, 30);
    if (!w || !/^[\p{L}\p{M}0-9'’.-]+$/u.test(w) || verboden(w)) continue;
    uit.push(w);
    if (uit.length >= 40) break;
  }
  return uit.length ? uit : undefined;
}
/* wat een melding van het dictee extra meeneemt: welke tekst, welke week, hoeveel woorden goed van hoeveel, en welke fout */
/* dictee.html meldt via SPEL.einde, en dat geeft alleen od door: per tekst "dictee: t-bb-01" = [goed, woorden] */
function dicteeUitOd(od){
  /* alleen sleutels met een tekst erin; "dictee: werkwoorden" is een onderdeel, geen tekst */
  const k = Object.keys(od && typeof od === "object" ? od : {}).filter(x => /^dictee: (t-[a-z]+-[0-9]+|eigen-[A-Za-z0-9]{6})$/.test(x));
  if (k.length !== 1) return null;
  const w = od[k[0]], dt = dicteeTekst(k[0].slice(8));
  return dt && Array.isArray(w) ? { dt, g: getal(w[0], 2000), n: getal(w[1], 2000) } : null;
}
function dicteeVelden(inz){
  const uit = {}, uitOd = dicteeUitOd(inz.od);
  const dt = dicteeTekst(inz.tekst || (inz.eigen ? "eigen-" + inz.eigen : "")) || (uitOd ? uitOd.dt : "");
  if (dt) uit.dt = dt;
  if (inz.goed === undefined && uitOd && uitOd.dt === dt && uitOd.n > 0 && uitOd.g <= uitOd.n){ uit.gw = uitOd.g; uit.tw = uitOd.n; }
  const wk = dicteeWeekSleutel(inz.week);
  if (wk) uit.wk = wk;
  const tw = getal(inz.woorden !== undefined ? inz.woorden : inz.totaal, 2000), gw = getal(inz.goed, 2000);
  if (tw > 0 && gw <= tw && inz.goed !== undefined){ uit.gw = gw; uit.tw = tw; }
  const fw = dicteeFout(inz.fout);
  if (fw) uit.fw = fw;
  return uit;
}
/* [goed, van de] woorden; zonder die velden uit de telling per onderdeel */
function dicteeScore(r){
  if (r.tw) return [r.gw | 0, r.tw];
  const eigen = r.dt && r.od && r.od["dictee: " + r.dt];
  if (Array.isArray(eigen) && eigen[1] > 0) return [eigen[0] | 0, eigen[1]];
  if (r.od && typeof r.od === "object"){
    let g = 0, n = 0;
    for (const k of Object.keys(r.od)){ const w = r.od[k]; if (Array.isArray(w)){ g += w[0] | 0; n += w[1] | 0; } }
    if (n) return [g, n];
  }
  return null;
}
/* hoort deze melding bij deze dictee-opdracht (zoals opdrachtNu hem geeft)? */
function dicteePast(r, o){
  if (r.spel !== "dictee") return false;
  if (o.bron === "week"){
    if (o.niveau && DICTEE_NIVEAUS[r.niveau] && r.niveau !== o.niveau) return false;
    if (r.wk) return !!o.week && r.wk === o.week;
    /* Zonder week in de melding (zo meldt dictee.html nu): een tekst uit de bank
       van dit niveau, gemaakt in deze week. Welke tekst van de week is, weet
       alleen de tekstbank in de browser; de knop opent precies die. */
    return !!r.dt && r.dt.indexOf("t-" + (o.niveau ? o.niveau + "-" : "")) === 0 && r.t >= o.sinds && r.t < o.sinds + 7 * DAG_MS + 3600000;
  }
  return !!r.dt && r.dt === o.dt && r.t >= o.sinds;
}
/* de opdracht zoals hij nu is: een dictee dat elke week vanzelf vernieuwt krijgt de week van vandaag */
function opdrachtNu(o, nu){
  if (!o || o.spel !== "dictee" || !o.auto) return o;
  const w = dicteeWeek(nu);
  return Object.assign({}, o, { week: w.sleutel, weekNr: w.nr, sinds: w.van, tot: w.tot });
}
function maatVoor(r, o){
  /* bij het dictee: het deel van de woorden dat goed was, in procenten */
  if (o.spel === "dictee"){ if (!dicteePast(r, o)) return 0; const s = dicteeScore(r); return s ? Math.round(100 * s[0] / s[1]) : 0; }
  if (r.spel !== o.spel || (r.vak || "") !== o.vak || r.t < o.sinds) return 0;
  if (o.deel) return r.od && r.od[o.deel] ? (r.od[o.deel][0] | 0) : 0;
  return r.ronde | 0;
}
function haaltOpdracht(r, o){ return o.spel === "dictee" ? dicteePast(r, o) : maatVoor(r, o) >= o.min; }                        /* hoogstens zoveel gemelde potjes per klas */
/* hoogstens zoveel opdrachten tegelijk */
const OPDRACHTEN_MAX = 5;
/* Het begin van deze week: maandag 0:00, Nederlandse tijd bij benadering
   (UTC plus een uur; in de zomer valt maandag een uur eerder, dat is goed genoeg). */
function weekBegin(nu){
  const d = new Date(nu + 3600000);
  const dag = (d.getUTCDay() + 6) % 7;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dag) - 3600000;
}
/* een bijnaam om te vergelijken: hoofdletters, spaties en accenten tellen niet */
function normNaam(n){ return String(n || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim(); }
/* hoeveel goede antwoorden een potje oplevert voor het klasdoel */
function goedVan(r){
  if (r.od && typeof r.od === "object"){
    let n = 0; for (const k of Object.keys(r.od)){ const w = r.od[k]; if (Array.isArray(w)) n += w[0] | 0; }
    if (n) return n;
  }
  return Math.min(r.ronde | 0, 250);
}
/* spellen zonder kamer die wel bij een klas melden */
const KLAS_SPELLEN = { race: "Vragenrace", metriek: "Het metriek stelsel", eigen: "Eigen oefening", klasquiz: "Klasquiz", dag: "Dagelijkse uitdaging", fouten: "Oefen je fouten", rekenen: "Rekenrace", balans: "De balans", werkwoorden: "Werkwoordrace", irregular: "Irregular verbs", vlaggen: "Vlaggen", landenvormen: "Landenvormen", topografie: "Topografie", lichaam: "Het lichaam", tijdvakken: "Tijdvakken sorteren", bronnenlab: "Bronnenlab", jagers: "Blijven of doorlopen", feodalisme: "Feodalisme", leenmannen: "Verdeel je rijk", stad: "Arena", handel: "De handelsroute", vergadering: "De vergadering", zinsbouw: "Zinsbouw", tekstdetective: "De tekstdetective", uitverkoop: "De uitverkoop", breukenbakker: "De breukenbakker",
  /* Deze meldden hun uitslag wel, maar stonden hier niet, dus de klas kreeg ze
     nooit te zien: de melding werd geweigerd met "onbekend spel". */
  dhte: "Het DHTE-schema", vlakken: "Vlakken herkennen", organisme: "Bouw het organisme",
  verhoudingen: "De verhoudingstabel",
  cijferen: "Cijferend vermenigvuldigen en delen",
  klok: "Klokkijken en tijdrekenen",
  schatten: "Schatten en afronden",
  grafieken: "Grafieken en formules",
  pythagoras: "De stelling van Pythagoras",
  hoeken: "Hoeken meten en berekenen",
  phrasal: "Phrasal verbs en collocations",
  translate: "Translate the sentence",
  klimaatgrafiek: "Klimaatgrafieken",
  kaartvaardigheid: "Kaartvaardigheden",
  voedselweb: "Voedselketen en voedselweb",
  huishoudboekje: "Het huishoudboekje",
  dictee: "Dictee",
  dictation: "Dictation",
  coordinaten: "Schatzoeken met coördinaten",
  kruisen: "Kruisingsschema",
  bevolkingspiramide: "Bevolkingspiramides",
  vraagenaanbod: "Vraag en aanbod",
  verkiezingen: "Verkiezingen en zetels",
  oorzaakgevolg: "Oorzaak en gevolg",
  wiebenik: "Wie ben ik?",
  reading: "Reading",
  tijdkaart: "De kaart door de tijd",
  samenvatten: "Samenvatten",
  woordenschat: "Woordenschat in context",
  signaalwoorden: "Signaalwoorden en verbanden",
  register: "Formeel of informeel",
  partijen: "Welke partij is dit?",
  democratie: "Democratie",
  /* spellen voor elk vak op de vragenbank van Torenverdediging */
  mijnwerker: "Mijnwerker", poortrace: "Poortrace", kaarttoren: "Kaarttoren",
  afwegen: "Twee kanten",
  alinea: "Bouw een alinea",
  onderzoek: "Het eerlijke experiment",
  redeneren: "Denk als een historicus",
  situaties: "English in real life",
  voordoen: "Eerst kijken, dan zelf",
  begrijpend: "Begrijpend lezen" };
/* Hoe lang de kamer wacht voor hij iemand die wegviel ook echt weghaalt. In de
   lobby kort: herladen duurt een paar tellen. In de arena langer: een
   telefoon die even geen bereik heeft, hoort er niet meteen uit te liggen. */
const LOBBY_WACHT = 8000, ARENA_WACHT = 20000;
/* Hoeveel periodes een docent mag instellen, en hoe lang een naam mag zijn. */
const PERIODES_MAX = 12, PERIODE_NAAM = 40;

/* per onderdeel [goed, gesteld]: hoogstens dertig onderdelen, korte namen, kleine getallen */
/* De foute keuzes uit een melding: per vraag het kenmerk, de tekst, het goede
   en het gekozen antwoord. Hoogstens twaalf per melding. */
function schoonFk(fk){
  if (!Array.isArray(fk)) return [];
  return fk.slice(0, 12).map(x => x && typeof x === "object" ? { h: String(x.h || "").replace(/[^a-z0-9]/g, "").slice(0, 12), vak: schoon(x.vak, 8),
    v: schoon(x.v, 200), g: schoon(x.g, 100), a: schoon(x.a, 100) } : null).filter(x => x && x.h && x.v && x.a && x.a !== x.g);
}
const FK_MAX = 80;   /* zoveel vragen houdt een klas bij; de langst niet geziene gaan eruit */
function schoonOd(od){
  if (!od || typeof od !== "object") return undefined;
  const uit = {}; let n = 0;
  for (const k of Object.keys(od)){
    if (n >= 30) break;
    const naam = schoon(k, 40), w = od[k];
    if (!naam || !Array.isArray(w)) continue;
    const goed = getal(w[0], 500), tot = getal(w[1], 500);
    if (tot <= 0 || goed > tot) continue;
    uit[naam] = [goed, tot]; n++;
  }
  return n ? uit : undefined;
}

function json(obj, status){
  return new Response(JSON.stringify(obj), { status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function schoon(tekst, max){
  return String(tekst || "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}
function getal(x, max){ const n = Number(x); return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.round(n))) : 0; }
/* Een woordenlijst van Eigen materiaal als vragen voor een race, beide kanten
   op: hetzelfde als EIGEN.vragenUitLijst in leermiddelen/eigen.js (dat is een
   script voor de browser en laadt hier niet). t zegt welke kant op. */
function lijstVragen(m){
  const p = (Array.isArray(m && m.paren) ? m.paren : []).filter(x => x && x.a && x.b).map(x => ({ a: String(x.a), b: String(x.b) })), uit = [];
  function afleiders(i, kant){
    const gezien = {}, lijst = [];
    gezien[p[i][kant].toLowerCase()] = 1;
    POORTREGELS.schud(p.map((x, k) => k)).forEach(k => {
      if (lijst.length >= 3 || k === i) return;
      const x = p[k][kant]; if (gezien[x.toLowerCase()]) return;
      gezien[x.toLowerCase()] = 1; lijst.push(x);
    });
    return lijst;
  }
  function tekst(woord, naar){ return naar ? woord + " → " + String(naar).toLowerCase() + "?" : "Wat hoort bij: " + woord + "?"; }
  p.forEach((x, i) => {
    uit.push({ v: tekst(x.a, m.kopB), o: [x.b].concat(afleiders(i, "b")), g: 0, u: x.a + " = " + x.b + ".", t: "heen", n: 1 });
    uit.push({ v: tekst(x.b, m.kopA), o: [x.a].concat(afleiders(i, "a")), g: 0, u: x.b + " = " + x.a + ".", t: "terug", n: 1 });
  });
  uit.delen = m.kopA && m.kopB ? { heen: m.kopA + " naar " + m.kopB, terug: m.kopB + " naar " + m.kopA } : {};
  return uit;
}
/* als er helemaal geen vraag te vinden is: een tafelsom */
function noodSom(r){
  const a = 2 + Math.floor(Math.random() * (4 + r * 2)), b = 2 + Math.floor(Math.random() * 8), goed = a * b;
  return { v: "Hoeveel is " + a + " × " + b + "?", o: [String(goed), String(goed + a), String(goed - b)], g: 0, u: a + " × " + b + " = " + goed + ".", t: "tafels" };
}
/* een gekozen avatar: v3k2o1m0e4, anders leeg (dan komt hij uit de bijnaam) */
function schoonAv(a){ a = String(a || "").replace(/[^a-z0-9]/g, "").slice(0, 48); return /^v\d{1,2}k\do\d{1,2}m\de\d(c\d{1,2})?(x\d{1,2})?(w\d)?(h\d{1,2})?(r\d{1,2})?(z\d{1,2})?(b\d{1,2})?(a\d{1,2})?(q\d{1,2})?(f\d)?(p\d{1,2})?$/.test(a) ? a : ""; }
function sleutelMaken(n){
  const r = crypto.getRandomValues(new Uint8Array(n || 12));
  return Array.from(r, b => b.toString(16).padStart(2, "0")).join("");
}
/* Het plaatje bij een vraag is een stukje SVG dat op ieders scherm in de
   pagina komt. Alleen eenvoudige vormen mogen erin: geen scripts, geen
   verwijzingen naar buiten, geen gebeurtenissen. */
/* Welke elementen er mogen staan: alleen tekenen, geen gedrag. Een lijst van
   wat niet mocht liet dingen door: <discard onbegin>, een gebeurtenis zonder
   spatie ervoor (<circle/onload=, r="1"onmouseover=), of een HTML-element als
   <p> of <img> dat midden in een SVG weer gewone HTML van de pagina maakt. */
const SVG_MAG = new Set(["svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "tspan", "textpath",
  "title", "desc", "defs", "lineargradient", "radialgradient", "stop", "clippath", "mask", "pattern", "marker", "symbol", "filter"]);
export function veiligSvg(s){
  if (typeof s !== "string" || s.length > 20000) return false;
  if (!/^<svg[\s>][\s\S]*<\/svg>\s*$/i.test(s.trim())) return false;
  if (/<\s*(script|foreignobject|iframe|object|embed|image|use|animate|animatemotion|animatetransform|set|link|meta|style|a)\b/i.test(s)) return false;
  if (/\son[a-z]+\s*=|javascript:|href|xlink|<!|<\?|url\(/i.test(s)) return false;
  /* elk element moet op de lijst staan (filters: alles wat met fe begint) */
  for (const m of s.matchAll(/<\s*\/?\s*([a-z][a-z0-9:._-]*)/gi)){
    const naam = m[1].toLowerCase();
    if (!SVG_MAG.has(naam) && !/^fe[a-z]+$/.test(naam)) return false;
  }
  /* een gebeurtenis, ook direct na een aanhalingsteken of een schuine streep */
  if (/(^|[^a-z0-9_-])on[a-z]+\s*=/i.test(s)) return false;
  /* en niets wat pas na het vertalen van &#...; een adres of script wordt */
  let d;
  try { d = s.replace(/&#x([0-9a-f]{1,6});?/gi, (x, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d{1,7});?/g, (x, g) => String.fromCodePoint(+g)).replace(/&(colon|lpar|rpar|tab|newline);/gi, x => ({ "&colon;": ":", "&lpar;": "(", "&rpar;": ")" })[x.toLowerCase()] || " "); }
  catch (e){ return false; }
  if (/javascript:|url\s*\(|expression\s*\(|href/i.test(d)) return false;
  return true;
}
/* Hoeveel berichten een speler per tien seconden mag sturen. Samen spelen
   in de pas komt op zo'n tweehonderd tot vierhonderd (de gastheer bevestigt
   twintig keer per seconde, plus de bewegingen van allebei); de grens ligt
   daar ruim boven. Wie er toch overheen gaat wordt genegeerd, wie er ver
   overheen gaat wordt afgesloten. De bytes per venster houden een echte
   overstroming tegen. */
const VENSTER = 10000, NEGEREN_BIJ = 1200, BYTES_PER_VENSTER = 2500000, AFSLUITEN_BIJ = 3000;
const SOCKETS_PER_SID = 6;

export class Kamer extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.stand = null;
    this.standTimer = null;
    /* de motor van een duel Zwaardvechter, zolang het potje loopt */
    this.motor = null; this.motorKlok = null; this.motorTik = 0; this.motorSids = []; this.motorLeeg = 0; this.motorSpel = ""; this.motorKeuze = {}; this.motorWacht = null;
    this.tempo = {};        /* per speler: hoeveel berichten deze seconde */
    this.ctx.blockConcurrencyWhile(async () => {
      this.stand = (await this.ctx.storage.get("stand")) || null;
    });
    /* pings van de browser beantwoordt het platform zelf, ook als de kamer slaapt */
    try { this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong")); }
    catch (e){ console.error("autoResponse", e && e.message); }
  }
  async bewaar(){ this.stand.laatst = Date.now(); await this.ctx.storage.put("stand", this.stand); }
  get strijd(){ return !!this.stand && this.stand.spel === "strijd"; }
  get rollen(){ return !!this.stand && this.stand.spel === "rollen"; }
  get race(){ return this.strijd && this.stand.game === "poortrace"; }
  get oneindig(){ return this.race && this.stand.modus === "oneindig"; }

  /* ---------- binnenkomend ---------- */
  async fetch(req){
    try {
      const url = new URL(req.url);
      if (url.pathname === "/nieuw") return await this.nieuw(await req.json());
      if (url.pathname === "/stand") return this.stand ? json(this.overzicht()) : json({ fout: "geen kamer met deze code" }, 404);
      if (url.pathname === "/meld" && req.method === "POST") return await this.meld(await req.json());
      if (url.pathname === "/melden" && req.method === "POST") return await this.melden(await req.json());
      if (url.pathname === "/quizkenmerken" && req.method === "POST") return await this.quizKenmerken(await req.json());
      if (url.pathname === "/opheffen" && req.method === "POST") return await this.opheffen(await req.json());
      if (url.pathname === "/resultaten") return await this.resultaten(url.searchParams.get("sleutel"), url.searchParams.get("eigenaar") === "1");
      if (url.pathname === "/opdracht" && req.method === "POST") return await this.opdracht(await req.json());
      if (url.pathname === "/instelling" && req.method === "POST") return await this.instelling(await req.json());
      if (url.pathname === "/periodes" && req.method === "POST") return await this.periodes(await req.json());
      if (url.pathname === "/naam" && req.method === "POST") return await this.klasNaam(await req.json());
      if (url.pathname === "/echt" && req.method === "POST") return await this.echteNamen(await req.json());
      if (url.pathname === "/hoi" && req.method === "POST") return await this.hoi(await req.json());
      if (url.pathname === "/leerlingweg" && req.method === "POST") return await this.leerlingWeg(await req.json());
      if (url.pathname === "/besproken" && req.method === "POST") return await this.besproken(await req.json());
      if (url.pathname === "/mijn") return this.mijn(url.searchParams.get("sid"));
      if (req.headers.get("Upgrade") === "websocket") return this.verbind(url);
      return json({ fout: "onbekend" }, 404);
    } catch (e){
      console.error("kamer", e && e.stack || e);
      /* de melding blijft algemeen: wat er precies misging staat in het logboek,
         niet in het antwoord aan de buitenwereld */
      return json({ fout: "de kamer gaf een fout" }, 500);
    }
  }

  async nieuw(opzet){
    /* een code die nog in gebruik is geven we niet nog een keer uit */
    if (this.stand && (this.stand.spel === "klas" ? Date.now() - this.stand.laatst < KLAS_SLAAPT : (this.stand.fase !== "einde" && Date.now() - this.stand.laatst < OPRUIMEN_NA))) return json({ fout: "bezet" }, 409);
    const basis = {
      code: String(opzet.code || "").toUpperCase(), sleutel: sleutelMaken(),
      vak: schoon(opzet.vak, 20), niveau: schoon(opzet.niveau, 20), deel: schoon(opzet.deel, 300).replace(/[^a-z0-9 ,-]/gi, ""),
      fase: "lobby", spelers: {}, gemaakt: Date.now(), laatst: Date.now(), alarm: null
    };
    if (opzet.spel === "klas"){
      /* een klascode: geen spel, maar een bak waarin leerlingen hun uitslagen melden en die de docent leest */
      this.stand = Object.assign(basis, { spel: "klas", naam: schoon(opzet.naam, 40) || "Klas", resultaten: [],
        /* een klas van de eigenaar van de site: index.js zet deze vlag, nooit de browser */
        vanEigenaar: !!opzet.vanEigenaar });
    } else if (opzet.spel === "rollen"){
      const game = String(opzet.game || "");
      if (!SPELLEN_ROLLEN[game]) return json({ fout: "onbekend spel" }, 400);
      this.stand = Object.assign(basis, { spel: "rollen", game, gestart: 0, bord: null, n: 0 });
    } else if (opzet.spel === "strijd"){
      const game = String(opzet.game || "");
      if (!SPELLEN_STRIJD[game]) return json({ fout: "onbekend spel" }, 400);
      /* een duel: twee spelers, geen docent, begint vanzelf als de tweede er is */
      this.stand = Object.assign(basis, { spel: "strijd", game, gestart: 0, duel: !!opzet.duel });
      /* Poortrace kan ook Oneindig: tot ieders tank leeg is */
      if (game === "poortrace" && opzet.modus === "oneindig") this.stand.modus = "oneindig";
    } else {
      const vragen = Array.isArray(opzet.vragen) ? opzet.vragen.slice(0, MAX_VRAGEN).map(q => q && typeof q === "object" ? ({
        v: schoon(q.v, 300),
        o: (Array.isArray(q.o) ? q.o : []).slice(0, 4).map(x => schoon(x, 120)),
        g: Number(q.g) || 0,
        u: schoon(q.u, 600),
        t: schoon(q.t, 60),
        vlag: /^[a-z-]{2,8}$/.test(q.vlag || "") ? q.vlag : undefined,
        svg: veiligSvg(q.svg) ? q.svg : undefined
      }) : null).filter(q => q && q.v && q.o.length >= 2 && q.g >= 0 && q.g < q.o.length) : [];
      if (!vragen.length) return json({ fout: "geen vragen" }, 400);
      this.stand = Object.assign(basis, { spel: "quiz", onderdeel: schoon(opzet.onderdeel, 80), vragen,
        tijd: Math.max(5, Math.min(90, Number(opzet.tijd) || 20)), i: -1, vraagStart: 0 });
    }
    /* wat er nog aan oude sockets hangt, mag weg; en wat een vorige race in het geheugen had ook */
    this.ctx.getWebSockets().forEach(ws => { try { ws.close(1000, "nieuwe kamer"); } catch (e){} });
    this.raceBankP = null; this.racePot = {}; this.raceNaFinish = {};
    clearTimeout(this.raceTankKlok); this.raceTankKlok = null;
    Object.keys(this.raceWacht || {}).forEach(k => clearTimeout(this.raceWacht[k])); this.raceWacht = {};
    await this.zetAlarm({ wat: "opruimen" }, this.stand.spel === "klas" ? KLAS_SLAAPT : OPRUIMEN_NA);
    await this.bewaar();
    return json({ code: this.stand.code, sleutel: this.stand.sleutel, n: this.stand.vragen ? this.stand.vragen.length : 0 });
  }

  verbind(url){
    if (!this.stand) return json({ fout: "geen kamer met deze code" }, 404);
    /* het adres van de site, om de vragen van een race te halen */
    if (/^https?:$/.test(url.protocol)) this.origin = url.origin;
    if (this.stand.spel === "klas") return json({ fout: "een klascode is geen spelkamer" }, 400);
    const rol = url.searchParams.get("rol") === "host" ? "host" : "speler";
    let sid = schoon(url.searchParams.get("sid"), 40);
    let naam = nette(url.searchParams.get("naam"), "Leerling");   /* door het naamfilter */
    const av = schoonAv(url.searchParams.get("av"));
    if (rol === "host"){
      if (url.searchParams.get("sleutel") !== this.stand.sleutel) return json({ fout: "dit is niet jouw kamer" }, 403);
      sid = "host";
    } else {
      if (!/^[A-Za-z0-9_-]{8,40}$/.test(sid)) return json({ fout: "geen geldig kenmerk" }, 400);
      if (this.stand.fase === "einde") return json({ fout: "dit potje is al afgelopen" }, 410);
      const vol = this.stand.duel ? this.samenMax() : MAX_SPELERS;
      if (!this.stand.spelers[sid] && Object.keys(this.stand.spelers).length >= vol) return json({ fout: this.stand.duel ? (vol === 2 ? "dit duel heeft al twee spelers" : "deze kamer zit vol: " + (vol === 4 ? "vier" : vol) + " spelers") : "de kamer zit vol" }, 409);
      /* wie te laat is voor een potje samen, kan er niet meer in */
      if (this.stand.duel && !this.stand.spelers[sid] && this.stand.fase !== "lobby" && this.stand.fase !== "aftellen") return json({ fout: "dit potje is al begonnen" }, 410);
    }
    /* Hoogstens een paar verbindingen per kenmerk: een tweede tabblad of een
       herverbinding terwijl de oude nog openstaat is gewoon, honderd keer
       hetzelfde kenmerk niet (elke verbinding krijgt alles wat de kamer zendt).
       De oudste gaan dicht. */
    const al = this.ctx.getWebSockets(sid);
    if (al.length >= SOCKETS_PER_SID) al.slice(0, al.length - SOCKETS_PER_SID + 1).forEach(w => { try { w.close(1000, "nieuwe verbinding"); } catch (e){} });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server, [rol, sid]);
    server.serializeAttachment({ rol, sid });
    if (rol === "speler"){
      const bestaand = this.stand.spelers[sid];
      /* Wie terugkomt houdt zijn plek, zijn nummer en zijn punten; alleen wie
         nieuw is krijgt een nieuwe. Let op: tussen deze if en zijn else mag
         niets anders staan, anders hangt de else aan de verkeerde if en is
         iedereen die opnieuw verbindt weer nieuw. */
      if (bestaand){ bestaand.naam = naam; bestaand.av = av; delete bestaand.weg; }
      else this.stand.spelers[sid] = this.strijd
        ? { naam, av, pid: sleutelMaken(4), ronde: 0, gehaald: 0, leven: 0, punten: 0, af: false, aanvallen: 0, sinds: Date.now() }
        : this.rollen ? { naam, av, pid: sleutelMaken(4), kaart: null, sinds: Date.now() }
        : { naam, av, pid: sleutelMaken(4), score: 0, antw: {}, sinds: Date.now() };
      /* terug binnen de wachttijd: dan hoeft hij niet meer weg */
      if (this.wegKlok && this.wegKlok[sid]){ clearTimeout(this.wegKlok[sid]); delete this.wegKlok[sid]; }
      /* wie pas instapt als de race al loopt, krijgt zijn eigen startschot */
      if (!bestaand && this.race && this.stand.fase === "bezig") this.stand.spelers[sid].raceStart = Date.now();
      /* terug in een arena die al loopt: zijn held staat de volgende ronde weer op */
      if (bestaand && this.motor && this.motorSpel === "zwaard" && this.motor.terug){
        const mi = this.motorSids.indexOf(sid);
        if (mi >= 0) this.motor.terug(mi);
      }
      /* Naar buiten toe heet een speler bij zijn korte, openbare nummer (pid);
         het kenmerk waarmee hij verbindt (sid) blijft geheim, anders kon een
         ander zich voor hem uitgeven. */
      if (!this.stand.spelers[sid].pid) this.stand.spelers[sid].pid = sleutelMaken(4);
      /* in een duel is de eerste speler de gastheer: die rekent de gedeelde arena uit */
      if (this.strijd && this.stand.duel && !this.stand.gastheer) this.stand.gastheer = sid;
      this.ctx.waitUntil(this.bewaar());
    }
    this.stuur(server, Object.assign({ t: "welkom", rol, naam, jij: rol === "speler" ? this.pid(sid) : null }, this.overzicht()));
    if (this.rollen){
      /* een telefoon die (terug)komt krijgt zijn kaart en het bord van dit moment */
      if (rol === "speler"){
        const sp = this.stand.spelers[sid];
        if (this.stand.bord) this.stuur(server, { t: "bord", d: this.stand.bord });
        if (sp && sp.kaart) this.stuur(server, { t: "kaart", d: sp.kaart });
        if (this.stand.fase === "einde") this.stuur(server, { t: "einde" });
      }
      this.zegSpelers();
      return new Response(null, { status: 101, webSocket: client });
    }
    if (this.strijd){
      if (this.stand.fase === "bezig" && rol === "speler"){
        /* de motor is weg (opnieuw uitgerold, of even niemand aan de lijn): opnieuw opbouwen waar ze waren */
        const hersteld = this.stand.duel && !this.motor ? this.motorHerstel() : false;
        this.stuur(server, Object.assign(this.startBericht(sid), hersteld ? { herstel: true } : {}));
        if (this.motor) this.stuur(server, { t: "net", d: this.motor.pakket() });
        /* in een race: waar hij is, het oordeel over zijn laatste poort en de vraag van zijn volgende */
        if (this.race) this.ctx.waitUntil(this.raceHerstel(sid));
      }
      if (this.stand.fase === "einde") this.stuur(server, this.strijdEinde(rol === "speler" ? sid : null));
      else this.stuur(server, this.standBericht(rol === "speler" ? sid : null));
      /* een duel telt af zodra de tweede speler binnen is; samen met meer pas als de kamer vol is, of als de maker start */
      if (this.stand.duel && this.stand.fase === "lobby" && Object.keys(this.stand.spelers).length >= this.samenMax() && this.lobbyKlaar()){
        this.ctx.waitUntil(this.duelAftellen());
      }
      this.zegSpelers();
      if (rol === "speler") this.planStand();
    } else {
      if (rol === "speler") this.stuur(server, { t: "jouw", jouw: this.jouw(sid) });
      /* midden in een vraag binnenkomen: die vraag meteen meesturen */
      if (this.stand.fase === "vraag") this.stuur(server, this.vraagBericht());
      if (this.stand.fase === "uitslag" && rol === "host") this.stuur(server, this.uitslagVoorHost());
      if (this.stand.fase === "uitslag" && rol === "speler") this.stuur(server, this.uitslagVoorSpeler(sid));
      if (this.stand.fase === "einde") this.stuur(server, this.eindeBericht(rol === "speler" ? sid : null));
    }
    this.zegSpelers();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, tekst){
    if (!this.stand) return;
    if (typeof tekst !== "string" || tekst.length > 70000) return;
    const wie = ws.deserializeAttachment() || {};
    if (!this.opTempo(ws, wie, tekst.length)) return;
    let m; try { m = JSON.parse(tekst); } catch (e){ return; }
    if (!m || typeof m !== "object") return;
    const wegSid = wie.rol === "host" && m.t === "weg" ? this.sidVanPid(m.sid) : null;
    if (wegSid){
      delete this.stand.spelers[wegSid];
      /* eerst zeggen wat er gebeurt, dan pas ophangen: aan een gesloten
         verbinding alleen zag de pagina niet dat hij eruit was */
      this.ctx.getWebSockets(wegSid).forEach(s => { this.stuur(s, { t: "eruit" }); try { s.close(1000, "verwijderd door de docent"); } catch (e){} });
      await this.bewaar(); this.zegSpelers();
      if (this.strijd) this.planStand();
      return;
    }
    if (wie.rol === "speler" && m.t === "vertrek") return this.vertrek(wie.sid);
    /* Nog een ronde met dezelfde klas: het bord opende een nieuwe kamer en
       stuurt de code hierheen, en de telefoons gaan er vanzelf naartoe, met
       dezelfde bijnaam en hetzelfde gezichtje. Alleen het bord kan dat: de
       rol host krijgt alleen wie met de sleutel verbond. Een oudere telefoon
       kent het bericht niet en laat gewoon zijn eindscherm staan. */
    if (m.t === "verhuis"){
      if (wie.rol !== "host") return;
      const naar = String(m.code || "").toUpperCase();
      if (!/^[A-Z]{4}$/.test(naar) || naar === this.stand.code) return;
      this.stand.verhuis = naar;
      await this.bewaar();
      const s = JSON.stringify({ t: "verhuis", code: naar });
      this.ctx.getWebSockets("speler").forEach(w => { try { w.send(s); } catch (e){} });
      return;
    }
    /* Het podium op het bord staat: de winnaar is in beeld, of de docent
       drukte op Sla over. Dan mogen de telefoons hun eigen plek laten zien;
       zonder dit bericht wachten ze de hele onthulling af. */
    if (m.t === "podium"){
      if (wie.rol !== "host") return;
      const s = JSON.stringify({ t: "podium" });
      this.ctx.getWebSockets("speler").forEach(w => { try { w.send(s); } catch (e){} });
      return;
    }
    if (this.strijd) return this.strijdBericht(ws, wie, m);
    if (this.rollen) return this.rollenBericht(ws, wie, m);
    if (wie.rol === "host"){
      if (m.t === "start" && this.stand.fase === "lobby") return this.volgende();
      if (m.t === "volgende" && this.stand.fase === "uitslag") return this.volgende();
      if (m.t === "sluit" && this.stand.fase === "vraag") return this.sluitVraag();
      if (m.t === "stop" && this.stand.fase !== "einde") return this.einde();
      return;
    }
    if (m.t === "antwoord" && this.stand.fase === "vraag"){
      const sp = this.stand.spelers[wie.sid];
      const i = this.stand.i, q = this.stand.vragen[i];
      if (!sp || m.i !== i || sp.antw[i]) return;
      const k = Number(m.k);
      if (!(k >= 0 && k < q.o.length)) return;
      sp.antw[i] = { k, ms: Math.max(0, Date.now() - this.stand.vraagStart) };
      await this.bewaar();
      this.stuur(ws, { t: "ok", i });
      const geteld = this.geteld();
      this.naarHost({ t: "geteld", i, n: geteld.n, van: geteld.van });
      /* iedereen die er is heeft geantwoord: niet wachten op de klok */
      if (geteld.n >= geteld.van && geteld.van > 0) return this.sluitVraag();
    }
  }
  async webSocketClose(ws, code){
    /* het sluiten beantwoorden, anders blijft de socket van de browser op CLOSING hangen en wacht wakker.js lang op een nieuwe verbinding */
    try { ws.close(code === 1005 || code === 1006 || !code ? 1000 : code, "dicht"); } catch (e){}
    this.zegSpelers(); if (this.strijd) this.planStand();
    const wie = ws.deserializeAttachment() || {};
    if (wie.rol === "speler" && wie.sid) this.planVertrek(wie.sid);
  }
  /* Een verbinding viel weg. Komt hij niet op tijd terug, dan halen we hem
     weg: uit de lobby helemaal, uit een lopende arena als speler die weg is.
     Een klasstrijd of quiz die al loopt laten we staan: daar hoort zijn
     uitslag bij de klas. */
  planVertrek(sid){
    const st = this.stand;
    if (!st || st.spel === "klas" || !st.spelers[sid]) return;
    const inLobby = st.fase === "lobby" || st.fase === "aftellen";
    const inArena = this.strijd && st.fase === "bezig" && this.motor && this.motorSpel === "zwaard" && this.motorSids.indexOf(sid) >= 0;
    /* in een race: wie onderweg wegvalt en niet terugkomt, houdt de finish niet op */
    const inRace = this.race && st.fase === "bezig" && !st.spelers[sid].af;
    if (!inLobby && !inArena && !inRace) return;
    this.wegKlok = this.wegKlok || {};
    clearTimeout(this.wegKlok[sid]);
    this.wegKlok[sid] = setTimeout(() => {
      delete this.wegKlok[sid];
      if (this.aanwezig(sid)) return;
      this.vertrek(sid).catch(e => console.error("vertrek", e && e.stack || e));
    }, inLobby ? LOBBY_WACHT : ARENA_WACHT);
  }
  /* Weggaan. In de lobby ben je dan echt weg en komt je plek vrij; ging je
     weg terwijl je de kamer had gemaakt, dan neemt de volgende het over. Zat
     je al in een arena, dan telt je held niet meer mee en verdwijnt je naam,
     maar kun je met dezelfde code terug. */
  async vertrek(sid){
    const st = this.stand;
    if (!st || !st.spelers[sid] || st.fase === "einde") return;
    if (st.fase === "lobby" || st.fase === "aftellen"){
      delete st.spelers[sid];
      if (this.strijd && st.duel){
        const rest = Object.keys(st.spelers);
        if (st.gastheer === sid) st.gastheer = rest[0] || null;
        /* niemand meer over: de kamer is klaar */
        if (!rest.length){ await this.strijdKlaar(); return; }
        /* aan het aftellen en nu te weinig, of niet meer allemaal klaar: terug naar de lobby.
           Het alarm kijkt of er nog afgeteld wordt, dus dat doet dan niets. */
        if (st.fase === "aftellen" && (rest.length < 2 || !this.lobbyKlaar())) st.fase = "lobby";
        await this.bewaar();
        this.iedereen({ t: "lobby", fase: st.fase, gastheer: st.gastheer ? this.pid(st.gastheer) : null,
          spelers: this.strijdLijst().map(r => ({ sid: r.sid, naam: r.naam, av: r.av, stijl: r.stijl, klaar: r.klaar, aan: r.aan })) });
        this.planStand();
      } else await this.bewaar();
      this.zegSpelers();
      return;
    }
    const sp = st.spelers[sid];
    if (this.strijd && this.motor && this.motorSpel === "zwaard" && this.motor.vertrek){
      const mi = this.motorSids.indexOf(sid);
      if (mi >= 0){ this.motor.vertrek(mi); this.motorZend(); }
    }
    sp.weg = true;
    await this.bewaar();
    this.zegSpelers();
    if (this.strijd) this.planStand();
    if (this.race) await this.raceKlaar(false);
  }


  /* ======================================================================
     De rollenkamer: het bord stuurt kaarten (naar een speler of naar
     iedereen), de telefoons sturen acties terug. De kamer bewaart alleen de
     laatste kaart per speler en het laatste bord, zodat een telefoon die de
     verbinding kwijtraakt verder kan waar hij was.
     ====================================================================== */
  async rollenBericht(ws, wie, m){
    const st = this.stand;
    if (wie.rol === "host"){
      if (m.t === "start" && st.fase === "lobby"){
        st.fase = "bezig"; st.gestart = Date.now();
        await this.zetAlarm({ wat: "opruimen" }, OPRUIMEN_NA);
        await this.bewaar();
        this.iedereen({ t: "start" });
        return;
      }
      if (m.t === "stop" && st.fase !== "einde"){
        st.fase = "einde";
        await this.zetAlarm({ wat: "opruimen" }, NA_EINDE);
        await this.bewaar();
        this.iedereen({ t: "einde" });
        return;
      }
      if (m.t === "naar" || m.t === "kaarten"){
        const lijst = m.t === "naar" ? [{ pid: m.pid, d: m.d }] : (Array.isArray(m.lijst) ? m.lijst.slice(0, 200) : []);
        for (const k of lijst){
          const sid = this.sidVanPid(k.pid), sp = sid && st.spelers[sid];
          if (!sp || k.d === undefined) continue;
          const s = JSON.stringify({ t: "kaart", d: k.d });
          if (s.length > KAART_MAX) continue;
          sp.kaart = k.d;
          this.ctx.getWebSockets(sid).forEach(w => { try { w.send(s); } catch (e){} });
        }
        await this.bewaar();
        return;
      }
      /* vlug: van het bord naar alle spelers zonder te bewaren, voor de streken van een tekening */
      if (m.t === "vlug"){
        if (m.d === undefined) return;
        const s = JSON.stringify({ t: "vlug", d: m.d });
        if (s.length > ACTIE_MAX * 2) return;
        this.ctx.getWebSockets("speler").forEach(w => { try { w.send(s); } catch (e){} });
        return;
      }
      if (m.t === "alle"){
        if (m.d === undefined) return;
        const s = JSON.stringify({ t: "bord", d: m.d });
        if (s.length > BORD_MAX) return;
        st.bord = m.d;
        await this.bewaar();
        this.ctx.getWebSockets("speler").forEach(w => { try { w.send(s); } catch (e){} });
        return;
      }
      return;
    }
    const sp = st.spelers[wie.sid];
    if (!sp || st.fase === "einde") return;
    if (m.t === "actie"){
      if (m.d === undefined) return;
      const s = JSON.stringify({ t: "actie", van: sp.pid, naam: sp.naam, d: m.d });
      if (s.length > ACTIE_MAX) return;
      this.ctx.getWebSockets("host").forEach(w => { try { w.send(s); } catch (e){} });
    }
  }
  opTempo(ws, wie, lengte){
    const nu = Date.now(), k = wie.sid || "?";
    let tp = this.tempo[k];
    if (!tp || nu - tp.sinds > VENSTER) tp = this.tempo[k] = { sinds: nu, tel: 0, bytes: 0 };
    tp.tel++; tp.bytes += lengte;
    if (tp.tel > AFSLUITEN_BIJ){ try { ws.close(1008, "te veel berichten"); } catch (e){} return false; }
    return tp.tel <= NEGEREN_BIJ && tp.bytes <= BYTES_PER_VENSTER;
  }
  pid(sid){ const sp = this.stand && this.stand.spelers[sid]; return sp ? sp.pid : null; }
  sidVanPid(pid){
    if (typeof pid !== "string" || !this.stand) return null;
    return Object.keys(this.stand.spelers).filter(s => this.stand.spelers[s].pid === pid)[0] || null;
  }
  async webSocketError(ws){ this.zegSpelers(); }

  /* ---------- de klok ---------- */
  async zetAlarm(wat, over){
    this.stand.alarm = wat;
    await this.ctx.storage.setAlarm(Date.now() + over);
  }
  async alarm(){
    if (!this.stand) return;
    const a = this.stand.alarm || {};
    if (a.wat === "sluit" && !this.strijd && this.stand.fase === "vraag" && a.i === this.stand.i) return this.sluitVraag();
    if (a.wat === "duelstart" && this.strijd && this.stand.fase === "aftellen") return this.strijdStart();
    if (a.wat === "raceslot" && this.race && this.stand.fase === "bezig") return this.strijdKlaar();
    if (a.wat === "opruimen"){
      this.motorStop();
      this.ctx.getWebSockets().forEach(ws => { try { ws.close(1000, "de kamer is gesloten"); } catch (e){} });
      this.stand = null;
      await this.ctx.storage.deleteAll();
    }
  }

  /* ======================================================================
     De Klasstrijd
     ====================================================================== */
  /* hoeveel er in een potje samen passen: Zwaardvechter vier, een race acht, Torenverdediging twee */
  samenMax(){ return this.stand && this.stand.duel && this.stand.game === "zwaard" ? SAMEN_MAX : this.stand && this.stand.duel && this.stand.game === "poortrace" ? RACE_MAX : 2; }
  /* Zwaardvechter samen begint pas als iedereen in de lobby klaar is; andere spellen hebben geen lobbykeuze */
  lobbyKlaar(){
    const st = this.stand; if (!st || st.game !== "zwaard") return true;
    const sids = Object.keys(st.spelers);
    return sids.length >= 2 && sids.every(sid => !!st.spelers[sid].klaar);
  }
  /* het startsein, met voor Zwaardvechter samen wie welke speler is (de volgorde van de motor) */
  startBericht(sid){
    const b = { t: "start" };
    if (this.motorSids && this.motorSpel === "zwaard"){
      b.mij = this.motorSids.indexOf(sid);
      b.spelers = this.motorSids.map(s => { const sp = this.stand.spelers[s] || {}; return { sid: sp.pid, naam: sp.naam, av: sp.av || "" }; });
    }
    return b;
  }
  async strijdStart(){
    const st = this.stand;
    st.fase = "bezig"; st.gestart = Date.now();
    await this.zetAlarm({ wat: "opruimen" }, OPRUIMEN_NA);
    await this.bewaar();
    if (st.duel && st.game === "zwaard") this.motorStart();
    if (this.motorSids && this.motorSpel === "zwaard"){
      this.ctx.getWebSockets("speler").forEach(ws => { const wie = ws.deserializeAttachment() || {}; this.stuur(ws, this.startBericht(wie.sid)); });
      this.naarHost({ t: "start" });
    } else this.iedereen({ t: "start" });
    /* een race: iedereen krijgt de vraag van zijn eerste poort */
    if (this.race) Object.keys(st.spelers).forEach(sid => this.ctx.waitUntil(this.raceHerstel(sid)));
    this.planStand();
    if (st.duel && st.game === "toren"){
      /* het bord komt zodra de keuze van allebei binnen is, en anders na een korte wachttijd */
      if (!this.torenStart()) this.motorWacht = setTimeout(() => { this.motorWacht = null; this.torenStart(true); }, TOREN_WACHT_KEUZE);
    }
  }
  /* De motor opnieuw opbouwen bij de ronde die de spelers het laatst meldden.
     Zwaardvechter: de spelers sturen daarna hun uitrusting, leven en munten
     terug (k:"herstel", een korte tijd toegestaan). Torenverdediging: een
     nieuw bord bij die ronde, met wat extra munten voor wat er stond. */
  motorHerstel(){
    const st = this.stand;
    if (!st || !st.duel || this.motor || st.fase !== "bezig") return false;
    const ronde = Math.max(1, ...Object.keys(st.spelers).map(s => st.spelers[s].ronde | 0));
    if (st.game === "zwaard"){
      this.motorStart();
      const W = this.motor; if (!W) return false;
      if (W.vertrek) this.motorSids.forEach((s, i) => { if (st.spelers[s] && st.spelers[s].weg) W.vertrek(i); });
      /* Zaten de spelers tussen de rondes (vragen, winkel)? Dan daar verder, niet met een nieuwe ronde: anders slaan ze de vragen over. */
      const tussen = Object.keys(st.spelers).some(s => st.spelers[s].fase === "tussen" && (st.spelers[s].ronde | 0) >= ronde);
      if (tussen){ W.ronde = ronde; W.fase = "vragen"; W.spelers.forEach(P => { P.klaar = false; }); }
      else if (ronde > 1){ W.ronde = ronde - 1; W.volgendeRonde(); }
      this.motorHersteld = Date.now();
      console.log("kamer " + st.code + ": motor Zwaardvechter hersteld bij ronde " + ronde);
      return true;
    }
    if (st.game === "toren"){
      this.motorRonde = ronde;
      if (!this.torenStart()) this.motorWacht = setTimeout(() => { this.motorWacht = null; this.torenStart(true); }, TOREN_WACHT_KEUZE);
      console.log("kamer " + st.code + ": bord Torenverdediging hersteld bij ronde " + ronde);
      return true;
    }
    return false;
  }
  /* ---------- de motor van Torenverdediging in de kamer ----------
     De gastheer bepaalt de omgeving en het niveau, het menu is van allebei
     (eerst de torens van de gastheer, dan die van zijn maat), en wat een van
     beiden vrij heeft is op dit bord vrij. */
  torenStart(nu){
    if (this.motor || !this.stand || this.stand.fase !== "bezig") return true;
    const st = this.stand, sids = Object.keys(st.spelers);
    const eerst = st.gastheer && st.spelers[st.gastheer] ? st.gastheer : sids[0];
    const lijst = [eerst].concat(sids.filter(x => x !== eerst)).slice(0, 2);
    if (lijst.length < 2) return false;
    const bewaard = st.keuze || {};
    const a = this.motorKeuze[lijst[0]] || bewaard[lijst[0]], b = this.motorKeuze[lijst[1]] || bewaard[lijst[1]];
    if (!a || (!b && !nu)) return false;
    const menu = [];
    (Array.isArray(a.gz) ? a.gz : []).concat(Array.isArray(b && b.gz) ? b.gz : []).forEach(id => {
      if (typeof id === "string" && TORENMOTOR.SOORTEN[id] && menu.indexOf(id) < 0 && menu.length < TORENMOTOR.SAMENKEUZE) menu.push(id);
    });
    const vrij = {};
    ["tonkla", "aap", "eiland", "archipel", "vulkaan"].forEach(k => { vrij[k] = !!((a.vb && a.vb[k]) || (b && b.vb && b.vb[k])); });
    const W = TORENMOTOR.maak({ thema: typeof a.th === "string" ? a.th : "plein", torens: menu, vrij, rang: RANGEN[st.niveau] || Number(a.rang) || 2 });
    if (this.motorRonde > 1 && W.bank){ W.bank.ronde = this.motorRonde - 1; W.bank.munten += 25 * (this.motorRonde - 1); }
    this.motorRonde = 0;
    this.motor = W; this.motorSpel = "toren"; this.motorSids = lijst; this.motorTik = 0; this.motorLeeg = 0;
    this.motorZend();
    /* zoveel tikken als er echte tijd verstreken is, en nooit meer dan drie in een keer */
    let laatst = Date.now(), rest = 0;
    this.motorKlok = setInterval(() => {
      try {
        if (!this.motor || !this.stand || this.stand.fase !== "bezig"){ this.motorStop(); return; }
        const nu = Date.now(); rest = Math.min(rest + (nu - laatst), 3 * TORENSTAP); laatst = nu;
        let gedaan = 0;
        while (rest >= TORENSTAP && gedaan < 3 && this.motor){
          rest -= TORENSTAP; gedaan++;
          W.stap();
          this.motorTik++;
          if (W.fase === "einde"){ this.motorZend(); this.motorStop(); return; }
          if (this.motorTik % TOREN_STAND_OM === 0) this.motorZend();
          if (this.motorTik % 16 === 0){
            if (this.ctx.getWebSockets("speler").length === 0){ this.motorLeeg += 1000; if (this.motorLeeg >= MOTOR_ZONDER_SPELERS) this.motorStop(); }
            else this.motorLeeg = 0;
          }
        }
      } catch (e){ console.error("torenmotor", e && e.stack || e); this.motorStop(); }
    }, TORENSTAP / 2);
    return true;
  }
  /* ---------- de motor van Zwaardvechter in de kamer ----------
     De gastheer van het duel is speler 0, de ander speler 1: dezelfde
     volgorde als in de browsers. De kamer tikt zestig keer per seconde en
     stuurt de stand om de drie tikken; buiten de ronde (vragen, winkel) om
     de twaalf, want dan beweegt er niets. Zonder spelers stopt hij na een
     minuut, en bij het einde van het potje meteen. */
  motorStart(){
    if (this.motor || !this.stand) return;
    const st = this.stand, sids = Object.keys(st.spelers);
    const eerst = st.gastheer && st.spelers[st.gastheer] ? st.gastheer : sids[0];
    this.motorSids = [eerst].concat(sids.filter(x => x !== eerst)).slice(0, SAMEN_MAX);
    if (this.motorSids.length < 2) return;
    const W = ZWAARDMOTOR.maak({ spelers: this.motorSids.map(sid => ({ naam: st.spelers[sid].naam })) });
    this.motorSids.forEach((sid, i) => { const s2 = st.spelers[sid]; if (s2 && s2.stijl) W.zetStats(i, { stijl: s2.stijl }); });
    this.motor = W; this.motorSpel = "zwaard"; this.motorTik = 0; this.motorLeeg = 0;
    W.volgendeRonde();
    this.motorZend();
    /* zoveel stappen als er echte tijd verstreken is, en nooit meer dan vier in een keer */
    const STAPMS = 1000 * MOTORSTAP;
    let laatst = Date.now(), rest = 0;
    this.motorKlok = setInterval(() => {
      try {
        if (!this.motor || !this.stand || this.stand.fase !== "bezig"){ this.motorStop(); return; }
        const nu = Date.now(); rest = Math.min(rest + (nu - laatst), 4 * STAPMS); laatst = nu;
        let gedaan = 0;
        while (rest >= STAPMS && gedaan < 4 && this.motor){
          rest -= STAPMS; gedaan++;
          W.stap(MOTORSTAP);
          this.motorTik++;
          if (W.fase === "einde"){ this.motorZend(); this.motorStop(); return; }
          if (this.motorTik % (W.fase === "ronde" ? MOTOR_STAND_OM : MOTOR_STIL_OM) === 0) this.motorZend();
          /* niemand meer aan de lijn: even wachten, dan ophouden */
          if (this.motorTik % 60 === 0){
            if (this.ctx.getWebSockets("speler").length === 0){ this.motorLeeg += 1000; if (this.motorLeeg >= MOTOR_ZONDER_SPELERS) this.motorStop(); }
            else this.motorLeeg = 0;
          }
        }
      } catch (e){ console.error("motor", e && e.stack || e); this.motorStop(); }
    }, STAPMS / 2);
  }
  motorZend(){
    if (!this.motor) return;
    const s = JSON.stringify({ t: "net", d: this.motor.pakket() });
    this.ctx.getWebSockets("speler").forEach(ws => { try { ws.send(s); } catch (e){} });
  }
  motorStop(){
    if (this.motorKlok){ clearInterval(this.motorKlok); this.motorKlok = null; }
    if (this.motorWacht){ clearTimeout(this.motorWacht); this.motorWacht = null; }
    this.motor = null; this.motorSpel = "";
  }
  /* wat een speler de motor stuurt: toetsen, uitrusting, klaar, pauze */
  motorBericht(wie, d){
    const W = this.motor, i = this.motorSids.indexOf(wie.sid);
    if (!W || i < 0 || !d) return;
    if (this.motorSpel === "toren"){
      /* alles wat een speler op het bord doet; de kamer past dezelfde regels toe als het bord zelf */
      if (["bouw", "sterker", "weg", "zet", "kracht", "wegding", "dingweg", "slot", "ronde", "munt", "vrij", "pz", "snel"].indexOf(d.k) < 0) return;
      /* Munten komen van een goed antwoord, en een vraag beantwoorden kost
         tijd. Zonder rem paste er zestigduizend munten per seconde in de
         gedeelde kas. Hoogstens een melding per anderhalve seconde en
         vierduizend munten per minuut is ruim boven wat vragen opleveren. */
      if (d.k === "munt"){
        const nu = Date.now();
        this.muntKlok = this.muntKlok || {}; this.muntTeller = this.muntTeller || {};
        const vorig = this.muntKlok[wie.sid] || 0;
        if (nu - vorig < 1500) return;
        const bak = this.muntTeller[wie.sid] || { t: nu, n: 0 };
        if (nu - bak.t > 60000){ bak.t = nu; bak.n = 0; }
        const w = Math.max(0, Math.min(500, d.w | 0));
        if (bak.n + w > 4000) return;
        bak.n += w; this.muntTeller[wie.sid] = bak; this.muntKlok[wie.sid] = nu;
      }
      /* de pauzeknop is van iedereen, dus hij mag niet als knipperlicht dienen */
      if (d.k === "pz"){
        const nu2 = Date.now();
        this.pauzeKlok = this.pauzeKlok || {};
        if (nu2 - (this.pauzeKlok[wie.sid] || 0) < 1500) return;
        this.pauzeKlok[wie.sid] = nu2;
      }
      W.voerUit(d);
      if (d.k === "pz" || d.k === "snel" || d.k === "bouw" || d.k === "zet") this.motorZend();
      return;
    }
    if (d.k === "in"){
      W.zetInvoer(i, d.dx, d.dy, Math.max(0, d.nr | 0), !!d.blok);
      if (d.dash) W.wilSpringen(i, d.sx, d.sy);
      /* wapen is het aantal keer wisselen sinds het vorige bericht (een oudere pagina stuurt 1) */
      if (d.wapen) W.wilWapen(i, Math.min(4, d.wapen | 0));
    } else if (d.k === "stats"){ W.zetStats(i, d.s, d.hp); }
    else if (d.k === "crit"){ W.crit(i); }
    else if (d.k === "klaar"){ W.zetStats(i, d.s, d.hp); if (W.klaar(i)) this.motorZend(); else this.motorZend(); }
    else if (d.k === "pauze"){ W.pauze = !!d.aan; this.motorZend(); }
    else if (d.k === "herstel" && this.motorHersteld && Date.now() - this.motorHersteld < 30000){
      W.zetStats(i, d.s, d.hp);
      if (typeof d.munten === "number" && isFinite(d.munten)) W.spelers[i].munten = Math.max(0, Math.min(9999, Math.round(d.munten)));
      this.motorZend();
    }
  }
  async duelAftellen(){
    this.stand.fase = "aftellen";
    await this.zetAlarm({ wat: "duelstart" }, AFTELLEN);
    await this.bewaar();
    this.iedereen({ t: "aftellen", s: Math.round(AFTELLEN / 1000) });
  }
  async strijdBericht(ws, wie, m){
    const st = this.stand;
    if (wie.rol === "host"){
      if (m.t === "start" && st.fase === "lobby") return this.strijdStart();
      if (m.t === "stop" && st.fase !== "einde") return this.strijdKlaar();
      return;
    }
    const sp = st.spelers[wie.sid];
    if (!sp) return;
    /* In een duel mag een speler die alleen wacht de kamer sluiten. Wie al
       speelt niet meer: die kon anders vlak voor zijn val op stop drukken en
       zo de uitslag vastzetten terwijl hij voorstond. */
    if (m.t === "stop" && st.duel && st.fase !== "einde"){
      /* Een oudere pagina stuurt stop als je in de lobby weggaat. Zijn er nog
         anderen, dan ga alleen jij weg; vroeger sloot dat de kamer voor
         iedereen en kon niemand meer terug. */
      if ((st.fase === "lobby" || st.fase === "aftellen") && Object.keys(st.spelers).length > 1) return this.vertrek(wie.sid);
      if (st.fase === "lobby" || Object.keys(st.spelers).length <= 1) return this.strijdKlaar();
    }
    /* samen met meer: de maker start zodra er minstens twee zijn */
    if (m.t === "start" && st.duel && st.fase === "lobby" && wie.sid === st.gastheer && Object.keys(st.spelers).length >= 2 && this.lobbyKlaar()) return this.duelAftellen();
    /* de lobby van Zwaardvechter samen: een stijl kiezen en klaar melden; vol en allemaal klaar begint het vanzelf */
    if (m.t === "lobby" && st.duel && st.fase === "lobby"){
      if (["ridder", "schutter", "wacht"].indexOf(m.stijl) >= 0) sp.stijl = m.stijl;
      sp.klaar = !!m.klaar;
      await this.bewaar();
      this.iedereen({ t: "lobby", spelers: this.strijdLijst().map(r => ({ sid: r.sid, naam: r.naam, av: r.av, stijl: r.stijl, klaar: r.klaar, aan: r.aan })) });
      if (Object.keys(st.spelers).length >= this.samenMax() && this.lobbyKlaar()) return this.duelAftellen();
      return;
    }
    /* berichten tussen de spelers onderling (de gedeelde arena): de kamer geeft ze
       alleen door, bewaart niets en kijkt er niet in */
    if (m.t === "net"){
      if (st.fase === "einde" || m.d === undefined) return;
      if (m.d && m.d.k === "kz" && st.game === "toren"){
        this.motorKeuze[wie.sid] = m.d;
        st.keuze = st.keuze || {}; st.keuze[wie.sid] = m.d; this.ctx.waitUntil(this.bewaar());
        if (st.fase === "bezig" && !this.motor && this.torenStart()){ if (this.motorWacht){ clearTimeout(this.motorWacht); this.motorWacht = null; } }
        return;
      }
      if (this.motor){ this.motorBericht(wie, m.d); return; }
      /* van is het openbare nummer, niet het kenmerk: met het kenmerk kon de
         ander zich voor deze speler uitgeven, ook in de klas (hetzelfde lg-quiz-sid) */
      const s = JSON.stringify({ t: "net", van: this.pid(wie.sid), d: m.d });
      if (s.length > 60000) return;
      this.ctx.getWebSockets("speler").forEach(ws2 => {
        const w = ws2.deserializeAttachment() || {};
        if (w.sid !== wie.sid){ try { ws2.send(s); } catch (e){} }
      });
      return;
    }
    if (st.fase !== "bezig") return;
    if (this.race) return this.raceBericht(wie.sid, sp, m);
    if (m.t === "stand"){
      const nu0 = Date.now();
      if (sp.standLaatst && nu0 - sp.standLaatst < 400) return;   /* vaker dan dit hoeft niet */
      sp.standLaatst = nu0;
      /* de ronde loopt alleen op; een speler die opnieuw begint gaat niet terug */
      const dak = this.rondeDak();
      sp.ronde = Math.max(sp.ronde, Math.min(getal(m.ronde, 999), dak));
      sp.gehaald = Math.max(sp.gehaald, Math.min(getal(m.gehaald, 999), dak));
      sp.leven = getal(m.leven, 9999);
      sp.punten = Math.max(sp.punten, Math.min(getal(m.punten, 99999), dak * 200));
      sp.fase = m.fase === "tussen" ? "tussen" : "ronde";   /* tussen de rondes (vragen, winkel) of erin */
      sp.laatst = Date.now();
      await this.bewaar();
      this.planStand();
      return;
    }
    if (m.t === "aanval"){
      const nu = Date.now();
      if (sp.laatsteAanval && nu - sp.laatsteAanval < 3000) return;   /* hoogstens een per drie seconden */
      sp.laatsteAanval = nu;
      const n = Math.max(1, Math.min(5, getal(m.n, 5)));
      /* Met naar: naar die ene speler. Wie af is kiest zelf een doel; wie nog
         speelt stuurt zijn reeks naar iedereen, zoals het al ging. */
      const naar = m.naar ? this.sidVanPid(String(m.naar).slice(0, 40)) : null;
      if (sp.af && !naar) return;
      /* Niet twee keer op rij naar dezelfde: anders zit één leerling de hele
         ronde onder de fouten van iemand die af is. Speelt er nog maar één,
         dan mag het wel, want dan is er niemand anders. */
      if (naar && naar === sp.laatsteNaar){
        const anderen = Object.keys(st.spelers).filter(s => s !== wie.sid && s !== naar && !st.spelers[s].af && this.aanwezig(s));
        if (anderen.length) return;
      }
      if (naar) sp.laatsteNaar = naar;
      sp.aanvallen = (sp.aanvallen || 0) + 1;
      /* anoniem: de ontvanger ziet "iemand"; alleen wie af is kiest een doel, dus alleen die kan het */
      const bericht = JSON.stringify({ t: "aanval", van: naar && m.anoniem ? "" : sp.naam, n });
      this.ctx.getWebSockets("speler").forEach(s => {
        const w = s.deserializeAttachment() || {};
        const ander = st.spelers[w.sid];
        if (!ander || w.sid === wie.sid || ander.af) return;
        if (naar && w.sid !== naar) return;
        try { s.send(bericht); } catch (e){}
      });
      await this.bewaar();
      this.planStand();
      return;
    }
    if (m.t === "af"){
      const dak2 = this.rondeDak();
      sp.af = true; sp.afTijd = Date.now();
      sp.ronde = Math.max(sp.ronde, Math.min(getal(m.ronde, 999), dak2));
      sp.gehaald = Math.max(sp.gehaald, Math.min(getal(m.ronde, 999), dak2));
      sp.punten = Math.max(sp.punten, Math.min(getal(m.punten, 99999), dak2 * 200));
      await this.bewaar();
      this.planStand();
      const alle = Object.keys(st.spelers);
      /* in een duel is het klaar zodra er een valt; met de klas als iedereen af is */
      if (st.duel && alle.length >= 2) return this.strijdKlaar();
      if (alle.length && alle.every(id => st.spelers[id].af)) return this.strijdKlaar();
    }
  }
  /* ---------- Poortrace: de race ----------
     Per speler staat in sp.rit wat de kamer over zijn rit weet: de vraag van
     zijn volgende poort (met de goede baan, die de browser niet krijgt), welke
     poorten goed waren, de reeks en het tempo, en in Oneindig de tank. sp.ronde
     is het aantal poorten dat hij had, sp.gehaald hoeveel daarvan goed,
     sp.punten zijn punten; alleen de kamer schrijft ze. Wat een speler stuurt:
       antwoord { k, b }   door poort k, in baan b
       finish              over de finish
       verder { k }        (oud) klaar met de uitleg na een fout; een oudere
                           pagina stuurt het nog, de kamer doet er niets meer mee
       stand { plek, vs }  waar zijn karretje rijdt en hoe snel; alleen voor het
                           beeld, en nooit buiten zijn stuk tussen twee poorten.
                           plek in duizendsten van een poort vanaf de start (poort
                           k staat op (k+1)*1000), vs in duizendsten per seconde.
                           Een oudere pagina stuurt alleen voort (promille van de
                           baan). De kamer onthoudt wanneer de melding kwam: de
                           anderen krijgen hem met zijn leeftijd (oud) erbij en
                           rijden het karretje daarmee door tot de volgende. */
  async raceBericht(sid, sp, m){
    if (sp.af) return;
    if (this.oneindig && this.raceLeegNu(sid)) return;
    if (m.t === "antwoord") return this.raceAntwoord(sid, m);
    if (m.t === "finish") return this.oneindig ? undefined : this.raceFinish(sid);
    /* sinds september 2026 is er geen uitleg meer om weg te tikken; een oudere pagina stuurt het nog */
    if (m.t === "verder") return;
    if (m.t === "stand"){
      const nu = Date.now();
      if (sp.standLaatst && nu - sp.standLaatst < 200) return;
      sp.standLaatst = nu; sp.laatst = nu;
      const r = sp.ronde | 0, span = RACE_POORTEN + .4;
      const ruw = m.plek !== undefined ? Number(m.plek) : Number(m.voort) * span;
      const plek = Number.isFinite(ruw) ? Math.round(ruw * 10) / 10 : r * 1000;
      this.raceZetPlek(sp, Math.max(r * 1000, Math.min(plek, (r + 1) * 1000)), nu);
      const vs = Number(m.vs);
      sp.vs = Number.isFinite(vs) ? Math.max(0, Math.min(600, Math.round(vs))) : undefined;
      this.planStand();
      this.planPos();
    }
  }
  /* de plek van een speler (in duizendsten van een poort), en voort voor het bord */
  raceZetPlek(sp, plek, nu){
    if (plek !== sp.plek) sp.plekT = nu;
    sp.plek = plek;
    sp.voort = this.oneindig ? 0 : Math.min(1000, Math.round(plek / (RACE_POORTEN + .4) * 10) / 10);
  }
  /* De vragen van deze race, een keer per kamer: het vak uit stad-vragen, of de
     woordenlijst van de docent. Klaargezet zoals de pagina ze alleen ook zou
     nemen: welke onderdelen meedoen (de keuze van de maker, anders alles wat
     genoeg korte vragen heeft), en bij rekenen de sommen van dit niveau. */
  raceBereid(){
    if (this.raceBankP) return this.raceBankP;
    const st = this.stand, R = POORTREGELS, r = RANGEN[st.niveau] || 2;
    const laad = st.vak === "eigen" ? this.raceLijst(st.deel) : laadVragen(this.env, this.origin, st.vak);
    this.raceBankP = laad.catch(e => { console.error("racevragen", e && e.message); return []; }).then(async lijst => {
      let vak = st.vak;
      /* niets te laden: dan rekenen, zoals de pagina ook doet als een vak niets geeft */
      if (!lijst.length && vak !== "reken"){ vak = "reken"; lijst = await laadVragen(this.env, this.origin, "reken").catch(() => []); }
      if (vak !== "eigen" && vak !== "ges" && !R.PAST[vak]) vak = "reken";
      let bron = lijst;
      if (vak === "reken"){
        const hier = lijst.filter(q => (q.n || 2) === r && R.geschikt(q));
        if (hier.length >= R.MINIMUM) bron = hier;
      }
      const lijsten = lijst.lijsten || {}, jaren = vak === "ges" && Array.isArray(lijsten.gebeurtenissen) ? lijsten.gebeurtenissen : [];
      const past = R.PAST[vak] || [];
      let mag = vak === "eigen" ? [] : String(st.deel || "").split(",").map(x => x.trim()).filter(x => past.indexOf(x) >= 0);
      if (!mag.length) mag = past.filter(id => {
        if (id === "jaartallen") return jaren.length >= R.MINIMUM;
        if (vak === "reken") return true;
        let n = 0;
        for (const q of bron) if (q.t === id && (q.n || 2) <= r + 1 && R.geschikt(q)) n++;
        return n >= R.MINIMUM;
      });
      /* niets over (een korte woordenlijst): dan alles wat er is */
      if (!mag.length) bron.forEach(q => { if (q.t && mag.indexOf(q.t) < 0) mag.push(q.t); });
      return { vak, r, bron, nivo: bron.map(q => q.n || 2), mag, jaren, tvNamen: lijsten.tijdvakken || [], delen: lijst.delen || {} };
    });
    return this.raceBankP;
  }
  /* een woordenlijst van Eigen materiaal (de code staat in deel) */
  async raceLijst(code){
    code = String(code || "").toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(code) || !this.env.MATERIAAL) return [];
    const r = await this.env.MATERIAAL.get(this.env.MATERIAAL.idFromName("materiaal")).fetch("https://materiaal/haal?code=" + code);
    if (!r.ok) return [];
    const m = await r.json();
    return m && m.soort === "lijst" ? lijstVragen(m) : [];
  }
  /* de vraag van de volgende poort van een speler, zoals de pagina hem alleen ook kiest */
  raceVraag(sid, b, sinds){
    const st = this.stand, sp = st.spelers[sid], rit = sp.rit, R = POORTREGELS;
    this.racePot = this.racePot || {};
    let pot = this.racePot[sid], q = null;
    for (let poging = 0; poging < 40; poging++){
      if (!pot || !pot.length) pot = this.racePot[sid] = R.stapel(b.bron, b.nivo, b.mag, b.r, b.jaren.length);
      if (!pot.length) break;
      const x = pot.pop();
      q = x.s === "j" ? R.jaarVraag(b.jaren, x.i, b.r, b.tvNamen) : b.bron[x.i];
      if (!q) continue;
      /* niet twee keer dezelfde in een race */
      if (rit.gehad.indexOf(q.v) >= 0 && pot.length > 3){ q = null; continue; }
      break;
    }
    if (!q || !R.geschikt(q)) q = noodSom(b.r);
    const niveau = RANGEN[st.niveau] ? st.niveau : "kgt";
    /* drie banen open, ook op vmbo-bb; te weinig foute antwoorden: een uit de andere vragen van dat onderdeel */
    const p = R.poort(q, () => R.reserve(b.bron, q));
    const naam = q.t === "jaartallen" ? "jaartallen" : b.vak === "eigen" ? (b.delen[q.t] || "eigen lijst") : (q.k || b.delen[q.t] || q.t || "vraag");
    rit.vraag = { k: sp.ronde | 0, v: String(q.v), banen: p.banen.map(x => x ? x.tekst : null), g: p.goed, deel: q.t || "",
                  kop: String(naam).replace(/^tijdvak \d+ /, "tijdvak "), vlag: /^[a-z-]{2,8}$/.test(q.vlag || "") ? q.vlag : undefined,
                  s: Math.round(R.doelTijd(niveau, rit.snel, q.v, p.banen, false) * 1000) / 1000, sinds,
                  q: { v: String(q.v), o: q.o.map(String), g: q.g | 0, u: String(q.u || ""), t: q.t || "" } };
    rit.gehad.push(q.v);
    if (rit.gehad.length > 30) rit.gehad.shift();
  }
  raceZendVraag(sid){
    const sp = this.stand.spelers[sid], v = sp && sp.rit && sp.rit.vraag;
    if (!v) return;
    this.naarSpeler(sid, { t: "poort", k: v.k, n: this.oneindig ? 0 : RACE_POORTEN, v: v.v, banen: v.banen, kop: v.kop, deel: v.deel, vlag: v.vlag, s: v.s });
  }
  naarSpeler(sid, bericht){ const s = JSON.stringify(bericht); this.ctx.getWebSockets(sid).forEach(ws => { try { ws.send(s); } catch (e){} }); }
  /* Een speler begint (of komt terug): zijn rit klaarzetten als hij er nog geen
     had, en hem zeggen waar hij is, wat het oordeel over zijn laatste poort was
     en wat de vraag van zijn volgende poort is. */
  async raceHerstel(sid){
    const st = this.stand;
    if (!this.race || !st.spelers[sid] || st.fase !== "bezig") return;
    const b = await this.raceBereid();
    const sp = this.stand && this.stand.spelers[sid];
    if (!sp || !this.race || this.stand.fase !== "bezig") return;
    if (!sp.rit){
      sp.rit = { reeks: 0, beste: 0, snel: 0, uit: [], gehad: [], vraag: null, laatste: null, bij: 0, poortTijd: 0 }; sp.ronde = 0; sp.gehaald = 0; sp.punten = 0; sp.voort = 0; sp.plek = 0;
      /* Oneindig: een volle tank, die loopt vanaf het startschot (met de klas na het aftellen op de telefoon) */
      if (this.oneindig){ Object.assign(sp.rit, { tank: 100, tankT: (sp.raceStart || st.gestart || Date.now()) + (st.duel && !sp.raceStart ? 0 : RACE_AFTEL_MS) }); this.raceTankPlan(); }
    }
    const rit = sp.rit;
    if (this.oneindig) this.raceTankPlan();
    if (!rit.vraag && !sp.af && (this.oneindig || sp.ronde < RACE_POORTEN)){
      this.raceVraag(sid, b, sp.ronde ? Date.now() : (sp.raceStart || st.gestart || Date.now()));
      await this.bewaar();
    }
    const nu = Date.now();
    this.naarSpeler(sid, Object.assign({ t: "rit", ronde: sp.ronde | 0, gehaald: sp.gehaald | 0, punten: sp.punten | 0, reeks: rit.reeks, beste: rit.beste, snel: rit.snel,
                           uit: rit.uit, af: !!sp.af, tijd: sp.tijd || 0 },
                           /* Oneindig: hoe vol de tank nu is */
                           this.oneindig && rit.tank !== undefined ? { tank: Math.round(Math.max(0, this.raceTank(sp, nu)) * 10) / 10 } : {}));
    if (rit.laatste) this.naarSpeler(sid, rit.laatste);
    this.raceZendVraag(sid);
  }
  /* hoe vroeg een antwoord op zijn vroegst kan komen, in ms na de vraag: na een
     fout eerst de slip en weer optrekken, na een goede poort het korte
     stukje tot de volgende vraag, en bij de eerste poort optrekken vanaf de start */
  raceMinMs(v, rit){
    if (!v.k) return RACE_EERSTE * v.s * 1000;
    return (rit.uit[v.k - 1] === false ? RACE_NA_FOUT : RACE_NA_POORT) + RACE_RIJ * v.s * 1000;
  }
  /* Door een poort. Alleen de poort waar hij nu voor staat telt, een keer.
     Een antwoord op een poort die al gehad is krijgt het oordeel van toen
     nog een keer (een verbinding die haperde), zonder dat er iets verandert. */
  async raceAntwoord(sid, m){
    const b = await this.raceBereid();
    const st = this.stand, sp = st && st.spelers[sid], rit = sp && sp.rit;
    if (!rit || sp.af || st.fase !== "bezig") return;
    this.raceWacht = this.raceWacht || {};
    const k = Number(m.k), v = rit.vraag;
    if (rit.laatste && k === rit.laatste.k && (!v || v.k !== k)){ this.naarSpeler(sid, rit.laatste); return; }
    if (!v || k !== v.k || this.raceWacht[sid]) return;
    const baan = Number(m.b);
    if (!(baan >= 0 && baan < 3) || baan !== Math.floor(baan) || !v.banen[baan]) return;
    /* sneller dan de regels toelaten: dan pas nakijken als het had gekund */
    const nu = Date.now(), vroeg = v.sinds + this.raceMinMs(v, rit) - nu;
    if (vroeg > 0){
      this.raceWacht[sid] = setTimeout(() => {
        delete this.raceWacht[sid];
        this.raceAntwoord(sid, m).catch(e => console.error("raceantwoord", e && e.stack || e));
      }, Math.ceil(vroeg));
      return;
    }
    /* Oneindig: de tank tot nu (met het verbruik van de poort die hij had), leeg is leeg */
    const tankVoor = this.oneindig ? this.raceTank(sp, nu) : 0;
    if (this.oneindig && nu > this.raceLeegOp(sp) + RACE_LEEG_MARGE) return this.raceLeeg(sid);
    const goed = baan === v.g, s = { goed: sp.gehaald | 0, reeks: rit.reeks, beste: rit.beste, snelNiv: rit.snel, punten: sp.punten | 0 };
    const erbij = POORTREGELS.na(s, goed, false);
    sp.gehaald = s.goed; rit.reeks = s.reeks; rit.beste = s.beste; rit.snel = s.snelNiv; sp.punten = s.punten;
    rit.uit[v.k] = goed;
    sp.ronde = v.k + 1; sp.laatst = nu;
    rit.poortTijd = nu; rit.bij = nu - (sp.raceStart || st.gestart || nu);
    this.raceZetPlek(sp, Math.max(sp.plek || 0, sp.ronde * 1000), nu);
    rit.laatste = { t: "uitslag", k: v.k, goed, g: v.g, erbij, gehaald: sp.gehaald, punten: sp.punten, reeks: rit.reeks, beste: rit.beste, snel: rit.snel, q: v.q };
    if (this.oneindig){
      /* brandstof erbij; de tank loopt meteen weer, ook in de slip na een fout */
      const t0 = Math.max(0, tankVoor), brand = POORTREGELS.tanken(t0, goed, rit.reeks);
      rit.tank = Math.min(100, t0 + brand); rit.tankT = nu;
      delete rit.vrijVan; delete rit.vrijTot;
      rit.laatste.tank = Math.round(rit.tank * 10) / 10; rit.laatste.brand = brand;
    }
    rit.vraag = null;
    if (this.oneindig || sp.ronde < RACE_POORTEN) this.raceVraag(sid, b, nu);
    await this.bewaar();
    this.naarSpeler(sid, rit.laatste);
    this.raceZendVraag(sid);
    this.planStand();
    if (this.oneindig) this.raceTankPlan();
    /* de finish kwam binnen terwijl dit antwoord nog wachtte */
    if (this.raceNaFinish && this.raceNaFinish[sid]){ delete this.raceNaFinish[sid]; return this.raceFinish(sid); }
  }
  /* Over de finish: alle poorten gehad, en niet eerder dan het stuk na de laatste poort kost. De tijd is die van de kamer. */
  async raceFinish(sid){
    const st = this.stand, sp = st && st.spelers[sid], rit = sp && sp.rit;
    if (!rit || sp.af || st.fase !== "bezig" || this.oneindig) return;
    this.raceWacht = this.raceWacht || {};
    if ((sp.ronde | 0) < RACE_POORTEN){
      if (this.raceWacht[sid] && rit.vraag && rit.vraag.k === RACE_POORTEN - 1){ this.raceNaFinish = this.raceNaFinish || {}; this.raceNaFinish[sid] = true; }
      return;
    }
    if (this.raceWacht[sid]) return;
    const nu = Date.now(), vroeg = (rit.poortTijd || 0) + RACE_FINISH_MS + (rit.uit[RACE_POORTEN - 1] === false ? RACE_FINISH_FOUT : 0) - nu;
    if (vroeg > 0){
      this.raceWacht[sid] = setTimeout(() => {
        delete this.raceWacht[sid];
        this.raceFinish(sid).catch(e => console.error("racefinish", e && e.stack || e));
      }, Math.ceil(vroeg));
      return;
    }
    sp.af = true; sp.afTijd = nu; sp.tijd = nu - (sp.raceStart || st.gestart || nu); sp.voort = 1000;
    if (sp.gehaald === RACE_POORTEN) sp.punten += POORTREGELS.ALLES_GOED;
    await this.bewaar();
    this.planStand();
    return this.raceKlaar(true);
  }
  /* Klaar als iedereen binnen is (wie wegging telt niet mee). Met vrienden
     loopt na de eerste finish de klok van de uitloop. */
  async raceKlaar(finish){
    const st = this.stand;
    if (!st || st.fase !== "bezig") return;
    const ids = Object.keys(st.spelers), binnen = ids.filter(s => st.spelers[s].af).length;
    if (!binnen) return;
    if (ids.every(s => st.spelers[s].af || st.spelers[s].weg)) return this.strijdKlaar();
    if (finish && st.duel && binnen === 1 && !this.oneindig) await this.zetAlarm({ wat: "raceslot" }, RACE_UITLOOP);
  }
  /* ---------- Oneindig: de tank ---------- */
  /* De tank van een speler op tijdstip nu: wat hij had bij zijn laatste poort
     (of de start), min het verbruik sindsdien. Een rit van voor september 2026
     kan nog een gratis leestijd na een fout hebben (vrijVan tot vrijTot); die
     telt nog, tot zijn volgende poort. */
  raceTank(sp, nu){
    const rit = sp.rit;
    if (!rit || rit.tank === undefined) return 100;
    if (this.stand.fase === "einde" && this.stand.eindT) nu = Math.min(nu, this.stand.eindT);
    let ms = Math.max(0, nu - rit.tankT);
    if (rit.vrijTot > rit.tankT){ const van = Math.max(rit.tankT, rit.vrijVan), tot = Math.min(nu, rit.vrijTot); if (tot > van) ms -= tot - van; }
    return rit.tank - POORTREGELS.verbruik(sp.ronde | 0, this.stand.niveau) * ms / 1000;
  }
  /* wanneer de tank leeg is als er geen poort meer bij komt */
  raceLeegOp(sp){
    const rit = sp.rit;
    if (!rit || rit.tank === undefined) return Infinity;
    let t = Math.max(rit.tankT, 0) + rit.tank / POORTREGELS.verbruik(sp.ronde | 0, this.stand.niveau) * 1000;
    if (rit.vrijTot > rit.tankT && rit.vrijVan < t) t += rit.vrijTot - Math.max(rit.tankT, rit.vrijVan);
    return t;
  }
  /* is hij nu leeg (met de marge)? dan is zijn race klaar */
  raceLeegNu(sid){
    const sp = this.stand.spelers[sid];
    if (!sp || sp.af || !sp.rit || this.stand.fase !== "bezig") return !!(sp && sp.af);
    if (Date.now() <= this.raceLeegOp(sp) + RACE_LEEG_MARGE) return false;
    this.ctx.waitUntil(this.raceLeeg(sid));
    return true;
  }
  async raceLeeg(sid){
    const st = this.stand, sp = st && st.spelers[sid];
    if (!sp || sp.af || !sp.rit || st.fase !== "bezig") return;
    const t = Math.min(Date.now(), this.raceLeegOp(sp));
    /* waar hij stilviel: zijn laatste plek plus wat hij daarna met zijn snelheid
       nog reed tot de tank leeg was, nooit voorbij zijn volgende poort */
    if (sp.plekT && sp.vs > 0 && t > sp.plekT){
      const r = sp.ronde | 0, verder = (sp.plek || 0) + sp.vs * Math.min(3000, t - sp.plekT) / 1000;
      this.raceZetPlek(sp, Math.round(Math.max(r * 1000, Math.min(verder, (r + 1) * 1000 - 1)) * 10) / 10, t);
    }
    sp.vs = 0;
    sp.af = true; sp.afTijd = t; sp.tijd = t - (sp.raceStart || st.gestart || t);
    sp.rit.tank = 0; sp.rit.tankT = t; sp.rit.vraag = null;
    if (this.raceWacht && this.raceWacht[sid]){ clearTimeout(this.raceWacht[sid]); delete this.raceWacht[sid]; }
    await this.bewaar();
    this.naarSpeler(sid, { t: "leeg", ronde: sp.ronde | 0, gehaald: sp.gehaald | 0, punten: sp.punten | 0, tijd: sp.tijd, km: Math.round(POORTREGELS.km((sp.plek || 0) / 1000) * 1000) / 1000 });
    this.planStand();
    this.raceTankPlan();
    return this.raceKlaar(false);
  }
  /* een wekker voor de eerste die leeg raakt: de kamer wacht niet tot hij nog iets stuurt */
  raceTankPlan(){
    clearTimeout(this.raceTankKlok); this.raceTankKlok = null;
    const st = this.stand;
    if (!this.oneindig || st.fase !== "bezig") return;
    let eerst = Infinity;
    Object.keys(st.spelers).forEach(s => { const sp = st.spelers[s]; if (!sp.af && sp.rit) eerst = Math.min(eerst, this.raceLeegOp(sp)); });
    if (eerst === Infinity) return;
    this.raceTankKlok = setTimeout(() => {
      this.raceTankKlok = null;
      if (!this.oneindig || this.stand.fase !== "bezig") return;
      Object.keys(this.stand.spelers).forEach(s => this.raceLeegNu(s));
      this.raceTankPlan();
    }, Math.max(50, eerst + RACE_LEEG_MARGE + 20 - Date.now()));
  }
  /* de volgorde in een race: wie binnen is op tijd, dan wie het verst kwam; wie wegging achteraan */
  raceVolgorde(a, b){
    /* Oneindig: wie het verst reed (de kilometers uit de plek), en bij evenveel wie er het eerst was; leeg of niet doet er niet toe */
    if (this.oneindig) return (b.plek || 0) - (a.plek || 0) || b.ronde - a.ronde || a.bij - b.bij || a.naam.localeCompare(b.naam);
    if (a.af !== b.af) return a.af ? -1 : 1;
    if (a.af) return a.tijd - b.tijd || a.naam.localeCompare(b.naam);
    if (a.weg !== b.weg) return a.weg ? 1 : -1;
    /* onderweg: wie meer poorten had, en bij evenveel wie er het eerst was; zoals de kamer het zag, niet wat een browser meldt */
    return b.ronde - a.ronde || a.bij - b.bij || a.naam.localeCompare(b.naam);
  }
  /* Hoeveel rondes er op zijn hoogst gespeeld kunnen zijn. Een speler meldt
     zelf hoe ver hij is en dat bord hangt vooraan in de klas, dus het loont om
     er een groot getal in te zetten. Narekenen kan de kamer niet, maar de klok
     kent hij wel: vier seconden per ronde is ruim onder wat een ronde echt
     kost, met twee rondes speling voor het begin. */
  rondeDak(){
    const gestart = this.stand && this.stand.gestart;
    if (!gestart) return 999;
    return Math.min(999, 2 + Math.floor((Date.now() - gestart) / 4000));
  }
  /* de stand gaat op zijn vroegst om de ruim een seconde naar iedereen, hoe
     vaak de spelers ook melden */
  planStand(){
    if (this.standTimer) return;
    this.standTimer = setTimeout(() => { this.standTimer = null; this.stuurStand(); }, 1200);
  }
  /* Tussen twee standen door, om de halve seconde: alleen de plekken, zodat de
     karretjes van de anderen soepel rijden. Elke speler krijgt wie binnen
     RACE_POS_BUURT duizendsten van een poort van hem rijdt (verder weg zie je
     ze toch niet), het bord iedereen. Kort: [pid, plek, vs, oud, ronde]. Met
     dertig leerlingen hoogstens een paar honderd tekens per bericht. */
  planPos(){
    if (this.posTimer || !this.race) return;
    this.posTimer = setTimeout(() => { this.posTimer = null; this.stuurPos(); }, RACE_POS_MS);
  }
  stuurPos(){
    const st = this.stand;
    if (!this.race || !st || st.fase !== "bezig") return;
    const nu = Date.now(), alle = [];
    Object.keys(st.spelers).forEach(s => {
      const sp = st.spelers[s];
      if (sp.weg || sp.af) return;
      alle.push({ sid: s, rij: [sp.pid, sp.plek || 0, typeof sp.vs === "number" ? sp.vs : -1, sp.plekT ? Math.min(5000, nu - sp.plekT) : 0, sp.ronde | 0] });
    });
    if (!alle.length) return;
    this.naarHost({ t: "pos", r: alle.map(x => x.rij) });
    this.ctx.getWebSockets("speler").forEach(ws => {
      const wie = ws.deserializeAttachment() || {}, mij = st.spelers[wie.sid];
      if (!mij) return;
      const p = mij.plek || 0, r = alle.filter(x => x.sid !== wie.sid && Math.abs(x.rij[1] - p) <= RACE_POS_BUURT).map(x => x.rij);
      if (r.length) this.stuur(ws, { t: "pos", r });
    });
  }
  strijdLijst(){
    const st = this.stand, nu = Date.now();
    return Object.keys(st.spelers).map(sid => {
      const sp = st.spelers[sid];
      return { sid: sp.pid, naam: sp.naam, av: sp.av || "", ronde: sp.ronde, gehaald: sp.gehaald, leven: sp.leven, punten: sp.punten,
               af: !!sp.af, aanvallen: sp.aanvallen || 0, aan: this.aanwezig(sid), stijl: sp.stijl || "", klaar: !!sp.klaar, weg: !!sp.weg,
               voort: sp.voort || 0, tijd: sp.tijd || 0, bij: sp.rit ? sp.rit.bij || 0 : 0,
               /* in een race: de plek in duizendsten van een poort, de snelheid en hoe oud die melding is */
               plek: this.race ? sp.plek || 0 : undefined, vs: this.race ? sp.vs : undefined, oud: this.race && sp.plekT ? Math.min(5000, nu - sp.plekT) : undefined,
               tank: this.oneindig && sp.rit ? (sp.af ? 0 : Math.max(0, Math.round(this.raceTank(sp, nu)))) : undefined,
               /* Oneindig: de kilometers, op drie decimalen */
               km: this.oneindig ? Math.round(POORTREGELS.km((sp.plek || 0) / 1000) * 1000) / 1000 : undefined };
    }).sort((a, b) => this.race ? this.raceVolgorde(a, b)
        : (this.stand.duel && a.af !== b.af) ? (a.af ? 1 : -1)   /* in een duel wint wie overeind blijft */
        : (b.gehaald - a.gehaald || b.punten - a.punten || (a.af === b.af ? 0 : a.af ? 1 : -1) || a.naam.localeCompare(b.naam)))
      .map((r, i) => Object.assign(r, { rang: i + 1 }));
  }
  standBericht(sid){
    const lijst = this.strijdLijst();
    const bezig = lijst.filter(r => !r.af).length;
    const kop = lijst[0] ? { naam: lijst[0].naam, ronde: lijst[0].ronde } : null;
    /* het bord: ook de klok van de kamer en het startschot, voor de tijd van de race */
    if (!sid) return { t: "stand", spelers: lijst, bezig, fase: this.stand.fase, modus: this.stand.modus || undefined, nu: this.race ? Date.now() : undefined, gestart: this.race ? this.stand.gestart : undefined };
    const pid = this.pid(sid);
    const mij = lijst.filter(r => r.sid === pid)[0];
    const tegen = this.stand.duel ? (lijst.filter(r => r.sid !== pid)[0] || null) : null;
    const maten = this.stand.duel ? lijst.filter(r => r.sid !== pid && !r.weg).map(r => ({ sid: r.sid, naam: r.naam, av: r.av || "", ronde: r.ronde, leven: r.leven, af: r.af, aan: r.aan, stijl: r.stijl, klaar: r.klaar })) : undefined;
    /* Wie af is krijgt de lijst met wie er nog speelt, zodat hij kan kiezen
       naar wie zijn fouten gaan. Wie nog speelt heeft die lijst niet nodig en
       krijgt hem dus ook niet. */
    /* aan telt mee: wie zijn tabblad dicht deed staat nog in de lijst maar
       merkt niets van je fouten, en dan gooi je een goed antwoord weg */
    const doelen = (mij && mij.af) ? lijst.filter(r => !r.af && r.aan && r.sid !== pid).map(r => ({ sid: r.sid, naam: r.naam, av: r.av || "", ronde: r.ronde })) : undefined;
    /* in een race ziet iedereen iedereen: waar ze op de baan zijn, en wie er al binnen is */
    const rijders = this.race ? lijst.map(r => ({ sid: r.sid, naam: r.naam, av: r.av || "", voort: r.voort, plek: r.plek, vs: r.vs, oud: r.oud, tank: r.tank, km: r.km, ronde: r.ronde, af: r.af, tijd: r.tijd, rang: r.rang, weg: r.weg, aan: r.aan, bij: r.bij })) : undefined;
    return { t: "stand", modus: this.stand.modus || undefined, jouw: mij ? { rang: mij.rang, van: lijst.length, af: !!mij.af } : null, bezig, koploper: kop, fase: this.stand.fase, maten, doelen, rijders, max: this.stand.duel ? this.samenMax() : undefined,
             tegen: tegen ? { naam: tegen.naam, av: tegen.av || "", ronde: tegen.ronde, leven: tegen.leven, punten: tegen.punten, af: tegen.af, aan: tegen.aan } : null };
  }
  stuurStand(){
    if (!this.strijd) return;
    this.naarHost(this.standBericht(null));
    this.ctx.getWebSockets("speler").forEach(ws => {
      const wie = ws.deserializeAttachment() || {};
      this.stuur(ws, this.standBericht(wie.sid));
    });
  }
  strijdEinde(sid){
    const lijst = this.strijdLijst();
    const pid = sid ? this.pid(sid) : null;
    const mij = pid ? lijst.filter(r => r.sid === pid)[0] : null;
    return { t: "einde", stand: lijst, jouw: mij ? { rang: mij.rang, van: lijst.length, naam: mij.naam } : null };
  }
  async strijdKlaar(){
    this.motorStop();
    clearTimeout(this.raceTankKlok); this.raceTankKlok = null;
    /* Oneindig: de tanks staan stil op het moment dat de race klaar is */
    this.stand.eindT = Date.now();
    this.stand.fase = "einde";
    await this.zetAlarm({ wat: "opruimen" }, NA_EINDE);
    await this.bewaar();
    this.naarHost(this.strijdEinde(null));
    this.ctx.getWebSockets("speler").forEach(ws => {
      const wie = ws.deserializeAttachment() || {};
      this.stuur(ws, this.strijdEinde(wie.sid));
    });
  }

  /* ======================================================================
     De Klasquiz
     ====================================================================== */
  async volgende(){
    this.stand.i++;
    if (this.stand.i >= this.stand.vragen.length) return this.einde();
    this.stand.fase = "vraag";
    this.stand.vraagStart = Date.now();
    await this.zetAlarm({ wat: "sluit", i: this.stand.i }, this.stand.tijd * 1000 + 400);
    await this.bewaar();
    this.iedereen(this.vraagBericht());
  }
  vraagBericht(){
    const q = this.stand.vragen[this.stand.i], nu = Date.now();
    return { t: "vraag", i: this.stand.i, n: this.stand.vragen.length, v: q.v, o: q.o, k: q.t,
             vlag: q.vlag, svg: q.svg, tijd: this.stand.tijd,
             tot: this.stand.vraagStart + this.stand.tijd * 1000, nu, geteld: this.geteld() };
  }
  async sluitVraag(){
    if (this.stand.fase !== "vraag") return;
    const i = this.stand.i, q = this.stand.vragen[i], tijdMs = this.stand.tijd * 1000;
    Object.keys(this.stand.spelers).forEach(sid => {
      const sp = this.stand.spelers[sid], a = sp.antw[i];
      if (!a || a.delta !== undefined) return;
      a.goed = a.k === q.g;
      /* goed is 500 punten, en tot 500 erbij voor snelheid */
      a.delta = a.goed ? 500 + Math.round(500 * Math.max(0, 1 - a.ms / tijdMs)) : 0;
      sp.score += a.delta;
    });
    this.stand.fase = "uitslag";
    await this.zetAlarm({ wat: "opruimen" }, OPRUIMEN_NA);
    await this.bewaar();
    this.naarHost(this.uitslagVoorHost());
    this.ctx.getWebSockets("speler").forEach(ws => {
      const wie = ws.deserializeAttachment() || {};
      this.stuur(ws, this.uitslagVoorSpeler(wie.sid));
    });
  }
  async einde(){
    this.stand.fase = "einde";
    await this.zetAlarm({ wat: "opruimen" }, NA_EINDE);
    await this.bewaar();
    this.naarHost(this.eindeBericht(null));
    this.ctx.getWebSockets("speler").forEach(ws => {
      const wie = ws.deserializeAttachment() || {};
      this.stuur(ws, this.eindeBericht(wie.sid));
    });
  }
  ranglijst(){
    return Object.keys(this.stand.spelers).map(sid => {
      const sp = this.stand.spelers[sid], a = sp.antw[this.stand.i] || {};
      const od = {};
      Object.keys(sp.antw).forEach(k => { const q = this.stand.vragen[k], a2 = sp.antw[k]; if (!q || !a2 || a2.goed === undefined) return; const o = q.t || "overig"; od[o] = od[o] || [0, 0]; od[o][1]++; if (a2.goed) od[o][0]++; });
      return { sid: sp.pid, naam: sp.naam, av: sp.av || "", score: sp.score, delta: a.delta || 0, goed: !!a.goed, aantalGoed: Object.keys(sp.antw).filter(k => sp.antw[k] && sp.antw[k].goed).length, od, aan: this.aanwezig(sid) };
    }).sort((a, b) => b.score - a.score || a.naam.localeCompare(b.naam))
      .map((r, i) => Object.assign(r, { rang: i + 1 }));
  }
  geteld(){
    const i = this.stand.i;
    const aan = Object.keys(this.stand.spelers).filter(sid => this.aanwezig(sid));
    return { n: aan.filter(sid => this.stand.spelers[sid].antw[i]).length, van: aan.length };
  }
  jouw(sid){
    const pid = this.pid(sid), lijst = this.ranglijst(), r = lijst.filter(x => x.sid === pid)[0];
    return r ? { naam: r.naam, score: r.score, rang: r.rang, van: lijst.length } : null;
  }
  uitslagVoorHost(){
    const i = this.stand.i, q = this.stand.vragen[i];
    const verdeling = q.o.map(() => 0);
    Object.keys(this.stand.spelers).forEach(sid => { const a = this.stand.spelers[sid].antw[i]; if (a) verdeling[a.k]++; });
    return { t: "uitslag", i, n: this.stand.vragen.length, g: q.g, u: q.u, o: q.o, v: q.v, vlag: q.vlag, svg: q.svg, verdeling,
             stand: this.ranglijst().slice(0, 10), laatste: i >= this.stand.vragen.length - 1 };
  }
  uitslagVoorSpeler(sid){
    const i = this.stand.i, q = this.stand.vragen[i], sp = this.stand.spelers[sid], a = sp ? sp.antw[i] : null;
    return { t: "uitslag", i, n: this.stand.vragen.length, g: q.g, u: q.u, o: q.o,
             k: a ? a.k : -1, goed: !!(a && a.goed), delta: a ? a.delta : 0, jouw: this.jouw(sid),
             laatste: i >= this.stand.vragen.length - 1 };
  }
  eindeBericht(sid){
    return { t: "einde", n: this.stand.vragen.length, stand: this.ranglijst(), jouw: sid ? this.jouw(sid) : null };
  }

  /* ======================================================================
     Gedeeld
     ====================================================================== */
  /* ---------- het klasoverzicht ---------- */
  /* Welke leerling hoort bij dit kenmerk? Een browser krijgt een willekeurig
     kenmerk; dezelfde leerling op een tweede apparaat kreeg dus een tweede
     regel in het overzicht. Nu: hetzelfde Microsoft-account (per klas
     afgeleid) is dezelfde leerling, en zonder account is dezelfde bijnaam
     dezelfde leerling, zolang er geen twee verschillende accounts achter
     zitten. Het nieuwe kenmerk wordt dan een verwijzing naar het oude. */
  /* door de docent uit de klas gehaald (leerlingWeg): op dit kenmerk, een oud kenmerk ervan, of het account */
  isWeg(sid, acc){
    const w = this.stand.weg;
    if (!w) return false;
    const kort = String(sid || "").slice(0, 12);
    return !!(w[kort] || (acc && w["acc:" + acc]));
  }
  nietMeerWeg(sid, acc){
    const w = this.stand.weg;
    if (!w) return;
    delete w[String(sid || "").slice(0, 12)];
    if (acc) delete w["acc:" + acc];
  }
  klasLeerling(kort, naam, acc){
    const st = this.stand;
    st.leerlingen = st.leerlingen || {}; st.alias = st.alias || {}; st.accounts = st.accounts || {};
    this.samenvoegen();
    if (st.alias[kort]) kort = st.alias[kort];
    const l = st.leerlingen;
    let doel = null;
    if (acc && st.accounts[acc] && st.accounts[acc] !== kort && l[st.accounts[acc]]) doel = st.accounts[acc];
    else if (!l[kort]){
      const n = normNaam(naam);
      doel = Object.keys(l).find(k => normNaam(l[k].naam) === n && !(acc && l[k].acc && l[k].acc !== acc)) || null;
    }
    /* Elk nieuw kenmerk met een bekende bijnaam wordt een verwijzing; zonder
       plafond kon iemand met de klascode er eindeloos veel aanmaken. Vol: dan
       wordt het een eigen leerling, en daarvoor geldt KLAS_LEERLINGEN. */
    if (doel && doel !== kort && !st.alias[kort] && Object.keys(st.alias).length >= KLAS_ALIAS) doel = null;
    if (doel && doel !== kort){
      st.alias[kort] = doel;
      /* uitslagen die al onder het nieuwe kenmerk stonden gaan mee */
      st.resultaten.forEach(r => { if (r.sid === kort) r.sid = doel; });
      if (l[kort]){ if (!l[doel].ms && l[kort].ms) l[doel].ms = l[kort].ms; delete l[kort]; }
      kort = doel;
    }
    if (acc){ st.accounts[acc] = kort; if (l[kort]) l[kort].acc = acc; }
    return kort;
  }
  /* Een keer per klas: wie er al dubbel in stond met dezelfde bijnaam, wordt
     samengevoegd onder de oudste regel. */
  samenvoegen(){
    const st = this.stand;
    if (st.samengevoegd) return;
    st.samengevoegd = 1;
    st.alias = st.alias || {};
    const l = st.leerlingen || {}, groep = {};
    Object.keys(l).forEach(k => { const n = normNaam(l[k].naam); (groep[n] = groep[n] || []).push(k); });
    Object.keys(groep).forEach(n => {
      const ks = groep[n].sort((a, b) => (l[a].sinds || 0) - (l[b].sinds || 0));
      const eerste = ks[0];
      ks.slice(1).forEach(k => {
        if (l[eerste].acc && l[k].acc && l[eerste].acc !== l[k].acc) return;   /* twee echte accounts: twee leerlingen */
        st.alias[k] = eerste;
        st.resultaten.forEach(r => { if (r.sid === k) r.sid = eerste; });
        if (!l[eerste].ms && l[k].ms) l[eerste].ms = l[k].ms;
        if (!l[eerste].acc && l[k].acc) l[eerste].acc = l[k].acc;
        delete l[k];
      });
    });
    /* quizuitslagen die de docent eerder invoerde onder een eigen kenmerk, bij de leerling met die bijnaam zetten */
    const perNaam = {}; Object.keys(l).forEach(k => { perNaam[normNaam(l[k].naam)] = k; if (l[k].ms && !perNaam[normNaam(l[k].ms)]) perNaam[normNaam(l[k].ms)] = k; });
    st.resultaten.forEach(r => { if (/^kq-/.test(r.sid) && perNaam[normNaam(r.naam)]) r.sid = perNaam[normNaam(r.naam)]; });
  }
  async meld(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (Date.now() - this.stand.laatst > KLAS_SLAAPT) return json({ fout: "deze klascode is opgeheven" }, 410);
    const sid = schoon(inz && inz.sid, 40);
    if (!/^[A-Za-z0-9_-]{8,40}$/.test(sid)) return json({ fout: "geen geldig kenmerk" }, 400);
    const spel = String(inz.spel || "");
    if (!SPELLEN_STRIJD[spel] && !KLAS_SPELLEN[spel]) return json({ fout: "onbekend spel" }, 400);
    const acc = /^[0-9a-f]{24}$/.test(String(inz.acc || "")) ? inz.acc : "";
    if (this.isWeg(sid, acc)) return json({ fout: WEG_FOUT, weg: true }, 410);
    const kort = this.klasLeerling(sid.slice(0, 12), inz.naam, acc);
    /* wie er al in zit mag altijd blijven melden; alleen een nieuwe erbij kan geweigerd worden */
    const bekend = (this.stand.leerlingen && this.stand.leerlingen[kort]) || this.stand.resultaten.some(r => r.sid === kort);
    if (!bekend){
      const wie = new Set(this.stand.resultaten.map(r => r.sid));
      Object.keys(this.stand.leerlingen || {}).forEach(x => wie.add(x));
      if (wie.size >= KLAS_LEERLINGEN) return json({ fout: "deze klas zit vol" }, 429);
    }
    this.stand.leerlingen = this.stand.leerlingen || {};
    if (!this.stand.leerlingen[kort]) this.stand.leerlingen[kort] = { naam: nette(inz.naam, "Leerling"), av: schoonAv(inz.av), sinds: Date.now(), t: Date.now() };
    else this.stand.leerlingen[kort].t = Date.now();
    /* ingelogd: de accountnaam ook bij een uitslag bijwerken */
    const msM = schoon(inz.ms, 40);
    if (msM) this.stand.leerlingen[kort].ms = msM;
    if (acc) this.stand.leerlingen[kort].acc = acc;
    this.voegToe(Object.assign({ sid: kort, naam: nette(inz.naam, "Leerling"), av: schoonAv(inz.av), spel, ronde: getal(inz.ronde, 250), punten: getal(inz.punten, 5000),
                   niveau: schoon(inz.niveau, 10), vak: schoon(inz.vak, 10), od: schoonOd(inz.od), t: Date.now() }, spel === "dictee" ? dicteeVelden(inz) : {}));
    this.telFk(kort, schoonFk(inz.fk));
    this.snoei();
    await this.zetAlarm({ wat: "opruimen" }, KLAS_SLAAPT);
    await this.bewaar();
    return json({ ok: true, n: this.stand.resultaten.length });
  }
  /* Wat bespreek ik morgen: per vraag hoe vaak hij fout ging, door hoeveel
     leerlingen, en welke foute antwoorden ze kozen. Opgeteld, niet per potje,
     zodat het klein blijft. */
  telFk(sid, lijst){
    if (!lijst.length) return;
    const st = this.stand, nu = Date.now();
    st.fk = st.fk || {};
    for (const x of lijst){
      const e = st.fk[x.h] = st.fk[x.h] || { v: x.v, g: x.g, vak: x.vak, n: 0, a: {}, l: [], t: nu };
      e.n++; e.t = nu;
      if (e.a[x.a] || Object.keys(e.a).length < 4) e.a[x.a] = (e.a[x.a] || 0) + 1;
      const wie = sid.slice(0, 8);
      if (e.l.indexOf(wie) < 0 && e.l.length < 40) e.l.push(wie);
    }
    const sl = Object.keys(st.fk);
    if (sl.length > FK_MAX) sl.sort((p, q) => st.fk[p].t - st.fk[q].t).slice(0, sl.length - FK_MAX).forEach(k => { delete st.fk[k]; });
  }
  /* de docent heeft een vraag besproken: hij gaat van de lijst (h '*' is alles) */
  async besproken(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    const h = String(inz.h || "");
    if (h === "*") this.stand.fk = {}; else if (this.stand.fk) delete this.stand.fk[h.replace(/[^a-z0-9]/g, "").slice(0, 12)];
    await this.bewaar();
    return json({ ok: true, fk: this.fkLijst() });
  }
  fkLijst(){
    const fk = this.stand.fk || {};
    return Object.keys(fk).map(h => ({ h, v: fk[h].v, g: fk[h].g, vak: fk[h].vak, n: fk[h].n, a: fk[h].a, ll: fk[h].l.length, t: fk[h].t }))
      .sort((p, q) => q.ll - p.ll || q.n - p.n || q.t - p.t).slice(0, 40);
  }
  /* Een leerling meldt zich zodra hij de klascode invult, nog voor hij iets
     speelt. Zo ziet de docent aan het begin van de les wie er binnen is. */
  async hoi(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (Date.now() - this.stand.laatst > KLAS_SLAAPT) return json({ fout: "deze klascode is opgeheven" }, 410);
    const sid = schoon(inz && inz.sid, 40);
    if (!/^[A-Za-z0-9_-]{8,40}$/.test(sid)) return json({ fout: "geen geldig kenmerk" }, 400);
    const acc = /^[0-9a-f]{24}$/.test(String(inz.acc || "")) ? inz.acc : "";
    /* door de docent weggehaald: alleen wie de code zelf opnieuw invult (nieuw) komt terug */
    if (this.isWeg(sid, acc)){
      if (!inz.nieuw) return json({ fout: WEG_FOUT, weg: true }, 410);
      this.nietMeerWeg(sid, acc);
    }
    const kort = this.klasLeerling(sid.slice(0, 12), inz.naam, acc);
    if (!this.stand.leerlingen[kort] && Object.keys(this.stand.leerlingen).length >= KLAS_LEERLINGEN) return json({ fout: "deze klas zit vol" }, 429);
    const was = this.stand.leerlingen[kort];
    /* ms is de naam van het Microsoft-account, door index.js uit het
       sessiekoekje gehaald. Is die er niet (niet ingelogd), dan blijft staan
       wat er stond: uitloggen hoort de docent niet meteen zijn zicht te kosten. */
    const ms = schoon(inz.ms, 40) || (was && was.ms) || "";
    this.stand.leerlingen[kort] = { naam: nette(inz.naam, "Leerling"), av: schoonAv(inz.av), ms, acc: acc || (was && was.acc) || "",
                                    sinds: was && was.sinds || Date.now(), t: Date.now() };
    await this.zetAlarm({ wat: "opruimen" }, KLAS_SLAAPT);
    await this.bewaar();
    return json({ ok: true, n: Object.keys(this.stand.leerlingen).length });
  }
  /* per leerling per spel hoogstens dertig potjes, en een plafond voor de hele klas */
  voegToe(r){
    const mijn = this.stand.resultaten.filter(x => x.sid === r.sid && x.spel === r.spel);
    if (mijn.length >= 30) this.stand.resultaten.splice(this.stand.resultaten.indexOf(mijn[0]), 1);
    this.stand.resultaten.push(r);
    if (this.stand.resultaten.length > KLAS_MAX) this.stand.resultaten.splice(0, this.stand.resultaten.length - KLAS_MAX);
  }
  /* De hele klas staat in een opslagwaarde, en die mag hoogstens twee
     megabyte zijn; daarboven mislukt elk bewaren en is de klas stuk. Drieduizend
     uitslagen met lange onderdelen en foutenlijsten kwamen op negen megabyte.
     Dus ook een plafond in tekens (een teken kan twee bytes zijn, en de
     leerlingenlijst komt er nog bij): de oudste uitslagen gaan er eerst uit.
     Een keer na elke melding, niet per uitslag. */
  snoei(){
    let n = JSON.stringify(this.stand.resultaten).length, weg = 0;
    while (n > KLAS_BYTES && weg < this.stand.resultaten.length - 1) n -= JSON.stringify(this.stand.resultaten[weg++]).length + 1;
    if (weg) this.stand.resultaten.splice(0, weg);
  }
  /* De docent meldt een hele uitslag ineens, bijvoorbeeld van een Klasquiz:
     alleen met de sleutel van de klas. Het kenmerk per leerling komt uit de
     bijnaam, zodat dezelfde bijnaam bij dezelfde leerling terechtkomt. */
  async melden(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (Date.now() - this.stand.laatst > KLAS_SLAAPT) return json({ fout: "deze klascode is opgeheven" }, 410);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    const spel = String(inz.spel || "");
    if (!SPELLEN_STRIJD[spel] && !KLAS_SPELLEN[spel]) return json({ fout: "onbekend spel" }, 400);
    const lijst = Array.isArray(inz.lijst) ? inz.lijst.slice(0, 80) : [];
    if (!lijst.length) return json({ fout: "geen uitslag" }, 400);
    const t = Date.now();
    let n = 0;
    /* Kwam de uitslag uit een Klasquiz-kamer, dan weet die kamer per speler het
       kenmerk van zijn apparaat: hetzelfde kenmerk waarmee de leerling aan deze
       klas gekoppeld is. We vragen het daar op, binnen de server; het kenmerk
       zelf gaat nooit naar de browser van de docent. */
    let perPid = {};
    const quiz = String(inz.quiz || "").toUpperCase();
    if (/^[A-Z]{4}$/.test(quiz) && typeof inz.quizSleutel === "string" && this.env && this.env.KAMERS){
      try {
        const r = await this.env.KAMERS.get(this.env.KAMERS.idFromName(quiz)).fetch("https://kamer/quizkenmerken", { method: "POST", body: JSON.stringify({ sleutel: inz.quizSleutel }) });
        if (r.ok){ const j = await r.json(); if (j && j.kenmerken && typeof j.kenmerken === "object") perPid = j.kenmerken; }
      } catch (e){ /* geen antwoord van de quiz: dan op naam, zoals eerder */ }
    }
    const st = this.stand, l0 = st.leerlingen || {}, alias = st.alias || {};
    for (const r of lijst){
      const naam = nette(r && r.naam, "");
      if (!naam) continue;
      /* 1. op kenmerk: dezelfde leerling, welke naam hij in de quiz ook koos */
      let bekend = null;
      const kenmerk = perPid[String(r && r.pid || "")];
      if (kenmerk){ const k = alias[kenmerk] || kenmerk; if (l0[k] || st.resultaten.some(x => x.sid === k)) bekend = k; }
      /* 2. op naam: de bijnaam of de Microsoft-naam van een leerling in de klas */
      if (!bekend) bekend = Object.keys(l0).find(k => normNaam(l0[k].naam) === normNaam(naam) || (l0[k].ms && normNaam(l0[k].ms) === normNaam(naam))) || null;
      const sid = bekend || ("kq-" + naam.toLowerCase().replace(/[^a-z0-9]/g, "") + "xxxxxxxx").slice(0, 12);
      this.voegToe({ sid, naam, av: schoonAv(r.av), spel, ronde: getal(r.ronde, 250), punten: getal(r.punten, 5000), niveau: schoon(inz.niveau, 10), vak: schoon(inz.vak, 10), od: schoonOd(r.od), t });
      n++;
    }
    this.snoei();
    await this.zetAlarm({ wat: "opruimen" }, KLAS_SLAAPT);
    await this.bewaar();
    return json({ ok: true, n });
  }
  /* Voor melden(): welk klaskenmerk hoort bij welke speler van deze quiz. Alleen
     bereikbaar vanuit een andere kamer (index.js stuurt dit pad niet door) en
     alleen met de sleutel van de quiz, die de docent heeft. */
  async quizKenmerken(inz){
    if (!this.stand || !this.stand.spelers || this.stand.spel === "klas") return json({ fout: "geen quiz" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw kamer" }, 403);
    const kenmerken = {};
    Object.keys(this.stand.spelers).forEach(sid => { const p = this.stand.spelers[sid].pid; if (p) kenmerken[p] = sid.slice(0, 12); });
    return json({ kenmerken });
  }
  /* De opdracht van de docent: een spel, een vak, eventueel een onderdeel, een minimum en een einddatum.
     Leerlingen zien hem in de leeromgeving; wie hem haalt staat in het klasoverzicht aangevinkt. */
  /* de opdrachten van deze klas, ook als ze er nog als een losse opdracht staan */
  opdrachtLijst(){
    const st = this.stand;
    if (!Array.isArray(st.opdrachten)){
      st.opdrachten = st.opdracht ? [Object.assign({ id: "o1" }, st.opdracht)] : [];
      delete st.opdracht;
    }
    return st.opdrachten;
  }
  async opdracht(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    const lijst = this.opdrachtLijst();
    /* een weghalen */
    if (inz.weg){
      this.stand.opdrachten = lijst.filter(x => x.id !== String(inz.weg));
      await this.bewaar();
      return json({ ok: true, opdrachten: this.stand.opdrachten });
    }
    const o = inz.opdracht;
    /* een oudere pagina haalt met null alles weg */
    if (!o){ this.stand.opdrachten = []; await this.bewaar(); return json({ ok: true, opdracht: null, opdrachten: [] }); }
    if (lijst.length >= OPDRACHTEN_MAX) return json({ fout: "er staan al " + OPDRACHTEN_MAX + " opdrachten; haal er eerst een weg" }, 400);
    const spel = String(o.spel || ""), vak = String(o.vak || "").replace(/[^a-z]/g, "").slice(0, 8), deel = schoon(o.deel, 40);
    if (!OPDRACHT_SPELLEN[spel]) return json({ fout: "dit spel kan geen opdracht zijn" }, 400);
    if (spel === "dictee"){
      const d = this.dicteeOpdracht(o);
      if (d.fout) return json({ fout: d.fout }, 400);
      lijst.push(d);
      await this.bewaar();
      return json({ ok: true, opdracht: opdrachtNu(d, Date.now()), opdrachten: lijst.map(x => opdrachtNu(x, Date.now())) });
    }
    if (!vak) return json({ fout: "kies een vak" }, 400);
    const min = getal(o.min, 250), tot = getal(o.tot, 4e12);
    if (min < 1) return json({ fout: "het minimum is minstens 1" }, 400);
    if (tot < Date.now() - 3600000 || tot > Date.now() + 120 * 86400000) return json({ fout: "kies een datum binnen vier maanden" }, 400);
    const nieuw = { id: sleutelMaken(3), spel, vak, deel, deelNaam: schoon(o.deelNaam, 60), min, tot, tekst: schoon(o.tekst, 140), sinds: Date.now() };
    lijst.push(nieuw);
    await this.bewaar();
    return json({ ok: true, opdracht: nieuw, opdrachten: lijst.map(x => opdrachtNu(x, Date.now())) });
  }
  /* Een dictee als opdracht, schoon en gecontroleerd. De titel komt van de pagina
     van de docent (uit de tekstbank of de naam van zijn eigen dictee) en is
     alleen om te tonen; wat telt is de bron met de tekst of de week. */
  dicteeOpdracht(o){
    const nu = Date.now();
    const bron = DICTEE_BRONNEN[o.bron] ? String(o.bron) : "";
    if (!bron) return { fout: "kies waar het dictee vandaan komt: de tekst van de week, een tekst uit de lijst of een eigen dictee" };
    const niveau = DICTEE_NIVEAUS[o.niveau] ? String(o.niveau) : "";
    const w = dicteeWeek(nu);
    const d = { id: sleutelMaken(3), spel: "dictee", vak: "ned", deel: "", deelNaam: "", min: 1, bron, niveau,
                titel: schoon(o.titel, 80), tekst: schoon(o.tekst, 140), sinds: nu };
    /* de einddatum: gekozen, of anders zondag 23:59 van deze week */
    let tot = o.tot === undefined || o.tot === null || o.tot === "" ? w.tot : getal(o.tot, 4e12);
    if (bron === "week"){
      if (!niveau) return { fout: "kies het niveau: bij elk niveau hoort een andere tekst van de week" };
      if (o.auto === true) return Object.assign(d, { auto: true, week: w.sleutel, weekNr: w.nr, sinds: w.van, tot: w.tot });
      /* een keer: deze week, en wat de leerling sinds maandag al deed telt mee */
      Object.assign(d, { week: w.sleutel, weekNr: w.nr, sinds: w.van });
    } else if (bron === "tekst"){
      const dt = dicteeTekst(o.dt);
      if (!dt || dt.indexOf("eigen-") === 0) return { fout: "kies een tekst uit de lijst" };
      d.dt = dt;
    } else {
      const code = String(o.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!/^[A-Z0-9]{6}$/.test(code)) return { fout: "een eigen dictee heeft een code van zes tekens" };
      d.dt = "eigen-" + code; d.code = code;
    }
    if (tot < nu - 3600000 || tot > nu + 120 * 86400000) return { fout: "kies een datum binnen vier maanden" };
    d.tot = tot;
    return d;
  }
  /* De instellingen van een klas: welke spellen de leerlingen zien, en of de lesmodus aanstaat.
     Leeg lijstje betekent: alles mag. In de lesmodus ziet een gekoppelde leerling alleen die spellen. */
  /* De lesmodus geldt tot het eind van de dag waarop hij aanging: om middernacht,
     Nederlandse tijd, staat hij vanzelf weer uit. Een docent die vergeet hem uit te
     zetten, sluit zo de volgende dag zijn klas niet op in de spellen van gisteren.
     Een klas van voor deze regel (zonder eindtijd) blijft aan tot hij wordt omgezet. */
  lesmodusAan(){ return !!this.stand.lesmodus && (!this.stand.lesmodusTot || Date.now() < this.stand.lesmodusTot); }
  static eindVanDeDag(nu){
    const d = new Date(nu), p = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
      .formatToParts(d).forEach(x => { p[x.type] = x.value; });
    const muur = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    return Date.UTC(+p.year, +p.month - 1, +p.day + 1, 0, 0, 0) - (muur - Math.floor(nu / 1000) * 1000);
  }
  async instelling(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    if (Array.isArray(inz.spellen)) this.stand.spellen = inz.spellen.slice(0, 60).map(x => schoon(x, 30).replace(/[^a-z0-9-]/g, "")).filter(Boolean);
    if (typeof inz.lesmodus === "boolean"){
      this.stand.lesmodus = inz.lesmodus;
      if (inz.lesmodus) this.stand.lesmodusTot = Kamer.eindVanDeDag(Date.now()); else delete this.stand.lesmodusTot;
    }
    /* het klasdoel: zoveel goede antwoorden deze week, samen; 0 zet het uit */
    if (inz.klasdoel !== undefined){
      const d = getal(inz.klasdoel, 20000);
      if (d > 0) this.stand.klasdoel = d; else delete this.stand.klasdoel;
    }
    await this.bewaar();
    return json({ ok: true, spellen: this.stand.spellen || [], lesmodus: this.lesmodusAan(), lesmodusTot: this.lesmodusAan() ? (this.stand.lesmodusTot || 0) : 0, klasdoel: this.klasdoelStand() });
  }
  /* De periodes van de docent: zelf ingestelde stukken van het jaar, met een
     naam en een begin- en einddatum. Ze doen niets met wat er bewaard wordt;
     ze zijn er om het overzicht mee te filteren, zodat je "periode 2" kunt
     bekijken zonder de rest van het jaar erbij. De hele lijst gaat in een keer
     heen en weer: dat is minder verkeer dan per periode een verzoek, en de
     docent bewerkt ze toch als een lijstje. */
  async periodes(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    if (!Array.isArray(inz.periodes)) return json({ fout: "geen periodes" }, 400);
    const grens = 3 * 365 * 86400000, nu = Date.now();
    const uit = [];
    for (const p of inz.periodes.slice(0, PERIODES_MAX)){
      const naam = schoon(p && p.naam, PERIODE_NAAM);
      const van = getal(p && p.van, 4e12), tot = getal(p && p.tot, 4e12);
      if (!naam) return json({ fout: "geef elke periode een naam" }, 400);
      if (!van || !tot || tot <= van) return json({ fout: "de einddatum van " + naam + " ligt voor de begindatum" }, 400);
      if (van < nu - grens || tot > nu + grens) return json({ fout: naam + " ligt te ver weg; houd het binnen drie jaar" }, 400);
      uit.push({ id: schoon(p.id, 12).replace(/[^a-z0-9]/gi, "") || ("p" + uit.length + Math.random().toString(36).slice(2, 6)), naam, van, tot });
    }
    this.stand.periodes = uit;
    await this.bewaar();
    return json({ ok: true, periodes: uit });
  }
  /* Een klas een andere naam geven, bijvoorbeeld van B2 naar B3 als het
     schooljaar om is. De naam staat hier, bij de klas; de pagina van de
     docent neemt hem over zodra hij de klas opent, ook op zijn andere apparaten. */
  async klasNaam(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    const naam = schoon(inz.naam, 40).trim();
    if (naam.length < 2) return json({ fout: "geef je klas een naam van minstens twee tekens" }, 400);
    this.stand.naam = naam;
    await this.bewaar();
    return json({ ok: true, naam });
  }
  /* heeft een leerling (op kenmerk) de opdracht gehaald? Zonder sleutel: alleen zijn eigen stand. */
  /* De echte namen bij de bijnamen. Leerlingen spelen met een bijnaam; de
     docent wil in het overzicht weten wie dat is. De lijst gaat alleen mee
     naar wie de sleutel heeft, nooit naar een leerling. Een lege naam haalt
     hem weg. De hele lijst gaat in een keer, net als de periodes. */
  async echteNamen(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    const binnen = inz.namen && typeof inz.namen === "object" ? inz.namen : {};
    const uit = {}; let n = 0;
    for (const k of Object.keys(binnen)){
      if (n >= 80) break;
      const bij = schoon(k, 40), echt = schoon(binnen[k], 60);
      if (!bij || !echt) continue;
      uit[bij] = echt; n++;
    }
    if (n) this.stand.echt = uit; else delete this.stand.echt;
    await this.bewaar();
    return json({ ok: true, echt: this.stand.echt || {} });
  }
  /* het klasdoel van deze week: het doel, hoe ver de klas is, en (met een kenmerk) wat jij bijdroeg */
  klasdoelStand(sid){
    const doel = this.stand.klasdoel;
    if (!doel) return null;
    const van = weekBegin(Date.now());
    let stand = 0, jij = 0;
    for (const r of this.stand.resultaten){
      if (r.t < van) continue;
      const n = goedVan(r);
      stand += n;
      if (sid && r.sid === sid) jij += n;
    }
    return { doel, stand, jij: sid ? jij : undefined, vanaf: van };
  }
  mijn(sid){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    let s = schoon(sid, 40).slice(0, 12);
    if (this.isWeg(s)) return json({ fout: WEG_FOUT, weg: true }, 410);
    /* een tweede apparaat dat al is samengevoegd, ziet de voortgang van de leerling zelf */
    if (this.stand.alias && this.stand.alias[s]) s = this.stand.alias[s];
    const opzet = { spellen: this.stand.spellen || [], lesmodus: this.lesmodusAan(), naam: this.stand.naam,
      /* zat deze leerling bij de eigenaar van de site in de klas? */
      oudleerling: !!this.stand.vanEigenaar, klasdoel: this.klasdoelStand(s) };
    const mijn = this.stand.resultaten.filter(r => r.sid === s);
    const nu = Date.now();
    const lijst = this.opdrachtLijst().map(o0 => {
      const o = opdrachtNu(o0, nu);
      const x = Object.assign({}, o, { gehaald: mijn.some(r => haaltOpdracht(r, o)), beste: mijn.reduce((a, r) => Math.max(a, maatVoor(r, o)), 0) });
      /* bij het dictee ook hoeveel woorden goed, van de beste keer */
      if (o.spel === "dictee"){
        const s = mijn.filter(r => dicteePast(r, o)).map(dicteeScore).filter(Boolean).sort((a, b) => b[0] / b[1] - a[0] / a[1])[0];
        if (s) x.score = s;
      }
      return x;
    });
    /* de eerste ook los, voor een pagina van voor de lijst */
    const eerste = lijst[0] || null;
    return json(Object.assign({ opdrachten: lijst, opdracht: eerste, gehaald: eerste ? eerste.gehaald : false, beste: eerste ? eerste.beste : 0 }, opzet));
  }
  /* Een leerling uit de klas halen: hij verdwijnt uit de lijst en zijn
     uitslagen gaan mee. Hij kan zich daarna gewoon opnieuw koppelen met de
     code, want dit is bedoeld voor wie er per ongeluk in zit, niet als straf. */
  async leerlingWeg(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    const id = schoon(inz.id, 12);
    if (!id) return json({ fout: "geen leerling" }, 400);
    const l = this.stand.leerlingen || {};
    const had = !!l[id];
    const acc = had ? l[id].acc || "" : "";
    delete l[id];
    /* ook de verwijzingen van andere apparaten en het account, anders komt hij via die weg terug */
    const st = this.stand;
    /* En onthouden dat hij weg is. Anders zwaait zijn leeromgeving bij het
       volgende bezoek weer (hoi) of meldt een potje uit de wachtrij, en staat
       hij er meteen weer in. Opnieuw koppelen met de code kan wel. */
    st.weg = st.weg || {};
    const nu = Date.now();
    st.weg[id] = nu;
    Object.keys(st.alias || {}).forEach(k => { if (st.alias[k] === id){ st.weg[k] = nu; delete st.alias[k]; } });
    Object.keys(st.accounts || {}).forEach(a => { if (st.accounts[a] === id){ st.weg["acc:" + a] = nu; delete st.accounts[a]; } });
    if (acc) st.weg["acc:" + acc] = nu;
    const wegLijst = Object.keys(st.weg);
    if (wegLijst.length > 400) wegLijst.sort((a, b) => st.weg[a] - st.weg[b]).slice(0, wegLijst.length - 400).forEach(k => { delete st.weg[k]; });
    const voor = this.stand.resultaten.length;
    this.stand.resultaten = this.stand.resultaten.filter(r => r.sid !== id);
    if (!had && voor === this.stand.resultaten.length) return json({ fout: "die leerling zit niet in deze klas" }, 404);
    await this.bewaar();
    return json({ ok: true, weg: voor - this.stand.resultaten.length, leerlingen: this.gekoppeld() });
  }
  /* de docent heft de klascode op: alles weg, en de leerlingen merken het bij hun volgende melding */
  async opheffen(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    this.stand = null;
    await this.ctx.storage.deleteAll();
    return json({ ok: true });
  }
  async resultaten(sleutel, eigenaar){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!sleutel || sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    /* de eigenaar van de site opent zijn eigen klas: dan krijgen de leerlingen alsnog wat erbij hoort (zie index.js) */
    if (eigenaar && !this.stand.vanEigenaar){ this.stand.vanEigenaar = true; await this.bewaar(); }
    /* oude dubbelingen eerst samenvoegen, zodat de uitslagen hieronder al goed staan */
    if (!this.stand.samengevoegd){ this.samenvoegen(); await this.bewaar(); }
    /* kijken telt ook als gebruik, hoogstens een keer per uur bijgeschreven */
    if (Date.now() - this.stand.laatst > 3600000){ await this.zetAlarm({ wat: "opruimen" }, KLAS_SLAAPT); await this.bewaar(); }
    const opdrachten = this.opdrachtLijst().map(o => opdrachtNu(o, Date.now()));
    return json({ code: this.stand.code, naam: this.stand.naam, gemaakt: this.stand.gemaakt, opdracht: opdrachten[0] || null, opdrachten,
                  klasdoel: this.klasdoelStand(),
                  spellen: this.stand.spellen || [], lesmodus: this.lesmodusAan(), lesmodusTot: this.lesmodusAan() ? (this.stand.lesmodusTot || 0) : 0,
                  periodes: this.stand.periodes || [], echt: this.stand.echt || {}, fk: this.fkLijst(),
                  leerlingen: this.gekoppeld(),
                  /* elke uitslag onder de huidige bijnaam van de leerling: wie van naam wisselde of op een tweede apparaat speelde, staat er zo een keer in */
                  /* ingelogd met Microsoft: de docent ziet de accountnaam, niet de bijnaam */
                  /* bij het dictee ook de tekst, de week, de woorden goed en welke fout gingen */
                  resultaten: this.stand.resultaten.map(x => Object.assign({ naam: (l => l.ms || l.naam)((this.stand.leerlingen || {})[x.sid] || {}) || x.naam, av: x.av || "", spel: x.spel, ronde: x.ronde, punten: x.punten, niveau: x.niveau, vak: x.vak, od: x.od, t: x.t },
                    x.spel === "dictee" ? { dt: x.dt, wk: x.wk, gw: x.gw, tw: x.tw, fw: x.fw } : {})) });
  }

  /* Wie is er gekoppeld, en heeft die al iets gespeeld? Het kenmerk zelf gaat
     niet mee naar buiten; de docent heeft genoeg aan de naam en het vlaggetje. */
  gekoppeld(){
    this.samenvoegen();
    const gespeeld = new Set((this.stand.resultaten || []).map(r => r.sid));
    const l = this.stand.leerlingen || {};
    return Object.keys(l).map(s => ({ id: s, naam: l[s].ms || l[s].naam, bijnaam: l[s].ms ? l[s].naam : "", av: l[s].av || "", ms: l[s].ms || "", sinds: l[s].sinds, gespeeld: gespeeld.has(s) }))
      .sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
  }
  aanwezig(sid){ return this.ctx.getWebSockets(sid).length > 0; }
  overzicht(){
    const st = this.stand, basis = { code: st.code, spel: st.spel, vak: st.vak, niveau: st.niveau, deel: st.deel || "", fase: st.fase };
    /* verhuisd naar een nieuwe kamer: wie de oude code nog intypt, kan door naar de nieuwe */
    if (st.verhuis) basis.verhuis = st.verhuis;
    if (st.spel === "klas") return Object.assign(basis, { naam: st.naam, n: st.resultaten.length, gemaakt: st.gemaakt, opdracht: opdrachtNu(this.opdrachtLijst()[0], Date.now()) || null });
    if (this.strijd){
      const lijst = this.strijdLijst();
      return Object.assign(basis, { game: st.game, modus: st.modus || undefined, duel: !!st.duel, max: st.duel ? this.samenMax() : undefined, gastheer: st.gastheer ? this.pid(st.gastheer) : null, gestart: st.gestart, bezig: lijst.filter(r => !r.af).length, spelers: lijst });
    }
    if (this.rollen){
      return Object.assign(basis, { game: st.game, gestart: st.gestart, spelers: Object.keys(st.spelers).map(sid => {
        const sp = st.spelers[sid];
        return { sid: sp.pid, naam: sp.naam, av: sp.av || "", aan: this.aanwezig(sid), rol: sp.kaart && sp.kaart.rol ? sp.kaart.rol : null };
      }).sort((a, b) => a.naam.localeCompare(b.naam)) });
    }
    return Object.assign(basis, { onderdeel: st.onderdeel, i: st.i, n: st.vragen.length, tijd: st.tijd,
      spelers: this.ranglijst().map(r => ({ sid: r.sid, naam: r.naam, av: r.av, score: r.score, aan: r.aan })) });
  }
  zegSpelers(){
    if (!this.stand) return;
    this.naarHost({ t: "spelers", spelers: this.overzicht().spelers });
  }
  stuur(ws, bericht){ try { ws.send(JSON.stringify(bericht)); } catch (e){} }
  iedereen(bericht){ const s = JSON.stringify(bericht); this.ctx.getWebSockets().forEach(ws => { try { ws.send(s); } catch (e){} }); }
  naarHost(bericht){ const s = JSON.stringify(bericht); this.ctx.getWebSockets("host").forEach(ws => { try { ws.send(s); } catch (e){} }); }
}
