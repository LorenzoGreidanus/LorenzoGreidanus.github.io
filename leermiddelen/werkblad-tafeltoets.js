/* De tafeltoets op papier: een vast aantal sommen uit de tafels 1 tot en met 15.

   Dezelfde toets als tafeltoets.html (de wekelijkse opdracht in de klas), maar
   dan om te printen: de docent kiest welke tafels, of de deelsommen meedoen en
   hoeveel sommen. Bovenaan vult de leerling de tijd en het aantal goed in. De
   sommen staan in kolommen; het antwoordblad heeft dezelfde indeling, zodat
   nakijken snel gaat. Met Andere vragen komt er een nieuwe set: elke week een
   ander blad.
   De keuzes in het adres: deel=t6,t7,t8,delen (geen t-waarden: alle tafels). */
(function(){
  'use strict';
  if (!window.SPELBLAD) return;
  /* kiezen kan tot en met de tafel van 15; zonder keuze de gewone tien */
  var ALLE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], GEWOON = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  function schud(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function tafelTekst(l){
    if (l.length === 1) return 'tafel van ' + l[0];
    var rij = l.every(function(t, i){ return i === 0 || t === l[i - 1] + 1; });
    return 'tafels ' + (rij && l.length > 2 ? l[0] + ' t/m ' + l[l.length - 1] : l.slice(0, -1).join(', ') + ' en ' + l[l.length - 1]);
  }

  try {
    var st = document.createElement('style');
    st.textContent =
      '.blad .tt-kop{display:flex;flex-wrap:wrap;gap:8px 28px;border:1.5px solid #14224C;border-radius:10px;padding:10px 14px;margin:12px 0 6px;font-size:.92rem;font-weight:500;color:#14224C;break-inside:avoid}' +
      '.blad .tt-kop i{display:inline-block;width:46px;border-bottom:1.5px solid #14224C;height:1.1em;margin:0 6px;vertical-align:baseline}' +
      '.blad > ol.tafeltoets{column-count:4;column-gap:22px;margin-top:10px}' +
      '.blad > ol.tafeltoets > li{break-inside:avoid;padding:5px 0 5px 30px;border-bottom:none;font-size:1.02rem;font-variant-numeric:tabular-nums;white-space:nowrap}' +
      '.blad > ol.tafeltoets > li::before{top:6px;width:22px;height:22px;border-radius:6px;font-size:.66rem;background:none;color:#4a5270;border:1px solid #c9cfdd}' +
      '.blad > ol.tafeltoets .tt-lijn{display:inline-block;width:38px;border-bottom:1.5px solid #14224C;height:1.05em;vertical-align:baseline;margin-left:4px}' +
      '.blad > ol.tafeltoets .tt-goed{font-weight:600;color:#14224C;margin-left:4px}' +
      '@media screen and (max-width:600px){.blad > ol.tafeltoets{column-count:2}}' +
      '@media print{.blad > ol.tafeltoets > li{padding-top:4px;padding-bottom:4px}.blad > ol.tafeltoets > li::before{top:5px}}';
    document.head.appendChild(st);
  } catch (e){}

  window.SPELBLAD.tafeltoets = {
    naam:'Tafeltoets', kort:'De tafels 1 t/m 15, met de tijd erbij', icoon:'schema', vak:'reken', eigenNiveau:true,
    aantallen:[20, 30, 40, 50, 60, 80, 100], standaard:40, aantalNaam:'Aantal sommen',
    delenKop:'Welke tafels',
    delenTip:'Een toets van de tafels om elke week af te nemen. Kies je geen tafel, dan komen de tafels van 1 tot en met 10 aan bod. De leerling vult bovenaan de tijd en het aantal goed in. Met Andere vragen maak je voor volgende week een nieuw blad.',
    delen:function(aan){
      aan = aan || [];
      var gekozen = ALLE.filter(function(t){ return aan.indexOf('t' + t) >= 0; });
      return '<p class="kop">Tafels</p>' + ALLE.map(function(t){
        return '<label><input type="checkbox" name="tt-tafel" value="t' + t + '"' + (gekozen.indexOf(t) >= 0 ? ' checked' : '') + '> ' + t + '</label>';
      }).join('') +
        '<p class="kop">Soort sommen</p><label><input type="checkbox" name="tt-delen" value="delen"' + (aan.indexOf('delen') >= 0 ? ' checked' : '') + '> Ook de deelsommen die erbij horen (42 : 6)</label>';
    },
    lees:function(el){
      var t = [].map.call(el.querySelectorAll('input[name="tt-tafel"]:checked'), function(i){ return Number(i.value.slice(1)); });
      return { tafels:t.length ? t : GEWOON.slice(), delen:!!(el.querySelector('input[name="tt-delen"]') || {}).checked };
    },
    /* alle sommen van de gekozen tafels, geschud; is het aantal groter dan de voorraad, dan komt hij opnieuw geschud langs */
    maak:function(keuze, n){
      var keer = [], deel = [];
      keuze.tafels.forEach(function(t){ for (var k = 1; k <= 10; k++){ keer.push({ v:k + ' × ' + t, a:k * t }); deel.push({ v:(k * t) + ' : ' + t, a:k }); } });
      var uit = [], voorraad = [];
      function vul(){ voorraad = keuze.delen ? schud(schud(keer).slice(0, Math.ceil(keer.length / 2)).concat(schud(deel).slice(0, Math.floor(deel.length / 2)))) : schud(keer); }
      while (uit.length < n){
        if (!voorraad.length) vul();
        var x = voorraad.shift();
        if (uit.length && uit[uit.length - 1].v === x.v && keer.length > 1){ voorraad.push(x); if (voorraad.length === 1) vul(); continue; }
        uit.push(x);
      }
      return uit;
    },
    teken:function(w){
      var k = w.keuze, n = w.items.length;
      return {
        titel:'Tafeltoets', sub:tafelTekst(k.tafels) + (k.delen ? ' · keer en delen' : '') + ' · ' + n + ' sommen', klasse:'tafeltoets',
        boven:'<div class="tt-kop"><span>Tijd:<i></i>min<i></i>sec</span><span>Goed:<i></i>van de ' + n + '</span></div>',
        vragen:w.items.map(function(it){ return '<li>' + it.v + ' = <span class="tt-lijn"></span></li>'; }).join(''),
        antwoorden:w.items.map(function(it){ return '<li>' + it.v + ' = <span class="tt-goed">' + it.a + '</span></li>'; }).join(''),
        antwoordIntro:'Dezelfde volgorde en dezelfde kolommen als op het werkblad.'
      };
    }
  };
})();
