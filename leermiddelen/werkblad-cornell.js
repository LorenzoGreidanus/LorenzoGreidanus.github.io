/* Een leeg blad voor aantekeningen volgens de Cornell-methode.

   Het blad heeft drie vakken: rechts de aantekeningen (tijdens de les of het
   lezen), links een smalle kolom voor vragen en kernwoorden (na de les), en
   onderaan de samenvatting in eigen woorden. Het hoort bij geen enkel vak:
   in werkblad.html staat het apart, onder "Zonder vak" (vak 'los').

   De docent kiest hoeveel bladzijden, of er lijntjes, ruitjes of niets in de
   vakken staan, en of er in elk vak een korte aanwijzing staat. Het tweede
   blad is geen antwoordblad maar de uitleg voor de leerling: zo werk je met
   dit blad, in vijf stappen. */
(function(){
  'use strict';
  if (!window.SPELBLAD) return;
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }

  try {
    var st = document.createElement('style');
    st.textContent =
      '.blad > ol.cornell{counter-reset:none}' +
      '.blad > ol.cornell > li{padding:0;border:none;margin:14px 0 0;break-inside:avoid}' +
      '.blad > ol.cornell > li::before{display:none}' +
      '.blad .cn-onderwerp{display:flex;gap:10px;align-items:flex-end;font-size:.9rem;font-weight:600;margin-bottom:8px}' +
      '.blad .cn-onderwerp i{flex:1;border-bottom:1px solid #14224C;height:22px}' +
      '.blad .cn-onderwerp small{font-weight:500;color:#4a5270}' +
      '.blad .cn-raam{border:1.5px solid #14224C;border-radius:8px;overflow:hidden;display:grid;grid-template-columns:31% 1fr;grid-template-rows:var(--cn-h,150mm) 44mm}' +
      '.blad .cn-vak{position:relative;padding:7px 10px;min-width:0}' +
      '.blad .cn-links{border-right:1.5px solid #14224C}' +
      '.blad .cn-onder{grid-column:1/-1;border-top:1.5px solid #14224C}' +
      '.blad .cn-vak b{display:block;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#14224C}' +
      '.blad .cn-vak small{display:block;font-size:.72rem;line-height:1.35;color:#4a5270;margin-top:1px}' +
      '.blad .cn-vel{position:absolute;left:0;right:0;bottom:0;top:var(--cn-top,44px)}' +
      '.blad .cn-zonder .cn-vel{top:28px}' +
      '.blad .cn-lijn .cn-vel{background-image:linear-gradient(transparent calc(8mm - 1px),#b9c0d2 calc(8mm - 1px));background-size:100% 8mm}' +
      '.blad .cn-ruit .cn-vel{background-image:linear-gradient(#d5d9e6 1px,transparent 1px),linear-gradient(90deg,#d5d9e6 1px,transparent 1px);background-size:5mm 5mm;border-top:1px solid #d5d9e6}' +
      '.blad ol.antw.cornell > li{padding-left:38px}' +
      '.blad ol.antw.cornell > li b{display:block}' +
      '@media screen and (max-width:600px){.blad .cn-raam{grid-template-rows:110mm 40mm}}' +
      '@media print{.blad .cn-raam,.blad .cn-vel{-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
        '.blad > ol.cornell > li + li{break-before:page;page-break-before:always;margin-top:0}}';
    document.head.appendChild(st);
  } catch (e){}

  var LIJNEN = [['lijn', 'Lijntjes'], ['ruit', 'Ruitjes'], ['blanco', 'Blanco']];
  var STAPPEN = [
    ['Noteer', 'Schrijf tijdens de les of het lezen in het grote vak wat belangrijk is. Kort: steekwoorden, pijlen en voorbeelden, geen hele zinnen.'],
    ['Vraag', 'Maak na de les in de smalle kolom een vraag of kernwoord bij elk stukje aantekening. Bijvoorbeeld: Wat is ...? Waardoor ...? Wat is het verschil tussen ...?'],
    ['Vat samen', 'Schrijf onderaan in twee of drie eigen zinnen waar de bladzijde over gaat. Lukt dat niet, lees je aantekeningen dan nog eens.'],
    ['Overhoor', 'Leg een blaadje over het grote vak. Beantwoord de vragen uit de smalle kolom hardop of op papier, en kijk daarna of het klopte.'],
    ['Herhaal', 'Kijk dezelfde week nog een keer tien minuten naar je vragen en je samenvatting. Zo blijft het hangen tot de toets.']
  ];

  window.SPELBLAD.cornell = {
      naam:'Aantekeningen: Cornell-methode', kort:'Een leeg blad met vragenkolom, aantekeningen en samenvatting', icoon:'lijst', vak:'los', eigenNiveau:true,
      aantallen:[1, 2, 3, 4], standaard:1, aantalNaam:'Aantal bladzijden',
      delenKop:'Hoe ziet het blad eruit',
      delenTip:'Een leeg blad om aantekeningen te maken bij een les, een tekst of een filmpje. Het tweede blad legt de leerling in vijf stappen uit hoe je ermee werkt; print dat een keer apart.',
      delen:function(aan){
        aan = aan || [];
        var lijn = LIJNEN.filter(function(l){ return aan.indexOf(l[0]) >= 0; })[0] || LIJNEN[0];
        return '<p class="kop">In de vakken</p>' + LIJNEN.map(function(l){
          return '<label><input type="radio" name="cn-lijn" value="' + l[0] + '"' + (l === lijn ? ' checked' : '') + '> ' + l[1] + '</label>';
        }).join('') +
          '<p class="kop">Hulp</p><label><input type="checkbox" name="cn-kaal" value="kaal"' + (aan.indexOf('kaal') >= 0 ? ' checked' : '') + '> Zonder de korte aanwijzing in elk vak</label>';
      },
      lees:function(el){
        var l = el.querySelector('input[name="cn-lijn"]:checked'), kaal = el.querySelector('input[name="cn-kaal"]');
        return { lijn:l ? l.value : 'lijn', hulp:!(kaal && kaal.checked) };
      },
      maak:function(keuze, n){
        var uit = [];
        for (var i = 0; i < n; i++) uit.push({ nr:i + 1, van:n });
        return uit;
      },
      teken:function(w){
        var k = w.keuze;
        var kl = 'cn-raam' + (k.lijn === 'lijn' ? ' cn-lijn' : k.lijn === 'ruit' ? ' cn-ruit' : '') + (k.hulp ? '' : ' cn-zonder');
        var vragen = w.items.map(function(it){
          /* de eerste bladzijde deelt het vel met de kop; de volgende hebben het hele vel */
          var hoog = it.nr === 1 ? '150mm' : '186mm';
          return '<li><div class="cn-onderwerp"><span>Onderwerp</span><i></i>' + (it.van > 1 ? '<small>blad ' + it.nr + ' van ' + it.van + '</small>' : '') + '</div>' +
            '<div class="' + kl + '" style="--cn-h:' + hoog + '">' +
              '<div class="cn-vak cn-links"><b>Vragen en kernwoorden</b>' + (k.hulp ? '<small>Na de les: welke vraag hoort bij elk stukje?</small>' : '') + '<span class="cn-vel"></span></div>' +
              '<div class="cn-vak cn-rechts"><b>Aantekeningen</b>' + (k.hulp ? '<small>Tijdens de les: kort, in steekwoorden.</small>' : '') + '<span class="cn-vel"></span></div>' +
              '<div class="cn-vak cn-onder"><b>Samenvatting</b>' + (k.hulp ? '<small>In twee of drie eigen zinnen: waar gaat dit over?</small>' : '') + '<span class="cn-vel"></span></div>' +
            '</div></li>';
        }).join('');
        var antwoorden = STAPPEN.map(function(s){ return '<li><b>' + schoon(s[0]) + '</b>' + schoon(s[1]) + '</li>'; }).join('');
        return {
          titel:'Aantekeningen', sub:'Cornell-methode · ' + w.items.length + (w.items.length === 1 ? ' bladzijde' : ' bladzijden'),
          klasse:'cornell', vragen:vragen, antwoorden:antwoorden,
          antwoordKop:'Zo werk je met dit blad',
          antwoordIntro:'De Cornell-methode in vijf stappen. Rechts schrijf je, links vraag je, onderaan vat je samen.'
        };
      }
  };
})();
