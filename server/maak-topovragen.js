/* Maakt leermiddelen/stad-vragen/topo.json: per kaart van de topografie de namen en hun
   niveau, zonder de vormen. De kamer (kamer.js, vak "topo") leest dit bestand om in Grand Prix
   en Dijkbouwers topografievragen te stellen; de kaart zelf tekent de pagina uit
   topo-kaarten.js. Draai dit opnieuw als topo-kaarten.js verandert:

     node server/maak-topovragen.js

   Alleen kaarten met vlakken of stippen doen mee (geen rivieren en geen gemengde kaart):
   daar is aanwijzen met één klik eenduidig. */
const fs = require("fs"), path = require("path"), vm = require("vm");
const hier = path.join(__dirname, "..", "leermiddelen");
const w = {}; w.window = w; vm.createContext(w);
vm.runInContext(fs.readFileSync(path.join(hier, "topo-kaarten.js"), "utf8"), w);
const uit = { gemaakt: new Date().toISOString().slice(0, 10), kaarten: {} };
Object.keys(w.KAARTEN).forEach(k => {
  const m = w.KAARTEN[k];
  if (m.soort !== "vlak" && m.soort !== "punt") return;
  uit.kaarten[k] = { naam: m.naam, wat: m.wat, vraag: m.vraag, soort: m.soort, landen: m.landen.map(l => [l.n, l.v || 1]) };
});
fs.writeFileSync(path.join(hier, "stad-vragen", "topo.json"), JSON.stringify(uit));
console.log(Object.keys(uit.kaarten).map(k => k + " " + uit.kaarten[k].landen.length).join(", "));
