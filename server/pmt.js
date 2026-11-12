/* PMT: de dossiers van de psychomotorisch therapeut, op pmt.meneergreidanus.nl.

   Dit staat los van de spellen en de leeromgeving: een eigen adres, een eigen
   sessiekoekje, een eigen opslagobject. Het gaat om gevoelige gegevens van
   leerlingen, dus alles is hier strenger dan op de rest van de site.

   Wie erin mag
     Inloggen gaat met Microsoft (hetzelfde bewijs als in account.js). Daarna
     kijken we of het adres op de toegangslijst staat (PMT_TOEGANG). Staat het
     er niet op, dan komt er geen sessie. De lijst wordt bij elk verzoek
     opnieuw gelezen: wie eraf gaat, is er meteen uit.
     Met PMT_TENANT erbij mag alleen een account van die ene school inloggen.

   De sessie
     Een kwartier zonder verzoek en de sessie is voorbij; elk verzoek zet de
     klok terug. Na tien uur moet je hoe dan ook opnieuw inloggen.

   De opslag (Durable Object Pmt, vastgezet op de EU)
     dossier   id, de inhoud versleuteld (AES-GCM met PMT_SLEUTEL), tijden
     logboek   wie deed wat met welk dossier, en wanneer
     In het logboek staat alleen het nummer van het dossier, geen naam: is het
     dossier weg, dan zegt het logboek niets meer over wie het was.

   Instellen (eenmalig):
     1. In Cloudflare het adres pmt.meneergreidanus.nl aan deze Worker hangen.
     2. Bij de app-registratie van Microsoft de omleidings-URI
        https://pmt.meneergreidanus.nl/api/pmt/terug toevoegen.
     3. Geheimen zetten:
          npx wrangler secret put PMT_TOEGANG   (e-mailadressen, met komma's ertussen)
          npx wrangler secret put PMT_SLEUTEL   (een lange willekeurige tekst; raakt die
                                                 kwijt, dan zijn de dossiers niet meer te lezen)
          npx wrangler secret put PMT_TENANT    (optioneel: het tenant-id van de school)
     Zonder PMT_TOEGANG en PMT_SLEUTEL doet deze module niets.
     Zolang PMT_ECHT niet op "ja" staat is het een proefomgeving: de pagina
     zegt dat erbij en je kunt voorbeelddossiers laten maken.

   De demo
     Zolang het een proefomgeving is (PMT_ECHT staat niet op "ja") kan iedereen
     zonder Microsoft naar binnen via /api/pmt/demo. Die bezoeker komt in een
     eigen opslagobject (pmt-demo) met voorbeelddossiers, nooit in de echte
     opslag. Iedereen deelt die ene demo, dus er hoort niets echts in; na een
     dag wordt hij leeggemaakt en opnieuw gevuld. Uitzetten kan met
     PMT_DEMO=nee. Staat PMT_ECHT op "ja", dan bestaat de demo niet meer.

   Routes (alleen op pmt.* en lokaal, zie index.js):
     GET    /api/pmt/demo                  de demo in, zonder inloggen (alleen in de proefomgeving)
     GET    /api/pmt                       { aan, ingelogd, naam, proef }
     GET    /api/pmt/inloggen              door naar Microsoft
     GET    /api/pmt/terug                 Microsoft komt hier terug
     POST   /api/pmt/uitloggen
     GET    /api/pmt/dossiers              de lijst
     POST   /api/pmt/dossiers              een nieuw dossier
     GET    /api/pmt/dossiers/ID           een dossier (komt in het logboek)
     PUT    /api/pmt/dossiers/ID           bewaren
     DELETE /api/pmt/dossiers/ID           weg, voorgoed
     POST   /api/pmt/dossiers/ID/gezien    wat er nieuw was ingevuld is bekeken
     GET    /api/pmt/dossiers/ID/export    het hele dossier als bestand
     GET    /api/pmt/lijsten               de vragenlijsten
     POST   /api/pmt/lijsten               een nieuwe vragenlijst
     PUT    /api/pmt/lijsten/ID            bewaren
     DELETE /api/pmt/lijsten/ID
     POST   /api/pmt/dossiers/ID/afname    een lijst klaarzetten: geeft een code voor de leerling
     DELETE /api/pmt/afname/CODE           de code intrekken
     POST   /api/pmt/dossiers/ID/meting    de antwoorden van een papieren lijst invoeren
     DELETE /api/pmt/metingen/ID           een ingevulde lijst weg
     POST   /api/pmt/dossiers/ID/verslag   alleen een regel in het logboek: er is een verslag gemaakt
     GET    /api/pmt/rooster?week=DATUM     de tijden van het rooster en de afspraken van die week
     PUT    /api/pmt/rooster/instelling    begin, eind en de lengte van een blok
     PUT    /api/pmt/rooster/vrij          de vakanties en vrije dagen (met ruim: haal de afspraken op die dagen weg)
     GET    /api/pmt/rooster/vakanties     de schoolvakanties van dit schooljaar, opgehaald bij de Rijksoverheid (?regio=noord|midden|zuid)
     POST   /api/pmt/afspraken             een leerling inplannen (weken: zoveel weken achter elkaar)
     PUT    /api/pmt/afspraken/ID          verplaatsen naar een andere dag of tijd
     PUT    /api/pmt/afspraken/ID/komst    aanwezig of afwezig, met een reden
     DELETE /api/pmt/afspraken/ID          met ?reeks=1 ook alle latere op dezelfde weekdag en tijd
     GET    /api/pmt/privacy               de bewaartermijn
     PUT    /api/pmt/privacy               de bewaartermijn zetten (maanden na afronden; 0 is uit)
     POST   /api/pmt/dossiers/ID/wis       wat er verwerkt is wissen, na het intrekken van de toestemming
     GET    /api/pmt/dossiers/ID/logboek   wie er wat met dit dossier deed, voor een inzageverzoek
     GET    /api/pmt/toestemming           de tekst van het toestemmingsformulier
     PUT    /api/pmt/toestemming           die tekst aanpassen
     GET    /api/pmt/logboek
   De wekelijkse check (EF-monitor) is een vragenlijst met monitor aan. Daarvoor is er
   een vaste code: twaalf weken geldig, steeds opnieuw te gebruiken, hooguit een keer
   per zes uur. Er is er een voor de leerling en een voor de mentor.
   Zonder inloggen, voor de leerling met een code (zes letters, geldig tot middernacht, een keer):
     GET    /api/pmt/afname/CODE           de vragen, zonder schalen
     POST   /api/pmt/afname/CODE           de antwoorden; de server rekent de scores uit
     POST   /api/pmt/proef                 voorbeelddossiers (alleen in de proefomgeving) */
import { DurableObject } from "cloudflare:workers";
import { teken, lees, koekjes, controleer, basis, willekeur, b64url, vanB64url, sha256 } from "./account.js";

const SESSIE_MIN = 15, SESSIE_MAX_UUR = 10, AANMELD_SECONDEN = 600;
const AANMELD = "pmt_aanmelden";
/* Met __Host- ervoor neemt een browser het koekje alleen aan van dit ene adres,
   over https en zonder Domain. Een ander adres onder hetzelfde domein kan er
   dan geen neerzetten. Lokaal (http) kan dat niet, daar heet het gewoon pmt_sessie. */
function koekNaam(url){ return url.protocol === "https:" ? "__Host-pmt_sessie" : "pmt_sessie"; }
const MAX_INHOUD = 300000;
/* wacht: aangemeld, maar er is nog geen plek (de wachtrij) */
const STATUS = ["wacht", "intake", "loopt", "afgerond"];

function json(obj, status, koppen){
  const h = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
  for (const k of Object.keys(koppen || {})) h.append(k, koppen[k]);
  return new Response(JSON.stringify(obj), { status: status || 200, headers: h });
}
export function aan(env){
  return !!(env.PMT && env.MS_CLIENT_ID && env.MS_CLIENT_SECRET && env.SESSIE_GEHEIM && env.PMT_TOEGANG && env.PMT_SLEUTEL);
}
function toegangslijst(env){
  return String(env.PMT_TOEGANG || "").toLowerCase().split(/[\s,;]+/).filter(m => m.indexOf("@") > 0);
}
function magErin(env, mail){ return !!mail && toegangslijst(env).indexOf(mail) >= 0; }
function proef(env){ return env.PMT_ECHT !== "ja"; }
/* de demo kan alleen in de proefomgeving, en gaat uit met PMT_DEMO=nee */
function demoKan(env){ return proef(env) && env.PMT_DEMO !== "nee"; }
const DEMO_DOSSIERS = 40, DEMO_LIJSTEN = 20, DEMO_DAG = 86400000;
function thuisPad(url){ return url.hostname === "localhost" || url.hostname === "127.0.0.1" ? "/pmt/" : "/"; }
function huurder(env){ return String(env.PMT_TENANT || env.MS_TENANT || "common"); }
function terugAdres(url){ return url.origin + "/api/pmt/terug"; }
/* het sessiekoekje is Strict: het gaat alleen mee met verzoeken van de eigen pagina.
   Het aanmeldkoekje is Lax, want dat moet mee als Microsoft de browser terugstuurt. */
function zet(naam, waarde, url, seconden, pad, streng){
  const veilig = url.protocol === "https:" ? "; Secure" : "";
  return naam + "=" + waarde + "; Path=" + pad + "; Max-Age=" + seconden + "; HttpOnly; SameSite=" + (streng ? "Strict" : "Lax") + veilig;
}
/* een verzoek dat iets verandert moet van de eigen pagina komen */
function eigen(req, url){
  const o = req.headers.get("Origin");
  if (!o) return false;
  try { return new URL(o).host === url.host; } catch (e){ return false; }
}
/* Op het echte adres staat de opslag vast op de EU. De testserver op de eigen
   computer kent dat niet (workerd), dus alleen daar zonder; een fout op het
   echte adres vangen we bewust niet op, dan liever geen antwoord. */
function kluis(env, url){
  const lokaal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const ns = lokaal ? env.PMT : env.PMT.jurisdiction("eu");
  return ns.get(ns.idFromName("pmt"));
}
/* de opslag van de demo: een ander object dan de echte, met dezelfde vorm */
function demoKluis(env, url){
  const lokaal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const ns = lokaal ? env.PMT : env.PMT.jurisdiction("eu");
  return ns.get(ns.idFromName("pmt-demo"));
}
async function sessieKoekje(env, url, s){
  const pak = await teken(env, { pmt: 1, mail: s.mail, naam: s.naam, demo: s.demo ? 1 : undefined, sinds: s.sinds, tot: Date.now() + SESSIE_MIN * 60000 });
  return zet(koekNaam(url), pak, url, SESSIE_MIN * 60, "/", true);
}
async function wie(env, req){
  const s = await lees(env, koekjes(req)[koekNaam(new URL(req.url))]);
  if (!s || s.pmt !== 1) return null;
  /* een demosessie geldt alleen zolang de demo bestaat; een echte alleen voor wie op de lijst staat */
  if (s.demo ? !demoKan(env) : !magErin(env, s.mail)) return null;
  if (!(Date.now() - s.sinds < SESSIE_MAX_UUR * 3600000)) return null;
  return s;
}
/* een adres dat niet op de lijst staat komt half in het logboek: genoeg om het te herkennen */
function halfAdres(mail){
  const i = mail.indexOf("@");
  return i < 1 ? "onbekend" : mail.slice(0, 2) + "…" + mail.slice(i);
}
async function leesInhoud(req){
  const t = await req.text();
  if (t.length > MAX_INHOUD) throw new Error("te groot");
  const j = JSON.parse(t || "{}");
  if (!j || typeof j !== "object" || Array.isArray(j)) throw new Error("geen object");
  return j;
}

export async function behandel(req, env, url, hulp){
  const p = url.pathname.replace(/\/+$/, "");
  const m = req.method;
  if (!aan(env)){
    if (p === "/api/pmt" && m === "GET") return json({ aan: false, ingelogd: false });
    return json({ fout: "PMT staat niet aan" }, 404);
  }
  if (m !== "GET" && !eigen(req, url)) return json({ fout: "niet vanaf deze site" }, 403);

  if (p === "/api/pmt" && m === "GET"){
    const s = await wie(env, req);
    if (!s) return json({ aan: true, ingelogd: false, demo: demoKan(env) });
    return json({ aan: true, ingelogd: true, naam: s.naam, proef: proef(env), demo: !!s.demo, minuten: SESSIE_MIN }, 200, { "set-cookie": await sessieKoekje(env, url, s) });
  }

  if (p === "/api/pmt/inloggen" && m === "GET"){
    if (!await hulp.magDoor("pmt-inloggen", 30, 600)) return json({ fout: "even wachten" }, 429);
    const state = willekeur(24), nonce = willekeur(24), verifier = willekeur(48);
    const pak = await teken(env, { pmt: 1, state, nonce, verifier, tot: Date.now() + AANMELD_SECONDEN * 1000 });
    const q = new URLSearchParams({
      client_id: env.MS_CLIENT_ID, response_type: "code", redirect_uri: terugAdres(url), response_mode: "query",
      scope: "openid profile email", state, nonce, code_challenge: b64url(await sha256(verifier)), code_challenge_method: "S256", prompt: "select_account"
    });
    return new Response(null, { status: 302, headers: {
      location: basis(env) + "/" + huurder(env) + "/oauth2/v2.0/authorize?" + q.toString(),
      "set-cookie": zet(AANMELD, pak, url, AANMELD_SECONDEN, "/api/pmt", false), "cache-control": "no-store" } });
  }

  if (p === "/api/pmt/terug" && m === "GET"){
    if (!await hulp.magDoor("pmt-terug", 30, 600)) return json({ fout: "even wachten" }, 429);
    const pak = await lees(env, koekjes(req)[AANMELD]);
    const naar = (vlag, sessie) => {
      /* op het echte adres is de pagina de voordeur; lokaal staat ze onder /pmt/ */
      const thuis = url.hostname === "localhost" || url.hostname === "127.0.0.1" ? "/pmt/" : "/";
      const h = new Headers({ location: url.origin + thuis + (vlag ? "?pmt=" + vlag : ""), "cache-control": "no-store" });
      h.append("set-cookie", zet(AANMELD, "", url, 0, "/api/pmt", false));
      if (sessie) h.append("set-cookie", sessie);
      return new Response(null, { status: 302, headers: h });
    };
    if (url.searchParams.get("error")){
      const uitleg = String(url.searchParams.get("error_description") || "");
      return naar(/AADSTS(65001|90094|650052|500131)/.test(uitleg) ? "school" : "fout");
    }
    const code = url.searchParams.get("code"), state = url.searchParams.get("state");
    if (!pak || pak.pmt !== 1 || !code || !state || state !== pak.state) return naar("fout");
    let claims;
    try {
      const r = await fetch(basis(env) + "/" + huurder(env) + "/oauth2/v2.0/token", { method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: env.MS_CLIENT_ID, client_secret: env.MS_CLIENT_SECRET, grant_type: "authorization_code",
          code, redirect_uri: terugAdres(url), code_verifier: pak.verifier, scope: "openid profile email" }).toString() });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.id_token){ console.warn("pmt: inwisselen mislukt", r.status, j.error); return naar("fout"); }
      claims = await controleer(env, j.id_token, pak.nonce);
    } catch (e){ console.warn("pmt: bewijs afgekeurd", e && e.message); return naar("fout"); }
    /* Alleen preferred_username (de inlognaam van het account, op een domein dat
       de organisatie bij Microsoft heeft bewezen) of upn. Het veld email doet
       niet mee: dat kan iemand in een eigen omgeving zelf invullen met het
       adres van een ander. Zet PMT_TENANT erbij, dan telt ook alleen de school. */
    const mail = String(claims.preferred_username || claims.upn || "").trim().toLowerCase();
    const vanSchool = !env.PMT_TENANT || claims.tid === env.PMT_TENANT;
    if (!vanSchool || !magErin(env, mail)){
      await kluis(env, url).meld("niet op de lijst: " + halfAdres(mail), "geweigerd", "");
      return naar("geen");
    }
    const naam = String(claims.name || mail.split("@")[0]).replace(/[<>]/g, "").slice(0, 60) || "iemand";
    await kluis(env, url).meld(naam, "ingelogd", "");
    return naar("", await sessieKoekje(env, url, { mail, naam, sinds: Date.now() }));
  }

  if (p === "/api/pmt/demo" && m === "GET"){
    if (!demoKan(env)) return json({ fout: "de demo staat uit" }, 404);
    if (!await hulp.magDoor("pmt-demo", 120, 600)) return json({ fout: "even wachten" }, 429);
    /* Wie echt is ingelogd blijft dat. Anders kon een andere site je browser
       hierheen sturen, en zat je daarna ongemerkt in de openbare demo. */
    const echt = await wie(env, req);
    if (echt && !echt.demo) return new Response(null, { status: 302, headers: { location: url.origin + thuisPad(url), "cache-control": "no-store" } });
    await demoKluis(env, url).demoKlaar();
    const koek = await sessieKoekje(env, url, { mail: "", naam: "Demo", demo: 1, sinds: Date.now() });
    return new Response(null, { status: 302, headers: { location: url.origin + thuisPad(url), "set-cookie": koek, "cache-control": "no-store" } });
  }

  if (p === "/api/pmt/uitloggen" && m === "POST"){
    const s = await wie(env, req);
    if (s) await (s.demo ? demoKluis(env, url) : kluis(env, url)).meld(s.naam, "uitgelogd", "");
    return json({ ok: true }, 200, { "set-cookie": zet(koekNaam(url), "", url, 0, "/", true) });
  }

  /* De leerling heeft geen account, alleen de code die de therapeut gaf. Een
     code die niet klopt telt mee: wie codes afloopt, stuit daar snel op. */
  const am = p.match(/^\/api\/pmt\/afname\/([A-Za-z]{6})$/);
  if (am && (m === "GET" || m === "POST")){
    const code = am[1].toUpperCase();
    if (!await hulp.magDoor("pmt-code-mis", 30, 600, true)) return json({ fout: "even wachten" }, 429);
    const mis = async () => { await hulp.magDoor("pmt-code-mis", 30, 600); return json({ fout: "deze code klopt niet of is verlopen" }, 404); };
    const kluizen = demoKan(env) ? [kluis(env, url), demoKluis(env, url)] : [kluis(env, url)];
    if (m === "GET"){
      for (const x of kluizen){ const a = await x.afname(code); if (a) return json(a); }
      return mis();
    }
    let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return json({ fout: "dit kan de server niet lezen" }, 400); }
    let uit = null;
    for (const x of kluizen){ uit = await x.vulIn(code, inhoud.antwoorden); if (uit !== null) break; }
    if (uit === null) return mis();
    if (uit === "al") return json({ fout: "Deze check is vandaag al ingevuld. Tot volgende week." }, 409);
    if (uit === "vol") return json({ fout: "Er passen geen ingevulde lijsten meer bij. Zeg het tegen je therapeut." }, 400);
    return uit ? json({ ok: true }) : json({ fout: "nog niet alle vragen zijn beantwoord" }, 400);
  }

  /* vanaf hier alleen voor wie ingelogd is en op de lijst staat */
  const s = await wie(env, req);
  if (!s) return json({ fout: "niet ingelogd" }, 401, { "set-cookie": zet(koekNaam(url), "", url, 0, "/", true) });
  const k = s.demo ? demoKluis(env, url) : kluis(env, url);
  /* de demo is van iedereen: er zit een grens aan hoeveel erin past */
  const vol = async wat => s.demo && (await k.tel())[wat] >= (wat === "dossiers" ? DEMO_DOSSIERS : DEMO_LIJSTEN);
  const klaar = async (obj, status, extra) => json(obj, status, Object.assign({ "set-cookie": await sessieKoekje(env, url, s) }, extra || {}));

  /* de lijst, en wat er door een leerling of mentor is ingevuld en nog niet bekeken */
  if (p === "/api/pmt/dossiers" && m === "GET") return klaar({ dossiers: await k.lijst(), nieuw: await k.nieuweMetingen() });
  const gm = p.match(/^\/api\/pmt\/dossiers\/([A-Za-z0-9_-]{8,24})\/gezien$/);
  if (gm && m === "POST"){ await k.zetGezien(gm[1]); return klaar({ ok: true }); }
  if (p === "/api/pmt/dossiers" && m === "POST"){
    let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return klaar({ fout: "dit kan de server niet lezen" }, 400); }
    if (await vol("dossiers")) return klaar({ fout: "de demo zit vol: haal eerst een dossier weg" }, 400);
    const d = await k.bewaar(null, inhoud, s.naam);
    return d ? klaar({ dossier: d }) : klaar({ fout: "een dossier heeft een voornaam nodig" }, 400);
  }
  const dm = p.match(/^\/api\/pmt\/dossiers\/([A-Za-z0-9_-]{8,24})(\/export)?$/);
  if (dm){
    const id = dm[1];
    if (dm[2]){
      if (m !== "GET") return klaar({ fout: "onbekend" }, 404);
      const d = await k.haal(id, s.naam, "geëxporteerd");
      if (!d) return klaar({ fout: "dit dossier bestaat niet" }, 404);
      return klaar({ soort: "pmt-dossier", uitgedraaid: new Date().toISOString(), dossier: d }, 200,
        { "content-disposition": "attachment; filename=\"pmt-dossier-" + id + ".json\"" });
    }
    if (m === "GET"){
      const d = await k.haal(id, s.naam, "geopend");
      return d ? klaar({ dossier: d }) : klaar({ fout: "dit dossier bestaat niet" }, 404);
    }
    if (m === "PUT"){
      let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return klaar({ fout: "dit kan de server niet lezen" }, 400); }
      const d = await k.bewaar(id, inhoud, s.naam);
      return d ? klaar({ dossier: d }) : klaar({ fout: "bewaren lukte niet" }, 400);
    }
    if (m === "DELETE"){
      return (await k.weg(id, s.naam)) ? klaar({ ok: true }) : klaar({ fout: "dit dossier bestaat niet" }, 404);
    }
  }
  const zm = p.match(/^\/api\/pmt\/dossiers\/([A-Za-z0-9_-]{8,24})\/afname$/);
  if (zm && m === "POST"){
    let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return klaar({ fout: "dit kan de server niet lezen" }, 400); }
    const a = await k.zetKlaar(zm[1], String(inhoud.lijst || ""), s.naam, { vast: !!inhoud.vast, door: inhoud.door === "mentor" ? "mentor" : "leerling" });
    if (a === "toestemming") return klaar({ fout: "er is nog geen toestemming van de ouders vastgelegd" }, 403);
    return a ? klaar(a) : klaar({ fout: "klaarzetten lukte niet: de lijst heeft nog geen vragen, of er staan al tien codes open bij deze leerling" }, 400);
  }
  const vm = p.match(/^\/api\/pmt\/dossiers\/([A-Za-z0-9_-]{8,24})\/verslag$/);
  if (vm && m === "POST"){ await k.meld(s.naam, "verslag gemaakt", vm[1]); return klaar({ ok: true }); }
  const pm = p.match(/^\/api\/pmt\/dossiers\/([A-Za-z0-9_-]{8,24})\/meting$/);
  if (pm && m === "POST"){
    let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return klaar({ fout: "dit kan de server niet lezen" }, 400); }
    const uit = await k.voerIn(pm[1], String(inhoud.lijst || ""), inhoud.antwoorden, inhoud.datum, s.naam);
    if (uit === "toestemming") return klaar({ fout: "er is nog geen toestemming van de ouders vastgelegd" }, 403);
    if (uit === null) return klaar({ fout: "dit dossier of deze lijst bestaat niet" }, 404);
    if (uit === "vol") return klaar({ fout: "er passen geen metingen meer bij: haal eerst oude metingen weg" }, 400);
    return uit ? klaar({ ok: true }) : klaar({ fout: "nog niet bij elke vraag is een bolletje gekozen" }, 400);
  }
  const im = p.match(/^\/api\/pmt\/afname\/([A-Za-z]{6})$/);
  if (im && m === "DELETE") return klaar({ ok: await k.trekIn(im[1].toUpperCase(), s.naam) });
  const mm = p.match(/^\/api\/pmt\/metingen\/([A-Za-z0-9_-]{8,24})$/);
  if (mm && m === "DELETE") return (await k.wegMeting(mm[1], s.naam)) ? klaar({ ok: true }) : klaar({ fout: "deze meting bestaat niet" }, 404);
  if (p === "/api/pmt/lijsten" && m === "GET") return klaar({ lijsten: await k.lijsten() });
  if (p === "/api/pmt/lijsten" && m === "POST"){
    let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return klaar({ fout: "dit kan de server niet lezen" }, 400); }
    if (await vol("lijsten")) return klaar({ fout: "de demo zit vol: haal eerst een lijst weg" }, 400);
    const l = await k.bewaarLijst(null, inhoud, s.naam);
    return l ? klaar({ lijst: l }) : klaar({ fout: "een vragenlijst heeft een titel nodig" }, 400);
  }
  const lm = p.match(/^\/api\/pmt\/lijsten\/([A-Za-z0-9_-]{8,24})$/);
  if (lm && m === "PUT"){
    let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return klaar({ fout: "dit kan de server niet lezen" }, 400); }
    const l = await k.bewaarLijst(lm[1], inhoud, s.naam);
    return l ? klaar({ lijst: l }) : klaar({ fout: "bewaren lukte niet" }, 400);
  }
  if (lm && m === "DELETE") return (await k.wegLijst(lm[1], s.naam)) ? klaar({ ok: true }) : klaar({ fout: "deze lijst bestaat niet" }, 404);
  if (p === "/api/pmt/proef/lijst" && m === "POST"){
    if (!proef(env)) return klaar({ fout: "dit is geen proefomgeving" }, 403);
    await k.zaaiLijst(s.naam);
    return klaar({ lijsten: await k.lijsten() });
  }
  if (p === "/api/pmt/rooster" && m === "GET") return klaar(await k.rooster(String(url.searchParams.get("week") || "")));
  if (p === "/api/pmt/rooster/vrij" && m === "PUT"){
    let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return klaar({ fout: "dit kan de server niet lezen" }, 400); }
    return klaar(await k.zetVrij(inhoud.vrij, s.naam, !!inhoud.ruim));
  }
  /* De schoolvakanties komen uit de open gegevens van de Rijksoverheid. Het zijn
     de landelijke data per regio; een school kan ervan afwijken, dus de
     therapeut kijkt ze na en slaat ze zelf op. Hier wordt niets bewaard. */
  if (p === "/api/pmt/rooster/vakanties" && m === "GET"){
    const gevraagd = url.searchParams.get("regio");
    const regio = ["noord", "midden", "zuid"].indexOf(gevraagd) >= 0 ? gevraagd : "noord";
    const nu = vandaagNL(), jaar = +nu.slice(0, 4), schooljaar = nu.slice(5) > "07-31" ? jaar + "-" + (jaar + 1) : (jaar - 1) + "-" + jaar;
    try {
      const r = await fetch("https://opendata.rijksoverheid.nl/v1/infotypes/schoolholidays/schoolyear/" + schooljaar + "?output=json", { headers: { accept: "application/json" } });
      if (!r.ok) throw new Error("status " + r.status);
      const d = await r.json(), lijst = [];
      for (const v of ((((d && d.content) || [])[0] || {}).vacations || [])){
        const g = (v.regions || []).find(x => String(x.region).trim() === regio) || (v.regions || []).find(x => String(x.region).trim() === "heel Nederland");
        if (!g) continue;
        const van = echteDag(String(g.startdate).slice(0, 10)), tot = echteDag(String(g.enddate).slice(0, 10));
        if (van && tot && tot >= van) lijst.push({ naam: tekst(String(v.type || "").trim(), 40) || "Vakantie", van, tot });
      }
      return klaar({ schooljaar, regio, vakanties: lijst });
    } catch (e){
      console.warn("pmt: vakanties ophalen mislukt", e && e.message);
      return klaar({ fout: "de vakanties ophalen bij de Rijksoverheid lukte niet. Vul ze met de hand in" }, 502);
    }
  }
  if (p === "/api/pmt/rooster/instelling" && m === "PUT"){
    let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return klaar({ fout: "dit kan de server niet lezen" }, 400); }
    const i = await k.zetRooster(inhoud, s.naam);
    return i ? klaar({ instelling: i }) : klaar({ fout: "deze tijden kloppen niet: het eind moet na het begin liggen en een blok duurt 10 tot 120 minuten" }, 400);
  }
  if (p === "/api/pmt/afspraken" && m === "POST"){
    let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return klaar({ fout: "dit kan de server niet lezen" }, 400); }
    const u = await k.plan(inhoud, s.naam);
    if (!u) return klaar({ fout: "deze afspraak klopt niet" }, 400);
    return u.gemaakt ? klaar(u) : klaar({ fout: u.pauze ? "dat valt in de pauze" : u.vrij ? "die dag is vrij: " + u.vrijNaam : "op dit moment staat al een afspraak" }, 409);
  }
  const km = p.match(/^\/api\/pmt\/afspraken\/([A-Za-z0-9_-]{8,24})\/komst$/);
  if (km && m === "PUT"){
    let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return klaar({ fout: "dit kan de server niet lezen" }, 400); }
    const u = await k.zetKomst(km[1], inhoud, s.naam);
    return u ? klaar(u) : klaar({ fout: "deze afspraak bestaat niet" }, 404);
  }
  const afm = p.match(/^\/api\/pmt\/afspraken\/([A-Za-z0-9_-]{8,24})$/);
  if (afm && m === "PUT"){
    let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return klaar({ fout: "dit kan de server niet lezen" }, 400); }
    const u = await k.verplaats(afm[1], inhoud, s.naam);
    if (u === null) return klaar({ fout: "deze afspraak bestaat niet of het moment klopt niet" }, 404);
    if (u === "vrij") return klaar({ fout: "die dag is vrij" }, 409);
    if (u === "pauze") return klaar({ fout: "dat valt in de pauze, of de afspraak past niet meer voor de pauze" }, 409);
    return u ? klaar({ ok: true }) : klaar({ fout: "op dat moment staat al een afspraak" }, 409);
  }
  if (afm && m === "DELETE") return (await k.wegAfspraak(afm[1], s.naam, url.searchParams.get("reeks") === "1")) ? klaar({ ok: true }) : klaar({ fout: "deze afspraak bestaat niet" }, 404);
  if (p === "/api/pmt/privacy" && m === "GET") return klaar({ maanden: await k.bewaartermijn() });
  if (p === "/api/pmt/privacy" && m === "PUT"){
    let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return klaar({ fout: "dit kan de server niet lezen" }, 400); }
    return klaar({ maanden: await k.zetBewaartermijn(inhoud.maanden, s.naam) });
  }
  const wm = p.match(/^\/api\/pmt\/dossiers\/([A-Za-z0-9_-]{8,24})\/wis$/);
  if (wm && m === "POST"){
    const d = await k.wisVerwerkt(wm[1], s.naam);
    return d ? klaar({ dossier: d }) : klaar({ fout: "dit dossier bestaat niet" }, 404);
  }
  const dl = p.match(/^\/api\/pmt\/dossiers\/([A-Za-z0-9_-]{8,24})\/logboek$/);
  if (dl && m === "GET") return klaar({ regels: await k.logboekVan(dl[1], s.naam) });
  if (p === "/api/pmt/toestemming" && m === "GET") return klaar({ tekst: await k.toestemmingstekst() });
  if (p === "/api/pmt/toestemming" && m === "PUT"){
    let inhoud; try { inhoud = await leesInhoud(req); } catch (e){ return klaar({ fout: "dit kan de server niet lezen" }, 400); }
    return klaar({ tekst: await k.zetToestemmingstekst(inhoud.tekst, s.naam) });
  }
  if (p === "/api/pmt/logboek" && m === "GET") return klaar({ regels: await k.logboek() });
  if (p === "/api/pmt/proef" && m === "POST"){
    if (!proef(env)) return klaar({ fout: "dit is geen proefomgeving" }, 403);
    if (await vol("dossiers")) return klaar({ fout: "de demo zit vol: haal eerst een dossier weg" }, 400);
    await k.zaai(s.naam);
    return klaar({ dossiers: await k.lijst() });
  }
  return klaar({ fout: "onbekend" }, 404);
}

/* ---------- wat er in een dossier mag staan ---------- */
function tekst(v, n){
  return String(v == null ? "" : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, n).trim();
}
function datum(v){ return /^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? String(v) : ""; }
/* De toestemming van de ouders (of van de leerling zelf vanaf zestien jaar).
   geen: nog niet gevraagd, gevraagd: het formulier is mee, ja: getekend, nee: geweigerd.
   Zonder ja legt het dossier alleen de aanmelding vast: geen notities, doelen,
   vragenlijsten of wekelijkse check. De server houdt dat zelf tegen. */
const TOESTEMMING = ["geen", "gevraagd", "ja", "nee"];
function schoonToestemming(t){
  t = t && typeof t === "object" ? t : {};
  return { status: TOESTEMMING.indexOf(t.status) >= 0 ? t.status : "geen", datum: datum(t.datum), door: tekst(t.door, 80) };
}
/* De tekst van het formulier, tot de school hem zelf aanpast. Een voorstel:
   de privacyfunctionaris van de school hoort hem na te kijken. */
const TOESTEMMINGSTEKST = [
  "Uw kind krijgt op school psychomotorische therapie (PMT). Om uw kind goed te begeleiden houdt de therapeut een dossier bij. Daarvoor vragen wij uw toestemming.",
  "",
  "Wat wij vastleggen",
  "- de voornaam, de eerste letter van de achternaam en de klas",
  "- de reden van de aanmelding en de doelen waaraan uw kind werkt",
  "- korte notities van de sessies",
  "- de antwoorden op vragenlijsten die uw kind invult, en de uitkomsten daarvan",
  "",
  "Wie het kan zien",
  "De therapeut. De technisch beheerder van het systeem kan er alleen bij als dat voor het beheer nodig is. Met anderen delen wij niets zonder dat u daar apart toestemming voor geeft.",
  "",
  "Hoe het bewaard wordt",
  "De gegevens staan versleuteld opgeslagen binnen de Europese Unie. Na afloop van de therapie bewaart de school ze niet langer dan nodig is en worden ze daarna verwijderd.",
  "",
  "Uw rechten",
  "U mag het dossier inzien, laten verbeteren en laten verwijderen. U kunt uw toestemming altijd intrekken. Dat heeft geen gevolgen voor het onderwijs aan uw kind."
].join("\n");
function schoon(d){
  d = d && typeof d === "object" ? d : {};
  const uit = {
    voornaam: tekst(d.voornaam, 40), letter: tekst(d.letter, 3), klas: tekst(d.klas, 12),
    start: datum(d.start), status: STATUS.indexOf(d.status) >= 0 ? d.status : "intake",
    hulpvraag: tekst(d.hulpvraag, 2000), proef: !!d.proef, doelen: [], notities: [],
    aangemeld: datum(d.aangemeld), door: tekst(d.door, 60), voorrang: !!d.voorrang,
    toestemming: schoonToestemming(d.toestemming)
  };
  for (const x of (Array.isArray(d.doelen) ? d.doelen : []).slice(0, 20)){
    const t = tekst(x && x.tekst, 300);
    if (t) uit.doelen.push({ tekst: t, klaar: !!(x && x.klaar) });
  }
  for (const x of (Array.isArray(d.notities) ? d.notities : []).slice(0, 500)){
    const t = tekst(x && x.tekst, 4000);
    if (t) uit.notities.push({ id: /^[A-Za-z0-9_-]{4,20}$/.test(String(x.id || "")) ? String(x.id) : willekeur(6), datum: datum(x.datum), tekst: t });
  }
  return uit.voornaam ? uit : null;
}
/* ---------- vragenlijsten ---------- */
const CODELETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";   /* geen I en O: die lees je verkeerd over */
function nieuweCode(){
  const r = crypto.getRandomValues(new Uint8Array(6));
  let c = ""; for (let i = 0; i < 6; i++) c += CODELETTERS[r[i] % CODELETTERS.length];
  return c;
}
/* hoe lang nog tot middernacht in Nederland */
function totMiddernacht(){
  const d = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const u = +d.find(x => x.type === "hour").value % 24, mi = +d.find(x => x.type === "minute").value;
  return Date.now() + ((23 - u) * 60 + (60 - mi)) * 60000;
}
function regels(v, n, lang){
  const uit = [];
  for (const x of (Array.isArray(v) ? v : []).slice(0, 40)){
    const t = tekst(x, lang);
    if (t && uit.indexOf(t) < 0 && uit.length < n) uit.push(t);
  }
  return uit;
}
function schoonLijst(d){
  d = d && typeof d === "object" ? d : {};
  const uit = { titel: tekst(d.titel, 80), uitleg: tekst(d.uitleg, 600), proef: !!d.proef, monitor: !!d.monitor,
    antwoorden: regels(d.antwoorden, 10, 30), schalen: regels(d.schalen, 12, 50), vragen: [] };
  if (uit.antwoorden.length < 2) uit.antwoorden = ["Nooit", "Bijna nooit", "Soms", "Vaak", "Altijd"];
  /* Bolletjes: de leerling kiest een cijfer, van 1 tot het aantal bolletjes. De
     twee uiteinden krijgen een betekenis (laag en hoog), de rest niet. */
  uit.vorm = d.vorm === "bollen" ? "bollen" : "knoppen";
  if (uit.vorm === "bollen"){
    const n = Math.max(2, Math.min(10, Array.isArray(d.antwoorden) ? d.antwoorden.length : 5));
    uit.antwoorden = Array.from({ length: n }, (x, i) => String(i + 1));
    uit.laag = tekst(d.laag, 40); uit.hoog = tekst(d.hoog, 40);
  }
  if (!uit.schalen.length) uit.schalen = ["Totaal"];
  for (const x of (Array.isArray(d.vragen) ? d.vragen : []).slice(0, 150)){
    const t = tekst(x && x.tekst, 300);
    if (!t) continue;
    uit.vragen.push({ id: /^[A-Za-z0-9_-]{4,20}$/.test(String(x.id || "")) ? String(x.id) : willekeur(6), tekst: t,
      schaal: uit.schalen.indexOf(x.schaal) >= 0 ? x.schaal : uit.schalen[0], om: !!x.om });
  }
  return uit.titel ? uit : null;
}
/* Van antwoorden naar scores. Elk antwoord telt 1 tot het aantal keuzes; een
   omgekeerde vraag telt andersom. De score van een schaal is het gemiddelde.
   Geeft false als er een vraag mist of een antwoord niet bestaat. */
function reken(l, antwoorden){
  const n = l.antwoorden.length, per = {}, rij = [];
  for (const v of l.vragen){
    const w = Number(antwoorden && antwoorden[v.id]);
    if (!Number.isInteger(w) || w < 1 || w > n) return false;
    (per[v.schaal] = per[v.schaal] || []).push(v.om ? n + 1 - w : w);
    rij.push({ tekst: v.tekst, schaal: v.schaal, waarde: w, label: l.antwoorden[w - 1], om: !!v.om });
  }
  const schalen = l.schalen.filter(x => per[x]).map(x => ({ naam: x, n: per[x].length,
    score: Math.round(100 * per[x].reduce((a, b) => a + b, 0) / per[x].length) / 100 }));
  return { titel: l.titel, max: n, schalen, antwoorden: rij, monitor: !!l.monitor };
}
/* een zelfbedachte lijst voor de proefomgeving, van geen enkele uitgever */
function voorbeeldLijst(){
  const A = "Spanning opmerken", B = "Tot rust komen", C = "Zelfvertrouwen";
  const v = (t, schaal, om) => ({ tekst: t, schaal, om: !!om });
  return { titel: "Voorbeeld: spanning en lijf", proef: true,
    uitleg: "Hieronder staan zinnen over hoe jij je voelt op school. Kies bij elke zin wat het beste bij jou past. Er zijn geen goede of foute antwoorden.",
    antwoorden: ["Nooit", "Bijna nooit", "Soms", "Vaak", "Altijd"], schalen: [A, B, C],
    vragen: [v("Ik merk het op tijd als ik gespannen raak.", A), v("Ik voel in mijn lijf waar de spanning zit.", A),
      v("Ik heb pas door dat ik boos ben als het al mis is gegaan.", A, true),
      v("Ik weet wat ik kan doen om rustig te worden.", B), v("Na een drukke les kom ik snel weer tot rust.", B),
      v("Als ik gespannen ben, blijft dat de hele dag hangen.", B, true),
      v("Ik durf te laten zien wat ik kan.", C), v("Ik voel me stevig staan als iemand het niet met me eens is.", C),
      v("Ik vind mezelf vaak minder goed dan anderen.", C, true)] };
}

/* de wekelijkse check van de proefomgeving: zes zelfbedachte zinnen, een per domein */
function voorbeeldMonitor(){
  const v = (schaal, t) => ({ tekst: t, schaal, om: false });
  const vragen = [v("Plannen", "Ik wist deze week wat ik moest doen en wanneer."),
    v("Beginnen aan een taak", "Ik begon aan mijn werk zonder dat iemand het hoefde te zeggen."),
    v("Aandacht vasthouden", "Ik kon mijn aandacht bij de les houden."),
    v("Emoties regelen", "Als ik boos of gespannen werd, kon ik weer rustig worden."),
    v("Schakelen", "Als iets anders liep dan ik dacht, kon ik daarmee omgaan."),
    v("Onthouden wat moet", "Ik had mijn spullen bij me en wist wat ik moest meenemen.")];
  return { titel: "Voorbeeld: weekcheck executieve functies", proef: true, monitor: true,
    uitleg: "Denk aan de afgelopen week op school. Kies bij elke zin hoe goed het lukte.",
    antwoorden: ["Lukte niet", "Lukte een beetje", "Soms wel, soms niet", "Lukte meestal", "Lukte goed"],
    schalen: vragen.map(x => x.schaal), vragen };
}
const WEEK = 7 * 86400000, VAST_WEKEN = 12, VAST_RUST = 6 * 3600000;
/* zoveel past er: per dossier, in het hele opslagobject, en aan open codes per dossier */
const MAX_METINGEN_DOSSIER = 400, MAX_METINGEN = 3000, MAX_CODES_DOSSIER = 10;

/* ---------- het rooster ---------- */
/* 8.30 tot 14.15, blokken van een half uur, met de twee pauzes van de school:
   10.00 tot 10.20 en 12.00 tot 12.35. Alles is in het rooster zelf aan te passen. */
const ROOSTER = { van: 8 * 60 + 30, tot: 14 * 60 + 15, blok: 30,
  pauzes: [{ naam: "Pauze", van: 10 * 60, tot: 10 * 60 + 20 }, { naam: "Pauze", van: 12 * 60, tot: 12 * 60 + 35 }] };
function schoonPauzes(lijst){
  const uit = [];
  for (const x of (Array.isArray(lijst) ? lijst : []).slice(0, 6)){
    const van = Math.round(Number(x && x.van)), tot = Math.round(Number(x && x.tot));
    if (van >= 0 && tot <= 1440 && van < tot) uit.push({ naam: tekst(x.naam, 30) || "Pauze", van, tot });
  }
  return uit.sort((a, b) => a.van - b.van);
}
const SOORTEN = ["sessie", "intake", "meting", "gesprek"];
const MAX_AFSPRAKEN = 3000;
function vandaagNL(){ return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date()); }
function plusDagen(d, n){ return new Date(Date.parse(d + "T12:00:00Z") + n * 86400000).toISOString().slice(0, 10); }
function echteDag(v){ const d = datum(v); return d && plusDagen(d, 0) === d ? d : ""; }
/* De laatste schooldag als er nog niets is ingesteld: 16 juli van dit schooljaar.
   De zomervakantie verschilt per regio en per jaar, dus de echte datum stel je zelf in. */
function schooljaarEinde(){
  const nu = vandaagNL(), jaar = +nu.slice(0, 4);
  return (nu.slice(5) > "07-31" ? jaar + 1 : jaar) + "-07-16";
}
const MAX_WEKEN = 53;
function maandagVan(d){ const w = (new Date(d + "T12:00:00Z").getUTCDay() + 6) % 7; return plusDagen(d, -w); }

function dag(verschil){ return new Date(Date.now() + verschil * 86400000).toISOString().slice(0, 10); }
/* verzonnen leerlingen voor de proefomgeving */
function voorbeelden(){
  return [
    { voornaam: "Sam", letter: "K", klas: "2B", start: dag(-84), status: "loopt", proef: true, toestemming: { status: "ja", datum: dag(-30), door: "ouder" },
      hulpvraag: "Sam raakt snel gespannen in de klas en merkt dat pas als het te laat is.",
      doelen: [{ tekst: "Spanning eerder opmerken in het lijf", klaar: true }, { tekst: "Zelf een ademoefening doen in de les", klaar: false }],
      notities: [{ datum: dag(-84), tekst: "Intake en beginmeting. Sam vertelt weinig maar doet goed mee met de oefeningen." },
        { datum: dag(-42), tekst: "Tweede meting. Doel bijgesteld: eerst opmerken, dan pas iets doen." },
        { datum: dag(-7), tekst: "Sessie 9: de ademoefening lukt nu zonder hulp." }] },
    { voornaam: "Noor", letter: "B", klas: "1A", start: dag(-28), status: "loopt", proef: true, toestemming: { status: "ja", datum: dag(-30), door: "ouder" },
      hulpvraag: "Noor durft weinig ruimte in te nemen en trekt zich terug bij drukte.",
      doelen: [{ tekst: "Stevig staan en de eigen ruimte aangeven", klaar: false }],
      notities: [{ datum: dag(-28), tekst: "Intake. Noor kiest zelf de oefeningen met de bal." }] },
    { voornaam: "Jesse", letter: "V", klas: "3C", start: dag(-3), status: "intake", proef: true, toestemming: { status: "ja", datum: dag(-3), door: "ouder" },
      hulpvraag: "Aangemeld door de mentor: veel boosheid na de pauze.", doelen: [], notities: [] },
    { voornaam: "Daan", letter: "R", klas: "1C", status: "wacht", proef: true, toestemming: { status: "gevraagd", datum: "", door: "" }, aangemeld: dag(-34), door: "mentor 1C", voorrang: true,
      hulpvraag: "Daan loopt vaak de klas uit als het druk wordt en komt dan moeilijk terug.", doelen: [], notities: [] },
    { voornaam: "Lotte", letter: "H", klas: "3A", status: "wacht", proef: true, aangemeld: dag(-12), door: "zorgcoördinator",
      hulpvraag: "Lotte heeft veel buikpijn voor toetsen en meldt zich dan ziek.", doelen: [], notities: [] },
    { voornaam: "Mila", letter: "D", klas: "2A", start: dag(-200), status: "afgerond", proef: true, toestemming: { status: "ja", datum: dag(-200), door: "ouder" },
      hulpvraag: "Mila wilde leren omgaan met spanning bij toetsen.",
      doelen: [{ tekst: "Voor een toets zelf tot rust komen", klaar: true }],
      notities: [{ datum: dag(-60), tekst: "Eindgesprek met Mila en de mentor. Traject afgerond." }] }
  ];
}

/* Wat de verzonnen leerlingen hebben ingevuld. metingen: hoeveel dagen geleden en
   de negen antwoorden op de voorbeeldlijst. weken: per week de zes antwoorden op
   de weekcheck, van de leerling en van de mentor; de laatste week is nu. Zo is er
   bij elke leerling iets te zien: een lang traject (Mila), een lopend traject met
   een terugval (Sam), een pas begonnen traject (Noor) en alleen een beginmeting (Jesse). */
const VOORBEELDCIJFERS = {
  Sam: { metingen: [[-84, [2, 2, 4, 3, 3, 4, 2, 3, 4]], [-42, [3, 2, 3, 4, 3, 3, 3, 3, 3]], [-7, [4, 3, 2, 4, 4, 2, 3, 4, 3]]],
    weken: { leerling: [[2, 1, 3, 2, 3, 2], [2, 2, 3, 3, 3, 2], [3, 2, 3, 3, 2, 3], [3, 3, 4, 4, 3, 3], [3, 3, 3, 4, 3, 4], [4, 3, 4, 4, 3, 4], [4, 4, 4, 4, 4, 4], [4, 4, 4, 2, 3, 5]],
      mentor: [[2, 2, 3, 2, 3, 2], [2, 2, 3, 2, 3, 3], [3, 2, 3, 3, 3, 3], [3, 3, 3, 3, 3, 3], [3, 3, 4, 4, 3, 3], [3, 3, 4, 4, 3, 4], [4, 4, 4, 4, 3, 4], [4, 3, 4, 3, 3, 4]] } },
  Noor: { metingen: [[-28, [2, 3, 3, 2, 2, 4, 2, 2, 4]], [-3, [3, 3, 3, 3, 2, 3, 2, 3, 4]]],
    weken: { leerling: [[3, 2, 3, 2, 2, 3], [3, 3, 3, 3, 2, 3], [3, 3, 4, 3, 3, 3], [4, 3, 4, 3, 3, 4]] } },
  Mila: { metingen: [[-200, [2, 2, 4, 2, 1, 5, 2, 2, 5]], [-150, [3, 2, 3, 3, 2, 4, 2, 2, 4]], [-100, [4, 3, 2, 3, 3, 3, 3, 4, 3]], [-60, [4, 4, 1, 4, 4, 2, 4, 3, 2]]], weken: {} },
  Jesse: { metingen: [[-3, [2, 2, 4, 2, 2, 4, 3, 2, 4]]], weken: {} }
};
/* verandert dit getal, dan vult de demo zich opnieuw, ook als hij nog geen dag oud is */
const DEMO_VERSIE = "12";

export class Pmt extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => { if ((await ctx.storage.getAlarm()) == null) await ctx.storage.setAlarm(Date.now() + 3600000); });
    this.sql.exec("CREATE TABLE IF NOT EXISTS dossier (id TEXT PRIMARY KEY, inhoud TEXT NOT NULL, gemaakt INTEGER NOT NULL, bijgewerkt INTEGER NOT NULL)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS lijst (id TEXT PRIMARY KEY, inhoud TEXT NOT NULL, bijgewerkt INTEGER NOT NULL)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS afname (code TEXT PRIMARY KEY, dossier TEXT NOT NULL, lijst TEXT NOT NULL, gemaakt INTEGER NOT NULL, tot INTEGER NOT NULL)");
    /* de vaste code van de wekelijkse check kwam er later bij */
    for (const kolom of ["vast INTEGER NOT NULL DEFAULT 0", "door TEXT NOT NULL DEFAULT 'leerling'", "laatst INTEGER NOT NULL DEFAULT 0"]){
      try { this.sql.exec("ALTER TABLE afname ADD COLUMN " + kolom); } catch (e){ /* de kolom is er al */ }
    }
    this.sql.exec("CREATE TABLE IF NOT EXISTS meting (id TEXT PRIMARY KEY, dossier TEXT NOT NULL, inhoud TEXT NOT NULL, t INTEGER NOT NULL)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS afspraak (id TEXT PRIMARY KEY, dag TEXT NOT NULL, begin INTEGER NOT NULL, duur INTEGER NOT NULL, dossier TEXT NOT NULL, soort TEXT NOT NULL)");
    /* een dichtgezet blok is een afspraak zonder leerling, met een korte tekst erbij */
    try { this.sql.exec("ALTER TABLE afspraak ADD COLUMN tekst TEXT NOT NULL DEFAULT ''"); } catch (e){ /* de kolom is er al */ }
    /* was de leerling er: komst is leeg, aanwezig of afwezig; bij afwezig hoort een reden */
    /* gezien: 0 zolang de therapeut een door de leerling of mentor ingevulde lijst nog niet heeft bekeken */
    try { this.sql.exec("ALTER TABLE meting ADD COLUMN gezien INTEGER NOT NULL DEFAULT 1"); } catch (e){ /* de kolom is er al */ }
    for (const kolom of ["komst TEXT NOT NULL DEFAULT ''", "reden TEXT NOT NULL DEFAULT ''"]){
      try { this.sql.exec("ALTER TABLE afspraak ADD COLUMN " + kolom); } catch (e){ /* de kolom is er al */ }
    }
    this.sql.exec("CREATE TABLE IF NOT EXISTS stand (k TEXT PRIMARY KEY, v TEXT NOT NULL)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS logboek (n INTEGER PRIMARY KEY AUTOINCREMENT, t INTEGER NOT NULL, wie TEXT NOT NULL, wat TEXT NOT NULL, dossier TEXT NOT NULL)");
  }
  async sleutel(){
    if (!this._sleutel){
      if (!this.env.PMT_SLEUTEL) throw new Error("geen sleutel");
      this._sleutel = await crypto.subtle.importKey("raw", await sha256("pmt-kluis|" + this.env.PMT_SLEUTEL), "AES-GCM", false, ["encrypt", "decrypt"]);
    }
    return this._sleutel;
  }
  async dicht(obj){
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const c = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await this.sleutel(), new TextEncoder().encode(JSON.stringify(obj)));
    return b64url(iv) + "." + b64url(c);
  }
  async open(t){
    const [iv, c] = String(t).split(".");
    const b = await crypto.subtle.decrypt({ name: "AES-GCM", iv: vanB64url(iv) }, await this.sleutel(), vanB64url(c));
    return JSON.parse(new TextDecoder().decode(b));
  }
  /* Hetzelfde nog eens binnen tien minuten (elke toets bewaart) is geen nieuwe regel. */
  meld(wie, wat, dossier){
    const nu = Date.now();
    const vorige = this.sql.exec("SELECT n, t, wie, wat, dossier FROM logboek ORDER BY n DESC LIMIT 1").toArray()[0];
    if (vorige && vorige.wie === wie && vorige.wat === wat && vorige.dossier === dossier && nu - vorige.t < 600000){
      this.sql.exec("UPDATE logboek SET t = ? WHERE n = ?", nu, vorige.n);
    } else {
      this.sql.exec("INSERT INTO logboek (t, wie, wat, dossier) VALUES (?, ?, ?, ?)", nu, String(wie).slice(0, 80), wat, dossier || "");
      this.sql.exec("DELETE FROM logboek WHERE n <= (SELECT MAX(n) FROM logboek) - 5000");
    }
  }
  tel(){
    return { dossiers: this.sql.exec("SELECT COUNT(*) AS n FROM dossier").one().n, lijsten: this.sql.exec("SELECT COUNT(*) AS n FROM lijst").one().n };
  }
  /* Alleen voor het demo-object: is de demo leeg of ouder dan een dag, dan
     gaat alles weg en komen de voorbeelden er opnieuw in. Wat bezoekers er
     achterlieten blijft zo nooit lang staan. */
  async demoKlaar(){
    const r = this.sql.exec("SELECT v FROM stand WHERE k = 'gezaaid'").toArray()[0];
    const versie = this.sql.exec("SELECT v FROM stand WHERE k = 'versie'").toArray()[0];
    if (r && Date.now() - Number(r.v) < DEMO_DAG && this.tel().dossiers && versie && versie.v === DEMO_VERSIE) return;
    for (const t of ["dossier", "meting", "afname", "lijst", "logboek", "afspraak"]) this.sql.exec("DELETE FROM " + t);
    await this.zaai("Demo");
    this.sql.exec("INSERT OR REPLACE INTO stand (k, v) VALUES ('gezaaid', ?)", String(Date.now()));
    this.sql.exec("INSERT OR REPLACE INTO stand (k, v) VALUES ('versie', ?)", DEMO_VERSIE);
  }
  /* ---------- het rooster ---------- */
  /* Vakanties en vrije dagen: een lijst van perioden met een naam. Een losse
     dag (studiedag, feestdag) is een periode van een dag. */
  vrijeDagen(){
    const r = this.sql.exec("SELECT v FROM stand WHERE k = 'vrij'").toArray()[0];
    try { const l = r && JSON.parse(r.v); if (Array.isArray(l)) return l; } catch (e){ /* dan geen */ }
    return [];
  }
  vrijOp(d, lijst){ return (lijst || this.vrijeDagen()).find(v => v.van <= d && d <= v.tot) || null; }
  zetVrij(lijst, wie, ruim){
    const uit = [];
    for (const x of (Array.isArray(lijst) ? lijst : []).slice(0, 80)){
      const van = echteDag(x && x.van); if (!van) continue;
      let tot = echteDag(x && x.tot); if (!tot || tot < van) tot = van;
      if (tot > plusDagen(van, 70)) tot = plusDagen(van, 70);
      uit.push({ naam: tekst(x.naam, 40) || "Vrij", van, tot });
    }
    uit.sort((a, b) => a.van < b.van ? -1 : a.van > b.van ? 1 : 0);
    this.sql.exec("INSERT OR REPLACE INTO stand (k, v) VALUES ('vrij', ?)", JSON.stringify(uit));
    /* wat er nog staat op een vrije dag: tellen, of weghalen als daarom gevraagd is */
    let erin = 0, weg = 0;
    for (const a of this.sql.exec("SELECT id, dag, soort FROM afspraak WHERE dag >= ?", vandaagNL()).toArray()){
      if (!this.vrijOp(a.dag, uit)) continue;
      if (ruim){ this.sql.exec("DELETE FROM afspraak WHERE id = ?", a.id); weg++; }
      else if (a.soort !== "dicht") erin++;
    }
    this.meld(wie, "vakanties en vrije dagen aangepast" + (weg ? ", " + weg + " afspraken op vrije dagen weggehaald" : ""), "");
    return { vrij: uit, erin, weg };
  }
  /* valt dit moment in een pauze? */
  pauzeOp(begin, duur){ return (this.roosterInstelling().pauzes || []).find(p => begin < p.tot && begin + duur > p.van) || null; }
  roosterInstelling(){
    const r = this.sql.exec("SELECT v FROM stand WHERE k = 'rooster'").toArray()[0];
    try { const i = r && JSON.parse(r.v); if (i && i.van < i.tot && i.blok >= 10) return Object.assign({ eind: schooljaarEinde(), pauzes: ROOSTER.pauzes }, i); } catch (e){ /* dan de standaard */ }
    return Object.assign({ eind: schooljaarEinde() }, ROOSTER);
  }
  zetRooster(d, wie){
    const van = Math.round(Number(d && d.van)), tot = Math.round(Number(d && d.tot)), blok = Math.round(Number(d && d.blok));
    if (!(van >= 0 && tot <= 1440 && van < tot) || !(blok >= 10 && blok <= 120)) return null;
    const i = { van, tot, blok, eind: echteDag(d && d.eind) || schooljaarEinde(),
      pauzes: Array.isArray(d.pauzes) ? schoonPauzes(d.pauzes) : this.roosterInstelling().pauzes };
    this.sql.exec("INSERT OR REPLACE INTO stand (k, v) VALUES ('rooster', ?)", JSON.stringify(i));
    this.meld(wie, "tijden van het rooster aangepast", "");
    return i;
  }
  rooster(week){
    const ma = maandagVan(echteDag(week) || vandaagNL());
    return { week: ma, vandaag: vandaagNL(), instelling: this.roosterInstelling(), vrij: this.vrijeDagen(),
      afspraken: this.sql.exec("SELECT id, dag, begin, duur, dossier, soort, tekst, komst, reden FROM afspraak WHERE dag >= ? AND dag <= ? ORDER BY dag, begin", ma, plusDagen(ma, 6)).toArray() };
  }
  /* Inplannen, een keer of een aantal weken achter elkaar op dezelfde dag en
     tijd. Waar al iets staat, slaat hij die week over. */
  /* Krijgt iemand van de wachtrij een afspraak, dan is er een plek: het dossier
     gaat naar intake en krijgt die dag als start als er nog geen was. */
  async vanWachtrij(id, dagEen){
    const r = this.sql.exec("SELECT inhoud FROM dossier WHERE id = ?", id).toArray()[0];
    if (!r) return;
    const d = await this.open(r.inhoud);
    if (d.status !== "wacht") return;
    d.status = "intake"; if (!d.start) d.start = dagEen;
    this.sql.exec("UPDATE dossier SET inhoud = ?, bijgewerkt = ? WHERE id = ?", await this.dicht(d), Date.now(), id);
    this.meld("het rooster", "van de wachtrij naar intake", id);
  }
  async plan(d, wie){
    const dagEen = echteDag(d && d.dag), begin = Math.round(Number(d && d.begin)), duur = Math.round(Number(d && d.duur));
    const isDicht = !!(d && d.dicht);
    const soort = isDicht ? "dicht" : SOORTEN.indexOf(d && d.soort) >= 0 ? d.soort : "sessie";
    /* een aantal weken, of elke week tot en met een datum (hooguit een jaar) */
    const totDag = echteDag(d && d.tot);
    const weken = totDag && dagEen && totDag >= dagEen
      ? Math.min(MAX_WEKEN, Math.floor((Date.parse(totDag + "T12:00:00Z") - Date.parse(dagEen + "T12:00:00Z")) / (7 * 86400000)) + 1)
      : Math.max(1, Math.min(12, Math.round(Number(d && d.weken)) || 1));
    if (!dagEen || !(begin >= 0 && begin < 1440) || !(duur >= 5 && duur <= (isDicht ? 1440 : 240)) || begin + duur > 1440) return null;
    if (!isDicht && !this.sql.exec("SELECT id FROM dossier WHERE id = ?", String(d.dossier || "")).toArray().length) return null;
    if (this.sql.exec("SELECT COUNT(*) AS n FROM afspraak").one().n + weken > MAX_AFSPRAKEN) return null;
    /* een leerling plan je niet in de pauze; dichtzetten mag er wel overheen */
    if (!isDicht && this.pauzeOp(begin, duur)) return { gemaakt: 0, overgeslagen: 0, vrij: 0, vrijNaam: "", pauze: true };
    let gemaakt = 0, overgeslagen = 0, vrij = 0, vrijNaam = "";
    const vrijLijst = this.vrijeDagen();
    for (let w = 0; w < weken; w++){
      const dagNu = plusDagen(dagEen, 7 * w);
      /* een vakantie of vrije dag slaat hij over */
      const v = this.vrijOp(dagNu, vrijLijst);
      if (v){ vrij++; vrijNaam = v.naam; continue; }
      const bezet = this.sql.exec("SELECT id FROM afspraak WHERE dag = ? AND begin < ? AND begin + duur > ?", dagNu, begin + duur, begin).toArray().length;
      if (bezet){ overgeslagen++; continue; }
      this.sql.exec("INSERT INTO afspraak (id, dag, begin, duur, dossier, soort, tekst) VALUES (?, ?, ?, ?, ?, ?, ?)", willekeur(9), dagNu, begin, duur, isDicht ? "" : d.dossier, soort, isDicht ? tekst(d.tekst, 40) : "");
      gemaakt++;
    }
    if (gemaakt && isDicht) this.meld(wie, gemaakt === 1 ? "blok dichtgezet" : gemaakt + " blokken dichtgezet", "");
    else if (gemaakt){
      this.meld(wie, gemaakt === 1 ? "afspraak ingepland" : gemaakt + " afspraken ingepland", d.dossier);
      await this.vanWachtrij(d.dossier, dagEen);
    }
    return { gemaakt, overgeslagen, vrij, vrijNaam };
  }
  /* een afspraak naar een andere dag of tijd; de lengte blijft */
  verplaats(id, d, wie){
    const a = this.sql.exec("SELECT dossier, duur, soort FROM afspraak WHERE id = ?", id).toArray()[0];
    const dagNu = echteDag(d && d.dag), begin = Math.round(Number(d && d.begin));
    if (!a || !dagNu || !(begin >= 0) || begin + a.duur > 1440) return null;
    if (this.vrijOp(dagNu)) return "vrij";
    if (a.soort !== "dicht" && this.pauzeOp(begin, a.duur)) return "pauze";
    if (this.sql.exec("SELECT id FROM afspraak WHERE dag = ? AND begin < ? AND begin + duur > ? AND id <> ?", dagNu, begin + a.duur, begin, id).toArray().length) return false;
    this.sql.exec("UPDATE afspraak SET dag = ?, begin = ? WHERE id = ?", dagNu, begin, id);
    this.meld(wie, "afspraak verplaatst", a.dossier);
    return true;
  }
  /* Was de leerling er? Bij afwezig hoort een korte reden (ziek, weigerde, ...).
     In het logboek komt alleen dat het genoteerd is, niet de reden. */
  zetKomst(id, d, wie){
    const a = this.sql.exec("SELECT dossier, soort FROM afspraak WHERE id = ?", id).toArray()[0];
    if (!a || a.soort === "dicht") return null;
    const komst = ["aanwezig", "afwezig"].indexOf(d && d.komst) >= 0 ? d.komst : "";
    const reden = komst === "afwezig" ? tekst(d.reden, 60) : "";
    this.sql.exec("UPDATE afspraak SET komst = ?, reden = ? WHERE id = ?", komst, reden, id);
    this.meld(wie, komst ? komst + " genoteerd" : "aanwezigheid gewist", a.dossier);
    return { komst, reden };
  }
  /* Een afspraak weg. Met reeks ook alle latere van dezelfde leerling op
     dezelfde weekdag en tijd: zo haal je een heel jaar in een keer weg. */
  wegAfspraak(id, wie, reeks){
    const r = this.sql.exec("SELECT dossier, dag, begin FROM afspraak WHERE id = ?", id).toArray()[0];
    if (!r) return false;
    let n = 1;
    if (reeks){
      n = 0;
      const start = Date.parse(r.dag + "T12:00:00Z");
      for (const x of this.sql.exec("SELECT id, dag FROM afspraak WHERE dossier = ? AND begin = ? AND dag >= ?", r.dossier, r.begin, r.dag).toArray()){
        if (Math.round((Date.parse(x.dag + "T12:00:00Z") - start) / 86400000) % 7 === 0){ this.sql.exec("DELETE FROM afspraak WHERE id = ?", x.id); n++; }
      }
    } else this.sql.exec("DELETE FROM afspraak WHERE id = ?", id);
    this.meld(wie, n === 1 ? "afspraak verwijderd" : n + " afspraken verwijderd", r.dossier);
    return true;
  }
  /* is er nog plek voor een meting bij dit dossier? */
  plek(dossier){
    return this.sql.exec("SELECT COUNT(*) AS n FROM meting WHERE dossier = ?", dossier).one().n < MAX_METINGEN_DOSSIER
      && this.sql.exec("SELECT COUNT(*) AS n FROM meting").one().n < MAX_METINGEN;
  }
  async alles(){
    const uit = [];
    for (const r of this.sql.exec("SELECT id, inhoud, gemaakt, bijgewerkt FROM dossier").toArray()){
      try { uit.push(Object.assign(await this.open(r.inhoud), { id: r.id, gemaakt: r.gemaakt, bijgewerkt: r.bijgewerkt })); }
      catch (e){ console.error("pmt: dossier niet te openen", r.id); }
    }
    return uit;
  }
  /* ---------- bewaartermijn ---------- */
  /* Hoeveel maanden na het afronden een dossier blijft staan. 0 betekent dat er
     niets vanzelf verdwijnt; de school hoort de termijn zelf vast te stellen. */
  bewaartermijn(){
    const r = this.sql.exec("SELECT v FROM stand WHERE k = 'bewaar'").toArray()[0];
    const n = Math.round(Number(r && r.v));
    return n >= 1 && n <= 240 ? n : 0;
  }
  zetBewaartermijn(m, wie){
    let n = Math.round(Number(m)); n = n >= 1 && n <= 240 ? n : 0;
    this.sql.exec("INSERT OR REPLACE INTO stand (k, v) VALUES ('bewaar', ?)", String(n));
    this.meld(wie, n ? "bewaartermijn op " + n + " maanden gezet" : "bewaartermijn uitgezet", "");
    return n;
  }
  /* Sinds wanneer een dossier is afgerond. Een dossier dat al afgerond was voordat
     dit werd bijgehouden, telt vanaf de laatste wijziging. */
  afgerondSinds(d){
    if (d.status !== "afgerond") return "";
    return d.afgerondOp || (d.bijgewerkt ? new Date(d.bijgewerkt).toISOString().slice(0, 10) : "");
  }
  /* de dag waarop een afgerond dossier weggaat, of leeg */
  wegOp(d, maanden){
    const sinds = this.afgerondSinds(d);
    if (!maanden || !sinds) return "";
    const t = new Date(sinds + "T12:00:00Z"); t.setUTCMonth(t.getUTCMonth() + maanden);
    return t.toISOString().slice(0, 10);
  }
  async ruimOp(){
    const maanden = this.bewaartermijn(); if (!maanden) return 0;
    let n = 0;
    for (const d of await this.alles()){
      const w = this.wegOp(d, maanden);
      if (w && w <= vandaagNL()){ this.weg(d.id, "het systeem, na de bewaartermijn"); n++; }
    }
    return n;
  }
  async alarm(){
    try { await this.ruimOp(); } catch (e){ console.error("pmt: opruimen mislukt", e && e.message); }
    await this.ctx.storage.setAlarm(Date.now() + 86400000);
  }
  /* Na het intrekken van de toestemming: alles wat er verwerkt is weg. De
     aanmelding (naam, klas, datum) blijft staan tot het dossier zelf weggaat. */
  async wisVerwerkt(id, wie){
    const r = this.sql.exec("SELECT inhoud FROM dossier WHERE id = ?", id).toArray()[0];
    if (!r) return null;
    const d = await this.open(r.inhoud);
    d.notities = []; d.doelen = []; d.hulpvraag = "";
    this.sql.exec("UPDATE dossier SET inhoud = ?, bijgewerkt = ? WHERE id = ?", await this.dicht(d), Date.now(), id);
    this.sql.exec("DELETE FROM meting WHERE dossier = ?", id);
    this.sql.exec("DELETE FROM afname WHERE dossier = ?", id);
    this.sql.exec("DELETE FROM afspraak WHERE dossier = ?", id);
    this.meld(wie, "verwerkte gegevens gewist", id);
    return this.haal(id);
  }
  logboekVan(id, wie){
    this.meld(wie, "inzage uitgedraaid", id);
    return this.sql.exec("SELECT t, wie, wat FROM logboek WHERE dossier = ? ORDER BY n DESC LIMIT 500", id).toArray();
  }
  /* wat er is ingevuld en nog niet bekeken, nieuwste eerst */
  async nieuweMetingen(){
    const uit = [];
    for (const r of this.sql.exec("SELECT id, dossier, inhoud, t FROM meting WHERE gezien = 0 ORDER BY t DESC LIMIT 30").toArray()){
      try { const m = await this.open(r.inhoud); uit.push({ id: r.id, dossier: r.dossier, t: r.t, titel: m.titel, monitor: !!m.monitor, door: m.door || "leerling" }); }
      catch (e){ console.error("pmt: nieuwe meting niet te openen"); }
    }
    return uit;
  }
  zetGezien(dossier){ this.sql.exec("UPDATE meting SET gezien = 1 WHERE dossier = ? AND gezien = 0", dossier); }
  async lijst(){
    const bewaar = this.bewaartermijn();
    const nw = {};
    for (const r of this.sql.exec("SELECT dossier, COUNT(*) AS n FROM meting WHERE gezien = 0 GROUP BY dossier").toArray()) nw[r.dossier] = r.n;
    /* Per leerling het verloop voor de kleine grafiek op de kaart: van elke
       gewone meting het gemiddelde over de schalen, tussen 0 en 1. De
       wekelijkse checks tellen apart. */
    const met = {}, cod = {};
    for (const r of this.sql.exec("SELECT dossier, inhoud, t FROM meting ORDER BY t").toArray()){
      try {
        const m = await this.open(r.inhoud);
        const p = met[r.dossier] = met[r.dossier] || { trend: [], weken: 0, t: 0 };
        if (m.monitor){ p.weken++; continue; }
        if (!m.schalen.length || !(m.max > 1)) continue;
        const gem = m.schalen.reduce((a, x) => a + x.score, 0) / m.schalen.length;
        p.trend.push(Math.round(100 * (gem - 1) / (m.max - 1)) / 100); p.t = r.t;
      } catch (e){ console.error("pmt: meting niet te openen voor de lijst"); }
    }
    for (const r of this.sql.exec("SELECT dossier, COUNT(*) AS n FROM afname WHERE tot >= ? GROUP BY dossier", Date.now()).toArray()) cod[r.dossier] = r.n;
    const volgende = {};
    for (const r of this.sql.exec("SELECT dossier, dag, begin FROM afspraak WHERE dag >= ? ORDER BY dag, begin", vandaagNL()).toArray()){
      if (!volgende[r.dossier]) volgende[r.dossier] = { dag: r.dag, begin: r.begin };
    }
    return (await this.alles()).map(d => ({ id: d.id, volgende: volgende[d.id] || null,
      toestemming: (d.toestemming && d.toestemming.status) || "geen",
      aangemeld: d.aangemeld || "", door: d.door || "", voorrang: !!d.voorrang, reden: d.status === "wacht" ? String(d.hulpvraag || "").slice(0, 160) : "", voornaam: d.voornaam, letter: d.letter, klas: d.klas, status: d.status, start: d.start,
      proef: !!d.proef, notities: d.notities.length, bijgewerkt: d.bijgewerkt,
      metingen: met[d.id] ? met[d.id].trend.length : 0, laatsteMeting: met[d.id] ? met[d.id].t : 0, weekchecks: met[d.id] ? met[d.id].weken : 0,
      trend: met[d.id] ? met[d.id].trend.slice(-8) : [], codes: cod[d.id] || 0, nieuw: nw[d.id] || 0, afgerondOp: this.afgerondSinds(d), wegOp: this.wegOp(d, bewaar) }))
      .sort((a, b) => a.voornaam.localeCompare(b.voornaam, "nl"));
  }
  async haal(id, wie, wat){
    const r = this.sql.exec("SELECT inhoud, gemaakt, bijgewerkt FROM dossier WHERE id = ?", id).toArray()[0];
    if (!r) return null;
    const d = Object.assign(await this.open(r.inhoud), { id, gemaakt: r.gemaakt, bijgewerkt: r.bijgewerkt });
    /* de ingevulde lijsten en de codes die nog openstaan horen erbij, maar staan apart:
       wat de leerling instuurt kan zo nooit overschreven worden door een dossier dat openstaat */
    d.metingen = [];
    for (const x of this.sql.exec("SELECT id, inhoud, t, gezien FROM meting WHERE dossier = ? ORDER BY t", id).toArray()){
      try { d.metingen.push(Object.assign(await this.open(x.inhoud), { id: x.id, t: x.t, nieuw: !x.gezien })); } catch (e){ console.error("pmt: meting niet te openen", x.id); }
    }
    this.sql.exec("DELETE FROM afname WHERE tot < ?", Date.now());
    d.afnames = this.sql.exec("SELECT code, lijst, tot, vast, door FROM afname WHERE dossier = ? ORDER BY gemaakt", id).toArray()
      .map(x => { const l = JSON.parse(x.lijst); return { code: x.code, titel: l.titel, lijst: l.id, tot: x.tot, vast: !!x.vast, door: x.door }; });
    d.afspraken = this.sql.exec("SELECT id, dag, begin, duur, soort, komst, reden FROM afspraak WHERE dossier = ? AND dag >= ? ORDER BY dag, begin LIMIT 12", id, vandaagNL()).toArray();
    /* wat er geweest is (en vandaag), nieuwste eerst: voor de aanwezigheid */
    d.geweest = this.sql.exec("SELECT id, dag, begin, duur, soort, komst, reden FROM afspraak WHERE dossier = ? AND dag <= ? ORDER BY dag DESC, begin DESC LIMIT 60", id, vandaagNL()).toArray();
    if (wat) this.meld(wie, wat, id);
    return d;
  }
  async bewaar(id, inhoud, wie){
    const d = schoon(inhoud);
    if (!d) return null;
    const nu = Date.now();
    if (id){
      const oudRij = this.sql.exec("SELECT inhoud FROM dossier WHERE id = ?", id).toArray()[0];
      if (!oudRij) return null;
      const oud = await this.open(oudRij.inhoud), was = (oud.toestemming && oud.toestemming.status) || "geen";
      if (d.toestemming.status !== "ja"){ d.notities = oud.notities || []; d.doelen = oud.doelen || []; }
      d.afgerondOp = d.status === "afgerond" ? (oud.afgerondOp || vandaagNL()) : "";
      this.sql.exec("UPDATE dossier SET inhoud = ?, bijgewerkt = ? WHERE id = ?", await this.dicht(d), nu, id);
      this.meld(wie, "gewijzigd", id);
      if (was !== d.toestemming.status) this.meld(wie, "toestemming van de ouders: " + { geen: "nog niet gevraagd", gevraagd: "formulier meegegeven", ja: "getekend", nee: "geweigerd" }[d.toestemming.status], id);
    } else {
      if (d.toestemming.status !== "ja"){ d.notities = []; d.doelen = []; }
      d.afgerondOp = d.status === "afgerond" ? vandaagNL() : "";
      id = willekeur(9);
      this.sql.exec("INSERT INTO dossier (id, inhoud, gemaakt, bijgewerkt) VALUES (?, ?, ?, ?)", id, await this.dicht(d), nu, nu);
      this.meld(wie, "gemaakt", id);
    }
    return this.haal(id);
  }
  weg(id, wie){
    if (!this.sql.exec("SELECT id FROM dossier WHERE id = ?", id).toArray().length) return false;
    this.sql.exec("DELETE FROM dossier WHERE id = ?", id);
    this.sql.exec("DELETE FROM meting WHERE dossier = ?", id);
    this.sql.exec("DELETE FROM afname WHERE dossier = ?", id);
    this.sql.exec("DELETE FROM afspraak WHERE dossier = ?", id);
    this.meld(wie, "verwijderd", id);
    return true;
  }
  async logboek(){
    const namen = {};
    for (const d of await this.alles()) namen[d.id] = d.voornaam + (d.letter ? " " + d.letter + "." : "");
    return this.sql.exec("SELECT t, wie, wat, dossier FROM logboek ORDER BY n DESC LIMIT 300").toArray()
      .map(r => ({ t: r.t, wie: r.wie, wat: r.wat, dossier: r.dossier ? (namen[r.dossier] || "een verwijderd dossier") : "" }));
  }
  async zaai(wie){
    const l = await this.zaaiLijst(wie);
    if (!this.vrijeDagen().length){
      const wo = plusDagen(maandagVan(vandaagNL()), 9);
      this.sql.exec("INSERT OR REPLACE INTO stand (k, v) VALUES ('vrij', ?)", JSON.stringify([{ naam: "Studiedag", van: wo, tot: wo }]));
    }
    const mon = this.lijsten().find(x => x.proef && x.monitor);
    const erbij = async (dossier, lijst, waarden, t, door) => {
      const antw = {}; lijst.vragen.forEach((q, i) => { antw[q.id] = waarden[i]; });
      const m = reken(lijst, antw);
      if (m) this.sql.exec("INSERT INTO meting (id, dossier, inhoud, t) VALUES (?, ?, ?, ?)", willekeur(9), dossier, await this.dicht(Object.assign(m, { lijst: lijst.id }, door ? { door } : {})), t);
    };
    for (const v of voorbeelden()){
      const d = await this.bewaar(null, v, wie);
      const vast = d && { Sam: [1, 9 * 60, "sessie"], Noor: [3, 10 * 60 + 20, "sessie"], Jesse: [2, 13 * 60 + 5, "intake"] }[v.voornaam];
      if (vast){
        const ma = maandagVan(vandaagNL());
        for (let w = (vast[2] === "intake" ? 0 : -5); w < (vast[2] === "intake" ? 1 : 4); w++){
          const dagA = plusDagen(ma, vast[0] + 7 * w), geweest = dagA < vandaagNL();
          const afw = geweest && w === -3 ? (v.voornaam === "Sam" ? "Ziek" : "Weigerde") : "";
          this.sql.exec("INSERT INTO afspraak (id, dag, begin, duur, dossier, soort, komst, reden) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", willekeur(9), dagA, vast[1], 30, d.id, vast[2],
            !geweest ? "" : afw ? "afwezig" : "aanwezig", afw);
        }
      }
      const c = d && VOORBEELDCIJFERS[v.voornaam];
      if (!c) continue;
      for (const [terug, w] of c.metingen) await erbij(d.id, l, w, Date.now() + terug * 86400000);
      if (mon) for (const door of Object.keys(c.weken)){
        const weken = c.weken[door];
        for (let i = 0; i < weken.length; i++) await erbij(d.id, mon, weken[i], Date.now() - (weken.length - 1 - i) * WEEK - 3600000, door);
      }
    }
    /* zodat er in het voorbeeld iets nieuws te zien is: de twee laatst ingevulde lijsten zijn nog niet bekeken */
    this.sql.exec("UPDATE meting SET gezien = 0 WHERE id IN (SELECT id FROM meting ORDER BY t DESC LIMIT 2)");
  }
  /* ---------- vragenlijsten ---------- */
  lijsten(){
    return this.sql.exec("SELECT id, inhoud, bijgewerkt FROM lijst").toArray()
      .map(r => Object.assign(JSON.parse(r.inhoud), { id: r.id, bijgewerkt: r.bijgewerkt }))
      .sort((a, b) => a.titel.localeCompare(b.titel, "nl"));
  }
  bewaarLijst(id, inhoud, wie){
    const l = schoonLijst(inhoud);
    if (!l) return null;
    const nu = Date.now();
    if (id){
      if (!this.sql.exec("SELECT id FROM lijst WHERE id = ?", id).toArray().length) return null;
      this.sql.exec("UPDATE lijst SET inhoud = ?, bijgewerkt = ? WHERE id = ?", JSON.stringify(l), nu, id);
      this.meld(wie, "vragenlijst gewijzigd: " + l.titel, "");
    } else {
      id = willekeur(9);
      this.sql.exec("INSERT INTO lijst (id, inhoud, bijgewerkt) VALUES (?, ?, ?)", id, JSON.stringify(l), nu);
      this.meld(wie, "vragenlijst gemaakt: " + l.titel, "");
    }
    return Object.assign(l, { id, bijgewerkt: nu });
  }
  wegLijst(id, wie){
    const r = this.sql.exec("SELECT inhoud FROM lijst WHERE id = ?", id).toArray()[0];
    if (!r) return false;
    this.sql.exec("DELETE FROM lijst WHERE id = ?", id);
    this.meld(wie, "vragenlijst verwijderd: " + JSON.parse(r.inhoud).titel, "");
    return true;
  }
  zaaiLijst(wie){
    const alle = this.lijsten();
    if (!alle.find(l => l.proef && l.monitor)) this.bewaarLijst(null, voorbeeldMonitor(), wie);
    return alle.find(l => l.proef && !l.monitor) || this.bewaarLijst(null, voorbeeldLijst(), wie);
  }
  /* Klaarzetten: de lijst zoals hij nu is gaat mee met de code. Wie de lijst
     daarna nog aanpast, verandert niets aan wat de leerling te zien krijgt. */
  /* mag er voor dit dossier iets verwerkt worden: is de toestemming getekend? */
  async magVerwerken(dossier){
    const r = this.sql.exec("SELECT inhoud FROM dossier WHERE id = ?", dossier).toArray()[0];
    if (!r) return false;
    const d = await this.open(r.inhoud);
    return !!(d.toestemming && d.toestemming.status === "ja");
  }
  toestemmingstekst(){
    const r = this.sql.exec("SELECT v FROM stand WHERE k = 'toestemming'").toArray()[0];
    return r && r.v ? r.v : TOESTEMMINGSTEKST;
  }
  zetToestemmingstekst(t, wie){
    const schoonT = String(t == null ? "" : t).replace(/\r/g, "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, 6000).trim();
    if (schoonT) this.sql.exec("INSERT OR REPLACE INTO stand (k, v) VALUES ('toestemming', ?)", schoonT);
    else this.sql.exec("DELETE FROM stand WHERE k = 'toestemming'");
    this.meld(wie, "tekst van het toestemmingsformulier aangepast", "");
    return this.toestemmingstekst();
  }
  async zetKlaar(dossier, lijstId, wie, opt){
    opt = opt || {};
    if (!this.sql.exec("SELECT id FROM dossier WHERE id = ?", dossier).toArray().length) return null;
    if (!await this.magVerwerken(dossier)) return "toestemming";
    const r = this.sql.exec("SELECT inhoud FROM lijst WHERE id = ?", lijstId).toArray()[0];
    if (!r) return null;
    const l = Object.assign(JSON.parse(r.inhoud), { id: lijstId });
    if (!l.vragen.length) return null;
    const vast = !!(opt.vast && l.monitor), door = vast && opt.door === "mentor" ? "mentor" : "leerling";
    this.sql.exec("DELETE FROM afname WHERE tot < ?", Date.now());
    if (this.sql.exec("SELECT COUNT(*) AS n FROM afname WHERE dossier = ?", dossier).one().n >= MAX_CODES_DOSSIER) return null;
    /* van een vaste code is er per leerling, per lijst en per invuller maar een */
    if (vast){
      for (const x of this.sql.exec("SELECT code, lijst FROM afname WHERE dossier = ? AND vast = 1 AND door = ?", dossier, door).toArray()){
        if (JSON.parse(x.lijst).id === lijstId) this.sql.exec("DELETE FROM afname WHERE code = ?", x.code);
      }
    }
    let code = nieuweCode();
    while (this.sql.exec("SELECT code FROM afname WHERE code = ?", code).toArray().length) code = nieuweCode();
    const tot = vast ? Date.now() + VAST_WEKEN * WEEK : totMiddernacht();
    this.sql.exec("INSERT INTO afname (code, dossier, lijst, gemaakt, tot, vast, door) VALUES (?, ?, ?, ?, ?, ?, ?)", code, dossier, JSON.stringify(l), Date.now(), tot, vast ? 1 : 0, door);
    this.meld(wie, vast ? "vaste code gemaakt voor de " + door : "vragenlijst klaargezet", dossier);
    return { code, titel: l.titel, lijst: lijstId, tot, vast, door };
  }
  geldig(code){
    this.sql.exec("DELETE FROM afname WHERE tot < ?", Date.now());
    return this.sql.exec("SELECT code, dossier, lijst, vast, door, laatst FROM afname WHERE code = ?", code).toArray()[0] || null;
  }
  /* wat de leerling te zien krijgt: de voornaam en de vragen, geen schalen */
  async afname(code){
    const a = this.geldig(code);
    if (!a) return null;
    const r = this.sql.exec("SELECT inhoud FROM dossier WHERE id = ?", a.dossier).toArray()[0];
    if (!r) return null;
    const l = JSON.parse(a.lijst);
    return { voornaam: (await this.open(r.inhoud)).voornaam, titel: l.titel, uitleg: l.uitleg, antwoorden: l.antwoorden,
      vorm: l.vorm || "knoppen", laag: l.laag || "", hoog: l.hoog || "",
      door: a.door, vast: !!a.vast, al: !!a.vast && Date.now() - a.laatst < VAST_RUST,
      vragen: l.vragen.map(v => ({ id: v.id, tekst: v.tekst })) };
  }
  async vulIn(code, antwoorden){
    const a = this.geldig(code);
    if (!a) return null;
    if (a.vast && Date.now() - a.laatst < VAST_RUST) return "al";
    if (!this.plek(a.dossier)) return "vol";
    const l = JSON.parse(a.lijst);
    const m = reken(l, antwoorden);
    if (!m) return false;
    this.sql.exec("INSERT INTO meting (id, dossier, inhoud, t, gezien) VALUES (?, ?, ?, ?, 0)", willekeur(9), a.dossier, await this.dicht(Object.assign(m, { lijst: l.id, door: a.door })), Date.now());
    /* een gewone code is op na een keer; de vaste code blijft, maar rust even */
    if (a.vast) this.sql.exec("UPDATE afname SET laatst = ? WHERE code = ?", Date.now(), code);
    else this.sql.exec("DELETE FROM afname WHERE code = ?", code);
    this.meld(a.door === "mentor" ? "de mentor, met een code" : "de leerling, met een code", a.vast ? "wekelijkse check ingevuld" : "vragenlijst ingevuld", a.dossier);
    return true;
  }
  /* Een lijst die op papier is ingevuld: de therapeut neemt de bolletjes over.
     De meting krijgt de datum van het papier, niet die van het invoeren. */
  async voerIn(dossier, lijstId, antwoorden, dat, wie){
    if (!this.sql.exec("SELECT id FROM dossier WHERE id = ?", dossier).toArray().length) return null;
    if (!await this.magVerwerken(dossier)) return "toestemming";
    const r = this.sql.exec("SELECT inhoud FROM lijst WHERE id = ?", lijstId).toArray()[0];
    if (!r) return null;
    const l = JSON.parse(r.inhoud);
    if (!l.vragen.length) return null;
    const m = reken(l, antwoorden);
    if (!m) return false;
    if (!this.plek(dossier)) return "vol";
    let t = Date.parse(datum(dat) + "T12:00:00Z");
    if (!Number.isFinite(t) || t > Date.now() + 86400000 || t < Date.UTC(2015, 0, 1)) t = Date.now();
    this.sql.exec("INSERT INTO meting (id, dossier, inhoud, t) VALUES (?, ?, ?, ?)", willekeur(9), dossier, await this.dicht(Object.assign(m, { lijst: lijstId, papier: true })), t);
    this.meld(wie, "papieren vragenlijst ingevoerd", dossier);
    return true;
  }
  trekIn(code, wie){
    const a = this.sql.exec("SELECT dossier FROM afname WHERE code = ?", code).toArray()[0];
    if (!a) return false;
    this.sql.exec("DELETE FROM afname WHERE code = ?", code);
    this.meld(wie, "code ingetrokken", a.dossier);
    return true;
  }
  wegMeting(id, wie){
    const r = this.sql.exec("SELECT dossier FROM meting WHERE id = ?", id).toArray()[0];
    if (!r) return false;
    this.sql.exec("DELETE FROM meting WHERE id = ?", id);
    this.meld(wie, "meting verwijderd", r.dossier);
    return true;
  }
}
