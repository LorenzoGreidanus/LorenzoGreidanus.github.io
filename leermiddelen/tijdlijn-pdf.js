/* ============================================================================
   TIJDLIJN-PDF: maakt van een tijdlijn een PDF, zonder bibliotheek van buiten.
   Pagina 1 is de tijdlijn op schaal (A4 liggend), daarna per gebeurtenis de uitleg
   met de afbeelding. De tijdlijn zelf zit als data in de PDF (tussen TLJSON-tekens),
   zodat de Tijdlijnmaker de PDF later weer kan openen om verder te werken.

   TIJDLIJN_PDF.maak(model) -> Uint8Array
   TIJDLIJN_PDF.lees(bytes) -> model of null
   Letters: Helvetica (zit in elke PDF-lezer), tekens volgens WinAnsi.
   Afbeeldingen: alleen JPEG (de Tijdlijnmaker maakt van elke foto een JPEG).
   ============================================================================ */
(function(g){
  'use strict';
  var T = g.TIJDLIJN || (typeof require !== 'undefined' ? require('./tijdlijn-motor.js') : null);

  /* breedtes van Helvetica en Helvetica-Bold (tekens 32 t/m 126), per 1000 */
  var W_N = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
  var W_B = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
  /* letters met een accent zijn even breed als de letter zonder */
  var BASIS = { 'à':'a','á':'a','â':'a','ä':'a','ã':'a','å':'a','è':'e','é':'e','ê':'e','ë':'e','ì':'i','í':'i','î':'i','ï':'i','ò':'o','ó':'o','ô':'o','ö':'o','õ':'o','ù':'u','ú':'u','û':'u','ü':'u','ç':'c','ñ':'n','ý':'y','ÿ':'y',
    'À':'A','Á':'A','Â':'A','Ä':'A','È':'E','É':'E','Ê':'E','Ë':'E','Ì':'I','Í':'I','Î':'I','Ï':'I','Ò':'O','Ó':'O','Ô':'O','Ö':'O','Ù':'U','Ú':'U','Û':'U','Ü':'U','Ç':'C','Ñ':'N' };
  /* tekens die WinAnsi anders codeert dan Latin-1 */
  var WIN = { '€':128,'‚':130,'„':132,'…':133,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'™':153 };

  function tekenBreed(c, vet){
    var code = c.charCodeAt(0);
    if (BASIS[c]) code = BASIS[c].charCodeAt(0);
    var tab = vet ? W_B : W_N;
    if (code >= 32 && code <= 126) return tab[code - 32];
    if (c === '’' || c === '‘') return 222; if (c === '“' || c === '”') return 333; if (c === '–') return 556; if (c === '—') return 1000; if (c === '…') return 1000;
    return 556;
  }
  function breedte(s, pt, vet){ var w = 0; s = String(s); for (var i = 0; i < s.length; i++) w += tekenBreed(s[i], vet); return w * pt / 1000; }
  /* tekst naar bytes voor in een PDF-string: WinAnsi, met \ ( ) ontsnapt */
  function pdfTekst(s){
    var uit = '';
    s = String(s).replace(/[\u2028\u2029\r\n\t]+/g, ' ');
    for (var i = 0; i < s.length; i++){
      var c = s[i], code = c.charCodeAt(0);
      if (WIN[c]) code = WIN[c];
      else if (code > 255) code = 63; /* ? voor wat Helvetica niet heeft */
      if (code === 40 || code === 41 || code === 92) uit += '\\' + c;
      else if (code < 32) uit += ' ';
      else if (code > 126) uit += '\\' + ('00' + code.toString(8)).slice(-3);
      else uit += c;
    }
    return uit;
  }
  /* tekst in regels die passen; woorden die te lang zijn worden afgebroken */
  function regels(s, max, pt, vet){
    var woorden = String(s || '').split(/\s+/).filter(Boolean), uit = [], r = '';
    woorden.forEach(function(w){
      while (breedte(w, pt, vet) > max && w.length > 1){
        var k = w.length; while (k > 1 && breedte(w.slice(0, k) + '-', pt, vet) > max) k--;
        if (r){ uit.push(r); r = ''; }
        uit.push(w.slice(0, k) + '-'); w = w.slice(k);
      }
      var test = r ? r + ' ' + w : w;
      if (breedte(test, pt, vet) <= max) r = test; else { if (r) uit.push(r); r = w; }
    });
    if (r) uit.push(r);
    return uit;
  }

  function kleur(hex){ var h = hex.replace('#', ''); return [0, 2, 4].map(function(i){ return (parseInt(h.substr(i, 2), 16) / 255).toFixed(3); }).join(' '); }

  /* ---------- een pagina tekenen (in punten, oorsprong linksboven zoals op het scherm) ---------- */
  function Pagina(B, H){ this.B = B; this.H = H; this.ops = []; this.fotos = []; }
  Pagina.prototype = {
    y: function(y){ return (this.H - y).toFixed(2); },
    vlak: function(x, y, w, h, vul, lijn, dik, r){
      r = Math.min(r || 0, w / 2, h / 2);
      var o = this.ops;
      if (vul) o.push(kleur(vul) + ' rg');
      if (lijn){ o.push(kleur(lijn) + ' RG'); o.push((dik || 1).toFixed(2) + ' w'); }
      if (r > 0){
        var k = 0.5523 * r, X1 = x, X2 = x + w, Y1 = y, Y2 = y + h, self = this;
        var p = function(a, b){ return a.toFixed(2) + ' ' + self.y(b); };
        o.push(p(X1 + r, Y1) + ' m');
        o.push(p(X2 - r, Y1) + ' l'); o.push(p(X2 - r + k, Y1) + ' ' + p(X2, Y1 + r - k) + ' ' + p(X2, Y1 + r) + ' c');
        o.push(p(X2, Y2 - r) + ' l'); o.push(p(X2, Y2 - r + k) + ' ' + p(X2 - r + k, Y2) + ' ' + p(X2 - r, Y2) + ' c');
        o.push(p(X1 + r, Y2) + ' l'); o.push(p(X1 + r - k, Y2) + ' ' + p(X1, Y2 - r + k) + ' ' + p(X1, Y2 - r) + ' c');
        o.push(p(X1, Y1 + r) + ' l'); o.push(p(X1, Y1 + r - k) + ' ' + p(X1 + r - k, Y1) + ' ' + p(X1 + r, Y1) + ' c');
      } else o.push(x.toFixed(2) + ' ' + this.y(y + h) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re');
      o.push(vul && lijn ? 'B' : vul ? 'f' : 'S');
    },
    lijn: function(x1, y1, x2, y2, kl, dik){ this.ops.push(kleur(kl) + ' RG', (dik || 1).toFixed(2) + ' w', x1.toFixed(2) + ' ' + this.y(y1) + ' m', x2.toFixed(2) + ' ' + this.y(y2) + ' l', 'S'); },
    rondje: function(cx, cy, r, vul, lijn, dik){ this.vlak(cx - r, cy - r, 2 * r, 2 * r, vul, lijn, dik, r); },
    tekst: function(x, y, s, pt, kl, vet, uitlijn){
      var w = breedte(s, pt, vet), x0 = uitlijn === 'midden' ? x - w / 2 : uitlijn === 'rechts' ? x - w : x;
      this.ops.push('BT', kleur(kl || '#14224C') + ' rg', '/' + (vet ? 'F2' : 'F1') + ' ' + pt + ' Tf', x0.toFixed(2) + ' ' + this.y(y) + ' Td', '(' + pdfTekst(s) + ') Tj', 'ET');
    },
    foto: function(f, x, y, w, h){ var n = 'Im' + f.nr; this.fotos.push(f); this.ops.push('q', w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + this.y(y + h) + ' cm', '/' + n + ' Do', 'Q'); }
  };

  /* ---------- JPEG: grootte uitlezen en de bytes eruit halen ---------- */
  function b64NaarBytes(b64){
    if (typeof atob === 'function'){ var s = atob(b64), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }
  function jpegMaat(u){
    var i = 2;
    while (i < u.length){
      if (u[i] !== 0xFF){ i++; continue; }
      var mk = u[i + 1], len = (u[i + 2] << 8) | u[i + 3];
      if (mk >= 0xC0 && mk <= 0xCF && mk !== 0xC4 && mk !== 0xC8 && mk !== 0xCC) return { h: (u[i + 5] << 8) | u[i + 6], w: (u[i + 7] << 8) | u[i + 8], kanalen: u[i + 9] };
      i += 2 + len;
    }
    return null;
  }
  function leesFoto(src){
    var m = /^data:image\/jpeg;base64,(.+)$/.exec(src || ''); if (!m) return null;
    var u = b64NaarBytes(m[1]), maat = jpegMaat(u); if (!maat || !maat.w) return null;
    return { bytes: u, w: maat.w, h: maat.h, kanalen: maat.kanalen };
  }

  /* ---------- de inhoud ---------- */
  var INK = '#14224C', GRIJS = '#5A6488', LICHT = '#E4E6EE', ZAND = '#FCDED6';
  var A4B = 842, A4H = 595, M = 36;

  function voet(p, nr, tot){
    p.lijn(M, A4H - 30, A4B - M, A4H - 30, LICHT, 0.8);
    p.tekst(M, A4H - 17, 'Gemaakt met de Tijdlijnmaker op meneergreidanus.nl. Open deze PDF daar om verder te werken.', 7.5, GRIJS);
    p.tekst(A4B - M, A4H - 17, nr + ' / ' + tot, 7.5, GRIJS, false, 'rechts');
  }

  function tijdlijnPagina(model, fotoNr){
    var p = new Pagina(A4B, A4H);
    p.tekst(M, M + 14, model.titel || 'Tijdlijn', 18, INK, true);
    var sub = [model.naam, model.klas, datumVandaag()].filter(Boolean).join(' · ');
    p.tekst(M, M + 32, sub, 9.5, GRIJS);
    /* legenda: alleen de soorten die erop staan */
    var gebruikt = {}; model.items.forEach(function(it){ gebruikt[it.cat] = true; });
    var lx = M, ly = M + 50;
    T.SOORTEN.filter(function(s){ return gebruikt[s.id]; }).forEach(function(s){
      p.rondje(lx + 4, ly - 3, 4, s.kleur); p.tekst(lx + 12, ly, s.naam, 8, INK); lx += 22 + breedte(s.naam, 8);
    });
    var b = T.bereik(model.items, model.bereik), beschikbaar = A4B - 2 * M, top = M + 66, ruimte = A4H - 44 - top;
    var meet = function(s, px){ return breedte(s, px * 0.8, true) + 2; };
    var o = { van: b.van, tot: b.tot, pxPerJaar: (beschikbaar - 48) / (b.tot - b.van), kaartBreed: 112, kaartHoog: 34, periodeHoog: 15, meet: meet, boven: 4 };
    var L = T.opmaak(model, o);
    var sch = Math.min(1, ruimte / L.hoog), ox = M + (beschikbaar - L.breed * sch) / 2, oy = top;
    var X = function(x){ return ox + x * sch; }, Y = function(y){ return oy + y * sch; }, S = function(v){ return v * sch; };
    /* tijdvakken */
    L.band.forEach(function(t, i){
      p.vlak(X(t.x1), Y(0), S(t.x2 - t.x1) - 1, S(20), i % 2 ? '#F7C9BD' : ZAND, null, 0, S(4));
      var naam = 'Tijdvak ' + t.nr + ' · ' + t.kort, w = S(t.x2 - t.x1) - 12;
      if (breedte(naam, S(8)) > w) naam = String(t.nr);
      if (breedte(naam, S(8)) <= w) p.tekst(X(t.x1) + 6, Y(13.5), naam, S(8), INK);
    });
    /* jaartallen */
    L.streepjes.forEach(function(s){ p.lijn(X(s.x), Y(L.band.length ? 24 : 0), X(s.x), Y(L.hoog - 18), '#ECEEF4', 0.6); p.tekst(X(s.x), Y(L.hoog - 6), s.tekst, S(8), GRIJS, false, 'midden'); });
    /* perioden */
    L.perioden.forEach(function(e){
      var s = T.SOORT[e.it.cat], h = L.periodeHoog;
      p.vlak(X(e.x1), Y(e.top), Math.max(1.5, S(e.x2 - e.x1)), S(h), s.kleur, null, 0, S(3));
      if (e.binnen) p.tekst(X(e.x1) + S(6), Y(e.top + h * 0.7), e.it.titel, S(8), s.tekst, true);
      else if (e.naastLinks) p.tekst(X(e.x1) - S(6), Y(e.top + h * 0.7), e.it.titel, S(8), INK, true, 'rechts');
      else p.tekst(X(e.x2) + S(6), Y(e.top + h * 0.7), e.it.titel, S(8), INK, true);
    });
    /* de as */
    p.vlak(X(0), Y(L.asY - 1.5), S(L.breed), S(3), INK, null, 0, S(1.5));
    /* kaartjes, stelen en stippen */
    L.gebeurt.forEach(function(e){
      var s = T.SOORT[e.it.cat], kb = L.kaartBreed, kh = L.kaartHoog;
      p.lijn(X(e.sx), Y(e.stamTop), X(e.sx), Y(e.stamBodem), s.kleur, S(1.2));
      if (e.sx !== e.x) p.lijn(X(e.x), Y(L.asY - 5), X(e.x), Y(L.asY + 5), INK, S(1));
      p.vlak(X(e.links), Y(e.top), S(kb), S(kh), '#FFFFFF', s.kleur, S(1.4), S(5));
      p.tekst(X(e.links + 6), Y(e.top + 11), T.datumTekst(e.it.van), S(7.5), INK, true);
      var rg = regels(e.it.titel, S(kb - 12), S(7.5));
      rg.slice(0, 2).forEach(function(r, k){ p.tekst(X(e.links + 6), Y(e.top + 21 + k * 9), k === 1 && rg.length > 2 ? r.replace(/.{0,2}$/, '…') : r, S(7.5), INK); });
      p.rondje(X(e.sx), Y(L.asY), S(9), s.kleur, '#FFFFFF', S(1.6));
      p.tekst(X(e.sx), Y(L.asY + 3), String(e.nr), S(8), s.tekst, true, 'midden');
    });
    return p;
  }

  function datumVandaag(){ var d = new Date(); return d.getDate() + ' ' + T.MAANDEN[d.getMonth()] + ' ' + d.getFullYear(); }

  /* de uitleg: per gebeurtenis en periode, op volgorde, in twee kolommen */
  function uitlegPaginas(model, fotos){
    var nrVan = T.nummers(model);
    var alles = model.items.slice().sort(function(a, b){ return T.beginVan(a) - T.beginVan(b); });
    var paginas = [], p = null, KOL = (A4B - 2 * M - 24) / 2, kol = 0, y = 0, BODEM = A4H - 44;
    function nieuwe(){ p = new Pagina(A4B, A4H); paginas.push(p); p.tekst(M, M + 12, 'Uitleg bij ' + (model.titel || 'de tijdlijn'), 13, INK, true); kol = 0; y = M + 30; }
    function plek(h){ if (!p) nieuwe(); if (y + h > BODEM){ if (kol === 0){ kol = 1; y = M + 30; } else nieuwe(); } return M + kol * (KOL + 24); }
    alles.forEach(function(it){
      var s = T.SOORT[it.cat], blokken = [];
      [['Wat gebeurde er?', it.wat], ['Waarom?', it.waarom], ['Wat kwam ervan?', it.gevolg]].forEach(function(v){ if (v[1] && v[1].trim()) blokken.push([v[0], regels(v[1], KOL - 14, 9)]); });
      var f = it.foto && fotos[it.id], fh = 0, fw = 0;
      if (f){ fw = Math.min(KOL - 14, 220); fh = fw * f.h / f.w; if (fh > 150){ fh = 150; fw = fh * f.w / f.h; } }
      var hoog = 36 + (fh ? fh + 18 : 0) + blokken.reduce(function(t, bl){ return t + 13 + bl[1].length * 12; }, 0) + (blokken.length ? 0 : 14) + 10;
      var x = plek(Math.min(hoog, BODEM - M - 30));
      var titelR = regels(it.titel, KOL - 40, 11, true);
      var nr = nrVan[it.id];
      if (nr){ p.rondje(x + 9, y + 8, 9, s.kleur); p.tekst(x + 9, y + 11, String(nr), 8.5, s.tekst, true, 'midden'); }
      else p.vlak(x, y + 3, 18, 10, s.kleur, null, 0, 3);
      var datum = it.soort === 'p' ? T.datumTekst(it.van) + ' tot ' + T.datumTekst(it.tot) : T.datumTekst(it.van);
      p.tekst(x + 26, y + 7, datum + ' · ' + s.naam, 8, GRIJS);
      titelR.forEach(function(r, k){ p.tekst(x + 26, y + 20 + k * 13, r, 11, INK, true); });
      y += 24 + titelR.length * 13;
      if (f){
        if (y + fh + 18 > BODEM){ x = plek(fh + 18 + 40); }
        p.foto(f, x + 26, y, fw, fh); y += fh + 4;
        if (it.foto.bron) regels('Bron: ' + it.foto.bron, KOL - 30, 7.5).forEach(function(r){ p.tekst(x + 26, y + 8, r, 7.5, GRIJS); y += 10; });
        y += 8;
      }
      blokken.forEach(function(bl){
        if (y + 25 > BODEM) x = plek(40);
        p.tekst(x + 26, y + 9, bl[0], 9, INK, true); y += 13;
        bl[1].forEach(function(r){ if (y + 12 > BODEM) x = plek(14); p.tekst(x + 26, y + 9, r, 9, INK); y += 12; });
        y += 4;
      });
      if (!blokken.length){ p.tekst(x + 26, y + 9, 'Nog geen uitleg.', 9, GRIJS); y += 14; }
      y += 14;
    });
    return paginas;
  }

  /* ---------- het PDF-bestand ---------- */
  function utf8(s){
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s);
    return new Uint8Array(Buffer.from(s, 'utf8'));
  }
  function b64(u){
    if (typeof btoa === 'function'){ var s = '', k = 0x8000; for (var i = 0; i < u.length; i += k) s += String.fromCharCode.apply(null, u.subarray(i, i + k)); return btoa(s); }
    return Buffer.from(u).toString('base64');
  }
  function latin(s){ var u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; }

  function maak(model){
    model = T.schoonModel(model);
    var fotos = {}, nr = 0;
    model.items.forEach(function(it){ if (it.foto){ var f = leesFoto(it.foto.src); if (f){ f.nr = ++nr; fotos[it.id] = f; } } });
    var paginas = [tijdlijnPagina(model)].concat(uitlegPaginas(model, fotos));
    paginas.forEach(function(p, i){ voet(p, i + 1, paginas.length); });

    var delen = [], lengte = 0, plekken = [];
    function schrijf(x){ var u = typeof x === 'string' ? latin(x) : x; delen.push(u); lengte += u.length; }
    var objecten = []; /* [nummer, maakFunctie] in volgorde */
    var n = 0; function nieuwNr(){ return ++n; }
    var CAT = nieuwNr(), PAGES = nieuwNr(), F1 = nieuwNr(), F2 = nieuwNr(), INFO = nieuwNr(), DATA = nieuwNr();
    var fotoObj = {}; Object.keys(fotos).forEach(function(id){ fotoObj[fotos[id].nr] = { nr: nieuwNr(), f: fotos[id] }; });
    var pagObj = paginas.map(function(){ return { pag: nieuwNr(), inh: nieuwNr() }; });

    schrijf('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    function obj(num, kop, stroom){
      plekken[num] = lengte;
      schrijf(num + ' 0 obj\n' + kop);
      if (stroom){ schrijf('\nstream\n'); schrijf(stroom); schrijf('\nendstream'); }
      schrijf('\nendobj\n');
    }
    obj(CAT, '<< /Type /Catalog /Pages ' + PAGES + ' 0 R >>');
    obj(PAGES, '<< /Type /Pages /Kids [' + pagObj.map(function(p){ return p.pag + ' 0 R'; }).join(' ') + '] /Count ' + paginas.length + ' >>');
    obj(F1, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    obj(F2, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    obj(INFO, '<< /Title (' + pdfTekst(model.titel) + ') /Author (' + pdfTekst(model.naam || '') + ') /Creator (Tijdlijnmaker meneergreidanus.nl) >>');
    /* de tijdlijn zelf, om de PDF later weer te openen */
    var json = b64(utf8(JSON.stringify(model)));
    var data = 'TLJSON:' + json + ':TLJSON';
    obj(DATA, '<< /Length ' + data.length + ' >>', data);
    Object.keys(fotoObj).forEach(function(k){
      var o = fotoObj[k], f = o.f;
      obj(o.nr, '<< /Type /XObject /Subtype /Image /Width ' + f.w + ' /Height ' + f.h + ' /ColorSpace /' + (f.kanalen === 1 ? 'DeviceGray' : 'DeviceRGB') + ' /BitsPerComponent 8 /Filter /DCTDecode /Length ' + f.bytes.length + ' >>', f.bytes);
    });
    paginas.forEach(function(p, i){
      var inhoud = p.ops.join('\n'), xo = {};
      p.fotos.forEach(function(f){ xo[f.nr] = fotoObj[f.nr].nr; });
      var res = '<< /Font << /F1 ' + F1 + ' 0 R /F2 ' + F2 + ' 0 R >>' + (p.fotos.length ? ' /XObject << ' + Object.keys(xo).map(function(k){ return '/Im' + k + ' ' + xo[k] + ' 0 R'; }).join(' ') + ' >>' : '') + ' >>';
      obj(pagObj[i].pag, '<< /Type /Page /Parent ' + PAGES + ' 0 R /MediaBox [0 0 ' + A4B + ' ' + A4H + '] /Resources ' + res + ' /Contents ' + pagObj[i].inh + ' 0 R >>');
      obj(pagObj[i].inh, '<< /Length ' + inhoud.length + ' >>', inhoud);
    });
    var xref = lengte;
    var x = 'xref\n0 ' + (n + 1) + '\n0000000000 65535 f \n';
    for (var i = 1; i <= n; i++) x += ('0000000000' + plekken[i]).slice(-10) + ' 00000 n \n';
    schrijf(x + 'trailer\n<< /Size ' + (n + 1) + ' /Root ' + CAT + ' 0 R /Info ' + INFO + ' 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
    var uit = new Uint8Array(lengte), pos = 0;
    delen.forEach(function(d){ uit.set(d, pos); pos += d.length; });
    return uit;
  }

  /* een PDF van de Tijdlijnmaker weer openen */
  function lees(bytes){
    var u = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    var s = '', k = 0x8000;
    for (var i = 0; i < u.length; i += k) s += String.fromCharCode.apply(null, u.subarray(i, i + k));
    var a = s.indexOf('TLJSON:'), b = s.indexOf(':TLJSON', a + 7);
    if (a < 0 || b < 0) return null;
    try {
      var raw = b64NaarBytes(s.slice(a + 7, b)), tekst = typeof TextDecoder !== 'undefined' ? new TextDecoder().decode(raw) : Buffer.from(raw).toString('utf8');
      return T.schoonModel(JSON.parse(tekst));
    } catch (e){ return null; }
  }

  var API = { maak: maak, lees: lees, breedte: breedte, regels: regels };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else g.TIJDLIJN_PDF = API;
})(typeof window !== 'undefined' ? window : this);
