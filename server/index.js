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
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
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

    if (p === "/api/kamer" && req.method === "POST"){
      let opzet;
      try { opzet = await req.json(); } catch (e){ return json({ fout: "geen geldige opzet" }, 400); }
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

    const m = p.match(/^\/(api\/kamer|ws)\/([A-Za-z]{4})\/?$/);
    if (m){
      const code = m[2].toUpperCase();
      if (!CODE.test(code)) return json({ fout: "geen geldige code" }, 400);
      const stub = env.KAMERS.get(env.KAMERS.idFromName(code));
      if (m[1] === "ws"){
        if (req.headers.get("Upgrade") !== "websocket") return json({ fout: "hier hoort een WebSocket" }, 426);
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
