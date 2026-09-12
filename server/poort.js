/* De poortwachter: telt per adres hoe vaak er kamers gemaakt en scores
   ingestuurd worden, en zegt nee als het te veel wordt. Alles staat in het
   geheugen; als het object slaapt beginnen de tellers leeg, en dat is prima:
   het gaat om het afremmen van een stroom, niet om een boekhouding. */
import { DurableObject } from "cloudflare:workers";

export class Poort extends DurableObject {
  constructor(ctx, env){
    super(ctx, env);
    this.tel = {};
  }
  async fetch(req){
    let o; try { o = await req.json(); } catch (e){ return this.json({ ok: true }); }
    const nu = Date.now(), per = Math.max(1, Number(o.per) || 10), venster = Math.max(1, Number(o.seconden) || 60) * 1000;
    const k = String(o.wat || "?") + "|" + String(o.ip || "?");
    const lijst = (this.tel[k] || []).filter(t => nu - t < venster);
    const ok = lijst.length < per;
    if (ok) lijst.push(nu);
    this.tel[k] = lijst;
    /* af en toe de oude sleutels opruimen */
    if (Object.keys(this.tel).length > 5000){
      Object.keys(this.tel).forEach(x => { if (!this.tel[x].some(t => nu - t < 600000)) delete this.tel[x]; });
    }
    return this.json({ ok });
  }
  json(obj){ return new Response(JSON.stringify(obj), { headers: { "content-type": "application/json; charset=utf-8" } }); }
}
