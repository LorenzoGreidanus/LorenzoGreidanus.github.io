/* ============================================================================
   CLUBBAAS: de voetbalmanager voor wie is ingelogd.

   Elke leerling met een account heeft een voetbalclub met een selectie van
   zestien spelers. Met munten (vooral uit goed beantwoorde vragen) train je het
   elftal, bouw je het stadion en het trainingscomplex uit en koop je spelers.
   Een training duurt even; elk goed antwoord maakt hem tien minuten korter.
   Elke woensdag om 16.00 en zaterdag om 14.00 speelt de server in elke divisie
   een speelronde. De leerling kijkt de wedstrijd daarna terug van boven.

   Een Durable Object-klasse, twee soorten objecten (idFromName):
     "c:<account>"  een club: munten, selectie, opstelling, training, vragen
     "liga"         de divisies, het schema, de stand, de speelrondes (alarm)
   De club stuurt de liga na elke wijziging een momentopname van wat in de
   wedstrijd telt; de liga speelt met die momentopnamen. Na een speelronde haalt
   de club bij het volgende bezoek zijn munten en de vermoeidheid op.

   Routes (index.js geeft alles onder /api/clubbaas hierheen, met het account):
     GET  /api/clubbaas                    de club, de divisie, de volgende wedstrijd
     POST /api/clubbaas/start              { naam, k1, k2, logo } een nieuwe club
     POST /api/clubbaas/upgrade            { wat } tr.snelheid ... tr.keepen, complex, stadion
     GET  /api/clubbaas/vraag?vak=&niv=    een vraag (de server kent het antwoord)
     POST /api/clubbaas/antwoord           { token, keuze, job }
     POST /api/clubbaas/opstelling         { formatie, basis, tactiek }
     POST /api/clubbaas/kleding            { k1, k2, patroon, logo }
     GET  /api/clubbaas/markt              de transfermarkt
     POST /api/clubbaas/koop               { id }
     POST /api/clubbaas/verkoop            { id }
     POST /api/clubbaas/bod                { ja }
     GET  /api/clubbaas/wedstrijd?dag=&div=&m=   een wedstrijd om terug te kijken
     POST /api/clubbaas/test/speel         alleen lokaal: speel nu een speelronde
   ============================================================================ */
import { DurableObject } from "cloudflare:workers";
import { vies } from "./naamfilter.js";
import { laadVragen, VRAAGVAKKEN } from "./stadvragen.js";
import { veiligSvg } from "./kamer.js";
import CLUBBAAS from "../leermiddelen/clubbaas-data.js";

const C = CLUBBAAS, R = C.REGELS;
function json(o, status){ return new Response(JSON.stringify(o), { status: status || 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }); }
function willekeur(n){ const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, b => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join(""); }
const klem = (x, a, b) => Math.max(a, Math.min(b, x));

/* ============================================================================
   DE WEDSTRIJD
   Negentig minuten. De sterkte van een elftal komt uit de spelers op hun plek
   (kwaliteit, fitheid, of ze op hun eigen positie staan), de training en de
   tactiek. Per minuut heeft een van de twee de bal (naar het middenveld en het
   druk zetten); soms wordt dat een aanval, soms een schot, soms een goal.
   Elk schot is een moment voor de herhaling: de weg van de bal over het veld,
   wie aangeeft en wie schiet. Na een uur wisselt de trainer wie moe is.
   ============================================================================ */
function opzet(c, tv){
  const pl = C.plekken(c.formatie), tr = c.tr || {}, tk = C.tactiek(c.tactiek);
  const b = k => 1 + 0.04 * ((tr[k] || 1) - 1);
  const elf = c.elf.map((s, i) => {
    const p = pl[i] || pl[pl.length - 1], fit = s.fitW == null ? 100 : s.fitW;
    const pf = s.pos === p.pos ? 1 : (p.pos === "KEE" || s.pos === "KEE") ? 0.5 : 0.8;
    return { id: s.id, naam: s.naam, pos: p.pos, eigen: s.pos, kw: s.kw, fit, eff: s.kw * (0.7 + 0.3 * fit / 100) * pf, x: p.x, y: p.y };
  });
  const z = { elf, tk, b, bank: (c.bank || []).map(s => Object.assign({}, s)), tv };
  herreken(z);
  return z;
}
function herreken(z){
  const { elf, tk, b, tv } = z;
  const lijn = pos => { const l = elf.filter(s => s.pos === pos); return l.length ? l.reduce((a, s) => a + s.eff, 0) / l.length : 40; };
  const n = pos => elf.filter(s => s.pos === pos).length;
  const drukF = { laag: 0.92, midden: 1, hoog: 1.12 }[tk.druk];
  const stijlAan = { verdedigend: 0.8, gebalanceerd: 1, aanvallend: 1.22 }[tk.stijl];
  const stijlVer = { verdedigend: 1.2, gebalanceerd: 1, aanvallend: 0.85 }[tk.stijl];
  const A = lijn("AAN") * (0.85 + 0.06 * n("AAN")), M = lijn("MID") * (0.8 + 0.05 * n("MID")), D = lijn("VER") * (0.8 + 0.05 * n("VER"));
  const S = (lijn("AAN") + lijn("MID")) / 2 * b("snelheid");
  z.K = lijn("KEE") * b("keepen");
  z.controle = M * b("passen") * drukF * (1 + tv);
  z.aanval = (tk.via === "midden" ? A * 0.5 + M * 0.5 * b("passen") : tk.via === "vleugels" ? A * 0.5 + S * 0.5 : A * 0.75 * b("schieten") + M * 0.25) * stijlAan * (1 + tv);
  z.verdedig = D * b("verdedigen") * stijlVer * (1 + tv * 0.5);
}
function kiesGewogen(r, lijst, gewicht){
  const w = lijst.map(gewicht), som = w.reduce((a, x) => a + x, 0);
  let x = r() * som;
  for (let i = 0; i < lijst.length; i++){ x -= w[i]; if (x <= 0) return i; }
  return lijst.length - 1;
}
export function speelWedstrijd(A, B, zaad, thuisVoordeel){
  const r = C.rng(zaad), kant = [opzet(A, thuisVoordeel || 0), opzet(B, 0)];
  const score = [0, 0], schoten = [0, 0], opDoel = [0, 0], bezit = [0, 0], momenten = [];
  const gespeeld = [{}, {}];
  kant.forEach((z, k) => z.elf.forEach(s => { gespeeld[k][s.id] = 1; }));
  const spiegel = (k, x, y) => k ? [Math.round(100 - x), Math.round(100 - y)] : [Math.round(x), Math.round(y)];
  for (let m = 1; m <= 90; m++){
    /* na een uur: de twee moeiste spelers eruit, als er een wissel op dezelfde plek is */
    if (m === 62) kant.forEach((z, k) => {
      const moe = z.elf.map((s, i) => [s, i]).filter(x => x[0].pos !== "KEE" && x[0].fit < 75).sort((a, b2) => a[0].fit - b2[0].fit).slice(0, 2);
      moe.forEach(([s, i]) => {
        const bi = z.bank.findIndex(x => x.pos === s.pos);
        if (bi < 0) return;
        const nieuw = z.bank.splice(bi, 1)[0], fit = nieuw.fitW == null ? 100 : nieuw.fitW;
        z.elf[i] = { id: nieuw.id, naam: nieuw.naam, pos: s.pos, eigen: nieuw.pos, kw: nieuw.kw, fit, eff: nieuw.kw * (0.7 + 0.3 * fit / 100), x: s.x, y: s.y };
        gespeeld[k][nieuw.id] = 0.5;
        momenten.push({ m, s: "wissel", k, sp: i, uit: s.naam, in: nieuw.naam });
      });
      herreken(z);
    });
    const p0 = kant[0].controle / (kant[0].controle + kant[1].controle);
    const k = r() < p0 ? 0 : 1, a = kant[k], d = kant[1 - k];
    bezit[k]++;
    if (r() >= 0.5) continue;
    const q = a.aanval / (a.aanval + d.verdedig);
    if (r() >= 0.12 + 0.6 * q) continue;
    /* een schot: wie schiet en wie geeft aan */
    const veld = a.elf.map((s, i) => i).filter(i => a.elf[i].pos !== "KEE");
    const si = veld[kiesGewogen(r, veld, i => ({ AAN: 3, MID: 1.4, VER: 0.35 })[a.elf[i].pos] * a.elf[i].eff)];
    const rest = veld.filter(i => i !== si && a.elf[i].pos !== "VER");
    const ai = rest.length ? rest[kiesGewogen(r, rest, i => a.elf[i].eff)] : -1;
    const kans = klem(0.14 * Math.pow(a.elf[si].eff * a.b("schieten") / Math.max(30, d.K), 1.4), 0.04, 0.38);
    const x = r(), s = x < kans ? "goal" : r() < 0.45 ? "redding" : "naast";
    schoten[k]++; if (s !== "naast") opDoel[k]++; if (s === "goal") score[k]++;
    /* de weg van de bal, gezien vanuit de aanvallende ploeg (die speelt naar x = 100) */
    const via = a.tk.via, kant2 = r() < 0.5 ? 1 : -1, pad = [];
    if (via === "vleugels"){ pad.push([38 + r() * 10, 50 + kant2 * (20 + r() * 10)], [72 + r() * 8, 50 + kant2 * (38 + r() * 4)]); }
    else if (via === "lang"){ pad.push([18 + r() * 8, 40 + r() * 20], [74 + r() * 6, 38 + r() * 24]); }
    else { pad.push([40 + r() * 8, 42 + r() * 16], [62 + r() * 6, 40 + r() * 20]); }
    const sx = 80 + r() * 9, sy = 36 + r() * 28;
    pad.push([sx, sy]);
    if (s === "goal") pad.push([100, 45 + r() * 10]);
    else if (s === "redding") pad.push([95, 46 + r() * 8]);
    else pad.push([100, r() < 0.5 ? 30 + r() * 8 : 62 + r() * 8]);
    momenten.push({ m, s, k, sp: si, as: ai, pad: pad.map(p => spiegel(k, p[0], p[1])), stand: score.slice() });
  }
  const tot = bezit[0] + bezit[1] || 1;
  return {
    score, schoten, opDoel, bezit: [Math.round(bezit[0] / tot * 100), 100 - Math.round(bezit[0] / tot * 100)], momenten,
    formatie: [A.formatie, B.formatie],
    elf: [A, B].map(c => c.elf.map((s, i) => ({ naam: s.naam, pos: (C.plekken(c.formatie)[i] || {}).pos || s.pos }))),
    invallers: kant.map(z => Object.keys(gespeeld[kant.indexOf(z)]).length - 11),
    gespeeld
  };
}

/* ============================================================================
   DE CLUB
   ============================================================================ */
function nieuweClub(id, naam, k1, k2, logo){
  const spelers = C.startSelectie(id + ":start", 56);
  return { id, naam, k1, k2, patroon: "strepen", logo: C.logoOk(logo), munten: R.startMunten, complex: 1, stadion: 1,
    tr: { snelheid: 1, schieten: 1, passen: 1, verdedigen: 1, keepen: 1 }, spelers, formatie: "4-3-3", basis: C.besteElf(spelers, "4-3-3", Date.now()),
    tactiek: C.tactiek({}), jobs: [], hist: "", dag: { d: "", m: 0 }, vraag: null, div: 0, laatste: "", gemaakt: Date.now(), nieuws: [],
    gekocht: [], seizoen: 1, bod: null, zeges: 0 };
}
/* klopt de opstelling nog (na een verkoop bijvoorbeeld)? Anders de beste elf. */
function zorgElf(tm){
  const ids = tm.spelers.map(s => s.id), b = tm.basis || [];
  const ok = b.length === 11 && b.every(x => ids.indexOf(x) >= 0) && new Set(b).size === 11;
  if (!ok) tm.basis = C.besteElf(tm.spelers, tm.formatie, Date.now());
}
function huidig(tm, wat){
  if (wat === "complex" || wat === "stadion") return tm[wat] || 1;
  const m = /^tr\.(snelheid|schieten|passen|verdedigen|keepen)$/.exec(wat);
  return m ? tm.tr[m[1]] || 1 : null;
}
function zetNiveau(tm, wat, n){
  if (wat === "complex" || wat === "stadion"){ tm[wat] = n; return; }
  const m = /^tr\.(\w+)$/.exec(wat); if (m) tm.tr[m[1]] = n;
}
function prijs(wat, naar){ return wat === "complex" ? R.complex(naar) : wat === "stadion" ? R.stadion(naar) : R.training(naar); }
const isBouw = wat => wat === "complex" || wat === "stadion";
/* wat in de wedstrijd telt, voor de liga */
function snap(tm){
  zorgElf(tm);
  const per = {}; tm.spelers.forEach(s => { per[s.id] = s; });
  const elf = tm.basis.map(id => per[id]);
  const bank = tm.spelers.filter(s => tm.basis.indexOf(s.id) < 0).sort((a, b) => b.kw - a.kw).slice(0, 6);
  const kort = s => ({ id: s.id, naam: s.naam, pos: s.pos, kw: s.kw, fit: s.fit, fitT: s.fitT });
  return { id: tm.id, naam: tm.naam, k1: tm.k1, k2: tm.k2, patroon: tm.patroon, logo: tm.logo, stadion: tm.stadion, tr: tm.tr, formatie: tm.formatie, tactiek: tm.tactiek,
    elf: elf.map(kort), bank: bank.map(kort), kw: elf.reduce((a, s) => a + s.kw, 0) / 11,
    trGem: Object.keys(tm.tr).reduce((a, k) => a + tm.tr[k], 0) / 5 };
}
/* de transfermarkt van een club in een seizoen: altijd dezelfde lijst, minus wat al gekocht is */
function markt(tm){
  const r = C.rng(C.hash(tm.id + ":markt:" + tm.seizoen)), gem = tm.spelers.reduce((a, s) => a + s.kw, 0) / Math.max(1, tm.spelers.length);
  const uit = [], soorten = ["KEE", "VER", "VER", "VER", "MID", "MID", "MID", "AAN", "AAN", "AAN", "MID", "VER", "AAN", "KEE"];
  soorten.forEach((pos, i) => {
    const kw = klem(Math.round(gem - 4 + r() * 18), 45, 85), sp = C.speler(tm.id + ":m:" + tm.seizoen + ":" + i, pos, kw);
    sp.prijs = C.waarde(sp.kw); sp.club = r() < 0.3 ? "" : C.BOTCLUBS[Math.floor(r() * C.BOTCLUBS.length)];
    if (tm.gekocht.indexOf(sp.id) < 0 && !tm.spelers.some(s => s.id === sp.id)) uit.push(sp);
  });
  return uit;
}

export class Clubbaas extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.ctx = ctx; this.env = env; this.vragen = {};
  }
  liga(){ return this.env.CLUBBAAS.get(this.env.CLUBBAAS.idFromName("liga")); }
  async naarLiga(pad, body){
    const r = await this.liga().fetch("https://liga/liga/" + pad, { method: "POST", body: JSON.stringify(body || {}) });
    return r.json();
  }
  async fetch(req){
    const url = new URL(req.url), p = url.pathname;
    let o = {};
    if (req.method === "POST"){ try { o = await req.json(); } catch (e){ o = {}; } }
    if (p.startsWith("/liga/")) return this.ligaFetch(p.slice(5), o, url);
    return this.clubFetch(p, o, url);
  }

  /* ---------------- de club ---------------- */
  async laadClub(){ if (this.tm === undefined) this.tm = (await this.ctx.storage.get("club")) || null; return this.tm; }
  async bewaarClub(stuurLiga){
    await this.ctx.storage.put("club", this.tm);
    if (stuurLiga && this.tm.div){ try { await this.naarLiga("zet", snap(this.tm)); } catch (e){ console.warn("clubbaas: liga niet bereikt", e && e.message); } }
  }
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
  async clubFetch(p, o, url){
    const tm = await this.laadClub();
    if (p === "/lees"){
      if (!tm) return json({ nieuw: true });
      let veranderd = this.afronden();
      if (tm.div){
        try {
          const u = await this.naarLiga("uitslag", { id: tm.id, sinds: tm.laatste });
          (u.lijst || []).forEach(x => {
            tm.munten += x.munten; tm.laatste = x.dag; if (x.u === "w") tm.zeges++;
            /* wie speelde, is moe; herstel telt vanaf de wedstrijd */
            tm.spelers.forEach(s => { const f = x.moe[s.id]; if (f){ s.fit = Math.max(0, C.fitNu(s, x.t) - f); s.fitT = x.t; } });
            tm.nieuws.unshift({ t: x.t, s: "wedstrijd", dag: x.dag, div: x.div, m: x.m, tegen: x.tegen, thuis: x.thuis, voor: x.voor, tegenGoals: x.tegenGoals, u: x.u, munten: x.munten, goals: x.goals || [] });
            /* in de transferperiode biedt soms een computerclub op een van je spelers */
            if (u.open && !tm.bod && Math.random() < 0.35){
              const kan = tm.spelers.filter(s => s.pos !== "KEE");
              const s = kan[Math.floor(Math.random() * kan.length)];
              if (s) tm.bod = { id: s.id, naam: s.naam, club: C.BOTCLUBS[Math.floor(Math.random() * C.BOTCLUBS.length)], prijs: Math.round(C.waarde(s.kw) * (1.1 + Math.random() * 0.3) / 10) * 10 };
            }
            veranderd = true;
          });
          if (u.div && u.div !== tm.div){ tm.div = u.div; veranderd = true; }
          if (u.seizoen && u.seizoen !== tm.seizoen){ tm.seizoen = u.seizoen; tm.gekocht = []; veranderd = true; }
          if (!u.open && tm.bod){ tm.bod = null; veranderd = true; }
        } catch (e){ console.warn("clubbaas: uitslag ophalen mislukt", e && e.message); }
      }
      if (veranderd) await this.bewaarClub(true);
      let liga = null;
      try { liga = await this.naarLiga("stand", { div: tm.div, id: tm.id }); } catch (e){ liga = null; }
      return json({ club: this.publiek(), liga });
    }
    if (p === "/start"){
      if (tm) return json({ fout: "je hebt al een club" }, 409);
      const naam = String(o.naam || "").replace(/[\u0000-\u001f\u007f<>"'`]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
      if (naam.length < 2 || vies(naam)) return json({ fout: "kies een andere clubnaam" }, 400);
      const k1 = C.kleurOk(o.k1) ? o.k1 : "#F26749", k2 = C.kleurOk(o.k2) && o.k2 !== k1 ? o.k2 : (k1 === "#FBF6F1" ? "#204ECF" : "#FBF6F1");
      this.tm = nieuweClub(String(o.id || "").slice(0, 80), naam, k1, k2, o.logo);
      const d = await this.naarLiga("inschrijven", snap(this.tm));
      this.tm.div = d.div || 1; this.tm.laatste = d.dag || ""; this.tm.seizoen = d.seizoen || 1;
      await this.bewaarClub(true);
      return json({ club: this.publiek() });
    }
    if (!tm) return json({ fout: "je hebt nog geen club" }, 404);
    this.afronden();
    if (p === "/upgrade"){
      const wat = String(o.wat || ""), nu = huidig(tm, wat);
      if (nu === null || nu === undefined) return json({ fout: "onbekende upgrade" }, 400);
      if (tm.jobs.some(j => j.wat === wat)) return json({ fout: "daar wordt al aan gewerkt" }, 409);
      const naar = nu + 1, bouw = isBouw(wat);
      const max = wat === "complex" ? R.complexMax : wat === "stadion" ? R.stadionMax : R.maxTraining(tm.complex);
      if (naar > max) return json({ fout: bouw ? "dit is al het hoogste niveau" : "eerst je trainingscomplex uitbouwen" }, 409);
      if (bouw && tm.jobs.some(j => isBouw(j.wat))) return json({ fout: "er wordt al gebouwd" }, 409);
      if (!bouw && tm.jobs.filter(j => !isBouw(j.wat)).length >= R.trainingen(tm.complex)) return json({ fout: "alle trainingsvelden zijn bezet" }, 409);
      const k = prijs(wat, naar);
      if (tm.munten < k.munten) return json({ fout: "niet genoeg munten" }, 409);
      tm.munten -= k.munten;
      tm.jobs.push({ id: willekeur(6), wat, naar, start: Date.now(), eind: Date.now() + k.tijd, duur: k.tijd });
      await this.bewaarClub(false);
      return json({ club: this.publiek() });
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
      await this.bewaarClub(false);
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
      const vandaag = C.dagVan(Date.now());
      if (tm.dag.d !== vandaag) tm.dag = { d: vandaag, m: 0 };
      let munten = 0, sneller = 0;
      if (goed){
        munten = Math.max(0, Math.min(R.perGoed[v.n] || 10, R.dagMax - tm.dag.m));
        tm.munten += munten; tm.dag.m += munten;
        const job = tm.jobs.filter(j => j.id === o.job)[0] || tm.jobs.slice().sort((a, b) => a.eind - b.eind)[0];
        if (job){ const voor = job.eind; job.eind = Math.max(Date.now(), job.eind - R.versnel); sneller = voor - job.eind; }
      }
      this.afronden();
      await this.bewaarClub(true);
      return json({ goed, juist: v.o[v.g], uitleg: v.u, munten, sneller, dagVol: tm.dag.m >= R.dagMax, club: this.publiek() });
    }
    if (p === "/opstelling"){
      const formatie = C.FORMATIES[o.formatie] ? o.formatie : tm.formatie;
      const ids = tm.spelers.map(s => s.id), b = Array.isArray(o.basis) ? o.basis.map(String).slice(0, 11) : [];
      tm.formatie = formatie;
      tm.basis = b.length === 11 && b.every(x => ids.indexOf(x) >= 0) && new Set(b).size === 11 ? b : C.besteElf(tm.spelers, formatie, Date.now());
      tm.tactiek = C.tactiek(o.tactiek || tm.tactiek);
      await this.bewaarClub(true);
      return json({ club: this.publiek() });
    }
    if (p === "/kleding"){
      if (C.kleurOk(o.k1)) tm.k1 = o.k1;
      if (C.kleurOk(o.k2) && o.k2 !== tm.k1) tm.k2 = o.k2;
      if (C.PATRONEN.some(x => x[0] === o.patroon)) tm.patroon = o.patroon;
      if (o.logo) tm.logo = C.logoOk(o.logo);
      await this.bewaarClub(true);
      return json({ club: this.publiek() });
    }
    if (p === "/markt") return json({ spelers: markt(tm) });
    if (p === "/koop" || p === "/verkoop" || p === "/bod"){
      const v = await this.naarLiga("venster", {});
      if (!v.open) return json({ fout: "de transfermarkt is dicht tot het volgende seizoen" }, 409);
      if (v.seizoen !== tm.seizoen){ tm.seizoen = v.seizoen; tm.gekocht = []; }
      if (p === "/koop"){
        const sp = markt(tm).filter(x => x.id === String(o.id || ""))[0];
        if (!sp) return json({ fout: "deze speler is er niet meer" }, 404);
        if (tm.spelers.length >= R.selectieMax) return json({ fout: "je selectie is vol: verkoop eerst iemand" }, 409);
        if (tm.munten < sp.prijs) return json({ fout: "niet genoeg munten" }, 409);
        tm.munten -= sp.prijs; tm.gekocht.push(sp.id);
        tm.spelers.push({ id: sp.id, naam: sp.naam, pos: sp.pos, kw: sp.kw, fit: 100, fitT: Date.now() });
        tm.nieuws.unshift({ t: Date.now(), s: "koop", naam: sp.naam, prijs: sp.prijs });
      } else {
        const id = p === "/bod" ? (tm.bod && tm.bod.id) : String(o.id || "");
        if (p === "/bod" && !o.ja){ tm.bod = null; await this.bewaarClub(false); return json({ club: this.publiek() }); }
        const sp = tm.spelers.filter(s => s.id === id)[0];
        if (!sp) return json({ fout: "deze speler zit niet in je selectie" }, 404);
        if (tm.spelers.length <= R.selectieMin) return json({ fout: "je hebt minstens " + R.selectieMin + " spelers nodig" }, 409);
        if (sp.pos === "KEE" && tm.spelers.filter(s => s.pos === "KEE").length <= 1) return json({ fout: "je hebt een keeper nodig" }, 409);
        const opbrengst = p === "/bod" ? tm.bod.prijs : Math.round(C.waarde(sp.kw) * R.verkoop / 10) * 10;
        tm.munten += opbrengst; tm.spelers = tm.spelers.filter(s => s.id !== id);
        if (tm.bod && tm.bod.id === id) tm.bod = null;
        tm.nieuws.unshift({ t: Date.now(), s: "verkoop", naam: sp.naam, prijs: opbrengst });
        zorgElf(tm);
      }
      tm.nieuws = tm.nieuws.slice(0, 12);
      await this.bewaarClub(true);
      return json({ club: this.publiek() });
    }
    return json({ fout: "onbekend" }, 404);
  }
  publiek(){
    const tm = this.tm, nu = Date.now();
    zorgElf(tm);
    const goed = (tm.hist.match(/1/g) || []).length;
    return { naam: tm.naam, k1: tm.k1, k2: tm.k2, patroon: tm.patroon, logo: tm.logo, munten: tm.munten, complex: tm.complex, stadion: tm.stadion, tr: tm.tr,
      spelers: tm.spelers.map(s => ({ id: s.id, naam: s.naam, pos: s.pos, kw: s.kw, fit: C.fitNu(s, nu), waarde: C.waarde(s.kw) })),
      formatie: tm.formatie, basis: tm.basis, tactiek: tm.tactiek, jobs: tm.jobs, div: tm.div, seizoen: tm.seizoen, bod: tm.bod, zeges: tm.zeges,
      dag: tm.dag.d === C.dagVan(nu) ? tm.dag.m : 0, antwoorden: tm.hist.length, goed, nieuws: tm.nieuws.slice(0, 6), nu };
  }

  /* ---------------- de liga ---------------- */
  async laadLiga(){
    if (!this.lg){
      this.lg = (await this.ctx.storage.get("liga")) || { divs: {}, seizoen: 1, ronde: 0, dagen: [] };
      if (!(await this.ctx.storage.getAlarm())) await this.ctx.storage.setAlarm(C.volgendeWedstrijd(Date.now()));
    }
    return this.lg;
  }
  async bewaarLiga(){ await this.ctx.storage.put("liga", this.lg); }
  /* de acht clubs van een divisie, op hun plek in het schema: eerst de echte clubs, dan computerclubs */
  async deelnemers(div){
    const d = this.lg.divs[div], mensen = [];
    for (const id of d.clubs){ const s = await this.ctx.storage.get("snap:" + id); if (s) mensen.push(s); }
    const gem = mensen.length ? mensen.reduce((a, s) => a + s.kw, 0) / mensen.length : 56;
    const trGem = mensen.length ? mensen.reduce((a, s) => a + (s.trGem || 1), 0) / mensen.length : 1;
    const bezet = mensen.map(s => String(s.naam).toLowerCase()), namen = C.BOTCLUBS.filter(n => bezet.indexOf(n.toLowerCase()) < 0);
    const kleuren = C.KLEUREN.map(k => k[0]).filter(k => k !== "#14224C" && k !== "#1A1C24"), logos = Object.keys(C.LOGOS), forms = Object.keys(C.FORMATIES);
    const uit = mensen.slice();
    for (let i = mensen.length; i < R.perDivisie; i++){
      const id = "bot:" + div + ":" + i, zaad = id + ":" + this.lg.seizoen, rr = C.rng(C.hash(zaad));
      const spelers = C.startSelectie(zaad, gem - 2 + (rr() - 0.5) * 8).map(s => Object.assign(s, { fit: 95, fitT: 0 }));
      const formatie = forms[Math.floor(rr() * forms.length)], basis = C.besteElf(spelers, formatie, 0), per = {};
      spelers.forEach(s => { per[s.id] = s; });
      const lv = Math.max(1, Math.min(10, Math.round(trGem + (rr() - 0.5) * 2)));
      const k1 = kleuren[(div * 5 + i * 3) % kleuren.length];
      /* opeenvolgende namen uit de lijst, zodat geen twee computerclubs hetzelfde heten */
      uit.push({ id, bot: true, naam: namen[(div * 7 + this.lg.seizoen * 5 + i) % namen.length], k1, k2: k1 === "#FBF6F1" ? "#204ECF" : "#FBF6F1", patroon: C.PATRONEN[i % 4][0], logo: logos[(div + i) % logos.length],
        stadion: 1 + Math.floor(rr() * 3), tr: { snelheid: lv, schieten: lv, passen: lv, verdedigen: lv, keepen: lv }, formatie,
        tactiek: { stijl: ["verdedigend", "gebalanceerd", "aanvallend"][Math.floor(rr() * 3)], druk: "midden", via: ["midden", "vleugels", "lang"][Math.floor(rr() * 3)] },
        elf: basis.map(x => per[x]), bank: spelers.filter(s => basis.indexOf(s.id) < 0) });
    }
    return uit;
  }
  stand0(){ return { p: 0, w: 0, g: 0, v: 0, dv: 0, dt: 0 }; }
  async ligaFetch(p, o, url){
    const lg = await this.laadLiga();
    if (p === "/inschrijven"){
      const id = String(o.id || "");
      for (const k of Object.keys(lg.divs)) if (lg.divs[k].clubs.indexOf(id) >= 0) return json({ div: +k, dag: lg.dagen[lg.dagen.length - 1] || "", seizoen: lg.seizoen });
      const nrs = Object.keys(lg.divs).map(Number).sort((a, b) => b - a);
      let div = nrs.filter(n => lg.divs[n].clubs.length < R.perDivisie)[0];
      if (!div){ div = (nrs[0] || 0) + 1; lg.divs[div] = { clubs: [], st: {}, botSt: {} }; }
      /* wie midden in het seizoen instapt, neemt de plek van een computerclub over, met nul punten */
      const plek = lg.divs[div].clubs.length;
      lg.divs[div].clubs.push(id); lg.divs[div].st[id] = this.stand0();
      delete (lg.divs[div].botSt || {})["bot:" + div + ":" + plek];
      await this.ctx.storage.put("snap:" + id, o);
      await this.bewaarLiga();
      return json({ div, dag: lg.dagen[lg.dagen.length - 1] || "", seizoen: lg.seizoen });
    }
    if (p === "/zet"){
      if (!o || !o.id) return json({ ok: false }, 400);
      await this.ctx.storage.put("snap:" + o.id, o);
      return json({ ok: true });
    }
    if (p === "/venster") return json({ open: lg.ronde < R.transferTot, seizoen: lg.seizoen });
    if (p === "/stand"){
      const div = +o.div || 1, d = lg.divs[div], nu = Date.now();
      const uit = { div, divisies: Object.keys(lg.divs).length, seizoen: lg.seizoen, ronde: lg.ronde, rondes: R.rondes, volgende: C.volgendeWedstrijd(nu), open: lg.ronde < R.transferTot, clubs: [], tegen: null, laatste: null };
      if (d){
        const deel = await this.deelnemers(div), mijn = deel.findIndex(x => x.id === o.id);
        deel.forEach((x, i) => {
          const s = (x.bot ? (d.botSt || {})[x.id] : d.st[x.id]) || this.stand0();
          uit.clubs.push(Object.assign({ jij: i === mijn, naam: x.naam, k1: x.k1, k2: x.k2, logo: x.logo, bot: !!x.bot }, s));
        });
        uit.clubs.sort((a, b) => b.p - a.p || (b.dv - b.dt) - (a.dv - a.dt) || b.dv - a.dv);
        /* de volgende twee tegenstanders */
        const sch = C.schema(R.perDivisie), tegen = r => {
          if (r >= R.rondes || mijn < 0) return null;
          const paar = sch[r].filter(x => x.indexOf(mijn) >= 0)[0], t = deel[paar[0] === mijn ? paar[1] : paar[0]];
          return { naam: t.naam, k1: t.k1, k2: t.k2, logo: t.logo, thuis: paar[0] === mijn, ronde: r + 1 };
        };
        uit.tegen = tegen(lg.ronde); uit.daarna = tegen(lg.ronde + 1);
        const laatst = lg.dagen[lg.dagen.length - 1];
        if (laatst) uit.laatste = await this.ctx.storage.get("uit:" + laatst + ":" + div) || null;
      }
      return json(uit);
    }
    if (p === "/uitslag"){
      const id = String(o.id || ""), lijst = [];
      let mijnDiv = 0;
      for (const k of Object.keys(lg.divs)) if (lg.divs[k].clubs.indexOf(id) >= 0) mijnDiv = +k;
      for (const w of lg.dagen){
        if (o.sinds && w <= o.sinds) continue;
        const res = await this.ctx.storage.get("res:" + w);
        if (res && res[id]) lijst.push(Object.assign({ dag: w }, res[id]));
      }
      return json({ lijst, div: mijnDiv, seizoen: lg.seizoen, open: lg.ronde < R.transferTot });
    }
    if (p === "/wedstrijd"){
      const w = await this.ctx.storage.get("wed:" + url.searchParams.get("dag") + ":" + (+url.searchParams.get("div") || 1) + ":" + (+url.searchParams.get("m") || 0));
      if (!w) return json({ fout: "deze wedstrijd is er niet" }, 404);
      const uit = Object.assign({}, w, { eigen: w.ids.indexOf(url.searchParams.get("id") || "-") });
      delete uit.ids; uit.sim = Object.assign({}, w.sim); delete uit.sim.gespeeld;
      return json(uit);
    }
    if (p === "/speel"){ await this.spelen(Date.now(), true); return json({ ok: true, dagen: lg.dagen, ronde: lg.ronde }); }
    return json({ fout: "onbekend" }, 404);
  }
  async alarm(){
    await this.laadLiga();
    try { await this.spelen(Date.now(), false); } catch (e){ console.error("clubbaas: speelronde mislukt", e && e.stack || e); }
    await this.ctx.storage.setAlarm(C.volgendeWedstrijd(Date.now() + 60000));
  }
  /* een speelronde in elke divisie; daarna de stand, de munten en na het seizoen promotie en degradatie */
  async spelen(nu, test){
    const lg = this.lg, dag = C.dagVan(nu - 3600000) + (test ? "-t" + (lg.dagen.length + 1) : "");
    if (lg.dagen.indexOf(dag) >= 0) return;
    const paren = C.schema(R.perDivisie)[lg.ronde % R.rondes], res = {};
    for (const k of Object.keys(lg.divs)){
      const div = +k, d = lg.divs[div];
      if (!d.clubs.length) continue;
      const deel = await this.deelnemers(div), overzicht = [];
      /* fitheid op het moment van de wedstrijd */
      deel.forEach(c => (c.elf || []).concat(c.bank || []).forEach(s => { s.fitW = c.bot ? 95 : C.fitNu(s, nu); }));
      for (let mi = 0; mi < paren.length; mi++){
        const [a, b] = paren[mi], A = deel[a], B = deel[b];
        const sim = speelWedstrijd(A, B, C.hash(dag + ":" + div + ":" + mi), R.thuisVoordeel(A.stadion || 1));
        const kop = c => ({ naam: c.naam, k1: c.k1, k2: c.k2, patroon: c.patroon, logo: c.logo, bot: !!c.bot, stadion: c.stadion || 1 });
        await this.ctx.storage.put("wed:" + dag + ":" + div + ":" + mi, { dag, div, ronde: lg.ronde + 1, gespeeld: nu, thuis: kop(A), uit: kop(B), ids: [A.id, B.id], sim });
        overzicht.push({ m: mi, t: A.naam, u: B.naam, tk: A.k1, uk: B.k1, s: sim.score });
        [A, B].forEach((c, z) => {
          const voor = sim.score[z], tegen = sim.score[1 - z], u = voor > tegen ? "w" : voor === tegen ? "g" : "v";
          const st = c.bot ? ((d.botSt = d.botSt || {})[c.id] = (d.botSt || {})[c.id] || this.stand0()) : (d.st[c.id] = d.st[c.id] || this.stand0());
          st.p += u === "w" ? 3 : u === "g" ? 1 : 0; st[u]++; st.dv += voor; st.dt += tegen;
          if (c.bot) return;
          const moe = {}, kost = R.moe[C.tactiek(c.tactiek).druk];
          Object.keys(sim.gespeeld[z]).forEach(id => { moe[id] = Math.round(kost * sim.gespeeld[z][id]); });
          const goals = sim.momenten.filter(x => x.s === "goal" && x.k === z).map(x => x.m);
          res[c.id] = { div, m: mi, ronde: lg.ronde + 1, thuis: z === 0, tegen: (z ? A : B).naam, voor, tegenGoals: tegen, u,
            munten: R.wedstrijdMunten(u, voor, z === 0, c.stadion || 1), t: nu, moe, goals };
        });
      }
      await this.ctx.storage.put("uit:" + dag + ":" + div, { dag, div, ronde: lg.ronde + 1, wedstrijden: overzicht });
    }
    await this.ctx.storage.put("res:" + dag, res);
    lg.dagen.push(dag);
    if (lg.dagen.length > 40){ const oud = lg.dagen.shift(); await this.ctx.storage.delete("res:" + oud); }
    lg.ronde++;
    if (lg.ronde >= R.rondes) this.seizoenKlaar();
    await this.bewaarLiga();
  }
  seizoenKlaar(){
    const lg = this.lg, nrs = Object.keys(lg.divs).map(Number).sort((a, b) => a - b);
    const punten = (d, id) => { const s = d.st[id] || this.stand0(); return s.p * 1000 + (s.dv - s.dt) * 10 + s.dv; };
    for (let i = 1; i < nrs.length; i++){
      const boven = lg.divs[nrs[i - 1]], onder = lg.divs[nrs[i]];
      const op = onder.clubs.slice().sort((a, b) => punten(onder, b) - punten(onder, a)).slice(0, R.promotie);
      const neer = boven.clubs.slice().sort((a, b) => punten(boven, a) - punten(boven, b)).slice(0, Math.min(R.promotie, op.length));
      boven.clubs = boven.clubs.filter(x => neer.indexOf(x) < 0).concat(op);
      onder.clubs = onder.clubs.filter(x => op.indexOf(x) < 0).concat(neer);
    }
    nrs.forEach(n => { const d = lg.divs[n]; d.st = {}; d.clubs.forEach(id => { d.st[id] = this.stand0(); }); d.botSt = {}; });
    lg.seizoen++; lg.ronde = 0;
  }
}

/* ============================================================================
   DE ROUTES. hulp: { id (het account of in een lokale test een testnaam), magDoor, lokaal }
   ============================================================================ */
export async function behandel(req, env, url, hulp){
  const p = url.pathname.replace(/^\/api\/clubbaas/, "") || "/";
  if (!hulp.id) return json({ fout: "log in om een club te hebben", uit: true }, 401);
  const club = env.CLUBBAAS.get(env.CLUBBAAS.idFromName("c:" + hulp.id));
  const liga = env.CLUBBAAS.get(env.CLUBBAAS.idFromName("liga"));
  const post = (pad, body) => club.fetch("https://club" + pad, { method: "POST", body: JSON.stringify(body || {}) });
  let o = {};
  if (req.method === "POST"){ try { o = await req.json(); } catch (e){ return json({ fout: "geen geldige opdracht" }, 400); } }
  if ((p === "/" || p === "") && req.method === "GET") return club.fetch("https://club/lees");
  if (p === "/start" && req.method === "POST") return post("/start", { naam: o.naam, k1: o.k1, k2: o.k2, logo: o.logo, id: hulp.id });
  if (p === "/upgrade" && req.method === "POST") return post("/upgrade", { wat: o.wat });
  if (p === "/vraag" && req.method === "GET"){
    if (!await hulp.magDoor("cb-vraag", 3000, 600)) return json({ fout: "even wachten" }, 429);
    return club.fetch("https://club/vraag?vak=" + encodeURIComponent(url.searchParams.get("vak") || "") + "&niv=" + encodeURIComponent(url.searchParams.get("niv") || "") + "&o=" + encodeURIComponent(url.origin));
  }
  if (p === "/antwoord" && req.method === "POST") return post("/antwoord", { token: o.token, keuze: o.keuze, job: o.job });
  if (p === "/opstelling" && req.method === "POST") return post("/opstelling", { formatie: o.formatie, basis: o.basis, tactiek: o.tactiek });
  if (p === "/kleding" && req.method === "POST") return post("/kleding", { k1: o.k1, k2: o.k2, patroon: o.patroon, logo: o.logo });
  if (p === "/markt" && req.method === "GET") return club.fetch("https://club/markt");
  if (p === "/koop" && req.method === "POST") return post("/koop", { id: o.id });
  if (p === "/verkoop" && req.method === "POST") return post("/verkoop", { id: o.id });
  if (p === "/bod" && req.method === "POST") return post("/bod", { ja: !!o.ja });
  if (p === "/wedstrijd" && req.method === "GET"){
    return liga.fetch("https://liga/liga/wedstrijd?dag=" + encodeURIComponent(url.searchParams.get("dag") || "") + "&div=" + encodeURIComponent(url.searchParams.get("div") || "1") + "&m=" + encodeURIComponent(url.searchParams.get("m") || "0") + "&id=" + encodeURIComponent(hulp.id));
  }
  if (p === "/test/speel" && req.method === "POST"){
    if (!hulp.lokaal) return json({ fout: "onbekend" }, 404);
    return liga.fetch("https://liga/liga/speel", { method: "POST", body: "{}" });
  }
  return json({ fout: "onbekend" }, 404);
}
