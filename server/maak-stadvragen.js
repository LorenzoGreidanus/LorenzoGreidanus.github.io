// De vragen van De stad voor de server: node server/maak-stadvragen.js
//
// De stad kijkt zijn vragen na in de spelkamer, niet in de browser: de kamer
// beslist of een kist opengaat en hoeveel XP je krijgt, dus hij moet zelf het
// goede antwoord weten. De vragenbank staat in leermiddelen/bank.js en
// bank-<vak>.js, en dat zijn gewone scripts die hun vragen in globale
// variabelen zetten. Een Worker mag geen code uit tekst uitvoeren, dus daar
// kan de kamer ze niet lezen. Dit script draait ze hier in Node, precies zoals
// een browser dat doet (met de opgaven van de vakspellen erbij), en schrijft
// per vak een bestand leermiddelen/stad-vragen/<vak>.json. De kamer haalt
// dat op als hij het vak nodig heeft.
//
// Poortrace racet met dezelfde bestanden: in een race met vrienden of de klas
// kiest en kijkt de spelkamer (server/kamer.js) de vragen na. Poortrace heeft
// bij geschiedenis ook de jaartallen uit Tijdvakken sorteren; dat zijn geen
// vragen maar gebeurtenissen, waar het spel zelf een vraag van maakt (de foute
// jaartallen hangen af van het niveau). Die staan daarom los in ges.json, onder
// lijsten: de gebeurtenissen en de namen van de tijdvakken. Arena leest alleen
// de rijen en merkt er niets van.
//
// Na een wijziging in de vragenbank: dit script opnieuw draaien, anders krijgen
// De stad en Poortrace de nieuwe vragen niet. Het controleert ook of elke vraag
// compleet is.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const MAP = path.join(__dirname, "..", "leermiddelen");
const UIT = path.join(MAP, "stad-vragen");

/* een browser nadoen: scripts laden via document.createElement('script') */
const ctx = { console, Math, JSON, Date, Promise, setTimeout, clearTimeout, location: { search: "" } };
ctx.window = ctx; ctx.self = ctx;
const geladen = {};
function laad(bestand){
  if (geladen[bestand]) return;
  geladen[bestand] = true;
  const p = path.join(MAP, bestand);
  if (!fs.existsSync(p)) throw new Error("niet gevonden: " + bestand);
  vm.runInContext(fs.readFileSync(p, "utf8"), ctx, { filename: bestand });
}
ctx.document = {
  currentScript: null, scripts: [],
  head: { appendChild(s){
    const naam = String(s.src || "").replace(/^.*\//, "").replace(/[?#].*$/, "");
    let fout = null;
    try { laad(naam); } catch (e){ fout = e; }
    setTimeout(() => { if (fout){ console.log("  kon niet laden:", naam, fout.message); if (s.onerror) s.onerror(fout); } else if (s.onload) s.onload(); }, 0);
    return s;
  } },
  createElement(){ return {}; }
};
vm.createContext(ctx);
laad("bank.js");

function schoon(t){ return String(t == null ? "" : t); }

(async function(){
  await ctx.BANK.zorg();
  if (!fs.existsSync(UIT)) fs.mkdirSync(UIT);
  const vakNaam = {};
  ctx.VAKKEN.forEach(v => { vakNaam[v.id] = v.naam.toLowerCase(); });
  let fouten = 0, totaal = 0;
  function rij(q, n, vak){
    if (!q || !q.v || !Array.isArray(q.o) || q.o.length < 2 || !(q.g >= 0 && q.g < q.o.length)){ fouten++; return null; }
    /* de kop boven de vraag, zoals Zwaardvechter hem toont */
    let v = q.v, t = q.t || "", kop;
    if (vak === "ges"){
      const tv = ctx.TIJDVAKKEN.filter(x => x.id === q.t)[0];
      kop = ctx.kopVoorVraag({ v: q.v, o: q.o, t: tv ? "tijdvak " + tv.naam.replace(/^\d+ /, "") : q.t }, vakNaam[vak]);
    } else {
      if (vak === "eng" && /^woordjes /.test(q.t) && !/\?$/.test(q.v)) v = (q.t === "woordjes NL naar EN" ? "Hoe zeg je: " : "Wat betekent: ") + q.v + "?";
      kop = ctx.kopVoorVraag(q, vakNaam[vak] || "vraag");
    }
    const extra = q.svg ? { svg: q.svg } : q.vlag ? { vlag: q.vlag } : 0;
    return [schoon(v), q.o.map(schoon), q.g | 0, schoon(q.u), schoon(t), n || 2, schoon(kop), extra];
  }
  /* de namen van de onderdelen, voor de quests van De geleerde ("over tijdvak 3") */
  function namen(vak){
    const uit = {};
    (ctx.ONDERDELEN[vak] || []).forEach(o => { uit[o.id] = /^tv\d+$/.test(o.id) ? "tijdvak " + o.naam : o.naam; });
    return uit;
  }
  /* losse lijsten waar een spel zelf vragen van maakt; zie boven */
  function lijsten(vak){
    if (vak !== "ges" || !Array.isArray(ctx.GEBEURTENISSEN_TIJDVAKKEN)) return undefined;
    return { gebeurtenissen: ctx.GEBEURTENISSEN_TIJDVAKKEN.map(e => ({ tv: e.tv | 0, jaar: schoon(e.jaar), tekst: schoon(e.tekst), waarom: schoon(e.waarom) })),
             tijdvakken: ctx.TIJDVAKKEN.map(x => schoon(x.naam).replace(/^\d+ /, "")) };
  }
  function schrijf(vak, rijen){
    const bestand = path.join(UIT, vak + ".json");
    const inhoud = JSON.stringify({ vak, n: rijen.length, gemaakt: new Date().toISOString().slice(0, 10), delen: namen(vak),
      kolommen: ["v", "o", "g", "u", "t", "n", "k", "extra"], rijen, lijsten: lijsten(vak) });
    fs.writeFileSync(bestand, inhoud);
    totaal += rijen.length;
    console.log(vak + ": " + rijen.length + " vragen, " + Math.round(inhoud.length / 1024) + " kB");
  }
  for (const vak of ctx.BANK.vakken){
    const lijst = ctx.BRONNEN[vak] || [], nivo = ctx.NIVOS[vak] || [];
    const rijen = [];
    lijst.forEach((q, i) => { const r = rij(q, nivo[i], vak); if (r) rijen.push(r); });
    schrijf(vak, rijen);
  }
  /* Rekenen heeft geen vaste lijst: de sommen worden gemaakt. Hier een grote
     voorraad per niveau en per onderdeel, zonder dubbele. */
  const reken = [], gezien = {};
  for (let rang = 1; rang <= 4; rang++){
    for (const o of ctx.ONDERDELEN.reken){
      for (let k = 0; k < 24; k++){
        const q = ctx.rekenVraag(rang, [o.id]);
        if (!q || gezien[rang + "|" + q.v]) continue;
        gezien[rang + "|" + q.v] = 1;
        const r = rij(q, rang, "reken");
        if (r) reken.push(r);
      }
    }
  }
  schrijf("reken", reken);
  console.log("samen " + totaal + " vragen" + (fouten ? ", " + fouten + " onvolledige overgeslagen" : ""));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
