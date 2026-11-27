/* ============================================================================
   TEAMBAAS: de racemanager voor wie is ingelogd.

   Elke leerling met een account heeft een raceteam met twee coureurs. Met
   munten (vooral uit goed beantwoorde vragen) koop je upgrades voor de auto,
   de coureurs en het hoofdkwartier; een upgrade duurt even, en elk goed
   antwoord maakt hem tien minuten korter. Elke zondag om 20.00 rijdt de server
   in elke divisie een race op de baan van die week. De leerling kijkt hem
   daarna terug als stippen op de baan.

   Een Durable Object-klasse, twee soorten objecten (idFromName):
     "t:<account>"  een team: munten, onderdelen, coureurs, werkplaats, vragen
     "liga"         de divisies, de stand, de wekelijkse race (alarm) en de uitslagen
   Het team stuurt de liga na elke wijziging een momentopname van wat in de
   race telt; de liga rijdt met die momentopnamen. Na een race haalt het team
   bij het volgende bezoek zijn munten op.

   Routes (index.js geeft alles onder /api/teambaas hierheen, met het account):
     GET  /api/teambaas                  het team, de divisie, de volgende race
     POST /api/teambaas/start            { naam, k1, k2 } een nieuw team
     POST /api/teambaas/upgrade          { wat } motor, aero, accu, betrouw, hq, c1.snel, ...
     GET  /api/teambaas/vraag?vak=&niv=  een vraag (de server kent het antwoord)
     POST /api/teambaas/antwoord         { token, keuze, job }
     POST /api/teambaas/strategie        { nr, strat }
     POST /api/teambaas/helm             { nr, helm }
     GET  /api/teambaas/race?week=&div=  een race om terug te kijken
     POST /api/teambaas/test/race        alleen lokaal: rijd de race van deze week nu
   ============================================================================ */
import { DurableObject } from "cloudflare:workers";
import { vies } from "./naamfilter.js";
import { laadVragen, VRAAGVAKKEN } from "./stadvragen.js";
import { veiligSvg } from "./kamer.js";
import TEAMBAAS from "../leermiddelen/teambaas-data.js";

const T = TEAMBAAS, R = T.REGELS;
function json(o, status){ return new Response(JSON.stringify(o), { status: status || 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }); }
function willekeur(n){ const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, b => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join(""); }
/* een toevalsgenerator met een zaadje: dezelfde race geeft altijd dezelfde uitkomst */
function rng(zaad){ let a = zaad >>> 0; return function(){ a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hash(s){ let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* ============================================================================
   DE RACE
   Tijd in seconden van een echte race, afstand in ronden. De snelheid hangt af van
   de plek op de baan (T.profiel: bochten en rechte stukken), de auto, de coureur en
   de banden. Elke halve seconde rijdt elke auto verder; om de twee seconden komt er
   een beeld bij voor de herhaling. Wat er gebeurt (crash, pech, gele vlag, safety
   car, pitstop) staat in de gebeurtenissen.
   Zoals in 2026: elke auto heeft een batterij die in de bochten laadt en op de rechte
   stukken extra vermogen geeft. Op de lange rechte stukken klapt de achtervleugel open
   (active aero). Zit je bij het begin van zo'n stuk binnen een seconde van je voorganger,
   dan krijg je overtake mode: extra stroom en een veel grotere kans om in te halen.
   ============================================================================ */
export function simuleer(deelnemers, zaad, baan){
  const r = rng(zaad), RONDEN = T.RONDEN, dt = 0.5, BEELD = 2;
  const b = baan || T.BANEN[0], prof = T.profiel(b), L = b.lengte, NP = T.NP, RT = prof.rondetijd;
  const autos = [];
  deelnemers.forEach(e => (e.c || []).slice(0, 2).forEach((c, i) => {
    const kans = Math.max(0, Math.min(0.5, +e.uitval || 0));
    const valt = r() < kans;
    autos.push({ team: e.id, nr: i + 1, motor: e.motor | 0, aero: e.aero | 0, snel: c.snel | 0,
      inh: c.inhalen | 0, con: c.constant | 0, accu: e.accu | 0 || 1, strat: T.strategie(c.strat),
      dnfRonde: valt ? 2 + Math.floor(r() * 12) : 0, dnfSoort: r() < 0.5 ? "crash" : "pech" });
  }));
  /* hoe snel een auto op een plek van de baan is: de motor telt op de rechte stukken,
     de aerodynamica in de bochten, de coureur overal een beetje */
  function factor(a, idx){ const st = prof.st[idx]; return 1 + 0.012 * (a.motor - 5) * st + 0.012 * (a.aero - 5) * (1 - st) + 0.006 * (a.snel - 5); }
  /* de startopstelling: een ronde op tempo met een beetje toeval, de snelste vooraan */
  autos.forEach(a => { let t0 = 0; for (let k = 0; k < NP; k++) t0 += prof.ds / (prof.v[k] * factor(a, k)); a.kwal = t0 + (r() - 0.5) * 0.6; });
  const grid = autos.map((a, i) => i).sort((x, y) => autos[x].kwal - autos[y].kwal);
  grid.forEach((ai, pos) => { const a = autos[ai]; a.p = -0.0025 * pos; a.band = a.strat.start; a.stint = 0; a.k = 0; a.pit = 0; a.scGepit = false; a.ruisRonde = -1; a.ruis = 1; a.uit = ""; a.klaar = 0; a.bat = 0.8; a.zone = false; a.ot = null; });
  const beelden = [], accu = [], ots = [], gebeurt = [], geel = [], ZONE = 0.85, AKKU = 3, GEEF = 0.014;
  let tLaad = 0, tGeef = 0;
  for (let k = 0; k < NP; k++){ const s = prof.ds / prof.v[k]; if (prof.st[k] < 0.5) tLaad += s; else if (prof.st[k] > 0.7) tGeef += s; }
  const LAAD = GEEF * tGeef / Math.max(1, tLaad) * 0.85;
  let t = 0, sc = 0, scStart = 0, volgend = 0;
  function noteer(s, ai, extra){ const o = { t: Math.round(t), s, a: ai }; if (extra) Object.assign(o, extra); gebeurt.push(o); return o; }
  function otKlaar(a){ if (a.ot){ a.ot[2] = Math.round(t); a.ot = null; } }
  const idxVan = p => Math.floor((((p % 1) + 1) % 1) * NP) % NP;
  while (t < 6000){
    const rijden = autos.map((a, i) => i).filter(i => !autos[i].uit && !autos[i].klaar).sort((x, y) => autos[y].p - autos[x].p);
    if (!rijden.length) break;
    if (scStart && t >= scStart){ scStart = 0; noteer("sc", -1); }
    if (sc && t >= sc){ sc = 0; noteer("scuit", -1); }
    const scNu = sc && !scStart;
    let voorIdx = -1;
    rijden.forEach(ai => {
      const a = autos[ai];
      if (a.pit > 0){ otKlaar(a); a.pit -= dt; if (a.pit <= 0){ a.band = a.nieuw; a.stint = a.p; noteer("pituit", ai, { b: a.band }); } return; }
      if (a.dnfRonde && a.p >= a.dnfRonde - 0.5){
        a.uit = a.dnfSoort; otKlaar(a); const sec = T.sector(a.p);
        noteer(a.uit, ai, { sec });
        /* gele vlag in die sector; bij een crash daarna de safety car */
        const tot = t + (a.uit === "crash" ? 15 : 25);
        geel.push({ sec, tot }); noteer("geel", -1, { sec, tot: Math.round(tot) });
        if (a.uit === "crash" && !sc){ scStart = t + 15; sc = scStart + 3 * RT * 1.4; }
        return;
      }
      const stop = a.strat.stops[a.k];
      if (stop && a.p >= stop.ronde){ a.k++; a.pit = scNu ? T.PIT_SC : T.PIT; a.nieuw = stop.band; noteer("pit", ai, { b: stop.band, sc: scNu ? 1 : 0 }); return; }
      if (scNu && a.strat.sc && !a.scGepit && a.k < a.strat.stops.length){ const s2 = a.strat.stops[a.k]; a.k++; a.scGepit = true; a.pit = T.PIT_SC; a.nieuw = s2.band; noteer("pit", ai, { b: s2.band, sc: 1 }); return; }
      const ronde = Math.floor(a.p);
      if (ronde !== a.ruisRonde){ a.ruisRonde = ronde; a.ruis = 1 + (r() - 0.5) * 0.008 * (11 - Math.max(1, Math.min(10, a.con))) / 5; }
      const idx = idxVan(a.p), band = 1 - T.bandTijd(a.band, Math.max(0, a.p - a.stint)) / RT;
      const sec = T.sector(a.p), geelHier = geel.some(g => g.sec === sec && t < g.tot);
      const voor = voorIdx >= 0 ? autos[voorIdx] : null, st = prof.st[idx], zone = st > ZONE && !geelHier && !scNu;
      /* overtake mode: bij het begin van een zone binnen een seconde van de auto voor je */
      if (zone && !a.zone && voor && !voor.klaar && (voor.p - a.p) * RT < 1 && a.bat > 0.2){ a.ot = [Math.round(t), ai, Math.round(t)]; ots.push(a.ot); }
      if (!zone) otKlaar(a);
      a.zone = zone;
      /* de batterij: laden in de bochten en onder de safety car, geven op de rechte stukken */
      let extra = 1;
      if (st < 0.5 || scNu) a.bat = Math.min(1, a.bat + dt * (scNu ? 0.02 : LAAD * (1 + 0.08 * (a.accu - 5))));
      else if (st > 0.7){
        const nodig = dt * (GEEF + (a.ot ? 0.016 : 0));
        if (a.bat >= nodig){ a.bat -= nodig; extra += 0.025 + (a.ot ? 0.03 : 0); } else otKlaar(a);
      }
      if (zone) extra += 0.02;   /* active aero: minder luchtweerstand */
      let v = prof.v[idx] * factor(a, idx) * band * a.ruis * extra * (geelHier ? 0.85 : 1) / L;
      if (scNu){
        const vSc = Math.min(prof.v[idx] * 0.6, 42) / L;
        if (!voor) v = vSc;
        else { const gat = voor.p - a.p; v = gat > 0.012 ? Math.min(v, vSc * 1.4) : Math.min(vSc, Math.max(0, (gat - 0.006) / dt)); }
      } else if (voor){
        const gat = voor.p - a.p, vVoor = voor.vNu || v;
        if (gat < 0.005 && v > vVoor){
          /* inhalen kan alleen op een recht stuk zonder gele vlag, en makkelijker op een baan met lange rechte stukken */
          const kans = prof.st[idx] > ZONE && !geelHier ? Math.max(0.01, Math.min(0.45, (0.03 + 0.02 * (a.inh - voor.inh)) * prof.inhaalKans * (a.ot ? 2.5 : 1))) : 0;
          if (r() >= kans) v = Math.min(v, Math.max(0, vVoor - (gat < 0.002 ? 0.00002 : 0)));
        }
      }
      a.vNu = v;
      a.p += v * dt;
      if (a.p >= RONDEN){ a.p = RONDEN; a.klaar = t + dt; otKlaar(a); noteer("finish", ai); }
      voorIdx = ai;
    });
    t += dt;
    if (t >= volgend){ if (beelden.length % AKKU === 0) accu.push(autos.map(a => Math.round(a.bat * 100))); beelden.push(autos.map(a => Math.round(a.p * 1000))); volgend += BEELD; }
  }
  beelden.push(autos.map(a => Math.round(a.p * 1000)));
  const klaar = autos.map((a, i) => i).filter(i => autos[i].klaar).sort((x, y) => autos[x].klaar - autos[y].klaar);
  const uit = autos.map((a, i) => i).filter(i => !autos[i].klaar).sort((x, y) => autos[y].p - autos[x].p);
  const volgorde = klaar.concat(uit);
  return {
    autos: autos.map(a => ({ team: a.team, nr: a.nr, start: a.strat.start })),
    grid, beelden, stap: BEELD, accu, accuStap: BEELD * AKKU, ot: ots, gebeurt, ronde: Math.round(RT * 10) / 10,
    uitslag: volgorde.map((ai, i) => ({ a: ai, team: autos[ai].team, nr: autos[ai].nr, plek: autos[ai].klaar ? i + 1 : 0, tijd: autos[ai].klaar ? Math.round(autos[ai].klaar * 10) / 10 : 0, uit: autos[ai].uit || "" }))
  };
}

/* ============================================================================
   HET TEAM
   ============================================================================ */
const START_C = () => ({ snel: 3, inhalen: 3, constant: 3 });
function nieuwTeam(id, naam, k1, k2){
  return { id, naam, k1, k2, munten: R.startMunten, hq: 1, motor: 1, aero: 1, accu: 1, betrouw: 1,
    c: [1, 2].map(n => Object.assign({ naam: T.naamVoor(id + ":" + n), helm: T.helm({ basis: n === 1 ? k1 : k2, streep: "#FBF6F1", accent: n === 1 ? k2 : k1, patroon: "midden" }), strat: T.STANDAARD[n - 1] }, START_C())),
    jobs: [], hist: "", dag: { d: "", m: 0 }, vraag: null, bezit: [], zeges: 0, div: 0, laatsteWeek: "", gemaakt: Date.now(), nieuws: [] };
}
function huidig(tm, wat){
  if (wat === "hq" || wat === "motor" || wat === "aero" || wat === "accu" || wat === "betrouw") return tm[wat] || 1;
  const m = /^c([12])\.(snel|inhalen|constant)$/.exec(wat);
  return m ? tm.c[+m[1] - 1][m[2]] : null;
}
function zetNiveau(tm, wat, n){
  if (wat === "hq" || wat === "motor" || wat === "aero" || wat === "accu" || wat === "betrouw"){ tm[wat] = n; return; }
  const m = /^c([12])\.(snel|inhalen|constant)$/.exec(wat);
  if (m) tm.c[+m[1] - 1][m[2]] = n;
}
function prijs(wat, naar){ return wat === "hq" ? R.hq(naar) : /^c[12]\./.test(wat) ? R.training(naar) : R.onderdeel(naar); }
/* wat in de race telt, voor de liga */
function snap(tm){
  return { id: tm.id, naam: tm.naam, k1: tm.k1, k2: tm.k2, motor: tm.motor, aero: tm.aero, accu: tm.accu || 1, betrouw: tm.betrouw,
    uitval: R.uitval(R.betrouw(tm.hist), tm.betrouw), gemiddeld: (tm.motor + tm.aero + tm.c[0].snel + tm.c[1].snel) / 4,
    c: tm.c.map(c => ({ naam: c.naam, snel: c.snel, inhalen: c.inhalen, constant: c.constant, helm: c.helm, strat: c.strat })) };
}

export class Teambaas extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.ctx = ctx; this.env = env; this.vragen = {};
  }
  liga(){ return this.env.TEAMBAAS.get(this.env.TEAMBAAS.idFromName("liga")); }
  async naarLiga(pad, body){
    const r = await this.liga().fetch("https://liga/liga/" + pad, { method: "POST", body: JSON.stringify(body || {}) });
    return r.json();
  }
  async fetch(req){
    const url = new URL(req.url), p = url.pathname;
    let o = {};
    if (req.method === "POST"){ try { o = await req.json(); } catch (e){ o = {}; } }
    if (p.startsWith("/liga/")) return this.ligaFetch(p.slice(5), o, url);
    return this.teamFetch(p, o, url);
  }

  /* ---------------- het team ---------------- */
  async laadTeam(){ if (this.tm === undefined) this.tm = (await this.ctx.storage.get("team")) || null; return this.tm; }
  async bewaarTeam(stuurLiga){
    await this.ctx.storage.put("team", this.tm);
    if (stuurLiga && this.tm.div) { try { await this.naarLiga("zet", snap(this.tm)); } catch (e){ console.warn("teambaas: liga niet bereikt", e && e.message); } }
  }
  /* klaar met bouwen? Dan is de upgrade binnen. */
  afronden(){
    const nu = Date.now(), tm = this.tm; let iets = false;
    tm.jobs = tm.jobs.filter(j => {
      if (j.eind > nu) return true;
      zetNiveau(tm, j.wat, j.naar); iets = true;
      tm.nieuws.unshift({ t: j.eind, s: "klaar", wat: j.wat, naar: j.naar });
      return false;
    });
    tm.nieuws = tm.nieuws.slice(0, 12);
    return iets;
  }
  async teamFetch(p, o, url){
    const tm = await this.laadTeam();
    if (p === "/lees"){
      if (!tm) return json({ nieuw: true });
      let veranderd = this.afronden();
      /* de munten van races die er sinds het vorige bezoek zijn gereden */
      if (tm.div){
        try {
          const u = await this.naarLiga("uitslag", { id: tm.id, sinds: tm.laatsteWeek });
          (u.lijst || []).forEach(x => {
            tm.munten += x.munten; tm.laatsteWeek = x.week; if (x.zege) tm.zeges++;
            tm.nieuws.unshift({ t: Date.now(), s: "race", week: x.week, plekken: x.plekken, punten: x.punten, munten: x.munten });
            veranderd = true;
          });
          if (u.div && u.div !== tm.div){ tm.div = u.div; veranderd = true; }
        } catch (e){ console.warn("teambaas: uitslag ophalen mislukt", e && e.message); }
      }
      if (veranderd) await this.bewaarTeam(true);
      let liga = null;
      try { liga = await this.naarLiga("stand", { div: tm.div, id: tm.id }); } catch (e){ liga = null; }
      return json({ team: this.publiek(), liga });
    }
    if (p === "/start"){
      if (tm) return json({ fout: "je hebt al een team" }, 409);
      /* zoals nette() in naamfilter.js, maar tot 24 tekens en zonder vervangnaam: een naam die niet door het filter komt, wordt geweigerd */
      const naam = String(o.naam || "").replace(/[\u0000-\u001f\u007f<>"'`]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
      if (naam.length < 2 || vies(naam)) return json({ fout: "kies een andere teamnaam" }, 400);
      const k1 = T.kleurOk(o.k1) ? o.k1 : "#F26749", k2 = T.kleurOk(o.k2) && o.k2 !== k1 ? o.k2 : (k1 === "#204ECF" ? "#F26749" : "#204ECF");
      this.tm = nieuwTeam(String(o.id || "").slice(0, 80), naam, k1, k2);
      const d = await this.naarLiga("inschrijven", snap(this.tm));
      this.tm.div = d.div || 1; this.tm.laatsteWeek = d.week || "";
      await this.bewaarTeam(true);
      return json({ team: this.publiek() });
    }
    if (!tm) return json({ fout: "je hebt nog geen team" }, 404);
    this.afronden();
    if (p === "/upgrade"){
      const wat = String(o.wat || ""), nu = huidig(tm, wat);
      if (nu === null || nu === undefined) return json({ fout: "onbekende upgrade" }, 400);
      if (tm.jobs.some(j => j.wat === wat)) return json({ fout: "daar wordt al aan gewerkt" }, 409);
      const naar = nu + 1;
      if (wat === "hq" ? naar > R.hqMax : naar > R.maxNiveau(tm.hq)) return json({ fout: wat === "hq" ? "je hoofdkwartier is al op het hoogste niveau" : "eerst je hoofdkwartier verbeteren" }, 409);
      if (tm.jobs.length >= R.werkplaatsen(tm.hq)) return json({ fout: "alle werkplaatsen zijn bezet" }, 409);
      const k = prijs(wat, naar);
      if (tm.munten < k.munten) return json({ fout: "niet genoeg munten" }, 409);
      tm.munten -= k.munten;
      tm.jobs.push({ id: willekeur(6), wat, naar, start: Date.now(), eind: Date.now() + k.tijd, duur: k.tijd });
      await this.bewaarTeam(false);
      return json({ team: this.publiek() });
    }
    if (p === "/vraag"){
      let vak = String(url.searchParams.get("vak") || "reken"), niv = Math.max(1, Math.min(4, parseInt(url.searchParams.get("niv"), 10) || 2));
      if (VRAAGVAKKEN.indexOf(vak) < 0) vak = "reken";
      if (!this.vragen[vak]) this.vragen[vak] = await laadVragen(this.env, url.searchParams.get("o") || "", vak);
      const alle = this.vragen[vak].filter(q => !q.vlag && (!q.svg || veiligSvg(q.svg)));
      let lijst = alle.filter(q => (q.n | 0) === niv);
      if (lijst.length < 20) lijst = alle.filter(q => (q.n | 0) <= niv);
      if (!lijst.length) lijst = alle;
      if (!lijst.length) return json({ fout: "er zijn even geen vragen" }, 503);
      const q = lijst[Math.floor(Math.random() * lijst.length)];
      const volgorde = q.o.map((x, i) => i);
      for (let i = volgorde.length - 1; i > 0; i--){ const k = Math.floor(Math.random() * (i + 1)), h = volgorde[i]; volgorde[i] = volgorde[k]; volgorde[k] = h; }
      tm.vraag = { token: willekeur(10), g: volgorde.indexOf(q.g), o: volgorde.map(i => q.o[i]), u: q.u || "", n: Math.max(1, Math.min(4, q.n | 0 || niv)), t: Date.now() };
      await this.bewaarTeam(false);
      const uit = { token: tm.vraag.token, v: q.v, o: tm.vraag.o, vak, n: tm.vraag.n, deel: (this.vragen[vak].delen || {})[q.t] || "" };
      if (q.svg) uit.svg = q.svg;
      return json(uit);
    }
    if (p === "/antwoord"){
      const v = tm.vraag;
      if (!v || o.token !== v.token) return json({ fout: "deze vraag is al beantwoord" }, 409);
      tm.vraag = null;
      const goed = (o.keuze | 0) === v.g;
      tm.hist = (tm.hist + (goed ? "1" : "0")).slice(-30);
      const vandaag = T.dagVan(Date.now());
      if (tm.dag.d !== vandaag) tm.dag = { d: vandaag, m: 0 };
      let munten = 0, sneller = 0;
      if (goed){
        munten = Math.max(0, Math.min(R.perGoed[v.n] || 10, R.dagMax - tm.dag.m));
        tm.munten += munten; tm.dag.m += munten;
        const job = tm.jobs.filter(j => j.id === o.job)[0] || tm.jobs.slice().sort((a, b) => a.eind - b.eind)[0];
        if (job){ const voor = job.eind; job.eind = Math.max(Date.now(), job.eind - R.versnel); sneller = voor - job.eind; }
      }
      this.afronden();
      await this.bewaarTeam(true);
      return json({ goed, juist: v.o[v.g], uitleg: v.u, munten, sneller, dagVol: tm.dag.m >= R.dagMax, team: this.publiek() });
    }
    if (p === "/strategie"){
      const nr = o.nr === 2 ? 1 : 0;
      tm.c[nr].strat = T.strategie(o.strat);
      await this.bewaarTeam(true);
      return json({ team: this.publiek() });
    }
    if (p === "/helm"){
      const nr = o.nr === 2 ? 1 : 0, h = T.helm(o.helm, tm.c[nr].helm.basis);
      let kosten = 0;
      const pat = T.PATRONEN.filter(x => x.id === h.patroon)[0], viz = T.VIZIEREN.filter(x => x.id === h.vizier)[0];
      if (pat.zege && !tm.zeges) return json({ fout: "de finishvlag krijg je bij je eerste overwinning" }, 409);
      const nieuw = [];
      if (pat.prijs && tm.bezit.indexOf("p:" + pat.id) < 0){ kosten += pat.prijs; nieuw.push("p:" + pat.id); }
      if (viz.prijs && tm.bezit.indexOf("v:" + viz.id) < 0){ kosten += viz.prijs; nieuw.push("v:" + viz.id); }
      if (tm.munten < kosten) return json({ fout: "niet genoeg munten" }, 409);
      tm.munten -= kosten; tm.bezit = tm.bezit.concat(nieuw);
      tm.c[nr].helm = h;
      await this.bewaarTeam(true);
      return json({ team: this.publiek(), kosten });
    }
    return json({ fout: "onbekend" }, 404);
  }
  publiek(){
    const tm = this.tm;
    return { naam: tm.naam, k1: tm.k1, k2: tm.k2, munten: tm.munten, hq: tm.hq, motor: tm.motor, aero: tm.aero, accu: tm.accu || 1, betrouw: tm.betrouw, c: tm.c,
      jobs: tm.jobs, betrouwbaarheid: R.betrouw(tm.hist), antwoorden: tm.hist.length, uitval: R.uitval(R.betrouw(tm.hist), tm.betrouw),
      dag: tm.dag.d === T.dagVan(Date.now()) ? tm.dag.m : 0, bezit: tm.bezit, zeges: tm.zeges, div: tm.div, nieuws: tm.nieuws.slice(0, 6), nu: Date.now() };
  }

  /* ---------------- de liga ---------------- */
  async laadLiga(){
    if (!this.lg){
      this.lg = (await this.ctx.storage.get("liga")) || { divs: {}, seizoen: 1, race: 0, weken: [] };
      if (!(await this.ctx.storage.getAlarm())) await this.ctx.storage.setAlarm(T.volgendeRace(Date.now()));
    }
    return this.lg;
  }
  async bewaarLiga(){ await this.ctx.storage.put("liga", this.lg); }
  /* teams die een divisie aanvullen tot tien: ongeveer zo sterk als de echte teams erin */
  async bots(div){
    const d = this.lg.divs[div], mensen = [];
    for (const id of d.teams){ const s = await this.ctx.storage.get("snap:" + id); if (s) mensen.push(s); }
    const gem = mensen.length ? mensen.reduce((a, s) => a + s.gemiddeld, 0) / mensen.length : 2;
    const uit = [], bezet = mensen.map(s => String(s.naam).toLowerCase());
    /* computerteams krijgen een heldere kleur (geen nachtblauw of zwart op de donkere baan) en nooit de naam van een echt team */
    const kleuren = T.KLEUREN.map(k => k[0]).filter(k => k !== "#14224C" && k !== "#1A1C24");
    const namen = T.BOTTEAMS.filter(n => bezet.indexOf(n.toLowerCase()) < 0);
    for (let i = 0; uit.length + mensen.length < R.perDivisie; i++){
      const id = "bot:" + div + ":" + i, rr = rng(hash(id + this.lg.seizoen)), lv = Math.max(1, Math.min(10, Math.round(gem + (rr() - 0.5) * 3)));
      const naam = namen[(div * 7 + i) % namen.length], kl = kleuren[(div * 5 + i * 3) % kleuren.length], kl2 = kleuren[(div * 5 + i * 3 + 4) % kleuren.length];
      uit.push({ id, naam, k1: kl, k2: kl2, bot: true, motor: lv, aero: Math.max(1, lv - 1 + Math.round(rr() * 2)), accu: lv, betrouw: lv, uitval: 0.05,
        c: [1, 2].map(n => ({ naam: T.naamVoor(id + ":" + n), snel: Math.max(1, Math.min(10, lv + Math.round((rr() - 0.5) * 2))), inhalen: lv, constant: lv, helm: T.helm({ basis: n === 1 ? kl : kl2, accent: n === 1 ? kl2 : kl }), strat: T.STANDAARD[(i + n) % 2] })) });
    }
    return { mensen, bots: uit };
  }
  async ligaFetch(p, o, url){
    const lg = await this.laadLiga();
    if (p === "/inschrijven"){
      const id = String(o.id || "");
      for (const k of Object.keys(lg.divs)) if (lg.divs[k].teams.indexOf(id) >= 0) return json({ div: +k, week: lg.weken[lg.weken.length - 1] || "" });
      /* de laagste divisie met plek, anders een nieuwe onderaan */
      const nrs = Object.keys(lg.divs).map(Number).sort((a, b) => b - a);
      let div = nrs.filter(n => lg.divs[n].teams.length < R.perDivisie)[0];
      if (!div){ div = (nrs[0] || 0) + 1; lg.divs[div] = { teams: [], punten: {} }; }
      lg.divs[div].teams.push(id); lg.divs[div].punten[id] = 0;
      await this.ctx.storage.put("snap:" + id, o);
      await this.bewaarLiga();
      return json({ div, week: lg.weken[lg.weken.length - 1] || "" });
    }
    if (p === "/zet"){
      if (!o || !o.id) return json({ ok: false }, 400);
      await this.ctx.storage.put("snap:" + o.id, o);
      return json({ ok: true });
    }
    if (p === "/stand"){
      const div = +o.div || 1, d = lg.divs[div];
      const nu = Date.now(), wk = T.baanVanWeek(nu);
      const uit = { div, divisies: Object.keys(lg.divs).length, seizoen: lg.seizoen, race: lg.race, races: R.seizoen, volgende: T.volgendeRace(nu), baan: wk.baan.id, herhaling: wk.herhaling, teams: [], laatste: null };
      if (d){
        const { mensen, bots } = await this.bots(div);
        mensen.forEach(s => uit.teams.push({ id: s.id === o.id ? "jij" : "", naam: s.naam, k1: s.k1, punten: d.punten[s.id] || 0 }));
        bots.forEach(b => uit.teams.push({ id: "", naam: b.naam, k1: b.k1, punten: (d.botPunten || {})[b.id] || 0, bot: true }));
        uit.teams.sort((a, b) => b.punten - a.punten);
        const laatst = lg.weken[lg.weken.length - 1];
        if (laatst) uit.laatste = { week: laatst, div };
      }
      return json(uit);
    }
    if (p === "/uitslag"){
      const id = String(o.id || ""), lijst = [];
      let mijnDiv = 0;
      for (const k of Object.keys(lg.divs)) if (lg.divs[k].teams.indexOf(id) >= 0) mijnDiv = +k;
      for (const w of lg.weken){
        if (o.sinds && w <= o.sinds) continue;
        const res = await this.ctx.storage.get("res:" + w);
        if (res && res[id]) lijst.push(Object.assign({ week: w }, res[id]));
      }
      return json({ lijst, div: mijnDiv });
    }
    if (p === "/race"){
      const r = await this.ctx.storage.get("race:" + url.searchParams.get("week") + ":" + (+url.searchParams.get("div") || 1));
      if (!r) return json({ fout: "deze race is er niet" }, 404);
      const eigen = r.ids.indexOf(url.searchParams.get("id") || "-");
      const uit = Object.assign({}, r, { eigen }); delete uit.ids;
      /* de sim kent de teams als id: vervang ze door hun plek in de lijst deelnemers */
      uit.sim = Object.assign({}, r.sim, { autos: r.sim.autos.map(a => ({ t: r.ids.indexOf(a.team), nr: a.nr, start: a.start })), uitslag: r.sim.uitslag.map(u => ({ a: u.a, t: r.ids.indexOf(u.team), nr: u.nr, plek: u.plek, tijd: u.tijd, uit: u.uit })) });
      return json(uit);
    }
    if (p === "/rijden"){ await this.rijden(Date.now(), true); return json({ ok: true, weken: lg.weken }); }
    return json({ fout: "onbekend" }, 404);
  }
  async alarm(){
    await this.laadLiga();
    try { await this.rijden(Date.now(), false); } catch (e){ console.error("teambaas: race mislukt", e && e.stack || e); }
    await this.ctx.storage.setAlarm(T.volgendeRace(Date.now() + 60000));
  }
  /* de race van deze week in elke divisie; daarna de stand, de munten en na het seizoen promotie en degradatie */
  async rijden(nu, test){
    const lg = this.lg, week = T.weekVan(nu - 3600000) + (test ? "-t" + (lg.weken.length + 1) : "");
    if (lg.weken.indexOf(week) >= 0) return;
    const wk = T.baanVanWeek(nu - 3600000), res = {};
    for (const k of Object.keys(lg.divs)){
      const div = +k, d = lg.divs[div];
      if (!d.teams.length) continue;
      const { mensen, bots } = await this.bots(div), deel = mensen.concat(bots);
      const uit = simuleer(deel, hash(week + ":" + div), wk.baan);
      const teams = {};
      uit.uitslag.forEach((u, i) => {
        const pt = u.plek && u.plek <= R.punten.length ? R.punten[u.plek - 1] : 0;
        const x = teams[u.team] || (teams[u.team] = { plekken: [0, 0], punten: 0, munten: 0, zege: false, div });
        x.plekken[u.nr - 1] = u.plek; x.punten += pt; x.munten += R.raceMunten(u.plek); if (u.plek === 1) x.zege = true;
      });
      Object.keys(teams).forEach(id => {
        if (/^bot:/.test(id)){ d.botPunten = d.botPunten || {}; d.botPunten[id] = (d.botPunten[id] || 0) + teams[id].punten; }
        else { d.punten[id] = (d.punten[id] || 0) + teams[id].punten; res[id] = teams[id]; }
      });
      await this.ctx.storage.put("race:" + week + ":" + div, {
        week, div, baan: wk.baan.id, herhaling: wk.herhaling, gereden: nu,
        deelnemers: deel.map(e => ({ naam: e.naam, k1: e.k1, k2: e.k2, bot: !!e.bot, c: e.c.map(c => ({ naam: c.naam, helm: c.helm })) })),
        /* de accounts achter de teams gaan nooit mee naar de pagina; alleen welk team van de vrager is */
        ids: deel.map(e => e.id), sim: uit
      });
    }
    await this.ctx.storage.put("res:" + week, res);
    lg.weken.push(week); if (lg.weken.length > 30){ const oud = lg.weken.shift(); await this.ctx.storage.delete("res:" + oud); }
    lg.race++;
    if (lg.race >= R.seizoen) this.seizoenKlaar();
    await this.bewaarLiga();
  }
  seizoenKlaar(){
    const lg = this.lg, nrs = Object.keys(lg.divs).map(Number).sort((a, b) => a - b);
    for (let i = 1; i < nrs.length; i++){
      const boven = lg.divs[nrs[i - 1]], onder = lg.divs[nrs[i]];
      const op = onder.teams.slice().sort((a, b) => (onder.punten[b] || 0) - (onder.punten[a] || 0)).slice(0, R.promotie);
      const neer = boven.teams.slice().sort((a, b) => (boven.punten[a] || 0) - (boven.punten[b] || 0)).slice(0, Math.min(R.promotie, op.length));
      boven.teams = boven.teams.filter(x => neer.indexOf(x) < 0).concat(op);
      onder.teams = onder.teams.filter(x => op.indexOf(x) < 0).concat(neer);
    }
    nrs.forEach(n => { const d = lg.divs[n]; d.punten = {}; d.teams.forEach(id => { d.punten[id] = 0; }); d.botPunten = {}; });
    lg.seizoen++; lg.race = 0;
  }
}

/* ============================================================================
   DE ROUTES. hulp: { id (het account of in een lokale test een testnaam), magDoor, lokaal, origin }
   ============================================================================ */
export async function behandel(req, env, url, hulp){
  const p = url.pathname.replace(/^\/api\/teambaas/, "") || "/";
  if (!hulp.id) return json({ fout: "log in om een raceteam te hebben", uit: true }, 401);
  const team = env.TEAMBAAS.get(env.TEAMBAAS.idFromName("t:" + hulp.id));
  const liga = env.TEAMBAAS.get(env.TEAMBAAS.idFromName("liga"));
  const post = (pad, body) => team.fetch("https://team" + pad, { method: "POST", body: JSON.stringify(body || {}) });
  let o = {};
  if (req.method === "POST"){ try { o = await req.json(); } catch (e){ return json({ fout: "geen geldige opdracht" }, 400); } }
  if ((p === "/" || p === "") && req.method === "GET") return team.fetch("https://team/lees");
  if (p === "/start" && req.method === "POST") return post("/start", { naam: o.naam, k1: o.k1, k2: o.k2, id: hulp.id });
  if (p === "/upgrade" && req.method === "POST") return post("/upgrade", { wat: o.wat });
  if (p === "/vraag" && req.method === "GET"){
    if (!await hulp.magDoor("tb-vraag", 3000, 600)) return json({ fout: "even wachten" }, 429);
    return team.fetch("https://team/vraag?vak=" + encodeURIComponent(url.searchParams.get("vak") || "") + "&niv=" + encodeURIComponent(url.searchParams.get("niv") || "") + "&o=" + encodeURIComponent(url.origin));
  }
  if (p === "/antwoord" && req.method === "POST") return post("/antwoord", { token: o.token, keuze: o.keuze, job: o.job });
  if (p === "/strategie" && req.method === "POST") return post("/strategie", { nr: o.nr, strat: o.strat });
  if (p === "/helm" && req.method === "POST") return post("/helm", { nr: o.nr, helm: o.helm });
  if (p === "/race" && req.method === "GET"){
    return liga.fetch("https://liga/liga/race?week=" + encodeURIComponent(url.searchParams.get("week") || "") + "&div=" + encodeURIComponent(url.searchParams.get("div") || "1") + "&id=" + encodeURIComponent(hulp.id));
  }
  if (p === "/test/race" && req.method === "POST"){
    if (!hulp.lokaal) return json({ fout: "onbekend" }, 404);
    return liga.fetch("https://liga/liga/rijden", { method: "POST", body: "{}" });
  }
  return json({ fout: "onbekend" }, 404);
}
