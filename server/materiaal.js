/* Eigen materiaal van docenten: woordenlijsten en oefeningen (ook als toets).
   Een docent maakt het in leermiddelen/maken.html; leerlingen openen het met
   een code van zes tekens in oefen.html, en een woordenlijst ook in de spellen.

   Elk stuk staat onder een eigen opslagsleutel, zodat er geen grens is voor
   alles samen. Wie het maakte krijgt een sleutel; alleen met die sleutel kan
   het worden aangepast of weggehaald. Wat ruim een jaar niet geopend is,
   wordt gewist.

   POST   /zet              { soort, naam, ... }            -> { code, sleutel }
   POST   /werk?code=X      { sleutel, soort, naam, ... }   -> { ok }
   POST   /weg?code=X       { sleutel }                     -> { ok }
   GET    /haal?code=X                                      -> het materiaal, zonder sleutel */
import { DurableObject } from "cloudflare:workers";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const BEWAAR = 400 * 24 * 3600 * 1000;           /* ruim een jaar na het laatste gebruik */
const MAX_JSON = 80000;                           /* een stuk hoogstens zoveel tekens */
const MAX_ITEMS = 200;
const SOORTEN = { lijst: 1, oefening: 1 };
const VORMEN = { mk: 1, open: 1, koppel: 1, volgorde: 1, groepen: 1, gaten: 1 };

function json(obj, status){
  return new Response(JSON.stringify(obj), { status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}
/* tekst zonder stuurtekens, ingekort */
function t(x, max){ return String(x == null ? "" : x).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, max); }
function lijstVan(x, max, len){ return (Array.isArray(x) ? x : []).map(y => t(y, len)).filter(Boolean).slice(0, max); }
function willekeurig(n, tekens){ const r = crypto.getRandomValues(new Uint8Array(n)); return Array.from(r, b => tekens[b % tekens.length]).join(""); }

/* Wat er binnenkomt, schoon en in vorm. Geeft null als het niet deugt. */
function netjes(inz){
  if (!inz || typeof inz !== "object") return null;
  const soort = SOORTEN[inz.soort] ? inz.soort : null;
  if (!soort) return null;
  const uit = { soort, naam: t(inz.naam, 80) || (soort === "lijst" ? "Woordenlijst" : "Oefening"), vak: t(inz.vak, 12) };
  if (soort === "lijst"){
    uit.kopA = t(inz.kopA, 30); uit.kopB = t(inz.kopB, 30);
    uit.paren = (Array.isArray(inz.paren) ? inz.paren : []).map(p => ({ a: t(p && p.a, 120), b: t(p && p.b, 120) }))
      .filter(p => p.a && p.b).slice(0, MAX_ITEMS);
    if (uit.paren.length < 4) return { fout: "een woordenlijst heeft minstens vier paren nodig" };
  } else {
    uit.modus = inz.modus === "toets" ? "toets" : "oefenen";
    uit.items = (Array.isArray(inz.items) ? inz.items : []).map(item).filter(Boolean).slice(0, MAX_ITEMS);
    if (!uit.items.length) return { fout: "een oefening heeft minstens een vraag nodig" };
  }
  if (JSON.stringify(uit).length > MAX_JSON) return { fout: "dit is te groot; maak er twee van" };
  return uit;
}
function item(x){
  if (!x || !VORMEN[x.vorm]) return null;
  const v = t(x.vraag, 300), u = t(x.uitleg, 300);
  switch (x.vorm){
    case "mk": {
      const goed = t(x.goed, 150), fout = lijstVan(x.fout, 5, 150);
      return goed && fout.length ? { vorm: "mk", vraag: v, goed, fout, uitleg: u } : null;
    }
    case "open": {
      const antwoorden = lijstVan(x.antwoorden, 8, 100);
      return v && antwoorden.length ? { vorm: "open", vraag: v, antwoorden, uitleg: u } : null;
    }
    case "koppel": {
      const paren = (Array.isArray(x.paren) ? x.paren : []).map(p => ({ a: t(p && p.a, 100), b: t(p && p.b, 100) })).filter(p => p.a && p.b).slice(0, 10);
      return paren.length >= 2 ? { vorm: "koppel", vraag: v, paren, uitleg: u } : null;
    }
    case "volgorde": {
      const stappen = lijstVan(x.stappen, 10, 120);
      return stappen.length >= 2 ? { vorm: "volgorde", vraag: v, stappen, uitleg: u } : null;
    }
    case "groepen": {
      const groepen = (Array.isArray(x.groepen) ? x.groepen : []).map(g => ({ naam: t(g && g.naam, 40), dingen: lijstVan(g && g.dingen, 10, 80) }))
        .filter(g => g.naam && g.dingen.length).slice(0, 4);
      return groepen.length >= 2 ? { vorm: "groepen", vraag: v, groepen, uitleg: u } : null;
    }
    case "gaten": {
      /* de tekst met de woorden die weg moeten tussen [haken] */
      const tekst = t(x.tekst, 1200);
      const n = (tekst.match(/\[[^\]]+\]/g) || []).length;
      return n ? { vorm: "gaten", vraag: v, tekst, extra: lijstVan(x.extra, 6, 40), uitleg: u } : null;
    }
  }
  return null;
}

export class Materiaal extends DurableObject {
  async fetch(req){
    try {
      const url = new URL(req.url), code = String(url.searchParams.get("code") || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (url.pathname === "/haal") return await this.haal(code);
      if (req.method !== "POST") return json({ fout: "onbekend" }, 404);
      let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldig materiaal" }, 400); }
      if (url.pathname === "/zet") return await this.zet(inz);
      if (url.pathname === "/werk") return await this.werk(code, inz);
      if (url.pathname === "/weg") return await this.weg(code, inz);
      return json({ fout: "onbekend" }, 404);
    } catch (e){
      console.error("materiaal", e && e.stack || e);
      return json({ fout: "de opslag gaf een fout" }, 500);
    }
  }
  async zet(inz){
    const m = netjes(inz);
    if (!m) return json({ fout: "geen geldig materiaal" }, 400);
    if (m.fout) return json({ fout: m.fout }, 400);
    let code = willekeurig(6, LETTERS);
    while (await this.ctx.storage.get("m:" + code)) code = willekeurig(6, LETTERS);
    const sleutel = willekeurig(20, LETTERS);
    const nu = Date.now();
    await this.ctx.storage.put("m:" + code, Object.assign(m, { sleutel, gemaakt: nu, bijgewerkt: nu, gebruikt: nu }));
    await this.planOpruimen();
    return json({ code, sleutel });
  }
  async werk(code, inz){
    const oud = await this.ctx.storage.get("m:" + code);
    if (!oud) return json({ fout: "dit materiaal bestaat niet (meer)" }, 404);
    if (!inz || inz.sleutel !== oud.sleutel) return json({ fout: "je kunt alleen je eigen materiaal aanpassen" }, 403);
    const m = netjes(inz);
    if (!m) return json({ fout: "geen geldig materiaal" }, 400);
    if (m.fout) return json({ fout: m.fout }, 400);
    await this.ctx.storage.put("m:" + code, Object.assign(m, { sleutel: oud.sleutel, gemaakt: oud.gemaakt, bijgewerkt: Date.now(), gebruikt: Date.now() }));
    return json({ ok: true, code });
  }
  async weg(code, inz){
    const oud = await this.ctx.storage.get("m:" + code);
    if (!oud) return json({ ok: true });
    if (!inz || inz.sleutel !== oud.sleutel) return json({ fout: "je kunt alleen je eigen materiaal weghalen" }, 403);
    await this.ctx.storage.delete("m:" + code);
    return json({ ok: true });
  }
  async haal(code){
    if (!/^[A-Z0-9]{6}$/.test(code)) return json({ fout: "geen geldige code" }, 400);
    const m = await this.ctx.storage.get("m:" + code);
    if (!m || Date.now() - (m.gebruikt || m.gemaakt) > BEWAAR) return json({ fout: "geen materiaal met deze code" }, 404);
    /* gebruik bijhouden, hoogstens een keer per dag schrijven */
    if (Date.now() - (m.gebruikt || 0) > 24 * 3600 * 1000){ m.gebruikt = Date.now(); await this.ctx.storage.put("m:" + code, m); }
    const uit = Object.assign({ code }, m);
    delete uit.sleutel; delete uit.gebruikt;
    return json(uit);
  }
  /* een keer per dag: wat ruim een jaar niet geopend is, weg */
  async planOpruimen(){
    const al = await this.ctx.storage.getAlarm();
    if (!al) await this.ctx.storage.setAlarm(Date.now() + 24 * 3600 * 1000);
  }
  async alarm(){
    const nu = Date.now();
    const alles = await this.ctx.storage.list({ prefix: "m:" });
    const weg = [];
    for (const [k, m] of alles) if (nu - (m.gebruikt || m.gemaakt || 0) > BEWAAR) weg.push(k);
    for (let i = 0; i < weg.length; i += 100) await this.ctx.storage.delete(weg.slice(i, i + 100));
    if (alles.size > weg.length) await this.ctx.storage.setAlarm(nu + 24 * 3600 * 1000);
  }
}
