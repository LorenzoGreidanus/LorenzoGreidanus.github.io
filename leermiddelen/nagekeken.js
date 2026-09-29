/* De nagekeken g: het tweede teken van meneer Greidanus, voor het nakijkwerk.
   Een g in één lijn: de ring (blauw) loopt in het raakpunt over in de steel, en die eindigt in een vinkje
   (oranje) dat over de O ligt en daar met een halve ronde begint. Zie logo/g/.

   Waar hij staat: in de kop van de docentpagina's, bij een goed antwoord, en als stempel op het
   antwoordblad van een werkblad. Het blobje blijft het teken voor leerlingen en de spellen.

   NAGEKEKEN.svg({ maat, teken, mono, label })
     maat   breedte en hoogte in pixels (standaard 24)
     teken  true: hij tekent zich (eerst de ring, dan de flick van het vinkje)
     mono   true: alles in de tekstkleur (currentColor), bijvoorbeeld op een stempel
     label  tekst voor een schermlezer; zonder label is hij versiering (aria-hidden)
   NAGEKEKEN.stempel({ maat })  de ronde stempel "nagekeken · meneer Greidanus", in één kleur */
(function(){
  var RING = 'M163.3 123A50 50 0 1 0 76.7 73A50 50 0 1 0 163.3 123Z', STEEL = 'M163.3 123L114.2 208L82.2 176';
  /* pathLength 100, zodat het tekenen voor elke maat met dezelfde getallen werkt */
  var CSS = '.ng{display:inline-block;vertical-align:middle;overflow:visible;flex:none}' +
    '.ng .ngr{stroke:#204ECF}.ng .ngv{stroke:#F26749}' +
    ':root[data-theme="dark"] .ng .ngr{stroke:#83A5F2}' +
    '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]) .ng .ngr{stroke:#83A5F2}}' +
    '.ng.mono .ngr,.ng.mono .ngv{stroke:currentColor}' +
    '.ng.teken .ngr{stroke-dasharray:100;animation:ng-ring .6s cubic-bezier(.6,0,.3,1) both}' +
    '.ng.teken .ngv{stroke-dasharray:100;animation:ng-vink .34s cubic-bezier(.3,0,.2,1) .52s both}' +
    '@keyframes ng-ring{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}' +
    '@keyframes ng-vink{from{stroke-dashoffset:100;opacity:0}1%{opacity:1}to{stroke-dashoffset:0;opacity:1}}' +
    '@media(prefers-reduced-motion:reduce){.ng.teken .ngr,.ng.teken .ngv{animation:none}}';
  function stijl(){
    if (document.getElementById('ng-stijl')) return;
    var s = document.createElement('style'); s.id = 'ng-stijl'; s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  /* de kleuren staan er ook als attribuut in, voor als de stijl (nog) niet geladen is; de stijl gaat voor */
  function binnen(mono){
    return '<g transform="translate(8 0)" fill="none" stroke-width="32">' +
      '<path class="ngr" pathLength="100" stroke="' + (mono ? 'currentColor' : '#204ECF') + '" d="' + RING + '"/>' +
      '<path class="ngv" pathLength="100" stroke="' + (mono ? 'currentColor' : '#F26749') + '" d="' + STEEL + '" stroke-linecap="round" stroke-linejoin="round"/></g>';
  }
  function svg(o){
    o = o || {}; stijl();
    var m = o.maat || 24, kl = 'ng' + (o.teken ? ' teken' : '') + (o.mono ? ' mono' : '');
    var toe = o.label ? ' role="img" aria-label="' + String(o.label).replace(/"/g, '&quot;') + '"' : ' aria-hidden="true"';
    return '<svg class="' + kl + '" viewBox="0 0 256 256" width="' + m + '" height="' + m + '" focusable="false"' + toe + '>' + binnen(o.mono) + '</svg>';
  }
  var nr = 0;
  function stempel(o){
    o = o || {}; stijl();
    var m = o.maat || 96, id = 'ng-kring' + (++nr);
    return '<svg class="ng mono ng-stempel" viewBox="0 0 256 256" width="' + m + '" height="' + m + '" role="img" aria-label="Nagekeken door meneer Greidanus">' +
      '<defs><path id="' + id + '" d="M128 128m-97 0a97 97 0 1 1 194 0a97 97 0 1 1-194 0"/></defs>' +
      '<g fill="none" stroke="currentColor"><circle cx="128" cy="128" r="121" stroke-width="7"/><circle cx="128" cy="128" r="76" stroke-width="3"/></g>' +
      '<text font-family="Poppins,system-ui,sans-serif" font-size="21" font-weight="700" fill="currentColor">' +
      '<textPath href="#' + id + '" textLength="596" lengthAdjust="spacing">NAGEKEKEN · MENEER GREIDANUS ·</textPath></text>' +
      '<g transform="translate(128 128) scale(.5) translate(-134 -128)">' + binnen(true) + '</g></svg>';
  }
  window.NAGEKEKEN = { svg: svg, stempel: stempel };
})();
