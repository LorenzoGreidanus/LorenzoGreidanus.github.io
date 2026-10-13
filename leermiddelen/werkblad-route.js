/* Werkbladen uit de leerroute: een vaardigheid of regel stap voor stap op papier.

   De leerroute (leerroute.js, met de inhoud in leerroute/<vak>-*.js) heeft per
   vak honderden doelen: de staartdeling, 't kofschip, de persoonsvorm vinden,
   procenten met de verhoudingstabel. Elk doel heeft een uitleg en maakt sommen
   met hun stappen. Dit werkblad zet dat op papier:
     bovenaan    de uitleg en een voorgedaan voorbeeld, elke stap ingevuld
     de opgaven  met per stap een lijn (of de keuzes om te omcirkelen)
     antwoorden  elke stap met het goede antwoord
   De inhoud wordt pas geladen als je dit werkblad kiest: hij is groot. Komt er
   een vak bij in de leerroute, dan zet je het hieronder in ROUTEVAK. */
(function(){
  'use strict';
  if (!window.SPELBLAD) return;
  /* het vak van de werkbladen naar het vak van de leerroute */
  var ROUTEVAK = { reken:'rekenen', ned:'nederlands', eng:'engels', wis:'wiskunde', aard:'aardrijkskunde', bio:'biologie', eco:'economie', ges:'geschiedenis', burg:'mens' };
  /* welke vakken al inhoud hebben; de rest komt erbij zodra hun bestanden er zijn */
  var MET_INHOUD = ['rekenen', 'nederlands', 'engels', 'wiskunde', 'aardrijkskunde', 'biologie', 'economie', 'geschiedenis', 'mens'];
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function kaal(h){ var d = document.createElement('div'); d.innerHTML = String(h == null ? '' : h); return d.textContent.replace(/\s+/g, ' ').trim(); }

  /* ---------- laden: leerroute.js en de inhoud van een vak, een keer ---------- */
  var geladen = {}, bezig = {};
  function script(src){ return new Promise(function(klaar, mis){ var s = document.createElement('script'); s.src = src; s.onload = klaar; s.onerror = mis; document.head.appendChild(s); }); }
  function laad(vak){
    if (geladen[vak]) return Promise.resolve();
    if (bezig[vak]) return bezig[vak];
    var v = window.LR_VERSIE || '3';
    bezig[vak] = (window.LEERROUTE ? Promise.resolve() : script('leerroute.js?v=' + v)).then(function(){
      var lijst = (LEERROUTE.BESTANDEN[vak] || []);
      return lijst.reduce(function(p, f){ return p.then(function(){ return script('leerroute/' + f + '.js?v=' + v); }); }, geladen.kerndoelen ? Promise.resolve() : script('leerroute/kerndoelen.js?v=' + v).then(function(){ geladen.kerndoelen = true; }));
    }).then(function(){ if (LEERROUTE._mixen) LEERROUTE._mixen(); geladen[vak] = true; });
    return bezig[vak];
  }
  function groepenVan(vak){ return LEERROUTE._groepen().filter(function(g){ return g.vak === vak && g.doelen.length; }); }
  function doel(id){ return LEERROUTE._doelen().filter(function(d){ return d.id === id; })[0] || null; }
  function niveauNaam(vak, id){ var V = LEERROUTE.VAKKEN[vak]; return ((V && V.niveaus || []).filter(function(n){ return n.id === id; })[0] || {}).naam || id; }

  /* ---------- het keuzeblok ---------- */
  function keuzeHtml(vak, aan){
    var gekozen = (aan || []).filter(function(x){ return doel(x); })[0];
    var gr = groepenVan(vak);
    if (!gekozen && gr.length) gekozen = gr[0].doelen[0].id;
    return '<label class="rw-kies"><span>Vaardigheid of regel</span><select name="rdoel" class="veld">' + gr.map(function(g){
        return '<optgroup label="' + schoon(niveauNaam(vak, g.niveau) + ' · ' + g.naam) + '">' + g.doelen.map(function(d){
          return '<option value="' + schoon(d.id) + '"' + (d.id === gekozen ? ' selected' : '') + '>' + schoon(d.naam) + '</option>'; }).join('') + '</optgroup>';
      }).join('') + '</select></label>' +
      '<p class="rw-uitleg" id="rwUitleg">' + schoon((doel(gekozen) || {}).kort || '') + '</p>' +
      '<label><input type="checkbox" name="rvb" value="1"' + ((aan || []).indexOf('zonder') >= 0 ? '' : ' checked') + '> Uitleg en een voorgedaan voorbeeld bovenaan</label>' +
      '<label><input type="checkbox" name="rst" value="1"' + ((aan || []).indexOf('kaal') >= 0 ? '' : ' checked') + '> Bij elke opgave de stappen om in te vullen</label>';
  }
  /* het blok wordt opnieuw getekend als de inhoud binnen is */
  function tekenKeuze(vak, aan){
    var el = document.getElementById('delen'); if (!el) return;
    el.innerHTML = keuzeHtml(vak, aan);
    var s = el.querySelector('select[name="rdoel"]');
    if (s) s.addEventListener('change', function(){ var d = doel(s.value); var u = document.getElementById('rwUitleg'); if (u) u.textContent = d ? d.kort || '' : ''; });
  }

  /* ---------- een opgave op papier ---------- */
  function antw(x){ return [].concat(x)[0]; }
  function beeld(op, n){ var b = op.beeld; if (!b) return ''; if (typeof b === 'function'){ try { return b(n) || ''; } catch (e){ return ''; } } return b; }
  function vraagHtml(op){ return op.vraagHtml || schoon(op.vraag || ''); }
  function stapAntwoord(s){ if (s.info) return ''; if (s.opties) return s.opties[s.goed]; return s.antwoord == null ? '' : String(antw(s.antwoord)); }
  function eindAntwoord(op){
    if (op.opties) return op.opties[op.goed];
    if (op.antwoord != null) return String(antw(op.antwoord));
    var l = op.stappen.filter(function(s){ return !s.info; }); return l.length ? stapAntwoord(l[l.length - 1]) : '';
  }
  function stapLijn(s, i){
    if (s.info) return '<li class="rw-info">' + s.tekst + '</li>';
    if (s.opties) return '<li>' + s.tekst + ' <span class="rw-kiesuit">' + s.opties.map(function(o){ return '<span>' + schoon(o) + '</span>'; }).join(' / ') + '</span></li>';
    return '<li>' + s.tekst + ' <span class="lijn kort" aria-hidden="true"></span>' + (s.eenheid ? ' ' + schoon(s.eenheid) : '') + '</li>';
  }

  /* de stijl: de plaatjes van de leerroute, met vaste kleuren voor papier */
  try {
    var st = document.createElement('style');
    st.textContent = '.blad{--lr-1:#204ECF;--lr-2:#C4452A;--lr-3:#9a5c0c;--lr-4:#1f7a52;--lr-5:#7a3fb0;--lr-zacht:rgba(32,78,207,.08)}' +
      '.blad .lr-svg{width:100%;max-width:520px;height:auto;display:block;overflow:visible;margin:6px 0}' +
      '.blad .lr-svg .as{stroke:#14224C;stroke-width:2;fill:none}.blad .lr-svg .as.dun{stroke-width:1;opacity:.5}' +
      '.blad .lr-svg text{fill:#14224C;font-family:Poppins,system-ui,sans-serif}.blad .lr-svg .getal{font-size:15px;font-weight:600;text-anchor:middle}' +
      '.blad .lr-svg .getal.klein{font-size:13px}.blad .lr-svg .getal.groot{font-size:20px;font-weight:700}.blad .lr-svg .sprong{font-size:16px;font-weight:700;text-anchor:middle}' +
      '.blad .lr-svg .boog,.blad .lr-svg .pijl{fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}.blad .lr-svg .stip{fill:var(--lr-2)}' +
      '.blad .lr-svg .blok{stroke:#fff;stroke-width:.6}.blad .lr-svg .blok.h{fill:var(--lr-1)}.blad .lr-svg .blok.t{fill:var(--lr-2)}.blad .lr-svg .blok.e{fill:var(--lr-3)}' +
      '.blad .lr-svg .vak{fill:#fff;stroke:#14224C;stroke-width:2}.blad .lr-svg .vak.leeg{stroke:var(--lr-2);stroke-dasharray:5 4}' +
      '.blad .lr-svg .deel{fill:#fff;stroke:#14224C;stroke-width:1.5}.blad .lr-svg .deel.vol{fill:var(--lr-1);opacity:.75}.blad .lr-svg .rand{fill:none;stroke:#14224C;stroke-width:2.5}' +
      '.blad .lr-svg .wijzerplaat{fill:#fff;stroke:#14224C;stroke-width:3}.blad .lr-svg .wijzer{stroke:#14224C;stroke-width:3.5;stroke-linecap:round}.blad .lr-svg .wijzer.kort{stroke:var(--lr-2);stroke-width:5.5}' +
      '.blad .lr-tabel{border-collapse:collapse;font-variant-numeric:tabular-nums;margin:6px 0}.blad .lr-tabel th,.blad .lr-tabel td{padding:5px 10px;text-align:center;border:1px solid #9aa3bd;min-width:46px;color:#14224C}' +
      '.blad .lr-tabel th{background:#eef2fc;font-weight:600}.blad .lr-tabel td.nadruk,.blad .lr-tabel th.nadruk{box-shadow:inset 0 0 0 2px var(--lr-2);font-weight:700}' +
      '.blad .lr-tabel tr.pijlen td{border:none;padding:0 4px;font-size:.8rem;font-weight:700;color:var(--lr-2);text-align:left}' +
      '.blad .lr-cijfer{border-collapse:collapse;font:600 1.3rem/1.2 ui-monospace,Consolas,monospace;margin:6px 0;color:#14224C}.blad .lr-cijfer td{width:1.1em;text-align:center;padding:1px 0}' +
      '.blad .lr-cijfer tr.onth td{font-size:.8rem;color:var(--lr-2)}.blad .lr-cijfer tr.streep td{border-top:2px solid currentColor}' +
      '.blad .lr-zin{display:flex;flex-wrap:wrap;gap:10px 6px;align-items:flex-start;font-size:1.05rem;line-height:1.3;margin:6px 0;color:#14224C}' +
      '.blad .lr-zin .stuk{display:inline-flex;flex-direction:column;align-items:center;gap:2px}.blad .lr-zin .stuk .t{padding:2px 6px;border-bottom:3px solid currentColor}' +
      '.blad .lr-zin .stuk small{font-size:.62rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}' +
      '.blad .lr-zin .k1{color:var(--lr-1)}.blad .lr-zin .k2{color:var(--lr-2)}.blad .lr-zin .k3{color:var(--lr-3)}.blad .lr-zin .k4{color:var(--lr-4)}.blad .lr-zin .k5{color:var(--lr-5)}.blad .lr-zin .stuk .t{color:#14224C}' +
      '.blad .lr-tekst{border:1px solid #c9d2e6;border-radius:8px;padding:10px 12px;max-width:62ch;line-height:1.55;margin:6px 0;color:#14224C}.blad .lr-tekst p{margin:0 0 6px}' +
      '.blad .lr-tekst mark{background:#eef2fc;color:inherit;border-bottom:2px solid var(--lr-2)}' +
      '.blad .lr-context,.blad .lr-uitdoel{display:block;font-size:.84rem;color:#4a5270;margin-bottom:2px}' +
      '.blad .rw-stappen{margin:8px 0 0;padding-left:22px;display:grid;gap:9px;font-size:.95rem}.blad .rw-stappen li{line-height:1.6}' +
      '.blad .rw-stappen .rw-info{list-style:none;margin-left:-22px;color:#4a5270;font-size:.88rem}' +
      '.blad .rw-kiesuit span{display:inline-block;border:1.5px solid #9aa3bd;border-radius:999px;padding:0 10px;margin:0 2px;font-weight:600}' +
      '.blad .rw-eind{margin-top:8px;font-weight:600}' +
      '.blad .rw-voorbeeld{border:1.5px solid #c9d2e6;border-radius:10px;padding:12px 14px;margin:6px 0 14px;break-inside:avoid}' +
      '.blad .rw-voorbeeld h3{font-size:1rem;margin:0 0 6px}.blad .rw-voorbeeld .rw-uit{font-size:.9rem;color:#14224C}.blad .rw-voorbeeld .rw-uit p{margin:0 0 6px}' +
      '.blad .rw-voorbeeld ol{margin:8px 0 0;padding-left:22px;font-size:.9rem;line-height:1.5}.blad .rw-voorbeeld ol b{color:#204ECF}' +
      '.blad .rw-ant ol{margin:4px 0 0;padding-left:20px;font-size:.84rem;line-height:1.45}' +
      '.rw-kies{display:grid;gap:4px;grid-column:1/-1;font-weight:600}.rw-kies select{width:100%;min-width:0}.rw-uitleg{grid-column:1/-1;color:var(--muted);font-size:.88rem;margin:0}' +
      '@media print{.blad .rw-opgave{break-inside:avoid}}';
    document.head.appendChild(st);
  } catch (e){}

  Object.keys(ROUTEVAK).forEach(function(wvak){
    var vak = ROUTEVAK[wvak];
    if (MET_INHOUD.indexOf(vak) < 0) return;
    window.SPELBLAD['route-' + wvak] = {
      naam:'Stap voor stap: een vaardigheid of regel', vak:wvak, eigenNiveau:true,
      aantallen:[4, 6, 8, 10], standaard:6, aantalNaam:'Aantal opgaven',
      delenKop:'Welke vaardigheid',
      delenTip:'Uit de leerroute: elke vaardigheid en regel met uitleg en stappen. Bovenaan het voorbeeld, bij elke opgave de stappen om in te vullen, en op het antwoordblad elke stap.',
      delen:function(aan){
        if (geladen[vak] && window.LEERROUTE) return keuzeHtml(vak, aan);
        laad(vak).then(function(){ var b = document.getElementById('blad'); if (b && b.value === 'route-' + wvak) tekenKeuze(vak, aan); });
        return '<p class="tip" style="grid-column:1/-1">De vaardigheden laden…</p>';
      },
      lees:function(el){
        var s = el.querySelector('select[name="rdoel"]');
        return { doel:s ? s.value : '', voorbeeld:!!el.querySelector('input[name="rvb"]:checked'), stappen:!!el.querySelector('input[name="rst"]:checked') };
      },
      maak:function(k, n){
        return laad(vak).then(function(){
          var d = doel(k.doel);
          if (!d) return { fout:'Kies eerst een vaardigheid.' };
          var uit = [], gezien = {};
          for (var p = 0; uit.length < n + 1 && p < (n + 1) * 30; p++){
            var op = null; try { op = d.maak(LEERROUTE.R); } catch (e){ op = null; }
            if (!op || !op.stappen) continue;
            var sl = kaal(vraagHtml(op)) + '|' + kaal(op.context || '') + '|' + eindAntwoord(op);
            if (gezien[sl]) continue; gezien[sl] = true;
            uit.push({ op:op, doel:d, keuze:k });
          }
          if (uit.length < 2) return { fout:'Bij deze vaardigheid lukte het niet om genoeg opgaven te maken.' };
          var vb = uit.shift(); uit.forEach(function(x){ x.vb = vb; });
          return uit;
        });
      },
      teken:function(w){
        var k = w.items[0].keuze, d = w.items[0].doel, vb = w.items[0].vb;
        var boven = !k.voorbeeld ? '' : '<div class="rw-voorbeeld"><h3>Zo werkt het: ' + schoon(d.naam) + '</h3><div class="rw-uit">' + (d.uit || '') + '</div>' +
          '<p style="margin:10px 0 2px;font-weight:600">Voorbeeld' + (vb.op.vraag ? ': ' + vraagHtml(vb.op) : '') + '</p>' + (vb.op.context ? '<span class="lr-context">' + vb.op.context + '</span>' : '') +
          beeld(vb.op, vb.op.stappen.length) +
          '<ol>' + vb.op.stappen.filter(function(s){ return !s.info; }).map(function(s){ return '<li>' + s.tekst + ' <b>' + schoon(stapAntwoord(s)) + '</b></li>'; }).join('') + '</ol></div>';
        var vragen = w.items.map(function(x){
          var op = x.op;
          return '<li class="rw-opgave">' + (op.context ? '<span class="lr-context">' + op.context + '</span>' : '') + '<span class="vr">' + vraagHtml(op) + '</span>' + beeld(op, 0) +
            (k.stappen ? '<ol class="rw-stappen">' + op.stappen.map(stapLijn).join('') + '</ol>' : '') +
            (op.opties ? '<div class="opties">' + op.opties.map(function(o, i){ return '<span><b>' + 'abcdef'.charAt(i) + '</b>' + schoon(o) + '</span>'; }).join('') + '</div>'
              : '<p class="rw-eind">Antwoord: <span class="lijn kort" aria-hidden="true"></span>' + (op.eenheid ? ' ' + schoon(op.eenheid) : '') + '</p>') + '</li>';
        }).join('');
        var antwoorden = w.items.map(function(x){
          var op = x.op, eind = eindAntwoord(op);
          return '<li><span class="goed">' + (op.opties ? 'abcdef'.charAt(op.goed) + '. ' : '') + schoon(eind) + (op.eenheid ? ' ' + schoon(op.eenheid) : '') + '</span>' +
            (w.uitleg ? '<div class="rw-ant"><ol>' + op.stappen.filter(function(s){ return !s.info; }).map(function(s){ return '<li>' + schoon(kaal(s.tekst)) + ' <b>' + schoon(stapAntwoord(s)) + '</b></li>'; }).join('') + '</ol></div>' : '') + '</li>';
        }).join('');
        return { titel:'Werkblad stap voor stap: ' + d.naam, sub:niveauNaam(vak, d.groep.niveau) + ' · ' + d.groep.naam + ' · ' + w.items.length + ' opgaven', klasse:'stappen',
          intro:k.stappen ? 'Werk elke opgave uit met de stappen eronder. Schrijf bij elke stap je antwoord op de lijn.' : 'Reken of werk elke opgave uit. Schrijf je antwoord op de lijn.', boven:boven, vragen:vragen, antwoorden:antwoorden };
      }
    };
  });
})();
