/* De service worker van meneergreidanus.nl: maakt de leeromgeving
   installeerbaar en speelbaar zonder verbinding.

   Wat hij doet:
   - bij het installeren de kern van de leeromgeving alvast bewaren (de
     voorpagina, de stijl en de gedeelde scripts);
   - elk spel dat een keer geopend is bewaren, zodat het daarna ook zonder
     wifi start;
   - lettertypen, vlaggen en kaartgegevens uit de voorraad geven (die
     veranderen nooit);
   - de rest eerst uit de voorraad geven en ondertussen een verse versie
     ophalen, zodat een volgende keer de nieuwste versie klaarstaat.

   Wat hij niet aanraakt: de spelkamers en het klassement (/api/, /ws/, /q),
   want die moeten altijd live zijn. */
var VERSIE = "v2";
var KERN = "kern-" + VERSIE, VOORRAAD = "voorraad-" + VERSIE;
var STARTSET = [
  "/leermiddelen/", "/leermiddelen/index.html", "/leermiddelen/basis.css", "/leermiddelen/thema.js",
  "/leermiddelen/strijd.js", "/leermiddelen/naamfilter.js", "/leermiddelen/adaptief.js", "/leermiddelen/klas.js", "/leermiddelen/bank.js", "/fonts.css", "/manifest.json"
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

  /* pagina's, stijl en scripts: uit de voorraad als die er is, en ondertussen verversen */
  e.respondWith(caches.open(VOORRAAD).then(function(c){
    return c.match(req, { ignoreSearch: true }).then(function(bewaard){
      var vers = fetch(req).then(function(r){
        if (r && r.ok) c.put(new Request(url.origin + url.pathname), r.clone());
        return r;
      }).catch(function(){ return bewaard; });
      /* een bewaarde pagina meteen geven; alleen de allereerste keer wachten op het net */
      e.waitUntil(vers.catch(function(){}));
      return bewaard || vers;
    });
  }));
});
