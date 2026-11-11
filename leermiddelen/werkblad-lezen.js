/* Werkblad Lezen: een echte tekst (folder, bericht, bronnen, artikel) met het
   kaartje "Zo lees je" en opdrachten waarbij je een leesstrategie of een
   leesvaardigheid echt doet. De doelen staan in leesbank.js; de teksten
   (leesteksten.js) en de opmaak (leesblad.js) laden pas als je dit blad kiest.

   De keuzes gaan mee in de link (deel=): het doel, het niveau (n1F, n2F, n3F),
   een vaste tekst (t-<id>) en zo / tijd als die aan staan. */
(function(){
  'use strict';
  if (!window.SPELBLAD || !window.LEESBANK) return;
  var B = window.LEESBANK;
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), h = a[i]; a[i] = a[j]; a[j] = h; } return a; }
  function waarde(el, naam){ var x = el.querySelector('input[name="' + naam + '"]:checked'); return x ? x.value : ''; }

  /* ---------- laden: de teksten en de opmaak, een keer ---------- */
  var laden = null;
  function script(src){ return new Promise(function(klaar, mis){ var s = document.createElement('script'); s.src = src; s.onload = klaar; s.onerror = mis; document.head.appendChild(s); }); }
  function laad(){
    if (window.LEESBLAD && B.TEKSTEN.length) return Promise.resolve();
    if (laden) return laden;
    laden = Promise.all([window.LEESBLAD ? null : script('leesblad.js?v=4'), B.TEKSTEN.length ? null : script('leesteksten.js?v=1')])
      .then(function(){}, function(e){ laden = null; throw e; });
    return laden;
  }
  window.LEZEN_LAAD = laad;

  function nivVan(rang){ return rang <= 1 ? '1F' : rang === 2 ? '2F' : '3F'; }
  function keus(naam, waarde, tekst, aan, extra){ return '<label><input type="radio" name="' + naam + '" value="' + schoon(waarde) + '"' + (aan ? ' checked' : '') + '> ' + schoon(tekst) + (extra || '') + '</label>'; }
  function vink(naam, waarde, tekst, aan){ return '<label><input type="checkbox" name="' + naam + '" value="' + schoon(waarde) + '"' + (aan ? ' checked' : '') + '> ' + schoon(tekst) + '</label>'; }
  function kop(t){ return '<p class="kop">' + schoon(t) + '</p>'; }

  function tekenOpnieuw(aan){
    var b = document.getElementById('blad'), d = document.getElementById('delen');
    if (b && b.value === 'lezen' && d) d.innerHTML = delenHtml(aan);
  }
  function delenHtml(aan){
    aan = aan || [];
    var doel = B.DOELEN.filter(function(d){ return aan.indexOf(d.id) >= 0; })[0] || B.DOELEN[0];
    var niv = (aan.filter(function(x){ return /^n[123]F$/.test(x); })[0] || '').slice(1) || '';
    var vast = (aan.filter(function(x){ return /^t-/.test(x); })[0] || '').slice(2);
    var h = kop('Leesstrategie') + B.DOELEN.filter(function(d){ return d.soort === 'strategie'; }).map(function(d){ return keus('lzdoel', d.id, d.naam, d === doel); }).join('') +
      kop('Leesvaardigheid') + B.DOELEN.filter(function(d){ return d.soort === 'vaardigheid'; }).map(function(d){ return keus('lzdoel', d.id, d.naam, d === doel); }).join('') +
      kop('Niveau') + B.NIVEAUS.map(function(n){ return keus('lzniv', 'n' + n.id, n.naam, niv ? niv === n.id : false); }).join('') +
      '<input type="radio" name="lzniv" value="" hidden' + (niv ? '' : ' checked') + '>';
    if (B.TEKSTEN.length){
      var lijst = B.teksten(doel.id, niv || null);
      h += kop('Tekst') + keus('lztekst', '', 'Verrassing', !vast || !lijst.some(function(t){ return t.id === vast; })) +
        lijst.map(function(t){ return keus('lztekst', 't-' + t.id, t.titel, t.id === vast, niv ? '' : ' <small>' + t.niv + '</small>'); }).join('');
    } else laad().then(function(){ tekenOpnieuw(aan); }, function(){});
    var vers = !aan.length;
    h += kop('Op het blad') + vink('lzmet', 'zo', 'Het kaartje Zo lees je', vers || aan.indexOf('zo') >= 0) + vink('lzmet', 'tijd', 'Vakjes voor de tijd', vers || aan.indexOf('tijd') >= 0);
    return h;
  }

  window.SPELBLAD.lezen = {
    naam:'Lezen', kort:'Leesstrategieën en vaardigheden met een echte tekst', icoon:'boek', vak:'ned', eigenNiveau:true,
    aantallen:[1, 2, 3], standaard:1, aantalNaam:'Aantal teksten',
    delenKop:'Wat oefen je',
    delenTip:'Kies een strategie of een vaardigheid. Elk blad heeft een tekst zoals in het echt (een folder, een bericht, een artikel), een kaartje met de aanpak en opdrachten om in te vullen. Zonder niveau kiest het blad het niveau van de klas.',
    delen:function(aan){ return delenHtml(aan); },
    lees:function(el, rang){
      var met = [].map.call(el.querySelectorAll('input[name="lzmet"]:checked'), function(x){ return x.value; });
      return { doel:waarde(el, 'lzdoel') || 'verkennend', niv:(waarde(el, 'lzniv') || '').slice(1) || nivVan(rang), tekst:(waarde(el, 'lztekst') || '').slice(2),
        zo:met.indexOf('zo') >= 0, tijd:met.indexOf('tijd') >= 0, eigenNiv:!!waarde(el, 'lzniv') };
    },
    maak:function(o, n){
      return laad().then(function(){
        var pot = B.teksten(o.doel, o.niv);
        if (!pot.length) pot = B.teksten(o.doel);
        if (!pot.length) return { fout:'Hier zijn nog geen teksten voor. Kies een andere strategie of vaardigheid.' };
        var vast = o.tekst ? B.tekst(o.tekst) : null;
        var lijst = schud(pot.filter(function(t){ return t !== vast; }));
        if (vast && (vast.taken[o.doel] || []).length) lijst.unshift(vast);
        return lijst.slice(0, n).map(function(t){ var p = LEESBLAD.bereid(t, o.doel); p.keuze = o; return p; });
      });
    },
    teken:function(w){
      var o = w.items[0].keuze, d = B.doel(o.doel), bladen = w.items.map(function(p){ return LEESBLAD.blad(p, { zo:o.zo, tijd:o.tijd }); });
      var niv = []; w.items.forEach(function(p){ if (niv.indexOf(p.t.niv) < 0) niv.push(p.t.niv); });
      return {
        titel:d.naam, kop:'Nederlands · Lezen',
        sub:niv.join(', ') + ' · ' + (w.items.length === 1 ? schoon(w.items[0].t.titel) : w.items.length + ' teksten'),
        klasse:'lb-blad',
        vragen:bladen.map(function(b){ return '<li class="lb-li">' + b.v + '</li>'; }).join(''),
        antwoorden:bladen.map(function(b){ return '<li class="lb-li">' + b.a + '</li>'; }).join(''),
        intro:d.soort === 'strategie' ? 'Lees eerst het kaartje: zo pak je deze tekst aan. Doe daarna de opdrachten.' : 'Lees de tekst en doe de opdrachten. Het kaartje helpt je op weg.'
      };
    }
  };
})();
