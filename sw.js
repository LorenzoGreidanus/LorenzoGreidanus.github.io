/* De service worker van meneergreidanus.nl: maakt de leeromgeving
   installeerbaar en speelbaar zonder verbinding.

   Wat hij doet:
   - bij het installeren de kern van de leeromgeving alvast bewaren (de
     voorpagina, de stijl en de gedeelde scripts);
   - elk spel dat een keer geopend is bewaren, zodat het daarna ook zonder
     wifi start;
   - lettertypen, vlaggen en kaartgegevens uit de voorraad geven (die
     veranderen nooit);
   - de rest eerst aan het net vragen en alleen uit de voorraad geven als dat
     niet lukt, zodat een pagina en zijn scripts altijd van dezelfde versie
     zijn.

   Waarom niet andersom, want dat was het wel. Andersom is sneller, maar bij
   een nieuwe versie is de oude service worker nog de baas over die ene
   navigatie. Dan kwam de pagina uit de voorraad van gisteren terwijl een
   script dat nog nooit geopend was vers van het net kwam, en die twee passen
   niet op elkaar. Dat gebeurde op 21 september midden in een les.

   Wat hij niet aanraakt: de spelkamers en het klassement (/api/, /ws/, /q),
   want die moeten altijd live zijn. */
var VERSIE = "v154";
var KERN = "kern-" + VERSIE, VOORRAAD = "voorraad-" + VERSIE;
/* hoe lang er op het net gewacht wordt voor de voorraad het overneemt */
var NETGEDULD = 3000;
var STARTSET = [
  "/leermiddelen/", "/leermiddelen/index.html", "/leermiddelen/mee.html", "/leermiddelen/basis.css", "/leermiddelen/thema.js",
  "/leermiddelen/strijd.js", "/leermiddelen/naamfilter.js", "/leermiddelen/adaptief.js", "/leermiddelen/klas.js", "/leermiddelen/spel.js", "/leermiddelen/spel.css", "/leermiddelen/voorlezen.js", "/leermiddelen/iconen.css", "/leermiddelen/cosmetica.js", "/leermiddelen/wapens.js", "/leermiddelen/avatar.js", "/leermiddelen/profiel.js", "/leermiddelen/bank.js", "/fonts.css", "/manifest.json", "/vangnet.js"
];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(KERN).then(function(c){
    /* een bestand dat even niet lukt mag de installatie niet tegenhouden */
    return Promise.all(STARTSET.map(function(u){ return c.add(u).catch(function(){}); }));
  }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(namen){
    return Promise.all(namen.filter(function(n){ return n !== KERN && n !== VOORRAAD; }).map(function(n){ return caches.delete(n); }));
  }).then(function(){ return self.clients.claim(); }));
});

function nooitBewaren(url){
  return url.pathname.indexOf("/api/") === 0 || url.pathname.indexOf("/ws/") === 0 || url.pathname === "/q" || url.pathname.indexOf("/q/") === 0 ||
         url.pathname === "/sw.js";
}
function vast(url){
  return /\.(woff2?|ttf|otf|png|jpg|jpeg|gif|webp|ico)$/i.test(url.pathname) || url.pathname.indexOf("/leermiddelen/vlaggen/") === 0 ||
         /\.json$/i.test(url.pathname) && url.pathname !== "/manifest.json";
}

self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin || nooitBewaren(url)) return;

  /* wat nooit verandert: uit de voorraad, anders ophalen en bewaren */
  if (vast(url)){
    e.respondWith(caches.open(VOORRAAD).then(function(c){
      return c.match(req).then(function(r){
        return r || fetch(req).then(function(vers){ if (vers && vers.ok) c.put(req, vers.clone()); return vers; });
      });
    }));
    return;
  }

  /* Pagina's, stijl en scripts: eerst het net, en de voorraad is het vangnet.
     Zo horen een pagina en zijn scripts altijd bij dezelfde versie. Duurt het
     net te lang, dan komt de voorraad alsnog. */
  e.respondWith(caches.open(VOORRAAD).then(function(c){
    /* De kern wordt bij het installeren gevuld maar werd daarna nooit
       geraadpleegd, dus zonder verbinding startte de leeromgeving alsnog niet.
       Nu telt hij mee als vangnet. */
    return c.match(req, { ignoreSearch: true }).then(function(r){
      return r || caches.open(KERN).then(function(k){ return k.match(req, { ignoreSearch: true }); });
    }).then(function(bewaard){
      var vanNet = fetch(req).then(function(r){
        if (r && r.ok){ c.put(new Request(url.origin + url.pathname), r.clone()); return r; }
        /* een foutmelding van de server is geen reden om een werkende pagina weg te gooien */
        return bewaard || r;
      });
      /* zonder voorraad is er niets om op terug te vallen: dan gewoon wachten */
      if (!bewaard) return vanNet;
      /* met voorraad: wie het eerst klaar is, met drie seconden geduld voor het net */
      return Promise.race([
        vanNet.catch(function(){ return bewaard; }),
        new Promise(function(klaar){ setTimeout(function(){ klaar(bewaard); }, NETGEDULD); })
      ]).then(function(r){
        /* ook als de voorraad won, wordt de verse versie alsnog bewaard */
        e.waitUntil(vanNet.catch(function(){}));
        return r || bewaard;
      });
    });
  }));
});
