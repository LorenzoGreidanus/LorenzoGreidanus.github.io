/* Het merk in de kop: de nagekeken g tekent zich bij het openen van de pagina (dat doet de stijl in het
   teken zelf), en opnieuw als je er met de muis overheen gaat of er met Tab op komt. */
(function(){
  var rustig = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches:false };
  function teken(el){
    var m = el && el.closest ? el.closest('.mark, .merk') : null, s = m && m.querySelector('svg.ng');
    if (!s || rustig.matches) return;
    /* de klasse eraf en er weer op: dan begint de animatie opnieuw */
    s.classList.remove('teken'); void s.getBoundingClientRect(); s.classList.add('teken');
  }
  document.addEventListener('pointerover', function(e){
    var m = e.target.closest ? e.target.closest('.mark, .merk') : null;
    if (!m || (e.relatedTarget && m.contains(e.relatedTarget))) return;
    teken(m);
  });
  document.addEventListener('focusin', function(e){ teken(e.target); });
})();
