/* Inloggen met Microsoft: optioneel, bovenop de speelcode.

   Een leerling of docent kan zijn Microsoft 365-account (school) of een
   persoonlijk Microsoft-account koppelen aan zijn speelcode. Dan hoeft hij de
   acht letters niet te onthouden: inloggen op een ander apparaat haalt de
   speelcode op en alles staat er weer. Wachtwoorden zien we nooit: Microsoft
   doet het inloggen (OpenID Connect) en geeft ons een getekend bewijs.

   Wat we bewaren per account (Durable Object Account):
     id      een hash van het kenmerk dat Microsoft voor deze site aan het
             account geeft; niet terug te rekenen naar het account
     naam    de weergavenaam, alleen om "ingelogd als" te tonen
     code    de speelcode die eraan hangt
   Geen e-mailadres, geen foto, geen toegang tot mail of bestanden: de site
   vraagt alleen "openid profile" en niets anders.

   Instellen (eenmalig, door de beheerder van de site):
     1. Op portal.azure.com (Microsoft Entra ID) een app-registratie maken:
        accounttypen "Accounts in any organizational directory and personal
        Microsoft accounts", platform Web, omleidings-URI
        https://meneergreidanus.nl/api/account/terug
     2. Een clientgeheim maken (maximaal 24 maanden geldig; daarna vernieuwen).
     3. Drie geheimen zetten:
          npx wrangler secret put MS_CLIENT_ID       (Application (client) ID)
          npx wrangler secret put MS_CLIENT_SECRET   (het clientgeheim)
          npx wrangler secret put SESSIE_GEHEIM      (een lange willekeurige tekst)
     Zonder die drie is de knop onzichtbaar en doet deze module niets.

   Routes (in index.js):
     GET  /api/account            { mogelijk, ingelogd, naam, code }
     GET  /api/account/inloggen   stuurt door naar Microsoft (?terug=/pad)
     GET  /api/account/terug      Microsoft komt hier terug met een code
     POST /api/account/koppel     { code } de speelcode aan het account hangen
     POST /api/account/uitloggen  het koekje weg
     DELETE /api/account          het account bij ons weg (de speelcode blijft) */
import { DurableObject } from "cloudflare:workers";

const SESSIE_DAGEN = 90;
const AANMELD_SECONDEN = 600;              /* zo lang mag het inloggen bij Microsoft duren */
const LEEFT = 730 * 24 * 60 * 60 * 1000;   /* een account zonder gebruik: na twee jaar weg */
const SESSIE_KOEKJE = "lg_sessie", AANMELD_KOEKJE = "lg_aanmelden";
const enc = new TextEncoder();

function json(obj, status, extra){
  const h = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };
  return new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign(h, extra || {}) });
}
function b64url(buf){
  const b = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let s = ""; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function vanB64url(s){
  s = String(s || "").replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s), b = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
  return b;
}
function tekstVanB64url(s){ return new TextDecoder().decode(vanB64url(s)); }
function willekeur(n){ return b64url(crypto.getRandomValues(new Uint8Array(n))); }
async function sha256(t){ return crypto.subtle.digest("SHA-256", enc.encode(t)); }
async function hex(t){ return Array.from(new Uint8Array(await sha256(t))).map(b => b.toString(16).padStart(2, "0")).join(""); }

/* Een getekend pakketje: inhoud.handtekening, met HMAC-SHA256 op het sessiegeheim. */
async function sleutel(env){
  return crypto.subtle.importKey("raw", enc.encode(env.SESSIE_GEHEIM), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}
async function teken(env, obj){
  const inhoud = b64url(enc.encode(JSON.stringify(obj)));
  const hand = await crypto.subtle.sign("HMAC", await sleutel(env), enc.encode(inhoud));
  return inhoud + "." + b64url(hand);
}
async function lees(env, tekst){
  try {
    const [inhoud, hand] = String(tekst || "").split(".");
    if (!inhoud || !hand) return null;
    const ok = await crypto.subtle.verify("HMAC", await sleutel(env), vanB64url(hand), enc.encode(inhoud));
    if (!ok) return null;
    const obj = JSON.parse(tekstVanB64url(inhoud));
    if (!obj || (obj.tot && Date.now() > obj.tot)) return null;
    return obj;
  } catch (e){ return null; }
}
function koekjes(req){
  const uit = {};
  String(req.headers.get("Cookie") || "").split(";").forEach(d => {
    const i = d.indexOf("="); if (i < 0) return;
    uit[d.slice(0, i).trim()] = d.slice(i + 1).trim();
  });
  return uit;
}
function koekje(naam, waarde, url, seconden, pad){
  const veilig = url.protocol === "https:" ? "; Secure" : "";
  return naam + "=" + waarde + "; Path=" + (pad || "/") + "; Max-Age=" + seconden + "; HttpOnly; SameSite=Lax" + veilig;
}
function weg(naam, url, pad){ return koekje(naam, "", url, 0, pad); }

export function mogelijk(env){ return !!(env.MS_CLIENT_ID && env.MS_CLIENT_SECRET && env.SESSIE_GEHEIM); }
function basis(env){ return String(env.MS_AANMELDBASIS || "https://login.microsoftonline.com").replace(/\/+$/, ""); }
function huurder(env){ return String(env.MS_TENANT || "common"); }
/* het terugadres zoals het bij Microsoft staat: altijd zonder www */
function terugAdres(url){ return url.protocol + "//" + url.hostname.replace(/^www./, "") + (url.port ? ":" + url.port : "") + "/api/account/terug"; }
/* alleen een pad op de eigen site, anders de leeromgeving */
function schoonTerug(t){
  t = String(t || "");
  return /^\/(?!\/)[A-Za-z0-9_\-./?=&%]*$/.test(t) ? t : "/leermiddelen/";
}
function metVlag(t, vlag){ return t + (t.indexOf("?") >= 0 ? "&" : "?") + "account=" + vlag; }

/* De sleutels van Microsoft waarmee het bewijs getekend is, even in het geheugen. */
let sleutels = { bij: 0, lijst: [] };
async function haalSleutels(env, kid){
  const nu = Date.now();
  const heeft = sleutels.lijst.find(k => k.kid === kid);
  if (heeft && nu - sleutels.bij < 6 * 3600 * 1000) return heeft;
  if (!heeft || nu - sleutels.bij > 60 * 1000){
    const r = await fetch(basis(env) + "/" + huurder(env) + "/discovery/v2.0/keys");
    if (!r.ok) throw new Error("sleutels " + r.status);
    const j = await r.json();
    sleutels = { bij: nu, lijst: Array.isArray(j.keys) ? j.keys : [] };
  }
  return sleutels.lijst.find(k => k.kid === kid) || null;
}
/* Het bewijs (id_token) nakijken: handtekening, voor wie, van wie, hoe laat, en de nonce. */
async function controleer(env, token, nonce){
  const delen = String(token || "").split(".");
  if (delen.length !== 3) throw new Error("geen bewijs");
  const kop = JSON.parse(tekstVanB64url(delen[0])), claims = JSON.parse(tekstVanB64url(delen[1]));
  if (kop.alg !== "RS256") throw new Error("onbekende handtekening");
  const jwk = await haalSleutels(env, kop.kid);
  if (!jwk) throw new Error("sleutel onbekend");
  const pub = await crypto.subtle.importKey("jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e }, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", pub, vanB64url(delen[2]), enc.encode(delen[0] + "." + delen[1]));
  if (!ok) throw new Error("handtekening klopt niet");
  const nu = Math.floor(Date.now() / 1000);
  if (claims.aud !== env.MS_CLIENT_ID) throw new Error("bewijs voor een andere site");
  if (!claims.tid || claims.iss !== basis(env) + "/" + claims.tid + "/v2.0") throw new Error("onbekende afzender");
  if (!(claims.exp > nu - 60) || !(claims.nbf === undefined || claims.nbf < nu + 300)) throw new Error("bewijs verlopen");
  if (!nonce || claims.nonce !== nonce) throw new Error("nonce klopt niet");
  if (!claims.sub) throw new Error("geen kenmerk");
  return claims;
}

async function account(env, id){ return env.ACCOUNT.get(env.ACCOUNT.idFromName(id)); }
async function sessie(env, req){
  if (!mogelijk(env)) return null;
  const s = await lees(env, koekjes(req)[SESSIE_KOEKJE]);
  return s && s.id ? s : null;
}

/* De router in index.js geeft alles onder /api/account hierheen. */
export async function behandel(req, env, url, hulp){
  const p = url.pathname.replace(/\/+$/, "");
  if (!mogelijk(env)){
    if (p === "/api/account" && req.method === "GET") return json({ mogelijk: false, ingelogd: false });
    return json({ fout: "inloggen staat op deze site niet aan" }, 404);
  }

  if (p === "/api/account" && req.method === "GET"){
    /* bij drukte (een hele klas tegelijk) toch zeggen dat inloggen kan */
    if (!await hulp.magDoor("account-lees", 900, 60)) return json({ mogelijk: true, ingelogd: false, druk: true });
    const s = await sessie(env, req);
    if (!s) return json({ mogelijk: true, ingelogd: false });
    const r = await (await account(env, s.id)).fetch("https://account/lees");
    if (!r.ok) return json({ mogelijk: true, ingelogd: false }, 200, { "set-cookie": weg(SESSIE_KOEKJE, url) });
    const a = await r.json();
    return json({ mogelijk: true, ingelogd: true, naam: a.naam, code: a.code || "" });
  }

  if (p === "/api/account/inloggen" && req.method === "GET"){
    if (!await hulp.magDoor("account-inloggen", 300, 600)) return json({ fout: "even wachten, er logt nu een hele school tegelijk in" }, 429);
    const state = willekeur(24), nonce = willekeur(24), verifier = willekeur(48);
    const challenge = b64url(await sha256(verifier));
    const terug = schoonTerug(url.searchParams.get("terug"));
    const pak = await teken(env, { state, nonce, verifier, terug, tot: Date.now() + AANMELD_SECONDEN * 1000 });
    const q = new URLSearchParams({
      client_id: env.MS_CLIENT_ID, response_type: "code", redirect_uri: terugAdres(url), response_mode: "query",
      /* prompt=login: altijd zelf inloggen, ook op een schoollaptop waar de vorige leerling nog bij Microsoft ingelogd is */
      scope: "openid profile", state, nonce, code_challenge: challenge, code_challenge_method: "S256", prompt: "login"
    });
    return new Response(null, { status: 302, headers: {
      location: basis(env) + "/" + huurder(env) + "/oauth2/v2.0/authorize?" + q.toString(),
      "set-cookie": koekje(AANMELD_KOEKJE, pak, url, AANMELD_SECONDEN, "/api/account"),
      "cache-control": "no-store" } });
  }

  if (p === "/api/account/terug" && req.method === "GET"){
    if (!await hulp.magDoor("account-terug", 300, 600)) return json({ fout: "even wachten" }, 429);
    const pak = await lees(env, koekjes(req)[AANMELD_KOEKJE]);
    const terug = pak ? pak.terug : "/leermiddelen/";
    const naar = vlag => new Response(null, { status: 302, headers: { location: url.origin + metVlag(terug, vlag),
      "set-cookie": weg(AANMELD_KOEKJE, url, "/api/account"), "cache-control": "no-store" } });
    const fout = url.searchParams.get("error");
    if (fout){
      const uitleg = String(url.searchParams.get("error_description") || "");
      /* de school moet de site eerst goedkeuren: dat zegt Microsoft met deze nummers */
      const school = /AADSTS(65001|90094|650052|500131)/.test(uitleg) || fout === "consent_required" || fout === "interaction_required";
      return naar(school ? "school" : fout === "access_denied" ? "geweigerd" : "fout");
    }
    const code = url.searchParams.get("code"), state = url.searchParams.get("state");
    if (!pak || !code || !state || state !== pak.state) return naar("fout");
    let claims;
    try {
      const r = await fetch(basis(env) + "/" + huurder(env) + "/oauth2/v2.0/token", { method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ client_id: env.MS_CLIENT_ID, client_secret: env.MS_CLIENT_SECRET, grant_type: "authorization_code",
          code, redirect_uri: terugAdres(url), code_verifier: pak.verifier, scope: "openid profile" }).toString() });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.id_token){ console.warn("account: inwisselen mislukt", r.status, j.error, j.error_description); return naar("fout"); }
      claims = await controleer(env, j.id_token, pak.nonce);
    } catch (e){ console.warn("account: bewijs afgekeurd", e && e.message); return naar("fout"); }
    /* het kenmerk van Microsoft komt niet in onze opslag: alleen een hash ervan */
    const id = await hex("lg-account|" + claims.sub);
    const naam = String(claims.name || claims.preferred_username || "").split("@")[0].replace(/[<>]/g, "").slice(0, 40) || "iemand";
    const r2 = await (await account(env, id)).fetch("https://account/aanmelden", { method: "POST", body: JSON.stringify({ naam }) });
    if (!r2.ok) return naar("fout");
    const sessieKoekje = await teken(env, { id, tot: Date.now() + SESSIE_DAGEN * 86400 * 1000 });
    const h = new Headers({ location: url.origin + metVlag(terug, "in"), "cache-control": "no-store" });
    h.append("set-cookie", koekje(SESSIE_KOEKJE, sessieKoekje, url, SESSIE_DAGEN * 86400));
    h.append("set-cookie", weg(AANMELD_KOEKJE, url, "/api/account"));
    return new Response(null, { status: 302, headers: h });
  }

  if (p === "/api/account/uitloggen" && req.method === "POST"){
    if (!hulp.eigenSite()) return json({ fout: "niet vanaf deze site" }, 403);
    return json({ ok: true }, 200, { "set-cookie": weg(SESSIE_KOEKJE, url) });
  }

  if (p === "/api/account/koppel" && req.method === "POST"){
    if (!hulp.eigenSite()) return json({ fout: "niet vanaf deze site" }, 403);
    if (!await hulp.magDoor("account-koppel", 200, 60)) return json({ fout: "even wachten" }, 429);
    const s = await sessie(env, req);
    if (!s) return json({ fout: "niet ingelogd" }, 401);
    let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldige code" }, 400); }
    const code = String(inz && inz.code || "").toUpperCase();
    if (!/^[A-Z]{8}$/.test(code)) return json({ fout: "geen geldige code" }, 400);
    /* alleen een speelcode die bestaat */
    const pr = await env.PROFIEL.get(env.PROFIEL.idFromName(code)).fetch("https://profiel/lees");
    if (!pr.ok) return json({ fout: "geen profiel met deze code" }, 404);
    return (await account(env, s.id)).fetch("https://account/koppel", { method: "POST", body: JSON.stringify({ code }) });
  }

  if (p === "/api/account" && req.method === "DELETE"){
    if (!hulp.eigenSite()) return json({ fout: "niet vanaf deze site" }, 403);
    const s = await sessie(env, req);
    if (!s) return json({ fout: "niet ingelogd" }, 401);
    await (await account(env, s.id)).fetch("https://account/weg", { method: "POST", body: "{}" });
    return json({ ok: true }, 200, { "set-cookie": weg(SESSIE_KOEKJE, url) });
  }
  return json({ fout: "onbekend" }, 404);
}

/* Eén object per account: naam, speelcode, wanneer. Meer niet. */
export class Account extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.stand = null;
    this.ctx.blockConcurrencyWhile(async () => { this.stand = (await this.ctx.storage.get("stand")) || null; });
  }
  async bewaar(){
    this.stand.laatst = Date.now();
    await this.ctx.storage.put("stand", this.stand);
    await this.ctx.storage.setAlarm(Date.now() + LEEFT);
  }
  async alarm(){
    if (this.stand && Date.now() - this.stand.laatst >= LEEFT - 60000){ await this.ctx.storage.deleteAll(); this.stand = null; }
  }
  async fetch(req){
    const url = new URL(req.url);
    let inz = {};
    if (req.method === "POST"){ try { inz = await req.json(); } catch (e){ inz = {}; } }
    if (url.pathname === "/aanmelden"){
      if (!this.stand) this.stand = { sinds: Date.now(), code: "" };
      this.stand.naam = String(inz.naam || "").slice(0, 40);
      await this.bewaar();
      return json({ ok: true, naam: this.stand.naam, code: this.stand.code || "" });
    }
    if (!this.stand) return json({ fout: "geen account" }, 404);
    if (url.pathname === "/lees"){
      return json({ ok: true, naam: this.stand.naam, code: this.stand.code || "", sinds: this.stand.sinds });
    }
    if (url.pathname === "/koppel"){
      const code = String(inz.code || "").toUpperCase();
      if (!/^[A-Z]{8}$/.test(code)) return json({ fout: "geen geldige code" }, 400);
      this.stand.code = code;
      await this.bewaar();
      return json({ ok: true, code });
    }
    if (url.pathname === "/weg"){
      await this.ctx.storage.deleteAll();
      this.stand = null;
      return json({ ok: true });
    }
    return json({ fout: "onbekend" }, 404);
  }
}
