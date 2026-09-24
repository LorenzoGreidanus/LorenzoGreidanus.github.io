/* De server van meneergreidanus.nl.

   Alles wat geen /api/, /ws/ of /q is, is de gewone site: een bestand uit de
   map. De rest gaat over spelkamers. Een kamer is een Durable Object (zie
   kamer.js) met een code van vier letters; de code is de naam van het object,
   dus dezelfde code komt altijd bij dezelfde kamer uit.

   /api/potje            POST  zoekt een potje van De stad met plek, geeft {code}
   /ws/z/ABCD?...        WebSocket naar een potje van De stad
   /api/kamer            POST  maakt een kamer, geeft {code, sleutel}
   /api/kamer/ABCD       GET   de stand van de kamer (bestaat hij, welke fase)
   /ws/ABCD?...          WebSocket naar de kamer
   /q                    de korte link voor leerlingen: stuurt door naar de instappagina
   /q/ABCD               idem, met de code al ingevuld */
export { Kamer } from "./kamer.js";
export { Klassement } from "./klassement.js";
export { Poort } from "./poort.js";
export { Sets } from "./sets.js";
export { Materiaal } from "./materiaal.js";
export { Beheer } from "./beheer.js";
export { Profiel } from "./profiel.js";
export { Account } from "./account.js";
/* De klassen heten nog Zombiekamer omdat een Durable Object hernoemen om een
   migratie vraagt; het spel zelf heet De stad. */
export { Zombiekamer, Veld } from "./stad.js";
import { behandel as accountBehandel, ingelogd as accountIngelogd, mogelijk as accountMogelijk, isEigenaar, naamVan as accountNaam, kenmerkVan as accountKenmerk } from "./account.js";
const KLASSEMENTEN = { toren: true, zwaard: true, dag: true };   /* dag: per datum een lijst, dag-2026-09-19 */

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
/* De poortwachter telt per adres hoe vaak er iets gemaakt of ingestuurd wordt.
   Een hele school zit achter één adres, dus de grenzen zijn ruim: het gaat om
   het afremmen van een stroom, niet om een enkele klas. */
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
function nieuweCode(n){
  n = n || 4;
  let c = "";
  const r = crypto.getRandomValues(new Uint8Array(n));
  for (let i = 0; i < n; i++) c += LETTERS[r[i] % LETTERS.length];
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
    /* Een adres, zonder www: anders klopt bij het inloggen met Microsoft het terugadres niet
       (AADSTS50011) en staat het sessiekoekje op de verkeerde host. */
    if (url.hostname.startsWith("www.")){
      return new Response(null, { status: 308, headers: { location: url.protocol + "//" + url.hostname.slice(4) + url.pathname + url.search, "cache-control": "public, max-age=86400" } });
    }

    /* korte weg voor docenten: meneergreidanus.nl/docent */
    if (p === "/docent" || p === "/docenten"){
      return new Response(null, { status: 302, headers: { location: "/leermiddelen/klas.html", "cache-control": "no-store" } });
    }
    if (p === "/q" || p.startsWith("/q/")){
      const code = p.slice(3).toUpperCase().replace(/[^A-Z]/g, "");
      /* met een code kijken we welk spel erbij hoort: de Klasquiz, de Klasstrijd of een rollenspel */
      /* Zonder code weet nog niemand welk spel het wordt, dus dan gaat de
         leerling naar de instappagina: die vraagt alleen de code en stuurt hem
         daarna naar het goede spel. Met een code weten we het hier al. */
      let pagina = "mee.html";
      if (code.length === 4){
        try {
          const r = await env.KAMERS.get(env.KAMERS.idFromName(code)).fetch("https://kamer/stand");
          if (r.ok){
            const j = await r.json();
            pagina = j.spel === "strijd" ? "strijd.html" : j.spel === "rollen" ? (j.game === "teken" ? "tekenslag.html" : "rol.html") : "klasquiz.html";
          }
        } catch (e){}
      }
      return Response.redirect(url.origin + "/leermiddelen/" + pagina + (code ? "?k=" + code : ""), 302);
    }

    /* het klassement van de hele site, per spel */
    const km = p.match(/^\/api\/klassement\/([a-z]+(?:-\d{4}-\d{2}-\d{2})?)(\/gezicht|\/bon)?\/?$/);
    if (km){
      if (!KLASSEMENTEN[km[1].split("-")[0]] || (km[1].indexOf("-") > 0) !== (km[1].split("-")[0] === "dag")) return json({ fout: "onbekend spel" }, 404);
      const stub = env.KLASSEMENT.get(env.KLASSEMENT.idFromName(km[1]));
      /* de beheerder haalt een rij weg: DELETE met de geheime sleutel (wrangler secret put BEHEER) */
      if (req.method === "DELETE"){
        if (!env.BEHEER || req.headers.get("x-beheer") !== env.BEHEER) return json({ fout: "geen toegang" }, 403);
        let opdr; try { opdr = await req.json(); } catch (e){ return json({ fout: "geen geldige opdracht" }, 400); }
        return stub.fetch("https://klassement/weg", { method: "POST", body: JSON.stringify(opdr) });
      }
      if (req.method === "POST"){
        if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
        /* Drie soorten POST, elk met een eigen ruimte. Een bon vragen doet de
           pagina bij elk potje, dus die grens ligt het hoogst; een score
           insturen gebeurt maar eens per partij. */
        const deel = km[2] === "/gezicht" ? "gezicht" : km[2] === "/bon" ? "bon" : "zet";
        const ruimte = { gezicht: 300, bon: 240, zet: 90 }[deel];
        if (!await magDoor(env, req, "klassement-" + deel, ruimte, 120)) return json({ fout: "even wachten" }, 429);
        let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldige inzending" }, 400); }
        return stub.fetch("https://klassement/" + deel, { method: "POST", body: JSON.stringify(inz || {}) });
      }
      return stub.fetch("https://klassement/lijst");
    }

    /* eigen vragensets van de Klasquiz: bewaren onder een code, en ophalen */
    if (p === "/api/set" && req.method === "POST"){
      if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
      if (!await magDoor(env, req, "set", 40, 600)) return json({ fout: "even wachten met nieuwe sets" }, 429);
      let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldige set" }, 400); }
      return env.SETS.get(env.SETS.idFromName("sets")).fetch("https://sets/zet", { method: "POST", body: JSON.stringify(inz || {}) });
    }
    const sm = p.match(/^\/api\/set\/([A-Za-z0-9]{6})\/?$/);
    if (sm && req.method === "GET"){
      /* Een setcode is zes tekens uit tweeendertig, dus raden schiet niet op,
         maar zonder rem kon iemand er wel eindeloos naar blijven vragen en
         daarmee de opslag bezighouden. Een klas die allemaal tegelijk dezelfde
         set opent komt hier ruim onder. */
      if (!await magDoor(env, req, "set-lees", 400, 60)) return json({ fout: "even wachten" }, 429);
      return env.SETS.get(env.SETS.idFromName("sets")).fetch("https://sets/haal?code=" + sm[1].toUpperCase());
    }

    /* Eigen materiaal van docenten: woordenlijsten en oefeningen (materiaal.js).
       Maken, aanpassen en weghalen vanaf de site zelf; ophalen met de code. */
    if (p === "/api/materiaal" && req.method === "POST"){
      if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
      if (!await magDoor(env, req, "materiaal", 60, 600)) return json({ fout: "even wachten met nieuw materiaal" }, 429);
      let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldig materiaal" }, 400); }
      return env.MATERIAAL.get(env.MATERIAAL.idFromName("materiaal")).fetch("https://materiaal/zet", { method: "POST", body: JSON.stringify(inz || {}) });
    }
    const mm = p.match(/^\/api\/materiaal\/([A-Za-z0-9]{6})(\/werk|\/weg|\/volledig|\/inlever|\/uitslagen|\/nakijk|\/instel|\/wisuitslag)?\/?$/);
    if (mm){
      const stub = env.MATERIAAL.get(env.MATERIAAL.idFromName("materiaal"));
      if (req.method === "GET"){
        if (!await magDoor(env, req, "materiaal-lees", 400, 60)) return json({ fout: "even wachten" }, 429);
        return stub.fetch("https://materiaal/haal?code=" + mm[1].toUpperCase());
      }
      if (req.method === "POST" && mm[2]){
        if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
        /* inleveren: een hele klas achter een schooladres tegelijk; nakijken: veel kleine klikjes */
        const emmer = mm[2] === "/inlever" ? ["materiaal-inlever", 900] : /^\/(nakijk|uitslagen|instel|volledig)$/.test(mm[2]) ? ["materiaal-nakijk", 1500] : ["materiaal-werk", 120];
        if (!await magDoor(env, req, emmer[0], emmer[1], 600)) return json({ fout: "even wachten" }, 429);
        let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldig materiaal" }, 400); }
        return stub.fetch("https://materiaal" + mm[2] + "?code=" + mm[1].toUpperCase(), { method: "POST", body: JSON.stringify(inz || {}) });
      }
      return json({ fout: "onbekend" }, 404);
    }

    /* inloggen met Microsoft, optioneel, gekoppeld aan een speelcode (account.js) */
    if (p === "/api/account" || p.startsWith("/api/account/")){
      return accountBehandel(req, env, url, { eigenSite: () => eigenSite(req, url), magDoor: (wat, per, s) => magDoor(env, req, wat, per, s) });
    }
    /* meldingen bij vragen en de gebruikstelling: naar het beheerobject */
    const beheer = () => env.BEHEER_DO.get(env.BEHEER_DO.idFromName("beheer"));
    /* de speelcode: een profiel zonder account, acht letters */
    if (p === "/api/profiel" && req.method === "POST"){
      if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
      if (!await magDoor(env, req, "profiel-maak", 90, 600)) return json({ fout: "even wachten met een nieuwe speelcode" }, 429);
      let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldig profiel" }, 400); }
      for (let poging = 0; poging < 4; poging++){
        const code = nieuweCode(8);
        const r = await env.PROFIEL.get(env.PROFIEL.idFromName(code)).fetch("https://profiel/maak", { method: "POST", body: JSON.stringify({ code, profiel: inz && inz.profiel }) });
        if (r.status !== 409) return r;
      }
      return json({ fout: "probeer het nog eens" }, 503);
    }
    const pm = p.match(/^\/api\/profiel\/([A-Za-z]{8})\/?$/);
    if (pm){
      const code = pm[1].toUpperCase();
      const stub = env.PROFIEL.get(env.PROFIEL.idFromName(code));
      if (req.method === "GET"){
        if (!await magDoor(env, req, "profiel-lees", 400, 60)) return json({ fout: "even wachten" }, 429);
        return stub.fetch("https://profiel/lees");
      }
      if (req.method === "PUT"){
        if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
        if (!await magDoor(env, req, "profiel-sync", 900, 60)) return json({ fout: "even wachten" }, 429);
        let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldig profiel" }, 400); }
        return stub.fetch("https://profiel/sync", { method: "POST", body: JSON.stringify(inz || {}) });
      }
      return json({ fout: "onbekend" }, 404);
    }
    if (p === "/api/melding" && req.method === "POST"){
      if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
      if (!await magDoor(env, req, "melding", 40, 600)) return json({ fout: "even wachten met een volgende melding" }, 429);
      let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldige melding" }, 400); }
      return beheer().fetch("https://beheer/melding", { method: "POST", body: JSON.stringify(inz || {}) });
    }
    if (p === "/api/tel" && req.method === "POST"){
      if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
      if (!await magDoor(env, req, "tel", 900, 60)) return json({ ok: false }, 429);
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
      if (!await magDoor(env, req, "kamer", 90, 600)) return json({ fout: "even wachten met nieuwe kamers" }, 429);
      let opzet;
      try { opzet = await req.json(); } catch (e){ return json({ fout: "geen geldige opzet" }, 400); }
      if (!opzet || typeof opzet !== "object") return json({ fout: "geen geldige opzet" }, 400);
      /* Een klascode hoort bij een docent. Kan er ingelogd worden op deze site, dan kan dat alleen ingelogd:
         zo blijft een klas van jou, raak je hem niet kwijt met je browsergegevens, en maakt niet elke leerling
         zijn eigen klas. De andere kamers (klasquiz, klasstrijd, tekenslag) blijven vrij. */
      if (opzet.spel === "klas" && accountMogelijk(env) && !await accountIngelogd(req, env)) return json({ fout: "log eerst in met Microsoft; dan blijft je klas van jou en staat hij op al je apparaten" }, 401);
      /* Is dit een klas van de eigenaar van de site? Dan krijgen zijn
         leerlingen iets extra's. De vlag zetten we hier zelf, altijd, zodat
         wat de browser meestuurde er niet toe doet. */
      const vanEigenaar = opzet.spel === "klas" ? await isEigenaar(req, env) : false;
      /* een vrije code zoeken: bijna altijd de eerste */
      for (let poging = 0; poging < 8; poging++){
        const code = nieuweCode();
        const stub = env.KAMERS.get(env.KAMERS.idFromName(code));
        const r = await stub.fetch("https://kamer/nieuw", { method: "POST",
          body: JSON.stringify(Object.assign({}, opzet, { code, vanEigenaar })) });
        if (r.status === 200) return json(await r.json());
        /* alleen een bezette code opnieuw proberen; een foute opzet is een fout van de aanvrager */
        if (r.status !== 409) return json(await r.json(), r.status);
      }
      return json({ fout: "geen vrije code gevonden, probeer nog eens" }, 503);
    }

    /* het klasoverzicht: leerlingen melden hun uitslag, de docent haalt ze op met de sleutel */
    const kl = p.match(/^\/api\/klas\/([A-Za-z]{4})(\/meld|\/melden|\/opheffen|\/opdracht|\/mijn|\/instelling|\/periodes|\/naam|\/echt|\/hoi|\/leerlingweg)?\/?$/);
    if (kl){
      const stub = env.KAMERS.get(env.KAMERS.idFromName(kl[1].toUpperCase()));
      /* de leerling: heb ik de opdracht gehaald? */
      if (kl[2] === "/mijn") return stub.fetch("https://kamer/mijn?sid=" + encodeURIComponent(url.searchParams.get("sid") || ""));
      if (kl[2]){
        if (req.method !== "POST") return json({ fout: "onbekend" }, 404);
        if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
        const wat = kl[2].slice(1);
        if (!await magDoor(env, req, wat, wat === "meld" ? 400 : 40, 60)) return json({ fout: "even wachten" }, 429);
        let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldige melding" }, 400); }
        /* De naam van het Microsoft-account komt hier uit het sessiekoekje en
           niet uit het bericht: anders typt een leerling er zelf een naam in.
           Dezelfde weg als vanEigenaar bij het maken van een klascode. */
        /* Bij hoi en bij elke uitslag: wie inlogde komt zo ook later nog met zijn
           accountnaam in het overzicht, en een tweede apparaat van hetzelfde
           account wordt dezelfde leerling. Het kenmerk is per klas anders. */
        if (wat === "hoi" || wat === "meld"){
          const ms = await accountNaam(req, env), id = ms ? await accountKenmerk(req, env) : "";
          let acc = "";
          if (id){
            const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(id + "|klas|" + kl[1].toUpperCase()));
            acc = Array.from(new Uint8Array(h)).slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
          }
          inz = Object.assign({}, inz || {}, { ms, acc });
        }
        return stub.fetch("https://kamer/" + wat, { method: "POST", body: JSON.stringify(inz || {}) });
      }
      /* De sleutel komt in een kopregel, niet in het adres: adressen belanden in
         logboeken en in de geschiedenis van de browser. Het adres blijft werken
         voor een pagina die nog uit de cache komt. */
      const sleutel = req.headers.get("x-sleutel") || url.searchParams.get("sleutel") || "";
      return stub.fetch("https://kamer/resultaten?sleutel=" + encodeURIComponent(sleutel));
    }

    /* De stad. De portier zoekt een potje met plek; is er geen, dan
       maakt hij er hier een met een verse code. Het zoeken zit in een eigen
       Durable Object omdat het over alle potjes tegelijk gaat. */
    if (p === "/api/potje" && req.method === "POST"){
      if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
      if (!await magDoor(env, req, "potje", 120, 300)) return json({ fout: "even wachten" }, 429);
      const veld = env.VELD.get(env.VELD.idFromName("veld"));
      const r = await (await veld.fetch("https://veld/zoek", { method: "POST", body: "{}" })).json();
      if (r && r.code) return json({ code: r.code, spelers: r.spelers, max: r.max });
      /* geen potje met plek: een nieuwe openen */
      for (let poging = 0; poging < 8; poging++){
        const code = nieuweCode();
        const stub = env.ZOMBIE.get(env.ZOMBIE.idFromName(code));
        const gemaakt = await stub.fetch("https://stad/nieuw", { method: "POST", body: JSON.stringify({ code }) });
        if (gemaakt.status === 200) return json({ code, spelers: 0, max: r && r.max });
        if (gemaakt.status !== 409) return json(await gemaakt.json(), gemaakt.status);
      }
      return json({ fout: "geen vrij potje gevonden, probeer nog eens" }, 503);
    }
    if (p === "/api/potjes"){
      const veld = env.VELD.get(env.VELD.idFromName("veld"));
      return veld.fetch("https://veld/lijst");
    }
    const zm = p.match(/^\/ws\/z\/([A-Za-z]{4})\/?$/);
    if (zm){
      const code = zm[1].toUpperCase();
      if (!CODE.test(code)) return json({ fout: "geen geldige code" }, 400);
      if (req.headers.get("Upgrade") !== "websocket") return json({ fout: "hier hoort een WebSocket" }, 426);
      if (!eigenSite(req, url)) return json({ fout: "niet vanaf deze site" }, 403);
      return env.ZOMBIE.get(env.ZOMBIE.idFromName(code)).fetch(req);
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
