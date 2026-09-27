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
