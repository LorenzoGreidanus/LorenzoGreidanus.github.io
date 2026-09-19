/* Een toets op de vragenbank: node server/audit-bank.js
   Meldt dubbele vragen (binnen een vak), dubbele antwoordopties, een goed
   antwoord buiten de opties, te lange vragen of opties, onderdelen die niet
   in ONDERDELEN staan, onderdelen met te weinig vragen, en niveau-lijsten die
   niet even lang zijn als hun vragenlijst. Verandert niets; alleen een verslag. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const MAX_VRAAG = 170, MAX_OPTIE = 70, MIN_PER_ONDERDEEL = 15;
const bron = fs.readFileSync(path.join(__dirname, "..", "leermiddelen", "bank.js"), "utf8");
const ctx = { window: {}, console };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(bron + "\n;this.__uit = { VAKKEN, ONDERDELEN, BRONNEN, NIVOS, NIVEAUS };", ctx);
const { VAKKEN, ONDERDELEN, BRONNEN, NIVOS } = ctx.__uit;

const norm = t => String(t || "").toLowerCase().replace(/\s+/g, " ").trim();   /* leestekens tellen mee: bij leestekenvragen zit daar juist het verschil */
const fouten = [], waarschuwingen = [];
let totaal = 0;

for (const vak of Object.keys(BRONNEN)){
  const lijst = BRONNEN[vak], nivo = NIVOS[vak] || [];
  totaal += lijst.length;
  if (nivo.length !== lijst.length) fouten.push(`${vak}: ${lijst.length} vragen maar ${nivo.length} niveaus`);
  const gezien = new Map(), perOnderdeel = {};
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
    const t = q.t || "overig";
    perOnderdeel[t] = (perOnderdeel[t] || 0) + 1;
    if (vak !== "ges" && !bekend.has(t)) fouten.push(`${waar}: onderdeel "${t}" staat niet in ONDERDELEN.${vak}`);
    const sleutel = norm(q.v) + " || " + q.o.map(norm).sort().join(" | ") + " || " + (q.vlag || "") + (q.svg ? "svg" : "");   /* dezelfde vraag met andere opties is een andere vraag */
    if (gezien.has(sleutel)) fouten.push(`${waar}: dubbel met ${vak}[${gezien.get(sleutel)}]`);
    else gezien.set(sleutel, i);
  });
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
process.exitCode = fouten.length ? 1 : 0;
