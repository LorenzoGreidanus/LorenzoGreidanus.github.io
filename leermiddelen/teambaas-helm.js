/* De racehelm van Teambaas in 3D, getekend op een canvas (zonder bibliotheek).
   TBHELM.maak(canvas, { basis, streep, accent, patroon, vizier, open, draai, hoek, sleep })
     -> { zet(props), open(ja), stop() }
   Elke pixel wordt uitgerekend: de schaal is een ei met onderaan de opening, het vizier
   een los schild dat om twee scharnieren open en dicht draait. De stijl is die van de
   winkel (avatar.js): zacht licht linksboven, nachtblauw aan de schaduwkant, een
   donkere rand in de eigen kleur en een witte glimstreep. Hetzelfde als op het canvas
   van het ontwerp (Teambaas: racemanager). */
window.TBHELM = (function(){
  'use strict';
  /* Een racehelm in 3D in de stijl van de winkel (avatar.js): zacht en rond, licht linksboven en naar
     nachtblauw aan de schaduwkant, een donkerdere rand in de eigen kleur om de buitenkant, en een witte
     glimvlek. Geen bibliotheek: voor elke pixel wordt uitgerekend waar hij de helm raakt, zodat de vorm,
     de randen en de patronen glad blijven. De kleuren en het patroon komen uit de props. */
  var INKT = [20, 34, 76], WIT = [255, 255, 255];
  function rgb(h){ h = String(h || '#888888').replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); var x = parseInt(h, 16); return [(x >> 16) & 255, (x >> 8) & 255, x & 255]; }
  function meng(k, m, s){ return [k[0] + (m[0] - k[0]) * s, k[1] + (m[1] - k[1]) * s, k[2] + (m[2] - k[2]) * s]; }
  var VIZIER = { donker: '#22306A', blauw: '#2D5FD6', goud: '#D9A33A' };
  /* de schaal: een ei, aan de voorkant langer dan breed; onderaan afgesneden, voor lager (de kinbeugel) dan achter */
  var RA = 1.0, RB = 1.04, RC = 1.16;
  function snede(z){ return -0.62 - 0.22 * z / RC; }
  /* welk deel van de verf op dit punt zit: phi 0 is recht vooruit, th de hoogte */
  function kleurOp(p, phi, th){
    var a = Math.abs(phi);
    /* het vizier buigt om de zijkanten: in het midden het hoogst */
    var top = 0.3 - 0.14 * a * a, bodem = -0.1 + 0.05 * a * a;
    /* het gat voor het vizier, met een rand eromheen; het vizier zelf is een los deel (zie vizierOp) */
    if (a < 1.15 && th > bodem && th < top) return 'gat';
    if (a < 1.23 && th > bodem - 0.06 && th < top + 0.06) return 'acc';
    /* de scharnieren aan de zijkant */
    if (Math.hypot(a - 1.32, th - 0.1) < 0.085) return 'acc';
    var x = Math.sin(phi) * Math.cos(th);
    switch (p){
      case 'midden': if (Math.abs(x) < 0.12 && th > -0.1) return 'str'; if (Math.abs(x) < 0.18 && th > -0.1) return 'acc'; break;
      case 'zij': if (th > -0.52 && th < -0.3) return 'str'; if (th >= -0.3 && th < -0.25) return 'acc'; break;
      case 'pijl': if (Math.cos(phi) < 0.85){ var v = th - 0.8 * Math.abs(Math.sin(phi / 2)); if (v > -0.08 && v < 0.16) return 'str'; if (v >= 0.16 && v < 0.24) return 'acc'; } break;
      case 'ruiten': if (th < -0.25){ var i = Math.floor((phi + Math.PI) / (Math.PI / 9)), j = Math.floor((th + 2) / 0.13); return (i + j) % 2 ? 'str' : 'bas'; } if (th < -0.2) return 'acc'; break;
    }
    if (th > 1.28) return 'acc';
    return 'bas';
  }
  /* Het vizier: een dun schild net buiten de helm (S keer zo groot), dat om de scharnieras draait.
     De as loopt dwars door de helm op hoogte SY. Open is 0,78 radialen omhoog: dan ligt het tegen de kap. */
  var S = 1.05, SY = 0.02, OPEN = 0.78;
  function vizierOp(phi, th){
    var a = Math.abs(phi), top = 0.34 - 0.14 * a * a, bodem = -0.14 + 0.05 * a * a;
    if (a > 1.22 || th < bodem || th > top) return '';
    if (a > 1.16 || th < bodem + 0.035 || th > top - 0.035) return 'rand';
    return 'glas';
  }

  var alle = [], loopt = false;
  function lus(){
    alle = alle.filter(function(h){ return h.doek && h.doek.isConnected; });
    alle.forEach(function(h){ h.teken(); });
    if (alle.length) requestAnimationFrame(lus); else loopt = false;
  }
  function Helm(c, props){
    var self = this;
    this.doek = c; this.props = props || {}; this.yaw = null; this.sleep = null; this.laatst = ''; this.openNu = null; this.openDoel = null;
    if (this.props.sleep !== false){
      c.style.touchAction = 'none'; c.style.cursor = 'grab';
      c.addEventListener('pointerdown', function(e){ self.sleep = { x: e.clientX, yaw: self.yaw }; try { c.setPointerCapture(e.pointerId); } catch (x){} });
      c.addEventListener('pointermove', function(e){ if (self.sleep) self.yaw = self.sleep.yaw + (e.clientX - self.sleep.x) * 0.012; });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function(n){ c.addEventListener(n, function(){ self.sleep = null; }); });
      c.addEventListener('dblclick', function(){ self.zetOpen(!(self.openDoel != null ? self.openDoel : +self.props.open)); });
    }
  }
  Helm.prototype.teken = function(){
    var c = this.doek; if (!c) return;
    var P = this.props, W = c.width, H = c.height;
    if (this.yaw === null) this.yaw = P.hoek != null ? +P.hoek : -0.6;
    if (P.draai !== false && !this.sleep) this.yaw += 0.008;
    var doel = this.openDoel != null ? this.openDoel : (+P.open || 0);
    if (this.openNu === null) this.openNu = doel;
    this.openNu += (doel - this.openNu) * 0.14; if (Math.abs(doel - this.openNu) < 0.004) this.openNu = doel;
    var hoekV = this.openNu * OPEN, ca = Math.cos(hoekV), sa = Math.sin(hoekV);
    var sleutel = [W, this.yaw.toFixed(3), this.openNu.toFixed(3), P.basis, P.streep, P.accent, P.vizier, P.patroon].join('|');
    if (sleutel === this.laatst) return;
    this.laatst = sleutel;
    /* grote helmen rekenen op een kleiner raster en worden opgeschaald: blijft vloeiend draaien */
    var res = Math.min(1, 560 / W), w = Math.round(W * res), h = Math.round(H * res);
    if (!this.werk || this.werk.width !== w){ this.werk = document.createElement('canvas'); this.werk.width = w; this.werk.height = h; }
    var wc = this.werk.getContext('2d'), img = wc.createImageData(w, h), D = img.data;
    var K = { bas: rgb(P.basis || '#F26749'), str: rgb(P.streep || '#FBF6F1'), acc: rgb(P.accent || '#204ECF'), viz: rgb(VIZIER[P.vizier] || VIZIER.donker) };
    var rand = meng(K.bas, INKT, 0.5), binnen = meng(K.bas, INKT, 0.78), patroon = P.patroon || 'pijl';
    var yaw = this.yaw, pitch = -0.24, cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    /* van beeld naar helm: eerst de kanteling terug, dan de draaiing terug */
    function terug(x, y, z){ var y1 = y * cp + z * sp, z1 = -y * sp + z * cp; return [x * cy - z1 * sy, y1, x * sy + z1 * cy]; }
    function heen(x, y, z){ var x1 = x * cy + z * sy, z1 = -x * sy + z * cy; return [x1, y * cp - z1 * sp, y * sp + z1 * cp]; }
    var L = [-0.6, 0.66, 0.45], ln = Math.hypot(L[0], L[1], L[2]); L = [L[0] / ln, L[1] / ln, L[2] / ln];
    var Hh = [L[0], L[1], L[2] + 1], hn = Math.hypot(Hh[0], Hh[1], Hh[2]); Hh = [Hh[0] / hn, Hh[1] / hn, Hh[2] / hn];
    /* van vizier naar helm (open draaien) en terug, om de scharnieras */
    function vHeen(x, y, z){ var yy = y - SY; return [x, yy * ca + z * sa + SY, -yy * sa + z * ca]; }
    function vTerug(x, y, z){ var yy = y - SY; return [x, yy * ca - z * sa + SY, yy * sa + z * ca]; }
    function licht(basis, nv){ var lam = nv[0] * L[0] + nv[1] * L[1] + nv[2] * L[2]; return lam > 0.5 ? meng(basis, WIT, Math.min(0.3, (lam - 0.5) * 0.7)) : meng(basis, INKT, Math.min(0.42, (0.5 - lam) * 0.5)); }
    var schaal = w * 0.33, mx = w / 2, my = h * 0.46, rij = terug(1, 0, 0), kol = terug(0, -1, 0), dir = terug(0, 0, -1);
    for (var py = 0; py < h; py++){
      var Y = (py - my) / schaal;
      if (Math.abs(Y) > 1.35) continue;
      for (var px = 0; px < w; px++){
        var X = (px - mx) / schaal;
        if (X * X + Y * Y > 1.9) continue;
        /* de straal: begint voor de helm en gaat het beeld in */
        var o = [rij[0] * X + kol[0] * Y - dir[0] * 4, rij[1] * X + kol[1] * Y - dir[1] * 4, rij[2] * X + kol[2] * Y - dir[2] * 4];
        var ox = o[0] / RA, oy = o[1] / RB, oz = o[2] / RC, dx = dir[0] / RA, dy = dir[1] / RB, dz = dir[2] / RC;
        var A = dx * dx + dy * dy + dz * dz, B = 2 * (ox * dx + oy * dy + oz * dz), C = ox * ox + oy * oy + oz * oz - 1, disc = B * B - 4 * A * C;
        var kl = null, tH = Infinity, kV = null, tV = Infinity;
        /* eerst het vizier */
        var vo = vTerug(o[0], o[1], o[2]), vd = vTerug(dir[0] + 0, dir[1] + SY, dir[2]); vd = [vd[0], vd[1] - SY, vd[2]];
        var qx = vo[0] / (RA * S), qy = vo[1] / (RB * S), qz = vo[2] / (RC * S), ex = vd[0] / (RA * S), ey = vd[1] / (RB * S), ez = vd[2] / (RC * S);
        var vA = ex * ex + ey * ey + ez * ez, vB = 2 * (qx * ex + qy * ey + qz * ez), vC = qx * qx + qy * qy + qz * qz - 1, vdis = vB * vB - 4 * vA * vC;
        if (vdis >= 0){
          var vs = Math.sqrt(vdis), ts = [(-vB - vs) / (2 * vA), (-vB + vs) / (2 * vA)];
          for (var k = 0; k < 2 && !kV; k++){
            var q = [vo[0] + vd[0] * ts[k], vo[1] + vd[1] * ts[k], vo[2] + vd[2] * ts[k]];
            var sv = vizierOp(Math.atan2(q[0], q[2]), Math.asin(Math.max(-1, Math.min(1, q[1] / (RB * S)))));
            if (!sv) continue;
            var gn = [q[0] / (RA * RA), q[1] / (RB * RB), q[2] / (RC * RC)], gl = Math.hypot(gn[0], gn[1], gn[2]);
            gn = vHeen(gn[0] / gl, gn[1] / gl + SY, gn[2] / gl); gn = heen(gn[0], gn[1] - SY, gn[2]);
            if (k === 1) gn = [-gn[0], -gn[1], -gn[2]];
            var vb = sv === 'rand' ? K.acc : K.viz;
            kV = licht(vb, gn); if (k === 1) kV = meng(kV, INKT, 0.35);
            if (Math.abs(gn[2]) < 0.22) kV = meng(vb, INKT, 0.5);
            tV = ts[k];
          }
        }
        if (disc >= 0){
        var sq = Math.sqrt(disc), t1 = (-B - sq) / (2 * A), t2 = (-B + sq) / (2 * A);
        var p1 = [o[0] + dir[0] * t1, o[1] + dir[1] * t1, o[2] + dir[2] * t1], gat1 = false;
        if (p1[1] >= snede(p1[2])) gat1 = kleurOp(patroon, Math.atan2(p1[0], p1[2]), Math.asin(Math.max(-1, Math.min(1, p1[1] / RB)))) === 'gat';
        tH = t1;
        if (p1[1] >= snede(p1[2]) && !gat1){
          var nx = p1[0] / (RA * RA), ny = p1[1] / (RB * RB), nz = p1[2] / (RC * RC), nl = Math.hypot(nx, ny, nz);
          var nv = heen(nx / nl, ny / nl, nz / nl), dicht = Math.abs(nv[2]);
          if (dicht < 0.2) kl = rand;
          else if (p1[1] - snede(p1[2]) < 0.045) kl = meng(K.acc, INKT, 0.35);
          else {
            var phi = Math.atan2(p1[0], p1[2]), th = Math.asin(Math.max(-1, Math.min(1, p1[1] / RB))), soort = kleurOp(patroon, phi, th);
            var lam = nv[0] * L[0] + nv[1] * L[1] + nv[2] * L[2], basis = K[soort];
            kl = lam > 0.5 ? meng(basis, WIT, Math.min(0.3, (lam - 0.5) * 0.7)) : meng(basis, INKT, Math.min(0.42, (0.5 - lam) * 0.5));
            if (dicht < 0.32) kl = meng(kl, rand, (0.32 - dicht) / 0.12);
          }
        } else {
          var p2 = [o[0] + dir[0] * t2, o[1] + dir[1] * t2, o[2] + dir[2] * t2];
          if (p2[1] >= snede(p2[2])){ kl = gat1 ? meng([12, 18, 44], licht([48, 62, 120], [0, 0.4, 0.9]), 0.35) : binnen; tH = t2; }
        }
        }
        if (kV && (!kl || tV < tH)) kl = kV;
        if (!kl) continue;
        var i = (py * w + px) * 4; D[i] = kl[0]; D[i + 1] = kl[1]; D[i + 2] = kl[2]; D[i + 3] = 255;
      }
    }
    wc.putImageData(img, 0, 0);
    var ctx = c.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(20,34,76,.16)'; ctx.beginPath(); ctx.ellipse(W / 2, H * 0.85, W * 0.28, W * 0.05, 0, 0, Math.PI * 2); ctx.fill();
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.werk, 0, 0, W, H);
    /* glimstrepen zoals op de pet in de winkel: een over de kap, een over het vizier, alleen aan de kant die naar je toe staat */
    var f = W / w;
    function streep(van, tot, th, dik, alfa, opVizier){
      var pts = [];
      for (var i = 0; i <= 20; i++){ var phi = van + (tot - van) * i / 20, m = opVizier ? S : 1, v = [RA * m * Math.cos(th) * Math.sin(phi), RB * m * Math.sin(th), RC * m * Math.cos(th) * Math.cos(phi)]; if (opVizier) v = vHeen(v[0], v[1], v[2]); var p = heen(v[0], v[1], v[2]); if (p[2] > 0.35) pts.push([(mx + p[0] * schaal) * f, (my - p[1] * schaal) * f]); }
      if (pts.length < 4) return;
      ctx.beginPath(); pts.forEach(function(q, i){ if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); });
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = W * dik; ctx.strokeStyle = 'rgba(255,255,255,' + alfa + ')'; ctx.stroke();
    }
    streep(yaw > 0 ? 0.5 : -1.5, yaw > 0 ? 1.5 : -0.5, 0.98, 0.026, 0.55);
    streep(-0.85, -0.25, 0.17, 0.02, 0.65, true);
  };

  Helm.prototype.zet = function(p){ for (var k in p) this.props[k] = p[k]; this.laatst = ''; };
  Helm.prototype.zetOpen = function(ja){ this.openDoel = ja ? 1 : 0; };
  function maak(c, props){
    var h = new Helm(c, props);
    alle.push(h);
    /* zonder beweging (een kleine helm in een lijst) een keer tekenen is genoeg, maar de lus kost dan bijna niets: hij tekent alleen als er iets verandert */
    if (!loopt){ loopt = true; requestAnimationFrame(lus); }
    return { zet: function(p){ h.zet(p); }, open: function(ja){ h.zetOpen(ja); }, stop: function(){ alle = alle.filter(function(x){ return x !== h; }); } };
  }
  return { maak: maak };
})();
