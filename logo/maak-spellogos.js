/* Spellogo's maken: per spel een blobje in de kleur van het spel, met een lijnpictogram in crème of navy.
   Draai dit na het toevoegen of aanpassen van een spel:   node logo/maak-spellogos.js
   De pictogrammen staan in logo/spel-pictogrammen.json: per pagina de kleur en het pictogram, getekend op een
   raster van 24 zoals de lijniconen van de startpagina. De stijl legt dit script vast, niet het pictogram:
   - alleen lijnen: path, circle, rect, line, polyline of ellipse, zonder eigen stroke, fill of transform;
   - overal dezelfde lijndikte (LIJN), ronde uiteinden en hoeken;
   - de enige vlakjes zijn punten: <circle class="punt" r="1.25 tot 2.5"/>, hooguit twee;
   - binnen 3..21 blijven, rond het midden (12,12), en ongeveer 16 tot 18 groot;
   - lijnen die naast elkaar lopen minstens 4 uit elkaar, anders lopen ze op 16 pixels dicht.
   Het script zet het logo als favicon in leermiddelen/<pagina>.html en schrijft het ook naar logo/spel/<pagina>.svg.
   Je kunt het zo vaak draaien als je wilt. Elk spel houdt een eigen blobvorm, vast uit de naam van het bestand. */
const fs = require('fs'), path = require('path');
const REPO = path.join(__dirname, '..') + '/', LM = REPO + 'leermiddelen/';
const LIJN = 2.25, MAAT = 2.2;   /* lijndikte op het raster van 24, en 24 eenheden -> 52,8 van de 100 */
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
/* crème op een donkere blob, navy op een lichte: wat het meeste contrast geeft */
function lum(h){ const x = parseInt(h.slice(1), 16), c = [(x >> 16) & 255, (x >> 8) & 255, x & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
function contrast(a, b){ const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
function inkt(kleur){ return contrast(kleur, '#FBF6F1') >= contrast(kleur, '#14224C') ? '#FBF6F1' : '#14224C'; }
function logo(bestand, kleur, picto, q){
  const i = inkt(kleur);
  return '<svg xmlns=' + q + 'http://www.w3.org/2000/svg' + q + ' viewBox=' + q + '0 0 100 100' + q + '>' +
    '<path d=' + q + blob(bestand) + q + ' fill=' + q + kleur + q + '/>' +
    '<g transform=' + q + 'translate(50 51) scale(' + MAAT + ') translate(-12 -12)' + q + ' fill=' + q + 'none' + q + ' stroke=' + q + i + q +
    ' stroke-width=' + q + LIJN + q + ' stroke-linecap=' + q + 'round' + q + ' stroke-linejoin=' + q + 'round' + q + '>' +
    picto.replace(/class="punt"/g, 'fill="' + i + '" stroke="none"').replace(/"/g, q) + '</g></svg>';
}
function controleer(naam, picto){
  const fout = [];
  if (/<(text|g|image|use)\b|transform=|stroke-width=|style=/.test(picto)) fout.push('alleen lijnen, zonder eigen stijl of transform');
  if ((picto.match(/class="punt"/g) || []).length > 2) fout.push('hooguit twee punten');
  if (fout.length) throw new Error(naam + ': ' + fout.join(', '));
}
const PICTO = JSON.parse(fs.readFileSync(__dirname + '/spel-pictogrammen.json', 'utf8'));
const RE = /<link rel="icon" href="data:image\/svg\+xml,[^"]*"/;
fs.mkdirSync(REPO + 'logo/spel', { recursive: true });
let n = 0;
for (const naam of Object.keys(PICTO)){
  const { kleur, picto } = PICTO[naam], bestand = naam + '.html';
  controleer(naam, picto);
  if (!fs.existsSync(LM + bestand)){ console.log('geen pagina: ' + bestand); continue; }
  let html = fs.readFileSync(LM + bestand, 'utf8');
  const nieuw = '<link rel="icon" href="data:image/svg+xml,' + logo(bestand, kleur, picto, "'").replace(/#/g, '%23') + '"';
  if (!RE.test(html)){ console.log('geen favicon in ' + bestand); continue; }
  const oud = html;
  html = html.replace(RE, () => nieuw);
  if (html !== oud){ fs.writeFileSync(LM + bestand, html); n++; }
  fs.writeFileSync(REPO + 'logo/spel/' + naam + '.svg', '<?xml version="1.0" encoding="UTF-8"?>\n' + logo(bestand, kleur, picto, '"') + '\n');
}
/* een nieuwe pagina met nog een favicon in de oude vorm (een vierkant) hoort er ook bij */
for (const bestand of fs.readdirSync(LM).filter(x => x.endsWith('.html'))){
  const naam = bestand.replace('.html', '');
  if (PICTO[naam]) continue;
  const m = /<link rel="icon" href="data:image\/svg\+xml,([^"]*)"/.exec(fs.readFileSync(LM + bestand, 'utf8'));
  if (m && /<rect width='100' height='100'/.test(decodeURIComponent(m[1]))) console.log('nog geen spellogo: ' + naam + ' (zet kleur en pictogram in logo/spel-pictogrammen.json)');
}
console.log(n + ' favicons bijgewerkt, ' + Object.keys(PICTO).length + ' spellogo\'s');
