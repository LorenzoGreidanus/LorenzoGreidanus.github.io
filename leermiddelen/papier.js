/* Een eigen toets op papier: versie A en B, en per versie een nakijkmodel.
   Gebruikt door papieren-toets.html (printen) en uitslag.js (de punten invoeren).

     PAPIER.volgorde(items, code, versie, k) -> de echte nummers (0, 1, ...) in de volgorde van die versie;
                                               met k (bij trek) alleen die vragen
     PAPIER.getrokken(code, versie, n, trek) -> bij trek de vragen van die versie, op volgorde (of null: alle)
     PAPIER.toets(m, code, versie, o)       -> het blad om te printen (html); o: { hulp, alleenB }
     PAPIER.model(m, code, versie)          -> het nakijkmodel van die versie (html)
     PAPIER.kort(it)                        -> de vraag in een regel, voor lijsten

   Alles wat door elkaar staat, staat door elkaar met een vaste toevalsreeks uit de
   code van de toets. Zo is versie B morgen nog precies dezelfde als vandaag, en past
   een nakijkmodel dat je later print bij de toets die je eerder printte. Versie A
   houdt de volgorde van de vragen uit de editor; alleen kaartvragen over dezelfde
   kaart komen bij elkaar, onder die kaart. Versie B heeft de vragen en de antwoorden
   bij meerkeuze in een andere volgorde, met dezelfde inhoud. */
var PAPIER = (function(){
  'use strict';
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  /* een vaste toevalsreeks bij een stukje tekst */
  function hash(s){ var h = 2166136261 >>> 0; s = String(s); for (var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function reeks(zaad){
    var a = hash(zaad);
    return function(){ a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function schud(l, zaad){ var r = reeks(zaad), a = l.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(r() * (i + 1)), h = a[i]; a[i] = a[j]; a[j] = h; } return a; }
  function zelfde(a, b){ return a.length === b.length && a.every(function(x, i){ return x === b[i]; }); }
  /* door elkaar, maar nooit precies zoals het in de editor staat (daar staat het goede antwoord eerst, of de stappen goed) */
  function door(l, zaad){ var a = schud(l, zaad); if (a.length > 1 && zelfde(a, l)) a.push(a.shift()); return a; }
  /* versie B anders dan A: lukt het toeval niet, dan schuift alles een plek op */
  function perVersie(l, zaad, versie){
    var a = door(l, zaad + '|A');
    if (versie !== 'B') return a;
    var b = door(l, zaad + '|B');
    if (a.length > 1 && zelfde(a, b)) b = a.slice(1).concat(a[0]);
    return b;
  }
  /* het zaad van een vraag: alleen de inhoud die door elkaar gaat, zodat een andere uitleg of een andere vraag niets verschuift */
  function zaadVan(code, it){
    var x = it.vorm === 'mk' ? [it.goed, it.fout] : it.vorm === 'koppel' ? it.paren : it.vorm === 'volgorde' ? it.stappen : it.vorm === 'groepen' ? it.groepen
      : it.vorm === 'gaten' ? [it.tekst, it.extra] : it.vorm === 'aanwijzen' ? [(it.plekken || []).map(function(p){ return p.naam; }), it.extra] : it.vorm === 'topo' ? [it.plek, it.fout] : it.vraag;
    return code + '|' + it.vorm + '|' + JSON.stringify(x);
  }
  function gatenVan(tekst){ return (String(tekst || '').match(/\[([^\]]+)\]/g) || []).map(function(x){ return x.slice(1, -1).trim(); }); }
  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /* ---------- elke leerling een deel van de vragen (trek) ----------
     Op papier trekt elke versie zijn eigen vragen, vast bij de code: zaad code + ':versieA'
     of ':versieB'. Dezelfde rekensom (FNV-1a en mulberry32) als trekVan in server/materiaal.js,
     die bij het invoeren van de punten zelf nagaat welke vragen bij die versie horen. */
  function trek(code, wie, n, aantal){
    aantal = Math.floor(Number(aantal)) || 0;
    if (!(aantal >= 2 && aantal < n)) return null;
    var r = reeks(String(code) + ':' + String(wie)), l = [], i;
    for (i = 0; i < n; i++) l.push(i);
    for (i = n - 1; i > 0; i--){ var j = Math.floor(r() * (i + 1)), h = l[i]; l[i] = l[j]; l[j] = h; }
    return l.slice(0, aantal);
  }
  function getrokken(code, versie, n, aantal){ var k = trek(code, 'versie' + (versie === 'B' ? 'B' : 'A'), n, aantal); return k ? k.sort(function(x, y){ return x - y; }) : null; }

  /* ---------- de volgorde van de vragen ---------- */
  function blokken(items, k){
    var bl = [], perKaart = {};
    (k || items.map(function(x, i){ return i; })).forEach(function(i){
      var it = items[i];
      if (it.vorm === 'topo'){
        if (!perKaart[it.kaart]){ perKaart[it.kaart] = { kaart: it.kaart, l: [] }; bl.push(perKaart[it.kaart]); }
        perKaart[it.kaart].l.push(i);
      } else bl.push({ l: [i] });
    });
    return bl;
  }
  /* k: alleen deze vragen (bij trek), op volgorde */
  function volgorde(items, code, versie, k){
    var bl = blokken(items || [], k);
    if (versie === 'B'){
      var nieuw = door(bl, code + '|volgorde|B|' + items.length);
      bl = nieuw.map(function(b){ return b.kaart ? { kaart: b.kaart, l: door(b.l, code + '|kaart|B|' + b.kaart) } : b; });
    }
    return [].concat.apply([], bl.map(function(b){ return b.l; }));
  }

  /* ---------- topografie: de kaart met nummers (zoals werkblad-topo.js) ---------- */
  function landVan(it){
    var m = window.KAARTEN && KAARTEN[it.kaart]; if (!m) return null;
    if (window.TOPO && TOPO.plek){ var l = TOPO.plek(it.kaart, it.plek); if (l) return l; }
    for (var i = 0; i < m.landen.length; i++) if (m.landen[i].n === it.naam) return m.landen[i];
    return null;
  }
  function kaartSvg(m, items){
    var soortVan = function(l){ return l.s || m.soort || 'vlak'; };
    var r = Math.max(9, Math.round(m.breed / 62)), fs = Math.round(r * 1.1);
    var s = '<svg class="topokaart" viewBox="0 0 ' + m.breed + ' ' + m.hoog + '" role="img" aria-label="Kaart van ' + schoon(m.naam) + ' met nummers">';
    if (m.achter) s += '<path class="achter" d="' + m.achter + '"/>';
    if (m.basisVan && KAARTEN[m.basisVan]) KAARTEN[m.basisVan].landen.forEach(function(l){ if (l.d) s += '<path class="basis" d="' + l.d + '"/>'; });
    var gekozen = {}; items.forEach(function(x){ gekozen[m.landen.indexOf(x.land)] = x.nr; });
    ['vlak', 'lijn', 'punt'].forEach(function(nu){
      m.landen.forEach(function(l, i){
        if (soortVan(l) !== nu) return;
        if (nu === 'vlak'){ if (l.d) s += '<path class="doel" d="' + l.d + '"/>'; }
        else if (nu === 'lijn'){ if (l.d) s += '<path class="rivier" d="' + l.d + '"/>'; }
        else s += '<circle class="stad' + (gekozen[i] ? ' aan' : '') + '" cx="' + l.x + '" cy="' + l.y + '" r="' + Math.round(r * 0.42) + '"/>';
      });
    });
    var plek = items.map(function(x){
      var l = x.land, punt = soortVan(l) === 'punt', px = l.x, py = l.y;
      if (punt){ px = l.x + (l.x > m.breed * 0.9 ? -r * 1.4 : r * 1.4); py = l.y + (l.y < r * 3 ? r * 1.4 : -r * 1.4); }
      return { nr: x.nr, ax: l.x, ay: l.y, x: px, y: py, punt: punt };
    });
    /* nummers die elkaar raken uit elkaar duwen, binnen de kaart */
    var min = r * 2 + 2;
    for (var ronde = 0; ronde < 60; ronde++){
      var geschoven = false;
      for (var i = 0; i < plek.length; i++) for (var j = i + 1; j < plek.length; j++){
        var a = plek[i], b = plek[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d >= min) continue;
        if (d < 0.01){ dx = 1; dy = 0; d = 1; }
        var duw = (min - d) / 2 + 0.5, ux = dx / d, uy = dy / d;
        a.x -= ux * duw; a.y -= uy * duw; b.x += ux * duw; b.y += uy * duw; geschoven = true;
      }
      plek.forEach(function(p){ p.x = Math.max(r + 1, Math.min(m.breed - r - 1, p.x)); p.y = Math.max(r + 1, Math.min(m.hoog - r - 1, p.y)); });
      if (!geschoven) break;
    }
    plek.forEach(function(p){
      var weg = Math.sqrt(Math.pow(p.x - p.ax, 2) + Math.pow(p.y - p.ay, 2)) > r * 0.9, x = Math.round(p.x * 10) / 10, y = Math.round(p.y * 10) / 10;
      s += '<g class="nr">' + (p.punt || weg ? '<line x1="' + p.ax + '" y1="' + p.ay + '" x2="' + x + '" y2="' + y + '"/>' : '') +
        (weg && !p.punt ? '<circle style="fill:#14224C;stroke:none" cx="' + p.ax + '" cy="' + p.ay + '" r="' + Math.max(2, r * 0.22) + '"/>' : '') +
        '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"/><text x="' + x + '" y="' + y + '" style="font-size:' + fs + 'px">' + p.nr + '</text></g>';
    });
    return s + '</svg>';
  }
  /* per kaart: welk nummer elke plek krijgt (door elkaar, anders verraadt de volgorde het antwoord) */
  function kaartNummers(items, orde, code, versie){
    var per = {}, volg = [];
    orde.forEach(function(i){
      var it = items[i]; if (it.vorm !== 'topo') return;
      var k = per[it.kaart]; if (!k){ k = per[it.kaart] = { kaart: it.kaart, plekken: [], nr: {} }; volg.push(k); }
      if (k.plekken.indexOf(it.plek) < 0) k.plekken.push(it.plek);
    });
    volg.forEach(function(k, n){
      k.volgnr = n + 1;
      schud(k.plekken.slice().sort(), code + '|nummers|' + versie + '|' + k.kaart).forEach(function(p, j){ k.nr[p] = j + 1; });
    });
    return { per: per, n: volg.length };
  }

  /* ---------- per vraag ---------- */
  function regels(n){ var s = ''; for (var i = 0; i < n; i++) s += '<span class="lijn"></span>'; return s; }
  function afbAdres(code, id){ return '/api/materiaal/' + code + '/afb/' + id; }
  function kiesuit(l){ return '<p class="kiesuit"><i>Kies uit:</i> ' + l.map(function(w){ return '<span>' + schoon(w) + '</span>'; }).join(' ') + '</p>'; }
  function wat(it){ var m = window.KAARTEN && KAARTEN[it.kaart]; return m && m.soort === 'gemengd' && it.wat ? ' (' + schoon(it.wat) + ')' : ''; }
  function opKaart(kn, it){ return kn.n > 1 ? ' op kaart ' + kn.per[it.kaart].volgnr : ' op de kaart'; }
  /* wat een vraag op papier is, en het antwoord in het nakijkmodel */
  function vraag(it, code, versie, kn, hulp, klad){
    var z = zaadVan(code, it), v = it.vorm, h = '', ant = '';
    var beeld = it.afb && v !== 'aanwijzen' ? '<div class="beeld"><img alt="" src="' + schoon(afbAdres(code, it.afb)) + '"></div>' : '';
    var tekst = '<span class="vr">' + schoon(it.vraag) + '</span>';
    if (v === 'mk'){
      var o = perVersie([it.goed].concat(it.fout || []), z, versie);
      var keus = '<div class="opties">' + o.map(function(w, i){ return '<span><b>' + LETTERS[i] + '</b>' + schoon(w) + '</span>'; }).join('') + '</div>';
      /* een rekenvraag (of kladruimte bij elke vraag): de keuzes met een vak met ruitjes ernaast */
      var mkKlad = window.OPENPAPIER && klad && (klad === 'ruim' || (klad !== 'geen' && OPENPAPIER.isReken(it)));
      h = tekst + beeld + (mkKlad ? '<div class="op-mkklad">' + keus + OPENPAPIER.klad('mk') + '</div>' : keus);
      ant = LETTERS[o.indexOf(it.goed)] + ': ' + schoon(it.goed);
    } else if (v === 'open'){
      /* de ruimte past bij het antwoord: een vak, een regel of een regel per punt (open-papier.js) */
      h = window.OPENPAPIER ? OPENPAPIER.open(it, { kop:'<span class="vr">' + OPENPAPIER.vraagHtml(it.vraag) + '</span>', beeld:beeld, hulp:hulp, klad:klad || 'reken' })
        : tekst + beeld + regels((it.punten || 1) >= 4 ? 5 : (it.punten || 1) >= 2 ? 3 : 2);
      ant = (it.antwoorden || []).length ? (it.antwoorden || []).map(schoon).join(' <i>of</i> ') : '<i>Geen antwoord opgegeven: zelf beoordelen.</i>';
    } else if (v === 'koppel'){
      var rechts = perVersie(it.paren.map(function(p){ return p.b; }), z, versie);
      h = tekst + beeld + '<span class="opdr">Schrijf bij elk nummer de letter die erbij hoort.</span><table class="pkoppel"><tbody>' +
        it.paren.map(function(p, i){ return '<tr><td class="nr">' + (i + 1) + '</td><td>' + schoon(p.a) + '</td><td><i class="hokje"></i></td><td class="tussen"></td>' +
          '<td class="nr">' + LETTERS[i] + '</td><td>' + schoon(rechts[i]) + '</td></tr>'; }).join('') + '</tbody></table>';
      ant = it.paren.map(function(p, i){ return (i + 1) + ' ' + LETTERS[rechts.indexOf(p.b)]; }).join(' · ');
    } else if (v === 'volgorde'){
      var st = perVersie(it.stappen, z, versie);
      h = tekst + beeld + '<span class="opdr">Zet in elk hokje een nummer: 1 is de eerste.</span><ul class="hokjes">' + st.map(function(s){ return '<li><i class="hokje"></i>' + schoon(s) + '</li>'; }).join('') + '</ul>';
      ant = 'van boven naar beneden: ' + st.map(function(s){ return it.stappen.indexOf(s) + 1; }).join(', ');
    } else if (v === 'groepen'){
      var alle = []; it.groepen.forEach(function(g){ g.dingen.forEach(function(d){ alle.push({ d: d, g: g.naam }); }); });
      var dd = perVersie(alle, z, versie);
      h = tekst + beeld + '<span class="opdr">Zet een kruisje in de kolom van de goede groep.</span><table class="groepen"><thead><tr><th></th>' +
        it.groepen.map(function(g){ return '<th>' + schoon(g.naam) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        dd.map(function(x){ return '<tr><td>' + schoon(x.d) + '</td>' + it.groepen.map(function(){ return '<td><i class="hokje"></i></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
      ant = dd.map(function(x){ return schoon(x.d) + ': ' + schoon(x.g); }).join(' · ');
    } else if (v === 'gaten'){
      var g = gatenVan(it.tekst), k = 0;
      var zin = schoon(it.tekst).replace(/\[[^\]]+\]/g, function(){ k++; return '<span class="pgat"><small>' + k + '</small></span>'; });
      h = tekst + beeld + '<p class="pgatentekst">' + zin + '</p>' + kiesuit(perVersie(g.concat(it.extra || []), z, versie));
      ant = g.map(function(w, i){ return '(' + (i + 1) + ') ' + schoon(w); }).join(' · ');
    } else if (v === 'aanwijzen'){
      h = tekst + (it.afb ? '<div class="aanwijsbeeld"><img alt="" src="' + schoon(afbAdres(code, it.afb)) + '">' +
          it.plekken.map(function(p, i){ return '<span class="stip" style="left:' + Number(p.x) + '%;top:' + Number(p.y) + '%">' + (i + 1) + '</span>'; }).join('') + '</div>' : '') +
        '<ol class="aanwijslijnen">' + it.plekken.map(function(p, i){ return '<li><b>' + (i + 1) + '</b><span class="lijn"></span></li>'; }).join('') + '</ol>' +
        kiesuit(perVersie(it.plekken.map(function(p){ return p.naam; }).concat(it.extra || []), z, versie));
      ant = it.plekken.map(function(p, i){ return (i + 1) + ' ' + schoon(p.naam); }).join(' · ');
    } else if (v === 'schema' && window.SCHEMA){
      /* een invulschema: dezelfde vakjes als op het scherm, leeg; het nakijkmodel vult ze in */
      h = tekst + beeld + SCHEMA.html(it, { modus: 'leeg' });
      ant = SCHEMA.html(it, { modus: 'model' });
    } else if (v === 'topo'){
      var kaart = kn.per[it.kaart], nr = kaart && landVan(it) ? kaart.nr[it.plek] : null;
      if (!nr){
        h = '<span class="vr">' + schoon(it.naam || it.plek) + '</span><p class="nietpapier">Deze kaartvraag kan niet op papier: de kaart laadt niet. Streep hem door, of laat hem in de site niet meetellen.</p>';
        ant = schoon(it.naam);
      } else if (it.wijze === 'typ'){
        h = '<span class="vr">Schrijf de naam van nummer ' + nr + opKaart(kn, it) + '.</span><span class="lijn"></span>';
        ant = schoon(it.naam) + ((it.namen || []).length > 1 ? ' <small>(ook goed: ' + it.namen.filter(function(x){ return x !== it.naam; }).map(schoon).join(', ') + ')</small>' : '');
      } else if (it.wijze === 'kies'){
        var ko = perVersie([it.naam].concat(it.fout || []), z, versie);
        h = '<span class="vr">Welke naam hoort bij nummer ' + nr + opKaart(kn, it) + '?</span><div class="opties">' + ko.map(function(w, i){ return '<span><b>' + LETTERS[i] + '</b>' + schoon(w) + '</span>'; }).join('') + '</div>';
        ant = LETTERS[ko.indexOf(it.naam)] + ': ' + schoon(it.naam);
      } else {
        h = '<span class="vr">Welk nummer' + opKaart(kn, it) + ' is ' + schoon(it.naam) + wat(it) + '? <i class="hokje"></i></span>';
        ant = 'nummer ' + nr;
      }
    }
    return { html: h, ant: ant };
  }
  function kort(it){
    if (it.vorm === 'topo') return (it.naam || it.plek) + ' (' + ({ wijs: 'aanwijzen', typ: 'naam schrijven', kies: 'kiezen' }[it.wijze] || 'kaart') + ')';
    if (it.vorm === 'gaten') return String(it.tekst || '').replace(/\[([^\]]+)\]/g, '…');
    return it.vraag || '';
  }
  function puntenVan(items){ return items.reduce(function(a, it){ return a + (it.punten || 1); }, 0); }
  function pt(n){ return n + (n === 1 ? ' punt' : ' punten'); }

  /* ---------- woordjes als tabel ----------
     Vier of meer woordvragen achter elkaar, in dezelfde stijl, worden een tabel met de opdracht
     er een keer boven. Ze houden hun eigen nummer, dus het invoeren van de punten blijft gelijk. */
  var TABEL_VANAF = 4;
  function zelfdeSoort(a, b){ var x = OPENPAPIER.woord(a.vraag), y = OPENPAPIER.woord(b.vraag); return x.stijl === y.stijl && x.naar === y.naar; }
  function tabelStukken(items, orde){
    var uit = [], k = 0;
    while (k < orde.length){
      var j = k;
      if (window.OPENPAPIER && OPENPAPIER.kanTabel(items[orde[k]]))
        while (j + 1 < orde.length && OPENPAPIER.kanTabel(items[orde[j + 1]]) && zelfdeSoort(items[orde[k]], items[orde[j + 1]])) j++;
      uit.push(j - k + 1 >= TABEL_VANAF ? { tabel:orde.slice(k, j + 1) } : { i:orde[k] });
      k = j - k + 1 >= TABEL_VANAF ? j + 1 : k + 1;
    }
    return uit;
  }
  /* de woordbank: de antwoorden van de tabel en een woord dat niet op het blad staat, door elkaar */
  function woordbank(items, orde, stuk, zaad){
    var l = stuk.map(function(i){ return items[i].antwoorden[0]; }), op = {};
    orde.forEach(function(i){ op[i] = 1; });
    var over = items.map(function(it, i){ return i; }).filter(function(i){ return !op[i] && OPENPAPIER.kanTabel(items[i]) && l.indexOf(items[i].antwoorden[0]) < 0; });
    if (over.length) l.push(items[schud(over, zaad + '|extra')[0]].antwoorden[0]);
    return schud(l, zaad);
  }

  /* ---------- het blad ----------
     o.hulp: geen, letter, hokjes of bank (open-papier.js); o.alleenB: versie A zonder hulp */
  function hulpVan(o, versie){ o = o || {}; return !o.hulp || o.hulp === 'geen' || (o.alleenB && versie !== 'B') ? 'geen' : o.hulp; }
  function toets(m, code, versie, o){
    var items = m.items || [], orde = volgorde(items, code, versie, getrokken(code, versie, items.length, m.trek)), kn = kaartNummers(items, orde, code, versie), getekend = {};
    var op = orde.map(function(i){ return items[i]; }), hulp = hulpVan(o, versie);
    var heeftMk = op.some(function(it){ return it.vorm === 'mk' || (it.vorm === 'topo' && it.wijze === 'kies'); });
    var li = [];
    tabelStukken(items, orde).forEach(function(st, k){
      if (st.tabel){ li.push(OPENPAPIER.tabel(st.tabel.map(function(i){ return items[i]; }), hulp, hulp === 'bank' ? woordbank(items, orde, st.tabel, code + '|bank|' + versie + '|' + k) : null)); return; }
      var i = st.i, it = items[i];
      /* de kaart staat een keer, boven de eerste vraag erover */
      if (it.vorm === 'topo' && !getekend[it.kaart]){
        getekend[it.kaart] = true;
        var kaart = kn.per[it.kaart], km = window.KAARTEN && KAARTEN[it.kaart];
        var nrs = orde.map(function(j, x){ return items[j].vorm === 'topo' && items[j].kaart === it.kaart ? x + 1 : 0; }).filter(Boolean);
        var welke = nrs.length > 1 ? 'vraag ' + nrs[0] + ' tot en met ' + nrs[nrs.length - 1] : 'vraag ' + nrs[0];
        if (km){
          var mee = kaart.plekken.map(function(p){ var l = landVan({ kaart: it.kaart, plek: p, naam: (items.filter(function(y){ return y.plek === p; })[0] || {}).naam }); return l ? { land: l, nr: kaart.nr[p] } : null; }).filter(Boolean);
          li.push('<li class="kaartblok"><span class="odkop">' + (kn.n > 1 ? 'Kaart ' + kaart.volgnr + ': ' : 'Kaart: ') + schoon(km.naam) + ', bij ' + welke + '</span>' + kaartSvg(km, mee) + '</li>');
        }
      }
      var x = vraag(it, code, versie, kn, hulp, o.klad || 'reken');
      li.push('<li><span class="ptvak"><i></i>/ ' + (it.punten || 1) + '</span>' + x.html + '</li>');
    });
    return '<article class="blad toetsblad" data-versie="' + versie + '" aria-label="Toets, versie ' + versie + '">' +
      '<div class="bkop"><div class="bkoptekst"><h2>' + schoon(m.naam) + '</h2><p class="sub">' + op.length + (op.length === 1 ? ' vraag' : ' vragen') + ' · ' + pt(puntenVan(op)) + (hulp !== 'geen' ? ' · met hulp' : '') + '</p></div>' +
        '<div class="bkoprechts"><span class="versiemerk" aria-label="Versie ' + versie + '"><small>versie</small>' + versie + '</span><span class="cijfervak"><small>cijfer</small></span></div></div>' +
      '<div class="invul"><span>Naam</span><span></span><span>Klas</span><span></span><span>Datum</span><span></span></div>' +
      '<p class="bladintro">' + (heeftMk ? 'Omcirkel bij meerkeuze de letter van het goede antwoord. ' : '') + 'Rechts naast elke vraag staat hoeveel punten hij waard is.</p>' +
      '<ol class="pv">' + li.join('') + '</ol>' +
      '<p class="voet">' + schoon(m.naam) + ' · versie ' + versie + ' · meneergreidanus.nl</p></article>' +
      (o.kladblad ? kladblad(m, versie, op.length) : '');
  }
  /* Een kladblad achter de toets: een vak per vraag (het nummer schrijft de leerling erbij) en vrij kladpapier */
  function kladblad(m, versie, n){
    var vakken = '';
    for (var i = 0; i < Math.min(4, Math.max(2, n)); i++) vakken += '<span class="op-klad"><small>Vraag <span class="kb-nr"></span></small></span>';
    return '<article class="blad kladblad" data-versie="' + versie + '" aria-label="Kladpapier, versie ' + versie + '">' +
      '<div class="bkop"><div class="bkoptekst"><p class="bovenkop">Kladpapier</p><h2>' + schoon(m.naam) + '</h2><p class="sub">Versie ' + versie + '</p></div>' +
        '<div class="invul" style="min-width:220px"><span>Naam</span><span></span></div></div>' +
      '<p class="bladintro">Reken hier uit wat niet in het vak bij de vraag past. Zet het nummer van de vraag erbij en lever dit blad in met je toets.</p>' +
      '<div class="kb-vakken">' + vakken + '<span class="op-klad kb-vrij"><small>Vrij kladpapier</small></span></div>' +
      '<p class="voet">' + schoon(m.naam) + ' · kladpapier · versie ' + versie + '</p></article>';
  }
  function model(m, code, versie){
    var items = m.items || [], orde = volgorde(items, code, versie, getrokken(code, versie, items.length, m.trek)), kn = kaartNummers(items, orde, code, versie);
    var anders = versie === 'B' || orde.some(function(i, k){ return i !== k; });
    var op = orde.map(function(i){ return items[i]; });
    var deels = op.some(function(it){ return /^(koppel|volgorde|groepen|gaten|aanwijzen|schema)$/.test(it.vorm); });
    var stempel = window.NAGEKEKEN && NAGEKEKEN.stempel ? '<span class="stempel" aria-hidden="true">' + NAGEKEKEN.stempel({ maat: 74 }) + '</span>' : '';
    return '<article class="blad modelblad" data-versie="' + versie + '" aria-label="Nakijkmodel, versie ' + versie + '">' +
      '<div class="bkop"><div class="bkoptekst"><h2>Nakijkmodel: ' + schoon(m.naam) + '</h2><p class="sub">Versie ' + versie + ' · ' + pt(puntenVan(op)) + '</p></div>' + stempel + '</div>' +
      (deels ? '<p class="bladintro">Bij koppelen, volgorde, groepen, gatenteksten, aanwijzen en schema’s telt elk goed deel even zwaar, net als in de site.</p>' : '') +
      '<ol class="pv antw">' + tabelStukken(items, orde).map(function(st){
        /* woordjes die op het blad een tabel zijn, staan hier ook zo: woord en antwoord */
        if (st.tabel) return OPENPAPIER.modelTabel(st.tabel.map(function(i){ return items[i]; }), function(it){ return vraag(it, code, versie, kn).ant; });
        var i = st.i, it = items[i], x = vraag(it, code, versie, kn);
        return '<li><span class="ptvak">' + pt(it.punten || 1) + '</span><span class="vr">' + schoon(kort(it)) + (anders ? ' <small class="echt">in de site vraag ' + (i + 1) + '</small>' : '') + '</span>' +
          '<span class="goed">' + x.ant + '</span>' + (it.uitleg ? '<small>' + schoon(it.uitleg) + '</small>' : '') + '</li>';
      }).join('') + '</ol>' +
      '<p class="voet">Voer de punten in bij Resultaten, Papieren toets invoeren. Kies daar versie ' + versie + '; de site zet ze terug bij de goede vragen.</p></article>';
  }
  return { volgorde: volgorde, toets: toets, model: model, kort: kort, getrokken: getrokken };
})();
if (typeof module !== 'undefined') module.exports = PAPIER;
