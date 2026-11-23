/* Een werkblad als Word-bestand (.docx), gemaakt in de browser.

   WORDBLAD.download(wat)   wat: 'werk', 'antw' of 'beide'. Geeft een belofte.

   Het blad wordt niet opnieuw opgebouwd: de omzetter loopt door het blad zoals
   het op de pagina staat (op de breedte van A4, in het meetvak) en vertaalt wat
   hij tegenkomt naar Word:
   - tekst wordt gewone, bewerkbare tekst, met vet, kleur en grootte van het blad;
   - een genummerde lijst krijgt zijn nummers als tekst, met de inhoud ingesprongen;
   - een tabel wordt een Word-tabel, met de randen van de cellen (het DHTE-schema);
   - wat naast elkaar staat (keuzes in twee kolommen, sommen in een raster, naam en
     klas naast de titel) wordt een tabel zonder randen;
   - een schrijflijn wordt een lege alinea met een lijn eronder, een antwoordvak
     een leeg kader;
   - een tekening (svg, plaatje) gaat mee als afbeelding.
   Er gaat niets naar de server. Een .docx is een zip-bestand; dat wordt hier
   zonder samenpersen zelf geschreven. */
window.WORDBLAD = (function(){
  'use strict';
  var TW = 15, BREED = 688;   /* 1 px op het blad = 15 twips; het blad is 688 px = 182 mm */
  var HEX = '0123456789ABCDEF';

  function esc(t){
    return String(t == null ? '' : t).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g, '')
      .replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; });
  }
  function px(v){ var n = parseFloat(v); return isFinite(n) ? n : 0; }
  /* 'rgb(20, 34, 76)' of 'rgba(...)' naar 14224C; doorzichtig geeft null. Een halfdoorzichtige kleur wordt over wit gelegd. */
  function hex(kleur){
    var m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\/\s]+([\d.]+%?))?/.exec(kleur || '');
    if (!m) return null;
    var a = m[4] == null ? 1 : (/%$/.test(m[4]) ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
    if (a < 0.04) return null;
    var uit = '';
    for (var i = 1; i <= 3; i++){ var v = Math.max(0, Math.min(255, Math.round(parseFloat(m[i]) * a + 255 * (1 - a)))); uit += HEX[v >> 4] + HEX[v & 15]; }
    return uit;
  }
  function stijl(el, pseudo){ return window.getComputedStyle(el, pseudo || null); }
  function rect(el){ return el.getBoundingClientRect(); }

  /* ---------- tekst: runs ---------- */
  /* de opmaak van een stukje tekst, uit de stijl van het element waar het in staat */
  function rpr(cs, extra){
    extra = extra || {};
    var p = '', dl = cs.textDecorationLine || cs.textDecoration || '';
    if (parseInt(cs.fontWeight, 10) >= 600 || extra.vet) p += '<w:b/>';
    if (cs.fontStyle === 'italic') p += '<w:i/>';
    if (/line-through/.test(dl) || extra.door) p += '<w:strike/>';
    var k = extra.kleur || hex(cs.color);
    if (k && k !== '000000') p += '<w:color w:val="' + k + '"/>';
    var sz = Math.max(12, Math.min(144, Math.round(px(cs.fontSize) * 1.5)));
    p += '<w:sz w:val="' + sz + '"/><w:szCs w:val="' + sz + '"/>';
    if (/underline/.test(dl) || extra.streep) p += '<w:u w:val="single"/>';
    if (extra.rand) p += '<w:bdr w:val="single" w:sz="6" w:space="1" w:color="' + extra.rand + '"/>';
    if (extra.vlak) p += '<w:shd w:val="clear" w:color="auto" w:fill="' + extra.vlak + '"/>';
    if (extra.hoog) p += '<w:vertAlign w:val="' + extra.hoog + '"/>';
    return p;
  }
  function tRun(tekst, p){ return { x:'t', tekst:tekst, p:p }; }
  function rauw(xml){ return { x:'r', xml:xml }; }
  var SPATIE = { x:'s' };   /* een spatie die wegvalt naast een andere spatie of aan de rand */

  function pseudo(el, welke, extra){
    var cs = stijl(el, welke), c = cs.content;
    if (!c || c === 'none' || c === 'normal' || cs.display === 'none') return null;
    var m = /^"((?:[^"\\]|\\.)*)"$/.exec(c);
    if (!m) return null;
    var t = m[1].replace(/\\([0-9a-fA-F]{1,6}) ?/g, function(_, h){ return String.fromCodePoint(parseInt(h, 16)); }).replace(/\\(.)/g, '$1');
    return t ? tRun(t, rpr(cs, extra)) : null;
  }
  function isLeeg(el){ return !el.textContent.replace(/[\s ]/g, '') && !el.querySelector('svg,img,input,canvas,table,textarea,select'); }
  function randen(cs){
    return { t:cs.borderTopStyle !== 'none' && cs.borderTopStyle !== 'hidden' ? px(cs.borderTopWidth) : 0,
      r:cs.borderRightStyle !== 'none' && cs.borderRightStyle !== 'hidden' ? px(cs.borderRightWidth) : 0,
      b:cs.borderBottomStyle !== 'none' && cs.borderBottomStyle !== 'hidden' ? px(cs.borderBottomWidth) : 0,
      l:cs.borderLeftStyle !== 'none' && cs.borderLeftStyle !== 'hidden' ? px(cs.borderLeftWidth) : 0 };
  }
  function isInline(cs){ return /^inline|^contents$|^ruby/.test(cs.display); }
  function streepjes(breedte){ return new Array(Math.max(4, Math.min(60, Math.round(breedte / 6.2))) + 1).join('_'); }

  /* alles wat in een regel staat: tekst, vet, een plaatje, een invullijntje */
  function inline(node, cs, extra, uit, staat){
    if (node.nodeType === 3){
      var t = node.nodeValue.replace(/[ \t\r\n\f]+/g, ' ');
      if (!t) return;
      if (cs.textTransform === 'uppercase') t = t.toUpperCase();
      else if (cs.textTransform === 'lowercase') t = t.toLowerCase();
      uit.push(tRun(t, rpr(cs, extra)));
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.tagName.toLowerCase(), es = stijl(node);
    if (es.display === 'none' || tag === 'script' || tag === 'style') return;
    if (tag === 'br'){ uit.push(rauw('<w:r><w:br/></w:r>')); return; }
    if (tag === 'svg' || tag === 'img' || tag === 'canvas'){ uit.push(rauw(beeldRun(node, staat))); return; }
    var r = rect(node), bd = randen(es), blokje = /inline-|^block$|flex|grid/.test(es.display) && es.display !== 'inline';
    if (tag === 'input' || tag === 'textarea' || tag === 'select'){
      uit.push(SPATIE); uit.push(tRun(streepjes(r.width || 80), rpr(es, { kleur:'14224C' }))); uit.push(SPATIE); return;
    }
    /* het breukvak (een hokje boven en een onder de streep): twee hokjes met een schuine streep ertussen */
    if (node.classList.contains('breukvak')){
      var hok = tRun('      ', rpr(es, { rand:'14224C' }));
      uit.push(SPATIE); uit.push(hok); uit.push(tRun(' / ', rpr(es))); uit.push(hok); uit.push(SPATIE);
      return;
    }
    if (isLeeg(node)){
      if (!r.width && !r.height) return;
      /* een leeg hokje (rand rondom) of een invullijntje (alleen een rand onder) */
      if (bd.t && bd.b && bd.l && bd.r){
        uit.push(SPATIE); uit.push(tRun(new Array(Math.max(3, Math.min(30, Math.round(r.width / 5))) + 1).join(' '), rpr(es, { rand:hex(es.borderTopColor) || '14224C' }))); uit.push(SPATIE);
      } else if (bd.b){
        uit.push(SPATIE); uit.push(tRun(streepjes(r.width), rpr(es, { kleur:hex(es.borderBottomColor) || '14224C' }))); uit.push(SPATIE);
      } else if (node.classList.contains('lijn')){
        uit.push(SPATIE); uit.push(tRun(streepjes(r.width || 120), rpr(es))); uit.push(SPATIE);
      }
      return;
    }
    var ex = {}, k;
    for (k in (extra || {})) ex[k] = extra[k];
    if (tag === 'sub') ex.hoog = 'subscript';
    if (tag === 'sup') ex.hoog = 'superscript';
    if (blokje && bd.t && bd.b && bd.l && bd.r && r.height < 60) ex.rand = hex(es.borderTopColor) || '14224C';
    var vlak = hex(es.backgroundColor);
    if (blokje && vlak && vlak !== 'FFFFFF' && r.height < 60) ex.vlak = vlak;
    if (blokje) uit.push(SPATIE);
    var voor = pseudo(node, '::before', ex); if (voor) uit.push(voor);
    for (var c = node.firstChild; c; c = c.nextSibling) inline(c, es, ex, uit, staat);
    var na = pseudo(node, '::after', ex); if (na) uit.push(na);
    if (blokje) uit.push(SPATIE);
  }
  /* de runs van een alinea als xml; spaties aan de rand en dubbele spaties vallen weg */
  function runsXml(runs){
    var xml = '', eind = true, heeft = false;   /* eind: het vorige stuk eindigde op een spatie (of het is het begin) */
    for (var i = 0; i < runs.length; i++){
      var r = runs[i];
      if (r.x === 'r'){ xml += r.xml; eind = false; heeft = true; continue; }
      if (r.x === 's'){ if (!eind){ xml += '<w:r><w:t xml:space="preserve"> </w:t></w:r>'; eind = true; } continue; }
      var t = r.tekst;
      if (eind) t = t.replace(/^ +/, '');
      if (!t) continue;
      xml += '<w:r><w:rPr>' + r.p + '</w:rPr><w:t xml:space="preserve">' + esc(t) + '</w:t></w:r>';
      eind = / $/.test(t); if (/[^ ]/.test(t)) heeft = true;
    }
    return { xml:xml, heeft:heeft };
  }

  /* ---------- blokken: alinea's en tabellen ---------- */
  function par(runs, ctx, cs, extra){
    var p = { soort:'p', runs:runs, ind:ctx.ind || 0, hang:0, rand:{}, voor:0, na:40 };
    if (cs){
      var ta = cs.textAlign;
      if (ta === 'center') p.jc = 'center'; else if (ta === 'right' || ta === 'end') p.jc = 'right';
      var lh = px(cs.lineHeight), fs = px(cs.fontSize);
      if (lh && fs && lh / fs > 1.75) p.regel = Math.round(Math.min(3, lh / fs) / 1.25 * 240);
    }
    if (ctx.links) p.rand.left = ctx.links;
    if (extra) for (var k in extra) p[k] = extra[k];
    return p;
  }
  function rand(val, sz, kleur, ruimte){ return ' w:val="' + val + '" w:sz="' + sz + '" w:space="' + (ruimte || 0) + '" w:color="' + (kleur || '14224C') + '"'; }
  function randXml(naam, breedte, soort, kleur, ruimte){
    if (!breedte) return '<w:' + naam + ' w:val="nil"/>';
    var val = soort === 'dashed' ? 'dashed' : soort === 'dotted' ? 'dotted' : soort === 'double' ? 'double' : 'single';
    return '<w:' + naam + rand(val, Math.max(2, Math.min(48, Math.round(breedte * 6))), kleur, ruimte) + '/>';
  }
  function parXml(p){
    var r = runsXml(p.runs), pr = '';
    var b = p.rand || {};
    if (b.top || b.left || b.bottom || b.right){
      pr += '<w:pBdr>' + (b.top ? '<w:top' + rand('single', b.top.sz, b.top.kleur, 1) + '/>' : '') + (b.left ? '<w:left' + rand('single', b.left.sz, b.left.kleur, 8) + '/>' : '') +
        (b.bottom ? '<w:bottom' + rand('single', b.bottom.sz, b.bottom.kleur, 1) + '/>' : '') + (b.right ? '<w:right' + rand('single', b.right.sz, b.right.kleur, 1) + '/>' : '') + '</w:pBdr>';
    }
    if (p.tab) pr += '<w:tabs><w:tab w:val="left" w:pos="' + p.tab + '"/></w:tabs>';
    pr += '<w:spacing w:before="' + (p.voor || 0) + '" w:after="' + (p.na == null ? 40 : p.na) + '"' + (p.hoogte ? ' w:line="' + p.hoogte + '" w:lineRule="exact"' : p.regel ? ' w:line="' + p.regel + '" w:lineRule="auto"' : '') + '/>';
    if (p.ind || p.hang || p.rechts) pr += '<w:ind w:left="' + ((p.ind || 0) + (p.rand && p.rand.left ? 120 : 0)) + '"' + (p.rechts ? ' w:right="' + p.rechts + '"' : '') + (p.hang ? ' w:hanging="' + p.hang + '"' : '') + '/>';
    if (p.jc) pr += '<w:jc w:val="' + p.jc + '"/>';
    if (p.samen) pr = '<w:keepNext/>' + pr;
    return '<w:p><w:pPr>' + pr + '</w:pPr>' + r.xml + '</w:p>';
  }
  function blokkenXml(lijst){ return lijst.map(function(b){ return b.soort === 'p' ? parXml(b) : b.xml; }).join(''); }
  function heeftInhoud(runs){ return runsXml(runs).heeft; }
  function leeg(){ return { soort:'p', runs:[], ind:0, na:0, hoogte:20, rand:{} }; }
  /* een cel moet met een alinea eindigen; een lege cel krijgt een lege alinea */
  function celInhoud(lijst){
    if (!lijst.length) return '<w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>';
    return blokkenXml(lijst) + (lijst[lijst.length - 1].soort === 'p' ? '' : parXml(leeg()));
  }

  function bevatBlok(el){ return !!el.querySelector('table,ol,ul'); }
  /* een lege regel om op te schrijven: een leeg element met alleen een rand eronder */
  function isLijn(el, cs){
    if (!isLeeg(el)) return false;
    var b = randen(cs);
    return b.b > 0 && !b.t && !b.l && !b.r;
  }
  function lijnen(el, cs, ctx, staat){
    var r = rect(el), n = cs.backgroundImage && cs.backgroundImage !== 'none' ? Math.max(1, Math.round(r.height / 30)) : 1;
    var h = Math.max(300, Math.min(900, Math.round(r.height / n * TW))), uit = [];
    var rechts = ctx.cel ? 0 : Math.max(0, Math.round((staat.rechts - r.right) * TW));
    for (var i = 0; i < n; i++) uit.push({ soort:'p', runs:[], ind:ctx.ind || 0, rechts:rechts, na:0, hoogte:h, rand:{ bottom:{ sz:6, kleur:hex(cs.borderBottomColor) || '14224C' } } });
    return uit;
  }

  function blok(el, ctx, staat){
    var cs = stijl(el);
    if (cs.display === 'none') return [];
    var tag = el.tagName.toLowerCase();
    if (tag === 'script' || tag === 'style' || tag === 'button' && el.closest('.wb-bed')) return [];
    if (tag === 'svg' || tag === 'img' || tag === 'canvas') return [par([rauw(beeldRun(el, staat))], ctx, stijl(el.parentNode))];
    if (tag === 'table') return [tabel(el, ctx, staat)];
    if (tag === 'ol' || tag === 'ul') return lijst(el, ctx, cs, staat);
    if (isLijn(el, cs)) return lijnen(el, cs, ctx, staat);
    var b = randen(cs), vlak = hex(cs.backgroundColor), r = rect(el);
    if (isLeeg(el)){
      /* een leeg vak om in te schrijven; een leeg blok zonder rand is alleen ruimte */
      if (b.t && b.b && b.l && b.r && r.height > 6) return [kader(el, cs, ctx, staat, b, vlak, r)];
      return [];
    }
    if ((b.t && b.b && b.l && b.r) || (vlak && vlak !== 'FFFFFF' && r.height > 14)) return [kader(el, cs, ctx, staat, b, vlak, r)];
    var c2 = ctx;
    if (b.l >= 2 && !b.t && !b.b && !b.r){ c2 = kopie(ctx); c2.links = { sz:Math.round(b.l * 6), kleur:hex(cs.borderLeftColor) || '14224C' }; }
    var uit = inhoud(el, c2, cs, staat);
    /* een streep onder het blok (de kop van het blad) */
    if (b.b >= 1.5 && cs.borderBottomStyle === 'solid' && !b.t && !b.l && !b.r){
      uit.push({ soort:'p', runs:[], ind:ctx.ind || 0, na:80, hoogte:60, rand:{ bottom:{ sz:Math.round(b.b * 6), kleur:hex(cs.borderBottomColor) || '14224C' } } });
    }
    /* witruimte boven het blok */
    var boven = Math.min(240, Math.round((px(cs.marginTop) + px(cs.paddingTop)) * TW));
    if (boven > 0 && uit.length && uit[0].soort === 'p') uit[0].voor = Math.max(uit[0].voor || 0, boven);
    return uit;
  }
  function kopie(o){ var n = {}; for (var k in o) n[k] = o[k]; return n; }

  /* de inhoud van een blok: tekst en wat in de regel staat wordt een alinea, blokken komen eronder */
  function inhoud(el, ctx, cs, staat){
    if (/flex|grid/.test(cs.display)) return naast(el, ctx, cs, staat);
    var uit = [], runs = [];
    function spoel(){ if (heeftInhoud(runs)) uit.push(par(runs, ctx, cs)); runs = []; }
    var voor = pseudo(el, '::before'); if (voor) runs.push(voor);
    for (var c = el.firstChild; c; c = c.nextSibling){
      if (c.nodeType === 3){ inline(c, cs, null, runs, staat); continue; }
      if (c.nodeType !== 1) continue;
      var ccs = stijl(c), tag = c.tagName.toLowerCase();
      if (ccs.display === 'none') continue;
      if (tag === 'br'){ runs.push(rauw('<w:r><w:br/></w:r>')); continue; }
      var inl = isInline(ccs) && tag !== 'table' && tag !== 'ol' && tag !== 'ul' && !bevatBlok(c);
      /* een grote tekening staat op een eigen regel */
      if (inl && (tag === 'svg' || tag === 'img') && rect(c).height > 70 && !heeftInhoud(runs)) inl = false;
      if (inl) inline(c, cs, null, runs, staat);
      else { spoel(); uit = uit.concat(blok(c, ctx, staat)); }
    }
    var na = pseudo(el, '::after'); if (na) runs.push(na);
    spoel();
    return uit;
  }

  /* kinderen in rijen verdelen naar waar ze op het blad staan */
  function rijen(kinderen){
    var uit = [], rij = null, onder = -1e9;
    kinderen.forEach(function(k){
      var r = k.r;
      if (!rij || r.top >= onder - 3){ rij = []; uit.push(rij); onder = r.bottom; }
      else onder = Math.max(onder, r.bottom);
      rij.push(k);
    });
    uit.forEach(function(x){ x.sort(function(a, b){ return a.r.left - b.r.left; }); });
    return uit;
  }
  function zichtbareKinderen(el){
    var uit = [];
    for (var c = el.firstElementChild; c; c = c.nextElementSibling){
      if (stijl(c).display === 'none') continue;
      var r = rect(c);
      if (r.width < 1 && r.height < 1) continue;
      uit.push({ el:c, r:r });
    }
    return uit;
  }
  /* een flex- of rastervak: wat naast elkaar staat blijft naast elkaar */
  function naast(el, ctx, cs, staat){
    var kind = zichtbareKinderen(el), los = false, c;
    for (c = el.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.nodeValue.replace(/\s/g, '')) los = true;
    var rs = rijen(kind), meer = rs.some(function(x){ return x.length > 1; }), r = rect(el);
    var licht = kind.every(function(k){ return !bevatBlok(k.el) && k.r.height < 64 && !k.el.querySelector('svg,img') || (/^(svg|img)$/i.test(k.el.tagName) && k.r.height < 64); });
    /* een regel met losse stukjes (een label en een lijntje): gewoon een alinea */
    if (los || (meer && rs.length === 1 && r.height < 64 && licht)){
      var runs = [], voor = pseudo(el, '::before'); if (voor) runs.push(voor);
      for (c = el.firstChild; c; c = c.nextSibling){ inline(c, cs, null, runs, staat); runs.push(SPATIE); }
      return heeftInhoud(runs) ? [par(runs, ctx, cs)] : [];
    }
    if (!meer){
      var uit = [];
      kind.forEach(function(k){ uit = uit.concat(blok(k.el, ctx, staat)); });
      return uit;
    }
    return [raster(rs, r, ctx, staat, function(k, c2){ return blok(k.el, c2, staat); })];
  }
  /* een tabel zonder randen voor wat naast elkaar staat */
  function raster(rs, r, ctx, staat, maak){
    var n = 0, breedst = rs[0];
    rs.forEach(function(x){ if (x.length > n){ n = x.length; breedst = x; } });
    var totaal = Math.max(60, Math.min(BREED, r.width)), kol = [], i;
    /* de kolommen lopen van de linkerkant van een cel tot die van de volgende */
    for (i = 0; i < n; i++){
      var links = i ? breedst[i].r.left : r.left, rechts = i < n - 1 ? breedst[i + 1].r.left : r.left + totaal;
      kol.push(Math.max(300, Math.round((rechts - links) * TW)));
    }
    var c2 = kopie(ctx); c2.ind = 0; c2.cel = true; c2.links = null;
    var xml = '<w:tbl><w:tblPr><w:tblW w:w="' + kol.reduce(function(a, b){ return a + b; }, 0) + '" w:type="dxa"/>' + (ctx.ind ? '<w:tblInd w:w="' + ctx.ind + '" w:type="dxa"/>' : '') +
      '<w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr>' +
      '<w:tblGrid>' + kol.map(function(w){ return '<w:gridCol w:w="' + w + '"/>'; }).join('') + '</w:tblGrid>';
    rs.forEach(function(rij){
      xml += '<w:tr><w:trPr><w:cantSplit/></w:trPr>';
      for (i = 0; i < n; i++) xml += '<w:tc><w:tcPr><w:tcW w:w="' + kol[i] + '" w:type="dxa"/></w:tcPr>' + celInhoud(rij[i] ? maak(rij[i], c2) : []) + '</w:tc>';
      xml += '</w:tr>';
    });
    return { soort:'t', xml:xml + '</w:tbl>' };
  }
  /* een blok met een rand rondom of een gekleurd vlak: een tabel van een cel */
  function kader(el, cs, ctx, staat, b, vlak, r){
    var c2 = kopie(ctx); c2.ind = 0; c2.cel = true; c2.links = null;
    var binnen = isLeeg(el) ? [] : inhoud(el, c2, cs, staat);
    var w = Math.max(200, Math.round(Math.min(BREED, r.width) * TW));
    var marge = function(v){ return Math.max(0, Math.min(400, Math.round(px(v) * TW))); };
    var xml = '<w:tbl><w:tblPr><w:tblW w:w="' + w + '" w:type="dxa"/>' + (ctx.ind ? '<w:tblInd w:w="' + ctx.ind + '" w:type="dxa"/>' : '') + '<w:tblLayout w:type="fixed"/>' +
      '<w:tblCellMar><w:top w:w="' + marge(cs.paddingTop) + '" w:type="dxa"/><w:left w:w="' + marge(cs.paddingLeft) + '" w:type="dxa"/><w:bottom w:w="' + marge(cs.paddingBottom) + '" w:type="dxa"/><w:right w:w="' + marge(cs.paddingRight) + '" w:type="dxa"/></w:tblCellMar></w:tblPr>' +
      '<w:tblGrid><w:gridCol w:w="' + w + '"/></w:tblGrid><w:tr>' + (isLeeg(el) ? '<w:trPr><w:trHeight w:val="' + Math.round(r.height * TW) + '" w:hRule="atLeast"/></w:trPr>' : '') +
      '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/><w:tcBorders>' + randXml('top', b.t, cs.borderTopStyle, hex(cs.borderTopColor)) + randXml('left', b.l, cs.borderLeftStyle, hex(cs.borderLeftColor)) +
      randXml('bottom', b.b, cs.borderBottomStyle, hex(cs.borderBottomColor)) + randXml('right', b.r, cs.borderRightStyle, hex(cs.borderRightColor)) + '</w:tcBorders>' +
      (vlak && vlak !== 'FFFFFF' ? '<w:shd w:val="clear" w:color="auto" w:fill="' + vlak + '"/>' : '') + '</w:tcPr>' + celInhoud(binnen) + '</w:tc></w:tr></w:tbl>';
    return { soort:'t', xml:xml, na:true };
  }

  /* ---------- lijsten ---------- */
  function lijst(el, ctx, cs, staat){
    var items = [], n = parseInt(el.getAttribute('start'), 10) || 1;
    for (var c = el.firstElementChild; c; c = c.nextElementSibling){
      if (c.tagName.toLowerCase() !== 'li' || stijl(c).display === 'none') continue;
      var lcs = stijl(c), voor = stijl(c, '::before'), label = '';
      var teller = voor.display !== 'none' && voor.content && /counter/.test(voor.content);
      var eigen = voor.display !== 'none' && /^"/.test(voor.content || '') ? pseudo(c, '::before') : null;
      if (teller) label = String(n++);
      else if (eigen) label = eigen.tekst;
      else if (lcs.listStyleType === 'decimal'){ label = (n++) + '.'; }
      else if (/alpha|latin/.test(lcs.listStyleType)) label = String.fromCharCode(96 + n++) + '.';
      else if (/disc|circle|square/.test(lcs.listStyleType)) label = '•';
      items.push({ el:c, r:rect(c), label:label, cs:lcs });
    }
    function li(k, c2){
      var hang = k.label ? Math.max(300, Math.min(720, Math.round((px(k.cs.paddingLeft) || px(cs.paddingLeft) || 24) * TW))) : 0;
      var c3 = kopie(c2); c3.ind = (c2.ind || 0) + hang;
      var binnen = isLeeg(k.el) ? [] : (/flex|grid/.test(k.cs.display) ? naast(k.el, c3, k.cs, staat) : inhoud(k.el, c3, k.cs, staat));
      if (!k.label) return binnen;
      var nr = [tRun(k.label, '<w:b/><w:color w:val="14224C"/><w:sz w:val="20"/><w:szCs w:val="20"/>'), rauw('<w:r><w:tab/></w:r>')];
      if (binnen.length && binnen[0].soort === 'p' && !binnen[0].hoogte){ binnen[0].runs = nr.concat(binnen[0].runs); binnen[0].hang = hang; binnen[0].tab = c3.ind; }
      else binnen.unshift({ soort:'p', runs:nr, ind:c3.ind, hang:hang, tab:c3.ind, na:0, rand:{}, samen:true });
      binnen[0].voor = Math.max(binnen[0].voor || 0, 100);
      return binnen;
    }
    var rs = rijen(items);
    if (rs.some(function(x){ return x.length > 1; })) return [raster(rs, rect(el), ctx, staat, li)];
    var uit = [];
    items.forEach(function(k){ uit = uit.concat(li(k, ctx)); });
    return uit;
  }

  /* ---------- tabellen ---------- */
  function tabel(el, ctx, staat){
    var rij = [].slice.call(el.rows), cs = stijl(el), nkol = 0, bezet = [], cellen = [];
    /* het rooster vullen, met samengevoegde cellen */
    rij.forEach(function(tr, y){
      bezet[y] = bezet[y] || []; cellen[y] = [];
      var x = 0;
      [].forEach.call(tr.cells, function(td){
        while (bezet[y][x]) x++;
        var span = Math.max(1, td.colSpan || 1), hoog = Math.max(1, td.rowSpan || 1);
        cellen[y].push({ td:td, x:x, span:span, hoog:hoog });
        for (var dy = 0; dy < hoog; dy++){ bezet[y + dy] = bezet[y + dy] || []; for (var dx = 0; dx < span; dx++) bezet[y + dy][x + dx] = dy ? { vervolg:td, x:x, span:span } : true; }
        x += span;
      });
      nkol = Math.max(nkol, bezet[y].length);
    });
    var r = rect(el), kol = [], i;
    for (i = 0; i < nkol; i++) kol.push(0);
    cellen.forEach(function(c){ c.forEach(function(k){ if (k.span === 1 && !kol[k.x]) kol[k.x] = rect(k.td).width; }); });
    var rest = kol.filter(function(w){ return !w; }).length, gebruikt = kol.reduce(function(a, b){ return a + b; }, 0);
    kol = kol.map(function(w){ return w || Math.max(12, (r.width - gebruikt) / Math.max(1, rest)); });
    /* te breed voor het blad: alles naar verhouding smaller */
    var som = kol.reduce(function(a, b){ return a + b; }, 0), max = BREED - (ctx.ind || 0) / TW, f = som > max ? max / som : 1;
    kol = kol.map(function(w){ return Math.max(90, Math.round(w * f * TW)); });
    var tussen = cs.borderCollapse === 'separate' ? px(cs.borderSpacing) : 0;
    var c2 = kopie(ctx); c2.ind = 0; c2.cel = true; c2.links = null;
    var xml = '<w:tbl><w:tblPr><w:tblW w:w="' + kol.reduce(function(a, b){ return a + b; }, 0) + '" w:type="dxa"/>' + (stijl(el.parentNode).textAlign === 'center' && !ctx.ind ? '<w:jc w:val="center"/>' : '') +
      (tussen ? '<w:tblCellSpacing w:w="' + Math.round(tussen * TW / 2) + '" w:type="dxa"/>' : '') + (ctx.ind ? '<w:tblInd w:w="' + ctx.ind + '" w:type="dxa"/>' : '') +
      '<w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="30" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="30" w:type="dxa"/></w:tblCellMar></w:tblPr>' +
      '<w:tblGrid>' + kol.map(function(w){ return '<w:gridCol w:w="' + w + '"/>'; }).join('') + '</w:tblGrid>';
    rij.forEach(function(tr, y){
      if (stijl(tr).display === 'none') return;
      var h = rect(tr).height, cx = '', x = 0, lijstje = cellen[y].slice();
      while (x < nkol){
        var k = lijstje.length && lijstje[0].x === x ? lijstje.shift() : null, v = !k && bezet[y][x] && bezet[y][x].vervolg ? bezet[y][x] : null;
        if (!k && !v){ cx += '<w:tc><w:tcPr><w:tcW w:w="' + kol[x] + '" w:type="dxa"/></w:tcPr><w:p/></w:tc>'; x++; continue; }
        var td = k ? k.td : v.vervolg, span = k ? k.span : v.span, tcs = stijl(td), b = randen(tcs), w = 0;
        for (i = 0; i < span; i++) w += kol[x + i] || 0;
        var vlak = hex(tcs.backgroundColor), binnen = [];
        if (k && !isLeeg(td)){
          binnen = inhoud(td, c2, tcs, staat);
          binnen.forEach(function(p){ if (p.soort === 'p'){ p.na = 0; if (!p.jc && tcs.textAlign === 'center') p.jc = 'center'; } });
        }
        cx += '<w:tc><w:tcPr><w:tcW w:w="' + w + '" w:type="dxa"/>' + (span > 1 ? '<w:gridSpan w:val="' + span + '"/>' : '') + (k && k.hoog > 1 ? '<w:vMerge w:val="restart"/>' : v ? '<w:vMerge/>' : '') +
          '<w:tcBorders>' + randXml('top', b.t, tcs.borderTopStyle, hex(tcs.borderTopColor)) + randXml('left', b.l, tcs.borderLeftStyle, hex(tcs.borderLeftColor)) +
          randXml('bottom', b.b, tcs.borderBottomStyle, hex(tcs.borderBottomColor)) + randXml('right', b.r, tcs.borderRightStyle, hex(tcs.borderRightColor)) + '</w:tcBorders>' +
          (vlak && vlak !== 'FFFFFF' ? '<w:shd w:val="clear" w:color="auto" w:fill="' + vlak + '"/>' : '') +
          '<w:vAlign w:val="' + (tcs.verticalAlign === 'top' ? 'top' : tcs.verticalAlign === 'bottom' ? 'bottom' : 'center') + '"/></w:tcPr>' + celInhoud(binnen) + '</w:tc>';
        x += span;
      }
      xml += '<w:tr><w:trPr><w:cantSplit/><w:trHeight w:val="' + Math.max(20, Math.round(h * TW)) + '" w:hRule="' + (h < 6 ? 'exact' : 'atLeast') + '"/></w:trPr>' + cx + '</w:tr>';
    });
    return { soort:'t', xml:xml + '</w:tbl>', na:true };
  }

  /* ---------- plaatjes ---------- */
  var SVGSTIJL = ['fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin',
    'opacity', 'font-family', 'font-size', 'font-weight', 'font-style', 'text-anchor', 'dominant-baseline', 'letter-spacing', 'paint-order', 'stop-color', 'stop-opacity', 'text-decoration'];
  /* een svg met de stijl van de pagina erin geschreven, zodat hij los van de pagina hetzelfde blijft */
  function svgTekst(el, w, h){
    var kl = el.cloneNode(true);
    var a = [el].concat([].slice.call(el.querySelectorAll('*'))), b = [kl].concat([].slice.call(kl.querySelectorAll('*')));
    for (var i = 0; i < a.length && i < b.length; i++){
      var cs = stijl(a[i]);
      if (i && cs.display === 'none'){ b[i].setAttribute('display', 'none'); continue; }
      for (var j = 0; j < SVGSTIJL.length; j++){ var v = cs.getPropertyValue(SVGSTIJL[j]); if (v) b[i].style.setProperty(SVGSTIJL[j], v); }
    }
    kl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    kl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    if (!kl.getAttribute('viewBox')){ var bw = px(el.getAttribute('width')) || w, bh = px(el.getAttribute('height')) || h; kl.setAttribute('viewBox', '0 0 ' + bw + ' ' + bh); }
    kl.setAttribute('width', w); kl.setAttribute('height', h);
    kl.style.removeProperty('max-width'); kl.style.removeProperty('max-height'); kl.removeAttribute('class');
    kl.style.setProperty('transform', 'none');
    return new XMLSerializer().serializeToString(kl);
  }
  function beeldRun(el, staat){
    var r = rect(el), w = r.width, h = r.height;
    /* een gedraaid plaatje (de stempel) meet te groot: dan de eigen maat */
    var ow = el.offsetWidth || px(stijl(el).width), oh = el.offsetHeight || px(stijl(el).height);
    if (ow && oh){ w = ow; h = oh; }
    if (w < 1 || h < 1) return '';
    if (w > BREED){ h = h * BREED / w; w = BREED; }
    var tag = el.tagName.toLowerCase(), nr = staat.beelden.length + 1;
    staat.beelden.push({ nr:nr, w:w, h:h, svg:tag === 'svg' ? svgTekst(el, w, h) : null, el:tag === 'svg' ? null : el });
    var cx = Math.round(w * 9525), cy = Math.round(h * 9525), alt = esc(el.getAttribute('alt') || el.getAttribute('aria-label') || '');
    return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:docPr id="' + nr + '" name="Afbeelding ' + nr + '" descr="' + alt + '"/>' +
      '<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
      '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="' + nr + '" name="beeld' + nr + '.png"/><pic:cNvPicPr/></pic:nvPicPr>' +
      '<pic:blipFill><a:blip r:embed="rIdB' + nr + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
      '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
  }
  /* het kleinste geldige png: een doorzichtige stip, voor een plaatje dat niet lukt */
  var STIP = [137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120, 156, 99, 96, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45, 180, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130];
  function naarPng(b){
    return new Promise(function(klaar){
      var op = false;
      function stip(){ if (!op){ op = true; klaar(new Uint8Array(STIP)); } }
      function teken(bron){
        try {
          var s = Math.min(3, Math.max(1, 1800 / Math.max(b.w, b.h))), c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(b.w * s)); c.height = Math.max(1, Math.round(b.h * s));
          c.getContext('2d').drawImage(bron, 0, 0, c.width, c.height);
          c.toBlob(function(blob){
            if (!blob) return stip();
            blob.arrayBuffer().then(function(buf){ if (!op){ op = true; klaar(new Uint8Array(buf)); } }, stip);
          }, 'image/png');
        } catch (e){ stip(); }
      }
      setTimeout(stip, 8000);
      if (b.svg){
        var im = new Image();
        im.onload = function(){ teken(im); }; im.onerror = stip;
        im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(b.svg);
      } else if (b.el && b.el.tagName.toLowerCase() === 'canvas') teken(b.el);
      else if (b.el && b.el.complete && b.el.naturalWidth) teken(b.el);
      else if (b.el){ b.el.addEventListener('load', function(){ teken(b.el); }); b.el.addEventListener('error', stip); }
      else stip();
    });
  }

  /* ---------- het zip-bestand ---------- */
  var CRC = (function(){ var t = [], n, c, k; for (n = 0; n < 256; n++){ c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc(b){ var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(bestanden){
    var enc = new TextEncoder(), delen = [], midden = [], plek = 0;
    function kop(n){ var b = new Uint8Array(n); return { b:b, v:new DataView(b.buffer) }; }
    bestanden.forEach(function(f){
      var naam = enc.encode(f.naam), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, som = crc(data);
      var l = kop(30); l.v.setUint32(0, 0x04034b50, true); l.v.setUint16(4, 20, true); l.v.setUint16(6, 0x0800, true); l.v.setUint16(8, 0, true);
      l.v.setUint16(10, 0, true); l.v.setUint16(12, 0x21, true); l.v.setUint32(14, som, true); l.v.setUint32(18, data.length, true); l.v.setUint32(22, data.length, true);
      l.v.setUint16(26, naam.length, true); l.v.setUint16(28, 0, true);
      var m = kop(46); m.v.setUint32(0, 0x02014b50, true); m.v.setUint16(4, 20, true); m.v.setUint16(6, 20, true); m.v.setUint16(8, 0x0800, true); m.v.setUint16(10, 0, true);
      m.v.setUint16(12, 0, true); m.v.setUint16(14, 0x21, true); m.v.setUint32(16, som, true); m.v.setUint32(20, data.length, true); m.v.setUint32(24, data.length, true);
      m.v.setUint16(28, naam.length, true); m.v.setUint32(42, plek, true);
      delen.push(l.b, naam, data); midden.push(m.b, naam);
      plek += 30 + naam.length + data.length;
    });
    var lengte = midden.reduce(function(a, b){ return a + b.length; }, 0), e = kop(22);
    e.v.setUint32(0, 0x06054b50, true); e.v.setUint16(8, bestanden.length, true); e.v.setUint16(10, bestanden.length, true); e.v.setUint32(12, lengte, true); e.v.setUint32(16, plek, true);
    return new Blob(delen.concat(midden, [e.b]), { type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  /* ---------- het document ---------- */
  var NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"';
  var KOP = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  function bladXml(blad, staat){
    staat.rechts = rect(blad).right;
    var uit = inhoud(blad, { ind:0 }, stijl(blad), staat), xml = '';
    /* tussen twee tabellen hoort een alinea, anders plakt Word ze aan elkaar */
    uit.forEach(function(b, i){ xml += b.soort === 'p' ? parXml(b) : b.xml + (uit[i + 1] && uit[i + 1].soort === 'p' ? '' : parXml(leeg())); });
    return xml;
  }
  function bouw(bladen, titel){
    var staat = { beelden:[], rechts:0 };
    var lijf = bladen.map(function(b){ return bladXml(b, staat); }).join('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    var doc = KOP + '<w:document ' + NS + '><w:body>' + lijf +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="794" w:right="794" w:bottom="794" w:left="794" w:header="454" w:footer="454" w:gutter="0"/></w:sectPr></w:body></w:document>';
    return Promise.all(staat.beelden.map(naarPng)).then(function(pngs){
      var bestanden = [
        { naam:'[Content_Types].xml', data:KOP + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>' +
          '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
          '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>' },
        { naam:'_rels/.rels', data:KOP + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
          '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>' },
        { naam:'docProps/core.xml', data:KOP + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>' + esc(titel) + '</dc:title><dc:creator>meneergreidanus.nl</dc:creator></cp:coreProperties>' },
        { naam:'word/document.xml', data:doc },
        { naam:'word/styles.xml', data:KOP + '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Calibri"/><w:color w:val="14224C"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="nl-NL"/></w:rPr></w:rPrDefault>' +
          '<w:pPrDefault><w:pPr><w:spacing w:after="40" w:line="259" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Standaard"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
          '<w:style w:type="table" w:default="1" w:styleId="Standaardtabel"><w:name w:val="Normal Table"/><w:uiPriority w:val="99"/><w:semiHidden/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>' },
        { naam:'word/_rels/document.xml.rels', data:KOP + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
          staat.beelden.map(function(b){ return '<Relationship Id="rIdB' + b.nr + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/beeld' + b.nr + '.png"/>'; }).join('') + '</Relationships>' }
      ];
      pngs.forEach(function(p, i){ bestanden.push({ naam:'word/media/beeld' + (i + 1) + '.png', data:p }); });
      return { blob:zip(bestanden), doc:doc, beelden:staat.beelden.length };
    });
  }

  /* De bladen van de pagina klaarzetten in het meetvak (zo breed als A4) en omzetten.
     wat: 'werk', 'antw' of 'beide'. Geeft { blob, naam, doc, beelden }. */
  function maak(wat){
    var bron = document.getElementById('bladen'), meet = document.getElementById('meet');
    if (!bron || !meet) return Promise.reject(new Error('Er is geen blad.'));
    var enkel = bron.hasAttribute('data-enkel'), bl = [].slice.call(bron.querySelectorAll('.blad:not(.skeletblad)')).filter(function(b){
      var achter = b.classList.contains('wb-achter');
      if (achter && enkel) return false;
      return wat === 'beide' || (wat === 'antw' ? achter : !achter);
    });
    if (!bl.length) return Promise.reject(new Error('Er is geen blad.'));
    var kopEl = bron.querySelector('.blad.wb-voor h2'), titel = kopEl ? kopEl.textContent.trim() : 'Werkblad';
    meet.innerHTML = '';
    var klonen = bl.map(function(b){
      var k = b.cloneNode(true);
      k.classList.remove('wb-voor'); k.classList.remove('wb-achter');
      [].forEach.call(k.querySelectorAll('.wb-bed,script,style'), function(x){ x.parentNode.removeChild(x); });
      meet.appendChild(k);
      return k;
    });
    /* plaatjes in de kopie moeten geladen zijn voor ze getekend worden */
    var wacht = [].slice.call(meet.querySelectorAll('img')).map(function(im){
      return im.complete ? null : new Promise(function(ok){ im.addEventListener('load', ok); im.addEventListener('error', ok); setTimeout(ok, 5000); });
    }).filter(Boolean);
    function ruim(){ meet.innerHTML = ''; }
    return Promise.all(wacht).then(function(){ return bouw(klonen, titel); }).then(function(uit){
      ruim();
      var achter = wat === 'antw' ? ' - antwoorden' : wat === 'werk' && !enkel ? ' - werkblad' : '';
      uit.naam = (titel + achter).replace(/[\\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90) + '.docx';
      return uit;
    }, function(e){ ruim(); throw e; });
  }
  function download(wat){
    return maak(wat).then(function(uit){
      var u = URL.createObjectURL(uit.blob), a = document.createElement('a');
      a.href = u; a.download = uit.naam; a.style.display = 'none';
      document.body.appendChild(a); a.click();
      setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(u); }, 4000);
      return uit;
    });
  }
  return { maak:maak, download:download };
})();
