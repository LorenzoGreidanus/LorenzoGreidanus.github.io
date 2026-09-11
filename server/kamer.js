/* Een spelkamer: een Durable Object met een code van vier letters.

   De kamer is de baas over de spelstand. Spelers en het digibord hangen er
   met een WebSocket aan; wat zij sturen zijn wensen (start, antwoord), wat de
   kamer terugstuurt is de waarheid (welke vraag, wie wat scoorde).

   Twee spellen:
   - de Klasquiz: de docent opent een kamer met een stapel vragen, leerlingen
     doen mee op hun telefoon, per vraag telt goed en snel, na elke vraag een
     tussenstand. De kamer rekent de scores uit, dus die zijn niet te vervalsen.
   - de Klasstrijd: iedereen speelt Torenverdediging of Zwaardvechter op zijn
     eigen scherm, de kamer verbindt de spelers. De docent start iedereen
     tegelijk, de spelers melden hun stand (ronde, levens, punten), goede
     reeksen sturen extra fouten naar de anderen, en wie het langst overleeft
     wint. De stand komt hier van de spelers zelf; de kamer houdt hem bij en
     zet hem op het bord.

   De stand staat in this.stand en wordt na elke wijziging weggeschreven,
   want een Durable Object dat even niets te doen heeft gaat slapen en begint
   daarna weer bij de constructor. De WebSockets overleven dat slapen wel (de
   hibernation API); wie erbij hoort staat in de bijlage van elke socket. */
import { DurableObject } from "cloudflare:workers";

const MAX_SPELERS = 60, MAX_VRAGEN = 60;
const OPRUIMEN_NA = 3 * 60 * 60 * 1000;     /* een kamer leeft hoogstens drie uur */
const NA_EINDE = 30 * 60 * 1000;             /* na de eindstand nog een half uur te bekijken */
const SPELLEN_STRIJD = { toren: "Torenverdediging", zwaard: "Zwaardvechter" };

function json(obj, status){
  return new Response(JSON.stringify(obj), { status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function schoon(tekst, max){
  return String(tekst || "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}
function getal(x, max){ const n = Number(x); return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.round(n))) : 0; }
function sleutelMaken(){
  const r = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(r, b => b.toString(16).padStart(2, "0")).join("");
}

export class Kamer extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.stand = null;
    this.standTimer = null;
    this.ctx.blockConcurrencyWhile(async () => {
      this.stand = (await this.ctx.storage.get("stand")) || null;
    });
    /* pings van de browser beantwoordt het platform zelf, ook als de kamer slaapt */
    try { this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong")); }
    catch (e){ console.error("autoResponse", e && e.message); }
  }
  async bewaar(){ this.stand.laatst = Date.now(); await this.ctx.storage.put("stand", this.stand); }
  get strijd(){ return !!this.stand && this.stand.spel === "strijd"; }

  /* ---------- binnenkomend ---------- */
  async fetch(req){
    try {
      const url = new URL(req.url);
      if (url.pathname === "/nieuw") return await this.nieuw(await req.json());
      if (url.pathname === "/stand") return this.stand ? json(this.overzicht()) : json({ fout: "geen kamer met deze code" }, 404);
      if (req.headers.get("Upgrade") === "websocket") return this.verbind(url);
      return json({ fout: "onbekend" }, 404);
    } catch (e){
      console.error("kamer", e && e.stack || e);
      return json({ fout: "de kamer gaf een fout: " + (e && e.message || e) }, 500);
    }
  }

  async nieuw(opzet){
    /* een code die nog in gebruik is geven we niet nog een keer uit */
    if (this.stand && this.stand.fase !== "einde" && Date.now() - this.stand.laatst < OPRUIMEN_NA) return json({ fout: "bezet" }, 409);
    const basis = {
      code: String(opzet.code || "").toUpperCase(), sleutel: sleutelMaken(),
      vak: schoon(opzet.vak, 20), niveau: schoon(opzet.niveau, 20),
      fase: "lobby", spelers: {}, gemaakt: Date.now(), laatst: Date.now(), alarm: null
    };
    if (opzet.spel === "strijd"){
      const game = String(opzet.game || "");
      if (!SPELLEN_STRIJD[game]) return json({ fout: "onbekend spel" }, 400);
      this.stand = Object.assign(basis, { spel: "strijd", game, gestart: 0 });
    } else {
      const vragen = Array.isArray(opzet.vragen) ? opzet.vragen.slice(0, MAX_VRAGEN).map(q => ({
        v: schoon(q.v, 300),
        o: (Array.isArray(q.o) ? q.o : []).slice(0, 4).map(x => schoon(x, 120)),
        g: Number(q.g) || 0,
        u: schoon(q.u, 600),
        t: schoon(q.t, 60),
        vlag: /^[a-z-]{2,8}$/.test(q.vlag || "") ? q.vlag : undefined,
        svg: typeof q.svg === "string" && q.svg.length < 20000 && /^<svg[\s\S]*<\/svg>$/.test(q.svg.trim()) ? q.svg : undefined
      })).filter(q => q.v && q.o.length >= 2 && q.g >= 0 && q.g < q.o.length) : [];
      if (!vragen.length) return json({ fout: "geen vragen" }, 400);
      this.stand = Object.assign(basis, { spel: "quiz", onderdeel: schoon(opzet.onderdeel, 80), vragen,
        tijd: Math.max(5, Math.min(90, Number(opzet.tijd) || 20)), i: -1, vraagStart: 0 });
    }
    /* wat er nog aan oude sockets hangt, mag weg */
    this.ctx.getWebSockets().forEach(ws => { try { ws.close(1000, "nieuwe kamer"); } catch (e){} });
    await this.zetAlarm({ wat: "opruimen" }, OPRUIMEN_NA);
    await this.bewaar();
    return json({ code: this.stand.code, sleutel: this.stand.sleutel, n: this.stand.vragen ? this.stand.vragen.length : 0 });
  }

  verbind(url){
    if (!this.stand) return json({ fout: "geen kamer met deze code" }, 404);
    const rol = url.searchParams.get("rol") === "host" ? "host" : "speler";
    let sid = schoon(url.searchParams.get("sid"), 40);
    let naam = schoon(url.searchParams.get("naam"), 16) || "Leerling";
    if (rol === "host"){
      if (url.searchParams.get("sleutel") !== this.stand.sleutel) return json({ fout: "dit is niet jouw kamer" }, 403);
      sid = "host";
    } else {
      if (!/^[A-Za-z0-9_-]{8,40}$/.test(sid)) return json({ fout: "geen geldig kenmerk" }, 400);
      if (this.stand.fase === "einde") return json({ fout: "dit potje is al afgelopen" }, 410);
      if (!this.stand.spelers[sid] && Object.keys(this.stand.spelers).length >= MAX_SPELERS) return json({ fout: "de kamer zit vol" }, 409);
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server, [rol, sid]);
    server.serializeAttachment({ rol, sid });
    if (rol === "speler"){
      const bestaand = this.stand.spelers[sid];
      if (bestaand) bestaand.naam = naam;
      else this.stand.spelers[sid] = this.strijd
        ? { naam, ronde: 0, gehaald: 0, leven: 0, punten: 0, af: false, aanvallen: 0, sinds: Date.now() }
        : { naam, score: 0, antw: {}, sinds: Date.now() };
      this.ctx.waitUntil(this.bewaar());
    }
    this.stuur(server, Object.assign({ t: "welkom", rol, naam }, this.overzicht()));
    if (this.strijd){
      if (this.stand.fase === "bezig" && rol === "speler") this.stuur(server, { t: "start" });
      if (this.stand.fase === "einde") this.stuur(server, this.strijdEinde(rol === "speler" ? sid : null));
      else this.stuur(server, this.standBericht(rol === "speler" ? sid : null));
    } else {
      if (rol === "speler") this.stuur(server, { t: "jouw", jouw: this.jouw(sid) });
      /* midden in een vraag binnenkomen: die vraag meteen meesturen */
      if (this.stand.fase === "vraag") this.stuur(server, this.vraagBericht());
      if (this.stand.fase === "uitslag" && rol === "host") this.stuur(server, this.uitslagVoorHost());
      if (this.stand.fase === "uitslag" && rol === "speler") this.stuur(server, this.uitslagVoorSpeler(sid));
      if (this.stand.fase === "einde") this.stuur(server, this.eindeBericht(rol === "speler" ? sid : null));
    }
    this.zegSpelers();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, tekst){
    if (!this.stand) return;
    let m; try { m = JSON.parse(tekst); } catch (e){ return; }
    const wie = ws.deserializeAttachment() || {};
    if (wie.rol === "host" && m.t === "weg" && typeof m.sid === "string" && this.stand.spelers[m.sid]){
      delete this.stand.spelers[m.sid];
      this.ctx.getWebSockets(m.sid).forEach(s => { try { s.close(1000, "verwijderd door de docent"); } catch (e){} });
      await this.bewaar(); this.zegSpelers();
      if (this.strijd) this.planStand();
      return;
    }
    if (this.strijd) return this.strijdBericht(ws, wie, m);
    if (wie.rol === "host"){
      if (m.t === "start" && this.stand.fase === "lobby") return this.volgende();
      if (m.t === "volgende" && this.stand.fase === "uitslag") return this.volgende();
      if (m.t === "sluit" && this.stand.fase === "vraag") return this.sluitVraag();
      if (m.t === "stop" && this.stand.fase !== "einde") return this.einde();
      return;
    }
    if (m.t === "antwoord" && this.stand.fase === "vraag"){
      const sp = this.stand.spelers[wie.sid];
      const i = this.stand.i, q = this.stand.vragen[i];
      if (!sp || m.i !== i || sp.antw[i]) return;
      const k = Number(m.k);
      if (!(k >= 0 && k < q.o.length)) return;
      sp.antw[i] = { k, ms: Math.max(0, Date.now() - this.stand.vraagStart) };
      await this.bewaar();
      this.stuur(ws, { t: "ok", i });
      const geteld = this.geteld();
      this.naarHost({ t: "geteld", i, n: geteld.n, van: geteld.van });
      /* iedereen die er is heeft geantwoord: niet wachten op de klok */
      if (geteld.n >= geteld.van && geteld.van > 0) return this.sluitVraag();
    }
  }
  async webSocketClose(ws){ this.zegSpelers(); if (this.strijd) this.planStand(); }
  async webSocketError(ws){ this.zegSpelers(); }

  /* ---------- de klok ---------- */
  async zetAlarm(wat, over){
    this.stand.alarm = wat;
    await this.ctx.storage.setAlarm(Date.now() + over);
  }
  async alarm(){
    if (!this.stand) return;
    const a = this.stand.alarm || {};
    if (a.wat === "sluit" && !this.strijd && this.stand.fase === "vraag" && a.i === this.stand.i) return this.sluitVraag();
    if (a.wat === "opruimen"){
      this.ctx.getWebSockets().forEach(ws => { try { ws.close(1000, "de kamer is gesloten"); } catch (e){} });
      this.stand = null;
      await this.ctx.storage.deleteAll();
    }
  }

  /* ======================================================================
     De Klasstrijd
     ====================================================================== */
  async strijdBericht(ws, wie, m){
    const st = this.stand;
    if (wie.rol === "host"){
      if (m.t === "start" && st.fase === "lobby"){
        st.fase = "bezig"; st.gestart = Date.now();
        await this.zetAlarm({ wat: "opruimen" }, OPRUIMEN_NA);
        await this.bewaar();
        this.iedereen({ t: "start" });
        this.planStand();
      }
      if (m.t === "stop" && st.fase !== "einde") return this.strijdKlaar();
      return;
    }
    const sp = st.spelers[wie.sid];
    if (!sp || st.fase !== "bezig") return;
    if (m.t === "stand"){
      /* de ronde loopt alleen op; een speler die opnieuw begint gaat niet terug */
      sp.ronde = Math.max(sp.ronde, getal(m.ronde, 999));
      sp.gehaald = Math.max(sp.gehaald, getal(m.gehaald, 999));
      sp.leven = getal(m.leven, 9999);
      sp.punten = Math.max(sp.punten, getal(m.punten, 99999));
      sp.laatst = Date.now();
      await this.bewaar();
      this.planStand();
      return;
    }
    if (m.t === "aanval"){
      if (sp.af) return;
      const nu = Date.now();
      if (sp.laatsteAanval && nu - sp.laatsteAanval < 3000) return;   /* hoogstens een per drie seconden */
      sp.laatsteAanval = nu;
      const n = Math.max(1, Math.min(5, getal(m.n, 5)));
      sp.aanvallen = (sp.aanvallen || 0) + 1;
      const bericht = JSON.stringify({ t: "aanval", van: sp.naam, n });
      this.ctx.getWebSockets("speler").forEach(s => {
        const w = s.deserializeAttachment() || {};
        const ander = st.spelers[w.sid];
        if (!ander || w.sid === wie.sid || ander.af) return;
        try { s.send(bericht); } catch (e){}
      });
      await this.bewaar();
      this.planStand();
      return;
    }
    if (m.t === "af"){
      sp.af = true; sp.afTijd = Date.now();
      sp.ronde = Math.max(sp.ronde, getal(m.ronde, 999));
      sp.gehaald = Math.max(sp.gehaald, getal(m.ronde, 999));
      sp.punten = Math.max(sp.punten, getal(m.punten, 99999));
      await this.bewaar();
      this.planStand();
      const alle = Object.keys(st.spelers);
      if (alle.length && alle.every(id => st.spelers[id].af)) return this.strijdKlaar();
    }
  }
  /* de stand gaat op zijn vroegst om de ruim een seconde naar iedereen, hoe
     vaak de spelers ook melden */
  planStand(){
    if (this.standTimer) return;
    this.standTimer = setTimeout(() => { this.standTimer = null; this.stuurStand(); }, 1200);
  }
  strijdLijst(){
    const st = this.stand;
    return Object.keys(st.spelers).map(sid => {
      const sp = st.spelers[sid];
      return { sid, naam: sp.naam, ronde: sp.ronde, gehaald: sp.gehaald, leven: sp.leven, punten: sp.punten,
               af: !!sp.af, aanvallen: sp.aanvallen || 0, aan: this.aanwezig(sid) };
    }).sort((a, b) => b.gehaald - a.gehaald || b.punten - a.punten || (a.af === b.af ? 0 : a.af ? 1 : -1) || a.naam.localeCompare(b.naam))
      .map((r, i) => Object.assign(r, { rang: i + 1 }));
  }
  standBericht(sid){
    const lijst = this.strijdLijst();
    const bezig = lijst.filter(r => !r.af).length;
    const kop = lijst[0] ? { naam: lijst[0].naam, ronde: lijst[0].ronde } : null;
    if (!sid) return { t: "stand", spelers: lijst, bezig, fase: this.stand.fase };
    const mij = lijst.filter(r => r.sid === sid)[0];
    return { t: "stand", jouw: mij ? { rang: mij.rang, van: lijst.length } : null, bezig, koploper: kop };
  }
  stuurStand(){
    if (!this.strijd) return;
    this.naarHost(this.standBericht(null));
    this.ctx.getWebSockets("speler").forEach(ws => {
      const wie = ws.deserializeAttachment() || {};
      this.stuur(ws, this.standBericht(wie.sid));
    });
  }
  strijdEinde(sid){
    const lijst = this.strijdLijst();
    const mij = sid ? lijst.filter(r => r.sid === sid)[0] : null;
    return { t: "einde", stand: lijst, jouw: mij ? { rang: mij.rang, van: lijst.length, naam: mij.naam } : null };
  }
  async strijdKlaar(){
    this.stand.fase = "einde";
    await this.zetAlarm({ wat: "opruimen" }, NA_EINDE);
    await this.bewaar();
    this.naarHost(this.strijdEinde(null));
    this.ctx.getWebSockets("speler").forEach(ws => {
      const wie = ws.deserializeAttachment() || {};
      this.stuur(ws, this.strijdEinde(wie.sid));
    });
  }

  /* ======================================================================
     De Klasquiz
     ====================================================================== */
  async volgende(){
    this.stand.i++;
    if (this.stand.i >= this.stand.vragen.length) return this.einde();
    this.stand.fase = "vraag";
    this.stand.vraagStart = Date.now();
    await this.zetAlarm({ wat: "sluit", i: this.stand.i }, this.stand.tijd * 1000 + 400);
    await this.bewaar();
    this.iedereen(this.vraagBericht());
  }
  vraagBericht(){
    const q = this.stand.vragen[this.stand.i], nu = Date.now();
    return { t: "vraag", i: this.stand.i, n: this.stand.vragen.length, v: q.v, o: q.o, k: q.t,
             vlag: q.vlag, svg: q.svg, tijd: this.stand.tijd,
             tot: this.stand.vraagStart + this.stand.tijd * 1000, nu, geteld: this.geteld() };
  }
  async sluitVraag(){
    if (this.stand.fase !== "vraag") return;
    const i = this.stand.i, q = this.stand.vragen[i], tijdMs = this.stand.tijd * 1000;
    Object.keys(this.stand.spelers).forEach(sid => {
      const sp = this.stand.spelers[sid], a = sp.antw[i];
      if (!a || a.delta !== undefined) return;
      a.goed = a.k === q.g;
      /* goed is 500 punten, en tot 500 erbij voor snelheid */
      a.delta = a.goed ? 500 + Math.round(500 * Math.max(0, 1 - a.ms / tijdMs)) : 0;
      sp.score += a.delta;
    });
    this.stand.fase = "uitslag";
    await this.zetAlarm({ wat: "opruimen" }, OPRUIMEN_NA);
    await this.bewaar();
    this.naarHost(this.uitslagVoorHost());
    this.ctx.getWebSockets("speler").forEach(ws => {
      const wie = ws.deserializeAttachment() || {};
      this.stuur(ws, this.uitslagVoorSpeler(wie.sid));
    });
  }
  async einde(){
    this.stand.fase = "einde";
    await this.zetAlarm({ wat: "opruimen" }, NA_EINDE);
    await this.bewaar();
    this.naarHost(this.eindeBericht(null));
    this.ctx.getWebSockets("speler").forEach(ws => {
      const wie = ws.deserializeAttachment() || {};
      this.stuur(ws, this.eindeBericht(wie.sid));
    });
  }
  ranglijst(){
    return Object.keys(this.stand.spelers).map(sid => {
      const sp = this.stand.spelers[sid], a = sp.antw[this.stand.i] || {};
      return { sid, naam: sp.naam, score: sp.score, delta: a.delta || 0, goed: !!a.goed, aan: this.aanwezig(sid) };
    }).sort((a, b) => b.score - a.score || a.naam.localeCompare(b.naam))
      .map((r, i) => Object.assign(r, { rang: i + 1 }));
  }
  geteld(){
    const i = this.stand.i;
    const aan = Object.keys(this.stand.spelers).filter(sid => this.aanwezig(sid));
    return { n: aan.filter(sid => this.stand.spelers[sid].antw[i]).length, van: aan.length };
  }
  jouw(sid){
    const lijst = this.ranglijst(), r = lijst.filter(x => x.sid === sid)[0];
    return r ? { naam: r.naam, score: r.score, rang: r.rang, van: lijst.length } : null;
  }
  uitslagVoorHost(){
    const i = this.stand.i, q = this.stand.vragen[i];
    const verdeling = q.o.map(() => 0);
    Object.keys(this.stand.spelers).forEach(sid => { const a = this.stand.spelers[sid].antw[i]; if (a) verdeling[a.k]++; });
    return { t: "uitslag", i, n: this.stand.vragen.length, g: q.g, u: q.u, o: q.o, v: q.v, verdeling,
             stand: this.ranglijst().slice(0, 10), laatste: i >= this.stand.vragen.length - 1 };
  }
  uitslagVoorSpeler(sid){
    const i = this.stand.i, q = this.stand.vragen[i], sp = this.stand.spelers[sid], a = sp ? sp.antw[i] : null;
    return { t: "uitslag", i, n: this.stand.vragen.length, g: q.g, u: q.u, o: q.o,
             k: a ? a.k : -1, goed: !!(a && a.goed), delta: a ? a.delta : 0, jouw: this.jouw(sid),
             laatste: i >= this.stand.vragen.length - 1 };
  }
  eindeBericht(sid){
    return { t: "einde", n: this.stand.vragen.length, stand: this.ranglijst(), jouw: sid ? this.jouw(sid) : null };
  }

  /* ======================================================================
     Gedeeld
     ====================================================================== */
  aanwezig(sid){ return this.ctx.getWebSockets(sid).length > 0; }
  overzicht(){
    const st = this.stand, basis = { code: st.code, spel: st.spel, vak: st.vak, niveau: st.niveau, fase: st.fase };
    if (this.strijd){
      const lijst = this.strijdLijst();
      return Object.assign(basis, { game: st.game, gestart: st.gestart, bezig: lijst.filter(r => !r.af).length, spelers: lijst });
    }
    return Object.assign(basis, { onderdeel: st.onderdeel, i: st.i, n: st.vragen.length, tijd: st.tijd,
      spelers: this.ranglijst().map(r => ({ sid: r.sid, naam: r.naam, score: r.score, aan: r.aan })) });
  }
  zegSpelers(){
    if (!this.stand) return;
    this.naarHost({ t: "spelers", spelers: this.overzicht().spelers });
  }
  stuur(ws, bericht){ try { ws.send(JSON.stringify(bericht)); } catch (e){} }
  iedereen(bericht){ const s = JSON.stringify(bericht); this.ctx.getWebSockets().forEach(ws => { try { ws.send(s); } catch (e){} }); }
  naarHost(bericht){ const s = JSON.stringify(bericht); this.ctx.getWebSockets("host").forEach(ws => { try { ws.send(s); } catch (e){} }); }
}
