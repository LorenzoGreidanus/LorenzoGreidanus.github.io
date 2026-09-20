/* Een toets op de vragenbank: node server/audit-bank.js
   Meldt dubbele vragen (binnen een vak), dubbele antwoordopties, een goed
   antwoord buiten de opties, te lange vragen of opties, onderdelen die niet
   in ONDERDELEN staan, onderdelen met te weinig vragen, en niveau-lijsten die
   niet even lang zijn als hun vragenlijst.

   En sinds kort: of het juiste antwoord niet steeds het langste is. Wie dat
   patroon doorheeft hoeft de stof niet te kennen; hij kiest het antwoord met
   de meeste woorden en heeft vaker gelijk dan goed is. Verandert niets;
   alleen een verslag. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const MAX_VRAAG = 170, MAX_OPTIE = 70, MIN_PER_ONDERDEEL = 15;
/* Wanneer steekt het goede antwoord er te ver bovenuit? Pas als het zowel
   flink langer is dan de langste afleider als anderhalf keer zo lang: een
   antwoord van 30 tekens naast een van 18 valt op, 42 naast 40 niet. */
const UIT_TEKENS = 12, UIT_KEER = 1.5;
/* En per vak: hoe vaak mag het goede antwoord het langste zijn? Bij vier
   opties is dat door het toeval al een op de vier. Meer dan tien punten
   daarboven is geen toeval meer maar een patroon om mee te raden.

   Ver eronder is net zo goed een patroon: wie merkt dat het langste antwoord
   bijna nooit goed is, streept dat voortaan weg en houdt drie opties over.
   De grens geldt dus naar twee kanten. */
const LENGTE_MARGE = 10;
/* De vragen zelf staan sinds de splitsing in bank-<vak>.js; bank.js houdt
   alleen nog de lijsten en de laadcode. Dus eerst bank.js, dan alle delen. */
const MAP = path.join(__dirname, "..", "leermiddelen");
const ctx = { window: {}, console };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(MAP, "bank.js"), "utf8"), ctx);
for (const deel of fs.readdirSync(MAP).filter(f => /^bank-.+[.]js$/.test(f)).sort()){
  vm.runInContext(fs.readFileSync(path.join(MAP, deel), "utf8"), ctx);
}
vm.runInContext("this.__uit = { VAKKEN, ONDERDELEN, BRONNEN, NIVOS, NIVEAUS };", ctx);
const { VAKKEN, ONDERDELEN, BRONNEN, NIVOS } = ctx.__uit;

const norm = t => String(t || "").toLowerCase().replace(/\s+/g, " ").trim();   /* leestekens tellen mee: bij leestekenvragen zit daar juist het verschil */
const fouten = [], waarschuwingen = [], lengteRegels = [];
let totaal = 0, plaatjes = 0;

for (const vak of Object.keys(BRONNEN)){
  const lijst = BRONNEN[vak], nivo = NIVOS[vak] || [];
  totaal += lijst.length;
  if (nivo.length !== lijst.length) fouten.push(`${vak}: ${lijst.length} vragen maar ${nivo.length} niveaus`);
  const gezien = new Map(), zelfdeVraag = new Map(), perOnderdeel = {};
  let lengteTeller = 0, lengteKans = 0, lengteMee = 0;   /* voor de telling "is het goede antwoord het langste?" */
  const bekend = new Set((ONDERDELEN[vak] || []).map(o => o.id));
  lijst.forEach((q, i) => {
    const waar = `${vak}[${i}] "${String(q.v).slice(0, 60)}"`;
    if (!q || typeof q.v !== "string" || !Array.isArray(q.o)){ fouten.push(`${waar}: geen geldige vraag`); return; }
    if (q.o.length < 2 || q.o.length > 4) fouten.push(`${waar}: ${q.o.length} opties`);
    if (!(q.g >= 0 && q.g < q.o.length)) fouten.push(`${waar}: goed antwoord g=${q.g} valt buiten de opties`);
    const opt = q.o.map(o => String(o).replace(/\s+/g, " ").trim());   /* hoofdletters tellen mee: bij hoofdlettervragen zit daar het verschil */
    if (new Set(opt).size !== opt.length) fouten.push(`${waar}: dubbele antwoordopties (${q.o.join(" | ")})`);
    if (q.v.length > MAX_VRAAG) waarschuwingen.push(`${waar}: vraag van ${q.v.length} tekens`);
    q.o.forEach(o => { if (String(o).length > MAX_OPTIE) waarschuwingen.push(`${waar}: optie van ${String(o).length} tekens ("${String(o).slice(0, 40)}…")`); });
    if (!q.u) waarschuwingen.push(`${waar}: geen uitleg`);
    /* Is het goede antwoord het langste? Wie dat patroon doorheeft raadt goed
       zonder de stof te kennen. We tellen het per vak en melden de vragen waar
       het goede antwoord er echt uit springt. */
    /* Vragen met een plaatje tellen niet mee. Daar is het antwoord de naam van
       een land, en aan de lengte van "Griekenland" naast "Finland" valt niets
       te doen: je kunt een land niet anders noemen om de rij gelijk te maken.
       Ze meetellen zou de cijfers van aardrijkskunde alleen maar vertroebelen. */
    if (q.vlag || q.svg) plaatjes++;
    else if (Array.isArray(q.o) && q.o.length > 1 && q.g >= 0 && q.g < q.o.length){
      const lengtes = q.o.map(o => String(o).length);
      const langste = Math.max(...lengtes);
      const langsteAnder = Math.max(...lengtes.filter((_, j) => j !== q.g));
      /* Alleen vragen waar een van de vier er echt als langste uitspringt
         tellen mee. Staan er vier even lange antwoorden (bij wiskunde vaak
         vier getallen), dan valt er niets te tellen en zou zo'n vraag de
         verhouding alleen maar vertroebelen. */
      if (lengtes.filter(x => x === langste).length !== 1) return;
      lengteMee++;
      lengteKans += 1 / q.o.length;
      if (lengtes[q.g] === langste){
        lengteTeller++;
        if (lengtes[q.g] >= langsteAnder + UIT_TEKENS && lengtes[q.g] >= langsteAnder * UIT_KEER){
          waarschuwingen.push(`${waar}: het goede antwoord is ${lengtes[q.g]} tekens, de langste afleider ${langsteAnder}`);
        }
      }
    }
    const t = q.t || "overig";
    perOnderdeel[t] = (perOnderdeel[t] || 0) + 1;
    if (vak !== "ges" && !bekend.has(t)) fouten.push(`${waar}: onderdeel "${t}" staat niet in ONDERDELEN.${vak}`);
    const sleutel = norm(q.v) + " || " + q.o.map(norm).sort().join(" | ") + " || " + (q.vlag || "") + (q.svg ? "svg" : "");   /* dezelfde vraag met andere opties is een andere vraag */
    if (gezien.has(sleutel)) fouten.push(`${waar}: dubbel met ${vak}[${gezien.get(sleutel)}]`);
    else gezien.set(sleutel, i);
    /* Dezelfde vraag met andere antwoorden is geen dubbeling, maar wel
       verwarrend: een leerling krijgt twee keer hetzelfde gevraagd en moet de
       ene keer iets anders aanklikken dan de andere. Bij een vraag met een
       plaatje erbij ("Van welk land is deze vlag?") ligt dat anders: daar
       zit de vraag in het plaatje en hoort de tekst juist hetzelfde te zijn. */
    const vraagSleutel = (q.vlag || q.svg) ? null : norm(q.v);
    if (vraagSleutel !== null){
      if (zelfdeVraag.has(vraagSleutel)) waarschuwingen.push(`${waar}: zelfde vraag als ${vak}[${zelfdeVraag.get(vraagSleutel)}], met andere antwoorden`);
      else zelfdeVraag.set(vraagSleutel, i);
    }
  });
  if (lengteMee){
    const deel = 100 * lengteTeller / lengteMee, toeval = 100 * lengteKans / lengteMee;
    lengteRegels.push({ vak, deel, toeval, aantal: lengteMee, teller: lengteTeller });
    if (deel > toeval + LENGTE_MARGE){
      waarschuwingen.push(`${vak}: bij ${deel.toFixed(0)}% van de vragen is het goede antwoord het langste (door toeval zou dat ${toeval.toFixed(0)}% zijn)`);
    } else if (deel < toeval - LENGTE_MARGE){
      waarschuwingen.push(`${vak}: bij maar ${deel.toFixed(0)}% van de vragen is het goede antwoord het langste (door toeval zou dat ${toeval.toFixed(0)}% zijn); het langste antwoord wegstrepen loont nu`);
    }
  }
  for (const o of (ONDERDELEN[vak] || [])){
    const n = perOnderdeel[o.id] || 0;
    if (n < MIN_PER_ONDERDEEL) waarschuwingen.push(`${vak}/${o.id}: maar ${n} vragen (minder dan ${MIN_PER_ONDERDEEL})`);
  }
}

console.log(`Vragenbank: ${totaal} vragen in ${Object.keys(BRONNEN).length} vakken.`);
console.log(`\nFouten (${fouten.length}):`);
fouten.forEach(f => console.log("  - " + f));
console.log(`\nWaarschuwingen (${waarschuwingen.length}):`);
waarschuwingen.forEach(w => console.log("  - " + w));

console.log("");
console.log("Is het goede antwoord het langste?");
console.log("(vragen met een plaatje tellen niet mee: " + plaatjes + " stuks)");
let mee = 0, raak = 0, kans = 0;
for (const r of lengteRegels){
  mee += r.aantal; raak += r.teller; kans += r.toeval * r.aantal / 100;
  const vlag = r.deel > r.toeval + LENGTE_MARGE ? "   te vaak" : r.deel < r.toeval - LENGTE_MARGE ? "   te zelden" : "";
  console.log(`  ${r.vak.padEnd(6)}${String(r.aantal).padStart(5)} vragen   ${r.deel.toFixed(0).padStart(3)}%   (toeval ${r.toeval.toFixed(0)}%)${vlag}`);
}
if (mee) console.log(`  ${"samen".padEnd(6)}${String(mee).padStart(5)} vragen   ${(100 * raak / mee).toFixed(0).padStart(3)}%   (toeval ${(100 * kans / mee).toFixed(0)}%)`);
process.exitCode = fouten.length ? 1 : 0;
