/* Meegroeiend niveau, voor Torenverdediging en Zwaardvechter.

   Een leerling die op vmbo-tl speelt en bijna alles goed heeft, wordt niet
   uitgedaagd. Dit stukje kijkt naar de laatste antwoorden en zet het niveau
   van de vragen een stap omhoog zodra het te makkelijk is: van tl naar havo,
   van havo naar vwo. Gaat het daarna mis, dan zakt het weer een stap, maar
   nooit onder het niveau dat de leerling zelf koos. Het gekozen niveau blijft
   staan voor het klassement; alleen de vragen worden zwaarder.

   Gebruik:
     var slim = Adaptief({ ladder:['bb','kgt','havo','vwo'], start:'kgt',
                           naam:function(id){ ... }, wissel:function(nieuw, oud, omhoog){ ... } });
     slim.toets(goed)      na elk antwoord; geeft 'omhoog', 'omlaag' of null terug
     slim.niveau()         het niveau dat nu voor de vragen geldt
     slim.reset(start)     bij een nieuwe partij
   Opties: venster (hoeveel antwoorden meetellen, 8), minimum (vanaf hoeveel
   antwoorden er gekeken wordt, 6), omhoog (deel goed, .85), omlaag (.4). */
window.Adaptief = function(o){
  var ladder = o.ladder, huidig = o.start, basis = o.start, venster = [];
  var VENSTER = o.venster || 8, MINIMUM = o.minimum || 6, OMHOOG = o.omhoog || 0.85, OMLAAG = o.omlaag || 0.4;
  var toastEl = null, toastKlok = null;
  function idx(id){ return ladder.indexOf(id); }
  function naam(id){ return o.naam ? o.naam(id) : id; }
  function toast(tekst){
    if (!toastEl){
      toastEl = document.createElement('div');
      toastEl.className = 'adaptief-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = tekst;
    toastEl.classList.add('aan');
    if (toastKlok) clearTimeout(toastKlok);
    toastKlok = setTimeout(function(){ toastEl.classList.remove('aan'); }, 4200);
  }
  function zet(id, omhoog){
    var oud = huidig;
    huidig = id; venster = [];
    toast(omhoog
      ? 'Dit gaat je makkelijk af. De vragen gaan een stap omhoog: ' + naam(id) + '.'
      : 'Even een stap terug: de vragen zijn weer op ' + naam(id) + '.');
    if (o.wissel) o.wissel(id, oud, omhoog);
  }
  return {
    toets: function(goed){
      venster.push(!!goed);
      if (venster.length > VENSTER) venster.shift();
      if (venster.length < MINIMUM) return null;
      var deel = venster.filter(Boolean).length / venster.length, i = idx(huidig);
      if (deel >= OMHOOG && i >= 0 && i < ladder.length - 1){ zet(ladder[i + 1], true); return 'omhoog'; }
      if (deel <= OMLAAG && i > idx(basis)){ zet(ladder[i - 1], false); return 'omlaag'; }
      return null;
    },
    niveau: function(){ return huidig; },
    verhoogd: function(){ return idx(huidig) > idx(basis); },
    reset: function(start){ huidig = start; basis = start; venster = []; },
    toast: toast
  };
};
