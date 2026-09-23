/* Wakker: houdt de verbinding van een samenspel levend, en merkt het als hij
   stilletjes dood is.

   Het probleem in de klas: een laptop gaat even dicht, een telefoon valt in
   slaap, de wifi valt weg. Daarna ziet de verbinding er voor de pagina nog
   open uit, maar er komt niets meer door. Pas bij het volgende antwoord blijkt
   dat het niet aankomt, en de leerling denkt dat het spel hangt.

   Wat dit doet:
   - elke twintig tellen een ping; de kamer antwoordt vanzelf met pong;
   - komt er vijfenveertig tellen niets binnen, dan is de verbinding dood en
     hangen we op, zodat de pagina opnieuw verbindt zoals hij altijd doet;
   - komt het scherm terug (wakker, ander tabblad, weer online, terug naar
     deze pagina), dan meteen een ping, en zonder antwoord binnen vier tellen
     opnieuw verbinden in plaats van te wachten tot iemand iets doet.

   Het weet niets van het spel. Een pagina geeft twee dingen mee: hoe hij bij
   zijn huidige verbinding komt, en of hij bewust dicht is (afgelopen,
   weggestuurd). Opnieuw verbinden doet de pagina zelf, bij het sluiten.

     WAKKER({ ws: function(){ return ws; }, dicht: function(){ return dicht; } }); */
(function(){
  'use strict';
  var STIL = 45000, PING = 20000, WAKKERTIJD = 4000;
  window.WAKKER = function(o){
    if (!o || typeof o.ws !== 'function') return;
    var laatst = Date.now(), gevolgd = null;
    function nu(){ laatst = Date.now(); }
    /* elke nieuwe verbinding een keer volgen: alles wat binnenkomt telt als leven */
    function volg(){
      var ws = o.ws();
      if (ws && ws !== gevolgd){
        gevolgd = ws; nu();
        try { ws.addEventListener('message', nu); ws.addEventListener('open', nu); } catch (e){}
      }
      return ws;
    }
    function isDicht(){ try { return !!(o.dicht && o.dicht()); } catch (e){ return false; } }
    function ophangen(ws){ try { ws.close(4000, 'stil'); } catch (e){} }
    function ping(ws){ try { ws.send('ping'); } catch (e){} }
    setInterval(function(){
      if (isDicht()) return;
      var ws = volg();
      if (!ws || ws.readyState !== 1) return;
      if (Date.now() - laatst > STIL){ ophangen(ws); return; }
      ping(ws);
    }, PING);
    /* terug van weggeweest: even vragen of hij er nog is */
    var bezig = null;
    function controleer(){
      if (isDicht() || document.hidden) return;
      var ws = volg();
      if (!ws || ws.readyState !== 1) return;
      var sinds = Date.now();
      ping(ws);
      clearTimeout(bezig);
      bezig = setTimeout(function(){ if (laatst < sinds && o.ws() === ws && ws.readyState === 1) ophangen(ws); }, WAKKERTIJD);
    }
    document.addEventListener('visibilitychange', controleer);
    window.addEventListener('online', controleer);
    window.addEventListener('focus', controleer);
    window.addEventListener('pageshow', function(e){ if (e && e.persisted) controleer(); });
  };
})();
