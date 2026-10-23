/* Topografie met je eigen plekken: de kaart om aan te tikken, de plekken van
   een set, en toetsvragen. Gedeeld door maken.html (de docent kiest plekken en
   maakt er een toets van) en oefen.html (de leerling maakt die toets). De
   kaarten zelf staan in topo-kaarten.js; TOPO.laad haalt die pas als het moet.

     TOPO.laad(klaar)                    topo-kaarten.js erbij, dan klaar()
     TOPO.VOLGORDE                       de kaarten zoals ze in een keuzelijst staan
     TOPO.sleutel(kaartId, l)            hoe een plek in een set staat: de naam, op de gemengde kaart met wat het is
     TOPO.plek(kaartId, sleutel)         de plek bij een sleutel (of null)
     TOPO.dichtsbij(kaartId, x, y)       de plek met dit middelpunt: een toets noemt een gekleurde plek niet bij naam
     TOPO.beoordeel(gegeven, namen)      'goed', 'bijna' (telt als goed), 'fout' of 'leeg', zoals in topografie.html
     TOPO.kaart(el, kaartId, opts)       een kaart om aan te tikken, met zoomen; zie onder
     TOPO.vragen(kaartId, sleutels, o)   toetsvragen (vorm 'topo') over deze plekken
     TOPO.vraag(kaartId, l, wijze, pool) een toetsvraag over een plek
     TOPO.woord / meervoud / naamMet     taal bij een kaart

   Een toetsvraag: { vorm:'topo', kaart, plek (de sleutel), naam, namen (alle goede
   namen), wat, wijze ('wijs' aanwijzen, 'typ' de naam typen, 'kies' uit vier),
   x, y (het middelpunt), fout (drie andere namen bij kiezen), vraag }.
   De server (server/materiaal.js) rekent hem na. */
var TOPO = (function(){
  'use strict';
  var VOLGORDE = ['nlp', 'nlh', 'nlw', 'nlr', 'nla', 'eu', 'euh', 'wl', 'wlh'];
  var MEER = { land:'landen', provincie:'provincies', stad:'steden', hoofdstad:'hoofdsteden', rivier:'rivieren', eiland:'eilanden', onderdeel:'onderdelen' };
  var HET = { land:1, eiland:1, onderdeel:1 };
  /* Delen van de wereld, dezelfde als in topografie.html: een snelknop bij het kiezen. */
  var DELEN = [
    { id:'afrika', naam:'Afrika', landen:['Marokko','Algerije','Tunesië','Libië','Egypte','Soedan','Ethiopië','Kenia','Somalië',
      'Tanzania','Nigeria','Ghana','Senegal','Mali','Niger','Tsjaad','Congo','Angola','Zuid-Afrika','Madagaskar','Zimbabwe',
      'Mozambique','Namibië','Oeganda'] },
    { id:'azie', naam:'Azië', landen:['China','India','Japan','Indonesië','Pakistan','Bangladesh','Vietnam','Thailand','Filipijnen',
      'Maleisië','Myanmar','Zuid-Korea','Noord-Korea','Mongolië','Kazachstan','Afghanistan','Iran','Irak','Saoedi-Arabië',
      'Israël','Syrië','Nepal','Sri Lanka','Oezbekistan','Jemen'] },
    { id:'noordam', naam:'Noord- en Midden-Amerika', landen:['Verenigde Staten','Canada','Mexico','Cuba','Guatemala','Panama'] },
    { id:'zuidam', naam:'Zuid-Amerika', landen:['Brazilië','Argentinië','Chili','Peru','Colombia','Venezuela','Bolivia',
      'Suriname','Ecuador','Uruguay','Paraguay'] }
  ];
  var NS = 'http://www.w3.org/2000/svg';
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), h = a[i]; a[i] = a[j]; a[j] = h; } return a; }

  /* ---------- laden ---------- */
  var wachtrij = null;
  function laad(klaar){
    if (window.KAARTEN){ klaar(); return; }
    if (wachtrij){ wachtrij.push(klaar); return; }
    wachtrij = [klaar];
    var s = document.createElement('script');
    var hier = (document.querySelector('script[src*="topo-eigen.js"]') || {}).src || '';
    s.src = hier ? hier.replace(/topo-eigen\.js.*$/, 'topo-kaarten.js') : 'topo-kaarten.js';
    s.onload = s.onerror = function(){ var l = wachtrij; wachtrij = null; l.forEach(function(f){ try { f(); } catch (e){ setTimeout(function(){ throw e; }); } }); };
    document.head.appendChild(s);
  }

  /* ---------- taal en plekken ---------- */
  function kaartVan(k){ return window.KAARTEN && KAARTEN[k] || null; }
  function soortVan(m, l){ return (l && l.s) || m.soort || 'vlak'; }
  function watVan(m, l){ return (l && l.w) || m.wat || 'land'; }
  function gemengd(m){ return m.soort === 'gemengd'; }
  function sleutel(k, l){ var m = kaartVan(k); return m && gemengd(m) ? l.n + ' (' + watVan(m, l) + ')' : l.n; }
  function naamMet(k, l){ return sleutel(k, l); }
  function plek(k, s){ var m = kaartVan(k); if (!m) return null; for (var i = 0; i < m.landen.length; i++) if (sleutel(k, m.landen[i]) === s) return m.landen[i]; return null; }
  function dichtsbij(k, x, y){
    var m = kaartVan(k); if (!m) return null;
    var beste = null, bd = Infinity;
    m.landen.forEach(function(l){ var d = Math.hypot(l.x - x, l.y - y); if (d < bd){ bd = d; beste = l; } });
    return beste;
  }
  function woord(k){ var m = kaartVan(k); return (m && m.wat) || 'land'; }
  function meervoud(k){ return MEER[woord(k)] || 'plekken'; }
  /* de plekken van een deel van de wereld; een hoofdstad hoort bij het land dat er het dichtst bij ligt */
  function inDeel(k, l, deel){
    if (k === 'wl') return deel.landen.indexOf(l.n) >= 0;
    if (k !== 'wlh' || !kaartVan('wl')) return false;
    var beste = null, bd = Infinity;
    KAARTEN.wl.landen.forEach(function(w){ var d = Math.hypot(w.x - l.x, w.y - l.y); if (d < bd){ bd = d; beste = w.n; } });
    return deel.landen.indexOf(beste) >= 0;
  }

  /* ---------- namen vergelijken (zoals topografie.html) ----------
     Hoofdletters, accenten, streepjes, spaties en een lidwoord tellen niet.
     Een typefout telt als goed vanaf zes letters, twee vanaf twaalf. */
  function plat(s){
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/^\s*(de|het|'t)\s+/, '').replace(/[^a-z0-9]/g, '');
  }
  function afstand(a, b){
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > 2) return 9;
    var vorige = [], nu = [], i, j;
    for (j = 0; j <= b.length; j++) vorige[j] = j;
    for (i = 1; i <= a.length; i++){
      nu = [i];
      for (j = 1; j <= b.length; j++) nu[j] = Math.min(vorige[j] + 1, nu[j - 1] + 1, vorige[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      vorige = nu;
    }
    return vorige[b.length];
  }
  function marge(n){ return n >= 12 ? 2 : (n >= 6 ? 1 : 0); }
  function beoordeel(gegeven, namen){
    var g = plat(gegeven); if (!g) return 'leeg';
    namen = namen || [];
    for (var i = 0; i < namen.length; i++) if (plat(namen[i]) === g) return 'goed';
    for (var j = 0; j < namen.length; j++){ var p = plat(namen[j]); if (p && afstand(g, p) <= marge(p.length)) return 'bijna'; }
    return 'fout';
  }

  /* ---------- toetsvragen ---------- */
  function lid(w){ return HET[w] ? 'het ' : 'de '; }
  function vraagTekst(k, l, wijze){
    var m = kaartVan(k), w = watVan(m, l), so = soortVan(m, l);
    if (wijze === 'wijs'){
      var wie = gemengd(m) ? lid(w) + w + ' ' + l.n : (w === 'rivier' ? 'de ' + l.n : l.n);
      return 'Wijs ' + wie + ' aan op de kaart.';
    }
    var vr = (HET[w] ? 'Welk ' : 'Welke ') + w + ' is ' + (so === 'vlak' ? 'gekleurd' : 'aangegeven') + ' op de kaart?';
    return wijze === 'typ' ? vr + ' Typ de naam.' : vr;
  }
  /* drie andere namen van hetzelfde soort; eerst uit de set, dan van de hele kaart */
  function afleiders(k, l, pool){
    var m = kaartVan(k), w = watVan(m, l), gezien = {}, uit = [];
    gezien[l.n.toLowerCase()] = 1;
    function neem(lijst){ schud(lijst).forEach(function(x){ if (uit.length >= 3 || !x || watVan(m, x) !== w || gezien[x.n.toLowerCase()]) return; gezien[x.n.toLowerCase()] = 1; uit.push(x.n); }); }
    neem((pool || []).map(function(s){ return typeof s === 'string' ? plek(k, s) : s; }));
    neem(m.landen);
    return uit;
  }
  function vraag(k, l, wijze, pool){
    var m = kaartVan(k);
    return { vorm:'topo', kaart:k, plek:sleutel(k, l), naam:l.n, namen:[l.n].concat(l.a || []), wat:watVan(m, l), wijze:wijze,
      x:l.x, y:l.y, fout: wijze === 'kies' ? afleiders(k, l, pool) : [], vraag:vraagTekst(k, l, wijze), uitleg:'', punten:1 };
  }
  /* Elke plek een keer, op de vormen om de beurt; mogen er meer vragen, dan
     komt elke plek ook op een andere manier terug. Nooit twee keer dezelfde
     plek op dezelfde manier. */
  function vragen(k, sleutels, o){
    o = o || {};
    var vormen = (o.vormen && o.vormen.length ? o.vormen : ['wijs']).slice();
    var plekken = schud(sleutels.map(function(s){ return plek(k, s); }).filter(Boolean));
    var max = plekken.length * vormen.length, n = Math.max(1, Math.min(o.aantal || plekken.length, max));
    var paren = [];
    for (var r = 0; r < vormen.length; r++) plekken.forEach(function(l, j){ paren.push([l, vormen[(j + r) % vormen.length]]); });
    return schud(paren.slice(0, n)).map(function(p){ return vraag(k, p[0], p[1], sleutels); });
  }

  /* ---------- de kaart om aan te tikken ----------
     TOPO.kaart(el, kaartId, opts) tekent de kaart in el, met + en − om te zoomen,
     het wiel, slepen en knijpen. opts:
       tik(l)          bij een tik of Enter: de plek die daar ligt (null: niets)
       toetsenbord     de pijltjes springen van plek naar plek, Enter wijst aan
       label           wat een schermlezer over de kaart hoort
     Terug: { zet(l, staat), staat(l), naar(l), pas(), svg }.
     De staat is een klasse op de plek: in (in de set), uit (niet in de set),
     op (de vraag), gekozen (aangewezen), goed, fout. Een kleine plek krijgt
     er een ring omheen, zodat je hem ziet. */
  function kaart(el, k, opts){
    opts = opts || {};
    var m = kaartVan(k);
    if (!m){ el.innerHTML = '<p class="melding fout">Deze kaart kon niet laden. Ververs de pagina.</p>'; return null; }
    var h = '<div class="tk-doos' + (opts.tik ? ' tik' : '') + '"><svg class="tk-svg" viewBox="0 0 ' + m.breed + ' ' + m.hoog + '" role="' + (opts.toetsenbord ? 'application' : 'img') + '" aria-label="' + schoon(opts.label || 'Kaart van ' + m.naam) + '"' + (opts.toetsenbord ? ' tabindex="0"' : '') + '>';
    if (m.achter) h += '<path class="tk-achter" d="' + m.achter + '"/>';
    if (m.basisVan && KAARTEN[m.basisVan]) KAARTEN[m.basisVan].landen.forEach(function(l){ if (l.d) h += '<path class="tk-basis" d="' + l.d + '"/>'; });
    var lagen = { vlak:'', lijn:'', punt:'' };
    m.landen.forEach(function(l, i){
      var so = soortVan(m, l);
      if (so === 'vlak'){ if (l.d) lagen.vlak += '<path class="tk-vlak" data-i="' + i + '" d="' + l.d + '"/>'; }
      else if (so === 'lijn'){ if (l.d) lagen.lijn += '<path class="tk-lijn" data-i="' + i + '" d="' + l.d + '"/>'; }
      else lagen.punt += '<circle class="tk-punt" data-i="' + i + '" cx="' + l.x + '" cy="' + l.y + '" r="5"/>';
    });
    h += '<g class="tk-vlakken">' + lagen.vlak + '</g><g class="tk-lijnen">' + lagen.lijn + '</g><g class="tk-ringen"></g><g class="tk-punten">' + lagen.punt + '</g>' +
      '<circle class="tk-kruis" r="16"/></svg>' +
      '<div class="tk-zoom" role="group" aria-label="Zoomen"><button type="button" data-z="in" aria-label="Inzoomen">+</button><button type="button" data-z="uit" aria-label="Uitzoomen">&minus;</button>' +
      '<button type="button" data-z="heel" aria-label="Hele kaart"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button></div>' +
      '<p class="sronly tk-live" aria-live="polite"></p></div>';
    el.innerHTML = h;
    var svg = el.querySelector('svg'), ringen = svg.querySelector('.tk-ringen'), kruis = svg.querySelector('.tk-kruis');
    var staten = {}, ringVan = {}, basis = null, zoom = 1, midden = { x: m.breed / 2, y: m.hoog / 2 }, ZOOM_MAX = 8, TIK = 22;
    function elVan(l){ return svg.querySelector('[data-i="' + m.landen.indexOf(l) + '"]'); }
    function klein(l){ return soortVan(m, l) === 'punt' || !!l.k; }

    /* uitsnede: alles behalve de achtergrond (bij de wereld: geen Antarctica) */
    function snij(){
      var sel = m.achter ? svg.querySelectorAll('.tk-vlak,.tk-basis,.tk-lijn,.tk-punt') : [svg];
      var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
      Array.prototype.forEach.call(sel, function(e){
        if (e === svg){ x1 = 0; y1 = 0; x2 = m.breed; y2 = m.hoog; return; }
        try { var b = e.getBBox(); if (!b.width && !b.height && e.tagName !== 'circle') return;
          x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height); } catch (x){}
      });
      if (!isFinite(x1) || x2 - x1 < 1) return null;
      var rand = Math.max(x2 - x1, y2 - y1) * .03 + 6;
      return { x: x1 - rand, y: y1 - rand, w: x2 - x1 + 2 * rand, h: y2 - y1 + 2 * rand };
    }
    function schaal(){ var c = svg.getScreenCTM(); return (c && c.a) || 1; }
    function zetView(){
      if (!basis) return;
      zoom = Math.max(1, Math.min(ZOOM_MAX, zoom));
      var w = basis.w / zoom, hh = basis.h / zoom;
      midden.x = Math.max(basis.x + w / 2, Math.min(basis.x + basis.w - w / 2, midden.x));
      midden.y = Math.max(basis.y + hh / 2, Math.min(basis.y + basis.h - hh / 2, midden.y));
      svg.setAttribute('viewBox', (midden.x - w / 2).toFixed(2) + ' ' + (midden.y - hh / 2).toFixed(2) + ' ' + w.toFixed(2) + ' ' + hh.toFixed(2));
      /* niet ingezoomd: met een vinger scrol je gewoon de pagina; ingezoomd schuif je de kaart */
      svg.style.touchAction = zoom > 1 ? 'none' : 'pan-y';
      var zi = el.querySelector('[data-z="in"]'), zu = el.querySelector('[data-z="uit"]'), zh = el.querySelector('[data-z="heel"]');
      zi.disabled = zoom >= ZOOM_MAX; zu.disabled = zoom <= 1; zh.disabled = zoom <= 1;
      stralen();
    }
    /* stippen en ringen houden hun maat op het scherm */
    function px(n){ return (n / schaal()).toFixed(2); }
    function stralen(){
      if (!svg.getScreenCTM()) return;
      Array.prototype.forEach.call(svg.querySelectorAll('.tk-punt'), function(c){ var s = staten[c.getAttribute('data-i')]; c.setAttribute('r', px(s && s !== 'in' && s !== 'uit' ? 8 : 5.5)); });
      Array.prototype.forEach.call(ringen.querySelectorAll('circle'), function(c){ c.setAttribute('r', px(15)); });
      kruis.setAttribute('r', px(18));
    }
    function pas(){
      if (!basis){ basis = snij(); if (!basis) return; midden = { x: basis.x + basis.w / 2, y: basis.y + basis.h / 2 }; }
      svg.style.aspectRatio = (basis.w / basis.h).toFixed(4);
      zetView();
    }
    function naarSvg(cx, cy){ var p = svg.createSVGPoint(); p.x = cx; p.y = cy; return p.matrixTransform(svg.getScreenCTM().inverse()); }
    function zoomRond(f, cx, cy){
      if (!basis) return;
      var voor = naarSvg(cx, cy); zoom *= f; zetView();
      var na = naarSvg(cx, cy); midden.x += voor.x - na.x; midden.y += voor.y - na.y; zetView();
    }
    function knopZoom(f){ var r = svg.getBoundingClientRect(); zoomRond(f, r.left + r.width / 2, r.top + r.height / 2); }
    el.querySelector('[data-z="in"]').addEventListener('click', function(){ knopZoom(1.6); });
    el.querySelector('[data-z="uit"]').addEventListener('click', function(){ knopZoom(1 / 1.6); });
    el.querySelector('[data-z="heel"]').addEventListener('click', function(){ if (!basis) return; zoom = 1; midden = { x: basis.x + basis.w / 2, y: basis.y + basis.h / 2 }; zetView(); });
    /* het wiel zoomt met Ctrl erbij, of als je al ingezoomd bent; anders scrolt de pagina gewoon door */
    svg.addEventListener('wheel', function(e){ if (!e.ctrlKey && zoom <= 1) return; e.preventDefault(); zoomRond(e.deltaY < 0 ? 1.25 : 1 / 1.25, e.clientX, e.clientY); }, { passive:false });

    /* wat ligt er op dit punt: een stip of rivier binnen een vingerbreedte, anders het vlak eronder */
    var lijnPunten = {};
    function puntenVan(i){
      if (lijnPunten[i]) return lijnPunten[i];
      var p = svg.querySelector('[data-i="' + i + '"]'), uit = [];
      try { var len = p.getTotalLength(); for (var t = 0; t <= 80; t++){ var q = p.getPointAtLength(len * t / 80); uit.push({ x:q.x, y:q.y }); } } catch (x){}
      return (lijnPunten[i] = uit);
    }
    function watIsHier(pt){
      var tol = TIK / schaal(), beste = null, bd = Infinity;
      m.landen.forEach(function(l, i){
        var so = soortVan(m, l), d = Infinity;
        if (so === 'punt') d = Math.hypot(pt.x - l.x, pt.y - l.y);
        else if (so === 'lijn') d = puntenVan(i).reduce(function(a, q){ return Math.min(a, Math.hypot(pt.x - q.x, pt.y - q.y)); }, Infinity);
        if (d <= tol && d < bd){ bd = d; beste = l; }
      });
      if (beste) return beste;
      for (var i = m.landen.length - 1; i >= 0; i--){
        if (soortVan(m, m.landen[i]) !== 'vlak') continue;
        var p = svg.querySelector('[data-i="' + i + '"]');
        try { if (p && p.isPointInFill(new DOMPoint(pt.x, pt.y))) return m.landen[i]; } catch (x){}
      }
      m.landen.forEach(function(l){ if (l.k && soortVan(m, l) === 'vlak'){ var d = Math.hypot(pt.x - l.x, pt.y - l.y); if (d <= tol * 1.2 && d < bd){ bd = d; beste = l; } } });
      return beste;
    }

    /* slepen en knijpen; een tik zonder schuiven wijst aan */
    var wijzers = {}, begin = null, knijp = null, geschoven = false;
    function aantal(){ return Object.keys(wijzers).length; }
    function twee(){ var ks = Object.keys(wijzers); return [wijzers[ks[0]], wijzers[ks[1]]]; }
    svg.addEventListener('pointerdown', function(e){
      wijzers[e.pointerId] = { x:e.clientX, y:e.clientY };
      if (aantal() === 1){ begin = { x:e.clientX, y:e.clientY, mx:midden.x, my:midden.y }; geschoven = false; knijp = null; if (zoom > 1){ try { svg.setPointerCapture(e.pointerId); } catch (x){} } }
      else if (aantal() === 2){ var t = twee(); knijp = { d: Math.hypot(t[0].x - t[1].x, t[0].y - t[1].y) || 1, z: zoom }; geschoven = true; }
    });
    svg.addEventListener('pointermove', function(e){
      if (!wijzers[e.pointerId]) return;
      wijzers[e.pointerId] = { x:e.clientX, y:e.clientY };
      if (knijp && aantal() >= 2){
        var t = twee(), d = Math.hypot(t[0].x - t[1].x, t[0].y - t[1].y);
        zoomRond((knijp.z * d / knijp.d) / zoom, (t[0].x + t[1].x) / 2, (t[0].y + t[1].y) / 2);
      } else if (begin && aantal() === 1){
        var dx = e.clientX - begin.x, dy = e.clientY - begin.y;
        if (Math.abs(dx) + Math.abs(dy) > 8) geschoven = true;
        if (geschoven && zoom > 1){ var s = schaal(); midden.x = begin.mx - dx / s; midden.y = begin.my - dy / s; zetView(); }
      }
    });
    function los(e){
      var was = wijzers[e.pointerId]; delete wijzers[e.pointerId];
      if (!was) return;
      if (aantal() === 0){
        if (!geschoven && !knijp && e.type === 'pointerup' && opts.tik) opts.tik(watIsHier(naarSvg(e.clientX, e.clientY)));
        begin = null; knijp = null;
      }
    }
    svg.addEventListener('pointerup', los);
    svg.addEventListener('pointercancel', los);

    /* met het toetsenbord: de pijltjes springen naar de dichtstbijzijnde plek in die richting */
    var kruisLand = null;
    function zetKruis(l){
      kruisLand = l; if (!l) return;
      kruis.setAttribute('cx', l.x); kruis.setAttribute('cy', l.y); kruis.setAttribute('r', px(18));
      kruis.setAttribute('class', 'tk-kruis aan');
      naar(l);
      el.querySelector('.tk-live').textContent = opts.noem ? opts.noem(l) : 'Plek ' + (m.landen.indexOf(l) + 1) + '. Enter wijst hem aan.';
    }
    function stap(dx, dy){
      var beste = null, score = Infinity;
      if (!kruisLand || (!dx && !dy)){
        var c = kruisLand || midden;
        m.landen.forEach(function(l){ var d = Math.hypot(l.x - c.x, l.y - c.y); if (d < score){ score = d; beste = l; } });
      } else {
        m.landen.forEach(function(l){
          if (l === kruisLand) return;
          var vx = l.x - kruisLand.x, vy = l.y - kruisLand.y, voor = vx * dx + vy * dy;
          if (voor <= 0) return;
          var sc = voor + 2.5 * Math.abs(vx * dy - vy * dx);
          if (sc < score){ score = sc; beste = l; }
        });
        if (!beste){ el.querySelector('.tk-live').textContent = 'Verder die kant op ligt niets.'; return; }
      }
      zetKruis(beste);
    }
    if (opts.toetsenbord){
      svg.addEventListener('keydown', function(e){
        var r = { ArrowLeft:[-1, 0], ArrowRight:[1, 0], ArrowUp:[0, -1], ArrowDown:[0, 1] }[e.key];
        if (r){ e.preventDefault(); stap(r[0], r[1]); return; }
        if ((e.key === 'Enter' || e.key === ' ') && kruisLand && opts.tik){ e.preventDefault(); opts.tik(kruisLand); }
      });
      svg.addEventListener('focus', function(){
        var toets = true; try { toets = svg.matches(':focus-visible'); } catch (x){}
        if (toets){ if (kruisLand) zetKruis(kruisLand); else stap(0, 0); }
      });
      svg.addEventListener('blur', function(){ kruis.setAttribute('class', 'tk-kruis'); });
    }

    /* de staat van een plek, met een ring om iets kleins */
    function zet(l, s){
      if (!l) return;
      var i = m.landen.indexOf(l), e = elVan(l); if (i < 0) return;
      s = s || '';
      if (s) staten[i] = s; else delete staten[i];
      if (e){
        var g = soortVan(m, l) === 'vlak' ? 'tk-vlak' : soortVan(m, l) === 'lijn' ? 'tk-lijn' : 'tk-punt';
        e.setAttribute('class', g + (s ? ' ' + s : ''));
        /* naar voren binnen zijn laag, zodat de rand niet onder een buur verdwijnt */
        if (s && s !== 'in' && s !== 'uit') e.parentNode.appendChild(e);
      }
      /* gekozen in de set: alleen een piepklein land (Luxemburg, Malta) krijgt een ring; een stip is al blauw */
      var heeftRing = s && s !== 'uit' && klein(l) && (s !== 'in' || soortVan(m, l) === 'vlak');
      if (ringVan[i] && !heeftRing){ ringVan[i].remove(); delete ringVan[i]; }
      if (heeftRing){
        if (!ringVan[i]){ ringVan[i] = document.createElementNS(NS, 'circle'); ringVan[i].setAttribute('cx', l.x); ringVan[i].setAttribute('cy', l.y); ringen.appendChild(ringVan[i]); }
        ringVan[i].setAttribute('class', 'tk-ring ' + s); ringVan[i].setAttribute('r', px(15));
      }
      if (soortVan(m, l) === 'punt' && e) e.setAttribute('r', px(s && s !== 'in' && s !== 'uit' ? 8 : 5.5));
    }
    function staat(l){ return staten[m.landen.indexOf(l)] || ''; }
    /* ingezoomd en de plek ligt buiten beeld: de kaart schuift ernaartoe */
    function naar(l){
      if (!l || !basis || zoom <= 1) return;
      var w = basis.w / zoom, hh = basis.h / zoom;
      if (Math.abs(l.x - midden.x) > w * .42 || Math.abs(l.y - midden.y) > hh * .42){ midden = { x:l.x, y:l.y }; zetView(); }
    }
    var opnieuw = function(){ if (!document.body.contains(svg)){ removeEventListener('resize', opnieuw); return; } stralen(); };
    addEventListener('resize', opnieuw);
    /* pas als hij zichtbaar is weet de kaart zijn maat */
    pas(); requestAnimationFrame(pas);
    return { svg: svg, zet: zet, staat: staat, naar: naar, pas: pas, kaart: m };
  }

  return { laad: laad, VOLGORDE: VOLGORDE, DELEN: DELEN, sleutel: sleutel, plek: plek, dichtsbij: dichtsbij, naamMet: naamMet,
    beoordeel: beoordeel, kaart: kaart, vragen: vragen, vraag: vraag, vraagTekst: vraagTekst, woord: woord, meervoud: meervoud,
    soortVan: function(k, l){ return soortVan(kaartVan(k), l); }, watVan: function(k, l){ return watVan(kaartVan(k), l); }, inDeel: inDeel, schud: schud };
})();
