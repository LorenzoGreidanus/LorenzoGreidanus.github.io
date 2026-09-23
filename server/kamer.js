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
import { nette } from "./naamfilter.js";
/* de motor van Zwaardvechter: hetzelfde bestand dat de browser laadt */
import ZWAARDMOTOR from "../leermiddelen/zwaard-motor.js";
import TORENMOTOR from "../leermiddelen/toren-motor.js";
const TORENSTAP = 60, TOREN_STAND_OM = 2;   /* Torenverdediging: een tik van zestig milliseconden, de stand om de andere tik */
const TOREN_WACHT_KEUZE = 1500;             /* zolang wacht de kamer op de keuze van de tweede speler */
const RANGEN = { bb: 1, kgt: 2, havo: 3, vwo: 4 };
const MOTORSTAP = 1 / 60, MOTOR_STAND_OM = 2, MOTOR_STIL_OM = 12;   /* per hoeveel tikken de stand gaat: in de ronde, en daarbuiten */
const MOTOR_ZONDER_SPELERS = 60 * 1000;                            /* zonder een enkele speler stopt de motor na een minuut */

const MAX_SPELERS = 60, MAX_VRAGEN = 60;
const AFTELLEN = 3000;                       /* een duel begint drie seconden nadat de tweede speler er is */
const SAMEN_MAX = 4;                         /* Zwaardvechter samen: tot vier in een arena; de maker start, of het begint vanzelf als hij vol is */
const OPRUIMEN_NA = 3 * 60 * 60 * 1000;     /* een kamer leeft hoogstens drie uur */
const NA_EINDE = 30 * 60 * 1000;             /* na de eindstand nog een half uur te bekijken */
const SPELLEN_STRIJD = { toren: "Torenverdediging", zwaard: "Zwaardvechter" };
/* spellen met rollen op telefoons: het bord draait het spel, de kamer deelt kaarten uit en geeft acties door */
const SPELLEN_ROLLEN = { polis: "De vergadering van de klas", meetlat: "Langs de meetlat", staten: "De vergadering", berlijn: "De Conferentie van Berlijn", standen: "Stem per stand", crisis: "De crisis", teken: "Tekenslag" };
const KAART_MAX = 12000, BORD_MAX = 40000, ACTIE_MAX = 4000;
const KLAS_SLAAPT = 400 * 24 * 60 * 60 * 1000; /* een klascode blijft tot de docent hem opheft, of tot hij ruim een jaar niet gebruikt is */
const KLAS_MAX = 3000;
/* hoeveel verschillende leerlingen er in een klas passen: ruim boven alle klassen
   van een docent bij elkaar, maar wel een grens tegen volduwen */
const KLAS_LEERLINGEN = 400;
/* spellen die een opdracht kunnen zijn: bij een onderdeel telt het aantal goed in dat onderdeel, anders de ronde (of het aantal goed bij de Vragenrace) */
const OPDRACHT_SPELLEN = { race: true, toren: true, zwaard: true };
function maatVoor(r, o){
  if (r.spel !== o.spel || (r.vak || "") !== o.vak || r.t < o.sinds) return 0;
  if (o.deel) return r.od && r.od[o.deel] ? (r.od[o.deel][0] | 0) : 0;
  return r.ronde | 0;
}
function haaltOpdracht(r, o){ return maatVoor(r, o) >= o.min; }                        /* hoogstens zoveel gemelde potjes per klas */
/* spellen zonder kamer die wel bij een klas melden */
const KLAS_SPELLEN = { race: "Vragenrace", klasquiz: "Klasquiz", dag: "Dagelijkse uitdaging", fouten: "Oefen je fouten", rekenen: "Rekenrace", balans: "De balans", werkwoorden: "Werkwoordrace", irregular: "Irregular verbs", vlaggen: "Vlaggen", landenvormen: "Landenvormen", topografie: "Topografie", lichaam: "Het lichaam", tijdvakken: "Tijdvakken sorteren", bronnenlab: "Bronnenlab", jagers: "Blijven of doorlopen", feodalisme: "Feodalisme", leenmannen: "Verdeel je rijk", stad: "Bouw je stad", handel: "De handelsroute", vergadering: "De vergadering", zinsbouw: "Zinsbouw", tekstdetective: "De tekstdetective", uitverkoop: "De uitverkoop", breukenbakker: "De breukenbakker",
  /* Deze meldden hun uitslag wel, maar stonden hier niet, dus de klas kreeg ze
     nooit te zien: de melding werd geweigerd met "onbekend spel". */
  dhte: "Het DHTE-schema", vlakken: "Vlakken herkennen", organisme: "Bouw het organisme" };
/* Hoeveel periodes een docent mag instellen, en hoe lang een naam mag zijn. */
const PERIODES_MAX = 12, PERIODE_NAAM = 40;

/* per onderdeel [goed, gesteld]: hoogstens dertig onderdelen, korte namen, kleine getallen */
function schoonOd(od){
  if (!od || typeof od !== "object") return undefined;
  const uit = {}; let n = 0;
  for (const k of Object.keys(od)){
    if (n >= 30) break;
    const naam = schoon(k, 40), w = od[k];
    if (!naam || !Array.isArray(w)) continue;
    const goed = getal(w[0], 500), tot = getal(w[1], 500);
    if (tot <= 0 || goed > tot) continue;
    uit[naam] = [goed, tot]; n++;
  }
  return n ? uit : undefined;
}

function json(obj, status){
  return new Response(JSON.stringify(obj), { status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function schoon(tekst, max){
  return String(tekst || "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}
function getal(x, max){ const n = Number(x); return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.round(n))) : 0; }
/* een gekozen avatar: v3k2o1m0e4, anders leeg (dan komt hij uit de bijnaam) */
function schoonAv(a){ a = String(a || "").replace(/[^a-z0-9]/g, "").slice(0, 32); return /^v\dk\do\dm\de\d(h\d{1,2})?(r\d{1,2})?(z\d{1,2})?(b\d{1,2})?(a\d{1,2})?(q\d{1,2})?$/.test(a) ? a : ""; }
function sleutelMaken(n){
  const r = crypto.getRandomValues(new Uint8Array(n || 12));
  return Array.from(r, b => b.toString(16).padStart(2, "0")).join("");
}
/* Het plaatje bij een vraag is een stukje SVG dat op ieders scherm in de
   pagina komt. Alleen eenvoudige vormen mogen erin: geen scripts, geen
   verwijzingen naar buiten, geen gebeurtenissen. */
export function veiligSvg(s){
  if (typeof s !== "string" || s.length > 20000) return false;
  if (!/^<svg[\s>][\s\S]*<\/svg>\s*$/i.test(s.trim())) return false;
  if (/<\s*(script|foreignobject|iframe|object|embed|image|use|animate|animatemotion|animatetransform|set|link|meta|style|a)\b/i.test(s)) return false;
  if (/\son[a-z]+\s*=|javascript:|href|xlink|<!|<\?|url\(/i.test(s)) return false;
  return true;
}
/* Hoeveel berichten een speler per tien seconden mag sturen. Samen spelen
   in de pas komt op zo'n tweehonderd tot vierhonderd (de gastheer bevestigt
   twintig keer per seconde, plus de bewegingen van allebei); de grens ligt
   daar ruim boven. Wie er toch overheen gaat wordt genegeerd, wie er ver
   overheen gaat wordt afgesloten. De bytes per venster houden een echte
   overstroming tegen. */
const VENSTER = 10000, NEGEREN_BIJ = 1200, BYTES_PER_VENSTER = 2500000, AFSLUITEN_BIJ = 3000;

export class Kamer extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.stand = null;
    this.standTimer = null;
    /* de motor van een duel Zwaardvechter, zolang het potje loopt */
    this.motor = null; this.motorKlok = null; this.motorTik = 0; this.motorSids = []; this.motorLeeg = 0; this.motorSpel = ""; this.motorKeuze = {}; this.motorWacht = null;
    this.tempo = {};        /* per speler: hoeveel berichten deze seconde */
    this.ctx.blockConcurrencyWhile(async () => {
      this.stand = (await this.ctx.storage.get("stand")) || null;
    });
    /* pings van de browser beantwoordt het platform zelf, ook als de kamer slaapt */
    try { this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong")); }
    catch (e){ console.error("autoResponse", e && e.message); }
  }
  async bewaar(){ this.stand.laatst = Date.now(); await this.ctx.storage.put("stand", this.stand); }
  get strijd(){ return !!this.stand && this.stand.spel === "strijd"; }
  get rollen(){ return !!this.stand && this.stand.spel === "rollen"; }

  /* ---------- binnenkomend ---------- */
  async fetch(req){
    try {
      const url = new URL(req.url);
      if (url.pathname === "/nieuw") return await this.nieuw(await req.json());
      if (url.pathname === "/stand") return this.stand ? json(this.overzicht()) : json({ fout: "geen kamer met deze code" }, 404);
      if (url.pathname === "/meld" && req.method === "POST") return await this.meld(await req.json());
      if (url.pathname === "/melden" && req.method === "POST") return await this.melden(await req.json());
      if (url.pathname === "/opheffen" && req.method === "POST") return await this.opheffen(await req.json());
      if (url.pathname === "/resultaten") return await this.resultaten(url.searchParams.get("sleutel"));
      if (url.pathname === "/opdracht" && req.method === "POST") return await this.opdracht(await req.json());
      if (url.pathname === "/instelling" && req.method === "POST") return await this.instelling(await req.json());
      if (url.pathname === "/periodes" && req.method === "POST") return await this.periodes(await req.json());
      if (url.pathname === "/hoi" && req.method === "POST") return await this.hoi(await req.json());
      if (url.pathname === "/leerlingweg" && req.method === "POST") return await this.leerlingWeg(await req.json());
      if (url.pathname === "/mijn") return this.mijn(url.searchParams.get("sid"));
      if (req.headers.get("Upgrade") === "websocket") return this.verbind(url);
      return json({ fout: "onbekend" }, 404);
    } catch (e){
      console.error("kamer", e && e.stack || e);
      /* de melding blijft algemeen: wat er precies misging staat in het logboek,
         niet in het antwoord aan de buitenwereld */
      return json({ fout: "de kamer gaf een fout" }, 500);
    }
  }

  async nieuw(opzet){
    /* een code die nog in gebruik is geven we niet nog een keer uit */
    if (this.stand && (this.stand.spel === "klas" ? Date.now() - this.stand.laatst < KLAS_SLAAPT : (this.stand.fase !== "einde" && Date.now() - this.stand.laatst < OPRUIMEN_NA))) return json({ fout: "bezet" }, 409);
    const basis = {
      code: String(opzet.code || "").toUpperCase(), sleutel: sleutelMaken(),
      vak: schoon(opzet.vak, 20), niveau: schoon(opzet.niveau, 20), deel: schoon(opzet.deel, 300).replace(/[^a-z0-9 ,-]/gi, ""),
      fase: "lobby", spelers: {}, gemaakt: Date.now(), laatst: Date.now(), alarm: null
    };
    if (opzet.spel === "klas"){
      /* een klascode: geen spel, maar een bak waarin leerlingen hun uitslagen melden en die de docent leest */
      this.stand = Object.assign(basis, { spel: "klas", naam: schoon(opzet.naam, 40) || "Klas", resultaten: [],
        /* een klas van de eigenaar van de site: index.js zet deze vlag, nooit de browser */
        vanEigenaar: !!opzet.vanEigenaar });
    } else if (opzet.spel === "rollen"){
      const game = String(opzet.game || "");
      if (!SPELLEN_ROLLEN[game]) return json({ fout: "onbekend spel" }, 400);
      this.stand = Object.assign(basis, { spel: "rollen", game, gestart: 0, bord: null, n: 0 });
    } else if (opzet.spel === "strijd"){
      const game = String(opzet.game || "");
      if (!SPELLEN_STRIJD[game]) return json({ fout: "onbekend spel" }, 400);
      /* een duel: twee spelers, geen docent, begint vanzelf als de tweede er is */
      this.stand = Object.assign(basis, { spel: "strijd", game, gestart: 0, duel: !!opzet.duel });
    } else {
      const vragen = Array.isArray(opzet.vragen) ? opzet.vragen.slice(0, MAX_VRAGEN).map(q => q && typeof q === "object" ? ({
        v: schoon(q.v, 300),
        o: (Array.isArray(q.o) ? q.o : []).slice(0, 4).map(x => schoon(x, 120)),
        g: Number(q.g) || 0,
        u: schoon(q.u, 600),
        t: schoon(q.t, 60),
        vlag: /^[a-z-]{2,8}$/.test(q.vlag || "") ? q.vlag : undefined,
        svg: veiligSvg(q.svg) ? q.svg : undefined
      }) : null).filter(q => q && q.v && q.o.length >= 2 && q.g >= 0 && q.g < q.o.length) : [];
      if (!vragen.length) return json({ fout: "geen vragen" }, 400);
      this.stand = Object.assign(basis, { spel: "quiz", onderdeel: schoon(opzet.onderdeel, 80), vragen,
        tijd: Math.max(5, Math.min(90, Number(opzet.tijd) || 20)), i: -1, vraagStart: 0 });
    }
    /* wat er nog aan oude sockets hangt, mag weg */
    this.ctx.getWebSockets().forEach(ws => { try { ws.close(1000, "nieuwe kamer"); } catch (e){} });
    await this.zetAlarm({ wat: "opruimen" }, this.stand.spel === "klas" ? KLAS_SLAAPT : OPRUIMEN_NA);
    await this.bewaar();
    return json({ code: this.stand.code, sleutel: this.stand.sleutel, n: this.stand.vragen ? this.stand.vragen.length : 0 });
  }

  verbind(url){
    if (!this.stand) return json({ fout: "geen kamer met deze code" }, 404);
    if (this.stand.spel === "klas") return json({ fout: "een klascode is geen spelkamer" }, 400);
    const rol = url.searchParams.get("rol") === "host" ? "host" : "speler";
    let sid = schoon(url.searchParams.get("sid"), 40);
    let naam = nette(url.searchParams.get("naam"), "Leerling");   /* door het naamfilter */
    const av = schoonAv(url.searchParams.get("av"));
    if (rol === "host"){
      if (url.searchParams.get("sleutel") !== this.stand.sleutel) return json({ fout: "dit is niet jouw kamer" }, 403);
      sid = "host";
    } else {
      if (!/^[A-Za-z0-9_-]{8,40}$/.test(sid)) return json({ fout: "geen geldig kenmerk" }, 400);
      if (this.stand.fase === "einde") return json({ fout: "dit potje is al afgelopen" }, 410);
      const vol = this.stand.duel ? this.samenMax() : MAX_SPELERS;
      if (!this.stand.spelers[sid] && Object.keys(this.stand.spelers).length >= vol) return json({ fout: this.stand.duel ? (vol === 2 ? "dit duel heeft al twee spelers" : "deze kamer zit vol: vier spelers") : "de kamer zit vol" }, 409);
      /* wie te laat is voor een potje samen, kan er niet meer in */
      if (this.stand.duel && !this.stand.spelers[sid] && this.stand.fase !== "lobby" && this.stand.fase !== "aftellen") return json({ fout: "dit potje is al begonnen" }, 410);
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server, [rol, sid]);
    server.serializeAttachment({ rol, sid });
    if (rol === "speler"){
      const bestaand = this.stand.spelers[sid];
      if (bestaand){ bestaand.naam = naam; bestaand.av = av; }
      else this.stand.spelers[sid] = this.strijd
        ? { naam, av, pid: sleutelMaken(4), ronde: 0, gehaald: 0, leven: 0, punten: 0, af: false, aanvallen: 0, sinds: Date.now() }
        : this.rollen ? { naam, av, pid: sleutelMaken(4), kaart: null, sinds: Date.now() }
        : { naam, av, pid: sleutelMaken(4), score: 0, antw: {}, sinds: Date.now() };
      /* Naar buiten toe heet een speler bij zijn korte, openbare nummer (pid);
         het kenmerk waarmee hij verbindt (sid) blijft geheim, anders kon een
         ander zich voor hem uitgeven. */
      if (!this.stand.spelers[sid].pid) this.stand.spelers[sid].pid = sleutelMaken(4);
      /* in een duel is de eerste speler de gastheer: die rekent de gedeelde arena uit */
      if (this.strijd && this.stand.duel && !this.stand.gastheer) this.stand.gastheer = sid;
      this.ctx.waitUntil(this.bewaar());
    }
    this.stuur(server, Object.assign({ t: "welkom", rol, naam, jij: rol === "speler" ? this.pid(sid) : null }, this.overzicht()));
    if (this.rollen){
      /* een telefoon die (terug)komt krijgt zijn kaart en het bord van dit moment */
      if (rol === "speler"){
        const sp = this.stand.spelers[sid];
        if (this.stand.bord) this.stuur(server, { t: "bord", d: this.stand.bord });
        if (sp && sp.kaart) this.stuur(server, { t: "kaart", d: sp.kaart });
        if (this.stand.fase === "einde") this.stuur(server, { t: "einde" });
      }
      this.zegSpelers();
      return new Response(null, { status: 101, webSocket: client });
    }
    if (this.strijd){
      if (this.stand.fase === "bezig" && rol === "speler"){
        /* de motor is weg (opnieuw uitgerold, of even niemand aan de lijn): opnieuw opbouwen waar ze waren */
        const hersteld = this.stand.duel && !this.motor ? this.motorHerstel() : false;
        this.stuur(server, Object.assign(this.startBericht(sid), hersteld ? { herstel: true } : {}));
        if (this.motor) this.stuur(server, { t: "net", d: this.motor.pakket() });
      }
      if (this.stand.fase === "einde") this.stuur(server, this.strijdEinde(rol === "speler" ? sid : null));
      else this.stuur(server, this.standBericht(rol === "speler" ? sid : null));
      /* een duel telt af zodra de tweede speler binnen is; samen met meer pas als de kamer vol is, of als de maker start */
      if (this.stand.duel && this.stand.fase === "lobby" && Object.keys(this.stand.spelers).length >= this.samenMax() && this.lobbyKlaar()){
        this.ctx.waitUntil(this.duelAftellen());
      }
      this.zegSpelers();
      if (rol === "speler") this.planStand();
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
    if (typeof tekst !== "string" || tekst.length > 70000) return;
    const wie = ws.deserializeAttachment() || {};
    if (!this.opTempo(ws, wie, tekst.length)) return;
    let m; try { m = JSON.parse(tekst); } catch (e){ return; }
    if (!m || typeof m !== "object") return;
    const wegSid = wie.rol === "host" && m.t === "weg" ? this.sidVanPid(m.sid) : null;
    if (wegSid){
      delete this.stand.spelers[wegSid];
      this.ctx.getWebSockets(wegSid).forEach(s => { try { s.close(1000, "verwijderd door de docent"); } catch (e){} });
      await this.bewaar(); this.zegSpelers();
      if (this.strijd) this.planStand();
      return;
    }
    if (this.strijd) return this.strijdBericht(ws, wie, m);
    if (this.rollen) return this.rollenBericht(ws, wie, m);
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

  /* ======================================================================
     De rollenkamer: het bord stuurt kaarten (naar een speler of naar
     iedereen), de telefoons sturen acties terug. De kamer bewaart alleen de
     laatste kaart per speler en het laatste bord, zodat een telefoon die de
     verbinding kwijtraakt verder kan waar hij was.
     ====================================================================== */
  async rollenBericht(ws, wie, m){
    const st = this.stand;
    if (wie.rol === "host"){
      if (m.t === "start" && st.fase === "lobby"){
        st.fase = "bezig"; st.gestart = Date.now();
        await this.zetAlarm({ wat: "opruimen" }, OPRUIMEN_NA);
        await this.bewaar();
        this.iedereen({ t: "start" });
        return;
      }
      if (m.t === "stop" && st.fase !== "einde"){
        st.fase = "einde";
        await this.zetAlarm({ wat: "opruimen" }, NA_EINDE);
        await this.bewaar();
        this.iedereen({ t: "einde" });
        return;
      }
      if (m.t === "naar" || m.t === "kaarten"){
        const lijst = m.t === "naar" ? [{ pid: m.pid, d: m.d }] : (Array.isArray(m.lijst) ? m.lijst.slice(0, 200) : []);
        for (const k of lijst){
          const sid = this.sidVanPid(k.pid), sp = sid && st.spelers[sid];
          if (!sp || k.d === undefined) continue;
          const s = JSON.stringify({ t: "kaart", d: k.d });
          if (s.length > KAART_MAX) continue;
          sp.kaart = k.d;
          this.ctx.getWebSockets(sid).forEach(w => { try { w.send(s); } catch (e){} });
        }
        await this.bewaar();
        return;
      }
      /* vlug: van het bord naar alle spelers zonder te bewaren, voor de streken van een tekening */
      if (m.t === "vlug"){
        if (m.d === undefined) return;
        const s = JSON.stringify({ t: "vlug", d: m.d });
        if (s.length > ACTIE_MAX * 2) return;
        this.ctx.getWebSockets("speler").forEach(w => { try { w.send(s); } catch (e){} });
        return;
      }
      if (m.t === "alle"){
        if (m.d === undefined) return;
        const s = JSON.stringify({ t: "bord", d: m.d });
        if (s.length > BORD_MAX) return;
        st.bord = m.d;
        await this.bewaar();
        this.ctx.getWebSockets("speler").forEach(w => { try { w.send(s); } catch (e){} });
        return;
      }
      return;
    }
    const sp = st.spelers[wie.sid];
    if (!sp || st.fase === "einde") return;
    if (m.t === "actie"){
      if (m.d === undefined) return;
      const s = JSON.stringify({ t: "actie", van: sp.pid, naam: sp.naam, d: m.d });
      if (s.length > ACTIE_MAX) return;
      this.ctx.getWebSockets("host").forEach(w => { try { w.send(s); } catch (e){} });
    }
  }
  opTempo(ws, wie, lengte){
    const nu = Date.now(), k = wie.sid || "?";
    let tp = this.tempo[k];
    if (!tp || nu - tp.sinds > VENSTER) tp = this.tempo[k] = { sinds: nu, tel: 0, bytes: 0 };
    tp.tel++; tp.bytes += lengte;
    if (tp.tel > AFSLUITEN_BIJ){ try { ws.close(1008, "te veel berichten"); } catch (e){} return false; }
    return tp.tel <= NEGEREN_BIJ && tp.bytes <= BYTES_PER_VENSTER;
  }
  pid(sid){ const sp = this.stand && this.stand.spelers[sid]; return sp ? sp.pid : null; }
  sidVanPid(pid){
    if (typeof pid !== "string" || !this.stand) return null;
    return Object.keys(this.stand.spelers).filter(s => this.stand.spelers[s].pid === pid)[0] || null;
  }
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
    if (a.wat === "duelstart" && this.strijd && this.stand.fase === "aftellen") return this.strijdStart();
    if (a.wat === "opruimen"){
      this.motorStop();
      this.ctx.getWebSockets().forEach(ws => { try { ws.close(1000, "de kamer is gesloten"); } catch (e){} });
      this.stand = null;
      await this.ctx.storage.deleteAll();
    }
  }

  /* ======================================================================
     De Klasstrijd
     ====================================================================== */
  /* hoeveel er in een potje samen passen: Zwaardvechter vier, Torenverdediging twee */
  samenMax(){ return this.stand && this.stand.duel && this.stand.game === "zwaard" ? SAMEN_MAX : 2; }
  /* Zwaardvechter samen begint pas als iedereen in de lobby klaar is; andere spellen hebben geen lobbykeuze */
  lobbyKlaar(){
    const st = this.stand; if (!st || st.game !== "zwaard") return true;
    const sids = Object.keys(st.spelers);
    return sids.length >= 2 && sids.every(sid => !!st.spelers[sid].klaar);
  }
  /* het startsein, met voor Zwaardvechter samen wie welke speler is (de volgorde van de motor) */
  startBericht(sid){
    const b = { t: "start" };
    if (this.motorSids && this.motorSpel === "zwaard"){
      b.mij = this.motorSids.indexOf(sid);
      b.spelers = this.motorSids.map(s => { const sp = this.stand.spelers[s] || {}; return { sid: sp.pid, naam: sp.naam, av: sp.av || "" }; });
    }
    return b;
  }
  async strijdStart(){
    const st = this.stand;
    st.fase = "bezig"; st.gestart = Date.now();
    await this.zetAlarm({ wat: "opruimen" }, OPRUIMEN_NA);
    await this.bewaar();
    if (st.duel && st.game === "zwaard") this.motorStart();
    if (this.motorSids && this.motorSpel === "zwaard"){
      this.ctx.getWebSockets("speler").forEach(ws => { const wie = ws.deserializeAttachment() || {}; this.stuur(ws, this.startBericht(wie.sid)); });
      this.naarHost({ t: "start" });
    } else this.iedereen({ t: "start" });
    this.planStand();
    if (st.duel && st.game === "toren"){
      /* het bord komt zodra de keuze van allebei binnen is, en anders na een korte wachttijd */
      if (!this.torenStart()) this.motorWacht = setTimeout(() => { this.motorWacht = null; this.torenStart(true); }, TOREN_WACHT_KEUZE);
    }
  }
  /* De motor opnieuw opbouwen bij de ronde die de spelers het laatst meldden.
     Zwaardvechter: de spelers sturen daarna hun uitrusting, leven en munten
     terug (k:"herstel", een korte tijd toegestaan). Torenverdediging: een
     nieuw bord bij die ronde, met wat extra munten voor wat er stond. */
  motorHerstel(){
    const st = this.stand;
    if (!st || !st.duel || this.motor || st.fase !== "bezig") return false;
    const ronde = Math.max(1, ...Object.keys(st.spelers).map(s => st.spelers[s].ronde | 0));
    if (st.game === "zwaard"){
      this.motorStart();
      const W = this.motor; if (!W) return false;
      /* Zaten de spelers tussen de rondes (vragen, winkel)? Dan daar verder, niet met een nieuwe ronde: anders slaan ze de vragen over. */
      const tussen = Object.keys(st.spelers).some(s => st.spelers[s].fase === "tussen" && (st.spelers[s].ronde | 0) >= ronde);
      if (tussen){ W.ronde = ronde; W.fase = "vragen"; W.spelers.forEach(P => { P.klaar = false; }); }
      else if (ronde > 1){ W.ronde = ronde - 1; W.volgendeRonde(); }
      this.motorHersteld = Date.now();
      console.log("kamer " + st.code + ": motor Zwaardvechter hersteld bij ronde " + ronde);
      return true;
    }
    if (st.game === "toren"){
      this.motorRonde = ronde;
      if (!this.torenStart()) this.motorWacht = setTimeout(() => { this.motorWacht = null; this.torenStart(true); }, TOREN_WACHT_KEUZE);
      console.log("kamer " + st.code + ": bord Torenverdediging hersteld bij ronde " + ronde);
      return true;
    }
    return false;
  }
  /* ---------- de motor van Torenverdediging in de kamer ----------
     De gastheer bepaalt de omgeving en het niveau, het menu is van allebei
     (eerst de torens van de gastheer, dan die van zijn maat), en wat een van
     beiden vrij heeft is op dit bord vrij. */
  torenStart(nu){
    if (this.motor || !this.stand || this.stand.fase !== "bezig") return true;
    const st = this.stand, sids = Object.keys(st.spelers);
    const eerst = st.gastheer && st.spelers[st.gastheer] ? st.gastheer : sids[0];
    const lijst = [eerst].concat(sids.filter(x => x !== eerst)).slice(0, 2);
    if (lijst.length < 2) return false;
    const bewaard = st.keuze || {};
    const a = this.motorKeuze[lijst[0]] || bewaard[lijst[0]], b = this.motorKeuze[lijst[1]] || bewaard[lijst[1]];
    if (!a || (!b && !nu)) return false;
    const menu = [];
    (Array.isArray(a.gz) ? a.gz : []).concat(Array.isArray(b && b.gz) ? b.gz : []).forEach(id => {
      if (typeof id === "string" && TORENMOTOR.SOORTEN[id] && menu.indexOf(id) < 0 && menu.length < TORENMOTOR.SAMENKEUZE) menu.push(id);
    });
    const vrij = {};
    ["tonkla", "aap", "eiland", "archipel", "vulkaan"].forEach(k => { vrij[k] = !!((a.vb && a.vb[k]) || (b && b.vb && b.vb[k])); });
    const W = TORENMOTOR.maak({ thema: typeof a.th === "string" ? a.th : "plein", torens: menu, vrij, rang: RANGEN[st.niveau] || Number(a.rang) || 2 });
    if (this.motorRonde > 1 && W.bank){ W.bank.ronde = this.motorRonde - 1; W.bank.munten += 25 * (this.motorRonde - 1); }
    this.motorRonde = 0;
    this.motor = W; this.motorSpel = "toren"; this.motorSids = lijst; this.motorTik = 0; this.motorLeeg = 0;
    this.motorZend();
    /* zoveel tikken als er echte tijd verstreken is, en nooit meer dan drie in een keer */
    let laatst = Date.now(), rest = 0;
    this.motorKlok = setInterval(() => {
      try {
        if (!this.motor || !this.stand || this.stand.fase !== "bezig"){ this.motorStop(); return; }
        const nu = Date.now(); rest = Math.min(rest + (nu - laatst), 3 * TORENSTAP); laatst = nu;
        let gedaan = 0;
        while (rest >= TORENSTAP && gedaan < 3 && this.motor){
          rest -= TORENSTAP; gedaan++;
          W.stap();
          this.motorTik++;
          if (W.fase === "einde"){ this.motorZend(); this.motorStop(); return; }
          if (this.motorTik % TOREN_STAND_OM === 0) this.motorZend();
          if (this.motorTik % 16 === 0){
            if (this.ctx.getWebSockets("speler").length === 0){ this.motorLeeg += 1000; if (this.motorLeeg >= MOTOR_ZONDER_SPELERS) this.motorStop(); }
            else this.motorLeeg = 0;
          }
        }
      } catch (e){ console.error("torenmotor", e && e.stack || e); this.motorStop(); }
    }, TORENSTAP / 2);
    return true;
  }
  /* ---------- de motor van Zwaardvechter in de kamer ----------
     De gastheer van het duel is speler 0, de ander speler 1: dezelfde
     volgorde als in de browsers. De kamer tikt zestig keer per seconde en
     stuurt de stand om de drie tikken; buiten de ronde (vragen, winkel) om
     de twaalf, want dan beweegt er niets. Zonder spelers stopt hij na een
     minuut, en bij het einde van het potje meteen. */
  motorStart(){
    if (this.motor || !this.stand) return;
    const st = this.stand, sids = Object.keys(st.spelers);
    const eerst = st.gastheer && st.spelers[st.gastheer] ? st.gastheer : sids[0];
    this.motorSids = [eerst].concat(sids.filter(x => x !== eerst)).slice(0, SAMEN_MAX);
    if (this.motorSids.length < 2) return;
    const W = ZWAARDMOTOR.maak({ spelers: this.motorSids.map(sid => ({ naam: st.spelers[sid].naam })) });
    this.motorSids.forEach((sid, i) => { const s2 = st.spelers[sid]; if (s2 && s2.stijl) W.zetStats(i, { stijl: s2.stijl }); });
    this.motor = W; this.motorSpel = "zwaard"; this.motorTik = 0; this.motorLeeg = 0;
    W.volgendeRonde();
    this.motorZend();
    /* zoveel stappen als er echte tijd verstreken is, en nooit meer dan vier in een keer */
    const STAPMS = 1000 * MOTORSTAP;
    let laatst = Date.now(), rest = 0;
    this.motorKlok = setInterval(() => {
      try {
        if (!this.motor || !this.stand || this.stand.fase !== "bezig"){ this.motorStop(); return; }
        const nu = Date.now(); rest = Math.min(rest + (nu - laatst), 4 * STAPMS); laatst = nu;
        let gedaan = 0;
        while (rest >= STAPMS && gedaan < 4 && this.motor){
          rest -= STAPMS; gedaan++;
          W.stap(MOTORSTAP);
          this.motorTik++;
          if (W.fase === "einde"){ this.motorZend(); this.motorStop(); return; }
          if (this.motorTik % (W.fase === "ronde" ? MOTOR_STAND_OM : MOTOR_STIL_OM) === 0) this.motorZend();
          /* niemand meer aan de lijn: even wachten, dan ophouden */
          if (this.motorTik % 60 === 0){
            if (this.ctx.getWebSockets("speler").length === 0){ this.motorLeeg += 1000; if (this.motorLeeg >= MOTOR_ZONDER_SPELERS) this.motorStop(); }
            else this.motorLeeg = 0;
          }
        }
      } catch (e){ console.error("motor", e && e.stack || e); this.motorStop(); }
    }, STAPMS / 2);
  }
  motorZend(){
    if (!this.motor) return;
    const s = JSON.stringify({ t: "net", d: this.motor.pakket() });
    this.ctx.getWebSockets("speler").forEach(ws => { try { ws.send(s); } catch (e){} });
  }
  motorStop(){
    if (this.motorKlok){ clearInterval(this.motorKlok); this.motorKlok = null; }
    if (this.motorWacht){ clearTimeout(this.motorWacht); this.motorWacht = null; }
    this.motor = null; this.motorSpel = "";
  }
  /* wat een speler de motor stuurt: toetsen, uitrusting, klaar, pauze */
  motorBericht(wie, d){
    const W = this.motor, i = this.motorSids.indexOf(wie.sid);
    if (!W || i < 0 || !d) return;
    if (this.motorSpel === "toren"){
      /* alles wat een speler op het bord doet; de kamer past dezelfde regels toe als het bord zelf */
      if (["bouw", "sterker", "weg", "zet", "kracht", "wegding", "dingweg", "slot", "ronde", "munt", "vrij", "pz", "snel"].indexOf(d.k) < 0) return;
      /* Munten komen van een goed antwoord, en een vraag beantwoorden kost
         tijd. Zonder rem paste er zestigduizend munten per seconde in de
         gedeelde kas. Hoogstens een melding per anderhalve seconde en
         vierduizend munten per minuut is ruim boven wat vragen opleveren. */
      if (d.k === "munt"){
        const nu = Date.now();
        this.muntKlok = this.muntKlok || {}; this.muntTeller = this.muntTeller || {};
        const vorig = this.muntKlok[wie.sid] || 0;
        if (nu - vorig < 1500) return;
        const bak = this.muntTeller[wie.sid] || { t: nu, n: 0 };
        if (nu - bak.t > 60000){ bak.t = nu; bak.n = 0; }
        const w = Math.max(0, Math.min(500, d.w | 0));
        if (bak.n + w > 4000) return;
        bak.n += w; this.muntTeller[wie.sid] = bak; this.muntKlok[wie.sid] = nu;
      }
      /* de pauzeknop is van iedereen, dus hij mag niet als knipperlicht dienen */
      if (d.k === "pz"){
        const nu2 = Date.now();
        this.pauzeKlok = this.pauzeKlok || {};
        if (nu2 - (this.pauzeKlok[wie.sid] || 0) < 1500) return;
        this.pauzeKlok[wie.sid] = nu2;
      }
      W.voerUit(d);
      if (d.k === "pz" || d.k === "snel" || d.k === "bouw" || d.k === "zet") this.motorZend();
      return;
    }
    if (d.k === "in"){
      W.zetInvoer(i, d.dx, d.dy, Math.max(0, d.nr | 0), !!d.blok);
      if (d.dash) W.spelers[i].dashVraag = true;
      if (d.wapen) W.spelers[i].wapenVraag = true;
    } else if (d.k === "stats"){ W.zetStats(i, d.s, d.hp); }
    else if (d.k === "crit"){ W.crit(i); }
    else if (d.k === "klaar"){ W.zetStats(i, d.s, d.hp); if (W.klaar(i)) this.motorZend(); else this.motorZend(); }
    else if (d.k === "pauze"){ W.pauze = !!d.aan; this.motorZend(); }
    else if (d.k === "herstel" && this.motorHersteld && Date.now() - this.motorHersteld < 30000){
      W.zetStats(i, d.s, d.hp);
      if (typeof d.munten === "number" && isFinite(d.munten)) W.spelers[i].munten = Math.max(0, Math.min(9999, Math.round(d.munten)));
      this.motorZend();
    }
  }
  async duelAftellen(){
    this.stand.fase = "aftellen";
    await this.zetAlarm({ wat: "duelstart" }, AFTELLEN);
    await this.bewaar();
    this.iedereen({ t: "aftellen", s: Math.round(AFTELLEN / 1000) });
  }
  async strijdBericht(ws, wie, m){
    const st = this.stand;
    if (wie.rol === "host"){
      if (m.t === "start" && st.fase === "lobby") return this.strijdStart();
      if (m.t === "stop" && st.fase !== "einde") return this.strijdKlaar();
      return;
    }
    const sp = st.spelers[wie.sid];
    if (!sp) return;
    /* In een duel mag een speler die alleen wacht de kamer sluiten. Wie al
       speelt niet meer: die kon anders vlak voor zijn val op stop drukken en
       zo de uitslag vastzetten terwijl hij voorstond. */
    if (m.t === "stop" && st.duel && st.fase !== "einde" &&
        (st.fase === "lobby" || Object.keys(st.spelers).length <= 1)) return this.strijdKlaar();
    /* samen met meer: de maker start zodra er minstens twee zijn */
    if (m.t === "start" && st.duel && st.fase === "lobby" && wie.sid === st.gastheer && Object.keys(st.spelers).length >= 2 && this.lobbyKlaar()) return this.duelAftellen();
    /* de lobby van Zwaardvechter samen: een stijl kiezen en klaar melden; vol en allemaal klaar begint het vanzelf */
    if (m.t === "lobby" && st.duel && st.fase === "lobby"){
      if (["ridder", "schutter", "wacht"].indexOf(m.stijl) >= 0) sp.stijl = m.stijl;
      sp.klaar = !!m.klaar;
      await this.bewaar();
      this.iedereen({ t: "lobby", spelers: this.strijdLijst().map(r => ({ sid: r.sid, naam: r.naam, av: r.av, stijl: r.stijl, klaar: r.klaar, aan: r.aan })) });
      if (Object.keys(st.spelers).length >= this.samenMax() && this.lobbyKlaar()) return this.duelAftellen();
      return;
    }
    /* berichten tussen de spelers onderling (de gedeelde arena): de kamer geeft ze
       alleen door, bewaart niets en kijkt er niet in */
    if (m.t === "net"){
      if (st.fase === "einde" || m.d === undefined) return;
      if (m.d && m.d.k === "kz" && st.game === "toren"){
        this.motorKeuze[wie.sid] = m.d;
        st.keuze = st.keuze || {}; st.keuze[wie.sid] = m.d; this.ctx.waitUntil(this.bewaar());
        if (st.fase === "bezig" && !this.motor && this.torenStart()){ if (this.motorWacht){ clearTimeout(this.motorWacht); this.motorWacht = null; } }
        return;
      }
      if (this.motor){ this.motorBericht(wie, m.d); return; }
      const s = JSON.stringify({ t: "net", van: wie.sid, d: m.d });
      if (s.length > 60000) return;
      this.ctx.getWebSockets("speler").forEach(ws2 => {
        const w = ws2.deserializeAttachment() || {};
        if (w.sid !== wie.sid){ try { ws2.send(s); } catch (e){} }
      });
      return;
    }
    if (st.fase !== "bezig") return;
    if (m.t === "stand"){
      const nu0 = Date.now();
      if (sp.standLaatst && nu0 - sp.standLaatst < 400) return;   /* vaker dan dit hoeft niet */
      sp.standLaatst = nu0;
      /* de ronde loopt alleen op; een speler die opnieuw begint gaat niet terug */
      const dak = this.rondeDak();
      sp.ronde = Math.max(sp.ronde, Math.min(getal(m.ronde, 999), dak));
      sp.gehaald = Math.max(sp.gehaald, Math.min(getal(m.gehaald, 999), dak));
      sp.leven = getal(m.leven, 9999);
      sp.punten = Math.max(sp.punten, Math.min(getal(m.punten, 99999), dak * 200));
      sp.fase = m.fase === "tussen" ? "tussen" : "ronde";   /* tussen de rondes (vragen, winkel) of erin */
      sp.laatst = Date.now();
      await this.bewaar();
      this.planStand();
      return;
    }
    if (m.t === "aanval"){
      const nu = Date.now();
      if (sp.laatsteAanval && nu - sp.laatsteAanval < 3000) return;   /* hoogstens een per drie seconden */
      sp.laatsteAanval = nu;
      const n = Math.max(1, Math.min(5, getal(m.n, 5)));
      /* Met naar: naar die ene speler. Wie af is kiest zelf een doel; wie nog
         speelt stuurt zijn reeks naar iedereen, zoals het al ging. */
      const naar = m.naar ? this.sidVanPid(String(m.naar).slice(0, 40)) : null;
      if (sp.af && !naar) return;
      sp.aanvallen = (sp.aanvallen || 0) + 1;
      const bericht = JSON.stringify({ t: "aanval", van: sp.naam, n });
      this.ctx.getWebSockets("speler").forEach(s => {
        const w = s.deserializeAttachment() || {};
        const ander = st.spelers[w.sid];
        if (!ander || w.sid === wie.sid || ander.af) return;
        if (naar && w.sid !== naar) return;
        try { s.send(bericht); } catch (e){}
      });
      await this.bewaar();
      this.planStand();
      return;
    }
    if (m.t === "af"){
      const dak2 = this.rondeDak();
      sp.af = true; sp.afTijd = Date.now();
      sp.ronde = Math.max(sp.ronde, Math.min(getal(m.ronde, 999), dak2));
      sp.gehaald = Math.max(sp.gehaald, Math.min(getal(m.ronde, 999), dak2));
      sp.punten = Math.max(sp.punten, Math.min(getal(m.punten, 99999), dak2 * 200));
      await this.bewaar();
      this.planStand();
      const alle = Object.keys(st.spelers);
      /* in een duel is het klaar zodra er een valt; met de klas als iedereen af is */
      if (st.duel && alle.length >= 2) return this.strijdKlaar();
      if (alle.length && alle.every(id => st.spelers[id].af)) return this.strijdKlaar();
    }
  }
  /* Hoeveel rondes er op zijn hoogst gespeeld kunnen zijn. Een speler meldt
     zelf hoe ver hij is en dat bord hangt vooraan in de klas, dus het loont om
     er een groot getal in te zetten. Narekenen kan de kamer niet, maar de klok
     kent hij wel: vier seconden per ronde is ruim onder wat een ronde echt
     kost, met twee rondes speling voor het begin. */
  rondeDak(){
    const gestart = this.stand && this.stand.gestart;
    if (!gestart) return 999;
    return Math.min(999, 2 + Math.floor((Date.now() - gestart) / 4000));
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
      return { sid: sp.pid, naam: sp.naam, av: sp.av || "", ronde: sp.ronde, gehaald: sp.gehaald, leven: sp.leven, punten: sp.punten,
               af: !!sp.af, aanvallen: sp.aanvallen || 0, aan: this.aanwezig(sid), stijl: sp.stijl || "", klaar: !!sp.klaar };
    }).sort((a, b) => (this.stand.duel && a.af !== b.af) ? (a.af ? 1 : -1)   /* in een duel wint wie overeind blijft */
        : (b.gehaald - a.gehaald || b.punten - a.punten || (a.af === b.af ? 0 : a.af ? 1 : -1) || a.naam.localeCompare(b.naam)))
      .map((r, i) => Object.assign(r, { rang: i + 1 }));
  }
  standBericht(sid){
    const lijst = this.strijdLijst();
    const bezig = lijst.filter(r => !r.af).length;
    const kop = lijst[0] ? { naam: lijst[0].naam, ronde: lijst[0].ronde } : null;
    if (!sid) return { t: "stand", spelers: lijst, bezig, fase: this.stand.fase };
    const pid = this.pid(sid);
    const mij = lijst.filter(r => r.sid === pid)[0];
    const tegen = this.stand.duel ? (lijst.filter(r => r.sid !== pid)[0] || null) : null;
    const maten = this.stand.duel ? lijst.filter(r => r.sid !== pid).map(r => ({ sid: r.sid, naam: r.naam, av: r.av || "", ronde: r.ronde, leven: r.leven, af: r.af, aan: r.aan, stijl: r.stijl, klaar: r.klaar })) : undefined;
    /* Wie af is krijgt de lijst met wie er nog speelt, zodat hij kan kiezen
       naar wie zijn fouten gaan. Wie nog speelt heeft die lijst niet nodig en
       krijgt hem dus ook niet. */
    /* aan telt mee: wie zijn tabblad dicht deed staat nog in de lijst maar
       merkt niets van je fouten, en dan gooi je een goed antwoord weg */
    const doelen = (mij && mij.af) ? lijst.filter(r => !r.af && r.aan && r.sid !== pid).map(r => ({ sid: r.sid, naam: r.naam, av: r.av || "", ronde: r.ronde })) : undefined;
    return { t: "stand", jouw: mij ? { rang: mij.rang, van: lijst.length, af: !!mij.af } : null, bezig, koploper: kop, fase: this.stand.fase, maten, doelen, max: this.stand.duel ? this.samenMax() : undefined,
             tegen: tegen ? { naam: tegen.naam, av: tegen.av || "", ronde: tegen.ronde, leven: tegen.leven, punten: tegen.punten, af: tegen.af, aan: tegen.aan } : null };
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
    const pid = sid ? this.pid(sid) : null;
    const mij = pid ? lijst.filter(r => r.sid === pid)[0] : null;
    return { t: "einde", stand: lijst, jouw: mij ? { rang: mij.rang, van: lijst.length, naam: mij.naam } : null };
  }
  async strijdKlaar(){
    this.motorStop();
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
      const od = {};
      Object.keys(sp.antw).forEach(k => { const q = this.stand.vragen[k], a2 = sp.antw[k]; if (!q || !a2 || a2.goed === undefined) return; const o = q.t || "overig"; od[o] = od[o] || [0, 0]; od[o][1]++; if (a2.goed) od[o][0]++; });
      return { sid: sp.pid, naam: sp.naam, av: sp.av || "", score: sp.score, delta: a.delta || 0, goed: !!a.goed, aantalGoed: Object.keys(sp.antw).filter(k => sp.antw[k] && sp.antw[k].goed).length, od, aan: this.aanwezig(sid) };
    }).sort((a, b) => b.score - a.score || a.naam.localeCompare(b.naam))
      .map((r, i) => Object.assign(r, { rang: i + 1 }));
  }
  geteld(){
    const i = this.stand.i;
    const aan = Object.keys(this.stand.spelers).filter(sid => this.aanwezig(sid));
    return { n: aan.filter(sid => this.stand.spelers[sid].antw[i]).length, van: aan.length };
  }
  jouw(sid){
    const pid = this.pid(sid), lijst = this.ranglijst(), r = lijst.filter(x => x.sid === pid)[0];
    return r ? { naam: r.naam, score: r.score, rang: r.rang, van: lijst.length } : null;
  }
  uitslagVoorHost(){
    const i = this.stand.i, q = this.stand.vragen[i];
    const verdeling = q.o.map(() => 0);
    Object.keys(this.stand.spelers).forEach(sid => { const a = this.stand.spelers[sid].antw[i]; if (a) verdeling[a.k]++; });
    return { t: "uitslag", i, n: this.stand.vragen.length, g: q.g, u: q.u, o: q.o, v: q.v, vlag: q.vlag, svg: q.svg, verdeling,
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
  /* ---------- het klasoverzicht ---------- */
  async meld(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (Date.now() - this.stand.laatst > KLAS_SLAAPT) return json({ fout: "deze klascode is opgeheven" }, 410);
    const sid = schoon(inz && inz.sid, 40);
    if (!/^[A-Za-z0-9_-]{8,40}$/.test(sid)) return json({ fout: "geen geldig kenmerk" }, 400);
    const spel = String(inz.spel || "");
    if (!SPELLEN_STRIJD[spel] && !KLAS_SPELLEN[spel]) return json({ fout: "onbekend spel" }, 400);
    const kort = sid.slice(0, 12);
    /* wie er al in zit mag altijd blijven melden; alleen een nieuwe erbij kan geweigerd worden */
    const bekend = (this.stand.leerlingen && this.stand.leerlingen[kort]) || this.stand.resultaten.some(r => r.sid === kort);
    if (!bekend){
      const wie = new Set(this.stand.resultaten.map(r => r.sid));
      Object.keys(this.stand.leerlingen || {}).forEach(x => wie.add(x));
      if (wie.size >= KLAS_LEERLINGEN) return json({ fout: "deze klas zit vol" }, 429);
    }
    this.stand.leerlingen = this.stand.leerlingen || {};
    if (!this.stand.leerlingen[kort]) this.stand.leerlingen[kort] = { naam: nette(inz.naam, "Leerling"), av: schoonAv(inz.av), sinds: Date.now(), t: Date.now() };
    else this.stand.leerlingen[kort].t = Date.now();
    this.voegToe({ sid: kort, naam: nette(inz.naam, "Leerling"), av: schoonAv(inz.av), spel, ronde: getal(inz.ronde, 250), punten: getal(inz.punten, 5000),
                   niveau: schoon(inz.niveau, 10), vak: schoon(inz.vak, 10), od: schoonOd(inz.od), t: Date.now() });
    await this.zetAlarm({ wat: "opruimen" }, KLAS_SLAAPT);
    await this.bewaar();
    return json({ ok: true, n: this.stand.resultaten.length });
  }
  /* Een leerling meldt zich zodra hij de klascode invult, nog voor hij iets
     speelt. Zo ziet de docent aan het begin van de les wie er binnen is. */
  async hoi(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (Date.now() - this.stand.laatst > KLAS_SLAAPT) return json({ fout: "deze klascode is opgeheven" }, 410);
    const sid = schoon(inz && inz.sid, 40);
    if (!/^[A-Za-z0-9_-]{8,40}$/.test(sid)) return json({ fout: "geen geldig kenmerk" }, 400);
    const kort = sid.slice(0, 12);
    this.stand.leerlingen = this.stand.leerlingen || {};
    if (!this.stand.leerlingen[kort] && Object.keys(this.stand.leerlingen).length >= KLAS_LEERLINGEN) return json({ fout: "deze klas zit vol" }, 429);
    const was = this.stand.leerlingen[kort];
    /* ms is de naam van het Microsoft-account, door index.js uit het
       sessiekoekje gehaald. Is die er niet (niet ingelogd), dan blijft staan
       wat er stond: uitloggen hoort de docent niet meteen zijn zicht te kosten. */
    const ms = schoon(inz.ms, 40) || (was && was.ms) || "";
    this.stand.leerlingen[kort] = { naam: nette(inz.naam, "Leerling"), av: schoonAv(inz.av), ms,
                                    sinds: was && was.sinds || Date.now(), t: Date.now() };
    await this.zetAlarm({ wat: "opruimen" }, KLAS_SLAAPT);
    await this.bewaar();
    return json({ ok: true, n: Object.keys(this.stand.leerlingen).length });
  }
  /* per leerling per spel hoogstens dertig potjes, en een plafond voor de hele klas */
  voegToe(r){
    const mijn = this.stand.resultaten.filter(x => x.sid === r.sid && x.spel === r.spel);
    if (mijn.length >= 30) this.stand.resultaten.splice(this.stand.resultaten.indexOf(mijn[0]), 1);
    this.stand.resultaten.push(r);
    if (this.stand.resultaten.length > KLAS_MAX) this.stand.resultaten.splice(0, this.stand.resultaten.length - KLAS_MAX);
  }
  /* De docent meldt een hele uitslag ineens, bijvoorbeeld van een Klasquiz:
     alleen met de sleutel van de klas. Het kenmerk per leerling komt uit de
     bijnaam, zodat dezelfde bijnaam bij dezelfde leerling terechtkomt. */
  async melden(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (Date.now() - this.stand.laatst > KLAS_SLAAPT) return json({ fout: "deze klascode is opgeheven" }, 410);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    const spel = String(inz.spel || "");
    if (!SPELLEN_STRIJD[spel] && !KLAS_SPELLEN[spel]) return json({ fout: "onbekend spel" }, 400);
    const lijst = Array.isArray(inz.lijst) ? inz.lijst.slice(0, 80) : [];
    if (!lijst.length) return json({ fout: "geen uitslag" }, 400);
    const t = Date.now();
    let n = 0;
    for (const r of lijst){
      const naam = nette(r && r.naam, "");
      if (!naam) continue;
      const sid = ("kq-" + naam.toLowerCase().replace(/[^a-z0-9]/g, "") + "xxxxxxxx").slice(0, 12);
      this.voegToe({ sid, naam, av: schoonAv(r.av), spel, ronde: getal(r.ronde, 250), punten: getal(r.punten, 5000), niveau: schoon(inz.niveau, 10), vak: schoon(inz.vak, 10), od: schoonOd(r.od), t });
      n++;
    }
    await this.zetAlarm({ wat: "opruimen" }, KLAS_SLAAPT);
    await this.bewaar();
    return json({ ok: true, n });
  }
  /* De opdracht van de docent: een spel, een vak, eventueel een onderdeel, een minimum en een einddatum.
     Leerlingen zien hem in de leeromgeving; wie hem haalt staat in het klasoverzicht aangevinkt. */
  async opdracht(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    const o = inz.opdracht;
    if (!o){ delete this.stand.opdracht; await this.bewaar(); return json({ ok: true, opdracht: null }); }
    const spel = String(o.spel || ""), vak = String(o.vak || "").replace(/[^a-z]/g, "").slice(0, 8), deel = schoon(o.deel, 40);
    if (!OPDRACHT_SPELLEN[spel]) return json({ fout: "dit spel kan geen opdracht zijn" }, 400);
    if (!vak) return json({ fout: "kies een vak" }, 400);
    const min = getal(o.min, 250), tot = getal(o.tot, 4e12);
    if (min < 1) return json({ fout: "het minimum is minstens 1" }, 400);
    if (tot < Date.now() - 3600000 || tot > Date.now() + 120 * 86400000) return json({ fout: "kies een datum binnen vier maanden" }, 400);
    this.stand.opdracht = { spel, vak, deel, deelNaam: schoon(o.deelNaam, 60), min, tot, tekst: schoon(o.tekst, 140), sinds: Date.now() };
    await this.bewaar();
    return json({ ok: true, opdracht: this.stand.opdracht });
  }
  /* De instellingen van een klas: welke spellen de leerlingen zien, en of de lesmodus aanstaat.
     Leeg lijstje betekent: alles mag. In de lesmodus ziet een gekoppelde leerling alleen die spellen. */
  async instelling(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    if (Array.isArray(inz.spellen)) this.stand.spellen = inz.spellen.slice(0, 60).map(x => schoon(x, 30).replace(/[^a-z0-9-]/g, "")).filter(Boolean);
    if (typeof inz.lesmodus === "boolean") this.stand.lesmodus = inz.lesmodus;
    await this.bewaar();
    return json({ ok: true, spellen: this.stand.spellen || [], lesmodus: !!this.stand.lesmodus });
  }
  /* De periodes van de docent: zelf ingestelde stukken van het jaar, met een
     naam en een begin- en einddatum. Ze doen niets met wat er bewaard wordt;
     ze zijn er om het overzicht mee te filteren, zodat je "periode 2" kunt
     bekijken zonder de rest van het jaar erbij. De hele lijst gaat in een keer
     heen en weer: dat is minder verkeer dan per periode een verzoek, en de
     docent bewerkt ze toch als een lijstje. */
  async periodes(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    if (!Array.isArray(inz.periodes)) return json({ fout: "geen periodes" }, 400);
    const grens = 3 * 365 * 86400000, nu = Date.now();
    const uit = [];
    for (const p of inz.periodes.slice(0, PERIODES_MAX)){
      const naam = schoon(p && p.naam, PERIODE_NAAM);
      const van = getal(p && p.van, 4e12), tot = getal(p && p.tot, 4e12);
      if (!naam) return json({ fout: "geef elke periode een naam" }, 400);
      if (!van || !tot || tot <= van) return json({ fout: "de einddatum van " + naam + " ligt voor de begindatum" }, 400);
      if (van < nu - grens || tot > nu + grens) return json({ fout: naam + " ligt te ver weg; houd het binnen drie jaar" }, 400);
      uit.push({ id: schoon(p.id, 12).replace(/[^a-z0-9]/gi, "") || ("p" + uit.length + Math.random().toString(36).slice(2, 6)), naam, van, tot });
    }
    this.stand.periodes = uit;
    await this.bewaar();
    return json({ ok: true, periodes: uit });
  }
  /* heeft een leerling (op kenmerk) de opdracht gehaald? Zonder sleutel: alleen zijn eigen stand. */
  mijn(sid){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    const o = this.stand.opdracht;
    const opzet = { spellen: this.stand.spellen || [], lesmodus: !!this.stand.lesmodus, naam: this.stand.naam,
      /* zat deze leerling bij de eigenaar van de site in de klas? */
      oudleerling: !!this.stand.vanEigenaar };
    if (!o) return json(Object.assign({ opdracht: null }, opzet));
    const s = schoon(sid, 40).slice(0, 12);
    const mijn = this.stand.resultaten.filter(r => r.sid === s);
    return json(Object.assign({ opdracht: o, gehaald: mijn.some(r => haaltOpdracht(r, o)), beste: mijn.reduce((a, r) => Math.max(a, maatVoor(r, o)), 0) }, opzet));
  }
  /* Een leerling uit de klas halen: hij verdwijnt uit de lijst en zijn
     uitslagen gaan mee. Hij kan zich daarna gewoon opnieuw koppelen met de
     code, want dit is bedoeld voor wie er per ongeluk in zit, niet als straf. */
  async leerlingWeg(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    const id = schoon(inz.id, 12);
    if (!id) return json({ fout: "geen leerling" }, 400);
    const l = this.stand.leerlingen || {};
    const had = !!l[id];
    delete l[id];
    const voor = this.stand.resultaten.length;
    this.stand.resultaten = this.stand.resultaten.filter(r => r.sid !== id);
    if (!had && voor === this.stand.resultaten.length) return json({ fout: "die leerling zit niet in deze klas" }, 404);
    await this.bewaar();
    return json({ ok: true, weg: voor - this.stand.resultaten.length, leerlingen: this.gekoppeld() });
  }
  /* de docent heft de klascode op: alles weg, en de leerlingen merken het bij hun volgende melding */
  async opheffen(inz){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!inz || inz.sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    this.stand = null;
    await this.ctx.storage.deleteAll();
    return json({ ok: true });
  }
  async resultaten(sleutel){
    if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
    if (!sleutel || sleutel !== this.stand.sleutel) return json({ fout: "dit is niet jouw klas" }, 403);
    /* kijken telt ook als gebruik, hoogstens een keer per uur bijgeschreven */
    if (Date.now() - this.stand.laatst > 3600000){ await this.zetAlarm({ wat: "opruimen" }, KLAS_SLAAPT); await this.bewaar(); }
    return json({ code: this.stand.code, naam: this.stand.naam, gemaakt: this.stand.gemaakt, opdracht: this.stand.opdracht || null,
                  spellen: this.stand.spellen || [], lesmodus: !!this.stand.lesmodus,
                  periodes: this.stand.periodes || [],
                  leerlingen: this.gekoppeld(),
                  resultaten: this.stand.resultaten.map(x => ({ naam: x.naam, av: x.av || "", spel: x.spel, ronde: x.ronde, punten: x.punten, niveau: x.niveau, vak: x.vak, od: x.od, t: x.t })) });
  }

  /* Wie is er gekoppeld, en heeft die al iets gespeeld? Het kenmerk zelf gaat
     niet mee naar buiten; de docent heeft genoeg aan de naam en het vlaggetje. */
  gekoppeld(){
    const gespeeld = new Set((this.stand.resultaten || []).map(r => r.sid));
    const l = this.stand.leerlingen || {};
    return Object.keys(l).map(s => ({ id: s, naam: l[s].naam, av: l[s].av || "", ms: l[s].ms || "", sinds: l[s].sinds, gespeeld: gespeeld.has(s) }))
      .sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
  }
  aanwezig(sid){ return this.ctx.getWebSockets(sid).length > 0; }
  overzicht(){
    const st = this.stand, basis = { code: st.code, spel: st.spel, vak: st.vak, niveau: st.niveau, deel: st.deel || "", fase: st.fase };
    if (st.spel === "klas") return Object.assign(basis, { naam: st.naam, n: st.resultaten.length, gemaakt: st.gemaakt, opdracht: st.opdracht || null });
    if (this.strijd){
      const lijst = this.strijdLijst();
      return Object.assign(basis, { game: st.game, duel: !!st.duel, max: st.duel ? this.samenMax() : undefined, gastheer: st.gastheer ? this.pid(st.gastheer) : null, gestart: st.gestart, bezig: lijst.filter(r => !r.af).length, spelers: lijst });
    }
    if (this.rollen){
      return Object.assign(basis, { game: st.game, gestart: st.gestart, spelers: Object.keys(st.spelers).map(sid => {
        const sp = st.spelers[sid];
        return { sid: sp.pid, naam: sp.naam, av: sp.av || "", aan: this.aanwezig(sid), rol: sp.kaart && sp.kaart.rol ? sp.kaart.rol : null };
      }).sort((a, b) => a.naam.localeCompare(b.naam)) });
    }
    return Object.assign(basis, { onderdeel: st.onderdeel, i: st.i, n: st.vragen.length, tijd: st.tijd,
      spelers: this.ranglijst().map(r => ({ sid: r.sid, naam: r.naam, av: r.av, score: r.score, aan: r.aan })) });
  }
  zegSpelers(){
    if (!this.stand) return;
    this.naarHost({ t: "spelers", spelers: this.overzicht().spelers });
  }
  stuur(ws, bericht){ try { ws.send(JSON.stringify(bericht)); } catch (e){} }
  iedereen(bericht){ const s = JSON.stringify(bericht); this.ctx.getWebSockets().forEach(ws => { try { ws.send(s); } catch (e){} }); }
  naarHost(bericht){ const s = JSON.stringify(bericht); this.ctx.getWebSockets("host").forEach(ws => { try { ws.send(s); } catch (e){} }); }
}
