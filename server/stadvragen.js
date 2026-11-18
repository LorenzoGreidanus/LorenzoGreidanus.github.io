/* De vragen waar een spelkamer zelf mee werkt: de bestanden die
   server/maak-stadvragen.js per vak maakt (leermiddelen/stad-vragen/<vak>.json).
   Arena (server/stad.js) en de race van Poortrace (server/kamer.js) halen ze
   hier. Eerst via de binding met de bestanden van de site, anders via het
   eigen adres. Lukt geen van beide, dan een lege lijst; de kamer valt dan
   terug op rekensommen. */
export const VRAAGVAKKEN = ["reken", "ned", "eng", "ges", "aard", "bio", "wis", "burg", "eco"];

/* Een lijst vragen { v, o, g, u, t, n, k, svg?, vlag? }, met erbij:
   lijst.delen    de namen van de onderdelen (id -> naam)
   lijst.lijsten  losse lijsten waar een spel zelf vragen van maakt (bij ges: de jaartallen) */
export async function laadVragen(env, origin, vak){
  if (VRAAGVAKKEN.indexOf(vak) < 0) vak = "reken";
  const pad = "/leermiddelen/stad-vragen/" + vak + ".json";
  const basis = origin || "https://meneergreidanus.nl";
  let r = null;
  try { if (env.ASSETS) r = await env.ASSETS.fetch(new Request(basis + pad)); } catch (e){ r = null; }
  if (!r || !r.ok){ try { r = await fetch(basis + pad); } catch (e){ r = null; } }
  if (!r || !r.ok){ console.warn("vragen van " + vak + " niet te laden"); return []; }
  const j = await r.json();
  const lijst = (j.rijen || []).map(x => {
    const q = { v: x[0], o: x[1], g: x[2], u: x[3], t: x[4], n: x[5], k: x[6] };
    if (x[7] && x[7].svg) q.svg = x[7].svg;
    if (x[7] && x[7].vlag) q.vlag = x[7].vlag;
    return q;
  });
  lijst.delen = j.delen || {};
  lijst.lijsten = j.lijsten || {};
  return lijst;
}

/* Topografie (vak "topo" in Grand Prix en Dijkbouwers): de namen van een kaart, tot en met een
   niveau, als vragen in dezelfde vorm als de vragenbank. Elke plek geeft twee vragen:
   - naam: de plek licht op, de leerling kiest de naam uit vier (topo.soort "naam", met het
     nummer van de plek op de kaart);
   - wijs: de leerling krijgt de naam en klikt de plek aan (topo.soort "wijs"). De antwoorden
     in o zijn er dan alleen voor de kamer; de pagina krijgt ze niet.
   Het bestand komt uit maak-topovragen.js. */
export async function laadTopo(env, origin, kaart, tot){
  const pad = "/leermiddelen/stad-vragen/topo.json", basis = origin || "https://meneergreidanus.nl";
  let r = null;
  try { if (env.ASSETS) r = await env.ASSETS.fetch(new Request(basis + pad)); } catch (e){ r = null; }
  if (!r || !r.ok){ try { r = await fetch(basis + pad); } catch (e){ r = null; } }
  if (!r || !r.ok){ console.warn("topografie niet te laden"); return []; }
  const j = await r.json(), m = (j.kaarten || {})[kaart] || (j.kaarten || {}).eu;
  if (!m) return [];
  const id = (j.kaarten || {})[kaart] ? kaart : "eu";
  let mee = m.landen.map((l, i) => ({ n: l[0], v: l[1], i })).filter(l => l.v <= tot);
  if (mee.length < 6) mee = m.landen.map((l, i) => ({ n: l[0], v: l[1], i }));
  const lijst = [];
  const kies3 = goed => { const rest = mee.filter(x => x.n !== goed); for (let i = rest.length - 1; i > 0; i--){ const k = Math.floor(Math.random() * (i + 1)), h = rest[i]; rest[i] = rest[k]; rest[k] = h; } return rest.slice(0, 3).map(x => x.n); };
  mee.forEach(l => {
    const fout = kies3(l.n), wat = m.wat === "hoofdstad" ? "Welke hoofdstad" : m.wat === "provincie" ? "Welke provincie" : m.wat === "eiland" ? "Welk eiland" : m.wat === "stad" ? "Welke stad" : "Welk land";
    lijst.push({ v: wat + " licht op?", o: [l.n].concat(fout), g: 0, u: "", t: "topo", n: 2, k: m.naam, topo: { kaart: id, soort: "naam", i: l.i }, sl: wat + " licht op? (" + l.n + ")" });
    lijst.push({ v: "Wijs aan: " + l.n, o: [l.n].concat(fout), g: 0, u: "", t: "topo", n: 2, k: m.naam, topo: { kaart: id, soort: "wijs" }, sl: "Wijs aan: " + l.n });
  });
  lijst.delen = { topo: m.naam };
  lijst.lijsten = {};
  return lijst;
}
