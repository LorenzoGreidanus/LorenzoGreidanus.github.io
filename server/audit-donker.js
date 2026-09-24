/* De donkertoets: leest elke pagina in het licht en in het donker na.
 *
 * Waarom dit bestaat. basis.css levert de donkere kleuren, dus een pagina
 * kantelt vanzelf mee. Maar elke pagina heeft ook eigen kleuren in zijn eigen
 * <style>, en die kantelen niet. Zet je var(--ink) op een vast lichtblauw
 * vlak, dan staat er in het donker creme op bijna-wit. Dat is precies wat er
 * met de lesnoot in de leeromgeving en met de opdrachtkaart gebeurde, en die
 * fouten zijn alleen te zien als je ernaar kijkt in de goede stand.
 *
 * Deze toets kijkt voor je: elke zichtbare regel tekst, in drie standen
 * (licht, donker volgens het systeem, en donker met de knop op de site, die
 * via eigen regels werkt en dus los kan misgaan), op het beginscherm, na op
 * Start drukken en in de uitleg stap voor stap,
 * tegen de norm van 4,5:1 (of 3:1 voor grote tekst). En meteen ook of een
 * knop of link minstens 44 bij 44 beeldpunten is, want dat belooft de site
 * over zichzelf.
 *
 * Nodig: een Edge of Chrome die luistert op poort 9222, en een server met de
 * site erop. Starten:
 *
 *   msedge --headless=new --remote-debugging-port=9222 --user-data-dir=<map> about:blank
 *   node server/audit-donker.js [adres] [pagina ...]
 *
 * Zonder paginanamen loopt hij alles in leermiddelen/ na.
 *
 * Afsluitwaarde 1 als er iets onder de norm zit, zodat dit in een controle
 * kan hangen.
 */
const fs = require('fs');
const path = require('path');

const BASIS = process.argv[2] && /^https?:/.test(process.argv[2]) ? process.argv[2] : 'http://localhost:8765';
const GEVRAAGD = process.argv.slice(process.argv[2] && /^https?:/.test(process.argv[2]) ? 3 : 2);
const MAP = path.join(__dirname, '..', 'leermiddelen');

/* beheer.html is alleen voor de eigenaar en vraagt meteen om een sleutel. */
const OVERSLAAN = ['beheer.html'];

/* Alles in leermiddelen/ en de pagina's van de site zelf (voorpagina, over,
   nieuw, privacy), met hun pad vanaf de hoofdmap. */
function paginas(){
  if (GEVRAAGD.length) return GEVRAAGD.map(n => n.endsWith('.html') ? n : n + '.html')
    .map(n => n.indexOf('/') >= 0 ? n : (fs.existsSync(path.join(MAP, n)) ? 'leermiddelen/' + n : n));
  const lm = fs.readdirSync(MAP).filter(f => /\.html$/.test(f) && OVERSLAAN.indexOf(f) < 0).sort().map(f => 'leermiddelen/' + f);
  const top = fs.readdirSync(path.join(MAP, '..')).filter(f => /\.html$/.test(f)).sort();
  return top.concat(lm);
}

/* ---------- een heel klein laagje om het devtools-protocol ---------- */
function verbind(adres){
  return new Promise((klaar, mis) => {
    const ws = new WebSocket(adres);
    let nr = 0; const wacht = new Map(); const luisteraars = [];
    ws.onopen = () => klaar({ zeg, sluit, opGebeurtenis });
    ws.onerror = () => mis(new Error('geen verbinding met ' + adres));
    ws.onmessage = e => {
      const b = JSON.parse(e.data);
      if (b.id && wacht.has(b.id)){
        const w = wacht.get(b.id); wacht.delete(b.id);
        b.error ? w.mis(new Error(b.error.message)) : w.klaar(b.result);
      } else if (b.method) luisteraars.forEach(l => l(b));
    };
    function zeg(m, p, sid){
      const id = ++nr;
      ws.send(JSON.stringify({ id, method: m, params: p || {}, sessionId: sid }));
      return new Promise((k, f) => wacht.set(id, { klaar: k, mis: f }));
    }
    function opGebeurtenis(l){ luisteraars.push(l); }
    function sluit(){ ws.close(); }
  });
}

/* ---------- wat er in de pagina wordt uitgevoerd ----------
   Als tekst één string, want hij gaat als expressie over de lijn. De walker
   loopt door tot en met <html>: een pagina die zijn achtergrond op <html> zet
   en <body> doorzichtig laat, mat anders als wit. */
const METEN = `(function(){
  function rgb(s){
    if (!s) return null;
    if (s.indexOf('color(') === 0){
      var n = s.match(/[-\\d.]+/g); if (!n) return null;
      return n.slice(-3).map(function(x){ return parseFloat(x) * 255; });
    }
    var n2 = s.match(/[\\d.]+/g); if (!n2) return null;
    var c = n2.map(Number);
    return c.length > 3 ? [c[0], c[1], c[2], c[3]] : [c[0], c[1], c[2], 1];
  }
  function overElkaar(voor, achter){
    if (voor[3] === undefined || voor[3] >= 1) return voor;
    var a = voor[3];
    return [voor[0]*a + achter[0]*(1-a), voor[1]*a + achter[1]*(1-a), voor[2]*a + achter[2]*(1-a), 1];
  }
  function lum(c){
    var f = c.slice(0,3).map(function(v){ v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
    return 0.2126*f[0] + 0.7152*f[1] + 0.0722*f[2];
  }
  /* Een doorzichtige achtergrond zegt niets zonder wat eronder ligt. Daarom
     lagen verzamelen tot er een ondoorzichtige is, en die dan van onder naar
     boven over elkaar leggen. Eerst deed deze functie dat niet en legde hij
     een laagje van 12 procent op wit; op een donkere pagina gaf dat
     contrastfouten die er niet waren. */
  function achtergrond(el){
    var lagen = [], e = el;
    while (e){
      var b = rgb(getComputedStyle(e).backgroundColor);
      if (b && b[3] > 0.004){ lagen.push(b); if (b[3] >= 0.999) break; }
      e = e.parentElement || (e === document.documentElement ? null : document.documentElement);
    }
    var onder = [255,255,255,1];
    for (var i = lagen.length - 1; i >= 0; i--) onder = overElkaar(lagen[i], onder);
    return onder;
  }
  function pad(el){
    var d = el.tagName.toLowerCase();
    if (el.id) return d + '#' + el.id;
    if (el.className && typeof el.className === 'string') return d + '.' + el.className.trim().split(/\\s+/).slice(0,2).join('.');
    return d;
  }
  var tekst = [], doelen = [];
  document.querySelectorAll('body *').forEach(function(el){
    if (!el.offsetParent && el.tagName !== 'BODY') return;
    var st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.opacity === '0') return;

    /* tikdoelen */
    if (/^(BUTTON|A|SUMMARY)$/.test(el.tagName) || el.getAttribute('role') === 'button'){
      var r = el.getBoundingClientRect();
      var inTekst = el.tagName === 'A' && el.parentElement &&
                    /^(P|LI|SMALL|SPAN|TD)$/.test(el.parentElement.tagName);
      if (r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44) && !inTekst){
        doelen.push({ sel: pad(el), t: (el.textContent||'').trim().slice(0,30),
                      b: Math.round(r.width), h: Math.round(r.height) });
      }
    }

    /* eigen tekst, dus geen tekst van kinderen meetellen */
    var eigen = Array.prototype.filter.call(el.childNodes, function(n){
      return n.nodeType === 3 && n.textContent.trim();
    }).map(function(n){ return n.textContent.trim(); }).join(' ');
    if (!eigen) return;

    var voor = rgb(st.color); if (!voor) return;
    var achter = achtergrond(el);
    voor = overElkaar(voor, achter);
    var L1 = lum(voor), L2 = lum(achter);
    var v = (Math.max(L1,L2) + 0.05) / (Math.min(L1,L2) + 0.05);
    var px = parseFloat(st.fontSize), vet = (parseInt(st.fontWeight,10) || 400) >= 700;
    var groot = px >= 24 || (px >= 18.66 && vet);
    var norm = groot ? 3 : 4.5;
    if (v < norm){
      tekst.push({ sel: pad(el), t: eigen.slice(0,40), v: Math.round(v*100)/100, norm: norm, px: Math.round(px*10)/10 });
    }
  });
  return JSON.stringify({ tekst: tekst, doelen: doelen });
})()`;

(async () => {
  let versie;
  try {
    versie = await (await fetch('http://127.0.0.1:9222/json/version')).json();
  } catch (e){
    console.error('Geen browser op poort 9222. Start er een met --remote-debugging-port=9222.');
    process.exit(2);
  }
  const br = await verbind(versie.webSocketDebuggerUrl);
  const { targetId } = await br.zeg('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await br.zeg('Target.attachToTarget', { targetId, flatten: true });
  await br.zeg('Emulation.setScrollbarsHidden', { hidden: true }, sessionId);
  await br.zeg('Network.enable', {}, sessionId);
  await br.zeg('Network.setCacheDisabled', { cacheDisabled: true }, sessionId);
  await br.zeg('Page.enable', {}, sessionId);
  await br.zeg('Runtime.enable', {}, sessionId);
  /* Animaties en overgangen uit: een tekst die net invliegt of een kleur die
     nog overloopt, gaf soms een fout die er een tel later niet meer was. Een
     toets die de ene keer valt en de andere keer niet, zegt niets. De stand
     van de knop (localStorage thema) wordt gezet voor de pagina hem leest. */
  let thema = '';
  await br.zeg('Page.addScriptToEvaluateOnNewDocument', { source:
    "(function(){var z=function(){var s=document.createElement('style');s.textContent='*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';(document.head||document.documentElement).appendChild(s)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',z);else z();})();" }, sessionId);
  let themaScript = null;

  const doe = async (expr, wacht) => {
    const r = await br.zeg('Runtime.evaluate', { returnByValue: true, awaitPromise: true, expression: expr }, sessionId);
    if (wacht) await new Promise(k => setTimeout(k, wacht));
    return r.exceptionDetails ? null : r.result.value;
  };
  async function laad(pagina, stand, breed){
    await br.zeg('Emulation.setDeviceMetricsOverride', { width: breed, height: breed < 700 ? 812 : 900, deviceScaleFactor: 1, mobile: breed < 700 }, sessionId);
    await br.zeg('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: stand === 'dark' ? 'dark' : 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }] }, sessionId);
    const nu = stand === 'knop' ? 'dark' : stand === 'light' ? 'light' : '';
    if (nu !== thema || !themaScript){
      if (themaScript) await br.zeg('Page.removeScriptToEvaluateOnNewDocument', { identifier: themaScript }, sessionId);
      const r = await br.zeg('Page.addScriptToEvaluateOnNewDocument', { source: nu ? "try{localStorage.setItem('thema','" + nu + "')}catch(e){}" : "try{localStorage.removeItem('thema')}catch(e){}" }, sessionId);
      themaScript = r.identifier; thema = nu;
    }
    const geladen = new Promise(k => br.opGebeurtenis(b => { if (b.method === 'Page.loadEventFired' && b.sessionId === sessionId) k(); }));
    await br.zeg('Page.navigate', { url: BASIS + '/' + pagina }, sessionId);
    await geladen;
    /* de service worker deelt anders de vorige versie uit; en wachten op de lettertypes, anders meet je de reserveletter */
    await doe("(async()=>{try{for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); for (const k of await caches.keys()) await caches.delete(k);}catch(e){} try{await document.fonts.ready}catch(e){} return 1;})()", 1200);
  }
  const meet = async () => { const v = await doe(METEN); return v ? JSON.parse(v) : { tekst: [{ sel: '-', t: 'meten mislukt', v: 0, norm: 0 }], doelen: [] }; };
  /* De toestanden na het begin: op Start drukken, en de uitleg stap voor stap openen. */
  const START = "(function(){var b=[].filter.call(document.querySelectorAll('button,a.btn,a.knop'),function(x){return x.offsetParent&&!x.disabled&&(/^(start|startbtn|begin|beginbtn|speel|spelen)$/i.test(x.id)||/^(start|begin|beginnen|speel|spelen|nieuw spel)\b/i.test((x.textContent||'').trim()))})[0];if(!b)return 0;b.click();return 1})()";
  const UITLEG = "(function(){var b=document.querySelector('.stapknop,.stappen-knop');if(!b||!b.offsetParent)return 0;b.click();return 1})()";

  const lijst = paginas();
  let totaalTekst = 0, totaalDoelen = 0, stuk = 0;
  for (const pagina of lijst){
    const fouten = [];
    const noteer = (stand, toestand, uit) => {
      (uit.tekst || []).forEach(x => fouten.push('[' + stand + (toestand ? ', ' + toestand : '') + '] ' + String(x.v).padStart(5) + ':1 (norm ' + x.norm + ')  ' + x.sel.padEnd(26) + ' ' + JSON.stringify(x.t)));
    };
    for (const stand of ['light', 'dark', 'knop']){
      await laad(pagina, stand, 1280);
      noteer(stand, '', await meet());
      /* na Start alleen de tekst: tijdens een spel mogen dingen op het speelveld klein zijn */
      if (await doe(START, 1500)) noteer(stand, 'na start', await meet());
      if (/^leermiddelen\//.test(pagina)){
        await laad(pagina, stand, 1280);
        if (await doe(UITLEG, 900)) noteer(stand, 'uitleg', await meet());
      }
    }
    /* tikdoelen, op de telefoon en op de computer */
    const doelen = new Map();
    for (const breed of [375, 1280]){
      await laad(pagina, 'dark', breed);
      ((await meet()).doelen || []).forEach(x => doelen.set(x.sel + '|' + x.t, '[tikdoel ' + breed + '] ' + x.b + '×' + x.h + '  ' + x.sel.padEnd(26) + ' ' + JSON.stringify(x.t)));
    }
    const uniek = [...new Set(fouten)];
    const t = uniek.length, d = doelen.size;
    totaalTekst += t; totaalDoelen += d;
    if (t || d) stuk++;
    if (!t && !d){ console.log('  ' + pagina.padEnd(36) + 'in orde'); continue; }
    console.log('! ' + pagina.padEnd(36) + t + ' regels onder de norm, ' + d + ' tikdoelen te klein');
    uniek.forEach(r => console.log('      ' + r));
    [...doelen.values()].forEach(r => console.log('      ' + r));
  }
  console.log('');
  console.log(lijst.length + " pagina's nagekeken, " + stuk + ' met iets mis.');
  console.log(totaalTekst + ' regels tekst onder de norm, ' + totaalDoelen + ' tikdoelen onder 44 beeldpunten.');
  await br.zeg('Target.closeTarget', { targetId });
  br.sluit();
  process.exit(totaalTekst + totaalDoelen ? 1 : 0);
})().catch(e => { console.error('FOUT', e.message); process.exit(2); });
