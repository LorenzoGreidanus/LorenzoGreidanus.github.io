// De vragenbank staat in leermiddelen/bank.js en wordt gedeeld door
// Torenverdediging, Zwaardvechter en de Klasquiz. Dit script controleert na
// een wijziging of het bestand nog klopt: node server/maak-bank.js
const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "leermiddelen", "bank.js");
const s = fs.readFileSync(p, "utf8");
const f = new Function(s + ";return { VAKKEN, NIVEAUS, BRONNEN, NIVOS, ONDERDELEN, rekenVraag };");
const b = f();
let fouten = 0;
for (const vak of Object.keys(b.BRONNEN)){
  const lijst = b.BRONNEN[vak], nivo = b.NIVOS[vak];
  if (lijst.length !== nivo.length){ console.log("FOUT:", vak, "heeft", lijst.length, "vragen maar", nivo.length, "niveaus"); fouten++; }
  const per = {}; nivo.forEach(n => per[n] = (per[n] || 0) + 1);
  lijst.forEach((q, i) => {
    if (!q.v || !Array.isArray(q.o) || q.o.length < 2 || !(q.g >= 0 && q.g < q.o.length)){ console.log("FOUT:", vak, "#" + (i + 1), "is niet compleet"); fouten++; }
  });
  console.log(vak + ":", lijst.length, "vragen, per niveau", JSON.stringify(per));
}
const r = b.rekenVraag(2, []);
if (!r || !r.v || !r.o) { console.log("FOUT: rekenVraag geeft geen vraag"); fouten++; }
console.log(fouten ? "bank.js heeft " + fouten + " fout(en)" : "bank.js klopt");
process.exit(fouten ? 1 : 0);
