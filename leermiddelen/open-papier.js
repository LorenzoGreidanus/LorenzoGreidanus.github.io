/* Open vragen op papier en woordvragen. De ruimte voor een antwoord past bij dat antwoord:
   een woord of getal krijgt een vak, een zin een schrijfregel, een uitleg een regel per punt,
   een rekenvraag kladruimte met ruitjes en een antwoordvak. Woordjes achter elkaar worden
   een tabel, met de opdracht er een keer boven. Gebruikt door papier.js (de papieren toets),
   werkblad.html, maken.html en oefen.html (de woordvraag op het scherm).

     OPENPAPIER.STIJLEN                    -> de manieren om een woordvraag te stellen
     OPENPAPIER.maakVraag(stijl, woord, o) -> de vraag in die stijl; o: { naar, zin }
     OPENPAPIER.woord(vraag)               -> een woordvraag herkennen: { stijl, woord, naar, zin } of null
     OPENPAPIER.vraagHtml(vraag)           -> de vraag met het woord vet (en groot bij de stijl groot)
     OPENPAPIER.open(it, o)                -> een open vraag op papier; o: { kop, beeld, hulp }
     OPENPAPIER.kanTabel(it)               -> mag deze vraag in een woordentabel
     OPENPAPIER.tabel(lijst, hulp, bank)   -> woordvragen als tabel; bank: de woorden om uit te kiezen
     OPENPAPIER.modelTabel(lijst, ant)     -> dezelfde tabel in het nakijkmodel; ant(it): het antwoord (html)

   De stijl zit in de tekst van de vraag zelf ("Wat betekent braces?"), zodat de server, de
   resultaten en het nakijken niets nieuws hoeven te weten. Overal waar de vraag gewoon als
   tekst staat, leest hij goed. */
var OPENPAPIER = (function(){
  'use strict';
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }

  /* ---------- de woordvraag ---------- */
  var STIJLEN = [
    { id:'betekent', naam:'Wat betekent braces?' },
    { id:'vertaal', naam:'Vertaal: braces' },
    { id:'groot', naam:'braces groot, de vraag eronder' },
    { id:'zin', naam:'In een zin (als je een zin geeft)' }
  ];
  /* naar: de taal van het antwoord. Nederlands (of leeg) vraagt wat een woord betekent;
     een andere taal vraagt hoe je het daarin zegt. */
  function maakVraag(stijl, woord, o){
    o = o || {}; woord = String(woord || '').replace(/\s+/g, ' ').trim();
    var naar = o.naar || '', nl = !naar || naar === 'Nederlands';
    if (stijl === 'vertaal') return (naar ? 'Vertaal naar het ' + naar + ': ' : 'Vertaal: ') + woord;
    if (stijl === 'groot') return woord + ' (in het ' + (naar || 'Nederlands') + ')';
    if (stijl === 'zin' && nl && o.zin) return '“' + String(o.zin).replace(/\s+/g, ' ').trim() + '” Wat betekent ' + woord + ' in deze zin?';
    return nl ? 'Wat betekent ' + woord + '?' : 'Hoe zeg je ' + woord + ' in het ' + naar + '?';
  }
  var HERKEN = [
    [/^Vertaal(?: naar het (\w+))?:\s*(.+)$/, function(m){ return { stijl:'vertaal', woord:m[2], naar:m[1] || '' }; }],
    [/^“(.+)” Wat betekent (.+) in deze zin\?$/, function(m){ return { stijl:'zin', woord:m[2], naar:'Nederlands', zin:m[1] }; }],
    [/^Wat betekent (.+)\?$/, function(m){ return { stijl:'betekent', woord:m[1], naar:'Nederlands' }; }],
    [/^Hoe zeg je (.+) in het (\w+)\?$/, function(m){ return { stijl:'betekent', woord:m[1], naar:m[2] }; }],
    [/^(.+) \(in het (\w+)\)$/, function(m){ return { stijl:'groot', woord:m[1], naar:m[2] }; }]
  ];
  /* alleen een woord of een korte woordgroep telt; "Wat betekent het als de rente stijgt?" niet */
  function woord(vraag){
    var v = String(vraag || '').trim();
    for (var i = 0; i < HERKEN.length; i++){
      var m = v.match(HERKEN[i][0]);
      if (m){ var w = HERKEN[i][1](m); w.woord = w.woord.trim(); return w.woord && w.woord.length <= 40 && w.woord.split(' ').length <= 5 ? w : null; }
    }
    return null;
  }
  function vet(w){ return '<b class="ow-w">' + schoon(w) + '</b>'; }
  function vraagHtml(vraag){
    var v = String(vraag || ''), w = woord(v);
    if (!w) return schoon(v);
    if (w.stijl === 'groot') return '<span class="ow-groot">' + schoon(w.woord) + '</span><span class="ow-sub">Wat is dit in het ' + schoon(w.naar) + '?</span>';
    if (w.stijl === 'zin'){
      var z = schoon(w.zin), sw = schoon(w.woord), k = z.toLowerCase().indexOf(sw.toLowerCase());
      if (k >= 0) z = z.slice(0, k) + '<b>' + z.slice(k, k + sw.length) + '</b>' + z.slice(k + sw.length);
      return '<span class="ow-zin">“' + z + '”</span> Wat betekent ' + vet(w.woord) + ' in deze zin?';
    }
    var plek = v.lastIndexOf(w.woord);
    return schoon(v.slice(0, plek)) + vet(w.woord) + schoon(v.slice(plek + w.woord.length));
  }

  /* ---------- steuntjes ----------
     hulp: geen, letter (de eerste letter staat er al), hokjes (een hokje per letter, de eerste
     ingevuld) of bank (een woordbank boven de woordentabel). Hokjes alleen als elk goed
     antwoord even lang is: anders zou het blad een goed antwoord fout laten lijken. */
  function steun(ants, hulp){
    if (!ants.length || (hulp !== 'letter' && hulp !== 'hokjes')) return null;
    var a = ants[0], e = a.charAt(0).toLowerCase();
    if (/\d/.test(a)) return null;
    if (hulp === 'hokjes' && a.length <= 16 && a.split(' ').length <= 2 && ants.every(function(x){ return x.length === a.length; })) return { hokjes:a };
    if (/[a-zà-ÿ]/i.test(e) && ants.every(function(x){ return x.charAt(0).toLowerCase() === e; })) return { letter:a.charAt(0) };
    return null;
  }
  function hokjes(a){
    return '<span class="op-hokjes" aria-label="' + a.length + ' tekens">' + a.split('').map(function(c, i){
      return c === ' ' ? '<i class="op-l op-spatie"></i>' : '<i class="op-l' + (i ? '' : ' op-gegeven') + '">' + (i ? '' : schoon(c)) + '</i>';
    }).join('') + '</span>';
  }

  /* ---------- de ruimte voor het antwoord ---------- */
  var GETAL = /^[-−]?\d[\d.,]*$/, MET_EENHEID = /^([-−]?\d[\d.,]*)\s+([^\d\s].{0,24})$/;
  var KLAD = /staartdeling|onder elkaar|bereken|reken uit|laat zien|uitwerking|hoeveel .* nodig/i;
  var LIJST = /\b(?:noem|geef|schrijf)\s+(twee|drie|vier|vijf|[2-5])\b/i, TAL = { twee:2, drie:3, vier:4, vijf:5 };
  function vak(binnen, breed){ return '<span class="op-vak"><small>Antwoord</small><span class="op-box"' + (breed ? ' style="width:' + breed + 'px"' : '') + '>' + (binnen || '') + '</span></span>'; }
  function regel(label, begin){ return '<span class="op-regel">' + (label ? '<b>' + schoon(label) + '</b>' : '') + (begin ? '<span class="op-begin">' + schoon(begin) + '</span>' : '') + '</span>'; }
  /* het vak naast de vraag; met een plaatje eronder komt het vak onder het plaatje */
  function naast(kop, beeld, plek){ return beeld ? kop + beeld + '<div class="op-rekenrij">' + plek + '</div>' : '<div class="op-kort"><div class="op-kop">' + kop + '</div>' + plek + '</div>'; }
  function langste(l){ return l.reduce(function(n, x){ return Math.max(n, x.length); }, 0); }
  /* kop: de vraag zoals hij er al staat (html); beeld: een plaatje eronder (html) */
  function open(it, o){
    o = o || {};
    var ants = (it.antwoorden || []).map(function(x){ return String(x).trim(); }).filter(Boolean), pt = it.punten || 1;
    var kop = o.kop || '', beeld = o.beeld || '', vraag = String(it.vraag || '');
    /* een getal, eventueel met een eenheid: een antwoordvak, en kladruimte als er gerekend wordt */
    if (ants.length && ants.every(function(a){ return GETAL.test(a) || MET_EENHEID.test(a); })){
      /* de eenheid alleen als de vraag hem al noemt (bussen); anders verklapt hij het antwoord (cm of m) */
      var eenheid = ants.map(function(a){ return (a.match(MET_EENHEID) || [])[2]; }).filter(Boolean)[0] || '';
      var zelf = eenheid && vraag.toLowerCase().indexOf(eenheid.toLowerCase()) < 0;
      if (zelf) eenheid = '';
      var cijfers = ants.map(function(a){ return (a.match(MET_EENHEID) || [0, a])[1].replace(/\s/g, ''); });
      var klad = !it.afb && !beeld && (pt >= 2 || KLAD.test(vraag));
      /* schrijft de leerling de eenheid zelf, dan past die ook in het vak */
      var breed = Math.max(76, Math.min(220, 26 + langste(zelf ? ants : cijfers) * 13));
      /* een getal in het DHTE-schema: een hokje per cijfer, met de punt waar hij hoort */
      var d = cijfers[0].replace(/\D/g, '');
      if (/DHTE|HTE-schema/.test(vraag) && !klad && !eenheid && !it.afb && !beeld && /^\d{2,5}$/.test(d) && cijfers.every(function(c){ return c.replace(/\D/g, '') === d; }))
        return kop + beeld + '<div class="op-rekenrij"><span class="op-vak"><small>Antwoord</small><span class="op-cijfers">' + d.split('').map(function(c, i){
          return (d.length >= 4 && i === d.length - 3 ? '<b class="op-punt">.</b>' : '') + '<i class="op-l op-cijfer"></i>'; }).join('') + '</span></span><span class="op-tip">één cijfer per hokje</span></div>';
      var antw = '<span class="op-antw"><small>Antwoord</small><span class="op-box" style="width:' + breed + 'px"></span>' +
        (eenheid ? '<span class="op-eenheid">' + schoon(eenheid) + '</span>' : '') + '</span>';
      /* zonder kladruimte alleen het vak, met de eenheid erachter */
      if (!klad) return naast(kop, beeld, vak('', breed) + (eenheid ? '<span class="op-eenheid">' + schoon(eenheid) + '</span>' : ''));
      return kop + beeld + '<div class="op-reken"><span class="op-klad' + (pt >= 2 ? ' op-hoog' : '') + '"><small>Kladruimte</small></span>' +
        '<span class="op-antwkant">' + antw + (pt === 2 ? '<small class="op-tip">1 punt voor de berekening, 1 voor het antwoord</small>' : '') + '</span></div>';
    }
    /* een woord of een paar woorden: een vak achter de vraag, zo breed als het antwoord */
    var lang = langste(ants), s = steun(ants, o.hulp);
    if (ants.length && lang <= 24 && pt <= 1 && !it.begin){
      var binnen = s && s.letter ? '<span class="op-letter">' + schoon(s.letter) + '</span>' : '';
      var plekje = s && s.hokjes ? '<span class="op-vak"><small>Antwoord</small>' + hokjes(s.hokjes) + '</span>' : vak(binnen, Math.max(110, Math.min(300, 34 + lang * 11)));
      return naast(kop, beeld, plekje);
    }
    /* zinnen: "Noem twee ..." krijgt een genummerde regel per ding; anders een regel voor een
       korte zin en meer naarmate de vraag meer punten waard is */
    var m = vraag.match(LIJST), h = '', n, i;
    if (m){
      n = TAL[m[1].toLowerCase()] || Number(m[1]);
      for (i = 0; i < n; i++) h += regel(String(i + 1), i ? '' : it.begin);
    } else {
      n = pt >= 2 ? Math.min(6, pt + 1) : ants.length && lang <= 70 ? 1 : 2;
      for (i = 0; i < n; i++) h += regel('', i ? '' : it.begin);
    }
    return kop + beeld + '<div class="op-regels">' + h + '</div>';
  }

  /* ---------- de woordentabel ---------- */
  function kanTabel(it){
    if (!it || it.vorm !== 'open' || it.afb || it.begin || (it.punten || 1) !== 1) return false;
    var w = woord(it.vraag), ants = it.antwoorden || [];
    return !!(w && w.stijl !== 'zin' && ants.length && langste(ants) <= 30);
  }
  function opdracht(w){
    if (w.stijl === 'vertaal' && !w.naar) return 'Vertaal de woorden: schrijf de vertaling achter elk woord.';
    if (w.naar && w.naar !== 'Nederlands') return 'Schrijf achter elk woord hoe je het zegt in het ' + w.naar + '.';
    return 'Schrijf achter elk woord wat het betekent in het Nederlands.';
  }
  /* lijst: de vragen van de tabel, op volgorde; ze tellen mee in de nummers van het blad */
  function tabel(lijst, hulp, bank){
    var w = woord(lijst[0].vraag);
    return '<li class="op-tabelli"><p class="op-opdr">' + schoon(opdracht(w)) + ' <span>Elk woord is 1 punt.</span></p>' +
      (hulp === 'bank' && bank && bank.length ? '<p class="op-bank"><i>Kies uit:</i> ' + bank.map(function(b){ return '<span>' + schoon(b) + '</span>'; }).join(' ') + '</p>' : '') +
      /* letterhokjes zijn breder dan een schrijfregel: dan een kolom */
      '<div class="op-tabel' + (hulp === 'hokjes' ? ' op-een' : '') + '">' + lijst.map(function(it){
        var s = steun(it.antwoorden || [], hulp);
        return '<div class="op-rij"><span class="op-w">' + schoon(woord(it.vraag).woord) + '</span><span class="op-schrijf">' +
          (s && s.hokjes ? hokjes(s.hokjes) : s && s.letter ? '<span class="op-letter">' + schoon(s.letter) + '</span>' : '') + '</span><i class="op-pt" aria-hidden="true"></i></div>';
      }).join('') + '</div></li>';
  }

  /* in het nakijkmodel: het woord en het antwoord, twee kolommen, dezelfde nummers */
  function modelTabel(lijst, ant){
    return '<li class="op-tabelli"><div class="op-tabel op-model">' + lijst.map(function(it){
      return '<div class="op-rij"><span class="op-w">' + schoon(woord(it.vraag).woord) + '</span><span class="op-goed">' + ant(it) + '</span></div>';
    }).join('') + '</div></li>';
  }

  return { STIJLEN:STIJLEN, maakVraag:maakVraag, woord:woord, vraagHtml:vraagHtml, open:open, kanTabel:kanTabel, tabel:tabel, modelTabel:modelTabel };
})();
if (typeof module !== 'undefined') module.exports = OPENPAPIER;
