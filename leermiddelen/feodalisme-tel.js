/* Feodalisme op de telefoon (rol.html laadt dit bij een kaart 'rijk').
   Twee soorten berichten van het bord:
     rijkbord   voor iedereen: de kaart, wie wat heeft, legers, de klok
     rijk       alleen voor jou: je voorraad, aanbiedingen, meldingen
   Wat je kiest gaat als actie terug: { a:'stuur', van, naar, n } enzovoort. */
window.RIJKTEL = (function(){
  'use strict';
  var B = null, D = null, KR = null, zaad = null, api = null, el = null;
  var bordOp = 0, sel = -1, modus = '', bron = -1, aantal = 0, wacht = '', wachtT = 0, laatste = '', haak = false, raf = 0;
  var R = 24;
  var SEIZ = ['lente', 'zomer', 'herfst', 'winter'];
  function schoon(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function stijl(){
    if (document.getElementById('fzStijl')) return;
    var s = document.createElement('style'); s.id = 'fzStijl';
    s.textContent = [
      '#nu.fzaan{padding:10px}',
      '.fz{display:grid;gap:10px}',
      '.fz-kop{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:16px;background:var(--rk);color:var(--rkt)}',
      '.fz-kop b{display:block;font-size:1.05rem;line-height:1.2}.fz-kop small{display:block;font-size:.78rem;opacity:.9}',
      '.fz-kop .fz-wapen{width:34px;height:34px;flex:none}',
      '.fz-klok{font-size:.8rem;font-weight:600;color:var(--muted);display:flex;justify-content:space-between;gap:8px;align-items:center}',
      '.fz-klok i{display:block;height:6px;border-radius:999px;background:var(--rand);overflow:hidden;flex:1;max-width:120px}',
      '.fz-klok i span{display:block;height:100%;background:#EA9836;border-radius:999px}',
      '.fz-cijf{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}',
      '.fz-cijf div{background:var(--kaart2);border-radius:12px;padding:6px 8px;text-align:center}',
      '.fz-cijf b{display:block;font-size:1.15rem;line-height:1.2}.fz-cijf span{font-size:.7rem;color:var(--muted)}',
      '.fz-cijf .krap b{color:var(--fout)}',
      '.fz-ab{border:2px solid #EA9836;border-radius:16px;padding:12px;background:var(--kaart)}',
      '.fz-ab h3{font-size:1rem;margin:0 0 4px}.fz-ab p{font-size:.88rem;margin:0 0 8px}.fz-ab small{color:var(--muted);font-size:.75rem}',
      '.fz-knop{display:block;width:100%;border:none;border-radius:12px;padding:10px 12px;margin-top:6px;min-height:44px;font-weight:600;background:#204ECF;color:#fff;text-align:left}',
      '.fz-knop.twee{background:var(--kaart);color:var(--ink);border:1.5px solid var(--rand2)}',
      '.fz-knop.rood{background:#F26749;color:#14224C}',
      '.fz-knop:disabled{opacity:.45}',
      '.fz-knop small{display:block;font-weight:400;font-size:.76rem;opacity:.9}',
      '.fz-meld p{font-size:.85rem;padding:7px 10px;border-radius:10px;background:var(--kaart2);margin:0 0 4px}',
      '.fz-meld p.goed{background:var(--goed-bg);color:var(--goed)}.fz-meld p.fout{background:var(--fout-bg);color:var(--fout)}',
      '.fz-meld p:not(:first-child){opacity:.7;font-size:.78rem}',
      '.fz-kaart{border-radius:14px;overflow:hidden;background:#cfe0ea;touch-action:manipulation}',
      '.fz-kaart svg{display:block;width:100%;height:auto}',
      '.fz-kaart .fzh{cursor:pointer}',
      '.fz-pan{background:var(--kaart2);border-radius:14px;padding:10px 12px}',
      '.fz-pan h3{font-size:1rem;margin:0}.fz-pan p{font-size:.84rem;margin:2px 0 0;color:var(--muted)}',
      '.fz-pan .fz-rij{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}',
      '.fz-pan .fz-rij span{font-size:.76rem;border-radius:999px;padding:2px 9px;background:var(--kaart);border:1px solid var(--rand)}',
      '.fz-stap{display:flex;align-items:center;gap:8px;margin-top:8px}',
      '.fz-stap button{width:44px;height:44px;border-radius:12px;border:none;background:var(--kaart);color:var(--ink);font-size:1.3rem;font-weight:700}',
      '.fz-stap b{min-width:54px;text-align:center;font-size:1.2rem}',
      '.fz-bron{display:grid;gap:4px;margin-top:6px}',
      '.fz-bron button{border:2px solid transparent;border-radius:10px;padding:6px 10px;text-align:left;background:var(--kaart);color:var(--ink);min-height:40px;font-size:.85rem}',
      '.fz-bron button.aan{border-color:#204ECF}',
      '.fz-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:6px}',
      '.fz-seg button{border:none;border-radius:10px;padding:8px 4px;min-height:42px;background:var(--kaart);color:var(--ink);font-size:.8rem;font-weight:600}',
      '.fz-seg button.aan{background:#204ECF;color:#fff}',
      '.fz-hulp{font-size:.85rem}.fz-hulp summary{cursor:pointer;font-weight:600;min-height:40px;display:flex;align-items:center}.fz-hulp p{margin:0 0 6px}',
      '.fz-wacht{font-size:.82rem;color:var(--muted);text-align:center}',
      '.fz-tip{font-size:.82rem;color:var(--muted)}'
    ].join('');
    document.head.appendChild(s);
  }
  function inkt(hex){
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return '#fff';
    var l = [0, 2, 4].map(function(i){ var c = parseInt(m[1].substr(i, 2), 16) / 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }).reduce(function(s, c, i){ return s + c * [.2126, .7152, .0722][i]; }, 0);
    return (1.05 / (l + .05)) > ((l + .05) / 0.0613) ? '#fff' : '#14224C';
  }
  /* ---------- wat er bekend is ---------- */
  function sp(i){ var s = B && B.sp[i]; return s ? { naam:s[0], rol:s[1], rijk:s[2], heer:s[3], kasteel:s[4] } : null; }
  function rijkKleur(r){ return B && B.ri[r] ? B.ri[r][0] : '#8a8f9e'; }
  function rijkNaam(r){ return B && B.ri[r] ? B.ri[r][1] : ''; }
  function rijkHex(h){ var e = B.e[h]; if (e < 0) return -1; var s = sp(e); return s ? s.rijk : -1; }
  function ik(){ return D ? D.i : -1; }
  function mijnRijk(){ var s = sp(ik()); return s ? s.rijk : -1; }
  function mijnLegers(){ return B ? B.l.filter(function(l){ return l[1] === ik(); }) : []; }
  function bereikbaar(h){
    var r = mijnRijk(); if (r < 0) return false;
    if (rijkHex(h) === r) return true;
    return KR.hex[h].buren.some(function(b){ return rijkHex(b) === r; });
  }
  function tijd(s){ s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function rest(){ return B ? Math.max(0, B.r - (B.p ? 0 : (performance.now() - bordOp) / 1000)) : 0; }

  /* ---------- de kaart ---------- */
  function kaartSvg(){
    var m = FEOKAART.maat(R), H = KR.hex, s = '', me = ik();
    s += '<svg viewBox="0 0 ' + m.b.toFixed(0) + ' ' + m.h.toFixed(0) + '" role="img" aria-label="De kaart: tik een gebied aan"><defs>' +
      '<pattern id="fzLeen" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2.2" height="6" fill="#fff" opacity=".45"/></pattern></defs>';
    H.forEach(function(h){
      var so = FEOKAART.SOORTEN[h.soort], c = FEOKAART.midden(h, R);
      s += '<polygon class="fzh" data-h="' + h.i + '" points="' + FEOKAART.punten(h, R, 0.6) + '" fill="' + so.kleur + '"/>';
      s += FEOKAART.teken(h.soort, c.x, c.y - 3, 0.75).replace('<path', '<path pointer-events="none"');
      var e = B.e[h.i];
      if (e >= 0){
        var r = rijkHex(h.i), kl = r >= 0 ? rijkKleur(r) : '#8a8f9e';
        s += '<polygon pointer-events="none" points="' + FEOKAART.punten(h, R, 0.6) + '" fill="' + kl + '" opacity=".5"/>';
        var w = sp(e); if (w && w.rol === 1) s += '<polygon pointer-events="none" points="' + FEOKAART.punten(h, R, 0.6) + '" fill="url(#fzLeen)"/>';
      }
    });
    /* grenzen tussen rijken */
    H.forEach(function(h){
      var r = rijkHex(h.i); if (r < 0 && B.e[h.i] < 0) return;
      h.buren.forEach(function(b){
        if (rijkHex(b) === r && (B.e[b] >= 0) === (B.e[h.i] >= 0)) return;
        var rr = FEOKAART.rand(h, H[b], R - 1.6);
        s += '<line pointer-events="none" x1="' + rr[0].toFixed(1) + '" y1="' + rr[1].toFixed(1) + '" x2="' + rr[2].toFixed(1) + '" y2="' + rr[3].toFixed(1) + '" stroke="' + (r >= 0 ? rijkKleur(r) : '#5b6480') + '" stroke-width="2.6" stroke-linecap="round"/>';
      });
    });
    /* mijn land, mijn huis */
    H.forEach(function(h){ if (B.e[h.i] === me) s += '<polygon pointer-events="none" points="' + FEOKAART.punten(h, R, 3) + '" fill="none" stroke="#14224C" stroke-width="1.4" stroke-dasharray="3 2"/>'; });
    /* geplunderd */
    B.g.forEach(function(h){ var c = FEOKAART.midden(H[h], R); s += '<path pointer-events="none" d="M' + (c.x + 9) + ' ' + (c.y - 13) + 'q3 4 0 7q-3 -3 0 -7z" fill="#a8371f" opacity=".85"/>'; });
    /* boeren: huisjes onderin */
    B.b.forEach(function(n, h){
      if (!n) return; var c = FEOKAART.midden(H[h], R);
      for (var k = 0; k < n; k++){ var x = c.x - (n - 1) * 4.5 + k * 9, y = c.y + 12; s += '<path pointer-events="none" d="M' + (x - 3.5) + ' ' + y + 'v-3.5l3.5 -3 3.5 3v3.5z" fill="#FBF6F1" stroke="#14224C" stroke-width=".9"/>'; }
    });
    /* kastelen */
    B.sp.forEach(function(p, i){
      if (p[4] < 0) return; var c = FEOKAART.midden(H[p[4]], R), kl = rijkKleur(p[2]);
      s += '<g pointer-events="none" transform="translate(' + c.x.toFixed(1) + ' ' + (c.y - 4).toFixed(1) + ') scale(1.3)"><path d="M-9 6v-10h3v3h3v-3h6v3h3v-3h3v10z" fill="#FBF6F1" stroke="#14224C" stroke-width="1.2"/><path d="M-1 -4v-8l6 2.5-6 2.5" fill="' + kl + '" stroke="#14224C" stroke-width=".8"/></g>';
    });
    /* soldaten die stilstaan: een schildje met het aantal */
    var per = {};
    B.l.forEach(function(l){ var k = l[3]; var r = sp(l[1]) ? sp(l[1]).rijk : -1; per[k] = per[k] || {}; per[k][r] = (per[k][r] || 0) + l[2]; });
    Object.keys(per).forEach(function(h){
      var c = FEOKAART.midden(H[h], R), rs = Object.keys(per[h]);
      rs.forEach(function(r, k){
        var x = c.x - 11 + k * 15, y = c.y + 2, kl = rijkKleur(+r), n = per[h][r];
        s += '<g pointer-events="none"><circle cx="' + x + '" cy="' + y + '" r="9" fill="' + kl + '" stroke="#14224C" stroke-width="1"/><text x="' + x + '" y="' + (y + 3.8) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="' + inkt(kl) + '" font-family="Poppins,Arial,sans-serif">' + n + '</text></g>';
      });
    });
    if (sel >= 0) s += '<polygon pointer-events="none" points="' + FEOKAART.punten(H[sel], R, 1.4) + '" fill="none" stroke="#14224C" stroke-width="3"/><polygon pointer-events="none" points="' + FEOKAART.punten(H[sel], R, 3.4) + '" fill="none" stroke="#fff" stroke-width="1.5"/>';
    s += '<g id="fzMars" pointer-events="none"></g></svg>';
    return s;
  }
  /* legers onderweg: elk beeld opnieuw, zonder de rest van de kaart te tekenen */
  function mars(){
    raf = 0;
    var g = el && el.querySelector('#fzMars'); if (!g || !B) return;
    var weg = (performance.now() - bordOp) / 1000, s = '', H = KR.hex;
    B.m.forEach(function(m){
      var a = FEOKAART.midden(H[m[3]], R), b = FEOKAART.midden(H[m[4]], R);
      var over = Math.max(0, m[5] - (B.p ? 0 : weg)), f = m[6] > 0 ? Math.min(1, 1 - over / m[6]) : 1;
      var x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f, s2 = sp(m[1]), kl = rijkKleur(s2 ? s2.rijk : -1);
      s += '<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '" stroke="' + kl + '" stroke-width="2" stroke-dasharray="4 3"/>' +
        '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"><path d="M0 -13v12" stroke="#14224C" stroke-width="1.4"/><path d="M0 -13h9l-2.5 3 2.5 3h-9" fill="' + kl + '" stroke="#14224C" stroke-width=".9"/>' +
        '<circle r="7" fill="#FBF6F1" stroke="' + kl + '" stroke-width="2"/><text y="3.2" text-anchor="middle" font-size="8.5" font-weight="700" fill="#14224C" font-family="Poppins,Arial,sans-serif">' + m[2] + '</text></g>';
    });
    g.innerHTML = s;
    var kl = el.querySelector('.fz-klok em'); if (kl) kl.textContent = klokTekst();
    var bal = el.querySelector('.fz-klok i span'); if (bal && B.sd) bal.style.width = (B.f === 'loopt' ? Math.min(100, 100 * (1 - rest() / B.sd)) : 0).toFixed(1) + '%';
    /* zolang deze kaart op het scherm staat: de legers schuiven, de klok loopt */
    if (api && api.actief()) raf = requestAnimationFrame(function(){ if (B.m.length) mars(); else setTimeout(mars, 400); });
  }
  function klokTekst(){
    if (!B) return '';
    if (B.f === 'kastelen') return 'De koningen kiezen een plek · nog ' + tijd(rest());
    if (B.f === 'einde') return 'Afgelopen';
    if (B.p) return 'Het spel staat stil';
    return 'Jaar ' + B.j + ' van ' + B.jt + ' · ' + SEIZ[B.s] + ' · nog ' + tijd(rest());
  }

  /* ---------- het paneel van een gebied ---------- */
  function wieHeeft(h){
    var e = B.e[h]; if (e < 0) return 'Van niemand. Wie hier een leger heen stuurt, neemt het in bezit.';
    var s = sp(e), r = rijkHex(h);
    if (s.rol === 0) return 'Land van koning ' + s.naam + (r >= 0 ? ' (' + rijkNaam(r) + ')' : '') + (s.kasteel === h ? '. Hier staat zijn kasteel.' : '.');
    if (s.rol === 1) return 'In leen bij ridder ' + s.naam + (s.heer >= 0 && sp(s.heer) ? ', vazal van koning ' + sp(s.heer).naam : ', zonder heer') + '.';
    return '';
  }
  function soldatenOp(h){ var n = 0; B.l.forEach(function(l){ if (l[3] === h) n += l[2]; }); return n; }
  function paneel(){
    if (sel < 0) return '<div class="fz-pan"><p class="fz-tip">' + (D.rol === 'koning' && B.f === 'kastelen' && D.kst < 0 ? 'Tik op de kaart een plek aan voor je kasteel, niet te dicht bij een ander kasteel.' : B.f === 'kastelen' ? 'De koningen kiezen een plek voor hun kasteel. Kijk alvast waar je heen wilt.' : D.rol === 'boer' ? 'Tik een gebied aan om te zien wie er heer is, en om er te gaan wonen.' : 'Tik een gebied aan: je eigen land, of land waar je je soldaten heen wilt sturen.') + '</p></div>';
    var h = KR.hex[sel], so = FEOKAART.SOORTEN[h.soort], me = ik(), e = B.e[sel], h2 = '';
    h2 += '<div class="fz-pan"><h3>' + schoon(h.naam) + '</h3><p>' + schoon(wieHeeft(sel)) + '</p><div class="fz-rij"><span>' + so.naam + ', oogst ' + so.oogst + '</span>' +
      (so.verdedig > 1 ? '<span>goed te verdedigen</span>' : '') + '<span>' + B.b[sel] + ' van 3 boeren</span>' + (soldatenOp(sel) ? '<span>' + soldatenOp(sel) + ' soldaten</span>' : '') +
      (B.v[sel] ? '<span>versterkt</span>' : '') + (B.g.indexOf(sel) >= 0 ? '<span>geplunderd</span>' : '') + '</div>';
    var knoppen = '';
    if (D.rol === 'koning' && B.f === 'kastelen' && D.kst < 0){
      var vrij = e < 0, ver = B.sp.every(function(p){ return p[4] < 0 || FEOKAART.afstand(KR.hex[p[4]], h) >= 3; });
      knoppen += '<button class="fz-knop rood" data-a="kasteel"' + (vrij && ver ? '' : ' disabled') + '>Bouw hier je kasteel<small>' + (!vrij ? 'Dit land is al van een ander.' : !ver ? 'Te dicht bij een ander kasteel.' : 'Je krijgt dit gebied en het land eromheen.') + '</small></button>';
    }
    if (B.f === 'loopt' && D.rol !== 'boer'){
      var s = e >= 0 ? sp(e) : null;
      if (D.rol === 'koning' && e === me && sel !== D.kst){
        if (modus === 'leen'){
          knoppen += '<p class="fz-tip" style="margin-top:8px">Aan welke ridder geef je ' + schoon(h.naam) + ' in leen?</p>' +
            ((D.rd || []).length ? D.rd.map(function(i){ var q = sp(i); return '<button class="fz-knop twee" data-a="leen" data-aan="' + i + '">' + schoon(q.naam) + '<small>' + (q.heer === me ? 'al jouw vazal' : 'nog zonder heer') + '</small></button>'; }).join('') : '<p class="fz-tip">Er is nu geen ridder vrij. Ridders die al trouw zwoeren aan een ander, kun je geen land geven.</p>') +
            '<button class="fz-knop twee" data-a="terug">Toch niet</button>';
        } else knoppen += '<button class="fz-knop" data-a="leenmodus">Geef in leen aan een ridder<small>Hij zweert trouw en levert soldaten. Jij houdt het rijk, hij beheert het land.</small></button>';
      }
      if (D.rol === 'koning' && s && s.rol === 1 && s.heer === me) knoppen += '<button class="fz-knop twee" data-a="intrek">Neem dit land terug van ' + schoon(s.naam) + '<small>Een heer mocht het leen intrekken als een vazal zijn plicht niet deed.</small></button>';
      /* soldaten sturen */
      var mijn = mijnLegers().filter(function(l){ return l[3] !== sel; });
      if (mijn.length){
        var kan = bereikbaar(sel), eigen = rijkHex(sel) === mijnRijk();
        if (modus === 'stuur' && kan){
          if (bron < 0 || !mijn.some(function(l){ return l[4] === bron; })){ var best = mijn.slice().sort(function(a, b){ return FEOKAART.afstand(KR.hex[a[3]], h) - FEOKAART.afstand(KR.hex[b[3]], h) || b[2] - a[2]; })[0]; bron = best[4]; aantal = 0; }
          var bl = mijn.filter(function(l){ return l[4] === bron; })[0];
          if (!aantal || aantal > bl[2]) aantal = eigen ? bl[2] : Math.max(1, Math.ceil(bl[2] * 0.7));
          knoppen += '<p class="fz-tip" style="margin-top:8px">Vanaf waar?</p><div class="fz-bron">' + mijn.map(function(l){
            var st = Math.max(1, FEOKAART.afstand(KR.hex[l[3]], h));
            return '<button data-a="bron" data-l="' + l[4] + '" class="' + (l[4] === bron ? 'aan' : '') + '">' + schoon(KR.hex[l[3]].naam) + ': ' + l[2] + ' soldaten <small>(' + st * 4 + ' tellen lopen)</small></button>';
          }).join('') + '</div><div class="fz-stap"><button data-a="min" aria-label="Minder">&minus;</button><b>' + aantal + '</b><button data-a="plus" aria-label="Meer">+</button><span class="fz-tip">van de ' + bl[2] + '</span></div>' +
            '<button class="fz-knop rood" data-a="stuur">' + (eigen ? 'Verplaats ' + aantal + ' soldaten hierheen' : e < 0 ? 'Neem in bezit met ' + aantal + ' soldaten' : 'Val aan met ' + aantal + ' soldaten') + '</button>' +
            '<button class="fz-knop twee" data-a="terug">Toch niet</button>';
        } else if (B.s === 3) knoppen += '<p class="fz-tip" style="margin-top:8px">In de winter voer je geen oorlog.</p>';
        else knoppen += '<button class="fz-knop' + (eigen ? ' twee' : '') + '" data-a="stuurmodus"' + (kan ? '' : ' disabled') + '>' + (eigen ? 'Stuur soldaten hierheen' : e < 0 ? 'Neem dit land in bezit' : 'Val dit land aan') +
          '<small>' + (kan ? (eigen ? 'Verplaats soldaten binnen je rijk.' : 'Je leger loopt erheen; wie de meeste soldaten heeft, wint.') : 'Te ver: alleen land dat aan je rijk grenst.') + '</small></button>';
      }
    }
    if (D.rol === 'boer'){
      if (e >= 0 && sel !== D.w){
        var vol = B.b[sel] >= 3, s3 = sp(e);
        knoppen += '<button class="fz-knop" data-a="woon"' + (vol || (B.s === 3 && B.f === 'loopt') ? ' disabled' : '') + '>' + (D.w >= 0 ? 'Verhuis hierheen' : 'Ga hier wonen') +
          '<small>' + (vol ? 'Hier wonen al drie families.' : B.s === 3 && B.f === 'loopt' ? 'In de winter trek je niet weg.' : (D.w >= 0 ? 'Je laat de helft van je voorraad achter. ' : '') + 'Je heer wordt ' + schoon(s3.naam) + '.') + '</small></button>';
      } else if (e < 0) knoppen += '<p class="fz-tip" style="margin-top:8px">Hier is geen heer. Zonder heer ben je niet beschermd: daar ga je niet wonen.</p>';
      else knoppen += '<p class="fz-tip" style="margin-top:8px">Hier woon jij.</p>';
    }
    return h2 + knoppen + '</div>';
  }
  /* ---------- de knoppen van je rol ---------- */
  function rolKnoppen(){
    var h = '', me = ik(), s = sp(me);
    if (B.f !== 'loopt' || D.rol === 'boer') return '';
    var winter = B.s === 3;
    h += '<div class="fz-pan"><h3>' + (D.rol === 'koning' ? 'Als koning' : 'Als ridder') + '</h3>';
    if (D.rol === 'koning'){
      h += '<button class="fz-knop" data-a="heervaart"' + (D.hv ? ' disabled' : '') + '>Roep je ridders op<small>' + (D.hv ? 'Dit jaar al gedaan.' : 'De heervaart: je vazallen sturen soldaten naar je kasteel, tot de winter.') + '</small></button>';
    }
    if (D.rol === 'ridder' && s){
      if (D.heer < 0){
        h += '<p class="fz-tip">Je hebt nog geen heer. Bied een koning je diensten aan' + (D.la ? ', met je land erbij' : '') + ':</p>' +
          B.sp.map(function(p, i){ return p[1] === 0 ? '<button class="fz-knop twee" data-a="dienst" data-k="' + i + '" style="border-left:6px solid ' + rijkKleur(p[2]) + '">Koning ' + schoon(p[0]) + '<small>' + schoon(rijkNaam(p[2])) + '</small></button>' : ''; }).join('');
      } else if (modus === 'over'){
        h += '<p class="fz-tip">Naar welke koning loop je over? Je neemt al je land mee.</p>' +
          B.sp.map(function(p, i){ return p[1] === 0 && i !== D.heer ? '<button class="fz-knop twee" data-a="overloop" data-k="' + i + '" style="border-left:6px solid ' + rijkKleur(p[2]) + '">Koning ' + schoon(p[0]) + '<small>' + schoon(rijkNaam(p[2])) + '</small></button>' : ''; }).join('') +
          '<button class="fz-knop twee" data-a="terug">Toch niet</button>';
      } else h += '<button class="fz-knop twee" data-a="overmodus"' + (D.ov ? ' disabled' : '') + '>Loop over naar een andere koning<small>' + (D.ov ? 'Dit jaar al gedaan.' : 'Je land moet aan zijn rijk grenzen.') + '</small></button>';
    }
    h += '<button class="fz-knop twee" data-a="huur"' + (winter || D.v < 4 ? ' disabled' : '') + '>Neem een soldaat aan<small>Kost 4 voedsel. Elke soldaat eet ook 1 in de winter.</small></button>';
    h += '<button class="fz-knop twee" data-a="herendienst"' + (D.hd ? ' disabled' : '') + '>Eis herendienst van je boeren<small>' + (D.hd ? 'Dit jaar al gedaan.' : 'Ze versterken je land, maar oogsten minder.') + '</small></button>';
    h += '<p class="fz-tip" style="margin-top:8px">Hoeveel van de oogst eis je van je boeren?</p><div class="fz-seg">' + [['laag', 'weinig, 25%'], ['gewoon', 'gewoon, 40%'], ['zwaar', 'veel, 60%']].map(function(o){
      return '<button data-a="afdracht" data-w="' + o[0] + '" class="' + (D.af === o[0] ? 'aan' : '') + '">' + o[1] + '</button>'; }).join('') + '</div>';
    return h + '</div>';
  }
  function hulp(){
    var t = D.rol === 'koning' ?
      ['Jij bent koning. Het land is van jou, maar je kunt niet overal tegelijk zijn.', 'Geef land in leen aan ridders: zij zweren trouw en komen met soldaten als je ze oproept. Boeren op je eigen land geven een deel van hun oogst.', 'In de winter eten jij en al je soldaten. Te weinig voedsel? Dan lopen soldaten weg. Wie het meeste land heeft aan het eind, heeft het machtigste rijk.'] :
      D.rol === 'ridder' ?
      ['Jij bent ridder. Zonder land heb je weinig: zoek een koning die je land in leen geeft, en zweer trouw.', 'Je land levert elke lente soldaten. Roept je koning je op, dan stuur je soldaten, of je weigert. Dan kan hij je land terugnemen.', 'Je kunt ook overlopen naar een andere koning, met je land erbij. Trouw levert punten op, land nog meer.'] :
      ['Jij bent boer. Je hebt geen eigen land. Ga wonen op het land van een heer: hij beschermt je, jij geeft een deel van je oogst.', 'In de herfst wordt er geoogst. In de winter eet je familie 3 voedsel. Twee winters honger, en je trekt weg.', 'Wordt je dorp geplunderd, dan blijft er weinig van je oogst over. Kies je heer dus goed.'];
    return '<details class="fz-hulp"><summary>Wat doe jij in dit spel?</summary>' + t.map(function(x){ return '<p>' + x + '</p>'; }).join('') + '</details>';
  }
  function cijfers(){
    if (D.rol === 'boer'){
      var heer = D.w >= 0 && B.e[D.w] >= 0 ? sp(B.e[D.w]) : null;
      return '<div class="fz-cijf"><div class="' + (D.v < 3 ? 'krap' : '') + '"><b>' + D.v + '</b><span>voedsel</span></div><div class="' + (D.hg ? 'krap' : '') + '"><b>' + (D.hg ? 'ja' : 'nee') + '</b><span>honger</span></div>' +
        '<div><b>' + (D.haf ? { laag:'25%', gewoon:'40%', zwaar:'60%' }[D.haf] : '-') + '</b><span>naar ' + (heer ? schoon(heer.naam) : 'je heer') + '</span></div></div>';
    }
    var eten = 2 + D.so;
    return '<div class="fz-cijf"><div class="' + (D.v < eten ? 'krap' : '') + '"><b>' + D.v + '</b><span>voedsel (winter: ' + eten + ')</span></div><div><b>' + D.so + '</b><span>soldaten</span></div><div><b>' + D.la + '</b><span>gebieden</span></div></div>';
  }
  function kop(){
    var me = ik(), s = sp(me), r = s ? s.rijk : -1, kl = r >= 0 ? rijkKleur(r) : '#5b6480', t = '', o = '';
    if (D.rol === 'koning'){ t = 'Koning ' + (s ? s.naam : ''); o = rijkNaam(r); }
    else if (D.rol === 'ridder'){ t = 'Ridder ' + (s ? s.naam : ''); o = D.heer >= 0 && sp(D.heer) ? 'vazal van koning ' + sp(D.heer).naam : 'zonder heer'; }
    else { t = 'Boer ' + (s ? s.naam : ''); o = D.w >= 0 ? 'woont op ' + KR.hex[D.w].naam + (B.e[D.w] >= 0 ? ', land van ' + sp(B.e[D.w]).naam : '') : 'zonder woonplaats: kies een heer'; }
    var wapen = D.rol === 'koning' ? '<path d="M4 17l-1-9 5.5 4L12 4l3.5 8L21 8l-1 9z"/><path d="M4.5 20h15"/>' : D.rol === 'ridder' ? '<path d="M12 3l8 3v6c0 5-3.7 7.9-8 9-4.3-1.1-8-4-8-9V6z"/>' : '<path d="M12 21v-8"/><path d="M12 13c0-3 2-5 5-5 0 3-2 5-5 5z"/><path d="M12 15.5c0-2.6-1.9-4.5-4.5-4.5 0 2.6 1.9 4.5 4.5 4.5z"/>';
    return '<div class="fz-kop" style="--rk:' + kl + ';--rkt:' + inkt(kl) + '"><svg class="fz-wapen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + wapen + '</svg><div><b>' + schoon(t) + '</b><small>' + schoon(o) + '</small></div></div>' +
      '<div class="fz-klok"><em style="font-style:normal">' + klokTekst() + '</em><i><span></span></i></div>';
  }
  function aanbod(){
    return (D.ab || []).map(function(a){
      return '<div class="fz-ab"><h3>' + schoon(a.kop) + '</h3><p>' + schoon(a.tekst) + '</p>' + a.o.map(function(o, k){
        return '<button class="fz-knop' + (k === a.o.length - 1 && a.o.length > 1 ? ' twee' : '') + '" data-a="antwoord" data-id="' + schoon(a.id) + '" data-k="' + schoon(o[0]) + '">' + schoon(o[1]) + '</button>';
      }).join('') + '</div>';
    }).join('');
  }
  function meldingen(){
    var l = (D.ml || []).slice(0, 2);
    return l.length ? '<div class="fz-meld" role="status">' + l.map(function(m){ return '<p class="' + (m.s === 'goed' ? 'goed' : m.s === 'fout' ? 'fout' : '') + '">' + schoon(m.t) + '</p>'; }).join('') + '</div>' : '';
  }
  function sleutel(){
    var b = B ? JSON.stringify([B.f, B.j, B.s, B.p, B.sp, B.e, B.b, B.v, B.g, B.l, B.ri, B.m.length]) : '';
    return b + '|' + JSON.stringify(D) + '|' + sel + '|' + modus + '|' + bron + '|' + aantal + '|' + wacht;
  }
  function teken(dwing){
    if (!el || !D) return;
    stijl();
    el.classList.add('fzaan');
    if (!B || !KR){ el.innerHTML = '<p class="fz-wacht">De kaart komt eraan.</p>'; return; }
    var k = sleutel();
    if (!dwing && k === laatste && el.querySelector('.fz')) return;
    laatste = k;
    var html = '<div class="fz">' + kop() + cijfers() + aanbod() + meldingen() +
      '<div class="fz-kaart">' + kaartSvg() + '</div>' + paneel() + rolKnoppen() + hulp() +
      (wacht ? '<p class="fz-wacht" role="status">' + schoon(wacht) + '</p>' : '') + '</div>';
    var open = el.querySelector('.fz-hulp') && el.querySelector('.fz-hulp').open;
    el.innerHTML = html;
    if (open){ var d2 = el.querySelector('.fz-hulp'); if (d2) d2.open = true; }
    if (!haak){ haak = true; el.addEventListener('click', klik); }
    if (!raf) mars();
  }
  function stuur(d){
    if (!api) return;
    api.stuur(d);
    wacht = 'Verstuurd naar het bord.'; wachtT = performance.now();
    if (navigator.vibrate) navigator.vibrate(25);
  }
  function klik(e){
    if (!D || !e.target.closest || !e.target.closest('.fz')) return;
    var poly = e.target.closest('.fzh');
    if (poly){ var h = +poly.getAttribute('data-h'); sel = sel === h ? -1 : h; if (modus !== 'stuur' || sel < 0) modus = ''; aantal = 0; teken(true); return; }
    var b = e.target.closest('button[data-a]'); if (!b || b.disabled) return;
    var a = b.getAttribute('data-a');
    if (a === 'leenmodus'){ modus = 'leen'; teken(true); return; }
    if (a === 'stuurmodus'){ modus = 'stuur'; bron = -1; aantal = 0; teken(true); return; }
    if (a === 'overmodus'){ modus = 'over'; teken(true); return; }
    if (a === 'terug'){ modus = ''; teken(true); return; }
    if (a === 'bron'){ bron = +b.getAttribute('data-l'); aantal = 0; teken(true); return; }
    if (a === 'min' || a === 'plus'){
      var bl = mijnLegers().filter(function(l){ return l[4] === bron; })[0]; if (!bl) return;
      aantal = Math.max(1, Math.min(bl[2], aantal + (a === 'plus' ? 1 : -1))); teken(true); return;
    }
    if (a === 'kasteel') stuur({ a:'kasteel', h:sel });
    else if (a === 'leen') stuur({ a:'leen', h:sel, aan:+b.getAttribute('data-aan') });
    else if (a === 'intrek') stuur({ a:'intrek', h:sel });
    else if (a === 'stuur'){ stuur({ a:'stuur', van:bron, naar:sel, n:aantal }); }
    else if (a === 'woon') stuur({ a:'woon', h:sel });
    else if (a === 'heervaart' || a === 'huur' || a === 'herendienst') stuur({ a:a });
    else if (a === 'afdracht') stuur({ a:'afdracht', w:b.getAttribute('data-w') });
    else if (a === 'dienst' || a === 'overloop') stuur({ a:a, k:+b.getAttribute('data-k') });
    else if (a === 'antwoord') stuur({ a:'antwoord', id:b.getAttribute('data-id'), keuze:b.getAttribute('data-k') });
    else return;
    modus = ''; bron = -1; aantal = 0;
    teken(true);
  }
  /* rol.html geeft beide soorten berichten hier door */
  function ontvang(d, a){
    api = a; el = a.el;
    if (d.soort === 'rijkbord'){
      B = d; bordOp = performance.now();
      if (!KR || zaad !== d.z){ KR = FEOKAART.maak(d.z); zaad = d.z; }
      if (sel >= KR.hex.length) sel = -1;
    } else {
      if (D && JSON.stringify(D.ml) !== JSON.stringify(d.ml)) wacht = '';
      D = d;
    }
    if (wacht && performance.now() - wachtT > 4000) wacht = '';
    if (a.actief()) teken();
  }
  return { ontvang:ontvang, teken:function(){ laatste = ''; teken(true); } };
})();
