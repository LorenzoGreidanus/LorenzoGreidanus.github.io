/* Eigen materiaal van docenten: woordenlijsten en oefeningen (ook als toets).
   Een docent maakt het in leermiddelen/maken.html; leerlingen openen het met
   een code van zes tekens in oefen.html, en een woordenlijst ook in de spellen.

   Elk stuk staat onder een eigen opslagsleutel, zodat er geen grens is voor
   alles samen. Wie het maakte krijgt een sleutel; alleen met die sleutel kan
   het worden aangepast, nagekeken of weggehaald. Wat ruim een jaar niet
   geopend is, wordt gewist, met de uitslagen erbij.

   Een toets gaat zonder antwoorden naar de leerling: de opties door elkaar,
   de goede antwoorden alleen hier. De leerling levert zijn antwoorden in en
   de score wordt hier uitgerekend. Bij het ophalen van de uitslagen opnieuw,
   zodat een verbeterde antwoordsleutel meteen voor iedereen telt.

   POST   /zet                  { soort, naam, ... }               -> { code, sleutel }
   POST   /werk?code=X          { sleutel, soort, naam, ... }      -> { ok }
   POST   /weg?code=X           { sleutel }                        -> { ok }
   GET    /haal?code=X                                             -> het materiaal (een toets zonder antwoorden)
   POST   /volledig?code=X      { sleutel }                        -> alles, ook de norm
   POST   /inlever?code=X       { sid, naam, klas, a: [...] }      -> de score per vraag
   POST   /uitslagen?code=X     { sleutel }                        -> alle inleveringen met hun score
   POST   /nakijk?code=X        { sleutel, sid, i, punt }          -> een vraag met de hand nakijken (punt null: weer automatisch)
   POST   /instel?code=X        { sleutel, norm, neutraal, terugzien }
   POST   /wisuitslag?code=X    { sleutel, sid }                   -> een inlevering weg, dan mag die leerling opnieuw
   POST   /afb?code=X           { sleutel, data: "data:image/jpeg;base64,..." } -> { id }   een plaatje bij de toets
   GET    /afb?code=X&id=Y                                         -> het plaatje zelf

   Plaatjes staan in stukken van 96.000 tekens base64 onder a:CODE:ID:n, met
   a:CODE:ID:m als beschrijving; het stuk zelf houdt in afbs bij welke er zijn.
   Gaat de toets weg, of verwijst geen vraag er meer naar, dan gaan ze mee. */
import { DurableObject } from "cloudflare:workers";

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DAG = 24 * 3600 * 1000;
const BEWAAR = 400 * DAG;                          /* ruim een jaar na het laatste gebruik */
const MAX_JSON = 80000;                           /* een stuk hoogstens zoveel tekens */
const MAX_ITEMS = 200;
const MAX_UITSLAGEN = 400;                        /* inleveringen per stuk */
const SOORTEN = { lijst: 1, oefening: 1 };
const VORMEN = { mk: 1, open: 1, koppel: 1, volgorde: 1, groepen: 1, gaten: 1, aanwijzen: 1 };
const MAX_AFB = 12, AFB_BYTES = 400 * 1024, STUK = 96000;
const AFB_ID = /^[A-Z0-9]{8}$/;

function json(obj, status){
  return new Response(JSON.stringify(obj), { status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}
/* tekst zonder stuurtekens, ingekort */
function t(x, max){ return String(x == null ? "" : x).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, max); }
function lijstVan(x, max, len){ return (Array.isArray(x) ? x : []).map(y => t(y, len)).filter(Boolean).slice(0, max); }
function willekeurig(n, tekens){ const r = crypto.getRandomValues(new Uint8Array(n)); return Array.from(r, b => tekens[b % tekens.length]).join(""); }
function schud(a){ a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
/* hoofdletters, spaties en een punt aan het eind tellen niet mee */
function gelijk(a, b){ const n = x => String(x || "").toLowerCase().replace(/\s+/g, " ").replace(/[.!?,;:]+$/, "").trim(); return n(a) === n(b); }
function gatenVan(tekst){ return (String(tekst || "").match(/\[([^\]]+)\]/g) || []).map(x => x.slice(1, -1).trim()); }

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
    /* een toets: zien leerlingen na het inleveren de goede antwoorden? Standaard niet,
       want dezelfde toets gaat vaak later nog naar een andere klas */
    if (uit.modus === "toets") uit.terugzien = inz.terugzien === true;
    uit.items = (Array.isArray(inz.items) ? inz.items : []).map(item).filter(Boolean).slice(0, MAX_ITEMS);
    if (!uit.items.length) return { fout: "een oefening heeft minstens een vraag nodig" };
  }
  if (JSON.stringify(uit).length > MAX_JSON) return { fout: "dit is te groot; maak er twee van" };
  return uit;
}
function item(x){
  if (!x || !VORMEN[x.vorm]) return null;
  const v = t(x.vraag, 300), u = t(x.uitleg, 300);
  const punten = Math.max(1, Math.min(10, Math.round(Number(x.punten) || 1)));
  const met = o => Object.assign(o, { uitleg: u, punten, afb: AFB_ID.test(String(x.afb || "")) ? String(x.afb) : "" });
  switch (x.vorm){
    case "mk": {
      const goed = t(x.goed, 150), fout = lijstVan(x.fout, 5, 150);
      return goed && fout.length ? met({ vorm: "mk", vraag: v, goed, fout }) : null;
    }
    case "open": {
      /* zonder goede antwoorden kijkt de docent hem met de hand na */
      const antwoorden = lijstVan(x.antwoorden, 8, 100);
      return v ? met({ vorm: "open", vraag: v, antwoorden }) : null;
    }
    case "koppel": {
      const paren = (Array.isArray(x.paren) ? x.paren : []).map(p => ({ a: t(p && p.a, 100), b: t(p && p.b, 100) })).filter(p => p.a && p.b).slice(0, 10);
      return paren.length >= 2 ? met({ vorm: "koppel", vraag: v, paren }) : null;
    }
    case "volgorde": {
      const stappen = lijstVan(x.stappen, 10, 120);
      return stappen.length >= 2 ? met({ vorm: "volgorde", vraag: v, stappen }) : null;
    }
    case "groepen": {
      const groepen = (Array.isArray(x.groepen) ? x.groepen : []).map(g => ({ naam: t(g && g.naam, 40), dingen: lijstVan(g && g.dingen, 10, 80) }))
        .filter(g => g.naam && g.dingen.length).slice(0, 4);
      return groepen.length >= 2 ? met({ vorm: "groepen", vraag: v, groepen }) : null;
    }
    case "gaten": {
      /* de tekst met de woorden die weg moeten tussen [haken] */
      const tekst = t(x.tekst, 1200);
      return gatenVan(tekst).length ? met({ vorm: "gaten", vraag: v, tekst, extra: lijstVan(x.extra, 6, 40) }) : null;
    }
    case "aanwijzen": {
      /* nummers op een plaatje, elk met het woord dat erbij hoort; x en y in procenten */
      const proc = n => Math.round(Math.max(0, Math.min(100, Number(n) || 0)) * 10) / 10;
      const plekken = (Array.isArray(x.plekken) ? x.plekken : []).map(p => ({ x: proc(p && p.x), y: proc(p && p.y), naam: t(p && p.naam, 80) })).filter(p => p.naam).slice(0, 12);
      return plekken.length >= 2 ? met({ vorm: "aanwijzen", vraag: v, plekken, extra: lijstVan(x.extra, 6, 80) }) : null;
    }
  }
  return null;
}
/* Een toets zonder antwoorden: wat de leerling nodig heeft om te antwoorden, meer niet. */
function verborgen(it){
  const b = { vorm: it.vorm, vraag: it.vraag, punten: it.punten, afb: it.afb || "" };
  switch (it.vorm){
    case "mk": b.opties = schud([it.goed].concat(it.fout)); break;
    case "koppel": b.links = it.paren.map(p => p.a); b.rechts = schud(it.paren.map(p => p.b)); break;
    case "volgorde": {
      let s = schud(it.stappen);
      if (s.join("\u0001") === it.stappen.join("\u0001")) s.push(s.shift());
      b.stappen = s; break;
    }
    case "groepen": b.groepen = it.groepen.map(g => g.naam); b.dingen = schud([].concat(...it.groepen.map(g => g.dingen))); break;
    case "gaten": b.delen = String(it.tekst).split(/\[[^\]]+\]/); b.woorden = schud(gatenVan(it.tekst).concat(it.extra || [])); break;
    case "aanwijzen": b.plekken = it.plekken.map(p => ({ x: p.x, y: p.y })); b.woorden = schud(it.plekken.map(p => p.naam).concat(it.extra || [])); break;
  }
  return b;
}
/* Een antwoord van een leerling, schoon, in de vorm die bij de vraag hoort. */
function antwoordVan(it, a){
  const lijst = (x, max, len) => (Array.isArray(x) ? x : []).slice(0, max).map(y => t(y, len));
  switch (it.vorm){
    case "mk": return t(a, 150);
    case "open": return t(a, 400);
    case "koppel": return lijst(a, 10, 100);
    case "volgorde": return lijst(a, 10, 120);
    case "groepen": return (Array.isArray(a) ? a : []).slice(0, 40).map(p => [t(p && p[0], 80), t(p && p[1], 40)]);
    case "gaten": return lijst(a, 30, 40);
    case "aanwijzen": return lijst(a, 12, 80);
  }
  return "";
}
/* De score van een antwoord, van 0 tot 1; null als de docent hem met de hand nakijkt. */
function scoor(it, a){
  switch (it.vorm){
    case "mk": return a === it.goed ? 1 : 0;
    case "open": return it.antwoorden.length ? (it.antwoorden.some(x => gelijk(x, a)) ? 1 : 0) : null;
    case "koppel": { const n = it.paren.filter((p, i) => (a || [])[i] === p.b).length; return n / it.paren.length; }
    case "volgorde": { const n = it.stappen.filter((s, i) => (a || [])[i] === s).length; return n / it.stappen.length; }
    case "groepen": {
      const waar = {}; (a || []).forEach(p => { waar[p[0]] = p[1]; });
      let n = 0, alle = 0;
      it.groepen.forEach(g => g.dingen.forEach(d => { alle++; if (waar[d] === g.naam) n++; }));
      return alle ? n / alle : 0;
    }
    case "gaten": { const g = gatenVan(it.tekst); const n = g.filter((w, i) => gelijk((a || [])[i], w)).length; return n / g.length; }
    case "aanwijzen": { const n = it.plekken.filter((p, i) => gelijk((a || [])[i], p.naam)).length; return n / it.plekken.length; }
  }
  return 0;
}
/* het goede antwoord als tekst, voor het overzicht na het inleveren */
function juistVan(it){
  switch (it.vorm){
    case "mk": return it.goed;
    case "open": return it.antwoorden[0] || "";
    case "koppel": return it.paren.map(p => p.a + " = " + p.b).join("; ");
    case "volgorde": return it.stappen.join(" → ");
    case "groepen": return it.groepen.map(g => g.naam + ": " + g.dingen.join(", ")).join("; ");
    case "gaten": return String(it.tekst).replace(/\[([^\]]+)\]/g, "$1");
    case "aanwijzen": return it.plekken.map((p, i) => (i + 1) + ": " + p.naam).join("; ");
  }
  return "";
}
function schoonNorm(n){
  n = n && typeof n === "object" ? n : {};
  const methode = { cesuur: 1, nterm: 1, auto: 1 }[n.methode] ? n.methode : "cesuur";
  const cesuur = Math.max(10, Math.min(95, Number(n.cesuur) || 55));
  const nt = Math.max(0, Math.min(3, Number(n.n) === 0 ? 0 : (Number(n.n) || 1)));
  return { methode, cesuur: Math.round(cesuur * 10) / 10, n: Math.round(nt * 10) / 10 };
}

export class Materiaal extends DurableObject {
  async fetch(req){
    try {
      const url = new URL(req.url), code = String(url.searchParams.get("code") || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (url.pathname === "/haal") return await this.haal(code);
      if (url.pathname === "/afb" && req.method === "GET") return await this.afbHaal(code, url.searchParams.get("id"));
      if (req.method !== "POST") return json({ fout: "onbekend" }, 404);
      let inz; try { inz = await req.json(); } catch (e){ return json({ fout: "geen geldig materiaal" }, 400); }
      switch (url.pathname){
        case "/zet": return await this.zet(inz);
        case "/werk": return await this.werk(code, inz);
        case "/weg": return await this.weg(code, inz);
        case "/volledig": return await this.volledig(code, inz);
        case "/inlever": return await this.inlever(code, inz);
        case "/uitslagen": return await this.uitslagen(code, inz);
        case "/nakijk": return await this.nakijk(code, inz);
        case "/instel": return await this.instel(code, inz);
        case "/wisuitslag": return await this.wisUitslag(code, inz);
        case "/afb": return await this.afbZet(code, inz);
      }
      return json({ fout: "onbekend" }, 404);
    } catch (e){
      console.error("materiaal", e && e.stack || e);
      return json({ fout: "de opslag gaf een fout" }, 500);
    }
  }
  /* het stuk, en alleen als de sleutel klopt */
  async vanMij(code, inz){
    const m = await this.ctx.storage.get("m:" + code);
    if (!m) return { fout: json({ fout: "dit materiaal bestaat niet (meer)" }, 404) };
    if (!inz || inz.sleutel !== m.sleutel) return { fout: json({ fout: "dit is niet jouw materiaal" }, 403) };
    return { m };
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
    const { m: oud, fout } = await this.vanMij(code, inz);
    if (fout) return fout;
    const m = netjes(inz);
    if (!m) return json({ fout: "geen geldig materiaal" }, 400);
    if (m.fout) return json({ fout: m.fout }, 400);
    /* de instellingen van het nakijken blijven staan */
    const blijft = { sleutel: oud.sleutel, gemaakt: oud.gemaakt, bijgewerkt: Date.now(), gebruikt: Date.now(), n: oud.n || 0, afbs: oud.afbs || [] };
    ["norm", "neutraal"].forEach(k => { if (oud[k] !== undefined) blijft[k] = oud[k]; });
    if (Array.isArray(blijft.neutraal) && m.items) blijft.neutraal = blijft.neutraal.filter(i => i < m.items.length);
    await this.ctx.storage.put("m:" + code, Object.assign(m, blijft));
    /* plaatjes waar geen vraag meer naar verwijst, gaan weg */
    await this.afbWeg(code, m, new Set((m.items || []).map(i => i.afb).filter(Boolean)));
    return json({ ok: true, code });
  }
  async weg(code, inz){
    const oud = await this.ctx.storage.get("m:" + code);
    if (!oud) return json({ ok: true });
    if (!inz || inz.sleutel !== oud.sleutel) return json({ fout: "je kunt alleen je eigen materiaal weghalen" }, 403);
    await this.afbWeg(code, oud, new Set());
    await this.ctx.storage.delete("m:" + code);
    await this.uitslagenWeg(code);
    return json({ ok: true });
  }
  /* de plaatjes van een stuk weg, behalve die in houd; slaat de lijst afbs op als er iets verandert */
  async afbWeg(code, m, houd){
    const l = Array.isArray(m.afbs) ? m.afbs : [];
    const weg = l.filter(id => !houd.has(id));
    if (!weg.length) return;
    for (const id of weg){
      const meta = await this.ctx.storage.get("a:" + code + ":" + id + ":m");
      const keys = ["a:" + code + ":" + id + ":m"];
      for (let i = 0; i < (meta ? meta.n : 0); i++) keys.push("a:" + code + ":" + id + ":" + i);
      await this.ctx.storage.delete(keys);
    }
    m.afbs = l.filter(id => houd.has(id));
    if (await this.ctx.storage.get("m:" + code)) await this.ctx.storage.put("m:" + code, m);
  }
  async afbZet(code, inz){
    const { m, fout } = await this.vanMij(code, inz);
    if (fout) return fout;
    const d = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(inz.data || ""));
    if (!d) return json({ fout: "geen geldig plaatje (jpg, png of webp)" }, 400);
    const bytes = Math.floor(d[2].length * 3 / 4);
    if (bytes > AFB_BYTES) return json({ fout: "dit plaatje is te groot; hoogstens 400 kB" }, 400);
    m.afbs = Array.isArray(m.afbs) ? m.afbs : [];
    if (m.afbs.length >= MAX_AFB) return json({ fout: "hoogstens " + MAX_AFB + " plaatjes per toets; haal er eerst een weg" }, 400);
    const id = willekeurig(8, LETTERS), stukken = [];
    for (let i = 0; i < d[2].length; i += STUK) stukken.push(d[2].slice(i, i + STUK));
    for (let i = 0; i < stukken.length; i++) await this.ctx.storage.put("a:" + code + ":" + id + ":" + i, stukken[i]);
    await this.ctx.storage.put("a:" + code + ":" + id + ":m", { type: d[1], n: stukken.length, bytes, t: Date.now() });
    m.afbs.push(id); m.gebruikt = Date.now();
    await this.ctx.storage.put("m:" + code, m);
    return json({ ok: true, id });
  }
  async afbHaal(code, id){
    id = String(id || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!/^[A-Z0-9]{6}$/.test(code) || !AFB_ID.test(id)) return json({ fout: "geen geldig plaatje" }, 400);
    const meta = await this.ctx.storage.get("a:" + code + ":" + id + ":m");
    if (!meta) return json({ fout: "geen plaatje" }, 404);
    let b64 = "";
    for (let i = 0; i < meta.n; i++) b64 += (await this.ctx.storage.get("a:" + code + ":" + id + ":" + i)) || "";
    const bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Response(bytes, { headers: { "content-type": meta.type, "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" } });
  }
  async uitslagenWeg(code){
    const r = await this.ctx.storage.list({ prefix: "r:" + code + ":" });
    const k = [...r.keys()];
    for (let i = 0; i < k.length; i += 100) await this.ctx.storage.delete(k.slice(i, i + 100));
  }
  async haal(code){
    if (!/^[A-Z0-9]{6}$/.test(code)) return json({ fout: "geen geldige code" }, 400);
    const m = await this.ctx.storage.get("m:" + code);
    if (!m || Date.now() - (m.gebruikt || m.gemaakt) > BEWAAR) return json({ fout: "geen materiaal met deze code" }, 404);
    /* gebruik bijhouden, hoogstens een keer per dag schrijven */
    if (Date.now() - (m.gebruikt || 0) > DAG){ m.gebruikt = Date.now(); await this.ctx.storage.put("m:" + code, m); }
    const uit = { code, soort: m.soort, naam: m.naam, vak: m.vak };
    if (m.soort === "lijst") Object.assign(uit, { kopA: m.kopA, kopB: m.kopB, paren: m.paren });
    else if (m.modus === "toets") Object.assign(uit, { modus: "toets", verborgen: true, items: m.items.map(verborgen) });
    else Object.assign(uit, { modus: m.modus, items: m.items });
    return json(uit);
  }
  async volledig(code, inz){
    const { m, fout } = await this.vanMij(code, inz);
    if (fout) return fout;
    const uit = Object.assign({ code }, m);
    delete uit.sleutel; delete uit.gebruikt;
    uit.norm = schoonNorm(m.norm);
    return json(uit);
  }
  /* Een leerling levert in. Een toets een keer; een oefening mag vaker, dan telt de laatste. */
  async inlever(code, inz){
    const m = await this.ctx.storage.get("m:" + code);
    if (!m || m.soort !== "oefening") return json({ fout: "geen oefening met deze code" }, 404);
    const sid = String(inz && inz.sid || "").replace(/[^a-z0-9]/g, "").slice(0, 32);
    const naam = t(inz && inz.naam, 40);
    if (sid.length < 8) return json({ fout: "geen geldig kenmerk" }, 400);
    if (!naam) return json({ fout: "vul je naam in" }, 400);
    const sleutel = "r:" + code + ":" + sid;
    const oud = await this.ctx.storage.get(sleutel);
    if (oud && m.modus === "toets") return json({ fout: "je hebt deze toets al ingeleverd", al: true }, 409);
    if (!oud && (m.n || 0) >= MAX_UITSLAGEN) return json({ fout: "voor deze toets zijn al " + MAX_UITSLAGEN + " inleveringen binnen" }, 400);
    const bron = Array.isArray(inz.a) ? inz.a : [];
    const a = m.items.map((it, i) => antwoordVan(it, bron[i]));
    const r = { sid, naam, klas: t(inz.klas, 8).toUpperCase().replace(/[^A-Z]/g, ""), t: Date.now(), a, h: {}, pogingen: (oud ? oud.pogingen || 1 : 0) + 1 };
    await this.ctx.storage.put(sleutel, r);
    if (!oud){ m.n = (m.n || 0) + 1; m.gebruikt = Date.now(); await this.ctx.storage.put("m:" + code, m); }
    const p = m.items.map((it, i) => scoor(it, a[i]));
    const terug = m.modus !== "toets" || m.terugzien !== false;
    return json({ ok: true, p, open: p.filter(x => x === null).length,
      juist: terug ? m.items.map(juistVan) : null, uitleg: terug ? m.items.map(it => it.uitleg || "") : null,
      punten: m.items.map(it => it.punten || 1) });
  }
  async uitslagen(code, inz){
    const { m, fout } = await this.vanMij(code, inz);
    if (fout) return fout;
    const lijst = await this.ctx.storage.list({ prefix: "r:" + code + ":" });
    const rijen = [...lijst.values()].map(r => ({ sid: r.sid, naam: r.naam, klas: r.klas, t: r.t, pogingen: r.pogingen || 1, a: r.a, h: r.h || {},
      p: m.items.map((it, i) => scoor(it, r.a[i])) })).sort((x, y) => x.naam.localeCompare(y.naam, "nl"));
    return json({ ok: true, naam: m.naam, modus: m.modus, items: m.items, juist: m.items.map(juistVan), norm: schoonNorm(m.norm),
      neutraal: Array.isArray(m.neutraal) ? m.neutraal : [], terugzien: m.terugzien !== false, rijen });
  }
  async nakijk(code, inz){
    const { m, fout } = await this.vanMij(code, inz);
    if (fout) return fout;
    const sid = String(inz.sid || "").replace(/[^a-z0-9]/g, "").slice(0, 32);
    const i = Math.floor(Number(inz.i));
    if (!(i >= 0 && i < m.items.length)) return json({ fout: "geen geldige vraag" }, 400);
    const r = await this.ctx.storage.get("r:" + code + ":" + sid);
    if (!r) return json({ fout: "deze inlevering bestaat niet (meer)" }, 404);
    r.h = r.h || {};
    if (inz.punt === null || inz.punt === undefined) delete r.h[i];
    else r.h[i] = Math.max(0, Math.min(1, Math.round(Number(inz.punt) * 100) / 100 || 0));
    await this.ctx.storage.put("r:" + code + ":" + sid, r);
    return json({ ok: true, h: r.h });
  }
  async instel(code, inz){
    const { m, fout } = await this.vanMij(code, inz);
    if (fout) return fout;
    if (inz.norm) m.norm = schoonNorm(inz.norm);
    if (Array.isArray(inz.neutraal)) m.neutraal = [...new Set(inz.neutraal.map(Number).filter(i => i >= 0 && i < (m.items || []).length))];
    if (typeof inz.terugzien === "boolean") m.terugzien = inz.terugzien;
    await this.ctx.storage.put("m:" + code, m);
    return json({ ok: true, norm: schoonNorm(m.norm), neutraal: m.neutraal || [], terugzien: m.terugzien !== false });
  }
  async wisUitslag(code, inz){
    const { m, fout } = await this.vanMij(code, inz);
    if (fout) return fout;
    const sid = String(inz.sid || "").replace(/[^a-z0-9]/g, "").slice(0, 32);
    if (await this.ctx.storage.get("r:" + code + ":" + sid)){
      await this.ctx.storage.delete("r:" + code + ":" + sid);
      m.n = Math.max(0, (m.n || 1) - 1); await this.ctx.storage.put("m:" + code, m);
    }
    return json({ ok: true });
  }
  /* een keer per dag: wat ruim een jaar niet geopend is, weg */
  async planOpruimen(){
    const al = await this.ctx.storage.getAlarm();
    if (!al) await this.ctx.storage.setAlarm(Date.now() + DAG);
  }
  async alarm(){
    const nu = Date.now();
    const alles = await this.ctx.storage.list({ prefix: "m:" });
    const weg = [];
    for (const [k, m] of alles) if (nu - (m.gebruikt || m.gemaakt || 0) > BEWAAR) weg.push(k);
    for (let i = 0; i < weg.length; i += 100) await this.ctx.storage.delete(weg.slice(i, i + 100));
    for (const k of weg){ await this.uitslagenWeg(k.slice(2)); await this.afbWeg(k.slice(2), alles.get(k) || {}, new Set()); }
    if (alles.size > weg.length) await this.ctx.storage.setAlarm(nu + DAG);
  }
}
