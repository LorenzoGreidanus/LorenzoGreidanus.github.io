/* Het profiel achter een speelcode: acht letters, geen naam, geen wachtwoord.
   Een leerling maakt op een apparaat een code en vult die op een ander
   apparaat in; daarmee reizen de avatar, de beste scores, de sterren van de
   campagne en de klascode mee. Het profiel bevat geen persoonsgegevens en
   verdwijnt na een jaar zonder gebruik. Eén object per code. */
import { DurableObject } from "cloudflare:workers";

const LEEFT = 400 * 24 * 60 * 60 * 1000;   /* zonder gebruik: na ruim een jaar weg */
const MAX_TEKST = 24000;                    /* een profiel als JSON, ruim genoeg voor honderden spellen */

function json(obj, status){
  return new Response(JSON.stringify(obj), { status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
import COSMETICA from "../leermiddelen/cosmetica.js";
function schoonAvatar(a){ a = String(a || "").replace(/[^a-z0-9]/g, "").slice(0, 32); return COSMETICA.ontleed(a) ? a : ""; }
function schoon(t, n){ return String(t == null ? "" : t).replace(/[<>]/g, "").slice(0, n); }
function getal(x, max){ x = Number(x); return isFinite(x) ? Math.max(0, Math.min(max, Math.round(x))) : 0; }

/* Alleen wat we kennen komt het profiel in, met een plafond per veld. */
function netjes(inz){
  inz = inz && typeof inz === "object" ? inz : {};
  const p = { avatar: schoonAvatar(inz.avatar), beste: {}, campagne: {}, vrij: {}, klas: null, niveau: schoon(inz.niveau, 6),
              /* munten erbij en aankopen zijn wensen van dit apparaat; de server houdt het saldo */
              muntDelta: getal(inz.muntDelta, 600), koop: (Array.isArray(inz.koop) ? inz.koop : []).slice(0, 6).map(x => schoon(x, 4)).filter(x => COSMETICA.vind(x)),
              /* trofeeën die het spel meldt: alleen wat een baas oplevert */
              vrijspeel: (Array.isArray(inz.vrijspeel) ? inz.vrijspeel : []).slice(0, 12).map(x => schoon(x, 4)).filter(x => { const it = COSMETICA.vind(x); return it && it.baas; }) };
  const b = inz.beste && typeof inz.beste === "object" ? inz.beste : {};
  Object.keys(b).slice(0, 300).forEach(k => {
    const s = schoon(k, 60).replace(/[^a-z0-9-]/gi, ""), v = b[k];
    if (s && v && typeof v === "object" && typeof v.w === "number" && isFinite(v.w)) p.beste[s] = { w: Math.round(v.w * 100) / 100, t: getal(v.t, 1e14) };
  });
  const c = inz.campagne && typeof inz.campagne === "object" ? inz.campagne : {};
  Object.keys(c).slice(0, 30).forEach(k => { if (/^\d{1,2}$/.test(k)) p.campagne[k] = getal(c[k], 3); });
  const v = inz.vrij && typeof inz.vrij === "object" ? inz.vrij : {};
  ["tonkla", "aap", "eiland", "archipel", "vulkaan"].forEach(k => { if (v[k]) p.vrij[k] = true; });
  if (inz.klas && typeof inz.klas === "object" && /^[A-Z]{4}$/.test(String(inz.klas.code || "")) && inz.klas.naam){
    p.klas = { code: String(inz.klas.code), naam: schoon(inz.klas.naam, 16), sinds: getal(inz.klas.sinds, 1e14) };
  }
  /* de klassen die deze docent maakte: code plus sleutel, zodat ze op een ander apparaat na inloggen terug zijn */
  p.docent = (Array.isArray(inz.docent) ? inz.docent : []).slice(0, 30).map(k => k && typeof k === "object" ? {
    code: String(k.code || "").toUpperCase(), sleutel: String(k.sleutel || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80), naam: schoon(k.naam, 30), gemaakt: getal(k.gemaakt, 1e14) } : null)
    .filter(k => k && /^[A-Z]{4}$/.test(k.code) && k.sleutel);
  /* de foutenmap: kenmerk en vak, hoogstens tachtig */
  p.fouten = (Array.isArray(inz.fouten) ? inz.fouten : []).slice(0, 80).map(x => x && typeof x === "object" ? { h: String(x.h || "").replace(/[^a-z0-9]/g, "").slice(0, 12), vak: schoon(x.vak, 8) } : null).filter(x => x && x.h);
  p.docentWeg = (Array.isArray(inz.docentWeg) ? inz.docentWeg : []).slice(0, 30).map(x => String(x || "").toUpperCase()).filter(x => /^[A-Z]{4}$/.test(x));
  return p;
}
/* Samenvoegen: het nieuwste record wint, sterren en vrijgespeelde dingen tellen op, de rest komt van het apparaat dat meldt. */
function voegSamen(oud, nieuw, klasWeg, alles){
  const p = { avatar: nieuw.avatar || oud.avatar || "", beste: Object.assign({}, oud.beste), campagne: Object.assign({}, oud.campagne),
              vrij: Object.assign({}, oud.vrij), klas: nieuw.klas || (klasWeg ? null : oud.klas) || null, niveau: nieuw.niveau || oud.niveau || "",
              munten: Math.max(0, (oud.munten | 0) + (nieuw.muntDelta | 0)), bezit: Object.assign({}, oud.bezit), docent: [] };
  /* docentklassen: wat er al was plus wat dit apparaat kent, op code; wat het apparaat vergat gaat eruit */
  const weg = new Set(nieuw.docentWeg || []), gezien = new Set();
  (oud.docent || []).concat(nieuw.docent || []).forEach(k => { if (!weg.has(k.code) && !gezien.has(k.code)){ gezien.add(k.code); p.docent.push(k); } });
  p.docent = p.docent.slice(0, 30);
  /* de foutenmap: het apparaat dat meldt heeft de nieuwste stand (goed = eruit), dus die wint; leeg gemeld = leeg */
  p.fouten = nieuw.fouten || [];
  /* het beheeraccount heeft alles: alle cosmetica en alle eilanden */
  if (alles){ COSMETICA.ITEMS.forEach(it => { p.bezit[it.id] = true; }); ["tonkla", "aap", "eiland", "archipel", "vulkaan"].forEach(k => { p.vrij[k] = true; }); }
  /* kopen: alleen wat er nog niet is en wat het saldo toelaat; daarna mag alleen bezit in de spec staan */
  (nieuw.vrijspeel || []).forEach(id => { p.bezit[id] = true; });
  (nieuw.koop || []).forEach(id => { const it = COSMETICA.vind(id); if (it && !it.baas && COSMETICA.inSeizoen(it) && !p.bezit[id] && p.munten >= it.prijs){ p.munten -= it.prijs; p.bezit[id] = true; } });
  p.avatar = COSMETICA.toegestaan(p.avatar, p.bezit);
  Object.keys(nieuw.beste).forEach(k => { const a = p.beste[k], b = nieuw.beste[k]; if (!a || b.t >= a.t) p.beste[k] = b; });
  Object.keys(nieuw.campagne).forEach(k => { p.campagne[k] = Math.max(p.campagne[k] | 0, nieuw.campagne[k]); });
  Object.keys(nieuw.vrij).forEach(k => { p.vrij[k] = true; });
  return p;
}

export class Profiel extends DurableObject {
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
    if (this.stand && Date.now() - this.stand.laatst >= LEEFT - 60000) await this.ctx.storage.deleteAll();
  }
  async fetch(req){
    const url = new URL(req.url);
    let inz = {};
    if (req.method === "POST"){ try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldig profiel" }, 400); } }
    if (url.pathname === "/maak"){
      if (this.stand) return json({ fout: "bezet" }, 409);
      const code = String(inz.code || "").toUpperCase();
      if (!/^[A-Z]{8}$/.test(code)) return json({ fout: "geen geldige code" }, 400);
      this.stand = { code, gemaakt: Date.now(), laatst: Date.now(), profiel: voegSamen({ beste: {}, campagne: {}, vrij: {}, bezit: {}, munten: 0 }, netjes(inz.profiel), false) };
      if (JSON.stringify(this.stand).length > MAX_TEKST) return json({ fout: "profiel te groot" }, 413);
      await this.bewaar();
      return json({ ok: true, code, profiel: this.stand.profiel });
    }
    if (!this.stand) return json({ fout: "geen profiel met deze code" }, 404);
    if (url.pathname === "/lees"){
      await this.bewaar();
      return json({ ok: true, code: this.stand.code, profiel: this.stand.profiel, gemaakt: this.stand.gemaakt });
    }
    if (url.pathname === "/sync"){
      const nieuw = voegSamen(this.stand.profiel, netjes(inz.profiel), !!inz.klasWeg, !!this.stand.alles);
      if (JSON.stringify(nieuw).length > MAX_TEKST) return json({ fout: "profiel te groot" }, 413);
      this.stand.profiel = nieuw;
      await this.bewaar();
      return json({ ok: true, code: this.stand.code, profiel: nieuw });
    }
    /* het beheeraccount hangt aan deze code: voortaan alles vrij */
    if (url.pathname === "/alles"){
      this.stand.alles = true;
      this.stand.profiel = voegSamen(this.stand.profiel, netjes({}), false, true);
      await this.bewaar();
      return json({ ok: true, profiel: this.stand.profiel });
    }
    if (url.pathname === "/weg"){
      await this.ctx.storage.deleteAll();
      this.stand = null;
      return json({ ok: true });
    }
    return json({ fout: "onbekend" }, 404);
  }
}
