/* Het klassement van de hele site: een Durable Object per spel (toren,
   zwaard). Bewaart de honderd beste partijen en geeft de top terug.

   GET  /lijst        de top vijftig
   POST /zet          { naam, ronde, punten, waar, niveau, vak, sid } -> { plek, lijst }

   De score komt van de speler zelf, dus hij is niet waterdicht. Wat de
   kamer wel doet: de naam door het filter halen, de getallen begrenzen, en
   per apparaat hoogstens een inzending per twintig seconden aannemen. */
import { DurableObject } from "cloudflare:workers";
import { nette } from "./naamfilter.js";

const MAX_LIJST = 100, TOP = 50, WACHT = 20 * 1000;
function json(obj, status){
  return new Response(JSON.stringify(obj), { status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
function tekst(x, max){ return String(x || "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, max); }
function getal(x, max){ const n = Number(x); return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.round(n))) : 0; }

export class Klassement extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.lijst = null; this.laatst = null;
    this.ctx.blockConcurrencyWhile(async () => {
      this.lijst = (await this.ctx.storage.get("lijst")) || [];
      this.laatst = (await this.ctx.storage.get("laatst")) || {};
    });
  }
  async fetch(req){
    try {
      const url = new URL(req.url);
      if (url.pathname === "/lijst") return json({ lijst: this.top() });
      if (url.pathname === "/zet" && req.method === "POST") return await this.zet(await req.json());
      return json({ fout: "onbekend" }, 404);
    } catch (e){
      console.error("klassement", e && e.stack || e);
      return json({ fout: "het klassement gaf een fout" }, 500);
    }
  }
  top(){ return this.lijst.slice(0, TOP).map((r, i) => Object.assign({ plek: i + 1 }, r)); }
  async zet(inz){
    const sid = tekst(inz.sid, 40);
    if (!/^[A-Za-z0-9_-]{8,40}$/.test(sid)) return json({ fout: "geen geldig kenmerk" }, 400);
    const nu = Date.now();
    if (this.laatst[sid] && nu - this.laatst[sid] < WACHT) return json({ fout: "even wachten voor je nog een score instuurt" }, 429);
    const rij = {
      naam: nette(inz.naam, "Anoniem"), ronde: getal(inz.ronde, 999), punten: getal(inz.punten, 99999),
      waar: tekst(inz.waar, 30), niveau: tekst(inz.niveau, 20), vak: tekst(inz.vak, 20),
      t: nu, id: sid.slice(0, 8) + "-" + nu.toString(36)
    };
    if (!rij.ronde && !rij.punten) return json({ fout: "geen score" }, 400);
    this.lijst.push(rij);
    this.lijst.sort((a, b) => b.ronde - a.ronde || b.punten - a.punten || a.t - b.t);
    this.lijst = this.lijst.slice(0, MAX_LIJST);
    this.laatst[sid] = nu;
    /* de wachttijden van gisteren hoeven niet bewaard te blijven */
    Object.keys(this.laatst).forEach(k => { if (nu - this.laatst[k] > 24 * 3600 * 1000) delete this.laatst[k]; });
    await this.ctx.storage.put("lijst", this.lijst);
    await this.ctx.storage.put("laatst", this.laatst);
    const plek = this.lijst.findIndex(r => r.id === rij.id);
    return json({ plek: plek >= 0 ? plek + 1 : 0, id: rij.id, naam: rij.naam, lijst: this.top() });
  }
}
