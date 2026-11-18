/* Grand Prix: een race van boven gezien in de Klasstrijd (game "prix").

   Elke leerling is een raceteam. De auto rijdt zelf; goede antwoorden maken
   hem sneller. De kamer is de baas, net als bij Dijkbouwers: hij kiest de
   vragen, kijkt na, en rekent zelf uit waar elke auto is. De pagina's laten
   alleen zien wat de kamer zegt.

   Het verloop:
   - kwalificatie: acht bochten, acht vragen. De tijd loopt; een fout kost
     KWAL_STRAF erbij. De snelste start vooraan.
   - de race: over de teamradio komt steeds een vraag. Goed geeft even extra
     vaart; fout kost geen plek maar slijt de banden. Zijn de banden op, dan
     rijdt de auto langzaam: tijd voor de pits. Daar zet elk goed antwoord een
     wiel vast, vier wielen in totaal.
   - de banden zijn de moeilijkheid: zacht geeft moeilijkere vragen, meer vaart
     en snelle slijtage; hard geeft makkelijkere vragen en gaat lang mee.
   - halverwege een klasvraag voor iedereen: het veld schuift bij elkaar.

   Waar een auto is, staat als afstand in rondes (px.d) met het moment waarop
   dat gold (px.t). Elke PRIX_TIK rekent de kamer iedereen door en stuurt de
   stand; daartussen rekent de pagina zelf verder met de snelheid die meekwam.

   De speelwijze hoort bij de baan (zie leermiddelen/prix-banen.js, dezelfde
   namen): tempo (korte denktijd, weinig slijtage), gewoon, precies (is het
   antwoord een getal, dan typ je het zelf; een fout is wijd door de bocht) en herhaal (een fout komt terug). */

export const PRIX_BANEN = {
  polder: { modus: "tempo", ronde: 28 }, vliegveld: { modus: "tempo", ronde: 30 }, dijk: { modus: "tempo", ronde: 32 },
  duinen: { modus: "gewoon", ronde: 38 }, bos: { modus: "gewoon", ronde: 40 }, heuvel: { modus: "gewoon", ronde: 42 },
  haven: { modus: "precies", ronde: 46 }, gracht: { modus: "precies", ronde: 46 }, kasteel: { modus: "precies", ronde: 50 },
  acht: { modus: "herhaal", ronde: 36 }, klaver: { modus: "herhaal", ronde: 40 }, brug: { modus: "herhaal", ronde: 38 }
};
export const PRIX_RONDES = [5, 8, 10, 12];
const MODI = {
  tempo: { denk: 1000, slijt: 0.6 },
  gewoon: { denk: 1500, slijt: 1 },
  precies: { denk: 1500, slijt: 1, open: true, wijd: 3000 },
  herhaal: { denk: 1500, slijt: 1, terug: true }
};
/* v: hoeveel sneller; slijt: procent per ronde; nivo: hoeveel moeilijker de vragen; bonus: hoe lang de extra vaart duurt */
const BAND = {
  zacht: { v: 1.06, slijt: 32, nivo: 1, bonus: 1.3 },
  medium: { v: 1, slijt: 22, nivo: 0, bonus: 1 },
  hard: { v: 0.95, slijt: 15, nivo: -1, bonus: 0.75 }
};
const PRIX_TIK = 2000, LEES = 2500, KWAL_N = 8, KWAL_STRAF = 3000, KWAL_MAX = 300000, AFTEL = 6000;
const BOOST = 1.25, BOOST_MS = 4000, TRAAG = 0.75, FOUT_SLIJT = 5, OP = 0.62, WIELEN = 4;
const PIT_HULP = 2, KV_MS = 22000, KV_BOOST_MS = 6000, NA_EERSTE = 120000, PER_VRAAG = 120, FOUTEN_MAX = 8;

/* twee antwoorden vergelijken bij een open vraag: hoofdletters, spaties, een punt aan het eind
   en een lidwoord vooraan doen er niet toe; getallen vergelijken we als getal (3,5 is 3.5) */
function kaal(t){
  return String(t == null ? "" : t).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[€%°]/g, " ").replace(/[.!?]+$/, "").replace(/\s+/g, " ").trim().replace(/^(de|het|een|the|a|an) /, "");
}
function alsGetal(t){
  const s = kaal(t).replace(/\s/g, "");
  if (!/^-?\d{1,3}(\.\d{3})*(,\d+)?$/.test(s) && !/^-?\d+([.,]\d+)?$/.test(s)) return null;
  /* 1.250 is twaalfhonderdvijftig (een punt met precies drie cijfers erna); 1.5 is anderhalf */
  const duizend = /^-?\d{1,3}(\.\d{3})+$/.test(s);
  const n = Number(/,/.test(s) || duizend ? s.replace(/\./g, "").replace(",", ".") : s);
  return Number.isFinite(n) ? n : null;
}
/* Zelf typen kan alleen als het goede antwoord een getal is, met hoogstens een eenheid erbij
   (225 gram, € 60, 40%). Bij woorden zijn er te veel goede schrijfwijzen: die blijven meerkeuze.
   Geeft { voor, na } (wat er voor en na het getal staat, voor naast het invulvak), of null. */
const GETAL = /-?\d[\d.]*(?:,\d+)?/;
export function openDeel(goed){
  const m = /^(€ ?)?(-?\d[\d.]*(?:,\d+)?) ?([a-zA-Z%°²³\/]{0,8})$/.exec(String(goed == null ? "" : goed).trim());
  return m && alsGetal(m[2]) !== null ? { voor: m[1] ? "€" : "", na: m[3] || "" } : null;
}
/* het getal telt; de eenheid staat er al naast en hoeft de leerling niet te typen */
export function prixGelijk(a, b){
  const ma = GETAL.exec(String(a == null ? "" : a).replace(/\s/g, "")), mb = GETAL.exec(String(b == null ? "" : b).replace(/\s/g, ""));
  const x = ma ? alsGetal(ma[0]) : null, y = mb ? alsGetal(mb[0]) : null;
  if (x !== null && y !== null) return Math.abs(x - y) < 1e-9;
  return !!kaal(a) && kaal(a) === kaal(b);
}

export function prixMethoden(H){
  const { dijkGeschikt, dijkStapel, noodSom, R } = H;
  return {
    prixBaan(){ return PRIX_BANEN[this.stand.baan] || PRIX_BANEN.duinen; },
    prixModus(){ return MODI[this.prixBaan().modus] || MODI.gewoon; },
    /* het startschot van de docent: de kwalificatie begint */
    async prixBegin(){
      const st = this.stand, nu = Date.now();
      st.prix = { baan: PRIX_BANEN[st.baan] ? st.baan : "duinen", rondes: st.rondes || 8, fase2: "kwal", kwalStart: nu, raceStart: 0, kv: null, kvGehad: false, per: {}, binnen: 0, eerste: 0, nr: 0, pit: null };
      await this.zetAlarm({ wat: "prixtik" }, PRIX_TIK);
    },
    prixNieuw(sp){
      const P = this.stand.prix;
      sp.px = { nr: P.nr++, kw: { i: 0, goed: 0, straf: 0, t0: 0, tijd: 0 }, d: 0, t: 0, slijt: 100, band: "medium", volg: "medium", pit: null, pits: 0, pitMs: 0,
                fouten: [], boost: 0, traag: 0, klaar: 0, rang: 0, goed: 0, n: 0 };
      sp.rit = { uit: [], gehad: [], vraag: null, laatste: null, k: 0, reeks: 0, beste: 0 };
      sp.ronde = 0; sp.gehaald = 0; sp.punten = 0;
    },
    /* een speler begint of komt terug */
    async prixHerstel(sid){
      const st = this.stand;
      if (!this.prix || !st.spelers[sid] || st.fase !== "bezig" || !st.prix) return;
      const b = await this.raceBereid();
      const sp = this.stand && this.stand.spelers[sid], P = this.stand && this.stand.prix;
      if (!sp || !this.prix || this.stand.fase !== "bezig" || !P) return;
      const nu = Date.now();
      if (!sp.px){
        this.prixNieuw(sp);
        /* later binnen dan het startschot van de race: achteraan aansluiten */
        if (P.fase2 === "race"){
          let laagste = 0;
          Object.keys(st.spelers).forEach(s => { const x = st.spelers[s].px; if (x && x !== sp.px && x.t) laagste = Math.min(laagste, x.d); });
          sp.px.d = laagste - 0.03; sp.px.t = Math.max(nu, P.raceStart);
        }
      }
      const px = sp.px;
      if (P.fase2 === "kwal" && px.kw.tijd){ this.naarSpeler(sid, { t: "kwklaar", tijd: px.kw.tijd, goed: px.kw.goed }); return; }
      if (px.klaar){ if (px.rang) this.naarSpeler(sid, { t: "finish", rang: px.rang, tijd: px.klaar }); return; }
      if (!sp.rit.vraag){ this.prixVraag(sid, b, Math.max(nu, P.fase2 === "race" ? P.raceStart : 0)); await this.bewaar(); }
      if (P.fase2 === "race") this.naarSpeler(sid, { t: "race", start: P.raceStart, nu });
      if (sp.rit.laatste) this.naarSpeler(sid, sp.rit.laatste);
      if (P.kv) this.naarSpeler(sid, this.prixKvBericht(nu));
      this.prixZendVraag(sid);
    },
    /* de volgende vraag van een speler */
    prixVraag(sid, b, sinds){
      const st = this.stand, P = st.prix, sp = st.spelers[sid], rit = sp.rit, px = sp.px, M = this.prixModus();
      const kwal = P.fase2 === "kwal", band = kwal ? "medium" : px.pit ? px.volg : px.band;
      let q = null, terug = false;
      if (M.terug && !kwal && px.fouten.length && Math.random() < 0.5){
        const f = px.fouten[0];
        q = { v: f.v, o: [f.goed].concat(f.fout), g: 0, u: f.u, k: f.kop, t: "" }; terug = true;
      }
      this.prixPot = this.prixPot || {};
      const sleutel = sid + "|" + band;
      let pot = this.prixPot[sleutel];
      for (let poging = 0; poging < 40 && !q; poging++){
        if (!pot || !pot.length) pot = this.prixPot[sleutel] = dijkStapel(Object.assign({}, b, { r: Math.max(1, Math.min(4, b.r + BAND[band].nivo)) }));
        if (!pot.length) break;
        const x = pot.pop();
        q = x.s === "j" ? R.jaarVraag(b.jaren, x.i, b.r, b.tvNamen) : b.bron[x.i];
        if (!dijkGeschikt(q)){ q = null; continue; }
        if (rit.gehad.indexOf(q.v) >= 0 && pot.length > 3) q = null;
      }
      if (!q) q = noodSom(b.r);
      const goed = String(q.o[q.g]).trim(), gezien = [goed.toLowerCase()], fout = [];
      R.schud(q.o.map((o, j) => j)).forEach(j => {
        if (j === q.g) return;
        const t = String(q.o[j] == null ? "" : q.o[j]).trim();
        if (!t || t.length > 140 || gezien.indexOf(t.toLowerCase()) >= 0) return;
        gezien.push(t.toLowerCase()); fout.push(t);
      });
      const opties = R.schud([goed].concat(fout.slice(0, 3)));
      const naam = terug ? (q.k || "nog een keer") : q.t === "jaartallen" ? "jaartallen" : b.vak === "eigen" ? (b.delen[q.t] || "eigen vragen") : (q.k || b.delen[q.t] || q.t || "vraag");
      rit.vraag = { k: rit.k, v: String(q.v).slice(0, 320), o: opties, g: opties.indexOf(goed), kop: String(naam).replace(/^tijdvak \d+ /, "tijdvak ").slice(0, 60), sinds,
                    u: String(q.u || "").slice(0, 400), open: (M.open && openDeel(goed)) || undefined, terug, soort: kwal ? "kwal" : px.pit ? "pit" : "radio" };
      if (!terug){ rit.gehad.push(q.v); if (rit.gehad.length > 30) rit.gehad.shift(); }
    },
    prixZendVraag(sid){
      const sp = this.stand.spelers[sid], v = sp && sp.rit && sp.rit.vraag, px = sp && sp.px;
      if (!v || !px) return;
      this.naarSpeler(sid, { t: "vraag", k: v.k, v: v.v, o: v.open ? undefined : v.o, open: v.open || undefined, kop: v.kop, soort: v.soort, terug: v.terug || undefined,
                             bocht: v.soort === "kwal" ? px.kw.i + 1 : undefined, wiel: v.soort === "pit" && px.pit ? px.pit.wiel + 1 : undefined, sinds: v.sinds });
    },
    /* hoe hard een auto nu rijdt, in rondes per seconde */
    prixSnelheid(px, nu){
      const P = this.stand.prix;
      if (!px || px.klaar || px.pit || P.kv || P.fase2 !== "race" || nu < P.raceStart) return 0;
      let f = (OP + (1 - OP) * px.slijt / 100) * BAND[px.band].v;
      if (nu < px.boost) f *= BOOST;
      if (nu < px.traag) f *= TRAAG;
      return f / this.prixBaan().ronde;
    },
    /* een auto doorrekenen tot nu */
    prixStap(sp, nu){
      const P = this.stand.prix, px = sp.px;
      if (!px || px.klaar || P.fase2 !== "race") return;
      if (!px.t) px.t = Math.max(nu, P.raceStart);
      if (nu <= px.t) return;
      const v = this.prixSnelheid(px, px.t + 1), dt = (nu - px.t) / 1000, dd = v * dt;
      px.t = nu;
      if (!dd) return;
      px.d += dd;
      px.slijt = Math.max(0, px.slijt - BAND[px.band].slijt * this.prixModus().slijt * dd);
      if (px.d >= P.rondes){
        /* over de streep: de tijd terugrekenen naar het moment dat hij er echt was */
        const over = (px.d - P.rondes) / v * 1000;
        px.klaar = Math.max(1, Math.round(nu - over - P.raceStart)); px.d = P.rondes;
        if (!P.eerste) P.eerste = nu;
        sp.af = true; sp.tijd = px.klaar; sp.rit.vraag = null;
      }
    },
    /* een rij van de stand: wat het bord en de anderen van een auto zien */
    prixRij(sp, nu){
      const px = sp.px, P = this.stand.prix;
      if (!px || !P) return undefined;
      return { nr: px.nr, d: Math.round(px.d * 10000) / 10000, v: Math.round(this.prixSnelheid(px, nu) * 1e6) / 1e6, oud: px.t ? Math.max(0, nu - px.t) : 0, slijt: Math.round(px.slijt), band: px.band,
               pit: px.pit ? px.pit.wiel : -1, klaar: px.klaar || 0, kwI: px.kw.i, kwTijd: px.kw.tijd || 0, kwStraf: px.kw.straf, goed: px.goed, n: px.n, pits: px.pits, boost: nu < px.boost };
    },
    prixVolgorde(a, b){
      const x = a.px || {}, y = b.px || {}, P = this.stand.prix;
      if (P && P.fase2 === "kwal") return (x.kwTijd ? 0 : 1) - (y.kwTijd ? 0 : 1) || (x.kwTijd - y.kwTijd) || (y.kwI - x.kwI) || (x.kwStraf - y.kwStraf) || a.naam.localeCompare(b.naam);
      return (x.klaar ? 0 : 1) - (y.klaar ? 0 : 1) || (x.klaar - y.klaar) || (y.d + (y.v || 0) * (y.oud || 0) / 1000) - (x.d + (x.v || 0) * (x.oud || 0) / 1000) || a.naam.localeCompare(b.naam);
    },
    prixStand(){
      const st = this.stand, P = st.prix;
      if (!this.prix || !P) return undefined;
      return { baan: P.baan, rondes: P.rondes, fase2: P.fase2, nu: Date.now(), raceStart: P.raceStart || 0, kwalStart: P.kwalStart, kv: !!P.kv, pit: P.pit || undefined };
    },
    /* de race begint: de startopstelling uit de kwalificatie, dan aftellen */
    async prixRaceStart(){
      const st = this.stand, P = st.prix;
      if (!this.prix || !P || P.fase2 !== "kwal" || st.fase !== "bezig") return;
      const b = await this.raceBereid();
      if (!this.stand || this.stand.prix !== P || P.fase2 !== "kwal") return;
      const nu = Date.now();
      Object.keys(st.spelers).forEach(sid => { if (!st.spelers[sid].px) this.prixNieuw(st.spelers[sid]); });
      const volg = Object.keys(st.spelers).sort((s1, s2) => {
        const x = st.spelers[s1].px.kw, y = st.spelers[s2].px.kw;
        return (x.tijd ? 0 : 1) - (y.tijd ? 0 : 1) || (x.tijd - y.tijd) || (y.i - x.i) || (x.straf - y.straf);
      });
      P.fase2 = "race"; P.raceStart = nu + AFTEL;
      volg.forEach((sid, i) => {
        const sp = st.spelers[sid], px = sp.px;
        px.d = -0.012 * i; px.t = P.raceStart; px.slijt = 100; sp.rit.vraag = null; sp.rit.laatste = null;
        this.prixVraag(sid, b, P.raceStart);
      });
      Object.keys(this.prixWacht || {}).forEach(k => clearTimeout(this.prixWacht[k])); this.prixWacht = {};
      await this.bewaar();
      this.iedereen({ t: "race", start: P.raceStart, nu, grid: volg.map(sid => ({ sid: this.pid(sid), naam: st.spelers[sid].naam, tijd: st.spelers[sid].px.kw.tijd || 0 })) });
      volg.forEach(sid => this.prixZendVraag(sid));
      this.stuurStand();
    },
    /* elke twee tellen: iedereen doorrekenen, de klasvraag en de finish bewaken, de stand sturen */
    async prixTik(){
      const st = this.stand, P = st.prix, nu = Date.now();
      if (!this.prix || st.fase !== "bezig" || !P) return;
      const mee = Object.keys(st.spelers).filter(s => !st.spelers[s].weg);
      if (P.fase2 === "kwal"){
        const klaar = mee.length > 0 && mee.every(s => st.spelers[s].px && st.spelers[s].px.kw.tijd);
        if (klaar || nu - P.kwalStart > KWAL_MAX){ await this.zetAlarm({ wat: "prixtik" }, PRIX_TIK); return this.prixRaceStart(); }
      } else if (P.kv){
        if (nu >= P.kv.tot) await this.prixKvKlaar(nu);
      } else if (nu >= P.raceStart){
        mee.forEach(s => this.prixStap(st.spelers[s], nu));
        /* wie er nu binnen is: de plek op tijd, niet op de volgorde van doorrekenen */
        mee.filter(s => st.spelers[s].px && st.spelers[s].px.klaar && !st.spelers[s].px.rang).sort((a, b) => st.spelers[a].px.klaar - st.spelers[b].px.klaar)
          .forEach(s => { const px = st.spelers[s].px; px.rang = ++P.binnen; this.naarSpeler(s, { t: "finish", rang: px.rang, tijd: px.klaar }); });
        const rijders = mee.filter(s => st.spelers[s].px);
        if (rijders.length && rijders.every(s => st.spelers[s].px.klaar)) return this.strijdKlaar();
        if ((P.eerste && nu - P.eerste > NA_EERSTE) || nu - P.raceStart > P.rondes * this.prixBaan().ronde * 2500 + 60000) return this.strijdKlaar();
        const kop = rijders.reduce((m, s) => Math.max(m, st.spelers[s].px.d), 0);
        if (!P.kvGehad && rijders.length >= 2 && kop >= P.rondes / 2) await this.prixKvStart(nu);
      }
      await this.zetAlarm({ wat: "prixtik" }, PRIX_TIK);
      await this.bewaar();
      this.stuurStand();
    },
    /* de klasvraag: een vraag voor iedereen, de auto's staan stil */
    prixKvBericht(nu){
      const k = this.stand.prix.kv;
      return k ? { t: "klasvraag", v: k.v, o: k.o, kop: k.kop, tot: k.tot, nu } : null;
    },
    async prixKvStart(nu){
      const st = this.stand, P = st.prix, b = await this.raceBereid();
      if (!this.stand || this.stand.prix !== P || P.kv || P.kvGehad) return;
      let q = null;
      const pot = dijkStapel(b);
      for (let i = 0; i < 30 && pot.length && !q; i++){ const x = pot.pop(); const c = x.s === "j" ? R.jaarVraag(b.jaren, x.i, b.r, b.tvNamen) : b.bron[x.i]; if (dijkGeschikt(c) && c.o.filter(Boolean).length >= 3) q = c; }
      if (!q) q = noodSom(b.r);
      const goed = String(q.o[q.g]).trim(), ander = R.schud(q.o.filter((o, j) => j !== q.g && String(o == null ? "" : o).trim()).map(o => String(o).trim()).filter((t, i, l) => t.toLowerCase() !== goed.toLowerCase() && l.indexOf(t) === i)).slice(0, 3);
      const opties = R.schud([goed].concat(ander));
      P.kvGehad = true;
      P.kv = { v: String(q.v).slice(0, 320), o: opties, g: opties.indexOf(goed), u: String(q.u || "").slice(0, 400), kop: String(q.k || b.delen[q.t] || "klasvraag").slice(0, 60), tot: nu + KV_MS, antw: {} };
      Object.keys(this.prixWacht || {}).forEach(k => clearTimeout(this.prixWacht[k])); this.prixWacht = {};
      this.iedereen(this.prixKvBericht(nu));
    },
    async prixKvKlaar(nu){
      const st = this.stand, P = st.prix, k = P.kv;
      if (!k) return;
      const b = await this.raceBereid();
      if (!this.stand || this.stand.prix !== P || P.kv !== k) return;
      const rijders = Object.keys(st.spelers).filter(s => st.spelers[s].px && !st.spelers[s].weg);
      const kop = rijders.reduce((m, s) => Math.max(m, st.spelers[s].px.d), 0);
      let goed = 0, gedaan = 0;
      rijders.forEach(sid => {
        const sp = st.spelers[sid], px = sp.px, a = k.antw[sid];
        if (a !== undefined) gedaan++;
        if (!px.klaar){
          /* het veld schuift bij elkaar: de helft van het gat naar de koploper verdwijnt */
          px.d = kop - (kop - px.d) * 0.5; px.t = nu;
          if (a === k.g) px.boost = nu + KV_BOOST_MS;
          /* de eigen vraag begint opnieuw te tellen */
          if (sp.rit.vraag) sp.rit.vraag.sinds = nu; else if (!px.klaar) this.prixVraag(sid, b, nu);
        }
        if (a === k.g) goed++;
      });
      P.kv = null;
      this.iedereen({ t: "klasuit", g: k.g, juist: k.o[k.g], u: k.u, goed, gedaan, van: rijders.length });
      rijders.forEach(sid => { if (!st.spelers[sid].px.klaar) this.prixZendVraag(sid); });
    },
    /* een bericht van een speler */
    async prixBericht(sid, sp, m){
      const st = this.stand, P = st.prix;
      if (!this.prix || st.fase !== "bezig" || !P) return;
      if (!sp.px || !sp.rit){ await this.prixHerstel(sid); return; }
      const px = sp.px, rit = sp.rit, nu = Date.now();
      /* het antwoord op de klasvraag: één keer */
      if (m.t === "kv"){
        const a = Number(m.b);
        if (P.kv && P.kv.antw[sid] === undefined && a >= 0 && a < P.kv.o.length && a === Math.floor(a)){ P.kv.antw[sid] = a; this.naarSpeler(sid, { t: "kvbinnen" }); }
        return;
      }
      /* welke banden bij de volgende stop */
      if (m.t === "band"){ if (BAND[m.band]){ px.volg = m.band; this.naarSpeler(sid, { t: "band", volg: px.volg }); } return; }
      /* naar de pits */
      if (m.t === "pit"){
        if (P.fase2 !== "race" || P.kv || px.pit || px.klaar || nu < P.raceStart) return;
        const b0 = await this.raceBereid();
        if (!this.stand || this.stand.spelers[sid] !== sp || px.pit || px.klaar) return;
        if (BAND[m.band]) px.volg = m.band;
        const nu0 = Date.now();
        this.prixStap(sp, nu0);
        if (px.klaar) return;
        clearTimeout((this.prixWacht || {})[sid]); if (this.prixWacht) delete this.prixWacht[sid];
        px.pit = { wiel: 0, sinds: nu0 }; px.boost = 0; px.traag = 0;
        rit.k++; rit.vraag = null; this.prixVraag(sid, b0, nu0);
        await this.bewaar();
        this.naarSpeler(sid, { t: "pit", wiel: 0, band: px.volg });
        this.prixZendVraag(sid);
        this.planStand();
        return;
      }
      if (m.t !== "antwoord" || P.kv) return;
      const b = await this.raceBereid();
      if (!this.stand || this.stand.prix !== P || st.fase !== "bezig" || P.kv) return;
      this.prixWacht = this.prixWacht || {};
      const k = Number(m.k), v = rit.vraag;
      if (rit.laatste && k === rit.laatste.k && (!v || v.k !== k)){ this.naarSpeler(sid, rit.laatste); return; }
      if (!v || k !== v.k || this.prixWacht[sid]) return;
      let goed;
      if (v.open){
        const tekst = String(m.tekst == null ? "" : m.tekst).slice(0, 80);
        if (!tekst.trim()) return;
        goed = prixGelijk(tekst, v.o[v.g]);
      } else {
        const keuze = Number(m.b);
        if (!(keuze >= 0 && keuze < v.o.length) || keuze !== Math.floor(keuze)) return;
        goed = keuze === v.g;
      }
      /* niet sneller dan de denktijd, en na een fout eerst de leestijd */
      const nu1 = Date.now(), vroeg = v.sinds + this.prixModus().denk + (rit.uit[v.k - 1] === false ? LEES : 0) - nu1;
      if (vroeg > 0){
        this.prixWacht[sid] = setTimeout(() => {
          delete this.prixWacht[sid];
          const sp2 = this.stand && this.stand.spelers[sid];
          if (sp2) this.prixBericht(sid, sp2, m).catch(e => console.error("prixantwoord", e && e.stack || e));
        }, Math.ceil(vroeg));
        return;
      }
      rit.uit[v.k] = goed; rit.k = v.k + 1; sp.ronde = rit.k; sp.laatst = nu1;
      px.n++; if (goed){ px.goed++; sp.gehaald = px.goed; rit.reeks++; rit.beste = Math.max(rit.beste, rit.reeks); } else rit.reeks = 0;
      /* per vraag: hoe vaak goed en fout, voor de docent na afloop */
      const sl = v.v.slice(0, 140);
      let p = P.per[sl];
      if (!p && Object.keys(P.per).length < PER_VRAAG) p = P.per[sl] = { kop: v.kop, goed: String(v.o[v.g]).slice(0, 80), g: 0, f: 0 };
      if (p){ if (goed) p.g++; else p.f++; }
      const uit = { t: "uitslag", k: v.k, goed, g: v.open ? undefined : v.g, juist: String(v.o[v.g]), u: v.u, soort: v.soort, terug: v.terug || undefined };
      let verder = true;
      if (v.soort === "kwal" && P.fase2 === "kwal"){
        const kw = px.kw;
        if (!kw.t0) kw.t0 = v.sinds;
        if (goed) kw.goed++; else kw.straf += KWAL_STRAF;
        kw.i++;
        uit.bocht = kw.i; uit.straf = kw.straf;
        if (kw.i >= KWAL_N){ kw.tijd = Math.max(1, nu1 - kw.t0 + kw.straf); uit.kwTijd = kw.tijd; verder = false; }
      } else if (v.soort === "pit" && px.pit){
        if (goed){ px.pit.wiel++; px.pit.mis = 0; }
        else if ((px.pit.mis = (px.pit.mis | 0) + 1) >= PIT_HULP){ px.pit.wiel++; px.pit.mis = 0; uit.geholpen = true; }
        uit.wiel = px.pit.wiel;
        if (px.pit.wiel >= WIELEN){
          const ms = nu1 - px.pit.sinds;
          px.pits++; if (!px.pitMs || ms < px.pitMs) px.pitMs = ms;
          if (!P.pit || ms < P.pit.ms) P.pit = { naam: sp.naam, ms };
          px.pit = null; px.band = px.volg; px.slijt = 100; px.t = nu1;
          uit.pitKlaar = ms; uit.band = px.band;
        }
      } else if (P.fase2 === "race"){
        this.prixStap(sp, nu1);
        if (goed){
          px.boost = nu1 + BOOST_MS * BAND[px.band].bonus * (v.terug ? 2 : 1);
          if (v.terug) px.fouten.shift();
        } else {
          px.slijt = Math.max(0, px.slijt - FOUT_SLIJT);
          if (this.prixModus().wijd) px.traag = nu1 + this.prixModus().wijd;
          if (v.terug) px.fouten.push(px.fouten.shift());
          else if (px.fouten.length < FOUTEN_MAX) px.fouten.push({ v: v.v, goed: String(v.o[v.g]), fout: v.o.filter((o, j) => j !== v.g).slice(0, 3), u: v.u, kop: v.kop });
        }
        if (px.klaar) verder = false;
      }
      uit.slijt = Math.round(px.slijt); uit.goedN = px.goed; uit.n = px.n;
      rit.laatste = uit; rit.vraag = null;
      if (verder) this.prixVraag(sid, b, nu1);
      await this.bewaar();
      this.naarSpeler(sid, uit);
      if (uit.kwTijd) this.naarSpeler(sid, { t: "kwklaar", tijd: uit.kwTijd, goed: px.kw.goed });
      if (verder) this.prixZendVraag(sid);
      this.planStand();
    },
    /* wat er na afloop bij komt: voor de docent de vragen die het vaakst fout gingen, voor een speler zijn eigen rit */
    prixEinde(sid){
      const st = this.stand, P = st.prix;
      if (!P) return undefined;
      const uit = { baan: P.baan, rondes: P.rondes, pit: P.pit || undefined, gereden: P.fase2 === "race" };
      const sp = sid ? st.spelers[sid] : null;
      if (sp && sp.px) Object.assign(uit, { goed: sp.px.goed, n: sp.px.n, pits: sp.px.pits, pitMs: sp.px.pitMs, klaar: sp.px.klaar, beste: sp.rit ? sp.rit.beste | 0 : 0, kwTijd: sp.px.kw.tijd || 0 });
      if (!sid) uit.vragen = Object.keys(P.per).map(v => Object.assign({ v }, P.per[v])).filter(x => x.f > 0)
        .sort((a, b) => b.f - a.f || b.f / (b.f + b.g) - a.f / (a.f + a.g)).slice(0, 10);
      return uit;
    }
  };
}
