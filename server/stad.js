/* De stad op de server: drie Durable Objects.

   Zombiekamer is een potje. Hij draait de kamer (leermiddelen/stad-kamer.js,
   met de motor eronder) zestig keer per seconde en stuurt elke speler twintig
   keer per seconde alleen wat er in zijn buurt staat. De klasse heet nog
   Zombiekamer omdat een Durable Object hernoemen om een migratie vraagt.

   Waarom zestien spelers. Gemeten met de kamer zelf (september 2026), met
   spelers die jagen op wat er om hen heen loopt, in het zwaarste geval: allemaal
   op een kluitje tussen de kampen, zodat iedereen iedereen ziet.

     spelers   ms per tik   pakket    per speler   kamer uit
        8        0,13      0,96 kB    19 kB/s     153 kB/s
       16        0,23      1,28 kB    26 kB/s     409 kB/s
       24        0,32      1,25 kB    25 kB/s     600 kB/s
       32        0,44      1,58 kB    32 kB/s    1014 kB/s

   Een tik mag 16,67 ms duren; de rekentijd is het probleem dus niet. De lijn
   wel: bij zestien is het wat het oude zombieveld ook was, en daarboven gaat er
   uit een kamer meer dan een halve megabyte per seconde. Zestien is waar het
   ophoudt comfortabel te zijn als er dertig kinderen op dezelfde wifi zitten.

   Veld is de portier. Hij houdt bij welke potjes er lopen en hoe vol ze zijn,
   en stuurt wie erbij wil naar het volste potje met plek. Is er geen, dan
   maakt index.js er een.

   Stadheld bewaart personages: een object per speler (de naam is zijn
   sleutel). Alleen een potje praat ermee, na een extractie; er is geen route
   van buiten naartoe, dus niemand kan zijn eigen level schrijven. De sleutel
   is het Microsoft-account als je bent ingelogd (uit het sessiekoekje, niet
   uit wat de browser zegt), anders het sid van dit apparaat. */
import { DurableObject } from "cloudflare:workers";
import { nette } from "./naamfilter.js";
import { kenmerkVan } from "./account.js";
import { laadVragen, VRAAGVAKKEN } from "./stadvragen.js";
/* de motor eerst: de kamer leest hem van globalThis, en modules worden
   uitgevoerd in de volgorde waarin ze hier staan */
import "../leermiddelen/stad-motor.js";
import STADKAMER from "../leermiddelen/stad-kamer.js";

export const ZOMBIE_MAX = 16;              /* gemeten, zie hierboven */
const STAP = 1 / 60;                        /* de klok van de motor */
const STAND_OM = 3;                         /* om de drie tikken een pakket: twintig per seconde */
const ZONDER_SPELERS = 45 * 1000;           /* een leeg potje stopt na drie kwartier minuut */
const POTJE_LEEFT = 2 * 60 * 60 * 1000;     /* en hoogstens twee uur */
const WEG_NA_STIL = 35 * 1000;              /* wie zo lang niets stuurt is weg */
const SOCKETS_PER_SID = 4;
const RANG = { bb: 1, kgt: 2, havo: 3, vwo: 4 };
const VAKKEN = VRAAGVAKKEN;

function json(o, s){ return new Response(JSON.stringify(o), { status: s || 200, headers: { "content-type": "application/json" } }); }
function schoon(t, n){ return String(t == null ? "" : t).replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, n || 40); }
async function hash(t){
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return Array.from(new Uint8Array(h)).slice(0, 16).map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ============================================================================
   het potje
   ============================================================================ */
export class Zombiekamer extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.ctx = ctx; this.env = env;
    this.K = null; this.klok = null; this.tik = 0; this.leeg = 0;
    this.code = ""; this.gemaakt = 0; this.origin = "";
    /* sid -> { nr, key, laatst } ; nr is de plek in de motor */
    this.wie = new Map();
    ctx.blockConcurrencyWhile(async () => {
      const s = await ctx.storage.get("stand");
      if (s){ this.code = s.code; this.gemaakt = s.gemaakt; }
    });
  }

  async fetch(req){
    const url = new URL(req.url), p = url.pathname;

    if (p === "/nieuw" && req.method === "POST"){
      let o; try { o = await req.json(); } catch (e){ return json({ fout: "geen opzet" }, 400); }
      if (this.K && this.levend()) return json({ fout: "bezet" }, 409);
      this.code = schoon(o && o.code, 4).toUpperCase();
      this.gemaakt = Date.now();
      await this.ctx.storage.put("stand", { code: this.code, gemaakt: this.gemaakt });
      this.start();
      return json({ code: this.code });
    }

    if (p === "/stand"){
      return json({ code: this.code, spelers: this.wie.size, max: ZOMBIE_MAX,
                    leeft: this.levend(), open: this.levend() && this.wie.size < ZOMBIE_MAX });
    }

    if (p.startsWith("/ws")){
      if (req.headers.get("Upgrade") !== "websocket") return json({ fout: "hier hoort een WebSocket" }, 426);
      const sid = schoon(url.searchParams.get("sid"), 32);
      if (!sid) return json({ fout: "geen sid" }, 400);
      /* Alleen een potje dat de portier opende (nieuw). Anders zette elke
         verzonnen code een eigen wereld aan, die zestig keer per seconde tikt. */
      if (!this.gemaakt) return json({ fout: "geen potje met deze code" }, 404);
      if (!this.origin && /^https?:$/.test(url.protocol)) this.origin = url.origin;
      if (!this.K) this.start();
      if (!this.wie.has(sid) && this.wie.size >= ZOMBIE_MAX) return json({ fout: "dit potje zit vol" }, 409);

      let plek = this.wie.get(sid), nieuw = null;
      const K = this.K;
      if (!(plek && K.W.spelers[plek.nr] && !K.W.spelers[plek.nr].uit)){
        /* een nieuwe speler: zijn personage laden (of beginnen) en hem in de wereld zetten */
        const key = await this.sleutel(req, sid);
        const vak = VAKKEN.indexOf(url.searchParams.get("vak")) >= 0 ? url.searchParams.get("vak") : "reken";
        const delen = schoon(url.searchParams.get("d"), 1200).split(",").map(x => schoon(x, 40)).filter(Boolean).slice(0, 40);
        const r = await K.erbij({
          key, sid, vak, delen,
          naam: nette(schoon(url.searchParams.get("naam"), 16)) || "Speler",
          av: schoon(url.searchParams.get("av"), 40),
          klasse: schoon(url.searchParams.get("k"), 10),
          rang: RANG[url.searchParams.get("niveau")] || 2
        });
        if (!r || r.fout) return json({ fout: (r && r.fout) || "meedoen lukte niet" }, 500);
        plek = { nr: r.nr, key, laatst: Date.now() };
        this.wie.set(sid, plek);
        nieuw = r;
      }
      if (!nieuw) K.terug(plek.nr);
      plek.laatst = Date.now();
      /* hoogstens een paar verbindingen per speler: elke verbinding krijgt twintig keer per seconde een pakket */
      const al = this.ctx.getWebSockets("speler").filter(w => { try { return (w.deserializeAttachment() || {}).sid === sid; } catch (e){ return false; } });
      if (al.length >= SOCKETS_PER_SID) al.slice(0, al.length - SOCKETS_PER_SID + 1).forEach(w => { try { w.close(1000, "nieuwe verbinding"); } catch (e){} });
      const paar = new WebSocketPair();
      const [client, server] = Object.values(paar);
      this.ctx.acceptWebSocket(server, ["speler"]);
      server.serializeAttachment({ sid, nr: plek.nr });
      this.melden();
      this.hoeveel();
      const p0 = K.W.spelers[plek.nr];
      server.send(JSON.stringify({ t: "hoi", ik: plek.nr, code: this.code, spelers: this.ctx.getWebSockets("speler").length,
                                   max: ZOMBIE_MAX, wereld: K.wereld(), klasse: p0.klasse, held: K.W.held(plek.nr),
                                   account: plek.key.charAt(0) === "a", terug: !nieuw }));
      return new Response(null, { status: 101, webSocket: client });
    }
    return json({ fout: "onbekend" }, 404);
  }

  levend(){ return !!this.gemaakt && Date.now() - this.gemaakt < POTJE_LEEFT; }

  /* De sleutel van het personage. Ingelogd met Microsoft: een afgeleide van het
     kenmerk (hetzelfde op elk apparaat). Anders het sid van dit apparaat. Wie
     voor het eerst ingelogd speelt en op dit apparaat al een personage had,
     neemt dat mee. */
  async sleutel(req, sid){
    let acc = "";
    try { acc = await kenmerkVan(req, this.env); } catch (e){ acc = ""; }
    if (!acc) return "s:" + sid;
    const key = "a:" + await hash(acc + "|stad");
    try {
      const a = await this.held(key, "laad");
      if (!a || !a.helden || !Object.keys(a.helden).length){
        const s = await this.held("s:" + sid, "laad");
        if (s && s.helden && Object.keys(s.helden).length){
          const r = await this.held(key, "overnemen", { helden: s.helden, wacht: s.wacht || {} });
          if (r && r.ok) await this.held("s:" + sid, "verhuisd", {});
        }
      }
    } catch (e){ console.warn("stad: overnemen mislukt", e && e.message); }
    return key;
  }
  async held(key, wat, body){
    const stub = this.env.HELD.get(this.env.HELD.idFromName(key));
    const r = await stub.fetch("https://held/" + wat, { method: "POST", body: JSON.stringify(body || {}) });
    return r.json();
  }

  /* Waar de kamer zijn vragen vandaan haalt: de bestanden die
     server/maak-stadvragen.js maakt, uit de map van de site (stadvragen.js). */
  vragen(vak){ return laadVragen(this.env, this.origin, vak); }

  /* ---------- de kamer ---------- */
  start(){
    if (this.klok) return;
    const zelf = this;
    this.K = STADKAMER.maak({
      seed: (Date.now() ^ 0x9e3779b9) >>> 0,
      bron: { vragen: vak => zelf.vragen(vak) },
      opslag: {
        laad: key => zelf.held(key, "laad"),
        bewaar: (key, klasse, held, v) => zelf.held(key, "bewaar", { klasse, held, v }),
        wacht: (key, wacht) => zelf.held(key, "wacht", { wacht })
      },
      zend: (nr, m) => zelf.naar(nr, m),
      log: function(){ console.warn.apply(console, ["stad"].concat(Array.prototype.slice.call(arguments))); }
    });
    this.tik = 0; this.leeg = 0;
    let laatst = Date.now(), rest = 0;
    const STAPMS = STAP * 1000;
    this.klok = setInterval(() => {
      try {
        const nu = Date.now();
        rest = Math.min(rest + (nu - laatst), 4 * STAPMS); laatst = nu;
        let gedaan = 0;
        while (rest >= STAPMS && gedaan < 4 && this.K){
          rest -= STAPMS; gedaan++;
          this.K.stap(STAP);
          this.tik++;
          if (this.tik % STAND_OM === 0) this.zend();
          if (this.tik % 60 === 0) this.opruimen();
        }
      } catch (e){ console.error("stadkamer", (e && e.stack) || e); this.stop(); }
    }, STAPMS / 2);
  }
  stop(){
    if (this.klok){ clearInterval(this.klok); this.klok = null; }
    this.K = null;
  }
  /* een los bericht naar een speler (een vraag, een uitslag, een paneel) */
  naar(nr, m){
    const tekst = JSON.stringify(m);
    for (const ws of this.ctx.getWebSockets("speler")){
      let bij; try { bij = ws.deserializeAttachment(); } catch (e){ continue; }
      if (bij && bij.nr === nr){ try { ws.send(tekst); } catch (e){} }
    }
  }

  /* Elke speler krijgt zijn eigen pakket: alleen wat er in zijn buurt staat. */
  zend(){
    if (!this.K) return;
    for (const ws of this.ctx.getWebSockets("speler")){
      let bij;
      try { bij = ws.deserializeAttachment(); } catch (e){ continue; }
      if (!bij) continue;
      const d = this.K.pakket(bij.nr);
      if (!d) continue;
      try { ws.send(JSON.stringify({ t: "st", d })); } catch (e){}
    }
  }

  opruimen(){
    const nu = Date.now();
    /* wie al een tijd niets stuurt haalt de kamer eruit, anders loopt een
       potje vol met spelers die er niet meer zijn */
    for (const [sid, plek] of this.wie){
      if (nu - (plek.laatst || 0) > WEG_NA_STIL){
        if (this.K) this.K.weg(plek.nr);
        this.wie.delete(sid);
        this.hoeveel();
      }
    }
    if (this.ctx.getWebSockets("speler").length === 0){
      this.leeg += 1000;
      if (this.leeg >= ZONDER_SPELERS){ this.stop(); this.melden(); }
    } else this.leeg = 0;
    this.melden();
  }

  /* Tegen iedereen zeggen met hoeveel ze zijn. Geteld wordt wie er nu
     verbonden is; behalve is de verbinding die net dichtgaat. */
  hoeveel(behalve){
    const sockets = this.ctx.getWebSockets("speler").filter(w => w !== behalve);
    const bericht = JSON.stringify({ t: "wie", n: sockets.length, max: ZOMBIE_MAX });
    for (const ws of sockets){ try { ws.send(bericht); } catch (e){} }
  }

  /* de portier bijpraten over hoe vol dit potje is */
  melden(){
    try {
      const veld = this.env.VELD.get(this.env.VELD.idFromName("veld"));
      veld.fetch("https://veld/stand", { method: "POST",
        body: JSON.stringify({ code: this.code, spelers: this.wie.size, leeft: !!this.klok }) });
    } catch (e){}
  }

  /* ---------- wat een speler stuurt ---------- */
  webSocketMessage(ws, ruw){
    if (ruw === "ping"){ try { ws.send("pong"); } catch (e){} return; }
    if (typeof ruw !== "string" || ruw.length > 2000) return;
    let m; try { m = JSON.parse(ruw); } catch (e){ return; }
    let bij; try { bij = ws.deserializeAttachment(); } catch (e){ return; }
    if (!bij || !this.K) return;
    const plek = this.wie.get(bij.sid);
    if (plek) plek.laatst = Date.now();
    if (m && m.t === "weg"){
      this.K.weg(bij.nr);
      if (plek) this.wie.delete(bij.sid);
      this.melden();
      return;
    }
    this.K.bericht(bij.nr, m);
  }
  webSocketClose(ws, code){
    /* het sluiten beantwoorden, anders blijft de socket van de browser op CLOSING hangen */
    try { ws.close(code === 1005 || code === 1006 || !code ? 1000 : code, "dicht"); } catch (e){}
    /* niet meteen uit de wereld halen: wie zijn verbinding even kwijt is moet
       terug kunnen komen op dezelfde plek. opruimen() doet het na een halve
       minuut stilte alsnog. */
    this.melden();
    this.hoeveel(ws);
  }
  webSocketError(ws){ this.webSocketClose(ws); }
}

/* ============================================================================
   de portier
   ============================================================================ */
export class Veld extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.ctx = ctx; this.env = env;
    this.potjes = new Map();       /* code -> { spelers, leeft, gezien } */
    ctx.blockConcurrencyWhile(async () => {
      const s = await ctx.storage.get("potjes");
      if (Array.isArray(s)) s.forEach(r => this.potjes.set(r.code, r));
    });
  }
  async bewaar(){
    await this.ctx.storage.put("potjes", [...this.potjes.values()].slice(0, 60));
  }
  async fetch(req){
    const url = new URL(req.url), p = url.pathname;

    /* een potje meldt hoe vol het is */
    if (p === "/stand" && req.method === "POST"){
      let o; try { o = await req.json(); } catch (e){ return json({ fout: "geen stand" }, 400); }
      const code = schoon(o && o.code, 4).toUpperCase();
      if (!/^[A-Z]{4}$/.test(code)) return json({ fout: "geen code" }, 400);
      if (!o.leeft) this.potjes.delete(code);
      else this.potjes.set(code, { code, spelers: Math.max(0, o.spelers | 0), leeft: true, gezien: Date.now() });
      await this.bewaar();
      return json({ ok: true });
    }

    /* iemand wil meedoen: het volste potje dat nog plek heeft.
       Het volste en niet het leegste, want een potje met één iemand erin is
       geen stad; zo vullen ze zich van onder af aan. Zit het vol, dan maakt
       index.js een tweede kaart. */
    if (p === "/zoek" && req.method === "POST"){
      const nu = Date.now();
      for (const [code, r] of this.potjes){
        if (nu - (r.gezien || 0) > 90 * 1000) this.potjes.delete(code);
      }
      let beste = null;
      for (const r of this.potjes.values()){
        if (r.spelers >= ZOMBIE_MAX) continue;
        if (!beste || r.spelers > beste.spelers) beste = r;
      }
      if (beste) return json({ code: beste.code, nieuw: false, spelers: beste.spelers, max: ZOMBIE_MAX });
      return json({ code: "", nieuw: true, max: ZOMBIE_MAX });
    }

    /* de lijst, voor een overzicht */
    if (p === "/lijst"){
      const nu = Date.now();
      const uit = [...this.potjes.values()]
        .filter(r => nu - (r.gezien || 0) < 90 * 1000)
        .map(r => ({ code: r.code, spelers: r.spelers }));
      return json({ potjes: uit, max: ZOMBIE_MAX });
    }
    return json({ fout: "onbekend" }, 404);
  }
}

/* ============================================================================
   de personages
   ============================================================================
   Een object per speler. Wat erin staat:
     helden   per klasse (ridder, schutter, wacht) het personage: level, xp,
              punten, stats, goud, drankjes, tellers
     v        een versienummer; bewaren lukt alleen op de versie die geladen
              was, zodat twee vensters met hetzelfde personage elkaar niet
              overschrijven
     wacht    per figuur tot wanneer die je geen nieuwe quest geeft
   Een personage dat een jaar niet gebruikt is, gaat weg. */
const HELD_LEEFT = 365 * 24 * 60 * 60 * 1000;
const KLASSEN = ["ridder", "schutter", "wacht"];
export class Stadheld extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.ctx = ctx; this.env = env;
    this.s = null;
    ctx.blockConcurrencyWhile(async () => {
      this.s = (await ctx.storage.get("held")) || null;
      if (this.s && this.s.laatst && Date.now() - this.s.laatst > HELD_LEEFT) this.s = null;
      if (!this.s) this.s = { helden: {}, v: 0, wacht: {}, gemaakt: Date.now(), laatst: Date.now() };
    });
  }
  async opslaan(){
    this.s.laatst = Date.now();
    await this.ctx.storage.put("held", this.s);
    /* over een jaar opruimen als er niets meer gebeurt */
    try { await this.ctx.storage.setAlarm(Date.now() + HELD_LEEFT); } catch (e){}
  }
  async alarm(){
    if (Date.now() - (this.s.laatst || 0) >= HELD_LEEFT){ await this.ctx.storage.deleteAll(); this.s = { helden: {}, v: 0, wacht: {}, gemaakt: Date.now(), laatst: Date.now() }; }
  }
  async fetch(req){
    const p = new URL(req.url).pathname;
    let o = {};
    if (req.method === "POST"){ try { o = await req.json(); } catch (e){ o = {}; } }
    if (p === "/laad") return json({ helden: this.s.helden, v: this.s.v, wacht: this.s.wacht });
    if (p === "/bewaar"){
      if (KLASSEN.indexOf(o.klasse) < 0 || !o.held || typeof o.held !== "object") return json({ ok: false, fout: "geen personage" }, 400);
      /* de kamer die dit stuurt heeft een oudere versie geladen: een ander
         venster heeft intussen bewaard. Dan niet overschrijven. */
      if ((o.v | 0) !== this.s.v) return json({ ok: false, v: this.s.v, fout: "Je personage is intussen in een ander venster bewaard. Deze tocht telt daarom niet." }, 409);
      this.s.helden[o.klasse] = o.held;
      this.s.v++;
      await this.opslaan();
      return json({ ok: true, v: this.s.v });
    }
    if (p === "/wacht"){
      const w = o.wacht || {}, nu = Date.now();
      ["jager", "geleerde", "verkenner"].forEach(k => {
        const t = +w[k];
        if (t > nu && t < nu + 24 * 3600 * 1000) this.s.wacht[k] = Math.max(this.s.wacht[k] || 0, t);
      });
      await this.opslaan();
      return json({ ok: true });
    }
    /* een personage van dit apparaat verhuist naar een account, alleen als het account nog leeg is */
    if (p === "/overnemen"){
      if (Object.keys(this.s.helden).length) return json({ ok: false });
      const h = o.helden || {};
      KLASSEN.forEach(k => { if (h[k] && typeof h[k] === "object") this.s.helden[k] = h[k]; });
      this.s.wacht = o.wacht || {};
      this.s.v++;
      await this.opslaan();
      return json({ ok: true, v: this.s.v });
    }
    if (p === "/verhuisd"){
      this.s.helden = {}; this.s.v++; this.s.verhuisd = Date.now();
      await this.opslaan();
      return json({ ok: true });
    }
    return json({ fout: "onbekend" }, 404);
  }
}
