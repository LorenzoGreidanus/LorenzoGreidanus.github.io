/* ============================================================================
   TIJDLIJNMAKER in de klas: leerlingen leveren hun tijdlijn in bij hun klascode,
   de docent bekijkt ze in klas.html, en een docent kan een starttijdlijn klaarzetten
   voor een opdracht (met kaartjes die leerlingen op de goede plek leggen).

   Een tijdlijn met foto's is te groot voor de stand van de klas (die past in een
   waarde). Daarom staat elke tijdlijn apart in de opslag van de Kamer, in stukken:
     tl:<sid>:m        { n, titel, naam, items, fotos, kaarten, goed, t }
     tl:<sid>:<i>      stuk i van de JSON
     tlo:<id>:m / tlo:<id>:<i>   een starttijdlijn van de docent
   Alles gaat eerst door TIJDLIJN.schoonModel: alleen bekende velden, korte teksten,
   foto's alleen als data:image/jpeg|png|webp en niet te groot.

   Deze functies draaien in de Kamer (this = de Kamer), zie kamer.js fetch.
   ============================================================================ */
import TIJDLIJN from "../leermiddelen/tijdlijn-motor.js";

const STUK = 96000;              /* tekens per stuk in de opslag */
const MAX_TEKENS = 1500000;      /* een tijdlijn, met foto's, hoogstens zo groot */
const MAX_FOTOS = 24;
const MAX_TIJDLIJNEN = 60;       /* per klas, het oudste gaat eruit */
const MAX_OPDRACHTEN = 20;

function json(data, status = 200){ return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } }); }
function gelijk(a, b){ a = String(a || ""); b = String(b || ""); if (!a || a.length !== b.length) return false; let x = 0; for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i); return x === 0; }

async function schrijf(st, voor, tekst, meta){
  const oud = await st.get(voor + ":m");
  const n = Math.ceil(tekst.length / STUK), zet = {};
  for (let i = 0; i < n; i++) zet[voor + ":" + i] = tekst.slice(i * STUK, (i + 1) * STUK);
  zet[voor + ":m"] = Object.assign({}, meta, { n });
  await st.put(zet);
  if (oud && oud.n > n){ const weg = []; for (let i = n; i < oud.n; i++) weg.push(voor + ":" + i); await st.delete(weg); }
}
async function lees(st, voor){
  const m = await st.get(voor + ":m"); if (!m) return null;
  const sl = []; for (let i = 0; i < m.n; i++) sl.push(voor + ":" + i);
  const delen = await st.get(sl);
  let tekst = ""; for (const k of sl){ const d = delen.get(k); if (typeof d !== "string") return null; tekst += d; }
  try { return JSON.parse(tekst); } catch (e){ return null; }
}
async function weg(st, voor){
  const m = await st.get(voor + ":m"); if (!m) return;
  const sl = [voor + ":m"]; for (let i = 0; i < m.n; i++) sl.push(voor + ":" + i);
  await st.delete(sl);
}
/* een tijdlijn schoon en binnen de maat; geeft { model, tekst } of { fout } */
function schoonEnMaat(ruw){
  const model = TIJDLIJN.schoonModel(ruw);
  let fotos = 0;
  model.items.forEach(it => { if (it.foto){ fotos++; if (fotos > MAX_FOTOS) delete it.foto; } });
  const tekst = JSON.stringify(model);
  if (tekst.length > MAX_TEKENS) return { fout: "je tijdlijn is te groot: haal een paar afbeeldingen weg" };
  return { model, tekst, fotos: Math.min(fotos, MAX_FOTOS) };
}
function kaartStand(model){
  const kaarten = model.items.filter(it => it.kaart);
  const goed = model.opdracht ? kaarten.filter(it => model.opdracht.klaar[it.id]).length : 0;
  return { kaarten: kaarten.length, goed };
}

/* de leerling levert in; meld() zet daarna een uitslag in de klas, voor het overzicht en de opdracht */
export async function tlInlever(inz){
  if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
  const sid = String(inz && inz.sid || "");
  if (!/^[A-Za-z0-9_-]{8,40}$/.test(sid)) return json({ fout: "geen geldig kenmerk" }, 400);
  const s = schoonEnMaat(inz.model);
  if (s.fout) return json({ fout: s.fout }, 413);
  const vak = String(inz.vak || "ges").replace(/[^a-z]/g, "").slice(0, 8) || "ges";
  /* eerst de gewone melding: die controleert of de leerling in deze klas mag (vol, weggehaald, opgeheven) */
  const ks = kaartStand(s.model);
  const r = await this.meld({ sid, naam: inz.naam, av: inz.av, ms: inz.ms, acc: inz.acc, spel: "tijdlijn", ronde: 1, punten: ks.goed, vak });
  if (r.status !== 200) return r;
  const kort = sid.slice(0, 12), st = this.ctx.storage;
  const meta = { titel: s.model.titel, naam: String(inz.naam || "").slice(0, 40), items: s.model.items.length, fotos: s.fotos, kaarten: ks.kaarten, goed: ks.goed, t: Date.now() };
  await schrijf(st, "tl:" + kort, s.tekst, meta);
  /* een lijstje van wie er iets inleverde, om de docent snel een overzicht te geven */
  const lijst = (await st.get("tl:lijst")) || {};
  lijst[kort] = meta;
  const sids = Object.keys(lijst);
  if (sids.length > MAX_TIJDLIJNEN){
    sids.sort((a, b) => lijst[a].t - lijst[b].t);
    for (const oud of sids.slice(0, sids.length - MAX_TIJDLIJNEN)){ await weg(st, "tl:" + oud); delete lijst[oud]; }
  }
  await st.put("tl:lijst", lijst);
  return json({ ok: true, t: meta.t });
}

/* de docent: wie leverde wat in */
export async function tlLijst(sleutel){
  if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
  if (!gelijk(sleutel, this.stand.sleutel)) return json({ fout: "dit is niet jouw klas" }, 403);
  const lijst = (await this.ctx.storage.get("tl:lijst")) || {};
  const ll = this.stand.leerlingen || {};
  return json({ tijdlijnen: Object.keys(lijst).map(sid => Object.assign({ sid }, lijst[sid], { naam: (ll[sid] && (ll[sid].ms || ll[sid].naam)) || lijst[sid].naam })) .sort((a, b) => b.t - a.t) });
}
/* de docent: een tijdlijn helemaal */
export async function tlEen(sleutel, sid){
  if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
  if (!gelijk(sleutel, this.stand.sleutel)) return json({ fout: "dit is niet jouw klas" }, 403);
  sid = String(sid || "").slice(0, 12);
  if (!/^[A-Za-z0-9_-]{8,12}$/.test(sid)) return json({ fout: "geen geldig kenmerk" }, 400);
  const m = await lees(this.ctx.storage, "tl:" + sid);
  if (!m) return json({ fout: "niet gevonden" }, 404);
  return json({ model: TIJDLIJN.schoonModel(m) });
}

/* de docent zet een starttijdlijn klaar voor een opdracht; de opdracht zelf gaat via /opdracht met kz tl=<id> */
export async function tlStartZet(inz){
  if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
  if (!inz || !gelijk(inz.sleutel, this.stand.sleutel)) return json({ fout: "dit is niet jouw klas" }, 403);
  const s = schoonEnMaat(inz.model);
  if (s.fout) return json({ fout: s.fout }, 413);
  if (!s.model.items.some(it => it.kaart)) return json({ fout: "kies minstens een kaartje dat leerlingen moeten plaatsen" }, 400);
  s.model.opdracht = { tekst: String(inz.tekst || (inz.model && inz.model.opdracht && inz.model.opdracht.tekst) || "").slice(0, 400), klaar: {}, hulp: {}, pogingen: {} };
  const tekst = JSON.stringify(TIJDLIJN.schoonModel(s.model));
  const st = this.ctx.storage, lijst = (await st.get("tlo:lijst")) || {};
  const id = Math.random().toString(36).slice(2, 10);
  await schrijf(st, "tlo:" + id, tekst, { titel: s.model.titel, t: Date.now() });
  lijst[id] = { titel: s.model.titel, t: Date.now() };
  const ids = Object.keys(lijst);
  if (ids.length > MAX_OPDRACHTEN){
    ids.sort((a, b) => lijst[a].t - lijst[b].t);
    for (const oud of ids.slice(0, ids.length - MAX_OPDRACHTEN)){ await weg(st, "tlo:" + oud); delete lijst[oud]; }
  }
  await st.put("tlo:lijst", lijst);
  return json({ ok: true, id });
}
/* de leerling haalt de starttijdlijn op (geen sleutel nodig: hij is voor de hele klas) */
export async function tlStart(id){
  if (!this.stand || this.stand.spel !== "klas") return json({ fout: "dit is geen klascode" }, 404);
  id = String(id || "");
  if (!/^[a-z0-9]{4,12}$/.test(id)) return json({ fout: "onbekende opdracht" }, 400);
  const m = await lees(this.ctx.storage, "tlo:" + id);
  if (!m) return json({ fout: "deze opdracht bestaat niet meer" }, 404);
  return json({ model: TIJDLIJN.schoonModel(m) });
}
