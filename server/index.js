/* De server van meneergreidanus.nl.

   Alles wat geen /api/, /ws/ of /q is, is de gewone site: een bestand uit de
   map. De rest gaat over spelkamers. Een kamer is een Durable Object (zie
   kamer.js) met een code van vier letters; de code is de naam van het object,
   dus dezelfde code komt altijd bij dezelfde kamer uit.

   /api/kamer            POST  maakt een kamer, geeft {code, sleutel}
   /api/kamer/ABCD       GET   de stand van de kamer (bestaat hij, welke fase)
   /ws/ABCD?...          WebSocket naar de kamer
   /q                    de korte link voor leerlingen: stuurt door naar de quiz
   /q/ABCD               idem, met de code al ingevuld */
export { Kamer } from "./kamer.js";
export { Klassement } from "./klassement.js";
export { Poort } from "./poort.js";
export { Sets } from "./sets.js";
export { Beheer } from "./beheer.js";
const KLASSEMENTEN = { toren: true, zwaard: true };

/* Een browser stuurt bij elk POST en bij elke WebSocket mee vanaf welke site
   het komt. Alleen de site zelf (en lokaal testen) mag kamers maken, scores
   insturen en verbinden; een andere site kan dat dan niet namens een
   bezoeker doen. Een verzoek zonder Origin (geen browser) laten we door, dat
   houdt de poortwachter hieronder in de gaten. */
function eigenSite(req, url){
  const o = req.headers.get("Origin");
  if (!o) return true;
  try {
    const h = new URL(o).host;
    return h === url.host || /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(h) || h.replace(/^www\./, "") === url.host.replace(/^www\./, "");
  } catch (e){ return false; }
}
/* De poortwachter telt per adres hoe vaak er iets gemaakt of ingestuurd wordt. */
async function magDoor(env, req, wat, per, seconden){
  try {
    const ip = req.headers.get("CF-Connecting-IP") || "?";
    const r = await env.POORT.get(env.POORT.idFromName("poort")).fetch("https://poort/tel", { method: "POST",
      body: JSON.stringify({ wat, ip, per, seconden }) });
    const j = await r.json();
    return !!j.ok;
  } catch (e){ return true; }
}

/* Geen I, O, 0 en 1: die lees je van een digibord niet uit elkaar. */
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
function nieuweCode(){
  let c = "";
  const r = crypto.getRandomValues(new Uint8Array(4));
  for (let i = 0; i < 4; i++) c += LETTERS[r[i] % LETTERS.length];
  return c;
}
function json(obj, status){
  return new Response(JSON.stringify(obj), { status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}
const CODE = /^[A-Z]{4}$/;

export default {
  async fetch(req, env){
    const url = new URL(req.url);
    const p = url.pathname;

    if (p === "/q" || p.startsWith("/q/")){
      const code = p.slice(3).toUpperCase().replace(/[^A-Z]/g, "");
      /* met een code kijken we welk spel erbij hoort: de Klasquiz of de Klasstrijd */
      let pagina = "klasquiz.html";
      if (code.length === 4){
        try {
          const r = await env.KAMERS.get(env.KAMERS.idFromName(code)).fetch("https://kamer/stand");
          if (r.ok){ const j = await r.json(); if (j.spel === "strijd") pagina = "strijd.html"; }
        } catch (e){}
      }
      return Response.redirect(url.origin + "/leermiddelen/" + pagina + (code ? "?k=" + code : ""), 302);
    }

    /* het klassement van de hele site, per spel */
    const km = p.match(/^\/api\/klassement\/([a-z]+)\/?$/);
    if (km){
      if (!KLASSEMENTEN[km[1]]) return json({ fout: "onbekend spel" }, 404);
      const stub = env.KLASSEMENT.get(env.KLASSEMENT.idFromName(km[1]));
      /* de beheerder haalt een rij weg: DELETE met de geheime sleutel (wrangler secret put BEHEER) */
      if (req.method === "DELETE"){
        if (!env.BEHEER || req.headers.get("x-beheer") !== env.BEHEER) return json({ fout: "geen toegang" }, 403);
        let opdr; try { opdr = await req.json(); } catch (e){ return json({ fout: "geen geldige opdracht" }, 400); }
        return stub.fetch("https://klassement/weg", { method: "POST", body: JSON.stringify(opdr) });
      }
      if (req.method === "POST"){
        if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
        if (!await magDoor(env, req, "klassement", 12, 120)) return json({ fout: "even wachten" }, 429);
        let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldige inzending" }, 400); }
        return stub.fetch("https://klassement/zet", { method: "POST", body: JSON.stringify(inz) });
      }
      return stub.fetch("https://klassement/lijst");
    }

    /* eigen vragensets van de Klasquiz: bewaren onder een code, en ophalen */
    if (p === "/api/set" && req.method === "POST"){
      if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
      if (!await magDoor(env, req, "set", 10, 600)) return json({ fout: "even wachten met nieuwe sets" }, 429);
      let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldige set" }, 400); }
      return env.SETS.get(env.SETS.idFromName("sets")).fetch("https://sets/zet", { method: "POST", body: JSON.stringify(inz || {}) });
    }
    const sm = p.match(/^\/api\/set\/([A-Za-z0-9]{6})\/?$/);
    if (sm && req.method === "GET"){
      return env.SETS.get(env.SETS.idFromName("sets")).fetch("https://sets/haal?code=" + sm[1].toUpperCase());
    }

    /* meldingen bij vragen en de gebruikstelling: naar het beheerobject */
    const beheer = () => env.BEHEER_DO.get(env.BEHEER_DO.idFromName("beheer"));
    if (p === "/api/melding" && req.method === "POST"){
      if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
      if (!await magDoor(env, req, "melding", 6, 600)) return json({ fout: "even wachten met een volgende melding" }, 429);
      let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldige melding" }, 400); }
      return beheer().fetch("https://beheer/melding", { method: "POST", body: JSON.stringify(inz || {}) });
    }
    if (p === "/api/tel" && req.method === "POST"){
      if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
      if (!await magDoor(env, req, "tel", 60, 60)) return json({ ok: false }, 429);
      let inz; try { inz = JSON.parse(await req.text()); } catch (e){ return json({ fout: "geen pad" }, 400); }
      return beheer().fetch("https://beheer/tel", { method: "POST", body: JSON.stringify(inz || {}) });
    }
    /* alleen de beheerder: lezen en opruimen, met de geheime sleutel (wrangler secret put BEHEER) */
    const bm = p.match(/^\/api\/beheer\/(meldingen|tellers|melding-weg)\/?$/);
    if (bm){
      if (!env.BEHEER || req.headers.get("x-beheer") !== env.BEHEER) return json({ fout: "geen toegang" }, 403);
      if (bm[1] === "melding-weg"){
        let opdr; try { opdr = await req.json(); } catch (e){ return json({ fout: "geen geldige opdracht" }, 400); }
        return beheer().fetch("https://beheer/weg", { method: "POST", body: JSON.stringify(opdr || {}) });
      }
      return beheer().fetch("https://beheer/" + bm[1]);
    }

    if (p === "/api/kamer" && req.method === "POST"){
      if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
      if (!await magDoor(env, req, "kamer", 15, 600)) return json({ fout: "even wachten met nieuwe kamers" }, 429);
      let opzet;
      try { opzet = await req.json(); } catch (e){ return json({ fout: "geen geldige opzet" }, 400); }
      if (!opzet || typeof opzet !== "object") return json({ fout: "geen geldige opzet" }, 400);
      /* een vrije code zoeken: bijna altijd de eerste */
      for (let poging = 0; poging < 8; poging++){
        const code = nieuweCode();
        const stub = env.KAMERS.get(env.KAMERS.idFromName(code));
        const r = await stub.fetch("https://kamer/nieuw", { method: "POST",
          body: JSON.stringify(Object.assign({}, opzet, { code })) });
        if (r.status === 200) return json(await r.json());
        /* alleen een bezette code opnieuw proberen; een foute opzet is een fout van de aanvrager */
        if (r.status !== 409) return json(await r.json(), r.status);
      }
      return json({ fout: "geen vrije code gevonden, probeer nog eens" }, 503);
    }

    /* het klasoverzicht: leerlingen melden hun uitslag, de docent haalt ze op met de sleutel */
    const kl = p.match(/^\/api\/klas\/([A-Za-z]{4})(\/meld)?\/?$/);
    if (kl){
      const stub = env.KAMERS.get(env.KAMERS.idFromName(kl[1].toUpperCase()));
      if (kl[2]){
        if (req.method !== "POST") return json({ fout: "onbekend" }, 404);
        if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
        if (!await magDoor(env, req, "meld", 40, 60)) return json({ fout: "even wachten" }, 429);
        let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldige melding" }, 400); }
        return stub.fetch("https://kamer/meld", { method: "POST", body: JSON.stringify(inz || {}) });
      }
      return stub.fetch("https://kamer/resultaten?sleutel=" + encodeURIComponent(url.searchParams.get("sleutel") || ""));
    }

    const m = p.match(/^\/(api\/kamer|ws)\/([A-Za-z]{4})\/?$/);
    if (m){
      const code = m[2].toUpperCase();
      if (!CODE.test(code)) return json({ fout: "geen geldige code" }, 400);
      const stub = env.KAMERS.get(env.KAMERS.idFromName(code));
      if (m[1] === "ws"){
        if (req.headers.get("Upgrade") !== "websocket") return json({ fout: "hier hoort een WebSocket" }, 426);
        if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
        return stub.fetch(req);
      }
      return stub.fetch("https://kamer/stand");
    }

    if (p.startsWith("/api/") || p.startsWith("/ws/")) return json({ fout: "onbekend" }, 404);
    /* een map vraagt om zijn index.html, precies zoals GitHub Pages dat deed */
    if (p.endsWith("/")) return env.ASSETS.fetch(new Request(url.origin + p + "index.html" + url.search, req));
    if (p === "/leermiddelen") return Response.redirect(url.origin + "/leermiddelen/" + url.search, 301);
    return env.ASSETS.fetch(req);
  }
};
