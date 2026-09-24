/* Rekenen aan de uitslagen van een eigen toets: scores, cijfers, de norm en
   de analyse per vraag. Gebruikt door maken.html; rekent alleen, tekent niets.

     NAKIJK.bereken(u)            u = het antwoord van EIGEN.uitslagen, met norm en neutraal
                                  -> { max, cesuur, rijen: [{ naam, klas, score, pct, cijfer, open, ... }], gem, voldoende }
     NAKIJK.analyse(u, b)         -> per vraag { p, rit, open, n, let }  (b = de uitkomst van bereken)
     NAKIJK.cijferVan(s, max, norm, cesuurPct)
     NAKIJK.cohenSchotanus(u)     -> de cesuur in procenten, uit de beste leerlingen en de raadkans
     NAKIJK.vergelijk(toetsen)    -> leerlingen naast elkaar over meerdere toetsen

   De norm:
     cesuur  zoveel procent van de punten is een 5,5; daaronder en daarboven recht naar 1 en 10
     nterm   cijfer = 9 x score / max + N, zoals bij de centrale examens (tussen 1 en 10)
     auto    de cesuur volgens Cohen-Schotanus: raadkans + 0,6 x (gemiddelde van de beste 5% - raadkans).
             Is de toets zwaarder uitgevallen dan bedoeld, dan zakt de cesuur mee; maar nooit
             zo ver dat raden genoeg is. */
var NAKIJK = (function(){
  'use strict';
  function rond(x, n){ var f = Math.pow(10, n || 0); return Math.round(x * f) / f; }
  function telt(u, i){ return (u.neutraal || []).indexOf(i) < 0; }
  function punten(it){ return it && it.punten ? it.punten : 1; }
  /* de waarde van een vraag voor een leerling: met de hand nagekeken gaat voor; null is nog niet nagekeken */
  function waarde(r, i){ var h = r.h && r.h[i]; return h !== undefined && h !== null ? h : r.p[i]; }
  function maxVan(u){ var m = 0; u.items.forEach(function(it, i){ if (telt(u, i)) m += punten(it); }); return m; }
  function scoreVan(u, r){
    var s = 0, open = 0;
    u.items.forEach(function(it, i){
      if (!telt(u, i)) return;
      var w = waarde(r, i);
      if (w === null || w === undefined) open++; else s += w * punten(it);
    });
    return { score: s, open: open };
  }
  function cijferVan(s, max, norm, cesuurPct){
    if (!max) return null;
    norm = norm || {};
    var c;
    if (norm.methode === 'nterm') c = 9 * s / max + (norm.n == null ? 1 : norm.n);
    else {
      var ces = Math.max(0.01, Math.min(0.99, (cesuurPct != null ? cesuurPct : norm.cesuur || 55) / 100)) * max;
      c = s >= ces ? 5.5 + 4.5 * (s - ces) / (max - ces) : 1 + 4.5 * s / ces;
    }
    return rond(Math.max(1, Math.min(10, c)), 1);
  }
  /* de raadkans in punten: bij meerkeuze een op het aantal opties, de rest raad je niet */
  function raadkans(u){
    var g = 0;
    u.items.forEach(function(it, i){
      if (!telt(u, i) || it.vorm !== 'mk') return;
      var n = it.opties ? it.opties.length : 1 + (it.fout || []).length;
      g += punten(it) / Math.max(2, n);
    });
    return g;
  }
  function cohenSchotanus(u){
    var max = maxVan(u);
    if (!max || !u.rijen.length) return null;
    var s = u.rijen.map(function(r){ return scoreVan(u, r).score; }).sort(function(a, b){ return b - a; });
    var k = Math.max(1, Math.ceil(s.length * 0.05)), top = 0;
    for (var i = 0; i < k; i++) top += s[i];
    top /= k;
    var g = raadkans(u), ces = g + 0.6 * (top - g);
    return rond(Math.max(30, Math.min(90, ces / max * 100)), 1);
  }
  function bereken(u){
    var max = maxVan(u), norm = u.norm || { methode: 'cesuur', cesuur: 55 };
    var ces = norm.methode === 'auto' ? cohenSchotanus(u) : norm.methode === 'cesuur' ? norm.cesuur : null;
    var rijen = u.rijen.map(function(r){
      var x = scoreVan(u, r);
      return { sid: r.sid, naam: r.naam, klas: r.klas || '', t: r.t, pogingen: r.pogingen, rij: r,
        score: rond(x.score, 2), open: x.open, pct: max ? rond(x.score / max * 100) : 0,
        cijfer: cijferVan(x.score, max, norm, ces) };
    });
    var cijfers = rijen.map(function(r){ return r.cijfer; }).filter(function(c){ return c != null; });
    var gem = cijfers.length ? rond(cijfers.reduce(function(a, b){ return a + b; }, 0) / cijfers.length, 1) : null;
    var voldoende = cijfers.length ? rond(cijfers.filter(function(c){ return c >= 5.5; }).length / cijfers.length * 100) : null;
    var verdeling = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    cijfers.forEach(function(c){ verdeling[Math.min(9, Math.max(0, Math.floor(c) - 1))]++; });
    return { max: max, cesuur: ces, norm: norm, rijen: rijen, gem: gem, voldoende: voldoende, verdeling: verdeling,
      open: rijen.reduce(function(a, r){ return a + r.open; }, 0) };
  }
  function pearson(x, y){
    var n = x.length; if (n < 3) return null;
    var mx = 0, my = 0, i; for (i = 0; i < n; i++){ mx += x[i]; my += y[i]; } mx /= n; my /= n;
    var sxy = 0, sxx = 0, syy = 0;
    for (i = 0; i < n; i++){ sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) * (x[i] - mx); syy += (y[i] - my) * (y[i] - my); }
    return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
  }
  /* Per vraag: de p-waarde (gemiddelde score, 0 tot 1) en de rit (hangt goed op deze
     vraag samen met goed op de rest?). Een lage rit of een p bijna nul wijst vaak
     op een fout in de sleutel of een onduidelijke vraag. */
  function analyse(u, b){
    b = b || bereken(u);
    return u.items.map(function(it, i){
      var x = [], y = [], open = 0;
      b.rijen.forEach(function(r){
        var w = waarde(r.rij, i);
        if (w === null || w === undefined){ open++; return; }
        x.push(w); y.push(r.score - (telt(u, i) ? w * punten(it) : 0));
      });
      var p = x.length ? rond(x.reduce(function(a, c){ return a + c; }, 0) / x.length, 2) : null;
      var rit = pearson(x, y); rit = rit == null ? null : rond(rit, 2);
      var let_ = '';
      if (x.length >= 5){
        if (p !== null && p < 0.25) let_ = 'Bijna niemand had deze goed. Klopt de antwoordsleutel, en is de stof behandeld?';
        else if (rit !== null && rit < 0.2) let_ = 'Wie het goed doet op de rest, doet het hier niet beter. Is de vraag duidelijk?';
        else if (p !== null && p > 0.95) let_ = 'Bijna iedereen had deze goed.';
      }
      return { i: i, vorm: it.vorm, vraag: it.vraag, punten: punten(it), p: p, rit: rit, n: x.length, open: open, telt: telt(u, i), let: let_ };
    });
  }
  function sleutelNaam(r){ return (r.klas || '') + '|' + String(r.naam || '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  /* Meerdere toetsen naast elkaar: per leerling (klas plus naam) de cijfers, en per toets het gemiddelde. */
  function vergelijk(toetsen){
    var wie = {};
    toetsen.forEach(function(ts, k){
      ts.b.rijen.forEach(function(r){
        var s = sleutelNaam(r);
        if (!wie[s]) wie[s] = { naam: r.naam, klas: r.klas, cijfers: toetsen.map(function(){ return null; }) };
        wie[s].cijfers[k] = r.cijfer;
      });
    });
    var leerlingen = Object.keys(wie).map(function(s){
      var w = wie[s], c = w.cijfers.filter(function(x){ return x != null; });
      w.gem = c.length ? rond(c.reduce(function(a, b){ return a + b; }, 0) / c.length, 1) : null;
      /* de lijn: laatste twee cijfers vergeleken */
      w.trend = c.length >= 2 ? rond(c[c.length - 1] - c[c.length - 2], 1) : null;
      w.onvoldoende = c.filter(function(x){ return x < 5.5; }).length;
      return w;
    }).sort(function(a, b){ return (a.klas || '').localeCompare(b.klas || '') || a.naam.localeCompare(b.naam, 'nl'); });
    return { leerlingen: leerlingen, toetsen: toetsen.map(function(ts){ return { code: ts.code, naam: ts.naam, n: ts.b.rijen.length, gem: ts.b.gem, voldoende: ts.b.voldoende }; }) };
  }
  return { bereken: bereken, analyse: analyse, cijferVan: cijferVan, cohenSchotanus: cohenSchotanus, vergelijk: vergelijk, waarde: waarde };
})();
if (typeof module !== 'undefined') module.exports = NAKIJK;
