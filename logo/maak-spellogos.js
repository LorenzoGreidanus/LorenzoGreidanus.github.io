/* Spellogo's maken: het pictogram uit de favicon van een pagina, in een eigen blobje.
   Draai dit na het toevoegen van een nieuw spel:   node logo/maak-spellogos.js
   Het pakt elke pagina in leermiddelen/ waarvan de favicon nog de oude vorm heeft
   (een vierkant <rect width='100' height='100' rx='..' fill='#kleur'/> met een pictogram),
   zet het pictogram in een blobje in dezelfde kleur, vervangt de favicon in de pagina en
   schrijft het logo ook als logo/spel/<pagina>.svg. Pagina's die al een blobje hebben,
   blijven zoals ze zijn; je kunt het dus zo vaak draaien als je wilt.
   Elk spel krijgt een eigen blobvorm, vast uit de naam van het bestand, net als de gezichtjes. */
const fs = require('fs'), path = require('path');
const REPO = path.join(__dirname, '..') + '/', LM = REPO + 'leermiddelen/';
const BASIS = [[122, 28, 182, 24, 64, 32], [230, 118, 232, 178, 228, 62], [138, 230, 78, 232, 196, 228], [28, 142, 30, 82, 26, 202]];
function hash(s){ let h = 2166136261; for (const c of s){ h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function toeval(z){ let a = z >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const f = v => Math.round(v * 10) / 10;
function blob(naam){
  const r = toeval(hash(naam)), hoek = (r() - .5) * 0.5, c = Math.cos(hoek), s = Math.sin(hoek), dr = () => (r() - .5) * 14;
  const a = BASIS.map(([x, y, ix, iy, ox, oy]) => { const dx = dr(), dy = dr(); return [x + dx, y + dy, ix + dx, iy + dy, ox + dx, oy + dy]; });
  const p = (x, y) => { x -= 128; y -= 130; return f((x * c - y * s) * 100 / 256 * 1.02 + 50) + ' ' + f((x * s + y * c) * 100 / 256 * 1.02 + 51); };
  let d = 'M' + p(a[0][0], a[0][1]);
  for (let i = 0; i < 4; i++){ const q = a[i], b = a[(i + 1) % 4]; d += ' C' + p(q[2], q[3]) + ' ' + p(b[4], b[5]) + ' ' + p(b[0], b[1]); }
  return d + 'Z';
}
function logo(naam, kleur, picto, q){
  return '<svg xmlns=' + q + 'http://www.w3.org/2000/svg' + q + ' viewBox=' + q + '0 0 100 100' + q + '>' +
    '<path d=' + q + blob(naam) + q + ' fill=' + q + kleur + q + '/>' +
    '<g transform=' + q + 'translate(50 51) scale(.8) translate(-50 -50)' + q + '>' + picto + '</g></svg>';
}
const RE = /<link rel="icon" href="data:image\/svg\+xml,([^"]*)"/;
const OUD = /^<svg xmlns='http:\/\/www\.w3\.org\/2000\/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='\d+' fill='(#[0-9A-Fa-f]{3,6})'\/>([\s\S]*)<\/svg>$/;
fs.mkdirSync(REPO + 'logo/spel', { recursive: true });
let n = 0;
for (const bestand of fs.readdirSync(LM).filter(x => x.endsWith('.html'))){
  let html = fs.readFileSync(LM + bestand, 'utf8');
  const m = RE.exec(html); if (!m) continue;
  const t = OUD.exec(decodeURIComponent(m[1])); if (!t || /<text/.test(t[2])) continue;
  const kleur = t[1], picto = t[2];
  html = html.replace(m[0], () => '<link rel="icon" href="data:image/svg+xml,' + logo(bestand, kleur, picto, "'").replace(/#/g, '%23') + '"');
  fs.writeFileSync(LM + bestand, html);
  fs.writeFileSync(REPO + 'logo/spel/' + bestand.replace('.html', '.svg'), '<?xml version="1.0" encoding="UTF-8"?>\n' + logo(bestand, kleur, picto.replace(/'/g, '"'), '"') + '\n');
  n++; console.log('spellogo: ' + bestand);
}
console.log(n ? n + ' nieuw' : 'niets te doen: alle pagina\'s hebben al een blobje');
